/* animate.js - L'Atelier de Michel. Kinetic hero headline + reveals + nuancier.
   No CDN. Honors prefers-reduced-motion. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js-anim");

  // Hero kinetic headline: reveal on load
  var h1 = document.getElementById("h1");
  if (h1) {
    if (reduce) { h1.classList.add("in"); }
    else { requestAnimationFrame(function(){ setTimeout(function(){ h1.classList.add("in"); }, 120); }); }
  }

  // Scroll reveals
  var els = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }
})();
