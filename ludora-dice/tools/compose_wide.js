// 1:1 and 4:3 store screenshots (foldable "unfolded" slots). node compose_wide.js
const {chromium}=require('playwright');const fs=require('fs');
const T={lava:'linear-gradient(160deg,#ff9a3c,#e2401c 50%,#6d0f1a)',night:'linear-gradient(160deg,#5b5bd6,#2a1f78 55%,#0f0b33)',blue:'linear-gradient(160deg,#4c7dff,#3a2bd6 55%,#24127a)'};
function page(W,H,bg,h1,h2,shots,dh){const k=W/1600;const dw=dh*0.625;
return `<meta charset="utf-8"><link rel="stylesheet" href="fonts.css"><style>*{box-sizing:border-box;margin:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}body{font-family:'Baloo 2',sans-serif;background:${T[bg]};position:relative}
.rays{position:absolute;inset:-800px;background:repeating-conic-gradient(from 0deg at 50% 45%,rgba(255,255,255,.07) 0 6deg,transparent 6deg 15deg)}
.glow{position:absolute;left:50%;top:55%;width:${W*1.1}px;height:${W*1.1}px;translate:-50% -50%;background:radial-gradient(circle,rgba(255,255,255,.25),transparent 62%)}
h1{position:absolute;left:0;right:0;top:${70*k}px;text-align:center;white-space:nowrap;font-weight:800;line-height:1;color:#fff;font-size:${150*k}px;
 text-shadow:0 6px 0 rgba(0,0,0,.28);-webkit-text-stroke:${4*k}px #1a1240;paint-order:stroke fill}h1 em{font-style:normal;color:#ffd84a}
h2{position:absolute;left:0;right:0;top:${230*k}px;text-align:center;font-family:Nunito,sans-serif;font-weight:800;font-size:${56*k}px;color:#fff;text-shadow:0 3px 8px rgba(0,0,0,.35)}
.row{position:absolute;left:0;right:0;bottom:${70*k}px;display:flex;justify-content:center;align-items:flex-end;gap:${50*k}px}
.dev{width:${dw}px;height:${dh}px;border-radius:${60*k}px;background:#0e0b22;padding:${20*k}px;box-shadow:0 0 0 ${7*k}px rgba(255,255,255,.85),0 40px 80px rgba(0,0,0,.45)}
.dev img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:${42*k}px;display:block}
.dev.big{transform:translateY(-${20*k}px) scale(1.06)}</style>
<body><div class="glow"></div><div class="rays"></div><h1>${h1}</h1><h2>${h2}</h2><div class="row">${shots.map((s,i)=>`<div class="dev${shots.length===3&&i===1?' big':''}"><img src="raw_tablet/${s}.png"></div>`).join('')}</div>`;}
const S=[
 ['square-1x1',2160,2160,'lava','ROLL. RACE. <em>WIN!</em>','Classic ludo on stunning boards',['g_lava','g_dragon'],1600],
 ['landscape-4x3',2560,1920,'night','PLAY <em>YOUR WAY</em>','Online · Computer · 2 vs 2 · Pass &amp; Play',['home','g_finish','g_sakura'],1200],
];
(async()=>{const b=await chromium.launch();fs.mkdirSync('out_wide',{recursive:true});
for(const [n,W,H,bg,a,c,sh,dh] of S){const p=await b.newPage({viewport:{width:W,height:H}});fs.writeFileSync('_w.html',page(W,H,bg,a,c,sh,dh));
 await p.goto('file://'+process.cwd()+'/_w.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(600);await p.screenshot({path:'out_wide/'+n+'.jpg',type:'jpeg',quality:90});await p.close();}
await b.close();})();
