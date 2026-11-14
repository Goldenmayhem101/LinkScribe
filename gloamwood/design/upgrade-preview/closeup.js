// big close-up frames of one monster at several times
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1040,height:800},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ids=process.argv[2];const T=(process.argv[4]||'.5,1.2,1.9,2.6,3.3,4.0').split(',').map(Number);
await p.goto('http://localhost:8799/t_anim.html?ids='+ids);
await p.waitForFunction(()=>Object.values(SPR).length&&Object.values(SPR).every(s=>s.ok),null,{timeout:15000}).catch(()=>{});
await p.evaluate(()=>{for(const[S]of SC)for(const a of S.actors)a.wait=2.2;});
let cur=0;const shots=[];for(const t of T){await p.evaluate(([a,b])=>{for(let k=a;k<b;k+=1/60)step(k);drawAll(b);},[cur,t]);cur=t;shots.push(await p.evaluate(()=>[...document.querySelectorAll('canvas')].map(c=>c.toDataURL('image/jpeg',.85))));}
require('fs').writeFileSync(process.argv[3],JSON.stringify(shots));console.log(errs.slice(0,3));await b.close();})();
