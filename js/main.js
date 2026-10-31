/* ==========================================================================
   NextGen AI Labs — main.js
   UI behaviour: config → page, navbar + mobile menu, scroll reveal, text split,
   card tilt, magnetic buttons, hero scroll transition, portfolio filter,
   FAQ accordion, pricing toggle, contact form.
   Heavy visuals (Three.js / canvas) live in effects.js.
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     SITE CONFIG — fill these in. Everything on the site reads from here.
     Leave a value empty and the matching row / button is simply hidden
     (WhatsApp buttons fall back to the contact page).
     ====================================================================== */
  var CONFIG = {
    whatsappNumber: '919200968689',                // digits only with country code, e.g. '919876543210'
    whatsappMessage: 'Hi, I want a website for my business',
    phone: '',                                     // e.g. '+1 415 555 0134'. Empty = Call buttons stay hidden
    email: 'sales@nextgenailabs.com',       // public contact email shown on the site
    // How the contact form delivers: 'mailto' = opens the visitor's email app with the enquiry ready to send (default),
    // 'service' = sends silently through FormSubmit, 'both' = does both.
    submitMethod: 'service',                       // sends silently to formEmail via FormSubmit (first ever submission: click the activation link FormSubmit emails you)
    formEmail: 'sales@nextgenailabs.com',   // inbox that receives form enquiries (via FormSubmit). Not shown on the page.                         
    city: '',                            // e.g. 'Bengaluru'
    address: 'Remote · serving clients worldwide',  // office address, or how you work
    delivery: '1 month 15 days',               // typical delivery time
    social: { linkedin: '', instagram: '', github: '' },
    // International clients: booking link (Calendly, Cal.com, Google Calendar). Empty = "Book a call" buttons stay hidden.
    bookingUrl: '',
    responseTime: 'within one business day',      // shown in "Built for international clients". Make sure you can keep it.
    // Founder / lead engineer card (home + about). Hidden until name is set. Use only real details.
    founder: { name: '', role: 'Founder & GenAI engineer', bio: '', photo: '', linkedin: '', github: '' },
    // AI packages (home + pricing + industry pages). SAMPLE PRICES in USD: set your real ones.
    packages: {
      lite:     { setup: 149,  monthly: 29 },     // AI Starter: simple website FAQ assistant for small budgets
      chat:     { setup: 499, monthly: 49 },
      voice:    { setup: 899, monthly: 149 },
      followup: { setup: 699, monthly: 79 },
      growth:   { setup: 1499, monthly: 169 },
      email:    { setup: 349,  monthly: 39 }     // AI Email Assistant add-on
    },
    // Proof section on the homepage. Stays hidden until you add REAL entries. Never invent these.
    // results:      [{ value: '32 h', label: 'saved per week at a 6-person clinic' }]
    // testimonials: [{ quote: '…', name: 'Jane Doe', role: 'Owner', company: 'Smile Dental' }]   (with permission)
    // logos:        [{ src: 'assets/images/clients/acme.svg', alt: 'Acme Co.' }]               (with permission)
    proof: { results: [], testimonials: [], logos: [], cases: [] },   // cases: verified projects only, shown on the homepage. Example shape:
    // { client: 'Real client name', industry: 'Dental clinic', image: 'assets/images/case.webp', imageAlt: 'Screenshot of the booking assistant', problem: '…', solution: '…', outcome: 'Verified result', url: 'https://…' }

    // All prices on the site are in this currency. Change symbol/locale here only.
    currency: { symbol: '$', code: 'USD', locale: 'en-US' },
    // Package prices in USD (numbers). SAMPLE VALUES: replace with your real prices.
    pricing: {
      starter:  { once: 399,  yearly: 99 },
      business: { once: 999,  yearly: 199 },
      custom:   { from: 2499 }
    },
    // "Starting at $___" on service cards. Leave '' to hide the line.
    startingAt: { websites: '', ecommerce: '', landing: '', webapps: '', mobile: '', seo: '', whatsapp: '', maintenance: '' },

    // Project estimator (index.html#estimate, pricing.html). SAMPLE ranges in USD and weeks: tune to your real rates.
    usdRate: 0,                                    // legacy INR→USD helper line; 0 keeps it hidden (prices are already USD)
    estimator: {
      types: {
        website:    { label: 'Business website',           min: 400,  max: 1500,   wk: [3, 6] },
        ecommerce:  { label: 'E-commerce store',           min: 1000,  max: 4000,  wk: [5, 10] },
        webapp:     { label: 'Web app / dashboard',        min: 2500, max: 12000,  wk: [8, 16] },
        mobile:     { label: 'Mobile app',                 min: 3000, max: 15000,  wk: [10, 20] },
        ai:         { label: 'AI agent / automation',      min: 500,  max: 5000,  wk: [3, 10] },
        platform:   { label: 'Enterprise platform / SaaS', min: 10000, max: 50000, wk: [16, 40] }
      },
      features: {
        crm:      { label: 'CRM integration',              min: 300, max: 1500, wk: 2 },
        erp:      { label: 'ERP / accounting (QuickBooks, Xero)', min: 500, max: 2500, wk: 3 },
        payments: { label: 'Payments (Stripe, PayPal)',    min: 150, max: 600,  wk: 1 },
        wa:       { label: 'WhatsApp Business API',        min: 200, max: 800,  wk: 1 },
        bot:      { label: 'AI chatbot / assistant',       min: 300, max: 2500, wk: 3 },
        rag:      { label: 'AI on your documents',         min: 800, max: 5000, wk: 4 },
        auth:     { label: 'User accounts & roles',        min: 300, max: 1500, wk: 2 },
        admin:    { label: 'Admin panel & reports',        min: 500, max: 2000, wk: 3 },
        lang:     { label: 'Multi-language',               min: 150, max: 700,  wk: 1 },
        motion:   { label: '3D / premium animation',       min: 300, max: 1800, wk: 2 }
      },
      scale: {
        standard:   { label: 'Standard',   mult: 1,   team: '1 project lead, 1–2 developers, 1 designer' },
        growth:     { label: 'Growth',     mult: 1.6, team: '1 project manager, 3–4 developers, 1 designer, 1 QA' },
        enterprise: { label: 'Enterprise', mult: 2.6, team: 'Delivery manager, solution architect, 5–8 engineers, designer, QA, DevOps' }
      }
    }
  };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---- Money formatting in CONFIG.currency: 3900 -> "$3,900" --------------- */
  function formatMoney(n) {
    var c = CONFIG.currency;
    return c.symbol + Math.round(n).toLocaleString(c.locale);
  }

  /* ---- Config → page ----------------------------------------------------- */
  function waLink(msg) {
    return 'https://wa.me/' + (CONFIG.whatsappNumber || '') + '?text=' + encodeURIComponent(msg || CONFIG.whatsappMessage);
  }

  function applyConfig() {
    // WhatsApp links (optional per-link message in data-wa-msg)
    $$('[data-whatsapp]').forEach(function (a) {
      if (!CONFIG.whatsappNumber) return;                 // keep default href (contact page)
      a.href = waLink(a.getAttribute('data-wa-msg'));
      a.target = '_blank'; a.rel = 'noopener';
    });
    // Call links
    $$('[data-call]').forEach(function (a) {
      var digits = (CONFIG.phone || '').replace(/[^\d+]/g, '');
      if (digits) a.href = 'tel:' + digits;
      else if (!a.hasAttribute('data-cfg')) a.hidden = true;     // no phone yet: hide Call buttons
    });
    $$('[data-needs-phone]').forEach(function (el) { if (!CONFIG.phone) el.hidden = true; });
    // Social icons
    $$('[data-social]').forEach(function (a) {
      var url = CONFIG.social[a.getAttribute('data-social')];
      if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; } else a.hidden = true;
    });
    $$('.social').forEach(function (box) {              // no social links set: hide the whole block
      if (!$$('a:not([hidden])', box).length) { box.hidden = true; var h = box.previousElementSibling; if (h && h.tagName === 'H2') h.hidden = true; }
    });
    // Text values: data-cfg="city" (falls back to the element's data-ph placeholder)
    $$('[data-cfg]').forEach(function (el) {
      var v = CONFIG[el.getAttribute('data-cfg')];
      if (v) { el.textContent = v; el.classList.remove('ph'); if (el.tagName === 'A' && el.getAttribute('data-cfg') === 'email') el.href = 'mailto:' + v; }
      else if (!el.hasAttribute('data-keep')) { var row = el.closest('li'); (row || el).hidden = true; }   // empty value: hide the whole row
    });
    // "Starting at" prices on service cards
    $$('[data-start]').forEach(function (el) {
      var v = CONFIG.startingAt[el.getAttribute('data-start')];
      if (v) el.textContent = formatMoney(v); else { var box = el.closest('.start-price'); (box || el).hidden = true; }   // hide until a price is set
    });
    // Package prices: data-price="starter.once"
    $$('[data-price]').forEach(function (el) {
      var p = el.getAttribute('data-price').split('.'), v = CONFIG.pricing[p[0]] && CONFIG.pricing[p[0]][p[1]];
      el.textContent = v ? formatMoney(v) : CONFIG.currency.symbol + '___';
    });
    // Hero affordability line: rendered in the HTML (no layout shift) and refreshed from CONFIG so it matches the pricing page
    var hp = $('[data-hero-price]'), st = CONFIG.pricing.starter && CONFIG.pricing.starter.once, ai = CONFIG.estimator && CONFIG.estimator.types.ai;
    if (hp && st) {
      hp.innerHTML = '<span>Fixed, affordable quotes:</span><span class="pchip">Websites from <b>' + formatMoney(st) + '</b></span>' +
        (ai ? '<span class="pchip">AI automation from <b>' + formatMoney(ai.min) + '</b></span>' : '');
      hp.hidden = false;
    }
    // AI package prices: data-pkg="voice.setup"
    $$('[data-pkg]').forEach(function (el) {
      var p = el.getAttribute('data-pkg').split('.'), v = CONFIG.packages && CONFIG.packages[p[0]] && CONFIG.packages[p[0]][p[1]];
      if (v) el.textContent = formatMoney(v);
    });
    // Book-a-call buttons
    $$('[data-booking]').forEach(function (b) { if (CONFIG.bookingUrl) { b.href = CONFIG.bookingUrl; b.target = '_blank'; b.rel = 'noopener'; b.hidden = false; } });
    $$('[data-booking-row]').forEach(function (r) { r.hidden = !CONFIG.bookingUrl; });
    $$('[data-booking-fallback]').forEach(function (b) { b.hidden = !!CONFIG.bookingUrl; });
    // Founder card: only shown once a real name is configured
    var F = CONFIG.founder || {};
    $$('[data-founder]').forEach(function (box) {
      if (!F.name) { box.hidden = true; return; }
      box.hidden = false;
      $('[data-founder-name]', box).textContent = F.name;
      $('[data-founder-role]', box).textContent = F.role || '';
      $('[data-founder-bio]', box).textContent = F.bio || '';
      var img = $('[data-founder-photo]', box); if (F.photo) { img.src = F.photo; img.alt = F.name; }
      $$('[data-founder-link]', box).forEach(function (l) { var u = F[l.getAttribute('data-founder-link')]; if (u) { l.href = u; l.hidden = false; } });
    });
    var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  }

  /* ---- Navbar + full-screen mobile menu ------------------------------------ */
  function initNav() {
    var nav = $('.nx-nav'); if (!nav) return;
    var menu = $('#navMenu'), toggler = $('.nx-toggler');
    var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 24); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    if (!(menu && toggler && window.bootstrap)) return;

    var col = new bootstrap.Collapse(menu, { toggle: false });
    toggler.addEventListener('click', function () { col.toggle(); });
    menu.addEventListener('show.bs.collapse', function () { nav.classList.add('menu-open'); document.body.classList.add('menu-locked'); toggler.setAttribute('aria-expanded', 'true'); });
    menu.addEventListener('hide.bs.collapse', function () { nav.classList.remove('menu-open'); document.body.classList.remove('menu-locked'); toggler.setAttribute('aria-expanded', 'false'); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { if (menu.classList.contains('show')) col.hide(); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('show')) { col.hide(); toggler.focus(); } });
    // if the viewport grows past the mobile breakpoint, make sure the lock is released
    window.matchMedia('(min-width: 992px)').addEventListener('change', function (m) { if (m.matches) { document.body.classList.remove('menu-locked'); nav.classList.remove('menu-open'); } });
  }

  /* ---- Scroll reveal ------------------------------------------------------ */
  function initReveal() {
    var targets = $$('.reveal, .timeline, [data-split]');
    if (!('IntersectionObserver' in window) || reduceMotion) { targets.forEach(function (t) { t.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (t) { io.observe(t); });
  }

  // Wraps each word of [data-split] in a masked span for a line-rise reveal.
  function initSplitText() {
    $$('[data-split]').forEach(function (el) {
      var w = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
              var o = document.createElement('span'), i = document.createElement('span');
              o.className = 'split-word'; o.style.setProperty('--w', w++); i.textContent = part; o.appendChild(i); frag.appendChild(o);
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1) walk(n);
        });
      })(el);
      el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
      $$('.split-word', el).forEach(function (s) { s.setAttribute('aria-hidden', 'true'); });
    });
    var intro = $('.intro'), wait = (intro && !document.documentElement.classList.contains('no-intro') && !reduceMotion) ? 1300 : 0;
    setTimeout(function () { $$('[data-split].hero-split').forEach(function (h) { h.classList.add('split-ready'); }); }, wait);
  }

  /* ---- Card tilt + cursor spotlight (fine pointers only) ------------------- */
  function initCards() {
    if (!canHover) return;
    $$('.card-nx').forEach(function (card) {
      var raf = 0;
      card.addEventListener('pointermove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          var r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
          card.style.setProperty('--mx', x + 'px'); card.style.setProperty('--my', y + 'px');
          if (reduceMotion || card.hasAttribute('data-no-tilt')) return;
          var rx = ((y / r.height) - .5) * -6, ry = ((x / r.width) - .5) * 6;   // max ~3deg: subtle
          card.classList.add('is-tilting');
          card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
        });
      });
      card.addEventListener('pointerleave', function () { card.classList.remove('is-tilting'); card.style.transform = ''; });
    });
  }

  /* ---- Magnetic primary buttons -------------------------------------------- */
  function initMagnetic() {
    if (!canHover || reduceMotion) return;
    $$('.btn-nx--primary, .btn-nx--saffron').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.setProperty('--bx', (((e.clientX - r.left) / r.width - .5) * 10).toFixed(1) + 'px');
        btn.style.setProperty('--by', (((e.clientY - r.top) / r.height - .5) * 8).toFixed(1) + 'px');
      });
      btn.addEventListener('pointerleave', function () { btn.style.setProperty('--bx', '0px'); btn.style.setProperty('--by', '0px'); });
    });
  }

  /* ---- Cursor glow --------------------------------------------------------- */
  function initCursorGlow() {
    if (!canHover || reduceMotion) return;
    var g = document.createElement('div'); g.className = 'cursor-glow'; g.setAttribute('aria-hidden', 'true'); document.body.appendChild(g);
    var x = 0, y = 0, raf = 0;
    window.addEventListener('pointermove', function (e) {
      x = e.clientX; y = e.clientY; g.classList.add('on');
      if (!raf) raf = requestAnimationFrame(function () { raf = 0; g.style.transform = 'translate(' + x + 'px,' + y + 'px)'; });
    }, { passive: true });
    document.addEventListener('pointerleave', function () { g.classList.remove('on'); });
  }

  /* ---- Hero: mockup parallax + scroll-out transition ------------------------
     Mockups follow the pointer a few pixels. On scroll the visual drifts back
     (scale / translate / fade) while a cyan light bridge brightens at the hero's
     lower edge. One rAF-throttled listener, active only while the hero is visible. */
  function initHero() {
    var hero = $('.hero'); if (!hero || reduceMotion) return;
    var visual = $('.hero-visual', hero), text = $('.hero-text', hero), bridge = $('.light-bridge', hero), mock = $('.mockups', hero);
    if (mock && canHover) {
      window.addEventListener('pointermove', function (e) {
        mock.style.setProperty('--px', ((e.clientX / window.innerWidth - .5) * 2).toFixed(3));
        mock.style.setProperty('--py', ((e.clientY / window.innerHeight - .5) * 2).toFixed(3));
      }, { passive: true });
    }
    if (canHover) {                                   // cursor "flashlight": the grid lights up around the pointer
      var lit = 0;
      hero.addEventListener('pointermove', function (e) {
        if (lit) return;
        lit = requestAnimationFrame(function () {
          lit = 0; var r = hero.getBoundingClientRect();
          hero.style.setProperty('--hx', (e.clientX - r.left) + 'px'); hero.style.setProperty('--hy', (e.clientY - r.top) + 'px'); hero.classList.add('is-lit');
        });
      });
      hero.addEventListener('pointerleave', function () { hero.classList.remove('is-lit'); });
    }
    var ticking = false, inView = true, big = window.matchMedia('(min-width: 992px)');
    function update() {
      ticking = false;
      var p = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * 0.75)));
      if (visual) {
        visual.style.transform = (big.matches ? 'translateY(calc(-50% + ' + (p * 70) + 'px)) ' : 'translateY(' + (p * 40) + 'px) ') + 'scale(' + (1 - p * 0.22).toFixed(3) + ')';
        visual.style.opacity = (1 - p * 1.05).toFixed(3);
      }
      if (text) { text.style.transform = 'translateY(' + (p * -26).toFixed(1) + 'px)'; text.style.opacity = (1 - p * 0.9).toFixed(3); }
      if (bridge) bridge.style.setProperty('--p', p.toFixed(3));
    }
    new IntersectionObserver(function (en) { inView = en[0].isIntersecting; }).observe(hero);
    window.addEventListener('scroll', function () { if (inView && !ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---- Portfolio filter ---------------------------------------------------- */
  function initFilters() {
    var bar = $('.filters'); if (!bar) return;
    var btns = $$('.filter-btn', bar), items = $$('.work-item');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-filter');
        btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        items.forEach(function (it) { it.classList.add('is-fading'); });
        setTimeout(function () {
          items.forEach(function (it) { it.classList.toggle('is-hidden', f !== 'all' && it.getAttribute('data-cat') !== f); });
          requestAnimationFrame(function () { items.forEach(function (it) { it.classList.remove('is-fading'); }); });
        }, reduceMotion ? 0 : 220);
      });
    });
  }

  /* ---- FAQ accordion ------------------------------------------------------- */
  function initFaq() {
    var qs = $$('.faq-q');
    qs.forEach(function (q) {
      q.addEventListener('click', function () {
        var open = q.getAttribute('aria-expanded') === 'true';
        qs.forEach(function (o) { o.setAttribute('aria-expanded', 'false'); o.closest('.faq-item').classList.remove('is-open'); });
        q.setAttribute('aria-expanded', open ? 'false' : 'true');
        q.closest('.faq-item').classList.toggle('is-open', !open);
      });
    });
    if (qs[0]) { qs[0].setAttribute('aria-expanded', 'true'); qs[0].closest('.faq-item').classList.add('is-open'); }   // first answer open by default
  }

  /* ---- Pricing toggle: one-time vs with yearly maintenance ------------------ */
  function initPricing() {
    var sw = $('#maintToggle'); if (!sw) return;
    var once = $('#lblOnce'), yearly = $('#lblYearly');
    function render() {
      var on = sw.getAttribute('aria-checked') === 'true';
      once.classList.toggle('on', !on); yearly.classList.toggle('on', on);
      $$('.price-sub[data-plan]').forEach(function (el) {
        var plan = CONFIG.pricing[el.getAttribute('data-plan')];
        if (!on) el.textContent = el.getAttribute('data-once');
        else el.textContent = plan && plan.yearly ? '+ ' + formatMoney(plan.yearly) + ' / year · hosting, SSL, updates & support' : 'Maintenance plan quoted per project';
      });
    }
    sw.addEventListener('click', function () { sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') === 'true' ? 'false' : 'true'); render(); });
    render();
  }

  /* ---- Contact form -------------------------------------------------------- */
  var VALIDATORS = {
    name: function (v) { return v.trim().length >= 2 || 'Please enter your full name.'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter a valid email address, e.g. name@company.com.'; },
    // international numbers: optional +, 7–15 digits once spaces, dashes and brackets are removed
    phone: function (v) { return /^\+?\d{7,15}$/.test(v.replace(/[\s\-().]/g, '')) || 'Enter a valid phone number with country code, e.g. +1 415 555 0134.'; },
    service: function (v) { return !!v || 'Please choose the service you need.'; },
    message: function (v) { return v.trim().length >= 10 || 'Tell us a little more (at least 10 characters).'; }
  };

  // One summary for every delivery route (email app, FormSubmit, WhatsApp) so nothing is lost between them.
  function enquiryLines(d, msg) {
    return ['Name: ' + d.name, 'Email: ' + d.email, 'Phone / WhatsApp: ' + d.phone, 'Company: ' + (d.company || '-'),
            'Service: ' + d.service, 'Budget: ' + (d.budget || '-'), '', 'Project:', msg || d.message, '', 'Sent from: ' + location.href];
  }
  function enquiryWa(d, msg) {
    return 'Hi, I am ' + d.name + (d.company ? ' from ' + d.company : '') + '. Service: ' + d.service + (d.budget ? '. Budget: ' + d.budget : '') + '. ' + (msg || d.message);
  }

  /* Delivers the enquiry to CONFIG.formEmail using FormSubmit (https://formsubmit.co).
     First ever submission: FormSubmit emails that inbox an activation link; click it once.
     To use another service (Formspree, EmailJS, your own API), replace the body of this function. */
  function submitInquiry(data) {
    if (data._honey) return Promise.resolve({ ok: true });            // spam bot filled the hidden field: pretend success
    if (!CONFIG.formEmail) return Promise.reject(new Error('No formEmail configured'));
    return fetch('https://formsubmit.co/ajax/' + encodeURIComponent(CONFIG.formEmail), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: 'New enquiry from ' + data.name + (data.company ? ' (' + data.company + ')' : '') + ': ' + data.service,
        _template: 'table', _captcha: 'false',
        _replyto: data.email, email: data.email,
        // automatic confirmation email to the customer (FormSubmit sends it to the "email" field)
        _autoresponse: 'Hi ' + data.name.split(' ')[0] + ', thanks for contacting NextGen AI Labs! We have received your enquiry about "' + data.service + '" and will reply within one business day with questions or a suggested plan. If it is urgent, reply to this email or message us on WhatsApp. — NextGen AI Labs · sales@nextgenailabs.com · www.nextgenailabs.com',
        Name: data.name, Email: data.email, Phone: data.phone, Company: data.company || '-', Service: data.service, Budget: data.budget || '-', Project: data.message, Page: location.href
      })
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!(j && (j.success === true || j.success === 'true'))) throw new Error((j && j.message) || 'Send failed');
      return j;
    });
  }

  /* Opens the visitor's email app with the enquiry pre-filled and addressed to us.
     Also shows fallbacks (Gmail in the browser, WhatsApp) in case no email app is set up. */
  function openEmailApp(data, status, form) {
    var to = CONFIG.formEmail || CONFIG.email;
    var subject = 'New website enquiry from ' + data.name;
    // mailto: links over ~2,000 characters fail silently in many email apps (Outlook on Windows), so long messages are shortened here
    var msg = data.message;
    while (encodeURIComponent(msg).length > 1000 && msg.length > 40) msg = msg.slice(0, Math.floor(msg.length * 0.85));
    if (msg !== data.message) msg += '… (message shortened, full text to follow)';
    var lines = enquiryLines(data, msg);
    var mailto = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\r\n'));
    var gmail = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(to) + '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\r\n'));
    var wa = waLink(enquiryWa(data, msg));
    status.className = 'form-status show ok';
    status.innerHTML = '<strong>Almost done!</strong> Your email app should open with your enquiry ready. Just press <strong>Send</strong>.<br>If nothing opened, use one of these:<br>' +
      '<span class="status-actions"><a class="btn-nx btn-nx--primary btn-nx--sm" href="' + mailto + '"><i class="bi bi-envelope" aria-hidden="true"></i> Open email app</a> ' +
      '<a class="btn-nx btn-nx--ghost btn-nx--sm" href="' + gmail + '" target="_blank" rel="noopener"><i class="bi bi-google" aria-hidden="true"></i> Open in Gmail</a> ' +
      '<a class="btn-nx btn-nx--ghost btn-nx--sm" href="' + wa + '" target="_blank" rel="noopener"><i class="bi bi-whatsapp" aria-hidden="true"></i> Send on WhatsApp</a></span>';
    status.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    window.location.href = mailto;                    // hands over to the device's email app
  }

  /* ---- Small celebratory burst for a successful enquiry (transform/opacity only, removes itself) ---- */
  function confetti(host) {
    var box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
    var cols = ['#ff29d0', '#7b2fff', '#4ade80', '#ffffff', '#ff8ee8'];
    for (var i = 0; i < 28; i++) {
      var p = document.createElement('i'), a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 120;
      p.style.setProperty('--x', (Math.cos(a) * d).toFixed(0) + 'px'); p.style.setProperty('--y', (Math.sin(a) * d - 40).toFixed(0) + 'px');
      p.style.setProperty('--r', (Math.random() * 540 - 270).toFixed(0) + 'deg'); p.style.background = cols[i % cols.length]; p.style.animationDelay = (Math.random() * 0.12).toFixed(2) + 's';
      box.appendChild(p);
    }
    host.appendChild(box); setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 1600);
  }

  function initForm() {
    var form = $('#inquiryForm'); if (!form) return;
    var status = $('#formStatus'), btn = $('button[type="submit"]', form);

    // Prefill message from ?service=… (links from service cards / pricing)
    var svc = new URLSearchParams(location.search).get('service');
    if (svc && form.elements.message && !form.elements.message.value) form.elements.message.value = 'I am interested in: ' + svc + '. ';
    if (svc && form.elements.service) {
      var want = svc.toLowerCase();
      $$('option', form.elements.service).forEach(function (o) { if (o.value && (want.indexOf(o.value.toLowerCase()) > -1 || o.value.toLowerCase().indexOf(want) > -1)) form.elements.service.value = o.value; });
    }

    function check(field) {
      var fn = VALIDATORS[field.name]; if (!fn) return true;
      var res = fn(field.value), ok = res === true, err = $('#' + field.id + '-error');
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (err) { err.classList.toggle('show', !ok); if (!ok) err.querySelector('span').textContent = res; }
      return ok;
    }
    $$('.input-nx', form).forEach(function (f) {
      f.addEventListener('blur', function () { if (VALIDATORS[f.name]) check(f); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true') check(f); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'form-status'; status.textContent = '';
      var firstBad = null;
      $$('.input-nx', form).forEach(function (f) { if (!check(f) && !firstBad) firstBad = f; });
      if (firstBad) { firstBad.focus(); return; }

      var data = {}; new FormData(form).forEach(function (v, k) { data[k] = v; });
      data.phone = data.phone.trim(); data.email = data.email.trim();
      if (btn.disabled) return;                       // a send is already in flight: ignore double clicks
      var method = CONFIG.submitMethod || 'mailto';
      if (method !== 'service') { openEmailApp(data, status, form); if (method === 'both') submitInquiry(data).catch(function () {}); return; }
      btn.disabled = true; btn.setAttribute('aria-busy', 'true'); var label = btn.innerHTML; btn.innerHTML = '<span class="spin" aria-hidden="true"></span> Sending…';
      submitInquiry(data).then(function () {
        // real success only: animated confirmation card with next steps (replaces the form)
        var first = esc(data.name.split(' ')[0]), wrap = form.parentNode, card = document.createElement('div');
        card.className = 'sent-card'; card.setAttribute('role', 'status'); card.setAttribute('tabindex', '-1');
        card.innerHTML = '<svg class="sent-check" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27 l7 7 l15 -16"/></svg>' +
          '<h3>Thanks, ' + first + '! Your enquiry is in.</h3><p>We have sent a confirmation to <b>' + esc(data.email) + '</b>. Here is what happens next:</p>' +
          '<ol class="sent-steps"><li><i class="bi bi-envelope-check" aria-hidden="true"></i><span><b>Within one business day</b> we reply with questions or a suggested plan.</span></li>' +
          '<li><i class="bi bi-camera-video" aria-hidden="true"></i><span><b>Free 30-minute call</b> at a time that suits your time zone.</span></li>' +
          '<li><i class="bi bi-file-earmark-check" aria-hidden="true"></i><span><b>Written plan and fixed price</b> before any work starts.</span></li></ol>' +
          '<div class="sent-actions"><a class="btn-nx btn-nx--primary btn-nx--sm" href="' + waLink(enquiryWa(data)) + '" target="_blank" rel="noopener"><i class="bi bi-whatsapp" aria-hidden="true"></i> Continue on WhatsApp</a>' +
          '<a class="btn-text" href="mailto:' + (CONFIG.email || CONFIG.formEmail) + '">Email ' + esc(CONFIG.email || CONFIG.formEmail) + '</a></div>';
        Array.prototype.slice.call(wrap.children).forEach(function (el) { if (el.tagName === 'P' || (el.classList && el.classList.contains('cta-book'))) el.hidden = true; });
        form.hidden = true; wrap.insertBefore(card, form); status.className = 'form-status'; status.textContent = '';
        card.focus({ preventScroll: true }); card.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
        if (!reduceMotion) confetti(card);
      }).catch(function (err) {
        // Never lose a lead: if the silent send fails (e.g. FormSubmit not activated yet, or offline),
        // hand the enquiry to the visitor's email app, ready to send, with Gmail / WhatsApp as backups.
        if (window.console) console.warn('Enquiry email failed, falling back to email app:', err && err.message);   // owner hint, e.g. 'needs Activation'
        openEmailApp(data, status, form);
      }).then(function () { btn.disabled = false; btn.removeAttribute('aria-busy'); btn.innerHTML = label; });
    });
  }

  /* ---- Scroll progress bar (top of page) ----------------------------------- */
  function initProgress() {
    var bar = $('.scroll-progress'); if (!bar) return;
    var ticking = false;
    function update() {
      ticking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--sp', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update); update();
  }

  /* ---- "How it works": highlight the step at mid-screen, fill the progress line --- */
  function initSteps() {
    var list = $('.steps'); if (!list) return;
    var steps = $$('.step', list), ticking = false;
    function update() {
      ticking = false;
      var mid = window.innerHeight * 0.5, active = -1;
      steps.forEach(function (st, i) { if (st.getBoundingClientRect().top < mid + 40) active = i; });
      steps.forEach(function (st, i) { st.classList.toggle('is-active', i === active); st.classList.toggle('is-done', i < active); });
      var r = list.getBoundingClientRect();
      list.style.setProperty('--prog', Math.min(1, Math.max(0, (mid - r.top) / r.height)).toFixed(3));
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update); update();
  }

  /* ---- Cursor ring: eased follower that grows over links and buttons --------- */
  function initCursorRing() {
    if (!canHover || reduceMotion) return;
    var ring = document.createElement('div'); ring.className = 'cursor-ring'; ring.setAttribute('aria-hidden', 'true'); document.body.appendChild(ring);
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    function loop() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      ring.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)';
      raf = (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.4) ? requestAnimationFrame(loop) : 0;   // stop when settled
    }
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY; ring.classList.add('on');
      ring.classList.toggle('grow', !!e.target.closest('a, button, select, input, textarea, label, [role="switch"]'));
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.addEventListener('pointerleave', function () { ring.classList.remove('on'); });
  }

  /* ---- Pinned scroll story: scroll position picks the laptop screen ---------- */
  function initShowcase() {
    var sec = $('.showcase'); if (!sec) return;
    var track = $('.showcase-track', sec), items = $$('.sc-item', sec), screens = $$('.sc-screens > svg', sec), bar = $('.sc-bar i', sec);
    var desktop = window.matchMedia('(min-width: 992px)'), ticking = false, cur = -1;
    function set(i) {
      if (i === cur) return; cur = i;
      items.forEach(function (it, k) { it.classList.toggle('on', k === i); });
      screens.forEach(function (sv, k) { sv.classList.toggle('on', k === i); });
      if (bar) bar.style.setProperty('--scp', ((i + 1) / items.length).toFixed(2));
    }
    function update() {
      ticking = false;
      if (!desktop.matches) { items.forEach(function (it) { it.classList.add('on'); }); cur = -1; return; }   // mobile: list + auto-cycling screens
      var r = track.getBoundingClientRect(), total = r.height - window.innerHeight;
      var p = total > 0 ? Math.min(0.999, Math.max(0, -r.top / total)) : 0;
      set(Math.floor(p * items.length));
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update); update();
  }

  /* ---- Compact money for the estimator / ROI: 1250000 -> "$1.25M", 12340 -> "$12,300" ---- */
  function fmtCompact(n) {
    var c = CONFIG.currency;
    if (n >= 1e6) return c.symbol + (+(n / 1e6).toFixed(2)) + 'M';
    if (n >= 1000) return formatMoney(Math.round(n / 100) * 100);
    return formatMoney(Math.max(n > 0 ? 10 : 0, Math.round(n / 10) * 10));   // small values: don't round down to $0
  }
  function fmtUSD(n) {
    var d = n / CONFIG.usdRate;
    return '$' + (d >= 1e6 ? (+(d / 1e6).toFixed(2)) + 'M' : d >= 1e3 ? Math.round(d / 1e3) + 'k' : Math.round(d));
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---- ARIA tabs helpers: roving tabindex + arrow / Home / End keys ------------ */
  function setTabs(tabs, idx) {
    tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === idx ? 'true' : 'false'); t.tabIndex = k === idx ? 0 : -1; });
  }
  function tabKeys(tabs, select) {
    tabs.forEach(function (t, i) {
      t.addEventListener('keydown', function (e) {
        var n = tabs.length, j = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n;
        else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = n - 1;
        if (j < 0) return;
        e.preventDefault(); tabs[j].focus(); select(j);
      });
    });
  }
  var uid = 0;

  /* ---- Automation flow demo: pick a scenario, watch it run step by step -------
     Illustrative only: the log shows what a real automation does, with sample data. */
  var FLOWS = {
    lead: {
      nodes: [
        ['bi-whatsapp', 'Lead arrives', 'A WhatsApp message, website form or LinkedIn lead ad.', 'Trigger'],
        ['bi-cpu', 'AI qualifies', 'Reads the message, detects intent, budget and urgency, and scores the lead.', 'AI agent'],
        ['bi-diagram-3', 'CRM updated', 'Creates or updates the contact and deal, assigns the right sales owner.', 'Zoho / HubSpot'],
        ['bi-send-check', 'Instant follow-up', 'Replies in the customer’s language, books a call and sets reminders.', 'Action']
      ],
      log: [
        ['', 'webhook  whatsapp.message  from +1 415 •••• 210'],
        ['', '"Looking for a 3-bed in Austin under $650k, can we view Saturday?"'],
        ['ai', 'agent    intent=viewing  budget=$650k  city=Austin  score=86/100'],
        ['crm', 'crm      contact upserted · deal "3-bed Austin" → stage Qualified · owner Sarah'],
        ['ok', 'reply    sent with 3 viewing slots + calendar link'],
        ['ok', 'done     total 3.2s · no manual work']
      ]
    },
    support: {
      nodes: [
        ['bi-chat-dots', 'Customer asks', '“Where is my order?” on WhatsApp, chat widget or email.', 'Trigger'],
        ['bi-search', 'AI looks it up', 'Finds the order in your store and the courier status.', 'Shopify / ShipStation'],
        ['bi-robot', 'Answers or escalates', 'Replies with the live status. Unsure or upset customer goes to a human.', 'Guardrails'],
        ['bi-journal-check', 'Ticket logged', 'Conversation and outcome saved to your CRM or helpdesk.', 'Freshdesk / CRM']
      ],
      log: [
        ['', 'webhook  chat.message  "Where is my order #4821?"'],
        ['ai', 'agent    language=en  intent=order_status  confidence=0.97'],
        ['', 'tool     shopify.orders.get(4821) → shipped · UPS 1Z•••• in transit'],
        ['ok', 'reply    "Your order arrives tomorrow" + tracking link'],
        ['crm', 'crm      ticket #T-2291 created · status Resolved by AI'],
        ['ok', 'done     total 2.1s · human handoff not needed']
      ]
    },
    invoice: {
      nodes: [
        ['bi-envelope-paper', 'Invoice received', 'A vendor emails a PDF or photo of an invoice.', 'Trigger'],
        ['bi-file-earmark-text', 'AI reads it', 'Extracts vendor, invoice number, amounts, tax and line items.', 'Document AI'],
        ['bi-check2-square', 'Checks & approval', 'Matches against the purchase order. Mismatches go to a person.', 'Human in the loop'],
        ['bi-journal-arrow-up', 'Booked in accounts', 'Posts the entry to your accounting system and notifies finance.', 'QuickBooks / Xero']
      ],
      log: [
        ['', 'imap     new mail accounts@ · attachment INV-0932.pdf'],
        ['ai', 'extract  vendor Acme Supply · $11,800.00 · tax 8.25% · 6 lines'],
        ['', 'match    PO-5512 found · qty ok · rate ok'],
        ['ok', 'approve  auto-approved (within $5,000 rule)'],
        ['crm', 'books    voucher posted · vendor ledger updated'],
        ['ok', 'done     total 6.4s · finance notified on Slack']
      ]
    }
  };

  function initFlows() {
    $$('[data-flow]').forEach(function (box) {
      var board = $('.flow-board', box), log = $('.flow-log', box), run = $('[data-flow-run]', box), say = $('[data-flow-say]', box);
      var tabs = $$('[data-flow-tab]', box), timers = [], cur = box.getAttribute('data-flow') || 'lead', started = false;
      board.id = board.id || 'flowBoard' + (++uid);
      tabs.forEach(function (t) { t.setAttribute('aria-controls', board.id); });
      function clear() { timers.forEach(clearTimeout); timers = []; }
      function render(key) {
        clear(); cur = key; var f = FLOWS[key];
        setTabs(tabs, tabs.map(function (t) { return t.getAttribute('data-flow-tab'); }).indexOf(key));
        board.innerHTML = f.nodes.map(function (n) {
          return '<li class="fnode"><i class="bi ' + n[0] + '" aria-hidden="true"></i><div><b>' + esc(n[1]) + '</b><span>' + esc(n[2]) + '</span><em class="ftag">' + esc(n[3]) + '</em></div></li>';
        }).join('');
        log.innerHTML = '<p><span class="t">$</span>Press “Run automation” to see it work.</p>';
        if (reduceMotion) { $$('.fnode', board).forEach(function (n) { n.classList.add('is-done'); }); }
      }
      function play(user) {
        clear(); var f = FLOWS[cur], nodes = $$('.fnode', board), step = reduceMotion ? 0 : 650, t = 0;
        nodes.forEach(function (n) { n.classList.remove('is-run', 'is-done'); });
        log.innerHTML = ''; run.disabled = true;
        f.log.forEach(function (line, i) {
          timers.push(setTimeout(function () {
            var node = Math.min(nodes.length - 1, Math.floor(i * nodes.length / (f.log.length - 1)));
            nodes.forEach(function (n, k) { n.classList.toggle('is-done', k < node || i === f.log.length - 1); n.classList.toggle('is-run', k === node && i < f.log.length - 1); });
            var p = document.createElement('p');
            p.innerHTML = '<span class="t">+' + (t / 1000 + i * 0.4).toFixed(1) + 's</span>' + (line[0] ? '<span class="' + line[0] + '">' + esc(line[1]) + '</span>' : esc(line[1]));
            log.appendChild(p); log.scrollTop = log.scrollHeight;
            if (i === f.log.length - 1) { run.disabled = false; if (user === true && say) say.textContent = 'Automation finished. ' + line[1].replace(/\s+/g, ' '); }
          }, i * step));
        });
      }
      tabs.forEach(function (t) { t.addEventListener('click', function () { render(t.getAttribute('data-flow-tab')); play(true); }); });
      tabKeys(tabs, function (j) { render(tabs[j].getAttribute('data-flow-tab')); play(true); });
      run.addEventListener('click', function () { play(true); });
      render(cur);
      if ('IntersectionObserver' in window && !reduceMotion) {   // auto-run once when it scrolls into view
        var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting && !started) { started = true; io.disconnect(); play(); } }, { threshold: 0.4 });
        io.observe(box);
      }
    });
  }

  /* ---- Project estimator: type + features + scale -> indicative range ---------- */
  function initEstimator() {
    var form = $('#estForm'); if (!form) return;
    var E = CONFIG.estimator, out = $('#estOut');
    function build(name, group, type) {
      var box = $('[data-opts="' + name + '"]', form); if (!box) return;
      box.innerHTML = Object.keys(group).map(function (k, i) {
        var chk = type === 'radio' && i === 0 ? ' checked' : '';
        return '<label class="opt"><input type="' + type + '" name="' + name + '" value="' + k + '"' + chk + '><span>' + esc(group[k].label) + '</span></label>';
      }).join('');
    }
    build('type', E.types, 'radio'); build('feat', E.features, 'checkbox'); build('scale', E.scale, 'radio');
    function calc() {
      var t = E.types[(form.querySelector('[name=type]:checked') || {}).value] || E.types.website;
      var s = E.scale[(form.querySelector('[name=scale]:checked') || {}).value] || E.scale.standard;
      var min = t.min, max = t.max, wk = t.wk[1], names = [];
      $$('[name=feat]:checked', form).forEach(function (c) { var f = E.features[c.value]; min += f.min; max += f.max; wk += f.wk * 0.6; names.push(f.label); });
      min *= s.mult; max *= s.mult;
      var wkMin = Math.max(2, Math.round(t.wk[0] * (s.mult > 1 ? 1.2 : 1))), wkMax = Math.round(wk * (s.mult > 1 ? 1.3 : 1));
      var rg = $('[data-est="range"]', out), txt = fmtCompact(min) + ' – ' + fmtCompact(max);
      if (rg.textContent !== txt && rg.textContent !== '—' && !reduceMotion && rg.animate)   // quiet feedback that the number changed
        rg.animate([{ opacity: 0.35, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 180, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
      rg.textContent = txt;
      var usd = $('[data-est="usd"]', out);
      if (usd) { usd.hidden = !CONFIG.usdRate; if (CONFIG.usdRate) usd.textContent = '≈ ' + fmtUSD(min) + ' – ' + fmtUSD(max) + ' USD'; }
      $('[data-est="weeks"]', out).textContent = wkMin + '–' + Math.max(wkMin + 1, wkMax) + ' weeks';
      $('[data-est="phases"]', out).textContent = max > 2000000 ? '5–6 milestones' : max > 400000 ? '4 milestones' : '3 milestones';
      $('[data-est="team"]', out).textContent = s.team;
      var summary = t.label + ' (' + s.label + ')' + (names.length ? ' + ' + names.join(', ') : '') + '. Estimate: ' + fmtCompact(min) + ' – ' + fmtCompact(max) + '.';
      var cta = $('[data-est="cta"]', out); if (cta) cta.href = 'contact.html?service=' + encodeURIComponent(summary) + '#inquiryForm';
      var wa = $('[data-est="wa"]', out); if (wa && CONFIG.whatsappNumber) { wa.href = waLink('Hi, I used your estimator: ' + summary + ' Can we discuss?'); wa.target = '_blank'; wa.rel = 'noopener'; }
    }
    form.addEventListener('change', calc); calc();
  }

  /* ---- ROI calculator: tasks × minutes × automatable share × hourly cost ------- */
  function initRoi() {
    var box = $('#roi'); if (!box) return;
    var inputs = $$('input[type=range]', box);
    function val(n) { return +$('[name=' + n + ']', box).value; }
    function calc() {
      inputs.forEach(function (i) {
        var o = $('output[for=' + i.id + ']', box); if (!o) return;
        o.textContent = i.name === 'cost' ? formatMoney(+i.value) + '/hr' : i.name === 'share' ? i.value + '%' : i.name === 'mins' ? i.value + ' min' : Number(i.value).toLocaleString('en-US');
      });
      var hours = val('tasks') * val('mins') / 60 * val('share') / 100;
      $('[data-roi="year"]', box).textContent = fmtCompact(hours * val('cost') * 12);
      $('[data-roi="hours"]', box).textContent = (hours < 10 ? (+hours.toFixed(1)) : Math.round(hours)).toLocaleString('en-US') + ' hrs';
      $('[data-roi="fte"]', box).textContent = (hours / 160).toFixed(1);
      $('[data-roi="days"]', box).textContent = Math.round(hours / 8).toLocaleString('en-US');
    }
    var say = $('[data-roi="say"]', box), t = 0;
    function announce() {                       // one quiet summary after the slider settles, not on every tick
      clearTimeout(t);
      t = setTimeout(function () { if (say) say.textContent = 'Estimated saving ' + $('[data-roi="year"]', box).textContent + ' per year, ' + $('[data-roi="hours"]', box).textContent + ' a month.'; }, 800);
    }
    inputs.forEach(function (i) { i.addEventListener('input', calc); i.addEventListener('change', announce); }); calc();
  }

  /* ---- Integration hub: systems around a core; pick one to see what we sync ---- */
  var HUB = [
    ['zoho', 'bi-person-lines-fill', 'Zoho CRM', 'CRM', 'An affordable, flexible CRM for growing teams. We connect your website, WhatsApp and ads to it so no lead is typed in by hand.', ['Leads from forms, WhatsApp and ad platforms', 'Deal stages and owner assignment', 'Zoho Books and Desk sync', 'Custom modules and Deluge functions']],
    ['hubspot', 'bi-hdd-network', 'HubSpot', 'CRM', 'For marketing-led teams. Contacts, deals and lifecycle stages stay in step with your site and product.', ['Forms and live chat to contacts', 'Lifecycle and lead scoring', 'Email sequences triggered by product events', 'Two-way sync with your database']],
    ['salesforce', 'bi-cloud', 'Salesforce', 'CRM', 'For larger sales teams. We build integrations through the official APIs with proper error handling and audit trails.', ['Leads, accounts and opportunities', 'Custom objects and flows', 'Bulk data migration', 'Middleware with retries and logs']],
    ['pipedrive', 'bi-funnel', 'Pipedrive', 'CRM', 'A pipeline-first CRM popular with small sales teams. We plug in every lead source and automate follow-ups.', ['Lead capture from all channels', 'Deal and activity sync', 'Calls, email and WhatsApp logged to each deal', 'Automatic owner routing']],
    ['erp', 'bi-boxes', 'Odoo / ERPNext', 'ERP', 'Inventory, purchase and manufacturing data connected to your store, app and dashboards.', ['Stock and price sync to your store', 'Sales orders from website or app', 'Purchase and GRN workflows', 'Custom reports and dashboards']],
    ['books', 'bi-calculator', 'QuickBooks / Xero', 'Accounting', 'Invoices, payments and bills posted automatically, with tax details intact.', ['Invoices and bills', 'Sales tax / VAT-ready data', 'Payment reconciliation', 'AI invoice reading into your books']],
    ['stripe', 'bi-credit-card', 'Stripe / PayPal', 'Payments', 'Checkout, payment links, subscriptions and refunds wired into your CRM and accounts.', ['Cards, Apple Pay, Google Pay', 'Payment links on WhatsApp or email', 'Webhooks to CRM and accounting', 'Subscriptions and invoicing']],
    ['whatsapp', 'bi-whatsapp', 'WhatsApp Cloud API', 'Messaging', 'Official WhatsApp Business Platform: templates, chatbots, broadcasts and AI agents that reply in your customers’ language.', ['Approved message templates', 'AI agent with human handoff', 'Order, booking and payment updates', 'Shared team inbox']],
    ['shopify', 'bi-bag', 'Shopify / WooCommerce', 'Commerce', 'Orders, customers and inventory flowing to your CRM, courier and accounts.', ['Order and customer sync', 'Abandoned cart recovery on WhatsApp', 'Inventory from ERP', 'UPS / FedEx / DHL tracking']],
    ['google', 'bi-google', 'Google Workspace', 'Productivity', 'Sheets, Calendar, Gmail and Drive as part of your workflow, not a copy-paste step.', ['Bookings into Calendar', 'Reports into Sheets', 'Email parsing from Gmail', 'Docs and Drive for AI search']],
    ['ai', 'bi-stars', 'LLMs (Claude, GPT, Gemini)', 'AI', 'We pick the model that fits the job and budget, and keep your data out of model training.', ['Chat and voice agents', 'Search over your documents (RAG)', 'Data extraction and classification', 'Evaluation and guardrails']],
    ['api', 'bi-plug', 'Your custom API', 'Anything else', 'Legacy software, government portals, bank APIs or an internal database. If it has an API or an export, we can connect it.', ['REST, GraphQL, SOAP, webhooks', 'CSV / SFTP batch jobs', 'Queue-based sync with retries', 'Monitoring and alerts']]
  ];
  function initHub() {
    var hub = $('#hub'); if (!hub) return;
    var detail = $('#hubDetail'), svg = $('.hub-lines', hub), n = HUB.length, html = '', lines = '';
    HUB.forEach(function (h, i) {
      var a = (i / n) * Math.PI * 2 - Math.PI / 2, x = 50 + Math.cos(a) * 41, y = 50 + Math.sin(a) * 41;
      html += '<button type="button" role="tab" id="hubTab' + i + '" class="hub-node" style="left:' + x.toFixed(2) + '%;top:' + y.toFixed(2) + '%" data-hub="' + i + '" aria-selected="false" aria-controls="hubDetail" tabindex="-1"><i class="bi ' + h[1] + '" aria-hidden="true"></i><span>' + esc(h[2].split(' (')[0].split(' / ')[0]) + '</span></button>';
      lines += '<line x1="50" y1="50" x2="' + x.toFixed(2) + '" y2="' + y.toFixed(2) + '"/>';
    });
    svg.innerHTML = lines;
    hub.insertAdjacentHTML('beforeend', '<div class="hub-nodes" role="tablist" aria-label="Systems we integrate">' + html + '</div>');
    detail.setAttribute('role', 'tabpanel'); detail.tabIndex = 0;
    var btns = $$('.hub-node', hub), ls = $$('line', svg), auto = 0, stopped = false, hold = false, k = 0, tourBtn = null;
    function pick(i) {
      var h = HUB[i]; k = i;
      setTabs(btns, i);
      ls.forEach(function (l, j) { l.classList.toggle('on', j === i); });
      detail.setAttribute('aria-labelledby', 'hubTab' + i);
      detail.innerHTML = '<span class="cat">' + esc(h[3]) + '</span><h3>' + esc(h[2]) + '</h3><p>' + esc(h[4]) + '</p><ul class="check-list">' +
        h[5].map(function (x) { return '<li><i class="bi bi-check2-circle" aria-hidden="true"></i>' + esc(x) + '</li>'; }).join('') + '</ul>';
    }
    function stop() { stopped = true; clearInterval(auto); if (tourBtn) tourBtn.hidden = true; }
    btns.forEach(function (b) { b.addEventListener('click', function () { stop(); pick(+b.getAttribute('data-hub')); }); });
    tabKeys(btns, function (j) { stop(); pick(j); });
    pick(0);
    if (reduceMotion) return;
    // gentle auto-tour until the visitor interacts; pauses on hover/focus and has a visible Pause control (WCAG 2.2.2)
    var wrap = document.createElement('div'); hub.parentNode.insertBefore(wrap, hub); wrap.appendChild(hub);
    wrap.insertAdjacentHTML('beforeend', '<button type="button" class="btn-nx btn-nx--ghost btn-nx--sm hub-tour" aria-pressed="false"><i class="bi bi-pause-fill" aria-hidden="true"></i> Pause tour</button>');
    tourBtn = $('.hub-tour', wrap);
    tourBtn.addEventListener('click', function () {
      var p = tourBtn.getAttribute('aria-pressed') !== 'true'; tourBtn.setAttribute('aria-pressed', p ? 'true' : 'false');
      tourBtn.innerHTML = p ? '<i class="bi bi-play-fill" aria-hidden="true"></i> Play tour' : '<i class="bi bi-pause-fill" aria-hidden="true"></i> Pause tour';
    });
    hub.addEventListener('pointerenter', function () { hold = true; }); hub.addEventListener('pointerleave', function () { hold = false; });
    hub.addEventListener('focusin', function () { hold = true; }); hub.addEventListener('focusout', function () { hold = false; });
    auto = setInterval(function () {
      if (stopped || hold || document.hidden || tourBtn.getAttribute('aria-pressed') === 'true') return;
      var r = hub.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight) return;
      pick((k + 1) % n);
    }, 3200);
  }

  /* ---- Header "Solutions" dropdown: click / Enter opens, Escape or outside click closes ---- */
  function initSubnav() {
    $$('.sub-toggle').forEach(function (btn) {
      var li = btn.closest('.has-sub'), sub = document.getElementById(btn.getAttribute('aria-controls'));
      function set(open) { btn.setAttribute('aria-expanded', open ? 'true' : 'false'); li.classList.toggle('is-open', open); }
      btn.addEventListener('click', function (e) { e.stopPropagation(); set(btn.getAttribute('aria-expanded') !== 'true'); });
      document.addEventListener('click', function (e) { if (!li.contains(e.target)) set(false); });
      li.addEventListener('keydown', function (e) { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); } });
      li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) set(false); });
      if (sub && $('a[aria-current="page"]', sub)) btn.classList.add('active');
    });
  }

  /* ---- Numbered services list: one row open at a time (like the FAQ) -------- */
  function initSvcList() {
    var rows = $$('.svc-row'); if (!rows.length) return;
    rows.forEach(function (row) {
      var b = $('.svc-q', row);
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') === 'true';
        rows.forEach(function (r) { $('.svc-q', r).setAttribute('aria-expanded', 'false'); r.classList.remove('is-open'); });
        if (!open) { b.setAttribute('aria-expanded', 'true'); row.classList.add('is-open'); }
      });
    });
  }

  /* ---- Portfolio slider: native scroll-snap track + prev/next + progress bar ---- */
  function initSliders() {
    $$('[data-slider]').forEach(function (box) {
      var track = $('.slider-track', box), prev = $('[data-prev]', box), next = $('[data-next]', box), bar = $('.slider-bar i', box);
      if (!track) return;
      function step() { var s = track.firstElementChild; return s ? s.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth; }
      function update() {
        var max = track.scrollWidth - track.clientWidth, x = track.scrollLeft;
        if (prev) prev.disabled = x <= 2; if (next) next.disabled = x >= max - 2;
        if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.max(.15, (x + track.clientWidth) / track.scrollWidth) : 1).toFixed(3) + ')';
      }
      function go(dir) { track.scrollBy({ left: dir * step(), behavior: reduceMotion ? 'auto' : 'smooth' }); }
      if (prev) prev.addEventListener('click', function () { go(-1); });
      if (next) next.addEventListener('click', function () { go(1); });
      track.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } });
      var t = 0; track.addEventListener('scroll', function () { if (!t) t = requestAnimationFrame(function () { t = 0; update(); }); }, { passive: true });
      window.addEventListener('resize', update); update();
    });
  }

  /* ---- Owner savings calculator (homepage #owner-roi) --------------------------------
     time saved = hours/week × 4.33 × hourly cost × 60% automated
     recovered  = missed leads/month × 30% won back × customer value. Labelled as an estimate on the page. */
  function initOwnerRoi() {
    var box = $('#owner-roi'); if (!box) return;
    var ins = $$('input[type=range]', box), shown = { total: 0 }, raf = 0;
    function v(id) { return +$('#' + id, box).value; }
    function paint(el, n) { el.textContent = formatMoney(n); }
    function calc() {
      ins.forEach(function (i) { var o = $('output[for=' + i.id + ']', box), u = o.getAttribute('data-unit');
        o.textContent = u === '$' ? formatMoney(+i.value) + (i.id === 'o-cost' ? '/hr' : '') : i.value + (u ? ' ' + u : ''); });
      var hours = v('o-hours') * 4.33 * 0.6, time = hours * v('o-cost'), leads = v('o-missed') * 0.3 * v('o-value'), total = time + leads;
      paint($('[data-o="time"]', box), time); paint($('[data-o="leads"]', box), leads);
      $('[data-o="hours"]', box).textContent = Math.round(hours) + ' h';
      var el = $('[data-o="total"]', box), from = shown.total, t0 = 0;
      cancelAnimationFrame(raf);
      if (reduceMotion) { shown.total = total; paint(el, total); return; }
      raf = requestAnimationFrame(function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 450);
        shown.total = from + (total - from) * (1 - Math.pow(1 - p, 3)); paint(el, shown.total); if (p < 1) raf = requestAnimationFrame(step); });
    }
    ins.forEach(function (i) { i.addEventListener('input', calc); }); calc();
  }

  /* ---- Tabs (industries): roving tabindex, arrow keys, Home/End. Without JS all panels show. */
  function initTabs() {
    $$('[data-tabs]').forEach(function (box) {
      var tabs = $$('[role="tab"]', box), panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
      function sel(i, focus) {
        tabs.forEach(function (t, k) { var on = k === i; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; panels[k].hidden = !on; });
        if (focus) tabs[i].focus();
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { sel(i); });
        t.addEventListener('keydown', function (e) {
          var k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
          if (k === undefined) return; e.preventDefault(); sel((k + tabs.length) % tabs.length, true);
        });
      });
      sel(0);
    });
  }

  /* ---- Proof: renders only real entries from CONFIG.proof; otherwise the section stays hidden */
  function initProof() {
    var sec = $('[data-proof]'), P = CONFIG.proof || {}; if (!sec) return;
    var r = P.results || [], q = P.testimonials || [], l = P.logos || [], c = P.cases || [], box = $('[data-proof-cases]', sec);
    if (!r.length && !q.length && !l.length && !c.length) { if (!sec.hasAttribute('data-proof-always')) sec.hidden = true; return; }
    if (box && c.length) {
      box.innerHTML = c.map(function (x) {
        return '<article class="case-card">' + (x.image ? '<img src="' + esc(x.image) + '" alt="' + esc(x.imageAlt || '') + '" width="640" height="360" loading="lazy" decoding="async">' : '') +
          '<div class="case-body"><span class="case-kicker">' + esc(x.industry || '') + '</span><h3>' + esc(x.client) + '</h3>' +
          '<dl><dt>Problem</dt><dd>' + esc(x.problem || '') + '</dd><dt>What we built</dt><dd>' + esc(x.solution || '') + '</dd><dt>Outcome</dt><dd>' + esc(x.outcome || '') + '</dd></dl>' +
          (x.url ? '<a class="btn-text" href="' + esc(x.url) + '" target="_blank" rel="noopener">View project</a>' : '') + '</div></article>';
      }).join('');
      box.hidden = false;
    }
    $('[data-proof-results]', sec).innerHTML = r.map(function (x) { return '<div><b>' + esc(x.value) + '</b><span>' + esc(x.label) + '</span></div>'; }).join('');
    $('[data-proof-quotes]', sec).innerHTML = q.map(function (x) { return '<blockquote><p>“' + esc(x.quote) + '”</p><footer>' + esc(x.name) + (x.role ? ', ' + esc(x.role) : '') + (x.company ? ' · ' + esc(x.company) : '') + '</footer></blockquote>'; }).join('');
    $('[data-proof-logos]', sec).innerHTML = l.map(function (x) { return '<img src="' + esc(x.src) + '" alt="' + esc(x.alt) + '" height="34" loading="lazy">'; }).join('');
    sec.hidden = false;
  }

  /* ---- Hero demo counter: counts the "done" chips the hero animation shows (one every 1.1 s).
     Only while the hero is on screen and motion is allowed; labelled "(demo)" on the page. ---- */
  function initTaskCounter() {
    var el = $('[data-task-count]'), hero = $('.hero--v7'); if (!el || !hero || reduceMotion) return;
    var b = $('b', el), n = 0, on = true, t = 0;
    el.classList.add('on');
    function tick() {
      if (on && !document.hidden) { n++; b.textContent = n; b.classList.remove('tick'); void b.offsetWidth; b.classList.add('tick'); }
      t = setTimeout(tick, 1100);
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { on = en[0].isIntersecting; }).observe(hero);
    t = setTimeout(tick, 1900);
  }

  /* ---- 3D globe: loads js/globe.js (Three.js) only on screens >= 768px with WebGL and motion allowed,
     when the section comes near the viewport. Otherwise the static SVG globe stays. ---- */
  function initGlobe() {
    var st = $('[data-globe]'), data = $('#globe-data'); if (!st || !data) return;
    var gl = false;
    try { var cv = document.createElement('canvas'); gl = !!(cv.getContext('webgl2') || cv.getContext('webgl')); } catch (e) {}
    if (reduceMotion || !gl || !window.matchMedia('(min-width: 768px)').matches || !('IntersectionObserver' in window)) return;
    var d = JSON.parse(data.textContent);
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; io.disconnect();
      import('./globe.js').then(function (m) { m.initGlobe(st, d.places, d.hub); }).catch(function (err) { if (window.console) console.warn('Globe fallback:', err && err.message); });
    }, { rootMargin: '400px' });
    io.observe(st);
  }

  /* ---- 3D hero: on desktop with WebGL and motion allowed, js/hero3d.js (Three.js) replaces the CSS core
     after the first pointer move / scroll / key (or 3.5 s), so the first paint stays light. ---- */
  function initHero3D() {
    var stage = $('.hero--v7 .core-stage'); if (!stage || reduceMotion || !window.matchMedia('(min-width: 992px)').matches) return;
    var gl = false; try { var cv = document.createElement('canvas'); gl = !!(cv.getContext('webgl2') || cv.getContext('webgl')); } catch (e) {}
    if (!gl) return;
    var ins = $$('.task:not(.task--done)', stage), outs = $$('.task--done', stage);
    var pairs = ins.map(function (el, i) {
      var ic = ($('i', el) || { className: '' }).className.replace(/\bbi\b/, '').trim();
      return { task: el.getAttribute('data-label'), done: outs[i] ? outs[i].getAttribute('data-label') : 'Done', icon: ic || 'bi-lightning' };
    });
    var evs = ['pointermove', 'scroll', 'keydown', 'touchstart'], fired = false;
    function go() {
      if (fired) return; fired = true;
      evs.forEach(function (e) { window.removeEventListener(e, go); });
      import('./hero3d.js').then(function (mod) { mod.initHero3D(stage, pairs); }).catch(function (err) { if (window.console) console.warn('3D hero fallback:', err && err.message); });
    }
    evs.forEach(function (e) { window.addEventListener(e, go, { passive: true }); });
    setTimeout(go, 3500);
  }

  /* ---- Hero live automation feed (demo): a new example event every ~2.6 s, stamped with the visitor's
     real clock time, shown as "working" then "done in Xs". Static rows under reduced motion / no JS. ---- */
  function initLiveFeed() {
    var box = $('[data-live-feed]'); if (!box || reduceMotion) return;
    var list = $('.lf-list', box), on = true, i = 0;
    var EV = [
      ['bi-whatsapp', 'WhatsApp from Maya', 'Booked Sat 2:00 PM', 3.1], ['bi-telephone', 'Call from (415) •••-0192', 'Answered and booked', 41],
      ['bi-envelope', 'Email: Order #1182 status?', 'Replied with tracking', 38], ['bi-receipt', 'Invoice INV-0932', 'Entered in QuickBooks', 6.4],
      ['bi-person-plus', 'New lead from Google Ads', 'Replied + follow-up set', 58], ['bi-star', 'New 5-star Google review', 'Thank-you reply sent', 2.0],
      ['bi-calendar-x', 'Cancellation, Tue 10 AM', 'Slot offered to waitlist', 1.2], ['bi-globe2', 'Website chat at 2:13 AM', 'Airport transfer added', 24],
      ['bi-instagram', 'Instagram DM from Leo', 'Trial class booked', 19], ['bi-cart', 'Abandoned cart, $84', 'Reminder sent', 0.9],
      ['bi-file-earmark-check', 'Contract signed', 'Onboarding email sent', 1.6], ['bi-bar-chart', '7:00 AM', 'Daily owner report sent', 4.2]];
    function clock() { var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; }; return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()); }
    function add() {
      if (!on || document.hidden) return;
      var e = EV[i++ % EV.length], li = document.createElement('li');
      li.className = 'lf-row is-new';
      li.innerHTML = '<span class="lf-ic"><i class="bi ' + e[0] + '" aria-hidden="true"></i></span><span class="lf-txt"><b>' + esc(e[1]) + '</b><span>' + esc(e[2]) + '</span></span>' +
        '<span class="lf-meta"><span class="lf-time">' + clock() + '</span><span class="lf-status"><span class="spin" aria-hidden="true"></span>working</span></span>';
      list.insertBefore(li, list.firstChild);
      while (list.children.length > 3) list.removeChild(list.lastChild);
      setTimeout(function () { li.classList.add('is-done'); $('.lf-status', li).innerHTML = '<i class="bi bi-check2" aria-hidden="true"></i>' + e[3] + 's'; }, 1100);
    }
    $$('.lf-time', box).forEach(function (t) { t.textContent = clock(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { on = en[0].isIntersecting; }).observe(box);
    setInterval(add, 2600); setTimeout(add, 900);
  }

  /* ---- Interactive device demo: a realistic phone (or tablet inbox) where demo conversations play out with
     typing status, then the visitor can tap a suggested reply or type their own; the AI answers with scripted,
     keyword-matched replies (clearly labelled as a demo). Plays only while on screen; static without JS. ---- */
  function initChatDemo() {
    var box = $('[data-chat-demo]'); if (!box) return;
    var device = $('.device', box), panels = $$('[data-convo-panel]', box), tabs = $$('[data-convo]', box), devBtns = $$('[data-device-set]', box);
    var quick = $('[data-quick-box]', box), form = $('[data-composer]', box), input = $('input', form), note = $('[data-demo-note] span', box);
    var cur = 0, timers = [], visible = false, auto = true, started = false, busy = false;
    box.classList.add('js-chat');
    function clear() { timers.forEach(clearTimeout); timers = []; busy = false; }
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function clock() { var d = new Date(), h = d.getHours() % 12 || 12, m = d.getMinutes(); return h + ':' + (m < 10 ? '0' : '') + m; }
    function now12() { var d = new Date(), h = d.getHours(), m = d.getMinutes(); return ((h % 12) || 12) + ':' + (m < 10 ? '0' : '') + m + (h >= 12 ? ' PM' : ' AM'); }
    $$('[data-clock]', box).forEach(function (c) { c.textContent = clock(); });
    setInterval(function () { $$('[data-clock]', box).forEach(function (c) { c.textContent = clock(); }); }, 30000);
    function panel() { return panels[cur]; }
    function list(p) { return $('.convo-msgs', p); }
    function scroll(p) { var l = list(p); l.scrollTop = l.scrollHeight; }
    function status(p, typing) {
      var st = $('[data-status]', p), ch = p.getAttribute('data-channel'); if (!st || ch === 'call' || ch === 'email') return;
      if (!st.getAttribute('data-idle')) st.setAttribute('data-idle', st.textContent);
      st.textContent = typing ? 'typing…' : st.getAttribute('data-idle'); st.classList.toggle('is-typing', typing);
    }
    function typingOn(p, on) { var ty = $('.msg--typing', p); ty.classList.toggle('on', on); status(p, on); if (on) scroll(p); }
    function bubble(p, who, text) {
      var ch = p.getAttribute('data-channel'), li = document.createElement('li'), t = esc(text), tm = now12(), name = p.getAttribute('data-name');
      li.className = 'msg msg--' + who + ' on is-live';
      if (ch === 'email') li.innerHTML = '<span class="mail-card"><span class="mail-from"><b>' + (who === 'in' ? 'You' : esc(name)) + '</b><small>' + tm + '</small></span>' + t + '</span>';
      else if (ch === 'call') li.innerHTML = '<span><em>' + (who === 'in' ? 'You' : 'AI') + '</em>' + t + '</span>';
      else li.innerHTML = '<span>' + t + '<small class="msg-meta">' + tm + (who === 'in' && ch === 'whatsapp' ? ' <i class="bi bi-check2-all" aria-hidden="true"></i>' : '') + '</small></span>';
      list(p).insertBefore(li, $('.msg--typing', p)); scroll(p); return li;
    }
    function answer(text, p) {
      var n = p.getAttribute('data-name'), x = text.toLowerCase();
      if (/price|cost|how much|fee|\$|quote|per night|membership|charge/.test(x)) return 'Good question! Prices depend on exactly what you need. I can send you our price list now, or book a free 15-minute call with the team. Which would you prefer?';
      if (/hour|open|close|when are you|time do you/.test(x)) return 'We’re open Monday to Saturday, 9 AM to 7 PM, and I’m here 24/7 to answer questions and take bookings.';
      if (/insurance/.test(x)) return 'We work with most major insurance plans. If you share your provider, I’ll check it and note it on your booking.';
      if (/book|appointment|table|slot|reserv|schedule|viewing|class|cleaning|friday|saturday|tomorrow/.test(x)) return 'I can book that for you. The next free times are tomorrow at 10:00 AM or 3:30 PM. Which works best?';
      if (/human|person|staff|stylist|manager|attorney|coach|plumber|support|call me|call back|talk|speak/.test(x)) return 'Of course. I’ve asked the ' + n + ' team to call you back. During opening hours that’s usually within 15 minutes.';
      if (/vegan|gluten|allerg|breakfast|parking|ship|return|emergenc|bring/.test(x)) return 'Yes, we can help with that. I’ve added a note for the team, and I’ll send you the details by text in a moment.';
      if (/thank|thanks|great|perfect|ok|okay|cool/.test(x)) return 'You’re welcome! 😊 Anything else I can help with?';
      return 'Thanks for your message! I’ve saved it for the ' + n + ' team. Is there anything I can book or check for you right now?';
    }
    function send(text) {
      text = (text || '').trim(); if (!text || busy) return;
      auto = false; clear(); busy = true;
      var p = panel(); bubble(p, 'in', text); quick.innerHTML = '';
      later(function () { typingOn(p, true); }, 450);
      later(function () { typingOn(p, false); bubble(p, 'out', answer(text, p)); busy = false; renderQuick(p); }, 1700);
    }
    function renderQuick(p) {
      var q = []; try { q = JSON.parse(p.getAttribute('data-quick') || '[]'); } catch (e) {}
      quick.innerHTML = ''; q.forEach(function (t) { var b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.addEventListener('click', function () { send(t); }); quick.appendChild(b); });
      input.placeholder = p.getAttribute('data-channel') === 'email' ? 'Write a reply…' : p.getAttribute('data-channel') === 'call' ? 'Say something to the AI…' : 'Type a message…';
    }
    function show(i, animate) {
      clear(); cur = i;
      tabs.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-convo') === panels[i].getAttribute('data-convo-panel') ? 'true' : 'false'); });
      panels.forEach(function (p, k) { p.hidden = k !== i; });
      var p = panels[i], msgs = $$('.msg:not(.msg--typing)', p);
      $$('.is-live', p).forEach(function (m) { m.parentNode.removeChild(m); });     // drop the visitor's own messages from a previous visit
      if (note) note.textContent = p.getAttribute('data-note');
      quick.innerHTML = '';
      if (!animate || reduceMotion) { msgs.forEach(function (m) { m.classList.add('on'); }); typingOn(p, false); renderQuick(p); scroll(p); return; }
      msgs.forEach(function (m) { m.classList.remove('on'); });
      var t = 450;
      msgs.forEach(function (m) {
        if (m.classList.contains('msg--out')) { later(function () { typingOn(p, true); }, t); t += 1100; }
        later(function () { typingOn(p, false); m.classList.add('on'); scroll(p); }, t); t += 950;
      });
      later(function () { renderQuick(p); }, t);
      later(function () { if (auto && visible && !document.hidden) show((cur + 1) % panels.length, true); }, t + 4200);
    }
    tabs.forEach(function (b) { b.addEventListener('click', function () {
      var k = b.getAttribute('data-convo'); auto = false;
      panels.forEach(function (p, i) { if (p.getAttribute('data-convo-panel') === k) show(i, true); });
    }); });
    devBtns.forEach(function (b) { b.addEventListener('click', function () {
      var d = b.getAttribute('data-device-set'); device.setAttribute('data-device', d); box.classList.toggle('is-tablet', d === 'tablet');
      devBtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); scroll(panel());
    }); });
    form.addEventListener('submit', function (e) { e.preventDefault(); send(input.value); input.value = ''; });
    // call screen: running timer
    var secs = 42; setInterval(function () { if (!visible) return; secs++; $$('[data-call-timer]', box).forEach(function (el) { el.textContent = (secs / 60 < 10 ? '0' : '') + Math.floor(secs / 60) + ':' + (secs % 60 < 10 ? '0' : '') + (secs % 60); }); }, 1000);
    show(0, false);
    if (!('IntersectionObserver' in window) || reduceMotion) return;
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible && !started) { started = true; show(cur, true); }
      else if (visible && auto && !busy) show(cur, true);
      else if (!visible) { clear(); show(cur, false); }
    }, { threshold: .35 }).observe(box);
  }

  /* ---- Build-your-AI-team configurator: toggle AI employees, live hours/value, best plan, prefilled enquiry ---- */
  function initTeamBuilder() {
    var box = $('[data-team-builder]'); if (!box) return;
    var cards = $$('.tm-card', box), av = $('[data-team-avatars]', box), hEl = $('[data-team-hours]', box), vEl = $('[data-team-value]', box);
    var plan = $('[data-team-plan]', box), pName = $('[data-team-plan-name]', box), pPrice = $('[data-team-plan-price]', box), empty = $('[data-team-empty]', box), cta = $('[data-team-cta]', box);
    var P = CONFIG.packages || {}, shown = { h: 0, v: 0 }, raf = 0;
    function animate(h, v) {
      var from = { h: shown.h, v: shown.v }, t0 = 0; cancelAnimationFrame(raf);
      if (reduceMotion) { shown = { h: h, v: v }; hEl.textContent = h; vEl.textContent = formatMoney(v); return; }
      raf = requestAnimationFrame(function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 500), e = 1 - Math.pow(1 - k, 3);
        shown.h = from.h + (h - from.h) * e; shown.v = from.v + (v - from.v) * e; hEl.textContent = Math.round(shown.h); vEl.textContent = formatMoney(shown.v); if (k < 1) raf = requestAnimationFrame(step); });
    }
    function update() {
      var on = cards.filter(function (c) { return c.getAttribute('aria-pressed') === 'true'; }), keys = on.map(function (c) { return c.getAttribute('data-team'); });
      var hours = on.reduce(function (a, c) { return a + +c.getAttribute('data-hours'); }, 0);
      animate(hours, hours * 4.33 * 35);
      av.innerHTML = on.map(function (c, i) { var a = 2 * Math.PI * i / Math.max(on.length, 1) - Math.PI / 2;
        return '<span class="tm-av" style="--x:' + (Math.cos(a) * 62).toFixed(1) + 'px;--y:' + (Math.sin(a) * 62).toFixed(1) + 'px">' + $('.tm-ic', c).innerHTML + '</span>'; }).join('');
      empty.hidden = on.length > 0; plan.hidden = !on.length;
      var has = function (k) { return keys.indexOf(k) > -1; }, growthish = ['chat', 'followup', 'booking', 'reviews'].filter(has).length;
      var name, setup = 0, mo = 0, custom = false;
      if (growthish >= 3 || (has('booking') || has('reviews'))) { name = 'Growth Bundle'; setup = P.growth.setup; mo = P.growth.monthly;
        if (has('voice')) { name += ' + AI Receptionist'; setup += P.voice.setup; mo += P.voice.monthly; }
        if (has('email')) { name += ' + Email Assistant'; setup += P.email.setup; mo += P.email.monthly; } }
      else { var parts = [];
        if (has('chat')) { parts.push('AI Chat Assistant'); setup += P.chat.setup; mo += P.chat.monthly; }
        if (has('voice')) { parts.push('AI Receptionist'); setup += P.voice.setup; mo += P.voice.monthly; }
        if (has('followup')) { parts.push('Lead Follow-up Engine'); setup += P.followup.setup; mo += P.followup.monthly; }
        if (has('email')) { parts.push('AI Email Assistant'); setup += P.email.setup; mo += P.email.monthly; }
        if (keys.length === 1 && has('chat') && P.lite) { parts = ['AI Starter (or AI Chat Assistant for more)']; setup = P.lite.setup; mo = P.lite.monthly; }
        name = parts.join(' + '); }
      if (has('reports')) { custom = true; name = (name ? name + ' + ' : '') + 'Owner Reports'; }
      pName.textContent = name || 'Owner Reports';
      pPrice.textContent = (setup ? 'From ' + formatMoney(setup) + ' setup + ' + formatMoney(mo) + '/month' : '') + (custom ? (setup ? ' · reports quoted on the call' : 'Fixed quote after a free call') : '');
      var names = on.map(function (c) { return $('b', c).textContent; }).join(', ');
      cta.href = 'contact.html?service=' + encodeURIComponent('My AI team: ' + (names || 'not sure yet')) + '#enquiry';
    }
    cards.forEach(function (c) { c.addEventListener('click', function () {
      var on = c.getAttribute('aria-pressed') !== 'true'; c.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on && !reduceMotion) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); }
      update(); }); });
    ['chat', 'voice'].forEach(function (k) { var c = $('[data-team="' + k + '"]', box); if (c) c.setAttribute('aria-pressed', 'true'); });   // a sensible starting team
    update();
  }

  /* ---- Section navigator (desktop): dots on the left edge, label on hover/focus, current section highlighted ---- */
  function initSectionNav() {
    var secs = $$('main section[data-nav-label]'); if (secs.length < 4 || !window.matchMedia('(min-width: 1200px)').matches) return;
    var nav = document.createElement('nav'); nav.className = 'sec-nav'; nav.setAttribute('aria-label', 'Page sections');
    nav.innerHTML = '<ol>' + secs.map(function (s) { return '<li><a href="#' + s.id + '"><span class="sn-dot" aria-hidden="true"></span><span class="sn-l">' + esc(s.getAttribute('data-nav-label')) + '</span></a></li>'; }).join('') + '</ol>';
    document.body.appendChild(nav);
    var links = $$('a', nav), hero = $('.hero');
    var ticking = false;
    function upd() {
      ticking = false; var mid = window.innerHeight * 0.4, cur = -1;
      secs.forEach(function (s, i) { if (s.getBoundingClientRect().top < mid) cur = i; });
      links.forEach(function (a, i) { if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      nav.classList.toggle('on', !hero || hero.getBoundingClientRect().bottom < 80);
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* ---- Pointer spotlight + gentle 3D tilt on dark cards, and magnetic primary buttons (fine pointer only) ---- */
  function initPointerFx() {
    if (!canHover || reduceMotion) return;
    $$('.why-card, .tech-card, .ind-card, .reg, .tm-card, .exp-steps li, .globe-stats li').forEach(function (el) {
      el.classList.add('fx-spot'); var raf = 0;
      el.addEventListener('pointermove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () { raf = 0; var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          el.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
          el.style.transform = 'perspective(800px) rotateX(' + ((0.5 - y) * 5).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 6).toFixed(2) + 'deg) translateY(-3px)'; });
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
    $$('.hero .btn-nx--primary, .cta-section .btn-nx--primary, .tm-out .btn-nx--primary, .help-actions .btn-nx--primary').forEach(function (b) {
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---- Phone UX: swipe carousels with dots + hint, sticky team summary, touch feedback ---- */
  function initPhoneUx() {
    var phone = window.matchMedia('(max-width: 767.98px)');
    // swipe carousels: dots that follow the slide in view and jump on tap
    $$('[data-swipe]').forEach(function (track) {
      var items = Array.prototype.slice.call(track.children); if (items.length < 2) return;
      var bar = document.createElement('div'); bar.className = 'swipe-ui';
      bar.innerHTML = '<span class="swipe-hint" aria-hidden="true">Swipe <i class="bi bi-arrow-right"></i></span><span class="swipe-dots" role="group" aria-label="' + esc(track.getAttribute('data-swipe')) + '">' +
        items.map(function (_, i) { return '<button type="button" aria-label="Show item ' + (i + 1) + ' of ' + items.length + '"></button>'; }).join('') + '</span>';
      track.parentNode.insertBefore(bar, track.nextSibling);
      var dots = $$('.swipe-dots button', bar);
      function mark(i) { dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i ? 'true' : 'false'); }); }
      dots.forEach(function (d, i) { d.addEventListener('click', function () { track.scrollTo({ left: items[i].offsetLeft - track.offsetLeft - 16, behavior: reduceMotion ? 'auto' : 'smooth' }); }); });
      var t = 0;
      track.addEventListener('scroll', function () {
        bar.classList.add('used');
        if (t) return; t = requestAnimationFrame(function () {
          t = 0; var mid = track.scrollLeft + track.clientWidth / 2, best = 0, bd = 1e9;
          items.forEach(function (it, i) { var c = it.offsetLeft - track.offsetLeft + it.offsetWidth / 2, dd = Math.abs(c - mid); if (dd < bd) { bd = dd; best = i; } });
          mark(best);
        });
      }, { passive: true });
      mark(0);
    });
    // sticky team summary while the result card is off screen
    var tb = $('[data-team-bar]'), out = $('#team-result'), team = $('#team');
    if (tb && out && team && 'IntersectionObserver' in window) {
      var inTeam = false, outVis = false;
      function show() { tb.classList.toggle('on', phone.matches && inTeam && !outVis); }
      new IntersectionObserver(function (en) { inTeam = en[0].isIntersecting; show(); }, { threshold: 0.05 }).observe(team);
      new IntersectionObserver(function (en) { outVis = en[0].isIntersecting; show(); }, { threshold: 0.25 }).observe(out);
      var hEl = $('[data-team-hours]'), cards = $$('.tm-card');
      function sync() { $('[data-team-bar-n]', tb).textContent = cards.filter(function (c) { return c.getAttribute('aria-pressed') === 'true'; }).length;
        $('[data-team-bar-h]', tb).textContent = cards.filter(function (c) { return c.getAttribute('aria-pressed') === 'true'; }).reduce(function (a, c) { return a + +c.getAttribute('data-hours'); }, 0); }
      cards.forEach(function (c) { c.addEventListener('click', function () { sync(); if (navigator.vibrate && phone.matches && !reduceMotion) { try { navigator.vibrate(8); } catch (e) {} } }); });
      sync();
    }
  }

  /* ---- Demo: four featured businesses first, the rest behind "More industries" ---- */
  function initDemoMore() {
    var box = $('[data-chat-demo]'), tabs = box && $('.chat-tabs', box), more = tabs && $('.chat-more', tabs); if (!more) return;
    function open(on) { tabs.classList.toggle('is-open', on); more.setAttribute('aria-expanded', on ? 'true' : 'false'); more.textContent = on ? 'Fewer industries' : 'More industries'; }
    more.addEventListener('click', function () {
      var on = !tabs.classList.contains('is-open'); open(on);
      if (on) { var first = $('.is-extra', tabs); if (first) first.focus(); }
    });
    // the tablet inbox can pick any conversation: keep the matching tab visible
    box.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-convo]'); if (!b || b.parentNode === tabs) return;
      var t = $('[data-convo="' + b.getAttribute('data-convo') + '"]', tabs); if (t && t.classList.contains('is-extra')) open(true);
    });
  }

  /* ---- Effects bootstrap (below-fold canvases start only when near viewport) -- */
  function initEffects() {
    var FX = window.NextGenFX; if (!FX) return;
    var hero = $('#heroVisual'); if (hero) FX.initHero(hero);
    $$('canvas.bg-canvas').forEach(function (c) {
      if (!('IntersectionObserver' in window)) { FX.ambient(c); return; }
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); FX.ambient(c); } }, { rootMargin: '300px' });
      io.observe(c);
    });
  }

  /* ---- Pause decorative CSS loops while their section is off-screen --------- */
  function initOffscreenPause() {
    if (!('IntersectionObserver' in window) || reduceMotion) return;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { e.target.classList.toggle('is-off', !e.isIntersecting); });
    }, { rootMargin: '120px' });
    $$('.hero, .marquee, .offer, .showcase, .bento, .hub, .flow, .cta-section, .footer-mark, .steps').forEach(function (el) { io.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    // v6 (reference-led redesign): no cursor glow/ring, card tilt, magnetic buttons or hero parallax; motion is scroll reveals only
    applyConfig(); initNav(); initSubnav(); initSplitText(); initReveal();
    initFilters(); initFaq(); initPricing(); initForm(); initProgress(); initSteps(); initShowcase(); initEffects();
    initSvcList(); initSliders(); initOwnerRoi(); initTabs(); initTeamBuilder(); initSectionNav(); initPointerFx(); initPhoneUx(); initProof(); initChatDemo(); initDemoMore(); initTaskCounter(); initGlobe(); initHero3D(); initLiveFeed();
    initFlows(); initEstimator(); initRoi(); initHub(); initOffscreenPause();
  });
})();
