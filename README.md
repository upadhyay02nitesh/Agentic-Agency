# Next Gen AI Infotech — Website

A static website for **Next Gen AI Infotech**, a digital solutions company: business and corporate websites, landing pages, e-commerce, custom web apps, AI and generative-AI integration, chatbots and agents, WhatsApp Business, CRM and API integration, workflow automation, maintenance and SEO foundations. For Indian and international clients.

Stack: HTML5, CSS3, vanilla JavaScript, Bootstrap 5 (grid + navbar collapse only), Bootstrap Icons, Google Fonts (Montserrat). No build step, no WebGL.

## Run it

Double-click `index.html`, or serve the folder:

```bash
python -m http.server 8080      # then open http://localhost:8080
```

Bootstrap, icons and the font load from CDNs, so you need internet.

## Pages and structure

```
index.html          Home: hero, tech marquee, services (numbered panel), automation demo, work slider, industries,
                    why us, 7-step process, technology & integrations, estimator, FAQ, enquiry form
services.html       Services in detail          ai-automation.html  AI agents, demo, ROI calculator
integrations.html   CRM / ERP integration hub   enterprise.html     Engagement models, security, SLAs
work.html           Filterable sample concepts  pricing.html        Packages, estimator, FAQ
about.html  contact.html (enquiry panel)  privacy.html  terms.html
css/style.css       1 tokens · 2 base · 3 layout · 4 components · 5 sections · 6 motion · 7 media · 8 V5 · 9 V6 (last, overrides)
js/main.js          CONFIG + all UI behaviour
js/effects.js       Not loaded since v6 (the old Three.js hero). Kept only for reference; safe to delete.
```

## V6 redesign (reference-led)

The whole site was redesigned after the visual language of the reference site **webstart.am/en**, adapted to our own
brand and content. The colours and fonts below were **measured from the reference's computed styles in Chrome**, not guessed:
page `#000`, panels `#fff`, panel tints `#fdf5fe` / `#f6f5f8`, dark cards `#111` / `#2a2a2a`, accent `rgb(255,41,208)` = `#ff29d0`,
muted text `#848385`, ink `#0e0f11`, font Montserrat (Bold uppercase headings), 20px-radius uppercase buttons.

- **Layout signature:** black page with large white rounded panels (40px radius) for Services, Work, Process, the enquiry form and every inner-page closing CTA. Components inside a panel switch to dark-on-light automatically through the `.is-light` token scope.
- **Header:** logo + wordmark, small uppercase links (Services · Solutions ▾ · Our Work · Pricing · About Us · Contact), magenta "Start a project" CTA. "Solutions" is an accessible disclosure dropdown (click / Enter, Escape, outside click); on phones it is listed open in the full-screen menu.
- **Hero:** "Build smarter digital experiences with AI", hairline grid background, interface mockups (inline SVG). The glowing Three.js network, orbit icons, aurora, cursor glow/ring, card tilt, magnetic buttons, grain and intro curtain were removed.
- **Services:** 9 numbered rows (`01.` … `09.`) with centred uppercase titles and round icons; each opens to a description, a business benefit and a link. Content is visible without JS.
- **Work:** slider of four **representative concepts** (clearly labelled, not client projects). Native scroll-snap + prev / next + progress bar + arrow keys.
- **Industries, Why us, Technology:** six industry cards with photos, eight "how we work" cards, eight capability cards and a tool list with a "no partnership implied" note. No invented clients, logos, ratings, testimonials, awards or statistics; the reference's awards / logos / testimonials sections were deliberately left out.
- **FAQ:** the 10 questions from the brief, with FAQPage JSON-LD.
- **Enquiry form** (home `#contact`, contact page `#enquiry`): full name, business email, phone (international, 7–15 digits), company (optional), service, budget (optional), project description. Inline validation, `aria-invalid` + error text, loading state, double-submit guard. Success is shown only after a real send (`submitMethod: 'service'`), and the default `'mailto'` route says the email app is opening rather than claiming success.
- **Mockup / SVG colours:** every navy hex in the inline SVGs was remapped to the new palette (blue → violet `#8b5cf6`, saffron → magenta, navy → near-black). Photos get a CSS `saturate(.6)` to neutralise the old navy grade.

## Design tokens (`:root` in `css/style.css`)

Change colours **only** in the token block. Token *names* were kept from v5 (e.g. `--cyan`, `--saffron` now both resolve to the magenta accent) so every component re-skins from one place.

