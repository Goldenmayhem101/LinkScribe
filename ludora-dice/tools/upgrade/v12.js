/* ===================== v1.9: custom frames, animated emojis & gifts, new dice, dice viewer, Events Hub, Weekly + Mini events, Inbox ===================== */
(function(){
var UI='ui/v19/';
window.__gdOff=window.__gdOff||{r5_03:1}; /* guardians without a real animation yet (Frost Queen) */
var ANIM={};'face02 face03 face09 face11 face12 face18 face19 face21 face25 g01 g02 g03 g04 g05 g06 g07 g08 g09 g10 g11 g12 g13 g14 g15 g16 g17 g18 g20 g21 g22 g23 g24 g25 r1_01 r1_02 r1_03 r1_04 r1_05 r2_01 r2_02 r2_03 r2_04 r2_05 r3_01 r3_02 r3_03 r3_04 r3_05 r4a01 r4a02 r4a03 r4b01 r4b02 r5_01 r5_02 r5_04 r5_05 st_cat01 st_cat02 st_cat03 st_cat04 st_cat05 st_dice01 st_dice02 st_dice03 st_dice04 st_dice05 st_dragon01 st_dragon02 st_dragon03 st_dragon04 st_dragon05 st_penguin01 st_penguin02 st_penguin03 st_penguin04 st_puppy01 st_puppy02 st_puppy03 st_puppy04 st_puppy05'.split(' ').forEach(function(k){ANIM[k]=1;});
function aImg(id,c){return '<img class="ean '+(c||'')+'" alt="" draggable="false" src="'+((window.__animURL||{})[id]||UI+'anim/'+id+'.webp')+'">';}
function q(s,r){return (r||document).querySelector(s);}
function mk(tag,cls,html,par){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;if(par)par.appendChild(e);return e;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function dayKey(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function weekNo(){return Math.floor((Date.now()/864e5+3)/7);}
function msLeft(t){t=Math.max(0,t);var d=Math.floor(t/864e5),h=Math.floor(t%864e5/36e5),m=Math.floor(t%36e5/6e4),s=Math.floor(t%6e4/1e3);return d?d+'d '+h+'h':h?h+'h '+m+'m':m+'m '+s+'s';}
function rng(seed){return function(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};}
function watch(done){Ads.reward(function(ok){if(!ok){toast('The video did not finish.');return;}done();});}
var RARC={common:['#5b6fe8','#2c3bb0'],rare:['#3db6ff','#1a5fd0'],epic:['#b45cff','#5a1fb0'],legendary:['#ffcf3a','#ff5aa0','#7a3dff']};

/* ---------- 1. new dice (25 Rare with dots, 25 Legendary with glowing numbers; 10 old Legendary get new art) ---------- */
var GD=D19.GD;
var PRICE={common:{c:1000000,g:0},rare:{c:5000000,g:0},epic:{c:0,g:4000},legendary:{c:0,g:6000}};
(function(){
  D19.DICE.forEach(function(d){
    var it=ITEMS.die.filter(function(x){return x.id===d[0];})[0];
    var p=PRICE[d[2]]||PRICE.rare;
    if(!it){it={id:d[0],name:d[1],r:d[2],c:p.c,g:p.g};ITEMS.die.push(it);}
    it.name=d[1];it.r=d[2];it.c=p.c;it.g=p.g;it.v19=1;
    it.d=d[2]==='legendary'?'Glowing numbers and its own guardian: '+(GD[d[0]]?GD[d[0]][1]:'')+'. Tap ▶ to call it!':'Polished and precious, with easy-to-read dots.';
  });
})();

/* ---------- 2. picture frames (99) ---------- */
var FRT={common:{c:250000,g:0},rare:{c:1000000,g:0},epic:{c:0,g:2500},legendary:{c:0,g:5000}};
var FTAG={common:'Clean and simple.',rare:'Cute and colourful.',epic:'Crafted with care, with a soft glow.',legendary:'Majestic, glowing and alive.'};
(function(){
  var old=ITEMS.frame.slice(),oldOwn={};
  old.forEach(function(f){if(set.own.indexOf('frame:'+f.id)>=0)oldOwn[f.id]=f.r||'common';});
  ITEMS.frame.length=0;
  D19.FR.forEach(function(f,i){var p=FRT[f[2]];var free=f[0]==='c1_01'||f[0]==='c1_02';
    var a=AT19.M[f[0]];ITEMS.frame.push({id:'F'+f[0],name:f[1],r:f[2],c:free?0:p.c,g:free?0:p.g,img:UI+'at/'+a[0]+'.webp',bp:(a[1]*50)+'% '+(a[2]*50)+'%',hole:AT19.FH[f[0]],fxc:f[4],d:FTAG[f[2]]});});
  ['Fc1_01','Fc1_02'].forEach(function(id){if(set.own.indexOf('frame:'+id)<0)set.own.push('frame:'+id);});
  if(!set.fm19){
    // swap each old frame for a new one of the same rarity
    Object.keys(oldOwn).forEach(function(id){var t=oldOwn[id]==='common'&&old.filter(function(f){return f.id===id;})[0].c===0?null:oldOwn[id];if(!t)return;
      var n=ITEMS.frame.filter(function(f){return f.r===t&&set.own.indexOf('frame:'+f.id)<0;})[0];if(n)set.own.push('frame:'+n.id);});
    set.fm19=1;
  }
  if(!ITEMS.frame.some(function(f){return String(f.id)===String(set.eq.frame);}))set.eq.frame='Fc1_01';
  save();
})();
var fsp0=frameStyleParts;
frameStyleParts=function(it){
  if(!it||!it.img)return fsp0.apply(this,arguments);
  var h=it.hole||[.18,.2,.82,.83],w=(h[2]-h[0])*0.94,hh=(h[3]-h[1])*0.94,W=100/w,H=100/hh;
  var fx=it.fxc||'transparent',lg=it.r==='legendary',ep=it.r==='epic';
  return [['--fr','transparent'],['--fbs','auto'],['--fsh','none'],['--fd','none'],['--fz','auto'],['--fa','none'],
    ['--fimg',"url('"+it.img+"')"],['--fbp',it.bp||'0 0'],['--fw',W.toFixed(1)+'%'],['--fh',H.toFixed(1)+'%'],['--fl',(-(h[0]+(h[2]-h[0])*0.03)*W).toFixed(1)+'%'],['--ft',(-(h[1]+(h[3]-h[1])*0.03)*H).toFixed(1)+'%'],
    ['--fglow',(lg||ep)?fx:'transparent'],['--fsp',lg?'1':'0']];
};

(function(){
  function sync(){document.querySelectorAll('[style*="--fimg"]').forEach(function(e){var f=e.querySelector(':scope>.fr19');
    var lg=e.style.getPropertyValue('--fsp').trim()==='1';
    if(!f){f=document.createElement('span');f.className='fr19';e.appendChild(f);}f.classList.toggle('lg',lg);});}
  setInterval(sync,400);window.__fr19=sync;
})();
(function(){
  var sg=startGame;startGame=function(){var r=sg.apply(this,arguments);
    try{if(S.mode==='cpu'){var fr=ITEMS.frame.filter(function(f){return f.r!=='common';});S.players.forEach(function(pl){if(pl.bot&&!pl.you&&pl.look)pl.look.f=String(fr[Math.floor(Math.random()*fr.length)].id);});renderSeats();}}catch(e){}
    return r;};
})();
/* ---------- 3. animated emojis (175): image reactions, packs, unlock by video, diamonds or events ---------- */
var EK={},EINFO={},PACK={},EPACK={};
D19.EM.forEach(function(e){EK[e[0]]=EMOJI.length;EMOJI.push('§'+e[0]);EINFO[e[0]]={n:e[1],a:e[2],t:e[3]};});
D19.PACKS.forEach(function(p){PACK[p[0]]={id:p[0],n:p[1],ids:p[2],k:p[3]};p[2].forEach(function(id){EPACK[id]=p[0];});});
var FREEE=['pka01','pka02','pka03','pka04','pka05','face01','face04','face07','face19','face20','face14'];
function eKey(s){return typeof s==='string'&&s.charAt(0)==='§'?s.slice(1):null;}
function eOwned(id){return FREEE.indexOf(id)>=0||!!(set.e19&&set.e19[id]===true);}
function eAds(id){var p=PACK[EPACK[id]];return p&&p.k==='faces'?8:10;}
function packPrice(p){return p.k==='faces'?0:p.k==='event'?0:180;}
function faceCost(id){return 40;}
function eGive(id){set.e19=set.e19||{};set.e19[id]=true;}
function atSt(id){var a=AT19.M[id];if(!a)return '';var x=a[3]>1?a[1]/(a[3]-1)*100:0,y=a[4]>1?a[2]/(a[4]-1)*100:0;return "background-image:url('"+UI+"at/"+a[0]+".webp');background-size:"+(a[3]*100)+"% "+(a[4]*100)+"%;background-position:"+x.toFixed(2)+"% "+y.toFixed(2)+"%";}
function eImg(id,cls){return '<span class="eim '+(cls||'')+'" style="'+atSt(id)+'"></span>';}
var OLD2NEW={'😀':'pka01','😂':'face01','😍':'pka04','😮':'pka05','😢':'pka02','👍':'face20','🥳':'face16','🎉':'face16','🔥':'pka03','💪':'face13','😎':'face13','❤️':'pka04','😜':'face12','🤯':'face08','👏':'face19','🙌':'face16'};
var eok0=emoOwnedK;
emoOwnedK=function(k){var id=eKey(EMOJI[k]);if(id)return eOwned(id);return eok0.apply(this,arguments);};
function myEmojis(){return D19.EM.map(function(e){return e[0];}).filter(eOwned);}
var sr0=showReaction;
showReaction=function(seat,e){
  if(typeof e==='string'&&OLD2NEW[e])e='§'+OLD2NEW[e];
  var id=eKey(e);
  if(!id)return sr0.apply(this,arguments);
  if(S.mute&&S.mute[seat])return;
  var av=SEATEL[seat]&&SEATEL[seat].querySelector('.av');if(!av)return;
  av.querySelectorAll('.r19').forEach(function(x){x.remove();});
  var inf=EINFO[id]||{a:'laugh'},vid=ANIM[id],r=vid?mk('span','react r19 ea-vid','<span class="r19in">'+aImg(id)+'</span>',av):mk('span','react r19 ea-'+inf.a,'<span class="r19in">'+eImg(id)+'<i class="fx1"></i><i class="fx2"></i><i class="fx3"></i></span>',av);
  try{sfx.pop();}catch(x){}
  setTimeout(function(){r.remove();},vid?4100:2600);
  try{track('emo',1,seat);}catch(x){}
};
buildTray=function(){
  var tray=$('#emo');if(!tray)return;tray.innerHTML='';tray.classList.add('big','t19');
  var tabs=mk('div','etabs',null,tray),grid=mk('div','egrid e19g',null,tray);
  var cats=[{n:'Mine',ids:myEmojis()}];
  D19.PACKS.forEach(function(p){var o=p[2].filter(eOwned);if(o.length)cats.push({n:p[1].replace(' Pack','').replace(' Stickers',' ✨'),ids:p[2]});});
  if(emoTab>=cats.length)emoTab=0;
  function fill(){grid.innerHTML='';
    cats[emoTab].ids.forEach(function(id){var b=mk('button',eOwned(id)?'':'lk',eImg(id),grid);b.type='button';b.dataset.k=EK[id];b.setAttribute('aria-label',(EINFO[id]||{}).n||id);});
    tabs.querySelectorAll('button').forEach(function(t,i){t.setAttribute('aria-pressed',String(i===emoTab));});grid.scrollTop=0;}
  cats.forEach(function(c,i){var t=mk('button','',esc(c.n),tabs);t.type='button';t.addEventListener('click',function(ev){ev.stopPropagation();emoTab=i;fill();});});
  var more=mk('button','e19more','+ Get more',tabs);more.type='button';more.addEventListener('click',function(ev){ev.stopPropagation();if(S.phase&&S.phase!=='over'&&!q('#ov-welcome').hidden===false){toast('Get more emojis in the Store after the game.');return;}openEmoStore();});
  fill();
};
function openEmoStore(){try{storeTop='shop';collTab='emo';renderColl();openSheet('ov-coll');}catch(e){}}
/* emoji store tab: packs with flip-through previews */
var rs19=renderShop;
renderShop=function(box){
  if(collTab!=='emo')return rs19.apply(this,arguments);
  var tot=D19.EM.length,own=myEmojis().length;
  var h=mk('div','s19head','<b>Emojis</b><span>'+own+' / '+tot+' owned</span>',box);h.style.gridColumn='1/-1';
  var n=mk('p','note','Every emoji is animated. Unlock single emojis with videos, buy whole packs with diamonds, or win sticker packs in the Weekly Event.',box);n.style.cssText='grid-column:1/-1;text-align:center;margin:0 0 6px';
  D19.PACKS.forEach(function(p){
    var pk=PACK[p[0]],o=pk.ids.filter(eOwned).length,c=mk('button','item e19pack k-'+pk.k,null,box);c.type='button';
    var pv=mk('div','pv e19pv',null,c);pk.ids.slice(0,pk.k==='faces'?4:5).forEach(function(id,i){pv.insertAdjacentHTML('beforeend',eImg(id,'e19m m'+i));});
    mk('span','rar',pk.k==='event'?'Event':pk.k==='faces'?'Singles':'Pack',c).style.background=pk.k==='event'?'#ff7a1a':pk.k==='faces'?'#2fb4ff':'#c25bff';
    mk('div','',esc(pk.n),c);
    mk('div','tagrow',o>=pk.ids.length?'Owned':(o+' / '+pk.ids.length+(pk.k==='pack'?' · '+gm(packPrice(pk)):pk.k==='event'?' · Event':'')),c);
    c.addEventListener('click',function(){openPack(pk.id,0);});
  });
};
function openPack(pid,idx){
  var pk=PACK[pid],o=q('#ov-pk19');
  if(!o){o=mk('div','overlay pk19',null,document.body);o.id='ov-pk19';o.hidden=true;o.style.zIndex=70;
    o.innerHTML='<div class="pk19in"><button class="close" type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="pk19t"></div><div class="pk19s"></div><div class="pk19st"><button class="pk19a l" type="button" aria-label="Previous">‹</button><div class="pk19big"></div><button class="pk19a r" type="button" aria-label="Next">›</button></div><div class="pk19n"></div><p class="pk19tip"></p><div class="pk19dots"></div><div class="pk19btn"></div></div>';
    o.querySelector('.close').addEventListener('click',function(){o.hidden=true;try{renderColl();}catch(e){}});
  }
  var ids=pk.ids;idx=(idx+ids.length)%ids.length;var id=ids[idx],inf=EINFO[id];
  o.querySelector('.pk19t').textContent=pk.n;o.querySelector('.pk19s').textContent=pk.k==='event'?'Event exclusive':pk.k==='faces'?'Classic faces':'Emoji pack';
  o.className='overlay pk19 k-'+pk.k;
  o.querySelector('.pk19big').innerHTML=ANIM[id]?'<span class="r19 big ea-vid"><span class="r19in">'+aImg(id)+'</span></span>':'<span class="r19 big ea-'+inf.a+'"><span class="r19in">'+eImg(id)+'<i class="fx1"></i><i class="fx2"></i><i class="fx3"></i></span></span>';
  o.querySelector('.pk19n').textContent=inf.n;o.querySelector('.pk19tip').textContent=inf.t;
  o.querySelector('.pk19dots').innerHTML=ids.map(function(x,i){return '<i class="'+(i===idx?'on':'')+(eOwned(x)?' have':'')+'"></i>';}).join('');
  o.querySelector('.pk19a.l').onclick=function(){openPack(pid,idx-1);};o.querySelector('.pk19a.r').onclick=function(){openPack(pid,idx+1);};
  var bx=o.querySelector('.pk19btn');bx.innerHTML='';
  if(eOwned(id))mk('div','pk19own','✓ You own this emoji',bx);
  else if(pk.k==='event')mk('div','pk19own ev','🏆 Win this pack in the Weekly Event',bx);
  else{
    set.e19v=set.e19v||{};var have=set.e19v[id]||0,need=eAds(id);
    var b=mk('button','btn','▶ Watch video '+have+' / '+need,bx);b.type='button';
    b.addEventListener('click',function(){watch(function(){set.e19v[id]=(set.e19v[id]||0)+1;if(set.e19v[id]>=need){eGive(id);toast(inf.n+' unlocked!');try{sfx.home();}catch(e){}}save();buildTray();openPack(pid,idx);});});
    if(pk.k==='faces'){var c=faceCost(id),b2=mk('button','btn gembtn','Buy '+gm(c),bx);b2.type='button';b2.disabled=set.gems<c;b2.addEventListener('click',function(){if(set.gems<c)return;set.gems-=c;eGive(id);save();refreshStars();buildTray();toast(inf.n+' unlocked!');openPack(pid,idx);});}
  }
  if(pk.k==='pack'&&ids.some(function(x){return !eOwned(x);})){var pc=packPrice(pk),b3=mk('button','btn gembtn','Buy whole pack '+gm(pc),bx);b3.type='button';b3.disabled=set.gems<pc;
    b3.addEventListener('click',function(){if(set.gems<pc)return;set.gems-=pc;ids.forEach(eGive);save();refreshStars();buildTray();toast(pk.n+' unlocked!');try{sfx.win();}catch(e){}openPack(pid,idx);});}
  o.hidden=false;
}

/* ---------- 4. animated gifts (25), paid with diamonds ---------- */
var GINFO={};D19.GIFT.forEach(function(g){GINFO[g[0]]={n:g[1],p:g[2],a:g[3]};});
function gImg(id){return '<span class="eim" style="'+atSt(id)+'"></span>';}
var giftTo=-1;
function others(){return S.players.filter(function(p){return !(mine(p)&&!p.bot);});}
function avCenter(seat){var a=SEATEL[seat]&&SEATEL[seat].querySelector('.av');if(!a)return null;var r=a.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];}
function gSheet(){
  var o=document.getElementById('ov-gift19');if(o)return o;
  o=mk('div','overlay g19',null,document.body);o.id='ov-gift19';o.hidden=true;o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.style.zIndex=62;
  o.innerHTML='<div class="sheet"><h2 class="ribbon">SEND A GIFT</h2><button class="close" type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="sb"></div></div>';
  o.querySelector('.close').addEventListener('click',function(){closeSheet('ov-gift19');});return o;
}
function openGift19(to){
  if(!S.players.length||S.mode==='pass')return;
  var o=gSheet(),sb=o.querySelector('.sb');giftTo=to;
  function draw(){
    sb.innerHTML='';
    var ch=mk('div','tchips',null,sb);
    var b0=mk('button','','Send to all',ch);b0.type='button';b0.setAttribute('aria-pressed',String(giftTo<0));b0.addEventListener('click',function(){giftTo=-1;draw();});
    others().forEach(function(p){var b=mk('button','',esc(nameOf(p)),ch);b.type='button';b.setAttribute('aria-pressed',String(giftTo===p.seat));b.addEventListener('click',function(){giftTo=p.seat;draw();});});
    var n=giftTo<0?others().length:1,g=mk('div','pgrid g19grid',null,sb);
    D19.GIFT.forEach(function(G){var cost=G[2]*n,b=mk('button','',gImg(G[0])+'<small>'+esc(G[1])+'</small><small>'+gm(cost)+'</small>',g);b.type='button';b.disabled=set.gems<cost;
      b.addEventListener('click',function(){sendGift19(G[0],giftTo);closeSheet('ov-gift19');});});
    mk('p','note','Gifts cost diamonds and play an animation on the player\u2019s picture. You have '+nf(set.gems)+' diamonds.',sb);
  }
  draw();openSheet('ov-gift19');
}
(function(){
  var g=document.getElementById('g-gift');if(g){var n=g.cloneNode(true);g.parentNode.replaceChild(n,g);n.addEventListener('click',function(){openGift19(-1);});}
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#ov-player .btn');if(b&&/gift/i.test(b.textContent)){e.stopImmediatePropagation();e.preventDefault();
    var s=-1;S.players.forEach(function(p){var pn=document.querySelector('#ov-player .phead b');if(pn&&pn.textContent.indexOf(nameOf(p))>=0)s=p.seat;});closeSheet('ov-player');openGift19(s);}},true);
})();
function sendGift19(gid,to){
  var G=GINFO[gid];if(!G)return;
  var list=to<0?others():others().filter(function(p){return p.seat===to;});
  var cost=G.p*list.length;if(!list.length||set.gems<cost){toast('Not enough diamonds.');return;}
  set.gems-=cost;save();refreshStars();try{stat('gf',list.length);}catch(e){}track('gift',list.length);
  var meSeat=(S.players.filter(function(p){return mine(p)&&!p.bot;})[0]||{seat:3}).seat,from=avCenter(meSeat)||[innerWidth/2,innerHeight-80];
  list.forEach(function(p,k){
    var to2=avCenter(p.seat);if(!to2)return;
    var f=mk('div','flygift fg19',gImg(gid),document.body);f.style.left=(from[0]-26)+'px';f.style.top=(from[1]-26)+'px';
    setTimeout(function(){f.style.left=(to2[0]-26)+'px';f.style.top=(to2[1]-26)+'px';f.style.transform='scale(1.35) rotate(360deg)';},30+k*120);
    setTimeout(function(){f.remove();S.gifts=S.gifts||{};S.gifts[p.seat]='\u00a7'+gid;renderSeats();giftLand(p.seat,gid);
      if(p.bot&&Math.random()<.75)setTimeout(function(){showReaction(p.seat,'\u00a7'+(Math.random()<.5?'pka04':'face19'));},900);},900+k*120);
  });
}
function giftLand(seat,gid){
  var av=SEATEL[seat]&&SEATEL[seat].querySelector('.av');if(!av)return;var G=GINFO[gid];
  var vid=ANIM[gid],fx=mk('span','gl19 '+(vid?'ga-vid':'ga-'+G.a),(vid?aImg(gid):gImg(gid))+'<i></i><i></i><i></i><i></i><i></i><i></i>',av);
  try{(G.a==='splat'?sfx.bump:sfx.pop)();}catch(e){}
  setTimeout(function(){fx.remove();},vid?3600:1800);
}
var rsx=renderSeats;
renderSeats=function(){var r=rsx.apply(this,arguments);
  try{document.querySelectorAll('.gbadge').forEach(function(b){var t=b.textContent;if(t&&t.charAt(0)==='§'){var id=t.slice(1);b.textContent='';b.innerHTML=gImg(id);b.classList.add('gb19');}});}catch(e){}
  return r;};

