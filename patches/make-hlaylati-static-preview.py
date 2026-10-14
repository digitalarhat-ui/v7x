#!/usr/bin/env python3
"""Adapt existing client-isolated local-QA-PASS HTML for immutable public CDN URL.
No media binary republishing, no automatic outbound, no paid deployment.
Creates ONLY client-specific public-preview folder; keeps candidate and Golden unchanged.
"""
from pathlib import Path
import shutil,re
S=Path("candidate-hlaylati");D=Path("hlaylati-public-preview")
D.mkdir(exist_ok=True)
paths=["index.html","review/index.html","wr-bilingual.css","wr-bilingual.js","hlaylati-guard.js","hlaylati-layer.css","hlaylati-layer.js"]
for path in paths:
 src=S/path;dst=D/path;dst.parent.mkdir(exist_ok=True,parents=True)
 text=src.read_text("utf8")
 if path.endswith(".html"):
  root=".." if path.startswith("review/") else "."
  for file in ["wr-bilingual.css","wr-bilingual.js","hlaylati-layer.css","hlaylati-guard.js","hlaylati-layer.js"]:
   text=text.replace('href="/'+file+'"','href="'+root+'/'+file+'"').replace('src="/'+file+'"','src="'+root+'/'+file+'"')
  if path.startswith("review/"):
   text=text.replace('href="/"','href="../index.html"')
  text=text.replace("<meta name=\"robots\" content=\"noindex,nofollow\">",'<meta name="robots" content="noindex,nofollow">')
 elif path=="wr-bilingual.js":
  text=text.replace('location.pathname.startsWith("/review")','location.pathname.includes("/review/")')
 elif path=="hlaylati-layer.js":
  text=text.replace("location.pathname.startsWith('/review')","location.pathname.includes('/review/')")
  text=text.replace("href=\"/review/\"","href=\"./review/index.html\"")
  text=text.replace("$('hly-review').href='/review/?brief='+","$('hly-review').href=(REV?'./index.html':'./review/index.html')+'?brief='+")
 elif path=="hlaylati-guard.js":
  # Use only publisher-verified business contact channels; not assert a phone is WhatsApp.
  text=text.replace("const wa='https://wa.me/966539191090';","const wa='mailto:info@hlaylati.com';")
  text=text.replace("if(/wa\\.me|api\\.whatsapp\\.com/i.test(a.href))a.href=wa;",
   "if(/wa\\.me|api\\.whatsapp\\.com/i.test(a.href)){a.href=wa;a.textContent=lang===EN?'Official business email':'البريد الرسمي للشركة';}")
 # Make mobile/desktop source original assets relative only; other URLs remain official and unchanged.
 dst.write_text(text,"utf8")
for path in paths:
 t=(D/path).read_text("utf8")
 assert not re.search(r"mavera|ماڤيرا|مافيرا|White Rose|الوردة البيضاء|memoriesforevents",t,re.I),path
 assert not re.search(r"wa\.me|api\.whatsapp\.com",t,re.I) or path=="hlaylati-guard.js",path
assert all((D/p).exists() for p in paths)
print("PREVIEW_STATIC_READY",[(p,(D/p).stat().st_size) for p in paths])
