const {chromium}=require('playwright');
const W=390,H=800,DSF=2.4;
(async()=>{const b=await chromium.launch();const errs=[];
async function fresh(){const p=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:DSF,isMobile:true,hasTouch:true});p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8765/dbg.html');await p.waitForTimeout(6000);
 await p.click('#gf-chest',{force:true}).catch(()=>{});await p.waitForTimeout(1800);const c=p.locator('.giftov .btn');if(await c.count())await c.first().click({force:true});await p.waitForTimeout(2500);
 await p.evaluate(()=>{document.querySelectorAll('.tour8').forEach(e=>e.remove());});
 await p.evaluate(()=>__ev(`set.tour8=1;set.tut=true;Object.keys(ITEMS).forEach(function(cat){ITEMS[cat].forEach(function(it){var k=cat+':'+it.id;if(set.own.indexOf(k)<0)set.own.push(k);});});
  set.coins=248500;set.gems=1250;set.name='Alex';set.st.g=86;set.st.w=51;save();refreshStars();`));
 return p;}
async function game(p,board,pawn,die,n,state,name){
 await p.evaluate(([bd,pw,d])=>__ev(`set.eq.board='${bd}';set.eq.pawn='${pw}';set.eq.die='${d}';save();`),[board,pawn,die]);
 await p.evaluate(()=>__ev("window.__ludoraV7.openSetup('cpu')"));await p.waitForTimeout(400);
 await p.click(`#su7-seg [data-v="${n}"]`);await p.click('#su7-play');await p.waitForTimeout(3500);
 for(let i=0;i<40;i++){await p.waitForTimeout(400);if(await p.evaluate(()=>__ev("mine(cur())&&S.phase==='roll'")))break;}
 await p.evaluate((st)=>__ev(`S.pawns=${JSON.stringify(st)};layout(true);updateTurn();say('Tap the dice to roll.');`),state);
 await p.waitForTimeout(2600);await p.screenshot({path:'ss14/'+name+'.png'});
 await p.evaluate(()=>__ev("leaveToMenu()")).catch(()=>{});await p.waitForTimeout(800);
}
let p=await fresh();
await p.evaluate(()=>__ev("addChest('gold');addChest('silver');addChest('crystal');addChest('iron');set.slots[0].s=Date.now()-3*3600000;save();window.__ludoraV7.renderChests&&window.__ludoraV7.renderChests();"));
await p.waitForTimeout(1200);await p.screenshot({path:'ss14/home.png'});
const S4=[[3,17,-1,30],[9,-1,24,52],[14,-1,-1,40],[6,21,-1,54]];
await game(p,'lava','a_dragon','lava',4,S4,'g_lava');
await game(p,'ocean','a_clownfish','reef',4,[[12,-1,28,5],[2,19,-1,-1],[33,-1,8,51],[16,-1,26,56]],'g_ocean');
await game(p,'dragon','a_knight','gold',4,[[7,-1,22,41],[11,30,-1,-1],[19,-1,3,53],[25,9,-1,55]],'g_dragon');
await game(p,'candy','a_unicorn','berry',2,[[-1,-1,-1,-1],[-1,-1,-1,-1],[10,27,-1,44],[4,18,33,-1]],'g_candy');
await game(p,'cyber','a_astronaut','plasma',4,[[1,15,-1,38],[23,-1,6,50],[-1,12,29,-1],[8,-1,20,52]],'g_cyber');
await game(p,'halloween','ghost','t_ghost',4,[[5,-1,18,34],[13,-1,-1,47],[2,26,-1,-1],[11,-1,31,53]],'g_halloween');
// setup screen vs computer with levels
await p.evaluate(()=>__ev("set.level=3;save();window.__ludoraV7.openSetup('cpu')"));await p.waitForTimeout(700);await p.screenshot({path:'ss14/setup_cpu.png'});
await p.evaluate(()=>__ev("closeSheet('ov-setup7')")).catch(()=>{});await p.evaluate(()=>{const o=document.getElementById('ov-setup7');if(o)o.hidden=true;});
await p.evaluate(()=>__ev("window.__ludoraV7.openSetup('online')"));await p.waitForTimeout(700);await p.screenshot({path:'ss14/setup_online.png'});
await p.evaluate(()=>{const o=document.getElementById('ov-setup7');if(o)o.hidden=true;});
// store boards
await p.evaluate(()=>__ev("renderColl();openSheet('ov-coll')"));await p.waitForTimeout(1500);await p.screenshot({path:'ss14/store.png'});
const tabs=await p.evaluate(()=>[...document.querySelectorAll('#ov-coll [role=tab], #ov-coll .tabs button')].map(b=>b.textContent.trim()));console.log('tabs',tabs);
for(const t of ['Pawns','Dice','Frames']){const l=p.locator('#ov-coll button',{hasText:t}).first();if(await l.count()){await l.click();await p.waitForTimeout(1200);await p.screenshot({path:'ss14/store_'+t+'.png'});}}
await p.evaluate(()=>__ev("closeSheet('ov-coll')"));
// chest window
await p.evaluate(()=>__ev("window.__ludoraV7.chestWin&&window.__ludoraV7.chestWin(2)")).catch(e=>console.log('chest',e.message));await p.waitForTimeout(1200);await p.screenshot({path:'ss14/chest.png'});
console.log(errs);await b.close();})();
