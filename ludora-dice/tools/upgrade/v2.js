/* ===================== v1.2 upgrade (Goldenmayhem) =====================
   3D dice rendered in Godot, refined bigger board, illustrated computer players,
   bottom game bar (reactions, quick chat, gifts, Lucky Roll), tiered achievements,
   player profiles, rewards with optional video double, goal bar, free season pass,
   weekly token hunt on the board, board spinner, teach-as-you-play tutorial. */
(function(){
var V2={};
function q2(s,r){return (r||document).querySelector(s);}
function seatPl(s){return S.players.filter(function(p){return p.seat===s;})[0];}
function rnd(a,b){return a+Math.floor(Math.random()*(b-a+1));}

/* ---------- always dark: the light/dark option is removed ---------- */
set.theme='dark';save();try{applyTheme();}catch(e){}
(function(){var th=$('#s-theme');if(th){th.hidden=true;var p=th.previousElementSibling;if(p&&p.tagName==='H3')p.hidden=true;}})();

/* ---------- 3D dice ---------- */
var D3IMG={},D3URL={},D3TINT={classic:1,glass:1},d3id='',d3col='',lastV=6;
function d3img(id){
  if(!D3IMG[id])D3IMG[id]=new Promise(function(res,rej){var im=new Image();im.onload=function(){res(im);};im.onerror=rej;im.src='dice/'+id+'.webp';});
  return D3IMG[id];
}
function rgbOf(h){h=String(h||'#2F86FF').replace('#','');if(h.length===3)h=h.split('').map(function(c){return c+c;}).join('');var n=parseInt(h,16);return [n>>16&255,n>>8&255,n&255];}
function d3url(id,col){
  if(!D3TINT[id])return d3img(id).then(function(im){return im.src;});
  var key=id+'|'+col;if(D3URL[key])return D3URL[key];
  D3URL[key]=d3img(id).then(function(im){
    var c=document.createElement('canvas');c.width=im.width;c.height=im.height;var x=c.getContext('2d');x.drawImage(im,0,0);
    var d=x.getImageData(0,0,c.width,c.height),a=d.data,t=rgbOf(col),glass=id==='glass';
    var bt=glass?t.map(function(v){return v*.4+255*.6;}):t,pc=glass?t:[255,255,255];
    for(var i=0;i<a.length;i+=4){
      if(!a[i+3])continue;
      var r=a[i],g=a[i+1],b=a[i+2],k=Math.max(0,Math.min(1,(g-Math.max(r,b))/200)),gray=Math.min(1,(r+b)/2/255/Math.max(.05,1-k)),sh=Math.min(1.08,gray/.9),hl=Math.max(0,(gray-.975)/.025);
      for(var ch=0;ch<3;ch++){var body=Math.min(255,bt[ch]*sh)+(255-bt[ch])*hl*.6;a[i+ch]=Math.round(Math.min(255,body)*(1-k)+pc[ch]*k);}
    }
    x.putImageData(d,0,0);return c.toDataURL('image/png');
  });
  return D3URL[key];
}
function d3el(){var b=dieEl.querySelector('.d3');if(!b){b=document.createElement('b');b.className='d3';dieEl.appendChild(b);}return b;}
function d3frame(k){d3el().style.backgroundPosition=(k/17*100)+'% 0';}
function d3skin(id,col){
  if(id===d3id&&col===d3col)return;d3id=id;d3col=col;
  d3url(id,col).then(function(u){if(d3id!==id||d3col!==col)return;d3el().style.backgroundImage='url("'+u+'")';dieEl.classList.add('has3d');})
  .catch(function(){if(d3id===id)dieEl.classList.remove('has3d');});
}
V2.d3url=d3url;V2.setDie=setDie;
setDie=function(v){V2.setDie(v);if(v>0)lastV=v;d3frame(11+(v>0?v:lastV));};
V2.moveDie=moveDie;
moveDie=function(seat){V2.moveDie(seat);var pl=seatPl(seat);d3skin(pl?String(lookOf(pl).d):String(curItem('die').id),SEATHEX[seat]);};
V2.animateDie=animateDie;
animateDie=async function(v,gid,seat){
  moveDie(seat);
  if(!dieEl.classList.contains('has3d'))return V2.animateDie(v,gid,seat);
  dieEl.classList.remove('land');void dieEl.offsetWidth;dieEl.classList.add('tumble');
  for(var k=0;k<12;k++){d3frame(k);if(k%3===0)sfx.tick();await wait(48);if(gid!==S.gid){dieEl.classList.remove('tumble');return;}}
  dieEl.classList.remove('tumble');setDie(v);void dieEl.offsetWidth;dieEl.classList.add('land');
  if(v===6)sixFx(seat);await wait(260);
};
d3skin(String(curItem('die').id),SEATHEX[3]);setDie(0);

/* ---------- board: bigger yards, refined finish ---------- */
V2.drawBoard=drawBoard;
drawBoard=function(){V2.drawBoard();try{boardPlus();}catch(e){}};
function boardPlus(){
  var BT=boardItem(),defs=board.querySelector('defs');
  if(!PRVB)stage.style.setProperty('--rim',BT.g1||'#37b9ff');
  var sh=se('linearGradient',{id:'g-sheen',x1:0,y1:0,x2:1,y2:1},defs);
  se('stop',{offset:0,'stop-color':'#fff','stop-opacity':.13},sh);se('stop',{offset:.42,'stop-color':'#fff','stop-opacity':0},sh);se('stop',{offset:1,'stop-color':'#fff','stop-opacity':.05},sh);
  for(var s=0;s<4;s++){
    var g=BASEG[s];if(!g)continue;var o=BASEO[s];
    var cup=se('radialGradient',{id:'g-cup'+s,cx:.5,cy:.42,r:.6},defs);
    se('stop',{offset:0,'stop-color':'#000','stop-opacity':.05},cup);se('stop',{offset:.75,'stop-color':'#000','stop-opacity':.35},cup);se('stop',{offset:1,'stop-color':SEATHEX[s],'stop-opacity':.45},cup);
    for(var i=0;i<npaw();i++){
      var cx=o[0]+SLOTS[i][0],cy=o[1]+SLOTS[i][1];
      se('circle',{cx:cx,cy:cy,r:.93,fill:'none',stroke:SEATHEX[s],'stroke-width':.05,opacity:.45},g);
      se('circle',{cx:cx,cy:cy,r:.8,fill:'url(#g-cup'+s+')'},g);
      se('ellipse',{cx:cx-.18,cy:cy-.42,rx:.36,ry:.13,fill:'#fff',opacity:.18},g);
    }
    if(BTXT[s]){
      var y=+BTXT[s].lab.getAttribute('y');
      var tab=se('rect',{x:o[0]+1.05,y:y-.3,width:3.9,height:.6,rx:.3,fill:'rgba(0,0,20,.55)',stroke:SEATHEX[s],'stroke-width':.04},g);
      g.insertBefore(tab,BTXT[s].lab);
      BTXT[s].lab.setAttribute('font-size','.4');BTXT[s].lab.setAttribute('fill','#fff');
      BTXT[s].cnt.setAttribute('font-size','.4');
    }
  }
  var cg=se('radialGradient',{id:'g-ctr'},defs);se('stop',{offset:.5,'stop-color':'#fff','stop-opacity':.55},cg);se('stop',{offset:1,'stop-color':'#fff','stop-opacity':0},cg);
  var ctr=se('circle',{cx:7.5,cy:7.5,r:1.25,fill:'url(#g-ctr)',opacity:.7},board);
  board.insertBefore(ctr,board.querySelector('polygon[points^="7.5"]')||null);
  var sheen=se('rect',{x:0,y:0,width:15,height:15,fill:'url(#g-sheen)','pointer-events':'none'},board);
  GLOW.forEach(function(gl){if(gl&&gl.parentNode)board.appendChild(gl);});
}
board.innerHTML='';GLOW=[];BASEG=[];drawBoard();

/* ---------- seats: illustrated computer players, cleaner yard labels ---------- */
var FACE=[
  {bg:'#F0343E',skin:'#f6c9a8',hair:'#b5122e',st:'bob'},
  {bg:'#2FD34E',skin:'#e7b58f',hair:'#1f6e3c',st:'beanie'},
  {bg:'#FFC82A',skin:'#f8d6b4',hair:'#e39a12',st:'bun'},
  {bg:'#2F86FF',skin:'#c9906a',hair:'#1a3f9a',st:'cap'}];
function faceSvg(k,big){
  var f=FACE[k%4],h=f.hair,sk=f.skin,o='<svg class="face" viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="fb'+k+(big?'b':'')+'" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="'+f.bg+'"/></radialGradient></defs>';
  o+='<rect width="64" height="64" fill="url(#fb'+k+(big?'b':'')+')"/>';
  if(f.st==='bob')o+='<path d="M14 40c-2-18 6-28 18-28s20 10 18 28c-4 4-8 6-8 6H22s-4-2-8-6z" fill="'+h+'"/>';
  if(f.st==='bun')o+='<circle cx="32" cy="11" r="8" fill="'+h+'"/>';
  o+='<path d="M12 64c2-12 10-17 20-17s18 5 20 17z" fill="'+(k===2?'#7b5cff':k===1?'#ff7a3a':k===3?'#ffd35c':'#2f86ff')+'"/>';
  o+='<rect x="27" y="40" width="10" height="9" rx="3" fill="'+sk+'"/>';
  o+='<ellipse cx="32" cy="31" rx="14" ry="15" fill="'+sk+'"/>';
  o+='<ellipse cx="18.5" cy="32" rx="2.6" ry="3.4" fill="'+sk+'"/><ellipse cx="45.5" cy="32" rx="2.6" ry="3.4" fill="'+sk+'"/>';
  if(f.st==='bob')o+='<path d="M18 28c2-9 8-13 14-13s12 4 14 13c-6-2-10-6-12-9-3 4-9 8-16 9z" fill="'+h+'"/>';
  if(f.st==='bun')o+='<path d="M18 27c1-8 7-12 14-12s13 4 14 12c-5-3-11-4-14-6-4 3-9 4-14 6z" fill="'+h+'"/>';
  if(f.st==='beanie')o+='<path d="M16 27c0-10 7-16 16-16s16 6 16 16z" fill="'+h+'"/><rect x="15" y="24" width="34" height="6" rx="3" fill="#7af59a"/><circle cx="32" cy="10" r="3.5" fill="#7af59a"/>';
  if(f.st==='cap')o+='<path d="M17 26c0-9 7-14 15-14s15 5 15 14z" fill="'+h+'"/><path d="M30 25h22c0 3-3 4-6 4H30z" fill="#0f2a6e"/><path d="M19 27c1 4 1 6 0 9" stroke="#3a2416" stroke-width="2.4" fill="none"/>';
  o+='<ellipse cx="26" cy="32" rx="2.3" ry="2.9" fill="#2a1a12"/><ellipse cx="38" cy="32" rx="2.3" ry="2.9" fill="#2a1a12"/><circle cx="26.8" cy="31" r=".9" fill="#fff"/><circle cx="38.8" cy="31" r=".9" fill="#fff"/>';
  o+='<ellipse cx="22" cy="37.5" rx="3" ry="1.8" fill="#ff7a8a" opacity=".45"/><ellipse cx="42" cy="37.5" rx="3" ry="1.8" fill="#ff7a8a" opacity=".45"/>';
  o+='<path d="M27 39c3 3 7 3 10 0" stroke="#7a2a2a" stroke-width="2" fill="none" stroke-linecap="round"/>';
  if(k===2)o+='<path d="M21 28h22" stroke="#2a1a12" stroke-width=".1"/>';
  return o+'</svg>';
}
V2.faceSvg=faceSvg;
function botFace(pl){if(!pl||!pl.bot)return -1;var n=nameOf(pl);var k=BOTNAMES.indexOf(n);return k>=0?k:pl.seat;}
V2.renderSeats=renderSeats;
renderSeats=function(){
  V2.renderSeats();
  for(var s=0;s<4;s++){
    var pl=seatPl(s),d=SEATEL[s];if(!pl||!d)continue;
    var ab=d.querySelector('.av b'),k=botFace(pl);
    if(k>=0){var fs=ab.querySelector('svg.face');if(!fs||ab.dataset.face!==String(k)){ab.innerHTML=faceSvg(k);ab.dataset.face=String(k);}ab.style.color='transparent';}
    else if(ab.dataset.face){delete ab.dataset.face;var f2=ab.querySelector('svg.face');if(f2)f2.remove();}
    if(BTXT[s]){
      var home=S.pawns?S.pawns[s].filter(function(x){return x===56;}).length-(4-npaw()):0,bumps=(S.bumps&&S.bumps[s])||0;
      var nm=nameOf(pl),fl=(pl.you||mine(pl))?set.flag:(pl.flag||'');
      BTXT[s].lab.textContent=(fl?fl+' ':'')+nm+(S.team?'  '+teamTag(s):'');
      BTXT[s].cnt.textContent=(mine(pl)&&!pl.bot)?'🏠 '+home+'/'+npaw()+'    💥 '+bumps:'';
    }
    var gb=d.querySelector('.gbadge');var gv=S.gifts&&S.gifts[s];
    if(gv){if(!gb){gb=el('span','gbadge',d.querySelector('.av'));}gb.textContent=gv;}else if(gb)gb.remove();
  }
};
V2.renderSeatsOrig=V2.renderSeats;

/* ---------- board banner: "Ruby's Board" ---------- */
V2.setPill=setPill;
setPill=function(text,seat){
  var live=S.players.length&&S.phase!=='idle';
  var t=live?(S.bOwner?S.bOwner+'’s Board':boardItem().name):text;
  V2.setPill(t,seat);
};

/* ---------- yard pawns bigger ---------- */
V2.targets=targets;
targets=function(){var t=V2.targets();Object.keys(t).forEach(function(k){var it=t[k];if(it&&it.s!=null&&S.pawns[it.s][it.i]===-1)it.sc=1.08;});return t;};

/* ---------- bottom bar ---------- */
var gbar=el('div','gbar',$('#app'));gbar.id='gbar';
gbar.innerHTML='<button type="button" id="g-emo" aria-label="Reactions">😀</button><button type="button" id="g-chat" aria-label="Quick chat">💬</button><button type="button" id="g-gift" aria-label="Send a gift">🎁</button><button type="button" class="glk" id="g-luck" aria-label="Lucky Roll">🍀 <span>Lucky</span><em id="g-lkn">0</em></button><span class="gsp"></span><span class="gcoin"><i class="cn"></i><span class="coincount"></span></span>';
$('#g-emo').addEventListener('click',function(){$('#b-emoji').click();});
$('#g-chat').addEventListener('click',function(){$('#b-chat').click();});
$('#g-gift').addEventListener('click',function(){openGift(-1);});
$('#g-luck').addEventListener('click',function(){$('#b-luck').click();});
function gbarSync(){
  var live=S.players.length&&S.phase!=='idle'&&$('#ov-welcome').hidden;
  gbar.style.display=live?'':'none';
  var b=$('#b-luck'),gl=$('#g-luck');
  var lkShow=S.mode!=='online'&&S.mode!=='pass';gl.style.display=lkShow?'':'none';
  gl.disabled=!b||b.disabled;gl.classList.toggle('on',!!(b&&b.classList.contains('set')));
  var seat=luckSeat();$('#g-lkn').textContent=String(seat>=0?luckLeft(seat):luckLeft(3));
  $('#g-gift').style.display=(S.mode==='pass')?'none':'';
}
setInterval(gbarSync,400);refreshStars();

/* ---------- gifts (game coins only) ---------- */
var GIFTS=[['🌹','Rose',500],['🧁','Cupcake',500],['🎈','Balloon',800],['🍀','Clover',1000],['☕','Cocoa',1000],['🍕','Pizza',1500],['🎸','Guitar',2500],['🏆','Trophy',4000],['👑','Crown',6000],['💎','Diamond',8000],['🚀','Rocket',10000],['🦄','Unicorn',15000]];
V2.GIFTS=GIFTS;
var giftTo=-1;
function sheetEl(id,title){
  var o=document.getElementById(id);if(o)return o;
  o=el('div','overlay',document.body);o.id=id;o.hidden=true;o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.style.zIndex=62;
  o.innerHTML='<div class="sheet"><h2 class="ribbon"></h2><button class="close" type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="sb"></div></div>';
  o.querySelector('.ribbon').textContent=title;
  o.querySelector('.close').addEventListener('click',function(){closeSheet(id);});
  return o;
}
function others(){return S.players.filter(function(p){return !(mine(p)&&!p.bot);});}
function openGift(to){
  if(!S.players.length||S.mode==='pass')return;
  var o=sheetEl('ov-gift','SEND A GIFT'),sb=o.querySelector('.sb');giftTo=to;
  function draw(){
    sb.innerHTML='';
    var ch=el('div','tchips',sb);
    var b0=el('button','',ch);b0.type='button';b0.textContent='Everyone';b0.setAttribute('aria-pressed',String(giftTo<0));b0.addEventListener('click',function(){giftTo=-1;draw();});
    others().forEach(function(p){var b=el('button','',ch);b.type='button';b.textContent=nameOf(p);b.setAttribute('aria-pressed',String(giftTo===p.seat));b.addEventListener('click',function(){giftTo=p.seat;draw();});});
    var n=giftTo<0?others().length:1;
    var g=el('div','pgrid',sb);
    GIFTS.forEach(function(G){
      var cost=G[2]*n,b=el('button','',g);b.type='button';b.innerHTML=G[0]+'<small>'+G[1]+'</small><small>'+cn(cost)+'</small>';b.disabled=set.coins<cost;
      b.addEventListener('click',function(){sendGift(G,giftTo);closeSheet('ov-gift');});
    });
    var p=el('p','note',sb);p.textContent='Gifts use coins you earn in the game. They stay on the player’s picture until the game ends. Balance: '+nf(set.coins)+'.';
  }
  draw();openSheet('ov-gift');
}
function avCenter(seat){var a=SEATEL[seat]&&SEATEL[seat].querySelector('.av');if(!a)return null;var r=a.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];}
function sendGift(G,to){
  var list=to<0?others():others().filter(function(p){return p.seat===to;});
  var cost=G[2]*list.length;if(!list.length||set.coins<cost){toast('Not enough coins.');return;}
  set.coins-=cost;save();refreshStars();stat('gf',list.length);
  var meSeat=(S.players.filter(function(p){return mine(p)&&!p.bot;})[0]||{seat:3}).seat,from=avCenter(meSeat)||[innerWidth/2,innerHeight-80];
  list.forEach(function(p,k){
    var to2=avCenter(p.seat);if(!to2)return;
    var f=el('div','flygift',document.body);f.textContent=G[0];f.style.left=(from[0]-17)+'px';f.style.top=(from[1]-20)+'px';
    setTimeout(function(){f.style.left=(to2[0]-17)+'px';f.style.top=(to2[1]-20)+'px';f.style.transform='scale(1.5) rotate(360deg)';},30+k*120);
    setTimeout(function(){f.remove();S.gifts=S.gifts||{};S.gifts[p.seat]=G[0];renderSeats();sfx.pop();
      if(p.bot&&Math.random()<.75)setTimeout(function(){showReaction(p.seat,Math.random()<.5?'Thanks!':'❤️');},700);},900+k*120);
  });
}
V2.sendGift=sendGift;
V2.startGame=startGame;
startGame=function(){S.gifts={};S.bOwner=null;var r=V2.startGame.apply(this,arguments);tokPlace();return r;};

/* ---------- player popup on avatar tap ---------- */
[0,1,2,3].forEach(function(s){var av=SEATEL[s]&&SEATEL[s].querySelector('.av');if(av)av.addEventListener('click',function(){openPlayer(s);});});
function lvl(){var xp=+set.xpT||0,l=1,need=300;while(xp>=need){xp-=need;l++;need=300+l*60;}return {l:l,xp:xp,need:need};}
V2.lvl=lvl;
function openPlayer(s){
  var pl=seatPl(s);if(!pl)return;
  if(mine(pl)&&!pl.bot&&S.mode!=='pass'){renderProf();openSheet('ov-prof');return;}
  var o=sheetEl('ov-player','PLAYER'),sb=o.querySelector('.sb');sb.innerHTML='';
  var k=botFace(pl),h=el('div','phead',sb);
  h.innerHTML='<div class="pav">'+(k>=0?faceSvg(k,1):nameOf(pl).charAt(0).toUpperCase())+'</div><div><b></b><small></small></div>';
  h.querySelector('b').textContent=(pl.flag?pl.flag+' ':'')+nameOf(pl);
  h.querySelector('small').textContent=pl.bot?('Computer player · '+(['Easy','Normal','Hard'][(set.level||1)-0]||'Normal')+' level'):'Player';
  var st=el('div','stl',sb),hm=S.pawns[s].filter(function(x){return x===56;}).length-(4-npaw());
  st.innerHTML='<span>Pawns home</span><span>'+hm+' / '+npaw()+'</span><span>Bumps this game</span><span>'+((S.bumps&&S.bumps[s])||0)+'</span>'+(S.team?'<span>Team</span><span>'+teamTag(s)+'</span>':'');
  var bx=el('div','stack',sb);bx.style.marginTop='10px';
  if(S.mode!=='pass'){var b=el('button','btn',bx);b.type='button';b.textContent='🎁 Send a gift';b.addEventListener('click',function(){closeSheet('ov-player');openGift(s);});}
  var m=el('button','btn ghost',bx);m.type='button';S.mute=S.mute||{};m.textContent=S.mute[s]?'Unmute reactions':'Mute reactions';
  m.addEventListener('click',function(){S.mute[s]=!S.mute[s];closeSheet('ov-player');toast(S.mute[s]?nameOf(pl)+' is muted.':nameOf(pl)+' is unmuted.');});
  openSheet('ov-player');
}
V2.showReaction=showReaction;
showReaction=function(seat,e){if(S.mute&&S.mute[seat])return;V2.showReaction(seat,e);};

/* ---------- tiered achievements ---------- */
var TACH=[
 {k:'g',n:'Ludo Love',d:'Finish games',t:[1,25,150],c:[2000,8000,25000],gm:[0,10,40]},
 {k:'w',n:'Champion',d:'Win games',t:[1,20,100],c:[3000,10000,30000],gm:[0,15,50]},
 {k:'cs',n:'On Fire',d:'Win games in a row',t:[2,4,8],c:[3000,8000,20000],gm:[0,10,30],best:'ms'},
 {k:'c',n:'The Bumper',d:'Send rival pawns home',t:[10,100,500],c:[4000,12000,30000],gm:[0,10,40]},
 {k:'h',n:'Home Runner',d:'Bring pawns home',t:[20,200,1000],c:[5000,15000,35000],gm:[0,10,40]},
 {k:'s6',n:'Six Seeker',d:'Roll a 6',t:[25,250,1000],c:[3000,10000,25000],gm:[0,10,30]},
 {k:'t',n:'Team Player',d:'Win team matches',t:[1,10,40],c:[5000,15000,35000],gm:[0,15,40]},
 {k:'gf',n:'Social Butterfly',d:'Send gifts',t:[1,25,100],c:[2000,8000,20000],gm:[0,10,30]},
 {k:'u',n:'Power Player',d:'Use Lucky Rolls',t:[5,50,250],c:[3000,9000,22000],gm:[0,10,30]},
 {k:'k',n:'Treasure Hunter',d:'Open chests',t:[1,25,100],c:[2000,9000,25000],gm:[0,10,30]},
 {k:'tk',n:'Token Collector',d:'Collect event tokens',t:[10,100,500],c:[3000,10000,25000],gm:[0,10,30]},
 {k:'pt',n:'Season Climber',d:'Reach season pass tiers',t:[5,30,90],c:[3000,10000,30000],gm:[0,10,40]}];
V2.TACH=TACH;V2.achCheck=function(q){achCheck(q);};
set.a2=set.a2||{};
(function(){var m={g1:'g',w1:'w',c10:'c',h20:'h',t1:'t'};(set.ach||[]).forEach(function(id){if(m[id]&&!set.a2[m[id]])set.a2[m[id]]=1;});})();
function stv(a){return a.best?Math.max(+set.st[a.best]||0,+set.st[a.k]||0):(+set.st[a.k]||0);}
function achCheck(quiet){
  TACH.forEach(function(a){
    var got=set.a2[a.k]||0;
    while(got<3&&stv(a)>=a.t[got]){
      set.coins+=a.c[got];set.gems+=a.gm[got];got++;set.a2[a.k]=got;
      if(!quiet)toast(['🥉','🥈','🥇'][got-1]+' '+a.n+'  +'+nf(a.c[got-1])+' coins'+(a.gm[got-1]?' +'+a.gm[got-1]+' gems':''));
    }
  });
}
ACH.length=0;
stat=function(k,n){set.st[k]=(set.st[k]||0)+n;achCheck();save();refreshStars();};
V2.dgAdd=dgAdd;
dgAdd=function(k,n){V2.dgAdd(k,n);if(k==='s')stat('s6',n);else if(k==='o')stat('k',n);else if(k==='l')stat('u',n);};
achCheck(true);save();

renderProf=function(){
  var box=$('#ov-prof .sb')||$('#p-ach').parentNode;
  box.innerHTML='';
  var tabs=el('div','seg ptabs',box);tabs.innerHTML='<button type="button" data-v="p">Profile</button><button type="button" data-v="a">Achievements</button>';
  var body=el('div','',box);V2.ptab=V2.ptab||'p';
  function draw(){
    [].forEach.call(tabs.children,function(b){b.setAttribute('aria-pressed',String(b.dataset.v===V2.ptab));});body.innerHTML='';
    if(V2.ptab==='p'){
      var L=lvl(),h=el('div','phead',body);
      h.innerHTML='<div class="pav"></div><div style="flex:1"><b></b><small></small><div class="lvbar"><i></i></div></div>';
      var pv=h.querySelector('.pav');if(set.photo){pv.style.background='url('+set.photo+') center/cover';}else pv.textContent=(set.name||'P').charAt(0).toUpperCase();
      h.querySelector('b').textContent=(set.flag||'')+' '+(set.name||'Player');
      h.querySelector('small').textContent='Level '+L.l+'  ·  '+L.xp+' / '+L.need+' XP';
      h.querySelector('.lvbar i').style.width=(L.xp/L.need*100)+'%';
      var st=set.st,g=+st.g||0,w=+st.w||0,medals=TACH.reduce(function(a,x){return a+(set.a2[x.k]||0);},0);
      var rows=[['Games played',g],['Games won',w],['Win rate',g?Math.round(w/g*100)+'%':'0%'],['Current win streak',+st.cs||0],['Best win streak',+st.ms||0],['Pawns sent home',+st.c||0],['Pawns brought home',+st.h||0],['6s rolled',+st.s6||0],['Team wins',+st.t||0],['Gifts sent',+st.gf||0],['Medals',medals+' / '+TACH.length*3]];
      var t=el('div','stl',body);t.innerHTML=rows.map(function(r){return '<span>'+r[0]+'</span><span>'+(typeof r[1]==='number'?nf(r[1]):r[1])+'</span>';}).join('');
    }else{
      TACH.forEach(function(a){
        var got=set.a2[a.k]||0,v=stv(a),nx=got<3?a.t[got]:a.t[2],r=el('div','tach',body);
        r.innerHTML='<div class="md"><i>🥉</i><i>🥈</i><i>🥇</i></div><div class="tx"><b></b><small></small><div class="bar2"><i></i></div></div><em></em>';
        [].forEach.call(r.querySelectorAll('.md i'),function(m,j){m.classList.toggle('on',j<got);});
        r.querySelector('b').textContent=a.n;r.querySelector('small').textContent=a.d+'  ('+nf(Math.min(v,nx))+' / '+nf(nx)+')';
        r.querySelector('.bar2 i').style.width=Math.min(100,v/nx*100)+'%';
        r.querySelector('em').innerHTML=got<3?('+'+nf(a.c[got])+(a.gm[got]?'<br>+'+a.gm[got]+' 💎':'')):'Done';
      });
    }
  }
  tabs.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;V2.ptab=b.dataset.v;draw();});
  draw();
};

