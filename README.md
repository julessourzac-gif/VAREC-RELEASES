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

---

## Statut commercial — bêta fermée

L'app VAREC est en **bêta de validation**. Conformément au brief produit, le site
**ne publie aucun prix** et **aucun bouton d'achat / abonnement** pendant cette phase :

- `index.html` : la section `#licence` est réduite à un **bloc bêta** (« tarifs bientôt
  disponibles ») + CTA « Demander une licence bêta-testeur ». Aucun prix, aucun bouton
  Stripe en source.
- Liens « **Acheter** » retirés de la nav, du hero et du footer (sur `index.html`,
  `manuel.html`, `ressources.html`, `videos.html`).
- Le tunnel commercial complet (tableau **12 €/mois**, bouton Stripe, argumentaire
  concurrents) est **préparé** dans **`tarifs.html`**, page **non indexée**
  (`<meta robots noindex>` + `robots.txt`) et **non liée** depuis le site.
- L'infrastructure de paiement (Payment Link Stripe, webhook `api/`, Customer Portal
  côté app) reste en place, **prête à activer**.

### Passage en commercial (bascule)

À déclencher **uniquement sur signal du dépôt app VAREC** (retours bêta validés).
Aucune date de lancement à annoncer d'ici là.

1. **Réintégrer le tunnel** dans `index.html` : restaurer le tableau comparatif + le
   bouton Stripe dans la section `#licence` (copier depuis `tarifs.html`), ou rediriger
   « Acheter » vers `tarifs.html`.
2. **Rétablir les liens « Acheter »** dans la nav, le hero et le footer des 4 pages.
3. **Publier `tarifs.html`** (si conservée comme page dédiée) : retirer la balise
   `<meta name="robots" content="noindex,nofollow">` et le bandeau interne.
4. **`robots.txt`** : retirer les lignes `Disallow: /tarifs.html` et `Disallow: /tarifs`.
5. Vérifier le checkout Stripe de bout en bout (voir ci-dessous).

### À corriger avant le lancement commercial

- **Webhook licence legacy (`api/licence.js`)** : ce fichier émet une **clé permanente**
  (`type=1, expiry=0`) et envoie *la clé* par email (Resend). Or l'activation réelle
  (**magic-link + abonnement**) est gérée par un **projet Vercel dédié**, distinct de ce
  dépôt. `api/licence.js` est donc **probablement obsolète**. Vérifier vers quel endpoint
  pointe le webhook Stripe : s'il cible le backend dédié, **retirer/désactiver
  `api/licence.js`** (et le câblage `STRIPE_WEBHOOK_SECRET`) dans ce dépôt pour éviter
  qu'un email « clé permanente » ne parte en parallèle du magic-link. Le cycle
  d'abonnement (renouvellement sur `invoice.paid`, révocation à la résiliation) relève de
  ce backend dédié.
- **Palier gratuit** : le site décrit un palier gratuit perpétuel (64 ch) + « 30 jours »
  sur certaines fonctions, alors que le brief parle d'un **essai gratuit 30 jours sans
  CB**. Réconcilier le cadrage.
- **Plateformes / cloud** : le site est orienté **Mac** (Windows/Linux « non testées »),
  alors que le brief met en avant le **cross-platform Mac/Windows/Linux** et
  **SwissTransfer** dans la liste cloud (Smash/Dropbox/R2 aujourd'hui). Harmoniser au
  lancement.
