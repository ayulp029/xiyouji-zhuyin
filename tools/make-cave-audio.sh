#!/bin/bash
# 水簾洞專用音檔：裁頭尾靜音（留 30ms）+ atempo（保持音高）→ audio/cave/<key>.mp3
# 單音與詞可設不同速度。
# 用法：
#   tools/make-cave-audio.sh [SYM_ATEMPO=1.8] [WORD_ATEMPO=1.0] [key...]
#   或環境變數 SYM_ATEMPO / WORD_ATEMPO。沒列出 key 時處理 CARDS 全部單音與詞。
# 目前進版：單音與其他詞仍是舊的 atempo 1.8 檔；
#   飛機、車子、獅子、熱狗、傘、雨傘、燈 的詞音用 WORD_ATEMPO=1.0（只裁靜音、不加速）。
# 車子／獅子的第 2 關根目錄 audio/<詞>.mp3 仍是舊檔，這兩個 cave 詞音來源是
#   audio/voice-test/A-<詞>.mp3（試聽頁 A，Freddy 採用的版本）。
# 飛機自 v1.4.9-test 起，根目錄已改為同一 A 檔（並做響度對齊），cave 直接從 audio/飛機.mp3 產生。
set -euo pipefail
cd "$(dirname "$0")/.." || exit 1

SYM_T=${SYM_ATEMPO:-1.8}
WORD_T=${WORD_ATEMPO:-1.0}
KEYS=()
nums=()
for arg in "$@"; do
  if [[ $arg =~ ^[0-9]+([.][0-9]+)?$ ]] && [ ${#KEYS[@]} -eq 0 ]; then
    nums+=("$arg")
  else
    KEYS+=("$arg")
  fi
done
if [ ${#nums[@]} -ge 1 ]; then SYM_T=${nums[0]}; fi
if [ ${#nums[@]} -ge 2 ]; then WORD_T=${nums[1]}; fi

mkdir -p audio/cave
mapfile -t ALL_S < <(node -e "const vm=require('vm');const x={};vm.createContext(x);vm.runInContext(require('fs').readFileSync('data.js','utf8')+';this.C=CARDS',x);console.log(x.C.map(c=>c.s).join('\\n'))")
mapfile -t ALL_W < <(node -e "const vm=require('vm');const x={};vm.createContext(x);vm.runInContext(require('fs').readFileSync('data.js','utf8')+';this.C=CARDS',x);console.log(x.C.map(c=>c.w).join('\\n'))")

is_word() { local k="$1"; local w; for w in "${ALL_W[@]}"; do [ "$w" = "$k" ] && return 0; done; return 1; }
is_sym()  { local k="$1"; local s; for s in "${ALL_S[@]}"; do [ "$s" = "$k" ] && return 0; done; return 1; }

word_src() {
  case "$1" in
    車子|獅子) echo "audio/voice-test/A-$1.mp3" ;;
    *) echo "audio/$1.mp3" ;;
  esac
}
sym_src() { echo "audio/$1.mp3"; }

TH=-42dB
mkfilter() {
  local t="$1"
  local af="silenceremove=start_periods=1:start_threshold=$TH:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=$TH:start_silence=0.03,areverse"
  if [ "$t" != "1" ] && [ "$t" != "1.0" ] && [ "$t" != "1.00" ]; then
    af="$af,atempo=$t"
  fi
  printf '%s' "$af"
}

if [ ${#KEYS[@]} -eq 0 ]; then
  KEYS=("${ALL_S[@]}" "${ALL_W[@]}")
fi

echo "SYM_ATEMPO=$SYM_T  WORD_ATEMPO=$WORD_T  keys=${KEYS[*]}"
for k in "${KEYS[@]}"; do
  if is_word "$k"; then
    src=$(word_src "$k"); t=$WORD_T
  elif is_sym "$k"; then
    src=$(sym_src "$k"); t=$SYM_T
  else
    echo "UNKNOWN $k"; continue
  fi
  if [ ! -f "$src" ]; then echo "MISSING $k ($src)"; continue; fi
  af=$(mkfilter "$t")
  echo "  $k  src=$src  atempo=$t"
  ffmpeg -v error -y -i "$src" -af "$af" -ar 44100 -ac 1 -b:a 64k "audio/cave/$k.mp3"
done
