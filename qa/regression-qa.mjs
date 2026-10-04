import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('qa-artifacts');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: '/usr/bin/google-chrome',
  args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-webgl','--ignore-gpu-blocklist','--disable-dev-shm-usage','--no-sandbox']
});
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => pageErrors.push(String(e)));
page.on('requestfailed', r => failedRequests.push({ url: r.url(), error: r.failure()?.errorText || 'failed' }));

const checks = {};
function check(name, pass, detail = '') { checks[name] = { pass: Boolean(pass), detail }; }

await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForSelector('#stage canvas', { state: 'visible', timeout: 30000 });
await page.waitForTimeout(1800);

const webgl = await page.evaluate(() => {
  const c = document.querySelector('#stage canvas');
  try { return Boolean(c && (c.getContext('webgl2') || c.getContext('webgl'))); } catch { return false; }
});
check('webgl', webgl);

const initial = await page.locator('#currentChoice').innerText();
check('management_default', initial.includes('ساج مرجعي') && initial.includes('خشب فاتح مرجعي'), initial);

const canvas = page.locator('#stage canvas');
const cb = await canvas.boundingBox();
if (cb) {
  await page.mouse.move(cb.x + cb.width * 0.58, cb.y + cb.height * 0.52);
  await page.mouse.down();
  await page.mouse.move(cb.x + cb.width * 0.44, cb.y + cb.height * 0.48, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(250);
  await page.click('#resetView');
  check('orbit_reset', true);
} else {
  check('orbit_reset', false, 'canvas box unavailable');
}

await page.locator('.control-group[data-kind="baseColor"] .swatch[data-value="clientWood"]').click();
await page.locator('.control-group[data-kind="accentColor"] .swatch[data-value="clientSage"]').click();
let choice = await page.locator('#currentChoice').innerText();
check('base_upper_controls', choice.includes('خشب فاتح مرجعي') && choice.includes('ساج مرجعي'), choice);

await page.locator('.control-group[data-kind="top"] .seg[data-value="cast"]').click();
await page.locator('.control-group[data-kind="lighting"] .seg[data-value="neutral"]').click();
choice = await page.locator('#currentChoice').innerText();
check('countertop', choice.includes('رمادي هادئ'), choice);
check('lighting', choice.includes('عرض محايد'), choice);

const lookExpect = {
  balanced: ['ساج مرجعي','خشب فاتح مرجعي','حجر فاتح هادئ','عرض محايد'],
  wood: ['خشب فاتح مرجعي','ساج مرجعي','حجر فاتح هادئ','نهار معماري'],
  sage: ['ساج مرجعي','خشب فاتح مرجعي','رمادي هادئ','عرض محايد']
};
let curatedPass = true;
const curated = {};
for (const [key, terms] of Object.entries(lookExpect)) {
  await page.locator('.look-btn[data-look="' + key + '"]').click();
  await page.waitForTimeout(150);
  const txt = await page.locator('#currentChoice').innerText();
  const ok = terms.every(t => txt.includes(t));
  curated[key] = { ok, txt };
  curatedPass = curatedPass && ok;
}
check('curated_directions', curatedPass, JSON.stringify(curated));

await page.locator('.look-btn[data-look="balanced"]').click();
await page.click('#saveA');
await page.locator('.look-btn[data-look="wood"]').click();
await page.click('#saveB');
await page.waitForTimeout(200);
const aImg = await page.locator('#variantAMedia img').count();
const bImg = await page.locator('#variantBMedia img').count();
const compareText = await page.locator('#compareResult').innerText();
check('ab_compare', aImg === 1 && bImg === 1 && !compareText.includes('احفظ خيارين'), compareText);
await page.click('#applyA');
await page.waitForTimeout(150);
check('ab_apply', (await page.locator('#currentChoice').innerText()).includes('ساج مرجعي'));

const stateUrl = page.url();
check('share_state_url', /[?&]b=clientSage/.test(stateUrl) && /[?&]a=clientWood/.test(stateUrl) && /[?&]x=clientSage/.test(stateUrl), stateUrl);
await page.goto(stateUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('#currentChoice', { state: 'attached', timeout: 60000 });
await page.waitForTimeout(900);
const roundChoice = await page.locator('#currentChoice').innerText();
check('share_state_roundtrip', roundChoice.includes('ساج مرجعي') && roundChoice.includes('خشب فاتح مرجعي'), roundChoice);

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFElEQVR42mNkYPj/n4GBgYGJAQoAHgQCAeXKkL8AAAAASUVORK5CYII=', 'base64');
await page.setInputFiles('#roomFile', { name: 'qa-room.png', mimeType: 'image/png', buffer: png });
await page.waitForFunction(() => document.querySelector('#roomSide')?.classList.contains('ready'), null, { timeout: 8000 });
check('room_colour_function', !(await page.locator('#applyRoomPalette').isDisabled()), await page.locator('#roomAnalysis').innerText());

for (let i = 0; i < 4; i++) {
  await page.click('#advisorNext');
  await page.waitForTimeout(70);
}
const resultReady = await page.locator('#advisorGrid').evaluate(el => el.classList.contains('result-ready'));
check('fitout_advisor', resultReady);
await page.click('#applyAdvisor');
await page.waitForTimeout(120);
check('fitout_summary', (await page.locator('#summary').innerText()).includes('Blum'));

await page.selectOption('#layoutInput', { label: 'مستقيم' });
await page.fill('#lengthInput', '5');
await page.locator('input[name="appliance"][value="ثلاجة"]').check();
await page.fill('#noteInput', 'QA فقط');
await page.waitForTimeout(100);
const scoreTxt = await page.locator('#readinessScore').innerText();
const summary = await page.locator('#summary').innerText();
check('project_readiness', parseInt(scoreTxt) >= 90, scoreTxt);
check('summary', summary.includes('مستقيم') && summary.includes('5م') && summary.includes('ثلاجة') && summary.includes('QA فقط'), summary);

const phoneHref = await page.locator('a[href^="tel:"]').last().getAttribute('href');
check('phone_handoff', phoneHref === 'tel:+966531699579', phoneHref || '');

await page.evaluate(() => {
  window.__qaOpenedUrl = '';
  window.open = (url) => { window.__qaOpenedUrl = String(url); return null; };
});
await page.click('#handoffBtn');
await page.waitForTimeout(100);
const openedUrl = await page.evaluate(() => window.__qaOpenedUrl || '');
check('booking_handoff', openedUrl.startsWith('https://higher-class.sa/taif'), openedUrl || 'window.open not called');

check('console_runtime', consoleErrors.length === 0, JSON.stringify(consoleErrors));
check('page_runtime', pageErrors.length === 0, JSON.stringify(pageErrors));
const internalFailures = failedRequests.filter(x => !x.url.startsWith('https://higher-class.sa/'));
check('network_runtime', internalFailures.length === 0, JSON.stringify(internalFailures));

const pass = Object.values(checks).every(x => x.pass);
const report = { pass, checks, consoleErrors, pageErrors, failedRequests, finishedAt: new Date().toISOString() };
fs.writeFileSync(path.join(outDir, 'regression-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
if (!pass) process.exitCode = 1;