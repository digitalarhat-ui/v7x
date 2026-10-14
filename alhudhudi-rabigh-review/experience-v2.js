(()=>{
'use strict';
const REVIEW=location.pathname.includes('/review/');
const STORE='digital_arhat_alhudhudi_v2_additional_requirements';
const LANG_STORE='digital_arhat_alhudhudi_v2_lang';
const source={
  company:'https://www.alhudhudi.com.sa/',
  media:'https://www.alhudhudi.com.sa/our_media/',
  tour:'https://www.snapchat.com/%40alhudhudi.co/spotlight/W7_EDlXWTBiXAEEniNoMPwAAYZWtvcnZxbWNyAZrqsZmhAZrqpkpeAAAAAw',
  gallery:'https://saudi-arabia.zafaf.net/private-wedding-venues/jeddah/al-hodhody-royal-and-moonlight-wedding-venues-38823'
};
const features=['hospitality','catering','bridal','audio','vip','seating','outside','access'];
const tr={
ar:{
eyebrow:'RABIGH · VENUE DECISION STUDIO',title:REVIEW?'مراجعة واضحة قبل عرض السعر':'تجربة القاعة تبدأ قبل الزيارة',
lead:REVIEW?'هذا موجز العميل للمناقشة الداخلية فقط. لا يوجد اعتماد فعلي من إدارة القاعة.':'من مشاهدة القاعة إلى اختيار رويال أو مون لايت، ثم تحديد متطلبات المناسبة ومشاركتها في موجز واحد قابل للمراجعة.',
source:'الحقائق المنشورة',select:'١ — اختر الوجهة',selectCaption:'يؤكد موقع الشركة وجود وجهتين، لكن السعات والتجهيزات والأسعار النهائية تحتاج موافقة الإدارة.',
royal:'الهدهدي رويال',royalMini:'Royal Hall',royalTag:'المشهد الملكي',royalDesc:'تصفه الشركة بأنه وجهة ملكية واسعة للمناسبات. بيانات السعة والتقسيمات غير معتمدة هنا.',
moon:'مون لايت',moonMini:'Moon Light',moonTag:'وجهة مستقلة',moonDesc:'تصفه الشركة بأنه قاعة مستقلة بأجواء هادئة. تفاصيل الخدمات النهائية تحتاج تأكيداً مباشراً.',
selected:'الخيار الحالي',unverified:'غير معتمد',published:'منشور من الشركة',mediaTitle:'٢ — استكشف الأدلة الأصلية',mediaLead:'شاهد المحتوى من مصدره الأصلي، دون إعادة نشر الصور داخل هذا العرض التجريبي.',
videoTitle:'فيديو القاعة من حساب الشركة',videoDesc:'سناب شات · مادة مرئية منشورة من الحساب المنسوب للشركة',galleryTitle:'الصور المنشورة للقاعات',galleryDesc:'معرض صور طرف ثالث؛ تحقق من هوية كل صورة وتاريخها قبل اعتمادها',storyTitle:'المعلومة الرسمية عن القاعتين',storyDesc:'وصف الشركة لرويال ومون لايت بتاريخ 11 مايو 2026',
open:'فتح المصدر',unavailable:'لم نعثر على جولة Matterport أو 360 رسمية موثقة لهذا النشاط. روابط الصور والفيديو ليست جولة 3D.',
packageTitle:'٣ — اصنع طلب الباقة المناسب',packageLead:'اختر ما تريد من الفريق تأكيده. هذه متطلبات مطلوبة وليست خدمات أو أسعاراً مضمونة.',
hospitality:'خدمات الضيافة',catering:'العشاء والبوفيه',bridal:'غرفة تجهيز العروس',audio:'الإضاءة والصوت',vip:'أماكن كبار الضيوف',seating:'تنسيق الجلسات والطاولات',outside:'المساحات الخارجية',access:'المداخل ومواقف السيارات',
factsTitle:'منشور مقابل ما ينتظر الاعتماد',fact1:'وجهتا رويال ومون لايت',fact1Status:'مؤكد من منشور الشركة',fact2:'أسعار الباقات وتوافر التاريخ',fact2Status:'يلزم عرض رسمي',fact3:'سعة كل قسم وخدمات كل قاعة',fact3Status:'يلزم اعتماد الشركة',fact4:'مواعيد الحجز والدفع',fact4Status:'يلزم اعتماد الشركة',
briefTitle:'٤ — موجز قرار العميل',briefLead:'معلومات أولية يراجعها موظف الحجوزات، وليست حجزاً أو فاتورة.',
notes:'ملاحظة أو طلب مخصص',notesPlaceholder:'مثلاً: نريد معرفة قاعة مناسبة للرجال والنساء مع خدمة عشاء...',
copy:'نسخ موجز العميل',review:'مراجعة الإدارة ↗',back:'العودة لتجربة العميل ↗',official:'الموقع الرسمي ↗',notSent:'لم تُرسل أي رسالة ولا يمكن تأكيد توافر أو حجز في هذا النموذج.',
unknown:'غير محدد',date:'التاريخ',men:'ضيوف الرجال',women:'ضيوف النساء',event:'المناسبة',hall:'القاعة',services:'التفاصيل المطلوب تأكيدها',dateLine:'لم يتم التحقق من التوافر',ready:'مسودة طلب عرض — بانتظار الفريق',copied:'تم نسخ الموجز',copyFail:'تعذر النسخ',
legal:'عرض مستقل غير تابع رسمياً للشركة. التصوير الحقيقي محفوظ لدى الناشرين الأصليين ولا ندّعي حق إعادة نشره. التصور المعماري في الخلفية زخرفي وليس صورة للقاعة.',
next:'استكمل العدد والتاريخ في نموذج المناسبة أسفل هذه التجربة. يتحدث كلا القسمين عن نفس الاختيار.'
},
en:{
eyebrow:'RABIGH · VENUE DECISION STUDIO',title:REVIEW?'Clear requirements before a quote':'Your venue journey starts before the visit',
lead:REVIEW?'A local customer brief for discussion only, not venue management approval.':'Explore Royal and Moon Light, decide what matters, and carry one reviewable requirements brief into the venue discussion.',
source:'Published facts',select:'01 — Choose your venue',selectCaption:'Both venues are confirmed in the company post; capacities, packages and pricing must be approved by management.',
royal:'Al-Hudhudi Royal',royalMini:'Royal Hall',royalTag:'Grand celebration',royalDesc:'The company describes a spacious, royal-style venue. No room count, capacity or price is asserted here.',
moon:'Moon Light',moonMini:'Independent venue',moonTag:'Independent setting',moonDesc:'The company describes a distinct, quieter hall. Actual services require direct confirmation.',
selected:'Your current selection',unverified:'Unapproved',published:'Company-published',mediaTitle:'02 — Explore original evidence',mediaLead:'Open venue photos and video at their original published sources; no copyrighted photographs are republished here.',
videoTitle:'Company-posted venue video',videoDesc:'Snapchat · video from an account attributed to the business',galleryTitle:'Published venue photographs',galleryDesc:'Third-party gallery; individual photo identity and recency still need validation',storyTitle:'Official two-venue announcement',storyDesc:'The company published the Royal/Moon Light description on May 11, 2026',
open:'Open original',unavailable:'No verified official Matterport or 360° tour was found for this business. Photos/videos are not described as 3D.',
packageTitle:'03 — Prepare a package enquiry',packageLead:'Select what the team should confirm. These are customer requests, not promises that facilities or rates are included.',
hospitality:'Hospitality service',catering:'Dinner and buffet',bridal:'Bridal preparation room',audio:'Lighting and sound',vip:'VIP areas',seating:'Tables and seating',outside:'Outdoor areas',access:'Entrances and parking',
factsTitle:'What is public / what must be confirmed',fact1:'Royal and Moon Light venue identities',fact1Status:'Company-published',fact2:'Package prices and requested date',fact2Status:'Official quote required',fact3:'Each hall’s capacity and services',fact3Status:'Management confirmation',fact4:'Booking and payment terms',fact4Status:'Management confirmation',
briefTitle:'04 — Your decision brief',briefLead:'For the bookings team to review, not a booking or invoice.',
notes:'Additional request',notesPlaceholder:'For example: Is there a suitable men’s and women’s arrangement with catering?',
copy:'Copy customer brief',review:'Management review ↗',back:'Back to customer experience ↗',official:'Official website ↗',notSent:'Nothing has been sent. Availability and bookings have not been confirmed.',
unknown:'Not entered',date:'Date',men:'Men’s guests',women:'Women’s guests',event:'Event',hall:'Venue',services:'Requirements to confirm',dateLine:'Availability unchecked',ready:'Unapproved quote enquiry draft',copied:'Brief copied',copyFail:'Copy unavailable',
legal:'Independent, unofficial prototype. Real media stays with its original publishers; no reuse rights are claimed. Decorative architectural artwork is not an actual venue photograph.',
next:'Complete guest counts and preferred date in the event form below. Both sections use the same venue choice.'
}
};
let state={lang:'ar',needs:[],notes:''};
try{const saved=JSON.parse(localStorage.getItem(STORE)||'{}');if(saved&&typeof saved==='object')Object.assign(state,saved);}catch{}
state.lang=localStorage.getItem(LANG_STORE)||state.lang;
const args=new URLSearchParams(location.search);
try{const n=JSON.parse(args.get('requirements')||'null');if(n&&Array.isArray(n.needs))state.needs=n.needs.filter(x=>features.includes(x));if(n&&typeof n.notes==='string')state.notes=n.notes.slice(0,750);}catch{}
state.lang=state.lang==='en'?'en':'ar';state.needs=[...new Set(state.needs)].filter(x=>features.includes(x));
const html='<div class="ahx-shell"><div class="ahx-head"><div><div class="ahx-kicker" data-l="eyebrow"></div><h2 data-l="title"></h2><p data-l="lead"></p></div><button type="button" class="ahx-lang" id="ahx-lang">EN / العربية</button></div>'+
'<div class="ahx-eyebrow" data-l="select"></div><p class="ahx-minor" data-l="selectCaption"></p>'+
'<div class="ahx-venues"><button class="ahx-venue is-royal" type="button" data-hall="royal" aria-pressed="true"><span class="ahx-arch"></span><span class="ahx-hall-no">01 / RABIGH</span><span class="ahx-venue-tag" data-l="royalTag"></span><strong data-l="royal"></strong><small data-l="royalDesc"></small><span class="ahx-choose" data-l="selected"></span></button>'+
'<button class="ahx-venue is-moon" type="button" data-hall="moonlight" aria-pressed="false"><span class="ahx-arch"></span><span class="ahx-hall-no">02 / RABIGH</span><span class="ahx-venue-tag" data-l="moonTag"></span><strong data-l="moon"></strong><small data-l="moonDesc"></small><span class="ahx-choose" data-l="selected"></span></button></div>'+
'<div class="ahx-section-title" data-l="mediaTitle"></div><p class="ahx-minor" data-l="mediaLead"></p><div class="ahx-media">'+
'<a class="ahx-media-card" href="'+source.tour+'" target="_blank" rel="noopener noreferrer"><span class="ahx-media-icon">▶</span><span><strong data-l="videoTitle"></strong><small data-l="videoDesc"></small></span><em data-l="open"></em></a>'+
'<a class="ahx-media-card" href="'+source.gallery+'" target="_blank" rel="noopener noreferrer"><span class="ahx-media-icon">▧</span><span><strong data-l="galleryTitle"></strong><small data-l="galleryDesc"></small></span><em data-l="open"></em></a>'+
'<a class="ahx-media-card" href="'+source.media+'" target="_blank" rel="noopener noreferrer"><span class="ahx-media-icon">✦</span><span><strong data-l="storyTitle"></strong><small data-l="storyDesc"></small></span><em data-l="open"></em></a></div><p class="ahx-missing" data-l="unavailable"></p>'+
'<div class="ahx-package-grid"><section class="ahx-requests"><div class="ahx-section-title" data-l="packageTitle"></div><p class="ahx-minor" data-l="packageLead"></p><div class="ahx-needs">'+features.map(f=>'<label><input type="checkbox" value="'+f+'" data-feature="'+f+'"><span data-l="'+f+'"></span></label>').join('')+'</div><label class="ahx-notes-label" data-l="notes" for="ahx-notes"></label><textarea id="ahx-notes" rows="3" maxlength="750"></textarea></section>'+
'<section class="ahx-facts"><div class="ahx-section-title" data-l="factsTitle"></div>'+[1,2,3,4].map(i=>'<div class="ahx-fact"><span data-l="fact'+i+'"></span><b data-l="fact'+i+'Status" class="'+(i===1?'ahx-proven':'')+'"></b></div>').join('')+'<a href="'+source.company+'" target="_blank" rel="noopener noreferrer" data-l="official" class="ahx-official"></a></section></div>'+
'<div class="ahx-brief"><div class="ahx-brief-heading"><div><span>YOUR REQUIREMENTS / الطلب</span><h3 data-l="briefTitle"></h3><p data-l="briefLead"></p></div><span class="ahx-stamp" data-l="unverified"></span></div><pre id="ahx-summary"></pre><div class="ahx-actions"><a href="./review/index.html" id="ahx-review" class="ahx-primary" data-l="'+(REVIEW?'back':'review')+'"></a><button type="button" id="ahx-copy" data-l="copy"></button></div><p class="ahx-minor" data-l="notSent"></p></div><div class="ahx-foot"><p data-l="legal"></p><p data-l="next"></p></div></div>';
const section=document.createElement('section');section.id='ahx-v2';section.innerHTML=html;section.dir=state.lang==='ar'?'rtl':'ltr';
const old=document.querySelector('#hly-component');
if(old){old.insertAdjacentElement('afterbegin',section)}else document.body.prepend(section);
const $=q=>section.querySelector(q);
const hly=q=>document.querySelector(q);
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify({needs:state.needs,notes:state.notes}));localStorage.setItem(LANG_STORE,state.lang)}catch{}};
const readHall=()=>{const v=hly('#hly-hall')?.value;return v==='moonlight'?'moonlight':'royal'};
function getBrief(){
 const stored=readHall(),t=tr[state.lang],val=id=>hly('#hly-'+id)?.value||t.unknown;
 return {hall:stored,men:val('men'),women:val('women'),date:val('date'),occasion:val('occasion'),needs:state.needs.slice(),notes:state.notes};
}
function textSummary(){
 const t=tr[state.lang],b=getBrief(),venue=b.hall==='royal'?t.royal:t.moon;
 return [t.ready,t.hall+': '+venue,t.event+': '+(b.occasion==='other'?(state.lang==='ar'?'مناسبة أخرى':'Other event'):(state.lang==='ar'?'زفاف':'Wedding')),t.date+': '+b.date+' ('+t.dateLine+')',t.men+': '+b.men,t.women+': '+b.women,t.services+': '+(b.needs.length?b.needs.map(n=>t[n]).join(' · '):t.unknown),t.notes+': '+(state.notes||t.unknown),t.notSent].join('\n');
}
function refresh(){
 const t=tr[state.lang];section.dir=state.lang==='ar'?'rtl':'ltr';
 section.querySelectorAll('[data-l]').forEach(el=>{let key=el.dataset.l;if(t[key])el.textContent=t[key]});
 $('#ahx-notes').placeholder=t.notesPlaceholder;$('#ahx-notes').value=state.notes;
 $('#ahx-lang').textContent=state.lang==='ar'?'English':'العربية';
 for(const button of section.querySelectorAll('[data-hall]')){const on=button.dataset.hall===readHall();button.setAttribute('aria-pressed',String(on));button.classList.toggle('active',on)}
 section.querySelectorAll('[data-feature]').forEach(e=>{e.checked=state.needs.includes(e.value)});
 $('#ahx-summary').textContent=textSummary();
 const b=getBrief();
 const url=new URL(REVIEW?'../index.html':'./review/index.html',location.href);
 const brief={hall:b.hall,men:b.men===t.unknown?'':b.men,women:b.women===t.unknown?'':b.women,date:b.date===t.unknown?'':b.date,occasion:b.occasion==='other'?'other':'wedding'};
 url.searchParams.set('brief',btoa(encodeURIComponent(JSON.stringify(brief))));
 url.searchParams.set('requirements',JSON.stringify({needs:b.needs,notes:b.notes}));
 url.searchParams.set('lang',state.lang);
 $('#ahx-review').href=url.href;
}
section.querySelectorAll('[data-hall]').forEach(btn=>btn.addEventListener('click',()=>{
 const sel=hly('#hly-hall');if(!sel)return;
 sel.value=btn.dataset.hall;sel.dispatchEvent(new Event('input',{bubbles:true}));refresh();
}));
section.querySelectorAll('[data-feature]').forEach(cb=>cb.addEventListener('change',()=>{
 state.needs=[...section.querySelectorAll('[data-feature]:checked')].map(e=>e.value);save();refresh();
}));
$('#ahx-notes').addEventListener('input',e=>{state.notes=e.target.value.slice(0,750);save();$('#ahx-summary').textContent=textSummary();refreshReviewHref()});
function refreshReviewHref(){const l=$('#ahx-review');const u=new URL(l.href);u.searchParams.set('requirements',JSON.stringify({needs:state.needs,notes:state.notes}));l.href=u.href;}
$('#ahx-lang').addEventListener('click',()=>{state.lang=state.lang==='ar'?'en':'ar';save();window.alhudhudiLocale?.setLanguage?.(state.lang);refresh()});
$('#ahx-copy').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(textSummary());$('#ahx-copy').textContent=tr[state.lang].copied}
 catch{$('#ahx-copy').textContent=tr[state.lang].copyFail}
});
['#hly-hall','#hly-men','#hly-women','#hly-date','#hly-occasion'].forEach(id=>hly(id)?.addEventListener('input',refresh));
refresh();
})();