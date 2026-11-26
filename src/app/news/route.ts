import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import { NEWS_SOURCES } from "@/config/sources";

export const revalidate = 900; // Cache Vercel ISR 15 minutes

const parser = new Parser({
  timeout: 7000,
  headers: {
    "User-Agent": "Journal999-Newsstand/2.0 (+https://vercel.app)"
  }
});

export interface ArticleItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  pubDate: string;
  imageUrl: string | null;
  sourceId: string;
  sourceName: string;
  country: string;
  region: string;
  language: string;
  category: string;
}

function extractImage(item: Record<string, unknown>): string | null {
  const enclosure = item.enclosure as { url?: string } | undefined;
  if (enclosure?.url) return enclosure.url;

  const content = String(item["content:encoded"] || item.content || "");
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all";
  const region = searchParams.get("region") || "all";
  const lang = searchParams.get("lang") || "all";

  const filteredSources = NEWS_SOURCES.filter((src) => {
    if (category !== "all" && src.category !== category) return false;
    if (region !== "all" && src.region !== region) return false;
    if (lang !== "all" && src.language !== lang) return false;
    return true;
  });

  const results = await Promise.allSettled(
    filteredSources.map(async (source) => {
      const feed = await parser.parseURL(source.rssUrl);
      return (feed.items || []).slice(0, 8).map((item, idx): ArticleItem => {
        const rawSummary = (item.contentSnippet || item.summary || item.content || "")
          .replace(/<[^>]*>?/gm, "")
          .trim();

        return {
          id: `${source.id}-${idx}-${encodeURIComponent(item.link || item.title || String(idx)).slice(0, 32)}`,
          title: (item.title || "Sans titre").trim(),
          summary: rawSummary.slice(0, 260) + (rawSummary.length > 260 ? "..." : ""),
          link: item.link || source.siteUrl,
          pubDate: item.isoDate || item.pubDate || new Date().toISOString(),
          imageUrl: extractImage(item as unknown as Record<string, unknown>),
          sourceId: source.id,
          sourceName: source.name,
          country: source.country,
          region: source.region,
          language: source.language,
          category: source.category
        };
      });
    })
  );

  const articles: ArticleItem[] = results
    .filter((res): res is PromiseFulfilledResult<ArticleItem[]> => res.status === "fulfilled")
    .flatMap((res) => res.value)
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return NextResponse.json({
    count: articles.length,
    sourcesCount: filteredSources.length,
    articles
  });
}
