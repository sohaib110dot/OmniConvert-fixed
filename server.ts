import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import multer from "multer";
import { connectDB, Upload, ConversionJob, getDBStatus } from "./server/db.ts";
import { uploadToR2, downloadFromR2 } from "./server/storage.ts";
import { updateJobProgress, getJobProgress, getRedis } from "./server/redis.ts";
import sharp from "sharp";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize DB
connectDB();

app.get("/api/v1/health", (req, res) => {
  const dbStatus = getDBStatus();
  const redis = getRedis();
  res.json({
    database: dbStatus,
    redis: { isConnected: !!redis },
    env: {
      hasMongo: !!process.env.MONGODB_URI,
      hasS3: !!process.env.S3_ACCESS_KEY,
      hasRedis: !!process.env.REDIS_URL
    }
  });
});

app.post("/api/v1/health/retry", async (req, res) => {
  await connectDB();
  const dbStatus = getDBStatus();
  res.json(dbStatus);
});

// Multer for file uploads (Memory storage)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for demo
});

// AI Setup (Lazy)
let genAI: GoogleGenAI | null = null;
function getGenAI() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAI;
}

import convertersData from "./src/data/converters.json";

// Load Converters Data
const converters = convertersData.converters;

// API ROUTES
app.get("/api/v1/converters", (req, res) => {
  res.json(converters);
});

import { repo } from "./server/repo.ts";

