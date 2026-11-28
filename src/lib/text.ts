const STOP = new Set(("le la les un une des du de d l et en à au aux pour par sur dans avec sans est sont a ont ce cette ces qui que quoi dont où plus moins très pas ne se sa son ses leur leurs il elle ils elles nous vous on été être après avant entre sous contre selon comme mais ou donc car apres " +
  "the a an of and to in on for with by is are was were be been it its this that these those from as at or but not no new says say after over about into out up will has have had more than their they he she we you his her " +
  "de la el los las un una unos unas y o en con por para es son fue ser del al su sus que se no más como pero sobre tras " +
  "في من على إلى عن مع هذا هذه التي الذي أن إن كان قد لا ما هو هي بعد قبل بين حول خلال أكثر").split(/\s+/));

export function trending(titles: string[], n = 8): string[] {
  const count = new Map<string, number>();
  for (const t of titles) {
    const seen = new Set<string>();
    for (const w of t.toLowerCase().split(/[^\p{L}\p{N}'’-]+/u)) {
      const word = w.replace(/^['’-]+|['’-]+$/g, "");
      if (word.length < 4 || STOP.has(word) || /^\d+$/.test(word) || seen.has(word)) continue;
      seen.add(word);
      count.set(word, (count.get(word) || 0) + 1);
    }
  }
  return [...count.entries()].filter(([, c]) => c >= 3).sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w);
}

export function timeAgo(iso: string, t: (k: string, v?: Record<string, number>) => string): string {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 2) return t("now");
  if (m < 60) return t("min", { n: m });
  if (m < 1440) return t("hour", { n: Math.round(m / 60) });
  return t("day", { n: Math.round(m / 1440) });
}
