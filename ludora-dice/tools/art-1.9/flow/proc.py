# Flow green-screen videos -> transparent animated WebP for the game
import subprocess,sys,os,glob,json,numpy as np
from PIL import Image
from scipy import ndimage as nd
B=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,B)
from map import MAP
U='/root/.claude/uploads/957dfba1-5557-5840-8d08-7445ff9065c4/'
OUT=B+'/out';os.makedirs(OUT,exist_ok=True)
FPS=12;W=360
def frames(path):
    p=subprocess.run(['ffmpeg','-nostdin','-v','error','-i',path,'-vf',f'fps={FPS},scale={W}:-2','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
    h=int(len(p)/(W*3)) if False else None
    probe=subprocess.run(['ffprobe','-v','error','-select_streams','v','-show_entries','stream=width,height','-of','csv=p=0',path],capture_output=True,text=True).stdout.strip().split(',')
    w0,h0=int(probe[0]),int(probe[1]);H=int(round(h0*W/w0/2))*2
    a=np.frombuffer(p,np.uint8);n=len(a)//(W*H*3)
    return a[:n*W*H*3].reshape(n,H,W,3)
BG=None
GREEN_OK={'r1_04','r3_02','r3_05','st_dragon03','g01','g15','g16','g13','g23'}
WIDE={'r4a03','r3_04','r1_02','r2_02'}
KID=''
def key(f):
    f=f.astype(np.float32)
    dist=np.sqrt(((f-BG)**2).sum(-1))
    al=np.clip((dist-45)/55,0,1)
    out=f.copy();r,g,b=f[...,0],f[...,1],f[...,2];mx=np.maximum(r,b)
    edge=al<1
    out[...,1]=np.where(edge&(g>mx),np.minimum(g,mx+10),g)
    glow=(g>175)&(g>mx+25)
    out[...,1]=np.where(glow,np.minimum(out[...,1],mx+25),out[...,1])
    if KID not in GREEN_OK:
        out[...,1]=np.minimum(out[...,1],mx+4)
    return out,al
def run(name,path,kind,kid):
    F=frames(path)
    global BG,KID
    KID=kid
    e=np.concatenate([F[0,:6].reshape(-1,3),F[0,-6:].reshape(-1,3),F[0,:,:6].reshape(-1,3),F[0,:,-6:].reshape(-1,3)]).astype(np.float32);BG=np.median(e,0)
    if len(F)<3:print('bad',name);return None
    RGB=[];AL=[]
    for f in F:
        o,a=key(f);RGB.append(o);AL.append(a)
    AL=np.array(AL);RGB=np.array(RGB)
    # stray pieces: in the first frames, anything not connected to the main figure is a leftover from a neighbour
    m0=(AL[:3].min(0)>.85)
    lab,n=nd.label(m0)
    kill=np.zeros_like(m0)
    if n>1:
        sz=nd.sum(m0,lab,range(1,n+1));main=int(np.argmax(sz))+1
        for i in range(1,n+1):
            if i!=main and sz[i-1]<sz[main-1]*.05: kill|=(lab==i)
        kill=nd.binary_dilation(kill,iterations=6)
    AL[:,kill]=0
    # edge frames: clear a thin border (Flow sometimes leaves a coloured edge)
    Hh,Ww=AL.shape[1:]
    yy=np.arange(Hh)[:,None];xx=np.arange(Ww)[None,:]
    d=np.minimum(np.minimum(yy,Hh-1-yy),np.minimum(xx,Ww-1-xx)).astype(np.float32)
    AL*=np.clip((d-3)/22,0,1)[None]
    # remove tiny specks per frame
    for i in range(len(AL)):
        m=AL[i]>.3;lab,n=nd.label(m)
        if n>1:
            sz=nd.sum(m,lab,range(1,n+1));small=np.isin(lab,[j+1 for j in range(n) if sz[j]<12])
            AL[i][small]=0
    core=(AL[:3].min(0)>.5)&~kill
    u=core if core.sum()>200 else AL.max(0)>.15
    if kid in WIDE:u=(AL.mean(0)>.5)&~kill
    ys,xs=np.where(u)
    if len(ys)==0:print('empty',name);return None
    y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
    if kid in ('face11',):
        for i in range(len(AL)):
            m=AL[i]>.2;lab,n=nd.label(m)
            if n>1:
                sz=nd.sum(m,lab,range(1,n+1));big=int(np.argmax(sz))+1
                AL[i][(lab!=big)&(lab>0)]=0
    S=max(y1-y0,x1-x0);pad=int(S*(.16 if kind=='g' else .12));S+=2*pad;cy,cx=(y0+y1)//2,(x0+x1)//2
    OS=340 if kind=='g' else 200
    imgs=[]
    for i in range(len(F)):
        rgba=np.dstack([np.clip(RGB[i],0,255),AL[i]*255]).astype(np.uint8)
        im=Image.fromarray(rgba,'RGBA');c=Image.new('RGBA',(S,S));c.paste(im,(S//2-cx,S//2-cy))
        imgs.append(c.resize((OS,OS),Image.LANCZOS))
    fn=f'{OUT}/{kid}.webp'
    imgs[0].save(fn,save_all=True,append_images=imgs[1:],duration=int(1000/FPS),loop=0,quality=62,method=4,lossless=False)
    return {'n':len(imgs),'kb':os.path.getsize(fn)//1024,'killed':int(kill.sum())}
vids={}
for f in sorted(glob.glob(U+'*.mp4'),key=os.path.getmtime):
    b=os.path.basename(f)[9:]
    n='videoplayback' if b.startswith('videoplayback') else b.rsplit('_',1)[0]
    vids[n]=f
only=sys.argv[1:]
res={}
for n,k in MAP.items():
    if only and k.split(':')[1] not in only:continue
    if n not in vids:print('missing',n);continue
    kind,kid=k.split(':');r=run(n,vids[n],kind,kid);res[kid]=r;print(kid,r,flush=True)
json.dump(res,open(B+'/res.json','w'))
