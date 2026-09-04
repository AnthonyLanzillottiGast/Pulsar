# PokéPulse Market Terminal

Version 2 — terminal d'analyse du marché Pokémon TCG.

## Ce que fait cette version

- Scanner de cartes basé sur Pokémon TCG API.
- Prix Cardmarket + TCGplayer quand présents dans les données.
- Signal mécanique 7j vs 30j.
- Watchlist.
- Snapshots locaux pour construire une série temporelle.
- Feed "Release & flash info".
- Sources officielles + médias spécialisés.
- Synthèse multi-source dans la fiche carte.
- Architecture prête pour un agrégateur serveur.

## Important : synthèse du web

Le terminal sépare volontairement :
1. **Données de marché** : prix provenant d'une source structurée.
2. **News / releases** : événements et articles.
3. **Synthèse** : interprétation de contexte, jamais présentée comme un prix de vente.

Pour obtenir une vraie moyenne statistique du web, il faut alimenter `/api/news.json` ou, mieux, un backend qui collecte les flux autorisés et normalise :
- date de publication
- source
- URL
- carte/set concerné
- sentiment
- type d'événement
- score de fiabilité
- éventuel impact attendu

Ne scrape pas arbitrairement des sites qui l'interdisent. Préfère leurs RSS, APIs ou flux autorisés.

## Sources de prix possibles pour une V3

Le frontend est volontairement agnostique. Tu peux ajouter un backend qui normalise plusieurs fournisseurs, par exemple :
- Cardmarket
- TCGplayer
- eBay sold / completed sales
- autres fournisseurs disposant d'une API/licence

Des APIs tierces actuellement proposées sur le marché revendiquent déjà des agrégations Cardmarket/TCGplayer/eBay ; vérifie toujours leurs conditions, couverture, fraîcheur et droits d'utilisation avant une exploitation commerciale.

## Déploiement GitHub Pages

1. Crée un repo GitHub.
2. Copie le contenu du ZIP.
3. Push sur `main`.
4. Settings → Pages → GitHub Actions.
5. Le workflow publie automatiquement.

## Limite GitHub Pages

GitHub Pages ne peut pas exécuter un collecteur permanent de news/prix côté serveur.
Pour une vraie surveillance automatique :
- GitHub Actions cron pour une collecte périodique légère, ou
- Cloudflare Worker / Supabase Edge Function / Vercel Cron.
Les secrets API restent côté serveur.

## Objectif V3

- base historique PostgreSQL/SQLite/D1
- collecte toutes les 15/30/60 min
- normalisation des devises
- ventes réalisées vs annonces actives
- moyenne pondérée par volume
- indice de liquidité
- score de hype news
- détection de divergence prix/news
- alertes
- portefeuille et P&L
- graphique OHLC / chandeliers
