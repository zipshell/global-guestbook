"use server";

import { revalidatePath } from "next/cache";
import {
  GUESTBOOK_MESSAGE_IDS_KEY,
  GUESTBOOK_MESSAGE_KEY_PREFIX,
  GUESTBOOK_MESSAGES_KEY,
  redis,
} from "@/lib/redis";

export type GuestbookDatabase = "upstash" | "firebase";

export type GuestbookMessage = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
  database: GuestbookDatabase;
  writeMs: number;
};

const MAX_MESSAGES = 50;
const FIREBASE_DB_URL =
  process.env.FIREBASE_DATABASE_URL ?? "https://global-guestbook-default-rtdb.firebaseio.com";

export type GuestbookReadResult = {
  messages: GuestbookMessage[];
  readMs: number;
  database: GuestbookDatabase;
};

export async function addGuestbookMessage(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const selectedDatabase = String(formData.get("database") ?? "upstash");
  const database: GuestbookDatabase = selectedDatabase === "firebase" ? "firebase" : "upstash";

  if (!name || !message) {
    return;
  }

  const payload: GuestbookMessage = {
    id: crypto.randomUUID(),
    name: name.slice(0, 40),
    message: message.slice(0, 280),
    createdAt: new Date().toISOString(),
    database,
    writeMs: 0,
  };

  if (database === "firebase") {
    const writeStart = performance.now();
    const response = await fetch(`${FIREBASE_DB_URL}/guestbook/messages/${payload.id}.json`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const writeMs = Number((performance.now() - writeStart).toFixed(2));
    if (!response.ok) {
      throw new Error("Failed to write message to Firebase");
    }
    await fetch(`${FIREBASE_DB_URL}/guestbook/messages/${payload.id}.json`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ writeMs }),
      cache: "no-store",
    });
  } else {
    const messageKey = `${GUESTBOOK_MESSAGE_KEY_PREFIX}${payload.id}`;
    const writeStart = performance.now();
    await redis.set(messageKey, JSON.stringify(payload));
    await redis.lpush(GUESTBOOK_MESSAGE_IDS_KEY, payload.id);
    await redis.ltrim(GUESTBOOK_MESSAGE_IDS_KEY, 0, MAX_MESSAGES - 1);
    const writeMs = Number((performance.now() - writeStart).toFixed(2));
    await redis.set(messageKey, JSON.stringify({ ...payload, writeMs }));
  }

  revalidatePath("/");
}

export async function getGuestbookMessages(
  database: GuestbookDatabase = "upstash",
): Promise<GuestbookReadResult> {
  if (database === "firebase") {
    const start = performance.now();
    const response = await fetch(`${FIREBASE_DB_URL}/guestbook/messages.json`, {
      cache: "no-store",
    });
    const readMs = Number((performance.now() - start).toFixed(2));

    if (!response.ok) {
      return { messages: [], readMs, database };
    }

    const entries =
      ((await response.json()) as Record<string, GuestbookMessage | null> | null) ?? {};
    const messages = Object.values(entries)
      .filter((entry): entry is GuestbookMessage => Boolean(entry))
      .map((entry) => ({
        ...entry,
        database: entry.database ?? "firebase",
        writeMs: Number(entry.writeMs ?? 0),
      }))
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, MAX_MESSAGES);

    return { messages, readMs, database };
  }

  const start = performance.now();
  const messageIds = await redis.lrange<string>(GUESTBOOK_MESSAGE_IDS_KEY, 0, MAX_MESSAGES - 1);
  const rawMessages =
    messageIds.length > 0
      ? await Promise.all(
          messageIds.map(async (id) =>
            redis.get<GuestbookMessage | string>(`${GUESTBOOK_MESSAGE_KEY_PREFIX}${id}`),
          ),
        )
      : await redis.lrange<GuestbookMessage | string>(GUESTBOOK_MESSAGES_KEY, 0, MAX_MESSAGES - 1);
  const readMs = Number((performance.now() - start).toFixed(2));

  const messages = rawMessages
    .map((entry) => {
      try {
        if (!entry) {
          return null;
        }

        if (typeof entry === "string") {
          const parsed = JSON.parse(entry) as Partial<GuestbookMessage>;
          return {
            id: String(parsed.id ?? crypto.randomUUID()),
            name: String(parsed.name ?? "Unknown"),
            message: String(parsed.message ?? ""),
            createdAt: String(parsed.createdAt ?? new Date().toISOString()),
            database: (parsed.database as GuestbookDatabase) ?? "upstash",
            writeMs: Number(parsed.writeMs ?? 0),
          };
        }

        return {
          ...entry,
          database: entry.database ?? "upstash",
          writeMs: Number(entry.writeMs ?? 0),
        };
      } catch {
        return null;
      }
    })
    .filter((entry): entry is GuestbookMessage => Boolean(entry));

  return { messages, readMs, database };
}
