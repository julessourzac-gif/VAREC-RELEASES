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

async function run(fetchImpl, scenario) {
  console.log(`\n── ${scenario} ──`);
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://varec.bernik.io/' });
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

(async () => {
  // ── Cas nominal : l'API répond ──
  const okFetch = async () => ({ ok: true, status: 200, json: async () => RELEASES });
  let doc = await run(okFetch, 'API disponible');

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
  check('bandeau version recalé (tag + date)',
    doc.querySelector('.v-info').textContent.trim().replace(/\s+/g, ' '),
    'Dernière version : v1.5.35 · 31 juillet 2026BETA');
  check('pastille .v-dot préservée',
    !!doc.querySelector('.v-info .v-dot'), true);

  // ── Repli : l'API échoue (hors ligne, quota 403) ──
  const koFetch = async () => ({ ok: false, status: 403, json: async () => ({}) });
  doc = await run(koFetch, 'API indisponible (403) → repli statique');

  check('arm64 conserve le href statique du HTML',
    href('arm64'), `${DL}/v1.5.35/VAREC-1.5.35-arm64.dmg`);
  check('win conserve le href statique corrigé',
    href('win'), `${DL}/v1.5.28/VAREC.Setup.1.5.28.exe`);
  check('CTA de nav intact',
    doc.querySelector('.nav-cta').textContent.trim().replace(/\s+/g, ' '), '↓ v1.5.35 BETA');

  console.log(failures === 0 ? '\n✓ tous les cas passent' : `\n✗ ${failures} échec(s)`);
  process.exit(failures === 0 ? 0 : 1);
})();
