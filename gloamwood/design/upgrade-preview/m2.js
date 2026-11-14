const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8799/gloamwood-upgrade.html');await p.waitForTimeout(2000);await p.click('#tabs button:nth-child(2)');await p.waitForTimeout(800);
console.log(await p.$$eval('#mgrid .card',x=>x.length),errs);await p.screenshot({path:'m2.png'});await b.close();})();