/* ---------- rewards: show them, video double, goal bar, XP ---------- */
function goalItem(){
  if(set.goal){var f=findItem(set.goal);if(f&&f.it&&!owned(f.cat,f.it.id))return f;}
  var best=null;
  ['board','pawn','die','frame'].forEach(function(cat){ITEMS[cat].forEach(function(it){if(it.c>0&&!it.g&&!owned(cat,it.id)&&(!best||it.c<best.it.c))best={cat:cat,it:it};});});
  return best;
}
V2.goalItem=goalItem;
function goalHtml(){
  var g=goalItem();if(!g)return '';
  var pct=Math.min(100,set.coins/g.it.c*100);
  return '<div class="goal">Next goal: '+CATNAME[g.cat]+' “'+g.it.name+'”  ·  '+nf(Math.min(set.coins,g.it.c))+' / '+nf(g.it.c)+'<div class="lvbar"><i style="width:'+pct+'%"></i></div></div>';
}
V2.showWin=showWin;
showWin=function(pl){
  var c0=set.coins,first=S.rewarded!==S.gid;
  V2.showWin(pl);
  var earned=set.coins-c0,you=sideMine(pl.seat),gid=S.gid;
  if(first&&S.mode!=='pass'&&S.mode!=='online'){
    set.st.cs=you?(+set.st.cs||0)+1:0;set.st.ms=Math.max(+set.st.ms||0,set.st.cs);
    var xp=40+(you?30:0)+((S.bumps&&S.bumps[3])||0)*3+(S.tkGot||0)*5;
    set.xpT=(+set.xpT||0)+xp;passAdd(xp);achCheck();save();refreshStars();S.xpGain=xp;
  }
  var sh=$('#ov-win .sheet .sb')||$('#x-text').parentNode,old=sh.querySelector('.wrw');if(old)old.remove();
  if(S.mode==='pass'||S.mode==='online')return;
  var w=el('div','wrw',null);sh.insertBefore(w,$('#x-again').closest('.stack')||null);
  var sec=S.rank&&S.rank.length>1?seatPl(S.rank[1]):null,second=!!(sec&&!S.team&&sideMine(sec.seat)&&!you);
  var gameReward=(10+(you?25:0)+(second?10:0))*100;
  w.innerHTML='<div class="rl">You earned</div><div class="big">'+cn(earned)+'</div><div class="rl">+'+(S.xpGain||0)+' XP'+(S.tkGot?'  \u00B7  '+S.tkGot+' '+tokEmoji()+' tokens':'')+'</div>'+goalHtml();
  if(S.dbl!==gid){
    var b=el('button','btn',w);b.type='button';b.style.marginTop='8px';b.textContent='▶ Video: +'+nf(gameReward)+' coins';b.style.background='linear-gradient(#ffcb3a,#f08a12)';
    b.addEventListener('click',function(){Ads.reward(function(ok){if(!ok){toast('The video did not finish.');return;}if(S.dbl===gid)return;S.dbl=gid;set.coins+=gameReward;save();refreshStars();sfx.home();toast('+'+nf(gameReward)+' coins');b.remove();w.querySelector('.big').innerHTML=cn(earned+gameReward);var gg=w.querySelector('.goal');if(gg)gg.outerHTML=goalHtml();});});
  }
};

