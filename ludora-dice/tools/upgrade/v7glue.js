/* ---------- shared bits ---------- */
var V7={};window.__ludoraV7=V7;
function q7(s,r){return (r||document).querySelector(s);}
function mk7(tag,cls,html,parent){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;if(parent)parent.appendChild(e);return e;}
function svgUrl(svg){return 'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';}
document.body.classList.add('lt7');

/* ---------- profile picture: people, blank, or own photo ---------- */
if(set.av==null)set.av='h'+Math.floor(Math.random()*PEOPLE.length);
function avSvg(id){id=id||set.av;if(id==='blank')return BLANK;var k=+String(id).slice(1);return person(PEOPLE[k]||PEOPLE[0]);}
function myPicHtml(){return set.photo?'<img alt="" class="photo" src="'+set.photo+'">':avSvg();}
var BOTAV=[7,13,9,2];
V7.avSvg=avSvg;

/* ---------- frames: the equipped store frame drawn around the picture ---------- */
function frameItem(){return curItem('frame');}
function paintFramed(el,extra){
  var it=frameItem();el.style.setProperty('--fc',it.css||'#ffd35c');
  el.innerHTML='<span class="in">'+myPicHtml()+'</span>'+(window.frameDecoHtml?frameDecoHtml(it):'')+(extra||'');
}

/* ---------- pawn colours: blue, yellow, green, red + "your own colour" ---------- */
var STD={blue:3,red:0,green:1,yellow:2};
var CUSTOM=[['white','White','#e6e9f0','#ffffff'],['purple','Purple','#8a3ee0','#d2b4ff'],['orange','Orange','#ff8a1a','#ffc48a'],['pink','Pink','#ff4aa0','#ffb0d6'],['teal','Teal','#14b8a6','#8ae8dc'],['black','Black','#33363f','#a0a4b0'],['brown','Brown','#8a4a1e','#d8a880'],['gold','Gold','#e0a810','#ffe08a'],['sky','Sky','#38bdf8','#b4e8ff'],['lime','Lime','#84cc16','#d4f5a0']];
PCOLORS.length=0;
PCOLORS.push({id:'nat',n:'Natural',f:'',sw:'conic-gradient(#ff5a5a,#ffd24a,#6cf28a,#4cc9ff,#b06bff,#ff5a5a)'});
['red','green','yellow','blue'].forEach(function(k,s){PCOLORS.push({id:k,n:k.charAt(0).toUpperCase()+k.slice(1),f:'',sw:SEAT0.hex[s],hex:SEAT0.hex[s],lt:SEAT0.btc[s],std:s});});
CUSTOM.forEach(function(c){PCOLORS.push({id:c[0],n:c[1],f:'',sw:c[2],hex:c[2],lt:c[3]});});
if(!PCOLORS.some(function(c){return c.id===set.pc;}))set.pc='nat';
V7.colorName=['red','green','yellow','blue'];
/* give every seat a different colour: chosen colours first, the rest keep (or swap to) a free standard colour */
seatColorSync=function(){
  var want=[null,null,null,null],used={};
  S.players.forEach(function(pl){
    var lk=lookOf(pl),c=pcolor(lk.c);if(c.id==='nat')return;
    if(c.std==null&&pawnItem(lk.p).k)return;
    if(used[c.id])return;used[c.id]=1;want[pl.seat]=c;
  });
  var act=S.players.map(function(p){return p.seat;});
  for(var s=0;s<4;s++){if(want[s])continue;var mine0=PCOLORS[1+s];
    if(!used[mine0.id]){want[s]=mine0;used[mine0.id]=1;continue;}
    for(var k=0;k<4;k++){var c=PCOLORS[1+[3,0,1,2][k]];if(!used[c.id]){want[s]=c;used[c.id]=1;break;}}
  }
  var sig=want.map(function(c){return c?c.id:'-';}).join('');
  if(sig===seatSig)return;seatSig=sig;
  for(var s2=0;s2<4;s2++){var c2=want[s2]||PCOLORS[1+s2];
    SEATHEX[s2]=c2.hex;BTC[s2]=c2.lt||hx0(c2.hex);V7.colorName[s2]=c2.id;
    document.documentElement.style.setProperty('--'+SEATS[s2],c2.hex);}
  redrawBoard();
};
var apl7=applyPawnLooks;
applyPawnLooks=function(){
  apl7();
  S.players.forEach(function(pl){
    var lk=lookOf(pl),id=String(lk.p),cname=V7.colorName[pl.seat]||SEATS[pl.seat],u=null;
    if(id==='classic')u='pawns/'+cname+'.webp';
    else if(window.__ludoraPawnImg&&STD[cname]!=null)u=window.__ludoraPawnImg(id,cname);
    if(!u)return;
    for(var i=0;i<4;i++){var pw=PW[pl.seat][i];if(!pw)continue;pw.el.classList.add('g3');pw.el.classList.toggle('g3c',id!=='classic');pw.el.style.setProperty('--g3','url("'+u+'")');}
  });
};

myLook=function(){var d=String(curItem('die').id),p=String(curItem('pawn').id),c=pcolor(set.pc);if(pawnItem(p).k&&c.std==null)c=PCOLORS[0];return {d:d,dl:dieLevel(d),p:p,f:String(curItem('frame').id),c:c.id};};
/* ---------- seats in the game show people pictures too ---------- */
var rs7=renderSeats;
renderSeats=function(){
  rs7();
  S.players.forEach(function(pl){
    var d=SEATEL[pl.seat];if(!d)return;var ab=d.querySelector('.av b');if(!ab)return;
    var me=S.mode!=='pass'&&mine(pl)&&!pl.bot;
    if(!me||set.photo){var o=ab.querySelector('svg.me7');if(o)o.remove();return;}
    var k=set.av;if(ab.dataset.me7!==k||!ab.querySelector('svg.me7')){ab.dataset.me7=k;ab.innerHTML=avSvg().replace('<svg ','<svg class="face me7" ');}
    ab.style.color='transparent';
  });
};

