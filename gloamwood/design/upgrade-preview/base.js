/* shared: animation loop, hero, eyes, small fx */
const DPR=Math.min(2,window.devicePixelRatio||1);
const LOOPS=[];
function addLoop(canvas,draw){const g=canvas.getContext('2d');const o={c:canvas,g,draw,t0:performance.now(),vis:true};LOOPS.push(o);return o;}
function sizeCanvas(c,w,h){c.width=w*DPR;c.height=h*DPR;c.style.aspectRatio=w+'/'+h;c.dataset.w=w;c.dataset.h=h;}
let LOWFX=false;
function tick(now){
  for(const o of LOOPS){if(!o.vis)continue;const r=o.c.getBoundingClientRect();if(r.bottom<-50||r.top>innerHeight+50||r.width===0)continue;
    const w=+o.c.dataset.w,h=+o.c.dataset.h;o.g.setTransform(DPR,0,0,DPR,0,0);o.g.clearRect(0,0,w,h);o.draw(o.g,(now-o.t0)/1000,w,h);}
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
const ease={out:t=>1-Math.pow(1-t,3),inout:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,back:t=>{const c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2);}};
function hex2(c){return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];}

/* eyes: white, coloured iris, looks at a point, blinks */
function drawEyes(g,eyes,iris,t,lookX=0,lookY=0,seed=0,angry=false){
  const blink=((t*.7+seed)%3.4)<.12;
  for(const e of eyes){
    g.save();g.translate(e.x,e.y);
    if(blink){g.strokeStyle=rgba(P.ink,.9);g.lineWidth=2;g.beginPath();g.moveTo(-e.r,0);g.quadraticCurveTo(0,e.r*.4,e.r,0);g.stroke();g.restore();continue;}
    const wg=g.createRadialGradient(-e.r*.3,-e.r*.3,1,0,0,e.r);wg.addColorStop(0,'#fff');wg.addColorStop(1,'#cfd8ea');
    g.fillStyle=wg;g.beginPath();g.arc(0,0,e.r,0,TAU);g.fill();
    const ix=clamp(lookX,-1,1)*e.r*.35,iy=clamp(lookY,-1,1)*e.r*.3;
    g.fillStyle=rgba(iris);g.beginPath();g.arc(ix,iy,e.r*.58,0,TAU);g.fill();
    g.fillStyle=rgba(P.ink);g.beginPath();g.arc(ix,iy,e.r*.3,0,TAU);g.fill();
    g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(ix-e.r*.2,iy-e.r*.22,e.r*.14,0,TAU);g.fill();
    if(angry){g.fillStyle=rgba(P.ink,.85);g.beginPath();g.moveTo(-e.r*1.2,-e.r*1.25);g.lineTo(e.r*1.1,-e.r*.55);g.lineTo(e.r*1.1,-e.r*1.3);g.closePath();g.fill();}
    g.strokeStyle=rgba(P.ink,.5);g.lineWidth=1;g.beginPath();g.arc(0,0,e.r,0,TAU);g.stroke();
    g.restore();
  }
}

