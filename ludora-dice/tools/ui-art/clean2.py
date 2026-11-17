import numpy as np,sys,cv2,os
from PIL import Image
from scipy import ndimage as nd
def clean(src,dst,bg=(213,213,213)):
    im=np.asarray(Image.open(src).convert('RGBA')).astype(np.float32)
    rgb=im[...,:3];a=im[...,3]/255.0
    BG=np.array(bg,np.float32)
    d=np.abs(rgb-BG).max(2);sat=rgb.max(2)-rgb.min(2)
    # 1) enclosed gray pockets (gaps between arms, tentacles, wings)
    pocket=(d<16)&(sat<12)&(a>0)
    lab,n=nd.label(pocket)
    if n:
        sz=nd.sum(pocket,lab,range(1,n+1));big=np.isin(lab,np.where(sz>=20)[0]+1)
        grow=nd.binary_dilation(big,iterations=2)&(d<34)&(sat<20)
        a[big|grow]=0
    # 2) gray rim touching the outside, peel up to 4 px
    for it in range(4):
        out=a<0.04
        ring=nd.binary_dilation(out,iterations=1)&~out
        kill=ring&(d<30+it*2)&(sat<18)
        if not kill.any():break
        a[kill]=0
    # 3) un-mix the gray from the last edge pixels
    out=a<0.04
    ring=nd.binary_dilation(out,iterations=2)&~out
    ink=np.array([24,14,50],np.float32)
    lum=rgb.mean(2)
    soft=ring&(lum>90)&(sat<40)
    # pull light gray edge pixels toward the dark outline colour
    t=np.clip((lum-90)/140,0,1)[...,None]
    rgb=np.where(soft[...,None],rgb*(1-t*0.75)+ink*(t*0.75),rgb)
    # smooth alpha 1px
    a=np.minimum(a,cv2.GaussianBlur((a>0.04).astype(np.float32),(3,3),0.6)*1.0+0.0)
    o=np.dstack([rgb,a*255]).clip(0,255).astype(np.uint8)
    Image.fromarray(o,'RGBA').save(dst)
if __name__=='__main__':
    for f in sys.argv[1:-1]: clean(f,os.path.join(sys.argv[-1],os.path.basename(f)))
