import numpy as np, json
from PIL import Image
from scipy import ndimage as nd
U='/root/.claude/uploads/957dfba1-5557-5840-8d08-7445ff9065c4/'
SPEC=[('a','deefc358-image.png',[(8,8,1528,552,6,3,18),(8,566,1528,1018,8,4,32)]),
      ('t','04d44247-image.png',[(8,8,1528,515,6,3,18),(8,530,1528,1018,8,4,32)])]+\
     [(k,f,[(0,0,1374,1145,6,6,34)]) for k,f in [('m','da7c2fef-image.png'),('s','9f110fc5-image.png'),('f','dae7b6bd-image.png'),('r','dd46633a-image.png'),('b','6b8f7095-image.png')]]
report={}
for key,fn,regions in SPEC:
    im=np.asarray(Image.open(U+fn).convert('RGB')).astype(np.float32);H,W,_=im.shape
    mn=im.min(2);sat=im.max(2)-mn
    lum=im.mean(2);mu=nd.uniform_filter(lum,5);var=nd.uniform_filter(lum*lum,5)-mu*mu
    # local background colour: light, flat pixels; smoothed estimate everywhere
    bgish=(mn>200)&(sat<16)&(var<10)
    bgcol=np.zeros_like(im)
    for c in range(3):
        num=nd.uniform_filter(np.where(bgish,im[...,c],0),41);den=nd.uniform_filter(bgish.astype(np.float32),41)
        bgcol[...,c]=np.where(den>1e-3,num/np.maximum(den,1e-3),250)
    diff=np.abs(im-bgcol).max(2)
    # hard background = connected to border, close to local bg colour
    near=diff<16
    bl,_=nd.label(near);edge=set(np.unique(np.concatenate([bl[0],bl[-1],bl[:,0],bl[:,-1]])))-{0}
    sizes=nd.sum(near,bl,range(1,bl.max()+1))
    bg=np.isin(bl,list(edge|{i+1 for i,v in enumerate(sizes) if v>1500}))
    # enclosed flat gaps that are the paper colour
    enc=(diff<10)&(var<6)&~bg
    el,en=nd.label(enc);es=nd.sum(enc,el,range(1,en+1))
    bg|=np.isin(el,[i+1 for i,v in enumerate(es) if v>30])
    obj=~bg;obj=nd.binary_opening(obj,iterations=1)
    # panel border lines (sheet a/t): thin long components
    ol,on=nd.label(obj);objs=nd.find_objects(ol);area=nd.sum(obj,ol,range(1,on+1))
    cells=[]
    for (x0,y0,x1,y1,cols,rows,count) in regions:
        cw=(x1-x0)/cols;ch=(y1-y0)/rows;n=0
        for r in range(rows):
            for c in range(cols):
                if n>=count:break
                n+=1;cells.append((x0+c*cw,y0+r*ch,cw,ch))
    owner={}
    for i,sl in enumerate(objs):
        if sl is None or area[i]<12:continue
        ys,xs=sl;bh=ys.stop-ys.start;bw=xs.stop-xs.start
        if area[i]<(bh*bw)*0.06 and max(bh,bw)>120:continue   # frame line
        cy,cx=nd.center_of_mass(ol[sl]==i+1);cy+=ys.start;cx+=xs.start
        for k,(cx0,cy0,cw,ch) in enumerate(cells):
            if cx0<=cx<cx0+cw and cy0<=cy<cy0+ch:owner.setdefault(k,[]).append(i+1);break
    for k,(cx0,cy0,cw,ch) in enumerate(cells):
        name=f'{key}{k:02d}'
        comps=owner.get(k,[])
        if not comps:report[name]='empty';continue
        a=np.array([area[c-1] for c in comps]);main=comps[int(a.argmax())]
        mask=ol==main
        # keep other comps of this cell that are near the main body
        near_main=nd.binary_dilation(mask,iterations=14)
        for c in comps:
            if c!=main and (near_main&(ol==c)).any():mask|=ol==c
        ys,xs=np.where(mask);y0,y1,x0,x1=ys.min(),ys.max(),xs.min(),xs.max()
        merged=(x1-x0)>cw*1.25 or (y1-y0)>ch*1.25
        if merged:report[name]='merged';continue
        y0=max(0,y0-4);x0=max(0,x0-4);y1=min(H,y1+5);x1=min(W,x1+5)
        M=mask[y0:y1,x0:x1];C=im[y0:y1,x0:x1];B=bgcol[y0:y1,x0:x1];D=diff[y0:y1,x0:x1]
        inner=nd.binary_erosion(M,iterations=2);outer=nd.binary_dilation(M,iterations=2)
        band=outer&~inner
        # soft alpha in the edge band from distance to background colour
        al=np.where(inner,1.0,0.0)
        est=np.clip((D-6)/55.0,0,1)
        al=np.where(band,est,al)
        al=np.where(M&band,np.maximum(al,0.35),al)
        al=nd.gaussian_filter(al,0.6)*outer
        al[inner]=1.0
        # decontaminate colour: remove the paper colour that leaked into soft edges
        a3=np.clip(al,0.05,1)[...,None]
        F=np.clip((C-(1-a3)*B)/a3,0,255)
        F=np.where((al<0.98)[...,None],F,C)
        # whiteness of the final rim (for the quality check)
        rim=(al>0.3)&~nd.binary_erosion(al>0.3,iterations=2)
        rc=F[rim];white=float(((rc.min(1)>215)&((rc.max(1)-rc.min(1))<25)).mean()) if rim.any() else 0
        rgba=np.dstack([F,al*255]).astype(np.uint8)
        yy,xx=np.where(rgba[...,3]>8);rgba=rgba[yy.min():yy.max()+1,xx.min():xx.max()+1]
        Image.fromarray(rgba,'RGBA').save(f'mon3/{name}.png');report[name]=round(white,3)
    print(key,flush=True)
json.dump(report,open('mon3/report.json','w'),indent=0)
bad={k:v for k,v in report.items() if isinstance(v,str)};print('bad',bad)
w=sorted([(v,k) for k,v in report.items() if not isinstance(v,str)],reverse=True)[:25];print('whitest rims',w)
