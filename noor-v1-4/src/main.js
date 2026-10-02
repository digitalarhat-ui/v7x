import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './styles.css';

const HARAJ_URL = 'https://haraj.com.sa/11142952182/';

const visualColors = [
  { id:'ivory', name:'عاجي', hex:'#e9e3d6' },
  { id:'sand', name:'رملي', hex:'#cdbb9d' },
  { id:'greige', name:'جريج', hex:'#aaa292' },
  { id:'sage', name:'أخضر هادئ', hex:'#8a9b86' },
  { id:'olive', name:'زيتوني', hex:'#5d6c56' },
  { id:'navy', name:'كحلي', hex:'#334557' },
  { id:'charcoal', name:'فحمي', hex:'#3e4445' },
  { id:'black', name:'أسود', hex:'#222426' },
  { id:'walnut', name:'جوزي', hex:'#7f5b40' },
  { id:'oak', name:'بلوط فاتح', hex:'#ba946c' },
  { id:'terracotta', name:'طوبي', hex:'#a76550' },
  { id:'white', name:'أبيض', hex:'#f1f0eb' }
];

const cabinetFamilies = [
  { id:'sheet', name:'صاج', roughness:.38, metalness:.22 },
  { id:'aluminium', name:'ألمنيوم', roughness:.28, metalness:.42 },
  { id:'formica', name:'فورميكا', roughness:.48, metalness:.03 },
  { id:'cladding', name:'كلادينج', roughness:.32, metalness:.18 }
];

const countertopFamilies = [
  { id:'industrial', name:'رخام صناعي', hex:'#e9e5dd', roughness:.28 },
  { id:'natural', name:'رخام طبيعي', hex:'#d1c7b7', roughness:.34 },
  { id:'galaxy', name:'جلاكسي', hex:'#242429', roughness:.24 },
  { id:'indian', name:'رخام هندي', hex:'#b78360', roughness:.38 }
];

const finishes = [
  { id:'matte', name:'مطفي', roughness:.62 },
  { id:'satin', name:'ساتان', roughness:.38 },
  { id:'gloss', name:'لامع', roughness:.18 }
];

const requestTypes = [
  { id:'ready', name:'جاهز' },
  { id:'modified', name:'جاهز معدل' },
  { id:'custom', name:'تفصيل حسب الطلب' }
];

const services = [
  { id:'install', name:'تركيب' },
  { id:'delivery', name:'توصيل / نقل' },
  { id:'maintenance', name:'صيانة' }
];

const galleryImages = [
  'https://postcdn.haraj.com.sa/userfiles30/2024-8-31/540x1155-1_-MajmM4l5AyJqGt.jpg-700.webp',
  'https://postcdn.haraj.com.sa/userfiles30/2024-8-31/1000x750-1_-SVHk7F6Vtr3fTL.jpg-700.webp',
  'https://postcdn.haraj.com.sa/userfiles30/2024-8-31/1000x750-1_-VnBSPvE4ggLg5C.jpg-700.webp',
  'https://postcdn.haraj.com.sa/userfiles30/2024-8-31/750x1000-1_-bkYC7oOF65qh2y.jpg-700.webp'
];

const defaultState = {
  request:'custom',
  family:'aluminium',
  base:'ivory',
  upper:'ivory',
  counter:'industrial',
  finish:'matte',
  light:'day',
  services:['install'],
  layout:'',
  width:'',
  depth:'',
  appliances:'',
  city:'',
  note:''
};

const loadUrlState = () => {
  const q = new URLSearchParams(location.search);
  const next = structuredClone(defaultState);
  const keys = ['request','family','base','upper','counter','finish','light','layout','width','depth','appliances','city','note'];
  keys.forEach((key) => {
    if (q.has(key)) next[key] = q.get(key) || '';
  });
  if (q.has('services')) next.services = (q.get('services') || '').split(',').filter(Boolean);
  return next;
};

let state = loadUrlState();
let snapshotA = null;
let snapshotB = null;
let sceneApi = null;

const app = document.querySelector('#app');

function swatchMarkup(kind, selected) {
  return visualColors.map((c) => `
    <button class="swatch ${selected===c.id?'active':''}" data-kind="${kind}" data-value="${c.id}" aria-pressed="${selected===c.id}">
      <i style="background:${c.hex}"></i><span>${c.name}</span>
    </button>`).join('');
}

