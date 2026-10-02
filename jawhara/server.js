import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.ico':'image/x-icon','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'};

http.createServer((req,res)=>{
  const url = new URL(req.url,'http://localhost');
  let pathname = decodeURIComponent(url.pathname);
  if(pathname==='/' || pathname==='/index.html') pathname='/index.html';
  if(pathname.startsWith('/vendor/')){
    const vendorPath = path.join(__dirname,'..',pathname);
    if(fs.existsSync(vendorPath)){res.setHeader('Content-Type',mime[path.extname(vendorPath)]||'application/octet-stream');fs.createReadStream(vendorPath).pipe(res);return;}
  }
  const filePath = path.join(__dirname, pathname.replace(/^\//,''));
  if(fs.existsSync(filePath) && fs.statSync(filePath).isFile()){
    res.setHeader('Content-Type',mime[path.extname(filePath)]||'application/octet-stream');
    res.setHeader('X-Robots-Tag','noindex, nofollow');
    fs.createReadStream(filePath).pipe(res);return;
  }
  res.statusCode=404;res.end('Not Found');
}).listen(port,'0.0.0.0',()=>console.log('Jawhara studio listening on '+port));