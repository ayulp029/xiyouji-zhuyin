#!/bin/bash
# 水簾洞專用加速音檔：裁頭尾靜音（留 30ms）+ atempo（保持音高）→ audio/cave/<key>.mp3
# 用法：tools/make-cave-audio.sh [atempo=1.4]  （key 清單取自 data.js 的 CARDS）
cd "$(dirname "$0")/.." || exit 1
T=${1:-1.4}; mkdir -p audio/cave
keys=$(node -e "const vm=require('vm');const x={};vm.createContext(x);vm.runInContext(require('fs').readFileSync('data.js','utf8')+';this.C=CARDS',x);console.log(x.C.flatMap(c=>[c.s,c.w]).join('\\n'))")
TH=-42dB
for k in $keys; do
  [ -f "audio/$k.mp3" ] || { echo "MISSING $k"; continue; }
  ffmpeg -v error -y -i "audio/$k.mp3" -af "silenceremove=start_periods=1:start_threshold=$TH:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=$TH:start_silence=0.03,areverse,atempo=$T" \
    -ar 44100 -ac 1 -b:a 64k "audio/cave/$k.mp3"
done
