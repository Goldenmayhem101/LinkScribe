# translate the game's words into the extra languages with NLLB-200 (CTranslate2). One model for all languages.
import json,os,sys,re,time,unicodedata
import ctranslate2,sentencepiece as spm
B=os.path.dirname(os.path.abspath(__file__));M=B+'/../nllb'
KEYS=[];[KEYS.extend(json.load(open(B+'/../l2/'+f))) for f in os.environ.get('KEYS','keys19.json,keys19c.json').split(',')]
KEYS=list(dict.fromkeys(KEYS))
OUT=os.environ.get('OUT',B+'/outn');os.makedirs(OUT,exist_ok=True)
LANGS={'af':'afr_Latn','am':'amh_Ethi','hy':'hye_Armn','my':'mya_Mymr','km':'khm_Khmr','lo':'lao_Laoo','ka':'kat_Geor','kk':'kaz_Cyrl','uz':'uzn_Latn','tg':'tgk_Cyrl',
'mn':'khk_Cyrl','ne':'npi_Deva','si':'sin_Sinh','ta':'tam_Taml','te':'tel_Telu','mr':'mar_Deva','gu':'guj_Gujr','kn':'kan_Knda','ml':'mal_Mlym','pa':'pan_Guru',
'ps':'pbt_Arab','sr':'srp_Cyrl','hr':'hrv_Latn','bs':'bos_Latn','mk':'mkd_Cyrl','is':'isl_Latn','mt':'mlt_Latn','be':'bel_Cyrl','so':'som_Latn','ha':'hau_Latn',
'yo':'yor_Latn','ig':'ibo_Latn','zu':'zul_Latn','xh':'xho_Latn','rw':'kin_Latn','mg':'plt_Latn','ny':'nya_Latn','sn':'sna_Latn','om':'gaz_Latn','ti':'tir_Ethi',
'ht':'hat_Latn','lb':'ltz_Latn','cy':'cym_Latn','jv':'jav_Latn','tk':'tuk_Latn','ku':'kmr_Latn','or':'ory_Orya','as':'asm_Beng','wo':'wol_Latn','ln':'lin_Latn',
'st':'sot_Latn','tn':'tsn_Latn','lg':'lug_Latn','ckb':'ckb_Arab','sd':'snd_Arab','ug':'uig_Arab','fo':'fao_Latn','qu':'quy_Latn','gn':'grn_Latn','ay':'ayr_Latn','fil':'tgl_Latn'}
OLDMAP={'ar':'arb_Arab','az':'azj_Latn','bg':'bul_Cyrl','bn':'ben_Beng','ca':'cat_Latn','cs':'ces_Latn','da':'dan_Latn','de':'deu_Latn','el':'ell_Grek','es':'spa_Latn','et':'est_Latn','eu':'eus_Latn','fa':'pes_Arab','fi':'fin_Latn','fr':'fra_Latn','ga':'gle_Latn','gl':'glg_Latn','he':'heb_Hebr','hi':'hin_Deva','hu':'hun_Latn','id':'ind_Latn','it':'ita_Latn','ja':'jpn_Jpan','ko':'kor_Hang','ky':'kir_Cyrl','lt':'lit_Latn','lv':'lvs_Latn','ms':'zsm_Latn','nb':'nob_Latn','nl':'nld_Latn','pl':'pol_Latn','pt':'por_Latn','ro':'ron_Latn','ru':'rus_Cyrl','sk':'slk_Latn','sl':'slv_Latn','sq':'als_Latn','sv':'swe_Latn','sw':'swh_Latn','th':'tha_Thai','tl':'tgl_Latn','tr':'tur_Latn','uk':'ukr_Cyrl','ur':'urd_Arab','vi':'vie_Latn','zh':'zho_Hans','zt':'zho_Hant'}
if os.environ.get('ALL'):LANGS=dict(OLDMAP,**{k:v for k,v in LANGS.items() if k!='fil'})
if os.environ.get('ONLY'):LANGS={k:v for k,v in LANGS.items() if k in os.environ['ONLY'].split(',')}
NUM=['17','23','38','46','59']
CTX={'Open':'Open it','Claim':'Claim your reward','Activity Center':'Events center','ACTIVITY CENTER':'EVENTS CENTER','Activity':'Events','Watch':'Watch the video','▶ Watch':'▶ Watch the video','Weekly Event':'Weekly game event','Mini Event':'Daily mini game event','Buy':'Buy it','Equip':'Use it','Equipped':'In use','Inbox':'Message inbox','Updates':'News updates','Requests':'Friend requests','Collect':'Collect reward','Chests':'Treasure chests','Chest':'Treasure chest','Owned':'Items you own','Offers':'Special offers','Home':'Home screen','Pass':'Season pass','Daily':'Daily rewards','Events':'Game events','Play':'Play the game','Videos':'Watch videos','Event prize':'Prize from an event'}
CTX2={"Close": "Close this window", "Back": "Go back", "Store": "Game shop", "Shop": "Game shop", "STORE": "GAME SHOP", "Play": "Play the game", "Dice": "Dice for the board game", "Board": "Game board", "Boards": "Game boards", "Pawns": "Game pieces", "Pawn": "Game piece", "Frames": "Picture frames", "Frame": "Picture frame", "Free": "Free of charge", "Cancel": "Cancel it", "Accept": "Accept the request", "Done": "Finished", "Easy": "Easy level", "Hard": "Hard level", "Expert": "Expert level", "Normal": "Normal level", "Coins": "Gold coins", "Roll the dice": "Roll the dice in the board game", "Tap the dice to roll.": "Tap the dice to roll it.", "Settings": "Game settings", "Profile": "Player profile", "Online": "Play online", "Computer": "Play against the computer", "Friends": "Your friends", "Daily": "Daily rewards", "Find players": "Find other players", "Play again": "Play another game", "Change game": "Choose another game", "Collect": "Collect the reward", "Open": "Open it", "Your turn": "It is your turn", "YOUR TURN": "IT IS YOUR TURN", "Owned": "Items you own", "Search": "Search for items", "Got it": "Understood", "Sounds": "Game sounds", "Music": "Game music"}
def prot(s):
    s=CTX2.get(s,CTX.get(s,s)) if os.environ.get('CTXPASS') else CTX.get(s,s);s=s.replace('Activity Center','Events Center')
    if 'reasure' not in s: s=re.sub(r'\b([Cc])hest(s?)\b',lambda m:('T' if m.group(1)=='C' else 't')+'reasure chest'+m.group(2),s)
    s=s.replace('Ludo Mayhem','LMX')
    if os.environ.get('RAWPH'): return s
    return re.sub(r'\{(\d)\}',lambda m:NUM[int(m.group(1))],s)
