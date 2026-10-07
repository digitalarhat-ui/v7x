import {testAuth} from '../lib/vgraple.js';
import {getGroqApiKey} from '../lib/groq.js';
import {getStoredSecret} from '../lib/secrets.js';

function authorized(req){const key=String(req.query?.key||req.headers['x-dashboard-key']||'');return !!key&&key===process.env.DASHBOARD_KEY}

async function testGroq(){
  const key=await getGroqApiKey();
  if(!key)return {ok:false,error:'missing'};
  try{
    const r=await fetch('https://api.groq.com/openai/v1/models',{headers:{Authorization:'Bearer '+key},cache:'no-store'});
    return {ok:r.ok,status:r.status};
  }catch(e){return {ok:false,error:'network'};}
}

async function testVgraple(){
  try{await testAuth();return {ok:true};}
  catch(e){return {ok:false,error:String(e.message||e).slice(0,120)};}
}

export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({ok:false});
  if(!authorized(req))return res.status(401).json({ok:false,error:'Unauthorized'});
  const [groq,vgraple,storedWebhook]=await Promise.all([testGroq(),testVgraple(),getStoredSecret('VGRAPLE_WEBHOOK_SECRET')]);
  return res.status(200).json({ok:true,groq,vgraple,templateConfigured:!!process.env.VGRAPLE_FOLLOWUP_TEMPLATE,hmacConfigured:!!(storedWebhook||process.env.VGRAPLE_WEBHOOK_SECRET),autoSendEnabled:process.env.AUTO_SEND_ENABLED==='true'});
}
