(function(){
"use strict";
var cfg=window.KITCHEN_V5_CONFIG,root=document.getElementById("tafseelKitchenV5");if(!cfg||!root)return;
var STORAGE="tafseel-matabekh-riyadh:v5:project";
var layoutLabels={straight:"مستقيم",l:"حرف L",u:"حرف U",parallel:"متوازي",island:"جزيرة",unsure:"غير متأكد"};
var projectLabels={new:"مطبخ جديد",renovation:"تجديد مطبخ قائم",explore:"استكشاف أولي"};
var cabinetLabels={ivory:"فاتح مطفي",oak:"خشبي فاتح",walnut:"خشبي داكن",sage:"محايد هادئ",graphite:"فحمي",white:"فاتح ساتان"};
var baseModuleLabels={doors:"وحدة باب",drawers:"وحدة أدراج",sink:"وحدة حوض",hob:"وحدة موقد",dishwasher:"غسالة صحون"};
var tallModuleLabels={pantry:"تخزين طويل",fridge:"ثلاجة",oven:"برج فرن"};
var interiorLabels={shelves:"رفوف",internalDrawers:"أدراج داخلية"};
var configTabLabels={configuration:"التكوين",cabinet:"الواجهات",worktop:"السطح",upper:"العلوية",modules:"الوحدات",details:"التفاصيل"};
var worktopLabels={quartz:"سطح فاتح",veined:"فاتح بعروق",warm:"اتجاه دافئ",dark:"اتجاه داكن"};
var storageLabels={pantry:"مؤن",tall:"تخزين طويل",deepDrawers:"أدراج عميقة",corner:"حل للزاوية",waste:"نفايات وفرز",coffee:"منطقة أجهزة صغيرة"};
var cookingLabels={light:"طبخ خفيف",daily:"طبخ يومي",heavy:"استخدام مكثف"};
var userLabels={"1-2":"1–2","3-4":"3–4","5+":"5+"};
var applianceLabels={fridge:"ثلاجة",oven:"فرن",dishwasher:"غسالة صحون",hob:"موقد",hood:"شفاط",microwave:"مايكرويف"};
var handleLabels={integrated:"مخفي / مدمج",linear:"خطي بسيط",classic:"مقبض ظاهر"};
var upperLabels={mixed:"مغلق + زجاج",closed:"مغلق",glass:"زجاج",open:"رفوف مفتوحة"};
var sinkLabels={existing:"حوض موجود",new:"حوض جديد",unsure:"غير متأكد"};
var followLabels={whatsapp:"اتصال بالرقم الرسمي",later:"أراجع المشروع أولاً"};
var markerLabels={door:"باب",window:"نافذة",column:"عمود",water:"مياه",drain:"صرف",electric:"كهرباء",vent:"تهوية"};
var wallLabels={north:"الجدار الرئيسي",east:"الجدار الأيمن",south:"الجدار المقابل",west:"الجدار الأيسر"};
var defaults={
 version:5,phase:1,maxPhase:1,
 project:{type:"",city:"",measurementMode:"",note:""},
 room:{length:420,width:320,height:280,heightTouched:false,layout:"",markers:[]},
 visual:{cabinet:"ivory",worktop:"veined",upper:"mixed",handle:"integrated",saved:false,explicit:{cabinet:false,worktop:false,upper:false,handle:false}},
 details:{storage:{pantry:false,tall:false,deepDrawers:false,corner:false,waste:false,coffee:false},appliances:{fridge:false,oven:false,dishwasher:false,hob:false,hood:false,microwave:false},storageExplicit:{},applianceExplicit:{},sink:"unsure",users:"",cooking:"",storageTouched:false,applianceTouched:false,configSynced:false,reviewed:false},
 review:{confirmed:false,followUp:"whatsapp"},
 contact:{name:""},
 config:{seeded:false,layout:"",baseSlots:[],tallSlots:[],originBaseSlots:[],originTallSlots:[],explicit:{layout:false,base:{},tall:{},pantryInterior:false},selected:"base:0",pantryInterior:"shelves",inspect:false,activeTab:"configuration"},
 meta:{createdAt:Date.now(),updatedAt:Date.now(),projectCode:""}
};
var QUALIFIED_BRIEF_KPI="completed qualified briefs / actual design-service starts";
var runtime={phase:1,maxPhase:1,refFile:null,refData:"",hero:null,studio:null,instances:[],raf:0,assetCache:{},assetWait:{},textureCache:{},hdr:null,hdrLoading:false,hdrWait:[],configUndo:[],suspendHistory:false};
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
function emit(n,d){try{dispatchEvent(new CustomEvent("tafseel-matabekh-riyadh-v5:"+n,{detail:d||{}}))}catch(e){}}
function toast(msg){var e=document.getElementById("toast");if(!e)return;e.textContent=msg;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(function(){e.classList.remove("show")},1700)}
function activeKeys(o){return Object.keys(o).filter(function(k){return !!o[k]})}
function assetUrl(url){
 var base=window.DAKH_ASSET_BASE||"";
 if(base&&url&&url.charAt(0)==="/")return base.replace(/\/$/,"")+url;
 return url
}
function projectCode(){
 if(!state.meta||typeof state.meta!=="object")state.meta={createdAt:Date.now(),updatedAt:Date.now(),projectCode:""};
 if(state.meta.projectCode)return state.meta.projectCode;
 var raw="tafseel-matabekh-riyadh:"+String(state.meta.createdAt||Date.now()),h=2166136261;
 for(var i=0;i<raw.length;i++){h^=raw.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24)}
 state.meta.projectCode="TM-"+((h>>>0).toString(36).toUpperCase()+"000000").slice(0,6);return state.meta.projectCode
}
function knownMeasurements(){return state.project.measurementMode==="known"}
function roomText(){return knownMeasurements()?state.room.length+" × "+state.room.width+" × "+state.room.height+" سم":"القياسات غير متوفرة حالياً"}
function effectiveLayout(){return state.config&&state.config.layout?state.config.layout:(state.room.layout&&state.room.layout!=="unsure"?state.room.layout:"l")}
function effectiveRoom(){return{length:knownMeasurements()?state.room.length:420,width:knownMeasurements()?state.room.width:320,height:knownMeasurements()?state.room.height:280}}
function roomCanSupportIsland(){var r=effectiveRoom();return r.length>=340&&r.width>=300}
function hasPlausibleIsland(){return effectiveLayout()==="island"&&roomCanSupportIsland()}
function effectiveLabel(){return state.room.layout?layoutLabels[state.room.layout]:"لم يتم الاختيار بعد"}
function defaultTallSlots(){
 var L=Math.max(2.6,effectiveRoom().length/100),slots=[];
 if(state.details&&state.details.storage&&(state.details.storage.pantry||state.details.storage.tall))slots.push("pantry");
 if(state.details&&state.details.appliances&&state.details.appliances.fridge)slots.push("fridge");
 if(state.details&&state.details.appliances&&state.details.appliances.oven)slots.push("oven");
 if(!slots.length)slots.push("fridge");
 if(L>=4.8&&slots.length<2)slots.push("oven");
 return slots.slice(0,L>=4.8?2:1)
}
function defaultBaseSlots(tallSlots){
 var L=Math.max(2.6,effectiveRoom().length/100),towerWidth=(tallSlots||defaultTallSlots()).length*.68,available=Math.max(1.86,L-towerWidth-.42),count=Math.max(3,Math.min(6,Math.floor(available/.62))),slots;
 if(count<=3)slots=["sink","hob","drawers"];
 else if(count===4)slots=["drawers","sink","dishwasher","hob"];
 else if(count===5)slots=["drawers","sink","dishwasher","hob","doors"];
 else slots=["doors","drawers","sink","dishwasher","hob","drawers"];
 return slots.slice(0,count)
}
function ensureConfigurator(force){
 if(!state.config||typeof state.config!=="object")state.config=clone(defaults.config);
 if(!state.config.explicit||typeof state.config.explicit!=="object")state.config.explicit={layout:false,base:{},tall:{},pantryInterior:false};
 if(!state.config.explicit.base)state.config.explicit.base={};if(!state.config.explicit.tall)state.config.explicit.tall={};
 if(force||!state.config.seeded||!Array.isArray(state.config.baseSlots)||!state.config.baseSlots.length){
  var tall=defaultTallSlots(),base=defaultBaseSlots(tall);state.config.tallSlots=tall;state.config.baseSlots=base;state.config.originTallSlots=tall.slice();state.config.originBaseSlots=base.slice();state.config.explicit={layout:false,base:{},tall:{},pantryInterior:false};state.config.seeded=true;state.config.inspect=false;state.config.selected="base:0"
 }
 if(!Array.isArray(state.config.tallSlots))state.config.tallSlots=defaultTallSlots();
 if(!Array.isArray(state.config.originBaseSlots)||!state.config.originBaseSlots.length)state.config.originBaseSlots=(state.config.baseSlots||[]).slice();
 if(!Array.isArray(state.config.originTallSlots))state.config.originTallSlots=(state.config.tallSlots||[]).slice();
 if(!state.config.activeTab||!configTabLabels[state.config.activeTab])state.config.activeTab="configuration";
 if(!state.config.pantryInterior||!interiorLabels[state.config.pantryInterior])state.config.pantryInterior="shelves";
 if(state.config.layout==="island"&&!hasPlausibleIsland())state.config.layout="";
 if(!state.config.selected)state.config.selected="base:0";
 ensureBriefProvenance()
}
function syncConfigDetails(){
 if(!state.config)return;var b=state.config.baseSlots||[],t=state.config.tallSlots||[];
 state.details.appliances.dishwasher=b.indexOf("dishwasher")>=0;
 state.details.appliances.hob=b.indexOf("hob")>=0;
 state.details.appliances.hood=b.indexOf("hob")>=0;
 state.details.appliances.fridge=t.indexOf("fridge")>=0;
 state.details.appliances.oven=t.indexOf("oven")>=0;
 state.details.storage.deepDrawers=b.indexOf("drawers")>=0;
 state.details.storage.tall=t.length>0;
 state.details.storage.pantry=t.indexOf("pantry")>=0
}
function resetConfiguratorForRoom(){if(!state.config)return;state.config.seeded=false;state.config.layout="";state.config.inspect=false;state.config.selected="base:0";state.config.explicit={layout:false,base:{},tall:{},pantryInterior:false};state.config.originBaseSlots=[];state.config.originTallSlots=[]}
function ensureBriefProvenance(){
 if(!state.visual.explicit||typeof state.visual.explicit!=="object")state.visual.explicit={cabinet:false,worktop:false,upper:false,handle:false};
 if(!state.details.storageExplicit||typeof state.details.storageExplicit!=="object")state.details.storageExplicit={};
 if(!state.details.applianceExplicit||typeof state.details.applianceExplicit!=="object")state.details.applianceExplicit={};
 if(!state.config.explicit||typeof state.config.explicit!=="object")state.config.explicit={layout:false,base:{},tall:{},pantryInterior:false};
 if(!state.config.explicit.base)state.config.explicit.base={};if(!state.config.explicit.tall)state.config.explicit.tall={};
 if(!Array.isArray(state.config.originBaseSlots))state.config.originBaseSlots=(state.config.baseSlots||[]).slice();
 if(!Array.isArray(state.config.originTallSlots))state.config.originTallSlots=(state.config.tallSlots||[]).slice();
 if(typeof state.room.heightTouched!=="boolean")state.room.heightTouched=false
}
function sourceValue(value,label,source){return{value:value,label:label,source:source}}
function configSlotExplicit(kind,index){ensureBriefProvenance();var map=kind==="tall"?state.config.explicit.tall:state.config.explicit.base;return !!map[String(index)]}
function configChanged(){ensureBriefProvenance();return !!state.config.explicit.layout||Object.keys(state.config.explicit.base).some(function(k){return state.config.explicit.base[k]})||Object.keys(state.config.explicit.tall).some(function(k){return state.config.explicit.tall[k]})||!!state.config.explicit.pantryInterior}
function applianceConfigEvidence(key){
 ensureConfigurator();var kind=(key==="fridge"||key==="oven")?"tall":"base",type=key==="hood"?"hob":key;
 if(["fridge","oven","dishwasher","hob","hood"].indexOf(key)<0)return{present:false,explicitPresent:false,explicitRemoved:false};
 var cur=kind==="tall"?state.config.tallSlots:state.config.baseSlots,org=kind==="tall"?state.config.originTallSlots:state.config.originBaseSlots,emap=kind==="tall"?state.config.explicit.tall:state.config.explicit.base;
 var present=false,explicitPresent=false,explicitRemoved=false;
 cur.forEach(function(v,i){if(v===type){present=true;if(emap[String(i)])explicitPresent=true}});
 org.forEach(function(v,i){if(v===type&&emap[String(i)]&&cur[i]!==type)explicitRemoved=true});
 return{present:present,explicitPresent:explicitPresent,explicitRemoved:explicitRemoved}
}
function storageConfigEvidence(key){
 ensureConfigurator();var b=state.config.baseSlots||[],t=state.config.tallSlots||[],eb=state.config.explicit.base||{},et=state.config.explicit.tall||{},ob=state.config.originBaseSlots||[],ot=state.config.originTallSlots||[];
 var types=key==="deepDrawers"?["drawers"]:key==="pantry"||key==="tall"?["pantry"]:[],present=false,explicitPresent=false,explicitRemoved=false;
 if(!types.length)return{present:false,explicitPresent:false,explicitRemoved:false};
 b.forEach(function(v,i){if(types.indexOf(v)>=0){present=true;if(eb[String(i)])explicitPresent=true}});t.forEach(function(v,i){if(types.indexOf(v)>=0){present=true;if(et[String(i)])explicitPresent=true}});
 ob.forEach(function(v,i){if(types.indexOf(v)>=0&&eb[String(i)]&&types.indexOf(b[i])<0)explicitRemoved=true});ot.forEach(function(v,i){if(types.indexOf(v)>=0&&et[String(i)]&&types.indexOf(t[i])<0)explicitRemoved=true});
 return{present:present,explicitPresent:explicitPresent,explicitRemoved:explicitRemoved}
}
function resolveAppliance(key){
 ensureBriefProvenance();var ev=applianceConfigEvidence(key),explicitReq=!!state.details.applianceExplicit[key];
 if(ev.explicitPresent)return{present:true,source:"customer_selected"};
 if(explicitReq)return{present:!!state.details.appliances[key],source:"customer_selected"};
 if(ev.present)return{present:true,source:"prototype_default"};
 if(state.details.appliances[key])return{present:true,source:state.details.applianceTouched?"customer_selected":"derived_from_configuration"};
 return{present:false,source:"unknown"}
}
function resolveStorage(key){
 ensureBriefProvenance();var ev=storageConfigEvidence(key),explicitReq=!!state.details.storageExplicit[key];
 if(ev.explicitPresent)return{present:true,source:"customer_selected"};
 if(explicitReq)return{present:!!state.details.storage[key],source:"customer_selected"};
 if(ev.present)return{present:true,source:"prototype_default"};
 if(state.details.storage[key])return{present:true,source:state.details.storageTouched?"customer_selected":"derived_from_configuration"};
 return{present:false,source:"unknown"}
}
function briefDimensionText(){
 if(!knownMeasurements())return"القياسات النهائية غير متوفرة بعد";
 var d=state.room.length+" × "+state.room.width;return d+(state.room.heightTouched?" × "+state.room.height:"")+" سم تقريباً"
}
function roomConstraintLines(){return(state.room.markers||[]).map(function(m){return(markerLabels[m.type]||m.type)+" — "+(wallLabels[m.wall]||m.wall)})}
function configurationUnits(kind){
 ensureConfigurator();var arr=kind==="tall"?state.config.tallSlots:state.config.baseSlots,labels=kind==="tall"?tallModuleLabels:baseModuleLabels,out=[];
 arr.forEach(function(type,i){
  var appliance=["fridge","oven","dishwasher","hob"].indexOf(type)>=0?resolveAppliance(type):null;
  if(appliance&&!appliance.present&&!configSlotExplicit(kind,i))return;
  if(type==="pantry"){var sr=resolveStorage("pantry");if(!sr.present&&!configSlotExplicit(kind,i))return}
  out.push({type:type,label:labels[type]||type,source:configSlotExplicit(kind,i)?"customer_selected":"prototype_default"})
 });return out
}
function briefKnown(brief){
 var a=[];if(brief.space.layout.source==="customer_selected"&&brief.space.layout.value!=="unsure")a.push("شكل المطبخ: "+brief.space.layout.label);
 if(brief.space.dimensions.known)a.push("القياسات التقريبية: "+brief.space.dimensions.label);
 if(state.visual.saved)a.push("الاتجاه البصري محفوظ للمراجعة");
 if(brief.usage.users.label)a.push("الاستخدام: "+brief.usage.users.label+(brief.usage.cooking.label?" · "+brief.usage.cooking.label:""));
 if(brief.usage.storageNeeds.length)a.push("أولوية التخزين: "+brief.usage.storageNeeds.map(function(x){return x.label}).join("، "));
 return a.slice(0,5)
}
function briefNeedsConfirmation(){
 var a=["القياس الموقعي النهائي"];if(!(state.room.markers||[]).length)a.push("مواقع الخدمات والفتحات");a.push("الخامات والعينات النهائية","تفاصيل التصنيع وتوافق الأجهزة","عرض السعر","مدة التنفيذ");return a
}
function briefExtraAppliances(brief){
 var represented={};brief.configuration.mainUnits.concat(brief.configuration.tallUnits).forEach(function(x){if(["fridge","oven","dishwasher","hob"].indexOf(x.type)>=0)represented[x.type]=true});
 return brief.usage.appliances.filter(function(x){return !represented[x.key]})
}
function canonicalBrief(){
 ensureConfigurator();ensureBriefProvenance();
 var mainUnits=configurationUnits("base"),tallUnits=configurationUnits("tall"),storage=[],appliances=[];
 Object.keys(storageLabels).forEach(function(k){var r=resolveStorage(k);if(r.present)storage.push({key:k,label:storageLabels[k],source:r.source})});
 Object.keys(applianceLabels).forEach(function(k){var r=resolveAppliance(k);if(r.present)appliances.push({key:k,label:applianceLabels[k],source:r.source})});
 var layoutSource=state.config.explicit.layout?"customer_selected":(state.room.layout&&state.room.layout!=="unsure"?"customer_selected":"prototype_default"),layoutValue=state.config.layout||(state.room.layout||"unsure"),layoutLabel=state.config.layout?layoutLabels[state.config.layout]:(state.room.layout&&state.room.layout!=="unsure"?layoutLabels[state.room.layout]:"غير متأكد");
 var visualSource=function(k){return state.visual.explicit[k]?"customer_selected":(state.visual.saved?"customer_approved_preliminary":"prototype_default")};
 var brief={
  project:{code:projectCode(),projectType:sourceValue(state.project.type,state.project.type?projectLabels[state.project.type]:"غير محدد",state.project.type?"customer_selected":"unknown")},
  space:{layout:sourceValue(layoutValue,layoutLabel,layoutSource),dimensions:{known:knownMeasurements(),label:briefDimensionText(),source:knownMeasurements()?"customer_entered":"unknown"},measurementStatus:knownMeasurements()?"قياسات تقريبية من العميل":"القياسات النهائية غير متوفرة بعد",optionalConstraints:roomConstraintLines()},
  configuration:{status:configChanged()?"تكوين مبدئي بعد تعديلاتك":"تكوين مبدئي مقترح",layoutDirection:sourceValue(effectiveLayout(),configLayoutLabel(),layoutSource),mainUnits:mainUnits,tallUnits:tallUnits,upperDirection:sourceValue(state.visual.upper,upperLabels[state.visual.upper],visualSource("upper")),handleDirection:sourceValue(state.visual.handle,handleLabels[state.visual.handle],visualSource("handle")),pantryInterior:sourceValue(state.config.pantryInterior,interiorLabels[state.config.pantryInterior],state.config.explicit.pantryInterior?"customer_selected":"prototype_default")},
  visual:{status:"اتجاه بصري تمهيدي",cabinetDirection:sourceValue(state.visual.cabinet,cabinetLabels[state.visual.cabinet],visualSource("cabinet")),worktopDirection:sourceValue(state.visual.worktop,worktopLabels[state.visual.worktop],visualSource("worktop"))},
  usage:{users:sourceValue(state.details.users,state.details.users?userLabels[state.details.users]+" أشخاص":"",state.details.users?"customer_selected":"unknown"),cooking:sourceValue(state.details.cooking,state.details.cooking?cookingLabels[state.details.cooking]:"",state.details.cooking?"customer_selected":"unknown"),storageNeeds:storage,appliances:appliances,sink:sourceValue(state.details.sink,sinkLabels[state.details.sink],state.details.sink!=="unsure"?"customer_selected":"unknown")},
  customer:{name:state.contact.name.trim(),city:state.project.city.trim(),note:state.project.note.trim(),fileReference:!!runtime.refFile},
  review:{known:[],needsConfirmation:briefNeedsConfirmation()}
 };brief.review.known=briefKnown(brief);return brief
}
function briefQuality(brief){
 if(!state.room.layout||state.room.layout==="unsure")return{state:"ready_with_note",label:"يمكن الإرسال الآن",note:"إضافة شكل المطبخ ستجعل الملخص أوضح."};
 if(!brief.space.dimensions.known)return{state:"ready_with_note",label:"جاهز للمراجعة الأولية",note:"القياس النهائي سيتم تأكيده مع الفريق."};
 return{state:"ready",label:"جاهز للمراجعة الأولية",note:"القياس والخامات والتفاصيل النهائية تعتمد مع فريق تفصيل مطابخ."}
}
function canonicalBriefText(){
 var b=canonicalBrief(),q=briefQuality(b),lines=["طلب مطبخ مبدئي — تفصيل مطابخ","رقم المشروع: "+b.project.code,"","المشروع: "+b.project.projectType.label,"المساحة: "+b.space.layout.label+" · "+b.space.dimensions.label];
 if(b.customer.city)lines.push("الموقع: "+b.customer.city);
 lines.push("","التكوين المبدئي: "+b.configuration.status);
 if(b.configuration.mainUnits.length)lines.push("الوحدات الرئيسية: "+b.configuration.mainUnits.map(function(x){return x.label}).join("، "));
 if(b.configuration.tallUnits.length)lines.push("الوحدات الطويلة: "+b.configuration.tallUnits.map(function(x){return x.label}).join("، "));
 if(b.configuration.tallUnits.some(function(x){return x.type==="pantry"}))lines.push("تقسيم المؤن: "+b.configuration.pantryInterior.label);
 lines.push("العلوية والمقابض: "+b.configuration.upperDirection.label+" · "+b.configuration.handleDirection.label,"","الاتجاه البصري: "+b.visual.cabinetDirection.label+" · "+b.visual.worktopDirection.label);
 var use=[];if(b.usage.users.label)use.push(b.usage.users.label);if(b.usage.cooking.label)use.push(b.usage.cooking.label);if(use.length)lines.push("الاستخدام: "+use.join(" · "));
 if(b.usage.storageNeeds.length)lines.push("التخزين: "+b.usage.storageNeeds.map(function(x){return x.label}).join("، "));
 var extraApps=briefExtraAppliances(b);if(extraApps.length)lines.push("الأجهزة الإضافية: "+extraApps.map(function(x){return x.label}).join("، "));
 if(b.customer.name)lines.push("الاسم: "+b.customer.name);if(b.customer.note)lines.push("ملاحظة: "+b.customer.note);if(b.customer.fileReference)lines.push("مرجع للمراجعة: لدي مخطط/صورة للمساحة وسيتم إرفاقها يدوياً.");
 lines.push("","يحتاج تأكيداً: "+b.review.needsConfirmation.slice(0,4).join(" · "),q.note);return lines.join("\n")
}
function copyProjectBrief(){var txt=canonicalBriefText();copyText(txt,"تم نسخ ملخص المشروع")}
function copyText(txt,msg){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(function(){toast(msg||"تم النسخ")}).catch(function(){fallbackCopyText(txt,msg)});else fallbackCopyText(txt,msg)}
function fallbackCopyText(txt,msg){var t=document.createElement("textarea");t.value=txt;document.body.appendChild(t);t.select();try{document.execCommand("copy");toast(msg||"تم النسخ")}catch(e){toast("تعذر النسخ")}t.remove()}


function configSnapshot(){return{config:clone(state.config),visual:clone(state.visual)}}
function pushConfigUndo(){runtime.configUndo.push(configSnapshot());if(runtime.configUndo.length>12)runtime.configUndo.shift()}
function restoreConfigSnapshot(v){if(!v)return;state.config=clone(v.config);state.visual=clone(v.visual);state.review.confirmed=false}
function configLayoutLabel(){if(state.config&&state.config.layout)return layoutLabels[state.config.layout];return state.room.layout==="unsure"?"حرف L — توضيحي":layoutLabels[effectiveLayout()]}
function configurationSummary(){
 ensureConfigurator();var b=(state.config.baseSlots||[]).map(function(k){return baseModuleLabels[k]||k}),t=(state.config.tallSlots||[]).map(function(k){return tallModuleLabels[k]||k});
 return{layout:configLayoutLabel(),base:b.join(" + "),tall:t.length?t.join(" + "):"بدون وحدة طويلة",interior:t.indexOf("pantry")>=0?interiorLabels[state.config.pantryInterior]:"—"}
}
function syncRequirementsFromConfig(){
 if(state.details.configSynced)return;ensureConfigurator();var b=state.config.baseSlots||[],t=state.config.tallSlots||[];
 if(!state.details.applianceTouched){
  state.details.appliances.fridge=t.indexOf("fridge")>=0;
  state.details.appliances.oven=t.indexOf("oven")>=0;
  state.details.appliances.dishwasher=b.indexOf("dishwasher")>=0;
  state.details.appliances.hob=b.indexOf("hob")>=0
 }
 if(!state.details.storageTouched){
  state.details.storage.deepDrawers=b.indexOf("drawers")>=0;
  state.details.storage.pantry=t.indexOf("pantry")>=0;
  state.details.storage.tall=t.indexOf("pantry")>=0
 }
 state.details.configSynced=true
}
function selectedLabels(obj,labels){return activeKeys(obj).map(function(k){return labels[k]}).filter(Boolean)}
function requirementSummary(kind){
 if(kind==="usage"){var a=[];if(state.details.cooking)a.push(cookingLabels[state.details.cooking]);if(state.details.users)a.push(userLabels[state.details.users]+" مستخدمين");return a.length?a.join(" · "):"اختياري — يمكنك المتابعة بدون اختيار"}
 if(kind==="storage"){var s=selectedLabels(state.details.storage,storageLabels);return s.length?s.join("، "):"لا توجد احتياجات إضافية محددة"}
 if(kind==="appliances"){var ap=selectedLabels(state.details.appliances,applianceLabels);return ap.length?ap.join("، "):"لم تُحدد أجهزة إضافية"}
 return sinkLabels[state.details.sink]||"غير متأكد"
}
function choiceCard(label,key,on,attr){return'<button type="button" class="reqChoice '+(on?"active":"")+'" data-'+attr+'="'+key+'"><span>'+safe(label)+'</span></button>'}
function customerGroups(){
 var b=canonicalBrief(),use=[],storage=b.usage.storageNeeds.map(function(x){return x.label}),apps=briefExtraAppliances(b).map(function(x){return x.label});
 if(b.usage.users.label)use.push(b.usage.users.label);if(b.usage.cooking.label)use.push(b.usage.cooking.label);
 return[
  {title:"المساحة",phase:1,lines:[b.space.layout.label,b.space.dimensions.label].concat(b.customer.city?[b.customer.city]:[])},
  {title:"التكوين المبدئي",phase:2,lines:[b.configuration.status,b.configuration.mainUnits.length?b.configuration.mainUnits.map(function(x){return x.label}).join("، "):"يحتاج تأكيد الوحدات",b.configuration.tallUnits.length?"طويلة: "+b.configuration.tallUnits.map(function(x){return x.label}).join("، ")+(b.configuration.tallUnits.some(function(x){return x.type==="pantry"})?" · تقسيم المؤن: "+b.configuration.pantryInterior.label:""):""]},
  {title:"الاتجاه البصري",phase:2,lines:[b.visual.cabinetDirection.label+" · "+b.visual.worktopDirection.label,"العلوية: "+b.configuration.upperDirection.label+" · المقابض: "+b.configuration.handleDirection.label]},
  {title:"احتياجات الاستخدام",phase:3,lines:[use.length?use.join(" · "):"لم تُضف تفضيلات استخدام",storage.length?"التخزين: "+storage.join("، "):""]},
  {title:"الأجهزة",phase:3,lines:[apps.length?apps.join("، "):"الأجهزة المطلوبة ممثلة في التكوين"]},
  {title:"ملاحظات العميل",phase:5,lines:[b.customer.name?b.customer.name:"الاسم اختياري",b.customer.note?b.customer.note:"لا توجد ملاحظة إضافية"]}
 ]
}
function reviewStatusText(){return briefQuality(canonicalBrief()).label}
function renderGroupCards(targetId){
 var e=document.getElementById(targetId);if(!e)return;e.innerHTML=customerGroups().map(function(g){var lines=g.lines.filter(Boolean),field=g.phase===5?"customerName":"";return'<article class="journeyGroup"><div><h4>'+safe(g.title)+'</h4><button type="button" class="journeyEdit" data-editphase="'+g.phase+'" '+(field?'data-editfield="'+field+'" ':'')+'>تعديل</button></div>'+lines.slice(0,3).map(function(x){return'<p>'+safe(x)+'</p>'}).join("")+'</article>'}).join("")
}


function selectedConfig(){
 ensureConfigurator();var p=String(state.config.selected||"base:0").split(":"),kind=p[0],index=Math.max(0,Number(p[1])||0),list=kind==="tall"?state.config.tallSlots:state.config.baseSlots;
 if(index>=list.length)index=0;return{kind:kind,index:index,type:list[index],id:kind+":"+index}
}
function compatibleBaseTypes(type){if(type==="sink")return["sink"];if(type==="hob")return["hob"];if(type==="dishwasher")return["dishwasher","drawers","doors"];return["doors","drawers"]}
function configOption(label,key,active,attr,disabled){return'<button type="button" class="configOption '+(active?"active":"")+'" data-'+attr+'="'+key+'" '+(disabled?"disabled":"")+'>'+safe(label)+'</button>'}
function configPanel(){
 ensureConfigurator();var tab=state.config.activeTab,sel=selectedConfig(),html="";
 if(tab==="configuration"){
  var layouts=["straight","l","u","parallel","island"];html='<div class="configPanelHead"><b>تكوين مبدئي</b><span>ابدأ بالاتجاه الحالي ثم عدّل ما يفيد جلسة التصميم.</span></div><div class="configChoices">'+layouts.map(function(k){var blocked=k==="island"&&!roomCanSupportIsland();return configOption(layoutLabels[k],k,effectiveLayout()===k,"configlayout",blocked)}).join("")+'</div>';
  if(state.room.layout==="unsure"&&!state.config.layout)html+='<p class="configNote">تم عرض حرف L كتكوين توضيحي فقط لأن الشكل النهائي غير محدد.</p>'
 }else if(tab==="cabinet"){
  html='<div class="configPanelHead"><b>واجهات الخزائن</b><span>اتجاهات بصرية تجريبية للمقارنة فقط، وليست مواد أو كتالوجاً معتمداً من المنشأة.</span></div><div class="configMaterialGrid">'+Object.keys(cabinetLabels).map(function(k){return'<button type="button" class="materialTile '+(state.visual.cabinet===k?"active":"")+'" data-cabinet="'+k+'"><i style="--sw:'+({ivory:"#d9d1c4",oak:"#a47d56",walnut:"#594033",sage:"#858881",graphite:"#3b3f3b",white:"#efeee8"}[k])+'"></i><span>'+safe(cabinetLabels[k])+'</span></button>'}).join("")+'</div>'
 }else if(tab==="worktop"){
  html='<div class="configPanelHead"><b>سطح العمل</b><span>اختيار بصري أولي للمراجعة مع المصمم.</span></div><div class="configMaterialGrid">'+Object.keys(worktopLabels).map(function(k){return'<button type="button" class="materialTile '+(state.visual.worktop===k?"active":"")+'" data-worktop="'+k+'"><i style="--sw:'+({quartz:"#e4e0d7",veined:"#ece8df",warm:"#aa9c87",dark:"#4d4c48"}[k])+'"></i><span>'+safe(worktopLabels[k])+'</span></button>'}).join("")+'</div>'
 }else if(tab==="upper"){
  html='<div class="configPanelHead"><b>الخزائن العلوية</b><span>غيّر الاتجاه وشاهد التكوين مباشرة.</span></div><div class="configChoices">'+Object.keys(upperLabels).map(function(k){return configOption(upperLabels[k],k,state.visual.upper===k,"upper",false)}).join("")+'</div>'
 }else if(tab==="modules"){
  var base=state.config.baseSlots||[],tall=state.config.tallSlots||[],types=sel.kind==="tall"?["pantry","fridge","oven"]:compatibleBaseTypes(sel.type);
  html='<div class="configPanelHead"><b>الوحدات</b><span>خيارات تمهيدية لتوضيح الفكرة — استبدال داخل مواقع محددة فقط.</span></div><div class="slotSection"><small>الجدار الرئيسي</small><div class="slotStrip">'+base.map(function(k,i){return'<button type="button" class="slot '+(sel.id==="base:"+i?"active":"")+'" data-configslot="base:'+i+'"><b>'+(i+1)+'</b><span>'+safe(baseModuleLabels[k])+'</span></button>'}).join("")+'</div></div>';
  if(tall.length)html+='<div class="slotSection"><small>وحدات طويلة</small><div class="slotStrip">'+tall.map(function(k,i){return'<button type="button" class="slot '+(sel.id==="tall:"+i?"active":"")+'" data-configslot="tall:'+i+'"><b>'+(i+1)+'</b><span>'+safe(tallModuleLabels[k])+'</span></button>'}).join("")+'</div></div>';
  html+='<div class="replaceBox"><span>الوحدة المحددة: <b>'+safe(sel.kind==="tall"?tallModuleLabels[sel.type]:baseModuleLabels[sel.type])+'</b></span><div class="configChoices">'+types.map(function(k){return configOption(sel.kind==="tall"?tallModuleLabels[k]:baseModuleLabels[k],k,sel.type===k,"configreplace",false)}).join("")+'</div>';
  if((sel.type==="sink"||sel.type==="hob")&&sel.kind==="base")html+='<p class="configNote">هذا الموقع الوظيفي ثابت في النموذج التمهيدي لتجنب تكوين غير منطقي.</p>';
  html+='</div>'
 }else{
  var pantryIndex=(state.config.tallSlots||[]).indexOf("pantry"),pantrySelected=sel.kind==="tall"&&sel.type==="pantry";
  html='<div class="configPanelHead"><b>التفاصيل</b><span>اختر فقط ما يظهر بوضوح في المعاينة.</span></div><div class="detailGroup"><small>اتجاه المقابض</small><div class="configChoices">'+Object.keys(handleLabels).map(function(k){return configOption(handleLabels[k],k,state.visual.handle===k,"handle",false)}).join("")+'</div></div>';
  if(pantryIndex>=0){
   html+='<div class="detailGroup"><small>تقسيم التخزين الطويل</small><div class="configChoices">'+Object.keys(interiorLabels).map(function(k){return configOption(interiorLabels[k],k,state.config.pantryInterior===k,"interior",false)}).join("")+'</div><button type="button" id="inspectUnit" class="inspectBtn '+(state.config.inspect?"active":"")+'">'+(state.config.inspect?"إغلاق عرض التقسيم":"شاهد التقسيم الداخلي")+'</button></div>'
  }else html+='<p class="configNote">اختر «تخزين طويل» من تبويب الوحدات لتجربة عرض داخلي مبسط.</p>'
 }
 return html
}
function configTabsHtml(){return Object.keys(configTabLabels).map(function(k){return'<button type="button" class="'+(state.config.activeTab===k?"active":"")+'" data-configtab="'+k+'">'+configTabLabels[k]+'</button>'}).join("")}

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
function heroSwatch(key,color,type,label){var active=(type==="cabinet"?state.visual.cabinet:state.visual.worktop)===key;return'<button class="heroSwatch '+(active?"active":"")+'" type="button" data-'+type+'="'+key+'" aria-label="'+safe(label)+'"><i style="--sw:'+color+'"></i><span>'+safe(label)+'</span></button>'}
function page(){
 var phases=["المساحة والتخطيط","الشكل واللون","الخزائن والتفاصيل","المراجعة والخطوة التالية","التواصل والمراجعة"];
 return'<header class="topbar"><div class="shell nav"><div class="brand"><div class="brandMark">م</div><div class="brandText"><b>'+safe(cfg.brand)+'</b><small>'+safe(cfg.legalName)+'</small></div></div><button class="topCta" id="headerStart">ابدأ مشروعك</button></div></header>'+
 '<section class="hero"><div class="shell heroGrid"><div><div class="eyebrow">'+safe(cfg.labels.heroEyebrow)+'</div><h1>'+safe(cfg.labels.heroTitle).replace(/\n/g,"<br>")+'</h1><p class="heroLead">'+safe(cfg.labels.heroBody)+'</p><div class="heroBenefits"><div><small>01</small><b>رتّب المساحة بسرعة</b></div><div><small>02</small><b>جرّب اتجاهاً في 3D</b></div><div><small>03</small><b>أرسل ملخصاً واحداً</b></div></div><div class="heroActions"><button class="btnPrimary" id="heroStart">ابدأ مشروعك</button><button class="btnSecondary" id="hero3d">جرّب 3D الآن</button></div><p class="heroTruth">'+safe(cfg.disclaimers.visual)+'</p></div>'+
 '<div class="hero3dBlock"><div class="heroVisual" id="heroWrap" role="button" tabindex="0" aria-label="اسحب أفقياً لتدوير المطبخ، أو اضغط لفتح الاستوديو"><canvas id="heroCanvas"></canvas><div class="heroVisualTop"><span>اسحب أفقياً لتغيير الزاوية</span><b>3D مباشر</b></div><div class="heroState"><span id="heroLayout">نموذج توضيحي</span><span id="heroDims">المقاسات بعد إدخالها</span><span id="heroFinish">'+safe(cabinetLabels[state.visual.cabinet])+'</span></div></div><div class="heroQuickControls"><div class="heroQuickGroup"><b>واجهات</b><div>'+heroSwatch("ivory","#d9d1c4","cabinet","عاجي")+heroSwatch("oak","#a47d56","cabinet","خشبي")+heroSwatch("graphite","#3b3f3b","cabinet","فحمي")+'</div></div><div class="heroQuickGroup"><b>سطح</b><div>'+heroSwatch("veined","#ece8df","worktop","فاتح")+heroSwatch("warm","#aa9c87","worktop","دافئ")+heroSwatch("dark","#4d4c48","worktop","داكن")+'</div></div><p>اتجاهات بصرية تجريبية فقط — وليست كتالوج خامات رسمي.</p></div></div></div></section>'+
 '<section class="truthStrip"><div class="shell truthGrid"><article><small>1</small><b>ابدأ بما تعرفه</b><p>نوع المشروع، الشكل، والقياسات التقريبية فقط.</p></article><article><small>2</small><b>شاهد الاتجاه بصرياً</b><p>انتقل سريعاً إلى معاينة 3D التفاعلية.</p></article><article><small>3</small><b>رتّب التفاصيل لاحقاً</b><p>الخزائن والأجهزة تظهر بعد المكافأة البصرية.</p></article><article><small>4</small><b>ملخص واحد للمصمم</b><p>اختيارات المشروع تبقى مجمعة للمراجعة.</p></article></div></section>'+
 '<main class="planner" id="planner"><div class="shell"><div class="phaseProgress" id="phaseProgress"><div class="phaseProgressTop"><span class="phaseCount"><b id="phaseNumber">1</b> / 5</span><strong id="phaseTitle">'+phases[0]+'</strong><i class="phaseTrack" aria-hidden="true"><i id="phaseBarFill"></i></i></div><ol>'+phases.map(function(p,i){return'<li data-phase="'+(i+1)+'"><button type="button" data-jump="'+(i+1)+'"><span>'+(i+1)+'</span><b>'+p+'</b></button></li>'}).join("")+'</ol></div>'+
 stage1()+stage2()+stage3()+stage4()+stage5()+'</div></main>'+
 '<div class="bottomNav"><div class="shell bottomInner"><button class="backBtn" id="backBtn">السابق</button><div class="progressText" id="progressText">المرحلة 1 من 5</div><button class="nextBtn" id="nextBtn">التالي: الشكل واللون</button></div></div>'+
 '<footer class="footer"><div class="shell"><b>'+safe(cfg.brand)+'</b> — '+safe(cfg.disclaimers.visual)+' '+safe(cfg.disclaimers.materials)+'</div></footer><div class="toast" id="toast"></div>';
}
function stage1(){
 var layouts=["straight","l","u","parallel","island","unsure"],notes={straight:"جدار واحد",l:"جداران متصلان",u:"ثلاثة جوانب",parallel:"صفّان متقابلان",island:"جزيرة أو شبه جزيرة",unsure:"يحدده المصمم لاحقاً"};
 return'<section class="stage" data-stage="1"><div class="stageHead"><div><div class="stageEyebrow">01 — المساحة والتخطيط</div><h2>ثلاثة اختيارات ثم انتقل إلى 3D.</h2></div><p>حدد نقطة البداية، شكل المطبخ، وهل لديك قياسات تقريبية.</p></div><div class="paper phaseOnePaper">'+
 '<div class="section"><div class="sectionTitle"><b>نوع المشروع</b><span>ما نقطة البداية؟</span></div><div class="choiceGrid">'+choice(projectLabels.new,"new",state.project.type==="new","projecttype")+choice(projectLabels.renovation,"renovation",state.project.type==="renovation","projecttype")+choice(projectLabels.explore,"explore",state.project.type==="explore","projecttype")+'</div><div class="error" id="errProject"></div></div>'+
 '<div class="section"><div class="sectionTitle"><b>شكل المطبخ الأقرب</b><span>اختر «غير متأكد» إذا أردت تأكيده لاحقاً.</span></div><div class="layoutGrid compactLayouts">'+layouts.map(function(k){return'<button class="layoutChoice '+(state.room.layout===k?"active":"")+'" type="button" data-layout="'+k+'">'+layoutSketch(k)+'<b>'+layoutLabels[k]+'</b><small>'+notes[k]+'</small></button>'}).join("")+'</div><div class="error" id="errLayout"></div></div>'+
 '<div class="section"><div class="sectionTitle"><b>القياسات التقريبية</b><span>'+safe(cfg.disclaimers.measurement)+'</span></div><div class="choiceGrid measureChoices"><button class="choice '+(state.project.measurementMode==="known"?"active":"")+'" type="button" data-measuremode="known">لدي قياسات تقريبية</button><button class="choice '+(state.project.measurementMode==="unknown"?"active":"")+'" type="button" data-measuremode="unknown">غير متأكد / أحتاج قياساً</button></div><div class="error" id="errMeasureMode"></div><div id="measurementPanel">'+measurementFields()+'</div></div>'+
 '<details class="optionalDetails"><summary><span><b>تفاصيل إضافية للمساحة</b><small>اختياري — الارتفاع، الفتحات ونقاط الخدمات</small></span><i>+</i></summary><div class="optionalDetailsBody"><div class="section"><div class="sectionTitle"><b>ارتفاع السقف التقريبي <small class="optionalTag">اختياري</small></b></div><div class="field"><label>الارتفاع بالسم</label><input id="roomHeight" type="number" inputmode="numeric" min="220" max="450" step="5" value="'+state.room.height+'"></div></div><div class="section" id="markersSection"><div class="sectionTitle"><b>فتحات ونقاط مهمة <small class="optionalTag">اختياري</small></b><span>أضف فقط ما تعرفه الآن.</span></div><div class="choiceGrid markerChoices">'+Object.keys(markerLabels).map(function(k){return'<button class="choice" type="button" data-addmarker="'+k+'">+ '+markerLabels[k]+'</button>'}).join("")+'</div><div id="markerList" style="display:grid;gap:8px;margin-top:12px"></div></div></div></details>'+
 '</div></section>'
}
function measurementFields(){
 if(state.project.measurementMode==="unknown")return'<div class="notice compactNotice" style="margin-top:12px">سنستخدم نموذجاً توضيحياً، ويؤكد فريق التصميم القياس لاحقاً.</div>';
 if(state.project.measurementMode!=="known")return"";
 return'<div class="fieldGrid coreMeasurements" style="margin-top:12px"><div class="field"><label>الطول التقريبي</label><input id="roomLength" type="number" inputmode="numeric" min="200" max="1200" step="5" value="'+state.room.length+'"></div><div class="field"><label>العرض التقريبي</label><input id="roomWidth" type="number" inputmode="numeric" min="180" max="1000" step="5" value="'+state.room.width+'"></div></div><div class="error" id="errDims"></div>'
}
function stage2(){
 ensureConfigurator();
 return'<section class="stage" data-stage="2"><div class="stageHead"><div><div class="stageEyebrow">02 — الشكل واللون</div><h2>كوّن اتجاه مطبخك بصرياً.</h2></div><p>غيّر التكوين والخامات، ثم استخدم الاتجاه في طلبك.</p></div>'+
 '<div class="studio configuratorStudio"><div class="studioHead"><div><small>استوديو التكوين التفاعلي</small><h3>تكوين مبدئي لمشروعك</h3></div><span class="studioState" id="studioState">'+safe(configLayoutLabel())+'</span></div>'+
 '<div class="configuratorGrid"><div class="configViewerColumn"><div class="viewer" id="studioWrap"><canvas id="studioCanvas"></canvas><div class="viewerLabel" id="viewerLabel">نموذج توضيحي</div><div class="viewerHint">اسحب أفقياً للدوران</div><div class="viewerDisclaimer">خيارات تمهيدية؛ يعتمد القياس والخامة والتفاصيل النهائية مع فريق التصميم.</div></div><div class="cameraBar" aria-label="زوايا المعاينة"><button class="active" data-camera="hero">منظور رئيسي</button><button data-camera="functional">منظور عملي</button><button data-camera="elevation">واجهة</button><button data-camera="island">الجزيرة</button><button data-camera="wide">المشهد الكامل</button></div></div>'+
 '<aside class="configuratorControls"><div class="configToolbar"><span>خيارات تمهيدية لتوضيح الفكرة</span><div><button type="button" id="undoConfig">تراجع</button><button type="button" id="resetConfig">العودة للتكوين المقترح</button></div></div><div class="configTabs">'+configTabsHtml()+'</div><div class="configPanel" id="configPanel">'+configPanel()+'</div></aside></div>'+
 '<div class="phase2Hint"><span>كل تغيير يظهر مباشرة في المعاينة.</span><b id="phase2SavedState">'+(state.visual.saved?"الاتجاه محفوظ":"")+'</b></div><div class="error phase2Error" id="errVisual"></div></div></section>'
}
function stage3(){
 return'<section class="stage" data-stage="3"><div class="stageHead"><div><div class="stageEyebrow">03 — الخزائن والتفاصيل</div><h2>أخبر المصمم بما يهمك في الاستخدام.</h2></div><p>كل ما هنا اختياري؛ افتح المجموعة التي تريد تعديلها فقط.</p></div><div class="paper requirementsPaper">'+
 '<details class="requirementGroup" data-reqgroup="usage" open><summary><span><b>استخدام المطبخ</b><small>'+safe(requirementSummary("usage"))+'</small></span><i>تعديل</i></summary><div class="requirementBody"><div class="reqSub"><b>نمط الطبخ <small class="optionalTag">اختياري</small></b><div class="reqChoices">'+Object.keys(cookingLabels).map(function(k){return choiceCard(cookingLabels[k],k,state.details.cooking===k,"cookingchoice")}).join("")+'</div></div><div class="reqSub"><b>عدد المستخدمين <small class="optionalTag">اختياري</small></b><div class="reqChoices">'+Object.keys(userLabels).map(function(k){return choiceCard(userLabels[k],k,state.details.users===k,"userchoice")}).join("")+'</div></div></div></details>'+
 '<details class="requirementGroup" data-reqgroup="storage"><summary><span><b>احتياجات التخزين</b><small>'+safe(requirementSummary("storage"))+'</small></span><i>تعديل</i></summary><div class="requirementBody"><p class="inheritNote">بدأنا بما ظهر في تكوينك؛ عدّل فقط إذا احتجت.</p><div class="toggleGrid">'+Object.keys(storageLabels).map(function(k){return toggle(storageLabels[k],k,state.details.storage[k],"storage")}).join("")+'</div></div></details>'+
 '<details class="requirementGroup" data-reqgroup="appliances"><summary><span><b>الأجهزة</b><small>'+safe(requirementSummary("appliances"))+'</small></span><i>تعديل</i></summary><div class="requirementBody"><p class="inheritNote">الأجهزة الموجودة في التكوين محددة مسبقاً ويمكن تعديلها.</p><div class="toggleGrid">'+Object.keys(applianceLabels).map(function(k){return toggle(applianceLabels[k],k,state.details.appliances[k],"appliance")}).join("")+'</div></div></details>'+
 '<details class="requirementGroup" data-reqgroup="extra"><summary><span><b>تفاصيل إضافية</b><small>الحوض أو صورة للمساحة — اختياري</small></span><i>تعديل</i></summary><div class="requirementBody"><div class="reqSub"><b>الحوض <small class="optionalTag">اختياري</small></b><div class="reqChoices">'+Object.keys(sinkLabels).map(function(k){return choiceCard(sinkLabels[k],k,state.details.sink===k,"sinkchoice")}).join("")+'</div></div><div class="reqSub"><b>عندك مخطط أو صورة للمساحة؟ <small class="optionalTag">اختياري</small></b><p class="inheritNote">أضفها للمراجعة. تبقى على جهازك؛ أرفقها يدوياً عند فتح واتساب.</p><div class="refUpload"><input id="refFile" type="file" accept="image/jpeg,image/png,image/webp,application/pdf"><label for="refFile">إضافة صورة أو PDF</label><small>JPG · PNG · WEBP · PDF</small><div id="filePreview"></div></div></div></div></details>'+
 '</div><div class="error" id="errDetails"></div></section>'
}
function stage4(){
 return'<section class="stage" data-stage="4"><div class="stageHead"><div><div class="stageEyebrow">04 — المراجعة والخطوة التالية</div><h2>راجع مشروعك قبل التواصل.</h2></div><p>ما اخترته واضح هنا، وما يحتاج تأكيداً يراجعه فريق تفصيل مطابخ.</p></div>'+
 '<div class="reviewStatus"><div><small>مشروعك حتى الآن</small><h3 id="reviewStatusText">'+safe(reviewStatusText())+'</h3><p id="reviewStatusNote">'+safe(briefQuality(canonicalBrief()).note)+'</p></div><span class="projectCode">'+projectCode()+'</span></div>'+
 '<div class="journeyGroups" id="reviewGroups"></div>'+
 '<div class="reviewGrid compactReview"><article class="reviewBlock"><small>أصبح واضحاً</small><h3>جاهز للمصمم</h3><ul id="knownList"></ul></article><article class="reviewBlock"><small>يحتاج تأكيداً مع فريق تفصيل مطابخ</small><h3>يُحسم بعد المراجعة</h3><ul id="confirmList"></ul></article></div>'+
 '<div class="error" id="errReview"></div></section>'
}
function stage5(){
 return'<section class="stage" data-stage="5"><div class="stageHead"><div><div class="stageEyebrow">05 — التواصل والمراجعة</div><h2>مشروعك جاهز للمراجعة الأولية.</h2></div><p>راجع الملخص، عدّل ما تحتاجه، ثم استخدم وسيلة التواصل الرسمية.</p></div><div class="briefGrid"><div>'+
 '<div class="paper contactPaper"><div class="contactGrid"><div class="field"><label>الاسم <small class="optionalTag">اختياري</small></label><input id="customerName" value="'+safe(state.contact.name)+'" placeholder="الاسم"></div><div class="field"><label>المدينة / الحي <small class="optionalTag">اختياري</small></label><input id="city" value="'+safe(state.project.city)+'" placeholder="مثال: الرياض"></div></div><div class="field noteField"><label>ملاحظة للمصمم <small class="optionalTag">اختياري</small></label><textarea id="projectNote" placeholder="مثال: أولوية للتخزين ومساحة التحضير">'+safe(state.project.note)+'</textarea></div></div>'+
 '<div class="summaryPaper compactSummary briefDocument" style="margin-top:14px"><div class="summaryTop"><div><small>ملخص المشروع</small><h3 id="briefQualityLabel">'+safe(briefQuality(canonicalBrief()).label)+'</h3></div><div class="projectCode">'+projectCode()+'</div></div><div class="journeyGroups" id="summaryGroups"></div><div class="briefTruth"><h4>يحتاج تأكيداً مع الفريق</h4><p id="briefNeedsText">'+safe(canonicalBrief().review.needsConfirmation.join(" · "))+'</p></div></div></div>'+
 '<aside class="handoffAside"><div class="qualityCard"><small>حالة الطلب</small><h3 id="briefQualityAside">'+safe(briefQuality(canonicalBrief()).label)+'</h3><p id="briefQualityNote">'+safe(briefQuality(canonicalBrief()).note)+'</p></div><div class="whatsappPanel"><div><small>ملخص جاهز للتواصل</small><h3>ملخص المشروع</h3><p>يمكنك نسخ الملخص ثم الاتصال بالرقم الرسمي المنشور.</p></div><pre class="waPreview" id="waPreview"></pre><a class="waButton" id="waButton" target="_blank" rel="noopener">اتصال بالرقم الرسمي ←</a><button class="shareButton" id="copyBrief">نسخ ملخص المشروع</button><button class="shareButton" id="shareProject">نسخ رابط المشروع</button></div></aside></div></section>'
}
function validatePhase(n,show){
 var errors=[];
 if(n===1){
  if(!state.project.type)errors.push(["errProject","اختر نوع المشروع للمتابعة."]);
  else if(!state.room.layout)errors.push(["errLayout","اختر شكل المطبخ أو «غير متأكد»."]);
  else if(!state.project.measurementMode)errors.push(["errMeasureMode","حدد هل لديك قياسات تقريبية."]);
  else if(state.project.measurementMode==="known"&&!(state.room.length>=200&&state.room.length<=1200&&state.room.width>=180&&state.room.width<=1000))errors.push(["errDims","راجع الطول والعرض التقريبيين."])
 }
 if(n===2&&!state.visual.saved)errors.push(["errVisual","استخدم هذا الاتجاه في طلبك للمتابعة."]);
 if(show){["errProject","errLayout","errMeasureMode","errDims","errVisual","errDetails","errReview"].forEach(function(id){var e=document.getElementById(id);if(e)e.textContent=""});if(errors.length){var x=errors[0],e=document.getElementById(x[0]);if(e){e.textContent=x[1];e.scrollIntoView({behavior:"smooth",block:"center"})}}}
 return errors.length===0
}
function goPhase(n,mode){
 n=Math.max(1,Math.min(5,n));if(n>runtime.maxPhase)return;if(n===3)syncRequirementsFromConfig();runtime.phase=n;state.phase=n;save();renderDynamic();
 if(!runtime.suspendHistory){var method=mode==="replace"?"replaceState":"pushState";history[method]({phase:n},"",location.pathname+"#phase-"+n)}runtime.suspendHistory=false;
 if(n===2){initStudio();setTimeout(function(){syncAll3D();if(runtime.studio&&runtime.studio.cameraMode==="hero")cameraPreset(runtime.studio,"hero");updateCameraControls()},50)}
 document.getElementById("phaseProgress").scrollIntoView({behavior:"smooth",block:"start"});emit("phase",{phase:n,code:projectCode()})
}
function nextPhase(){
 if(runtime.phase===2&&!state.visual.saved){state.visual.saved=true;runtime.maxPhase=Math.max(runtime.maxPhase,3)}
 if(runtime.phase===3){state.details.reviewed=true;runtime.maxPhase=Math.max(runtime.maxPhase,4)}
 if(runtime.phase===4){state.review.confirmed=true;state.review.followUp="whatsapp";runtime.maxPhase=Math.max(runtime.maxPhase,5)}
 if(!validatePhase(runtime.phase,true)){renderDynamic();return}
 if(runtime.phase<5){runtime.maxPhase=Math.max(runtime.maxPhase,runtime.phase+1);state.maxPhase=runtime.maxPhase;save();goPhase(runtime.phase+1)}else{save()}
}
function previousPhase(){if(runtime.phase>1)goPhase(runtime.phase-1)}
function readiness(){return state.review.confirmed?100:(state.visual.saved?75:50)}
function knownItems(){return canonicalBrief().review.known}
function confirmItems(){return canonicalBrief().review.needsConfirmation.slice(0,6)}
function whatsappSummary(){
 var b=canonicalBrief(),q=briefQuality(b),lines=["طلب مطبخ مبدئي — تفصيل مطابخ","رقم المشروع: "+b.project.code,"","المساحة: "+b.space.layout.label+" · "+b.space.dimensions.label];
 if(b.customer.city)lines.push("الموقع: "+b.customer.city);
 var config=[];if(b.configuration.mainUnits.length)config.push(b.configuration.mainUnits.map(function(x){return x.label}).join("، "));if(b.configuration.tallUnits.length)config.push(b.configuration.tallUnits.map(function(x){return x.label}).join("، "));
 if(config.length){lines.push("","التكوين:");lines.push(config.join(" | "));if(b.configuration.tallUnits.some(function(x){return x.type==="pantry"}))lines.push("تقسيم المؤن: "+b.configuration.pantryInterior.label)}
 lines.push("","الاتجاه: "+b.visual.cabinetDirection.label+" · "+b.visual.worktopDirection.label+" · علوية "+b.configuration.upperDirection.label+" · "+b.configuration.handleDirection.label);
 var use=[];if(b.usage.users.label)use.push(b.usage.users.label);if(b.usage.cooking.label)use.push(b.usage.cooking.label);if(b.usage.storageNeeds.length)use.push("تخزين: "+b.usage.storageNeeds.map(function(x){return x.label}).join("، "));if(use.length)lines.push("الاستخدام: "+use.join(" · "));
 var extraApps=briefExtraAppliances(b);if(extraApps.length)lines.push("الأجهزة: "+extraApps.map(function(x){return x.label}).join("، "));
 if(b.customer.name)lines.push("العميل: "+b.customer.name);if(b.customer.note)lines.push("ملاحظة: "+b.customer.note);if(b.customer.fileReference)lines.push("مرجع: لدي مخطط/صورة للمساحة وسيتم إرفاقها يدوياً.");
 lines.push("يحتاج تأكيداً: "+b.review.needsConfirmation.slice(0,4).join(" · "),q.note);return lines.join("\n")
}
function whatsappUrl(){return"tel:+"+cfg.phone}
function shareUrl(){var clean=clone(state);clean.phase=runtime.phase;clean.maxPhase=runtime.maxPhase;return location.origin+location.pathname+"?project="+encodeState(clean)+"#phase-"+runtime.phase}
function copyShare(){copyText(shareUrl(),"تم نسخ رابط المشروع")}
function fallbackCopy(u){fallbackCopyText(u,"تم نسخ رابط المشروع")}
function markerRows(){
 var e=document.getElementById("markerList");if(!e)return;if(!state.room.markers.length){e.innerHTML='<div class="notice">لم تضف أي فتحات أو نقاط خدمات — وهذا طبيعي إذا لم تكن تعرفها الآن.</div>';return}
 e.innerHTML=state.room.markers.map(function(m){return'<div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;align-items:center;border:1px solid #d8d3c9;background:#fff;padding:9px"><b style="font-size:9px;color:#143c32">'+markerLabels[m.type]+'</b><select data-markerwall="'+m.id+'" style="border:1px solid #d8d3c9;padding:7px;font-size:9px">'+Object.keys(wallLabels).map(function(w){return'<option value="'+w+'" '+(m.wall===w?"selected":"")+'>'+wallLabels[w]+'</option>'}).join("")+'</select><input type="range" min="5" max="95" value="'+m.pos+'" data-markerpos="'+m.id+'"><button type="button" data-delmarker="'+m.id+'" style="border:0;background:#eee7dc;padding:7px 10px">×</button></div>'}).join("");
}
function summaryGroups(){renderGroupCards("summaryGroups")}
function viewerStateLabel(){if(!state.room.layout||state.room.layout==="unsure")return"نموذج توضيحي — شكل المساحة يحتاج تأكيد المصمم";if(!knownMeasurements())return"نموذج توضيحي — القياسات غير متوفرة";return roomText()}
function syncVisualControls(){document.querySelectorAll("[data-cabinet]").forEach(function(x){x.classList.toggle("active",x.dataset.cabinet===state.visual.cabinet)});document.querySelectorAll("[data-worktop]").forEach(function(x){x.classList.toggle("active",x.dataset.worktop===state.visual.worktop)});document.querySelectorAll("[data-upper]").forEach(function(x){x.classList.toggle("active",x.dataset.upper===state.visual.upper)});document.querySelectorAll("[data-handle]").forEach(function(x){x.classList.toggle("active",x.dataset.handle===state.visual.handle)})}
function syncRequirementControls(){
 document.querySelectorAll("[data-cookingchoice]").forEach(function(x){x.classList.toggle("active",x.dataset.cookingchoice===state.details.cooking)});
 document.querySelectorAll("[data-userchoice]").forEach(function(x){x.classList.toggle("active",x.dataset.userchoice===state.details.users)});
 document.querySelectorAll("[data-sinkchoice]").forEach(function(x){x.classList.toggle("active",x.dataset.sinkchoice===state.details.sink)});
 document.querySelectorAll("[data-storage]").forEach(function(x){x.classList.toggle("active",!!state.details.storage[x.dataset.storage])});
 document.querySelectorAll("[data-appliance]").forEach(function(x){x.classList.toggle("active",!!state.details.appliances[x.dataset.appliance])});
 document.querySelectorAll(".requirementGroup").forEach(function(g){var sm=g.querySelector("summary small");if(sm)sm.textContent=g.dataset.reqgroup==="extra"?"الحوض أو صورة للمساحة — اختياري":requirementSummary(g.dataset.reqgroup)})
}

function updateCameraControls(){var hasIsland=hasPlausibleIsland();document.querySelectorAll("[data-camera]").forEach(function(x){var island=x.dataset.camera==="island";x.hidden=island&&!hasIsland;x.disabled=island&&!hasIsland;x.classList.toggle("active",!!runtime.studio&&runtime.studio.cameraMode===x.dataset.camera)})}function renderDynamic(){
 ensureConfigurator();save();
 document.body.dataset.phase=String(runtime.phase);
 document.querySelectorAll(".stage").forEach(function(e){e.classList.toggle("active",Number(e.dataset.stage)===runtime.phase)});
 var names=["المساحة والتخطيط","الشكل واللون","الخزائن والتفاصيل","المراجعة والخطوة التالية","التواصل والمراجعة"];
 document.getElementById("phaseNumber").textContent=runtime.phase;document.getElementById("phaseTitle").textContent=names[runtime.phase-1];document.getElementById("progressText").textContent="المرحلة "+runtime.phase+" من 5";var pbf=document.getElementById("phaseBarFill");if(pbf)pbf.style.width=(runtime.phase*20)+"%";
 document.querySelectorAll(".phaseProgress li").forEach(function(li,i){li.dataset.active=(i+1===runtime.phase)?"true":"false";li.dataset.complete=(i+1<runtime.phase)?"true":"false";var b=li.querySelector("button");b.disabled=i+1>runtime.maxPhase});
 var next=["التالي: الشكل واللون","استخدم هذا الاتجاه في طلبي","التالي: مراجعة المشروع","تابع للتواصل",""];var nb=document.getElementById("nextBtn");nb.textContent=next[runtime.phase-1];nb.hidden=runtime.phase===5;document.getElementById("backBtn").disabled=runtime.phase===1;document.getElementById("backBtn").style.opacity=runtime.phase===1?".45":"1";
 var mm=document.getElementById("measurementPanel");if(mm)mm.innerHTML=measurementFields();markerRows();
 var cp=document.getElementById("configPanel");if(cp)cp.innerHTML=configPanel();var tabs=document.querySelector(".configTabs");if(tabs)tabs.innerHTML=configTabsHtml();
 var vf=document.getElementById("viewerLabel");if(vf)vf.textContent=viewerStateLabel();var ss=document.getElementById("studioState");if(ss)ss.textContent=configLayoutLabel()+" · "+(knownMeasurements()?state.room.length+" × "+state.room.width+" سم":"قياسات غير مؤكدة");
 var ps=document.getElementById("phase2SavedState");if(ps)ps.textContent=state.visual.saved?"الاتجاه محفوظ":"";
 var brief=canonicalBrief(),quality=briefQuality(brief),kl=document.getElementById("knownList"),cl=document.getElementById("confirmList");if(kl)kl.innerHTML=brief.review.known.map(function(x){return"<li>"+safe(x)+"</li>"}).join("");if(cl)cl.innerHTML=brief.review.needsConfirmation.slice(0,6).map(function(x){return"<li>"+safe(x)+"</li>"}).join("");
 renderGroupCards("reviewGroups");summaryGroups();var wp=document.getElementById("waPreview"),wb=document.getElementById("waButton");if(wp)wp.textContent=whatsappSummary();if(wb)wb.href=whatsappUrl();
 var rs=document.getElementById("reviewStatusText"),rn=document.getElementById("reviewStatusNote"),bq=document.getElementById("briefQualityLabel"),bqa=document.getElementById("briefQualityAside"),bqn=document.getElementById("briefQualityNote"),bnt=document.getElementById("briefNeedsText");if(rs)rs.textContent=quality.label;if(rn)rn.textContent=quality.note;if(bq)bq.textContent=quality.label;if(bqa)bqa.textContent=quality.label;if(bqn)bqn.textContent=quality.note;if(bnt)bnt.textContent=brief.review.needsConfirmation.join(" · ");
 var hl=document.getElementById("heroLayout"),hd=document.getElementById("heroDims"),hf=document.getElementById("heroFinish");if(hl)hl.textContent=configLayoutLabel();if(hd)hd.textContent=knownMeasurements()?state.room.length+" × "+state.room.width+" سم":"أدخل المقاسات أو تابع بدونها";if(hf)hf.textContent=cabinetLabels[state.visual.cabinet];
 syncVisualControls();syncRequirementControls();updateCameraControls();syncAll3D()
}
function handleFile(file){
 runtime.refFile=null;runtime.refData="";var box=document.getElementById("filePreview");if(!file){if(box)box.innerHTML="";return}
 var ok=/^(image\/jpeg|image\/png|image\/webp|application\/pdf)$/.test(file.type)&&file.size<=12*1024*1024;if(!ok){toast("استخدم JPG أو PNG أو WEBP أو PDF حتى 12MB.");var inp=document.getElementById("refFile");if(inp)inp.value="";return}
 runtime.refFile=file;if(file.type.indexOf("image/")===0){var r=new FileReader();r.onload=function(){runtime.refData=r.result;if(box)box.innerHTML='<div class="fileCard"><img src="'+r.result+'" alt=""><div><b>'+safe(file.name)+'</b><small>أرفقه يدوياً عند التواصل مع الفريق.</small></div></div>';renderDynamic()};r.readAsDataURL(file)}else if(box)box.innerHTML='<div class="fileCard"><div style="width:58px;height:58px;display:grid;place-items:center;background:#143c32;color:#fff;font-weight:900">PDF</div><div><b>'+safe(file.name)+'</b><small>أرفقه يدوياً عند التواصل مع الفريق.</small></div></div>'
}
function invalidateVisual(){state.visual.saved=false;state.review.confirmed=false;runtime.maxPhase=Math.min(runtime.maxPhase,runtime.phase<=1?1:2);state.maxPhase=runtime.maxPhase}
function invalidateDetails(){state.details.reviewed=false;state.review.confirmed=false;runtime.maxPhase=Math.min(runtime.maxPhase,3);state.maxPhase=runtime.maxPhase}
function open3DStudio(){runtime.maxPhase=Math.max(runtime.maxPhase,2);state.maxPhase=runtime.maxPhase;save();goPhase(2);setTimeout(function(){var studio=document.querySelector('[data-stage="2"] .studio');if(studio)studio.scrollIntoView({behavior:"smooth",block:"start"})},120)}
function bind(){
 root.addEventListener("click",function(ev){var t=ev.target&&ev.target.closest?ev.target.closest("button,a"):null;if(!t)return;
  if(t.id==="headerStart"||t.id==="heroStart"){runtime.maxPhase=Math.max(runtime.maxPhase,1);goPhase(1);return}
  if(t.id==="hero3d"){open3DStudio();return}
  if(t.dataset.jump){var n=Number(t.dataset.jump);if(n<=runtime.maxPhase){goPhase(n);if(t.dataset.editfield)setTimeout(function(){var el=document.getElementById(t.dataset.editfield);if(el){el.scrollIntoView({behavior:"smooth",block:"center"});el.focus()}},90)}return}
  if(t.dataset.projecttype){state.project.type=t.dataset.projecttype;state.review.confirmed=false;renderDynamic();return}
  if(t.dataset.layout){var had=state.config&&state.config.seeded&&runtime.maxPhase>1;state.room.layout=t.dataset.layout;resetConfiguratorForRoom();invalidateVisual();renderDynamic();if(had)toast("تغيّر شكل المطبخ؛ حدّثنا التكوين المبدئي ليتوافق مع المساحة.");return}
  if(t.dataset.measuremode){var hm=state.config&&state.config.seeded&&runtime.maxPhase>1;state.project.measurementMode=t.dataset.measuremode;resetConfiguratorForRoom();invalidateVisual();renderDynamic();if(hm)toast("تغيّرت حالة القياس؛ حدّثنا التكوين المبدئي فقط.");return}
  if(t.dataset.addmarker){state.room.markers.push({id:"m"+Date.now().toString(36),type:t.dataset.addmarker,wall:"north",pos:50});invalidateVisual();renderDynamic();return}
  if(t.dataset.delmarker){state.room.markers=state.room.markers.filter(function(m){return m.id!==t.dataset.delmarker});invalidateVisual();renderDynamic();return}
  if(t.dataset.configtab){state.config.activeTab=t.dataset.configtab;save();renderDynamic();return}
  if(t.dataset.configlayout){if(t.disabled)return;pushConfigUndo();var requested=t.dataset.configlayout;if(requested==="island"&&!roomCanSupportIsland())return;state.config.layout=requested;state.config.seeded=false;ensureConfigurator(true);state.config.layout=requested;state.config.explicit.layout=true;invalidateVisual();renderDynamic();return}
  if(t.dataset.configslot){state.config.selected=t.dataset.configslot;state.config.inspect=false;renderDynamic();return}
  if(t.dataset.configreplace){
    ensureConfigurator();var sel=selectedConfig();pushConfigUndo();
    if(sel.kind==="base"){var allowed=compatibleBaseTypes(sel.type);if(allowed.indexOf(t.dataset.configreplace)<0)return;state.config.baseSlots[sel.index]=t.dataset.configreplace;state.config.explicit.base[String(sel.index)]=true}
    else{var nx=t.dataset.configreplace,other=state.config.tallSlots.indexOf(nx);if(other>=0&&other!==sel.index){var old=state.config.tallSlots[sel.index];state.config.tallSlots[other]=old;state.config.explicit.tall[String(other)]=true}state.config.tallSlots[sel.index]=nx;state.config.explicit.tall[String(sel.index)]=true;state.config.inspect=false}
    state.details.configSynced=false;invalidateVisual();renderDynamic();return
  }
  if(t.dataset.interior){pushConfigUndo();state.config.pantryInterior=t.dataset.interior;state.config.explicit.pantryInterior=true;invalidateVisual();renderDynamic();return}
  if(t.id==="inspectUnit"){var pantry=(state.config.tallSlots||[]).indexOf("pantry");if(pantry<0)return;state.config.selected="tall:"+pantry;state.config.inspect=!state.config.inspect;invalidateVisual();renderDynamic();return}
  if(t.id==="undoConfig"){var last=runtime.configUndo.pop();if(!last){toast("لا يوجد تغيير للتراجع");return}restoreConfigSnapshot(last);renderDynamic();return}
  if(t.id==="resetConfig"){if(!window.confirm("العودة للتكوين المبدئي مع الاحتفاظ ببقية بيانات المشروع؟"))return;pushConfigUndo();var tab=state.config.activeTab;state.config=clone(defaults.config);state.config.activeTab=tab;ensureConfigurator(true);state.details.configSynced=false;invalidateVisual();renderDynamic();return}
  if(t.dataset.cabinet){if(runtime.phase===2)pushConfigUndo();state.visual.cabinet=t.dataset.cabinet;state.visual.explicit.cabinet=true;invalidateVisual();stopAutoPresentation(runtime.hero);renderDynamic();return}
  if(t.dataset.worktop){if(runtime.phase===2)pushConfigUndo();state.visual.worktop=t.dataset.worktop;state.visual.explicit.worktop=true;invalidateVisual();stopAutoPresentation(runtime.hero);renderDynamic();return}
  if(t.dataset.upper){if(runtime.phase===2)pushConfigUndo();state.visual.upper=t.dataset.upper;state.visual.explicit.upper=true;invalidateVisual();renderDynamic();return}
  if(t.dataset.handle){if(runtime.phase===2)pushConfigUndo();state.visual.handle=t.dataset.handle;state.visual.explicit.handle=true;invalidateVisual();renderDynamic();return}
  if(t.dataset.cookingchoice){state.details.cooking=t.dataset.cookingchoice;invalidateDetails();renderDynamic();return}
  if(t.dataset.userchoice){state.details.users=t.dataset.userchoice;invalidateDetails();renderDynamic();return}
  if(t.dataset.sinkchoice){state.details.sink=t.dataset.sinkchoice;invalidateDetails();renderDynamic();return}
  if(t.dataset.storage){var sk=t.dataset.storage;state.details.storageTouched=true;state.details.storageExplicit[sk]=true;state.details.storage[sk]=!state.details.storage[sk];invalidateDetails();renderDynamic();return}
  if(t.dataset.appliance){var ak=t.dataset.appliance;state.details.applianceTouched=true;state.details.applianceExplicit[ak]=true;state.details.appliances[ak]=!state.details.appliances[ak];invalidateDetails();renderDynamic();return}
  if(t.dataset.editphase){var ep=Number(t.dataset.editphase);goPhase(ep);if(t.dataset.editfield)setTimeout(function(){var el=document.getElementById(t.dataset.editfield);if(el){el.scrollIntoView({behavior:"smooth",block:"center"});el.focus()}},80);return}
  if(t.dataset.camera){cameraPreset(runtime.studio,t.dataset.camera);updateCameraControls();return}
  if(t.id==="copyBrief"){copyProjectBrief();return}
  if(t.id==="shareProject"){copyShare();return}
  if(t.id==="waButton"){
    var earliest=0;if(!validatePhase(1,false))earliest=1;else if(!state.visual.saved)earliest=2;else if(!state.details.reviewed)earliest=3;else if(!state.review.confirmed)earliest=4;
    if(earliest){ev.preventDefault();runtime.maxPhase=Math.max(runtime.maxPhase,earliest);state.maxPhase=runtime.maxPhase;goPhase(earliest);toast("راجع هذه المرحلة قبل الاتصال");return}
  }
 });
 root.addEventListener("input",function(ev){var e=ev.target,id=e.id;
  if(id==="city"){state.project.city=e.value.trim()}
  if(id==="roomLength"){var h1=state.config&&state.config.seeded&&runtime.maxPhase>1;state.room.length=Number(e.value)||state.room.length;resetConfiguratorForRoom();invalidateVisual();if(h1)toast("تغيّرت الأبعاد؛ حدّثنا التكوين المبدئي فقط.")}
  if(id==="roomWidth"){var h2=state.config&&state.config.seeded&&runtime.maxPhase>1;state.room.width=Number(e.value)||state.room.width;resetConfiguratorForRoom();invalidateVisual();if(h2)toast("تغيّرت الأبعاد؛ حدّثنا التكوين المبدئي فقط.")}
  if(id==="roomHeight"){state.room.height=Number(e.value)||state.room.height;state.room.heightTouched=true;invalidateVisual()}
  if(e.dataset.markerpos){var m=state.room.markers.find(function(x){return x.id===e.dataset.markerpos});if(m)m.pos=Number(e.value);invalidateVisual()}
  if(id==="customerName")state.contact.name=e.value;
  if(id==="projectNote")state.project.note=e.value;
  renderDynamic()
 });
 root.addEventListener("change",function(ev){var e=ev.target,id=e.id;
  if(e.dataset.markerwall){var m=state.room.markers.find(function(x){return x.id===e.dataset.markerwall});if(m)m.wall=e.value;invalidateVisual();renderDynamic();return}
  if(id==="refFile"){handleFile(e.files&&e.files[0]);return}
  renderDynamic()
 });
 root.addEventListener("toggle",function(ev){var d=ev.target;if(!d.matches||!d.matches(".requirementGroup")||!d.open)return;root.querySelectorAll(".requirementGroup").forEach(function(x){if(x!==d)x.open=false})},true);
 document.getElementById("backBtn").addEventListener("click",previousPhase);document.getElementById("nextBtn").addEventListener("click",nextPhase);
 function routeHashPhase(){var hm=location.hash.match(/^#phase-(\d)$/);if(hm){runtime.suspendHistory=true;goPhase(Math.min(runtime.maxPhase,Number(hm[1])),"replace")}}
 window.addEventListener("popstate",routeHashPhase);window.addEventListener("hashchange",routeHashPhase)
}
function seededRand(seed){var x=Math.sin(seed*999.1)*43758.5453;return x-Math.floor(x)}
function canvasTexture(kind,variant){
 var c=document.createElement("canvas"),x=c.getContext("2d");c.width=c.height=512;variant=variant||"";
 if(kind==="wood"){
  var walnut=variant==="walnut",base=walnut?"#5b4135":"#a9825f";x.fillStyle=base;x.fillRect(0,0,512,512);
  for(var i=0;i<120;i++){var px=seededRand(i+11)*512,drift=2+seededRand(i+47)*6;x.strokeStyle=walnut?"rgba(33,20,14,"+(0.035+seededRand(i+91)*.10)+")":"rgba(73,48,29,"+(0.025+seededRand(i+91)*.075)+")";x.lineWidth=.35+seededRand(i+120)*1.1;x.beginPath();x.moveTo(px,0);for(var yy=0;yy<=512;yy+=28)x.lineTo(px+Math.sin(yy*.022+i)*drift,yy);x.stroke()}
  for(var k=0;k<22;k++){var gx=seededRand(k+330)*512;x.strokeStyle="rgba(255,244,224,"+(0.018+seededRand(k+380)*.035)+")";x.lineWidth=.45;x.beginPath();x.moveTo(gx,0);x.bezierCurveTo(gx+8,150,gx-6,350,gx+3,512);x.stroke()}
 }else if(kind==="stone"){
  var dark=variant==="dark",warm=variant==="warm";x.fillStyle=dark?"#494a47":warm?"#a99b88":"#e8e3da";x.fillRect(0,0,512,512);
  for(var s0=0;s0<650;s0++){var alpha=.012+seededRand(s0+800)*.022;x.fillStyle=dark?"rgba(235,232,221,"+alpha+")":"rgba(82,76,68,"+alpha+")";var sx0=seededRand(s0+900)*512,sy0=seededRand(s0+1000)*512,r=.5+seededRand(s0+1100)*1.4;x.fillRect(sx0,sy0,r,r)}
  var veins=dark?6:8;for(var j=0;j<veins;j++){var y0=40+seededRand(j+300)*430;x.strokeStyle=dark?"rgba(224,222,214,"+(0.055+seededRand(j+330)*.10)+")":"rgba(104,98,90,"+(0.045+seededRand(j+330)*.095)+")";x.lineWidth=.5+seededRand(j+360)*1.25;x.beginPath();x.moveTo(-30,y0);x.bezierCurveTo(130,y0-70+seededRand(j+400)*90,330,y0+50-seededRand(j+450)*90,550,y0-20+seededRand(j+500)*60);x.stroke()}
 }else if(kind==="floor"){
  x.fillStyle="#c9c1b5";x.fillRect(0,0,512,512);
  for(var q=0;q<560;q++){var a=.01+seededRand(q+500)*.025;x.fillStyle="rgba(76,69,61,"+a+")";var fx=seededRand(q+600)*512,fy=seededRand(q+700)*512;x.fillRect(fx,fy,1,1)}
  x.strokeStyle="rgba(88,80,72,.15)";x.lineWidth=2;[0,256,512].forEach(function(n){x.beginPath();x.moveTo(n,0);x.lineTo(n,512);x.stroke();x.beginPath();x.moveTo(0,n);x.lineTo(512,n);x.stroke()})
 }
 var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;t.userData=t.userData||{};t.userData.dakhCached=true;return t
}
function cachedTexture(kind,variant){
 var key=kind+":"+(variant||"default");if(runtime.textureCache[key])return runtime.textureCache[key];
 var t=canvasTexture(kind,variant);runtime.textureCache[key]=t;return t
}function materials(){
 var woodMapped=state.visual.cabinet==="oak"||state.visual.cabinet==="walnut";
 var wood=woodMapped?cachedTexture("wood",state.visual.cabinet):null,stone=cachedTexture("stone",state.visual.worktop),floor=cachedTexture("floor","warm-porcelain");
 if(wood)wood.repeat.set(1.25,.72);stone.repeat.set(1.18,.62);floor.repeat.set(3.2,2.8);
 var cc={ivory:0xd9d2c6,sage:0x858881,graphite:0x3d423f,white:0xefede7}[state.visual.cabinet]||0xd9d2c6,darkStone=state.visual.worktop==="dark";
 var set={
  cab:new THREE.MeshPhysicalMaterial({color:woodMapped?0xffffff:cc,map:woodMapped?wood:null,roughness:woodMapped?.48:(state.visual.cabinet==="white"?.34:.58),metalness:0,clearcoat:state.visual.cabinet==="white"?.20:.06,clearcoatRoughness:.48,envMapIntensity:.52}),
  inside:new THREE.MeshStandardMaterial({color:0xc9c4bb,roughness:.72}),
  stone:new THREE.MeshPhysicalMaterial({color:darkStone?0x55544f:0xffffff,map:stone,roughness:darkStone?.30:.34,clearcoat:.18,clearcoatRoughness:.34,envMapIntensity:.75}),
  chrome:new THREE.MeshStandardMaterial({color:0xa7aaa8,roughness:.24,metalness:.92,envMapIntensity:1.05}),
  black:new THREE.MeshPhysicalMaterial({color:0x111412,roughness:.16,metalness:.28,clearcoat:.68,clearcoatRoughness:.13,envMapIntensity:1.0}),
  glass:new THREE.MeshPhysicalMaterial({color:0xd6e2e0,roughness:.08,metalness:0,transparent:true,opacity:.28,clearcoat:.9,envMapIntensity:.95,depthWrite:false}),
  wall:new THREE.MeshStandardMaterial({color:0xe9e4dc,roughness:.94}),
  floor:new THREE.MeshPhysicalMaterial({color:0xffffff,map:floor,roughness:.78,envMapIntensity:.18}),
  plinth:new THREE.MeshStandardMaterial({color:0x242826,roughness:.48,metalness:.18}),
  wood:new THREE.MeshPhysicalMaterial({color:0xffffff,map:cachedTexture("wood","oak"),roughness:.52,clearcoat:.04}),
  led:new THREE.MeshStandardMaterial({color:0xffe6bb,emissive:0xffcf84,emissiveIntensity:.52}),
  shadow:new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.10,depthWrite:false}),
  reveal:new THREE.MeshStandardMaterial({color:0x5f625f,roughness:.82}),
  sink:new THREE.MeshStandardMaterial({color:0x7e8582,roughness:.30,metalness:.82}),
  appliance:new THREE.MeshPhysicalMaterial({color:0x171a19,roughness:.20,metalness:.18,clearcoat:.58,clearcoatRoughness:.16}),
  frame:new THREE.MeshStandardMaterial({color:0xd8d5cf,roughness:.62}),
  sky:new THREE.MeshBasicMaterial({color:0xdfe8e9}),
  select:new THREE.MeshBasicMaterial({color:0xa99065,transparent:true,opacity:.22,depthWrite:false})
 };Object.keys(set).forEach(function(k){set[k].userData.dakhRole=k});return set
}function box(w,h,d,mat,bevel){
 var geo;if(bevel!==false&&Math.min(w,h,d)>.02&&w<2.8&&h<2.8&&d<2.8){var r=Math.max(.002,Math.min(.009,Math.min(w,h,d)*.15)),iw=Math.max(.004,w-2*r),ih=Math.max(.004,h-2*r),dep=Math.max(.004,d-2*r),sh=new THREE.Shape();sh.moveTo(-iw/2,-ih/2);sh.lineTo(iw/2,-ih/2);sh.lineTo(iw/2,ih/2);sh.lineTo(-iw/2,ih/2);sh.closePath();geo=new THREE.ExtrudeGeometry(sh,{depth:dep,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:r,bevelThickness:r,curveSegments:1});geo.translate(0,0,-dep/2);geo.computeVertexNormals()}else geo=new THREE.BoxGeometry(w,h,d);var m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;return m
}
function put(g,o,x,y,z,ry){o.position.set(x||0,y||0,z||0);if(ry)o.rotation.y=ry;g.add(o);return o}
function front(g,m,w,h,y,z){
 var gap=.004,fh=Math.max(.03,h-gap),fw=Math.max(.03,w-gap),frontZ=z+.006;
 put(g,box(fw+.008,fh+.008,.006,m.reveal,false),0,y,z-.004);
 put(g,box(fw,fh,.022,m.cab),0,y,frontZ);
 if(state.visual.handle==="linear"){put(g,box(Math.max(.12,w*.44),.009,.012,m.chrome),0,y+h*.31,frontZ+.020)}
 else if(state.visual.handle==="classic"){put(g,box(.010,Math.min(.15,h*.30),.014,m.chrome),w*.32,y,frontZ+.021)}
 else{put(g,box(w-.070,.007,.010,m.plinth),0,y+h*.43,frontZ+.018)}
}function baseUnit(m,type,w){
 w=w||.6;var g=new THREE.Group(),p=.018,d=.58,h=.78;
 put(g,box(p,h,d,m.cab),-w/2+p/2,h/2,0);put(g,box(p,h,d,m.cab),w/2-p/2,h/2,0);
 put(g,box(w-p*2,p,d,m.inside),0,p/2,0);put(g,box(w-p*2,p,d,m.inside),0,h-p/2,0);
 put(g,box(w-p*2,h-p*2,.012,m.inside),0,h/2,-d/2+.006);
 put(g,box(w-.12,.090,.43,m.plinth),0,-.070,.015);
 if(type==="drawers"){for(var i=0;i<3;i++)front(g,m,w,.245,.135+i*.252,.303)}
 else if(type==="dishwasher"){front(g,m,w,.745,.395,.303);put(g,box(w*.52,.010,.012,m.black),0,.735,.329)}
 else if(type==="oven"){front(g,m,w,.19,.125,.303);put(g,box(w-.026,.50,.024,m.appliance),0,.485,.308);put(g,box(w-.080,.030,.012,m.chrome),0,.700,.331);put(g,box(w*.46,.010,.012,m.chrome),0,.575,.333)}
 else front(g,m,w,.745,.395,.303);
 return g
}function wallUnit(m,w,glass){
 w=w||.68;var g=new THREE.Group(),p=.016,d=.33,h=.72;
 put(g,box(p,h,d,m.cab),-w/2+p/2,h/2,0);put(g,box(p,h,d,m.cab),w/2-p/2,h/2,0);
 put(g,box(w-p*2,p,d,m.inside),0,p/2,0);put(g,box(w-p*2,p,d,m.inside),0,h-p/2,0);
 put(g,box(w-p*2,h-p*2,.012,m.inside),0,h/2,-d/2+.006);
 if(glass){
  var z=.176,rail=.040;put(g,box(w-.010,rail,.022,m.cab),0,rail/2+.004,z);put(g,box(w-.010,rail,.022,m.cab),0,h-rail/2-.004,z);
  put(g,box(rail,h-.080,.022,m.cab),-w/2+rail/2+.004,h/2,z);put(g,box(rail,h-.080,.022,m.cab),w/2-rail/2-.004,h/2,z);
  put(g,box(w-.094,h-.094,.014,m.glass),0,h/2,z-.004);
  put(g,box(w-.10,.014,.22,m.wood),0,.24,-.02);put(g,box(w-.10,.014,.22,m.wood),0,.49,-.02)
 }else front(g,m,w,h-.04,h/2,.175);
 return g
}function tallUnit(m,type,inspect,interior){
 var g=new THREE.Group(),w=.64,d=.62,h=2.22,p=.02,z=.321;
 put(g,box(p,h,d,m.cab),-w/2+p/2,h/2,0);put(g,box(p,h,d,m.cab),w/2-p/2,h/2,0);
 put(g,box(w-p*2,p,d,m.cab),0,p/2,0);put(g,box(w-p*2,p,d,m.cab),0,h-p/2,0);
 put(g,box(w-p*2,h-p*2,.014,m.inside),0,h/2,-d/2+.007);put(g,box(w-.12,.095,.44,m.plinth),0,.047,.01);
 if(type==="fridge"){
  front(g,m,w,.93,.59,z);front(g,m,w,1.02,1.59,z);put(g,box(.010,.64,.014,m.plinth),.235,1.50,z+.027);put(g,box(w-.08,.010,.010,m.reveal),0,1.08,z+.029)
 }else if(type==="oven"){
  front(g,m,w,.63,.39,z);put(g,box(w-.030,.59,.026,m.appliance),0,1.02,z+.004);put(g,box(w-.095,.040,.014,m.chrome),0,1.22,z+.032);
  put(g,box(w-.105,.015,.012,m.chrome),0,.86,z+.033);put(g,box(.016,.016,.014,m.chrome),-.18,1.31,z+.033);put(g,box(.016,.016,.014,m.chrome),-.12,1.31,z+.033);front(g,m,w,.51,1.78,z)
 }else if(inspect){
  if(interior==="internalDrawers"){
   for(var i=0;i<4;i++){put(g,box(w-.11,.12,.46,m.inside),0,.30+i*.34,.02);put(g,box(w-.15,.022,.48,m.reveal),0,.22+i*.34,.02)}
   put(g,box(w-.10,.024,.49,m.wood),0,1.72,.01)
  }else{
   for(var j=0;j<6;j++)put(g,box(w-.10,.024,.49,m.wood),0,.27+j*.30,.01)
  }
 }else{front(g,m,w,1.00,.58,z);front(g,m,w,1.02,1.60,z)}
 return g
}function hobUnit(m){
 var g=new THREE.Group();put(g,box(.57,.018,.43,m.appliance),0,0,0);
 var rings=[[-.14,-.105,.070],[.14,-.105,.060],[-.14,.105,.055],[.14,.105,.076]];
 rings.forEach(function(r){var ring=new THREE.Mesh(new THREE.TorusGeometry(r[2],.004,12,40),m.chrome);ring.rotation.x=Math.PI/2;ring.position.set(r[0],.014,r[1]);g.add(ring)});
 for(var i=0;i<4;i++)put(g,box(.012,.004,.012,m.chrome),-.09+i*.06,.013,.178);
 return g
}function hoodUnit(m){
 var g=new THREE.Group();put(g,box(.64,.075,.34,m.chrome),0,0,0);put(g,box(.52,.014,.24,m.appliance),0,-.040,.015);
 put(g,box(.28,.010,.10,m.led),0,-.050,.04);put(g,box(.42,.018,.035,m.plinth),0,.045,-.125);return g
}function simpleSink(m){
 var g=new THREE.Group(),w=.52,d=.39,t=.018;
 put(g,box(w,t,.045,m.sink),0,0,-d/2+.022);put(g,box(w,t,.045,m.sink),0,0,d/2-.022);
 put(g,box(.045,t,d-.09,m.sink),-w/2+.022,0,0);put(g,box(.045,t,d-.09,m.sink),w/2-.022,0,0);
 put(g,box(w-.075,.085,d-.075,m.sink),0,-.050,0);put(g,box(w-.115,.010,d-.115,m.appliance),0,-.096,0);
 return g
}function clearWorld(instance){if(!instance)return;instance.generation=(instance.generation||0)+1;while(instance.world.children.length){var o=instance.world.children[0];instance.world.remove(o);dispose(o)}}
function dispose(o){if(o&&o.userData&&o.userData.skipDispose)return;o.traverse&&o.traverse(function(n){if(n.geometry&&n.geometry.dispose)n.geometry.dispose();if(n.material){var a=Array.isArray(n.material)?n.material:[n.material];a.forEach(function(mm){if(mm.map&&!(mm.map.userData&&mm.map.userData.dakhCached)&&mm.map.dispose)mm.map.dispose();if(mm.dispose)mm.dispose()})}})}function addRun(world,m,length,z,rotation,xpos,slots,instance){
 var count=slots&&slots.length?slots.length:Math.max(3,Math.min(6,Math.floor(length/.62))),runLen=count*.62,start=-runLen/2+.31,g=new THREE.Group(),list=slots&&slots.length?slots.slice(0,count):null;
 var sinkIndex=list?list.indexOf("sink"):Math.min(1,count-1),hobIndex=list?list.indexOf("hob"):Math.min(3,count-1);
 for(var i=0;i<count;i++){
  var type=list?list[i]:(i===sinkIndex?"sink":i===hobIndex?"hob":(i%3===0?"drawers":"doors")),unitType=type==="drawers"?"drawers":type==="dishwasher"?"dishwasher":"doors",unit=baseUnit(m,unitType,.60);
  put(g,unit,start+i*.62,.115,0);
  if(instance&&!instance.isHero&&state.config&&state.config.selected==="base:"+i){put(g,box(.50,.012,.62,m.select,false),start+i*.62,.006,.02)}
 }
 put(g,box(runLen+.085,.040,.655,m.stone),0,.957,.012);put(g,box(runLen-.04,.095,.47,m.plinth),0,.047,.025);put(g,box(runLen+.01,.115,.020,m.stone),0,1.035,-.337);
 if(sinkIndex>=0){var sx=start+sinkIndex*.62;put(g,simpleSink(m),sx,.982,.012)}
 if(hobIndex>=0){var hx=start+hobIndex*.62;put(g,hobUnit(m),hx,.986,.012);put(g,hoodUnit(m),hx,1.905,-.02)}
 var wc=Math.max(2,Math.min(5,count-1));
 for(var j=0;j<wc;j++){var glass=state.visual.upper==="glass"||(state.visual.upper==="mixed"&&j===wc-2);if(state.visual.upper!=="open")put(g,wallUnit(m,.66,glass),start+.31+j*.68,1.54,-.16)}
 if(state.visual.upper==="open"){for(var r=0;r<2;r++)put(g,box(Math.min(1.55,runLen*.55),.035,.25,m.wood),.3,1.65+r*.30,-.20)}
 put(g,box(runLen-.12,.010,.028,m.led),0,1.495,-.15);var led=new THREE.PointLight(0xffdcb0,.045,1.45,2);led.position.set(0,1.42,.02);g.add(led);
 var cs=new THREE.Mesh(new THREE.PlaneGeometry(runLen-.10,.48),m.shadow);cs.rotation.x=-Math.PI/2;cs.position.set(0,.004,.10);g.add(cs);
 if(rotation)g.rotation.y=rotation;g.position.x=xpos||0;g.position.z=z;world.add(g);
 return{group:g,sinkWorld:sinkIndex>=0?{x:(xpos||0)+start+sinkIndex*.62,z:z}:null,runLen:runLen}
}function addRoomDecor(world,m,L,W,H){
 put(world,box(L+.6,.07,W+.6,m.wall,false),0,H+.035,0);put(world,box(L,.11,.035,m.frame,false),0,.055,-W/2+.055,false);
 var positions=[[-L*.24,-W*.14],[0,W*.02],[L*.24,-W*.08]];positions.forEach(function(p){var fixture=new THREE.Mesh(new THREE.CylinderGeometry(.042,.042,.016,24),m.chrome);fixture.position.set(p[0],H-.035,p[1]);fixture.rotation.x=Math.PI/2;world.add(fixture);var light=new THREE.PointLight(0xffead0,.20,2.7,2);light.position.set(p[0],H-.13,p[1]);world.add(light)});
 var potMat=new THREE.MeshStandardMaterial({color:0xd9d2c7,roughness:.72}),leafMat=new THREE.MeshStandardMaterial({color:0x647260,roughness:.86});var pot=new THREE.Mesh(new THREE.CylinderGeometry(.075,.095,.18,24),potMat);put(world,pot,L*.27,1.065,-W/2+.53);
 for(var i=0;i<4;i++){var leaf=new THREE.Mesh(new THREE.SphereGeometry(.07,16,12),leafMat);leaf.scale.set(.42,1.55,.34);put(world,leaf,L*.27+(i-1.5)*.043,1.23+i*.015,-W/2+.53+(i%2?.03:-.03))}
}function addWindow(world,m,L,W,H){
 var windows=state.room.markers.filter(function(x){return x.type==="window"});if(!windows.length&&!knownMeasurements())windows=[{wall:"north",pos:70}];
 windows.forEach(function(mm){if(mm.wall!=="north")return;var x=-L/2+L*(mm.pos/100),ww=Math.min(1.38,L*.28),wh=1.12,z=-W/2+.020;
  put(world,box(ww+.18,wh+.18,.10,m.frame,false),x,1.68,z-.055);put(world,box(ww+.02,wh+.02,.012,m.sky,false),x,1.68,z+.002);
  put(world,box(ww,wh,.018,m.glass,false),x,1.68,z+.010);put(world,box(ww+.08,.045,.075,m.frame,false),x,1.10,z+.045);put(world,box(ww+.08,.045,.075,m.frame,false),x,2.25,z+.045);
  put(world,box(.045,wh+.08,.075,m.frame,false),x-ww/2-.02,1.68,z+.045);put(world,box(.045,wh+.08,.075,m.frame,false),x+ww/2+.02,1.68,z+.045);put(world,box(.035,wh,.055,m.frame,false),x,1.68,z+.050);
  put(world,box(ww+.18,.055,.18,m.stone),x,1.075,z+.085)
 })
}function fitModel(model,targetSize){
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
 getAsset(cfg.cc0Assets.tap,function(model){
  if(instance.generation!==gen)return;
  model.userData.skipDispose=true;fitModel(model,.31);
  model.position.set(sinkPos.x-.15,.955,sinkPos.z-.085);
  model.rotation.y=Math.PI;
  instance.world.add(model)
 })
}
function rebuildScene(instance,preserveCamera){
 if(!instance||!window.THREE)return;ensureConfigurator();var oldGoal=instance.camGoal?instance.camGoal.clone():null,oldTarget=instance.target?instance.target.clone():null,oldMode=instance.cameraMode;clearWorld(instance);
 var m=materials();instance.materialSet=m;var r=effectiveRoom(),L=Math.max(2.6,r.length/100),W=Math.max(2.35,r.width/100),H=Math.max(2.4,r.height/100),layout=effectiveLayout(),world=instance.world;
 var floor=new THREE.Mesh(new THREE.PlaneGeometry(L+1.9,W+1.9),m.floor);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;world.add(floor);
 put(world,box(L,H,.07,m.wall,false),0,H/2,-W/2-.035);addWindow(world,m,L,W,H);addRoomDecor(world,m,L,W,H);
 var towerTypes=(state.config.tallSlots||[]).slice(),towerWidth=towerTypes.length*.68,mainLength=Math.max(1.86,L-towerWidth-.42),mainX=towerWidth/2,main=addRun(world,m,mainLength,-W/2+.35,0,mainX,state.config.baseSlots,instance),tx=-L/2+.34;
 towerTypes.forEach(function(t,i){var inspect=!instance.isHero&&state.config.inspect&&state.config.selected==="tall:"+i&&t==="pantry",unit=tallUnit(m,t,inspect,state.config.pantryInterior);put(world,unit,tx,.11,-W/2+.35);if(!instance.isHero&&state.config.selected==="tall:"+i)put(world,box(.54,.012,.66,m.select,false),tx,.006,-W/2+.35);tx+=.68});
 if(layout==="l"||layout==="u"){
  var len=Math.max(1.65,W-.88),g=new THREE.Group(),count=Math.max(2,Math.min(4,Math.floor(len/.62))),run=count*.62,start=-run/2+.31;
  for(var i=0;i<count;i++)put(g,baseUnit(m,i===0?"drawers":"doors",.6),start+i*.62,.115,0);put(g,box(run+.08,.040,.655,m.stone),0,.957,.012);put(g,box(run-.06,.095,.46,m.plinth),0,.047,.025);g.rotation.y=-Math.PI/2;g.position.set(L/2-.35,0,-W/2+.35+run/2);world.add(g)
 }
 if(layout==="u"){
  var len2=Math.max(1.65,W-.88),g2=new THREE.Group(),c2=Math.max(2,Math.min(4,Math.floor(len2/.62))),run2=c2*.62,st=-run2/2+.31;
  for(var j=0;j<c2;j++)put(g2,baseUnit(m,j===1?"drawers":"doors",.6),st+j*.62,.115,0);put(g2,box(run2+.08,.040,.655,m.stone),0,.957,.012);put(g2,box(run2-.06,.095,.46,m.plinth),0,.047,.025);g2.rotation.y=Math.PI/2;g2.position.set(-L/2+.35,0,-W/2+.35+run2/2);world.add(g2)
 }
 if(layout==="parallel"){
  var cnt=Math.max(3,Math.min(5,Math.floor((L-.7)/.62))),gg=new THREE.Group(),rl=cnt*.62,ss=-rl/2+.31;for(var p=0;p<cnt;p++)put(gg,baseUnit(m,p%3===0?"drawers":"doors",.6),ss+p*.62,.115,0);
  put(gg,box(rl+.08,.040,.655,m.stone),0,.957,.012);put(gg,box(rl-.06,.095,.46,m.plinth),0,.047,.025);gg.rotation.y=Math.PI;gg.position.set(0,0,W/2-.38);world.add(gg)
 }
 if(layout==="island"&&hasPlausibleIsland()){
  var isl=new THREE.Group();for(var q=0;q<3;q++)put(isl,baseUnit(m,q===1?"drawers":"doors",.6),-.62+q*.62,.115,0);put(isl,box(2.05,.045,.94,m.stone),0,.96,0);put(isl,box(1.72,.095,.58,m.plinth),0,.047,0);isl.position.set(.12,0,.28);world.add(isl);
  [-.50,.12,.74].forEach(function(px){var shade=new THREE.Mesh(new THREE.CylinderGeometry(.095,.175,.16,28,1,true),m.plinth);put(world,shade,px,H-.58,.28);put(world,box(.007,.42,.007,m.plinth,false),px,H-.29,.28);var light=new THREE.PointLight(0xffdfb1,.12,1.8,2);light.position.set(px,H-.66,.28);world.add(light)})
 }
 addCC0Details(instance,main.sinkWorld);if(preserveCamera&&oldGoal&&oldTarget){instance.camGoal.copy(oldGoal);instance.target.copy(oldTarget);instance.cameraMode=oldMode||"manual"}else cameraPreset(instance,oldMode&&oldMode!=="manual"?oldMode:"hero")
}function materialStateKey(){return state.visual.cabinet+"|"+state.visual.worktop}
function geometryStateKey(){ensureConfigurator();return JSON.stringify([knownMeasurements(),state.room.length,state.room.width,state.room.height,effectiveLayout(),state.room.markers,state.visual.upper,state.visual.handle,state.config.baseSlots,state.config.tallSlots,state.config.pantryInterior,state.config.inspect,state.config.selected])}
function stamp3DState(instance){if(!instance||!instance.wrap)return;instance.wrap.dataset.cameraMode=instance.cameraMode||"hero";instance.wrap.dataset.materialState=instance.materialKey||materialStateKey();instance.wrap.dataset.geometryState=instance.geometryKey||geometryStateKey()}
function applyVisualMaterials(instance){
 if(!instance||!instance.materialSet)return;var set=instance.materialSet,woodMapped=state.visual.cabinet==="oak"||state.visual.cabinet==="walnut",cabColor=woodMapped?0xffffff:({ivory:0xd9d2c6,sage:0x858881,graphite:0x3d423f,white:0xefede7}[state.visual.cabinet]||0xd9d2c6);
 set.cab.color.setHex(cabColor);set.cab.map=woodMapped?cachedTexture("wood",state.visual.cabinet):null;if(set.cab.map)set.cab.map.repeat.set(1.25,.72);set.cab.roughness=woodMapped?.48:(state.visual.cabinet==="white"?.34:.58);set.cab.clearcoat=state.visual.cabinet==="white"?.20:.06;set.cab.needsUpdate=true;
 set.stone.map=cachedTexture("stone",state.visual.worktop);set.stone.map.repeat.set(1.18,.62);set.stone.color.setHex(state.visual.worktop==="dark"?0x55544f:0xffffff);set.stone.roughness=state.visual.worktop==="dark"?.30:.34;set.stone.needsUpdate=true;
 instance.materialKey=materialStateKey();stamp3DState(instance)
}function sync3D(instance,force){if(!instance)return;var g=geometryStateKey(),m=materialStateKey();if(force||instance.geometryKey!==g){var preserve=!!instance.geometryKey;rebuildScene(instance,preserve);instance.geometryKey=g;instance.materialKey=m}else if(instance.materialKey!==m)applyVisualMaterials(instance);stamp3DState(instance)}
function syncAll3D(){if(runtime.hero)sync3D(runtime.hero);if(runtime.studio)sync3D(runtime.studio)}
function applyHDR(instance){
 if(!instance||!window.THREE||!THREE.RGBELoader)return;if(runtime.hdr){instance.scene.environment=runtime.hdr;return}
 runtime.hdrWait.push(instance);if(runtime.hdrLoading)return;runtime.hdrLoading=true;
 new THREE.RGBELoader().load(assetUrl("/kitchen-engine-v5/assets/kiara_interior_1k.hdr"),function(tex){
  var pmrem=new THREE.PMREMGenerator(instance.renderer);if(pmrem.compileEquirectangularShader)pmrem.compileEquirectangularShader();runtime.hdr=pmrem.fromEquirectangular(tex).texture;tex.dispose();pmrem.dispose();runtime.hdrLoading=false;
  var list=runtime.hdrWait.splice(0);list.forEach(function(it){if(it&&it.scene)it.scene.environment=runtime.hdr})
 },undefined,function(){runtime.hdrLoading=false;runtime.hdrWait=[]})
}function environment(){
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
function show3DFallback(wrap,canvas){if(!wrap)return;if(canvas)canvas.style.visibility="hidden";var old=wrap.querySelector(".threeFallback");if(old)return;var d=document.createElement("div");d.className="threeFallback";d.innerHTML='<b>تعذر تشغيل المعاينة ثلاثية الأبعاد على هذا الجهاز.</b><span>يمكنك متابعة تجهيز طلبك، وسيتم تأكيد التصور مع فريق التصميم.</span>';wrap.appendChild(d)}
function stopAutoPresentation(instance){if(!instance)return;instance.autoPresentation=false}
function orbitCamera(instance,delta,manual){if(!instance)return;var c=instance.camGoal,t=instance.target,dx=c.x-t.x,dz=c.z-t.z,r=Math.max(2.15,Math.sqrt(dx*dx+dz*dz)),angle=Math.atan2(dz,dx)-delta;angle=Math.max(.48,Math.min(2.68,angle));c.x=t.x+Math.cos(angle)*r;c.z=t.z+Math.sin(angle)*r;instance.orbitAngle=angle;if(manual){stopAutoPresentation(instance);instance.cameraMode="manual";stamp3DState(instance);updateCameraControls()}}
function ensureRenderLoop(){if(runtime.raf)return;function tick(ts){runtime.raf=requestAnimationFrame(tick);if(document.hidden)return;runtime.instances.forEach(function(instance){if(!instance||!instance.renderer||!instance.visible)return;if(instance.isHero&&instance.autoPresentation){var e=ts-instance.autoStart;if(e>6500)instance.autoPresentation=false;else{var desired=instance.autoBaseAngle+Math.sin(e/1500)*.035,now=instance.orbitAngle==null?instance.autoBaseAngle:instance.orbitAngle;orbitCamera(instance,now-desired,false)}}instance.camera.position.lerp(instance.camGoal,.11);instance.camera.lookAt(instance.target);instance.renderer.render(instance.scene,instance.camera)})}runtime.raf=requestAnimationFrame(tick)}
function observe3D(instance){if(!instance)return;if("IntersectionObserver" in window){instance.observer=new IntersectionObserver(function(entries){entries.forEach(function(e){instance.visible=e.isIntersecting})},{rootMargin:"120px 0px 120px 0px",threshold:.01});instance.observer.observe(instance.wrap)}else instance.visible=true}
function create3D(canvas,wrap,isHero){
 if(!window.THREE||!canvas||!wrap)return null;var renderer;
 try{renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,powerPreference:"high-performance"})}catch(e){show3DFallback(wrap,canvas);return null}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,isHero?1.2:(window.innerWidth<700?1.15:1.5)));
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;renderer.physicallyCorrectLights=true;
 var scene=new THREE.Scene();scene.background=new THREE.Color(0xc9c8c2);scene.environment=environment();
 var camera=new THREE.PerspectiveCamera(isHero?(window.innerWidth<700?39:34):35,1,.1,70),world=new THREE.Group();scene.add(world);
 scene.add(new THREE.HemisphereLight(0xf7f2e8,0x69665f,.34));
 var sun=new THREE.DirectionalLight(0xfff2dd,1.08);sun.position.set(-3.8,6.6,4.6);sun.castShadow=true;sun.shadow.mapSize.set(window.innerWidth<700?1024:2048,window.innerWidth<700?1024:2048);sun.shadow.camera.left=-6;sun.shadow.camera.right=6;sun.shadow.camera.top=6;sun.shadow.camera.bottom=-6;sun.shadow.bias=-.00016;sun.shadow.normalBias=.018;scene.add(sun);
 var fill=new THREE.DirectionalLight(0xdbe7e9,.36);fill.position.set(3.8,3.4,4.2);scene.add(fill);
 var warm=new THREE.PointLight(0xffd9a0,.07,3.8,2);warm.position.set(-1.1,2.15,1.2);scene.add(warm);
 var camGoal=new THREE.Vector3(4.8,1.78,5.1),target=new THREE.Vector3(.20,1.03,-.65);camera.position.copy(camGoal);camera.lookAt(target);
 var instance={renderer:renderer,scene:scene,camera:camera,world:world,camGoal:camGoal,target:target,wrap:wrap,canvas:canvas,isHero:isHero,cameraMode:"hero",generation:0,geometryKey:"",materialKey:"",materialSet:null,visible:true,autoPresentation:false,orbitAngle:null};runtime.instances.push(instance);
 applyHDR(instance);
 function resize(){var w=wrap.clientWidth,h=wrap.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
 addEventListener("resize",resize,{passive:true});resize();observe3D(instance);
 canvas.addEventListener("webglcontextlost",function(e){e.preventDefault();show3DFallback(wrap,canvas)},{once:true});
 var drag=false,lx=0,ly=0,totalX=0,totalY=0,orbiting=false;canvas.addEventListener("pointerdown",function(e){stopAutoPresentation(instance);drag=true;orbiting=false;totalX=0;totalY=0;lx=e.clientX;ly=e.clientY;if(e.pointerType!=="touch"&&canvas.setPointerCapture)try{canvas.setPointerCapture(e.pointerId)}catch(_){} });canvas.addEventListener("pointermove",function(e){if(!drag)return;var rawX=e.clientX-lx,rawY=e.clientY-ly;totalX+=rawX;totalY+=rawY;if(!orbiting){if(Math.abs(totalX)<7&&Math.abs(totalY)<7){lx=e.clientX;ly=e.clientY;return}if(e.pointerType==="touch"&&Math.abs(totalY)>Math.abs(totalX)*1.08){drag=false;return}orbiting=true}if(orbiting)orbitCamera(instance,rawX*.0032,true);lx=e.clientX;ly=e.clientY});canvas.addEventListener("pointerup",function(){var wasTap=drag&&!orbiting&&Math.abs(totalX)<7&&Math.abs(totalY)<7;drag=false;if(isHero&&wasTap)open3DStudio()});canvas.addEventListener("pointercancel",function(){drag=false});
 if(isHero&&!matchMedia("(prefers-reduced-motion: reduce)").matches){instance.autoPresentation=true;instance.autoStart=performance.now()}
 ensureRenderLoop();return instance
}
function cameraPreset(instance,name){
 if(!instance)return;if(name==="island"&&!hasPlausibleIsland())name="hero";stopAutoPresentation(instance);instance.cameraMode=name;stamp3DState(instance);
 var r=effectiveRoom(),L=Math.max(2.6,r.length/100),W=Math.max(2.35,r.width/100),c=instance.camGoal,t=instance.target,mobile=window.innerWidth<700;
 if(name==="hero"){c.set(-L*(mobile?.28:.32),mobile?1.52:1.62,W*(mobile?.72:.74));t.set(.06,1.04,-W*.34)}
 else if(name==="functional"){c.set(L*(mobile?.10:.12),mobile?1.45:1.50,W*(mobile?.66:.68));t.set(.10,.98,-W*.35)}
 else if(name==="elevation"){c.set(.04,mobile?1.40:1.45,W*(mobile?.71:.73));t.set(.04,1.15,-W*.47)}
 else if(name==="island"){c.set(-L*(mobile?.36:.40),mobile?1.52:1.60,W*(mobile?.56:.59));t.set(.10,.97,-.01)}
 else if(name==="wide"){c.set(-L*(mobile?.44:.48),mobile?1.72:1.82,W*(mobile?.83:.86));t.set(.04,1.02,-W*.19)}
 var dx=c.x-t.x,dz=c.z-t.z;instance.orbitAngle=Math.atan2(dz,dx);if(instance.isHero&&!matchMedia("(prefers-reduced-motion: reduce)").matches){instance.autoBaseAngle=instance.orbitAngle;instance.autoStart=performance.now();instance.autoPresentation=true}
}function initHero(){if(runtime.hero)return;runtime.hero=create3D(document.getElementById("heroCanvas"),document.getElementById("heroWrap"),true);if(runtime.hero){rebuildScene(runtime.hero,false);runtime.hero.geometryKey=geometryStateKey();runtime.hero.materialKey=materialStateKey();stamp3DState(runtime.hero);runtime.hero.autoBaseAngle=runtime.hero.orbitAngle;runtime.hero.autoStart=performance.now();runtime.hero.autoPresentation=!matchMedia("(prefers-reduced-motion: reduce)").matches}}
function initStudio(){if(runtime.studio)return;runtime.studio=create3D(document.getElementById("studioCanvas"),document.getElementById("studioWrap"),false);if(runtime.studio){rebuildScene(runtime.studio,false);runtime.studio.geometryKey=geometryStateKey();runtime.studio.materialKey=materialStateKey();stamp3DState(runtime.studio);updateCameraControls()}}
root.innerHTML=page();bind();renderDynamic();initHero();var heroWrap=document.getElementById("heroWrap");if(heroWrap)heroWrap.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();open3DStudio()}});
(function(){
 var planner=document.getElementById("planner");
 if(!planner)return;
 function fallback(){
  var r=planner.getBoundingClientRect();
  document.body.classList.toggle("planner-nav-ready",r.top<innerHeight-80&&r.bottom>100)
 }
 if(!("IntersectionObserver" in window)){addEventListener("scroll",fallback,{passive:true});fallback();return}
 var io=new IntersectionObserver(function(entries){entries.forEach(function(e){document.body.classList.toggle("planner-nav-ready",e.isIntersecting)})},{rootMargin:"-72px 0px -70px 0px",threshold:.001});
 io.observe(planner)
})();
if(location.hash){var hm=location.hash.match(/^#phase-(\d)$/);if(hm){runtime.suspendHistory=true;goPhase(Math.min(runtime.maxPhase,Number(hm[1])),"replace")}}
})();