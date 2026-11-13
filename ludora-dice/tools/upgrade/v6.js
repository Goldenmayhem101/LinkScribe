/* ===================== v1.2 round 4: new home, chest window, no upgrades, board vote, roll-again cue ===================== */
(function(){
var V6={};
function q(s){return document.querySelector(s);}
function mk(tag,cls,html,parent){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;if(parent)parent.appendChild(e);return e;}

/* ---------- 1. no upgrades: dice levels and fragments are gone; old fragments become coins ---------- */
(function(){
  var f=0;Object.keys(set.dl||{}).forEach(function(k){f+=+set.dl[k]||0;});
  if(f>0&&!set.fragPaid){set.coins+=f*500;set.fragPaid=1;setTimeout(function(){toast('Dice upgrades are gone: your '+f+' fragments became '+nf(f*500)+' coins');},2500);}
  set.dl={};save();
})();
dieLevel=function(){return 1;};
addFrags=function(){};
fragLine=function(){return '';};

/* ---------- 2. chests give coins and diamonds only, and open a big window ---------- */
var GEMS={wood:[1,3],silver:[3,6],gold:[8,15]};
Object.keys(CHESTS).forEach(function(k){CHESTS[k].fr=0;});
function rr(a){return a[0]+Math.floor(Math.random()*(a[1]-a[0]+1));}
function hm(min){var h=Math.floor(min/60),m=min%60;return (h?h+'h ':'')+(m||!h?m+'m':'');}
openChest=function(i){
  var s=set.slots[i];if(!s||!s.s||slotLeft(s)>0)return;
  var o=CHESTS[s.t],c=rr(o.coins),g=rr(GEMS[s.t]||[1,2]);
  set.slots[i]=null;set.coins+=c;set.gems+=g;save();refreshStars();
  dgAdd('o',1);try{sfx.home();}catch(e){}
  chestWin(-1,{t:s.t,c:c,g:g});
  if(storeTop==='chest'&&!q('#ov-coll').hidden)renderColl();
  dailyDotSync();
};
chestInfo=function(t){var i=set.slots.findIndex(function(s){return s&&s.t===t;});chestWin(i,{t:t});};
function chestWin(i,res){
  var o=document.getElementById('ov-chestwin');
  if(!o){o=mk('div','overlay','',document.body);o.id='ov-chestwin';o.style.zIndex=64;o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');
    o.innerHTML='<div class="sheet cwsheet"><h2 class="ribbon"></h2><button class="close" type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="sb"></div></div>';
    o.querySelector('.close').addEventListener('click',function(){clearInterval(V6.cwT);closeSheet('ov-chestwin');});}
  clearInterval(V6.cwT);
  var sb=o.querySelector('.sb'),s=i>=0?set.slots[i]:null,t=res.t,C=CHESTS[t];
  o.querySelector('.ribbon').textContent=(C.n+' chest').toUpperCase();
  function draw(){
    s=i>=0?set.slots[i]:null;
    var ready=s&&s.s&&slotLeft(s)<=0,running=s&&s.s&&!ready,act=activeChest();
    var h='<div class="cwart'+(res.c!=null||ready?' open':'')+'">'+chestSvg(t,res.c!=null||ready)+'</div>';
    if(res.c!=null){
      h+='<div class="cwbox"><b class="cwh">You got</b><div class="cwrow"><span class="cwpill">'+cn(res.c)+'</span><span class="cwpill">'+gm(res.g)+'</span></div></div>'+
         '<button type="button" class="btn cwgo" data-a="ok">Collect</button>';
    }else{
      h+='<div class="cwbox"><b class="cwh">Chest contains</b><div class="cwrow"><span class="cwpill">'+cn(C.coins[0])+' – '+nf(C.coins[1])+'</span><span class="cwpill">'+gm(GEMS[t][0])+' – '+GEMS[t][1]+'</span></div>'+
         '<p class="cwtime">'+(running?'Opens in <b data-cw>'+fmt(slotLeft(s))+'</b>':(ready?'Ready to open!':'Unlocking takes <b>'+hm(C.min)+'</b>'))+'</p></div>';
      if(ready)h+='<button type="button" class="btn cwgo" data-a="open">Open!</button>';
      else if(s){
        h+='<div class="cwbtns">';
        if(running)h+='<button type="button" class="btn cwvid" data-a="vid">▶ Video<br><small>−30 min</small></button>';
        else h+='<button type="button" class="btn cwvid" data-a="start"'+(act>=0?' disabled':'')+'>'+(act>=0?'Another chest<br><small>is opening</small>':'Start<br><small>unlocking</small>')+'</button>';
        h+='<button type="button" class="btn cwnow" data-a="now"'+(set.gems<gemCost(s)?' disabled':'')+'>Open now<br><small>'+gm(gemCost(s))+'</small></button></div>';
      }
    }
    sb.innerHTML=h;
    sb.querySelectorAll('[data-a]').forEach(function(b){b.addEventListener('click',function(){
      var a=b.dataset.a;
      if(a==='ok'){closeSheet('ov-chestwin');return;}
      if(a==='open'){closeSheet('ov-chestwin');openChest(i);return;}
      if(a==='start'){s.s=Date.now();save();draw();return;}
      if(a==='vid'){Ads.reward(function(ok){if(!ok){toast('The video did not finish.');return;}s.s-=30*60000;save();draw();});return;}
      if(a==='now'){var c=gemCost(s);if(set.gems<c)return;set.gems-=c;s.s=Date.now()-C.min*60000-1;save();refreshStars();closeSheet('ov-chestwin');openChest(i);}
    });});
  }
  draw();
  V6.cwT=setInterval(function(){var e=sb.querySelector('[data-cw]');if(!e||!s)return;var l=slotLeft(s);if(l<=0)draw();else e.textContent=fmt(l);},1000);
  openSheet('ov-chestwin');
}
V6.chestWin=chestWin;
document.addEventListener('click',function(e){
  var b=e.target.closest('#h-chests button');if(!b)return;
  var i=[].indexOf.call(b.parentNode.children,b);var s=set.slots[i];
  e.stopPropagation();e.preventDefault();
  if(!s){toast('Finish a game to earn a chest.');return;}
  chestWin(i,{t:s.t});
},true);

/* ---------- 3. new home screen ---------- */
(function(){
  var main=q('#w-main');if(!main)return;main.classList.add('home3');
  var top=mk('div','h3top','',null);
  top.innerHTML=
    '<button type="button" class="h3prof" aria-label="Profile"><span class="h3av"></span><span class="h3who"><b class="h3name"></b><span class="h3lv"><i class="h3star"></i><span class="h3xp"><i></i></span></span></span></button>'+
    '<button type="button" class="h3gear" aria-label="Settings"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></button>';
  var money=mk('div','h3money','<span class="h3cur"><i class="cn"></i><b class="coincount"></b><button type="button" class="h3plus" aria-label="Get more coins">+</button></span><span class="h3cur"><i class="gm"></i><b class="gemcount"></b><button type="button" class="h3plus" aria-label="Get more diamonds">+</button></span>',null);
  main.insertBefore(money,main.firstChild);main.insertBefore(top,money.nextSibling);
  var sides=mk('div','h3sides','<div class="h3col l"></div><div class="h3col r"></div>',null);
  main.insertBefore(sides,top.nextSibling);
  var L=sides.querySelector('.l'),R=sides.querySelector('.r');
  [['h-coll',L],['h-chest',L],['h-luck',L],['h-pass',R],['h-ev',R]].forEach(function(p){var b=document.getElementById(p[0]);if(!b)return;var w=b.closest('.ticw')||b;p[1].appendChild(w);});
  var help=q('#w-help');if(help){var hw=mk('div','ticw','',R);var hb=mk('button','sbtn tic sb-help','<span style="font-size:17px;font-weight:900;color:#fff">?</span>',hw);hb.type='button';hb.setAttribute('aria-label','How to play');mk('span','','Rules',hw);hb.addEventListener('click',function(){help.click();});}
  var logo=q('#w-title');var big=mk('div','h3big','',null);
  var pimg=function(id,c){return (window.__ludoraPawnImg&&window.__ludoraPawnImg(id,c))||'pawns/'+c+'.webp';};
  big.innerHTML=
    '<button type="button" class="h3btn gold" id="h3-cpu"><span class="h3art"><img alt="" src="'+pimg('robot','blue')+'" class="a1"><span class="h3dice"></span></span><b>Vs Computer</b></button>'+
    '<button type="button" class="h3btn blue" id="h3-fr"><span class="h3art"><img alt="" src="'+pimg('a_bear','red')+'" class="a2"><img alt="" src="'+pimg('a_fox','yellow')+'" class="a3"><span class="h3heart">❤️</span></span><b>Friends</b></button>';
  var stage=main.querySelector('.stagehome');main.insertBefore(big,stage);
  if(logo)main.insertBefore(logo,big);
  var ch=q('#h-chests');if(ch)main.insertBefore(ch,big.nextSibling);
  q('#h3-cpu').addEventListener('click',function(){q('#t-cpu').click();});
  q('#h3-fr').addEventListener('click',friendsSheet);
  top.querySelector('.h3prof').addEventListener('click',function(){q('#h-prof').click();});
  top.querySelector('.h3gear').addEventListener('click',function(){q('#b-settings').click();});
  money.querySelectorAll('.h3plus').forEach(function(b){b.addEventListener('click',function(){storeTop='special';renderColl();openSheet('ov-coll');});});
  function prof(){
    var L2=window.__ludoraV2&&window.__ludoraV2.lvl?window.__ludoraV2.lvl():{l:1,xp:0,need:300};
    top.querySelector('.h3name').textContent=(set.name||'Player').slice(0,12);
    top.querySelector('.h3star').textContent=L2.l;
    top.querySelector('.h3xp i').style.width=Math.round(L2.xp/L2.need*100)+'%';
    var av=top.querySelector('.h3av'),key=set.photo?'photo':String(set.eq.pawn);
    if(av.dataset.k!==key){av.dataset.k=key;av.innerHTML=set.photo?'<img alt="" src="'+set.photo+'">':'<img alt="" src="'+pimg(String(set.eq.pawn),'blue')+'">';}
    refreshStars();
  }
  prof();setInterval(function(){if(!q('#ov-welcome').hidden)prof();},1000);
})();
function friendsSheet(){
  var o=document.getElementById('ov-friends');
  if(!o){o=mk('div','overlay','',document.body);o.id='ov-friends';o.style.zIndex=62;o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');
    o.innerHTML='<div class="sheet"><h2 class="ribbon">FRIENDS</h2><button class="close" type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="sb"><div class="frgrid">'+
      '<button type="button" class="frbtn" data-k="pass"><span>📱</span><b>Pass &amp; Play</b><small>2 to 4 friends on this phone</small></button>'+
      '<button type="button" class="frbtn" data-k="online"><span>🌐</span><b>Online room</b><small>Play with friends using a room code</small></button></div></div></div>';
    o.querySelector('.close').addEventListener('click',function(){closeSheet('ov-friends');});
    o.querySelectorAll('.frbtn').forEach(function(b){b.addEventListener('click',function(){closeSheet('ov-friends');q('#t-'+b.dataset.k).click();});});}
  openSheet('ov-friends');
}
/* team match lives inside the Vs Computer setup now */
(function(){
  var sb=q('#ov-setup .sb');if(!sb)return;
  var seg=mk('div','seg su-kind','<button type="button" data-v="cpu">Everyone for themselves</button><button type="button" data-v="team">Team 2 vs 2</button>',null);
  sb.insertBefore(seg,sb.firstChild);
  seg.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;openSetup(b.dataset.v);});
  var os=openSetup;openSetup=function(kind){os(kind);seg.hidden=kind==='pass';pressSeg('#ov-setup .su-kind',kind==='team'?'team':'cpu');};
})();

