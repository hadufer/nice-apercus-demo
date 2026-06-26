/* awwwards.js — effets Awwwards (recréés de nos composants catalogue),
   vanilla, 0 dépendance, offline. Honore prefers-reduced-motion.
   - menu plein écran XXL + stagger (aw-obys/akaru)
   - boutons magnétiques (aw-cuberto)
   - split-text reveal ligne par ligne (aw-unseen)
   - parallax data-speed (aw-locomotive/exoape)
   Le menu overlay est injecté depuis le <nav> existant -> pas de duplication HTML. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches;

  /* ---------- 1) MENU PLEIN ÉCRAN XXL + STAGGER ---------- */
  (function buildOverlay(){
    var nav = document.querySelector(".nav nav");
    var burger = document.getElementById("burger");
    if (!nav || !burger) return;
    var links = [].slice.call(nav.querySelectorAll("a"));
    var ov = document.createElement("div");
    ov.className = "overlay-menu"; ov.id = "overlayMenu";
    var inner = document.createElement("div"); inner.className = "om-inner";
    links.forEach(function(a, i){
      var wrap = document.createElement("div"); wrap.className = "om-link";
      var na = document.createElement("a");
      na.href = a.getAttribute("href");
      na.innerHTML = '<span class="idx">0'+(i+1)+'</span>'+a.textContent;
      wrap.appendChild(na); inner.appendChild(wrap);
    });
    var foot = document.createElement("div"); foot.className = "om-foot";
    foot.innerHTML = '<a href="tel:+336****2302">06 69 74 23 02</a>'+
      '<span>15 Rue Henri Germain, 06110 Le Cannet</span>'+
      '<a href="contact.html">Devis gratuit</a>';
    ov.appendChild(inner); ov.appendChild(foot);
    document.body.appendChild(ov);

    // neutralise l'ancien mobile-menu (#mm) s'il existe : on garde un seul système
    var oldMM = document.getElementById("mm");
    var open = false;
    function setOpen(v){
      open = v;
      ov.classList.toggle("open", v);
      burger.classList.toggle("open", v);
      document.body.classList.toggle("menu-open", v);
    }
    // remplace le handler du burger (on clone pour virer les anciens listeners)
    var fresh = burger.cloneNode(true);
    burger.parentNode.replaceChild(fresh, burger);
    fresh.addEventListener("click", function(){ setOpen(!open); });
    ov.addEventListener("click", function(e){ if (e.target.tagName === "A") setOpen(false); });
    document.addEventListener("keydown", function(e){ if (e.key === "Escape" && open) setOpen(false); });
    if (oldMM) oldMM.remove();
  })();

  /* ---------- 2) BOUTONS MAGNÉTIQUES ---------- */
  if (fine && !reduce) {
    [].slice.call(document.querySelectorAll("[data-magnetic]")).forEach(function(btn){
      // wrap le contenu dans un span.mag-in si pas déjà fait
      if (!btn.querySelector(".mag-in")) {
        var span = document.createElement("span");
        span.className = "mag-in";
        while (btn.firstChild) span.appendChild(btn.firstChild);
        btn.appendChild(span);
      }
      var inner = btn.querySelector(".mag-in");
      var s = 0.32, si = 0.55;
      btn.addEventListener("mousemove", function(e){
        var r = btn.getBoundingClientRect();
        var rx = e.clientX - (r.left + r.width/2);
        var ry = e.clientY - (r.top + r.height/2);
        btn.style.transform = "translate("+(rx*s).toFixed(1)+"px,"+(ry*s).toFixed(1)+"px)";
        inner.style.transform = "translate("+(rx*si).toFixed(1)+"px,"+(ry*si).toFixed(1)+"px)";
      });
      btn.addEventListener("mouseleave", function(){
        btn.style.transition = "transform .55s cubic-bezier(.22,1.2,.3,1)";
        inner.style.transition = "transform .55s cubic-bezier(.22,1.2,.3,1)";
        btn.style.transform = ""; inner.style.transform = "";
        setTimeout(function(){ btn.style.transition=""; inner.style.transition=""; }, 560);
      });
    });
  }

  /* ---------- 3) SPLIT-TEXT REVEAL ligne par ligne ---------- */
  (function splitText(){
    var targets = [].slice.call(document.querySelectorAll("[data-split]"));
    if (!targets.length) return;
    targets.forEach(function(el){
      if (reduce) { el.classList.add("split-rt","in"); return; }
      // découpe par <br> ou en lignes logiques : on respecte les <br> présents
      var html = el.innerHTML;
      var parts = html.split(/<br\s*\/?>/i);
      el.innerHTML = "";
      el.classList.add("split-rt");
      parts.forEach(function(p){
        var line = document.createElement("span"); line.className = "sline";
        var ins = document.createElement("span"); ins.innerHTML = p.trim();
        line.appendChild(ins); el.appendChild(line);
      });
    });
    if (reduce || !("IntersectionObserver" in window)) {
      targets.forEach(function(el){ el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function(ents){
      ents.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.4, rootMargin: "0px 0px -10% 0px" });
    targets.forEach(function(el){ io.observe(el); });
  })();

  /* ---------- 4) PARALLAX data-speed ---------- */
  if (!reduce) {
    var ps = [].slice.call(document.querySelectorAll("[data-speed]"));
    if (ps.length) {
      var ticking = false;
      function update(){
        var vh = window.innerHeight;
        ps.forEach(function(el){
          var r = el.getBoundingClientRect();
          var center = r.top + r.height/2;
          var off = (center - vh/2) / vh; // -1..1 environ
          var sp = parseFloat(el.getAttribute("data-speed") || "0.1");
          el.style.transform = "translate3d(0,"+(off * sp * -100).toFixed(1)+"px,0)";
        });
        ticking = false;
      }
      addEventListener("scroll", function(){
        if (ticking) return; ticking = true; requestAnimationFrame(update);
      }, { passive: true });
      addEventListener("resize", update);
      update();
    }
  }

  /* ---------- 6) MARQUEE sans vide (aw-basement) ----------
     Reconstruit chaque bandeau pour que la "moitié" qui boucle soit
     toujours >= largeur de l'écran -> translateX(-50%) ne révèle jamais
     de vide, quelle que soit la largeur. Vitesse constante (px/s). */
  (function initMarquees(){
    var PX_PER_SEC = 70;
    var marquees = [].slice.call(document.querySelectorAll(".marquee"));
    if (!marquees.length) return;

    function buildSeq(base){
      var seq = document.createElement("span");
      seq.className = "mq-seq";
      base.forEach(function(t){
        var s = document.createElement("span");
        s.textContent = t;
        seq.appendChild(s);
      });
      return seq;
    }

    function fit(mq){
      var track = mq.querySelector(".track");
      if (!track) return;
      // mémorise la liste d'items de base une seule fois (dédupliquée)
      if (!track._base){
        var seen = {}, base = [];
        [].slice.call(track.children).forEach(function(s){
          var t = s.textContent.trim();
          if (t && !seen[t]) { seen[t] = 1; base.push(t); }
        });
        track._base = base;
      }
      var base = track._base;
      if (!base.length) return;

      var vw = window.innerWidth;
      track.style.animation = "none";
      track.innerHTML = "";

      // première séquence : répète les items jusqu'à dépasser la largeur écran
      var seq = buildSeq(base);
      track.appendChild(seq);
      var guard = 0;
      while (seq.getBoundingClientRect().width < vw + 80 && guard < 60){
        base.forEach(function(t){
          var s = document.createElement("span"); s.textContent = t; seq.appendChild(s);
        });
        guard++;
      }
      var seqW = seq.getBoundingClientRect().width;
      // deuxième séquence identique -> boucle sans couture à -50%
      track.appendChild(seq.cloneNode(true));

      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduce){
        var dur = Math.max(12, seqW / PX_PER_SEC); // vitesse constante
        track.style.animation = "scrollx " + dur.toFixed(1) + "s linear infinite";
      }
    }

    function fitAll(){ marquees.forEach(fit); }
    fitAll();
    // refit sur resize (debounce) + après chargement des polices
    var rt;
    addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(fitAll, 180); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  })();
})();
