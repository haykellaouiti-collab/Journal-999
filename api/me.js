import { getUserStatus, FREE_LIMIT } from "./_lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  const s = await getUserStatus(req);
  return res.status(200).json({
    authenticated: Boolean(s.user),
    email: s.user?.email || null,
    name: s.user?.name || null,
    isAdmin: s.isAdmin,
    isPremium: s.isPremium,
    limit: FREE_LIMIT
  });
}
