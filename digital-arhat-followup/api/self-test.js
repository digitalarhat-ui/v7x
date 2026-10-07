import {listJson,readJson} from '../lib/store.js';
import {getRecentMessages,listTemplates} from '../lib/vgraple.js';
import {inspectConversation} from '../lib/followup.js';
import {exactContextPhrase} from '../lib/groq.js';

function mt(m){return new Date(m.wa_timestamp||m.created_at||0).getTime()||0}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({ok:false});
  try{
    const since=new Date(Date.now()-6*3600e3).toISOString();
    const [messages,leads,templates,hook]=await Promise.all([
      getRecentMessages({since,order:'asc',limit:100}),
      listJson('leads/'),
      listTemplates(),
      readJson('meta/vgraple-signed-hook.json',null)
    ]);
    const groups=new Map();
    for(const m of messages){
      const cid=String(m.conversation_id||'');
      if(!cid||!m.contact?.id)continue;
      if(!groups.has(cid))groups.set(cid,[]);
      groups.get(cid).push(m);
    }
    const latest=[...groups.values()].sort((a,b)=>Math.max(...b.map(mt))-Math.max(...a.map(mt)))[0]||[];
    const last=[...latest].sort((a,b)=>mt(a)-mt(b)).at(-1);
    const lastOutbound=[...latest].sort((a,b)=>mt(a)-mt(b)).reverse().find(m=>String(m.direction).toLowerCase()==='outbound');
    if(!last||!lastOutbound)return res.status(409).json({ok:false,error:'no_recent_test_conversation_with_outbound'});

    const lead={
      id:String(last.contact.id),
      phone:String(last.contact.phone||last.contact.wa_id||''),
      conversationId:String(last.conversation_id),
      lastOutboundAt:new Date(mt(lastOutbound)).toISOString()
    };
    const audit=inspectConversation(lead,latest);
    const allowed=new Set(['customer_already_replied']);
    const identityReasons=audit.reasons.filter(r=>!allowed.has(r));
    let contextOk=false;
    try{await exactContextPhrase(audit.transcript);contextOk=true}catch{}
    const tracked=leads.find(x=>String(x.id)===lead.id);
    const tpl=templates.find(x=>x.name==='digital_arhat_context_followup_ar');

    return res.status(200).json({
      ok:true,
      recentMessageCount:messages.length,
      conversationMessageCount:audit.messageCount,
      exactThreadIdentityPass:identityReasons.length===0,
      customerReplySeen:audit.reasons.includes('customer_already_replied'),
      trackerContactMatched:!!tracked,
      trackerConversationMatched:!!tracked&&String(tracked.conversationId||'')===lead.conversationId,
      groqExactQuotePass:contextOk,
      templatePass:!!tpl&&Number(tpl.variable_count||0)===1,
      templateLanguage:tpl?.language||tpl?.language_code||null,
      signedHookReady:!!hook?.ready,
      autoSendEnabled:process.env.AUTO_SEND_ENABLED==='true',
      identityReasons
    });
  }catch(e){
    return res.status(Number(e.status)||500).json({ok:false,error:String(e.message||e).slice(0,180)});
  }
}
