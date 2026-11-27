import type { MetadataRoute } from "next";
import { SITE_URL, IS_PRO_EDITION } from "@/config/edition";
import { routing } from "@/i18n/routing";
import { CATEGORIES } from "@/config/sources";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", ...CATEGORIES.map((c) => `/c/${c}`), "/about", "/privacy", ...(IS_PRO_EDITION ? ["/pricing"] : [])];
  return paths.flatMap((p) =>
    routing.locales.map((l) => ({
      url: `${SITE_URL}/${l}${p}`,
      lastModified: new Date(),
      changeFrequency: p === "" || p.startsWith("/c/") ? ("hourly" as const) : ("monthly" as const),
      priority: p === "" ? 1 : p.startsWith("/c/") ? 0.8 : 0.4,
      alternates: { languages: Object.fromEntries(routing.locales.map((x) => [x, `${SITE_URL}/${x}${p}`])) }
    }))
  );
}
