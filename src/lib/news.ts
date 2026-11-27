import Parser from "rss-parser";
import { NEWS_SOURCES, type NewsSource } from "@/config/sources";

export interface Article {
  id: string;
  title: string;
  summary: string;
  link: string;
  pubDate: string;
  image: string | null;
  sourceId: string;
  sourceName: string;
  country: string;
  region: string;
  language: string;
  category: string;
}

const parser = new Parser({
  customFields: { item: [["media:content", "media"], ["media:thumbnail", "thumb"]] }
});

const clean = (s: string) =>
  s.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, " ").trim();

function pickImage(item: Record<string, any>): string | null {
  const m = item.media?.$?.url || item.thumb?.$?.url || item.enclosure?.url;
  if (m && /^https?:/.test(m)) return m;
  const html = String(item["content:encoded"] || item.content || "");
  const r = html.match(/<img[^>]+src=["'](https?:[^"']+)["']/i);
  return r ? r[1] : null;
}

function hash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

async function readSource(src: NewsSource, perSource: number): Promise<Article[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(src.rssUrl, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Journal999/3.0 (+news reader)", Accept: "application/rss+xml, application/xml, text/xml, */*" },
      next: { revalidate: 600 }
    });
    if (!res.ok) return [];
    const feed = await parser.parseString(await res.text());
    return (feed.items || []).slice(0, perSource).map((it) => {
      const summary = clean(String(it.contentSnippet || it.summary || it.content || ""));
      const link = it.link || src.siteUrl;
      return {
        id: `${src.id}-${hash(link)}`,
        title: clean(it.title || ""),
        summary: summary.length > 220 ? summary.slice(0, 217).trimEnd() + "…" : summary,
        link,
        pubDate: it.isoDate || (it.pubDate ? new Date(it.pubDate).toISOString() : new Date().toISOString()),
        image: pickImage(it as any),
        sourceId: src.id,
        sourceName: src.name,
        country: src.country,
        region: src.region,
        language: src.language,
        category: src.category
      } satisfies Article;
    }).filter((a) => a.title.length > 3);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function demo(): Article[] {
  const now = Date.now();
  const base = ["Sommet mondial : les dirigeants s'accordent sur un nouveau cadre climatique", "Global markets rally as inflation cools across major economies", "تونس: انطلاق موسم جديد للطاقة الشمسية وسط اهتمام دولي", "La selección luce en el amistoso previo al torneo continental", "New open-source model beats rivals on reasoning benchmarks", "Mission spatiale : première image d'une exoplanète en haute résolution"];
  const langs = ["fr", "en", "ar", "es", "en", "fr"];
  const cats = ["world", "business", "maghreb", "sport", "tech", "science"];
  return Array.from({ length: 36 }, (_, i) => ({
    id: `demo-${i}`, title: `${base[i % 6]} (${i + 1})`,
    summary: "Extrait de démonstration : ce texte illustre la mise en page des cartes, avec un résumé court qui renvoie vers l'article original chez l'éditeur.",
    link: "https://example.com", pubDate: new Date(now - i * 17 * 60000).toISOString(),
    image: null, sourceId: "demo", sourceName: ["Le Monde", "BBC News", "الجزيرة", "El País", "The Verge", "France 24"][i % 6],
    country: "—", region: "international", language: langs[i % 6], category: cats[i % 6]
  }));
}

export async function getArticles(opts: { perSource?: number; max?: number } = {}): Promise<Article[]> {
  if (process.env.NEWS_DEMO === "1") return demo();
  const per = opts.perSource ?? 8;
  const lists = await Promise.all(NEWS_SOURCES.map((s) => readSource(s, per)));
  const seen = new Set<string>();
  const out: Article[] = [];
  for (const a of lists.flat().sort((x, y) => +new Date(y.pubDate) - +new Date(x.pubDate))) {
    const key = a.link.split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    // pas d'articles datés du futur (flux mal réglés)
    if (+new Date(a.pubDate) > Date.now() + 3600_000) a.pubDate = new Date().toISOString();
    out.push(a);
  }
  return out.slice(0, opts.max ?? 420);
}
