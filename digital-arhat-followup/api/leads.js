import { listJson, readJson } from '../lib/store.js';

function authorized(req) {
  const key = String(req.query?.key || req.headers['x-dashboard-key'] || '');
  return !!key && key === process.env.DASHBOARD_KEY;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok:false, error:'GET only' });
  if (!authorized(req)) return res.status(401).json({ ok:false, error:'Unauthorized' });

  const leads = await listJson('leads/');
  const health = await readJson('meta/health.json', { accepted:0, rejected:0, unknown:0 });
  const now = Date.now();

  const enriched = leads.map(l => {
    const waitingHours = l.waitingSince ? Math.max(0, (now - new Date(l.waitingSince).getTime()) / 36e5) : 0;
    const due = !!l.waitingSince && waitingHours >= 48;
    return { ...l, waitingHours: Math.round(waitingHours * 10) / 10, due };
  }).sort((a,b) => Number(b.due)-Number(a.due) || (b.waitingHours||0)-(a.waitingHours||0));

  const due = enriched.filter(x => x.due);
  const waiting = enriched.filter(x => x.waitingSince && !x.due);
  const replied = enriched.filter(x => !x.waitingSince);

  return res.status(200).json({
    ok:true,
    thresholdHours:48,
    due, waiting, replied,
    totals:{ all:enriched.length, due:due.length, waiting:waiting.length, replied:replied.length },
    health
  });
}
