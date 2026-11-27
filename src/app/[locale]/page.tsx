import { setRequestLocale } from "next-intl/server";
import Newsstand from "@/components/Newsstand";
import SiteFooter from "@/components/SiteFooter";
import { getArticles } from "@/lib/news";

export const revalidate = 600;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const initial = await getArticles({ max: 300 });
  return (<><Newsstand initial={initial} introKey="all" /><SiteFooter /></>);
}
