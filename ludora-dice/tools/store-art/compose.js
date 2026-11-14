const {chromium}=require('playwright');const fs=require('fs');
const base=`<meta charset="utf-8"><link rel="stylesheet" href="fonts.css"><style>
*{box-sizing:border-box;margin:0}
html,body{width:1080px;height:1920px;overflow:hidden}
body{font-family:'Baloo 2',sans-serif;background:var(--bg);position:relative}
.rays{position:absolute;inset:-400px;background:repeating-conic-gradient(from 0deg at 50% 38%,rgba(255,255,255,.07) 0 6deg,transparent 6deg 15deg);}
.glow{position:absolute;left:50%;top:40%;width:1300px;height:1300px;translate:-50% -50%;background:radial-gradient(circle,rgba(255,255,255,.28),transparent 62%)}
.dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.35) 2px,transparent 3px);background-size:46px 46px;opacity:.25;mask:linear-gradient(#000,transparent 40%)}
h1{position:absolute;left:0;right:0;top:80px;text-align:center;white-space:nowrap;font-weight:800;font-size:112px;line-height:1;color:#fff;letter-spacing:1px;
 text-shadow:0 6px 0 rgba(0,0,0,.28),0 0 2px #1a1240;-webkit-text-stroke:3px #1a1240;paint-order:stroke fill}
h1 em{font-style:normal;color:#ffd84a}
h2{position:absolute;left:60px;right:60px;top:206px;text-align:center;font-family:Nunito,sans-serif;font-weight:800;font-size:42px;line-height:1.2;color:#fff;opacity:.95;text-shadow:0 3px 8px rgba(0,0,0,.35)}
.phone{position:absolute;left:50%;top:330px;translate:-50% 0;width:780px;height:1600px;border-radius:84px;background:#0e0b22;padding:22px;
 box-shadow:0 0 0 6px rgba(255,255,255,.85),0 40px 80px rgba(0,0,0,.45)}
.phone img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:64px;display:block}
.tag{position:absolute;z-index:3;font-family:Nunito;font-weight:900;color:#fff;font-size:34px;padding:12px 26px;border-radius:999px;border:4px solid #fff;box-shadow:0 8px 20px rgba(0,0,0,.35)}
.deco{position:absolute;z-index:3;filter:drop-shadow(0 18px 24px rgba(0,0,0,.45))}
</style>`;
const T={blue:'linear-gradient(160deg,#4c7dff,#3a2bd6 55%,#24127a)',lava:'linear-gradient(160deg,#ff9a3c,#e2401c 50%,#6d0f1a)',purple:'linear-gradient(160deg,#c45cff,#7b2fe0 50%,#33106e)',green:'linear-gradient(160deg,#4fe08a,#14a66a 50%,#0b4f4a)',gold:'linear-gradient(160deg,#ffd54a,#ff9a1f 50%,#b4410d)',pink:'linear-gradient(160deg,#ff8ac8,#ff4f9a 50%,#8a1660)',teal:'linear-gradient(160deg,#4fd8ff,#1f8ce0 50%,#16337a)',night:'linear-gradient(160deg,#5b5bd6,#2a1f78 55%,#0f0b33)'};
function page(bg,h1,h2,inner){return base+`<body style="--bg:${T[bg]}"><div class="glow"></div><div class="rays"></div><div class="dots"></div><h1><span>${h1}</span></h1><h2>${h2}</h2>${inner}<script>var h=document.querySelector('h1'),sp=h.firstChild,f=118;h.style.fontSize=f+'px';while(sp.offsetWidth>1000&&f>60){f-=2;h.style.fontSize=f+'px';}var g=document.querySelector('h2');if(g.offsetHeight>60)g.style.fontSize='36px';</script></body>`;}
const phone=src=>`<div class="phone"><img src="${src}"></div>`;
const S=[
 ['01-roll-race-win','lava','ROLL. RACE. <em>WIN!</em>','Classic ludo on stunning boards',phone('g_lava.png')+`<img class="deco" src="die_white.png" style="width:300px;left:-30px;top:1380px;rotate:-14deg"><img class="deco" src="die_gold.png" style="width:240px;right:-10px;top:1520px;rotate:12deg">`],
 ['02-play-your-way','blue','PLAY <em>YOUR WAY</em>','Online · Vs Computer · Team 2 vs 2 · Pass &amp; Play',phone('home.png')],
 ['03-boards','purple','<em>36</em> AMAZING BOARDS','Lava, Ocean, Dragon, Cyber, Haunted and more',`<div style="position:absolute;left:40px;right:40px;top:330px;display:grid;grid-template-columns:1fr 1fr;gap:34px">${['g_ocean','g_dragon','g_cyber','g_halloween'].map((g,i)=>`<div style="height:775px;border-radius:44px;overflow:hidden;border:6px solid #fff;box-shadow:0 24px 40px rgba(0,0,0,.4);rotate:${[-2,2,2,-2][i]}deg"><img src="${g}.png" style="width:100%;height:100%;object-fit:cover;object-position:50% 40%"></div>`).join('')}</div>`],
 ['04-easy-to-expert','green','EASY TO <em>EXPERT</em>','Smart computer players. The dice is always fair.',phone('setup_cpu.png')+`<div class="tag" style="background:#ff4f5e;right:70px;top:470px;rotate:6deg">NEW: Hard &amp; Expert</div>`],
 ['05-collect','pink','COLLECT <em>&amp; CUSTOMISE</em>','44 pawn sets · 30 dice · 27 frames',phone('store_Dice.png')+`<img class="deco" src="die_gold.png" style="width:230px;left:-20px;top:1500px;rotate:-10deg">`],
 ['06-chests','gold','WIN <em style="color:#fff3a0">TREASURE</em> CHESTS','Iron, Silver, Gold and the rare Crystal chest',phone('chest.png')],
 ['07-your-turn','teal','NEVER MISS <em>YOUR TURN</em>','Clear turn marker, countdown and auto play',phone('g_candy.png')+`<div class="tag" style="background:#1e9e34;left:60px;top:1560px;rotate:-5deg">YOUR TURN ✓</div><div class="tag" style="background:#f5a40e;color:#5a3000;right:60px;top:1420px;rotate:5deg">🎲 ROLL AGAIN!</div>`],
 ['08-fair-play','night','FAIR PLAY, <em>ALWAYS</em>','No pay-to-win. Ads only when you choose.',phone('fair.png')],
 //['09-make-it-yours','blue','MAKE IT <em>YOURS</em>','Pictures, frames, flags and colours',phone('profile.png')],
];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});fs.mkdirSync('out',{recursive:true});
for(const [n,bg,a,c,inner] of S){fs.writeFileSync('_c.html',page(bg,a,c,inner));await p.goto('http://localhost:8765/ss14/_c.html?'+n);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);await p.screenshot({path:'out/'+n+'.png'});}
await b.close();})();
