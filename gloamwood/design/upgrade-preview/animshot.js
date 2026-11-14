const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1040,height:800},deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
const ids=process.argv[2],times=(process.argv[3]||'0.5,1.0,1.4,1.8').split(',').map(Number);
await p.goto('http://localhost:8799/t_anim.html?ids='+ids);await p.waitForTimeout(1500);console.log('pre',errs);
let cur=0;for(let i=0;i<times.length;i++){const T=times[i];await p.evaluate(([a,b])=>{for(let k=a;k<b;k+=1/60)step(k);drawAll(b);},[cur,T]);cur=T;await p.screenshot({path:'an'+i+'.png'});}
console.log(errs.slice(0,5));await b.close();})();