/* ---------- 5. event tracking (games, wins, captures, sixes, pawns home, videos, gifts, emojis) ---------- */
var TR={};
function inGame(){var w=q('#ov-welcome');return w&&w.hidden&&S.players&&S.players.length&&S.phase!=='over';}
function track(k,n,seat){
  n=n||1;
  if(seat!=null){var pl=seatPl(seat);if(!pl||!mine(pl)||pl.bot)return;}
  wkAdd(k,n);mnAdd(k,n);
}
(function(){
  var r0=Ads.reward;Ads.reward=function(done){return r0.call(Ads,function(ok){if(ok)try{track('vid',1);}catch(e){}done(ok);});};
  ['bump','six','home'].forEach(function(k){var f=sfx[k];if(!f)return;sfx[k]=function(){var r=f.apply(this,arguments);
    try{if(inGame()){var c=cur();if(c&&mine(c)&&!c.bot){
      if(k==='bump')track('cap',1);
      if(k==='home')track('home',1);
      if(k==='six'){track('six',1);var t=Date.now();if(TR.six&&TR.sixSeat===c.seat&&t-TR.six<9000){track('six2',1);TR.six=0;}else{TR.six=t;TR.sixSeat=c.seat;}}
    }}}catch(e){}return r;};});
  var lv=luckyValue;luckyValue=function(pl){var v=lv.apply(this,arguments);try{if(v&&pl&&mine(pl)&&!pl.bot)track('lucky',1);}catch(e){}return v;};
  var sw=showWin;showWin=function(pl){var r=sw.apply(this,arguments);
    try{if(S.mode!=='pass'&&TR.gid!==S.gid){TR.gid=S.gid;track('play',1);if(sideMine(pl.seat))track('win',1);if(S.mode==='online')track('online',1);}}catch(e){}
    return r;};
})();

