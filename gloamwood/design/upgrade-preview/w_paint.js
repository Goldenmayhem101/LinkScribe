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
