# API layer

GitHub Pages sert uniquement le frontend.

Pour transformer le feed en véritable agrégateur :
- remplace `news.json` par un endpoint serverless `/api/news`;
- collecte uniquement des RSS/APIs autorisés;
- stocke les événements avec timestamp;
- déduplique par URL + titre;
- attribue un score de fiabilité;
- renvoie JSON au frontend.

Exemple de sortie :
[
  {
    "source": "Pokémon.com",
    "title": "...",
    "date": "2026-09-04T18:00:00Z",
    "url": "...",
    "impact": "RELEASE",
    "reliability": 1.0,
    "entities": ["30th Celebration"]
  }
]
