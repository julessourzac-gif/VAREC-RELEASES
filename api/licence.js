'use strict';

const crypto = require('crypto');

const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const EPOCH_DAY = Math.floor(new Date('2026-01-01').getTime() / 86400000);

function b32encode(buf) {
  let bits = 0n;
  for (const b of buf) bits = (bits << 8n) | BigInt(b);
  let result = '';
  for (let i = 0; i < 16; i++) {
    result = B32[Number(bits & 31n)] + result;
    bits >>= 5n;
  }
  return result;
}

function generateKey() {
  const SIGN_KEY = process.env.VAREC_SIGN_KEY;
  if (!SIGN_KEY) throw new Error('VAREC_SIGN_KEY not set');

  // type=1 (pro), expiry=0 (permanent), vMajor=0xFF, vMinor=0xFF
  const payload = Buffer.alloc(6);
  payload[0] = 1;
  payload.writeUInt16BE(0, 1);
  payload[3] = 0xFF;
  payload[4] = 0xFF;
  payload[5] = crypto.randomBytes(1)[0];

  const hmac = crypto.createHmac('sha256', SIGN_KEY).update(payload).digest();
  const full = Buffer.concat([payload, hmac.slice(0, 4)]);
  return b32encode(full).match(/.{4}/g).join('-');
}

async function sendEmail(to, name, key) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not set');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'VAREC <licence@bernik.fr>',
      to: [to],
      subject: 'Votre licence VAREC Pro',
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;background:#0a0a0a;color:#e8e8e8;border-radius:12px;padding:40px;">
          <img src="https://varec-releases.vercel.app/logo.png" alt="VAREC" style="height:32px;margin-bottom:32px;">
          <h1 style="font-size:22px;font-weight:700;margin:0 0 8px;">Votre licence VAREC Pro</h1>
          <p style="color:#888;margin:0 0 32px;">Bonjour ${name},</p>
          <p style="color:#aaa;margin:0 0 24px;">Voici votre clé de licence :</p>
          <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:20px 24px;text-align:center;margin-bottom:32px;">
            <span style="font-family:monospace;font-size:20px;letter-spacing:2px;color:#ffffff;font-weight:600;">${key}</span>
          </div>
          <p style="color:#666;font-size:13px;margin:0;">Licence Pro · Permanente · Pour activer : VAREC → Préférences → Licence</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const rawBody = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true });
  }

  const session = event.data.object;
  const email = session.customer_details?.email;
  const name = session.customer_details?.name?.split(' ')[0] || 'cher client';

  if (!email) {
    return res.status(400).json({ error: 'No customer email' });
  }

  try {
    const key = generateKey();
    await sendEmail(email, name, key);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
