// Plays complete games against the computer with an entry fee, on auto play, and checks every coin.
const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();
const results=[];
for(let run=0;run<Number(process.argv[2]||3);run++){
  const p=await b.newPage({viewport:{width:390,height:844}});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8765/dbg.html');await p.waitForTimeout(7500);
  await p.click('#gf-chest',{force:true}).catch(()=>{});await p.waitForTimeout(2000);
  const c=p.getByText('Collect');if(await c.count())await c.first().click({force:true});await p.waitForTimeout(800);
  const players=process.argv[3]?Number(process.argv[3]):[2,3,4][run%3];
  const c0=await p.evaluate(()=>__ev('set.coins'));
  await p.click('#t-cpu',{force:true});await p.waitForTimeout(500);
  await p.click(`#w-count button[data-v="${players}"]`,{force:true});await p.waitForTimeout(200);
  await p.click('#su-stake button[data-v="1000"]',{force:true});await p.waitForTimeout(200);
  const prizeTxt=await p.textContent('#su-prize');
  await p.evaluate(()=>__ev('SPEED=0.02'));
  await p.click('#su-go',{force:true});await p.waitForTimeout(300);
  const c1=await p.evaluate(()=>__ev('set.coins'));
  await p.waitForTimeout(4000);
  await p.evaluate(()=>__ev("set.tut=true;S.players.forEach(function(pl){if(pl.you){}});document.getElementById('b-auto').click();"));
  let t=0;
  while(t<240){await p.waitForTimeout(1000);t++;const ov=await p.evaluate(()=>!document.getElementById('ov-win').hidden);if(ov)break;}
  await p.waitForTimeout(800);
  const info=await p.evaluate(()=>__ev("JSON.stringify({coins:set.coins,stake:S.stake,rank:S.rank,players:S.players.map(function(x){return x.seat+(x.you?'*':'')}),team:S.team,text:document.getElementById('x-text').textContent,title:document.getElementById('x-title').textContent,wrw:(document.querySelector('.wrw')||{}).innerText||''})"));
  await p.screenshot({path:`win${run}.png`});
  // video double
  const dbl=p.locator('.wrw .btn');let c3=null;
  if(await dbl.count()){await dbl.click({force:true});await p.waitForTimeout(4500);c3=await p.evaluate(()=>__ev('set.coins'));}
  // play again must charge the fee again
  const c4a=await p.evaluate(()=>__ev('set.coins'));
  await p.click('#x-again',{force:true});await p.waitForTimeout(500);
  const c4=await p.evaluate(()=>__ev('set.coins+"|"+S.stake'));
  results.push({run,players,prizeTxt,c0,afterFee:c1,info:JSON.parse(info),afterDouble:c3,beforeAgain:c4a,afterAgain:c4,errs});
  await p.close();
}
console.log(JSON.stringify(results,null,1));
await b.close();})();
