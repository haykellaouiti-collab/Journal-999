import { kv } from "./redis";
import { IS_PRO_EDITION } from "@/config/edition";

export interface SubRecord {
  status: "active" | "on_hold" | "cancelled" | "failed" | "expired" | "paused";
  customerId?: string;
  subscriptionId?: string;
  until?: string; // fin de période payée (ISO)
  updatedAt: string;
}

const key = (email: string) => `sub:${email.trim().toLowerCase()}`;

export async function getSub(email?: string | null): Promise<SubRecord | null> {
  if (!email) return null;
  return kv.get<SubRecord>(key(email));
}
export async function saveSub(email: string, patch: Partial<SubRecord>) {
  const prev = (await getSub(email)) || ({ status: "active" } as SubRecord);
  await kv.set(key(email), { ...prev, ...patch, updatedAt: new Date().toISOString() });
}
export function isProRecord(r: SubRecord | null): boolean {
  if (!r) return false;
  if (r.status === "active") return true;
  return Boolean(r.until && new Date(r.until).getTime() > Date.now() && r.status === "cancelled");
}
export async function isProUser(email?: string | null) {
  if (!IS_PRO_EDITION) return false;
  const adminList = (process.env.PRO_FREE_EMAILS || "").toLowerCase().split(",").map((s) => s.trim());
  if (email && adminList.includes(email.toLowerCase())) return true; // comptes offerts / testeurs
  return isProRecord(await getSub(email));
}
