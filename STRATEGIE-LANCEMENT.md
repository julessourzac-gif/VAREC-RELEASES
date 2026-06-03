# VAREC — Stratégie de communication de lancement

> Document de travail — Bernik · `varec.bernik.io`
> Version 1.0 · juin 2026

---

## 1. Synthèse

**VAREC** est un *field recorder* multipiste logiciel pour macOS (édité par **Bernik**) qui
transforme un Mac + interface CoreAudio en enregistreur professionnel jusqu'à **512 canaux**,
avec timecode (LTC / Tentacle BLE / Time of Day), enregistrement multi‑disque redondant,
crash recovery, Sound Report PDF, upload cloud et outils d'analyse.

**Proposition de valeur unique :** la puissance d'un enregistreur haut de gamme
(type Sound Devices Scorpio / Aaton) **en logiciel**, à **90 € en licence perpétuelle**,
sur du matériel que l'ingénieur du son possède déjà.

| Axe | Positionnement |
|-----|----------------|
| Catégorie | Field recorder multipiste logiciel macOS |
| Cible cœur | Ingénieurs du son direct, perchmen, field recordists, sound designers |
| Différenciateur | 512 ch / multi‑disque / Sound Report PDF / 90 € perpétuel vs hardware à plusieurs k€ |
| Preuve | Zéro perte (crash recovery), timecode pro, WAV 32 bits float / 192 kHz |
| Objectif lancement | Notoriété dans la communauté son direct + premières ventes de licences |

---

## 2. Objectifs & KPIs

| Objectif | Indicateur (KPI) | Cible 90 jours |
|----------|------------------|----------------|
| Notoriété | Visiteurs uniques `varec.bernik.io` | 8 000 – 12 000 |
| Acquisition | Emails collectés (email gate) | 1 500 |
| Adoption | Téléchargements DMG | 1 200 |
| Conversion | Licences vendues (90 €) | 80 – 150 |
| Crédibilité | Tests / mentions médias & forums | 10+ |
| Communauté | Bêta‑testeurs actifs / retours | 30+ |

> Le site embarque déjà Vercel Analytics + un *email gate* avant téléchargement :
> ce sont les deux instruments de mesure principaux. Penser à baliser les liens
> sortants avec des paramètres **UTM** (`?utm_source=gearspace&utm_medium=forum&utm_campaign=launch`).

---

## 3. Cibles & personas

1. **L'ingénieur du son direct (fiction / docu / pub)** — cherche fiabilité, timecode,
   Sound Report. Sensible au « zéro perte ». Décideur d'achat.
2. **Le field recordist / sound designer** — capture de banques de sons, multipiste,
   32 bits float, analyse spectre/phase.
3. **Le vidéaste / créateur exigeant** — veut un multipiste fiable sans investir dans
   un enregistreur hardware dédié. Sensible au prix et au workflow Mac.
4. **L'étudiant / l'école de cinéma & son** — budget limité, futur prescripteur.
   Levier : licence bêta gratuite, tarif étudiant.

---

## 4. Messages clés (angles éditoriaux)

- **« Votre Mac devient un enregistreur 512 pistes. »** — angle disruptif prix/puissance.
- **« Zéro perte, même en cas de crash. »** — angle confiance (crash recovery, multi‑disque).
- **« Du terrain au Sound Report, sans quitter l'app. »** — angle workflow.
- **« Timecode pro : LTC, Tentacle BLE, Time of Day. »** — angle crédibilité métier.
- **« 90 €, licence perpétuelle. Essai sans limite de temps. »** — angle barrière à l'entrée.

Adapter le message au canal : forums pro = fiabilité/timecode ; vidéastes = prix/workflow ;
field recording = 32F / 512 ch / analyse.

---

## 5. Plan de lancement en 3 phases

### Phase 0 — Pré‑lancement / teasing (J‑30 → J‑1)
- Recruter **20–30 bêta‑testeurs** via AFSI, Sound Designers, Gearspace (licence bêta gratuite déjà prévue sur le site).
- Constituer le **kit presse** (voir §7) et une courte **vidéo démo** (le repo contient déjà `DEMO IOIO LORES.mov` et `DEMO COM DECK.png`).
- Récolter **2–3 témoignages / verbatims** de testeurs reconnus du milieu.
- Teaser sur les réseaux (LinkedIn Bernik, Instagram, groupes Facebook son direct).

