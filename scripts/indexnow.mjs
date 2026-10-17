// Notifie IndexNow — donc Bing, et par ricochet ChatGPT, qui s'appuie
// largement sur son index — que les pages du sitemap ont changé.
//
// IndexNow ne demande aucun compte : la seule preuve de propriété est le
// fichier <clé>.txt servi à la racine du domaine, qui contient la clé.
//
//   node scripts/indexnow.mjs            → notifie
//   node scripts/indexnow.mjs --dry-run  → affiche sans envoyer
import { readFileSync, readdirSync } from 'node:fs';

const HOTE = 'varec.bernik.io';
const racine = new URL('..', import.meta.url).pathname;

const fichierCle = readdirSync(racine).find(f => /^[0-9a-f]{32}\.txt$/.test(f));
if (!fichierCle) {
  console.error("Aucun fichier de clé IndexNow à la racine. Attendu : <32 caractères hexadécimaux>.txt");
  process.exit(1);
}
const cle = readFileSync(racine + fichierCle, 'utf8').trim();
if (cle !== fichierCle.replace('.txt', '')) {
  console.error(`Le fichier ${fichierCle} doit contenir la clé elle-même, sans rien d'autre.`);
  process.exit(1);
}

const sitemap = readFileSync(racine + 'sitemap.xml', 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
if (!urls.length) { console.error('Aucune URL dans le sitemap.'); process.exit(1); }

const charge = { host: HOTE, key: cle, keyLocation: `https://${HOTE}/${fichierCle}`, urlList: urls };

if (process.argv.includes('--dry-run')) {
  console.log(`${urls.length} URLs seraient notifiées avec la clé ${cle.slice(0, 8)}…`);
  urls.forEach(u => console.log('  ' + u));
  process.exit(0);
}

const r = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(charge),
});
// 200 et 202 valent tous deux acceptation ; 422 signale une clé non vérifiable.
console.log(`IndexNow → HTTP ${r.status} pour ${urls.length} URLs`);
process.exit(r.ok ? 0 : 1);
