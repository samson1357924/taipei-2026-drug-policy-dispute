# 協作貢獻指引 (Contributing Guidelines)

感謝您關注「台北市 2026 毒品政策與減害爭議·多維視角公民事實查核平台」。  
本專案為完全開源、非營利、非黨派的公民事實查核與政策研究專案。我們誠摯歡迎各界專家、醫事公衛人員、法學研究者、媒體工作者與公眾共同監督、勘誤並補充文獻。

---

## 🧭 核心協作原則 (Core Principles)

1. **事實第一，價值分離**  
   本專案**不判定政治人物或政黨之道德與政治是非**，僅檢驗「誰在何時說了什麼」、「原始文本逐字紀錄為何」、「官方公報與科學證據支持到哪裡」。
2. **恪守查核界限（查無資料 ≠ 不存在）**  
   若某項資料未能檢索到，應精確標記「未查得相關登錄」或「無公開紀錄」，不可逕行做出「從未存在」或「絕對沒有」之全稱斷言。
3. **正反並陳，杜絕偏頗**  
   任何爭議點均需完整呈現正反雙方論據與醫界/公衛界不同流派觀點（例如減害支持論 vs 反對降階管制論），不可選擇性省略對特定陣營有利或不利之一手證據。
4. **嚴禁政治動員與謾罵**  
   Pull Request 與 Issue 討論均需保持理性、就事論事，違者將依 [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) 關閉並限制權限。

---

## 🏷️ 證據分級制度 (Evidence Hierarchy)

所有提交之新論點或勘誤，必須標註證據等級：

| 級別 | 定義 | 範例與認定門檻 |
| :--- | :--- | :--- |
| **P1** | **一手原始法定文獻** | 立法院公報完整紀錄、司法院憲法法庭判決書、全國法規資料庫現行條文、警政統計通報、疾管署正式疫調公報。 |
| **P2** | **經同儕審查之科學文獻與權威機構指引** | *The Lancet*, *BMJ*, *NEJM*, Cochrane Systematic Reviews、WHO / UNODC / 台灣衛福部正式指引。 |
| **P3** | **當事人公開發言與具信譽媒體報導** | 參選人本人經認證社群貼文、記者會完整影音逐字紀錄、中央社等具查核規範之主流媒體報導。 |
| **X** | **已查證為事實錯誤或虛妄之說法** | 捏造條號、混淆判決字號、算式分母錯置、文字斷章取義。需具體說明錯誤之處與反證來源。 |

---

## 🛠️ 開發與貢獻流程 (Workflow)

### 1. 提交事實勘誤或文獻 (Fact-Check / Evidence Submission)
若您發現任何數據誤植、文字筆誤或有更新的一手公報欲補充：
1. 請優先使用 [GitHub Issue 模板](https://github.com/samson1357924/taipei-2026-drug-policy-dispute/issues/new/choose) 提出。
2. 附上：
   - 爭議文字目前所在檔案與章節行號。
   - 修正建議與精確論據。
   - 一手原始文獻連結（PDF 頁碼、公報卷期、公文字號等）。

### 2. 本地開發與環境設置 (Local Development)
本專案堅持「零重型構建框架依賴」，採用原生現代 Web 技術，確保最大程度的可讀性與長久保存性：
- **前端核心**：Vanilla HTML5, CSS3, ES6+ JavaScript（無需 npm install 或 Webpack 打包）
- **本地預覽**：可使用任何本地 HTTP 伺服器啟動：
  ```bash
  # Python 啟動
  python3 -m http.server 8080

  # 或 Node.js
  npx serve .
  ```
- **自動化驗證環境**：
  - 需要 `bash`、`python3` (3.8+)

### 3. 本地品質驗證 (Pre-Commit Verification)
在發起 Pull Request 之前，**必須在本地執行完整品質檢查門禁**：

```bash
# 1. 驗證全站資料庫、文本一致性與檔案完整性
./scripts/verify-integrity.sh

# 2. 執行 29 項流行病學、法規預算與統計學自動化驗算
python3 scripts/verify-calculations.py

# 3. （可選）檢查所有外部引用連結之存活性
./scripts/check-sources.sh
```
若有任何一項檢查未通過，PR 將無法通過 CI 門禁。

### 4. 資料庫同步規範 (Data Consistency Rule)
若修改涉及核心數據、闢謠條目（S-E01~S-E29）或爭議時間軸，**必須同時更新以下聯動檔案**以維護跨文件一致性：
1. `docs/00-綜合分析報告.md`（綜合深度分析）
2. `sources/SOURCE-REGISTRY.md`（來源編號表）
3. `data/EVIDENCE-MATRIX.md`（主張–證據對照矩陣）
4. `data/timeline.csv`（時間軸數據集）
5. `js/data.js`（前端展示資料庫）

---

## 📝 Git Commit 訊息規範 (Commit Convention)

本專案採行 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <subject>
```

- **feat**: 新增前端功能、展示頁面或互動維度
- **fix**: 修正數據、文字、引文錯誤或前端 Bug
- **docs**: 更新調查報告、說明文件、註冊表
- **ci**: 修改 GitHub Actions、Pages 部署、工作流
- **test**: 新增或修改自動化驗證腳本、計算測試
- **chore**: 雜項更新、相容性維護

範例：
```bash
git commit -m "docs: 補充疾管署 2005 注射藥癮統計口徑分析 (S-E28)"
git commit -m "ci: 更新 GitHub Pages 部署 workflow 與門禁驗證"
```

---

## 🤝 行為準則 (Code of Conduct)
參與本專案請遵守我們的 [行為準則 (CODE_OF_CONDUCT.md)](CODE_OF_CONDUCT.md)。尊重多元觀點、拒絕人身攻擊，共同營造健康的公民理性對話氛圍。
