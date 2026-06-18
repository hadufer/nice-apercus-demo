"""Per-DA animation pass for the 10 bespoke sites.
Each site keeps its single <script defer src="animate.js"> tag (no HTML change).
The lib is chosen per art direction; the lib only drives the HERO signature.
Utility reveals + count-up stay vanilla IO so the page never depends on a CDN to be usable.
HARD RULES: no blinking/pulsing dot, no em/en dash, prefers-reduced-motion respected.
"""
import os
DEPLOY = "deploy"

# ---------- shared vanilla core (reveals + count-up + generic parallax) ----------
CORE = r"""
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
"""

# ---------- TIER A: GSAP cinematic (clip-path wipe hero + scrub parallax + text rise) ----------
GSAP = r"""
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
"""

# ---------- TIER B: Motion One (hero filter signature) ----------
# per-site hero verb injected via {HERO}
MOTION = r"""
  // --- TIER B | Motion One hero signature ---
  if (!reduce && "noModule" in HTMLScriptElement.prototype) {
    import("https://cdn.jsdelivr.net/npm/motion@10.18.0/+esm").then(function (motion) {
      var animate = motion.animate, stagger = motion.stagger;
      animate(".hero-in > *", { opacity: [0, 1], transform: ["translateY(22px)", "none"] },
        { duration: 0.7, delay: stagger(0.09, { start: 0.15 }), easing: [0.16, 1, 0.3, 1] });
      var img = doc.querySelector(".hero .bg img");
      if (img) { __HERO__ }
    }).catch(function () {});
  }
"""

# ---------- TIER C: CSS-only sober (hero rise via CSS keyframe; core handles reveals) ----------
CSS_SOBER = ""  # no extra JS; CSS keyframe added to style.css

# ---------- TIER D: CSS kinetic type (line clip reveal; core handles section heads) ----------
CSS_KINETIC = ""  # CSS-driven

def wrap(core, tier_js):
    return ('/* animate.js - per-DA pass (lib chosen by art direction). HARD RULES baked: '
            'no blink dot, no em/en dash, honors prefers-reduced-motion. */\n'
            '(function(){\n  "use strict";\n' + core + tier_js + '\n})();\n')

# Motion One per-site hero verbs (filter/scale signatures)
HERO_LIGHT = ('animate(img, { filter: ["brightness(0.42) saturate(0.65)", "brightness(1) saturate(1.04)"], '
              'transform: ["scale(1.12)", "scale(1.07)"] }, { duration: 1.5, easing: [0.16,1,0.3,1] });')  # ampoule s'allume
HERO_SPEC  = ('animate(img, { filter: ["brightness(0.6)", "brightness(1.18)", "brightness(1)"] }, '
              '{ duration: 1.15, offset: [0, 0.65, 1], easing: "ease-out" });')                            # voltage surge
HERO_AGP   = ('animate(img, { transform: ["scale(1.18)", "scale(1.07)"], filter: ["brightness(0.72)","brightness(1)"] }, '
              '{ duration: 0.95, easing: [0.16,1,0.3,1] });')                                              # urgence punch-in
HERO_RIV   = ('animate(img, { transform: ["scale(1.13)", "scale(1.08)"], filter: ["brightness(0.78)","brightness(1)"] }, '
              '{ duration: 1.25, easing: [0.16,1,0.3,1] });')                                              # premium settle

PLAN = {
    "01_plomberie-riviera":   ("motion", HERO_RIV),
    "02_le-siamois-traiteur": ("gsap",  None),
    "03_spec-tobi":           ("motion", HERO_SPEC),
    "04_bellomo-plomberie":   ("css",   None),
    "05_nice-travaux-renov":  ("kinetic", None),
    "06_romain-plomberie":    ("css",   None),
    "07_agp-plomberie":       ("motion", HERO_AGP),
    "08_light-elec":          ("motion", HERO_LIGHT),
    "09_atelier-du-traiteur": ("gsap",  None),
    "10_lm-artisan":          ("css",   None),
}

for slug, (tier, hero) in PLAN.items():
    if tier == "gsap":
        js = wrap(CORE, GSAP)
    elif tier == "motion":
        js = wrap(CORE, MOTION.replace("__HERO__", hero))
    else:  # css / kinetic -> core only (CSS keyframes do the hero)
        js = wrap(CORE, "")
    path = f"{DEPLOY}/{slug}/animate.js"
    open(path, "w", encoding="utf-8").write(js)
    # sanity: no dash chars introduced
    assert "\u2014" not in js and "\u2013" not in js
    print(f"{slug:26s} -> {tier:8s} ({len(js)} bytes)")
print("\nDONE. _assets/animate.js left as the generic fallback reference.")