function optionMarkup(list, kind, selected) {
  return list.map((o) => `
    <button class="option ${selected===o.id?'active':''}" data-kind="${kind}" data-value="${o.id}" aria-pressed="${selected===o.id}">${o.name}</button>`).join('');
}

function render() {
  app.innerHTML = `
  <div class="page">
    <header class="shell topbar">
      <a class="brand" href="#top" aria-label="نور المدينة للمطابخ">
        <span class="brand-mark">ن</span>
        <span class="brand-copy"><strong>نور المدينة للمطابخ</strong><span>اختيار أوضح قبل التواصل</span></span>
      </a>
      <a class="route-link" href="${HARAJ_URL}" target="_blank" rel="noreferrer">العرض المنشور ↗</a>
    </header>

    <main>
      <section class="shell hero" id="top">
        <p class="eyebrow">خطوة واحدة أوضح قبل المحادثة</p>
        <h1>شاهد الاتجاه أولاً، ثم أرسل طلباً مرتباً.</h1>
        <p class="lead">اختر نوع طلبك، جرّب اتجاه اللون والخامة على نموذج ثلاثي الأبعاد، وقارن اختيارين قبل فتح مسار التواصل المنشور.</p>
        <div class="route-chips" aria-label="نوع الطلب">
          ${requestTypes.map(r => `<button class="route-chip ${state.request===r.id?'active':''}" data-request="${r.id}">${r.name}</button>`).join('')}
        </div>
      </section>

      <section class="shell studio-wrap">
        <div class="studio">
          <div class="studio-head">
            <div>
              <p class="eyebrow" style="color:#d9b985;margin-bottom:6px">استوديو القرار البصري</p>
              <h2>جرّب الاتجاه على نفس النموذج.</h2>
              <p>النموذج ثابت للتوضيح البصري؛ الألوان والخامات المعروضة اتجاهات تجريبية وليست كتالوجاً رسمياً أو أبعاد تصنيع.</p>
            </div>
            <span class="truth-pill">ألوان توضيحية • نموذج ثابت</span>
          </div>

          <div class="scene-frame">
            <div id="scene"></div>
            <div class="scene-overlay">
              <div class="scene-caption">
                <strong id="sceneChoice">ألمنيوم • عاجي • رخام صناعي</strong>
                <span>اسحب لتغيير الزاوية. المشهد لا يغيّر التخطيط ولا يحسب السعر.</span>
              </div>
              <div class="scene-tools">
                <button class="icon-btn" id="resetView" aria-label="إعادة زاوية العرض">↺</button>
                <button class="icon-btn" id="toggleLight" aria-label="تبديل الإضاءة">☼</button>
              </div>
            </div>
          </div>

          <div class="control-tabs" role="tablist">
            <button class="tab-btn active" data-tab="colors">الألوان</button>
            <button class="tab-btn" data-tab="materials">الخامة والسطح</button>
            <button class="tab-btn" data-tab="finish">التشطيب والإضاءة</button>
          </div>

          <div class="panel active" data-panel="colors">
            <div class="control-grid">
              <div class="control-card">
                <h3>الخزائن السفلية — اتجاه اللون</h3>
                <div class="swatches">${swatchMarkup('base',state.base)}</div>
                <p class="microcopy">درجات توضيحية فقط وليست أكواداً معتمدة من نور المدينة.</p>
              </div>
              <div class="control-card">
                <h3>الخزائن العلوية — اتجاه اللون</h3>
                <div class="swatches">${swatchMarkup('upper',state.upper)}</div>
                <p class="microcopy">يمكن فصل اللون العلوي عن السفلي لتجربة اتجاه ثنائي اللون.</p>
              </div>
            </div>
          </div>

          <div class="panel" data-panel="materials">
            <div class="control-grid">
              <div class="control-card">
                <h3>فئة خامة الواجهات المذكورة في العروض</h3>
                <div class="option-row">${optionMarkup(cabinetFamilies,'family',state.family)}</div>
                <p class="microcopy">التغيير هنا يحاكي اللمعة/الملمس بصرياً فقط ولا يثبت مواصفة تصنيع.</p>
              </div>
              <div class="control-card">
                <h3>اتجاه سطح العمل</h3>
                <div class="option-row">${optionMarkup(countertopFamilies,'counter',state.counter)}</div>
                <p class="microcopy">فئات السطح مأخوذة من نص العرض؛ اللون في المشهد تمثيل بصري توضيحي.</p>
              </div>
            </div>
          </div>

          <div class="panel" data-panel="finish">
            <div class="control-grid">
              <div class="control-card">
                <h3>اتجاه التشطيب</h3>
                <div class="option-row">${optionMarkup(finishes,'finish',state.finish)}</div>
              </div>
              <div class="control-card">
                <h3>حالة الإضاءة</h3>
                <div class="option-row">
                  <button class="option ${state.light==='day'?'active':''}" data-kind="light" data-value="day">نهاري</button>
                  <button class="option ${state.light==='warm'?'active':''}" data-kind="light" data-value="warm">دافئ</button>
                </div>
                <p class="microcopy">الهدف رؤية أثر الضوء على اللون قبل المحادثة، لا محاكاة إنارة هندسية.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="shell decision-section">
        <div class="section-head">
          <div>
            <p class="eyebrow">قارن قبل أن تعتمد الاتجاه</p>
            <h2>اختيار A أو B، بدون إعادة كل شيء من البداية.</h2>
          </div>
          <p>ثبّت اتجاهين بصريين، ارجع بينهما فوراً، ثم شارك نفس الحالة كرابط إذا احتجت مناقشتها مع شخص آخر.</p>
        </div>

        <div class="compare-grid">
          <div class="compare-card">
            <div class="compare-toolbar">
              <button class="action-btn primary" id="saveA">حفظ كـ A</button>
              <button class="action-btn secondary" id="saveB">حفظ كـ B</button>
              <button class="action-btn ghost" id="loadA">عرض A</button>
              <button class="action-btn ghost" id="loadB">عرض B</button>
            </div>
            <div class="ab-grid">
              <div class="ab-card" id="cardA">${snapshotCard('A',snapshotA)}</div>
              <div class="ab-card" id="cardB">${snapshotCard('B',snapshotB)}</div>
            </div>
            <div class="share-state">
              <input id="shareUrl" value="${buildShareUrl()}" readonly aria-label="رابط حالة الاختيار" />
              <button class="action-btn secondary" id="copyLink">نسخ الرابط</button>
            </div>
          </div>

          <div class="advisor-card">
            <h3>حدد الأولوية قبل الطلب</h3>
            <p>اختيار واحد يساعد الطرف الآخر يفهم ما يهمك أكثر قبل الدخول في التفاصيل.</p>
            <div class="choice-stack" id="priorityChoices">
              <div class="choice-row">
                <button class="choice ${state.priority==='easycare'?'active':''}" data-priority="easycare"><strong>سهولة العناية</strong><span>أفضلية للتنظيف والاستخدام اليومي</span></button>
                <button class="choice ${state.priority==='visual'?'active':''}" data-priority="visual"><strong>الشكل أولاً</strong><span>القرار يبدأ من اللون والتباين</span></button>
              </div>
              <div class="choice-row">
                <button class="choice ${state.priority==='storage'?'active':''}" data-priority="storage"><strong>التخزين</strong><span>أولوية للاستفادة من المساحة</span></button>
                <button class="choice ${state.priority==='unsure'?'active':''}" data-priority="unsure"><strong>غير متأكد</strong><span>أحتاج اقتراحاً بعد معرفة المساحة</span></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="shell gallery-section">
        <div class="section-head">
          <div>
            <p class="eyebrow">نماذج من العروض المنشورة</p>
            <h2>مرجع بصري من نفس البائع.</h2>
          </div>
          <p>الصور أدناه معروضة بصفتها صوراً منشورة في العرض؛ لا نصفها هنا كمشاريع منفذة ما لم يُؤكَّد ذلك.</p>
        </div>
        <div class="gallery-grid">
          ${galleryImages.map((src,i)=>`
          <figure class="gallery-item">
            <img src="${src}" alt="صورة مطبخ منشورة ضمن عرض نور المدينة للمطابخ ${i+1}" loading="lazy" />
            <div class="gallery-fallback"><a href="${HARAJ_URL}" target="_blank" rel="noreferrer">تعذر تحميل الصورة — افتح المصدر المنشور ↗</a></div>
          </figure>`).join('')}
        </div>
        <p class="gallery-note">مصدر الصور: العرض المنشور المرتبط بنور المدينة للمطابخ على حراج.</p>
      </section>

      <section class="shell readiness-section">
        <div class="section-head">
          <div>
            <p class="eyebrow">تجهيز الطلب</p>
            <h2>أرسل ما ينقص فقط.</h2>
          </div>
          <p>اختيارات اللون والخامة تنتقل تلقائياً إلى الملخص؛ هنا نضيف معلومات المشروع التي لا يمكن استنتاجها من الاستوديو.</p>
        </div>

        <div class="readiness-layout">
          <div class="readiness-card">
            <h3>بيانات مفيدة قبل التواصل</h3>
            <p>لا توجد أسعار آلية أو وعود تنفيذ. الهدف تجهيز المحادثة بمعلومات أوضح.</p>
            <div class="readiness-meter"><span id="meterBar"></span></div>
            <div class="readiness-label" id="meterLabel">اكتمال البيانات</div>

            <div class="form-grid" style="margin-top:16px">
              <div class="field">
                <label for="layout">شكل المساحة</label>
                <select id="layout">
                  <option value="">اختر</option>
                  <option value="مستقيم" ${state.layout==='مستقيم'?'selected':''}>مستقيم</option>
                  <option value="حرف L" ${state.layout==='حرف L'?'selected':''}>حرف L</option>
                  <option value="حرف U" ${state.layout==='حرف U'?'selected':''}>حرف U</option>
                  <option value="غير متأكد" ${state.layout==='غير متأكد'?'selected':''}>غير متأكد</option>
                </select>
              </div>
              <div class="field">
                <label for="city">المدينة / الحي</label>
                <input id="city" value="${escapeHtml(state.city)}" placeholder="مثال: الرياض" />
              </div>
              <div class="field full">
                <label>الخدمات المطلوبة</label>
                <div class="option-row">
                  ${services.map(s=>`<button type="button" class="option ${state.services.includes(s.id)?'active':''}" data-service="${s.id}">${s.name}</button>`).join('')}
                </div>
              </div>
            </div>

            <button class="optional-toggle" id="optionalToggle">+ إضافة المقاسات / الأجهزة إن كانت متاحة</button>
            <div class="form-grid optional-fields" id="optionalFields">
              <div class="field">
                <label for="width">العرض التقريبي بالمتر</label>
                <input id="width" inputmode="decimal" value="${escapeHtml(state.width)}" placeholder="مثال: 4.2" />
              </div>
              <div class="field">
                <label for="depth">العمق التقريبي بالمتر</label>
                <input id="depth" inputmode="decimal" value="${escapeHtml(state.depth)}" placeholder="مثال: 3.0" />
              </div>
              <div class="field full">
                <label for="appliances">الأجهزة الأساسية</label>
                <input id="appliances" value="${escapeHtml(state.appliances)}" placeholder="فرن، ثلاجة، غسالة صحون..." />
              </div>
              <div class="field full">
                <label for="note">ملاحظة مختصرة</label>
                <textarea id="note" placeholder="أي نقطة مهمة قبل التواصل">${escapeHtml(state.note)}</textarea>
              </div>
            </div>
          </div>

          <aside class="summary-box">
            <h3>ملخص جاهز للنسخ</h3>
            <pre id="summaryText"></pre>
            <div class="summary-actions">
              <button class="action-btn secondary" id="copySummary">نسخ الملخص</button>
              <a class="action-btn primary" href="${HARAJ_URL}" target="_blank" rel="noreferrer">فتح التواصل على حراج ↗</a>
            </div>
            <p class="route-truth">هذا الزر يستخدم المسار المنشور الذي تم التحقق منه. لا نعرض رقم واتساب غير موثّق ولا نرسل الرسالة تلقائياً.</p>
          </aside>
        </div>
      </section>
    </main>

    <footer class="shell footer">
      <div><strong>نور المدينة للمطابخ</strong><br/>جاهز • جاهز معدل • تفصيل حسب الطلب</div>
      <a href="${HARAJ_URL}" target="_blank" rel="noreferrer">المصدر المنشور ↗</a>
    </footer>
    <div class="toast" id="toast">تم النسخ</div>
  </div>`;

  bindUi();
  initScene();
  updateUiFromState();
}

