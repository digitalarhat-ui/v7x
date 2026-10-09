import { chromium } from 'playwright';
import fs from 'node:fs';
const BASE='https://safwat-madinah-venue-planning-v23.vercel.app';
const widths=[390,430,768,1440], results=[], problems=[];
fs.mkdirSync('safwat-screens',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
async function assertion(width,route,name,condition,details=''){
  const ok=Boolean(condition);
  results.push({width,route,name,pass:ok,details:String(details).slice(0,180)});
  console.log((ok?'PASS':'FAIL')+' ['+width+' '+route+'] '+name+(details?' — '+String(details).slice(0,150):''));
  if(!ok) problems.push(width+' '+route+' '+name+' '+String(details).slice(0,150));
}
async function langEnglish(page,width,route){
  const buttons=page.locator('.wr-language-toggle button');
  await assertion(width,route,'language_toggle_present',(await buttons.count())>=2,'buttons='+await buttons.count());
  if((await buttons.count())>=2) {
    await buttons.last().click();
    await page.waitForTimeout(400);
    const lang=await page.locator('html').getAttribute('lang');
    await assertion(width,route,'english_toggle',lang==='en','lang='+lang);
    await assertion(width,route,'english_site_identity',(await page.locator('body').innerText()).includes('Safwat'),'english Safwat present');
  }
}
for (const width of widths){
  for (const route of ['customer','review']){
    const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1,locale:'ar-SA',reducedMotion:'reduce'});
    const errs=[];page.on('pageerror',e=>errs.push(e.message));
    try{
      const response=await page.goto(BASE+(route==='review'?'/review/':'/'),{waitUntil:'domcontentloaded',timeout:60000});
      await assertion(width,route,'HTTPS_200',response?.status()===200, String(response?.status()));
      await page.waitForTimeout(1200);
      const dims=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,lang:document.documentElement.lang,bodyText:document.body.innerText.slice(0,700)}));
      await assertion(width,route,'no_horizontal_overflow',dims.scrollWidth<=width+2,dims.scrollWidth+' / '+width);
      await assertion(width,route,'arabic_rtl_initial',dims.lang==='ar'&&(await page.locator('html').getAttribute('dir'))==='rtl','lang='+dims.lang);
      await assertion(width,route,'correct_venue',dims.bodyText.includes('صفوة المدينة'),'Safwat identity');
      await assertion(width,route,'unofficial_disclaimer',(await page.locator('#safwat-independent-disclaimer').count())===1);
      await assertion(width,route,'noindex',await page.locator('meta[name=robots]').getAttribute('content')==='noindex,nofollow');
      if(route==='customer'){
        await page.locator('#safwat-photo-hero').scrollIntoViewIfNeeded();
        await page.waitForTimeout(650);
        const media=await page.evaluate(async()=>{
          const el1=document.querySelector('#safwat-photo-hero'),el2=document.querySelector('#safwat-photo-gallery');
          const wait=(img)=>new Promise(resolve=>{if(img.complete)return resolve(true);img.addEventListener('load',()=>resolve(true),{once:true});img.addEventListener('error',()=>resolve(false),{once:true});setTimeout(()=>resolve(false),14000)});
          await Promise.all([wait(el1),wait(el2)]);
          const heroCss=getComputedStyle(document.querySelector('.hero-bg')).backgroundImage;
          const probe=new Image();probe.src='/assets/safwat-hero.jpg';await wait(probe);
          return{photo1:el1.naturalWidth,photo2:el2.naturalWidth,heroCss,heroWidth:probe.naturalWidth,local:(el1.currentSrc+el2.currentSrc).includes('/assets/'),correctPhone:document.querySelector('#p4Contact')?.getAttribute('href')};
        });
        await assertion(width,route,'hero_photo_loaded',media.heroWidth>700&&media.heroCss.includes('safwat-hero.jpg'),'background native width '+media.heroWidth);
        await assertion(width,route,'gallery_two_original_images',media.photo1>600&&media.photo2>600,'img sizes '+media.photo1+' / '+media.photo2);
        await assertion(width,route,'phone_verified',media.correctPhone==='tel:+966595122222',media.correctPhone);
        await page.locator('#eventChips .chip[data-value="زفاف"]').click();
        await assertion(width,route,'event_selector_changes_state',await page.locator('#eventChips .chip[data-value="زفاف"]').getAttribute('aria-pressed')==='true');
        await page.locator('#dateInput').fill('2026-12-01');
        await page.locator('#guestInput').fill('175');
        await page.locator('#styleChips .chip[data-value="فاخر"]').click();
        await page.locator('#hospitalityInput').fill('اختبار تقديم الضيافة');
        await page.locator('#notesInput').fill('اختبار مخطط المناسبة');
        await assertion(width,route,'live_event_summary',(await page.locator('#briefEvent').innerText()).includes('زفاف'));
        await assertion(width,route,'live_guest_summary',(await page.locator('#briefGuests').innerText()).includes('175'));
        await page.locator('#openFinalReview').click();
        await assertion(width,route,'final_review_route_in_page',(await page.locator('#p4Contact').count())===1);
        await page.screenshot({path:'safwat-screens/customer-'+width+'-ar.png',fullPage:true});
        await langEnglish(page,width,route);
        await page.screenshot({path:'safwat-screens/customer-'+width+'-en.png',fullPage:true});
      }else{
        await page.locator('input[name=benefit][value=yes]').check();
        await page.locator('input[name=useful][value=intent]').check();
        await page.locator('#next').click();
        await assertion(width,route,'review_step2',await page.locator('#step2').isVisible());
        await page.locator('input[name=fit][value=yes]').check();
        await page.locator('#needed').fill('نوع المناسبة والتاريخ وعدد الضيوف');
        await page.locator('input[name=standard][value=partial]').check();
        await page.locator('#next').click();
        await assertion(width,route,'review_step3',await page.locator('#step3').isVisible());
        await page.locator('input[name=data][value=yes]').check();
        await page.locator('input[name=interest][value=discussion]').check();
        await page.locator('#next').click();
        await assertion(width,route,'review_result_generated',await page.locator('#results').isVisible(),(await page.locator('#resultTitle').innerText()).slice(0,130));
        await page.locator('#copyFeedback').click();
        await assertion(width,route,'review_copy_feedback',(await page.locator('#copyStatus').innerText()).length>0);
        await page.screenshot({path:'safwat-screens/review-'+width+'-ar.png',fullPage:true});
        await langEnglish(page,width,route);
      }
      await assertion(width,route,'no_unhandled_js_errors',errs.length===0,errs.slice(0,3).join(' | '));
    }catch(e){console.log('EXCEPTION ['+width+' '+route+'] '+String(e?.stack||e).slice(0,1400));problems.push(width+' '+route+' exception '+String(e?.message||e).slice(0,200))}
    finally{await page.close()}
  }
}
await browser.close();
const report={base:BASE,checks:results.length,passed:results.filter(x=>x.pass).length,failed:problems.length,problems,byViewport:Object.fromEntries(widths.map(w=>[w,results.filter(x=>x.width===w&&x.pass).length+'/'+results.filter(x=>x.width===w).length]))};
fs.writeFileSync('safwat-qa-report.json',JSON.stringify({report,results},null,2));
console.log('SAFWAT_QA_SUMMARY '+JSON.stringify(report));
if(problems.length)process.exitCode=1;
