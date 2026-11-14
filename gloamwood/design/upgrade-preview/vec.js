/* Monsters drawn like the hero: simple shapes, soft gradients, thin ink outline, side view facing left (toward the hero). */
const INK='#1c1430';
function lg(g,x0,y0,x1,y1,stops){const gr=g.createLinearGradient(x0,y0,x1,y1);stops.forEach((c,i)=>gr.addColorStop(i/(stops.length-1),c));return gr;}
function rg(g,x,y,r0,x1,y1,r1,stops){const gr=g.createRadialGradient(x,y,r0,x1,y1,r1);stops.forEach((c,i)=>gr.addColorStop(i/(stops.length-1),c));return gr;}
function fs(g,fill,lw){g.fillStyle=fill;g.fill();g.lineWidth=lw||2.2;g.strokeStyle=INK;g.lineJoin='round';g.stroke();}
/* eye: white, iris that follows the look direction, pupil, shine, blink lid */
function vEye(g,x,y,rx,ry,iris,look,blink,lid){
  g.save();g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);fs(g,rg(g,x-rx*.3,y-ry*.3,1,x,y,Math.max(rx,ry),['#ffffff','#eef2fb','#c9d2ea']),1.8);
  g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.clip();
  const ix=x+look.x*rx*.38,iy=y+look.y*ry*.28,ir=Math.min(rx,ry)*.62;
  g.beginPath();g.arc(ix,iy,ir,0,TAU);g.fillStyle=rg(g,ix-ir*.3,iy-ir*.3,1,ix,iy,ir,[iris[0],iris[1]]);g.fill();
  g.beginPath();g.arc(ix,iy,ir*.5,0,TAU);g.fillStyle=INK;g.fill();
  g.beginPath();g.arc(ix-ir*.38,iy-ir*.4,ir*.26,0,TAU);g.fillStyle='rgba(255,255,255,.95)';g.fill();
  g.beginPath();g.arc(ix+ir*.3,iy+ir*.35,ir*.1,0,TAU);g.fill();
  if(blink>0){const yy=y-ry+ry*2.1*blink;g.fillStyle=lid;g.fillRect(x-rx-2,y-ry-2,rx*2+4,yy-(y-ry)+2);g.strokeStyle=INK;g.lineWidth=1.8;g.beginPath();g.moveTo(x-rx,yy);g.quadraticCurveTo(x,yy+ry*.25,x+rx,yy);g.stroke();}
  g.restore();
  g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.lineWidth=1.8;g.strokeStyle=INK;g.stroke();
}
function vTooth(g,x,y,w,h,down){g.beginPath();g.moveTo(x-w/2,y);g.lineTo(x+w/2,y);g.lineTo(x,y+(down?h:-h));g.closePath();g.fillStyle='#fffaf0';g.fill();g.lineWidth=1;g.strokeStyle=INK;g.stroke();}

