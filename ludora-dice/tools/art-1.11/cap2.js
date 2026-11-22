// fresh 1.9 captures for store screenshots. usage: node cap.js phone|tablet
const {chromium}=require('playwright');const fs=require('fs');
const MODE=process.argv[2]||'phone';
const VP=MODE==='phone'?{width:390,height:824}:{width:800,height:1280};
const OUT='raw_'+MODE;fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch();const errs=[];
const p=await b.newPage({viewport:VP,deviceScaleFactor:MODE==='phone'?2.6:2,isMobile:true,hasTouch:true});p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8790/dbg.html');await p.waitForTimeout(5000);
for(let i=0;i<4;i++){await p.mouse.click(VP.width/2,VP.height*0.53);await p.waitForTimeout(800);await p.evaluate(()=>{document.querySelectorAll('.overlay:not([hidden]):not(#ov-welcome) .btn').forEach(x=>x.click());});await p.waitForTimeout(400);}
await p.evaluate(()=>{document.querySelectorAll('[class*=tour]').forEach(e=>e.remove());});
await p.evaluate(()=>__ev(`set.tour8=1;set.tut=true;Object.keys(ITEMS).forEach(function(cat){ITEMS[cat].forEach(function(it){var k=cat+':'+it.id;if(set.own.indexOf(k)<0&&!(cat==='pawn'&&it.r==='legendary'&&it.id!=='p_volcano_titan'))set.own.push(k);});});
 set.coins=248500;set.gems=1250;set.lk=3;set.name='Alex';set.st.g=86;set.st.w=51;save();refreshStars();lkHomeSync();`));
const hideBan=()=>p.evaluate(()=>{var x=document.getElementById('ban11');if(x)x.style.visibility='hidden';});
const shot=async n=>{await hideBan();await p.screenshot({path:OUT+'/'+n+'.png'});};
async function game(board,pawn,die,n,state,name,extra){
 await p.evaluate(([bd,pw,d])=>__ev(`set.eq.board='${bd}';set.eq.pawn='${pw}';set.eq.die='${d}';save();applyCosmetics();`),[board,pawn,die]);
 await p.evaluate(()=>__ev("window.__ludoraV7.openSetup('cpu')"));await p.waitForTimeout(500);
 await p.click(`#su7-seg [data-v="${n}"]`);await p.click('#su7-play');await p.waitForTimeout(3500);
 for(let i=0;i<40;i++){await p.waitForTimeout(400);if(await p.evaluate(()=>__ev("mine(cur())&&S.phase==='roll'")))break;}
 await p.evaluate((st)=>__ev(`S.pawns=${JSON.stringify(st)};layout(true);updateTurn();say('Tap the dice to roll.');`),state);
 await p.waitForTimeout(2600);
 if(extra)await extra();
 await shot(name);
 await p.evaluate(()=>__ev("leaveToMenu()")).catch(()=>{});await p.waitForTimeout(900);
}
await p.evaluate(()=>__ev("addChest('gold');addChest('silver');addChest('crystal');addChest('iron');set.slots[0].s=Date.now()-3*3600000;save();window.__ludoraV7.renderChests&&window.__ludoraV7.renderChests();"));
await p.waitForTimeout(1200);await shot('home');
await game('lava','p_volcano_titan','e_phoenix',4,[[3,17,-1,30],[9,-1,24,52],[14,-1,-1,40],[6,21,-1,54]],'g_lava');
await game('lava','p_volcano_titan','e_phoenix',4,[[3,17,-1,30],[9,-1,24,52],[14,-1,-1,40],[6,21,-1,54]],'g_finish',async()=>{
  await p.evaluate(()=>window.__ludoraFinDemo('p_volcano_titan'));await p.waitForTimeout(1150);});
