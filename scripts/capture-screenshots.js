// Capture responsive screenshots of QUANTEC PRO landing page
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = process.env.TARGET_URL || 'http://localhost:5051/';
const OUT_DIR = path.join(__dirname, '_shots');

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const TABS = ['pessoa', 'empresa', 'pet'];

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const errors = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n=== Viewport: ${vp.name} (${vp.width}x${vp.height}) ===`);
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', err => consoleErrors.push('PAGE ERROR: ' + err.message));

    try {
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      console.error(`  navigate failed: ${e.message}`);
      errors.push({ viewport: vp.name, issue: 'navigation_failed', detail: e.message });
      await context.close();
      continue;
    }

    // Wait for reveal animations to settle
    await page.waitForTimeout(1200);

    // Disable animations for cleaner screenshot
    await page.addStyleTag({ content: `
      *, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; }
      .reveal { opacity: 1 !important; transform: none !important; }
    ` });

    // Full-page screenshot
    await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}-full.png`), fullPage: true });
    console.log(`  ✓ full-page screenshot saved`);

    // Hero section
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}-hero.png`) });
    console.log(`  ✓ hero screenshot saved`);

    // Scroll to "Para quem é" section
    await page.evaluate(() => {
      const el = document.querySelector('#para-quem');
      if (el) {
        const headerH = document.querySelector('.site-header')?.offsetHeight || 0;
        const top = el.getBoundingClientRect().top + window.scrollY - headerH - 12;
        window.scrollTo({ top, behavior: 'instant' });
      }
    });
    await page.waitForTimeout(400);

    // Click each tab and screenshot
    for (const tabKey of TABS) {
      const tabSelector = `.tab[data-tab="${tabKey}"]`;
      const exists = await page.$(tabSelector);
      if (!exists) {
        console.log(`  ⚠ tab ${tabKey} not found`);
        continue;
      }
      await page.click(tabSelector);
      await page.waitForTimeout(400);

      // Capture the section + viewport both, so we see sticky in context
      const sectionEl = await page.$('#para-quem');
      if (sectionEl) {
        await sectionEl.screenshot({ path: path.join(OUT_DIR, `${vp.name}-tab-${tabKey}.png`) });
        console.log(`  ✓ tab "${tabKey}" section screenshot saved`);
      }
      // Also capture the viewport (to see sticky CTA position relative to content)
      await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}-tab-${tabKey}-viewport.png`) });

      // Check which panel is active and whether it actually shows
      const activePanel = await page.evaluate(() => {
        const p = document.querySelector('.tab-panel.active');
        if (!p) return { key: null, visible: false };
        const rect = p.getBoundingClientRect();
        const style = window.getComputedStyle(p);
        return {
          key: p.dataset.panel,
          visible: style.display !== 'none' && !p.hasAttribute('hidden'),
          display: style.display,
          height: rect.height,
          width: rect.width,
          text: p.innerText.slice(0, 80),
        };
      });
      console.log(`    active panel: ${activePanel.key} | visible=${activePanel.visible} | ${activePanel.width}x${activePanel.height}`);

      if (!activePanel.visible || activePanel.height < 50) {
        errors.push({ viewport: vp.name, tab: tabKey, issue: 'panel_not_showing', detail: activePanel });
      }
    }

    // Plans section
    await page.evaluate(() => {
      const el = document.querySelector('#planos');
      if (el) el.scrollIntoView({ block: 'start' });
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}-plans.png`) });
    console.log(`  ✓ plans screenshot saved`);

    // Plans individual cards
    const planCards = await page.$$('.plan');
    for (let i = 0; i < planCards.length; i++) {
      const card = planCards[i];
      const cls = await card.evaluate(el => el.className);
      await card.screenshot({ path: path.join(OUT_DIR, `${vp.name}-plan-${i}${cls.includes('featured') ? '-featured' : ''}.png`) });
    }

    // Check for horizontal overflow on body
    const overflow = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      return { docWidth: docW, winWidth: winW, overflow: docW > winW };
    });
    console.log(`  document width=${overflow.docWidth}, window=${overflow.winWidth}, overflow=${overflow.overflow}`);
    if (overflow.overflow) {
      errors.push({ viewport: vp.name, issue: 'horizontal_overflow', detail: overflow });
    }

    if (consoleErrors.length) {
      console.log(`  ⚠ console errors: ${consoleErrors.length}`);
      consoleErrors.forEach(e => console.log(`    ${e}`));
      errors.push({ viewport: vp.name, issue: 'console_errors', detail: consoleErrors });
    }

    await context.close();
  }

  await browser.close();

  console.log(`\n=== Summary ===`);
  console.log(`Errors: ${errors.length}`);
  if (errors.length) {
    console.log(JSON.stringify(errors, null, 2));
  }
  console.log(`\nScreenshots saved to: ${OUT_DIR}`);
})();
