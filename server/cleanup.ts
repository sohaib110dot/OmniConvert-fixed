import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const TEMP_DIR = path.join(UPLOADS_DIR, "temp");

export function getUploadsDir(): string {
  return UPLOADS_DIR;
}

/** Remove stale FFmpeg temp job directories. */
async function cleanupOldTempDirs(maxAgeMs: number, now: number): Promise<number> {
  if (!fs.existsSync(TEMP_DIR)) return 0;

  let removed = 0;
  const entries = await fs.promises.readdir(TEMP_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dirPath = path.join(TEMP_DIR, entry.name);
    try {
      const stat = await fs.promises.stat(dirPath);
      if (now - stat.mtimeMs > maxAgeMs) {
        await fs.promises.rm(dirPath, { recursive: true, force: true });
        removed++;
      }
    } catch {
      /* ignore */
    }
  }

  return removed;
}

/** Remove local fallback files older than UPLOAD_CLEANUP_HOURS (default 24). */
export async function cleanupOldUploads(): Promise<{ deleted: number; errors: number }> {
  const hours = Number(process.env.UPLOAD_CLEANUP_HOURS) || 24;
  const maxAgeMs = hours * 60 * 60 * 1000;
  const now = Date.now();

  if (!fs.existsSync(UPLOADS_DIR)) {
    return { deleted: 0, errors: 0 };
  }

  let deleted = 0;
  let errors = 0;

  const entries = await fs.promises.readdir(UPLOADS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const filePath = path.join(UPLOADS_DIR, entry.name);
    try {
      const stat = await fs.promises.stat(filePath);
      if (now - stat.mtimeMs > maxAgeMs) {
        await fs.promises.unlink(filePath);
        deleted++;
      }
    } catch {
      errors++;
    }
  }

  const tempRemoved = await cleanupOldTempDirs(maxAgeMs, now);

  if (deleted > 0 || tempRemoved > 0) {
    console.log(
      `[Cleanup] Removed ${deleted} file(s) and ${tempRemoved} temp dir(s) older than ${hours}h`
    );
  }

  return { deleted: deleted + tempRemoved, errors };
}

/** Run cleanup on start and every hour. */
export function startCleanupScheduler(intervalMs = 60 * 60 * 1000): void {
  const run = () => {
    cleanupOldUploads().catch((err) => {
      console.error("[Cleanup] Scheduled run failed:", err.message);
    });
  };

  run();
  setInterval(run, intervalMs);
}
