# remove enclosed background-gray pockets (gaps between arms, hair, etc.) from cut-outs
import numpy as np,sys
from PIL import Image
from scipy import ndimage as nd
BG=np.array([float(x) for x in __import__("os").environ.get("BG","217,217,217").split(",")],np.float32)
for f in sys.argv[1:]:
    im=Image.open(f).convert('RGBA');a=np.asarray(im).astype(np.float32)
    rgb=a[...,:3];al=a[...,3]
    d=np.abs(rgb-BG).max(2);sat=rgb.max(2)-rgb.min(2)
    pocket=(d<12)&(sat<10)&(al>0)
    lab,n=nd.label(pocket);removed=0
    if n:
        sz=nd.sum(pocket,lab,range(1,n+1))
        big=np.isin(lab,np.where(sz>=60)[0]+1)
        grow=nd.binary_dilation(big,iterations=1)&(d<26)&(sat<16)
        mask=big|grow
        removed=int(mask.sum())
        if removed:
            soft=nd.binary_dilation(mask,iterations=1)&~mask
            al2=al.copy();al2[mask]=0;al2[soft]=np.minimum(al2[soft],140)
            a[...,3]=al2;Image.fromarray(a.astype(np.uint8),'RGBA').save(f)
    print(f,removed)
