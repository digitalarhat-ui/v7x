// Mavera-specific draft persistence supplement. Does not modify White Rose Golden source.
// Deploy as /mavera-persist.js only on isolated Mavera derivative.
// Local tab session only. No transmission, cookies, analytics, files or client PII.
(()=>{
  'use strict';
  const KEY='maveraDraftStateV2', TTL=24*60*60*1000;
  const ids=['dateInput','guestInput','customPaletteInput','inspirationNotesInput','p3DecisionNote','hospitalityInput','notesInput','p4CustomerConfirmation'];
  const allowed=new Set(ids);
  let restoring=false;
  function load(){try{
    const d=JSON.parse(sessionStorage.getItem(KEY)||'null');
    if(d&&Date.now()-d.saved<TTL&&d.fields&&typeof d.fields==='object')return d;
  }catch(e){}return null}
  function save(){if(restoring)return;try{
    const fields={};
    for(const id of ids){
      const el=document.getElementById(id);
      if(!el||el.type==='file')continue;
      fields[id]=el.type==='checkbox'?Boolean(el.checked):String(el.value||'').slice(0,2000);
    }
    sessionStorage.setItem(KEY,JSON.stringify({saved:Date.now(),fields}));
  }catch(e){}}
  function restore(){
    const d=load();if(!d)return;restoring=true;
    try{
      for(const [id,val] of Object.entries(d.fields)){
        if(!allowed.has(id))continue;
        const el=document.getElementById(id);
        if(!el||el.type==='file')continue;
        if(el.type==='checkbox')el.checked=val===true;
        else el.value=String(val??'');
        el.dispatchEvent(new Event('input',{bubbles:true}));
        el.dispatchEvent(new Event('change',{bubbles:true}));
      }
    }finally{restoring=false}
  }
  document.addEventListener('input',e=>{if(allowed.has(e.target?.id))save()},true);
  document.addEventListener('change',e=>{if(allowed.has(e.target?.id))save()},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(restore,250),{once:true});
  else setTimeout(restore,250);
})();