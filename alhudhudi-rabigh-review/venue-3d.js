import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
const KEY='digital_arhat_alhudhudi_3d_v1';
const valid={hall:['royal','moonlight'],palette:['gold','pearl','rose'],light:['warm','day'],layout:['round','banquet'],aisle:['classic','wide'],camera:['overview','stage','tables']};
const defaults={hall:'royal',palette:'gold',light:'warm',layout:'round',aisle:'classic',camera:'overview'};
let stored={};try{stored=JSON.parse(localStorage.getItem(KEY)||'{}')}catch{}
try{const p=new URLSearchParams(location.search).get('visual');if(p)stored={...stored,...JSON.parse(p)}}catch{}
const state={...defaults,...stored};for(const k in valid)if(!valid[k].includes(state[k]))state[k]=defaults[k];
const attach=document.querySelector('#ahx-v2 .ahx-venues');if(!attach)throw Error('Missing venue selection mount');
const root=document.createElement('section');root.id='ah3d-experience';root.setAttribute('aria-label','Interactive 3D conceptual banquet hall');
root.innerHTML=[
'<div class="a3-header"><div><small>LIVE WEBGL · ORIGINAL 3D DESIGN</small><h3 id="a3-title"></h3><p id="a3-desc"></p></div><span class="a3-pill">3D · INTERACTIVE</span></div>',
'<div class="a3-grid"><div class="a3-viewport"><div id="a3-canvas"></div><div class="a3-engine" id="a3-engine">LOADING 3D...</div>',
'<div class="a3-views"><button type="button" data-view="overview" data-tr="overview"></button><button type="button" data-view="stage" data-tr="stage"></button><button type="button" data-view="tables" data-tr="tables"></button></div><small class="a3-drag" id="a3-drag"></small></div>',
'<aside class="a3-panel"><h4 data-tr="options"></h4>',
'<label data-tr="venue"></label><div class="a3-seg"><button type="button" data-key="hall" data-val="royal">ROYAL</button><button type="button" data-key="hall" data-val="moonlight">MOON LIGHT</button></div>',
'<label data-tr="palette"></label><div class="a3-seg"><button type="button" data-key="palette" data-val="gold" data-tr="gold"></button><button type="button" data-key="palette" data-val="pearl" data-tr="pearl"></button><button type="button" data-key="palette" data-val="rose" data-tr="rose"></button></div>',
'<label data-tr="light"></label><div class="a3-seg"><button type="button" data-key="light" data-val="warm" data-tr="warm"></button><button type="button" data-key="light" data-val="day" data-tr="day"></button></div>',
'<label data-tr="layout"></label><div class="a3-seg"><button type="button" data-key="layout" data-val="round" data-tr="round"></button><button type="button" data-key="layout" data-val="banquet" data-tr="banquet"></button></div>',
'<label data-tr="aisle"></label><div class="a3-seg"><button type="button" data-key="aisle" data-val="classic" data-tr="classic"></button><button type="button" data-key="aisle" data-val="wide" data-tr="wide"></button></div>',
'<div class="a3-current"><small data-tr="yourScene"></small><strong id="a3-summary"></strong></div>',
'<a class="a3-continue" href="#ahx-summary" data-tr="continue"></a></aside></div>',
'<p class="a3-disclosure" id="a3-disclosure"></p>'
].join('');
attach.insertAdjacentElement('afterend',root);
const $=s=>root.querySelector(s), canvasHost=$('#a3-canvas');
const langs={
 ar:{title:'صمّم أجواء ليلتك في 3D',desc:'قاعة ثلاثية الأبعاد قابلة للدوران والتخصيص مباشرة، وليست مسحاً أو نسخة هندسية حقيقية لقاعات الهدهدي.',options:'اختياراتك في المشهد',venue:'اختر القاعة',palette:'ألوان الديكور',light:'الإضاءة',layout:'توزيع الطاولات',aisle:'عرض الممر',gold:'ذهبي',pearl:'لؤلؤي',rose:'وردي',warm:'دافئة',day:'نهارية',round:'طاولات دائرية',banquet:'طاولات مستطيلة',classic:'تقليدي',wide:'واسع',overview:'المشهد الكامل',stage:'المنصة',tables:'الضيوف',yourScene:'تصورك الحالي',continue:'أضف اختياراتك إلى طلب المناسبة ↗',drag:'اسحب للتدوير · قرّب بعجلة الماوس أو بإصبعين',disclosure:'هذا مشهد معماري ثلاثي الأبعاد افتراضي أصلي من Digital Arhat، وليس صورة أو مسحاً للقاعة الحقيقية. المقاسات والخدمات والديكور والتوافر تحتاج اعتماد إدارة الهدهدي.',fail:'تعذر تشغيل WebGL في هذا الجهاز. استخدم نموذج الطلب بدلاً منه.'},
 en:{title:'Design your celebration in real 3D',desc:'A live, orbitable and customizable 3D banquet concept — not a scan or measured model of Al-Hudhudi halls.',options:'Personalize the scene',venue:'Venue direction',palette:'Décor palette',light:'Lighting',layout:'Table layout',aisle:'Bridal aisle',gold:'Champagne',pearl:'Pearl',rose:'Blush',warm:'Warm',day:'Daylight',round:'Round tables',banquet:'Banquet tables',classic:'Classic',wide:'Wide',overview:'Overview',stage:'Stage',tables:'Seating',yourScene:'Your selected direction',continue:'Add this direction to your event brief ↗',drag:'Drag to orbit · pinch or scroll to zoom',disclosure:'Original independent conceptual WebGL hall by Digital Arhat. This is not a photograph, 3D scan or approved floorplan of Al-Hudhudi. Materials, dimensions, availability and services require owner approval.',fail:'WebGL is unavailable on this device. You can still complete the event enquiry.'}
};
let lang='ar',renderer,scene,camera,materials={},groups={},lights={},room,stage;
let target=new THREE.Vector3(0,2.8,0),view={theta:.09,phi:1.43,radius:23},frames=0,triangles=0,ready=false,error='';
const m=(hex,metalness=0,roughness=.6)=>new THREE.MeshStandardMaterial({color:hex,metalness,roughness});
function mesh(geo,material,group,x=0,y=0,z=0){const item=new THREE.Mesh(geo,material);item.position.set(x,y,z);item.receiveShadow=true;group.add(item);return item}
function box(w,h,d,ma,g,x,y,z){return mesh(new THREE.BoxGeometry(w,h,d),ma,g,x,y,z)}
function cyl(rad,h,ma,g,x,y,z){return mesh(new THREE.CylinderGeometry(rad,rad,h,18),ma,g,x,y,z)}
function sphere(r,ma,g,x,y,z){return mesh(new THREE.SphereGeometry(r,10,7),ma,g,x,y,z)}
function torus(r,t,ma,g,x,y,z,horiz=true,arc=Math.PI*2){const item=mesh(new THREE.TorusGeometry(r,t,10,52,arc),ma,g,x,y,z);if(horiz)item.rotation.x=Math.PI/2;return item}
function floret(g,x,y,z,scale=1){const flower=new THREE.Group();flower.position.set(x,y,z);flower.scale.setScalar(scale);g.add(flower);
 for(let j=0;j<10;j++){const a=j*Math.PI/5,xx=Math.cos(a)*.20,zz=Math.sin(a)*.20;cyl(.018,.48,materials.leaf,flower,xx,.22,zz);sphere(.085,materials.petals[j%2],flower,xx,.48+(j%3)*.03,zz)}
 return flower}
