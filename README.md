# Journal 999 v3 — Édition Standard (gratuite · Google AdSense)

Kiosque de presse mondiale en **4 langues (FR · EN · AR · ES)**, RTL natif pour l'arabe, mode jour / nuit / auto.
Stack : **Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · next-intl 4 · Auth.js v5**.

## Ce qui a changé par rapport à l'ancienne version
- L'archive précédente ne pouvait pas fonctionner : route Auth.js vide, route `/news` au mauvais chemin (`/api/news` attendu), `middleware.ts` obsolète sous Next 16 (devient `proxy.ts`), `engines: node 26`. Tout est corrigé.
- Nouveau logo (monogramme « 9 » + point d'alerte), nouvelle identité éditoriale (serif Fraunces + Inter + IBM Plex Sans Arabic).
- 43 flux RSS (FR/EN/AR/ES), déduplication, filtres langue / région / source, sujets du moment, actualisation auto (5 min), raccourci `/` pour chercher, mode lecture, écoute audio, favoris, partage.
- SEO international : URLs `/fr` `/en` `/ar` `/es`, `hreflang`, sitemap multilingue, pages de rubriques indexables avec texte éditorial, JSON-LD, manifest PWA, Open Graph.

## Démarrage local
```bash
npm install
cp .env.example .env.local
npm run dev          # http://localhost:3000
NEWS_DEMO=1 npm run dev   # mode démo sans réseau (articles fictifs)
```

## Déploiement Vercel
1. Importez le dépôt dans Vercel (preset Next.js détecté). `vercel.json` fixe déjà `NEXT_PUBLIC_EDITION=standard`.
2. Ajoutez les variables du fichier `.env.example` (Settings → Environment Variables).
3. Définissez `NEXT_PUBLIC_SITE_URL` sur votre domaine final, puis redéployez.

> Les flux RSS n'ont pas pu être testés depuis l'environnement de développement (réseau restreint). Au premier déploiement, ouvrez `/api/news` : un flux en panne est simplement ignoré ; retirez/remplacez-le dans `src/config/sources.ts`.

## Édition Standard — financée par AdSense
Aucun compte utilisateur, aucune base de données : seules les variables AdSense comptent.

1. Dans AdSense, ajoutez votre domaine, créez 2-3 blocs d'annonces « display adaptatif » et copiez leurs identifiants dans `NEXT_PUBLIC_ADSENSE_SLOT_*`.
2. `public/ads.txt` contient déjà votre ligne éditeur (`pub-3266873353292561`) — vérifiez qu'elle est correcte.
3. Un bandeau de consentement (annonces personnalisées / non personnalisées) charge AdSense **après** choix. Pour cibler l'EEE/Royaume-Uni, activez aussi le message de consentement certifié TCF de Google (AdSense → Confidentialité et messagerie).

### Important : la règle AdSense sur le « contenu répliqué »
Google interdit les annonces sur des écrans dont le contenu est surtout copié d'autres sites sans valeur ajoutée. Pour limiter le risque de refus :
- les annonces sont placées sur les **pages de rubriques** (texte éditorial propre à chaque rubrique et langue), l'en-tête/pied de page et la barre latérale, et **pas dans le fil d'articles** (`NEXT_PUBLIC_ADS_IN_FEED=1` pour l'activer à vos risques) ;
- le site n'affiche que titre + extrait court et renvoie vers l'éditeur ; pages « À propos » et « Confidentialité » fournies ;
- pour une validation AdSense plus sûre, ajoutez de vrais contenus originaux (éditos, revues de presse rédigées, guides).
