import { NextRequest, NextResponse } from "next/server";
import { Webhooks } from "@dodopayments/nextjs";
import { saveSub, type SubRecord } from "@/lib/entitlement";

/** Dodo → ce endpoint : https://VOTRE-DOMAINE/api/dodo/webhook (signature vérifiée par l'adaptateur). */
const STATUS: Record<string, SubRecord["status"]> = {
  "subscription.active": "active",
  "subscription.renewed": "active",
  "subscription.plan_changed": "active",
  "subscription.updated": "active",
  "subscription.unpaused": "active",
  "subscription.on_hold": "on_hold",
  "subscription.paused": "paused",
  "subscription.cancelled": "cancelled",
  "subscription.failed": "failed",
  "subscription.expired": "expired"
};

const handler = () => Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY as string,
  onPayload: async (payload: any) => {
    const type: string = payload?.type || "";
    const data = payload?.data || {};
    const email: string | undefined = data.customer?.email;
    const status = STATUS[type];
    if (!email || !status) return;
    // Pour un « updated » on respecte le statut réel envoyé par Dodo.
    const real = type === "subscription.updated" && typeof data.status === "string" ? data.status : null;
    const finalStatus = real && STATUS[`subscription.${real}`] ? STATUS[`subscription.${real}`] : status;
    await saveSub(email, {
      status: finalStatus,
      customerId: data.customer?.customer_id || undefined,
      subscriptionId: data.subscription_id || undefined,
      until: data.next_billing_date || data.expires_at || undefined
    });
  }
});

export async function POST(req: NextRequest) {
  if (!process.env.DODO_PAYMENTS_WEBHOOK_KEY) return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  return handler()(req);
}
