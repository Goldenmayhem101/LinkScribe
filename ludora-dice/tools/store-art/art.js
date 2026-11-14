const {chromium}=require('playwright');const fs=require('fs');
const head=`<meta charset="utf-8"><link rel="stylesheet" href="fonts.css"><style>*{margin:0;box-sizing:border-box}html,body{overflow:hidden}</style>`;
const icon=head+`<style>html,body{width:1024px;height:1024px}
.s{position:absolute;inset:0;background:url(icon_scene.png) center/cover}
.v{position:absolute;inset:0;background:radial-gradient(circle at 50% 45%,transparent 55%,rgba(20,10,60,.38) 100%)}
.sh{position:absolute;inset:0;background:linear-gradient(160deg,rgba(255,255,255,.18),transparent 40%)}</style>
<div class="s"></div><div class="v"></div><div class="sh"></div>`;
const feat=head+`<style>html,body{width:2048px;height:1000px}
body{background:radial-gradient(circle at 72% 45%,#6a8bff 0,#3b2fd0 38%,#1c0f66 80%);position:relative;font-family:'Baloo 2'}
.rays{position:absolute;inset:-600px;background:repeating-conic-gradient(from 0deg at 72% 45%,rgba(255,255,255,.07) 0 5deg,transparent 5deg 13deg)}
.conf{position:absolute;inset:0;background-image:radial-gradient(#ffd84a 4px,transparent 5px),radial-gradient(#ff5a8a 4px,transparent 5px),radial-gradient(#5cf08a 4px,transparent 5px);background-size:210px 190px,260px 230px,300px 170px;background-position:20px 40px,120px 90px,60px 150px;opacity:.5}
.scene{position:absolute;right:-60px;top:-40px;width:1350px;filter:drop-shadow(0 40px 50px rgba(0,0,0,.45))}
.t{position:absolute;left:96px;top:150px}
.logo{position:relative;font-weight:800;font-size:250px;line-height:1;letter-spacing:2px;height:250px}.logo span{position:absolute;left:0;top:0;white-space:nowrap}.logo .b{color:#1a1240;-webkit-text-stroke:26px #1a1240;text-shadow:0 14px 0 #1a1240,0 22px 30px rgba(0,0,0,.5)}.logo .f{background:linear-gradient(#fff7c8,#ffd84a 48%,#ff9a1f);-webkit-background-clip:text;background-clip:text;color:transparent}
.sub{margin-top:24px;font-weight:800;font-size:76px;color:#fff;text-shadow:0 6px 0 rgba(20,10,60,.6)}
.chips{display:flex;gap:18px;margin-top:40px}
.chips span{font-family:Nunito;font-weight:900;font-size:36px;color:#1a1240;background:#fff;border-radius:999px;padding:12px 30px;box-shadow:0 8px 0 rgba(20,10,60,.45)}
</style><div class="rays"></div><div class="conf"></div><img class="scene" src="out_feature.png">
<div class="t"><div class="logo"><span class="b">Ludora</span><span class="f">Ludora</span></div><div class="sub">Fair Play Dice Game</div><div class="chips"><span>Online</span><span>Vs Computer</span><span>2–4 Players</span></div></div>`;
(async()=>{const b=await chromium.launch();const p=await b.newPage();
for(const [n,h,w,hh] of [['icon',icon,1024,1024],['feature',feat,2048,1000]]){fs.writeFileSync('_a.html',h);await p.setViewportSize({width:w,height:hh});await p.goto('http://localhost:8765/ss14/_a.html?'+n);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);await p.screenshot({path:'out/_'+n+'_big.png'});}
await b.close();})();
