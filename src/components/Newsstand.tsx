"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Bookmark, BookmarkCheck, Crown, ExternalLink, Lock, RefreshCw, Search, Share2, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Article } from "@/lib/news";
import { CATEGORIES, LANGS, NEWS_SOURCES, REGIONS, type Lang } from "@/config/sources";
import { ADS_IN_FEED, FREE_BOOKMARK_LIMIT, IS_PRO_EDITION } from "@/config/edition";
import { timeAgo, trending } from "@/lib/text";
import { useMe } from "@/lib/useMe";
import { LogoMark, Wordmark } from "./Logo";
import ThemeToggle from "./ThemeToggle";
import LangSwitcher from "./LangSwitcher";
import AccountMenu from "./AccountMenu";
import AdSlot from "./AdSlot";

const BM_KEY = "j999-bookmarks";
const SRC_KEY = "j999-hidden-sources";
const PAGE = 18;
const SPEECH: Record<string, string> = { fr: "fr-FR", en: "en-US", ar: "ar-SA", es: "es-ES" };

type Cat = "all" | (typeof CATEGORIES)[number];

export default function Newsstand({ initial, initialCategory = "all", introKey }: { initial: Article[]; initialCategory?: Cat; introKey: string }) {
  const t = useTranslations();
  const locale = useLocale() as Lang;
  const me = useMe();
  const isPro = Boolean(me?.pro);

  const [articles, setArticles] = useState<Article[]>(initial);
  const [pending, setPending] = useState<Article[] | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cat, setCat] = useState<Cat>(initialCategory);
  const [lang, setLang] = useState<"auto" | "all" | Lang>("auto");
  const [region, setRegion] = useState("all");
  const [hidden, setHidden] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [onlySaved, setOnlySaved] = useState(false);
  const [reader, setReader] = useState<Article | null>(null);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  /* ── persistance locale ── */
  useEffect(() => {
    try { setBookmarks(JSON.parse(localStorage.getItem(BM_KEY) || "[]")); } catch {}
    try { setHidden(JSON.parse(localStorage.getItem(SRC_KEY) || "[]")); } catch {}
  }, []);
  const saveBookmarks = useCallback((list: Article[]) => {
    setBookmarks(list);
    try { localStorage.setItem(BM_KEY, JSON.stringify(list)); } catch {}
    if (isPro) fetch("/api/bookmarks", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: list }) }).catch(() => {});
  }, [isPro]);

  /* ── Pro : fusion des favoris cloud ── */
  useEffect(() => {
    if (!isPro) return;
    fetch("/api/bookmarks").then((r) => r.json()).then((d) => {
      if (!Array.isArray(d.items)) return;
      setBookmarks((local) => {
        const map = new Map<string, Article>();
        [...d.items, ...local].forEach((a: Article) => map.set(a.link, a));
        const merged = [...map.values()];
        try { localStorage.setItem(BM_KEY, JSON.stringify(merged)); } catch {}
        fetch("/api/bookmarks", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: merged }) }).catch(() => {});
        return merged;
      });
    }).catch(() => {});
  }, [isPro]);

  /* ── actualisation automatique (toutes les 5 min) ── */
  const refresh = useCallback(async (manual = false) => {
    setRefreshing(true);
    try {
      const r = await fetch("/api/news");
      const d = await r.json();
      if (Array.isArray(d.articles) && d.articles.length) {
        setUpdatedAt(d.updatedAt);
        const known = new Set(articles.map((a) => a.id));
        const fresh = d.articles.filter((a: Article) => !known.has(a.id));
        if (manual || fresh.length === 0) { setArticles(d.articles); setPending(null); }
        else setPending(d.articles);
      }
    } catch {} finally { setRefreshing(false); }
  }, [articles]);
  useEffect(() => {
    setUpdatedAt(new Date().toISOString());
    const id = setInterval(() => { if (document.visibilityState === "visible") refresh(false); }, 300_000);
    return () => clearInterval(id);
  }, [refresh]);

  /* ── raccourcis clavier ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "Escape") { setReader(null); window.speechSynthesis?.cancel(); setSpeaking(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => { document.body.style.overflow = reader ? "hidden" : ""; }, [reader]);
  useEffect(() => { if (toast) { const id = setTimeout(() => setToast(""), 1800); return () => clearTimeout(id); } }, [toast]);

  /* ── filtrage ── */
  const base = useMemo(() => {
    const hide = new Set(isPro ? hidden : []);
    return articles.filter((a) => (cat === "all" || a.category === cat) && (region === "all" || a.region === region) && !hide.has(a.sourceId));
  }, [articles, cat, region, hidden, isPro]);

  const effectiveLang: "all" | Lang = useMemo(() => {
    if (lang !== "auto") return lang;
    return base.filter((a) => a.language === locale).length >= 6 ? locale : "all";
  }, [lang, base, locale]);

  const list = useMemo(() => {
    let r = onlySaved ? bookmarks : base.filter((a) => effectiveLang === "all" || a.language === effectiveLang);
    const s = q.trim().toLowerCase();
    if (s) r = r.filter((a) => `${a.title} ${a.summary} ${a.sourceName} ${a.country}`.toLowerCase().includes(s));
    return r;
  }, [base, effectiveLang, q, onlySaved, bookmarks]);

  const topics = useMemo(() => trending(base.filter((a) => effectiveLang === "all" || a.language === effectiveLang).map((a) => a.title)), [base, effectiveLang]);
  useEffect(() => setShown(PAGE), [cat, effectiveLang, region, q, onlySaved]);

  const savedSet = useMemo(() => new Set(bookmarks.map((b) => b.link)), [bookmarks]);
  const toggleSave = (a: Article) => {
    if (savedSet.has(a.link)) return saveBookmarks(bookmarks.filter((b) => b.link !== a.link));
    if (IS_PRO_EDITION && !isPro && bookmarks.length >= FREE_BOOKMARK_LIMIT) return setToast(t("bookmarksLimit", { n: FREE_BOOKMARK_LIMIT }));
    saveBookmarks([a, ...bookmarks]);
  };

  const speak = (a: Article) => {
    const ss = window.speechSynthesis;
    if (!ss) return;
    if (speaking === a.id) { ss.cancel(); return setSpeaking(null); }
    ss.cancel();
    const u = new SpeechSynthesisUtterance(`${a.title}. ${a.summary}`);
    u.lang = SPEECH[a.language] || "en-US";
    u.onend = () => setSpeaking(null);
    setSpeaking(a.id);
    ss.speak(u);
  };
  const share = async (a: Article) => {
    try {
      if (navigator.share) await navigator.share({ title: a.title, url: a.link });
      else { await navigator.clipboard.writeText(a.link); setToast(t("card.copied")); }
    } catch {}
  };

  const dateLabel = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const visible = list.slice(0, shown);
  const hero = visible[0];
  const rest = visible.slice(1);

  return (
    <>
      {/* ───────── En-tête ───────── */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={t("brand")}>
            <LogoMark /><span className="hidden sm:block"><Wordmark brand={t("brand")} /></span>
          </Link>
          <div className="relative mx-auto w-full max-w-xl">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} type="search"
              placeholder={t("search")} aria-label={t("search")}
              className="h-10 w-full rounded-xl border border-line bg-surface ps-9 pe-10 text-sm outline-none transition focus:border-ink"
            />
            <kbd className="pointer-events-none absolute end-3 top-1/2 hidden -translate-y-1/2 rounded border border-line px-1.5 text-[10px] text-muted md:block" title={t("searchHint")}>/</kbd>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button className="icon-btn" aria-pressed={onlySaved} onClick={() => setOnlySaved((v) => !v)} title={t("bookmarks")} aria-label={t("bookmarks")}>
              {onlySaved ? <BookmarkCheck className="h-4 w-4 text-accent" /> : <Bookmark className="h-4 w-4" />}
              {bookmarks.length > 0 && <span className="absolute -end-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">{bookmarks.length}</span>}
            </button>
            <span className="hidden sm:block"><LangSwitcher /></span>
            <ThemeToggle />
            <AccountMenu me={me} />
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-4 pb-2.5 no-scrollbar" aria-label="Sections">
          {(["all", ...CATEGORIES] as Cat[]).map((c) => (
            <button key={c} className="chip" aria-pressed={cat === c && !onlySaved} onClick={() => { setCat(c); setOnlySaved(false); }}>
              {t(`nav.${c}`)}
            </button>
          ))}
          <span className="sm:hidden ms-auto"><LangSwitcher /></span>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6">
        {/* ───────── Titre éditorial ───────── */}
        <section className="mb-6 flex flex-col gap-2 border-b border-line pb-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted">
              <span className="live-dot h-2 w-2 rounded-full bg-accent" /> <span suppressHydrationWarning>{dateLabel}</span>
            </p>
            <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              {t(`nav.${initialCategory === "all" ? "all" : initialCategory}`)}
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{t(`intro.${introKey}`)}</p>
          </div>
          <button className="btn btn-ghost shrink-0 self-start md:self-end" onClick={() => refresh(true)} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> {t("refresh")}
          </button>
        </section>

        {pending && (
          <button className="btn btn-accent mx-auto mb-5 flex" onClick={() => { setArticles(pending); setPending(null); }}>
            <RefreshCw className="h-4 w-4" /> {t("newArticles", { n: pending.filter((a) => !new Set(articles.map((x) => x.id)).has(a.id)).length })}
          </button>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* ───────── Fil ───────── */}
          <div>
            <details className="mb-5 lg:hidden"><summary className="chip w-fit list-none">{t("language")} · {t("region")}</summary><div className="mt-2"><Filters {...{ lang: effectiveLang, setLang: setLang as any, region, setRegion, t }} /></div></details>

            {onlySaved && bookmarks.length === 0 && <p className="card p-6 text-muted">{t("bookmarksEmpty")}</p>}
            {list.length === 0 && !(onlySaved && bookmarks.length === 0) && (
              <div className="card flex flex-col items-start gap-3 p-6">
                <p className="text-muted">{t("empty")}</p>
                <button className="btn btn-ghost" onClick={() => { setLang("all"); setRegion("all"); setQ(""); setCat("all"); setOnlySaved(false); }}>{t("resetFilters")}</button>
              </div>
            )}

            {hero && <Hero a={hero} t={t} saved={savedSet.has(hero.link)} speaking={speaking === hero.id} onSave={() => toggleSave(hero)} onSpeak={() => speak(hero)} onOpen={() => setReader(hero)} />}

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {rest.map((a, i) => (
                <div key={a.id} className="contents">
                  <Card a={a} t={t} saved={savedSet.has(a.link)} speaking={speaking === a.id} onSave={() => toggleSave(a)} onSpeak={() => speak(a)} onOpen={() => setReader(a)} />
                  {ADS_IN_FEED && (i + 1) % 8 === 0 && <div className="sm:col-span-2"><AdSlot slot="feed" /></div>}
                </div>
              ))}
            </div>

            {list.length > shown && (
              <div className="mt-8 flex justify-center"><button className="btn btn-ghost" onClick={() => setShown((n) => n + PAGE)}>{t("loadMore")}</button></div>
            )}
          </div>

          {/* ───────── Barre latérale ───────── */}
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="hidden lg:block"><Filters {...{ lang: effectiveLang, setLang: setLang as any, region, setRegion, t }} /></div>

            {topics.length > 0 && (
              <section className="card p-4">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">{t("trending")}</h2>
                <div className="flex flex-wrap gap-1.5">
                  {topics.map((w) => <button key={w} className="chip" aria-pressed={q.toLowerCase() === w} onClick={() => setQ(q.toLowerCase() === w ? "" : w)}>#{w}</button>)}
                </div>
              </section>
            )}

            {IS_PRO_EDITION && <SourcesPanel t={t} pro={isPro} hidden={hidden} setHidden={(h) => { setHidden(h); try { localStorage.setItem(SRC_KEY, JSON.stringify(h)); } catch {} }} lang={effectiveLang} />}
            {IS_PRO_EDITION && isPro && <Scores t={t} />}
            {IS_PRO_EDITION && !isPro && me && (
              <section className="card relative overflow-hidden p-5" style={{ background: "linear-gradient(135deg,var(--gold-soft),var(--surface))" }}>
                <Crown className="mb-2 h-6 w-6 text-gold" />
                <h2 className="font-serif text-lg font-semibold">{t("upsell.title")}</h2>
                <p className="mt-1 text-sm text-muted">{t("upsell.text")}</p>
                <Link href="/pricing" className="btn mt-4 w-full">{t("upsell.cta")}</Link>
              </section>
            )}
            <AdSlot slot="sidebar" />
          </aside>
        </div>

        <AdSlot slot="banner" className="mt-10" />
      </main>

      {/* ───────── Panneau de lecture ───────── */}
      {reader && (
        <Reader a={reader} t={t} pro={isPro} proEdition={IS_PRO_EDITION} locale={locale} saved={savedSet.has(reader.link)} speaking={speaking === reader.id}
          onClose={() => { setReader(null); window.speechSynthesis?.cancel(); setSpeaking(null); }}
          onSave={() => toggleSave(reader)} onSpeak={() => speak(reader)} onShare={() => share(reader)} />
      )}

      {toast && <div role="status" className="fixed bottom-6 start-1/2 z-[60] max-w-sm -translate-x-1/2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-bg shadow-lg rtl:translate-x-1/2">{toast}</div>}
      <span className="sr-only" suppressHydrationWarning>{updatedAt && t("updated", { time: new Date(updatedAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) })}</span>
    </>
  );
}

/* ═════════════ Sous-composants ═════════════ */

type TFn = ReturnType<typeof useTranslations>;
interface CardProps { a: Article; t: TFn; saved: boolean; speaking: boolean; onSave: () => void; onSpeak: () => void; onOpen: () => void }

function Cover({ a, className }: { a: Article; className: string }) {
  const [broken, setBroken] = useState(false);
  if (a.image && !broken) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={a.image} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setBroken(true)} className={`${className} object-cover`} />;
  }
  const hue = [...a.sourceName].reduce((h, c) => h + c.charCodeAt(0), 0) % 360;
  return (
    <div className={`${className} grid place-items-center`} style={{ background: `linear-gradient(135deg,hsl(${hue} 45% 32%),hsl(${(hue + 40) % 360} 50% 18%))` }} aria-hidden>
      <span className="font-serif text-4xl font-bold text-white/80">{a.sourceName.trim()[0]}</span>
    </div>
  );
}