/* ---------- entry fee: fix "Play again" (charge again or play free) ---------- */
(function(){
  var xa=$('#x-again'),nx=xa.cloneNode(true);xa.parentNode.replaceChild(nx,xa);
  nx.addEventListener('click',function(){
    $('#ov-win').hidden=true;
    if(S.mode==='online'&&NET.host){netBeginVote(S.count);return;}
    var stake=S.stake||0;
    if(stake){if(set.coins>=stake){set.coins-=stake;save();refreshStars();}else{toast('Not enough coins for the entry fee. Playing a free game.');stake=0;}}
    startGame(S.mode,S.count,null,S.team,S.dt?'daily':S.gm);S.stake=stake;beginPlay();
  });
})();

/* ---------- board spinner: "Starting on ...'s board" ---------- */
V2.beginPlay=beginPlay;
beginPlay=function(){
  if(S.mode!=='cpu'||S.spunGid===S.gid){return V2.beginPlay();}
  S.spunGid=S.gid;
  var cands=[],pool=ITEMS.board.filter(function(b){return b.id!==curItem('board').id;});
  S.players.forEach(function(p){
    var b=(mine(p)&&!p.bot)?curItem('board'):pool[Math.floor(Math.random()*pool.length)];
    cands.push({p:p,b:b,nm:(mine(p)&&!p.bot)?'You':nameOf(p)});
  });
  var o=sheetEl('ov-spin','STARTING GAME'),sb=o.querySelector('.sb');o.querySelector('.close').hidden=true;
  sb.innerHTML='<p class="lead" style="text-align:center;margin:0">Picking one player’s board…</p>';
  var g=el('div','spin',sb);
  cands.forEach(function(c){var d=el('div','',g);d.appendChild(boardPreviewSvg(c.b,140));var t=el('span','',d);t.textContent=c.nm+': '+c.b.name;});
  openSheet('ov-spin');
  var pick=Math.floor(Math.random()*cands.length),steps=cands.length*3+pick,k=0,gid=S.gid;
  function tick(){
    [].forEach.call(g.children,function(d,j){d.classList.toggle('on',j===k%cands.length);});sfx.tick();
    if(k>=steps){
      setTimeout(function(){
        closeSheet('ov-spin');if(gid!==S.gid)return;
        var c=cands[pick];MB=String(c.b.id);S.bOwner=c.nm==='You'?null:c.nm;
        redrawBoard();tokDraw();
        if(c.nm!=='You')toast('Playing on '+c.nm+'’s board: '+c.b.name);
        V2.beginPlay();
      },650);return;
    }
    k++;setTimeout(tick,70+k*k*1.6);
  }
  tick();
};

