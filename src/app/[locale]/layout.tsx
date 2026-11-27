import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SITE_URL, EDITION } from "@/config/edition";
import ConsentBanner from "@/components/ConsentBanner";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f6f3ec" }, { media: "(prefers-color-scheme: dark)", color: "#0c0d10" }]
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: "%s · Journal 999" },
    description: t("description"),
    applicationName: "Journal 999",
    alternates: {
      canonical: `/${locale}`,
      languages: { ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])), "x-default": `/${routing.defaultLocale}` }
    },
    openGraph: { type: "website", siteName: "Journal 999", title: t("title"), description: t("description"), url: `/${locale}`, locale, images: [{ url: "/og.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description"), images: ["/og.png"] },
    robots: { index: true, follow: true, "max-image-preview": "large" },
    other: { edition: EDITION }
  };
}

const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('j999-theme');var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})()`;

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "meta" });
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Journal 999",
    url: `${SITE_URL}/${locale}`,
    inLanguage: locale,
    description: t("description"),
    potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/${locale}?q={search_term_string}`, "query-input": "required name=search_term_string" }
  };

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <NextIntlClientProvider>
          {children}
          <ConsentBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
