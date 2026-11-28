import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import PageHeader from "@/components/PageHeader";
import SiteFooter from "@/components/SiteFooter";
import { Link, redirect } from "@/i18n/navigation";
import { IS_PRO_EDITION } from "@/config/edition";
import { getSub, isProRecord } from "@/lib/entitlement";
import { isProUser } from "@/lib/entitlement";
import { Crown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Account({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ checkout?: string }> }) {
  const { locale } = await params;
  const { checkout } = await searchParams;
  if (!IS_PRO_EDITION) notFound();
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.email) return redirect({ href: "/pricing", locale });
  const t = await getTranslations({ locale });
  const sub = await getSub(session.user.email);
  const pro = await isProUser(session.user.email);
  return (
    <>
      <PageHeader />
      <main className="mx-auto max-w-xl px-4 py-12">
        <h1 className="font-serif text-4xl font-semibold">{t("pro.account")}</h1>
        {checkout === "success" && <p className="card mt-6 p-4 text-sm">{t("pricing.success")}</p>}
        <section className="card mt-6 space-y-3 p-6">
          <p className="text-muted">{session.user.name} · {session.user.email}</p>
          <p className="flex items-center gap-2 text-lg font-semibold">
            {pro ? <><Crown className="h-5 w-5 text-gold" />{t("pro.active")}</> : t("pro.free")}
          </p>
          {sub?.until && isProRecord(sub) && <p className="text-sm text-muted">{t("pricing.renews")} {new Date(sub.until).toLocaleDateString(locale)}</p>}
          <div className="flex flex-wrap gap-2 pt-2">
            {sub?.customerId && <a className="btn" href="/api/dodo/portal">{t("pro.manage")}</a>}
            {!pro && <Link className="btn btn-accent" href="/pricing">{t("pro.upgrade")}</Link>}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
