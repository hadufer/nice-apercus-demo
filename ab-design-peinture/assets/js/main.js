/* AB DESIGN Peinture & Déco · interactions
   Progressif : sans JS, le site reste lisible et navigable. */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Année courante ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Header : état "scrolled" ---------- */
  var header = document.querySelector("[data-header]");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.setAttribute("data-scrolled", "");
      else header.removeAttribute("data-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Drawer mobile ---------- */
  var toggle = document.querySelector("[data-nav-toggle]");
  var drawer = document.querySelector("[data-drawer]");
  var backdrop = document.querySelector("[data-drawer-backdrop]");

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    if (backdrop) { backdrop.hidden = false; requestAnimationFrame(function () { backdrop.classList.add("is-open"); }); }
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Fermer le menu");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (backdrop) {
      backdrop.classList.remove("is-open");
      window.setTimeout(function () { backdrop.hidden = true; }, 320);
    }
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Ouvrir le menu");
    document.body.style.overflow = "";
  }
  if (toggle && drawer) {
    toggle.addEventListener("click", function () {
      if (drawer.classList.contains("is-open")) closeDrawer(); else openDrawer();
    });
    if (backdrop) backdrop.addEventListener("click", closeDrawer);
    var closeBtn = drawer.querySelector("[data-drawer-close]");
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    drawer.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeDrawer); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
    });
  }

  /* ---------- Lien de navigation actif ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav] a"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        navLinks.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Révélations au défilement ---------- */
  var revealGroups = [
    ".section-head",
    ".greview", ".verbatim",
    ".fb-text", ".service-row",
    ".shot",
    ".metier-copy", ".promises li", ".ribbon",
    ".methode-head", ".methode-step", ".methode-photo",
    ".zone-copy", ".zone-list",
    ".faq-list",
    ".contact-copy", ".quote-form"
  ];
  var revealEls = [];
  revealGroups.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) { revealEls.push(el); });
  });

  if (!prefersReduced && "IntersectionObserver" in window) {
    revealEls.forEach(function (el) {
      el.setAttribute("data-reveal", "");
      var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.animationDelay = Math.min(sibs % 6, 5) * 60 + "ms";
    });
    var revealObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); obs.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px 100px 0px", threshold: 0 });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  }

  /* ---------- Animations signature (nuancier, peinture, distinctions) ---------- */
  if ("IntersectionObserver" in window) {
    var animObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); obs.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
    document.querySelectorAll("[data-anim]").forEach(function (el) { animObs.observe(el); });
  } else {
    document.querySelectorAll("[data-anim]").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Le mot « impeccable » se peint au chargement */
  var brushWord = document.querySelector(".brush");
  if (brushWord) {
    if (prefersReduced) brushWord.classList.add("is-painted");
    else window.setTimeout(function () { brushWord.classList.add("is-painted"); }, 320);
  }

  /* ---------- Lightbox réalisations ---------- */
  var lightbox = document.querySelector("[data-lightbox]");
  if (lightbox && typeof lightbox.showModal === "function") {
    var stage = lightbox.querySelector("[data-lightbox-stage]");
    var cap = lightbox.querySelector("[data-lightbox-cap]");
    var closeBtn = lightbox.querySelector("[data-lightbox-close]");

    document.querySelectorAll("[data-shot]").forEach(function (shot) {
      shot.setAttribute("role", "button");
      shot.setAttribute("tabindex", "0");
      var open = function () {
        var art = shot.querySelector(".shot-img");
        stage.innerHTML = "";
        if (art) stage.appendChild(art.cloneNode(true));
        cap.textContent = shot.getAttribute("data-label") || "";
        lightbox.showModal();
      };
      shot.addEventListener("click", open);
      shot.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", function () { lightbox.close(); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) lightbox.close();
    });
  }

  /* ---------- Formulaire devis -> e-mail (mailto, sans backend) ---------- */
  var form = document.querySelector("[data-quote-form]");
  if (form) {
    var MAIL_TO = "Abdesign064@gmail.com";
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.elements.name.value.trim();
      var phone = form.elements.phone.value.trim();

      if (!name) { form.elements.name.reportValidity(); return; }
      if (!phone) { form.elements.phone.reportValidity(); return; }

      var city = form.elements.city.value.trim();
      var project = form.elements.project.value;
      var message = form.elements.message.value.trim();

      var lines = [
        "Bonjour, je souhaite un devis pour des travaux de peinture.",
        "",
        "Nom : " + name,
        "Téléphone : " + phone
      ];
      if (city) lines.push("Commune : " + city);
      lines.push("Type de projet : " + project);
      if (message) { lines.push(""); lines.push("Détails : " + message); }

      var subject = "Demande de devis - " + project + (city ? " (" + city + ")" : "");
      var url = "mailto:" + MAIL_TO +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));
      window.location.href = url;
    });
  }
})();
