// Stockage optionnel via Upstash Redis / Vercel KV (REST). Sans variables d'environnement, tout est désactivé proprement.
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const storeEnabled = Boolean(URL_ && TOKEN);

export async function cmd(args) {
  if (!storeEnabled) return null;
  try {
    const r = await fetch(URL_, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(args)
    });
    const j = await r.json();
    return j.result ?? null;
  } catch (_) {
    return null;
  }
}

// Limiteur de débit en mémoire (best effort, par instance serverless)
const buckets = new Map();
export function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    if (buckets.size > 5000) buckets.clear();
    return true;
  }
  b.n++;
  return b.n <= max;
}
