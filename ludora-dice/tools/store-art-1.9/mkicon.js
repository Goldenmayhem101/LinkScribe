// node mkicon.js B  -> adaptive layers (768 canvas, art in the centre 512) + 512 store icon
const {chromium}=require('playwright');const fs=require('fs');const n=process.argv[2]||'B';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:768,height:768}});
let h=fs.readFileSync('icon'+n+'.html','utf8').replace('width:512px;height:512px','width:768px;height:768px');
// shift all art into the centre 512 square
h=h.replace('<div class="rays">','<div class="rays"></div><div class="sp"></div><div id="art" style="position:absolute;left:128px;top:128px;width:512px;height:512px"><div class="x">');
h=h.replace('</body>','</div></div></body>').replace('<div class="x"><div class="rays"></div><div class="sp"></div>','<div class="x">');
fs.writeFileSync('_ic.html',h);await p.goto('file://'+process.cwd()+'/_ic.html');await p.waitForTimeout(400);
await p.screenshot({path:'ic_full768.png'});
await p.evaluate(()=>{document.querySelectorAll('.d').forEach(e=>e.style.visibility='hidden');});await p.screenshot({path:'ic_bg768.png'});
await p.evaluate(()=>{document.querySelectorAll('.d').forEach(e=>e.style.visibility='visible');document.querySelectorAll('.rays,.sp,.board').forEach(e=>e.style.visibility='hidden');document.body.style.background='transparent';});
await p.screenshot({path:'ic_fg768.png',omitBackground:true});
await b.close();})();
