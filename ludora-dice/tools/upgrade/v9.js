/* ===================== v1.5: deep look with illustrated art, cleaner home, faster dice with dark dots ===================== */
(function(){
var V9={};window.__ludoraV9=V9;
function q9(s,r){return (r||document).querySelector(s);}
function mk9(tag,cls,html,parent){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;if(parent)parent.appendChild(e);return e;}
function ic(n){return 'ui/ic/'+n+'.webp';}
function clickId(id){var b=document.getElementById(id);if(b)b.click();}
document.body.classList.add('deep9');

/* ---------- chests: illustrated art everywhere ---------- */
var CHIMG={wood:'chest_wood',iron:'chest_iron',silver:'chest_silver',gold:'chest_gold',royal:'chest_royal',crystal:'chest_crystal'};
chestSvg=function(t,open){
  if(open)return '<img class="chimg" alt="" src="ui/fx/'+((t==='royal'||t==='crystal')?'chestopen2':'chestopen')+'.webp">';
  return '<img class="chimg" alt="" src="'+ic(CHIMG[t]||'chest_wood')+'">';
};

/* ---------- home ---------- */
(function(){
  var h=q9('.h7');if(!h)return;
  // mode cards: one clear scene each, fully inside the card
  var ART={online:'online',cpu:'computer',team:'team',pass:'pass'};
  h.querySelectorAll('.h7card').forEach(function(c){
    var k=c.dataset.k;c.classList.add('t9');
    var a=q9('.h7art',c);if(a)a.innerHTML='<img alt="" src="ui/sc/'+(ART[k]||'online')+'.webp">';
    var b=q9('b',c);if(b)b.classList.add('lt9');
    if(k==='cpu'){var s=q9('small',c);if(s)s.textContent='Easy to Expert';}
  });
  // Daily / Season / Events banners, icon inside beside the words
  var top=q9('.h7top',h);
  var bn=mk9('div','b9','',null);top.parentNode.insertBefore(bn,top.nextSibling);
  [['h-chest','purple','gift','Daily','Rewards'],['h-pass','teal','ticket','Season','Free pass'],['h-ev','pink','trophy','Events','This week']].forEach(function(o){
    var b=mk9('button','t9 '+o[1],'<img alt="" src="'+ic(o[2])+'"><b class="lt9">'+o[3]+'</b><small>'+o[4]+'</small><span class="dot9" hidden>!</span>',bn);
    b.type='button';b.dataset.src=o[0];b.addEventListener('click',function(){clickId(o[0]);});
  });
  // small side buttons
  var mid=q9('.h7mid',h);
  var L=mk9('div','r9 l','',mid),R=mk9('div','r9 r','',mid);
  var lucky=mk9('button','t9 yellow','<img alt="" src="'+ic('clover')+'"><b class="lt9 y">Lucky</b><span class="dot9" hidden></span>',L);lucky.type='button';lucky.setAttribute('aria-label','Lucky Rolls');
  lucky.addEventListener('click',function(){clickId('h-luck');});
  var free=mk9('button','t9 green','<img alt="" src="'+ic('video')+'"><b class="lt9 g">FREE</b>',L);free.type='button';free.setAttribute('aria-label','Free coins with a video');
  free.addEventListener('click',function(){try{storeTop='special';renderColl();openSheet('ov-coll');}catch(e){clickId('h-coll');}});
  var med=mk9('button','t9 purple','<img alt="" src="'+ic('medal')+'"><b class="lt9 y">Medals</b>',R);med.type='button';med.setAttribute('aria-label','Profile and medals');
  med.addEventListener('click',function(){clickId('h-prof');});
  // bottom tab bar
  var tb=mk9('nav','tb9','',document.body);tb.setAttribute('aria-label','Main');
  [['h-coll','shop','Store'],['h-pass','ticket','Pass'],['','dice','Home'],['h-ev','trophy','Events'],['h-chest','calendar','Daily']].forEach(function(o){
    var b=mk9('button',o[0]?'':'on','<img alt="" src="'+ic(o[1])+'"><b class="lt9">'+o[2]+'</b>',tb);b.type='button';
    b.addEventListener('click',function(){if(o[0])clickId(o[0]);});
  });
  // keep badges in step with the real buttons, and show the tab bar only on the home screen
  function hasDot(el){if(!el)return false;if(/\b(dot|dot2|has|new|ready)\b/.test(el.className))return true;var d=el.querySelector('.dot,.badge,.bd,.n');return !!(d&&d.offsetParent&&d.textContent.trim()!=='0');}
  setInterval(function(){
    var home=!q9('#ov-welcome').hidden;
    tb.hidden=!home||!!document.querySelector('.overlay:not([hidden]):not(#ov-welcome)');
    if(!home)return;
    bn.querySelectorAll('button').forEach(function(b){q9('.dot9',b).hidden=!hasDot(document.getElementById(b.dataset.src));});
    var lk=+set.lk||0,d=q9('.dot9',lucky);d.hidden=lk<=0;d.textContent=lk>99?'99+':lk;
  },700);
})();

/* ---------- win / lose pictures ---------- */
var sw9=showWin;
showWin=function(pl){
  sw9.apply(this,arguments);
  try{
    var ov=q9('#ov-win'),sh=ov&&q9('.sheet',ov);if(!sh)return;
    var won=sideMine(pl.seat),pick=function(a,b){return Math.random()<.5?a:b;};
    var src='ui/fx/'+(won?(S.team?pick('teamwin','teamwin2'):pick('win','win2')):pick('lose','lose2'))+'.webp';
    var sb=q9('.sb',sh)||sh,im=q9('.fx9',sb);if(!im){im=document.createElement('img');im.className='fx9';im.alt='';sb.insertBefore(im,sb.firstChild);}var old=q9(':scope > svg',sb);if(old)old.style.display='none';
    im.src=src;
  }catch(e){}
};

})();
