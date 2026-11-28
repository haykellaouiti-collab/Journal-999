import { ADSENSE_CLIENT } from "@/config/edition";

declare global { interface Window { adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number }; } }

let loaded = false;
export const CONSENT_KEY = "j999-consent";

export function getConsent(): "all" | "npa" | null {
  try { const v = localStorage.getItem(CONSENT_KEY); return v === "all" || v === "npa" ? v : null; } catch { return null; }
}
export function setConsent(v: "all" | "npa") {
  try { localStorage.setItem(CONSENT_KEY, v); } catch {}
  loadAdsense(v);
}
export function loadAdsense(mode: "all" | "npa") {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  window.adsbygoogle = window.adsbygoogle || ([] as unknown as NonNullable<Window["adsbygoogle"]>);
  if (mode === "npa") window.adsbygoogle.requestNonPersonalizedAds = 1;
  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  s.onload = () => window.dispatchEvent(new Event("j999:ads-ready"));
  document.head.appendChild(s);
}
