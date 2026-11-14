/* ---------- worlds, stages, monster book, animation review, bosses ---------- */
const ATKDESC={charge:'Paws the ground, then charges straight at you.',pounce:'Crouches low, then leaps onto you.',bite:'Rears back, then lunges in for a chomp.',tailwhip:'Turns around and swipes its tail.',spit:'Spits a glob that leaves a sticky puddle.',
 breath:'Breathes a long stream at you. Jump over it.',beam:'Charges a glowing orb, then fires a beam.',quills:'Puffs up and fires a fan of spikes.',shockwave:'Jumps and slams the ground: the shockwave rolls toward you.',roll:'Curls into a ball and rolls at you.',
 burrow:'Digs underground, tunnels to you and bursts up under your feet.',dive:'Rises up, then dives at you.',stingers:'Flies over you and drops stingers.',sonic:'Screeches sound waves that leave you dizzy.',tongue:'Shoots out a long tongue and pulls you in.',
 ink:'Bursts a cloud that blinds you for a moment.',split:'Splits into two little copies that hop at you.',blink:'Vanishes, appears behind you and strikes.',zap:'Crackles with power, then zaps you with lightning.',spore:'Puffs a drifting spore cloud that makes you dizzy.',
 boulder:'Lifts a rock over its head and throws it.',crystal:'Stomps and makes crystal spikes burst out of the ground.',whirl:'Spins into a whirlwind and spins through you.',claw:'Rears up and slashes you with its claws.',feathers:'Shoots a quick volley of darts.',
 bubble:'Blows wobbly bubbles that pop on you.',lure:'Glows to hypnotise you, then snaps when you come close.',icicle:'Makes icicles fall from above. Watch their shadows.',vine:'Grows vines under you that hold you in place.',bounce:'Jumps sky high and lands right on top of you.'};
const BODYN={quad:'walks on four legs',stout:'waddles',tall:'stalks on long legs',blob:'jiggles and hops',fly:'flies',hover:'floats',snake:'slithers',swim:'swims',crawl:'skitters',shell:'plods',plant:'sways in place',roll:'rolls about',toy:'springs about'};
const GROUPS=[['mixed','Wild'],['shapes','Shapes'],['beasts','Beasts'],['sea','Sea'],['forest','Forest'],['reptile','Reptiles'],['sky','Sky']];
function stageLabel(n){return Math.floor((n-1)/5)+1+'-'+((n-1)%5+1);}
function thumb(m,badge){return '<img alt="" src="mon/'+m.id+'.webp">'+(badge?'<i>'+badge+'</i>':'');}
function sceneLoop(c,S){let last=null;return addLoop(c,(g,t,W,H)=>{const dt=last==null?1/60:Math.min(.05,t-last);last=t;S.update(dt);S.render(g,t);if(S.bossBar){const a=S.bossBar;g.fillStyle='rgba(10,8,30,.75)';g.beginPath();g.roundRect(W*.18,8,W*.64,12,6);g.fill();g.fillStyle='#ff4a5a';g.beginPath();g.roundRect(W*.18+2,10,(W*.64-4)*(.55+.45*Math.cos(t*.4)**2),8,4);g.fill();g.font='800 10px Nunito,system-ui';g.fillStyle='#fff';g.textAlign='center';g.fillText(a.m.name,W/2,32);}});}
function duelScene(m,W,H,role){const S=new Scene(W,H,homeTheme(m),PLAN.unlock[m.id]||3);const a=new Actor(m,S,{x:W*.7,h:role==='boss'?H*.56:H*.4,delay:.8,role});S.actors.push(a);if(role==='boss')S.bossBar=a;return S;}
function removeLoops(arr){for(const o of arr){const i=LOOPS.indexOf(o);if(i>=0)LOOPS.splice(i,1);}arr.length=0;}
let MOLOOPS=[];
function openMo(html,setup){removeLoops(MOLOOPS);$('#mo-b').innerHTML=html;$('#mo').hidden=false;if(setup)setup();}
function closeMo(){$('#mo').hidden=true;removeLoops(MOLOOPS);}
function monRow(m,tag){return '<div>'+thumb(m)+'<span><b>'+m.name+'</b> '+(tag||'')+'<br><b style="font-size:12px;color:#ffd35c">'+m.an+'</b>: '+ATKDESC[m.atk]+'</span></div>';}
function stageModal(st){const w=worldOf(st.world);
  openMo('<canvas id="sv"></canvas><div class="ml"><b style="font-size:18px">'+stageLabel(st.n)+' · '+st.name+'</b><p class="note" style="margin:0">'+w.name+' ('+w.where+') · '+st.total+' monsters in this stage</p>'+
    st.neu.map(m=>monRow(m,'🆕 New')).join('')+(st.elite?monRow(st.elite,'⭐ Elite (glows gold, a bit tougher)'):'')+(st.boss?monRow(st.boss,'Boss'):'')+
    (st.surprise?'<p class="note" style="margin:4px 0 0">Surprise encounter: an elite '+st.surprise.name+' may show up here.</p>':'')+'</div>',
    ()=>{const c=$('#sv');sizeCanvas(c,560,250);const S=new Scene(560,250,w.theme,st.n);S.hero.x=60;
      let list=[...st.neu];if(st.elite)list.push(st.elite);if(st.boss)list=[st.boss];const extra=st.seen.filter(m=>!list.includes(m)).slice(-2);if(!st.boss)list=list.concat(extra).slice(0,4);
      list.forEach((m,i)=>{const boss=st.boss===m,el=st.elite===m;S.actors.push(new Actor(m,S,{x:boss?400:200+i*95,h:boss?135:el?92:70,delay:.8+i*1.7,calm:true,role:boss?'boss':el?'elite':''}));});
      if(st.boss)S.bossBar=S.actors[0];MOLOOPS.push(sceneLoop(c,S));});}
