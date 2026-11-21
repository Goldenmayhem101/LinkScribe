/* ===================== languages: the game follows the phone's language (about 50 languages), changeable in Settings =====================
   Text on screen is translated as it appears. Each language lives in its own small file (lang/<code>.json).
   Names of boards, dice and other collectibles stay as they are. */
(function(){
var CODES=['en','ar','az','bg','bn','ca','cs','da','de','el','es','et','eu','fa','fi','fr','ga','gl','he','hi','hu','id','it','ja','ko','ky','lt','lv','ms','nb','nl','pl','pt','ro','ru','sk','sl','sq','sv','sw','th','tl','tr','uk','ur','vi','zh','zt','af','am','hy','my','km','lo','ka','kk','uz','tg','mn','ne','si','ta','te','mr','gu','kn','ml','pa','ps','sr','hr','bs','mk','is','mt','be','so','ha','yo','ig','zu','xh','rw','mg','ny','sn','om','ti','ht','lb','cy','jv','tk','ku','or','as','wo','ln','st','tn','lg','ckb','sd','ug','fo','qu','gn','ay'];
var RTL={ar:1,fa:1,he:1,ur:1,ps:1,ckb:1,sd:1,ug:1};
function phoneLang(){
  var L=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||'en']);
  for(var i=0;i<L.length;i++){var t=String(L[i]).toLowerCase(),b=t.split('-')[0];
    if(b==='zh')return /tw|hk|mo|hant/.test(t)?'zt':'zh';
    if(b==='no'||b==='nn')return 'nb';if(b==='iw')return 'he';if(b==='in')return 'id';if(b==='fil')return 'tl';if(b==='ku'&&/arab|iq|ir/.test(t))return 'ckb';if(b==='mo')return 'ro';
    if(CODES.indexOf(b)>=0)return b;}
  return 'en';
}
var OWN={ay:'Aymar aru',qu:'Runa Simi',gn:"Avañe'ẽ",ny:'Chichewa',om:'Afaan Oromoo',ln:'Lingála',lg:'Luganda',wo:'Wolof',tn:'Setswana',st:'Sesotho',sn:'chiShona',rw:'Kinyarwanda',ckb:'کوردیی ناوەندی',ku:'Kurdî',fo:'Føroyskt',ht:'Kreyòl ayisyen',mg:'Malagasy',jv:'Basa Jawa',tk:'Türkmen dili',ug:'ئۇيغۇرچە',sd:'سنڌي',ti:'ትግርኛ',xh:'isiXhosa',zu:'isiZulu',ig:'Igbo',yo:'Yorùbá',ha:'Hausa',so:'Soomaali',mt:'Malti',lb:'Lëtzebuergesch',cy:'Cymraeg',or:'ଓଡ଼ିଆ',as:'অসমীয়া'};
function nameOf(c){var k=c==='zt'?'zh-Hant':c==='zh'?'zh-Hans':c;try{var n=new Intl.DisplayNames([k],{type:'language'}).of(k);if(!n||n.toLowerCase()===k.toLowerCase())throw 0;return n.charAt(0).toUpperCase()+n.slice(1);}catch(e){return OWN[c]||c;}}
var lang=(set.langAuto===false&&CODES.indexOf(set.lang)>=0)?set.lang:phoneLang();
var D={},P=[],ready=false;
function word(t){if(t==null)return '';var d=D[t];return d||t;}
function fill(tpl,nums){return tpl.replace(/\{(\d)\}/g,function(x,i){return nums[+i]!=null?nums[+i]:x;});}
function one(t){
  var d=D[t];if(d)return d;
  var nums=[],tt=t.replace(/\d[\d,.]*/g,function(m){nums.push(m);return '{'+(nums.length-1)+'}';});
  if(nums.length&&D[tt])return fill(D[tt],nums);
  for(var i=0;i<P.length;i++){var m=t.match(P[i][0]);if(m)return P[i][1].replace(/\$(\d)/g,function(x,n){return word(m[+n]);});}
  return null;
}
function tr(s){
  if(lang==='en'||!ready||!s)return null;var t=s.trim();if(!t||!/[A-Za-z]/.test(t))return null;
  var r=one(t);
  if(r==null){var parts=t.split(/(?<=[.!?…])\s+/);if(parts.length>1){var hit=false;r=parts.map(function(p){var x=one(p);if(x!=null){hit=true;return x;}return p;}).join(' ');if(!hit)r=null;}}
  return r==null?null:s.replace(t,r);
}
var ATTR=['aria-label','placeholder','title'];
function doText(n){var v=n.nodeValue;if(v===n.__tr)return;n.__en=v;var r=tr(v);if(r!=null&&r!==v){n.__tr=r;n.nodeValue=r;}else n.__tr=null;}
function doEl(e){ATTR.forEach(function(a){var v=e.getAttribute(a);if(v==null)return;e.__ta=e.__ta||{};if(v===e.__ta[a])return;e.__ea=e.__ea||{};e.__ea[a]=v;var r=tr(v);if(r!=null&&r!==v){e.__ta[a]=r;e.setAttribute(a,r);}});}
function walk(n){
  if(n.nodeType===3){doText(n);return;}
  if(n.nodeType!==1||n.tagName==='SCRIPT'||n.tagName==='STYLE'||n.tagName==='TEXTAREA'||n.tagName==='OPTION'&&n.parentNode&&n.parentNode.classList&&n.parentNode.classList.contains('lg19'))return;
  doEl(n);for(var c=n.firstChild;c;c=c.nextSibling)walk(c);
}
function restore(n){
  if(n.nodeType===3){if(n.__en!=null&&n.nodeValue===n.__tr)n.nodeValue=n.__en;n.__tr=null;return;}
  if(n.nodeType!==1)return;
  if(n.__ea)Object.keys(n.__ea).forEach(function(a){if(n.getAttribute(a)===(n.__ta||{})[a])n.setAttribute(a,n.__ea[a]);});n.__ta={};
  for(var c=n.firstChild;c;c=c.nextSibling)restore(c);
}
new MutationObserver(function(ms){
  if(lang==='en'||!ready)return;
  ms.forEach(function(m){if(m.type==='characterData')doText(m.target);else if(m.type==='attributes')doEl(m.target);else m.addedNodes.forEach(walk);});
}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTR});
function applyDir(){document.documentElement.lang=lang==='zt'?'zh-Hant':lang;document.documentElement.dir=RTL[lang]?'rtl':'ltr';}
function load(l,cb){
  if(l==='en'){D={};P=[];ready=true;cb&&cb();return;}
  fetch('lang/'+l+'.json').then(function(r){return r.json();}).then(function(j){
    D=j.d||{};P=(j.p||[]).map(function(x){try{return [new RegExp(x[0]),x[1]];}catch(e){return null;}}).filter(Boolean);ready=true;cb&&cb();
  }).catch(function(){D={};P=[];ready=true;cb&&cb();});
}
function setLang(l,auto){
  restore(document.body);ready=false;lang=l;set.lang=l;set.langAuto=!!auto;save();applyDir();
  load(l,function(){if(lang!=='en')walk(document.body);sync();});
}
applyDir();load(lang,function(){if(lang!=='en')walk(document.body);});
/* keep the play area left-to-right so seats stay next to their own corner of the board */
var st=document.createElement('style');
st.textContent='[dir="rtl"] .seatrow,[dir="rtl"] .stage,[dir="rtl"] .gbar,[dir="rtl"] .pillrow,[dir="rtl"] .hchests,[dir="rtl"] .seats{direction:ltr}[dir="rtl"] .msg,[dir="rtl"] .seat .who{direction:rtl}'+
 '.lg19{width:100%;font:800 15px/1.2 Nunito,sans-serif;padding:10px 12px;border-radius:12px;border:2px solid #170f45;background:#fff;color:#1d1647;margin:4px 0 8px}';
document.head.appendChild(st);
/* Settings: one drop-down, first option follows the phone */
var sel=null;
function sync(){if(!sel)return;sel.value=set.langAuto===false?lang:'auto';}
(function(){
  var s=$('#ov-settings .sb');if(!s)return;
  var h=document.createElement('h3');h.textContent='Language';
  sel=document.createElement('select');sel.className='lg19';sel.id='s-lang';sel.setAttribute('aria-label','Language');
  var opts='<option value="auto">📱 '+nameOf(phoneLang())+' (phone)</option>';
  CODES.map(function(c){return [c,nameOf(c)];}).sort(function(a,b){return a[1].localeCompare(b[1]);}).forEach(function(x){opts+='<option value="'+x[0]+'">'+x[1]+'</option>';});
  sel.innerHTML=opts;
  var first=s.querySelector('h3');s.insertBefore(h,first||s.firstChild);s.insertBefore(sel,first||null);
  sel.addEventListener('change',function(){if(sel.value==='auto')setLang(phoneLang(),true);else setLang(sel.value,false);});
  sync();
})();
window.__ludoraLang={set:setLang,tr:tr,codes:CODES,cur:function(){return lang;}};
})();
