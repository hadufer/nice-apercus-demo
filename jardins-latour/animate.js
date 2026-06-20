/* animate.js - Jardins Latour. Reveals + parallax + slider avant/apres.
   Honors prefers-reduced-motion. js-anim en premier (fallback visible si JS off). */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js-anim");

  // 1) reveals
  var els = [].slice.call(document.querySelectorAll(".reveal"));
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  // 2) hero parallax
  if (!reduce) {
    var px = [].slice.call(document.querySelectorAll("[data-parallax]"));
    if (px.length) {
      var tick = false;
      addEventListener("scroll", function () {
        if (tick) return; tick = true;
        requestAnimationFrame(function () {
          var y = pageYOffset;
          px.forEach(function (el) {
            var r = parseFloat(el.getAttribute("data-parallax") || "0.1");
            el.style.transform = "translate3d(0," + (y * r).toFixed(1) + "px,0) scale(1.08)";
          });
          tick = false;
        });
      }, { passive: true });
    }
  }

  // 3) slider avant / apres (drag + touch)
  var stage = document.getElementById("baStage");
  if (stage) {
    var after = document.getElementById("baAfter");
    var handle = document.getElementById("baHandle");
    var dragging = false;
    function setPos(clientX) {
      var rect = stage.getBoundingClientRect();
      var x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      var pct = (x / rect.width) * 100;
      after.style.clipPath = "inset(0 0 0 " + pct + "%)";
      handle.style.left = pct + "%";
    }
    function start(e) { dragging = true; move(e); }
    function move(e) {
      if (!dragging) return;
      var cx = e.touches ? e.touches[0].clientX : e.clientX;
      setPos(cx);
      if (e.cancelable) e.preventDefault();
    }
    function end() { dragging = false; }
    stage.addEventListener("mousedown", start);
    stage.addEventListener("touchstart", start, { passive: false });
    addEventListener("mousemove", move);
    addEventListener("touchmove", move, { passive: false });
    addEventListener("mouseup", end);
    addEventListener("touchend", end);
    // init at 50%
    after.style.clipPath = "inset(0 0 0 50%)";
  }
})();
