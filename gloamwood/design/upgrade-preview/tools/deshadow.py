import numpy as np,os,sys
from PIL import Image
from scipy import ndimage as nd
DROP=set()
for f in sorted(os.listdir('mon3')):
    if not f.endswith('.png'):continue
    n=f[:-4]
    if n in DROP: os.remove('mon3/'+f);continue
    a=np.asarray(Image.open('mon3/'+f)).astype(np.float32);rgb=a[...,:3];al=a[...,3]/255;H,W=al.shape
    mn=rgb.min(2);sat=rgb.max(2)-mn;lum=rgb.mean(2)
    mu=nd.uniform_filter(lum,5);var=nd.uniform_filter(lum*lum,5)-mu*mu
    band=np.zeros((H,W),bool);band[int(H*.86):,:]=True
    cand=band&(sat<36)&(mn>140)&(mn<236)&((rgb[...,2]-rgb[...,0])>-6)&(al>0)
    # grow from transparent pixels / image bottom into shadow-like pixels
    seed=(al<0.05)|np.zeros((H,W),bool);seed[-1,:]|=cand[-1,:]
    reach=seed.copy()
    for _ in range(60):
        g=nd.binary_dilation(reach)&cand&~reach
        if not g.any():break
        reach|=g
    sh=reach&cand
    # also faint semi-transparent grey fringe along the bottom
    sh|=band&(al<.6)&(sat<40)
    al2=al.copy();al2[sh]=0
    al2=np.minimum(al2,nd.gaussian_filter(al2,.7)*1.15)
    out=np.dstack([rgb,al2*255]).astype(np.uint8)
    ys,xs=np.where(out[...,3]>8);out=out[ys.min():ys.max()+1,xs.min():xs.max()+1]
    Image.fromarray(out,'RGBA').save('mon3/'+f)
print(len([f for f in os.listdir('mon3') if f.endswith('.png')]))
