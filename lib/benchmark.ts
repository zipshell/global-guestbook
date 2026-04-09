import { BENCHMARK_KEY, redis } from "@/lib/redis";

export async function measureRedisRead(runtime: "nodejs" | "edge") {
  const start = performance.now();
  const value = await redis.get<string>(BENCHMARK_KEY);
  const redisReadMs = Number((performance.now() - start).toFixed(2));

  return {
    runtime,
    redisReadMs,
    value,
    timestamp: new Date().toISOString(),
    region: process.env.VERCEL_REGION ?? "local-dev",
  };
}
