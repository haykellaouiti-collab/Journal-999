"use strict";

/* ====== Configuration ====== */
const ADMIN_EMAIL = "haykellaouiti@gmail.com";
const GOOGLE_CLIENT_ID = "VOTRE_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
const DODO_CHECKOUT_URL = "https://checkout.dodopayments.com/buy/VOTRE_LIEN_DODO";
const FREE_LIMIT = 15;
const LIVE_REFRESH_MS = 60000;
const FALLBACK_IMG = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400";

const TV_CHANNELS = [
  {
    name: "France 24 (Français)",
    lang: "FR",
    desc: "Chaîne française d'information internationale en continu.",
    liveUrl: "https://www.france24.com/fr/direct",
    filterKey: "France 24"
  },
  {
    name: "France 24 (العربية)",
    lang: "AR",
    desc: "البث المباشر لقناة فرانس 24 الناطقة بالعربية.",
    liveUrl: "https://www.france24.com/ar/%D8%A7%D9%84%D8%A8%D8%AB-%D8%A7%D9%84%D9%85%D8%A8%D8%A7%D8%B4%D8%B1",
    filterKey: "France 24"
  },
  {
    name: "الجزيرة مباشر (Al Jazeera Arabic)",
    lang: "AR",
    desc: "البث الحي والمباشر لشبكة الجزيرة الإخبارية.",
    liveUrl: "https://www.aljazeera.net/live",
    filterKey: "Al Jazeera"
  },
  {
    name: "Al Jazeera English",
    lang: "EN",
    desc: "24/7 international news coverage and live broadcast.",
    liveUrl: "https://www.aljazeera.com/live",
    filterKey: "Al Jazeera"
  },
  {
    name: "BBC News",
    lang: "EN",
    desc: "Global breaking news and live world coverage.",
    liveUrl: "https://www.bbc.com/news",
    filterKey: "BBC News"
  },
  {
    name: "RFI Monde",
    lang: "FR",
    desc: "Radio France Internationale — Actualités mondiales et direct.",
    liveUrl: "https://www.rfi.fr/fr/direct-monde",
    filterKey: "RFI"
  }
];

/* ====== Utilitaires ====== */
const $ = (id) => document.getElementById(id);

const LS = {
  get(k) {
    try {
      return localStorage.getItem(k);
    } catch (_) {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (_) {}
  },
  del(k) {
    try {
      localStorage.removeItem(k);
    } catch (_) {}
  }
};

function parseJson(s, fallback) {
  try {
    return JSON.parse(s);
  } catch (_) {
    return fallback;
  }
}

const HTML_ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => HTML_ESC[c]);

function safeUrl(u) {
  try {
    const p = new URL(u);
    return p.protocol === "http:" || p.protocol === "https:" ? p.href : "#";
  } catch (_) {
    return "#";
  }
}

/* ====== État ====== */
const storedUser = parseJson(LS.get("j999_user"), null);

const state = {
  tab: "mondial",
  newspaper: "",
  view: "articles", // articles | tv | live
  liteMode: LS.get("j999_lite") === "true",
  user: storedUser && typeof storedUser.email === "string" ? storedUser : null,
  isPremium: LS.get("j999_premium") === "true",
  freeCount: parseInt(LS.get("j999_free") || "0", 10) || 0,
  articles: []
};

// Ancienne clé : l'accès admin ne dépend plus d'une valeur modifiable dans le navigateur.
LS.del("j999_admin");

const isAdmin = () => !!state.user && state.user.email === ADMIN_EMAIL;

/* ====== Authentification Google ====== */
// Le jeton n'est décodé que pour l'affichage. Toute règle d'accès réelle doit être vérifiée côté serveur.
function decodeJwtPayload(token) {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (_) {
    return null;
  }
}

window.handleGoogleCredential = function (response) {
  const payload = decodeJwtPayload(response.credential);
  if (!payload || !payload.email) return;
  state.user = {
    name: payload.name || payload.email,
    email: payload.email,
    picture: payload.picture || ""
  };
  LS.set("j999_user", JSON.stringify(state.user));
  updateAuthUI();
};

window.logoutUser = function () {
  LS.del("j999_user");
  state.user = null;
  try {
    window.google?.accounts?.id?.disableAutoSelect();
  } catch (_) {}
  updateAuthUI();
  initGoogleAuth();
};

