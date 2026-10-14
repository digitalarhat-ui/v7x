
(function(){
  "use strict";
  const label={
    benefit:{yes:"نعم",partial:"جزئياً",no:"لا"},
    useful:{intent:"توضيح رغبة العميل",inspiration:"الإلهام البصري",direction:"اختيار الاتجاه",brief:"ملخص المراجعة",none:"لا شيء مما سبق"},
    fit:{yes:"يتوافق مع عملنا",partial:"يتوافق جزئياً",no:"لا يتوافق",unknown:"لا يمكن الحكم حالياً"},
    standard:{partial:"يمكن توحيد جزء منها",unique:"تختلف غالباً",vendors:"تعتمد على الموردين",unclear:"يحتاج توضيح"},
    data:{yes:"يمكن مناقشة بعض البيانات",unclear:"يحتاج تحديد النطاق أولاً",no:"لا تتوفر / لا يمكن مشاركتها حالياً"},
    interest:{discussion:"نريد مناقشة التطبيق",adjust:"نحتاج تعديلات قبل الحكم",useful_no:"الفكرة مفيدة لكن لا نحتاج تطبيقها",no:"لا نرى حاجة لها حالياً"}
  };
  const state={step:0};const keys=["benefit","useful","fit","standard","data","interest"];
  const get=name=>document.querySelector('input[name="'+name+'"]:checked')?.value||"";
  const textv=id=>document.getElementById(id).value.trim();
  const mapped=k=>get(k)?label[k][get(k)]:"لم يُجب بعد";
  const status=id=>document.getElementById(id);
  function complete(){
    return keys.every(k=>!!get(k));
  }
  function verdict(){
    if(!complete())return {name:"لم يكتمل التقييم",reason:"أكملوا الإجابات الأساسية قبل استنتاج قرار تجاري."};
    const benefit=get("benefit"),useful=get("useful"),fit=get("fit"),data=get("data"),interest=get("interest");
    if(interest==="no"||(benefit==="no"&&useful==="none")||(fit==="no"&&(interest==="no"||interest==="useful_no")))
      return {name:"STOP",reason:"الإجابات لا تدعم متابعة هذه الفكرة بصيغتها الحالية. لا ينبغي فرض مشروع مدفوع."};
    if((benefit==="yes"||benefit==="partial")&&useful!=="none"&&fit==="yes"&&data==="yes"&&interest==="discussion")
      return {name:"CONTINUE",reason:"الإجابات المدخلة تشير إلى صلة محددة وملاءمة للعمل وإمكانية مناقشة البيانات والتطبيق. هذا يبرر محادثة تحقق إضافية فقط، وليس عرض سعر أو جاهزية بيع."};
    return {name:"NARROW",reason:"هناك عدم يقين أو ملاءمة جزئية أو غياب نية تطبيق واضحة. اختبروا نطاقاً أصغر أو صححوا الفرضية قبل أي تطوير إضافي."};
  }
  function buildSummary(){
    const lines=[
      "ملخص مناقشة الفكرة — قصر فينيسيا (إجابات محلية غير مرسلة)",
      "الفائدة المتصورة: "+mapped("benefit"),
      "الجزء الأكثر صلة: "+mapped("useful"),
      "ملاءمة طريقة العمل: "+mapped("fit")
    ];
    if(textv("mismatch")) lines.push("ما لا يعكس الواقع: "+textv("mismatch"));
    if(textv("needed"))lines.push("المعلومات المطلوبة فعلياً: "+textv("needed"));
    lines.push("توحيد الخيارات: "+mapped("standard"));
    lines.push("إمكانية مناقشة البيانات: "+mapped("data"));
    lines.push("الرغبة في التطبيق: "+mapped("interest"));
    lines.push("القرار الاستدلالي المحلي: "+verdict().name);
    lines.push("OFFER_READY: NO — لا توجد من هذا النموذج وحده موافقة مدفوعة أو نطاق متفق عليه.");
    return lines.join("\n");
  }
  function render(){
    const v=verdict();
    status("resultTitle").textContent=v.name;status("resultReason").textContent=v.reason;
    status("feedbackSummary").textContent=buildSummary();
    const cases=[
      ["DEMO_SHOWN","غير متحقق داخل هذه الواجهة"],
      ["RELEVANCE_CONFIRMED",(get("benefit")==="yes"||get("benefit")==="partial")&&get("useful")!=="none"&&get("useful")?"إشارة من إجابة محلية":"غير مؤكد"],
      ["PROCESS_FIT_CONFIRMED",get("fit")==="yes"?"إشارة من إجابة محلية":"غير مؤكد"],
      ["DATA_ACCESS_POSSIBLE",get("data")==="yes"?"أُشير لإمكانية النقاش":"غير مؤكد"],
      ["IMPLEMENTATION_INTEREST",get("interest")==="discussion"?"أُبدِي اهتمام في الإجابات":"غير مؤكد"],
      ["PAID_DISCUSSION","لم تُناقش تجارياً"],
      ["OFFER_READY","NO"]
    ];
    const grid=status("statusGrid");grid.replaceChildren();
    for(const [name,value] of cases){
      const box=document.createElement("div");box.className="statusitem";
      const b=document.createElement("b");b.textContent=name;
      const s=document.createElement("span");s.textContent=value;
      box.append(b,s);grid.appendChild(box);
    }
    const panel=status("dataPrompt");
    panel.hidden=!(get("interest")==="discussion"&&get("data")==="yes"&&get("useful")!=="none");
    const list=status("dataList");list.replaceChildren();
    if(!panel.hidden){
      const dataItems={
        intent:["مثال للمدخلات التي يطلبها فريق القاعة فعلياً من العملاء","قناة التواصل التي توافقون على استخدامها"],
        inspiration:["أمثلة للصور أو المواد التي تسمح القاعة باستخدامها","الحدود البصرية لما يصح عرضه باعتباره مرجعاً"],
        direction:["الخيارات البصرية الفعلية التي تودون مراجعة عرضها، دون افتراض توفرها","تمييز ما يعود للقاعة مما يتبع الموردين عند الحاجة"],
        brief:["الحقول التي تفيد الفريق فعلاً في موجز المراجعة","طريقة مشاركة الموجز التي توافق عليها الإدارة"]
      }[get("useful")]||[];
      for(const value of dataItems){
        const li=document.createElement("li");li.textContent=value;list.appendChild(li);
      }
    }
  }
  function showStep(i){
    state.step=Math.max(0,Math.min(2,i));
    [1,2,3].forEach((n,k)=>{status("step"+n).hidden=k!==state.step;document.querySelectorAll(".track-pill")[k].classList.toggle("active",k<=state.step)});
    status("back").hidden=state.step===0;
    status("next").textContent=state.step===2?"عرض التقييم":"التالي";
    status("formStatus").textContent="";
    status("results").hidden=true;
  }
  status("next").addEventListener("click",()=>{
    if(state.step<2){showStep(state.step+1);return}
    if(!complete()){status("formStatus").textContent="لا يمكن إصدار قرار من إجابات ناقصة. يرجى إكمال الاختيارات الأساسية.";return}
    render();status("results").hidden=false;
    status("results").scrollIntoView({block:"start",behavior:"smooth"});
  });
  status("back").addEventListener("click",()=>showStep(state.step-1));
  status("reviewForm").addEventListener("change",()=>{if(!status("results").hidden)render()});
  status("reviewForm").addEventListener("input",()=>{if(!status("results").hidden)render()});
  async function copy(t){
    try{await navigator.clipboard.writeText(t);return true}catch(e){}
    try{
      const input=document.createElement("textarea");input.value=t;input.style.cssText="position:fixed;left:-10000px;opacity:0";
      document.body.appendChild(input);input.select();
      const ok=document.execCommand("copy");input.remove();return ok;
    }catch(e){return false}
  }
  status("copyFeedback").addEventListener("click",async()=>{
    const worked=await copy(buildSummary());
    status("copyStatus").textContent=worked?"تم نسخ الملاحظات محلياً. لم يُرسل شيء إلى أي جهة.":"تعذر النسخ في هذا المتصفح؛ يمكن تحديد النص ونسخه يدوياً.";
  });
  showStep(0);
})();
