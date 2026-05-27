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
    // Log failure is non-blocking — don't prevent the user from downloading
    console.error('logCustomer:', err);
  }

  return res.status(200).json({ ok: true });
};