/* ---------------- Fuzzhorn ---------------- */
function drawFuzzhorn(g,x,y,s,t,P){P=P||{};const look=P.look||{x:-1,y:0},bl=P.blink||0,open=P.open==null?.5:P.open,sq=P.sq||1,lean=P.lean||0;
  g.save();g.translate(x,y);g.scale(s/sq,s*sq);
  g.fillStyle='rgba(10,8,30,.35)';g.beginPath();g.ellipse(0,1,40,5,0,0,TAU);g.fill();
  const step=P.step||0;
  // far foot
  g.beginPath();g.ellipse(14-step*3,-5,14,8,0,0,TAU);fs(g,lg(g,0,-12,0,0,['#2a6ab8','#17407a']));
  for(let i=0;i<3;i++)vClaw(g,6-step*3+i*7,-1);
  g.rotate(lean);
  // far horn (behind body)
  vHorn(g,24,-80,1,1.1);
  // body: fluffy round with soft tufts
  g.beginPath();const N=26;for(let i=0;i<=N;i++){const a=i/N*TAU,r=44+(i%2?0:5)+Math.sin(t*3+i)*.6,px=Math.cos(a)*r*1.06,py=-44+Math.sin(a)*r;
    if(i===0)g.moveTo(px,py);else{const am=(i-.5)/N*TAU,rm=44-2;g.quadraticCurveTo(Math.cos(am)*rm*1.06,-44+Math.sin(am)*rm,px,py);}}
  g.closePath();fs(g,rg(g,-18,-70,4,0,-44,56,['#8fe2ff','#3aa6ec','#2470c8','#1a4f9a']),2.4);
  // purple belly patches
  g.save();g.beginPath();g.ellipse(0,-44,46,46,0,0,TAU);g.clip();
  g.fillStyle='rgba(150,90,230,.55)';for(const[px,py,r]of[[26,-26,10],[32,-50,7],[14,-12,8],[38,-36,5]]){g.beginPath();g.ellipse(px,py,r,r*.8,.3,0,TAU);g.fill();}
  g.restore();
  // purple crest tufts on top
  for(let i=0;i<5;i++){const a=-2.05+i*.26,bx=Math.cos(a)*44*1.06,by=-44+Math.sin(a)*44,len=14+Math.sin(i*1.7)*4+Math.sin(t*4+i)*1.2;
    g.beginPath();g.moveTo(bx-6,by+3);g.quadraticCurveTo(bx+Math.cos(a)*len*.6-4,by+Math.sin(a)*len*.6-2,bx+Math.cos(a-.25)*len,by+Math.sin(a-.25)*len);g.quadraticCurveTo(bx+Math.cos(a)*len*.5+4,by+Math.sin(a)*len*.5,bx+6,by+3);g.closePath();
    fs(g,lg(g,bx,by,bx+Math.cos(a)*len,by+Math.sin(a)*len,['#9a6ae8','#d3a8ff']),1.8);}
  // near horn
  vHorn(g,-14,-82,-1,1.2);
  // near foot
  g.beginPath();g.ellipse(-16+step*3,-4,15,8.5,0,0,TAU);fs(g,lg(g,0,-12,0,0,['#3a86d6','#1d58a8']));
  for(let i=0;i<3;i++)vClaw(g,-26+step*3+i*7,0);
  // little arm
  g.beginPath();g.ellipse(-36,-16,8,6.5,-.3,0,TAU);fs(g,lg(g,-42,-22,-30,-10,['#3a8ee0','#1d58a8']),1.8);vClaw(g,-42,-13);vClaw(g,-38,-10);
  // face: near + far eye (3/4 view toward the left)
  vEye(g,-2,-60,9,10,['#7ad7ff','#1c6fc8'],look,bl,'#2c7ad0');
  vEye(g,-24,-58,11.5,12.5,['#7ad7ff','#1c6fc8'],look,bl,'#3a8ee0');
  // brows
  g.strokeStyle=INK;g.lineWidth=2.4;g.lineCap='round';g.beginPath();g.moveTo(-34,-74-open*2);g.quadraticCurveTo(-26,-78,-16,-73);g.moveTo(-9,-73);g.quadraticCurveTo(-3,-76,4,-71);g.stroke();
  // mouth
  const mh=8+open*14;
  g.beginPath();g.moveTo(-46,-42);g.quadraticCurveTo(-24,-34,2,-40);g.quadraticCurveTo(-10,-40+mh*1.5,-32,-42+mh);g.quadraticCurveTo(-44,-42+mh*.6,-46,-42);g.closePath();
  fs(g,lg(g,0,-38,0,-38+mh,['#3a0a26','#7a1840']),2);
  g.save();g.clip();g.beginPath();g.ellipse(-20,-40+mh*1.05,14,mh*.5,0,0,TAU);g.fillStyle='#ff7a9a';g.fill();g.restore();
  for(const tx of[-40,-31,-12,-3])vTooth(g,tx,-40.5,5.5,5.5+open*2,true);
  vTooth(g,-22,-38.5,5,5,true);
  g.restore();
}
function vHorn(g,x,y,dir,k){g.save();g.translate(x,y);g.scale(dir*k,k);
  g.beginPath();g.moveTo(-7,6);g.bezierCurveTo(-12,-10,-4,-26,12,-30);g.bezierCurveTo(4,-22,2,-10,7,4);g.closePath();
  fs(g,lg(g,-8,6,12,-30,['#c8861e','#ffd264','#fff0b0']),2);
  g.strokeStyle='rgba(140,80,10,.55)';g.lineWidth=1.2;for(let i=1;i<4;i++){g.beginPath();g.moveTo(-9+i*1.2,2-i*7);g.lineTo(5-i*.4,1-i*7.5);g.stroke();}g.restore();}
