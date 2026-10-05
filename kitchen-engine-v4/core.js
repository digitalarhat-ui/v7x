(function(){
"use strict";
var cfg=window.KITCHEN_PROSPECT_CONFIG,root=document.getElementById("kitchenEngineApp");
if(!cfg||!root)return;
var STORAGE="kitchen-engine-v4:"+cfg.id;
var runtime={step:1,twin:null,lastUrl:"",refData:""};
var labels={
 layout:{straight:"مستقيم",l:"حرف L",u:"حرف U",parallel:"متوازي",island:"جزيرة"},
 appliance:{fridge:"ثلاجة",builtInFridge:"ثلاجة مدمجة",oven:"فرن",microwave:"مايكرويف",dishwasher:"غسالة صحون",hob:"موقد",hood:"شفاط",freezer:"فريزر"},
 storage:{pantry:"مؤن",tall:"تخزين طويل",deepDrawers:"أدراج عميقة",smallAppliance:"تخزين أجهزة صغيرة",corner:"تخزين زاوية",trays:"صواني",waste:"نفايات وفرز",coffee:"ركن قهوة"},
 marker:{door:"باب",window:"نافذة",column:"عمود",water:"مياه",drain:"صرف",vent:"تهوية",electric:"كهرباء",gas:"غاز"},
 wall:{north:"الجدار الرئيسي",east:"الجدار الأيمن",south:"الجدار المقابل",west:"الجدار الأيسر"},
 style:{calm:"مودرن هادئ",warm:"دافئ خشبي",light:"فاتح",dark:"داكن",minimal:"مينيمال",modernClassic:"كلاسيكي حديث"},
 cabinet:{ivory:"عاجي مطفي",oak:"بلوط دافئ",walnut:"جوز",ash:"رمادي فاتح",graphite:"فحمي",gloss:"أبيض لامع"},
 worktop:{lightQuartz:"كوارتز فاتح",veined:"حجر بعروق",warmStone:"حجر دافئ",darkStone:"حجر داكن"}
};
var state={
 spaceMode:"quick",
 room:{length:420,width:320,height:280,layout:"l",markers:[{id:"w1",type:"window",wall:"north",pos:62},{id:"u1",type:"water",wall:"north",pos:42}],referenceName:""},
 requirements:{
  appliances:{fridge:true,builtInFridge:false,oven:true,microwave:false,dishwasher:true,hob:true,hood:true,freezer:false},
  storage:{pantry:true,tall:true,deepDrawers:true,smallAppliance:false,corner:true,trays:false,waste:true,coffee:false},
  household:{users:"4",cooking:"daily",children:false,entertaining:false,accessibility:false},
  preferences:{island:false,seating:false,openShelves:false,prepPriority:true,storagePriority:true}
 },
 concept:{selected:"A",rejected:""},
 visual:{style:"calm",cabinet:"ivory",worktop:"veined",handle:"integrated",upper:"mixed",saved:false},
 project:{location:"",stage:"",planStatus:"",note:""},
 uncertainty:"الخامة النهائية ومواقع الأجهزة تحتاج مراجعة مع المصمم"
};
function clone(v){return JSON.parse(JSON.stringify(v))}
function merge(a,b){if(!b||typeof b!=="object")return a;Object.keys(b).forEach(function(k){if(b[k]&&typeof b[k]==="object"&&!Array.isArray(b[k])){if(!a[k]||typeof a[k]!=="object")a[k]={};merge(a[k],b[k])}else{a[k]=b[k]}});return a}
function enc(v){try{return btoa(unescape(encodeURIComponent(JSON.stringify(v)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}catch(e){return""}}
function dec(v){try{var s=v.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return JSON.parse(decodeURIComponent(escape(atob(s))))}catch(e){return null}}
(function(){var q=new URLSearchParams(location.search),p=q.get("project"),x=p?dec(p):null;if(!x){try{x=JSON.parse(localStorage.getItem(STORAGE)||"null")}catch(e){}}if(x)merge(state,x)})();
function safe(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c]})}
function active(o){return Object.keys(o).filter(function(k){return !!o[k]})}
function code(){var raw=JSON.stringify([state.room,state.requirements,state.concept,state.visual,state.project]),h=2166136261;for(var i=0;i<raw.length;i++){h^=raw.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24)}return "DK-"+((h>>>0).toString(36).toUpperCase()+"000000").slice(0,6)}
function save(){var p=enc(state),u=location.pathname+(p?"?project="+p:"");try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch(e){}if(u!==runtime.lastUrl){history.replaceState(null,"",u);runtime.lastUrl=u}}
function emit(n,d){try{window.dispatchEvent(new CustomEvent("kitchen-engine:"+n,{detail:d||{}}))}catch(e){}}
function toast(m){var e=document.getElementById("keToast");if(!e)return;e.textContent=m;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(function(){e.classList.remove("show")},1600)}
function applyTheme(){var t=cfg.theme||{};if(t.bg)document.documentElement.style.setProperty("--bg",t.bg);if(t.ink)document.documentElement.style.setProperty("--ink",t.ink);if(t.dark)document.documentElement.style.setProperty("--dark",t.dark);if(t.accent)document.documentElement.style.setProperty("--gold",t.accent);if(t.accentSoft)document.documentElement.style.setProperty("--gold2",t.accentSoft)}
function dim(id,name,val){return '<div class="ke-field"><label>'+name+'</label><div class="ke-num"><input id="'+id+'" type="number" min="180" max="1200" step="5" value="'+val+'"><span>سم</span></div></div>'}
function tog(name,key,on,type){return '<button class="ke-toggle '+(on?"active":"")+'" data-'+type+'="'+key+'"><span>'+name+'</span><i></i></button>'}
function swatch(key,color,type){var on=(type==="cabinet"?state.visual.cabinet:state.visual.worktop)===key;return '<button class="ke-swatch '+(on?"active":"")+'" data-'+type+'="'+key+'" style="--sw:'+color+'"><i></i></button>'}
function renderPage(){
 var steps=["المساحة والتخطيط","الشكل واللون","الخزائن والتفاصيل","الجاهزية السعرية","التواصل والمراجعة"];
 return '<header class="ke-top"><div class="ke-shell ke-nav"><div class="ke-brand"><div class="ke-mark">AD</div><div><b>'+safe(cfg.displayName)+'</b><small>'+safe(cfg.legalName)+'</small></div></div><div class="ke-stepbar">'+steps.map(function(x,i){return '<button class="ke-stepchip '+(i===0?"active":"")+'" data-stepnav="'+(i+1)+'">'+(i+1)+' · '+x+'</button>'}).join("")+'</div></div></header>'+
 '<section class="ke-hero"><div class="ke-shell ke-hero-grid"><div><div class="ke-eyebrow">دخاخني — تجربة طلب مطبخ قبل التصميم</div><h1>من الفكرة إلى طلب تصميم أوضح.</h1><p>رتّب مساحة مطبخك واتجاه الشكل واللون واحتياجات الخزائن قبل إرسال المشروع لفريق دخاخني. النتيجة ليست لعبة 3D؛ هي ملخص منظم يكمل خدمة التصميم الحالية.</p><div class="ke-flowstrip"><span>مساحتك أولاً</span><span>اتجاه بصري</span><span>تفاصيل عملية</span><span>معاينة 3D</span><span>طلب منظم</span></div><div class="ke-actions"><button class="ke-btn primary" id="startPlanner">ابدأ مشروع مطبخك ←</button><button class="ke-btn ghost" data-scrolljourney="true">كيف تعمل التجربة؟</button></div><p class="ke-truth">التصورات والألوان هنا مبدئية للمناقشة. القياس والخامة والاعتماد النهائي مع فريق التصميم في دخاخني.</p></div>'+
 '<div class="ke-owner-preview"><div class="ke-preview-kicker">PROJECT PREVIEW · تصور تجريبي</div><div class="ke-hero-plan" id="heroPlan"></div><div class="ke-money-card"><div class="ke-money-grid"><div><small>المساحة الحالية</small><b id="heroRoom"></b></div><div><small>احتياجات المشروع</small><b id="heroNeeds"></b></div><div><small>التصور الحالي</small><b id="heroConcept"></b></div><div><small>الناتج النهائي</small><b>ملخص واضح للمصمم</b></div></div></div></div></div></section>'+
 '<section class="ke-proof-strip"><div class="ke-shell ke-proof-grid"><article><span>01</span><b>خدمة تصميم قائمة بالفعل</b><p>دخاخني يطلب المخطط والأبعاد والمتطلبات قبل بدء التصميم.</p></article><article><span>02</span><b>التصور الثلاثي جزء من العملية</b><p>لذلك هذه التجربة لا تدّعي أن 3D هو المشكلة؛ بل تنظّم ما يصل قبله.</p></article><article><span>03</span><b>التحسين المقترح</b><p>العميل يصل للمصمم ومعه قرارات أولية محفوظة بدل رسالة عامة فقط.</p></article></div></section>'+
 '<section class="ke-journey" id="journeyOverview"><div class="ke-shell"><div class="ke-journey-intro"><div><div class="ke-eyebrow">مسار واحد · خمس مراحل</div><h2>رحلة طلب واضحة من المساحة إلى مراجعة المصمم.</h2></div><p>المساحة أولاً، ثم الشكل واللون، ثم الخزائن والتفاصيل، وبعدها جاهزية واضحة للمراجعة السعرية، وأخيراً تسليم منظم لفريق التصميم.</p></div><ol class="ke-journey-list">'+steps.map(function(x,i){var d=["حدد المساحة والقيود قبل أي قرار جمالي.","اختر اتجاهاً بصرياً وشاهده داخل معاينة ثلاثية الأبعاد.","رتّب الأجهزة والتخزين والتفاصيل العملية التي يحتاجها المصمم.","اعرف ما هو معروف وما يحتاج تأكيداً بدون اختراع سعر.","أرسل نفس حالة المشروع كملخص منظم إلى دخاخني."][i];return '<li><span>0'+(i+1)+'</span><div><b>'+x+'</b><p>'+d+'</p></div></li>'}).join("")+'</ol></div></section>'+
 '<main class="ke-main" id="plannerStart"><div class="ke-shell">'+step1()+step2()+step3()+step4()+step5()+'</div></main>'+
 '<div class="ke-navbottom"><div class="ke-shell ke-navbottom-inner"><button class="ke-back" id="backBtn">السابق</button><div class="ke-progress" id="stepProgress">المرحلة 1 من 5</div><button class="ke-next" id="nextBtn">التالي: الشكل واللون</button></div></div>'+
 '<footer class="ke-footer"><div class="ke-shell"><b>'+safe(cfg.displayName)+'</b> — تجربة تمهيدية تكمل مسار المصمم الحالي ولا تستبدله.</div></footer><div class="ke-toast" id="keToast">تم</div>';
}
function step1(){
 return '<section class="ke-stage active" data-step="1"><div class="ke-stage-head"><div><div class="ke-eyebrow">01 — المساحة والتخطيط</div><h2>كيف تبدو مساحة مطبخك؟</h2></div><p>ابدأ سريعاً أو أدخل مساحتك الفعلية تقريبياً. المقاسات بالسنتيمتر وتغيّر المخطط فعلياً.</p></div><div class="ke-grid"><div class="ke-card"><div class="ke-card-h"><div><h3>بصمة المساحة</h3><p>المساحة هي أساس المشروع — وليس اللون.</p></div><span id="spaceCode"></span></div><div class="ke-card-b">'+
 '<div class="ke-section"><div class="ke-section-title"><b>طريقة البداية</b><span>مسار سريع أو مساحة فعلية.</span></div><div class="ke-options"><button class="ke-opt '+(state.spaceMode==="quick"?"active":"")+'" data-mode="quick">بداية سريعة</button><button class="ke-opt '+(state.spaceMode==="real"?"active":"")+'" data-mode="real">مساحتي الفعلية</button></div></div>'+
 '<div class="ke-section"><div class="ke-section-title"><b>شكل تقريبي</b><span>قابل للتعديل.</span></div><div class="ke-options">'+Object.keys(labels.layout).map(function(k){return '<button class="ke-opt '+(state.room.layout===k?"active":"")+'" data-layout="'+k+'">'+labels.layout[k]+'</button>'}).join("")+'</div></div>'+
 '<div class="ke-section"><div class="ke-section-title"><b>الأبعاد</b><span>'+safe(cfg.disclaimers.measurement)+'</span></div><div class="ke-dims">'+dim("roomL","طول المساحة",state.room.length)+dim("roomW","عرض المساحة",state.room.width)+dim("roomH","ارتفاع السقف",state.room.height)+'</div></div>'+
 '<div class="ke-section" id="realTools"><div class="ke-section-title"><b>فتحات ونقاط خدمات</b><span>أضف ما تعرفه فقط.</span></div><div class="ke-options">'+Object.keys(labels.marker).map(function(k){return '<button class="ke-opt" data-addmarker="'+k+'">+ '+labels.marker[k]+'</button>'}).join("")+'</div><div id="markerList" style="display:grid;gap:7px;margin-top:10px"></div></div>'+
 '<div class="ke-section"><div class="ke-upload"><input id="spaceFile" type="file" accept="image/*,.pdf"><label for="spaceFile">أضف مخططاً أو صورة للمساحة</label><small>مرجع مساعد فقط؛ لا ندّعي استخراج قياس دقيق من صورة عادية.</small><div class="ke-upload-preview" id="filePreview"></div></div></div>'+
 '</div></div><aside class="ke-aside"><div class="ke-plan-card"><div class="ke-plan-top"><div><b>المخطط البُعدي</b><span>يتغير مع المقاسات</span></div><span id="planName"></span></div><div class="ke-plan-wrap" id="planBox"></div></div><div id="ruleBox"></div><div class="ke-mini"><h4>بصمة المساحة</h4><div id="spaceMini"></div></div></aside></div></section>';
}
function step2(){
 return '<section class="ke-stage" data-step="2"><div class="ke-stage-head"><div><div class="ke-eyebrow">02 — الشكل واللون</div><h2>اختر اتجاهاً أولياً ثم شاهده في المعاينة.</h2></div><p>نبدأ من المساحة التي حددتها، ثم نقارن تصورين مبدئيين ونحوّل اختيارك إلى معاينة ثلاثية الأبعاد. الألوان اتجاهات بصرية تجريبية وليست كتالوج دخاخني الرسمي.</p></div>'+
 '<div class="ke-card"><div class="ke-card-b"><div class="ke-concepts" id="concepts"></div><div class="ke-section"><div class="ke-section-title"><b>اتجاه الستايل</b><span>قرار بصري مبدئي فقط.</span></div><div class="ke-options">'+Object.keys(labels.style).map(function(k){return '<button class="ke-opt '+(state.visual.style===k?"active":"")+'" data-style="'+k+'">'+labels.style[k]+'</button>'}).join("")+'</div></div></div></div>'+
 '<div class="ke-twin-shell ke-twin-inline"><div class="ke-twin-heading"><div><span>الميزة البصرية الرئيسية</span><h3>معاينة ثلاثية الأبعاد تتبع حالة المشروع</h3><p>غيّر اتجاه الخزائن والسطح، وبدّل اللقطة. النموذج تمهيدي لمناقشة القرار وليس مخطط تصنيع.</p></div></div><div class="ke-twin-toolbar"><button class="ke-cam active" data-camera="hero">منظور رئيسي</button><button class="ke-cam" data-camera="functional">منظور وظيفي</button><button class="ke-cam" data-camera="elevation">واجهة أمامية</button><button class="ke-cam" data-camera="island">منظور الجزيرة</button><button class="ke-cam" data-camera="wide">منظور واسع</button><button class="ke-cam" id="presentation">وضع عرض</button></div><div class="ke-canvas-wrap" id="twinWrap"><canvas id="keTwin"></canvas><div class="ke-presentation" id="presentationOverlay"></div><div class="ke-twin-note">'+safe(cfg.disclaimers.visual)+' اسحب للتدوير عند الحاجة.</div></div><div class="ke-materials"><div class="ke-matbox"><b>واجهات الخزائن — اتجاه تجريبي</b><div class="ke-swatches">'+swatch("ivory","#d8d0c2","cabinet")+swatch("oak","#a77f58","cabinet")+swatch("walnut","#574033","cabinet")+swatch("ash","#9b9a94","cabinet")+swatch("graphite","#3c3e3b","cabinet")+swatch("gloss","#f0eee8","cabinet")+'</div></div><div class="ke-matbox"><b>سطح العمل — اتجاه تجريبي</b><div class="ke-swatches">'+swatch("lightQuartz","#dedbd3","worktop")+swatch("veined","#ece7de","worktop")+swatch("warmStone","#a99b86","worktop")+swatch("darkStone","#4b4a46","worktop")+'</div></div></div></div>'+
 '<div class="ke-memory" style="margin-top:16px"><h4>قصة القرار حتى الآن</h4><p id="decisionStory"></p></div></section>';
}
function step3(){
 var a=state.requirements.appliances,st=state.requirements.storage,h=state.requirements.household,p=state.requirements.preferences;
 return '<section class="ke-stage" data-step="3"><div class="ke-stage-head"><div><div class="ke-eyebrow">03 — الخزائن والتفاصيل</div><h2>الآن نضيف ما يؤثر فعلاً على التصميم.</h2></div><p>بدلاً من نموذج طويل، اختر وحدات التخزين والأجهزة وطريقة الاستخدام التي ستغيّر توزيع الخزائن أو ما يحتاج المصمم إلى معرفته.</p></div>'+
 '<div class="ke-grid"><div class="ke-card"><div class="ke-card-b">'+
 '<div class="ke-section"><div class="ke-section-title"><b>الخزائن والتخزين</b><span>اختَر ما تحتاجه فعلاً.</span></div><div class="ke-toggle-grid">'+Object.keys(labels.storage).map(function(k){return tog(labels.storage[k],k,st[k],"storage")}).join("")+'</div></div>'+
 '<div class="ke-section"><div class="ke-section-title"><b>الأجهزة</b><span>الموجود أو المخطط له.</span></div><div class="ke-toggle-grid">'+Object.keys(labels.appliance).map(function(k){return tog(labels.appliance[k],k,a[k],"appliance")}).join("")+'</div></div>'+
 '<div class="ke-section"><div class="ke-select-grid"><div class="ke-field"><label>عدد المستخدمين</label><select id="users"><option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option></select></div><div class="ke-field"><label>كثافة الطبخ</label><select id="cooking"><option value="light">خفيف</option><option value="daily">يومي</option><option value="heavy">مكثف</option></select></div></div><div class="ke-toggle-grid" style="margin-top:8px">'+tog("أطفال في المنزل","children",h.children,"household")+tog("استضافة متكررة","entertaining",h.entertaining,"household")+tog("احتياج وصول خاص","accessibility",h.accessibility,"household")+'</div></div>'+
 '<div class="ke-section"><div class="ke-section-title"><b>أولويات الاستخدام</b><span>تساعد المصمم في ترتيب المساحة.</span></div><div class="ke-toggle-grid">'+tog("جزيرة إن أمكن","island",p.island,"preference")+tog("جلسة / كراسي","seating",p.seating,"preference")+tog("رفوف مفتوحة","openShelves",p.openShelves,"preference")+tog("مساحة تحضير أكبر","prepPriority",p.prepPriority,"preference")+tog("تخزين أكبر","storagePriority",p.storagePriority,"preference")+'</div></div>'+
 '<div class="ke-section"><div class="ke-select-grid"><div class="ke-field"><label>اتجاه المقابض</label><select id="handles"><option value="integrated">مخفي / مدمج</option><option value="linear">خطي بسيط</option><option value="classic">مقبض واضح</option></select></div><div class="ke-field"><label>الخزائن العلوية</label><select id="uppers"><option value="mixed">مزيج مغلق + زجاج</option><option value="closed">مغلقة</option><option value="glass">زجاج</option><option value="open">رفوف مفتوحة</option></select></div></div></div>'+
 '</div></div><aside class="ke-aside"><div class="ke-mini"><h4>ملخص الاحتياجات</h4><div id="needsMini"></div></div><div class="ke-memory"><h4>ما سيفهمه المصمم</h4><p id="needsStory"></p></div></aside></div></section>';
}
function step4(){
 return '<section class="ke-stage" data-step="4"><div class="ke-stage-head"><div><div class="ke-eyebrow">04 — الجاهزية والخطوة التالية</div><h2>جاهز للمراجعة السعرية — من دون سعر مخترع.</h2></div><p>بدلاً من حاسبة وهمية، نوضح ما أصبح معروفاً عن المشروع وما يحتاج تأكيداً من دخاخني قبل التسعير أو بدء التصميم الفعلي.</p></div>'+
 '<div class="ke-readiness-card"><div class="ke-readiness-main"><span>حالة المشروع</span><h3>جاهز للمراجعة السعرية</h3><p>هذه النسخة لا تحسب سعراً آلياً لأن تسعير المشروع يعتمد على الخامة والقياس والتفاصيل التي يعتمدها فريق دخاخني.</p><div class="ke-readiness-meter"><i id="readinessBar"></i></div><b id="readinessText"></b></div>'+
 '<div class="ke-known-grid"><div><small>أصبح معروفاً</small><ul id="knownList"></ul></div><div><small>يحتاج تأكيداً</small><ul id="confirmList"></ul></div></div></div>'+
 '<div class="ke-card" style="margin-top:18px"><div class="ke-card-h"><div><h3>سياق المشروع قبل التواصل</h3><p>اختياري — لا نطلب إلا ما يفيد الفريق.</p></div></div><div class="ke-card-b"><div class="ke-select-grid"><div class="ke-field"><label>موقع المشروع</label><input id="location" placeholder="المدينة — الحي"></div><div class="ke-field"><label>مرحلة المشروع</label><select id="stage"><option value="">غير محدد</option><option>مطبخ جديد</option><option>تجديد مطبخ قائم</option><option>استكشاف أولي</option></select></div><div class="ke-field"><label>المخطط / القياس</label><select id="planStatus"><option value="">غير محدد</option><option>مخطط جاهز</option><option>قياسات مبدئية متوفرة</option><option>أحتاج قياساً</option><option>غير متأكد</option></select></div><div class="ke-field"><label>ملاحظة للمصمم</label><input id="note" placeholder="مثال: أولوية تخزين أو جهاز محدد"></div></div></div></div></section>';
}
function step5(){
 return '<section class="ke-stage" data-step="5"><div class="ke-stage-head"><div><div class="ke-eyebrow">05 — التواصل والمراجعة</div><h2>'+safe(cfg.labels.handoffTitle)+'</h2></div><p>كل قرار اتخذته في المراحل السابقة يظهر هنا في ملخص واحد، ثم يفتح واتساب دخاخني برسالة منظمة قابلة للمراجعة قبل الإرسال.</p></div>'+
 '<div class="ke-owner-card"><div class="ke-owner-grid"><div><div class="ke-summary" id="finalSummary"></div><div class="ke-memory" style="margin-top:14px"><h4>ملخص المشروع بصياغة بشرية</h4><p id="finalStory"></p></div></div><aside class="ke-handoff"><div><small>جاهز للمراجعة مع المصمم</small><h3 id="finalCode"></h3><p id="finalReadiness"></p><div class="ke-q"><b>سؤال واحد للفريق</b><p>'+safe(cfg.labels.commercialQuestion)+'</p></div></div><a class="ke-whatsapp" id="wa" target="_blank" rel="noopener">فتح واتساب دخاخني</a></aside></div>'+
 '<div class="ke-message-preview"><div><small>الرسالة التي ستصل</small><h4>مشروع منظم بدلاً من «كم سعر المتر؟»</h4></div><pre id="waPreview"></pre></div></div></section>';
}
function planSvg(){
 var L=Math.max(220,Number(state.room.length)||420),W=Math.max(200,Number(state.room.width)||320),scale=Math.min(520/L,330/W),rw=L*scale,rh=W*scale,x=(600-rw)/2,y=(400-rh)/2,a=[];
 a.push('<svg class="ke-plan-svg" viewBox="0 0 600 400">');
 a.push('<rect x="'+x+'" y="'+y+'" width="'+rw+'" height="'+rh+'" fill="#faf8f2" stroke="#292a25" stroke-width="4"/>');
 a.push('<text x="300" y="'+(y-10)+'" text-anchor="middle" font-size="11" fill="#605a52">'+L+' سم</text>');
 a.push('<text x="'+(x+rw+22)+'" y="'+(y+rh/2)+'" text-anchor="middle" font-size="11" fill="#605a52" transform="rotate(90 '+(x+rw+22)+' '+(y+rh/2)+')">'+W+' سم</text>');
 drawRuns(a,state.room.layout,x,y,rw,rh);
 state.room.markers.forEach(function(m){drawMarker(a,m,x,y,rw,rh)});
 a.push('</svg>');return a.join("");
}
function drawRuns(a,l,x,y,w,h){
 var d=Math.max(18,Math.min(54,Math.min(w,h)*.17));
 function r(rx,ry,rw,rh,c){a.push('<rect x="'+rx+'" y="'+ry+'" width="'+rw+'" height="'+rh+'" rx="2" fill="'+(c||"#2b2c27")+'" opacity=".92"/>')}
 r(x+8,y+8,w-16,d);if(l==="l"||l==="u")r(x+w-d-8,y+d+8,d,h-d-16);if(l==="u")r(x+8,y+d+8,d,h-d-16);if(l==="parallel")r(x+8,y+h-d-8,w-16,d);if(l==="island")r(x+w*.31,y+h*.52,w*.38,Math.max(20,d*.78),"#b18b58");
}
function drawMarker(a,m,x,y,w,h){
 var p=Math.max(0,Math.min(100,Number(m.pos)||50))/100,colors={door:"#9a7655",window:"#7aa5b8",column:"#77736d",water:"#4f8eb3",drain:"#586d7a",vent:"#829682",electric:"#c09a44",gas:"#b36c54"},c=colors[m.type]||"#777",px=x+w*p,py=y+4;
 if(m.wall==="south"){px=x+w*p;py=y+h-4}if(m.wall==="east"){px=x+w-4;py=y+h*p}if(m.wall==="west"){px=x+4;py=y+h*p}
 if(m.type==="door"||m.type==="window"){if(m.wall==="north"||m.wall==="south")a.push('<rect x="'+(px-22)+'" y="'+(py-4)+'" width="44" height="8" fill="'+c+'"/>');else a.push('<rect x="'+(px-4)+'" y="'+(py-22)+'" width="8" height="44" fill="'+c+'"/>')}else a.push('<circle cx="'+px+'" cy="'+py+'" r="6" fill="'+c+'" stroke="#fff" stroke-width="2"/>');
}
function markerList(){
 var e=document.getElementById("markerList");if(!e)return;
 if(!state.room.markers.length){e.innerHTML='<div class="ke-rule">لم تضف فتحات أو نقاط خدمات بعد.</div>';return}
 e.innerHTML=state.room.markers.map(function(m){return '<div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:7px;align-items:center;border:1px solid #ddd3c5;background:#fff;padding:8px"><b style="font-size:8px">'+labels.marker[m.type]+'</b><select data-markerwall="'+m.id+'" style="border:1px solid #ddd3c5;padding:7px;font-size:8px">'+Object.keys(labels.wall).map(function(w){return '<option value="'+w+'" '+(m.wall===w?"selected":"")+'>'+labels.wall[w]+'</option>'}).join("")+'</select><input data-markerpos="'+m.id+'" type="range" min="5" max="95" value="'+m.pos+'"><button data-delmarker="'+m.id+'" style="border:0;background:#eee4d7;padding:7px 9px">×</button></div>'}).join("");
}
function warningList(){
 var r=[],L=Number(state.room.length),W=Number(state.room.width),l=state.room.layout;
 if(L<240||W<220)r.push("المساحة صغيرة وتحتاج مراجعة دقيقة قبل أي توزيع.");
 if(l==="island"&&(W<330||L<380))r.push("الجزيرة لا تمر قاعدة الفراغ العامة في النسخة التجريبية.");
 if(l==="parallel"&&W<260)r.push("التكوين المتوازي يحتاج عرضاً أكبر للممر.");
 if(state.room.markers.some(function(m){return m.type==="window"})&&state.requirements.storage.tall)r.push("نافذة مسجلة: أبعد التخزين الطويل عنها في التصور الأولي.");
 return r;
}
function concepts(){
 var L=Number(state.room.length),W=Number(state.room.width),p=state.requirements.preferences,base=state.room.layout,canIsland=L>=380&&W>=330;
 if(base==="island"&&!canIsland)base="l";
 var a=base;if(a==="straight"&&L>=340&&W>=280)a="l";
 var b;if(a==="l")b=W>=290?"u":"straight";else if(a==="u")b=canIsland&&p.island?"island":"l";else if(a==="parallel")b="l";else if(a==="island")b="u";else b=W>=290?"l":"straight";
 var water=state.room.markers.some(function(m){return m.type==="water"}),win=state.room.markers.some(function(m){return m.type==="window"}),ar="يحافظ على توزيع واضح بين التخزين والتحضير";
 if(water)ar+=" مع إبقاء الحوض قريباً من نقطة المياه";if(win)ar+=" وإبعاد التخزين الطويل عن النافذة";
 var br=p.storagePriority?"يزيد مساحة التخزين ويستفيد من أكثر من جدار":"يوسع سطح العمل ويعطي منطقة تحضير أطول";if(p.island&&canIsland&&b==="island")br="يختبر جزيرة مبدئية لأن أبعاد المساحة تسمح بفراغ حركة أفضل";
 return {A:{layout:a,title:"التصور A",reason:ar},B:{layout:b,title:"التصور B",reason:br}};
}
function chosen(){var c=concepts();return c[state.concept.selected]||c.A}
function decisionStory(){
 var c=chosen(),r=["العميل بدأ بمساحة تقريبية "+state.room.length+" × "+state.room.width+" سم","اختار "+c.title+" بتكوين "+labels.layout[c.layout]+" لأن "+c.reason];
 if(state.requirements.preferences.prepPriority)r.push("مساحة التحضير مهمة");if(state.requirements.preferences.storagePriority)r.push("التخزين أولوية");if(state.concept.rejected)r.push("تم استبعاد "+state.concept.rejected+" أثناء الاستكشاف");r.push(state.uncertainty);return r.join("، ")+".";
}
function readiness(){
 var s=55;if(state.room.length&&state.room.width&&state.room.height)s+=10;if(state.room.markers.length)s+=5;if(active(state.requirements.appliances).length)s+=8;if(active(state.requirements.storage).length)s+=7;if(state.concept.selected)s+=5;if(state.project.location)s+=5;if(state.project.planStatus)s+=5;return Math.min(100,s);
}
function whatsappUrl(){
 var c=chosen(),a=active(state.requirements.appliances).map(function(k){return labels.appliance[k]}),st=active(state.requirements.storage).map(function(k){return labels.storage[k]}),lines=[
  "السلام عليكم، هذا ملخص مشروع أولي من مخطط "+cfg.displayName+":","رقم المشروع: "+code(),"المساحة: "+state.room.length+" × "+state.room.width+" × "+state.room.height+" سم","التصور: "+c.title+" — "+labels.layout[c.layout],"الأجهزة: "+(a.join("، ")||"غير محدد"),"التخزين: "+(st.join("، ")||"غير محدد"),"الاتجاه البصري: "+labels.style[state.visual.style]+" / "+labels.cabinet[state.visual.cabinet]+" / "+labels.worktop[state.visual.worktop],"موقع المشروع: "+(state.project.location||"غير محدد"),"مرحلة المشروع: "+(state.project.stage||"غير محددة"),"المخطط / القياس: "+(state.project.planStatus||"غير محدد"),"قصة القرار: "+decisionStory()
 ];
 if(state.project.note)lines.push("ملاحظة: "+state.project.note);lines.push("هذا تصور أولي للمناقشة مع المصمم وليس مخطط تصنيع أو عرض سعر.");return "https://wa.me/"+cfg.whatsapp+"?text="+encodeURIComponent(lines.join("\n"));
}
function renderState(){
 save();
 var plan=document.getElementById("planBox");if(plan)plan.innerHTML=planSvg();var pn=document.getElementById("planName");if(pn)pn.textContent=labels.layout[state.room.layout];markerList();
 var rb=document.getElementById("ruleBox");if(rb){var w=warningList();rb.innerHTML=w.length?'<div class="ke-rule warn"><b>مراجعة ذكية</b><br>'+w.join("<br>")+'</div>':'<div class="ke-rule ok"><b>قابل للاستكشاف</b><br>لا توجد ملاحظة عامة تمنع متابعة التصور، مع بقاء الاعتماد النهائي للمصمم.</div>'}
 var sm=document.getElementById("spaceMini");if(sm)sm.innerHTML='<div class="ke-mini-line"><span>المساحة</span><b>'+state.room.length+' × '+state.room.width+' × '+state.room.height+' سم</b></div><div class="ke-mini-line"><span>الشكل</span><b>'+labels.layout[state.room.layout]+'</b></div><div class="ke-mini-line"><span>القيود</span><b>'+state.room.markers.length+'</b></div>';
 var nm=document.getElementById("needsMini");if(nm)nm.innerHTML='<div class="ke-mini-line"><span>الأجهزة</span><b>'+active(state.requirements.appliances).length+'</b></div><div class="ke-mini-line"><span>التخزين</span><b>'+active(state.requirements.storage).length+'</b></div><div class="ke-mini-line"><span>المستخدمون</span><b>'+safe(state.requirements.household.users)+'</b></div>';
 var ns=document.getElementById("needsStory");if(ns)ns.textContent="الأجهزة: "+active(state.requirements.appliances).map(function(k){return labels.appliance[k]}).slice(0,5).join("، ")+". التخزين: "+active(state.requirements.storage).map(function(k){return labels.storage[k]}).slice(0,5).join("، ")+".";
 var cb=document.getElementById("concepts");if(cb){var cs=concepts();cb.innerHTML=["A","B"].map(function(id){var x=cs[id];return '<article class="ke-concept '+(state.concept.selected===id?"active":"")+'"><div class="ke-concept-tag">تصور أولي للمناقشة مع المصمم</div><h3>'+x.title+' — '+labels.layout[x.layout]+'</h3><p>'+x.reason+'.</p><button data-concept="'+id+'">'+(state.concept.selected===id?"محدد حالياً":"اختيار هذا التصور")+'</button></article>'}).join("")}
 var ds=document.getElementById("decisionStory");if(ds)ds.textContent=decisionStory();
 var hr=document.getElementById("heroRoom"),hn=document.getElementById("heroNeeds"),hc=document.getElementById("heroConcept"),sc=document.getElementById("spaceCode");if(hr)hr.textContent=state.room.length+" × "+state.room.width+" سم";if(hn)hn.textContent=active(state.requirements.appliances).length+" أجهزة + "+active(state.requirements.storage).length+" تخزين";if(hc)hc.textContent=labels.layout[chosen().layout];if(sc)sc.textContent=code();
 var real=document.getElementById("realTools");if(real)real.style.display=state.spaceMode==="real"?"block":"none";
 var combo=document.getElementById("useCombo");if(combo){combo.textContent=state.visual.saved?"تم استخدام هذه التوليفة ✓":"استخدم هذه التوليفة في طلبي";combo.classList.toggle("active",!!state.visual.saved)}
 var rb2=document.getElementById("readinessBar"),rt=document.getElementById("readinessText"),kl=document.getElementById("knownList"),cl=document.getElementById("confirmList");if(rb2)rb2.style.width=readiness()+"%";if(rt)rt.textContent="اكتمال الملخص الأولي: "+readiness()+"%";
 if(kl){var known=["الشكل: "+labels.layout[chosen().layout],"المقاسات التقريبية: "+state.room.length+" × "+state.room.width+" سم","التخزين: "+active(state.requirements.storage).length+" اختيارات","الأجهزة: "+active(state.requirements.appliances).length+" اختيارات","الاتجاه البصري: "+labels.style[state.visual.style]+" / "+labels.cabinet[state.visual.cabinet]];kl.innerHTML=known.map(function(x){return "<li>"+safe(x)+"</li>"}).join("")}
 if(cl){var todo=["الخامة النهائية والعينة الفعلية","القياس الموقعي النهائي","مواقع الأجهزة واعتماد التمديدات","الإكسسوارات والتفاصيل التنفيذية","عرض السعر النهائي"];cl.innerHTML=todo.map(function(x){return "<li>"+safe(x)+"</li>"}).join("")}
 var fs=document.getElementById("finalSummary");if(fs){var aa=active(state.requirements.appliances).map(function(k){return labels.appliance[k]}),ss=active(state.requirements.storage).map(function(k){return labels.storage[k]}),rows=[["رقم المشروع",code()],["التصور المختار",chosen().title+" — "+labels.layout[chosen().layout]],["المساحة",state.room.length+" × "+state.room.width+" × "+state.room.height+" سم"],["القيود",state.room.markers.length+" عناصر"],["الأجهزة",aa.join("، ")||"غير محدد"],["التخزين",ss.join("، ")||"غير محدد"],["التوليفة البصرية",(state.visual.saved?"محفوظة — ":"غير محفوظة — ")+labels.style[state.visual.style]+" / "+labels.cabinet[state.visual.cabinet]+" / "+labels.worktop[state.visual.worktop]],["أسئلة للمراجعة","الخامة النهائية، مواقع الأجهزة، القياس"],["جاهزية المشروع",readiness()+"%"],["الموقع",state.project.location||"غير محدد"]];fs.innerHTML=rows.map(function(r){return '<div><small>'+r[0]+'</small><b>'+safe(r[1])+'</b></div>'}).join("");document.getElementById("finalStory").textContent=decisionStory();document.getElementById("finalCode").textContent=code();document.getElementById("finalReadiness").textContent="جاهزية الملخص الأولي: "+readiness()+"%. "+cfg.disclaimers.planning;document.getElementById("wa").href=whatsappUrl();var preview=document.getElementById("waPreview");if(preview){try{preview.textContent=decodeURIComponent((whatsappUrl().split("?text=")[1]||"").replace(/\+/g," "))}catch(e){preview.textContent=""}}}
 if(runtime.twin)rebuildTwin();
}

function hydrate(){
 var map={users:state.requirements.household.users,cooking:state.requirements.household.cooking,handles:state.visual.handle,uppers:state.visual.upper,location:state.project.location,stage:state.project.stage,planStatus:state.project.planStatus,note:state.project.note};
 Object.keys(map).forEach(function(k){var e=document.getElementById(k);if(e)e.value=map[k]});
}
function goStep(n){
 runtime.step=Math.max(1,Math.min(5,n));
 document.querySelectorAll(".ke-stage").forEach(function(e){e.classList.toggle("active",Number(e.dataset.step)===runtime.step)});
 document.querySelectorAll(".ke-phase-progress li").forEach(function(e,i){e.dataset.active=(i+1===runtime.step)?"true":"false";e.dataset.complete=(i+1<runtime.step)?"true":"false"});
 var phaseNames=["المساحة والتخطيط","الشكل واللون","الخزائن والتفاصيل","الجاهزية والخطوة التالية","التواصل والمراجعة"];
 var nextLabels=["التالي: الشكل واللون","التالي: الخزائن والتفاصيل","التالي: الجاهزية","التالي: التواصل والمراجعة","حفظ المشروع"];
 var back=document.getElementById("backBtn"),next=document.getElementById("nextBtn");
 back.disabled=runtime.step===1;back.style.opacity=runtime.step===1?".45":"1";next.textContent=nextLabels[runtime.step-1];
 document.getElementById("stepProgress").textContent="المرحلة "+runtime.step+" من 5";
 var pn=document.getElementById("phaseNum"),pname=document.getElementById("phaseName");if(pn)pn.textContent=runtime.step;if(pname)pname.textContent=phaseNames[runtime.step-1];
 if(runtime.step===2){initTwin();setTimeout(function(){rebuildTwin();cameraPreset("hero")},60)}
 renderState();emit("step",{step:runtime.step,code:code()});document.getElementById("phaseProgress").scrollIntoView({behavior:"smooth",block:"start"});
}
function handleReference(file){
 if(!file)return;state.room.referenceName=file.name;var box=document.getElementById("filePreview");
 if(file.type&&file.type.indexOf("image/")===0){var r=new FileReader();r.onload=function(){runtime.refData=r.result;if(box){box.classList.add("show");box.innerHTML='<img alt="مرجع المساحة" src="'+r.result+'"><small>'+safe(file.name)+'</small>'}save()};r.readAsDataURL(file)}
 else if(box){box.classList.add("show");box.innerHTML='<small>'+safe(file.name)+' — تم تسجيله كمرجع فقط.</small>'}
 toast("تمت إضافة المرجع — راجع المقاسات يدوياً");
}
function bindEvents(){
 root.addEventListener("click",function(ev){
  var t=ev.target.closest("button,a");if(!t)return;
  if(t.id==="startPlanner"){goStep(1);return}
  if(t.id==="seePhases"){document.getElementById("phaseProgress").scrollIntoView({behavior:"smooth",block:"start"});return}
  if(t.id==="useCombo"){state.visual.saved=true;renderState();toast("تمت إضافة التوليفة إلى ملخص المشروع");return}
  if(t.dataset.stepnav){goStep(Number(t.dataset.stepnav));return}
  if(t.dataset.mode){state.spaceMode=t.dataset.mode;document.querySelectorAll("[data-mode]").forEach(function(x){x.classList.toggle("active",x===t)});renderState();return}
  if(t.dataset.layout){state.room.layout=t.dataset.layout;if(t.dataset.layout==="island")state.requirements.preferences.island=true;document.querySelectorAll("[data-layout]").forEach(function(x){x.classList.toggle("active",x===t)});renderState();return}
  if(t.dataset.addmarker){state.room.markers.push({id:"m"+Date.now().toString(36),type:t.dataset.addmarker,wall:"north",pos:50});state.spaceMode="real";renderState();return}
  if(t.dataset.delmarker){state.room.markers=state.room.markers.filter(function(m){return m.id!==t.dataset.delmarker});renderState();return}
  if(t.dataset.appliance){var ak=t.dataset.appliance;state.requirements.appliances[ak]=!state.requirements.appliances[ak];t.classList.toggle("active",state.requirements.appliances[ak]);renderState();return}
  if(t.dataset.storage){var sk=t.dataset.storage;state.requirements.storage[sk]=!state.requirements.storage[sk];t.classList.toggle("active",state.requirements.storage[sk]);renderState();return}
  if(t.dataset.household){var hk=t.dataset.household;state.requirements.household[hk]=!state.requirements.household[hk];t.classList.toggle("active",state.requirements.household[hk]);renderState();return}
  if(t.dataset.preference){var pk=t.dataset.preference;state.requirements.preferences[pk]=!state.requirements.preferences[pk];t.classList.toggle("active",state.requirements.preferences[pk]);renderState();return}
  if(t.dataset.concept){if(state.concept.selected&&state.concept.selected!==t.dataset.concept)state.concept.rejected=state.concept.selected;state.concept.selected=t.dataset.concept;renderState();return}
  if(t.dataset.style){state.visual.style=t.dataset.style;document.querySelectorAll("[data-style]").forEach(function(x){x.classList.toggle("active",x===t)});renderState();return}
  if(t.dataset.cabinet){state.visual.cabinet=t.dataset.cabinet;document.querySelectorAll("[data-cabinet]").forEach(function(x){x.classList.toggle("active",x===t)});renderState();return}
  if(t.dataset.worktop){state.visual.worktop=t.dataset.worktop;document.querySelectorAll("[data-worktop]").forEach(function(x){x.classList.toggle("active",x===t)});renderState();return}
  if(t.dataset.camera){cameraPreset(t.dataset.camera);document.querySelectorAll("[data-camera]").forEach(function(x){x.classList.toggle("active",x===t)});return}
  if(t.id==="presentation"){togglePresentation();return}
 });
 root.addEventListener("input",function(ev){
  var e=ev.target,id=e.id;if(id==="roomL")state.room.length=Number(e.value)||state.room.length;if(id==="roomW")state.room.width=Number(e.value)||state.room.width;if(id==="roomH")state.room.height=Number(e.value)||state.room.height;
  if(e.dataset.markerpos){var m=state.room.markers.filter(function(x){return x.id===e.dataset.markerpos})[0];if(m)m.pos=Number(e.value)}
  if(id==="location")state.project.location=e.value.trim();if(id==="note")state.project.note=e.value.trim();renderState();
 });
 root.addEventListener("change",function(ev){
  var e=ev.target,id=e.id;if(e.dataset.markerwall){var m=state.room.markers.filter(function(x){return x.id===e.dataset.markerwall})[0];if(m)m.wall=e.value;renderState();return}
  if(id==="users")state.requirements.household.users=e.value;if(id==="cooking")state.requirements.household.cooking=e.value;if(id==="handles")state.visual.handle=e.value;if(id==="uppers")state.visual.upper=e.value;if(id==="stage")state.project.stage=e.value;if(id==="planStatus")state.project.planStatus=e.value;if(id==="spaceFile"){handleReference(e.files&&e.files[0]);return}renderState();
 });
 document.getElementById("backBtn").addEventListener("click",function(){goStep(runtime.step-1)});
 document.getElementById("nextBtn").addEventListener("click",function(){if(runtime.step<5)goStep(runtime.step+1);else{save();toast("تم حفظ حالة المشروع");emit("saved",{code:code()})}});
}

function envTexture(){
 var faces=[];for(var f=0;f<6;f++){var c=document.createElement("canvas"),x=c.getContext("2d");c.width=c.height=128;var g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,f===3?"#777168":"#dbe5eb");g.addColorStop(.45,"#eee8dd");g.addColorStop(1,"#655e55");x.fillStyle=g;x.fillRect(0,0,128,128);faces.push(c)}
 var t=new THREE.CubeTexture(faces);t.encoding=THREE.sRGBEncoding;t.needsUpdate=true;return t;
}
function simpleTexture(kind){
 var c=document.createElement("canvas"),x=c.getContext("2d");c.width=c.height=256;
 if(kind==="wood"){x.fillStyle="#8b684a";x.fillRect(0,0,256,256);for(var i=0;i<80;i++){x.strokeStyle="rgba(65,43,29,.12)";x.beginPath();var y=Math.random()*256;x.moveTo(0,y);for(var p=0;p<=256;p+=24)x.lineTo(p,y+Math.sin(p*.04+Math.random())*3);x.stroke()}}
 else if(kind==="stone"){x.fillStyle="#e6e2da";x.fillRect(0,0,256,256);for(var j=0;j<10;j++){x.strokeStyle="rgba(96,91,84,.17)";x.beginPath();var sy=Math.random()*256;x.moveTo(0,sy);for(var z=0;z<280;z+=40){sy+=(Math.random()-.5)*32;x.lineTo(z,sy)}x.stroke()}}
 else{x.fillStyle="#c8c1b6";x.fillRect(0,0,256,256);x.strokeStyle="rgba(75,70,64,.14)";for(var q=0;q<=256;q+=64){x.beginPath();x.moveTo(q,0);x.lineTo(q,256);x.stroke();x.beginPath();x.moveTo(0,q);x.lineTo(256,q);x.stroke()}}
 var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;return t;
}
function twinMaterials(){
 var color={ivory:0xd8d0c2,oak:0xa77f58,walnut:0x574033,ash:0x9b9a94,graphite:0x3c3e3b,gloss:0xf0eee8}[state.visual.cabinet]||0xd8d0c2,stone=simpleTexture("stone"),wood=simpleTexture("wood"),floor=simpleTexture("floor");stone.repeat.set(2.2,.8);wood.repeat.set(2,1);floor.repeat.set(5,5);
 return {cab:new THREE.MeshPhysicalMaterial({color:color,roughness:state.visual.cabinet==="gloss"?.18:.36,clearcoat:state.visual.cabinet==="gloss"?.75:.18,map:(state.visual.cabinet==="oak"||state.visual.cabinet==="walnut")?wood:null,envMapIntensity:.8}),inside:new THREE.MeshStandardMaterial({color:0xd8d4cc,roughness:.52}),stone:new THREE.MeshPhysicalMaterial({color:state.visual.worktop==="darkStone"?0x55524d:0xffffff,map:stone,roughness:.2,clearcoat:.38}),metal:new THREE.MeshStandardMaterial({color:0xa5aaa7,roughness:.24,metalness:.92}),dark:new THREE.MeshStandardMaterial({color:0x161714,roughness:.35,metalness:.5}),glass:new THREE.MeshPhysicalMaterial({color:0xd6e0df,roughness:.05,transparent:true,opacity:.25,clearcoat:1}),appliance:new THREE.MeshPhysicalMaterial({color:0x101313,roughness:.06,metalness:.22,clearcoat:1}),wall:new THREE.MeshStandardMaterial({color:0xe7e1d8,roughness:.88}),floor:new THREE.MeshPhysicalMaterial({color:0xffffff,map:floor,roughness:.62}),wood:new THREE.MeshPhysicalMaterial({color:0xffffff,map:wood,roughness:.4})};
}
function box(w,h,d,mat){
 var min=Math.min(w,h,d),structural=(min<.018||w>2.8||h>2.8||d>2.8),geo;
 if(structural)geo=new THREE.BoxGeometry(w,h,d);
 else{
  var r=Math.max(.002,Math.min(.012,min*.16)),iw=Math.max(.003,w-2*r),ih=Math.max(.003,h-2*r),dep=Math.max(.003,d-2*r),sh=new THREE.Shape();
  sh.moveTo(-iw/2,-ih/2);sh.lineTo(iw/2,-ih/2);sh.lineTo(iw/2,ih/2);sh.lineTo(-iw/2,ih/2);sh.closePath();
  geo=new THREE.ExtrudeGeometry(sh,{depth:dep,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:r,bevelThickness:r,curveSegments:1});geo.translate(0,0,-dep/2);geo.computeVertexNormals();
 }
 var m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;return m
}
function put(g,m,x,y,z,ry){m.position.set(x||0,y||0,z||0);if(ry)m.rotation.y=ry;g.add(m);return m}
function panelCarcass(mat,w,h,d){
 var g=new THREE.Group(),p=.018;
 put(g,box(p,h,d,mat.inside),-w/2+p/2,h/2,0);put(g,box(p,h,d,mat.inside),w/2-p/2,h/2,0);
 put(g,box(w-p*2,p,d,mat.inside),0,p/2,0);put(g,box(w-p*2,p,d,mat.inside),0,h-p/2,0);
 put(g,box(w-p*2,h-p*2,.012,mat.inside),0,h/2,-d/2+.006);return g
}
function addFront(g,mat,w,h,y,z,frontMat){
 put(g,box(w-.038,h-.038,.026,frontMat||mat.cab),0,y,z);
 put(g,box(Math.max(.10,w*.42),.012,.014,mat.dark),0,y+h*.27,z+.022)
}
function baseUnit(mat,type,w){
 w=w||.6;var g=panelCarcass(mat,w,.78,.58),z=.304;
 put(g,box(w-.10,.09,.44,mat.dark),0,.045,.02);
 if(type==="drawers"){
  for(var i=0;i<3;i++){var hh=.225,yy=.15+i*.235;addFront(g,mat,w,hh,yy,z,mat.cab)}
 }else if(type==="dishwasher"){
  addFront(g,mat,w,.70,.40,z,mat.metal);put(g,box(w*.55,.016,.016,mat.dark),0,.66,z+.024);
 }else if(type==="hob"){
  addFront(g,mat,w,.70,.40,z,mat.cab);
 }else if(type==="sink"){
  addFront(g,mat,w,.70,.40,z,mat.cab);
 }else{
  addFront(g,mat,w,.70,.40,z,mat.cab);
 }
 return g
}
function wallUnit(mat,w,glass){
 w=w||.6;var g=panelCarcass(mat,w,.72,.34),front=glass?mat.glass:mat.cab;
 addFront(g,mat,w,.66,.36,.184,front);
 if(glass){put(g,box(w-.10,.018,.24,mat.wood),0,.24,-.03);put(g,box(w-.10,.018,.24,mat.wood),0,.49,-.03)}
 return g
}
function tallUnit(mat,type){
 var g=panelCarcass(mat,.64,2.2,.62),z=.324;
 if(type==="oven"){
  addFront(g,mat,.64,.58,.34,z,mat.cab);addFront(g,mat,.64,.58,1.86,z,mat.cab);
  put(g,box(.57,.56,.03,mat.appliance),0,1.10,z);put(g,box(.43,.016,.018,mat.metal),0,1.29,z+.025);
 }else if(type==="fridge"){
  addFront(g,mat,.64,1.35,1.47,z,mat.cab);addFront(g,mat,.64,.66,.38,z,mat.cab);
  put(g,box(.016,.58,.018,mat.dark),.22,1.45,z+.024);put(g,box(.016,.24,.018,mat.dark),.22,.38,z+.024);
 }else{
  addFront(g,mat,.64,2.10,1.10,z,mat.cab);put(g,box(.016,.78,.018,mat.dark),.22,1.10,z+.024);
 }
 return g
}
function sinkSet(mat){
 var g=new THREE.Group();put(g,box(.48,.045,.34,mat.metal),0,0,0);
 var curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.17,.01,0),new THREE.Vector3(-.17,.29,0),new THREE.Vector3(-.02,.46,0),new THREE.Vector3(.15,.35,0)]);
 var faucet=new THREE.Mesh(new THREE.TubeGeometry(curve,24,.018,10,false),mat.metal);faucet.castShadow=true;g.add(faucet);return g
}
function hobSet(mat){
 var g=new THREE.Group();put(g,box(.55,.018,.42,mat.appliance),0,0,0);
 for(var i=0;i<4;i++){var ring=new THREE.Mesh(new THREE.TorusGeometry(.07,.006,10,24),mat.dark);ring.rotation.x=Math.PI/2;ring.position.set((i%2?1:-1)*.14,.014,(i>1?1:-1)*.10);g.add(ring)}return g
}
function hoodSet(mat){
 var g=new THREE.Group();put(g,box(.62,.07,.34,mat.metal),0,0,0);put(g,box(.28,.48,.20,mat.metal),0,.25,-.02);put(g,box(.44,.014,.16,mat.dark),0,-.04,.05);return g
}
function clearTwin(){if(!runtime.twin)return;var g=runtime.twin.world;while(g.children.length)g.remove(g.children[0])}
function sideRun(g,mat,L,W,side){var count=Math.max(2,Math.min(4,Math.floor((W-.8)/.62))),grp=new THREE.Group(),len=count*.62,start=-len/2+.31;for(var i=0;i<count;i++)put(grp,baseUnit(mat,i===0?"drawers":"doors",.6),start+i*.62,.12,0);put(grp,box(len+.05,.055,.68,mat.stone),0,.965,0);grp.rotation.y=side>0?-Math.PI/2:Math.PI/2;grp.position.set(side*(L/2-.34),0,-W/2+.34+len/2);g.add(grp)}
function parallelRun(g,mat,L,W){var count=Math.max(3,Math.min(5,Math.floor((L-.8)/.62))),grp=new THREE.Group(),len=count*.62,start=-len/2+.31;for(var i=0;i<count;i++)put(grp,baseUnit(mat,i%2?"doors":"drawers",.6),start+i*.62,.12,0);put(grp,box(len+.05,.055,.68,mat.stone),0,.965,0);grp.rotation.y=Math.PI;grp.position.set(0,0,W/2-.34);g.add(grp)}
function islandRun(g,mat){var grp=new THREE.Group();for(var i=0;i<3;i++)put(grp,baseUnit(mat,i===1?"drawers":"doors",.6),-.62+i*.62,.12,0);put(grp,box(2.02,.06,.9,mat.stone),0,.965,0);grp.position.set(.15,0,.25);g.add(grp)}
function rebuildTwin(){
 if(!runtime.twin)return;clearTwin();
 var g=runtime.twin.world,mat=twinMaterials(),L=Math.max(2.4,state.room.length/100),W=Math.max(2.2,state.room.width/100),H=Math.max(2.3,state.room.height/100),layout=chosen().layout;
 var floor=new THREE.Mesh(new THREE.PlaneGeometry(L+.8,W+.8),mat.floor);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;g.add(floor);
 put(g,box(L,H,.08,mat.wall),0,H/2,-W/2-.04);put(g,box(.08,H,W,mat.wall),L/2+.04,H/2,0);if(layout==="u")put(g,box(.08,H,W,mat.wall),-L/2-.04,H/2,0);
 state.room.markers.forEach(function(m){
  if(m.type==="window"&&m.wall==="north"){var wx=-L/2+L*(m.pos/100);put(g,box(Math.min(1.4,L*.22),1.05,.022,mat.glass),wx,1.65,-W/2+.015);put(g,box(Math.min(1.5,L*.24),.035,.045,mat.dark),wx,1.12,-W/2+.035);put(g,box(Math.min(1.5,L*.24),.035,.045,mat.dark),wx,2.18,-W/2+.035)}
 });
 var types=[];if(state.requirements.appliances.dishwasher)types.push("dishwasher");types.push("sink");if(state.requirements.appliances.hob)types.push("hob");types.push("drawers","doors");
 var len=Math.min(L-.55,types.length*.62),start=-len/2+.31,z=-W/2+.34,sinkX=null,hobX=null;
 types.forEach(function(t,i){var x=start+i*.62;put(g,baseUnit(mat,t,.6),x,.12,z);if(t==="sink")sinkX=x;if(t==="hob")hobX=x});
 put(g,box(len+.08,.055,.70,mat.stone),0,.965,z);put(g,box(len+.03,.09,.48,mat.dark),0,.075,z+.02);put(g,box(len+.02,.62,.025,mat.stone),0,1.30,-W/2+.012);
 if(sinkX!==null)put(g,sinkSet(mat),sinkX,1.005,z);if(hobX!==null){put(g,hobSet(mat),hobX,1.004,z);if(state.requirements.appliances.hood)put(g,hoodSet(mat),hobX,1.88,z+.08)}
 var towerX=-L/2+.34;
 if(state.requirements.storage.tall){put(g,tallUnit(mat,"pantry"),towerX,.12,z);towerX+=.68}
 if(state.requirements.appliances.fridge||state.requirements.appliances.builtInFridge){put(g,tallUnit(mat,"fridge"),towerX,.12,z);towerX+=.68}
 if(state.requirements.appliances.oven){put(g,tallUnit(mat,"oven"),towerX,.12,z)}
 var wc=Math.max(2,Math.min(6,Math.floor(len/.72)));
 for(var i=0;i<wc;i++){var useGlass=state.visual.upper==="glass"||(state.visual.upper==="mixed"&&i%3===1);put(g,wallUnit(mat,.68,useGlass),-len/2+.38+i*.72,1.55,z-.11)}
 if(layout==="l"||layout==="u")sideRun(g,mat,L,W,1);if(layout==="u")sideRun(g,mat,L,W,-1);if(layout==="parallel")parallelRun(g,mat,L,W);if(layout==="island"||(state.requirements.preferences.island&&L>=3.8&&W>=3.3))islandRun(g,mat);
 var pendantMat=new THREE.MeshStandardMaterial({color:0x171815,roughness:.32,metalness:.72});
 if(layout==="island"||state.requirements.preferences.island){[-.45,.15,.75].forEach(function(px){put(g,new THREE.Mesh(new THREE.CylinderGeometry(.12,.22,.22,28,1,true),pendantMat),px,2.45,.25);put(g,box(.012,.55,.012,pendantMat),px,2.78,.25)})}
 runtime.twin.target.set(0,1.1,-.2);
}
function initTwin(){
 if(runtime.twin||!window.THREE)return;var canvas=document.getElementById("keTwin"),wrap=document.getElementById("twinWrap");if(!canvas||!wrap)return;var renderer;
 try{renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,powerPreference:"high-performance"})}catch(e){wrap.innerHTML='<div class="ke-rule warn">المعاينة ثلاثية الأبعاد غير متاحة على هذا الجهاز. المخطط والملخص ما زالا قابلين للاستخدام.</div>';return}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,window.innerWidth<700?1.25:1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.physicallyCorrectLights=true;
 var scene=new THREE.Scene();scene.background=new THREE.Color(0xc9c4ba);scene.environment=envTexture();var camera=new THREE.PerspectiveCamera(34,1,.1,80),world=new THREE.Group();scene.add(world);
 scene.add(new THREE.HemisphereLight(0xf6f2e9,0x5c564e,.62));var sun=new THREE.DirectionalLight(0xfff2df,2.2);sun.position.set(5,8,6);sun.castShadow=true;sun.shadow.mapSize.set(window.innerWidth<700?1024:2048,window.innerWidth<700?1024:2048);scene.add(sun);var fill=new THREE.DirectionalLight(0xd8e8f5,.55);fill.position.set(-5,4,5);scene.add(fill);
 var camGoal=new THREE.Vector3(5,3.2,6),target=new THREE.Vector3(0,1.1,0),drag=false,lx=0,ly=0;camera.position.copy(camGoal);camera.lookAt(target);
 function resize(){renderer.setSize(wrap.clientWidth,wrap.clientHeight,false);camera.aspect=wrap.clientWidth/wrap.clientHeight;camera.updateProjectionMatrix()}window.addEventListener("resize",resize);resize();
 canvas.addEventListener("pointerdown",function(e){drag=true;lx=e.clientX;ly=e.clientY});canvas.addEventListener("pointermove",function(e){if(!drag)return;var dx=(e.clientX-lx)*.004;camGoal.applyAxisAngle(new THREE.Vector3(0,1,0),-dx);ly=e.clientY;lx=e.clientX});canvas.addEventListener("pointerup",function(){drag=false});canvas.addEventListener("pointercancel",function(){drag=false});
 function loop(){requestAnimationFrame(loop);camera.position.lerp(camGoal,.08);camera.lookAt(target);if(!document.hidden)renderer.render(scene,camera)}loop();runtime.twin={renderer:renderer,scene:scene,camera:camera,world:world,camGoal:camGoal,target:target};rebuildTwin();
}
function cameraPreset(name){
 if(!runtime.twin)return;var L=Math.max(2.4,state.room.length/100),W=Math.max(2.2,state.room.width/100),c=runtime.twin.camGoal,t=runtime.twin.target;
 if(name==="hero"){c.set(L*.62,3,W*.78);t.set(0,1.05,-.3)}else if(name==="functional"){c.set(0,2.6,W*.92);t.set(0,.95,-W*.25)}else if(name==="elevation"){c.set(0,1.65,W*.92);t.set(0,1.2,-W*.38)}else if(name==="island"){c.set(-L*.42,2.25,W*.58);t.set(.15,.95,.05)}else if(name==="wide"){c.set(L*.72,3.8,W*.9);t.set(0,1,0)}
}
function togglePresentation(){if(!runtime.twin)return;var b=document.getElementById("presentation"),o=document.getElementById("presentationOverlay"),on=!o.classList.contains("on");o.classList.toggle("on",on);b.classList.toggle("active",on);runtime.twin.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,on?2:(window.innerWidth<700?1.25:1.7)));cameraPreset(on?"hero":"wide");toast(on?"وضع عرض عالي الجودة":"العودة للعرض التفاعلي")}

applyTheme();root.innerHTML=renderPage();bindEvents();hydrate();renderState();document.getElementById("backBtn").disabled=true;
})();