/* ---------- chests: Iron, Silver, Gold from games; Crystal only from 500,000+ games ---------- */
CHESTS.wood={n:'Wooden',min:60,coins:[200,500],fr:0};
CHESTS.iron={n:'Iron',min:120,coins:[500,1000],fr:0};
CHESTS.silver={n:'Silver',min:240,coins:[1000,2500],fr:0};
CHESTS.royal={n:'Royal',min:300,coins:[2500,5000],fr:0};
CHESTS.gold={n:'Golden',min:480,coins:[5000,10000],fr:0};
CHESTS.crystal={n:'Crystal',min:720,coins:[15000,30000],fr:0};
var GEM7={wood:[1,3],iron:[2,4],silver:[3,6],royal:[5,10],gold:[8,15],crystal:[20,40]};
function rr7(a){return a[0]+Math.floor(Math.random()*(a[1]-a[0]+1));}
function dropOdds(stake){
  if(stake>=500000)return [['iron',15],['silver',35],['gold',40],['crystal',10]];
  if(stake>=50000)return [['iron',25],['silver',45],['gold',30]];
  if(stake>=1000)return [['iron',45],['silver',40],['gold',15]];
  return [['iron',70],['silver',25],['gold',5]];
}
V7.dropOdds=dropOdds;
function pickTier(stake){var o=dropOdds(stake),r=Math.random()*100;for(var i=0;i<o.length;i++){r-=o[i][1];if(r<0)return o[i][0];}return o[0][0];}
V7.pickTier=pickTier;
dropChest=function(you){
  if(!you)return;
  var t=pickTier(S.stake||0);
  for(var i=0;i<4;i++)if(!set.slots[i]){set.slots[i]={t:t,s:0,f:S.stake||0};save();toast('You won a '+CHESTS[t].n+' chest!');renderChests7();return;}
  toast('Chest slots are full. Open one to make room.');
};
openChest=function(i){
  var s=set.slots[i];if(!s||!s.s||slotLeft(s)>0)return;
  var c=rr7(CHESTS[s.t].coins),g=rr7(GEM7[s.t]||[1,2]);
  set.slots[i]=null;set.coins+=c;set.gems+=g;save();refreshStars();
  try{dgAdd('o',1);}catch(e){}try{sfx.home();}catch(e){}
  chestWin7(-1,{t:s.t,c:c,g:g});renderChests7();try{dailyDotSync();}catch(e){}
};
function chestWin7(i,res){
  var o=q7('#ov-chest7');
  if(!o){o=mk7('div','overlay','',document.body);o.id='ov-chest7';o.style.zIndex=64;o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');
    o.innerHTML='<div class="sheet c7sheet"><h2 class="ribbon"></h2><button class="close" type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="sb"></div></div>';
    o.querySelector('.close').addEventListener('click',function(){clearInterval(V7.cwT);closeSheet('ov-chest7');});}
  clearInterval(V7.cwT);
  var sb=o.querySelector('.sb'),t=res.t,C=CHESTS[t];
  o.querySelector('.sheet').style.setProperty('--tile',CH2[t]?CH2[t].tile:'#fff');
  o.querySelector('.ribbon').textContent=(C.n+' chest').toUpperCase();
  function draw(){
    var s=i>=0?set.slots[i]:null,ready=s&&s.s&&slotLeft(s)<=0,running=s&&s.s&&!ready,act=activeChest();
    var h='<div class="c7big'+(res.c!=null||ready?' ready':'')+'">'+chestSvg(t,res.c!=null||ready)+'</div>';
    if(res.c!=null){
      h+='<b class="c7h">You got</b><div class="c7in"><span>'+cn(res.c)+'</span><span>'+gm(res.g)+'</span></div><button type="button" class="c7btn green" data-a="ok">COLLECT</button>';
    }else{
      h+='<div class="c7in"><span>'+cn(C.coins[0])+' – '+nf(C.coins[1])+'</span><span>'+gm(GEM7[t][0])+' – '+GEM7[t][1]+'</span></div>';
      if(s&&s.f)h+='<p class="c7from">Won in a 🪙 '+nf(s.f)+' game</p>';
      if(ready)h+='<button type="button" class="c7btn green" data-a="open">OPEN</button>';
      else if(s){
        if(running)h+='<p class="c7left">Opens in <b data-cw>'+fmt(slotLeft(s))+'</b></p>';
        else h+='<button type="button" class="c7btn yellow" data-a="start"'+(act>=0?' disabled':'')+'>'+(act>=0?'Another chest is unlocking':'START UNLOCK · '+hm7(C.min))+'</button>';
        h+='<button type="button" class="c7btn blue" data-a="vid">▶ OPEN NOW · watch a video</button>';
      }
    }
    sb.innerHTML=h;
    sb.querySelectorAll('[data-a]').forEach(function(b){b.addEventListener('click',function(){
      var a=b.dataset.a,s2=i>=0?set.slots[i]:null;
      if(a==='ok'){closeSheet('ov-chest7');return;}
      if(a==='open'){closeSheet('ov-chest7');openChest(i);return;}
      if(a==='start'&&s2){s2.s=Date.now();save();draw();renderChests7();return;}
      if(a==='vid'&&s2){Ads.reward(function(ok){if(!ok){toast('The video did not finish.');return;}s2.s=Date.now()-CHESTS[s2.t].min*60000-1;save();closeSheet('ov-chest7');openChest(i);});}
    });});
  }
  draw();
  V7.cwT=setInterval(function(){var e=sb.querySelector('[data-cw]');var s=i>=0?set.slots[i]:null;if(!e||!s)return;var l=slotLeft(s);if(l<=0)draw();else e.textContent=fmt(l);},1000);
  openSheet('ov-chest7');
}
function hm7(min){var h=Math.floor(min/60),m=min%60;return (h?h+'h':'')+(m?' '+m+'m':'');}
V7.chestWin=chestWin7;
chestInfo=function(t){var i=set.slots.findIndex(function(s){return s&&s.t===t;});chestWin7(i,{t:t});};
function renderChests7(){
  var cr=q7('#h7-chests');if(!cr)return;
  var act=activeChest(),key=set.slots.map(function(s){return s&&CHESTS[s.t]?s.t+(s.s?(slotLeft(s)<=0?'R':'S'):'W'):'-';}).join('|')+act;
  if(cr.dataset.k===key){cr.querySelectorAll('[data-tm]').forEach(function(e){var s=set.slots[+e.dataset.tm];if(s&&s.s)e.textContent='⏱ '+fmt(slotLeft(s));});return;}
  cr.dataset.k=key;
  var html='';
  for(var i=0;i<4;i++){var s=set.slots[i];
    if(!s||!CHESTS[s.t]){html+='<button type="button" class="ch7 empty" data-i="'+i+'"><span class="lk">🔒</span><small>Win a game<br>to get a chest</small></button>';continue;}
    var ready=s.s&&slotLeft(s)<=0,pill=ready?'<span class="p7pill go">OPEN!</span>':s.s?'<span class="p7pill tm" data-tm="'+i+'">⏱ '+fmt(slotLeft(s))+'</span>':'<span class="p7pill st">'+(act>=0?'Waiting':'▶ '+hm7(CHESTS[s.t].min))+'</span>';
    html+='<button type="button" class="ch7'+(ready?' ready':'')+'" data-i="'+i+'" style="--tile:'+(CH2[s.t]?CH2[s.t].tile:'#fff')+'"><span class="cn7">'+CHESTS[s.t].n+'</span>'+chestSvg(s.t,ready)+pill+'</button>';}
  cr.innerHTML=html;
}
V7.renderChests=renderChests7;V7.noPlayers=function(){noPlayers7(2,'classic',3);};

