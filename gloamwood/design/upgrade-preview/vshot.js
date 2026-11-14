const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:1400},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8799/vector-test.html');await p.waitForTimeout(1500);await p.screenshot({path:'v1.png',fullPage:true});
await p.waitForTimeout(1300);await p.locator('#c1').screenshot({path:'v2.png'});await p.locator('#c2').screenshot({path:'v3.png'});
console.log(errs);await b.close();})();
