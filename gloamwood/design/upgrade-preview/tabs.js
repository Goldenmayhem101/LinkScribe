const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8799/gloamwood-upgrade.html');await p.waitForTimeout(2500);
const n=await p.$$eval('#tabs button',x=>x.length);
for(let i=0;i<n;i++){await p.click(`#tabs button:nth-child(${i+1})`);await p.waitForTimeout(1200);
  if(i===3){await p.click('#cgrid .card:nth-child(5) canvas');await p.waitForTimeout(2200);}
  await p.screenshot({path:'tab'+i+'.png'});if(i===3)await p.click('#rv-ok');}
console.log(errs);await b.close();})();
