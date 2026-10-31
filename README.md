# NextGen AI Labs — Website

A static website for **NextGen AI Labs**, a digital solutions company: business and corporate websites, landing pages, e-commerce, custom web apps, AI and generative-AI integration, chatbots and agents, WhatsApp Business, CRM and API integration, workflow automation, maintenance and SEO foundations. For Indian and international clients.

Stack: HTML5, CSS3, vanilla JavaScript, Bootstrap 5 (grid + navbar collapse only), Bootstrap Icons, Google Fonts (Montserrat). No build step, no WebGL.

## Run it

Serve the folder (needed for the self-hosted font; opening files directly shows a fallback font):

```bash
python -m http.server 8080      # then open http://localhost:8080
```

Bootstrap (CSS + JS) and Bootstrap Icons are self-hosted in `assets/vendor/`, Montserrat in `assets/fonts/`; GSAP loads from cdnjs only on desktop when the presentation starts; Three.js is self-hosted (`assets/vendor/three.module.min.js`) and loaded only for the 3D globe.

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

## V7 homepage: scroll-driven presentation for business owners

The homepage reads like a pitch deck: one idea per screen, plain English, no jargon in headlines.

1. **Hero:** "We build AI employees that work 24/7 for your business." Tasks (email, call, invoice, lead…) fly into a glowing AI core and come out done (CSS only).
2. **Your day today vs. with AI** (`#day`): a pinned split screen; rows light up as the day plays and a counter climbs to ~25 hours/week.
3. **Eight automation slides** (`#showcase`): chatbot, voice receptionist, lead follow-up, booking, invoices & paperwork, reviews, owner reports, websites. Each follows the same beats: problem → what we build → diagram that draws itself → result numbers + "Perfect for". Slide dots + `03 / 08` counter, ← / → keys.
4. **How we work** (`#how`): four steps on a path that fills as you scroll, plus time-zone overlap, fixed price, NDA and ownership.
5. **Savings calculator** (`#savings`): hours, hourly cost, missed leads and customer value → monthly value; labelled as an estimate with its assumptions (60% of repetitive hours, 30% of missed leads).
6. **Industry tabs** (`#industries`): clinics, real estate, e-commerce, restaurants, agencies, home services.
7. **Proof** (`#proof`): hidden until you add real entries to `CONFIG.proof` in `js/main.js`.
8. **FAQ** for non-technical owners (with FAQPage JSON-LD). 9. **Final CTA + enquiry form:** "Let's find your first 10 hours to automate."

**How it behaves:** `js/present.js` uses GSAP 3.12.5 + ScrollTrigger (cdnjs) and runs only on desktop (≥ 992px) with motion allowed. It is built on the first scroll, key or touch, so page load stays light. Phones, `prefers-reduced-motion` and no-JS get static stacked cards with every word visible; numbers count up once on view. The technical sections (GenAI engineering, tools) moved to `ai-automation.html` and `integrations.html`; jargon headings site-wide were rewritten in plain English, and "CRM" has a tooltip where it appears.

**Measured (local, Lighthouse 12, desktop):** performance 95, accessibility 100, best practices 100, SEO 100; TBT 0 ms, LCP 1.1 s, CLS 0.001.

**Placeholders to fill (all in `js/main.js` → `CONFIG`):** `bookingUrl` (all "Book a free call" buttons switch to it), `proof.results / testimonials / logos` (real, with permission), `founder`. Every number on the slides and in the day timeline is labelled as an **example**; replace them with real client numbers as you get them (edit the `SLIDES` / `DAY` lists, or the HTML in `index.html`).

## V8: packages and industry landing pages

- **AI packages** (`#packages` on the homepage and at the top of `pricing.html`): AI Chat Assistant, AI Receptionist, Lead Follow-up Engine and Growth Bundle, each with a setup price, a monthly plan, what is included and time to launch. **Prices are sample values:** set your real ones in `CONFIG.packages` in `js/main.js`; the page updates every `data-pkg` price from there. Website packages moved below on the pricing page (`pricing.html#websites`).
- **Industry landing pages:** `ai-for-clinics.html`, `ai-for-home-services.html`, `ai-for-real-estate.html`. Each one has pains, four automations, an example week (labelled), a recommended package, an industry FAQ (with FAQPage JSON-LD) and a call-to-action. They are linked from the header's Solutions menu ("By industry"), the footer's Industries column, the homepage industry tabs and `sitemap.xml`. Use them as the landing page for cold emails and ads aimed at each niche.
- **Font:** Montserrat is self-hosted (variable 400–800, latin + latin-ext) and preloaded, replacing the Google Fonts request. This removed a font-swap layout shift on long headings.
- **Measured (local http, Lighthouse 12, desktop):** home 97 / 100 / 100 / 100, real-estate page 96 / 100 / 100 / 100; CLS 0.

