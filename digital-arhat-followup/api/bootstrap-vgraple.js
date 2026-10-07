import {readJson,writeJson} from '../lib/store.js';
import {setStoredSecret} from '../lib/secrets.js';
import {createHook,listTemplates} from '../lib/vgraple.js';

const STATE='meta/vgraple-signed-hook.json';
const URL='https://digital-arhat-followup-live.vercel.app/api/webhook';

function findSecret(x){
  if(typeof x==='string'&&x.startsWith('whsec_'))return x;
  if(!x||typeof x!=='object')return '';
  for(const v of Object.values(x)){const s=findSecret(v);if(s)return s}
  return '';
}
function findId(x){
  if(!x||typeof x!=='object')return '';
  for(const k of ['id','hook_id','subscription_id'])if(typeof x[k]==='string'&&x[k])return x[k];
  for(const v of Object.values(x)){const s=findId(v);if(s)return s}
  return '';
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({ok:false});
  const prior=await readJson(STATE,null);
  if(prior?.ready)return res.status(200).json({ok:true,ready:true,already:true,template:prior.template||null});

  try{
    const templates=await listTemplates();
    const tpl=templates.find(x=>x.name==='digital_arhat_context_followup_ar');
    if(!tpl)return res.status(409).json({ok:false,error:'approved_template_not_found'});
    if(Number(tpl.variable_count||0)!==1)return res.status(409).json({ok:false,error:'template_variable_count_not_1'});

    const created=await createHook({url:URL,events:['message.received','message.sent']});
    const secret=findSecret(created);
    if(!secret)return res.status(502).json({ok:false,error:'hook_created_but_secret_missing'});
    await setStoredSecret('VGRAPLE_WEBHOOK_SECRET',secret);
    const state={
      ready:true,
      createdAt:new Date().toISOString(),
      hookId:findId(created)||null,
      url:URL,
      events:['message.received','message.sent'],
      template:{name:tpl.name,variable_count:Number(tpl.variable_count||0),language:tpl.language||tpl.language_code||'ar'}
    };
    await writeJson(STATE,state);
    return res.status(200).json({ok:true,ready:true,hookCreated:true,template:state.template});
  }catch(e){
    return res.status(Number(e.status)||500).json({ok:false,error:String(e.message||e).slice(0,180)});
  }
}
