/* Gloamwood chests: 5 tiers, open animation in the world, then a window that shows what is inside */
const GCH=[
 {t:'wood',n:'Wooden Chest',where:'Along the path in every stage',items:[['coin','25 – 60 coins'],['power','1 power-up']]},
 {t:'iron',n:'Iron Chest',where:'Behind tricky jumps and on side paths',items:[['coin','60 – 120 coins'],['power','1 power-up'],['heart','Heal 30']]},
 {t:'silver',n:'Moon Silver Chest',where:'Hidden spots: secret ledges and walls',items:[['coin','120 – 250 coins'],['gem','2 – 4 moon gems'],['power','2 power-ups']]},
 {t:'gold',n:'Golden Chest',where:'After every boss',items:[['coin','300 – 600 coins'],['gem','5 – 10 moon gems'],['cloth','Chance: an outfit piece']]},
 {t:'crystal',n:'Crystal Chest',where:'Only for a 3-star stage (perfect run)',items:[['coin','800 – 1,500 coins'],['gem','15 – 30 moon gems'],['sword','Chance: a weapon look (Glowing / Legendary)']]},
];
const CIMG={};
function chestImg(t,open){const k=t+(open?1:0);if(CIMG[k])return CIMG[k];const im=new Image();im.src='data:image/svg+xml,'+encodeURIComponent(chestSvg(t,open).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="240" height="220" '));CIMG[k]=im;return im;}
function itemIcon(g,kind,x,y,s,t){g.save();g.translate(x,y);g.scale(s,s);
  if(kind==='coin'){const gr=g.createRadialGradient(-3,-3,1,0,0,9);gr.addColorStop(0,'#fff3b0');gr.addColorStop(.6,'#f5b81a');gr.addColorStop(1,'#a8680a');g.fillStyle=gr;g.beginPath();g.ellipse(0,0,9*Math.abs(Math.cos(t*4))+1.5,9,0,0,TAU);g.fill();}
  if(kind==='gem'){g.fillStyle='#8fe6ff';g.beginPath();g.moveTo(-8,-2);g.lineTo(-4,-8);g.lineTo(4,-8);g.lineTo(8,-2);g.lineTo(0,9);g.closePath();g.fill();g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1;g.beginPath();g.moveTo(-8,-2);g.lineTo(8,-2);g.moveTo(-4,-8);g.lineTo(0,-2);g.lineTo(4,-8);g.stroke();}
  if(kind==='power'){glowDot(g,0,0,14,[140,255,220],.7);g.fillStyle='#effffa';g.beginPath();for(let i=0;i<8;i++){const r=i%2?3:9;g.lineTo(Math.cos(i/8*TAU)*r,Math.sin(i/8*TAU)*r);}g.fill();}
  if(kind==='heart'){g.fillStyle='#ff5a7a';g.beginPath();g.moveTo(0,8);g.bezierCurveTo(-12,-2,-6,-12,0,-5);g.bezierCurveTo(6,-12,12,-2,0,8);g.fill();}
  if(kind==='cloth'){g.fillStyle='#c7a0ff';g.beginPath();g.moveTo(-8,-8);g.lineTo(8,-8);g.lineTo(10,8);g.lineTo(-10,8);g.closePath();g.fill();g.fillStyle='#ffd35c';g.fillRect(-8,-2,16,3);}
  if(kind==='sword'){g.rotate(Math.PI/4);g.fillStyle='#dff6ff';g.fillRect(-1.6,-12,3.2,16);g.fillStyle='#ffd35c';g.fillRect(-5,3,10,2.4);g.fillStyle='#7a4a2a';g.fillRect(-1.2,5,2.4,5);}
  g.restore();}
function chestScene(ch,state){return function(g,t,W,H){
  sceneBg(g,W,H,'#2a2156','#120e2c');
  // a few soft trees
  for(let i=0;i<4;i++){g.fillStyle=`rgba(40,90,90,${.35+i*.08})`;g.beginPath();g.arc(30+i*80,H-70-(i%2)*14,40,0,TAU);g.fill();}
  ground(g,W,H,H-30);
  const ox=W/2,oy=H-30,op=state.openAt?t-state.openAt:-1;
  const shake=op>=0&&op<.45?Math.sin(op*60)*3*(1-op/.45):(op<0?Math.sin(t*3)*.6:0);
  if(op<0){glowDot(g,ox,oy-30,50,[255,220,140],.2+Math.sin(t*3)*.08);}
  if(op>=.45){g.save();g.globalCompositeOperation='lighter';glowDot(g,ox,oy-40,90,[255,220,140],.5);g.translate(ox,oy-40);g.rotate(t*.5);for(let i=0;i<10;i++){g.rotate(TAU/10);g.fillStyle='rgba(255,230,160,.12)';g.beginPath();g.moveTo(0,0);g.lineTo(-8,-110);g.lineTo(8,-110);g.fill();}g.restore();}
  const im=chestImg(ch.t,op>=.45);if(im.complete)g.drawImage(im,ox-60+shake,oy-100,120,110);
  if(op>=.45){const k=Math.min(1,(op-.45)/.8);ch.items.forEach((it,i)=>{const a=-Math.PI/2+(i-(ch.items.length-1)/2)*.7;const ex=ox+Math.cos(a)*70*ease.back(k),ey=oy-60+Math.sin(a)*70*ease.back(k)+Math.sin(t*3+i)*3;itemIcon(g,it[0],ex,ey,1.3,t);});}
  if(op<0){g.font='800 12px Nunito,system-ui';g.textAlign='center';g.fillStyle='rgba(255,255,255,.8)';g.fillText('Tap to open',ox,oy-108+Math.sin(t*3)*2);}
};}
