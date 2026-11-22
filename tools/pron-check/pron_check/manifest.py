"""產生 data/manifest.json（校正集＋第 2 關新檔）。可重跑。"""
import json, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPO = ROOT.parent.parent
FREDDY = Path("/workspace/claude-work/xiyouji-zhuyin-incoming/freddy-voice")
GT_COMMIT = "6ce9269"

SEVEN = {  # 詞: pinyin（斜線後＝額外可接受聲調；5＝輕聲不判）
    "飛機": "fei1 ji1", "車子": "che1 zi5", "獅子": "shi1 zi5", "熱狗": "re4 gou3",
    "傘": "san3", "雨傘": "yu3/2 san3", "燈": "deng1",
}
FREDDY_FILES = {"deng": ("燈", "deng1"), "regou": ("熱狗", "re4 gou3"),
                "yusan": ("雨傘", "yu3/2 san3"), "san": ("傘", "san3")}
# 第 2 關 12 則（key → (新檔 split, 新檔 expected 文本[只文本段], 舊檔整句 expected 文本)）
L2_FLAGGED = {
    "喔喔": ("whole", "喔喔", "喔喔"),
    "飛機": ("whole", "飛機", "飛機"),
    "ㄅ只有一個小勾勾，ㄆ下面有兩隻交叉的腳。": ("text_only", "只有一個小勾勾下面有兩隻交叉的腳", "ㄅ只有一個小勾勾，ㄆ下面有兩隻交叉的腳。"),
    "哪個是爬的ㄆ？": ("text_only", "哪個是爬的", "哪個是爬的ㄆ？"),
    "再看看，ㄆ有交叉的腳喔": ("text_only", "再看看有交叉的腳喔", "再看看，ㄆ有交叉的腳喔"),
    "八": ("whole", "八", "八"),
    "ㄚㄚㄚ，阿公笑哈哈": ("text_only", "阿公笑哈哈", "ㄚㄚㄚ，阿公笑哈哈"),
    "ㄛㄛㄛ，公雞喔喔叫": ("text_only", "公雞喔喔叫", "ㄛㄛㄛ，公雞喔喔叫"),
    "ㄆㄆㄆ，葡萄一串串": ("text_only", "葡萄一串串", "ㄆㄆㄆ，葡萄一串串"),
    "ㄈㄈㄈ，飛機飛高高": ("text_only", "飛機飛高高", "ㄈㄈㄈ，飛機飛高高"),
    "拼起來是什麼？": ("whole", "拼起來是什麼", "拼起來是什麼？"),
    "要怎麼拼？": ("whole", "要怎麼拼", "要怎麼拼？"),
}
FLAGGED_N = {22, 24, 27, 28, 29, 35, 38, 39, 40, 41, 48, 49}
SKIP_N = {16, 17, 18, 19, 20}


def extract_gt():
    """從 git 取出 v1.4.5-test 舊檔到 .cache/gt（勿 checkout）。"""
    for sub, d in (("bad-root", "audio"), ("bad-cave", "audio/cave")):
        out = ROOT / ".cache" / "gt" / sub
        out.mkdir(parents=True, exist_ok=True)
        for w in SEVEN:
            data = subprocess.run(["git", "-C", str(REPO), "show", f"{GT_COMMIT}:{d}/{w}.mp3"],
                                  check=True, capture_output=True).stdout
            (out / f"{w}.mp3").write_bytes(data)


def build():
    L = []
    def add(**kw):
        L.append(kw)
    for sub in ("bad-root", "bad-cave"):
        for w, py in SEVEN.items():
            add(id=f"{sub}/{w}", set=sub, label="bad", path=f".cache/gt/{sub}/{w}.mp3", text=w, pinyin=py, split="whole")
    for stem, (w, py) in FREDDY_FILES.items():
        add(id=f"good-freddy/{w}", set="good-freddy", label="good", abs_path=str(FREDDY / f"{stem}.m4a"),
            text=w, pinyin=py, split="whole")
    for w in ("飛機", "車子", "獅子"):
        add(id=f"good-A/{w}", set="good-A", label="good", path=f"audio/voice-test/A-{w}.mp3", text=w, pinyin=SEVEN[w], split="whole")
    data = json.loads((REPO / "voice-test-level2.json").read_text())
    for d in data:
        n, key = d["n"], d["key"]
        if key is None or not d["has_file"]:
            continue
        if n in FLAGGED_N:
            sp, newtext, oldtext = L2_FLAGGED[key]
            add(id=f"bad-l2/{n}-{key}", set="bad-l2", label="bad", path=f"audio/voice-test-l2/old/{key}.mp3",
                text=oldtext, split="whole", n=n,
                note="舊檔（Freddy 標過）；整句含注音符號")
            add(id=f"new-l2/{n}-{key}", set="new-l2", label="new", path=f"audio/{key}.mp3", text=newtext, split=sp, n=n)
        elif n in SKIP_N:
            add(id=f"skip/{n}-{key}", set="skip", label="skip", path=f"audio/{key}.mp3", text=key, split="skip_symbol", n=n)
        elif n == 33:
            add(id=f"new-l2/{n}-{key}", set="new-l2", label="new", path=f"audio/{key}.mp3", text="髮", pinyin="fa3/4", split="whole", n=n,
                note="本來就可疑：是否念成「頭髮的髮」")
        else:
            txt = d["text"]
            if n == 65:
                txt = "喔喔叫"
            add(id=f"prob-good/{n}-{key}", set="probably-good-l2", label="probably-good", path=f"audio/{key}.mp3",
                text=txt, split="whole", n=n)
    return L


def main():
    extract_gt()
    L = build()
    for it in L:
        it["abs_path"] = it.get("abs_path") or str((ROOT / it["path"]) if it["path"].startswith(".cache") else (REPO / it["path"]))
        it.pop("path", None)
    p = ROOT / "data" / "manifest.json"
    # 存相對路徑可攜：abs_path 在載入時重建
    for it in L:
        a = Path(it["abs_path"])
        for base, tag in ((ROOT, "@tool/"), (REPO, "@repo/")):
            try:
                it["path"] = tag + str(a.relative_to(base)); break
            except ValueError:
                it["path"] = str(a)
        del it["abs_path"]
    p.write_text(json.dumps(L, ensure_ascii=False, indent=1))
    print(f"manifest: {len(L)} 項 → {p}")


def load(path=None):
    L = json.loads(Path(path or ROOT / "data" / "manifest.json").read_text())
    for it in L:
        p = it["path"]
        it["abs_path"] = str(ROOT / p[6:]) if p.startswith("@tool/") else str(REPO / p[6:]) if p.startswith("@repo/") else p
    return L


if __name__ == "__main__":
    main()
