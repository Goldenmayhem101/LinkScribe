"use strict";
const P={ink:[16,19,40],dusk:[96,66,128],moss:[46,128,120],moon:[222,242,255],ember:[255,176,90]};
const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const tone=(c,k)=>k<0?mix(c,P.ink,-k):mix(c,P.moon,k);
const rgba=(c,a=1)=>`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const TAU=Math.PI*2, clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);


function layer(w,h,s){const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w*s));c.height=Math.max(1,Math.ceil(h*s));const g=c.getContext('2d');g.setTransform(s,0,0,s,0,0);return{c,g,w,h,s};}
function radial(g,x,y,r,c,a0,a1=0){const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,rgba(c,a0));gr.addColorStop(1,rgba(c,a1));return gr;}
// rim light: stroke a shifted copy of the outline inside the shape's clip
function rim(g,path,dx,dy,col,w){g.save();path(g);g.clip();g.translate(dx,dy);path(g);g.lineWidth=w;g.strokeStyle=col;g.stroke();g.restore();}
function bumpy(g,x,y,r,R,n=12,j=.22){g.beginPath();const o=R()*TAU;for(let i=0;i<=n;i++){const a=o+i/n*TAU,a2=o+(i+.5)/n*TAU;const rr=r*(1+(R()-.5)*j);
  const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;if(i===0)g.moveTo(px,py);else{const cr=r*(1.18+R()*.12);g.quadraticCurveTo(x+Math.cos(a2-TAU/n)*cr,y+Math.sin(a2-TAU/n)*cr,px,py);}}g.closePath();}
function glowSprite(c,size=64,hard=.15){const L=layer(size,size,1);const g=L.g;const gr=g.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
  gr.addColorStop(0,rgba(tone(c,.5),1));gr.addColorStop(hard,rgba(c,.6));gr.addColorStop(.45,rgba(c,.16));gr.addColorStop(1,rgba(c,0));g.fillStyle=gr;g.fillRect(0,0,size,size);return L.c;}


function furShape(cx,cy,rx,ry,R,n=84,fur=3.2){const pts=[];for(let i=0;i<n;i++){const a=i/n*TAU;const k=1+(R()-.5)*.05;const tuft=i%2?fur*(.5+R()):0;
  const aa=a+(i%2?(Math.cos(a)>0?.05:-.05):0);pts.push([cx+Math.cos(aa)*(rx*k+tuft),cy+Math.sin(aa)*(ry*k+tuft)]);}
  return g=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();};}
function furFill(g,path,cx,cy,rx,ry,c,R,density=1){
  const gr=g.createRadialGradient(cx+rx*.35,cy-ry*.45,2,cx,cy,Math.max(rx,ry)*1.2);gr.addColorStop(0,rgba(tone(c,.38)));gr.addColorStop(.45,rgba(c));gr.addColorStop(1,rgba(tone(c,-.6)));
  g.fillStyle=gr;path(g);g.fill();
  g.save();path(g);g.clip();
  for(let i=0;i<260*density;i++){const a=R()*TAU,d=Math.sqrt(R());const x=cx+Math.cos(a)*rx*d,y=cy+Math.sin(a)*ry*d;const oa=Math.atan2(y-cy+ry*.6,x-cx)*.6+Math.PI/2*.4;const len=2.5+R()*4;
    const lit=(x-cx)/rx*.5-(y-cy)/ry*.5;g.strokeStyle=rgba(lit+R()*.6-.3>0?tone(c,.32):tone(c,-.45),.45);g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(oa)*len*.5+1,y+Math.sin(oa)*len*.5,x+Math.cos(oa)*len,y+Math.sin(oa)*len);g.stroke();}
  const ao=g.createRadialGradient(cx-rx*.2,cy+ry*.9,0,cx-rx*.2,cy+ry*.9,ry*1.1);ao.addColorStop(0,rgba(P.ink,.55));ao.addColorStop(1,rgba(P.ink,0));g.fillStyle=ao;g.fillRect(cx-rx*2,cy-ry*2,rx*4,ry*4);
  g.restore();
  rim(g,path,-2.4,2.2,rgba(P.moon,.7),3);
}
function horn(g,bx,by,dir,len,w,curl){const pts=[];for(let i=0;i<=12;i++){const t=i/12;const a=-Math.PI/2+dir*(.9-t*curl);pts.push(i?[pts[i-1][0]+Math.cos(a)*len/12,pts[i-1][1]+Math.sin(a)*len/12]:[bx,by]);}
  const L1=[],L2=[];pts.forEach((p,i)=>{const t=i/12,q=pts[Math.min(12,i+1)],pp=pts[Math.max(0,i-1)];const ang=Math.atan2(q[1]-pp[1],q[0]-pp[0])+Math.PI/2;const ww=w*(1-t)*.5+.3;L1.push([p[0]+Math.cos(ang)*ww,p[1]+Math.sin(ang)*ww]);L2.push([p[0]-Math.cos(ang)*ww,p[1]-Math.sin(ang)*ww]);});
  const path=gg=>{gg.beginPath();L1.forEach((p,i)=>i?gg.lineTo(p[0],p[1]):gg.moveTo(p[0],p[1]));for(let i=L2.length-1;i>=0;i--)gg.lineTo(L2[i][0],L2[i][1]);gg.closePath();};
  const gr=g.createLinearGradient(bx,by,pts[12][0],pts[12][1]);gr.addColorStop(0,rgba(tone(P.ember,-.35)));gr.addColorStop(.5,rgba(mix(P.ember,P.moon,.45)));gr.addColorStop(1,rgba(tone(P.moon,.4)));
  g.fillStyle=gr;path(g);g.fill();g.save();path(g);g.clip();g.strokeStyle=rgba(tone(P.ember,-.5),.5);g.lineWidth=1;for(let i=1;i<6;i++){const p=pts[i*2],q=L1[i*2],r2=L2[i*2];g.beginPath();g.moveTo(q[0],q[1]);g.quadraticCurveTo(p[0],p[1]+1.5,r2[0],r2[1]);g.stroke();}g.restore();
  rim(g,path,-1.2,1.2,rgba(P.moon,.7),1.6);}
function mouth(g,cx,cy,w,h,R,fangs=true){
  const path=gg=>{gg.beginPath();gg.moveTo(cx-w/2,cy);gg.quadraticCurveTo(cx,cy-h*.18,cx+w/2,cy);gg.quadraticCurveTo(cx+w*.42,cy+h*1.25,cx,cy+h*1.15);gg.quadraticCurveTo(cx-w*.42,cy+h*1.25,cx-w/2,cy);gg.closePath();};
  const gr=g.createLinearGradient(0,cy,0,cy+h);gr.addColorStop(0,'rgb(30,6,24)');gr.addColorStop(1,'rgb(84,18,46)');g.fillStyle=gr;path(g);g.fill();
  g.save();path(g);g.clip();g.fillStyle=rgba(mix(P.ember,[220,70,110],.6));g.beginPath();g.ellipse(cx+w*.05,cy+h*1.05,w*.3,h*.42,0,0,TAU);g.fill();
  g.fillStyle=rgba([255,190,200],.35);g.beginPath();g.ellipse(cx+w*.1,cy+h*.85,w*.12,h*.1,0,0,TAU);g.fill();
  const n=Math.max(4,Math.round(w/5.5));for(let i=0;i<n;i++){const t=(i+.5)/n,x=cx-w/2+t*w,y=cy-Math.sin(t*Math.PI)*h*.09;const tw=w/n*.95,th=h*(.28+R()*.18)*(i===1||i===n-2?1.5:1);
    const tg=g.createLinearGradient(0,y,0,y+th);tg.addColorStop(0,'#fffaf0');tg.addColorStop(1,rgba(mix(P.moon,P.ember,.35)));g.fillStyle=tg;g.beginPath();g.moveTo(x-tw/2,y-1);g.lineTo(x+tw/2,y-1);g.lineTo(x+tw*.1,y+th);g.closePath();g.fill();}
  if(fangs)for(const k of[-1,1]){const x=cx+k*w*.28,y=cy+h*1.12;g.fillStyle='#fff6e8';g.beginPath();g.moveTo(x-3,y+2);g.lineTo(x+3,y+2);g.lineTo(x,y-h*.45);g.closePath();g.fill();}
  g.restore();g.strokeStyle=rgba(P.ink,.7);g.lineWidth=1.4;path(g);g.stroke();
}
function limb(g,x,y,rx,ry,c,R,ang){g.save();g.translate(x,y);g.rotate(ang);const p=furShape(0,0,rx,ry,R,40,2.2);furFill(g,p,0,0,rx,ry,c,R,.25);
  for(let k=-1;k<=1;k++){g.fillStyle=rgba(tone(P.moon,.2));g.beginPath();g.moveTo(k*rx*.45-1.4,ry*.8);g.lineTo(k*rx*.45+1.4,ry*.8);g.lineTo(k*rx*.5,ry*1.25);g.fill();}g.restore();}
