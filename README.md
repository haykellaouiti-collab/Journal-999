# Journal 999

Agrégateur d'actualités multilingue (FR / EN / AR) : GNews + flux RSS, résumés IA (Gemini), chaînes TV, scores foot en direct.

## Structure

```
index.html          redirection vers /fr/, /en/ ou /ar/
fr/ en/ ar/         pages (index.html dans chaque dossier)
app.js i18n.js      logique et traductions (à la racine)
api/news.js         actualités, résumé IA, foot live
api/webhook.js      webhook Dodo Payments (signature vérifiée)
vercel.json         en-têtes et URLs propres
package.json        Node 26.x + modules ES
```

## Variables d'environnement (Vercel → Settings → Environment Variables)

| Variable | Rôle |
|---|---|
| `GEMINI_API_KEY` | Résumés et traductions IA |
| `GNEWS_API_KEY` | Actualités GNews (les flux RSS prennent le relais si absente) |
| `FOOTBALL_API_KEY` | Scores en direct (api-sports.io) |
| `DODO_WEBHOOK_SECRET` | Vérification des webhooks (`whsec_...`) |

## À remplacer dans `app.js`

- `GOOGLE_CLIENT_ID`
- `DODO_CHECKOUT_URL`

## Déploiement

Poussez ce dossier sur GitHub : Vercel redéploie automatiquement.

## Limite connue

Le statut Premium et le quota gratuit sont stockés dans le navigateur : ils sont contournables. Pour un contrôle réel, enregistrer les e-mails payants dans une base depuis `api/webhook.js` et vérifier le jeton Google côté serveur.
