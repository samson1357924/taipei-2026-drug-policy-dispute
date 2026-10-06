const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runQaSuite() {
  const screenshotDir = path.resolve(__dirname, '../public/qa-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const results = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    consoleErrors: [],
    details: {}
  };

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      results.consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    results.consoleErrors.push(err.toString());
  });

  const indexPath = 'file://' + path.resolve(__dirname, '../index.html');
  console.log('Navigating to', indexPath);
  await page.goto(indexPath, { waitUntil: 'networkidle' });

  // 1. Initial Page Load Check
  const pageTitle = await page.title();
  console.log('Page Title:', pageTitle);
  if (pageTitle.includes('台北市 2026 毒品政策與減害爭議')) {
    results.testsPassed++;
    results.details.pageLoad = { status: 'PASS', title: pageTitle };
  } else {
    results.testsFailed++;
    results.details.pageLoad = { status: 'FAIL', title: pageTitle };
  }

  // 2. Metrics Verification
  const metricCards = await page.$$eval('.metric-card', cards => {
    return cards.map(c => {
      const num = c.querySelector('.metric-num')?.textContent?.trim();
      const label = c.querySelector('.metric-label')?.textContent?.trim();
      return { num, label };
    });
  });
  console.log('Metrics Cards:', metricCards);
  results.details.metricCards = metricCards;
  if (metricCards.length === 4 && metricCards.some(m => m.num.includes('29')) && metricCards.some(m => m.num.includes('126'))) {
    results.testsPassed++;
  } else {
    results.testsFailed++;
  }

  // 3. Modal Testing (Open, Content, Close)
  console.log('Testing Mission Modal...');
  const modalBtn = await page.$('#missionModalBtn');
  await modalBtn.click();
  await page.waitForTimeout(300);

  const isModalVisible = await page.$eval('#disclaimerModal', el => !el.hasAttribute('hidden'));
  const modalBodyText = await page.$eval('#disclaimerModal .modal-body', el => el.textContent);
  await page.screenshot({ path: path.join(screenshotDir, 'modal-open.png') });

  const modalChecks = {
    hotline: modalBodyText.includes('0800-770-885'),
    nonPartisan: modalBodyText.includes('非黨派與中立宣告'),
    aiTools: modalBodyText.includes('AI 輔助性質與技術侷限'),
    noMedicalLegal: modalBodyText.includes('非法律與醫療專業建議'),
    citationResponsibility: modalBodyText.includes('引用責任與第三方免責'),
    publicReview: modalBodyText.includes('全民監督與持續勘誤機制'),
    absencePrinciple: modalBodyText.includes('查無資料 ≠ 不存在')
  };
  console.log('Modal Checks:', modalChecks);
  results.details.modal = { visible: isModalVisible, ...modalChecks };

  if (isModalVisible && Object.values(modalChecks).every(v => v === true)) {
    results.testsPassed++;
  } else {
    results.testsFailed++;
  }

  // Close modal via close button
  await page.click('#closeModalBtn');
  await page.waitForTimeout(300);
  const isModalClosed = await page.$eval('#disclaimerModal', el => el.hasAttribute('hidden'));
  if (isModalClosed) {
    results.testsPassed++;
  } else {
    results.testsFailed++;
  }

  // 4. Tab Switching: Facts -> Pyramid
  console.log('Testing Pyramid Tab...');
  await page.click('#tab-pyramid');
  await page.waitForTimeout(300);
  const isPyramidActive = await page.$eval('#pyramid', el => el.classList.contains('active'));
  await page.screenshot({ path: path.join(screenshotDir, 'tab-pyramid.png') });

  // Test Pyramid Tiers (click Layer 1 NSEP)
  const layer1Tier = await page.$('.pyramid-tier[data-layer="1"]');
  await layer1Tier.click();
  await page.waitForTimeout(200);
  const inspectorText = await page.$eval('#pyramidInspector', el => el.textContent);
  const layer1HasLaw = inspectorText.includes('愛滋條例') || inspectorText.includes('第 8 條');
  if (isPyramidActive && layer1HasLaw) {
    results.testsPassed++;
    results.details.pyramid = { status: 'PASS', layer1HasLaw: true };
  } else {
    results.testsFailed++;
    results.details.pyramid = { status: 'FAIL', layer1HasLaw };
  }

  // 5. Tab Switching: Perspectives
  console.log('Testing Perspectives Tab...');
  await page.click('#tab-perspectives');
  await page.waitForTimeout(300);
  const perspectiveCount = await page.$$eval('.perspective-card', cards => cards.length);
  await page.screenshot({ path: path.join(screenshotDir, 'tab-perspectives.png') });
  console.log('Perspective Cards Count:', perspectiveCount);
  if (perspectiveCount === 6) {
    results.testsPassed++;
    results.details.perspectives = { status: 'PASS', count: 6 };
  } else {
    results.testsFailed++;
    results.details.perspectives = { status: 'FAIL', count: perspectiveCount };
  }

  // 6. Tab Switching: Myths & Search Filter
  console.log('Testing Myths Tab...');
  await page.click('#tab-myths');
  await page.waitForTimeout(300);
  const initialMythCount = await page.$$eval('.myth-card', cards => cards.length);
  await page.screenshot({ path: path.join(screenshotDir, 'tab-myths.png') });
  console.log('Initial Myth Count:', initialMythCount);

  // Search "依托咪酯"
  await page.fill('#mythSearchInput', '依托咪酯');
  await page.waitForTimeout(300);
  const etomidateCount = await page.$$eval('.myth-card', cards => cards.length);
  console.log('Myths filtered by "依托咪酯":', etomidateCount);
  await page.screenshot({ path: path.join(screenshotDir, 'myths-search-etomidate.png') });

  // Clear search
  await page.click('#clearMythSearch');
  await page.waitForTimeout(200);
  const clearedCount = await page.$$eval('.myth-card', cards => cards.length);

  if (initialMythCount === 29 && etomidateCount > 0 && clearedCount === 29) {
    results.testsPassed++;
    results.details.myths = { status: 'PASS', total: 29, etomidateCount };
  } else {
    results.testsFailed++;
    results.details.myths = { status: 'FAIL', initialMythCount, clearedCount };
  }

  // 7. Tab Switching: Timeline & Latest Events
  console.log('Testing Timeline Tab...');
  await page.click('#tab-timeline');
  await page.waitForTimeout(300);
  const timelineNodes = await page.$$eval('.timeline-node', nodes => {
    return nodes.map(n => {
      const date = n.querySelector('.timeline-date')?.textContent?.trim();
      const title = n.querySelector('.timeline-title')?.textContent?.trim();
      return { date, title };
    });
  });
  await page.screenshot({ path: path.join(screenshotDir, 'tab-timeline.png') });

  const hasTaipeiHealthBureau = timelineNodes.some(n => n.title.includes('台北市衛生局') || n.title.includes('劃清界線'));
  const hasLoYiChun = timelineNodes.some(n => n.title.includes('羅一鈞'));
  const hasHuangChinShun = timelineNodes.some(n => n.title.includes('黃金舜'));
  const hasGuinnessCheck = timelineNodes.some(n => n.title.includes('金氏') || n.title.includes('37.8 萬'));

  console.log('Timeline Latest Event Checks:', { hasTaipeiHealthBureau, hasLoYiChun, hasHuangChinShun, hasGuinnessCheck });
  if (hasTaipeiHealthBureau && hasLoYiChun && hasHuangChinShun && hasGuinnessCheck) {
    results.testsPassed++;
    results.details.timeline = { status: 'PASS', totalEvents: timelineNodes.length };
  } else {
    results.testsFailed++;
    results.details.timeline = { status: 'FAIL', totalEvents: timelineNodes.length };
  }

  // 8. Tab Switching: Open Questions & Evidence Matrix
  console.log('Testing Open Questions Tab...');
  await page.click('#tab-matrix');
  await page.waitForTimeout(300);
  const questionsCount = await page.$$eval('.question-card', cards => cards.length);
  await page.screenshot({ path: path.join(screenshotDir, 'tab-matrix.png') });
  console.log('Open Questions Count:', questionsCount);
  if (questionsCount === 14) {
    results.testsPassed++;
    results.details.openQuestions = { status: 'PASS', count: 14 };
  } else {
    results.testsFailed++;
    results.details.openQuestions = { status: 'FAIL', count: questionsCount };
  }

  // 9. Theme Toggle
  console.log('Testing Theme Toggle...');
  const initialTheme = await page.$eval('html', el => el.getAttribute('data-theme'));
  await page.click('#themeToggle');
  await page.waitForTimeout(200);
  const toggledTheme = await page.$eval('html', el => el.getAttribute('data-theme'));
  await page.screenshot({ path: path.join(screenshotDir, 'theme-toggled.png') });
  console.log('Theme Toggle:', initialTheme, '->', toggledTheme);
  if (initialTheme !== toggledTheme) {
    results.testsPassed++;
    results.details.themeToggle = { status: 'PASS', from: initialTheme, to: toggledTheme };
  } else {
    results.testsFailed++;
    results.details.themeToggle = { status: 'FAIL' };
  }

  // 10. A11y & Console error check
  const skipLinkExists = await page.$eval('.skip-link', el => !!el);
  console.log('Skip link exists:', skipLinkExists);
  console.log('Console errors count:', results.consoleErrors.length);
  if (skipLinkExists && results.consoleErrors.length === 0) {
    results.testsPassed++;
    results.details.a11yAndErrors = { status: 'PASS', errors: 0 };
  } else {
    results.testsFailed++;
    results.details.a11yAndErrors = { status: 'FAIL', errors: results.consoleErrors };
  }

  await browser.close();

  const reportPath = path.join(screenshotDir, 'test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log('\n=============================================');
  console.log(`QA Test Suite Completed: ${results.testsPassed} PASSED, ${results.testsFailed} FAILED`);
  console.log(`Report written to ${reportPath}`);
  console.log('=============================================');

  if (results.testsFailed > 0 || results.consoleErrors.length > 0) {
    process.exit(1);
  }
}

runQaSuite().catch(err => {
  console.error('QA Test Suite encountered fatal error:', err);
  process.exit(1);
});
