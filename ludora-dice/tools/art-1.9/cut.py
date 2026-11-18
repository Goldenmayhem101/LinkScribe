# cut a grid sheet (flat light gray background) into cells, row by row; split lines snap to the emptiest gap
# usage: python3 cut.py sheet rows cols outdir prefix [maxside]
import numpy as np,cv2,sys,os
from PIL import Image
from scipy import ndimage as nd
src,R,C,outdir,prefix=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),sys.argv[4],sys.argv[5]
MAX=int(sys.argv[6]) if len(sys.argv)>6 else 512
os.makedirs(outdir,exist_ok=True)
im=np.asarray(Image.open(src).convert('RGB'));H,W,_=im.shape
f=im.astype(np.float32)
bgc=np.median(np.concatenate([im[:4].reshape(-1,3),im[-4:].reshape(-1,3),im[:,:4].reshape(-1,3),im[:,-4:].reshape(-1,3)]),0)
diff=np.abs(f-bgc).max(2);sat=f.max(2)-f.min(2)
cand=(diff<20)&(sat<20)
# background = gray region connected to the image border (keeps gray pockets inside figures)
lab,n=nd.label(cand)
edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
bg=np.isin(lab,list(edge))
fg=~bg
def splits(prof,k,L):
    out=[0]
    for i in range(1,k):
        c=int(L*i/k);w=int(L/k*0.35)
        seg=prof[max(0,c-w):c+w];j=int(np.argmin(np.convolve(seg,np.ones(9)/9,'same')))
        out.append(max(0,c-w)+j)
    out.append(L);return out
if R==0:
    # object mode: C = number of objects; blobs found on a dilated mask so glows/sparkles stay with their figure
    K=C;big=nd.binary_dilation(nd.binary_opening(fg,iterations=1),iterations=int(sys.argv[7]) if len(sys.argv)>7 else 10)
    bl,bn=nd.label(big);bs=nd.sum(big,bl,range(1,bn+1));top=sorted(range(bn),key=lambda i:-bs[i])[:K]
    objs=[]
    for i in top:
        sl=nd.find_objects(bl)[i];objs.append((sl[0].start,sl[0].stop,sl[1].start,sl[1].stop,i+1))
    objs.sort(key=lambda b:(b[0]+b[1])/2);rows=[]
    for b in objs:
        cy=(b[0]+b[1])/2
        if rows and abs(cy-rows[-1][0])<H*0.15:rows[-1][1].append(b)
        else:rows.append([cy,[b]])
    k=0
    for _,rb in rows:
        for y0,y1,x0,x1,li in sorted(rb,key=lambda b:b[2]):
            keep=fg[y0:y1,x0:x1]&(bl[y0:y1,x0:x1]==li)
            yy,xx=np.where(keep);a0,a1,b0,b1=yy.min(),yy.max()+1,xx.min(),xx.max()+1;mm=keep[a0:a1,b0:b1]
            dist=cv2.distanceTransform(mm.astype(np.uint8),cv2.DIST_L2,3);al=np.clip((dist-0.3)/1.4,0,1)
            p=Image.fromarray(np.dstack([im[y0+a0:y0+a1,x0+b0:x0+b1],al*255]).astype(np.uint8),'RGBA')
            if max(p.size)>MAX:p.thumbnail((MAX,MAX),Image.LANCZOS)
            k+=1;p.save(f'{outdir}/{prefix}{k:02d}.webp',quality=90,method=5)
    print(src.split('/')[-1][:8],'objects',k,[len(r[1]) for r in rows]);sys.exit()
ys=splits(fg.sum(1),R,H);xs=splits(fg.sum(0),C,W)
k=0
for r in range(R):
  for c in range(C):
    y0,y1,x0,x1=ys[r],ys[r+1],xs[c],xs[c+1]
    m=fg[y0:y1,x0:x1].copy()
    m=nd.binary_opening(m,iterations=1)
    ol,on=nd.label(m)
    k+=1
    if on==0: print('empty',r,c);continue
    sz=nd.sum(m,ol,range(1,on+1))
    keep=np.isin(ol,[i+1 for i in range(on) if sz[i]>max(40,sz.max()*0.004)])
    # drop pieces of neighbours: blobs (on a dilated mask) whose centre sits near the cell's side edges
    dl,dn=nd.label(nd.binary_dilation(keep,iterations=6))
    if dn>1:
        cw,ch=keep.shape[1],keep.shape[0];ok=[]
        dsz=nd.sum(keep,dl,range(1,dn+1));mx=dsz.max()
        for i,(cy,cx) in enumerate(nd.center_of_mass(keep,dl,range(1,dn+1))):
            if dsz[i]==mx or (0.18*cw<cx<0.82*cw and 0.12*ch<cy<0.88*ch): ok.append(i+1)
        keep=keep&np.isin(dl,ok)
    keep=nd.binary_fill_holes(keep)|keep
    yy,xx=np.where(keep)
    if len(yy)==0: continue
    a0,a1,b0,b1=yy.min(),yy.max()+1,xx.min(),xx.max()+1
    mm=keep[a0:a1,b0:b1]
    dist=cv2.distanceTransform(mm.astype(np.uint8),cv2.DIST_L2,3);al=np.clip((dist-0.3)/1.4,0,1)
    rgba=np.dstack([im[y0+a0:y0+a1,x0+b0:x0+b1],al*255]).astype(np.uint8)
    p=Image.fromarray(rgba,'RGBA')
    if max(p.size)>MAX: p.thumbnail((MAX,MAX),Image.LANCZOS)
    p.save(f'{outdir}/{prefix}{k:02d}.webp',quality=90,method=5)
print(src.split('/')[-1][:8],R,C,'->',k)
