const MODS=['at Night','in a Storm','Flooded','Frozen','Burning','in Fog','Upside-Down','Overgrown','in a Sandstorm','Under the Eclipse'];
function worldOf(k){
  if(k<PLACES.length){const p=PLACES[k];return {k,name:p[0],theme:p[1],where:p[2],stages:p[3],mod:''};}
  const i=k-PLACES.length,p=PLACES[(i*7+3)%PLACES.length],m=MODS[Math.floor(i/PLACES.length+i)%MODS.length];
  return {k,name:p[0]+' '+m,theme:p[1],where:p[2],stages:p[3].slice(),mod:m,remix:true};
}
/* who lives where: every stage brings brand-new monsters that suit the place; stage 3 has an elite, stage 5 a boss */
