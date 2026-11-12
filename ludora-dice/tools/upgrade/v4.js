/* ===================== v1.2 round 3: character pawns, kill shows, animated boards, clean home, new sounds ===================== */
(function(){
window.FEATURE_TRAIL=false;set.trail=false;save();

/* ---------- character pawns: every pawn redesigned, smaller, in the team color ---------- */
var SETS=['critter','robot','ghost','rocket','a_bear','a_panda','a_pup','a_fox','a_lion','a_tiger','a_rabbit','a_monkey','a_koala','a_piglet','a_penguin','a_owl','a_duck','a_chick','a_bee','a_ladybug','a_butterfly','a_spider','a_clownfish','a_shark','a_octopus','a_crab','a_whale','a_puffer','a_ufo','a_satellite','a_alien','a_astronaut','a_comet','a_dragon','a_unicorn','a_wizard','a_fairy','a_bat','a_rook','a_bishop','a_knight','a_queen','a_king'];
var HAS={};SETS.forEach(function(k){HAS[k]=1;});
function pawnImg(id,col){return id==='classic'?'pawns/'+col+'.webp':(HAS[id]?'pawnset/'+id+'_'+col+'.webp':null);}
window.__ludoraPawnImg=pawnImg;
var apl=applyPawnLooks;
applyPawnLooks=function(){
  apl();
  S.players.forEach(function(pl){
    var id=String(lookOf(pl).p),col=SEATS[pl.seat],u=pawnImg(id,col);
    for(var i=0;i<4;i++){var pw=PW[pl.seat][i];if(!pw)continue;
      pw.el.classList.toggle('g3',!!u);pw.el.classList.toggle('g3c',!!u&&id!=='classic');
      if(u)pw.el.style.setProperty('--g3','url("'+u+'")');}
  });
};
/* store and previews use the new pawns too */
var piv=previewInto;
previewInto=function(pv,cat,it,big){
  if(cat==='pawn'&&!big&&pawnImg(String(it.id),'blue')){
    pv.innerHTML='';pv.style.background='radial-gradient(circle at 50% 70%,#3a56e0 0,#16206e 70%)';
    var row=document.createElement('div');row.className='pvset';
    ['red','green','yellow','blue'].forEach(function(c){var im=document.createElement('img');im.alt='';im.src=pawnImg(String(it.id),c);row.appendChild(im);});
    pv.appendChild(row);return;
  }
  var r=piv(pv,cat,it,big);
  if(cat==='pawn'&&big){var me=pv.querySelector('.pmini.me .pawn');var u=pawnImg(String(it.id),'blue');if(me&&u){me.classList.add('g3');if(String(it.id)!=='classic')me.classList.add('g3c');me.style.setProperty('--g3','url("'+u+'")');}
    var rv=pv.querySelector('.pmini.rival .pawn');if(rv){rv.classList.add('g3');rv.style.setProperty('--g3','url("pawns/red.webp")');}}
  return r;
};

/* ---------- kill shows for Epic and Legendary pawns ---------- */
var KILL={
 a_dragon:{h:'🐲',p:['🔥','🔥','💥','🔥'],w:'BURNED!',c:'#ff6a1a'},
 a_unicorn:{h:'🦄',p:['🌈','✨','💖','⭐'],w:'RAINBOW BLAST!',c:'#ff7ad9'},
 a_wizard:{h:'🧙',p:['⚡','🔮','✨','⚡'],w:'KABOOM!',c:'#9b6bff'},
 a_astronaut:{h:'🧑‍🚀',p:['🚀','💥','⭐','☄️'],w:'LIFT OFF!',c:'#4de0ff'},
 a_alien:{h:'👽',p:['🛸','⚡','💚','✨'],w:'ZAPPED!',c:'#8bff4d'},
 a_ufo:{h:'🛸',p:['✨','🌀','💫','✨'],w:'ABDUCTED!',c:'#b4fff0'},
 a_queen:{h:'👑',p:['👑','✨','💎','⭐'],w:'OFF WITH YOU!',c:'#ffd84d'},
 a_king:{h:'👑',p:['⚔️','✨','🛡️','⭐'],w:'BANISHED!',c:'#ffd84d'},
 a_satellite:{h:'🛰️',p:['⚡','📡','💥'],w:'ORBITAL ZAP!',c:'#7ed0ff'},
 a_comet:{h:'☄️',p:['🔥','💥','⭐','🔥'],w:'METEOR!',c:'#ffb02a'},
 a_ghost:{h:'👻',p:['💨','👻','🕸️'],w:'BOO!',c:'#d6d0ff'},ghost:{h:'👻',p:['💨','👻','🕸️'],w:'BOO!',c:'#d6d0ff'},
 a_lion:{h:'🦁',p:['🐾','💢','💥'],w:'ROAR!',c:'#ffb02a'},
 a_tiger:{h:'🐯',p:['🐾','💥','💢'],w:'POUNCE!',c:'#ff8a1a'},
 a_shark:{h:'🦈',p:['💦','🌊','🫧'],w:'CHOMP!',c:'#4dc8ff'},
 a_octopus:{h:'🐙',p:['🖤','💦','🫧'],w:'INKED!',c:'#9b6bff'},
 a_fairy:{h:'🧚',p:['✨','🌸','💫'],w:'POOF!',c:'#ff9bd9'},
 a_knight:{h:'⚔️',p:['⚔️','💥','🛡️'],w:'CHARGE!',c:'#cfd6e4'}
};
['a_lion','a_tiger','a_shark','a_octopus','a_comet','a_fairy','a_knight','ghost'].forEach(function(k){if(!SPECIALFX[k])SPECIALFX[k]={w:KILL[k].w,k:k==='a_comet'?'fire':(k==='a_shark'?'laser':'magic'),col:KILL[k].c};});
function killShow(gx,gy,pid,victims){
  var K=KILL[pid];if(!K)return;
  var px=gx*CELL,py=gy*CELL,box=el('div','kshow',pawnsEl);box.style.translate=px+'px '+py+'px';box.style.setProperty('--kc',K.c);box.style.setProperty('--u',CELL+'px');
  var h='<b class="kring"></b><b class="khero">'+K.h+'</b>';
  for(var i=0;i<14;i++){var a=i/14*Math.PI*2,d=CELL*(1.6+Math.random()*1.2);h+='<i class="kp" style="--dx:'+(Math.cos(a)*d).toFixed(0)+'px;--dy:'+(Math.sin(a)*d*.8).toFixed(0)+'px;animation-delay:'+(.18+Math.random()*.15).toFixed(2)+'s">'+K.p[i%K.p.length]+'</i>';}
  h+='<b class="kskull">💀</b>';
  for(var j=0;j<4;j++){h+='<i class="kbone" style="--dx:'+((j-1.5)*CELL*.9).toFixed(0)+'px;--r:'+(j%2?260:-260)+'deg">🦴</i>';}
  box.innerHTML=h;
  (victims||[]).forEach(function(pw){if(!pw)return;try{pw.pin.animate([{opacity:1},{opacity:0,offset:.35},{opacity:0,offset:.85},{opacity:1}],{duration:Math.max(800,1500*SPEED)});}catch(e){}});
  try{sfx.boom&&sfx.boom();}catch(e){}
  setTimeout(function(){box.remove();},1800);
}
var bfx=bumpFx;
bumpFx=function(gx,gy,pid,victims){bfx(gx,gy,pid,victims);var it=pawnItem(pid);if(KILL[pid]&&it&&(it.r==='epic'||it.r==='legendary'))killShow(gx,gy,pid,victims);};
window.__ludoraKill=killShow;

/* ---------- special boards move on the board itself ---------- */
var BFX={stars:['✨',0],bubbles:['🫧',-1],petals:['🌸',1],leaves:['🍃',1],embers:['🔸',-1],fireflies:['✨',0],sprinkles:['🍬',1],bats:['🦇',0],gears:['⚙️',2],clouds:['☁️',3],aurora:['✨',0],neon:['💜',0],lights:['🎈',-1],sparkle:['✨',0],dust:['✨',0],snow:['❄️',1]};
function boardMotion(){
  var old=document.getElementById('bfx');if(old)old.remove();
  var it=boardItem();if(!it||it.fx==='classic')return;
  try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;}catch(e){}
  var key=window.__ludoraV3&&window.__ludoraV3.artKey?window.__ludoraV3.artKey(it):null,special=it.r==='epic'||it.r==='legendary'||(it.g||0)>0,rare=it.r==='rare';
  if(!special&&!rare)return;
  var d=document.createElement('div');d.id='bfx';d.className='bfx';
  d.innerHTML='<b class="bsweep"></b>';
  var a=null;try{a=((window.__ludoraArtMeta||{})[key]||{}).a;}catch(e){}
  var kind=a||'sparkle',spec=BFX[kind]||BFX.sparkle,n=special?12:0;
  for(var i=0;i<n;i++){var p=document.createElement('i');p.textContent=spec[0];
    var dir=spec[1];p.style.left=(4+Math.random()*92)+'%';p.style.top=(4+Math.random()*92)+'%';
    p.style.animationName=dir===1?'bfall':dir===-1?'brise':dir===2?'bspin':dir===3?'bdrift':'btwinkle';
    p.style.animationDuration=(3+Math.random()*4)+'s';p.style.animationDelay=(-Math.random()*6)+'s';p.style.fontSize=(10+Math.random()*10)+'px';d.appendChild(p);}
  var plane=document.getElementById('plane');plane.insertBefore(d,document.getElementById('pawns'));
}
var db=drawBoard;
drawBoard=function(){db();if(!PRVB)try{boardMotion();}catch(e){}};
window.__ludoraBoardMotion=boardMotion;

/* ---------- clean home screen: small icons on top, smaller swipeable mode card ---------- */
(function(){
  var main=$('#w-main');if(!main)return;main.classList.add('home2');
  var hud=main.querySelector('.hud'),icons=document.createElement('div');icons.className='ticons';
  hud.parentNode.insertBefore(icons,hud.nextSibling);
  var NAMES={'h-coll':'Store','h-prof':'Profile','h-chest':'Daily','h-luck':'Lucky','h-pass':'Pass','h-ev':'Events'};
  ['h-coll','h-prof','h-chest','h-luck','h-pass','h-ev'].forEach(function(id){var b=document.getElementById(id);if(!b)return;b.classList.add('tic');
    var w=document.createElement('div');w.className='ticw';w.appendChild(b);var s=document.createElement('span');s.textContent=NAMES[id];w.appendChild(s);icons.appendChild(w);});
  main.querySelectorAll('.stagehome .side').forEach(function(sd){sd.remove();});
  var mid=main.querySelector('.stagehome .mid'),tiles=document.getElementById('h-tiles');
  ['prev','next'].forEach(function(k){var b=document.createElement('button');b.type='button';b.className='harr '+k;b.setAttribute('aria-label',k==='prev'?'Previous game':'Next game');b.innerHTML=k==='prev'?'&#8249;':'&#8250;';
    b.addEventListener('click',function(){tiles.scrollBy({left:(k==='prev'?-1:1)*tiles.clientWidth,behavior:'smooth'});});mid.appendChild(b);});
})();
var demoB=null;setTimeout(function(){[].forEach.call(document.body.children,function(n){if(n.textContent==='DEMO · everything unlocked'){n.style.top='auto';n.style.bottom='calc(env(safe-area-inset-bottom,0px) + 74px)';n.style.left='8px';n.style.translate='none';n.style.fontSize='10px';}});},100);

/* ---------- better sound effects ---------- */
function noiseHit(freq,q,vol,dur,delay,type){if(!A.ctx)return;try{var t=A.ctx.currentTime+(delay||0),s=A.ctx.createBufferSource(),f=A.ctx.createBiquadFilter(),g=A.ctx.createGain();s.buffer=A.noise;f.type=type||'bandpass';f.frequency.value=freq;f.Q.value=q||1;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+(dur||.05));s.connect(f);f.connect(g);g.connect(A.sfx);s.start(t);s.stop(t+(dur||.05)+.02);}catch(e){}}
function bell(f,vol,delay,dur){tone(f,dur||.5,'sine',vol,0,delay);tone(f*2.01,(dur||.5)*.6,'sine',vol*.35,0,delay);tone(f*3.02,(dur||.5)*.35,'sine',vol*.15,0,delay);}
sfx.tick=function(){if(!set.sound||!A.ctx)return;noiseHit(900+Math.random()*700,2.5,.5,.035);tone(180+Math.random()*60,.04,'triangle',.06);};
sfx.step=function(){if(!set.sound)return;tone(330,.07,'triangle',.09,250);noiseHit(2400,1,.06,.02);};
sfx.out=function(){if(!set.sound)return;tone(300,.22,'sine',.12,900);bell(1047,.06,.16,.35);};
sfx.bump=function(){if(!set.sound)return;tone(620,.32,'sine',.16,140);noiseHit(160,.8,.35,.18,0,'lowpass');tone(90,.18,'sine',.18,60,.05);};
sfx.boom=function(){if(!set.sound)return;noiseHit(220,.6,.45,.4,0,'lowpass');tone(70,.45,'sine',.2,40);bell(784,.05,.25,.4);};
sfx.home=function(){if(!set.sound)return;[659,784,988,1319].forEach(function(f,i){bell(f,.07,i*.07,.45);});};
sfx.win=function(){if(!set.sound)return;[523,659,784,1047,784,1047,1319].forEach(function(f,i){bell(f,.08,i*.12,.6);});tone(262,.9,'triangle',.06,0,.8);};
sfx.six=function(){if(!set.sound)return;[1047,1319,1568].forEach(function(f,i){bell(f,.06,i*.06,.5);});};
sfx.pop=function(){if(!set.sound)return;tone(500,.09,'sine',.1,900);};
})();
