import type { Express, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";

export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

/** Extensions allowed for upload (working converters only). */
export const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "svg",
  "pdf",
]);

const MIME_BY_EXT: Record<string, string[]> = {
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  webp: ["image/webp"],
  avif: ["image/avif"],
  svg: ["image/svg+xml", "image/svg"],
  pdf: ["application/pdf"],
};

export function normaliseExtension(filename: string): string {
  const ext = (filename.split(".").pop() || "").toLowerCase();
  return ext === "jpeg" ? "jpg" : ext;
}

export function sanitizeFilename(name: string): string {
  const base = path.basename(name || "upload");
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
  return cleaned || "upload";
}

export function validateUploadFile(file: Express.Multer.File): void {
  if (!file) {
    throw new Error("No file uploaded.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File exceeds the 100MB upload limit.");
  }

  const ext = normaliseExtension(file.originalname);
  if (!ALLOWED_EXTENSIONS.has(ext) && !ALLOWED_EXTENSIONS.has(file.originalname.split(".").pop()?.toLowerCase() || "")) {
    throw new Error(
      "Unsupported file type. Allowed: JPG, PNG, WEBP, AVIF, SVG, PDF."
    );
  }

  const allowedMimes = MIME_BY_EXT[ext] || MIME_BY_EXT[file.originalname.split(".").pop()?.toLowerCase() || ""];
  if (allowedMimes?.length && file.mimetype && !allowedMimes.includes(file.mimetype)) {
    throw new Error(`File content does not match the .${ext} extension.`);
  }
}

export function setupSecurity(app: Express): void {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
  });

  const heavyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Upload or conversion limit reached. Please try again later." },
  });

  app.use("/api/", apiLimiter);
  app.use("/api/v1/upload", heavyLimiter);
  app.use("/api/v1/convert", heavyLimiter);
}

export function safeErrorMessage(
  err: unknown,
  fallback = "An unexpected error occurred."
): string {
  if (!err || typeof err !== "object" || !("message" in err)) {
    return fallback;
  }
  const msg = String((err as Error).message);
  if (
    /ENOENT|EACCES|EPERM|mongoose|MongoServer|stack|internal/i.test(msg)
  ) {
    return fallback;
  }
  return msg.slice(0, 500);
}

export function apiErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("API error:", err);
  const status = res.statusCode >= 400 ? res.statusCode : 500;
  res.status(status).json({ error: safeErrorMessage(err) });
}
