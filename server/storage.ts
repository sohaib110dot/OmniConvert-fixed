import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

let s3Client: S3Client | null = null;
let isLocalFallbackActive = false;
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure local uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export function getS3Client() {
  if (!s3Client) {
    const accessKey = process.env.S3_ACCESS_KEY;
    const secretKey = process.env.S3_SECRET_KEY;
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION || "auto";

    if (!accessKey || !secretKey || !endpoint) {
      console.warn("[Storage] S3 credentials or endpoint missing. Using LOCAL fallback storage.");
      isLocalFallbackActive = true;
      return null;
    }

    s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
  }
  return s3Client;
}

function isCredentialOrNetworkError(err: any): boolean {
  const code = err.code || err.name || "";
  const msg = err.message || "";
  return (
    code === "AccessDenied" ||
    code === "InvalidAccessKeyId" ||
    code === "SignatureDoesNotMatch" ||
    code === "InvalidAccessKey" ||
    code === "AuthFailure" ||
    code === "ENOTFOUND" ||
    code === "EAI_AGAIN" ||
    msg.includes("AccessKeyId") ||
    msg.includes("AccessDenied") ||
    msg.includes("SignatureDoesNotMatch") ||
    msg.includes("endpoint") ||
    msg.includes("ENOTFOUND")
  );
}

async function saveLocally(buffer: Buffer, key: string) {
  const localPath = path.join(UPLOADS_DIR, key);
  await fs.promises.writeFile(localPath, buffer);
  console.log(`[Storage Fallback] Saved file locally: ${key}`);
  return {
    key,
    bucket: "local-fallback",
    url: `/uploads/${key}`,
  };
}

async function readLocally(key: string): Promise<Buffer> {
  const localPath = path.join(UPLOADS_DIR, key);
  if (!fs.existsSync(localPath)) {
    throw new Error(`File not found in local fallback storage: ${key}`);
  }
  console.log(`[Storage Fallback] Read file locally: ${key}`);
  return await fs.promises.readFile(localPath);
}

export async function uploadToR2(buffer: Buffer, originalName: string, mimeType: string) {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const extension = (safeName.split(".").pop() || "bin").toLowerCase();
  const key = `${uuidv4()}.${extension}`;

  if (isLocalFallbackActive) {
    return await saveLocally(buffer, key);
  }

  const client = getS3Client();
  if (!client) {
    isLocalFallbackActive = true;
    return await saveLocally(buffer, key);
  }

  const bucket = process.env.S3_BUCKET || "omni-convert-uploads";
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );

    return {
      key,
      bucket,
      url: `${process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT}/${bucket}/${key}`,
    };
  } catch (err: any) {
    if (isCredentialOrNetworkError(err)) {
      console.warn(`[Storage] Cloud storage failed (${err.name || err.message}). Switching to local fallback storage.`);
      isLocalFallbackActive = true;
      return await saveLocally(buffer, key);
    }
    throw err;
  }
}

export async function downloadFromR2(key: string): Promise<Buffer> {
  if (isLocalFallbackActive) {
    return await readLocally(key);
  }

  const client = getS3Client();
  if (!client) {
    isLocalFallbackActive = true;
    return await readLocally(key);
  }

  const bucket = process.env.S3_BUCKET || "omni-convert-uploads";
  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    const stream = response.Body;
    if (!stream) {
      throw new Error("Empty response body from S3/R2.");
    }

    if (typeof (stream as any).transformToByteArray === "function") {
      const bytes = await (stream as any).transformToByteArray();
      return Buffer.from(bytes);
    }

    // Fallback for older streams or environment issues
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream as any) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (err: any) {
    if (isCredentialOrNetworkError(err) || err.code === "NoSuchKey") {
      if (isCredentialOrNetworkError(err)) {
        console.warn(`[Storage] Cloud storage download failed (${err.name || err.message}). Switching to local fallback storage.`);
        isLocalFallbackActive = true;
      }
      return await readLocally(key);
    }
    throw err;
  }
}
