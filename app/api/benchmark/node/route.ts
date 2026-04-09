import { NextResponse } from "next/server";
import { measureRedisRead } from "@/lib/benchmark";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await measureRedisRead("nodejs");
  return NextResponse.json(result);
}
