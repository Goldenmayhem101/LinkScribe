/* new monsters: same painted-fur style as the game's brute/spike/cyclops, built from parts */
const C={moss:P.moss,dusk:P.dusk,ember:P.ember,moon:P.moon,ink:P.ink,
  teal:[48,150,140],plum:[120,70,150],rust:[200,90,60],coral:[240,120,100],sky:[110,170,230],ice:[170,220,250],snow:[235,245,255],
  lava:[255,110,40],ash:[110,100,120],leaf:[90,170,80],bark:[120,80,50],rose:[230,90,140],void:[70,40,120],star:[200,170,255],gold:[255,205,90],cyan:[90,230,230],pink:[255,140,200]};
function crystal(g,x,y,len,w,ang,col){g.save();g.translate(x,y);g.rotate(ang);
  const gr=g.createLinearGradient(-w,0,w,0);gr.addColorStop(0,rgba(tone(col,-.35)));gr.addColorStop(.5,rgba(tone(col,.45)));gr.addColorStop(1,rgba(col));
  g.fillStyle=gr;g.beginPath();g.moveTo(-w,0);g.lineTo(-w*.8,-len*.75);g.lineTo(0,-len);g.lineTo(w*.8,-len*.75);g.lineTo(w,0);g.closePath();g.fill();
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1;g.beginPath();g.moveTo(0,-len);g.lineTo(-w*.15,0);g.stroke();g.restore();}
function flame(g,x,y,h,w,col){const gr=g.createLinearGradient(0,y,0,y-h);gr.addColorStop(0,rgba(col));gr.addColorStop(.6,rgba(mix(col,[255,230,120],.6)));gr.addColorStop(1,'rgba(255,250,210,.9)');
  g.fillStyle=gr;g.beginPath();g.moveTo(x-w,y);g.quadraticCurveTo(x-w*1.1,y-h*.5,x-w*.2,y-h*.6);g.quadraticCurveTo(x-w*.5,y-h*.85,x,y-h);g.quadraticCurveTo(x+w*.3,y-h*.7,x+w*.4,y-h*.8);g.quadraticCurveTo(x+w*1.2,y-h*.4,x+w,y);g.closePath();g.fill();}
function leafShape(g,x,y,len,w,ang,col){g.save();g.translate(x,y);g.rotate(ang);const gr=g.createLinearGradient(0,0,0,-len);gr.addColorStop(0,rgba(tone(col,-.3)));gr.addColorStop(1,rgba(tone(col,.25)));g.fillStyle=gr;
  g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(w,-len*.5,0,-len);g.quadraticCurveTo(-w,-len*.5,0,0);g.fill();g.strokeStyle=rgba(tone(col,-.45),.6);g.lineWidth=.8;g.beginPath();g.moveTo(0,0);g.lineTo(0,-len*.9);g.stroke();g.restore();}
function spikesRow(g,cx,cy,rx,ry,n,lenA,col,from,to){for(let i=0;i<n;i++){const a=from+(i/(n-1))*(to-from),bx=cx+Math.cos(a)*rx*.82,by=cy+Math.sin(a)*ry*.82;const len=lenA*(.7+Math.sin(i/(n-1)*Math.PI)*.5);
  const sg=g.createLinearGradient(bx,by,bx+Math.cos(a)*len,by+Math.sin(a)*len);sg.addColorStop(0,rgba(tone(col,-.25)));sg.addColorStop(1,rgba(tone(col,.45)));
  g.fillStyle=sg;g.beginPath();g.moveTo(bx+Math.cos(a+1.6)*4.5,by+Math.sin(a+1.6)*4.5);g.lineTo(bx+Math.cos(a)*len,by+Math.sin(a)*len);g.lineTo(bx+Math.cos(a-1.6)*4.5,by+Math.sin(a-1.6)*4.5);g.fill();}}