## V9: every industry, plain English, maintenance included

- **Packages explained for non-technical buyers:** each plan opens with one plain sentence ("A receptionist that picks up every call…") and ends with "What you’ll notice". **Maintenance is included free** on the AI Receptionist, Lead Follow-up Engine and Growth Bundle (plans 2–4), and a box explains in plain words what maintenance means. The AI Chat Assistant lists maintenance as an add-on.
- **"What is an AI employee?"** on the homepage: three steps (it listens → it knows your business → it acts, then tells you) plus a simple staff-vs-AI comparison.
- **Seven industry pages:** hospitals, dental & medical clinics, Caribbean hotels/villas/tours, beauty salons & spas, restaurants, real estate and home services. Each opens with an "In plain words" summary and has a **"What the research says"** box with linked sources.
- **All-industries hub** (`industries.html`): 32 kinds of business in 8 groups (health, travel & hospitality, beauty & fitness, home services, professional services, property, retail, education & more), plus a "Don’t see your business?" section explaining the four jobs every business has.
- **Research used** (only well-sourced findings): Harvard Business Review, "The Short Life of Online Sales Leads" (2011); Cochrane review of mobile phone appointment reminders; a 14-hospital reminder trial (npj Digital Medicine, 2020); Caribbean Hotel & Tourism Association Direct Booking Summit (2025). Vendor-only statistics (for example "62% of calls go unanswered") were deliberately left out.
- **Measured (local http, Lighthouse 12, desktop):** home 98, hub 99, Caribbean page 99 performance; 100 accessibility, best practices and SEO on all three; CLS 0.

## V10–V11: homepage that explains and attracts

- **Industry strip** under the hero: a slow marquee of 18 business types with a link to all industries.
- **Live conversation demo** inside "What is an AI employee?": a phone where demo conversations (salon booking at 9:40 PM, clinic reschedule, hotel transfer at 2:13 AM) type themselves out with a typing indicator. Runs only while on screen; reduced motion and no-JS show the full conversation. Names are made up and labelled as a demo.
- **"What’s costing you the most time?"** picker: seven everyday problems (missed calls, cold leads, no-shows, repeat questions, paperwork, reviews, a website that doesn’t sell). Each shows the customer’s words, three plain steps for how we help, what changes, the recommended plan with its price and links to book or to see how it works. Swipeable row on phones; arrow keys work.
- **Hero animation:** tasks fly in along light beams, fade before the core (no pile-up), come out done along magenta beams; a rotating halo; the core pulses on every task; a demo counter shows tasks handled while the visitor reads (counts the animation, labelled "(demo)").
- **Speed:** Bootstrap and Bootstrap Icons are self-hosted (no extra domains before first paint), the icon CSS loads without blocking and icons reserve their 1em box. Measured with compression (Lighthouse 12): mobile 85 performance (FCP 2.6 s, CLS 0.009), desktop 99; accessibility, best practices and SEO 100 on both.

## V12: compact homepage + AI email assistant

- Tighter hero (smaller headline, less padding; hero and industry strip fit one screen), tighter section spacing and a ~30% shorter conversation demo.
- **AI email assistant:** new 9th solution slide, a "Drowning in email" choice in the problem picker, a demo email conversation, and an add-on plan (`CONFIG.packages.email`, sample price $990 setup + $99/month, maintenance included) shown under the packages on the homepage and pricing page.
- The conversation demo now has **10 businesses** (salon, clinic, hotel, restaurant, real estate, plumber, law firm, gym, online store, email); the industry strip lists 28 business types.

## V13: "Worldwide" section with a 3D globe

- New homepage section `#worldwide` ("One team. Every time zone."): a draggable 3D globe (`js/globe.js`, Three.js r160) with **41 countries in 8 regions** (North America, Caribbean, South America, UK & Europe, Middle East, Africa, Asia, Australia & NZ), pulsing markers, arcs that draw from "Our team" to every market, a tilted orbit ring and labels for the countries facing you. Below it, every country is listed by region, with a note that we work with any country.
- **Honest stats only:** 24/7, 30+ languages, daily overlap with the client’s hours, reply within one business day (from `CONFIG.responseTime`). No "countries served" or "happy clients" counts.
- **Loading:** the globe module and Three.js load only on screens ≥ 768px with WebGL and motion allowed, when the section is near the viewport; it renders only while visible. Everyone else sees a static SVG globe (same markers, real orthographic projection). Country data lives in the `#globe-data` JSON in `index.html`.
- **Speed:** GSAP is no longer in the page head; `present.js` loads it only on desktop when the presentation starts, so phones never download it. Light beams in the hero are off on phones. Lighthouse (compressed): mobile 86, desktop 100; accessibility, best practices, SEO 100.

