/* ==========================================================================
   NextGen AI Labs — hero3d.js (ES module, loaded on demand by main.js)
   3D hero: an energy core (animated fresnel sphere + glow + wireframe shell),
   three tilted orbit rings with satellites, particle streams spiralling in and
   shooting out, and task chips that orbit in 3D, dive into the core and come
   back out "done". Gentle pointer parallax. Desktop only (≥ 992px, WebGL,
   motion allowed); the CSS hero underneath stays as the fallback.
   ========================================================================== */
import * as THREE from '../assets/vendor/three.module.min.js';

const MAG = new THREE.Color('#ff29d0'), VIO = new THREE.Color('#7b2fff'), GRN = new THREE.Color('#4ade80');

function glowTexture(inner, outer) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, inner); gr.addColorStop(0.35, outer); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function initHero3D(stage, pairs, onDone) {
  const canvas = document.createElement('canvas'); canvas.className = 'hero3d-canvas'; canvas.setAttribute('aria-hidden', 'true');
  const labels = document.createElement('div'); labels.className = 'hero3d-labels'; labels.setAttribute('aria-hidden', 'true');
  stage.appendChild(canvas); stage.appendChild(labels);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.35, 8.6); camera.lookAt(0, 0, 0);
  const world = new THREE.Group(); scene.add(world);

  // ---- energy core
  const coreMat = new THREE.ShaderMaterial({
    uniforms: { t: { value: 0 }, pulse: { value: 0 }, cA: { value: MAG }, cB: { value: VIO } },
    vertexShader: 'varying vec3 vN; varying vec3 vP; varying vec3 vV; uniform float t; uniform float pulse; void main(){ vN = normalize(normalMatrix*normal); vP = position; vec3 p = position * (1.0 + pulse*0.06 + 0.015*sin(t*3.0 + position.y*6.0)); vec4 mv = modelViewMatrix*vec4(p,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform float t; uniform float pulse; uniform vec3 cA; uniform vec3 cB; varying vec3 vN; varying vec3 vP; varying vec3 vV; void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.2); float bands = 0.5 + 0.5*sin(vP.y*9.0 + t*2.2 + sin(vP.x*6.0 + t)*1.5); vec3 col = mix(cB, cA, 0.35 + 0.45*bands); col += vec3(1.0,0.75,1.0) * pow(max(dot(vN, normalize(vec3(-0.5,0.6,0.8))),0.0), 18.0) * 0.8; col += f * vec3(1.0,0.55,1.0) * (0.9 + pulse); gl_FragColor = vec4(col, 1.0); }'
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.62, 64, 64), coreMat); world.add(core);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('rgba(255,120,235,0.9)', 'rgba(123,47,255,0.35)'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  glow.scale.set(3.6, 3.6, 1); world.add(glow);
  const shell = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.98, 1)), new THREE.LineBasicMaterial({ color: MAG, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending }));
  world.add(shell);
  const shell2 = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.18, 0)), new THREE.LineBasicMaterial({ color: VIO, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending }));
  world.add(shell2);

  // ---- tilted orbit rings + satellites
  const rings = [[1.45, 1.15, 0.2, MAG, 0.9], [1.78, 1.45, -0.6, VIO, -0.6], [2.1, 1.7, 0.9, new THREE.Color('#c8ff5a'), 0.45]].map(([r, rx, rz, col, sp]) => {
    const g = new THREE.Group(); g.rotation.set(rx, 0, rz);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 8, 160), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
    ring.rotation.x = Math.PI / 2; g.add(ring);
    const sat = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), new THREE.MeshBasicMaterial({ color: col })); g.add(sat);
    const sg = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('rgba(255,255,255,1)', 'rgba(255,41,208,0.4)'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    sg.scale.set(0.3, 0.3, 1); sat.add(sg);
    world.add(g); return { g, sat, r, sp };
  });

  // ---- particle streams: in (white, spiral to the core) and out (magenta, fast)
  function stream(n, color, size) {
    const pos = new Float32Array(n * 3), seeds = [];
    for (let i = 0; i < n; i++) seeds.push({ a: Math.random() * Math.PI * 2, y: (Math.random() - 0.5) * 1.6, life: Math.random(), sp: 0.12 + Math.random() * 0.18, tw: 1.2 + Math.random() * 1.5 });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
    world.add(pts); return { pos, seeds, geo };
  }
  const sIn = stream(700, 0xffffff, 0.028), sOut = stream(260, MAG, 0.038);

  // ---- task chips orbiting in 3D (HTML, projected each frame)
  const P = 6.6, chips = pairs.map((p, i) => {
    const el = document.createElement('span'); el.className = 'h3-chip';
    el.innerHTML = `<i class="bi ${p.icon}"></i><b></b>`;
    labels.appendChild(el);
    return { el, txt: el.querySelector('b'), ic: el.querySelector('i'), p, off: i * (P / pairs.length), base: i / pairs.length * Math.PI * 2, state: '' };
  });
  const tilt = -0.42, v = new THREE.Vector3();
  let pulse = 0;

  // ---- sizing, parallax, visibility
  function size() { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  size(); new ResizeObserver(size).observe(stage);
  let px = 0, py = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', e => { tx = (e.clientX / window.innerWidth - 0.5); ty = (e.clientY / window.innerHeight - 0.5); }, { passive: true });
  let visible = true, raf = 0; const t0 = performance.now(); let last = t0;
  new IntersectionObserver(en => { visible = en[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }).observe(stage);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !raf) raf = requestAnimationFrame(frame); });

  function frame(now) {
    raf = 0; if (!visible || document.hidden) return;
    const t = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;
    px += (tx - px) * 0.05; py += (ty - py) * 0.05;
    world.rotation.y = px * 0.5; world.rotation.x = py * 0.3;
    pulse *= 0.92; coreMat.uniforms.t.value = t; coreMat.uniforms.pulse.value = pulse;
    core.rotation.y = t * 0.3; shell.rotation.set(t * 0.12, t * 0.2, 0); shell2.rotation.set(-t * 0.08, -t * 0.14, t * 0.05);
    glow.material.opacity = 0.75 + pulse * 0.25 + 0.05 * Math.sin(t * 2);
    rings.forEach(r => { const a = t * r.sp; r.sat.position.set(Math.cos(a) * r.r, 0, Math.sin(a) * r.r); r.g.rotation.y += 0.0015; });
    // particles
    [[sIn, 1], [sOut, -1]].forEach(([s, dir]) => {
      for (let i = 0; i < s.seeds.length; i++) {
        const q = s.seeds[i]; q.life += dt * q.sp * (dir > 0 ? 1 : 2.2); if (q.life > 1) q.life -= 1;
        const k = dir > 0 ? 1 - q.life : q.life, r = 0.6 + k * 2.7, a = q.a + (dir > 0 ? (1 - k) * q.tw * 2.4 : k * 0.6) + t * 0.05;
        s.pos[i * 3] = Math.cos(a) * r; s.pos[i * 3 + 1] = q.y * k * 0.9 + Math.sin(a * 2 + t) * 0.05; s.pos[i * 3 + 2] = Math.sin(a) * r;
      }
      s.geo.attributes.position.needsUpdate = true;
    });
    renderer.render(scene, camera);
    // chips: orbit (task) → dive into the core → fly out (done) → fade
    const w = stage.clientWidth, h = stage.clientHeight;
    chips.forEach(c => {
      const ph = ((t + c.off) % P) / P; let R, op, done = false, sc = 1;
      if (ph < 0.5) { R = 1.9; op = Math.min(1, ph / 0.06); }
      else if (ph < 0.62) { const k = (ph - 0.5) / 0.12; R = 1.9 - k * 1.35; op = 1 - k; sc = 1 - k * 0.6; }
      else if (ph < 0.66) { R = 0.55; op = 0; if (c.state !== 'hit') { c.state = 'hit'; pulse = 1; if (onDone) onDone(); } }
      else if (ph < 0.86) { const k = (ph - 0.66) / 0.2; R = 0.55 + k * 1.6; op = Math.min(1, k * 4); done = true; sc = 0.6 + k * 0.4; }
      else { R = 2.15; op = Math.max(0, 1 - (ph - 0.86) / 0.14); done = true; }
      if (ph < 0.62 && c.state === 'hit') c.state = '';
      const a = c.base + t * 0.22;
      v.set(Math.cos(a) * R, 0, Math.sin(a) * R);
      const y = v.z * Math.sin(tilt) + (done ? 0.42 : 0), z = v.z * Math.cos(tilt); v.set(v.x, y, z).applyEuler(world.rotation);   // done chips fly out on a higher path
      const depth = v.z;                                       // > 0 = in front of the core
      const behind = depth < 0 && Math.hypot(v.x, v.y) < 0.75;
      v.project(camera);
      const want = done ? 'done' : 'task';
      if (c.mode !== want) { c.mode = want; c.el.classList.toggle('is-done', done); c.txt.textContent = done ? c.p.done : c.p.task; c.ic.className = 'bi ' + (done ? 'bi-check2-circle' : c.p.icon); }
      const s = sc * (0.82 + (depth + 2.5) / 5 * 0.36);
      c.el.style.opacity = (behind ? op * 0.15 : op * (depth < 0 ? 0.55 : 1)).toFixed(2);
      c.el.style.zIndex = depth > 0 ? 3 : 1;
      c.el.style.transform = `translate(${((v.x + 1) / 2 * w).toFixed(1)}px, ${((1 - v.y) / 2 * h).toFixed(1)}px) translate(-50%, -50%) scale(${s.toFixed(3)})`;
    });
    raf = requestAnimationFrame(frame);
  }
  stage.classList.add('is-3d');
  raf = requestAnimationFrame(frame);
}