/* ---------- winner takes all, also online; online winners earn chests too ---------- */
var sw7=showWin;
showWin=function(pl){
  sw7(pl);
  if(S.mode==='online'&&S.dropped!==S.gid){S.dropped=S.gid;dropChest(sideMine(pl.seat));}
};

/* big amounts on the home money bar: 1.25M instead of a cut-off number */
function short7(n){n=+n||0;if(n>=1e9)return (Math.floor(n/1e7)/100)+'B';if(n>=1e6)return (Math.floor(n/1e4)/100)+'M';return nf(n);}
var rfs7=refreshStars;
refreshStars=function(){rfs7();document.querySelectorAll('.h7 .coincount').forEach(function(e){e.textContent=short7(set.coins);});document.querySelectorAll('.h7 .gemcount').forEach(function(e){e.textContent=short7(set.gems);});};
/* ---------- home ---------- */
function personBadge(i,css){return '<span class="pb7" style="'+css+'">'+person(PEOPLE[i])+'</span>';}
(function(){
  var main=q7('#w-main');if(!main)return;main.classList.add('home7');
  var h=mk7('div','h7',null,main);
  var gear=q7('.h3gear');
  h.innerHTML=
   '<div class="h7top"><button type="button" class="fr7 h7me" aria-label="Your profile"></button>'+
   '<div class="h7money"><span class="h7cur"><i class="cn"></i><b class="coincount">0</b><button type="button" class="h7plus" aria-label="Get more coins">+</button></span><span class="h7cur"><i class="gm"></i><b class="gemcount">0</b><button type="button" class="h7plus" aria-label="Get more diamonds">+</button></span></div>'+
   '<button type="button" class="h7gear" aria-label="Settings">'+(gear?gear.innerHTML:'⚙')+'</button></div>'+
   '<div class="h7mid"><div class="h7col l"></div><div class="h7col r"></div><div class="h7car"><div class="h7track" id="h7-track"></div>'+
   '<button type="button" class="h7arr p" aria-label="Previous">&#8249;</button><button type="button" class="h7arr n" aria-label="Next">&#8250;</button><div class="h7dots" id="h7-dots"></div></div></div>'+
   '<div class="h7chests" id="h7-chests"></div>';
  var L=q7('.h7col.l',h),R=q7('.h7col.r',h);
  [['h-coll',L],['h-chest',L],['h-luck',L],['h-pass',R],['h-ev',R]].forEach(function(p){var b=document.getElementById(p[0]);if(!b)return;var w=b.closest('.ticw')||b;p[1].appendChild(w);});
  var robot=(window.__ludoraPawnImg&&window.__ludoraPawnImg('robot','blue'))||'';
  var CARDS=[
   ['online','blue','Online','2 or 4 players','<span class="h7globe">🌍</span>'+personBadge(4,'width:34%;left:4%;bottom:6%')+personBadge(11,'width:34%;right:4%;bottom:6%')],
   ['cpu','gold','Vs Computer','2 to 4 players','<span class="h7dice"></span>'+personBadge(0,'width:40%;left:6%;bottom:8%')+(robot?'<img alt="" src="'+robot+'" class="h7bot">':'')],
   ['team','purple','Team 2 vs 2','You and a partner',personBadge(3,'width:30%;left:4%;top:4%')+personBadge(1,'width:30%;left:16%;bottom:6%')+'<span class="h7vs">VS</span>'+personBadge(2,'width:30%;right:4%;top:4%')+personBadge(9,'width:30%;right:16%;bottom:6%')],
   ['pass','pink','Pass &amp; Play','Friends on one phone','<span class="h7phone">📱</span>'+personBadge(5,'width:34%;left:4%;bottom:6%')+personBadge(7,'width:34%;right:4%;bottom:6%')]];
  var tr=q7('#h7-track',h),dots=q7('#h7-dots',h);
  CARDS.forEach(function(c){var sl=mk7('div','h7slide',null,tr);var b=mk7('button','h7card '+c[1],'<span class="h7art">'+c[4]+'</span><b>'+c[2]+'</b><small>'+c[3]+'</small>',sl);b.type='button';b.dataset.k=c[0];b.addEventListener('click',function(){ensureAudio();openSetup7(c[0]);});mk7('i','',null,dots);});
  function idx(){return Math.round(tr.scrollLeft/Math.max(1,tr.clientWidth));}
  function go(d){var n=(idx()+d+4)%4;tr.scrollTo({left:n*tr.clientWidth,behavior:'smooth'});}
  function dotSync(){var k=idx();[].forEach.call(dots.children,function(d,i){d.classList.toggle('on',i===k);});}
  tr.addEventListener('scroll',dotSync);dotSync();
  q7('.h7arr.p',h).addEventListener('click',function(){go(-1);});q7('.h7arr.n',h).addEventListener('click',function(){go(1);});
  q7('.h7me',h).addEventListener('click',function(){var b=q7('#h-prof');if(b)b.click();});
  q7('.h7gear',h).addEventListener('click',function(){var g=q7('.h3gear');if(g)g.click();else{var b=q7('#b-settings');if(b)b.click();}});
  h.querySelectorAll('.h7plus').forEach(function(b){b.addEventListener('click',function(){storeTop='special';renderColl();openSheet('ov-coll');});});
  q7('#h7-chests',h).addEventListener('click',function(e){var b=e.target.closest('.ch7');if(!b)return;var i=+b.dataset.i,s=set.slots[i];if(!s){toast('Win a game to get a chest.');return;}chestWin7(i,{t:s.t});});
  function me(){var it=frameItem(),k=(set.photo?'p':set.av)+'|'+it.id;var b=q7('.h7me',h);if(b.dataset.k!==k){b.dataset.k=k;var L2=window.__ludoraV2&&window.__ludoraV2.lvl?window.__ludoraV2.lvl():{l:1};paintFramed(b,'<span class="lv7">'+L2.l+'</span>');}}
  V7.homeMe=function(){var b=q7('.h7me');if(b)b.dataset.k='';me();};
  me();refreshStars();renderChests7();
  setInterval(function(){if(!q7('#ov-welcome').hidden){me();renderChests7();}},1000);
})();

