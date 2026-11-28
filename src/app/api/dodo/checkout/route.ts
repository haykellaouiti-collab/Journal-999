import { NextRequest, NextResponse } from "next/server";
import { Checkout } from "@dodopayments/nextjs";
import { auth } from "@/auth";
import { IS_PRO_EDITION, SITE_URL } from "@/config/edition";

export const dynamic = "force-dynamic";

/**
 * Crée une session de paiement Dodo pour l'utilisateur CONNECTÉ (l'e-mail vient de la session,
 * jamais du navigateur) puis renvoie { checkout_url }.
 */
export async function POST(req: NextRequest) {
  if (!IS_PRO_EDITION) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "login_required" }, { status: 401 });

  const { plan, locale } = await req.json().catch(() => ({ plan: "monthly", locale: "fr" }));
  const productId = plan === "yearly" ? process.env.DODO_PRODUCT_YEARLY : process.env.DODO_PRODUCT_MONTHLY;
  if (!productId || !process.env.DODO_PAYMENTS_API_KEY) {
    return NextResponse.json({ error: "billing_not_configured" }, { status: 503 });
  }
  const lc = ["fr", "en", "ar", "es"].includes(locale) ? locale : "fr";

  const handler = Checkout({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    returnUrl: `${SITE_URL}/${lc}/account?checkout=success`,
    environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") || "live_mode",
    type: "session"
  });
  const inner = new NextRequest(new URL("/internal", SITE_URL), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email, name: session.user?.name || undefined },
      return_url: `${SITE_URL}/${lc}/account?checkout=success`,
      metadata: { email }
    })
  });
  return handler(inner);
}
