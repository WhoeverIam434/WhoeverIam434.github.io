/* ============================================================
   Cheuk Hin Li — personal site behaviour
   Vanilla JS, no dependencies. Everything degrades gracefully.
   ============================================================ */
(function () {
  'use strict';

  /* ── Edit these two links to point at your own profiles ── */
  var PROFILES = {
    github: '',   // e.g. 'https://github.com/your-handle'
    linkedin: ''  // e.g. 'https://www.linkedin.com/in/your-handle'
  };

  var root = document.documentElement;
  var isZh = function () { return root.lang === 'zh'; };

  /* ───────────────────────── storage helpers ───────────────────────── */
  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
  function read(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  /* ───────────────────────── toast ───────────────────────── */
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  function toast(message) {
    if (!toastEl) return;
    var zh = {
      'Theme: light': '主题：浅色',
      'Theme: dark': '主题：深色',
      'Email copied': '邮箱已复制',
      'Copy failed — email: marcoli434ovo@gmail.com': '复制失败 — 邮箱：marcoli434ovo@gmail.com',
      'Add your GitHub URL in assets/js/main.js': '请在 assets/js/main.js 中填写 GitHub 链接',
      'Add your LinkedIn URL in assets/js/main.js': '请在 assets/js/main.js 中填写 LinkedIn 链接'
    };
    toastEl.textContent = zh[message] && isZh() ? zh[message] : message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  /* ───────────────────────── theme ───────────────────────── */
  var themeBtn = document.getElementById('themeToggle');
  function setTheme(mode) {
    root.dataset.theme = mode;
    store('chl-theme', mode);
    if (themeBtn) {
      var label = isZh()
        ? (mode === 'dark' ? '切换到浅色主题' : '切换到深色主题')
        : (mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      themeBtn.setAttribute('aria-label', label);
      themeBtn.setAttribute('title', label);
    }
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      setTheme(next);
      toast(next === 'dark' ? 'Theme: dark' : 'Theme: light');
    });
    setTheme(root.dataset.theme || 'dark');
  }

  /* ───────────────────────── language ───────────────────────── */
  var langBtn = document.getElementById('langToggle');
  function applyLang(lang) {
    root.lang = lang;
    store('chl-lang', lang);
    if (langBtn) {
      var label = lang === 'en' ? 'Switch to Chinese / 切换到中文' : 'Switch to English / 切换到英文';
      langBtn.setAttribute('aria-label', label);
      langBtn.setAttribute('title', label);
    }
    if (themeBtn) setTheme(root.dataset.theme || 'dark');
  }
  if (langBtn) {
    langBtn.addEventListener('click', function () {
      applyLang(isZh() ? 'en' : 'zh');
    });
  }
  applyLang(read('chl-lang') === 'zh' ? 'zh' : 'en');

  /* ───────────────────────── nav: scrolled state ───────────────────────── */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ───────────────────────── nav: mobile menu ───────────────────────── */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  function closeMenu() {
    if (!links || !toggle) return;
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ───────────────────────── nav: active section ───────────────────────── */
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
  var sections = navAnchors
    .map(function (a) { return document.getElementById(a.dataset.nav); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var current = null;
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (current === entry.target.id) return;
        current = entry.target.id;
        navAnchors.forEach(function (a) {
          var on = a.dataset.nav === current;
          a.classList.toggle('active', on);
          if (on) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ───────────────────────── reveal on scroll ───────────────────────── */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.slice.call(el.parentElement.children);
        var index = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = Math.min(index * 70, 350) + 'ms';
        el.classList.add('visible');
        obs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revealer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ───────────────────────── copy email ───────────────────────── */
  var EMAIL = 'marcoli434ovo@gmail.com';
  var copyBtn = document.getElementById('copyEmail');
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('copy failed'));
      } catch (err) { reject(err); }
    });
  }
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      copyText(EMAIL).then(function () {
        toast(isZh() ? '邮箱已复制' : 'Email copied');
      }).catch(function () {
        toast(isZh() ? '复制失败 — 邮箱：marcoli434ovo@gmail.com' : 'Copy failed — email: ' + EMAIL);
      });
    });
  }

  /* ───────────────────────── profile links ───────────────────────── */
  function wireProfile(id, url, label) {
    var a = document.getElementById(id);
    if (!a) return;
    if (url) {
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    } else {
      a.removeAttribute('href');
      a.setAttribute('role', 'button');
      a.setAttribute('tabindex', '0');
      var warn = function (e) {
        e.preventDefault();
        toast(isZh()
          ? '请在 assets/js/main.js 中填写 ' + label + ' 链接'
          : 'Add your ' + label + ' URL in assets/js/main.js');
      };
      a.addEventListener('click', warn);
      a.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') warn(e);
      });
      a.classList.add('is-placeholder');
      a.setAttribute('title', isZh() ? '待填写 ' + label + ' 链接' : 'Add ' + label + ' URL');
    }
  }

  /* ───────────────────────── print + year ───────────────────────── */
  var printBtn = document.getElementById('printBtn');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Re-wire profile placeholders whenever the language changes, */
  /* since their tooltips are localised.                        */
  function refreshI18nWidgets() {
    wireProfile('githubLink', PROFILES.github, 'GitHub');
    wireProfile('linkedinLink', PROFILES.linkedin, 'LinkedIn');
  }
  refreshI18nWidgets();
  if (langBtn) langBtn.addEventListener('click', function () {
    setTimeout(refreshI18nWidgets, 0);
  });

  /* ───────────────────────── hero pointer glow (subtle, desktop only) ───────────────────────── */
  var hero = document.querySelector('.hero');
  if (hero && window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var glowA = hero.querySelector('.glow-a');
    var raf = null;
    hero.addEventListener('mousemove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        var r = hero.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width - 0.5) * 26;
        var y = ((e.clientY - r.top) / r.height - 0.5) * 22;
        if (glowA) glowA.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
    });
    hero.addEventListener('mouseleave', function () {
      if (glowA) glowA.style.transform = '';
    });
  }
})();
