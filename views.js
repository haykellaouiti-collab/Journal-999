import { cmd, storeEnabled, rateLimit } from "./_lib/store.js";
import { clientIp } from "./_lib/auth.js";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    if (!storeEnabled) return res.status(200).json({ enabled: false, total: 0, today: 0, sources: {} });
    const [total, day, flat] = await Promise.all([
      cmd(["GET", "views:total"]),
      cmd(["GET", `views:day:${today()}`]),
      cmd(["HGETALL", "views:sources"])
    ]);
    const sources = {};
    if (Array.isArray(flat)) for (let i = 0; i < flat.length; i += 2) sources[flat[i]] = Number(flat[i + 1]) || 0;
    return res.status(200).json({ enabled: true, total: Number(total) || 0, today: Number(day) || 0, sources });
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  res.setHeader("Cache-Control", "no-store");
  if (!storeEnabled) return res.status(204).end();
  if (!rateLimit(`views:${clientIp(req)}`, 60, 60_000)) return res.status(429).end();

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  body = body || {};

  if (body.type === "visit") {
    const key = `views:day:${today()}`;
    await cmd(["INCR", "views:total"]);
    const n = await cmd(["INCR", key]);
    if (n === 1) await cmd(["EXPIRE", key, 60 * 60 * 24 * 90]);
    return res.status(204).end();
  }

  const name = String(body.source || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 60);
  if (name) {
    const exists = await cmd(["HEXISTS", "views:sources", name]);
    if (exists !== 1) {
      const size = await cmd(["HLEN", "views:sources"]);
      if (Number(size) >= 400) return res.status(204).end(); // protège contre le spam de noms
    }
    await cmd(["HINCRBY", "views:sources", name, 1]);
  }
  return res.status(204).end();
}
