/* animate.js - dependency-free "make it alive" pass (Michel artisan peintre).
   Honors prefers-reduced-motion. Driven by CSS + data-attrs. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js-anim");

  // 1) Scroll reveals (with optional stagger on parent)
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduce) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else if ("IntersectionObserver" in window) {
    document.querySelectorAll("[data-stagger]").forEach(function (group) {
      var step = parseInt(group.getAttribute("data-stagger") || "60", 10);
      group.querySelectorAll(".reveal").forEach(function (child, i) {
        child.style.transitionDelay = (i * step) + "ms";
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  // 2) Hero parallax (transform only)
  if (!reduce) {
    var px = Array.prototype.slice.call(document.querySelectorAll("[data-parallax], .hero .bg img"));
    if (px.length) {
      var ticking = false;
      var onScroll = function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = window.pageYOffset || document.documentElement.scrollTop;
          px.forEach(function (el) {
            var rate = parseFloat(el.getAttribute("data-parallax") || "0.12");
            el.style.transform = "translate3d(0," + (y * rate).toFixed(1) + "px,0) scale(1.06)";
          });
          ticking = false;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  // 3) Count-up stats (supports decimal suffix like ",0")
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  if (counters.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      counters.forEach(function (el) { el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || ""); });
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target, target = parseFloat(el.getAttribute("data-count")), suffix = el.getAttribute("data-suffix") || "";
          var dur = 1100, t0 = null;
          var tick = function (ts) {
            if (!t0) t0 = ts;
            var p = Math.min((ts - t0) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          cio.unobserve(el);
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }
})();