/* ---------- weekly token hunt: tokens on the board ---------- */
var TOKS=['❄️','💝','🍀','🌷','🌸','🌞','🐚','⭐','🍎','🎃','🍁','🎄'];
function tokEmoji(){return TOKS[new Date().getMonth()];}
V2.tokEmoji=tokEmoji;
function weekNo(){return Math.floor((Date.now()/864e5+3)/7);}
function evState(){var w=weekNo();if(!set.ev||set.ev.w!==w)set.ev={w:w,n:0,cl:[]};return set.ev;}
var EVM=[{n:5,c:3000},{n:15,c:6000},{n:30,g:15},{n:50,chest:'silver'},{n:80,c:15000},{n:120,g:30,chest:'gold'}];
V2.EVM=EVM;
function tokPlace(){
  S.tok=[];S.tkGot=0;
  if(S.mode!=='cpu')return tokDraw();
  var cand=[];for(var i=0;i<52;i++)if(!SAFE.has(i))cand.push(i);
  for(var k=0;k<5;k++){var j=Math.floor(Math.random()*cand.length);S.tok.push(cand.splice(j,1)[0]);}
  tokDraw();
}
function tokDraw(){
  pawnsEl.querySelectorAll('.tok').forEach(function(t){t.remove();});
  (S.tok||[]).forEach(function(t){var c=TRACK[t],d=el('div','tok',pawnsEl);d.dataset.t=t;d.textContent=tokEmoji();
    d.style.cssText='position:absolute;left:calc(var(--u) * '+(c[0]+.5)+');top:calc(var(--u) * '+(c[1]+.5)+');translate:-50% -50%;font-size:calc(var(--u) * .62);line-height:1;z-index:1;pointer-events:none;filter:drop-shadow(0 0 4px #fff8);animation:twinkle 1.6s ease-in-out infinite';});
}
V2.moveLocal=moveLocal;
moveLocal=async function(seat,i,roll,gid){
  var r=await V2.moveLocal(seat,i,roll,gid);if(r===null)return r;
  var st=S.pawns[seat][i];
  if(S.tok&&S.tok.length&&st>=0&&st<=50){
    var t=(START[seat]+st)%52,ix=S.tok.indexOf(t);
    if(ix>=0){
      S.tok.splice(ix,1);var pl=seatPl(seat)||cur();
      var d=pawnsEl.querySelector('.tok[data-t="'+t+'"]');
      if(d){d.style.transition='transform .5s,opacity .5s';d.style.transform='scale(2.2)';d.style.opacity='0';setTimeout(function(){d.remove();},520);}
      if(mine(pl)&&!pl.bot){var e=evState();e.n++;S.tkGot=(S.tkGot||0)+1;stat('tk',1);sfx.six();toast('+1 '+tokEmoji()+'  Token Hunt: '+e.n);evDot();}
      else sfx.pop();
    }
  }
  return r;
};

