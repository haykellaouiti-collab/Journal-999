import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { IS_PRO_EDITION } from "@/config/edition";
import { isProUser } from "@/lib/entitlement";
import { kv } from "@/lib/redis";

export const dynamic = "force-dynamic";
const NAMES: Record<string, string> = { fr: "français", en: "English", ar: "العربية", es: "español" };
const DAILY_LIMIT = 60;

export async function POST(req: NextRequest) {
  if (!IS_PRO_EDITION) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const email = (await auth())?.user?.email;
  if (!email || !(await isProUser(email))) return NextResponse.json({ error: "pro_required" }, { status: 402 });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "ai_not_configured" }, { status: 503 });

  const { title, summary, lang } = await req.json().catch(() => ({}));
  if (!title) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const rk = `ai:${email.toLowerCase()}:${new Date().toISOString().slice(0, 10)}`;
  const n = await kv.incr(rk);
  if (n === 1) await kv.expire(rk, 90000);
  if (n > DAILY_LIMIT) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const target = NAMES[lang] || NAMES.fr;
  const prompt = `You are a neutral news editor. Using ONLY the headline and excerpt below, write 3 short factual bullet points in ${target}. Do not invent facts that are not in the text. If the excerpt is too thin, say so in one bullet. Output plain text bullets starting with "• ".\n\nHeadline: ${String(title).slice(0, 300)}\nExcerpt: ${String(summary || "").slice(0, 800)}`;

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 400 } })
  });
  if (!r.ok) return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  const data = await r.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join("") || "";
  return NextResponse.json({ text: text.trim() });
}
