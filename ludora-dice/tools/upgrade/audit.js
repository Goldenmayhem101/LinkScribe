// open every window/screen and flag clipped or off-screen elements. node audit.js [w] [h] [tag]
const {chromium}=require('playwright');const fs=require('fs');
const W=+process.argv[2]||390,H=+process.argv[3]||844,TAG=process.argv[4]||'p';
const OUT='audit_'+TAG;fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT);
const CHECK=`(root)=>{
 const vw=innerWidth,vh=innerHeight,bad=[];
 const els=[...root.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();if(r.width<4||r.height<4)return false;const cs=getComputedStyle(e);return cs.visibility!=='hidden'&&cs.display!=='none'&&+cs.opacity>0.05;});
 const name=e=>(e.id?'#'+e.id:e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\\s+/).slice(0,2).join('.'):''))+' "'+(e.textContent||'').trim().slice(0,24)+'"';
 for(const e of els){
  const r=e.getBoundingClientRect();
  if(r.right>vw+2||r.left<-2){ if(!e.closest('.h7car,.su7mrow,.su7mw,.strip,[class*=car],[class*=rail],.r9,.tb9')) bad.push('OFFSCREEN-X '+name(e)+' '+Math.round(r.left)+'..'+Math.round(r.right));}
  let a=e.parentElement;
  while(a&&a!==document.body){
   const cs=getComputedStyle(a);
   if(cs.overflowX!=='visible'||cs.overflowY!=='visible'){
    const q=a.getBoundingClientRect();
    const scrollY=(cs.overflowY==='auto'||cs.overflowY==='scroll')&&a.scrollHeight>a.clientHeight+2;
    const scrollX=(cs.overflowX==='auto'||cs.overflowX==='scroll')&&a.scrollWidth>a.clientWidth+2;
    const cutX=(r.left<q.left-2||r.right>q.right+2)&&!scrollX;
    const cutY=(r.top<q.top-2||r.bottom>q.bottom+2)&&!scrollY;
    if((cutX||cutY)&&r.width*r.height>200){
      // ignore decorative / intentionally cropped art
      if(!e.closest('.pv,.pv9,.spr9,.confetti,.rays,[class*=bg],[class*=glow],[class*=art],img')&&e.tagName!=='IMG'&&!/^(I|SVG|PATH|CIRCLE|RECT|G|POLYGON|ELLIPSE|LINE|SPAN)$/i.test(e.tagName))
        bad.push('CLIPPED '+(cutX?'X ':'')+(cutY?'Y ':'')+name(e)+' by '+name(a));
    }
    break;
   }
   a=a.parentElement;
  }
  if((e.scrollWidth>e.clientWidth+2)&&getComputedStyle(e).overflowX==='hidden'&&e.children.length===0&&getComputedStyle(e).textOverflow!=='ellipsis')bad.push('TEXT-CUT '+name(e));
 }
 return [...new Set(bad)].slice(0,40);
}`;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:W,height:H},isMobile:true,hasTouch:true});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await require('./boot19.js')(p);
for(let i=0;i<4;i++){await p.mouse.click(W/2,H*0.53);await p.waitForTimeout(700);await p.evaluate(()=>{document.querySelectorAll('.overlay:not([hidden]):not(#ov-welcome) .btn').forEach(x=>x.click());});await p.waitForTimeout(300);}
await p.evaluate(()=>{document.querySelectorAll('[class*=tour]').forEach(e=>e.remove());__ev("set.tour8=1;set.coins=2500000;set.gems=5000;set.lk=2;addChest('gold');addChest('silver');save();refreshStars();")});
const report={};
async function snap(n){await p.waitForTimeout(900);await p.screenshot({path:OUT+'/'+n+'.png'});
 const r=await p.evaluate(`(${CHECK})(document.body)`);report[n]=r;}