function escapeHtml(value='') {
  return String(value).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

function getById(list,id) {
  return list.find(x=>x.id===id) || list[0];
}

function snapshotCard(label,s) {
  if(!s) return `<h4>اختيار ${label}</h4><div class="ab-line"><span>الحالة</span><b>لم يُحفظ بعد</b></div>`;
  return `<h4>اختيار ${label}</h4>
    <div class="ab-line"><span>الخامة</span><b>${getById(cabinetFamilies,s.family).name}</b></div>
    <div class="ab-line"><span>السفلي</span><b>${getById(visualColors,s.base).name}</b></div>
    <div class="ab-line"><span>العلوي</span><b>${getById(visualColors,s.upper).name}</b></div>
    <div class="ab-line"><span>السطح</span><b>${getById(countertopFamilies,s.counter).name}</b></div>
    <div class="ab-line"><span>التشطيب</span><b>${getById(finishes,s.finish).name}</b></div>`;
}

function currentVisualState() {
  return {
    family:state.family, base:state.base, upper:state.upper, counter:state.counter,
    finish:state.finish, light:state.light
  };
}

function buildShareUrl() {
  const q = new URLSearchParams();
  const shareKeys = ['request','family','base','upper','counter','finish','light'];
  shareKeys.forEach(k => q.set(k,state[k]));
  return location.origin + location.pathname + '?' + q.toString();
}

function buildSummary() {
  const req = getById(requestTypes,state.request).name;
  const fam = getById(cabinetFamilies,state.family).name;
  const base = getById(visualColors,state.base).name;
  const upper = getById(visualColors,state.upper).name;
  const counter = getById(countertopFamilies,state.counter).name;
  const finish = getById(finishes,state.finish).name;
  const svc = services.filter(s=>state.services.includes(s.id)).map(s=>s.name).join('، ');
  const lines = [
    'طلب مبدئي — نور المدينة للمطابخ',
    `نوع الطلب: ${req}`,
    `اتجاه الواجهات: ${fam}`,
    `اللون السفلي: ${base} (توضيحي)`,
    `اللون العلوي: ${upper} (توضيحي)`,
    `اتجاه السطح: ${counter}`,
    `التشطيب: ${finish}`,
    state.priority ? `الأولوية: ${priorityLabel(state.priority)}` : '',
    state.layout ? `شكل المساحة: ${state.layout}` : '',
    state.city ? `المدينة / الحي: ${state.city}` : '',
    state.width ? `العرض التقريبي: ${state.width} م` : '',
    state.depth ? `العمق التقريبي: ${state.depth} م` : '',
    state.appliances ? `الأجهزة: ${state.appliances}` : '',
    svc ? `الخدمات المطلوبة: ${svc}` : '',
    state.note ? `ملاحظة: ${state.note}` : '',
    'ملاحظة: الاختيارات البصرية توضيحية وليست كتالوجاً أو تسعيراً معتمداً.'
  ];
  return lines.filter(Boolean).join('\n');
}

function priorityLabel(id){
  return ({easycare:'سهولة العناية',visual:'الشكل أولاً',storage:'التخزين',unsure:'غير متأكد'})[id] || '';
}

function bindUi(){
  document.querySelectorAll('[data-request]').forEach(btn=>btn.addEventListener('click',()=>{
    state.request=btn.dataset.request; syncUrlSoft(); updateUiFromState();
  }));
  document.querySelectorAll('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===btn));
    document.querySelectorAll('[data-panel]').forEach(p=>p.classList.toggle('active',p.dataset.panel===btn.dataset.tab));
  }));
  document.querySelectorAll('[data-kind]').forEach(btn=>btn.addEventListener('click',()=>{
    state[btn.dataset.kind]=btn.dataset.value;
    syncUrlSoft(); updateUiFromState();
  }));
  document.querySelectorAll('[data-service]').forEach(btn=>btn.addEventListener('click',()=>{
    const id=btn.dataset.service;
    state.services=state.services.includes(id)?state.services.filter(x=>x!==id):[...state.services,id];
    updateUiFromState();
  }));
  document.querySelectorAll('[data-priority]').forEach(btn=>btn.addEventListener('click',()=>{
    state.priority=btn.dataset.priority; updateUiFromState();
  }));

  document.querySelector('#saveA').addEventListener('click',()=>{snapshotA=currentVisualState(); refreshCompare(); showToast('تم حفظ A')});
  document.querySelector('#saveB').addEventListener('click',()=>{snapshotB=currentVisualState(); refreshCompare(); showToast('تم حفظ B')});
  document.querySelector('#loadA').addEventListener('click',()=>{if(snapshotA){Object.assign(state,snapshotA);updateUiFromState();showToast('تم عرض A')}});
  document.querySelector('#loadB').addEventListener('click',()=>{if(snapshotB){Object.assign(state,snapshotB);updateUiFromState();showToast('تم عرض B')}});

  document.querySelector('#copyLink').addEventListener('click',()=>copyText(buildShareUrl(),'تم نسخ رابط الاختيار'));
  document.querySelector('#copySummary').addEventListener('click',()=>copyText(buildSummary(),'تم نسخ الملخص'));
  document.querySelector('#optionalToggle').addEventListener('click',()=>{
    const box=document.querySelector('#optionalFields');box.classList.toggle('open');
    document.querySelector('#optionalToggle').textContent=box.classList.contains('open')?'− إخفاء التفاصيل الاختيارية':'+ إضافة المقاسات / الأجهزة إن كانت متاحة';
  });
  ['layout','city','width','depth','appliances','note'].forEach(id=>{
    const el=document.querySelector('#'+id);
    const event=el.tagName==='SELECT'?'change':'input';
    el.addEventListener(event,()=>{state[id]=el.value;updateReadiness();updateSummary();});
  });
  document.querySelectorAll('.gallery-item img').forEach(img=>img.addEventListener('error',()=>img.closest('.gallery-item').classList.add('failed')));
  document.querySelector('#resetView').addEventListener('click',()=>sceneApi?.reset());
  document.querySelector('#toggleLight').addEventListener('click',()=>{
    state.light=state.light==='day'?'warm':'day';updateUiFromState();
  });
}

