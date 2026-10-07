const cars=window.CARS;
let lang=location.pathname.startsWith('/en')?'en':'ar';
let currentSlide=0,filter='all',compare=[],wizStep=1,wiz={year:'',gear:'',brand:''};
const tr=(ar,en)=>lang==='ar'?ar:en;
const carName=c=>lang==='ar'?c.titleAr:c.titleEn;
const fmtKm=n=>lang==='ar'?(Math.round(n/1000)+' ألف كم'):(Math.round(n/1000)+'k km');

function renderHero(){
  const picks=[cars[0],cars[2],cars[1]];
  document.getElementById('heroTrack').innerHTML=picks.map(function(c,i){
    return '<article class="hero-card"><img src="'+c.images[0]+'" alt="'+carName(c)+'" loading="'+(i===0?'eager':'lazy')+'"><div class="hero-copy"><span class="badge">'+tr('صورة حقيقية من إعلان المعرض','Real showroom listing image')+'</span><h2>'+carName(c)+'</h2><p>'+(lang==='ar'?c.descAr:c.descEn)+'</p><div class="hero-specs"><span>'+c.year+'</span><span>'+fmtKm(c.km)+'</span><span>'+(lang==='ar'?c.gearAr:c.gearEn)+'</span><span>'+(lang==='ar'?c.fuelAr:c.fuelEn)+'</span></div><div class="hero-actions"><button class="btn light" onclick="openCar(\''+c.slug+'\')">'+tr('عرض السيارة','View car')+'</button><button class="btn glass" onclick="toggleCompare(\''+c.slug+'\')">'+tr('أضف للمقارنة','Add to compare')+'</button></div></div></article>';
  }).join('');
  document.getElementById('heroDots').innerHTML=picks.map(function(_,i){return '<button class="dot '+(i===currentSlide?'on':'')+'" onclick="goSlide('+i+')"></button>';}).join('');
  requestAnimationFrame(function(){goSlide(currentSlide)});
}
function goSlide(n){
  const slides=[...document.querySelectorAll('.hero-card')]; if(!slides.length)return;
  currentSlide=(n+slides.length)%slides.length;
  const w=slides[0].getBoundingClientRect().width,dir=document.documentElement.dir==='rtl'?1:-1;
  document.getElementById('heroTrack').style.transform='translateX('+(dir*currentSlide*(w+18))+'px)';
  document.querySelectorAll('.dot').forEach(function(d,i){d.classList.toggle('on',i===currentSlide)});
}
let startX=0,dx=0,drag=false;
const slider=document.getElementById('sliderShell');
slider.addEventListener('pointerdown',function(e){startX=e.clientX;dx=0;drag=true;slider.setPointerCapture(e.pointerId)});
slider.addEventListener('pointermove',function(e){if(drag)dx=e.clientX-startX});
slider.addEventListener('pointerup',function(){if(!drag)return;drag=false;if(Math.abs(dx)>55){const rtl=document.documentElement.dir==='rtl';goSlide(currentSlide+(dx*(rtl?1:-1)<0?1:-1))}});

