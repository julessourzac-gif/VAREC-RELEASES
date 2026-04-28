# VAREC — Releases

Releases officielles de **VAREC**, le field recorder multipiste pour Mac.

Téléchargez la dernière version sur la page [Releases](../../releases).

---

## Landing page Vercel

Ce dépôt contient également la landing page publique de VAREC (`index.html`, `styles.css`, `script.js`), prête à déployer sur Vercel.

### Déploiement

1. Importer ce dépôt sur [vercel.com/new](https://vercel.com/new)
2. Vercel détecte automatiquement le site statique — aucun build nécessaire
3. Cliquer sur « Deploy »

### Configurer le formulaire de licence

Le formulaire de demande de licence utilise [Formspree](https://formspree.io) :

1. Créer un compte gratuit sur Formspree
2. Créer un nouveau formulaire et copier l'ID (`f/abc123xyz`)
3. Dans `index.html`, remplacer `YOUR_FORM_ID` par votre ID Formspree dans `<form action="https://formspree.io/f/YOUR_FORM_ID">`

Tant que `YOUR_FORM_ID` est présent, le formulaire bascule automatiquement en `mailto:` (modifier l'adresse `contact@varec.app` dans `script.js` si besoin).
