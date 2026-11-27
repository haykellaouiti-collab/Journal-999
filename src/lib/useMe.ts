"use client";
import { useEffect, useState } from "react";
import { IS_PRO_EDITION } from "@/config/edition";

export interface Me { edition: string; user: { name?: string | null; email?: string | null; image?: string | null } | null; pro: boolean }

export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    if (!IS_PRO_EDITION) { setMe({ edition: "standard", user: null, pro: false }); return; }
    fetch("/api/me", { cache: "no-store" }).then((r) => r.json()).then(setMe).catch(() => setMe({ edition: "pro", user: null, pro: false }));
  }, []);
  return me;
}
