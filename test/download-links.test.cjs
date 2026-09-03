// Vérifie le recalage des liens de téléchargement sur des données de releases
// identiques à celles que renvoie l'API GitHub aujourd'hui (v1.5.37 et v1.5.36
// sans aucun asset, macOS servi par 1.5.35, Windows/Linux par 1.5.28).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const DL = 'https://github.com/julessourzac-gif/VAREC-RELEASES/releases/download';

const RELEASES = [
  { tag_name: 'v1.5.37', draft: false, published_at: '2026-08-05T22:11:28Z', assets: [] },
  { tag_name: 'v1.5.36', draft: false, published_at: '2026-08-02T07:08:17Z', assets: [] },
  { tag_name: 'v1.5.35', draft: false, published_at: '2026-07-31T09:18:12Z', assets: [
    { name: 'VAREC-1.5.35-arm64.dmg', size: 98924606, browser_download_url: `${DL}/v1.5.35/VAREC-1.5.35-arm64.dmg` },
    { name: 'VAREC-1.5.35.dmg',       size: 106445090, browser_download_url: `${DL}/v1.5.35/VAREC-1.5.35.dmg` },
  ]},
  { tag_name: 'v1.5.28', draft: false, published_at: '2026-07-27T09:27:36Z', assets: [
    { name: 'VAREC-1.5.28-arm64.dmg',  size: 98964752, browser_download_url: `${DL}/v1.5.28/VAREC-1.5.28-arm64.dmg` },
    { name: 'VAREC-1.5.28.AppImage',   size: 113095006, browser_download_url: `${DL}/v1.5.28/VAREC-1.5.28.AppImage` },
    { name: 'VAREC-1.5.28.dmg',        size: 106410342, browser_download_url: `${DL}/v1.5.28/VAREC-1.5.28.dmg` },
    { name: 'VAREC.Setup.1.5.28.exe',  size: 84812867, browser_download_url: `${DL}/v1.5.28/VAREC.Setup.1.5.28.exe` },
    { name: 'varec_1.5.28_amd64.deb',  size: 77848944, browser_download_url: `${DL}/v1.5.28/varec_1.5.28_amd64.deb` },
    // Les .blockmap accompagnent les binaires et ne doivent jamais être servis.
    { name: 'VAREC-1.5.28.dmg.blockmap', size: 112603, browser_download_url: `${DL}/v1.5.28/VAREC-1.5.28.dmg.blockmap` },
  ]},
];

