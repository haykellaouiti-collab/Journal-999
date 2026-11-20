const CFG = window.J999_CONFIG;
const GOOGLE_CLIENT_ID = CFG.GOOGLE_CLIENT_ID;
const ADSENSE_CLIENT = CFG.ADSENSE_CLIENT;
const FREE_LIMIT = CFG.FREE_LIMIT;
const FALLBACK_IMG = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400";

const TV_CHANNELS = [
  { name: "France 24 (Français)", lang: "FR", liveUrl: "https://www.france24.com/fr/direct", filterKey: "France 24" },
  { name: "France 24 (English)", lang: "EN", liveUrl: "https://www.france24.com/en/live", filterKey: "France 24" },
  { name: "France 24 (العربية)", lang: "AR", liveUrl: "https://www.france24.com/ar/%D8%A7%D9%84%D8%A8%D8%AB-%D8%A7%D9%84%D9%85%D8%A8%D8%A7%D8%B4%D8%B1", filterKey: "France 24" },
  { name: "الجزيرة مباشر (Al Jazeera Arabic)", lang: "AR", liveUrl: "https://www.aljazeera.net/live", filterKey: "Al Jazeera" },
  { name: "Al Jazeera English", lang: "EN", liveUrl: "https://www.aljazeera.com/live", filterKey: "Al Jazeera" },
  { name: "BBC News", lang: "EN", liveUrl: "https://www.bbc.com/news", filterKey: "BBC News" },
  { name: "Sky News", lang: "EN", liveUrl: "https://news.sky.com/watch-live", filterKey: "Sky News" },
  { name: "DW News", lang: "EN", liveUrl: "https://www.dw.com/en/live-tv/s-100825", filterKey: "DW" },
  { name: "Euronews", lang: "EN", liveUrl: "https://www.euronews.com/live", filterKey: "Euronews" },
  { name: "RTVE 24 Horas", lang: "ES", liveUrl: "https://www.rtve.es/play/canales/24h/", filterKey: "RTVE" },
  { name: "Tagesschau 24", lang: "DE", liveUrl: "https://www.tagesschau.de/multimedia/livestreams/index.html", filterKey: "Tagesschau" },
  { name: "RFI Monde", lang: "FR", liveUrl: "https://www.rfi.fr/fr/direct-monde", filterKey: "RFI" }
];

const state = {
  tab: "mondial",
  newspaper: "",
  liteMode: localStorage.getItem("j999_lite") === "true",
  user: null,
  me: { authenticated: false, isAdmin: false, isPremium: false },
  freeCount: parseInt(localStorage.getItem("j999_free") || "0", 10),
  articles: [],
  bookmarks: [],
  country: localStorage.getItem("j999_country") || "",
  viewStats: { total: 0, today: 0, sources: {} }
};
let fetchCtl = null;
let deferredInstall = null;

/* ---------- Utilitaires de sécurité ---------- */
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function safeUrl(u) {
  try {
    const x = new URL(u, location.href);
    return x.protocol === "http:" || x.protocol === "https:" ? x.href : "#";
  } catch (_) { return "#"; }
}
function timeAgo(iso) {
  if (!iso) return "";
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (isNaN(s)) return "";
  const rtf = new Intl.RelativeTimeFormat(window.getLang(), { numeric: "auto" });
  if (s < 3600) return rtf.format(-Math.max(1, Math.round(s / 60)), "minute");
  if (s < 86400) return rtf.format(-Math.round(s / 3600), "hour");
  return rtf.format(-Math.round(s / 86400), "day");
}
function toast(msg) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "fixed bottom-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-sm font-bold px-4 py-2 rounded-lg z-[60] shadow-lg";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.display = "block";
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.display = "none"; }, 2200);
}