| Token | Value | Contrast | Used for |
|-------|-------|----------|----------|
| `--bg` / `--surface` / `--surface-2` | `#000` / `#111` / `#1c1c1e` | | Page, dark cards, raised cards |
| `--panel` / `--panel-pink` / `--panel-grey` | `#fff` / `#fdf5fe` / `#f6f5f8` | | White panels and their inner cards |
| `--text` / `--muted` / `--faint` (dark) | `#fff` / `#bdbcc0` / `#8e8d91` | 21 / 11.6 / 6.4 : 1 on black | Headings / body / captions |
| `--text` / `--muted` / `--faint` (in `.is-light`) | `#0e0f11` / `#47464a` / `#646367` | 19 / 9.3 / 5.9 : 1 on white | Same roles inside panels |
| `--accent` | `#ff29d0` | 6.5 : 1 on black | Buttons, eyebrows, links, focus ring, active states |
| `--accent-ink` | `#c4009c` | 5.5 : 1 on white | Magenta text on white panels |
| `--on-saffron` | `#0e0f11` | 5.8 : 1 on magenta | Button text |
| `--violet` | `#8b5cf6` | | Mockup art only |
| `--radius-btn` / `--radius-lg` / `--radius-xl` | 22 / 24 / 40px | | Buttons / cards / panels |

**One deliberate difference from the reference:** it uses white text on `#ff29d0` (about 3 : 1, below WCAG AA for small text). We use near-black text on the same magenta (5.8 : 1).

Font: **Montserrat** 400–800 from Google Fonts with a metric-matched Arial fallback (`Montserrat Fallback`) to avoid layout shift. The self-hosted Inter / Space Grotesk files in `assets/fonts/` are no longer used.

## Before you deploy: details only you can supply

The site is deploy-ready as is. Anything that needs your details is **hidden until you fill it in**, so nothing looks unfinished. Edit `js/main.js` → `CONFIG`:

| Key | Effect once filled |
|-----|--------------------|
| `whatsappNumber` | **Do this first.** Digits with country code, e.g. `919876543210`. Until set, WhatsApp buttons go to the contact page. |
| `phone` | Shows all Call buttons (mobile bar, menu, hero, footer, contact page). |
| `email`, `address` | Show in the footer and on the contact page. |
| `social` | LinkedIn / Instagram / GitHub icons appear only for URLs you set. |
| `pricing` | Package prices. **Current numbers are sample values**; set your real ones. |
| `startingAt` | "Starting at ₹X" appears on a service card only when you set it. |
| `delivery`, `whatsappMessage` | Delivery time text and the default WhatsApp message. |
| `formEmail` | Inbox that receives form enquiries (sent through FormSubmit, not shown on the page). **First submission after deploy:** FormSubmit emails an activation link to this address; click it once. To switch to Formspree / EmailJS / your own API, edit `submitInquiry()` in `js/main.js`. |

**Domain:** replace `https://www.example.com` with your real domain in every page's `canonical` / `og:` tags / JSON-LD, plus `robots.txt` and `sitemap.xml` (a find-and-replace across the folder does it).

**Also check:** the FAQ answers and delivery claims match how you actually work, and have `privacy.html` / `terms.html` (templates) reviewed. Portfolio items are labelled as samples; swap in real projects when you have them. There are intentionally **no** testimonials, client logos or ratings. Add real ones only with permission.

## SEO

`lang="en-IN"`, unique titles and descriptions, Open Graph + Twitter tags, canonical placeholders, `ProfessionalService` (LocalBusiness-style) JSON-LD, `FAQPage` JSON-LD, one H1 per page, semantic landmarks, skip link, ARIA labels.

## Performance notes

Mobile and low-end devices skip Three.js and use the lite 2D canvas. Below-the-fold canvases start only near the viewport. Animation loops pause when off-screen or the tab is hidden. Fonts use `display=swap` and CDNs are preconnected. There are no raster images (all visuals are SVG/CSS), so there is no layout shift from images.

## Notes

- The flag in "Made in India 🇮🇳" is an emoji; Windows shows "IN" instead of a flag. Phones, macOS and Linux show the flag.
- I verified the layout in headless Chrome at desktop and phone widths. A Lighthouse run on your real deployment is still worth doing.

## V5 premium pass (what changed)

