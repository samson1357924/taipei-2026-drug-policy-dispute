/**
 * 台北市 2026 毒品政策爭議·多維視角公民事實查核平台
 * 核心應用邏輯 (Interactivity, Search, Filters, Theme, Tabs, A11y)
 */

document.addEventListener("DOMContentLoaded", () => {
  const data = window.FactCheckData;
  if (!data) {
    console.error("FactCheckData not loaded.");
    return;
  }

  // 1. 初始化各區塊動態渲染
  renderCoreFacts(data.coreFacts);
  renderPyramid(data.pyramidLayers);
  renderPerspectives(data.perspectives);
  renderMyths(data.myths, "");
  renderTimeline(data.timelineEvents);
  renderOpenQuestions(data.openQuestions);

  // 2. 初始化互動事件監聽
  setupThemeToggle();
  setupTabs();
  setupPyramidInteractivity(data.pyramidLayers);
  setupMythsFilter(data.myths);
  setupTimelineFilter(data.timelineEvents);
  setupMissionModal();
});

/* ==========================================================================
   Theme Toggle (Dark / Light)
   ========================================================================== */
function setupThemeToggle() {
  const toggleBtn = document.getElementById("themeToggle");
  if (!toggleBtn) return;

  const currentTheme = localStorage.getItem("theme") || 
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeIcon(currentTheme);

  toggleBtn.addEventListener("click", () => {
    const activeTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = activeTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
    updateThemeIcon(nextTheme);
  });
}

function updateThemeIcon(theme) {
  const toggleBtn = document.getElementById("themeToggle");
  if (!toggleBtn) return;
  toggleBtn.innerHTML = theme === "dark" 
    ? `<span>☀️</span><span>淺色模式</span>` 
    : `<span>🌙</span><span>深色模式</span>`;
}

/* ==========================================================================
   Tab Navigation & Hash Routing (with WAI-ARIA Keyboard Pattern)
   ========================================================================== */
function setupTabs() {
  const tabButtons = Array.from(document.querySelectorAll(".tab-btn"));
  const tabPanes = document.querySelectorAll(".tab-pane");

  function switchTab(tabId) {
    tabButtons.forEach(btn => {
      const isTarget = btn.getAttribute("data-tab") === tabId;
      btn.classList.toggle("active", isTarget);
      btn.setAttribute("aria-selected", isTarget ? "true" : "false");
      btn.setAttribute("tabindex", isTarget ? "0" : "-1");
    });
    tabPanes.forEach(pane => {
      pane.classList.toggle("active", pane.id === tabId);
    });
    window.location.hash = tabId;
  }

  tabButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      switchTab(tabId);
    });

    // WAI-ARIA 鍵盤導航：左右方向鍵、Home、End
    btn.addEventListener("keydown", (e) => {
      let targetIndex = null;
      if (e.key === "ArrowRight") {
        targetIndex = (index + 1) % tabButtons.length;
      } else if (e.key === "ArrowLeft") {
        targetIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      } else if (e.key === "Home") {
        targetIndex = 0;
      } else if (e.key === "End") {
        targetIndex = tabButtons.length - 1;
      }

      if (targetIndex !== null) {
        e.preventDefault();
        tabButtons[targetIndex].focus();
        switchTab(tabButtons[targetIndex].getAttribute("data-tab"));
      }
    });
  });

  // Handle URL hash on load
  const hash = window.location.hash.replace("#", "");
  if (hash && document.getElementById(hash)) {
    switchTab(hash);
  }
}

/* ==========================================================================
   Render Core Facts (Tab 1)
   ========================================================================== */
