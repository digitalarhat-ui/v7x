import {listJson,readJson} from '../lib/store.js';

function authorized(req){const key=String(req.query?.key||req.headers['x-dashboard-key']||'');return !!key&&key===process.env.DASHBOARD_KEY}

export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'GET only'});
  if(!authorized(req))return res.status(401).json({ok:false,error:'Unauthorized'});
  try{
    const leads=await listJson('leads/'),health=await readJson('meta/health.json',{accepted:0,rejected:0,unknown:0}),now=Date.now();
    const enriched=leads.map(l=>{const waitingHours=l.waitingSince?Math.max(0,(now-new Date(l.waitingSince).getTime())/36e5):0;const due=!!l.waitingSince&&waitingHours>=48;return{...l,waitingHours:Math.round(waitingHours*10)/10,due}})
      .sort((a,b)=>Number(b.due)-Number(a.due)||(b.waitingHours||0)-(a.waitingHours||0));
    const due=enriched.filter(x=>x.due),waiting=enriched.filter(x=>x.waitingSince&&!x.due),review=enriched.filter(x=>x.status==='needs_review'||String(x.autoStatus||'').includes('review')),replied=enriched.filter(x=>!x.waitingSince&&!review.includes(x));
    return res.status(200).json({
      ok:true,thresholdHours:48,due,waiting,replied,review,
      totals:{all:enriched.length,due:due.length,waiting:waiting.length,replied:replied.length,review:review.length},
      health,
      automation:{
        enabled:process.env.AUTO_SEND_ENABLED==='true',
        apiConnected:!!process.env.VGRAPLE_API_KEY,
        groqConnected:!!process.env.GROQ_API_KEY,
        templateConfigured:!!process.env.VGRAPLE_FOLLOWUP_TEMPLATE,
        templateName:process.env.VGRAPLE_FOLLOWUP_TEMPLATE||'',
        contextual:process.env.VGRAPLE_FOLLOWUP_TEMPLATE==='digital_arhat_context_followup_ar',
        hmacConfigured:!!process.env.VGRAPLE_WEBHOOK_SECRET,
        mode:'fail-closed'
      }
    });
  }catch(e){console.error(e);return res.status(500).json({ok:false,error:'Unable to load leads'})}
}
