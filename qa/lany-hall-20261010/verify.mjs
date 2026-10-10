import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const base='https://rawcdn.githack.com/digitalarhat-ui/v7x/31068360f716503aa1984a15bb38412047b3a835/lany-hall-jeddah';
const photos=[
 'https://i.saudi-arabia.zafaf.net/gallery/49554/preview_k-aa-l-ny_9tjr3xWZ.jpeg',
 'https://i.saudi-arabia.zafaf.net/gallery/49554/preview_k-aa-l-ny_dBG3DjyQ.jpeg'
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
  record.brand=await page.locator('body').innerText().then(s=>s.includes('لاني')||s.includes('Lany Hall'));
  record.oldClient=await page.locator('body').innerText().then(s=>s.includes('الوردة البيضاء')||s.includes('White Rose'));
  record.photoResults=path==='/'?await Promise.all(photos.map(src=>photoStatus(page,src))):[];
  const toggle=page.locator('#wrLanguage button[data-lang="en"]');record.hasEnSwitch=await toggle.count()>0;
  if(record.hasEnSwitch){await toggle.click();await page.waitForTimeout(300);record.langEnglish=await page.locator('html').getAttribute('lang');record.dirEnglish=await page.locator('html').getAttribute('dir');await page.locator('#wrLanguage button[data-lang="ar"]').click()}
  if(path==='/'){
   record.contact=await page.locator('a[href="https://wa.me/966554355911"]').count();
   try{await page.locator('#startPlanning').click({timeout:5000});const btn=page.locator('#eventChips button[data-value="زفاف"]');await btn.click({timeout:5000});await page.locator('#guestInput').fill('180');record.plannerEvent=await btn.getAttribute('aria-pressed');record.plannerGuests=await page.locator('#guestInput').inputValue();
    await page.locator('#dateInput').fill('2026-12-10');
    await page.locator('#styleChips button[data-value="فاخر"]').click();
    record.phase2Visible=await page.locator('#phase2Flow').isVisible();
    for(const [id,val] of [['atmosphereChips','فاخرة'],['palettePreferenceChips','أبيض وذهبي'],['detailChips','متوازن'],['lightingChips','دافئة'],['focusChips','الإضاءة']]){
      await page.locator('#'+id+' button[data-value="'+val+'"]').click({timeout:5000});
    }
    record.phase3Enabled=await page.locator('#generateDirectionsBtn').isEnabled();
    if(record.phase3Enabled){
      await page.locator('#generateDirectionsBtn').click();
      record.directionCount=await page.locator('#directionCards .direction-card').count();
      if(record.directionCount){
        await page.locator('#directionCards .p3-select').first().click({timeout:7000});
        record.preferredDirection=await page.locator('#briefP3Preferred').innerText();
        record.phase4Entry=await page.locator('#p4Entry').isVisible();
        if(record.phase4Entry){
          await page.locator('#openFinalReview').click({timeout:6000});
          record.phase4Visible=await page.locator('#phase4Review').isVisible();
          record.summary=await page.locator('#p4Summary').innerText().then(s=>s.slice(0,350));
          await page.locator('#p4CustomerConfirmation').check();
          await page.locator('#p4Copy').click();
          record.copyStatus=await page.locator('#p4ActionStatus').innerText();
        }
      }
    }
  }catch(e){record.plannerError=String(e).slice(0,400)}
  }else{
    record.reviewForm=await page.locator('#reviewForm').count();record.reviewNext=await page.locator('#next').count();
    try {
      await page.locator('input[name="benefit"][value="yes"]').check();
      await page.locator('input[name="useful"][value="brief"]').check();
      await page.locator('#next').click();record.step2Visible=await page.locator('#step2').isVisible();
      await page.locator('input[name="fit"][value="partial"]').check();
      await page.locator('input[name="standard"][value="partial"]').check();
      await page.locator('#needed').fill('Guest count, preferred date, and desired section');
      await page.locator('#next').click();record.step3Visible=await page.locator('#step3').isVisible();
      await page.locator('input[name="data"][value="unclear"]').check();
      await page.locator('input[name="interest"][value="adjust"]').check();
      await page.locator('#next').click();
      record.reviewResults=await page.locator('#results').isVisible();
      record.reviewTitle=await page.locator('#resultTitle').innerText();
      await page.locator('#copyFeedback').click();
      record.reviewCopyStatus=await page.locator('#copyStatus').innerText();
    }catch(e){record.reviewError=String(e).slice(0,350)}
  }
  // Scroll through actual viewport to trigger source IntersectionObserver reveals before full-page visual snapshot.
  await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=Math.max(330,innerHeight*.75)){scrollTo(0,y);await new Promise(r=>setTimeout(r,75))}scrollTo(0,0)});
  await page.waitForTimeout(650);
  record.invisibleReveals=await page.locator('.ux-reveal:not(.ux-visible)').count();
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
 if(path==='/' && (!record.contact||!record.phase2Visible||!record.phase3Enabled||!record.directionCount||!record.phase4Entry||!record.phase4Visible||record.plannerError))failures.push(label+' '+width+' full planner phases incomplete: '+(record.plannerError||'missing status'));
 if(path==='/review/' && (!record.step2Visible||!record.step3Visible||!record.reviewResults||record.reviewError))failures.push(label+' '+width+' review decision workflow incomplete: '+(record.reviewError||'missing results'));
 if(record.errors?.some(x=>x.startsWith('pageerror:')))failures.push(label+' '+width+' JS pageerror');
}}
await browser.close();
await fs.writeFile('qa-output/results.json',JSON.stringify({results,failures},null,2));
console.log('LANY_QA_REPORT='+JSON.stringify({results,failures}));
if(failures.length)process.exitCode=1;
