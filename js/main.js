/* ==========================================================================
   Shared interactions — loading screen, scroll reveals, before/after slider,
   colour card stack. Each part only runs if its markup is on the page.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');

  var site = document.querySelector('.site');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ready = false;

  // Footer year
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Fit big titles to the page width ----------
     The name (and the About title) are sized in CSS to roughly fill the width, but
     letter widths vary by font and computer. This measures the real rendered width
     and scales the type so it fills the space exactly without ever being cut off. */
  function fitTitles() {
    document.querySelectorAll('[data-fit]').forEach(function (el) {
      el.style.fontSize = '';
      var max = parseFloat(el.getAttribute('data-fit-max')) || Infinity;
      var parent = el.parentElement, ps = getComputedStyle(parent);
      var avail = parent.clientWidth - parseFloat(ps.paddingLeft) - parseFloat(ps.paddingRight);
      var lines = el.querySelectorAll('.line');
      var left = Infinity, right = -Infinity;
      lines.forEach(function (l) { var r = l.getBoundingClientRect(); left = Math.min(left, r.left); right = Math.max(right, r.right); });
      var used = right - left;
      if (!used || !avail) return;
      var size = parseFloat(getComputedStyle(el).fontSize) * (avail / used) * 0.995;
      el.style.fontSize = Math.min(size, max) + 'px';
    });
  }
  fitTitles();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTitles);
  var fitFrame;
  window.addEventListener('resize', function () {
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(fitTitles);
  });

  /* ---------- Scroll reveals ---------- */
  var pending = [];
  function show(el) { el.classList.add('is-in'); }

  var io = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          if (ready) show(e.target); else pending.push(e.target);
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 })
    : null;

  var revealEls = document.querySelectorAll('.rv');
  if (io) revealEls.forEach(function (el) { io.observe(el); });

  function setReady() {
    if (ready) return;
    ready = true;
    if (site) site.classList.add('is-ready');
    if (io) { pending.forEach(show); pending = []; }
    else revealEls.forEach(show);
  }

  /* ---------- Loading screen (home page) ---------- */
  var loader = document.querySelector('.loader');
  if (loader && !reduceMotion) {
    setTimeout(function () { loader.classList.add('is-out'); }, 1500);
    setTimeout(setReady, 1700);
    setTimeout(function () { loader.remove(); }, 2600);
  } else {
    if (loader) loader.remove();
    // Small delay so the entrance transitions still play on project pages
    setTimeout(setReady, reduceMotion ? 0 : 60);
  }

  /* ---------- Before / after slider ---------- */
  document.querySelectorAll('[data-compare]').forEach(function (fig) {
    var range = fig.querySelector('.cmp-range');
    var layer = fig.querySelector('.cmp-new');
    var handle = fig.querySelector('.cmp-handle');
    var knob = fig.querySelector('.cmp-knob');
    var tag = fig.querySelector('.cmp-tag');
    var hint = fig.querySelector('.cmp-hint');

    function update() {
      var pos = parseFloat(range.value) || 0;          // 0 = all original, 100 = all polished
      layer.style.clipPath = 'inset(0 ' + (100 - pos) + '% 0 0)';
      handle.style.left = pos + '%';
      knob.style.transform = 'translateX(' + (pos < 4 ? '0px' : pos > 96 ? '-44px' : '-22px') + ')';
      var polished = pos >= 50;
      tag.textContent = polished ? 'Polished ver.' : 'Original ver.';
      range.setAttribute('aria-valuetext', polished ? 'Showing mostly the polished version' : 'Showing mostly the original version');
    }
    range.addEventListener('input', function () {
      if (hint) hint.classList.add('is-hidden');
      update();
    });
    update();
  });

  /* ---------- Colour card stack ---------- */
  var stack = document.querySelector('[data-colour-stack]');
  if (stack) {
    var cards = stack.querySelectorAll('.ccard');
    var swatches = document.querySelectorAll('[data-swatch]');
    var count = cards.length;
    var active = 0;
    var paused = false;

    function paint() {
      cards.forEach(function (card, i) {
        var d = (i - active + count) % count;
        card.className = 'ccard d' + d;
        card.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
      });
      swatches.forEach(function (sw, i) { sw.classList.toggle('is-active', i === active); });
    }
    paint();

    if (!reduceMotion) {
      setInterval(function () {
        if (paused || document.hidden) return;
        active = (active + 1) % count;
        paint();
      }, 1900);
      stack.addEventListener('mouseenter', function () { paused = true; });
      stack.addEventListener('mouseleave', function () { paused = false; });
    }
  }
})();
