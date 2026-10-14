#!/usr/bin/env python3
"""Isolated H Laylati concept from deployed White Rose-derived venue code.
NO edit to Golden White Rose or existing Mavera deployment; NOT client-send ready.
The source venue's photographic publication rights are NOT independently validated.
"""
import os, re, pathlib, urllib.request, json, hashlib, datetime
BASE="https://mavera-jeddah-white-rose-review.vercel.app/"
OUT=pathlib.Path("candidate-hlaylati")
SOURCES={
 "index.html":BASE,
 "review/index.html":BASE+"review/",
 "wr-bilingual.css":BASE+"wr-bilingual.css",
 "wr-bilingual.js":BASE+"wr-bilingual.js",
 "hlaylati-guard.js":BASE+"mavera-guard.js",
}
PHOTOS=[
 "https://images.squarespace-cdn.com/content/v1/65ad1d399c9c5e5e2488bdbb/253a443f-fc3f-4ced-989a-f7ebcfd28b8e/WhatsApp%2BImage%2B2024-01-24%2Bat%2B3.43.35%2BPM.jpeg",
 "https://images.squarespace-cdn.com/content/v1/65ad1d399c9c5e5e2488bdbb/38c107c7-c48c-48db-90db-4b8ad80d5172/WhatsApp%2BImage%2B2024-01-24%2Bat%2B3.43.32%2BPM%2B%282%29.jpeg",
 "https://images.squarespace-cdn.com/content/v1/65ad1d399c9c5e5e2488bdbb/59c2083a-047f-4981-bf05-a000c80933b8/WhatsApp%2BImage%2B2024-01-24%2Bat%2B3.43.32%2BPM%2B%283%29.jpeg",
]
TOURS=[
 ("Badrah men","https://my.matterport.com/show/?m=q6LCks19oDu"),
 ("H Laylati VIP","https://my.matterport.com/show/?m=wERuBbYLKdP"),
 ("H Laylati women","https://my.matterport.com/show/?m=iCwo26Bo7XH"),
 ("H Laylati men","https://my.matterport.com/show/?m=HUJFxwkL1R4"),
 ("Badrah women","https://my.matterport.com/show/?m=f2PpZrQNoW7"),
]
MAP=[
 ("ماڤيرا","هذه ليلتي"),("مافيرا","هذه ليلتي"),("Mavera","H Laylati"),
 ("MAVERA","H LAYLATI"),("mavera","hlaylati"),("Mavera.sa","h-laylati.com"),
 ("نخبة المباني","H Laylati LLC"),("Jeddah","Madinah"),("جدة","المدينة المنورة"),
 ("550759944","539191090"),("0550759944","0539191090"),
 ("966550759944","966539191090"),("mavera.sa","h-laylati.com"),
]
OUT.mkdir(exist_ok=True)
manifest={"lead_lock":"SA-3F-20261014-HLAYLATI-MADINAH","base":"Mavera client-isolated White Rose derivative; NOT original Golden mutation",
 "verified_contact":"https://www.h-laylati.com/","official_3D":TOURS,"originals_unchanged":True,"no_outreach":True,
 "production_rights_independently_confirmed":False,"official_current_package_terms_confirmed":False,
 "real_booking_backend":False,"client_send_ready":False,"fetched":{}}
for name,url in SOURCES.items():
 req=urllib.request.Request(url,headers={"User-Agent":"DigitalArhatConceptQA/1.0"})
 with urllib.request.urlopen(req,timeout=40) as r:
  raw=r.read()
  if r.status!=200:raise RuntimeError((url,r.status))
 s=raw.decode("utf-8")
 if name=="index.html" and ("Mavera" not in s and "ماڤيرا" not in s):raise RuntimeError("Wrong source site")
 for old,new in MAP:s=s.replace(old,new)
 # Purge *previous prospect's photo* links; replace ONLY with original-source H Laylati photography candidates.
 media=set(re.findall(r'https?://(?:ik\.imagekit\.io|qa3at\.com|www\.mavera\.sa|mavera\.sa)[^\s"<>)]*',s,re.I))
 for i,old in enumerate(sorted(media)):
  replacement=PHOTOS[i%len(PHOTOS)] if ("imagekit" in old or "qa3at.com" in old) else "https://www.h-laylati.com/"
  s=s.replace(old,replacement)
 # Clean old prior business URLs lingering after simple branding substitution.
 s=s.replace("https://www.h-laylati.com/halls/","https://www.h-laylati.com/services")
 s=s.replace("https://www.h-laylati.com/booking/","https://www.h-laylati.com/")
 if name.endswith(".html"):
  if "</head>" not in s or "</body>" not in s:raise RuntimeError("Bad Golden-derived page: "+name)
  s=s.replace("</head>",'<link rel="stylesheet" href="/hlaylati-layer.css"></head>',1)
  s=s.replace("</body>",'<script defer src="/hlaylati-layer.js"></script></body>',1)
 if name=="index.html" and "mavera-guard.js" in s:raise RuntimeError("Old guard survived")
 # Defend exact Golden identity and unrelated client leakage.
 forbidden=["Mavera","ماڤيرا","مافيرا","White Rose","الوردة البيضاء","memoriesforevents.com","qa3at.com"]
 bad=[v for v in forbidden if v.lower() in s.lower()]
 if bad:raise RuntimeError("Cross-prospect strings in "+name+": "+str(bad))
 dst=OUT/name;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_text(s,encoding="utf8")
 manifest["fetched"][name]={"source":url,"source_bytes":len(raw),"sha256":hashlib.sha256(raw).hexdigest(),"written_bytes":len(s.encode())}