### Phase 1 — Lancement (Jour J → J+7)
- **Annonce officielle** simultanée : page produit, post forums, emailing aux contacts collectés.
- Publier des **threads dédiés** sur Gearspace, Reddit r/LocationSound, Sound Designers, FilmTVsound (voir §6, en respectant les règles de chaque communauté — *pas de spam*, se présenter en tant qu'éditeur).
- Envoyer le **kit presse + licences de test** aux médias et YouTubeurs (Curtis Judd, ProductionExpert, CineD…).
- Offre de lancement possible : tarif réduit ou bundle early‑adopter limité dans le temps.

### Phase 2 — Entretien / amplification (J+7 → J+90)
- Relayer les **tests & retours** dès parution (re‑share, citations sur le site).
- Publier des **tutoriels vidéo** (la page `videos.html` est prévue pour 8 vidéos) : timecode, multi‑disque, Sound Report, partage cloud.
- **Présence salons** : NAB, IBC, Satis, Micro Salon AFC/AFSI — démos terrain.
- Boucle produit : transformer les retours forums en **changelog public** (GitHub Releases) → preuve d'un produit vivant.

---

## 6. Répertoire des sites & relais d'influence

> Classés par priorité d'approche. Pour chaque relais : **se présenter clairement comme l'éditeur**,
> apporter de la valeur (démo, licence de test) plutôt que de la promo brute, et respecter les
> chartes anti‑spam. Baliser chaque lien avec un UTM dédié pour mesurer la source.

### 6.1 Communautés & forums francophones (prioritaire — marché historique du « son direct »)

| Relais | Type | Pourquoi / angle |
|--------|------|------------------|
| **AFSI — Association Française du Son à l'Image** (`afsi.eu`) | Association pro (250+ membres : ingénieurs son, perchmen, mixeurs) | Cœur de cible FR. Proposer démo/test matériel, intervenir lors d'ateliers/réunions. |
| **Sound Designers** (`sounddesigners.org`) | Forum FR son à l'image, montage son, son direct | Threads techniques actifs ; public exactement ciblé. |
| **Audiofanzine** (`fr.audiofanzine.com`) | Plus grande communauté audio FR généraliste | Forum « Prise de son / enregistrement » + fiche produit + actualité. |
| **AFC — Association Française des directeurs de la photographie** / **Micro Salon** (`afcinema.com`) | Réseau cinéma, événement Micro Salon | Relais salon où le son est présent ; visibilité auprès des productions. |
| **Mediasound / La Lettre du Son / écoles (ENS Louis‑Lumière, INA, ESRA, CinéFabrique)** | Médias pro & écoles | Prescription long terme + tarif étudiant. |

### 6.2 Communautés & forums internationaux

| Relais | Type | Pourquoi / angle |
|--------|------|------------------|
| **Gearspace** (`gearspace.com`, ex‑Gearslutz) | « Plus grand forum pro audio du monde » — section *Location Sound* & *Studio/Stage/Mobile & Location Equipment* | Visibilité internationale maximale. Thread produit + participation aux discussions matériel. |
| **Reddit r/LocationSound** + r/audioengineering, r/fieldrecording | Communautés Reddit actives | Démos, AMA éditeur, retours rapides. Respecter strictement les règles de self‑promo. |
| **JW Sound** (jwsoundgroup) | Référence historique production sound | Public d'ingénieurs son cinéma/TV. |
| **FilmTVsound** (`filmtvsound.com`) | Forum film/TV sound, annonces produits | Section « Product Announcements » adaptée au lancement. |
| **Creative Field Recording** (`creativefieldrecording.com/community`) | Communauté & ressources field recording | Cible field recordists / sound designers, banques de sons. |
| **Sound Design Stack Exchange** | Q&R technique | Présence par réponses utiles (SEO + crédibilité). |
| **KVR Audio** (`kvraudio.com`) — *Production Techniques* | Forum audio/dev | Public technophile macOS/CoreAudio. |

### 6.3 Médias, blogs & sites de test (relations presse)

| Relais | Type | Pourquoi / angle |
|--------|------|------------------|
| **Production Expert** (`production-expert.com`) | Média pro audio (news, tests, tutos) | Test/article = forte crédibilité post‑prod & prise de son. |
| **CineD** (ex‑cinema5D) | Média ciné/vidéo international | Couvre régulièrement le son pour l'image et les vidéastes. |
| **Newsshooter** | Média tournage / matériel | Audience tournage docu/broadcast. |
| **Pro Sound Network / Mix / Sound On Sound** | Presse audio pro | Reviews et brèves produit. |
| **Audiofanzine (rédaction) / Sonovente blog / SoundTrap FR** | Médias FR | Couverture francophone. |

### 6.4 YouTubeurs & créateurs (placement produit / test offert)

| Créateur | Audience | Angle |
|----------|----------|-------|
| **Curtis Judd — Learn Light and Sound** (100k+ abonnés) | Son pour la vidéo, très pédagogue | Test « turn your Mac into a 512‑track recorder », tuto timecode. |
| **Production Expert (YouTube)** | Pros audio/post | Démo workflow Sound Report. |
| **Allie & le milieu « location sound » YouTube** / podcasts (**Location Sound Podcast**) | Ingénieurs son terrain | Interview éditeur / retour d'expérience. |
| **Vidéastes FR (DSLR / docu)** | Créateurs francophones | Angle prix + workflow Mac. |

### 6.5 Réseaux sociaux & groupes

- **Groupes Facebook** : « Son Direct » / « Ingénieurs du son » / « Location Sound » / « Field Recording » (très actifs, public exactement ciblé).
- **LinkedIn** : page Bernik + posts ciblés (décideurs, productions, écoles).
- **Instagram / YouTube Shorts** : extraits visuels de l'UI et de l'animation `splash-anim.gif` / démo.
- **Discord / Slack** communautés son & post‑prod.

---

## 7. Kit presse & assets (à préparer)

- **Communiqué de presse** FR + EN (1 page) : pitch, specs clés, prix, lien, contact `contact@bernik.io`.
- **Fiche produit / one‑pager PDF** (réutiliser `DEMO COM DECK.png`).
- **Vidéo démo 60–90 s** (base : `DEMO IOIO LORES.mov`) + version verticale réseaux.
- **Captures d'écran HD** de l'interface, du Sound Report PDF, du timecode.
- **Logos** (`logo.png`, BERNIK transparents) + visuel Open Graph (`og-preview.png`).
- **Licences de test** prêtes à envoyer aux testeurs/journalistes.
- **FAQ / argumentaire** réponses aux objections (« pourquoi un logiciel plutôt qu'un hardware ? », latence, fiabilité terrain).

> ⚠️ À corriger avant lancement : le visuel `og-preview.png` est référencé dans les
> `<meta>` mais **absent du dépôt** → l'aperçu social (LinkedIn/Twitter/Facebook) sera cassé.
> C'est critique pour une campagne qui s'appuie sur le partage. Voir aussi le `nav-cta`
> de `ressources.html` resté en `v1.4.35` alors que la home est en `v1.5.0`.

---

## 8. Calendrier synthétique

| Période | Actions |
|---------|---------|
| J‑30 → J‑15 | Recrutement bêta‑testeurs, production kit presse + vidéo, correctifs OG image |
| J‑14 → J‑1 | Teasing réseaux, envois sous embargo aux médias/YouTubeurs, collecte verbatims |
| **Jour J** | Annonce officielle (site, forums, emailing), offre early‑adopter |
| J+1 → J+7 | Threads forums, suivi presse, réponses communauté |
| J+8 → J+30 | Tutoriels vidéo, relais des tests, première analyse KPIs |
| J+31 → J+90 | Salons (Satis/Micro Salon), itérations produit, contenus SEO, bilan |

---

## 9. Recommandations rapides (« quick wins »)

1. **Ajouter l'image Open Graph manquante** (`og-preview.png`) — sinon tous les partages
   sociaux de la campagne s'afficheront sans visuel.
2. **Uniformiser le numéro de version** affiché sur toutes les pages (v1.5.0).
3. **Baliser tous les liens entrants en UTM** pour savoir quel relais convertit.
4. **Préparer une page / section « Press Kit »** téléchargeable (zip logos + screenshots + CP).
5. **Lister nommément 30 contacts** (10 forums, 10 médias/YouTubeurs, 10 prescripteurs FR)
   dans un CRM léger pour suivre les prises de contact.

---

### Sources (écosystème d'influence)

- [AFSI — Association Française du Son à l'Image](https://www.afsi.eu/)
- [Sound Designers (forum FR)](https://www.sounddesigners.org/)
- [Audiofanzine — forums audio FR](https://fr.audiofanzine.com/forums/)
- [AFC — Naissance de l'AFSI / Micro Salon](https://www.afcinema.com/)
- [Gearspace — Location Sound](https://gearspace.com/board/remote-possibilities-in-recording-amp-production/642182-location-sound.html)
- [Creative Field Recording — Community](https://www.creativefieldrecording.com/community/field-recording-community/)
- [FilmTVsound — forum](https://www.filmtvsound.com/)
- [KVR Audio — Production Techniques](https://www.kvraudio.com/forum/viewforum.php?f=62)
- [Curtis Judd — Learn Light and Sound (YouTube)](https://www.youtube.com/@curtisjudd/videos)
- [Production Expert (YouTube)](https://www.youtube.com/c/ProductionExpert)
- [Location Sound Podcast](https://locationsoundpodcast.libsyn.com/)
