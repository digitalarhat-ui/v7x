import crypto from 'node:crypto';
import {readJson,writeJson} from './store.js';

const SECRET_PATH='config/secrets.json';

function masterKey(){
  const raw=process.env.SETUP_ENCRYPTION_KEY||'';
  if(!raw)throw new Error('SETUP_ENCRYPTION_KEY_MISSING');
  return crypto.createHash('sha256').update(raw).digest();
}

function encrypt(value){
  const iv=crypto.randomBytes(12);
  const cipher=crypto.createCipheriv('aes-256-gcm',masterKey(),iv);
  const data=Buffer.concat([cipher.update(String(value),'utf8'),cipher.final()]);
  const tag=cipher.getAuthTag();
  return {v:1,iv:iv.toString('base64'),tag:tag.toString('base64'),data:data.toString('base64')};
}

function decrypt(payload){
  if(!payload||payload.v!==1)throw new Error('SECRET_FORMAT_INVALID');
  const iv=Buffer.from(payload.iv,'base64');
  const tag=Buffer.from(payload.tag,'base64');
  const data=Buffer.from(payload.data,'base64');
  const decipher=crypto.createDecipheriv('aes-256-gcm',masterKey(),iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data),decipher.final()]).toString('utf8');
}

export async function setStoredSecret(name,value){
  const all=await readJson(SECRET_PATH,{});
  all[name]=encrypt(value);
  await writeJson(SECRET_PATH,all);
}

export async function getStoredSecret(name){
  const all=await readJson(SECRET_PATH,{});
  if(!all?.[name])return '';
  try{return decrypt(all[name]);}catch{return '';}
}
