import { NextResponse } from "next/server";
import { BENCHMARK_KEY, redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const payload = {
    message: "hello-from-upstash",
    createdAt: new Date().toISOString(),
  };

  await redis.set(BENCHMARK_KEY, JSON.stringify(payload));

  return NextResponse.json({
    ok: true,
    key: BENCHMARK_KEY,
    payload,
  });
}
