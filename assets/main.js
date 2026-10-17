(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- wordmark: fit ATOURE to the full width ---------- */
  function fit() {
    $$('[data-stage]').forEach(function (st) {
      var w = st.querySelector('[data-fit]');
      if (!w) return;
      var cs = getComputedStyle(w);
      var pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      var avail = st.clientWidth - pad;
      var probe = document.createElement('span');
      probe.textContent = w.textContent;
      probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:' + cs.fontWeight + ' 100px ' + cs.fontFamily + ';letter-spacing:-.062em';
      document.body.appendChild(probe);
      var size = (avail / probe.getBoundingClientRect().width) * 100;
      probe.remove();
      st.style.setProperty('--F', size.toFixed(2) + 'px');
    });
  }
  fit();
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
    fit();
    var hero = $('#hero');
    if (hero) requestAnimationFrame(function () { hero.classList.add('ready'); });
  });
  var rt;
  addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(fit, 120); });

  /* ---------- local clocks ---------- */
  function timeIn(tz) {
    try { return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date()); }
    catch (e) { return ''; }
  }
  function tickClocks() {
    $$('[data-clock] [data-time]').forEach(function (el) { el.textContent = timeIn('Europe/London'); });
    var cur = $('.hero [data-slides] img.on');
    var ct = $('[data-captime]');
    if (cur && ct) ct.textContent = timeIn(cur.dataset.tz) + ' local';
  }
  tickClocks();
  setInterval(tickClocks, 15000);

  /* ---------- rotating photographs inside the wordmark stage ---------- */
  $$('[data-slides]').forEach(function (fig, k) {
    var imgs = $$('img', fig);
    if (imgs.length < 2) return;
    var i = 0, cap = $('[data-cap]', fig), t;
    function go() {
      imgs[i].classList.remove('on');
      i = (i + 1) % imgs.length;
      var im = imgs[i];
      if (im.loading === 'lazy') im.loading = 'eager';
      im.classList.add('on');
      if (cap) cap.textContent = im.dataset.cap;
      tickClocks();
    }
    function play() { clearInterval(t); if (!reduce) t = setInterval(go, 3400 + k * 600); }
    // Preload the next frames once the page has settled.
    addEventListener('load', function () { imgs.forEach(function (im) { im.loading = 'eager'; }); });
    play();
    document.addEventListener('visibilitychange', function () { document.hidden ? clearInterval(t) : play(); });
  });

  /* ---------- fixed bar once the meta row is out of view ---------- */
  var bar = $('#bar'), meta = $('#meta');
  // Bar ink follows the field underneath it: light on night sections, dark on paper.
  function barInk() {
    if (!bar) return;
    var y = bar.offsetHeight / 2, dark = false;
    var els = document.elementsFromPoint(innerWidth / 2, y);
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (bar.contains(el)) continue;
      var f = el.closest('.night, .foot, .paper, .head, .hero, .foot-stage, .bleed, .vid');
      if (f) { dark = !(f.matches('.paper, .head, .hero, .foot-stage')); break; }
    }
    bar.classList.toggle('dark', dark);
  }
  addEventListener('scroll', function () { requestAnimationFrame(barInk); }, { passive: true });
  barInk();
  if (bar && meta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { bar.classList.toggle('on', !e[0].isIntersecting); }).observe(meta);
  }
  var sheet = $('#sheet'), burger = $('#burger'), close = $('#close');
  function setSheet(on) {
    sheet.classList.toggle('on', on);
    sheet.setAttribute('aria-hidden', String(!on));
    burger.setAttribute('aria-expanded', String(on));
    document.body.style.overflow = on ? 'hidden' : '';
    if (on) close.focus(); else burger.focus();
  }
  if (sheet && burger) {
    burger.addEventListener('click', function () { setSheet(true); });
    close.addEventListener('click', function () { setSheet(false); });
    $$('a', sheet).forEach(function (a) { a.addEventListener('click', function () { setSheet(false); }); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet.classList.contains('on')) setSheet(false); });
  }

  /* ---------- reveal on scroll ---------- */
  var rv = $$('.rv, .mask');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- muted loops play only while visible ---------- */
  var vids = $$('video[data-auto]');
  if (vids.length && 'IntersectionObserver' in window) {
    var vo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting && !reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.3 });
    vids.forEach(function (v) { vo.observe(v); });
  }

  /* ---------- sideways photo strips ---------- */
  $$('[data-strip]').forEach(function (w) {
    var s = $('.strip', w), figs = $$('figure', s), count = $('[data-count]', w);
    function idx() {
      var x = s.scrollLeft + 4, n = 0;
      figs.forEach(function (f, i) { if (f.offsetLeft - s.offsetLeft <= x) n = i; });
      return n;
    }
    function upd() { if (count) count.textContent = (idx() + 1) + ' / ' + figs.length; }
    function to(i) {
      i = Math.max(0, Math.min(figs.length - 1, i));
      s.scrollTo({ left: figs[i].offsetLeft - s.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
    }
    $('[data-prev]', w).addEventListener('click', function () { to(idx() - 1); });
    $('[data-next]', w).addEventListener('click', function () { to(idx() + 1); });
    s.addEventListener('scroll', function () { requestAnimationFrame(upd); }, { passive: true });
    s.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); to(idx() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); to(idx() - 1); }
    });
  });

  /* ---------- Africa map ---------- */
  function initMap() {
    var svg = $('#africa');
    if (!svg || !window.AFRICA_PATHS) return;
    var ACC = { 'Liberia': 'Liberia', 'Niger': 'Niger', 'Mauritania': 'Mauritania', 'Congo': 'Republic of Congo', 'Gabon': 'Gabon', 'Uganda': 'Uganda', 'Kenya': 'Kenya', 'Tanzania': 'Tanzania' };
    var W = {
      "Côte d'Ivoire": { n: 'Ivory Coast', c: 'Abidjan', w: 'Race Weekend, our own Formula 1 event. The IShowSpeed tour with MTN and Solibra as national sponsors.', h: 'ivory-coast.html', tz: 'Africa/Abidjan' },
      'Morocco': { n: 'Morocco', c: 'Casablanca, Rabat', w: 'The AFCON 2025 Final, with CAF and the Royal Moroccan Football Federation.', h: 'ishowspeed-afcon.html', tz: 'Africa/Casablanca' },
      'Ghana': { n: 'Ghana', c: 'Accra', w: 'First leg of the Ashton Hall Africa Tour.', h: 'ashton-hall-africa-tour.html#ghana', tz: 'Africa/Accra' },
      'Cameroon': { n: 'Cameroon', c: 'Douala', w: 'Second leg of the Ashton Hall Africa Tour.', h: 'ashton-hall-africa-tour.html#cameroon', tz: 'Africa/Douala' },
      'Nigeria': { n: 'Nigeria', c: 'Lagos', w: 'Third leg of the Ashton Hall Africa Tour.', h: 'ashton-hall-africa-tour.html#nigeria', tz: 'Africa/Lagos' },
      'Benin': { n: 'Benin', c: 'Cotonou', w: 'Fourth leg of the Ashton Hall Africa Tour.', h: 'ashton-hall-africa-tour.html#benin', tz: 'Africa/Porto-Novo' },
      'Rwanda': { n: 'Rwanda', c: 'Kigali', w: 'Final leg of the Ashton Hall Africa Tour.', h: 'ashton-hall-africa-tour.html#rwanda', tz: 'Africa/Kigali' }
    };
    var NS = 'http://www.w3.org/2000/svg', tip = $('#mapTip'), list = $('#mapList'), det = $('#mapDetail'), paths = {}, btns = {};
    window.AFRICA_PATHS.forEach(function (c) {
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', c.d);
      var w = W[c.name], a = ACC[c.name];
      if (w) {
        p.setAttribute('class', 'on');
        p.setAttribute('tabindex', '0');
        p.setAttribute('role', 'button');
        p.setAttribute('aria-label', w.n);
        paths[c.name] = p;
        p.addEventListener('click', function () { sel(c.name); });
        p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sel(c.name); } });
      } else if (a) p.setAttribute('class', 'acc');
      p.addEventListener('mousemove', function (e) {
        var b = svg.parentNode.getBoundingClientRect();
        tip.hidden = false;
        tip.textContent = w ? w.n : a ? a + ' · access through our network' : c.name;
        tip.style.left = (e.clientX - b.left + 14) + 'px';
        tip.style.top = (e.clientY - b.top + 14) + 'px';
      });
      p.addEventListener('mouseleave', function () { tip.hidden = true; });
      svg.appendChild(p);
    });
    list.innerHTML = '';
    Object.keys(W).forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = W[k].n;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { sel(k); });
      list.appendChild(b);
      btns[k] = b;
    });
    var cur;
    function sel(k) {
      if (cur) { paths[cur].classList.remove('sel'); btns[cur].setAttribute('aria-pressed', 'false'); }
      cur = k;
      paths[k].classList.add('sel');
      btns[k].setAttribute('aria-pressed', 'true');
      var w = W[k];
      det.innerHTML = '<h3></h3><p class="lbl"></p><p></p><a></a>';
      det.children[0].textContent = w.n;
      det.children[1].textContent = w.c + ' · ' + timeIn(w.tz) + ' local time';
      det.children[2].textContent = w.w;
      det.children[3].textContent = 'Read the case →';
      det.children[3].href = w.h;
    }
    sel("Côte d'Ivoire");
  }
  if (window.AFRICA_PATHS) initMap(); else addEventListener('load', initMap);

  /* ---------- enquiry form (Formspree) ---------- */
  var form = $('#enquiry');
  if (form) {
    var msg = $('[data-msg]', form), btn = $('button[type=submit]', form);
    function say(t, s) { msg.hidden = false; msg.textContent = t; msg.dataset.s = s; }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = $$('input[required]', form).filter(function (i) { return !i.checkValidity(); });
      if (bad.length) {
        bad[0].focus();
        say(bad[0].type === 'email' ? 'Please add a valid email address so we can reply.' : 'Please add your name and email so we can reply.', 'err');
        return;
      }
      btn.disabled = true;
      btn.firstChild.textContent = 'Sending… ';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error();
          form.reset();
          say('Thank you. We’ll reply within 24 hours.', 'ok');
        })
        .catch(function () { say('That didn’t send. Email general@atoureconsulting.com or message us on WhatsApp and we’ll pick it up.', 'err'); })
        .then(function () { btn.disabled = false; btn.firstChild.textContent = 'Send enquiry '; });
    });
  }
})();
