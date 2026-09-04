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

## Version anglaise du site (`/en/`)

Le site est bilingue depuis la v1.5.38. Le **français reste à la racine**, l'anglais
vit sous `/en/` :

| Français | Anglais |
|---|---|
| `index.html` | `en/index.html` |
| `ressources.html` | `en/resources.html` |
| `videos.html` | `en/videos.html` |
| `manuel.html` | `en/manual.html` |

`tarifs.html` et `email-lancement.html` restent monolingues (la première n'est ni
indexée ni liée, la seconde n'est pas une page du site).

### Les pages EN sont des jumelles structurelles des pages FR

Mêmes `id`, mêmes `class`, mêmes attributs `data-*`, **mêmes ancres** (`#preview`,
`#features`, `#download`, et les 19 ancres du manuel). Seuls diffèrent le texte, les
attributs lisibles par un humain (`alt`, `aria-label`, `placeholder`, `content`) et
les chemins.

C'est ce qui permet à `script.js`, à la feuille de style et au test de fonctionner sur
les deux langues sans le moindre branchement. **Toute modification de copie ou de
structure côté FR doit être répercutée dans `/en/`** — rien ne le fait automatiquement.

### Chemins d'assets

Les pages EN vivent dans un sous-dossier : un chemin relatif y résoudrait en
`/en/logo.png` → 404. Elles référencent donc **tous** leurs assets en absolu depuis la
racine (`/logo.png`, `/styles.v14.css`, `/script.js`, `/favicon.png`), et leurs liens
internes en `/en/…`.

### Sélecteur de langue

Un bloc `.lang-switch` dans la nav **et** dans le footer des huit pages. Chaque lien
pointe vers la contrepartie de la page courante, jamais vers l'accueil. Pas de
redirection automatique : l'URL demandée fait foi.

### Contrat `data-v-label` entre le HTML et `script.js`

Le bandeau « dernière version » de l'accueil est réécrit au chargement par `script.js`.
Le libellé ne vit plus dans le script mais dans le HTML :

```html
<div class="v-info" data-v-label="Dernière version : ">…   <!-- FR -->
<div class="v-info" data-v-label="Latest version: ">…      <!-- EN -->
```

`script.js` lit cet attribut et repère le nœud texte par sa non-vacuité, plus par un
`/Derni/` français. La date suit `<html lang>` (`fr-FR` ou `en-GB`).
**Si vous changez ce libellé dans le HTML, changez-le aussi dans
`update-version.yml`** — le workflow s'en sert comme ancre de sa regex.

### Le workflow de version touche désormais deux fichiers

`.github/workflows/update-version.yml` réécrit `index.html` **et** `en/index.html` à
chaque release (CTA, liens DMG, bandeau), chacun avec son libellé et sa date localisée.
La garde « release sans DMG macOS → on ne touche à rien » vaut pour les deux.

### SEO

`canonical` + `hreflang` (`fr`, `en`, `x-default`) sur les douze pages — huit de
contenu, quatre légales —, `og:locale` là où un bloc Open Graph existe, et un
`sitemap.xml` à la racine déclaré dans `robots.txt`. **Une page ajoutée sous `/` ou
`/en/` doit être déclarée dans le sitemap avec son alternate.**

### Tests

`npm test` rejoue tous les scénarios de recalage des liens de téléchargement sur
`index.html` **et** `en/index.html`, et vérifie que chaque accueil affiche le bandeau
dans sa propre langue.

---

## Conformité RGPD

### Ce que le site traite aujourd'hui

Rien qui vienne de l'utilisateur. Aucun formulaire, aucun compte, aucun cookie, aucune
collecte d'adresse. Ne subsistent que les traces techniques inhérentes à toute
consultation : journaux de l'hébergeur, mesure d'audience Vercel (sans cookie), requête
vers GitHub au téléchargement, et requête vers Google pour la police de caractères.

Quatre pages décrivent cet état et **doivent être mises à jour avant** toute
réintroduction d'un formulaire, d'un cookie, d'un script tiers ou d'un outil de mesure :

| Page | Jumelle EN |
|---|---|
| `mentions-legales.html` | `en/legal-notice.html` |
| `confidentialite.html` | `en/privacy.html` |

Elles réutilisent les classes `doc-*` du manuel — aucun CSS spécifique. Les champs entre
crochets `[À COMPLÉTER : …]` sont **volontairement visibles en clair** sur la page tant
qu'ils ne sont pas renseignés : une mention légale incomplète doit se voir, pas se cacher.

### Le dispositif de collecte retiré

Jusqu'au 4 septembre 2026, une modale bloquait le téléchargement tant qu'une adresse
n'était pas saisie ; celle-ci partait vers `api/register.js`, qui l'ajoutait à un
`customers.csv` commité dans un dépôt GitHub privé (`api/_logCustomer.js`).

Le dispositif était illicite sur cinq points : consentement non libre (art. 7§4 RGPD —
un téléchargement gratuit conditionné à une donnée non nécessaire au service),
prospection sans opt-in exprès (art. L.34-5 CPCE), finalité annoncée « informations de
version » démentie par la campagne de lancement (art. 5§1 b), aucune information à la
collecte (art. 12-14), effacement impossible (art. 17 — les adresses étaient écrites
dans un fichier versionné par git, donc conservées dans l'historique).

Tout a été retiré : modale, bloc gate de `script.js`, endpoints, CSS. Le répertoire
`api/` n'existe plus — ce dépôt n'a plus aucune fonction serverless.

### Marche à suivre pour purger les données déjà collectées

**L'ordre compte.** Le site est déployé par l'intégration Git de Vercel depuis `main` :
tant que la suppression n'est pas mergée, l'endpoint reste en ligne et collecte encore.

1. **Merger** la suppression sur `main`.
2. **Vérifier le déploiement** : la modale a disparu des deux accueils, et
   `https://varec.bernik.io/api/register` renvoie 404.
3. **Purger le dépôt customers.** Vider `customers.csv` **et réécrire l'historique git**
   avant de supprimer le dépôt : une suppression de dépôt reste réversible pendant
   90 jours côté GitHub, et une restauration rendrait l'historique intact. Réécrire puis
   supprimer garantit qu'une restauration ne rend rien.
4. **Révoquer le PAT `CUSTOMERS_GITHUB_TOKEN`** — à faire même sans le dépôt : le jeton
   peut porter des droits sur d'autres dépôts.
5. **Retirer `CUSTOMERS_GITHUB_TOKEN` et `CUSTOMERS_REPO`** des variables du projet Vercel.
6. **Supprimer la liste chez le prestataire d'emailing**, si elle y a été importée pour la
   campagne de lancement (`email-lancement.html`). C'est la copie qui survit à tout le
   reste, et donc celle qui compte le plus.
7. **Ne réutiliser cette liste pour aucune prospection** : le consentement recueilli est
   invalide, un nouvel envoi constituerait une infraction distincte.

Sans objet, vérifié : les messages de commit du dépôt customers étaient de la forme
`log: download 2026-09-04`, sans adresse ; et `register.js` ne journalisait que
`type/version/arch`, jamais l'email.

### Points ouverts

- **Polices Google.** Les huit pages chargent Inter depuis `fonts.googleapis.com`, ce qui
  transmet l'IP de chaque visiteur à Google aux États-Unis. Le point est contesté
  (LG München, 20 janvier 2022). Correctif : héberger les fichiers `woff2` sur le site et
  déclarer les `@font-face` localement. La section « Polices de caractères » des deux
  politiques de confidentialité devra alors être supprimée, et Google retiré du tableau
  des destinataires.
- **Adresse de l'hébergeur.** Celle portée par les mentions légales est à revérifier sur
  `vercel.com/legal` avant publication : l'exactitude est exigée par l'art. 6-III LCEN.
- **Traitements de l'application.** Activation de licence, partage cloud et journaux de
  diagnostic relèvent du projet Vercel dédié, hors de ce dépôt. Ils ne sont couverts par
  aucune des deux politiques et en appelleront une au passage en commercial.

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
- L'infrastructure de paiement (Payment Link Stripe, Customer Portal côté app) reste en
  place, **prête à activer**. Elle ne dépend d'aucun code de ce dépôt : le répertoire
  `api/` n'existe plus (voir « À corriger avant le lancement commercial »), les webhooks
  vivent dans le projet Vercel dédié à l'activation.

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

- **Collecte d'emails au téléchargement supprimée** : voir la section « Conformité RGPD »
  ci-dessus. Toute réintroduction d'une collecte au passage en commercial doit être un
  opt-in dissocié du téléchargement, avec case décochée, stockage hors git et lien de
  désinscription — sans quoi le même vice de consentement se reproduit.
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