function refreshCompare(){
  document.querySelector('#cardA').innerHTML=snapshotCard('A',snapshotA);
  document.querySelector('#cardB').innerHTML=snapshotCard('B',snapshotB);
}

function updateUiFromState(){
  document.querySelectorAll('[data-request]').forEach(b=>b.classList.toggle('active',b.dataset.request===state.request));
  document.querySelectorAll('[data-kind]').forEach(b=>b.classList.toggle('active',b.dataset.value===state[b.dataset.kind]));
  document.querySelectorAll('[data-service]').forEach(b=>b.classList.toggle('active',state.services.includes(b.dataset.service)));
  document.querySelectorAll('[data-priority]').forEach(b=>b.classList.toggle('active',b.dataset.priority===state.priority));
  document.querySelector('#shareUrl').value=buildShareUrl();
  updateSceneChoice();
  sceneApi?.apply(state);
  updateReadiness();
  updateSummary();
}

function updateSceneChoice(){
  const el=document.querySelector('#sceneChoice');
  if(!el) return;
  el.textContent=`${getById(cabinetFamilies,state.family).name} • ${getById(visualColors,state.base).name} / ${getById(visualColors,state.upper).name} • ${getById(countertopFamilies,state.counter).name}`;
}

function updateReadiness(){
  const checks=[
    !!state.request,!!state.family,!!state.base,!!state.upper,!!state.counter,
    !!state.layout,!!state.city,state.services.length>0,!!state.priority
  ];
  const pct=Math.round(checks.filter(Boolean).length/checks.length*100);
  const bar=document.querySelector('#meterBar'); const label=document.querySelector('#meterLabel');
  if(bar) bar.style.width=pct+'%';
  if(label) label.textContent=`اكتمال البيانات: ${pct}% — مؤشر اكتمال فقط`;
}

