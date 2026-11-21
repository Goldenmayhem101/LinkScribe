#!/usr/bin/env python3
"""Make a Ludora live-content pack (new items, events, pictures) that phones download WITHOUT a Play Store update.

  python3 mkpack.py <pack-folder> [--message "New Frost dice!"] [--min-app 10]

The pack folder holds live.json plus any pictures at the same paths the game uses, for example
  live.json
  dice/x_frost.webp            (18-frame dice strip)
  ui/v19/dv6/x_frost.webp      (6 dice faces, for picture dice)
  ui/v19/gd/r5_03.webp         (a guardian animation)
  boards/frostfest.webp
It writes manifest.json into the same folder. Upload the WHOLE folder to the live-content address (see README.md).
Every upload must list every live file you still want (files left out are removed from phones).
"""
import hashlib,json,os,re,sys
SAFE=re.compile(r'^[A-Za-z0-9_\-]+(/[A-Za-z0-9_\-.]+)*\.(webp|png|jpg|json|mp3|ogg|wav)$')
def main():
    a=sys.argv[1:]
    if not a:print(__doc__);sys.exit(1)
    d=a[0];msg='';mina=0
    if '--message' in a:msg=a[a.index('--message')+1]
    if '--min-app' in a:mina=int(a[a.index('--min-app')+1])
    lj=os.path.join(d,'live.json')
    if not os.path.exists(lj):sys.exit('live.json is missing in '+d)
    try:live=json.load(open(lj,encoding='utf-8'))
    except Exception as e:sys.exit('live.json is not valid JSON: '+str(e))
    files={};bad=[]
    for r,_,fs in os.walk(d):
        for f in fs:
            p=os.path.relpath(os.path.join(r,f),d).replace(os.sep,'/')
            if p=='manifest.json' or p.startswith('.') or '/.' in p or p.lower()=='readme.md':continue
            if not SAFE.match(p) or '..' in p:bad.append(p);continue
            b=open(os.path.join(r,f),'rb').read();files[p]={'sha256':hashlib.sha256(b).hexdigest(),'size':len(b)}
    if bad:sys.exit('These files are not allowed (only pictures, sounds and live.json; letters, numbers, - and _ in names):\n  '+'\n  '.join(bad))
    # warn about items whose pictures are missing
    warn=[]
    for it in (live.get('items',{}) or {}).get('die',[]):
        if not it.get('like') and 'dice/%s.webp'%it.get('id') not in files:warn.append('dice/%s.webp'%it.get('id'))
    for w in warn:print('WARNING: missing picture',w,'(the game will use a blank dice)')
    mp=os.path.join(d,'manifest.json');old=0
    if os.path.exists(mp):
        try:old=json.load(open(mp)).get('version',0)
        except Exception:pass
    man={'version':old+1,'minApp':mina,'message':msg,'files':files}
    json.dump(man,open(mp,'w'),indent=1)
    print('manifest.json written: version',old+1,'with',len(files),'files. Upload the whole folder now.')
main()