- **Palette + contrast:** new tokens above; every hard-coded colour in CSS, inline SVG and `effects.js` mapped to them. Primary button text went from 3.9:1 to 5.2:1; control borders from ~1.8:1 to 3.6:1. Saffron is now reserved for prices, the main CTA and highlights.
- **Hero:** "Indian & global businesses", AI-first badge, rotating "We build…" list covering all development types, and an affordability line built from `CONFIG` (Websites from ₹X, AI automation from ₹Y; change the numbers in `CONFIG.pricing` / `CONFIG.estimator`).
- **3D hero (desktop):** "AI network": neurons that fire (shader points) and synapses carrying travelling signal pulses (shader lines), colours from the tokens, additive glow without postprocessing. Three.js now loads when the browser is idle. Phones / low-end keep the 2D canvas (now with firing nodes and pulses); reduced motion keeps the static frame.
- **Accessibility:** automation tabs and the integration hub are proper ARIA tabs (arrow keys, Home/End, one tab stop); the hub's auto-tour pauses on hover/focus and has a Pause button; quieter live regions (ROI announces once after a slider settles, the flow log announces only runs you start); `color-scheme: dark`; no more `transition: all`; focus isn't hidden behind the mobile bar; Work page heading order fixed.
- **Motion:** the automation demo is the one orchestrated moment (node ping, data packets crossing connectors, typed log with caret); estimator result gives a 180 ms change cue. CSS / WAAPI only, no GSAP (it would add ~70 KB for no visible gain). Decorative loops pause when their section is off-screen.
- **Responsive:** no horizontal overflow at 360–1440 px (the `g-5` gutters overhung phone screens); SLA table has sticky row labels and a swipe hint on phones; hub labels fit on small phones; estimator options use a 2-column grid on phones; fixed estimator text sizes that `.card-nx p` was overriding.
- **Edge cases:** ROI no longer shows ₹0 for tiny values; very long contact messages are shortened in the email link (links over ~2,000 characters fail silently in some email apps); name and message have `maxlength`.
- **Performance:** CLS measured at 0.00 on every page (was up to 0.22, caused by font swap re-wrapping headings); hero price line is in the HTML so it doesn't shift the page.
- **Photography:** 53 CC0 photos from StockSnap (via Openverse) plus 9 small marquee chips, graded to the navy palette, WebP, under 1 MB in total (each page loads only its own; below-the-fold ones are lazy-loaded). Home: dark city photo behind the hero, photo chips in the industries marquee, photo in the free-consultation banner, thumbnails in "Every screen", a photo layer under each of the 8 service scenes, photos on the capability cards, industry tiles and section heads. Every other page: page-hero photo, section photos and a background photo in the closing call-to-action. Larger photos carry a "Stock photo (CC0)" caption; none show your team, office or clients.

