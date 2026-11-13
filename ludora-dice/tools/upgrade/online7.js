// two players in separate browsers: both pick Online · 2 players · entry 1,000 · Classic; they must meet, pay, and the winner takes 2,000
const {chromium}=require('playwright');
async function player(b,name){
  const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();p.setDefaultTimeout(8000);
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.errs=errs;
  await p.goto('http://localhost:3100/');await p.waitForTimeout(7000);
  await p.click('#gf-chest',{force:true}).catch(()=>{});await p.waitForTimeout(2000);const c=p.locator('.giftov .btn');if(await c.count())await c.first().click({force:true});await p.waitForTimeout(800);
  await p.evaluate((n)=>__ev("set.name='"+n+"';set.coins=10000;save();refreshStars();"),name);
  return p;
}
(async()=>{const b=await chromium.launch();
  const A=await player(b,'Ana'),B=await player(b,'Ben');
  for(const p of [A,B]){
    await p.evaluate(()=>__ev("window.__ludoraV7.openSetup('online')"));
    await p.click('#su7-seg [data-v="2"]');for(let k=0;k<3;k++)await p.click('[data-step="1"]');
    await p.click('#su7-play');await p.waitForTimeout(800);
    if(await p.evaluate(()=>!document.getElementById('ov-auth').hidden)){await p.click('#a-guest');await p.waitForTimeout(1500);}
    await p.screenshot({path:'on_'+(p===A?'a':'b')+'1.png'});
    await p.waitForTimeout(1500);
  }
  await A.waitForTimeout(6000);await A.screenshot({path:'on_a2.png'});await B.screenshot({path:'on_b2.png'});
  // vote screen may show; wait for game
  let started=false;for(let t=0;t<40&&!started;t++){await A.waitForTimeout(1000);started=await A.evaluate(()=>__ev("S.mode==='online'&&S.phase!=='idle'"));}
  const st=async p=>JSON.parse(await p.evaluate(()=>__ev("JSON.stringify({mode:S.mode,count:S.count,stake:S.stake,coins:set.coins,host:NET.host,players:S.players.map(function(x){return x.seat+(x.bot?'b':'h')+':'+x.name;})})")));
  console.log('started',started,await st(A),await st(B));
  await A.screenshot({path:'on_a3.png'});await B.screenshot({path:'on_b3.png'});
  if(started){
    // let both auto-play fast: host decides everything; give both players' turns to auto
    for(const p of [A,B])await p.evaluate(()=>__ev("SPEED=0.05;"));
    let done=false;for(let t=0;t<240&&!done;t++){
      for(const p of [A,B]){await p.evaluate(()=>__ev("try{if(S.phase==='roll'&&mine(cur()))humanRoll();else if(S.phase==='move'&&mine(cur())&&S.legal&&S.legal.length)humanMove(S.legal[0]);}catch(e){}"));}
      await A.waitForTimeout(250);
      done=await A.evaluate(()=>!document.getElementById('ov-win').hidden)&&await B.evaluate(()=>!document.getElementById('ov-win').hidden);
    }
    await A.waitForTimeout(1500);
    const fin=async p=>JSON.parse(await p.evaluate(()=>__ev("JSON.stringify({coins:set.coins,rank:S.rank,won:sideMine(S.rank[0]),text:document.getElementById('x-text').textContent,slots:set.slots.filter(Boolean)})")));
    console.log('done',done,JSON.stringify(await fin(A)),JSON.stringify(await fin(B)));
    await A.screenshot({path:'on_a4.png'});await B.screenshot({path:'on_b4.png'});
  }
  const dg=async p=>await p.evaluate(()=>__ev("JSON.stringify({q:NET.q.length,busy:NET.busy,phase:S.phase,turn:S.turn,me:NET.me,peers:S.players.map(function(x){return x.peer;}),mineCur:mine(cur()),msg:S.msg,pawns:S.pawns})"));console.log('A',await dg(A));console.log('B',await dg(B));console.log(A.errs,B.errs);await b.close();})();