(OUT/"hlaylati-layer.css").write_text(r"""
#hly-component{color:#f7f2e9; background:linear-gradient(150deg,#11100f,#1e1a16 75%,#17130f);padding:24px 0 58px;direction:rtl; position:relative; z-index:2;font-family:"Noto Kufi Arabic",Tahoma,Arial,sans-serif}
#hly-component *{box-sizing:border-box} #hly-component .hly-wrap{width:min(1120px,calc(100% - 32px));margin:auto}
#hly-component .hly-intro{display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap}
#hly-component .hly-chip{color:#e6cc94;font-weight:700;font-size:12px;letter-spacing:.05em}
#hly-component h1{font-weight:800;font-size:clamp(29px,4.5vw,55px);line-height:1.34;margin:14px 0}
#hly-component .hly-desc{color:#c5b7a2;font-size:14px;line-height:2;max-width:820px;margin:10px 0 18px}
#hly-component .hly-photo{display:grid;grid-template-columns:1.65fr 1fr;gap:12px;margin:22px 0 28px}
#hly-component .hly-photo img{display:block;width:100%;height:clamp(190px,24vw,320px);object-fit:cover;border:1px solid #5c4b34;border-radius:15px;background:#322d26}
#hly-component .hly-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
#hly-component .hly-box{background:#25221e;border:1px solid #514533;padding:20px;border-radius:17px}
#hly-component label{display:block;font-size:12px;color:#d5c7b4;margin:10px 0 5px}
#hly-component input,#hly-component select{width:100%;padding:11px 12px;color:#f9f4ec;background:#161513;border:1px solid #625743;border-radius:9px;min-height:46px}
#hly-component select option{background:#161513}
#hly-component .hly-notice{padding:12px 15px;background:#3a3021;border:1px solid #83633c;color:#f4dbb3;border-radius:12px;font-size:12px;line-height:1.9}
#hly-component .hly-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:17px}
#hly-component button,#hly-component .hly-link{border:1px solid #b2955d;padding:10px 18px;border-radius:10px;display:inline-block;color:#1b1710;background:#d7bf89;text-decoration:none;font-size:12px;font-weight:700;cursor:pointer}
#hly-component .hly-link.alt,#hly-component button.alt{background:transparent;color:#edd7aa}
#hly-component .hly-summary{white-space:pre-line;color:#e9dec8;font-size:13px;line-height:1.85}
#hly-component a.hly-tour{display:inline-block;margin:8px 8px 4px 0;font-size:12px;color:#e9d4a5;border-bottom:1px solid #94794b}
#hly-component[data-en="1"]{direction:ltr;font-family:Arial,sans-serif}
@media(max-width:720px){#hly-component .hly-photo,#hly-component .hly-grid{grid-template-columns:1fr}#hly-component .hly-box{padding:15px}#hly-component .hly-photo img{height:225px}}
""",encoding="utf8")
(OUT/"hlaylati-layer.js").write_text(r"""
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
""",encoding="utf8")
(OUT/"candidate-meta.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf8")
print("HLAYLATI_SOURCE",json.dumps({"files":{p.name:p.stat().st_size for p in OUT.rglob("*") if p.is_file()},"rights_verified":False,"source":"Mavera White Rose derivative","origin_unchanged":True},ensure_ascii=False))
