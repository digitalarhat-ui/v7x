import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const label = process.argv[2] || 'before';
const outDir = path.resolve('qa-artifacts');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: '/usr/bin/google-chrome',
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--disable-dev-shm-usage',
    '--no-sandbox'
  ]
});

const viewports = [
  { name: '390', width: 390, height: 844 },
  { name: '430', width: 430, height: 932 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 1000 },
];

const report = { label, startedAt: new Date().toISOString(), viewports: {} };

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => pageErrors.push(String(err)));
  page.on('requestfailed', req => failedRequests.push({ url: req.url(), error: req.failure()?.errorText || 'failed' }));

  const start = Date.now();
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('#stage canvas', { state: 'visible', timeout: 30000 });
  await page.waitForTimeout(2500);

  const metrics = await page.evaluate(() => {
    const stage = document.querySelector('#stage');
    const canvas = stage?.querySelector('canvas');
    const rect = stage?.getBoundingClientRect();
    const cRect = canvas?.getBoundingClientRect();
    let webgl = false;
    let glInfo = null;
    if (canvas) {
      try {
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        webgl = !!gl;
        if (gl) {
          const ext = gl.getExtension('WEBGL_debug_renderer_info');
          glInfo = {
            vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
            renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)
          };
        }
      } catch {}
    }
    return {
      innerWidth: innerWidth,
      innerHeight: innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      stage: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom } : null,
      canvas: cRect ? { x: cRect.x, y: cRect.y, width: cRect.width, height: cRect.height } : null,
      webgl,
      glInfo,
      choice: document.querySelector('#currentChoice')?.textContent?.trim() || null,
      title: document.title
    };
  });

  await page.screenshot({ path: path.join(outDir, `${label}-${vp.name}.png`), fullPage: false });

  if (vp.name === '1440') {
    const stage = page.locator('#stage');
    await stage.screenshot({ path: path.join(outDir, `${label}-close-stage.png`) });
    const box = await stage.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
      await page.mouse.wheel(0, -650);
      await page.waitForTimeout(900);
      await stage.screenshot({ path: path.join(outDir, `${label}-close-zoom.png`) });
      const canvas = page.locator('#stage canvas');
      const cb = await canvas.boundingBox();
      if (cb) {
        await page.mouse.move(cb.x + cb.width * 0.58, cb.y + cb.height * 0.52);
        await page.mouse.down();
        await page.mouse.move(cb.x + cb.width * 0.48, cb.y + cb.height * 0.50, { steps: 12 });
        await page.mouse.up();
        await page.waitForTimeout(700);
        await stage.screenshot({ path: path.join(outDir, `${label}-orbit.png`) });
        await page.click('#resetView');
        await page.waitForTimeout(700);
      }
    }
  }

  report.viewports[vp.name] = {
    ...metrics,
    firstUseful3DRenderMs: Date.now() - start,
    consoleErrors,
    pageErrors,
    failedRequests
  };
  await page.close();
}

report.finishedAt = new Date().toISOString();
fs.writeFileSync(path.join(outDir, `${label}-diagnostics.json`), JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify(report, null, 2));
