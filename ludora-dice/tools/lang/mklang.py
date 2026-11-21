# write rel16/lang/<code>.json: hand translations from 1.2-1.4 win, machine translations fill everything else
import json,re,os,glob
B=os.path.dirname(os.path.abspath(__file__))
old=open(B+'/../l2/i18n_old.js',encoding='utf-8').read()
RAW=re.search(r'var RAW=`(.*?)`;',old,re.S).group(1)
PAT=re.search(r'var PAT=`(.*?)`;',old,re.S).group(1)
OLD=['es','pt','fr','de','it','id','tr','hi','ar']
hand={c:{} for c in OLD};pat={c:[] for c in OLD}
for l in RAW.split('\n'):
    a=l.split('|')
    if len(a)==10:
        for i,c in enumerate(OLD):hand[c][a[0]]=a[i+1]
for l in PAT.split('\n'):
    a=l.split('|')
    if len(a)==10:
        rx=a[0].replace('\\\\','\\')
        for i,c in enumerate(OLD):pat[c].append([rx,a[i+1]])
OUT=B+'/../rel16/lang';os.makedirs(OUT,exist_ok=True)
MAP={'pb':'pt'}
done=[]
for f in sorted(glob.glob(B+'/out/*.json')):
    src=os.path.basename(f)[:-5]
    if src=='pt':continue
    code=MAP.get(src,src)
    d=json.load(open(f,encoding='utf-8'))
    # never translate the game's name
    d={k:v.replace('Lodora','Ludora') for k,v in d.items() if 'Ludora' not in k or 'Ludora' in v}
    f2=B+'/out2/'+src+'.json'
    if os.path.exists(f2):d.update(json.load(open(f2,encoding='utf-8')))
    f3=B+'/out3/'+src+'.json'
    if os.path.exists(f3):d.update(json.load(open(f3,encoding='utf-8')))
    if code in hand:d.update({k:v for k,v in hand[code].items() if k not in ('Open','Claim')})
    FIX={'es':{'Chests':'Cofres','Chest':'Cofre'},'hi':{'Chests':'संदूक','Chest':'संदूक'},'ar':{'Chests':'الصناديق','Chest':'صندوق','Videos':'الفيديوهات'}}
    d.update(FIX.get(code,{}))
    d={k:(v.rstrip('.。।۔') if not k.rstrip().endswith(('.','!','?','…')) else v) for k,v in d.items()}
    json.dump({'d':d,'p':pat.get(code,[])},open(f'{OUT}/{code}.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
    done.append(code)
# extra languages from NLLB-200
for f in sorted(glob.glob(B+'/outn/*.json')):
    code=os.path.basename(f)[:-5]
    if code in done or code=='fil':continue
    d=json.load(open(f,encoding='utf-8'))
    d={k:v for k,v in d.items() if 'Ludora' not in k or 'Ludora' in v}
    d={k:(v.rstrip('.。።।۔') if not k.rstrip().endswith(('.','!','?','…')) else v) for k,v in d.items()}
    json.dump({'d':d,'p':[]},open(f'{OUT}/{code}.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
    done.append(code)
# newest words for every language (NLLB), added on top
for f in sorted(glob.glob(B+'/outx/*.json')):
    code=os.path.basename(f)[:-5];p=f'{OUT}/{code}.json'
    if not os.path.exists(p):continue
    cur=json.load(open(p,encoding='utf-8'));x=json.load(open(f,encoding='utf-8'))
    x={k:(v.rstrip('.。።।۔') if not k.rstrip().endswith(('.','!','?','…',':')) else v) for k,v in x.items()}
    cur['d'].update(x);json.dump(cur,open(p,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print(len(done),done)