function setFilter(f,el){filter=f;document.querySelectorAll('.filter').forEach(x=>x.classList.remove('on'));el.classList.add('on');renderInventory()}
function renderInventory(){
  const q=(document.getElementById('search').value||'').toLowerCase();
  const list=cars.filter(function(c){
    const hay=(carName(c)+' '+c.year+' '+(lang==='ar'?c.descAr:c.descEn)).toLowerCase();
    const mq=!q||hay.includes(q);
    const mf=filter==='all'||(filter==='2020plus'&&c.year>=2020)||(filter==='auto'&&c.gear==='auto')||(filter==='toyota'&&c.brand==='toyota');
    return mq&&mf;
  });
  document.getElementById('inventoryGrid').innerHTML=list.map(function(c){
    return '<article class="car"><div class="photo"><span class="status">'+tr('معروض في حراج وقت التحقق','Listed on Haraj at verification')+'</span><img src="'+c.images[0]+'" alt="'+carName(c)+'" loading="lazy"><span class="photo-count">'+c.images.length+' '+tr('صور حقيقية','real photos')+'</span></div><div class="car-body"><div class="car-kicker">@ab2636 · TAIF</div><h3>'+carName(c)+'</h3><p>'+(lang==='ar'?c.descAr:c.descEn)+'</p><div class="spec-row"><span>'+c.year+'</span><span>'+fmtKm(c.km)+'</span><span>'+(lang==='ar'?c.gearAr:c.gearEn)+'</span><span>'+(lang==='ar'?c.fuelAr:c.fuelEn)+'</span></div><div class="card-actions"><button class="primary" onclick="openCar(\''+c.slug+'\')">'+tr('التفاصيل','Details')+'</button><button class="compare-toggle '+(compare.includes(c.slug)?'on':'')+'" onclick="toggleCompare(\''+c.slug+'\')">'+(compare.includes(c.slug)?tr('مضاف','Added'):tr('قارن','Compare'))+'</button></div></div></article>';
  }).join('');
}
function openCar(slug,push){
  if(push===undefined)push=true;
  const c=cars.find(x=>x.slug===slug);if(!c)return;
  const gallery=c.images.map(function(im,i){return '<button class="thumb '+(i===0?'on':'')+'" onclick="setMainImage(this,\''+im+'\')"><img src="'+im+'" alt="" loading="lazy"></button>';}).join('');
  document.getElementById('carDetail').innerHTML='<div class="detail-top"><div><div class="gallery-main"><img id="mainGalleryImage" src="'+c.images[0]+'" alt="'+carName(c)+'"></div><div class="thumbs">'+gallery+'</div></div><div class="detail-info"><div class="car-kicker">'+tr('بيانات وصور حقيقية من إعلان حراج','Real data and media from Haraj listing')+'</div><h2>'+carName(c)+'</h2><p>'+(lang==='ar'?c.descAr:c.descEn)+'</p><div class="facts"><div class="fact"><span>'+tr('السنة','Year')+'</span><b>'+c.year+'</b></div><div class="fact"><span>'+tr('الممشى','Mileage')+'</span><b>'+fmtKm(c.km)+'</b></div><div class="fact"><span>'+tr('القير','Transmission')+'</span><b>'+(lang==='ar'?c.gearAr:c.gearEn)+'</b></div><div class="fact"><span>'+tr('الوقود','Fuel')+'</span><b>'+(lang==='ar'?c.fuelAr:c.fuelEn)+'</b></div><div class="fact"><span>'+tr('ملاحظة البدي حسب الإعلان','Body note')+'</span><b>'+(lang==='ar'?c.bodyAr:c.bodyEn)+'</b></div><div class="fact"><span>'+tr('السعر الظاهر في الإعلان','Visible listing price')+'</span><b>'+(lang==='ar'?c.priceAr:c.priceEn)+'</b></div></div><div class="detail-actions"><a class="call" href="tel:0555706026">'+tr('اتصال عن هذه السيارة','Call about this car')+'</a><a class="haraj" href="'+c.haraj+'" target="_blank" rel="noopener">'+tr('فتح إعلان حراج','Open Haraj ad')+'</a></div></div></div>';
  openModal('carModal');if(push)history.pushState({car:slug},'',(lang==='ar'?'':'/en')+'/cars/'+slug);
}
function setMainImage(btn,url){document.getElementById('mainGalleryImage').src=url;document.querySelectorAll('.thumb').forEach(x=>x.classList.remove('on'));btn.classList.add('on')}
function closeCar(){closeModal('carModal');history.pushState({},'',lang==='ar'?'/':'/en/')}
function toggleCompare(slug){if(compare.includes(slug))compare=compare.filter(x=>x!==slug);else if(compare.length<3)compare.push(slug);updateCompare();renderInventory()}
function updateCompare(){document.getElementById('compareCount').textContent=compare.length;document.getElementById('comparebar').classList.toggle('show',compare.length>0)}
function clearCompare(){compare=[];updateCompare();renderInventory()}
function openCompare(){
  if(!compare.length)return;
  const cs=compare.map(s=>cars.find(c=>c.slug===s));
  const row=function(label,fn){return '<tr><th>'+label+'</th>'+cs.map(c=>'<td>'+fn(c)+'</td>').join('')+'</tr>';};
  document.getElementById('compareDetail').innerHTML='<div class="compare-table"><table><tr><th>'+tr('المعيار','Criteria')+'</th>'+cs.map(c=>'<th>'+carName(c)+'</th>').join('')+'</tr>'+row(tr('السنة','Year'),c=>c.year)+row(tr('الممشى','Mileage'),c=>fmtKm(c.km))+row(tr('القير','Transmission'),c=>lang==='ar'?c.gearAr:c.gearEn)+row(tr('الوقود','Fuel'),c=>lang==='ar'?c.fuelAr:c.fuelEn)+row(tr('حالة البدي','Body note'),c=>lang==='ar'?c.bodyAr:c.bodyEn)+row(tr('السعر المنشور','Listed price'),c=>lang==='ar'?c.priceAr:c.priceEn)+'</table></div>';
  openModal('compareModal');
}
function openModal(id){document.getElementById(id).classList.add('show');document.body.classList.add('modal-open')}
function closeModal(id){document.getElementById(id).classList.remove('show');if(!document.querySelector('.modal.show'))document.body.classList.remove('modal-open')}
function backdrop(e,id){if(e.target.id===id)closeModal(id)}
function scrollToId(id){document.getElementById(id).scrollIntoView({behavior:'smooth'})}