/* ---------- setup screens ---------- */
var STEPS7=[0,100,500,1000,5000,10000,50000,100000,500000,1000000];
var ST7={kind:'cpu',n:4,mode:'classic',sub:'online',stake:0};
var KIND7={cpu:'Computer',team:'Team 2 vs 2',pass:'Pass & Play',online:'Online'};
var ROW7=['blue','yellow','green','red'];
function medSvg(k){return '<svg viewBox="0 0 80 80" aria-hidden="true">'+MART[k].a+'</svg>';}
function segHtml7(opts,cur){return opts.map(function(o){return '<button type="button" data-v="'+o[0]+'" aria-pressed="'+(String(o[0])===String(cur))+'">'+o[1]+'</button>';}).join('');}
(function(){
  var o=mk7('div','overlay su7',null,document.body);o.id='ov-setup7';o.hidden=true;o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.style.zIndex=58;
  o.innerHTML='<div class="su7in"><div class="su7hd"><button type="button" class="su7back" aria-label="Back">&#8249;</button><h2 id="su7-title"></h2><span class="su7coins"><i class="cn"></i><b class="coincount"></b></span></div>'+
   '<div class="su7seg" id="su7-seg"></div>'+
   '<div class="su7lbl">MODE <button type="button" class="su7i" aria-label="What this mode is">i</button></div>'+
   '<div class="su7mw"><div class="su7mrow" id="su7-mrow"></div></div><p class="su7mdesc" id="su7-mdesc"></p>'+
   '<div id="su7-pawns"><div class="su7grid" id="su7-grid"></div><div class="su7lbl" id="su7-clbl">YOUR COLOR</div><div class="su7crow" id="su7-crow"></div>'+
   '<div class="su7pal" id="su7-pal" hidden><button type="button" class="su7pa" data-d="-1" aria-label="Previous colour">&#8249;</button><div class="su7sw" id="su7-sw"></div><button type="button" class="su7pa" data-d="1" aria-label="Next colour">&#8250;</button></div><p class="su7hint" id="su7-hint"></p></div>'+
   '<div id="su7-bet"></div><button type="button" class="su7play" id="su7-play">PLAY</button><button type="button" class="su7join" id="su7-join" hidden>Have a room code? Join</button></div>'+
   '<div class="su7info" id="su7-info" hidden><div class="sheet"><button class="close" type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="su7med" id="su7-iart"></div><h3 id="su7-iname"></h3><ul id="su7-ilist"></ul></div></div>';
  q7('.su7back',o).addEventListener('click',function(){o.hidden=true;});
  q7('#su7-seg',o).addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(ST7.kind==='team')ST7.sub=b.dataset.v;else ST7.n=+b.dataset.v;render7();});
  var row=q7('#su7-mrow',o);
  row.innerHTML=MODE_ORDER.map(function(k){return '<button type="button" class="su7md" data-m="'+k+'" aria-label="'+MODES[k].n+'"><span class="med">'+medSvg(k)+'</span><span>'+MODES[k].n+'</span></button>';}).join('');
  row.addEventListener('click',function(e){var b=e.target.closest('.su7md');if(!b)return;ST7.mode=b.dataset.m;center7(true);});
  var t;row.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(function(){var mid=row.scrollLeft+row.clientWidth/2,best=null,bd=1e9;row.querySelectorAll('.su7md').forEach(function(b){var c=b.offsetLeft+b.offsetWidth/2,dd=Math.abs(c-mid);if(dd<bd){bd=dd;best=b;}});if(best&&best.dataset.m!==ST7.mode){ST7.mode=best.dataset.m;mark7();}},90);});
  q7('.su7i',o).addEventListener('click',function(){var m=MART[ST7.mode];q7('#su7-iart').innerHTML=medSvg(ST7.mode);q7('#su7-iname').textContent=MODES[ST7.mode].n;q7('#su7-ilist').innerHTML=m.r.map(function(x){return '<li>'+x+'</li>';}).join('');q7('#su7-info').hidden=false;});
  q7('#su7-info .close',o).addEventListener('click',function(){q7('#su7-info').hidden=true;});
  q7('#su7-crow',o).addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
    if(b.dataset.c==='own'){var cur=pcolor(set.pc);set.pc=(cur.std==null&&cur.id!=='nat')?cur.id:(set.pc7||'white');}
    else set.pc=b.dataset.c==='blue'?'nat':b.dataset.c;
    save();renderPawns7();});
  q7('#su7-sw',o).addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;set.pc=set.pc7=b.dataset.c;save();renderPawns7();});
  o.querySelectorAll('.su7pa').forEach(function(b){b.addEventListener('click',function(){var ids=CUSTOM.map(function(c){return c[0];}),k=ids.indexOf(set.pc);k=(k<0?0:k+ +b.dataset.d+ids.length)%ids.length;set.pc=set.pc7=ids[k];save();renderPawns7();});});
  q7('#su7-bet',o).addEventListener('click',function(e){var b=e.target.closest('[data-step]');if(!b||b.disabled)return;ST7.stake=Math.max(0,Math.min(STEPS7.length-1,ST7.stake+ +b.dataset.step));set.stk7=ST7.stake;save();renderBet7();renderPlay7();});
  q7('#su7-play',o).addEventListener('click',go7);
  q7('#su7-join',o).addEventListener('click',joinPrompt7);
})();
function openSetup7(kind){
  ST7.kind=kind;ST7.n=kind==='team'?4:(kind==='online'?2:(+set.n7||4));ST7.sub='online';
  if(ST7.stake==null||set.stk7!=null)ST7.stake=+set.stk7||0;
  if(ST7.kind==='pass')ST7.stake=0;
  q7('#su7-title').textContent=KIND7[kind];
  if(!MODES[ST7.mode])ST7.mode='classic';
  render7();q7('#ov-setup7').hidden=false;refreshStars();center7(false);
}
V7.openSetup=openSetup7;
function myColorId(){var c=pcolor(set.pc);return c.id==='nat'?'blue':c.id;}
function render7(){
  var seg=q7('#su7-seg');
  if(ST7.kind==='team')seg.innerHTML=segHtml7([['online','Online'],['friends','Friends']],ST7.sub);
  else if(ST7.kind==='pass')seg.innerHTML=segHtml7([[2,'2 Players'],[3,'3 Players'],[4,'4 Players']],ST7.n);
  else seg.innerHTML=segHtml7([[2,'2 Players'],[4,'4 Players']],ST7.n===3?4:ST7.n);
  if(ST7.kind!=='pass'&&ST7.n===3)ST7.n=4;
  q7('#su7-pawns').hidden=ST7.kind==='pass';
  renderPawns7();renderBet7();renderPlay7();
}
function renderPawns7(){
  var g=q7('#su7-grid'),you=myColorId(),c=pcolor(set.pc),youHex=c.id==='nat'?SEAT0.hex[3]:c.hex;
  var youStd=c.std!=null?c.std:(c.id==='nat'?3:3);
  if(ST7.kind==='cpu'){
    g.hidden=false;var cols=seatPreview(c),act=ST7.n===2?[1,3]:[0,1,2,3];
    g.innerHTML=[0,1,3,2].map(function(s){
      var isYou=s===3,dim=act.indexOf(s)<0,cc=cols[s];
      return '<div class="su7pw'+(isYou?' you':'')+(dim?' dim':'')+'" style="--pc:'+cc.hex+'"><img alt="" src="pawns/'+(dim?SEATS[s]:cc.id)+'.webp">'+(isYou?'<span class="tag">YOU</span>':(dim?'':'<span class="tag">COMPUTER</span>'))+'</div>';
    }).join('');
  }else{g.hidden=true;g.innerHTML='';}
  var cust=c.std==null&&c.id!=='nat',ownId=cust?c.id:(set.pc7||'white');
  q7('#su7-crow').innerHTML=ROW7.map(function(k){var on=!cust&&you===k;return '<button type="button" class="su7cp'+(on?' on':'')+'" data-c="'+k+'" aria-pressed="'+on+'" aria-label="'+k+'"><img alt="" src="pawns/'+k+'.webp"></button>';}).join('')+
    '<button type="button" class="su7cp own'+(cust?' on':'')+'" data-c="own" aria-pressed="'+cust+'" aria-label="Pick your own colour"><img alt="" src="pawns/'+ownId+'.webp"><span class="pen">🎨</span></button>';
  q7('#su7-pal').hidden=!cust;
  if(cust)q7('#su7-sw').innerHTML=CUSTOM.map(function(x){return '<button type="button" class="su7s'+(x[0]===c.id?' on':'')+'" data-c="'+x[0]+'" style="--pc:'+x[2]+'" aria-label="'+x[1]+'"></button>';}).join('');
  var hint='';
  if(pawnItem(curItem('pawn').id).k&&cust)hint='Your own colour works with the classic pawns.';
  else if(ST7.kind==='team')hint='Your partner sits across from you';
  q7('#su7-hint').textContent=hint;
}
/* who gets which colour: you sit bottom-left; a standard colour you take is swapped with that seat */
function seatPreview(c){
  var mine=c.id==='nat'?PCOLORS[4]:c,used={},out=[];used[mine.id]=1;out[3]=mine;
  for(var s=0;s<3;s++){var own=PCOLORS[1+s];if(!used[own.id]){out[s]=own;used[own.id]=1;continue;}
    for(var k=0;k<4;k++){var x=PCOLORS[1+[3,0,1,2][k]];if(!used[x.id]){out[s]=x;used[x.id]=1;break;}}}
  return out;
}
function stake7(){return ST7.kind==='pass'?0:STEPS7[ST7.stake]||0;}
function renderBet7(){
  var box=q7('#su7-bet');
  if(ST7.kind==='pass'){box.innerHTML='<div class="su7free">Friends on one phone · free game, no entry fee</div>';return;}
  var s=stake7(),team=ST7.kind==='team',n=team?4:ST7.n,pot=s*n,lock=s>set.coins;
  var why=s===0?'Free game':team?nf(s)+' × 4 players · '+nf(s*2)+' each':nf(s)+' × '+n+' players';
  box.innerHTML='<div class="su7bet"><div class="su7brow"><button type="button" class="su7step" data-step="-1" aria-label="Lower entry"'+(ST7.stake===0?' disabled':'')+'>−</button><div class="su7bval'+(lock?' lock':'')+'"><small>ENTRY</small><b>'+(s?cn(s):'FREE')+(lock?' 🔒':'')+'</b></div><button type="button" class="su7step" data-step="1" aria-label="Raise entry"'+(ST7.stake===STEPS7.length-1?' disabled':'')+'>+</button></div>'+
   '<div class="su7pz"><span class="tro">🏆</span><div><small>'+(team?'YOUR TEAM WINS':'WINNER TAKES ALL')+'</small><b>'+(s?cn(pot):'XP + chest')+'</b><em>'+why+'</em></div></div>'+
   (lock?'<p class="su7need">You need '+cn(s-set.coins)+' more coins for this table</p>':'')+'</div>';
}
function renderPlay7(){
  var p=q7('#su7-play'),friends=ST7.kind==='team'&&ST7.sub==='friends';
  q7('#su7-join').hidden=!friends;
  p.textContent=friends?'CREATE ROOM':(ST7.kind==='online'||ST7.kind==='team')?'FIND PLAYERS':'PLAY';
  p.disabled=stake7()>set.coins;
}
function mark7(){document.querySelectorAll('.su7md').forEach(function(b){b.classList.toggle('on',b.dataset.m===ST7.mode);b.setAttribute('aria-pressed',String(b.dataset.m===ST7.mode));});q7('#su7-mdesc').textContent=MODES[ST7.mode].d;}
function center7(smooth){mark7();var row=q7('#su7-mrow'),b=row.querySelector('[data-m="'+ST7.mode+'"]');if(b)row.scrollTo({left:b.offsetLeft+b.offsetWidth/2-row.clientWidth/2,behavior:smooth?'smooth':'auto'});}
function go7(){
  var s=stake7();if(s>set.coins){toast('Not enough coins for that entry.');return;}
  q7('#ov-setup7').hidden=true;
  wMode=ST7.mode;
  if(ST7.kind==='cpu'||ST7.kind==='pass'){
    wCount=ST7.n;set.n7=ST7.n;wStake=ST7.kind==='cpu'?s:0;save();
    startLocal(ST7.kind,false);return;
  }
  var team=ST7.kind==='team';
  var n=team?4:ST7.n,mode=ST7.mode,si=ST7.stake;
  withAuth(function(){if(team&&ST7.sub==='friends')roomCreate7(s);else quickMatch7(n,team,mode,si);});
}

