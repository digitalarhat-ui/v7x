import crypto from 'crypto';
import {readJson,writeJson,safeId} from '../lib/store.js';
import {getStoredSecret} from '../lib/secrets.js';
import {eventKind,getContact,getTimestamp,getPreview,getEventId,pick} from '../lib/parse.js';

export const config={api:{bodyParser:false}};

async function rawBody(req){const chunks=[];for await(const chunk of req)chunks.push(Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk));return Buffer.concat(chunks)}
function secureEqual(a,b){try{const aa=Buffer.from(String(a)),bb=Buffer.from(String(b));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb)}catch{return false}}

async function signingSecret(){
  return (await getStoredSecret('VGRAPLE_WEBHOOK_SECRET')) || process.env.VGRAPLE_WEBHOOK_SECRET || '';
}

function verifyLegacy(raw,header,secret){
  if(!header)return false;
  const provided=String(header).replace(/^sha256=/i,'').trim();
  const expected=crypto.createHmac('sha256',secret).update(raw).digest('hex');
  return secureEqual(provided,expected);
}

function verifyTimestamped(raw,header,secret){
  const parts=String(header||'').split(',').map(x=>x.trim()).filter(Boolean);
  const t=parts.find(x=>x.startsWith('t='))?.slice(2);
  const sigs=parts.filter(x=>x.startsWith('v1=')).map(x=>x.slice(3));
  if(!t||!/^\d+$/.test(t)||!sigs.length)return false;
  const ts=Number(t);
  const now=Math.floor(Date.now()/1000);
  if(Math.abs(now-ts)>300)return false;
  const expected=crypto.createHmac('sha256',secret).update(String(t)+'.').update(raw).digest('hex');
  return sigs.some(s=>secureEqual(s,expected));
}

async function verifySignature(raw,req){
  const secret=await signingSecret();
  if(!secret)return null;
  const timestamped=String(req.headers['x-webhook-signature']||'');
  if(timestamped&&verifyTimestamped(raw,timestamped,secret))return true;
  const legacy=String(req.headers['x-signature-256']||'');
  if(legacy&&verifyLegacy(raw,legacy,secret))return true;
  return false;
}

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'POST only'});
  const raw=await rawBody(req);
  const hmac=await verifySignature(raw,req);
  const querySecret=String(req.query?.secret||'');
  const fallbackAllowed=hmac===null&&querySecret&&secureEqual(querySecret,process.env.WEBHOOK_SECRET||'');
  if(hmac===false||(hmac===null&&!fallbackAllowed))return res.status(401).json({ok:false,error:'Unauthorized'});

  let body;try{body=JSON.parse(raw.toString('utf8')||'{}')}catch{return res.status(400).json({ok:false,error:'Invalid JSON'})}
  const kind=eventKind(body),contact=getContact(body,kind),ts=getTimestamp(body),preview=getPreview(body);
  const envelopeEventId=getEventId(body);
  const deliveryId=String(req.headers['x-delivery-id']||'').trim();
  const dedupId=deliveryId||envelopeEventId;
  const waMessageId=String(pick(body,['data.message.wa_message_id','message.wa_message_id','wa_message_id','data.message.id','message.id'])||envelopeEventId||'');
  const health=await readJson('meta/health.json',{accepted:0,rejected:0,unknown:0});
  Object.assign(health,{lastDeliveryAt:new Date().toISOString(),lastEventType:kind,accepted:(health.accepted||0)+1,lastVerifiedWith:hmac===true?'hmac':'fallback'});
  if(kind==='unknown')health.unknown=(health.unknown||0)+1;
  await writeJson('meta/health.json',health);

  if(dedupId){
    const eventPath='events/'+safeId(dedupId)+'.json';
    const exists=await readJson(eventPath,null);
    if(exists)return res.status(200).json({ok:true,duplicate:true,kind});
    await writeJson(eventPath,{id:dedupId,envelopeEventId:envelopeEventId||null,deliveryId:deliveryId||null,kind,receivedAt:new Date().toISOString()});
  }
  if(contact.id==='unknown'||kind==='unknown')return res.status(202).json({ok:true,ignored:true,kind});

  const historyKey='history/'+safeId(contact.id)+'/'+String(Date.now())+'-'+safeId(dedupId||waMessageId||crypto.randomUUID())+'.json';
  await writeJson(historyKey,{
    eventId:envelopeEventId||null,deliveryId:deliveryId||null,waMessageId:waMessageId||null,kind,contactId:contact.id,conversationId:contact.conversationId||null,
    phone:contact.phone||null,name:contact.name||null,timestamp:ts,text:preview||'',receivedAt:new Date().toISOString()
  });

  const leadPath='leads/'+safeId(contact.id)+'.json';
  const lead=await readJson(leadPath,{id:contact.id,phone:'',name:'Unknown lead',conversationId:'',lastOutboundAt:null,lastInboundAt:null,waitingSince:null,status:'new',outboundCount:0,inboundCount:0,lastPreview:'',identityConflict:false});

  if(lead.phone&&contact.phone&&String(lead.phone).replace(/\D/g,'')!==String(contact.phone).replace(/\D/g,''))lead.identityConflict=true;
  if(lead.conversationId&&contact.conversationId&&lead.conversationId!==contact.conversationId)lead.identityConflict=true;

  lead.name=contact.name||lead.name;lead.phone=contact.phone||lead.phone;lead.conversationId=contact.conversationId||lead.conversationId;lead.lastPreview=preview||lead.lastPreview;

  let wasAutoFollowup=false;
  if(waMessageId){
    const af=await readJson('autofollowups/'+safeId(waMessageId)+'.json',null);
    wasAutoFollowup=!!af;
  }

  if(kind==='sent'){
    lead.lastOutboundAt=ts;lead.outboundCount=(lead.outboundCount||0)+1;
    if(wasAutoFollowup){
      lead.status='followup_sent';lead.waitingSince=null;lead.followupSentAt=ts;
    }else{
      lead.waitingSince=ts;lead.status=lead.identityConflict?'needs_review':'waiting';
      lead.followupSentForOutboundAt=null;lead.followupMessageId=null;lead.autoStatus='scheduled';lead.autoReason=null;
    }
  }else{
    lead.lastInboundAt=ts;lead.inboundCount=(lead.inboundCount||0)+1;
    if(lead.waitingSince&&new Date(ts)>=new Date(lead.waitingSince)){lead.waitingSince=null;lead.status='replied';lead.autoStatus='cancelled_reply';lead.autoReason=null}
    else lead.status='inbound';
  }
  lead.updatedAt=new Date().toISOString();
  await writeJson(leadPath,lead);
  return res.status(200).json({ok:true,kind,verified:hmac===true?'hmac':'fallback',lead:{id:lead.id,name:lead.name,phone:lead.phone,status:lead.status,identityConflict:lead.identityConflict}});
}
