/* ===== people pictures: drawn, original; skin, hair, beard, glasses ===== */
var SKIN=['#f6d2b8','#eab48e','#c98a5e','#a8693f','#7a4a2a','#5a341c'];
var PEOPLE=[
 {s:1,h:'short',hc:'#3a2414',sh:'#2f6fe0',bg:'#9fd0ff'},
 {s:4,h:'long',hc:'#1a1010',sh:'#e0397a',bg:'#ffc2dc'},
 {s:3,h:'afro',hc:'#1a1010',sh:'#f5a40e',bg:'#ffe08a',b:1},
 {s:0,h:'bun',hc:'#d9a441',sh:'#27ad3b',bg:'#b9f0c0'},
 {s:5,h:'buzz',hc:'#120a06',sh:'#7a3ee0',bg:'#d8c2ff',b:1},
 {s:2,h:'pony',hc:'#5a2a12',sh:'#ff7a2a',bg:'#ffd0a8',g:1},
 {s:0,h:'short',hc:'#b84a1a',sh:'#1e9e8a',bg:'#a8f0e4',g:1},
 {s:4,h:'locs',hc:'#1a1010',sh:'#e8394a',bg:'#ffb0b0'},
 {s:1,h:'curly',hc:'#2a1a10',sh:'#4c6cff',bg:'#c2ccff'},
 {s:2,h:'hijab',hc:'#2f6fe0',sh:'#2f6fe0',bg:'#cfe6ff'},
 {s:3,h:'bald',hc:'#000',sh:'#3a3a48',bg:'#e0e0ea',b:1,g:1},
 {s:0,h:'long',hc:'#f0d27a',sh:'#9a3ee0',bg:'#e8d0ff'},
 {s:5,h:'bun',hc:'#120a06',sh:'#ffcc1a',bg:'#fff0a8'},
 {s:2,h:'short',hc:'#8a8a90',sh:'#5a3a14',bg:'#f0dcc0',b:1,g:1},
 {s:1,h:'pony',hc:'#1a1010',sh:'#1673d6',bg:'#a8dcff'},
 {s:4,h:'curly',hc:'#1a1010',sh:'#27ad3b',bg:'#c8f5c0'}
];
function shade(c,k){var n=parseInt(c.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;function f(x){return Math.max(0,Math.min(255,Math.round(x*k)));}return '#'+((1<<24)+(f(r)<<16)+(f(g)<<8)+f(b)).toString(16).slice(1);}
function person(o){
  var sk=SKIN[o.s],sd=shade(sk,.85),hc=o.hc,back='',front='',x='';
  if(o.h==='long')back='<path d="M28 44 Q26 18 50 17 Q74 18 72 44 L75 82 Q50 90 25 82Z" fill="'+hc+'"/>';
  if(o.h==='afro')back='<circle cx="50" cy="36" r="27" fill="'+hc+'"/><circle cx="28" cy="44" r="10" fill="'+hc+'"/><circle cx="72" cy="44" r="10" fill="'+hc+'"/>';
  if(o.h==='locs')back='<path d="M27 40 Q28 16 50 16 Q72 16 73 40 L76 80 L68 80 L67 50 L33 50 L32 80 L24 80Z" fill="'+hc+'"/>';
  if(o.h==='hijab')back='<path d="M24 50 Q22 14 50 13 Q78 14 76 50 L80 92 L20 92Z" fill="'+hc+'"/>';
  if(o.h==='pony')back='<path d="M66 30 Q86 34 80 62 Q76 50 68 44Z" fill="'+hc+'"/>';
  if(o.h==='bun')back='<circle cx="50" cy="15" r="10" fill="'+hc+'"/>';
  if(o.h==='short')front='<path d="M30 42 Q29 18 50 18 Q71 18 70 42 Q67 29 54 28 Q44 33 30 42Z" fill="'+hc+'"/>';
  if(o.h==='buzz')front='<path d="M31 38 Q31 20 50 20 Q69 20 69 38 Q60 27 50 27 Q40 27 31 38Z" fill="'+hc+'" opacity=".9"/>';
  if(o.h==='long'||o.h==='pony'||o.h==='bun')front='<path d="M30 42 Q30 19 50 19 Q70 19 70 42 Q64 27 50 29 Q38 31 30 42Z" fill="'+hc+'"/>';
  if(o.h==='afro')front='<path d="M31 38 Q34 24 50 24 Q66 24 69 38 Q58 31 50 31 Q42 31 31 38Z" fill="'+hc+'"/>';
  if(o.h==='curly')front='<g fill="'+hc+'">'+[[32,34],[38,25],[47,21],[56,21],[64,25],[69,33],[42,29],[58,28]].map(function(p){return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="7.5"/>';}).join('')+'</g>';
  if(o.h==='locs')front='<path d="M30 40 Q32 20 50 20 Q68 20 70 40 Q60 30 50 31 Q40 30 30 40Z" fill="'+hc+'"/>';
  if(o.h==='hijab')front='<path d="M29 46 Q29 22 50 22 Q71 22 71 46 Q66 30 50 30 Q34 30 29 46Z" fill="'+shade(hc,.8)+'"/>';
  if(o.b)x+='<path d="M33 50 Q34 68 50 69 Q66 68 67 50 Q64 60 50 61 Q36 60 33 50Z" fill="'+(o.h==='bald'?'#2a1a10':hc)+'"/>';
  if(o.g)x+='<g fill="none" stroke="#1a1a2a" stroke-width="2"><circle cx="42" cy="46" r="5.5"/><circle cx="58" cy="46" r="5.5"/><path d="M47.5 46h5"/></g>';
  return '<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" fill="'+o.bg+'"/>'+back+
   '<path d="M12 104 Q14 76 50 72 Q86 76 88 104Z" fill="'+o.sh+'"/><path d="M40 72 Q50 82 60 72" fill="none" stroke="'+shade(o.sh,.7)+'" stroke-width="3"/>'+
   '<rect x="43" y="58" width="14" height="16" rx="5" fill="'+sd+'"/>'+
   '<circle cx="30" cy="47" r="4.5" fill="'+sd+'"/><circle cx="70" cy="47" r="4.5" fill="'+sd+'"/>'+
   '<ellipse cx="50" cy="44" rx="20" ry="23" fill="'+sk+'"/>'+front+
   '<circle cx="42" cy="46" r="2.4" fill="#1a1010"/><circle cx="58" cy="46" r="2.4" fill="#1a1010"/>'+
   '<path d="M38 39 q4 -2.5 8 0M54 39 q4 -2.5 8 0" stroke="'+shade(o.hc==='#2f6fe0'?'#3a2414':hc,.9)+'" stroke-width="2" fill="none" stroke-linecap="round"/>'+
   '<circle cx="38" cy="53" r="3" fill="#ff7a7a" opacity=".25"/><circle cx="62" cy="53" r="3" fill="#ff7a7a" opacity=".25"/>'+
   '<path d="M44 55 Q50 60 56 55" stroke="#7a2a1a" stroke-width="2.2" fill="none" stroke-linecap="round"/>'+x+'</svg>';
}
var BLANK='<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" fill="#cfd3dc"/><circle cx="50" cy="40" r="17" fill="#9aa1b0"/><path d="M16 100 Q18 66 50 64 Q82 66 84 100Z" fill="#9aa1b0"/></svg>';
var PETS=['a_bear','a_fox','a_panda','a_lion','a_tiger','a_rabbit','a_monkey','a_koala','a_penguin','a_owl','a_unicorn','a_dragon','a_wizard','a_astronaut','a_alien','a_shark','a_octopus','ghost','a_queen'];
/* frames: same set as the store; Epic/Legendary ones move */
var FRAMES={
 gold:{n:'Gold',c:'conic-gradient(from 20deg,#ffe28a,#b87a1b,#fff0b4,#b87a1b,#ffe28a)',d:[['✨',96,4,.8,'t']]},
 silver:{n:'Silver',c:'conic-gradient(from 20deg,#ffffff,#8e949c,#e8ecf0,#8e949c,#ffffff)',d:[['✨',96,2,.8,'t'],['✨',4,96,.6,'t']]},
 leaf:{n:'Leaf',c:'conic-gradient(from 20deg,#c6f58f,#2f8f3a,#e8ffc4,#2f8f3a,#c6f58f)',d:[['🍃',-2,-2,1.1,'w'],['🌿',100,100,1.1,'w'],['🐞',98,8,.7,'b']]},
 flame:{n:'Flame',c:'conic-gradient(from 20deg,#ffd24a,#e8431a,#fff0a0,#c4151c,#ffd24a)',d:[['🔥',-4,-6,1.2,'f'],['🔥',100,100,1.2,'f'],['🔥',100,-6,.8,'f']],m:1},
 royal:{n:'Royal',c:'conic-gradient(from 20deg,#e8c4ff,#7a2bd0,#ffe28a,#7a2bd0,#e8c4ff)',d:[['👑',50,-14,1.5,'b'],['💎',-4,100,.8,'t'],['💎',100,100,.8,'t']],m:1},
 rainbow:{n:'Rainbow',c:'conic-gradient(from 0deg,#ff5a5a,#ffd24a,#6cf28a,#4cc9ff,#b06bff,#ff5a5a)',d:[['🌈',50,-12,1.5,'b'],['☁️',-6,100,1,'w'],['☁️',104,100,1,'w'],['✨',100,0,.8,'t']],m:1}
};
var me={av:'h0',photo:'',fl:'🇯🇲',fr:'royal'};
function picHtml(){
  if(me.photo)return '<img alt="" class="photo" src="'+me.photo+'">';
  if(me.av==='blank')return BLANK;
  if(me.av.charAt(0)==='h')return person(PEOPLE[+me.av.slice(1)]);
  return '<img alt="" class="pet" src="p/'+me.av+'_blue.webp">';
}
function decoHtml(id){var f=FRAMES[id];return f.d.map(function(d){return '<span class="fdc'+(f.m?' fm-'+d[4]:'')+'" style="left:'+d[1]+'%;top:'+d[2]+'%;--s:'+d[3]+'">'+d[0]+'</span>';}).join('')+(f.m?'<span class="fglow"></span>':'');}
function paintFramed(el,extra){el.style.setProperty('--fc',FRAMES[me.fr].c);el.innerHTML='<span class="in">'+picHtml()+'</span>'+decoHtml(me.fr)+(extra||'');}
function sync(){
  paintFramed(document.getElementById('meBtn'),'<span class="lv">7</span>');
  paintFramed(document.getElementById('pav'),'<span class="fl">'+me.fl+'</span>');
  document.querySelectorAll('.av[data-a]').forEach(function(b){b.setAttribute('aria-pressed',String(!me.photo&&b.dataset.a===me.av));});
  document.querySelectorAll('.fl2').forEach(function(b){b.setAttribute('aria-pressed',String(b.textContent===me.fl));});
  document.querySelectorAll('.frb').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.f===me.fr));});
}
function avBtn(box,id,html,label,cls){var b=document.createElement('button');b.className='av'+(cls?' '+cls:'');b.dataset.a=id;b.setAttribute('aria-label',label);b.innerHTML=html;b.onclick=function(){me.av=id;me.photo='';sync();};box.appendChild(b);}
(function(){
  var ppl=document.getElementById('avPeople'),pets=document.getElementById('avs');
  avBtn(ppl,'blank',BLANK,'No picture','blank');
  PEOPLE.forEach(function(o,i){avBtn(ppl,'h'+i,person(o),'Person '+(i+1));});
  var up=document.createElement('label');up.className='av up';up.innerHTML='<span>📷</span>Your photo<input type="file" accept="image/*" hidden>';ppl.appendChild(up);
  up.querySelector('input').addEventListener('change',function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){me.photo=r.result;sync();};r.readAsDataURL(f);});
  if(pets)PETS.forEach(function(a){avBtn(pets,a,'<img alt="" src="p/'+a+'_blue.webp">',a.replace('a_',''));});
  var frs=document.getElementById('frs');Object.keys(FRAMES).forEach(function(k){var b=document.createElement('button');b.className='frb';b.dataset.f=k;b.style.setProperty('--fc',FRAMES[k].c);b.setAttribute('aria-label',FRAMES[k].n+' frame');b.innerHTML='<span class="in" style="display:block"></span><small>'+FRAMES[k].n+'</small>';b.onclick=function(){me.fr=k;sync();};frs.appendChild(b);});
  var fls=document.getElementById('fls');FL.forEach(function(f){var b=document.createElement('button');b.className='fl2';b.textContent=f;b.onclick=function(){me.fl=f;sync();};fls.appendChild(b);});
  sync();
  document.getElementById('meBtn').onclick=function(){document.getElementById('prof').hidden=false;};
})();