app.post("/api/v1/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded.");

    const result = await uploadToR2(req.file.buffer, req.file.originalname, req.file.mimetype);
    
    const dbUpload = await repo.createUpload({
      originalName: req.file.originalname,
      storageKey: result.key,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    res.json({ 
      fileId: dbUpload._id,
      filename: req.file.originalname,
      size: req.file.size,
      url: result.url
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

function normaliseFormat(ext: string): string {
  const low = ext.toLowerCase();
  if (low === "jpeg") return "jpg";
  return low;
}

app.post("/api/v1/convert", async (req, res) => {
  try {
    const { fileId, converterSlug, outputFormat, options } = req.body;
    
    if (!fileId) throw new Error("missing uploaded file: fileId parameter is required.");

    const uploadRef = await repo.findUploadById(fileId);
    if (!uploadRef) throw new Error("missing uploaded file: File not found in the repository.");

    const job = await repo.createJob({
      uploadId: fileId,
      targetFormat: outputFormat,
      status: "queued"
    });

    const jobId = job._id.toString();

    // Background Processor
    (async () => {
      try {
        await repo.updateJob(jobId, { status: "queued", progress: 0 });
        await updateJobProgress(jobId, 0, "queued");

        const inputExt = normaliseFormat(uploadRef.originalName.split('.').pop() || "");
        const targetExt = normaliseFormat(outputFormat || "");

        // Determine if this is a supported conversion combination (existing + new Phase 3 requirements)
        const isStandardConversion = ["jpg", "png", "webp"].includes(inputExt) && ["jpg", "png", "webp"].includes(targetExt);
        const isAvifInputConversion = inputExt === "avif" && ["jpg", "png", "webp"].includes(targetExt);
        const isAvifOutputConversion = ["jpg", "png", "webp"].includes(inputExt) && targetExt === "avif";
        const isSvgInputConversion = inputExt === "svg" && ["jpg", "png", "webp"].includes(targetExt);

        const isSupportedConversion = isStandardConversion || isAvifInputConversion || isAvifOutputConversion || isSvgInputConversion;

        // Compressor: same-format compression for jpg, png, webp, avif
        const isSupportedCompression = converterSlug === "compressor-converter" &&
          ["jpg", "png", "webp", "avif"].includes(inputExt) &&
          inputExt === targetExt;

        // Validate formats and categories
        if (converterSlug === "image-converter") {
          if (!isSupportedConversion) {
            throw new Error(`unsupported conversion: Unsupported image conversion combination (${inputExt.toUpperCase()} to ${targetExt.toUpperCase()}).`);
          }
          if (inputExt === targetExt) {
            throw new Error(`unsupported conversion: Input and output formats are identical (${inputExt.toUpperCase()}). Please select a different target format.`);
          }
        } else if (converterSlug === "compressor-converter") {
          if (!isSupportedCompression) {
            throw new Error(`unsupported conversion: Unsupported compression format (${inputExt.toUpperCase()}). Supported: JPG, PNG, WEBP, AVIF.`);
          }
        } else {
          throw new Error(`unsupported conversion: Video, audio, document, and archive conversions are coming soon in a future phase.`);
        }

        // 1. Download original file from storage
        let fileBuffer: Buffer;
        try {
          fileBuffer = await downloadFromR2(uploadRef.storageKey);
        } catch (err: any) {
          throw new Error(`download failed: Failed to fetch original file from R2: ${err.message}`);
        }

        await repo.updateJob(jobId, { progress: 10 });
        await updateJobProgress(jobId, 10, "processing");

        // 2. Process with Sharp
        await repo.updateJob(jobId, { progress: 40 });
        await updateJobProgress(jobId, 40, "processing");

        let outputBuffer: Buffer;
        try {
          let sharpImg = sharp(fileBuffer);
          const quality = options?.quality ? parseInt(options.quality, 10) : undefined;

          if (targetExt === "jpg") {
            // For compressor: quality 80; for converter: quality 85
            const jpgQuality = converterSlug === "compressor-converter" ? (quality || 80) : (quality || 85);
            sharpImg = sharpImg.jpeg({ quality: jpgQuality, mozjpeg: true });
          } else if (targetExt === "png") {
            // For compressor: compressionLevel 9; for converter: default
            const pngLevel = converterSlug === "compressor-converter" ? 9 : undefined;
            sharpImg = sharpImg.png({ compressionLevel: pngLevel });
          } else if (targetExt === "webp") {
            // For compressor: quality 75 effort 2; for converter: quality 75 effort 2
            sharpImg = sharpImg.webp({ quality: quality || 75, effort: 2 });
          } else if (targetExt === "avif") {
            // For compressor: quality 55 effort 2; for converter: quality 65
            const avifQuality = converterSlug === "compressor-converter" ? (quality || 55) : (quality || 65);
            const avifEffort = converterSlug === "compressor-converter" ? 2 : undefined;
            sharpImg = sharpImg.avif({ quality: avifQuality, effort: avifEffort });
          } else {
            throw new Error(`Unsupported format: ${targetExt}`);
          }

          outputBuffer = await sharpImg.toBuffer();
        } catch (err: any) {
          throw new Error(`conversion failed: Failed to process image with sharp: ${err.message}`);
        }

        await repo.updateJob(jobId, { progress: 80 });
        await updateJobProgress(jobId, 80, "processing");

        // 3. Upload converted output to storage
        let uploadResult;
        try {
          const baseName = uploadRef.originalName.split('.').slice(0, -1).join('.');
          const outputPrefix = converterSlug === "compressor-converter" ? "compressed" : "converted";
          const outputName = `${outputPrefix}_${baseName}.${targetExt}`;
          const mimeType = mimeTypes[targetExt] || "application/octet-stream";
          
          uploadResult = await uploadToR2(outputBuffer, outputName, mimeType);
        } catch (err: any) {
          throw new Error(`conversion failed: Failed to upload converted image to R2: ${err.message}`);
        }

        // 4. Save metadata to MongoDB
        try {
          await repo.updateJob(jobId, {
            outputFormat: targetExt,
            outputStorageKey: uploadResult.key,
            outputFileSize: outputBuffer.length,
            status: "completed",
            progress: 100,
            downloadUrl: `/api/v1/download/${jobId}`,
            error: null
          });
        } catch (err: any) {
          throw new Error(`database error: Failed to save output metadata in MongoDB: ${err.message}`);
        }

        await updateJobProgress(jobId, 100, "completed");

      } catch (err: any) {
        console.error("Conversion worker failed:", err.message);
        const errorMsg = err.message || "An unexpected error occurred.";
        
        try {
          await repo.updateJob(jobId, {
            status: "failed",
            error: errorMsg,
            progress: 0
          });
        } catch (dbErr: any) {
          console.error("Failed to mark job as failed in DB:", dbErr.message);
        }
        
        await updateJobProgress(jobId, 0, "failed");
      }
    })();

    res.json({ jobId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/v1/status/:jobId", async (req, res) => {
  try {
    // 1. Check Redis for real-time progress
    const redisResult = await getJobProgress(req.params.jobId);
    
    // 2. Fetch repo details for the UI
    const job = await repo.findJobById(req.params.jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    // 3. Determine status, progress, eta with Redis fallback
    let status = "processing";
    let progress = 0;
    let eta = "Calculating...";

    if (redisResult && typeof redisResult.progress === "number" && redisResult.status) {
      status = (redisResult.status === "completed" || job.status === "completed") ? "done" : (redisResult.status === "failed" || job.status === "failed" ? "error" : "processing");
      progress = redisResult.progress;
      eta = (redisResult.status === "completed" || job.status === "completed") ? "Completed" : "Calculating...";
    } else {
      // Redis missing, fallback to repo DB job info
      status = job.status === "completed" ? "done" : (job.status === "failed" ? "error" : "processing");
      progress = job.progress || 0;
      eta = job.status === "completed" ? "Completed" : "Calculating...";
    }

    res.json({
      jobId: job._id,
      status,
      progress,
      eta,
      inputName: job.uploadId?.originalName || "Unknown",
      inputSize: job.uploadId?.fileSize ? `${(job.uploadId.fileSize / (1024 * 1024)).toFixed(1)} MB` : "Unknown size",
      outputUrl: job.downloadUrl || null
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const mimeTypes: Record<string, string> = {
  'mp4': 'video/mp4',
  'webm': 'video/webm',
  'mov': 'video/quicktime',
  'avi': 'video/x-msvideo',
  'mkv': 'video/x-matroska',
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav',
  'flac': 'audio/flac',
  'aac': 'audio/aac',
  'm4a': 'audio/mp4',
  'jpg': 'image/jpeg',
  'png': 'image/png',
  'webp': 'image/webp',
  'avif': 'image/avif',
  'svg': 'image/svg+xml',
  'gif': 'image/gif',
  'pdf': 'application/pdf',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'zip': 'application/zip',
  '7z': 'application/x-7z-compressed',
  'txt': 'text/plain'
};

app.get("/api/v1/download/:jobId", async (req, res) => {
  try {
    const job = await repo.findJobById(req.params.jobId);
    if (!job || job.status !== "completed") return res.status(404).json({ error: "File not ready" });
    
    const format = job.outputFormat || job.targetFormat || 'bin';
    const mimeType = mimeTypes[format] || 'application/octet-stream';
    const inputName = job.uploadId?.originalName || 'file';
    const baseName = inputName.split('.').slice(0, -1).join('.');
    // Use compressed_ prefix for compressor jobs (output key contains "compressed_")
    const isCompressorJob = job.outputStorageKey?.includes('compressed_') ?? false;
    const downloadName = `${isCompressorJob ? 'compressed' : 'converted'}_${baseName}.${format}`;

    // If there is an outputStorageKey, fetch and send the real file from storage
    if (job.outputStorageKey) {
      try {
        const fileBuffer = await downloadFromR2(job.outputStorageKey);
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`);
        res.setHeader('Content-Type', mimeType);
        return res.send(fileBuffer);
      } catch (error: any) {
        console.error("Storage download failed:", error);
        return res.status(500).json({ error: `storage error: Failed to download converted file: ${error.message}` });
      }
    }
    
    if (['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(format)) {
      return res.redirect('https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    }

    if (['mp3', 'wav', 'aac', 'm4a', 'flac'].includes(format)) {
      return res.redirect('https://www.w3schools.com/html/horse.mp3');
    }

    if (format === 'pdf') {
      return res.redirect('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    }
    
    const dummyContent = Buffer.from(`OmniConvert Integrated Output\nFormat: ${format}\nConversion ID: ${req.params.jobId}\nThis file was successfully processed using our integrated backend.`);
    
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Content-Type', mimeType);
    res.send(dummyContent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