function vClaw(g,x,y){g.beginPath();g.ellipse(x,y,3.4,2.6,0,0,TAU);g.fillStyle='#ffd877';g.fill();g.lineWidth=1.2;g.strokeStyle=INK;g.stroke();}

/* ---------------- Emberwing ---------------- */
function drawEmberwing(g,x,y,s,t,P){P=P||{};const look=P.look||{x:-1,y:0},bl=P.blink||0,open=P.open==null?.35:P.open,flap=P.flap==null?Math.sin(t*5):P.flap,lean=P.lean||0,tail=Math.sin(t*2.2);
  g.save();g.translate(x,y);g.scale(s,s);
  g.fillStyle='rgba(10,8,30,.35)';g.beginPath();g.ellipse(4,1,36,5,0,0,TAU);g.fill();
  // tail: tapered, curls up, spade tip
  const pts=[];for(let i=0;i<=14;i++){const k=i/14;pts.push([18+k*40,-14-Math.sin(k*2.6)*16*k-k*k*(18+tail*6),9*(1-k)+2]);}
  g.beginPath();pts.forEach(([px,py,w],i)=>i?g.lineTo(px,py-w):g.moveTo(px,py-w));for(let i=pts.length-1;i>=0;i--){const[px,py,w]=pts[i];g.lineTo(px,py+w);}g.closePath();
  fs(g,lg(g,18,-20,58,-40,['#e8402e','#c82424']),2);
  const tp=pts[14];g.beginPath();g.moveTo(tp[0]-2,tp[1]+2);g.lineTo(tp[0]+6,tp[1]-10);g.lineTo(tp[0]+12,tp[1]+3);g.lineTo(tp[0]+4,tp[1]+1);g.closePath();fs(g,'#ff9a3a',1.8);
  g.rotate(lean);
  // far wing
  vWing(g,14,-50,flap,.8,'#c8552a','#ffb04a');
  // far legs
  g.beginPath();g.ellipse(18,-8,8,10,0,0,TAU);fs(g,lg(g,0,-18,0,0,['#c22c2a','#8e1a20']),2);
  // body
  g.beginPath();g.ellipse(6,-30,27,24,-.15,0,TAU);fs(g,rg(g,-6,-44,3,6,-30,32,['#ff8a62','#ee4630','#c02428']),2.4);
  // belly plate
  g.save();g.beginPath();g.ellipse(6,-30,27,24,-.15,0,TAU);g.clip();
  g.beginPath();g.ellipse(-6,-22,14,20,-.2,0,TAU);g.fillStyle=lg(g,-18,-40,0,-6,['#fff0c8','#ffcc8a']);g.fill();
  g.strokeStyle='rgba(180,100,40,.5)';g.lineWidth=1.3;for(let i=0;i<4;i++){g.beginPath();g.moveTo(-19,-34+i*8);g.quadraticCurveTo(-7,-31+i*8,4,-35+i*8);g.stroke();}
  g.restore();
  // back spines
  for(let i=0;i<5;i++){const bx=-4+i*9,by=-52+i*3.5+(i>2?(i-2)*2:0);g.beginPath();g.moveTo(bx-4,by+4);g.lineTo(bx+2,by-6-(i<2?2:0));g.lineTo(bx+6,by+5);g.closePath();fs(g,'#ff9a3a',1.6);}
  // front leg
  g.beginPath();g.ellipse(-10,-8,8,10,.1,0,TAU);fs(g,lg(g,0,-18,0,0,['#ee4630','#b02026']),2);
  for(let i=0;i<3;i++)vClaw(g,-17+i*6,-1);
  for(let i=0;i<2;i++)vClaw(g,13+i*6,-1);
  // neck + head
  g.beginPath();g.ellipse(-14,-50,11,14,.5,0,TAU);fs(g,lg(g,-20,-62,-8,-40,['#ff7a54','#d6352c']),2);
  const jaw=Math.max(0,open-.3)*12;
  // head
  // horns behind head
  for(const[hx,hy,k]of[[-10,-84,1.15],[-22,-88,1]]){g.save();g.translate(hx,hy);g.scale(k,k);g.beginPath();g.moveTo(-4,4);g.quadraticCurveTo(2,-10,16,-14);g.quadraticCurveTo(8,-4,5,6);g.closePath();fs(g,lg(g,-4,4,16,-14,['#c88a20','#ffe090']),1.8);g.restore();}
  g.beginPath();g.ellipse(-24,-70,21,19,0,0,TAU);fs(g,rg(g,-32,-82,2,-24,-70,24,['#ff9a70','#f0503a','#cc2c2c']),2.2);
  // short cute snout + mouth
  g.beginPath();g.ellipse(-40,-62,10,8,-.1,0,TAU);fs(g,lg(g,-48,-70,-34,-54,['#ff8a62','#e24030']),2);
  g.beginPath();g.ellipse(-45,-65,1.5,1.1,0,0,TAU);g.fillStyle=INK;g.fill();
  if(jaw>0){g.beginPath();g.moveTo(-46,-58);g.quadraticCurveTo(-34,-56+jaw,-22,-60);g.quadraticCurveTo(-34,-52+jaw*1.6,-46,-58);g.closePath();fs(g,'#4a0c22',1.8);for(let i=0;i<3;i++)vTooth(g,-42+i*7,-58.4,3.4,4,true);}
  else{g.strokeStyle=INK;g.lineWidth=2;g.lineCap='round';g.beginPath();g.moveTo(-47,-58);g.quadraticCurveTo(-36,-53,-24,-58);g.stroke();vTooth(g,-40,-56.5,3.2,3.6,true);vTooth(g,-30,-56.2,3.2,3.6,true);}
  // cheek blush
  g.fillStyle='rgba(255,170,150,.45)';g.beginPath();g.ellipse(-22,-58,6,3.5,0,0,TAU);g.fill();
  // horns (point back)
  // ear frill
  g.beginPath();g.moveTo(-6,-72);g.lineTo(10,-82);g.lineTo(4,-68);g.lineTo(12,-64);g.lineTo(-4,-60);g.closePath();fs(g,lg(g,-10,-70,6,-64,['#ff7a3a','#ffc060']),1.8);
  // eye + brow
  vEye(g,-12,-74,7,8,['#ffe066','#d68a10'],look,bl,'#e04436');
  vEye(g,-30,-73,10,11,['#ffe066','#d68a10'],look,bl,'#ee4a3a');
  g.strokeStyle=INK;g.lineWidth=2.2;g.lineCap='round';g.beginPath();g.moveTo(-40,-87);g.quadraticCurveTo(-31,-90,-22,-86);g.stroke();
  // near wing
  vWing(g,8,-48,flap,1,'#e2602e','#ffc25a');
  g.restore();
}
function vWing(g,x,y,flap,k,c0,c1){g.save();g.translate(x,y);g.scale(k,k);g.rotate(-.35-flap*.32);
  g.beginPath();g.moveTo(0,0);g.lineTo(10,-34);g.lineTo(42,-40);g.quadraticCurveTo(36,-28,40,-16);g.quadraticCurveTo(30,-18,26,-8);g.quadraticCurveTo(18,-10,14,0);g.closePath();
  fs(g,lg(g,0,0,40,-38,[c0,c1]),2);
  g.strokeStyle='rgba(120,30,20,.55)';g.lineWidth=1.4;g.beginPath();g.moveTo(10,-34);g.lineTo(40,-16);g.moveTo(10,-34);g.lineTo(26,-8);g.moveTo(10,-34);g.lineTo(14,0);g.stroke();
  g.beginPath();g.moveTo(0,0);g.lineTo(10,-34);g.lineTo(42,-40);g.strokeStyle=INK;g.lineWidth=3;g.stroke();
  g.restore();}

