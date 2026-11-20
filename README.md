# Journal 999 v3 — GitHub → Vercel → Dodo Payments (5 $/mois)

Kiosque d'actualités international (anglais par défaut, + français, espagnol, allemand, arabe) + journaux locaux (19 pays), TV live, foot live, résumés IA (Gemini), favoris, partage, PWA installable, compteur de vues réelles, abonnement Premium.

## 1. Mettre en ligne (GitHub → Vercel)
1. Créez un dépôt GitHub et envoyez-y le contenu de ce dossier (`git init && git add . && git commit -m "v3" && git push`).
2. Sur vercel.com : **Add New → Project** → importez le dépôt (aucun réglage de framework à changer).
3. Dans **Settings → Environment Variables**, ajoutez les variables de `.env.example` (voir §3).
4. Redéployez. Notez l'URL finale (ex. `https://journal-999.vercel.app`).
5. Mettez cette URL dans `SITE_URL` (variable Vercel **et** dans `config.js`), puis redéployez.

## 2. Google Sign-In
Client ID déjà intégré : `502413181474-7ei3mhnqmk9uhcrm0v6b816csfbe5i5v.apps.googleusercontent.com`.
Dans Google Cloud Console → Identifiants → ce client OAuth → **Origines JavaScript autorisées** : ajoutez votre URL Vercel (et votre domaine perso si besoin). Sans cela le bouton Google affichera une erreur.

## 3. Variables d'environnement
| Variable | Rôle |
|---|---|
| `GEMINI_API_KEY` | Résumés IA (obligatoire pour l'IA) |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Base gratuite (Vercel → Storage → Upstash Redis) : vues, quotas IA, abonnés Premium. Sans elle : pas de compteur ni de Premium persistant |
| `DODO_WEBHOOK_SECRET` | Secret du webhook Dodo (`whsec_...`) |
| `GNEWS_API_KEY` | Optionnel : plus d'articles (sinon RSS) |
| `FOOTBALL_API_KEY` | Optionnel : scores foot live (api-sports.io) |
| `ADMIN_EMAIL` | Compte administrateur illimité (défaut : haykellaouiti@gmail.com) |
| `FREE_LIMIT` | Résumés IA gratuits par mois (défaut 15) |

## 4. Abonnement 5 $/mois avec Dodo Payments
1. Dodo Payments → **Products → Create** → type *Subscription*, prix **5 USD / mois**. Copiez l'ID `pdt_...`.
2. Collez-le dans `config.js` : `DODO_PRODUCT_ID`. (L'ID du produit 10 $ de HAK IA Studio n'est volontairement pas réutilisé.)
3. Dodo → **Webhooks → Add endpoint** : `https://VOTRE-URL/api/webhook`, événements `payment.succeeded`, `subscription.active`, `subscription.renewed`, `subscription.cancelled`, `subscription.expired`, `subscription.failed`. Copiez le secret dans `DODO_WEBHOOK_SECRET`.
4. Test : connectez-vous avec Google sur `/pricing`, payez avec le **même e-mail** → le statut Premium s'active via le webhook.

## 5. Contenu
- `/api/news` : RSS + GNews, journaux locaux par pays, chaînes, recherche.
- `/api/views` : visites et lectures par journal (affichées « 👁 »).
- `/api/ai` : résumé IA, quota gratuit côté serveur.
- `/api/me`, `/api/webhook` : statut utilisateur vérifié côté serveur, webhook signé.
- `build-pages.mjs` régénère `/fr /en /ar`, `sitemap.xml`, `robots.txt` (lancé par Vercel).
- AdSense : `ads.txt` conservé ; les pubs ne se chargent qu'après consentement et jamais pour les Premium.