function Meta({ a, t }: { a: Article; t: TFn }) {
  return (
    <p className="flex items-center gap-2 text-xs text-muted">
      <span className="font-bold uppercase tracking-wide text-ink">{a.sourceName}</span>
      <span aria-hidden>·</span>
      <time dateTime={a.pubDate} suppressHydrationWarning>{timeAgo(a.pubDate, (k, v) => t(`ago.${k}`, v))}</time>
      <span className="ms-auto rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold uppercase">{a.language}</span>
    </p>
  );
}

function Actions({ a, t, saved, speaking, onSave, onSpeak, onOpen }: CardProps) {
  return (
    <div className="mt-auto flex items-center gap-1.5 pt-3">
      <button className="btn btn-ghost !px-3 !py-1.5 !text-xs" onClick={onOpen}>{t("card.quick")}</button>
      <button className="icon-btn !h-8 !w-8" onClick={onSpeak} aria-label={speaking ? t("card.stop") : t("card.listen")} title={speaking ? t("card.stop") : t("card.listen")}>
        {speaking ? <VolumeX className="h-4 w-4 text-accent" /> : <Volume2 className="h-4 w-4" />}
      </button>
      <button className="icon-btn !h-8 !w-8" onClick={onSave} aria-pressed={saved} aria-label={saved ? t("card.saved") : t("card.save")} title={saved ? t("card.saved") : t("card.save")}>
        {saved ? <BookmarkCheck className="h-4 w-4 text-accent" /> : <Bookmark className="h-4 w-4" />}
      </button>
      <a href={a.link} target="_blank" rel="noopener noreferrer nofollow" className="ms-auto inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline" aria-label={t("card.read", { source: a.sourceName })}>
        {t("card.read", { source: a.sourceName })} <ExternalLink className="h-3 w-3 rtl:-scale-x-100" />
      </a>
    </div>
  );
}