/* ---------- online: find players (shared table per players/entry/mode), friends rooms ---------- */
var QWAIT=30000;
function qCode(n,team,mode,si){return 'Q'+(team?'T':String(n))+'0123456789'.charAt(si)+'ABCDEFG'.charAt(Math.max(0,MODE_ORDER.indexOf(mode)));}
function waitSheet(on,txt){
  var o=q7('#ov-find7');
  if(!o){o=mk7('div','overlay','',document.body);o.id='ov-find7';o.style.zIndex=60;
    o.innerHTML='<div class="sheet f7"><h2 class="ribbon">FINDING PLAYERS</h2><div class="f7spin"><span></span><span></span><span></span><span></span></div><p class="f7t"></p><p class="f7n"></p><button type="button" class="btn" id="f7-cancel">Cancel</button></div>';
    q7('#f7-cancel',o).addEventListener('click',function(){V7.q=null;clearTimeout(V7.qT);clearInterval(V7.qI);if(NET.on)netLeave();o.hidden=true;showWelcome();});}
  o.hidden=!on;if(txt!=null)q7('.f7t',o).textContent=txt;
}
function humansIn(){try{return hostSeats().players.filter(function(p){return !p.bot;}).length;}catch(e){return 1;}}
async function quickMatch7(n,team,mode,si){
  var stake=STEPS7[si]||0,code=qCode(n,team,mode,si);
  V7.q={n:n,team:team,mode:mode,stake:stake,code:code};
  waitSheet(true,(team?'Team 2 vs 2':n+' players')+' · '+MODES[mode].n+' · entry '+(stake?nf(stake):'free'));
  q7('#ov-find7 .f7n').textContent='Looking for a table…';
  var ok=await netEnter(code,false);if(!ok){waitSheet(false);return;}
  NET.lobby={c:n,tm:team?1:0,gm:mode,stk:stake,seats:[],sp:0};
  setTimeout(async function(){
    if(!V7.q||V7.q.code!==code)return;
    if(NET.on&&!NET.host&&NET.sawHost){q7('#ov-find7 .f7n').textContent='Table found. Waiting for players…';return;}
    if(NET.on)netLeave();
    var ok2=await netEnter(code,true);if(!ok2){waitSheet(false);return;}
    NET.lobby={c:n,tm:team?1:0,gm:mode,stk:stake,seats:[],sp:0};netLobbyBroadcast();
    clearInterval(NET.timer);NET.timer=setInterval(function(){if(!NET.on||!NET.host)return;if(S.phase==='idle'||S.phase==='over')netLobbyBroadcast();else netSync('sync');},2500);
    var t0=Date.now();clearInterval(V7.qI);
    V7.qI=setInterval(function(){
      if(!V7.q||!NET.on||!NET.host){clearInterval(V7.qI);return;}
      var h=humansIn(),left=Math.max(0,Math.ceil((QWAIT-(Date.now()-t0))/1000));
      q7('#ov-find7 .f7n').textContent=h+' of '+n+' players here · '+left+'s';
      if(h>=n||(left<=0&&h>=2)){clearInterval(V7.qI);V7.q=null;waitSheet(false);netBeginVote(n);}
      else if(left<=0){clearInterval(V7.qI);V7.q=null;netLeave();waitSheet(false);noPlayers7(n,mode,si);}
    },500);
  },3000);
}
function noPlayers7(n,mode,si){
  var o=q7('#ov-nop7');
  if(!o){o=mk7('div','overlay','',document.body);o.id='ov-nop7';o.style.zIndex=61;
    o.innerHTML='<div class="sheet"><h2 class="ribbon">NO PLAYERS YET</h2><div class="sb"><p style="text-align:center">No one else is at this table right now. Try again, or play the computer with the same entry.</p><div class="stack"><button type="button" class="btn" data-a="again">Keep looking</button><button type="button" class="btn ghost" data-a="cpu">Play the computer</button><button type="button" class="btn ghost" data-a="x">Back</button></div></div></div>';}
  o.querySelectorAll('[data-a]').forEach(function(b){b.onclick=function(){o.hidden=true;var a=b.dataset.a;
    if(a==='again')quickMatch7(n,false,mode,si);
    else if(a==='cpu'){wCount=n;wMode=mode;wStake=STEPS7[si]||0;startLocal('cpu',false);}
    else showWelcome();};});
  o.hidden=false;
}
async function roomCreate7(stake){
  await netCreate();
  if(NET.on&&NET.host){NET.lobby.c=4;NET.lobby.tm=1;NET.lobby.gm=ST7.mode;NET.lobby.stk=stake;netLobbyBroadcast();renderLobby();}
}
function joinPrompt7(){
  var o=q7('#ov-join7');
  if(!o){o=mk7('div','overlay','',document.body);o.id='ov-join7';o.style.zIndex=61;
    o.innerHTML='<div class="sheet"><h2 class="ribbon">JOIN A ROOM</h2><button class="close" type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="sb"><p style="text-align:center">Type the 4 letter code your friend shared.</p><input id="j7-code" maxlength="4" autocomplete="off" autocapitalize="characters" aria-label="Room code" class="j7in"><button type="button" class="btn" id="j7-go">Join</button></div></div>';
    q7('.close',o).addEventListener('click',function(){o.hidden=true;});
    q7('#j7-go',o).addEventListener('click',function(){var v=q7('#j7-code').value;o.hidden=true;q7('#ov-setup7').hidden=true;withAuth(function(){netJoin(v);});});}
  o.hidden=false;q7('#j7-code').focus();
}
/* online needs a sign-in (guest is fine): ask once, then carry on with what the player picked */
function withAuth(cb){
  if(!NET.rt){notice('Online play unavailable','Could not reach the game server. Check your internet connection and try again.');showWelcome();return;}
  NET.rt.join('lu-zz'+Math.random().toString(36).slice(2,8)).then(function(r){try{r.leave();}catch(e){}cb();},function(){
    var a=q7('#ov-auth');if(!a){toast('Sign in to play online.');return;}
    V7.afterAuth=cb;a.hidden=false;var nm=q7('#a-name');if(nm&&!nm.value)nm.value=set.name||'';
  });
}
(function(){var hub=q7('#ov-hub');if(!hub||!window.MutationObserver)return;
  new MutationObserver(function(){if(!hub.hidden&&V7.afterAuth){hub.hidden=true;var f=V7.afterAuth;V7.afterAuth=null;f();}}).observe(hub,{attributes:true,attributeFilter:['hidden']});})();
