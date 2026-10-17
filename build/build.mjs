// Static build for the AToure rebuild. Run: node build/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, LOGOS, HERO_SLIDES, AUDIENCES, SERVICES, PROCESS, PRINCIPLES, CASES, TOUR, PRIVACY, TERMS } from './data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'site');
const DIMS = JSON.parse(readFileSync(join(ROOT, 'dims.json'), 'utf8'));
const bySlug = Object.fromEntries(CASES.map((c) => [c.slug, c]));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = (p) => encodeURI(p).replace(/\(/g, '%28').replace(/\)/g, '%29');
const vurl = (p) => url(p) + '#t=0.1';

function img(p, alt = '', { cls = '', eager = false, sizes = '' } = {}) {
  const d = DIMS[p];
  const wh = d ? ` width="${d[0]}" height="${d[1]}"` : '';
  return `<img src="${url(p)}" alt="${esc(alt)}"${wh}${cls ? ` class="${cls}"` : ''}${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}${sizes ? ` sizes="${sizes}"` : ''}>`;
}

function video(src, { poster, auto = false, cap = '', type } = {}) {
  const t = type || (/\.mov$/i.test(src) ? 'video/quicktime' : 'video/mp4');
  const a = auto ? ' muted loop playsinline data-auto' : ' controls playsinline';
  return `<video${a} preload="metadata"${poster ? ` poster="${url(poster)}"` : ''}${cap ? ` aria-label="${esc(cap)}"` : ''}><source src="${vurl(src)}" type="${t}"><source src="${vurl(src)}" type="video/mp4"></video>`;
}

// ---------- shared chrome ----------
const NAV = [['our-work.html', 'Work'], ['services.html', 'Services'], ['about.html', 'About']];