await game('sakura','p_ninefox','d_blossom',4,[[12,-1,28,5],[2,19,-1,-1],[33,-1,8,51],[16,-1,26,56]],'g_sakura');
await game('ocean','p_whale','d_ocean',4,[[7,-1,22,41],[11,30,-1,-1],[19,-1,3,53],[25,9,-1,55]],'g_ocean');
await game('dragon','p_baby_dragon','d_dragon',4,[[1,15,-1,38],[23,-1,6,50],[-1,12,29,-1],[8,-1,20,52]],'g_dragon');
await game('candy','p_unicorn','e_icecream',2,[[-1,-1,-1,-1],[-1,-1,-1,-1],[10,27,-1,44],[4,18,33,-1]],'g_candy');
await game('cyber','p_robot_knight','e_robot',4,[[5,-1,18,34],[13,-1,-1,47],[2,26,-1,-1],[11,-1,31,53]],'g_cyber');
await game('frost','p_ice_queen','d_ice',4,[[4,-1,20,36],[10,-1,-1,49],[6,22,-1,-1],[15,-1,27,54]],'g_frost');
await p.evaluate(()=>__ev("set.level=3;save();window.__ludoraV7.openSetup('cpu')"));await p.waitForTimeout(800);await p.evaluate(()=>{document.querySelectorAll('#ov-setup7, #ov-setup7 *').forEach(e=>{if(e.scrollTop)e.scrollTop=0;});});await p.waitForTimeout(300);await shot('setup_cpu');
await p.evaluate(()=>{const o=document.getElementById('ov-setup7');if(o)o.hidden=true;});
// store: pawns (mythic), dice, offers
await p.evaluate(()=>__ev("set.own=set.own.filter(function(k){return /classic|n_red|n_blue|island|garden|p_bunny|p_yeti_cub|d_gold/.test(k);});set.coins=2485000;save();refreshStars();"));
await p.evaluate(()=>__ev("storeTop='shop';collTab='pawn';pawnGrp='legendary';renderColl();openSheet('ov-coll')"));await p.waitForTimeout(800);await p.evaluate(()=>{const t=[...document.querySelectorAll('#ov-coll button, #ov-coll [role=tab]')].find(b=>b.textContent.trim()==='Events');if(t)t.click();});await p.waitForTimeout(2200);await p.evaluate(()=>{const t=document.querySelector('#c-items .item');if(t)t.scrollIntoView({block:'start'});const sb=document.querySelector('#ov-coll .sb');if(sb)sb.scrollTop-=150;});await p.waitForTimeout(900);await shot('store_pawns');
await p.evaluate(()=>{const t=[...document.querySelectorAll('#ov-coll button')].find(b=>/^\s*Dice\s*$/.test(b.textContent));if(t)t.click();});await p.waitForTimeout(500);await p.evaluate(()=>{const t=[...document.querySelectorAll('#ov-coll button, #ov-coll [role=tab]')].find(b=>b.textContent.trim()==='Events');if(t)t.click();});await p.waitForTimeout(1800);
await p.evaluate(()=>{const it=[...document.querySelectorAll('#c-items .item')];const t=it.find(x=>/Legendary/.test(x.textContent))||it.find(x=>/Epic/.test(x.textContent));if(t)t.scrollIntoView({block:'start'});const sb=document.querySelector('#ov-coll .sb');if(sb)sb.scrollTop-=150;});await p.waitForTimeout(900);await shot('store_dice');
await p.evaluate(()=>__ev("collTab='board';renderColl();"));await p.waitForTimeout(2000);await shot('store_boards');
await p.evaluate(()=>__ev("closeSheet('ov-coll')"));await p.waitForTimeout(600);await p.evaluate(()=>window.__l19.openHub());await p.waitForTimeout(2200);await shot('store_offers');await p.evaluate(()=>{try{window.__back();window.__back();}catch(e){}});await p.waitForTimeout(600);
await p.evaluate(()=>__ev("closeSheet('ov-coll')"));await p.waitForTimeout(500);
await p.evaluate(()=>__ev("window.__ludoraV7.chestWin&&window.__ludoraV7.chestWin(-1,{t:'crystal',c:60000,g:40})")).catch(e=>console.log('chest',e.message));await p.waitForTimeout(1500);await shot('chest');
console.log(errs);await b.close();})();