function duelModal(m){const n=PLAN.unlock[m.id],st=PLAN.stages[n-1],role=PLAN.role[m.id]||'';
  openMo('<canvas id="bv"></canvas><div class="ml"><b style="font-size:20px">'+m.name+(role?' <span class="tag">'+(role==='boss'?'Boss':'Elite')+'</span>':'')+'</b>'+monRow(m)+'<div><span>It '+BODYN[m.body]+'. First met: stage '+stageLabel(n)+', '+st.name+' ('+worldOf(st.world).name+')</span></div></div>',
    ()=>{const c=$('#bv');sizeCanvas(c,560,250);MOLOOPS.push(sceneLoop(c,duelScene(m,560,250,role)));});}
function drawWorlds(){const L=$('#wlist');L.innerHTML='';
  for(let k=0;k<PLACES.length;k++){const w=worldOf(k),T=THEMES[w.theme];const card=document.createElement('div');card.className='card';const c=canvasCard(340,150);
    const boss=PLAN.stages[k*5+4].boss;const fake={gy:120,H:150,heroPt(){return {x:0,y:90};},add(){},later(){},draw2(){},proj:[]};const a=boss?new Actor(boss,fake,{x:250,h:78,attacks:false}):null;let last=null;
    addLoop(c,(g,t,W,H)=>{const dt=last==null?1/60:Math.min(.05,t-last);last=t;fake.gy=paintWorld(g,W,H,w.theme,t,k*5+1);if(a){a.update(dt);a.drawShadow(g);a.draw(g);}g.font='900 15px "Baloo 2",Nunito';g.fillStyle='#fff';g.textAlign='left';g.fillText('World '+(k+1),10,20);});
    const cb=document.createElement('div');cb.className='cb';cb.innerHTML='<h3>'+w.name+'</h3><p>📍 '+w.where+' · Hazards: '+T.haz.join(', ')+'</p>';
    const list=document.createElement('div');list.style.marginTop='6px';
    for(let s=0;s<5;s++){const st=PLAN.stages[k*5+s];const b=document.createElement('button');b.className='st';
      b.innerHTML='<b>'+stageLabel(st.n)+'</b><span>'+st.name+(s===2?' ⭐':'')+(s===4?' · Boss':'')+'</span>'+st.neu.map(m=>thumb(m,'NEW')).join('')+(st.elite?thumb(st.elite,'⭐'):'')+(st.boss?thumb(st.boss,'BOSS'):'');
      b.onclick=()=>stageModal(st);list.appendChild(b);}
    cb.appendChild(list);card.appendChild(c);card.appendChild(cb);L.appendChild(card);}
  $('#remix').innerHTML='After the 30 real places, worlds come back as new twists, e.g. <b>'+[30,31,32,45,61].map(k=>worldOf(k).name).join('</b>, <b>')+'</b>, with fresh layouts. New monsters you give me join from there. All '+PLAN.usedCount+' of your monsters are placed in the first 150 stages, so no stage repeats a "new" monster.';}
