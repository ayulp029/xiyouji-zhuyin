# pron-check：發音自動檢查（輔助工具）

給一個詞／句音檔＋「應該怎麼唸」，輸出 PASS / SUSPECT / FAIL / SKIP 與原因。**只是輔助，不能取代人聽。**
本工具只讀音檔，不會改 `audio/`，也不會呼叫 ElevenLabs。

## 安裝（一次）
```bash
cd tools/pron-check
python3 -m venv --system-site-packages .venv      # 系統已有 faster-whisper / numpy / scipy
.venv/bin/pip install torch --index-url https://download.pytorch.org/whl/cpu
.venv/bin/pip install transformers pypinyin praat-parselmouth huggingface_hub
.venv/bin/python -m pron_check.cli prepare-breeze   # 下載 Breeze-ASR-25（約 3GB）並轉成 CT2 int8（約 1.5GB）
.venv/bin/python -m pron_check.cli manifest         # 產生 data/manifest.json，並從 git 取出舊檔到 .cache/gt
```
模型與中間檔都在 `.cache/`（已 gitignore）。Whisper medium 第一次執行會自動下載到 `.cache/whisper` 或沿用 HF 快取。

## 使用
```bash
cd tools/pron-check
# 單一音檔（漢字；ㄅㄆㄇㄈㄚㄛ 會被當注音符號只比聲母/韻母）
.venv/bin/python -m pron_check.cli check ../../audio/髮.mp3 --text 髮
# 或直接給帶調拼音；/2 表示也可念 2 聲（變調），5＝輕聲
.venv/bin/python -m pron_check.cli check some.m4a --pinyin "yu3/2 san3"
# 拼接句（教育部單音＋AI 文本）只查文本段：
.venv/bin/python -m pron_check.cli check ../../audio/哪個是爬的ㄆ？.mp3 --text 哪個是爬的 --split text_only
# 教育部單音檔：--split skip_symbol（回傳 SKIP）

.venv/bin/python -m pron_check.cli calibrate      # 校正集混淆表 → reports/calibration.md
.venv/bin/python -m pron_check.cli level2-new     # 第 2 關 13 則新檔 → reports/level2-new.md
```
ASR 結果依「音檔內容＋模型＋參數」快取在 `.cache/asr/`，重跑與調閾值很快（無快取時 90 檔×2 模型約 10 分鐘，CPU）。

## 結構
- `pron_check/pinyin_utils.py` 預期音節（變調、輕聲、符號）、ASR 逐字稿→帶調拼音、對齊與給分
- `pron_check/asr.py` faster-whisper medium ＋ Breeze-ASR-25（CT2 int8），一次載一個、用完釋出；ffmpeg 解碼，不用 av
- `pron_check/tones.py` parselmouth F0 → 升／降／平輪廓 → 與預期聲調是否相容
- `pron_check/score.py` 判決；`rank_candidates()` 是「同一句 N 個候選自動挑」的 hook（離線排序已存在的檔，不生成）
- `data/config.json` 所有閾值；`data/manifest.json` 校正集＋第 2 關新檔（`pron_check.manifest` 產生）
- `reports/REPORT.md` 原理、校正數字、13 則逐則判決、限制

## 擴充預期音節
`text` 走 pypinyin（語境讀音）＋規則：3-3 變調（前字可 2）、一／不、虛字輕聲不判聲調、
`ALT_SYLL`／`ALT_TONES`（佛 fo/fu、喔 o/wo、髮 fa3/4、哪 na3/4）。個案用 `pinyin` 欄位覆寫。