/* ---------- 6. Weekly Event: 7 milestones x 3 tasks, timers, rewards, a Rare dice to keep ---------- */
var THEMES=[['Desert Dash','wk1','#ff9a1f'],['Pirate Plunder','wk2','#1f8ce0'],['Frost Fortress','wk3','#5fb8ff'],['Candy Rush','wk4','#ff5ab0']];
var TASKS={play:['Play {n} games',[1,2,3,4,5,6,8]],win:['Win {n} games',[1,1,2,2,3,3,4]],cap:['Capture {n} pawns',[2,3,4,6,8,10,12]],six:['Roll {n} sixes',[3,5,7,9,12,15,18]],
  home:['Bring {n} pawns home',[2,4,6,8,10,12,16]],six2:['Roll two sixes in a row {n} times',[1,1,2,2,3,3,4]],emo:['Send {n} emojis',[2,3,4,5,6,8,10]],
  gift:['Send {n} gifts',[1,1,1,2,2,2,3]],vid:['Watch {n} videos',[1,1,2,2,2,3,3]],online:['Play {n} online games',[1,1,1,2,2,2,3]]};
var WGAP=6*36e5;
function wk(){
  var w=weekNo();
  if(!set.wk||set.wk.id!==w){set.wk={id:w,m:0,p:{},t:0,cut:{}};save();}
  return set.wk;
}
function wkTheme(){return THEMES[weekNo()%THEMES.length];}
function wkTasks(j){
  var r=rng(weekNo()*97+j*13+5),keys=Object.keys(TASKS).filter(function(k){return k!=='online'||j>=2;}),out=[];
  if(j===0)out.push('play');
  while(out.length<3){var k=keys[Math.floor(r()*keys.length)];if(out.indexOf(k)<0)out.push(k);}
  return out.map(function(k){return {k:k,n:TASKS[k][1][j],t:TASKS[k][0].replace('{n}',TASKS[k][1][j])};});
}
/* grand prize rotates each week: an Epic dice, an Epic pawn, a Rare board or an Epic frame to keep (event-only items) */
function grand(w,r){
  var kinds=[['die','epic','Epic dice'],['pawn','epic','Epic pawn'],['board','rare','Rare board'],['frame','epic','Epic frame']],k=kinds[w%4];
  var pool=ITEMS[k[0]].filter(function(x){return x.r===k[1];}),fresh=pool.filter(function(x){return !owned(k[0],x.id);});
  var list=fresh.length?fresh:pool,it=list[Math.floor(r()*list.length)];
  return {keep:[k[0],it.id],g:100,t:it.name+' ('+k[2]+') to keep + 100 diamonds',it:[k[0],it]};
}
function wkPrize(j){
  var w=weekNo(),r=rng(w*31+7);
  var rare=ITEMS.die.filter(function(d){return d.v19&&d.r==='rare';}),epicP=ITEMS.pawn.filter(function(p){return p.r==='epic';});
  var d=rare[Math.floor(r()*rare.length)],p=epicP[Math.floor(r()*epicP.length)],sp=['st_cat','st_dice','st_dragon','st_penguin','st_puppy'][w%5];
  return [{c:25000,g:20,t:'25,000 coins + 20 diamonds'},{c:50000,t:'50,000 coins'},{chest:'silver',g:40,t:'Silver chest + 40 diamonds'},
    {trial:['pawn',p.id],t:p.name+' (Epic pawn) for 7 days',it:['pawn',p]},{c:100000,g:60,t:'100,000 coins + 60 diamonds'},
    {pack:sp,t:PACK[sp].n+' (animated, event only)'},grand(w,r)][j];
}
function wkAdd(k,n){var s=wk();if(s.m>=7)return;s.p[s.m]=s.p[s.m]||{};var ts=wkTasks(s.m);
  ts.forEach(function(t){if(t.k===k){s.p[s.m][k]=Math.min(t.n,(s.p[s.m][k]||0)+n);}});save();badgeSync();}
