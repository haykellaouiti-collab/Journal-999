import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PageHeader from "@/components/PageHeader";
import SiteFooter from "@/components/SiteFooter";
import PricingClient from "@/components/PricingClient";
import { IS_PRO_EDITION } from "@/config/edition";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  return { title: t("title") };
}

export default async function Pricing({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!IS_PRO_EDITION) notFound();
  setRequestLocale(locale);
  return (<><PageHeader /><PricingClient /><SiteFooter /></>);
}
