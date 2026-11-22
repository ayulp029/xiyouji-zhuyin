"""兩家 ASR（faster-whisper medium、Breeze-ASR-25 轉 CT2 int8）。一次只載入一個模型，用完釋出。
結果依「音檔內容＋模型＋參數」快取在 .cache/asr/，校正時改閾值不必重跑。"""
import json, gc
from pathlib import Path
from .audio import load_audio, prep_for_asr, sha

ROOT = Path(__file__).resolve().parent.parent


def _cache_dir():
    d = ROOT / ".cache" / "asr"
    d.mkdir(parents=True, exist_ok=True)
    return d


def load_model(spec):
    from faster_whisper import WhisperModel
    if spec["kind"] == "ct2-dir":
        p = ROOT / spec["path"]
        if not p.exists():
            raise FileNotFoundError(f"{p} 不存在。先跑：python -m pron_check.cli prepare-breeze")
        return WhisperModel(str(p), device="cpu", compute_type=spec["compute_type"], cpu_threads=6)
    return WhisperModel(spec["name"], device="cpu", compute_type=spec["compute_type"], cpu_threads=6,
                        download_root=str(ROOT / ".cache" / "whisper"))


def transcribe(model, y, cfg, prompt=None):
    a = cfg["asr"]
    sr = a["sample_rate"]
    yy, off = prep_for_asr(y, sr, a["pad_sec"], a["peak_normalize"])
    segs, info = model.transcribe(
        yy, language="zh", beam_size=a["beam_size"], initial_prompt=prompt,
        condition_on_previous_text=False, word_timestamps=True, vad_filter=False,
        temperature=[0.0, 0.2, 0.4])
    text, chars = "", []
    for s in segs:
        text += s.text
        for w in (s.words or []):
            cs = [c for c in w.word if c.strip()]
            if not cs:
                continue
            d = (w.end - w.start) / len(cs)
            for k, c in enumerate(cs):
                chars.append({"char": c, "start": max(0.0, w.start - off + k * d), "end": max(0.0, w.start - off + (k + 1) * d)})
    return {"text": text.strip(), "chars": chars}


def run_model(model_key, paths, cfg, prompt=False, log=print):
    """回傳 {path: result}。已有快取的不重算；全有快取就不載入模型。"""
    spec = cfg["asr"]["models"][model_key]
    ptxt = cfg["asr"]["aux_prompt"] if prompt else None
    tag = f"{model_key}-{spec.get('name', 'ct2')}-{'p' if prompt else 'np'}"
    out, todo = {}, []
    ys = {}
    for p in paths:
        y = load_audio(p, cfg["asr"]["sample_rate"])
        ys[p] = y
        f = _cache_dir() / f"{sha(y, tag + str(cfg['asr']['pad_sec']) + str(cfg['asr']['peak_normalize']) + str(cfg['asr']['beam_size']))}.json"
        if f.exists():
            out[p] = json.loads(f.read_text())
        else:
            todo.append((p, f))
    if todo:
        log(f"[asr:{tag}] 載入模型，待辨識 {len(todo)} 檔")
        model = load_model(spec)
        for p, f in todo:
            r = transcribe(model, ys[p], cfg, ptxt)
            f.write_text(json.dumps(r, ensure_ascii=False))
            out[p] = r
        del model
        gc.collect()
    return out
