import { NextResponse } from "next/server";
import { REMINDER_CLIENT_SET, getReminderRedis, reminderDataKey } from "@/server/reminderPushRedis";

export const dynamic = "force-dynamic";

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

  const clientId =
    body && typeof body === "object" && typeof (body as { clientId?: unknown }).clientId === "string"
      ? (body as { clientId: string }).clientId
      : "";

  if (clientId.length < 8 || clientId.length > 128) {
    return NextResponse.json({ ok: false, error: "invalid_client_id" }, { status: 400 });
  }

  await redis.del(reminderDataKey(clientId));
  await redis.srem(REMINDER_CLIENT_SET, clientId);

  return NextResponse.json({ ok: true });
}
