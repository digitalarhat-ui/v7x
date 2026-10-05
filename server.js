const http = require("http");
const fs = require("fs");
const path = require("path");
const root = __dirname;
const port = Number(process.env.PORT || 3000);
const types = {".html":"text/html; charset=utf-8",".js":"application/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".ico":"image/x-icon",".woff2":"font/woff2"};
function resolvePath(urlPath){
  let pathname;
  try{ pathname = decodeURIComponent(new URL(urlPath,"http://localhost").pathname); }catch{ pathname="/"; }
  if(pathname==="/") pathname="/dakhakhni-kitchen-v4/index.html";
  let file=path.join(root, pathname.replace(/^\/+/, ""));
  if(!file.startsWith(root)) return null;
  try{ if(fs.existsSync(file) && fs.statSync(file).isDirectory()) file=path.join(file,"index.html"); }catch{}
  return file;
}
http.createServer((req,res)=>{
  const file=resolvePath(req.url||"/");
  if(!file || !fs.existsSync(file) || !fs.statSync(file).isFile()){
    res.writeHead(404,{"content-type":"text/plain; charset=utf-8"});res.end("Not found");return;
  }
  const ext=path.extname(file).toLowerCase();
  res.writeHead(200,{
    "content-type":types[ext]||"application/octet-stream",
    "cache-control":ext===".html"?"no-store":"public, max-age=300",
    "x-robots-tag":"noindex, nofollow, noarchive, nosnippet"
  });
  fs.createReadStream(file).pipe(res);
}).listen(port,"0.0.0.0",()=>console.log("Dakhakhni demo listening on "+port));