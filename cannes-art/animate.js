/* animate.js — CANNES-ART. Composants galerie recréés, 0 dépendance, offline.
   - hero : masque-révélation des lignes de titre (unreveal/letter-shuffle)
   - manifeste : surlignage au scroll (scroll-text-highlight)
   - curseur-pinceau (animated-cursor) — desktop / pointeur fin uniquement
   - reveals (IntersectionObserver) + parallax bandeau + slider avant/après
   Honore prefers-reduced-motion. .js-anim posé en <head>. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.remove("no-js");

  // 0) HERO reveal (déclenche le masque au chargement)
  var hero = document.querySelector(".hero");
  if (hero) { requestAnimationFrame(function(){ setTimeout(function(){ hero.classList.add("show"); }, 80); }); }

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

  // 2) MANIFESTE — surlignage au scroll
  var hls = [].slice.call(document.querySelectorAll(".manifeste .hl"));
  if (hls.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      hls.forEach(function (h) { h.classList.add("on"); });
    } else {
      var io2 = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("on"); io2.unobserve(e.target); }
        });
      }, { threshold: 0.9, rootMargin: "0px 0px -20% 0px" });
      hls.forEach(function (h) { io2.observe(h); });
    }
  }

  // 3) parallax bandeau (subtil)
  if (!reduce) {
    var px = [].slice.call(document.querySelectorAll("[data-parallax]"));
    if (px.length) {
      var ticking = false;
      addEventListener("scroll", function () {
        if (ticking) return; ticking = true;
        requestAnimationFrame(function () {
          var y = pageYOffset;
          px.forEach(function (el) {
            var r = parseFloat(el.getAttribute("data-parallax") || "0.06");
            el.style.transform = "translate3d(0," + (y * r).toFixed(1) + "px,0)";
          });
          ticking = false;
        });
      }, { passive: true });
    }
  }

  // 4) curseur-pinceau (pointeur fin uniquement)
  var fine = window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (fine && !reduce) {
    var ring = document.createElement("div"); ring.className = "cur";
    var dot = document.createElement("div"); dot.className = "cur-dot";
    document.body.appendChild(ring); document.body.appendChild(dot);
    document.body.classList.add("has-cur");
    var mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my;
    addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
    }, { passive: true });
    (function loop(){
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
    var hot = "a,button,.folio a,.btn,.m,.erow,input,textarea,select,[data-hot]";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(hot)) ring.classList.add("hot");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(hot)) ring.classList.remove("hot");
    });
    addEventListener("mouseleave", function(){ ring.style.opacity = dot.style.opacity = "0"; });
    addEventListener("mouseenter", function(){ ring.style.opacity = dot.style.opacity = "1"; });
  }

  // 5) slider avant / après
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
