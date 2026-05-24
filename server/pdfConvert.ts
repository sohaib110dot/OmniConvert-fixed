import { PDFDocument } from "pdf-lib";
import archiver from "archiver";
import sharp from "sharp";
import { PassThrough } from "stream";

export type PdfImageFormat = "jpg" | "png";

export type PdfProgressCallback = (progress: number) => void | Promise<void>;

export interface PdfImageOutput {
  buffer: Buffer;
  outputExt: string;
  outputFileName: string;
  pageCount: number;
}

/** Embed a JPG or PNG image into a single-page PDF. */
export async function imageToPdf(
  imageBuffer: Buffer,
  inputFormat: PdfImageFormat
): Promise<Buffer> {
  const normalized =
    inputFormat === "jpg"
      ? await sharp(imageBuffer).rotate().jpeg({ quality: 95 }).toBuffer()
      : await sharp(imageBuffer).rotate().png().toBuffer();

  const meta = await sharp(normalized).metadata();
  const width = meta.width || 1;
  const height = meta.height || 1;

  const pdfDoc = await PDFDocument.create();
  const embedded =
    inputFormat === "jpg"
      ? await pdfDoc.embedJpg(normalized)
      : await pdfDoc.embedPng(normalized);

  const page = pdfDoc.addPage([width, height]);
  page.drawImage(embedded, { x: 0, y: 0, width, height });

  return Buffer.from(await pdfDoc.save());
}

function sanitizeBaseName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "document";
}

async function pageBufferToFormat(
  pagePng: Buffer,
  outputFormat: PdfImageFormat,
  quality: number
): Promise<Buffer> {
  if (outputFormat === "png") {
    return await sharp(pagePng).png().toBuffer();
  }
  return await sharp(pagePng).jpeg({ quality, mozjpeg: true }).toBuffer();
}

async function createZipFromBuffers(
  files: ReadonlyArray<{ name: string; buffer: Buffer }>
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver("zip", { zlib: { level: 6 } });
    const passthrough = new PassThrough();
    const chunks: Buffer[] = [];

    passthrough.on("data", (chunk: Buffer) => chunks.push(chunk));
    passthrough.on("end", () => resolve(Buffer.concat(chunks)));
    passthrough.on("error", reject);
    archive.on("error", reject);
    archive.pipe(passthrough);

    for (const file of files) {
      archive.append(file.buffer, { name: file.name });
    }

    void archive.finalize();
  });
}

/** Render all PDF pages to JPG/PNG; multi-page PDFs are returned as a ZIP. */
export async function pdfToImages(
  pdfBuffer: Buffer,
  outputFormat: PdfImageFormat,
  quality: number,
  originalBaseName: string,
  onProgress?: PdfProgressCallback
): Promise<PdfImageOutput> {
  const { pdf } = await import("pdf-to-img");
  const document = await pdf(pdfBuffer, { scale: 2 });
  const totalPages = document.length ?? 0;

  if (totalPages < 1) {
    throw new Error("conversion failed: PDF has no pages or could not be rendered.");
  }

  const safeBase = sanitizeBaseName(originalBaseName);
  const pageFiles: { name: string; buffer: Buffer }[] = [];
  let pageNum = 0;

  for await (const pagePng of document) {
    pageNum++;
    const imageBuffer = await pageBufferToFormat(pagePng, outputFormat, quality);
    pageFiles.push({
      name: `${safeBase}_page${pageNum}.${outputFormat}`,
      buffer: imageBuffer,
    });

    if (onProgress) {
      const progress = Math.min(85, Math.round(40 + (pageNum / totalPages) * 45));
      await onProgress(progress);
    }
  }

  if (pageFiles.length === 0) {
    throw new Error("conversion failed: PDF has no pages or could not be rendered.");
  }

  if (pageFiles.length === 1) {
    return {
      buffer: pageFiles[0].buffer,
      outputExt: outputFormat,
      outputFileName: pageFiles[0].name,
      pageCount: 1,
    };
  }

  const zipBuffer = await createZipFromBuffers(pageFiles);

  return {
    buffer: zipBuffer,
    outputExt: "zip",
    outputFileName: `${safeBase}_pages.zip`,
    pageCount: pageFiles.length,
  };
}

/** @deprecated Use pdfToImages — kept for compatibility. */
export async function pdfToImage(
  pdfBuffer: Buffer,
  outputFormat: PdfImageFormat,
  quality = 85
): Promise<Buffer> {
  const result = await pdfToImages(pdfBuffer, outputFormat, quality, "document");
  return result.buffer;
}

export function isPdfConverterPair(
  inputExt: string,
  targetExt: string
): boolean {
  return (
    (["jpg", "png"].includes(inputExt) && targetExt === "pdf") ||
    (inputExt === "pdf" && ["jpg", "png"].includes(targetExt))
  );
}
