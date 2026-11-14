/* endless worlds: real mysterious places, each with its own look, hazards, stage names and monsters; never loops */
const THEMES={
 forest:{el:['plant','wild','night'],sky:['#1f2a4a','#3a5a5a'],ground:[60,70,60],sil:'trees',fx:'fireflies',hab:['forest','mixed'],haz:['Thorn bushes','Falling logs','Mossy slopes']},
 plains:{el:['wild','sand'],sky:['#3a3f7a','#c98a6a'],ground:[90,110,70],sil:'stones',fx:'wind',hab:['beasts','mixed','forest'],haz:['Rolling boulders','Strong wind','Tall grass']},
 jungle:{el:['plant','wild','water'],sky:['#16382e','#3a7a4a'],ground:[60,90,50],sil:'vines',fx:'rain',hab:['reptile','sky','forest'],haz:['Vine swings','Quicksand','Snapping plants']},
 stormsea:{el:['water'],sky:['#1a2440','#4a5a7a'],ground:[60,70,90],sil:'waves',fx:'storm',hab:['sea','sky'],haz:['Lightning','Whirlpools','Floating wreckage']},
 desert:{el:['sand','toy'],sky:['#e8a060','#ffd9a0'],ground:[200,160,100],sil:'pyramids',fx:'sand',hab:['reptile','beasts','shapes'],haz:['Sand pits','Heat waves','Falling sand']},
 deepsea:{el:['water','night'],sky:['#020818','#0a2a50'],ground:[30,40,70],sil:'kelp',fx:'bubbles',hab:['sea'],haz:['Water currents','Pressure vents','Dark zones (light it up)']},
 volcano:{el:['fire'],sky:['#2a0a0a','#a8301a'],ground:[70,40,40],sil:'peaks',fx:'embers',hab:['reptile','mixed','beasts'],haz:['Lava pools','Fire geysers','Falling rocks']},
 ice:{el:['ice'],sky:['#1a2a50','#8ab8e0'],ground:[200,220,240],sil:'peaks',fx:'snow',hab:['beasts','mixed'],haz:['Slippery ice','Icicles','Avalanches']},
 geo:{el:['toy'],sky:['#c88a50','#f0d0a0'],ground:[190,150,110],sil:'lines',fx:'sand',hab:['shapes'],haz:['Moving lines','Shape gates','Spinning blocks']},
 ruinsea:{el:['water','toy'],sky:['#03122a','#0a4a6a'],ground:[60,80,90],sil:'columns',fx:'bubbles',hab:['sea','shapes'],haz:['Collapsing columns','Currents','Glowing traps']},
 coast:{el:['wild','water'],sky:['#3a5a9a','#f0b080'],ground:[110,120,90],sil:'moai',fx:'wind',hab:['beasts','sky','sea'],haz:['Crashing waves','Cliff edges','Strong wind']},
 lake:{el:['water'],sky:['#2a3a4a','#7a8a8a'],ground:[60,80,70],sil:'hills',fx:'mist',hab:['sea','reptile'],haz:['Thick fog','Rising water','Something in the lake…']},
 temple:{el:['plant','toy','crystal'],sky:['#1a3a2a','#6a8a5a'],ground:[110,100,80],sil:'temple',fx:'leaves',hab:['reptile','forest','sky'],haz:['Spike traps','Moving walls','Root bridges']},
 cave:{el:['crystal','night'],sky:['#0a0a18','#2a2a40'],ground:[60,55,70],sil:'stalactites',fx:'drips',hab:['mixed','beasts','reptile'],haz:['Falling stalactites','Dark tunnels','Underground river']},
 swamp:{el:['water','plant'],sky:['#1a2a1a','#4a6a3a'],ground:[60,70,40],sil:'cypress',fx:'mist',hab:['reptile','sea','sky'],haz:['Deep mud','Gas bubbles','Sinking logs']},
 cloud:{el:['wild'],sky:['#6a8ad0','#e0f0ff'],ground:[150,170,140],sil:'clouds',fx:'wind',hab:['sky','beasts'],haz:['Cloud platforms','Gusts','Long drops']},
 aurora:{el:['ice','night'],sky:['#05102a','#1a5a5a'],ground:[200,220,240],sil:'peaks',fx:'aurora',hab:['beasts','mixed','sky'],haz:['Thin ice','Snow storms','Freezing water']},
 glowsea:{el:['water','night'],sky:['#020a20','#0a2a4a'],ground:[30,50,70],sil:'mangrove',fx:'glow',hab:['sea','sky'],haz:['Glowing tides','Jellyfish fields','Night currents']},
 redlake:{el:['sand','fire'],sky:['#a04a5a','#f0a080'],ground:[180,80,70],sil:'hills',fx:'heat',hab:['sky','reptile'],haz:['Salt crust','Hot springs','Red water']},
 alien:{el:['toy','plant','wild'],sky:['#4a2a6a','#d080a0'],ground:[150,110,90],sil:'dragontrees',fx:'spores',hab:['mixed','shapes','reptile'],haz:['Strange plants','Low gravity zones','Rolling seeds']},
 acid:{el:['fire','sand','crystal'],sky:['#c8c040','#40a080'],ground:[200,180,60],sil:'spires',fx:'heat',hab:['reptile','mixed'],haz:['Acid pools','Salt spires','Boiling vents']},
 tomb:{el:['toy','sand','night'],sky:['#2a1a10','#a07040'],ground:[150,110,70],sil:'tombs',fx:'dust',hab:['shapes','reptile','beasts'],haz:['Dart traps','Sliding floors','Cursed torches']},
};
const PLACES=[
 ['Black Forest','forest','Germany',['Old Pines','Witch Hollow','Cuckoo Woods','Mist Ravine','Heart of the Forest']],
 ['Stonehenge Plains','plains','England',['Barrow Hills','Avenue of Stones','Heel Stone','Sunrise Circle','The Great Trilithon']],
 ['Amazon Rainforest','jungle','Brazil',['River Bank','Canopy Walk','Flooded Forest','Vine Temple','Heart of the Amazon']],
 ['Bermuda Triangle','stormsea','Atlantic Ocean',['Calm Waters','Ghost Ship','Compass Spin','Storm Eye','The Vanishing Point']],
 ['Pyramids of Giza','desert','Egypt',['Sphinx Sands','Workers Village','Queen’s Pyramid','Grand Gallery','King’s Chamber']],
 ['Mariana Trench','deepsea','Pacific Ocean',['Sunlight Shelf','Twilight Zone','Midnight Drop','Abyss Vents','Challenger Deep']],
 ['Mount Vesuvius','volcano','Italy',['Pompeii Streets','Ash Fields','Lava Tubes','Crater Rim','The Fiery Heart']],
 ['Himalayan Peaks','ice','Nepal',['Prayer Flags','Glacier Path','Yeti Caves','Death Zone','Roof of the World']],
 ['Nazca Lines','geo','Peru',['The Hummingbird','The Spider','The Monkey','The Astronaut','The Condor']],
 ['Lost City of Atlantis','ruinsea','Somewhere below',['Sunken Gates','Coral Streets','Crystal Library','Temple of Poseidon','The Throne Below']],
 ['Easter Island','coast','Chile',['Rano Raraku','Moai Quarry','Orongo Cliffs','Birdman Race','The Seven Moai']],
 ['Loch Ness','lake','Scotland',['Castle Shore','Misty Waters','Peat Shallows','The Deep Loch','Nessie’s Lair']],
 ['Angkor Wat','temple','Cambodia',['Moat Bridge','Root Temple','Hall of Faces','Upper Terrace','The Central Tower']],
 ['Son Doong Cave','cave','Vietnam',['Cave Mouth','Jungle Inside','Great Wall of Vietnam','Underground River','Garden of Edam']],
 ['Louisiana Bayou','swamp','USA',['Cypress Row','Gator Bend','Spanish Moss','Ghost Lights','The Old Plantation']],
 ['Machu Picchu','cloud','Peru',['Sun Gate','Terraces','Temple of the Condor','Huayna Picchu','Intihuatana Stone']],
 ['Northern Lights','aurora','Iceland',['Black Beach','Ice Caves','Glacier Lagoon','Geyser Field','Aurora Sky']],
 ['Bioluminescent Bay','glowsea','Puerto Rico',['Mangrove Mouth','Glowing Shallows','Night Kayak','Jelly Drift','Starlight Lagoon']],
 ['Lake Natron','redlake','Tanzania',['Salt Flats','Flamingo Banks','Red Shallows','Hot Springs','Stone Statues']],
 ['Socotra Island','alien','Yemen',['Dragon Blood Grove','Bottle Trees','Sand Dunes','Haggier Peaks','The Alien Garden']],
 ['Danakil Depression','acid','Ethiopia',['Salt Road','Yellow Springs','Acid Pools','Erta Ale','Dallol Crater']],
 ['Valley of the Kings','tomb','Egypt',['Tomb Gate','Painted Corridor','Hall of Chariots','Golden Shrine','The Pharaoh’s Tomb']],
 ['Great Blue Hole','deepsea','Belize',['Reef Edge','Blue Wall','Stalactite Shelf','Hydrogen Cloud','The Bottom']],
 ['Crooked Forest','forest','Poland',['Bent Pines','Hook Hollow','Twisted Path','Old Sawmill','The Crooked Heart']],
 ['Cappadocia','plains','Turkey',['Fairy Chimneys','Balloon Valley','Cave Houses','Underground City','Derinkuyu Deep']],
 ['Skeleton Coast','coast','Namibia',['Shipwreck Beach','Seal Colony','Fog Dunes','Whale Bones','The Lost Ship']],
 ['Mount Roraima','cloud','Venezuela',['The Ramp','Crystal Valley','Black Rocks','The Window','Triple Point']],
 ['Antarctica','ice','South Pole',['Penguin Bay','Ice Shelf','Blood Falls','Dry Valleys','The Pole']],
 ['Tunguska','volcano','Siberia',['Fallen Forest','Scorched Hills','Swamp of Ash','Blast Center','The Sky Stone']],
 ['Mount Everest Base','ice','Nepal',['Khumbu Icefall','Western Cwm','Lhotse Face','South Col','The Summit']],
];
const MODS=['at Night','in a Storm','Flooded','Frozen','Burning','in Fog','Upside-Down','Overgrown','in a Sandstorm','Under the Eclipse'];
function worldOf(k){
  if(k<PLACES.length){const p=PLACES[k];return {k,name:p[0],theme:p[1],where:p[2],stages:p[3],mod:''};}
  const i=k-PLACES.length,p=PLACES[(i*7+3)%PLACES.length],m=MODS[Math.floor(i/PLACES.length+i)%MODS.length];
  return {k,name:p[0]+' '+m,theme:p[1],where:p[2],stages:p[3].slice(),mod:m,remix:true};
}
/* who lives where: every stage brings brand-new monsters that suit the place; stage 3 has an elite, stage 5 a boss */
const MONS=CAT;
const BIGBODY={stout:1,quad:1,shell:1,snake:1,fly:1,swim:1,tall:1,crawl:1};
const PLAN=(function(){
  const used=new Set(),stages=[],unlock={},role={};
  const pick=(T,R,pred)=>{let best=null,bs=-1;for(const m of MONS){if(used.has(m.id)||(pred&&!pred(m)))continue;const sc=(T.el.includes(m.el)?3:0)+(T.hab.includes(m.hab)?2:0)+R()*1.6;if(sc>bs){bs=sc;best=m;}}return best;};
  for(let k=0;k<PLACES.length;k++){const w=worldOf(k),T=THEMES[w.theme],R=rng(1000+k);const seen=[];
    for(let s=0;s<5;s++){const n=k*5+s+1,neu=[];
      for(let i=0;i<[2,2,1,2,0][s];i++){const m=pick(T,R);if(m){used.add(m.id);unlock[m.id]=n;neu.push(m);seen.push(m);}}
      let elite=null,boss=null,surprise=null;
      if(s===2){elite=pick(T,R,m=>BIGBODY[m.body]);if(elite){used.add(elite.id);unlock[elite.id]=n;role[elite.id]='elite';}}
      if(s===4){boss=pick(T,R,m=>({stout:1,quad:1,shell:1,snake:1,tall:1,swim:1})[m.body]);if(boss){used.add(boss.id);unlock[boss.id]=n;role[boss.id]='boss';}}
      if(s!==2&&s!==4&&seen.length>2&&R()<.25)surprise=seen[Math.floor(R()*(seen.length-1))];
      const total=Math.min(3+Math.floor(n/6),8);
      stages.push({n,world:k,name:w.stages[s],neu,elite,boss,surprise,total,seen:seen.slice()});}
  }
  return {stages,unlock,role,usedCount:used.size};
})();
function homeTheme(m){const n=PLAN.unlock[m.id];return n?worldOf(PLAN.stages[n-1].world).theme:'forest';}
/* painted backdrop per theme */
function paintWorld(g,W,H,theme,t,seed){const T=THEMES[theme],R=rng(seed||5);
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,T.sky[0]);gr.addColorStop(1,T.sky[1]);g.fillStyle=gr;g.fillRect(0,0,W,H);
  const gy=H*.8,dark=rgba(tone(hex2(T.sky[0]),-.2),.85),mid=rgba(mix(hex2(T.sky[0]),hex2(T.sky[1]),.35),.9);
  if(theme==='aurora'){for(let i=0;i<3;i++){g.strokeStyle=`rgba(90,${200-i*30},${200+i*20},.35)`;g.lineWidth=14-i*3;g.beginPath();for(let x=0;x<=W;x+=10)g.lineTo(x,30+i*14+Math.sin(x*.02+t*.6+i)*12);g.stroke();}}
  if(['desert','geo','tomb','redlake','acid'].includes(theme))glowDot(g,W*.78,H*.2,46,[255,240,200],.6);
  if(['forest','plains','coast','lake','ice','cloud'].includes(theme)){g.fillStyle='rgba(240,245,255,.85)';g.beginPath();g.arc(W*.8,H*.18,14,0,TAU);g.fill();}
  g.fillStyle=mid;const S=T.sil;
  if(S==='trees'||S==='cypress'||S==='mangrove'){for(let i=0;i<9;i++){const x=i*W/8+R()*20,h=50+R()*50;g.beginPath();g.moveTo(x-16,gy);g.lineTo(x,gy-h);g.lineTo(x+16,gy);g.fill();}}
  if(S==='stones'){for(let i=0;i<6;i++){const x=W*.12+i*W*.14;g.fillRect(x,gy-40,14,40);if(i%2)g.fillRect(x-4,gy-47,36,8);}}
  if(S==='pyramids'){[[.25,70],[.5,95],[.72,55]].forEach(([x,h])=>{g.beginPath();g.moveTo(W*x-h,gy);g.lineTo(W*x,gy-h);g.lineTo(W*x+h,gy);g.fill();});}
  if(S==='peaks'||S==='spires'){g.beginPath();g.moveTo(0,gy);for(let i=0;i<=8;i++)g.lineTo(i*W/8,gy-(i%2?90+R()*25:30+R()*25));g.lineTo(W,gy);g.fill();if(theme!=='volcano'&&theme!=='acid'){g.fillStyle='rgba(255,255,255,.55)';for(let i=1;i<=8;i+=2){g.beginPath();g.moveTo(i*W/8-10,gy-78);g.lineTo(i*W/8,gy-96);g.lineTo(i*W/8+10,gy-78);g.fill();}}}
  if(S==='kelp'){g.strokeStyle=rgba([40,120,90],.6);g.lineWidth=5;for(let i=0;i<10;i++){const x=i*W/9;g.beginPath();g.moveTo(x,gy);for(let y=gy;y>gy-100;y-=10)g.lineTo(x+Math.sin(y*.05+t*1.5+i)*8,y);g.stroke();}}
  if(S==='columns'){for(let i=0;i<5;i++){const x=W*.1+i*W*.2;g.fillRect(x,gy-70-(i%2)*18,12,70+(i%2)*18);g.fillRect(x-5,gy-76-(i%2)*18,22,6);}}
  if(S==='waves'){g.fillStyle=rgba([40,60,90],.9);g.beginPath();g.moveTo(0,gy);for(let x=0;x<=W;x+=8)g.lineTo(x,gy-26+Math.sin(x*.05+t*2)*7);g.lineTo(W,gy);g.fill();}
  if(S==='moai'){for(let i=0;i<5;i++){const x=W*.13+i*W*.17;g.beginPath();g.roundRect(x,gy-52,20,52,[8,8,0,0]);g.fill();g.fillRect(x-3,gy-40,26,5);}}
  if(S==='hills'||S==='clouds'){g.beginPath();g.moveTo(0,gy);for(let x=0;x<=W;x+=20)g.lineTo(x,gy-34-Math.sin(x*.012+seed)*24);g.lineTo(W,gy);g.fill();if(S==='clouds'){g.fillStyle='rgba(255,255,255,.75)';for(let i=0;i<5;i++){const x=(i*W/4+t*8)%(W+60)-30;g.beginPath();g.arc(x,50+i%2*26,18,0,TAU);g.arc(x+20,48+i%2*26,14,0,TAU);g.arc(x-18,52+i%2*26,12,0,TAU);g.fill();}}}
  if(S==='temple'||S==='tombs'){g.beginPath();g.moveTo(W*.3,gy);g.lineTo(W*.35,gy-60);g.lineTo(W*.45,gy-60);g.lineTo(W*.5,gy-110);g.lineTo(W*.55,gy-60);g.lineTo(W*.65,gy-60);g.lineTo(W*.7,gy);g.fill();}
  if(S==='stalactites'){g.fillStyle=dark;for(let i=0;i<14;i++){const x=i*W/13;g.beginPath();g.moveTo(x-10,0);g.lineTo(x,30+R()*40);g.lineTo(x+10,0);g.fill();}}
  if(S==='vines'){g.strokeStyle=rgba([40,90,50],.8);g.lineWidth=3;for(let i=0;i<8;i++){const x=i*W/7;g.beginPath();g.moveTo(x,0);g.quadraticCurveTo(x+20,50,x+Math.sin(t+i)*6,90+R()*30);g.stroke();}}
  if(S==='dragontrees'){for(let i=0;i<5;i++){const x=W*.1+i*W*.2;g.fillRect(x-3,gy-52,6,52);g.beginPath();g.ellipse(x,gy-58,28,11,0,0,TAU);g.fill();}}
  if(S==='lines'){g.strokeStyle='rgba(255,240,220,.6)';g.lineWidth=3;g.beginPath();g.moveTo(W*.1,gy+12);g.lineTo(W*.4,gy+4);g.lineTo(W*.3,gy+16);g.lineTo(W*.7,gy+6);g.lineTo(W*.9,gy+14);g.stroke();}
  const gg=g.createLinearGradient(0,gy,0,H);gg.addColorStop(0,rgba(T.ground));gg.addColorStop(1,rgba(tone(T.ground,-.6)));g.fillStyle=gg;g.fillRect(0,gy,W,H-gy);
  g.fillStyle=rgba(tone(T.ground,.25),.6);g.fillRect(0,gy,W,2);
  const fx=T.fx,PR=rng(seed+9);
  for(let i=0;i<(LOWFX?8:22);i++){const x0=PR()*W,y0=PR()*H,sp=10+PR()*20;let x=x0,y=y0;
    if(fx==='snow'||fx==='sand'||fx==='dust'||fx==='leaves'){y=(y0+t*sp)%H;x=(x0+Math.sin(t+i)*10+(fx==='sand'?t*30:0))%W;g.fillStyle=fx==='snow'?'rgba(255,255,255,.8)':fx==='leaves'?'rgba(120,180,80,.7)':'rgba(255,230,190,.5)';g.fillRect(x,y,2,2);}
    else if(fx==='bubbles'||fx==='drips'){y=(y0-t*sp+H*5)%H;g.strokeStyle='rgba(180,230,255,.45)';g.beginPath();g.arc(x,y,2+i%3,0,TAU);g.stroke();}
    else if(fx==='embers'||fx==='heat'){y=(y0-t*sp+H*5)%H;g.fillStyle=`rgba(255,${120+i*4},60,.7)`;g.fillRect(x,y,2,2);}
    else if(fx==='rain'||fx==='storm'){y=(y0+t*200)%H;g.strokeStyle='rgba(180,200,255,.3)';g.beginPath();g.moveTo(x,y);g.lineTo(x-3,y+9);g.stroke();}
    else if(fx==='fireflies'||fx==='glow'||fx==='spores'){g.fillStyle=fx==='glow'?'rgba(90,220,255,.8)':'rgba(220,255,140,.8)';g.globalAlpha=.5+Math.sin(t*3+i)*.5;g.beginPath();g.arc(x+Math.sin(t+i)*6,y+Math.cos(t*.8+i)*6,1.6,0,TAU);g.fill();g.globalAlpha=1;}
    else if(fx==='mist'||fx==='wind'){g.fillStyle='rgba(255,255,255,.05)';g.beginPath();g.ellipse((x0+t*15)%W,y0,60,10,0,0,TAU);g.fill();}}
  if(fx==='storm'&&(t%6)<.1){g.fillStyle='rgba(255,255,255,.3)';g.fillRect(0,0,W,H);}
  return gy;
}
