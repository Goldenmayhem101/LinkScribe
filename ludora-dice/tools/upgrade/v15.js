
/* ===== Ludora 1.10: Google Play cloud save =====
   The Android app signs the player in to Google Play Games and keeps one saved game ("ludora") in their Google account.
   This part decides what to save, when, and what to do when a save from another phone is found.
   In a web browser (no Android app) nothing here runs. */
(function(){
  var A=window.AndroidApp;
  if(!A||typeof A.cloudStatus!=='function')return;
  var T=function(s){try{return (window.__ludoraLang&&__ludoraLang.tr(s))||s;}catch(e){return s;}};
  var C={st:'off',name:'',lastSent:'',loaded:false,busy:false,asked:false};
  function readLocal(){try{return localStorage.getItem('ludora.v3')||'';}catch(e){return '';}}
  function games(s){return (s&&s.st&&+s.st.g)||0;}
  function lvlOf(s){var xp=+((s&&s.xpT)||0),l=1,need=300;while(xp>=need&&l<999){xp-=need;l++;need=300+l*60;}return l;}
  // progress used by Google to pick the better save if two phones disagree: games played first, then XP
  function progress(s){return games(s)*1000000+Math.min(999999,Math.floor(+((s&&s.xpT)||0)));}
  // what goes to the cloud: the whole game save except the avatar photo (that one stays on the phone, as Settings says)
  function pack(){
    var raw=readLocal();if(!raw)return null;var s;try{s=JSON.parse(raw);}catch(e){return null;}
    delete s.photo;
    var sess=null;try{sess=JSON.parse(localStorage.getItem('ludora.sess')||'null');}catch(e){}
    return {data:JSON.stringify({v:1,save:s,sess:sess,at:Date.now()}),p:progress(s),d:'Level '+lvlOf(s)+' · '+games(s)+' games'};
  }
  function upload(force){
    if(C.st!=='in'||!C.loaded||C.busy)return;
    var raw=readLocal();if(!raw||(!force&&raw===C.lastSent))return;
    var p=pack();if(!p)return;
    C.busy=true;C.lastSent=raw;
    try{A.cloudSave(p.data,p.p,p.d);}catch(e){C.busy=false;}
  }
  function restore(cloud){
    try{
      var cur=null;try{cur=JSON.parse(readLocal()||'null');}catch(e){}
      var s=cloud.save;if(cur&&cur.photo)s.photo=cur.photo;   // keep this phone's photo
      localStorage.setItem('ludora.v3',JSON.stringify(s));
      if(cloud.sess)localStorage.setItem('ludora.sess',JSON.stringify(cloud.sess));
    }catch(e){return;}
    try{sessionStorage.setItem('ludora.restored','1');}catch(e){}
    location.reload();
  }
  function ask(cloud,cb){
    var o=document.createElement('div');o.className='cs15o';
    var cs=cloud.save||{};
    o.innerHTML='<div class="cs15"><div class="cs15i">☁️</div><b></b><p></p><div class="cs15b"><button type="button" class="btn">'
      +'</button><button type="button" class="btn ghost"></button></div></div>';
    o.querySelector('b').textContent=T('Saved progress found');
    o.querySelector('p').textContent=T('Your Google Play account has a saved game')+': '+T('Level')+' '+lvlOf(cs)+' · '+games(cs)+' '+T('games')+'. '+T('Load it on this phone?');
    var b=o.querySelectorAll('button');b[0].textContent=T('Use the saved game');b[1].textContent=T('Keep the progress on this phone');
    b[0].onclick=function(){o.remove();cb(true);};b[1].onclick=function(){o.remove();cb(false);};
    document.body.appendChild(o);
  }
  // called by the app after it read the cloud save (json may be empty when there is none yet)
  function onLoaded(json){
    C.loaded=true;var cloud=null;
    if(json){try{cloud=JSON.parse(json);}catch(e){cloud=null;}}
    var local=null;try{local=JSON.parse(readLocal()||'null');}catch(e){}
    if(cloud&&cloud.save&&progress(cloud.save)>progress(local)){
      if(games(local)===0)return restore(cloud);                 // fresh install: bring everything back
      if(C.asked)return;C.asked=true;
      return ask(cloud,function(yes){if(yes)restore(cloud);else upload(true);});
    }
    upload(true);                                                 // this phone is ahead (or equal): keep the cloud up to date
  }
  function sync(){                                                // Settings line
    var r=document.getElementById('s-cloud');if(!r)return;
    var t=r.querySelector('small'),b=r.querySelector('button');
    if(C.st==='in'){t.textContent=(C.name?C.name+' · ':'')+T('Your progress is saved to Google Play');b.textContent=T('Save now');}
    else{t.textContent=T('Sign in to keep your progress if you change or reset your phone');b.textContent=T('Sign in');}
  }
  window.__cloud={
    state:function(st,name){
      var was=C.st;C.st=st;if(name)C.name=name;sync();
      if(st==='in'&&was!=='in'){try{A.cloudLoad();}catch(e){}}
    },
    loaded:onLoaded,
    saved:function(ok){C.busy=false;if(!ok)C.lastSent='';if(C.manual){C.manual=false;toast15(ok?T('Saved to Google Play'):T('Could not save. Try again later.'));}},
    flush:function(){upload(false);}
  };
  function toast15(t){try{if(typeof toast==='function'){toast(t);return;}}catch(e){}
    var d=document.createElement('div');d.className='cs15t';d.textContent=t;document.body.appendChild(d);setTimeout(function(){d.remove();},2600);}
  // Settings: "Google Play save" row under the language
  (function(){
    var sb=document.querySelector('#ov-settings .sb');if(!sb)return;
    var h=document.createElement('h3');h.textContent=T('Google Play save');
    var r=document.createElement('div');r.className='cs15r';r.id='s-cloud';
    r.innerHTML='<div class="cs15x"><span class="cs15g">☁️</span><span><b>Google Play</b><small></small></span></div><button type="button" class="btn ghost cs15s"></button>';
    var lang=document.getElementById('s-lang');var after=lang?lang.nextSibling:sb.firstChild;
    sb.insertBefore(h,after);sb.insertBefore(r,after);
    r.querySelector('button').onclick=function(){
      if(C.st==='in'){C.manual=true;upload(true);}else{try{A.cloudSignIn();}catch(e){}}
    };
    sync();
  })();
  try{if(sessionStorage.getItem('ludora.restored')){sessionStorage.removeItem('ludora.restored');setTimeout(function(){toast15(T('Welcome back! Your progress was restored from Google Play.'));},1500);}}catch(e){}
  // save a little while after anything changes, and when the app goes to the background (MainActivity calls flush)
  setInterval(function(){upload(false);},20000);
  try{window.__cloud.state(A.cloudStatus(),'');}catch(e){}
})();
