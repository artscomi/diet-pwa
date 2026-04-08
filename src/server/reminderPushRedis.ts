import { Redis } from "@upstash/redis";

export const REMINDER_CLIENT_SET = "pocketdiet:reminder:clientIds";
export const reminderDataKey = (clientId: string) =>
  `pocketdiet:reminder:data:${clientId}`;

export type ReminderStoredRecord = {
  subscription: import("web-push").PushSubscription;
  time: string;
  timeZone: string;
  lastFiredDateKey: string | null;
};

export function parseReminderStoredRecord(raw: unknown): ReminderStoredRecord | null {
  if (!raw) return null;

  const parsed =
    typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;

  if (!parsed || typeof parsed !== "object") return null;
  const record = parsed as Record<string, unknown>;

  if (typeof record.time !== "string" || typeof record.timeZone !== "string") {
    return null;
  }

  if (
    record.lastFiredDateKey !== null &&
    typeof record.lastFiredDateKey !== "string"
  ) {
    return null;
  }

  const subscription = record.subscription;
  if (!subscription || typeof subscription !== "object") return null;
  const sub = subscription as Record<string, unknown>;
  const keys =
    sub.keys && typeof sub.keys === "object"
      ? (sub.keys as Record<string, unknown>)
      : null;

  if (
    typeof sub.endpoint !== "string" ||
    !keys ||
    typeof keys.p256dh !== "string" ||
    typeof keys.auth !== "string"
  ) {
    return null;
  }

  return {
    subscription: record.subscription as import("web-push").PushSubscription,
    time: record.time,
    timeZone: record.timeZone,
    lastFiredDateKey: record.lastFiredDateKey as string | null,
  };
}

export function getReminderRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}