function floorTex(){
 const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');
 ctx.fillStyle='#bdb2a4';ctx.fillRect(0,0,256,256);
 for(let i=0;i<30;i++){let yy=(i*71)%256;ctx.beginPath();ctx.moveTo(0,yy);
 for(let x=0;x<256;x+=10)ctx.lineTo(x,yy+Math.sin(x*.045+i)*4+Math.cos(x*.019+i)*8);
 ctx.strokeStyle=i%3?'rgba(149,137,123,.1)':'rgba(128,116,106,.17)';ctx.lineWidth=.9;ctx.stroke()}
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(6,4);return tex}
function arch(group,x,z,width=3.2){torus(width/2,.09,materials.trim,group,x,5.55,z,false,Math.PI);box(.17,3.6,.18,materials.trim,group,x-width/2,3.75,z);box(.17,3.6,.18,materials.trim,group,x+width/2,3.75,z)}
function chair(g,x,z,a){const cg=new THREE.Group();g.add(cg);cg.position.set(x,0,z);cg.rotation.y=a;
 for(const dx of [-.24,.24])for(const dz of [-.2,.2])box(.05,.43,.05,materials.trim,cg,dx,.23,dz);
 box(.58,.1,.54,materials.ivory,cg,0,.46,0);box(.59,.70,.10,materials.chair,cg,0,.86,.25)}
