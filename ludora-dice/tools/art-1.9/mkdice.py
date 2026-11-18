# build dice strips (18 x 144px: 12 tumble frames + faces 1..6) from ChatGPT sheets (5 rows x 2 cols: 3/4 view | flat face)
import numpy as np,sys,os,json,subprocess
from PIL import Image,ImageDraw,ImageFilter,ImageFont
B=os.path.dirname(os.path.abspath(__file__))
U='/root/.claude/uploads/957dfba1-5557-5840-8d08-7445ff9065c4/'
FONT=B+'/../w17/baloo800.ttf'
OUT=B+'/dice';os.makedirs(OUT,exist_ok=True);os.makedirs(B+'/dview',exist_ok=True)
S=144
RARE=[('bcf640f0',[('r_mint','Mint Cone'),('r_honey','Honeycomb'),('r_seaglass','Sea Glass'),('r_peach','Peach Marble'),('r_bubble','Soap Bubble')]),
 ('62a4a224',[('r_melon','Watermelon'),('r_oak','Polished Oak'),('r_coral','Coral Shell'),('r_lemon','Lemon Sugar'),('r_cloud','Cloud Puff')]),
 ('09ade3cb',[('r_quartz','Rose Quartz'),('r_bamboo','Bamboo'),('r_copper','Copper'),('r_velvet','Pistachio Velvet'),('r_cotton','Cotton Candy')]),
 ('b855d396',[('r_porcelain','Snow Porcelain'),('r_sunset','Sunset Glass'),('r_jade','Jade Stone'),('r_jelly','Blueberry Jelly'),('r_mirror','Silver Mirror')]),
 ('7cd008b9',[('r_ginger','Gingerbread'),('r_moss','Mossy Stone'),('r_lacquer','Cherry Lacquer'),('r_turq','Turquoise'),('r_pearl','Milk Pearl')])]
LEG=[('918f0dfa',[('d_fire','Inferno'),('d_lightning','Lightning'),('d_galaxy','Galaxy'),('d_dragon','Dragon Scale'),('d_prism','Rainbow Prism')]),
 ('3572a3af',[('d_lava','Lava Rock'),('d_ocean','Ocean Wave'),('d_sun','Golden Sun'),('d_amethyst','Shadow Amethyst'),('d_blossom','Cherry Blossom')]),
 ('7f8e3ad8',[('l_blackhole','Black Hole'),('l_aurora','Aurora'),('l_eclipse','Solar Eclipse'),('l_moon','Crescent Moon'),('l_tree','Tree of Life')]),
 ('1f06f2ad',[('l_diamond','Flawless Diamond'),('l_crown','Crown Jewel'),('l_angel','Angel Wing'),('l_spiritfox','Spirit Fox'),('l_lion','Golden Lion')]),
 ('cacd96dd',[('l_hourglass','Hourglass'),('l_plasma','Plasma Core'),('l_icepalace','Ice Palace'),('l_clockwork','Clockwork'),('l_starlight','Starlight')])]
PIPS={1:[(.5,.5)],2:[(.28,.28),(.72,.72)],3:[(.28,.28),(.5,.5),(.72,.72)],4:[(.28,.28),(.72,.28),(.28,.72),(.72,.72)],
      5:[(.28,.28),(.72,.28),(.5,.5),(.28,.72),(.72,.72)],6:[(.28,.25),(.72,.25),(.28,.5),(.72,.5),(.28,.75),(.72,.75)]}
def cut_sheet(sid):
    d=B+'/dcut/'+sid;os.makedirs(d,exist_ok=True)
    subprocess.run(['python3',B+'/cut.py',U+sid+'-image.png','5','2',d,'c','900'],check=True,capture_output=True)
    return [(clip_outline(Image.open(f'{d}/c{2*i+1:02d}.webp').convert('RGBA')),clip_outline(Image.open(f'{d}/c{2*i+2:02d}.webp').convert('RGBA'))) for i in range(5)]
from scipy import ndimage as nd
def clip_outline(im):
    a=np.asarray(im).astype(np.int32);al=a[...,3]>40
    dark=(a[...,:3].max(2)<95)&al
    ring=nd.binary_closing(dark,iterations=3)
    inside=nd.binary_fill_holes(ring)
    if inside.sum()<0.5*al.sum():return im
    inside=nd.binary_dilation(inside,iterations=1)
    out=np.asarray(im).copy();out[...,3]=np.where(inside,out[...,3],0);return Image.fromarray(out,'RGBA')
