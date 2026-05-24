import { spawn, execFile } from "child_process";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { getUploadsDir } from "./cleanup.ts";

const execFileAsync = promisify(execFile);

const TEMP_SUBDIR = "temp";
const envTimeout = Number(process.env.FFMPEG_TIMEOUT_MS);
/** Default 15 min for long VPS encodes; override with FFMPEG_TIMEOUT_MS. */
const DEFAULT_TIMEOUT_MS = envTimeout > 0 ? envTimeout : 900000;

const SAFE_EXT = /^[a-z0-9]+$/;
const PROGRESS_THROTTLE_MS = 1500;

/** Phase 6 supported media conversions. */
const MEDIA_PAIRS: ReadonlyArray<{ input: string; output: string }> = [
  { input: "mp4", output: "mp3" },
  { input: "mp4", output: "webm" },
  { input: "webm", output: "mp4" },
  { input: "mov", output: "mp4" },
  { input: "mkv", output: "mp4" },
  { input: "wav", output: "mp3" },
  { input: "mp3", output: "wav" },
  { input: "gif", output: "gif" },
  { input: "gif", output: "mp4" },
];

export type MediaProgressCallback = (progress: number) => void | Promise<void>;

export function isMediaConverterSlug(slug: string): boolean {
  return slug === "video-converter" || slug === "audio-converter";
}

export function isMediaConversion(inputExt: string, outputExt: string): boolean {
  return MEDIA_PAIRS.some((p) => p.input === inputExt && p.output === outputExt);
}

function getTempRoot(): string {
  return path.join(getUploadsDir(), TEMP_SUBDIR);
}

function assertSafeExt(ext: string, label: string): void {
  if (!SAFE_EXT.test(ext)) {
    throw new Error(`Invalid ${label} format.`);
  }
}

/** Progress + stats flags required for spawn stdout parsing. */
const FFMPEG_PROGRESS_FLAGS = ["-progress", "pipe:1", "-nostats"] as const;

function buildFfmpegArgs(
  inputPath: string,
  outputPath: string,
  inputExt: string,
  outputExt: string
): string[] {
  const base = [
    "-y",
    "-hide_banner",
    ...FFMPEG_PROGRESS_FLAGS,
    "-loglevel",
    "error",
    "-i",
    inputPath,
  ];
  const key = `${inputExt}->${outputExt}`;

  switch (key) {
    case "mp4->mp3":
      return [...base, "-vn", "-acodec", "libmp3lame", "-q:a", "2", outputPath];
    // WebM uses VP8 fast mode by default because VP9 is too slow on small VPS CPUs.
    case "mp4->webm":
      return [
        ...base,
        "-vf",
        "scale='min(1280,iw)':-2",
        "-c:v",
        "libvpx",
        "-deadline",
        "realtime",
        "-cpu-used",
        "8",
        "-b:v",
        "1M",
        "-maxrate",
        "1.5M",
        "-bufsize",
        "2M",
        "-c:a",
        "libopus",
        "-b:a",
        "96k",
        outputPath,
      ];
    case "webm->mp4":
    case "mov->mp4":
    case "mkv->mp4":
      return [
        ...base,
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "23",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        outputPath,
      ];
    case "wav->mp3":
      return [...base, "-acodec", "libmp3lame", "-q:a", "2", outputPath];
    case "mp3->wav":
      return [...base, "-acodec", "pcm_s16le", outputPath];
    case "gif->gif":
      return [
        ...base,
        "-vf",
        "fps=10,scale=iw:-1",
        "-loop",
        "0",
        outputPath,
      ];
    case "gif->mp4":
      return [
        ...base,
        "-movflags",
        "faststart",
        "-pix_fmt",
        "yuv420p",
        "-vf",
        "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        outputPath,
      ];
    default:
      throw new Error(
        `unsupported conversion: Media conversion ${inputExt.toUpperCase()} to ${outputExt.toUpperCase()} is not supported.`
      );
  }
}

async function getMediaDuration(inputPath: string): Promise<number> {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      inputPath,
    ]);
    const duration = parseFloat(String(stdout).trim());
    return Number.isFinite(duration) && duration > 0 ? duration : 0;
  } catch {
    return 0;
  }
}

