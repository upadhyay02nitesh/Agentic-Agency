/* ==========================================================================
   NextGenAI Infotech — effects.js
   Visual effects engine. Exposes window.NextGenFX.

   Rendering tiers (picked once at load):
     1. FULL    desktop + WebGL + decent hardware  -> Three.js neural core (lazy-loaded)
     2. LITE    mobile / low-end / no WebGL         -> 2D canvas rotating network (no libs)
     3. STATIC  prefers-reduced-motion              -> one still frame, no loops

   Every loop is paused when its canvas is off-screen or the tab is hidden.
   ========================================================================== */
(function () {
  'use strict';

  var THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isSmall = window.matchMedia('(max-width: 767px)').matches ||
                window.matchMedia('(pointer: coarse)').matches;
  var lowEnd = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
               (navigator.deviceMemory && navigator.deviceMemory <= 4);

  // Palette channels come from the --rgb-* tokens in style.css (fallbacks match them).
  var rootStyle = getComputedStyle(document.documentElement);
  function token(name, fallback) { var v = rootStyle.getPropertyValue(name).replace(/\s/g, ''); return v || fallback; }
  var COLORS = { blue: token('--rgb-blue', '59,130,246'), cyan: token('--rgb-cyan', '34,211,238'),
                 violet: token('--rgb-violet', '91,141,239'), saffron: token('--rgb-saffron', '255,153,51') };

  /* ---------- helpers --------------------------------------------------- */

  function webglAvailable() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }

  // Runs `onVisible(true|false)` whenever the element enters/leaves the viewport.
  function watchVisibility(el, cb) {
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver(function (entries) {
      cb(entries[0].isIntersecting);
    }, { rootMargin: '80px' }).observe(el);
  }

  // Sizes a canvas to its CSS box at a capped device pixel ratio.
  function fitCanvas(canvas, maxDpr) {
    var dpr = Math.min(window.devicePixelRatio || 1, maxDpr || 1.5);
    var r = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    return { w: r.width, h: r.height, dpr: dpr };
  }

  /* ---------- 2D tier: ambient particle network ------------------------- */
  // Drifting particles joined by faint lines. Used behind "Why us" and CTA
  // sections and (via SphereNetwork) as the lightweight hero.
  function AmbientNetwork(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d');
    var count = opts.count || (isSmall ? 28 : 60);
    var link = opts.link || 130;
    var pts = [], size, raf = 0, visible = false, last = 0;

    function reset() {
      size = fitCanvas(canvas, 1.25);
      ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
      pts = [];
      for (var i = 0; i < count; i++) {
        pts.push({ x: Math.random() * size.w, y: Math.random() * size.h,
                   vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
                   c: i % 7 === 0 ? COLORS.saffron : (i % 5 === 0 ? COLORS.violet : (i % 3 === 0 ? COLORS.cyan : COLORS.blue)) });
      }
    }

    function draw(dt) {
      ctx.clearRect(0, 0, size.w, size.h);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx * dt * .06; p.y += p.vy * dt * .06;
        if (p.x < 0 || p.x > size.w) p.vx *= -1;
        if (p.y < 0 || p.y > size.h) p.vy *= -1;
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < link * link) {
            ctx.strokeStyle = 'rgba(' + COLORS.blue + ',' + (0.18 * (1 - Math.sqrt(d) / link)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(' + p.c + ',.8)';
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.283); ctx.fill();
      }
    }

    function frame(t) {
      if (!visible || document.hidden) { raf = 0; return; }
      var dt = Math.min(50, t - last); last = t;
      draw(dt);
      raf = requestAnimationFrame(frame);
    }

    reset();
    draw(0);                                  // always paint one frame (static fallback)
    if (reduceMotion) return;
    watchVisibility(canvas, function (v) {
      visible = v;
      if (v && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    });
    window.addEventListener('resize', function () { reset(); if (reduceMotion) draw(0); });
  }

  /* ---------- 2D tier: rotating "neural sphere" (lite hero) ------------- */
  // Nodes sit on a sphere (Fibonacci distribution), rotated and perspective-
  // projected by hand. Looks like the 3D hero but costs a fraction of the CPU.
  function SphereNetwork(canvas) {
    var ctx = canvas.getContext('2d');
    var N = isSmall ? 46 : 70;
    var nodes = [], links = [], size, raf = 0, visible = false, rotY = 0.6, rotX = 0.35;
    var mouse = { x: 0, y: 0 }, t0 = performance.now();

    function build() {
      nodes = []; links = [];
      var ga = Math.PI * (3 - Math.sqrt(5));
      for (var i = 0; i < N; i++) {
        var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i;
        var s = 0.85 + Math.random() * 0.35;
        nodes.push({ x: Math.cos(th) * r * s, y: y * s, z: Math.sin(th) * r * s,
                     c: i % 9 === 0 ? COLORS.saffron : (i % 6 === 0 ? COLORS.violet : (i % 3 === 0 ? COLORS.cyan : COLORS.blue)) });
      }
      for (var a = 0; a < N; a++) for (var b = a + 1; b < N; b++) {
        var dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y, dz = nodes[a].z - nodes[b].z;
        if (dx * dx + dy * dy + dz * dz < 0.42) links.push([a, b]);
      }
    }

    function render(time) {
      var w = size.w, h = size.h, R = Math.min(w, h) * 0.36, cx = w / 2, cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      // core glow
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * .75);
      var pulse = 0.85 + Math.sin(time / 900) * 0.15;
      g.addColorStop(0, 'rgba(' + COLORS.cyan + ',' + (0.55 * pulse) + ')');
      g.addColorStop(0.35, 'rgba(' + COLORS.blue + ',.25)');
      g.addColorStop(1, 'rgba(' + COLORS.blue + ',0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * .75, 0, 6.283); ctx.fill();

      var cy_ = Math.cos(rotY), sy = Math.sin(rotY), cx_ = Math.cos(rotX), sx = Math.sin(rotX);
      var P = nodes.map(function (n) {
        var x = n.x * cy_ + n.z * sy, z = -n.x * sy + n.z * cy_;
        var y = n.y * cx_ - z * sx; z = n.y * sx + z * cx_;
        var k = 1 / (1.9 - z * .55);
        return { x: cx + x * R * k * 1.9, y: cy + y * R * k * 1.9, z: z, k: k, c: n.c };
      });

      ctx.lineWidth = 1;
      links.forEach(function (l, li) {
        var p = P[l[0]], q = P[l[1]], a = 0.05 + (p.z + q.z + 2) * 0.06;
        ctx.strokeStyle = 'rgba(' + COLORS.blue + ',' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        if (li % 5 === 0 && p.z + q.z > -0.4) {        // signal pulse travelling along a front-facing synapse
          var h = ((time / 1500) + li * 0.37) % 1;
          ctx.fillStyle = 'rgba(' + (li % 15 === 0 ? COLORS.saffron : COLORS.cyan) + ',' + (0.9 * Math.sin(h * Math.PI)).toFixed(2) + ')';
          ctx.beginPath(); ctx.arc(p.x + (q.x - p.x) * h, p.y + (q.y - p.y) * h, 1.6, 0, 6.283); ctx.fill();
        }
      });
      // data packets travelling from the core to a few nodes
      for (var i = 0; i < P.length; i += 7) {
        var ph = ((time / 1800) + i * .137) % 1, p2 = P[i];
        ctx.fillStyle = 'rgba(' + COLORS.cyan + ',' + (1 - ph).toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(cx + (p2.x - cx) * ph, cy + (p2.y - cy) * ph, 1.8, 0, 6.283); ctx.fill();
      }
      P.forEach(function (p, i) {
        var fire = Math.pow(0.5 + 0.5 * Math.sin(time / 900 + i * 1.7), 8);   // neurons "fire" on their own phase
        ctx.fillStyle = 'rgba(' + p.c + ',' + Math.min(1, 0.35 + (p.z + 1) * 0.32 + fire * 0.4).toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, (1.4 + p.k * 1.5) * (1 + fire * 0.8), 0, 6.283); ctx.fill();
      });
    }

    function frame(t) {
      if (!visible || document.hidden) { raf = 0; return; }
      rotY += 0.0035 + mouse.x * 0.002; rotX += (0.35 + mouse.y * 0.25 - rotX) * 0.03;
      render(t - t0);
      raf = requestAnimationFrame(frame);
    }

    function resize() { size = fitCanvas(canvas, 1.5); ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0); if (reduceMotion) render(0); }

    build(); resize(); render(0);
    if (reduceMotion) { window.addEventListener('resize', resize); return; }
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', function (e) {
      mouse.x = (e.clientX / window.innerWidth - .5) * 2; mouse.y = (e.clientY / window.innerHeight - .5) * 2;
    }, { passive: true });
    watchVisibility(canvas, function (v) { visible = v; if (v && !raf) raf = requestAnimationFrame(frame); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden && visible && !raf) raf = requestAnimationFrame(frame); });
  }

  /* ---------- Full tier: Three.js neural core --------------------------- */
  // Scene "AI network": glowing core, a shell of neurons that fire (shader points), synapses that carry
  // travelling signal pulses (shader lines), particles flowing core -> nodes, two orbit rings and a faint
  // floor grid. Colours come from the --rgb-* tokens; additive blending gives the glow without postprocessing.
  function initThree(container, canvas, onFail) {
    import(THREE_URL).then(function (THREE) {
      var renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
      } catch (e) { onFail(); return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));   // cap GPU cost
      renderer.setClearColor(0x000000, 0);

      var scene = new THREE.Scene();
      function col(rgb) { return new THREE.Color('rgb(' + rgb + ')'); }
      var C = { blue: col(COLORS.blue), cyan: col(COLORS.cyan), violet: col(COLORS.violet), saffron: col(COLORS.saffron) };
      var pr = Math.min(window.devicePixelRatio || 1, 1.5);
      var uTime = { value: 0 };
      var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
      camera.position.set(0, 0.3, 10);
      var root = new THREE.Group();            // mouse-parallax target
      var spin = new THREE.Group();            // slow auto-rotation
      root.add(spin); scene.add(root);

      // soft round sprite texture, drawn once on a tiny canvas
      function glowTexture(inner) {
        var c = document.createElement('canvas'); c.width = c.height = 64;
        var x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, inner); g.addColorStop(0.35, 'rgba(' + COLORS.blue + ',0.35)'); g.addColorStop(1, 'rgba(' + COLORS.blue + ',0)');
        x.fillStyle = g; x.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
      }

      // -- core: wireframe icosahedron + bright centre + additive halo
      var core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.95, 1),
        new THREE.MeshBasicMaterial({ color: C.cyan, wireframe: true, transparent: true, opacity: 0.5 }));
      var inner = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 24),
        new THREE.MeshBasicMaterial({ color: C.blue }));
      var halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('rgba(' + COLORS.cyan + ',0.95)'), blending: THREE.AdditiveBlending, depthWrite: false }));
      halo.scale.set(5.2, 5.2, 1);
      spin.add(core, inner, halo);

      // -- neurons on a jittered Fibonacci shell; each fires on its own phase
      var NODES = 110, nodePos = [], pos = new Float32Array(NODES * 3), ncol = new Float32Array(NODES * 3), nsize = new Float32Array(NODES), nphase = new Float32Array(NODES);
      var ga = Math.PI * (3 - Math.sqrt(5));
      for (var i = 0; i < NODES; i++) {
        var y = 1 - (i / (NODES - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i;
        var rad = 2.3 + Math.random() * 1.2;
        var v = new THREE.Vector3(Math.cos(th) * r * rad, y * rad, Math.sin(th) * r * rad);
        nodePos.push(v); v.toArray(pos, i * 3);
        (i % 13 === 0 ? C.saffron : i % 3 === 0 ? C.cyan : i % 5 === 0 ? C.violet : C.blue).toArray(ncol, i * 3);
        nsize[i] = 12 + Math.random() * 12; nphase[i] = Math.random() * 6.283;
      }
      var pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      pGeo.setAttribute('aColor', new THREE.BufferAttribute(ncol, 3));
      pGeo.setAttribute('aSize', new THREE.BufferAttribute(nsize, 1));
      pGeo.setAttribute('aPhase', new THREE.BufferAttribute(nphase, 1));
      spin.add(new THREE.Points(pGeo, new THREE.ShaderMaterial({
        uniforms: { uTime: uTime, uPr: { value: pr } },
        vertexShader: [
          'uniform float uTime; uniform float uPr;',
          'attribute vec3 aColor; attribute float aSize; attribute float aPhase;',
          'varying vec3 vColor; varying float vFire;',
          'void main() {',
          '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
          '  vFire = pow(0.5 + 0.5 * sin(uTime * 1.1 + aPhase), 8.0);',          // short, sharp "firing" spikes
          '  vColor = aColor;',
          '  gl_PointSize = aSize * (1.0 + vFire * 0.9) * uPr * (10.0 / -mv.z);',
          '  gl_Position = projectionMatrix * mv;',
          '}'].join('\n'),
        fragmentShader: [
          'varying vec3 vColor; varying float vFire;',
          'void main() {',
          '  float d = length(gl_PointCoord - 0.5);',
          '  float halo = smoothstep(0.5, 0.0, d);',
          '  float core = smoothstep(0.14, 0.0, d);',
          '  vec3 c = vColor * halo * (0.55 + vFire * 0.9) + vec3(1.0) * core * (0.5 + vFire * 0.5);',
          '  gl_FragColor = vec4(c, halo);',
          '}'].join('\n'),
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));

      // -- synapses between near neighbours, each carrying a travelling signal pulse
      var seg = [], segT = [], segSeed = [], segWarm = [];
      for (var a = 0; a < NODES; a++) for (var b = a + 1; b < NODES; b++) {
        if (nodePos[a].distanceToSquared(nodePos[b]) < 2.1) {
          seg.push(nodePos[a].x, nodePos[a].y, nodePos[a].z, nodePos[b].x, nodePos[b].y, nodePos[b].z);
          var sd = Math.random(), wm = Math.random() < 0.12 ? 1 : 0;
          segT.push(0, 1); segSeed.push(sd, sd); segWarm.push(wm, wm);
        }
      }
      var lGeo = new THREE.BufferGeometry();
      lGeo.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
      lGeo.setAttribute('aT', new THREE.Float32BufferAttribute(segT, 1));
      lGeo.setAttribute('aSeed', new THREE.Float32BufferAttribute(segSeed, 1));
      lGeo.setAttribute('aWarm', new THREE.Float32BufferAttribute(segWarm, 1));
      spin.add(new THREE.LineSegments(lGeo, new THREE.ShaderMaterial({
        uniforms: { uTime: uTime, uBase: { value: C.blue }, uSig: { value: C.cyan }, uWarm: { value: C.saffron } },
        vertexShader: [
          'attribute float aT; attribute float aSeed; attribute float aWarm;',
          'varying float vT; varying float vSeed; varying float vWarm;',
          'void main() { vT = aT; vSeed = aSeed; vWarm = aWarm; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'].join('\n'),
        fragmentShader: [
          'uniform float uTime; uniform vec3 uBase; uniform vec3 uSig; uniform vec3 uWarm;',
          'varying float vT; varying float vSeed; varying float vWarm;',
          'void main() {',
          '  float head = fract(uTime * (0.18 + vSeed * 0.22) + vSeed * 7.0);',   // where the pulse is on this synapse
          '  float pulse = smoothstep(0.16, 0.0, abs(vT - head)) * step(0.45, vSeed);',  // about half the synapses carry a signal
          '  vec3 sig = mix(uSig, uWarm, vWarm);',
          '  gl_FragColor = vec4(uBase * 0.34 + sig * pulse * 0.95, 0.3 + pulse * 0.7);',
          '}'].join('\n'),
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));

      // -- flowing data particles: each travels core -> a chosen node, then restarts
      var FLOW = 44, flow = [], fPos = new Float32Array(FLOW * 3);
      for (var f = 0; f < FLOW; f++) flow.push({ to: nodePos[(f * 7) % NODES], t: Math.random(), s: 0.25 + Math.random() * 0.35 });
      var fGeo = new THREE.BufferGeometry(); fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
      spin.add(new THREE.Points(fGeo, new THREE.PointsMaterial({ size: 0.12, color: C.cyan, map: glowTexture('rgba(255,255,255,1)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));

      // -- orbiting rings, each with a satellite
      var rings = [];
      [[3.7, 0.5, 0.2], [4.4, -0.7, 0.9]].forEach(function (cfg, k) {
        var g = new THREE.Group();
        g.add(new THREE.Mesh(new THREE.TorusGeometry(cfg[0], 0.008, 6, 120),
          new THREE.MeshBasicMaterial({ color: k === 1 ? C.violet : C.blue, transparent: true, opacity: 0.35 })));
        var sat = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), new THREE.MeshBasicMaterial({ color: k === 1 ? C.saffron : C.cyan }));
        g.add(sat); g.rotation.set(cfg[1], cfg[2], 0);
        spin.add(g); rings.push({ sat: sat, r: cfg[0], p: k * 2.1, s: 0.35 + k * 0.12 });
      });

      // -- subtle floor grid that drifts toward the camera
      var grid = new THREE.GridHelper(20, 28, C.blue, C.blue);
      grid.material.transparent = true; grid.material.opacity = 0.12; grid.position.y = -4.2;
      root.add(grid);

      // -- sizing (ResizeObserver keeps the hero correct at every breakpoint)
      function resize() {
        var r = container.getBoundingClientRect(); if (!r.width || !r.height) return;
        renderer.setSize(r.width, r.height, false);
        camera.aspect = r.width / r.height;
        camera.position.z = r.width / r.height < 0.9 ? 12.5 : 10.2;   // pull back on narrow boxes
        camera.updateProjectionMatrix();
      }
      resize();
      if ('ResizeObserver' in window) new ResizeObserver(resize).observe(container); else window.addEventListener('resize', resize);

      // -- mouse parallax (eased, tiny range)
      var mx = 0, my = 0, tx = 0, ty = 0;
      window.addEventListener('pointermove', function (e) {
        mx = (e.clientX / window.innerWidth - .5) * 2; my = (e.clientY / window.innerHeight - .5) * 2;
      }, { passive: true });

      var tmp = new THREE.Vector3(), clock = new THREE.Clock(), raf = 0, visible = true;

      function update(dt, elapsed) {
        uTime.value = elapsed;
        spin.rotation.y += dt * 0.12;
        tx += (mx * 0.35 - tx) * 0.04; ty += (my * 0.22 - ty) * 0.04;
        root.rotation.y = tx; root.rotation.x = ty;
        core.rotation.y -= dt * 0.3; core.rotation.x += dt * 0.15;
        var s = 1 + Math.sin(elapsed * 1.6) * 0.05; inner.scale.setScalar(s); halo.scale.setScalar(5.2 + Math.sin(elapsed * 1.6) * 0.3);
        rings.forEach(function (rg) { rg.p += dt * rg.s; rg.sat.position.set(Math.cos(rg.p) * rg.r, Math.sin(rg.p) * rg.r, 0); });
        for (var k = 0; k < FLOW; k++) {
          var fl = flow[k]; fl.t += dt * fl.s; if (fl.t > 1) fl.t = 0;
          tmp.copy(fl.to).multiplyScalar(fl.t).toArray(fPos, k * 3);
        }
        fGeo.attributes.position.needsUpdate = true;
        grid.position.z = (elapsed * 0.35) % (20 / 28 * 2);
      }

      function frame() {
        if (!visible || document.hidden) { raf = 0; return; }
        update(Math.min(clock.getDelta(), 0.05), clock.elapsedTime);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      }
      function wake() { if (!raf && visible && !document.hidden) { clock.getDelta(); raf = requestAnimationFrame(frame); } }

      watchVisibility(container, function (v) { visible = v; wake(); });
      document.addEventListener('visibilitychange', wake);
      canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); onFail(); });

      renderer.render(scene, camera);
      container.classList.add('is-3d');
      wake();
    }).catch(onFail);   // CDN blocked / offline -> lite hero
  }

  /* ---------- public: hero entry point ---------------------------------- */
  function initHero(container) {
    if (!container) return;
    var canvas = container.querySelector('canvas');
    var useFull = !reduceMotion && !isSmall && !lowEnd && webglAvailable();

    function lite() {
      // a canvas that has had a webgl context can't give a 2d one -> swap in a fresh element
      var fresh = document.createElement('canvas');
      fresh.setAttribute('aria-hidden', 'true');
      canvas.replaceWith(fresh); canvas = fresh;
      SphereNetwork(canvas);
    }

    // Three.js is fetched once the browser is idle so it never competes with the headline (LCP)
    var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 600); };
    if (useFull) idle(function () { initThree(container, canvas, lite); }, { timeout: 1500 }); else SphereNetwork(canvas);
  }

  window.NextGenFX = {
    initHero: initHero,
    ambient: function (canvas, opts) { if (canvas) AmbientNetwork(canvas, opts); },
    reduceMotion: reduceMotion,
    isSmall: isSmall
  };
})();
