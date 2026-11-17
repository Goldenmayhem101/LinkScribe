import sys,os,numpy as np,subprocess,glob
from PIL import Image,ImageFilter,ImageEnhance,ImageDraw
k=sys.argv[1]
bg=Image.open(f'boards/{k}_bg.png').convert('RGB')
# --- world background 720x1280 (cover) ---
W,H=720,1280;s=max(W/bg.width,H/bg.height);b2=bg.resize((int(bg.width*s+.5),int(bg.height*s+.5)),Image.LANCZOS)
x=(b2.width-W)//2;y=(b2.height-H)//2;world=b2.crop((x,y,x+W,y+H))
world.save(f'out/boards/{k}-w.webp',quality=82)
# --- board square 1080: blurred scenery behind + dark glass, then the clean grid drawn by svg ---
S=1080;s2=max(S/bg.width,S/bg.height);b3=bg.resize((int(bg.width*s2+.5),int(bg.height*s2+.5)),Image.LANCZOS)
x=(b3.width-S)//2;y=(b3.height-S)//2;sq=b3.crop((x,y,x+S,y+S)).filter(ImageFilter.GaussianBlur(10))
sq=ImageEnhance.Brightness(sq).enhance(.55);sq=ImageEnhance.Color(sq).enhance(1.2)
sq.save(f'stk/{k}_sq.png')
