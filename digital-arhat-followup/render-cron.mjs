import {getRecentMessages} from './lib/vgraple.js';
import {readJson,writeJson,safeId} from './lib/store.js';
import runFollowups from './api/run-followups.js';

const activation=process.env.ACTIVATION_AT||'2026-10-07T11:52:20Z';
const since=new Date(Math.max(new Date(activation).getTime(),Date.now()-7*86400000)).toISOString();
const msgs=await getRecentMessages({since,order:'asc',limit:100});
const byContact=new Map();

function t(m){const v=m?.wa_timestamp||m?.created_at||m?.timestamp;const d=new Date(v||0);return Number.isNaN(d.getTime())?0:d.getTime()}
function p(v){return String(v||'').replace(/\D/g,'')}

for(const m of msgs){
  const id=String(m?.contact?.id||'');
  if(!id)continue;
  if(!byContact.has(id))byContact.set(id,[]);
  byContact.get(id).push(m);
}

for(const [id,raw] of byContact){
  const arr=[...raw].sort((a,b)=>t(a)-t(b));
  const latest=arr.at(-1);
  const convs=new Set(arr.map(m=>String(m?.conversation_id||'')).filter(Boolean));
  const phones=new Set(arr.map(m=>p(m?.contact?.phone||m?.contact?.wa_id)).filter(Boolean));
  const lastOut=[...arr].reverse().find(m=>String(m?.direction).toLowerCase()==='outbound');
  const lastIn=[...arr].reverse().find(m=>String(m?.direction).toLowerCase()==='inbound');
  const path='leads/'+safeId(id)+'.json';
  const lead=await readJson(path,{id,name:'Unknown lead',phone:'',conversationId:'',outboundCount:0,inboundCount:0});

  lead.name=latest?.contact?.name||lead.name;
  lead.phone=p(latest?.contact?.phone||latest?.contact?.wa_id)||lead.phone;
  lead.conversationId=String(latest?.conversation_id||lead.conversationId||'');
  lead.identityConflict=convs.size>1||phones.size>1||!!lead.identityConflict;
  lead.outboundCount=arr.filter(m=>String(m?.direction).toLowerCase()==='outbound').length;
  lead.inboundCount=arr.filter(m=>String(m?.direction).toLowerCase()==='inbound').length;
  lead.lastOutboundAt=lastOut?new Date(t(lastOut)).toISOString():lead.lastOutboundAt||null;
  lead.lastInboundAt=lastIn?new Date(t(lastIn)).toISOString():lead.lastInboundAt||null;
  lead.lastPreview=String(latest?.body||'').replace(/\s+/g,' ').slice(0,180);

  const replied=lastIn&&lastOut&&t(lastIn)>t(lastOut);
  const isAuto=lastOut&&String(lastOut?.template_name||'')===String(process.env.VGRAPLE_FOLLOWUP_TEMPLATE||'');
  if(replied){
    lead.waitingSince=null;lead.status='replied';lead.autoStatus='cancelled_reply';
  }else if(lastOut&&isAuto){
    lead.waitingSince=null;lead.status='followup_sent';lead.autoStatus='sent';
  }else if(lastOut){
    lead.waitingSince=new Date(t(lastOut)).toISOString();lead.status=lead.identityConflict?'needs_review':'waiting';lead.autoStatus='scheduled';
  }else{
    lead.waitingSince=null;lead.status='inbound';
  }
  lead.updatedAt=new Date().toISOString();
  await writeJson(path,lead);
}

const req={method:'GET',headers:{authorization:'Bearer '+process.env.CRON_SECRET}};
const res={
  code:200,
  status(n){this.code=n;return this},
  json(x){console.log(JSON.stringify({syncContacts:byContact.size,...x}));if(this.code>=400)process.exitCode=1;return x}
};
await runFollowups(req,res);
