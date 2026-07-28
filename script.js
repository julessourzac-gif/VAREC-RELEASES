// ── Canvas preview désactivé ──
(function () {
  const canvas = document.getElementById('varecCanvas');
  if (!canvas) return;
  return; // désactivé
  const ctx = canvas.getContext('2d');

  let W, H, dpr;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const CH = 8;
  const LABELS = ['CH01','CH02','CH03','CH04','CH05','CH06','CH07','CH08'];
  // couleurs groupe issues de l'app
  const GC = ['#ff453a','#ff9f0a','#30d158','#5ac8fa','#0a84ff','#bf5af2','#ff6b81','#ffd60a'];
  const FREQS  = [0.9,1.5,2.2,0.6,1.9,3.2,0.8,1.3];
  const PHASES = [0,1.1,2.3,0.4,1.7,0.9,2.8,1.5];
  const AMPS   = [0.65,0.45,0.28,0.72,0.38,0.18,0.55,0.32];

  let t = 0;
  let tcH=1,tcM=23,tcS=14,tcF=0,tcAcc=0;
  let blinkOn=true,blinkN=0;
  const peaks = new Float32Array(CH);
  const peakHold = new Int32Array(CH);

  function pad2(n){return n<10?'0'+n:''+n;}
  function tcStr(){return pad2(tcH)+':'+pad2(tcM)+':'+pad2(tcS)+':'+pad2(tcF);}

  function drawVU(x,y,w,h,level,peakLevel){
    const SEGS=16, segH=(h-2)/SEGS;
    for(let i=0;i<SEGS;i++){
      const sy=y+h-(i+1)*segH-1, thr=i/SEGS;
      let col;
      if(thr>0.88) col='#ff453a';
      else if(thr>0.72) col='#ff9f0a';
      else col='#0a84ff';
      ctx.fillStyle=level>thr?col:'rgba(0,0,0,.35)';
      ctx.fillRect(x,sy,w,segH-1);
    }
    if(peakLevel>0.05){
      const py=(y+h-4)-peakLevel*(h-8);
      ctx.fillStyle=peakLevel>0.88?'#ff453a':(peakLevel>0.72?'#ff9f0a':'#5ac8fa');
      ctx.fillRect(x,py,w,2);
    }
  }

  function drawChannel(i,x,y,w,h){
    const amp=AMPS[i]*(h/2-4);
    const freq=FREQS[i], phase=PHASES[i], gc=GC[i];

    // background
    ctx.fillStyle=i%2===0?'rgba(44,44,46,.65)':'rgba(28,28,30,.65)';
    ctx.fillRect(x,y,w,h);

    // left color bar (groupe)
    ctx.fillStyle=gc;
    ctx.fillRect(x,y,3,h);

    // label
    ctx.fillStyle='rgba(200,200,220,.55)';
    ctx.font="bold 10px 'SF Mono',Menlo,monospace";
    ctx.fillText(LABELS[i],x+8,y+h/2+4);

    // waveform
    const wX=x+55, wW=Math.max(40,w-55-56), midY=y+h/2;
    ctx.beginPath();
    ctx.strokeStyle='rgba(90,200,250,.9)';
    ctx.lineWidth=1.3;
    ctx.shadowColor='#5ac8fa'; ctx.shadowBlur=5;
    for(let px=0;px<wW;px++){
      const tp=-(px/wW)*6*Math.PI+t*freq*2+phase;
      const v=Math.sin(tp)*0.7+Math.sin(tp*2.1)*0.2+Math.sin(tp*0.5)*0.1;
      const yy=midY+v*amp;
      if(px===0) ctx.moveTo(wX+px,yy); else ctx.lineTo(wX+px,yy);
    }
    ctx.stroke();
    ctx.shadowBlur=0;

    // level + peak
    const level=0.22+AMPS[i]*0.78*(0.6+0.4*Math.abs(Math.sin(t*freq*1.5)));
    if(level>peaks[i]){peaks[i]=level;peakHold[i]=55;}
    else if(peakHold[i]>0){peakHold[i]--;}
    else{peaks[i]=Math.max(0,peaks[i]-0.009);}

    drawVU(x+w-50,y+3,40,h-6,level,peaks[i]);
  }

  function draw(){
    ctx.clearRect(0,0,W,H);

    // grid
    ctx.strokeStyle='rgba(255,255,255,.06)'; ctx.lineWidth=1;
    for(let gx=0;gx<W;gx+=90){
      ctx.beginPath(); ctx.moveTo(gx+.5,0); ctx.lineTo(gx+.5,H); ctx.stroke();
    }

    const TOP=44, BOT=8;
    const chH=(H-TOP-BOT)/CH;
    for(let i=0;i<CH;i++) drawChannel(i,0,TOP+i*chH,W,chH);

    // toolbar
    ctx.fillStyle='rgba(20,20,22,.94)';
    ctx.fillRect(0,0,W,TOP);
    ctx.strokeStyle='rgba(255,255,255,.1)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(0,TOP+.5); ctx.lineTo(W,TOP+.5); ctx.stroke();

    // REC blink
    blinkN++; if(blinkN>=28){blinkOn=!blinkOn;blinkN=0;}
    ctx.shadowColor='#ff453a'; ctx.shadowBlur=blinkOn?16:0;
    ctx.fillStyle=blinkOn?'#ff453a':'rgba(255,69,58,.22)';
    ctx.beginPath(); ctx.arc(22,TOP/2,7,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle=blinkOn?'#ff453a':'rgba(255,69,58,.4)';
    ctx.font="bold 11px 'SF Mono',Menlo,monospace";
    ctx.fillText('REC',34,TOP/2+4);

    // TC
    const tcText=tcStr();
    ctx.font="bold 17px 'SF Mono',Menlo,monospace";
    const tcW=ctx.measureText(tcText).width;
    ctx.fillStyle='rgba(90,200,250,.08)';
    ctx.fillRect(W/2-tcW/2-12,7,tcW+24,28);
    ctx.strokeStyle='rgba(90,200,250,.22)'; ctx.lineWidth=1;
    ctx.strokeRect(W/2-tcW/2-12,7,tcW+24,28);
    ctx.fillStyle='#5ac8fa'; ctx.shadowColor='#5ac8fa'; ctx.shadowBlur=8;
    ctx.fillText(tcText,W/2-tcW/2,26);
    ctx.shadowBlur=0;

    // badges right
    ctx.fillStyle='rgba(255,255,255,.06)';
    ctx.fillRect(W-68,8,60,26);
    ctx.fillStyle='rgba(255,255,255,.5)';
    ctx.font="10px 'SF Mono',Menlo,monospace";
    ctx.fillText('48kHz·24',W-64,24);
    if(W>500){
      ctx.fillStyle='rgba(255,255,255,.06)';
      ctx.fillRect(W-136,8,62,26);
      ctx.fillStyle='rgba(255,255,255,.5)';
      ctx.fillText('8/512ch',W-132,24);
    }

    // TC advance
    tcAcc+=25/60;
    while(tcAcc>=1){tcAcc-=1;tcF++;if(tcF>=25){tcF=0;tcS++;}if(tcS>=60){tcS=0;tcM++;}if(tcM>=60){tcM=0;tcH++;}}

    t+=0.022;
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── Animated VU bars in the CSS mockup ──
(function(){
  const fills = document.querySelectorAll('.m-vu-fill');
  if(!fills.length) return;
  const widths = [72,55,30,85,42,18,65,38];
  const freqs  = [0.9,1.4,2.1,0.7,1.8,3.0,1.1,1.6];
  const phases = [0,0.8,1.6,0.3,1.2,2.4,0.5,1.9];
  let t2=0;
  function tick(){
    fills.forEach((el,i)=>{
      const base=widths[i]/100;
      const v=base*(0.6+0.4*Math.abs(Math.sin(t2*freqs[i]+phases[i])));
      const pct=Math.round(v*100);
      el.style.width=pct+'%';
      el.classList.toggle('hot',pct>72);
      el.classList.toggle('clip',pct>88);
    });
    t2+=0.04;
    requestAnimationFrame(tick);
  }
  tick();
})();

// ── Scroll reveal ──
(function(){
  const cards=document.querySelectorAll('.feature-row, .step, .news-item, .use-card');
  if(!('IntersectionObserver' in window)){cards.forEach(c=>c.classList.add('visible'));return;}
  // Les cartes v14 ne sont masquées que si ce script tourne (cf. .js-reveal).
  document.documentElement.classList.add('js-reveal');
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach((e,i)=>{
      if(e.isIntersecting){
        setTimeout(()=>e.target.classList.add('visible'),i*70);
        obs.unobserve(e.target);
      }
    });
  },{threshold:.1,rootMargin:'0px 0px -30px 0px'});
  cards.forEach(c=>obs.observe(c));
})();


// ── Nav opacity on scroll ──
(function(){
  const nav=document.querySelector('body > nav');
  if(!nav) return;
  window.addEventListener('scroll',()=>{
    nav.style.background=window.scrollY>60
      ?'rgba(28,28,30,.97)'
      :'rgba(28,28,30,.88)';
  });
})();

// ── Mobile burger menu ──
(function(){
  const nav = document.querySelector('body > nav');
  if (!nav) return;
  const burger = nav.querySelector('.nav-burger');
  if (!burger) return;

  function close() {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function toggle() {
    const opened = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', opened ? 'true' : 'false');
    document.body.style.overflow = opened ? 'hidden' : '';
  }

  burger.addEventListener('click', function(e){
    e.stopPropagation();
    toggle();
  });
  // Close when tapping a link
  nav.querySelectorAll('.nav-links a').forEach(function(a){
    a.addEventListener('click', close);
  });
  // Close when tapping outside
  document.addEventListener('click', function(e){
    if (nav.classList.contains('open') && !nav.contains(e.target)) close();
  });
  // Close on Escape
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') close();
  });
  // Close when crossing back to desktop width
  let lastIsMobile = window.matchMedia('(max-width: 768px)').matches;
  window.addEventListener('resize', function(){
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (lastIsMobile && !isMobile) close();
    lastIsMobile = isMobile;
  });
})();

// ── Email gate before download / purchase ──
(function () {
  const modal     = document.getElementById('email-modal');
  const form      = document.getElementById('email-form');
  const input     = document.getElementById('modal-email');
  const submitBtn = document.getElementById('modal-submit');
  const closeBtn  = document.getElementById('modal-close');
  if (!modal) return;

  // Repli au niveau de la page. .version-badge a disparu en 3bd0c74 : le
  // numéro vit désormais dans le CTA de la nav (« ↓ v1.5.32 »).
  const badge   = document.querySelector('.version-badge, .nav-cta');
  const version = badge ? (badge.textContent.match(/[\d.]+/) || [''])[0] : '';

  // Version réellement servie, lue dans le tag de la release :
  // .../releases/download/v1.5.32/VAREC-1.5.32-arm64.dmg → 1.5.32
  // Les plateformes ne sont pas alignées (macOS 1.5.32, Windows/Linux 1.4.35),
  // donc une valeur unique de page serait fausse pour une partie des liens.
  function versionFromHref(href) {
    const m = /\/download\/v?([\d][\d.]*)\//.exec(href || '');
    return m ? m[1].replace(/\.$/, '') : '';
  }

  let pendingAction = null;

  function openModal(action) {
    pendingAction = action;
    const saved = sessionStorage.getItem('varec_email');
    if (saved) input.value = saved;
    modal.classList.add('open');
    modal.removeAttribute('aria-hidden');
    setTimeout(() => input.focus(), 80);
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    pendingAction = null;
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  document.querySelectorAll('[data-register]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (sessionStorage.getItem('varec_email_done')) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      openModal({ el: el, type: el.dataset.registerType || 'download', arch: el.dataset.arch || '' });
    }, true);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = input.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      input.focus();
      input.style.borderColor = '#ff453a';
      setTimeout(function () { input.style.borderColor = ''; }, 1200);
      return;
    }

    // À lire avant closeModal(), qui remet pendingAction à null.
    const action = pendingAction;

    const actionHref = action && action.el ? (action.el.href || action.el.getAttribute('href') || '') : '';
    const ver        = versionFromHref(actionHref) || version;

    // Enregistrement en arrière-plan : le téléchargement ne doit pas attendre
    // l'aller-retour réseau (~1 s en production). keepalive garantit l'envoi
    // même si le navigateur quitte la page dans la foulée.
    try {
      fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({ email: email, type: action ? action.type : 'download', version: ver, arch: action ? action.arch : '' })
      }).catch(function () { /* non-blocking */ });
    } catch (_) { /* non-blocking */ }

    sessionStorage.setItem('varec_email_done', '1');
    sessionStorage.setItem('varec_email', email);
    closeModal();

    // Déclenché de façon synchrone, dans le geste utilisateur : après un await,
    // les navigateurs bloquent window.open et fiabilisent mal les téléchargements.
    if (!action) return;
    const el   = action.el;
    const href = el.href || el.getAttribute('href');
    if (!href) return;

    if (href.includes('buy.stripe.com')) {
      try {
        const url = new URL(href);
        url.searchParams.set('prefilled_email', email);
        window.open(url.toString(), '_blank', 'noopener,noreferrer');
      } catch (_) { window.open(href, '_blank', 'noopener,noreferrer'); }
    } else {
      const a = document.createElement('a');
      a.href = href;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  });
})();

// ── Lightbox des captures d'écran ──
(function () {
  const box   = document.getElementById('lightbox');
  const img   = document.getElementById('lightbox-img');
  const cap   = document.getElementById('lightbox-cap');
  const close = document.getElementById('lightbox-close');
  const shots = document.querySelectorAll('[data-shot]');
  if (!box || !shots.length) return;

  function open(src, caption, alt) {
    img.src = src;
    img.alt = alt || caption || '';
    cap.textContent = caption || '';
    box.classList.add('open');
    box.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    close.focus();
  }
  function hide() {
    box.classList.remove('open');
    box.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    img.src = '';
  }

  shots.forEach(function (el) {
    el.addEventListener('click', function () {
      const inner = el.querySelector('img');
      open(el.dataset.shot, el.dataset.cap || '', inner ? inner.alt : '');
    });
  });
  close.addEventListener('click', hide);
  box.addEventListener('click', function (e) { if (e.target === box) hide(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && box.classList.contains('open')) hide();
  });
})();
