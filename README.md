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

### Architecture de la page d'accueil (v14)

`index.html` suit désormais cet enchaînement — chaque bloc est une section autonome,
repérable par son `id` :

| Ordre | Section | Rôle |
|---|---|---|
| 1 | `#hero` | Promesse + 2 CTA + 4 chiffres clés (`.hero-kpis`) |
| 2 | `#shots` | **Galerie de captures** réelles, cliquables (lightbox) |
| 3 | `#preview` | Les deux vidéos de démo (vue horizontale / verticale) |
| 4 | `#workflow` | Le parcours en 4 étapes : patcher → enregistrer → vérifier → livrer |
| 5 | `#features` | Grille des 12 fonctions principales |
| 6 | `#deep` | 3 blocs texte + capture : analyse, fiabilité, livraison |
| 7 | `#news` | Nouveautés de la 1.5 (6 cartes) |
| 8 | `#usecases` | 4 terrains : fiction, documentaire, live, podcast |
| 9 | `#specs` | Tableau de spécifications (capture, sync, analyse, livraison) |
| 10 | `#download` | Téléchargements (inchangé, gate e-mail conservée) |
| 11 | `#faq` | 7 questions en `<details>` natifs |
| 12 | `#licence` | Bloc bêta (voir « Statut commercial » plus bas) |
| 13 | `footer` | Footer 4 colonnes |

### Identité visuelle

La charte suit le dernier logo BERNIK : dégradé **ambre → rose** (`#ffce72 → #ff6faf`)
en remplacement de l'ancien vert.

- Tokens dans `styles.v14.css` : `--brand`, `--amber`, `--pink`, `--grad`, `--grad-soft`,
  `--on-brand`. Les boutons utilisent `var(--grad)`, les labels de section `var(--brand)`.
- Les anciens filtres `hue-rotate()` appliqués aux logos ont été supprimés : les
  fichiers sont désormais aux bonnes couleurs.
- Assets recolorés : `logo-v2.png` (VAREC), `bernik-v2.png` (Bernik, texte blanc pour
  fond sombre), `favicon-v2.png`, `og-preview.png` (carte de partage 1200×630, qui
  n'existait pas et était pourtant référencée dans les balises OG).
- Les fichiers d'origine (`logo.png`, `favicon.png`, `BERNIK * transoarent.png`) sont
  conservés : `email-lancement.html` pointe encore sur l'ancien mark.

### Captures d'écran

Les visuels de `shots/` sont des **captures réelles** (aucune maquette) : recadrages de
`VAREC screenshot.png` et images extraites de `VAREC2.m4v` (source 3600×2262), exportées
en WebP. Pour en ajouter une : déposer le fichier dans `shots/`, puis créer un
`<button class="shot" data-shot="…" data-cap="…">` dans `#shots` — la lightbox
(`script.js`) prend le relais automatiquement. Classes de largeur disponibles :
`.shot` (moitié), `.shot.third` (tiers), `.shot.wide` (pleine largeur).

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

- **Webhook licence legacy supprimé** : `api/licence.js` (qui émettait une **clé
  permanente** envoyée par email via Resend) a été **retiré** — confirmé inutilisé côté
  Stripe. L'activation réelle (**magic-link + abonnement**) est gérée par un **projet
  Vercel dédié**, distinct de ce dépôt ; le cycle d'abonnement (renouvellement sur
  `invoice.paid`, révocation à la résiliation) y relève. Devenus inutiles dans ce dépôt :
  la dépendance npm `stripe` (à élaguer de `package.json` lors d'une régénération du
  lockfile) et les variables d'environnement `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `RESEND_API_KEY`, `VAREC_SIGN_KEY` (à retirer du projet Vercel).
- **Palier gratuit** : le site décrit un palier gratuit perpétuel (64 ch) + « 30 jours »
  sur certaines fonctions, alors que le brief parle d'un **essai gratuit 30 jours sans
  CB**. Réconcilier le cadrage.
- **Plateformes / cloud** : le site est orienté **Mac** (Windows/Linux « non testées »),
  alors que le brief met en avant le **cross-platform Mac/Windows/Linux** et
  **SwissTransfer** dans la liste cloud (Smash/Dropbox/R2 aujourd'hui). Harmoniser au
  lancement.