function paintMonster(sp){
  const BOSS=!!sp.boss,W=140,H=140,l=layer(W,H,BOSS?4:2.4),g=l.g,R=rng(sp.seed||sp.id.length*977+3);
  const c=sp.body,cx=sp.cx||70,cy=sp.cy||80,rx=sp.rx||28,ry=sp.ry||26;const X=sp.x||{};
  // behind body
  if(X.tentacles){for(let i=0;i<5;i++){const bx=cx-rx*.7+i*rx*.35;g.strokeStyle=rgba(tone(c,-.2));g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(bx,cy+ry*.4);g.bezierCurveTo(bx-6,cy+ry+6,bx+8,cy+ry+12,bx+(i%2?6:-6),cy+ry+20);g.stroke();
    g.fillStyle=rgba(tone(X.tentacles,.2));for(let k=1;k<4;k++){g.beginPath();g.arc(bx+(i%2?k:-k),cy+ry+k*5,1.4,0,TAU);g.fill();}}}
  if(X.crystals)for(let i=0;i<5;i++){const a=-Math.PI*.82+i*.38;crystal(g,cx+Math.cos(a)*rx*.75,cy+Math.sin(a)*ry*.75,14+R()*12,5+R()*2,a+Math.PI/2,X.crystals);}
  if(X.thorns)spikesRow(g,cx,cy,rx,ry,9,14,X.thorns,-Math.PI*.95,-Math.PI*.05);
  if(X.spikes)spikesRow(g,cx,cy,rx,ry,X.spikes[0],X.spikes[1],X.spikes[2],-Math.PI*.95,-Math.PI*.05);
  if(X.petals)for(let i=0;i<10;i++){const a=i/10*TAU;g.save();g.translate(cx+Math.cos(a)*rx*.7,cy+Math.sin(a)*ry*.7);g.rotate(a+Math.PI/2);const pg=g.createLinearGradient(0,0,0,-24);pg.addColorStop(0,rgba(tone(X.petals,-.25)));pg.addColorStop(1,rgba(tone(X.petals,.35)));g.fillStyle=pg;g.beginPath();g.ellipse(0,-14,9,15,0,0,TAU);g.fill();g.restore();}
  if(X.leafcrown)for(let i=0;i<7;i++){const a=-Math.PI*.85+i*.28;leafShape(g,cx+Math.cos(a)*rx*.7,cy+Math.sin(a)*ry*.7,16+R()*8,7,a+Math.PI/2,X.leafcrown);}
  if(X.antlers)for(const k of[-1,1]){g.strokeStyle=rgba(X.antlers);g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(cx+k*rx*.4,cy-ry*.8);g.lineTo(cx+k*rx*.8,cy-ry*1.6);g.moveTo(cx+k*rx*.62,cy-ry*1.25);g.lineTo(cx+k*rx*1.05,cy-ry*1.3);g.moveTo(cx+k*rx*.72,cy-ry*1.45);g.lineTo(cx+k*rx*.5,cy-ry*1.8);g.stroke();}
  if(sp.arms)for(const k of[-1,1])limb(g,cx+k*(rx+2),cy+6,sp.arms,sp.arms*1.5,tone(c,k<0?-.15:-.05),R,k*-.5);
  if(sp.horns)for(const k of[-1,1])horn(g,cx+k*rx*.55,cy-ry*.72,k,sp.horns[0],sp.horns[1],sp.horns[2]);
  // body
  let path;
  if(X.smoke){g.save();g.globalAlpha=.9;}
  path=furShape(cx,cy,rx,ry,R,96,sp.fur||3.4);furFill(g,path,cx,cy,rx,ry,c,R);
  if(X.smoke){g.restore();for(let i=0;i<4;i++){const bx=cx-rx*.6+i*rx*.4;const sg=g.createLinearGradient(0,cy+ry*.5,0,cy+ry+22);sg.addColorStop(0,rgba(c,.85));sg.addColorStop(1,rgba(c,0));g.fillStyle=sg;g.beginPath();g.moveTo(bx-9,cy+ry*.5);g.quadraticCurveTo(bx,cy+ry+26,bx+9,cy+ry*.5);g.fill();}}
  // belly
  if(sp.belly){const bp=furShape(cx+2,cy+ry*.45,rx*.55,ry*.42,R,50,2);g.save();path(g);g.clip();furFill(g,bp,cx+2,cy+ry*.45,rx*.55,ry*.42,sp.belly,R,.35);g.restore();}
  // on-body details
  g.save();path(g);g.clip();
  if(X.lava){g.strokeStyle=rgba(C.lava,.95);g.lineWidth=2;g.shadowColor=rgba(C.lava);g.shadowBlur=8;for(let i=0;i<6;i++){let x=cx+(R()-.5)*rx*1.6,y=cy+(R()-.5)*ry*1.4;g.beginPath();g.moveTo(x,y);for(let k=0;k<4;k++){x+=(R()-.5)*12;y+=(R()-.3)*8;g.lineTo(x,y);}g.stroke();}g.shadowBlur=0;}
  if(X.stars)for(let i=0;i<22;i++){const x=cx+(R()-.5)*rx*1.8,y=cy+(R()-.5)*ry*1.8;g.fillStyle=rgba(C.star,.5+R()*.5);g.beginPath();g.arc(x,y,.6+R()*1.4,0,TAU);g.fill();}
  if(X.shell){for(let i=0;i<3;i++){const sx=cx-rx*.55+i*rx*.55,sy=cy-ry*.45;const sg=g.createLinearGradient(sx,sy-10,sx,sy+10);sg.addColorStop(0,rgba(tone(X.shell,.45)));sg.addColorStop(1,rgba(tone(X.shell,-.35)));g.fillStyle=sg;g.beginPath();g.moveTo(sx-11,sy+6);g.lineTo(sx-7,sy-9);g.lineTo(sx+7,sy-9);g.lineTo(sx+11,sy+6);g.lineTo(sx,sy+11);g.closePath();g.fill();g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=1;g.stroke();}}
  if(X.vines){g.strokeStyle=rgba(C.leaf);g.lineWidth=2.5;g.beginPath();g.moveTo(cx-rx,cy+ry*.2);g.bezierCurveTo(cx-rx*.3,cy-ry*.3,cx+rx*.3,cy+ry*.6,cx+rx,cy);g.stroke();for(let i=0;i<5;i++)leafShape(g,cx-rx*.8+i*rx*.4,cy+ry*.1+Math.sin(i)*6,8,4,(i%2?.8:-.8),C.leaf);}
  g.restore();
  if(X.snowcap){const sg=g.createLinearGradient(0,cy-ry-6,0,cy-ry*.3);sg.addColorStop(0,'#ffffff');sg.addColorStop(1,'#cfe6f7');g.fillStyle=sg;g.beginPath();g.moveTo(cx-rx*.95,cy-ry*.35);for(let i=0;i<=10;i++){const a=Math.PI+i/10*Math.PI;g.lineTo(cx+Math.cos(a)*rx*1.02,cy-ry*.25+Math.sin(a)*ry*.98+(i%2?3:0));}g.closePath();g.fill();}
  if(X.icicles)for(let i=0;i<6;i++){const x=cx-rx*.7+i*rx*.28,y=cy+ry*.55+Math.sin(i/5*Math.PI)*ry*.3;const ig=g.createLinearGradient(0,y,0,y+12);ig.addColorStop(0,'#eaf8ff');ig.addColorStop(1,'rgba(160,220,255,.6)');g.fillStyle=ig;g.beginPath();g.moveTo(x-3,y);g.lineTo(x,y+8+(i%3)*4);g.lineTo(x+3,y);g.fill();}
  if(sp.mouth)mouth(g,cx+(sp.mouth.dx||2),cy+(sp.mouth.dy||0),sp.mouth.w,sp.mouth.h,R,sp.mouth.f!==false);
  if(X.tusks)for(const k of[-1,1]){g.fillStyle='#fff3dc';g.beginPath();g.moveTo(cx+k*9,cy+(sp.mouth?sp.mouth.dy:0)+2);g.quadraticCurveTo(cx+k*16,cy+(sp.mouth?sp.mouth.dy:0)-6,cx+k*13,cy+(sp.mouth?sp.mouth.dy:0)-14);g.quadraticCurveTo(cx+k*12,cy+(sp.mouth?sp.mouth.dy:0)-4,cx+k*6,cy+(sp.mouth?sp.mouth.dy:0)+3);g.fill();}
  if(sp.feet)for(const k of[-1,1]){g.fillStyle=rgba(tone(c,-.5));g.beginPath();g.ellipse(cx+k*rx*.45,cy+ry+2,rx*.32,6,0,0,TAU);g.fill();g.fillStyle=rgba(tone(c,-.2));g.beginPath();g.ellipse(cx+k*rx*.45+1,cy+ry,rx*.26,4.5,0,0,TAU);g.fill();
    for(let t2=-1;t2<=1;t2++){g.fillStyle=rgba(tone(P.moon,.3));g.beginPath();g.moveTo(cx+k*rx*.45+t2*5-1.4,cy+ry+3);g.lineTo(cx+k*rx*.45+t2*5+1.4,cy+ry+3);g.lineTo(cx+k*rx*.45+t2*5.5,cy+ry+6.5);g.fill();}}
  // on top of head
  if(X.cap){const cg=g.createRadialGradient(cx-6,cy-ry-10,2,cx,cy-ry-4,rx);cg.addColorStop(0,rgba(tone(X.cap,.35)));cg.addColorStop(1,rgba(tone(X.cap,-.35)));g.fillStyle=cg;g.beginPath();g.ellipse(cx,cy-ry*.75,rx*.95,ry*.5,0,Math.PI,TAU);g.quadraticCurveTo(cx,cy-ry*.55,cx-rx*.95,cy-ry*.75);g.fill();
    g.fillStyle='rgba(255,245,230,.9)';for(const[dx,dy,r]of[[-12,-8,4],[6,-12,3],[16,-5,2.5],[-2,-3,2]]){g.beginPath();g.arc(cx+dx,cy-ry*.75+dy,r,0,TAU);g.fill();}}
  if(X.flame){flame(g,cx,cy-ry*.6,30,13,X.flame);}
  if(X.lure){g.strokeStyle=rgba(tone(c,-.3));g.lineWidth=2;g.beginPath();g.moveTo(cx+4,cy-ry*.85);g.quadraticCurveTo(cx+18,cy-ry*1.6,cx+26,cy-ry*1.3);g.stroke();}
  if(sp.crown){g.fillStyle='#ffd35c';g.strokeStyle='#a86b00';g.lineWidth=1.2;g.beginPath();const y0=cy-ry*.9;g.moveTo(cx-14,y0);g.lineTo(cx-16,y0-14);g.lineTo(cx-7,y0-7);g.lineTo(cx,y0-18);g.lineTo(cx+7,y0-7);g.lineTo(cx+16,y0-14);g.lineTo(cx+14,y0);g.closePath();g.fill();g.stroke();g.fillStyle='#ff4a7a';g.beginPath();g.arc(cx,y0-6,2.4,0,TAU);g.fill();}
  return {l,sp,ox:cx,oy:cy+ry+6,eyes:sp.eyes,iris:sp.iris||P.ember,fly:!!sp.fly,rx,ry};
}

