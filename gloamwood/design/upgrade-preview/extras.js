/* world map, stars, game feel demo, outfits */
const WORLDS=[['Gloamwood',[60,120,110],'#2e7d73'],['Crystal Caves',[90,110,190],'#5068c8'],['Emberfen',[190,80,50],'#c45a2a'],['Frostveil',[150,200,240],'#7ab2e6'],['Verdant',[80,160,80],'#4a9a46'],['Voidreach',[90,50,150],'#6a3aa8']];
const BOSSID=['hollowhorn','prismgolem','magmaking','frostmatriarch','thornqueen','voidtyrant'];
function mapScene(){
  const WL=PLACES.slice(0,6).map(p=>[p[0],hex2(THEMES[p[1]].sky[1]),THEMES[p[1]].sky[0]]);const nodes=[];for(let w=0;w<6;w++)for(let i=0;i<5;i++){const k=w*5+i;nodes.push({w,i,boss:i===4,x:0,y:0,stars:k<8?3-(k%3===2?1:0):k<10?(k%2?1:2):0,done:k<10,cur:k===10,lock:w>2});}
  return function(g,t,W,H){
    const segH=H/6;
    for(let w=0;w<6;w++){const y0=H-(w+1)*segH;const gr=g.createLinearGradient(0,y0,0,y0+segH);const c=WL[w][1];gr.addColorStop(0,rgba(tone(c,-.35)));gr.addColorStop(1,rgba(tone(c,-.55)));g.fillStyle=gr;g.fillRect(0,y0,W,segH);
      const R=rng(w+3);for(let i=0;i<8;i++){g.fillStyle=rgba(tone(c,-.15),.5);g.beginPath();g.arc(R()*W,y0+R()*segH,10+R()*20,0,TAU);g.fill();}
      g.font='900 15px Nunito,system-ui';g.fillStyle='rgba(255,255,255,.9)';g.textAlign='left';g.fillText((w+1)+'. '+WL[w][0],10,y0+20);
      if(w>1){g.fillStyle='rgba(10,8,30,.45)';g.fillRect(0,y0,W,segH);g.font='800 12px Nunito,system-ui';g.fillStyle='#fff';g.fillText('🔒 Beat the '+WL[w-1][0]+' boss',10,y0+38);}}
    nodes.forEach((n,k)=>{const y=H-(n.w*segH)-segH*.2-(n.i/4)*segH*.62;const x=W/2+Math.sin(k*1.1)*W*.3;n.x=x;n.y=y;});
    g.lineWidth=5;g.strokeStyle='rgba(255,240,200,.35)';g.setLineDash([2,8]);g.lineCap='round';g.beginPath();nodes.forEach((n,i)=>i?g.lineTo(n.x,n.y):g.moveTo(n.x,n.y));g.stroke();g.setLineDash([]);
    nodes.forEach(n=>{const r=n.boss?16:11;if(n.cur)glowDot(g,n.x,n.y,30+Math.sin(t*4)*4,[255,230,140],.7);
      g.fillStyle=n.done?'#ffd35c':n.lock?'#4a4466':'#ffffff';g.strokeStyle='#1c1d2b';g.lineWidth=2;g.beginPath();g.arc(n.x,n.y,r,0,TAU);g.fill();g.stroke();
      g.font='900 '+(n.boss?13:8)+'px Nunito,system-ui';g.textAlign='center';g.fillStyle='#1c1d2b';g.fillText(n.boss?'👑':(n.w+1)+'-'+(n.i+1),n.x,n.y+4);
      if(n.done)for(let s=0;s<3;s++){g.fillStyle=s<n.stars?'#ffd35c':'rgba(255,255,255,.3)';g.font='11px sans-serif';g.fillText('★',n.x-11+s*11,n.y-r-3);}
      if(n.cur){const hb=Math.abs(Math.sin(t*4))*-5;drawHero(g,n.x,n.y-14+hb,.6,t,{});}});
  };
}
function starsScene(){return function(g,t,W,H){sceneBg(g,W,H,'#2a2156','#120e2c');
  const cyc=t%5;const labels=['Finish the stage','Collect every coin','Take no damage'];
  for(let i=0;i<3;i++){const at=.4+i*.55,k=clamp((cyc-at)/.35,0,1),x=W/2+(i-1)*W/3.1,y=62-(i===1?10:0);const got=i<2||cyc%10<5;
    g.save();g.translate(x,y);const s=k>0?ease.back(k)*(got?1:.9):0;g.scale(1.5,1.5);
    g.fillStyle='rgba(255,255,255,.15)';g.beginPath();for(let j=0;j<10;j++){const r=j%2?7:16;g.lineTo(Math.cos(-Math.PI/2+j/10*TAU)*r,Math.sin(-Math.PI/2+j/10*TAU)*r);}g.fill();
    if(k>0&&got){g.scale(s,s);const gr=g.createLinearGradient(0,-16,0,16);gr.addColorStop(0,'#fff3a0');gr.addColorStop(1,'#f0a010');g.fillStyle=gr;g.beginPath();for(let j=0;j<10;j++){const r=j%2?7:16;g.lineTo(Math.cos(-Math.PI/2+j/10*TAU)*r,Math.sin(-Math.PI/2+j/10*TAU)*r);}g.fill();}
    g.restore();g.font='800 11px Nunito,system-ui';g.textAlign='center';g.fillStyle=k>0&&got?'#ffe08a':'rgba(255,255,255,.6)';g.fillText(labels[i],x,y+(i===1?50:40));}
  g.font='900 16px Nunito,system-ui';g.fillStyle='#fff';g.textAlign='center';g.fillText('Stage 1-4 cleared!',W/2,H-24);};}
