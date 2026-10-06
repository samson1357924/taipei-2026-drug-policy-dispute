# 台北市 2026 毒品政策與減害爭議事實查核平台
# 開源發布、GitHub Pages 部署與維運指南 (Public Release & Operations Guide)

> **版本**：v1.0.0｜**最後更新**：2026-10-06  
> **適用專案**：`taipei-2026-drug-policy-dispute`  
> **維護角色**：DevOps Automator / 公民發起人團隊

---

## 📑 目錄
1. [公開前安全檢查清單 (Pre-Release Checklist)](#1-公開前安全檢查清單-pre-release-checklist)
2. [將 Repository 轉為公開 (Make Repository Public)](#2-將-repository-轉為公開-make-repository-public)
3. [GitHub Pages 部署設定 (GitHub Pages Configuration)](#3-github-pages-部署設定-github-pages-configuration)
4. [自訂網域配置指南 (Custom Domain Setup)](#4-自訂網域配置指南-custom-domain-setup)
5. [權限、Secrets 與環境設定 (Secrets & Permissions)](#5-權限secrets-與環境設定-secrets--permissions)
6. [分支保護與協作策略 (Branch Protection & Git Strategy)](#6-分支保護與協作策略-branch-protection--git-strategy)
7. [版本發行與標籤管理 (Releases & Tagging)](#7-版本發行與標籤管理-releases--tagging)

---

## 1. 公開前安全檢查清單 (Pre-Release Checklist)

在將 Repository 由私有（Private）切換為公開（Public）前，必須執行以下「零洩漏」審查：

- [x] **無任何密鑰或憑證提交**：專案採靜態無伺服器架構，查核無任何 API Key、密碼、私密 Token 或 `.env` 進入 Git 歷史。
- [x] **個資合規（GDPR / 台灣個資法）**：所有引述資料均為公開公報、已公布新聞或當事人公開發言，無任何未成年人受保護身分或非公開隱私資料。
- [x] **開源授權明確**：根目錄已具備 `LICENSE`（代碼採 MIT License，分析文本採 CC BY 4.0 雙授權）。
- [x] **社群協作規範齊備**：根目錄已建立 `CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md` 與 Issue/PR 模板。
- [x] **自動化門禁全數通過**：本地已通過 `./scripts/verify-integrity.sh` 與 `python3 scripts/verify-calculations.py`（29 項驗算 100% 通過）。

---

## 2. 將 Repository 轉為公開 (Make Repository Public)

### 操作步驟：
1. 開啟 GitHub 專案頁面：`https://github.com/samson1357924/taipei-2026-drug-policy-dispute`
2. 點擊頂部導覽列最右側的 **Settings**（設定）。
3. 在左側選單最上方選擇 **General**，滑動頁面至最底部的 **Danger Zone**（危險區）。
4. 找到 **Change repository visibility**，點擊右側的 **Change visibility** 按鈕。
5. 選擇 **Make public**。
6. 在彈出視窗中，系統會提示影響評估，請依指示輸入專案完整名稱 `samson1357924/taipei-2026-drug-policy-dispute`。
7. 點擊 **I understand, make this repository public** 完成切換。

---

## 3. GitHub Pages 部署設定 (GitHub Pages Configuration)

本專案採用現代化 **GitHub Actions 原生部署**（免建立 `gh-pages` 分支，杜絕歷史分支髒污與權限越界）。

### 操作步驟：
1. 進入專案 **Settings** -> 左側選單 **Code and automation** 區塊 -> 點擊 **Pages**。
2. 在 **Build and deployment** 下方的 **Source** 下拉選單中：
   - ⚠️ **務必選擇：「GitHub Actions」**（**不要**選擇 "Deploy from a branch"）。
3. 選擇 GitHub Actions 後，頁面下方會自動辨識到我們已建立的 `.github/workflows/pages.yml`。
4. **觸發第一次部署**：
   - 只要任何 commit 推送至 `master` 分支，GitHub Actions 就會自動啟動部署。
   - 亦可手動前往專案的 **Actions** 分頁 -> 選擇左側 **Deploy Static Content to GitHub Pages** -> 點擊右側 **Run workflow** 手動執行。
5. **部署成功後網址**：
   - 系統將於 1~2 分鐘內部署完成，站點 URL 預設為：  
     👉 **`https://samson1357924.github.io/taipei-2026-drug-policy-dispute/`**
   - 可在 **Settings** -> **Pages** 頂端查看綠色提示：*Your site is live at https://...*

---

## 4. 自訂網域配置指南 (Custom Domain Setup)

若發起人未來欲綁定專用獨立網域（例如 `factcheck.taipei` 或 `drug-policy.tw`）：

### 步驟 A：DNS 供應商設定
- **若使用子網域（如 `factcheck.yourdomain.org`）**：
  - 新增 `CNAME` 記錄：
    - 主機記錄（Name/Host）：`factcheck`
    - 指向位址（Target/Value）：`samson1357924.github.io.`
- **若使用頂級根網域（Apex Domain，如 `yourdomain.org`）**：
  - 新增 4 筆 `A` 記錄，分別指向 GitHub Pages 官方 IP：
    - `185.199.108.153`
    - `185.199.109.153`
    - `185.199.110.153`
    - `185.199.111.153`

### 步驟 B：GitHub 端配置
1. 進入專案 **Settings** -> **Pages** -> **Custom domain**。
2. 輸入自訂網域名稱（例如 `factcheck.yourdomain.org`），點擊 **Save**。
3. 勾選 **Enforce HTTPS**（強制啟用 TLS/SSL 加密連線）。
4. 亦可在 repo 根目錄建立名為 `CNAME` 的純文字檔案，內容寫入該網域名稱以進行版本控管。

---

## 5. 權限、Secrets 與環境設定 (Secrets & Permissions)

### 1. 最小特權原則 (Principle of Least Privilege)
- 進入 **Settings** -> **Actions** -> **General** -> **Workflow permissions**：
  - 建議設定為 **Read repository contents and packages permissions**。
  - 由於 `.github/workflows/pages.yml` 內已明確在 job 層級聲明：
    ```yaml
    permissions:
      contents: read
      pages: write
      id-token: write
    ```
    此配置已精確限縮權限，既保證安全性，又確保 Pages 與 OIDC Token 能順暢簽發。

### 2. GitHub Secrets
- 本專案完全為前端靜態渲染，**不需要任何外部付費服務或私人 Secrets 即可 100% 獨立運行**。
- 若未來需接入通知機制（如部署完成發送 Telegram / Discord Webhook）：
  - 可於 **Settings** -> **Secrets and variables** -> **Actions** -> 點擊 **New repository secret** 加入。

---

## 6. 分支保護與協作策略 (Branch Protection & Git Strategy)

為避免誤刪分支、強制覆寫（Force Push）或未經驗證的變更進入生產分支，建議配置分支保護規則：

### 配置步驟：
1. 進入 **Settings** -> **Branches** -> 點擊 **Add branch protection rule**。
2. **Branch name pattern**：輸入 `master`（若預設分支為 main 則輸入 `main`）。
3. 勾選以下保護機制：
   - [x] **Require a pull request before merging**（要求 PR 合併，防止誤推）
   - [x] **Require status checks to pass before merging**（要求 CI 門禁通過）：
     - 搜尋並勾選 `Integrity & Verification Gates`（來自 `ci.yml`）。
   - [x] **Require conversation resolution before merging**（所有討論必須已結案）
   - [x] **Do not allow bypassing the above settings**（管理員亦需遵守）
4. 點擊 **Save changes**。

### Git Commit 訊息規範
專案團隊應持續遵循 Conventional Commits 規範：
- `feat`: 新增功能與視角維度
- `fix`: 勘誤數據或文本
- `docs`: 文檔更新
- `ci`: CI/CD 與部署配置更新

---

## 7. 版本發行與標籤管理 (Releases & Tagging)

每當專案完成重大調查章節、重要里程碑（如各黨候選人發表新政見或重大公聽會後），建議發布正式 Release：

### 推薦發布指令：
```bash
# 建立帶簽名之語意化標籤
git tag -a v1.0.0 -m "Release v1.0.0: 多維視角公民事實查核平台正式公開上線"
git push origin v1.0.0
```

### 在 GitHub 建立 Release：
1. 前往專案首頁右側 **Releases** -> 點擊 **Draft a new release**。
2. 選擇剛推送的標籤 `v1.0.0`。
3. 標題：`v1.0.0 - 台北市 2026 毒品政策與減害爭議·公民事實查核平台正式發布`。
4. 內容引述重點更正紀錄（如 S-E01~S-E29 闢謠矩陣、蔣萬安預算案查核、疾管署歷史疫調分析）。
5. 點擊 **Publish release**。

---

**DevOps Automator 部署簽署**：平台已具備工業級自動化測試、最小權限 GitHub Pages 部署架構與完整開源治理配置，隨時可一鍵公開！
