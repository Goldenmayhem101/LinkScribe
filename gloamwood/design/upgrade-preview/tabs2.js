const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('response',r=>{if(r.status()>=400)errs.push(r.status()+' '+r.url())});
await p.goto('http://localhost:8799/gloamwood-upgrade.html');await p.waitForTimeout(3000);await p.screenshot({path:'n1.png'});
await p.click('#wlist .card:nth-child(6) .st:nth-child(3)');await p.waitForTimeout(1500);await p.screenshot({path:'n2.png'});await p.click('#mo .x');
await p.click('#tabs button:nth-child(2)');await p.waitForTimeout(1500);await p.screenshot({path:'n3.png'});
await p.click('#bkgrid button:not(.lk)');await p.waitForTimeout(1200);await p.screenshot({path:'n4.png'});await p.click('#mo .x');
await p.click('#tabs button:nth-child(3)');await p.waitForTimeout(1500);await p.screenshot({path:'n5.png'});
console.log(errs.slice(0,5));await b.close();})();