/* draw a painted monster at x,y (feet), scale k, with idle motion, eyes, glows and an optional attack warning */
function drawMon(g,m,x,y,k,t,o){o=o||{};const sp=m.sp;const fly=m.fly;
  const bob=fly?Math.sin(t*3+(sp.seed||1))*5:-Math.abs(Math.sin(t*4))*3;const sq=fly?1:1+Math.sin(t*8)*.035;
  g.save();g.translate(x,y);
  g.fillStyle='rgba(10,8,30,.4)';g.beginPath();g.ellipse(0,fly?14:0,m.rx*k*1.05,5*k,0,0,TAU);g.fill();
  g.translate(0,bob+(fly?-26*k:0));
  if(o.warn){const w=(Math.sin(t*20)+1)/2;glowDot(g,0,-m.ry*k,m.rx*k*1.8,[255,60,60],.25+w*.25);}
  if(sp.boss){glowDot(g,0,-m.ry*k,m.rx*k*2.2,sp.aura||C.star,.18);}
  if(fly){const f=Math.sin(t*14);const wc=sp.wing||mix(P.dusk,P.moon,.25);for(const s of[-1,1]){g.save();g.scale(s,1);g.translate(m.rx*k*.7,-m.ry*k*.8);g.rotate(-.3+f*.5);g.scale(k,k);
    const wg=g.createLinearGradient(0,-20,30,10);wg.addColorStop(0,rgba(wc));wg.addColorStop(1,rgba(tone(wc,-.5)));g.fillStyle=wg;g.beginPath();g.moveTo(0,0);g.lineTo(10,-20);g.lineTo(34,-14);g.quadraticCurveTo(28,-6,30,2);g.quadraticCurveTo(22,-2,20,6);g.quadraticCurveTo(12,0,6,8);g.closePath();g.fill();g.restore();}}
  g.scale((o.flip?-1:1)*k/sq,k*sq);
  g.drawImage(m.l.c,-m.ox,-m.oy,140,140);
  g.translate(-m.ox,-m.oy);
  const cx0=sp.cx||70,cy0=sp.cy||80;
  if(sp.x&&sp.x.flame)glowDot(g,cx0,cy0-m.ry*.6-14,22,C.lava,.4+Math.sin(t*9)*.12);
  if(sp.x&&sp.x.lure){glowDot(g,cx0+26,cy0-m.ry*1.3,14,o.warn?[255,80,80]:[255,230,140],.75+Math.sin(t*4)*.2);g.fillStyle='#fff6c8';g.beginPath();g.arc(cx0+26,cy0-m.ry*1.3,3,0,TAU);g.fill();}
  if(sp.x&&sp.x.lava){g.globalAlpha=.25+Math.sin(t*3)*.15;g.drawImage(m.l.c,0,0,140,140);g.globalAlpha=1;}
  drawEyes(g,m.eyes,m.iris,t,o.lx==null?Math.sin(t*.9):o.lx,o.ly||0,sp.seed||0,o.warn);
  g.restore();
  if(o.warn){g.save();g.font='900 '+(20*k)+'px Nunito,system-ui';g.textAlign='center';g.fillStyle='#ff4a4a';g.strokeStyle='#fff';g.lineWidth=3;const yy=y-m.ry*2.6*k-(fly?26*k:0)+Math.sin(t*20)*2;g.strokeText('!',x,yy);g.fillText('!',x,yy);g.restore();}
}

