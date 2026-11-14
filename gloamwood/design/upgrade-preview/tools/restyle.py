"""Redraw a cut-out monster in Gloamwood's own look: soft painted shapes, moonlit palette, moon rim light, ink outline.
Edge pixels are thrown away and replaced by the outline, so no white from the old background can survive."""
import numpy as np, cv2, sys, os
from PIL import Image
INK=np.array([22,16,40],np.float32)      # outline colour (deep night purple, like the game's ink)
MOON=np.array([214,236,255],np.float32)  # rim light
DUSK=np.array([96,66,128],np.float32)
def restyle(path,out,maxside=300):
    a=np.asarray(Image.open(path).convert('RGBA')).astype(np.float32)
    S=3;H,W=a.shape[:2]
    if os.path.basename(path)[:-4] in FILL:
        from scipy import ndimage as nd0
        m=a[...,3]>128;hl,hn=nd0.label(nd0.binary_fill_holes(m)&~m)
        for i in range(1,hn+1):
            r=hl==i;cy=np.where(r)[0].mean()
            if cy<H*.8:
                a=a.copy();rr=nd0.binary_dilation(r,iterations=2);ring=nd0.binary_dilation(rr,iterations=3)&~rr&(a[...,3]>200)
                px=a[...,:3][ring];lt=px[px.mean(1)>np.percentile(px.mean(1),55)] if len(px) else np.array([[235,235,240]])
                col=np.median(lt,0);a[...,:3][rr]=col;a[...,3]=np.where(rr,255,a[...,3])
    # remove pale smooth floor patches (old ground shadow) touching the creature's bottom from outside
    from scipy import ndimage as nd
    rgb0=a[...,:3];al0=a[...,3]/255;mn=rgb0.min(2);sat=rgb0.max(2)-mn;lum=rgb0.mean(2)
    mu=nd.uniform_filter(lum,5);var=nd.uniform_filter(lum*lum,5)-mu*mu
    band=np.zeros((H,W),bool);band[int(H*.72):,:]=True
    band2=np.zeros((H,W),bool);band2[int(H*.8):,:]=True
    floor=(band&(mn>135)&(sat<48)&(var<140)&(al0>0))|(band2&(mn>85)&(sat<34)&(var<90)&(al0>0))|(band&(al0<.75)&(sat<50))
    reach=(al0<.1)
    for _ in range(80):
        g2=nd.binary_dilation(reach)&floor&~reach
        if not g2.any():break
        reach|=g2
    kill=reach&floor
    a=a.copy();a[...,3]=np.where(kill,0,a[...,3])
    big=cv2.resize(a,(W*S,H*S),interpolation=cv2.INTER_CUBIC)
    rgb=np.clip(big[...,:3],0,255).astype(np.uint8);al=big[...,3]/255
    m=(al>0.55).astype(np.uint8)
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
    # throw away the outer rim where old background could hide
    core=cv2.erode(m,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*S+1,2*S+1)))
    # fill the colour of removed rim from inside (so blurs never pull in white)
    dist,lab=cv2.distanceTransformWithLabels(1-core,cv2.DIST_L2,5,labelType=cv2.DIST_LABEL_PIXEL)
    idx=np.zeros(lab.max()+1,np.int64);ys,xs=np.where(core>0);idx[lab[ys,xs]]=ys*rgb.shape[1]+xs
    flat=rgb.reshape(-1,3);rgb2=flat[idx[lab].ravel()].reshape(rgb.shape)
    rgb2[core>0]=rgb[core>0]
    # 1) painted simplification: mean-shift + edge-preserving smoothing (removes photo texture, keeps shapes)
    p=cv2.pyrMeanShiftFiltering(rgb2,sp=6*S,sr=34)
    p=cv2.edgePreservingFilter(p,flags=1,sigma_s=90,sigma_r=0.42)
    p=cv2.bilateralFilter(p,0,40,4*S)
    # 2) soft cel steps: quantise luminance a little, keep hue
    lab_=cv2.cvtColor(p,cv2.COLOR_RGB2LAB).astype(np.float32)
    L=lab_[...,0];steps=9.0;Lq=np.round(L/255*steps)/steps*255;Lq=cv2.GaussianBlur(Lq,(0,0),S*0.8);lab_[...,0]=L*0.3+Lq*0.7
    p=cv2.cvtColor(np.clip(lab_,0,255).astype(np.uint8),cv2.COLOR_LAB2RGB).astype(np.float32)
    # 3) moonlit grade: slightly less saturated, cool shadows, warm-free highlights
    g=p.mean(2,keepdims=True);p=g+(p-g)*0.9
    lum=p.mean(2,keepdims=True)/255
    p=p*(0.84+0.12*lum)+DUSK*(1-lum)*0.22+np.array([10,14,30],np.float32)*0.5
    p=np.clip((p-118)*1.12+124,0,255)
    # 4) light from top-left + soft occlusion at the bottom
    Hh,Ww=core.shape;yy,xx=np.mgrid[0:Hh,0:Ww]
    ys,xs=np.where(core>0);y0,y1,x0,x1=ys.min(),ys.max(),xs.min(),xs.max()
    u=(xx-x0)/max(1,x1-x0);v=(yy-y0)/max(1,y1-y0)
    shade=1.06-0.16*(0.6*v+0.4*u)
    p=p*shade[...,None]
    occ=np.clip((v-0.78)/0.22,0,1)[...,None]*0.18;p=p*(1-occ)+INK*occ
    # 5) moon rim light on the upper-left inner edge
    d_in=cv2.distanceTransform(core,cv2.DIST_L2,5)
    rimband=np.clip(1-d_in/(3.2*S),0,1)
    dy=cv2.Sobel(core.astype(np.float32),cv2.CV_32F,0,1,ksize=5);dx=cv2.Sobel(core.astype(np.float32),cv2.CV_32F,1,0,ksize=5)
    nrm=np.hypot(dx,dy)+1e-3;facing=np.clip((dx*0.55+dy*0.83)/nrm,0,1)   # edges facing up-left (normal points out = negative grad)
    facing=cv2.GaussianBlur(facing,(0,0),S*1.5)
    rim=(np.clip(rimband*1.3,0,1)*np.clip(facing*1.4,0,1)*0.85)[...,None]
    p=p*(1-rim)+MOON*rim
    # 6) soft interior ink lines on strong colour edges (features)
    gray=cv2.cvtColor(np.clip(p,0,255).astype(np.uint8),cv2.COLOR_RGB2GRAY)
    ed=cv2.Canny(cv2.GaussianBlur(gray,(0,0),1.2*S/2),40,110)
    ed=cv2.GaussianBlur(ed.astype(np.float32)/255,(0,0),0.8)*(core>0)
    ed=(ed*0.5)[...,None];p=p*(1-ed)+INK*ed
    # 7) ink outline around the trimmed body
    olw=int(2.6*S)
    outer=cv2.dilate(core,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*olw+1,2*olw+1)))
    p=np.where((core>0)[...,None],p,INK)
    alpha=outer.astype(np.float32)
    alpha=cv2.GaussianBlur(alpha,(0,0),S*0.45);alpha=np.clip(alpha*1.15,0,1)
    out_img=np.dstack([np.clip(p,0,255),alpha*255]).astype(np.uint8)
    # back to game size
    ys,xs=np.where(alpha>0.02);cy0=max(0,ys.min()-2);cx0=max(0,xs.min()-2);out_img=out_img[cy0:ys.max()+3,cx0:xs.max()+3]
    h2,w2=out_img.shape[:2];k=min(maxside/max(h2,w2),1/S*1.25)
    META[os.path.basename(out)[:-4]]=[S,int(cx0),int(cy0),float(k)]
    im=Image.fromarray(out_img,'RGBA').resize((max(1,round(w2*k)),max(1,round(h2*k))),Image.LANCZOS)
    im.save(out)
META={}
FILL={'b04','b31','b16'}
if __name__=='__main__':
    import json
    ids=sys.argv[1].split(',') if sys.argv[1]!='*' else sorted(f[:-4] for f in os.listdir('mon3') if f.endswith('.png') and '.eyes' not in f)
    for i,n in enumerate(ids):
        restyle('mon3/'+n+'.png','mon4/'+n+'.png')
        if i%40==0:print(i,flush=True)
    old=json.load(open('mon4/meta.json')) if os.path.exists('mon4/meta.json') else {}
    old.update(META);json.dump(old,open('mon4/meta.json','w'))
