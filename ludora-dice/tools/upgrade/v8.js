/* ===================== v1.4: clear turn indicator, visible turn timer + auto play, roll-again pill, smarter computer levels,
   rate / share / feedback / replay tutorial / fair play, first-time home tour ===================== */
(function(){
var V8={};window.__ludoraV8=V8;
var MAIL='thegoldenmayhem.games@gmail.com';
var STORE_URL='https://play.google.com/store/apps/details?id=com.goldenmayhem.ludoradice';
function q8(s,r){return (r||document).querySelector(s);}
function mk8(tag,cls,html,parent){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;if(parent)parent.appendChild(e);return e;}
function vib(ms){try{buzz(ms);}catch(e){}}
function beep(f,d){try{if(set.sound)tone(f,d,'sine',.2);}catch(e){}}

/* ---------- 1. whose turn: a pill over the active player + a bouncing arrow over your dice ---------- */
function seatName(pl){var n=nameOf(pl);if(mine(pl)&&!pl.bot)return S.phase==='move'?'MOVE A PAWN':'YOUR TURN';if(n==='You')return 'Auto playing';return n+'’s turn';}
var arrow=null;
function turnUI(){
  var pl=cur(),live=pl&&(S.phase==='roll'||S.phase==='move'||S.phase==='busy');
  for(var s=0;s<4;s++){var d=SEATEL[s];if(!d)continue;var w=d.querySelector('.who')||d,p=d.querySelector('.tp8');
    var on=live&&pl.seat===s;
    if(on){if(!p)p=mk8('div','tp8','',w);var you=(mine(pl)&&!pl.bot||nameOf(pl)==='You')&&S.mode!=='pass';var txt=S.mode==='pass'?nameOf(pl)+'’s turn':seatName(pl);
      if(p.textContent!==txt)p.textContent=txt;p.style.translate='';var pr=p.getBoundingClientRect(),dx=pr.left<4?4-pr.left:pr.right>innerWidth-4?innerWidth-4-pr.right:0;if(dx)p.style.translate='calc(-50% + '+dx+'px) -50%';p.classList.toggle('you',you);p.style.setProperty('--sc',SEATHEX[s]);}
    else if(p)p.remove();}
  var myRoll=live&&S.phase==='roll'&&mine(pl)&&!pl.bot;
  if(myRoll){if(!arrow){arrow=mk8('div','arr8','<i></i>',document.body);}
    var r=dieEl.getBoundingClientRect();if(r.width){arrow.style.left=(r.left+r.width/2)+'px';arrow.style.top=(r.top-6)+'px';arrow.hidden=false;}}
  else if(arrow)arrow.hidden=true;
}
var ut8=updateTurn;updateTurn=function(){ut8.apply(this,arguments);try{turnUI();}catch(e){}};
window.addEventListener('resize',function(){try{turnUI();}catch(e){}});

/* ---------- 2. turn timer you can't miss: thick ring, big countdown, red + ticks in the last 5 s, then auto play ---------- */
var hurrySeat=-1,lastTick=-1,missed=0;
function frameFor(seat){var d=SEATEL[seat];if(!d)return null;var av=d.querySelector('.av');if(!av)return null;var f=av.querySelector('.tf8');
  if(!f){f=document.createElementNS('http://www.w3.org/2000/svg','svg');f.setAttribute('class','tf8');f.setAttribute('viewBox','0 0 100 100');
    f.innerHTML='<rect class="bg" x="4" y="4" width="92" height="92" rx="20" pathLength="100"/><rect class="fg" x="4" y="4" width="92" height="92" rx="20" pathLength="100"/>';av.appendChild(f);
    var n=document.createElement('em');n.className='tn8';av.appendChild(n);}
  return f;}
function frames(){
  var pl=cur(),on=TM.key&&TM.int&&pl,left=on?Math.max(0,TM.len-(Date.now()-TM.t0)):0,fr=left/TM.len;
  for(var s=0;s<4;s++){var f=frameFor(s);if(!f)continue;var av=f.parentNode,act=on&&pl.seat===s;
    av.classList.toggle('tm8',!!act);
    if(act){var fg=f.querySelector('.fg');fg.style.strokeDashoffset=String(100-fr*100);
      fg.style.stroke=fr>.5?'#3be05a':fr>.34?'#ffc928':'#ff3b3b';
      var n=av.querySelector('.tn8'),sec=Math.ceil(left/1000);n.textContent=left<=5000&&left>0?sec:'';}}
}
setInterval(function(){try{frames();}catch(e){}},100);
setInterval(function(){
  var pl=cur(),k=TM.key;
  if(!k||!TM.int||!pl){if(hurrySeat>=0){var d0=SEATEL[hurrySeat];if(d0)d0.classList.remove('hurry8');hurrySeat=-1;}return;}
  var left=TM.len-(Date.now()-TM.t0),d=SEATEL[pl.seat];if(!d)return;
  var hurry=left<=5000&&left>0;
  if(hurry&&hurrySeat!==pl.seat){if(hurrySeat>=0&&SEATEL[hurrySeat])SEATEL[hurrySeat].classList.remove('hurry8');d.classList.add('hurry8');hurrySeat=pl.seat;}
  if(!hurry&&hurrySeat>=0){SEATEL[hurrySeat].classList.remove('hurry8');hurrySeat=-1;}
  var sec=Math.ceil(left/1000);
  if(hurry&&mine(pl)&&!pl.bot&&sec!==lastTick){lastTick=sec;beep(sec<=2?1180:880,0.08);if(sec<=3)vib(30);}
},150);
/* when the timer runs out on your turn: say so; after 3 missed turns in a row, switch Auto play on */
var dr8=doRoll;doRoll=async function(){
  var pl=cur(),timed=TM.key&&!TM.int&&pl&&mine(pl)&&!pl.bot&&(Date.now()-TM.t0)>=TM.len-50;
  var goAuto=false;
  if(timed){missed++;toast('⏱ Time’s up! Rolled for you.');if(missed>=3&&S.mode==='cpu'){missed=0;goAuto=true;}}
  else if(pl&&mine(pl)&&!pl.bot)missed=0;
  var res=await dr8.apply(this,arguments);
  if(goAuto){var me=S.players.filter(function(p){return p.you;})[0];if(me&&!me.bot&&S.phase!=='over'){var b=q8('#b-auto');if(b&&!b.hidden){b.click();toast('Auto play is on. Tap AUTO to play yourself again.');}}}
  return res;
};

/* ---------- 3. roll again: the dice glows AND a clear "ROLL AGAIN" pill pops over it ---------- */
var ra=null;
new MutationObserver(function(){
  if(!dieEl||!dieEl.classList.contains('again'))return;
  if(ra)ra.remove();ra=mk8('div','ra8','🎲 ROLL AGAIN!',document.body);
  var r=dieEl.getBoundingClientRect();ra.style.left=(r.left+r.width/2)+'px';ra.style.top=(r.top-34)+'px';
  setTimeout(function(){if(ra){ra.remove();ra=null;}},1900);
}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});

/* ---------- 4. computer levels: Easy, Normal, Hard, Expert (smarter choices only, the dice is never changed) ---------- */
var LEVELS=['Easy','Normal','Hard','Expert'];
function trackIdx(seat,st){return (START[seat]+st)%52;}
function riskAt(seat,t){ // chance (0..1) that some enemy can land exactly on track square t with its next roll
  if(SAFE.has(t))return 0;var tm=teamOf(seat),m=1;
  S.players.forEach(function(pl){if(teamOf(pl.seat)===tm)return;var ds={};S.pawns[pl.seat].forEach(function(st){
    if(st>=0&&st<=50){var d=(t-trackIdx(pl.seat,st)+52)%52;if(d>=1&&d<=6&&st+d<=50)ds[d]=1;}else if(st===-1&&t===START[pl.seat])ds[6]=1;});
    m*=1-Object.keys(ds).length/6;});
  return 1-m;}
// weights tuned over thousands of simulated games (beats the Normal computer more often than not; Ludo dice luck still matters)
var W8={fin:150,cap:45,capP:0.5,safe:15,homecol:25,homeP:0.3,risk:35,riskP:1.5,flee:0.9,out0:40,out:30,adv:0.1};
function evalMove(seat,i,roll,lv){
  var W=W8,s=S.pawns[seat][i],ns=s===-1?0:s+roll,sc=0;
  if(ns===56)sc+=W.fin;
  if(ns<=50){var t=trackIdx(seat,ns);
    captureList(seat,t,false).forEach(function(x){sc+=W.cap+W.capP*S.pawns[x.s][x.i];});
    S.pawns[seat][i]=ns;var rk=riskAt(seat,t);S.pawns[seat][i]=s;sc-=rk*(W.risk+W.riskP*ns);
    if(SAFE.has(t))sc+=W.safe;}
  else sc+=W.homecol+(s<=50?W.homeP*s:0);
  if(s>=0&&s<=50)sc+=riskAt(seat,trackIdx(seat,s))*(W.risk+W.riskP*s)*W.flee;
  if(s===-1){var out=S.pawns[seat].filter(function(x){return x>=0&&x<56;}).length;sc+=out===0?W.out0:W.out;}
  sc+=ns*W.adv;
  return sc+(lv>=3?0:Math.random()*6);
}
var bp8=botPick;
botPick=function(seat,list,roll){
  var lv=+set.level||0;
  if(lv<=1||S.mode!=='cpu')return bp8(seat,list,roll);
  var best=-1e9,pick=list[0];list.forEach(function(i){var v=evalMove(seat,i,roll,lv);if(v>best){best=v;pick=i;}});return pick;
};
V8.botPick=botPick;
// settings: four level buttons
(function(){var seg=q8('#s-level');if(!seg)return;seg.innerHTML=LEVELS.map(function(n,i){return '<button type="button" data-v="'+i+'" aria-pressed="'+(+set.level===i)+'">'+n+'</button>';}).join('');})();
// setup screen (Vs Computer): the same choice, right where you start the game
(function(){var o=q8('#ov-setup7');if(!o)return;var seg=q8('#su7-seg',o);
  var box=mk8('div','lv8','<div class="su7lbl">COMPUTER LEVEL</div><div class="su7seg" id="su7-level">'+LEVELS.map(function(n,i){return '<button type="button" data-v="'+i+'">'+n+'</button>';}).join('')+'</div><p class="su7hint" id="su7-lvhint"></p>',null);
  seg.parentNode.insertBefore(box,seg.nextSibling);
  var HINT=['Relaxed: the computer often makes simple moves.','A fair game: it bumps you when it can.','Plays to win: guards its pawns and bumps yours.','No mercy: never wastes a move and punishes every mistake. The dice is always fair.'];
  function sync(){var lv=+set.level||0;box.querySelectorAll('button').forEach(function(b){b.setAttribute('aria-pressed',String(+b.dataset.v===lv));});q8('#su7-lvhint').textContent=HINT[lv];
    box.hidden=q8('#su7-title').textContent!=='Computer';}
  box.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;set.level=+b.dataset.v;save();sync();try{syncUI();}catch(x){}});
  new MutationObserver(sync).observe(o,{attributes:true,attributeFilter:['hidden']});sync();
})();
// chosen Hard / Expert stays as chosen (the old "adapt to your results" only nudges Easy/Normal)

