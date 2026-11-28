import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { IS_PRO_EDITION, CONTACT_EMAIL } from "@/config/edition";

export default async function SiteFooter() {
  const t = await getTranslations();
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl">{t("footer.note")}</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 font-medium">
          <Link href="/about" className="hover:text-ink">{t("footer.about")}</Link>
          <Link href="/privacy" className="hover:text-ink">{t("footer.privacy")}</Link>
          {IS_PRO_EDITION && <Link href="/pricing" className="hover:text-ink">{t("footer.pricing")}</Link>}
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink">{CONTACT_EMAIL}</a>
        </nav>
      </div>
    </footer>
  );
}
