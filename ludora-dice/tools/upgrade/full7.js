// plays full games vs computer with entry 1,000 on auto play; checks coins (winner takes all, no 2nd-place refund) and chest drops
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const out=[];
for(let run=0;run<Number(process.argv[2]||4);run++){
  const p=await b.newPage({viewport:{width:390,height:844}});p.setDefaultTimeout(8000);const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8765/dbg.html');await p.waitForTimeout(7000);
  await p.click('#gf-chest',{force:true}).catch(()=>{});await p.waitForTimeout(2000);const c=p.locator('.giftov .btn');if(await c.count())await c.first().click({force:true});await p.waitForTimeout(800);
  const n=[2,4][run%2];
  await p.evaluate(()=>__ev("set.slots=[null,null,null,null];set.coins=10000;save();refreshStars();"));
  await p.evaluate(()=>__ev("window.__ludoraV7.openSetup('cpu')"));
  await p.click(`#su7-seg [data-v="${n}"]`);for(let k=0;k<3;k++)await p.click('[data-step="1"]');
  const prize=await p.textContent('.su7pz');
  await p.evaluate(()=>__ev('SPEED=0.02'));await p.click('#su7-play');await p.waitForTimeout(400);
  const afterFee=await p.evaluate(()=>__ev('set.coins'));
  await p.waitForTimeout(3000);await p.evaluate(()=>__ev("set.tut=true;document.getElementById('b-auto').click();"));
  let t=0;while(t<300){await p.waitForTimeout(1000);t++;if(await p.evaluate(()=>!document.getElementById('ov-win').hidden))break;}
  await p.waitForTimeout(1200);
  const info=JSON.parse(await p.evaluate(()=>__ev("JSON.stringify({coins:set.coins,stake:S.stake,rank:S.rank,youWon:sideMine(S.rank[0]),text:document.getElementById('x-text').textContent,slots:set.slots})")));
  await p.screenshot({path:'fw'+run+'.png'});
  out.push({run,n,prize:prize.replace(/\s+/g,' '),afterFee,info,errs});await p.close();
}
console.log(JSON.stringify(out,null,1));await b.close();})();
