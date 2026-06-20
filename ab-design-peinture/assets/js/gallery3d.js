/* AB DESIGN · Galerie 3D des réalisations (WebGL / Three.js)
   Effet signature unique : les photos de chantier flottent sur un arc
   en perspective ; chaque tirage se "peint" au rouleau à l'apparition
   (shader de balayage). Drag pour faire pivoter, parallaxe à la souris,
   clic = lightbox.

   Garde-fous (règle maison) :
   - Ne s'active QUE si WebGL dispo ET prefers-reduced-motion = non.
   - Sinon, la grille statique <div class="gallery"> reste affichée (fallback).
   - Chargé en module + defer, n'impacte jamais le rendu de base. */

import * as THREE from "three";

const mount = document.querySelector("[data-gallery3d]");
const fallback = document.querySelector("[data-gallery]");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch (e) { return false; }
}

if (mount && fallback && !reduced && webglOK()) {
  init();
}

function init() {
  // Source de vérité : les figures de la grille statique (mêmes images / légendes)
  const figs = Array.prototype.slice.call(fallback.querySelectorAll("[data-shot]"));
  const items = figs.map(function (f) {
    const img = f.querySelector(".shot-img");
    const cap = f.querySelector("figcaption");
    return {
      src: img ? img.getAttribute("src") : "",
      title: cap && cap.querySelector("span") ? cap.querySelector("span").textContent.trim() : "",
      sub: cap ? cap.childNodes[cap.childNodes.length - 1].textContent.trim() : "",
      label: f.getAttribute("data-label") || ""
    };
  }).filter(function (it) { return it.src; });

  if (items.length < 2) return;

  // Bascule fallback -> 3D
  fallback.setAttribute("hidden", "");
  mount.removeAttribute("hidden");

  const canvas = mount.querySelector("canvas");
  const overlay = mount.querySelector("[data-g3d-overlay]");

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const group = new THREE.Group();
  scene.add(group);

  // --- Shader "passage de rouleau" -----------------------------------------
  const vert = `
    varying vec2 vUv;
    uniform float uHover;
    void main(){
      vUv = uv;
      vec3 p = position;
      // légère cambrure du tirage + avancée au survol
      p.z += sin(uv.x * 3.14159) * 0.18;
      p.z += uHover * 0.5;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;

  const frag = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTex;
    uniform float uProgress;   // 0 -> 1 : la peinture passe
    uniform float uHover;
    uniform float uTime;
    uniform vec3  uAccent;
    uniform vec2  uRatio;      // cover

    float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }

    void main(){
      // cover : recadrage sans déformation
      vec2 uv = (vUv - 0.5) * uRatio + 0.5;

      // Balayage diagonal "coup de rouleau", bord franc + grain
      float sweep = (vUv.x * 0.55 + (1.0 - vUv.y) * 0.45);
      float edge = uProgress * 1.25 - 0.12;
      float grain = (hash(floor(vUv * vec2(60.0, 80.0))) - 0.5) * 0.06;
      float mask = smoothstep(edge - 0.10, edge + 0.02, sweep + grain);
      // mask=1 -> pas encore peint (mur nu) ; on inverse
      float painted = 1.0 - mask;

      vec3 photo = texture2D(uTex, uv).rgb;
      vec3 primer = mix(vec3(0.16, 0.15, 0.14), uAccent, 0.10); // sous-couche graphite

      // Liseré de peinture fraîche sur le front du rouleau
      float crest = smoothstep(0.0, 0.06, abs(painted - 0.5)) ;
      float front = (1.0 - smoothstep(0.0, 0.09, abs((sweep + grain) - edge)));
      vec3 col = mix(primer, photo, painted);
      col += uAccent * front * 0.35 * (1.0 - uProgress * 0.6);

      // Brillance qui glisse au survol
      float sheen = smoothstep(0.0, 0.5, sin((vUv.x + vUv.y) * 4.0 - uTime * 1.6) * 0.5 + 0.5);
      col += uHover * sheen * 0.06;

      // Vignettage doux
      float vig = smoothstep(1.15, 0.35, distance(vUv, vec2(0.5)));
      col *= mix(0.82, 1.0, vig);

      gl_FragColor = vec4(col, 1.0);
    }`;

  const accent = new THREE.Color("#b85c38");
  const loader = new THREE.TextureLoader();
  const planes = [];
  const N = items.length;
  const R = 7.4;                 // rayon de l'arc
  const spread = Math.min(0.34 * (N - 1), 1.15); // angle total
  const baseH = 3.7;

  const planeW = baseH * 0.78;
  const planeAspect = planeW / baseH; // = 0.78

  items.forEach(function (it, i) {
    const ang = N > 1 ? (i / (N - 1) - 0.5) * spread : 0;

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTex: { value: null },
        uProgress: { value: 0 },
        uHover: { value: 0 },
        uTime: { value: 0 },
        uAccent: { value: accent },
        uRatio: { value: new THREE.Vector2(1, 1) }
      },
      vertexShader: vert,
      fragmentShader: frag
    });

    loader.load(it.src, function (t) {
      t.colorSpace = THREE.SRGBColorSpace;
      mat.uniforms.uTex.value = t;
      const pw = (t.image && t.image.width) || 1;
      const ph = (t.image && t.image.height) || 1;
      const imgAspect = pw / ph;
      // recadrage "cover" sans déformation
      if (imgAspect > planeAspect) {
        mat.uniforms.uRatio.value.set(planeAspect / imgAspect, 1);
      } else {
        mat.uniforms.uRatio.value.set(1, imgAspect / planeAspect);
      }
    });

    const geo = new THREE.PlaneGeometry(planeW, baseH, 24, 24);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(Math.sin(ang) * R, 0, -Math.cos(ang) * R + R);
    mesh.rotation.y = -ang;
    mesh.userData = { i: i, item: it, ang: ang, prog: 0, hoverT: 0 };
    group.add(mesh);
    planes.push(mesh);
  });

  // --- Légende overlay (HTML, texte net hors WebGL) ------------------------
  function setCaption(idx) {
    if (!overlay) return;
    if (idx == null) { overlay.classList.remove("is-on"); return; }
    const it = items[idx];
    overlay.querySelector("[data-g3d-title]").textContent = it.title;
    overlay.querySelector("[data-g3d-sub]").textContent = it.sub;
    overlay.classList.add("is-on");
  }

  // --- Interaction ---------------------------------------------------------
  const ray = new THREE.Raycaster();
  const ptr = new THREE.Vector2(-2, -2);
  let dragging = false, lastX = 0, vel = 0, rotY = 0, idle = 0;
  let parX = 0, parY = 0, hoverIdx = null;

  function ndc(e) {
    const r = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    return { x: (x / r.width) * 2 - 1, y: -(y / r.height) * 2 + 1, r: r };
  }

  function onMove(e) {
    const p = ndc(e);
    ptr.x = p.x; ptr.y = p.y;
    parX = p.x; parY = p.y;
    if (dragging) {
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const dx = cx - lastX; lastX = cx;
      vel = dx * 0.0045;
      rotY += vel;
      idle = 0;
    }
  }
  function onDown(e) {
    dragging = true;
    lastX = e.touches ? e.touches[0].clientX : e.clientX;
    canvas.classList.add("is-grabbing");
  }
  function onUp() { dragging = false; canvas.classList.remove("is-grabbing"); }

  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerdown", onDown);
  window.addEventListener("pointerup", onUp);
  canvas.addEventListener("touchmove", onMove, { passive: true });
  canvas.addEventListener("touchstart", onDown, { passive: true });
  window.addEventListener("touchend", onUp);

  // Clic = lightbox (réutilise la modale existante via la figure source)
  let downX = 0;
  canvas.addEventListener("pointerdown", function (e) { downX = e.clientX; });
  canvas.addEventListener("click", function (e) {
    if (Math.abs(e.clientX - downX) > 6) return; // c'était un drag
    if (hoverIdx != null && figs[hoverIdx]) figs[hoverIdx].click();
  });

  // --- Apparition (reveal) déclenchée à l'entrée en vue --------------------
  let started = false;
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { started = true; io.disconnect(); } });
    }, { rootMargin: "0px 0px -15% 0px" });
    io.observe(mount);
  } else { started = true; }

  // --- Resize --------------------------------------------------------------
  function resize() {
    const w = mount.clientWidth, h = mount.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // recule un peu la caméra sur petit écran pour tout voir
    camera.position.z = w < 680 ? 10.2 : 9;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  // --- Boucle --------------------------------------------------------------
  const clock = new THREE.Clock();
  function tick() {
    const t = clock.getElapsedTime();
    const dt = Math.min(clock.getDelta ? 0.016 : 0.016, 0.05);

    // Inertie + dérive lente
    if (!dragging) { rotY += vel; vel *= 0.94; idle += 0.0016; }
    group.rotation.y += ((rotY + Math.sin(idle) * 0.12) - group.rotation.y) * 0.08;

    // Parallaxe douce
    group.rotation.x += ((-parY * 0.10) - group.rotation.x) * 0.06;
    group.position.x += ((parX * 0.25) - group.position.x) * 0.05;

    // Raycast survol
    ray.setFromCamera(ptr, camera);
    const hits = ray.intersectObjects(planes, false);
    const newHover = hits.length ? hits[0].object.userData.i : null;
    if (newHover !== hoverIdx) { hoverIdx = newHover; setCaption(hoverIdx); }
    canvas.style.cursor = hoverIdx != null ? "pointer" : "grab";

    planes.forEach(function (m, i) {
      const u = m.userData;
      // reveal échelonné
      const target = started ? 1 : 0;
      const delay = i * 0.16;
      const localT = Math.max(0, t - delay - 0.15);
      u.prog += ((started ? Math.min(localT * 0.7, 1) : 0) - u.prog) * 0.12;
      m.material.uniforms.uProgress.value = u.prog;
      m.material.uniforms.uTime.value = t;
      // hover lift
      const hv = (hoverIdx === i) ? 1 : 0;
      u.hoverT += (hv - u.hoverT) * 0.12;
      m.material.uniforms.uHover.value = u.hoverT;
      m.position.y = u.hoverT * 0.18 + Math.sin(t * 0.6 + i) * 0.05;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
}
