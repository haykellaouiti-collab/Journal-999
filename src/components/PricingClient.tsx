"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { Check, Crown } from "lucide-react";
import { PRICE_CURRENCY, PRICE_MONTHLY, PRICE_YEARLY } from "@/config/edition";
import { useMe } from "@/lib/useMe";

export default function PricingClient() {
  const t = useTranslations("pricing");
  const locale = useLocale();
  const me = useMe();
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const features = t.raw("features") as string[];

  const subscribe = async () => {
    setErr("");
    if (!me?.user) return signIn("google");
    setBusy(true);
    try {
      const r = await fetch("/api/dodo/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ plan, locale }) });
      const d = await r.json();
      if (d.checkout_url) window.location.href = d.checkout_url;
      else setErr(r.status === 503 ? t("notConfigured") : "Error");
    } catch { setErr("Error"); } finally { setBusy(false); }
  };
  const price = plan === "yearly" ? PRICE_YEARLY : PRICE_MONTHLY;

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <div className="text-center">
        <Crown className="mx-auto mb-3 h-10 w-10 text-gold" />
        <h1 className="font-serif text-4xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-muted">{t("subtitle")}</p>
      </div>
      <div className="mx-auto mt-8 flex w-fit rounded-xl border border-line bg-surface p-1">
        {(["monthly", "yearly"] as const).map((p) => (
          <button key={p} onClick={() => setPlan(p)} aria-pressed={plan === p} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${plan === p ? "bg-ink text-bg" : "text-muted"}`}>
            {t(p)} {p === "yearly" && <span className="ms-1 rounded bg-gold px-1.5 py-0.5 text-[10px] text-white">{t("save")}</span>}
          </button>
        ))}
      </div>
      <section className="card mt-6 p-8">
        <p className="flex items-baseline gap-1">
          <span className="font-serif text-5xl font-semibold">{PRICE_CURRENCY}{price}</span>
          <span className="text-muted">{plan === "yearly" ? t("perYear") : t("perMonth")}</span>
        </p>
        <ul className="mt-6 space-y-3">
          {features.map((f) => <li key={f} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" />{f}</li>)}
        </ul>
        <button className="btn btn-accent mt-8 w-full !py-3 text-base" onClick={subscribe} disabled={busy || !me}>{t("choose")}</button>
        {me && !me.user && <p className="mt-3 text-center text-sm text-muted">{t("loginFirst")}</p>}
        {err && <p className="mt-3 text-center text-sm text-accent">{err}</p>}
        <p className="mt-4 text-center text-xs text-muted">{t("secure")}</p>
      </section>
    </main>
  );
}
