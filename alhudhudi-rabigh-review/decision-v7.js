(()=>{
'use strict';
const p=document.querySelector('.lux-planner .lux-form-area');
const summary=document.querySelector('#ahx-summary');
const brief=document.querySelector('#ahx-review');
if(!p||!summary||!brief)throw new Error('Decision V7 missing canonical planner elements');
const lang=()=>document.documentElement.lang==='en'?'en':'ar';
const store='alhudhudi_buyer_fit_v8';
let sourceMode='published';try{sourceMode=localStorage.getItem(store)||'published'}catch{}
const tr={
 ar:{
 kicker:'BUYER CLARITY / 04',
 heading:'السعة المنشورة متضاربة — تأكد قبل الحجز',
 sub:'دليل زفاف نفسه يذكر تقريباً 350 رجلاً و500 امرأة في الوصف، بينما يذكر 800+ لكل قسم في الأسئلة الشائعة. لا يمكن اعتماد رقم واحد أو تحديد القاعة المناسبة دون تأكيد الإدارة.',
 published:'مصدر واحد بأرقام متعارضة',
 capacity:'السعة التقريبية المنشورة',
 men:'قسم الرجال',
 women:'قسم النساء',
 outside:'حديقة خارجية',
 guests:'ضيف',
 about:'تقريباً',
 none:'أدخل عدد الضيوف أعلاه',
 within:'تحت الرقم المذكور في الوصف، لكن السعة الحقيقية والقاعة المناسبة غير معتمدتين',
 above:'أعلى من رقم الوصف، ولكن صفحة الأسئلة تعرض 800+؛ الحكم معلّق حتى تأكيد الإدارة',
 neutral:'يتطلب تحديد القسم والقاعة من الإدارة',
 source:'المصدر: دليل زفاف (طرف ثالث)',
 note:'تعارض واضح داخل المصدر نفسه: الوصف 350/500، والأسئلة الشائعة 800+ لكلا القسمين. الرقم 300 للحديقة من الوصف فقط. لا تجمع السعات ولا تعتبرها معتمدة أو مخصصة لقاعة بعينها.',
 scenarios:'أسئلة مهمة للمسؤول',
 ask1:'يوجد تعارض 350/500 مقابل 800+ في الدليل؛ ما السعة الرسمية لكل قاعة ولكل قسم؟',
 ask2:'هل العدد والتاريخ المطلوب متاحان؟',
 ask3:'هل الخدمات المختارة مشمولة، وما التكلفة النهائية؟',
 included:'إضافة أسئلة التحقق إلى موجز المناسبة',
 select:'حدد قاعة الرجال والنساء وحالة الحديقة مع مسؤول الحجوزات؛ هذا النموذج لا يؤكد تجهيزات أي قاعة.',
 clear:'مسح أسئلة التحقق',
 questionLabel:'أسئلة التحقق اللازمة'
 },
 en:{
 kicker:'BUYER CLARITY / 04',
 heading:'Published capacity figures conflict — verify before booking',
 sub:'The same Zafaf listing describes about 350 men and 500 women, yet its FAQ states 800+ for both sections. Neither figure is a certified limit or mapped to Royal versus Moon Light.',
 published:'Conflicting numbers / Unverified',
 capacity:'Third-party indicative capacity',
 men:'Men’s section',
 women:'Women’s section',
 outside:'Outdoor garden',
 guests:'guests',
 about:'approximately',
 none:'Enter guest counts above',
 within:'Within the descriptive estimate, but the actual hall capacity is still unverified',
 above:'Higher than the descriptive estimate, but FAQ says 800+ — management must resolve the discrepancy',
 neutral:'Management must confirm the selected hall and arrangements',
 source:'Source: Zafaf venue directory (third party)',
 note:'The SAME directory contradicts itself: narrative ~350 men/~500 women, FAQ 800+ for each. Outdoor ~300 is separately mentioned. Do not add capacities or infer which figure applies to Royal/Moon Light.',
 scenarios:'Questions for the bookings team',
 ask1:'The listing says 350/500 in its description but 800+ in its FAQ. What is the official capacity of each hall/section?',
 ask2:'Is my requested guest count/date available?',
 ask3:'Which services are included, and what is the final quote?',
 included:'Add verification questions to the event brief',
 select:'Confirm men’s and women’s hall arrangements and garden use with the team; this preview does not certify facilities.',
 clear:'Remove verification questions',
 questionLabel:'Questions requiring confirmation'
 }
};
const html=[
'<div class="buyer-v7" id="buyer-v7"><div class="buyer-top"><div><span class="buyer-kicker" data-b="kicker"></span><h3 data-b="heading"></h3><p data-b="sub"></p></div><span class="buyer-pill" data-b="published"></span></div>',
'<div class="buyer-metrics">',
...['men','women','outside'].map((item,i)=>'<div class="buyer-metric"><small data-b="'+item+'"></small><strong>'+[350,500,300][i]+'<span>~</span></strong><em data-b="about"></em></div>'),
'</div>',
'<div class="buyer-source-conflict" role="note"><strong data-b="published"></strong><span class="buyer-conflict-numbers">350 / 500 <span>≠</span> 800+</span><p data-b="note"></p></div>',
'<div class="buyer-status-grid"><div class="buyer-check" id="buyer-men"><span data-b="men"></span><strong class="buyer-value">—</strong><small class="buyer-result" data-b="none"></small></div><div class="buyer-check" id="buyer-women"><span data-b="women"></span><strong class="buyer-value">—</strong><small class="buyer-result" data-b="none"></small></div></div>',
'<div class="buyer-questions"><strong data-b="scenarios"></strong><div class="buyer-question-lines"><p data-b="ask1"></p><p data-b="ask2"></p><p data-b="ask3"></p></div>',
'<label class="buyer-include"><input id="buyer-include" type="checkbox" checked><span data-b="included"></span></label></div>',
'<div class="buyer-footer"><a href="https://saudi-arabia.zafaf.net/private-wedding-venues/jeddah/al-hodhody-royal-and-moonlight-wedding-venues-38823" target="_blank" rel="noopener noreferrer" data-b="source"></a><p data-b="note"></p></div></div>'
].join('');
const formFields=p.querySelector('.lux-fields');
if(formFields)formFields.insertAdjacentHTML('afterend',html);
else p.insertAdjacentHTML('afterbegin',html);
const root=document.querySelector('#buyer-v7');
const cb=root.querySelector('#buyer-include');
const queryKeys=['#hly-men','#hly-women'];
const classify=(n,cap,t)=>{
 if(!Number.isFinite(n)||n<0)return {status:'empty',txt:t.none};
 return n>cap?{status:'conflicting',txt:t.above}:{status:'unverified',txt:t.within};
};
const state=()=>{const t=tr[lang()];return Object.fromEntries(queryKeys.map((sel,i)=>{const input=document.querySelector(sel);const raw=input?.value?.trim();const n=raw!==''&&/^\d+$/.test(raw)?Number(raw):null;const type=i?'women':'men';const s=classify(n,[350,500][i],t);return [type,{value:n,cap:[350,500][i],...s}]}));};
let enabled=true;
function render(){
 const t=tr[lang()];root.dir=lang()==='ar'?'rtl':'ltr';
 root.querySelectorAll('[data-b]').forEach(el=>{let k=el.dataset.b;if(t[k])el.textContent=t[k]});
 const st=state();
 for(const key of ['men','women']){
  const el=root.querySelector('#buyer-'+key),v=st[key];el.dataset.status=v.status;
  el.querySelector('.buyer-value').textContent=v.value===null?'—':String(v.value)+' / ~'+v.cap;
  el.querySelector('.buyer-result').textContent=v.txt;
 }
 if(enabled){
  const val=[t.questionLabel+':',t.ask1,t.ask2,t.ask3].join('\n• ');
  const origin=summary.textContent||'';
  const anchor='\n\n'+val;
  if(!origin.includes(t.questionLabel)){
   const old=origin.replace(/\n\n(?:Questions requiring confirmation|أسئلة التحقق اللازمة):[\s\S]*$/,'');
   summary.textContent=old+anchor;
  }
 }else{
  summary.textContent=(summary.textContent||'').replace(/\n\n(?:Questions requiring confirmation|أسئلة التحقق اللازمة):[\s\S]*$/,'');
 }
}
function beforeExport(){
 const summaryText=summary.textContent;
 const stage=window.alhudhudiPremium?.summary?.()||summaryText;
 const t=tr[lang()];
 const questions=enabled?('\n\n'+t.questionLabel+':\n• '+[t.ask1,t.ask2,t.ask3].join('\n• ')):'';
 return stage+questions;
}
function attachDataToReview(){
 const link=brief, url=new URL(link.href);
 url.searchParams.set('buyer_questions',enabled?'yes':'no');
 const v=state();url.searchParams.set('indicative',JSON.stringify({men:v.men.value,women:v.women.value,source:'Zafaf_description_vs_FAQ_conflict_NOT_OFFICIAL_CAPACITY'}));
 link.href=url.href;
}
const q=new URLSearchParams(location.search);
if(q.has('buyer_questions'))enabled=q.get('buyer_questions')==='yes';
cb.checked=enabled;
function refresh(){render();attachDataToReview()}
for(const x of queryKeys)document.querySelector(x)?.addEventListener('input',()=>queueMicrotask(refresh));
document.querySelector('#hly-hall')?.addEventListener('input',()=>queueMicrotask(refresh));
document.querySelector('#ahx-lang')?.addEventListener('click',()=>setTimeout(refresh,10));
document.addEventListener('alhudhudi:scene-change',()=>queueMicrotask(refresh));
cb.addEventListener('change',()=>{enabled=cb.checked;try{localStorage.setItem(store,enabled?'yes':'no')}catch{};refresh()});
const copy=document.querySelector('#lux-copy');
if(copy)copy.addEventListener('click',()=>{try{navigator.clipboard.writeText(beforeExport())}catch{}});
const observer=new MutationObserver(()=>{clearTimeout(observer._t);observer._t=setTimeout(()=>{observer.disconnect();refresh();observer.observe(summary,{childList:true,characterData:true})},40)});
observer.observe(summary,{childList:true,characterData:true});
refresh();
window.alhudhudiBuyerFit={state,summary:beforeExport,enabled:()=>enabled,source:'Zafaf narrative ~350/500 conflicts with FAQ 800+; NOT certified for either Royal/Moon Light'};
})();
