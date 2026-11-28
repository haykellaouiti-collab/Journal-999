"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ADS_ENABLED } from "@/config/edition";
import { getConsent, loadAdsense, setConsent } from "@/lib/ads";

export default function ConsentBanner() {
  const t = useTranslations("consent");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!ADS_ENABLED) return;
    const c = getConsent();
    if (c) loadAdsense(c); else setOpen(true);
  }, []);
  if (!open) return null;
  const pick = (v: "all" | "npa") => { setConsent(v); setOpen(false); };
  return (
    <div role="dialog" aria-live="polite" className="card fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-2xl flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <p className="flex-1 text-sm text-muted">{t("text")}</p>
      <div className="flex gap-2">
        <button className="btn btn-ghost" onClick={() => pick("npa")}>{t("decline")}</button>
        <button className="btn" onClick={() => pick("all")}>{t("accept")}</button>
      </div>
    </div>
  );
}
