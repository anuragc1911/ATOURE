# AToure rebuild

A redesign of atoureconsulting.com in the style of JARCOS (jarcos.work): a white first screen with the ATOURE wordmark set edge to edge and a rotating photograph showing through the letters, then black and white fields with label-and-content rows.

## Layout

- `site/` is the finished static site. Upload this folder as is. The file names match the current site (`index.html`, `our-work.html`, `ishowspeed-afcon.html` and so on), so existing links keep working.
- `site/Media/`, `site/index carousel/` hold every photograph, logo and video from the current site.
- `site/assets/style.css`, `site/assets/main.js` hold the design and behaviour.
- `build/data.mjs` holds all page copy. Edit text here, then rebuild.
- `build/build.mjs` holds the page templates.

## Build and preview

```bash
node build/build.mjs
```

```bash
python3 -m http.server 4321 --directory site
```

Then open http://localhost:4321.

## What carries over and what doesn't

- All 14 pages, every case study, all photography and video, the Africa map, the contact form (same Formspree endpoint, `mwvwjveo`), privacy and terms.
- Not yet carried over: the French language toggle (`lang.js` on the current site), the cookie banner, and the analytics tags it gates.