sp=spm.SentencePieceProcessor(model_file=M+'/sentencepiece.bpe.model')
tr=ctranslate2.Translator(M,device='cpu',inter_threads=1,intra_threads=4,compute_type='int8')
# long texts: one sentence at a time (the model drops later sentences otherwise)
PARTS=[];SEG=[]
for k in KEYS:
    p=prot(k);segs=[x for x in re.split(r'(?<=[.!?])\s+(?=[A-Z0-9▶🎁])',p) if x] if len(p)>60 else [p]
    SEG.append((len(PARTS),len(segs)));PARTS.extend(segs)
src=[['eng_Latn']+sp.encode(x,out_type=str)+['</s>'] for x in PARTS]
order=sorted(range(len(src)),key=lambda i:len(src[i]))
for L,code in LANGS.items():
    if os.path.exists(f'{OUT}/{L}.json'):print('skip',L);continue
    t0=time.time();outs=[None]*len(src)
    batch=[src[i] for i in order]
    res=tr.translate_batch(batch,target_prefix=[[code]]*len(batch),max_batch_size=48,beam_size=2,max_decoding_length=200,repetition_penalty=1.1)
    for i,r in zip(order,res):outs[i]=r.hypotheses[0][1:]
    out={}
    for k,(a,n) in zip(KEYS,SEG):
        t=re.sub(r'\s+',' ',' '.join(sp.decode(outs[j]) for j in range(a,a+n))).strip()
        t=re.sub(r'LMX|Lmx|lmx|ЛМХ|LMХ','Ludo Mayhem',t)
        t=''.join(str(unicodedata.digit(ch)) if ch.isdigit() and not ch.isascii() else ch for ch in t)
        for i,n in enumerate(NUM):
            if '{'+str(i)+'}' in k: t=re.sub(r'(?<!\d)'+n+r'(?!\d)','{'+str(i)+'}',t,count=1)
        need=set(re.findall(r'\{\d\}',k))
        if need and set(re.findall(r'\{\d\}',t))!=need: continue
        if not t or len(t)>len(k)*4+20: continue
        out[k]=t
    json.dump(out,open(f'{OUT}/{L}.json','w'),ensure_ascii=False)
    print(L,len(out),'/',len(KEYS),round(time.time()-t0),'s',flush=True)