/* ---------- free season pass ---------- */
var SEAS=['Snowflake','Hearts','Clover','Rain Dance','Blossom','Sunshine','Beach','Starlight','Harvest','Spooky','Maple','Holiday'];
function monKey(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1);}
function passState(){var m=monKey();if(!set.ps||set.ps.m!==m)set.ps={m:m,xp:0,cl:[]};return set.ps;}
var PTN=30,PXP=120;
function passReward(t){
  if(t===PTN)return {g:50,chest:'gold'};
  if(t%10===0)return {chest:'gold',c:5000};
  if(t%5===0)return {chest:'silver',g:5};
  if(t%3===0)return {g:5+Math.floor(t/6)};
  return {c:1500+t*250};
}
V2.passReward=passReward;
function rwText(r){var a=[];if(r.c)a.push('🪙 '+nf(r.c));if(r.g)a.push('💎 '+r.g);if(r.chest)a.push('📦 '+CHESTS[r.chest].n);return a.join('  ');}
function passTier(){return Math.min(PTN,Math.floor(passState().xp/PXP));}
function passAdd(x){var p=passState(),t0=passTier();p.xp+=x;var t1=passTier();if(t1>t0){stat('pt',t1-t0);toast('Season pass: tier '+t1+' reached!');}save();passDot();}
V2.passAdd=passAdd;
function claimR(r){if(r.c)set.coins+=r.c;if(r.g)set.gems+=r.g;var ok=true;if(r.chest)ok=addChest(r.chest);save();refreshStars();return ok;}
function passClaimable(){var p=passState(),t=passTier(),n=0;for(var i=1;i<=t;i++)if(p.cl.indexOf(i)<0)n++;return n;}
function daysLeftMonth(){var d=new Date(),e=new Date(d.getFullYear(),d.getMonth()+1,1);return Math.ceil((e-d)/864e5);}
function openPass(){
  var o=sheetEl('ov-pass','SEASON PASS'),sb=o.querySelector('.sb'),p=passState(),t=passTier();
  sb.innerHTML='';
  var h=el('div','',sb);h.style.textAlign='center';
  h.innerHTML='<b style="font-size:20px;color:var(--cream-ink)">'+SEAS[new Date().getMonth()]+' Season</b><p class="note" style="margin:2px 0 6px">Free for everyone. '+daysLeftMonth()+' days left. Play games to earn XP.</p>';
  var pr=el('div','goal',sb),inT=p.xp-t*PXP;
  pr.innerHTML=(t>=PTN?'All tiers reached!':'Tier '+t+' → '+(t+1)+'  ·  '+inT+' / '+PXP+' XP')+'<div class="lvbar"><i style="width:'+(t>=PTN?100:inT/PXP*100)+'%"></i></div>';
  var tr=el('div','ptrack',sb);tr.style.marginTop='10px';
  for(var i=1;i<=PTN;i++)(function(i){
    var r=passReward(i),got=p.cl.indexOf(i)>=0,can=i<=t&&!got,row=el('div','ptier'+(got?' got':'')+(i===t+1?' cur':''),tr);
    row.innerHTML='<span class="tn">'+i+'</span><span class="rw">'+rwText(r)+'</span>';
    var b=el('button','mini'+(can?'':' gr'),row);b.type='button';b.textContent=got?'✓':(can?'Claim':'🔒');b.disabled=!can;
    b.addEventListener('click',function(){if(p.cl.indexOf(i)>=0)return;p.cl.push(i);var ok=claimR(r);sfx.home();toast('Tier '+i+': '+rwText(r)+(ok?'':' (chest slots full, chest lost)'));passDot();openPass();});
  })(i);
  var n=el('p','note',sb);n.textContent='Each game gives XP: 40 for playing, 30 more for a win, 3 for each bump and 5 for each token. A new season starts every month.';
  openSheet('ov-pass');
  var cur2=tr.querySelector('.cur');if(cur2)tr.scrollTop=Math.max(0,cur2.offsetTop-tr.offsetTop-60);
}
V2.openPass=openPass;
function openEvent(){
  var o=sheetEl('ov-event','TOKEN HUNT'),sb=o.querySelector('.sb'),e=evState();
  sb.innerHTML='';
  var h=el('div','',sb);h.style.textAlign='center';
  var dl=7-((Math.floor(Date.now()/864e5)+3)%7);
  h.innerHTML='<div class="evhead">'+tokEmoji()+'</div><b style="font-size:20px;color:var(--cream-ink)">'+e.n+' tokens this week</b><p class="note" style="margin:2px 0 6px">Land exactly on a '+tokEmoji()+' square to collect it before the computer players do. '+dl+' day'+(dl>1?'s':'')+' left.</p>';
  EVM.forEach(function(m,k){
    var got=e.cl.indexOf(k)>=0,can=e.n>=m.n&&!got,row=el('div','ptier'+(got?' got':''),sb);row.style.marginTop='6px';
    row.innerHTML='<span class="tn" style="width:46px;border-radius:12px">'+m.n+'</span><span class="rw">'+rwText(m)+'</span>';
    var b=el('button','mini'+(can?'':' gr'),row);b.type='button';b.textContent=got?'✓':(can?'Claim':Math.min(e.n,m.n)+'/'+m.n);b.disabled=!can;
    b.addEventListener('click',function(){if(e.cl.indexOf(k)>=0)return;e.cl.push(k);var ok=claimR(m);sfx.home();toast(rwText(m)+(ok?'':' (chest slots full)'));evDot();openEvent();});
  });
  var n=el('p','note',sb);n.textContent='Tokens appear in games against the computer. The hunt restarts every Monday.';
  openSheet('ov-event');
}
V2.openEvent=openEvent;
function evClaimable(){var e=evState();return EVM.filter(function(m,k){return e.n>=m.n&&e.cl.indexOf(k)<0;}).length;}

