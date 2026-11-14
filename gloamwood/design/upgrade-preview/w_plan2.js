const MONS=CAT;
const BIGBODY={stout:1,quad:1,shell:1,snake:1,fly:1,swim:1,tall:1,crawl:1};
const PLAN=(function(){
  const used=new Set(),stages=[],unlock={},role={};
  const pick=(T,R,pred)=>{let best=null,bs=-1;for(const m of MONS){if(used.has(m.id)||(pred&&!pred(m)))continue;const sc=(T.el.includes(m.el)?3:0)+(T.hab.includes(m.hab)?2:0)+R()*1.6;if(sc>bs){bs=sc;best=m;}}return best;};
  for(let k=0;k<PLACES.length;k++){const w=worldOf(k),T=THEMES[w.theme],R=rng(1000+k);const seen=[];
    for(let s=0;s<5;s++){const n=k*5+s+1,neu=[];
      for(let i=0;i<[2,2,1,2,0][s];i++){const m=pick(T,R);if(m){used.add(m.id);unlock[m.id]=n;neu.push(m);seen.push(m);}}
      let elite=null,boss=null,surprise=null;
      if(s===2){elite=pick(T,R,m=>BIGBODY[m.body]);if(elite){used.add(elite.id);unlock[elite.id]=n;role[elite.id]='elite';}}
      if(s===4){boss=pick(T,R,m=>BIGBODY[m.body]&&m.body!=='crawl');if(boss){used.add(boss.id);unlock[boss.id]=n;role[boss.id]='boss';}}
      if(s!==2&&s!==4&&seen.length>2&&R()<.25)surprise=seen[Math.floor(R()*(seen.length-1))];
      const total=Math.min(3+Math.floor(n/6),8);
      stages.push({n,world:k,name:w.stages[s],neu,elite,boss,surprise,total,seen:seen.slice()});}
  }
  return {stages,unlock,role,usedCount:used.size};
})();
function homeTheme(m){const n=PLAN.unlock[m.id];return n?worldOf(PLAN.stages[n-1].world).theme:'forest';}
