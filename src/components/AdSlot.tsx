"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ADS_ENABLED, ADSENSE_CLIENT, AD_SLOTS } from "@/config/edition";
import { getConsent } from "@/lib/ads";

export default function AdSlot({ slot, className = "" }: { slot: keyof typeof AD_SLOTS; className?: string }) {
  const t = useTranslations();
  const ref = useRef<HTMLModElement>(null);
  const [ready, setReady] = useState(false);
  const id = AD_SLOTS[slot];

  useEffect(() => {
    if (!ADS_ENABLED || !id) return;
    const go = () => setReady(true);
    if (getConsent() && typeof document !== "undefined" && document.querySelector('script[src*="adsbygoogle"]')) go();
    window.addEventListener("j999:ads-ready", go);
    return () => window.removeEventListener("j999:ads-ready", go);
  }, [id]);

  useEffect(() => {
    if (!ready || !ref.current || ref.current.dataset.done) return;
    ref.current.dataset.done = "1";
    try { ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({}); } catch {}
  }, [ready]);

  if (!ADS_ENABLED || !id) return null;
  return (
    <aside className={`min-h-[100px] ${className}`} aria-label={t("ad")}>
      <p className="mb-1 text-[10px] uppercase tracking-widest text-muted">{t("ad")}</p>
      <ins ref={ref} className="adsbygoogle block" style={{ display: "block" }} data-ad-client={ADSENSE_CLIENT} data-ad-slot={id} data-ad-format="auto" data-full-width-responsive="true" />
    </aside>
  );
}