const E=(x,y,r)=>({x,y,r});
const MON_SPECS=[
 {id:'bruteTest',body:mix(P.moss,P.moon,.06),rx:30,ry:27,cy:82,horns:[26,9,1.9],arms:8,feet:1,belly:mix(mix(P.moss,P.ember,.45),P.moon,.15),mouth:{w:34,h:13,dy:0},eyes:[E(59,68,7),E(81,67,7.5)],iris:P.ember},
 // Gloamwood
 {world:'Gloamwood',id:'mosslurk',name:'Mosslurk',beh:'Sits still, then puffs a cloud of spores that slows you.',warn:'Cap glows before the spore puff',body:[70,120,90],rx:28,ry:25,cy:84,x:{cap:[220,90,70]},feet:1,mouth:{w:26,h:9,dy:6,f:false},eyes:[E(60,76,6),E(79,76,6)],iris:[255,200,120],seed:11},
 {world:'Gloamwood',id:'lanternmoth',name:'Lantern Moth',beh:'Flies in loops. Its glowing lure hides a dive attack.',warn:'Lure flashes red, then it dives',body:[150,120,190],rx:20,ry:18,cy:74,fly:1,x:{lure:1},wing:[200,180,240],mouth:{w:16,h:6,dy:6,f:false},eyes:[E(63,68,6.5),E(78,68,6.5)],iris:[255,220,120],seed:12},
 {world:'Gloamwood',id:'bramblehog',name:'Bramble Hog',beh:'Charges across the ground. Stomping it hurts: jump over!',warn:'Paws the ground twice, then charges',body:[120,80,60],rx:32,ry:22,cy:88,x:{thorns:[110,160,90],tusks:1},feet:1,mouth:{w:22,h:8,dy:6},eyes:[E(76,78,5.5),E(90,78,5)],iris:[255,120,80],seed:13},
 // Crystal
 {world:'Crystal Caves',id:'gemshell',name:'Gemshell',beh:'Crystal back blocks shots from the front. Hit it from behind.',warn:'Shell shines when it turns',body:[90,90,150],rx:30,ry:24,cy:86,x:{crystals:[140,230,255],shell:[160,220,255]},feet:1,mouth:{w:24,h:9,dy:6},eyes:[E(60,80,6),E(80,80,6)],iris:C.cyan,seed:21},
 {world:'Crystal Caves',id:'prismbat',name:'Prism Bat',beh:'Splits into two small bats when hit.',warn:'Body flickers rainbow before splitting',body:[130,110,200],rx:18,ry:16,cy:72,fly:1,wing:[180,140,255],x:{crystals:[255,160,230]},mouth:{w:14,h:6,dy:5},eyes:[E(63,66,5.5),E(77,66,5.5)],iris:C.pink,seed:22},
 {world:'Crystal Caves',id:'shardling',name:'Shardling',beh:'Small and quick. Bursts into crystal shards when it dies.',warn:'Shakes and glows before bursting',body:[110,200,220],rx:18,ry:18,cy:96,x:{spikes:[7,10,[200,250,255]]},feet:1,mouth:{w:16,h:6,dy:5,f:false},eyes:[E(63,90,5),E(77,90,5)],iris:[60,80,160],seed:23},
 // Emberfen
 {world:'Emberfen',id:'cinderimp',name:'Cinder Imp',beh:'Throws arcing fireballs from a distance.',warn:'Flame on its head grows big before a throw',body:[200,80,60],rx:22,ry:22,cy:88,x:{flame:[255,140,40]},arms:6,feet:1,mouth:{w:20,h:8,dy:5},eyes:[E(62,80,6),E(78,80,6)],iris:[255,230,90],seed:31},
 {world:'Emberfen',id:'magmatoad',name:'Magma Toad',beh:'Leaps high and leaves burning puddles where it lands.',warn:'Squats low and cracks glow',body:[150,60,50],rx:32,ry:22,cy:90,x:{lava:1},feet:1,mouth:{w:40,h:9,dy:4,f:false},eyes:[E(55,70,7),E(86,70,7)],iris:[255,200,60],seed:32},
 {world:'Emberfen',id:'ashwraith',name:'Ash Wraith',beh:'Floats through walls and drifts toward you.',warn:'Goes see-through, then lunges',body:[120,110,130],rx:22,ry:24,cy:70,fly:1,wing:[90,80,100],x:{smoke:1},mouth:{w:16,h:10,dy:6,f:false},eyes:[E(62,64,6),E(78,64,6)],iris:[255,120,60],seed:33},
 // Frostveil
 {world:'Frostveil',id:'frostfang',name:'Frostfang',beh:'Slides fast on ice and bites. Fast but fragile.',warn:'Crouches and frost puffs from its nose',body:[150,190,230],rx:30,ry:24,cy:86,horns:[18,7,1.4],x:{icicles:1,snowcap:1},feet:1,mouth:{w:30,h:11,dy:2},eyes:[E(60,74,6),E(80,74,6)],iris:[80,140,255],seed:41},
 {world:'Frostveil',id:'snowpuff',name:'Snowpuff',beh:'Rolls into a snowball that grows as it rolls.',warn:'Curls up and spins in place',body:[230,240,255],rx:26,ry:25,cy:86,fur:4.2,feet:1,mouth:{w:18,h:7,dy:6,f:false},eyes:[E(62,78,6),E(79,78,6)],iris:[90,170,255],seed:42},
 {world:'Frostveil',id:'iciclewisp',name:'Icicle Wisp',beh:'Floats above you and drops icicles.',warn:'Icicles shake before they fall',body:[180,220,255],rx:20,ry:18,cy:72,fly:1,wing:[220,240,255],x:{icicles:1},mouth:{w:14,h:6,dy:4,f:false},eyes:[E(70,66,8)],iris:[60,120,220],seed:43},
 // Verdant
 {world:'Verdant',id:'thornback',name:'Thornback',beh:'Shoots three thorns in a fan.',warn:'Leaves on its head stand up',body:[80,140,70],rx:28,ry:24,cy:86,x:{leafcrown:[110,200,90],thorns:[160,120,70]},feet:1,mouth:{w:24,h:9,dy:5},eyes:[E(61,78,6),E(80,78,6)],iris:[255,210,90],seed:51},
 {world:'Verdant',id:'bloomjaw',name:'Bloomjaw',beh:'A flower that never moves but snaps when you come close.',warn:'Petals open wide before the snap',body:[90,160,80],rx:22,ry:22,cy:80,x:{petals:[255,120,170]},mouth:{w:28,h:12,dy:2},eyes:[E(62,70,5),E(78,70,5)],iris:[255,90,140],seed:52},
 {world:'Verdant',id:'vinecreeper',name:'Vine Creeper',beh:'Climbs walls and grabs you from above.',warn:'Vines wiggle on the ceiling',body:[60,110,70],rx:24,ry:22,cy:84,x:{vines:1,antlers:[150,110,70]},arms:7,feet:1,mouth:{w:20,h:8,dy:5},eyes:[E(62,76,5.5),E(78,76,5.5)],iris:[240,255,120],seed:53},
 // Voidreach
 {world:'Voidreach',id:'voidling',name:'Voidling',beh:'Blinks out and appears right behind you.',warn:'Purple ring forms where it will appear',body:[80,50,140],rx:24,ry:22,cy:76,x:{tentacles:[200,150,255],stars:1},mouth:{w:22,h:9,dy:4},eyes:[E(62,68,6.5),E(79,68,6.5)],iris:[190,120,255],seed:61},
 {world:'Voidreach',id:'starwatcher',name:'Starwatcher',beh:'Many eyes; fires a slow laser where it is looking.',warn:'All eyes turn red, then the laser',body:[60,40,110],rx:26,ry:24,cy:72,fly:1,wing:[110,80,190],x:{stars:1},mouth:{w:14,h:5,dy:12,f:false},eyes:[E(70,64,8),E(56,58,4.5),E(84,57,4.5),E(57,72,3.5),E(84,72,3.5)],iris:[255,90,120],seed:62},
 {world:'Voidreach',id:'gloommaw',name:'Gloom Maw',beh:'Huge mouth that pulls you in. Shoot it while it inhales.',warn:'Opens wide and sucks in air',body:[100,60,150],rx:32,ry:28,cy:84,horns:[20,8,1.6],x:{stars:1},feet:1,mouth:{w:44,h:18,dy:0},eyes:[E(56,66,5.5),E(84,66,5.5)],iris:[255,200,255],seed:63},
];
const BOSS_SPECS=[
 {world:'Gloamwood',id:'hollowhorn',name:'Elder Hollowhorn',beh:'Stomps to shake the ground, then charges. Summons Mosslurks.',body:[60,110,110],rx:34,ry:30,cy:84,horns:[34,11,1.9],arms:10,feet:1,belly:[160,170,120],x:{cap:[200,80,70]},mouth:{w:40,h:15,dy:2},eyes:[E(58,70,7.5),E(83,69,8)],iris:P.ember,crown:1,boss:1,aura:[120,255,200],seed:71},
 {world:'Crystal Caves',id:'prismgolem',name:'Prism Golem',beh:'Fires light beams that bounce off crystals. Hit its glowing core.',body:[90,100,170],rx:34,ry:30,cy:84,arms:11,feet:1,x:{crystals:[160,240,255],shell:[180,230,255]},mouth:{w:30,h:10,dy:6},eyes:[E(70,68,10)],iris:C.cyan,crown:1,boss:1,aura:[120,220,255],seed:72},
 {world:'Emberfen',id:'magmaking',name:'Magma King',beh:'Rains fireballs and floods the floor with lava. Stand on rocks.',body:[170,60,45],rx:34,ry:30,cy:84,horns:[30,10,1.6],arms:10,feet:1,x:{lava:1,flame:[255,130,40]},mouth:{w:40,h:14,dy:4},eyes:[E(57,68,7.5),E(83,68,7.5)],iris:[255,230,80],boss:1,aura:[255,120,40],seed:73},
 {world:'Frostveil',id:'frostmatriarch',name:'Frost Matriarch',beh:'Freezes the floor and calls snowstorms. Breaks into ice clones.',body:[160,200,240],rx:34,ry:30,cy:84,horns:[30,10,1.3],arms:10,feet:1,x:{snowcap:1,icicles:1},mouth:{w:36,h:12,dy:4},eyes:[E(58,70,7.5),E(82,70,7.5)],iris:[70,130,255],crown:1,boss:1,aura:[180,230,255],seed:74},
 {world:'Verdant',id:'thornqueen',name:'Thorn Queen',beh:'Grows thorn walls and shoots seed bombs. Burn her vines.',body:[70,140,80],rx:34,ry:30,cy:84,arms:10,feet:1,x:{petals:[255,110,170],leafcrown:[120,210,100],vines:1},mouth:{w:34,h:12,dy:5},eyes:[E(58,70,7),E(82,70,7)],iris:[255,90,150],crown:1,boss:1,aura:[150,255,120],seed:75},
 {world:'Voidreach',id:'voidtyrant',name:'Void Tyrant',beh:'Teleports, opens black holes and fires star beams. The final boss.',body:[70,40,130],rx:36,ry:31,cy:82,horns:[36,12,2.0],arms:11,x:{tentacles:[200,140,255],stars:1},mouth:{w:44,h:16,dy:2},eyes:[E(70,62,10),E(52,56,5),E(88,56,5)],iris:[255,80,140],crown:1,boss:1,aura:[170,110,255],seed:76},
];
const PAINTED={};function monOf(id){if(!PAINTED[id]){const s=MON_SPECS.concat(BOSS_SPECS).find(m=>m.id===id);PAINTED[id]=paintMonster(s);}return PAINTED[id];}
