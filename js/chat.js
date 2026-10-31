/* ==========================================================================
   NextGen AI Labs — chat.js (shared by every public page; load after main.js)
   Floating chat button + panel. Replies come from the set answers below, using
   the live prices in CONFIG (window.NGA_CONFIG), so nothing is invented.
   To use a real AI service later, replace the body of getReply() only.
   Styles: "V33: chat" in css/style.css.
   ========================================================================== */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var CONFIG = window.NGA_CONFIG || {}, P = CONFIG.packages || {};
  var root = document.documentElement, body = document.body;
  var fullScreen = window.matchMedia('(max-width: 575.98px)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EMAIL = CONFIG.email || 'sales@nextgenailabs.com';

  function money(n) { return '$' + Number(n).toLocaleString('en-US'); }
  function plan(k) { return P[k] ? money(P[k].setup) + ' setup, then ' + money(P[k].monthly) + ' a month' : ''; }
  function waUrl() { return 'https://wa.me/' + (CONFIG.whatsappNumber || '') + '?text=' + encodeURIComponent('Hi, I have a question about NextGen AI Labs'); }

  var BOOK = { label: 'Book a free consultation', href: 'contact.html#enquiry' };
  var PRICING = { label: 'See all pricing', href: 'pricing.html' };
  function waLink() { return { label: 'Chat on WhatsApp', href: waUrl(), external: true }; }

  // Checked in order; the first matching pattern answers.
  var ANSWERS = [
    { re: /\b(human|person|agent|someone|call me|talk to|speak|staff|team member)\b/i, text: function () { return 'Of course. You can reach our team on WhatsApp, or email ' + EMAIL + '.'; }, links: function () { return [waLink(), BOOK]; } },
    { re: /\b(receptionist|voice|phone calls?|answer calls?|missed calls?)\b/i, text: function () { return 'Our AI Receptionist answers calls, books appointments and sends you a summary. It costs ' + plan('voice') + ', with up to 500 call minutes a month.'; }, links: function () { return [{ label: 'AI voice assistants', href: 'ai-voice-assistant.html' }, BOOK]; } },
    { re: /\b(starter|cheapest|lowest|small budget|basic)\b/i, text: function () { return 'AI Starter is our entry plan: ' + plan('lite') + '. It answers up to 20 common questions and handles up to 300 chats a month.'; }, links: function () { return [PRICING, BOOK]; } },
    { re: /\b(chat ?bots?|website assistant|whatsapp bot)\b/i, text: function () { return 'We build AI chatbots for your website and messaging apps. AI Starter is ' + plan('lite') + ', and AI Chat Assistant is ' + plan('chat') + '.'; }, links: function () { return [{ label: 'AI chatbot development', href: 'ai-chatbot-development.html' }, PRICING]; } },
    { re: /\b(crm|hubspot|zoho|salesforce|lead|leads|follow.?ups?)\b/i, text: function () { return 'We connect your CRM to your website, email and WhatsApp, so leads are added and followed up automatically. The Lead Follow-up Engine is ' + plan('followup') + '.'; }, links: function () { return [{ label: 'CRM automation', href: 'crm-automation.html' }, BOOK]; } },
    { re: /\b(automat\w*|workflow|invoice|invoices|documents?|emails?|reports?)\b/i, text: function () { return 'We automate repetitive work such as email, documents, data entry and reports. The AI Email Assistant add-on is ' + plan('email') + '. Custom work gets a fixed quote after a free consultation.'; }, links: function () { return [{ label: 'Business process automation', href: 'business-process-automation.html' }, BOOK]; } },
    { re: /\b(websites?|web apps?|apps?|online store|e-?commerce|shop)\b/i, text: function () { return 'Yes, we also build websites, online stores and web apps. Websites start from ' + (CONFIG.pricing && CONFIG.pricing.starter ? money(CONFIG.pricing.starter.once) : 'a fixed price') + '.'; }, links: function () { return [{ label: 'Website pricing', href: 'pricing.html#websites' }, { label: 'Our services', href: 'services.html' }]; } },
    { re: /\b(price|prices|pricing|cost|costs|how much|fee|fees|plans?|packages?|budget|expensive)\b/i, text: function () { return 'All prices are in USD. AI Starter is ' + plan('lite') + '. AI Receptionist is ' + plan('voice') + '. Growth Bundle is ' + plan('growth') + '. Limits and scope are confirmed in writing before you pay.'; }, links: function () { return [PRICING, BOOK]; } },
    { re: /\b(how long|timeline|time does|deliver\w*|when can|how soon|live in)\b/i, text: function () { return 'It depends on the plan. AI Starter is usually live in 3 to 5 days, AI Receptionist in 2 to 3 weeks, and Growth Bundle in 3 to 4 weeks. Your written plan confirms the timing.'; }, links: function () { return [BOOK]; } },
    { re: /\b(maintenance|support|updates?|fix)\b/i, text: function () { return 'Maintenance means we check it, fix problems and update it when your details change. It is included free on the AI Receptionist, Lead Follow-up Engine, AI Email Assistant and Growth Bundle.'; }, links: function () { return [PRICING]; } },
    { re: /\b(safe|secure|security|privacy|private|data|nda|own|owner)\b/i, text: function () { return 'We sign an NDA before we start, agree who can access your data, and you own everything we build.'; }, links: function () { return [{ label: 'Privacy policy', href: 'privacy.html' }, BOOK]; } },
    { re: /\b(clinic|hospital|dental|dentist|salon|spa|restaurant|hotel|travel|caribbean|real estate|plumber|industry|industries|my business)\b/i, text: function () { return 'We work with many kinds of business, including clinics, salons, restaurants, travel and real estate. You can see examples for your industry here.'; }, links: function () { return [{ label: 'All industries', href: 'industries.html' }, BOOK]; } },
    { re: /\b(how (does|do) (it|this|you) work|process|get started|start|first step|steps)\b/i, text: function () { return 'It takes four steps: a free call, a written fixed-price plan, we build and connect it, then you test it and we launch and support it.'; }, links: function () { return [BOOK]; } },
    { re: /\b(where are you|location|country|countries|worldwide|time ?zone|india|usa?)\b/i, text: function () { return 'We work remotely with clients worldwide and invoice in USD.'; }, links: function () { return [BOOK]; } },
    { re: /\b(contact|email|whatsapp|reach)\b/i, text: function () { return 'Email us at ' + EMAIL + ' or message us on WhatsApp.'; }, links: function () { return [waLink(), BOOK]; } },
    { re: /\b(thanks|thank you|thx|great|perfect|ok|okay)\b/i, text: function () { return 'You are welcome. Is there anything else you would like to know?'; }, links: function () { return []; } },
    { re: /\b(hi|hello|hey|hii|namaste)\b/i, text: function () { return 'Hello! Ask me about prices, AI chatbots, voice assistants or automation.'; }, links: function () { return []; } }
  ];
  var QUICK = ['What does it cost?', 'Do you build AI chatbots?', 'How long does it take?', 'Talk to a person'];

  function getReply(question) {
    for (var i = 0; i < ANSWERS.length; i++) {
      if (ANSWERS[i].re.test(question)) return { text: ANSWERS[i].text(), links: ANSWERS[i].links() };
    }
    return { text: 'I do not have a set answer for that yet, and I do not want to guess. Our team can help you directly.', links: [waLink(), BOOK] };
  }

  /* ---- Markup ---------------------------------------------------------- */
  var dock = document.createElement('div'); dock.className = 'fab-dock';
  var wa = $('.wa-float'); if (wa) dock.appendChild(wa);
  var openBtn = document.createElement('button');
  openBtn.type = 'button'; openBtn.className = 'chat-fab'; openBtn.setAttribute('aria-label', 'Open chat'); openBtn.setAttribute('aria-expanded', 'false'); openBtn.setAttribute('aria-controls', 'chat-panel');
  openBtn.innerHTML = '<i class="bi bi-chat-dots-fill" aria-hidden="true"></i>';
  dock.appendChild(openBtn);

  var panel = document.createElement('section');
  panel.id = 'chat-panel'; panel.className = 'chat-panel'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-labelledby', 'chat-title');
  panel.innerHTML = '<header class="chat-head"><span class="chat-id"><b id="chat-title">NextGen AI Labs</b><small>Automated assistant · set answers</small></span>' +
    '<button type="button" class="chat-close" aria-label="Close chat"><i class="bi bi-x-lg" aria-hidden="true"></i></button></header>' +
    '<div class="chat-log" role="log" aria-live="polite" aria-label="Chat messages" tabindex="0"></div>' +
    '<div class="chat-quick" role="group" aria-label="Suggested questions"></div>' +
    '<form class="chat-form" autocomplete="off"><label class="visually-hidden" for="chat-input">Type your question</label>' +
    '<input id="chat-input" class="chat-input" type="text" maxlength="300" enterkeyhint="send" placeholder="Type your question…">' +
    '<button type="submit" class="chat-send" aria-label="Send message"><i class="bi bi-send-fill" aria-hidden="true"></i></button></form>';
  body.appendChild(dock); body.appendChild(panel);

  var log = $('.chat-log', panel), quick = $('.chat-quick', panel), form = $('.chat-form', panel), input = $('.chat-input', panel), closeBtn = $('.chat-close', panel);
  var started = false, isOpen = false, locked = false, lockY = 0, inerted = [];

  /* ---- Messages -------------------------------------------------------- */
  function toEnd() { log.scrollTop = log.scrollHeight; }
  function addMsg(text, who, links) {
    var m = document.createElement('div'); m.className = 'chat-msg chat-msg--' + who;
    var p = document.createElement('p'); p.textContent = text; m.appendChild(p);
    (links || []).forEach(function (l) {
      var a = document.createElement('a'); a.className = 'chat-link'; a.href = l.href; a.textContent = l.label;
      if (l.external) { a.target = '_blank'; a.rel = 'noopener'; }
      m.appendChild(a);
    });
    log.appendChild(m); toEnd();
  }
  function ask(q) {
    q = q.trim().slice(0, 300); if (!q) return;
    addMsg(q, 'user'); quick.hidden = true;
    var r = getReply(q);
    setTimeout(function () { addMsg(r.text, 'bot', r.links); }, reduceMotion ? 0 : 350);
  }
  QUICK.forEach(function (q) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'chat-chip'; b.textContent = q;
    b.addEventListener('click', function () { ask(q); }); quick.appendChild(b);
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); input.value = ''; });

  /* ---- Full-screen phones: stop the page scrolling and hide it from keyboards and screen readers ---- */
  function lock(on) {
    if (on === locked) return; locked = on;
    if (on) {
      lockY = window.pageYOffset; root.style.setProperty('--chat-lock-top', -lockY + 'px'); body.classList.add('chat-locked');
      inerted = Array.prototype.slice.call(body.children).filter(function (el) { return el !== panel && el.tagName !== 'SCRIPT' && !el.inert; });
      inerted.forEach(function (el) { el.inert = true; });
    } else {
      body.classList.remove('chat-locked'); root.style.removeProperty('--chat-lock-top');
      inerted.forEach(function (el) { el.inert = false; }); inerted = [];
      window.scrollTo({ top: lockY, behavior: 'instant' });
    }
  }
  // dvh ignores the iPhone keyboard, so the panel follows the visible area instead
  function fitViewport() {
    var vv = window.visualViewport;
    if (isOpen && fullScreen.matches && vv) {
      root.style.setProperty('--chat-vh', vv.height + 'px'); root.style.setProperty('--chat-top', vv.offsetTop + 'px'); toEnd();
    } else { root.style.removeProperty('--chat-vh'); root.style.removeProperty('--chat-top'); }
  }
  function applyMode() {
    if (isOpen) { lock(fullScreen.matches); panel.setAttribute('aria-modal', fullScreen.matches ? 'true' : 'false'); }
    fitViewport();
  }

  /* ---- Open and close -------------------------------------------------- */
  function setOpen(on) {
    if (on === isOpen) return; isOpen = on;
    panel.hidden = !on; body.classList.toggle('chat-open', on);
    openBtn.setAttribute('aria-expanded', on ? 'true' : 'false'); openBtn.setAttribute('aria-label', on ? 'Close chat' : 'Open chat');
    $('i', openBtn).className = 'bi ' + (on ? 'bi-x-lg' : 'bi-chat-dots-fill');
    if (on && !started) { started = true; addMsg('Hi! I am an automated assistant with set answers. Ask me about prices, AI chatbots or automation, or ask for a person at any time.', 'bot'); }
    applyMode();
    if (on) {
      // touch screens: don't pop the keyboard up over the first message
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) input.focus({ preventScroll: true }); else closeBtn.focus({ preventScroll: true });
      toEnd();
    } else { lock(false); fitViewport(); openBtn.focus({ preventScroll: true }); dodge(); }
  }
  openBtn.addEventListener('click', function () { setOpen(!isOpen); });
  closeBtn.addEventListener('click', function () { setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) setOpen(false); });
  input.addEventListener('focus', function () { setTimeout(fitViewport, 300); });
  if (fullScreen.addEventListener) fullScreen.addEventListener('change', applyMode);
  if (window.visualViewport) { window.visualViewport.addEventListener('resize', fitViewport); window.visualViewport.addEventListener('scroll', fitViewport); }
  window.addEventListener('orientationchange', fitViewport);

  /* ---- Step aside when the buttons would sit on a form button or footer link ---- */
  var targets = $$('.form-nx button[type="submit"], .footer a'), ticking = false;
  function dodge() {
    ticking = false;
    var d = dock.getBoundingClientRect(), hit = !isOpen && targets.some(function (el) {
      var r = el.getBoundingClientRect();
      return r.width && r.left < d.right && r.right > d.left && r.top < d.bottom && r.bottom > d.top;
    });
    dock.classList.toggle('is-dodging', hit);
  }
  function queue() { if (!ticking) { ticking = true; requestAnimationFrame(dodge); } }
  window.addEventListener('scroll', queue, { passive: true }); window.addEventListener('resize', queue); dodge();
})();
