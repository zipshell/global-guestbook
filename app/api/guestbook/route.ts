import { NextResponse } from "next/server";
import { getGuestbookMessages, type GuestbookDatabase } from "@/app/actions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dbParam = searchParams.get("db");
  const database: GuestbookDatabase = dbParam === "firebase" ? "firebase" : "upstash";

  const data = await getGuestbookMessages(database);
  return NextResponse.json(data);
}
