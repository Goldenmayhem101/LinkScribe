// framed store screenshots. node compose.js phone|tablet
const {chromium}=require('playwright');const fs=require('fs');
const MODE=process.argv[2]||'phone';const TAB=MODE==='tablet';
const W=TAB?1600:1080,H=TAB?2560:1920,k=TAB?1.45:1;
const RAW='raw_'+MODE+'/';
// device box
const DW=TAB?1240:780,DH=TAB?1984:1600,DT=TAB?470:330,R=TAB?70:84,PAD=TAB?26:22;
const base=`<meta charset="utf-8"><link rel="stylesheet" href="fonts.css"><style>
*{box-sizing:border-box;margin:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{font-family:'Baloo 2',sans-serif;background:var(--bg);position:relative}
.rays{position:absolute;inset:-600px;background:repeating-conic-gradient(from 0deg at 50% 38%,rgba(255,255,255,.07) 0 6deg,transparent 6deg 15deg);}
.glow{position:absolute;left:50%;top:40%;width:${1300*k}px;height:${1300*k}px;translate:-50% -50%;background:radial-gradient(circle,rgba(255,255,255,.28),transparent 62%)}
.dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.35) 2px,transparent 3px);background-size:46px 46px;opacity:.25;mask:linear-gradient(#000,transparent 40%)}
h1{position:absolute;left:0;right:0;top:${80*k}px;text-align:center;white-space:nowrap;font-weight:800;line-height:1;color:#fff;letter-spacing:1px;
 text-shadow:0 6px 0 rgba(0,0,0,.28),0 0 2px #1a1240;-webkit-text-stroke:${3*k}px #1a1240;paint-order:stroke fill}
h1 em{font-style:normal;color:#ffd84a}
h2{position:absolute;left:60px;right:60px;top:${206*k}px;text-align:center;font-family:Nunito,sans-serif;font-weight:800;font-size:${42*k}px;line-height:1.2;color:#fff;opacity:.95;text-shadow:0 3px 8px rgba(0,0,0,.35)}
.phone{position:absolute;left:50%;top:${DT}px;translate:-50% 0;width:${DW}px;height:${DH}px;border-radius:${R}px;background:#0e0b22;padding:${PAD}px;
 box-shadow:0 0 0 ${6*k}px rgba(255,255,255,.85),0 40px 80px rgba(0,0,0,.45)}
.phone img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:${R-20}px;display:block}
.tag{position:absolute;z-index:3;font-family:Nunito;font-weight:900;color:#fff;font-size:${34*k}px;padding:${12*k}px ${26*k}px;border-radius:999px;border:${4*k}px solid #fff;box-shadow:0 8px 20px rgba(0,0,0,.35)}
.deco{position:absolute;z-index:3;filter:drop-shadow(0 18px 24px rgba(0,0,0,.45))}
.grid{position:absolute;left:${40*k}px;right:${40*k}px;top:${DT}px;display:grid;grid-template-columns:1fr 1fr;gap:${34*k}px}
.grid div{height:${(H-DT-60*k)/2-17*k}px;border-radius:${44*k}px;overflow:hidden;border:${6*k}px solid #fff;box-shadow:0 24px 40px rgba(0,0,0,.4)}
.grid img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
</style>`;
const T={blue:'linear-gradient(160deg,#4c7dff,#3a2bd6 55%,#24127a)',lava:'linear-gradient(160deg,#ff9a3c,#e2401c 50%,#6d0f1a)',purple:'linear-gradient(160deg,#c45cff,#7b2fe0 50%,#33106e)',green:'linear-gradient(160deg,#4fe08a,#14a66a 50%,#0b4f4a)',gold:'linear-gradient(160deg,#ffd54a,#ff9a1f 50%,#b4410d)',pink:'linear-gradient(160deg,#ff8ac8,#ff4f9a 50%,#8a1660)',teal:'linear-gradient(160deg,#4fd8ff,#1f8ce0 50%,#16337a)',night:'linear-gradient(160deg,#5b5bd6,#2a1f78 55%,#0f0b33)'};
function page(bg,h1,h2,inner){return base+`<body style="--bg:${T[bg]}"><div class="glow"></div><div class="rays"></div><div class="dots"></div><h1><span>${h1}</span></h1><h2>${h2}</h2>${inner}<script>var h=document.querySelector('h1'),sp=h.firstChild,f=${118*k};h.style.fontSize=f+'px';while(sp.offsetWidth>${W-80}&&f>60){f-=2;h.style.fontSize=f+'px';}<\/script>`;}
const phone=src=>`<div class="phone"><img src="${RAW}${src}.png"></div>`;
const grid=a=>`<div class="grid">${a.map((g,i)=>`<div style="rotate:${i%2?2:-2}deg"><img src="${RAW}${g}.png"></div>`).join('')}</div>`;
const d=(src,w,css)=>`<img class="deco" src="${src}" style="width:${w*k}px;${css}">`;
const S=[
 ['01-roll-race-win','lava','ROLL. RACE. <em>WIN!</em>','Classic ludo on stunning boards',phone('g_lava')+d('die_fire.png',250,`left:${-10*k}px;top:${H-560*k}px;rotate:-14deg`)+d('die_gold.png',220,`right:${0}px;top:${H-420*k}px;rotate:12deg`)],
 ['02-finishing-moves','night','<em>LEGENDARY</em> MOVES','Each Legendary hero has its own finisher',phone('g_finish')+`<div class="tag" style="background:#ff7a1a;right:${60*k}px;top:${DT+150*k}px;rotate:6deg">BOOM! 💥</div>`],
 ['03-boards','purple','<em>40+</em> AMAZING BOARDS','Sakura, Ocean, Dragon, Frost and many more',grid(['g_sakura','g_ocean','g_dragon','g_frost'])],
 ['04-play-your-way','blue','PLAY <em>YOUR WAY</em>','Vs Computer · Team 2 vs 2 · Pass &amp; Play',phone('home')],
 ['05-collect-heroes','gold','<em style="color:#fff3a0">100+</em> HEROES','Cute, Epic and Legendary heroes to collect',phone('store_pawns')],
 ['06-dice','pink','EPIC <em>&amp;</em> LEGENDARY DICE','94 dice, Legendary ones with guardians',phone('store_dice')+d('die_fire.png',230,`left:${-20*k}px;top:${H-520*k}px;rotate:-10deg`)],
 ['07-weekly-events','teal','WEEKLY <em>EVENTS</em>','Win prizes you keep forever',phone('store_offers')],
 ['09-fair-dice','teal','<em>FAIR DICE</em> FOR ALL','Every roll is pure chance. The best player wins.',phone('g_ocean')+d('die_w.png',230,`left:${-10*k}px;top:${H-560*k}px;rotate:-14deg`)+d('die_g.png',210,`right:${0}px;top:${H-420*k}px;rotate:12deg`)],
 ['08-easy-to-expert','green','EASY TO <em>EXPERT</em>','Smart computer players. The dice is always fair.',phone('setup_cpu')],
];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:W,height:H}});const OUT='out_'+MODE;fs.mkdirSync(OUT,{recursive:true});
for(const [n,bg,a,c,inner] of S.filter(x=>!process.env.ONLY||x[0]===process.env.ONLY)){fs.writeFileSync('_c.html',page(bg,a,c,inner));
 await p.goto('file://'+process.cwd()+'/_c.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);await p.screenshot({path:OUT+'/'+n+'.png'});}
await b.close();})();
