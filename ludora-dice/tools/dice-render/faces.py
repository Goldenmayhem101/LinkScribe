# Face pictures for themed dice: character + number on a themed background -> faces/<id>_<n>.png (512x512)
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, math, random
os.makedirs('faces', exist_ok=True)
EMO = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 109)
NUM = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 150)
THEMES = {
 't_pirate':  {'bg':['#1e6fb0','#0b3a66'],'rim':'#f2c14e','chars':['🦜','🏴‍☠️','🦜','💰','🗺️','🦜'],'pat':'⚓'},
 't_astro':   {'bg':['#2a1a6a','#0a0626'],'rim':'#9ad8ff','chars':['🧑‍🚀','🚀','🪐','🧑‍🚀','🌍','🧑‍🚀'],'pat':'✨'},
 't_bear':    {'bg':['#ff9ec9','#e05a9a'],'rim':'#fff0f7','chars':['🧸','🍭','🧸','🧁','🍬','🧸'],'pat':'🍬'},
 't_dragon':  {'bg':['#c42a0a','#4a0603'],'rim':'#ffd24a','chars':['🐉','🔥','🐲','💎','🔥','🐉'],'pat':'🔥'},
 't_robot':   {'bg':['#3ad6c4','#0a5a6a'],'rim':'#e0fff9','chars':['🤖','⚙️','🤖','🔋','💡','🤖'],'pat':'⚙️'},
 't_mermaid': {'bg':['#3ac8e0','#0a5a8a'],'rim':'#ffe0f0','chars':['🧜‍♀️','🐚','🧜‍♀️','🐠','🫧','🧜‍♀️'],'pat':'🫧'},
 't_tiger':   {'bg':['#ffb02a','#c45a0a'],'rim':'#2a1404','chars':['🐯','🌴','🐅','🍃','🐾','🐯'],'pat':'🐾'},
 't_owl':     {'bg':['#6a3ad6','#1a0a4a'],'rim':'#ffe08a','chars':['🦉','🔮','🦉','📜','🌙','🦉'],'pat':'⭐'},
 't_unicorn': {'bg':['#ffffff','#d6c4ff'],'rim':'#ff9bd9','chars':['🦄','🌈','🦄','✨','🌸','🦄'],'pat':'🌈'},
 't_ghost':   {'bg':['#3a1a5a','#100620'],'rim':'#ff9a2a','chars':['👻','🎃','👻','🦇','🕸️','👻'],'pat':'🦇'},
}
def emoji(ch, size):
    im = Image.new('RGBA', (160, 160), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((80, 80), ch, font=EMO, embedded_color=True, anchor='mm')
    im = im.crop(im.getbbox() or (0, 0, 160, 160))
    s = size / max(im.size)
    return im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
for tid, t in THEMES.items():
    random.seed(tid)
    for n in range(1, 7):
        S = 512
        im = Image.new('RGBA', (S, S))
        a, b = hexc(t['bg'][0]), hexc(t['bg'][1])
        px = im.load()
        for y in range(S):
            for x in range(S):
                d = math.hypot(x - S * .4, y - S * .35) / (S * .8)
                d = min(1, d)
                px[x, y] = tuple(int(a[i] + (b[i] - a[i]) * d) for i in range(3)) + (255,)
        # faint pattern
        pat = emoji(t['pat'], 54)
        pat.putalpha(pat.getchannel('A').point(lambda v: v * .22))
        for k in range(14):
            im.alpha_composite(pat, (random.randint(0, S - 60), random.randint(0, S - 60)))
        # character, big
        ch = emoji(t['chars'][n - 1], 330)
        sh = Image.new('RGBA', ch.size, (0, 0, 0, 0)); sh.putalpha(ch.getchannel('A').point(lambda v: v * .45))
        sh = sh.filter(ImageFilter.GaussianBlur(10))
        cx, cy = (S - ch.width) // 2, (S - ch.height) // 2 + 12
        im.alpha_composite(sh, (cx + 8, cy + 14)); im.alpha_composite(ch, (cx, cy))
        # number badge bottom-right
        d = ImageDraw.Draw(im)
        bx, by, r = S - 118, S - 118, 92
        d.ellipse((bx - r, by - r, bx + r, by + r), fill=hexc(t['rim']) + (255,), outline=(255, 255, 255, 255), width=10)
        dark = sum(hexc(t['rim'])) > 500
        d.text((bx, by + 4), str(n), font=NUM, fill=(40, 20, 10, 255) if dark else (255, 255, 255, 255), anchor='mm',
               stroke_width=0 if dark else 6, stroke_fill=(0, 0, 0, 160))
        im.convert('RGB').save(f'faces/{tid}_{n}.png')
    print(tid)
