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
    f2n=B+'/outn2/'+code+'.json'
    if os.path.exists(f2n):d.update(json.load(open(f2n,encoding='utf-8')))
    d={k:v for k,v in d.items() if 'Ludora' not in k or 'Ludora' in v}
    d={k:(v.rstrip('.。።।۔') if not k.rstrip().endswith(('.','!','?','…')) else v) for k,v in d.items()}
    json.dump({'d':d,'p':[]},open(f'{OUT}/{code}.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
    done.append(code)
# newest words for every language (NLLB), added on top
for f in sorted(glob.glob(B+'/outx/*.json')+glob.glob(B+'/outx2/*.json')+glob.glob(B+'/outx3/*.json')):
    code=os.path.basename(f)[:-5];p=f'{OUT}/{code}.json'
    if not os.path.exists(p):continue
    cur=json.load(open(p,encoding='utf-8'));x=json.load(open(f,encoding='utf-8'))
    x={k:(v.rstrip('.。።।۔') if not k.rstrip().endswith(('.','!','?','…',':')) else v) for k,v in x.items()}
    cur['d'].update(x);json.dump(cur,open(p,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
# phrases a language was missing (translated one language at a time with NLLB): only fill gaps
for f in sorted(glob.glob(B+'/outfill/*.json')+glob.glob(B+'/outfill2/*.json')+glob.glob(B+'/outfill3/*.json')):
    code=os.path.basename(f)[:-5];p=f'{OUT}/{code}.json'
    if not os.path.exists(p):continue
    cur=json.load(open(p,encoding='utf-8'));x=json.load(open(f,encoding='utf-8'))
    for k,v in x.items():
        if k in cur['d']:continue
        cur['d'][k]=v.rstrip('.。።।۔') if not k.rstrip().endswith(('.','!','?','…',':')) else v
    json.dump(cur,open(p,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
# emojis: the translators turn them into "⁇"; put the original emojis back in the same order
import sentencepiece as spm
sp=spm.SentencePieceProcessor(model_file=B+'/../nllb/sentencepiece.bpe.model');UNK=sp.unk_id()
import unicodedata
def runs(k,sym=False):
    r=[];cur=''
    for ch in k:
        if not ch.isspace() and ((sym and (unicodedata.category(ch)=='So' or ch=='▶')) or (sp.piece_to_id(ch)==UNK and sp.piece_to_id('▁'+ch)==UNK)): cur+=ch
        else:
            if cur and ch in '️‍': cur+=ch; continue
            if cur: r.append(cur); cur=''
    if cur: r.append(cur)
    return r
fixed=dropped=0
for p in glob.glob(OUT+'/*.json'):
    cur=json.load(open(p,encoding='utf-8'));d=cur['d']
    for k,v in list(d.items()):
        if '⁇' not in v:
            R=runs(k,True)
            if R and not any(e in v for e in R):
                t=v
                if k.startswith(R[0]): t=R[0]+' '+t
                elif k.rstrip().endswith(R[-1]): t=t+' '+R[-1]
                if t!=v: d[k]=t;fixed+=1
            continue
        v2=re.sub(r'(?:\s*⁇)+',' ⁇',v).strip();R=runs(k);n=v2.count('⁇')
        if n!=len(R): R=runs(k,True)
        if R and n==len(R):
            for e in R: v2=v2.replace('⁇',e,1)
            d[k]=re.sub(r'\s+',' ',v2).strip();fixed+=1
        else:
            t=re.sub(r'\s*⁇\s*',' ',v2).strip()
            if R and k.startswith(R[0]): t=R[0]+' '+t
            if R and k.rstrip().endswith(R[-1]) and not (len(R)==1 and k.startswith(R[0])): t=t+' '+R[-1]
            d[k]=re.sub(r'\s+',' ',t).strip();dropped+=1
    json.dump(cur,open(p,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('emoji fixed',fixed,'rebuilt',dropped)
print(len(done),done)