function renderCoreFacts(facts) {
  const container = document.getElementById("factsContainer");
  if (!container) return;

  container.innerHTML = facts.map(fact => `
    <article class="fact-card">
      <div class="fact-header">
        <span class="fact-badge">${escapeHTML(fact.badge)}</span>
      </div>
      <h3 class="fact-title">${escapeHTML(fact.title)}</h3>
      <p class="fact-summary">${escapeHTML(fact.summary)}</p>
      <div class="fact-points">
        ${fact.points.map(pt => `
          <div class="fact-point">
            <div class="fact-point-header">
              <span class="fact-point-label">${escapeHTML(pt.label)}</span>
              <span class="fact-point-status ${pt.status}">${linkifySourceCodes(escapeHTML(pt.statusText))}</span>
            </div>
            <div class="fact-point-text">${linkifySourceCodes(escapeHTML(pt.text))}</div>
          </div>
        `).join("")}
      </div>
    </article>
  `).join("");
}

/* ==========================================================================
   Render Harm Reduction Pyramid (Tab 2)
   ========================================================================== */
function renderPyramid(layers) {
  const visualContainer = document.getElementById("pyramidVisual");
  if (!visualContainer) return;

  visualContainer.innerHTML = layers.map(l => `
    <div class="pyramid-tier ${l.layer === 5 ? "active" : ""}" 
         data-layer="${l.layer}" 
         role="button"
         tabindex="0"
         aria-pressed="${l.layer === 5 ? "true" : "false"}"
         style="--tier-color: ${l.color}">
      <div class="tier-top">
        <span class="tier-number">Layer 0${l.layer}</span>
        <span class="tier-badge" style="background: ${l.color}22; color: ${l.color}">${escapeHTML(l.statusBadge)}</span>
      </div>
      <div class="tier-title">${escapeHTML(l.name)}</div>
      <div class="tier-subtitle">${escapeHTML(l.enName)}</div>
    </div>
  `).join("");

  // Default display top layer (Layer 5 HAT)
  updatePyramidInspector(layers[0]);
}

function setupPyramidInteractivity(layers) {
  const tiers = document.querySelectorAll(".pyramid-tier");
  tiers.forEach(tier => {
    function selectTier() {
      tiers.forEach(t => {
        t.classList.remove("active");
        t.setAttribute("aria-pressed", "false");
      });
      tier.classList.add("active");
      tier.setAttribute("aria-pressed", "true");
      const layerNum = parseInt(tier.getAttribute("data-layer"), 10);
      const layerData = layers.find(l => l.layer === layerNum);
      if (layerData) {
        updatePyramidInspector(layerData);
      }
    }

    tier.addEventListener("click", selectTier);
    tier.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectTier();
      }
    });
  });
}

