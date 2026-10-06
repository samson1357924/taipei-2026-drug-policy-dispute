# 安全性政策 (Security Policy)

## 支援版本 (Supported Versions)

本專案主要維護當前最新版本之靜態站點與文獻數據庫：

| 版本 / 分支 | 支援狀態 |
| :--- | :--- |
| `master` / `main` | :white_check_mark: 支援安全更新與勘誤 |
| 歷史標籤 (Tags) | :x: 僅作歷史查核存檔 |

---

## 報告安全漏洞 (Reporting a Vulnerability)

我們非常重視專案的安全性與使用者隱私。若您發現任何潛在的安全漏洞、XSS 跨站腳本攻擊隱患、不當依賴性問題、或涉及不當洩漏個人隱私（PII）之情事：

1. **請勿公開發布**：請勿直接在公開的 GitHub Issue 中揭露潛在安全漏洞。
2. **通報方式**：
   - 請透過 GitHub 的 [Security Advisory 功能 (Report a vulnerability)](https://github.com/samson1357924/taipei-2026-drug-policy-dispute/security/advisories/new) 進行私密通報。
   - 若無法使用該功能，請聯繫專案發起人/維護者。
3. **處理時程承諾**：
   - 我們將在 **48 小時內** 確認收到您的通報。
   - 在 **7 天內** 評估影響範圍並提出緩解或修補方案。
   - 修復完成後，我們將公開致謝並於 Release Note 中說明（若通報者同意）。

---

## 安全設計原則 (Security by Design)

本專案在架構上落實以下安全原則：
1. **純靜態架構 (Static-First)**：無後端資料庫連線、無伺服器端動態執行環境，大幅降低 SQL Injection 與遠端代碼執行（RCE）風險。
2. **最小權限原則 (Principle of Least Privilege)**：GitHub Actions 嚴格配置 `contents: read`，僅在 GitHub Pages 部署時賦予 `pages: write` 與 `id-token: write`。
3. **無追蹤器與無第三方 Cookie**：本專案不植入商業廣告追蹤代碼或第三方分析 Cookie，保障閱覽者的隱私安全。
