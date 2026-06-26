/* ============================================================
   ARBRES ET NATURE — app.js
   Composants Awwwards recrees en vanilla, 0 dependance, offline.
   Honore prefers-reduced-motion. Classe .js posee tot dans <head>.
   ============================================================ */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js"); root.classList.add("js");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (reduce) root.classList.add("reduce");

  /* ---------- 0) PRELOADER (compteur 0 -> 100) ---------- */
  (function preload(){
    var pl = document.getElementById("preloader");
    if (!pl) { start(); return; }
    var numEl = pl.querySelector(".pl-num"), barEl = pl.querySelector(".pl-bar");
    document.body.classList.add("lock");
    requestAnimationFrame(function(){ root.classList.add("pl-go"); });
    if (reduce) { finish(); return; }
    var n = 0;
    var iv = setInterval(function(){
      n += Math.floor(Math.random()*8) + 3;
      if (n >= 100) { n = 100; clearInterval(iv); setTimeout(finish, 360); }
      if (numEl) numEl.textContent = n;
      if (barEl) barEl.style.width = n + "%";
    }, 90);
    function finish(){
      if (numEl) numEl.textContent = 100; if (barEl) barEl.style.width = "100%";
      root.classList.add("pl-done");
      document.body.classList.remove("lock");
      setTimeout(start, 700);
    }
  })();
  function start(){
    var hero = document.querySelector(".hero, .phero");
    if (hero) requestAnimationFrame(function(){ setTimeout(function(){ hero.classList.add("show"); }, 60); });
  }

  /* ---------- 1) NAV shrink + barre de progression ---------- */
  var nav = document.querySelector("header.nav");
  var prog = document.getElementById("prog");
  function onScrollNav(){
    var y = pageYOffset;
    if (nav) nav.classList.toggle("shrink", y > 40);
    if (prog){ var h = document.body.scrollHeight - innerHeight; prog.style.width = (h>0 ? (y/h*100):0) + "%"; }
  }
  addEventListener("scroll", onScrollNav, { passive:true }); onScrollNav();

  /* ---------- 2) MENU OVERLAY plein ecran ---------- */
  (function menu(){
    var btn = document.querySelector(".menu-btn");
    var ov = document.querySelector(".overlay");
    if (!btn || !ov) return;
    var open = false;
    function set(v){ open=v; document.body.classList.toggle("menu-open", v); document.body.classList.toggle("lock", v); }
    btn.addEventListener("click", function(){ set(!open); });
    ov.addEventListener("click", function(e){ if (e.target.tagName === "A") set(false); });
    addEventListener("keydown", function(e){ if (e.key === "Escape" && open) set(false); });
  })();

  /* ---------- 3) CURSEUR custom + magnetique ---------- */
  if (fine && !reduce) {
    var ring = document.createElement("div"); ring.className = "cur";
    var dot = document.createElement("div"); dot.className = "cur-dot";
    document.body.appendChild(ring); document.body.appendChild(dot);
    document.body.classList.add("has-cur");
    var mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my;
    addEventListener("mousemove", function(e){
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
    }, { passive:true });
    (function loop(){ rx += (mx-rx)*.18; ry += (my-ry)*.18;
      ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop); })();
    var hotSel = "a,button,.panel,.gcard,.svc .row,input,textarea,select,[data-cursor]";
    document.addEventListener("mouseover", function(e){
      var t = e.target.closest(hotSel); if (!t) return;
      ring.classList.add("hot");
      var lab = t.getAttribute("data-cursor");
      if (lab){ ring.classList.add("lab"); ring.setAttribute("data-label", lab); }
    });
    document.addEventListener("mouseout", function(e){
      if (e.target.closest(hotSel)){ ring.classList.remove("hot","lab"); ring.removeAttribute("data-label"); }
    });
    addEventListener("mouseleave", function(){ ring.style.opacity = dot.style.opacity = "0"; });
    addEventListener("mouseenter", function(){ ring.style.opacity = dot.style.opacity = "1"; });

    // boutons magnetiques
    [].forEach.call(document.querySelectorAll(".mag"), function(btn){
      if (!btn.querySelector(".mag-in")){
        var s = document.createElement("span"); s.className="mag-in";
        while (btn.firstChild) s.appendChild(btn.firstChild);
        btn.appendChild(s);
      }
      var inner = btn.querySelector(".mag-in"), k1=.3, k2=.55;
      btn.addEventListener("mousemove", function(e){
        var r = btn.getBoundingClientRect();
        var dx = e.clientX-(r.left+r.width/2), dy = e.clientY-(r.top+r.height/2);
        btn.style.transform = "translate("+(dx*k1).toFixed(1)+"px,"+(dy*k1).toFixed(1)+"px)";
        inner.style.transform = "translate("+(dx*k2).toFixed(1)+"px,"+(dy*k2).toFixed(1)+"px)";
      });
      btn.addEventListener("mouseleave", function(){
        btn.style.transition = inner.style.transition = "transform .55s cubic-bezier(.22,1.2,.3,1)";
        btn.style.transform = inner.style.transform = "";
        setTimeout(function(){ btn.style.transition = inner.style.transition = ""; }, 560);
      });
    });
  }

  /* ---------- 4) SPLIT-TEXT (par <br>) ---------- */
  (function split(){
    var ts = [].slice.call(document.querySelectorAll("[data-split]"));
    ts.forEach(function(el){
      var parts = el.innerHTML.split(/<br\s*\/?>/i);
      el.innerHTML = "";
      parts.forEach(function(p){
        var sl = document.createElement("span"); sl.className="sl";
        var ins = document.createElement("span"); ins.innerHTML = p.trim();
        sl.appendChild(ins); el.appendChild(sl);
      });
    });
    if (reduce || !("IntersectionObserver" in window)){ ts.forEach(function(e){ e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} }); }, { threshold:.35 });
    ts.forEach(function(e){ io.observe(e); });
  })();

  /* ---------- 5) REVEALS ---------- */
  (function reveals(){
    var els = [].slice.call(document.querySelectorAll(".reveal"));
    if (reduce || !("IntersectionObserver" in window)){ els.forEach(function(e){ e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} }); }, { threshold:.12, rootMargin:"0px 0px -7% 0px" });
    els.forEach(function(e){ io.observe(e); });
  })();

  /* ---------- 6) MANIFESTE surlignage au scroll ---------- */
  (function manifesto(){
    var hls = [].slice.call(document.querySelectorAll(".manifesto .hl"));
    if (!hls.length) return;
    if (reduce || !("IntersectionObserver" in window)){ hls.forEach(function(h){ h.classList.add("on"); }); return; }
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("on"); io.unobserve(e.target);} }); }, { threshold:.9 });
    hls.forEach(function(h){ io.observe(h); });
  })();

  /* ---------- 7) PARALLAX data-speed + bg ---------- */
  if (!reduce) {
    var ps = [].slice.call(document.querySelectorAll("[data-speed],.hero .bg,.break .bg,.phero .bg"));
    if (ps.length){
      var tick = false;
      function upd(){
        var vh = innerHeight;
        ps.forEach(function(el){
          var r = el.getBoundingClientRect();
          var center = r.top + r.height/2;
          var off = (center - vh/2) / vh;
          var sp = parseFloat(el.getAttribute("data-speed") || (el.classList.contains("bg") ? "0.18" : "0.1"));
          el.style.transform = "translate3d(0," + (off*sp*-100).toFixed(1) + "px,0)";
        });
        tick = false;
      }
      addEventListener("scroll", function(){ if(tick) return; tick=true; requestAnimationFrame(upd); }, { passive:true });
      addEventListener("resize", upd); upd();
    }
  }

  /* ---------- 8) SCROLL HORIZONTAL EPINGLE ---------- */
  (function spine(){
    var sp = document.querySelector(".spine");
    if (!sp) return;
    var sticky = sp.querySelector(".sticky");
    var track = sp.querySelector(".track");
    var bar = sp.querySelector(".sbar i");
    if (!sticky || !track) return;
    var small = matchMedia("(max-width:760px)").matches;
    if (small || reduce){ sp.classList.add("flat"); return; }

    function maxX(){ return Math.max(0, track.scrollWidth - innerWidth + 28); }
    function sizeSpine(){
      // hauteur = 1 ecran de pin + la distance horizontale a parcourir
      sp.style.height = (innerHeight + maxX()) + "px";
    }
    function onScroll(){
      var rectTop = sp.getBoundingClientRect().top;
      var total = sp.offsetHeight - innerHeight;
      if (total <= 0) return;
      var p = Math.min(1, Math.max(0, (-rectTop) / total));
      var mx = maxX();
      track.style.transform = "translate3d(" + (-p*mx).toFixed(1) + "px,0,0)";
      if (bar) bar.style.width = (10 + p*90) + "%";
    }
    sizeSpine();
    var tick = false;
    addEventListener("scroll", function(){ if(tick) return; tick=true; requestAnimationFrame(function(){ onScroll(); tick=false; }); }, { passive:true });
    addEventListener("resize", function(){
      var nowSmall = matchMedia("(max-width:760px)").matches;
      if (nowSmall){ sp.classList.add("flat"); sp.style.height=""; track.style.transform=""; return; }
      sp.classList.remove("flat"); sizeSpine(); onScroll();
    });
    onScroll();
  })();

  /* ---------- 9) SERVICES — image flottante au survol ---------- */
  (function svcFloat(){
    var svc = document.querySelector(".svc");
    if (!svc || !fine) return;
    var float = svc.querySelector(".float");
    var rows = [].slice.call(svc.querySelectorAll(".row[data-img]"));
    if (!float || !rows.length) return;
    var img = float.querySelector("img");
    var fx = 0, fy = 0, cx = 0, cy = 0, active = false;
    addEventListener("mousemove", function(e){ fx = e.clientX; fy = e.clientY; }, { passive:true });
    (function loop(){ cx += (fx-cx)*.12; cy += (fy-cy)*.12;
      float.style.left = cx+"px"; float.style.top = cy+"px"; requestAnimationFrame(loop); })();
    rows.forEach(function(r){
      r.addEventListener("mouseenter", function(){ img.src = r.getAttribute("data-img"); float.classList.add("on"); active=true; });
      r.addEventListener("mouseleave", function(){ float.classList.remove("on"); active=false; });
    });
  })();

  /* ---------- 10) AVANT / APRES ---------- */
  (function ba(){
    var stage = document.querySelector(".ba");
    if (!stage) return;
    var after = stage.querySelector(".after"), handle = stage.querySelector(".handle");
    if (!after || !handle) return;
    var drag = false;
    function pos(x){
      var r = stage.getBoundingClientRect();
      var px = Math.max(0, Math.min(x-r.left, r.width));
      var pct = px/r.width*100;
      after.style.clipPath = "inset(0 0 0 " + pct + "%)";
      handle.style.left = pct + "%";
    }
    function st(e){ drag=true; mv(e); }
    function mv(e){ if(!drag) return; var x = e.touches ? e.touches[0].clientX : e.clientX; pos(x); if(e.cancelable) e.preventDefault(); }
    function en(){ drag=false; }
    stage.addEventListener("mousedown", st);
    stage.addEventListener("touchstart", st, { passive:false });
    addEventListener("mousemove", mv);
    addEventListener("touchmove", mv, { passive:false });
    addEventListener("mouseup", en); addEventListener("touchend", en);
    after.style.clipPath = "inset(0 0 0 50%)";
  })();

})();
