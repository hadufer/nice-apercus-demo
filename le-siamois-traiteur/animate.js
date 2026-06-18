/* animate.js - per-DA pass (lib chosen by art direction). HARD RULES baked: no blink dot, no em/en dash, honors prefers-reduced-motion. */
(function(){
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var doc = document;
  doc.documentElement.classList.add("js-anim");

  // reveals (vanilla IO, always available)
  var SEL = ".sec-head, .cards > *, .svc, .card, .formula, .prest > li, .split > *, .stats, .info-grid, .gal > *, .band .wrap > *, .chips, .menu-cat, .menu-photos figure, .m-item, .pricelist > li";
  Array.prototype.slice.call(doc.querySelectorAll(SEL)).forEach(function (el) {
    if (el.closest(".hero")) return;
    if (!el.classList.contains("reveal")) el.classList.add("reveal");
  });
  doc.querySelectorAll(".cards, .prest, .gal, .stats, .chips, .menu-list, .menu-photos, .pricelist").forEach(function (g) {
    g.querySelectorAll(":scope > .reveal").forEach(function (c, i) { c.style.transitionDelay = (i * 55) + "ms"; });
  });
  var revealEls = Array.prototype.slice.call(doc.querySelectorAll(".reveal"));
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // count-up stats (vanilla)
  var statEls = Array.prototype.slice.call(doc.querySelectorAll(".stats .s b, [data-count]"));
  var numbered = [];
  statEls.forEach(function (el) {
    var raw = el.getAttribute("data-count") || el.textContent.trim();
    var m = raw.match(/^(\d+)(.*)$/);
    if (!m) return;
    el.setAttribute("data-target", m[1]); el.setAttribute("data-suffix", m[2] || ""); numbered.push(el);
  });
  if (numbered.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      numbered.forEach(function (el) { el.textContent = el.getAttribute("data-target") + el.getAttribute("data-suffix"); });
    } else {
      numbered.forEach(function (el) { el.textContent = "0" + el.getAttribute("data-suffix"); });
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target, target = parseFloat(el.getAttribute("data-target")), suffix = el.getAttribute("data-suffix"), dur = 1100, t0 = null;
          var tick = function (ts) { if (!t0) t0 = ts; var p = Math.min((ts - t0) / dur, 1), ea = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(target * ea) + suffix; if (p < 1) requestAnimationFrame(tick); };
          requestAnimationFrame(tick); cio.unobserve(el);
        });
      }, { threshold: 0.6 });
      numbered.forEach(function (el) { cio.observe(el); });
    }
  }

  // --- TIER A | GSAP cinematic hero signature ---
  if (!reduce) {
    var g1 = doc.createElement("script");
    g1.src = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js";
    g1.onload = function () {
      var g2 = doc.createElement("script");
      g2.src = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js";
      g2.onload = function () {
        gsap.registerPlugin(ScrollTrigger);
        var img = doc.querySelector(".hero .bg img");
        if (img) {
          gsap.fromTo(img, { clipPath: "inset(0 0 100% 0)", scale: 1.16 },
            { clipPath: "inset(0 0 0% 0)", scale: 1.08, duration: 1.35, ease: "power3.out" });
          gsap.to(img, { yPercent: 12, ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
        }
        gsap.from(".hero-in > *", { y: 30, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.25 });
      };
      doc.head.appendChild(g2);
    };
    doc.head.appendChild(g1);
  }

})();