## V14: 3D hero

- On desktop (≥ 992px, WebGL, motion allowed) `js/hero3d.js` replaces the CSS hero core with a Three.js scene: an animated energy sphere with a fresnel rim and glow, two wireframe shells, three tilted orbit rings with satellites, particle streams spiralling into the core and shooting out, and task chips that orbit in 3D, dive into the core (which pulses) and fly back out as "done" on a higher path. The scene tilts toward the pointer.
- It loads on the first pointer move, scroll or key press, or after 3.5 s, so the first paint stays light; renders only while on screen. Phones, reduced motion and no-WebGL keep the CSS hero.

## V17–V18: SEO for nextgenailabs.com + Guides

- **Domain everywhere:** canonical URLs (homepage canonical is `/`), Open Graph and Twitter tags, JSON-LD, `sitemap.xml` (27 URLs with lastmod and priority) and `robots.txt`. Internal homepage links point to `/`; `vercel.json` redirects `/index.html` to `/`.
- **Titles and descriptions** rewritten for every page (titles ≤ 60 characters, descriptions 140–160) around what owners search for, e.g. "AI Receptionist for Dental & Medical Clinics". Brand spelled consistently as "NextGen AI Labs".
- **Structured data:** Organization, WebSite and ProfessionalService on the homepage; BreadcrumbList on every inner page; Service on industry pages; OfferCatalog with USD prices on pricing; BlogPosting + FAQPage on guides; FAQPage on home, pricing and industry pages.
- **Guides** (`guides.html` + 5 articles): AI receptionist cost, stopping missed calls, reducing no-shows, replying to leads fast, AI chatbots for small business websites. Plain English, sourced research only (HBR, Cochrane, a 14-hospital trial), internal links to the matching service pages. Add one new guide a month to keep growing organic traffic.
- **Also:** new 1200×630 social share image (`assets/images/og-cover.png`), a `404.html` (noindex), and `vercel.json` with caching (fonts/vendor 1 year, images 30 days, CSS/JS 1 hour) and security headers.

## V19: more interaction on the homepage

- **Build your AI team** (`#team`, before the packages): tap any of 7 AI employees; their icons orbit an AI core, hours per week and monthly value count up (example at $35/h), the best plan and price are picked from `CONFIG.packages`, and "Get this team" pre-fills the enquiry form with the chosen team.
- **Section navigator** (desktop ≥ 1200px): dots on the left edge with labels on hover/focus, current section highlighted, appears after the hero. Labels come from `data-nav-label` on each homepage section.
- **Pointer effects** (mouse only, off under reduced motion): a soft magenta spotlight and gentle 3D tilt on dark cards, and magnetic primary buttons.

## V20: phone experience

- On phones the 9 AI-job slides and the 4 packages are **swipe carousels** (scroll-snap, peek of the next card, dots you can tap, a "Swipe →" hint that disappears after the first swipe). Tablets and desktops keep the stacked / pinned layouts.
- **Sticky team summary** on phones while building an AI team ("3 selected · 14 h/week · See your plan"), shown only while the result card is off screen.
- **Touch feedback:** buttons, cards, tabs and FAQ rows press in slightly when tapped; Android phones get a tiny vibration when an AI employee is added.

## V21: sales@nextgenailabs.com + real form sending

- Every email address on the site is **sales@nextgenailabs.com** (`CONFIG.email`, `CONFIG.formEmail`, mailto links, structured data).
- The enquiry form now **sends silently** through FormSubmit (`CONFIG.submitMethod: 'service'`) to sales@nextgenailabs.com, with a subject like "New enquiry from Sarah Lee (Bright Smile Dental): AI chatbot or agent", reply-to set to the customer, and an **automatic confirmation email** to the customer.
- **Success screen** (only after FormSubmit confirms): animated check, the customer’s name, the three next steps, WhatsApp and email buttons, and a short confetti burst (off under reduced motion). On failure it offers WhatsApp and email instead; nothing claims success that did not happen.
- **One-time setup:** the very first real submission makes FormSubmit email an activation link to sales@nextgenailabs.com. Click it once; after that, enquiries arrive normally. Check spam the first time.
- The customer’s automatic “thanks for reaching out” email is sent by FormSubmit too, so it only works after activation and while formsubmit.co is up (it returned HTTP 521, server down, on 2026-10-29).

