import numpy as np,sys,glob,cv2
from PIL import Image
from scipy import ndimage as nd
BG=np.array([213.,213.,213.])
def fix(f,band=18):
    im=np.asarray(Image.open(f).convert('RGBA')).astype(np.float32)
    rgb=im[...,:3];a=im[...,3]/255
    H,W=a.shape
    # distance from the outside (transparent) region
    outside=a<0.05
    dist=cv2.distanceTransform((~outside).astype(np.uint8),cv2.DIST_L2,3)
    mx=rgb.max(2);mn=rgb.min(2);sat=mx-mn;lum=rgb.mean(2)
    near=np.abs(lum-BG.mean())
    grayish=(sat<30)&(near<55)
    # pixels of background tone that are connected to the outside through background-tone pixels
    cand=grayish&(dist<band)
    lab,n=nd.label(cand|outside)
    edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    conn=np.isin(lab,list(edge))&cand
    # colour-to-alpha against the gray
    t=np.clip((near+sat*1.4-6)/48,0,1)
    na=np.where(conn,np.minimum(a,t),a)
    # un-mix gray from semi transparent pixels
    keep=na>0.02
    out=rgb.copy()
    m=(na<a)&keep
    out[m]=np.clip((rgb[m]-(1-na[m,None])*BG)/np.maximum(na[m,None],.05),0,255)
    # soften the edge 1px
    na=cv2.GaussianBlur(na,(3,3),0.6)*(na>0.01)
    res=np.dstack([out,na*255]).astype(np.uint8)
    Image.fromarray(res,'RGBA').save(f)
if __name__=="__main__":
  for f in sys.argv[1:]: fix(f)
