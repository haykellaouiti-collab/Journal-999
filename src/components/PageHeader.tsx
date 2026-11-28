"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LogoMark, Wordmark } from "./Logo";
import ThemeToggle from "./ThemeToggle";
import LangSwitcher from "./LangSwitcher";
import AccountMenu from "./AccountMenu";
import { useMe } from "@/lib/useMe";

/** En-tête simple pour les pages statiques (à propos, tarifs…). */
export default function PageHeader() {
  const t = useTranslations();
  const me = useMe();
  return (
    <header className="border-b border-line bg-bg/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5"><LogoMark /><Wordmark brand={t("brand")} /></Link>
        <div className="flex items-center gap-2"><LangSwitcher /><ThemeToggle /><AccountMenu me={me} /></div>
      </div>
    </header>
  );
}
