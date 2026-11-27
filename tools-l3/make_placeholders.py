#!/usr/bin/env python3
"""第 3 關（鷹愁澗）占位美術產生器：畫 SVG → 用 Chromium 轉成 PNG/JPG，檔名就是以後正式美術的最終檔名。
正式圖到了只要覆蓋同名檔，不必改程式。另外輸出 img/map-10.svg（10 站大地圖底圖，不轉檔）。
用法：python3 tools-l3/make_placeholders.py   （需要 playwright 的 chromium）
MAP_POS 要和 data.js 的 MAP_POS 一樣。"""
import math, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / 'img'
INK = '#3b2a1d'
ST = f'stroke="{INK}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"'
ST5 = f'stroke="{INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"'
FONT = "font-family=\"'Noto Sans CJK TC','Noto Sans CJK JP',sans-serif\" font-weight=\"900\""
MAP_POS = [[30,93],[68,83],[32,72],[66,62],[34,52],[66,42],[32,32],[68,22],[36,13],[56,5]]  # 與 data.js 一致

def svg(w, h, body, extra=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" {extra}>{body}</svg>'

DROP = lambda x, y, s=1, c='#8fd8ff': f'<path transform="translate({x} {y}) scale({s})" d="M0 -26 C 16 -4 18 10 0 16 C -18 10 -16 -4 0 -26Z" fill="{c}" stroke="{INK}" stroke-width="{5/s}" stroke-linejoin="round"/>'

# ---------- 水水（小白龍）：四種表情，512×512 ----------
def water(face):
    eyes = {
        'normal': f'<ellipse cx="196" cy="236" rx="15" ry="22" fill="{INK}"/><ellipse cx="316" cy="236" rx="15" ry="22" fill="{INK}"/><circle cx="201" cy="227" r="6" fill="#fff"/><circle cx="321" cy="227" r="6" fill="#fff"/>',
        'laugh': f'<path d="M172 246 Q196 212 220 246" fill="none" {ST}/><path d="M292 246 Q316 212 340 246" fill="none" {ST}/>',
        'cheeky': f'<ellipse cx="196" cy="236" rx="15" ry="22" fill="{INK}"/><circle cx="201" cy="227" r="6" fill="#fff"/><path d="M292 240 Q316 214 340 240" fill="none" {ST}/>',
        'tame': f'<path d="M172 236 Q196 262 220 236" fill="none" {ST}/><path d="M292 236 Q316 262 340 236" fill="none" {ST}/>',
    }[face]
    mouth = {
        'normal': f'<path d="M226 296 Q256 322 286 296" fill="none" {ST}/>',
        'laugh': f'<path d="M212 286 Q256 372 300 286 Z" fill="#c0392b" {ST5}/><path d="M232 330 Q256 312 280 330 Q256 352 232 330Z" fill="#ff8fa3"/>',
        'cheeky': f'<path d="M218 292 Q256 340 294 292 Z" fill="#c0392b" {ST5}/><ellipse cx="270" cy="332" rx="20" ry="26" fill="#ff8fa3" stroke="{INK}" stroke-width="5"/>',
        'tame': f'<path d="M232 298 Q256 318 280 298" fill="none" {ST}/>',
    }[face]
    extra = ''
    if face == 'cheeky':
        extra = DROP(64,150,1.1) + DROP(452,120,1.2) + DROP(474,214,.9) + DROP(40,240,.8)
    if face == 'tame':
        extra = '<path d="M440 120 l10 24 24 10 -24 10 -10 24 -10 -24 -24 -10 24 -10z" fill="#ffe066" stroke="%s" stroke-width="5" stroke-linejoin="round"/>' % INK
    blush = '<ellipse cx="160" cy="288" rx="24" ry="14" fill="#ff9fb2" opacity="%s"/><ellipse cx="352" cy="288" rx="24" ry="14" fill="#ff9fb2" opacity="%s"/>' % (('.9',)*2 if face == 'tame' else ('.55',)*2)
    body = f'''
<ellipse cx="256" cy="478" rx="150" ry="20" fill="#000" opacity=".12"/>
<ellipse cx="170" cy="462" rx="46" ry="24" fill="#4aa8de" {ST}/><ellipse cx="342" cy="462" rx="46" ry="24" fill="#4aa8de" {ST}/>
<ellipse cx="90" cy="250" rx="34" ry="52" fill="#9adcff" {ST} transform="rotate(-18 90 250)"/><ellipse cx="422" cy="250" rx="34" ry="52" fill="#9adcff" {ST} transform="rotate(18 422 250)"/>
<path d="M256 78 C 336 78 398 136 404 222 C 440 254 450 330 420 394 C 395 450 330 470 256 470 C 182 470 117 450 92 394 C 62 330 72 254 108 222 C 114 136 176 78 256 78Z" fill="#69c3f2" {ST}/>
<path d="M176 100 L160 40 L214 84Z" fill="#ffe9a8" {ST}/><path d="M336 100 L352 40 L298 84Z" fill="#ffe9a8" {ST}/>
<ellipse cx="256" cy="378" rx="108" ry="80" fill="#e3f5ff" stroke="{INK}" stroke-width="5"/>
<circle cx="126" cy="352" r="26" fill="#69c3f2" {ST5}/><circle cx="386" cy="352" r="26" fill="#69c3f2" {ST5}/>
<path d="M256 108 q-14 -34 0 -54 q14 20 0 54z" fill="#b5e6ff" {ST5}/>
{blush}{eyes}{mouth}{extra}'''
    return svg(512, 512, body)

# ---------- 荷葉、小島、白龍馬 ----------
LOTUS = svg(512, 384, f'''
<ellipse cx="256" cy="226" rx="236" ry="132" fill="#2a7f46" opacity=".35"/>
<ellipse cx="256" cy="200" rx="226" ry="128" fill="#5cc46a" {ST}/>
<ellipse cx="256" cy="184" rx="170" ry="84" fill="#7ee08a" opacity=".75"/>
<path d="M256 202 L452 162 L458 214 Z" fill="#3f9c52" {ST5}/>
<g stroke="#3f9c52" stroke-width="6" stroke-linecap="round" fill="none"><path d="M256 202 L110 150"/><path d="M256 202 L90 220"/><path d="M256 202 L140 280"/><path d="M256 202 L256 296"/><path d="M256 202 L370 280"/><path d="M256 202 L236 80"/></g>
<circle cx="256" cy="202" r="14" fill="#ffe066" {ST5}/>
<g transform="translate(150 118)"><circle r="22" fill="#ff9fc0" {ST5}/><circle r="9" fill="#ffe066"/></g>''')

ISLAND = svg(640, 440, f'''
<ellipse cx="320" cy="390" rx="290" ry="40" fill="#000" opacity=".12"/>
<ellipse cx="320" cy="320" rx="300" ry="100" fill="#f3d48a" {ST}/>
<ellipse cx="320" cy="292" rx="262" ry="72" fill="#7bd36b" {ST}/>
<path d="M320 290 C 308 220 332 160 318 100" fill="none" stroke="{INK}" stroke-width="30" stroke-linecap="round"/>
<path d="M320 290 C 308 220 332 160 318 100" fill="none" stroke="#b9763a" stroke-width="18" stroke-linecap="round"/>
<g {ST5}><path d="M318 100 C 260 70 210 90 190 130 C 240 110 280 116 318 100Z" fill="#46b85a"/><path d="M318 100 C 380 66 430 86 452 128 C 400 108 360 114 318 100Z" fill="#46b85a"/><path d="M318 100 C 300 50 330 20 360 14 C 350 50 340 76 318 100Z" fill="#5fcf6b"/></g>
<ellipse cx="150" cy="322" rx="34" ry="22" fill="#bdbdbd" {ST5}/><ellipse cx="500" cy="316" rx="26" ry="18" fill="#cfcfcf" {ST5}/>
<g transform="translate(430 280)"><circle r="14" fill="#ff9fc0" {ST5}/><circle r="5" fill="#ffe066"/></g>''')

def horse_frag(ox=0, oy=0, s=1):
    return f'''<g transform="translate({ox} {oy}) scale({s})">
<path d="M96 276 C 40 250 30 330 56 380 C 70 340 92 320 120 320Z" fill="#b5e6ff" {ST}/>
<rect x="134" y="340" width="40" height="120" rx="16" fill="#fff" {ST}/><rect x="186" y="344" width="40" height="116" rx="16" fill="#f1f1f1" {ST}/>
<rect x="300" y="344" width="40" height="116" rx="16" fill="#f1f1f1" {ST}/><rect x="350" y="340" width="40" height="120" rx="16" fill="#fff" {ST}/>
<rect x="134" y="440" width="40" height="26" rx="10" fill="#8aa7c7" {ST5}/><rect x="186" y="440" width="40" height="26" rx="10" fill="#8aa7c7" {ST5}/><rect x="300" y="440" width="40" height="26" rx="10" fill="#8aa7c7" {ST5}/><rect x="350" y="440" width="40" height="26" rx="10" fill="#8aa7c7" {ST5}/>
<ellipse cx="256" cy="320" rx="158" ry="92" fill="#fff" {ST}/>
<path d="M340 270 L396 140 L462 170 L420 300Z" fill="#fff" {ST}/>
<path d="M346 262 C 370 190 372 150 396 128 C 380 170 392 220 366 290Z" fill="#b5e6ff" {ST5}/>
<ellipse cx="452" cy="170" rx="62" ry="44" fill="#fff" {ST} transform="rotate(20 452 170)"/>
<ellipse cx="488" cy="190" rx="30" ry="24" fill="#ffe3e3" {ST5}/>
<circle cx="440" cy="154" r="9" fill="{INK}"/><circle cx="443" cy="151" r="3" fill="#fff"/>
<path d="M410 126 L396 82 L432 112Z" fill="#fff" {ST5}/>
<path d="M432 112 L440 56 L462 88Z" fill="#ffe9a8" {ST5}/><path d="M452 120 L488 70 L486 112Z" fill="#ffe9a8" {ST5}/>
<ellipse cx="256" cy="316" rx="62" ry="40" fill="#e3f5ff" opacity=".8"/></g>'''

BAIMA = svg(560, 520, horse_frag(0, 20, 1))

# ---------- 地圖精靈（悟空拿金箍棒、唐僧、唐僧騎白龍馬）----------
def monkey_frag():
    return f'''
<rect x="278" y="40" width="22" height="430" rx="10" fill="#c0392b" {ST5}/><rect x="274" y="40" width="30" height="46" rx="10" fill="#ffd34d" {ST5}/><rect x="274" y="424" width="30" height="46" rx="10" fill="#ffd34d" {ST5}/>
<path d="M130 370 C 70 360 60 300 96 290" fill="none" stroke="{INK}" stroke-width="22" stroke-linecap="round"/><path d="M130 370 C 70 360 60 300 96 290" fill="none" stroke="#b9763a" stroke-width="10" stroke-linecap="round"/>
<path d="M120 480 Q192 500 264 480 L252 330 Q192 300 132 330Z" fill="#f08a24" {ST}/>
<rect x="132" y="372" width="120" height="16" fill="#c0392b" {ST5}/>
<ellipse cx="150" cy="486" rx="40" ry="20" fill="#7a4a24" {ST5}/><ellipse cx="236" cy="486" rx="40" ry="20" fill="#7a4a24" {ST5}/>
<circle cx="84" cy="196" r="34" fill="#b9763a" {ST}/><circle cx="84" cy="196" r="18" fill="#ffd3b0"/><circle cx="300" cy="196" r="34" fill="#b9763a" {ST}/><circle cx="300" cy="196" r="18" fill="#ffd3b0"/>
<circle cx="192" cy="210" r="112" fill="#b9763a" {ST}/>
<path d="M120 200 Q192 130 264 200 Q290 270 192 296 Q94 270 120 200Z" fill="#ffd3b0" {ST5}/>
<rect x="100" y="120" width="184" height="26" rx="12" fill="#ffd34d" {ST5}/>
<ellipse cx="156" cy="212" rx="12" ry="16" fill="{INK}"/><ellipse cx="228" cy="212" rx="12" ry="16" fill="{INK}"/><circle cx="160" cy="206" r="4" fill="#fff"/><circle cx="232" cy="206" r="4" fill="#fff"/>
<path d="M164 256 Q192 280 220 256" fill="none" {ST5}/>
<circle cx="132" cy="250" r="12" fill="#ff9fb2" opacity=".6"/><circle cx="252" cy="250" r="12" fill="#ff9fb2" opacity=".6"/>
<circle cx="292" cy="360" r="18" fill="#ffd3b0" {ST5}/>'''

def monk_frag(ox=0, oy=0, s=1, staff=True):
    st = f'<rect x="288" y="60" width="14" height="410" rx="7" fill="#b9763a" {ST5}/><circle cx="295" cy="60" r="26" fill="none" stroke="#ffd34d" stroke-width="10"/><circle cx="295" cy="60" r="6" fill="#ffd34d"/>' if staff else ''
    return f'''<g transform="translate({ox} {oy}) scale({s})">{st}
<path d="M110 486 Q192 506 274 486 L262 300 Q192 270 122 300Z" fill="#f4b73f" {ST}/>
<path d="M122 300 Q192 340 262 300 L274 360 Q192 400 110 360Z" fill="#e2582e" {ST5}/>
<rect x="150" y="372" width="84" height="14" fill="#fff2c9" {ST5}/>
<ellipse cx="150" cy="490" rx="38" ry="18" fill="#7a4a24" {ST5}/><ellipse cx="236" cy="490" rx="38" ry="18" fill="#7a4a24" {ST5}/>
<circle cx="192" cy="200" r="100" fill="#ffd9b8" {ST}/>
<ellipse cx="94" cy="216" rx="16" ry="30" fill="#ffd9b8" {ST5}/><ellipse cx="290" cy="216" rx="16" ry="30" fill="#ffd9b8" {ST5}/>
<path d="M160 120 Q192 100 224 120" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".7"/>
<path d="M148 202 Q162 190 176 202" fill="none" {ST5}/><path d="M208 202 Q222 190 236 202" fill="none" {ST5}/>
<path d="M168 246 Q192 266 216 246" fill="none" {ST5}/>
<circle cx="140" cy="236" r="12" fill="#ff9fb2" opacity=".6"/><circle cx="244" cy="236" r="12" fill="#ff9fb2" opacity=".6"/>
<circle cx="274" cy="372" r="18" fill="#ffd9b8" {ST5}/></g>'''

WUKONG_STAFF = svg(384, 512, monkey_frag())
TANG_FOLLOW = svg(384, 512, monk_frag())
TANG_BAIMA = svg(640, 640, horse_frag(40, 150, 1.05) + monk_frag(150, 0, .8))

# ---------- 圖卡類：圓角色塊＋大字（記憶圖、例詞、拼音圖）----------
PASTEL = ['#ffe3e3', '#e3f3ff', '#e6ffe3', '#fff3c9']
def card(text, color, size=None):
    n = len(text); fs = size or (230 if n == 1 else 160 if n == 2 else 110)
    return svg(512, 512, f'<rect x="20" y="20" width="472" height="472" rx="110" fill="{color}" {ST}/>'
        f'<text x="256" y="{256+fs*.36:.0f}" text-anchor="middle" font-size="{fs}" fill="{INK}" {FONT}>{text}</text>')

def stamp(txt):
    return svg(512, 512, f'<circle cx="256" cy="256" r="236" fill="#d8392b" stroke="#8f1f17" stroke-width="12"/><circle cx="256" cy="256" r="196" fill="none" stroke="#ffe9e0" stroke-width="8"/>'
        f'<text x="256" y="236" text-anchor="middle" font-size="108" fill="#fff4ea" {FONT}>{txt[:2]}</text><text x="256" y="360" text-anchor="middle" font-size="108" fill="#fff4ea" {FONT}>{txt[2:]}</text>')

STICKER = svg(512, 512, f'<circle cx="256" cy="256" r="236" fill="#fff" {ST}/><circle cx="256" cy="256" r="212" fill="#e3f5ff"/>'
    f'<path transform="translate(256 272) scale(7.2)" d="M0 -26 C 16 -4 18 10 0 16 C -18 10 -16 -4 0 -26Z" fill="#69c3f2" stroke="{INK}" stroke-width="1.2" stroke-linejoin="round"/>'
    f'<circle cx="234" cy="296" r="10" fill="{INK}"/><circle cx="278" cy="296" r="10" fill="{INK}"/><path d="M236 326 Q256 346 276 326" fill="none" {ST5}/>'
    f'<circle cx="222" cy="272" r="22" fill="#fff" opacity=".6"/>')

STATION3 = svg(128, 128, f'<rect x="8" y="8" width="112" height="112" rx="30" fill="#bfe8ff" {ST5}/><path d="M16 84 Q40 70 64 84 T112 84 L112 110 Q112 116 104 116 L24 116 Q16 116 16 110Z" fill="#69c3f2" stroke="{INK}" stroke-width="4"/>'
    f'<ellipse cx="64" cy="76" rx="30" ry="12" fill="#5cc46a" stroke="{INK}" stroke-width="4"/><path d="M64 76 L90 70" stroke="{INK}" stroke-width="4"/><circle cx="80" cy="40" r="14" fill="#ffd34d" stroke="{INK}" stroke-width="4"/>')

# ---------- 背景 ----------
def bg_teach():
    return svg(1080, 1920, f'''
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fdcff"/><stop offset=".55" stop-color="#e9f8ff"/></linearGradient>
<linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8bd7f5"/><stop offset="1" stop-color="#4fb3e3"/></linearGradient></defs>
<rect width="1080" height="1920" fill="url(#s)"/>
<path d="M0 520 L110 280 L220 420 L330 220 L440 520Z" fill="#9db9c9" opacity=".75"/><path d="M640 520 L760 260 L870 420 L980 210 L1080 360 L1080 520Z" fill="#9db9c9" opacity=".75"/>
<path d="M0 760 L0 400 L150 520 L260 380 L380 760Z" fill="#6f9a86"/><path d="M700 760 L820 420 L930 540 L1080 380 L1080 760Z" fill="#6f9a86"/>
<path d="M380 700 L700 700 L1000 1920 L80 1920Z" fill="url(#w)"/>
<g fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".6"><path d="M420 900 q40 -24 80 0 t80 0"/><path d="M520 1180 q40 -24 80 0 t80 0"/><path d="M300 1500 q40 -24 80 0 t80 0"/><path d="M640 1660 q40 -24 80 0 t80 0"/></g>
<path d="M0 1500 Q200 1440 330 1560 L120 1920 L0 1920Z" fill="#7bd36b"/><path d="M1080 1480 Q900 1420 760 1560 L960 1920 L1080 1920Z" fill="#7bd36b"/>''')

def bg_battle():
    return svg(1080, 1920, f'''
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd6ff"/><stop offset="1" stop-color="#ddf4ff"/></linearGradient>
<linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd2f4"/><stop offset="1" stop-color="#3fa9de"/></linearGradient></defs>
<rect width="1080" height="1920" fill="#3fa9de"/>
<rect width="1080" height="330" fill="url(#s)"/>
<path d="M0 330 L0 40 L110 120 L210 20 L320 190 L360 330Z" fill="#8fa8b8"/><path d="M720 330 L790 160 L880 60 L980 140 L1080 20 L1080 330Z" fill="#8fa8b8"/>
<path d="M0 330 L0 150 L90 220 L180 130 L260 330Z" fill="#6f9a86"/><path d="M820 330 L900 200 L980 250 L1080 140 L1080 330Z" fill="#6f9a86"/>
<rect x="0" y="300" width="1080" height="1620" fill="url(#w)"/>
<rect x="0" y="300" width="1080" height="46" fill="#7bd36b"/>
<g fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".55">
<path d="M80 520 q40 -24 80 0 t80 0"/><path d="M760 470 q40 -24 80 0 t80 0"/><path d="M120 760 q40 -24 80 0 t80 0"/><path d="M800 700 q40 -24 80 0 t80 0"/>
<path d="M60 900 q40 -24 80 0 t80 0"/><path d="M820 940 q40 -24 80 0 t80 0"/><path d="M420 600 q40 -24 80 0 t80 0"/></g>
<path d="M0 1010 Q270 960 540 1000 T1080 990 L1080 1920 L0 1920Z" fill="#7bd36b"/><path d="M0 1010 Q270 960 540 1000 T1080 990" fill="none" stroke="{INK}" stroke-width="10"/>
<g transform="translate(110 1000)"><path d="M0 0 q-6 -60 0 -90" stroke="#3f9c52" stroke-width="12" fill="none"/><ellipse cx="0" cy="-100" rx="16" ry="26" fill="#a0522d" stroke="{INK}" stroke-width="5"/></g>
<g transform="translate(950 990)"><path d="M0 0 q6 -60 0 -80" stroke="#3f9c52" stroke-width="12" fill="none"/><ellipse cx="0" cy="-92" rx="16" ry="26" fill="#a0522d" stroke="{INK}" stroke-width="5"/></g>''')

# ---------- 10 站大地圖 ----------
def catmull(pts):
    d = f'M{pts[0][0]:.1f} {pts[0][1]:.1f}'
    for i in range(len(pts) - 1):
        p0 = pts[max(0, i-1)]; p1 = pts[i]; p2 = pts[i+1]; p3 = pts[min(len(pts)-1, i+2)]
        c1 = (p1[0] + (p2[0]-p0[0]) / 6, p1[1] + (p2[1]-p0[1]) / 6); c2 = (p2[0] - (p3[0]-p1[0]) / 6, p2[1] - (p3[1]-p1[1]) / 6)
        d += f' C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}'
    return d

def map10():
    W, H = 900, 1600
    pts = [(x * W / 100, y * H / 100) for x, y in MAP_POS]
    road = catmull(pts)
    def tree(x, y, s=1, c='#4aa85a'):
        return f'<g transform="translate({x} {y}) scale({s})"><rect x="-6" y="0" width="12" height="30" fill="#8a5a2b" {ST5}/><circle cx="0" cy="-8" r="26" fill="{c}" {ST5}/></g>'
    def mtn(x, y, w, h, c, snow=False):
        w *= .68; h *= .68
        s = f'<path d="M{x} {y} L{x+w*.5} {y-h} L{x+w} {y}Z" fill="{c}" {ST}/>'
        if snow: s += f'<path d="M{x+w*.38} {y-h*.62} L{x+w*.5} {y-h} L{x+w*.62} {y-h*.62} Q{x+w*.5} {y-h*.5} {x+w*.38} {y-h*.62}Z" fill="#fff" {ST5}/>'
        return s
    def px(i, dx=0, dy=0): return pts[i][0] + dx, pts[i][1] + dy
    deco = ''
    # 1 花果山：圓山＋桃樹
    x, y = px(0, -230, -20); deco += mtn(x, y, 260, 200, '#6fbf6a') + tree(*px(0, 170, 10), 1.2, '#ffb3c6') + tree(*px(0, 250, -40), 1, '#ff9fb2')
    # 2 五指山：五座小山峰
    x, y = px(1, -330, 20)
    for k in range(5): deco += mtn(x + k * 46, y + (k % 2) * -10, 70, 120 + (k == 2) * 50, '#9aa7a0')
    # 3 鷹愁澗：兩壁懸崖＋河
    deco += mtn(*px(2, 110, 20), 200, 170, '#8fa8b8') + mtn(*px(2, -330, 10), 190, 130, '#8fa8b8')
    deco += f'<path d="M{pts[2][0]-130:.0f} {pts[2][1]+40:.0f} q60 -30 120 0 t120 0" fill="none" stroke="#7fd2f4" stroke-width="26" stroke-linecap="round" opacity=".9"/>'
    # 4 高老莊：小房子＋菜園
    for dx in (-300, -230, 150):
        x, y = px(3, dx, 10); deco += f'<rect x="{x}" y="{y}" width="60" height="44" fill="#fff0c9" {ST5}/><path d="M{x-8} {y} L{x+30} {y-34} L{x+68} {y}Z" fill="#d8392b" {ST5}/>'
    # 5 流沙河：黃沙＋波浪
    x, y = px(4, -400, -40); deco += f'<ellipse cx="{x+150}" cy="{y+70}" rx="170" ry="60" fill="#f3d48a" stroke="{INK}" stroke-width="6"/>'
    deco += ''.join(f'<path d="M{pts[4][0]+100:.0f} {pts[4][1]+dy:.0f} q30 -18 60 0 t60 0" fill="none" stroke="#bfa05a" stroke-width="8" stroke-linecap="round"/>' for dy in (-30, 10, 50))
    # 6 五莊觀：人參果樹＋小廟
    deco += tree(*px(5, -220, -20), 1.6, '#5fcf6b') + tree(*px(5, -170, 10), 1.2, '#46b85a')
    x, y = px(5, 150, -10); deco += f'<rect x="{x}" y="{y}" width="130" height="70" fill="#fff0c9" {ST5}/><path d="M{x-16} {y} L{x+65} {y-52} L{x+146} {y}Z" fill="#c0392b" {ST5}/>'
    # 7 白虎嶺：灰岩石山＋小骨頭
    deco += mtn(*px(6, -360, 30), 230, 210, '#8c8c96') + mtn(*px(6, 120, 30), 200, 160, '#a0a0aa')
    # 8 號山：紅山
    deco += mtn(*px(7, -330, 30), 250, 220, '#d8644a') + mtn(*px(7, 90, 20), 190, 150, '#e07b5a')
    # 9 火焰山：火焰
    for k, dx in enumerate((-300, -240, 160, 230)):
        x, y = px(8, dx, 30); deco += f'<path d="M{x} {y} q-24 -50 4 -90 q6 28 22 30 q-4 -34 22 -64 q30 60 -4 124Z" fill="{"#ff8a3d" if k%2 else "#ffb02e"}" {ST5}/>'
    # 10 雷音寺：金頂寺＋雲
    x, y = px(9, -300, 30); deco += f'<rect x="{x}" y="{y-20}" width="170" height="86" fill="#fff0c9" {ST5}/><path d="M{x-22} {y-20} L{x+85} {y-100} L{x+192} {y-20}Z" fill="#ffd34d" {ST}/><rect x="{x+68}" y="{y+16}" width="34" height="50" fill="#c0392b" {ST5}/>'
    clouds = ''.join(f'<g transform="translate({cx} {cy})" opacity=".95"><ellipse rx="70" ry="26" fill="#fff"/><ellipse cx="-34" cy="-14" rx="32" ry="24" fill="#fff"/><ellipse cx="28" cy="-18" rx="38" ry="28" fill="#fff"/></g>' for cx, cy in ((120, 120), (760, 190), (230, 520), (780, 700), (110, 1000), (790, 1210)))
    body = f'''
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe8ff"/><stop offset=".3" stop-color="#e5f6ff"/><stop offset=".45" stop-color="#d6f0b8"/><stop offset="1" stop-color="#8fd072"/></linearGradient></defs>
<rect width="{W}" height="{H}" fill="url(#g)"/>
{clouds}
{deco}
<path d="{road}" fill="none" stroke="{INK}" stroke-width="64" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
<path d="{road}" fill="none" stroke="#f6e3b0" stroke-width="50" stroke-linecap="round" stroke-linejoin="round"/>
<path d="{road}" fill="none" stroke="#e1b86a" stroke-width="6" stroke-dasharray="4 22" stroke-linecap="round"/>'''
    return svg(W, H, body, 'preserveAspectRatio="none"')

# ---------- 輸出 ----------
def main():
    jobs = []  # (檔名, svg, 格式)
    for f in ('normal', 'laugh', 'cheeky', 'tame'): jobs.append((f'water-{f}.png', water(f)))
    jobs += [('lotus.png', LOTUS), ('island.png', ISLAND), ('baima.png', BAIMA),
             ('map/wukong-staff.png', WUKONG_STAFF), ('map/tangseng-follow.png', TANG_FOLLOW), ('map/tangseng-baima.png', TANG_BAIMA),
             ('stamp-level3.png', stamp('鷹愁澗')), ('sticker-level3.png', STICKER), ('map/station-3.png', STATION3),
             ('bg-yingchou.jpg', bg_teach()), ('bg-yingchou-battle.jpg', bg_battle())]
    for i, (k, w, c) in enumerate([('d', '大象', 0), ('t', '兔子', 1), ('n', '牛奶', 2), ('l', '老虎', 3)]):
        jobs.append((f'memory-{k}.png', card(w, PASTEL[c])))
    exs = [('大象', 0), ('蛋糕', 0), ('兔子', 1), ('太陽', 1), ('牛奶', 2), ('小鳥', 2), ('老虎', 3), ('蘿蔔', 3)]
    for w, c in exs: jobs.append((f'ex-{w}.png', card(w, PASTEL[c])))
    for ch in '大兔梨拿泥路': jobs.append((f'blend-{ch}.png', card(ch, PASTEL[(ord(ch)) % 4])))
    (IMG / 'map-10.svg').write_text(map10(), encoding='utf-8')
    with sync_playwright() as p:
        b = p.chromium.launch()
        for name, s, *_ in jobs:
            m = [int(v) for v in __import__('re').search(r'viewBox="0 0 (\d+) (\d+)"', s).groups()]
            pg = b.new_page(viewport={'width': m[0], 'height': m[1]})
            pg.set_content(f'<html><body style="margin:0;background:transparent">{s}</body></html>')
            out = IMG / name; out.parent.mkdir(parents=True, exist_ok=True)
            if name.endswith('.jpg'): pg.screenshot(path=str(out), type='jpeg', quality=88)
            else: pg.screenshot(path=str(out), omit_background=True)
            pg.close(); print('✓', name)
        b.close()

if __name__ == '__main__':
    main()
