"""聲調檢查：parselmouth 抽 F0，依輪廓形狀對 4 聲範本。"""
import numpy as np


def f0_track(y, sr):
    import parselmouth
    snd = parselmouth.Sound(y.astype(np.float64), sampling_frequency=sr)
    p = snd.to_pitch_ac(time_step=0.01, pitch_floor=70, pitch_ceiling=600, very_accurate=False)
    f = p.selected_array["frequency"]
    t = p.xs()
    v = f > 0
    if v.sum() >= 10:
        lo, hi = np.percentile(f[v], [10, 90])
        p = snd.to_pitch_ac(time_step=0.01, pitch_floor=max(60, 0.75 * lo), pitch_ceiling=min(700, 1.8 * hi))
        f = p.selected_array["frequency"]
        t = p.xs()
    return t, f


def voiced_span(t, f, min_gap=0.08):
    """有聲連續段 [(t0,t1)]，小於 min_gap 的空隙併起來。"""
    v = np.where(f > 0)[0]
    if len(v) == 0:
        return []
    runs, s, prev = [], v[0], v[0]
    for i in v[1:]:
        if t[i] - t[prev] > min_gap:
            runs.append((t[s], t[prev])); s = i
        prev = i
    runs.append((t[s], t[prev]))
    return runs


def contour(t, f, t0, t1, cfg):
    """區段內有聲點 → 5 點半音輪廓（內插、修剪兩端）。不足回 None。"""
    c = cfg["tone"]
    m = (t >= t0) & (t <= t1) & (f > 0)
    if m.sum() < c["min_voiced_frames"]:
        return None
    tt, ff = t[m], 12 * np.log2(f[m])
    # 去掉八度跳點
    med = np.median(ff)
    keep = np.abs(ff - med) < 7
    tt, ff = tt[keep], ff[keep]
    if len(tt) < c["min_voiced_frames"]:
        return None
    n = len(tt)
    k = int(n * c["trim_frac"])
    tt, ff = tt[k:n - k], ff[k:n - k]
    if len(tt) < 4:
        return None
    pts = np.interp(np.linspace(tt[0], tt[-1], 5), tt, ff)
    return pts


def features(pts):
    start, end = float(pts[:2].mean()), float(pts[3:].mean())
    return {"delta": end - start, "dip": float((start + end) / 2 - pts.min()), "range": float(pts.max() - pts.min())}


def compatible(tone, ft, cfg):
    """該輪廓是否與某聲調「相容」。刻意寬鬆：只抓明顯矛盾
    （1 聲卻大升大降、2 聲卻在降、4 聲卻在升或平、3 聲卻大幅上升）。
    3 聲與 4 聲在單字／降調實現下本來就難分，所以 3 聲接受降與降升。"""
    c = cfg["tone"]
    d = ft["delta"]
    if tone == 1:
        return abs(d) <= c["flat_max_abs_delta_st"]
    if tone == 2:
        return d >= c["rise_min_delta_st"]
    if tone == 3:
        return d <= c["t3_max_delta_st"] or ft["dip"] >= c["t3_dip_min_st"]
    if tone == 4:
        return d <= c["fall_max_delta_st"]
    return True


def check_syllable(t, f, t0, t1, allowed, cfg):
    """allowed: 可接受聲調集合。回傳 dict(status ok|bad|unknown, shape)"""
    pts = contour(t, f, t0, t1, cfg)
    if pts is None:
        return {"status": "unknown", "why": "F0 抽不到"}
    ft = features(pts)
    shape = "升" if ft["delta"] >= cfg["tone"]["rise_min_delta_st"] + 0.5 else ("降" if ft["delta"] <= cfg["tone"]["fall_max_delta_st"] else "平")
    allowed = {a for a in allowed if a in (1, 2, 3, 4)}
    if not allowed:
        return {"status": "unknown", "why": "輕聲，不判"}
    ok = any(compatible(a, ft, cfg) for a in allowed)
    return {"status": "ok" if ok else "bad", "shape": shape, "delta": round(ft["delta"], 1), "dip": round(ft["dip"], 1)}
