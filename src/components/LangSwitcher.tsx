"use client";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABEL: Record<string, string> = { fr: "Français", en: "English", ar: "العربية", es: "Español" };

export default function LangSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  return (
    <label className="relative inline-flex h-9 items-center gap-1.5 rounded-[.7rem] border border-line bg-surface px-2.5 text-sm font-medium">
      <Globe className="h-4 w-4 shrink-0" />
      <span className="sr-only">Language</span>
      <select
        value={locale}
        onChange={(e) => router.replace(pathname, { locale: e.target.value })}
        className="cursor-pointer appearance-none bg-transparent pe-1 outline-none"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l} className="text-black">{LABEL[l]}</option>
        ))}
      </select>
    </label>
  );
}
