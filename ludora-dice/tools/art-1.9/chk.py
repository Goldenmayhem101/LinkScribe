import sys,glob,os
from PIL import Image,ImageDraw
fs=sorted(glob.glob(sys.argv[1]));N=int(sys.argv[3]) if len(sys.argv)>3 else 15;S=int(sys.argv[4]) if len(sys.argv)>4 else 120
rows=(len(fs)+N-1)//N;out=Image.new('RGB',(N*S,rows*(S+12)),(40,30,90));d=ImageDraw.Draw(out)
for i,f in enumerate(fs):
  im=Image.open(f).convert('RGBA');im.thumbnail((S-6,S-6));x=(i%N)*S;y=(i//N)*(S+12)
  out.paste(im,(x+(S-im.width)//2,y+12+(S-im.height)//2),im);d.text((x+2,y),os.path.basename(f)[:14],fill=(255,255,255))
out.save(sys.argv[2],quality=85)