## V22: AI Starter plan

- New entry plan **AI Starter**, now $149 setup + $29/month (see V25) (`CONFIG.packages.lite`). It is a simple website FAQ assistant that sends enquiries to email. It shows as a strip above the package cards on the homepage and pricing page, appears in the pricing OfferCatalog JSON-LD and the service dropdown, and is what the team builder recommends when only the chat assistant is selected.

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

**Domain:** the site is set up for `https://www.nextgenailabs.com` (canonical URLs, social tags, JSON-LD, `sitemap.xml`, `robots.txt`). If the domain changes, find-and-replace it across the folder.

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
- **Photography:** 56 CC0 photos from StockSnap (via Openverse) plus 9 small marquee chips, graded to the navy palette, WebP, under 1 MB in total (each page loads only its own; below-the-fold ones are lazy-loaded). Home: dark city photo behind the hero, photo chips in the industries marquee, photo in the free-consultation banner, thumbnails in "Every screen", a photo layer under each of the 8 service scenes, photos on the capability cards, industry tiles and section heads. Every other page: page-hero photo, section photos and a background photo in the closing call-to-action. Larger photos carry a "Stock photo (CC0)" caption; none show your team, office or clients.

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
| `ind-hospital.webp` | Doctors Hospital | https://stocksnap.io/photo/5YUFL6LC0E | CC0 |
| `ind-salon.webp` | Hair Cut | https://stocksnap.io/photo/ASMG0XOU6M | CC0 |
| `ind-caribbean.webp` | Tropical Beach | https://stocksnap.io/photo/HWWGZ3RNXT | CC0 |

`chip-*.webp` are 48 px crops of the `ind-*.webp` photos.

**Still yours to fill (proof for enterprise bids):** real case studies with outcomes, named team members with experience, client references, and any certifications you actually hold. The site has clearly marked slots for these and makes no invented claims.

**Not verified:** real devices (only headless Chrome with a software GPU), Safari/iOS rendering of the WebGL shaders, and a Lighthouse run on the live domain.

## V23: form works without JavaScript + thank-you page

- The enquiry form (`index.html`, `contact.html`) now has `action="https://formsubmit.co/sales@nextgenailabs.com"` plus FormSubmit hidden fields (`_subject`, `_template`, `_captcha`, `_next`, `_autoresponse`, `_honey`). With JavaScript on, `js/main.js` still sends it silently and shows the animated success card. Without JavaScript, the browser posts to FormSubmit, which shows its captcha and then redirects to `thank-you.html`.
- `thank-you.html` is noindex and blocked in `robots.txt`. The 404 page's social tags were fixed (they had been copied from the privacy page).

## V24: focused homepage + AI Solutions page

- **Homepage order:** hero, three service groups (`#services`), one featured scripted demo with "More industries" (`#demo`), four priority industries (`#who`), process (`#how`), proof (`#proof`), three pricing plans (`#packages`), FAQ, consultation form (`#contact`).
- **`solutions.html`** holds the sections moved from the homepage, interactions intact: what an AI employee is, problem picker, day comparison, the nine AI jobs, savings calculator, team builder, industry tabs and the 3D globe. GSAP and the globe load only on this page, so `js/present.js` is no longer on the homepage.
- **Case studies:** add verified projects to `CONFIG.proof.cases` in `js/main.js` (the expected fields are in the comment there) and the cards appear in `#proof`. Leave it empty until a client has approved the content. Never add invented results.
- **SEO:** new titles and descriptions on the homepage, AI Automation, Integrations and Enterprise pages; `solutions.html` added to `sitemap.xml`; `ItemList` of services on the homepage. `robots.txt` no longer blocks `404.html` and `thank-you.html`, because crawlers must be able to read their `noindex` tag.
- The sitewide main button now reads **Book a Free Consultation**.

## V25: beginner agency prices

- All prices live in `CONFIG` in `js/main.js`: `packages`, `pricing` (websites) and `estimator`. The numbers in the HTML are fallbacks for visitors without JavaScript. If a package price changes, also update the `OfferCatalog` JSON-LD in `pricing.html` and the "AI Starter ($149)" form option in `index.html` and `contact.html`.
