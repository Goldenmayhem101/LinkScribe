/* ===================== Monster animation: deforming sprites, body movement, 30 attacks with wind-up / strike / recover ===================== */
const SPR={};
function spr(id){let s=SPR[id];if(!s){const im=new Image();s=SPR[id]={im,ok:false};im.onload=()=>{s.ok=true;};im.src='mon/'+id+'.webp';}return s;}
const OC=document.createElement('canvas'),OG=OC.getContext('2d');OC.width=900;OC.height=900;
const clamp01=v=>v<0?0:v>1?1:v,eio=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,eout=t=>1-Math.pow(1-t,3),ein=t=>t*t*t,eback=t=>{const c=1.9;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2);};

/* living eyes: eyes are separated from the picture so they can look at the hero, glance around and blink */
const EYES={};
function eyeKit(id){const s=spr(id);if(!s.ok||!EYES[id])return null;if(s.kit)return s.kit;
  const im=s.im,w=im.naturalWidth,h=im.naturalHeight;const c0=document.createElement('canvas');c0.width=w;c0.height=h;const g0=c0.getContext('2d');g0.drawImage(im,0,0);const D=g0.getImageData(0,0,w,h).data;
  const base=document.createElement('canvas');base.width=w;base.height=h;const bg=base.getContext('2d');bg.drawImage(im,0,0);
  const iris=document.createElement('canvas');iris.width=w;iris.height=h;const ig=iris.getContext('2d');const ID=ig.createImageData(w,h);const eyes=[];
  for(const[ex,ey,rx,ry]of EYES[id]){let sr=0,sg=0,sb=0,n=0,px=0,py=0,pn=0;
    for(let y=Math.floor(ey-ry);y<=Math.ceil(ey+ry);y++)for(let x=Math.floor(ex-rx);x<=Math.ceil(ex+rx);x++){if(x<0||y<0||x>=w||y>=h)continue;const q=((x-ex)/rx)**2+((y-ey)/ry)**2;if(q>1)continue;const i=(y*w+x)*4,r=D[i],g=D[i+1],b=D[i+2],mn=Math.min(r,g,b),mx=Math.max(r,g,b);
      if(mn>170&&mx-mn<70){sr+=r;sg+=g;sb+=b;n++;}if((r+g+b)/3<80&&q<.8){px+=x;py+=y;pn++;}}
    const pcx=pn?px/pn:ex,pcy=pn?py/pn:ey,pr=Math.min(rx,ry)*.74;
    for(let y=Math.floor(pcy-pr);y<=Math.ceil(pcy+pr);y++)for(let x=Math.floor(pcx-pr);x<=Math.ceil(pcx+pr);x++){if(x<0||y<0||x>=w||y>=h)continue;if((x-pcx)**2+(y-pcy)**2>pr*pr)continue;if(((x-ex)/rx)**2+((y-ey)/ry)**2>.97)continue;const i=(y*w+x)*4,r=D[i],g=D[i+1],b=D[i+2],mn=Math.min(r,g,b),mx=Math.max(r,g,b);
      if(!(mn>170&&mx-mn<70)){ID.data[i]=r;ID.data[i+1]=g;ID.data[i+2]=b;ID.data[i+3]=D[i+3];}}
    const scl=n?[sr/n,sg/n,sb/n]:[238,240,246];
    let lr=0,lg=0,lb=0,ln=0;for(let a=-2.4;a<=-.7;a+=.08){const x=Math.round(ex+Math.cos(a)*rx*1.45),y=Math.round(ey+Math.sin(a)*ry*1.45);if(x<0||y<0||x>=w||y>=h)continue;const i=(y*w+x)*4;if(D[i+3]<200)continue;lr+=D[i];lg+=D[i+1];lb+=D[i+2];ln++;}
    const lid=ln?[lr/ln,lg/ln,lb/ln]:[120,100,120];
    const gr=bg.createRadialGradient(ex-rx*.25,ey-ry*.3,1,ex,ey,Math.max(rx,ry));gr.addColorStop(0,'rgb(255,255,255)');gr.addColorStop(.7,`rgb(${scl.map(Math.round)})`);gr.addColorStop(1,`rgb(${scl.map(v=>Math.round(v*.82))})`);
    bg.save();bg.beginPath();bg.ellipse(ex,ey,rx*.97,ry*.97,0,0,TAU);bg.clip();bg.fillStyle=gr;bg.beginPath();bg.arc(pcx,pcy,pr+.8,0,TAU);bg.fill();bg.restore();
    eyes.push({x:ex,y:ey,rx,ry,lid:`rgb(${lid.map(Math.round)})`,lidD:`rgb(${lid.map(v=>Math.round(v*.55))})`});}
  ig.putImageData(ID,0,0);s.kit={base,iris,eyes};return s.kit;}
/* draw the sprite bent: rows give lean / sway / breathing / jiggle, columns give wing-flap and body waves */
function renderMon(g,id,x,y,h,P){
  const s=spr(id);if(!s.ok)return null;const im=s.im,iw=im.naturalWidth,ih=im.naturalHeight,w=h*iw/ih;P=P||{};const t=P.t||0,fl=P.flip?-1:1;
  const padX=Math.ceil(w*.45+24),padT=Math.ceil(h*.4+24),padB=Math.ceil(h*.2+10),CW=w+padX*2,CH=h+padT+padB,R=DPR;
  if(CW*R>OC.width||CH*R>OC.height){OC.width=Math.max(OC.width,Math.ceil(CW*R)+4);OC.height=Math.max(OC.height,Math.ceil(CH*R)+4);}
  OG.setTransform(R,0,0,R,0,0);OG.clearRect(0,0,CW+2,CH+2);
  const kit=P.eyes===false?null:eyeKit(id),SRC=kit?kit.base:im;
  const rowDx=v=>{const up=1-v;let dx=(P.lean||0)*Math.pow(up,1.6)*h+(P.jig||0)*Math.sin(v*(P.jigK||9)-t*(P.jigS||10))*h*(.3+up*.7);if(P.head){const wv=Math.max(0,(.6-v)/.6);dx+=P.head*h*Math.pow(wv,1.3);}return dx*fl;};
  const rowSx=v=>1+(P.breath||0)*Math.sin(Math.PI*v)+(P.pulse||0)*Math.sin(t*(P.pulseS||3)-v*4)*(.4+v*.6);
  const rows=Math.max(16,Math.round(h*DPR/1.4));
  for(let i=0;i<rows;i++){const v0=i/rows,v1=(i+1)/rows,v=(v0+v1)/2;const rw=w*rowSx(v),dx=rowDx(v);
    OG.drawImage(SRC,0,v0*ih,iw,(v1-v0)*ih+1,padX+(w-rw)/2+dx,padT+v0*h,rw,(v1-v0)*h+1);}
  if(kit){const lx=(P.look?P.look.x:0)*fl,ly=P.look?P.look.y:0,bl=P.blink||0;
    for(const e of kit.eyes){const v=e.y/ih,sx=rowSx(v),rw=w*sx;const X=padX+(w-rw)/2+rowDx(v)+e.x/iw*rw,Y=padT+v*h,ex=e.rx/iw*rw,ey=e.ry/ih*h;
      OG.save();OG.beginPath();OG.ellipse(X,Y,ex*.97,ey*.97,0,0,TAU);OG.clip();
      OG.drawImage(kit.iris,e.x-e.rx,e.y-e.ry,e.rx*2,e.ry*2,X-ex+lx*ex*.3,Y-ey+ly*ey*.22,ex*2,ey*2);
      if(bl>0){const yy=Y-ey+ey*2*bl;OG.fillStyle=e.lid;OG.fillRect(X-ex-1,Y-ey-1,ex*2+2,yy-(Y-ey)+1);OG.strokeStyle=e.lidD;OG.lineWidth=Math.max(1,ey*.16);OG.beginPath();OG.ellipse(X,yy-ey*.15,ex*1.02,ey*.22,0,0,Math.PI);OG.stroke();}
      OG.restore();}}
  if(P.tint){OG.globalCompositeOperation='source-atop';OG.fillStyle=P.tint;OG.fillRect(0,0,CW,CH);OG.globalCompositeOperation='source-over';}
  g.save();
  if(P.clipY!=null){g.beginPath();g.rect(-9999,-9999,19998,9999+P.clipY);g.clip();}
  g.globalAlpha*=(P.alpha==null?1:P.alpha);
  g.translate(x+(P.tx||0),y+(P.ty||0));
  if(P.pivotC){g.translate(0,-h*.5);g.rotate(P.rot||0);g.translate(0,h*.5);}else g.rotate(P.rot||0);
  g.scale(fl*(P.sx||1),P.sy||1);
  const cols=(P.flap||P.wave||P.turn)?Math.max(16,Math.round(CW*DPR/1.4)):0;
  if(P.glow&&!cols){g.shadowColor=P.glow;g.shadowBlur=P.glowB||16;}
  if(!cols)g.drawImage(OC,0,0,CW*R,CH*R,-CW/2,-(padT+h),CW,CH);
  else for(let j=0;j<cols;j++){const u0=j/cols,u1=(j+1)/cols,u=(u0+u1)/2,cu=clamp01((u*CW-padX)/w);let dy=0;
    if(P.flap)dy+=P.flap*h*Math.pow(Math.abs(cu-.5)*2,1.7);
    if(P.wave){let tail=1;if(P.waveTail!=null){const k=P.waveTail*fl>0?cu:1-cu;tail=.25+k*1.3;}dy+=P.wave*h*Math.sin(cu*Math.PI*2*(P.waveK||1)-t*(P.waveS||6))*tail;}
    const tx=(P.turn||0)*fl*w*.07*Math.sin(Math.PI*cu);g.drawImage(OC,u0*CW*R,0,(u1-u0)*CW*R+1,CH*R,-CW/2+u0*CW+tx,-(padT+h)+dy,(u1-u0)*CW+.7,CH);}
  g.restore();
  return {w,h};
}
function monSize(id,h){const s=spr(id);return s.ok?h*s.im.naturalWidth/s.im.naturalHeight:h;}

