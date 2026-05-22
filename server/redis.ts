import Redis from "ioredis";

// In-memory fallback Map for job progress/status
const fallbackJobStatus = new Map<string, {progress: number; status: string}>();

let redis: Redis | null = null;

export function getRedis() {
  if (!redis) {
    const url = process.env.REDIS_URL;
    if (!url) {
      console.warn("REDIS_URL not found. Real-time features might be limited.");
      return null;
    }
    
    try {
      redis = new Redis(url);
      redis.on("error", (err) => {
        console.error("Redis error detected, switching to fallback:", err.message);
        redis = null;
      });
      console.log("Connected to Redis.");
    } catch (error) {
      console.error("Redis connection error:", error);
    }
  }
  return redis;
}

export async function updateJobProgress(jobId: string, progress: number, status: string) {
  const r = getRedis();
  if (!r) {
    // Fallback: store in memory Map
    fallbackJobStatus.set(jobId, { progress, status });
    return;
  }

  try {
    await r.set(`job:${jobId}:progress`, progress, "EX", 3600); // 1 hour expiry
    await r.set(`job:${jobId}:status`, status, "EX", 3600);
  } catch(err) {
    console.error("Failed to update Redis, falling back to memory:", err.message);
    fallbackJobStatus.set(jobId, { progress, status });
  }
}

export async function getJobProgress(jobId: string) {
  const r = getRedis();
  if (!r) {
    // Fallback: read from memory Map
    return fallbackJobStatus.get(jobId) || null;
  }

  try {
    const progress = await r.get(`job:${jobId}:progress`);
    const status = await r.get(`job:${jobId}:status`);

    return {
      progress: progress ? parseInt(progress) : 0,
      status: status || "queued",
    };
  } catch(err) {
    console.error("Failed to get Redis job progress, falling back to memory:", err.message);
    return fallbackJobStatus.get(jobId) || null;
  }
}

