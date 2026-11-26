# Journal 999 — Kiosque de Presse International (FR / EN / AR)

Refonte complète sous **Next.js 16 (App Router) + TypeScript + Tailwind CSS + next-intl + Auth.js v5**.

## Fonctionnalités incluses
- **Multilingue complet (`fr`, `en`, `ar`)** avec passage automatique en **RTL (`dir="rtl"`)** pour l'arabe.
- **Connexion Google OAuth** fonctionnelle via Auth.js (`/api/auth/signin`).
- **Agrégateur RSS International en temps réel** (`/api/news`) : Le Monde, France 24, BBC World, Reuters/NYTimes, Al Jazeera, Asharq Al-Awsat, TAP / La Presse de Tunisie, DW, El País, etc.
- **Onglets dynamiques fonctionnels** : À la une, International, Maghreb & Tunisie, Moyen-Orient, Économie, Technologie, Sport, Culture.
- **Outils intégrés** : Recherche instantanée, Mode Lecture épurée (Reader Mode), Synthèse vocale (Écouter l'article en FR/EN/AR), Favoris sauvegardés, Mode Sombre/Clair, et intégration Google AdSense (`ca-pub-3266873353292561`).

## Installation & Déploiement sur Vercel
1. Créez un nouveau dépôt GitHub ou remplacez le contenu de `Journal-999` par les fichiers de cette archive.
2. Dans **Google Cloud Console**, créez des identifiants OAuth 2.0 et ajoutez l'URI de redirection :
   `https://votre-domaine.vercel.app/api/auth/callback/google`
3. Dans **Vercel > Project Settings > Environment Variables**, ajoutez :
   - `AUTH_SECRET`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
4. Déployez : Vercel détecte automatiquement Next.js et Node.js `26.x`.
