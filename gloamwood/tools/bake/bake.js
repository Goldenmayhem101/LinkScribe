// Bakes painted art layers for each biome into ../../assets/<biome>/ (run: node bake.js)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const BIOMES={
  gloamwood:{ink:[16,19,40],dusk:[96,66,128],moss:[46,128,120],moon:[222,242,255],ember:[255,176,90]},
  crystal:{ink:[10,16,36],dusk:[42,72,140],moss:[70,186,205],moon:[232,248,255],ember:[255,128,206]},
  emberfen:{ink:[24,14,22],dusk:[120,52,62],moss:[96,120,58],moon:[255,232,206],ember:[255,140,60]},
};
(async()=>{const b=await chromium.launch();const p=await b.newPage();
  await p.goto('file://'+path.join(__dirname,'bake.html'));
  for(const [name,pal] of Object.entries(BIOMES)){
    const res=await p.evaluate(([pal])=>window.__bake(pal,2),[pal]);
    const dir=path.join(__dirname,'../../assets',name);fs.mkdirSync(dir,{recursive:true});
    for(const [k,url] of Object.entries(res.out))fs.writeFileSync(path.join(dir,k+'.png'),Buffer.from(url.split(',')[1],'base64'));
    fs.writeFileSync(path.join(dir,'meta.json'),JSON.stringify(res.meta,null,1));
    console.log('baked',name,Object.keys(res.out).length,'images');}
  await b.close();})();
