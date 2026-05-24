import { execFile } from "child_process";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { getUploadsDir } from "./cleanup.ts";

const execFileAsync = promisify(execFile);

const TEMP_SUBDIR = "temp";
const envTimeout = Number(process.env.FFMPEG_TIMEOUT_MS);
const DEFAULT_TIMEOUT_MS =
  envTimeout > 0 ? envTimeout : 5 * 60 * 1000;

const SAFE_EXT = /^[a-z0-9]+$/;

/** Phase 6 supported media conversions. */
const MEDIA_PAIRS: ReadonlyArray<{ input: string; output: string }> = [
  { input: "mp4", output: "mp3" },
  { input: "mp4", output: "webm" },
  { input: "webm", output: "mp4" },
  { input: "mov", output: "mp4" },
  { input: "mkv", output: "mp4" },
  { input: "wav", output: "mp3" },
  { input: "mp3", output: "wav" },
];

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

function buildFfmpegArgs(
  inputPath: string,
  outputPath: string,
  inputExt: string,
  outputExt: string
): string[] {
  const base = ["-y", "-hide_banner", "-loglevel", "error", "-i", inputPath];
  const key = `${inputExt}->${outputExt}`;

  switch (key) {
    case "mp4->mp3":
      return [...base, "-vn", "-acodec", "libmp3lame", "-q:a", "2", outputPath];
    case "mp4->webm":
      return [
        ...base,
        "-c:v",
        "libvpx-vp9",
        "-deadline",
        "realtime",
        "-cpu-used",
        "4",
        "-row-mt",
        "1",
        "-threads",
        "2",
        "-crf",
        "32",
        "-b:v",
        "0",
        "-c:a",
        "libopus",
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
    default:
      throw new Error(
        `unsupported conversion: Media conversion ${inputExt.toUpperCase()} to ${outputExt.toUpperCase()} is not supported.`
      );
  }
}

async function runFfmpeg(args: string[]): Promise<void> {
  try {
    await execFileAsync("ffmpeg", args, {
      timeout: DEFAULT_TIMEOUT_MS,
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (err: unknown) {
    const e = err as { killed?: boolean; message?: string; stderr?: string };
    if (e.killed) {
      throw new Error(
        "conversion failed: Video conversion timed out. Try a shorter clip, smaller file, or choose MP4 instead of WEBM."
      );
    }
    const detail = (e.stderr || e.message || "").toString().trim();
    if (/ffmpeg|not found|ENOENT/i.test(detail)) {
      throw new Error(
        "conversion failed: FFmpeg is not available on the server."
      );
    }
    throw new Error(
      `conversion failed: FFmpeg could not convert this file.${detail ? ` ${detail.slice(0, 200)}` : ""}`
    );
  }
}

/** Convert audio/video using FFmpeg; temp files live under uploads/temp/. */
export async function convertMedia(
  inputBuffer: Buffer,
  inputExt: string,
  outputExt: string
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
    const args = buildFfmpegArgs(inputPath, outputPath, inputExt, outputExt);
    await runFfmpeg(args);

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
