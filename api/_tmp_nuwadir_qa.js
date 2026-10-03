export default async function handler(req, res) {
  const width = Math.max(240, Math.min(2000, Number(req.query.w || 390)));
  const height = Math.max(240, Math.min(2000, Number(req.query.h || 844)));
  const target = "https://nuwadir-alraqiya.vercel.app/";
  const params = new URLSearchParams();
  params.set("url", target);
  params.set("screenshot", "true");
  params.set("meta", "false");
  params.set("viewport.width", String(width));
  params.set("viewport.height", String(height));
  params.set("viewport.deviceScaleFactor", "1");
  params.set("waitUntil", "networkidle2");
  params.set("waitForTimeout", "1800");
  try {
    const response = await fetch("https://api.microlink.io/?" + params.toString(), {
      headers: { "Accept": "application/json" }
    });
    const body = await response.text();
    res.setHeader("Cache-Control", "no-store");
    res.status(response.status).send(body);
  } catch (error) {
    res.status(500).json({ status: "error", message: String(error && error.message || error) });
  }
}