function chandelier(x,z){const c=new THREE.Group();room.add(c);c.position.set(x,7.7,z);
 cyl(.05,2.3,materials.metal,c,0,.64,0);
 for(const [radius,y] of [[1.7,-.48],[1.08,.03]]){
  torus(radius,.10,materials.metal,c,0,y,0,true);
  for(let i=0;i<18;i++){const a=i*Math.PI/9,xx=Math.sin(a)*radius,zz=Math.cos(a)*radius;
   cyl(.016,.27,materials.metal,c,xx,y-.19,zz);sphere(.10,materials.glow,c,xx,y-.37,zz)}
 }
 const bulb=new THREE.PointLight('#ffdfad',9,19,2);bulb.position.set(0,-.6,0);c.add(bulb);lights.chand.push(bulb)}
function build(){
 scene=new THREE.Scene();scene.background=new THREE.Color('#171411');
 camera=new THREE.PerspectiveCamera(47,1,.1,150);
 const mobile=innerWidth<800;
 renderer=new THREE.WebGLRenderer({antialias:!mobile,powerPreference:'high-performance',preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.35:1.65));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const cv=renderer.domElement;cv.id='a3-webgl';cv.style.touchAction='none';canvasHost.appendChild(cv);
 materials={floor:new THREE.MeshStandardMaterial({map:floorTex(),roughness:.39,metalness:.05}),wall:m('#a89c88'),trim:m('#b99a69',.78,.24),metal:m('#ceb680',.83,.22),ivory:m('#d2c7b7'),curtain:m('#aa8961'),chair:m('#a78860'),cloth:m('#ded2bf'),runner:m('#ad8760'),dark:m('#2d241c'),leaf:m('#5a7151'),petals:[m('#f9f0e9'),m('#cf9b96')],glow:new THREE.MeshStandardMaterial({color:'#fff9ea',emissive:'#ffcf90',emissiveIntensity:.6})};
 room=new THREE.Group();scene.add(room);
 box(29,.3,20,materials.floor,room,0,-.2,0);
 box(29,8.7,.35,materials.wall,room,0,4.35,-9.6);
 for(const x of [-14.2,14.2])box(.35,8.7,20,materials.wall,room,x,4.35,0);
 /* Open-top architectural view: never obscure the hall with a flat opaque ceiling. */
 for(const yy of [1.15,7.9,8.65])box(29,.17,.24,materials.trim,room,0,yy,-9.35);
 for(const x of [-11,-7,-3,1,5,9]){box(3.25,5.0,.09,materials.ivory,room,x,4.2,-9.36);arch(room,x,-9.24,3.1)}
 // Warm wall uplights and architectural ceiling-edge ribs, with the top open for camera clarity.
 for(const xx of [-12,-8,-4,0,4,8,12]){
  const uplight=new THREE.SpotLight('#f6d7a8',8,13,Math.PI/6,.65,1.5);
  uplight.position.set(xx,1.8,-8.7);uplight.target.position.set(xx,6,-9.2);
  room.add(uplight,uplight.target);
  const uplightHousing=cyl(.1,.26,materials.metal,room,xx,1.33,-9.0);
 }
 for(const x of [-14,14]){
  for(const z of [-7.5,-2.5,2.5,7.5]){
   box(.2,.23,4.8,materials.trim,room,x,8.55,z);
  }
 }
 for(const x of [-12.7,12.7])for(const z of [-6.5,-1,4.5]){
  cyl(.36,8.2,materials.wall,room,x,4.1,z);cyl(.53,.30,materials.trim,room,x,.16,z);cyl(.53,.36,materials.trim,room,x,8.33,z)}
 for(const z of [-6,-1,4]){box(28.4,.22,.29,materials.trim,room,0,8.79,z);chandelier(0,z)}
 stage=new THREE.Group();room.add(stage);
 box(11.5,.56,3.2,materials.trim,stage,0,.21,-7.23);
 for(let i=-2;i<=2;i++)box(1.8,5.7,.16,i%2?materials.curtain:materials.ivory,stage,i*2.02,3.16,-9.02);
 arch(stage,0,-8.65,5.0);
 box(2.4,.5,.65,materials.ivory,stage,0,.95,-7.65);
 box(2.4,1.0,.17,materials.ivory,stage,0,1.52,-7.97);
 floret(stage,-3.1,.55,-6.6,1.7);floret(stage,3.1,.55,-6.6,1.7);
 // Elegant architectural stage columns and pendant rim accents.
 for(const x of [-4.3,4.3]){
  box(.20,5.2,.28,materials.trim,stage,x,3.5,-8.80);
  sphere(.22,materials.glow,stage,x,6.0,-8.54);
 }
 for(const z of [-6.8,-5.8,-4.8]){
  box(9,.035,.035,materials.metal,stage,0,.53,z);
 }
 groups.round=new THREE.Group();groups.banquet=new THREE.Group();groups.runner=new THREE.Group();room.add(groups.round,groups.banquet,groups.runner);
 for(const x of [-10,-5,5,10])for(const z of [-4.4,.7,5.5]){
  const g=new THREE.Group();groups.round.add(g);g.position.set(x,0,z);
  cyl(1.06,.08,materials.cloth,g,0,.79,0);cyl(.17,.75,materials.metal,g,0,.38,0);floret(g,0,.90,0,.7);
  for(let j=0;j<7;j++){const a=j*Math.PI*2/7;chair(g,Math.cos(a)*1.60,Math.sin(a)*1.60,-a+Math.PI/2)}
 }
 for(const x of [-9,-4.5,4.5,9])for(const z of [-3.3,4.4]){
  const g=new THREE.Group();groups.banquet.add(g);g.position.set(x,0,z);
  box(2.35,.08,1.14,materials.cloth,g,0,.75,0);box(.18,.74,.18,materials.metal,g,0,.39,0);floret(g,0,.85,0,.55);
  for(const xx of [-.85,-.27,.27,.85])for(const zz of [-.94,.94])chair(g,xx,zz,zz>0?Math.PI:0);
 }
 lights.chand=lights.chand||[];
 lights.hemi=new THREE.HemisphereLight('#f9e4cb','#343029',1.1);scene.add(lights.hemi);
 lights.sun=new THREE.DirectionalLight('#fff0d7',2.1);lights.sun.position.set(10,17,11);lights.sun.castShadow=true;
 lights.sun.shadow.mapSize.set(1024,1024);lights.sun.shadow.camera.left=-24;lights.sun.shadow.camera.right=24;lights.sun.shadow.camera.top=24;lights.sun.shadow.camera.bottom=-24;scene.add(lights.sun);
 const fill=new THREE.DirectionalLight('#f7dfbe',.65);fill.position.set(-12,10,6);scene.add(fill);
 const resize=()=>{const w=canvasHost.clientWidth,h=canvasHost.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();request()};
 new ResizeObserver(resize).observe(canvasHost);
 resize();controls(cv);
}
let scheduled=false;
function request(){if(!renderer||scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;renderer.render(scene,camera);frames++;triangles=renderer.info.render.triangles})}
function aim(){if(!camera)return;const {theta,phi,radius}=view;
 camera.position.set(target.x+Math.sin(phi)*Math.sin(theta)*radius,target.y+Math.cos(phi)*radius,target.z+Math.sin(phi)*Math.cos(theta)*radius);camera.lookAt(target);request()}