function head({ title, desc = SITE.desc, path = '' }) {
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0a0a0a">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="https://atoureconsulting.com/${path}">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">
<link rel="apple-touch-icon" href="favicon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&display=swap">
<link rel="stylesheet" href="assets/style.css">
<script>document.documentElement.classList.remove('no-js')</script>
<script src="assets/main.js" defer></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>`;
}

function chrome(current) {
  const links = NAV.map(([h, l]) => `<a class="u" href="${h}"${h === current ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  return `
<header class="bar" id="bar">
  <a href="index.html" class="bar-word">AToure</a>
  <nav aria-label="Main">${links}<a class="u" href="index.html#contact">Contact</a></nav>
  <button class="burger" id="burger" aria-expanded="false" aria-controls="sheet">Menu</button>
</header>
<div class="sheet" id="sheet" aria-hidden="true">
  <div class="sheet-top"><a href="index.html">AToure</a><button class="burger" id="close" style="display:block">Close</button></div>
  <nav aria-label="Menu"><a href="index.html">Home</a>${NAV.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}<a href="index.html#contact">Contact</a></nav>
  <div class="sheet-foot"><a href="mailto:${SITE.email}">${SITE.email}</a><a href="${SITE.whatsapp}">WhatsApp ${SITE.phone}</a><span>London, United Kingdom</span></div>
</div>`;
}

function meta(current, night = false) {
  const links = [['index.html', 'Home'], ...NAV].map(([h, l]) => `<a class="u" href="${h}"${h === current ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  return `
<div class="meta g${night ? ' night' : ''}" id="meta">
  <a class="meta-mark" href="index.html"><img src="logo-mark.png" alt="" width="22" height="22"><span>AToure</span></a>
  <p class="meta-desc"><b>AToure Management &amp; Consulting</b><span class="mute">Access to African markets,<br>handled on the ground.</span></p>
  <nav class="meta-nav" aria-label="Site">${links}</nav>
  <p class="meta-contact"><a class="u" href="index.html#contact">Contact</a><a class="u" href="${SITE.whatsapp}">WhatsApp</a><a class="u" href="${SITE.instagram}">Instagram</a></p>
  <p class="meta-clock" data-clock><b>London</b><span data-time>--:--</span></p>
</div>`;
}

function stage({ slides, foot = false }) {
  const imgs = slides.map(([p, cap, tz], i) => {
    const d = DIMS[p];
    return `<img src="${url(p)}" alt="" ${d ? `width="${d[0]}" height="${d[1]}"` : ''} data-cap="${esc(cap)}" data-tz="${tz}"${i === 0 ? ' class="on" fetchpriority="high"' : ' loading="lazy"'}>`;
  }).join('');
  return `
<div class="stage" data-stage>
  <figure class="stage-img" data-slides aria-hidden="true">${imgs}${foot ? '' : `<figcaption class="stage-cap"><span data-cap>${esc(slides[0][1])}</span> · <span data-captime class="tnum"></span></figcaption>`}</figure>
  <p class="wordmark" data-fit aria-hidden="true">ATOURE</p>
</div>`;
}

function cta(title = 'Tell us where you want to go.', text = 'The country, the sector, what you need there. We’ll tell you plainly what we can open and how we would run it.') {
  return `
<section class="night sec" aria-labelledby="cta-h">
  <div class="g">
    <span class="row-lbl"></span>
    <div class="row-main">
      <h2 class="big rv" id="cta-h" style="--i:1">${esc(title)}</h2>
      <p class="body rv" style="--i:2;margin-top:24px">${esc(text)}</p>
      <div class="hero-cta rv" style="--i:3"><a class="btn btn-gold" href="index.html#contact">Start a conversation <span class="arrow">→</span></a><a class="btn btn-line" href="${SITE.whatsapp}">WhatsApp us</a></div>
    </div>
  </div>
</section>`;
}

function footer() {
  const work = CASES.map((c) => `<li><a class="u" href="${c.slug}.html">${esc(c.card)}</a></li>`).join('');
  return `
<footer class="foot">
  <div class="g row">
    <p class="row-lbl">Pages</p>
    <div class="row-main foot-links">
      <ul><li><a class="u" href="index.html">Home</a></li><li><a class="u" href="our-work.html">Work</a></li><li><a class="u" href="services.html">Services</a></li><li><a class="u" href="about.html">About</a></li><li><a class="u" href="index.html#contact">Contact</a></li></ul>
      <ul><li><a class="u" href="mailto:${SITE.email}">Email</a></li><li><a class="u" href="${SITE.whatsapp}">WhatsApp</a></li><li><a class="u" href="${SITE.instagram}">Instagram</a></li><li><a class="u" href="privacy.html">Privacy</a></li><li><a class="u" href="terms.html">Terms</a></li><li><a class="u" href="privacy.html#cookies">Cookies</a></li></ul>
      <ul><li>London, United Kingdom</li><li>Outside Africa: Paris, Monaco, Doha and Dubai</li></ul>
    </div>
  </div>
  <div class="g row">
    <p class="row-lbl">Case studies</p>
    <ul class="row-main lst two">${work}</ul>
  </div>
  <div class="g foot-legal">
    <p>© 2026 AToure Ltd.</p>
    <p>AToure Management &amp; Consulting is a trading name of AToure Ltd. Registered in England and Wales, company number 15129711. Registered office: 30B Chichele Road, London NW2 3DA.</p>
  </div>
  <div class="foot-stage">${stage({ slides: HERO_SLIDES.slice(4, 9), foot: true })}</div>
</footer>
</body>
</html>`;
}

function page({ file, title, desc, current, body, noCta = false, ctaArgs }) {
  const html = head({ title, desc, path: file === 'index.html' ? '' : file }) + chrome(current) + `\n<main id="main">` + body + `</main>` + (noCta ? '' : cta(...(ctaArgs || []))) + footer();
  writeFileSync(join(OUT, file), html);
}

// ---------- blocks ----------
const field = (b, fallback = 'night') => (b.field || fallback);

function rowHead(b, i = 0) {
  return `${b.lbl ? `<h2 class="row-lbl rv">${esc(b.lbl)}</h2>` : '<span class="row-lbl"></span>'}`;
}

function workCard(c, withText = false, i = 0) {
  return `<a class="card rv" style="--i:${i % 2}" href="${c.slug}.html">
  <div class="card-media">${c.loop ? video(c.loop[0], { poster: c.loop[1], auto: true, cap: c.card }) : img(c.cover, c.card)}</div>
  <div class="card-cap"><b>${esc(c.card)}</b><span>${esc(c.where)}</span></div>
  ${withText ? `<p class="card-d">${esc(c.cardText)}</p><p class="card-d" style="margin-top:4px">${esc(c.key)}</p>` : `<p class="card-d">${esc(c.key)}</p>`}
  <span class="card-go">Read the case <span class="arrow">→</span></span>
</a>`;
}

function stripInner(b) {
  const n = b.imgs.length;
  return `<div data-strip>
    <div class="strip" tabindex="0" aria-label="${esc(b.name)} photographs, scroll sideways">${b.imgs.map((p, i) => `<figure>${img(p, `${b.name}, photograph ${i + 1} of ${n}`)}</figure>`).join('')}</div>
    <div class="strip-ctl"><span data-count>1 / ${n}</span><div><button type="button" data-prev aria-label="Previous photographs">←</button><button type="button" data-next aria-label="Next photographs">→</button></div></div>
  </div>`;
}

const B = {
  row(b) {
    return `<section class="${field(b)} row-sec"><div class="g row">
  ${rowHead(b)}
  <div class="row-main">
    ${b.title ? `<p class="statement rv" style="--i:1">${esc(b.title)}</p>` : ''}
    ${b.body ? `<div class="body rv" style="--i:2">${b.body.map((p) => `<p>${esc(p)}</p>`).join('')}</div>` : ''}
    ${b.list ? `<ul class="lst${b.two ? ' two' : ''} rv" style="--i:2${b.title || b.body ? ';margin-top:28px' : ''}">${b.list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
  </div>
</div></section>`;
  },
  nums(b) {
    const n = b.n || b.items.length;
    return `<section class="${field(b)} sec-tight">
  ${b.lbl ? `<div class="g" style="margin-bottom:48px">${rowHead(b)}<div class="row-main"><p class="statement rv" style="--i:1">${esc(b.title)}</p></div></div>` : ''}
  <div class="g">
    <dl class="nums${b.size === 'm' ? ' m' : ''}" style="grid-column:1/-1;--n:${Math.min(n, 4)}">${b.items.map(([v, l], i) => `<div class="rv" style="--i:${i}"><dt${b.small && b.small.includes(i) ? ' style="font-size:var(--t-m);letter-spacing:-.03em;line-height:1.05"' : ''}>${esc(v)}</dt><dd>${esc(l)}</dd></div>`).join('')}</dl>
    ${b.logo ? `<div class="rv" style="grid-column:1/-1;margin-top:48px;display:flex;align-items:center;gap:18px"><span class="lbl">In partnership with</span><span style="background:#f4f3ef;padding:12px 18px">${img(b.logo[0], b.logo[1], { cls: '' }).replace('<img', '<img style="height:28px;width:auto"')}</span></div>` : ''}
    ${b.fine ? `<p class="fineprint rv" style="grid-column:1/-1;margin-top:40px">${esc(b.fine)}</p>` : ''}
  </div>
</section>`;
  },
  logosRow(b) {
    return `<section class="paper sec-tight"><div class="g">
  <p class="row-lbl rv">${esc(b.lbl)}</p>
  <ul class="row-main logos" style="--cols:${b.items.length};grid-template-columns:repeat(${Math.max(b.items.length, 3)},minmax(0,1fr))">${b.items.map(([p, n], i) => `<li class="rv" style="--i:${i}" title="${esc(n)}">${img(p, n)}</li>`).join('')}</ul>
  <ul class="row-main lst" style="grid-column:4/13;display:grid;grid-template-columns:repeat(${Math.max(b.items.length, 3)},minmax(0,1fr));gap:var(--g);margin-top:10px">${b.items.map(([, n]) => `<li class="lbl">${esc(n)}</li>`).join('')}</ul>
</div></section>`;
  },
  did(b) {
    return `<section class="${field(b)} sec"><div class="g">
  ${rowHead(b)}
  <div class="row-main">
    <p class="statement rv" style="--i:1">${esc(b.title)}</p>
    <div class="did" style="margin-top:56px">${b.items.map(([h, p], i) => `<div class="rv" style="--i:${i % 3}"><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}</div>
  </div>
</div></section>`;
  },
  duo(b) {
    return `<section class="${field(b, 'paper')} sec-tight"><div class="duo">${b.imgs.map(([p, cap], i) => `<figure class="rv" style="--i:${i}">${img(p, cap)}${b.caps ? `<figcaption class="cap" style="padding:0 0 2px">${esc(cap)}</figcaption>` : ''}</figure>`).join('')}</div></section>`;
  },
  bleed(b) {
    return `<figure class="bleed mask">${img(b.img, b.cap)}${b.cap ? `<figcaption>${esc(b.cap)}</figcaption>` : ''}</figure>`;
  },
  mason(b) {
    return `<section class="${field(b)} sec">
  <div class="g" style="margin-bottom:48px">${rowHead(b)}<div class="row-main"><p class="statement rv" style="--i:1">${esc(b.title)}</p></div></div>
  <div class="mason">${b.imgs.map((p, i) => `<figure class="rv" style="--i:${i % 3}">${img(p, b.caps ? b.caps[i] : `${b.title.replace(/\.$/, '')}, photograph ${i + 1}`)}${b.caps ? `<figcaption class="cap" style="padding:8px 0 4px">${esc(b.caps[i])}</figcaption>` : ''}</figure>`).join('')}</div>
</section>`;
  },
  strip(b) {
    return `<section class="${field(b)} sec">
  <div class="g" style="margin-bottom:48px">${rowHead(b)}<div class="row-main"><p class="statement rv" style="--i:1">${esc(b.title)}</p></div></div>
  ${stripInner(b)}
</section>`;
  },
  video(b) {
    return `<section class="${field(b)}"><figure class="vid rv">${video(b.src, b.poster ? { poster: b.poster, auto: b.auto, cap: b.cap } : { cap: b.cap })}</figure></section>`;
  },
  videoText(b) {
    return `<section class="${field(b)} sec"><div class="g post">
  <div class="post-vid rv">${video(b.src, { poster: b.poster, cap: b.title })}</div>
  <div class="post-txt">
    <h2 class="statement rv" style="--i:1">${esc(b.title)}</h2>
    ${b.lbl ? `<p class="lbl rv" style="margin-top:12px">${esc(b.lbl)}</p>` : ''}
    <div class="body rv" style="--i:2;margin-top:20px">${b.body.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    ${b.facts ? `<dl class="nums m rv" style="--i:3;--n:3;margin-top:40px">${b.facts.map(([k, v]) => `<div><dt>${esc(v)}</dt><dd>${esc(k)}</dd></div>`).join('')}</dl>` : ''}
  </div>
</div></section>`;
  },
  videoPair(b) {
    return `<section class="${field(b)} sec">
  <div class="g" style="margin-bottom:56px">${rowHead(b)}<div class="row-main"><p class="statement rv" style="--i:1">${esc(b.title)}</p></div></div>
  <div class="g post">
    <figure class="post-vid rv">${video(b.src, { cap: b.cap, type: b.type })}<figcaption class="cap">${esc(b.cap)}</figcaption></figure>
    <div class="post-txt">
      ${b.items ? `<div class="did" style="grid-template-columns:1fr">${b.items.map(([h, p], i) => `<div class="rv" style="--i:${i}"><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}</div>` : ''}
      ${b.list ? `<ul class="outcomes" style="grid-template-columns:1fr 1fr">${b.list.map((x, i) => `<li class="rv" style="--i:${i}">${esc(x)}</li>`).join('')}</ul>` : ''}
      ${b.nums ? `<dl class="nums rv" style="--n:2;margin-top:48px">${b.nums.map(([v, l]) => `<div><dt>${esc(v)}</dt><dd>${esc(l)}</dd></div>`).join('')}</dl>` : ''}
      ${b.note ? `<p class="outcome-note rv">${esc(b.note)}</p>` : ''}
    </div>
  </div>
</section>`;
  },
  split(b) {
    return `<section class="${field(b)} row-sec"><div class="g row">
  ${rowHead(b)}
  <div class="row-main">
    <ul class="post-more" style="margin-top:0">${b.items.map(([k, v], i) => `<li class="rv" style="--i:${i % 4}"><span>${esc(k)}</span><span style="text-align:right">${esc(v)}</span></li>`).join('')}</ul>
    ${b.after ? `<div class="rv" style="margin-top:56px"><p class="statement">${esc(b.after[0])}</p><p class="body" style="margin-top:18px">${esc(b.after[1])}</p></div>` : ''}
  </div>
</div></section>`;
  },
  press(b) {
    return `<section class="${field(b)} row-sec"><div class="g row">
  ${rowHead(b)}
  <div class="row-main">
    <ul class="tags rv">${b.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    <div class="quotes">${b.quotes.map(([q, w], i) => `<figure class="rv" style="--i:${i}"><blockquote>“${esc(q)}”</blockquote><cite>${esc(w)}</cite></figure>`).join('')}</div>
  </div>
</div></section>`;
  },
  outcomes(b) {
    return `<section class="gold sec"><div class="g">
  ${rowHead(b)}
  <div class="row-main">
    <p class="statement rv" style="--i:1">${esc(b.title)}</p>
    <ul class="outcomes" style="margin-top:48px">${b.items.map((x, i) => `<li class="rv" style="--i:${i % 3}">${esc(x)}</li>`).join('')}</ul>
    ${b.note ? `<p class="outcome-note rv">${esc(b.note)}</p>` : ''}
    ${b.fine ? `<p class="fineprint rv">${esc(b.fine)}</p>` : ''}
  </div>
</div></section>`;
  },
  days(b) {
    return `<section class="${field(b, 'paper')} sec"><div class="g">
  ${rowHead(b)}
  <div class="row-main">
    <p class="statement rv" style="--i:1">${esc(b.title)}</p>
    <p class="body rv" style="--i:2;margin-top:20px">${esc(b.body)}</p>
    <div class="days" style="margin-top:48px">${b.days.map(([l, h, items], i) => `<div class="day rv" style="--i:${i}"><h3>${esc(h)}</h3><p class="lbl" style="margin-top:10px">${esc(l)}</p><ul>${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div>
  </div>
</div></section>`;
  },
  people(b) {
    return `<section class="${field(b)} sec"><div class="g">
  ${rowHead(b)}
  <div class="row-main">
    <p class="statement rv" style="--i:1">${esc(b.title)}</p>
    <p class="body rv" style="--i:2;margin-top:20px">${esc(b.body)}</p>
    <div class="people" style="margin-top:56px">
      <div class="lead rv"><h3>${esc(b.lead[0])}</h3><p>${esc(b.lead[1])}</p></div>
      ${b.items.map(([n, r], i) => `<div class="rv" style="--i:${i % 4}"><h3>${esc(n)}</h3><p>${esc(r)}</p></div>`).join('')}
    </div>
  </div>
</div></section>`;
  },
  creators(b) {
    return `<section class="${field(b, 'paper')} sec"><div class="g">
  ${rowHead(b)}
  <div class="row-main">
    <p class="statement rv" style="--i:1">${esc(b.title)}</p>
    <p class="body rv" style="--i:2;margin-top:20px">${esc(b.body)}</p>
    <div class="people" style="margin-top:56px">
      ${b.items.map(([n, h, f], i) => `<div class="rv" style="--i:${i % 4}"><h3>${esc(n)}</h3><b>${esc(f)}</b><p>${esc(h)} · followers</p></div>`).join('')}
      <div class="rv" style="background:var(--gold);padding:20px"><h3>Combined</h3><b>${esc(b.total[0])}</b><p style="color:var(--ink)">${esc(b.total[1])}</p></div>
    </div>
  </div>
</div></section>`;
  },
  twoLists(b) {
    return `<section class="${field(b, 'paper')} sec"><div class="g">
  ${rowHead(b)}
  <div class="row-main">
    <p class="statement rv" style="--i:1">${esc(b.title)}</p>
    <div class="days" style="margin-top:48px">${b.lists.map(([h, items], i) => `<div class="day rv" style="--i:${i}"><h3>${esc(h)}</h3><ul>${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div>
  </div>
</div></section>`;
  },
  partners(b) {
    return `<section class="${field(b)} sec"><div class="g">
  ${rowHead(b)}
  <div class="row-main">
    <p class="statement rv" style="--i:1">${esc(b.title)}</p>
    <p class="body rv" style="--i:2;margin-top:20px">${esc(b.body)}</p>
    <ul class="partners" style="margin-top:48px">${b.items.map(([p, n, r, bg], i) => `<li class="rv" style="--i:${i % 3}">${p ? `<div class="pl" style="background:${bg}">${img(p, n)}</div>` : `<div class="pl txt">${esc(n)}</div>`}<span>${esc(p ? n : '')}${p && r ? ' · ' : ''}${esc(r || '')}</span></li>`).join('')}</ul>
  </div>
</div></section>`;
  },
  outlets(b) {
    return `<section class="${field(b)} sec"><div class="g">
  ${rowHead(b)}
  <div class="row-main">
    <p class="statement rv" style="--i:1">${esc(b.title)}</p>
    <p class="body rv" style="--i:2;margin-top:20px">${esc(b.body)}</p>
    <div class="outlets" style="margin-top:48px">${b.items.map(([n, d], i) => `<div class="rv" style="--i:${i % 2}"><h3>${esc(n)}</h3><p>${esc(d)}</p></div>`).join('')}</div>
  </div>
</div></section>`;
  },
};

// ---------- case pages ----------
function caseHead(c) {
  return `
<section class="head">
  ${meta('our-work.html')}
  <div class="g head-title">
    <h1 class="big rv" style="--i:1">${esc(c.title)}</h1>
    <p class="lede rv" style="--i:2">${esc(c.lede)}</p>
  </div>
  <dl class="g head-facts">${c.facts.map(([k, v], i) => `<div class="rv" style="--i:${i}"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
</section>
<figure class="bleed mask">${img(c.heroImg || c.cover, c.title, { eager: true })}</figure>`;
}

function caseFoot(c) {
  const i = CASES.indexOf(c);
  const next = CASES[(i + 1) % CASES.length];
  return `
<section class="paper sec-tight"><div class="g">
  <p class="row-lbl rv">Related work</p>
  <div class="row-main related" style="margin-top:0"><a href="our-work.html">← All case studies</a>${c.related.map((s) => `<a href="${s}.html">${esc(bySlug[s].card)}</a>`).join('')}</div>
</div></section>
<a class="next paper" href="${next.slug}.html"><div class="g"><p class="big">${esc(next.card)} <span class="arrow">→</span></p><p class="lbl" style="margin-top:14px">Next case study</p></div></a>`;
}

function tourBody() {
  const T = TOUR;
  let h = `
<section class="night sec"><div class="g">
  <h2 class="row-lbl rv">Tour analytics</h2>
  <div class="row-main">
    <p class="big rv tnum" style="--i:1">${T.total[0]}</p>
    <p class="statement rv" style="--i:2;margin-top:14px">${T.total[1]}</p>
    <dl class="nums m" style="--n:5;margin-top:64px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">${T.nums.map(([v, l], i) => `<div class="rv" style="--i:${i}"><dt>${v}</dt><dd>${esc(l)}</dd></div>`).join('')}</dl>
  </div>
</div>
<div class="g" style="margin-top:80px"><div class="accts" style="grid-column:1/-1">${T.accounts.map(([n, total, rows], i) => `<div class="acct rv" style="--i:${i}"><p class="big tnum" style="margin-top:0">${total}</p><h3 style="margin-top:12px">${esc(n)}</h3><p class="lbl">Total tour views</p><ul>${rows.map(([k, v]) => `<li><span>${esc(k)}</span><span>${esc(v)}</span></li>`).join('')}</ul></div>`).join('')}</div></div>
</section>
${B.row({ field: 'night', lbl: 'The mission', title: T.mission[0], body: [T.mission[1]] })}
<section class="night row-sec"><div class="g row">
  <h2 class="row-lbl rv">Delivered</h2>
  <div class="row-main">
    <ul class="tags rv">${T.delivered.split(' · ').map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <nav class="legs" aria-label="Tour legs" style="margin-top:48px">${T.legs.map((l, i) => `<a class="rv" style="--i:${i}" href="#${l.id}"><b>${l.country}</b><span>${l.city}</span></a>`).join('')}</nav>
  </div>
</div></section>`;

  T.legs.forEach((l, i) => {
    const f = i % 2 ? 'paper' : 'night';
    const p = l.post;
    h += `
<section class="${f} sec" id="${l.id}" style="scroll-margin-top:40px">
  <div class="g leg-head" style="margin-bottom:56px">
    <div style="grid-column:1/7"><h2 class="big rv" style="--i:1">${l.country}</h2><p class="lbl rv" style="--i:2;margin-top:14px">${esc(l.leg)}</p></div>
    <p class="statement rv" style="--i:2">${esc(l.intro)}</p>
  </div>
  ${stripInner({ imgs: l.photos, name: l.country })}
  <div class="g post" style="margin-top:clamp(72px,8vw,140px)">
    <figure class="post-vid rv">${video(l.video, { cap: `${l.country} · ${l.city}` })}<figcaption class="cap">${l.country} · ${l.city}</figcaption></figure>
    <div class="post-txt">
      <h3 class="statement rv" style="margin-top:0">${esc(p.title)}</h3>
      <dl class="nums rv" style="--i:1;--n:1;margin-top:28px"><div><dt>${p.views}</dt><dd>Views · featured post, ${esc(p.who)}</dd></div></dl>
      <p class="body rv" style="--i:2;margin-top:28px">${esc(p.text)}</p>
      <dl class="nums m rv" style="--i:4;--n:${p.stats.length}">${p.stats.map(([v, k]) => `<div><dt>${v}</dt><dd>${k}</dd></div>`).join('')}</dl>
      <div class="post-more rv" style="--i:5"><p class="lbl" style="margin-bottom:8px">${esc(p.moreLbl)}</p><ul>${p.more.map(([k, v]) => `<li><span>${esc(k)}</span><span>${esc(v)}</span></li>`).join('')}</ul></div>
    </div>
  </div>
</section>`;
  });

  h += `
<section class="night sec"><div class="g">
  <h2 class="row-lbl rv">Press</h2>
  <div class="row-main">
    <p class="statement rv" style="--i:1">The tour made the news in every market.</p>
    <p class="body rv" style="--i:2;margin-top:20px">${esc(T.pressIntro)}</p>
    <dl class="nums m" style="--n:4;margin-top:48px">${T.pressNums.map(([v, l], i) => `<div class="rv" style="--i:${i}"><dt>${v}</dt><dd>${l}</dd></div>`).join('')}</dl>
    <div style="margin-top:56px">${T.press.map(([c, items]) => `<div class="press rv"><h3>${c}</h3><ul>${items.map(([o, t]) => `<li><b>${esc(o)}</b><span>${esc(t)}</span></li>`).join('')}</ul></div>`).join('')}</div>
    <p class="fineprint rv">${esc(T.pressNote)}</p>
  </div>
</div></section>`;
  return h;
}

for (const c of CASES) {
  const body = caseHead(c) + (c.tour ? tourBody() : c.blocks.map((b) => B[b.t](b)).join('\n')) + caseFoot(c);
  page({ file: `${c.slug}.html`, title: `${c.metaTitle} | AToure`, desc: c.cardText, current: 'our-work.html', body, ctaArgs: c.cta ? [c.cta[0], c.cta[1]] : undefined });
}

// ---------- home ----------
const featured = CASES.filter((c) => c.featured);
const others = CASES.filter((c) => !c.featured);

function logoGrid(lbl = 'Worked alongside', fieldCls = 'paper') {
  return `<section class="${fieldCls} sec-tight"><div class="g">
  <h2 class="row-lbl rv">${lbl}</h2>
  <ul class="row-main logos">${LOGOS.map(([p, n], i) => `<li class="rv" style="--i:${i % 5}">${img(p, n)}</li>`).join('')}</ul>
</div></section>`;
}

function mapSection() {
  return `<section class="night sec" id="markets"><div class="g" style="margin-bottom:56px">
  <h2 class="row-lbl rv">Where we operate</h2>
  <div class="row-main"><p class="statement rv" style="--i:1">Markets we have worked on the ground.</p><p class="body rv" style="--i:2;margin-top:20px">Gold marks the countries where our team has run work on the ground. Green marks the countries where we have established access through our network.</p></div>
</div>
<div class="g map">
  <div class="map-svg rv"><svg id="africa" viewBox="10 0 580 640" role="img" aria-label="Map of Africa showing the countries where AToure has worked"></svg><div class="map-tip" id="mapTip" hidden></div></div>
  <aside class="map-panel" aria-live="polite">
    <div class="legend"><span><i style="background:var(--gold)"></i>Worked on the ground</span><span><i style="background:var(--green)"></i>Access through our network</span></div>
    <div class="map-list" id="mapList"><noscript><p>Ivory Coast, Morocco, Ghana, Nigeria, Cameroon, Benin and Rwanda.</p></noscript></div>
    <div class="map-detail" id="mapDetail"></div>
    <p class="map-also">Outside Africa: London, Paris, Monaco, Doha and Dubai.</p>
  </aside>
</div>
<script src="assets/africa-map.js" defer></script></section>`;
}

function contactSection() {
  const opts = ['Enter a new market', 'Invest in a sector or country', 'Private client services', 'Creator or media partnership', 'Something else'];
  return `<section class="night sec" id="contact" style="scroll-margin-top:0"><div class="g contact">
  <div class="contact-l">
    <h2 class="big rv" style="--i:1">Tell us where you want to go.</h2>
    <p class="body rv" style="--i:2">The country, the sector, what you need there. We’ll tell you plainly what we can open and how we would run it.</p>
    <div class="contact-d rv" style="--i:3">
      <p><span class="lbl">Email</span><a class="u" href="mailto:${SITE.email}">${SITE.email}</a></p>
      <p><span class="lbl">WhatsApp</span><a class="u" href="${SITE.whatsapp}">${SITE.phone}</a></p>
      <p><span class="lbl">Office</span><span>London, United Kingdom</span></p>
    </div>
  </div>
  <form class="contact-f rv" style="--i:2" id="enquiry" action="${SITE.formspree}" method="POST" novalidate>
    <fieldset class="chips"><legend>What do you need?</legend>${opts.map((o, i) => `<label><input type="radio" name="enquiry_type" value="${esc(o)}"${i === 0 ? ' checked' : ''}><span>${esc(o)}</span></label>`).join('')}</fieldset>
    <div class="fields">
      <div class="field"><label for="f-name">Name</label><input id="f-name" name="name" autocomplete="name" required></div>
      <div class="field"><label for="f-co">Company</label><input id="f-co" name="company" autocomplete="organization"></div>
      <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="f-country">Country or market</label><input id="f-country" name="country"></div>
      <div class="field full"><label for="f-msg">Tell us more</label><textarea id="f-msg" name="message"></textarea></div>
    </div>
    <div class="form-end"><button class="btn btn-gold" type="submit">Send enquiry <span class="arrow">→</span></button><p>We use your details only to reply to you. <a class="u" href="privacy.html">Privacy policy</a></p></div>
    <p class="form-msg" data-msg role="status" hidden></p>
  </form>
</div></section>`;
}

{
  const body = `
<section class="hero" id="hero">
  ${meta('index.html')}
  <div class="g hero-body">
    <div class="hero-copy">
      <h1 class="rv">Access to African markets, handled on the ground.</h1>
      <p class="rv" style="--i:1">We open markets across Africa for brands, companies, investors and private clients. We bring the contacts, run the operation and stay in country until the work is done.</p>
      <div class="hero-cta rv" style="--i:2"><a class="btn btn-gold" href="#contact">Start a conversation <span class="arrow">→</span></a><a class="btn btn-line" href="#work">See the work</a></div>
    </div>
    <dl class="hero-stats">
      <div class="rv" style="--i:2"><dt>7</dt><dd>African countries worked on the ground</dd></div>
      <div class="rv" style="--i:3"><dt>6.1B</dt><dd>Digital impressions at the AFCON Final, a tournament record</dd></div>
      <div class="rv" style="--i:4"><dt>16M</dt><dd>Live viewers for the mascot reveal in Rabat</dd></div>
    </dl>
  </div>
  ${stage({ slides: HERO_SLIDES })}
</section>

<section class="night sec">
  <div class="g phone-only" style="margin-bottom:72px"><dl class="nums m" style="grid-column:1/-1;--n:3;grid-template-columns:repeat(3,minmax(0,1fr))"><div><dt>7</dt><dd>African countries worked on the ground</dd></div><div><dt>6.1B</dt><dd>Digital impressions at the AFCON Final, a tournament record</dd></div><div><dt>16M</dt><dd>Live viewers for the mascot reveal in Rabat</dd></div></dl></div>
  <div class="g row" style="padding-top:0">
    <p class="row-lbl rv">London · Africa</p>
    <p class="row-main statement rv" style="--i:1">AToure is a management and consulting company. We build the project and run it on the ground ourselves, with contacts in every market we work in and one team from start to finish.</p>
  </div>
  <div class="g row">
    <h2 class="row-lbl rv">Who we work with</h2>
    <div class="row-main">
      <p class="statement rv" style="--i:1">One firm on the ground, for whoever needs to get in.</p>
      <div class="who" style="margin-top:48px">${AUDIENCES.map(([h, p], i) => `<div class="rv" style="--i:${i % 2}"><h3>${esc(h)}</h3><p class="mute">${esc(p)}</p><a class="u" href="#contact">Talk to us →</a></div>`).join('')}</div>
    </div>
  </div>
</section>

<section class="night" id="work" style="padding-bottom:var(--sec)">
  <div class="g row" style="padding-top:0">
    <h2 class="row-lbl rv">Selected work</h2>
    <div class="row-main"><p class="statement rv" style="--i:1">Proof that we open doors.</p><p class="body mute rv" style="--i:2;margin-top:18px">High profile projects, delivered on the ground. Each one required institutional access, security and local operations to work.</p></div>
  </div>
  <div class="works">${featured.map((c, i) => workCard(c, false, i)).join('')}</div>
  <div class="also">
    ${others.map((c) => `<a class="rv" href="${c.slug}.html"><b>${esc(c.where)}</b><span class="statement">${esc(c.card)} <span class="arrow">→</span></span><p>${esc(c.cardText)}</p></a>`).join('')}
    <div class="g" style="margin-top:40px"><a class="btn btn-line rv" style="grid-column:4/13;width:max-content;padding:0 22px;display:inline-flex" href="our-work.html">All work <span class="arrow">→</span></a></div>
  </div>
</section>

<section class="paper" style="padding-top:var(--sec)">
  <div class="g row" style="padding-top:0">
    <h2 class="row-lbl rv">What we do</h2>
    <div class="row-main"><p class="statement rv" style="--i:1">We don’t advise from a distance. We run it.</p><p class="body rv" style="--i:2;margin-top:18px">Every engagement is built and operated by our own team in market, from the first meeting to the last day on the ground.</p></div>
  </div>
  <div>${SERVICES.map((s) => `<div class="svc"><div class="g"><h3 class="rv">${esc(s.name)}</h3><div class="svc-txt rv" style="--i:1"><p>${esc(s.short)}</p><ul>${s.pts.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div></div>`).join('')}</div>
</section>

${mapSection()}
${logoGrid()}
${contactSection()}`;
  page({ file: 'index.html', title: 'AToure | Access to African Markets', current: 'index.html', body, noCta: true });
}

// ---------- work ----------
{
  const body = `
<section class="head">
  ${meta('our-work.html')}
  <div class="g head-title"><h1 class="big rv">Proof that we open doors.</h1><p class="lede rv" style="--i:1">High profile projects, delivered on the ground. Each one needed institutional access, security and local operations to happen at all.</p></div>
</section>
<section class="night sec"><div class="works">${CASES.map((c, i) => workCard(c, true, i)).join('')}</div></section>
${logoGrid()}`;
  page({ file: 'our-work.html', title: 'Work | AToure', desc: 'High profile projects, delivered on the ground: IShowSpeed at the AFCON Final, the Ivory Coast tour, the Ashton Hall Africa Tour, Race Weekend and more.', current: 'our-work.html', body });
}

// ---------- services ----------
{
  const body = `
<section class="head">
  ${meta('services.html')}
  <div class="g head-title"><h1 class="big rv">Five things we do, on the ground.</h1><p class="lede rv" style="--i:1">Every service is run by our own team in market. One firm from the first meeting to the last day on the ground, with no handoffs between advisers and operators.</p></div>
</section>
<figure class="bleed mask">${video('Media/Ishowspeed/Morocco/IMG_8671.mp4', { poster: 'Media/Ishowspeed/Morocco/IMG_8671-poster.webp', auto: true, cap: 'On the ground at the AFCON Final, Morocco' })}<figcaption>On the ground at the AFCON Final, Morocco</figcaption></figure>
<section class="night" style="padding-block:var(--sec)">${SERVICES.map((s) => `<div class="svc"><div class="g"><h2 class="rv" style="grid-column:1/8;font-size:var(--t-l);line-height:.95;letter-spacing:-.045em;font-weight:500">${esc(s.name)}</h2><div class="svc-txt rv" style="--i:1"><p class="lbl">${esc(s.who)}</p><p>${esc(s.long)}</p><ul>${s.ptsLong.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div></div>`).join('')}</section>
<section class="paper sec"><div class="g">
  <h2 class="row-lbl rv">How we work</h2>
  <div class="row-main">
    <p class="statement rv" style="--i:1">From the first call to the last day.</p>
    <ol class="steps" style="margin-top:48px">${PROCESS.map(([h, p], i) => `<li class="rv" style="--i:${i}"><h3>${h}</h3><p>${esc(p)}</p></li>`).join('')}</ol>
  </div>
</div></section>
<section class="paper"><div class="duo">${['index carousel/tour-ghana-DSC02716.webp', 'index carousel/tour-rwanda-TEE11038.webp'].map((p, i) => `<figure class="rv" style="--i:${i}">${img(p, i ? 'Kigali, Rwanda' : 'Accra, Ghana')}<figcaption class="cap">${i ? 'Kigali, Rwanda' : 'Accra, Ghana'}</figcaption></figure>`).join('')}</div></section>
${logoGrid('Worked alongside')}`;
  page({ file: 'services.html', title: 'Services | AToure', desc: 'Market entry, government and institutions, operations and logistics, communications and media, strategic introductions. Run by our own team in market.', current: 'services.html', body });
}

// ---------- about ----------
{
  const body = `
<section class="head">
  ${meta('about.html')}
  <div class="g head-title"><h1 class="big rv">Built to close the execution gap.</h1><p class="lede rv" style="--i:1">AToure is a management and consulting company. We build the project and run it on the ground ourselves, with contacts in every market we work in and one team from start to finish.</p></div>
</section>
<section class="night sec"><div class="g director">
  <figure class="mask">${img('Media/Baba Toure/IMG_8442.webp', 'Baba Touré, Director of AToure', { eager: true })}</figure>
  <div class="director-txt">
    <h2 class="big rv" style="--i:1">Baba Touré</h2>
    <blockquote class="statement rv" style="--i:2">The problem was never the idea. It was the in between. So we stepped into the middle and made it personal.</blockquote>
    <cite class="rv" style="--i:2">Baba Touré, Director</cite>
    <div class="body rv" style="--i:3"><p>Baba’s work bridges international and African markets, and not only in media. It runs through trade, investment and everyday business, opening a route for global brands to build in Africa and for African companies to reach the world.</p><p>That network spans West Africa, North Africa, the UK and the Middle East, including partnerships with government entities. The aim is partnership at every level, from ministries and multinationals to creators and small businesses.</p></div>
  </div>
</div></section>
<section class="paper sec"><div class="g">
  <h2 class="row-lbl rv">How we operate</h2>
  <div class="row-main">
    <p class="statement rv" style="--i:1">Three things we don’t compromise on.</p>
    <ol class="steps three" style="margin-top:48px">${PRINCIPLES.map(([h, p], i) => `<li class="rv" style="--i:${i}"><h3>${h}</h3><p>${esc(p)}</p></li>`).join('')}</ol>
  </div>
</div></section>
<section class="night sec"><div class="g">
  <h2 class="row-lbl rv">Where we operate</h2>
  <div class="row-main">
    <p class="statement rv" style="--i:1">Markets we have worked on the ground.</p>
    <nav class="markets" aria-label="Markets" style="margin-top:48px">${[['Ivory Coast', 'Abidjan', 'ivory-coast.html'], ['Morocco', 'Casablanca, Rabat', 'ishowspeed-afcon.html'], ['Ghana', 'Accra', 'ashton-hall-africa-tour.html#ghana'], ['Nigeria', 'Lagos', 'ashton-hall-africa-tour.html#nigeria'], ['Cameroon', 'Douala', 'ashton-hall-africa-tour.html#cameroon'], ['Benin', 'Cotonou', 'ashton-hall-africa-tour.html#benin'], ['Rwanda', 'Kigali', 'ashton-hall-africa-tour.html#rwanda']].map(([n, c, h], i) => `<a class="rv" style="--i:${i % 4}" href="${h}"><b>${n}</b><span>${c}</span></a>`).join('')}</nav>
    <p class="body mute rv" style="--i:3;margin-top:28px">Outside Africa: London, Paris, Monaco, Doha and Dubai.</p>
  </div>
</div></section>
<figure class="bleed mask">${video('Media/Race Weekend/web/race-weekend-reel.mp4', { poster: 'Media/Race Weekend/web/race-weekend-reel-poster.webp', auto: true, cap: 'Race Weekend, Abidjan 2026' })}<figcaption>Race Weekend, Abidjan 2026</figcaption></figure>`;
  page({ file: 'about.html', title: 'About | AToure', desc: 'AToure is a management and consulting company. We build the project and run it on the ground ourselves.', current: 'about.html', body });
}

// ---------- legal ----------
function legal(file, L, title) {
  const slug = (s) => s.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
  const part = (x) => (typeof x === 'string' ? `<p>${x}</p>` : `<ul>${x.ul.map((li) => `<li>${li}</li>`).join('')}</ul>`);
  const body = `
<section class="head">
  ${meta('')}
  <div class="g head-title"><h1 class="big rv">${esc(L.title)}</h1><p class="lede rv" style="--i:1">${esc(L.lede)}</p></div>
</section>
<section class="paper" style="padding-bottom:var(--sec)"><div class="g legal">
  <nav class="legal-nav" aria-label="On this page"><p>On this page</p><ul>${L.sections.map(([h]) => `<li><a class="u" href="#${slug(h)}">${esc(h)}</a></li>`).join('')}</ul></nav>
  <div class="legal-body">${L.sections.map(([h, parts]) => `<h2 id="${slug(h)}">${esc(h)}</h2>${parts.map(part).join('')}`).join('')}</div>
</div></section>`;
  page({ file, title, current: '', body });
}
legal('privacy.html', PRIVACY, 'Privacy policy | AToure');
legal('terms.html', TERMS, 'Terms of use | AToure');

console.log('built', CASES.length + 6, 'pages');
