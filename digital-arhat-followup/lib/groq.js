import {getStoredSecret} from './secrets.js';

function normalize(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim()}

export async function getGroqApiKey(){
  return (await getStoredSecret('GROQ_API_KEY')) || process.env.GROQ_API_KEY || '';
}

export async function exactContextPhrase(transcript){
  const apiKey=await getGroqApiKey();
  if(!apiKey)throw new Error('GROQ_API_KEY_MISSING');
  const outbound=transcript.filter(x=>x.direction==='outbound'&&x.text).map(x=>x.text);
  const allText=transcript.map(x=>`[${x.direction}] ${x.text}`).join('\n');
  if(allText.length>60000)throw new Error('conversation_too_long_for_safe_auto');
  const prompt=`Return JSON only with keys phrase and confidence.
Choose a safe WhatsApp follow-up context phrase from the conversation below.
Rules:
- phrase MUST be an exact contiguous quote copied from one OUTBOUND message below.
- 3 to 10 words maximum.
- Prefer the phrase that identifies the commercial topic or problem discussed.
- Do not invent, translate, paraphrase, add punctuation, add a niche, add a service, or add a claim.
- Ignore greetings and names.
- confidence must be 0 to 1.
Conversation:
${allText}`;
  const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
    method:'POST',
    headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},
    body:JSON.stringify({model:'openai/gpt-oss-120b',temperature:0.05,response_format:{type:'json_object'},messages:[{role:'user',content:prompt}]})
  });
  let data={};try{data=await r.json()}catch{}
  if(!r.ok)throw new Error(data?.error?.message||'Groq request failed');
  let obj={};try{obj=JSON.parse(data?.choices?.[0]?.message?.content||'{}')}catch{throw new Error('Groq returned invalid JSON')}
  const phrase=String(obj.phrase||'').trim(),confidence=Number(obj.confidence||0),phraseNorm=normalize(phrase);
  const exact=outbound.some(t=>normalize(t).includes(phraseNorm));
  const words=phrase.split(/\s+/).filter(Boolean).length;
  if(!phrase||!exact||words<3||words>10||phrase.length>120||confidence<0.92)throw new Error('context_phrase_failed_strict_validation');
  return {phrase,confidence};
}
