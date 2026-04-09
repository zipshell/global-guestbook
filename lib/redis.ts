import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export const GUESTBOOK_MESSAGES_KEY = "guestbook:messages";
export const GUESTBOOK_MESSAGE_IDS_KEY = "guestbook:message_ids";
export const GUESTBOOK_MESSAGE_KEY_PREFIX = "guestbook:message:";
export const BENCHMARK_KEY = "benchmark:ping";