/* ---------------- particles & effects ---------------- */
function P0(o){return Object.assign({x:0,y:0,vx:0,vy:0,ax:0,ay:0,drag:0,life:.6,age:0,size:3,grow:0,col:'#fff',kind:'dot',rot:0,vr:0,alpha:1,add:false},o);}
function drawP(g,p){const k=p.age/p.life,a=p.alpha*(1-k)*(p.fadeIn?Math.min(1,p.age/p.fadeIn):1);if(a<=0)return;const s=Math.max(.1,p.size+p.grow*p.age);
  g.save();g.globalAlpha=a;if(p.add)g.globalCompositeOperation='lighter';g.translate(p.x,p.y);g.rotate(p.rot);g.fillStyle=p.col;g.strokeStyle=p.col;
  switch(p.kind){
   case 'glow':{const gr=g.createRadialGradient(0,0,0,0,0,s);gr.addColorStop(0,p.col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,s,0,TAU);g.fill();break;}
   case 'smoke':{g.globalAlpha=a*.45;g.beginPath();g.arc(0,0,s,0,TAU);g.fill();break;}
   case 'spark':{g.lineWidth=Math.max(1,s*.4);g.lineCap='round';g.beginPath();g.moveTo(0,0);g.lineTo(-Math.hypot(p.vx,p.vy)*.035-2,0);g.stroke();break;}
   case 'shard':{g.beginPath();g.moveTo(s,0);g.lineTo(-s*.6,s*.45);g.lineTo(-s*.6,-s*.45);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.moveTo(s,0);g.lineTo(-s*.2,-s*.15);g.lineTo(-s*.4,-s*.4);g.fill();break;}
   case 'quill':{g.beginPath();g.moveTo(s*1.6,0);g.lineTo(-s*1.2,s*.28);g.lineTo(-s*1.2,-s*.28);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.65)';g.fillRect(-s*1.2,-s*.08,s*2.4,s*.16);break;}
   case 'feather':{g.beginPath();g.ellipse(0,0,s*1.5,s*.5,0,0,TAU);g.fill();g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=.8;g.beginPath();g.moveTo(-s*1.6,0);g.lineTo(s*1.5,0);g.stroke();break;}
   case 'leaf':{g.beginPath();g.moveTo(-s*1.4,0);g.quadraticCurveTo(0,-s,s*1.4,0);g.quadraticCurveTo(0,s,-s*1.4,0);g.fill();g.strokeStyle='rgba(0,60,0,.4)';g.lineWidth=.7;g.beginPath();g.moveTo(-s*1.3,0);g.lineTo(s*1.3,0);g.stroke();break;}
   case 'bubble':{g.lineWidth=1.4;g.globalAlpha=a*.85;g.beginPath();g.arc(0,0,s,0,TAU);g.stroke();g.globalAlpha=a*.2;g.fill();g.globalAlpha=a*.9;g.fillStyle='#fff';g.beginPath();g.arc(-s*.35,-s*.35,s*.22,0,TAU);g.fill();break;}
   case 'ring':{g.lineWidth=p.lw||3;g.beginPath();g.ellipse(0,0,s,s*(p.flat||1),0,0,TAU);g.stroke();break;}
   case 'rock':{g.beginPath();for(let i=0;i<6;i++){const r=s*(.75+((i*37)%5)/10);g.lineTo(Math.cos(i/6*TAU)*r,Math.sin(i/6*TAU)*r);}g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.arc(-s*.3,-s*.3,s*.35,0,TAU);g.fill();break;}
   case 'drop':{g.beginPath();g.moveTo(0,-s*1.5);g.quadraticCurveTo(s,0,0,s);g.quadraticCurveTo(-s,0,0,-s*1.5);g.fill();break;}
   case 'star':{g.beginPath();for(let i=0;i<10;i++){const r=i%2?s*.42:s;g.lineTo(Math.cos(i/10*TAU-Math.PI/2)*r,Math.sin(i/10*TAU-Math.PI/2)*r);}g.closePath();g.fill();break;}
   case 'puddle':{g.globalAlpha=a*.8;g.beginPath();g.ellipse(0,0,s,s*.26,0,0,TAU);g.fill();break;}
   case 'arc':{g.lineWidth=p.lw||4;g.lineCap='round';g.beginPath();g.arc(0,0,s,-.9,.9);g.stroke();break;}
   case 'stinger':{g.beginPath();g.moveTo(0,s*1.4);g.lineTo(s*.35,-s);g.lineTo(-s*.35,-s);g.closePath();g.fill();break;}
   default:{g.beginPath();g.arc(0,0,s,0,TAU);g.fill();}
  }g.restore();}
