import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { IS_PRO_EDITION } from "@/config/edition";
import { isProUser } from "@/lib/entitlement";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!IS_PRO_EDITION) return NextResponse.json({ edition: "standard", user: null, pro: false });
  const session = await auth();
  const email = session?.user?.email ?? null;
  return NextResponse.json({
    edition: "pro",
    user: session?.user ? { name: session.user.name, email, image: session.user.image } : null,
    pro: email ? await isProUser(email) : false
  }, { headers: { "Cache-Control": "private, no-store" } });
}
