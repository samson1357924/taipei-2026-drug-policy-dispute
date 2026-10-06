## 變更概述 (Change Summary)
<!-- 請簡明扼要描述本次 Pull Request 的修改目的與核心內容 -->

## 變更類型 (Type of Change)
- [ ] 🔍 事實勘誤 (Fact-check correction)
- [ ] 📚 新增一手事證 / 來源更新 (New evidence / source update)
- [ ] 📊 數據或驗算校正 (Calculation / dataset fix)
- [ ] 💻 前端介面或無障礙改善 (Frontend UI / a11y improvement)
- [ ] 🤖 自動化測試或 CI/CD 流程維護 (CI/CD / automation script)
- [ ] 📝 文檔與說明修正 (Documentation / typo fix)

## 影響之檔案與條目 (Affected Components)
- [ ] 主報告 `docs/00-綜合分析報告.md`
- [ ] 時間軸 `docs/02-時間軸.md` / `data/timeline.csv`
- [ ] 證據矩陣 `data/EVIDENCE-MATRIX.md`
- [ ] 前端數據庫 `js/data.js`
- [ ] 來源表 `sources/SOURCE-REGISTRY.md`
- [ ] 其他：

## 證據等級與佐證來源 (Evidence Verification)
<!-- 若涉及事實或數據修改，請在此列出 P1 / P2 級一手文獻依據 -->
- 來源名稱：
- 來源連結或公報卷期：
- 證據等級（P1 / P2 / P3 / X）：

## 本地驗證檢查清單 (Pre-Submission Checklist)
- [ ] 我已在本地執行 `./scripts/verify-integrity.sh` 且全數通過 (Exit code 0)
- [ ] 我已在本地執行 `python3 scripts/verify-calculations.py` 且 29 項驗算全數通過
- [ ] 若修改涉及核心數據，我已同步更新 `docs/`, `data/`, `sources/`, `js/data.js` 跨檔案一致性
- [ ] 本次 Commit 訊息符合 [Conventional Commits](https://www.conventionalcommits.org/) 規範
- [ ] 我同意遵守本專案的 [行為準則 (CODE_OF_CONDUCT.md)](CODE_OF_CONDUCT.md)