async function closeAll(){await p.evaluate(()=>{document.querySelectorAll('.overlay:not([hidden]):not(#ov-welcome)').forEach(o=>{const c=o.querySelector('.close,.su7back');if(c)c.click();o.hidden=true;});});await p.waitForTimeout(400);}
await snap('00_home');
// every clickable thing on the home screen (side buttons, banners, tab bar)
const btns=await p.evaluate(()=>{const w=document.getElementById('ov-welcome');return [...w.querySelectorAll('button,[role=button]')].filter(x=>{const r=x.getBoundingClientRect();return r.width>10&&r.height>10&&!x.closest('.h7car')&&!/h7arr|arr/.test(x.className);}).map((x,i)=>{x.dataset.aud=i;return i+':'+(x.id||x.className)+':'+(x.textContent||'').trim().slice(0,14);});});
for(const t of btns){const i=t.split(':')[0];
 await p.evaluate(i=>{const x=document.querySelector('[data-aud="'+i+'"]');x&&x.click();},i);
 const any=await p.evaluate(()=>!!document.querySelector('.overlay:not([hidden]):not(#ov-welcome)'));
 if(any)await snap('home_'+t.replace(/[^a-z0-9]+/gi,'_').slice(0,40));
 await closeAll();}
// store tabs
for(const top of ['shop','special','chest']){for(const tab of (top==='shop'?['board','pawn','die','frame','emo']:['x'])){
 await p.evaluate(([a,c])=>__ev(`storeTop='${a}';${c!=='x'?"collTab='"+c+"';":''}renderColl();openSheet('ov-coll')`),[top,tab]);await snap('store_'+top+'_'+tab);await closeAll();}}
await p.evaluate(()=>__ev("openItem('pawn',ITEMS.pawn.filter(function(i){return i.r==='legendary'})[0])"));await snap('item_pawn');await closeAll();
await p.evaluate(()=>__ev("openItem('board',ITEMS.board[5])"));await snap('item_board');await closeAll();
// setups
for(const k of ['cpu','team','pass','online']){await p.evaluate(k=>__ev("window.__ludoraV7.openSetup('"+k+"')"),k);await snap('setup_'+k);await closeAll();}
// a game + in-game windows
await p.evaluate(()=>__ev("window.__ludoraV7.openSetup('cpu')"));await p.waitForTimeout(500);await p.click('#su7-play');await p.waitForTimeout(3500);
await snap('game');
for(let i=0;i<30;i++){await p.waitForTimeout(300);if(await p.evaluate(()=>__ev("mine(cur())&&S.phase==='roll'")))break;}

const gb=await p.evaluate(()=>[...document.querySelectorAll('.gbar button, #b-settings, .topbar button')].filter(x=>x.getBoundingClientRect().width>8).map((x,i)=>{x.dataset.gb=i;return i+':'+(x.id||x.className)+':'+(x.textContent||'').trim().slice(0,10);}));
for(const t of gb){const i=t.split(':')[0];await p.evaluate(i=>{const x=document.querySelector('[data-gb="'+i+'"]');x&&x.click();},i);
 const any=await p.evaluate(()=>!!document.querySelector('.overlay:not([hidden]):not(#ov-welcome), .emopanel:not([hidden]), [class*=pop]:not([hidden])'));
 if(any)await snap('game_'+t.replace(/[^a-z0-9]+/gi,'_').slice(0,40));await closeAll();}
await p.evaluate(()=>__ev("S.phase='over';showWin(S.players.filter(function(x){return x.you;})[0])"));await snap('win');await closeAll();
await p.evaluate(()=>__ev("S.phase='over';showWin(S.players.filter(function(x){return !x.you;})[0])"));await snap('lose');await closeAll();
await p.evaluate(()=>__ev("leaveToMenu()"));await p.waitForTimeout(800);
await p.evaluate(()=>__ev("window.__ludoraV7.chestWin&&window.__ludoraV7.chestWin(-1,{t:'gold',c:6000,g:10})"));await snap('chestwin');await closeAll();
fs.writeFileSync(OUT+'/report.json',JSON.stringify(report,null,1));
for(const k in report)if(report[k].length)console.log(k,'\n  '+report[k].join('\n  '));
console.log('screens',Object.keys(report).length,'errors',errs);await b.close();})();
