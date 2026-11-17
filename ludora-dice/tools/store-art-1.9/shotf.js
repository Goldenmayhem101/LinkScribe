const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:500}});
await p.goto('file://'+process.cwd()+'/'+(process.argv[2]||'feature.html'));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
await p.screenshot({path:process.argv[3]||'feature.png'});await b.close();})();