function Hero(p: CardProps) {
  const { a, t } = p;
  return (
    <article className="card grid overflow-hidden md:grid-cols-5">
      <Cover a={a} className="h-56 w-full md:col-span-3 md:h-full md:min-h-72" />
      <div className="flex flex-col gap-3 p-5 md:col-span-2 md:p-6">
        <Meta a={a} t={t} />
        <h2 className="font-serif text-2xl font-semibold leading-snug md:text-[1.7rem]">
          <a href={a.link} target="_blank" rel="noopener noreferrer nofollow" className="hover:text-accent">{a.title}</a>
        </h2>
        {a.summary && <p className="line-clamp-4 text-[15px] leading-relaxed text-muted">{a.summary}</p>}
        <Actions {...p} />
      </div>
    </article>
  );
}

function Card(p: CardProps) {
  const { a, t } = p;
  return (
    <article className="card flex flex-col overflow-hidden transition hover:-translate-y-0.5">
      <Cover a={a} className="aspect-[16/9] w-full" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Meta a={a} t={t} />
        <h3 className="font-serif text-[1.08rem] font-semibold leading-snug">
          <a href={a.link} target="_blank" rel="noopener noreferrer nofollow" className="hover:text-accent">{a.title}</a>
        </h3>
        {a.summary && <p className="line-clamp-3 text-sm leading-relaxed text-muted">{a.summary}</p>}
        <Actions {...p} />
      </div>
    </article>
  );
}

