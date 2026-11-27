import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PageHeader from "@/components/PageHeader";
import SiteFooter from "@/components/SiteFooter";
import { CONTACT_EMAIL } from "@/config/edition";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title") };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const keys = ["p1","p2","p3"] as const;
  return (
    <>
      <PageHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">{t("title")}</h1>
        <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-muted">
          {keys.map((k) => <p key={k}>{t(k)}</p>)}
        </div>
        <p className="mt-8"><a className="btn" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      </main>
      <SiteFooter />
    </>
  );
}
