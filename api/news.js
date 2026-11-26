// Journal 999 — API unique : actualités (GNews + RSS), résumé IA (Gemini), foot live.

const LANGS = ["fr", "en", "ar"];
const TABS = new Set(["mondial", "journaux", "financial", "economic", "sport", "foot", "live"]);
const MAX_ARTICLES = 15;
const RSS_TTL_MS = 120_000;

const AR_ECON = ["اقتصاد", "أسواق", "بورصة", "نفط", "أسعار", "دولار", "بنك", "تجارة", "استثمار", "مال"];
const AR_SPORT = ["رياضة", "كرة", "مباراة", "دوري", "بطولة", "كأس", "لاعب", "هدف", "فريق", "منتخب"];

const RSS_FEEDS = {
  fr: {
    mondial: [
      { name: "France 24", url: "https://www.france24.com/fr/rss" },
      { name: "RFI", url: "https://www.rfi.fr/fr/actualites/rss" }
    ],
    financial: [{ name: "France 24 Éco", url: "https://www.france24.com/fr/eco-tech/rss" }],
    economic: [{ name: "France 24 Éco", url: "https://www.france24.com/fr/eco-tech/rss" }],
    sport: [{ name: "France 24 Sport", url: "https://www.france24.com/fr/sports/rss" }],
    foot: [{ name: "France 24 Sport", url: "https://www.france24.com/fr/sports/rss" }]
  },
  en: {
    mondial: [
      { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
      { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
      { name: "France 24 EN", url: "https://www.france24.com/en/rss" }
    ],
    financial: [{ name: "BBC Business", url: "https://feeds.bbci.co.uk/news/business/rss.xml" }],
    economic: [{ name: "BBC Business", url: "https://feeds.bbci.co.uk/news/business/rss.xml" }],
    sport: [{ name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/rss.xml" }],
    foot: [{ name: "BBC Football", url: "https://feeds.bbci.co.uk/sport/football/rss.xml" }]
  },
  ar: {
    mondial: [
      { name: "الجزيرة Al Jazeera", url: "https://www.aljazeera.net/aljazeerarxml/rss.xml" },
      { name: "BBC عربي", url: "https://feeds.bbci.co.uk/arabic/rss.xml" },
      { name: "فرانس 24", url: "https://www.france24.com/ar/rss" }
    ],
    // Flux généralistes : on filtre par mots-clés pour que chaque onglet ait du sens.
    financial: [{ name: "الجزيرة اقتصاد", url: "https://www.aljazeera.net/aljazeerarxml/rss.xml", keywords: AR_ECON }],
    economic: [{ name: "BBC عربي", url: "https://feeds.bbci.co.uk/arabic/rss.xml", keywords: AR_ECON }],
    sport: [{ name: "الجزيرة رياضة", url: "https://www.aljazeera.net/aljazeerarxml/rss.xml", keywords: AR_SPORT }],
    foot: [{ name: "الجزيرة رياضة", url: "https://www.aljazeera.net/aljazeerarxml/rss.xml", keywords: AR_SPORT }]
  }
};

const same = (url) => ({ fr: url, en: url, ar: url });

const CHANNEL_FEEDS = {
  "France 24": {
    fr: "https://www.france24.com/fr/rss",
    en: "https://www.france24.com/en/rss",
    ar: "https://www.france24.com/ar/rss"
  },
  "Al Jazeera": {
    fr: "https://www.aljazeera.com/xml/rss/all.xml",
    en: "https://www.aljazeera.com/xml/rss/all.xml",
    ar: "https://www.aljazeera.net/aljazeerarxml/rss.xml"
  },
  "BBC News": {
    fr: "https://feeds.bbci.co.uk/news/world/rss.xml",
    en: "https://feeds.bbci.co.uk/news/world/rss.xml",
    ar: "https://feeds.bbci.co.uk/arabic/rss.xml"
  },
  RFI: {
    fr: "https://www.rfi.fr/fr/actualites/rss",
    en: "https://www.rfi.fr/en/rss",
    ar: "https://www.rfi.fr/ar/rss"
  },
  "Le Monde": same("https://www.lemonde.fr/rss/une.xml"),
  "Le Figaro": same("https://www.lefigaro.fr/rss/figaro_actualites.xml"),
  "The New York Times": same("https://rss.nytimes.com/services/xml/rss/nyt/World.xml"),
  "L'Équipe": same("https://www.lequipe.fr/rss/actu_rss.xml"),
  Marca: same("https://e00-marca.uecdn.es/rss/portada.xml"),
  Echourouk: same("https://www.echoroukonline.com/feed")
};

/* ---------- Utilitaires ---------- */

const first = (v) => (Array.isArray(v) ? v[0] : v);
const clean = (v, max) => String(first(v) ?? "").trim().slice(0, max);

function codePoint(n) {
  try {
    return String.fromCodePoint(n);
  } catch (_) {
    return "";
  }
}

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => codePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => codePoint(parseInt(d, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

const unwrapCdata = (s) => (s || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");

function htmlOf(s) {
  return decodeEntities(unwrapCdata(s));
}

function textOf(s) {
  return htmlOf(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function parseRssXml(xml, sourceName) {
  const items = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  for (const block of blocks.slice(0, MAX_ARTICLES)) {
    const pick = (tag) => block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"))?.[1];
    const title = textOf(pick("title"));
    const url = textOf(pick("link"));
    const descHtml = htmlOf(pick("description"));
    const description = descHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const image =
      block.match(/<media:content[^>]*url=["']([^"']+)["']/i)?.[1] ||
      block.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i)?.[1] ||
      block.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image/i)?.[1] ||
      descHtml.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ||
      null;

    if (title && /^https?:\/\//i.test(url)) {
      items.push({ title, description, url, image, source: { name: sourceName } });
    }
  }
  return items;
}

const rssCache = new Map();

async function fetchFeed(feed) {
  const hit = rssCache.get(feed.url);
  if (hit && Date.now() - hit.t < RSS_TTL_MS) return hit.items;

  const res = await fetch(feed.url, {
    signal: AbortSignal.timeout(5000),
    headers: { "User-Agent": "Journal999Bot/2.1", Accept: "application/rss+xml, application/xml, text/xml" }
  });
  if (!res.ok) throw new Error(`RSS ${res.status}`);
  let items = parseRssXml(await res.text(), feed.name);

  if (feed.keywords) {
    const filtered = items.filter((a) => {
      const hay = `${a.title} ${a.description}`;
      return feed.keywords.some((k) => hay.includes(k));
    });
    if (filtered.length >= 3) items = filtered;
  }

  rssCache.set(feed.url, { t: Date.now(), items });
  return items;
}

async function fetchRssArticles(lang, tab, newspaper, query) {
  let feeds;
  if (newspaper && CHANNEL_FEEDS[newspaper]) {
    feeds = [{ name: newspaper, url: CHANNEL_FEEDS[newspaper][lang] || CHANNEL_FEEDS[newspaper].en }];
  } else {
    const group = RSS_FEEDS[lang] || RSS_FEEDS.fr;
    feeds = group[tab] || group.mondial;
  }

  const settled = await Promise.allSettled(feeds.map(fetchFeed));
  let results = settled.flatMap((r) => (r.status === "fulfilled" ? r.value : []));

  // Si la chaîne choisie est indisponible, on se rabat sur le flux mondial.
  if (results.length === 0 && newspaper) {
    const group = RSS_FEEDS[lang] || RSS_FEEDS.fr;
    const fallback = await Promise.allSettled(group.mondial.map(fetchFeed));
    results = fallback.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  }

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return results;
  const filtered = results.filter((a) => {
    const hay = `${a.title} ${a.description} ${a.source?.name || ""}`.toLowerCase();
    return terms.some((t) => hay.includes(t));
  });
  return filtered.length > 0 ? filtered : results;
}

async function fetchGnews(key, topic, lang) {
  const url =
    `https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}` +
    `&lang=${lang}&max=12&apikey=${key}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.articles) ? data.articles : [];
}

function topicFor(tab, newspaper, query) {
  if (query) return query;
  if (tab === "journaux" && newspaper) return newspaper;
  return { financial: "finance", economic: "economy", sport: "sport", foot: "football" }[tab] || "world";
}

function mergeUnique(list, extra) {
  const seen = new Set(list.map((a) => a.url));
  for (const a of extra) {
    if (a?.url && !seen.has(a.url)) {
      seen.add(a.url);
      list.push(a);
    }
  }
  return list;
}

/* ---------- Gestionnaires ---------- */

async function handleAi(req, res, lang) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(500).json({ error: "Clé GEMINI_API_KEY manquante dans Vercel." });
  }
  const title = clean(req.query.title, 300);
  const desc = clean(req.query.desc, 1500);
  if (!title) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(400).json({ error: "Titre manquant." });
  }

  const label = { fr: "français", en: "anglais", ar: "arabe" }[lang];
  const prompt = `Tu es un rédacteur en chef international. Traduis si nécessaire et résume cet article intégralement en ${label} en 3 points clés clairs, factuels et percutants. N'utilise aucune autre langue que le ${label}.
Titre : ${title}
Détails : ${desc}`;

  try {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      signal: AbortSignal.timeout(20000),
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, thinkingConfig: { thinkingBudget: 0 } }
      })
    });
    const data = await r.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!r.ok || !summary) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(502).json({ error: "Résumé indisponible pour cet article." });
    }
    // Un même article donne le même résumé : le CDN évite des appels Gemini inutiles.
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json({ summary });
  } catch (_) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({ error: "Résumé indisponible pour cet article." });
  }
}

async function handleLive(res) {
  const key = process.env.FOOTBALL_API_KEY;
  if (!key) {
    res.setHeader("Cache-Control", "public, s-maxage=60");
    return res.status(200).json({ live: [] });
  }
  try {
    const r = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
      signal: AbortSignal.timeout(6000),
      headers: { "x-apisports-key": key }
    });
    if (!r.ok) throw new Error(`football ${r.status}`);
    const data = await r.json();
    const live = (data.response || []).slice(0, 18).map((m) => ({
      league: m.league?.name,
      country: m.league?.country,
      home: m.teams?.home?.name,
      away: m.teams?.away?.name,
      score: `${m.goals?.home ?? 0} - ${m.goals?.away ?? 0}`,
      time: `${m.fixture?.status?.elapsed || 0}'`
    }));
    res.setHeader("Cache-Control", "public, s-maxage=20, stale-while-revalidate=40");
    return res.status(200).json({ live });
  } catch (_) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({ error: "Scores indisponibles pour le moment." });
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const lang = LANGS.includes(first(req.query.lang)) ? first(req.query.lang) : "fr";
  if (first(req.query.action) === "ai") return handleAi(req, res, lang);

  const tab = TABS.has(first(req.query.tab)) ? first(req.query.tab) : "mondial";
  if (tab === "live") return handleLive(res);

  const newspaper = clean(req.query.newspaper, 60);
  const query = clean(req.query.query, 100);
  const gnewsKey = process.env.GNEWS_API_KEY;
  const rssFirst = tab === "journaux" && newspaper && CHANNEL_FEEDS[newspaper] && !query;

  let articles = [];
  const viaGnews = async () => {
    if (!gnewsKey) return;
    try {
      mergeUnique(articles, await fetchGnews(gnewsKey, topicFor(tab, newspaper, query), lang));
    } catch (_) {
      // GNews indisponible : on continue avec les flux RSS.
    }
  };
  const viaRss = async () => mergeUnique(articles, await fetchRssArticles(lang, tab, newspaper, query));

  if (rssFirst) {
    await viaRss();
    if (articles.length < 4) await viaGnews();
  } else {
    await viaGnews();
    if (articles.length < 4) await viaRss();
  }

  articles = articles.slice(0, MAX_ARTICLES);
  res.setHeader(
    "Cache-Control",
    articles.length > 0 ? "public, s-maxage=180, stale-while-revalidate=300" : "public, s-maxage=30"
  );
  return res.status(200).json({ articles });
}
