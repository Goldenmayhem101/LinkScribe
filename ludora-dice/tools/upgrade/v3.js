/* ===================== v1.3: classic default board, glossy 3D pawns, board worlds ===================== */
(function(){
var V3={};
/* ---------- the classic board: free, owned by everyone, the default ---------- */
if(!ITEMS.board.some(function(b){return b.id==='classic';})){
  ITEMS.board.unshift({id:'classic',name:'Classic',c:0,g:0,r:'common',fx:'classic',bg:'#2a4fa6',tt:'#ffffff',tb:'#f3f5f9',ts:'#c9cfdb',bt:'#2a4fa6',bb:'#1f3f8f',bi:'#ffffff',slot:'#b4b8bf',g1:'#8fb8ff',g2:'#5a86e0',
    d:'The board everyone knows. Bright colors and a clean white path.'});
}
if(set.own.indexOf('board:classic')<0)set.own.push('board:classic');
if(!set.v13){set.v13=1;if(!set.eq.board||set.eq.board==='neon')set.eq.board='classic';}
save();

/* ---------- board worlds: the scene behind each board ---------- */
var WORLD={
  classic:'radial-gradient(rgba(10,25,80,.22) 34%,transparent 36%) 0 0/46px 46px,linear-gradient(#2d55ad,#22448f)'
};
V3.WORLD=WORLD;
function worldOf(it){return WORLD[it.fx]||WORLD[it.id]||null;}
V3.worldOf=worldOf;
function applyWorld(){
  var it=boardItem(),w=$('#ov-welcome')&&!$('#ov-welcome').hidden?null:worldOf(it);
  document.body.style.background=w||'';
  document.body.classList.toggle('w-light',!!w);
}

/* ---------- classic drawing ---------- */
function star(cx,cy,R,r){var p=[];for(var k=0;k<10;k++){var a=-Math.PI/2+k*Math.PI/5,q=k%2?r:R;p.push((cx+Math.cos(a)*q).toFixed(3)+','+(cy+Math.sin(a)*q).toFixed(3));}return p.join(' ');}
function drawClassic(BT){
  var s,defs=se('defs',{},board);
  var f=se('filter',{id:'neon',x:'-30%',y:'-30%',width:'160%',height:'160%'},defs);se('feGaussianBlur',{stdDeviation:.11},f);
  var line='#c9cfdb';
  se('rect',{x:0,y:0,width:15,height:15,fill:'#fff'},board);
  TRACK.forEach(function(c){se('rect',{x:c[0],y:c[1],width:1,height:1,fill:'#fff',stroke:line,'stroke-width':.035},board);});
  for(s=0;s<4;s++)HOMECOL[s].forEach(function(c){se('rect',{x:c[0],y:c[1],width:1,height:1,fill:SEATHEX[s],stroke:line,'stroke-width':.035},board);});
  SAFE.forEach(function(idx){
    var c=TRACK[idx],st=START.indexOf(idx);
    if(st>=0){se('polygon',{points:star(c[0]+.5,c[1]+.5,.38,.16),fill:SEATHEX[st],stroke:'#fff','stroke-width':.04},board);}
    else{se('rect',{x:c[0],y:c[1],width:1,height:1,fill:'#d4d8df',stroke:line,'stroke-width':.035},board);se('polygon',{points:star(c[0]+.5,c[1]+.5,.36,.15),fill:'#fff'},board);}
  });
  (PRVB?[]:(S.sq||[])).forEach(function(idx){
    var c=TRACK[idx];se('rect',{x:c[0]+.04,y:c[1]+.04,width:.92,height:.92,rx:.08,fill:'#ffd34d',stroke:'#fff','stroke-width':.05},board);
    var t=se('text',{x:c[0]+.5,y:c[1]+.54,'text-anchor':'middle','dominant-baseline':'central','font-size':.74,'font-weight':900,fill:'#7a3b00','font-family':'Baloo 2, Nunito, sans-serif'},board);t.textContent='?';
  });
  for(s=0;s<4;s++){
    var ec=[[0,7],[7,0],[14,7],[7,14]][s],dv=[[1,0],[0,1],[-1,0],[0,-1]][s],cx0=ec[0]+.5,cy0=ec[1]+.5;
    var pts=[[-.14,-.24],[.12,0],[-.14,.24]].map(function(q){return (cx0+dv[0]*q[0]-dv[1]*q[1]).toFixed(3)+','+(cy0+dv[1]*q[0]+dv[0]*q[1]).toFixed(3);}).join(' ');
    se('polyline',{points:pts,fill:'none',stroke:SEATHEX[s],'stroke-width':.13,'stroke-linecap':'round','stroke-linejoin':'round'},board);
  }
  var tri=[[[6,6],[6,9],[7.5,7.5]],[[6,6],[9,6],[7.5,7.5]],[[9,6],[9,9],[7.5,7.5]],[[6,9],[9,9],[7.5,7.5]]];
  for(s=0;s<4;s++)se('polygon',{points:tri[s].map(function(p){return p.join(',');}).join(' '),fill:SEATHEX[s]},board);
  for(s=0;s<4;s++){
    var g=se('g',{},board);BASEG[s]=g;var o=BASEO[s];
    se('rect',{x:o[0],y:o[1],width:6,height:6,fill:SEATHEX[s]},g);
    se('rect',{x:o[0]+.85,y:o[1]+.85,width:4.3,height:4.3,rx:.45,fill:'#fff',stroke:'rgba(0,0,0,.16)','stroke-width':.06},g);
    var tc={'text-anchor':'middle','dominant-baseline':'central','font-weight':800,'font-family':'Baloo 2, Nunito, sans-serif'};
    var tp=s<2,lab=se('text',Object.assign({x:o[0]+3,y:o[1]+(tp?.43:5.57),'font-size':.42,fill:'#fff'},tc),g);
    var cnt=se('text',Object.assign({x:o[0]+3,y:o[1]+(tp?5.57:.43),'font-size':.36,fill:'#fff',opacity:.95},tc),g);
    BTXT[s]={lab:lab,cnt:cnt};
  }
  for(s=0;s<4;s++){var o2=BASEO[s];GLOW[s]=se('rect',{x:o2[0]+.12,y:o2[1]+.12,width:5.76,height:5.76,rx:.4,fill:'none',opacity:0,stroke:'#fff',filter:'url(#neon)',class:'glow'},board);}
  if(!PRVB)stage.style.setProperty('--rim','#a9c8ff');
}
V3.drawBoard=drawBoard;
drawBoard=function(){
  var BT=boardItem();
  if(BT.fx==='classic'){drawClassic(BT);}else V3.drawBoard();
  if(!PRVB){boardId=BT.id;applyWorld();}
};


/* ---------- painted boards: each board is a picture of its own world ---------- */
var ART={"neon":{"a":"stars","f":"#37b9ff"},"garden":{"a":"","f":""},"ocean":{"a":"bubbles","f":""},"sunset":{"a":"","f":""},"aurora":{"a":"aurora","f":""},"island":{"a":"","f":""},"candy":{"a":"sprinkles","f":""},"desert":{"a":"","f":""},"canopy":{"a":"leaves","f":""},"frost":{"a":"snow","f":""},"arcade":{"a":"stars","f":"#ff52c5"},"bloom":{"a":"petals","f":""},"orbit":{"a":"stars","f":"#c552ff"},"ember":{"a":"embers","f":"#ffa852"},"pier":{"a":"fireflies","f":"#52c5ff"},"carnival":{"a":"lights","f":"#ffd752"},"candycarn":{"a":"sprinkles","f":""},"lava":{"a":"embers","f":"#ff8a2a"},"meadow":{"a":"","f":""},"treasure":{"a":"","f":""},"pharaoh":{"a":"dust","f":""},"wizard":{"a":"sparkle","f":"#b48cff"},"techno":{"a":"","f":"#19f0c8"},"safari":{"a":"","f":""},"arctic":{"a":"snow","f":""},"reef":{"a":"bubbles","f":""},"forest":{"a":"fireflies","f":""},"sakura":{"a":"petals","f":""},"steampunk":{"a":"gears","f":"#d9a35a"},"cyber":{"a":"neon","f":"#ff2bd6"},"halloween":{"a":"bats","f":"#ff9a2a"},"alien":{"a":"stars","f":"#26e0ff"},"palace":{"a":"sparkle","f":""},"olympus":{"a":"clouds","f":""},"dragon":{"a":"embers","f":"#d9a21e"}};
function artKey(it){if(it.fx==='carnival')return 'candycarn';if(ART[it.id]&&!it.fx)return it.id;if(it.fx&&ART[it.fx])return it.fx;return ART[it.id]?it.id:null;}
V3.artKey=artKey;
var AFX={snow:['❄️',1,10],bubbles:['🫧',-1,9],petals:['🌸',1,9],leaves:['🍃',1,8],embers:['🔸',-1,12],stars:['✨',0,10],fireflies:['✨',0,12],
  sprinkles:['🍬',1,8],bats:['🦇',0,6],gears:['⚙️',0,5],clouds:['☁️',0,4],aurora:['✨',0,10],neon:['💜',0,8],lights:['🎈',-1,7],sparkle:['✨',0,10],dust:['🟡',0,8]};
function premium(it){return it.r==='epic'||it.r==='legendary'||(it.g||0)>0;}
function drawArt(BT,key){
  var defs=se('defs',{},board),f=se('filter',{id:'neon',x:'-30%',y:'-30%',width:'160%',height:'160%'},defs);se('feGaussianBlur',{stdDeviation:.11},f);
  var im=se('image',{x:0,y:0,width:15,height:15,preserveAspectRatio:'none'},board);im.setAttribute('href','boards/'+key+'.webp');
  (PRVB?[]:(S.sq||[])).forEach(function(idx){var c=TRACK[idx];se('rect',{x:c[0]+.06,y:c[1]+.06,width:.88,height:.88,rx:.12,fill:'#ffd34d',stroke:'#fff','stroke-width':.05},board);
    var t=se('text',{x:c[0]+.5,y:c[1]+.54,'text-anchor':'middle','dominant-baseline':'central','font-size':.72,'font-weight':900,fill:'#7a3b00','font-family':'Baloo 2, Nunito, sans-serif'},board);t.textContent='?';});
  if(S.gm==='haven'&&!PRVB){/* haven extra safe squares are drawn by the base game on top */}
  for(var s=0;s<4;s++){var g=se('g',{},board);BASEG[s]=g;var o=BASEO[s],tp=s<2;
    var tc={'text-anchor':'middle','dominant-baseline':'central','font-weight':800,'font-family':'Baloo 2, Nunito, sans-serif',stroke:'rgba(0,0,0,.45)','stroke-width':.08,'paint-order':'stroke'};
    var lab=se('text',Object.assign({x:o[0]+3,y:o[1]+(tp?.75:5.25),'font-size':.4,fill:'#fff'},tc),g);
    var cnt=se('text',Object.assign({x:o[0]+3,y:o[1]+(tp?5.25:.75),'font-size':.34,fill:'#fff'},tc),g);BTXT[s]={lab:lab,cnt:cnt};}
  for(s=0;s<4;s++){var o2=BASEO[s];GLOW[s]=se('rect',{x:o2[0]+.42,y:o2[1]+.42,width:5.16,height:5.16,rx:.55,fill:'none',opacity:0,stroke:'#fff',filter:'url(#neon)',class:'glow'},board);}
  if(!PRVB){stage.style.setProperty('--rim',(ART[key]&&ART[key].f)||BT.g1||'#ffffff');boardFx(BT,key);}
}
function boardFx(BT,key){
  var old=document.getElementById('wfx');if(old)old.remove();
  var a=ART[key]&&ART[key].a;if(!a||!premium(BT)||!AFX[a])return;
  try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;}catch(e){}
  var d=document.createElement('div');d.id='wfx';d.className='wfx';var spec=AFX[a],n=spec[2];
  for(var i=0;i<n;i++){var p=document.createElement('i');p.textContent=spec[0];p.style.left=(Math.random()*100)+'%';
    p.style.animationName=spec[1]>0?'wfall':(spec[1]<0?'wrise':'wdrift');p.style.animationDuration=(6+Math.random()*7)+'s';p.style.animationDelay=(-Math.random()*12)+'s';
    p.style.fontSize=(12+Math.random()*12)+'px';if(spec[1]===0)p.style.top=(Math.random()*100)+'%';d.appendChild(p);}
  document.body.insertBefore(d,document.body.firstChild);
}
V3.boardFx=boardFx;
var dB=drawBoard;
drawBoard=function(){
  var BT=boardItem(),key=artKey(BT);
  if(BT.fx!=='classic'&&key){drawArt(BT,key);if(!PRVB){boardId=BT.id;applyWorld();}}
  else{dB();var o=document.getElementById('wfx');if(o&&!PRVB)o.remove();}
};
var wOf=worldOf;worldOf=function(it){var k=artKey(it);if(it.fx!=='classic'&&k)return 'url("boards/'+k+'-w.webp") center/cover no-repeat,#123';return wOf(it);};
V3.worldOf=worldOf;

/* ---------- glossy 3D pawns (rendered in Godot) for the classic pawn ---------- */
var PIMG={};['red','green','yellow','blue'].forEach(function(c){var im=new Image();im.onload=function(){PIMG[c]=1;applyPawnLooks();};im.src='pawns/'+c+'.webp';});
V3.applyPawnLooks=applyPawnLooks;
applyPawnLooks=function(){
  V3.applyPawnLooks();
  S.players.forEach(function(pl){
    var lk=lookOf(pl),col=SEATS[pl.seat],std=String(SEATHEX[pl.seat]).toLowerCase()===String(SEAT0.hex[pl.seat]).toLowerCase();
    var on=lk.p==='classic'&&std&&PIMG[col];
    for(var i=0;i<4;i++){var pw=PW[pl.seat][i];if(!pw)continue;pw.el.classList.toggle('g3',!!on);if(on)pw.el.style.setProperty('--g3','url("pawns/'+col+'.webp")');}
  });
};

/* ---------- tall board preview card in the store, like the board's own world ---------- */
V3.previewInto=previewInto;
previewInto=function(pv,cat,it,big){
  if(cat==='board'&&big){
    pv.innerHTML='';pv.className=(pv.className||'')+' bcard';
    var w=worldOf(it);pv.style.background=w||('radial-gradient(circle at 50% 40%,'+(it.g1||'#37b9ff')+'55,transparent 70%),linear-gradient('+(it.bt||'#18238a')+','+(it.bg||'#0a1048')+')');
    pv.style.height='';var sv=boardPreviewSvg(it,250);sv.style.boxShadow='0 6px 0 rgba(0,0,40,.35),0 10px 22px rgba(0,0,30,.45)';pv.appendChild(sv);return;
  }
  return V3.previewInto(pv,cat,it,big);
};

/* ---------- show the classic board now ---------- */
board.innerHTML='';GLOW=[];BASEG=[];drawBoard();boardSig=boardSigNow();
if(S.players.length){prepSeats();renderSeats();updateTurn();}
setInterval(function(){var home=!$('#ov-welcome').hidden;if(home!==V3.home){V3.home=home;applyWorld();var fx=document.getElementById('wfx');if(fx)fx.style.display=home?'none':'';}},400);
window.__ludoraV3=V3;
})();

