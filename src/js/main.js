/* =================================================================
   QUANTEC® PRO — Landing Page JS
   - Quantum wave canvas animation (background)
   - Scroll reveal
   - Header scroll state
   - Tabs (Pessoa / Empresa / Pet)
   - Year stamp
   ================================================================= */

(() => {
  'use strict';

  /* ===== 1. QUANTUM WAVE CANVAS ===== */
  const canvas = document.getElementById('quantum-canvas');
  const ctx = canvas?.getContext('2d');
  let waves = [];
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0, height = 0;
  let rafId = null;
  let lastTs = 0;

  const COLORS = [
    { r: 214, g: 180, b: 117, a: 0.10 }, // gold
    { r: 232, g: 201, b: 138, a: 0.07 }, // light gold
    { r: 79,  g: 139, b: 255, a: 0.06 }, // blue
    { r: 168, g: 138, b: 86,  a: 0.08 }, // mid gold
  ];

  function makeWave(yOffset, colorIdx, freq, amp, speed) {
    return {
      yOffset,
      color: COLORS[colorIdx % COLORS.length],
      freq,
      amp,
      speed,
      phase: Math.random() * Math.PI * 2,
      points: [],
    };
  }

  function resize() {
    if (!canvas || !ctx) return;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Re-create waves for new size
    waves = [
      makeWave(0.30, 0, 0.0012, 50, 0.00020),
      makeWave(0.45, 1, 0.0016, 70, 0.00015),
      makeWave(0.60, 2, 0.0010, 90, 0.00025),
      makeWave(0.75, 3, 0.0020, 60, 0.00018),
      makeWave(0.85, 0, 0.0008, 110, 0.00030),
    ];
  }

  function draw(ts) {
    if (!canvas || !ctx) return;
    const dt = lastTs ? Math.min(ts - lastTs, 50) : 16;
    lastTs = ts;

    ctx.clearRect(0, 0, width, height);

    // Slight dark tint base (very subtle)
    // (skipped: keeps bg transparent so dark base color shows)

    waves.forEach((w) => {
      w.phase += w.speed * dt;
      ctx.beginPath();
      const step = 6; // sample every 6px
      for (let x = 0; x <= width; x += step) {
        // Layered sine for organic feel
        const y =
          w.yOffset * height +
          Math.sin(x * w.freq + w.phase) * w.amp +
          Math.sin(x * w.freq * 2.3 + w.phase * 0.7) * (w.amp * 0.35) +
          Math.sin(x * w.freq * 0.5 - w.phase * 0.5) * (w.amp * 0.2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      const c = w.color;
      // Glow stroke
      ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a * 1.6})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = `rgba(${c.r}, ${c.g}, ${c.b}, 0.5)`;
      ctx.shadowBlur = 18;
      ctx.stroke();

      // Soft fill below wave for depth (only first 2 waves)
      if (waves.indexOf(w) < 2) {
        ctx.shadowBlur = 0;
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, w.yOffset * height - w.amp, 0, height);
        grad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a * 0.5})`);
        grad.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    });

    rafId = requestAnimationFrame(draw);
  }

  function startCanvas() {
    if (!canvas) return;
    // Pause on hidden tab to save battery
    if (document.hidden) {
      rafId = null;
      return;
    }
    if (rafId == null) {
      lastTs = 0;
      rafId = requestAnimationFrame(draw);
    }
  }
  function stopCanvas() {
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  resize();
  startCanvas();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
    }, 150);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopCanvas();
    else startCanvas();
  });

  /* ===== 2. HEADER SCROLL STATE ===== */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 30) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ===== 3. SCROLL REVEAL ===== */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // small stagger when multiple reveals appear in same section
          const target = entry.target;
          const siblings = Array.from(target.parentElement.querySelectorAll('.reveal'));
          const idx = siblings.indexOf(target);
          setTimeout(() => target.classList.add('is-visible'), Math.min(idx, 3) * 80);
          io.unobserve(target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    // Fallback: show all
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ===== 4. TABS (Pessoa / Empresa / Pet) ===== */
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const key = tab.dataset.tab;
      tabs.forEach((t) => {
        const isActive = t === tab;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      panels.forEach((p) => {
        const isActive = p.dataset.panel === key;
        p.classList.toggle('active', isActive);
        if (isActive) p.removeAttribute('hidden');
        else p.setAttribute('hidden', '');
      });
    });
  });

  /* ===== 5. SMOOTH ANCHOR SCROLL (account for sticky header) ===== */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ===== 6. YEAR STAMP ===== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===== 7. STICKY CTA — show only after scrolling past hero,
         hide near footer ===== */
  const stickyCta = document.getElementById('sticky-cta');
  if (stickyCta) {
    let lastVisible = false;
    const updateSticky = () => {
      const hero = document.querySelector('.hero');
      const heroH = hero ? hero.offsetHeight : 600;
      // Show once user has scrolled past ~70% of the hero
      const pastHero = window.scrollY > heroH * 0.7;
      // Hide once near footer
      const docH = document.documentElement.scrollHeight;
      const scrolled = window.scrollY + window.innerHeight;
      const nearEnd = scrolled >= docH - 240;
      const visible = pastHero && !nearEnd;
      if (visible === lastVisible) return;
      lastVisible = visible;
      stickyCta.style.opacity = visible ? '1' : '0';
      stickyCta.style.pointerEvents = visible ? 'auto' : 'none';
      stickyCta.style.transform = visible ? 'translateY(0)' : 'translateY(20px)';
    };
    window.addEventListener('scroll', updateSticky, { passive: true });
    window.addEventListener('resize', updateSticky);
    updateSticky();
  }

  /* ===== 8. GALLERY subtle parallax ===== */
  const gItems = document.querySelectorAll('.g-item img');
  if (gItems.length && window.matchMedia('(min-width: 700px)').matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          gItems.forEach((img) => {
            const rect = img.parentElement.getBoundingClientRect();
            const center = rect.top + rect.height / 2 - window.innerHeight / 2;
            const offset = Math.max(-30, Math.min(30, center * -0.05));
            img.style.transform = `translateY(${offset}px) scale(1.06)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
})();
