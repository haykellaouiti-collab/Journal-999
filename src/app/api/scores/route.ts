import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { IS_PRO_EDITION } from "@/config/edition";
import { isProUser } from "@/lib/entitlement";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!IS_PRO_EDITION) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const email = (await auth())?.user?.email;
  if (!email || !(await isProUser(email))) return NextResponse.json({ error: "pro_required" }, { status: 402 });
  const key = process.env.FOOTBALL_API_KEY;
  if (!key) return NextResponse.json({ live: [], configured: false });
  try {
    const r = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
      headers: { "x-apisports-key": key },
      next: { revalidate: 60 }
    });
    const d = await r.json();
    const live = (d.response || []).slice(0, 14).map((m: any) => ({
      league: m.league?.name, home: m.teams?.home?.name, away: m.teams?.away?.name,
      score: `${m.goals?.home ?? 0} - ${m.goals?.away ?? 0}`, minute: m.fixture?.status?.elapsed ?? 0
    }));
    return NextResponse.json({ live, configured: true });
  } catch {
    return NextResponse.json({ live: [], configured: true });
  }
}
