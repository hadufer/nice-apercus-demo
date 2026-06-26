/* ===== Artisan Bernasconi — shared interactions (catalog effects, vanilla, offline) ===== */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---- mobile burger menu ---- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (burger && mobileMenu) {
    const toggle = (open) => {
      const willOpen = open !== undefined ? open : !burger.classList.contains('open');
      burger.classList.toggle('open', willOpen);
      mobileMenu.classList.toggle('open', willOpen);
      burger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      document.body.style.overflow = willOpen ? 'hidden' : '';
    };
    burger.addEventListener('click', () => toggle());
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
  }

  /* ---- aw-cuberto : custom cursor + magnetic CTAs ---- */
  if (fine) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`; });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a,button,.svc,.depth figure,[data-cursor]').forEach(el => {
      el.addEventListener('pointerenter', () => {
        ring.classList.add('hover');
        const lab = el.getAttribute('data-cursor');
        if (lab) { ring.classList.add('label'); ring.setAttribute('data-label', lab); }
      });
      el.addEventListener('pointerleave', () => { ring.classList.remove('hover', 'label'); });
    });
    // magnetic buttons
    document.querySelectorAll('.btn,.nav-cta').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * .3}px,${y * .4}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---- scroll-text-highlight : word-by-word colouring on scroll ---- */
  const sthEls = document.querySelectorAll('.sth');
  sthEls.forEach(el => {
    if (el.dataset.split) return; el.dataset.split = '1';
    const accentWords = (el.dataset.accent || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    const html = el.innerHTML.split(/(\s+)/).map(tok => {
      if (/^\s+$/.test(tok)) return tok;
      const clean = tok.replace(/[.,!?;:«»"'()]/g, '').toLowerCase();
      const acc = accentWords.includes(clean) ? ' accent' : '';
      return `<span class="word${acc}">${tok}</span>`;
    }).join('');
    el.innerHTML = html;
  });
  function lightWords() {
    sthEls.forEach(el => {
      const words = el.querySelectorAll('.word');
      const r = el.getBoundingClientRect();
      const start = innerHeight * 0.85, end = innerHeight * 0.35;
      const prog = Math.min(Math.max((start - r.top) / (start - end), 0), 1);
      const lit = Math.round(prog * words.length);
      words.forEach((w, i) => w.classList.toggle('lit', i < lit));
    });
  }

  /* ---- depth-gallery : scroll-driven depth/parallax on figures ---- */
  const depthFigs = [...document.querySelectorAll('.depth figure')];
  function depthParallax() {
    if (reduce) return;
    const vh = innerHeight;
    depthFigs.forEach((f, i) => {
      const r = f.getBoundingClientRect();
      const center = r.top + r.height / 2;
      let off = (center - vh / 2) / vh;
      off = Math.max(-1, Math.min(1, off));      // clamp so off-screen items stay sane
      const depth = (i % 3 - 1);                  // -1,0,1 lanes
      const ty = off * 38 * (1 + Math.abs(depth) * 0.5);
      const tz = -Math.abs(off) * 120;
      const sc = 1 - Math.abs(off) * 0.04;
      const img = f.querySelector('img');
      f.style.transform = `translateY(${ty}px) translateZ(${tz}px) scale(${sc})`;
      if (img) img.style.transform = `scale(${1.12 + Math.abs(off) * 0.06}) translateY(${off * -18}px)`;
    });
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { lightWords(); depthParallax(); ticking = false; });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  lightWords(); depthParallax();

  /* ---- nav scrolled state ---- */
  const nav = document.getElementById('nav');
  addEventListener('scroll', () => nav && nav.classList.toggle('scrolled', scrollY > 40), { passive: true });

  /* ---- reveal on view ---- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.14 });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  /* ---- service card 3D tilt ---- */
  document.querySelectorAll('.svc').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(800px) rotateX(${(py - .5) * -9}deg) rotateY(${(px - .5) * 11}deg) translateY(-6px)`;
      card.style.setProperty('--mx', px * 100 + '%');
      card.style.setProperty('--my', py * 100 + '%');
    });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });

  /* ---- count-up stats ---- */
  const stnums = document.querySelectorAll('.stat .n[data-to]');
  const sio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; sio.unobserve(e.target);
    const el = e.target, to = parseFloat(el.dataset.to), dec = (el.dataset.dec | 0), suf = el.dataset.suf || '';
    let t0 = null;
    function step(t) { if (!t0) t0 = t; const p = Math.min((t - t0) / 1100, 1);
      const v = (to * (1 - Math.pow(1 - p, 3))).toFixed(dec);
      el.textContent = (dec ? v.replace('.', ',') : Math.round(v)) + suf;
      if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }), { threshold: 0.5 });
  stnums.forEach(n => sio.observe(n));
})();
