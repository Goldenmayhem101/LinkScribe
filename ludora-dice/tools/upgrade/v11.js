/* ===== Ludora 1.9 layer: Lucky Roll videos only outside matches, home banner slot, 7-day offers ===== */
(function(){
var LUCK_CAP=5;
function trialLeft(cat,id){var t=set.trial&&set.trial[cat+':'+id];return t?Math.max(0,t-Date.now()):0;}
var q11=function(s,r){return (r||document).querySelector(s);};
function lkWatch(after){
  if(luckBank()>=LUCK_CAP){toast('You already have '+LUCK_CAP+' Lucky Rolls.');return;}
  Ads.reward(function(ok){if(!ok){toast('The video did not finish.');return;}
    luckBank();set.lk=Math.min(LUCK_CAP,(+set.lk||0)+1);save();lkHomeSync();toast('+1 Lucky Roll');if(after)after();});
}
window.__lkWatch=lkWatch;


/* ---------- two boards shared the id "carnival": Candy Carnival gets its own; owners keep both ---------- */
(function(){
  var cc=ITEMS.board.filter(function(i){return i.id==='carnival'&&i.fx==='carnival';})[0];
  if(cc){cc.id='candycarn';if(set.own.indexOf('board:carnival')>=0&&set.own.indexOf('board:candycarn')<0){set.own.push('board:candycarn');save();}}
})();

/* ---------- 1. no videos during a match ---------- */
var ol11=openLuck;
openLuck=function(){
  ol11.apply(this,arguments);
  var v=document.getElementById('lk-vid');if(v)v.remove();
  var seat=luckSeat();if(seat<0)return;
  if(luckLeft(seat)<1&&luckBank()<1)$('#lk-left').textContent='No Lucky Rolls left. Get more before your next game, on the Play screen or after a game.';
};

(function(){var ns=document.querySelectorAll('#ov-luck .note'),n=ns[ns.length-1];if(n)n.textContent='You get 3 free Lucky Rolls every day and can save up to 5. Use up to 3 in a game. Get more with a short video on the Play screen, after a game, or on the home screen. Never during a game.';})();

/* ---------- 2. Play (setup) screen: Lucky Rolls row with a +1 video ---------- */
function setupRow(){
  var o=q11('#ov-setup7');if(!o)return;var play=q11('#su7-play',o);if(!play)return;
  var r=q11('#lk11',o);
  if(!r){r=document.createElement('div');r.id='lk11';r.className='lk11';play.parentNode.insertBefore(r,play);}
  var tt=q11('#su7-title',o),pass=!!(tt&&/pass/i.test(tt.textContent));r.hidden=pass;if(pass)return;
  var n=luckBank(),full=n>=LUCK_CAP;
  r.innerHTML='<span class="lk11i">🍀</span><span class="lk11t"><b>Lucky Rolls '+n+' / '+LUCK_CAP+'</b><small>'+(full?'Full. You can use up to '+LUCK_PER_GAME+' in a game.':'Bring some into this game (up to '+LUCK_PER_GAME+').')+'</small></span>'+
    (full?'':'<button type="button" class="lk11b">▶ +1</button>');
  var b=q11('.lk11b',r);if(b)b.addEventListener('click',function(){lkWatch(setupRow);});
}
(function(){var o=q11('#ov-setup7');if(o)new MutationObserver(function(){if(!o.hidden)try{setupRow();}catch(e){}}).observe(o,{attributes:true,attributeFilter:['hidden']});})();

/* ---------- 3. Results screen: optional +1 Lucky Roll for the next game ---------- */
function winRow(){
  var ov=q11('#ov-win');if(!ov||ov.hidden)return;
  var old=q11('.lkw11',ov);if(old)old.remove();
  if(S.mode==='pass'||luckBank()>=LUCK_CAP)return;
  var stack=q11('#x-again',ov);stack=stack&&stack.closest('.stack');if(!stack)return;
  var r=document.createElement('div');r.className='lkw11';
  r.innerHTML='<button type="button" class="lk11b wide">🍀 ▶ +1 Lucky Roll for your next game</button><small>'+luckBank()+' / '+LUCK_CAP+' saved</small>';
  stack.parentNode.insertBefore(r,stack);
  q11('button',r).addEventListener('click',function(){lkWatch(winRow);});
}
(function(){var ov=q11('#ov-win');if(ov)new MutationObserver(function(){if(!ov.hidden)setTimeout(function(){try{winRow();}catch(e){}},60);}).observe(ov,{attributes:true,attributeFilter:['hidden']});})();

/* the home Lucky tile keeps its video (3 free a day + videos, max 5) */

/* ---------- 4. small banner on the home screen only ---------- */
var BAN=document.createElement('div');BAN.id='ban11';BAN.className='ban11';BAN.setAttribute('aria-hidden','true');
var nativeBan=!!(window.AndroidAds&&AndroidAds.setBanner);if(window.AndroidAds&&!nativeBan)BAN.style.display='none';
if(!nativeBan)BAN.innerHTML='<span class="adt">Ad</span><span class="adx"><b>Sample banner</b><small>A small ad shows here, only on the home screen</small></span><span class="adb">Open</span>';
document.body.appendChild(BAN);
var banOn=null;
function homeTop(){
  var w=q11('#ov-welcome');if(!w||w.hidden)return false;
  var others=[].some.call(document.querySelectorAll('.overlay'),function(o){return o!==w&&!o.hidden&&getComputedStyle(o).display!=='none';});
  if(others)return false;
  if(document.querySelector('.giftov:not([hidden]),#intro,.tour8:not([hidden])'))return false;
  return true;
}
function banSync(){
  var on=homeTop();
  if(on!==banOn){banOn=on;BAN.classList.toggle('on',on);document.body.classList.toggle('ban11on',on);
    if(nativeBan){try{AndroidAds.setBanner(on);}catch(e){}}}
}
setInterval(banSync,300);banSync();


/* ---------- bundles: rebuilt from the current collection (old ones pointed at removed items) ---------- */
(function(){
  function ok(k){var p=k.split(':');return ITEMS[p[0]]&&ITEMS[p[0]].some(function(x){return String(x.id)===p[1];});}
  function first(cat,r,skip){var it=ITEMS[cat].filter(function(x){return x.r===r&&String(x.id)!==skip;})[0];return it?cat+':'+it.id:null;}
  var B=[
    {id:'starter2',name:'Starter Bundle',g:1500,items:[first('pawn','common','n_classic'),first('die','common'),first('board','common','classic')]},
    {id:'hero2',name:'Hero Bundle',g:7000,items:[first('pawn','epic'),first('die','epic'),first('board','rare')]}
  ].map(function(b){b.items=b.items.filter(function(k){return k&&ok(k);});return b;}).filter(function(b){return b.items.length>=2;});
  BUNDLES.length=0;B.forEach(function(b){BUNDLES.push(b);});
})();


/* ---------- store cards: one big clear pawn instead of four tiny ones ---------- */
(function(){
  var V9=window.__ludoraV9||{};
  var piv11=previewInto;
  previewInto=function(pv,cat,it,big){
    var r=piv11.apply(this,arguments);
    try{
      if(cat==='pawn'&&!big){var row=pv.querySelector('.pv9');if(!row)return r;
        var spans=row.querySelectorAll('.pv9c');if(spans.length<4)return r;
        var hero=spans[2].cloneNode(true);pv.style.background='radial-gradient(circle at 50% 75%,#6f8cff 0,#2a3ab0 55%,#16206e 100%)';hero.className='pv11h';
        var dots=document.createElement('div');dots.className='pv11d';
        ['#f0343e','#22b04a','#ffc82a','#2f86ff','#f4f4f4'].forEach(function(c){var i=document.createElement('i');i.style.background=c;dots.appendChild(i);});
        row.innerHTML='';row.className='pvset pv9 pv11';row.appendChild(hero);row.appendChild(dots);
      }
    }catch(e){}
    return r;
  };
})();


/* ---------- tablets: scale the menus (home, store, setup, windows) to fill the screen ---------- */
(function(){
  function fit(){
    var z=Math.min(innerWidth/430,innerHeight/900);z=Math.max(1,Math.min(1.9,Math.round(z*20)/20));
    var r=document.documentElement;r.style.setProperty('--z11',z);r.classList.toggle('tab11',z>1.12);
  }
  fit();addEventListener('resize',fit);
})();


/* ---------- polish: number commas in daily rewards, "an Iron chest", turn pill kept on screen ---------- */
(function(){
  function commas(root){if(!root)return;var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),n;
    while((n=w.nextNode())){if(/\d{4,}/.test(n.nodeValue))n.nodeValue=n.nodeValue.replace(/\b\d{4,}\b/g,function(x){return Number(x).toLocaleString('en-US');});}}
  var rd11=renderDaily;renderDaily=function(){var r=rd11.apply(this,arguments);try{commas(document.getElementById('ov-daily'));}catch(e){}return r;};
  var t11=toast;toast=function(m){if(typeof m==='string')m=m.replace(/\bYou won a ([AEIOU])/,'You won an $1');return t11.apply(this,[m].concat([].slice.call(arguments,1)));};
  setInterval(function(){document.querySelectorAll('.tp8').forEach(function(p){p.style.marginLeft='0px';var r=p.getBoundingClientRect();if(!r.width)return;
    var dx=0;if(r.left<4)dx=4-r.left;else if(r.right>innerWidth-4)dx=innerWidth-4-r.right;if(dx)p.style.marginLeft=dx+'px';});},400);
})();


/* ---------- short phones: shrink the board so the bottom players and dice stay above the game bar ---------- */
(function(){
  var busy=false;
  function fitHeight(){
    if(busy)return;var g=document.getElementById('gbar'),rows=document.querySelectorAll('.seatrow');
    if(!g||!rows.length||!g.getBoundingClientRect().height)return;
    var last=rows[rows.length-1].getBoundingClientRect(),over=Math.ceil(last.bottom+4-g.getBoundingClientRect().top);
    if(over<=2)return;
    busy=true;
    try{BS=Math.max(250,Math.round(BS-over));CELL=BS/15;stage.style.setProperty('--S',BS+'px');stage.style.setProperty('--u',CELL+'px');
      stage.style.maxWidth=BS+'px';stage.style.setProperty('margin-left','auto','important');stage.style.setProperty('margin-right','auto','important');stage.style.alignSelf='center';if(S.pawns)layout(true);}catch(e){}
    busy=false;
  }
  var fs11=fitStage;fitStage=function(){stage.style.maxWidth='';stage.style.removeProperty('margin-left');stage.style.removeProperty('margin-right');stage.style.alignSelf='';var r=fs11.apply(this,arguments);setTimeout(fitHeight,30);return r;};
  addEventListener('resize',function(){setTimeout(function(){fitStage();},60);});
  setInterval(fitHeight,700);
})();


/* ---------- game bar coin counter: short form for big numbers (2.5M) so it fits small phones ---------- */
(function(){
  function short(n){n=+n||0;if(n>=1e6)return (Math.floor(n/1e5)/10).toString().replace(/\.0$/,'')+'M';if(n>=1e5)return Math.floor(n/1e3)+'K';return nf(n);}
  var rs11=refreshStars;refreshStars=function(){var r=rs11.apply(this,arguments);document.querySelectorAll('#gbar .coincount').forEach(function(e){e.textContent=short(set.coins);});return r;};
  try{refreshStars();}catch(e){}
})();

/* ---------- 5. 7-day offers (Store > Special) ---------- */
function weekNo(){return Math.floor((Date.now()/864e5+3)/7);}
function rnd(seed){return function(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};}
function offers(){
  var w=weekNo(),r=rnd(w*7919+13),out=[];
  function pick(cat,tiers){var pool=ITEMS[cat].filter(function(it){return tiers.indexOf(it.r)>=0&&!own9x(cat,it.id)&&(it.c||it.g);});if(!pool.length)return;out.push({cat:cat,it:pool[Math.floor(r()*pool.length)]});}
  pick('pawn',['common','rare']);pick('die',['common','rare']);pick('board',['common','rare']);pick('pawn',['epic','legendary']);
  return out.map(function(o){var it=o.it;
    if(it.r==='epic'||it.r==='legendary'){o.g=Math.round((it.g||4000)*0.08/50)*50;}
    else{o.c=Math.max(50000,Math.round((it.c||1000000)*0.06/10000)*10000);o.was=Math.max(50000,Math.round((it.c||1000000)*0.1/1000)*1000);}
    return o;});
}
function own9x(cat,id){return set.own.indexOf(cat+':'+id)>=0||String(cat==='pawn'&&id)==='n_classic';}
function trialBuy(o){
  var k=o.cat+':'+o.it.id;
  if(o.g){if(set.gems<o.g)return toast('Not enough diamonds');set.gems-=o.g;}else{if(set.coins<o.c)return toast('Not enough coins');set.coins-=o.c;}
  set.trial[k]=Math.max(Date.now(),set.trial[k]||0)+7*864e5;set.eq[o.cat]=String(o.it.id);
  save();refreshStars();applyCosmetics();renderColl();toast('Enjoy '+o.it.name+' for 7 days!');
}
var rs11=renderSpecial;
renderSpecial=function(box){
  var h=el('h3','',box);h.className='of11h';
  var left=(weekNo()+1)*7-(Date.now()/864e5+3),d=Math.floor(left),hh=Math.floor((left-d)*24);
  h.innerHTML='7-Day Offers <small>New offers in '+(d?d+'d ':'')+hh+'h</small>';
  var p=el('p','note',box);p.className='note of11n';p.textContent='Try any of these for 7 days at a special price. Like it? Buy it for good any time.';
  var g=el('div','of11g',box);
  offers().forEach(function(o){
    var c=el('div','of11 r-'+o.it.r,g),pv=el('div','pv',c);previewInto(pv,o.cat,o.it,false);
    var tl=trialLeft(o.cat,o.it.id);
    var rr=el('span','rar',c);rr.textContent=RAR[o.it.r].n;rr.style.background=RAR[o.it.r].c;
    var nm=el('div','of11nm',c);nm.textContent=o.it.name;
    var ct=el('div','of11ct',c);ct.textContent=CATNAME[o.cat]+' · 7 days';
    var b=el('button','mini of11b',c);b.type='button';
    if(tl>0){b.textContent=Math.ceil(tl/864e5)+' days left';b.disabled=true;b.className='mini gr of11b';}
    else{b.innerHTML=(o.was?'<s>'+nf(o.was)+'</s> ':'')+(o.g?gm(o.g):cn(o.c));b.disabled=o.g?set.gems<o.g:set.coins<o.c;
      b.addEventListener('click',function(){trialBuy(o);});}
    pv.addEventListener('click',function(){openItem(o.cat,o.it);});
  });
  rs11.apply(this,arguments);
};
})();