function feelScene(){return function(g,t,W,H){
  const cyc=t%6;sceneBg(g,W,H);ground(g,W,H,H-34);
  // coin counter
  g.fillStyle='rgba(10,8,30,.6)';g.beginPath();g.roundRect(W-90,8,80,24,12);g.fill();itemIcon(g,'coin',W-74,20,.9,t);
  const got=cyc>1.6?(cyc>2.2?3:1):0;g.font='900 14px Nunito,system-ui';g.fillStyle='#fff';g.textAlign='left';g.fillText(String(120+got*5),W-60,25);
  // hero jump + squash + dust
  let hx=60+Math.min(cyc,2)*40,hy=H-34,sq=1;if(cyc<1){hy-=Math.sin(cyc*Math.PI)*60;sq=1+(cyc<.15?(.15-cyc)*1.2:0);}else if(cyc<1.18){sq=1-.25*Math.sin((cyc-1)/.18*Math.PI);}
  if(cyc>1&&cyc<1.5){const k=(cyc-1)/.5;g.fillStyle=`rgba(200,190,230,${.5*(1-k)})`;for(const s of[-1,1]){g.beginPath();g.arc(hx+s*(8+k*24),H-36-k*4,4+k*6,0,TAU);g.fill();}}
  drawHero(g,hx,hy,1.4,t,{},{sq,run:cyc>1.2&&cyc<2});
  // coins flying to counter
  for(let i=0;i<3;i++){const st=1.1+i*.15,k=clamp((cyc-st)/.6,0,1);if(k<=0||k>=1)continue;const x0=150+i*14,y0=H-60;const x=lerp(x0,W-74,ease.inout(k)),y=lerp(y0,20,ease.inout(k))-Math.sin(k*Math.PI)*40;itemIcon(g,'coin',x,y,.9,t);}
  // monster wind-up warning, attack, combo
  const m=monOf('frostfang');const warn=cyc>2.4&&cyc<3.2;const lunge=cyc>3.2&&cyc<3.5?Math.sin((cyc-3.2)/.3*Math.PI)*-40:0;
  const mx=W-80+lunge;const hitAt=3.7;const mhit=cyc>hitAt&&cyc<hitAt+.25;drawMon(g,m,mx+(mhit?6:0),H-34,1,t,{warn,lx:-1});
  if(cyc>2.4&&cyc<3.2){g.font='800 11px Nunito,system-ui';g.fillStyle='#ffb0b0';g.textAlign='center';g.fillText('Watch out: it is about to attack',W/2+30,H-110);}
  if(cyc>hitAt-.3&&cyc<hitAt+.1){const k=(cyc-hitAt+.3)/.4;g.fillStyle=`rgba(140,255,235,${1-k})`;g.beginPath();g.arc(lerp(hx+10,mx,k),H-60,6,0,TAU);g.fill();}
  // health bar only when hit
  if(cyc>hitAt&&cyc<hitAt+1.6){g.fillStyle='rgba(10,8,30,.7)';g.fillRect(mx-22,H-96,44,6);g.fillStyle='#ff5a6a';g.fillRect(mx-22,H-96,44*(cyc>hitAt+.6?.4:.7),6);}
  popNum(g,mx,H-70,'2',cyc-hitAt,'#fff');popNum(g,mx,H-70,'2',cyc-hitAt-.6,'#fff');
  if(cyc>hitAt+.6&&cyc<hitAt+1.6){const k=(cyc-hitAt-.6);g.save();g.translate(W/2,52);g.scale(1+Math.max(0,.3-k)*2,1+Math.max(0,.3-k)*2);g.font='900 26px Nunito,system-ui';g.textAlign='center';g.fillStyle=`rgba(255,220,100,${1-k})`;g.strokeStyle=`rgba(40,20,60,${1-k})`;g.lineWidth=4;g.strokeText('COMBO x5',0,0);g.fillText('COMBO x5',0,0);g.restore();}
};}
const OUTFITS=[
 {n:'Lantern Bearer',d:'Free starter look',look:{}},
 {n:'Moon Knight',d:'Silver cloak, halo, moon gold trim',look:{cloak:[220,230,255],scarf:[120,150,255],belt:[255,210,90],hat:'halo',trim:[255,210,90],aura:[180,200,255]}},
 {n:'Ember Mage',d:'Red cloak, witch hat, fire eyes',look:{cloak:[200,70,60],scarf:[255,170,60],belt:[60,30,30],hat:'witch',eyes:[255,170,80],aura:[255,120,40]}},
 {n:'Frost Ranger',d:'Ice cloak with a frost crown',look:{cloak:[200,235,255],scarf:[120,200,255],belt:[80,120,200],hat:'frost',eyes:[160,220,255],aura:[170,230,255]}},
 {n:'Thorn Druid',d:'Moss cloak and antlers',look:{cloak:[90,140,90],scarf:[200,230,120],belt:[120,80,50],hat:'antlers',eyes:[220,255,140],aura:[150,255,120]}},
 {n:'Void Walker',d:'Night cloak with floating stars',look:{cloak:[70,50,120],scarf:[200,140,255],belt:[30,20,60],hat:'void',eyes:[230,180,255],aura:[170,110,255]}},
 {n:'Crystal Prince',d:'Pearl cloak and a crown',look:{cloak:[250,240,255],scarf:[255,140,200],belt:[120,220,255],hat:'crown',trim:[120,220,255],aura:[255,180,230]}},
 {n:'Horned Rogue',d:'Ash cloak and little horns',look:{cloak:[120,115,135],scarf:[230,60,80],belt:[40,30,50],hat:'horns',eyes:[255,90,110]}},
];