function openFinder(){wizStep=1;wiz={year:'',gear:'',brand:''};document.querySelectorAll('.choice').forEach(x=>x.classList.remove('on'));updateWizard();openModal('finderModal')}
function pick(el,key){document.querySelectorAll('[data-'+key+']').forEach(x=>x.classList.remove('on'));el.classList.add('on');wiz[key]=el.dataset[key]}
function wizNext(){if(wizStep===1&&!wiz.year)return;if(wizStep===2&&!wiz.gear)return;wizStep++;updateWizard()}
function wizBack(){wizStep=Math.max(1,wizStep-1);updateWizard()}
function updateWizard(){document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('on',+x.dataset.step===wizStep));document.querySelectorAll('.steps i').forEach((x,i)=>x.classList.toggle('on',i<wizStep))}
function showMatches(){
  if(!wiz.brand)return;wizStep=4;updateWizard();
  let m=cars.filter(c=>(wiz.year==='any'||c.year>=2020)&&(wiz.gear==='any'||c.gear===wiz.gear)&&(wiz.brand==='any'||c.brand===wiz.brand));
  if(!m.length)m=cars;
  document.getElementById('finderResults').innerHTML=m.map(function(c){return '<div class="result"><img src="'+c.images[0]+'" alt=""><div><h4>'+carName(c)+'</h4><p>'+c.year+' · '+fmtKm(c.km)+' · '+(lang==='ar'?c.gearAr:c.gearEn)+'</p></div><button onclick="closeModal(\'finderModal\');openCar(\''+c.slug+'\')">'+tr('فتح','Open')+'</button></div>';}).join('');
}
function toggleLang(){const m=location.pathname.match(/\/cars\/([^/]+)/);if(lang==='ar')location.href='/en/'+(m?'cars/'+m[1]:'');else location.href=m?'/cars/'+m[1]:'/'}

