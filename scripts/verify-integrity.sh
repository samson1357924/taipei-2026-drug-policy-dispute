#!/usr/bin/env bash
# 檢查 repo 完整性：檔案存在性、數量、大小合理範圍、開源規範與數據一致性
# 用法：./scripts/verify-integrity.sh

set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

export LC_ALL=C.UTF-8 2>/dev/null || export LC_ALL=C

FAIL=0
pass() { printf '  \033[32m✓\033[0m %s\n' "$1"; }
fail() { printf '  \033[31m✗\033[0m %s\n' "$1"; FAIL=1; }

echo "── 1. 必要檔案存在性 ──"
REQUIRED=(
  "LICENSE"
  "CONTRIBUTING.md"
  "README.md"
  "index.html"
  ".nojekyll"
  "css/style.css"
  "js/data.js"
  "js/app.js"
  "docs/DISCLAIMER-AND-MISSION.md"
  "docs/00-綜合分析報告.md"
  "docs/01-減害政策工具箱.md"
  "docs/02-時間軸.md"
  "docs/03-來源出處與圖表.md"
  "docs/04-TVBS電視辯論進展.md"
  "sources/SOURCE-REGISTRY.md"
  "sources/primary/D1-D2-一手文獻存檔.md"
  "data/EVIDENCE-MATRIX.md"
  "data/timeline.csv"
)
for f in "${REQUIRED[@]}"; do
  [ -s "$f" ] && pass "$f" || fail "$f 缺失或為空"
done

echo "── 2. 原始調查報告 R1–R7 ──"
RCOUNT=$(find sources/raw-reports -name 'R[1-7]-*.md' 2>/dev/null | wc -l | tr -d ' ')
if [ "$RCOUNT" -eq 7 ]; then
  pass "7 份原始報告齊備"
else
  fail "原始報告僅 $RCOUNT 份（應為 7）"
fi

echo "── 3. 關鍵數據存在性（防止被誤刪）──"
check_pattern() {
  local file="$1" pattern="$2" desc="$3"
  if grep -q "$pattern" "$file" 2>/dev/null; then
    pass "$desc"
  else
    fail "$desc（$file 內未找到 '$pattern'）"
  fi
}
RPT="docs/00-綜合分析報告.md"
check_pattern "$RPT" "8 億 0,193" "公報正確金額（8 億 0,193 萬）"
check_pattern "$RPT" "第 33 條" "正確尿液採驗法源（第 33 條）"
check_pattern "$RPT" "憲判字第 16 號" "正確違憲判決（憲判字第 16 號）"
check_pattern "$RPT" "1155013102" "依托咪酯升第一級發文字號（院臺法字第1155013102號）"
check_pattern "$RPT" "預設／基本檢驗項目均不含依托咪酯" "採尿檢驗項目之精確表述（2026-10-06 已修正）"
check_pattern "$RPT" "S-E20" "已登記分母錯誤（S-E20）"
check_pattern "$RPT" "S-E21" "已正確標註採尿檢驗 X 級條目（S-E21）"
check_pattern "$RPT" "占第二級毒品查獲重量" "依托咪酯占比之分母已更正"
check_pattern "$RPT" "377,004" "金氏紀錄正確基準（377,004）"
check_pattern "sources/SOURCE-REGISTRY.md" "S-E29" "X 級錯誤說法登記完整（S-E01–S-E29）"
check_pattern "data/EVIDENCE-MATRIX.md" "Q14" "待釐清爭議點 Q1–Q14"
check_pattern "docs/02-時間軸.md" "Q8" "時間軸包含爭議點 Q8"
check_pattern "index.html" "disclaimerModal" "前端網頁已配置成立初衷與免責聲明組件"

echo "── 4. CSV 與資料格式防呆 ──"
if grep -q '^,' data/timeline.csv; then
  fail "data/timeline.csv 存在缺失日期的行"
else
  pass "data/timeline.csv 日期格式完整無缺失"
fi

echo "── 5. 交叉一致性：過度絕對表述不得殘留於內文 ──"
# 僅檢查報告內文，排除末章 X 級錯誤判定表（該表會引用錯誤說法原句）
BODY=$(sed -n '1,/^## 十一、/p' "$RPT" 2>/dev/null || true)

