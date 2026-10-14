#!/usr/bin/env python3
"""Assemble a self-contained *code* candidate from the live, already-deployed Mavera White Rose derivative.
Authentic photos stay on their exact first-party Mavera HTTPS source; this script does not download
or claim rights to those images, and never modifies the frozen White Rose original project.
Outputs a local candidate for browser QA and later no-cost Vercel redeployment."""
import hashlib,json,os,pathlib,re,shutil,urllib.request,datetime
BASE="https://mavera-jeddah-white-rose-review.vercel.app/"
OUT=pathlib.Path("candidate-mavera")
SOURCE={
"index.html":BASE,
"review/index.html":BASE+"review/",
"wr-bilingual.js":BASE+"wr-bilingual.js",
"wr-bilingual.css":BASE+"wr-bilingual.css",
"mavera-guard.js":BASE+"mavera-guard.js"
}
NEW_FIRST_PARTY="https://ik.imagekit.io/kfrvcit6d/mavera/Screenshot%202026-01-10%20at%209.18.28%E2%80%AFAM.png"
THIRD_PARTY="https://qa3at.com/storage/sites/3/O725bMBcQ7wMFoplcVHAtXlJt1fI8bUEuAP5HtH6.jpg"
report={"lock":"SA-3F-20261014-MAVERA-JEDDAH","base_deployment":"dpl_8MfEitwFudmu7ExhBPPjA6UkGqRu","built_utc":datetime.datetime.now(datetime.timezone.utc).isoformat(),
"originals_unchanged":True,"photo_binaries_rehosted":False,"image_rights_verified":False,
"venue_authoritative_capacities_verified":False,"source_manifest":{},"deployed":False}
OUT.mkdir(exist_ok=True)
for name,url in SOURCE.items():
    with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"DigitalArhatQA/1.0"}),timeout=35) as res:
        raw=res.read()
        assert res.status==200,(name,res.status)
    original=raw.decode("utf-8")
    s=original
    if name=="index.html":
        assert "mavera-guard.js" in s,"wrong source version"
        assert THIRD_PARTY in s,"expected third-party image not present; manual check needed"
        s=s.replace(THIRD_PARTY,NEW_FIRST_PARTY)
        assert "</body>" in s and not re.search("src=[\"']/mavera-persist\\.js",s),"duplicate/not HTML"
        s=s.replace("</body>",'<script defer src="/mavera-persist.js"></script></body>',1)
    if name=="review/index.html":
        assert ("ماڤيرا" in s or "Mavera" in s),"mismatched review source"
    dest=OUT/name
    dest.parent.mkdir(exist_ok=True,parents=True)
    dest.write_text(s,encoding="utf-8")
    report["source_manifest"][name]={"original_sha256":hashlib.sha256(raw).hexdigest(),"original_bytes":len(raw),"packaged_bytes":len(s.encode()),"source":url}
persist=pathlib.Path("patches/mavera-persist.js").read_bytes()
(OUT/"mavera-persist.js").write_bytes(persist)
report["source_manifest"]["mavera-persist.js"]={"sha256":hashlib.sha256(persist).hexdigest(),"bytes":len(persist)}
assert len((OUT/"index.html").read_bytes())>70000
assert len((OUT/"review/index.html").read_bytes())>17000
assert len((OUT/"wr-bilingual.js").read_bytes())>20000
for name in ("index.html","review/index.html","wr-bilingual.js"):
    s=(OUT/name).read_text("utf-8")
    assert not re.search("White Rose|الوردة البيضاء|memoriesforevents|qa3at\\.com",s,re.I),name
metadata={"manifest":report,"notice":"INTERNAL QA candidate only: NOT prospect/client-send ready; consent and independent image rights unknown"}
(OUT/"candidate-meta.json").write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding="utf-8")
print("MAVERA_CANDIDATE_MANIFEST "+json.dumps(report,ensure_ascii=False)[:4000])