function wkDone(j){var s=wk(),pp=s.p[j]||{};return wkTasks(j).every(function(t){return (pp[t.k]||0)>=t.n;});}
function wkOpen(){var s=wk();return s.m<7&&Date.now()>=s.t;}
function give(rw){
  if(rw.c){set.coins+=rw.c;}if(rw.g){set.gems+=rw.g;}
  if(rw.lk){try{luckBank();}catch(e){}set.lk=Math.min(5,(+set.lk||0)+rw.lk);try{lkHomeSync();}catch(e){}}
  if(rw.chest){try{addChest(rw.chest);}catch(e){}}
  if(rw.trial){set.trial=set.trial||{};var k=rw.trial[0]+':'+rw.trial[1];if(set.own.indexOf(k)<0)set.trial[k]=Math.max(Date.now(),set.trial[k]||0)+7*864e5;}
  if(rw.keep){var k2=rw.keep[0]+':'+rw.keep[1];if(set.own.indexOf(k2)<0)set.own.push(k2);}
  if(rw.pack){PACK[rw.pack].ids.forEach(eGive);}
  save();refreshStars();try{buildTray();}catch(e){}
}
function openWeekly(){
  var o=fullSheet('ov-wk19','WEEKLY EVENT'),b=o.querySelector('.fs19b'),s=wk(),th=wkTheme(),end=(weekNo()+1)*7*864e5-3*864e5;
  b.innerHTML='';
  var hd=mk('div','wk19hd','<img alt="" src="'+UI+'ev/'+th[1]+'.webp"><div class="wk19tt"><b>'+esc(th[0])+'</b><span>Ends in '+msLeft(end-Date.now())+'</span></div>',b);
  var tr=mk('div','wk19track',null,b);
  for(var j=0;j<7;j++){(function(j){
    var rw=wkPrize(j),st=j<s.m?'done':j===s.m?(wkOpen()?'now':'wait'):'lock';
    var row=mk('div','wk19m s-'+st+(j===6?' final':''),null,tr);
    var node=mk('div','wk19n',j<s.m?'✓':String(j+1),row);
    var card=mk('div','wk19c',null,row);
    var rimg=rw.it?(rw.it[0]==='die'?'<div class="wk19ri dice" style="background-image:url(dice/'+rw.it[1].id+'.webp)"></div>':rw.it[0]==='board'?'<div class="wk19ri bd" style="background:url(boards/'+rw.it[1].id+'.webp) center/cover;border-radius:10px;border:2px solid #fff"></div>':rw.it[0]==='frame'?'<div class="wk19ri" style="'+atSt(String(rw.it[1].id).replace(/^F/,''))+'"></div>':'<div class="wk19ri">'+(window.__ludoraV9&&window.__ludoraV9.sprHTML?window.__ludoraV9.sprHTML(rw.it[1].id,'red'):'🎁')+'</div>'):rw.pack?'<div class="wk19ri">'+eImg(PACK[rw.pack].ids[1])+'</div>':rw.chest?'<div class="wk19ri"><img alt="" src="ui/ic/chest_'+rw.chest+'.webp"></div>':rw.lk?'<div class="wk19ri"><img alt="" src="ui/ic/clover.webp"></div>':'<div class="wk19ri"><img alt="" src="ui/ic/'+(rw.g&&!rw.c?'gems':'coins')+'.webp"></div>';
    card.innerHTML='<div class="wk19rw">'+rimg+'<div><small>'+(j===6?'GRAND PRIZE':'Milestone '+(j+1))+'</small><b>'+esc(rw.t)+'</b></div></div>';
    if(st==='now'||st==='done'){var tl=mk('div','wk19tasks',null,card),pp=s.p[j]||{};
      wkTasks(j).forEach(function(t){var v=Math.min(t.n,pp[t.k]||0);if(st==='done')v=t.n;mk('div','wk19t'+(v>=t.n?' ok':''),'<span>'+esc(t.t)+'</span><i><em style="width:'+(v/t.n*100)+'%"></em></i><b>'+v+'/'+t.n+'</b>',tl);});}
    if(st==='now'){var bt=mk('button','btn wk19cl',wkDone(j)?'Claim':'Keep playing!',card);bt.type='button';bt.disabled=!wkDone(j);
      bt.addEventListener('click',function(){if(!wkDone(j))return;give(rw);s.m++;s.t=Date.now()+(s.m<7?WGAP:0);save();try{sfx.win();}catch(e){}celebrate(rw.t);openWeekly();badgeSync();});}
    if(st==='wait'){var left=s.t-Date.now(),wb=mk('div','wk19wait','<span>Unlocks in <b class="cd" data-t="'+s.t+'">'+msLeft(left)+'</b></span>',card);
      s.cut[j]=s.cut[j]||0;if(s.cut[j]<3){var vb=mk('button','btn wk19vid','▶ −2 hours',wb);vb.type='button';vb.addEventListener('click',function(){watch(function(){s.cut[j]=(s.cut[j]||0)+1;s.t-=2*36e5;save();openWeekly();});});}}
    if(st==='lock')mk('div','wk19lk','🔒 Finish milestone '+j+' first',card);
  })(j);}
  if(s.m>=7)mk('div','wk19all','🏆 You finished this week’s event! A new one starts in '+msLeft(end-Date.now())+'.',b);
  mk('p','note wk19note','Play any mode except Pass & Play. Progress saves automatically.',b);
  o.hidden=false;var cur=tr.querySelector('.s-now,.s-wait');if(cur)setTimeout(function(){cur.scrollIntoView({block:'center'});},60);
}