if echo "$BODY" | grep -q "未刪未改"; then
  fail "報告內文殘留全稱斷言「未刪未改」（應使用「查無刪改或更正紀錄」）"
else
  pass "報告內文無「未刪未改」全稱斷言"
fi

if echo "$BODY" | grep -qE "殷瑋（醫師|殷瑋.*醫師身分"; then
  fail "報告內文誤植殷瑋身分（應為陳菁徽醫師）"
else
  pass "無殷瑋醫師身分誤植"
fi

if echo "$BODY" | grep -q "現行採尿並不檢測依托咪酯"; then
  fail "報告內文殘留過度絕對表述「現行採尿並不檢測依托咪酯」且未標明為錯誤"
else
  pass "報告內文無殘留過度絕對表述"
fi

if echo "$BODY" | grep -q "占查獲重量 28.35%"; then
  fail "報告內文仍出現未標明分母之「占查獲重量 28.35%」"
else
  pass "依托咪酯占比已標明分母（占第二級毒品）"
fi

if grep -rq "8 億 193 萬" docs/ data/ sources/SOURCE-REGISTRY.md sources/primary/ 2>/dev/null; then
  if echo "$BODY" | grep -q "8 億 193 萬"; then
    fail "主報告出現錯誤金額「8 億 193 萬」（應為 8 億 0,193 萬）"
  else
    pass "錯誤金額僅存在於 X 級錯誤清單（已標明為錯誤）"
  fi
else
  pass "未發現錯誤金額"
fi

echo "── 6. 報告規模 ──"
BYTES=$(wc -c < "$RPT" | tr -d ' ')
if [ "$BYTES" -gt 30000 ]; then
  pass "主報告 ${BYTES} bytes（內容完整）"
else
  fail "主報告僅 ${BYTES} bytes（可能遭截斷）"
fi

echo "── 7. 聯動 Python 數據與統計驗算 ──"
if command -v python3 >/dev/null 2>&1; then
  if python3 scripts/verify-calculations.py >/dev/null 2>&1; then
    pass "Python 數據與流行病學自動化驗算（29項）全數通過"
  else
    fail "Python 數據驗算未通過"
  fi
else
  fail "未找到 python3"
fi

echo "── 8. 正體中文與文號門禁 ──"
# 簡繁門禁：主報告若殘留簡體字（监督／约／危机）即 fail
# 歷史 review 引用排除：本檢查僅針對 docs/00，review/ 目錄不在檢查範圍內
# （若擴大為全 repo 遞迴檢查，須加 --exclude-dir=review）
_SIMPLIFIED_HIT=0
for _pat in "监督" "约" "危机"; do
  if grep -q "$_pat" docs/00-綜合分析報告.md 2>/dev/null; then
    fail "主報告殘留簡體字「$_pat」（應為正體中文）"
    _SIMPLIFIED_HIT=1
  fi
done
[ "$_SIMPLIFIED_HIT" -eq 0 ] && pass "主報告無簡體字殘留（监督／约／危机）"
# README 文號門禁：舊文號 1131031302 若殘留即 fail（正確為 1131031622）
if grep -q "1131031302" README.md 2>/dev/null; then
  fail "README 殘留舊文號 1131031302（應為 1131031622）"
else
  pass "README 無舊文號殘留（1131031302）"
fi

echo "── 9. git 狀態 ──"
if git rev-parse --git-dir >/dev/null 2>&1; then
  UNCOMMITTED=$(git status --porcelain | wc -l | tr -d ' ')
  if [ "$UNCOMMITTED" -eq 0 ]; then
    pass "工作區乾淨（已全部 commit）"
  else
    printf '  \033[33m!\033[0m 有 %s 個未 commit 的變更\n' "$UNCOMMITTED"
  fi
else
  fail "非 git repo"
fi

echo
if [ "$FAIL" -eq 0 ]; then
  printf '\033[32m✓ 完整性檢查通過\033[0m\n'
else
  printf '\033[31m✗ 完整性檢查失敗\033[0m\n'
fi
exit $FAIL
