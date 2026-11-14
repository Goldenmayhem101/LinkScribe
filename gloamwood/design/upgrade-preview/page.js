const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('response',r=>{if(r.status()>=400)errs.push(r.status()+' '+r.url())});
await p.goto('http://localhost:8799/gloamwood-upgrade.html');await p.waitForTimeout(3500);await p.screenshot({path:'p1.png'});
await p.click('#wlist .card:nth-child(7) .st:nth-child(5)');await p.waitForTimeout(3500);await p.screenshot({path:'p2.png'});await p.click('#mo .x');
await p.click('#tabs button:nth-child(2)');await p.waitForTimeout(3000);await p.screenshot({path:'p3.png'});
await p.click('#tabs button:nth-child(3)');await p.waitForTimeout(1500);await p.screenshot({path:'p4.png'});
await p.click('#bkgrid button:not(.lk)');await p.waitForTimeout(2500);await p.screenshot({path:'p5.png'});await p.click('#mo .x');
await p.click('#tabs button:nth-child(4)');await p.waitForTimeout(3000);await p.screenshot({path:'p6.png'});
console.log(errs.slice(0,6));await b.close();})();
