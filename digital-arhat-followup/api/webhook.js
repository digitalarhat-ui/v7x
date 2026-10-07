import crypto from 'crypto';
import { readJson, writeJson, safeId } from '../lib/store.js';
import { eventKind, getContact, getTimestamp, getPreview, getEventId } from '../lib/parse.js';

export const config = { api: { bodyParser: false } };

async function rawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function secureEqual(a, b) {
  try {
    const aa = Buffer.from(String(a));
    const bb = Buffer.from(String(b));
    return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
  } catch { return false; }
}

function verifySignature(raw, req) {
  const secret = process.env.VGRAPLE_WEBHOOK_SECRET;
  if (!secret) return null;
  const header = String(req.headers['x-signature-256'] || req.headers['x-webhook-signature'] || '');
  if (!header) return false;
  const provided = header.replace(/^sha256=/i, '').trim();
  const hex = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const base64 = crypto.createHmac('sha256', secret).update(raw).digest('base64');
  return secureEqual(provided, hex) || secureEqual(provided, base64);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'POST only' });

  const raw = await rawBody(req);
  const hmac = verifySignature(raw, req);
  const querySecret = String(req.query?.secret || '');
  const fallbackAllowed = !process.env.VGRAPLE_WEBHOOK_SECRET && querySecret && secureEqual(querySecret, process.env.WEBHOOK_SECRET || '');

  if (hmac === false || (hmac === null && !fallbackAllowed)) {
    return res.status(401).json({ ok:false, error:'Unauthorized' });
  }

  let body;
  try { body = JSON.parse(raw.toString('utf8') || '{}'); }
  catch { return res.status(400).json({ ok:false, error:'Invalid JSON' }); }

  const kind = eventKind(body);
  const contact = getContact(body, kind);
  const ts = getTimestamp(body);
  const preview = getPreview(body);
  const eventId = getEventId(body);

  const health = await readJson('meta/health.json', { accepted:0, rejected:0, unknown:0 });
  health.lastDeliveryAt = new Date().toISOString();
  health.lastEventType = kind;
  health.accepted = (health.accepted || 0) + 1;
  if (kind === 'unknown') health.unknown = (health.unknown || 0) + 1;
  await writeJson('meta/health.json', health);

  if (eventId) {
    const eventPath = 'events/' + safeId(eventId) + '.json';
    const exists = await readJson(eventPath, null);
    if (exists) return res.status(200).json({ ok:true, duplicate:true, kind });
    await writeJson(eventPath, { id:eventId, kind, receivedAt:new Date().toISOString() });
  }

  if (contact.id === 'unknown' || kind === 'unknown') {
    return res.status(202).json({ ok:true, ignored:true, kind, reason: contact.id === 'unknown' ? 'No contact identifier' : 'Unknown event type' });
  }

  const leadPath = 'leads/' + safeId(contact.id) + '.json';
  const lead = await readJson(leadPath, {
    id: contact.id,
    name: contact.name,
    phone: contact.phone,
    conversationId: contact.conversationId,
    lastOutboundAt: null,
    lastInboundAt: null,
    waitingSince: null,
    status: 'new',
    outboundCount: 0,
    inboundCount: 0,
    lastPreview: ''
  });

  lead.name = contact.name || lead.name;
  lead.phone = contact.phone || lead.phone;
  lead.conversationId = contact.conversationId || lead.conversationId;
  lead.lastPreview = preview || lead.lastPreview;

  if (kind === 'sent') {
    lead.lastOutboundAt = ts;
    lead.waitingSince = ts;
    lead.status = 'waiting';
    lead.outboundCount = (lead.outboundCount || 0) + 1;
  } else {
    lead.lastInboundAt = ts;
    lead.inboundCount = (lead.inboundCount || 0) + 1;
    if (lead.waitingSince && new Date(ts).getTime() >= new Date(lead.waitingSince).getTime()) {
      lead.waitingSince = null;
      lead.status = 'replied';
    } else {
      lead.status = 'inbound';
    }
  }

  lead.updatedAt = new Date().toISOString();
  await writeJson(leadPath, lead);
  return res.status(200).json({ ok:true, kind, lead:{ id:lead.id, name:lead.name, phone:lead.phone, status:lead.status } });
}