/* ===================== themed dice: picture faces, spinning preview, character six show ===================== */
(function(){
var TD=[
 {id:'t_pirate',name:'Captain Polly',r:'epic',g:900,ch:'🦜',x:['🏴‍☠️','💰','🪙'],col:'#f2c14e',bg:'#1e6fb0',d:'Squawk! A pirate parrot who never misses a treasure roll.'},
 {id:'t_astro',name:'Star Cadet',r:'epic',g:900,ch:'🧑‍🚀',x:['🚀','🪐','⭐'],col:'#9ad8ff',bg:'#1a0f4a',d:'Blast off with a roll from outer space.'},
 {id:'t_bear',name:'Candy Bear',r:'rare',c:240000,ch:'🧸',x:['🍬','🍭','🧁'],col:'#ff9ec9',bg:'#e05a9a',d:'Soft, sweet and surprisingly lucky.'},
 {id:'t_dragon',name:'Ember Dragon',r:'legendary',g:2200,ch:'🐉',x:['🔥','💎','🔥'],col:'#ffd24a',bg:'#7a0a04',d:'A dragon guards every face. Roll a 6 and it breathes fire.'},
 {id:'t_robot',name:'Bolt Bot',r:'rare',c:240000,ch:'🤖',x:['⚙️','⚡','🔋'],col:'#3ad6c4',bg:'#0a5a6a',d:'Beep boop. Calculating a perfect six.'},
 {id:'t_mermaid',name:'Coral Song',r:'epic',g:950,ch:'🧜‍♀️',x:['🫧','🐚','🐠'],col:'#3ac8e0',bg:'#0a5a8a',d:'Sing from the reef and the waves roll with you.'},
 {id:'t_tiger',name:'Jungle King',r:'epic',g:950,ch:'🐯',x:['🐾','🍃','🌴'],col:'#ffb02a',bg:'#c45a0a',d:'Pounce on the board with a mighty roar.'},
 {id:'t_owl',name:'Night Owl',r:'rare',c:250000,ch:'🦉',x:['🔮','⭐','🌙'],col:'#b48cff',bg:'#1a0a4a',d:'Wise eyes that see the six before it lands.'},
 {id:'t_unicorn',name:'Rainbow Mane',r:'legendary',g:2400,ch:'🦄',x:['🌈','✨','🌸'],col:'#ff9bd9',bg:'#b48cff',d:'Magic on every face. A six fills the sky with rainbows.'},
 {id:'t_ghost',name:'Boo Crew',r:'epic',g:900,ch:'👻',x:['🎃','🦇','🕸️'],col:'#ff9a2a',bg:'#3a1a5a',d:'Spooky rolls with a friendly little ghost.'}];
var TDM={};TD.forEach(function(t){TDM[t.id]=t;if(!ITEMS.die.some(function(d){return d.id===t.id;}))ITEMS.die.push({id:t.id,name:t.name,c:t.c||0,g:t.g||0,r:t.r,d:t.d,th:1});});
window.__ludoraTD=TDM;
/* character six show: the character pops up big over the board */
function sixShow(t,host,big){
  var o=document.createElement('div');o.className='sixshow'+(big?' big':'');o.style.setProperty('--sc',t.col);o.style.setProperty('--sb',t.bg);
  var h='<div class="ssring"></div><div class="ssch">'+t.ch+'</div><div class="sssix">6</div>';
  for(var i=0;i<16;i++){var a=i/16*Math.PI*2,dx=Math.cos(a)*(90+Math.random()*60),dy=Math.sin(a)*(90+Math.random()*60);h+='<i style="--dx:'+dx.toFixed(0)+'px;--dy:'+dy.toFixed(0)+'px;animation-delay:'+(.15+Math.random()*.2).toFixed(2)+'s">'+t.x[i%t.x.length]+'</i>';}
  o.innerHTML=h;(host||document.body).appendChild(o);setTimeout(function(){o.remove();},2300);
}
window.__ludoraSixShow=sixShow;
var sf=sixFx;
sixFx=function(seat){
  var pl=S.players.filter(function(p){return p.seat===seat;})[0],id=pl?String(lookOf(pl).d):'';
  if(TDM[id]){var r=stage.getBoundingClientRect();var host=document.createElement('div');host.style.cssText='position:fixed;left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px;pointer-events:none;z-index:80';document.body.appendChild(host);sixShow(TDM[id],host);setTimeout(function(){host.remove();},2400);try{sfx.six();}catch(e){}return;}
  sf(seat);
};
/* store preview: spinning 3D die + play its six */
var pi=previewInto;
previewInto=function(pv,cat,it,big){
  if(cat==='die'){
    var t=TDM[it.id];
    pv.innerHTML='';pv.className=(pv.className||'')+' dcard';pv.style.background=t?('radial-gradient(circle at 50% 40%,'+t.col+'66,transparent 65%),linear-gradient('+t.bg+',#0a0f3a)'):'radial-gradient(circle at 50% 40%,#3a56e099,transparent 65%),linear-gradient(#16206e,#0a0f3a)';
    var d=document.createElement('div');d.className='dspin'+(big?' big':'');var url='dice/'+it.id+'.webp';
    d.style.backgroundImage='url("'+url+'")';pv.appendChild(d);
    if(D3TINTED(it.id)){window.__ludoraV2.d3url(it.id,'#2F86FF').then(function(u){d.style.backgroundImage='url("'+u+'")';});}
    if(big){var k=0;var iv=setInterval(function(){if(!d.isConnected){clearInterval(iv);return;}d.style.backgroundPosition=((k%12)/17*100)+'% 0';k++;},90);
      var b=document.createElement('button');b.type='button';b.className='dplay';b.setAttribute('aria-label','Play the six animation');b.textContent='▶';pv.appendChild(b);
      b.addEventListener('click',function(){d.style.backgroundPosition=(17/17*100)+'% 0';clearInterval(iv);
        if(t)sixShow(t,pv,true);else{var r=pv.getBoundingClientRect();fxParticles(r.left+r.width/2,r.top+r.height/2,(SIXFX[it.id]||SIXFX.classic).c,16,(SIXFX[it.id]||SIXFX.classic).k,30,1200);}
        setTimeout(function(){k=0;iv=setInterval(function(){if(!d.isConnected){clearInterval(iv);return;}d.style.backgroundPosition=((k%12)/17*100)+'% 0';k++;},90);},2300);});}
    else d.style.backgroundPosition=(17/17*100)+'% 0';
    return;
  }
  return pi(pv,cat,it,big);
};
function D3TINTED(id){return id==='classic'||id==='glass';}
})();

