import mongoose from "mongoose";

let isConnected = false;
let connectionError: string | null = null;
let retryTimeout: NodeJS.Timeout | null = null;

export async function connectDB() {
  if (isConnected) return;
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    connectionError = "MONGODB_URI environment variable is missing.";
    console.warn(connectionError);
    return;
  }

  // Clear any existing retry timeout
  if (retryTimeout) {
    clearTimeout(retryTimeout);
    retryTimeout = null;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, 
    });
    isConnected = true;
    connectionError = null;
    console.log("Connected to MongoDB.");
  } catch (error: any) {
    connectionError = error.message;
    console.error("MongoDB connection error:", error);
    
    // Retry every 30 seconds if connection fails
    retryTimeout = setTimeout(() => {
      console.log("Retrying MongoDB connection...");
      connectDB();
    }, 30000);
  }
}

export function getDBStatus() {
  return { isConnected, error: connectionError };
}

const UploadSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  storageKey: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const ConversionJobSchema = new mongoose.Schema({
  uploadId: { type: mongoose.Schema.Types.ObjectId, ref: "Upload", required: true },
  targetFormat: { type: String, required: true },
  converterSlug: { type: String },
  status: { type: String, enum: ["queued", "processing", "completed", "failed"], default: "queued" },
  progress: { type: Number, default: 0 },
  downloadUrl: { type: String },
  outputFormat: { type: String },
  outputStorageKey: { type: String },
  outputFileSize: { type: Number },
  error: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Upload = mongoose.models.Upload || mongoose.model("Upload", UploadSchema);
export const ConversionJob = mongoose.models.ConversionJob || mongoose.model("ConversionJob", ConversionJobSchema);