function updateSummary(){
  const pre=document.querySelector('#summaryText'); if(pre) pre.textContent=buildSummary();
}

function syncUrlSoft(){
  history.replaceState(null,'',buildShareUrl());
}

async function copyText(text,msg){
  try{
    await navigator.clipboard.writeText(text);showToast(msg);
  }catch{
    const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();showToast(msg);
  }
}

function showToast(message){
  const t=document.querySelector('#toast'); if(!t)return;
  t.textContent=message;t.classList.add('show');clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>t.classList.remove('show'),1800);
}

function initScene(){
  const mount=document.querySelector('#scene');
  if(!mount) return;

  try{
    const scene=new THREE.Scene();
    scene.background=null;

    const camera=new THREE.PerspectiveCamera(38,1,.1,100);
    camera.position.set(7.4,4.8,8.6);

    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const controls=new OrbitControls(camera,renderer.domElement);
    controls.target.set(.2,1.3,-.25);
    controls.enablePan=false;
    controls.enableDamping=true;
    controls.dampingFactor=.08;
    controls.minDistance=7.2;
    controls.maxDistance=11;
    controls.minPolarAngle=Math.PI*.25;
    controls.maxPolarAngle=Math.PI*.48;
    controls.minAzimuthAngle=-Math.PI*.34;
    controls.maxAzimuthAngle=Math.PI*.34;

    const hemi=new THREE.HemisphereLight(0xfff7e8,0x1a2822,2.15);
    scene.add(hemi);
    const key=new THREE.DirectionalLight(0xffffff,3.6);
    key.position.set(3.5,8,5.5);key.castShadow=true;scene.add(key);
    const warm=new THREE.PointLight(0xffc783,10,18,2);
    warm.position.set(-3,4,3);scene.add(warm);

    const room=new THREE.Group();scene.add(room);

    const wallMat=new THREE.MeshStandardMaterial({color:0xeee8dd,roughness:.95});
    const floorMat=new THREE.MeshStandardMaterial({color:0xcfc7b8,roughness:.82});
    const metalMat=new THREE.MeshStandardMaterial({color:0xaab1b1,roughness:.24,metalness:.7});
    const applianceMat=new THREE.MeshStandardMaterial({color:0x202627,roughness:.25,metalness:.35});
    const glassMat=new THREE.MeshPhysicalMaterial({color:0x8aa4a3,transparent:true,opacity:.28,roughness:.1,metalness:.05});

    const baseMat=new THREE.MeshStandardMaterial({color:getById(visualColors,state.base).hex,roughness:.45});
    const upperMat=new THREE.MeshStandardMaterial({color:getById(visualColors,state.upper).hex,roughness:.45});
    const counterMat=new THREE.MeshStandardMaterial({color:getById(countertopFamilies,state.counter).hex,roughness:.28});

    const baseMeshes=[],upperMeshes=[],counterMeshes=[];

    const floor=new THREE.Mesh(new THREE.PlaneGeometry(11,8),floorMat);
    floor.rotation.x=-Math.PI/2;floor.position.y=0;floor.receiveShadow=true;room.add(floor);
    const back=new THREE.Mesh(new THREE.BoxGeometry(8.6,4.8,.1),wallMat);
    back.position.set(0,2.4,-2.15);back.receiveShadow=true;room.add(back);
    const side=new THREE.Mesh(new THREE.BoxGeometry(.1,4.8,5.3),wallMat);
    side.position.set(4.25,2.4,.5);side.receiveShadow=true;room.add(side);

    function box(w,h,d,mat,x,y,z){
      const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;room.add(m);return m;
    }
    function handle(x,y,z,w=.28,rot=0){
      const h=box(w,.04,.04,metalMat,x,y,z);h.rotation.y=rot;return h;
    }

    const unitW=1.16;
    [-2.9,-1.62,-.34,.94,2.22].forEach((x,i)=>{
      const m=box(unitW,1.28,.78,baseMat,x,.67,-1.68);baseMeshes.push(m);
      handle(x,.82,-1.27,.3);
      const c=box(unitW+.03,.12,.9,counterMat,x,1.36,-1.63);counterMeshes.push(c);
      if(i!==2){
        const u=box(unitW,1.06,.48,upperMat,x,2.76,-1.88);upperMeshes.push(u);
        handle(x,2.62,-1.62,.26);
      }
    });

    [-.8,.48,1.76].forEach((z,i)=>{
      const m=box(1.0,1.28,.78,baseMat,3.64,.67,z);m.rotation.y=Math.PI/2;baseMeshes.push(m);
      const c=box(1.03,.12,.9,counterMat,3.6,1.36,z);c.rotation.y=Math.PI/2;counterMeshes.push(c);
      if(i<2){
        const u=box(1.0,1.06,.48,upperMat,3.8,2.76,z);u.rotation.y=Math.PI/2;upperMeshes.push(u);
      }
    });

    const tall=box(1.04,2.72,.8,upperMat,-3.65,1.38,-1.68);upperMeshes.push(tall);
    const fridge=box(.96,2.35,.72,applianceMat,2.85,1.18,-1.68);
    const fridgeLine=box(.82,.02,.02,metalMat,2.85,1.25,-1.30);

    const oven=box(.88,.92,.72,applianceMat,-.34,.72,-1.29);
    const hob=box(.82,.045,.52,applianceMat,-.34,1.47,-1.48);

    const sink=box(.78,.04,.48,metalMat,1.0,1.47,-1.52);
    const faucet=box(.04,.48,.04,metalMat,1.18,1.67,-1.52);
    faucet.rotation.z=-.18;

    const island=box(2.65,1.05,1.18,baseMat,-.35,.56,.85);baseMeshes.push(island);
    const islandTop=box(2.9,.13,1.38,counterMat,-.35,1.16,.85);counterMeshes.push(islandTop);

    const glassBox=box(.96,.9,.04,glassMat,2.22,2.76,-1.62);
    const glassFrame=box(1.02,.04,.06,metalMat,2.22,3.2,-1.59);

    const plinthMat=new THREE.MeshStandardMaterial({color:0x292f2d,roughness:.55});
    box(6.2,.11,.7,plinthMat,-.3,.08,-1.72);
    const backsplash=new THREE.Mesh(new THREE.PlaneGeometry(6.5,1.05),new THREE.MeshStandardMaterial({color:0xdad2c4,roughness:.62}));
    backsplash.position.set(-.15,1.95,-2.08);room.add(backsplash);

    const reset=()=>{
      camera.position.set(7.4,4.8,8.6);controls.target.set(.2,1.3,-.25);controls.update();
    };

    function apply(s){
      const baseC=getById(visualColors,s.base).hex;
      const upperC=getById(visualColors,s.upper).hex;
      const c=getById(countertopFamilies,s.counter);
      const family=getById(cabinetFamilies,s.family);
      const fin=getById(finishes,s.finish);
      baseMat.color.set(baseC);upperMat.color.set(upperC);counterMat.color.set(c.hex);
      baseMat.roughness=Math.min(.9,(family.roughness+fin.roughness)/2);
      upperMat.roughness=baseMat.roughness;
      baseMat.metalness=family.metalness;upperMat.metalness=family.metalness;
      counterMat.roughness=c.roughness;
      if(s.light==='warm'){
        key.intensity=2.2;warm.intensity=22;hemi.intensity=1.35;renderer.setClearColor(0x251d16,0);
      }else{
        key.intensity=3.6;warm.intensity=10;hemi.intensity=2.15;renderer.setClearColor(0x000000,0);
      }
    }
    apply(state);

    const resize=()=>{
      const r=mount.getBoundingClientRect();
      const w=Math.max(260,r.width),h=Math.max(280,r.height);
      renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
    };
    const ro=new ResizeObserver(resize);ro.observe(mount);resize();

    let raf=0;
    const tick=()=>{controls.update();renderer.render(scene,camera);raf=requestAnimationFrame(tick)};tick();

    sceneApi={apply,reset};

    window.addEventListener('beforeunload',()=>{
      cancelAnimationFrame(raf);ro.disconnect();controls.dispose();renderer.dispose();
    },{once:true});
  }catch(err){
    console.error(err);
    mount.innerHTML='<div style="display:grid;place-items:center;height:100%;padding:30px;text-align:center;color:#dce5e0">تعذر تشغيل العرض ثلاثي الأبعاد على هذا الجهاز. يمكنك متابعة الاختيارات والطلب أسفل الصفحة.</div>';
  }
}

render();
