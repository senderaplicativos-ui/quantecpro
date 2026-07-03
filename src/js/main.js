/* =================================================================
   QUANTEC® PRO — Landing Page JS
   - Quantum wave canvas animation (background)
   - Device quantum canvas (hero)
   - Pet interactive canvas (cursor attracts particles)
   - Scroll reveal
   - Header scroll state
   - Tabs (Pessoa / Empresa / Pet)
   - Year stamp
   - Sticky CTA
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
    { r: 214, g: 180, b: 117, a: 0.10 },
    { r: 232, g: 201, b: 138, a: 0.07 },
    { r: 79,  g: 139, b: 255, a: 0.06 },
    { r: 168, g: 138, b: 86,  a: 0.08 },
  ];

  function makeWave(yOffset, colorIdx, freq, amp, speed) {
    return { yOffset, color: COLORS[colorIdx % COLORS.length], freq, amp, speed, phase: Math.random() * Math.PI * 2, points: [] };
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

    waves.forEach((w) => {
      w.phase += w.speed * dt;
      ctx.beginPath();
      const step = 6;
      for (let x = 0; x <= width; x += step) {
        const y =
          w.yOffset * height +
          Math.sin(x * w.freq + w.phase) * w.amp +
          Math.sin(x * w.freq * 2.3 + w.phase * 0.7) * (w.amp * 0.35) +
          Math.sin(x * w.freq * 0.5 - w.phase * 0.5) * (w.amp * 0.2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      const c = w.color;
      ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a * 1.6})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = `rgba(${c.r}, ${c.g}, ${c.b}, 0.5)`;
      ctx.shadowBlur = 18;
      ctx.stroke();
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
    if (document.hidden) { rafId = null; return; }
    if (rafId == null) { lastTs = 0; rafId = requestAnimationFrame(draw); }
  }
  function stopCanvas() {
    if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
  }

  resize();
  startCanvas();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopCanvas(); else startCanvas();
  });

  /* ===== 1b. DEVICE QUANTUM CANVAS ===== */
  const dcanvas = document.getElementById('device-canvas');
  if (dcanvas) {
    const dctx = dcanvas.getContext('2d');
    let dw = 0, dh = 0, ddpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let bolts = [];
    let lastBolt = 0;

    const DCOLORS = {
      gold:  [214, 180, 117],
      pink:  [231, 168, 168],
      blue:  [79, 139, 255],
    };

    function resizeDeviceCanvas() {
      const rect = dcanvas.parentElement.getBoundingClientRect();
      dw = rect.width;
      dh = rect.height;
      dcanvas.width = dw * ddpr;
      dcanvas.height = dh * ddpr;
      dcanvas.style.width = dw + 'px';
      dcanvas.style.height = dh + 'px';
      dctx.setTransform(ddpr, 0, 0, ddpr, 0, 0);
      particles = [];
      const count = Math.floor((dw * dh) / 14000);
      for (let i = 0; i < count; i++) {
        particles.push({
          angle: Math.random() * Math.PI * 2,
          radius: 0.25 + Math.random() * 0.65,
          speed: 0.0006 + Math.random() * 0.0012,
          size: 0.6 + Math.random() * 1.8,
          color: Math.random() < 0.6 ? 'gold' : (Math.random() < 0.5 ? 'pink' : 'blue'),
          alpha: 0.3 + Math.random() * 0.6,
        });
      }
    }

    function makeBolt(cx, cy, maxR) {
      const segs = 12;
      const points = [{ x: cx, y: cy }];
      let x = cx, y = cy;
      for (let i = 0; i < segs; i++) {
        const targetR = (i + 1) / segs * maxR;
        const targetAngle = Math.random() * Math.PI * 2;
        const tx = cx + Math.cos(targetAngle) * targetR;
        const ty = cy + Math.sin(targetAngle) * targetR;
        const mx = (x + tx) / 2 + (Math.random() - 0.5) * 40;
        const my = (y + ty) / 2 + (Math.random() - 0.5) * 40;
        points.push({ x: mx, y: my });
        points.push({ x: tx, y: ty });
        x = tx; y = ty;
      }
      return { points, life: 1 };
    }

    let draf = null, dlastTs = 0;
    function drawDevice(ts) {
      if (!dcanvas) return;
      const dt = dlastTs ? Math.min(ts - dlastTs, 50) : 16;
      dlastTs = ts;
      const cx = dw / 2, cy = dh / 2;
      const minR = Math.min(dw, dh) / 2;
      dctx.clearRect(0, 0, dw, dh);

      const pulse = 1 + Math.sin(ts * 0.0018) * 0.06;
      const haloGrad = dctx.createRadialGradient(cx, cy, minR * 0.1, cx, cy, minR * 1.05);
      haloGrad.addColorStop(0, 'rgba(214, 180, 117, 0.20)');
      haloGrad.addColorStop(0.5, 'rgba(214, 180, 117, 0.06)');
      haloGrad.addColorStop(1, 'rgba(214, 180, 117, 0)');
      dctx.fillStyle = haloGrad;
      dctx.beginPath();
      dctx.arc(cx, cy, minR * 1.05 * pulse, 0, Math.PI * 2);
      dctx.fill();

      dctx.strokeStyle = 'rgba(214, 180, 117, 0.18)';
      dctx.lineWidth = 1;
      dctx.beginPath();
      dctx.arc(cx, cy, minR * 0.95, 0, Math.PI * 2);
      dctx.stroke();

      particles.forEach((p) => {
        p.angle += p.speed * dt;
        const r = p.radius * minR * 1.05;
        const x = cx + Math.cos(p.angle) * r;
        const y = cy + Math.sin(p.angle) * r;
        const c = DCOLORS[p.color];
        dctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${p.alpha})`;
        dctx.shadowColor = `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0.8)`;
        dctx.shadowBlur = 8;
        dctx.beginPath();
        dctx.arc(x, y, p.size, 0, Math.PI * 2);
        dctx.fill();
      });
      dctx.shadowBlur = 0;

      if (ts - lastBolt > 600 && Math.random() < 0.6) {
        bolts.push(makeBolt(cx, cy, minR * 1.0));
        lastBolt = ts;
      }
      bolts.forEach((b) => { b.life -= dt / 400; });
      bolts = bolts.filter((b) => b.life > 0);
      bolts.forEach((b) => {
        dctx.beginPath();
        const pts = b.points;
        dctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) dctx.lineTo(pts[i].x, pts[i].y);
        dctx.strokeStyle = `rgba(231, 168, 168, ${0.55 * b.life})`;
        dctx.lineWidth = 1.4;
        dctx.shadowColor = 'rgba(231, 168, 168, 0.9)';
        dctx.shadowBlur = 12;
        dctx.stroke();
        dctx.strokeStyle = `rgba(214, 180, 117, ${0.35 * b.life})`;
        dctx.lineWidth = 0.6;
        dctx.stroke();
      });
      dctx.shadowBlur = 0;
      draf = requestAnimationFrame(drawDevice);
    }

    function startDeviceCanvas() {
      if (document.hidden) { draf = null; return; }
      if (draf == null) { dlastTs = 0; draf = requestAnimationFrame(drawDevice); }
    }
    function stopDeviceCanvas() {
      if (draf != null) { cancelAnimationFrame(draf); draf = null; }
    }

    resizeDeviceCanvas();
    startDeviceCanvas();
    let dresizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(dresizeTimer);
      dresizeTimer = setTimeout(resizeDeviceCanvas, 150);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopDeviceCanvas(); else startDeviceCanvas();
    });
  }

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
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
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

  /* ===== 5. SMOOTH ANCHOR SCROLL ===== */
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

  /* ===== 7. STICKY CTA ===== */
  const stickyCta = document.getElementById('sticky-cta');
  if (stickyCta) {
    let lastVisible = false;
    const updateSticky = () => {
      const hero = document.querySelector('.hero');
      const heroH = hero ? hero.offsetHeight : 600;
      const pastHero = window.scrollY > heroH * 0.7;
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
})()