function stepP(p,dt){p.age+=dt;p.vx+=p.ax*dt;p.vy+=p.ay*dt;if(p.drag){const d=Math.exp(-p.drag*dt);p.vx*=d;p.vy*=d;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;}
const ri=(a,b)=>a+Math.random()*(b-a);

/* ---------------- scene ---------------- */
function Scene(W,H,theme,seed){this.W=W;this.H=H;this.theme=theme;this.seed=seed||1;this.gy=H*.8;this.fx=[];this.fxd=[];this.proj=[];this.actors=[];this.shake=0;this.time=0;
  this.hero={x:W*.18,hit:0,kx:0,stun:0,pull:0,lift:0};}
Scene.prototype.add=function(p){this.fx.push(P0(p));};
Scene.prototype.later=function(d,fn){this.fxd.push({t:this.time+d,fn,once:true});};
Scene.prototype.draw2=function(dur,fn){this.fxd.push({t0:this.time,dur,draw:fn});};
Scene.prototype.heroPt=function(){const h=this.hero;return {x:h.x+h.kx+h.pull,y:this.gy-28-h.lift};};
Scene.prototype.hitHero=function(a,o){o=o||{};const h=this.hero,pt=this.heroPt();h.hit=.5;h.kx=(a?a.dir:-1)*(o.knock==null?14:o.knock);if(o.stun)h.stun=1.6;if(o.lift)h.lift=o.lift;
  this.shake=Math.max(this.shake,o.shake||4);
  for(let i=0;i<12;i++){const an=ri(0,TAU),sp=ri(80,220);this.add({x:pt.x,y:pt.y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,drag:5,life:.4,size:2.4,col:'#fff',kind:'spark',add:true,rot:an});}
  this.add({x:pt.x,y:pt.y,kind:'ring',size:6,grow:120,life:.3,col:'rgba(255,255,255,.9)',lw:3});
  this.add({x:pt.x,y:pt.y-18,kind:'num',life:.8,vy:-50,drag:2,txt:'-1'});};
Scene.prototype.update=function(dt){this.time+=dt;const h=this.hero;
  h.hit=Math.max(0,h.hit-dt);h.kx*=Math.exp(-6*dt);h.stun=Math.max(0,h.stun-dt);h.pull*=Math.exp(-3*dt);h.lift*=Math.exp(-5*dt);this.shake*=Math.exp(-9*dt);
  for(const a of this.actors)a.update(dt);
  for(const p of this.fx)stepP(p,dt);this.fx=this.fx.filter(p=>p.age<p.life);
  const hp=this.heroPt();
  for(const q of this.proj){q.age=(q.age||0)+dt;q.vy+=(q.g||0)*dt;if(q.wob)q.y+=Math.sin(q.age*q.wob)*q.wa*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.rot=(q.rot||0)+(q.vr||0)*dt;
    if(q.trail&&Math.random()<.8)this.add({x:q.x,y:q.y,kind:q.trail.kind||'glow',size:q.trail.size||5,life:q.trail.life||.25,col:q.trail.col||q.col,add:q.trail.add!==false});
    if(!q.dead&&(Math.hypot(q.x-hp.x,q.y-hp.y)<(q.r||14)+12||q.y>this.gy-2&&q.vy>0)){q.dead=true;q.onHit&&q.onHit(q,Math.hypot(q.x-hp.x,q.y-hp.y)<(q.r||14)+26);}
    if(q.age>4)q.dead=true;}
  this.proj=this.proj.filter(q=>!q.dead);
  for(const d of this.fxd)if(d.once&&!d.done&&this.time>=d.t){d.done=true;d.fn();}
  this.fxd=this.fxd.filter(d=>d.once?!d.done:this.time-d.t0<d.dur);};
Scene.prototype.drawFx=function(g,front){for(const d of this.fxd)if(d.draw&&!!d.front===!!front)d.draw(g,clamp01((this.time-d.t0)/d.dur),this.time-d.t0);};
Scene.prototype.render=function(g,t){
  const sk=this.shake;g.save();if(sk>.2)g.translate(ri(-sk,sk),ri(-sk,sk));
  this.gy=paintWorld(g,this.W,this.H,this.theme,t,this.seed);
  this.drawFx(g,false);
  for(const p of this.fx)if(p.kind==='puddle')drawP(g,p);
  const order=this.actors.slice().sort((a,b)=>(a.air?1:0)-(b.air?1:0));
  for(const a of order)a.drawShadow(g);
  // hero
  const h=this.hero,hx=h.x+h.kx+h.pull;
  drawHero(g,hx,this.gy-h.lift,1.35,t,{},{});
  if(h.hit>0){g.save();g.globalCompositeOperation='lighter';glowDot(g,hx,this.gy-30-h.lift,30,[255,255,255],h.hit*1.2);g.restore();}
  if(h.stun>0)for(let i=0;i<3;i++){const an=t*5+i*TAU/3;g.fillStyle='#ffe066';g.save();g.translate(hx+Math.cos(an)*14,this.gy-66-h.lift+Math.sin(an)*4);g.beginPath();for(let k=0;k<10;k++){const r=k%2?2:5;g.lineTo(Math.cos(k/10*TAU)*r,Math.sin(k/10*TAU)*r);}g.fill();g.restore();}
  for(const a of order)a.draw(g);
  for(const q of this.proj)drawProj(g,q);
  for(const p of this.fx){if(p.kind==='puddle')continue;if(p.kind==='num'){const k=p.age/p.life;g.save();g.globalAlpha=1-k;g.font='900 15px Nunito,system-ui';g.textAlign='center';g.lineWidth=3;g.strokeStyle='#2a1440';g.strokeText(p.txt,p.x,p.y);g.fillStyle='#ff6a7a';g.fillText(p.txt,p.x,p.y);g.restore();}else drawP(g,p);}
  this.drawFx(g,true);
  g.restore();};
function drawProj(g,q){g.save();g.translate(q.x,q.y);g.rotate(q.rot||Math.atan2(q.vy,q.vx));
  if(q.kind==='glob'){const gr=g.createRadialGradient(-2,-2,1,0,0,q.r);gr.addColorStop(0,'#fff');gr.addColorStop(.35,q.col);gr.addColorStop(1,q.col);g.fillStyle=gr;g.beginPath();g.ellipse(0,0,q.r*1.25,q.r*.85,0,0,TAU);g.fill();}
  else if(q.kind==='rock'){g.rotate(q.age*8);drawP(g,P0({kind:'rock',size:q.r,col:q.col,life:9}));}
  else if(q.kind==='bubble'){drawP(g,P0({kind:'bubble',size:q.r,col:q.col,life:9}));}
  else if(q.kind==='orb'){g.globalCompositeOperation='lighter';glowDot(g,0,0,q.r*2,hex2(q.col),.9);g.fillStyle='#fff';g.beginPath();g.arc(0,0,q.r*.45,0,TAU);g.fill();}
  else drawP(g,P0({kind:q.kind,size:q.r,col:q.col,life:9}));
  g.restore();}

/* ---------------- actors ---------------- */
const AIR={fly:1,hover:1};
function Actor(m,S,o){this.m=m;this.S=S;this.h=o.h||70;this.home=o.x;this.x=o.x;this.dir=-1;this.st='idle';this.p=0;this.stT=0;this.t=ri(0,9);this.wait=o.delay==null?ri(1,2.2):o.delay;this.role=o.role||'';this.attacks=o.attacks!==false;this.atk=ATK[m.atk]||ATK.bite;this.alpha=1;this.air=!!AIR[m.body];this.extra={};this.copies=null;this.seed=ri(0,99);this.calm=o.calm;}
Actor.prototype.w=function(){return monSize(this.m.id,this.h);};
Actor.prototype.flip=function(){const f=this.m.face;return f==='r'?this.dir<0:f==='l'?this.dir>0:false;};
Actor.prototype.baseY=function(){const b=this.m.body;return b==='fly'?-Math.min(this.h*.75+26,(this.S.H||300)*.8-this.h-10):b==='hover'?-(this.h*.35+14):b==='swim'?-(this.h*.18+4):0;};
Actor.prototype.mouth=function(){const w=this.w(),f=this.m.face==='f';const P=this.pose||{};return {x:this.x+(P.tx||0)+this.dir*w*(f?.08:.36),y:this.S.gy+this.baseY()+(P.ty||0)-this.h*(f?.5:.62)};};
Actor.prototype.center=function(){const P=this.pose||{};return {x:this.x+(P.tx||0),y:this.S.gy+this.baseY()+(P.ty||0)-this.h*.5};};
Actor.prototype.set=function(st){this.st=st;this.stT=0;this.p=0;};
Actor.prototype.update=function(dt){this.t+=dt;this.stT+=dt;const A=this.atk;this.wb=this.st==='idle'?Math.min(1,(this.wb==null?1:this.wb)+dt*1.5):Math.max(0,(this.wb==null?1:this.wb)-dt*5);
  if(this.st==='idle'){this.wait-=dt;if(this.attacks&&this.wait<=0){this.set('wind');A.start&&A.start(this);}}
  else{const d=A[this.st]||.4;this.p=clamp01(this.stT/d);A.tick&&A.tick(this,this.st,this.p,dt);
    if(this.stT>=d){if(this.st==='wind'){this.set('act');A.strike&&A.strike(this);}else if(this.st==='act'){this.set('rec');A.recover&&A.recover(this);}else{this.set('idle');this.x=this.home;this.dir=-1;this.alpha=1;this.extra={};this.copies=null;this.wait=this.calm?ri(3,6):ri(.9,1.6);}}}};
/* body movement when not attacking */
function bodyPose(a){const t=a.t,b=a.m.body,h=a.h,P={t,tx:0,ty:0,rot:0,sx:1,sy:1,lean:0,breath:.012*Math.sin(t*2.1)};
  const wander=Math.sin(t*.55+a.seed)*0.5,mv=Math.cos(t*.55+a.seed);
  switch(b){
   case 'quad':{const ph=t*7;P.ty=-Math.abs(Math.sin(ph))*h*.035;P.rot=Math.sin(ph)*.022;P.sy=1-.028*Math.cos(2*ph);P.sx=1/P.sy;P.lean=Math.sin(ph)*.012;P.tx=wander*5;break;}
   case 'stout':{const ph=t*5.2;P.ty=-Math.abs(Math.sin(ph))*h*.05;P.rot=Math.sin(ph)*.055;P.sy=1-.045*Math.cos(2*ph);P.sx=1/P.sy;P.tx=wander*4;if(a.m.id==='a02'){P.flap=.05*Math.sin(t*5);}break;}
   case 'tall':{const ph=t*3.2;P.ty=-Math.abs(Math.sin(ph))*h*.03;P.lean=Math.sin(ph)*.05;P.rot=Math.sin(ph)*.015;P.tx=wander*5;break;}
   case 'blob':{const hop=(t*.9+a.seed)%2.2,j=hop<.45?Math.sin(hop/.45*Math.PI):0;P.ty=-j*h*.18;P.sy=hop<.08?.86:hop<.45?1.1-.1*hop:1+.04*Math.sin(t*5);P.sx=2-P.sy;P.jig=.022;P.jigK=7;P.jigS=7;P.tx=wander*6;break;}
   case 'fly':{P.ty=Math.sin(t*2.3+a.seed)*7;P.flap=.15*Math.sin(t*17);P.rot=Math.sin(t*1.6)*.06;P.tx=Math.sin(t*.8+a.seed)*22;P.lean=-mv*.03;P.sy=1+.03*Math.sin(t*17);break;}
   case 'hover':{P.ty=Math.sin(t*1.5+a.seed)*8;P.pulse=.07;P.pulseS=3.2;P.jig=.01;P.tx=Math.sin(t*.5+a.seed)*16;P.sy=1+.05*Math.sin(t*3.2);break;}
   case 'snake':{P.wave=.06;P.waveK=1.4;P.waveS=3.6;P.head=.075*Math.sin(t*1.9+a.seed);P.ty=-Math.abs(Math.sin(t*1.9))*h*.02;P.sy=1+.03*Math.sin(t*3.8);P.tx=wander*4;break;}
   case 'swim':{P.wave=.05;P.waveK=.75;P.waveS=8;P.waveTail=a.m.face==='l'?1:a.m.face==='r'?-1:null;P.ty=Math.sin(t*2)*6;P.rot=Math.sin(t*2)*.05;P.tx=Math.sin(t*.7+a.seed)*20;break;}
   case 'crawl':{const ph=t*16;P.ty=-Math.abs(Math.sin(ph))*h*.015;P.rot=Math.sin(ph)*.018;const burst=Math.sin(t*1.3+a.seed);P.tx=Math.sign(burst)*Math.pow(Math.abs(burst),.4)*16;P.jig=.006;P.jigS=20;break;}
   case 'shell':{const ph=t*3;P.ty=-Math.abs(Math.sin(ph))*h*.015;P.rot=Math.sin(ph)*.018;P.lean=Math.sin(ph)*.015;P.tx=wander*4;P.head=.02*Math.sin(t*1.3);break;}
   case 'plant':{P.lean=Math.sin(t*1.6+a.seed)*.06;P.breath=.025*Math.sin(t*2.2);P.sy=1+.025*Math.sin(t*2.2);P.jig=.006;P.jigS=3;break;}
   case 'roll':{P.pivotC=true;P.rot=Math.sin(t*2)*.06;P.ty=-Math.abs(Math.sin(t*3))*h*.03;P.tx=wander*5;P.breath=.025*Math.sin(t*2.6);break;}
   case 'toy':{const hp=(t*1.4+a.seed)%1,j=Math.sin(hp*Math.PI);P.ty=-j*h*.13;P.sy=hp<.1?1-.15*(1-hp/.1):1+.06*j;P.sx=2-P.sy;P.rot=Math.sin(t*2.8)*.06;P.tx=wander*6;break;}
  }return P;}
Actor.prototype.drawShadow=function(g){const P=this.pose||{},w=this.w(),alt=Math.max(0,-(this.baseY()+(P.ty||0)));const k=Math.max(.35,1-alt/220);
  if(this.alpha<.05&&!this.extra.mound)return;
  g.save();g.globalAlpha=(this.extra.sunk?0:.38*k*this.alpha);g.fillStyle='#0a0820';g.beginPath();g.ellipse(this.x+(P.tx||0),this.S.gy+1,Math.max(1,w*.36*k*Math.abs(P.sx||1)),5*k,0,0,TAU);g.fill();g.restore();
  if(this.role==='boss'){const t=this.t;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.55+Math.sin(t*3)*.15;const gr=g.createRadialGradient(this.x,this.S.gy,4,this.x,this.S.gy,w*.75);gr.addColorStop(0,'rgba(255,80,80,.55)');gr.addColorStop(1,'rgba(255,80,80,0)');g.fillStyle=gr;g.beginPath();g.ellipse(this.x,this.S.gy,w*.75,14,0,0,TAU);g.fill();g.restore();}};
Actor.prototype.draw=function(g){
  const base=bodyPose(this);const A=this.atk;const wb=this.wb==null?1:this.wb;base.tx*=wb;let P=base;
  if(this.st!=='idle'&&A.pose){const m=A.pose(this,this.st,this.p,base)||{};P=Object.assign({},base,m);}
  // face the hero: head leans toward them, front-facing bodies turn a little, eyes follow and blink
  const hp=this.S.heroPt?this.S.heroPt():{x:0,y:0},cx=this.x+(P.tx||0),cy=this.S.gy+this.baseY()+(P.ty||0)-this.h*.6;
  const att=this.st!=='idle';P.lean=(P.lean||0)+(hp.x<cx?-1:1)*(att?.035:.022);
  if(this.m.face==='f')P.turn=(hp.x<cx?-1:1)*(att?.9:.55);
  this.gl=(this.gl||0)-.016;if(this.gl<-3-this.seed%2){this.gl=.7;this.gx=ri(-1,1);this.gy2=ri(-.6,.4);}
  const lk={x:clamp((hp.x-cx)/90,-1,1),y:clamp((hp.y-cy)/70,-1,1)};if(this.gl>0&&!att){lk.x=this.gx;lk.y=this.gy2;}
  this.lk=this.lk?{x:lerp(this.lk.x,lk.x,.25),y:lerp(this.lk.y,lk.y,.25)}:lk;P.look=this.lk;
  const bt=(this.t+this.seed)%3.7;P.blink=bt<.07?bt/.07:bt<.14?1-(bt-.07)/.07:0;if(this.S.hero&&this.S.hero.hit>.3&&this.st==='rec')P.blink=0;
  this.pose=P;P.flip=this.flip();P.alpha=this.alpha*(P.alpha==null?1:P.alpha);
  if(this.st==='wind'&&!A.noWarn){const k=Math.sin(this.stT*28)*.5+.5;P.tint=`rgba(255,70,70,${.12+.14*k})`;}
  if(this.role==='elite')P.glow='rgba(255,215,90,.95)';
  if(this.role==='boss')P.glow='rgba(255,90,90,.9)';
  if(this.extra.sunk)P.clipY=this.S.gy+1;
  if(this.copies){for(const c of this.copies)renderMon(g,this.m.id,c.x,this.S.gy+c.y,this.h*.55,{t:this.t,sx:c.sx,sy:c.sy,flip:this.flip(),jig:.02});}
  if(P.alpha>.01)renderMon(g,this.m.id,this.x,this.S.gy+this.baseY(),this.h,P);
  if(this.extra.drawFront)this.extra.drawFront(g);};

/* ---------------- attack helpers ---------------- */
const RGB=c=>hex2(c);
function towardHero(a,frac){const hp=a.S.heroPt();return lerp(a.home,hp.x+a.w()*.45,frac);}
function dustAt(S,x,y,n,col,spd){for(let i=0;i<n;i++)S.add({x:x+ri(-8,8),y:y-2,vx:ri(-1,1)*(spd||60),vy:ri(-60,-20),ay:60,drag:2.5,life:ri(.4,.7),size:ri(4,7),grow:14,col:col||'rgba(210,200,230,.8)',kind:'smoke'});}
function impact(S,x,y,col){S.add({x,y,kind:'ring',size:4,grow:160,life:.35,col,lw:4,flat:.35});for(let i=0;i<10;i++){const an=ri(Math.PI,TAU);S.add({x,y,vx:Math.cos(an)*ri(80,200),vy:Math.sin(an)*ri(80,200),ay:500,life:.6,size:ri(2,4),col,kind:'rock'});}}
function elemKind(a){const e=a.m.el;return e==='fire'?'fire':e==='ice'||e==='crystal'?'ice':e==='water'?'water':e==='plant'?'plant':e==='night'?'night':e==='toy'?'toy':e==='sand'?'sand':'wild';}
function lob(S,from,to,time,gr){return {x:from.x,y:from.y,vx:(to.x-from.x)/time,vy:(to.y-from.y-.5*gr*time*time)/time,g:gr};}
function glowCol(a,al){const c=RGB(a.m.atkCol||a.m.col);return `rgba(${c[0]},${c[1]},${c[2]},${al==null?1:al})`;}

/* ---------------- the 30 attacks ---------------- */
const ATK={
 charge:{wind:.75,act:.38,rec:.8,
  tick(a,st,p,dt){if(st==='wind'&&Math.random()<dt*9){const w=a.w();dustAt(a.S,a.x+w*.3,a.S.gy,2,null,40);}
    if(st==='act'&&Math.random()<dt*40){const c=a.center();a.S.add({x:c.x+ri(-10,30),y:c.y+ri(-a.h*.3,a.h*.3),vx:280,life:.18,size:2,col:'rgba(255,255,255,.8)',kind:'spark',rot:0,add:true});}
    if(st==='rec'&&p<.4&&Math.random()<dt*25)dustAt(a.S,a.x,a.S.gy,1,null,30);},
  pose(a,st,p){if(st==='wind')return {lean:.1+Math.sin(a.stT*40)*.01,sy:1-.06*eout(p),sx:1+.05*eout(p),tx:6*eout(p)};
    if(st==='act'){a.x=lerp(a.home,towardHero(a,1),ein(p));return {lean:-.16,rot:-.06,sx:1.08,sy:.94,tx:0};}
    a.x=lerp(towardHero(a,1),a.home,eout(p));return {lean:lerp(.14,0,eout(p)),rot:lerp(.05,0,p),tx:0};},
  recover(a){const hp=a.S.heroPt();a.S.hitHero(a,{knock:22,shake:7});impact(a.S,hp.x+10,a.S.gy,glowCol(a));}},
 pounce:{wind:.5,act:.55,rec:.6,
  pose(a,st,p){const H=a.S.H;if(st==='wind')return {sy:1-.2*eout(p),sx:1+.14*eout(p),lean:.06};
    if(st==='act'){a.x=lerp(a.home,towardHero(a,.95),p);return {ty:-Math.sin(p*Math.PI)*H*.3,sy:p<.85?1.12:.8,sx:p<.85?.92:1.2,rot:-.25*Math.sin(p*Math.PI),tx:0};}
    a.x=lerp(towardHero(a,.95),a.home,p);return {ty:-Math.sin(p*Math.PI)*H*.18,sy:p<.1?.82:1,sx:p<.1?1.15:1,tx:0};},
  recover(a){a.S.hitHero(a,{knock:16,shake:6});dustAt(a.S,a.x,a.S.gy,8);a.S.add({x:a.x,y:a.S.gy,kind:'ring',size:6,grow:140,life:.35,col:'rgba(255,255,255,.8)',lw:3,flat:.3});}},
 bite:{wind:.45,act:.3,rec:.55,
  pose(a,st,p){if(st==='wind')return {lean:.12*eout(p),sy:1+.05*p};if(st==='act'){a.x=lerp(a.home,towardHero(a,.62),eout(p));return {lean:-.24*eout(p),sy:1.04,tx:0};}
    a.x=lerp(towardHero(a,.62),a.home,eout(p));return {lean:lerp(-.18,0,eout(p)),tx:0};},
  strike(a){a.S.later(.18,()=>{const hp=a.S.heroPt(),col=glowCol(a);a.S.hitHero(a,{knock:12});
    a.S.draw2(.35,(g,p)=>{const o=(1-eout(Math.min(1,p*2.2)))*20;g.save();g.translate(hp.x,hp.y);g.globalAlpha=1-Math.max(0,(p-.5)*2);g.fillStyle='#fff';g.strokeStyle=col;g.lineWidth=2;
      for(const s of[-1,1]){g.beginPath();g.moveTo(-18,s*(o+2));for(let i=0;i<=6;i++)g.lineTo(-18+i*6,s*(o+2)+s*((i%2)?-8:0));g.lineTo(18,s*(o+2));g.quadraticCurveTo(0,s*(o+12),-18,s*(o+2));g.fill();g.stroke();}g.restore();},true);});}},
 tailwhip:{wind:.42,act:.36,rec:.55,
  pose(a,st,p){if(st==='wind')return {sx:Math.cos(eio(p)*Math.PI),lean:.05};if(st==='act'){a.x=lerp(a.home,towardHero(a,.5),eout(p));return {sx:-1,rot:Math.sin(p*Math.PI)*.35,lean:.18*Math.sin(p*Math.PI),tx:0};}
    a.x=lerp(towardHero(a,.5),a.home,eout(p));return {sx:-Math.cos(eio(p)*Math.PI),tx:0};},
  strike(a){const col=glowCol(a,.9),S=a.S;S.draw2(.32,(g,p)=>{const c=a.center();g.save();g.translate(c.x+a.dir*a.w()*.2,c.y);g.globalCompositeOperation='lighter';
      for(let i=0;i<3;i++){g.strokeStyle=col;g.globalAlpha=(1-p)*(1-i*.28);g.lineWidth=16-i*4;g.lineCap='round';g.beginPath();g.arc(0,0,a.w()*.55+i*8,Math.PI*.55+(1-eout(p))*1.4,Math.PI*1.35);g.stroke();}g.restore();},true);
    S.later(.14,()=>S.hitHero(a,{knock:20,shake:5}));}},
 spit:{wind:.5,act:.25,rec:.5,
  pose(a,st,p){if(st==='wind')return {lean:.13*eout(p),sy:1+.07*eout(p),breath:.05*p};if(st==='act')return {lean:lerp(.13,-.17,eout(p)),sy:.96};return {lean:lerp(-.17,0,eout(p))};},
  strike(a){const S=a.S,m=a.mouth(),hp=S.heroPt(),col=a.m.col;const q=Object.assign(lob(S,m,hp,.62,520),{kind:'glob',r:10,col,trail:{kind:'glow',size:5,col:glowCol(a,.6),life:.2}});
    q.onHit=(q,hit)=>{if(hit)S.hitHero(a,{knock:8});S.add({x:q.x,y:S.gy,kind:'puddle',size:22,life:1.2,col:glowCol(a,.75)});for(let i=0;i<10;i++){const an=ri(Math.PI*1.05,Math.PI*1.95);S.add({x:q.x,y:q.y,vx:Math.cos(an)*ri(60,150),vy:Math.sin(an)*ri(60,150),ay:500,life:.5,size:ri(2,4),col,kind:'drop',rot:an+Math.PI/2});}};S.proj.push(q);}},
 breath:{wind:.6,act:1.1,rec:.5,
  tick(a,st,p,dt){const S=a.S,m=a.mouth(),e=elemKind(a),col=a.m.col;
    if(st==='wind'&&Math.random()<dt*30){const an=ri(0,TAU),r=ri(18,30);S.add({x:m.x+Math.cos(an)*r,y:m.y+Math.sin(an)*r,vx:-Math.cos(an)*r*3,vy:-Math.sin(an)*r*3,life:.3,size:2,col,kind:'spark',add:true,rot:an+Math.PI});}
    if(st==='act'){const hp=S.heroPt(),base=Math.atan2(hp.y-m.y,hp.x-m.x);for(let i=0;i<(LOWFX?2:4);i++){const an=base+ri(-.2,.2),sp=ri(240,330);
      if(e==='fire'){S.add({x:m.x,y:m.y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,ay:-60,life:ri(.35,.55),size:ri(6,10),grow:18,col:Math.random()<.5?'rgba(255,180,60,1)':'rgba(255,90,30,1)',kind:'glow',add:true});if(Math.random()<.3)S.add({x:m.x,y:m.y,vx:Math.cos(an)*sp*.6,vy:Math.sin(an)*sp*.6-20,life:.7,size:5,grow:20,col:'rgba(80,60,60,.6)',kind:'smoke'});}
      else if(e==='ice'){S.add({x:m.x,y:m.y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,life:.45,size:ri(3,5),col:Math.random()<.5?'#e8fbff':col,kind:'shard',rot:an,vr:ri(-8,8)});S.add({x:m.x,y:m.y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,life:.4,size:9,grow:16,col:'rgba(170,230,255,.8)',kind:'glow',add:true});}
      else if(e==='water'){S.add({x:m.x,y:m.y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,ay:120,life:.45,size:ri(3,5),col,kind:Math.random()<.5?'bubble':'drop',rot:an+Math.PI/2});}
      else S.add({x:m.x,y:m.y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,life:.45,size:ri(5,9),grow:14,col,kind:'glow',add:true});}}},
  pose(a,st,p){if(st==='wind')return {lean:.12*eout(p),sy:1+.06*p,breath:.04*p};if(st==='act')return {lean:-.1,jig:.008,jigS:30,sy:1.02};return {lean:lerp(-.1,0,eout(p))};},
  strike(a){a.S.later(.35,()=>a.S.hitHero(a,{knock:8}));a.S.later(.8,()=>a.S.hitHero(a,{knock:10}));}},
 beam:{wind:.8,act:.55,rec:.5,
  tick(a,st,p,dt){if(st==='wind'&&Math.random()<dt*35){const m=a.mouth(),an=ri(0,TAU),r=ri(22,36);a.S.add({x:m.x+Math.cos(an)*r,y:m.y+Math.sin(an)*r,vx:-Math.cos(an)*r*3.2,vy:-Math.sin(an)*r*3.2,life:.3,size:2,col:a.m.col,kind:'spark',add:true,rot:an+Math.PI});}},
  pose(a,st,p){if(st==='wind')return {lean:.06*p,sy:1+.04*p};if(st==='act')return {lean:-.05,jig:.006,jigS:40};return {lean:lerp(-.05,0,p)};},
  start(a){const S=a.S;S.draw2(a.atk.wind,(g,p)=>{const m=a.mouth();g.save();g.globalCompositeOperation='lighter';glowDot(g,m.x,m.y,6+p*16,RGB(a.m.col),.9);g.fillStyle='#fff';g.beginPath();g.arc(m.x,m.y,2+p*4,0,TAU);g.fill();g.restore();},true);},
  strike(a){const S=a.S;S.hitHero(a,{knock:14,shake:5});S.draw2(.55,(g,p)=>{const m=a.mouth(),hp=S.heroPt(),wd=(14+Math.sin(S.time*60)*3)*(1-p*p);g.save();g.globalCompositeOperation='lighter';
      const an=Math.atan2(hp.y-m.y,hp.x-m.x),L=Math.hypot(hp.x-m.x,hp.y-m.y)+30;g.translate(m.x,m.y);g.rotate(an);
      const gr=g.createLinearGradient(0,-wd,0,wd);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.5,glowCol(a,1));gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,-wd,L,wd*2);
      g.fillStyle='rgba(255,255,255,.95)';g.fillRect(0,-wd*.18,L,wd*.36);glowDot(g,0,0,wd*1.6,RGB(a.m.col),.9);glowDot(g,L-30,0,wd*2,RGB(a.m.col),.9);g.restore();},true);}},
 quills:{wind:.55,act:.22,rec:.5,
  pose(a,st,p){if(st==='wind')return {sx:1+.13*eout(p),sy:1+.1*eout(p),jig:.01*p,jigS:40,breath:.05*p};if(st==='act')return {sx:1.08,sy:.94};return {sx:lerp(1.08,1,p),sy:lerp(.94,1,p)};},
  strike(a){const S=a.S,c=a.center(),hp=S.heroPt(),base=Math.atan2(hp.y-c.y,hp.x-c.x),e=elemKind(a);
    for(let i=-3;i<=3;i++){const an=base+i*.11,sp=440;S.proj.push({x:c.x,y:c.y-a.h*.15,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,kind:e==='ice'?'shard':'quill',r:8,col:a.m.col,onHit:(q,h)=>{if(h&&!a._qh){a._qh=1;S.hitHero(a,{knock:12});setTimeout(()=>a._qh=0,300);}S.add({x:q.x,y:q.y,kind:'spark',vx:-q.vx*.2,vy:-120,ay:400,life:.3,size:2,col:'#fff'});}});}}},
 shockwave:{wind:.6,act:.16,rec:.6,
  pose(a,st,p){if(st==='wind')return {ty:-a.h*.28*eout(p),sy:1+.12*eout(p),sx:1-.08*eout(p),lean:.04};if(st==='act')return {ty:-a.h*.28*(1-ein(p)),sy:lerp(1.12,.72,ein(p)),sx:lerp(.92,1.22,ein(p))};return {sy:lerp(.72,1,eback(p)),sx:lerp(1.22,1,eback(p))};},
  recover(a){const S=a.S,x0=a.x,hp=S.heroPt(),col=glowCol(a,.9);S.shake=9;dustAt(S,x0,S.gy,10);
    S.draw2(.55,(g,p)=>{const x=lerp(x0,hp.x-30,p),hh=26*(1-p*.4);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=col;g.lineWidth=5;g.globalAlpha=1-p*.4;g.beginPath();g.ellipse(x,S.gy,22,hh,0,Math.PI,TAU);g.stroke();g.globalAlpha=.4;g.lineWidth=12;g.stroke();g.restore();
      if(Math.random()<.6)S.add({x:x+ri(-10,10),y:S.gy,vx:ri(-30,30),vy:ri(-220,-120),ay:600,life:.5,size:ri(2,4),col:'rgba(150,130,120,1)',kind:'rock'});});
    S.later(.42,()=>S.hitHero(a,{knock:10,lift:18,shake:6}));}},
 roll:{wind:.45,act:.7,rec:.75,
  tick(a,st,p,dt){if(st!=='wind'&&Math.random()<dt*30)dustAt(a.S,a.x,a.S.gy,1,null,30);},
  pose(a,st,p){if(st==='wind')return {pivotC:true,rot:.5*eout(p),sy:1-.1*p,sx:1+.06*p};if(st==='act'){a.x=lerp(a.home,towardHero(a,.9),eio(p));return {pivotC:true,rot:.5-eio(p)*TAU*2.2,sy:.92,tx:0};}
    a.x=lerp(towardHero(a,.9),a.home,eout(p));return {pivotC:true,rot:(.5-TAU*2.2)*(1-eout(p)),ty:-Math.sin(Math.min(1,p*1.6)*Math.PI)*a.h*.3,tx:0};},
  recover(a){a.S.hitHero(a,{knock:20,shake:5});}},
 burrow:{wind:.8,act:1.3,rec:1.6,noWarn:true,
  tick(a,st,p,dt){const S=a.S;if((st==='wind'||(st==='rec'&&p>.45&&p<.7))&&Math.random()<dt*40){S.add({x:a.x+ri(-14,14),y:S.gy,vx:ri(-140,140),vy:ri(-260,-120),ay:700,life:.6,size:ri(2,4),col:'#7a5a3a',kind:'rock'});}},
  start(a){a.extra.sunk=true;},
  pose(a,st,p){const S=a.S,hp=S.heroPt(),dest=hp.x+6;
    if(st==='wind')return {ty:a.h*1.05*ein(p),jig:.012,jigS:40,rot:Math.sin(a.stT*40)*.04};
    if(st==='act'){a.alpha=0;const mx=lerp(a.home,dest,eio(p));a.extra.mx=mx;return {ty:a.h*1.1};}
    a.alpha=1;// rise under hero, sink, travel back, rise at home
    if(p<.25){a.x=dest;return {ty:a.h*(1-eout(p/.25)),sy:1.08};}
    if(p<.45){a.x=dest;return {ty:0};}
    if(p<.62){a.x=dest;return {ty:a.h*1.05*ein((p-.45)/.17)};}
    if(p<.85){a.alpha=0;a.extra.mx=lerp(dest,a.home,eio((p-.62)/.23));a.x=a.home;return {ty:a.h*1.1};}
    a.x=a.home;return {ty:a.h*(1-eout((p-.85)/.15))};},
  strike(a){const S=a.S;a.extra.mound=true;a.extra.drawFront=null;
    S.draw2(a.atk.act+a.atk.rec,(g,p,el)=>{const st=a.st,pp=a.p;const show=st==='act'||(st==='rec'&&pp>.62&&pp<.85);if(!show)return;const x=a.extra.mx;
      g.fillStyle='#6a4a2a';g.beginPath();g.ellipse(x,S.gy+2,22,9,0,Math.PI,TAU);g.fill();g.fillStyle='#8a6a40';g.beginPath();g.ellipse(x-4,S.gy,12,5,0,Math.PI,TAU);g.fill();
      if(Math.random()<.5)S.add({x:x+ri(-10,10),y:S.gy-4,vx:ri(-60,60),vy:ri(-160,-80),ay:600,life:.5,size:ri(1.5,3),col:'#7a5a3a',kind:'rock'});});},
  recover(a){const S=a.S,hp=S.heroPt();S.hitHero(a,{knock:6,lift:34,shake:8});for(let i=0;i<22;i++)S.add({x:hp.x+ri(-16,16),y:S.gy,vx:ri(-180,180),vy:ri(-380,-160),ay:800,life:.8,size:ri(2,5),col:i%3?'#7a5a3a':'#a0805a',kind:'rock'});dustAt(S,hp.x,S.gy,8,'rgba(150,120,90,.8)');}},
 dive:{wind:.5,act:.42,rec:.85,
  tick(a,st,p,dt){if(st==='act'&&Math.random()<dt*50){const c=a.center();a.S.add({x:c.x,y:c.y,life:.25,size:a.h*.18,col:glowCol(a,.5),kind:'glow',add:true});}},
  pose(a,st,p){const S=a.S,hp=S.heroPt(),c0y=a.baseY();
    if(st==='wind')return {ty:-28*eout(p),flap:.22*Math.sin(a.t*26),sy:1.08,rot:.15*p};
    if(st==='act'){a.x=lerp(a.home,hp.x+18,ein(p));const ty=lerp(-28,(hp.y+20-S.gy)-c0y,ein(p));return {ty,rot:lerp(.15,-.55,p),flap:.04,sx:1.05,sy:.95,tx:0};}
    a.x=lerp(hp.x+18,a.home,eout(p));return {ty:lerp((hp.y+20-S.gy)-c0y,0,eout(p))-Math.sin(p*Math.PI)*40,rot:lerp(-.3,0,p),flap:.18*Math.sin(a.t*20),tx:0};},
  recover(a){a.S.hitHero(a,{knock:16,shake:5});}},
 stingers:{wind:.75,act:.7,rec:.75,
  pose(a,st,p){const hp=a.S.heroPt();if(st==='wind'){a.x=lerp(a.home,hp.x+6,eio(p));return {ty:-30*p,tx:0,lean:-.05};}
    if(st==='act'){a.x=hp.x+6+Math.sin(a.t*10)*4;return {ty:-30,tx:0,sy:1+.05*Math.sin(a.t*30)};}a.x=lerp(hp.x+6,a.home,eio(p));return {ty:-30*(1-p),tx:0};},
  strike(a){const S=a.S,e=elemKind(a);for(let i=0;i<4;i++)S.later(i*.14,()=>{const c=a.center();S.proj.push({x:c.x+ri(-12,12),y:c.y+a.h*.35,vx:ri(-10,10),vy:120,g:900,kind:e==='water'||a.m.id==='a40'||a.m.id==='r32'?'drop':'stinger',r:8,col:a.m.col,trail:{kind:'glow',size:4,col:glowCol(a,.5),life:.15},rot:Math.PI/2,
    onHit:(q,h)=>{if(h&&!a._sh){a._sh=1;S.hitHero(a,{knock:6});setTimeout(()=>a._sh=0,250);}S.add({x:q.x,y:S.gy,kind:'ring',size:3,grow:50,life:.25,col:glowCol(a,.8),lw:2,flat:.3});}});});}},
 sonic:{wind:.38,act:.95,rec:.4,
  tick(a,st,p,dt){if(st==='act'){a._sn=(a._sn||0)+dt;if(a._sn>.17){a._sn=0;const m=a.mouth(),hp=a.S.heroPt(),an=Math.atan2(hp.y-m.y,hp.x-m.x),col=glowCol(a,.9);a.S.add({x:m.x,y:m.y,vx:Math.cos(an)*300,vy:Math.sin(an)*300,kind:'arc',size:12,grow:80,life:.6,col,lw:7,rot:an,add:true});a.S.add({x:m.x,y:m.y,vx:Math.cos(an)*300,vy:Math.sin(an)*300,kind:'arc',size:12,grow:80,life:.6,col:'rgba(255,255,255,.9)',lw:2,rot:an});}}},
  pose(a,st,p){if(st==='wind')return {sx:1+.08*p,sy:1+.05*p,lean:.08*p};if(st==='act')return {jig:.03,jigS:45,jigK:14,lean:-.06,sx:1.04};return {};},
  strike(a){a.S.later(.45,()=>a.S.hitHero(a,{knock:6,stun:true}));}},
 tongue:{wind:.4,act:.6,rec:.3,
  pose(a,st,p){if(st==='wind')return {lean:.1*p,sy:1+.04*p};if(st==='act')return {lean:-.1,sy:1.03};return {lean:-.1*(1-p)};},
  strike(a){const S=a.S;S.draw2(.6,(g,p)=>{const m=a.mouth(),hp=S.heroPt();const k=p<.5?eout(p*2):1-ein((p-.5)*2);const tx=lerp(m.x,hp.x,k),ty=lerp(m.y,hp.y,k);
      g.save();g.lineCap='round';g.strokeStyle='#c8406a';g.lineWidth=7;g.beginPath();g.moveTo(m.x,m.y);g.quadraticCurveTo((m.x+tx)/2,Math.min(m.y,ty)-30*k,tx,ty);g.stroke();g.strokeStyle='#ff7aa0';g.lineWidth=4;g.stroke();
      g.fillStyle='#ff7aa0';g.beginPath();g.arc(tx,ty,7,0,TAU);g.fill();g.restore();
      if(p>.5)S.hero.pull=(1-p)*2*18*(-a.dir);},true);
    S.later(.3,()=>S.hitHero(a,{knock:-4}));}},
 ink:{wind:.4,act:.3,rec:.7,
  pose(a,st,p){if(st==='wind')return {sy:1-.12*eout(p),sx:1+.1*eout(p)};if(st==='act')return {sy:lerp(.88,1.08,eout(p)),sx:lerp(1.1,.95,eout(p))};return {};},
  strike(a){const S=a.S,c=a.center(),hp=S.heroPt(),col=a.m.el==='toy'?a.m.col:'#6a4a9a',dk=a.m.id==='f09';
    for(let i=0;i<16;i++){const an=Math.atan2(hp.y-c.y,hp.x-c.x)+ri(-.5,.5),sp=ri(150,320);S.add({x:c.x,y:c.y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,drag:3,life:ri(1,1.5),size:ri(8,13),grow:30,col:dk?'rgba(140,200,80,.8)':col,kind:'smoke',alpha:1});}
    S.later(.4,()=>S.hitHero(a,{knock:6,stun:true}));}},
 split:{wind:.5,act:1.15,rec:.6,
  pose(a,st,p){const S=a.S,hp=S.heroPt();if(st==='wind')return {jig:.02*p,jigS:40,sy:1-.12*p,sx:1+.14*p};
    if(st==='act'){a.alpha=0;const k=Math.min(1,p*1.25);a.copies=[0,1].map(i=>{const q=clamp01(k*1.15-i*.15),x=lerp(a.home+(i?18:-18),hp.x+12+(i?16:-6),q);return {x,y:-Math.sin(q*Math.PI*2)*30*(1-q*.3),sx:1,sy:1};});return {};}
    a.copies=[0,1].map(i=>{const q=eio(p),x=lerp(hp.x+12+(i?16:-6),a.home,q);return {x,y:-Math.sin(q*Math.PI)*24,sx:1,sy:1};});if(p>.9){a.alpha=1;a.copies=null;return {sx:1.15,sy:.88};}return {};},
  strike(a){const S=a.S,c=a.center();for(let i=0;i<10;i++)S.add({x:c.x,y:c.y,vx:ri(-120,120),vy:ri(-160,-40),ay:400,life:.5,size:ri(2,4),col:a.m.col,kind:'drop'});S.later(.55,()=>S.hitHero(a,{knock:10}));S.later(.8,()=>S.hitHero(a,{knock:10}));}},
 blink:{wind:.45,act:.6,rec:.6,noWarn:false,
  tick(a,st,p,dt){if(st==='wind'&&Math.random()<dt*30){const c=a.center();a.S.add({x:c.x+ri(-a.h*.4,a.h*.4),y:c.y+ri(-a.h*.4,a.h*.4),vy:-30,life:.4,size:2.5,col:a.m.col,kind:'star',add:true});}},
  pose(a,st,p){const hp=a.S.heroPt();if(st==='wind'){a.alpha=.55+.45*Math.cos(a.stT*40);return {};}
    if(st==='act'){if(p<.35){a.alpha=0;return {};}a.alpha=Math.min(1,(p-.35)*5);a.dir=1;a.x=hp.x-a.w()*.55;return {lean:p>.6?.2*Math.sin((p-.6)/.4*Math.PI):0,tx:0};}
    if(p<.3){a.alpha=1-p/.3;return {};}a.dir=-1;a.x=a.home;a.alpha=Math.min(1,(p-.3)*4);return {tx:0};},
  strike(a){const S=a.S;const puff=(x,y)=>{for(let i=0;i<14;i++){const an=ri(0,TAU);S.add({x,y,vx:Math.cos(an)*90,vy:Math.sin(an)*90,drag:4,life:.5,size:7,grow:14,col:'rgba(200,180,255,.9)',kind:'smoke'});}};
    const c=a.center();puff(c.x,c.y);S.later(.2,()=>{const hp=S.heroPt();puff(hp.x-a.w()*.55,hp.y);});
    S.later(.45,()=>{const hp=S.heroPt();S.hitHero(a,{knock:14});S.draw2(.35,(g,p)=>{g.save();g.globalCompositeOperation='lighter';g.strokeStyle=glowCol(a,1-p);g.lineWidth=4;g.lineCap='round';for(let i=0;i<3;i++){g.beginPath();g.moveTo(hp.x-16+i*8,hp.y-18);g.lineTo(hp.x-4+i*8,hp.y+16);g.stroke();}g.restore();},true);});
    S.later(.6,()=>{const hp=S.heroPt();puff(hp.x-a.w()*.55,hp.y);});S.later(.8,()=>puff(a.home,a.center().y));}},
 zap:{wind:.65,act:.45,rec:.4,
  tick(a,st,p,dt){if(st==='wind'&&Math.random()<dt*40){const c=a.center(),an=ri(0,TAU);a.S.add({x:c.x+Math.cos(an)*a.h*.45,y:c.y+Math.sin(an)*a.h*.45,vx:Math.cos(an)*60,vy:Math.sin(an)*60,life:.15,size:2.5,col:'#fff8a0',kind:'spark',add:true,rot:an});}},
  pose(a,st,p){if(st==='wind')return {jig:.01,jigS:50,sy:1+.03*Math.sin(a.t*60)};if(st==='act')return {lean:-.06,sy:1.04};return {};},
  strike(a){const S=a.S;S.hitHero(a,{knock:10,stun:true,shake:5});S.draw2(.45,(g,p)=>{const m=a.mouth(),hp=S.heroPt();const R=rng(Math.floor(S.time*30));g.save();g.globalCompositeOperation='lighter';
      for(let b=0;b<2;b++){g.strokeStyle=b?'#ffffff':glowCol(a,1);g.lineWidth=b?2:6;g.globalAlpha=1-p*.6;g.beginPath();g.moveTo(m.x,m.y);for(let s=1;s<=8;s++){const k=s/8;g.lineTo(lerp(m.x,hp.x,k)+(s<8?(R()-.5)*26:0),lerp(m.y,hp.y,k)+(s<8?(R()-.5)*26:0));}g.stroke();}
      glowDot(g,hp.x,hp.y,30,RGB(a.m.col),.8*(1-p));g.restore();},true);}},
 spore:{wind:.45,act:.4,rec:.9,
  pose(a,st,p){if(st==='wind')return {jig:.015,jigS:30,sy:1-.08*p,sx:1+.08*p};if(st==='act')return {sy:lerp(.92,1.1,eout(p)),sx:lerp(1.08,.95,eout(p))};return {sy:lerp(1.1,1,p)};},
  strike(a){const S=a.S,c=a.center(),hp=S.heroPt();for(let i=0;i<(LOWFX?12:28);i++){const tt=ri(.6,1.1);S.add({x:c.x+ri(-a.h*.3,a.h*.3),y:c.y-a.h*.3+ri(-10,10),vx:(hp.x-c.x)/tt*ri(.8,1.1),vy:ri(-40,10),ay:30,drag:.4,life:ri(1.3,1.8),size:ri(2,3.5),col:a.m.col,kind:Math.random()<.3?'glow':'dot',add:Math.random()<.3,fadeIn:.1});}
    S.later(.85,()=>S.hitHero(a,{knock:4,stun:true}));}},
 boulder:{wind:.75,act:.2,rec:.5,
  start(a){a.extra.rock=true;a.extra.drawFront=g=>{if(!a.extra.rock)return;const c=a.center(),k=a.st==='wind'?eout(a.p):1;const x=c.x+a.dir*-6,y=c.y-a.h*.45-k*18;g.save();g.translate(x,y);g.rotate(a.t);drawP(g,P0({kind:a.m.el==='ice'?'bubble':'rock',size:12*k+2,col:a.m.el==='ice'?'#eaf8ff':a.m.id==='f06'?'#b0703a':a.m.id==='b01'?'#ff7a3a':'#8a7a6a',life:9}));g.restore();};},
  pose(a,st,p){if(st==='wind')return {lean:.12*eout(p),sy:1-.06*p};if(st==='act')return {lean:lerp(.12,-.18,eout(p))};return {lean:lerp(-.18,0,eout(p))};},
  strike(a){const S=a.S,c=a.center(),hp=S.heroPt();a.extra.rock=false;const ice=a.m.el==='ice';const from={x:c.x,y:c.y-a.h*.45-18};
    const q=Object.assign(lob(S,from,hp,.65,600),{kind:'rock',r:15,col:ice?'#eaf8ff':a.m.id==='f06'?'#b0703a':a.m.id==='b01'?'#ff7a3a':'#8a7a6a'});
    q.onHit=(q,h)=>{if(h)S.hitHero(a,{knock:16,shake:8});for(let i=0;i<12;i++)S.add({x:q.x,y:q.y,vx:ri(-200,200),vy:ri(-280,-80),ay:800,life:.7,size:ri(2,5),col:q.col,kind:ice?'shard':'rock'});dustAt(S,q.x,S.gy,6);};S.proj.push(q);}},
 crystal:{wind:.5,act:.9,rec:.4,
  pose(a,st,p){if(st==='wind')return {ty:-Math.sin(p*Math.PI)*a.h*.12,sy:p>.8?.85:1.06};if(st==='act')return {sy:lerp(.88,1,p)};return {};},
  strike(a){const S=a.S,x0=a.x,hp=S.heroPt(),col=a.m.col,n=6;S.shake=5;
    for(let i=0;i<n;i++){const x=lerp(x0-a.w()*.3,hp.x,(i+1)/n),hh=18+i*5;S.later(i*.1,()=>{S.draw2(.7,(g,p)=>{const k=p<.25?eback(p/.25):1,al=p>.7?1-(p-.7)/.3:1;g.save();g.globalAlpha=al;g.translate(x,S.gy+2);
      for(const[dx,s,r]of[[-6,.7,-.25],[0,1,0],[7,.6,.3]]){g.save();g.translate(dx,0);g.rotate(r);g.scale(1,k);const gr=g.createLinearGradient(-6,0,6,0);gr.addColorStop(0,'#ffffff');gr.addColorStop(.4,col);gr.addColorStop(1,'rgba(40,30,80,.9)');g.fillStyle=gr;g.beginPath();g.moveTo(-5*s,0);g.lineTo(0,-hh*s);g.lineTo(5*s,0);g.closePath();g.fill();g.restore();}g.restore();});
      for(let j=0;j<4;j++)S.add({x,y:S.gy-6,vx:ri(-80,80),vy:ri(-200,-80),ay:600,life:.5,size:3,col,kind:'shard',rot:ri(0,TAU)});
      if(i===n-1)S.hitHero(a,{knock:12,lift:14});});}}},
 whirl:{wind:.3,act:1.1,rec:.7,
  tick(a,st,p,dt){if(st==='act'&&Math.random()<dt*40){const c=a.center(),an=ri(0,TAU),e=elemKind(a);a.S.add({x:c.x+Math.cos(an)*a.h*.6,y:c.y+Math.sin(an)*a.h*.3,vx:-Math.sin(an)*220,vy:Math.cos(an)*60-40,life:.45,size:e==='ice'?3:3.5,col:e==='ice'?'#eaf8ff':e==='sand'?'#e0c080':e==='plant'?'#7ad04a':a.m.col,kind:e==='plant'?'leaf':e==='ice'?'shard':'dot',rot:an});}},
  pose(a,st,p){const hp=a.S.heroPt();if(st==='wind')return {sy:1-.08*p,lean:.05};if(st==='act'){a.x=lerp(a.home,towardHero(a,.8),eio(Math.min(1,p*1.4)));return {sx:Math.cos(p*TAU*4),ty:-Math.sin(p*Math.PI)*12,tx:0};}
    a.x=lerp(towardHero(a,.8),a.home,eout(p));return {rot:Math.sin(p*20)*.12*(1-p),tx:0};},
  start(a){const S=a.S;S.draw2(a.atk.wind+a.atk.act,(g,p)=>{if(a.st!=='act')return;const c=a.center();g.save();g.globalCompositeOperation='lighter';g.strokeStyle=glowCol(a,.55);g.lineWidth=3;
    for(let i=0;i<4;i++){g.beginPath();g.ellipse(c.x,c.y+a.h*.2-i*a.h*.18,a.h*(.65-i*.08),a.h*.12,0,S.time*12+i,S.time*12+i+4);g.stroke();}g.restore();});},
  strike(a){a.S.later(.45,()=>a.S.hitHero(a,{knock:18,lift:12}));}},
 claw:{wind:.4,act:.24,rec:.5,
  pose(a,st,p){if(st==='wind')return {lean:.15*eout(p),sy:1+.08*eout(p)};if(st==='act'){a.x=lerp(a.home,towardHero(a,.55),eout(p));return {lean:-.22,sy:.96,tx:0};}a.x=lerp(towardHero(a,.55),a.home,eout(p));return {lean:lerp(-.22,0,eout(p)),tx:0};},
  strike(a){const S=a.S;S.later(.14,()=>{const hp=S.heroPt();S.hitHero(a,{knock:12});S.draw2(.45,(g,p)=>{g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
      for(let i=0;i<3;i++){const k=clamp01(p*3-i*.25),o=(i-1)*12;g.beginPath();g.moveTo(hp.x+22+o,hp.y-32);g.lineTo(lerp(hp.x+22+o,hp.x-20+o,eout(k)),lerp(hp.y-32,hp.y+26,eout(k)));g.strokeStyle=glowCol(a,.7*(1-p));g.lineWidth=12;g.stroke();g.strokeStyle=`rgba(255,255,255,${1-p})`;g.lineWidth=3.5;g.stroke();}g.restore();},true);});}},
 feathers:{wind:.45,act:.6,rec:.4,
  pose(a,st,p){if(st==='wind')return {breath:.06*p,sx:1+.06*p,lean:.06*p};if(st==='act')return {lean:-.05+Math.sin(a.stT*30)*.03};return {};},
  strike(a){const S=a.S,e=elemKind(a),kind=e==='plant'||a.m.id==='s15'?'leaf':e==='ice'||e==='crystal'?'shard':'feather';
    for(let i=0;i<5;i++)S.later(i*.1,()=>{const c=a.center(),hp=S.heroPt(),an=Math.atan2(hp.y-c.y,hp.x-c.x)+ri(-.08,.08);S.proj.push({x:c.x+a.dir*a.w()*.2,y:c.y-a.h*.1,vx:Math.cos(an)*430,vy:Math.sin(an)*430,kind,r:9,col:i%2?a.m.col:'#ffffff',vr:kind==='leaf'?14:0,trail:{kind:'glow',size:6,col:glowCol(a,.45),life:.15},rot:kind==='leaf'?0:an,
      onHit:(q,h)=>{if(h&&!a._fh){a._fh=1;S.hitHero(a,{knock:8});setTimeout(()=>a._fh=0,300);}S.add({x:q.x,y:q.y,vx:ri(-60,60),vy:-80,ay:200,life:.6,size:4,col:q.col,kind,rot:ri(0,TAU),vr:6});}});});}},
 bubble:{wind:.45,act:.5,rec:.5,
  pose(a,st,p){if(st==='wind')return {sx:1+.08*p,sy:1+.06*p};if(st==='act')return {lean:-.06,sy:lerp(1.06,.97,p)};return {};},
  strike(a){const S=a.S;for(let i=0;i<4;i++)S.later(i*.12,()=>{const m=a.mouth(),hp=S.heroPt(),tt=ri(.9,1.2);S.proj.push({x:m.x,y:m.y,vx:(hp.x-m.x)/tt,vy:(hp.y-m.y)/tt-10,wob:8,wa:60,kind:'bubble',r:ri(7,11),col:a.m.col,rot:0,
    onHit:(q,h)=>{if(h&&!a._bh){a._bh=1;S.hitHero(a,{knock:6});setTimeout(()=>a._bh=0,300);}S.add({x:q.x,y:q.y,kind:'ring',size:q.r,grow:60,life:.25,col:'rgba(255,255,255,.9)',lw:2});for(let k=0;k<6;k++)S.add({x:q.x,y:q.y,vx:ri(-80,80),vy:ri(-80,40),life:.3,size:1.5,col:'#fff',kind:'dot'});}});});}},
 lure:{wind:1.0,act:.28,rec:.6,noWarn:true,
  tick(a,st,p,dt){if(st==='wind'){a._lr=(a._lr||0)+dt;if(a._lr>.22){a._lr=0;const m=a.mouth(),hp=a.S.heroPt();a.S.add({x:m.x,y:m.y,vx:(hp.x-m.x)*1.4,vy:(hp.y-m.y)*1.4,kind:'ring',size:5,grow:26,life:.7,col:glowCol(a,.85),lw:2.5});}a.S.hero.pull=lerp(a.S.hero.pull,-a.dir*18*p,.1);}},
  start(a){const S=a.S;S.draw2(a.atk.wind,(g,p)=>{const m=a.mouth();g.save();g.globalCompositeOperation='lighter';glowDot(g,m.x,m.y,14+Math.sin(S.time*10)*5,RGB(a.m.col),.85);g.restore();},true);S.later(.5,()=>{S.hero.stun=1.2;});},
  pose(a,st,p){if(st==='wind')return {sy:1+.03*Math.sin(a.t*6),lean:.03*Math.sin(a.t*3)};if(st==='act'){a.x=lerp(a.home,towardHero(a,.6),eout(p));return {lean:-.24,tx:0};}a.x=lerp(towardHero(a,.6),a.home,eout(p));return {lean:lerp(-.2,0,p),tx:0};},
  recover(a){a.S.hitHero(a,{knock:14});}},
 icicle:{wind:.65,act:.8,rec:.4,
  tick(a,st,p,dt){if(st==='wind'&&Math.random()<dt*25){const c=a.center();a.S.add({x:c.x+ri(-20,20),y:c.y-a.h*.4,vy:-50,life:.5,size:2.5,col:'#eaf8ff',kind:'star',add:true});}},
  pose(a,st,p){if(st==='wind')return {lean:.1*p,jig:.012,jigS:50};if(st==='act')return {sy:1.04};return {};},
  start(a){const S=a.S;S.draw2(a.atk.wind+a.atk.act,(g,p)=>{const hp=S.heroPt();g.save();g.fillStyle='rgba(10,20,50,.35)';for(let i=0;i<4;i++){g.beginPath();g.ellipse(hp.x-30+i*20,S.gy+1,4+p*9,2+p*3,0,0,TAU);g.fill();}g.restore();});},
  strike(a){const S=a.S;for(let i=0;i<4;i++)S.later(i*.13,()=>{const hp=S.heroPt();S.proj.push({x:hp.x-30+i*20,y:-10,vx:0,vy:200,g:1400,kind:'shard',r:15,col:'#dff6ff',rot:Math.PI/2,trail:{kind:'glow',size:7,col:'rgba(200,240,255,.6)',life:.15},
    onHit:(q,h)=>{if(Math.abs(q.x-S.heroPt().x)<16)S.hitHero(a,{knock:6});for(let k=0;k<8;k++)S.add({x:q.x,y:S.gy-4,vx:ri(-140,140),vy:ri(-220,-60),ay:700,life:.5,size:3,col:'#eaf8ff',kind:'shard',rot:ri(0,TAU),vr:10});}});});}},
 vine:{wind:.6,act:1.0,rec:.4,
  tick(a,st,p,dt){if(st==='wind'&&Math.random()<dt*20){const x=lerp(a.x,a.S.heroPt().x,p);a.S.add({x:x+ri(-6,6),y:a.S.gy,vx:ri(-30,30),vy:ri(-90,-40),ay:300,life:.4,size:2,col:'#6a4a2a',kind:'rock'});}},
  pose(a,st,p){if(st==='wind')return {sy:1-.05*p,breath:.04*p};if(st==='act')return {lean:-.05,sy:1.02};return {};},
  strike(a){const S=a.S,col=a.m.el==='toy'?a.m.col:a.m.el==='water'?a.m.col:'#4aa83a';S.later(.35,()=>S.hitHero(a,{knock:0,stun:true}));
    S.draw2(1.0,(g,p)=>{const hp=S.heroPt(),k=p<.7?eout(p/.7):1-(p-.7)/.3*1;g.save();g.lineCap='round';
      for(let i=0;i<3;i++){const x0=hp.x-20+i*20,sgn=i%2?1:-1,hh=78*k;g.strokeStyle='#1f4a1a';g.lineWidth=11-i*2;g.beginPath();g.moveTo(x0,S.gy);g.bezierCurveTo(x0+sgn*26,S.gy-hh*.35,x0-sgn*26,S.gy-hh*.7,x0+sgn*8,S.gy-hh);g.stroke();g.strokeStyle=col;g.lineWidth=8-i*2;g.beginPath();g.moveTo(x0,S.gy);g.bezierCurveTo(x0+sgn*26,S.gy-hh*.35,x0-sgn*26,S.gy-hh*.7,x0+sgn*8,S.gy-hh);g.stroke();
        if(k>.4){drawP(g,P0({x:x0+sgn*14,y:S.gy-hh*.5,kind:'leaf',size:8,col:'#7ad04a',life:9,rot:sgn}));}}g.restore();},true);}},
 bounce:{wind:.45,act:.9,rec:.7,
  pose(a,st,p){const S=a.S,H=S.H;if(st==='wind')return {sy:1-.25*eout(p),sx:1+.18*eout(p)};
    if(st==='act'){a.x=lerp(a.home,towardHero(a,.85),eio(p));const y=p<.55?-H*1.1*eout(p/.55):-H*1.1*(1-ein((p-.55)/.45));return {ty:y,sy:p<.9?1.15:.75,sx:p<.9?.9:1.25,tx:0};}
    a.x=lerp(towardHero(a,.85),a.home,p);return {ty:-Math.sin(p*Math.PI)*H*.2,sy:p<.12?.75:1,sx:p<.12?1.25:1,tx:0};},
  start(a){const S=a.S;S.draw2(a.atk.wind+a.atk.act,(g,p)=>{if(a.st!=='act')return;const hp=S.heroPt();g.save();g.fillStyle='rgba(10,8,30,.35)';const k=a.p;g.beginPath();g.ellipse(lerp(a.home,hp.x+a.w()*.38,k),S.gy+1,12+k*24,4+k*5,0,0,TAU);g.fill();g.restore();});},
  recover(a){const S=a.S;S.hitHero(a,{knock:10,shake:10});S.add({x:a.x,y:S.gy,kind:'ring',size:8,grow:200,life:.4,col:'rgba(255,255,255,.9)',lw:4,flat:.3});dustAt(S,a.x,S.gy,12);}},
};
/* small fixes */
CAT.forEach(m=>{m.atkCol=m.col;});
