#!/bin/bash
# 將 MP4 動畫轉換為 60fps MP4 及最佳化 GIF。
#
# 用法：
#   ./convert-formats.sh input.mp4 [gif_width] [--minterpolate]
#
# 輸出（緊鄰輸入檔）：
#   <name>-60fps.mp4   （1920x1080，60fps，預設以幀複製方式升頻）
#   <name>.gif         （指定寬度，15fps，色板最佳化）
#
# 參數：
#   --minterpolate     啟用動態補償插幀（高品質，但初始串流在 QuickTime/Safari
#                      有已知相容性問題——僅在播放器支援時使用）
#
# 預設 60fps 模式：使用簡單的 `fps=60` 濾鏡（幀複製）。
# 相容性廣，可在 QuickTime / Safari / Chrome / VLC 播放。60fps
# 標記主要為上傳平台需求；對大多數 CSS 驅動的動畫而言，
# 感知流暢度與來源 25fps 相同。
#
# 何時啟用 --minterpolate：大量平移/縮放動作，需要真正 60fps 插幀時。
# 警告：macOS QuickTime 有時拒絕開啟 minterpolate 輸出。交付前請先測試。
#
# GIF 使用雙遍色板最佳化：
#   遍1：palettegen，stats_mode=diff（針對該影片的最佳色板）
#   遍2：paletteuse，bayer 抖色 + 矩形差分
# 此方式可將 30s/1080p 動畫 GIF 控制在 ~4MB 以內，色彩保真度良好。

set -e

INPUT=""
GIF_WIDTH="960"
USE_MINTERPOLATE=0
for arg in "$@"; do
  case "$arg" in
    --minterpolate) USE_MINTERPOLATE=1 ;;
    --*) echo "未知參數：$arg" >&2; exit 1 ;;
    *)
      if [ -z "$INPUT" ]; then INPUT="$arg"
      else GIF_WIDTH="$arg"
      fi
      ;;
  esac
done
[ -z "$INPUT" ] && { echo "用法：$0 input.mp4 [gif_width] [--minterpolate]" >&2; exit 1; }

DIR=$(dirname "$INPUT")
BASE=$(basename "$INPUT" .mp4)
OUT60="$DIR/$BASE-60fps.mp4"
OUTGIF="$DIR/$BASE.gif"
PAL="$DIR/.palette-$BASE.png"

if [ "$USE_MINTERPOLATE" = "1" ]; then
  echo "▸ 60fps 插幀（minterpolate，高品質）：$OUT60"
  VFILTER="minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"
else
  echo "▸ 60fps 幀複製（相容模式）：$OUT60"
  VFILTER="fps=60"
fi

# -profile:v high -level 4.0 → 廣泛 H.264 相容性（QuickTime、Safari、行動裝置）
# -movflags +faststart        → moov atom 前置，可串流 / 即時播放
ffmpeg -y -loglevel error -i "$INPUT" \
  -vf "$VFILTER" \
  -c:v libx264 -pix_fmt yuv420p -profile:v high -level 4.0 \
  -crf 18 -preset medium -movflags +faststart \
  "$OUT60"
MP4_SIZE=$(du -h "$OUT60" | cut -f1)
echo "  ✓ $MP4_SIZE"

echo "▸ GIF（寬${GIF_WIDTH}px，15fps，色板最佳化）：$OUTGIF"
# 遍1：產生針對該影片最佳化的色板
ffmpeg -y -loglevel error -i "$INPUT" \
  -vf "fps=15,scale=${GIF_WIDTH}:-1:flags=lanczos,palettegen=stats_mode=diff" \
  "$PAL"
# 遍2：套用色板並進行抖色
ffmpeg -y -loglevel error -i "$INPUT" -i "$PAL" \
  -lavfi "fps=15,scale=${GIF_WIDTH}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" \
  "$OUTGIF"
rm -f "$PAL"
GIF_SIZE=$(du -h "$OUTGIF" | cut -f1)
echo "  ✓ $GIF_SIZE"
