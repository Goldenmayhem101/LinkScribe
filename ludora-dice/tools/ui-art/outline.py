import numpy as np,sys,cv2
from PIL import Image
from scipy import ndimage as nd
def fix(src,dst):
    im=np.asarray(Image.open(src).convert('RGBA')).astype(np.float32)
    rgb=im[...,:3];a=im[...,3]
    lum=rgb.mean(2);ink=(lum<95)&(a>100)
    k=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5))
    m=cv2.morphologyEx(ink.astype(np.uint8),cv2.MORPH_CLOSE,k,iterations=2)
    m=nd.binary_fill_holes(m)
    # keep the biggest parts only
    lab,n=nd.label(m)
    if n:
        sz=nd.sum(m,lab,range(1,n+1));keep=np.isin(lab,np.where(sz>sz.max()*0.03)[0]+1)
    else: keep=a>0
    # if the outline didn't close well (too little kept) fall back
    if keep.sum()<0.55*(a>128).sum(): keep=a>0
    keep=cv2.dilate(keep.astype(np.uint8),cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(3,3)))
    soft=cv2.GaussianBlur(keep.astype(np.float32),(3,3),0.7)
    na=np.minimum(a,soft*255)
    Image.fromarray(np.dstack([rgb,na]).astype(np.uint8),'RGBA').save(dst)
    return keep.sum()/(max(1,(a>128).sum()))
if __name__=='__main__':
    for f in sys.argv[1:]: print(f, round(fix(f,f),2))
