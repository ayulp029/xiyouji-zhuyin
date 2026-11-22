"""拼音正規化、預期音節、對齊。只比「音節＋聲調」，不比漢字。"""
import re
from pypinyin import lazy_pinyin, Style

INITIALS = ["zh", "ch", "sh", "b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h",
            "j", "q", "x", "r", "z", "c", "s"]
# 台灣華語常見混用：捲舌≈平舌、r≈l、n≈l、in≈ing、en≈eng
LOOSE_INIT = {"zh": "z", "ch": "c", "sh": "s", "r": "l", "n": "l"}
LOOSE_FINAL = {"ing": "in", "eng": "en", "iong": "iong"}

# 台灣標準讀音與 pypinyin 預設（大陸）不同、常見於本專案的字
TW_READINGS = {"髮": ["fa3", "fa4"], "期": ["qi1", "qi2"], "擊": ["ji1", "ji2"], "角": ["jiao3", "jue2"]}
# 輕聲／聲調任意的虛字（預期端）
# 台灣讀音／常見讀法的替代音節（預期端額外接受）
ALT_SYLL = {"佛": ["fo2", "fu2"], "喔": ["o1", "wo1"], "哦": ["o2", "wo1"], "髮": ["fa3", "fa4"]}
# ASR 無法分辨的同音異調字（疑問詞「哪/那」）：預期端放寬聲調
ALT_TONES = {"哪": {3, 4}}
NEUTRAL_ANY = set("的了嗎呢吧麼么們個呀啊")  # 喔／哦在本遊戲是詞（喔喔叫），不當作輕聲虛字
SYMBOLS = {  # 注音符號：只比聲母（或韻母），不比聲調
    "ㄅ": {"initial": "b"}, "ㄆ": {"initial": "p"}, "ㄇ": {"initial": "m"}, "ㄈ": {"initial": "f"},
    "ㄚ": {"initial": "", "finals": ["a"]}, "ㄛ": {"initial": "", "finals": ["o", "uo", "ou"]},
    "ㄨ": {"initial": "", "finals": ["u"]}, "ㄧ": {"initial": "", "finals": ["i"]},
}

_Y = {"yi": "i", "ya": "ia", "ye": "ie", "yao": "iao", "you": "iou", "yan": "ian", "yin": "in",
      "yang": "iang", "ying": "ing", "yong": "iong", "wu": "u", "wa": "ua", "wo": "uo", "wai": "uai",
      "wei": "uei", "wan": "uan", "wen": "uen", "wang": "uang", "weng": "ueng", "yu": "ü",
      "yue": "üe", "yuan": "üan", "yun": "ün"}


def split_syllable(s):
    """'san3' -> (initial, final, tone)。無調號視為 5。"""
    s = s.lower().replace("u:", "ü").replace("v", "ü")
    m = re.match(r"^([a-zü]+?)([1-5])?$", s)
    if not m:
        return None
    body, tone = m.group(1), int(m.group(2) or 5)
    if body in _Y:
        return "", _Y[body], tone
    ini = ""
    for i in INITIALS:
        if body.startswith(i) and len(body) > len(i):
            ini = i
            break
    fin = body[len(ini):]
    if ini in ("j", "q", "x") and fin.startswith("u"):
        fin = "ü" + fin[1:]
    if fin == "i" and ini in ("zh", "ch", "sh", "r", "z", "c", "s"):
        fin = "-i"
    return ini, fin, tone


def loosen(ini, fin):
    return LOOSE_INIT.get(ini, ini), LOOSE_FINAL.get(fin, fin)


class Exp:
    """預期音節：可接受的 (聲母, 韻母) 組合 + 可接受聲調集合。"""
    def __init__(self, label, alts, tones, symbol=False, any_tone=False, init_only=None):
        self.label, self.alts, self.tones = label, alts, set(tones)
        self.symbol, self.any_tone, self.init_only = symbol, any_tone, init_only

    def __repr__(self):
        return f"Exp({self.label},{sorted(self.tones) if not self.any_tone else '*'})"