/* ===================== illustrated frames: a little scene around the picture; Epic and Legendary ones move ===================== */
(function(){
// [emoji, left%, top%, size, motion]  motion: b=bob, t=twinkle, s=spin, f=flicker, w=wave
var FR={
 gold:[['✨',96,4,.8,'t']],
 silver:[['✨',96,2,.8,'t'],['✨',4,96,.6,'t']],
 leaf:[['🍃',-2,-2,1.1,'w'],['🌿',100,100,1.1,'w'],['🐞',98,8,.7,'b']],
 flame:[['🔥',-4,-6,1.2,'f'],['🔥',100,100,1.2,'f'],['🔥',100,-6,.8,'f'],['✨',0,100,.7,'t']],
 royal:[['👑',50,-14,1.5,'b'],['💎',-4,100,.8,'t'],['💎',100,100,.8,'t']],
 rainbow:[['🌈',50,-12,1.5,'b'],['☁️',-6,100,1,'w'],['☁️',104,100,1,'w'],['✨',100,0,.8,'t']],
 candy:[['🍭',-4,-4,1.1,'s'],['🍬',100,100,1,'b'],['🍬',100,-2,.8,'b']],
 balloon:[['🎈',-6,-12,1.2,'b'],['🎈',104,-8,1.1,'b'],['🎉',100,100,.9,'t']],
 pastel:[['🌸',-4,-4,1,'w'],['🌸',100,100,1,'w'],['🦋',100,0,.8,'b']],
 snowy:[['❄️',-4,-4,1,'s'],['⛄',100,100,1.1,'b'],['❄️',100,-4,.7,'s']],
 shore:[['🐚',-4,100,1,'b'],['🌊',100,100,1.1,'w'],['🦀',100,-4,.8,'b']],
 frog:[['🐸',50,-16,1.4,'b'],['🪷',-4,100,1,'w'],['🪷',100,100,.9,'w']],
 cyber:[['⚡',-4,-6,1,'f'],['💿',100,100,1,'s'],['⚡',100,-4,.8,'f']],
 chess:[['♛',50,-14,1.4,'b'],['♞',-4,100,1.1,'b'],['♜',100,100,1.1,'b']],
 pirate:[['🏴‍☠️',50,-16,1.3,'w'],['⚓',-4,100,1,'b'],['💰',100,100,1,'t'],['🦜',100,-6,.9,'b']],
 jungle:[['🐒',-6,-8,1.2,'b'],['🌴',100,100,1.2,'w'],['🍌',100,-4,.8,'b'],['🦜',-4,100,.9,'b']],
 beach:[['⛱️',-6,-10,1.2,'w'],['🌴',100,100,1.1,'w'],['🐚',100,-4,.8,'b'],['🕶️',-4,100,.9,'b']],
 sport:[['🏆',50,-16,1.4,'b'],['⚽',-4,100,1,'s'],['🏀',100,100,1,'s'],['🥇',100,-4,.8,'t']],
 music:[['🎸',-6,-8,1.2,'w'],['🎵',100,-6,.9,'b'],['🎶',100,100,1,'b'],['🎤',-4,100,.9,'b']],
 garden:[['🌻',-6,-10,1.3,'w'],['🌷',100,100,1.1,'w'],['🐝',100,-6,.8,'b'],['🌼',-4,100,.9,'w'],['🦋',50,-14,.8,'b']],
 carnival:[['🎭',50,-16,1.4,'b'],['🎈',-6,-6,1,'b'],['🎊',100,100,1,'t'],['🎉',-4,100,.9,'t'],['🎠',100,-6,.9,'b']],
 frost:[['❄️',-6,-8,1.2,'s'],['🧊',100,100,1.1,'b'],['❄️',100,-6,.9,'s'],['🐧',-4,100,1,'b'],['✨',50,-12,.8,'t']],
 starry:[['🌙',-6,-10,1.3,'b'],['⭐',100,-6,1,'t'],['✨',100,100,.9,'t'],['🌟',-4,100,.9,'t'],['💫',50,-14,.8,'s']],
 volcano:[['🌋',50,-16,1.4,'b'],['🔥',-6,100,1.1,'f'],['🔥',104,100,1.1,'f'],['💥',100,-6,.8,'f'],['🪨',-4,-4,.8,'b']],
 dragon:[['🐉',50,-18,1.6,'b'],['🔥',-6,-6,1.1,'f'],['🔥',104,-6,1.1,'f'],['💎',-4,100,1,'t'],['💰',100,100,1,'t'],['✨',100,40,.7,'t']],
 galaxy:[['🪐',-8,-10,1.4,'s'],['🚀',100,-8,1.1,'b'],['🌍',100,100,1,'s'],['⭐',-4,100,.9,'t'],['✨',50,-12,.8,'t'],['☄️',104,46,.8,'b']],
 crown:[['👑',50,-20,1.7,'b'],['💎',-6,-4,1.1,'t'],['💎',104,-4,1.1,'t'],['🦁',-4,100,1.1,'b'],['🏆',100,100,1.1,'b'],['✨',100,46,.7,'t']]
};
var MOVE={epic:1,legendary:1};
function decoFor(it){var d=FR[it.id];return d||it.deco||[];}
frameDecoHtml=function(it){
  var mv=MOVE[it.r]||(it.g||0)>0;
  return decoFor(it).map(function(d){return '<span class="fdc'+(mv&&d[4]?' fm-'+d[4]:'')+'" style="left:'+d[1]+'%;top:'+d[2]+'%;--s:'+(d[3]||1)+'">'+d[0]+'</span>';}).join('')+(mv?'<span class="fglow"></span>':'');
};
frameDecoSet=function(el,id){
  el.querySelectorAll('.fdc,.fglow').forEach(function(n){n.remove();});
  var f=ITEMS.frame.filter(function(x){return String(x.id)===String(id);})[0];if(!f)return;
  el.insertAdjacentHTML('beforeend',frameDecoHtml(f));
};
})();

