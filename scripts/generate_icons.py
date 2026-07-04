# -*- coding: utf-8 -*-
"""生成 PWA 圖示（統一識別系統：紫底 ABC + 藥丸「複習」）到 app/。
與其他英語 App 共用同一套模板，只換顏色與藥丸字。"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.path.join(ROOT, 'app')
COLOR = (13, 148, 136)  # #0d9488 青綠(片語)
PILL = '片語'
FA = r'C:\Windows\Fonts\arialbd.ttf'
FZ = r'C:\Windows\Fonts\msjhbd.ttc'


def font(p, s):
    try: return ImageFont.truetype(p, s)
    except Exception: return ImageFont.load_default()


def mix(c, t, w=(255, 255, 255)):
    return tuple(int(c[i] + (w[i] - c[i]) * t) for i in range(3))


def draw_icon(size, maskable=False):
    c, c2 = COLOR, mix(COLOR, 0.22)
    img = Image.new('RGB', (size, size)); px = img.load(); m = (size - 1) * 2.0
    for y in range(size):
        for x in range(size):
            t = (x + y) / m
            px[x, y] = tuple(int(c[i] + (c2[i] - c[i]) * t) for i in range(3))
    img = img.convert('RGBA')
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([-size*0.3, -size*0.35, size*0.7, size*0.65], fill=(255, 255, 255, 38))
    img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(size*0.1)))
    d = ImageDraw.Draw(img); s = 0.80 if maskable else 1.0; cx = size / 2
    d.text((cx, size * (0.40 if not maskable else 0.42)), 'ABC', font=font(FA, int(size*0.30*s)),
           fill=(255, 255, 255, 255), anchor='mm')
    pw, ph = size*0.52*s, size*0.20*s; py = size*(0.72 if not maskable else 0.70)
    x0, y0, x1, y1 = cx-pw/2, py-ph/2, cx+pw/2, py+ph/2
    d.rounded_rectangle([x0, y0, x1, y1], radius=ph/2, fill=(255, 255, 255, 255))
    d.text((cx, (y0+y1)/2), PILL, font=font(FZ, int(ph*0.62)), fill=c, anchor='mm')
    return img.convert('RGB')


for size, name in [(192, 'icon-192.png'), (512, 'icon-512.png'), (180, 'icon-180.png')]:
    draw_icon(size).save(os.path.join(APP, name))
draw_icon(512, maskable=True).save(os.path.join(APP, 'icon-maskable.png'))
print('已生成統一識別圖示(紫/複習): icon-192/512/180.png + icon-maskable.png')
