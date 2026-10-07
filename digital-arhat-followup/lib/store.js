import { list, put } from '@vercel/blob';

const token = () => process.env.BLOB_READ_WRITE_TOKEN;

export async function readJson(path, fallback = null) {
  const { blobs } = await list({ prefix: path, limit: 1, token: token() });
  const blob = blobs.find(b => b.pathname === path);
  if (!blob) return fallback;
  const r = await fetch(blob.url, { headers: { Authorization: 'Bearer ' + token() }, cache: 'no-store' });
  if (!r.ok) return fallback;
  return await r.json();
}

export async function writeJson(path, value) {
  return put(path, JSON.stringify(value), {
    access: 'private',
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: 'application/json',
    cacheControlMaxAge: 0,
    token: token()
  });
}

export async function listJson(prefix) {
  const out = [];
  let cursor;
  do {
    const page = await list({ prefix, limit: 1000, cursor, token: token() });
    for (const b of page.blobs) {
      try {
        const r = await fetch(b.url, { headers: { Authorization: 'Bearer ' + token() }, cache: 'no-store' });
        if (r.ok) out.push(await r.json());
      } catch {}
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return out;
}

export function safeId(v) {
  return encodeURIComponent(String(v || 'unknown')).replace(/%/g, '_');
}
