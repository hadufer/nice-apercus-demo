/* ===== HERO C — repetition-hover (Codrops/Tympanus) recreated vanilla, offline ===== */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---- entrance reveal of editorial rows + intro fade ---- */
  function reveal() { document.body.classList.add('hero-in'); }
  if (document.readyState === 'complete') setTimeout(reveal, 100);
  else addEventListener('load', () => setTimeout(reveal, 100));
  // safety net: never let the intro veil stay stuck
  setTimeout(reveal, 2500);

  /* ---- Hero images: clean subtle zoom on hover (no repetition trail / no flicker) ---- */
  const imgs = [...document.querySelectorAll('.rep-img')];
  if (fine && !reduce) {
    imgs.forEach(img => {
      img.addEventListener('pointerenter', () => { img.style.transform = 'scale(1.04)'; });
      img.addEventListener('pointerleave', () => { img.style.transform = ''; });
    });
  }

  /* ---- subtle scroll parallax on the big editorial titles ---- */
  if (!reduce) {
    const titles = [...document.querySelectorAll('.rep-title')];
    let ticking = false;
    function onScroll() {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const vh = innerHeight;
        titles.forEach(t => {
          const r = t.getBoundingClientRect();
          const off = (r.top + r.height / 2 - vh / 2) / vh;
          t.style.transform = `translateY(${off * -26}px)`;
        });
        ticking = false;
      });
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
