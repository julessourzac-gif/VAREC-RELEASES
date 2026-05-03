// ======================== VAREC INTERFACE PREVIEW ========================
(function () {
  const canvas = document.getElementById('varecCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, dpr;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const CHANNELS = 8;
  const LABELS = ['CH01', 'CH02', 'CH03', 'CH04', 'CH05', 'CH06', 'CH07', 'CH08'];
  const COLORS = ['#00c8ff', '#00d8a8', '#00b8ff', '#20d0e0', '#00a8ff', '#10c8b0', '#30c8f8', '#18e0c0'];
  const FREQS = [0.9, 1.5, 2.2, 0.6, 1.9, 3.2, 0.8, 1.3];
  const PHASES = [0, 1.1, 2.3, 0.4, 1.7, 0.9, 2.8, 1.5];
  const AMPS = [0.65, 0.45, 0.28, 0.72, 0.38, 0.18, 0.55, 0.32];

  let t = 0;
  let tcH = 1, tcM = 23, tcS = 14, tcF = 0;
  let tcAccum = 0;
  let blinkOn = true, blinkCounter = 0;

  const peaks = new Float32Array(CHANNELS);
  const peakHold = new Int32Array(CHANNELS);

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function tcStr() { return pad2(tcH) + ':' + pad2(tcM) + ':' + pad2(tcS) + ':' + pad2(tcF); }

  function drawVU(x, y, w, h, level) {
    const SEGS = 16;
    const segH = (h - 2) / SEGS;
    for (let i = 0; i < SEGS; i++) {
      const sy = y + h - (i + 1) * segH - 1;
      const threshold = i / SEGS;
      let col;
      if (threshold > 0.88) col = '#ff3040';
      else if (threshold > 0.72) col = '#ffa020';
      else col = '#00c8ff';
      ctx.fillStyle = level > threshold ? col : 'rgba(255,255,255,0.04)';
      ctx.fillRect(x, sy, w, segH - 1);
    }
  }

  function drawChannel(i, x, y, w, h) {
    const amp = AMPS[i] * (h / 2 - 4);
    const freq = FREQS[i];
    const phase = PHASES[i];
    const color = COLORS[i];

    ctx.fillStyle = i % 2 === 0 ? 'rgba(14, 22, 42, 0.7)' : 'rgba(10, 16, 32, 0.7)';
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = 'rgba(110, 140, 180, 0.7)';
    ctx.font = "bold 10px 'SF Mono', Consolas, monospace";
    ctx.fillText(LABELS[i], x + 6, y + h / 2 + 4);

    const waveStartX = x + 50;
    const waveW = Math.max(60, w - 50 - 56);
    const midY = y + h / 2;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 0.85;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    for (let px = 0; px < waveW; px++) {
      const tPos = -(px / waveW) * 6 * Math.PI + t * freq * 2 + phase;
      const v = Math.sin(tPos) * 0.7 + Math.sin(tPos * 2.1) * 0.2 + Math.sin(tPos * 0.5) * 0.1;
      const yy = midY + v * amp;
      if (px === 0) ctx.moveTo(waveStartX + px, yy);
      else ctx.lineTo(waveStartX + px, yy);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    const level = 0.25 + AMPS[i] * 0.75 * (0.6 + 0.4 * Math.abs(Math.sin(t * freq * 1.5)));
    if (level > peaks[i]) { peaks[i] = level; peakHold[i] = 50; }
    else if (peakHold[i] > 0) { peakHold[i]--; }
    else { peaks[i] = Math.max(0, peaks[i] - 0.008); }

    const vuX = x + w - 52;
    drawVU(vuX, y + 4, 42, h - 8, level);

    if (peaks[i] > 0.05) {
      const py = (y + h - 8) - peaks[i] * (h - 12);
      ctx.fillStyle = peaks[i] > 0.88 ? '#ff3040' : (peaks[i] > 0.72 ? '#ffa020' : '#00c8ff');
      ctx.fillRect(vuX, py, 42, 2);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(20, 40, 70, 0.4)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += 100) {
      ctx.beginPath();
      ctx.moveTo(gx + 0.5, 0);
      ctx.lineTo(gx + 0.5, H);
      ctx.stroke();
    }

    const TOP_H = 42;
    const BOT_PAD = 8;
    const chH = (H - TOP_H - BOT_PAD) / CHANNELS;

    for (let i = 0; i < CHANNELS; i++) {
      drawChannel(i, 0, TOP_H + i * chH, W, chH);
    }

    // Toolbar
    ctx.fillStyle = 'rgba(5, 7, 16, 0.92)';
    ctx.fillRect(0, 0, W, TOP_H);
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, TOP_H + 0.5);
    ctx.lineTo(W, TOP_H + 0.5);
    ctx.stroke();

    // REC indicator
    blinkCounter++;
    if (blinkCounter >= 28) { blinkOn = !blinkOn; blinkCounter = 0; }

    ctx.shadowColor = '#ff3040';
    ctx.shadowBlur = blinkOn ? 14 : 0;
    ctx.fillStyle = blinkOn ? '#ff3040' : 'rgba(255,48,64,0.25)';
    ctx.beginPath();
    ctx.arc(22, TOP_H / 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = blinkOn ? '#ff3040' : 'rgba(255,48,64,0.45)';
    ctx.font = "bold 12px 'SF Mono', Consolas, monospace";
    ctx.fillText('REC', 36, TOP_H / 2 + 4);

    // TC display
    const tcText = tcStr();
    ctx.font = "bold 18px 'SF Mono', Consolas, monospace";
    const tcW = ctx.measureText(tcText).width;

    ctx.fillStyle = 'rgba(0, 200, 255, 0.1)';
    ctx.fillRect(W / 2 - tcW / 2 - 14, 8, tcW + 28, 28);
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.25)';
    ctx.strokeRect(W / 2 - tcW / 2 - 14, 8, tcW + 28, 28);

    ctx.fillStyle = '#00c8ff';
    ctx.shadowColor = '#00c8ff';
    ctx.shadowBlur = 10;
    ctx.fillText(tcText, W / 2 - tcW / 2, 27);
    ctx.shadowBlur = 0;

    // FPS badge
    ctx.fillStyle = 'rgba(0, 200, 255, 0.08)';
    ctx.fillRect(W - 70, 9, 62, 24);
    ctx.fillStyle = 'rgba(0, 200, 255, 0.7)';
    ctx.font = "11px 'SF Mono', Consolas, monospace";
    ctx.fillText('25 fps', W - 64, 25);

    // Channel count
    if (W > 480) {
      ctx.fillStyle = 'rgba(0, 200, 255, 0.08)';
      ctx.fillRect(W - 142, 9, 65, 24);
      ctx.fillStyle = 'rgba(0, 200, 255, 0.7)';
      ctx.fillText('8 / 512', W - 134, 25);
    }

    // SR badge (left after REC)
    if (W > 600) {
      ctx.fillStyle = 'rgba(0, 200, 255, 0.08)';
      ctx.fillRect(78, 9, 78, 24);
      ctx.fillStyle = 'rgba(0, 200, 255, 0.7)';
      ctx.font = "11px 'SF Mono', Consolas, monospace";
      ctx.fillText('48 kHz · 24', 84, 25);
    }

    // Outer border
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

    // Advance TC at ~25fps from a ~60fps animation
    tcAccum += 25 / 60;
    while (tcAccum >= 1) {
      tcAccum -= 1;
      tcF++;
      if (tcF >= 25) { tcF = 0; tcS++; }
      if (tcS >= 60) { tcS = 0; tcM++; }
      if (tcM >= 60) { tcM = 0; tcH++; }
    }

    t += 0.022;
    requestAnimationFrame(draw);
  }

  draw();
})();

// ======================== SCROLL REVEAL ========================
(function () {
  const cards = document.querySelectorAll('.feature-card');
  if (!('IntersectionObserver' in window)) {
    cards.forEach(c => c.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  cards.forEach(c => obs.observe(c));
})();

// ======================== FORM ========================
(function () {
  const form = document.getElementById('licenceForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    const originalLabel = btn.textContent;
    btn.textContent = 'Envoi en cours...';
    btn.disabled = true;

    // If Formspree endpoint not configured, fall back to mailto
    if (form.action.indexOf('YOUR_FORM_ID') !== -1) {
      const data = new FormData(form);
      const body = [];
      for (const [k, v] of data.entries()) body.push(k + ': ' + v);
      window.location.href = 'mailto:jules.sourzac@icloud.com?subject=Demande%20de%20licence%20VAREC&body=' +
        encodeURIComponent(body.join('\n'));
      btn.textContent = originalLabel;
      btn.disabled = false;
      return;
    }

    try {
      const resp = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (resp.ok) {
        form.style.display = 'none';
        success.classList.add('visible');
      } else {
        throw new Error('Network');
      }
    } catch (err) {
      btn.textContent = 'Erreur — réessayer';
      btn.style.background = 'var(--red)';
      btn.disabled = false;
    }
  });
})();

// ======================== NAV SCROLL ========================
(function () {
  const nav = document.querySelector('nav');
  if (!nav) return;
  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      nav.style.background = 'rgba(6, 9, 18, 0.95)';
    } else {
      nav.style.background = 'rgba(6, 9, 18, 0.85)';
    }
  });
})();
