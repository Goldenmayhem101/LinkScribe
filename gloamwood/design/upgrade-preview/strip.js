// one row per monster: 7 moments through its first attack
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1040,height:800},deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ids=process.argv[2].split(',');const out=process.argv[3];
await p.goto('http://localhost:8799/t_anim.html?ids='+ids.join(','));
await p.waitForFunction(()=>Object.values(SPR).length&&Object.values(SPR).every(s=>s.ok),null,{timeout:15000}).catch(()=>{});
await p.evaluate(()=>{for(const[S]of SC){for(const a of S.actors){a.wait=.2;}}});
const T=[.35,.7,1.0,1.3,1.6,2.0,2.5];let cur=0;const shots=[];
for(let i=0;i<T.length;i++){await p.evaluate(([a,b])=>{for(let k=a;k<b;k+=1/60)step(k);drawAll(b);},[cur,T[i]]);cur=T[i];
  shots.push(await p.evaluate(()=>[...document.querySelectorAll('canvas')].map(c=>c.toDataURL('image/jpeg',.8))));}
require('fs').writeFileSync(out,JSON.stringify(shots));console.log(errs.slice(0,4));await b.close();})();
