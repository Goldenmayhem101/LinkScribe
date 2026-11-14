/* weapons: real art, a swing per weapon, a trail and a hit effect; 3 looks (Common / Glowing / Legendary) */
const TIERS=['Common','Glowing','Legendary'];
function metal(g,x0,y0,x1,y1,c){const gr=g.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,rgba(tone(c,-.45)));gr.addColorStop(.45,rgba(tone(c,.55)));gr.addColorStop(.55,rgba(c));gr.addColorStop(1,rgba(tone(c,-.3)));return gr;}
function wrapGrip(g,x,y0,y1,w,c){g.fillStyle=rgba(tone(c,-.2));g.fillRect(x-w/2,y1,w,y0-y1);g.strokeStyle=rgba(tone(c,-.6));g.lineWidth=1;for(let y=y1+2;y<y0;y+=3.2){g.beginPath();g.moveTo(x-w/2,y);g.lineTo(x+w/2,y+1.6);g.stroke();}}
function edgeGlow(g,tier,col,fn){if(tier<1)return;g.save();g.shadowColor=rgba(col);g.shadowBlur=tier===2?14:8;fn();g.restore();}
const GOLD=[255,205,90];
/* each art() draws with the grip at 0,0 and the weapon pointing up (-y) */
const MELEE=[
 {id:'staff',name:'Lantern Staff',desc:'Wide sweep of lantern light.',col:[255,190,110],
  art(g,tier,t){const wood=[150,100,60];
    g.fillStyle=metal(g,-2.5,0,2.5,0,wood);g.fillRect(-2.5,-56,5,66);
    g.strokeStyle='rgba(60,30,10,.4)';g.lineWidth=.8;for(let y=-50;y<8;y+=7){g.beginPath();g.moveTo(-2,y);g.quadraticCurveTo(0,y+3,2,y+1);g.stroke();}
    wrapGrip(g,0,6,-6,6,tier===2?GOLD:[120,70,50]);
    g.fillStyle=metal(g,-7,0,7,0,tier===2?GOLD:[190,150,90]);g.fillRect(-6,-60,12,4);g.fillRect(-6,-80,12,3);
    g.strokeStyle=rgba(tier===2?GOLD:[170,130,80]);g.lineWidth=1.6;for(const x of[-5.5,0,5.5]){g.beginPath();g.moveTo(x,-60);g.lineTo(x*.9,-78);g.stroke();}
    g.beginPath();g.moveTo(-3,-80);g.quadraticCurveTo(0,-90,3,-80);g.stroke();
    const fl=1+Math.sin(t*14)*.08;glowDot(g,0,-69,tier===2?30:tier===1?24:16,[255,190,100],.75);
    g.save();g.translate(0,-62);g.scale(fl,fl);flame(g,0,0,14,4.5,[255,140,50]);g.restore();},
  swing:{type:'arc',from:-160,to:55,dur:.3,trailW:22},hit:{fx:'ember',num:'2'}},
 {id:'sickle',name:'Moon Sickle',desc:'Crescent slash all around you.',col:[200,225,255],
  art(g,tier,t){wrapGrip(g,0,8,-14,5,tier===2?GOLD:[70,60,110]);
    g.fillStyle=metal(g,-4,-16,4,-16,tier===2?GOLD:[150,150,170]);g.fillRect(-4,-18,8,4);
    edgeGlow(g,tier,[180,220,255],()=>{const bl=tier===2?[255,240,200]:[215,230,250];
      g.fillStyle=metal(g,-10,-50,26,-20,bl);g.beginPath();g.moveTo(-2,-17);g.bezierCurveTo(-14,-36,0,-62,28,-60);g.bezierCurveTo(8,-52,-2,-38,6,-17);g.closePath();g.fill();});
    g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=1;g.beginPath();g.moveTo(-1,-20);g.bezierCurveTo(-10,-38,2,-58,26,-59.5);g.stroke();
    g.fillStyle=rgba(tier>0?[150,200,255]:[120,130,160]);g.beginPath();g.arc(2,-34,2.2,0,TAU);g.fill();},
  swing:{type:'arc',from:-210,to:110,dur:.32,trailW:26},hit:{fx:'moon',num:'2'}},
 {id:'lash',name:'Thorn Lash',desc:'Long vine whip that cracks at the tip.',col:[130,230,110],
  art(g,tier,t){wrapGrip(g,0,8,-14,5,tier===2?GOLD:[110,70,40]);g.fillStyle=rgba(tier===2?GOLD:[80,130,60]);g.beginPath();g.arc(0,-15,3.4,0,TAU);g.fill();
    g.strokeStyle=rgba([70,140,60]);g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(0,-15);g.bezierCurveTo(14,-30,-14,-44,6,-58);g.stroke();
    for(let i=1;i<6;i++){const k=i/6;const x=(1-k)*(1-k)*(1-k)*0+3*(1-k)*(1-k)*k*14+3*(1-k)*k*k*-14+k*k*k*6,y=-15-43*k;g.fillStyle='#d8f0a0';g.beginPath();g.moveTo(x-2,y);g.lineTo(x+4,y-2);g.lineTo(x-1,y+2);g.fill();}},
  swing:{type:'whip',dur:.42},hit:{fx:'crack',num:'2'}},
 {id:'rapier',name:'Crystal Rapier',desc:'Lightning-fast stabs.',col:[140,230,255],
  art(g,tier,t){wrapGrip(g,0,10,-4,4.5,[60,50,90]);g.fillStyle=rgba(tier===2?GOLD:[200,200,220]);g.beginPath();g.arc(0,12,3,0,TAU);g.fill();
    g.fillStyle=metal(g,-9,-6,9,-6,tier===2?GOLD:[190,190,210]);g.beginPath();g.ellipse(0,-6,9,3.4,0,0,TAU);g.fill();g.fillRect(-13,-7,26,2);
    edgeGlow(g,tier,[120,230,255],()=>{const gr=g.createLinearGradient(-2,0,2,0);gr.addColorStop(0,'rgba(120,200,255,.9)');gr.addColorStop(.5,'#f2fdff');gr.addColorStop(1,'rgba(90,170,240,.9)');g.fillStyle=gr;g.beginPath();g.moveTo(-2.6,-9);g.lineTo(-1.2,-76);g.lineTo(0,-84);g.lineTo(1.2,-76);g.lineTo(2.6,-9);g.closePath();g.fill();});
    g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=.7;g.beginPath();g.moveTo(0,-10);g.lineTo(0,-80);g.stroke();
    if(tier>0){for(let i=0;i<3;i++){const y=-20-((t*60+i*22)%60);g.fillStyle='rgba(220,250,255,.8)';g.beginPath();g.arc(Math.sin(i+t)*1.2,y,1,0,TAU);g.fill();}}},
  swing:{type:'thrust',dur:.12},hit:{fx:'pierce',num:'1'}},
 {id:'hammer',name:'Ember Hammer',desc:'Slow crushing slam with a shockwave.',col:[255,130,60],
  art(g,tier,t){g.fillStyle=metal(g,-2.5,0,2.5,0,[120,80,50]);g.fillRect(-2.5,-50,5,60);wrapGrip(g,0,8,-8,6,tier===2?GOLD:[80,40,30]);
    const hc=[90,80,90];g.fillStyle=metal(g,-18,-62,18,-46,hc);g.beginPath();g.roundRect(-18,-66,36,22,4);g.fill();
    g.fillStyle=metal(g,-20,-60,20,-60,tier===2?GOLD:[150,140,150]);g.fillRect(-20,-68,4,26);g.fillRect(16,-68,4,26);
    const pulse=.6+Math.sin(t*5)*.3;g.save();g.shadowColor='#ff6a20';g.shadowBlur=tier>0?12:6;g.strokeStyle=`rgba(255,${tier===2?200:120},40,${pulse})`;g.lineWidth=1.8;g.beginPath();g.moveTo(-12,-64);g.lineTo(-6,-56);g.lineTo(-9,-48);g.moveTo(4,-66);g.lineTo(8,-58);g.lineTo(3,-52);g.lineTo(9,-46);g.stroke();g.restore();
    g.fillStyle=rgba(tier===2?GOLD:[200,190,200]);g.beginPath();g.arc(0,-55,3,0,TAU);g.fill();},
  swing:{type:'slam',dur:.55},hit:{fx:'quake',num:'5'}},
 {id:'scythe',name:'Void Scythe',desc:'Huge spinning reap. The ultimate blade.',col:[190,120,255],
  art(g,tier,t){g.fillStyle=metal(g,-2,0,2,0,[60,40,80]);g.fillRect(-2,-74,4,86);wrapGrip(g,0,10,-2,5,tier===2?GOLD:[100,60,140]);wrapGrip(g,0,-30,-40,5,tier===2?GOLD:[100,60,140]);
    g.fillStyle=metal(g,-5,-76,5,-76,tier===2?GOLD:[120,90,160]);g.beginPath();g.arc(0,-76,5,0,TAU);g.fill();
    edgeGlow(g,tier+1,[170,100,255],()=>{const gr=g.createLinearGradient(0,-90,40,-60);gr.addColorStop(0,'#2a1650');gr.addColorStop(.6,'#6a3fb0');gr.addColorStop(1,'#d8b8ff');g.fillStyle=gr;
      g.beginPath();g.moveTo(-2,-80);g.bezierCurveTo(20,-98,48,-86,58,-58);g.bezierCurveTo(44,-74,22,-78,2,-70);g.closePath();g.fill();});
    g.strokeStyle='rgba(235,210,255,.9)';g.lineWidth=1.2;g.beginPath();g.moveTo(2,-82);g.bezierCurveTo(22,-96,46,-84,57,-59);g.stroke();
    for(let i=0;i<(tier+1)*2;i++){const a=t*2+i*1.3;g.fillStyle='rgba(220,190,255,.9)';g.beginPath();g.arc(28+Math.cos(a)*16,-80+Math.sin(a)*8,1.1,0,TAU);g.fill();}},
  swing:{type:'spin',from:-200,to:260,dur:.5,trailW:30},hit:{fx:'void',num:'4'}},
];
const RANGED=[
 {id:'spark',name:'Spark Bolt',desc:'Quick bolts of lantern light.',col:[140,255,235],kind:'bolt'},
 {id:'seeker',name:'Seeker Wisps',desc:'Wisps that curve into their target.',col:[190,160,255],kind:'wisps'},
 {id:'shard',name:'Frost Shards',desc:'Three ice shards that slow monsters.',col:[180,230,255],kind:'shards'},
 {id:'lance',name:'Moon Lance',desc:'Instant beam through a whole line.',col:[230,240,255],kind:'beam'},
 {id:'scatter',name:'Ember Scatter',desc:'Five-shot burst, strong up close.',col:[255,150,80],kind:'scatter'},
 {id:'boomerang',name:'Leafwing',desc:'Spinning leaf blade that comes back.',col:[140,240,110],kind:'boomer'},
 {id:'thunder',name:'Storm Orb',desc:'Orb that chains lightning.',col:[255,240,120],kind:'orb'},
 {id:'cannon',name:'Star Mortar',desc:'Lobbed star that explodes.',col:[255,190,240],kind:'mortar'},
];
function tierCol(c,tier){return tier===2?mix(c,GOLD,.35):c;}

