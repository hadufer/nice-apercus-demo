/* AB DESIGN · v2 - Composants 3D (WebGL / Three.js)
   Trois pièces 3D, cohérentes métier peinture :
     1. heroSwatches  - planches de couleur du nuancier flottant en profondeur (fond hero)
     2. gallery       - galerie réalisations en arc 3D, reveal "passage de rouleau"
     3. nuancier      - anneau de teintes 3D draggable (section Conseil couleur)

   Garde-fous : chaque composant ne s'active que si WebGL dispo ET
   prefers-reduced-motion = non. Init paresseuse (IntersectionObserver),
   pause hors-écran. Sinon le contenu statique reste le fallback. */

import * as THREE from "three";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch (e) { return false; }
}

// Palette peinture (du crème au terracotta) + 2 froides pour le nuancier
const PALETTE = ["#f1ece3", "#e7d4b3", "#d9a441", "#c8814b", "#b85c38", "#8a4a30", "#6f7d74", "#3f5650"];
const ACCENT = new THREE.Color("#b85c38");

function whenVisible(el, cb, opts) {
  if (!("IntersectionObserver" in window)) { cb(); return; }
  const io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { io.disconnect(); cb(); } });
  }, opts || { rootMargin: "200px" });
  io.observe(el);
}

// Génère une texture "carte de couleur" (planche peinte avec léger grain + filet)
function swatchTexture(hex) {
  const s = 256;
  const cv = document.createElement("canvas"); cv.width = cv.height = s;
  const x = cv.getContext("2d");
  x.fillStyle = hex; x.fillRect(0, 0, s, s);
  // grain
  const img = x.getImageData(0, 0, s, s), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 10;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  x.putImageData(img, 0, 0);
  // bas plus clair (effet échantillon trempé)
  const g = x.createLinearGradient(0, s * 0.62, 0, s);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(255,255,255,0.16)");
  x.fillStyle = g; x.fillRect(0, s * 0.62, s, s * 0.38);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/* ============================================================
   1. HERO - planches de couleur flottant en profondeur
   ============================================================ */
function initHeroSwatches(mount) {
  const canvas = mount.querySelector("canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.z = 12;

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const dir = new THREE.DirectionalLight(0xffffff, 0.9);
  dir.position.set(3, 5, 6); scene.add(dir);

  const group = new THREE.Group();
  scene.add(group);

  const cards = [];
  const COUNT = 11;
  const rounded = new THREE.PlaneGeometry(1.5, 2.0, 1, 1);
  for (let i = 0; i < COUNT; i++) {
    const hex = PALETTE[i % PALETTE.length];
    const mat = new THREE.MeshStandardMaterial({
      map: swatchTexture(hex), roughness: 0.62, metalness: 0.0,
      transparent: true, opacity: 0.96, side: THREE.DoubleSide
    });
    const m = new THREE.Mesh(rounded, mat);
    const depth = -8 + Math.random() * 14;     // z
    m.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 11, depth);
    m.rotation.set((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.7, (Math.random() - 0.5) * 0.4);
    const sc = 0.7 + Math.random() * 0.9;
    m.scale.setScalar(sc);
    m.userData = {
      spin: (Math.random() - 0.5) * 0.18,
      floatA: Math.random() * Math.PI * 2,
      floatS: 0.4 + Math.random() * 0.5,
      baseY: m.position.y, sc
    };
    group.add(m); cards.push(m);
  }

  let px = 0, py = 0, running = true;
  function onMove(e) {
    const r = mount.getBoundingClientRect();
    px = ((e.clientX - r.left) / r.width) * 2 - 1;
    py = ((e.clientY - r.top) / r.height) * 2 - 1;
  }
  window.addEventListener("pointermove", onMove, { passive: true });

  function resize() {
    const w = mount.clientWidth, h = mount.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize); resize();

  // pause hors écran
  const vis = new IntersectionObserver(function (en) {
    en.forEach(function (x) { running = x.isIntersecting; if (running) loop(); });
  }, { threshold: 0 });
  vis.observe(mount);

  const clock = new THREE.Clock();
  function loop() {
    if (!running) return;
    const t = clock.getElapsedTime();
    cards.forEach(function (m) {
      const u = m.userData;
      m.rotation.y += u.spin * 0.01;
      m.rotation.z += u.spin * 0.004;
      m.position.y = u.baseY + Math.sin(t * u.floatS + u.floatA) * 0.35;
    });
    group.rotation.y += ((px * 0.35) - group.rotation.y) * 0.04;
    group.rotation.x += ((-py * 0.22) - group.rotation.x) * 0.04;
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();
}

/* ============================================================
   2. GALERIE - arc 3D + shader "passage de rouleau"
   ============================================================ */
const VERT = `
  varying vec2 vUv; uniform float uHover;
  void main(){
    vUv = uv; vec3 p = position;
    p.z += sin(uv.x * 3.14159) * 0.18;
    p.z += uHover * 0.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
  }`;
const FRAG = `
  precision highp float; varying vec2 vUv;
  uniform sampler2D uTex; uniform float uProgress, uHover, uTime;
  uniform vec3 uAccent; uniform vec2 uRatio;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3,289.1)))*43758.5453); }
  void main(){
    vec2 uv = (vUv - 0.5) * uRatio + 0.5;
    float sweep = (vUv.x*0.55 + (1.0-vUv.y)*0.45);
    float edge = uProgress*1.25 - 0.12;
    float grain = (hash(floor(vUv*vec2(60.0,80.0)))-0.5)*0.06;
    float mask = smoothstep(edge-0.10, edge+0.02, sweep+grain);
    float painted = 1.0 - mask;
    vec3 photo = texture2D(uTex, uv).rgb;
    vec3 primer = mix(vec3(0.16,0.15,0.14), uAccent, 0.10);
    float front = (1.0 - smoothstep(0.0,0.09, abs((sweep+grain)-edge)));
    vec3 col = mix(primer, photo, painted);
    col += uAccent * front * 0.35 * (1.0 - uProgress*0.6);
    float sheen = smoothstep(0.0,0.5, sin((vUv.x+vUv.y)*4.0 - uTime*1.6)*0.5+0.5);
    col += uHover * sheen * 0.06;
    float vig = smoothstep(1.15,0.35, distance(vUv, vec2(0.5)));
    col *= mix(0.82,1.0,vig);
    gl_FragColor = vec4(col,1.0);
  }`;

function initGallery(mount, fallback) {
  const figs = Array.prototype.slice.call(fallback.querySelectorAll("[data-shot]"));
  const items = figs.map(function (f) {
    const img = f.querySelector(".shot-img");
    const cap = f.querySelector("figcaption");
    return {
      src: img ? img.getAttribute("src") : "",
      title: cap && cap.querySelector("span") ? cap.querySelector("span").textContent.trim() : "",
      sub: cap ? cap.childNodes[cap.childNodes.length - 1].textContent.trim() : ""
    };
  }).filter(function (it) { return it.src; });
  if (items.length < 2) return;

  fallback.setAttribute("hidden", "");
  mount.removeAttribute("hidden");

  const canvas = mount.querySelector("canvas");
  const overlay = mount.querySelector("[data-g3d-overlay]");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 9);
  const group = new THREE.Group(); scene.add(group);

  const loader = new THREE.TextureLoader();
  const planes = [];
  const N = items.length, R = 7.4;
  const spread = Math.min(0.34 * (N - 1), 1.15);
  const baseH = 3.7, planeW = baseH * 0.78, planeAspect = planeW / baseH;

  items.forEach(function (it, i) {
    const ang = N > 1 ? (i / (N - 1) - 0.5) * spread : 0;
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTex: { value: null }, uProgress: { value: 0 }, uHover: { value: 0 },
        uTime: { value: 0 }, uAccent: { value: ACCENT }, uRatio: { value: new THREE.Vector2(1, 1) }
      }, vertexShader: VERT, fragmentShader: FRAG
    });
    loader.load(it.src, function (t) {
      t.colorSpace = THREE.SRGBColorSpace; mat.uniforms.uTex.value = t;
      const pw = (t.image && t.image.width) || 1, ph = (t.image && t.image.height) || 1;
      const ia = pw / ph;
      if (ia > planeAspect) mat.uniforms.uRatio.value.set(planeAspect / ia, 1);
      else mat.uniforms.uRatio.value.set(1, ia / planeAspect);
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(planeW, baseH, 24, 24), mat);
    mesh.position.set(Math.sin(ang) * R, 0, -Math.cos(ang) * R + R);
    mesh.rotation.y = -ang;
    mesh.userData = { i: i, prog: 0, hoverT: 0 };
    group.add(mesh); planes.push(mesh);
  });

  function setCap(idx) {
    if (!overlay) return;
    if (idx == null) { overlay.classList.remove("is-on"); return; }
    overlay.querySelector("[data-g3d-title]").textContent = items[idx].title;
    overlay.querySelector("[data-g3d-sub]").textContent = items[idx].sub;
    overlay.classList.add("is-on");
  }

  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(-2, -2);
  let dragging = false, lastX = 0, vel = 0, rotY = 0, idle = 0, parX = 0, parY = 0, hoverIdx = null, downX = 0;
  function pos(e) {
    const r = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: ((cx - r.left) / r.width) * 2 - 1, y: -((cy - r.top) / r.height) * 2 + 1, cx };
  }
  function onMove(e) {
    const p = pos(e); ptr.x = p.x; ptr.y = p.y; parX = p.x; parY = p.y;
    if (dragging) { const dx = p.cx - lastX; lastX = p.cx; vel = dx * 0.0045; rotY += vel; idle = 0; }
  }
  function onDown(e) { dragging = true; lastX = pos(e).cx; downX = pos(e).cx; canvas.classList.add("is-grabbing"); }
  function onUp() { dragging = false; canvas.classList.remove("is-grabbing"); }
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerdown", onDown);
  window.addEventListener("pointerup", onUp);
  canvas.addEventListener("touchmove", onMove, { passive: true });
  canvas.addEventListener("touchstart", onDown, { passive: true });
  window.addEventListener("touchend", onUp);
  canvas.addEventListener("click", function (e) {
    if (Math.abs(e.clientX - downX) > 6) return;
    if (hoverIdx != null && figs[hoverIdx]) figs[hoverIdx].click();
  });

  let started = false, running = true;
  whenVisible(mount, function () { started = true; }, { rootMargin: "0px 0px -15% 0px" });
  const vis = new IntersectionObserver(function (en) {
    en.forEach(function (x) { running = x.isIntersecting; if (running) loop(); });
  }, { threshold: 0 });
  vis.observe(mount);

  function resize() {
    const w = mount.clientWidth, h = mount.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.position.z = w < 680 ? 10.2 : 9; camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize); resize();

  const clock = new THREE.Clock();
  function loop() {
    if (!running) return;
    const t = clock.getElapsedTime();
    if (!dragging) { rotY += vel; vel *= 0.94; idle += 0.0016; }
    group.rotation.y += ((rotY + Math.sin(idle) * 0.12) - group.rotation.y) * 0.08;
    group.rotation.x += ((-parY * 0.10) - group.rotation.x) * 0.06;
    group.position.x += ((parX * 0.25) - group.position.x) * 0.05;
    ray.setFromCamera(ptr, camera);
    const hits = ray.intersectObjects(planes, false);
    const nh = hits.length ? hits[0].object.userData.i : null;
    if (nh !== hoverIdx) { hoverIdx = nh; setCap(hoverIdx); }
    canvas.style.cursor = hoverIdx != null ? "pointer" : "grab";
    planes.forEach(function (m, i) {
      const u = m.userData, delay = i * 0.16, localT = Math.max(0, t - delay - 0.15);
      u.prog += ((started ? Math.min(localT * 0.7, 1) : 0) - u.prog) * 0.12;
      m.material.uniforms.uProgress.value = u.prog;
      m.material.uniforms.uTime.value = t;
      const hv = (hoverIdx === i) ? 1 : 0;
      u.hoverT += (hv - u.hoverT) * 0.12;
      m.material.uniforms.uHover.value = u.hoverT;
      m.position.y = u.hoverT * 0.18 + Math.sin(t * 0.6 + i) * 0.05;
    });
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();
}

