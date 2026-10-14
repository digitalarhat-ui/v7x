(()=>{
'use strict';
const review=document.documentElement.dataset.review==='true';
const STORE='digitalarhat_alhudhudi_luxury_brief_v4',LANG='digital_arhat_alhudhudi_v2_lang',VIS='digital_arhat_alhudhudi_3d_v1';
const labels={
ar:{
ribbon:'تجربة مستقلة · ليست موقعاً رسمياً للقاعات',
navigate3d:'تجربة القاعة',backToExperience:'العودة إلى التجربة',
reviewHero:'تفاصيل ليلتك، جاهزة للمراجعة',reviewLead:'هذا موجز احتياجات لمناقشة العميل، وليس عرض سعر أو موافقة من إدارة القاعة.',
heroTitle:'ليلة تستحق أن تُرى قبل أن تبدأ',heroLead:'اختر اتجاه قاعتك، واستكشف الأجواء في مجسم ثلاثي الأبعاد، ثم احتفظ بتفاصيل المناسبة في موجز واضح.',
enter3d:'اكتشف المشهد ثلاثي الأبعاد',startBrief:'حدد تفاصيل المناسبة',
scenesHeading:'مساحتك، بطابعك الخاص',scenesLead:'مجسم تفاعلي يمكنك تدويره وتقريبه وتغيير طابعه. تصميم تصوري مستقل، وليس مسحاً لمبنى القاعات الحقيقي.',
sourcesHeading:'شاهد القاعات من مصادرها المنشورة',sourcesLead:'تصميم 3D أعلاه أصلي وتخيلي؛ الصور والفيديوهات الفعلية تبقى عند ناشريها الأصليين حتى تتأكد صلاحية إعادة استخدامها.',
officialMedia:'المحتوى الرسمي للقاعات',officialMediaSub:'من موقع شركة حسن الهدهدي وأولاده',
venueVideo:'فيديو القاعات المنشور',venueVideoSub:'شاهده في صفحة سناب شات الأصلية',
gallery:'معرض الصور المنشور',gallerySub:'الصور المنشورة في زفاف · مصدر خارجي',
plannerHeading:'التفاصيل الصغيرة تصنع ليلة استثنائية',plannerLead:'اختر الاتجاه الأنسب للمناسبة ليتمكن فريق القاعات من مناقشته معك. الخدمة والسعة والسعر والتاريخ تحتاج تأكيداً رسمياً.',
hall:'القاعة المقترحة',occasion:'نوع المناسبة',wedding:'حفل زفاف',other:'مناسبة أخرى',men:'عدد ضيوف الرجال',women:'عدد ضيوف النساء',date:'التاريخ المفضل (غير مؤكد)',
serviceHeading:'ما الذي ترغب في الاستفسار عنه؟',serviceLead:'هذه أسئلة لعرض السعر وليست خدمات مضمونة أو مشمولة في الباقة.',
catering:'العشاء والبوفيه',hospitality:'الضيافة',bridal:'جناح تجهيز العروس',audio:'الصوت والإضاءة',vip:'ضيافة كبار الشخصيات',seating:'توزيع الجلسات والطاولات',outside:'المساحات الخارجية',access:'المداخل والمواقف',notes:'تفاصيل إضافية',notesPlaceholder:'شارك احتياجات المناسبة أو السؤال الذي تريد توجيهه لمسؤول الحجوزات...',
briefHeading:'موجز ليلتك',briefLead:'متطلبات تساعد على مناقشة المناسبة — ليست حجزاً أو عرض سعر معتمداً.',
openReview:'مراجعة موجز المناسبة',copy:'نسخ الملخص',copied:'تم النسخ',copyError:'تعذر النسخ',
noBooking:'لا إرسال تلقائياً أو تأكيد توافر أو سعر أو حجز من خلال النموذج.',
endTitle:'القرار يبدأ بتجربة أفضل.',endLead:'الـ3D المعروض تصور مستقل وليس نسخة للموقع الحقيقي. أي تصميم هندسي مطابق يتطلب بيانات وموافقة القاعات.',
officialWebsite:'الموقع الرسمي للشركة ↗',footer:'تصور مستقل غير معتمد · Original 3D concept',
summaryStatus:'موجز أولي — غير مؤكد',summaryHall:'القاعة',summaryType:'المناسبة',summaryDate:'التاريخ المفضل',summaryMen:'ضيوف الرجال',summaryWomen:'ضيوف النساء',summaryNeeds:'طلبات للتأكيد',summaryNotes:'ملاحظات',summaryVisual:'اتجاه التصميم التخيلي 3D',summaryPending:'العرض والتوافر والسعة والأسعار بانتظار تأكيد الشركة',unknown:'لم يحدد',cham:'ذهبي',pearl:'لؤلؤي',rose:'وردي',warm:'دافئ',day:'نهاري',round:'طاولات دائرية',banquet:'طاولات مستطيلة',classic:'ممر عادي',wide:'ممر واسع'
},
en:{
ribbon:'Independent demonstration · Not an official venue website',
navigate3d:'Explore 3D',backToExperience:'Back to the experience',
reviewHero:'Your celebration, ready to review',reviewLead:'A customer requirements brief for a conversation, not a quote or approval from venue management.',
heroTitle:'An occasion worth seeing before it begins',heroLead:'Choose a venue direction, explore an original interactive 3D scene, then gather your occasion details in one clear brief.',
enter3d:'Enter the 3D experience',startBrief:'Plan the occasion',
scenesHeading:'The setting, distinctly yours',scenesLead:'Orbit, zoom and shape the atmosphere in a live scene. This is an independent architectural concept, not a scan of the real building.',
sourcesHeading:'Discover the original venue publications',sourcesLead:'The 3D environment above is an original conceptual design. The real photos and videos remain with their publishers until reproduction rights are established.',
officialMedia:'Official venue information',officialMediaSub:'Hasan Alhudhudi & Sons website',
venueVideo:'Published venue video',venueVideoSub:'Open the original Snapchat publication',
gallery:'Published photo gallery',gallerySub:'Zafaf gallery · external original source',
plannerHeading:'The small details make an extraordinary night',plannerLead:'Describe your preferred venue and requirements for a future discussion. Services, capacity, pricing and dates require official confirmation.',
hall:'Preferred venue',occasion:'Occasion',wedding:'Wedding',other:'Other celebration',men:'Men’s guests',women:'Women’s guests',date:'Preferred date (unconfirmed)',
serviceHeading:'What would you like the team to confirm?',serviceLead:'These are quote enquiries, not guaranteed or included services.',
catering:'Dinner and catering',hospitality:'Hospitality',bridal:'Bridal preparation room',audio:'Sound and lighting',vip:'VIP hospitality',seating:'Table arrangements',outside:'Outdoor areas',access:'Entrances and parking',notes:'Additional requirements',notesPlaceholder:'Describe the occasion or what you want the bookings team to clarify…',
briefHeading:'Your occasion brief',briefLead:'A structured set of preferences for discussion, not an approved quote or reservation.',
openReview:'View management brief',copy:'Copy brief',copied:'Copied',copyError:'Cannot copy',
noBooking:'No automatic message, availability, prices or booking confirmation is generated.',
endTitle:'Better decisions begin with better experiences.',endLead:'The 3D scene is an independent concept, not the actual property. A measured venue twin requires approved venue data and authorization.',
officialWebsite:'Official company website ↗',footer:'Unapproved independent concept · Original 3D environment',
summaryStatus:'DRAFT — UNCONFIRMED',summaryHall:'Venue',summaryType:'Occasion',summaryDate:'Preferred date',summaryMen:'Men’s guests',summaryWomen:'Women’s guests',summaryNeeds:'Questions to confirm',summaryNotes:'Notes',summaryVisual:'Illustrative 3D design direction',summaryPending:'Rates, capacities, services and date require company confirmation',unknown:'Not entered',cham:'Champagne',pearl:'Pearl',rose:'Blush',warm:'Warm',day:'Daylight',round:'Round tables',banquet:'Banquet tables',classic:'Classic aisle',wide:'Wide aisle'
}};
const fields=['hall','occasion','men','women','date'];
const $=s=>document.querySelector(s),v=id=>$('#hly-'+id)?.value||'';
let lang=localStorage.getItem(LANG)==='en'?'en':'ar',state={needs:[],notes:''};
try{const saved=JSON.parse(localStorage.getItem(STORE)||'{}');if(saved&&typeof saved==='object')state={...state,...saved};}catch{}
const u=new URLSearchParams(location.search);
function readBrief(encoded){try{return JSON.parse(decodeURIComponent(atob(encoded)))}catch{return {}}}
const brief=readBrief(u.get('brief')||'');
if(brief&&typeof brief==='object')for(const k of fields){if(Object.prototype.hasOwnProperty.call(brief,k)&&brief[k]!==null)state[k]=String(brief[k])}
try{const req=JSON.parse(u.get('requirements')||'null');if(req&&typeof req==='object'){if(Array.isArray(req.needs))state.needs=req.needs;if(typeof req.notes==='string')state.notes=req.notes}}catch{}
if(['ar','en'].includes(u.get('lang')))lang=u.get('lang');
state.needs=(Array.isArray(state.needs)?state.needs:[]).filter(k=>['catering','hospitality','bridal','audio','vip','seating','outside','access'].includes(k));
state.notes=typeof state.notes==='string'?state.notes.slice(0,750):'';
for(const k of fields){let el=$('#hly-'+k);if(el&&state[k]!==undefined)el.value=state[k]}
$('#ahx-notes').value=state.notes;
for(const input of document.querySelectorAll('[data-feature]'))input.checked=state.needs.includes(input.dataset.feature);
function persist(){for(const k of fields)state[k]=v(k);state.notes=$('#ahx-notes')?.value.slice(0,750)||'';state.needs=[...document.querySelectorAll('[data-feature]:checked')].map(el=>el.dataset.feature);
try{localStorage.setItem(STORE,JSON.stringify(state));localStorage.setItem(LANG,lang)}catch{}}
function getVisual(){try{let z=JSON.parse(localStorage.getItem(VIS)||'{}');if(z&&typeof z==='object')return z}catch{}return {}}
function visualLine(t){
 const scene=getVisual(),arr=[scene.palette==='gold'?t.cham:t[scene.palette],t[scene.light],t[scene.layout],t[scene.aisle]];
 return arr.filter(Boolean).join(' · ')||t.unknown;
}
function format(){const t=labels[lang],none=t.unknown,selected=$('#hly-hall').selectedOptions[0]?.textContent||none;
 return [t.summaryStatus,t.summaryHall+': '+selected,t.summaryType+': '+(v('occasion')==='other'?t.other:t.wedding),
  t.summaryDate+': '+(v('date')||none),t.summaryMen+': '+(v('men')||none),t.summaryWomen+': '+(v('women')||none),
  t.summaryVisual+': '+visualLine(t),t.summaryNeeds+': '+(state.needs.map(k=>t[k]).join(' · ')||none),
  t.summaryNotes+': '+(state.notes||none),'—',t.summaryPending].join('\n')}
function updateLink(){const link=$('#ahx-review'),brief={};for(const k of fields)brief[k]=v(k);
 const url=new URL(review?'../index.html':'./review/index.html',location.href);
 url.searchParams.set('brief',btoa(encodeURIComponent(JSON.stringify(brief))));
 url.searchParams.set('requirements',JSON.stringify({needs:state.needs,notes:state.notes}));
 url.searchParams.set('visual',JSON.stringify(getVisual()));
 url.searchParams.set('lang',lang);link.href=url.href}
function refresh(){persist();$('#ahx-summary').textContent=format();updateLink()}
function translate(){const t=labels[lang];document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 document.querySelectorAll('[data-i18n]').forEach(el=>{if(t[el.dataset.i18n])el.textContent=t[el.dataset.i18n]});
 document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{if(t[el.dataset.i18nPlaceholder])el.placeholder=t[el.dataset.i18nPlaceholder]});
 $('#ahx-lang').textContent=lang==='ar'?'EN':'عربي';
 refresh()}
$('#ahx-lang').addEventListener('click',()=>{lang=lang==='ar'?'en':'ar';translate()});
fields.forEach(k=>$('#hly-'+k)?.addEventListener('input',refresh));
document.querySelectorAll('[data-feature]').forEach(x=>x.addEventListener('change',refresh));
$('#ahx-notes').addEventListener('input',refresh);
document.addEventListener('alhudhudi:scene-change',refresh);
$('#lux-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.alhudhudiBuyerFit?.summary?.()||format());$('#lux-copy').textContent=labels[lang].copied}catch{$('#lux-copy').textContent=labels[lang].copyError}});
translate();
window.alhudhudiPremium={summary:()=>format(),state:()=>({...state}),reviewHref:()=>$('#ahx-review').href};
})();