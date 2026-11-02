#!/bin/sh
# 美術更新：把 img/incoming/ 的圖同步到 img/（可重複執行，同名檔會被覆蓋）
# 用法：在 v2/ 資料夾執行  sh sync-art.sh
cd "$(dirname "$0")/img" || exit 1
for f in incoming/*.png; do
  n=$(basename "$f")
  case "$n" in
    bg-*.png|map.png) python3 -c "from PIL import Image;import sys;Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2],quality=82)" "$f" "${n%.png}.jpg" ;;
    *) cp "$f" "$n" ;;
  esac
done
echo "done"
