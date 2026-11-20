import crypto from "node:crypto";
import { cmd } from "./_lib/store.js";

// Corps brut nécessaire pour vérifier la signature
export const config = { api: { bodyParser: false } };

async function readRaw(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

// Signature "Standard Webhooks" (utilisée par Dodo Payments)
function verifySignature(raw, headers, secret) {
  const id = headers["webhook-id"];
  const ts = headers["webhook-timestamp"];
  const sigHeader = headers["webhook-signature"];
  if (!id || !ts || !sigHeader || !secret) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = crypto.createHmac("sha256", key).update(`${id}.${ts}.${raw}`).digest("base64");
  return sigHeader.split(" ").some((part) => {
    const sig = part.split(",")[1] || "";
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const raw = await readRaw(req);
  if (!verifySignature(raw, req.headers, process.env.DODO_WEBHOOK_SECRET)) {
    return res.status(401).json({ error: "Signature invalide" });
  }

  let event;
  try { event = JSON.parse(raw); } catch (_) { return res.status(400).json({ error: "JSON invalide" }); }

  const email = String(event?.data?.customer?.email || "").toLowerCase();
  if (email) {
    if (["payment.succeeded", "subscription.active", "subscription.renewed"].includes(event.type)) {
      await cmd(["SADD", "premium", email]);
    } else if (["subscription.cancelled", "subscription.expired", "subscription.failed"].includes(event.type)) {
      await cmd(["SREM", "premium", email]);
    }
  }
  return res.status(200).json({ received: true });
}