function updatePyramidInspector(layer) {
  const inspector = document.getElementById("pyramidInspector");
  if (!inspector) return;

  inspector.innerHTML = `
    <div class="inspector-header">
      <div class="tier-badge" style="background: ${layer.color}22; color: ${layer.color}; display: inline-block; margin-bottom: 0.5rem;">
        ${escapeHTML(layer.statusBadge)}
      </div>
      <h3 class="inspector-title">${escapeHTML(layer.name)}</h3>
      <div class="inspector-subtitle">${escapeHTML(layer.enName)}</div>
    </div>
    <div class="inspector-sections">
      <div class="inspector-item">
        <div class="inspector-label">🇹🇼 台灣現行法規與臨床實況</div>
        <div class="inspector-content">${escapeHTML(layer.taiwanReality)}</div>
      </div>
      <div class="inspector-item">
        <div class="inspector-label">🔬 國際權威醫學實證（EBM）</div>
        <div class="inspector-content">${escapeHTML(layer.intlEvidence)}</div>
      </div>
      <div class="inspector-item">
        <div class="inspector-label">⚠️ 已知代價、風險與限制</div>
        <div class="inspector-content">${escapeHTML(layer.risksAndLimits)}</div>
      </div>
      <div class="inspector-item" style="border-left: 3px solid ${layer.color}">
        <div class="inspector-label">🎯 本次台北選戰爭議關聯與定性</div>
        <div class="inspector-content">${escapeHTML(layer.disputeRelevance)}</div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   Render Multi-Perspective Spectrum (Tab 3)
   ========================================================================== */
function renderPerspectives(perspectives) {
  const container = document.getElementById("perspectivesContainer");
  if (!container) return;

  container.innerHTML = perspectives.map(p => `
    <article class="perspective-card" data-id="${escapeHTML(p.id)}">
      <div class="perspective-top">
        <span class="perspective-icon">${p.icon}</span>
        <div class="perspective-cat">${escapeHTML(p.category)}</div>
      </div>
      <div class="perspective-actors">${escapeHTML(p.actors)}</div>
      <p class="perspective-summary">${escapeHTML(p.summary)}</p>
      
      <div class="perspective-box-title">代表性論點與依據</div>
      <ul class="perspective-list">
        ${p.coreArguments.map(arg => `<li>${escapeHTML(arg)}</li>`).join("")}
      </ul>

      <div class="blindspot-box">
        <div class="blindspot-title">⚠️ 盲點與批判檢驗</div>
        ${p.blindSpots.map(bs => `<div>${escapeHTML(bs)}</div>`).join("")}
      </div>
    </article>
  `).join("");
}

/* ==========================================================================
   Render & Filter Debunked Myths (Tab 4 with Keyword Highlighter)
   ========================================================================== */
function renderMyths(myths, keyword = "") {
  const container = document.getElementById("mythsContainer");
  if (!container) return;

  if (myths.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
        查無符合條件的闢謠項目。
      </div>
    `;
    return;
  }

  container.innerHTML = myths.map(m => `
    <article class="myth-card" data-category="${m.category}">
      <div class="myth-top">
        <span class="myth-id">${highlightText(m.id, keyword)}</span>
        <span class="myth-cat">${escapeHTML(m.categoryName)}</span>
      </div>
      <div class="myth-claim">${highlightText(m.claim, keyword)}</div>
      <div class="myth-truth">✅ 事實查核：${highlightText(m.truth, keyword)}</div>
      <div class="myth-detail">${highlightText(m.detail, keyword)}</div>
      <div class="myth-proof">佐證來源：${linkifySourceCodes(escapeHTML(m.proof))}</div>
    </article>
  `).join("");
}

function setupMythsFilter(allMyths) {
  const searchInput = document.getElementById("mythSearchInput");
  const clearBtn = document.getElementById("clearMythSearch");
  const resultCount = document.getElementById("mythSearchResultCount");
  const filterPills = document.querySelectorAll(".filter-pills .pill-btn");
  let activeCategory = "all";
  let searchKeyword = "";

  function applyFilter() {
    const filtered = allMyths.filter(m => {
      const matchCat = activeCategory === "all" || m.category === activeCategory;
      const matchSearch = !searchKeyword || 
        m.claim.toLowerCase().includes(searchKeyword) ||
        m.truth.toLowerCase().includes(searchKeyword) ||
        m.detail.toLowerCase().includes(searchKeyword) ||
        m.id.toLowerCase().includes(searchKeyword);
      return matchCat && matchSearch;
    });

    if (resultCount) {
      resultCount.textContent = `顯示 ${filtered.length} 項（共 ${allMyths.length} 項）`;
    }
    if (clearBtn) {
      clearBtn.style.display = searchKeyword ? "block" : "none";
    }

    renderMyths(filtered, searchKeyword);
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchKeyword = e.target.value.trim().toLowerCase();
      applyFilter();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      searchKeyword = "";
      applyFilter();
    });
  }

  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeCategory = pill.getAttribute("data-category");
      applyFilter();
    });
  });
}

/* ==========================================================================
   Render & Filter Timeline (Tab 5)
   ========================================================================== */
