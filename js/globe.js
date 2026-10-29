/* ==========================================================================
   NextGen AI Labs — globe.js (ES module, loaded on demand by main.js)
   3D globe for the "Worldwide" section: dark sphere with a rim glow, lat/long grid,
   dotted surface, pulsing country markers, animated arcs from our team, a tilted
   orbit ring and HTML labels for markers facing the viewer. Drag to spin.
   Loaded only on screens ≥ 768px with WebGL and motion allowed; the static globe in
   the HTML stays as the fallback. Renders only while on screen and the tab is visible.
   ========================================================================== */
import * as THREE from '../assets/vendor/three.module.min.js';

const MAGENTA = new THREE.Color('#ff29d0'), VIOLET = new THREE.Color('#7b2fff'), GREEN = new THREE.Color('#4ade80');

function toVec(lat, lon, r) {
  const phi = (90 - lat) * Math.PI / 180, theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

export function initGlobe(stage, places, hub) {
  const canvas = stage.querySelector('.globe-canvas'), labelsBox = stage.querySelector('.globe-labels');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 4.4);
  const R = 1;
  const globe = new THREE.Group(); scene.add(globe);
  globe.rotation.x = 0.32;                                   // tilt so the northern hemisphere faces us

  // sphere: dark core, magenta/violet rim (fresnel)
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 64), new THREE.ShaderMaterial({
    transparent: true,
    uniforms: { cRim: { value: MAGENTA }, cRim2: { value: VIOLET } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 cRim; uniform vec3 cRim2; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.6); vec3 base = vec3(0.035,0.03,0.07); vec3 rim = mix(cRim2, cRim, f); gl_FragColor = vec4(base + rim*f*0.9, 0.96); }'
  }));
  globe.add(sphere);

  // outer glow halo (back-faced, additive)
  const halo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.12, 48, 48), new THREE.ShaderMaterial({
    transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
    vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: 'varying vec3 vN; void main(){ float i = pow(0.62 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(0.48,0.18,1.0, 1.0) * i; }'
  }));
  scene.add(halo);

  // lat/long grid
  const gridPts = [];
  for (let lat = -60; lat <= 60; lat += 30) for (let lon = -180; lon < 180; lon += 4) gridPts.push(toVec(lat, lon, R * 1.001), toVec(lat, lon + 4, R * 1.001));
  for (let lon = -180; lon < 180; lon += 30) for (let lat = -84; lat < 84; lat += 4) gridPts.push(toVec(lat, lon, R * 1.001), toVec(lat + 4, lon, R * 1.001));
  globe.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(gridPts), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.07 })));

  // dotted surface (fibonacci sphere)
  const N = 1600, dots = new Float32Array(N * 3), ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i; dots.set([Math.cos(th) * r * R * 1.003, y * R * 1.003, Math.sin(th) * r * R * 1.003], i * 3); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dots, 3));
  globe.add(new THREE.Points(dg, new THREE.PointsMaterial({ color: 0x9b8cff, size: 0.008, transparent: true, opacity: 0.35, depthWrite: false })));

  // markers + pulse rings
  const ringGeo = new THREE.RingGeometry(0.018, 0.026, 32);
  const markers = places.map((p, i) => {
    const pos = toVec(p.lat, p.lon, R * 1.01);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(p.hub ? 0.022 : 0.014, 16, 16), new THREE.MeshBasicMaterial({ color: p.hub ? GREEN : MAGENTA }));
    dot.position.copy(pos); globe.add(dot);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: p.hub ? GREEN : MAGENTA, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
    ring.position.copy(pos); ring.lookAt(pos.clone().multiplyScalar(2)); globe.add(ring);
    let el = null;
    if (p.label) { el = document.createElement('span'); el.className = 'globe-label' + (p.hub ? ' is-hub' : ''); el.textContent = p.name; labelsBox.appendChild(el); }
    return { p, pos, ring, el, phase: (i * 0.37) % 1 };
  });

  // arcs from the hub to every market, drawn one after another
  const hubPos = toVec(hub.lat, hub.lon, R * 1.01);
  const arcs = places.filter(p => !p.hub).map((p, i) => {
    const end = toVec(p.lat, p.lon, R * 1.01), mid = hubPos.clone().add(end).multiplyScalar(0.5);
    const lift = 1 + hubPos.distanceTo(end) * 0.42; mid.normalize().multiplyScalar(R * lift);
    const curve = new THREE.QuadraticBezierCurve3(hubPos, mid, end), pts = curve.getPoints(60);
    const geo = new THREE.BufferGeometry().setFromPoints(pts); geo.setDrawRange(0, 0);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: i % 2 ? VIOLET : MAGENTA, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
    globe.add(line);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    head.visible = false; globe.add(head);
    return { line, geo, curve, head, start: i * 0.55 };
  });
  const ARC_CYCLE = arcs.length * 0.55 + 2;

  // tilted orbit ring around the globe
  const orbitPts = []; for (let a = 0; a <= 128; a++) { const t = a / 128 * Math.PI * 2; orbitPts.push(new THREE.Vector3(Math.cos(t) * 1.42, 0, Math.sin(t) * 1.42)); }
  const orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPts), new THREE.LineBasicMaterial({ color: 0xc8ff5a, transparent: true, opacity: 0.28 }));
  orbit.rotation.set(1.25, 0, 0.22); scene.add(orbit);
  const sat = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 12), new THREE.MeshBasicMaterial({ color: 0xc8ff5a })); orbit.add(sat);

  // sizing
  function size() {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  size(); new ResizeObserver(size).observe(stage);

  // drag to spin; auto-rotate resumes after a pause
  let dragging = false, lastX = 0, lastY = 0, vel = 0.0016, idleAt = 0;
  canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); stage.classList.add('is-dragging'); });
  canvas.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
    globe.rotation.y += dx * 0.006; globe.rotation.x = Math.max(-0.4, Math.min(0.9, globe.rotation.x + dy * 0.004)); vel = dx * 0.0004;
  });
  const end = () => { dragging = false; idleAt = performance.now(); stage.classList.remove('is-dragging'); };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  globe.rotation.y = -1.9;                                    // start facing the Atlantic: Americas, Caribbean, Europe

  // render loop (only while visible)
  let visible = true, raf = 0, t0 = performance.now();
  const tmp = new THREE.Vector3(), camDir = new THREE.Vector3();
  function frame(now) {
    raf = 0; if (!visible || document.hidden) return;
    const t = (now - t0) / 1000;
    if (!dragging) { const target = now - idleAt > 2500 ? 0.0016 : 0; vel += (target - vel) * 0.04; globe.rotation.y += vel; }
    orbit.rotation.y += 0.002; sat.position.set(Math.cos(t * 0.6) * 1.42, 0, Math.sin(t * 0.6) * 1.42);
    markers.forEach(m => { const k = (t * 0.6 + m.phase) % 1; m.ring.scale.setScalar(1 + k * 2.2); m.ring.material.opacity = 0.8 * (1 - k); });
    const ct = t % ARC_CYCLE;
    arcs.forEach(a => {
      const k = Math.min(1, Math.max(0, (ct - a.start) / 1.2)), fade = ct > a.start + 4 ? Math.max(0, 1 - (ct - a.start - 4) / 1.5) : 1;
      a.geo.setDrawRange(0, Math.floor(k * 61)); a.line.material.opacity = 0.85 * fade;
      a.head.visible = k > 0 && k < 1; if (a.head.visible) a.head.position.copy(a.curve.getPoint(k));
    });
    renderer.render(scene, camera);
    // HTML labels for markers on the visible side
    const w = stage.clientWidth, h = stage.clientHeight;
    camera.getWorldDirection(camDir);
    markers.forEach(m => {
      if (!m.el) return;
      tmp.copy(m.pos).applyMatrix4(globe.matrixWorld);
      const facing = -tmp.clone().normalize().dot(camDir);
      tmp.project(camera);
      const show = facing > 0.18;
      m.el.style.opacity = show ? Math.min(1, (facing - 0.18) * 4).toFixed(2) : 0;
      if (show) m.el.style.transform = `translate(${((tmp.x + 1) / 2 * w).toFixed(1)}px, ${((1 - tmp.y) / 2 * h).toFixed(1)}px)`;
    });
    raf = requestAnimationFrame(frame);
  }
  new IntersectionObserver(en => { visible = en[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }).observe(stage);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !raf) raf = requestAnimationFrame(frame); });
  stage.classList.add('is-3d');
  raf = requestAnimationFrame(frame);
}