function updateAuthUI() {
  const signIn = $("google-signin-btn");
  const badge = $("user-badge");
  const adminBtn = $("admin-badge");

  if (state.user) {
    signIn?.classList.add("hidden");
    if (badge) {
      badge.classList.remove("hidden");
      badge.textContent = "👤 " + state.user.name + " ";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ms-2 underline text-red-300 hover:text-red-200";
      btn.textContent = window.t("Logout");
      btn.addEventListener("click", window.logoutUser);
      badge.appendChild(btn);
    }
  } else {
    signIn?.classList.remove("hidden");
    badge?.classList.add("hidden");
  }

  if (adminBtn) adminBtn.textContent = isAdmin() ? "👑 Admin" : window.t("Admin");
}

function initGoogleAuth(attempt = 0) {
  if (GOOGLE_CLIENT_ID.startsWith("VOTRE_")) return;
  if (!window.google?.accounts?.id) {
    if (attempt < 20) setTimeout(() => initGoogleAuth(attempt + 1), 500);
    return;
  }
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: window.handleGoogleCredential
  });
  const btnEl = $("google-signin-btn");
  if (btnEl && !state.user) {
    btnEl.innerHTML = "";
    google.accounts.id.renderButton(btnEl, { theme: "filled_black", size: "medium", shape: "pill" });
  }
}

window.openAdmin = function () {
  alert(isAdmin() ? window.t("AdminOn") : window.t("AdminHint"));
};

/* ====== Interface : onglets, mode, modale ====== */
function updateModeButton() {
  const btn = $("mode-btn");
  if (!btn) return;
  btn.textContent = state.liteMode ? window.t("ModeLite") : window.t("ModePro");
  btn.className = state.liteMode
    ? "px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white"
    : "px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 text-white";
}

window.toggleLiteMode = function () {
  state.liteMode = !state.liteMode;
  LS.set("j999_lite", String(state.liteMode));
  updateModeButton();
  if (state.view === "articles") renderArticles(state.articles);
};

function updateTabUI() {
  document.querySelectorAll(".tab-btn").forEach((b) => {
    const active = b.dataset.tab === state.tab;
    b.classList.toggle("bg-gray-800", active);
    b.classList.toggle("ring-1", active);
    b.classList.toggle("ring-yellow-400/60", active);
    b.setAttribute("aria-current", active ? "page" : "false");
  });
  const box = $("newspaper-dropdown-container");
  if (box) box.classList.toggle("hidden", state.tab !== "journaux");
}

window.setTab = function (tab) {
  state.tab = tab;
  state.newspaper = "";
  const sel = $("newspaper-select");
  if (sel) sel.value = "";
  updateTabUI();

  if (tab === "tv") {
    abortPending();
    state.view = "tv";
    renderTvChannels();
    return;
  }
  fetchNews();
};

window.onNewspaperChange = function (val) {
  state.newspaper = val;
  state.tab = "journaux";
  const sel = $("newspaper-select");
  if (sel) sel.value = val;
  updateTabUI();
  fetchNews();
};

window.doSearch = function () {
  if (state.tab === "tv" || state.tab === "live") state.tab = "mondial";
  updateTabUI();
  fetchNews();
};

function openModal() {
  const m = $("modal");
  m?.classList.remove("hidden");
  m?.classList.add("flex");
}

let aiRequestId = 0;

window.closeModal = function () {
  aiRequestId++; // ignore une réponse IA qui arriverait après la fermeture
  const m = $("modal");
  m?.classList.add("hidden");
  m?.classList.remove("flex");
};

function setModalText(text, isError) {
  const content = $("modal-content");
  if (!content) return;
  const div = document.createElement("div");
  div.className = isError ? "text-red-400" : "whitespace-pre-line text-gray-200 leading-relaxed";
  div.textContent = text;
  content.replaceChildren(div);
}