/* ---------- 7. Mini Event (daily): points fill a chest through 10 steps ---------- */
var MSTEP=[10,25,45,70,100,140,190,250,320,400];
var MRW=[{c:5000,t:'5,000'},{g:10,t:'10 💎'},{c:15000,t:'15,000'},{c:20000,t:'20,000'},{g:25,t:'25 💎'},{c:40000,t:'40,000'},{chest:'iron',t:'Iron chest'},{g:50,t:'50 💎'},{c:80000,t:'80,000'},{c:150000,g:100,chest:'gold',t:'Grand chest'}];
var MPTS={play:2,win:6,cap:3,six2:4,home:2};
function mn(){var d=dayKey();if(!set.mn||set.mn.d!==d){set.mn={d:d,pts:0,cl:0,dbl:0,dv:0};save();}return set.mn;}
function mnAdd(k,n){if(!MPTS[k])return;var s=mn(),p=MPTS[k]*n*(Date.now()<s.dbl?2:1);s.pts+=p;save();badgeSync();
  try{if(inGame()&&p>0)floatPts('+'+p);}catch(e){}}
function floatPts(t){var f=mk('div','mn19pop','<img alt="" src="'+UI+'ev/ic02.webp">'+t,document.body);setTimeout(function(){f.remove();},1500);}
function openMini(){
  var o=fullSheet('ov-mn19','MINI EVENT'),b=o.querySelector('.fs19b'),s=mn(),end=new Date();end.setHours(24,0,0,0);
  b.innerHTML='';
  mk('div','mn19hd','<img alt="" src="'+UI+'ev/mini.webp"><div class="wk19tt"><b>Tiny Trouble</b><span>Ends in '+msLeft(end-Date.now())+'</span></div>',b);
  var top=mk('div','mn19top','<img class="mn19ch" alt="" src="'+UI+'ev/minichest.webp"><div class="mn19pt"><small>Your points</small><b>'+nf(s.pts)+'</b></div>',b);
  var dbl=Date.now()<s.dbl;
  var db=mk('button','btn mn19dbl',dbl?'2× points on: '+msLeft(s.dbl-Date.now()):'▶ Double points for 30 min ('+(3-s.dv)+' left)',top);db.type='button';db.disabled=dbl||s.dv>=3;
  db.addEventListener('click',function(){watch(function(){s.dv++;s.dbl=Date.now()+30*6e4;save();openMini();});});
  var how=mk('div','mn19how',null,b);
  [['Capture a pawn',MPTS.cap],['Two sixes in a row',MPTS.six2],['Pawn reaches home',MPTS.home],['Win a game',MPTS.win],['Play a game',MPTS.play]].forEach(function(x){mk('span','',esc(x[0])+' <b>+'+x[1]+'</b>',how);});
  var path=mk('div','mn19path',null,b);
  MSTEP.forEach(function(need,i){var rw=MRW[i],ok=s.pts>=need,cl=i<s.cl;
    var st=mk('div','mn19s'+(cl?' cl':ok&&i===s.cl?' rd':'')+(i===9?' big':''),'<i><em style="width:'+Math.min(100,s.pts/need*100)+'%"></em></i><b>'+need+'</b><span>'+(i===9?'<img alt="" src="'+UI+'ev/minichest.webp">':'')+esc(rw.t)+'</span>',path);
    if(!cl&&ok&&i===s.cl){var bt=mk('button','btn','Claim',st);bt.type='button';bt.addEventListener('click',function(){give(rw);s.cl++;save();try{sfx.win();}catch(e){}celebrate(rw.t);openMini();badgeSync();});}
    if(cl)mk('em','mn19ok','✓',st);
  });
  o.hidden=false;
}

