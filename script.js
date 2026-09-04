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
  const cards=document.querySelectorAll('.feature-row');
  if(!('IntersectionObserver' in window)){cards.forEach(c=>c.classList.add('visible'));return;}
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

// ── Liens de téléchargement : recalage sur la dernière version publiée ──
//
// Les href du HTML sont un repli statique, pas la source de vérité : ils
// dérivent à chaque release (la page a servi 1.5.35 sous un bouton annoncé
// 1.5.37, et le lien Windows pointait sur un nom de fichier inexistant).
// Au chargement, on relit les releases et on recale chaque bouton.
//
// Chaque plateforme est résolue INDÉPENDAMMENT, sur la release la plus récente
// qui porte réellement SON binaire : une release publiée sans asset — ou ne
// portant que les DMG macOS — ne doit pas casser les autres plateformes.
(function () {
  var API = 'https://api.github.com/repos/julessourzac-gif/VAREC-RELEASES/releases?per_page=100';
  var CACHE_KEY = 'varec_releases';
  var CACHE_TTL = 10 * 60 * 1000;

  // Ancrés sur $ : écarte les .blockmap qui accompagnent chaque binaire.
  var MATCHERS = {
    arm64: function (n) { return /-arm64\.dmg$/i.test(n); },
    intel: function (n) { return /^VAREC-[\d.]+\.dmg$/i.test(n); },
    win:   function (n) { return /\.exe$/i.test(n); },
    linux: function (n) { return /\.AppImage$/i.test(n); }
  };

  function readCache() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      return (Date.now() - o.at < CACHE_TTL) ? o.data : null;
    } catch (_) { return null; }
  }

  function writeCache(data) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: data }));
    } catch (_) { /* quota ou navigation privée : le cache est optionnel */ }
  }

  function loadReleases() {
    var hit = readCache();
    if (hit) return Promise.resolve(hit);
    return fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) {
        if (!r.ok) throw new Error('GitHub ' + r.status);
        return r.json();
      })
      .then(function (all) {
        // La réponse brute pèse plusieurs centaines de Ko (corps des notes de
        // version) : on ne met en cache que ce qui sert aux boutons.
        var slim = all
          .filter(function (r) { return !r.draft; })
          .map(function (r) {
            return {
              tag: r.tag_name,
              published_at: r.published_at,
              assets: (r.assets || []).map(function (a) {
                return { name: a.name, url: a.browser_download_url, size: a.size };
              })
            };
          })
          .sort(function (a, b) {
            return new Date(b.published_at) - new Date(a.published_at);
          });
        writeCache(slim);
        return slim;
      });
  }

  function findFor(releases, match) {
    for (var i = 0; i < releases.length; i++) {
      var assets = releases[i].assets;
      for (var j = 0; j < assets.length; j++) {
        if (match(assets[j].name)) return { release: releases[i], asset: assets[j] };
      }
    }
    return null;
  }

  function mb(bytes) { return Math.round(bytes / 1048576) + ' MB'; }

  // Le même script sert les pages FR (racine) et EN (/en/). La langue est lue
  // sur <html lang>, jamais devinée depuis le navigateur : l'URL demandée fait
  // foi. en-GB plutôt que en-US pour garder l'ordre jour-mois du français.
  function localeDate(iso) {
    var tag = document.documentElement.lang === 'en' ? 'en-GB' : 'fr-FR';
    try {
      return new Date(iso).toLocaleDateString(tag, {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch (_) { return ''; }
  }

  // Le CTA de nav et le bandeau version contiennent aussi un badge BETA et une
  // pastille : on ne réécrit que le nœud texte, jamais l'innerHTML.
  function firstTextNode(el, re) {
    if (!el) return null;
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType === 3 && re.test(n.nodeValue)) return n;
    }
    return null;
  }

  function apply(releases) {
    var newest = null;

    Object.keys(MATCHERS).forEach(function (arch) {
      var hit = findFor(releases, MATCHERS[arch]);
      if (!hit) return;

      var btn = document.querySelector('.btn-download[data-arch="' + arch + '"]');
      if (btn) {
        btn.href = hit.asset.url;
        var sub = btn.querySelector('.btn-download-sub');
        if (sub) {
          // « macOS · arm64 · ~95 MB » → « macOS · arm64 · v1.5.35 · 95 MB ».
          // La version par bouton est nécessaire : les plateformes ne sont pas
          // toujours alignées sur la même release. Idempotent si rejoué.
          var parts = sub.textContent.split('·').map(function (s) { return s.trim(); });
          sub.textContent = parts.slice(0, 2)
            .concat([hit.release.tag, mb(hit.asset.size)])
            .join(' · ');
        }
      }

      if (!newest || new Date(hit.release.published_at) > new Date(newest.published_at)) {
        newest = hit.release;
      }
    });

    if (!newest) return; // aucune release téléchargeable : on garde le repli

    // CTA de nav, présent sur les quatre pages.
    var ctaText = firstTextNode(document.querySelector('.nav-cta'), /v\d/);
    if (ctaText) ctaText.nodeValue = ctaText.nodeValue.replace(/v\d[\d.]*\d/, newest.tag);

    // Bandeau « Dernière version : … », page d'accueil uniquement. Le libellé
    // vient du HTML (data-v-label) et non d'ici : il change avec la langue de
    // la page, alors que le repérage du nœud, lui, doit rester le même. .v-info
    // n'a qu'un seul nœud texte, entre la pastille .v-dot et le badge BETA.
    var vinfo = document.querySelector('.v-info');
    var infoText = firstTextNode(vinfo, /\S/);
    if (infoText) {
      var d = localeDate(newest.published_at);
      var label = vinfo.getAttribute('data-v-label') || 'Dernière version : ';
      infoText.nodeValue = label + newest.tag + (d ? ' · ' + d : '');
    }
  }

  if (typeof fetch !== 'function') return;
  loadReleases().then(apply).catch(function () {
    /* hors ligne, quota API atteint : les href statiques du HTML font foi */
  });
})();
