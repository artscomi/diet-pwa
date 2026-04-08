import { NextResponse } from "next/server";
import type { PushSubscription } from "web-push";
import { FIXED_COMPLETION_REMINDER_TIME } from "@/utils/completionReminderStorage";
import {
  REMINDER_CLIENT_SET,
  getReminderRedis,
  parseReminderStoredRecord,
  reminderDataKey,
  type ReminderStoredRecord,
} from "@/server/reminderPushRedis";

export const dynamic = "force-dynamic";

function isValidTimeZone(s: unknown): s is string {
  return typeof s === "string" && s.length >= 2 && s.length < 120;
}

function isValidClientId(s: unknown): s is string {
  return typeof s === "string" && s.length >= 8 && s.length <= 128;
}

function isPushSubscription(obj: unknown): obj is PushSubscription {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  if (typeof o.endpoint !== "string" || !o.endpoint.startsWith("https://")) return false;
  const keys = o.keys;
  if (!keys || typeof keys !== "object") return false;
  const k = keys as Record<string, unknown>;
  return typeof k.p256dh === "string" && typeof k.auth === "string";
}

export async function POST(request: Request) {
  const redis = getReminderRedis();
  if (!redis) {
    return NextResponse.json({ ok: false, error: "push_storage_unconfigured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const { clientId, subscription, timeZone } = body as Record<string, unknown>;

  if (!isValidClientId(clientId)) {
    return NextResponse.json({ ok: false, error: "invalid_client_id" }, { status: 400 });
  }
  if (!isPushSubscription(subscription)) {
    return NextResponse.json({ ok: false, error: "invalid_subscription" }, { status: 400 });
  }
  if (!isValidTimeZone(timeZone)) {
    return NextResponse.json({ ok: false, error: "invalid_timezone" }, { status: 400 });
  }

  let lastFiredDateKey: string | null = null;
  const previousRaw = await redis.get(reminderDataKey(clientId));
  if (previousRaw) {
    try {
      const previous = parseReminderStoredRecord(previousRaw);
      lastFiredDateKey = previous?.lastFiredDateKey ?? null;
    } catch {
      lastFiredDateKey = null;
    }
  }

  const record: ReminderStoredRecord = {
    subscription: subscription as PushSubscription,
    time: FIXED_COMPLETION_REMINDER_TIME,
    timeZone,
    lastFiredDateKey,
  };

  await redis.set(reminderDataKey(clientId), JSON.stringify(record));
  await redis.sadd(REMINDER_CLIENT_SET, clientId);

  return NextResponse.json({ ok: true });
}