/* ============================================================
   3. NUANCIER - anneau de teintes 3D draggable
   ============================================================ */
function initNuancier(mount) {
  const canvas = mount.querySelector("canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.4, 7.6);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const d1 = new THREE.DirectionalLight(0xffffff, 0.7); d1.position.set(4, 6, 5); scene.add(d1);
  const d2 = new THREE.DirectionalLight(0xffd9b0, 0.35); d2.position.set(-5, -2, 3); scene.add(d2);

  const ring = new THREE.Group();
  ring.rotation.x = -0.32; ring.rotation.z = 0.12;
  scene.add(ring);

  // lamelles de couleur disposées en cercle (palette répétée + variations)
  const cols = [];
  for (let k = 0; k < 3; k++) PALETTE.forEach(function (c) { cols.push(c); });
  const NB = cols.length, RAD = 3.1;
  const lam = new THREE.BoxGeometry(0.46, 1.5, 0.16);
  cols.forEach(function (hex, i) {
    const a = (i / NB) * Math.PI * 2;
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(hex), roughness: 0.5, metalness: 0.05 });
    const m = new THREE.Mesh(lam, mat);
    m.position.set(Math.cos(a) * RAD, 0, Math.sin(a) * RAD);
    m.rotation.y = -a + Math.PI / 2;
    ring.add(m);
  });
  // moyeu central discret
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.2, 40),
    new THREE.MeshStandardMaterial({ color: 0x2b2722, roughness: 0.7 })
  );
  hub.rotation.x = Math.PI / 2; ring.add(hub);

  let dragging = false, lastX = 0, vel = 0.004, running = true;
  function dx(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
  canvas.addEventListener("pointerdown", function (e) { dragging = true; lastX = dx(e); canvas.classList.add("is-grabbing"); });
  window.addEventListener("pointerup", function () { dragging = false; canvas.classList.remove("is-grabbing"); });
  canvas.addEventListener("pointermove", function (e) {
    if (!dragging) return; const x = dx(e); vel = (x - lastX) * 0.006; lastX = x; ring.rotation.y += vel;
  });
  canvas.addEventListener("touchstart", function (e) { dragging = true; lastX = dx(e); }, { passive: true });
  window.addEventListener("touchend", function () { dragging = false; });
  canvas.addEventListener("touchmove", function (e) {
    if (!dragging) return; const x = dx(e); vel = (x - lastX) * 0.006; lastX = x; ring.rotation.y += vel;
  }, { passive: true });

  function resize() {
    const w = mount.clientWidth, h = mount.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize); resize();

  const vis = new IntersectionObserver(function (en) {
    en.forEach(function (x) { running = x.isIntersecting; if (running) loop(); });
  }, { threshold: 0 });
  vis.observe(mount);

  function loop() {
    if (!running) return;
    if (!dragging) { ring.rotation.y += vel; vel += (0.004 - vel) * 0.02; }
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();
}

/* ============================================================
   Bootstrap
   ============================================================ */
if (!reduced && webglOK()) {
  const hero = document.querySelector("[data-hero3d]");
  if (hero) { hero.removeAttribute("hidden"); whenVisible(hero, function () { initHeroSwatches(hero); }, { rootMargin: "300px" }); }

  const gal = document.querySelector("[data-gallery3d]");
  const fb = document.querySelector("[data-gallery]");
  // On observe la grille statique (VISIBLE) : un conteneur [hidden] n'intersecte jamais.
  if (gal && fb) whenVisible(fb, function () { initGallery(gal, fb); }, { rootMargin: "300px" });

  const nu = document.querySelector("[data-nuancier3d]");
  if (nu) { nu.removeAttribute("hidden"); whenVisible(nu, function () { initNuancier(nu); }, { rootMargin: "300px" }); }
}