/* the hero: hooded lantern-bearer (same look as the game), facing right; returns hand point */
const LOOK0={cloak:[244,246,255],scarf:[255,176,90],belt:[124,92,200],eyes:[200,255,240],hat:'none',aura:null,trim:null};
function drawHero(g,x,y,s,t,look,pose){
  look=Object.assign({},LOOK0,look||{});pose=pose||{};
  const bob=pose.run?Math.abs(Math.sin(t*12))*-2:Math.sin(t*2.4)*1.2;
  const sq=pose.sq||1;
  g.save();g.translate(x,y);g.scale(s*(pose.flip?-1:1)/sq,s*sq);
  if(look.aura){const a=g.createRadialGradient(0,-24,4,0,-24,46);a.addColorStop(0,rgba(look.aura,.38));a.addColorStop(1,rgba(look.aura,0));g.fillStyle=a;g.beginPath();g.arc(0,-24,46,0,TAU);g.fill();}
  // shadow
  g.fillStyle='rgba(10,8,30,.35)';g.beginPath();g.ellipse(0,1,15,3.5,0,0,TAU);g.fill();
  g.translate(0,bob);
  // scarf tail
  const sw=Math.sin(t*6)*3;
  g.fillStyle=rgba(tone(look.scarf,-.15));g.beginPath();g.moveTo(-8,-21);g.quadraticCurveTo(-20,-22+sw,-27,-15+sw*1.4);g.lineTo(-24,-12+sw);g.quadraticCurveTo(-17,-17+sw*.5,-8,-16);g.closePath();g.fill();
  // feet
  const st=pose.run?Math.sin(t*12)*3:0;
  g.fillStyle=rgba(tone(look.cloak,-.55));g.beginPath();g.ellipse(-5+st,-1,4.5,2.6,0,0,TAU);g.ellipse(6-st,-1,4.5,2.6,0,0,TAU);g.fill();
  // cloak body (bell) + hood
  const cg=g.createLinearGradient(-14,-44,14,0);cg.addColorStop(0,rgba(tone(look.cloak,.25)));cg.addColorStop(1,rgba(tone(look.cloak,-.22)));
  g.fillStyle=cg;g.beginPath();g.moveTo(-14,-2);g.quadraticCurveTo(-15,-20,-11,-30);g.quadraticCurveTo(-6,-45,4,-44);g.quadraticCurveTo(14,-42,14,-28);g.quadraticCurveTo(15,-14,14,-2);g.quadraticCurveTo(0,1,-14,-2);g.closePath();g.fill();
  // hood tip
  g.beginPath();g.moveTo(-9,-38);g.quadraticCurveTo(-18,-44,-21,-36+Math.sin(t*3)*1.5);g.quadraticCurveTo(-14,-36,-11,-31);g.fill();
  if(look.trim){g.strokeStyle=rgba(look.trim);g.lineWidth=1.6;g.beginPath();g.moveTo(-14,-3);g.quadraticCurveTo(0,0,14,-3);g.stroke();}
  // belt / scarf wrap
  g.fillStyle=rgba(look.belt);g.fillRect(-14,-14,28,3.2);
  g.fillStyle=rgba(look.scarf);g.beginPath();g.moveTo(-12,-22);g.quadraticCurveTo(1,-18,13,-22);g.lineTo(13,-17.5);g.quadraticCurveTo(1,-14,-12,-17.5);g.closePath();g.fill();
  // face
  g.fillStyle=rgba(P.ink);g.beginPath();g.ellipse(4,-31,8.5,6.6,0,0,TAU);g.fill();
  const bl=((t*.6)%3.1)<.1;g.fillStyle=rgba(look.eyes);
  if(bl){g.fillRect(-.5,-31,4,1.2);g.fillRect(6,-31,4,1.2);}else{g.beginPath();g.ellipse(1.6,-31,1.9,2.6,0,0,TAU);g.ellipse(8,-31,1.9,2.6,0,0,TAU);g.fill();}
  // hats
  if(look.hat==='crown'){g.fillStyle='#ffd35c';g.beginPath();g.moveTo(-5,-42);g.lineTo(-4,-50);g.lineTo(0,-45);g.lineTo(3,-52);g.lineTo(6,-45);g.lineTo(10,-50);g.lineTo(10,-42);g.closePath();g.fill();g.fillStyle='#ff5a8a';g.beginPath();g.arc(3,-45.5,1.4,0,TAU);g.fill();}
  if(look.hat==='horns'){g.fillStyle='#e8d3a8';for(const k of[-1,1]){g.beginPath();g.moveTo(3+k*7,-41);g.quadraticCurveTo(3+k*14,-46,3+k*12,-53);g.quadraticCurveTo(3+k*9,-46,3+k*4,-42);g.fill();}}
  if(look.hat==='witch'){g.fillStyle=rgba(tone(look.cloak,-.6));g.beginPath();g.ellipse(3,-42,14,3,0,0,TAU);g.fill();g.beginPath();g.moveTo(-5,-43);g.quadraticCurveTo(2,-58,12,-64);g.quadraticCurveTo(8,-54,11,-43);g.fill();g.fillStyle=rgba(look.scarf);g.fillRect(-5,-46,16,2.5);}
  if(look.hat==='antlers'){g.strokeStyle='#c99a62';g.lineWidth=2;g.lineCap='round';for(const k of[-1,1]){g.beginPath();g.moveTo(3+k*5,-42);g.lineTo(3+k*10,-54);g.moveTo(3+k*8,-50);g.lineTo(3+k*14,-53);g.moveTo(3+k*9,-46);g.lineTo(3+k*4,-51);g.stroke();}}
  if(look.hat==='halo'){g.strokeStyle='#ffe9a0';g.lineWidth=2;g.beginPath();g.ellipse(3,-52+Math.sin(t*3),9,2.6,0,0,TAU);g.stroke();}
  if(look.hat==='frost'){g.fillStyle='#dff6ff';for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.38;g.beginPath();g.moveTo(3+Math.cos(a)*7,-38+Math.sin(a)*7);g.lineTo(3+Math.cos(a)*16,-38+Math.sin(a)*16);g.lineTo(3+Math.cos(a+.18)*7,-38+Math.sin(a+.18)*7);g.fill();}}
  if(look.hat==='leaf'){g.fillStyle='#6fd36a';for(const k of[-1,1]){g.beginPath();g.ellipse(3+k*5,-46,3,7,k*.6,0,TAU);g.fill();}}
  if(look.hat==='void'){g.fillStyle='rgba(150,90,255,.85)';for(let i=0;i<3;i++){g.beginPath();g.arc(-8+i*10,-50+Math.sin(t*3+i)*2,2.2,0,TAU);g.fill();}}
  // arm / hand
  const hx=11,hy=-15;g.fillStyle=rgba(tone(look.cloak,-.1));g.beginPath();g.ellipse(hx,hy,3.6,3.2,0,0,TAU);g.fill();
  g.restore();
  return {x:x+(pose.flip?-hx:hx)*s,y:y+(hy+bob)*s};
}

