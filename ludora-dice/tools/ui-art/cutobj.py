# cut every separate object off a flat gray sheet, ordered row by row, left to right
import numpy as np,cv2,sys,os
from PIL import Image
from scipy import ndimage as nd
src,outdir,prefix=sys.argv[1:4];os.makedirs(outdir,exist_ok=True)
im=np.asarray(Image.open(src).convert('RGB'));H,W,_=im.shape
f=im.astype(np.float32);mn=f.min(2);sat=f.max(2)-mn
bgc=np.median(np.concatenate([im[0],im[-1],im[:,0],im[:,-1]]),0)
d=np.abs(f-bgc).max(2);cand=(d<24)&(sat<22)
ink=(mn<70);inkD=cv2.dilate(ink.astype(np.uint8),cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5))).astype(bool)
lab,n=nd.label(cand&~inkD);edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
bg=np.isin(lab,list(edge))
for _ in range(3):bg|=nd.binary_dilation(bg)&cand
obj=nd.binary_opening(~bg,iterations=1)
ol,on=nd.label(obj);sz=nd.sum(obj,ol,range(1,on+1));big=[i for i in range(on) if sz[i]>sz.max()*0.08]
boxes=[]
for i in big:
    ys,xs=nd.find_objects(ol)[i];boxes.append((ys.start,ys.stop,xs.start,xs.stop,i+1))
boxes.sort(key=lambda b:(b[0]+b[1])/2)
rows=[];
for b in boxes:
    cy=(b[0]+b[1])/2
    if rows and abs(cy-rows[-1][0])<H*0.12: rows[-1][1].append(b)
    else: rows.append([cy,[b]])
k=0
for _,rb in rows:
    for y0,y1,x0,x1,li in sorted(rb,key=lambda b:b[2]):
        m=(ol[y0:y1,x0:x1]==li)
        dist=cv2.distanceTransform(m.astype(np.uint8),cv2.DIST_L2,3);al=np.clip((dist-0.2)/1.3,0,1)
        rgba=np.dstack([im[y0:y1,x0:x1],al*255]).astype(np.uint8)
        k+=1;Image.fromarray(rgba,'RGBA').save(f'{outdir}/{prefix}{k:02d}.png')
print(src,k,[len(r[1]) for r in rows])
