(function(){
"use strict";
var cfg=window.DAKH_FINAL_CONFIG,root=document.getElementById("app");
if(!cfg||!root)return;
var STORE="dakhakhni-final-v10";
var state={
  phase:1,maxPhase:1,
  projectType:"",
  city:"",
  layout:"l",
  measurementMode:"known",
  room:{length:420,width:320,height:280},
  referenceName:"",
  concept:"A",
  visual:{style:"calm",cabinet:"ivory",worktop:"veined",upper:"mixed",handle:"integrated",saved:false},
  storage:{pantry:true,tall:true,deepDrawers:true,corner:true,waste:true,coffee:false,smallAppliance:false,trays:false},
  appliances:{fridge:true,oven:true,dishwasher:true,hob:true,hood:true,microwave:false,freezer:false},
  details:{users:"4",cooking:"daily",ceiling:"standard",hardware:"softclose",sink:"keep",island:false,seating:false},
  contact:{name:"",mobile:"",location:"",stage:"",planStatus:"",note:""}
};
var labels={
  layout:{straight:"مستقيم",l:"حرف L",u:"حرف U",parallel:"متوازي",island:"جزيرة"},
  project:{new:"مطبخ جديد",renovation:"استبدال / تجديد",modification:"تعديل / إضافة وحدات"},
  cabinet:{ivory:"عاجي مطفي",oak:"بلوط دافئ",walnut:"جوز طبيعي",ash:"رمادي حجري",graphite:"فحمي",gloss:"أبيض ساتان"},
  worktop:{veined:"حجر فاتح بعروق",warm:"حجر دافئ",dark:"حجر داكن",quartz:"كوارتز فاتح"},
  style:{calm:"مودرن هادئ",warm:"دافئ خشبي",light:"فاتح ونظيف",dark:"داكن راقٍ"},
  storage:{pantry:"مؤن",tall:"تخزين طويل",deepDrawers:"أدراج عميقة",corner:"حلول الزاوية",waste:"نفايات وفرز",coffee:"ركن قهوة",smallAppliance:"أجهزة صغيرة",trays:"صواني"},
  appliances:{fridge:"ثلاجة",oven:"فرن",dishwasher:"غسالة صحون",hob:"موقد",hood:"شفاط",microwave:"مايكرويف",freezer:"فريزر"},
  ceiling:{standard:"سقف قياسي",high:"سقف مرتفع",unknown:"غير متأكد"},
  hardware:{softclose:"إغلاق هادئ",premium:"إكسسوارات مطورة",unknown:"يحدده المصمم"},
  sink:{keep:"أستخدم الحوض الحالي",new:"أحتاج حوضاً جديداً",unknown:"غير محدد"}
};
var runtime={hero:null,studio:null,reference:""};
function clone(v){return JSON.parse(JSON.stringify(v))}
function merge(a,b){if(!b||typeof b!=="object")return a;Object.keys(b).forEach(function(k){if(b[k]&&typeof b[k]==="object"&&!Array.isArray(b[k])){if(!a[k]||typeof a[k]!=="object")a[k]={};merge(a[k],b[k])}else a[k]=b[k]});return a}
function enc(v){try{return btoa(unescape(encodeURIComponent(JSON.stringify(v)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}catch(e){return""}}
function dec(v){try{var s=v.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return JSON.parse(decodeURIComponent(escape(atob(s))))}catch(e){return null}}
(function restore(){
  var q=new URLSearchParams(location.search),p=q.get("project"),saved=null;
  if(p)saved=dec(p);
  if(!saved){try{saved=JSON.parse(localStorage.getItem(STORE)||"null")}catch(e){}}
  if(saved)merge(state,saved);
  if(p)history.replaceState(null,"",location.pathname);
})();
function save(){try{localStorage.setItem(STORE,JSON.stringify(state))}catch(e){}}
function safe(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c]})}
function activeKeys(o){return Object.keys(o).filter(function(k){return !!o[k]})}
function toast(msg){var e=document.getElementById("toast");if(!e)return;e.textContent=msg;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(function(){e.classList.remove("show")},1800)}
function projectCode(){
  var raw=JSON.stringify([state.projectType,state.city,state.layout,state.room,state.visual,state.storage,state.appliances,state.details]),h=2166136261;
  for(var i=0;i<raw.length;i++){h^=raw.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24)}
  return "DK-"+((h>>>0).toString(36).toUpperCase()+"000000").slice(0,6);
}
function optionButtons(map,selected,attr,notes){
  return Object.keys(map).map(function(k){return '<button type="button" class="option '+(selected===k?"active":"")+'" data-'+attr+'="'+k+'">'+safe(map[k])+(notes&&notes[k]?'<small>'+safe(notes[k])+'</small>':"")+'</button>'}).join("");
}
function toggleButtons(map,obj,attr){
  return Object.keys(map).map(function(k){return '<button type="button" class="choice '+(obj[k]?"active":"")+'" data-'+attr+'="'+k+'"><span>'+safe(map[k])+'</span><i></i></button>'}).join("");
}
function swatch(key,color,type){var current=type==="cabinet"?state.visual.cabinet:state.visual.worktop;return '<button type="button" class="swatch '+(current===key?"active":"")+'" data-'+type+'="'+key+'" aria-label="'+safe((type==="cabinet"?labels.cabinet:labels.worktop)[key])+'" style="--sw:'+color+'"><i></i></button>'}
function appHtml(){
  return '<header class="topbar"><div class="shell nav"><a class="brand" href="#top"><span class="brand-mark">AD</span><span class="brand-copy"><b>'+safe(cfg.brand)+'</b><small>'+safe(cfg.legal)+'</small></span></a><button class="nav-cta" id="navStart">ابدأ مشروعك</button></div></header>'+
  '<main id="top">'+heroHtml()+proofHtml()+journeyHtml()+
  '<section class="planner" id="planner"><div class="shell">'+phaseNavHtml()+phase1Html()+phase2Html()+phase3Html()+phase4Html()+phase5Html()+'</div></section></main>'+
  '<div class="navbottom"><div class="shell navbottom-inner"><button class="back" id="backBtn">السابق</button><div class="progress" id="bottomProgress">المرحلة 1 من 5</div><button class="next" id="nextBtn">التالي: الشكل واللون</button></div></div>'+
  '<footer class="footer"><div class="shell"><b>'+safe(cfg.brand)+'</b> — '+safe(cfg.truth.planning)+' '+safe(cfg.truth.measurement)+'</div></footer><div class="toast" id="toast">تم</div>';
}
function heroHtml(){
  return '<section class="hero"><div class="shell hero-grid"><div><div class="eyebrow">تجربة طلب مطبخ قبل جلسة التصميم</div><h1>رتّب مشروع مطبخك<br>قبل أن يبدأ المصمم.</h1><p>اجمع مساحة المطبخ واتجاه الشكل واللون واحتياجات الخزائن والأجهزة في مشروع واحد، ثم أرسل لفريق دخاخني ملخصاً واضحاً بدلاً من رسائل وملاحظات متفرقة.</p><div class="hero-benefits"><div><span>01</span><b>المساحة أولاً</b></div><div><span>02</span><b>معاينة 3D تفاعلية</b></div><div><span>03</span><b>ملخص واحد للمصمم</b></div></div><div class="actions"><button class="btn primary" id="heroStart">ابدأ من مساحتك ←</button><button class="btn secondary" id="hero3d">جرّب المعاينة 3D</button></div><p class="truth">'+safe(cfg.truth.visual)+' '+safe(cfg.truth.measurement)+'</p></div>'+
  '<div class="hero-viewer"><div class="hero-viewer-head"><div><small>معاينة المشروع</small><b>شاهد أثر اختياراتك قبل الإرسال</b></div><button id="heroOpenStudio">فتح التجربة الكاملة</button></div><div class="hero-canvas-wrap" id="heroWrap"><canvas id="heroTwin"></canvas><div class="hero-badge">3D · تصور تمهيدي</div><div class="hero-state"><span id="heroRoom"></span><span id="heroLayout"></span><span id="heroNeeds"></span></div></div><div class="hero-outcome"><div><small>قبل</small><b>مقاسات وصور واحتياجات متفرقة</b></div><i>←</i><div><small>بعد التجربة</small><b>مشروع واحد قابل للمراجعة</b></div></div></div></div></section>';
}
function proofHtml(){
  return '<section class="proof"><div class="shell proof-grid"><article><span>01</span><b>مطبخ حسب المساحة</b><p>الرحلة تبدأ من شكل مشروعك ومقاساته، لا من قالب جاهز.</p></article><article><span>02</span><b>تصور 3D قبل التنفيذ</b><p>المعاينة تساعدك على اختيار الاتجاه ثم يعتمد المصمم التفاصيل.</p></article><article><span>03</span><b>قرارات محفوظة</b><p>الشكل واللون والتخزين والأجهزة تبقى داخل نفس المشروع.</p></article><article><span>04</span><b>تسليم منظم</b><p>النهاية ملخص واحد يفتح مباشرة مع واتساب دخاخني.</p></article></div></section>';
}
function journeyHtml(){
  var steps=[
    ["مساحتك","نوع المشروع، شكل المطبخ، المقاسات وما تعرفه من القيود."],
    ["الشكل واللون","اتجاه بصري ومعاينة ثلاثية الأبعاد مرتبطة بالمساحة."],
    ["الخزائن والتفاصيل","التخزين والأجهزة والتفاصيل العملية قبل التواصل."],
    ["مراجعة الطلب","ما أصبح واضحاً وما يحتاج اعتماداً بشرياً قبل السعر."],
    ["إرسال للمصمم","ملخص واحد قابل للمراجعة ثم فتح واتساب دخاخني."]
  ];
  return '<section class="journey"><div class="shell"><div class="journey-intro"><div><div class="eyebrow">مسار واحد · خمس مراحل</div><h2>من أول قياس إلى طلب أوضح.</h2></div><p>الفكرة ليست أن تصمم المطبخ بدلاً من المصمم؛ بل أن تصل إليه ومعك المعلومات والقرارات الأولية التي يحتاجها ليبدأ من نقطة أوضح.</p></div><ol class="journey-list">'+steps.map(function(x,i){return '<li><span>0'+(i+1)+'</span><b>'+x[0]+'</b><p>'+x[1]+'</p></li>'}).join("")+'</ol></div></section>';
}
function phaseNavHtml(){
  var steps=["المساحة والتخطيط","الشكل واللون","الخزائن والتفاصيل","مراجعة الطلب","التواصل والمراجعة"];
  return '<div class="phase-nav" id="phaseNav"><div class="phase-nav-top"><span>المرحلة <strong id="phaseNum">1</strong> من 5</span><b id="phaseName">'+steps[0]+'</b></div><ol>'+steps.map(function(x,i){return '<li data-phase="'+(i+1)+'" data-active="'+(i===0?"true":"false")+'" data-complete="false"><button type="button" data-step="'+(i+1)+'"><span>'+(i+1)+'</span><b>'+x+'</b></button></li>'}).join("")+'</ol></div>';
}
function phase1Html(){
  var notes={straight:"جدار واحد",l:"مساران متصلان",u:"ثلاثة مسارات",parallel:"جانبان متقابلان",island:"تكوين مع جزيرة"};
  return '<section class="phase active" data-phase-panel="1"><div class="phase-head"><div><div class="phase-kicker">01 — المساحة والتخطيط</div><h2>ابدأ بما يعرفه المصمم أولاً.</h2></div><p>حدد نوع المشروع والموقع وشكل المساحة، ثم أدخل المقاسات إن كانت معروفة. يمكنك الاستمرار حتى لو كنت تحتاج قياساً ميدانياً لاحقاً.</p></div><div class="grid"><div class="panel"><div class="panel-h"><div><h3>بيانات المساحة</h3><p>اختيارات قصيرة ومباشرة — لا نموذج طويل.</p></div><b id="projectCode">'+projectCode()+'</b></div><div class="panel-b">'+
  '<div class="block"><div class="block-title"><b>نوع المشروع</b><span>مطلوب للمتابعة.</span></div><div class="options">'+optionButtons(labels.project,state.projectType,"project")+'</div></div>'+
  '<div class="block"><div class="block-title"><b>المدينة / الحي</b><span>يساعد الفريق على فهم موقع المشروع.</span></div><div class="field"><label for="city">مثال: ينبع — حي الصريف</label><input id="city" value="'+safe(state.city)+'" placeholder="اكتب المدينة أو الحي"></div></div>'+
  '<div class="block"><div class="block-title"><b>شكل المطبخ</b><span>اختر أقرب شكل لمساحتك.</span></div><div class="options">'+optionButtons(labels.layout,state.layout,"layout",notes)+'</div></div>'+
  '<div class="block"><div class="block-title"><b>هل المقاسات معروفة؟</b><span>لا تمنع التجربة إذا كنت تحتاج قياساً.</span></div><div class="options"><button class="option '+(state.measurementMode==="known"?"active":"")+'" data-measure="known">أعرف المقاسات</button><button class="option '+(state.measurementMode==="need"?"active":"")+'" data-measure="need">أحتاج قياساً</button></div></div>'+
  '<div class="block" id="dimsBlock"><div class="block-title"><b>الأبعاد التقريبية</b><span>بالسنتيمتر.</span></div><div class="dims">'+dimHtml("roomL","الطول",state.room.length)+dimHtml("roomW","العرض",state.room.width)+dimHtml("roomH","ارتفاع السقف",state.room.height)+'</div></div>'+
  '<div class="block"><div class="upload"><input id="referenceFile" type="file" accept="image/*,.pdf"><label for="referenceFile">أضف مخططاً أو صورة للمساحة — اختياري</label><small>يستخدم كمرجع فقط ولا يتحول تلقائياً إلى قياسات دقيقة.</small><div id="referencePreview"></div></div></div>'+
  '</div></div><aside class="aside"><div class="plan-card"><div class="plan-card-head"><b>مخطط المساحة</b><span id="planLayout"></span></div><div class="plan-wrap" id="planWrap"></div></div><div id="spaceRule"></div><div class="summary-mini"><h4>ملخص المرحلة</h4><div id="spaceSummary"></div></div></aside></div></section>';
}
function dimHtml(id,name,val){return '<div class="dim"><label for="'+id+'">'+name+'</label><div class="dim-row"><input id="'+id+'" type="number" min="180" max="1200" step="5" value="'+val+'"><span>سم</span></div></div>'}
function phase2Html(){
  return '<section class="phase" data-phase-panel="2"><div class="phase-head"><div><div class="phase-kicker">02 — الشكل واللون</div><h2>جرّب اتجاهاً بصرياً على مساحة مشروعك.</h2></div><p>اختر تصوراً مبدئياً ثم غيّر واجهات الخزائن وسطح العمل داخل معاينة ثلاثية الأبعاد. هذه الاختيارات تساعد المصمم على فهم الاتجاه وليست اعتماداً نهائياً للخامة.</p></div>'+
  '<div class="panel"><div class="panel-b"><div class="block"><div class="block-title"><b>تصوران مبدئيان</b><span>مبنيان على شكل المساحة الحالي.</span></div><div class="options" id="conceptOptions"></div></div><div class="block"><div class="block-title"><b>اتجاه الستايل</b><span>اختيار بصري تمهيدي.</span></div><div class="options">'+optionButtons(labels.style,state.visual.style,"style")+'</div></div></div></div>'+
  '<div class="studio"><div class="studio-head"><div><span>المعاينة التفاعلية</span><h3>شكل، خامة، كاميرا — نفس المشروع</h3></div><button id="saveVisual">'+(state.visual.saved?"تم حفظ التوليفة ✓":"استخدم هذه التوليفة في طلبي")+'</button></div><div class="camera-bar"><button class="cam active" data-camera="hero">منظور رئيسي</button><button class="cam" data-camera="functional">منظور وظيفي</button><button class="cam" data-camera="front">واجهة أمامية</button><button class="cam" data-camera="island">منظور الجزيرة</button><button class="cam" data-camera="wide">المشهد الكامل</button></div><div class="studio-wrap" id="studioWrap"><canvas id="studioTwin"></canvas><div class="studio-note">'+safe(cfg.truth.visual)+' اسحب المشهد للدوران عند الحاجة.</div></div><div class="materials"><div class="material-box"><b>واجهات الخزائن</b><div class="swatches">'+swatch("ivory","#d7d0c3","cabinet")+swatch("oak","#9b744f","cabinet")+swatch("walnut","#594034","cabinet")+swatch("ash","#969690","cabinet")+swatch("graphite","#393d3b","cabinet")+swatch("gloss","#eceae5","cabinet")+'</div></div><div class="material-box"><b>سطح العمل</b><div class="swatches">'+swatch("veined","#e8e4dc","worktop")+swatch("warm","#a99a85","worktop")+swatch("dark","#4a4945","worktop")+swatch("quartz","#d9d6ce","worktop")+'</div></div></div><button class="use-combo '+(state.visual.saved?"active":"")+'" id="saveVisualBottom">'+(state.visual.saved?"التوليفة محفوظة داخل المشروع ✓":"حفظ التوليفة داخل المشروع")+'</button></div></section>';
}
function phase3Html(){
  return '<section class="phase" data-phase-panel="3"><div class="phase-head"><div><div class="phase-kicker">03 — الخزائن والتفاصيل</div><h2>أضف القرارات التي تغيّر التصميم فعلاً.</h2></div><p>هنا تنتقل من الشكل إلى الوظيفة: التخزين، الأجهزة، السقف، الإكسسوارات والحوض. كل اختيار يظهر في الملخص النهائي ويمكن للمصمم مراجعته معك.</p></div><div class="grid"><div class="panel"><div class="panel-b">'+
  '<div class="block"><div class="block-title"><b>التخزين</b><span>اختر ما تحتاجه في الاستخدام اليومي.</span></div><div class="choice-grid">'+toggleButtons(labels.storage,state.storage,"storage")+'</div></div>'+
  '<div class="block"><div class="block-title"><b>الأجهزة</b><span>الموجود أو المخطط له.</span></div><div class="choice-grid">'+toggleButtons(labels.appliances,state.appliances,"appliance")+'</div></div>'+
  '<div class="block"><div class="block-title"><b>تفاصيل المشروع</b><span>اختيارات مختصرة.</span></div><div class="fields"><div class="field"><label>عدد المستخدمين</label><select id="users"><option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option></select></div><div class="field"><label>كثافة الطبخ</label><select id="cooking"><option value="light">خفيف</option><option value="daily">يومي</option><option value="heavy">مكثف</option></select></div><div class="field"><label>السقف</label><select id="ceiling"><option value="standard">سقف قياسي</option><option value="high">سقف مرتفع</option><option value="unknown">غير متأكد</option></select></div><div class="field"><label>الإكسسوارات</label><select id="hardware"><option value="softclose">إغلاق هادئ</option><option value="premium">إكسسوارات مطورة</option><option value="unknown">يحدده المصمم</option></select></div><div class="field"><label>الحوض</label><select id="sink"><option value="keep">أستخدم الحوض الحالي</option><option value="new">أحتاج حوضاً جديداً</option><option value="unknown">غير محدد</option></select></div><div class="field"><label>الجزيرة</label><select id="islandPref"><option value="no">غير مطلوبة</option><option value="yes">أرغب بها إن سمحت المساحة</option></select></div></div></div>'+
  '</div></div><aside class="aside"><div class="summary-mini"><h4>ما سيفهمه المصمم</h4><div id="needsSummary"></div></div><div class="note">كل هذه الاختيارات تمهيدية. المقاس الداخلي، الإكسسوارات النهائية ومواقع الأجهزة تعتمد بعد القياس والمراجعة.</div></aside></div></section>';
}
function phase4Html(){
  return '<section class="phase" data-phase-panel="4"><div class="phase-head"><div><div class="phase-kicker">04 — مراجعة الطلب</div><h2>ما الذي أصبح واضحاً قبل التواصل؟</h2></div><p>لا نحسب سعراً آلياً بدون قواعد تسعير معتمدة من دخاخني. بدلاً من ذلك نوضح ما أصبح معروفاً عن المشروع وما يحتاج تأكيداً بشرياً قبل عرض السعر أو التصميم الفعلي.</p></div><div class="readiness"><div class="readiness-head"><div><small>اكتمال الملخص الأولي</small><b id="readinessText"></b></div><span id="readinessCode"></span></div><div class="readiness-track"><i id="readinessBar"></i></div></div><div class="review-grid"><article class="review-card"><span>تم ترتيبه</span><h3>هذه المعلومات جاهزة للمراجعة</h3><ul id="knownList"></ul></article><article class="review-card"><span>يُعتمد مع الفريق</span><h3>هذه النقاط تحتاج تأكيداً</h3><ul id="confirmList"></ul></article></div><div class="note good" style="margin-top:14px">الهدف من هذه المرحلة: أن تعرف أنت والمصمم ما هو محسوم وما هو مفتوح، من دون ادعاء سعر أو مخطط تنفيذي غير معتمد.</div></section>';
}
function phase5Html(){
  return '<section class="phase" data-phase-panel="5"><div class="phase-head"><div><div class="phase-kicker">05 — التواصل والمراجعة</div><h2>راجع مشروعك ثم أرسله لفريق دخاخني.</h2></div><p>أضف معلومات التواصل التي تريد إرسالها فقط. سترى الرسالة كاملة قبل فتح واتساب، ويمكنك نسخ رابط المشروع للعودة إليه لاحقاً.</p></div><div class="grid"><div><div class="panel"><div class="panel-h"><div><h3>بيانات التواصل</h3><p>الاسم والجوال مطلوبان قبل فتح واتساب.</p></div></div><div class="panel-b"><div class="fields"><div class="field"><label>الاسم</label><input id="name" value="'+safe(state.contact.name)+'" placeholder="الاسم"></div><div class="field"><label>رقم الجوال</label><input id="mobile" value="'+safe(state.contact.mobile)+'" placeholder="05xxxxxxxx" inputmode="tel"></div><div class="field"><label>موقع المشروع</label><input id="location" value="'+safe(state.contact.location)+'" placeholder="المدينة — الحي"></div><div class="field"><label>مرحلة المشروع</label><select id="stage"><option value="">غير محدد</option><option>مطبخ جديد</option><option>تجديد مطبخ قائم</option><option>استكشاف أولي</option></select></div><div class="field"><label>المخطط / القياس</label><select id="planStatus"><option value="">غير محدد</option><option>مخطط جاهز</option><option>قياسات مبدئية متوفرة</option><option>أحتاج قياساً</option><option>غير متأكد</option></select></div><div class="field"><label>ملاحظة للمصمم</label><textarea id="note" placeholder="أي نقطة تريد من المصمم الانتباه لها"></textarea></div></div><button class="share" id="shareProject">نسخ رابط المشروع للمراجعة لاحقاً</button></div></div><div class="final-summary" id="finalSummary"></div></div><aside class="handoff"><small>رسالة واتساب المنظمة</small><h3>نفس اختياراتك — في ملخص واحد.</h3><p>'+safe(cfg.truth.planning)+'</p><div class="preview-message"><pre id="waPreview"></pre></div><a class="whatsapp" id="waLink" target="_blank" rel="noopener">فتح واتساب دخاخني ←</a><a href="'+safe(cfg.officialSite)+'" target="_blank" rel="noopener" style="font-size:9px;text-align:center;color:#d8c8a7">الموقع الرسمي لدخاخني ↗</a></aside></div></section>';
}
function planSvg(){
  var L=Math.max(220,+state.room.length||420),W=Math.max(200,+state.room.width||320),scale=Math.min(500/L,300/W),rw=L*scale,rh=W*scale,x=(580-rw)/2,y=(360-rh)/2,a=[];
  a.push('<svg viewBox="0 0 580 360" aria-label="مخطط تقريبي للمساحة"><rect x="'+x+'" y="'+y+'" width="'+rw+'" height="'+rh+'" fill="#faf7f1" stroke="#183d33" stroke-width="4"/>');
  a.push('<text x="290" y="'+(y-10)+'" text-anchor="middle" font-size="11" fill="#645f58">'+L+' سم</text>');
  a.push('<text x="'+(x+rw+22)+'" y="'+(y+rh/2)+'" text-anchor="middle" font-size="11" fill="#645f58" transform="rotate(90 '+(x+rw+22)+' '+(y+rh/2)+')">'+W+' سم</text>');
  var d=Math.max(18,Math.min(52,Math.min(rw,rh)*.17));
  function rect(rx,ry,w,h,c){a.push('<rect x="'+rx+'" y="'+ry+'" width="'+w+'" height="'+h+'" rx="2" fill="'+(c||"#183d33")+'"/>')}
  rect(x+8,y+8,rw-16,d);
  if(state.layout==="l"||state.layout==="u")rect(x+rw-d-8,y+d+8,d,rh-d-16);
  if(state.layout==="u")rect(x+8,y+d+8,d,rh-d-16);
  if(state.layout==="parallel")rect(x+8,y+rh-d-8,rw-16,d);
  if(state.layout==="island")rect(x+rw*.32,y+rh*.55,rw*.36,Math.max(20,d*.72),"#a88e60");
  a.push('</svg>');return a.join("");
}
function concepts(){
  var L=+state.room.length,W=+state.room.width,canIsland=L>=380&&W>=330,base=state.layout;
  if(base==="island"&&!canIsland)base="l";
  var a=base,b;
  if(a==="straight"&&L>=340&&W>=280)a="l";
  if(a==="l")b=W>=300?"u":"straight";else if(a==="u")b=canIsland?"island":"l";else if(a==="parallel")b="l";else if(a==="island")b="u";else b=W>=280?"l":"straight";
  return {A:{layout:a,title:"التصور A",reason:"يحافظ على حركة واضحة ويعطي أولوية للتخزين والتحضير."},B:{layout:b,title:"التصور B",reason:b==="island"?"يختبر جزيرة مبدئية لأن المساحة تسمح بذلك تقريبياً.":"يستخدم جداراً إضافياً لزيادة سطح العمل أو التخزين."}};
}
function currentConcept(){return concepts()[state.concept]||concepts().A}
function readiness(){
  var n=45;
  if(state.projectType)n+=8;if(state.city)n+=7;if(state.layout)n+=7;if(state.measurementMode==="need"||(state.room.length&&state.room.width))n+=8;
  if(state.visual.saved)n+=10;if(activeKeys(state.storage).length)n+=5;if(activeKeys(state.appliances).length)n+=5;if(state.contact.location)n+=3;if(state.contact.planStatus)n+=2;
  return Math.min(100,n);
}
function summaryMessage(){
  var c=currentConcept(),storage=activeKeys(state.storage).map(function(k){return labels.storage[k]}),apps=activeKeys(state.appliances).map(function(k){return labels.appliances[k]});
  var lines=[
    "السلام عليكم، هذا ملخص مشروع مطبخ تمهيدي من تجربة دخاخني:",
    "رقم المشروع: "+projectCode(),
    "نوع المشروع: "+(labels.project[state.projectType]||"غير محدد"),
    "المدينة / الحي: "+(state.city||"غير محدد"),
    "شكل المطبخ: "+labels.layout[c.layout],
    "المقاسات: "+(state.measurementMode==="need"?"أحتاج قياساً":state.room.length+" × "+state.room.width+" × "+state.room.height+" سم"),
    "التخزين: "+(storage.join("، ")||"غير محدد"),
    "الأجهزة: "+(apps.join("، ")||"غير محدد"),
    "الاتجاه البصري: "+labels.style[state.visual.style]+" / "+labels.cabinet[state.visual.cabinet]+" / "+labels.worktop[state.visual.worktop],
    "السقف: "+labels.ceiling[state.details.ceiling],
    "الإكسسوارات: "+labels.hardware[state.details.hardware],
    "الحوض: "+labels.sink[state.details.sink],
    "موقع المشروع: "+(state.contact.location||"غير محدد"),
    "حالة المخطط / القياس: "+(state.contact.planStatus||"غير محدد")
  ];
  if(state.contact.name)lines.push("الاسم: "+state.contact.name);
  if(state.contact.mobile)lines.push("الجوال: "+state.contact.mobile);
  if(state.contact.note)lines.push("ملاحظة للمصمم: "+state.contact.note);
  lines.push(cfg.truth.planning);lines.push(cfg.truth.visual);
  return lines.join("\n");
}
function updateUI(){
  save();
  document.querySelectorAll(".phase").forEach(function(e){e.classList.toggle("active",+e.dataset.phasePanel===state.phase)});
  var names=["المساحة والتخطيط","الشكل واللون","الخزائن والتفاصيل","مراجعة الطلب","التواصل والمراجعة"];
  document.querySelectorAll(".phase-nav li").forEach(function(li,i){li.dataset.active=(i+1===state.phase)?"true":"false";li.dataset.complete=(i+1<state.phase)?"true":"false";var b=li.querySelector("button");b.disabled=i+1>state.maxPhase});
  var pn=document.getElementById("phaseNum"),pname=document.getElementById("phaseName"),bp=document.getElementById("bottomProgress");if(pn)pn.textContent=state.phase;if(pname)pname.textContent=names[state.phase-1];if(bp)bp.textContent="المرحلة "+state.phase+" من 5";
  var next=document.getElementById("nextBtn"),back=document.getElementById("backBtn"),nextLabels=["التالي: الشكل واللون","التالي: الخزائن والتفاصيل","التالي: مراجعة الطلب","التالي: التواصل والمراجعة","حفظ المشروع"];if(next)next.textContent=nextLabels[state.phase-1];if(back){back.disabled=state.phase===1;back.style.opacity=state.phase===1?".45":"1"}
  document.querySelectorAll("[data-project]").forEach(function(e){e.classList.toggle("active",e.dataset.project===state.projectType)});
  document.querySelectorAll("[data-layout]").forEach(function(e){e.classList.toggle("active",e.dataset.layout===state.layout)});
  document.querySelectorAll("[data-measure]").forEach(function(e){e.classList.toggle("active",e.dataset.measure===state.measurementMode)});
  var dims=document.getElementById("dimsBlock");if(dims)dims.style.display=state.measurementMode==="known"?"block":"none";
  var plan=document.getElementById("planWrap");if(plan)plan.innerHTML=planSvg();var pl=document.getElementById("planLayout");if(pl)pl.textContent=labels.layout[state.layout];
  var codeEl=document.getElementById("projectCode");if(codeEl)codeEl.textContent=projectCode();
  var spaceRule=document.getElementById("spaceRule");if(spaceRule){var warn=[];if(state.layout==="island"&&(state.room.width<330||state.room.length<380))warn.push("المساحة الحالية صغيرة نسبياً لتكوين جزيرة؛ المصمم سيحتاج مراجعة الممرات.");if(state.layout==="parallel"&&state.room.width<260)warn.push("التكوين المتوازي يحتاج عرضاً أكبر للممر.");spaceRule.innerHTML=warn.length?'<div class="note warn">'+warn.join("<br>")+'</div>':'<div class="note good">المعلومات الحالية كافية لمتابعة التصور الأولي. الاعتماد النهائي بعد القياس.</div>'}
  var ss=document.getElementById("spaceSummary");if(ss)ss.innerHTML='<div class="summary-line"><span>نوع المشروع</span><b>'+safe(labels.project[state.projectType]||"غير محدد")+'</b></div><div class="summary-line"><span>الموقع</span><b>'+safe(state.city||"غير محدد")+'</b></div><div class="summary-line"><span>الشكل</span><b>'+labels.layout[state.layout]+'</b></div><div class="summary-line"><span>المقاسات</span><b>'+(state.measurementMode==="need"?"أحتاج قياساً":state.room.length+" × "+state.room.width+" سم")+'</b></div>';
  var con=document.getElementById("conceptOptions");if(con){var cs=concepts();con.innerHTML=["A","B"].map(function(k){var x=cs[k];return '<button type="button" class="option visual '+(state.concept===k?"active":"")+'" data-concept="'+k+'"><b>'+x.title+' — '+labels.layout[x.layout]+'</b><small>'+x.reason+'</small></button>'}).join("")}
  document.querySelectorAll("[data-style]").forEach(function(e){e.classList.toggle("active",e.dataset.style===state.visual.style)});
  document.querySelectorAll("[data-cabinet]").forEach(function(e){e.classList.toggle("active",e.dataset.cabinet===state.visual.cabinet)});
  document.querySelectorAll("[data-worktop]").forEach(function(e){e.classList.toggle("active",e.dataset.worktop===state.visual.worktop)});
  var sv=document.getElementById("saveVisual"),svb=document.getElementById("saveVisualBottom");if(sv)sv.textContent=state.visual.saved?"تم حفظ التوليفة ✓":"استخدم هذه التوليفة في طلبي";if(svb){svb.textContent=state.visual.saved?"التوليفة محفوظة داخل المشروع ✓":"حفظ التوليفة داخل المشروع";svb.classList.toggle("active",state.visual.saved)}
  var ns=document.getElementById("needsSummary");if(ns)ns.innerHTML='<div class="summary-line"><span>التخزين</span><b>'+activeKeys(state.storage).length+' اختيارات</b></div><div class="summary-line"><span>الأجهزة</span><b>'+activeKeys(state.appliances).length+' اختيارات</b></div><div class="summary-line"><span>المستخدمون</span><b>'+safe(state.details.users)+'</b></div><div class="summary-line"><span>الطبخ</span><b>'+({light:"خفيف",daily:"يومي",heavy:"مكثف"}[state.details.cooking])+'</b></div><div class="summary-line"><span>الحوض</span><b>'+labels.sink[state.details.sink]+'</b></div>';
  var r=readiness(),rt=document.getElementById("readinessText"),rb=document.getElementById("readinessBar"),rc=document.getElementById("readinessCode");if(rt)rt.textContent=r+"%";if(rb)rb.style.width=r+"%";if(rc)rc.textContent=projectCode();
  var known=document.getElementById("knownList"),confirm=document.getElementById("confirmList");if(known){var kl=["نوع المشروع: "+(labels.project[state.projectType]||"غير محدد"),"شكل المساحة: "+labels.layout[currentConcept().layout],"المقاسات: "+(state.measurementMode==="need"?"تحتاج قياساً":state.room.length+" × "+state.room.width+" سم"),"التخزين: "+activeKeys(state.storage).length+" اختيارات","الأجهزة: "+activeKeys(state.appliances).length+" اختيارات","الاتجاه البصري: "+labels.cabinet[state.visual.cabinet]+" + "+labels.worktop[state.visual.worktop]];known.innerHTML=kl.map(function(x){return"<li>"+safe(x)+"</li>"}).join("")}if(confirm){confirm.innerHTML=["القياس الموقعي النهائي","الخامة والعينة الفعلية","مواقع الأجهزة والتمديدات","الإكسسوارات الداخلية النهائية","عرض السعر ومدة التنفيذ"].map(function(x){return"<li>"+x+"</li>"}).join("")}
  var fs=document.getElementById("finalSummary");if(fs){var rows=[["رقم المشروع",projectCode()],["نوع المشروع",labels.project[state.projectType]||"غير محدد"],["المدينة / الحي",state.city||"غير محدد"],["التصور",currentConcept().title+" — "+labels.layout[currentConcept().layout]],["المقاسات",state.measurementMode==="need"?"أحتاج قياساً":state.room.length+" × "+state.room.width+" × "+state.room.height+" سم"],["الخزائن",activeKeys(state.storage).map(function(k){return labels.storage[k]}).join("، ")||"غير محدد"],["الأجهزة",activeKeys(state.appliances).map(function(k){return labels.appliances[k]}).join("، ")||"غير محدد"],["الخامة المبدئية",labels.cabinet[state.visual.cabinet]+" / "+labels.worktop[state.visual.worktop]],["حالة القياس",state.contact.planStatus||"غير محدد"],["موقع المشروع",state.contact.location||"غير محدد"]];fs.innerHTML=rows.map(function(x){return'<div><small>'+x[0]+'</small><b>'+safe(x[1])+'</b></div>'}).join("")}
  var msg=summaryMessage(),wp=document.getElementById("waPreview"),wa=document.getElementById("waLink");if(wp)wp.textContent=msg;if(wa)wa.href="https://wa.me/"+cfg.whatsapp+"?text="+encodeURIComponent(msg);
  var hr=document.getElementById("heroRoom"),hl=document.getElementById("heroLayout"),hn=document.getElementById("heroNeeds");if(hr)hr.textContent=state.measurementMode==="need"?"القياس لاحقاً":state.room.length+" × "+state.room.width+" سم";if(hl)hl.textContent=labels.layout[currentConcept().layout];if(hn)hn.textContent=activeKeys(state.storage).length+" تخزين · "+activeKeys(state.appliances).length+" أجهزة";
  if(runtime.hero)rebuildTwin(runtime.hero);if(runtime.studio)rebuildTwin(runtime.studio);
}
function validatePhase(n){
  if(n===1){if(!state.projectType){toast("اختر نوع المشروع أولاً");return false}if(!state.city.trim()){toast("اكتب المدينة أو الحي للمتابعة");return false}}
  if(n===2&&!state.visual.saved){toast("احفظ التوليفة التي اخترتها قبل المتابعة");return false}
  if(n===5){if(!state.contact.name.trim()){toast("اكتب الاسم قبل فتح واتساب");return false}if(!/^0?5\d{8}$/.test(state.contact.mobile.replace(/\s+/g,""))){toast("أدخل رقم جوال سعودي صحيح");return false}}
  return true;
}
function go(n){
  n=Math.max(1,Math.min(5,n));if(n>state.phase&&n>state.maxPhase)return;if(n>state.phase&&!validatePhase(state.phase))return;
  state.phase=n;state.maxPhase=Math.max(state.maxPhase,n);updateUI();
  document.getElementById("phaseNav").scrollIntoView({behavior:"smooth",block:"start"});
  if(n===2){initStudio();setTimeout(function(){cameraPreset(runtime.studio,"hero")},80)}
}
function shareProject(){
  var u=location.origin+location.pathname+"?project="+enc(state);
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(function(){toast("تم نسخ رابط المشروع")}).catch(function(){toast("تعذر نسخ الرابط")});else toast("المتصفح لا يدعم النسخ التلقائي");
}
function bind(){
  root.addEventListener("click",function(ev){
    var t=ev.target.closest("button,a");if(!t)return;
    if(t.id==="navStart"||t.id==="heroStart"){state.phase=1;state.maxPhase=Math.max(state.maxPhase,1);updateUI();document.getElementById("phaseNav").scrollIntoView({behavior:"smooth",block:"start"});return}
    if(t.id==="hero3d"||t.id==="heroOpenStudio"){if(state.maxPhase<2)state.maxPhase=2;state.phase=2;updateUI();initStudio();document.getElementById("phaseNav").scrollIntoView({behavior:"smooth",block:"start"});return}
    if(t.dataset.step){var n=+t.dataset.step;if(n<=state.maxPhase){state.phase=n;updateUI();if(n===2)initStudio();document.getElementById("phaseNav").scrollIntoView({behavior:"smooth",block:"start"})}return}
    if(t.dataset.project){state.projectType=t.dataset.project;updateUI();return}
    if(t.dataset.layout){state.layout=t.dataset.layout;state.visual.saved=false;updateUI();return}
    if(t.dataset.measure){state.measurementMode=t.dataset.measure;updateUI();return}
    if(t.dataset.concept){state.concept=t.dataset.concept;state.visual.saved=false;updateUI();return}
    if(t.dataset.style){state.visual.style=t.dataset.style;state.visual.saved=false;updateUI();return}
    if(t.dataset.cabinet){state.visual.cabinet=t.dataset.cabinet;state.visual.saved=false;updateUI();return}
    if(t.dataset.worktop){state.visual.worktop=t.dataset.worktop;state.visual.saved=false;updateUI();return}
    if(t.dataset.storage){var sk=t.dataset.storage;state.storage[sk]=!state.storage[sk];updateUI();return}
    if(t.dataset.appliance){var ak=t.dataset.appliance;state.appliances[ak]=!state.appliances[ak];updateUI();return}
    if(t.dataset.camera){cameraPreset(runtime.studio,t.dataset.camera);document.querySelectorAll(".cam").forEach(function(x){x.classList.toggle("active",x===t)});return}
    if(t.id==="saveVisual"||t.id==="saveVisualBottom"){state.visual.saved=true;updateUI();toast("تم حفظ التوليفة داخل المشروع");return}
    if(t.id==="shareProject"){shareProject();return}
  });
  root.addEventListener("input",function(ev){
    var e=ev.target,id=e.id;
    if(id==="city")state.city=e.value;
    if(id==="roomL")state.room.length=+e.value||state.room.length;
    if(id==="roomW")state.room.width=+e.value||state.room.width;
    if(id==="roomH")state.room.height=+e.value||state.room.height;
    if(id==="name")state.contact.name=e.value;
    if(id==="mobile")state.contact.mobile=e.value;
    if(id==="location")state.contact.location=e.value;
    if(id==="note")state.contact.note=e.value;
    updateUI();
  });
  root.addEventListener("change",function(ev){
    var e=ev.target,id=e.id;
    if(id==="users")state.details.users=e.value;
    if(id==="cooking")state.details.cooking=e.value;
    if(id==="ceiling")state.details.ceiling=e.value;
    if(id==="hardware")state.details.hardware=e.value;
    if(id==="sink")state.details.sink=e.value;
    if(id==="islandPref")state.details.island=e.value==="yes";
    if(id==="stage")state.contact.stage=e.value;
    if(id==="planStatus")state.contact.planStatus=e.value;
    if(id==="referenceFile"){handleReference(e.files&&e.files[0]);return}
    updateUI();
  });
  document.getElementById("backBtn").addEventListener("click",function(){if(state.phase>1){state.phase--;updateUI();document.getElementById("phaseNav").scrollIntoView({behavior:"smooth",block:"start"})}});
  document.getElementById("nextBtn").addEventListener("click",function(){if(state.phase<5){if(validatePhase(state.phase)){state.phase++;state.maxPhase=Math.max(state.maxPhase,state.phase);updateUI();if(state.phase===2)initStudio();document.getElementById("phaseNav").scrollIntoView({behavior:"smooth",block:"start"})}}else{save();toast("تم حفظ المشروع على هذا الجهاز")}});
}
function handleReference(file){
  if(!file)return;state.referenceName=file.name;var box=document.getElementById("referencePreview");if(!box)return;
  if(file.type&&file.type.indexOf("image/")===0){var r=new FileReader();r.onload=function(){runtime.reference=r.result;box.innerHTML='<img alt="مرجع المساحة" src="'+r.result+'"><small>'+safe(file.name)+'</small>'};r.readAsDataURL(file)}else box.innerHTML='<small>'+safe(file.name)+' — تم تسجيله كمرجع فقط.</small>';
  toast("تمت إضافة المرجع");
}
function hydrate(){
  var map={users:state.details.users,cooking:state.details.cooking,ceiling:state.details.ceiling,hardware:state.details.hardware,sink:state.details.sink,islandPref:state.details.island?"yes":"no",stage:state.contact.stage,planStatus:state.contact.planStatus};
  Object.keys(map).forEach(function(k){var e=document.getElementById(k);if(e)e.value=map[k]});
}
function noiseTexture(kind){
  var c=document.createElement("canvas"),x=c.getContext("2d");c.width=c.height=512;
  if(kind==="wood"){
    var base={oak:"#9a724e",walnut:"#563d31"}[state.visual.cabinet]||"#947154";x.fillStyle=base;x.fillRect(0,0,512,512);
    for(var i=0;i<180;i++){var y=Math.random()*512,amp=1+Math.random()*5;x.strokeStyle="rgba(55,34,22,"+(0.035+Math.random()*.08)+")";x.lineWidth=.5+Math.random()*1.2;x.beginPath();x.moveTo(0,y);for(var p=0;p<=512;p+=28)x.lineTo(p,y+Math.sin(p*.025+i)*amp);x.stroke()}
  }else if(kind==="stone"){
    x.fillStyle=state.visual.worktop==="dark"?"#4d4c48":(state.visual.worktop==="warm"?"#a99a86":"#e8e4dd");x.fillRect(0,0,512,512);
    for(var j=0;j<20;j++){var sy=Math.random()*512;x.strokeStyle=state.visual.worktop==="dark"?"rgba(232,230,220,.16)":"rgba(80,76,70,.14)";x.lineWidth=.8+Math.random()*2;x.beginPath();x.moveTo(-20,sy);for(var q=0;q<560;q+=45){sy+=(Math.random()-.5)*38;x.lineTo(q,sy)}x.stroke()}
  }else{
    x.fillStyle="#cfc8bb";x.fillRect(0,0,512,512);x.strokeStyle="rgba(70,65,58,.12)";x.lineWidth=2;for(var t=0;t<=512;t+=128){x.beginPath();x.moveTo(t,0);x.lineTo(t,512);x.stroke();x.beginPath();x.moveTo(0,t);x.lineTo(512,t);x.stroke()}
  }
  var tex=new THREE.CanvasTexture(c);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.encoding=THREE.sRGBEncoding;return tex;
}
function materials(renderer){
  var wood=noiseTexture("wood"),stone=noiseTexture("stone"),floor=noiseTexture("floor"),cabColor={ivory:0xd7d0c3,oak:0xffffff,walnut:0xffffff,ash:0x969690,graphite:0x383b39,gloss:0xeceae5}[state.visual.cabinet]||0xd7d0c3;
  wood.repeat.set(2,1);stone.repeat.set(2.4,.9);floor.repeat.set(4,4);
  var aniso=renderer&&renderer.capabilities?Math.min(8,renderer.capabilities.getMaxAnisotropy()):1;wood.anisotropy=stone.anisotropy=floor.anisotropy=aniso;
  return {
    cab:new THREE.MeshPhysicalMaterial({color:cabColor,map:(state.visual.cabinet==="oak"||state.visual.cabinet==="walnut")?wood:null,roughness:state.visual.cabinet==="gloss"?.18:.36,clearcoat:state.visual.cabinet==="gloss"?.72:.12,clearcoatRoughness:.28,envMapIntensity:.7}),
    inside:new THREE.MeshStandardMaterial({color:0xd8d3ca,roughness:.62}),
    stone:new THREE.MeshPhysicalMaterial({color:0xffffff,map:stone,roughness:.20,clearcoat:.34,clearcoatRoughness:.16,envMapIntensity:.8}),
    metal:new THREE.MeshStandardMaterial({color:0xa6aaa7,roughness:.28,metalness:.88}),
    dark:new THREE.MeshStandardMaterial({color:0x161816,roughness:.34,metalness:.44}),
    appliance:new THREE.MeshPhysicalMaterial({color:0x111413,roughness:.08,metalness:.18,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1}),
    glass:new THREE.MeshPhysicalMaterial({color:0xdce6e5,roughness:.06,transparent:true,opacity:.28,clearcoat:1,transmission:.20,thickness:.02,envMapIntensity:1}),
    wall:new THREE.MeshStandardMaterial({color:0xe7e1d7,roughness:.9}),
    ceiling:new THREE.MeshStandardMaterial({color:0xf0ede7,roughness:.95}),
    floor:new THREE.MeshPhysicalMaterial({color:0xffffff,map:floor,roughness:.66,clearcoat:.03}),
    wood:new THREE.MeshPhysicalMaterial({color:0xffffff,map:wood,roughness:.44,clearcoat:.06}),
    brass:new THREE.MeshStandardMaterial({color:0xa98f62,roughness:.28,metalness:.78}),
    led:new THREE.MeshStandardMaterial({color:0xffe9bf,emissive:0xffd58e,emissiveIntensity:.7,roughness:.55})
  };
}
function softBox(w,h,d,mat){
  var min=Math.min(w,h,d),r=Math.max(.002,Math.min(.012,min*.16));
  if(min<.018||w>3||h>3||d>3){var bm=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);bm.castShadow=true;bm.receiveShadow=true;return bm}
  var iw=Math.max(.003,w-2*r),ih=Math.max(.003,h-2*r),dep=Math.max(.003,d-2*r),sh=new THREE.Shape();sh.moveTo(-iw/2,-ih/2);sh.lineTo(iw/2,-ih/2);sh.lineTo(iw/2,ih/2);sh.lineTo(-iw/2,ih/2);sh.closePath();
  var g=new THREE.ExtrudeGeometry(sh,{depth:dep,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:r,bevelThickness:r,curveSegments:1});g.translate(0,0,-dep/2);g.computeVertexNormals();var m=new THREE.Mesh(g,mat);m.castShadow=true;m.receiveShadow=true;return m;
}
function put(parent,obj,x,y,z,ry){obj.position.set(x||0,y||0,z||0);if(ry)obj.rotation.y=ry;parent.add(obj);return obj}
function carcass(mat,w,h,d){var g=new THREE.Group(),p=.018;put(g,softBox(p,h,d,mat.inside),-w/2+p/2,h/2,0);put(g,softBox(p,h,d,mat.inside),w/2-p/2,h/2,0);put(g,softBox(w-p*2,p,d,mat.inside),0,p/2,0);put(g,softBox(w-p*2,p,d,mat.inside),0,h-p/2,0);put(g,softBox(w-p*2,h-p*2,.012,mat.inside),0,h/2,-d/2+.006);return g}
function front(g,mat,w,h,y,z,m,handle){
  put(g,softBox(w-.038,h-.038,.024,m||mat.cab),0,y,z);
  if(handle!=="integrated")put(g,softBox(Math.max(.10,w*.34),.012,.014,handle==="brass"?mat.brass:mat.dark),0,y+h*.28,z+.022);
  else put(g,softBox(Math.max(.12,w*.42),.010,.012,mat.dark),0,y+h*.32,z+.020);
}
function baseUnit(mat,type,w){
  w=w||.6;var g=carcass(mat,w,.78,.58),z=.304;put(g,softBox(w-.11,.09,.43,mat.dark),0,.045,.02);
  if(type==="drawers"){for(var i=0;i<3;i++){var hh=.222,yy=.151+i*.234;front(g,mat,w,hh,yy,z,mat.cab,state.visual.handle)}}
  else if(type==="dishwasher"){front(g,mat,w,.70,.40,z,mat.metal,"integrated");put(g,softBox(w*.52,.016,.016,mat.dark),0,.66,z+.024)}
  else front(g,mat,w,.70,.40,z,mat.cab,state.visual.handle);
  return g;
}
function wallUnit(mat,w,glass){
  w=w||.68;var g=carcass(mat,w,.72,.34);front(g,mat,w,.66,.36,.184,glass?mat.glass:mat.cab,state.visual.handle);
  if(glass){put(g,softBox(w-.09,.016,.24,mat.wood),0,.235,-.03);put(g,softBox(w-.09,.016,.24,mat.wood),0,.485,-.03)}
  return g;
}
function tallUnit(mat,type){
  var g=carcass(mat,.64,2.20,.62),z=.324;
  if(type==="oven"){front(g,mat,.64,.57,.34,z,mat.cab,state.visual.handle);front(g,mat,.64,.57,1.87,z,mat.cab,state.visual.handle);put(g,softBox(.57,.56,.03,mat.appliance),0,1.10,z);put(g,softBox(.43,.016,.018,mat.metal),0,1.29,z+.025)}
  else if(type==="fridge"){front(g,mat,.64,1.36,1.47,z,mat.cab,state.visual.handle);front(g,mat,.64,.65,.38,z,mat.cab,state.visual.handle)}
  else front(g,mat,.64,2.10,1.10,z,mat.cab,state.visual.handle);
  return g;
}
function sinkSet(mat){
  var g=new THREE.Group(),rim=softBox(.54,.035,.42,mat.metal);put(g,rim,0,0,0);put(g,softBox(.46,.09,.34,mat.dark),0,-.055,0);
  var curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.17,.015,0),new THREE.Vector3(-.17,.31,0),new THREE.Vector3(-.01,.49,0),new THREE.Vector3(.16,.37,0)]),tube=new THREE.Mesh(new THREE.TubeGeometry(curve,28,.017,10,false),mat.metal);tube.castShadow=true;g.add(tube);return g;
}
function hobSet(mat){
  var g=new THREE.Group();put(g,softBox(.56,.018,.43,mat.appliance),0,0,0);for(var i=0;i<4;i++){var ring=new THREE.Mesh(new THREE.TorusGeometry(.068,.005,10,30),mat.dark);ring.rotation.x=Math.PI/2;ring.position.set((i%2?1:-1)*.14,.014,(i>1?1:-1)*.1);g.add(ring)}return g;
}
function hoodSet(mat){
  var g=new THREE.Group();put(g,softBox(.62,.065,.34,mat.metal),0,0,0);put(g,softBox(.28,.52,.20,mat.metal),0,.29,-.02);put(g,softBox(.44,.014,.15,mat.dark),0,-.04,.05);return g;
}
function pendant(mat){var g=new THREE.Group(),shade=new THREE.Mesh(new THREE.CylinderGeometry(.055,.20,.24,32,1,true),mat.dark);shade.castShadow=true;g.add(shade);put(g,softBox(.010,.58,.010,mat.dark),0,.41,0);var bulb=new THREE.Mesh(new THREE.SphereGeometry(.035,16,10),mat.led);bulb.position.y=-.05;g.add(bulb);return g}
function environmentTexture(){
  var faces=[];for(var f=0;f<6;f++){var c=document.createElement("canvas"),x=c.getContext("2d");c.width=c.height=128;var gr=x.createLinearGradient(0,0,0,128);gr.addColorStop(0,f===3?"#6d675f":"#dce7eb");gr.addColorStop(.45,"#f0eadf");gr.addColorStop(1,"#5d574f");x.fillStyle=gr;x.fillRect(0,0,128,128);if(f===0||f===4){x.fillStyle="rgba(255,250,235,.85)";x.fillRect(18,8,30,100)}faces.push(c)}var t=new THREE.CubeTexture(faces);t.encoding=THREE.sRGBEncoding;t.needsUpdate=true;return t;
}
function createTwin(canvas,wrap,interactive){
  if(!window.THREE||!canvas||!wrap)return null;var renderer;
  try{renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,powerPreference:"high-performance"})}catch(e){wrap.innerHTML='<div class="note warn">تعذر تشغيل المعاينة ثلاثية الأبعاد على هذا الجهاز. بقية المشروع ما زال متاحاً.</div>';return null}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,interactive?(window.innerWidth<700?1.25:1.7):(window.innerWidth<700?1:1.25)));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.96;renderer.physicallyCorrectLights=true;
  var scene=new THREE.Scene();scene.background=new THREE.Color(0xd8d3cb);scene.environment=environmentTexture();scene.fog=new THREE.Fog(0xd8d3cb,14,32);var camera=new THREE.PerspectiveCamera(35,1,.1,80),world=new THREE.Group();scene.add(world);
  scene.add(new THREE.HemisphereLight(0xf6f2e9,0x554f48,.72));var sun=new THREE.DirectionalLight(0xfff0d8,2.35);sun.position.set(5,8,6);sun.castShadow=true;sun.shadow.mapSize.set(window.innerWidth<700?1024:2048,window.innerWidth<700?1024:2048);sun.shadow.camera.left=-8;sun.shadow.camera.right=8;sun.shadow.camera.top=8;sun.shadow.camera.bottom=-8;sun.shadow.bias=-.00008;sun.shadow.normalBias=.018;scene.add(sun);var fill=new THREE.DirectionalLight(0xd7e8f5,.65);fill.position.set(-5,4,5);scene.add(fill);var warm=new THREE.PointLight(0xffd7aa,1.2,7,2);warm.position.set(0,2.3,1);scene.add(warm);
  var camGoal=new THREE.Vector3(5.5,3.0,6.5),target=new THREE.Vector3(0,1.05,-.3),drag=false,lx=0,theta=.68,radius=8;
  camera.position.copy(camGoal);camera.lookAt(target);
  function resize(){var w=wrap.clientWidth,h=wrap.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}window.addEventListener("resize",resize);resize();
  if(interactive){canvas.addEventListener("pointerdown",function(e){drag=true;lx=e.clientX;canvas.setPointerCapture&&canvas.setPointerCapture(e.pointerId)});canvas.addEventListener("pointermove",function(e){if(!drag)return;theta-=(e.clientX-lx)*.004;lx=e.clientX;camGoal.set(target.x+radius*Math.sin(theta),Math.max(1.8,camGoal.y),target.z+radius*Math.cos(theta))});canvas.addEventListener("pointerup",function(){drag=false});canvas.addEventListener("pointercancel",function(){drag=false})}
  function loop(){requestAnimationFrame(loop);camera.position.lerp(camGoal,.075);camera.lookAt(target);var r=wrap.getBoundingClientRect();if(!document.hidden&&r.bottom>0&&r.top<window.innerHeight)renderer.render(scene,camera)}loop();
  return {renderer:renderer,scene:scene,camera:camera,world:world,camGoal:camGoal,target:target,wrap:wrap,interactive:interactive,setOrbit:function(t,r){theta=t;radius=r}};
}
function clearWorld(t){if(!t)return;while(t.world.children.length){var o=t.world.children[0];t.world.remove(o);o.traverse&&o.traverse(function(n){if(n.geometry&&n.geometry.dispose)n.geometry.dispose()})}}
function buildSideRun(t,mat,L,W,side){
  var count=Math.max(2,Math.min(4,Math.floor((W-.8)/.62))),g=new THREE.Group(),len=count*.62,start=-len/2+.31;
  for(var i=0;i<count;i++)put(g,baseUnit(mat,i===0?"drawers":"doors",.6),start+i*.62,.12,0);put(g,softBox(len+.05,.055,.68,mat.stone),0,.965,0);put(g,softBox(len+.02,.08,.46,mat.dark),0,.065,.02);g.rotation.y=side>0?-Math.PI/2:Math.PI/2;g.position.set(side*(L/2-.34),0,-W/2+.34+len/2);t.world.add(g);
}
function buildParallel(t,mat,L,W){
  var count=Math.max(3,Math.min(5,Math.floor((L-.8)/.62))),g=new THREE.Group(),len=count*.62,start=-len/2+.31;for(var i=0;i<count;i++)put(g,baseUnit(mat,i%2?"doors":"drawers",.6),start+i*.62,.12,0);put(g,softBox(len+.05,.055,.68,mat.stone),0,.965,0);g.rotation.y=Math.PI;g.position.set(0,0,W/2-.34);t.world.add(g);
}
function buildIsland(t,mat){
  var g=new THREE.Group();for(var i=0;i<3;i++)put(g,baseUnit(mat,i===1?"drawers":"doors",.6),-.62+i*.62,.12,0);put(g,softBox(2.02,.065,.92,mat.stone),0,.97,0);put(g,softBox(1.72,.09,.56,mat.dark),0,.065,0);g.position.set(.20,0,.28);t.world.add(g);
  [-.42,.20,.82].forEach(function(px){put(t.world,pendant(mat),px,2.37,.28)});
}
function rebuildTwin(t){
  if(!t)return;clearWorld(t);var mat=materials(t.renderer),L=Math.max(2.6,state.room.length/100),W=Math.max(2.4,state.room.width/100),H=Math.max(2.45,state.room.height/100),layout=currentConcept().layout;
  var floor=new THREE.Mesh(new THREE.PlaneGeometry(L+.9,W+.9),mat.floor);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;t.world.add(floor);
  put(t.world,softBox(L,H,.07,mat.wall),0,H/2,-W/2-.035);put(t.world,softBox(.07,H,W,mat.wall),L/2+.035,H/2,0);put(t.world,softBox(L,.05,W,mat.ceiling),0,H+.025,0);
  put(t.world,softBox(L,.075,.025,mat.dark),0,.075,-W/2+.02);put(t.world,softBox(.025,.075,W,mat.dark),L/2-.02,.075,0);
  var winW=Math.min(1.55,L*.28);put(t.world,softBox(winW,1.08,.025,mat.glass),L*.18,1.70,-W/2+.018);put(t.world,softBox(winW+.08,.035,.06,mat.dark),L*.18,1.14,-W/2+.04);put(t.world,softBox(winW+.08,.035,.06,mat.dark),L*.18,2.26,-W/2+.04);put(t.world,softBox(.035,1.14,.06,mat.dark),L*.18-winW/2-.04,1.70,-W/2+.04);put(t.world,softBox(.035,1.14,.06,mat.dark),L*.18+winW/2+.04,1.70,-W/2+.04);
  var types=[];if(state.appliances.dishwasher)types.push("dishwasher");types.push("sink");if(state.appliances.hob)types.push("hob");types.push("drawers","doors");var len=Math.min(L-.70,types.length*.62),start=-len/2+.31,z=-W/2+.34,sinkX=null,hobX=null;
  types.forEach(function(tp,i){var x=start+i*.62;put(t.world,baseUnit(mat,tp,.6),x,.12,z);if(tp==="sink")sinkX=x;if(tp==="hob")hobX=x});put(t.world,softBox(len+.08,.055,.69,mat.stone),0,.97,z);put(t.world,softBox(len+.03,.09,.46,mat.dark),0,.065,z+.02);put(t.world,softBox(len+.02,.62,.025,mat.stone),0,1.30,-W/2+.013);
  if(sinkX!==null)put(t.world,sinkSet(mat),sinkX,1.01,z);if(hobX!==null){put(t.world,hobSet(mat),hobX,1.012,z);if(state.appliances.hood)put(t.world,hoodSet(mat),hobX,1.90,z+.08)}
  var tower=-L/2+.34;if(state.storage.tall||state.storage.pantry){put(t.world,tallUnit(mat,"pantry"),tower,.12,z);tower+=.69}if(state.appliances.fridge){put(t.world,tallUnit(mat,"fridge"),tower,.12,z);tower+=.69}if(state.appliances.oven){put(t.world,tallUnit(mat,"oven"),tower,.12,z)}
  var wc=Math.max(2,Math.min(6,Math.floor(len/.72)));for(var j=0;j<wc;j++){var glass=state.visual.upper==="glass"||(state.visual.upper==="mixed"&&j%3===1);put(t.world,wallUnit(mat,.68,glass),-len/2+.38+j*.72,1.57,z-.11)}
  put(t.world,softBox(len-.08,.018,.03,mat.led),0,1.51,z+.11);
  if(layout==="l"||layout==="u")buildSideRun(t,mat,L,W,1);if(layout==="u")buildSideRun(t,mat,L,W,-1);if(layout==="parallel")buildParallel(t,mat,L,W);if(layout==="island"||state.details.island)buildIsland(t,mat);
  var art=new THREE.Group();put(art,softBox(.62,.86,.03,mat.wood),-L*.28,1.65,-W/2+.055);put(art,softBox(.52,.72,.014,mat.wall),-L*.28,1.65,-W/2+.075);t.world.add(art);
  var scale=Math.max(L,W);t.target.set(0,1.05,-.28);if(!t.interactive)t.camGoal.set(L*.70,Math.min(3.1,H*.94),W*.84);else if(t.camGoal.length()<2)t.camGoal.set(L*.64,3.0,W*.78);t.setOrbit(.68,Math.max(6.5,scale*1.55));
}
function cameraPreset(t,name){
  if(!t)return;var L=Math.max(2.6,state.room.length/100),W=Math.max(2.4,state.room.width/100),c=t.camGoal,tar=t.target;
  if(name==="hero"){c.set(L*.64,3.0,W*.78);tar.set(0,1.03,-.32)}else if(name==="functional"){c.set(0,2.55,W*.92);tar.set(0,.98,-W*.25)}else if(name==="front"){c.set(0,1.65,W*.95);tar.set(0,1.25,-W*.38)}else if(name==="island"){c.set(-L*.42,2.25,W*.60);tar.set(.18,.96,.08)}else if(name==="wide"){c.set(L*.72,3.85,W*.92);tar.set(0,1.0,0)}
}
function initHero(){if(runtime.hero)return;runtime.hero=createTwin(document.getElementById("heroTwin"),document.getElementById("heroWrap"),false);if(runtime.hero){rebuildTwin(runtime.hero);cameraPreset(runtime.hero,"hero")}}
function initStudio(){if(runtime.studio)return;runtime.studio=createTwin(document.getElementById("studioTwin"),document.getElementById("studioWrap"),true);if(runtime.studio){rebuildTwin(runtime.studio);cameraPreset(runtime.studio,"hero")}}
root.innerHTML=appHtml();bind();hydrate();updateUI();initHero();
})();