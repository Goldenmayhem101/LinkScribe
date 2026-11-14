import numpy as np,cv2,sys,os
from PIL import Image
from scipy import ndimage as nd
src,outdir,prefix=sys.argv[1:4]
im=np.asarray(Image.open(src).convert('RGB'));H,W,_=im.shape;cw,ch=W/4,H/3
f=im.astype(np.float32);mn=f.min(2);mx=f.max(2);sat=mx-mn
for r in range(3):
  for c in range(4):
    x0,y0,x1,y1=int(c*cw),int(r*ch),int((c+1)*cw),int((r+1)*ch)
    C=im[y0:y1,x0:x1];S=sat[y0:y1,x0:x1];M=mn[y0:y1,x0:x1];h,w=S.shape
    bgc=np.median(np.concatenate([C[0],C[-1],C[:,0],C[:,-1]]),0)
    d=np.abs(C.astype(np.float32)-bgc).max(2)
    cand=(d<24)&(S<22)
    ink=(M<70)
    k=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5))
    inkD=cv2.dilate(ink.astype(np.uint8),k).astype(bool)
    lab,n=nd.label(cand&~inkD);edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    bg=np.isin(lab,list(edge))
    # grow background back up to the outline (the 2px we held back)
    for _ in range(3):bg|=nd.binary_dilation(bg)&cand
    obj=~bg;obj=nd.binary_opening(obj,iterations=1)
    ol,on=nd.label(obj)
    if on==0:continue
    sz=nd.sum(obj,ol,range(1,on+1));keep=np.zeros_like(obj)
    for i,sl in enumerate(nd.find_objects(ol)):
        ys,xs=sl;touch=ys.start<=1 or xs.start<=1 or ys.stop>=h-1 or xs.stop>=w-1
        if (touch and sz[i]<sz.max()*.5) or sz[i]<sz.max()*0.01:continue
        keep|=ol==i+1
    if keep.sum()<4000:continue
    dist=cv2.distanceTransform(keep.astype(np.uint8),cv2.DIST_L2,3)
    al=np.clip((dist-0.2)/1.3,0,1)
    rgba=np.dstack([C,al*255]).astype(np.uint8);ys,xs=np.where(al>0.02)
    rgba=rgba[ys.min():ys.max()+1,xs.min():xs.max()+1]
    Image.fromarray(rgba,'RGBA').save(f'{outdir}/{prefix}{r*4+c+1:02d}.png')
