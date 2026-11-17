const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:512,height:512}});
for(const n of ['A','B','C']){await p.goto('file://'+process.cwd()+'/icon'+n+'.html');await p.waitForTimeout(400);await p.screenshot({path:'icon'+n+'.png'});}
await b.close();})();
