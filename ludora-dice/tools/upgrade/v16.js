
/* ===== Ludo Mayhem 1.11 =====
   new name and logo, rating after the first game (kind, 3 asks at most), "Rate us" on the home screen,
   small pointing hand + soft glow instead of the YOUR TURN banner, slower flight home after a capture,
   "Delete my online data" in Settings. The loading screen markup is swapped in by build.py. */
(function(){
var UI11='ui/v111/';
function T11(s){try{return (window.__ludoraLang&&__ludoraLang.tr(s))||s;}catch(e){return s;}}
function mk11(tag,cls,html,parent){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;if(parent)parent.appendChild(e);return e;}

/* ---------- logo on the home screen ---------- */
(function(){
  var h=document.getElementById('w-title');
  if(h){h.setAttribute('aria-label','Ludo Mayhem');h.innerHTML='<img class="lm11" src="'+UI11+'logo.webp" alt="Ludo Mayhem">';}
})();

/* ---------- rating: after the first finished game in any mode, then at most twice more ---------- */
var DAY=86400000;
function rateDue(){
  if(set.rated)return false;
  var asks=+set.r11a||0;if(asks>=3)return false;
  if((+set.r11g||0)<1)return false;
  if(asks>0&&((+set.r11g||0)-(+set.r11lg||0)<3||Date.now()-(+set.r11lt||0)<2*DAY))return false;
  return true;
}
try{maybeRate=function(){};}catch(e){}
function rateCard(){
  var o=document.getElementById('ov-rate');if(!o)return;
  var t=o.querySelector('#rt-title');if(t)t.textContent=T11('ENJOYING THE GAME?');
  var ic=o.querySelector('.rateico');if(ic&&!ic.querySelector('img'))ic.innerHTML='<img src="'+UI11+'star.webp" alt="">';
  var l=o.querySelector('.lead');if(l)l.textContent=T11('Tell us what you think. Your honest review helps us make Ludo Mayhem better.');
  var y=o.querySelector('#rt-yes');if(y)y.textContent=T11('Rate Ludo Mayhem');
}
function askRate(){
  if(!rateDue())return;
  var w=document.getElementById('ov-win');if(!w||w.hidden)return;
  set.r11a=(+set.r11a||0)+1;set.r11lg=+set.r11g||0;set.r11lt=Date.now();save();
  rateCard();openSheet('ov-rate');
}
var sw11=showWin;showWin=function(){
  var r=sw11.apply(this,arguments);
  try{if(S.r11!==S.gid){S.r11=S.gid;set.r11g=(+set.r11g||0)+1;save();setTimeout(askRate,1900);}}catch(e){}
  return r;
};
/* "Rate us" button on the home screen (right column, under Inbox) */
(function(){
  var col=document.querySelector('.r9.r');if(!col||document.getElementById('h-rate11'))return;
  var b=mk11('button','t9 purple rt11','<img alt="" src="'+UI11+'star.webp"><b class="lt9 y">'+T11('Rate us')+'</b>',col);
  b.type='button';b.id='h-rate11';b.setAttribute('aria-label',T11('Rate us'));
  b.addEventListener('click',function(){rateCard();openSheet('ov-rate');});
})();
document.addEventListener('click',function(e){var y=e.target.closest&&e.target.closest('#rt-yes');if(y){set.rated=true;save();}},true);

/* ---------- your turn: small pointing hand by the dice + soft glow on your picture ---------- */
(function(){
  var a=document.querySelector('.arr8');
  function fix(){a=document.querySelector('.arr8');if(a&&!a.querySelector('img')){a.innerHTML='<img src="'+UI11+'hand.webp" alt="">';a.classList.add('h11');}}
  var ut11=updateTurn;updateTurn=function(){
    var r=ut11.apply(this,arguments);
    try{
      fix();
      var pl=cur(),live=pl&&(S.phase==='roll'||S.phase==='move'||S.phase==='busy');
      for(var s=0;s<4;s++){var d=SEATEL[s];if(!d)continue;
        var me=live&&pl.seat===s&&mine(pl)&&!pl.bot&&S.mode!=='pass';
        var any=live&&pl.seat===s;
        d.classList.toggle('me11',!!me);d.classList.toggle('on11',!!any);
        var av=d.querySelector('.av');if(av&&!av.querySelector('.g11'))mk11('i','g11','',av);}
      // the tutorial hand (first game) already points at the dice: don't show two hands
      var th=document.querySelector('.hand');if(a&&th&&th.style.display!=='none'&&th.offsetParent!==null)a.hidden=true;
    }catch(e){}
    return r;
  };
  // the first-game tutorial hand uses the same picture
  var st=document.createElement('style');st.textContent='.hand .fg{font-size:0!important;width:44px;height:37px;left:-2px!important;top:4px!important;background:url('+UI11+'hand.webp) center/contain no-repeat}';
  document.head.appendChild(st);
})();

/* ---------- captured pawn: a slower, easy-to-follow flight back to base ---------- */
try{
  fly=function(pw,it){
    pw.el.classList.add('fly11');pw.sh.classList.add('fly11');
    placePawn(pw,it);
    var d=Math.max(120,1150*SPEED);
    try{pw.pin.animate([{transform:'translateY(0) rotate(0deg)'},{transform:'translateY('+(-CELL*3.2)+'px) rotate(320deg)',offset:.45},{transform:'translateY('+(-CELL*.25)+'px) rotate(690deg)',offset:.9},{transform:'translateY(0) rotate(720deg)'}],{duration:d,easing:'ease-in-out'});}catch(e){}
    setTimeout(function(){pw.el.classList.remove('fly11');pw.sh.classList.remove('fly11');},d+60);
  };
}catch(e){}

/* ---------- Inbox: tell players about the new name ---------- */
try{var N11=window.__l19&&window.__l19.NEWS;if(N11&&!N11.some(function(n){return n.id==='n111';}))N11.unshift({id:'n111',t:'We have a new name: Ludo Mayhem!',b:'Same game, same progress, same fair dice. Thank you for playing!'});}catch(e){}

/* ---------- Settings: delete my online data ---------- */
(function(){
  var sb=document.querySelector('#ov-settings .sb');if(!sb)return;
  var p=mk11('p','del11','<button type="button" class="lnk11"></button>',sb);
  var b=p.querySelector('button');b.textContent=T11('Delete my online data');
  b.addEventListener('click',function(){
    var o=mk11('div','cs15o','<div class="cs15"><div class="cs15i">🗑️</div><b></b><p></p><div class="cs15b"><button type="button" class="btn red11"></button><button type="button" class="btn ghost"></button></div></div>',document.body);
    o.querySelector('b').textContent=T11('Delete your online data?');
    o.querySelector('p').textContent=T11('This removes your online name, friend code and friends list from our server. Your coins, items and progress on this phone stay.');
    var bs=o.querySelectorAll('button');bs[0].textContent=T11('Delete');bs[1].textContent=T11('Cancel');
    bs[1].onclick=function(){o.remove();};
    bs[0].onclick=function(){
      bs[0].disabled=true;
      var srv=(window.LUDORA_SERVER||'').replace(/\/$/,'');var sess=null;try{sess=JSON.parse(localStorage.getItem('ludora.sess')||'null');}catch(e){}
      function done(msg){o.remove();try{toast(msg);}catch(e){}}
      if(!sess||!sess.secret){done(T11('You have no online data saved.'));return;}
      if(!srv){done(T11('Online is not available right now. Try again later.'));return;}
      fetch(srv+'/account/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:sess.secret})})
        .then(function(r){return r.json();})
        .then(function(j){if(j&&j.ok){try{localStorage.removeItem('ludora.sess');}catch(e){}done(T11('Your online data was deleted.'));}else done(T11('Could not delete. Try again later.'));})
        .catch(function(){done(T11('Could not delete. Check your internet and try again.'));});
    };
  });
})();
})();
