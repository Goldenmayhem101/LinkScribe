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


/* ---------- 1.6: every dice and pawn is new illustrated art ---------- */
var DM=[["d_yellow", "Sunny Yellow", "common"], ["d_purple", "Grape Purple", "common"], ["d_orange", "Tangerine", "common"], ["d_pink", "Bubble Pink", "common"], ["d_white", "Classic White", "common"], ["d_gold", "Polished Gold", "rare"], ["d_silver", "Sapphire Silver", "rare"], ["d_ruby", "Ruby", "rare"], ["d_emerald", "Emerald", "rare"], ["d_pearl", "Pearl", "rare"], ["d_pirate", "Pirate Chest", "rare"], ["d_candy", "Frosted Candy", "rare"], ["d_ice", "Ice Crystal", "rare"], ["d_space", "Deep Space", "rare"], ["d_jungle", "Jungle Stone", "rare"], ["d_lava", "Lava Rock", "legendary"], ["d_ocean", "Ocean Wave", "legendary"], ["d_sun", "Golden Sun", "legendary"], ["d_amethyst", "Shadow Amethyst", "legendary"], ["d_blossom", "Cherry Blossom", "legendary"], ["d_fire", "Inferno", "legendary"], ["d_lightning", "Lightning", "legendary"], ["d_galaxy", "Galaxy", "legendary"], ["d_dragon", "Dragon Scale", "legendary"], ["d_prism", "Rainbow Prism", "legendary"], ["e_viking", "Viking Runes", "epic"], ["e_samurai", "Samurai Lacquer", "epic"], ["e_pharaoh", "Pharaoh Gold", "epic"], ["e_aztec", "Temple Jade", "epic"], ["e_marble", "Olympus Marble", "epic"], ["e_vinyl", "Vinyl Neon", "epic"], ["e_origami", "Origami", "epic"], ["e_knit", "Cosy Knit", "epic"], ["e_tin", "Tin Toy", "epic"], ["e_terrarium", "Terrarium", "epic"], ["e_knight", "Knight Steel", "epic"], ["e_spellbook", "Spellbook", "epic"], ["e_crystal", "Crystal Ball", "epic"], ["e_mermaid", "Mermaid Scales", "epic"], ["e_phoenix", "Phoenix Feather", "epic"], ["e_choc", "Chocolate Truffle", "epic"], ["e_icecream", "Ice Cream", "epic"], ["e_bubblegum", "Bubblegum", "epic"], ["e_disco", "Disco Ball", "epic"], ["e_street", "Street Art", "epic"], ["e_robot", "Robot Mech", "epic"], ["e_ghost", "Friendly Ghost", "epic"], ["e_fossil", "Amber Fossil", "epic"], ["e_mushroom", "Mushroom Grove", "epic"], ["e_unicorn", "Unicorn Dream", "epic"]],PM=[["p_yeti_cub", "Yeti Cub", "rare"], ["p_owl_aviator", "Owl Aviator", "rare"], ["p_clockwork_mouse", "Clockwork Mouse", "rare"], ["p_cactus_cowboy", "Cactus Cowboy", "rare"], ["p_hedgehog", "Hedgehog Explorer", "rare"], ["p_penguin_chef", "Penguin Chef", "rare"], ["p_frog", "Rainy Frog", "rare"], ["p_sloth", "Chill Sloth", "rare"], ["p_bee_mail", "Bee Mail", "rare"], ["p_crab_sailor", "Crab Sailor", "rare"], ["p_raccoon", "Raccoon Mechanic", "rare"], ["p_turtle_surfer", "Turtle Surfer", "rare"], ["p_snail", "Snail Courier", "rare"], ["p_capybara", "Capybara", "rare"], ["p_lemur", "Lemur Acrobat", "rare"], ["p_bunny", "Bunny Gardener", "rare"], ["p_otter", "Seashell Otter", "rare"], ["p_puffin", "Puffin Sailor", "rare"], ["p_ghostie", "Lantern Ghost", "rare"], ["p_hamster", "Hamster Pilot", "rare"], ["p_beaver", "Beaver Builder", "rare"], ["p_lamb", "Raincoat Lamb", "rare"], ["p_fox_detective", "Fox Detective", "rare"], ["p_toucan", "Toucan DJ", "rare"], ["p_axolotl", "Axolotl", "rare"], ["p_rhino", "Rhino Gladiator", "epic"], ["p_shark", "Shark Diver", "epic"], ["p_armadillo", "Armadillo Knight", "epic"], ["p_scorpion", "Scorpion Warrior", "epic"], ["p_stag", "Stag Druid", "epic"], ["p_moon_rabbit", "Moon Rabbit Monk", "epic"], ["p_polar_bear", "Polar Berserker", "epic"], ["p_pumpkin_knight", "Pumpkin Knight", "epic"], ["p_coral_knight", "Coral Knight", "epic"], ["p_beetle", "Beetle Knight", "epic"], ["p_sky_pirate", "Sky Pirate", "epic"], ["p_minotaur", "Minotaur Smith", "epic"], ["p_owl_sorcerer", "Owl Sorcerer", "epic"], ["p_gorilla", "Cyborg Gorilla", "epic"], ["p_hawk", "Storm Hawk", "epic"], ["p_salamander", "Lava Salamander", "epic"], ["p_chameleon", "Chameleon Thief", "epic"], ["p_vampire", "Count Batley", "epic"], ["p_inventor", "Steam Inventor", "epic"], ["p_gecko", "Gecko Ninja", "epic"], ["p_frost_elf", "Frost Elf Archer", "epic"], ["p_scarecrow", "Scarecrow Mage", "epic"], ["p_mantis", "Mantis Blademaster", "epic"], ["p_ronin_cat", "Ronin Cat", "epic"], ["p_bee_queen", "Bee Queen", "epic"], ["p_whale", "Celestial Whale", "legendary"], ["p_griffin", "Storm Griffin", "legendary"], ["p_ninefox", "Nine-Tailed Fox", "legendary"], ["p_time_golem", "Time Keeper", "legendary"], ["p_star_knight", "Star Knight", "legendary"], ["p_volcano_titan", "Volcano Titan", "legendary"], ["p_ice_queen", "Ice Queen", "legendary"], ["p_thunderbird", "Thunderbird", "legendary"], ["p_sun_stag", "Sun Stag", "legendary"], ["p_sea_serpent", "Coral Serpent", "legendary"], ["p_cosmic_owl", "Cosmic Owl", "legendary"], ["p_sphinx", "Guardian Sphinx", "legendary"], ["p_moon_goddess", "Moon Goddess", "legendary"], ["p_island_turtle", "Island Turtle", "legendary"], ["p_lightning_tiger", "Lightning Tiger", "legendary"], ["p_koi", "Koi Spirit", "legendary"], ["p_drum_titan", "Thunder Drum Titan", "legendary"], ["p_cat_queen", "Golden Cat Queen", "legendary"], ["p_jellyfish", "Aurora Jellyfish", "legendary"], ["p_galaxy_panther", "Galaxy Panther", "legendary"], ["p_hydra", "Crystal Hydra", "legendary"], ["p_reindeer", "Aurora Reindeer", "legendary"], ["p_ram_king", "Lava Ram King", "legendary"], ["p_mech_titan", "Space Mech", "legendary"], ["p_sky_giant", "Sky Castle Giant", "legendary"], ["p_samurai", "Oni Samurai", "epic"], ["p_tree_spirit", "Tree Spirit", "epic"], ["p_phoenix", "Phoenix", "legendary"], ["p_crystal_golem", "Crystal Golem", "epic"], ["p_wolf", "Frost Wolf", "epic"], ["p_robot_knight", "Robot Knight", "epic"], ["p_wizard", "Wizard", "epic"], ["p_baby_dragon", "Baby Dragon", "epic"], ["p_lion_king", "Lion King", "legendary"], ["p_hooded_mage", "Hooded Mage", "epic"], ["p_octopus", "Octopus", "epic"], ["p_panda_monk", "Panda Monk", "epic"], ["p_robot", "Robot", "epic"], ["p_unicorn", "Unicorn", "legendary"], ["p_alien", "Alien", "epic"], ["p_stone_golem", "Stone Golem", "epic"], ["p_mermaid", "Mermaid", "legendary"], ["p_anubis", "Jackal Guardian", "epic"], ["p_angel_knight", "Angel Knight", "legendary"], ["p_imp", "Horned Imp", "epic"], ["p_crystal_mage", "Crystal Mage", "epic"], ["p_cobra", "Cobra", "epic"], ["p_leaf_spirit", "Leaf Spirit", "epic"], ["p_star_mage", "Star Mage", "epic"]];
var PRICE={common:{c:60000,g:0},rare:{c:225000,g:0},epic:{c:0,g:1200},legendary:{c:0,g:2400}};
var PPRICE={common:{c:60000,g:0},rare:{c:120000,g:0},epic:{c:0,g:1250},legendary:{c:0,g:2500}};
var DDESC={common:'Glossy and bold, easy to read.',rare:'Polished, precious and dotted with style.',epic:'Themed design with big bold numbers.',legendary:'Glowing magic. The rarest dice in Ludora.'};
var PDESC={common:'Clean and classic.',rare:'A cute little racer.',epic:'A hero in full gear.',legendary:'Majestic, glowing and one of a kind.'};
(function(){
  var keepD=ITEMS.die.filter(function(x){return x.id==='classic';});
  var nd=[['n_red','Ruby Red','common'],['n_blue','Ocean Blue','common'],['n_green','Lucky Green','common']].concat(DM);
  ITEMS.die.length=0;keepD.forEach(function(x){ITEMS.die.push(x);});
  nd.forEach(function(d){var p=PRICE[d[2]];ITEMS.die.push({id:d[0],name:d[1],r:d[2],c:p.c,g:p.g,d:DDESC[d[2]]});});
  var keepP=ITEMS.pawn.filter(function(x){return x.id==='classic';});
  var np=[['n_classic','Glossy Classic','common'],['n_royal','Royal Gem','common'],['n_buddy','Buddy','common']].concat(PM);
  ITEMS.pawn.length=0;keepP.forEach(function(x){ITEMS.pawn.push(x);});
  np.forEach(function(p){var c=PPRICE[p[2]];ITEMS.pawn.push({id:p[0],name:p[1],r:p[2],c:c.c,g:c.g,grp:p[2],d:PDESC[p[2]]});});
  if(!hasId('die',set.eq.die))set.eq.die='classic';if(!hasId('pawn',set.eq.pawn))set.eq.pawn='classic';
})();
PGROUPS.length=0;[['all','All'],['common','Classic'],['rare','Cute'],['epic','Heroes'],['legendary','Mythic']].forEach(function(g){PGROUPS.push(g);});pawnGrp='all';
var NSET={};ITEMS.pawn.forEach(function(p){if(p.id!=='classic')NSET[p.id]=1;});
var COLI={red:0,green:1,yellow:2,blue:3,white:4},SHEET={},CUT={},TINT={};
var BLANKP='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
function hexOf(cname){var c=PCOLORS.filter(function(x){return x.id===cname;})[0];return c&&c.hex?c.hex:'#ffffff';}
function sheet(id,cb){
  if(SHEET[id]&&SHEET[id].ok)return cb(SHEET[id].im);
  if(!SHEET[id]){SHEET[id]={cbs:[]};var im=new Image();im.onload=function(){SHEET[id].ok=1;SHEET[id].im=im;SHEET[id].cbs.forEach(function(f){f(im);});SHEET[id].cbs=[];};im.src='pawnset/'+id+'.webp';}
  SHEET[id].cbs.push(cb);
}
/* one pawn picture: cut from the set's sheet, painted for custom colours */
function pawnURL(id,col,done){
  var std=COLI[col]!=null&&col!=='white',k=id+'|'+col;
  if(CUT[k])return CUT[k];
  sheet(id,function(im){if(CUT[k])return;var c=document.createElement('canvas');c.width=200;c.height=224;var x=c.getContext('2d');
    x.drawImage(im,(std?COLI[col]:4)*200,0,200,224,0,0,200,224);
    if(!std&&col!=='white'){x.globalCompositeOperation='multiply';x.fillStyle=hexOf(col);x.fillRect(0,0,200,224);x.globalCompositeOperation='destination-in';x.drawImage(im,4*200,0,200,224,0,0,200,224);}
    try{CUT[k]=c.toDataURL('image/png');}catch(e){CUT[k]=BLANKP;}
    if(done)done(CUT[k]);else{try{applyPawnLooks();}catch(e){}}});
  return BLANKP;
}
V9.pawnURL=pawnURL;
/* sprite version (no canvas): one sheet per set, frames red,green,yellow,blue,white */
function sprHTML(id,col){
  var std=COLI[col]!=null,ix=std?COLI[col]:4,u='url("pawnset/'+id+'.webp")',x=(ix*25)+'%';
  var h='<span class="spr9" style="--u:'+u.replace(/"/g,"&quot;")+';--x:'+x+'"></span>';
  if(!std)h+='<span class="spr9 tint" style="--u:'+u.replace(/"/g,"&quot;")+';--x:100%;--c:'+hexOf(col)+'"></span>';
  return h;
}
V9.sprHTML=sprHTML;
var pimg0=window.__ludoraPawnImg;
window.__ludoraPawnImg=function(id,col){id=String(id);if(NSET[id])return pawnURL(id,col);return pimg0?pimg0(id,col):null;};
var apl9=applyPawnLooks;
applyPawnLooks=function(){
  apl9.apply(this,arguments);
  S.players.forEach(function(pl){
    var id=String(lookOf(pl).p);if(!NSET[id])return;
    var cname=(window.__ludoraV7&&window.__ludoraV7.colorName&&window.__ludoraV7.colorName[pl.seat])||SEATS[pl.seat];
    for(var i=0;i<4;i++){var pw=PW[pl.seat]&&PW[pl.seat][i];if(!pw)continue;pw.el.classList.add('g3','g3c','g9');pw.el.style.setProperty('--g3','none');var bob=pw.el.querySelector('.bob');if(bob&&bob.dataset.spr!==id+'|'+cname){bob.dataset.spr=id+'|'+cname;bob.querySelectorAll('.spr9').forEach(function(n){n.remove();});bob.insertAdjacentHTML('beforeend',sprHTML(id,cname));}}
  });
};
var piv9=previewInto;
previewInto=function(pv,cat,it,big){
  if(cat==='pawn'&&NSET[String(it.id)]){
    pv.innerHTML='';pv.style.background='radial-gradient(circle at 50% 70%,#3a56e0 0,#16206e 70%)';
    var row=document.createElement('div');row.className='pvset pv9';
    ['red','green','yellow','blue'].forEach(function(c){var d=document.createElement('span');d.className='pv9c';d.innerHTML=sprHTML(String(it.id),c);row.appendChild(d);});
    pv.appendChild(row);return;
  }
  return piv9.apply(this,arguments);
};
/* board cards show the new board picture */
var piv9b=previewInto;
previewInto=function(pv,cat,it,big){
  var r=piv9b.apply(this,arguments);
  if(cat==='board'&&!big){try{var k=window.__ludoraV3&&window.__ludoraV3.artKey?window.__ludoraV3.artKey(it):null;if(k&&it.fx!=='classic'){pv.innerHTML='';pv.style.background='url("boards/'+k+'.webp") center/cover no-repeat';}}catch(e){}}
  return r;
};
/* computer players bring their own dice and pawns (any style in the game) */
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function botLooks(){
  if(S.mode!=='cpu')return;
  var me=myLook(),d=shuffle(ITEMS.die.map(function(x){return x.id;}).filter(function(x){return x!=='classic'&&x!==me.d;})),p=shuffle(ITEMS.pawn.map(function(x){return x.id;}).filter(function(x){return x!=='classic'&&x!==me.p;})),k=0;
  S.players.forEach(function(pl){if(!pl.bot||pl.you)return;var l=defLook();l.d=d[k%d.length]||l.d;l.p=p[k%p.length]||l.p;pl.look=l;k++;});
  try{applyPawnLooks();}catch(e){}try{renderSeats();}catch(e){}
}
var sg9=startGame;
startGame=function(){var r=sg9.apply(this,arguments);try{botLooks();}catch(e){}return r;};
V9.botLooks=botLooks;

/* ---------- 1.6 fixes: tap anywhere near a glowing pawn moves the nearest one ---------- */
stage.addEventListener('pointerdown',function(e){
  if(S.phase!=='move')return;var pl=cur();if(!pl||!mine(pl)||pl.bot)return;
  var best=null,bd=1e9;
  S.legal.forEach(function(i){var r=PW[ctlSeat(pl)][i].el.getBoundingClientRect();var d=Math.hypot(r.left+r.width/2-e.clientX,r.top+r.height*.6-e.clientY);if(d<bd){bd=d;best=i;}});
  if(best===null||bd>CELL*2.2)return;
  e.stopImmediatePropagation();humanMove(best);
},true);
})();
