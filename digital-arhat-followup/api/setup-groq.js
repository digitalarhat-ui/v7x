import crypto from 'node:crypto';
import {readJson,writeJson} from '../lib/store.js';
import {setStoredSecret} from '../lib/secrets.js';

const TOKEN_HASH='66992a4b535e05ce3b56d29a39824dc3eab6c9a31dda06fa0b2fd39100a64d23';
const EXPIRES_AT=1791360266167;
const STATE_PATH='config/groq-setup-token.json';

function hash(v){return crypto.createHash('sha256').update(String(v||'')).digest('hex')}
async function validToken(token){
  if(Date.now()>EXPIRES_AT)return false;
  if(hash(token)!==TOKEN_HASH)return false;
  const state=await readJson(STATE_PATH,{used:false});
  return !state.used;
}

function page(token){
  const tokenJson=JSON.stringify(token);
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>Connect Groq</title>'+
  '<style>body{font-family:system-ui,-apple-system,sans-serif;background:#0b0b0b;color:#fff;margin:0;padding:24px}main{max-width:520px;margin:40px auto;background:#171717;border:1px solid #333;border-radius:18px;padding:22px}h1{font-size:22px;margin-top:0}p{color:#cfcfcf;line-height:1.5}input{box-sizing:border-box;width:100%;padding:14px;border-radius:10px;border:1px solid #444;background:#0f0f0f;color:#fff;font-size:16px;margin:10px 0 14px}button{width:100%;padding:14px;border:0;border-radius:10px;font-weight:700;font-size:16px}#s{margin-top:14px;min-height:24px}</style></head>'+
  '<body><main><h1>Connect Groq API Key</h1><p>Apni fresh Groq key <b>gsk_...</b> yahan paste karein. Key chat mein share nahi hogi. Save se pehle live Groq verification hogi.</p>'+
  '<input id="k" type="password" autocomplete="off" placeholder="gsk_..."><button id="b">Verify & Save</button><div id="s"></div></main>'+
  '<script>const token='+tokenJson+';document.getElementById("b").onclick=async()=>{const k=document.getElementById("k").value.trim(),s=document.getElementById("s"),b=document.getElementById("b");if(!k.startsWith("gsk_")){s.textContent="Groq key gsk_ se start honi chahiye.";return}b.disabled=true;s.textContent="Verifying...";try{const r=await fetch("/api/setup-groq?token="+encodeURIComponent(token),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key:k})});const j=await r.json();s.textContent=j.ok?"✅ Groq connected successfully. Ab is page ko close kar dein.":"❌ "+(j.error||"Could not save");if(!j.ok)b.disabled=false;else document.getElementById("k").value="";}catch{s.textContent="❌ Network error";b.disabled=false;}};</script></body></html>';
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Referrer-Policy','no-referrer');
  const token=String(req.query?.token||'');
  if(!(await validToken(token)))return res.status(403).send('This one-time setup link is invalid, expired, or already used.');

  if(req.method==='GET'){
    res.setHeader('Content-Type','text/html; charset=utf-8');
    return res.status(200).send(page(token));
  }
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'Method not allowed'});

  const key=String(req.body?.key||'').trim();
  if(!key.startsWith('gsk_')||key.length<20)return res.status(400).json({ok:false,error:'Invalid Groq key format'});

  try{
    const test=await fetch('https://api.groq.com/openai/v1/models',{headers:{Authorization:'Bearer '+key},cache:'no-store'});
    if(!test.ok)return res.status(400).json({ok:false,error:'Groq rejected this key'});
    await setStoredSecret('GROQ_API_KEY',key);
    await writeJson(STATE_PATH,{used:true,usedAt:new Date().toISOString()});
    return res.status(200).json({ok:true});
  }catch{
    return res.status(500).json({ok:false,error:'Could not verify/save key'});
  }
}
