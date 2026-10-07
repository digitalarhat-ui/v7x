import crypto from 'crypto';

function t(m){
  const v=m?.wa_timestamp||m?.created_at||m?.timestamp||m?.createdAt;
  const d=new Date(v||0);
  return Number.isNaN(d.getTime())?0:d.getTime();
}

function normPhone(v){ return String(v||'').replace(/\D/g,''); }

export function inspectConversation(lead,messages){
  const reasons=[];
  if(!lead?.conversationId) reasons.push('missing_conversation_id');
  if(!lead?.id) reasons.push('missing_contact_id');
  if(!lead?.phone) reasons.push('missing_phone');

  const convIds=new Set(messages.map(m=>String(m.conversation_id||'')).filter(Boolean));
  const contactIds=new Set(messages.map(m=>String(m.contact?.id||'')).filter(Boolean));
  const phones=new Set(messages.map(m=>normPhone(m.contact?.phone||m.contact?.wa_id||'')).filter(Boolean));

  if(convIds.size!==1 || !convIds.has(String(lead.conversationId))) reasons.push('conversation_identity_mismatch');
  if(contactIds.size>1 || (contactIds.size===1 && !contactIds.has(String(lead.id)))) reasons.push('contact_identity_mismatch');
  const leadPhone=normPhone(lead.phone);
  if(phones.size>1 || (phones.size===1 && leadPhone && !phones.has(leadPhone))) reasons.push('phone_identity_mismatch');

  const sorted=[...messages].sort((a,b)=>t(a)-t(b));
  const lastOutbound=[...sorted].reverse().find(m=>String(m.direction).toLowerCase()==='outbound');
  const lastInbound=[...sorted].reverse().find(m=>String(m.direction).toLowerCase()==='inbound');
  if(!lastOutbound) reasons.push('no_outbound_message');

  const lastOutboundMs=t(lastOutbound);
  const lastInboundMs=t(lastInbound);
  const trackedOutboundMs=new Date(lead.lastOutboundAt||0).getTime();

  if(lastInboundMs && lastInboundMs>lastOutboundMs) reasons.push('customer_already_replied');
  if(lastOutboundMs && trackedOutboundMs && Math.abs(lastOutboundMs-trackedOutboundMs)>120000) reasons.push('tracker_out_of_sync');

  const texts=sorted
    .filter(m=>['inbound','outbound'].includes(String(m.direction).toLowerCase()))
    .map(m=>({
      id:m.id||m.wa_message_id||'',
      direction:String(m.direction).toLowerCase(),
      at:m.wa_timestamp||m.created_at||'',
      text:String(m.body||'').replace(/\s+/g,' ').trim().slice(0,1000)
    }));

  const fingerprint=crypto.createHash('sha256').update(JSON.stringify({
    contactId:lead.id,conversationId:lead.conversationId,phone:leadPhone,
    lastOutboundId:lastOutbound?.id||lastOutbound?.wa_message_id||'',
    lastOutboundAt:lastOutbound?.wa_timestamp||lastOutbound?.created_at||'',
    lastOutboundBody:lastOutbound?.body||''
  })).digest('hex');

  return {
    ok:reasons.length===0,
    reasons,
    fingerprint,
    lastOutbound,
    lastInbound,
    lastOutboundMs,
    lastInboundMs,
    messageCount:texts.length,
    transcript:texts
  };
}

export function detectNiche(transcript){
  const s=transcript.map(x=>x.text).join(' ').toLowerCase();
  const groups=[
    ['automotive',['سيار','معرض سيارات','مركب','vehicle','car ','cars ','inventory','سيارات']],
    ['kitchens',['مطبخ','مطابخ','خزائن','kitchen','cabinet','wardrobe']],
    ['interior',['تصميم داخلي','ديكور','fit-out','interior','تشطيب']],
    ['landscaping',['تنسيق حدائق','حدائق','landscape','outdoor']],
    ['marble_stone',['رخام','حجر','marble','stone']],
    ['glass_aluminium',['ألمنيوم','المنيوم','زجاج','aluminium','aluminum','glass']]
  ];
  const scored=groups.map(([name,words])=>[name,words.reduce((n,w)=>n+(s.includes(w)?1:0),0)]).sort((a,b)=>b[1]-a[1]);
  return scored[0][1]>0?scored[0][0]:'unknown';
}
