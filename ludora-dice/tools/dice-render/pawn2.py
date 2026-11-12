# Ludora pawns v2: whole character in the team color, thick dark outline, gloss, small and chunky -> pawn2/<id>_<color>.png
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np, colorsys, os, sys
os.makedirs('pawn2', exist_ok=True)
EMO = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 109)
TEAM = {'red': 0.995, 'green': 0.36, 'yellow': 0.13, 'blue': 0.6}
CH = {'critter':'🐹','robot':'🤖','ghost':'👻','rocket':'🚀','a_bear':'🐻','a_panda':'🐼','a_pup':'🐶','a_fox':'🦊','a_lion':'🦁','a_tiger':'🐯',
 'a_rabbit':'🐰','a_monkey':'🐵','a_koala':'🐨','a_piglet':'🐷','a_penguin':'🐧','a_owl':'🦉','a_duck':'🐤','a_chick':'🐥','a_bee':'🐝','a_ladybug':'🐞',
 'a_butterfly':'🦋','a_spider':'🕷️','a_clownfish':'🐠','a_shark':'🦈','a_octopus':'🐙','a_crab':'🦀','a_whale':'🐳','a_puffer':'🐡','a_ufo':'🛸',
 'a_satellite':'🛰️','a_alien':'👾','a_astronaut':'🧑‍🚀','a_comet':'☄️','a_dragon':'🐲','a_unicorn':'🦄','a_wizard':'🧙','a_fairy':'🧚','a_bat':'🦇',
 'a_rook':'♜','a_bishop':'♝','a_knight':'♞','a_queen':'♛','a_king':'♚'}
ROT = {'rocket':45}
CHESS = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 260)
def src(pid):
    ch = CH[pid]
    im = Image.new('RGBA', (300, 300))
    d = ImageDraw.Draw(im)
    if pid in ('a_rook','a_bishop','a_knight','a_queen','a_king'):
        d.text((150, 150), ch, font=CHESS, anchor='mm', fill=(200,200,200,255))
        # shade: lighter left, darker right for a glossy round look
        a = np.array(im).astype(float); h, w = a.shape[:2]
        xs = np.linspace(1.15, .7, w)[None, :]
        a[..., :3] = np.clip(a[..., :3] * xs[..., None], 0, 255)
        im = Image.fromarray(a.astype('uint8'))
    else:
        t = Image.new('RGBA', (160, 160)); ImageDraw.Draw(t).text((80, 80), ch, font=EMO, embedded_color=True, anchor='mm'); im = t
    if pid in ROT: im = im.rotate(ROT[pid], expand=True, resample=Image.BICUBIC)
    return im.crop(im.getbbox())
def tint(im, hue):
    a = np.array(im.convert('RGBA')).astype(float) / 255
    rgb, al = a[..., :3], a[..., 3]
    mx, mn = rgb.max(-1), rgb.min(-1); L = (mx + mn) / 2; S = np.where(mx > mn, (mx - mn) / (1 - np.abs(2 * L - 1) + 1e-6), 0)
    out = rgb.copy()
    H, W = L.shape
    for y in range(H):
        for x in range(W):
            if al[y, x] < .02: continue
            l, s = L[y, x], S[y, x]
            if l > .975: continue                    # keep pure whites (eyes, teeth, shine)
            if l < .14: continue                     # keep darks (pupils, lines)
            if s < .18 and l > .62: nl = .5 + (l - .62) * .9; ns = .85   # light fur / white bodies take the team color
            else: nl = min(.86, max(.2, l)); ns = .92 if s > .18 else .75
            r, g, b = colorsys.hls_to_rgb(hue, nl, ns)
            out[y, x] = (r, g, b)
    a[..., :3] = out
    return Image.fromarray((a * 255).astype('uint8'))
def finish(im, size):
    s = size / max(im.size); im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
    pad = 16; cv = Image.new('RGBA', (im.width + pad * 2, im.height + pad * 2 + 10)); cv.alpha_composite(im, (pad, pad))
    A = cv.getchannel('A')
    ol = A.filter(ImageFilter.MaxFilter(11)); dark = Image.new('RGBA', cv.size, (34, 18, 52, 255)); dark.putalpha(ol)
    out = Image.new('RGBA', cv.size)
    sh = Image.new('RGBA', cv.size, (0, 0, 0, 0)); shd = ImageDraw.Draw(sh)
    shd.ellipse((cv.width * .18, cv.height - 30, cv.width * .82, cv.height - 6), fill=(0, 0, 0, 90)); sh = sh.filter(ImageFilter.GaussianBlur(4))
    out.alpha_composite(sh); out.alpha_composite(dark); out.alpha_composite(cv)
    # gloss: soft white highlight top-left, clipped to the character
    gl = Image.new('RGBA', cv.size); ImageDraw.Draw(gl).ellipse((cv.width * .2, cv.height * .1, cv.width * .55, cv.height * .38), fill=(255, 255, 255, 80))
    gl = gl.filter(ImageFilter.GaussianBlur(10)); gm = Image.new('RGBA', cv.size); gm.paste(gl, (0, 0), A); out.alpha_composite(gm)
    return out.crop(out.getbbox())
ids = sys.argv[1:] or list(CH)
for pid in ids:
    base = src(pid)
    for c, hue in TEAM.items():
        finish(tint(base, hue), 170).save(f'pawn2/{pid}_{c}.png')
    print(pid, end=' ', flush=True)
print()