/* ===== mode medallions: little pictures of what each mode is ===== */
function pawnS(x,y,s,c){return '<g transform="translate('+x+' '+y+') scale('+s+')"><ellipse cx="0" cy="13" rx="9" ry="3" fill="rgba(0,0,0,.25)"/><path d="M-8 12 Q-7 2 -3 -1 L3 -1 Q7 2 8 12Z" fill="'+c+'" stroke="#fff" stroke-width="1.2"/><circle cx="0" cy="-5" r="5.5" fill="'+c+'" stroke="#fff" stroke-width="1.2"/><circle cx="-1.8" cy="-7" r="1.6" fill="#fff" opacity=".7"/></g>';}
function medBg(a,b){return '<defs><radialGradient id="g'+a.slice(1)+'" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></radialGradient></defs><circle cx="40" cy="40" r="40" fill="url(#g'+a.slice(1)+')"/>';}
var MODES={
 classic:{n:'Classic',d:'The standard race. Four pawns each. Roll a 6 to leave home.',r:['Four pawns each.','Roll a 6 to bring a pawn out.','Land on a rival to send it back home.','First to get all four pawns home wins.'],
  a:medBg('#5a9bff','#1d3c86')+'<rect x="16" y="16" width="48" height="48" rx="6" fill="#fff"/><rect x="18" y="18" width="18" height="18" rx="3" fill="#e8394a"/><rect x="44" y="18" width="18" height="18" rx="3" fill="#27ad3b"/><rect x="18" y="44" width="18" height="18" rx="3" fill="#2f6fe0"/><rect x="44" y="44" width="18" height="18" rx="3" fill="#ffc21a"/><path d="M36 36 L44 36 L40 40Z" fill="#27ad3b"/><path d="M44 36 L44 44 L40 40Z" fill="#ffc21a"/><path d="M44 44 L36 44 L40 40Z" fill="#2f6fe0"/><path d="M36 44 L36 36 L40 40Z" fill="#e8394a"/>'},
 blitz:{n:'Blitz',d:'Only 2 pawns each. Short, fast games.',r:['Only two pawns each.','Games take about 5 minutes.','Everything else is like Classic.'],
  a:medBg('#c58bff','#45168f')+'<path d="M44 10 L24 44 L38 44 L32 70 L56 32 L42 32 L50 10Z" fill="#ffd24a" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>'+pawnS(18,50,1,'#e8394a')+pawnS(62,50,1,'#2f6fe0')},
 hunter:{n:'Hunter',d:'Only start squares are safe. Every bump gives you another roll.',r:['Only the start squares are safe.','Bump a rival to roll again.','Hunt hard: the stars do not protect you.'],
  a:medBg('#ff8a5a','#9a1a14')+pawnS(40,40,1.5,'#ffc21a')+'<g fill="none" stroke="#fff" stroke-width="3"><circle cx="40" cy="40" r="22"/><circle cx="40" cy="40" r="11" stroke-width="2"/><path d="M40 10v12M40 58v12M10 40h12M58 40h12"/></g>'},
 haven:{n:'Safe Haven',d:'Four extra safe squares on the track. Hide and sprint.',r:['Four extra safe squares on the track.','Pawns on a safe square cannot be bumped.','Hide, wait for the right roll, then sprint.'],
  a:medBg('#7af08a','#13702a')+'<path d="M40 12 L62 20 Q62 50 40 68 Q18 50 18 20Z" fill="#fff" stroke="#0d5a1c" stroke-width="2"/><path d="M40 24 l4.5 9.5 10.3 1.2-7.6 7 2 10.2-9.2-5.1-9.2 5.1 2-10.2-7.6-7 10.3-1.2Z" fill="#ffc21a"/>'},
 speed:{n:'Speed Turns',d:'Only 6 seconds per turn. Be quick or the game plays for you.',r:['You get 6 seconds for each turn.','Too slow? The game moves for you.','Great for quick games.'],
  a:medBg('#5ad0ff','#0d4a9a')+'<rect x="35" y="9" width="10" height="7" rx="2" fill="#fff"/><circle cx="40" cy="44" r="24" fill="#fff" stroke="#0d4a9a" stroke-width="3"/><path d="M40 44 L40 20 A24 24 0 0 1 61 33Z" fill="#ff5a5a"/><text x="40" y="56" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="20" fill="#0d4a9a">6s</text>'},
 surprise:{n:'Surprise Squares',d:'Gold ? squares are hidden on the track. Land on one to roll again.',r:['Gold ? squares are on the track.','Land on one to roll again.','Where they are changes each game.'],
  a:medBg('#ff8ac4','#8a1450')+'<rect x="18" y="18" width="44" height="44" rx="9" fill="#ffd24a" stroke="#fff" stroke-width="3" transform="rotate(-8 40 40)"/><text x="40" y="54" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="36" fill="#a45d00" transform="rotate(-8 40 40)">?</text><text x="62" y="20" font-size="12">✨</text>'},
 daily:{n:'Daily Twist',d:'A different rule every day.',r:['A different rule every day.','Today: sixes move your pawn 12 squares.','Come back tomorrow for a new twist.'],
  a:medBg('#5ef0d4','#0d6a5a')+'<rect x="16" y="16" width="48" height="48" rx="7" fill="#fff"/><rect x="16" y="16" width="48" height="14" rx="7" fill="#e8394a"/><rect x="16" y="24" width="48" height="6" fill="#e8394a"/><rect x="24" y="11" width="5" height="10" rx="2" fill="#5a3a14"/><rect x="51" y="11" width="5" height="10" rx="2" fill="#5a3a14"/><rect x="29" y="35" width="22" height="22" rx="5" fill="#2f6fe0"/><circle cx="35" cy="41" r="2.2" fill="#fff"/><circle cx="45" cy="51" r="2.2" fill="#fff"/><circle cx="40" cy="46" r="2.2" fill="#fff"/>'}
};
var MODE_ORDER=['classic','blitz','hunter','haven','speed','surprise','daily'];
function medSvg(k){return '<svg viewBox="0 0 80 80" aria-hidden="true">'+MODES[k].a+'</svg>';}

