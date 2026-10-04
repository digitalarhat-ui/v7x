import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const label = process.argv[2] || 'v3-after';
const outDir = path.resolve('qa-artifacts');
fs.mkdirSync(outDir,{recursive:true});

const browser = await chromium.launch({
  headless:true,
  executablePath:'/usr/bin/google-chrome',
  args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-webgl','--ignore-gpu-blocklist','--disable-dev-shm-usage','--no-sandbox']
});

const viewports=[
  {name:'390',width:390,height:844},
  {name:'430',width:430,height:932},
  {name:'768',width:768,height:1024},
  {name:'1440',width:1440,height:1000}
];
const report={label,startedAt:new Date().toISOString(),viewports:{}};

async function setShot(page,pos,target){
  await page.evaluate(({pos,target})=>{
    const c=window.__HC_CAMERA__, ctl=window.__HC_CONTROLS__, r=window.__HC_RENDERER__, s=window.__HC_SCENE__;
    if(!c||!ctl||!r||!s)throw new Error('QA camera hooks missing');
    c.position.set(...pos);ctl.target.set(...target);c.updateProjectionMatrix();ctl.update();r.render(s,c);
  },{pos,target});
  await page.waitForTimeout(260);
}

for(const vp of viewports){
  const page=await browser.newPage({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1});
  const consoleErrors=[],pageErrors=[],failedRequests=[];
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  page.on('pageerror',e=>pageErrors.push(String(e)));
  page.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText||'failed'}));
  const start=Date.now();
  await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle',timeout:90000});
  await page.waitForSelector('#stage canvas',{state:'visible',timeout:30000});
  await page.waitForFunction(()=>window.__HC_V3_ASSET_READY__===true,null,{timeout:90000});
  await page.waitForTimeout(900);
  const useful=Date.now()-start;

  const metrics=await page.evaluate(()=>{
    const stage=document.querySelector('#stage'),canvas=stage?.querySelector('canvas');
    const rect=stage?.getBoundingClientRect(),cr=canvas?.getBoundingClientRect();
    let webgl=false,glInfo=null;
    try{
      const gl=canvas&&(canvas.getContext('webgl2')||canvas.getContext('webgl'));webgl=!!gl;
      if(gl){const ext=gl.getExtension('WEBGL_debug_renderer_info');glInfo={vendor:ext?gl.getParameter(ext.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)}}
    }catch{}
    return {
      innerWidth,innerHeight,scrollWidth:document.documentElement.scrollWidth,bodyScrollWidth:document.body.scrollWidth,
      stage:rect?{x:rect.x,y:rect.y,width:rect.width,height:rect.height,right:rect.right,bottom:rect.bottom}:null,
      canvas:cr?{x:cr.x,y:cr.y,width:cr.width,height:cr.height}:null,
      webgl,glInfo,choice:document.querySelector('#currentChoice')?.textContent?.trim()||null,title:document.title,
      assetReady:window.__HC_V3_ASSET_READY__===true,renderInfo:window.__HC_RENDER_INFO__||null,zoneCounts:window.__HC_V3_ZONE_COUNTS__||null
    };
  });
  await page.screenshot({path:path.join(outDir,`${label}-${vp.name}.png`),fullPage:false});
  if(vp.name==='1440'){
    const stage=page.locator('#stage');
    const shots=[
      ['A-full',[4.72,2.48,6.72],[.10,1.35,-1.56]],
      ['B-cabinet-corner',[2.15,1.48,2.55],[.65,.72,-1.46]],
      ['C-client-wood',[1.15,2.42,2.18],[-.78,2.18,-1.54]],
      ['D-client-sage',[1.20,1.18,2.18],[-.80,.59,-1.32]],
      ['E-glass-upper',[.32,2.42,2.38],[-1.62,2.18,-1.55]],
      ['F-counter-sink',[.72,1.64,2.08],[-1.30,1.05,-1.60]],
      ['G-tall-appliance',[4.55,1.78,2.58],[2.46,1.25,-1.38]],
      ['H-contact-depth',[1.55,.72,2.22],[.00,.27,-1.47]]
    ];
    for(const [name,pos,target] of shots){await setShot(page,pos,target);await stage.screenshot({path:path.join(outDir,`${label}-${name}.png`)});}
    await page.click('#resetView');await page.waitForTimeout(250);
  }
  report.viewports[vp.name]={...metrics,firstUseful3DRenderMs:useful,consoleErrors,pageErrors,failedRequests};
  await page.close();
}
report.finishedAt=new Date().toISOString();
fs.writeFileSync(path.join(outDir,`${label}-diagnostics.json`),JSON.stringify(report,null,2));
await browser.close();
console.log(JSON.stringify(report,null,2));