/* ---------- 8. Inbox: updates from the studio + friend requests ---------- */
var NEWS=[
 {id:'n19a',t:'Ludora 1.9 is here!',b:'New Events Hub with a Weekly Event and a daily Mini Event, 175 animated emojis, 25 animated gifts, 99 new frames, 50 new dice and a 3D dice viewer. Have fun!',d:'Nov 2026'},
 {id:'n19b',t:'Legendary dice have guardians',b:'Legendary dice have their own guardians. Open a Legendary dice in the Store and tap ▶ to call it.',d:'Nov 2026'},
 {id:'n19c',t:'Fair play promise',b:'Dice rolls are always random, the computer never cheats, and you only see a video when you choose to.',d:'Nov 2026'}];
function ibUnread(){var r=(set.ib&&set.ib.r)||[];return NEWS.filter(function(n){return r.indexOf(n.id)<0;}).length+reqs().length;}
function reqs(){try{return (set.freq||[]).filter(Boolean);}catch(e){return [];}}
function openInbox(tab){
  var o=fullSheet('ov-ib19','INBOX'),b=o.querySelector('.fs19b');tab=tab||'up';b.innerHTML='';
  mk('div','ib19hd','<img alt="" src="'+UI+'ev/inbox.webp">',b);
  var tb=mk('div','seg ib19tabs','<button type="button" data-v="req" aria-pressed="'+(tab==='req')+'">Requests'+(reqs().length?' ('+reqs().length+')':'')+'</button><button type="button" data-v="up" aria-pressed="'+(tab==='up')+'">Updates</button>',b);
  tb.addEventListener('click',function(e){var x=e.target.closest('button');if(x)openInbox(x.dataset.v);});
  var list=mk('div','ib19list',null,b);
  if(tab==='up'){set.ib=set.ib||{r:[]};NEWS.forEach(function(n){var nw=set.ib.r.indexOf(n.id)<0;mk('div','ib19msg'+(nw?' new':''),'<img alt="" src="'+UI+'ev/ic06.webp"><div><b>'+esc(n.t)+'</b><p>'+esc(n.b)+'</p><small>'+esc(n.d)+'</small></div>',list);if(nw)set.ib.r.push(n.id);});save();}
  else{var rq=reqs();if(!rq.length)mk('div','ib19empty','<b>No friend requests yet</b><p>When someone you played online adds you as a friend, it shows up here.</p>',list);
    rq.forEach(function(r,i){var m=mk('div','ib19msg','<img alt="" src="'+UI+'ev/ic06.webp"><div><b>'+esc(r.n||'Player')+'</b><p>wants to be your friend</p></div>',list);
      var a=mk('button','btn','Accept',m);a.type='button';a.addEventListener('click',function(){set.fr=set.fr||[];set.fr.push(r);set.freq.splice(i,1);save();openInbox('req');toast('Friend added');});});}
  badgeSync();o.hidden=false;
}

