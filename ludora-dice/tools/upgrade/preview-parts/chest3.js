/* six chest tiers, drawn three-quarter view: light 3D (front, side, top) with the same thin outline as the UI */
var CH2={
 wood:   {n:'Wooden', flat:1, body:['#e3a868','#b8732f'], side:['#a8662a','#7a4518'], lid:['#f0bf82','#c98a48'], trim:['#a56a32','#6e4018'], tile:'#fff1de', plank:1},
 iron:   {n:'Iron',   body:['#d29358','#a4612a'], side:['#93541f','#683812'], lid:['#e2a86c','#b8743a'], trim:['#8a909e','#3e4350'], tile:'#eef0f4', plank:1, rivet:1},
 silver: {n:'Silver', body:['#fbf5e6','#ddd0b0'], side:['#cfc19c','#a8987a'], lid:['#ffffff','#e6dbbd'], trim:['#e8ecf2','#8d97a8'], tile:'#f4f6fa', motif:'diamond', gem:'#5fc8ff'},
 royal:  {n:'Royal',  body:['#8a5af0','#4a20a8'], side:['#4a20a8','#2c0f70'], lid:['#a47cff','#6236c8'], trim:['#ffffff','#9aa3b8'], tile:'#f1eaff', motif:'swirl', gem:'#ff4aa0'},
 gold:   {n:'Golden', body:['#e8343f','#a0101e'], side:['#a0101e','#6a0812'], lid:['#ff5a5f','#c0182a'], trim:['#fff1a0','#d0920e'], tile:'#fff4cc', motif:'swirl', gem:'#2ee87a'},
 crystal:{n:'Crystal',body:['#9ff0ff','#3a8cff'], side:['#5a9cff','#4a3ad0'], lid:['#c8f8ff','#5ab4ff'], trim:['#fff3b0','#d0920e'], tile:'#e6f7ff', crystal:1, gem:'#ffffff'}
};
var L2='#1c1d2b';
function chestSvg(t,open){
  var p=CH2[t]||CH2.wood,u='q'+t+(open?'o':'c'),s='';
  function lg(id,a,b,x2,y2){return '<linearGradient id="'+id+u+'" x1="0" y1="0" x2="'+(x2||0)+'" y2="'+(y2==null?1:y2)+'"><stop offset="0" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></linearGradient>';}
  s+='<svg viewBox="0 0 120 110" class="chsvg"><defs>'+lg('f',p.body[0],p.body[1])+lg('s',p.side[0],p.side[1])+lg('l',p.lid[0],p.lid[1])+lg('m',p.trim[0],p.trim[1],1,1)+
   '<radialGradient id="g'+u+'" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff8c8"/><stop offset=".5" stop-color="#ffd23f" stop-opacity=".6"/><stop offset="1" stop-color="#ffd23f" stop-opacity="0"/></radialGradient>'+
   '<radialGradient id="c'+u+'" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff6a8"/><stop offset=".6" stop-color="#f5b81a"/><stop offset="1" stop-color="#b87a05"/></radialGradient>'+
   '<radialGradient id="h'+u+'" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#8ae8ff" stop-opacity=".7"/><stop offset="1" stop-color="#8ae8ff" stop-opacity="0"/></radialGradient></defs>';
  var O=' stroke="'+L2+'" stroke-width="2" stroke-linejoin="round"';
  s+='<ellipse cx="60" cy="100" rx="46" ry="6" fill="rgba(28,29,43,.18)"/>';
  if(p.crystal)s+='<circle cx="60" cy="58" r="56" fill="url(#h'+u+')"/>';
  if(open)s+='<g class="rays" style="transform-origin:58px 46px">'+[0,40,80,120,160,200,240,280,320].map(function(a){return '<path d="M58 46 L54 2 L62 2Z" fill="#ffe27a" opacity=".5" transform="rotate('+a+' 58 46)"/>';}).join('')+'</g><circle cx="58" cy="46" r="40" fill="url(#g'+u+')"/>';
  /* geometry: front A(14,58)-B(84,58)-C(84,98)-D(14,98); side offset (20,-10) */
  var lidLine=function(x){return 'M'+x+' 58 C'+(x-3)+' 38 '+(x+4)+' 27 '+(x+12)+' 26';};
  if(open){
    /* lid tipped back, inside showing */
    var inner=p.crystal?'#bff4ff':(t==='gold'||t==='royal')?'#7a0f2a':p.lid[1];
    if(p.flat){
      s+='<path d="M34 48 L104 48 L104 16 L34 16Z" fill="url(#l'+u+')"'+O+'/><path d="M38 44 L100 44 L100 20 L38 20Z" fill="'+inner+'" opacity=".55"/>';
    } else {
      s+='<path d="M34 48 L34 22 Q34 8 50 8 L90 8 Q104 8 104 22 L104 48Z" fill="url(#l'+u+')"'+O+'/>';
      s+='<path d="M39 46 L39 24 Q39 13 51 13 L89 13 Q99 13 99 24 L99 46Z" fill="'+inner+'"/>';
      [50,88].forEach(function(x){s+='<rect x="'+(x-4)+'" y="8.5" width="8" height="39" fill="url(#m'+u+')"'+O+'/>';});
    }
    /* opening */
    s+='<path d="M14 58 L84 58 L104 48 L34 48Z" fill="#2a1408"'+O+'/>';
    /* treasure heap */
    var coins=[[26,54],[36,50],[46,52],[56,48],[66,50],[76,52],[86,49],[94,49],[41,45],[52,43],[63,44],[74,45],[85,44],[57,38],[69,39],[47,39]];
    coins.forEach(function(c){s+='<ellipse cx="'+c[0]+'" cy="'+c[1]+'" rx="6" ry="4.6" fill="url(#c'+u+')" stroke="'+L2+'" stroke-width="1.3"/><path d="M'+(c[0]-3)+' '+(c[1]-1.5)+' q3 -2 5 0" stroke="#fff" stroke-width="1" fill="none" opacity=".8"/>';});
    var dia=function(x,y,k,col){return '<g transform="translate('+x+' '+y+') scale('+k+')"><path d="M-7 -3 L-4 -8 L4 -8 L7 -3 L0 7Z" fill="'+col+'"'+O+'/><path d="M-7 -3 L7 -3 M-4 -8 L0 -3 L4 -8 M0 -3 L0 7" stroke="rgba(255,255,255,.7)" stroke-width="1" fill="none"/></g>';};
    if(t!=='wood')s+=dia(62,33,1,'#6fd4ff');
    if(t==='silver'||t==='royal'||t==='gold'||t==='crystal')s+=dia(80,38,.75,'#6fd4ff');
    if(t==='royal'||t==='gold')s+=dia(40,38,.8,t==='gold'?'#ff3b5c':'#c06bff')+dia(90,42,.6,'#2ee87a');
    if(t==='gold')s+='<path d="M24 52 q10 6 22 2 q12 -4 22 3" stroke="#fff" stroke-width="3" stroke-dasharray=".1 4.5" stroke-linecap="round" fill="none"/>';
    if(t==='crystal')s+=dia(44,36,1.1,'#bff4ff')+dia(62,26,1.4,'#e8fbff')+dia(86,36,.9,'#9ae8ff');
  } else {
    /* closed lid */
    if(p.flat){
      s+='<path d="M14 58 L84 58 L84 42 L14 42Z" fill="url(#l'+u+')"'+O+'/>';
      s+='<path d="M14 42 L84 42 L104 32 L34 32Z" fill="'+p.lid[0]+'"'+O+'/>';
      s+='<path d="M84 58 L104 48 L104 32 L84 42Z" fill="url(#s'+u+')"'+O+'/>';
      s+='<path d="M24 37 L94 37" stroke="rgba(90,45,10,.3)" stroke-width="1.3"/><path d="M14 50 H84" stroke="rgba(90,45,10,.3)" stroke-width="1.3"/>';
    } else {
      /* right end cap */
      s+='<path d="M84 58 C81 38 88 27 96 26 C105 26 107 36 104 48Z" fill="url(#s'+u+')"'+O+'/>';
      /* curved top */
      s+='<path d="M14 58 C11 38 18 27 26 26 L96 26 C88 27 81 38 84 58Z" fill="url(#l'+u+')"'+O+'/>';
      s+='<path d="M21 42 C21 35 25 31 31 31 L76 31" stroke="#fff" stroke-width="2.5" fill="none" opacity=".45" stroke-linecap="round"/>';
      if(p.plank)s+='<path d="M14.5 50 H84 M16 38 H85" stroke="rgba(90,45,10,.3)" stroke-width="1.3"/>';
      if(p.crystal)s+='<path d="M30 30 L44 56 M52 28 L40 56 M62 28 L74 57 M80 28 L66 57" stroke="rgba(255,255,255,.55)" stroke-width="1.4"/>';
      /* lid bands */
      [24,74].forEach(function(x){s+='<path d="'+lidLine(x)+'" stroke="'+L2+'" stroke-width="10" fill="none"/><path d="'+lidLine(x)+'" stroke="url(#m'+u+')" stroke-width="7" fill="none"/>';});
      if(p.rivet)[[23,46],[73,46]].forEach(function(r){s+='<circle cx="'+r[0]+'" cy="'+r[1]+'" r="1.6" fill="'+L2+'"/>';});
      if(p.crystal)s+='<g transform="translate(60 23)"><path d="M-8 0 L-4 -8 L4 -8 L8 0 L0 9Z" fill="#e8fbff"'+O+'/><path d="M-8 0 H8 M-4 -8 L0 0 L4 -8" stroke="#6fd4ff" stroke-width="1" fill="none"/></g>';
      else if(p.gem)s+='<path d="M54 26 l6 -6 l6 6 l-6 5Z" fill="'+p.gem+'"'+O+'/>';
    }
  }
  /* body front + side */
  s+='<path d="M14 58 L84 58 L84 98 L14 98Z" fill="url(#f'+u+')"'+O+'/>';
  s+='<path d="M84 58 L104 48 L104 88 L84 98Z" fill="url(#s'+u+')"'+O+'/>';
  if(p.plank)s+='<path d="M14 71 H84 L104 61 M14 84 H84 L104 74" stroke="rgba(90,45,10,.35)" stroke-width="1.3" fill="none"/>';
  if(p.crystal)s+='<path d="M14 72 L34 58 L50 98 M50 58 L66 98 M66 58 L84 80 M84 72 L104 56 M90 95 L98 52" stroke="rgba(255,255,255,.5)" stroke-width="1.4" fill="none"/>';
  if(p.motif==='diamond')s+='<path d="M30 78 l6 -8 l6 8 l-6 8Z M68 78 l4 -6 l4 6 l-4 6Z" fill="none" stroke="'+p.trim[1]+'" stroke-width="1.6"/>';
  if(p.motif==='swirl')s+='<path d="M22 90 q6 -14 16 -6 q-8 2 -4 8 M76 90 q-6 -14 -16 -6 q8 2 4 8" fill="none" stroke="url(#m'+u+')" stroke-width="2.4" stroke-linecap="round"/>';
  /* trims: top rim, base, corners, vertical bands */
  if(!p.flat||true){
    s+='<path d="M12 56 L86 56 L106 46 L106 51 L86 61 L12 61Z" fill="url(#m'+u+')"'+O+'/>';
    s+='<path d="M12 94 L86 94 L106 84 L106 89 L86 99 L12 99Z" fill="url(#m'+u+')"'+O+'/>';
  }
  if(!p.flat){[24,74].forEach(function(x){s+='<rect x="'+(x-4)+'" y="60" width="8" height="35" fill="url(#m'+u+')"'+O+'/>';});s+='<path d="M93 54 L99 51 L99 87 L93 90Z" fill="url(#m'+u+')"'+O+'/>';}
  else{s+='<rect x="12" y="60" width="6" height="35" fill="url(#m'+u+')"'+O+'/><rect x="80" y="60" width="6" height="35" fill="url(#m'+u+')"'+O+'/>';}
  if(p.rivet)[[24,67],[24,86],[74,67],[74,86],[96,62],[96,80]].forEach(function(r){s+='<circle cx="'+r[0]+'" cy="'+r[1]+'" r="1.7" fill="#c8ccd6" stroke="'+L2+'" stroke-width="1"/>';});
  if(p.crystal)[[14,58],[84,58],[14,98],[84,98],[104,48],[104,88]].forEach(function(r){s+='<path d="M'+(r[0])+' '+(r[1]-4)+' l3.5 4 l-3.5 4 l-3.5 -4Z" fill="#fff"'+O.replace('2"','1.2"')+'/>';});
  if(t!=='wood'&&!p.flat)s+='<path d="M104 64 q6 0 6 6 q0 6 -6 6" fill="none" stroke="'+L2+'" stroke-width="4.5"/><path d="M104 64 q6 0 6 6 q0 6 -6 6" fill="none" stroke="url(#m'+u+')" stroke-width="2.5"/>';
  /* lock plate */
  if(!open){
    if(p.flat)s+='<path d="M42 50 H56 V64 L49 69 L42 64Z" fill="#8d97a8"'+O+'/>';
    else s+='<path d="M39 50 H59 V68 Q49 76 39 68Z" fill="url(#m'+u+')"'+O+'/>';
    var ky=p.flat?57:60;
    s+='<circle cx="'+(p.flat?49:49)+'" cy="'+ky+'" r="2.6" fill="'+L2+'"/><path d="M47.8 '+(ky+1)+' L47 '+(ky+6)+' L51 '+(ky+6)+' L50.2 '+(ky+1)+'Z" fill="'+L2+'"/>';
    if(p.gem&&!p.crystal)s+='<circle cx="49" cy="52.5" r="2.2" fill="'+p.gem+'" stroke="'+L2+'" stroke-width="1"/>';
  }
  if(p.crystal)s+='<text x="104" y="30" font-size="11">✨</text><text x="6" y="54" font-size="8">✨</text>';
  return s+'</svg>';
}
