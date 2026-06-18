/* Alumi'Home · interactions
   Tout est progressif : sans JS, le site reste lisible et navigable. */
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
    ".service",
    ".shot",
    ".promises li",
    ".zone-copy", ".zone-list",
    ".atelier-copy",
    ".contact-copy", ".quote-form",
    ".faq-list"
  ];
  var revealEls = [];
  revealGroups.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) { revealEls.push(el); });
  });

  if (!prefersReduced && "IntersectionObserver" in window) {
    revealEls.forEach(function (el) {
      el.setAttribute("data-reveal", "");
      // léger décalage pour les éléments d'un même groupe
      var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.animationDelay = Math.min(sibs % 6, 5) * 60 + "ms";
    });
    // marge basse positive : la révélation démarre juste avant l'entrée en vue
    var revealObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); obs.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px 100px 0px", threshold: 0 });
    revealEls.forEach(function (el) { revealObs.observe(el); });
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
      if (e.target === lightbox) lightbox.close(); // clic sur le fond
    });
  }

  /* ---------- Formulaire devis -> WhatsApp ---------- */
  var form = document.querySelector("[data-quote-form]");
  if (form) {
    var WA_NUMBER = "33668639762";
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
        "Bonjour Rémy, je souhaite un devis pour un projet en aluminium.",
        "",
        "Nom : " + name,
        "Téléphone : " + phone
      ];
      if (city) lines.push("Commune : " + city);
      lines.push("Type de projet : " + project);
      if (message) { lines.push(""); lines.push("Détails : " + message); }

      var url = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
    });
  }
})();
