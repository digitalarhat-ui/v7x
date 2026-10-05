(function(){
"use strict";
var cfg=window.KITCHEN_V5_CONFIG,root=document.getElementById("dakhakhniV5");if(!cfg||!root)return;
var STORAGE="dakhakhni:v5:project";
var layoutLabels={straight:"مستقيم",l:"حرف L",u:"حرف U",parallel:"متوازي",island:"جزيرة",unsure:"غير متأكد"};
var projectLabels={new:"مطبخ جديد",renovation:"تجديد مطبخ قائم",explore:"استكشاف أولي"};
var cabinetLabels={ivory:"عاجي مطفي",oak:"بلوط دافئ",walnut:"جوز داكن",sage:"أخضر هادئ",graphite:"فحمي",white:"أبيض ناعم"};
var worktopLabels={quartz:"كوارتز فاتح",veined:"حجر فاتح بعروق",warm:"حجر دافئ",dark:"حجر داكن"};
var storageLabels={pantry:"مؤن",tall:"خزائن طويلة",deepDrawers:"أدراج عميقة",corner:"حل للزاوية",waste:"وحدة نفايات",coffee:"ركن قهوة"};
var applianceLabels={fridge:"ثلاجة",oven:"فرن",dishwasher:"غسالة صحون",hob:"موقد",hood:"شفاط",microwave:"مايكرويف"};
var handleLabels={integrated:"مخفي / مدمج",linear:"خطي بسيط",classic:"مقبض ظاهر"};
var upperLabels={mixed:"مغلق + زجاج",closed:"مغلق",glass:"زجاج",open:"رفوف مفتوحة"};
var sinkLabels={existing:"حوض موجود",new:"حوض جديد",unsure:"غير متأكد"};
var followLabels={whatsapp:"واتساب",later:"أراجع المشروع أولاً"};
var markerLabels={door:"باب",window:"نافذة",column:"عمود",water:"مياه",drain:"صرف",electric:"كهرباء",vent:"تهوية"};
var wallLabels={north:"الجدار الرئيسي",east:"الجدار الأيمن",south:"الجدار المقابل",west:"الجدار الأيسر"};
var defaults={
 version:5,phase:1,maxPhase:1,
 project:{type:"",city:"",measurementMode:"",note:""},
 room:{length:420,width:320,height:280,layout:"",markers:[]},
 visual:{cabinet:"ivory",worktop:"veined",upper:"mixed",handle:"integrated",saved:false},
 details:{storage:{pantry:false,tall:false,deepDrawers:false,corner:false,waste:false,coffee:false},appliances:{fridge:false,oven:false,dishwasher:false,hob:false,hood:false,microwave:false},sink:"unsure",users:"",cooking:"",reviewed:false},
 review:{confirmed:false,followUp:"whatsapp"},
 contact:{name:""},
 meta:{createdAt:Date.now(),updatedAt:Date.now()}
};
var runtime={phase:1,maxPhase:1,refFile:null,refData:"",hero:null,studio:null,assetCache:{},assetWait:{},hdr:null,hdrLoading:false,hdrWait:[],suspendHistory:false};
function clone(v){return JSON.parse(JSON.stringify(v))}
function merge(a,b){if(!b||typeof b!=="object")return a;Object.keys(b).forEach(function(k){if(b[k]&&typeof b[k]==="object"&&!Array.isArray(b[k])){if(!a[k]||typeof a[k]!=="object")a[k]={};merge(a[k],b[k])}else a[k]=b[k]});return a}
function safe(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c]})}
function encodeState(v){try{return btoa(unescape(encodeURIComponent(JSON.stringify(v)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}catch(e){return""}}
function decodeState(v){try{var s=v.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return JSON.parse(decodeURIComponent(escape(atob(s))))}catch(e){return null}}
var state=clone(defaults);
(function restore(){
 var q=new URLSearchParams(location.search),p=q.get("project"),loaded=p?decodeState(p):null;
 if(!loaded){try{loaded=JSON.parse(localStorage.getItem(STORAGE)||"null")}catch(e){}}
 if(loaded)merge(state,loaded);
 state.phase=Math.max(1,Math.min(5,Number(state.phase)||1));state.maxPhase=Math.max(state.phase,Math.min(5,Number(state.maxPhase)||1));
 var hm=location.hash.match(/^#phase-(\d)$/);if(hm)state.phase=Math.max(1,Math.min(state.maxPhase,Number(hm[1])));
 runtime.phase=state.phase;runtime.maxPhase=state.maxPhase;
 if(p){history.replaceState({phase:state.phase},"",location.pathname+"#phase-"+state.phase);runtime.suspendHistory=true}
})();
function save(){state.phase=runtime.phase;state.maxPhase=runtime.maxPhase;state.meta.updatedAt=Date.now();try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch(e){}}
function emit(n,d){try{dispatchEvent(new CustomEvent("dakhakhni-v5:"+n,{detail:d||{}}))}catch(e){}}
function toast(msg){var e=document.getElementById("toast");if(!e)return;e.textContent=msg;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(function(){e.classList.remove("show")},1700)}
function activeKeys(o){return Object.keys(o).filter(function(k){return !!o[k]})}
function assetUrl(url){
 var base=window.DAKH_ASSET_BASE||"";
 if(base&&url&&url.charAt(0)==="/")return base.replace(/\/$/,"")+url;
 return url
}
function projectCode(){var raw=JSON.stringify([state.project,state.room,state.visual,state.details]),h=2166136261;for(var i=0;i<raw.length;i++){h^=raw.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24)}return"DK-"+((h>>>0).toString(36).toUpperCase()+"000000").slice(0,6)}
function knownMeasurements(){return state.project.measurementMode==="known"}
function roomText(){return knownMeasurements()?state.room.length+" × "+state.room.width+" × "+state.room.height+" سم":"القياسات غير متوفرة حالياً"}
function effectiveLayout(){return state.room.layout&&state.room.layout!=="unsure"?state.room.layout:"l"}
function effectiveRoom(){return{length:knownMeasurements()?state.room.length:420,width:knownMeasurements()?state.room.width:320,height:knownMeasurements()?state.room.height:280}}
function effectiveLabel(){return state.room.layout?layoutLabels[state.room.layout]:"لم يتم الاختيار بعد"}
function summaryVisual(){return cabinetLabels[state.visual.cabinet]+" · "+worktopLabels[state.visual.worktop]+" · "+upperLabels[state.visual.upper]}
function layoutSketch(type){
 var t=type==="unsure"?"question":type;
 if(t==="question")return'<svg viewBox="0 0 160 108" aria-hidden="true"><rect x="5" y="5" width="150" height="98" rx="8" fill="#f7f3eb" stroke="#c9c0b0"/><text x="80" y="68" text-anchor="middle" font-size="42" fill="#a99065">?</text></svg>';
 var shapes={straight:'<rect x="24" y="62" width="112" height="16" rx="2"/>',l:'<rect x="24" y="62" width="112" height="16" rx="2"/><rect x="24" y="25" width="16" height="53" rx="2"/>',u:'<rect x="24" y="62" width="112" height="16" rx="2"/><rect x="24" y="25" width="16" height="53" rx="2"/><rect x="120" y="25" width="16" height="53" rx="2"/>',parallel:'<rect x="24" y="26" width="112" height="16" rx="2"/><rect x="24" y="66" width="112" height="16" rx="2"/>',island:'<rect x="24" y="26" width="112" height="16" rx="2"/><rect x="24" y="65" width="40" height="15" rx="2"/><rect x="96" y="65" width="40" height="15" rx="2"/><rect x="62" y="53" width="36" height="20" rx="3" fill="#a99065"/>'};
 return'<svg viewBox="0 0 160 108" aria-hidden="true"><rect x="5" y="5" width="150" height="98" rx="8" fill="#f7f3eb" stroke="#c9c0b0"/><g fill="#143c32">'+(shapes[t]||shapes.straight)+'</g><path d="M24 88H136M24 84V92M136 84V92" stroke="#a99065" fill="none"/></svg>';
}
function choice(label,key,on,attr){return'<button class="choice '+(on?"active":"")+'" type="button" data-'+attr+'="'+key+'">'+safe(label)+'</button>'}
function toggle(label,key,on,attr){return'<button class="toggle '+(on?"active":"")+'" type="button" data-'+attr+'="'+key+'">'+safe(label)+'</button>'}
function swatch(key,color,type){return'<button class="swatch '+((type==="cabinet"?state.visual.cabinet:state.visual.worktop)===key?"active":"")+'" type="button" data-'+type+'="'+key+'" aria-label="'+safe((type==="cabinet"?cabinetLabels:worktopLabels)[key])+'"><i style="--sw:'+color+'"></i></button>'}
function page(){
 var phases=["المساحة والتخطيط","الشكل واللون","الخزائن والتفاصيل","المراجعة والخطوة التالية","التواصل والمراجعة"];
 return'<header class="topbar"><div class="shell nav"><div class="brand"><div class="brandMark">AD</div><div class="brandText"><b>'+safe(cfg.brand)+'</b><small>'+safe(cfg.legalName)+'</small></div></div><button class="topCta" id="headerStart">ابدأ مشروعك</button></div></header>'+
 '<section class="hero"><div class="shell heroGrid"><div><div class="eyebrow">'+safe(cfg.labels.heroEyebrow)+'</div><h1>'+safe(cfg.labels.heroTitle).replace(/\n/g,"<br>")+'</h1><p class="heroLead">'+safe(cfg.labels.heroBody)+'</p><div class="heroBenefits"><div><small>01</small><b>المساحة قبل الألوان</b></div><div><small>02</small><b>تصور 3D تفاعلي</b></div><div><small>03</small><b>ملخص واحد للمصمم</b></div></div><div class="heroActions"><button class="btnPrimary" id="heroStart">ابدأ من مساحتك ←</button><button class="btnSecondary" id="hero3d">شاهد 3D الآن</button></div><p class="heroTruth">'+safe(cfg.disclaimers.visual)+'</p></div>'+
 '<div class="heroVisual" id="heroWrap"><canvas id="heroCanvas"></canvas><div class="heroVisualTop"><span>تصور مبدئي ثلاثي الأبعاد</span><b>يتغير مع اختيارات المشروع</b></div><div class="heroState"><span id="heroLayout">نموذج توضيحي</span><span id="heroDims">المقاسات بعد إدخالها</span><span id="heroFinish">'+safe(cabinetLabels[state.visual.cabinet])+'</span></div></div></div></section>'+
 '<section class="truthStrip"><div class="shell truthGrid"><article><small>حسب الطلب</small><b>مطابخ وخزائن مخصصة</b><p>ابدأ من مساحة مشروعك واحتياجاتك الفعلية.</p></article><article><small>قبل التنفيذ</small><b>تصور 3D مبدئي</b><p>شاهد الاتجاه أولاً ثم اعتمد التفاصيل مع المصمم.</p></article><article><small>داخل مشروع واحد</small><b>المساحة + الخزائن + الأجهزة</b><p>اختياراتك تبقى محفوظة في نفس الرحلة.</p></article><article><small>في النهاية</small><b>مراجعة مباشرة مع فريق التصميم</b><p>ملخص واحد واضح قبل فتح واتساب دخاخني.</p></article></div></section>'+
 '<section class="journey" id="journey"><div class="shell"><div class="journeyHead"><div><div class="eyebrow" style="color:#92713e">مسار واحد · خمس مراحل</div><h2>من أول فكرة إلى مشروع أوضح.</h2></div><p>كل مرحلة تضيف معلومة يحتاجها المشروع فعلاً، ويمكنك الرجوع لأي مرحلة وتعديلها قبل فتح واتساب ومراجعة الطلب مع فريق التصميم.</p></div><ol class="journeyList">'+phases.map(function(p,i){var d=["نوع المشروع، المدينة، شكل المساحة وحالة القياسات.","معاينة 3D ثم اتجاه الواجهات وسطح العمل.","الخزائن والأجهزة وبعض التفاصيل التي تغيّر التصميم.","ما أصبح واضحاً وما يحتاج تأكيداً من فريق التصميم.","مراجعة المجموعات، تعديل أي مرحلة، ثم واتساب منظم."][i];return'<li><span>0'+(i+1)+'</span><b>'+p+'</b><p>'+d+'</p></li>'}).join("")+'</ol></div></section>'+
 '<main class="planner" id="planner"><div class="shell"><div class="phaseProgress" id="phaseProgress"><div class="phaseProgressTop"><span>المرحلة <b id="phaseNumber">1</b> من 5</span><strong id="phaseTitle">'+phases[0]+'</strong></div><ol>'+phases.map(function(p,i){return'<li data-phase="'+(i+1)+'"><button type="button" data-jump="'+(i+1)+'"><span>'+(i+1)+'</span><b>'+p+'</b></button></li>'}).join("")+'</ol></div>'+
 stage1()+stage2()+stage3()+stage4()+stage5()+'</div></main>'+
 '<div class="bottomNav"><div class="shell bottomInner"><button class="backBtn" id="backBtn">السابق</button><div class="progressText" id="progressText">المرحلة 1 من 5</div><button class="nextBtn" id="nextBtn">التالي: الشكل واللون</button></div></div>'+
 '<footer class="footer"><div class="shell"><b>'+safe(cfg.brand)+'</b> — '+safe(cfg.disclaimers.visual)+' '+safe(cfg.disclaimers.materials)+'</div></footer><div class="toast" id="toast"></div>';
}
function stage1(){
 var layouts=["straight","l","u","parallel","island","unsure"],notes={straight:"جدار واحد",l:"جداران متصلان",u:"ثلاثة جوانب",parallel:"صفّان متقابلان",island:"جزيرة أو شبه جزيرة",unsure:"يحدده المصمم لاحقاً"};
 return'<section class="stage" data-stage="1"><div class="stageHead"><div><div class="stageEyebrow">01 — المساحة والتخطيط</div><h2>ابدأ بما تعرفه عن المساحة.</h2></div><p>نبدأ بنوع المشروع والموقع والشكل أولاً، ثم القياسات إن كانت متوفرة. إذا لم تكن لديك قياسات، تستطيع المتابعة من دون اختراع أرقام.</p></div><div class="paper">'+
 '<div class="section"><div class="sectionTitle"><b>نوع المشروع</b><span>يساعد المصمم على فهم نقطة البداية.</span></div><div class="choiceGrid">'+choice(projectLabels.new,"new",state.project.type==="new","projecttype")+choice(projectLabels.renovation,"renovation",state.project.type==="renovation","projecttype")+choice(projectLabels.explore,"explore",state.project.type==="explore","projecttype")+'</div><div class="error" id="errProject"></div></div>'+
 '<div class="section"><div class="sectionTitle"><b>المدينة / الحي</b><span>معلومة عملية عند مراجعة المشروع.</span></div><div class="field"><label>الموقع</label><input id="city" value="'+safe(state.project.city)+'" placeholder="مثال: ينبع — حي ..."></div><div class="error" id="errCity"></div></div>'+
 '<div class="section"><div class="sectionTitle"><b>شكل المطبخ الأقرب</b><span>إذا لم تكن متأكداً اختر «غير متأكد»؛ لا نخمّن بدلاً عنك.</span></div><div class="layoutGrid">'+layouts.map(function(k){return'<button class="layoutChoice '+(state.room.layout===k?"active":"")+'" type="button" data-layout="'+k+'">'+layoutSketch(k)+'<b>'+layoutLabels[k]+'</b><small>'+notes[k]+'</small></button>'}).join("")+'</div><div class="error" id="errLayout"></div></div>'+
 '<div class="section"><div class="sectionTitle"><b>هل لديك قياسات تقريبية الآن؟</b><span>'+safe(cfg.disclaimers.measurement)+'</span></div><div class="choiceGrid"><button class="choice '+(state.project.measurementMode==="known"?"active":"")+'" type="button" data-measuremode="known">نعم، لدي قياسات تقريبية</button><button class="choice '+(state.project.measurementMode==="unknown"?"active":"")+'" type="button" data-measuremode="unknown">لا، أحتاج قياساً لاحقاً</button></div><div class="error" id="errMeasureMode"></div><div id="measurementPanel">'+measurementFields()+'</div></div>'+
 '<div class="section" id="markersSection"><div class="sectionTitle"><b>فتحات ونقاط مهمة <small style="font-weight:500;color:#8b8377">اختياري</small></b><span>أضف ما تعرفه فقط؛ النافذة أو نقطة المياه تؤثر في التصور.</span></div><div class="choiceGrid">'+Object.keys(markerLabels).map(function(k){return'<button class="choice" type="button" data-addmarker="'+k+'">+ '+markerLabels[k]+'</button>'}).join("")+'</div><div id="markerList" style="display:grid;gap:8px;margin-top:12px"></div></div>'+
 '</div></section>';
}
function measurementFields(){
 if(state.project.measurementMode==="unknown")return'<div class="notice" style="margin-top:12px">ممتاز — سنستخدم نموذجاً توضيحياً في المعاينة، لكن ملخصك سيبقى واضحاً بأن القياسات غير متوفرة حالياً.</div>';
 if(state.project.measurementMode!=="known")return"";
 return'<div class="fieldGrid" style="margin-top:12px"><div class="field"><label>الطول التقريبي</label><input id="roomLength" type="number" min="200" max="1200" step="5" value="'+state.room.length+'"></div><div class="field"><label>العرض التقريبي</label><input id="roomWidth" type="number" min="180" max="1000" step="5" value="'+state.room.width+'"></div><div class="field"><label>ارتفاع السقف</label><input id="roomHeight" type="number" min="220" max="450" step="5" value="'+state.room.height+'"></div></div><div class="error" id="errDims"></div>';
}
function stage2(){
 return'<section class="stage" data-stage="2"><div class="stageHead"><div><div class="stageEyebrow">02 — الشكل واللون</div><h2>شاهد الاتجاه قبل أن تشرحه.</h2></div><p>هنا 3D هو أداة قرار وانتباه، وليس ادعاء تصميم نهائي. التكوين يتبع الشكل والمقاسات التي أدخلتها، أو يستخدم نموذجاً توضيحياً واضحاً إذا لم تتوفر القياسات.</p></div>'+
 '<div class="studio"><div class="studioHead"><div><small>المعاينة التفاعلية</small><h3>تصور مبدئي لمشروعك</h3></div><button class="saveVisual '+(state.visual.saved?"saved":"")+'" id="saveVisual">'+(state.visual.saved?"تم حفظ الاتجاه ✓":"استخدم هذا الاتجاه في طلبي")+'</button></div><div class="cameraBar"><button class="active" data-camera="hero">منظور رئيسي</button><button data-camera="functional">منظور وظيفي</button><button data-camera="elevation">واجهة أمامية</button><button data-camera="island">الجزيرة</button><button data-camera="wide">المشهد الكامل</button></div><div class="viewer" id="studioWrap"><canvas id="studioCanvas"></canvas><div class="viewerLabel" id="viewerLabel">نموذج توضيحي</div><div class="viewerDisclaimer">'+safe(cfg.disclaimers.visual)+' '+safe(cfg.disclaimers.materials)+'</div></div><div class="finishBar"><div class="finishGroup"><b>اتجاه واجهات الخزائن</b><div class="swatches">'+swatch("ivory","#d9d1c4","cabinet")+swatch("oak","#a47d56","cabinet")+swatch("walnut","#594033","cabinet")+swatch("sage","#79877a","cabinet")+swatch("graphite","#3b3f3b","cabinet")+swatch("white","#efeee8","cabinet")+'</div></div><div class="finishGroup"><b>اتجاه سطح العمل</b><div class="swatches">'+swatch("quartz","#e4e0d7","worktop")+swatch("veined","#ece8df","worktop")+swatch("warm","#aa9c87","worktop")+swatch("dark","#4d4c48","worktop")+'</div></div></div></div>'+
 '<div class="paper" style="margin-top:18px"><div class="section"><div class="sectionTitle"><b>الخزائن العلوية</b><span>اتجاه بصري أولي فقط.</span></div><div class="choiceGrid">'+Object.keys(upperLabels).map(function(k){return choice(upperLabels[k],k,state.visual.upper===k,"upper")}).join("")+'</div></div><div class="section"><div class="sectionTitle"><b>اتجاه المقابض</b><span>يمكن تغيير هذا لاحقاً مع المصمم.</span></div><div class="choiceGrid">'+Object.keys(handleLabels).map(function(k){return choice(handleLabels[k],k,state.visual.handle===k,"handle")}).join("")+'</div></div><div class="error" id="errVisual"></div></div></section>';
}
function stage3(){
 return'<section class="stage" data-stage="3"><div class="stageHead"><div><div class="stageEyebrow">03 — الخزائن والتفاصيل</div><h2>أضف ما يغيّر استخدام المطبخ فعلاً.</h2></div><p>التفاصيل الوظيفية تظهر تدريجياً بدل نموذج طويل. نلتقط فقط ما يساعد المصمم على فهم الاستخدام قبل أن يبدأ.</p></div><div class="paper">'+
 '<div class="section"><div class="sectionTitle"><b>التخزين المطلوب</b><span>اختياري — اختر المهم فقط.</span></div><div class="toggleGrid">'+Object.keys(storageLabels).map(function(k){return toggle(storageLabels[k],k,state.details.storage[k],"storage")}).join("")+'</div></div>'+
 '<div class="section"><div class="sectionTitle"><b>الأجهزة المخطط لها</b><span>يؤثر وجودها على الوحدات والمساحات.</span></div><div class="toggleGrid">'+Object.keys(applianceLabels).map(function(k){return toggle(applianceLabels[k],k,state.details.appliances[k],"appliance")}).join("")+'</div></div>'+
 '<div class="section"><div class="sectionTitle"><b>طريقة الاستخدام</b><span>تُذكر في الملخص وليست التزاماً تنفيذياً.</span></div><div class="fieldGrid"><div class="field"><label>عدد المستخدمين</label><select id="users"><option value="">غير محدد</option><option>1-2</option><option>3-4</option><option>5+</option></select></div><div class="field"><label>كثافة الطبخ</label><select id="cooking"><option value="">غير محدد</option><option value="light">خفيف</option><option value="daily">يومي</option><option value="heavy">مكثف</option></select></div><div class="field"><label>الحوض</label><select id="sinkMode"><option value="unsure">غير متأكد</option><option value="existing">حوض موجود</option><option value="new">حوض جديد</option></select></div></div></div>'+
 '<div class="section"><div class="sectionTitle"><b>مرجع للمصمم <small style="font-weight:500;color:#8b8377">اختياري</small></b><span>يبقى الملف على جهازك؛ لا نرفعه في الخلفية. إذا أرسلته عبر واتساب فأرفقه يدوياً.</span></div><div class="refUpload"><input id="refFile" type="file" accept="image/jpeg,image/png,image/webp,application/pdf"><label for="refFile">اختر صورة أو PDF للمساحة / المخطط</label><small>JPG · PNG · WEBP · PDF</small><div id="filePreview"></div></div></div>'+
 '<div class="section"><button class="btnPrimary" style="background:#143c32;color:#fff;width:100%" id="detailsReviewed">'+(state.details.reviewed?"تمت مراجعة التفاصيل ✓":"تمت مراجعة التفاصيل — متابعة")+'</button><div class="error" id="errDetails"></div></div></div></section>';
}
function stage4(){
 return'<section class="stage" data-stage="4"><div class="stageHead"><div><div class="stageEyebrow">04 — المراجعة والخطوة التالية</div><h2>ما أصبح واضحاً، وما يحتاج فريق التصميم.</h2></div><p>إذا لم يوجد أساس موثّق للحساب فلا نظهر سعراً. هذه المرحلة تجهز المشروع للمراجعة البشرية بدلاً من اختراع تقدير.</p></div><div class="readiness"><div class="readinessTop"><div><small>جاهزية الملخص</small><b id="readinessText"></b></div><b id="readinessCode">'+projectCode()+'</b></div><div class="meter"><i id="readinessBar"></i></div></div><div class="reviewGrid"><article class="reviewBlock"><small>أصبح معروفاً</small><h3>سيصل مع طلبك</h3><ul id="knownList"></ul></article><article class="reviewBlock"><small>يحتاج تأكيداً</small><h3>يعتمده فريق دخاخني</h3><ul id="confirmList"></ul></article></div><div class="paper" style="margin-top:18px"><div class="section"><div class="sectionTitle"><b>الخطوة التالية</b><span>المسار المتاح هنا هو واتساب دخاخني الموثق.</span></div><div class="choiceGrid">'+choice(followLabels.whatsapp,"whatsapp",state.review.followUp==="whatsapp","follow")+choice(followLabels.later,"later",state.review.followUp==="later","follow")+'</div></div><div class="section"><button class="btnPrimary" style="background:#143c32;color:#fff;width:100%" id="reviewConfirmed">'+(state.review.confirmed?"تمت المراجعة ✓":"راجعت المشروع — متابعة للتواصل")+'</button><div class="error" id="errReview"></div></div></div></section>';
}
function stage5(){
 return'<section class="stage" data-stage="5"><div class="stageHead"><div><div class="stageEyebrow">05 — التواصل والمراجعة</div><h2>راجع كل مجموعة قبل فتح واتساب.</h2></div><p>المراجعة النهائية مجمعة، وكل قسم يمكن الرجوع إليه وتعديله. الرسالة لا تُرسل تلقائياً؛ أنت تراها أولاً ثم تفتح واتساب.</p></div><div class="finalGrid"><div><div class="paper"><div class="section"><div class="sectionTitle"><b>اسم العميل <small style="font-weight:500;color:#8b8377">اختياري</small></b><span>لا نطلب رقم جوال لأن المتابعة ستتم من حساب واتساب نفسه.</span></div><div class="field"><label>الاسم</label><input id="customerName" value="'+safe(state.contact.name)+'" placeholder="الاسم"></div></div><div class="section"><div class="sectionTitle"><b>ملاحظة أخيرة <small style="font-weight:500;color:#8b8377">اختياري</small></b><span>شيء واحد تريد أن يعرفه المصمم من البداية.</span></div><div class="field"><textarea id="projectNote" placeholder="مثال: أولوية للتخزين أو سطح تحضير أكبر">'+safe(state.project.note)+'</textarea></div></div></div><div class="summaryPaper" style="margin-top:18px"><div class="summaryTop"><div><small>ملخص المشروع</small><h3>جاهز للمراجعة مع المصمم</h3></div><div class="projectCode">'+projectCode()+'</div></div><div class="summaryGroups" id="summaryGroups"></div></div></div><aside class="whatsappPanel"><div><small>المعاينة قبل الإرسال</small><h3>رسالة واتساب منظمة</h3><p>تتحدث عن مشروعك فقط، ولا تتضمن سعراً مخترعاً أو ادعاء اعتماد نهائي.</p></div><pre class="waPreview" id="waPreview"></pre><a class="waButton" id="waButton" target="_blank" rel="noopener">فتح واتساب دخاخني ←</a><button class="shareButton" id="shareProject">نسخ رابط المشروع</button><a class="officialLink" href="'+safe(cfg.officialSite)+'" target="_blank" rel="noopener">الموقع الرسمي لدخاخني ↗</a></aside></div></section>';
}
function validatePhase(n,show){
 var errors=[];
 if(n===1){if(!state.project.type)errors.push(["errProject","اختر نوع المشروع."]);if(!state.project.city.trim())errors.push(["errCity","اكتب المدينة أو الحي."]);if(!state.room.layout)errors.push(["errLayout","اختر شكل المطبخ أو «غير متأكد»."]);if(!state.project.measurementMode)errors.push(["errMeasureMode","حدد هل القياسات متوفرة الآن."]);if(state.project.measurementMode==="known"){if(!(state.room.length>=200&&state.room.length<=1200&&state.room.width>=180&&state.room.width<=1000&&state.room.height>=220&&state.room.height<=450))errors.push(["errDims","راجع الأبعاد التقريبية المدخلة."])}}
 if(n===2&&!state.visual.saved)errors.push(["errVisual","احفظ اتجاهاً بصرياً واحداً قبل المتابعة."]);
 if(n===3&&!state.details.reviewed)errors.push(["errDetails","راجع التفاصيل ثم اضغط زر المتابعة."]);
 if(n===4&&!state.review.confirmed)errors.push(["errReview","راجع ما هو معروف وما يحتاج تأكيداً ثم تابع."]);
 if(show){["errProject","errCity","errLayout","errMeasureMode","errDims","errVisual","errDetails","errReview"].forEach(function(id){var e=document.getElementById(id);if(e)e.textContent=""});errors.forEach(function(x){var e=document.getElementById(x[0]);if(e)e.textContent=x[1]});if(errors.length){var first=document.getElementById(errors[0][0]);if(first)first.scrollIntoView({behavior:"smooth",block:"center"})}}
 return errors.length===0;
}
function goPhase(n,mode){
 n=Math.max(1,Math.min(5,n));if(n>runtime.maxPhase)return;runtime.phase=n;state.phase=n;save();renderDynamic();
 if(!runtime.suspendHistory){var method=mode==="replace"?"replaceState":"pushState";history[method]({phase:n},"",location.pathname+"#phase-"+n)}runtime.suspendHistory=false;
 if(n===2){initStudio();setTimeout(function(){rebuildAll3D();cameraPreset(runtime.studio,"hero")},50)}
 document.getElementById("phaseProgress").scrollIntoView({behavior:"smooth",block:"start"});emit("phase",{phase:n,code:projectCode()});
}
function nextPhase(){if(!validatePhase(runtime.phase,true))return;if(runtime.phase<5){runtime.maxPhase=Math.max(runtime.maxPhase,runtime.phase+1);state.maxPhase=runtime.maxPhase;save();goPhase(runtime.phase+1)}else{save();toast("تم حفظ المشروع على هذا الجهاز")}}
function previousPhase(){if(runtime.phase>1)goPhase(runtime.phase-1)}
function readiness(){
 var s=30;if(state.project.type)s+=8;if(state.project.city)s+=8;if(state.room.layout)s+=8;if(state.project.measurementMode)s+=8;if(knownMeasurements())s+=8;if(state.visual.saved)s+=12;if(state.details.reviewed)s+=8;if(activeKeys(state.details.storage).length)s+=4;if(activeKeys(state.details.appliances).length)s+=4;if(state.review.confirmed)s+=2;return Math.min(100,s);
}
function knownItems(){
 var a=[];if(state.project.type)a.push("نوع المشروع: "+projectLabels[state.project.type]);if(state.project.city)a.push("الموقع: "+state.project.city);if(state.room.layout)a.push("شكل المساحة: "+layoutLabels[state.room.layout]);a.push("القياسات: "+roomText());if(state.visual.saved)a.push("الاتجاه البصري: "+summaryVisual());var s=activeKeys(state.details.storage);if(s.length)a.push("التخزين: "+s.map(function(k){return storageLabels[k]}).join("، "));var ap=activeKeys(state.details.appliances);if(ap.length)a.push("الأجهزة: "+ap.map(function(k){return applianceLabels[k]}).join("، "));return a;
}
function confirmItems(){var a=["القياس الموقعي النهائي","الخامات والألوان من العينات المعتمدة","توزيع الكهرباء والمياه والأجهزة","تفاصيل التصنيع والإكسسوارات","عرض السعر النهائي"];if(!knownMeasurements())a.unshift("الأبعاد النهائية للمساحة");return a}
function whatsappSummary(){
 var rows=["طلب مطبخ مبدئي — دخاخني","رقم المشروع: "+projectCode(),"","نوع المشروع: "+(state.project.type?projectLabels[state.project.type]:"—"),"المدينة / الحي: "+(state.project.city||"—"),"شكل المطبخ: "+(state.room.layout?layoutLabels[state.room.layout]:"—"),"القياسات: "+roomText(),"الاتجاه البصري التجريبي: "+summaryVisual(),"المقابض: "+handleLabels[state.visual.handle],"الخزائن العلوية: "+upperLabels[state.visual.upper]];
 var st=activeKeys(state.details.storage),ap=activeKeys(state.details.appliances);rows.push("التخزين: "+(st.length?st.map(function(k){return storageLabels[k]}).join("، "):"غير محدد"));rows.push("الأجهزة: "+(ap.length?ap.map(function(k){return applianceLabels[k]}).join("، "):"غير محدد"));rows.push("الحوض: "+sinkLabels[state.details.sink]);if(state.details.users)rows.push("عدد المستخدمين: "+state.details.users);if(state.details.cooking)rows.push("استخدام الطبخ: "+({light:"خفيف",daily:"يومي",heavy:"مكثف"}[state.details.cooking]||state.details.cooking));if(runtime.refFile)rows.push("مرجع مختار على جهاز العميل: "+runtime.refFile.name+" — يرجى إرفاقه يدوياً في واتساب.");if(state.contact.name.trim())rows.push("الاسم: "+state.contact.name.trim());if(state.project.note.trim())rows.push("ملاحظة: "+state.project.note.trim());rows.push("","هذا ملخص تمهيدي للمناقشة مع المصمم، وليس مخطط تصنيع أو عرض سعر. القياس والخامات والاعتماد النهائي مع فريق دخاخني.");return rows.join("\n");
}
function whatsappUrl(){return"https://wa.me/"+cfg.whatsapp+"?text="+encodeURIComponent(whatsappSummary())}
function shareUrl(){var clean=clone(state);clean.phase=runtime.phase;clean.maxPhase=runtime.maxPhase;return location.origin+location.pathname+"?project="+encodeState(clean)+"#phase-"+runtime.phase}
function copyShare(){var u=shareUrl();if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(function(){toast("تم نسخ رابط المشروع")}).catch(function(){fallbackCopy(u)});else fallbackCopy(u)}
function fallbackCopy(u){var t=document.createElement("textarea");t.value=u;document.body.appendChild(t);t.select();try{document.execCommand("copy");toast("تم نسخ رابط المشروع")}catch(e){toast("تعذر النسخ")};t.remove()}
function markerRows(){
 var e=document.getElementById("markerList");if(!e)return;if(!state.room.markers.length){e.innerHTML='<div class="notice">لم تضف أي فتحات أو نقاط خدمات — وهذا طبيعي إذا لم تكن تعرفها الآن.</div>';return}
 e.innerHTML=state.room.markers.map(function(m){return'<div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;align-items:center;border:1px solid #d8d3c9;background:#fff;padding:9px"><b style="font-size:9px;color:#143c32">'+markerLabels[m.type]+'</b><select data-markerwall="'+m.id+'" style="border:1px solid #d8d3c9;padding:7px;font-size:9px">'+Object.keys(wallLabels).map(function(w){return'<option value="'+w+'" '+(m.wall===w?"selected":"")+'>'+wallLabels[w]+'</option>'}).join("")+'</select><input type="range" min="5" max="95" value="'+m.pos+'" data-markerpos="'+m.id+'"><button type="button" data-delmarker="'+m.id+'" style="border:0;background:#eee7dc;padding:7px 10px">×</button></div>'}).join("");
}
function summaryGroups(){
 var e=document.getElementById("summaryGroups");if(!e)return;var storage=activeKeys(state.details.storage).map(function(k){return storageLabels[k]}),apps=activeKeys(state.details.appliances).map(function(k){return applianceLabels[k]});
 var groups=[
  ["المساحة والتخطيط",1,[state.project.type?projectLabels[state.project.type]:"—",state.project.city||"—",state.room.layout?layoutLabels[state.room.layout]:"—",roomText()]],
  ["الشكل واللون",2,[summaryVisual(),"المقابض: "+handleLabels[state.visual.handle]]],
  ["الخزائن والتفاصيل",3,[(storage.length?storage.join("، "):"لم تُحدد احتياجات تخزين"),(apps.length?apps.join("، "):"لم تُحدد أجهزة"),"الحوض: "+sinkLabels[state.details.sink]]],
  ["المراجعة",4,["جاهزية الملخص: "+readiness()+"%","المتابعة: "+followLabels[state.review.followUp]]]
 ];
 e.innerHTML=groups.map(function(g){return'<div class="summaryGroup"><div class="summaryGroupHead"><h4>'+g[0]+'</h4><button type="button" data-editphase="'+g[1]+'">تعديل</button></div>'+g[2].map(function(x){return'<p>'+safe(x)+'</p>'}).join("")+'</div>'}).join("");
}
function renderDynamic(){
 save();
 document.querySelectorAll(".stage").forEach(function(e){e.classList.toggle("active",Number(e.dataset.stage)===runtime.phase)});
 var names=["المساحة والتخطيط","الشكل واللون","الخزائن والتفاصيل","المراجعة والخطوة التالية","التواصل والمراجعة"];
 document.getElementById("phaseNumber").textContent=runtime.phase;document.getElementById("phaseTitle").textContent=names[runtime.phase-1];document.getElementById("progressText").textContent="المرحلة "+runtime.phase+" من 5";
 document.querySelectorAll(".phaseProgress li").forEach(function(li,i){li.dataset.active=(i+1===runtime.phase)?"true":"false";li.dataset.complete=(i+1<runtime.phase)?"true":"false";var b=li.querySelector("button");b.disabled=i+1>runtime.maxPhase});
 var next=["التالي: الشكل واللون","التالي: الخزائن والتفاصيل","التالي: المراجعة","التالي: التواصل","حفظ المشروع"];document.getElementById("nextBtn").textContent=next[runtime.phase-1];document.getElementById("backBtn").disabled=runtime.phase===1;document.getElementById("backBtn").style.opacity=runtime.phase===1?".45":"1";
 var mm=document.getElementById("measurementPanel");if(mm)mm.innerHTML=measurementFields();markerRows();
 var users=document.getElementById("users"),cooking=document.getElementById("cooking"),sink=document.getElementById("sinkMode");if(users)users.value=state.details.users;if(cooking)cooking.value=state.details.cooking;if(sink)sink.value=state.details.sink;
 var vf=document.getElementById("viewerLabel");if(vf)vf.textContent=knownMeasurements()?roomText():"نموذج توضيحي — القياسات غير متوفرة";
 var sv=document.getElementById("saveVisual");if(sv){sv.textContent=state.visual.saved?"تم حفظ الاتجاه ✓":"استخدم هذا الاتجاه في طلبي";sv.classList.toggle("saved",state.visual.saved)}
 var rd=document.getElementById("detailsReviewed");if(rd)rd.textContent=state.details.reviewed?"تمت مراجعة التفاصيل ✓":"تمت مراجعة التفاصيل — متابعة";
 var rc=document.getElementById("reviewConfirmed");if(rc)rc.textContent=state.review.confirmed?"تمت المراجعة ✓":"راجعت المشروع — متابعة للتواصل";
 var r=readiness(),rb=document.getElementById("readinessBar"),rt=document.getElementById("readinessText");if(rb)rb.style.width=r+"%";if(rt)rt.textContent=r+"%";var rcod=document.getElementById("readinessCode");if(rcod)rcod.textContent=projectCode();
 var kl=document.getElementById("knownList"),cl=document.getElementById("confirmList");if(kl)kl.innerHTML=knownItems().map(function(x){return"<li>"+safe(x)+"</li>"}).join("");if(cl)cl.innerHTML=confirmItems().map(function(x){return"<li>"+safe(x)+"</li>"}).join("");
 summaryGroups();var wp=document.getElementById("waPreview"),wb=document.getElementById("waButton");if(wp)wp.textContent=whatsappSummary();if(wb)wb.href=whatsappUrl();
 var hl=document.getElementById("heroLayout"),hd=document.getElementById("heroDims"),hf=document.getElementById("heroFinish");if(hl)hl.textContent=state.room.layout?layoutLabels[state.room.layout]:"نموذج توضيحي";if(hd)hd.textContent=knownMeasurements()?state.room.length+" × "+state.room.width+" سم":"أدخل المقاسات أو تابع بدونها";if(hf)hf.textContent=cabinetLabels[state.visual.cabinet];
 if(runtime.hero)rebuildScene(runtime.hero);if(runtime.studio)rebuildScene(runtime.studio);
}
function handleFile(file){
 runtime.refFile=null;runtime.refData="";var box=document.getElementById("filePreview");if(!file){if(box)box.innerHTML="";return}
 var ok=/^(image\/jpeg|image\/png|image\/webp|application\/pdf)$/.test(file.type)&&file.size<=12*1024*1024;if(!ok){toast("الملف يجب أن يكون JPG / PNG / WEBP / PDF وبحجم حتى 12MB");var inp=document.getElementById("refFile");if(inp)inp.value="";return}
 runtime.refFile=file;if(file.type.indexOf("image/")===0){var r=new FileReader();r.onload=function(){runtime.refData=r.result;if(box)box.innerHTML='<div class="fileCard"><img src="'+r.result+'" alt=""><div><b>'+safe(file.name)+'</b><small>يبقى على جهازك — أرفقه يدوياً في واتساب</small></div></div>';renderDynamic()};r.readAsDataURL(file)}else if(box)box.innerHTML='<div class="fileCard"><div style="width:58px;height:58px;display:grid;place-items:center;background:#143c32;color:#fff;font-weight:900">PDF</div><div><b>'+safe(file.name)+'</b><small>يبقى على جهازك — أرفقه يدوياً في واتساب</small></div></div>';
}
function invalidateVisual(){state.visual.saved=false;state.review.confirmed=false;runtime.maxPhase=Math.min(runtime.maxPhase,runtime.phase<=1?1:2);state.maxPhase=runtime.maxPhase}
function invalidateDetails(){state.details.reviewed=false;state.review.confirmed=false;runtime.maxPhase=Math.min(runtime.maxPhase,3);state.maxPhase=runtime.maxPhase}
function bind(){
 root.addEventListener("click",function(ev){var t=ev.target.closest("button,a");if(!t)return;
  if(t.id==="headerStart"||t.id==="heroStart"){runtime.maxPhase=Math.max(runtime.maxPhase,1);goPhase(1);return}
  if(t.id==="hero3d"){if(validatePhase(1,false)){runtime.maxPhase=Math.max(runtime.maxPhase,2);goPhase(2)}else{goPhase(1);toast("ابدأ بالمساحة أولاً ثم تصل إلى 3D")};return}
  if(t.dataset.jump){var n=Number(t.dataset.jump);if(n<=runtime.maxPhase)goPhase(n);return}
  if(t.dataset.projecttype){state.project.type=t.dataset.projecttype;state.review.confirmed=false;document.querySelectorAll("[data-projecttype]").forEach(function(x){x.classList.toggle("active",x===t)});renderDynamic();return}
  if(t.dataset.layout){state.room.layout=t.dataset.layout;invalidateVisual();document.querySelectorAll("[data-layout]").forEach(function(x){x.classList.toggle("active",x===t)});renderDynamic();return}
  if(t.dataset.measuremode){state.project.measurementMode=t.dataset.measuremode;invalidateVisual();document.querySelectorAll("[data-measuremode]").forEach(function(x){x.classList.toggle("active",x===t)});renderDynamic();return}
  if(t.dataset.addmarker){state.room.markers.push({id:"m"+Date.now().toString(36),type:t.dataset.addmarker,wall:"north",pos:50});invalidateVisual();renderDynamic();return}
  if(t.dataset.delmarker){state.room.markers=state.room.markers.filter(function(m){return m.id!==t.dataset.delmarker});invalidateVisual();renderDynamic();return}
  if(t.dataset.cabinet){state.visual.cabinet=t.dataset.cabinet;invalidateVisual();document.querySelectorAll("[data-cabinet]").forEach(function(x){x.classList.toggle("active",x===t)});renderDynamic();return}
  if(t.dataset.worktop){state.visual.worktop=t.dataset.worktop;invalidateVisual();document.querySelectorAll("[data-worktop]").forEach(function(x){x.classList.toggle("active",x===t)});renderDynamic();return}
  if(t.dataset.upper){state.visual.upper=t.dataset.upper;invalidateVisual();document.querySelectorAll("[data-upper]").forEach(function(x){x.classList.toggle("active",x===t)});renderDynamic();return}
  if(t.dataset.handle){state.visual.handle=t.dataset.handle;invalidateVisual();document.querySelectorAll("[data-handle]").forEach(function(x){x.classList.toggle("active",x===t)});renderDynamic();return}
  if(t.id==="saveVisual"){state.visual.saved=true;runtime.maxPhase=Math.max(runtime.maxPhase,3);save();renderDynamic();toast("تم حفظ الاتجاه داخل المشروع");return}
  if(t.dataset.storage){var sk=t.dataset.storage;state.details.storage[sk]=!state.details.storage[sk];invalidateDetails();t.classList.toggle("active",state.details.storage[sk]);renderDynamic();return}
  if(t.dataset.appliance){var ak=t.dataset.appliance;state.details.appliances[ak]=!state.details.appliances[ak];invalidateDetails();t.classList.toggle("active",state.details.appliances[ak]);renderDynamic();return}
  if(t.id==="detailsReviewed"){state.details.reviewed=true;runtime.maxPhase=Math.max(runtime.maxPhase,4);save();renderDynamic();toast("تم حفظ تفاصيل المشروع");return}
  if(t.dataset.follow){state.review.followUp=t.dataset.follow;state.review.confirmed=false;runtime.maxPhase=Math.min(runtime.maxPhase,4);state.maxPhase=runtime.maxPhase;document.querySelectorAll("[data-follow]").forEach(function(x){x.classList.toggle("active",x===t)});renderDynamic();return}
  if(t.id==="reviewConfirmed"){state.review.confirmed=true;runtime.maxPhase=Math.max(runtime.maxPhase,5);save();renderDynamic();toast("تمت مراجعة المشروع");return}
  if(t.dataset.editphase){goPhase(Number(t.dataset.editphase));return}
  if(t.dataset.camera){cameraPreset(runtime.studio,t.dataset.camera);document.querySelectorAll("[data-camera]").forEach(function(x){x.classList.toggle("active",x===t)});return}
  if(t.id==="shareProject"){copyShare();return}
  if(t.id==="waButton"){
    var earliest=0;if(!validatePhase(1,false))earliest=1;else if(!state.visual.saved)earliest=2;else if(!state.details.reviewed)earliest=3;else if(!state.review.confirmed)earliest=4;
    if(earliest){ev.preventDefault();runtime.maxPhase=Math.max(runtime.maxPhase,earliest);state.maxPhase=runtime.maxPhase;goPhase(earliest);toast("راجع هذه المرحلة قبل فتح واتساب");return}
  }
 });
 root.addEventListener("input",function(ev){var e=ev.target,id=e.id;
  if(id==="city"){state.project.city=e.value.trim();state.review.confirmed=false}
  if(id==="roomLength"){state.room.length=Number(e.value)||state.room.length;invalidateVisual()}
  if(id==="roomWidth"){state.room.width=Number(e.value)||state.room.width;invalidateVisual()}
  if(id==="roomHeight"){state.room.height=Number(e.value)||state.room.height;invalidateVisual()}
  if(e.dataset.markerpos){var m=state.room.markers.find(function(x){return x.id===e.dataset.markerpos});if(m)m.pos=Number(e.value);invalidateVisual()}
  if(id==="customerName")state.contact.name=e.value;
  if(id==="projectNote")state.project.note=e.value;
  renderDynamic();
 });
 root.addEventListener("change",function(ev){var e=ev.target,id=e.id;
  if(e.dataset.markerwall){var m=state.room.markers.find(function(x){return x.id===e.dataset.markerwall});if(m)m.wall=e.value;invalidateVisual();renderDynamic();return}
  if(id==="users"){state.details.users=e.value;invalidateDetails()}
  if(id==="cooking"){state.details.cooking=e.value;invalidateDetails()}
  if(id==="sinkMode"){state.details.sink=e.value;invalidateDetails()}
  if(id==="refFile"){handleFile(e.files&&e.files[0]);return}
  renderDynamic();
 });
 document.getElementById("backBtn").addEventListener("click",previousPhase);document.getElementById("nextBtn").addEventListener("click",nextPhase);
 window.addEventListener("popstate",function(){var hm=location.hash.match(/^#phase-(\d)$/);if(hm){runtime.suspendHistory=true;goPhase(Math.min(runtime.maxPhase,Number(hm[1])),"replace")}});
}
function seededRand(seed){var x=Math.sin(seed*999.1)*43758.5453;return x-Math.floor(x)}
function canvasTexture(kind){
 var c=document.createElement("canvas"),x=c.getContext("2d");c.width=c.height=512;
 if(kind==="wood"){
  var walnut=state.visual.cabinet==="walnut",base=walnut?"#5e4336":"#b28762";x.fillStyle=base;x.fillRect(0,0,512,512);
  for(var i=0;i<190;i++){var y=seededRand(i)*512,amp=1.2+seededRand(i+20)*3.8;x.strokeStyle=walnut?"rgba(35,22,16,"+(0.035+seededRand(i+40)*.12)+")":"rgba(86,56,34,"+(0.028+seededRand(i+40)*.09)+")";x.lineWidth=.35+seededRand(i+60)*.9;x.beginPath();x.moveTo(0,y);for(var px=0;px<=512;px+=26)x.lineTo(px,y+Math.sin(px*.026+i)*amp);x.stroke()}
  for(var k=0;k<14;k++){x.strokeStyle="rgba(255,235,205,.055)";x.lineWidth=.8;x.beginPath();var yy=seededRand(k+160)*512;x.moveTo(0,yy);x.bezierCurveTo(140,yy+15,340,yy-12,512,yy+4);x.stroke()}
 }else if(kind==="stone"){
  var dark=state.visual.worktop==="dark",warm=state.visual.worktop==="warm";x.fillStyle=dark?"#4c4b48":warm?"#aaa08f":"#e9e5dd";x.fillRect(0,0,512,512);
  for(var j=0;j<22;j++){var sy=seededRand(j+300)*512;x.strokeStyle=dark?"rgba(232,230,220,"+(0.035+seededRand(j+330)*.10)+")":"rgba(88,82,75,"+(0.028+seededRand(j+330)*.10)+")";x.lineWidth=.35+seededRand(j+360)*1.05;x.beginPath();x.moveTo(-20,sy);for(var xx=0;xx<560;xx+=38){sy+=(seededRand(j*20+xx)-.5)*30;x.lineTo(xx,sy)}x.stroke()}
 }else if(kind==="floor"){
  x.fillStyle="#d2ccc2";x.fillRect(0,0,512,512);
  for(var q=0;q<180;q++){var a=.018+seededRand(q+500)*.028;x.fillStyle="rgba(90,82,73,"+a+")";x.fillRect(seededRand(q+600)*512,seededRand(q+700)*512,1+seededRand(q+800)*2,1+seededRand(q+900)*2)}
  x.strokeStyle="rgba(90,84,78,.055)";x.lineWidth=1;for(var n=0;n<=512;n+=256){x.beginPath();x.moveTo(n,0);x.lineTo(n,512);x.stroke();x.beginPath();x.moveTo(0,n);x.lineTo(512,n);x.stroke()}
 }
 var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;return t
}
function materials(){
 var wood=canvasTexture("wood"),stone=canvasTexture("stone"),floor=canvasTexture("floor");wood.repeat.set(2.4,1);stone.repeat.set(2.2,.75);floor.repeat.set(4,4);
 var woodMapped=state.visual.cabinet==="oak"||state.visual.cabinet==="walnut",cc=woodMapped?0xffffff:{ivory:0xd9d1c4,sage:0x788678,graphite:0x3a3e3a,white:0xf0eee9}[state.visual.cabinet]||0xd9d1c4;
 var darkStone=state.visual.worktop==="dark";
 return{cab:new THREE.MeshPhysicalMaterial({color:cc,roughness:state.visual.cabinet==="white"?.28:.36,metalness:0,clearcoat:.22,clearcoatRoughness:.30,map:(state.visual.cabinet==="oak"||state.visual.cabinet==="walnut")?wood:null,envMapIntensity:.75}),inside:new THREE.MeshStandardMaterial({color:0xcfcac1,roughness:.58}),stone:new THREE.MeshPhysicalMaterial({color:darkStone?0x55524e:0xffffff,map:stone,roughness:.24,clearcoat:.28,clearcoatRoughness:.23,envMapIntensity:.9}),chrome:new THREE.MeshStandardMaterial({color:0xaeb3b1,roughness:.17,metalness:.95,envMapIntensity:1.3}),black:new THREE.MeshPhysicalMaterial({color:0x101210,roughness:.18,metalness:.30,clearcoat:.75,clearcoatRoughness:.09}),glass:new THREE.MeshPhysicalMaterial({color:0xcdd9d8,roughness:.06,metalness:0,transparent:true,opacity:.24,clearcoat:1,envMapIntensity:1.1}),wall:new THREE.MeshStandardMaterial({color:0xe8e2d9,roughness:.92}),floor:new THREE.MeshPhysicalMaterial({color:0xffffff,map:floor,roughness:.68,envMapIntensity:.25}),plinth:new THREE.MeshStandardMaterial({color:0x1b1e1b,roughness:.42,metalness:.25}),wood:new THREE.MeshPhysicalMaterial({color:0xffffff,map:wood,roughness:.38,clearcoat:.08}),led:new THREE.MeshStandardMaterial({color:0xffe2ae,emissive:0xffc76a,emissiveIntensity:.85}),shadow:new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.13,depthWrite:false})}
}
function box(w,h,d,mat,bevel){
 var geo;if(bevel!==false&&Math.min(w,h,d)>.02&&w<2.8&&h<2.8&&d<2.8){var r=Math.max(.002,Math.min(.009,Math.min(w,h,d)*.15)),iw=Math.max(.004,w-2*r),ih=Math.max(.004,h-2*r),dep=Math.max(.004,d-2*r),sh=new THREE.Shape();sh.moveTo(-iw/2,-ih/2);sh.lineTo(iw/2,-ih/2);sh.lineTo(iw/2,ih/2);sh.lineTo(-iw/2,ih/2);sh.closePath();geo=new THREE.ExtrudeGeometry(sh,{depth:dep,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:r,bevelThickness:r,curveSegments:1});geo.translate(0,0,-dep/2);geo.computeVertexNormals()}else geo=new THREE.BoxGeometry(w,h,d);var m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;return m
}
function put(g,o,x,y,z,ry){o.position.set(x||0,y||0,z||0);if(ry)o.rotation.y=ry;g.add(o);return o}
function front(g,m,w,h,y,z){
 var gap=.006,fh=Math.max(.03,h-gap),fw=Math.max(.03,w-gap);
 put(g,box(fw,fh,.020,m.cab),0,y,z);
 if(state.visual.handle==="linear"){put(g,box(Math.max(.10,w*.38),.008,.010,m.chrome),0,y+h*.31,z+.018)}
 else if(state.visual.handle==="classic"){put(g,box(.009,Math.min(.14,h*.28),.012,m.chrome),w*.32,y,z+.019)}
 else{put(g,box(w-.055,.006,.008,m.plinth),0,y+h*.42,z+.016)}
}
function baseUnit(m,type,w){
 w=w||.6;var g=new THREE.Group(),p=.018,d=.58,h=.78;
 put(g,box(p,h,d,m.cab),-w/2+p/2,h/2,0);put(g,box(p,h,d,m.cab),w/2-p/2,h/2,0);
 put(g,box(w-p*2,p,d,m.inside),0,p/2,0);put(g,box(w-p*2,p,d,m.inside),0,h-p/2,0);
 put(g,box(w-p*2,h-p*2,.012,m.inside),0,h/2,-d/2+.006);put(g,box(w-.10,.085,.44,m.plinth),0,.043,.015);
 if(type==="drawers"){for(var i=0;i<3;i++)front(g,m,w,.225,.15+i*.235,.303)}
 else if(type==="dishwasher"){put(g,box(w-.010,.70,.020,m.chrome),0,.40,.303);put(g,box(w*.52,.008,.010,m.black),0,.66,.322)}
 else if(type==="oven"){front(g,m,w,.20,.20,.303);put(g,box(w-.010,.48,.021,m.black),0,.49,.303);put(g,box(w*.44,.008,.010,m.chrome),0,.66,.322)}
 else front(g,m,w,.70,.40,.303);
 return g
}
function wallUnit(m,w,glass){
 w=w||.68;var g=new THREE.Group(),p=.016,d=.33,h=.72;
 put(g,box(p,h,d,m.cab),-w/2+p/2,h/2,0);put(g,box(p,h,d,m.cab),w/2-p/2,h/2,0);
 put(g,box(w-p*2,p,d,m.inside),0,p/2,0);put(g,box(w-p*2,p,d,m.inside),0,h-p/2,0);
 put(g,box(w-p*2,h-p*2,.012,m.inside),0,h/2,-d/2+.006);
 if(glass){put(g,box(w-.008,h-.008,.018,m.glass),0,h/2,.175);put(g,box(w-.08,.014,.22,m.wood),0,.24,-.02);put(g,box(w-.08,.014,.22,m.wood),0,.49,-.02)}
 else front(g,m,w,h-.04,h/2,.175);
 return g
}
function tallUnit(m,type){
 var g=new THREE.Group(),w=.64,d=.62,h=2.22,p=.02,z=.321;
 put(g,box(p,h,d,m.cab),-w/2+p/2,h/2,0);put(g,box(p,h,d,m.cab),w/2-p/2,h/2,0);
 put(g,box(w-p*2,p,d,m.cab),0,p/2,0);put(g,box(w-p*2,p,d,m.cab),0,h-p/2,0);
 put(g,box(w-p*2,h-p*2,.014,m.inside),0,h/2,-d/2+.007);
 if(type==="fridge"){front(g,m,w,1.34,1.50,z);front(g,m,w,.67,.39,z);put(g,box(.012,.46,.016,m.black),.22,1.48,z+.023)}
 else if(type==="oven"){front(g,m,w,.57,.34,z);put(g,box(w-.010,.54,.022,m.black),0,1.06,z+.001);put(g,box(w*.44,.008,.010,m.chrome),0,1.28,z+.022);front(g,m,w,.61,1.88,z)}
 else{front(g,m,w,2.12,1.11,z)}
 return g
}
function hoodUnit(m){var g=new THREE.Group();put(g,box(.64,.055,.36,m.chrome),0,0,0);put(g,box(.28,.46,.19,m.chrome),0,.25,-.035);put(g,box(.45,.012,.16,m.black),0,-.035,.05);return g}
function hobUnit(m){var g=new THREE.Group();put(g,box(.56,.014,.42,m.black),0,0,0);for(var i=0;i<4;i++){var ring=new THREE.Mesh(new THREE.TorusGeometry(.065,.005,12,30),m.chrome);ring.rotation.x=Math.PI/2;ring.position.set((i%2?1:-1)*.14,.014,(i>1?1:-1)*.105);g.add(ring)}return g}
function simpleSink(m){var g=new THREE.Group();put(g,box(.50,.045,.36,m.chrome),0,0,0);put(g,box(.42,.018,.29,m.black),0,.026,0);var curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.17,.01,0),new THREE.Vector3(-.17,.30,0),new THREE.Vector3(-.02,.46,0),new THREE.Vector3(.15,.35,0)]),tap=new THREE.Mesh(new THREE.TubeGeometry(curve,28,.014,10,false),m.chrome);tap.castShadow=true;g.add(tap);return g}
function clearWorld(instance){if(!instance)return;instance.generation=(instance.generation||0)+1;while(instance.world.children.length){var o=instance.world.children[0];instance.world.remove(o);dispose(o)}}
function dispose(o){if(o&&o.userData&&o.userData.skipDispose)return;o.traverse&&o.traverse(function(n){if(n.geometry&&n.geometry.dispose)n.geometry.dispose();if(n.material){var a=Array.isArray(n.material)?n.material:[n.material];a.forEach(function(mm){if(mm.map&&mm.map.dispose)mm.map.dispose();if(mm.dispose)mm.dispose()})}})}
function addRun(world,m,length,z,rotation,xpos){
 var count=Math.max(3,Math.min(6,Math.floor(length/.62))),runLen=count*.62,start=-runLen/2+.31,g=new THREE.Group(),sinkIndex=Math.min(1,count-1),hobIndex=Math.min(3,count-1),hasHob=state.details.appliances.hob||runtime.phase<3;
 for(var i=0;i<count;i++){var type=i===sinkIndex?"doors":i===hobIndex&&hasHob?"oven":(i%3===0?"drawers":"doors");put(g,baseUnit(m,type,.60),start+i*.62,.115,0)}
 put(g,box(runLen+.06,.045,.68,m.stone),0,.955,0);put(g,box(runLen+.02,.085,.45,m.plinth),0,.042,.02);
 put(g,box(runLen+.02,.53,.020,m.stone),0,1.255,-.338);
 var sx=start+sinkIndex*.62;put(g,simpleSink(m),sx,.992,0);
 if(hasHob){var hx=start+hobIndex*.62;put(g,hobUnit(m),hx,.993,0);if(state.details.appliances.hood||runtime.phase<3)put(g,hoodUnit(m),hx,1.88,.08)}
 var wc=Math.max(2,Math.min(5,count-1));
 for(var j=0;j<wc;j++){var glass=state.visual.upper==="glass"||(state.visual.upper==="mixed"&&j===wc-2);if(state.visual.upper!=="open")put(g,wallUnit(m,.66,glass),start+.31+j*.68,1.54,-.16)}
 if(state.visual.upper==="open"){for(var r=0;r<2;r++)put(g,box(Math.min(1.55,runLen*.55),.035,.25,m.wood),.3,1.65+r*.30,-.20)}
 put(g,box(runLen-.10,.010,.030,m.led),0,1.49,-.15);
 var led=new THREE.PointLight(0xffddb0,.075,1.65,2);led.position.set(0,1.42,.05);g.add(led);
 if(rotation)g.rotation.y=rotation;g.position.x=xpos||0;g.position.z=z;world.add(g);
 return{group:g,sinkWorld:{x:(xpos||0)+sx,z:z},runLen:runLen}
}
function addRoomDecor(world,m,L,W,H){
 put(world,box(L+.6,.08,W+.6,m.wall,false),0,H+.04,0);
 put(world,box(L,.075,.055,m.wall),0,.075,-W/2+.02,false);put(world,box(.055,.075,W,m.wall),L/2-.02,.075,0,false);
 var shadow=new THREE.Mesh(new THREE.PlaneGeometry(Math.max(1,L-.5),.72),m.shadow);shadow.rotation.x=-Math.PI/2;shadow.position.set(0,.006,-W/2+.37);world.add(shadow);
 var positions=[[-L*.26,-W*.15],[0,W*.05],[L*.26,-W*.08]];positions.forEach(function(p){var fixture=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.018,24),m.chrome);fixture.position.set(p[0],H-.045,p[1]);fixture.rotation.x=Math.PI/2;world.add(fixture);var light=new THREE.PointLight(0xffe7bd,.38,3.2,2);light.position.set(p[0],H-.12,p[1]);world.add(light)});
 var pot=new THREE.Mesh(new THREE.CylinderGeometry(.08,.11,.19,24),m.wood);put(world,pot,L*.27,1.07,-W/2+.53);var lm=new THREE.MeshStandardMaterial({color:0x60725e,roughness:.82});for(var i=0;i<4;i++){var leaf=new THREE.Mesh(new THREE.SphereGeometry(.07,16,12),lm);leaf.scale.set(.45,1.6,.38);put(world,leaf,L*.27+(i-1.5)*.045,1.25+i*.015,-W/2+.53+(i%2?.03:-.03))}
}
function addWindow(world,m,L,W,H){
 var windows=state.room.markers.filter(function(x){return x.type==="window"});if(!windows.length&&!knownMeasurements())windows=[{wall:"north",pos:70}];
 windows.forEach(function(mm){if(mm.wall!=="north")return;var x=-L/2+L*(mm.pos/100),ww=Math.min(1.35,L*.27);put(world,box(ww,1.10,.025,m.glass),x,1.67,-W/2+.015);put(world,box(ww+.08,.035,.055,m.plinth),x,1.10,-W/2+.035);put(world,box(ww+.08,.035,.055,m.plinth),x,2.24,-W/2+.035);put(world,box(.035,1.14,.055,m.plinth),x-ww/2-.02,1.67,-W/2+.035);put(world,box(.035,1.14,.055,m.plinth),x+ww/2+.02,1.67,-W/2+.035);put(world,box(.025,1.08,.045,m.plinth),x,1.67,-W/2+.04)})
}
function fitModel(model,targetSize){
 var b=new THREE.Box3().setFromObject(model),size=new THREE.Vector3();b.getSize(size);var max=Math.max(size.x,size.y,size.z)||1,scale=targetSize/max;model.scale.setScalar(scale);b.setFromObject(model);var center=new THREE.Vector3();b.getCenter(center);model.position.x-=center.x;model.position.z-=center.z;model.position.y-=b.min.y;model.traverse(function(n){if(n.isMesh){n.castShadow=true;n.receiveShadow=true}});return model
}
function getAsset(url,cb){
 if(!window.THREE||!THREE.GLTFLoader)return;url=assetUrl(url);
 if(runtime.assetCache[url]){cb(runtime.assetCache[url].clone(true));return}
 if(runtime.assetWait[url]){runtime.assetWait[url].push(cb);return}
 runtime.assetWait[url]=[cb];var loader=new THREE.GLTFLoader();loader.load(url,function(g){runtime.assetCache[url]=g.scene;var list=runtime.assetWait[url]||[];delete runtime.assetWait[url];list.forEach(function(fn){fn(g.scene.clone(true))})},undefined,function(){delete runtime.assetWait[url]})
}
function addCC0Details(instance,sinkPos){
 if(!instance||!sinkPos||!window.THREE||!THREE.GLTFLoader)return;var gen=instance.generation;
 getAsset(cfg.cc0Assets.sink,function(model){if(instance.generation!==gen)return;model.userData.skipDispose=true;fitModel(model,.48);model.position.set(sinkPos.x,.905,sinkPos.z);instance.world.add(model)});
 getAsset(cfg.cc0Assets.tap,function(model){if(instance.generation!==gen)return;model.userData.skipDispose=true;fitModel(model,.38);model.position.set(sinkPos.x-.16,.955,sinkPos.z-.08);model.rotation.y=Math.PI;instance.world.add(model)})
}
function rebuildScene(instance){
 if(!instance||!window.THREE)return;clearWorld(instance);
 var m=materials(),r=effectiveRoom(),L=Math.max(2.6,r.length/100),W=Math.max(2.35,r.width/100),H=Math.max(2.4,r.height/100),layout=effectiveLayout(),world=instance.world;
 var floor=new THREE.Mesh(new THREE.PlaneGeometry(L+.9,W+.9),m.floor);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;world.add(floor);
 put(world,box(L,H,.07,m.wall,false),0,H/2,-W/2-.035);put(world,box(.07,H,W,m.wall,false),L/2+.035,H/2,0);
 if(layout==="u")put(world,box(.07,H,W,m.wall,false),-L/2-.035,H/2,0);
 addWindow(world,m,L,W,H);addRoomDecor(world,m,L,W,H);

 var towerTypes=[];
 if(state.details.storage.tall)towerTypes.push("pantry");
 if(state.details.appliances.fridge||runtime.phase<3)towerTypes.push("fridge");
 if(state.details.appliances.oven||runtime.phase<3)towerTypes.push("oven");
 if(runtime.phase<3&&towerTypes.length>2)towerTypes=towerTypes.slice(towerTypes.length-2);
 var towerWidth=towerTypes.length*.68;
 var mainLength=Math.max(1.86,L-towerWidth-.42),mainX=towerWidth/2;
 var main=addRun(world,m,mainLength,-W/2+.35,0,mainX);
 var tx=-L/2+.34;towerTypes.forEach(function(t){put(world,tallUnit(m,t),tx,.11,-W/2+.35);tx+=.68});

 if(layout==="l"||layout==="u"){
  var len=Math.max(1.65,W-.88),g=new THREE.Group(),count=Math.max(2,Math.min(4,Math.floor(len/.62))),run=count*.62,start=-run/2+.31;
  for(var i=0;i<count;i++)put(g,baseUnit(m,i===0?"drawers":"doors",.6),start+i*.62,.115,0);
  put(g,box(run+.05,.045,.68,m.stone),0,.955,0);put(g,box(run-.04,.085,.45,m.plinth),0,.042,.02);
  g.rotation.y=-Math.PI/2;g.position.set(L/2-.35,0,-W/2+.35+run/2);world.add(g)
 }
 if(layout==="u"){
  var len2=Math.max(1.65,W-.88),g2=new THREE.Group(),c2=Math.max(2,Math.min(4,Math.floor(len2/.62))),run2=c2*.62,st=-run2/2+.31;
  for(var j=0;j<c2;j++)put(g2,baseUnit(m,j===1?"drawers":"doors",.6),st+j*.62,.115,0);
  put(g2,box(run2+.05,.045,.68,m.stone),0,.955,0);g2.rotation.y=Math.PI/2;g2.position.set(-L/2+.35,0,-W/2+.35+run2/2);world.add(g2)
 }
 if(layout==="parallel"){
  var cnt=Math.max(3,Math.min(5,Math.floor((L-.7)/.62))),gg=new THREE.Group(),rl=cnt*.62,ss=-rl/2+.31;
  for(var p=0;p<cnt;p++)put(gg,baseUnit(m,p%3===0?"drawers":"doors",.6),ss+p*.62,.115,0);
  put(gg,box(rl+.05,.045,.68,m.stone),0,.955,0);gg.rotation.y=Math.PI;gg.position.set(0,0,W/2-.38);world.add(gg)
 }
 if(layout==="island"){
  var isl=new THREE.Group();for(var q=0;q<3;q++)put(isl,baseUnit(m,q===1?"drawers":"doors",.6),-.62+q*.62,.115,0);
  put(isl,box(2.03,.05,.92,m.stone),0,.96,0);put(isl,box(1.72,.085,.56,m.plinth),0,.043,0);isl.position.set(.15,0,.24);world.add(isl);
  [-.48,.15,.78].forEach(function(px){var shade=new THREE.Mesh(new THREE.CylinderGeometry(.10,.19,.17,28,1,true),m.plinth);put(world,shade,px,H-.58,.24);put(world,box(.007,.42,.007,m.plinth,false),px,H-.29,.24);var light=new THREE.PointLight(0xffd89b,.22,2.2,2);light.position.set(px,H-.65,.24);world.add(light)})
 }
 addCC0Details(instance,main.sinkWorld);cameraPreset(instance,instance.cameraMode||"hero")
}
function applyHDR(instance){
 if(!instance||!window.THREE||!THREE.RGBELoader)return;
 if(runtime.hdr){runtime.hdr.mapping=THREE.EquirectangularReflectionMapping;instance.scene.environment=runtime.hdr;return}
 runtime.hdrWait.push(instance);if(runtime.hdrLoading)return;runtime.hdrLoading=true;
 new THREE.RGBELoader().load(assetUrl("/kitchen-engine-v5/assets/kiara_interior_1k.hdr"),function(tex){
  tex.mapping=THREE.EquirectangularReflectionMapping;runtime.hdr=tex;runtime.hdrLoading=false;
  var list=runtime.hdrWait.splice(0);list.forEach(function(it){if(it&&it.scene)it.scene.environment=tex})
 },undefined,function(){runtime.hdrLoading=false;runtime.hdrWait=[]})
}
function environment(){
 var faces=[];
 for(var f=0;f<6;f++){
  var c=document.createElement("canvas"),x=c.getContext("2d");c.width=c.height=128;
  var g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,f===3?"#79736b":"#dce5e8");g.addColorStop(.46,"#eee8de");g.addColorStop(1,"#625c54");
  x.fillStyle=g;x.fillRect(0,0,128,128);
  if(f===0||f===4){x.fillStyle="rgba(255,249,231,.70)";x.fillRect(18,10,34,96)}
  faces.push(c)
 }
 var tex=new THREE.CubeTexture(faces);tex.encoding=THREE.sRGBEncoding;tex.needsUpdate=true;return tex
}
function create3D(canvas,wrap,isHero){
 if(!window.THREE||!canvas||!wrap)return null;var renderer;
 try{renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,powerPreference:"high-performance"})}catch(e){wrap.innerHTML='<div class="heroFallback">المعاينة ثلاثية الأبعاد غير متاحة على هذا الجهاز، لكن يمكنك متابعة بقية المراحل.</div>';return null}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,isHero?1.25:(window.innerWidth<700?1.15:1.55)));
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.physicallyCorrectLights=true;
 var scene=new THREE.Scene();scene.background=new THREE.Color(0xc9c8c2);scene.environment=environment();
 var camera=new THREE.PerspectiveCamera(isHero?(window.innerWidth<700?39:34):35,1,.1,70),world=new THREE.Group();scene.add(world);
 scene.add(new THREE.HemisphereLight(0xf8f4ea,0x5b5a54,.72));
 var sun=new THREE.DirectionalLight(0xffefd6,1.48);sun.position.set(4.5,7.0,4.8);sun.castShadow=true;sun.shadow.mapSize.set(window.innerWidth<700?1024:2048,window.innerWidth<700?1024:2048);sun.shadow.camera.left=-7;sun.shadow.camera.right=7;sun.shadow.camera.top=7;sun.shadow.camera.bottom=-7;sun.shadow.bias=-.0002;sun.shadow.normalBias=.025;scene.add(sun);
 var fill=new THREE.DirectionalLight(0xd8e8ee,.52);fill.position.set(-4,3.6,5);scene.add(fill);
 var warm=new THREE.PointLight(0xffd9a0,.14,4.5,2);warm.position.set(-1.2,2.2,1.4);scene.add(warm);
 var camGoal=new THREE.Vector3(4.8,1.78,5.1),target=new THREE.Vector3(.20,1.03,-.65);camera.position.copy(camGoal);camera.lookAt(target);
 var instance={renderer:renderer,scene:scene,camera:camera,world:world,camGoal:camGoal,target:target,wrap:wrap,isHero:isHero,cameraMode:"hero",generation:0};
 applyHDR(instance);
 function resize(){var w=wrap.clientWidth,h=wrap.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
 addEventListener("resize",resize);resize();
 if(!isHero){var drag=false,lx=0;canvas.addEventListener("pointerdown",function(e){drag=true;lx=e.clientX});canvas.addEventListener("pointermove",function(e){if(!drag)return;var dx=(e.clientX-lx)*.0034;camGoal.applyAxisAngle(new THREE.Vector3(0,1,0),-dx);lx=e.clientX});canvas.addEventListener("pointerup",function(){drag=false});canvas.addEventListener("pointercancel",function(){drag=false})}
 function loop(){requestAnimationFrame(loop);camera.position.lerp(camGoal,.07);camera.lookAt(target);var rect=wrap.getBoundingClientRect();if(!document.hidden&&rect.bottom>0&&rect.top<innerHeight)renderer.render(scene,camera)}
 loop();return instance
}
function cameraPreset(instance,name){
 if(!instance)return;instance.cameraMode=name;
 var r=effectiveRoom(),L=Math.max(2.6,r.length/100),W=Math.max(2.35,r.width/100),c=instance.camGoal,t=instance.target;
 if(name==="hero"){
  c.set(Math.min(L*.28,L/2-.34),window.innerWidth<700?1.58:1.66,Math.min(W*.34,W/2-.24));
  t.set(-.12,1.08,-W*.34)
 }else if(name==="functional"){
  c.set(Math.min(L*.10,L/2-.45),1.54,Math.min(W*.32,W/2-.28));
  t.set(.10,.98,-W*.40)
 }else if(name==="elevation"){
  c.set(0,1.48,Math.min(W*.38,W/2-.20));
  t.set(0,1.18,-W*.47)
 }else if(name==="island"){
  c.set(Math.max(-L*.27,-L/2+.30),1.66,Math.min(W*.32,W/2-.28));
  t.set(.12,.97,-.04)
 }else if(name==="wide"){
  c.set(Math.min(L*.34,L/2-.22),1.86,Math.min(W*.40,W/2-.18));
  t.set(0,1.02,-W*.24)
 }
}
function initHero(){if(runtime.hero)return;runtime.hero=create3D(document.getElementById("heroCanvas"),document.getElementById("heroWrap"),true);if(runtime.hero)rebuildScene(runtime.hero)}
function initStudio(){if(runtime.studio)return;runtime.studio=create3D(document.getElementById("studioCanvas"),document.getElementById("studioWrap"),false);if(runtime.studio)rebuildScene(runtime.studio)}
function rebuildAll3D(){if(runtime.hero)rebuildScene(runtime.hero);if(runtime.studio)rebuildScene(runtime.studio)}
root.innerHTML=page();bind();renderDynamic();initHero();
(function(){
 var planner=document.getElementById("planner");
 if(!planner||!("IntersectionObserver" in window)){document.body.classList.add("planner-nav-ready");return}
 var io=new IntersectionObserver(function(entries){entries.forEach(function(e){document.body.classList.toggle("planner-nav-ready",e.isIntersecting||e.boundingClientRect.top<innerHeight*.35)})},{rootMargin:"-12% 0px -35% 0px",threshold:.01});
 io.observe(planner)
})();
if(location.hash){var hm=location.hash.match(/^#phase-(\d)$/);if(hm){runtime.suspendHistory=true;goPhase(Math.min(runtime.maxPhase,Number(hm[1])),"replace")}}
})();