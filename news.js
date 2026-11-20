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
  es: {
    mondial: [
      { name: "BBC Mundo", url: "https://feeds.bbci.co.uk/mundo/rss.xml" },
      { name: "El País", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada" },
      { name: "DW Español", url: "https://rss.dw.com/rdf/rss-sp-all" }
    ],
    financial: [{ name: "El País Economía", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia/portada" }],
    economic: [{ name: "El País Economía", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia/portada" }],
    sport: [{ name: "Marca", url: "https://e00-marca.uecdn.es/rss/portada.xml" }],
    foot: [{ name: "Marca Fútbol", url: "https://e00-marca.uecdn.es/rss/futbol/primera-division.xml" }]
  },
  de: {
    mondial: [
      { name: "Tagesschau", url: "https://www.tagesschau.de/index~rss2.xml" },
      { name: "DW Deutsch", url: "https://rss.dw.com/rdf/rss-de-all" }
    ],
    financial: [{ name: "Tagesschau Wirtschaft", url: "https://www.tagesschau.de/wirtschaft/index~rss2.xml" }],
    economic: [{ name: "Tagesschau Wirtschaft", url: "https://www.tagesschau.de/wirtschaft/index~rss2.xml" }],
    sport: [{ name: "Sportschau", url: "https://www.sportschau.de/index~rss2.xml" }],
    foot: [{ name: "Sportschau Fußball", url: "https://www.sportschau.de/fussball/index~rss2.xml" }]
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
      { name: "الجزيرة", url: "https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b4-532f-45ef-b135-bfdff8b8cab9" },
      { name: "BBC عربي", url: "https://feeds.bbci.co.uk/arabic/rss.xml" },
      { name: "فرانس 24", url: "https://www.france24.com/ar/rss" }
    ],
    financial: [{ name: "BBC عربي", url: "https://feeds.bbci.co.uk/arabic/business/rss.xml" }],
    economic: [{ name: "BBC عربي", url: "https://feeds.bbci.co.uk/arabic/business/rss.xml" }],
    sport: [{ name: "BBC عربي رياضة", url: "https://feeds.bbci.co.uk/arabic/sports/rss.xml" }],
    foot: [{ name: "BBC عربي رياضة", url: "https://feeds.bbci.co.uk/arabic/sports/rss.xml" }]
  }
};

// Toutes les entrées du menu déroulant ont désormais un flux (avant : 6 sur 10 retombaient sur le flux "mondial")
const CHANNEL_FEEDS = {
  "France 24": { fr: "https://www.france24.com/fr/rss", en: "https://www.france24.com/en/rss", ar: "https://www.france24.com/ar/rss" },
  "Al Jazeera": {
    fr: "https://www.aljazeera.com/xml/rss/all.xml",
    en: "https://www.aljazeera.com/xml/rss/all.xml",
    ar: "https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b4-532f-45ef-b135-bfdff8b8cab9"
  },
  "BBC News": { fr: "https://feeds.bbci.co.uk/news/world/rss.xml", en: "https://feeds.bbci.co.uk/news/world/rss.xml", ar: "https://feeds.bbci.co.uk/arabic/rss.xml" },
  "RFI": { fr: "https://www.rfi.fr/fr/actualites/rss", en: "https://www.rfi.fr/en/rss", ar: "https://www.rfi.fr/ar/rss" },
  "Le Monde": { fr: "https://www.lemonde.fr/rss/une.xml", en: "https://www.lemonde.fr/en/rss/une.xml", ar: "https://www.lemonde.fr/rss/une.xml" },
  "Le Figaro": { fr: "https://www.lefigaro.fr/rss/figaro_actualites.xml", en: "https://www.lefigaro.fr/rss/figaro_actualites.xml", ar: "https://www.lefigaro.fr/rss/figaro_actualites.xml" },
  "The New York Times": { fr: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", en: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", ar: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml" },
  "Sky News": { fr: "https://feeds.skynews.com/feeds/rss/world.xml", en: "https://feeds.skynews.com/feeds/rss/world.xml", ar: "https://feeds.skynews.com/feeds/rss/world.xml" },
  "DW": {
    fr: "https://rss.dw.com/rdf/rss-fr-all", en: "https://rss.dw.com/rdf/rss-en-all", ar: "https://rss.dw.com/rdf/rss-ar-all",
    es: "https://rss.dw.com/rdf/rss-sp-all", de: "https://rss.dw.com/rdf/rss-de-all"
  },
  "Euronews": { en: "https://www.euronews.com/rss?format=mrss", fr: "https://fr.euronews.com/rss?format=mrss", es: "https://es.euronews.com/rss?format=mrss", de: "https://de.euronews.com/rss?format=mrss", ar: "https://arabic.euronews.com/rss?format=mrss" },
  "RTVE": { es: "https://www.rtve.es/api/noticias.rss", en: "https://www.rtve.es/api/noticias.rss" },
  "Tagesschau": { de: "https://www.tagesschau.de/index~rss2.xml", en: "https://www.tagesschau.de/index~rss2.xml" },
  "Echourouk": { fr: "https://www.echoroukonline.com/feed", en: "https://www.echoroukonline.com/feed", ar: "https://www.echoroukonline.com/feed" },
  "L'Équipe": { fr: "https://dwh.lequipe.fr/api/edito/rss?path=/", en: "https://dwh.lequipe.fr/api/edito/rss?path=/", ar: "https://dwh.lequipe.fr/api/edito/rss?path=/" },
  "Marca": { fr: "https://e00-marca.uecdn.es/rss/portada.xml", en: "https://e00-marca.uecdn.es/rss/portada.xml", ar: "https://e00-marca.uecdn.es/rss/portada.xml" }
};

// Journaux locaux par pays (flux RSS publics ; un flux indisponible est simplement ignoré)
const LOCAL_FEEDS = {
  FR: [
    { name: "Le Monde", url: "https://www.lemonde.fr/rss/une.xml" },
    { name: "Le Figaro", url: "https://www.lefigaro.fr/rss/figaro_actualites.xml" },
    { name: "France Info", url: "https://www.francetvinfo.fr/titres.rss" }
  ],
  DZ: [
    { name: "Echourouk", url: "https://www.echoroukonline.com/feed" },
    { name: "TSA Algérie", url: "https://www.tsa-algerie.com/feed/" },
    { name: "El Watan", url: "https://elwatan-dz.com/feed" }
  ],
  MA: [
    { name: "Hespress", url: "https://www.hespress.com/feed" },
    { name: "Le360", url: "https://fr.le360.ma/rss" },
    { name: "Morocco World News", url: "https://www.moroccoworldnews.com/feed" }
  ],
  TN: [
    { name: "Kapitalis", url: "https://kapitalis.com/feed/" },
    { name: "Tunisie Numérique", url: "https://www.tunisienumerique.com/feed/" }
  ],
  SA: [{ name: "Arab News", url: "https://www.arabnews.com/rss.xml" }],
  GB: [
    { name: "BBC UK", url: "https://feeds.bbci.co.uk/news/uk/rss.xml" },
    { name: "The Guardian UK", url: "https://www.theguardian.com/uk/rss" }
  ],
  US: [
    { name: "The New York Times", url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" },
    { name: "NPR", url: "https://feeds.npr.org/1001/rss.xml" }
  ],
  CA: [{ name: "CBC News", url: "https://www.cbc.ca/webfeed/rss/rss-topstories" }],
  ES: [
    { name: "El País", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada" },
    { name: "Marca", url: "https://e00-marca.uecdn.es/rss/portada.xml" }
  ],
  DE: [{ name: "Deutsche Welle", url: "https://rss.dw.com/rdf/rss-en-all" }],
  IT: [{ name: "ANSA", url: "https://www.ansa.it/sito/ansait_rss.xml" }],
  EG: [{ name: "Egypt Independent", url: "https://egyptindependent.com/feed/" }],
  AE: [{ name: "The National", url: "https://www.thenationalnews.com/arc/outboundfeeds/rss/?outputType=xml" }],
  IN: [
    { name: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms" },
    { name: "The Hindu", url: "https://www.thehindu.com/news/national/feeder/default.rss" }
  ],
  AU: [{ name: "ABC Australia", url: "https://www.abc.net.au/news/feed/51120/rss.xml" }],
  BR: [{ name: "G1", url: "https://g1.globo.com/rss/g1/" }],
  NG: [{ name: "Punch Nigeria", url: "https://punchng.com/feed/" }],
  ZA: [{ name: "News24", url: "https://feeds.news24.com/articles/news24/TopStories/rss" }],
  JP: [{ name: "NHK", url: "https://www3.nhk.or.jp/rss/news/cat0.xml" }]
};

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decodeXml(str) {
  return (str || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, n) => ENTITIES[n])
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function httpUrl(u) {
  try {
    const x = new URL(u);
    return x.protocol === "http:" || x.protocol === "https:" ? x.href : null;
  } catch (_) {
    return null;
  }
}

function parseRssXml(xml, sourceName) {
  const items = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  for (const block of blocks.slice(0, 15)) {
    const get = (tag) => block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"))?.[1];
    const rawDesc = get("description") || "";
    const mediaImg =
      block.match(/<media:content[^>]*url=["']([^"']+)["']/i)?.[1] ||
      block.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i)?.[1] ||
      block.match(/<enclosure[^>]*type=["']image[^"']*["'][^>]*url=["']([^"']+)["']/i)?.[1] ||
      block.match(/<enclosure[^>]*url=["']([^"']+)["']/i)?.[1] ||
      decodeXmlRaw(rawDesc).match(/<img[^>]*src=["']([^"']+)["']/i)?.[1];

    const title = decodeXml(get("title"));
    const url = httpUrl(decodeXml(get("link")));
    const dateRaw = decodeXml(get("pubDate") || get("dc:date"));
    const d = dateRaw ? new Date(dateRaw) : null;

    if (title && url) {
      items.push({
        title,
        description: decodeXml(rawDesc),
        url,
        image: mediaImg ? httpUrl(decodeXml(mediaImg)) : null,
        publishedAt: d && !isNaN(d) ? d.toISOString() : null,
        source: { name: sourceName }
      });
    }
  }
  return items;
}

function decodeXmlRaw(s) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
}

async function fetchOneFeed(feed) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: { "User-Agent": "Journal999Bot/3.0", Accept: "application/rss+xml, application/xml, text/xml" }
    });
    if (!res.ok) return [];
    return parseRssXml(await res.text(), feed.name);
  } catch (_) {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function dedupeSort(list) {
  const seen = new Set();
  const out = [];
  for (const a of list) {
    const k = a.url.split("?")[0];
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(a);
  }
  return out.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
}

async function fetchRssArticles(lang, tab, newspaper, query, country) {
  let feedList;
  if (tab === "local" && LOCAL_FEEDS[country]) {
    feedList = LOCAL_FEEDS[country];
  } else if (newspaper && CHANNEL_FEEDS[newspaper]) {
    const cf = CHANNEL_FEEDS[newspaper];
    feedList = [{ name: newspaper, url: cf[lang] || cf.en || Object.values(cf)[0] }];
  } else {
    const group = RSS_FEEDS[lang] || RSS_FEEDS.en;
    feedList = group[tab] || group.mondial;
  }

  // Flux récupérés en parallèle (avant : séquentiel, jusqu'à 15 s de latence)
  const results = dedupeSort((await Promise.all(feedList.map(fetchOneFeed))).flat());

  const terms = (query || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return results;
  return results.filter((a) => {
    const hay = `${a.title} ${a.description} ${a.source?.name || ""}`.toLowerCase();
    return terms.some((t) => hay.includes(t));
  });
}

export default async function handler(req, res) {
  const { tab = "mondial", newspaper = "", query = "", lang = "fr" } = req.query;
  const country = String(req.query.country || "").toUpperCase();
  const GNEWS_KEY = process.env.GNEWS_API_KEY;
  const FOOT_KEY = process.env.FOOTBALL_API_KEY;
  const apiLang = ["fr", "en", "ar", "es", "de"].includes(lang) ? lang : "en";
  const q = String(query).slice(0, 100);

  if (tab === "live") {
    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    if (!FOOT_KEY) return res.status(200).json({ live: [] });
    try {
      const r = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
        headers: { "x-apisports-key": FOOT_KEY }
      });
      const d = await r.json();
      const live = (d.response || []).slice(0, 24).map((m) => ({
        league: m.league.name,
        country: m.league.country,
        home: m.teams.home.name,
        away: m.teams.away.name,
        homeLogo: httpUrl(m.teams.home.logo),
        awayLogo: httpUrl(m.teams.away.logo),
        score: `${m.goals.home ?? 0} - ${m.goals.away ?? 0}`,
        time: `${m.fixture.status.elapsed || 0}'`
      }));
      return res.status(200).json({ live });
    } catch (_) {
      return res.status(502).json({ error: "Service scores indisponible." });
    }
  }

  res.setHeader("Cache-Control", "public, s-maxage=180, stale-while-revalidate=300");
  let articles = [];

  if (tab === "local") {
    if (!LOCAL_FEEDS[country]) return res.status(400).json({ error: "Pays non pris en charge." });
    articles = await fetchRssArticles(apiLang, tab, "", q, country);
    return res.status(200).json({ articles: articles.slice(0, 24) });
  }

  if (GNEWS_KEY) {
    let topic = q.trim();
    if (!topic) {
      topic =
        tab === "journaux" && newspaper ? newspaper
        : { financial: "finance", economic: "economy", sport: "sport", foot: "football" }[tab] || "world";
    }
    try {
      const g = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&lang=${apiLang}&max=12&apikey=${GNEWS_KEY}`
      );
      if (g.ok) {
        const gd = await g.json();
        articles = (gd.articles || [])
          .map((a) => ({
            title: a.title,
            description: a.description || "",
            url: httpUrl(a.url),
            image: httpUrl(a.image),
            publishedAt: a.publishedAt || null,
            source: { name: a.source?.name || "GNews" }
          }))
          .filter((a) => a.title && a.url);
      }
    } catch (_) {}
  }

  // Quand une chaîne précise est choisie, on privilégie son propre flux RSS
  if (articles.length < 4 || (newspaper && CHANNEL_FEEDS[newspaper])) {
    const rss = await fetchRssArticles(apiLang, tab, newspaper, q);
    articles = dedupeSort([...rss, ...articles]);
  }

  return res.status(200).json({ articles: articles.slice(0, 24) });
}
