/* animate.js - dependency-free "make it alive" pass for bespoke static sites.
   Drop-in: copy into deploy/<slug>/ and add <script defer src="animate.js"></script>
   before </body>. Honors prefers-reduced-motion. Auto-targets common selectors so
   no per-site generator changes are needed.

   HARD RULES baked in: no blinking/pulsing dots are created here; motion is
   one-shot (reveal / parallax / count-up), nothing loops in the user's face.
*/
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var doc = document;
  // Progressive enhancement: only hide-for-reveal once JS is confirmed running.
  // CSS gates opacity:0 behind html.js-anim, so content is ALWAYS visible if JS fails.
  doc.documentElement.classList.add("js-anim");

  // ---- 1) Auto-tag reveal candidates (skip anything inside the hero) ----
  var SEL = ".sec-head, .cards > *, .svc, .card, .formula, .prest > li, .split > *, .stats, .info-grid, .gal > *, .band .wrap > *, .chips";
  var candidates = Array.prototype.slice.call(doc.querySelectorAll(SEL));
  candidates.forEach(function (el) {
    if (el.closest(".hero")) return;            // hero stays instantly visible
    if (!el.classList.contains("reveal")) el.classList.add("reveal");
  });
  // assign cascade delay to siblings sharing a parent
  var groups = {};
  doc.querySelectorAll(".cards, .prest, .gal, .stats, .chips").forEach(function (g) {
    var kids = g.querySelectorAll(":scope > .reveal");
    kids.forEach(function (c, i) { c.style.transitionDelay = (i * 55) + "ms"; });
  });

  var revealEls = Array.prototype.slice.call(doc.querySelectorAll(".reveal"));
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // ---- 2) Hero parallax (transform only) ----
  if (!reduce) {
    var px = Array.prototype.slice.call(doc.querySelectorAll("[data-parallax], .hero .bg img"));
    if (px.length) {
      var ticking = false;
      var onScroll = function () {
        if (ticking) return; ticking = true;
        requestAnimationFrame(function () {
          var y = window.pageYOffset || doc.documentElement.scrollTop;
          px.forEach(function (el) {
            var rate = parseFloat(el.getAttribute("data-parallax") || "0.12");
            el.style.transform = "translate3d(0," + (y * rate).toFixed(1) + "px,0) scale(1.08)";
          });
          ticking = false;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  // ---- 3) Count-up stats: auto-detect numeric .stats .s b (keeps suffix like j/7, +) ----
  var statEls = Array.prototype.slice.call(doc.querySelectorAll(".stats .s b, [data-count]"));
  var numbered = [];
  statEls.forEach(function (el) {
    var raw = el.getAttribute("data-count") || el.textContent.trim();
    var m = raw.match(/^(\d+)(.*)$/);          // leading integer + suffix
    if (!m) return;                             // non-numeric (e.g. "Agréé", "Nice") left as-is
    el.setAttribute("data-target", m[1]);
    el.setAttribute("data-suffix", m[2] || "");
    numbered.push(el);
  });
  if (numbered.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      numbered.forEach(function (el) { el.textContent = el.getAttribute("data-target") + el.getAttribute("data-suffix"); });
    } else {
      numbered.forEach(function (el) { el.textContent = "0" + el.getAttribute("data-suffix"); });
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target, target = parseFloat(el.getAttribute("data-target")), suffix = el.getAttribute("data-suffix");
          var dur = 1100, t0 = null;
          var tick = function (ts) {
            if (!t0) t0 = ts;
            var p = Math.min((ts - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick); cio.unobserve(el);
        });
      }, { threshold: 0.6 });
      numbered.forEach(function (el) { cio.observe(el); });
    }
  }
})();