/* ---------- home: Pass and Events buttons, chest row ---------- */
(function(){
  var L=$('#h-coll').parentNode,R=$('#h-chest').parentNode;
  var bp=el('button','sbtn sb-pass',L);bp.type='button';bp.id='h-pass';bp.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4z"/><path d="M12 7v12" stroke-dasharray="2 2"/></svg>Pass';
  var be=el('button','sbtn sb-ev',R);be.type='button';be.id='h-ev';be.innerHTML='<span style="font-size:26px;line-height:1">'+tokEmoji()+'</span>Events';
  bp.addEventListener('click',function(){ensureAudio();openPass();});
  be.addEventListener('click',function(){ensureAudio();openEvent();});
  var row=el('div','hchests',null);row.id='h-chests';
  var dots=$('#h-dots');dots.parentNode.insertBefore(row,dots.nextSibling);
})();
function passDot(){var b=$('#h-pass');if(b)b.classList.toggle('dot2',passClaimable()>0);}
function evDot(){var b=$('#h-ev');if(b)b.classList.toggle('dot2',evClaimable()>0);}
function chestRow(){
  var row=$('#h-chests');if(!row||$('#ov-welcome').hidden)return;
  var act=activeChest();row.innerHTML='';
  set.slots.forEach(function(s,i){
    var b=el('button',s?'':'empty',row);b.type='button';
    if(!s){b.innerHTML='<span style="font-size:22px">🔒</span>Empty';b.addEventListener('click',function(){toast('Finish a game to earn a chest.');});return;}
    var left=slotLeft(s),ready=s.s&&left<=0;
    b.innerHTML=chestSvg(s.t,ready)+'<small>'+(ready?'OPEN!':(s.s?fmt(left):(act>=0?CHESTS[s.t].n:'Start')))+'</small>';
    if(ready)b.classList.add('ready');
    b.addEventListener('click',function(){
      if(ready){openChest(i);chestRow();return;}
      if(!s.s&&act<0){s.s=Date.now();save();chestRow();toast(CHESTS[s.t].n+' chest is opening.');return;}
      storeTop='chest';renderColl();openSheet('ov-coll');
    });
  });
}
V2.chestRow=chestRow;
setInterval(function(){chestRow();passDot();evDot();},1000);
chestRow();passDot();evDot();