/* ---------- 5. Settings: rate, share, feedback, replay tutorial, fair play ---------- */
function rateApp(){set.rated=true;save();if(window.AndroidApp&&AndroidApp.openUrl){try{AndroidApp.openUrl(STORE_URL);return;}catch(e){}}window.open(STORE_URL,'_blank');}
function shareApp(){
  var text='Come play Ludora with me! A fair dice board game for 2 to 4 players, online or against the computer. '+STORE_URL;
  if(window.AndroidApp&&AndroidApp.shareText){try{AndroidApp.shareText(text);return;}catch(e){}}
  if(navigator.share){navigator.share({title:'Ludora',text:text}).catch(function(){});return;}
  try{navigator.clipboard.writeText(text).then(function(){toast('Link copied. Paste it to your friends!');});}catch(e){toast(STORE_URL);}
}
function feedback(){
  var sub='Ludora feedback',body='\n\n---\nVersion 1.4 · '+(navigator.userAgent||'').replace(/\s+/g,' ').slice(0,140);
  if(window.AndroidApp&&AndroidApp.sendEmail){try{AndroidApp.sendEmail(MAIL,sub,body);return;}catch(e){}}
  var o=q8('#ov-fb8');
  if(!o){o=mk8('div','overlay','',document.body);o.id='ov-fb8';o.style.zIndex=70;
    o.innerHTML='<div class="sheet"><h2 class="ribbon">FEEDBACK</h2><button class="close" type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="sb" style="text-align:center"><p>Ideas, problems or a bug? We read every message.</p><p><b class="mail8">'+MAIL+'</b></p><button type="button" class="btn" data-a="copy">Copy email address</button></div></div>';
    q8('.close',o).onclick=function(){closeSheet('ov-fb8');};
    q8('[data-a="copy"]',o).onclick=function(){try{navigator.clipboard.writeText(MAIL).then(function(){toast('Email address copied');});}catch(e){toast(MAIL);}};}
  if(!window.AndroidApp)location.href='mailto:'+MAIL+'?subject='+encodeURIComponent(sub)+'&body='+encodeURIComponent(body);
  setTimeout(function(){openSheet('ov-fb8');},400);
}
function fairPlay(){
  var o=q8('#ov-fair8');
  if(!o){o=mk8('div','overlay','',document.body);o.id='ov-fair8';o.style.zIndex=70;
    o.innerHTML='<div class="sheet"><h2 class="ribbon">FAIR PLAY</h2><button class="close" type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="sb fair8">'+
      '<div><b>🎲 Every roll is random</b><p>Each number from 1 to 6 has the same chance, for you and for the computer. Nobody gets better dice.</p></div>'+
      '<div><b>🤖 The computer never cheats</b><p>Harder levels only make smarter moves. They see the same board and roll the same fair dice as you.</p></div>'+
      '<div><b>🪙 Coins are game coins</b><p>Coins and diamonds are only earned by playing. There is no real money, no betting and nothing to buy.</p></div>'+
      '<div><b>📺 Ads only when you choose</b><p>Videos only play when you tap a video button for a reward. No pop-up ads.</p></div>'+
      '<div><b>🌐 Online is the same game</b><p>Online games use the same fair dice and rules. Entry fees and prizes use game coins only.</p></div></div></div>';
    q8('.close',o).onclick=function(){closeSheet('ov-fair8');};}
  openSheet('ov-fair8');
}
function replayTutorial(){set.tut=false;set.tour8=0;set.seen=true;save();closeSheet('ov-settings');try{if(q8('#ov-welcome').hidden)leaveToMenu();}catch(e){}setTimeout(function(){tour(true);},350);}
V8.rateApp=rateApp;V8.shareApp=shareApp;V8.feedback=feedback;V8.fairPlay=fairPlay;V8.replayTutorial=replayTutorial;
(function(){var sb=q8('#ov-settings .sb');if(!sb)return;var st=sb.querySelector('.stack');
  var box=mk8('div','more8','<h3>Ludora</h3><div class="grid8">'+
    '<button type="button" data-a="rate"><i>⭐</i>Rate Ludora</button><button type="button" data-a="share"><i>📤</i>Share Ludora</button>'+
    '<button type="button" data-a="fb"><i>✉️</i>Send feedback</button><button type="button" data-a="tut"><i>🎓</i>Replay tutorial</button>'+
    '<button type="button" data-a="fair" class="wide"><i>🛡️</i>Fair play: how Ludora stays fair</button></div>',null);
  sb.insertBefore(box,st||null);
  box.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var a=b.dataset.a;
    if(a==='rate')rateApp();else if(a==='share')shareApp();else if(a==='fb')feedback();else if(a==='tut')replayTutorial();else if(a==='fair')fairPlay();});
})();

