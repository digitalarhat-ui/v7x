const BASE='https://crm.vgraple.co.in/api/v1';

function key(){ return process.env.VGRAPLE_API_KEY || ''; }

export async function vg(path, options={}){
  if(!key()) throw new Error('VGRAPLE_API_KEY_MISSING');
  const r=await fetch(BASE+path,{
    ...options,
    headers:{
      'Authorization':'Bearer '+key(),
      'Content-Type':'application/json',
      ...(options.headers||{})
    },
    cache:'no-store'
  });
  let data={};
  try{ data=await r.json(); }catch{}
  if(!r.ok){
    const msg=typeof data?.error==='string'?data.error:(data?.error?.message||data?.message||('VGraple '+r.status));
    const e=new Error(msg);
    e.status=r.status; e.data=data; throw e;
  }
  return data;
}

export async function getAllMessagesForConversation(conversationId){
  const all=[]; let cursor=null; let guard=0;
  do{
    const q=new URLSearchParams({conversation_id:conversationId,order:'asc',limit:'100'});
    if(cursor) q.set('cursor',cursor);
    const d=await vg('/messages?'+q.toString());
    all.push(...(d.messages||[]));
    cursor=d.next_cursor||null;
    guard++;
  }while(cursor && guard<50);
  return all;
}

export async function getRecentMessages({since,until,order='asc',limit=100}={}){
  const all=[]; let cursor=null; let guard=0;
  do{
    const q=new URLSearchParams({order:String(order),limit:String(Math.min(100,limit||100))});
    if(since)q.set('since',since);
    if(until)q.set('until',until);
    if(cursor)q.set('cursor',cursor);
    const d=await vg('/messages?'+q.toString());
    all.push(...(d.messages||[]));
    cursor=d.next_cursor||null;
    guard++;
  }while(cursor&&guard<20);
  return all;
}

export async function listTemplates(){
  const d=await vg('/templates');
  return d.templates||[];
}

export async function sendTemplate({to,template,language='ar',variables=[]}){
  const body={to,template,language};
  if(Array.isArray(variables) && variables.length) body.variables=variables;
  const d=await vg('/messages',{method:'POST',body:JSON.stringify(body)});
  const m=d.message||d;
  return {
    raw:d,
    message_id:m.id||d.message_id||null,
    conversation_id:m.conversation_id||d.conversation_id||null,
    contact_id:m.contact?.id||d.contact_id||d.contact?.id||null
  };
}

export async function testAuth(){ return vg('/me'); }
export async function listHooks(){ const d=await vg('/hooks'); return d.hooks||d.subscriptions||[]; }
export async function createHook({url,events}){ return vg('/hooks',{method:'POST',body:JSON.stringify({url,events})}); }
