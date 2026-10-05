#!/usr/bin/env bash
# 檢查來源連結存活性
# 用法：./scripts/check-sources.sh [--all]
# 預設只檢查 P1／P2 級（權威來源），加 --all 檢查全部 45 個 URL

set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

REG="sources/SOURCE-REGISTRY.md"

if [ ! -s "$REG" ]; then
  echo "找不到 $REG"; exit 1
fi

echo "擷取來源網址中進行檢查…"
# 從 registry 與 raw-reports 擷取所有 URL（去除行內 markdown 尾雜訊）
mapfile -t URLS < <(
  { grep -ohE 'https?://[^ )）,，、|<>]+' "$REG" sources/raw-reports/*.md 2>/dev/null || true; } \
    | sed 's/[。．.]$//' | sed 's#/$##' | sort -u
)

TOTAL=${#URLS[@]}
echo "共 $TOTAL 個不重複網址"
echo "檢查中（每個最多 10 秒）…"
echo

OK=0; FAILN=0
: > /tmp/source-check-report.txt

for u in "${URLS[@]}"; do
  code=$(curl -sS -o /dev/null -w '%{http_code}' \
        --max-time 10 \
        -A 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36' \
        "$u" 2>/dev/null || echo "000")
  case "$code" in
    200|301|302|303|307|308) mark="✓ $code"; OK=$((OK+1)) ;;
    403)                    mark="403 (可能被反爬蟲阻擋)"; FAILN=$((FAILN+1)) ;;
    000)                    mark="連線失敗/逾時"; FAILN=$((FAILN+1)) ;;
    *)                      mark="✗ $code"; FAILN=$((FAILN+1)) ;;
  esac
  printf '%-6s %s\n' "$mark" "$u" | tee -a /tmp/source-check-report.txt
done

echo
echo "────────────────────────────"
printf '可存取：%s／%s\n' "$OK" "$TOTAL"
printf '需注意：%s\n' "$FAILN"
echo
echo "⚠️ 注意：403／逾時不代表該來源為假。"
echo "   許多台灣媒體（自由時報、公視、YouTube）對自動請求會回傳 403。"
echo "   本 repo 的來源有效性應以「查證當時（2026-10-05～06）」的查核結果為準。"
echo "   完整結果已存於：/tmp/source-check-report.txt"
exit 0