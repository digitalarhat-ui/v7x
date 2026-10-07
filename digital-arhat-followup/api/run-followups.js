import {listJson,writeJson} from '../lib/store.js';
import {getAllMessagesForConversation,listTemplates,sendTemplate} from '../lib/vgraple.js';
import {inspectConversation,detectNiche} from '../lib/followup.js';
import {exactContextPhrase} from '../lib/groq.js';

function cronAuthorized(req){const secret=process.env.CRON_SECRET||'';return !!secret&&String(req.headers.authorization||'')==='Bearer '+secret}
async function mark(lead,patch){Object.assign(lead,patch,{updatedAt:new Date().toISOString()});const safe=encodeURIComponent(String(lead.id)).replace(/%/g,'_');await writeJson('leads/'+safe+'.json',lead)}

export default async function handler(req,res){
  if(req.method!=='GET'&&req.method!=='POST')return res.status(405).json({ok:false});
  if(!cronAuthorized(req))return res.status(401).json({ok:false,error:'Unauthorized'});

  const enabled=process.env.AUTO_SEND_ENABLED==='true';
  const templateName=process.env.VGRAPLE_FOLLOWUP_TEMPLATE||'';
  const hasApi=!!process.env.VGRAPLE_API_KEY;
  const hasGroq=!!process.env.GROQ_API_KEY;
  const leads=await listJson('leads/'),now=Date.now();
  const due=leads.filter(l=>l.waitingSince&&now-new Date(l.waitingSince).getTime()>=48*3600e3&&l.followupSentForOutboundAt!==l.lastOutboundAt);
  const result={checked:due.length,sent:0,review:0,skipped:0,enabled,templateName};

  if(!enabled||!hasApi||!templateName)return res.status(200).json({ok:true,...result,armed:false,reason:!enabled?'auto_send_disabled':!hasApi?'missing_vgraple_api':'missing_template'});

  let templates;
  try{templates=await listTemplates()}catch(e){return res.status(502).json({ok:false,...result,error:'template_lookup_failed'})}
  const tpl=templates.find(x=>x.name===templateName);
  if(!tpl)return res.status(200).json({ok:true,...result,armed:false,reason:'configured_template_not_found'});
  const vc=Number(tpl.variable_count||0);
  const contextual=templateName==='digital_arhat_context_followup_ar'&&vc===1;
  const generic=vc===0;
  if(!contextual&&!generic)return res.status(200).json({ok:true,...result,armed:false,reason:'unsafe_template_shape'});
  if(contextual&&!hasGroq)return res.status(200).json({ok:true,...result,armed:false,reason:'context_template_requires_groq'});

  for(const lead of due.slice(0,25)){
    try{
      if(lead.identityConflict){await mark(lead,{autoStatus:'needs_review',autoReason:'identity_conflict'});result.review++;continue}
      if(!lead.conversationId||!lead.id||!lead.phone){await mark(lead,{autoStatus:'needs_review',autoReason:'missing_identity_fields'});result.review++;continue}

      const messages=await getAllMessagesForConversation(lead.conversationId);
      const audit=inspectConversation(lead,messages),niche=detectNiche(audit.transcript);

      if(audit.reasons.includes('customer_already_replied')){
        await mark(lead,{waitingSince:null,status:'replied',autoStatus:'cancelled_reply_seen',autoReason:null,lastContextFingerprint:audit.fingerprint,niche});
        result.skipped++;continue;
      }
      if(audit.reasons.includes('tracker_out_of_sync')&&audit.lastOutboundMs){
        const latest=new Date(audit.lastOutboundMs).toISOString();
        await mark(lead,{lastOutboundAt:latest,waitingSince:latest,status:'waiting',autoStatus:'rescheduled_latest_outbound',autoReason:'tracker_out_of_sync',lastContextFingerprint:audit.fingerprint,niche});
        result.skipped++;continue;
      }
      if(!audit.ok){
        await mark(lead,{autoStatus:'needs_review',autoReason:audit.reasons.join(','),lastContextFingerprint:audit.fingerprint,niche,contextMessageCount:audit.messageCount});
        result.review++;continue;
      }

      let variables=[];
      if(contextual){
        const ctx=await exactContextPhrase(audit.transcript);
        variables=[ctx.phrase];
        lead.contextPhrase=ctx.phrase;
        lead.contextConfidence=ctx.confidence;
      }

      const send=await sendTemplate({to:lead.phone,template:templateName,variables});
      if(send.contact_id&&String(send.contact_id)!==String(lead.id)){
        await mark(lead,{autoStatus:'critical_review',autoReason:'send_contact_id_mismatch',lastContextFingerprint:audit.fingerprint,niche});
        result.review++;continue;
      }

      await mark(lead,{
        waitingSince:null,status:'followup_sent',followupSentAt:new Date().toISOString(),
        followupSentForOutboundAt:lead.lastOutboundAt,followupMessageId:send.message_id||null,
        followupConversationId:send.conversation_id||null,autoStatus:'sent',autoReason:null,
        lastContextFingerprint:audit.fingerprint,contextMessageCount:audit.messageCount,niche
      });
      if(send.message_id)await writeJson('autofollowups/'+encodeURIComponent(String(send.message_id)).replace(/%/g,'_')+'.json',{messageId:send.message_id,contactId:lead.id,conversationId:send.conversation_id||lead.conversationId,sentAt:new Date().toISOString()});
      result.sent++;
    }catch(e){
      await mark(lead,{autoStatus:'needs_review',autoReason:'runtime:'+String(e.message||e).slice(0,180)});
      result.review++;
    }
  }
  return res.status(200).json({ok:true,...result,armed:true,contextual});
}
