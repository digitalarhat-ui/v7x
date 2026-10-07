const BASE='https://crm.vgraple.co.in/api/v1';

function key(){ return process.env.VGRAPLE_API_KEY || ''; }

async function vg(path, options={}){
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
    const e=new Error(data?.error||('VGraple '+r.status));
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

export async function listTemplates(){
  const d=await vg('/templates');
  return d.templates||[];
}

export async function sendTemplate({to,template,variables=[]}){
  const body={to,template};
  if(Array.isArray(variables) && variables.length) body.variables=variables;
  return vg('/messages',{method:'POST',body:JSON.stringify(body)});
}

export async function testAuth(){
  return vg('/me');
}
