/* ===================== Ludora 1.9: no Lucky Rolls. Every roll is a plain 1 in 6, for everyone, in every mode. ===================== */
(function(){
luckyValue=function(){S.luckPick=null;return 0;};
openLuck=function(){};
luckSync=function(){var r=document.getElementById('luckrow');if(r)r.hidden=true;};
lkHomeSync=function(){};
try{S.luckPick=null;S.remoteLk=null;}catch(e){}
try{if(set.lk||set.lkd){delete set.lk;delete set.lkd;delete set.lkv;save();}}catch(e){}
/* no Lucky goals or achievements */
try{for(var i=GOALS.length-1;i>=0;i--)if(GOALS[i].k==='l')GOALS.splice(i,1);}catch(e){}
try{var T=window.V2&&V2.TACH||TACH;for(var j=T.length-1;j>=0;j--)if(T[j].k==='u')T.splice(j,1);}catch(e){}
try{if(set.dg&&set.dg.ids){set.dg.ids=set.dg.ids.filter(function(x){return x!=='luck1';});}}catch(e){}
/* remove every Lucky button, row and window */
var SEL='#luckrow,#ov-luck,#h-luck,#g-luck,#g-lkn,#lk11,.lkw11,#lk-vid,.t9.yellow';
function sweep(){document.querySelectorAll(SEL).forEach(function(e){if(e.classList.contains('t9')&&!/clover/.test(e.innerHTML))return;e.style.setProperty('display','none','important');e.setAttribute('aria-hidden','true');if(e.id==='ov-luck')e.hidden=true;});}
sweep();setInterval(sweep,700);
})();
/* ===================== finishing-move words: each in its character's colours, thick outline, glow ===================== */
(function(){
var WC={},PAL=['#ff5a3c','#ffb02a','#3ad0ff','#9a6bff','#4be07a','#ff5aa0','#ffd23a','#5fb8ff'];
function wcol(t){
  if(WC[t])return WC[t];var c=null,u=t.toUpperCase();
  try{Object.keys(SPECIALFX).forEach(function(k){var f=SPECIALFX[k];if(f&&f.w&&String(f.w).toUpperCase()===u&&(f.col||f.c))c=f.col||f.c;});}catch(e){}
  if(!c){var h=0;for(var i=0;i<u.length;i++)h=(h*31+u.charCodeAt(i))>>>0;c=PAL[h%PAL.length];}
  return WC[t]=c;
}
var SEL='.pword,.k2word,.bump,.fin9 .word,.lgword';
function dress(e){
  var t=(e.textContent||'').trim();if(!t||!/[A-Za-zÀ-ɏͰ-ϿЀ-ӿ֐-ۿऀ-ॿ一-鿿ぁ-ヿ가-힯]/.test(t))return;
  e.dataset.t=t;
  if(!e.dataset.w14){e.dataset.w14=1;var c='';try{c=(getComputedStyle(e).getPropertyValue('--c')||'').trim();}catch(x){}if(!c||c==='transparent')c=wcol(t);e.style.setProperty('--wc',c);e.classList.add('w14');
    try{if(getComputedStyle(e).position==='static')e.style.position='relative';}catch(x){}}
}
new MutationObserver(function(ms){
  ms.forEach(function(m){
    if(m.type==='characterData'){var p=m.target.parentElement;p=p&&p.closest&&p.closest('.w14');if(p)dress(p);return;}
    m.addedNodes.forEach(function(n){if(n.nodeType!==1){var p=n.parentElement;p=p&&p.closest&&p.closest('.w14');if(p)dress(p);return;}
      if(n.matches&&n.matches(SEL))dress(n);else if(n.closest&&n.closest('.w14'))dress(n.closest('.w14'));
      if(n.querySelectorAll)n.querySelectorAll(SEL).forEach(dress);});
  });
}).observe(document.body,{childList:true,subtree:true,characterData:true});
document.querySelectorAll(SEL).forEach(dress);
})();
/* ===================== Live content: new items, events and pictures that arrive without a Play Store update =====================
   The app downloads a content pack (pictures + live.json) in the background. live.json is plain data, never code:
   { "items": {"die":[...], "board":[...], "frame":[...], "pawn":[...]},      new or changed items ("like":"<id>" copies an existing item first)
     "src": {"die:e_spellbook":{"shop":1}, "board:sakura":{"vid":40}, "pawn:p_wolf":{"ev":1}},   where an item comes from
     "guardians": {"l_icepalace":["r5_03","Frost Queen"]}, "guardianOn":["r5_03"],               turn a guardian's ▶ on
     "anim": ["face04"], "atlas": {...}, "holes": {...},                                         animated emojis/gifts, frame art
     "inbox": [{"id":"n20a","t":"Title","b":"Message","d":"Dec 2026"}], "themes": [["Frost Fest","wk3","#5fb8ff"]] } */