function preset(which){const p={
 overview:{theta:.10,phi:1.43,radius:23,target:[0,2.6,-.4]},
 stage:{theta:0,phi:1.40,radius:15.5,target:[0,2.55,-5.1]},
 tables:{theta:.62,phi:1.39,radius:19,target:[0,2.05,1.5]}
 }[which];view={theta:p.theta,phi:p.phi,radius:p.radius};target.set(...p.target);aim()}
function runner(){const g=groups.runner;while(g.children.length){const c=g.children[0];g.remove(c);c.geometry?.dispose()}
 const width=state.aisle==='wide'?3.55:2.35;
 box(width,.035,17,materials.runner,g,0,.025,.7);
 for(const x of [-width/2+.08,width/2-.08])box(.05,.05,16.9,materials.trim,g,x,.065,.7)}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}document.dispatchEvent(new CustomEvent('alhudhudi:scene-change',{detail:{...state}}))}
function apply(){
 if(!renderer)return;
 const palettes={gold:['#b99a69','#d4b18a','#bc9b69','#e3ccaa','#19120c'],pearl:['#acbdc7','#cbd4db','#afc4cb','#e2e5ed','#111b22'],rose:['#b9858d','#d1a5ad','#be9096','#efcdd0','#201217']};
 const p=palettes[state.palette];materials.trim.color.set(p[0]);materials.metal.color.set(p[0]);materials.curtain.color.set(p[1]);materials.chair.color.set(p[2]);materials.runner.color.set(p[3]);scene.background.set(p[4]);
 materials.ivory.color.set(state.hall==='moonlight'?'#c0c9cb':'#d2c7b7');
 lights.hemi.color.set(state.light==='day'?'#e8f3ff':'#ffecd3');
 lights.hemi.intensity=state.light==='day'?1.45:1.1;
 lights.sun.color.set(state.light==='day'?'#ffffff':'#fff0d7');
 for(const lamp of lights.chand){lamp.color.set(state.light==='day'?'#e7f3ff':'#ffdfad');lamp.intensity=state.light==='day'?5.5:9}
 renderer.toneMappingExposure=state.light==='day'?1.20:1.06;
 groups.round.visible=state.layout==='round';groups.banquet.visible=state.layout==='banquet';runner();
 for(const b of root.querySelectorAll('[data-key]')){const yes=state[b.dataset.key]===b.dataset.val;b.classList.toggle('selected',yes);b.setAttribute('aria-pressed',String(yes))}
 for(const b of root.querySelectorAll('[data-view]'))b.classList.toggle('selected',b.dataset.view===state.camera);
 $('#a3-summary').textContent=(state.hall==='royal'?'Royal':'Moon Light')+' · '+langs[lang][state.palette]+' · '+langs[lang][state.layout]+' · '+langs[lang][state.light]+' · '+langs[lang][state.aisle];
 persist();request()}
