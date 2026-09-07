const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../app/src/main/assets');
http.createServer((req,res)=>{
 const name=req.url==='/'?'index.html':req.url.slice(1);
 if(!['index.html','styles.css','core.js','app.js','exercise-visuals.js','exercise-guides.js','nutrition.js'].includes(name)){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html');
 res.end(fs.readFileSync(path.join(root,name)));
}).listen(4173,'127.0.0.1',()=>console.log('Android UI preview: http://127.0.0.1:4173'));
