import { cmd, rateLimit } from "./store.js";

export const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "502413181474-7ei3mhnqmk9uhcrm0v6b816csfbe5i5v.apps.googleusercontent.com";
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "haykellaouiti@gmail.com").toLowerCase();
export const FREE_LIMIT = parseInt(process.env.FREE_LIMIT || "15", 10);

const tokenCache = new Map();

export function clientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  return (Array.isArray(xf) ? xf[0] : xf || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
}

export function getBearer(req) {
  const h = req.headers.authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7).trim() : "";
}

// Vérifie le jeton Google côté serveur (signature, audience, expiration)
export async function verifyGoogleToken(token) {
  if (!token || token.length > 4096) return null;
  const cached = tokenCache.get(token);
  if (cached && cached.exp > Date.now()) return cached.user;
  try {
    const r = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`
    );
    if (!r.ok) return null;
    const p = await r.json();
    if (p.aud !== GOOGLE_CLIENT_ID) return null;
    if (String(p.email_verified) !== "true") return null;
    const expMs = parseInt(p.exp, 10) * 1000;
    if (!expMs || expMs < Date.now()) return null;
    const user = { email: String(p.email).toLowerCase(), name: p.name || p.email };
    tokenCache.set(token, { user, exp: Math.min(expMs, Date.now() + 5 * 60 * 1000) });
    if (tokenCache.size > 500) tokenCache.clear();
    return user;
  } catch (_) {
    return null;
  }
}

export async function getUserStatus(req) {
  const user = await verifyGoogleToken(getBearer(req));
  if (!user) return { user: null, isAdmin: false, isPremium: false };
  const isAdmin = user.email === ADMIN_EMAIL;
  let isPremium = isAdmin;
  if (!isPremium) {
    const r = await cmd(["SISMEMBER", "premium", user.email]);
    isPremium = r === 1;
  }
  return { user, isAdmin, isPremium };
}

export { rateLimit };
