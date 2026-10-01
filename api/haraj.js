const SOURCE_URL = "https://haraj.com.sa/11149337708/";

function normalizeHtml(value) {
  return String(value || "")
    .replace(/\\u002F/g, "/")
    .replace(/\\\//g, "/")
    .replace(/&amp;/g, "&")
    .replace(/\\u0026/g, "&");
}

function extractImages(html) {
  const normalized = normalizeHtml(html);
  const patterns = [
    /https:\/\/[^"'<>\\s]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"'<>\\s]*)?/gi,
    /https:\/\/postcdn\.haraj\.com\.sa\/[^"'<>\\s]+/gi,
    /https:\/\/cdn\.haraj\.com\.sa\/[^"'<>\\s]+/gi
  ];

  const found = [];
  for (const pattern of patterns) {
    const matches = normalized.match(pattern) || [];
    for (const raw of matches) {
      const url = raw.replace(/[),]+$/g, "");
      if (!/haraj\.com\.sa/i.test(url)) continue;
      if (/logo|avatar|favicon|icon|flag|badge/i.test(url)) continue;
      if (!found.includes(url)) found.push(url);
    }
  }
  return found.slice(0, 14);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=86400");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);
    const response = await fetch(SOURCE_URL, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DigitalArhatPreview/1.0)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ar,en;q=0.8"
      }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(200).json({ source: SOURCE_URL, images: [], status: "source-unavailable" });
    }

    const html = await response.text();
    const images = extractImages(html);
    return res.status(200).json({
      source: SOURCE_URL,
      images,
      count: images.length,
      status: images.length ? "ok" : "no-images"
    });
  } catch (error) {
    return res.status(200).json({ source: SOURCE_URL, images: [], status: "fetch-error" });
  }
}