/* ---------- Authentification Google ---------- */
function decodeJwtPayload(token) {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(atob(b64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
    return JSON.parse(json);
  } catch (_) { return null; }
}
function getToken() {
  const tok = sessionStorage.getItem("j999_token");
  if (!tok) return "";
  const p = decodeJwtPayload(tok);
  if (!p || p.exp * 1000 < Date.now() + 30000) {
    sessionStorage.removeItem("j999_token");
    return "";
  }
  return tok;
}
function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function loadMe() {
  if (!getToken()) {
    state.me = { authenticated: false, isAdmin: false, isPremium: false };
    return;
  }
  try {
    const r = await fetch("/api/me", { headers: authHeaders() });
    if (r.ok) state.me = await r.json();
  } catch (_) {}
}

window.handleGoogleCredential = async function (response) {
  const payload = decodeJwtPayload(response.credential);
  if (!payload || !payload.email) return;
  sessionStorage.setItem("j999_token", response.credential);
  state.user = { name: payload.name || payload.email, email: payload.email, picture: payload.picture || "" };
  localStorage.setItem("j999_user", JSON.stringify({ name: state.user.name }));
  await loadMe();
  updateAuthUI();
};

window.logoutUser = function () {
  sessionStorage.removeItem("j999_token");
  localStorage.removeItem("j999_user");
  state.user = null;
  state.me = { authenticated: false, isAdmin: false, isPremium: false };
  if (window.google?.accounts?.id) google.accounts.id.disableAutoSelect();
  updateAuthUI();
};

function updateAuthUI() {
  const signIn = document.getElementById("google-signin-btn");
  const badge = document.getElementById("user-badge");
  const adminBtn = document.getElementById("admin-badge");
  const authed = Boolean(state.user && getToken());

  if (signIn) signIn.classList.toggle("hidden", authed);
  if (badge) {
    badge.classList.toggle("hidden", !authed);
    badge.textContent = "";
    if (authed) {
      const plan = state.me.isAdmin ? "👑" : state.me.isPremium ? "⭐" : "👤";
      badge.append(`${plan} ${state.user.name} `);
      const b = document.createElement("button");
      b.className = "ms-2 underline text-red-300 hover:text-red-200";
      b.textContent = window.t("Logout");
      b.addEventListener("click", window.logoutUser);
      badge.appendChild(b);
    }
  }
  if (adminBtn) adminBtn.textContent = state.me.isAdmin ? "👑 Admin" : window.t("Admin");
}

window.openAdmin = function () {
  openModal();
  const c = document.getElementById("modal-content");
  c.textContent = state.me.isAdmin ? window.t("AdminOn") : window.t("AdminHint");
};

function initGoogleAuth() {
  if (!window.google?.accounts?.id) return setTimeout(initGoogleAuth, 600);
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: window.handleGoogleCredential,
    auto_select: true,
    cancel_on_tap_outside: true
  });
  const btn = document.getElementById("google-signin-btn");
  if (btn) google.accounts.id.renderButton(btn, { theme: "filled_black", size: "medium", shape: "pill" });
  if (!getToken()) google.accounts.id.prompt();
}

/* ---------- Favoris ---------- */
function loadBookmarks() {
  try { state.bookmarks = JSON.parse(localStorage.getItem("j999_bm") || "[]"); } catch (_) { state.bookmarks = []; }
}
function isBookmarked(url) { return state.bookmarks.some((b) => b.url === url); }
function toggleBookmark(art) {
  if (isBookmarked(art.url)) state.bookmarks = state.bookmarks.filter((b) => b.url !== art.url);
  else state.bookmarks.unshift({ title: art.title, description: art.description, url: art.url, image: art.image, publishedAt: art.publishedAt, source: art.source });
  state.bookmarks = state.bookmarks.slice(0, 100);
  try { localStorage.setItem("j999_bm", JSON.stringify(state.bookmarks)); } catch (_) {}
}

/* ---------- Partage ---------- */
async function shareArticle(art) {
  const data = { title: art.title, url: art.url };
  if (navigator.share) {
    try { await navigator.share(data); return; } catch (e) { if (e.name === "AbortError") return; }
  }
  try { await navigator.clipboard.writeText(art.url); toast(window.t("Copied")); }
  catch (_) { prompt("", art.url); }
}

/* ---------- Modes / onglets ---------- */
window.toggleLiteMode = function () {
  state.liteMode = !state.liteMode;
  localStorage.setItem("j999_lite", state.liteMode);
  updateModeButton();
  if (!["tv", "live"].includes(state.tab)) renderArticles(state.tab === "bookmarks" ? state.bookmarks : state.articles);
};
function updateModeButton() {
  const btn = document.getElementById("mode-btn");
  if (!btn) return;
  btn.textContent = state.liteMode ? window.t("ModeLite") : window.t("ModePro");
  btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold text-white " + (state.liteMode ? "bg-green-600" : "bg-purple-600");
}
function highlightTab() {
  document.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("tab-active", b.dataset.tab === state.tab));
}

