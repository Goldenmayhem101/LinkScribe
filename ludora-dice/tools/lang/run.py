# translate keys19.json into many languages with Argos (CTranslate2) models; one model on disk at a time
import json,os,sys,zipfile,shutil,re,subprocess,glob,time
import ctranslate2,sentencepiece as spm
B=os.path.dirname(os.path.abspath(__file__))
KEYS=json.load(open(os.environ.get('KEYS',B+'/../l2/keys19.json')))
IDX=json.load(open(B+'/index.json'))
OUT=os.environ.get('OUT',B+'/out');os.makedirs(OUT,exist_ok=True)
langs=sys.argv[1:] or sorted(p['to_code'] for p in IDX if p['from_code']=='en' and p['to_code']!='eo')
NUM=['17','23','38','46','59']
CTX={'Open':('Open it',),'Claim':('Claim your reward',),'Activity Center':('Events center',),'ACTIVITY CENTER':('EVENTS CENTER',),'Activity':('Events',),'Center':('Center',),'Watch':('Watch the video',),'▶ Watch':('▶ Watch the video',),'Weekly Event':('Weekly game event',),'Mini Event':('Daily mini game event',),'Buy':('Buy it',),'Equip':('Use it',),'Equipped':('In use',),'Inbox':('Message inbox',),'Updates':('News updates',),'Requests':('Friend requests',),'Collect':('Collect reward',),'Chests':('Treasure chests',),'Chest':('Treasure chest',),'Owned':('Items you own',),'Offers':('Special offers',),'Shop':('Shop',),'Sample banner':('Sample advertisement',),'Home':('Home screen',),'Pass':('Season pass',),'Daily':('Daily rewards',),'Events':('Game events',),'Play':('Play the game',)}
def prot(s):
    if s in CTX:s=CTX[s][0]
    if 'reasure' not in s: s=re.sub(r'\b([Cc])hest(s?)\b',lambda m:('T' if m.group(1)=='C' else 't')+'reasure chest'+m.group(2),s)
    return re.sub(r'\{(\d)\}',lambda m:NUM[int(m.group(1))],s)
for L in langs:
    if os.path.exists(f'{OUT}/{L}.json'):print('skip',L);continue
    pk=[p for p in IDX if p['from_code']=='en' and p['to_code']==L][0]
    z=f'{B}/m.zip';d=f'{B}/m';shutil.rmtree(d,ignore_errors=True)
    t0=time.time()
    ok=False
    for a in range(5):
        if subprocess.run(['curl','-sS','-L','-C','-','--retry','3','-o',z,pk['links'][0]]).returncode==0:ok=True;break
        time.sleep(3)
    if not ok:print('FAILED',L,flush=True);continue
    zipfile.ZipFile(z).extractall(d);os.remove(z)
    root=[x for x in glob.glob(d+'/*') if os.path.isdir(x)][0]
    spf=glob.glob(root+'/**/sentencepiece.model',recursive=True)
    if spf:
        _sp=spm.SentencePieceProcessor(model_file=spf[0])
        enc=lambda s:_sp.encode(s,out_type=str);dec=lambda t:_sp.decode(t)
    else:
        sys.path.insert(0,B);from apply_bpe import BPE
        from sacremoses.normalize import MosesPunctNormalizer
        from sacremoses.tokenize import MosesDetokenizer,MosesTokenizer
        _tk=MosesTokenizer('en');_dt=MosesDetokenizer(L);_nm=MosesPunctNormalizer('en');_bpe=BPE(open(glob.glob(root+'/**/bpe.model',recursive=True)[0],encoding='utf-8'))
        enc=lambda s:_bpe.segment_tokens(' '.join(_tk.tokenize(_nm.normalize(s),escape=False)).strip().split(' '))
        dec=lambda t:_dt.detokenize(' '.join(t).replace('@@ ','').split(' '))
    tr=ctranslate2.Translator(root+'/model',device='cpu',inter_threads=4,intra_threads=2)
    src=[prot(k) for k in KEYS]
    toks=[enc(s) for s in src]
    res=tr.translate_batch(toks,max_batch_size=64,beam_size=2,max_decoding_length=256)
    out={}
    for k,r in zip(KEYS,res):
        t=re.sub(r'\s+',' ',dec(r.hypotheses[0]).replace('\u2581',' ')).strip()
        for i,n in enumerate(NUM):
            if '{'+str(i)+'}' in k: t=re.sub(r'(?<!\d)'+n+r'(?!\d)','{'+str(i)+'}',t,count=1)
        need=set(re.findall(r'\{\d\}',k))
        if need and set(re.findall(r'\{\d\}',t))!=need: continue
        if not t.strip(): continue
        out[k]=t.strip()
    json.dump(out,open(f'{OUT}/{L}.json','w'),ensure_ascii=False)
    shutil.rmtree(d,ignore_errors=True)
    print(L,len(out),'/',len(KEYS),round(time.time()-t0),'s',flush=True)
