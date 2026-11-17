# split a board image into background (left) + sticker sheet (right) by finding the flat gray region
import numpy as np,sys
from PIL import Image
src,out=sys.argv[1:3]
im=Image.open(src).convert('RGB');a=np.asarray(im).astype(np.int16);H,W,_=a.shape
gray=(np.abs(a-np.array([214,214,214])).max(2)<14)
col=gray.mean(0)
# first column from the left where mostly gray (sticker sheet starts)
x=next((i for i in range(W//4,W) if col[i]>0.55),W)
bg=im.crop((0,0,x,H))
# trim any thin gray/white seam on the right edge of the background
b=np.asarray(bg).astype(np.int16)
while bg.width>10 and (np.abs(b[:,-1]-214).max(1)<20).mean()>0.3: bg=bg.crop((0,0,bg.width-1,H));b=b[:,:-1]
bg.save(out+'_bg.png');im.crop((x,0,W,H)).save(out+'_st.png');print(src.split('/')[-1],x,W,H)