/* ---------- 6. first-time home tour (5 short steps, skippable, replay from Settings) ---------- */
var STEPS=[
 ['.h7car','Pick a game','Swipe the big card: Online, Vs Computer, Team 2 vs 2 or Pass & Play. Tap it to set up your game.'],
 ['#h7-chests','Chests','Win games to earn chests. Start one unlocking, then open it for coins and diamonds.'],
 ['.h7col.l','Store and rewards','Get new boards, pawns, dice and frames, and collect your daily rewards.'],
 ['.h7me','Your profile','Change your name, picture, flag and frame.'],
 ['.h7gear','Settings','Sound, computer level, how to play, rate, share and send us feedback.']];
function tour(force){
  if(!force&&set.tour8)return;if(q8('#ov-welcome').hidden)return;
  var i=0,o=mk8('div','tour8','<div class="hole8"></div><div class="tip8"><b></b><p></p><div class="row8"><button type="button" data-a="skip">Skip</button><span class="dots8"></span><button type="button" data-a="next" class="go">Next</button></div></div>',document.body);
  function show(){var st=STEPS[i],el=q8(st[0]);if(!el||!el.getBoundingClientRect().width){i++;if(i<STEPS.length)return show();return end();}
    var r=el.getBoundingClientRect(),pad=8,h=q8('.hole8',o);h.style.left=(r.left-pad)+'px';h.style.top=(r.top-pad)+'px';h.style.width=(r.width+pad*2)+'px';h.style.height=(r.height+pad*2)+'px';
    var t=q8('.tip8',o);q8('b',t).textContent=st[1];q8('p',t).textContent=st[2];q8('.dots8',t).textContent=(i+1)+' / '+STEPS.length;q8('[data-a="next"]',t).textContent=i===STEPS.length-1?'Let’s play!':'Next';
    var below=r.top+r.height/2<innerHeight/2;t.style.top=below?(r.bottom+pad+14)+'px':'auto';t.style.bottom=below?'auto':(innerHeight-r.top+pad+14)+'px';}
  function end(){set.tour8=1;save();o.remove();}
  o.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.dataset.a==='skip')return end();i++;if(i>=STEPS.length)end();else show();});
  show();
}
V8.tour=tour;
setTimeout(function(){var iv=setInterval(function(){var w=q8('#ov-welcome');if(!w||w.hidden)return;if(!set.gift||document.querySelector('#intro,.overlay:not([hidden]):not(#ov-welcome)'))return;clearInterval(iv);tour(false);},600);},1500);
})();
