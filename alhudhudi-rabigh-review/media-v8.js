import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
/* Optional original, licensed media. No upload, network write or persistence. */
const sibling=document.querySelector('.lux-provenance');
if(!sibling)throw new Error('media section not found');
const ui=document.createElement('section');ui.id='real-venue-v8';
ui.innerHTML='<div class="real-top"><div><small>REAL HALL MEDIA · DEVICE ONLY</small><h2 id="real-title"></h2><p id="real-lead"></p></div><span id="real-tag">PRIVATE PREVIEW</span></div><div class="real-grid"><div class="real-stage"><div id="real-empty"><b>360°</b><strong id="real-prompt"></strong><p id="real-hint"></p></div><img id="real-photo" alt="Venue image uploaded locally by the reviewer" hidden><div id="real-pano" hidden></div><small id="real-note"></small></div><aside class="real-sidebar"><span>01 · ORIGINAL REFERENCE</span><h3 id="real-side"></h3><div class="real-choices"><button type="button" data-real="royal">ROYAL</button><button type="button" data-real="moonlight">MOON LIGHT</button></div><label for="real-file" id="real-label"></label><input type="file" id="real-file" accept="image/jpeg,image/png,image/webp" hidden><small>JPG · PNG · WEBP · EQUIRECTANGULAR 2:1</small><button type="button" id="real-clear" disabled></button><p id="real-rights"></p></aside></div><p class="real-disclaimer" id="real-disclaimer"></p>';
sibling.insertAdjacentElement('beforebegin',ui);
const $=s=>ui.querySelector(s);
const txt={
ar:{title:'أدخل صورة القاعة الحقيقية أو بانوراما 360°',lead:'حمّل صورة أصلية مرخّصة لديك وشاهد القاعة في هذه المعاينة المحلية. لن تُنشر أو تُرفق تلقائياً في رابط المراجعة.',prompt:'صور القاعة الأصلية مطلوبة',hint:'الصورة 2:1 تفتح تجربة 360° حقيقية. الصور الأخرى تظهر كمعرض ثابت.',side:'اختر القاعة ثم ملفك الأصلي',choose:'اختر الصورة أو بانوراما 360° ↗',clear:'حذف الصور المحلية',rights:'استخدم فقط صوراً لديك حق استخدامها؛ لا تدّعِ أن مشهد 3D التخيلي تصوير للمبنى الحقيقي.',disclaimer:'الملف يبقى على جهازك داخل صفحة العرض فقط؛ لا يرسل لخادم ولا يدخل في الرابط المشترك. الهوية وصحة المصدر تحتاج تأكيد صاحب القاعة.',loaded:'معاينة أصلية محلية',pano:'جولة 360° · بانوراما المستخدم',photo:'صورة ثابتة · المستخدم',error:'ملف غير صالح. استخدم JPG/PNG/WEBP بحجم أقل من 35MB.',drag:'اسحب للتدوير وحرّك عجلة الماوس للتقريب'},
en:{title:'Bring the real hall into the experience',lead:'Preview your authorized original venue photo or 360° panorama privately. No file is uploaded or included in a review link.',prompt:'Waiting for original venue imagery',hint:'A 2:1 equirectangular image becomes a genuine interactive 360° viewer. Other photos are shown normally.',side:'Choose the hall and your source photo',choose:'Choose photo or 360° panorama ↗',clear:'Clear private photos',rights:'Use imagery you own or have permission to display. Do not represent conceptual CGI as a measured venue scan.',disclaimer:'Files remain in this browser tab. They are never transmitted, saved on the server, or included in review links. Venue identity needs owner confirmation.',loaded:'Original device-only preview',pano:'360° · user-supplied panorama',photo:'Still photograph · user-supplied',error:'Invalid image. Use JPG, PNG or WEBP under 35 MB.',drag:'Drag to look around; mouse wheel to zoom'}
};
const modes=['royal','moonlight'],images={royal:null,moonlight:null};
let selected=document.querySelector('#hly-hall')?.value==='moonlight'?'moonlight':'royal';
let gl=null,camera=null,scene=null,sphere=null,pitch=0,yaw=0,fov=65,turning=false,prevX=0,prevY=0,frames=0;
const local=()=>txt[document.documentElement.lang==='en'?'en':'ar'];
const snapshot=()=>images[selected];
function refreshWords(){const t=local();ui.dir=document.documentElement.lang==='en'?'ltr':'rtl';for(const pair of [['#real-title','title'],['#real-lead','lead'],['#real-prompt','prompt'],['#real-hint','hint'],['#real-side','side'],['#real-label','choose'],['#real-clear','clear'],['#real-rights','rights'],['#real-disclaimer','disclaimer']])$(pair[0]).textContent=t[pair[1]];draw()}
function initGL(){
 if(gl)return;
 const pane=$('#real-pano');
 gl=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power',preserveDrawingBuffer:true});
 gl.outputColorSpace=THREE.SRGBColorSpace;gl.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
 gl.domElement.id='real-webgl';gl.domElement.style.touchAction='none';pane.appendChild(gl.domElement);
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(fov,1,.1,100);
 const ball=new THREE.SphereGeometry(30,60,40);ball.scale(-1,1,1);
 sphere=new THREE.Mesh(ball,new THREE.MeshBasicMaterial({color:'#ffffff',side:THREE.DoubleSide}));scene.add(sphere);
 const resize=()=>{let w=pane.clientWidth,h=pane.clientHeight;if(w&&h){gl.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();render()}};
 new ResizeObserver(resize).observe(pane);
 let touches=new Map(),lastDistance=0;
 const canvas=gl.domElement;
 canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);touches.set(e.pointerId,{x:e.clientX,y:e.clientY});prevX=e.clientX;prevY=e.clientY;turning=true});
 canvas.addEventListener('pointermove',e=>{if(!touches.has(e.pointerId))return;
  let p=touches.get(e.pointerId);touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(touches.size===1){yaw-=(e.clientX-p.x)*.004;pitch=Math.max(-1.45,Math.min(1.45,pitch+(e.clientY-p.y)*.004))}
  else{let ar=[...touches.values()],d=Math.hypot(ar[0].x-ar[1].x,ar[0].y-ar[1].y);if(lastDistance)fov=Math.max(35,Math.min(95,fov*lastDistance/d));lastDistance=d;camera.fov=fov;camera.updateProjectionMatrix()}
  render()});
 const end=e=>{touches.delete(e.pointerId);if(touches.size<2)lastDistance=0;turning=false};
 canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
 canvas.addEventListener('wheel',e=>{e.preventDefault();fov=Math.max(35,Math.min(95,fov+(e.deltaY>0?4:-4)));camera.fov=fov;camera.updateProjectionMatrix();render()},{passive:false});
 resize();
}
function render(){if(!gl||!sphere?.material.map)return;camera.lookAt(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));gl.render(scene,camera);frames++}
function clearTexture(){if(sphere?.material?.map){sphere.material.map.dispose();sphere.material.map=null}}
function draw(){
 const t=local(),pic=snapshot();
 ui.querySelectorAll('[data-real]').forEach(b=>{let yes=b.dataset.real===selected;b.classList.toggle('chosen',yes);b.setAttribute('aria-pressed',String(yes))});
 $('#real-clear').disabled=!images.royal&&!images.moonlight;
 $('#real-empty').hidden=!!pic;
 $('#real-photo').hidden=!pic||pic.pano;$('#real-pano').hidden=!pic||!pic.pano;
 $('#real-tag').textContent=pic?(pic.pano?t.pano:t.photo):'PRIVATE PREVIEW';
 $('#real-note').textContent=pic?(pic.pano?t.drag:pic.width+' × '+pic.height):'';
 if(pic?.pano){
  initGL();clearTexture();
  new THREE.TextureLoader().load(pic.url,texture=>{texture.colorSpace=THREE.SRGBColorSpace;sphere.material.map=texture;sphere.material.needsUpdate=true;
   let pane=$('#real-pano'),w=pane.clientWidth,h=pane.clientHeight;gl.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();render();
  });
 }else{$('#real-photo').src=pic?pic.url:'';clearTexture()}
}
function file(f){
 const t=local();if(!f||!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>35*1024*1024){$('#real-note').textContent=t.error;return}
 const url=URL.createObjectURL(f),im=new Image();
 im.onload=()=>{if(im.width<300||im.height<200){URL.revokeObjectURL(url);$('#real-note').textContent=t.error;return}
 const old=images[selected];if(old)URL.revokeObjectURL(old.url);
 images[selected]={url,width:im.width,height:im.height,pano:Math.abs(im.width/im.height-2)<.06};
 yaw=pitch=0;fov=65;draw();};
 im.onerror=()=>{URL.revokeObjectURL(url);$('#real-note').textContent=t.error};im.src=url;
}
ui.querySelectorAll('[data-real]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.real;draw()}));
$('#real-file').addEventListener('change',e=>{file(e.target.files?.[0]);e.target.value=''});
$('#real-clear').addEventListener('click',()=>{for(const k of modes){if(images[k])URL.revokeObjectURL(images[k].url);images[k]=null}clearTexture();draw()});
document.querySelector('#hly-hall')?.addEventListener('change',e=>{selected=e.target.value;draw()});
document.querySelector('#ahx-lang')?.addEventListener('click',()=>requestAnimationFrame(refreshWords));
refreshWords();
window.alhudhudiRealMedia={state:()=>({royal:images.royal?{width:images.royal.width,height:images.royal.height,pano:images.royal.pano}:null,moonlight:images.moonlight?{width:images.moonlight.width,height:images.moonlight.height,pano:images.moonlight.pano}:null,selected,private:true,uploaded:false,frames})};
