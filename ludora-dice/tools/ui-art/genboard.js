const {chromium}=require('playwright');const fs=require('fs');
const pick=JSON.parse(fs.readFileSync('pick.json'));
const C={r:'#ef2f3c',g:'#22c24a',y:'#ffc21f',b:'#2f7dff'},D={r:'#a50f1b',g:'#0c7a2a',y:'#c98a00',b:'#1446b0'};
const IN=(x,y)=>'';const b64=f=>'data:image/png;base64,'+fs.readFileSync(f).toString('base64');
function svg(k){const SQ=b64('stk/'+k+'_sq.png');
 let s=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 15 15" width="1080" height="1080"><defs>
 <linearGradient id="cell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".97"/><stop offset="1" stop-color="#e6ebf7" stop-opacity=".93"/></linearGradient>
 <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy=".05" stdDeviation=".04" flood-color="#0a0630" flood-opacity=".6"/></filter>
 ${Object.keys(C).map(k=>`<linearGradient id="g${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C[k]}"/><stop offset="1" stop-color="${D[k]}"/></linearGradient>`).join('')}</defs>
 <image href="${b64('stk/'+k+'_sq.png')}" x="0" y="0" width="15" height="15"/><rect width="15" height="15" fill="#0a0630" opacity=".1"/>`;
 const cell=(x,y,f)=>{s+=`<rect x="${x+.05}" y="${y+.05}" width=".9" height=".9" rx=".16" fill="${f}" stroke="#170f45" stroke-width=".045" filter="url(#sh)"/>`;};
 for(let x=0;x<15;x++)for(let y=0;y<15;y++){const arm=(x>=6&&x<=8)||(y>=6&&y<=8),ctr=x>=6&&x<=8&&y>=6&&y<=8;if(arm&&!ctr&&!((x<6||x>8)&&(y<6||y>8)))cell(x,y,'url(#cell)');}
 for(let i=1;i<6;i++){cell(i,7,'url(#gr)');cell(7,i,'url(#gg)');cell(14-i,7,'url(#gy)');cell(7,14-i,'url(#gb)');}
 cell(1,6,'url(#gr)');cell(8,1,'url(#gg)');cell(13,8,'url(#gy)');cell(6,13,'url(#gb)');
 const star=(x,y,f)=>{const cx=x+.5,cy=y+.5;let p=[];for(let k=0;k<10;k++){const r=k%2?.15:.33,a=-Math.PI/2+k*Math.PI/5;p.push((cx+r*Math.cos(a)).toFixed(3)+','+(cy+r*Math.sin(a)).toFixed(3));}s+=`<polygon points="${p.join(' ')}" fill="${f}" stroke="#170f45" stroke-width=".03"/>`;};
 star(1,6,'#fff');star(8,1,'#fff');star(13,8,'#fff');star(6,13,'#fff');star(2,8,'#c9cfe6');star(6,2,'#c9cfe6');star(12,6,'#c9cfe6');star(8,12,'#c9cfe6');
 const Y=[['r',0,0],['g',9,0],['b',0,9],['y',9,9]];
 Y.forEach(([c,x,y],i)=>{
  s+=`<rect x="${x+.14}" y="${y+.14}" width="5.72" height="5.72" rx=".7" fill="url(#g${c})" fill-opacity=".92" stroke="#170f45" stroke-width=".07" filter="url(#sh)"/>`;
  s+=`<clipPath id="cy${i}"><rect x="${x+.75}" y="${y+.75}" width="4.5" height="4.5" rx=".55"/></clipPath><image href="${SQ}" x="0" y="0" width="15" height="15" clip-path="url(#cy${i})"/>`;s+=`<rect x="${x+.75}" y="${y+.75}" width="4.5" height="4.5" rx=".55" fill="#ffffff" fill-opacity=".18" stroke="#ffffff" stroke-opacity=".8" stroke-width=".06"/>`;
  for(const [a,b] of [[1.9,1.9],[4.1,1.9],[1.9,4.1],[4.1,4.1]])s+=`<circle cx="${x+a}" cy="${y+b}" r=".62" fill="#ffffff" fill-opacity=".55" stroke="${C[c]}" stroke-width=".12"/>`;
  const st=pick[k][i];if(st){const im=require('child_process');}
  if(st)s+=`<image href="${b64(st)}" x="${x+2.2}" y="${y+2.2}" width="1.6" height="1.6" preserveAspectRatio="xMidYMid meet" opacity=".95"/>`;
 });
 s+=`<g stroke="#170f45" stroke-width=".06" stroke-linejoin="round"><polygon points="6,6 9,6 7.5,7.5" fill="url(#gg)"/><polygon points="9,6 9,9 7.5,7.5" fill="url(#gy)"/><polygon points="9,9 6,9 7.5,7.5" fill="url(#gb)"/><polygon points="6,9 6,6 7.5,7.5" fill="url(#gr)"/></g>`;
 star(7,7,'#fff');
 s+=`<rect x=".03" y=".03" width="14.94" height="14.94" rx=".35" fill="none" stroke="#170f45" stroke-width=".06"/></svg>`;return s;}
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1080}});
for(const k of Object.keys(pick)){await p.setContent('<style>html,body{margin:0;background:transparent}</style>'+svg(k));await p.waitForTimeout(150);await p.screenshot({path:'out/boards/'+k+'.png',omitBackground:true});}
await b.close();})();
