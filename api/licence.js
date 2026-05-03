const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');

// Désactive le body parser de Vercel — Stripe a besoin du raw body pour vérifier la signature
module.exports.config = { api: { bodyParser: false } };

function generateKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () => Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `VAREC-${seg()}-${seg()}-${seg()}-${seg()}`;
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function sendEmail(to, name, key) {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#1c1c1e;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#2c2c2e;border-radius:16px;overflow:hidden;">
    <div style="background:#0d1a0e;padding:32px 36px 24px;text-align:center;">
      <img src="https://raw.githubusercontent.com/julessourzac-gif/VAREC-RELEASES/main/logo.png" alt="VAREC" style="height:52px;width:auto;">
    </div>
    <div style="padding:36px;">
      <p style="margin:0 0 6px;font-size:13px;color:#98989f;text-transform:uppercase;letter-spacing:1.5px;">Votre licence</p>
      <h1 style="margin:0 0 28px;font-size:24px;font-weight:800;color:#f5f5f7;letter-spacing:-.5px;">
        Merci ${name} !<br>VAREC est activé.
      </h1>

      <p style="margin:0 0 16px;font-size:14px;color:#98989f;line-height:1.6;">
        Voici votre numéro de licence à entrer dans VAREC → menu <strong style="color:#f5f5f7;">Aide → Activer la licence</strong> :
      </p>

      <div style="background:#1c1c1e;border:1px solid rgba(76,217,100,.35);border-radius:12px;padding:20px;text-align:center;margin:0 0 28px;">
        <span style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:22px;font-weight:700;color:#4cd964;letter-spacing:2px;">${key}</span>
      </div>

      <p style="margin:0 0 24px;font-size:13px;color:#98989f;line-height:1.6;">
        Cette licence est nominative et valable sur un seul Mac.<br>
        Conservez ce numéro — il ne sera plus envoyé.
      </p>

      <a href="https://github.com/julessourzac-gif/VAREC-RELEASES/releases/latest"
         style="display:inline-block;padding:12px 24px;background:#4cd964;color:#000;border-radius:8px;text-decoration:none;font-size:14px;font-weight:700;">
        Télécharger VAREC
      </a>
    </div>
    <div style="padding:16px 36px 24px;border-top:1px solid rgba(255,255,255,.08);">
      <p style="margin:0;font-size:11px;color:#545458;text-align:center;">
        © 2026 BERNIK — VAREC macOS Field Recorder<br>
        Pour toute question : <a href="mailto:jules.sourzac@icloud.com" style="color:#545458;">jules.sourzac@icloud.com</a>
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
      subject: `Votre licence VAREC — ${key}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
  return res.json();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details?.email;
    const name = session.customer_details?.name || 'Client';

    if (!email) {
      console.error('No email in session:', session.id);
      return res.status(200).json({ received: true });
    }

    const key = generateKey();
    console.log(`Licence générée pour ${email}: ${key}`);

    try {
      await sendEmail(email, name, key);
      console.log(`Email envoyé à ${email}`);
    } catch (err) {
      console.error('Email error:', err.message);
      // On renvoie 200 à Stripe même si l'email échoue — évite les retry infinis
      // Investiguer dans les logs Vercel
    }
  }

  return res.status(200).json({ received: true });
};
