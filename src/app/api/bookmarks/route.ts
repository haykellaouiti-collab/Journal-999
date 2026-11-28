import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { IS_PRO_EDITION } from "@/config/edition";
import { isProUser } from "@/lib/entitlement";
import { kv } from "@/lib/redis";

export const dynamic = "force-dynamic";

async function guard() {
  if (!IS_PRO_EDITION) return null;
  const email = (await auth())?.user?.email;
  return email && (await isProUser(email)) ? email.toLowerCase() : null;
}

export async function GET() {
  const email = await guard();
  if (!email) return NextResponse.json({ error: "pro_required" }, { status: 402 });
  return NextResponse.json({ items: (await kv.get(`bm:${email}`)) ?? [] });
}

export async function PUT(req: NextRequest) {
  const email = await guard();
  if (!email) return NextResponse.json({ error: "pro_required" }, { status: 402 });
  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.items)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  await kv.set(`bm:${email}`, body.items.slice(0, 500));
  return NextResponse.json({ ok: true });
}
