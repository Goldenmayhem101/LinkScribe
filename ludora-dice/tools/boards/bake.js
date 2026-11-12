// Bakes boards/<id>.webp (board art) and boards/<id>-w.webp (world behind the board)
const {chromium}=require('playwright');const fs=require('fs');
const specs=require('./specs.js');
(async()=>{
fs.mkdirSync('boards',{recursive:true});
const only=process.argv[2];
const b=await chromium.launch();const p=await b.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/painter.html');
await p.evaluate(()=>document.fonts.load('40px "Noto Color Emoji"'));
for(const id of Object.keys(specs)){
  if(only&&id!==only)continue;
  const s=specs[id];
  const bd=await p.evaluate(sp=>paintBoard(sp,1080),s);
  fs.writeFileSync(`boards/${id}.webp`,Buffer.from(bd.split(',')[1],'base64'));
  const wd=await p.evaluate(sp=>paintWorld(sp,720,1280),s);
  fs.writeFileSync(`boards/${id}-w.webp`,Buffer.from(wd.split(',')[1],'base64'));
  process.stdout.write(id+' ');
}
console.log('\nerrors',errs);await b.close();})();
