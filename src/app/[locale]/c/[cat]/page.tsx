import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Newsstand from "@/components/Newsstand";
import SiteFooter from "@/components/SiteFooter";
import { getArticles } from "@/lib/news";
import { CATEGORIES, type Category } from "@/config/sources";
import { routing } from "@/i18n/routing";

export const revalidate = 600;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => CATEGORIES.map((cat) => ({ locale, cat })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; cat: string }> }): Promise<Metadata> {
  const { locale, cat } = await params;
  if (!CATEGORIES.includes(cat as Category)) return {};
  const t = await getTranslations({ locale });
  return {
    title: t(`nav.${cat}`),
    description: t(`intro.${cat}`),
    alternates: { canonical: `/${locale}/c/${cat}`, languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/c/${cat}`])) }
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; cat: string }> }) {
  const { locale, cat } = await params;
  if (!CATEGORIES.includes(cat as Category)) notFound();
  setRequestLocale(locale);
  const initial = await getArticles({ max: 300 });
  return (<><Newsstand initial={initial} initialCategory={cat as Category} introKey={cat} /><SiteFooter /></>);
}