function Filters({ lang, setLang, region, setRegion, t }: { lang: string; setLang: (l: string) => void; region: string; setRegion: (r: string) => void; t: TFn }) {
  return (
    <section className="card space-y-4 p-4">
      <div>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">{t("language")}</h2>
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...LANGS] as string[]).map((l) => (
            <button key={l} className="chip" aria-pressed={lang === l} onClick={() => setLang(l)}>{t(`langs.${l}`)}</button>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">{t("region")}</h2>
        <div className="flex flex-wrap gap-1.5">
          {["all", ...REGIONS].map((r) => (
            <button key={r} className="chip" aria-pressed={region === r} onClick={() => setRegion(r)}>{t(`regions.${r}`)}</button>
          ))}
        </div>
      </div>
    </section>
  );
}

function SourcesPanel({ t, pro, hidden, setHidden, lang }: { t: TFn; pro: boolean; hidden: string[]; setHidden: (h: string[]) => void; lang: string }) {
  const [open, setOpen] = useState(false);
  const sources = NEWS_SOURCES.filter((s) => lang === "all" || s.language === lang);
  return (
    <section className="card p-4">
      <button className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-widest text-muted" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{t("sources")}</span>
        {!pro ? <Lock className="h-3.5 w-3.5" /> : <span>{sources.length - sources.filter((s) => hidden.includes(s.id)).length}/{sources.length}</span>}
      </button>
      {open && (
        <ul className="mt-3 max-h-64 space-y-1 overflow-auto text-sm">
          {!pro && <li className="mb-2 text-xs text-gold">{t("pro.unlock")}</li>}
          {sources.map((s) => (
            <li key={s.id}>
              <label className={`flex items-center gap-2 py-0.5 ${pro ? "cursor-pointer" : "opacity-50"}`}>
                <input type="checkbox" disabled={!pro} checked={!hidden.includes(s.id)} onChange={() => setHidden(hidden.includes(s.id) ? hidden.filter((x) => x !== s.id) : [...hidden, s.id])} className="accent-[var(--accent)]" />
                {s.name}
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Scores({ t }: { t: TFn }) {
  const [data, setData] = useState<{ live: { league: string; home: string; away: string; score: string; minute: number }[]; configured: boolean } | null>(null);
  useEffect(() => {
    const load = () => fetch("/api/scores").then((r) => r.json()).then(setData).catch(() => {});
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);
  return (
    <section className="card p-4">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted"><span className="live-dot h-2 w-2 rounded-full bg-accent" />{t("scores.title")}</h2>
      {!data ? <div className="skeleton h-16 rounded-lg" /> : !data.configured ? <p className="text-sm text-muted">{t("scores.setup")}</p> : data.live.length === 0 ? <p className="text-sm text-muted">{t("scores.none")}</p> : (
        <ul className="max-h-72 space-y-2 overflow-auto">
          {data.live.map((m, i) => (
            <li key={i} className="rounded-lg bg-surface-2 px-3 py-2 text-sm">
              <p className="text-[10px] uppercase tracking-wide text-muted">{m.league} · {m.minute}'</p>
              <p className="flex justify-between gap-2 font-medium"><span className="truncate">{m.home}</span><b className="tabular-nums">{m.score}</b><span className="truncate text-end">{m.away}</span></p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Reader({ a, t, pro, proEdition, locale, saved, speaking, onClose, onSave, onSpeak, onShare }: {
  a: Article; t: TFn; pro: boolean; proEdition: boolean; locale: string; saved: boolean; speaking: boolean;
  onClose: () => void; onSave: () => void; onSpeak: () => void; onShare: () => void;
}) {
  const [ai, setAi] = useState<{ state: "idle" | "loading" | "done" | "error"; text?: string }>({ state: "idle" });
  const summarize = async () => {
    setAi({ state: "loading" });
    try {
      const r = await fetch("/api/ai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: a.title, summary: a.summary, lang: locale }) });
      const d = await r.json();
      setAi(r.ok && d.text ? { state: "done", text: d.text } : { state: "error" });
    } catch { setAi({ state: "error" }); }
  };
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={t("reader.title")}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="drawer relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-bg shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-bg/90 px-5 py-3 backdrop-blur">
          <span className="text-xs font-bold uppercase tracking-widest text-muted">{t("reader.title")}</span>
          <button className="icon-btn" onClick={onClose} aria-label={t("card.close")}><X className="h-4 w-4" /></button>
        </div>
        <Cover a={a} className="h-56 w-full sm:h-72" />
        <div className="space-y-4 p-6">
          <Meta a={a} t={t} />
          <h2 className="font-serif text-2xl font-semibold leading-snug">{a.title}</h2>
          {a.summary && <p className="text-base leading-relaxed">{a.summary}</p>}
          <p className="text-xs text-muted">{t("reader.excerpt")}</p>

          <div className="flex flex-wrap gap-2">
            <a href={a.link} target="_blank" rel="noopener noreferrer nofollow" className="btn btn-accent">{t("card.openSource")} <ExternalLink className="h-4 w-4 rtl:-scale-x-100" /></a>
            <button className="btn btn-ghost" onClick={onSpeak}>{speaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}{speaking ? t("card.stop") : t("card.listen")}</button>
            <button className="btn btn-ghost" onClick={onSave}>{saved ? <BookmarkCheck className="h-4 w-4 text-accent" /> : <Bookmark className="h-4 w-4" />}{saved ? t("card.saved") : t("card.save")}</button>
            <button className="btn btn-ghost" onClick={onShare}><Share2 className="h-4 w-4" />{t("card.share")}</button>
          </div>

          {proEdition && (
            <section className="rounded-2xl border border-line p-4" style={{ background: "var(--gold-soft)" }}>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold"><Sparkles className="h-4 w-4 text-gold" />{t("reader.aiTitle")}<span className="rounded bg-gold px-1.5 text-[10px] font-bold text-white">{t("pro.badge")}</span></h3>
              {!pro ? (
                <Link href="/pricing" className="text-sm font-semibold text-accent hover:underline">{t("pro.unlock")} →</Link>
              ) : ai.state === "idle" ? (
                <button className="btn" onClick={summarize}><Sparkles className="h-4 w-4" />{t("reader.aiButton")}</button>
              ) : ai.state === "loading" ? (
                <p className="text-sm text-muted">{t("reader.aiLoading")}</p>
              ) : ai.state === "error" ? (
                <p className="text-sm text-muted">{t("reader.aiError")}</p>
              ) : (
                <><p className="whitespace-pre-line text-sm leading-relaxed">{ai.text}</p><p className="mt-2 text-[11px] text-muted">{t("reader.aiNote")}</p></>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
