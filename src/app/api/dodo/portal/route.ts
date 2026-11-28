import { NextRequest, NextResponse } from "next/server";
import { CustomerPortal } from "@dodopayments/nextjs";
import { auth } from "@/auth";
import { IS_PRO_EDITION, SITE_URL } from "@/config/edition";
import { getSub } from "@/lib/entitlement";

export const dynamic = "force-dynamic";

/** Portail client Dodo : annuler, changer de carte, factures. Réservé au titulaire connecté. */
export async function GET() {
  if (!IS_PRO_EDITION) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const email = (await auth())?.user?.email;
  if (!email) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const sub = await getSub(email);
  if (!sub?.customerId) return NextResponse.json({ error: "no_customer" }, { status: 404 });

  const handler = CustomerPortal({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") || "live_mode"
  });
  return handler(new NextRequest(new URL(`/internal?customer_id=${encodeURIComponent(sub.customerId)}`, SITE_URL)));
}
