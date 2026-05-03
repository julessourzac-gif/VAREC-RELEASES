'use strict';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');

module.exports.config = { api: { bodyParser: false } };

// ── Crockford base32 (identique à license.js) ────────────────
const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

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

// ── Génération de clé Pro permanente ─────────────────────────
// Reproduit exactement generateKey('pro', 0, 0xFF, 0xFF) de license.js
function generateProKey() {
  const SIGN_KEY  = process.env.VAREC_SIGN_KEY; // ea25beca4ff323167309c01ade6ab6dac218ca90cac3782177072ac43dcceeaf
  const typeId    = 1;   // pro
  const expiry    = 0;   // permanent
  const vMajor    = 0xFF;
  const vMinor    = 0xFF;

  const payload = Buffer.alloc(6);
  payload[0] = typeId;
  payload.writeUInt16BE(expiry, 1);
  payload[3] = vMajor;
  payload[4] = vMinor;
  payload[5] = crypto.randomBytes(1)[0];

  const hmac = crypto.createHmac('sha256', SIGN_KEY).update(payload).digest();
  const full = Buffer.concat([payload, hmac.slice(0, 4)]);

  return b32encode(full).match(/.{4}/g).join('-');
}

// ── Raw body pour vérification signature Stripe ───────────────
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// ── Email licence via Resend ──────────────────────────────────
async function sendEmail(to, name, key) {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#1c1c1e;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#2c2c2e;border-radius:16px;overflow:hidden;">
    <div style="background:#0d1a0e;padding:32px 36px 24px;text-align:center;">
      <img src="https://raw.githubusercontent.com/julessourzac-gif/VAREC-RELEASES/main/logo.png" alt="VAREC" style="height:52px;width:auto;">
    </div>
    <div style="padding:36px;">
      <p style="margin:0 0 6px;font-size:13px;color:#98989f;text-transform:uppercase;letter-spacing:1.5px;">Votre licence Pro</p>
      <h1 style="margin:0 0 28px;font-size:24px;font-weight:800;color:#f5f5f7;letter-spacing:-.5px;">Merci ${name}&nbsp;!<br>VAREC Pro est activé.</h1>

      <p style="margin:0 0 16px;font-size:14px;color:#98989f;line-height:1.6;">
        Entrez ce numéro dans VAREC →&nbsp;<strong style="color:#f5f5f7;">Aide → Activer la licence</strong> :
      </p>

      <div style="background:#1c1c1e;border:1px solid rgba(76,217,100,.35);border-radius:12px;padding:20px;text-align:center;margin:0 0 28px;">
        <span style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:26px;font-weight:700;color:#4cd964;letter-spacing:3px;">${key}</span>
      </div>

      <p style="margin:0 0 8px;font-size:13px;color:#98989f;line-height:1.6;">
        Licence <strong style="color:#f5f5f7;">Pro permanente</strong> — pas de date d'expiration.<br>
        Conservez ce numéro, il ne sera plus renvoyé.
      </p>

      <p style="margin:0 0 28px;font-size:12px;color:#545458;">
        Nominative — valable sur un seul Mac.
      </p>

      <a href="https://github.com/julessourzac-gif/VAREC-RELEASES/releases/latest"
         style="display:inline-block;padding:12px 24px;background:#4cd964;color:#000;border-radius:8px;text-decoration:none;font-size:14px;font-weight:700;">
        Télécharger VAREC
      </a>
    </div>
    <div style="padding:16px 36px 24px;border-top:1px solid rgba(255,255,255,.08);text-align:center;">
      <p style="margin:0;font-size:11px;color:#545458;line-height:1.6;">
        © 2026 BERNIK — VAREC macOS Field Recorder<br>
        <a href="mailto:jules.sourzac@icloud.com" style="color:#545458;">jules.sourzac@icloud.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'VAREC <licence@bernik.fr>',
      to,
      subject: `Votre licence VAREC Pro — ${key}`,
      html,
    }),
  });

  if (!res.ok) throw new Error(`Resend: ${await res.text()}`);
}

// ── Handler webhook Stripe ────────────────────────────────────
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[licence] Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email   = session.customer_details?.email;
    const name    = session.customer_details?.name || 'Client';

    if (!email) {
      console.error('[licence] No email in session:', session.id);
      return res.status(200).json({ received: true });
    }

    const key = generateProKey();
    console.log(`[licence] Clé Pro générée pour ${email}: ${key}`);

    try {
      await sendEmail(email, name, key);
      console.log(`[licence] Email envoyé à ${email}`);
    } catch (err) {
      console.error('[licence] Email error:', err.message);
      // 200 renvoyé à Stripe pour éviter les retry — investiguer dans les logs Vercel
    }
  }

  return res.status(200).json({ received: true });
};
