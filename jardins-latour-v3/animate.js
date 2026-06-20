/* animate.js v2 - Jardins Latour. Scrub horizontal sticky + reveals + slider + parallax.
   Honors prefers-reduced-motion. .js-anim deja pose en <head>. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.remove("no-js");

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

  // 2) hero parallax (subtle)
  if (!reduce) {
    var px = [].slice.call(document.querySelectorAll("[data-parallax]"));
    if (px.length) {
      var t1 = false;
      addEventListener("scroll", function () {
        if (t1) return; t1 = true;
        requestAnimationFrame(function () {
          var y = pageYOffset;
          px.forEach(function (el) {
            var r = parseFloat(el.getAttribute("data-parallax") || "0.06");
            el.style.transform = "translate3d(0," + (y * r).toFixed(1) + "px,0)";
          });
          t1 = false;
        });
      }, { passive: true });
    }
  }

  // 3) SPINE : scroll horizontal sticky (scroll Y pilote translateX du track)
  var spine = document.getElementById("spine");
  var track = document.getElementById("htrack");
  var prog = document.getElementById("hprog");
  if (spine && track && !reduce) {
    function onScroll() {
      var rect = spine.getBoundingClientRect();
      var vh = window.innerHeight;
      // distance scrollable = hauteur section - 1 viewport (le pin dure 1 ecran)
      var total = spine.offsetHeight - vh;
      if (total <= 0) return;
      // progress 0..1 du moment ou le top atteint 0 jusqu'a ce que le bas remonte
      var p = Math.min(1, Math.max(0, (-rect.top) / total));
      var maxX = track.scrollWidth - track.clientWidth;
      track.style.transform = "translate3d(" + (-p * maxX).toFixed(1) + "px,0,0)";
      if (prog) prog.style.width = (10 + p * 90) + "%";
    }
    // donner de la hauteur a la section pour creer la distance de scrub
    function sizeSpine() {
      var maxX = track.scrollWidth - track.clientWidth;
      // 1 viewport de pin + autant de scroll que de largeur a parcourir
      spine.style.height = (window.innerHeight + Math.max(0, maxX)) + "px";
    }
    sizeSpine();
    var t2 = false;
    addEventListener("scroll", function () {
      if (t2) return; t2 = true;
      requestAnimationFrame(function () { onScroll(); t2 = false; });
    }, { passive: true });
    addEventListener("resize", function () { sizeSpine(); onScroll(); });
    onScroll();
  }

  // 4) slider avant / apres
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
    after.style.clipPath = "inset(0 0 0 50%)";
  }
})();