window.setTab = function (tab) {
  state.tab = tab;
  state.newspaper = "";
  document.getElementById("newspaper-dropdown-container")?.classList.toggle("hidden", tab !== "journaux");
  const cc = document.getElementById("country-container");
  cc?.classList.toggle("hidden", tab !== "local");
  if (tab === "local") {
    const sel = document.getElementById("country-select");
    if (sel) {
      if (state.country) sel.value = state.country;
      state.country = sel.value;
    }
  }
  highlightTab();
  if (tab === "tv") return renderTvChannels();
  if (tab === "bookmarks") return renderArticles(state.bookmarks, "NoBookmarks");
  fetchNews();
};

window.onNewspaperChange = function (val) {
  state.newspaper = val;
  state.tab = "journaux";
  document.getElementById("newspaper-dropdown-container")?.classList.remove("hidden");
  highlightTab();
  fetchNews();
};

window.doSearch = () => {
  if (["tv", "live", "bookmarks"].includes(state.tab)) { state.tab = "mondial"; highlightTab(); }
  const q = document.getElementById("search-input")?.value.trim();
  const u = new URL(location.href);
  if (q) u.searchParams.set("q", q); else u.searchParams.delete("q");
  history.replaceState(null, "", u);
  fetchNews();
};

/* ---------- Rendu ---------- */
function renderTvChannels() {
  const grid = document.getElementById("articles-grid");
  grid.innerHTML = "";
  TV_CHANNELS.forEach((ch) => {
    const card = document.createElement("div");
    card.className = "bg-[#0d111a] border border-gray-800 rounded-xl p-5 flex flex-col gap-3 hover:border-yellow-500/50 transition";
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/40 px-2.5 py-0.5 rounded-full">● LIVE TV</span>
        <span class="text-xs font-bold text-gray-400">${esc(ch.lang)}</span>
      </div>
      <h3 class="text-lg font-bold text-white">${esc(ch.name)}</h3>
      <p class="text-sm text-gray-400">${esc(window.t("TvDesc"))}</p>
      <div class="mt-auto pt-3 flex gap-2">
        <a href="${esc(ch.liveUrl)}" target="_blank" rel="noopener noreferrer" class="flex-1 text-center text-xs bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-2.5 rounded-lg transition">${esc(window.t("WatchLive"))}</a>
        <button type="button" class="channel-news-btn text-xs bg-gray-800 hover:bg-gray-700 text-yellow-400 font-semibold px-3 py-2.5 rounded-lg transition">${esc(window.t("ArticlesBtn"))}</button>
      </div>`;
    card.querySelector(".channel-news-btn").addEventListener("click", () => window.onNewspaperChange(ch.filterKey));
    grid.appendChild(card);
  });
}

function renderLive(matches) {
  const grid = document.getElementById("articles-grid");
  grid.innerHTML = "";
  if (!matches.length) {
    grid.innerHTML = `<p class="col-span-full text-center text-gray-400 py-10">${esc(window.t("NoLive"))}</p>`;
    return;
  }
  matches.forEach((m) => {
    const card = document.createElement("div");
    card.className = "bg-[#0d111a] border border-red-500/40 rounded-xl p-5 flex flex-col gap-3 shadow-lg";
    const logo = (u) => (u ? `<img src="${esc(safeUrl(u))}" alt="" class="w-8 h-8 object-contain mx-auto mb-1" loading="lazy">` : "");
    card.innerHTML = `
      <div class="flex justify-between text-xs text-red-400 font-bold">
        <span>🏆 ${esc(m.league)} (${esc(m.country || "")})</span>
        <span class="animate-pulse bg-red-950 px-2 py-0.5 rounded">● LIVE ${esc(m.time)}</span>
      </div>
      <div class="flex justify-between items-center text-base font-bold text-white my-2">
        <span class="w-1/3 text-center">${logo(m.homeLogo)}${esc(m.home)}</span>
        <span class="w-1/3 text-center bg-gray-800 py-1.5 rounded text-yellow-400">${esc(m.score)}</span>
        <span class="w-1/3 text-center">${logo(m.awayLogo)}${esc(m.away)}</span>
      </div>`;
    grid.appendChild(card);
  });
}

function renderArticles(articles, emptyKey = "NoArticles") {
  const grid = document.getElementById("articles-grid");
  grid.innerHTML = "";
  if (!articles || !articles.length) {
    grid.innerHTML = `<p class="col-span-full text-center text-gray-400 py-10">${esc(window.t(emptyKey))}</p>`;
    return;
  }
  articles.forEach((art) => {
    const card = document.createElement("article");
    card.className = "bg-[#0d111a] border border-gray-800 rounded-xl overflow-hidden flex flex-col hover:border-yellow-500/50 transition";
    const href = safeUrl(art.url);
    const img = safeUrl(art.image || FALLBACK_IMG);
    const ago = timeAgo(art.publishedAt);
    card.innerHTML = `
      ${state.liteMode ? "" : `<img src="${esc(img)}" alt="" class="w-full h-44 object-cover" loading="lazy" referrerpolicy="no-referrer">`}
      <div class="p-4 flex flex-col flex-1 gap-2">
        <div class="flex justify-between items-center text-xs">
          <span class="font-bold text-yellow-400 uppercase">📰 ${esc(art.source?.name || "Web")}${viewsBadge(art.source?.name)}</span>
          <span class="text-gray-500">${esc(ago)}</span>
        </div>
        <h3 class="font-bold text-white leading-snug">${esc(art.title)}</h3>
        ${state.liteMode ? "" : `<p class="text-sm text-gray-400 line-clamp-2">${esc(art.description)}</p>`}
        <div class="mt-auto pt-3 flex gap-2">
          <a href="${esc(href)}" target="_blank" rel="noopener noreferrer" class="text-center text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded flex-1 text-gray-200">${esc(window.t("ReadArticle"))}</a>
          <button type="button" class="ai-btn text-xs bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 px-3 py-2 rounded flex-1 font-semibold">${esc(window.t("AiSummary"))}</button>
          <button type="button" class="bm-btn text-sm bg-gray-800 hover:bg-gray-700 px-2.5 py-2 rounded text-yellow-400" aria-label="${esc(window.t("Save"))}"></button>
          <button type="button" class="share-btn text-sm bg-gray-800 hover:bg-gray-700 px-2.5 py-2 rounded text-sky-400" aria-label="${esc(window.t("Share"))}">↗</button>
        </div>
      </div>`;

    const img$ = card.querySelector("img");
    if (img$) img$.addEventListener("error", () => { img$.src = FALLBACK_IMG; }, { once: true });
    const bm = card.querySelector(".bm-btn");
    const paint = () => { bm.textContent = isBookmarked(art.url) ? "★" : "☆"; };
    paint();
    bm.addEventListener("click", () => {
      toggleBookmark(art);
      paint();
      if (state.tab === "bookmarks") renderArticles(state.bookmarks, "NoBookmarks");
    });
    card.querySelector(".share-btn").addEventListener("click", () => shareArticle(art));
    card.querySelector("a").addEventListener("click", () => trackRead(art.source?.name));
    card.querySelector(".ai-btn").addEventListener("click", () => window.openAI(art.title || "", art.description || ""));
    grid.appendChild(card);
  });
}

async function fetchNews() {
  const grid = document.getElementById("articles-grid");
  if (!grid) return;
  grid.innerHTML = `<p class="col-span-full text-center py-12 text-yellow-400 animate-pulse">${esc(window.t("Loading"))}</p>`;
  if (fetchCtl) fetchCtl.abort();
  fetchCtl = new AbortController();

  const params = new URLSearchParams({
    tab: state.tab,
    newspaper: state.newspaper,
    query: document.getElementById("search-input")?.value || "",
    lang: window.getLang(),
    country: state.tab === "local" ? state.country : ""
  });
  try {
    const res = await fetch(`/api/news?${params}`, { signal: fetchCtl.signal });
    const data = await res.json();
    if (data.error) {
      grid.innerHTML = `<div class="col-span-full bg-red-900/30 border border-red-500 p-4 rounded-xl text-center text-red-300">${esc(data.error)}</div>`;
      return;
    }
    if (state.tab === "live") renderLive(data.live || []);
    else { state.articles = data.articles || []; renderArticles(state.articles); }
  } catch (e) {
    if (e.name === "AbortError") return;
    grid.innerHTML = `<p class="col-span-full text-center text-red-400 py-10">${esc(window.t("ConnError"))}</p>`;
  }
}

/* ---------- Modales ---------- */
function openModal() {
  const m = document.getElementById("modal");
  m.classList.remove("hidden");
  m.classList.add("flex");
}
window.closeModal = () => {
  const m = document.getElementById("modal");
  m.classList.add("hidden");
  m.classList.remove("flex");
};

window.openPricingModal = function () {
  openModal();
  const t = window.t;
  const list = (keys) => keys.map((k) => `<li>✓ ${esc(t(k).replace("{n}", FREE_LIMIT))}</li>`).join("");
  const checkout = window.j999Checkout(state.me.email) || "/pricing";
  const price = `${CFG.PRICE_USD} $ ${t("PerMonth")}`;
  document.getElementById("modal-content").innerHTML = `
    <div class="space-y-4 text-gray-200">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="border border-gray-700 rounded-xl p-4 bg-black/40">
          <div class="text-xs uppercase text-gray-400 font-bold">${esc(t("PlanFree"))}</div>
          <h3 class="font-bold text-white text-lg mt-1">${esc(t("PlanFreeName"))}</h3>
          <ul class="mt-3 space-y-1.5 text-xs text-gray-300">${list(["Free1", "Free2", "Free3", "Free4"])}</ul>
        </div>
        <div class="border-2 border-yellow-400 rounded-xl p-4 bg-yellow-500/10">
          <div class="text-xs uppercase text-yellow-400 font-bold">${esc(t("PlanRec"))}</div>
          <h3 class="font-bold text-yellow-400 text-lg mt-1">${esc(t("PlanPremName"))}</h3>
          <ul class="mt-3 space-y-1.5 text-xs text-gray-100">${list(["Prem1", "Prem2", "Prem3", "Prem4"])}</ul>
        </div>
      </div>
      ${state.me.authenticated ? "" : `<p class="text-xs text-yellow-300">${esc(t("LoginFirst"))}</p>`}
      <a href="${esc(checkout)}" ${checkout === "/pricing" ? "" : 'target="_blank" rel="noopener noreferrer"'} class="block text-center bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-300 transition">${esc(t("Subscribe"))} — ${esc(price)}</a>
    </div>`;
};

window.openAI = async function (title, desc) {
  openModal();
  const content = document.getElementById("modal-content");
  const unlimited = state.me.isAdmin || state.me.isPremium;
  if (!unlimited && state.freeCount >= FREE_LIMIT) return window.openPricingModal();

  content.innerHTML = `<p class="animate-pulse text-yellow-400">${esc(window.t("Loading"))}</p>`;
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ lang: window.getLang(), title, desc })
    });
    const data = await res.json();
    if (res.status === 402) return window.openPricingModal();
    if (!res.ok || !data.summary) {
      content.textContent = data.error || window.t("AiError");
      return;
    }
    content.innerHTML = "";
    const body = document.createElement("div");
    body.className = "whitespace-pre-line text-gray-200 leading-relaxed";
    body.textContent = data.summary;
    content.appendChild(body);
    if (!unlimited) {
      state.freeCount++;
      localStorage.setItem("j999_free", state.freeCount);
      const left = data.remaining ?? Math.max(0, FREE_LIMIT - state.freeCount);
      const foot = document.createElement("p");
      foot.className = "mt-4 text-xs text-gray-500";
      foot.textContent = `${left} ${window.t("Remaining")}`;
      content.appendChild(foot);
    }
  } catch (_) {
    content.textContent = window.t("AiError");
  }
};

/* ---------- Consentement publicitaire (AdSense) ---------- */
function loadAdsense() {
  if (document.getElementById("adsense-js") || state.me.isPremium || state.me.isAdmin) return;
  const s = document.createElement("script");
  s.id = "adsense-js";
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  document.head.appendChild(s);
}
function initConsent() {
  const c = localStorage.getItem("j999_consent");
  if (c === "yes") return loadAdsense();
  if (c === "no") return;
  const bar = document.createElement("div");
  bar.className = "fixed bottom-0 inset-x-0 z-[55] bg-[#0d111a] border-t border-gray-700 p-4 flex flex-wrap items-center justify-center gap-3 text-sm";
  bar.innerHTML = `<span>${esc(window.t("ConsentText"))} <a class="underline text-yellow-400" href="../privacy">${esc(window.t("Privacy"))}</a></span>`;
  const mk = (label, val, cls) => {
    const b = document.createElement("button");
    b.textContent = label;
    b.className = `px-4 py-1.5 rounded-lg font-bold ${cls}`;
    b.addEventListener("click", () => {
      localStorage.setItem("j999_consent", val);
      bar.remove();
      if (val === "yes") loadAdsense();
    });
    return b;
  };
  bar.append(mk(window.t("Accept"), "yes", "bg-yellow-400 text-black"), mk(window.t("Decline"), "no", "bg-gray-800 text-gray-200"));
  document.body.appendChild(bar);
}

/* ---------- Pays (journaux locaux) ---------- */
window.onCountryChange = function (val) {
  state.country = val;
  try { localStorage.setItem("j999_country", val); } catch (_) {}
  fetchNews();
};

/* ---------- Vues réelles (compteur serveur) ---------- */
function fmtNum(n) {
  return new Intl.NumberFormat(window.getLang()).format(n || 0);
}
function viewsBadge(name) {
  const n = state.viewStats.sources?.[name];
  return n ? ` <span class="text-gray-500 normal-case font-normal">· 👁 ${esc(fmtNum(n))}</span>` : "";
}
function renderViewTotal() {
  const el = document.getElementById("views-total");
  if (!el) return;
  el.textContent = state.viewStats.total ? `👁 ${fmtNum(state.viewStats.total)} ${window.t("ViewsLabel")}` : "";
  const top = document.getElementById("top-sources");
  if (top) {
    const entries = Object.entries(state.viewStats.sources || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
    top.textContent = entries.length ? `${window.t("TopSources")} : ` + entries.map(([k, v]) => `${k} (${fmtNum(v)})`).join(" · ") : "";
  }
}
async function loadViews() {
  try {
    const r = await fetch("/api/views");
    if (r.ok) state.viewStats = await r.json();
  } catch (_) {}
  renderViewTotal();
}
function postView(payload) {
  try {
    fetch("/api/views", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
  } catch (_) {}
}
function trackRead(name) {
  if (!name) return;
  postView({ source: String(name).slice(0, 60) });
  state.viewStats.sources[name] = (state.viewStats.sources[name] || 0) + 1;
}
function initViews() {
  try {
    if (!sessionStorage.getItem("j999_visit")) {
      sessionStorage.setItem("j999_visit", "1");
      postView({ type: "visit" });
    }
  } catch (_) {}
  loadViews();
}

/* ---------- PWA ---------- */
function initPwa() {
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstall = e;
    const b = document.getElementById("install-btn");
    if (b) { b.textContent = window.t("Install"); b.classList.remove("hidden"); }
  });
  document.getElementById("install-btn")?.addEventListener("click", async () => {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall = null;
    document.getElementById("install-btn").classList.add("hidden");
  });
}

/* ---------- Démarrage ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  loadBookmarks();
  updateModeButton();
  highlightTab();

  const saved = getToken();
  if (saved) {
    const p = decodeJwtPayload(saved);
    state.user = { name: p?.name || p?.email || "", email: p?.email || "", picture: p?.picture || "" };
    await loadMe();
  }
  updateAuthUI();
  initGoogleAuth();
  initConsent();
  initPwa();
  initViews();

  const input = document.getElementById("search-input");
  const q = new URLSearchParams(location.search).get("q");
  if (input && q) input.value = q;
  input?.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); window.doSearch(); } });

  fetchNews();

  // Rafraîchissement automatique : 60 s pour le live, 5 min sinon (uniquement onglet visible)
  let tick = 0;
  setInterval(() => {
    tick++;
    if (document.hidden || ["tv", "bookmarks"].includes(state.tab)) return;
    if (document.getElementById("modal").classList.contains("flex")) return;
    if (state.tab === "live" || tick % 5 === 0) fetchNews();
  }, 60000);
});
