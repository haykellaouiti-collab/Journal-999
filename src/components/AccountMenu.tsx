"use client";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { Crown, LogIn } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { IS_PRO_EDITION } from "@/config/edition";
import type { Me } from "@/lib/useMe";

export default function AccountMenu({ me }: { me: Me | null }) {
  const t = useTranslations("pro");
  if (!IS_PRO_EDITION) return null;
  if (!me) return <div className="skeleton h-9 w-24 rounded-[.7rem]" />;
  if (!me.user) {
    return (
      <button className="btn btn-ghost !px-3 !py-1.5" onClick={() => signIn("google")}>
        <LogIn className="h-4 w-4" /> <span className="hidden sm:inline">{t("login")}</span>
      </button>
    );
  }
  return (
    <Link href={me.pro ? "/account" : "/pricing"} className="inline-flex h-9 items-center gap-2 rounded-[.7rem] border border-line bg-surface ps-1 pe-3 text-sm font-semibold">
      {me.user.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={me.user.image} alt="" referrerPolicy="no-referrer" className="h-7 w-7 rounded-lg" />
      ) : (
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-surface-2">{me.user.name?.[0] ?? "•"}</span>
      )}
      {me.pro ? (
        <span className="inline-flex items-center gap-1 text-gold"><Crown className="h-3.5 w-3.5" />{t("badge")}</span>
      ) : (
        <span className="text-accent">{t("upgrade")}</span>
      )}
    </Link>
  );
}
