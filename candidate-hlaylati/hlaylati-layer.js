
(()=>{
"use strict";
const REV=location.pathname.startsWith('/review'), KEY="digitalarhat_hlaylati_private_concept_v1";
const PHOTOS=[
"https://images.squarespace-cdn.com/content/v1/65ad1d399c9c5e5e2488bdbb/253a443f-fc3f-4ced-989a-f7ebcfd28b8e/WhatsApp%2BImage%2B2024-01-24%2Bat%2B3.43.35%2BPM.jpeg",
"https://images.squarespace-cdn.com/content/v1/65ad1d399c9c5e5e2488bdbb/38c107c7-c48c-48db-90db-4b8ad80d5172/WhatsApp%2BImage%2B2024-01-24%2Bat%2B3.43.32%2BPM%2B%282%29.jpeg"];
const TOURS=[
["Badrah – Men","https://my.matterport.com/show/?m=q6LCks19oDu"],
["H Laylati – VIP","https://my.matterport.com/show/?m=wERuBbYLKdP"],
["H Laylati – Women","https://my.matterport.com/show/?m=iCwo26Bo7XH"],
["H Laylati – Men","https://my.matterport.com/show/?m=HUJFxwkL1R4"],
["Badrah – Women","https://my.matterport.com/show/?m=f2PpZrQNoW7"]];
function escapeH(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch{return {}}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
let state={hall:"laylati",men:"",women:"",date:"",occasion:"wedding",...read()};
try{const q=new URLSearchParams(location.search).get("brief"); if(REV&&q){const x=JSON.parse(decodeURIComponent(atob(q))); if(["laylati","badrah"].includes(x.hall))state={hall:x.hall,men:String(x.men||""),women:String(x.women||""),date:x.date||"",occasion:x.occasion||"wedding"};}}catch{}
const root=document.createElement('section');root.id='hly-component';root.dataset.en='0';
root.innerHTML='<div class="hly-wrap"><div class="hly-intro"><div class="hly-chip">H LAYLATI LLC · MADINAH · UNOFFICIAL CONCEPT / تصور غير رسمي</div><button class="alt" id="hly-lang" type="button">EN</button></div><h1 id="hly-title"></h1><p class="hly-desc" id="hly-sub"></p><div class="hly-photo"><img alt="Photo source: H Laylati official website, rights verification pending" src="'+escapeH(PHOTOS[0])+'"><img alt="Photo source: H Laylati official website, rights verification pending" src="'+escapeH(PHOTOS[1])+'"></div><p class="hly-notice" id="hly-warning"></p><div class="hly-grid"><div class="hly-box" id="hly-form-box"><label id="hly-l-hall"></label><select id="hly-hall"><option value="laylati">هذه ليلتي — H Laylati</option><option value="badrah">بدرة — Badrah</option></select><label id="hly-l-men"></label><input id="hly-men" type="number" min="0" max="5000" inputmode="numeric" placeholder="0"><label id="hly-l-women"></label><input id="hly-women" type="number" min="0" max="5000" inputmode="numeric" placeholder="0"><label id="hly-l-date"></label><input id="hly-date" type="date"><label id="hly-l-occasion"></label><select id="hly-occasion"><option value="wedding"></option><option value="other"></option></select><div class="hly-actions"><button id="hly-update" type="button"></button><a id="hly-review" class="hly-link" href="/review/"></a></div></div><div class="hly-box"><h2 id="hly-summary-heading"></h2><p id="hly-summary" class="hly-summary"></p><p class="hly-desc" id="hly-links-label"></p><div id="hly-tours"></div><div class="hly-actions"><a class="hly-link alt" href="https://www.h-laylati.com/services" target="_blank" rel="noopener" id="hly-official-tours"></a><a class="hly-link alt" href="https://www.h-laylati.com/s/.pdf" target="_blank" rel="noopener" id="hly-official-pdf"></a><a class="hly-link alt" href="mailto:info@hlaylati.com" id="hly-email"></a></div><p id="hly-review-note" class="hly-desc"></p></div></div></div>';
document.body.insertBefore(root,document.body.firstChild);
const $=id=>root.querySelector('#'+id);
let en=false;
const dict={
 ar:{title:REV?"مراجعة الإدارة — تصور غير رسمي":"اختيار القاعة والباقات — مسودة للعميل",sub:REV?"ملخص احتياجات المناسبة للمراجعة اليدوية؛ هذه ليست بوابة إدارة حقيقية ولا تفيد موافقة القاعة.":"أكمل تفاصيل المناسبة بشكل مبدئي، ثم راجع الاختيار مع فريق القاعات عبر القنوات الرسمية.",warning:"مهم: هذا نموذج مستقل وغير تابع رسميًا للشركة. الأسعار والباقات والسعة والتواريخ ليست معتمدة داخل هذا النموذج؛ ولا يتم إرسال طلب أو تأكيد حجز تلقائيًا. صور المصدر الأصلي معروضة ضمن نموذج مفاهيمي مع بقاء حقوق إعادة الاستخدام بحاجة للتحقق.",hall:"القاعة",men:"عدد ضيوف الرجال (مبدئي)",women:"عدد ضيوف النساء (مبدئي)",date:"تاريخ المناسبة (مبدئي وغير مؤكد)",occasion:"نوع المناسبة",wedding:"زفاف",other:"مناسبة أخرى",update:"تحديث الملخص",review:"فتح مسودة مراجعة الإدارة",summary:"مسودة التفاصيل",links:"الجولات الرسمية الموجودة مسبقاً على موقع الشركة",tours:"فتح الجولات ثلاثية الأبعاد الرسمية",pdf:"الاطلاع على باقات PDF المنشورة (سريانها غير متحقق)",email:"التواصل مع الشركة",note:"هذه المراجعة تصور محلي فقط؛ لا تتصل بنظام الحجز أو الإدارة ولا تثبت السعر أو التوافر.",none:"لم يحدد",draft:"مسودة غير مؤكدة",dateLabel:"التاريخ",hallLabel:"القاعة",menLabel:"الرجال",womenLabel:"النساء",catLabel:"المناسبة",day:"نوع اليوم",weekend:"الجمعة/السبت",weekday:"الأحد–الخميس",ask:"السعر الرسمي حسب عرض القاعة (غير محدد)",copied:"تم تحديث رابط المراجعة محلياً"},
 en:{title:REV?"Management review — unofficial concept":"Venue and package decision brief",sub:REV?"This is a manual review prototype, NOT a connected booking or genuine management approval portal.":"Collect an indicative brief, then discuss options with the venue through its existing official contacts.",warning:"Important: independent unofficial concept. No confirmed prices, dates, guest capacities, bookings or company approval. Images link to first-party venue photo URLs; reuse rights remain unverified.",hall:"Venue",men:"Men's guests (indicative)",women:"Women's guests (indicative)",date:"Event date (tentative)",occasion:"Occasion",wedding:"Wedding",other:"Other event",update:"Update brief",review:"Open management review draft",summary:"Decision brief",links:"Existing official venue 3D tours",tours:"Official 3D tours",pdf:"Published package PDF (current validity unverified)",email:"Email the venue",note:"Prototype review only; no venue manager signed off, no official prices or availability synchronisation.",none:"Not specified",draft:"UNCONFIRMED DRAFT",dateLabel:"Date",hallLabel:"Hall",menLabel:"Men",womenLabel:"Women",catLabel:"Occasion",day:"Day type",weekend:"Friday/Saturday",weekday:"Sunday–Thursday",ask:"Official quote required",copied:"Review link updated"}};
function label(id,val){$(id).textContent=val}
function toBrief(){const i=dict[en?'en':'ar'];let day=i.none; if(state.date){let d=new Date(state.date+"T12:00:00").getDay(); day=(d===5||d===6)?i.weekend:i.weekday;} return [i.draft,i.hallLabel+": "+(state.hall==="laylati"?"هذه ليلتي — H Laylati":"بدرة — Badrah"),i.menLabel+": "+(state.men||i.none),i.womenLabel+": "+(state.women||i.none),i.dateLabel+": "+(state.date||i.none),i.day+": "+day,i.catLabel+": "+(state.occasion==="wedding"?i.wedding:i.other),i.ask].join("\n");}
function refresh(){
 const t=dict[en?'en':'ar'];root.dataset.en=en?'1':'0';$('hly-lang').textContent=en?'العربية':'EN';
 ['title','sub','warning'].forEach(k=>label('hly-'+k,t[k]));
 ['hall','men','women','date','occasion'].forEach(k=>label('hly-l-'+k,t[k]));
 label('hly-update',t.update);label('hly-review',t.review);label('hly-summary-heading',t.summary);
 label('hly-summary',toBrief());label('hly-links-label',t.links);label('hly-official-tours',t.tours);label('hly-official-pdf',t.pdf);label('hly-email',t.email);label('hly-review-note',t.note);
 $('hly-occasion').options[0].text=t.wedding;$('hly-occasion').options[1].text=t.other;
 $('hly-tours').innerHTML=TOURS.map(([name,url])=>'<a class="hly-tour" target="_blank" rel="noopener" href="'+escapeH(url)+'">'+escapeH(name)+' ↗</a>').join(" ");
 const brief=Object.fromEntries(["hall","men","women","date","occasion"].map(k=>[k,state[k]]));
 $('hly-review').href='/review/?brief='+encodeURIComponent(btoa(encodeURIComponent(JSON.stringify(brief))));
}
for(const [id,key] of [['hly-hall','hall'],['hly-men','men'],['hly-women','women'],['hly-date','date'],['hly-occasion','occasion']]){
 $(id).value=state[key];$(id).addEventListener('input',e=>{state[key]=e.target.value;save(state);refresh();});
}
$('hly-update').addEventListener('click',()=>{save(state);refresh();});
$('hly-lang').addEventListener('click',()=>{en=!en;refresh()});
refresh();
})();
