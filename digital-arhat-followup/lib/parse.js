export function pick(obj, paths) {
  for (const p of paths) {
    let v = obj;
    for (const k of p.split('.')) v = v && typeof v === 'object' ? v[k] : undefined;
    if (v !== undefined && v !== null && String(v).trim() !== '') return v;
  }
}

export function eventKind(body) {
  const raw = String(pick(body, ['event','type','eventType','event_name','name','data.event','data.type','payload.event','payload.type']) || '').toLowerCase();
  const direction = String(pick(body, ['direction','data.direction','payload.direction','message.direction','data.message.direction']) || '').toLowerCase();
  if (raw.includes('message.received') || raw.includes('received') || raw.includes('inbound') || direction === 'inbound' || direction === 'incoming') return 'received';
  if (raw.includes('message.sent') || raw.includes('sent') || raw.includes('outbound') || direction === 'outbound' || direction === 'outgoing') return 'sent';
  return 'unknown';
}

export function normalizePhone(v) {
  if (!v) return '';
  return String(v).replace(/[^0-9+]/g, '').replace(/^00/, '+');
}

export function getContact(body, kind) {
  const id = pick(body, [
    'contact.id','contactId','contact_id','data.contact.id','data.contactId',
    'payload.contact.id','conversation.contactId','data.conversation.contactId',
    'message.contactId','data.message.contactId'
  ]);
  const contactPhone = pick(body, ['contact.phone','data.contact.phone','payload.contact.phone','contact.phoneNumber','data.contact.phoneNumber','wa_id','data.wa_id']);
  const directionalPhone = kind === 'sent'
    ? pick(body, ['to','data.to','message.to','data.message.to'])
    : pick(body, ['from','data.from','message.from','data.message.from']);
  const phone = normalizePhone(contactPhone || directionalPhone);
  const name = pick(body, ['contact.name','data.contact.name','payload.contact.name','contact.fullName','data.contact.fullName','profile.name','data.profile.name']) || 'Unknown lead';
  const conversationId = pick(body, ['conversation.id','conversationId','conversation_id','data.conversation.id','payload.conversation.id']);
  return {
    id: String(id || conversationId || phone || 'unknown'),
    name: String(name),
    phone,
    conversationId: String(conversationId || '')
  };
}

export function getTimestamp(body) {
  const v = pick(body, ['timestamp','createdAt','created_at','data.timestamp','data.createdAt','payload.timestamp','message.timestamp','data.message.timestamp']);
  if (!v) return new Date().toISOString();
  const d = new Date(typeof v === 'number' && v < 1e12 ? v * 1000 : v);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export function getPreview(body) {
  const v = pick(body, ['message.text','text','body','data.message.text','data.text','payload.message.text','message.body','data.message.body','content.text']);
  return v ? String(v).replace(/\s+/g,' ').slice(0,180) : '';
}

export function getEventId(body) {
  return String(pick(body, ['event_id','eventId','id','data.id','payload.id','message.id','data.message.id','payload.message.id']) || '');
}
