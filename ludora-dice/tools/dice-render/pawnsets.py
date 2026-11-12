# Character pawns: character head on a glossy 3D body in the team color -> pawnset/<id>_<color>.webp
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
os.makedirs('pawnset', exist_ok=True)
EMO = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 109)
CHESS = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 300)
COL = {'red': '#e3262c', 'green': '#1fa83c', 'yellow': '#f2bd12', 'blue': '#1f6fe3'}
HEAD = {'critter':'🐹','robot':'🤖','ghost':'👻','rocket':'🚀','a_bear':'🐻','a_panda':'🐼','a_pup':'🐶','a_fox':'🦊','a_lion':'🦁','a_tiger':'🐯',
 'a_rabbit':'🐰','a_monkey':'🐵','a_koala':'🐨','a_piglet':'🐷','a_penguin':'🐧','a_owl':'🦉','a_duck':'🦆','a_chick':'🐥','a_bee':'🐝','a_ladybug':'🐞',
 'a_butterfly':'🦋','a_spider':'🕷️','a_clownfish':'🐠','a_shark':'🦈','a_octopus':'🐙','a_crab':'🦀','a_whale':'🐳','a_puffer':'🐡','a_ufo':'🛸',
 'a_satellite':'🛰️','a_alien':'👽','a_astronaut':'🧑‍🚀','a_comet':'☄️','a_dragon':'🐲','a_unicorn':'🦄','a_wizard':'🧙','a_fairy':'🧚','a_bat':'🦇'}
HAT = {'a_dragon':'🔥','a_unicorn':'✨','a_wizard':'🔮','a_ufo':'✨','a_alien':'✨','a_astronaut':'⭐'}   # legendary sparkle badge
CHESSG = {'a_rook':'♜','a_bishop':'♝','a_knight':'♞','a_queen':'♛','a_king':'♚'}
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
def emoji(ch, size):
    im = Image.new('RGBA', (160, 160)); ImageDraw.Draw(im).text((80, 80), ch, font=EMO, embedded_color=True, anchor='mm')
    im = im.crop(im.getbbox()); s = size / max(im.size)
    return im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
def body(c):
    im = Image.open(f'out/body_{c}.png').convert('RGBA'); return im.crop(im.getbbox())
def outline(im, w, col):
    a = im.getchannel('A').filter(ImageFilter.MaxFilter(w * 2 + 1))
    o = Image.new('RGBA', im.size, col); o.putalpha(a); o.alpha_composite(im); return o
for c, hx in COL.items():
    b = body(c)
    for pid, ch in HEAD.items():
        W = 260; H = 300
        cv = Image.new('RGBA', (W, H))
        bb = b.resize((int(b.width * 190 / b.height * .78), int(190 * .78)), Image.LANCZOS)
        cv.alpha_composite(bb, ((W - bb.width) // 2, H - bb.height - 6))
        hd = outline(emoji(ch, 150), 5, (255, 255, 255, 255))
        sh = Image.new('RGBA', hd.size, (0, 0, 0, 0)); sh.putalpha(hd.getchannel('A').point(lambda v: v * .35)); sh = sh.filter(ImageFilter.GaussianBlur(6))
        x = (W - hd.width) // 2; y = H - bb.height - hd.height + 40
        cv.alpha_composite(sh, (x + 4, y + 8)); cv.alpha_composite(hd, (x, y))
        if pid in HAT:
            bd = emoji(HAT[pid], 60); cv.alpha_composite(bd, (W - bd.width - 18, max(0, y - 6)))
        cv = cv.crop(cv.getbbox()); cv.save(f'pawnset/{pid}_{c}.webp', quality=88)
    for pid, g in CHESSG.items():
        W = 300; H = 380
        cv = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(cv)
        base = hexc(hx); dark = tuple(int(v * .55) for v in base); light = tuple(min(255, int(v + (255 - v) * .45)) for v in base)
        d.text((W // 2, H // 2), g, font=CHESS, anchor='mm', fill=base + (255,), stroke_width=9, stroke_fill=dark + (255,))
        # gloss: lighter left band clipped to glyph
        m = cv.getchannel('A'); gl = Image.new('RGBA', (W, H), light + (0,))
        gd = ImageDraw.Draw(gl); gd.ellipse((W * .22, H * .12, W * .52, H * .8), fill=light + (150,))
        gl = gl.filter(ImageFilter.GaussianBlur(14)); ga = Image.composite(gl, Image.new('RGBA', (W, H)), m.point(lambda v: 255 if v > 200 else 0))
        cv.alpha_composite(ga); cv = outline(cv.crop(cv.getbbox()), 4, (255, 255, 255, 255))
        if pid in ('a_queen', 'a_king'):
            sp = emoji('✨', 70); cv2 = Image.new('RGBA', (cv.width + 30, cv.height + 20)); cv2.alpha_composite(cv, (0, 20)); cv2.alpha_composite(sp, (cv2.width - 70, 0)); cv = cv2
        cv.save(f'pawnset/{pid}_{c}.webp', quality=88)
    print(c)
