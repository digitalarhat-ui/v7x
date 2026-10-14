import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const URL='https://athar-aleraaqa-riyadh-makan-v4.vercel.app/';
const OUT=process.env.GITHUB_WORKSPACE+'/athar-qa-output';
fs.mkdirSync(OUT,{recursive:true});
const BROWSER=await puppeteer.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage','--disable-background-timer-throttling']});
let bad=0;
const all=[];
const snooze=(ms)=>new Promise(r=>setTimeout(r,ms));
async function clickText(page,text){
 return page.evaluate((text)=>{
  const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim().includes(text));
  if(!b) return false;
  b.click();return true;
 },text);
}
for(const width of [390,430,768,1440]){
 const out={width,checks:[],runtimeErrors:[],vehicleImages:[],screenshots:[]};
 const check=(name,ok,detail='')=>{
   const yes=!!ok;out.checks.push({name,pass:yes,detail:String(detail).slice(0,700)});
   if(!yes)bad++;
 };
 const page=await BROWSER.newPage();
 await page.setViewport({width,height:width===1440?900:width===768?1024:844,deviceScaleFactor:1});
 await page.evaluateOnNewDocument(()=>{try{localStorage.removeItem('athar-eraaqa-20261014:shortlist');localStorage.removeItem('athar-eraaqa-20261014:buyer')}catch{}});
 page.on('pageerror',err=>out.runtimeErrors.push(err.message));
 try{
  const res=await page.goto(URL,{waitUntil:'domcontentloaded',timeout:50000});
  await page.waitForSelector('.app',{timeout:24000});
  await snooze(1400);
  const home=await page.evaluate(()=>({
     title:document.title,lang:document.documentElement.lang,dir:document.documentElement.dir,
     width:window.innerWidth,overflow:document.documentElement.scrollWidth-window.innerWidth,
     words:document.body.innerText.slice(0,1200),
     links:[...document.querySelectorAll('a[href^="tel:"]')].map(e=>e.getAttribute('href')),
     hero:[...document.querySelectorAll('.heroImage img')].map(x=>({src:x.currentSrc,width:x.naturalWidth,complete:x.complete}))
  }));
  out.home=home;
  check('root_http_200_or_not_modified',[200,304].includes(res?.status()),res?.status());
  check('correct_business',home.title.includes('أثر العراقة')&&home.words.includes('أثر العراقة'));
  check('arabic_rtl',home.lang==='ar'&&home.dir==='rtl',home.lang+'/'+home.dir);
  check('phone_correct',home.links.includes('tel:0559670004'),home.links.join(','));
  check('no_overflow_home',home.overflow<=2,home.overflow);
  check('hero_genuine_seller_photo',home.hero.some(x=>x.width>0),JSON.stringify(home.hero));
  const oldLeak=await page.evaluate(()=>['الجهني','Al-Juhani','0501560004','makan-v4:'].some(s=>document.documentElement.innerHTML.includes(s)));
  check('no_prior_business_contamination',!oldLeak);
  await page.screenshot({path:OUT+'/home-'+width+'.png',fullPage:width===390||width===1440});
  out.screenshots.push('home-'+width+'.png');

  await page.goto(URL+'#cars',{waitUntil:'domcontentloaded',timeout:50000});
  await page.waitForSelector('.carCard',{timeout:12000});
  await snooze(900);
  const cards=await page.$$('.carCard');
  check('two_seller_vehicle_cards',cards.length===2,cards.length);
  const list=await page.evaluate(()=>({text:document.body.innerText.slice(0,2000),overflow:document.documentElement.scrollWidth-window.innerWidth}));
  check('no_overflow_catalogue',list.overflow<=2,list.overflow);
  check('all_correct_vehicle_models',list.text.includes('لكزس')&&list.text.includes('ديفندر'),list.text.slice(0,650));

  const photos=[];
  for(const item of [{id:'11190046416',model:'Lexus'},{id:'11187904027',model:'Defender'}]){
   await page.goto(URL+'#car/'+item.id,{waitUntil:'domcontentloaded',timeout:50000});
   await page.waitForSelector('.galleryMain img',{timeout:16000});
   await snooze(1400);
   const photo=await page.evaluate(()=>({img:document.querySelector('.galleryMain img')?.currentSrc||'',complete:document.querySelector('.galleryMain img')?.complete,width:document.querySelector('.galleryMain img')?.naturalWidth||0,overflow:document.documentElement.scrollWidth-window.innerWidth,text:document.body.innerText.slice(0,1100)}));
   photos.push({id:item.id,...photo});
   check('vehicle_'+item.model+'_photo_decoded',photo.complete&&photo.width>0,JSON.stringify({src:photo.img,width:photo.width}));
   check('vehicle_'+item.model+'_correct',photo.text.includes(item.model==='Lexus'?'لكزس':'ديفندر'),photo.text.slice(0,250));
   check('vehicle_'+item.model+'_no_overflow',photo.overflow<=2,photo.overflow);
   const didClick=await clickText(page,'أضف للمقارنة');
   check('vehicle_'+item.model+'_add_to_compare',didClick);
   await snooze(450);
  }
  out.vehicleImages=photos.map(p=>({id:p.id,url:p.img,width:p.width,complete:p.complete}));
  const ids=await page.evaluate(()=>{try{return JSON.parse(localStorage.getItem('athar-eraaqa-20261014:buyer')||'{}').ids||[]}catch{return[]}});
  check('state_contains_both_vehicles',ids.includes('11190046416')&&ids.includes('11187904027'),ids.join(','));

  await page.goto(URL+'#compare',{waitUntil:'domcontentloaded',timeout:50000});
  await snooze(550);
  const compare=await page.evaluate(()=>({text:document.body.innerText.slice(0,2500),overflow:document.documentElement.scrollWidth-window.innerWidth}));
  check('comparison_has_both',compare.text.includes('RX350')&&compare.text.includes('ديفندر'),compare.text.slice(0,600));
  check('comparison_no_overflow',compare.overflow<=2,compare.overflow);

  await page.goto(URL+'#request',{waitUntil:'domcontentloaded',timeout:50000});
  await snooze(550);
  const textarea=await page.$('textarea');
  check('buyer_question_editable',!!textarea);
  if(textarea)await textarea.type('أرجو تأكيد الممشى والتكلفة النهائية.');
  const compiled=await clickText(page,'جهّز استفسارك');
  check('buyer_summary_button',compiled);
  await snooze(550);
  const summary=await page.evaluate(()=>({body:document.querySelector('.preparedText')?.textContent||'',overflow:document.documentElement.scrollWidth-window.innerWidth}));
  check('summary_with_two_real_listing_ids',summary.body.includes('11190046416')&&summary.body.includes('11187904027'),summary.body.slice(0,700));
  check('summary_no_overflow',summary.overflow<=2,summary.overflow);
  await page.screenshot({path:OUT+'/summary-'+width+'.png',fullPage:false});
  out.screenshots.push('summary-'+width+'.png');

  await page.goto(URL+'?lang=en#cars',{waitUntil:'domcontentloaded',timeout:50000});
  await page.waitForSelector('.carCard',{timeout:16000});
  await snooze(600);
  const english=await page.evaluate(()=>({
   lang:document.documentElement.lang,dir:document.documentElement.dir,
   overflow:document.documentElement.scrollWidth-window.innerWidth,
   txt:document.body.innerText.slice(0,1900),
   tel:[...document.querySelectorAll('a[href^="tel:"]')].map(e=>e.getAttribute('href')),
   images:[...document.querySelectorAll('img')].map(x=>({src:x.currentSrc,width:x.naturalWidth})).filter(x=>x.width>0).slice(0,6)
  }));
  out.english={lang:english.lang,dir:english.dir,overflow:english.overflow};
  check('english_ltr',english.lang==='en'&&english.dir==='ltr',JSON.stringify(out.english));
  check('english_content',english.txt.includes('Lexus')&&english.txt.includes('Defender'),english.txt.slice(0,900));
  check('english_phone',english.tel.includes('tel:0559670004'),english.tel.join(','));
  check('english_no_overflow',english.overflow<=2,english.overflow);
  await page.screenshot({path:OUT+'/english-'+width+'.png',fullPage:false});
  out.screenshots.push('english-'+width+'.png');
 }catch(e){out.runtimeErrors.push('EXCEPTION '+String(e?.stack||e));bad++}
 check('no_javascript_exceptions',out.runtimeErrors.length===0,out.runtimeErrors.join(' / ').slice(0,500));
 all.push(out);
 await page.close();
 console.log('ATHAR_VIEWPORT_'+width+' '+JSON.stringify({badChecks:out.checks.filter(x=>!x.pass),runtimeErrors:out.runtimeErrors,images:out.vehicleImages}).slice(0,2600));
}
fs.writeFileSync(OUT+'/results.json',JSON.stringify({deployment:URL,live:true,totalFailures:bad,results:all},null,2));
await BROWSER.close();
console.log('ATHAR_LIVE_QA_FAILURES='+bad);
if(bad)process.exit(2);
console.log('ATHAR_LIVE_E2E_PASS');