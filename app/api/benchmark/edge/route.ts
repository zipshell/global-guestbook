import { NextResponse } from "next/server";
import { measureRedisRead } from "@/lib/benchmark";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await measureRedisRead("edge");
  return NextResponse.json(result);
}