function applyLang(){
 document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.getElementById('langBtn').textContent=lang==='ar'?'EN':'AR';
 const T=lang==='ar'?{
 brandName:'معرض الدمام للسيارات',brandSub:'الطائف · مخزون حقيقي من حراج',navInv:'المخزون',navFind:'ابحث عن سيارتك',
 heroH1:'مخزونك الحالي.<br>واضح. سريع. باسمك.',heroP:'تصور مخصص لمعرض الدمام للسيارات بالطائف، مبني على سيارات وصور المعرض الحقيقية المنشورة حالياً في حراج — مع مقارنة وتفاصيل عميقة واتصال مرتبط بالسيارة نفسها.',
 p1:'متابعة على حراج وقت إعداد التصور',p2:'سنوات دفع عمولة على حراج',p3:'آخر ظهور بالحساب وقت التحقق',p4:'سيارات حقيقية داخل هذا التصور',
 invEye:'CURRENT INVENTORY',invTitle:'ابدأ من السيارة، مو من رسالة عامة.',invText:'كل بطاقة هنا مربوطة بإعلان حراج حقيقي للمعرض، وصور المعرض نفسها، ومواصفات الإعلان نفسها. لا سيارات وهمية ولا صور ستوك.',
 fAll:'الكل',fNew:'2020+',fAuto:'أوتوماتيك',fToyota:'تويوتا',
 layerEye:'OWNED INVENTORY LAYER',layerTitle:'حراج يجلب الزائر. الموقع يجمع القرار.',layerText:'الفكرة لا تستبدل حراج. تبقي حراج كقناة اكتساب، ثم تعطي العميل طبقة مملوكة للمعرض تجمع السيارات الحالية، المقارنة، التفاصيل، وحالة السيارة قبل الاتصال.',
 flow1:'مخزون موحد بدل فتح عدة إعلانات',flow2:'تفاصيل وصور عميقة لكل سيارة',flow3:'مقارنة حتى 3 سيارات جنباً إلى جنب',flow4:'اتصال مرتبط بالسيارة المختارة',
 findEye:'FIND MY CAR',findTitle:'خل العميل يفلتر قبل ما يتصل.',findText:'ثلاث خطوات قصيرة: سنة السيارة، القير، والماركة. بعدها تظهر له السيارات المطابقة من نفس مخزون المعرض الحالي.',findBtn:'ابدأ الاختيار',ff1:'السنة المناسبة',ff2:'نوع القير',ff3:'الماركة',ff4:'فتح السيارة والتواصل',
 contactEye:'CONTACT TRUTH',contactTitle:'التواصل كما هو منشور في الإعلانات.',contactText:'ما افترضنا واتساب ولا تمويل ولا وعود غير منشورة. الإعلانات الحالية تنشر أرقام اتصال مباشرة؛ لذلك الديمو يحافظ على نفس الحقيقة.',contactP:'الطائف · حساب حراج @ab2636. الأرقام المتكررة في الإعلانات الحالية: 0555706026 و 0554316700.',harajProfile:'حساب حراج',truthTitle:'الحقيقة قبل الزينة',truthP:'السعر غير ظاهر في الإعلانات الخمسة المختارة، لذلك الموقع لا يخترع سعراً. أي معلومة غير مثبتة تُترك للفريق عند الاتصال.',
 compareLabel:'للمقارنة',compareSmall:'حتى 3 سيارات',compareGo:'قارن',dockInv:'المخزون',dockFind:'ابحث عن سيارة',dockCall:'اتصال',detailLabel:'تفاصيل السيارة',compareTitle:'مقارنة السيارات',
 w1:'أي سنة أقرب لك؟',wy1:'2020 وأحدث',wy2:'أي سنة',next1:'التالي',w2:'نوع القير؟',wg1:'أوتوماتيك',wg2:'أي نوع',back2:'السابق',next2:'التالي',w3:'ماركة معينة؟',wb1:'تويوتا',wb2:'لكزس',wb3:'هيونداي',wb4:'أي ماركة',back3:'السابق',showM:'عرض النتائج',w4:'النتائج من المخزون الحالي',back4:'تعديل الاختيار',
 footerText:'تصور غير رسمي مخصص للعرض، مبني على بيانات وصور معرض الدمام للسيارات الطائف المنشورة علناً في حراج وقت الإعداد. لا يمثل موقعاً رسمياً للمعرض بعد.'
 }:{
 brandName:'Dammam Cars Showroom',brandSub:'Taif · Real Haraj inventory',navInv:'Inventory',navFind:'Find my car',
 heroH1:'Your current inventory.<br>Clear. Fast. Owned.',heroP:'A tailored concept for Dammam Cars Showroom in Taif, built from the showroom’s real cars, listing data and authentic Haraj photos — with comparison, deep vehicle pages and car-context contact.',
 p1:'Haraj followers at concept build',p2:'years of Haraj commission history',p3:'last seen on profile at verification',p4:'real cars inside this concept',
 invEye:'CURRENT INVENTORY',invTitle:'Start from the car, not a generic message.',invText:'Every card is tied to a real Haraj listing from this showroom, using the showroom’s own photos and listing facts. No stock cars and no AI images.',
 fAll:'All',fNew:'2020+',fAuto:'Automatic',fToyota:'Toyota',
 layerEye:'OWNED INVENTORY LAYER',layerTitle:'Haraj brings discovery. The site organizes the decision.',layerText:'This does not replace Haraj. Haraj remains an acquisition channel while the showroom gets an owned layer that organizes current cars, comparison, deep details and vehicle-specific contact.',
 flow1:'One inventory instead of reopening many ads',flow2:'Deep photos and facts for each car',flow3:'Compare up to 3 cars side by side',flow4:'Contact attached to the selected car',
 findEye:'FIND MY CAR',findTitle:'Let the buyer filter before calling.',findText:'Three short steps: model year, transmission and brand. Matching cars then appear from the same current showroom inventory.',findBtn:'Start finder',ff1:'Preferred year',ff2:'Transmission',ff3:'Brand',ff4:'Open car and contact',
 contactEye:'CONTACT TRUTH',contactTitle:'Contact exactly as published.',contactText:'We did not assume WhatsApp, finance or unverified promises. Current listings publish direct call numbers, so the demo preserves that truth.',contactP:'Taif · Haraj @ab2636. Repeated current listing numbers: 0555706026 and 0554316700.',harajProfile:'Haraj profile',truthTitle:'Truth before decoration',truthP:'No price is displayed in the five selected listings, so the concept does not invent one. Anything not verified is left for the showroom team on the call.',
 compareLabel:'selected',compareSmall:'Up to 3 cars',compareGo:'Compare',dockInv:'Inventory',dockFind:'Find a car',dockCall:'Call',detailLabel:'Vehicle details',compareTitle:'Compare cars',
 w1:'Which year range?',wy1:'2020 and newer',wy2:'Any year',next1:'Next',w2:'Transmission?',wg1:'Automatic',wg2:'Any type',back2:'Back',next2:'Next',w3:'Any preferred brand?',wb1:'Toyota',wb2:'Lexus',wb3:'Hyundai',wb4:'Any brand',back3:'Back',showM:'Show matches',w4:'Matches from current inventory',back4:'Change filters',
 footerText:'Unofficial concept demo built from public Haraj data and authentic photos published by Dammam Cars Showroom Taif at the time of preparation. Not yet an official showroom website.'
 };
 Object.entries(T).forEach(function(pair){const e=document.getElementById(pair[0]);if(e)e.innerHTML=pair[1]});
 document.getElementById('search').placeholder=lang==='ar'?'ابحث: كامري، يارس، لكزس...':'Search: Camry, Yaris, Lexus...';
 renderHero();renderInventory();updateCompare();
}
window.addEventListener('resize',()=>goSlide(currentSlide));
window.addEventListener('popstate',function(){const m=location.pathname.match(/\/cars\/([^/]+)/);if(m)openCar(m[1],false);else closeModal('carModal')});
document.addEventListener('keydown',function(e){if(e.key==='Escape')document.querySelectorAll('.modal.show').forEach(m=>closeModal(m.id))});
applyLang();
const route=location.pathname.match(/\/cars\/([^/]+)/);if(route)setTimeout(()=>openCar(route[1],false),120);