/* ===== setup screen state ===== */
var COLORS=[['blue','Blue','#2f6fe0'],['red','Red','#e8394a'],['green','Green','#27ad3b'],['yellow','Yellow','#f0b400']];
var OPP={blue:'green',green:'blue',red:'yellow',yellow:'red'};
var STEPS=[0,100,500,1000,5000,10000,50000,100000,500000,1000000];
var COINS=10000;
var st={kind:'cpu',n:4,mode:'classic',col:'blue',stake:3,sub:'online'};
var KINDS={cpu:{t:'Computer',card:0},team:{t:'Team 2 vs 2',card:1},pass:{t:'Pass & Play',card:2},online:{t:'Online',card:3}};
function fmt(n){return n.toLocaleString('en-US');}
function short(n){return n>=1e6?(n/1e6)+'M':n>=1e3?(n/1e3)+'K':String(n);}
function openSetup(kind){st.kind=kind;st.n=kind==='team'?4:(kind==='online'?2:4);st.pass=null;st.sub='online';document.getElementById('sTitle').textContent=KINDS[kind].t;renderSetup();document.getElementById('setup').hidden=false;centerMode(false);}
function closeSetup(){document.getElementById('setup').hidden=true;}
function segHtml(opts,cur,fn){return opts.map(function(o){return '<button aria-pressed="'+(o[0]===cur)+'" onclick="'+fn+'(\''+o[0]+'\')">'+o[1]+'</button>';}).join('');}
function setN(v){st.n=+v;renderSetup();}
function setSub(v){st.sub=v;renderSetup();}
function renderSetup(){
  var seg=document.getElementById('sSeg');
  if(st.kind==='team'){seg.innerHTML=segHtml([['online','Online'],['friends','Friends']],st.sub,'setSub');}
    else seg.innerHTML=segHtml([['2','2 Players'],['4','4 Players']],String(st.n),'setN');
  if(st.kind==='online'){seg.insertAdjacentHTML('afterend','');}
  renderPawns();renderBet();
  var play=document.getElementById('sPlay'),join=document.getElementById('sJoin');
  var friends=st.kind==='team'&&st.sub==='friends';
  join.hidden=!friends;
  play.textContent=friends?'CREATE TABLE':(st.kind==='online'||(st.kind==='team'&&st.sub==='online'))?'FIND PLAYERS':'PLAY';
  play.disabled=st.kind!=='pass'&&STEPS[st.stake]>COINS;
}
var CUSTOM=[['white','White','#e6e9f0'],['purple','Purple','#8a3ee0'],['orange','Orange','#ff8a1a'],['pink','Pink','#ff4aa0'],['teal','Teal','#14b8a6'],['black','Black','#33363f'],['brown','Brown','#8a4a1e'],['gold','Gold','#e0a810'],['sky','Sky','#38bdf8'],['lime','Lime','#84cc16']];
st.seat='blue';st.cust=0;st.useCust=false;
function myImg(){return 'pc/'+(st.useCust?CUSTOM[st.cust][0]:st.seat)+'.webp';}
function myHex(){return st.useCust?CUSTOM[st.cust][2]:COLORS.filter(function(c){return c[0]===st.seat;})[0][2];}
var ROW=['blue','yellow','green','red'];
function renderPawns(){
  var g=document.getElementById('pwg'),cpu=st.kind==='cpu'||(st.kind==='team'&&st.sub==='cpu');
  /* seats: only on Vs Computer (big enough to see who is who); other modes use the small row only */
  if(st.kind==='cpu'){
    g.hidden=false;
    g.innerHTML=COLORS.map(function(c){
      var k=c[0],you=k===st.seat,tag='',dim=false,src='pc/'+k+'.webp';
      if(you){tag='YOU';src=myImg();}
      else if(st.n===2&&k!==OPP[st.seat]){dim=true;}
      else tag='COMPUTER';
      return '<div class="pw'+(you?' you':'')+(dim?' dim':'')+'" style="--pc:'+(you?myHex():c[2])+'"><img alt="" src="'+src+'">'+(tag?'<span class="tag">'+tag+'</span>':'')+'</div>';
    }).join('');
  } else {g.hidden=true;g.innerHTML='';}
  var row=document.getElementById('crow');
  row.innerHTML=ROW.map(function(k){var c=COLORS.filter(function(x){return x[0]===k;})[0],on=!st.useCust&&st.seat===k;
    return '<button class="cp'+(on?' on':'')+'" aria-pressed="'+on+'" aria-label="'+c[1]+'" onclick="pick(\''+k+'\')"><img alt="" src="pc/'+k+'.webp"></button>';}).join('')+
    '<button class="cp cust'+(st.useCust?' on':'')+'" aria-pressed="'+st.useCust+'" aria-label="Pick your own colour" onclick="pickCust()"><img alt="" src="pc/'+CUSTOM[st.cust][0]+'.webp"><span class="pen">🎨</span></button>';
  var pal=document.getElementById('pal');pal.hidden=!st.useCust;
  if(st.useCust){document.getElementById('sw').innerHTML=CUSTOM.map(function(c,i){return '<button class="sw1'+(i===st.cust?' on':'')+'" style="--pc:'+c[2]+'" aria-label="'+c[1]+'" onclick="setCust('+i+')"></button>';}).join('');}
  var h=document.getElementById('hint2');
  h.textContent=st.useCust?'Your own colour: '+CUSTOM[st.cust][1]+' · you still sit in the '+st.seat+' corner':st.kind==='team'?'Your partner sits across from you':st.kind==='pass'?'Each friend picks a colour when the game starts':'';
}
function pick(k){st.seat=k;st.useCust=false;renderPawns();}
function pickCust(){st.useCust=true;renderPawns();}
function setCust(i){st.cust=i;st.useCust=true;renderPawns();}
function cycle(d){st.cust=(st.cust+d+CUSTOM.length)%CUSTOM.length;st.useCust=true;renderPawns();}
function prizeOf(stake,players,team){return team?{pot:stake*4,each:stake*2}:{pot:stake*players};}
function renderBet(){
  var box=document.getElementById('sBet');
  if(st.kind==='pass'){box.innerHTML='<div class="free">👨‍👩‍👧 Friends on one phone · free game, no entry fee<br>Winner earns XP and a chest</div>';return;}
  var s=STEPS[st.stake],team=st.kind==='team',p=prizeOf(s,st.n,team),lock=s>COINS;
  var who=team?'YOUR TEAM WINS':'WINNER TAKES ALL';
  var why=s===0?'Free game · win XP and a chest':team?fmt(s)+' × 4 players · '+fmt(p.each)+' each':fmt(s)+' × '+st.n+' players';
  box.innerHTML='<div class="bet"><div class="brow"><button class="step" aria-label="Lower entry" onclick="stepBet(-1)"'+(st.stake===0?' disabled':'')+'>−</button><div class="bval'+(lock?' lock':'')+'"><small>ENTRY</small><b>'+(s?'🪙 '+fmt(s):'FREE')+(lock?' 🔒':'')+'</b></div><button class="step" aria-label="Raise entry" onclick="stepBet(1)"'+(st.stake===STEPS.length-1?' disabled':'')+'>+</button></div>'+
    '<div class="pz"><span class="tro">🏆</span><div><small>'+who+'</small><b>'+(s?'🪙 '+fmt(p.pot):'XP + chest')+'</b><em>'+why+'</em></div></div>'+
    (lock?'<div class="need">You need 🪙 '+fmt(s-COINS)+' more coins for this table</div>':'')+'</div>';
}
function stepBet(d){st.stake=Math.max(0,Math.min(STEPS.length-1,st.stake+d));renderSetup();}
/* mode row */
(function(){
  var row=document.getElementById('mrow');
  row.innerHTML=MODE_ORDER.map(function(k){return '<button class="md" data-m="'+k+'" aria-label="'+MODES[k].n+'"><span class="med">'+medSvg(k)+'</span><span>'+MODES[k].n+'</span></button>';}).join('');
  row.querySelectorAll('.md').forEach(function(b){b.onclick=function(){st.mode=b.dataset.m;centerMode(true);};});
  var t;row.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(function(){var mid=row.scrollLeft+row.clientWidth/2,best=null,bd=1e9;row.querySelectorAll('.md').forEach(function(b){var c=b.offsetLeft+b.offsetWidth/2,dd=Math.abs(c-mid);if(dd<bd){bd=dd;best=b;}});if(best&&best.dataset.m!==st.mode){st.mode=best.dataset.m;markMode();}},90);});
})();
function markMode(){document.querySelectorAll('.md').forEach(function(b){b.classList.toggle('on',b.dataset.m===st.mode);b.setAttribute('aria-pressed',String(b.dataset.m===st.mode));});document.getElementById('mdesc').textContent=MODES[st.mode].d;}
function centerMode(smooth){markMode();var row=document.getElementById('mrow'),b=row.querySelector('[data-m="'+st.mode+'"]');row.scrollTo({left:b.offsetLeft+b.offsetWidth/2-row.clientWidth/2,behavior:smooth?'smooth':'auto'});}
function modeInfo(){var m=MODES[st.mode];document.getElementById('miArt').innerHTML=medSvg(st.mode);document.getElementById('miName').textContent=m.n;document.getElementById('miList').innerHTML=m.r.map(function(x){return '<li>'+x+'</li>';}).join('');document.getElementById('minfo').hidden=false;}
document.getElementById('sPlay').onclick=function(){var s=STEPS[st.stake];tip(st.kind==='pass'?'Game starts':'Entry 🪙 '+fmt(s)+' paid · game starts');};