/* swing angle (degrees from straight up, + = forward) for a given time in the cycle */
const CYCLE=1.6;
function swingAngle(sw,ph){
  if(sw.type==='arc'||sw.type==='spin'){const w0=.25,s0=w0,s1=w0+sw.dur;if(ph<w0){return lerp(20,sw.from,ease.out(ph/w0));}if(ph<s1){return lerp(sw.from,sw.to,ease.inout((ph-s0)/sw.dur));}if(ph<s1+.35)return lerp(sw.to,20,ease.out((ph-s1)/.35));return 20;}
  if(sw.type==='slam'){if(ph<.5)return lerp(30,-150,ease.out(ph/.5));if(ph<.5+.16)return lerp(-150,95,Math.pow((ph-.5)/.16,2));if(ph<1.2)return 95;if(ph<1.5)return lerp(95,30,ease.out((ph-1.2)/.3));return 30;}
  return 60;
}
function hitTime(sw){if(sw.type==='slam')return .66;if(sw.type==='thrust')return .3;if(sw.type==='whip')return .55;return .25+sw.dur*.6;}

function meleeScene(w){return function(g,t,W,H){
  const tier=w._tier||0,ph=t%CYCLE,sw=w.swing,col=tierCol(w.col,tier);
  // shake on hammer impact
  let shx=0,shy=0;const ht=hitTime(sw),age=ph-ht;
  if(w.id==='hammer'&&age>0&&age<.3){const a=(1-age/.3)*5;shx=Math.sin(t*90)*a;shy=Math.cos(t*80)*a;}
  g.save();g.translate(shx,shy);
  sceneBg(g,W,H);ground(g,W,H,H-34);
  // dummy monster
  const dm=monOf('bruteTest');let fl=0;if(age>0&&age<.25)fl=Math.sin(age/.25*Math.PI)*8;
  const dx=W-92+fl,dy=H-34;drawMon(g,dm,dx,dy,1.05,t,{flip:false,lx:-1});
  if(age>0&&age<.25){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=(1-age/.25)*.5;glowDot(g,dx,dy-30,40,[255,255,255],.8);g.restore();}
  // hero + weapon
  const hx=92,hy=H-34,S=1.7;let thrustX=0,ang=swingAngle(sw,ph);
  if(sw.type==='thrust'){const p3=(ph%.42)/.42;const n=Math.floor(ph/.42);thrustX=n<3?Math.sin(Math.min(1,p3*2.2)*Math.PI)*34:0;ang=88;}
  const hand=drawHero(g,hx+thrustX*.3,hy,S,t,{scarf:[255,176,90],cloak:[244,246,255]});
  const gx=hand.x+thrustX,gy=hand.y;
  // trail: a slash ribbon between the blade's inner edge and its tip
  const WS=S*.8;
  if(sw.type==='arc'||sw.type==='spin'||sw.type==='slam'){const L1=(w.id==='scythe'?92:w.id==='hammer'?66:w.id==='sickle'?60:w.id==='staff'?84:70)*WS,L0=L1*(w.id==='hammer'?.72:.5);
    const outer=[],inner=[];for(let i=0;i<28;i++){const tt=ph-i*.008;if(tt<0)break;const a=swingAngle(sw,tt)*Math.PI/180;outer.push([gx+Math.sin(a)*L1,gy-Math.cos(a)*L1]);inner.push([gx+Math.sin(a)*L0,gy-Math.cos(a)*L0]);}
    const speed=outer.length>3?Math.hypot(outer[0][0]-outer[3][0],outer[0][1]-outer[3][1]):0;
    if(speed>8){g.save();g.globalCompositeOperation='lighter';
      for(let i=0;i<outer.length-1;i++){const k=1-i/(outer.length-1);g.fillStyle=rgba(tone(col,.25),.55*k*k*(tier===2?1.2:1));g.beginPath();g.moveTo(outer[i][0],outer[i][1]);g.lineTo(outer[i+1][0],outer[i+1][1]);g.lineTo(inner[i+1][0],inner[i+1][1]);g.lineTo(inner[i][0],inner[i][1]);g.closePath();g.fill();}
      g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=2.4;g.lineCap='round';g.beginPath();outer.slice(0,14).forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();
      if(tier===2)for(let i=0;i<outer.length;i+=3){g.fillStyle='rgba(255,230,140,.9)';g.beginPath();g.arc(outer[i][0]+Math.sin(i*7+t*20)*4,outer[i][1]+Math.cos(i*5)*4,1.3,0,TAU);g.fill();}
      g.restore();}}
  if(sw.type==='thrust'&&thrustX>10){g.save();g.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const y=gy-6+i*3-6;g.strokeStyle=rgba(col,.6);g.lineWidth=1.5;g.beginPath();g.moveTo(gx+20+i*6,y);g.lineTo(gx+90+thrustX,y);g.stroke();}g.restore();}
  // weapon art
  g.save();g.translate(gx,gy);
  if(sw.type==='whip'){drawWhip(g,ph,tier,t,col,S);}
  else{g.rotate(ang*Math.PI/180);g.scale(WS,WS);w.art(g,tier,t);}
  g.restore();
  // legendary aura sparkles on the hero
  if(tier===2){for(let i=0;i<6;i++){const a=t*1.5+i;g.fillStyle='rgba(255,230,140,.9)';g.beginPath();g.arc(hx+Math.cos(a)*30,hy-40+Math.sin(a*1.3)*26,1.4,0,TAU);g.fill();}}
  // hit effects
  const fxAge=age;
  if(w.hit.fx==='ember')burst(g,dx-18,dy-36,fxAge,'#ffb050',16,60,3);
  if(w.hit.fx==='moon')burst(g,dx-18,dy-36,fxAge,'#dff0ff',14,70,4,'streak');
  if(w.hit.fx==='pierce'){for(let n=0;n<3;n++){const a2=ph-(.3+n*.42);burst(g,dx-20,dy-34+n*4,a2,'#bff4ff',8,40,5+n,'streak');popNum(g,dx,dy-62-n*4,w.hit.num,a2,'#bff4ff');}}
  if(w.hit.fx==='void'){burst(g,dx-14,dy-36,fxAge,'#c79bff',20,70,6);if(fxAge>0&&fxAge<.4){g.strokeStyle=`rgba(190,130,255,${1-fxAge/.4})`;g.lineWidth=3;g.beginPath();g.arc(dx,dy-32,10+fxAge*90,0,TAU);g.stroke();}}
  if(w.hit.fx==='crack'){if(fxAge>0&&fxAge<.3){const k=fxAge/.3;g.save();g.translate(dx-20,dy-40);g.rotate(k);g.fillStyle=`rgba(255,255,220,${1-k})`;g.beginPath();for(let i=0;i<10;i++){const r=i%2?6:18*(1-k*.3);g.lineTo(Math.cos(i/10*TAU)*r,Math.sin(i/10*TAU)*r);}g.fill();g.restore();
      g.font='900 15px Nunito,system-ui';g.fillStyle=`rgba(255,255,220,${1-k})`;g.textAlign='center';g.fillText('CRACK!',dx-24,dy-74-k*10);}burst(g,dx-18,dy-38,fxAge,'#c8ff9a',12,60,7);}
  if(w.hit.fx==='quake'){if(fxAge>0&&fxAge<.6){const k=fxAge/.6;for(const s of[-1,1]){g.strokeStyle=`rgba(255,160,80,${1-k})`;g.lineWidth=4*(1-k);g.beginPath();g.ellipse(gx+56,H-34,10+k*120,4+k*10,0,s<0?Math.PI:0,s<0?TAU:Math.PI);g.stroke();}
      const R=rng(9);for(let i=0;i<12;i++){const vx=(R()-.5)*160,vy=-60-R()*90;g.fillStyle=`rgba(120,100,120,${1-k})`;g.fillRect(gx+46+vx*k,H-38+vy*k+200*k*k,3,3);}
      g.fillStyle=`rgba(200,190,210,${.5*(1-k)})`;for(let i=0;i<6;i++){g.beginPath();g.arc(gx+46+(i-2.5)*16*k*2,H-38-k*10,8+k*12,0,TAU);g.fill();}}}
  if(w.hit.fx!=='pierce')popNum(g,dx,dy-62,w.hit.num,fxAge,w.hit.fx==='quake'?'#ffb070':'#fff');
  g.restore();
};}
/* the whip: a chain of segments that follow the handle with a delay -> real crack motion */
function drawWhip(g,ph,tier,t,col,S){
  const base=a=>{if(a<.25)return lerp(-30,-150,ease.out(a/.25));if(a<.55)return lerp(-150,95,ease.inout((a-.25)/.3));if(a<.95)return lerp(95,20,ease.out((a-.55)/.4));return 20;};
  const N=18,seg=7.8*S;let x=0,y=0;const pts=[[0,0]];
  for(let i=0;i<N;i++){const a=base(Math.max(0,ph-i*.018))*Math.PI/180;x+=Math.sin(a)*seg*(1-i*.02);y-=Math.cos(a)*seg*(1-i*.02);pts.push([x,y]);}
  g.save();g.rotate(base(ph)*Math.PI/180);g.scale(S*.8,S*.8);wrapGrip(g,0,8,-14,5,tier===2?GOLD:[110,70,40]);g.restore();
  g.lineCap='round';g.lineJoin='round';
  if(tier>0){g.save();g.shadowColor=rgba(col);g.shadowBlur=tier===2?12:7;}
  for(let i=0;i<N;i++){g.strokeStyle=rgba(mix([60,120,50],[120,200,90],i/N));g.lineWidth=4.2*(1-i/N)+1.2;g.beginPath();g.moveTo(pts[i][0],pts[i][1]);g.lineTo(pts[i+1][0],pts[i+1][1]);g.stroke();}
  if(tier>0)g.restore();
  for(let i=2;i<N;i+=2){const p=pts[i],q=pts[i+1],a=Math.atan2(q[1]-p[1],q[0]-p[0]);g.fillStyle=tier===2?'#ffe08a':'#d8f0a0';g.beginPath();g.moveTo(p[0]+Math.cos(a+1.6)*4,p[1]+Math.sin(a+1.6)*4);g.lineTo(p[0]+Math.cos(a)*3,p[1]+Math.sin(a)*3);g.lineTo(p[0]+Math.cos(a+1.6)*1,p[1]+Math.sin(a+1.6)*1);g.fill();}
  const tip=pts[N];leafShape(g,tip[0],tip[1],9,4,Math.atan2(tip[1]-pts[N-1][1],tip[0]-pts[N-1][0])+Math.PI/2,[120,220,90]);
}

