import { chromium } from 'playwright';
const photos=[["venuewise-img-interior","https://img.venuewise.com/upload/venue/gallery/2025/08/04/2025_08_04_08_00_42_68903cc804a1d.jpg"],["venuewise-img-women","https://img.venuewise.com/upload/venue/gallery/2025/08/04/2025_08_04_07_45_09_68903b1e480a1.jpg"],["venuewise-img-exterior","https://img.venuewise.com/upload/venue/gallery/2025/08/04/2025_08_04_07_56_46_68903d3a12064.jpg"],["venuewise-img-wedding","https://img.venuewise.com/upload/venue/gallery/2025/08/04/2025_08_04_07_50_11_68903cc7a806f.jpg"],["wahh-event1","https://wahhnews.com/wp-content/uploads/2026/09/5ea7eab3-605e-4ed9-bdbb-2d2bfb19a45a.jpg"],["wahh-event2","https://wahhnews.com/wp-content/uploads/2026/09/55f0bd46-4067-4f45-a92d-1c40c3ccdff2.jpg"],["charity-dropbox","https://www.dropbox.com/scl/fi/3vrp1k6wdvhkzyns758hn/News_215_213_0__1_82829.jpeg?raw=1&rlkey=9bjfhy3psrwcakhj06xeyzlyh"]];
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
await page.goto('https://saraya-al-ahsa-visual-planner.vercel.app/',{waitUntil:'domcontentloaded',timeout:25000});
const results=[];
for(const [name,url] of photos){
let response={};try{let r=await page.request.get(url,{timeout:10000});response={status:r.status(),contentType:r.headers()['content-type'],corp:r.headers()['cross-origin-resource-policy'],bytes:Number(r.headers()['content-length']||0)}}catch(e){response={error:String(e).slice(0,120)}}
let img=await page.evaluate(src=>new Promise(resolve=>{let i=new Image;let t=setTimeout(()=>resolve({ok:false,error:'timeout'}),9000);i.onload=()=>{clearTimeout(t);resolve({ok:true,w:i.naturalWidth,h:i.naturalHeight})};i.onerror=()=>{clearTimeout(t);resolve({ok:false,error:'loaderror'})};i.src=src}),url);
results.push({name,url,response,img});
console.log('MEDIA_CANDIDATE='+JSON.stringify(results[results.length-1]));
}
await browser.close();
console.log('SARAYA_MEDIA_REPORT='+JSON.stringify(results));
