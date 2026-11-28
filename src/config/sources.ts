export type Lang = "fr" | "en" | "ar" | "es";
export type Category = "world" | "maghreb" | "arab" | "business" | "tech" | "sport" | "science";
export type Region = "international" | "maghreb" | "middleEast" | "europe" | "americas" | "africa";

export interface NewsSource {
  id: string;
  name: string;
  country: string;
  region: Region;
  language: Lang;
  category: Category;
  rssUrl: string;
  siteUrl: string;
}

export const CATEGORIES: Category[] = ["world", "maghreb", "arab", "business", "tech", "sport", "science"];
export const REGIONS: Region[] = ["international", "europe", "americas", "africa", "maghreb", "middleEast"];
export const LANGS: Lang[] = ["fr", "en", "ar", "es"];

const s = (
  id: string, name: string, country: string, region: Region, language: Lang,
  category: Category, rssUrl: string, siteUrl: string
): NewsSource => ({ id, name, country, region, language, category, rssUrl, siteUrl });

/**
 * Flux RSS publics. Un flux en panne est ignoré automatiquement (Promise.allSettled),
 * ajoutez / retirez librement des lignes.
 */
export const NEWS_SOURCES: NewsSource[] = [
  // ── Français
  s("lemonde", "Le Monde", "France", "europe", "fr", "world", "https://www.lemonde.fr/rss/une.xml", "https://www.lemonde.fr"),
  s("france24-fr", "France 24", "France", "international", "fr", "world", "https://www.france24.com/fr/rss", "https://www.france24.com/fr/"),
  s("rfi-fr", "RFI", "France", "international", "fr", "world", "https://www.rfi.fr/fr/rss", "https://www.rfi.fr/fr/"),
  s("franceinfo", "franceinfo", "France", "europe", "fr", "world", "https://www.francetvinfo.fr/titres.rss", "https://www.francetvinfo.fr"),
  s("lesechos", "Les Échos", "France", "europe", "fr", "business", "https://services.lesechos.fr/rss/les-echos-economie.xml", "https://www.lesechos.fr"),
  s("lequipe", "L'Équipe", "France", "europe", "fr", "sport", "https://dwh.lequipe.fr/api/editions/FR/shared/channel/home/zone/v2/rss.xml", "https://www.lequipe.fr"),
  s("lemonde-afrique", "Le Monde Afrique", "France", "africa", "fr", "world", "https://www.lemonde.fr/afrique/rss_full.xml", "https://www.lemonde.fr/afrique/"),
  s("jeuneafrique", "Jeune Afrique", "France", "africa", "fr", "world", "https://www.jeuneafrique.com/feed/", "https://www.jeuneafrique.com"),
  s("kapitalis", "Kapitalis", "Tunisie", "maghreb", "fr", "maghreb", "https://kapitalis.com/tunisie/feed/", "https://kapitalis.com/tunisie/"),
  s("businessnews-tn", "Business News", "Tunisie", "maghreb", "fr", "maghreb", "https://www.businessnews.com.tn/rss.xml", "https://www.businessnews.com.tn"),
  s("lapresse-tn", "La Presse de Tunisie", "Tunisie", "maghreb", "fr", "maghreb", "https://lapresse.tn/feed/", "https://lapresse.tn"),
  s("tsa-dz", "TSA Algérie", "Algérie", "maghreb", "fr", "maghreb", "https://www.tsa-algerie.com/feed/", "https://www.tsa-algerie.com"),
  s("hespress-fr", "Hespress FR", "Maroc", "maghreb", "fr", "maghreb", "https://fr.hespress.com/feed", "https://fr.hespress.com"),
  s("france24-fr-eco", "France 24 Éco & Tech", "France", "international", "fr", "tech", "https://www.france24.com/fr/%C3%A9co-tech/rss", "https://www.france24.com/fr/%C3%A9co-tech/"),
  s("france24-fr-sport", "France 24 Sport", "France", "international", "fr", "sport", "https://www.france24.com/fr/sports/rss", "https://www.france24.com/fr/sports/"),
  // ── English
  s("bbc-world", "BBC News", "United Kingdom", "international", "en", "world", "https://feeds.bbci.co.uk/news/world/rss.xml", "https://www.bbc.com/news/world"),
  s("guardian-world", "The Guardian", "United Kingdom", "europe", "en", "world", "https://www.theguardian.com/world/rss", "https://www.theguardian.com/world"),
  s("nyt-world", "The New York Times", "USA", "americas", "en", "world", "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", "https://www.nytimes.com/section/world"),
  s("aljazeera-en", "Al Jazeera English", "Qatar", "middleEast", "en", "world", "https://www.aljazeera.com/xml/rss/all.xml", "https://www.aljazeera.com"),
  s("dw-en", "Deutsche Welle", "Germany", "europe", "en", "world", "https://rss.dw.com/rdf/rss-en-all", "https://www.dw.com/en/"),
  s("bbc-business", "BBC Business", "United Kingdom", "international", "en", "business", "https://feeds.bbci.co.uk/news/business/rss.xml", "https://www.bbc.com/news/business"),
  s("nyt-business", "NYT Business", "USA", "americas", "en", "business", "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", "https://www.nytimes.com/section/business"),
  s("bbc-tech", "BBC Technology", "United Kingdom", "international", "en", "tech", "https://feeds.bbci.co.uk/news/technology/rss.xml", "https://www.bbc.com/news/technology"),
  s("theverge", "The Verge", "USA", "americas", "en", "tech", "https://www.theverge.com/rss/index.xml", "https://www.theverge.com"),
  s("arstechnica", "Ars Technica", "USA", "americas", "en", "tech", "https://feeds.arstechnica.com/arstechnica/index", "https://arstechnica.com"),
  s("bbc-sport", "BBC Sport", "United Kingdom", "international", "en", "sport", "https://feeds.bbci.co.uk/sport/rss.xml", "https://www.bbc.com/sport"),
  s("guardian-sport", "Guardian Sport", "United Kingdom", "europe", "en", "sport", "https://www.theguardian.com/sport/rss", "https://www.theguardian.com/sport"),
  s("bbc-science", "BBC Science", "United Kingdom", "international", "en", "science", "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", "https://www.bbc.com/news/science_and_environment"),
  s("nyt-science", "NYT Science", "USA", "americas", "en", "science", "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml", "https://www.nytimes.com/section/science"),
  s("middleeasteye", "Middle East Eye", "UK", "middleEast", "en", "arab", "https://www.middleeasteye.net/rss", "https://www.middleeasteye.net"),
  // ── العربية
  s("aljazeera-ar", "الجزيرة", "قطر", "middleEast", "ar", "arab", "https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b4-532f-45ef-b135-bfdff8b8cab9", "https://www.aljazeera.net"),
  s("bbc-ar", "بي بي سي عربي", "المملكة المتحدة", "middleEast", "ar", "arab", "https://feeds.bbci.co.uk/arabic/rss.xml", "https://www.bbc.com/arabic"),
  s("france24-ar", "فرانس 24", "فرنسا", "middleEast", "ar", "arab", "https://www.france24.com/ar/rss", "https://www.france24.com/ar/"),
  s("rfi-ar", "مونت كارلو الدولية", "فرنسا", "middleEast", "ar", "world", "https://www.rfi.fr/ar/rss", "https://www.rfi.fr/ar/"),
  s("dw-ar", "دويتشه فيله", "ألمانيا", "europe", "ar", "world", "https://rss.dw.com/rdf/rss-ar-all", "https://www.dw.com/ar/"),
  s("aawsat", "الشرق الأوسط", "السعودية", "middleEast", "ar", "arab", "https://aawsat.com/feed", "https://aawsat.com"),
  s("hespress-ar", "هسبريس", "المغرب", "maghreb", "ar", "maghreb", "https://www.hespress.com/feed", "https://www.hespress.com"),
  // ── Español
  s("elpais", "El País", "España", "europe", "es", "world", "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada", "https://elpais.com"),
  s("bbc-mundo", "BBC Mundo", "Reino Unido", "international", "es", "world", "https://feeds.bbci.co.uk/mundo/rss.xml", "https://www.bbc.com/mundo"),
  s("france24-es", "France 24 Español", "Francia", "international", "es", "world", "https://www.france24.com/es/rss", "https://www.france24.com/es/"),
  s("dw-es", "DW Español", "Alemania", "europe", "es", "world", "https://rss.dw.com/rdf/rss-sp-all", "https://www.dw.com/es/"),
  s("marca", "Marca", "España", "europe", "es", "sport", "https://e00-marca.uecdn.es/rss/portada.xml", "https://www.marca.com"),
  s("expansion", "Expansión", "España", "europe", "es", "business", "https://e00-expansion.uecdn.es/rss/portada.xml", "https://www.expansion.com")
];