(function(){
var L={};
try{var x=new XMLHttpRequest();x.open('GET','live.json?t='+Date.now(),false);x.send();if(x.status===200&&x.responseText)L=JSON.parse(x.responseText)||{};}catch(e){L={};}
window.__LIVE=L;
function ok(o){return o&&typeof o==='object';}
try{if(ok(L.items))Object.keys(L.items).forEach(function(cat){
  if(!ITEMS[cat]||!Array.isArray(L.items[cat]))return;
  L.items[cat].forEach(function(n){
    if(!ok(n)||!n.id)return;var id=String(n.id),ex=ITEMS[cat].filter(function(x){return String(x.id)===id;})[0];
    var base=n.like?ITEMS[cat].filter(function(x){return String(x.id)===String(n.like);})[0]:null;
    var o=Object.assign({},base||{},n);delete o.like;o.id=id;
    if(ex)Object.assign(ex,o);else ITEMS[cat].push(o);
  });});}catch(e){}
try{if(ok(L.atlas)&&typeof AT19!=='undefined')Object.assign(AT19.M,L.atlas);if(ok(L.holes)&&typeof AT19!=='undefined')Object.assign(AT19.FH,L.holes);}catch(e){}
try{if(ok(L.guardians))Object.keys(L.guardians).forEach(function(k){var g=L.guardians[k];if(Array.isArray(g)&&g.length===2)D19.GD[k]=[String(g[0]),String(g[1])];});}catch(e){}
try{(L.guardianOn||[]).forEach(function(k){delete window.__gdOff[k];});}catch(e){}
try{var A=window.__l19&&__l19.ANIM;if(A)(L.anim||[]).forEach(function(k){A[String(k)]=1;});}catch(e){}
try{var N=window.__l19&&__l19.NEWS;if(N&&Array.isArray(L.inbox))L.inbox.slice().reverse().forEach(function(m){if(ok(m)&&m.id&&!N.some(function(x){return x.id===m.id;}))N.unshift({id:String(m.id),t:String(m.t||''),b:String(m.b||''),d:String(m.d||'')});});}catch(e){}
try{var T=window.__l19&&__l19.THEMES;if(T&&Array.isArray(L.themes)&&L.themes.length){T.length=0;L.themes.forEach(function(t){if(Array.isArray(t)&&t.length>=3)T.push([String(t[0]),String(t[1]),String(t[2])]);});}}catch(e){}

/* download progress + "new items" message from the app */
var pill=null;
function showPill(t){if(!pill){pill=document.createElement('div');pill.className='lv14';document.body.appendChild(pill);}pill.textContent=t;pill.hidden=false;}
window.__liveProgress=function(d,t){if(!t)return;showPill('⬇ '+tr14('Downloading new items')+' '+Math.round(d/t*100)+'%');};
function idle(){try{var w=document.getElementById('ov-welcome');return (w&&!w.hidden)||!S.players||!S.players.length||S.phase==='over';}catch(e){return true;}}
var pending=false;
function apply(){if(pill)pill.hidden=true;try{toast(tr14('New items arrived!'));}catch(e){}setTimeout(function(){location.reload();},1600);}
window.__liveReady=function(v,msg){showPill('✓ '+tr14('New items downloaded'));if(idle())apply();else pending=true;};
setInterval(function(){if(pending&&idle()){pending=false;apply();}},2000);
function tr14(s){try{var r=window.__ludoraLang&&__ludoraLang.tr?__ludoraLang.tr(s):null;return r||s;}catch(e){return s;}}
})();
