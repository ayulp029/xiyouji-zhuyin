"""單檔檢查與評分：PASS / SUSPECT / FAIL / SKIP + reasons[]"""
import json
from pathlib import Path
import numpy as np
from .audio import load_audio
from .pinyin_utils import (expected_from_text, expected_from_pinyin_str, text_to_syllables, align)
from . import tones as T

ROOT = Path(__file__).resolve().parent.parent


def load_config(path=None):
    return json.loads(Path(path or ROOT / "data" / "config.json").read_text())


def build_expected(item):
    if item.get("pinyin"):
        return expected_from_pinyin_str(item["pinyin"])
    return expected_from_text(item["text"])


def _han_times(r):
    return [c for c in r["chars"] if "一" <= c["char"] <= "鿿"]


def _fmt_exp(e):
    return e.label


def check_item(item, asr_res, cfg, y=None):
    """item: manifest 項目（含 path/text|pinyin/split）。asr_res: {model_key: result}"""
    S = cfg["score"]
    split = item.get("split", "whole")
    if split == "skip_symbol":
        return {"verdict": "SKIP", "reasons": ["注音單音（教育部錄音），ASR 無法判讀，略過"], "detail": {}}
    exp = build_expected(item)
    if not exp:
        return {"verdict": "SKIP", "reasons": ["沒有預期音節"], "detail": {}}
    free = split == "text_only"
    if y is None:
        y = load_audio(item["abs_path"], cfg["asr"]["sample_rate"])
    reasons, detail = [], {"expected": " ".join(_fmt_exp(e) for e in exp), "split": split}
    t, f = T.f0_track(y, cfg["asr"]["sample_rate"])
    voiced = float((f > 0).sum() * 0.01)
    detail["voiced_sec"] = round(voiced, 2)
    detail["duration"] = round(len(y) / cfg["asr"]["sample_rate"], 2)

    alns, scores = {}, {}
    for k, r in asr_res.items():
        hyp = text_to_syllables(r["text"])
        lim = len(exp) * S["hallucination_len_factor"] + 3
        if len(hyp) > lim:
            hyp = hyp[:lim]
            reasons.append(f"{k}：逐字稿疑似重複幻覺（已截斷）")
        a = align(exp, hyp, cfg, free)
        alns[k] = (a, hyp, r)
        scores[k] = a["score"]
        detail[f"asr_{k}"] = {"text": r["text"], "score": round(a["score"], 2),
                              "per": [f"{p[0].label}→{p[1]['pinyin'] if p[1] else '∅'}({p[3]})" for p in a["per"]],
                              "extras": [h["pinyin"] for h in a["extras"]]}

    # ---- 聲調
    tone_res = []
    tcfg = cfg["tone"]
    if len(exp) > tcfg["max_syllables"]:
        detail["tone_skipped"] = f"音節數 {len(exp)} > {tcfg['max_syllables']}，句子內的音節時間不夠準，不判 F0 聲調"
    if alns and tcfg["enabled"] and len(exp) <= tcfg["max_syllables"]:
        bestk = max(scores, key=lambda k: (scores[k], k == "whisper"))
        a, hyp, r = alns[bestk]
        ht = _han_times(r)
        use_ht = len(ht) == len(hyp)
        runs = T.voiced_span(t, f)
        for i, (e, h, cr, kind) in enumerate(a["per"]):
            if e.symbol or e.any_tone:
                tone_res.append({"i": i, "status": "unknown", "why": "符號/輕聲不判"})
                continue
            span = None
            if h is not None and use_ht:
                c = ht[next(j for j, x in enumerate(hyp) if x is h)]
                span = (c["start"], c["end"])
            elif len(exp) == 1 and runs:
                span = (runs[0][0], runs[-1][1])
            elif len(runs) == len(exp):
                span = runs[i]
            if span is None:
                tone_res.append({"i": i, "status": "unknown", "why": "切不出音節時間"})
                continue
            res = T.check_syllable(t, f, span[0] - 0.02, span[1] + 0.02, e.tones, cfg)
            res["i"] = i
            res["syl"] = e.label
            tone_res.append(res)
    detail["tone"] = [{k: (round(v, 2) if isinstance(v, float) else v) for k, v in tr.items() if k != "dists"}
                      for tr in tone_res]

    # ---- 判決
    if voiced < S["silence_voiced_sec_min"] and not split == "skip_symbol":
        reasons.append(f"幾乎無聲（有聲段 {voiced:.2f}s）")
        return {"verdict": "FAIL", "reasons": reasons, "detail": detail}
    states = {}
    for k, sc in scores.items():
        states[k] = "ok" if sc >= S["asr_ok"] else ("bad" if sc < S["asr_bad"] else "mid")
        a = alns[k][0]
        for (e, h, cr, kind) in a["per"]:
            if kind in ("wrong", "missing", "tone_diff", "loose_tone_diff"):
                got = h["pinyin"] if h else "（沒聽到）"
                why = {"tone_diff": "聲調不同", "loose_tone_diff": "聲調不同"}.get(kind, "音節不同")
                reasons.append(f"{k}：預期 {e.label}，聽成 {got}（{why}）")
        if not free and alns[k][0]["extras"]:
            reasons.append(f"{k}：多出音節 {' '.join(h['pinyin'] for h in alns[k][0]['extras'])}")
    ks = list(alns)
    sym_wrong = [{i for i, p in enumerate(alns[k][0]["per"]) if p[0].symbol and p[3] == "wrong"} for k in ks]
    agreed = [i for i in range(len(exp)) if not exp[i].symbol and ks and
              all(alns[k][0]["per"][i][3] in ("wrong", "tone_diff", "loose_tone_diff") for k in ks)]
    n_bad = sum(s == "bad" for s in states.values())
    n_ok = sum(s == "ok" for s in states.values())
    checkable = [tr for tr in tone_res if tr["status"] != "unknown" or tr.get("why") == "F0 抽不到" or tr.get("why") == "切不出音節時間"]
    tb = [tr for tr in tone_res if tr["status"] == "bad"]
    tu = [tr for tr in tone_res if tr["status"] == "unknown" and tr.get("why") in ("F0 抽不到", "切不出音節時間")]
    for tr in tb:
        reasons.append(f"聲調：{tr['syl']} F0 輪廓為「{tr['shape']}」（Δ{tr['delta']}st），與預期 {'/'.join(map(str, sorted(exp[tr['i']].tones)))} 聲不符")
    n_total = len(states)
    if n_total and all(sc < S["asr_fail"] for sc in scores.values()):
        verdict = "FAIL"
    elif sym_wrong and S["symbol_wrong_all_fail"] and set.intersection(*sym_wrong):
        verdict = "FAIL"
        reasons.append("注音符號被唸成別的音，兩家 ASR 一致：" + "、".join(exp[i].label for i in sorted(set.intersection(*sym_wrong))))
    elif n_bad >= 1:
        verdict = "SUSPECT"
    elif n_ok == n_total:
        verdict = "PASS"
        if checkable and len(tb) / len(checkable) >= S["tone_bad_ratio_suspect"]:
            verdict = "SUSPECT"
        elif tu and min(scores.values()) < S["tone_unknown_suspect_if_asr_below"]:
            verdict = "SUSPECT"
            reasons.append("F0 抽不到／切不出音節，聲調沒查，ASR 也不是全對")
    else:
        verdict = "SUSPECT"
        reasons.append("ASR 結果介於可信與不可信之間")
    if verdict == "PASS" and S["symbol_wrong_any_suspect"] and any(sym_wrong):
        verdict = "SUSPECT"
        reasons.append("有一家 ASR 把注音符號聽成別的音（見上）")
    if verdict == "PASS" and S["agreed_error_suspect"] and agreed:
        verdict = "SUSPECT"
        reasons.append("兩家 ASR 在同一音節都聽成不同音／不同調：" + "、".join(exp[i].label for i in agreed))
    if verdict == "PASS" and S["any_asr_error_suspect"]:
        bad_pos = [f"{k}:{p[0].label}" for k in ks for p in alns[k][0]["per"]
                   if not p[0].symbol and p[3] in ("wrong", "missing", "tone_diff", "loose_tone_diff")]
        if bad_pos:
            verdict = "SUSPECT"
            reasons.append("有一家 ASR 在個別音節有不同意見（" + "、".join(bad_pos) + "），建議聽一下")
    if verdict == "PASS" and not reasons:
        reasons.append("兩家 ASR 音節＋聲調吻合" + ("；F0 聲調相符" if checkable and not tb else ""))
    return {"verdict": verdict, "reasons": reasons, "detail": detail}


# ---- 之後「同一句生成 N 個候選再自動挑」的 hook（現在不呼叫 ElevenLabs）----
def rank_candidates(candidate_paths, item, run_asr, cfg):
    """candidate_paths: 同一句的 N 個音檔；run_asr(paths)->{path:{model:res}}。
    回傳依 (verdict 等級, asr 分數) 排序的 [(path, result)]，第一個即建議採用。
    僅離線分析已存在的檔案；不產生音檔。"""
    order = {"PASS": 0, "SUSPECT": 1, "FAIL": 2, "SKIP": 3}
    asr = run_asr(candidate_paths)
    out = []
    for p in candidate_paths:
        it = dict(item, abs_path=p)
        r = check_item(it, asr[p], cfg)
        sc = np.mean([float(v["score"]) for k, v in r["detail"].items() if k.startswith("asr_")] or [0])
        out.append((p, r, sc))
    out.sort(key=lambda x: (order[x[1]["verdict"]], -x[2]))
    return [(p, r) for p, r, _ in out]