function rangedScene(w){return function(g,t,W,H){
  const tier=w._tier||0,col=tierCol(w.col,tier),P2=1.4,ph=t%P2;
  sceneBg(g,W,H);ground(g,W,H,H-34);
  const dm=monOf('bruteTest'),dx=W-92,dy=H-34;
  const hx=80,hy=H-34;const hand=drawHero(g,hx,hy,1.7,t,{});
  const sx=hand.x+8,sy=hand.y-6,tx=dx-6,ty=dy-34;
  // charm in hand
  glowDot(g,hand.x+4,hand.y-2,10+tier*3,col,.8);g.fillStyle='#fff';g.beginPath();g.arc(hand.x+4,hand.y-2,2.4,0,TAU);g.fill();
  let hitAt=.5,fl=0;const sz=(1+tier*.25)*1.8;
  if(ph<.12){glowDot(g,sx,sy,30*(1-ph/.12)+10,col,.9);}
  g.save();g.globalCompositeOperation='lighter';
  if(w.kind==='bolt'||w.kind==='scatter'||w.kind==='shards'){const n=w.kind==='scatter'?5:w.kind==='shards'?3:1;hitAt=w.kind==='scatter'?.32:.45;
    for(let i=0;i<n;i++){const sp=(i-(n-1)/2)*(w.kind==='scatter'?.12:.08);const k=clamp(ph/hitAt,0,1);if(ph>hitAt)continue;const x=lerp(sx,tx,k),y=lerp(sy,ty,k)+sp*(tx-sx)*k;
      for(let j=0;j<6;j++){const kk=Math.max(0,k-j*.03);glowDot(g,lerp(sx,tx,kk),lerp(sy,ty,kk)+sp*(tx-sx)*kk,(7-j)*sz,col,.5);}
      if(w.kind==='shards'){g.globalCompositeOperation='source-over';g.save();g.translate(x,y);g.rotate(Math.atan2(sp*(tx-sx),tx-sx));crystal(g,0,0,14*sz,4*sz,Math.PI/2,[200,240,255]);g.restore();g.globalCompositeOperation='lighter';}
      else{g.fillStyle='#fff';g.beginPath();g.arc(x,y,2.2*sz,0,TAU);g.fill();if(w.kind==='scatter'){g.globalCompositeOperation='source-over';flame(g,x-6,y+2,10,3.5,[255,120,40]);g.globalCompositeOperation='lighter';}}}}
  if(w.kind==='wisps'){hitAt=.7;for(let i=0;i<3;i++){const k=clamp((ph-i*.07)/hitAt,0,1);if(ph-i*.07>hitAt||k<=0)continue;const cy2=sy-60+i*50;
      let hx2=0,hy2=0;for(let j=6;j>=0;j--){const kk=Math.max(0,k-j*.035),x=(1-kk)*(1-kk)*sx+2*(1-kk)*kk*((sx+tx)/2)+kk*kk*tx,y=(1-kk)*(1-kk)*sy+2*(1-kk)*kk*cy2+kk*kk*ty;glowDot(g,x,y,(8-j)*sz,col,.45);hx2=x;hy2=y;}
      g.globalCompositeOperation='source-over';g.fillStyle='rgba(240,230,255,.95)';g.beginPath();g.arc(hx2,hy2,4.5*sz/1.8,0,TAU);g.fill();g.fillStyle='#2a1650';g.beginPath();g.arc(hx2-1.4,hy2-.6,.9*sz/1.8+.4,0,TAU);g.arc(hx2+1.6,hy2-.6,.9*sz/1.8+.4,0,TAU);g.fill();g.globalCompositeOperation='lighter';}}
  if(w.kind==='beam'){hitAt=.25;if(ph>.2&&ph<.55){const a=1-(ph-.2)/.35;const wid=(10+tier*4)*a;const gr=g.createLinearGradient(0,sy-wid,0,sy+wid);gr.addColorStop(0,rgba(col,0));gr.addColorStop(.5,rgba([255,255,255],.95));gr.addColorStop(1,rgba(col,0));g.fillStyle=gr;g.fillRect(sx,ty-wid,W-sx,wid*2);glowDot(g,sx,ty,22*a+8,col,.8);}}
  if(w.kind==='boomer'){hitAt=.4;const k=ph/1.1;if(k<1){const x=sx+Math.sin(k*Math.PI)*(tx-sx),y=sy-Math.sin(k*TAU)*24;g.globalCompositeOperation='source-over';g.save();g.translate(x,y);g.rotate(t*18);for(let b=0;b<3;b++){g.rotate(TAU/3);leafShape(g,0,0,15*sz,6*sz,0,tier===2?[200,240,120]:[120,220,90]);}g.restore();g.globalCompositeOperation='lighter';glowDot(g,x,y,18*sz,col,.3);}}
  if(w.kind==='orb'){hitAt=.75;const k=clamp(ph/hitAt,0,1);const x=lerp(sx,tx,k),y=sy+Math.sin(t*12)*2;if(ph<hitAt){glowDot(g,x,y,16*sz,col,.8);g.strokeStyle='rgba(255,255,220,.9)';g.lineWidth=1.2;for(let i=0;i<3;i++){g.beginPath();g.moveTo(x,y);let px=x,py=y;for(let s=0;s<4;s++){px+=Math.cos(t*30+i*2+s)*6;py+=Math.sin(t*25+i+s)*6;g.lineTo(px,py);}g.stroke();}}
    else if(ph<hitAt+.4){g.strokeStyle='rgba(255,250,180,.95)';g.lineWidth=2;const R=rng(Math.floor(t*20));g.beginPath();g.moveTo(tx,ty);let px=tx,py=ty;for(let s=1;s<=6;s++){const q=s/6;px=lerp(tx,tx+70,q)+(R()-.5)*14;py=lerp(ty,ty-60,q)+(R()-.5)*14;g.lineTo(px,py);}g.stroke();glowDot(g,tx+70,ty-60,14,col,.8);}}
  if(w.kind==='mortar'){hitAt=.8;const k=clamp(ph/hitAt,0,1);if(ph<hitAt){const x=lerp(sx,tx,k),y=lerp(sy,ty,k)-Math.sin(k*Math.PI)*90;glowDot(g,x,y,14*sz,col,.7);g.fillStyle='#fff';g.save();g.translate(x,y);g.rotate(t*6);g.beginPath();for(let i=0;i<10;i++){const r=i%2?3:7*sz;g.lineTo(Math.cos(i/10*TAU)*r,Math.sin(i/10*TAU)*r);}g.fill();g.restore();}
    else if(ph<hitAt+.5){const a=(ph-hitAt)/.5;glowDot(g,tx,ty,30+a*50,col,.8*(1-a));for(let i=0;i<10;i++){const an=i/10*TAU;g.fillStyle=`rgba(255,240,250,${1-a})`;g.beginPath();g.arc(tx+Math.cos(an)*a*60,ty+Math.sin(an)*a*40,2.4,0,TAU);g.fill();}}}
  g.restore();
  const age=ph-hitAt;if(age>0&&age<.25)fl=Math.sin(age/.25*Math.PI)*6;
  g.save();g.translate(fl,0);drawMon(g,dm,dx,dy,1.05,t,{lx:-1});g.restore();
  if(w.kind==='shards'&&age>0&&age<1){g.fillStyle=`rgba(170,220,255,${.35*(1-age)})`;g.beginPath();g.arc(dx,dy-28,30,0,TAU);g.fill();}
  burst(g,tx,ty,age,rgba(tone(col,.3)),14,60,11);
  popNum(g,dx,dy-62,w.kind==='mortar'?'3':w.kind==='beam'?'2':'1',age,'#fff');
};}
function iconCanvas(w,melee){const c=document.createElement('canvas');sizeCanvas(c,84,84);c.className='wicon';
  addLoop(c,(g,t)=>{const tier=w._tier||0;const bg=g.createRadialGradient(42,42,4,42,42,44);bg.addColorStop(0,rgba(tierCol(w.col,tier),.35));bg.addColorStop(1,'rgba(20,16,44,0)');g.fillStyle=bg;g.fillRect(0,0,84,84);
    if(melee){g.save();g.translate(melee==='whip'?30:28,64);g.rotate(Math.PI/4);g.scale(.62,.62);if(w.id==='lash')w.art(g,tier,t);else w.art(g,tier,t);g.restore();}
    else{g.save();g.globalCompositeOperation='lighter';glowDot(g,42,42,26+tier*4,tierCol(w.col,tier),.8);g.restore();g.fillStyle='#fff';g.beginPath();g.arc(42,42,5,0,TAU);g.fill();}});
  return c;}