function renderTimeline(events) {
  const stream = document.getElementById("timelineStream");
  if (!stream) return;

  stream.innerHTML = events.map(ev => `
    <div class="timeline-node">
      <div class="timeline-dot"></div>
      <article class="timeline-card">
        <div class="timeline-meta">
          <span class="timeline-date">${escapeHTML(ev.date)}</span>
          <span class="timeline-actor">${escapeHTML(ev.actor)}</span>
          <span class="fact-point-status verified">${escapeHTML(ev.badge)}</span>
        </div>
        <h4 class="timeline-title">${escapeHTML(ev.title)}</h4>
        <p class="timeline-content">${linkifySourceCodes(escapeHTML(ev.content))}</p>
      </article>
    </div>
  `).join("");
}

function setupTimelineFilter(allEvents) {
  const searchInput = document.getElementById("timelineSearchInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const kw = e.target.value.trim().toLowerCase();
    const filtered = allEvents.filter(ev => 
      ev.title.toLowerCase().includes(kw) ||
      ev.content.toLowerCase().includes(kw) ||
      ev.actor.toLowerCase().includes(kw) ||
      ev.date.toLowerCase().includes(kw)
    );
    renderTimeline(filtered);
  });
}

/* ==========================================================================
   Render Open Questions (Tab 6)
   ========================================================================== */
function renderOpenQuestions(questions) {
  const container = document.getElementById("openQuestionsContainer");
  if (!container) return;

  container.innerHTML = questions.map(q => `
    <div class="question-card">
      <div class="question-top">
        <span class="question-id">${escapeHTML(q.id)}</span>
        <span class="question-status">${escapeHTML(q.status)}</span>
      </div>
      <h4 class="question-title">${escapeHTML(q.title)}</h4>
      <div class="question-conflict"><strong>衝突點：</strong>${escapeHTML(q.conflict)}</div>
      <div class="question-impact"><strong>實質影響：</strong>${escapeHTML(q.impact)}</div>
    </div>
  `).join("");
}

/* ==========================================================================
   Utility Functions
   ========================================================================== */
function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

function getSourceUrl(code) {
  const map = (window.FactCheckData && window.FactCheckData.sourceLinks) || {};
  if (map[code]) return map[code];
  // Fallback：導向統一來源註冊表（站內相對路徑，Pages 與本地皆可用）
  return `sources/SOURCE-REGISTRY.md`;
}

function linkifySourceCodes(escapedText) {
  if (!escapedText) return "";
  // 將 S-P01、S-M19、S-N14、S-C01、S-D01、S-E20、S-PTS1 等編號轉為可點擊超連結
  // 注意：輸入已 escape，無需擔心 HTML 注入；code 本身為安全字元
  return escapedText.replace(/(S-(?:P|M|N|C|D|E|PTS)\d{1,2})/g, (code) => {
    const url = getSourceUrl(code);
    const isExternal = /^https?:\/\//.test(url);
    const extra = isExternal ? ` target="_blank" rel="noopener noreferrer"` : ``;
    return `<a href="${url}" class="source-link"${extra}>${code}</a>`;
  });
}

function highlightText(text, keyword) {
  if (!keyword || !text) return escapeHTML(text);
  const escaped = escapeHTML(text);
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
  return escaped.replace(regex, `<mark class="search-highlight">$1</mark>`);
}

/* ==========================================================================
   Mission & Disclaimer Modal Controller (A11y, Focus Management)
   ========================================================================== */
function setupMissionModal() {
  const modal = document.getElementById("disclaimerModal");
  const openBtn = document.getElementById("missionModalBtn");
  const footerBtn = document.getElementById("footerMissionBtn");
  const closeBtn = document.getElementById("closeModalBtn");
  if (!modal || !closeBtn) return;

  function openModal() {
    modal.removeAttribute("hidden");
    if (openBtn) openBtn.setAttribute("aria-expanded", "true");
    closeBtn.focus();
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.setAttribute("hidden", "");
    if (openBtn) {
      openBtn.setAttribute("aria-expanded", "false");
      openBtn.focus();
    }
    document.body.style.overflow = "";
  }

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (footerBtn) footerBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hasAttribute("hidden")) {
      closeModal();
    }
  });
}
