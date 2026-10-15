import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const SHA='682176d7b25be910d541512e0a49b65970db9c3c';
const BASE='https://cdn.githubraw.com/digitalarhat-ui/v7x/'+SHA+'/face-of-the-moon-plus/';
const sources=[
 ['existing','https://wajh-al-qamar-jeddah-review.vercel.app/'],
 ['afrahkom','https://afrhkom.com/listing/قاعة-وجه-القمر-للاحتفالات/'],
 ['hlaylati','https://www.h-laylati.com/services']
];
const widths=[390,430,768,1440];
const report={kind:'real-live-browser-test',base:BASE,checkedAt:new Date().toISOString(),tests:[],comparisons:[]};
const dir='face-of-the-moon-plus/qa/live';fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let hardFailures=[];
try {
 for(const width of widths) for(const lang of ['ar','en']){
  const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,locale:lang==='ar'?'ar-SA':'en-US'});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  const t={width,lang,customer:BASE+'index.html',review:BASE+'review/index.html',status:'pending',errors};
  try{
   const resp=await page.goto(t.customer,{waitUntil:'domcontentloaded',timeout:30000});
   t.http=resp?.status();
   if(t.http!==200) throw new Error('customer HTTP '+t.http);
   await page.locator('#occasion').waitFor({timeout:12000});
   if(lang==='en') await page.locator('#langButton').click();
   t.hero=await page.locator('h1').first.innerText();
   t.firstFoldOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   await page.screenshot({path:path.join(dir,lang+'-'+width+'-customer.png'),fullPage:false});
   await page.locator('#saveReview').click();
   t.emptyError=(await page.locator('#formError').innerText()).length>0;
   if(!t.emptyError)throw new Error('empty occasion validation did not trigger');
   await page.locator('#occasion').selectOption('wedding');
   await page.locator('#date').fill('2026-12-10');
   await page.locator('#women').fill('185');
   await page.locator('#men').fill('90');
   await page.locator('#budget').selectOption('10-15');
   await page.locator('[data-kind=services][value=buffet]').check();
   await page.locator('[data-kind=zones][value=women]').check();
   t.capacityWarning=await page.locator('#capacityWarning').isVisible();
   if(!t.capacityWarning)throw new Error('capacity warning absent');
   await page.locator('#saveReview').click();
   await page.waitForURL(/\/review\/index\.html/,{timeout:20000});
   t.reviewURL=page.url();
   t.reviewVisible=await page.locator('.reviewOnly').first.isVisible();
   const text=await page.locator('#reviewText').innerText();
   t.savedDate=text.includes('2026-12-10');
   t.savedGuests=text.includes('185')&&text.includes('90');
   t.savedServices=text.includes('البوفيه')||text.toLowerCase().includes('buffet');
   t.reviewOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   await page.screenshot({path:path.join(dir,lang+'-'+width+'-review.png'),fullPage:false});
   if(!t.reviewVisible||!t.savedDate||!t.savedGuests||!t.savedServices||t.firstFoldOverflow||t.reviewOverflow||errors.length) throw new Error('review state or browser-layout gate failed');
   t.status='PASS';
  }catch(e){t.status='FAIL';t.failure=String(e);hardFailures.push(t);}
  report.tests.push(t);await context.close();console.log('TEST',width,lang,t.status,t.failure||'');
 }
 for(const width of [390,1440]) for(const [name,url] of sources){
  const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1});
  const page=await context.newPage();
  const t={width,name,url,status:'PENDING'};
  try{
   const r=await page.goto(url,{waitUntil:'domcontentloaded',timeout:23000});
   t.http=r?.status();await page.screenshot({path:path.join(dir,name+'-'+width+'.png'),fullPage:false,timeout:13000});
   t.status=t.http>=200&&t.http<400?'SCREENSHOT_CAPTURED':'NON_2XX';
  }catch(e){t.status='ERROR';t.error=String(e).slice(0,400)}
  report.comparisons.push(t);await context.close();
 }
}finally{await browser.close();fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,2));}
console.log('SUMMARY',JSON.stringify({passing:report.tests.filter(x=>x.status==='PASS').length,total:report.tests.length,comparisons:report.comparisons}));
if(hardFailures.length)process.exit(1);