def fill_faces(im,ref):
    a=np.asarray(im).copy();al=a[...,3]>100;filled=nd.binary_fill_holes(nd.binary_closing(al,iterations=2));hole=filled&~al
    if hole.sum()<20:return im
    r=np.asarray(ref).astype(float);h,w=r.shape[:2];c=r[int(h*.4):int(h*.6),int(w*.4):int(w*.6),:3].reshape(-1,3).mean(0)
    a[hole,:3]=c.astype(np.uint8);a[hole,3]=255;return Image.fromarray(a,'RGBA')
def fit(im,size,pad=.06):
    im=im.crop(im.getbbox());s=size*(1-2*pad)/max(im.size);im=im.resize((max(1,round(im.width*s)),max(1,round(im.height*s))),Image.LANCZOS)
    c=Image.new('RGBA',(size,size));c.alpha_composite(im,((size-im.width)//2,(size-im.height)//2));return c
def inner_box(face):
    a=np.asarray(face)[...,3]>128;ys,xs=np.where(a);return xs.min(),ys.min(),xs.max(),ys.max()
def centre_lum(face):
    a=np.asarray(face).astype(float);h,w=a.shape[:2];c=a[int(h*.38):int(h*.62),int(w*.38):int(w*.62)];return (c[...,:3]@[.3,.59,.11]).mean()
def pip_layer(n,size,light):
    L=Image.new('RGBA',(size,size));d=ImageDraw.Draw(L);r=size*0.085
    for (x,y) in PIPS[n]:
        cx,cy=x*size,y*size
        if light: d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=(29,20,64,255));d.ellipse((cx-r*.45,cy-r*.7,cx+r*.15,cy-r*.15),fill=(255,255,255,70))
        else: d.ellipse((cx-r-2,cy-r-2,cx+r+2,cy+r+2),fill=(23,15,69,255));d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=(255,255,255,255))
    return L
def num_layer(n,size,glow):
    L=Image.new('RGBA',(size,size));f=ImageFont.truetype(FONT,int(size*.62));d=ImageDraw.Draw(L)
    t=str(n);bb=d.textbbox((0,0),t,font=f);x=(size-(bb[2]-bb[0]))/2-bb[0];y=(size-(bb[3]-bb[1]))/2-bb[1]
    g=Image.new('RGBA',(size,size));ImageDraw.Draw(g).text((x,y),t,font=f,fill=glow+(255,),stroke_width=int(size*.06),stroke_fill=glow+(255,))
    g=g.filter(ImageFilter.GaussianBlur(size*.05));L.alpha_composite(g)
    d.text((x,y),t,font=f,fill=(255,247,214,255),stroke_width=int(size*.035),stroke_fill=(23,15,69,255))
    # gold lower half
    m=Image.new('L',(size,size),0);ImageDraw.Draw(m).text((x,y),t,font=f,fill=255)
    grad=Image.linear_gradient('L').resize((size,size));gold=Image.new('RGBA',(size,size),(255,196,40,255));gold.putalpha(Image.fromarray((np.asarray(m)*(np.asarray(grad)/255.0)**1.4).astype(np.uint8)))
    L.alpha_composite(gold);return L
def mark(face,n,kind,glow):
    x0,y0,x1,y1=inner_box(face);w,h=x1-x0,y1-y0;inset=.17 if kind=='pip' else .12
    sz=int(min(w,h)*(1-2*inset));lay=pip_layer(n,sz,centre_lum(face)>140) if kind=='pip' else num_layer(n,sz,glow)
    out=face.copy();out.alpha_composite(lay,(int(x0+(w-sz)/2),int(y0+(h-sz)/2)));return out