/* ---------- 9. Events Hub ---------- */
function fullSheet(id,title){
  var o=q('#'+id);
  if(!o){o=mk('div','overlay fs19',null,document.body);o.id=id;o.hidden=true;o.style.zIndex=66;
    o.innerHTML='<div class="fs19in"><div class="fs19hd"><button type="button" class="su7back" aria-label="Back">&#8249;</button><h2></h2><span class="fs19bal"><span class="bal"><i class="cn"></i> <b class="coincount"></b></span><span class="bal"><i class="gm"></i> <b class="gemcount"></b></span></span></div><div class="fs19b"></div></div>';
    o.querySelector('.su7back').addEventListener('click',function(){o.hidden=true;if(id!=='ov-hub19'&&!q('#ov-hub19').hidden)openHub();badgeSync();});}
  o.querySelector('h2').textContent=title;refreshStars();return o;
}
function vidLeft(k){var d=dayKey();set.vd=set.vd&&set.vd.d===d?set.vd:{d:d,c:0,g:0};return 10-(set.vd[k]||0);}
function freeVid(k,after){
  if(vidLeft(k)<=0){toast('That’s all for today. Come back tomorrow!');return;}
  watch(function(){set.vd[k]=(set.vd[k]||0)+1;if(k==='c'){set.coins+=2000;toast('+2,000 coins');}else{set.gems+=10;toast('+10 diamonds');}save();refreshStars();try{sfx.home();}catch(e){}if(after)after();badgeSync();});
}
function openHub(){
  var o=fullSheet('ov-hub19','EVENTS HUB'),b=o.querySelector('.fs19b');b.innerHTML='';
  mk('div','hub19ban','<img alt="" src="'+UI+'ev/hub.webp"><b>EVENTS HUB</b>',b);
  var g=mk('div','hub19g',null,b),s=wk(),m=mn(),th=wkTheme(),end=(weekNo()+1)*7*864e5-3*864e5,de=new Date();de.setHours(24,0,0,0);
  function card(o2){
    var c=mk('button','hub19c '+(o2.cls||''),'<span class="hub19ic"><img alt="" src="'+UI+'ev/'+o2.ic+'.webp"></span>'+(o2.k?'<em class="hub19k">'+esc(o2.k)+'</em>':'')+'<b>'+esc(o2.t)+'</b><small>'+o2.s+'</small>'+(o2.p!=null?'<i class="hub19p"><em style="width:'+Math.round(o2.p*100)+'%"></em></i>':'')+'<span class="hub19btn'+(o2.claim?' cl':'')+'">'+(o2.claim?'Claim':o2.btn||'Open')+'</span>'+(o2.claim?'<span class="hub19dot"></span>':''),g);
    c.type='button';c.addEventListener('click',o2.go);return c;
  }
  var wkReady=s.m<7&&wkOpen()&&wkDone(s.m);
  card({cls:'wide wk',ic:'ic01',k:'Weekly Event',t:th[0],s:s.m>=7?'All 7 milestones done!':'Milestone '+(s.m+1)+' / 7 · Ends in '+msLeft(end-Date.now()),p:s.m/7,claim:wkReady,go:function(){openWeekly();}}).style.setProperty('--bg','url('+UI+'ev/'+th[1]+'.webp)');
  var nxt=MSTEP[Math.min(m.cl,9)];
  card({cls:'wide mn',ic:'ic02',k:'Mini Event',t:'Tiny Trouble',s:nf(m.pts)+' points · Ends in '+msLeft(de-Date.now()),p:m.cl>=10?1:Math.min(1,m.pts/nxt),claim:m.cl<10&&m.pts>=nxt,go:function(){openMini();}}).style.setProperty('--bg','url('+UI+'ev/mini.webp)');
  card({ic:'ic03',t:'Season Pass',s:'Free rewards as you level up',go:function(){clickReal('h-pass');}});
  card({ic:'ic04',t:'Token Hunt',s:'Collect tokens on the board',go:function(){clickReal('h-ev');}});
  card({ic:'ic05',t:'Daily Goals',s:'Small goals, big rewards',go:function(){clickReal('h-chest');setTimeout(function(){var t=[].filter.call(document.querySelectorAll('.overlay:not([hidden]) button'),function(x){return /goal/i.test(x.textContent);})[0];if(t)t.click();},250);}});
  card({ic:'ic07',t:'Daily Rewards',s:'7-day calendar and chests',go:function(){clickReal('h-chest');}});
  card({cls:'vid',ic:'ic08',t:'Get 2,000 coins',s:vidLeft('c')+' videos left today',btn:'▶ Watch',go:function(){freeVid('c',openHub);}});
  card({cls:'vid',ic:'ic09',t:'Get 10 diamonds',s:vidLeft('g')+' videos left today',btn:'▶ Watch',go:function(){freeVid('g',openHub);}});
  card({cls:'wide ib',ic:'ic06',t:'Inbox',s:ibUnread()?ibUnread()+' new':'Updates and friend requests',claim:false,btn:'Open',go:function(){openInbox();}});
  o.hidden=false;badgeSync();
}
function clickReal(id){var b=document.getElementById(id);if(b){REAL=1;b.click();REAL=0;}}
var REAL=0;
function hubBadge(){var s=wk(),m=mn();return (s.m<7&&wkOpen()&&wkDone(s.m)?1:0)+(m.cl<10&&m.pts>=MSTEP[Math.min(m.cl,9)]?1:0);}
function badgeSync(){
  try{var n=hubBadge();document.querySelectorAll('.hub19bd').forEach(function(x){x.textContent=n||'';x.hidden=!n;});
    var u=ibUnread();document.querySelectorAll('.ib19bd').forEach(function(x){x.textContent=u||'';x.hidden=!u;});
    document.querySelectorAll('.vid19c').forEach(function(x){x.querySelector('small').textContent=vidLeft('c')+'/10';});
    document.querySelectorAll('.vid19g').forEach(function(x){x.querySelector('small').textContent=vidLeft('g')+'/10';});}catch(e){}
}
function celebrate(t){
  var c=mk('div','cel19','<div class="cel19in"><div class="cel19rays"></div><b>REWARD!</b><span>'+esc(t)+'</span></div>',document.body);
  for(var i=0;i<26;i++){var p=mk('i','',null,c.firstChild);p.style.setProperty('--x',(Math.random()*2-1).toFixed(2));p.style.setProperty('--d',(Math.random()*.4).toFixed(2)+'s');p.style.background=['#ffd23a','#ff5a7a','#4fd8ff','#7aff8a','#c78aff'][i%5];}
  c.addEventListener('click',function(){c.remove();});setTimeout(function(){c.remove();},2400);
}
/* home: Events tile + tab open the hub; free coins + free diamonds videos; inbox button */
(function(){
  function hook(el){if(!el||el.__h19)return;el.__h19=1;el.addEventListener('click',function(e){if(REAL)return;e.stopImmediatePropagation();e.preventDefault();openHub();},true);
    if(!el.querySelector('.hub19bd')){var bd=mk('span','hub19bd',null,el);bd.hidden=true;}}
  function setup(){
    document.querySelectorAll('.t9.pink,.tb9 button').forEach(function(b){if(/Events/.test(b.textContent))hook(b);});
    var free=[].filter.call(document.querySelectorAll('.t9.green'),function(b){return /FREE/.test(b.textContent);})[0];
    if(free&&!free.__v19){free.__v19=1;free.classList.add('vid19c');free.innerHTML='<img alt="" src="'+UI+'ev/ic08.webp"><b class="lt9 g">2K</b><small></small>';
      free.addEventListener('click',function(e){e.stopImmediatePropagation();e.preventDefault();freeVid('c');},true);
      var gb=free.cloneNode(true);gb.__v19=1;gb.classList.remove('vid19c');gb.classList.add('vid19g');gb.classList.replace('green','blue19');gb.innerHTML='<img alt="" src="'+UI+'ev/ic09.webp"><b class="lt9 b">💎10</b><small></small>';gb.setAttribute('aria-label','Free diamonds with a video');
      gb.addEventListener('click',function(e){e.stopImmediatePropagation();e.preventDefault();freeVid('g');},true);free.parentNode.insertBefore(gb,free.nextSibling);}
    var med=[].filter.call(document.querySelectorAll('.t9.purple'),function(b){return /Medals/.test(b.textContent);})[0];
    if(med&&!med.parentNode.querySelector('.ib19t')){var ib=mk('button','t9 red19 ib19t','<img alt="" src="'+UI+'ev/ic06.webp"><b class="lt9 y">Inbox</b><span class="ib19bd" hidden></span>',null);ib.type='button';ib.setAttribute('aria-label','Inbox');
      med.parentNode.insertBefore(ib,med.nextSibling);ib.addEventListener('click',function(){openInbox();});}
    badgeSync();
  }
  setup();setInterval(setup,1500);setInterval(function(){badgeSync();document.querySelectorAll('.cd[data-t]').forEach(function(x){x.textContent=msLeft(+x.dataset.t-Date.now());});},1000);
})();

