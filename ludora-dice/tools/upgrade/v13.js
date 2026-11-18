/* ===================== v1.9b: new store layout, contained previews, frames everywhere, solid dice viewer, all flags, Activity Center, faster boards ===================== */
(function(){
var UI='ui/v19/';
function q(s,r){return (r||document).querySelector(s);}
function mk(tag,cls,html,par){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;if(par)par.appendChild(e);return e;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function atSt(id){var a=AT19.M[id];if(!a)return '';var x=a[3]>1?a[1]/(a[3]-1)*100:0,y=a[4]>1?a[2]/(a[4]-1)*100:0;return "background-image:url('"+UI+"at/"+a[0]+".webp');background-size:"+(a[3]*100)+"% "+(a[4]*100)+"%;background-position:"+x.toFixed(2)+"% "+y.toFixed(2)+"%";}
var L19=window.__l19||{};

/* ---------- frame art: one helper used by store cards, item window, home and profile pictures ---------- */
function frameKey(it){return it&&it.img?String(it.id).slice(1):null;}
function picHtml(){try{if(set.photo)return '<img alt="" src="'+set.photo+'">';var k=parseInt(String(set.av||'h0').slice(1),10);if(!isNaN(k)&&window.__avImg)return window.__avImg(k);}catch(e){}return '';}
function framedHtml(it,inner){
  var k=frameKey(it);if(!k)return '<span class="fb19 plain"><span class="fb19p">'+(inner||'')+'</span></span>';
  var h=AT19.FH[k]||[.2,.2,.8,.8],pad=.02;
  return '<span class="fb19"><span class="fb19p" style="left:'+((h[0]+pad)*100)+'%;top:'+((h[1]+pad)*100)+'%;right:'+((1-h[2]+pad)*100)+'%;bottom:'+((1-h[3]+pad)*100)+'%">'+(inner||'')+'</span><span class="fb19f'+(it.r==='legendary'?' lg':'')+'" style="'+atSt(k)+';--fglow:'+(it.fxc||'transparent')+'"></span></span>';
}
window.__framed19=framedHtml;

/* ---------- previews: pawns fully inside the card, frames contained ---------- */
var pv13=previewInto;
previewInto=function(pv,cat,it,big){
  if(cat==='frame'&&it&&it.img){pv.innerHTML=framedHtml(it,picHtml());pv.className=(pv.className||'')+' pv13fr';pv.style.background='';return;}
  var r=pv13.apply(this,arguments);
  if(cat==='pawn')pv.classList.add('pv13pw');
  return r;
};

/* ---------- home + profile pictures use the new frames; the old frame picker shows real frames ---------- */
function frameSync(){
  var it=curItem('frame');
  document.querySelectorAll('.fr7').forEach(function(el){
    if(el.dataset.f19===String(it.id)&&el.querySelector('.fb19'))return;
    var inn=el.querySelector('.in');var inner=inn?inn.innerHTML:'';var extra=[].slice.call(el.children).filter(function(c){return !c.classList.contains('in')&&!c.classList.contains('fdc')&&!c.classList.contains('fb19');}).map(function(c){return c.outerHTML;}).join('');
    el.classList.add('fr13');el.dataset.f19=String(it.id);el.innerHTML=framedHtml(it,inner)+extra;
  });
  document.querySelectorAll('.p7frs').forEach(function(box){
    if(box.dataset.v13)return;box.dataset.v13=1;
    box.innerHTML=ITEMS.frame.filter(function(f){return owned('frame',f.id);}).map(function(f){return '<button type="button" class="p7fr p13" data-f="'+f.id+'" aria-label="'+esc(f.name)+' frame">'+framedHtml(f,picHtml())+'<small>'+esc(f.name)+'</small></button>';}).join('')+'<button type="button" class="p7fr more" aria-label="Get more frames">+</button>';
  });
  document.querySelectorAll('.p7fr[data-f]').forEach(function(b){b.setAttribute('aria-pressed',String(String(set.eq.frame)===b.dataset.f));});
}
setInterval(frameSync,500);
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.p7fr.p13');if(b){set.eq.frame=b.dataset.f;save();try{applyCosmetics();}catch(x){}document.querySelectorAll('.fr7').forEach(function(x){x.dataset.f19='';});frameSync();}},false);

/* ---------- dice viewer: solid cube, spin with a finger anywhere on the screen ---------- */
(function(){
  var o=null,rx=-24,ry=35,vx=0,vy=.6,drag=false,lx=0,ly=0,lt=0;
  function core(){
    var cube=q('#dv19 .dv19cube');if(!cube||cube.querySelector('.dv13c'))return;
    var rot=['rotateY(0deg)','rotateY(90deg)','rotateY(180deg)','rotateY(-90deg)','rotateX(90deg)','rotateX(-90deg)'];
    for(var i=0;i<6;i++){var c=document.createElement('div');c.className='dv13c';c.style.transform=rot[i]+' translateZ(calc(var(--hz) - 3px))';cube.insertBefore(c,cube.firstChild);}
  }
  function setup(){
    o=q('#dv19');if(!o||o.__v13)return;o.__v13=1;
    var cube=q('.dv19cube',o);
    // take over the spin: our own loop
    var st=q('.dv19stage',o),ns=st.cloneNode(true);st.parentNode.replaceChild(ns,st);cube=q('.dv19cube',o);
    function down(x,y){drag=true;lx=x;ly=y;lt=Date.now();vx=0;vy=0;}
    function move(x,y){if(!drag)return;var dx=x-lx,dy=y-ly,dt=Math.max(8,Date.now()-lt);ry+=dx*.55;rx-=dy*.55;vy=dx*.55*16/dt;vx=-dy*.55*16/dt;lx=x;ly=y;lt=Date.now();}
    function up(){if(!drag)return;drag=false;vy=Math.max(-36,Math.min(36,vy));vx=Math.max(-28,Math.min(28,vx));}
    function skip(e){return e.target.closest&&e.target.closest('button');}
    o.addEventListener('touchstart',function(e){if(skip(e))return;var t=e.touches[0];down(t.clientX,t.clientY);},{passive:true});
    o.addEventListener('touchmove',function(e){var t=e.touches[0];move(t.clientX,t.clientY);if(drag&&e.cancelable)e.preventDefault();},{passive:false});
    o.addEventListener('touchend',up);o.addEventListener('touchcancel',up);
    o.addEventListener('mousedown',function(e){if(skip(e))return;down(e.clientX,e.clientY);});
    window.addEventListener('mousemove',function(e){move(e.clientX,e.clientY);});window.addEventListener('mouseup',up);
    (function tick(){
      if(o&&!o.hidden){
        var busy=o.classList.contains('rv');
        if(!drag&&!busy){ry+=vy;rx+=vx;vy+=(.6-vy)*.02;vx*=.95;rx+=(-24-rx)*.01;}
        var c=q('.dv19cube',o);if(c)c.style.transform='rotateX('+rx+'deg) rotateY('+ry+'deg)';
      }
      requestAnimationFrame(tick);
    })();
  }
  var dv=L19.diceView;
  if(dv){L19.diceView=function(){var r=dv.apply(this,arguments);setup();core();rx=-24;ry=35;vy=.6;vx=0;return r;};}
  var oi=openItem;openItem=function(cat,it){var r=oi.apply(this,arguments);if(cat==='die')setTimeout(function(){setup();core();},0);return r;};
})();

/* ---------- Activity Center (was Events Hub) ---------- */
function rename(){
  var b=q('.hub19ban b');if(b&&b.textContent!=='ACTIVITY CENTER')b.textContent='ACTIVITY CENTER';
  var h=q('#ov-hub19 h2');if(h&&h.textContent!=='ACTIVITY CENTER')h.textContent='ACTIVITY CENTER';
  document.querySelectorAll('.t9.pink').forEach(function(t){var l=t.querySelector('b');if(l&&/Events/.test(l.innerHTML)&&!t.dataset.r13){t.dataset.r13=1;l.innerHTML=l.innerHTML.replace('Events','Activity').replace('This week','Center');}});
  document.querySelectorAll('.tb9 button').forEach(function(t){if(!t.dataset.r13&&/Events/.test(t.textContent)){t.dataset.r13=1;var w=document.createTreeWalker(t,NodeFilter.SHOW_TEXT),n;while((n=w.nextNode()))if(/Events/.test(n.nodeValue))n.nodeValue=n.nodeValue.replace('Events','Activity');}});
  document.querySelectorAll('.ib19msg p').forEach(function(p){if(/Events Hub/.test(p.textContent))p.textContent=p.textContent.replace('Events Hub','Activity Center');});
}
setInterval(rename,400);

/* ---------- every country flag, picked from a drop-down ---------- */
var CC='AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BR IO VG BN BG BF BI KH CM CA CV KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI XK KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF KP MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS KR SS ES LK BL SH KN LC MF PM VC SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM VI UY UZ VU VA VE VN WF EH YE ZM ZW'.split(' ');
function flagOf(c){return c.replace(/./g,function(ch){return String.fromCodePoint(127397+ch.charCodeAt(0));});}
function codeOf(f){if(!f)return '';var cps=Array.from(f);if(cps.length!==2)return '';return cps.map(function(c){return String.fromCharCode(c.codePointAt(0)-127397);}).join('');}
var DN=null;try{DN=new Intl.DisplayNames([(set.lang||navigator.language||'en')],{type:'region'});}catch(e){}
function cname(c){try{return DN?DN.of(c):c;}catch(e){return c;}}
var CLIST=CC.map(function(c){return {c:c,n:cname(c)};}).sort(function(a,b){return a.n.localeCompare(b.n);});
function flagSelect(id){
  var s=document.createElement('select');s.className='fl13';s.id=id;s.setAttribute('aria-label','Your country');
  s.innerHTML='<option value="">🌍  No flag</option>'+CLIST.map(function(x){return '<option value="'+x.c+'">'+flagOf(x.c)+'  '+esc(x.n)+'</option>';}).join('');
  s.value=codeOf(set.flag);
  s.addEventListener('change',function(){set.flag=s.value?flagOf(s.value):'';save();try{syncUI();renderSeats();}catch(e){}
    try{if(NET.on&&NET.room)NET.room.presence({n:myName(),f:set.flag});}catch(e){}
    document.querySelectorAll('.fl13').forEach(function(o){if(o!==s)o.value=s.value;});
    document.querySelectorAll('.p7flag').forEach(function(f){f.textContent=set.flag||'🌍';});});
  return s;
}
function flagSync(){
  var sf=q('#s-flags');if(sf&&!q('#fl13s')){sf.hidden=true;sf.style.display='none';sf.parentNode.insertBefore(flagSelect('fl13s'),sf);}
  document.querySelectorAll('.p7fls').forEach(function(g){if(g.dataset.v13)return;g.dataset.v13=1;g.style.display='none';g.parentNode.insertBefore(flagSelect('fl13p'+Math.random().toString(36).slice(2,6)),g);});
}
setInterval(flagSync,600);

/* ---------- boards: load the pictures early so a game never starts on a black board ---------- */
(function(){
  var done={};
  function pre(it){try{var k=window.__ludoraV3&&window.__ludoraV3.artKey?window.__ludoraV3.artKey(it):null;if(!k||done[k])return;done[k]=1;['boards/'+k+'.webp','boards/'+k+'-w.webp'].forEach(function(u){var i=new Image();i.decoding='async';i.src=u;});}catch(e){}}
  function eq(){try{pre(curItem('board'));}catch(e){}}
  eq();setTimeout(function(){ITEMS.board.filter(function(b){return owned('board',b.id);}).forEach(pre);},2500);
  var ac=applyCosmetics;applyCosmetics=function(){var r=ac.apply(this,arguments);eq();return r;};
})();

/* ---------- STORE: category icons, tabs, collection count, rarity drop-down, 3 cards per row ---------- */
var CATS=[['die','Dice'],['pawn','Pawns'],['board','Boards'],['frame','Frames'],['emo','Emojis']];
var TABS=[['shop','Shop'],['events','Events'],['owned','Owned'],['special','Offers'],['chest','Chests']];
var ST={tab:'shop',r:'all',q:''};var first13=true;
var RCOL={common:'c',rare:'r',epic:'e',legendary:'l'};
function catIcon(c){
  if(c==='die')return '<span class="ci13 die" style="background-image:url(dice/d_fire.webp)"></span>';
  if(c==='pawn')return '<span class="ci13">'+(window.__ludoraV9&&window.__ludoraV9.sprHTML?window.__ludoraV9.sprHTML('p_lion_king','yellow'):'')+'</span>';
  if(c==='board')return '<span class="ci13 bd" style="background-image:url(boards/sakura.webp)"></span>';
  if(c==='frame')return '<span class="ci13 fr" style="'+atSt('l1_01')+'"></span>';
  return '<span class="ci13 em" style="'+atSt('pka01')+'"></span>';
}
function eventItems(cat){
  try{
    var w=L19.wk?L19.wk():null;var out=[];
    if(cat==='die')out=ITEMS.die.filter(function(d){return d.v19&&d.r==='rare';}).slice(0,6);
    if(cat==='pawn')out=ITEMS.pawn.filter(function(p){return p.r==='epic';}).slice(0,6);
    return out;
  }catch(e){return [];}
}
function card(cat,it,box,opts){
  opts=opts||{};
  var eqd=String(set.eq[cat])===String(it.id),has=owned(cat,it.id);
  var c=mk('button','c13 r-'+it.r,null,box);c.type='button';
  mk('span','c13n',esc(it.name),c);
  var pv=mk('div','pv c13pv',null,c);
  if(cat==='die'){pv.innerHTML='<span class="c13die" style="background-image:url(dice/'+it.id+'.webp)"></span>';}
  else{previewInto(pv,cat,it,false);if(cat==='board'){var bg=pv.style.background||pv.style.backgroundImage;if(bg&&/url/.test(bg)){pv.style.background='';pv.innerHTML='<span class="c13bd" style="background:'+bg.replace(/"/g,"'")+'"></span>';}else{var sv=pv.querySelector('svg');if(sv){sv.setAttribute('width','72');sv.setAttribute('height','72');}}}}
  var st=mk('span','c13s',null,c);
  if(opts.ev)st.innerHTML='🏆 Event';
  else if(eqd){st.textContent='Equipped';c.classList.add('eq');}
  else if(has)st.textContent='Owned';
  else{var h='';if(it.c)h+=cn(it.c);if(it.c&&it.g)h+=' ';if(it.g)h+=gm(it.g);st.innerHTML=h||'Free';}
  mk('i','c13r',RAR[it.r]?RAR[it.r].n:'',c);
  c.addEventListener('click',function(){openItem(cat,it);});
  return c;
}
function emoPackCard(pk,box){
  var P=D19.PACKS.filter(function(p){return p[0]===pk;})[0];if(!P)return;
  var own=P[2].filter(function(id){return set.e19&&set.e19[id]===true;}).length;
  var c=mk('button','c13 r-'+(P[3]==='event'?'legendary':P[3]==='faces'?'rare':'epic'),null,box);c.type='button';
  mk('span','c13n',esc(P[1]),c);
  var pv=mk('div','pv c13pv c13em',null,c);
  P[2].slice(0,3).forEach(function(id,i){mk('span','c13e e'+i,null,pv).setAttribute('style',atSt(id));});
  mk('span','c13s',P[3]==='event'?'🏆 Event':own+' / '+P[2].length,c);
  c.addEventListener('click',function(){if(L19.openPack)L19.openPack(pk,0);});
}
var rc13=renderColl;
renderColl=function(){
  var sh=q('#ov-coll .sheet');if(sh)sh.classList.add('st13');
  if(ST.tab==='special'||ST.tab==='chest'){storeTop=ST.tab;var r=rc13.apply(this,arguments);nav();return r;}
  storeTop='shop';if(first13){first13=false;if(collTab==='board')collTab='die';}
  try{refreshStars();}catch(e){}
  var box=q('#c-items');box.innerHTML='';box.className='items13';
  if(!CATS.some(function(x){return x[0]===collTab;}))collTab='die';
  nav();
  var cat=collTab;
  if(cat==='emo'){
    var tot=D19.EM.length,own=D19.EM.filter(function(e){return set.e19&&set.e19[e[0]]===true;}).length;
    head(box,'Emoji collection',own,tot,false);
    D19.PACKS.forEach(function(p){
      var isEv=p[3]==='event',o=p[2].some(function(id){return set.e19&&set.e19[id]===true;});
      if(ST.tab==='shop'&&isEv)return;if(ST.tab==='events'&&!isEv)return;if(ST.tab==='owned'&&!o)return;
      if(ST.q&&p[1].toLowerCase().indexOf(ST.q.toLowerCase())<0)return;
      emoPackCard(p[0],box);});
    empty(box);return;
  }
  var list=ITEMS[cat]||[],ownN=list.filter(function(it){return owned(cat,it.id);}).length;
  head(box,{die:'Dice',pawn:'Pawn',board:'Board',frame:'Frame'}[cat]+' collection',ownN,list.length,true);
  var src=ST.tab==='events'?eventItems(cat):list;
  var order={common:0,rare:1,epic:2,legendary:3};
  src=src.filter(function(it){
    if(ST.tab==='owned'&&!owned(cat,it.id))return false;
    if(ST.tab==='shop'&&cat==='frame'&&false)return false;
    if(ST.r!=='all'&&it.r!==ST.r)return false;
    if(ST.q&&it.name.toLowerCase().indexOf(ST.q.toLowerCase())<0)return false;
    return true;});
  if(ST.tab!=='events')src=src.slice().sort(function(a,b){return (order[a.r]-order[b.r])||0;});
  src.forEach(function(it){card(cat,it,box,{ev:ST.tab==='events'&&!owned(cat,it.id)});});
  if(ST.tab==='events'&&src.length){var n=mk('p','n13','Win these in the Weekly Event in the Activity Center.',null);box.insertBefore(n,box.children[1]||null);}
  empty(box);
};
function empty(box){
  if(box.querySelector('.c13'))return;
  var e=mk('div','e13',null,box);
  if(ST.tab==='owned')e.innerHTML='<b>Nothing here yet</b><p>Items you buy or win show up here.</p>';
  else if(ST.tab==='events'){e.innerHTML='<b>No event items in this category</b><p>Open the Activity Center to see this week’s prizes.</p>';var b=mk('button','btn','Open Activity Center',e);b.type='button';b.addEventListener('click',function(){closeSheet('ov-coll');if(L19.openHub)L19.openHub();});}
  else e.innerHTML='<b>Nothing matches</b><p>Try another search or rarity.</p>';
}
function head(box,title,own,tot,rar){
  var h=mk('div','h13',null,box);
  h.innerHTML='<div class="h13s"><input type="search" id="s13q" placeholder="Search" aria-label="Search the store"></div><div class="h13r"><b>'+esc(title)+'</b><span>('+own+'/'+tot+' owned)</span>'+(rar?'<select id="s13r" aria-label="Rarity"><option value="all">All</option><option value="common">Common</option><option value="rare">Rare</option><option value="epic">Epic</option><option value="legendary">Legendary</option></select>':'')+'</div>';
  var i=h.querySelector('#s13q');i.value=ST.q;
  var t;i.addEventListener('input',function(){ST.q=i.value;clearTimeout(t);t=setTimeout(function(){renderColl();var n=q('#s13q');if(n){n.focus();n.setSelectionRange(n.value.length,n.value.length);}},250);});
  var s=h.querySelector('#s13r');if(s){s.value=ST.r;s.addEventListener('change',function(){ST.r=s.value;renderColl();});}
}
function nav(){
  var sb=q('#ov-coll .sb'),items=q('#c-items');if(!sb||!items)return;
  var n=q('#n13');
  if(!n){n=mk('div','n13w',null,null);n.id='n13';sb.insertBefore(n,items);}
  n.innerHTML='<div class="cat13">'+CATS.map(function(c){return '<button type="button" data-c="'+c[0]+'" aria-pressed="'+(collTab===c[0]&&ST.tab!=='special'&&ST.tab!=='chest')+'">'+catIcon(c[0])+'<b>'+c[1]+'</b></button>';}).join('')+'</div>'+
    '<div class="tab13">'+TABS.map(function(t){return '<button type="button" data-t="'+t[0]+'" aria-pressed="'+(ST.tab===t[0])+'">'+t[1]+'</button>';}).join('')+'</div>';
  n.querySelectorAll('[data-c]').forEach(function(b){b.addEventListener('click',function(){collTab=b.dataset.c;if(ST.tab==='special'||ST.tab==='chest')ST.tab='shop';ST.q='';renderColl();var it=q('#c-items');if(it)it.scrollTop=0;});});
  n.querySelectorAll('[data-t]').forEach(function(b){b.addEventListener('click',function(){ST.tab=b.dataset.t;ST.q='';renderColl();});});
}
/* anything that opened the store on a given tab keeps working */
var os13=openSheet;openSheet=function(id){if(id==='ov-coll'){if(storeTop==='special'||storeTop==='chest')ST.tab=storeTop;else if(ST.tab==='special'||ST.tab==='chest')ST.tab='shop';try{renderColl();}catch(e){}}return os13.apply(this,arguments);};
})();