/* entry fee for online tables: everyone pays when the game starts, the winner takes the pot */
function payOnline(){
  var st=+(NET.lobby&&NET.lobby.stk)||0;if(!st){S.stake=0;return;}
  if(S.paidG===S.gid)return;S.paidG=S.gid;
  if(set.coins>=st){set.coins-=st;save();refreshStars();S.stake=st;}else{S.stake=0;toast('Not enough coins for the entry. Playing without a prize.');}
}
var nsg7=netStartGame;
netStartGame=function(count,bd){nsg7(count,bd);payOnline();};
var gh7=gHandle;
gHandle=async function(m){
  var r=await gh7(m);
  if(m&&m.ev==='start'){V7.q=null;payOnline();waitSheet(false);var o=q7('#ov-setup7');if(o)o.hidden=true;}
  return r;
};
var nlb7=netLobbyBroadcast;
netLobbyBroadcast=function(){
  if(!NET.host||!NET.room)return;
  var em=NET.room.emit;var stk=+(NET.lobby&&NET.lobby.stk)||0;
  NET.room.emit=function(k,msg){if(msg&&msg.ev==='lobby')msg.stk=stk;return em.call(NET.room,k,msg);};
  try{nlb7();}finally{NET.room.emit=em;}
};
var noh7=netOnHost;
netOnHost=function(m){
  noh7(m);
  var d=m&&m.data;
  if(d&&d.ev==='lobby'&&!NET.host&&NET.lobby){
    NET.lobby.stk=+d.stk||0;
    if(NET.lobby.stk>set.coins){netLeave();waitSheet(false);showWelcome();notice('Not enough coins','This table has an entry of '+nf(NET.lobby.stk)+' coins.');return;}
    if(V7.q){q7('#ov-lobby').hidden=true;}
    var sub=q7('#l-sub');if(sub&&NET.lobby.stk)sub.textContent+=' Entry: '+nf(NET.lobby.stk)+' coins each. Winner takes all.';
  }
};
var rl7=renderLobby;
renderLobby=function(){rl7();var L=NET.lobby,sub=q7('#l-sub');if(L&&L.stk&&sub&&NET.host)sub.textContent='Share this code with friends. Entry: '+nf(L.stk)+' coins each. Winner takes all.';};
var nh7=netHostGone;netHostGone=function(){V7.q=null;waitSheet(false);nh7();};