let failures = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}`);
  if (!ok) console.log(`        attendu: ${expected}\n        obtenu : ${actual}`);
}

// Les deux accueils sont des jumelles structurelles : mêmes id, mêmes data-*,
// mêmes ancres. Seuls changent la langue du document et le libellé du bandeau,
// que script.js lit dans data-v-label — c'est exactement ce que ce test couvre.
const LOCALES = [
  { page: 'index.html',    url: 'https://varec.bernik.io/',    banner: 'Dernière version : v1.5.35 · 31 juillet 2026BETA' },
  { page: 'en/index.html', url: 'https://varec.bernik.io/en/', banner: 'Latest version: v1.5.35 · 31 July 2026BETA' },
];

async function run(fetchImpl, scenario, locale) {
  console.log(`\n── ${scenario} ──`);
  const html = fs.readFileSync(path.join(ROOT, locale.page), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: locale.url });
  const { window } = dom;
  window.fetch = fetchImpl;
  window.requestAnimationFrame = () => 0;
  // Non implémenté par jsdom, utilisé par le menu burger.
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.eval(fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8'));
  // Laisse les promesses du recalage se résoudre.
  await new Promise((r) => setTimeout(r, 50));
  return window.document;
}

async function scenarios(locale) {
  console.log(`\n════ ${locale.page} ════`);

  // ── Cas nominal : l'API répond ──
  const okFetch = async () => ({ ok: true, status: 200, json: async () => RELEASES });
  let doc = await run(okFetch, 'API disponible', locale);

  const href = (arch) => doc.querySelector(`[data-arch="${arch}"]`).getAttribute('href');
  const sub = (arch) => doc.querySelector(`[data-arch="${arch}"] .btn-download-sub`).textContent;

  check('arm64 → dernier DMG arm64 réel (1.5.35, pas la 1.5.37 vide)',
    href('arm64'), `${DL}/v1.5.35/VAREC-1.5.35-arm64.dmg`);
  check('intel → DMG Intel 1.5.35 (et non le -arm64)',
    href('intel'), `${DL}/v1.5.35/VAREC-1.5.35.dmg`);
  check('win → .exe 1.5.28, nom de fichier réel avec points',
    href('win'), `${DL}/v1.5.28/VAREC.Setup.1.5.28.exe`);
  check('linux → AppImage 1.5.28',
    href('linux'), `${DL}/v1.5.28/VAREC-1.5.28.AppImage`);

  check('sous-titre arm64 porte sa version et sa taille réelle',
    sub('arm64'), 'macOS · arm64 · v1.5.35 · 94 MB');
  check('sous-titre win porte sa propre version (désalignée de macOS)',
    sub('win'), '.exe · x64 · v1.5.28 · 81 MB');

  check('CTA de nav recalé sur la dernière version téléchargeable',
    doc.querySelector('.nav-cta').textContent.trim().replace(/\s+/g, ' '), '↓ v1.5.35 BETA');
  check('badge BETA du CTA préservé',
    !!doc.querySelector('.nav-cta .beta-badge'), true);
  // Le libellé ET la date suivent la langue de la page : c'est le seul point
  // où les deux accueils divergent, et celui qui casserait si script.js
  // réintroduisait une chaîne française en dur.
  check('bandeau version recalé (libellé + tag + date de la locale)',
    doc.querySelector('.v-info').textContent.trim().replace(/\s+/g, ' '),
    locale.banner);
  check('pastille .v-dot préservée',
    !!doc.querySelector('.v-info .v-dot'), true);

  // ── Repli : l'API échoue (hors ligne, quota 403) ──
  // L'invariant est que le repli reste EXACTEMENT ce que porte le HTML, quelle
  // que soit la version qui y figure : update-version la fait bouger à chaque
  // release, un attendu codé en dur casserait ce test à chaque bump.
  const raw = new JSDOM(fs.readFileSync(path.join(ROOT, locale.page), 'utf8')).window.document;
  const rawHref = (arch) => raw.querySelector(`[data-arch="${arch}"]`).getAttribute('href');
  const rawCta = raw.querySelector('.nav-cta').textContent.trim().replace(/\s+/g, ' ');

  const koFetch = async () => ({ ok: false, status: 403, json: async () => ({}) });
  doc = await run(koFetch, 'API indisponible (403) → repli statique', locale);

  check('arm64 conserve le href statique du HTML', href('arm64'), rawHref('arm64'));
  check('intel conserve le href statique du HTML', href('intel'), rawHref('intel'));
  check('win conserve le href statique du HTML', href('win'), rawHref('win'));
  check('CTA de nav intact',
    doc.querySelector('.nav-cta').textContent.trim().replace(/\s+/g, ' '), rawCta);

  // Le repli doit être cohérent avec lui-même : c'est précisément l'invariant
  // qui a été violé en production (bandeau v1.5.38, liens v1.5.35).
  const tagOf = (s) => (s.match(/v\d[\d.]*\d/) || [''])[0];
  check('repli statique cohérent : CTA et lien macOS sur la même version',
    tagOf(rawCta), tagOf(rawHref('arm64')));

  // ── Assets déposés APRÈS la publication de la release ──
  // GitHub ne rejoue pas l'évènement `release: published` quand on ajoute un
  // binaire à une release déjà publiée : un pipeline qui ne réagit qu'à cet
  // évènement fige les liens pour toujours. La résolution au chargement, elle,
  // voit le nouvel asset sans qu'aucun workflow n'ait à être relancé.
  const LATE = JSON.parse(JSON.stringify(RELEASES));
  LATE[0].assets = [
    { name: 'VAREC-1.5.37-arm64.dmg', size: 98986125, browser_download_url: `${DL}/v1.5.37/VAREC-1.5.37-arm64.dmg` },
    { name: 'VAREC-1.5.37.dmg',       size: 106505880, browser_download_url: `${DL}/v1.5.37/VAREC-1.5.37.dmg` },
  ];
  const lateFetch = async () => ({ ok: true, status: 200, json: async () => LATE });
  doc = await run(lateFetch, 'DMG ajoutés après publication → repris sans relancer de workflow', locale);

  check('arm64 suit la release fraîchement pourvue',
    href('arm64'), `${DL}/v1.5.37/VAREC-1.5.37-arm64.dmg`);
  check('win reste sur sa propre dernière release pourvue',
    href('win'), `${DL}/v1.5.28/VAREC.Setup.1.5.28.exe`);
  check('CTA de nav suit la version désormais servable',
    doc.querySelector('.nav-cta').textContent.trim().replace(/\s+/g, ' '), '↓ v1.5.37 BETA');

}

(async () => {
  for (const locale of LOCALES) await scenarios(locale);

  console.log(failures === 0 ? '\n✓ tous les cas passent' : `\n✗ ${failures} échec(s)`);
  process.exit(failures === 0 ? 0 : 1);
})();
