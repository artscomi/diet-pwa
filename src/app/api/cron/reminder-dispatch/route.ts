import { NextResponse } from "next/server";
import webpush from "web-push";
import { FIXED_COMPLETION_REMINDER_TIME } from "@/utils/completionReminderStorage";
import {
  REMINDER_CLIENT_SET,
  getReminderRedis,
  parseReminderStoredRecord,
  reminderDataKey,
  type ReminderStoredRecord,
} from "@/server/reminderPushRedis";
import { getClockInTimeZone } from "@/server/reminderPushTime";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const NOTIFICATION_TITLE = "🥑 PocketDiet";
const NOTIFICATION_BODY =
  "Prima di chiudere la giornata, segna i tuoi progressi di oggi! Così potrai generare un report completo ogni volta che vorrai.";

const REMINDER_HOUR = Number(FIXED_COMPLETION_REMINDER_TIME.slice(0, 2));

function configureVapid(): boolean {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "cron_unconfigured" }, { status: 503 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!configureVapid()) {
    return NextResponse.json({ ok: false, error: "vapid_unconfigured" }, { status: 503 });
  }

  const redis = getReminderRedis();
  if (!redis) {
    return NextResponse.json({ ok: false, error: "push_storage_unconfigured" }, { status: 503 });
  }

  const clientIds = (await redis.smembers(REMINDER_CLIENT_SET)) as string[];
  const now = new Date();
  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const clientId of clientIds) {
    const raw = await redis.get(reminderDataKey(clientId));
    if (!raw) {
      await redis.srem(REMINDER_CLIENT_SET, clientId);
      continue;
    }

    const record = parseReminderStoredRecord(raw);
    if (!record) {
      await redis.srem(REMINDER_CLIENT_SET, clientId);
      await redis.del(reminderDataKey(clientId));
      continue;
    }

    const clock = getClockInTimeZone(now, record.timeZone);
    if (clock.h < REMINDER_HOUR) {
      skipped += 1;
      continue;
    }

    if (record.lastFiredDateKey === clock.dateKey) {
      skipped += 1;
      continue;
    }

    const payload = JSON.stringify({
      title: NOTIFICATION_TITLE,
      body: NOTIFICATION_BODY,
      tag: `pocketdiet-push-${clock.dateKey}`,
      url: "/",
    });

    try {
      await webpush.sendNotification(record.subscription, payload, {
        TTL: 86_400,
        urgency: "normal",
      });
      record.lastFiredDateKey = clock.dateKey;
      await redis.set(reminderDataKey(clientId), JSON.stringify(record));
      sent += 1;
    } catch (error: unknown) {
      errors += 1;
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await redis.srem(REMINDER_CLIENT_SET, clientId);
        await redis.del(reminderDataKey(clientId));
      }
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, errors, checked: clientIds.length });
}