/* ---------- 4. boards: no spinner; online players vote, badges show how many picked each board ---------- */
var VOTE_MS=4000;
function tallyOf(){var t={};Object.keys(VOTE.v).forEach(function(k){var b=VOTE.v[k];t[b]=(t[b]||0)+1;});return t;}
function voteBadges(t){q('#v-grid')&&q('#v-grid').querySelectorAll('button').forEach(function(b){var n=t[b.dataset.v]||0,e=b.querySelector('.vcount');if(!e){e=mk('em','vcount','',b);}e.textContent=n;e.hidden=!n;});}
var vmd=voteMaybeDone;
voteMaybeDone=function(){if(VOTE.on){var t=tallyOf();voteBadges(t);netEmitEv({ev:'votes',t:t});}vmd();};
var ge=gEnqueue;
gEnqueue=function(m){if(m&&m.ev==='votes'){voteBadges(m.t||{});return;}if(m&&m.ev==='vote'){m.ms=VOTE_MS;}ge(m);};
var sv=showVote;showVote=function(ms){sv(VOTE_MS);var n=q('#v-note');if(n)n.textContent='Tap the board you want. The most picks wins. No picks in 4 seconds: Classic.';};
voteFinish=function(){
  if(!VOTE.on)return;VOTE.on=false;clearTimeout(VOTE.timer);hideVote();
  var t=tallyOf(),best=0,w=[];Object.keys(t).forEach(function(b){if(t[b]>best){best=t[b];w=[b];}else if(t[b]===best)w.push(b);});
  var bd=w.length?w[Math.floor(Math.random()*w.length)]:'classic';if(!hasId('board',bd))bd='classic';
  netStartGame(VOTE.count,bd);
};
netBeginVote=function(count){
  if(!NET.host)return;
  var hs=hostSeats(),humans=hs.players.filter(function(p){return !p.bot;}).length;
  q('#ov-win').hidden=true;
  if(humans<2){netStartGame(count,String(curItem('board').id));return;}
  VOTE.on=true;VOTE.v={};VOTE.need=humans;VOTE.count=count;q('#ov-lobby').hidden=true;
  netEmitEv({ev:'vote',ms:VOTE_MS,q:++NET.seq});showVote(VOTE_MS);
  clearTimeout(VOTE.timer);VOTE.timer=setTimeout(voteFinish,VOTE_MS);
};

