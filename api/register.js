'use strict';

const { logCustomer } = require('./_logCustomer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, type, version, arch } = req.body || {};
  if (!email || !type) return res.status(400).json({ error: 'Missing fields' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    await logCustomer({ email, type, version, arch });
  } catch (err) {
    // L'enregistrement a échoué : on le remonte en 5xx pour qu'il apparaisse
    // dans les erreurs Vercel, et pas seulement noyé dans les logs. Le front
    // (script.js) ignore la réponse, donc le téléchargement n'est pas bloqué.
    console.error('logCustomer FAILED', { type, version, arch, error: err && err.message });
    return res.status(500).json({ ok: false, logged: false });
  }

  return res.status(200).json({ ok: true, logged: true });
};