/* ---------- daily bonus: claim double with a video ---------- */
V2.renderDaily=renderDaily;
renderDaily=function(){
  V2.renderDaily();
  if(dailyTab!=='cal')return;var i=calInfo();if(i.claimed)return;
  var box=$('#d-body'),main=box.querySelector('.btn');
  var b=el('button','btn',null);b.type='button';b.style.marginTop='8px';b.style.background='linear-gradient(#ffcb3a,#f08a12)';b.textContent='▶ Watch a video: claim 2×';
  box.insertBefore(b,main?main.nextSibling:null);
  b.addEventListener('click',function(){Ads.reward(function(ok){if(!ok){toast('The video did not finish.');return;}var j=calInfo();if(j.claimed)return;var r=CAL[j.day-1];calClaim();if(r.c)set.coins+=r.c;if(r.g)set.gems+=r.g;save();refreshStars();toast('Doubled! Day '+j.day+' reward ×2');renderDaily();});});
};

/* ---------- item sheet: make it my goal ---------- */
V2.renderItemBtns=renderItemBtns;
renderItemBtns=function(){
  V2.renderItemBtns();
  if(!itemCtx)return;var cat=itemCtx.cat,it=itemCtx.it;if(!it||owned(cat,it.id)||!(it.c>0))return;
  var box=$('#i-btns'),key=cat+':'+it.id,b=el('button','btn ghost',box);b.type='button';
  b.textContent=set.goal===key?'✓ This is your goal':'🎯 Make this my goal';
  b.addEventListener('click',function(){set.goal=key;save();renderItemBtns();toast('Goal set: '+it.name);});
};

