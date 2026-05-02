#!/usr/bin/env bash
# 將 BGM 音軌混入 MP4 影片。
#
# 用法：
#   bash add-music.sh <input.mp4> [--mood=<name>] [--music=<path>] [--out=<path>]
#
# 情境曲庫（位於 ../assets/，對應 bgm-<mood>.mp3）：
#   tech              — Apple Silicon / 產品發表會風格，極簡合成器+鋼琴（預設）
#   ad                — 活力現代，清晰鋪墊+drop，社群媒體廣告能量
#   educational       — 溫暖、從容，帶入學習氛圍
#   educational-alt   — educational 的替代版本
#   tutorial          — Lo-fi 背景音，不搶佔旁白聲道
#   tutorial-alt      — tutorial 的替代版本
#
# 參數（均可選）：
#   --mood=<name>     從曲庫選取預設情境（預設：tech）
#   --music=<path>    指定自訂音訊檔（優先於 --mood）
#   --out=<path>      輸出路徑（預設：<input-basename>-bgm.mp4）
#
# 舊版位置參數仍相容：bash add-music.sh in.mp4 music.mp3 out.mp4
#
# 行為：
#   - 音樂裁剪至符合影片時長
#   - 淡入 0.3s，淡出 1.0s（避免硬切）
#   - 影像串流直接複製（不重新編碼），音訊 AAC 192k
#
# 範例：
#   bash add-music.sh my.mp4                              # 預設：tech 情境
#   bash add-music.sh my.mp4 --mood=ad                    # 切換情境
#   bash add-music.sh my.mp4 --mood=educational --out=final.mp4
#   bash add-music.sh my.mp4 --music=~/Downloads/song.mp3 # 使用自訂音樂
#
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ASSETS_DIR="$SCRIPT_DIR/../assets"

# ── 解析參數 ───────────────────────────────────────────────────────
INPUT=""
MOOD="tech"
CUSTOM_MUSIC=""
OUTPUT=""
POSITIONAL=()

for arg in "$@"; do
  case "$arg" in
    --mood=*)  MOOD="${arg#*=}" ;;
    --music=*) CUSTOM_MUSIC="${arg#*=}" ;;
    --out=*)   OUTPUT="${arg#*=}" ;;
    *)         POSITIONAL+=("$arg") ;;
  esac
done

# 舊版位置參數：<input> [music] [output]
INPUT="${POSITIONAL[0]}"
[ -z "$CUSTOM_MUSIC" ] && [ -n "${POSITIONAL[1]}" ] && CUSTOM_MUSIC="${POSITIONAL[1]}"
[ -z "$OUTPUT" ]       && [ -n "${POSITIONAL[2]}" ] && OUTPUT="${POSITIONAL[2]}"

if [ -z "$INPUT" ] || [ ! -f "$INPUT" ]; then
  echo "用法：bash add-music.sh <input.mp4> [--mood=<name>] [--music=<path>] [--out=<path>]" >&2
  echo "可用情境：$(ls "$ASSETS_DIR" | grep -E '^bgm-.*\.mp3$' | sed 's/^bgm-//;s/\.mp3$//' | tr '\n' ' ')" >&2
  exit 1
fi

# ── 確認音樂來源：--music 優先，否則使用 --mood ─────────────────
if [ -n "$CUSTOM_MUSIC" ]; then
  MUSIC="$CUSTOM_MUSIC"
  SOURCE_LABEL="自訂：$MUSIC"
else
  MUSIC="$ASSETS_DIR/bgm-${MOOD}.mp3"
  SOURCE_LABEL="情境：$MOOD"
fi

if [ ! -f "$MUSIC" ]; then
  echo "✗ 找不到音樂檔：$MUSIC" >&2
  echo "  可用情境：$(ls "$ASSETS_DIR" | grep -E '^bgm-.*\.mp3$' | sed 's/^bgm-//;s/\.mp3$//' | tr '\n' ' ')" >&2
  exit 1
fi

# ── 確認輸出路徑 ─────────────────────────────────────────────
INPUT_DIR="$(cd "$(dirname "$INPUT")" && pwd)"
INPUT_NAME="$(basename "$INPUT" .mp4)"
[ -z "$OUTPUT" ] && OUTPUT="$INPUT_DIR/$INPUT_NAME-bgm.mp4"

# ── 量測影片時長，計算淡出起始點 ──────────────────────────────────────────
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$INPUT")
if [ -z "$DURATION" ]; then
  echo "✗ 無法讀取影片時長" >&2
  exit 1
fi
FADE_OUT_START=$(awk "BEGIN { d = $DURATION - 1; if (d < 0) d = 0; print d }")

echo "▸ 混音 BGM 至影片"
echo "  輸入：    $INPUT"
echo "  音樂：    $SOURCE_LABEL"
echo "  時長：    ${DURATION}s"
echo "  輸出：    $OUTPUT"

ffmpeg -y -loglevel error \
  -i "$INPUT" \
  -i "$MUSIC" \
  -filter_complex "[1:a]atrim=0:${DURATION},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.3,afade=t=out:st=${FADE_OUT_START}:d=1[a]" \
  -map 0:v -map "[a]" \
  -c:v copy -c:a aac -b:a 192k -shortest \
  "$OUTPUT"

SIZE=$(du -h "$OUTPUT" | cut -f1)
echo "✓ 完成：$OUTPUT（$SIZE）"
