import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const base='https://crystal-hall-riyadh-visual-planning.vercel.app';
const photos=[
 'https://i.saudi-arabia.zafaf.net/gallery/1169/preview_k-aa-krst-l-ll-htf-l-t_8HGL51nk.jpeg',
 'https://i.saudi-arabia.zafaf.net/gallery/1169/preview_k-aa-krst-l-ll-htf-l-t_n1NE0AQJ.jpeg'
];
const widths=[390,430,768,1440];const results=[];let failures=[];
await fs.mkdir('qa-output',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
async function photoStatus(page,url){return page.evaluate(async src=>{return await new Promise(done=>{let img=new Image(),finished=false;let timer=setTimeout(()=>{if(!finished){finished=true;done({ok:false,reason:'timeout'})}},12000);img.onload=()=>{if(!finished){finished=true;clearTimeout(timer);done({ok:true,width:img.naturalWidth,height:img.naturalHeight})}};img.onerror=()=>{if(!finished){finished=true;clearTimeout(timer);done({ok:false,reason:'load_error'})}};img.src=src})},url);}
for(const width of widths){for(const path of ['/','/review/']){
 const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1,locale:'ar-SA'});
 const errors=[];page.on('pageerror',e=>errors.push('pageerror:'+e.message));page.on('console',m=>{if(m.type()==='error')errors.push('console:'+m.text().slice(0,150))});
 const label=path==='/'?'customer':'review';let record={width,path};
 try{
  const response=await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:35000});record.status=response?.status();
  await page.waitForTimeout(1200);
  record.title=await page.title();record.overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  record.langBefore=await page.locator('html').getAttribute('lang');record.dirBefore=await page.locator('html').getAttribute('dir');
  record.brand=await page.locator('body').innerText().then(s=>s.includes('كريستال')||s.includes('Crystal Hall'));
  record.oldClient=await page.locator('body').innerText().then(s=>s.includes('الوردة البيضاء')||s.includes('White Rose'));
  record.photoResults=path==='/'?await Promise.all(photos.map(src=>photoStatus(page,src))):[];
  const toggle=page.locator('#wrLanguage button[data-lang="en"]');record.hasEnSwitch=await toggle.count()>0;
  if(record.hasEnSwitch){await toggle.click();await page.waitForTimeout(300);record.langEnglish=await page.locator('html').getAttribute('lang');record.dirEnglish=await page.locator('html').getAttribute('dir');await page.locator('#wrLanguage button[data-lang="ar"]').click()}
  if(path==='/'){
   record.contact=await page.locator('a[href="tel:+966535550081"]').count();
   try{await page.locator('#startPlanning').click({timeout:5000});const btn=page.locator('#eventChips button[data-value="زفاف"]');await btn.click({timeout:5000});await page.locator('#guestInput').fill('180');record.plannerEvent=await btn.getAttribute('aria-pressed');record.plannerGuests=await page.locator('#guestInput').inputValue()}catch(e){record.plannerError=String(e).slice(0,200)}
  }else{record.reviewForm=await page.locator('#reviewForm').count();record.reviewNext=await page.locator('#next').count()}
  await page.screenshot({path:'qa-output/'+label+'-'+width+'.jpg',type:'jpeg',quality:72,fullPage:true,timeout:20000});
  record.errors=errors.slice(0,12);
 }catch(e){record.fatal=String(e).slice(0,450);failures.push(label+' '+width+' '+record.fatal)}
 results.push(record);await page.close();
 if(record.status!==200)failures.push(label+' '+width+' HTTP '+record.status);
 if(record.overflow>2)failures.push(label+' '+width+' overflow '+record.overflow);
 if(!record.brand||record.oldClient)failures.push(label+' '+width+' identity mismatch');
 if(record.langEnglish!=='en'||record.dirEnglish!=='ltr')failures.push(label+' '+width+' English toggle');
 if(path==='/' && (record.plannerEvent!=='true'||record.plannerGuests!=='180'))failures.push(label+' '+width+' planner');
 if(path==='/' && record.photoResults?.some(x=>!x.ok))failures.push(label+' '+width+' venue photo failed');
 if(errors.some(x=>x.startsWith('pageerror:')))failures.push(label+' '+width+' JS pageerror');
}}
await browser.close();
await fs.writeFile('qa-output/results.json',JSON.stringify({results,failures},null,2));
console.log('CRYSTAL_QA_REPORT='+JSON.stringify({results,failures}));
if(failures.length)process.exitCode=1;