/* ---------- profile: people pictures, blank, photo, frame, flag ---------- */
var FLAGS7=['🌍','🇯🇲','🇺🇸','🇬🇧','🇨🇦','🇳🇬','🇬🇭','🇰🇪','🇿🇦','🇮🇳','🇵🇰','🇧🇩','🇵🇭','🇮🇩','🇧🇷','🇲🇽','🇨🇴','🇹🇹','🇫🇷','🇩🇪','🇪🇸','🇮🇹','🇹🇷','🇸🇦','🇪🇬','🇦🇪','🇯🇵','🇰🇷','🇨🇳','🇦🇺','🇷🇺','🇵🇹'];
function profHtml(){
  var L2=window.__ludoraV2&&window.__ludoraV2.lvl?window.__ludoraV2.lvl():{l:1,xp:0,need:300};
  var st=set.st||{},g=+st.g||0,w=+st.w||0;
  var h='<div class="p7head"><div class="fr7 p7pic"></div><div class="p7who"><input class="p7name" maxlength="12" aria-label="Your name"><div class="p7lv">Level '+L2.l+' · '+L2.xp+' / '+L2.need+' XP</div><div class="p7xp"><i style="width:'+Math.round(L2.xp/L2.need*100)+'%"></i></div></div></div>';
  h+='<h4 class="p7h">Profile picture</h4><div class="p7avs"><button type="button" class="p7av blank" data-a="blank" aria-label="No picture">'+BLANK+'</button>'+PEOPLE.map(function(o,i){return '<button type="button" class="p7av" data-a="h'+i+'" aria-label="Picture '+(i+1)+'">'+person(o)+'</button>';}).join('')+
     '<label class="p7av up"><span>📷</span>Your photo<input type="file" accept="image/*" hidden></label></div>';
  h+='<h4 class="p7h">Frame</h4><div class="p7frs">'+ITEMS.frame.filter(function(it){return owned('frame',it.id);}).map(function(it){return '<button type="button" class="p7fr" data-f="'+it.id+'" style="--fc:'+(it.css||'#ffd35c')+'" aria-label="'+it.name+' frame"><span class="in"></span><small>'+it.name+'</small></button>';}).join('')+'<button type="button" class="p7fr more" aria-label="Get more frames"><span class="in">+</span><small>More</small></button></div>';
  h+='<h4 class="p7h">Your country</h4><div class="p7fls">'+FLAGS7.map(function(f){return '<button type="button" class="p7fl" data-f="'+f+'">'+f+'</button>';}).join('')+'</div>';
  h+='<h4 class="p7h">Stats</h4><div class="p7st"><div><b>'+nf(g)+'</b>Games</div><div><b>'+nf(w)+'</b>Wins</div><div><b>'+(g?Math.round(w/g*100):0)+'%</b>Win rate</div><div><b>'+nf(+st.ms||0)+'</b>Best streak</div></div>';
  return h;
}
function profBind(box){
  var nm=q7('.p7name',box);nm.value=set.name||'Player';nm.addEventListener('input',function(){set.name=nm.value.slice(0,12);save();});
  function sync(){
    paintFramed(q7('.p7pic',box),'<span class="p7flag">'+(set.flag||'🌍')+'</span>');
    box.querySelectorAll('.p7av[data-a]').forEach(function(b){b.setAttribute('aria-pressed',String(!set.photo&&b.dataset.a===set.av));});
    box.querySelectorAll('.p7fr[data-f]').forEach(function(b){b.setAttribute('aria-pressed',String(String(set.eq.frame)===b.dataset.f));});
    box.querySelectorAll('.p7fl').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.f===(set.flag||'🌍')));});
    if(V7.homeMe)V7.homeMe();
  }
  box.addEventListener('click',function(e){
    var a=e.target.closest('.p7av[data-a]');if(a){set.av=a.dataset.a;set.photo='';save();sync();return;}
    var f=e.target.closest('.p7fr');if(f){if(f.classList.contains('more')){closeSheet('ov-prof');storeTop='shop';collTab='frame';renderColl();openSheet('ov-coll');return;}set.eq.frame=f.dataset.f;save();try{applyCosmetics();}catch(x){}sync();return;}
    var fl=e.target.closest('.p7fl');if(fl){set.flag=fl.dataset.f==='🌍'?'':fl.dataset.f;save();sync();}
  });
  q7('.p7av.up input',box).addEventListener('change',function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){
    var im=new Image();im.onload=function(){var c=document.createElement('canvas'),k=Math.min(1,256/Math.max(im.width,im.height));c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);try{set.photo=c.toDataURL('image/jpeg',.82);}catch(x){set.photo=r.result;}save();sync();};im.src=r.result;};r.readAsDataURL(f);});
  sync();
}
var rp7=renderProf;
renderProf=function(){
  rp7();
  var box=q7('#ov-prof .sb');if(!box)return;
  function apply(){var tabs=q7('.ptabs',box),on=tabs&&q7('[aria-pressed="true"]',tabs);if(on&&on.dataset.v!=='p')return;var body=tabs?tabs.nextElementSibling:null;if(!body)return;body.innerHTML=profHtml();body.className='p7';profBind(body);}
  apply();
  var tabs=q7('.ptabs',box);if(tabs)tabs.addEventListener('click',function(){setTimeout(apply,0);});
};

/* ---------- old home pieces are replaced ---------- */
openSetup=function(kind){openSetup7(kind==='team'?'team':kind);};
