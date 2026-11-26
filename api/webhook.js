// Webhook Dodo Payments (signature « Standard Webhooks »).
// Variable requise dans Vercel : DODO_WEBHOOK_SECRET (commence par whsec_).
import { createHmac, timingSafeEqual } from "node:crypto";

// Il faut le corps brut pour vérifier la signature.
export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function isValidSignature(raw, headers, secret) {
  const id = headers["webhook-id"];
  const timestamp = headers["webhook-timestamp"];
  const signatures = headers["webhook-signature"];
  if (!id || !timestamp || !signatures) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${raw}`).digest();

  return String(signatures)
    .split(" ")
    .some((part) => {
      const [version, sig] = part.split(",");
      if (version !== "v1" || !sig) return false;
      const got = Buffer.from(sig, "base64");
      return got.length === expected.length && timingSafeEqual(got, expected);
    });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const secret = process.env.DODO_WEBHOOK_SECRET;
  if (!secret) {
    return res.status(503).json({ error: "DODO_WEBHOOK_SECRET non configuré." });
  }

  const raw = await readRawBody(req);
  if (!isValidSignature(raw, req.headers, secret)) {
    return res.status(401).json({ error: "Signature invalide." });
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch (_) {
    return res.status(400).json({ error: "JSON invalide." });
  }

  if (event?.type === "payment.succeeded" || event?.type === "subscription.active") {
    const email = event.data?.customer?.email;
    // À faire : enregistrer cet e-mail (base de données) pour vérifier le Premium côté serveur.
    console.log(`Abonnement Journal 999 validé pour : ${email}`);
  }

  return res.status(200).json({ received: true });
}
