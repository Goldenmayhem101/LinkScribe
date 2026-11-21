import glob,os,sys,numpy as np
from PIL import Image
from scipy import ndimage as nd
pat=sys.argv[1] if len(sys.argv)>1 else 'dice_orig/e_*.webp'
y,x=np.ogrid[-9:10,-9:10];DISK=(x*x+y*y)<=81
out=[]
for f in sorted(glob.glob(pat)):
    b=os.path.basename(f)
    a=np.array(Image.open(f).convert('RGBA'));H=a.shape[0];N=a.shape[1]//H;rm=0
    for c in range(N):
        al=a[:,c*H:(c+1)*H,3].copy();m=al>60
        op=nd.binary_opening(m,structure=DISK)
        lab,n=nd.label(op)
        if n==0:continue
        sz=nd.sum(op,lab,range(1,n+1));body=lab==(np.argmax(sz)+1)
        res=m&~body;rl,rn=nd.label(res);kill=np.zeros_like(m)
        near=nd.binary_dilation(body,iterations=2)
        for i in range(1,rn+1):
            comp=rl==i;s=comp.sum()
            if s<10:continue
            thick=nd.distance_transform_edt(comp).max()
            touch=(comp&near).sum()
            # a shard: thin wedge that only touches the dice along a short edge, or floats free
            if thick<=float(os.environ.get("TH","4.6")) and touch<s*0.45: kill|=comp
            elif touch==0: kill|=comp
            elif thick<=2.3 and s>=8: kill|=comp
        if kill.any():
            kill=nd.binary_dilation(kill,iterations=2)&~body
            kill&=(al>0);al[kill]=0;a[:,c*H:(c+1)*H,3]=al;rm+=int(kill.sum())
        # faint dust far from the dice
        far=(al>0)&~nd.binary_dilation(al>60,iterations=2)
        if far.any():al[far]=0;a[:,c*H:(c+1)*H,3]=al
    Image.fromarray(a).save('dice_clean2/'+b,quality=90,method=6);out.append((b[:-5],rm))
print(out)