| File (`assets/images/photos/`) | Source (CC0) |
|---|---|
| `ind-restaurant.webp` | [Restaurant Kitchen](https://stocksnap.io/photo/restaurant-kitchen-0HCMIT272C) |
| `ind-clinic.webp` | [Doctor Mask](https://stocksnap.io/photo/doctor-mask-GWE6UQDBTN) |
| `ind-coaching.webp` | [Student School](https://stocksnap.io/photo/student-school-1KOT8HDPAX) |
| `ind-realestate.webp` | [Woodpaneling House](https://stocksnap.io/photo/woodpaneling-house-582053B25E) |
| `ind-d2c.webp` | [Ecommerce Shopping](https://stocksnap.io/photo/ecommerce-shopping-RZWM4T2UAD) |
| `ind-fitness.webp` | [Weights Dumbbells](https://stocksnap.io/photo/weights-dumbbells-QP7WI19WFG) |
| `ind-legal.webp` | [Business Document](https://stocksnap.io/photo/business-document-AB4F938C85) |
| `ind-manufacturing.webp` | [Factory Automotive](https://stocksnap.io/photo/factory-automotive-2PJ81W5Q7X) |
| `ind-startup.webp` | [Macbook Laptop](https://stocksnap.io/photo/macbook-laptop-LEJ7HJ5BEA) |
| `about-workspace.webp` | [Code Coding](https://stocksnap.io/photo/code-coding-FSPLFPQBCZ) |
| `enterprise-planning.webp` | [Team Meeting](https://stocksnap.io/photo/team-meeting-VQXYE2ZEHC) |
| `ai-network.webp` | [Technology Network](https://stocksnap.io/photo/technology-network-PN7RVGLUUD) |
| `integrations-devices.webp` | [Phone Hand](https://stocksnap.io/photo/phone-hand-OMHRCBTI8N) |
| `services-workspace.webp` | [Laptop Desk](https://stocksnap.io/photo/laptop-desk-JCXQS3IVWD) |
| `work-wireframes.webp` | [Office Work](https://stocksnap.io/photo/office-work-42H3JH8QI5) |
| `pricing-calculator.webp` | [Calculator Numbers](https://stocksnap.io/photo/calculator-numbers-VVXW9WBTB8) |
| `contact-phone.webp` | [Mobile Smartphone](https://stocksnap.io/photo/mobile-smartphone-DLITZEAVJJ) |
| `cap-ai.webp` | [Robot Technology](https://stocksnap.io/photo/robot-technology-WUBMLJRYEK) |
| `cap-integrations.webp` | [Ethernet Cables](https://stocksnap.io/photo/ethernet-cables-B4I4XD7WY4) |
| `cap-platform.webp` | [Code Technology](https://stocksnap.io/photo/code-technology-9OQTUSUS0M) |
| `cap-cloud.webp` | [Servers Woman](https://stocksnap.io/photo/servers-woman-ZYGIOUX4QU) |
| `how-wireframe.webp` | [Design Wireframe](https://stocksnap.io/photo/design-wireframe-20VFXOOUWG) |
| `about-code.webp` | [Coding Programming](https://stocksnap.io/photo/coding-programming-PBTF1NEBCG) |
| `about-plan.webp` | [Whiteboard Post-Itnotes](https://stocksnap.io/photo/whiteboard-post-itnotes-YR89OQFMT1) |
| `ai-messaging.webp` | [Man Browsing](https://stocksnap.io/photo/man-browsing-U039DBUOV1) |
| `ai-paperwork.webp` | [Filefolders Business](https://stocksnap.io/photo/filefolders-business-6RHKEELJ8F) |
| `ai-keys.webp` | [Key Lock](https://stocksnap.io/photo/key-lock-SZE0NDYC0F) |
| `ai-start.webp` | [Lifestyle Office](https://stocksnap.io/photo/lifestyle-office-BHPWRL9YQ7) |
| `int-dashboard.webp` | [Business Working](https://stocksnap.io/photo/business-working-PHE63L27S6) |
| `int-hardware.webp` | [Computer Ram](https://stocksnap.io/photo/computer-ram-52KJ8KZGWY) |
| `int-analytics.webp` | [Macbook Laptop](https://stocksnap.io/photo/macbook-laptop-DUAHA1V312) |
| `ent-discussion.webp` | [Business People](https://stocksnap.io/photo/business-people-DUXISHKTT3) |
| `ent-proposal.webp` | [Office Work](https://stocksnap.io/photo/office-work-UP9J4EZYNJ) |
| `ent-meeting.webp` | [Business Team](https://stocksnap.io/photo/business-team-V8NHXQVQ70) |
| `ent-security.webp` | [Padlock Gate](https://stocksnap.io/photo/padlock-gate-2CIM1SFTOK) |
| `ent-planning.webp` | [Woman Business](https://stocksnap.io/photo/woman-business-NJP1LFA6EW) |
| `hero-city.webp` | [Cityscape Skyline](https://stocksnap.io/photo/cityscape-skyline-KDOIQSH4ZW) |
| `offer-phone.webp` | [Iphone Smartphone](https://stocksnap.io/photo/iphone-smartphone-ODN23L0AC9) |
| `sc-web.webp` | [Macbook Computer](https://stocksnap.io/photo/macbook-computer-6UHHE19YG7) |
| `sc-store.webp` | [Woman Mobile](https://stocksnap.io/photo/woman-mobile-Q93BUD2Z3Z) |
| `sc-app.webp` | [Apps Smartphone](https://stocksnap.io/photo/apps-smartphone-XLCKX6HJKD) |
| `sc-dash.webp` | [Seo Ppc](https://stocksnap.io/photo/seo-ppc-9699Y6WKLD) |
| `svc-web.webp` | [Macbook Laptop](https://stocksnap.io/photo/macbook-laptop-F7OLW2SG0C) |
| `svc-store.webp` | [People Girl](https://stocksnap.io/photo/people-girl-R33KBON2SV) |
| `svc-ads.webp` | [Market Graph](https://stocksnap.io/photo/market-graph-5T50IEAQHE) |
| `svc-apps.webp` | [Macbook Laptop](https://stocksnap.io/photo/macbook-laptop-UNB7V2H5L4) |
| `svc-mobile.webp` | [Writing Paper](https://stocksnap.io/photo/writing-paper-J6YJ4W3B48) |
| `svc-seo.webp` | [Travel Map](https://stocksnap.io/photo/travel-map-0JXPKD87MQ) |
| `svc-whatsapp.webp` | [News Newspaper](https://stocksnap.io/photo/news-newspaper-OJXHDWMWV9) |
| `svc-maint.webp` | [Macbook Laptop](https://stocksnap.io/photo/macbook-laptop-R66E2T133W) |
| `cta-handshake.webp` | [Work Business](https://stocksnap.io/photo/work-business-J5LXKNDREC) |
| `genai-code.webp` | Code Coding | https://stocksnap.io/photo/FSPLFPQBCZ | CC0 |
| `global-remote.webp` | Macbook Laptop | https://stocksnap.io/photo/7ULJ7GRFDB | CC0 |

`chip-*.webp` are 48 px crops of the `ind-*.webp` photos.

**Still yours to fill (proof for enterprise bids):** real case studies with outcomes, named team members with experience, client references, and any certifications you actually hold. The site has clearly marked slots for these and makes no invented claims.

**Not verified:** real devices (only headless Chrome with a software GPU), Safari/iOS rendering of the WebGL shaders, and a Lighthouse run on the live domain.
