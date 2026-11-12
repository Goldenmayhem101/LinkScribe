# Better designs for Critter, Robot, Rocket and Ghost
from PIL import Image, ImageDraw, ImageFont, ImageFilter
EMO = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 109)
COL = {'red': '#e3262c', 'green': '#1fa83c', 'yellow': '#f2bd12', 'blue': '#1f6fe3'}
def hexc(h): h=h.lstrip('#'); return tuple(int(h[i:i+2],16) for i in (0,2,4))
def emoji(ch,size,rot=0):
    im=Image.new('RGBA',(160,160));ImageDraw.Draw(im).text((80,80),ch,font=EMO,embedded_color=True,anchor='mm')
    im=im.crop(im.getbbox())
    if rot: im=im.rotate(rot,expand=True,resample=Image.BICUBIC); im=im.crop(im.getbbox())
    s=size/max(im.size);return im.resize((max(1,int(im.width*s)),max(1,int(im.height*s))),Image.LANCZOS)
def outline(im,w,col=(255,255,255,255)):
    a=im.getchannel('A').filter(ImageFilter.MaxFilter(w*2+1));o=Image.new('RGBA',im.size,col);o.putalpha(a);o.alpha_composite(im);return o
def shadowed(cv,im,x,y,blur=6,op=.35):
    sh=Image.new('RGBA',im.size);sh.putalpha(im.getchannel('A').point(lambda v:v*op));sh=sh.filter(ImageFilter.GaussianBlur(blur))
    cv.alpha_composite(sh,(x+4,y+8));cv.alpha_composite(im,(x,y))
def body(c,scale):
    b=Image.open(f'out/body_{c}.png').convert('RGBA');b=b.crop(b.getbbox())
    return b.resize((int(b.width*scale),int(b.height*scale)),Image.LANCZOS)
def pad(c,w,h):
    # glossy disc base in team color
    base=hexc(COL[c]);im=Image.new('RGBA',(w,h));d=ImageDraw.Draw(im)
    dark=tuple(int(v*.55) for v in base);light=tuple(min(255,int(v+(255-v)*.5)) for v in base)
    d.ellipse((0,h*.25,w,h),fill=dark+(255,));d.ellipse((0,0,w,h*.75),fill=base+(255,));d.ellipse((w*.15,h*.08,w*.6,h*.35),fill=light+(170,))
    return im.filter(ImageFilter.GaussianBlur(1))
for c,hx in COL.items():
    # Rocket: upright rocket on a launch pad with flames
    W,H=240,360;cv=Image.new('RGBA',(W,H))
    fl=emoji('🔥',80,180);cv.alpha_composite(fl,((W-fl.width)//2,H-110))
    p=pad(c,190,70);cv.alpha_composite(p,((W-190)//2,H-80))
    r=outline(emoji('🚀',230,45),5);shadowed(cv,r,(W-r.width)//2,H-70-r.height)
    cv=cv.crop(cv.getbbox());cv.save(f'pawnset/rocket_{c}.webp',quality=88)
    # Robot: robot head on the team body, lightning badge, antenna glow
    W,H=260,320;cv=Image.new('RGBA',(W,H));b=body(c,.85);cv.alpha_composite(b,((W-b.width)//2,H-b.height-4))
    hd=outline(emoji('🤖',120),5);y=H-b.height-hd.height+34;shadowed(cv,hd,(W-hd.width)//2,y)
    bd=outline(emoji('⚡',58),3);cv.alpha_composite(bd,((W-bd.width)//2,H-b.height//2-4))
    cv=cv.crop(cv.getbbox());cv.save(f'pawnset/robot_{c}.webp',quality=88)
    # Critter: hamster with an acorn on the team body
    W,H=270,320;cv=Image.new('RGBA',(W,H));b=body(c,.85);cv.alpha_composite(b,((W-b.width)//2,H-b.height-4))
    hd=outline(emoji('🐹',125),5);y=H-b.height-hd.height+36;shadowed(cv,hd,(W-hd.width)//2,y)
    ac=outline(emoji('🌰',60),3);cv.alpha_composite(ac,(W-ac.width-20,y+hd.height-30))
    cv=cv.crop(cv.getbbox());cv.save(f'pawnset/critter_{c}.webp',quality=88)
    # Ghost: floating ghost with a glowing team-color aura and a little shadow
    W,H=260,330;cv=Image.new('RGBA',(W,H));d=ImageDraw.Draw(cv)
    d.ellipse((60,H-40,W-60,H-10),fill=(0,0,0,70))
    au=Image.new('RGBA',(W,H));ImageDraw.Draw(au).ellipse((20,30,W-20,H-50),fill=hexc(hx)+(170,));au=au.filter(ImageFilter.GaussianBlur(24));cv.alpha_composite(au)
    g=outline(emoji('👻',200),5);cv.alpha_composite(g,((W-g.width)//2,40))
    for (x,y) in ((30,40),(W-60,90)):cv.alpha_composite(emoji('✨',44),(x,y))
    cv=cv.crop(cv.getbbox());cv.save(f'pawnset/ghost_{c}.webp',quality=88)
print('ok')
