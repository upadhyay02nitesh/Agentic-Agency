/* ==========================================================================
   NextGen AI Infotech — present.js
   Homepage "presentation": pinned day-in-the-life, one pinned slide per automation
   (problem → what we build → diagram draws → numbers count), a path that fills,
   slide dots + ← / → keys. Uses GSAP + ScrollTrigger (CDN).
   Presentation mode runs only on desktop (≥ 992px) with motion allowed; it adds
   html.pres. Everywhere else the page stays as static, readable cards and numbers
   simply count up once when they come into view.
   ========================================================================== */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var root = document.documentElement;
  var show = $('#showcase'); if (!show) return;
  var slides = $$('.sslide', show), dotsNav = $('.show-dots', show), dots = $$('[data-goto]', show), countEl = $('.show-count b', show);
  var slideTriggers = [], current = 0;

  /* ---- numbers: "~25", "+30%", "< 5 sec"; final text stays in the HTML for no-JS -------- */
  function setCount(el, v) { el.innerHTML = (el.getAttribute('data-pre') || '') + Math.round(v) + (el.getAttribute('data-suf') || ''); }
  function countUpOnce(el) {
    var to = +el.getAttribute('data-count'), t0 = 0, dur = 1100;
    if (reduce.matches || !to) return;
    setCount(el, 0);
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur); setCount(el, to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  function simpleCounters() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting && !root.classList.contains('pres')) { io.unobserve(e.target); countUpOnce(e.target); } });
    }, { threshold: .6 });
    $$('[data-count]').forEach(function (el) { io.observe(el); });
  }

  /* ---- slide indicator + keyboard ------------------------------------------------------ */
  function setCurrent(i) {
    current = i;
    dots.forEach(function (d, k) { if (k === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    if (countEl) countEl.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
  }
  function goTo(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    var st = slideTriggers[i], y;
    if (st) y = st.start + (st.end - st.start) * 0.92;               // land on the finished slide
    else y = slides[i].getBoundingClientRect().top + window.pageYOffset - 70;
    window.scrollTo({ top: y, behavior: reduce.matches ? 'auto' : 'smooth' });
    setCurrent(i);
  }
  function inShowcase() { var r = show.getBoundingClientRect(); return r.top < window.innerHeight * .5 && r.bottom > window.innerHeight * .5; }
  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.closest('[role="tablist"],.slider-track'))) return;
    if (!inShowcase()) return;
    e.preventDefault();
    var i = 0; slides.forEach(function (s, k) { if (s.getBoundingClientRect().top <= window.innerHeight * .5) i = k; });
    goTo(e.key === 'ArrowRight' ? i + 1 : i - 1);
  });
  dots.forEach(function (d) { d.addEventListener('click', function () { goTo(+d.getAttribute('data-goto')); }); });

  /* ---- presentation mode ---------------------------------------------------------------- */
  function present() {
    var gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    gsap.registerPlugin(ST);
    var mm = gsap.matchMedia();
    mm.add('(min-width: 992px) and (prefers-reduced-motion: no-preference)', function () {
      root.classList.add('pres');

      // 1. a day plays out: rows light up, clock turns, hours counter climbs
      var day = $('#day'), rows = $$('.day-row', day), total = $('.day-total [data-count]', day), tall = window.innerHeight >= 760;
      var dayTo = +total.getAttribute('data-count'), dayObj = { v: 0 };
      setCount(total, 0);
      var dtl = gsap.timeline({ scrollTrigger: tall
        ? { trigger: day, start: 'top top', end: '+=' + rows.length * 32 + '%', pin: $('.day-stage', day), scrub: .5, anticipatePin: 1 }
        : { trigger: day, start: 'top 70%', end: 'bottom 70%', scrub: .5 } });
      rows.forEach(function (r, i) {
        dtl.to(r, { opacity: 1, duration: .6 }, i)
           .from($('.day-cell--new', r), { x: 36, opacity: 0, duration: .6 }, i + .2);
      });
      dtl.to(dayObj, { v: dayTo, duration: rows.length, ease: 'none', onUpdate: function () { setCount(total, dayObj.v); } }, 0)
         .to($('.hand-h', day), { rotation: 330, svgOrigin: '32 32', duration: rows.length, ease: 'none' }, 0)
         .to($('.hand-m', day), { rotation: 360 * 11, svgOrigin: '32 32', duration: rows.length, ease: 'none' }, 0)
         .to({}, { duration: .6 });

      // 2. one pinned slide per automation, four beats
      slideTriggers = [];
      slides.forEach(function (s, i) {
        var nodes = $$('.fd-node', s), lines = $$('.fd-link path', s), stats = $$('.stat [data-count]', s);
        lines.forEach(function (p) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
        var tl = gsap.timeline({ scrollTrigger: {
          trigger: s, start: 'top top', end: '+=90%', pin: true, scrub: .5, anticipatePin: 1,
          onToggle: function (self) { if (self.isActive) setCurrent(i); } } });
        tl.from($('.beat-1', s), { y: 28, opacity: 0, duration: .5 })
          .from($('.beat-2', s), { y: 28, opacity: 0, duration: .5 }, '+=.1')
          .from($('.flow-fig', s), { opacity: 0, y: 20, duration: .4 }, '+=.1');
        nodes.forEach(function (n, k) {
          tl.from(n, { opacity: 0, scale: .6, duration: .3 }, k ? '>' : '>-0.1');
          if (lines[2 * k] && k < nodes.length - 1) tl.to([lines[2 * k], lines[2 * k + 1]], { strokeDashoffset: 0, duration: .3, ease: 'none' }, '>');
        });
        tl.from($('.beat-4', s), { y: 28, opacity: 0, duration: .5 }, '+=.1');
        stats.forEach(function (el) {
          var o = { v: 0 }, to = +el.getAttribute('data-count'); setCount(el, 0);
          tl.to(o, { v: to, duration: .7, ease: 'power2.out', onUpdate: function () { setCount(el, o.v); } }, '<');
        });
        tl.to({}, { duration: .5 });
        slideTriggers.push(tl.scrollTrigger);
      });
      var dotsST = ST.create({ trigger: $('.show-track', show), start: 'top 60%', end: 'bottom 40%', onToggle: function (self) { dotsNav.classList.toggle('on', self.isActive); } });

      // 3. how we work: the path fills, steps switch on
      var hw = $('.hw'), hwSteps = $$('.hw-step', hw);
      hw.style.setProperty('--hw', 0);
      var hwST = ST.create({ trigger: hw, start: 'top 75%', end: 'bottom 55%', scrub: .4, onUpdate: function (self) {
        hw.style.setProperty('--hw', self.progress.toFixed(3));
        hwSteps.forEach(function (st, k) { st.classList.toggle('on', self.progress >= k / (hwSteps.length - 1) * .96); });
      } });

      return function () {                                  // leaving desktop / motion turned off: back to static
        root.classList.remove('pres'); dotsST.kill(); hwST.kill(); slideTriggers = [];
        hw.style.removeProperty('--hw'); hwSteps.forEach(function (st) { st.classList.remove('on'); });
        $$('[data-count]').forEach(function (el) { setCount(el, +el.getAttribute('data-count')); });
      };
    });
  }

  setCurrent(0);
  simpleCounters();
  // Build on the first scroll / key / touch so page load stays light (the page looks the same until then).
  // Deep links (#contact) or a reload part-way down build at once and re-align to the target.
  var started = false, evs = ['scroll', 'wheel', 'keydown', 'pointerdown', 'touchstart'];
  function start() {
    if (started) return; started = true;
    evs.forEach(function (e) { window.removeEventListener(e, start, { passive: true }); });
    // Building the pins adds height above anything below them and GSAP may reset the scroll on refresh, so remember
    // what the visitor was looking at (an anchor, or the element at the top of the screen) and put them back there.
    var tgt = location.hash && document.getElementById(location.hash.slice(1)), ref = null, refTop = 0;
    if (!tgt && window.pageYOffset > 2) {
      ref = document.elementFromPoint(window.innerWidth / 2, 90);
      while (ref && ref.parentElement && ref.parentElement !== document.body && !/^(SECTION|ARTICLE|LI)$/.test(ref.tagName)) ref = ref.parentElement;
      if (ref) refTop = ref.getBoundingClientRect().top;
    }
    function restore() {
      if (tgt) tgt.scrollIntoView();
      else if (ref) window.scrollBy(0, ref.getBoundingClientRect().top - refTop);
    }
    present();
    restore();
    if (window.ScrollTrigger && (tgt || ref)) {
      var once = function () { window.ScrollTrigger.removeEventListener('refresh', once); restore(); };
      window.ScrollTrigger.addEventListener('refresh', once);
      setTimeout(restore, 120);
    }
  }
  function arm() {
    if (window.pageYOffset > 40 || location.hash) { start(); return; }
    evs.forEach(function (e) { window.addEventListener(e, start, { passive: true }); });
  }
  if (document.readyState === 'complete') arm(); else window.addEventListener('load', arm);
})();