/* chest slots: only chests you can win (Iron, Silver, Gold; Crystal from 500K+ games) */
var CINFO={iron:['500 – 1,000','2 – 4','2h'],silver:['1,000 – 2,500','3 – 6','4h'],gold:['5,000 – 10,000','8 – 15','8h'],crystal:['15,000 – 30,000','20 – 40','12h']};
var SLOTS=[{t:'gold',s:'open',from:'100,000'},{t:'silver',s:'run',left:'2h 14m',from:'5,000'},{t:'iron',s:'wait',from:'1,000'},null];
function renderSlots(){
  var cr=document.getElementById('chests');cr.innerHTML='';
  SLOTS.forEach(function(c,i){var b=document.createElement('button');
    if(!c){b.className='ch2 empty';b.innerHTML='<span class="lk">🔒</span><small>Win a game<br>to get a chest</small>';b.onclick=function(){tip('Win a game to get a chest');};}
    else{var o=c.s==='open';b.className='ch2 '+c.t+(o?' ready':'');b.style.setProperty('--tile',CH2[c.t].tile);
      b.innerHTML='<span class="cn">'+CH2[c.t].n+'</span>'+chestSvg(c.t,o)+(o?'<span class="pill go">OPEN!</span>':c.s==='wait'?'<span class="pill st">▶ '+CINFO[c.t][2]+'</span>':'<span class="pill tm">⏱ '+c.left+'</span>');
      b.onclick=function(){chestWin(i);};}
    cr.appendChild(b);});
}
function chestWin(i){
  var c=SLOTS[i],o=c.s==='open',inf=CINFO[c.t],ov=document.getElementById('onech');
  var btns=o?'<button class="cbtn green" onclick="collect('+i+')">COLLECT</button>':c.s==='wait'?'<button class="cbtn yellow" onclick="startCh('+i+')">START UNLOCK · '+inf[2]+'</button><button class="cbtn blue" onclick="tip(\'Short video plays, then the chest opens\')">▶ OPEN NOW · watch a video</button>':'<div class="cleft">Opens in <b>'+c.left+'</b></div><button class="cbtn blue" onclick="tip(\'Short video plays, then the chest opens\')">▶ OPEN NOW · watch a video</button>';
  ov.innerHTML='<div class="sheet one" style="--tile:'+CH2[c.t].tile+'"><div class="rib">'+CH2[c.t].n.toUpperCase()+' CHEST</div><button class="x" aria-label="Close" onclick="document.getElementById(\'onech\').hidden=true">✕</button>'+
    '<div class="bigch'+(o?' ready':'')+'">'+chestSvg(c.t,o)+'</div><div class="inside"><span>🪙 '+inf[0]+'</span><span>💎 '+inf[1]+'</span></div><p class="won">Won in a 🪙 '+c.from+' game</p>'+btns+'</div>';
  ov.hidden=false;
}
function startCh(i){SLOTS[i].s='run';SLOTS[i].left=CINFO[SLOTS[i].t][2]+' 0m';renderSlots();chestWin(i);}
function collect(i){var t=SLOTS[i].t;SLOTS[i]=null;renderSlots();document.getElementById('onech').hidden=true;tip(CH2[t].n+' chest: coins and diamonds added!');}
(function(){var ov=document.createElement('div');ov.className='ov';ov.id='onech';ov.hidden=true;document.getElementById('scr').appendChild(ov);renderSlots();})();
/* mode cards: people instead of animals */
(function(){
  function pb(i,css){return '<span class="pb" style="'+css+'">'+person(PEOPLE[i])+'</span>';}
  var c=document.querySelector('.card.gold .art');
  c.querySelectorAll('img').forEach(function(n){if(n.src.indexOf('robot')<0)n.remove();});
  var r=c.querySelector('img');r.style.cssText='height:60%;right:6%;bottom:8%;left:auto';
  var d=c.querySelector('.dice');d.style.cssText='width:26%;left:38%;top:2%;transform:rotate(14deg)';
  c.insertAdjacentHTML('beforeend',pb(0,'width:40%;left:6%;bottom:8%'));
  c=document.querySelector('.card.purple .art');c.querySelectorAll('img').forEach(function(n){n.remove();});
  c.insertAdjacentHTML('beforeend',pb(3,'width:30%;left:4%;top:4%')+pb(1,'width:30%;left:16%;bottom:6%')+pb(2,'width:30%;right:4%;top:4%')+pb(9,'width:30%;right:16%;bottom:6%'));
  c=document.querySelector('.card.pink .art');c.querySelectorAll('img').forEach(function(n){n.remove();});
  c.insertAdjacentHTML('beforeend',pb(5,'width:34%;left:4%;bottom:6%')+pb(7,'width:34%;right:4%;bottom:6%'));
  c=document.querySelector('.card.blue .art');c.querySelectorAll('img').forEach(function(n){n.remove();});
  c.insertAdjacentHTML('beforeend',pb(4,'width:34%;left:4%;bottom:6%')+pb(11,'width:34%;right:4%;bottom:6%'));
})();