/* ---------- 5. roll again / move again: glow, bounce, ring and a double buzz, no words ---------- */
var lastSeat=-1,lastGid=-1;
var stt=startTurn;
startTurn=function(){
  var pl=cur(),again=pl&&lastSeat===pl.seat&&lastGid===S.gid;
  stt();lastSeat=pl?pl.seat:-1;lastGid=S.gid;
  if(again&&mine(pl)&&!pl.bot)rollAgain();
};
var nt=nextTurn;nextTurn=function(){lastSeat=-1;nt();};
function rollAgain(){
  dieEl.classList.remove('again');void dieEl.offsetWidth;dieEl.classList.add('again');
  var r=mk('i','dring','',dieEl);setTimeout(function(){r.remove();},900);
  setTimeout(function(){dieEl.classList.remove('again');},1400);
  try{if(set.vibe&&navigator.vibrate)navigator.vibrate([35,70,35]);}catch(e){}
}
V6.rollAgain=rollAgain;
var sy=say;
say=function(t){t=String(t||'').replace(/\s*Roll again!/g,'').replace('A 6 gives another roll.','');sy(t);};

/* ---------- 6. where a pawn will land (skull if it captures) + danger pulse on your pawns ---------- */
showHints=function(list){
  board.querySelectorAll('.hint').forEach(function(h){h.remove();});
  var pl=cur();if(!list||!list.length||!pl||!mine(pl)||pl.bot||S.phase!=='move')return;
  var cs=ctlSeat(pl);
  list.forEach(function(i){
    var st=S.pawns[cs][i],ns=st===-1?0:st+S.roll,c;
    if(ns<=50)c=TRACK[(START[cs]+ns)%52];else if(ns<=55)c=HOMECOL[cs][ns-51];else c=[7,7];
    var g=se('g',{class:'hint'},board);
    se('circle',{cx:c[0]+.5,cy:c[1]+.5,r:.42,fill:'rgba(255,255,255,.28)',stroke:'#fff','stroke-width':.07,class:'hring'},g);
    if(ns<=50){var t=(START[cs]+ns)%52;if(!SAFE.has(t)&&captureList(cs,t,false).length){var x=se('text',{x:c[0]+.5,y:c[1]+.56,'text-anchor':'middle','dominant-baseline':'central','font-size':.62},g);x.textContent='💀';}}
  });
};
var ut=updateTurn;
updateTurn=function(){
  ut();
  for(var s=0;s<4;s++)for(var i=0;i<4;i++)if(PW[s][i])PW[s][i].el.classList.remove('danger');
  var pl=cur();if(!pl||!mine(pl)||pl.bot||S.phase==='idle'||S.phase==='over')return;
  var cs=ctlSeat(pl);
  S.pawns[cs].forEach(function(st,i){if(st>=0&&st<=50){var t=(START[cs]+st)%52;if(threatened(cs,t))PW[cs][i].el.classList.add('danger');}});
};