function parseOutTimeSeconds(line: string): number | null {
  const msMatch = line.match(/out_time_ms=(\d+)/);
  if (msMatch) {
    return Number(msMatch[1]) / 1_000_000;
  }

  const timeMatch = line.match(/out_time=(\d{2}):(\d{2}):(\d{2})\.(\d+)/);
  if (timeMatch) {
    const h = Number(timeMatch[1]);
    const m = Number(timeMatch[2]);
    const s = Number(timeMatch[3]);
    const frac = Number(`0.${timeMatch[4]}`);
    return h * 3600 + m * 60 + s + frac;
  }

  return null;
}

function mapEncodeProgress(currentSec: number, totalDuration: number): number {
  if (totalDuration <= 0) return 40;
  const raw = Math.min(1, Math.max(0, currentSec / totalDuration));
  return Math.min(85, Math.max(40, Math.round(40 + raw * 45)));
}

function runFfmpeg(
  args: string[],
  totalDuration: number,
  onProgress?: MediaProgressCallback
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    let stderr = "";
    let stdoutBuf = "";
    let lastProgressAt = 0;
    let timedOut = false;

    const timeoutId = setTimeout(() => {
      timedOut = true;
      proc.kill("SIGKILL");
    }, DEFAULT_TIMEOUT_MS);

    const flushProgress = async (currentSec: number) => {
      if (!onProgress || totalDuration <= 0) return;
      const now = Date.now();
      if (now - lastProgressAt < PROGRESS_THROTTLE_MS) return;
      lastProgressAt = now;
      const mapped = mapEncodeProgress(currentSec, totalDuration);
      try {
        await onProgress(mapped);
      } catch (err) {
        console.error("[FFmpeg] Progress callback error:", err);
      }
    };

    proc.stdout?.on("data", (chunk: Buffer) => {
      stdoutBuf += chunk.toString();
      const lines = stdoutBuf.split("\n");
      stdoutBuf = lines.pop() || "";

      for (const line of lines) {
        const currentSec = parseOutTimeSeconds(line);
        if (currentSec !== null) {
          void flushProgress(currentSec);
        }
      }
    });

    proc.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
      if (stderr.length > 32_000) {
        stderr = stderr.slice(-32_000);
      }
    });

    proc.on("error", (err) => {
      clearTimeout(timeoutId);
      console.error("[FFmpeg] Spawn error:", err.message);
      reject(
        new Error(
          "conversion failed: FFmpeg is not available on the server."
        )
      );
    });

    proc.on("close", (code) => {
      clearTimeout(timeoutId);

      if (timedOut) {
        reject(
          new Error(
            "conversion failed: Conversion timed out. Try a shorter clip, smaller file, or choose MP4 instead of WEBM."
          )
        );
        return;
      }

      if (code === 0) {
        resolve();
        return;
      }

      const detail = stderr.trim().slice(0, 200);
      reject(
        new Error(
          `conversion failed: FFmpeg could not convert this file.${detail ? ` ${detail}` : ""}`
        )
      );
    });
  });
}

/** Convert audio/video using FFmpeg (spawn + progress); temp files under uploads/temp/. */
export async function convertMedia(
  inputBuffer: Buffer,
  inputExt: string,
  outputExt: string,
  onProgress?: MediaProgressCallback
): Promise<Buffer> {
  assertSafeExt(inputExt, "input");
  assertSafeExt(outputExt, "output");

  if (!isMediaConversion(inputExt, outputExt)) {
    throw new Error(
      `unsupported conversion: ${inputExt.toUpperCase()} to ${outputExt.toUpperCase()} is not supported.`
    );
  }

  const tempRoot = getTempRoot();
  await fs.promises.mkdir(tempRoot, { recursive: true });

  const jobDir = path.join(tempRoot, randomUUID());
  await fs.promises.mkdir(jobDir, { recursive: true });

  const inputPath = path.join(jobDir, `input.${inputExt}`);
  const outputPath = path.join(jobDir, `output.${outputExt}`);

  try {
    await fs.promises.writeFile(inputPath, inputBuffer);
    const totalDuration = await getMediaDuration(inputPath);
    const args = buildFfmpegArgs(inputPath, outputPath, inputExt, outputExt);
    await runFfmpeg(args, totalDuration, onProgress);

    if (!fs.existsSync(outputPath)) {
      throw new Error("conversion failed: FFmpeg did not produce an output file.");
    }

    const stat = await fs.promises.stat(outputPath);
    if (stat.size === 0) {
      throw new Error("conversion failed: Output file is empty.");
    }

    return await fs.promises.readFile(outputPath);
  } finally {
    await fs.promises.rm(jobDir, { recursive: true, force: true }).catch(() => {});
  }
}
