import { Redis } from "@upstash/redis";

/** Redis Upstash (Vercel Marketplace) ; repli mémoire en local pour développer sans compte. */
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const mem = new Map<string, unknown>();
const memory = {
  async get<T>(k: string) { return (mem.get(k) as T) ?? null; },
  async set(k: string, v: unknown) { mem.set(k, v); return "OK"; },
  async incr(k: string) { const n = ((mem.get(k) as number) || 0) + 1; mem.set(k, n); return n; },
  async expire() { return 1; }
};

export const hasRedis = Boolean(url && token);
export const kv = (hasRedis ? new Redis({ url: url!, token: token! }) : memory) as unknown as {
  get<T>(k: string): Promise<T | null>;
  set(k: string, v: unknown, o?: unknown): Promise<unknown>;
  incr(k: string): Promise<number>;
  expire(k: string, s: number): Promise<unknown>;
};
