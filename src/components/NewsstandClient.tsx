"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import {
  Newspaper,
  Search,
  Globe,
  Bookmark,
  Volume2,
  Square,
  BookOpen,
  ExternalLink,
  RefreshCw,
  Moon,
  Sun,
  LogIn,
  LogOut,
  X
} from "lucide-react";
import type { ArticleItem } from "@/app/api/news/route";

interface Props {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

const CATEGORIES = [
  "all",
  "international",
  "maghreb",
  "middleEast",
  "economy",
  "tech",
  "sport"
] as const;

export default function NewsstandClient({ user }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeRegion, setActiveRegion] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState<ArticleItem[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [readerArticle, setReaderArticle] = useState<ArticleItem | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("journal999_bookmarks");
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch {
        setBookmarks([]);
      }
    }
    const isDark = localStorage.getItem("journal999_theme") === "dark";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("journal999_theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: activeCategory,
        region: activeRegion
      });
      const res = await fetch(`/api/news?${params.toString()}`);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, activeRegion]);

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/") || `/${newLocale}`);
  };

  const toggleBookmark = (article: ArticleItem) => {
    const exists = bookmarks.some((b) => b.link === article.link);
    const updated = exists
      ? bookmarks.filter((b) => b.link !== article.link)
      : [article, ...bookmarks];
    setBookmarks(updated);
    localStorage.setItem("journal999_bookmarks", JSON.stringify(updated));
  };

  const handleSpeak = (article: ArticleItem) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speakingId === article.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${article.title}. ${article.summary}`);
    utterance.lang = article.language === "ar" ? "ar-SA" : article.language === "en" ? "en-US" : "fr-FR";
    utterance.onend = () => setSpeakingId(null);
    setSpeakingId(article.id);
    window.speechSynthesis.speak(utterance);
  };

  const displayedArticles = useMemo(() => {
    const base = showBookmarksOnly ? bookmarks : articles;
    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.sourceName.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
    );
  }, [articles, bookmarks, showBookmarksOnly, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{t("brand")}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{t("tagline")}</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute top-3 start-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full ps-9 pe-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Controls: Language, Bookmarks, Theme, Google Auth */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-xs font-semibold">
              {(["fr", "en", "ar"] as const).map((loc) => (
                <button
                  key={loc}
                  onClick={() => switchLocale(loc)}
                  className={`px-2.5 py-1.5 uppercase transition ${
                    locale === loc
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {loc === "ar" ? "عربي" : loc}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition ${
                showBookmarksOnly
                  ? "bg-amber-500 text-white border-amber-500"
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t("bookmarks")}</span>
              <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full text-[11px]">
                {bookmarks.length}
              </span>
            </button>

            <button
              onClick={toggleTheme}
              aria-label="Theme"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium hidden lg:inline">{user.name}</span>
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 hover:bg-red-600 hover:text-white transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t("signOut")}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t("signIn")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="max-w-7xl mx-auto px-4 pb-2.5 flex items-center justify-between gap-4 overflow-x-auto">
          <nav className="flex items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setShowBookmarksOnly(false);
                  setActiveCategory(cat);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  !showBookmarksOnly && activeCategory === cat
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {t(cat)}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Globe className="w-4 h-4 text-slate-400" />
            <select
              value={activeRegion}
              onChange={(e) => setActiveRegion(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5"
            >
              <option value="all">{t("allRegions")}</option>
              <option value="international">International</option>
              <option value="maghreb">Tunisie & Maghreb</option>
              <option value="middleEast">Moyen-Orient / Monde Arabe</option>
              <option value="europe">Europe</option>
            </select>

            <button
              onClick={fetchArticles}
              title={t("refresh")}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {loading ? (
          <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium">{t("loading")}</p>
          </div>
        ) : displayedArticles.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <p className="text-sm">{t("noResults")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedArticles.map((article) => {
              const isSaved = bookmarks.some((b) => b.link === article.link);
              const isSpeaking = speakingId === article.id;

              return (
                <article
                  key={article.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition"
                >
                  {article.imageUrl && (
                    <div className="h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2 text-xs mb-2.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                        {article.sourceName}
                      </span>
                      <span className="text-slate-400">
                        {new Date(article.pubDate).toLocaleDateString(locale)}
                      </span>
                    </div>

                    <h2 className="font-bold text-base leading-snug mb-2 line-clamp-2">
                      {article.title}
                    </h2>

                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 flex-1">
                      {article.summary}
                    </p>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setReaderArticle(article)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-xs font-medium flex items-center gap-1 transition"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{t("readerMode")}</span>
                        </button>

                        <button
                          onClick={() => handleSpeak(article)}
                          className={`p-1.5 rounded-lg border text-xs transition ${
                            isSpeaking
                              ? "bg-red-600 text-white border-red-600"
                              : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                          title={isSpeaking ? t("stopListening") : t("listen")}
                        >
                          {isSpeaking ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => toggleBookmark(article)}
                          className={`p-1.5 rounded-lg border text-xs transition ${
                            isSaved
                              ? "bg-amber-500 text-white border-amber-500"
                              : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                          title={isSaved ? t("saved") : t("save")}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>{t("readMore")}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Reader Mode Modal */}
      {readerArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-2xl w-full rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                {readerArticle.sourceName} · {readerArticle.country}
              </span>
              <button
                onClick={() => setReaderArticle(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-2xl font-bold mb-4 leading-tight">{readerArticle.title}</h2>
            <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300 mb-6">
              {readerArticle.summary}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReaderArticle(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium"
              >
                {t("close")}
              </button>
              <a
                href={readerArticle.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold flex items-center gap-2"
              >
                <span>{t("readMore")}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>{t("footerNote")}</p>
        <p className="mt-1">&copy; 2026 Journal 999</p>
      </footer>
    </div>
  );
}