def iso(cube,marks,kind,glow,light):
    # paint 3 face markings onto the 3/4 cube with affine maps (top, left, right faces)
    a=np.asarray(cube)[...,3]>128;ys,xs=np.where(a);x0,x1,y0,y1=xs.min(),xs.max(),ys.min(),ys.max();w,h=x1-x0,y1-y0;cx=(x0+x1)/2
    T=(cx,y0);UL=(x0,y0+h*.24);UR=(x1,y0+h*.24);C=(cx,y0+h*.47);LL=(x0,y1-h*.25);LR=(x1,y1-h*.25);Bt=(cx,y1)
    sc=.74;ct=((T[0]+C[0])/2,(T[1]+C[1])/2);va=(sc*(UR[0]-UL[0]),sc*(UR[1]-UL[1]));vb=(sc*(C[0]-T[0]),sc*(C[1]-T[1]))
    o0=(ct[0]-va[0]/2-vb[0]/2,ct[1]-va[1]/2-vb[1]/2)
    faces=[(o0,(o0[0]+va[0],o0[1]+va[1]),(o0[0]+vb[0],o0[1]+vb[1])),(UL,C,LL),(C,UR,Bt)];out=cube.copy();N=200
    for (o,p,q),n,sh in zip(faces,marks,[1.0,.82,.68]):
        lay=pip_layer(n,N,light) if kind=='pip' else num_layer(n,N,glow)
        pad=.16;full=Image.new('RGBA',(N,N));s=int(N*(1-2*pad));full.alpha_composite(lay.resize((s,s),Image.LANCZOS),(int(N*pad),int(N*pad)))
        # inverse affine: output (X,Y) -> input (u,v)*N where P = o + u*(p-o) + v*(q-o)
        M=np.array([[p[0]-o[0],q[0]-o[0]],[p[1]-o[1],q[1]-o[1]]]);Mi=np.linalg.inv(M)/1.0
        a_,b_=Mi[0]*N;c_,d_=Mi[1]*N
        coef=(a_[0] if False else Mi[0][0]*N,Mi[0][1]*N,-(Mi[0][0]*o[0]+Mi[0][1]*o[1])*N,Mi[1][0]*N,Mi[1][1]*N,-(Mi[1][0]*o[0]+Mi[1][1]*o[1])*N)
        warped=full.transform(cube.size,Image.AFFINE,coef,Image.BICUBIC)
        if sh<1: arr=np.asarray(warped).astype(float);arr[...,:3]*=sh;warped=Image.fromarray(arr.astype(np.uint8),'RGBA')
        out.alpha_composite(warped)
    al=np.minimum(np.asarray(out)[...,3],np.asarray(cube)[...,3]);out.putalpha(Image.fromarray(al));return out
ISO=[(1,2,3),(5,4,6),(3,1,2),(6,5,4),(2,6,1),(4,3,5)]
def strip(did,cube,face,kind,glow):
    light=centre_lum(face)>140
    faces=[fit(mark(face,n,kind,glow),S) for n in range(1,7)]
    tum=[];rot=[0,-30,25,-55,40,-15,60,-40,15,-65,35,-20]
    for i in range(12):
        if i%2==0: im=fit(iso(cube,ISO[(i//2)%6],kind,glow,light),S,.08)
        else: im=fit(mark(face,[2,5,3,1,4,6][(i//2)%6],kind,glow),S,.12)
        tum.append(im.rotate(rot[i],Image.BICUBIC,expand=False))
    st=Image.new('RGBA',(S*18,S))
    for i,im in enumerate(tum+faces): st.alpha_composite(im,(i*S,0))
    st.save(f'{OUT}/{did}.webp',quality=88,method=6)
    v=fit(iso(cube,(1,2,3),kind,glow,light),520,.03);v.save(f'{B}/dview/{did}.webp',quality=90)
    for n in range(1,7): fit(mark(face,n,kind,glow),360,.02).save(f'{B}/dview/{did}_f{n}.webp',quality=88)
GLOW={'d_fire':(255,110,20),'d_lightning':(80,170,255),'d_galaxy':(200,90,255),'d_dragon':(60,220,140),'d_prism':(255,120,220),
 'd_lava':(255,90,20),'d_ocean':(40,190,255),'d_sun':(255,190,30),'d_amethyst':(190,80,255),'d_blossom':(255,120,180),
 'l_blackhole':(190,70,255),'l_aurora':(80,255,180),'l_eclipse':(255,170,40),'l_moon':(160,190,255),'l_tree':(120,240,90),
 'l_diamond':(140,220,255),'l_crown':(255,60,80),'l_angel':(255,215,110),'l_spiritfox':(80,160,255),'l_lion':(255,180,40),
 'l_hourglass':(255,200,60),'l_plasma':(220,90,255),'l_icepalace':(120,210,255),'l_clockwork':(255,190,70),'l_starlight':(170,140,255)}
meta=[]
for sid,names in RARE:
    for (cube,face),(did,nm) in zip(cut_sheet(sid),names): strip(did,cube,face,'pip',None);meta.append([did,nm,'rare'])
for sid,names in LEG:
    for (cube,face),(did,nm) in zip(cut_sheet(sid),names): face=fill_faces(face,face);cube=fill_faces(cube,face);strip(did,cube,face,'num',GLOW[did]);meta.append([did,nm,'legendary'])
json.dump(meta,open(B+'/dice19.json','w'));print(len(meta))