/* ---------- teach-as-you-play tutorial ---------- */
var tut={rolls:0,bumpShown:false};
setInterval(function(){
  if(set.tut){if(tut.hid!==1){handHide();tut.hid=1;}return;}
  if($('#intro')||document.querySelector('.overlay:not([hidden])')||S.mode!=='cpu'||!S.players.length||S.phase==='idle'||S.phase==='over'){handHide();return;}
  var pl=cur();if(!pl||!mine(pl)||pl.bot){handHide();return;}
  if(S.phase==='roll'){
    if(tut.rolls>=4){set.tut=true;save();handHide();toast('You’re ready! Tap How to play in the menu any time.');return;}
    var r=dieEl.getBoundingClientRect();if(r.width)handShow(r.left+r.width/2,r.top+r.height/2,tut.rolls===0?'Tap the dice to roll!':'Your turn: tap the dice');
  }else if(S.phase==='move'){
    var seat=ctlSeat(pl),bump=-1;
    (S.legal||[]).forEach(function(i){var st=S.pawns[seat][i],to=st<0?0:st+S.roll;if(to<=50){var t=(START[seat]+to)%52;if(!SAFE.has(t)&&captureList(seat,t,false).length)bump=i;}});
    var pw=bump>=0?PW[seat][bump].el:document.querySelector('.pawn.can');
    if(pw){var q=pw.getBoundingClientRect(),vic='';
      if(bump>=0){var st2=S.pawns[seat][bump],t2=(START[seat]+(st2<0?0:st2+S.roll))%52,cl=captureList(seat,t2,false);vic=cl.length?nameOf(seatPl(cl[0].s)||{}):'';}
      handShow(q.left+q.width/2,q.top+q.height*.55,bump>=0?'Move here to bump '+(vic||'a rival')+'!':(S.roll===6&&S.pawns[seat].some(function(x){return x===-1;})?'You rolled a 6! Tap a pawn to bring it out':'Tap a glowing pawn to move it'));}
    else handHide();
  }else handHide();
},300);
V2.humanRoll=humanRoll;
humanRoll=function(){var pl=cur();if(!set.tut&&S.phase==='roll'&&pl&&mine(pl))tut.rolls++;V2.humanRoll();};
window.__ludoraV2=V2;
})();