/* training dummy monster (small brute) for weapon scenes */
let DUMMY=null;
function dummyCanvas(){if(DUMMY)return DUMMY;DUMMY=paintMonster(MON_SPECS.find(m=>m.id==='bruteTest'));return DUMMY;}

/* floating damage numbers + particles for scenes */
function popNum(g,x,y,txt,age,col){if(age<0||age>.8)return;const k=ease.out(Math.min(1,age/.8));g.save();g.globalAlpha=1-Math.max(0,(age-.5)/.3);g.font='900 '+(14+6*(1-k))+'px Nunito,system-ui';g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(16,19,40,.9)';g.strokeText(txt,x,y-k*22);g.fillStyle=col||'#fff';g.fillText(txt,x,y-k*22);g.restore();}
function burst(g,x,y,age,col,n,spd,seed,shape){if(age<0||age>.6)return;const R=rng(seed||7);const k=age/.6;
  for(let i=0;i<(LOWFX?Math.ceil(n/3):n);i++){const a=R()*TAU,v=spd*(.4+R()*.8);const px=x+Math.cos(a)*v*k,py=y+Math.sin(a)*v*k+k*k*20;g.globalAlpha=1-k;g.fillStyle=col;
    if(shape==='streak'){g.strokeStyle=col;g.lineWidth=2;g.beginPath();g.moveTo(px,py);g.lineTo(px-Math.cos(a)*8*(1-k),py-Math.sin(a)*8*(1-k));g.stroke();}
    else{g.beginPath();g.arc(px,py,2.2*(1-k*.6),0,TAU);g.fill();}}
  g.globalAlpha=1;}
function glowDot(g,x,y,r,col,a){const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,rgba(col,a));gr.addColorStop(1,rgba(col,0));g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
function ground(g,w,h,y,col){const gr=g.createLinearGradient(0,y,0,h);gr.addColorStop(0,rgba(col||[70,48,110]));gr.addColorStop(1,rgba(P.ink));g.fillStyle=gr;g.fillRect(0,y,w,h-y);
  g.strokeStyle='rgba(120,230,210,.55)';g.lineWidth=1.2;for(let x=2;x<w;x+=4){g.beginPath();g.moveTo(x,y+1);g.lineTo(x+1.5,y-3-(x*7%5));g.stroke();}}
function sceneBg(g,w,h,top,bot){const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,top||'#2a2152');gr.addColorStop(1,bot||'#120e2c');g.fillStyle=gr;g.fillRect(0,0,w,h);}
