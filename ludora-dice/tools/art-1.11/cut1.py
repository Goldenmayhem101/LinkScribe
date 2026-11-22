# cut one picture (logo, hand, star) off a flat light-gray background; keeps all parts (sparkles too), removes enclosed gray pockets
import numpy as np,cv2,sys
from PIL import Image
from scipy import ndimage as nd
src,out=sys.argv[1:3]
im=np.asarray(Image.open(src).convert('RGB'));H,W,_=im.shape
f=im.astype(np.float32);mn=f.min(2);sat=f.max(2)-mn
bgc=np.median(np.concatenate([im[0],im[-1],im[:,0],im[:,-1]]),0)
d=np.abs(f-bgc).max(2);cand=(d<26)&(sat<24)
ink=(mn<70);inkD=cv2.dilate(ink.astype(np.uint8),cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5))).astype(bool)
lab,n=nd.label(cand&~inkD)
edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
bg=np.isin(lab,list(edge))
# enclosed gray pockets (e.g. inside letters) bigger than a few hundred pixels are background too
sz=nd.sum(np.ones_like(lab),lab,range(1,n+1))
for i in range(n):
    if (i+1) not in edge and sz[i]>350:
        reg=lab==i+1
        if np.abs(f[reg]-bgc).max(1).mean()<14: bg|=reg
for _ in range(3):bg|=nd.binary_dilation(bg)&cand
obj=nd.binary_opening(~bg,iterations=1)
ol,on=nd.label(obj);s2=nd.sum(obj,ol,range(1,on+1))
keep=np.isin(ol,[i+1 for i in range(on) if s2[i]>max(150,s2.max()*0.0008)])
a=cv2.GaussianBlur(keep.astype(np.float32),(3,3),0.8)
# soften: pixels close to the background colour at the edge become semi-transparent
edgeband=keep&~nd.binary_erosion(keep,iterations=2)
dd=np.clip(d/40,0,1);a=np.where(edgeband,np.minimum(a,0.35+0.65*dd),a)
rgba=np.dstack([im,(a*255).astype(np.uint8)])
ys,xs=np.where(a>0.05);y0,y1,x0,x1=max(0,ys.min()-4),min(H,ys.max()+5),max(0,xs.min()-4),min(W,xs.max()+5)
Image.fromarray(rgba[y0:y1,x0:x1]).save(out);print(out,x1-x0,y1-y0)
