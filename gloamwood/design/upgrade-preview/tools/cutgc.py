import numpy as np,cv2,sys,os
from PIL import Image
from scipy import ndimage as nd
src,outdir,prefix=sys.argv[1],sys.argv[2],sys.argv[3]
os.makedirs(outdir,exist_ok=True)
im=np.asarray(Image.open(src).convert('RGB'));H,W,_=im.shape;cw,ch=W/4,H/3;res=[]
for r in range(3):
  for c in range(4):
    x0,y0=int(c*cw),int(r*ch);x1,y1=int((c+1)*cw),int((r+1)*ch)
    C=np.ascontiguousarray(im[y0:y1,x0:x1]);h,w=C.shape[:2]
    L=C.mean(2);bgL=np.median(np.concatenate([L[0],L[-1],L[:,0],L[:,-1]]))
    mask=np.full((h,w),cv2.GC_PR_BGD,np.uint8)
    m=8;mask[:m,:]=mask[-m:,:]=mask[:,:m]=mask[:,-m:]=cv2.GC_BGD
    ink=(L<min(52,bgL*0.62));inkc=ink.copy();inkc[:m*3,:]=inkc[-m*2:,:]=inkc[:,:m*2]=inkc[:,-m*2:]=False
    # inside of the drawn outline (where it closes) is surely monster
    k=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(7,7))
    lab,n=nd.label(~cv2.dilate(inkc.astype(np.uint8),k).astype(bool));edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    inside=cv2.erode((~np.isin(lab,list(edge))).astype(np.uint8),k).astype(bool)&~inkc
    mask[inside]=cv2.GC_PR_FGD
    # saturated / bright pixels far from the border are probably monster
    hsv=cv2.cvtColor(C,cv2.COLOR_RGB2HSV);sat=hsv[...,1];val=hsv[...,2]
    yy,xx=np.mgrid[0:h,0:w];centr=((xx-w/2)/(w*.42))**2+((yy-h/2)/(h*.44))**2<1
    mask[(val>max(150,bgL*2.2))&centr]=cv2.GC_PR_FGD
    mask[inkc&centr]=cv2.GC_FGD
    bgd=np.zeros((1,65),np.float64);fgd=np.zeros((1,65),np.float64)
    cv2.grabCut(C,mask,None,bgd,fgd,6,cv2.GC_INIT_WITH_MASK)
    keep=(mask==cv2.GC_FGD)|(mask==cv2.GC_PR_FGD)
    keep=cv2.morphologyEx(keep.astype(np.uint8),cv2.MORPH_OPEN,np.ones((3,3),np.uint8)).astype(bool)
    ol,on=nd.label(keep);sz=nd.sum(keep,ol,range(1,on+1)) if on else []
    kk=np.zeros_like(keep)
    for i,sl in enumerate(nd.find_objects(ol)):
        ys,xs=sl
        if ys.start<=2 or xs.start<=2 or ys.stop>=h-2 or xs.stop>=w-2: continue
        if sz[i]>=max(sz)*0.02:kk|=ol==i+1
    keep=nd.binary_fill_holes(kk)
    # cut just inside the dark outline's outer edge: grow 1px into ink, drop glow beyond it
    d=cv2.distanceTransform(keep.astype(np.uint8),cv2.DIST_L2,3)
    al=np.clip((d-0.2)/1.3,0,1)
    rgba=np.dstack([C,al*255]).astype(np.uint8);ys,xs=np.where(al>0.02)
    rgba=rgba[ys.min():ys.max()+1,xs.min():xs.max()+1]
    name=f'{prefix}{r*4+c+1:02d}';Image.fromarray(rgba,'RGBA').save(f'{outdir}/{name}.png');res.append(name)
print(res)