/* ---------------- little fight scene: idle, wind-up, attack, recover ---------------- */
function vecScene(kind){let hit=0,parts=[];const R=Math.random;
  return function(g,t,W,H){
    sceneBg(g,W,H,'#2b2358','#120e2c');
    g.fillStyle='rgba(60,110,110,.35)';for(let i=0;i<5;i++){g.beginPath();g.arc(30+i*80,H-60-(i%2)*16,38,0,TAU);g.fill();}
    ground(g,W,H,H-30);
    const gy=H-30,cyc=t%4.2,home=W-100,heroX=78;
    let mx=home,P={},lean=0,shake=0;
    // eyes follow hero, blink every few seconds
    const bt=t%3.3;P.blink=bt<.08?bt/.08:bt<.16?1-(bt-.08)/.08:0;
    const glance=(t%6)>4.6&&(t%6)<5.3;P.look=glance?{x:.6,y:-.6}:{x:-1,y:.25};
    if(kind==='fuzz'){
      P.step=Math.sin(t*6)*.6;P.sq=1+Math.sin(t*3)*.03;P.open=.45+Math.sin(t*2)*.08;
      if(cyc>1.8&&cyc<2.5){const p=(cyc-1.8)/.7;P.sq=1-.12*p;lean=.12*p;P.open=.25;mx=home+Math.sin(cyc*50)*1.5;}
      else if(cyc>=2.5&&cyc<2.85){const p=(cyc-2.5)/.35;mx=lerp(home,heroX+70,p*p);lean=-.14;P.open=1;P.step=Math.sin(t*30);if(R()<.6)parts.push({x:mx+30,y:gy-4,vx:60+R()*60,vy:-30-R()*40,a:0,c:'rgba(210,200,230,.7)',r:5});}
      else if(cyc>=2.85&&cyc<3.7){const p=(cyc-2.85)/.85;mx=lerp(heroX+70,home,1-Math.pow(1-p,3));lean=.1*(1-p);P.open=.6;}
      if(cyc>=2.85&&cyc<2.9&&hit<=0){hit=.45;shake=6;for(let i=0;i<14;i++){const a=R()*TAU;parts.push({x:heroX+10,y:gy-34,vx:Math.cos(a)*180,vy:Math.sin(a)*180,a:0,c:'#ffffff',r:2.5,sp:1});}}
      P.lean=lean;
    }else{
      P.flap=Math.sin(t*(cyc>1.8&&cyc<3.6?9:5));P.open=.25;
      if(cyc>1.8&&cyc<2.4){const p=(cyc-1.8)/.6;P.lean=.16*p;P.open=.15;}
      else if(cyc>=2.4&&cyc<3.5){P.lean=-.06;P.open=1;const sx=home-48*1.15,sy=gy-58*1.15;
        for(let i=0;i<3;i++){const a=Math.PI+(R()-.5)*.35,sp=220+R()*120;parts.push({x:sx,y:sy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-20,a:0,c:R()<.5?'rgba(255,190,70,1)':'rgba(255,100,40,1)',r:6+R()*5,glow:1,life:.5});}
        if(cyc>2.7&&hit<=0){hit=.45;shake=4;}}
      else if(cyc>=3.5&&cyc<4){P.lean=-.06*(1-(cyc-3.5)/.5);P.open=.4;}
    }
    hit=Math.max(0,hit-1/60);
    g.save();if(shake)g.translate((R()-.5)*shake,(R()-.5)*shake);
    drawHero(g,heroX-(hit>0?hit*20:0),gy,1.4,t,{});
    if(hit>0){g.save();g.globalCompositeOperation='lighter';glowDot(g,heroX,gy-34,34,[255,255,255],hit*1.4);g.restore();}
    if(kind==='fuzz')drawFuzzhorn(g,mx,gy,1.05,t,P);else drawEmberwing(g,mx,gy,1.15,t,P);
    parts=parts.filter(p=>(p.a+=1/60)<(p.life||.6));
    for(const p of parts){p.x+=p.vx/60;p.y+=p.vy/60;p.vy+=p.glow?-40/60:300/60;const k=p.a/(p.life||.6);g.globalAlpha=1-k;
      if(p.glow){g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*(1+k*1.5));gr.addColorStop(0,p.c);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(p.x,p.y,p.r*(1+k*1.5),0,TAU);g.fill();g.globalCompositeOperation='source-over';}
      else{g.fillStyle=p.c;g.beginPath();g.arc(p.x,p.y,p.r*(p.sp?1:1+k),0,TAU);g.fill();}}
    g.globalAlpha=1;g.restore();
  };}
