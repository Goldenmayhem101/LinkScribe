const {chromium}=require('playwright');
const C={r:'#ef2f3c',g:'#22c24a',y:'#ffc21f',b:'#2f7dff'};
const D={r:'#b5121e',g:'#0f8a30',y:'#d99a00',b:'#1650c4'};
let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" width="2048" height="2048"><defs>
<linearGradient id="cell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eef1f8"/></linearGradient>
${Object.keys(C).map(k=>`<linearGradient id="g${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C[k]}"/><stop offset="1" stop-color="${D[k]}"/></linearGradient>`).join('')}
</defs><rect width="15" height="15" fill="#fbfcff"/>`;
function cell(x,y,f){s+=`<rect x="${x+.04}" y="${y+.04}" width=".92" height=".92" rx=".14" fill="${f}" stroke="rgba(30,30,60,.18)" stroke-width=".03"/>`;}
for(let x=0;x<15;x++)for(let y=0;y<15;y++){const inArm=(x>=6&&x<=8)||(y>=6&&y<=8);const inCenter=x>=6&&x<=8&&y>=6&&y<=8;if(inArm&&!inCenter)cell(x,y,'url(#cell)');}
// home columns
for(let i=1;i<6;i++){cell(i,7,`url(#gr)`);cell(7,i,`url(#gg)`);cell(14-i,7,`url(#gy)`);cell(7,14-i,`url(#gb)`);}
// start squares
cell(1,6,'url(#gr)');cell(8,1,'url(#gg)');cell(13,8,'url(#gy)');cell(6,13,'url(#gb)');
// stars on safe squares
function star(x,y,f){const cx=x+.5,cy=y+.5;let pts=[];for(let k=0;k<10;k++){const r=k%2?.15:.34,a=-Math.PI/2+k*Math.PI/5;pts.push((cx+r*Math.cos(a)).toFixed(3)+','+(cy+r*Math.sin(a)).toFixed(3));}s+=`<polygon points="${pts.join(' ')}" fill="${f}"/>`;}
star(1,6,'#fff');star(8,1,'#fff');star(13,8,'#fff');star(6,13,'#fff');
star(2,8,'#c9cede');star(6,2,'#c9cede');star(12,6,'#c9cede');star(8,12,'#c9cede');
// yards
const Y=[['r',0,0],['g',9,0],['b',0,9],['y',9,9]];
for(const [k,x,y] of Y){s+=`<rect x="${x+.12}" y="${y+.12}" width="5.76" height="5.76" rx=".7" fill="url(#g${k})"/><rect x="${x+.95}" y="${y+.95}" width="4.1" height="4.1" rx=".55" fill="#fff"/>`;
 for(const [a,b2] of [[2,2],[4,2],[2,4],[4,4]])s+=`<circle cx="${x+a}" cy="${y+b2}" r=".62" fill="${C[k]}" opacity=".18"/><circle cx="${x+a}" cy="${y+b2}" r=".62" fill="none" stroke="${D[k]}" stroke-width=".09"/>`;}
// center
s+=`<polygon points="6,6 9,6 7.5,7.5" fill="url(#gg)"/><polygon points="9,6 9,9 7.5,7.5" fill="url(#gy)"/><polygon points="9,9 6,9 7.5,7.5" fill="url(#gb)"/><polygon points="6,9 6,6 7.5,7.5" fill="url(#gr)"/>`;
star(7,7,'#fff');s+='</svg>';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:2048,height:2048}});await p.setContent('<style>html,body{margin:0}</style>'+s);await p.screenshot({path:'board_tex.png'});await b.close();})();
