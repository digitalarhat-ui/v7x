import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const outDir=path.resolve('qa-artifacts/lamsat-niloufar');
fs.mkdirSync(outDir,{recursive:true});

const browser=await chromium.launch({
  headless:true,
  args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-webgl','--ignore-gpu-blocklist','--disable-dev-shm-usage','--no-sandbox']
});

const target='http://127.0.0.1:4173/lamsat-niloufar-kitchen-studio-v20/';
const viewports=[
  {name:'390',width:390,height:844},
  {name:'430',width:430,height:932},
  {name:'1440',width:1440,height:1000}
];
const report={target,startedAt:new Date().toISOString(),viewports:{}};

function assert(cond,msg){if(!cond)throw new Error(msg)}

for(const vp of viewports){
  const page=await browser.newPage({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1});
  const consoleErrors=[],pageErrors=[],failedRequests=[];
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  page.on('pageerror',e=>pageErrors.push(String(e)));
  page.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText||'failed'}));

  const start=Date.now();
  await page.goto(target,{waitUntil:'networkidle',timeout:90000});
  await page.waitForSelector('#scene',{state:'visible',timeout:30000});
  await page.waitForFunction(()=>window.THREE&&window.demo3d,null,{timeout:30000});
  await page.waitForTimeout(900);
  const usefulMs=Date.now()-start;

  await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}'});

  const metrics=await page.evaluate(()=>{
    const stage=document.querySelector('#stage');
    const canvas=document.querySelector('#scene');
    const sr=stage?.getBoundingClientRect();
    const cr=canvas?.getBoundingClientRect();
    let webgl=false,pixelLuma=null,glInfo=null;
    try{
      const gl=canvas&&(canvas.getContext('webgl2')||canvas.getContext('webgl'));
      webgl=!!gl;
      if(gl){
        const ext=gl.getExtension('WEBGL_debug_renderer_info');
        glInfo={
          vendor:ext?gl.getParameter(ext.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR),
          renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)
        };
        const px=new Uint8Array(4),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight;
        let total=0,count=0;
        for(let yy=.20;yy<=.80;yy+=.12){
          for(let xx=.20;xx<=.80;xx+=.12){
            gl.readPixels(Math.floor(w*xx),Math.floor(h*yy),1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);
            total+=px[0]*.2126+px[1]*.7152+px[2]*.0722;count++;
          }
        }
        pixelLuma=count?total/count:null;
      }
    }catch{}
    return {
      innerWidth,innerHeight,
      htmlScrollWidth:document.documentElement.scrollWidth,
      bodyScrollWidth:document.body.scrollWidth,
      stage:sr?{x:sr.x,y:sr.y,width:sr.width,height:sr.height,right:sr.right,bottom:sr.bottom}:null,
      canvas:cr?{x:cr.x,y:cr.y,width:cr.width,height:cr.height,right:cr.right}:null,
      webgl,pixelLuma,glInfo,
      title:document.title,
      identity:document.body.innerText.includes('لمسة نيلوفر للمطابخ'),
      oldIdentity:document.body.innerText.includes('روائع دريم'),
      whatsapp:document.querySelector('#whatsappLink')?.href||'',
      fallbackVisible:getComputedStyle(document.querySelector('#webglFallback')).display!=='none'
    };
  });

  assert(metrics.title==='لمسة نيلوفر للمطابخ | استوديو القرار','TITLE_FAIL '+vp.name);
  assert(metrics.identity,'IDENTITY_FAIL '+vp.name);
  assert(!metrics.oldIdentity,'CROSS_PROSPECT_CONTAMINATION '+vp.name);
  assert(metrics.webgl,'WEBGL_GATE_FAIL '+vp.name);
  assert(!metrics.fallbackVisible,'WEBGL_FALLBACK_VISIBLE '+vp.name);
  assert(metrics.pixelLuma!==null&&metrics.pixelLuma>18,'RENDER_PIXEL_GATE_FAIL '+vp.name+' luma='+metrics.pixelLuma);
  assert(metrics.htmlScrollWidth<=vp.width+1,'HTML_HORIZONTAL_OVERFLOW '+vp.name+' '+metrics.htmlScrollWidth+'>'+vp.width);
  assert(metrics.bodyScrollWidth<=vp.width+1,'BODY_HORIZONTAL_OVERFLOW '+vp.name+' '+metrics.bodyScrollWidth+'>'+vp.width);
  assert(metrics.stage&&metrics.stage.width>300&&metrics.stage.right<=vp.width+1,'STAGE_LAYOUT_FAIL '+vp.name);
  assert(metrics.canvas&&metrics.canvas.width>300&&metrics.canvas.right<=vp.width+1,'CANVAS_LAYOUT_FAIL '+vp.name);
  assert(metrics.whatsapp.includes('966570309451'),'WHATSAPP_ROUTE_FAIL '+vp.name);

  await page.locator('#cabinetSwatches [data-value="charcoal"]').click();
  await page.locator('#accentSwatches [data-value="darkwood"]').click();
  await page.locator('#worktopSwatches [data-value="calacatta"]').click();
  await page.locator('[data-light="warm"]').click();
  await page.locator('#shape').selectOption({label:'شكل L'});
  await page.locator('#zone').fill('القطيف');
  await page.locator('#size').fill('4.5 × 3 م');
  await page.locator('#note').fill('أفضل تخزيناً أكثر.');
  await page.waitForTimeout(250);

  const stateCheck=await page.evaluate(()=>{
    const u=new URL(location.href);
    const href=document.querySelector('#whatsappLink')?.href||'';
    return {
      c:u.searchParams.get('c'),x:u.searchParams.get('x'),w:u.searchParams.get('w'),l:u.searchParams.get('l'),
      sh:u.searchParams.get('sh'),z:u.searchParams.get('z'),sz:u.searchParams.get('sz'),n:u.searchParams.get('n'),
      href,
      summary:document.querySelector('#sumAccent')?.textContent?.trim()||''
    };
  });
  assert(stateCheck.c==='charcoal'&&stateCheck.x==='darkwood'&&stateCheck.w==='calacatta'&&stateCheck.l==='warm','STATE_URL_FAIL '+vp.name);
  assert(stateCheck.sh==='شكل L'&&stateCheck.z==='القطيف'&&stateCheck.sz==='4.5 × 3 م','PROJECT_CONTEXT_STATE_FAIL '+vp.name);
  assert(stateCheck.href.includes('966570309451'),'WHATSAPP_NUMBER_FAIL '+vp.name);
  assert(decodeURIComponent(stateCheck.href).includes('اللمسة الخشبية: خشبي داكن'),'WHATSAPP_STATE_SUMMARY_FAIL '+vp.name);

  await page.reload({waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.THREE&&window.demo3d,null,{timeout:30000});
  const restored=await page.evaluate(()=>({
    cabinet:document.querySelector('#cabinetSwatches .swatch.active')?.dataset.value,
    accent:document.querySelector('#accentSwatches .swatch.active')?.dataset.value,
    worktop:document.querySelector('#worktopSwatches .swatch.active')?.dataset.value,
    light:document.querySelector('.look.active')?.dataset.light,
    shape:document.querySelector('#shape')?.value,
    zone:document.querySelector('#zone')?.value,
    size:document.querySelector('#size')?.value,
    note:document.querySelector('#note')?.value
  }));
  assert(restored.cabinet==='charcoal'&&restored.accent==='darkwood'&&restored.worktop==='calacatta'&&restored.light==='warm','STATE_RESTORE_VISUAL_FAIL '+vp.name);
  assert(restored.shape==='شكل L'&&restored.zone==='القطيف'&&restored.size==='4.5 × 3 م'&&restored.note==='أفضل تخزيناً أكثر.','STATE_RESTORE_CONTEXT_FAIL '+vp.name);

  await page.screenshot({path:path.join(outDir,'viewport-'+vp.name+'.png'),fullPage:false});
  await page.locator('#stage').screenshot({path:path.join(outDir,'stage-'+vp.name+'.png')});

  assert(consoleErrors.length===0,'CONSOLE_ERRORS '+vp.name+' '+JSON.stringify(consoleErrors));
  assert(pageErrors.length===0,'PAGE_ERRORS '+vp.name+' '+JSON.stringify(pageErrors));
  assert(failedRequests.length===0,'FAILED_REQUESTS '+vp.name+' '+JSON.stringify(failedRequests));

  report.viewports[vp.name]={...metrics,stateCheck,restored,firstUseful3DRenderMs:usefulMs,consoleErrors,pageErrors,failedRequests};
  await page.close();
}

report.finishedAt=new Date().toISOString();
fs.writeFileSync(path.join(outDir,'diagnostics.json'),JSON.stringify(report,null,2));
await browser.close();
console.log(JSON.stringify(report,null,2));