/* ====== Rendu ====== */
function renderTvChannels() {
  const grid = $("articles-grid");
  if (!grid) return;
  grid.replaceChildren();

  TV_CHANNELS.forEach((ch) => {
    const card = document.createElement("div");
    card.className =
      "bg-[#0d111a] border border-gray-800 rounded-xl p-5 flex flex-col gap-3 hover:border-yellow-500/50 transition";
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/40 px-2.5 py-0.5 rounded-full">● LIVE TV</span>
        <span class="text-xs font-bold text-gray-400">${esc(ch.lang)}</span>
      </div>
      <h3 class="text-lg font-bold text-white">${esc(ch.name)}</h3>
      <p class="text-sm text-gray-400">${esc(ch.desc)}</p>
      <div class="mt-auto pt-3 flex gap-2">
        <a href="${esc(safeUrl(ch.liveUrl))}" target="_blank" rel="noopener noreferrer"
           class="flex-1 text-center text-xs bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-2.5 rounded-lg transition">
          ${esc(window.t("WatchLive"))}
        </a>
        <button type="button"
           class="channel-news-btn text-xs bg-gray-800 hover:bg-gray-700 text-yellow-400 font-semibold px-3 py-2.5 rounded-lg transition">
          📰 ${esc(window.t("BtnArticles"))}
        </button>
      </div>`;
    card.querySelector(".channel-news-btn").addEventListener("click", () => {
      window.onNewspaperChange(ch.filterKey);
    });
    grid.appendChild(card);
  });
}

function renderLive(matches) {
  const grid = $("articles-grid");
  grid.replaceChildren();
  if (!matches || matches.length === 0) {
    grid.innerHTML = `<p class="col-span-full text-center text-gray-400 py-10">${esc(window.t("NoLive"))}</p>`;
    return;
  }

  matches.forEach((m) => {
    const card = document.createElement("div");
    card.className = "bg-[#0d111a] border border-red-500/40 rounded-xl p-5 flex flex-col gap-3 shadow-lg";
    card.innerHTML = `
      <div class="flex justify-between text-xs text-red-400 font-bold">
        <span>🏆 ${esc(m.league)} (${esc(m.country || "")})</span>
        <span class="animate-pulse bg-red-950 px-2 py-0.5 rounded">● LIVE ${esc(m.time)}</span>
      </div>
      <div class="flex justify-between items-center text-lg font-bold text-white my-2">
        <span class="w-1/3 text-start">${esc(m.home)}</span>
        <span class="w-1/3 text-center bg-gray-800 py-1.5 rounded text-yellow-400">${esc(m.score)}</span>
        <span class="w-1/3 text-end">${esc(m.away)}</span>
      </div>`;
    grid.appendChild(card);
  });
}

function renderArticles(articles) {
  const grid = $("articles-grid");
  if (!grid) return;
  grid.replaceChildren();
  if (!articles || articles.length === 0) {
    grid.innerHTML = `<p class="col-span-full text-center text-gray-400 py-10">${esc(window.t("NoArticles"))}</p>`;
    return;
  }

  const frag = document.createDocumentFragment();
  articles.forEach((art) => {
    const card = document.createElement("article");
    card.className =
      "bg-[#0d111a] border border-gray-800 rounded-xl overflow-hidden flex flex-col hover:border-yellow-500/50 transition";

    const imgHtml = state.liteMode
      ? ""
      : `<img src="${esc(safeUrl(art.image || FALLBACK_IMG))}" alt="" referrerpolicy="no-referrer"
              class="w-full h-44 object-cover" loading="lazy" decoding="async">`;

    card.innerHTML = `
      ${imgHtml}
      <div class="p-4 flex flex-col flex-1 gap-2">
        <span class="text-xs font-bold text-yellow-400 uppercase">📰 ${esc(art.source?.name || "Web")}</span>
        <h3 class="font-bold text-white leading-snug">${esc(art.title)}</h3>
        ${state.liteMode ? "" : `<p class="text-sm text-gray-400 line-clamp-2">${esc(art.description)}</p>`}
        <div class="mt-auto pt-3 flex gap-2">
          <a href="${esc(safeUrl(art.url))}" target="_blank" rel="noopener noreferrer"
             class="text-center text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded flex-1 text-gray-200">
            ${esc(window.t("ReadArticle"))}
          </a>
          <button type="button"
             class="ai-btn text-xs bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 px-3 py-2 rounded flex-1 font-semibold">
            ${esc(window.t("AiSummary"))}
          </button>
        </div>
      </div>`;

    const img = card.querySelector("img");
    if (img) img.addEventListener("error", () => { img.src = FALLBACK_IMG; }, { once: true });
    card.querySelector(".ai-btn").addEventListener("click", () => {
      window.openAI(art.title || "", art.description || "");
    });
    frag.appendChild(card);
  });
  grid.appendChild(frag);
}

/* ====== Chargement des actualités ====== */
let currentController = null;

function abortPending() {
  if (currentController) currentController.abort();
  currentController = null;
}

async function fetchNews({ silent = false } = {}) {
  const grid = $("articles-grid");
  if (!grid) return;

  abortPending();
  const controller = new AbortController();
  currentController = controller;

  if (!silent) {
    grid.innerHTML = `<p class="col-span-full text-center py-12 text-yellow-400 animate-pulse">${esc(window.t("Loading"))}</p>`;
  }

  const params = new URLSearchParams({
    tab: state.tab,
    newspaper: state.newspaper,
    query: $("search-input")?.value || "",
    lang: window.getLang()
  });

  try {
    const res = await fetch(`/api/news?${params}`, { signal: controller.signal });
    const data = await res.json();

    if (!res.ok || data.error) {
      if (!silent) {
        grid.innerHTML = `<div class="col-span-full bg-red-900/30 border border-red-500 p-4 rounded-xl text-center text-red-300">${esc(data.error || window.t("ErrServer"))}</div>`;
      }
      return;
    }

    if (state.tab === "live") {
      state.view = "live";
      renderLive(data.live || []);
    } else {
      state.view = "articles";
      state.articles = data.articles || [];
      renderArticles(state.articles);
    }
  } catch (e) {
    if (e.name === "AbortError") return;
    if (!silent) {
      grid.innerHTML = `<p class="col-span-full text-center text-red-400 py-10">${esc(window.t("ErrServer"))}</p>`;
    }
  } finally {
    if (currentController === controller) currentController = null;
  }
}

/* ====== Résumé IA et tarifs ====== */
window.openPricingModal = function () {
  const content = $("modal-content");
  if (!content) return;
  openModal();

  const t = window.t;
  content.innerHTML = `
    <div class="space-y-4 text-gray-200">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="border border-gray-700 rounded-xl p-4 bg-black/40">
          <div class="text-xs uppercase text-gray-400 font-bold">${esc(t("PriceFreeTag"))}</div>
          <h3 class="font-bold text-white text-lg mt-1">${esc(t("PriceFreeName"))}</h3>
          <ul class="mt-3 space-y-1.5 text-xs text-gray-300">
            <li>✓ ${esc(t("PriceFree1"))}</li>
            <li>✓ ${esc(t("PriceFree2"))}</li>
            <li>✓ ${esc(t("PriceFree3").replace("{n}", FREE_LIMIT))}</li>
            <li>✓ ${esc(t("PriceFree4"))}</li>
          </ul>
        </div>
        <div class="border-2 border-yellow-400 rounded-xl p-4 bg-yellow-500/10">
          <div class="text-xs uppercase text-yellow-400 font-bold">${esc(t("PricePremTag"))}</div>
          <h3 class="font-bold text-yellow-400 text-lg mt-1">${esc(t("PricePremName"))}</h3>
          <ul class="mt-3 space-y-1.5 text-xs text-gray-100">
            <li>✓ ${esc(t("PricePrem1"))}</li>
            <li>✓ ${esc(t("PricePrem2"))}</li>
            <li>✓ ${esc(t("PricePrem3"))}</li>
            <li>✓ ${esc(t("PricePrem4"))}</li>
          </ul>
        </div>
      </div>
      <a href="${esc(safeUrl(DODO_CHECKOUT_URL))}" target="_blank" rel="noopener noreferrer"
         class="block text-center bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-300 transition">
        ${esc(t("Subscribe"))}
      </a>
    </div>`;
};

window.openAI = async function (title, desc) {
  const hasUnlimitedAccess = isAdmin() || state.isPremium;
  if (!hasUnlimitedAccess && state.freeCount >= FREE_LIMIT) {
    window.openPricingModal();
    return;
  }

  openModal();
  const myId = ++aiRequestId;
  const content = $("modal-content");
  content.innerHTML = `<p class="animate-pulse text-yellow-400">${esc(window.t("Loading"))}</p>`;

  const params = new URLSearchParams({ action: "ai", lang: window.getLang(), title, desc });
  try {
    const res = await fetch(`/api/news?${params}`);
    const data = await res.json();
    if (myId !== aiRequestId) return;

    if (!res.ok || !data.summary) {
      setModalText(data.error || window.t("ErrAi"), true);
      return;
    }
    setModalText(data.summary, false);
    if (!hasUnlimitedAccess) {
      state.freeCount++;
      LS.set("j999_free", String(state.freeCount));
    }
  } catch (_) {
    if (myId === aiRequestId) setModalText(window.t("ErrAi"), true);
  }
};

/* ====== Démarrage ====== */
document.addEventListener("DOMContentLoaded", () => {
  updateModeButton();
  updateAuthUI();
  updateTabUI();
  initGoogleAuth();

  $("search-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      window.doSearch();
    }
  });

  $("modal")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) window.closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") window.closeModal();
  });

  // Rafraîchit les scores en direct sans clignotement tant que l'onglet est visible.
  setInterval(() => {
    if (state.tab === "live" && !document.hidden) fetchNews({ silent: true });
  }, LIVE_REFRESH_MS);

  fetchNews();
});
