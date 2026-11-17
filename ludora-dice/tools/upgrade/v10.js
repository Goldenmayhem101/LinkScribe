/* ===================== v1.8: Legendary finishing moves (one unique show per Legendary pawn) ===================== */
(function(){
var V9=window.__ludoraV9||{};
function sprite(pid,col){return V9.sprHTML?V9.sprHTML(pid,col):'';}
function colOf(seat){return (window.__ludoraV7&&window.__ludoraV7.colorName&&window.__ludoraV7.colorName[seat])||SEATS[seat];}

/* ---------- sound kit (Web Audio, no files) ---------- */
function ok(){return set.sound&&A.ctx;}
function nz(at,dur,freq,q,vol,type,slide){if(!ok())return;try{var t=A.ctx.currentTime+at,s=A.ctx.createBufferSource(),f=A.ctx.createBiquadFilter(),g=A.ctx.createGain();
  s.buffer=A.noise;s.loop=true;f.type=type||'bandpass';f.frequency.setValueAtTime(freq,t);if(slide)f.frequency.exponentialRampToValueAtTime(slide,t+dur);f.Q.value=q||1;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol||.4,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(f);f.connect(g);g.connect(A.sfx);s.start(t);s.stop(t+dur+.05);}catch(e){}}
function tn(at,f,dur,type,vol,slide){if(!ok())return;try{tone(f,dur,type,vol,slide,at);}catch(e){}}
var SND={
  whoosh:function(t){nz(t,.35,400,.8,.35,'bandpass',2400);},
  swoosh:function(t){nz(t,.18,2500,1.2,.3,'bandpass',600);},
  boom:function(t){tn(t,90,.55,'sine',.55,38);nz(t,.5,700,.6,.5,'lowpass',120);},
  thud:function(t){tn(t,140,.25,'sine',.45,60);nz(t,.18,500,.8,.3,'lowpass',150);},
  smack:function(t){nz(t,.12,1800,.7,.6,'bandpass',700);tn(t,220,.12,'square',.18,110);},
  zap:function(t){for(var i=0;i<5;i++)tn(t+i*.05,1200-i*120,.06,'sawtooth',.14,300);nz(t,.35,3000,2,.25,'highpass');},
  thunder:function(t){nz(t,1.1,300,.5,.6,'lowpass',60);tn(t,60,.9,'sine',.4,30);},
  fire:function(t){nz(t,.8,900,.4,.4,'lowpass',300);},
  freeze:function(t){[1568,2093,2637,3136].forEach(function(f,i){tn(t+i*.05,f,.25,'triangle',.12);});},
  shatter:function(t){for(var i=0;i<6;i++)tn(t+i*.025,2000+Math.random()*2500,.12,'triangle',.1);nz(t,.3,4000,1,.3,'highpass');},
  splash:function(t){nz(t,.7,1200,.4,.45,'lowpass',250);},
  chime:function(t){[784,988,1175,1568].forEach(function(f,i){tn(t+i*.07,f,.4,'sine',.14);});},
  laser:function(t){tn(t,1800,.5,'sawtooth',.12,200);tn(t,900,.5,'square',.08,150);},
  roar:function(t){tn(t,110,.8,'sawtooth',.25,70);nz(t,.8,350,.6,.35,'lowpass',150);},
  drum:function(t){tn(t,70,.35,'sine',.6,40);nz(t,.12,200,.6,.4,'lowpass');},
  gulp:function(t){tn(t,300,.25,'sine',.35,90);tn(t+.3,180,.2,'sine',.25,420);},
  tick:function(t){for(var i=0;i<6;i++)tn(t+i*.09,i%2?1400:1800,.03,'square',.12);},
  rise:function(t){tn(t,300,.8,'sine',.18,1200);},
  sparkle:function(t){for(var i=0;i<6;i++)tn(t+i*.05,1800+Math.random()*1600,.15,'sine',.08);}
};
function play(list){list.forEach(function(p){SND[p[0]]&&SND[p[0]](p[1]/1000);});}
function buzz(ms,at){setTimeout(function(){try{if(window.AndroidApp&&AndroidApp.vibrate)AndroidApp.vibrate(ms);else navigator.vibrate&&navigator.vibrate(ms);}catch(e){}},at||0);}

/* ---------- stage helpers ---------- */
var layer=null;
function getLayer(){if(!layer||!layer.isConnected){layer=document.createElement('div');layer.className='fin9';document.body.appendChild(layer);}return layer;}
function mk(cls,html,x,y,w,h){var e=document.createElement('div');e.className='f9 '+(cls||'');if(html)e.innerHTML=html;e.style.left=x+'px';e.style.top=y+'px';if(w)e.style.width=w+'px';if(h)e.style.height=h+'px';getLayer().appendChild(e);return e;}
function an(e,frames,dur,delay,ease,fill){try{return e.animate(frames,{duration:dur,delay:delay||0,easing:ease||'ease-out',fill:fill||'forwards'});}catch(x){}}
var C='translate(-50%,-100%) ';   // anchor: feet
var M='translate(-50%,-50%) ';    // anchor: middle
function fig(html,x,y,w,h){return mk('fig',html,x,y,w,h);}
function burst(x,y,chars,n,dist,at,dur,size,up){for(var i=0;i<n;i++){var a=(up?-Math.PI*.15-Math.random()*Math.PI*.7:i/n*Math.PI*2+Math.random()*.4),d=dist*(.55+Math.random()*.6);
  var p=mk('pt',chars[i%chars.length],x,y);p.style.fontSize=size*(.7+Math.random()*.6)+'px';
  an(p,[{transform:M+'translate(0,0) scale(.3) rotate(0)',opacity:1},{transform:M+'translate('+(Math.cos(a)*d).toFixed(0)+'px,'+(Math.sin(a)*d).toFixed(0)+'px) scale(1.1) rotate('+(Math.random()*360-180).toFixed(0)+'deg)',opacity:0}],dur*(.8+Math.random()*.4),at+Math.random()*60,'cubic-bezier(.2,.8,.3,1)');}}
function ring(x,y,col,at,size,width){var r=mk('ring','',x,y,size,size);r.style.borderColor=col;r.style.borderWidth=(width||4)+'px';r.style.boxShadow='0 0 14px '+col;
  an(r,[{transform:M+'scale(.15)',opacity:1},{transform:M+'scale(1)',opacity:0}],650,at,'cubic-bezier(.2,.7,.3,1)');}
function flash(col,at,peak){var f=mk('flash','',0,0);f.style.background='radial-gradient(circle,'+col+',transparent 70%)';an(f,[{opacity:0},{opacity:peak||.9,offset:.15},{opacity:0}],520,at);}
function darken(at,dur,col){var f=mk('flash','',0,0);f.style.background=col||'rgba(8,6,30,.55)';an(f,[{opacity:0},{opacity:1,offset:.15},{opacity:1,offset:.8},{opacity:0}],dur,at,'linear');}
function shake(at,amp){setTimeout(function(){var s=document.getElementById('stage');if(!s)return;an(s,[{transform:'translate(0,0)'},{transform:'translate('+amp+'px,'+(-amp/2)+'px)'},{transform:'translate('+(-amp)+'px,'+(amp/2)+'px)'},{transform:'translate('+(amp/2)+'px,'+amp+'px)'},{transform:'translate(0,0)'}],320,0,'linear','none');},at);}
function word(txt,col,x,y,at){var w=mk('word',txt,x,y);w.style.setProperty('--c',col);
  an(w,[{transform:M+'scale(.2) rotate(-8deg)',opacity:0},{transform:M+'scale(1.25) rotate(3deg)',opacity:1,offset:.18},{transform:M+'scale(1) rotate(0)',opacity:1,offset:.3},{transform:M+'scale(1)',opacity:1,offset:.82},{transform:M+'translateY(-14px) scale(.95)',opacity:0}],1350,at,'cubic-bezier(.3,1.4,.5,1)');}
function ghost(x,y,at,u){var g=mk('pt','👻',x,y);g.style.fontSize=u*1.1+'px';
  an(g,[{transform:M+'scale(.4)',opacity:0},{transform:M+'translate(0,-8px) scale(1)',opacity:.95,offset:.2},{transform:M+'translate(14px,'+(-u*3.2)+'px) scale(.8)',opacity:0}],1300,at,'ease-out');}
function streak(x1,y1,x2,y2,col,at,dur,thick){var L=Math.hypot(x2-x1,y2-y1),ang=Math.atan2(y2-y1,x2-x1)*180/Math.PI;var s=mk('beam','',x1,y1,L,thick||8);s.style.background=col;s.style.transformOrigin='0 50%';
  an(s,[{transform:'translateY(-50%) rotate('+ang+'deg) scaleX(0)',opacity:1},{transform:'translateY(-50%) rotate('+ang+'deg) scaleX(1)',opacity:1,offset:.25},{transform:'translateY(-50%) rotate('+ang+'deg) scaleX(1)',opacity:1,offset:.75},{transform:'translateY(-50%) rotate('+ang+'deg) scaleX(1) scaleY(.1)',opacity:0}],dur,at,'linear');return s;}
function bolt(x,top,y,col,at){var pts=[],n=7;for(var i=0;i<=n;i++){var yy=top+(y-top)*i/n,xx=x+(i&&i<n?(Math.random()-.5)*40:0);pts.push(xx.toFixed(0)+','+yy.toFixed(0));}
  var svg=mk('svgl','<svg width="100%" height="100%"><polyline points="'+pts.join(' ')+'" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><polyline points="'+pts.join(' ')+'" fill="none" stroke="'+col+'" stroke-width="12" stroke-opacity=".55" stroke-linejoin="round"/></svg>',0,0);
  an(svg,[{opacity:0},{opacity:1,offset:.05},{opacity:.2,offset:.25},{opacity:1,offset:.4},{opacity:0}],420,at,'linear');}

/* ---------- victim reactions ---------- */
var R={
  squash:function(v,at,c){an(v,[{transform:C+'scale(1,1)'},{transform:C+'scale(1.9,.12)',offset:.12},{transform:C+'scale(1.9,.12)',offset:.75},{transform:C+'scale(1.9,.12)',opacity:0}],1100,at,'cubic-bezier(.2,.9,.3,1)');
    burst(c.x,c.y,['⭐','💫','✨'],8,c.u*1.6,at,700,c.u*.6,true);},
  launch:function(v,at,c,dir){dir=dir||1;an(v,[{transform:C+'translate(0,0) rotate(0)',opacity:1},{transform:C+'translate('+(dir*c.u*3)+'px,'+(-c.u*4)+'px) rotate('+(dir*400)+'deg) scale(.9)',opacity:1,offset:.45},{transform:C+'translate('+(dir*c.u*7)+'px,'+(c.u*1.5)+'px) rotate('+(dir*900)+'deg) scale(.6)',opacity:0}],1000,at,'cubic-bezier(.2,.6,.5,1)');},
  freeze:function(v,at,c){var ice=mk('ice','',c.x,c.y,c.u*1.9,c.u*2.3);an(ice,[{transform:C+'scale(.3)',opacity:0},{transform:C+'scale(1.08)',opacity:.95,offset:.3},{transform:C+'scale(1)',opacity:.95}],380,at,'cubic-bezier(.3,1.5,.5,1)');
    an(v,[{filter:'none'},{filter:'saturate(.15) brightness(1.6) sepia(.3) hue-rotate(160deg) saturate(2)'}],300,at);
    var sh=at+650;an(ice,[{opacity:.95},{opacity:0}],80,sh,'linear');an(v,[{opacity:1},{opacity:0}],60,sh,'linear');
    burst(c.x,c.y-c.u,['🧊','❄️','💎'],14,c.u*2.6,sh,800,c.u*.65);SND.shatter(sh/1000);},
  burn:function(v,at,c){an(v,[{filter:'none'},{filter:'brightness(.25) sepia(1) saturate(3) hue-rotate(-20deg)',offset:.4},{filter:'brightness(.1)',opacity:1,offset:.7},{filter:'brightness(.1)',opacity:0,transform:C+'scale(1.1,.6)'}],1100,at);
    burst(c.x,c.y-c.u*.8,['💨','🔥','💨'],8,c.u*1.8,at+300,1000,c.u*.7,true);},
  zap:function(v,at,c){an(v,[{filter:'none'},{filter:'invert(1) brightness(2)',offset:.1},{filter:'none',offset:.2},{filter:'invert(1) brightness(2)',offset:.3},{filter:'none',offset:.4},{filter:'brightness(.15)',offset:.6},{filter:'brightness(.15)',opacity:0}],1100,at,'linear');
    burst(c.x,c.y-c.u*.8,['⚡','💨'],8,c.u*1.6,at+500,800,c.u*.6,true);},
  dissolve:function(v,at,c){an(v,[{filter:'none',opacity:1},{filter:'brightness(3) blur(1px)',opacity:1,offset:.3},{filter:'brightness(4) blur(6px)',opacity:0,transform:C+'translateY('+(-c.u)+'px) scale(1.2)'}],900,at);
    burst(c.x,c.y-c.u*.8,['✨','⭐','✦'],12,c.u*2,at+200,900,c.u*.5,true);},
  suck:function(v,at,c,tx,ty){an(v,[{transform:C+'translate(0,0) rotate(0) scale(1)',opacity:1},{transform:C+'translate('+(tx-c.x)+'px,'+(ty-c.y)+'px) rotate(720deg) scale(.05)',opacity:.4}],650,at,'cubic-bezier(.6,0,.8,.6)');},
  split:function(v,at,c){var h=v.innerHTML,a=fig(h,c.x,c.y,c.vw,c.vh),b=fig(h,c.x,c.y,c.vw,c.vh);a.style.clipPath='polygon(0 0,62% 0,38% 100%,0 100%)';b.style.clipPath='polygon(62% 0,100% 0,100% 100%,38% 100%)';
    a.style.opacity=0;b.style.opacity=0;an(v,[{opacity:1},{opacity:0}],10,at,'linear');
    an(a,[{transform:C+'translate(0,0) rotate(0)',opacity:1},{transform:C+'translate(-6px,-2px) rotate(-4deg)',opacity:1,offset:.25},{transform:C+'translate('+(-c.u*1.6)+'px,'+(c.u*2)+'px) rotate(-60deg)',opacity:0}],900,at,'cubic-bezier(.5,0,.8,.6)');
    an(b,[{transform:C+'translate(0,0) rotate(0)',opacity:1},{transform:C+'translate(6px,2px) rotate(4deg)',opacity:1,offset:.25},{transform:C+'translate('+(c.u*1.6)+'px,'+(c.u*2)+'px) rotate(60deg)',opacity:0}],900,at,'cubic-bezier(.5,0,.8,.6)');},
  crumble:function(v,at,c){an(v,[{filter:'none'},{filter:'sepia(1) saturate(1.6) brightness(1.1)',offset:.3},{filter:'sepia(1)',clipPath:'inset(0 0 0 0)',offset:.5},{filter:'sepia(1)',clipPath:'inset(100% 0 0 0)',opacity:.6}],1100,at,'linear');
    burst(c.x,c.y-c.u*.4,['🟫','🟨','·'],14,c.u*1.2,at+500,900,c.u*.3);},
  ascend:function(v,at,c){var halo=mk('pt','😇',c.x,c.y-c.vh);halo.style.fontSize=c.u*.8+'px';an(halo,[{opacity:0},{opacity:1}],200,at);
    an(v,[{transform:C+'translateY(0)',filter:'none',opacity:1},{transform:C+'translateY('+(-c.u*5)+'px) scale(.7)',filter:'brightness(2.5)',opacity:0}],1100,at,'ease-in');an(halo,[{transform:M+'translateY(0)',opacity:1},{transform:M+'translateY('+(-c.u*5)+'px)',opacity:0}],1100,at,'ease-in');}
};

/* ---------- moves ---------- */
function enter(a,at,from){an(a,[{transform:C+from+' scale(.3)',opacity:0},{transform:C+'translate(0,0) scale(1.08)',opacity:1,offset:.7},{transform:C+'translate(0,0) scale(1)',opacity:1}],380,at,'cubic-bezier(.3,1.4,.5,1)');}
function leave(a,at,to){an(a,[{transform:C+'translate(0,0) scale(1)',opacity:1},{transform:C+(to||'translateY(-30px)')+' scale(.7)',opacity:0}],380,at,'ease-in');}
var MOVES={
  SLAM:function(c,L){var a=fig(c.atk,c.x,c.y,c.aw*L.big,c.ah*L.big);var up='translateY('+(-Math.min(c.u*4.6,c.y-40))+'px)';
    an(a,[{transform:C+up+' scale(.4)',opacity:0},{transform:C+up+' scale(1)',opacity:1,offset:.3},{transform:C+up+' rotate(-14deg) scale(1.05,.95)',offset:.62},{transform:C+'translateY(0) rotate(0) scale(.9,1.12)',offset:.82,easing:'cubic-bezier(.7,0,1,.6)'},{transform:C+'translateY(0) scale(1.25,.72)',offset:.9},{transform:C+'translateY(0) scale(1)',offset:1}],900,0,'linear');
    var hit=760;R[L.react](c.v,hit,c);ring(c.x,c.y,L.col,hit,c.u*7,6);flash(L.col,hit,.7);shake(hit,9);burst(c.x,c.y,L.parts,16,c.u*3.2,hit,900,c.u*.8);buzz(90,hit);
    leave(a,1600,'translateY('+(-c.u*3)+'px)');return [['whoosh',250],['boom',hit],['smack',hit]];},
  CHARGE:function(c,L){var dir=c.x>innerWidth/2?-1:1,from='translateX('+(-dir*innerWidth*.9)+'px)';var a=fig(c.atk,c.x-dir*c.u*1.2,c.y,c.aw,c.ah);
    an(a,[{transform:C+from+' translateY(0)'},{transform:C+'translateX('+(-dir*innerWidth*.45)+'px) translateY(-8px)',offset:.35},{transform:C+'translateX('+(-dir*innerWidth*.2)+'px) translateY(0)',offset:.6},{transform:C+'translateX(0) translateY(-6px) scale(1.1,.92)',offset:.9},{transform:C+'translateX(0) scale(1)'}],680,0,'cubic-bezier(.5,0,.9,.5)');
    for(var i=0;i<8;i++){var t=mk('pt',L.parts[i%L.parts.length],c.x-dir*(innerWidth*.5-i*innerWidth*.06),c.y-c.u*.8);t.style.fontSize=c.u*.6+'px';an(t,[{opacity:0},{opacity:.9,offset:.2},{opacity:0,transform:M+'translateY(-16px) scale(.4)'}],500,120+i*60);}
    var hit=680;R[L.react](c.v,hit,c,dir);ring(c.x,c.y-c.u,L.col,hit,c.u*5,5);flash(L.col,hit,.6);shake(hit,8);burst(c.x,c.y-c.u,L.parts,14,c.u*2.6,hit,800,c.u*.7);buzz(70,hit);
    an(a,[{transform:C+'translateX(0)'},{transform:C+'translateX('+(dir*c.u*1.4)+'px) rotate('+(dir*8)+'deg)'},{transform:C+'translateX('+(dir*c.u*1.2)+'px) rotate(0)'}],400,hit+20,'ease-out');
    leave(a,1650);return [['whoosh',100],['thud',hit],['smack',hit]];},
  BREATH:function(c,L){var side=c.x>innerWidth/2?-1:1,ax=c.x-side*c.u*3.2;var a=fig(c.atk,ax,c.y+c.u*.3,c.aw,c.ah);if(side<0)a.classList.add('flip');
    enter(a,0,'translateY(-30px)');an(a,[{transform:C+'scale(1)'},{transform:C+'rotate('+(-side*10)+'deg) scale(.95,1.05)'},{transform:C+'rotate('+(side*6)+'deg) scale(1.08,.95)'}],300,350,'ease-in-out');
    var mx=ax+side*c.aw*.25,my=c.y-c.ah*.6;
    for(var i=0;i<26;i++){var p=mk('pt',L.parts[i%L.parts.length],mx,my);p.style.fontSize=c.u*(.5+Math.random()*.5)+'px';var tx=c.x-mx+(Math.random()-.5)*c.u*1.2,ty=(c.y-c.u*.9)-my+(Math.random()-.5)*c.u*1.2;
      an(p,[{transform:M+'translate(0,0) scale(.3)',opacity:1},{transform:M+'translate('+tx.toFixed(0)+'px,'+ty.toFixed(0)+'px) scale(1.3) rotate(200deg)',opacity:.1}],520,520+i*26,'ease-in');}
    var hit=900;R[L.react](c.v,hit,c);ring(c.x,c.y-c.u,L.col,hit+200,c.u*4,4);buzz(60,hit);
    leave(a,1700);return [['whoosh',300],[L.snd||'fire',520],[L.snd||'fire',800]];},
  BOLT:function(c,L){darken(0,1500);var a=fig(c.atk,c.x,Math.max(c.ah+10,c.y-c.u*3),c.aw,c.ah);enter(a,100,'translateY(-60px)');
    an(a,[{transform:C+'translateY(0)'},{transform:C+'translateY(-6px) scale(1.06)'},{transform:C+'translateY(0)'}],400,480,'ease-in-out');
    var hit=720;bolt(c.x,0,c.y-c.u*.5,L.col,hit);bolt(c.x+8,0,c.y-c.u*.5,L.col,hit+150);flash('#fff',hit,1);flash(L.col,hit+150,.7);R[L.react](c.v,hit,c);shake(hit,10);
    burst(c.x,c.y-c.u*.5,L.parts,14,c.u*2.6,hit,800,c.u*.7);ring(c.x,c.y,L.col,hit,c.u*5,5);buzz(120,hit);leave(a,1600,'translateY(-60px)');
    return [['rise',100],['thunder',hit],['zap',hit]];},
  BEAM:function(c,L){var side=c.x>innerWidth/2?-1:1,ax=c.x-side*c.u*3.4;var a=fig(c.atk,ax,c.y+c.u*.4,c.aw,c.ah);if(side<0)a.classList.add('flip');enter(a,0,'translateY(-30px)');
    var ox=ax+side*c.aw*.2,oy=c.y-c.ah*.55,orb=mk('orb','',ox,oy,c.u*1.4,c.u*1.4);orb.style.setProperty('--c',L.col);
    an(orb,[{transform:M+'scale(.1)',opacity:0},{transform:M+'scale(1.4)',opacity:1,offset:.7},{transform:M+'scale(.6)',opacity:1}],520,320,'ease-in');an(orb,[{opacity:1},{opacity:0}],300,1250,'linear');
    var hit=850;streak(ox,oy,c.x,c.y-c.u*.8,'linear-gradient(90deg,#fff,'+L.col+')',hit,560,c.u*.7);flash(L.col,hit+60,.6);R[L.react](c.v,hit+120,c);shake(hit+80,5);
    burst(c.x,c.y-c.u*.8,L.parts,12,c.u*2.2,hit+150,800,c.u*.6);buzz(80,hit);leave(a,1650);return [['rise',300],[L.snd||'laser',hit]];},
  WAVE:function(c,L){var dir=c.x>innerWidth/2?-1:1,w=mk('wave','',c.x,c.y,innerWidth*1.1,c.u*4.5);w.style.setProperty('--c',L.col);
    an(w,[{transform:'translate(-50%,-85%) translateX('+(-dir*innerWidth)+'px)'},{transform:'translate(-50%,-85%) translateX(0)',offset:.6},{transform:'translate(-50%,-85%) translateX('+(dir*innerWidth)+'px)'}],1300,150,'cubic-bezier(.3,0,.7,1)');
    var a=fig(c.atk,c.x,Math.max(c.ah+10,c.y-c.u*2.2),c.aw,c.ah);an(a,[{transform:C+'translateX('+(-dir*innerWidth)+'px) rotate(-10deg)',opacity:1},{transform:C+'translateX(0) rotate(6deg)',opacity:1,offset:.6},{transform:C+'translateX('+(dir*innerWidth)+'px) rotate(-6deg)',opacity:1}],1300,150,'cubic-bezier(.3,0,.7,1)');
    var hit=930;R[L.react](c.v,hit,c,dir);burst(c.x,c.y-c.u,L.parts,16,c.u*2.6,hit,900,c.u*.7,true);shake(hit,6);buzz(70,hit);return [['splash',300],['splash',hit]];},
  GULP:function(c,L){var dir=c.x>innerWidth/2?-1:1,a=fig(c.atk,c.x+dir*c.u*2.4,c.y+c.u*.4,c.aw*1.25,c.ah*1.25);if(dir>0)a.classList.add('flip');
    an(a,[{transform:C+'translateX('+(dir*innerWidth*.7)+'px)',opacity:1},{transform:C+'translateX(0) rotate(-6deg)',opacity:1,offset:.6},{transform:C+'translateX(0) rotate(4deg) scale(1.15,.9)',offset:.85},{transform:C+'translateX(0) scale(1)'}],900,0,'cubic-bezier(.3,.6,.4,1)');
    var hit=650,mx=c.x+dir*c.u*1.4,my=c.y-c.u*1.6;R.suck(c.v,hit,c,mx,my);
    for(var i=0;i<10;i++){var b=mk('pt','🫧',mx,my);b.style.fontSize=c.u*(.4+Math.random()*.5)+'px';an(b,[{transform:M+'translate(0,0) scale(.3)',opacity:0},{transform:M+'translate('+((Math.random()-.5)*c.u*2).toFixed(0)+'px,'+(-c.u*(2+Math.random()*2)).toFixed(0)+'px) scale(1)',opacity:0}],900,1100+i*40,'ease-out');}
    an(a,[{transform:C+'scale(1)'},{transform:C+'scale(1.18,1.1)'},{transform:C+'scale(1)'}],300,1000,'ease-in-out');
    leave(a,1700,'translateX('+(dir*innerWidth*.6)+'px)');buzz(60,hit);return [['splash',100],['gulp',hit],['splash',1700]];},
  SLASH:function(c,L){var a=fig(c.atk,c.x,c.y+c.u*.2,c.aw,c.ah);
    an(a,[{transform:C+'translateX('+(-c.u*4)+'px) scale(.6)',opacity:0},{transform:C+'translateX('+(-c.u*2.8)+'px) scale(1)',opacity:1,offset:.25},{transform:C+'translateX('+(-c.u*2.8)+'px) scale(1.05,.95)',opacity:1,offset:.5},{transform:C+'translateX('+(c.u*2.6)+'px) scale(1.1,.9)',opacity:1,offset:.62},{transform:C+'translateX('+(c.u*2.8)+'px) scale(1)',opacity:1}],900,0,'linear');
    for(var g=0;g<3;g++){var ghost2=fig(c.atk,c.x,c.y+c.u*.2,c.aw,c.ah);ghost2.style.opacity=0;an(ghost2,[{transform:C+'translateX('+(-c.u*2.8+g*c.u*1.6)+'px)',opacity:.45},{transform:C+'translateX('+(-c.u*2.8+g*c.u*1.6)+'px)',opacity:0}],260,470+g*40,'linear');}
    var hit=600;[[-1,-1,1,1],[1,-1,-1,1],[-1,0,1,0]].slice(0,L.claws||2).forEach(function(s,i){streak(c.x+s[0]*c.u*1.4,c.y-c.u*.9+s[1]*c.u*1.1,c.x+s[2]*c.u*1.4,c.y-c.u*.9+s[3]*c.u*1.1,'linear-gradient(90deg,transparent,#fff,'+L.col+',transparent)',hit+i*70,520,5);});
    R.split(c.v,hit+260,c);flash(L.col,hit,.5);shake(hit+200,6);burst(c.x,c.y-c.u,L.parts,10,c.u*2.2,hit+200,700,c.u*.6);buzz(50,hit);leave(a,1650);
    return [['swoosh',hit-60],['swoosh',hit+60],['smack',hit+260]];},
  METEOR:function(c,L){darken(0,1600,'rgba(10,6,40,.6)');var a=fig(c.atk,c.x-c.u*2.6,c.y+c.u*.3,c.aw,c.ah);enter(a,0,'translateY(-40px)');
    an(a,[{transform:C+'translateY(0) rotate(0)'},{transform:C+'translateY(-10px) rotate(-8deg) scale(1.06)'}],300,360,'ease-out');
    var m=mk('pt',L.parts[0],c.x+innerWidth*.6,c.y-innerHeight*.6);m.style.fontSize=c.u*2.2+'px';m.style.filter='drop-shadow(0 0 12px '+L.col+')';
    an(m,[{transform:M+'translate(0,0) rotate(0)',opacity:1},{transform:M+'translate('+(-innerWidth*.6)+'px,'+(innerHeight*.6-c.u)+'px) rotate(-200deg)',opacity:1}],420,520,'cubic-bezier(.7,0,1,.7)');an(m,[{opacity:1},{opacity:0}],50,940,'linear');
    for(var i=0;i<8;i++){var tr=mk('pt','✦',c.x+innerWidth*.6*(1-i/8),c.y-c.u-(innerHeight*.6-c.u)*(1-i/8));tr.style.color=L.col;tr.style.fontSize=c.u*.6+'px';an(tr,[{opacity:0},{opacity:1,offset:.2},{opacity:0}],500,520+i*50,'linear');}
    var hit=940;R[L.react](c.v,hit,c,-1);flash('#fff',hit,.9);ring(c.x,c.y,L.col,hit,c.u*7,6);shake(hit,10);burst(c.x,c.y-c.u,L.parts,18,c.u*3.2,hit,900,c.u*.75);buzz(110,hit);leave(a,1700);
    return [['rise',300],['whoosh',520],['boom',hit]];},
  TIME:function(c,L){var a=fig(c.atk,c.x-c.u*2.8,c.y+c.u*.3,c.aw,c.ah);enter(a,0,'translateY(-30px)');
    var clk=mk('clock','<b class="hh"></b><b class="mh"></b>',c.x,c.y-c.u*1.1,c.u*2.8,c.u*2.8);clk.style.setProperty('--c',L.col);
    an(clk,[{transform:M+'scale(.2)',opacity:0},{transform:M+'scale(1)',opacity:.95,offset:.25},{transform:M+'scale(1)',opacity:.95,offset:.8},{transform:M+'scale(1.6)',opacity:0}],1300,300,'cubic-bezier(.3,1.3,.5,1)');
    an(clk.querySelector('.mh'),[{transform:'rotate(0)'},{transform:'rotate(1080deg)'}],800,350,'cubic-bezier(.4,0,.2,1)');an(clk.querySelector('.hh'),[{transform:'rotate(0)'},{transform:'rotate(360deg)'}],800,350,'cubic-bezier(.4,0,.2,1)');
    an(c.v,[{filter:'none'},{filter:'grayscale(1) brightness(1.2)'}],200,700);var hit=1150;R.crumble(c.v,hit,c);flash(L.col,hit,.5);buzz(60,hit);leave(a,1700);
    return [['tick',350],['chime',700],['shatter',hit]];},
  TORNADO:function(c,L){var a=fig(c.atk,c.x-c.u*2.8,c.y+c.u*.3,c.aw,c.ah);enter(a,0,'translateY(-30px)');var tw=mk('twister','',c.x,c.y,c.u*2.6,c.u*4.2);tw.style.setProperty('--c',L.col);
    an(tw,[{transform:C+'scaleY(.1)',opacity:0},{transform:C+'scaleY(1)',opacity:.9,offset:.25},{transform:C+'scaleY(1) translateY(-10px)',opacity:.9,offset:.8},{transform:C+'scaleY(1.2) translateY('+(-c.u*3)+'px)',opacity:0}],1500,250,'ease-in-out');
    for(var i=0;i<14;i++){var p=mk('pt',L.parts[i%L.parts.length],c.x,c.y-c.u*(i%7)*.55);p.style.fontSize=c.u*.55+'px';an(p,[{transform:M+'translateX('+(-c.u*1.2)+'px)',opacity:0},{transform:M+'translateX('+(c.u*1.2)+'px)',opacity:1,offset:.5},{transform:M+'translateX('+(-c.u*1.2)+'px)',opacity:0}],520,350+i*50,'ease-in-out');}
    an(c.v,[{transform:C+'translateY(0) rotate(0)',opacity:1},{transform:C+'translateY('+(-c.u*2)+'px) rotate(540deg)',opacity:1,offset:.5},{transform:C+'translateY('+(-c.u*7)+'px) rotate(1260deg) scale(.4)',opacity:0}],1200,650,'ease-in');buzz(60,700);leave(a,1700);
    return [['whoosh',300],['whoosh',700],['whoosh',1100]];},
  ORBS:function(c,L){var a=fig(c.atk,c.x-c.u*2.8,c.y+c.u*.3,c.aw,c.ah);enter(a,0,'translateY(-30px)');var n=L.n||6;
    for(var i=0;i<n;i++){var o=mk('orb sm','',c.x,c.y-c.u*.9,c.u*.9,c.u*.9);o.style.setProperty('--c',L.col);var ang=i/n*360;
      an(o,[{transform:M+'rotate('+ang+'deg) translateX('+(c.u*2.2)+'px) scale(.2)',opacity:0},{transform:M+'rotate('+(ang+180)+'deg) translateX('+(c.u*2.2)+'px) scale(1)',opacity:1,offset:.6},{transform:M+'rotate('+(ang+300)+'deg) translateX(0) scale(1.3)',opacity:1}],750,250+i*30,'cubic-bezier(.4,0,.6,1)');an(o,[{opacity:1},{opacity:0}],60,1060,'linear');}
    var hit=1060;R[L.react](c.v,hit,c);flash(L.col,hit,.8);ring(c.x,c.y-c.u*.9,L.col,hit,c.u*6,6);shake(hit,8);burst(c.x,c.y-c.u,L.parts,16,c.u*2.8,hit,800,c.u*.7);buzz(90,hit);leave(a,1700);
    return [['sparkle',250],['fire',700],['boom',hit]];},
  UPLIFT:function(c,L){var crack=mk('crack','',c.x,c.y,c.u*3.6,c.u*1);an(crack,[{transform:M+'scaleX(.1)',opacity:0},{transform:M+'scaleX(1)',opacity:1,offset:.4},{opacity:0}],900,150,'ease-out');shake(200,4);shake(500,6);
    var a=fig(c.atk,c.x,c.y+c.u*.6,c.aw*1.2,c.ah*1.2);a.style.opacity=0;an(a,[{transform:C+'translateY('+(c.u*3)+'px) scale(.8)',opacity:0,clipPath:'inset(0 0 100% 0)'},{transform:C+'translateY(0) scale(1.1,.95)',opacity:1,clipPath:'inset(0 0 0 0)',offset:.75},{transform:C+'translateY(0) scale(1)',opacity:1,clipPath:'inset(0 0 0 0)'}],600,500,'cubic-bezier(.3,1.4,.5,1)');
    var hit=650;an(c.v,[{transform:C+'translateY(0) rotate(0)',opacity:1},{transform:C+'translateY('+(-c.u*6)+'px) rotate(500deg) scale(.8)',opacity:1,offset:.6},{transform:C+'translateY('+(-c.u*2)+'px) translateX('+(c.u*4)+'px) rotate(900deg) scale(.5)',opacity:0}],1100,hit,'cubic-bezier(.2,.8,.4,1)');
    burst(c.x,c.y,L.parts,16,c.u*3,hit,900,c.u*.7,true);buzz(90,hit);leave(a,1750,'translateY('+(c.u*2)+'px)');return [['thud',200],['boom',hit],['splash',hit+100]];},
  ROAR:function(c,L){var side=c.x>innerWidth/2?-1:1,ax=c.x-side*c.u*3.2;var a=fig(c.atk,ax,c.y+c.u*.3,c.aw*1.1,c.ah*1.1);if(side<0)a.classList.add('flip');enter(a,0,'translateY(-30px)');
    an(a,[{transform:C+'scale(1)'},{transform:C+'scale(.92,1.08) rotate('+(-side*6)+'deg)',offset:.3},{transform:C+'scale(1.15,.9)',offset:.5},{transform:C+'scale(1.12,.92)',offset:.8},{transform:C+'scale(1)'}],900,350,'ease-in-out');
    for(var i=0;i<4;i++){ring(ax+side*c.u*1.2,c.y-c.ah*.55,L.col,560+i*110,c.u*(3+i*1.6),5);}
    for(var j=0;j<10;j++){var p=mk('pt',L.parts[j%L.parts.length],ax+side*c.u,c.y-c.ah*.55);p.style.fontSize=c.u*.6+'px';an(p,[{transform:M+'translate(0,0) scale(.3)',opacity:1},{transform:M+'translate('+(side*(c.u*4+Math.random()*c.u*2)).toFixed(0)+'px,'+((Math.random()-.5)*c.u*2.5).toFixed(0)+'px) scale(1.2)',opacity:0}],600,560+j*40,'ease-out');}
    var hit=800;R.launch(c.v,hit,c,side);shake(600,8);flash(L.col,hit,.4);buzz(150,600);leave(a,1700);return [[L.snd||'roar',560],['drum',560],['drum',780]];},
  SHOCK:function(c,L){var a=fig(c.atk,c.x,c.y-c.u*.4,c.aw,c.ah);an(a,[{transform:C+'translateY('+(-c.u*6)+'px) scale(.6)',opacity:0},{transform:C+'translateY('+(-c.u*.8)+'px) scale(1)',opacity:1,offset:.6},{transform:C+'translateY(0) scale(1.05,.95)',opacity:1}],600,0,'cubic-bezier(.3,1.2,.5,1)');
    var hit=600;for(var k=0;k<4;k++){bolt(c.x+(k-1.5)*c.u*.7,c.y-c.u*2.6,c.y,L.col,hit+k*110);}flash('#fff',hit+100,.6);R.zap(c.v,hit,c);burst(c.x,c.y-c.u,L.parts,14,c.u*2.4,hit+300,800,c.u*.6);shake(hit,6);buzz(200,hit);
    leave(a,1650,'translateY('+(-c.u*4)+'px)');return [['splash',100],['zap',hit],['zap',hit+250]];},
  POUNCE:function(c,L){var dir=c.x>innerWidth/2?-1:1,a=fig(c.atk,c.x,c.y,c.aw,c.ah);if(dir<0)a.classList.add('flip');var sx=-dir*c.u*5;
    an(a,[{transform:C+'translate('+sx+'px,0) scale(.7)',opacity:0},{transform:C+'translate('+sx+'px,0) scale(1,.85)',opacity:1,offset:.25},{transform:C+'translate('+(sx/2)+'px,'+(-c.u*4)+'px) rotate('+(dir*12)+'deg) scale(1.05)',opacity:1,offset:.55},{transform:C+'translate(0,0) rotate(0) scale(1.25,.75)',opacity:1,offset:.85},{transform:C+'translate(0,0) scale(1)',opacity:1}],900,0,'linear');
    var hit=770;R[L.react](c.v,hit,c);ring(c.x,c.y,L.col,hit,c.u*6,6);flash(L.col,hit,.6);shake(hit,9);burst(c.x,c.y,L.parts,16,c.u*3,hit,900,c.u*.7);buzz(90,hit);leave(a,1650);
    return [['whoosh',250],['roar',300],['smack',hit],['thud',hit]];},
  DIVE:function(c,L){var dir=c.x>innerWidth/2?-1:1,a=fig(c.atk,c.x,c.y,c.aw,c.ah);if(dir<0)a.classList.add('flip');
    an(a,[{transform:C+'translate('+(-dir*innerWidth*.7)+'px,'+(-innerHeight*.5)+'px) rotate('+(dir*35)+'deg) scale(.6)',opacity:0},{transform:C+'translate('+(-dir*innerWidth*.5)+'px,'+(-innerHeight*.36)+'px) rotate('+(dir*35)+'deg) scale(.9)',opacity:1,offset:.25},{transform:C+'translate(0,0) rotate('+(dir*20)+'deg) scale(1.1,.9)',opacity:1,offset:.75},{transform:C+'translate(0,0) rotate(0) scale(1)',opacity:1}],760,0,'cubic-bezier(.6,0,.9,.6)');
    for(var i=0;i<10;i++){var f=i/10,t=mk('pt',L.parts[i%L.parts.length],c.x-dir*innerWidth*.5*(1-f),c.y-c.u-innerHeight*.36*(1-f));t.style.fontSize=c.u*.7+'px';an(t,[{opacity:0},{opacity:1,offset:.2},{opacity:0,transform:M+'scale(.3)'}],520,180+i*45,'linear');}
    var hit=600;R[L.react](c.v,hit,c);flash(L.col,hit,.8);ring(c.x,c.y,L.col,hit,c.u*7,6);shake(hit,10);burst(c.x,c.y-c.u*.5,L.parts,18,c.u*3.2,hit,900,c.u*.75);buzz(110,hit);
    leave(a,1600,'translate('+(dir*c.u*5)+'px,'+(-c.u*6)+'px)');return [['whoosh',80],[L.snd||'fire',hit],['boom',hit]];},
  RAINBOW:function(c,L){var side=c.x>innerWidth/2?-1:1,ax=c.x-side*c.u*3.4;var a=fig(c.atk,ax,c.y+c.u*.3,c.aw,c.ah);if(side<0)a.classList.add('flip');enter(a,0,'translateY(-30px)');
    an(a,[{transform:C+'scale(1)'},{transform:C+'translateY(-14px) rotate('+(-side*10)+'deg)'},{transform:C+'scale(1)'}],500,300,'ease-in-out');
    var arc=mk('rbow','',(ax+c.x)/2,c.y-c.u*.6,Math.abs(c.x-ax)+c.u,c.u*3);an(arc,[{clipPath:side>0?'inset(0 100% 0 0)':'inset(0 0 0 100%)',opacity:1},{clipPath:'inset(0 0 0 0)',opacity:1,offset:.5},{clipPath:'inset(0 0 0 0)',opacity:0}],1000,500,'ease-out');
    var hit=850;R.dissolve(c.v,hit,c);burst(c.x,c.y-c.u,['🌈','✨','💖','⭐'],18,c.u*3,hit,1000,c.u*.7);flash('#ffd6f5',hit,.6);buzz(60,hit);leave(a,1700);
    return [['rise',300],['chime',hit],['sparkle',hit+150]];},
  HOLY:function(c,L){darken(0,1600,'rgba(10,8,40,.45)');var a=fig(c.atk,c.x-c.u*2.8,c.y-c.u*.8,c.aw,c.ah);enter(a,100,'translateY(-60px)');
    an(a,[{transform:C+'translateY(0)'},{transform:C+'translateY(-10px)'},{transform:C+'translateY(0)'}],900,450,'ease-in-out');
    var p=mk('pillar','',c.x,c.y,c.u*2.2,innerHeight);p.style.setProperty('--c',L.col);an(p,[{transform:'translate(-50%,-100%) scaleX(0)',opacity:0},{transform:'translate(-50%,-100%) scaleX(1)',opacity:1,offset:.25},{transform:'translate(-50%,-100%) scaleX(1)',opacity:1,offset:.75},{transform:'translate(-50%,-100%) scaleX(0)',opacity:0}],1200,500,'ease-out');
    var hit=650;R[L.react](c.v,hit+150,c);burst(c.x,c.y-c.u*.6,L.parts,14,c.u*2.4,hit,1000,c.u*.6,true);flash(L.col,hit,.5);buzz(50,hit);leave(a,1750,'translateY(-60px)');
    return [['rise',150],['chime',hit],['sparkle',hit+300]];},
  VORTEX:function(c,L){darken(0,1700,'rgba(6,2,24,.6)');var a=fig(c.atk,c.x-c.u*2.8,c.y+c.u*.2,c.aw,c.ah);enter(a,0,'translateY(-40px)');
    var hole=mk('hole','',c.x,c.y-c.u*.6,c.u*3.4,c.u*3.4);hole.style.setProperty('--c',L.col);an(hole,[{transform:M+'scale(0) rotate(0)',opacity:0},{transform:M+'scale(1) rotate(360deg)',opacity:1,offset:.4},{transform:M+'scale(1) rotate(900deg)',opacity:1,offset:.8},{transform:M+'scale(0) rotate(1200deg)',opacity:0}],1500,250,'ease-in-out');
    for(var i=0;i<14;i++){var ang=Math.random()*Math.PI*2,d=c.u*(2.5+Math.random()*2),s=mk('pt',L.parts[i%L.parts.length],c.x+Math.cos(ang)*d,c.y-c.u*.6+Math.sin(ang)*d);s.style.fontSize=c.u*.5+'px';
      an(s,[{transform:M+'translate(0,0)',opacity:0},{opacity:1,offset:.3},{transform:M+'translate('+(-Math.cos(ang)*d)+'px,'+(-Math.sin(ang)*d)+'px) rotate(400deg) scale(.1)',opacity:0}],800,400+i*40,'ease-in');}
    var hit=700;R.suck(c.v,hit,c,c.x,c.y-c.u*.6);flash(L.col,1650,.6);buzz(80,hit);leave(a,1750);return [['rise',250],['whoosh',hit],['boom',1650]];}
};

/* who does what (pawn id -> move, colour, particles, reaction, word) */
var FIN={
 p_whale:{m:'GULP',col:'#7ad8ff',parts:['🫧','💧','✨'],w:'GULP!'},
 p_griffin:{m:'DIVE',col:'#ffe14d',parts:['⚡','🪶','✨'],react:'zap',snd:'zap',w:'STORM STRIKE!'},
 p_ninefox:{m:'ORBS',col:'#ff7a3a',parts:['🔥','✨'],react:'burn',n:9,w:'FOXFIRE!'},
 p_time_golem:{m:'TIME',col:'#ffd27a',parts:['⏳','⚙️'],w:'TIME STOP!'},
 p_star_knight:{m:'METEOR',col:'#ffe680',parts:['🌟','⭐','✨'],react:'launch',w:'STARFALL!'},
 p_volcano_titan:{m:'SLAM',col:'#ff5a1a',parts:['🔥','🪨','💥'],react:'burn',big:1.35,w:'ERUPTION!'},
 p_ice_queen:{m:'BREATH',col:'#9fe8ff',parts:['❄️','✨','💠'],react:'freeze',snd:'freeze',w:'FROZEN!'},
 p_thunderbird:{m:'BOLT',col:'#ffe14d',parts:['⚡','🪶','💥'],react:'zap',w:'THUNDER!'},
 p_sun_stag:{m:'CHARGE',col:'#ffd23a',parts:['☀️','✨','🔆'],react:'burn',w:'SUNBURST!'},
 p_sea_serpent:{m:'WAVE',col:'#2fc9c0',parts:['🌊','🫧','💧'],react:'launch',w:'TIDAL WAVE!'},
 p_cosmic_owl:{m:'VORTEX',col:'#b48cff',parts:['✨','⭐','🌌'],w:'BLACK HOLE!'},
 p_sphinx:{m:'BEAM',col:'#ffcf4a',parts:['🔺','✨'],react:'crumble',w:'TURNED TO SAND!'},
 p_moon_goddess:{m:'HOLY',col:'#a9c4ff',parts:['🌙','✨','⭐'],react:'dissolve',w:'MOONBEAM!'},
 p_island_turtle:{m:'UPLIFT',col:'#7be37b',parts:['🌴','🪨','🌊'],w:'ISLAND RISE!'},
 p_lightning_tiger:{m:'CHARGE',col:'#ffe14d',parts:['⚡','🐾'],react:'zap',w:'LIGHTNING DASH!'},
 p_koi:{m:'TORNADO',col:'#5fd2ff',parts:['💧','🫧','🌸'],w:'WATERSPOUT!'},
 p_drum_titan:{m:'ROAR',col:'#ff8a3a',parts:['🎵','💥','🥁'],snd:'drum',w:'THUNDER DRUM!'},
 p_cat_queen:{m:'SLASH',col:'#ffd23a',parts:['💎','✨','👑'],claws:3,w:'ROYAL SWIPE!'},
 p_jellyfish:{m:'SHOCK',col:'#8ad0ff',parts:['⚡','🫧'],w:'SHOCKED!'},
 p_galaxy_panther:{m:'POUNCE',col:'#9a6bff',parts:['🌟','✨','💫'],react:'squash',w:'COSMIC POUNCE!'},
 p_hydra:{m:'BREATH',col:'#c79bff',parts:['💎','✨','💠'],react:'freeze',snd:'freeze',w:'CRYSTALLIZED!'},
 p_reindeer:{m:'DIVE',col:'#7dffb0',parts:['✨','❄️','💚'],react:'dissolve',snd:'chime',w:'AURORA DASH!'},
 p_ram_king:{m:'CHARGE',col:'#ff6a2a',parts:['🔥','💥'],react:'launch',w:'HEADBUTT!'},
 p_mech_titan:{m:'BEAM',col:'#ff4a5a',parts:['💥','⚙️','✨'],react:'dissolve',w:'LASER CANNON!'},
 p_sky_giant:{m:'SLAM',col:'#bfe0ff',parts:['☁️','💥','🪨'],react:'squash',big:1.5,w:'SKY SMASH!'},
 p_phoenix:{m:'DIVE',col:'#ff6a1a',parts:['🔥','🪶','✨'],react:'burn',w:'PHOENIX DIVE!'},
 p_lion_king:{m:'ROAR',col:'#ffc23a',parts:['💢','💥','👑'],w:'KING’S ROAR!'},
 p_unicorn:{m:'RAINBOW',col:'#ff9bd9',parts:['🌈','✨'],w:'RAINBOW BLAST!'},
 p_mermaid:{m:'WAVE',col:'#4de0d0',parts:['🫧','🐚','💧'],react:'launch',w:'SIREN WAVE!'},
 p_angel_knight:{m:'HOLY',col:'#fff3b0',parts:['✨','🪶','⭐'],react:'ascend',w:'HOLY LIGHT!'}
};
var DEF={react:'squash',big:1};

function victimInfo(pw){
  for(var s=0;s<4;s++){if(!PW[s])continue;for(var i=0;i<4;i++)if(PW[s][i]===pw){var pl=S.players.filter(function(p){return p.seat===s;})[0];return {seat:s,pid:pl?String(lookOf(pl).p):'n_classic'};}}
  return null;
}
function victimHTML(info){if(!info)return sprite('n_classic','red');var col=colOf(info.seat);
  if(window.__ludoraPawnImg&&/^(p_|n_)/.test(info.pid))return sprite(info.pid,col);return '<img alt="" src="pawns/'+(['red','green','yellow','blue'].indexOf(col)>=0?col:'red')+'.webp" style="width:100%;height:100%;object-fit:contain">';}

function finisher(gx,gy,pid,victims,atkSeat,demoV){
  var L=FIN[pid];if(!L)return false;try{if(set.lowfx)return false;}catch(e){}
  L=Object.assign({},DEF,L);
  var b=document.getElementById('board'),r=b?b.getBoundingClientRect():null,u,x0,y0,x,y;
  if(gx==null||!r||!r.width){var W=Math.min(innerWidth,500);r={left:(innerWidth-W)/2,top:innerHeight*.18,width:W,height:W};x=x0=innerWidth/2;y=y0=innerHeight*.66;u=Math.max(W/10.5,32);}
  else{u=r.width/15;x0=r.left+gx*u;y0=r.top+gy*u+u*.45;x=r.left+r.width/2;y=r.top+r.height*.74;u=Math.max(r.width/10.5,32);}
  var aw=u*4.4,ah=aw*224/200,vw=u*2,vh=vw*224/200;
  var atkHTML=sprite(pid,colOf(atkSeat));
  var vinfo=victims&&victims[0]?victimInfo(victims[0]):null;
  var v=fig(demoV?sprite(demoV.vpid,demoV.vcol):victimHTML(vinfo),x,y,vw,vh);v.classList.add('vic');
  an(v,[{left:x0+'px',top:y0+'px'},{left:x+'px',top:y+'px'}],260,0,'cubic-bezier(.3,1.2,.5,1)');
  (victims||[]).forEach(function(pw){if(pw&&pw.pin)try{pw.pin.animate([{opacity:0},{opacity:0,offset:.92},{opacity:1}],{duration:2300});}catch(e){}});
  var c={x:x,y:y,u:u,aw:aw,ah:ah,vw:vw,vh:vh,v:v,atk:atkHTML};
  var dim=mk('flash','',0,0);dim.style.background='radial-gradient(circle at '+x+'px '+(y-u*1.5)+'px,rgba(10,6,40,.25),rgba(6,4,24,.8) 65%)';dim.style.mixBlendMode='normal';an(dim,[{opacity:0},{opacity:1,offset:.12},{opacity:1,offset:.85},{opacity:0}],2300,0,'linear');
  var snd=MOVES[L.m](c,L)||[];play(snd);
  word(L.w,L.col,innerWidth/2,Math.max(70,Math.min(y-u*4.2,innerHeight*.3)),L.m==='SLAM'?820:700);
  ghost(x,y-u,1150,u);
  clearTimeout(finisher.t);finisher.t=setTimeout(function(){if(layer)layer.innerHTML='';},2500);
  return true;
}
window.__ludoraFinisher=finisher;
function demo(pid){var vs=['red','green','yellow'];finisher(null,null,pid,null,3,{vpid:'n_classic',vcol:vs[Math.floor(Math.random()*3)]});}
window.__ludoraFinDemo=demo;window.__ludoraFIN=FIN;

/* hook into captures: Legendary pawns get the finisher instead of the small burst */
var bfx10=bumpFx;
bumpFx=function(gx,gy,pid,victims){
  var it=pawnItem(pid);
  if(it&&it.r==='legendary'&&FIN[pid]){var atk=S.capBy>=0?S.capBy:(cur()?cur().seat:0);if(finisher(gx,gy,pid,victims,atk))return;}
  return bfx10.apply(this,arguments);
};

/* store: watch a Legendary finishing move before buying */
var rib10=renderItemBtns;
renderItemBtns=function(){
  rib10.apply(this,arguments);
  try{var cat=itemCtx.cat,it=itemCtx.it;if(cat!=='pawn'||it.r!=='legendary'||!FIN[it.id])return;
    var box=$('#i-btns'),b=el('button','btn fin9btn',null);b.type='button';b.innerHTML='▶ See finishing move';box.insertBefore(b,box.firstChild);
    b.addEventListener('click',function(){ensureAudio();demo(String(it.id));});
  }catch(e){}
};

/* ---------- 1.8: sound polish ---------- */
(function(){
  var b0=sfx.bump;sfx.bump=function(){b0&&b0();SND.smack(0);SND.thud(.05);};
  var h0=sfx.home;sfx.home=function(){h0&&h0();SND.sparkle(.25);};
  var w0=sfx.win;sfx.win=function(){w0&&w0();SND.sparkle(.1);SND.boom(0);};
  var s0=sfx.six;sfx.six=function(){s0&&s0();tn(.12,1760,.18,'sine',.12);};
  new MutationObserver(function(){if(dieEl&&dieEl.classList.contains('land')){tn(0,190,.07,'triangle',.22);nz(0,.06,2600,1,.18,'bandpass');}}).observe(dieEl,{attributes:true,attributeFilter:['class']});
  var lastClick=0;
  document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('button,.t9,.item');if(!t||t.id==='die'||Date.now()-lastClick<60)return;lastClick=Date.now();tn(0,620,.05,'sine',.08,900);},true);
})();

/* ---------- 1.8: online self-healing (host re-sends the state; a missed message can never leave a player stuck) ---------- */
(function(){
  var lastWin=null;
  var nee=netEmitEv;netEmitEv=function(m){if(m&&m.ev==='win')lastWin=m;else if(m&&m.ev==='start')lastWin=null;return nee.apply(this,arguments);};
  setInterval(function(){
    try{if(!NET.on||!NET.host||!NET.room||!S.players.length||S.phase==='idle')return;
      if(S.phase==='over'){if(lastWin&&!lastWin.__n){lastWin.__n=0;}if(lastWin&&(lastWin.__n=(lastWin.__n||0)+1)<=5)nee(lastWin);return;}
      nee(netSnap('sync'));}catch(e){}
  },2500);
  /* client: ignore an older copy of a state it already has */
  var gh10=gHandle;gHandle=async function(m){
    if(m&&m.q&&!NET.host){if(m.ev==='win'&&S.phase==='over'&&NET.lastWinQ===m.q)return;if(m.ev==='win')NET.lastWinQ=m.q;}
    return gh10.apply(this,arguments);
  };
})();
})();