/* ---------- 7. fewer effects switch for older phones ---------- */
(function(){
  var s=q('#ov-settings .sb');if(!s)return;
  var row=document.createElement('label');row.className='row';row.setAttribute('for','s-lowfx');
  row.innerHTML='<span>Fewer effects<small>Smoother on older phones</small></span><input class="sw" type="checkbox" id="s-lowfx" role="switch">';
  var ref=q('#s-vibe');ref=ref?ref.closest('.row'):null;if(ref&&ref.parentNode)ref.parentNode.insertBefore(row,ref.nextSibling);else s.appendChild(row);
  var cb=row.querySelector('input');cb.checked=!!set.lowfx;document.body.classList.toggle('lowfx',!!set.lowfx);
  cb.addEventListener('change',function(){set.lowfx=cb.checked;save();document.body.classList.toggle('lowfx',cb.checked);});
})();

/* ---------- 8. computer players adapt: easy for the first games, then follow your results ---------- */
var bp=botPick;
botPick=function(seat,list,roll){
  var lv=set.level,eff=lv,rec=set.rec||[];
  if((+set.st.g||0)<3)eff=0;
  else if(rec.length>=5){var w=rec.slice(-6).filter(Boolean).length;if(w<=1)eff=Math.max(0,lv-1);else if(w>=5)eff=Math.min(2,lv+1);}
  set.level=eff;try{return bp(seat,list,roll);}finally{set.level=lv;}
};
var swn=showWin;
showWin=function(pl){var first=S.recG!==S.gid;swn(pl);if(first&&S.mode==='cpu'){S.recG=S.gid;set.rec=(set.rec||[]).concat([sideMine(pl.seat)?1:0]).slice(-10);save();}};

