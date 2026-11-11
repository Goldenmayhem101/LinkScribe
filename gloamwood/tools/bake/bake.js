// Bakes painted art layers for each biome into ../../assets/<biome>/ (run: node bake.js)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const STYLE={
  gloamwood:{seed:0,trees:{oak:2,willow:1.5,pine:1.2}},
  crystal:{seed:101,trees:{crystal:2.5,pine:1,willow:.5}},
  emberfen:{seed:202,trees:{dead:2.5,willow:1.5,oak:.6}},
  frostveil:{seed:303,trees:{pine:3,dead:.8,crystal:.4}},
  verdant:{seed:404,trees:{oak:2.5,willow:2,pine:.6}},
  voidreach:{seed:505,trees:{crystal:2,dead:1,willow:.6}},
};
const BIOMES={
  gloamwood:{ink:[16,19,40],dusk:[96,66,128],moss:[46,128,120],moon:[222,242,255],ember:[255,176,90]},
  crystal:{ink:[10,16,36],dusk:[42,72,140],moss:[70,186,205],moon:[232,248,255],ember:[255,128,206]},
  emberfen:{ink:[24,14,22],dusk:[120,52,62],moss:[96,120,58],moon:[255,232,206],ember:[255,140,60]},
  frostveil:{ink:[14,22,42],dusk:[96,128,178],moss:[150,212,232],moon:[242,250,255],ember:[255,204,128]},
  verdant:{ink:[24,20,30],dusk:[156,84,96],moss:[92,152,72],moon:[255,236,202],ember:[255,172,64]},
  voidreach:{ink:[8,6,24],dusk:[74,32,128],moss:[40,222,204],moon:[212,202,255],ember:[255,64,164]},
};
(async()=>{const b=await chromium.launch();const p=await b.newPage();
  await p.goto('file://'+path.join(__dirname,'bake.html'));
  for(const [name,pal] of Object.entries(BIOMES)){
    const st=STYLE[name];const res=await p.evaluate(([pal,st])=>window.__bake(pal,2,st.seed,st.trees),[pal,st]);
    const dir=path.join(__dirname,'../../assets',name);fs.mkdirSync(dir,{recursive:true});
    for(const [k,url] of Object.entries(res.out))fs.writeFileSync(path.join(dir,k+'.png'),Buffer.from(url.split(',')[1],'base64'));
    fs.writeFileSync(path.join(dir,'meta.json'),JSON.stringify(res.meta,null,1));
    console.log('baked',name,Object.keys(res.out).length,'images');}
  await b.close();})();
