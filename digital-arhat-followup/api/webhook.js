import crypto from 'crypto';
import {readJson,writeJson,safeId} from '../lib/store.js';
import {eventKind,getContact,getTimestamp,getPreview,getEventId,pick} from '../lib/parse.js';

export const config={api:{bodyParser:false}};

async function rawBody(req){const chunks=[];for await(const chunk of req)chunks.push(Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk));return Buffer.concat(chunks)}
function secureEqual(a,b){try{const aa=Buffer.from(String(a)),bb=Buffer.from(String(b));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb)}catch{return false}}
function verifySignature(raw,req){
  const secret=process.env.VGRAPLE_WEBHOOK_SECRET;
  if(!secret)return null;
  const header=String(req.headers['x-signature-256']||req.headers['x-webhook-signature']||'');
  if(!header)return false;
  const provided=header.replace(/^sha256=/i,'').trim();
  const hex=crypto.createHmac('sha256',secret).update(raw).digest('hex');
  const base64=crypto.createHmac('sha256',secret).update(raw).digest('base64');
  return secureEqual(provided,hex)||secureEqual(provided,base64);
}

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'POST only'});
  const raw=await rawBody(req);
  const hmac=verifySignature(raw,req);
  const querySecret=String(req.query?.secret||'');
  const fallbackAllowed=!process.env.VGRAPLE_WEBHOOK_SECRET&&querySecret&&secureEqual(querySecret,process.env.WEBHOOK_SECRET||'');
  if(hmac===false||(hmac===null&&!fallbackAllowed))return res.status(401).json({ok:false,error:'Unauthorized'});

  let body;try{body=JSON.parse(raw.toString('utf8')||'{}')}catch{return res.status(400).json({ok:false,error:'Invalid JSON'})}
  const kind=eventKind(body),contact=getContact(body,kind),ts=getTimestamp(body),preview=getPreview(body),eventId=getEventId(body);
  const waMessageId=String(pick(body,['wa_message_id','message.wa_message_id','data.message.wa_message_id','message.id','data.message.id'])||eventId||'');
  const health=await readJson('meta/health.json',{accepted:0,rejected:0,unknown:0});
  Object.assign(health,{lastDeliveryAt:new Date().toISOString(),lastEventType:kind,accepted:(health.accepted||0)+1});
  if(kind==='unknown')health.unknown=(health.unknown||0)+1;
  await writeJson('meta/health.json',health);

  if(eventId){
    const eventPath='events/'+safeId(eventId)+'.json';
    const exists=await readJson(eventPath,null);
    if(exists)return res.status(200).json({ok:true,duplicate:true,kind});
    await writeJson(eventPath,{id:eventId,kind,receivedAt:new Date().toISOString()});
  }
  if(contact.id==='unknown'||kind==='unknown')return res.status(202).json({ok:true,ignored:true,kind});

  const historyKey='history/'+safeId(contact.id)+'/'+String(Date.now())+'-'+safeId(eventId||waMessageId||crypto.randomUUID())+'.json';
  await writeJson(historyKey,{
    eventId:eventId||null,waMessageId:waMessageId||null,kind,contactId:contact.id,conversationId:contact.conversationId||null,
    phone:contact.phone||null,name:contact.name||null,timestamp:ts,text:preview||'',receivedAt:new Date().toISOString()
  });

  const leadPath='leads/'+safeId(contact.id)+'.json';
  const lead=await readJson(leadPath,{id:contact.id,phone:'',name:'Unknown lead',conversationId:'',lastOutboundAt:null,lastInboundAt:null,waitingSince:null,status:'new',outboundCount:0,inboundCount:0,lastPreview:'',identityConflict:false});

  // Fail closed on any stable identity collision.
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
  return res.status(200).json({ok:true,kind,lead:{id:lead.id,name:lead.name,phone:lead.phone,status:lead.status,identityConflict:lead.identityConflict}});
}