/* ---------- 9. music for each world ---------- */
var MUS={
 base:{n:NOTES.slice(),c:CHORDS.map(function(x){return x.slice();})},
 sea:{n:[196,220,261.63,293.66,329.63,392,440],c:[[98,146.83,220],[87.31,130.81,220],[110,164.81,261.63]]},
 spooky:{n:[220,246.94,261.63,311.13,329.63,392,415.3],c:[[110,130.81,164.81],[103.83,155.56,207.65],[98,116.54,146.83]]},
 party:{n:[392,440,523.25,587.33,659.25,783.99,880],c:[[196,246.94,293.66],[220,277.18,329.63],[174.61,220,261.63],[196,246.94,392]]},
 space:{n:[293.66,329.63,369.99,440,493.88,587.33,659.25],c:[[146.83,220,293.66],[164.81,246.94,329.63],[130.81,196,329.63]]},
 fire:{n:[220,233.08,277.18,293.66,329.63,349.23,415.3],c:[[110,164.81,220],[116.54,174.61,233.08],[103.83,155.56,207.65]]},
 ice:{n:[523.25,587.33,659.25,783.99,880,1046.5],c:[[261.63,329.63,392],[220,329.63,440],[246.94,329.63,392]]},
 nature:{n:[261.63,293.66,329.63,392,440,523.25],c:[[130.81,196,329.63],[146.83,220,293.66],[174.61,261.63,349.23]]}
};
var KIND={bubbles:'sea',bats:'spooky',sprinkles:'party',lights:'party',neon:'space',stars:'space',embers:'fire',snow:'ice',aurora:'ice',petals:'nature',leaves:'nature',fireflies:'nature',sparkle:'party',gears:'fire',dust:'fire',clouds:'ice'};
function setMusic(k){var m=MUS[k]||MUS.base;NOTES.length=0;m.n.forEach(function(x){NOTES.push(x);});CHORDS.length=0;m.c.forEach(function(x){CHORDS.push(x);});}
var db=drawBoard;
drawBoard=function(){db();if(PRVB)return;var it=boardItem(),key=window.__ludoraV3&&window.__ludoraV3.artKey?window.__ludoraV3.artKey(it):null,a=key&&window.__ludoraArtMeta&&window.__ludoraArtMeta[key]?window.__ludoraArtMeta[key].a:'';setMusic(KIND[a]||'base');};

window.__ludoraV6=V6;
})();
