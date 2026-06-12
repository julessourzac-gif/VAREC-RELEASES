'use strict';

async function logCustomer({ email, type, version = '', arch = '', licenseKey = '' }) {
  const token = process.env.CUSTOMERS_GITHUB_TOKEN;
  const repo  = process.env.CUSTOMERS_REPO;
  if (!token || !repo) {
    console.warn('CUSTOMERS_GITHUB_TOKEN or CUSTOMERS_REPO not set — skipping log');
    return;
  }

  const path    = 'customers.csv';
  const date    = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const safe    = (s) => String(s || '').replace(/,/g, '').replace(/\n/g, '');
  const newRow  = `${date},${safe(email)},${safe(type)},${safe(version)},${safe(arch)},${safe(licenseKey)}\n`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    const getResp = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, { headers });

    let sha = null;
    let current = '';

    if (getResp.ok) {
      const data = await getResp.json();
      sha = data.sha;
      current = Buffer.from(data.content, 'base64').toString('utf-8');
    } else if (getResp.status === 404) {
      current = 'date,email,type,version,arch,license_key\n';
    } else {
      throw new Error(`GitHub read error ${getResp.status}`);
    }

    const putResp = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `log: ${type} ${date.slice(0, 10)}`,
        content: Buffer.from(current + newRow).toString('base64'),
        ...(sha && { sha }),
      }),
    });

    if (putResp.ok) return;
    if (putResp.status === 409) continue; // SHA conflict → retry
    const err = await putResp.json().catch(() => ({}));
    throw new Error(`GitHub write error ${putResp.status}: ${JSON.stringify(err)}`);
  }
  throw new Error('logCustomer: max retries exceeded');
}

module.exports = { logCustomer };
