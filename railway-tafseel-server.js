const http=require("http");
const fs=require("fs");
const path=require("path");
const root=__dirname;
const port=process.env.PORT||3000;
const allowed=[
  "/tafseel-matabekh-riyadh-v21/",
  "/kitchen-engine-v5/",
  "/vendor/"
];
const types={".html":"text/html; charset=utf-8",".js":"application/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".glb":"model/gltf-binary",".hdr":"application/octet-stream",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml"};
function resolve(reqPath){
  let p=decodeURIComponent((reqPath||"/").split("?")[0]);
  if(p==="/"||p==="")p="/tafseel-matabekh-riyadh-v21/index.html";
  if(p==="/health")return null;
  if(!allowed.some(prefix=>p.startsWith(prefix)))return false;
  const full=path.normalize(path.join(root,p));
  if(!full.startsWith(root))return false;
  return full;
}
http.createServer((req,res)=>{
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("X-Robots-Tag","noindex, nofollow, noarchive, nosnippet");
  res.setHeader("Referrer-Policy","strict-origin-when-cross-origin");
  if(req.url.split("?")[0]==="/health"){res.writeHead(200,{"Content-Type":"text/plain"});return res.end("ok");}
  const full=resolve(req.url);
  if(full===false){res.writeHead(404,{"Content-Type":"text/plain"});return res.end("Not found");}
  fs.stat(full,(err,st)=>{
    if(err){res.writeHead(404,{"Content-Type":"text/plain"});return res.end("Not found");}
    let file=full;
    if(st.isDirectory())file=path.join(full,"index.html");
    fs.readFile(file,(e,data)=>{
      if(e){res.writeHead(404,{"Content-Type":"text/plain"});return res.end("Not found");}
      const ext=path.extname(file).toLowerCase();
      res.writeHead(200,{"Content-Type":types[ext]||"application/octet-stream","Cache-Control":ext===".html"||ext===".js"?"no-cache":"public, max-age=3600"});
      res.end(data);
    });
  });
}).listen(port,"0.0.0.0",()=>console.log("Tafseel Matabekh studio listening on",port));