def exp_from_pinyin(p, tones=None, any_tone=False):
    ini, fin, t = split_syllable(p)
    alts = [(ini, fin)]
    if ini == "" and fin in ("o", "uo"):
        alts = [("", "o"), ("", "uo")]
    return Exp(p, alts, tones or [t], any_tone=any_tone or t == 5)


def expected_from_text(text, tone_override=None):
    """漢字／注音符號 → [Exp]。含：3-3 變調、一／不、輕聲虛字。
    非漢字、標點略過；注音符號變成 symbol。"""
    items = []  # (char, kind)
    for ch in text:
        if ch in SYMBOLS:
            items.append((ch, "sym"))
        elif "一" <= ch <= "鿿":
            items.append((ch, "han"))
    # 以「漢字連續段」整段轉拼音，取得語境讀音
    hanstr = "".join(c for c, k in items if k == "han")
    py = lazy_pinyin(hanstr, style=Style.TONE3, neutral_tone_with_five=True)
    out, hi = [], 0
    for ch, kind in items:
        if kind == "sym":
            s = SYMBOLS[ch]
            out.append(Exp(ch, [(s["initial"], f) for f in s.get("finals", [None])], [1, 2, 3, 4, 5],
                           symbol=True, any_tone=True))
            continue
        p = py[hi]; hi += 1
        ini, fin, t = split_syllable(p)
        tones = {t}
        if ch in TW_READINGS:
            for q in TW_READINGS[ch]:
                tones.add(split_syllable(q)[2])
        tones |= ALT_TONES.get(ch, set())
        if ch == "一":
            tones |= {1, 2, 4}
        if ch == "不":
            tones |= {2, 4}
        e = Exp(p, [(ini, fin)], tones, any_tone=(t == 5 or ch in NEUTRAL_ANY))
        for q in ALT_SYLL.get(ch, []):
            qi, qf, _ = split_syllable(q)
            if (qi, qf) not in e.alts:
                e.alts.append((qi, qf))
        if ini == "" and fin in ("o", "uo"):
            e.alts = [("", "o"), ("", "uo")]
        out.append(e)
    # 3-3 變調：前一個是 3、後一個（本調）是 3 → 前者也可為 2
    for i in range(len(out) - 1):
        if out[i].tones == {3} or 3 in out[i].tones:
            nxt = out[i + 1]
            if 3 in nxt.tones and not nxt.symbol:
                out[i].tones.add(2)
    if tone_override:
        for i, ts in tone_override.items():
            out[int(i)].tones = set(ts)
    return out


def expected_from_pinyin_str(s):
    """'yu3 san3|yu2 san3' 不支援；簡單：'fei1 ji1 che1 zi5'；變調用 yu3/2 表示可為 3 或 2。"""
    out = []
    for tok in s.split():
        if "/" in tok:
            base, extra = tok.split("/", 1)
            e = exp_from_pinyin(base)
            e.tones |= {int(c) for c in extra}
        else:
            e = exp_from_pinyin(tok)
        out.append(e)
    return out


DIGITS = dict(zip("0123456789", "零一二三四五六七八九"))
ENGLISH = {"oh": "哦", "ah": "啊", "eight": "八", "three": "三", "one": "一", "two": "二", "four": "四",
           "five": "五", "six": "六", "seven": "七", "nine": "九", "ok": "好"}
_HAN = re.compile(r"[A-Za-z]+|[0-9]|[一-鿿]")


def norm_asr_text(text):
    """阿拉伯數字、常見英文單字（Whisper 常把短音寫成這些）→ 漢字；標點與其餘一律丟掉。"""
    out = []
    for tok in _HAN.findall(text):
        if tok.isdigit():
            out.append(DIGITS[tok])
        elif tok.isascii() and tok.isalpha():
            out.append(ENGLISH.get(tok.lower(), ""))
        else:
            out.append(tok)
    return "".join(out)


