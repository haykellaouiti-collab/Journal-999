export interface NewsSource {
  id: string;
  name: string;
  country: string;
  region: "international" | "maghreb" | "middleEast" | "europe";
  language: "fr" | "en" | "ar";
  category: "international" | "maghreb" | "middleEast" | "economy" | "tech" | "sport";
  rssUrl: string;
  siteUrl: string;
}

export const NEWS_SOURCES: NewsSource[] = [
  {
    id: "lemonde",
    name: "Le Monde",
    country: "France",
    region: "europe",
    language: "fr",
    category: "international",
    rssUrl: "https://www.lemonde.fr/rss/une.xml",
    siteUrl: "https://www.lemonde.fr"
  },
  {
    id: "france24-fr",
    name: "France 24",
    country: "France",
    region: "international",
    language: "fr",
    category: "international",
    rssUrl: "https://www.france24.com/fr/rss",
    siteUrl: "https://www.france24.com/fr/"
  },
  {
    id: "lesechos",
    name: "Les Échos",
    country: "France",
    region: "europe",
    language: "fr",
    category: "economy",
    rssUrl: "https://services.lesechos.fr/rss/les-echos-economie.xml",
    siteUrl: "https://www.lesechos.fr"
  },
  {
    id: "bbc-world",
    name: "BBC News World",
    country: "United Kingdom",
    region: "international",
    language: "en",
    category: "international",
    rssUrl: "https://feeds.bbci.co.uk/news/world/rss.xml",
    siteUrl: "https://www.bbc.com/news/world"
  },
  {
    id: "nytimes-world",
    name: "The New York Times",
    country: "USA",
    region: "international",
    language: "en",
    category: "international",
    rssUrl: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    siteUrl: "https://www.nytimes.com"
  },
  {
    id: "theverge",
    name: "The Verge",
    country: "USA",
    region: "international",
    language: "en",
    category: "tech",
    rssUrl: "https://www.theverge.com/rss/index.xml",
    siteUrl: "https://www.theverge.com"
  },
  {
    id: "aljazeera-ar",
    name: "الجزيرة نت (Al Jazeera)",
    country: "Qatar",
    region: "middleEast",
    language: "ar",
    category: "middleEast",
    rssUrl: "https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b4-532f-45ef-b135-bfdff8b8cab9",
    siteUrl: "https://www.aljazeera.net"
  },
  {
    id: "bbc-arabic",
    name: "BBC عربي",
    country: "International",
    region: "middleEast",
    language: "ar",
    category: "middleEast",
    rssUrl: "https://feeds.bbci.co.uk/arabic/rss.xml",
    siteUrl: "https://www.bbc.com/arabic"
  },
  {
    id: "france24-ar",
    name: "فرانس 24 عربي",
    country: "France",
    region: "middleEast",
    language: "ar",
    category: "international",
    rssUrl: "https://www.france24.com/ar/rss",
    siteUrl: "https://www.france24.com/ar/"
  },
  {
    id: "kapitalis",
    name: "Kapitalis Tunisie",
    country: "Tunisie",
    region: "maghreb",
    language: "fr",
    category: "maghreb",
    rssUrl: "https://kapitalis.com/tunisie/feed/",
    siteUrl: "https://kapitalis.com/tunisie/"
  },
  {
    id: "businessnews",
    name: "Business News Tunisie",
    country: "Tunisie",
    region: "maghreb",
    language: "fr",
    category: "economy",
    rssUrl: "https://www.businessnews.com.tn/rss.xml",
    siteUrl: "https://www.businessnews.com.tn"
  },
  {
    id: "lequipe",
    name: "L'Équipe",
    country: "France",
    region: "europe",
    language: "fr",
    category: "sport",
    rssUrl: "https://dwh.lequipe.fr/api/editions/FR/shared/channel/home/zone/v2/rss.xml",
    siteUrl: "https://www.lequipe.fr"
  }
];
