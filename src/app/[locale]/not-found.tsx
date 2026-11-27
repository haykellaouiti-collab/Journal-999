import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  const t = useTranslations();
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div className="space-y-4"><LogoMark size={64} /><h1 className="font-serif text-4xl font-semibold">404 — {t("notFound")}</h1><Link href="/" className="btn">{t("back")}</Link></div>
    </main>
  );
}