/* ---------- 10. store: filters, owned count, search; full-screen dice viewer with swipe-to-spin and guardian reveal ---------- */
var SF={own:false,r:'all',s:''};
var rcol=renderColl;
renderColl=function(){var r=rcol.apply(this,arguments);try{if(!q('#c-items input[type=search]'))storeBar();}catch(e){}return r;};
function storeBar(){
  if(storeTop!=='shop'||collTab==='emo')return;var box=q('#c-items');if(!box)return;
  var cards=[].slice.call(box.querySelectorAll('.item'));if(!cards.length)return;
  var list=ITEMS[collTab]||[],own=list.filter(function(it){return owned(collTab,it.id);}).length;
  var bar=mk('div','s19bar',null,null);bar.style.gridColumn='1/-1';
  bar.innerHTML='<div class="s19head"><b>'+({die:'Dice',pawn:'Pawns',board:'Boards',frame:'Frames'}[collTab]||'Items')+'</b><span>'+own+' / '+list.length+' owned</span></div><div class="s19f"><input type="search" id="s19q" placeholder="Search" value="'+esc(SF.s)+'" aria-label="Search the store"><select id="s19r" aria-label="Rarity"><option value="all">All rarities</option><option value="common">Common</option><option value="rare">Rare</option><option value="epic">Epic</option><option value="legendary">Legendary</option></select><button type="button" id="s19o" aria-pressed="'+SF.own+'">Owned</button></div>';
  box.insertBefore(bar,box.firstChild);
  bar.querySelector('#s19r').value=SF.r;
  function apply(){cards.forEach(function(c){var nm=(c.children[2]&&c.children[2].textContent||'').toLowerCase(),rr=(c.querySelector('.rar')||{}).textContent||'',tg=(c.querySelector('.tagrow')||{}).textContent||'';
    var ok=(!SF.s||nm.indexOf(SF.s.toLowerCase())>=0)&&(SF.r==='all'||rr.toLowerCase()===SF.r)&&(!SF.own||/Owned|Equipped/.test(tg));c.hidden=!ok;});}
  bar.querySelector('#s19q').addEventListener('input',function(){SF.s=this.value;apply();});
  bar.querySelector('#s19r').addEventListener('change',function(){SF.r=this.value;apply();});
  bar.querySelector('#s19o').addEventListener('click',function(){SF.own=!SF.own;this.setAttribute('aria-pressed',String(SF.own));apply();});
  apply();
}
var oi19=openItem;
openItem=function(cat,it){var r=oi19.apply(this,arguments);if(cat==='die')try{diceView(it);}catch(e){}return r;};
var DTAG={common:'Bold and easy to read.',rare:'Polished, precious and full of charm.',epic:'Themed design with big bold numbers.',legendary:'Glowing magic with a guardian inside.'};
function faceURL(id,n){var v=ITEMS.die.filter(function(d){return d.id===id;})[0];return v&&v.v19?UI+'dv/'+id+'_f'+n+'.webp':null;}
function diceView(it){
  var o=q('#dv19');
  if(!o){o=mk('div','dv19',null,document.body);o.id='dv19';o.hidden=true;
    o.innerHTML='<div class="dv19bg"></div><div class="dv19rays"></div><div class="dv19top"><b class="dv19n"></b><span class="dv19r"></span></div><div class="dv19stage"><div class="dv19cube"></div><div class="dv19gd"></div></div><p class="dv19tip"></p><div class="dv19ctl"><button type="button" class="dv19play" aria-label="Play animation">▶</button></div><p class="dv19hint">Swipe the dice to spin it</p><div class="dv19btns"><button type="button" class="btn dv19go">Buy or equip</button><button type="button" class="btn ghost dv19x">Close</button></div>';
    o.querySelector('.dv19x').addEventListener('click',function(){o.hidden=true;try{closeSheet('ov-item');}catch(e){}});
    o.querySelector('.dv19go').addEventListener('click',function(){
      var id=o.dataset.id,b=o.querySelector('.dv19go');
      if(id&&owned('die',id)){
        if(String(set.eq.die)!==String(id)){set.eq.die=String(id);save();try{applyCosmetics();}catch(e){}try{renderColl();}catch(e){}try{renderItemBtns();}catch(e){}
          var it=ITEMS.die.filter(function(d){return d.id===id;})[0];toast((it?it.name:'Dice')+' equipped');}
        b.textContent='Equipped';return;
      }
      o.hidden=true;});
    spinInit(o);}
  o.dataset.id=it.id;o.className='dv19 r-'+it.r;
  o.querySelector('.dv19n').textContent=it.name;o.querySelector('.dv19r').textContent=RAR[it.r].n;
  o.querySelector('.dv19tip').textContent=it.r==='legendary'&&GD[it.id]?'Guardian: '+GD[it.id][1]+'. '+DTAG[it.r]:DTAG[it.r];
  var cube=o.querySelector('.dv19cube');cube.innerHTML='';
  var rot=['rotateY(0deg)','rotateY(90deg)','rotateY(180deg)','rotateY(-90deg)','rotateX(90deg)','rotateX(-90deg)'],order=[1,3,6,4,2,5];
  for(var i=0;i<6;i++){var f=mk('div','dv19f',null,cube);var u=faceURL(it.id,order[i]);
    if(u){f.style.backgroundImage="url('"+UI+"dv6/"+it.id+".webp')";f.style.backgroundSize='600% 100%';f.style.backgroundPosition=((order[i]-1)/5*100)+'% 0';}else{f.style.backgroundImage='url(dice/'+it.id+'.webp)';f.style.backgroundSize='1800% 100%';f.style.backgroundPosition=((11+order[i])/17*100)+'% 0';}
    f.style.transform=rot[i]+' translateZ(var(--hz))';}
  o.querySelector('.dv19gd').innerHTML='';
  o.querySelector('.dv19play').hidden=!(it.r==='legendary'&&GD[it.id]&&!(window.__gdOff||{})[GD[it.id][0]]);
  o.querySelector('.dv19play').onclick=function(){reveal(o,it);};
  try{var gk=GD[it.id]&&GD[it.id][0];if(gk&&ANIM[gk])(new Image()).src=UI+'gd/'+gk+'.webp';}catch(e){}
  var own=owned('die',it.id);o.querySelector('.dv19go').textContent=own?(String(set.eq.die)===String(it.id)?'Equipped':'Equip'):'Buy';
  SP.rx=-24;SP.ry=35;SP.vy=.6;SP.vx=0;o.hidden=false;
}
var SP={rx:-24,ry:35,vx:0,vy:.6,drag:0,raf:0};
function spinInit(o){
  var st=o.querySelector('.dv19stage'),cube=o.querySelector('.dv19cube'),lx,ly,lt;
  function tick(){if(!o.hidden&&!SP.busy){if(!SP.drag){SP.ry+=SP.vy;SP.rx+=SP.vx;SP.vy+=( .6-SP.vy)*.02;SP.vx*=.95;SP.rx+=(-24-SP.rx)*.01;}cube.style.transform='rotateX('+SP.rx+'deg) rotateY('+SP.ry+'deg)';}requestAnimationFrame(tick);}
  requestAnimationFrame(tick);
  st.addEventListener('pointerdown',function(e){SP.drag=1;lx=e.clientX;ly=e.clientY;lt=Date.now();st.setPointerCapture(e.pointerId);SP.vy=0;SP.vx=0;});
  st.addEventListener('pointermove',function(e){if(!SP.drag)return;var dx=e.clientX-lx,dy=e.clientY-ly,dt=Math.max(1,Date.now()-lt);SP.ry+=dx*.6;SP.rx-=dy*.6;SP.vy=dx*.6*16/dt;SP.vx=-dy*.6*16/dt;lx=e.clientX;ly=e.clientY;lt=Date.now();});
  ['pointerup','pointercancel'].forEach(function(t){st.addEventListener(t,function(){SP.drag=0;SP.vy=Math.max(-40,Math.min(40,SP.vy));SP.vx=Math.max(-30,Math.min(30,SP.vx));});});
}
function reveal(o,it){
  if(SP.busy)return;SP.busy=1;var g=GD[it.id],gd=o.querySelector('.dv19gd'),cube=o.querySelector('.dv19cube');
  o.classList.add('rv');try{ensureAudio();sfx.six();}catch(e){}
  gd.innerHTML='<div class="gd19flash"></div><div class="gd19burst"></div><img class="gd19img" alt="" src="'+UI+'gd/'+g[0]+'.webp"><div class="gd19name">'+esc(g[1])+'</div>'+new Array(18).join('<i class="gd19p"></i>');
  gd.querySelectorAll('.gd19p').forEach(function(p,i){p.style.setProperty('--a',(i*21)+'deg');p.style.setProperty('--d',(Math.random()*.6).toFixed(2)+'s');});
  cube.classList.add('shake');
  setTimeout(function(){cube.classList.remove('shake');cube.classList.add('pop');try{sfx.win();}catch(e){}},700);
  setTimeout(function(){cube.classList.remove('pop');o.classList.remove('rv');gd.innerHTML='';SP.busy=0;},5200);
}

/* ---------- 11. welcome gift uses the new wooden chest ---------- */
(function(){
  function fix(){var c=q('.giftov #gf-chest');if(c&&!c.__v19){c.__v19=1;c.innerHTML='<img class="gf19" alt="" src="ui/ic/chest_wood.webp"><span class="gf19g"></span>';c.classList.add('gf19b');}}
  new MutationObserver(fix).observe(document.body,{childList:true});fix();
})();

window.__l19={THEMES:THEMES,NEWS:NEWS,ANIM:ANIM,sendGift:sendGift19,openHub:openHub,openWeekly:openWeekly,openMini:openMini,openInbox:openInbox,diceView:diceView,openPack:openPack,track:track,wk:wk,mn:mn,celebrate:celebrate};
try{buildTray();}catch(e){}
})();