function drawBook(){const reached=3;const g=$('#bkgrid');const order=MONS.slice().sort((a,b)=>(PLAN.unlock[a.id]||999)-(PLAN.unlock[b.id]||999));let found=0;
  g.innerHTML=order.map(m=>{const u=PLAN.unlock[m.id]||999,ok=u<=reached;if(ok)found++;const w=u<999?worldOf(PLAN.stages[u-1].world):null;
    return '<button class="'+(ok?'':'lk')+'" data-id="'+m.id+'"><img alt="" loading="lazy" src="mon/'+m.id+'.webp"><b>'+m.name+'</b><small>'+(ok?m.an:'🔒 '+(w?w.name:'Later'))+'</small></button>';}).join('');
  $('#bk-c').textContent='Example: a player who has reached stage 1-3 has met '+found+' of '+MONS.length+' monsters. Tap a met monster to watch it.';}
$('#bkgrid').onclick=e=>{const b=e.target.closest('button');if(!b||b.classList.contains('lk'))return;duelModal(CATBY[b.dataset.id]);};
let RVLOOPS=[];
function drawReview(grp){removeLoops(RVLOOPS);const g=$('#rvgrid');g.innerHTML='';
  CAT.filter(m=>m.hab===grp).forEach(m=>{const card=document.createElement('div');card.className='card';const c=canvasCard(340,190);const role=PLAN.role[m.id]||'';
    RVLOOPS.push(sceneLoop(c,duelScene(m,340,190,role)));const cb=document.createElement('div');cb.className='cb';
    cb.innerHTML='<h3>'+m.name+(role?' <span class="tag">'+(role==='boss'?'Boss':'Elite')+'</span>':'')+'</h3><p><b style="color:#ffd35c">'+m.an+'</b>: '+ATKDESC[m.atk]+'</p><p>It '+BODYN[m.body]+'.</p>';
    card.appendChild(c);card.appendChild(cb);g.appendChild(card);});}
$('#rvchips').innerHTML=GROUPS.map((x,i)=>'<button aria-pressed="'+(i===0)+'" data-g="'+x[0]+'">'+x[1]+' ('+CAT.filter(m=>m.hab===x[0]).length+')</button>').join('');
$('#rvchips').onclick=e=>{const b=e.target.closest('button');if(!b)return;$('#rvchips').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));drawReview(b.dataset.g);};
function drawBosses(){const g=$('#bgrid');g.innerHTML='';for(let k=0;k<12;k++){const st=PLAN.stages[k*5+4],m=st.boss;if(!m)continue;const w=worldOf(k);const card=document.createElement('div');card.className='card';const c=canvasCard(320,220);
  sceneLoop(c,duelScene(m,320,220,'boss'));
  const cb=document.createElement('div');cb.className='cb';cb.innerHTML='<h3>'+m.name+' <span class="tag">'+w.name+'</span></h3><p><b style="color:#ffd35c">'+m.an+'</b>: '+ATKDESC[m.atk]+' As a boss it is bigger, attacks faster and calls in helpers at half health.</p>';card.appendChild(c);card.appendChild(cb);g.appendChild(card);}}
