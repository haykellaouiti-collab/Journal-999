/**
 * Une seule base de code, deux éditions.
 *  - standard : gratuit, financé par Google AdSense, sans compte.
 *  - pro      : abonnement Dodo Payments, sans pub, IA + scores live + synchro cloud.
 * Réglée par NEXT_PUBLIC_EDITION (défini dans vercel.json de chaque archive).
 */
export const EDITION: "standard" | "pro" =
  process.env.NEXT_PUBLIC_EDITION === "pro" ? "pro" : "standard";
export const IS_PRO_EDITION = EDITION === "pro";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://journal-999.vercel.app").replace(/\/$/, "");
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@journal999.com";

export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-3266873353292561";
export const ADS_ENABLED = !IS_PRO_EDITION && process.env.NEXT_PUBLIC_ADS_DISABLED !== "1";
/** Pubs dans le fil de la page d'accueil : désactivé par défaut (voir README, politique AdSense « contenu répliqué »). */
export const ADS_IN_FEED = ADS_ENABLED && process.env.NEXT_PUBLIC_ADS_IN_FEED === "1";
export const AD_SLOTS = {
  banner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER || "",
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || "",
  feed: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FEED || ""
};

export const PRICE_MONTHLY = process.env.NEXT_PUBLIC_PRICE_MONTHLY || "4.99";
export const PRICE_YEARLY = process.env.NEXT_PUBLIC_PRICE_YEARLY || "39.99";
export const PRICE_CURRENCY = process.env.NEXT_PUBLIC_PRICE_CURRENCY || "$";
export const FREE_BOOKMARK_LIMIT = 10;