def text_to_syllables(text, tw=True):
    """ASR 逐字稿 → [{ini,fin,tone,tones,char,pinyin}]。簡繁、標點、數字、英文先正規化。"""
    han = [c for c in norm_asr_text(text) if "一" <= c <= "鿿"]
    s = "".join(han)
    py = lazy_pinyin(s, style=Style.TONE3, neutral_tone_with_five=True)
    res = []
    for c, p in zip(han, py):
        sp = split_syllable(p)
        if sp is None:
            continue
        tones = {sp[2]}
        if tw and c in TW_READINGS:
            tones |= {split_syllable(q)[2] for q in TW_READINGS[c]}
        res.append({"ini": sp[0], "fin": sp[1], "tone": sp[2], "tones": tones, "char": c, "pinyin": p})
    return res


def credit(e, h, cfg):
    """預期音節 e 與 ASR 音節 h 的得分，回傳 (credit, kind)"""
    C = cfg["credit"]
    if e.symbol:
        ini, fins = e.alts[0][0], [a[1] for a in e.alts]
        if h["ini"] == ini and (fins == [None] or h["fin"] in fins):
            return C["exact"], "exact"
        # ㄅ/ㄆ/ㄇ/ㄈ 的 ASR 幾乎都是「聲母+o/u」；要求聲母相同
        return 0.0, "wrong"
    # ASR 字若詞典本身是輕聲（pypinyin 給 5，如 師傅 fu5），聲調不可考，視為相容
    tone_ok = e.any_tone or (h["tones"] & e.tones) or 5 in h["tones"]
    hi, hf = h["ini"], h["fin"]
    for (ei, ef) in e.alts:
        if (hi, hf) == (ei, ef):
            return (C["exact"], "exact") if tone_ok else (C["tone_diff"], "tone_diff")
    for (ei, ef) in e.alts:
        if loosen(hi, hf) == loosen(ei, ef):
            return (C["loose"], "loose") if tone_ok else (C["loose_tone_diff"], "loose_tone_diff")
    return 0.0, "wrong"


def align(exp, hyp, cfg, free_extra):
    """全域對齊。free_extra=True：ASR 多出的音節不扣分（text_only：注音段會被聽成額外音節）。
    回傳 dict(score, per=[(Exp, h|None, credit, kind)], extras)"""
    m, n = len(exp), len(hyp)
    INF = 1e9
    ins_cost = 0.0 if free_extra else 1.0
    cr = [[credit(exp[i], hyp[j], cfg) for j in range(n)] for i in range(m)]
    D = [[INF] * (n + 1) for _ in range(m + 1)]
    B = [[None] * (n + 1) for _ in range(m + 1)]
    D[0][0] = 0
    for i in range(m + 1):
        for j in range(n + 1):
            d = D[i][j]
            if d >= INF:
                continue
            if i < m and j < n:
                c = d + (1 - cr[i][j][0])
                if c < D[i + 1][j + 1]:
                    D[i + 1][j + 1], B[i + 1][j + 1] = c, ("m", i, j)
            if i < m:
                c = d + 1.0
                if c < D[i + 1][j]:
                    D[i + 1][j], B[i + 1][j] = c, ("d", i, j)
            if j < n:
                c = d + ins_cost
                if c < D[i][j + 1]:
                    D[i][j + 1], B[i][j + 1] = c, ("i", i, j)
    per, i, j, extras = [None] * m, m, n, []
    while (i, j) != (0, 0):
        op, pi, pj = B[i][j]
        if op == "m":
            per[pi] = (exp[pi], hyp[pj], *cr[pi][pj])
        elif op == "d":
            per[pi] = (exp[pi], None, 0.0, "missing")
        else:
            extras.append(hyp[pj])
        i, j = pi, pj
    total = sum(p[2] for p in per)
    denom = m if free_extra else max(m, n)
    return {"score": total / denom if denom else 0.0, "per": per, "extras": extras[::-1]}