function set(k,v){if(!valid[k]||!valid[k].includes(v))return;state[k]=v;
 if(k==='hall'){const sel=document.querySelector('#hly-hall');if(sel&&sel.value!==v){sel.value=v;sel.dispatchEvent(new Event('input',{bubbles:true}))}}
 if(k==='camera')preset(v);apply()}
function controls(el){const pts=new Map();let pinch=0;
 el.addEventListener('pointerdown',e=>{el.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY})});
 el.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;
  const prev=pts.get(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pts.size===1){view.theta-=(e.clientX-prev.x)*.006;view.phi=THREE.MathUtils.clamp(view.phi-(e.clientY-prev.y)*.006,.4,1.48);aim()}
  else if(pts.size===2){const a=[...pts.values()];const d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinch)view.radius=THREE.MathUtils.clamp(view.radius*pinch/d,12,42);pinch=d;aim()}}
 );
 const end=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=0};el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
 el.addEventListener('wheel',e=>{e.preventDefault();view.radius=THREE.MathUtils.clamp(view.radius*(e.deltaY>0?1.07:.93),12,42);aim()},{passive:false})}
function language(){lang=localStorage.getItem('digital_arhat_alhudhudi_v2_lang')==='en'?'en':'ar';root.dir=lang==='en'?'ltr':'rtl';
 const t=langs[lang];$('#a3-title').textContent=t.title;$('#a3-desc').textContent=t.desc;$('#a3-drag').textContent=t.drag;$('#a3-disclosure').textContent=t.disclosure;
 root.querySelectorAll('[data-tr]').forEach(el=>{if(t[el.dataset.tr])el.textContent=t[el.dataset.tr]});
 if(ready)apply()}
root.addEventListener('click',e=>{const b=e.target.closest('[data-key]');if(b&&root.contains(b))set(b.dataset.key,b.dataset.val);
 const v=e.target.closest('[data-view]');if(v&&root.contains(v))set('camera',v.dataset.view)});
document.querySelector('#ahx-lang')?.addEventListener('click',()=>requestAnimationFrame(language));
document.querySelector('#hly-hall')?.addEventListener('input',e=>{if(state.hall!==e.target.value){state.hall=e.target.value;apply()}});
$('#a3-engine').textContent='3D · WEBGL';
window.alhudhudi3D={getState:()=>({...state}),set,status:()=>({ready,webgl:!!renderer,frames,triangles,error,canvas:!!renderer?.domElement}),orbit:(theta,phi,radius)=>{view={theta,phi,radius};aim()},snapshot:()=>renderer?.domElement.toDataURL('image/png')};
language();
try{lights.chand=[];build();preset(state.camera);ready=true;apply();$('#a3-engine').textContent='● LIVE · TRUE 3D'}catch(e){error=String(e);$('#a3-engine').textContent=langs[lang].fail;root.classList.add('ah3d-failed');console.error('3D_RENDER_UNAVAILABLE',e)}
