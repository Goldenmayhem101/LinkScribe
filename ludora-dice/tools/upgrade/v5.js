
/* ===================== approved pawns: each character has its own kill ===================== */
(function(){
var KD={"critter": {"r": "rare", "k": "burst", "p": ["🌰", "💥", "🐾"], "w": "NIBBLE!"}, "robot": {"r": "rare", "k": "zap", "p": ["⚡", "🔩", "⚙️"], "w": "ZAP!"}, "ghost": {"r": "epic", "k": "spook", "p": ["👻", "💨", "🕸️"], "w": "BOO!"}, "rocket": {"r": "rare", "k": "blast", "p": ["🔥", "💥", "💨"], "w": "BLAST OFF!"}, "a_bear": {"r": "rare", "k": "slam", "p": ["🐾", "💥"], "w": "BEAR HUG!"}, "a_panda": {"r": "rare", "k": "slam", "p": ["🎋", "💥"], "w": "KUNG FU!"}, "a_pup": {"r": "rare", "k": "burst", "p": ["🦴", "🐾", "💥"], "w": "WOOF!"}, "a_fox": {"r": "rare", "k": "swipe", "p": ["🍂", "💨", "🐾"], "w": "SLY SWIPE!"}, "a_lion": {"r": "epic", "k": "roar", "p": ["💢", "🐾", "💥"], "w": "ROAR!"}, "a_tiger": {"r": "epic", "k": "swipe", "p": ["🐾", "💥", "💢"], "w": "POUNCE!"}, "a_rabbit": {"r": "rare", "k": "slam", "p": ["🥕", "💫"], "w": "THUMP!"}, "a_monkey": {"r": "rare", "k": "slam", "p": ["🍌", "💥"], "w": "BANANA BONK!"}, "a_koala": {"r": "rare", "k": "burst", "p": ["🍃", "💤", "💥"], "w": "NAP ATTACK!"}, "a_piglet": {"r": "rare", "k": "splash", "p": ["🟤", "💦", "💥"], "w": "MUD SPLAT!"}, "a_penguin": {"r": "rare", "k": "freeze", "p": ["❄️", "🧊"], "w": "ICE SLIDE!"}, "a_owl": {"r": "rare", "k": "swirl", "p": ["🪶", "🌙", "✨"], "w": "HOOT!"}, "a_duck": {"r": "rare", "k": "splash", "p": ["💦", "🫧"], "w": "QUACK!"}, "a_chick": {"r": "rare", "k": "burst", "p": ["🥚", "🐣", "💥"], "w": "PECK!"}, "a_bee": {"r": "rare", "k": "sting", "p": ["🍯", "💢", "✨"], "w": "BZZZ STING!"}, "a_ladybug": {"r": "rare", "k": "burst", "p": ["🔴", "✨", "🍃"], "w": "LUCKY HIT!"}, "a_butterfly": {"r": "rare", "k": "swirl", "p": ["🌸", "✨", "🦋"], "w": "FLUTTER!"}, "a_spider": {"r": "rare", "k": "web", "p": ["🕸️", "💢"], "w": "WEBBED!"}, "a_clownfish": {"r": "rare", "k": "splash", "p": ["🫧", "🌊"], "w": "SPLASH!"}, "a_shark": {"r": "epic", "k": "chomp", "p": ["🌊", "💦", "🫧"], "w": "CHOMP!"}, "a_octopus": {"r": "epic", "k": "ink", "p": ["🖤", "💦", "🫧"], "w": "INKED!"}, "a_crab": {"r": "rare", "k": "snip", "p": ["✂️", "💦"], "w": "SNIP!"}, "a_whale": {"r": "rare", "k": "splash", "p": ["🌊", "💦", "🐳"], "w": "TIDAL WAVE!"}, "a_puffer": {"r": "rare", "k": "burst", "p": ["💥", "🫧", "📌"], "w": "PUFF POP!"}, "a_ufo": {"r": "legendary", "k": "beam", "p": ["✨", "🌀", "💫"], "w": "ABDUCTED!"}, "a_satellite": {"r": "epic", "k": "zap", "p": ["⚡", "📡", "💥"], "w": "ORBIT ZAP!"}, "a_alien": {"r": "legendary", "k": "zap", "p": ["💚", "⚡", "✨"], "w": "ZAPPED!"}, "a_astronaut": {"r": "legendary", "k": "blast", "p": ["🚀", "⭐", "💥"], "w": "LIFT OFF!"}, "a_comet": {"r": "epic", "k": "meteor", "p": ["🔥", "💥", "⭐"], "w": "METEOR!"}, "a_dragon": {"r": "legendary", "k": "fire", "p": ["🔥", "🔥", "💥"], "w": "BURNED!"}, "a_unicorn": {"r": "legendary", "k": "rainbow", "p": ["🌈", "✨", "💖", "⭐"], "w": "RAINBOW BLAST!"}, "a_wizard": {"r": "legendary", "k": "zap", "p": ["⚡", "🔮", "✨"], "w": "KABOOM!"}, "a_fairy": {"r": "epic", "k": "swirl", "p": ["✨", "🌸", "💫"], "w": "POOF!"}, "a_bat": {"r": "rare", "k": "swirl", "p": ["🦇", "🌙"], "w": "SWOOP!"}, "a_rook": {"r": "rare", "k": "slam", "p": ["🧱", "💥"], "w": "CRUSH!"}, "a_bishop": {"r": "rare", "k": "swirl", "p": ["✨", "💫"], "w": "BLESSED!"}, "a_knight": {"r": "epic", "k": "swipe", "p": ["⚔️", "💥", "🛡️"], "w": "CHARGE!"}, "a_queen": {"r": "legendary", "k": "royal", "p": ["👑", "💎", "✨"], "w": "OFF WITH YOU!"}, "a_king": {"r": "epic", "k": "royal", "p": ["👑", "⚔️", "✨"], "w": "BANISHED!"}};
var CC={fire:'#ff6a1a',rainbow:'#ff7ad9',zap:'#ffe24a',beam:'#b4fff0',royal:'#ffd84d',chomp:'#4dc8ff',ink:'#6a3aff',spook:'#d6d0ff',roar:'#ffb02a',swipe:'#ffffff',meteor:'#ffb02a',blast:'#ff9a2a',freeze:'#bff0ff',splash:'#5ad0ff',web:'#ffffff',sting:'#ffd24a',swirl:'#ffc4f0',slam:'#ffffff',burst:'#ffffff',snip:'#ff7a5a'};
Object.keys(KD).forEach(function(k){if(!SPECIALFX[k])SPECIALFX[k]={w:KD[k].w,k:'magic'};});
function show(gx,gy,pid,victims){
  var K=KD[pid],big=K.r!=='rare',U=CELL,px=gx*U,py=gy*U;
  stage.classList.remove('shake');void stage.offsetWidth;stage.classList.add('shake');setTimeout(function(){stage.classList.remove('shake');},380);
  var box=el('div','k2',pawnsEl);box.style.translate=px+'px '+py+'px';box.style.setProperty('--u',U+'px');box.style.setProperty('--c',CC[K.k]||'#fff');
  function add(cls,html,x,y,st){var e=document.createElement('b');e.className=cls;e.innerHTML=html||'';e.style.left=x+'px';e.style.top=y+'px';if(st)e.setAttribute('style',e.getAttribute('style')+';'+st);box.appendChild(e);return e;}
  add('k2ring','',0,0);var w=add('k2word','',0,-U*1.6);w.textContent=K.w;
  var k=K.k,vpins=(victims||[]).filter(Boolean);
  function vfx(f,ms){vpins.forEach(function(pw){pw.el.style.filter=f;setTimeout(function(){pw.el.style.filter='';},ms);});}
  if(k==='fire'){for(var i=0;i<8;i++)(function(i){setTimeout(function(){add('k2flame','🔥',(Math.random()-.5)*U*1.4,U*.2);},i*70);})(i);vfx('brightness(.2) sepia(1)',1300);}
  else if(k==='beam'){add('k2beam','',0,U*.6);}
  else if(k==='zap'){add('k2bolt','⚡',-U*.5,-U*.6);add('k2bolt','⚡',U*.5,-U*.8);vfx('brightness(2.5)',500);}
  else if(k==='freeze'){add('k2ice','',0,0);}
  else if(k==='web'){add('k2web','🕸️',0,0);}
  else if(k==='rainbow'){add('k2rbw','',0,U*.8);}
  else if(k==='chomp'){add('k2jaw','🦈',0,0);}
  else if(k==='ink'){for(var j=0;j<6;j++)add('k2pt','⚫',0,0,'--dx:'+((Math.random()-.5)*U*1.8).toFixed(0)+'px;--dy:'+((Math.random()-.5)*U*1.4).toFixed(0)+'px;font-size:calc(var(--u)*.8);animation-duration:1.5s');}
  else if(k==='slam'||k==='royal'||k==='meteor'||k==='snip'||k==='sting'){add('k2big',k==='meteor'?'☄️':(k==='snip'?'✂️':(k==='sting'?'🐝':K.p[0])),0,0);}
  else if(k==='spook'){add('k2jaw','👻',0,0);}
  else if(k==='roar'||k==='swipe'){add('k2jaw',k==='roar'?'💢':'🐾',0,0);}
  var n=big?16:10;for(var q=0;q<n;q++){var a=q/n*Math.PI*2,d=U*(1.4+Math.random());add('k2pt',K.p[q%K.p.length],0,0,'--dx:'+(Math.cos(a)*d).toFixed(0)+'px;--dy:'+(Math.sin(a)*d*.8).toFixed(0)+'px;animation-delay:'+(.1+Math.random()*.2).toFixed(2)+'s');}
  if(big){var me=S.players.filter(function(p){return lookOf(p).p===pid;})[0],col=me?SEATS[me.seat]:'blue';add('k2hero','<img alt="" src="pawnset/'+pid+'_'+col+'.webp">',-U*1.7,U*.2);}
  setTimeout(function(){add('k2skull','💀',0,0);for(var b=0;b<(big?4:2);b++)add('k2bone','🦴',0,0,'--dx:'+((b-1.5)*U)+'px;--rot:'+(b%2?280:-280)+'deg;animation-delay:.25s');},big?550:300);
  vpins.forEach(function(pw){try{pw.pin.animate([{opacity:1},{opacity:0,offset:.4},{opacity:0,offset:.9},{opacity:1}],{duration:Math.max(800,1500*SPEED)});}catch(e){}});
  try{sfx.boom();}catch(e){}
  setTimeout(function(){box.remove();},1900);
}
var bf=bumpFx;
bumpFx=function(gx,gy,pid,victims){if(KD[pid])return show(gx,gy,pid,victims);return bf(gx,gy,pid,victims);};
window.__ludoraKill2=show;
})();
