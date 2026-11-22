"""用法：python -m pron_check.cli {manifest|prepare-breeze|calibrate|check|level2-new} ..."""
import argparse, json, sys, collections
from pathlib import Path
from . import manifest as M, asr as A
from .audio import load_audio
from .score import load_config, check_item, ROOT


def run_items(items, cfg, models=("whisper", "breeze"), log=print):
    paths = sorted({it["abs_path"] for it in items if it.get("split") != "skip_symbol"})
    per_model = {}
    for k in models:               # 一次只載一個模型
        per_model[k] = A.run_model(k, paths, cfg, prompt=False, log=log) if paths else {}
    results = {}
    for it in items:
        p = it["abs_path"]
        if it.get("split") == "skip_symbol":
            results[it["id"]] = check_item(it, {}, cfg)
            continue
        y = load_audio(p, cfg["asr"]["sample_rate"])
        results[it["id"]] = check_item(it, {k: per_model[k][p] for k in models}, cfg, y)
    return results


def fmt(it, r):
    d = r["detail"]
    a = " | ".join(f"{k[4:]}:「{v['text'][:40]}{'…' if len(v['text']) > 40 else ''}」{v['score']}" for k, v in d.items() if k.startswith("asr_"))
    r = dict(r, reasons=[x[:160] for x in r["reasons"]])
    return f"{r['verdict']:7} {it['id']:42} 預期[{d.get('expected', '')}]  {a}\n          " + "；".join(r["reasons"])


def confusion(items, results):
    groups = {"bad": ["bad-root", "bad-cave", "bad-l2"], "good": ["good-freddy", "good-A"], "probably-good": ["probably-good-l2"]}
    rows = collections.OrderedDict()
    for it in items:
        if it["set"] not in ("bad-root", "bad-cave", "bad-l2", "good-freddy", "good-A", "probably-good-l2"):
            continue
        rows.setdefault(it["set"], collections.Counter())[results[it["id"]]["verdict"]] += 1
    def agg(sets):
        c = collections.Counter()
        for s in sets:
            c.update(rows.get(s, {}))
        return c
    return rows, {g: agg(s) for g, s in groups.items()}


def cmd_calibrate(a):
    cfg = load_config(a.config)
    items = [i for i in M.load() if i["set"] != "new-l2"]
    res = run_items(items, cfg)
    rows, tot = confusion(items, res)
    out = ["# 校正結果（自動產生）\n", "| set | PASS | SUSPECT | FAIL |", "|---|---|---|---|"]
    for s, c in rows.items():
        out.append(f"| {s} | {c['PASS']} | {c['SUSPECT']} | {c['FAIL']} |")
    out += ["", "| 群組 | n | PASS | SUSPECT | FAIL |", "|---|---|---|---|---|"]
    for g, c in tot.items():
        out.append(f"| {g} | {sum(c.values())} | {c['PASS']} | {c['SUSPECT']} | {c['FAIL']} |")
    out.append("\n## 逐則\n")
    for it in items:
        out.append("```\n" + fmt(it, res[it["id"]]) + "\n```")
    txt = "\n".join(out)
    (ROOT / "reports").mkdir(exist_ok=True)
    (ROOT / "reports" / "calibration.md").write_text(txt)
    (ROOT / "reports" / "calibration.json").write_text(json.dumps(
        {i["id"]: res[i["id"]] for i in items}, ensure_ascii=False, indent=1, default=str))
    print(txt if a.verbose else "\n".join(out[:out.index("\n## 逐則\n")]))
    for it in items:
        r = res[it["id"]]
        mark = ""
        if it["label"] == "bad" and r["verdict"] == "PASS": mark = "  <<< 漏抓"
        if it["label"] == "good" and r["verdict"] != "PASS": mark = "  <<< 誤判"
        if mark:
            print(fmt(it, r) + mark)


def cmd_check(a):
    cfg = load_config(a.config)
    it = {"id": a.file, "abs_path": str(Path(a.file).resolve()), "split": a.split, "set": "adhoc"}
    if a.pinyin: it["pinyin"] = a.pinyin
    else: it["text"] = a.text
    r = run_items([it], cfg)[a.file]
    print(fmt(it, r))
    if a.json: print(json.dumps(r, ensure_ascii=False, indent=1, default=str))


def cmd_l2(a):
    cfg = load_config(a.config)
    items = [i for i in M.load() if i["set"] == "new-l2"]
    res = run_items(items, cfg)
    lines = ["# 第 2 關新檔（v1.4.9）判決（自動產生）\n"]
    for it in items:
        lines.append("```\n" + fmt(it, res[it["id"]]) + "\n```")
    txt = "\n".join(lines)
    (ROOT / "reports" / "level2-new.md").write_text(txt)
    (ROOT / "reports" / "level2-new.json").write_text(json.dumps(
        {i["id"]: res[i["id"]] for i in items}, ensure_ascii=False, indent=1, default=str))
    print(txt)


def cmd_breeze(a):
    import subprocess, os
    os.environ["HF_HOME"] = str(ROOT / ".cache" / "hf")
    from huggingface_hub import snapshot_download
    cfg = load_config(a.config)
    snap = snapshot_download(cfg["asr"]["models"]["breeze"]["hf_repo"], allow_patterns=["*.json", "*.txt", "model.safetensors"])
    subprocess.run([sys.executable, "-m", "ctranslate2.converters.transformers", "--model", snap,
                    "--output_dir", str(ROOT / ".cache" / "breeze-ct2-int8"), "--quantization", "int8",
                    "--copy_files", "tokenizer.json", "preprocessor_config.json", "--force"], check=True)


def main():
    ap = argparse.ArgumentParser(prog="pron_check")
    ap.add_argument("--config")
    sp = ap.add_subparsers(dest="cmd", required=True)
    sp.add_parser("manifest").set_defaults(f=lambda a: M.main())
    sp.add_parser("prepare-breeze").set_defaults(f=cmd_breeze)
    c = sp.add_parser("calibrate"); c.add_argument("-v", "--verbose", action="store_true"); c.set_defaults(f=cmd_calibrate)
    k = sp.add_parser("check"); k.add_argument("file")
    k.add_argument("--text", help="預期漢字（注音符號 ㄅㄆㄚㄛㄈ 會當符號比對）")
    k.add_argument("--pinyin", help="預期帶調拼音，如 'yu3/2 san3'（/2 表示也可念 2 聲；5＝輕聲）")
    k.add_argument("--split", default="whole", choices=["whole", "text_only", "skip_symbol"])
    k.add_argument("--json", action="store_true"); k.set_defaults(f=cmd_check)
    sp.add_parser("level2-new").set_defaults(f=cmd_l2)
    a = ap.parse_args()
    a.f(a)


if __name__ == "__main__":
    main()