/* ===================== pawn preview with capture, Trail, store search/filter/collection ===================== */
(function(){
function fxOf(it){var id=String(it.id);return PAWNFX2[id]||PAWNFX[id]||GROUPFX[it.grp]||PAWNFX.classic;}
/* big pawn preview: a strip of track, the pawn hops along and bumps a rival */
var pi=previewInto;
previewInto=function(pv,cat,it,big){
  if(cat==='pawn'&&big){
    pv.innerHTML='';pv.className=(pv.className||'')+' pcard';pv.style.background='radial-gradient(circle at 50% 40%,#5a6cff55,transparent 65%),linear-gradient(#2a1a6a,#140a3a)';
    var strip=document.createElement('div');strip.className='pstrip';for(var i=0;i<5;i++){var q=document.createElement('i');strip.appendChild(q);}pv.appendChild(strip);
    var me=document.createElement('div');me.className='pmini me';var tmp=document.createElement('div');pi(tmp,'pawn',it,false);me.appendChild(tmp.firstChild);pv.appendChild(me);
    var rv=document.createElement('div');rv.className='pmini rival';rv.innerHTML='<div class="pawn s-red"><div class="pin"><div class="bob"><div class="foot"></div><div class="body"></div><div class="head"></div></div></div></div>';pv.appendChild(rv);
    var b=document.createElement('button');b.type='button';b.className='dplay';b.textContent='▶';b.setAttribute('aria-label','Play the bump animation');pv.appendChild(b);
    function play(){
      var fx=fxOf(it);me.style.setProperty('--y','0');rv.style.opacity='1';rv.classList.remove('gone');
      var step=0;var iv=setInterval(function(){step++;me.style.setProperty('--y',String(step));me.classList.remove('hopa');void me.offsetWidth;me.classList.add('hopa');
        if(step>=3){clearInterval(iv);setTimeout(function(){
          var w=document.createElement('b');w.className='pword';w.textContent=fx.w;pv.appendChild(w);setTimeout(function(){w.remove();},1300);
          for(var k=0;k<10;k++){var s=document.createElement('i');s.className='pspark';s.textContent=fx.c[k%fx.c.length];s.style.setProperty('--dx',(Math.cos(k/10*6.28)*70).toFixed(0)+'px');s.style.setProperty('--dy',(Math.sin(k/10*6.28)*50).toFixed(0)+'px');pv.appendChild(s);setTimeout(function(n){n.remove();}.bind(null,s),1200);}
          rv.classList.add('gone');setTimeout(function(){me.style.setProperty('--y','0');rv.classList.remove('gone');},1800);
        },200);}},380);
    }
    b.addEventListener('click',play);setTimeout(play,500);
    return;
  }
  return pi(pv,cat,it,big);
};
/* Trail: a sparkle trail behind your moving pawns (Settings) */
var ml=moveLocal;
moveLocal=async function(seat,i,roll,gid){
  var pl=S.players.filter(function(p){return p.seat===seat;})[0],on=set.trail&&pl&&mine(pl)&&!pl.bot;
  var iv=null;if(on){var pw=PW[seat][i];iv=setInterval(function(){var r=pw.el.getBoundingClientRect();if(!r.width)return;var t=document.createElement('i');t.className='trailp';t.textContent=['✨','⭐','💫'][Math.floor(Math.random()*3)];t.style.left=(r.left+r.width/2)+'px';t.style.top=(r.top+r.height*.8)+'px';document.body.appendChild(t);setTimeout(function(){t.remove();},700);},70);}
  try{return await ml(seat,i,roll,gid);}finally{if(iv)clearInterval(iv);}
};
(function(){var s=$('#ov-settings .sb');if(!s)return;var row=document.createElement('label');row.className='row';row.setAttribute('for','s-trail');
  row.innerHTML='<span>Pawn trail<small>Sparkles behind your pawns when they move</small></span><input class="sw" type="checkbox" id="s-trail" role="switch">';
  var a=$('#s-auto');var ref=a?a.closest('.row'):null;if(ref&&ref.parentNode)ref.parentNode.insertBefore(row,ref.nextSibling);else s.appendChild(row);
  var cb=row.querySelector('input');cb.checked=!!set.trail;cb.addEventListener('change',function(){set.trail=cb.checked;save();});})();
/* store: collection counter, rarity filter, owned filter, search */
var Q={q:'',r:'all',own:'all'};
var rc=renderColl;
renderColl=function(){
  rc();
  if(storeTop!=='shop'||collTab==='emo')return;
  var box=$('#c-items'),cards=[].slice.call(box.querySelectorAll('.item'));
  var list=ITEMS[collTab],ownedN=list.filter(function(it){return owned(collTab,it.id);}).length;
  var bar=document.createElement('div');bar.className='sbar';
  bar.innerHTML='<div class="scount"><b>'+CATNAME[collTab]+' collection</b><span>'+ownedN+' / '+list.length+' owned</span><i style="width:'+(ownedN/list.length*100)+'%"></i></div>'+
    '<input class="field ssearch" id="c-search" type="search" placeholder="Search" aria-label="Search the store">'+
    '<div class="sfil" id="c-rar"></div><div class="sfil" id="c-own"></div>';
  box.insertBefore(bar,box.firstChild);
  var inp=bar.querySelector('#c-search');inp.value=Q.q;
  [['all','All'],['common','Common'],['rare','Rare'],['epic','Epic'],['legendary','Legendary']].forEach(function(r){var b=document.createElement('button');b.type='button';b.textContent=r[1];b.setAttribute('aria-pressed',String(Q.r===r[0]));b.addEventListener('click',function(){Q.r=r[0];renderColl();});bar.querySelector('#c-rar').appendChild(b);});
  [['all','Everything'],['own','Owned'],['not','Not owned']].forEach(function(r){var b=document.createElement('button');b.type='button';b.textContent=r[1];b.setAttribute('aria-pressed',String(Q.own===r[0]));b.addEventListener('click',function(){Q.own=r[0];renderColl();});bar.querySelector('#c-own').appendChild(b);});
  var vis=ITEMS[collTab].filter(function(it){return collTab!=='pawn'||pawnGrp==='all'||it.grp===pawnGrp;});
  function apply(){var q=Q.q.trim().toLowerCase(),shown=0;
    cards.forEach(function(c,k){var it=vis[k];if(!it)return;var ok=(!q||it.name.toLowerCase().indexOf(q)>=0)&&(Q.r==='all'||it.r===Q.r)&&(Q.own==='all'||(Q.own==='own')===owned(collTab,it.id));c.hidden=!ok;if(ok)shown++;});
    var e=box.querySelector('.sempty');if(!shown){if(!e){e=document.createElement('p');e.className='note sempty';e.textContent='Nothing matches. Try another search or filter.';box.appendChild(e);}}else if(e)e.remove();}
  inp.addEventListener('input',function(){Q.q=inp.value;apply();});apply();
};
})();
