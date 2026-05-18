/* =====================================================
   TRUSTEP JAPAN — Site JS (Motion / Nav / Forms)
   ===================================================== */
(function(){
  'use strict';
  document.body.classList.add('is-anim-ready');

  /* --- Header scroll behavior --- */
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress');
  let lastY = window.scrollY;
  function onScroll(){
    const y = window.scrollY;
    if (header){
      if (y > 80) header.classList.add('is-scrolled'); else header.classList.remove('is-scrolled');
      if (y > 240 && y > lastY + 4) header.classList.add('is-hidden');
      else if (y < lastY - 4) header.classList.remove('is-hidden');
    }
    if (progress){
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docH > 0 ? Math.min(1, Math.max(0, y / docH)) : 0;
      progress.style.transform = 'scaleX(' + ratio.toFixed(3) + ')';
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* --- Mobile menu --- */
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (menuToggle && mobileMenu){
    menuToggle.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('is-open');
      menuToggle.classList.toggle('is-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      menuToggle.classList.remove('is-open');
      document.body.style.overflow = '';
    }));
  }

  /* --- Active nav highlight --- */
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.site-nav a.nav-item, .mobile-menu a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (!href || href.startsWith('http') || href.startsWith('#')) return;
    if (href === here || (here === '' && href === 'index.html')){
      a.classList.add('is-active');
    }
  });

  /* --- Reveal on scroll (IntersectionObserver) --- */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('.reveal, .reveal-stagger');
  if (reduced){
    items.forEach(el => el.classList.add('in'));
  } else if ('IntersectionObserver' in window){
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, {threshold:0.05, rootMargin:'0px 0px 0px 0px'});
    items.forEach(el => io.observe(el));
    // Fallback: reveal elements already in viewport on load (covers
    // cases where IO doesn't fire early — e.g. tall pages, async fonts)
    const showIfVisible = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      items.forEach(el => {
        if (el.classList.contains('in')) return;
        const r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0){
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    };
    requestAnimationFrame(() => requestAnimationFrame(showIfVisible));
    // Safety net for stalled observers
    setTimeout(showIfVisible, 600);
  } else {
    items.forEach(el => el.classList.add('in'));
  }

  /* --- 3D tilt cards --- */
  document.querySelectorAll('.card-3d').forEach(card => {
    let rect;
    function update(e){
      rect = rect || card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = (x / rect.width - 0.5) * 2;
      const py = (y / rect.height - 0.5) * 2;
      const rotY = px * 6;
      const rotX = -py * 6;
      card.style.transform = 'perspective(1000px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg)';
    }
    card.addEventListener('pointerenter', () => { rect = card.getBoundingClientRect(); });
    card.addEventListener('pointermove', update);
    card.addEventListener('pointerleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      rect = null;
    });
  });

  /* --- Card glow follow --- */
  document.querySelectorAll('.card-glow').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left)) + 'px');
      card.style.setProperty('--my', ((e.clientY - r.top)) + 'px');
    });
  });

  /* --- Magnetic buttons --- */
  document.querySelectorAll('.magnetic').forEach(el => {
    let rect;
    el.addEventListener('pointerenter', () => { rect = el.getBoundingClientRect(); });
    el.addEventListener('pointermove', e => {
      if (!rect) return;
      const x = e.clientX - rect.left - rect.width/2;
      const y = e.clientY - rect.top - rect.height/2;
      el.style.transform = 'translate3d(' + (x * 0.18).toFixed(2) + 'px, ' + (y * 0.18).toFixed(2) + 'px, 0)';
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = 'translate3d(0,0,0)';
      rect = null;
    });
  });

  /* --- Counter (data-count) --- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window){
    const co = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const dur = parseInt(el.dataset.duration || '1400', 10);
        const suffix = el.dataset.suffix || '';
        const start = performance.now();
        const fmt = el.dataset.format === 'comma';
        function step(now){
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          const v = target * eased;
          el.textContent = (fmt ? Math.round(v).toLocaleString() : (Number.isInteger(target) ? Math.round(v) : v.toFixed(1))) + suffix;
          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, {threshold:0.4});
    counters.forEach(el => co.observe(el));
  }

  /* --- Accordion --- */
  document.querySelectorAll('.accordion-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      const content = item.querySelector('.accordion-content');
      const open = item.classList.toggle('is-open');
      if (open){
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = '0px';
      }
    });
  });

  /* --- Custom cursor (desktop) --- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth >= 1024){
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    let rx = 0, ry = 0, dx = 0, dy = 0;
    document.addEventListener('pointermove', e => {
      dx = e.clientX; dy = e.clientY;
      dot.style.transform = 'translate(' + dx + 'px,' + dy + 'px) translate(-50%,-50%)';
    });
    function ringLoop(){
      rx += (dx - rx) * 0.18;
      ry += (dy - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(ringLoop);
    }
    ringLoop();
    document.querySelectorAll('a, button, .card, [role="button"], .accordion-trigger').forEach(el => {
      el.addEventListener('pointerenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('pointerleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* --- Smooth anchor scroll within page --- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  /* --- Year auto-fill --- */
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  /* --- Visitor / Page-view tracker (localStorage) --- */
  try {
    const KEY = 'trustep_stats_v1';
    const data = JSON.parse(localStorage.getItem(KEY) || '{}');
    const now = new Date();
    const today = now.toISOString().slice(0,10);
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    data.totalViews = (data.totalViews || 0) + 1;
    data.firstVisit = data.firstVisit || now.toISOString();
    data.lastVisit = now.toISOString();
    data.pages = data.pages || {};
    data.pages[path] = (data.pages[path] || 0) + 1;
    data.daily = data.daily || {};
    data.daily[today] = (data.daily[today] || 0) + 1;
    if (!sessionStorage.getItem('trustep_session')){
      sessionStorage.setItem('trustep_session', '1');
      data.uniqueSessions = (data.uniqueSessions || 0) + 1;
      data.referrers = data.referrers || {};
      const ref = document.referrer ? new URL(document.referrer).hostname : '(direct)';
      data.referrers[ref] = (data.referrers[ref] || 0) + 1;
    }
    // Keep daily history small (last 90 days)
    const dailyKeys = Object.keys(data.daily).sort();
    while (dailyKeys.length > 90){ const k = dailyKeys.shift(); delete data.daily[k]; }
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch(e){ /* ignore */ }
})();
