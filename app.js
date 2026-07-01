// ═══════════════════════════════════════════════════════════════════════════
//  app.js — GROW10 Dashboard
//  Chart rendering, tab control, scoring form, modal, toast
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

/* ─────────────────────────────────────────
   STATE
───────────────────────────────────────── */
let currentUser      = null;
let currentTab       = 'dashboard';
let selectedMonth    = MONTHS[MONTHS.length - 1];
let selectedProject  = '全体';
let selectedScorecard = null;
let selectedDimension = DIMENSIONS[0];

const _charts = {};   // Chart instance registry

// Google Apps Script Web App URL (デプロイしたURLをここに貼る)
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw4oh79CPgN8v5itmqXoG8ML6Dq3Rvpk8SJMGFzpeLGT664qjNpt7GLLzzrxShs-DJy/exec";

/* ─────────────────────────────────────────
   CHART THEME
───────────────────────────────────────── */
const PROJECT_COLORS = {
  'TAKEACTION': '#818cf8',
  'FIZZ':       '#34d399',
  'SUPERK':     '#fb7185',
  '上回生':     '#fbbf24',
  '4期生':      '#67e8f9',
};

const BASE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 450, easing: 'easeOutQuart' },
  plugins: {
    legend: {
      labels: {
        color: '#8b90b8',
        font: { family: "'Inter', sans-serif", size: 11 },
        boxWidth: 14,
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(17,20,43,0.97)',
      borderColor: 'rgba(129,140,248,0.3)',
      borderWidth: 1,
      titleColor: '#e8eaff',
      bodyColor: '#8b90b8',
      padding: 12,
      cornerRadius: 10,
    },
  },
};

function _radarScale() {
  return {
    r: {
      min: 0, max: 10,
      ticks: { color: '#555a7a', stepSize: 2, backdropColor: 'transparent', font: { size: 10 } },
      grid:  { color: 'rgba(255,255,255,0.07)' },
      pointLabels: { color: '#8b90b8', font: { family: "'Inter',sans-serif", size: 10 } },
      angleLines:  { color: 'rgba(255,255,255,0.07)' },
    },
  };
}

function _lineScale() {
  return {
    y: {
      min: 0, max: 10,
      grid:   { color: 'rgba(255,255,255,0.05)' },
      ticks:  { color: '#8b90b8', font: { size: 11 } },
      border: { color: 'transparent' },
    },
    x: {
      grid:   { display: false },
      ticks:  { color: '#8b90b8', font: { size: 11 } },
      border: { color: 'transparent' },
    },
  };
}

function _barScale(horizontal = false) {
  const common = { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8b90b8', font: { size: 10 } }, border: { color: 'transparent' } };
  const noGrid  = { grid: { display: false }, ticks: { color: '#8b90b8', font: { size: 10 } }, border: { color: 'transparent' } };
  return horizontal
    ? { x: { ...common, min: 0, max: 10 }, y: noGrid }
    : { y: { ...common, min: 0, max: 10 }, x: { ...noGrid, ticks: { ...noGrid.ticks, maxRotation: 30 } } };
}

function _destroyChart(id) {
  if (_charts[id]) { _charts[id].destroy(); delete _charts[id]; }
}

/* ─────────────────────────────────────────
   BOOT
───────────────────────────────────────── */
async function fetchMembersFromSheet() {
  if (GAS_WEB_APP_URL === "YOUR_GAS_WEB_APP_URL_HERE") {
    console.warn("GAS_WEB_APP_URL is not set. Please set the deployed Web App URL.");
    return;
  }
  const url = GAS_WEB_APP_URL + '?action=getMembers';
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.status !== 'success') throw new Error(json.message);
    
    const lines = json.data;
    const emojis = ['😎','🚀','🌸','⚡','💪','✨','🌟','🎉','🔥','💡'];
    MEMBERS = [];
    
    // index 0 is header row
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i];
      const id = parseInt(parts[0], 10);
      if (isNaN(id)) continue;
      
      const allowedIds = [
        1626, 2022, 2711, 2810, 3220, 3290, 3318, 3451, 3486, 3515,
        3667, 3827, 3929, 4002, 4005, 4006, 4011, 4014, 4017, 4018,
        4023, 4027, 4051, 4071, 4072, 4085, 4088, 4003, 3999, 4999, 4000
      ];
      if (!allowedIds.includes(id)) continue;
      
      const rawDept = parts[3] ? String(parts[3]).replace(/"/g, '') : '';
      const deptArray = rawDept.split(',').map(s => s.trim()).filter(s => s !== 'spark_fes' && s !== 'base' && s !== '');
      const project = deptArray.length > 0 ? deptArray[0] : 'Unassigned';
      
      MEMBERS.push({
        id: id,
        name: parts[1] || 'Unknown',
        category: parts[2] || '',
        project: project,
        desc: rawDept,
        avatar: emojis[id % emojis.length],
        chigiri: parts[5] || '',
        goal: parts[6] || '',
        grow: {
          reality: parts[7] || '',
          options: parts[8] || '',
          will: parts[9] || ''
        }
      });
    }
    
    // Dynamically build PROJECTS array
    const uniqueProjects = Array.from(new Set(MEMBERS.map(m => m.project))).filter(p => p !== 'Unassigned');
    PROJECTS = uniqueProjects;
    
  } catch(e) {
    console.error("Failed to load members from GAS", e);
    alert("スプレッドシートからのデータ取得に失敗しました。\n・GASのデプロイ時に「アクセスできるユーザー：全員」になっていますか？\n・「アクセスを承認」は完了していますか？\nエラー詳細: " + e.message);
  }
}

const RAW_PAST_DATA = `
22,なぁ,7.92,1,7.25,2,8,1,8.92,1,7.42,1,8.33,1,7.58,3,8.33,1,7.17,4,7.67,1,7.86,1
220,あづき,5.08,11,4.75,12,4.42,13,4.25,12,5,11,4.33,12,4,12,4.67,12,5.08,11,5.17,11,4.67,12
290,かな,5.83,9,5.83,10,6,9,5.92,8,5.67,10,5.25,10,6.17,9,6.5,8,6,9,5.42,10,5.86,9
318,はるひ,7.5,3,7.08,3,7.42,3,7.33,2,7.33,2,6.83,4,7.5,4,7.58,2,7.33,2,7.42,2,7.33,2
451,ヨコイ,6.33,8,6.33,8,6.42,8,5.67,9,6.17,8,5.75,8,6.25,8,6.25,9,6.33,8,6.08,8,6.16,8
486,がろな,7.5,3,7.08,3,7.08,6,6.67,5,7,5,6.75,6,7.42,5,7.25,5,6.67,7,7.42,2,7.08,6
515,しょっぴー,4.25,13,4.17,13,4.75,12,4.25,12,4.33,13,3.5,13,3.58,13,4.08,13,4.17,13,4.33,13,4.14,13
626,たいよう,7.25,5,7,5,7.58,2,6.83,4,6.58,7,6.75,6,7.42,5,7.08,7,7.75,1,7.17,5,7.14,3
667,ののか,6.75,7,7,5,7.17,4,7.33,2,7.33,2,7,3,7.08,7,7.5,3,6.92,6,7.33,4,7.14,3
711,ひとみ,7.58,2,7,5,7.17,4,6.25,6,7.08,4,7.08,2,7.67,2,7.42,4,7,5,6.92,6,7.12,5
810,ばとう,5.83,9,6,9,5.92,10,5.25,10,6,9,5.33,9,5.17,11,6.08,10,5.83,10,5.83,9,5.73,10
827,あやね,5.08,11,5.17,11,4.83,11,4.75,11,4.83,12,4.58,11,6,10,5.5,11,4.92,12,5.08,12,5.08,11
929,てるし,7,6,7.58,1,7,7,6.08,7,6.83,6,6.83,4,8,1,7.25,5,7.33,2,6.83,7,7.08,7
`;

async function fetchPastScoresFromSheet() {
  PAST_SCORES = {};
  const lines = RAW_PAST_DATA.trim().split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',');
    const pastId = parseInt(parts[0], 10);
    if (isNaN(pastId)) continue;
    
    // The past CSV drops the first digit of the ID (e.g. 1626 -> 626).
    // We map it back to the real ID by matching the last 3 digits.
    const member = MEMBERS.find(m => m.id % 1000 === pastId);
    if (!member) continue;
    const realId = member.id;
    
    const scores = {
      '協調性': parseFloat(parts[2]) || 0,
      '素直さ': parseFloat(parts[4]) || 0,
      '積極性': parseFloat(parts[6]) || 0,
      '明るさ': parseFloat(parts[8]) || 0,
      '礼儀正しさ': parseFloat(parts[10]) || 0,
      '清潔さ': parseFloat(parts[12]) || 0,
      '正確さ': parseFloat(parts[14]) || 0,
      '懸命さ': parseFloat(parts[16]) || 0,
      '柔軟性': parseFloat(parts[18]) || 0,
      'ホスピタリティ': parseFloat(parts[20]) || 0
    };
    
    PAST_SCORES[realId] = scores;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const loginBtn = document.querySelector('#login-modal button');
  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.textContent = '読込中...';
  }
  // Run sequentially because fetchPastScoresFromSheet depends on MEMBERS
  await fetchMembersFromSheet();
  await fetchPastScoresFromSheet();
  if (loginBtn) {
    loginBtn.disabled = false;
    loginBtn.textContent = 'ログイン';
  }
});

function handleLogin() {
  const inputEl = document.getElementById('login-id-input');
  const errorMsg = document.getElementById('login-error-msg');
  const idVal = parseInt(inputEl.value, 10);
  
  const member = MEMBERS.find(m => m.id === idVal);
  if (!member) {
    errorMsg.style.display = 'block';
    return;
  }
  
  errorMsg.style.display = 'none';
  currentUser = member;
  selectedScorecard = member.id;
  
  document.getElementById('login-modal').style.display = 'none';
  
  // Save login history to GAS
  if (GAS_WEB_APP_URL !== "YOUR_GAS_WEB_APP_URL_HERE") {
    fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'logLogin',
        squadNumber: member.id,
        name: member.name
      })
    }).catch(e => console.error("Failed to log login to GAS", e));
  }
  
  _updateSidebarProfile();
  _initGlobalFilters();
  _initScorecardSelect();
  _initDimSelector();
  _initScoringForm();
  _syncGoalToUI();
  _syncChigiriToUI();
  renderTab('dashboard');

  // Chigiri modal popup enabled as a global announcement
  setTimeout(() => {
    openChigiriModal();
  }, 100);
}

function _updateSidebarProfile() {
  const elAvatar = document.getElementById('current-user-avatar');
  const elName   = document.getElementById('current-user-name');
  if (elAvatar) elAvatar.textContent = currentUser.avatar;
  if (elName)   elName.textContent   = currentUser.name;
}

/* ─────────────────────────────────────────
   GLOBAL FILTERS
───────────────────────────────────────── */
function _initGlobalFilters() {
  document.getElementById('global-period-select').innerHTML =
    MONTHS.map((m, i) =>
      `<option value="${m}" ${i === MONTHS.length - 1 ? 'selected' : ''}>
        ${m}${i === MONTHS.length - 1 ? ' (最新)' : ''}
      </option>`
    ).join('');

  document.getElementById('global-project-select').innerHTML =
    `<option value="全体">プロジェクト: 全体</option>` +
    PROJECTS.map(p => `<option value="${p}">${p}</option>`).join('');
}

function onGlobalFilterChange() {
  selectedMonth   = document.getElementById('global-period-select').value;
  selectedProject = document.getElementById('global-project-select').value;
  renderTab(currentTab);
}

/* ─────────────────────────────────────────
   TAB SWITCHING
───────────────────────────────────────── */
function switchTab(id) {
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById(`tab-${id}`).classList.add('active');
  const navEl = document.getElementById(`nav-${id}`);
  if (navEl) navEl.classList.add('active');

  const TITLES = {
    dashboard: 'ダッシュボード',
    scorecard: '個人成績表',
    trends:    '全体平均・動向',
    dimensions: '項目別傾向・リーダー',
    scoring:   '成績をつける',
  };
  document.getElementById('page-title').textContent = TITLES[id] || id;
  currentTab = id;
  renderTab(id);
}

function renderTab(id) {
  switch (id) {
    case 'dashboard':  _renderDashboard();              break;
    case 'scorecard':  _renderScorecard(selectedScorecard); break;
    case 'trends':     _renderTrends();                 break;
    case 'dimensions': _renderDimensions();             break;
    case 'scoring':    _renderScoringTab();             break;
  }
}

/* ═══════════════════════════════════════
   TAB 1 — DASHBOARD
═══════════════════════════════════════ */
function _renderDashboard() {
  const userScores = getAggregatedScores(currentUser.id, selectedMonth);
  const groupAvg   = getGroupAverages(selectedMonth);
  const radarVals  = userScores ? Object.values(userScores) : Array(10).fill(5);
  const avgVal     = radarVals.length
    ? (radarVals.reduce((a, b) => a + b, 0) / radarVals.length).toFixed(2)
    : '—';

  document.getElementById('user-avg-value').textContent = avgVal;

  _destroyChart('miniRadarChart');
  _charts['miniRadarChart'] = new Chart(
    document.getElementById('miniRadarChart').getContext('2d'),
    {
      type: 'radar',
      data: {
        labels: DIMENSIONS,
        datasets: [
          {
            label: currentUser.name,
            data: radarVals,
            borderColor: '#818cf8',
            backgroundColor: 'rgba(129,140,248,0.15)',
            pointBackgroundColor: '#818cf8',
            pointRadius: 3,
            borderWidth: 2,
          },
          {
            label: '全体平均',
            data: Object.values(groupAvg),
            borderColor: 'rgba(139,144,184,0.5)',
            backgroundColor: 'rgba(139,144,184,0.06)',
            pointBackgroundColor: 'rgba(139,144,184,0.5)',
            pointRadius: 2,
            borderWidth: 1.5,
            borderDash: [5, 5],
          },
        ],
      },
      options: {
        ...BASE_OPTS,
        scales: _radarScale(),
        plugins: {
          ...BASE_OPTS.plugins,
          legend: { ...BASE_OPTS.plugins.legend, position: 'bottom' },
        },
      },
    }
  );

  // Feedback
  const comments = getFeedbackComments(currentUser.id, selectedMonth);
  window._allComments = comments;
  const container = document.getElementById('feedback-container');
  if (!comments.length) {
    container.innerHTML =
      `<div style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:1.5rem;">
         📭 まだフィードバックがありません。<br>メンバーに評価してもらいましょう！
       </div>`;
  } else {
    container.innerHTML = comments.slice(0, 3).map(c => `
      <div class="feedback-item">
        <div class="feedback-item-header">
          <span class="feedback-avatar">${c.evaluatorAvatar}</span>
          <span class="feedback-from">${_esc(c.evaluatorName)} より</span>
        </div>
        <p class="feedback-text">${_esc(c.comment)}</p>
      </div>`
    ).join('');
  }

  _syncGoalToUI();
  _syncChigiriToUI();
}

function _syncGoalToUI() {
  const goal = loadGoal(currentUser.id, selectedMonth);
  const ta   = document.getElementById('monthly-goal-text');
  const sl   = document.getElementById('goal-progress-slider');
  const lbl  = document.getElementById('progress-val');
  if (ta)  ta.value  = goal.text;
  if (sl)  sl.value  = goal.progress;
  if (lbl) lbl.textContent = goal.progress + '%';
}

function updateProgressLabel(val) {
  const lbl = document.getElementById('progress-val');
  if (lbl) lbl.textContent = val + '%';
}

function saveMonthlyGoal() {
  const text     = document.getElementById('monthly-goal-text').value;
  const slider   = document.getElementById('goal-progress-slider');
  const progress = slider ? parseInt(slider.value) : 0;
  saveGoal(currentUser.id, selectedMonth, text, progress);
  showToast('💾 目標を保存しました！');
}

/* Chigiri */
function _syncChigiriToUI() {
  const chigiri = loadChigiri(currentUser.id);
  const el = document.getElementById('current-chigiri-text');
  if (el) {
    el.textContent = chigiri.text ? `「${chigiri.text}」` : 'まだ契りが立てられていません。';
    el.style.color = chigiri.text ? 'var(--accent-amber)' : 'var(--text-primary)';
  }
}

/* ═══════════════════════════════════════
   TAB 2 — INDIVIDUAL SCORECARD
═══════════════════════════════════════ */
function _initScorecardSelect() {
  const select = document.getElementById('scorecard-member-select');
  let html = '';
  PROJECTS.forEach(proj => {
    const mbs = MEMBERS.filter(m => m.project === proj);
    if (!mbs.length) return;
    html += `<optgroup label="${proj}">`;
    mbs.forEach(m => { html += `<option value="${m.id}">${m.avatar} ${m.name}</option>`; });
    html += `</optgroup>`;
  });
  select.innerHTML = html;
  selectedScorecard = MEMBERS[0].id;
}

function onScorecardMemberChange() {
  selectedScorecard = parseInt(document.getElementById('scorecard-member-select').value);
  _renderScorecard(selectedScorecard);
}

function _renderScorecard(memberId) {
  const member = MEMBERS.find(m => m.id === memberId);
  if (!member) return;

  const color    = PROJECT_COLORS[member.project] || '#818cf8';
  const scores   = getAggregatedScores(member.id, selectedMonth);
  const groupAvg = getGroupAverages(selectedMonth);

  // Profile header
  document.getElementById('sc-avatar').textContent  = member.avatar;
  document.getElementById('sc-name').textContent    = member.name;
  document.getElementById('sc-desc').textContent    = member.desc;

  const badge = document.getElementById('sc-project-badge');
  badge.textContent = member.project;
  badge.style.setProperty('--proj-c', color);

  const avg = scores
    ? (Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length).toFixed(2)
    : '—';
  document.getElementById('sc-average').textContent = avg;
  document.getElementById('sc-average').style.color = color;

  const scoreVals = scores ? DIMENSIONS.map(d => scores[d]) : Array(10).fill(5);

  // ── Radar ──────────────────────────────
  _destroyChart('scRadarChart');
  _charts['scRadarChart'] = new Chart(
    document.getElementById('scRadarChart').getContext('2d'), {
      type: 'radar',
      data: {
        labels: DIMENSIONS,
        datasets: [
          {
            label: member.name,
            data: scoreVals,
            borderColor: color,
            backgroundColor: color + '28',
            pointBackgroundColor: color,
            pointRadius: 4,
            borderWidth: 2.5,
          },
          {
            label: '全体平均',
            data: Object.values(groupAvg),
            borderColor: 'rgba(139,144,184,0.5)',
            backgroundColor: 'rgba(139,144,184,0.06)',
            pointBackgroundColor: 'rgba(139,144,184,0.5)',
            pointRadius: 3,
            borderWidth: 1.5,
            borderDash: [5, 5],
          },
        ],
      },
      options: {
        ...BASE_OPTS,
        scales: _radarScale(),
        plugins: {
          ...BASE_OPTS.plugins,
          legend: { ...BASE_OPTS.plugins.legend, position: 'bottom' },
        },
      },
    }
  );

  // ── Horizontal bar (per dimension) ──────
  _destroyChart('scHistogramChart');
  _charts['scHistogramChart'] = new Chart(
    document.getElementById('scHistogramChart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: DIMENSIONS,
        datasets: [{
          label: 'スコア',
          data: scoreVals,
          backgroundColor: scoreVals.map(v =>
            v >= 8 ? '#34d399cc' : v <= 5 ? '#fb7185cc' : color + 'cc'
          ),
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        ...BASE_OPTS,
        indexAxis: 'y',
        scales: _barScale(true),
        plugins: { ...BASE_OPTS.plugins, legend: { display: false } },
      },
    }
  );

  // ── Trend line (past comparison) ────────
  _destroyChart('scTrendChart');
  const trend = getMemberTrend(member.id);
  _charts['scTrendChart'] = new Chart(
    document.getElementById('scTrendChart').getContext('2d'), {
      type: 'line',
      data: {
        labels: MONTHS,
        datasets: [{
          label: member.name + ' 総合平均',
          data: trend,
          borderColor: color,
          backgroundColor: color + '22',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: color,
          pointRadius: 5,
          pointHoverRadius: 8,
          borderWidth: 2.5,
        }],
      },
      options: { ...BASE_OPTS, scales: _lineScale() },
    }
  );

  // ── Table ────────────────────────────────
  const tbody = document.getElementById('sc-table-body');
  if (scores) {
    tbody.innerHTML = DIMENSIONS.map(dim => {
      const s    = scores[dim];
      const diff = parseFloat((s - (groupAvg[dim] || 0)).toFixed(2));
      const sign = diff > 0 ? '+' : '';
      const pillC = s >= 8 ? '#34d399' : s <= 5 ? '#fb7185' : color;
      const badge = s >= 8
        ? `<span class="badge badge-strength">💪 強み</span>`
        : s <= 5
          ? `<span class="badge badge-challenge">📈 成長機会</span>`
          : `<span class="badge badge-neutral">🔹 標準</span>`;
      return `
        <tr>
          <td><strong>${dim}</strong></td>
          <td>
            <span style="display:inline-flex;align-items:center;justify-content:center;
              width:46px;height:28px;border-radius:99px;font-weight:700;font-size:0.88rem;
              color:${pillC};background:${pillC}22;border:1px solid ${pillC}55;">
              ${s.toFixed(1)}
            </span>
          </td>
          <td style="color:${diff > 0 ? '#34d399' : diff < 0 ? '#fb7185' : '#8b90b8'}">
            ${sign}${diff}
          </td>
          <td>${badge}</td>
        </tr>`;
    }).join('');
  } else {
    tbody.innerHTML =
      `<tr><td colspan="4" style="color:var(--text-muted);text-align:center;padding:1.2rem;">
         この月のデータがありません
       </td></tr>`;
  }
}

/* ═══════════════════════════════════════
   TAB 3 — OVERALL TRENDS
═══════════════════════════════════════ */
function _renderTrends() {
  const filteredMembers = selectedProject === '全体'
    ? MEMBERS
    : MEMBERS.filter(m => m.project === selectedProject);

  // KPIs
  document.getElementById('kpi-member-count').textContent = filteredMembers.length + '人';

  const overallAvg = getOverallAverage(selectedMonth, selectedProject);
  document.getElementById('group-overall-avg').textContent = overallAvg.toFixed(2);

  const dimAvgs = getGroupAverages(selectedMonth, selectedProject);
  const sorted  = [...DIMENSIONS].sort((a, b) => dimAvgs[b] - dimAvgs[a]);
  document.getElementById('highest-avg-dim').textContent = sorted[0];

  const prevIdx = MONTHS.indexOf(selectedMonth) - 1;
  if (prevIdx >= 0) {
    const prevAvgs  = getGroupAverages(MONTHS[prevIdx], selectedProject);
    const improved  = [...DIMENSIONS].sort(
      (a, b) => (dimAvgs[b] - prevAvgs[b]) - (dimAvgs[a] - prevAvgs[a])
    );
    document.getElementById('most-improved-dim').textContent = improved[0];
  } else {
    document.getElementById('most-improved-dim').textContent = '—';
  }

  // ── Line: monthly trend per project ──────
  _destroyChart('overallLineChart');
  const trends         = getProjectTrends();
  const projectsToShow = selectedProject === '全体' ? PROJECTS : [selectedProject];

  _charts['overallLineChart'] = new Chart(
    document.getElementById('overallLineChart').getContext('2d'), {
      type: 'line',
      data: {
        labels: MONTHS,
        datasets: projectsToShow.map(proj => ({
          label: proj,
          data:  trends[proj],
          borderColor: PROJECT_COLORS[proj] || '#818cf8',
          backgroundColor: (PROJECT_COLORS[proj] || '#818cf8') + '18',
          fill: false,
          tension: 0.4,
          pointBackgroundColor: PROJECT_COLORS[proj] || '#818cf8',
          pointRadius: 5,
          pointHoverRadius: 8,
          borderWidth: 2.5,
        })),
      },
      options: { ...BASE_OPTS, scales: _lineScale() },
    }
  );

  // ── Grouped bar: dimension × project ─────
  _destroyChart('projectBarChart');
  const projectsForBar = selectedProject === '全体' ? PROJECTS : [selectedProject];

  _charts['projectBarChart'] = new Chart(
    document.getElementById('projectBarChart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: DIMENSIONS,
        datasets: projectsForBar.map(proj => {
          const avgs = getGroupAverages(selectedMonth, proj);
          return {
            label: proj,
            data:  DIMENSIONS.map(d => avgs[d] || 0),
            backgroundColor: (PROJECT_COLORS[proj] || '#818cf8') + 'cc',
            borderRadius: 4,
            borderSkipped: false,
          };
        }),
      },
      options: { ...BASE_OPTS, scales: _barScale() },
    }
  );
}

/* ═══════════════════════════════════════
   TAB 4 — DIMENSION ANALYTICS
═══════════════════════════════════════ */
function _initDimSelector() {
  document.getElementById('dim-selector-grid').innerHTML =
    DIMENSIONS.map((d, i) =>
      `<button class="dim-btn${i === 0 ? ' active' : ''}"
         onclick="selectDimension('${d}', this)">${d}</button>`
    ).join('');
}

function selectDimension(dim, btn) {
  selectedDimension = dim;
  document.querySelectorAll('.dim-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  _renderDimensions();
}

function _renderDimensions() {
  const dim    = selectedDimension;
  const dimAvg = getGroupAverages(selectedMonth, selectedProject)[dim] || 0;

  document.getElementById('dim-title').textContent     = dim + ' の傾向';
  document.getElementById('dim-avg-badge').textContent = `全体平均: ${dimAvg.toFixed(2)}`;

  // ── Trend line ───────────────────────────
  _destroyChart('dimTrendChart');
  const trend = getDimensionTrend(dim, selectedProject);
  _charts['dimTrendChart'] = new Chart(
    document.getElementById('dimTrendChart').getContext('2d'), {
      type: 'line',
      data: {
        labels: MONTHS,
        datasets: [{
          label: dim,
          data: trend,
          borderColor: '#818cf8',
          backgroundColor: 'rgba(129,140,248,0.15)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#818cf8',
          pointRadius: 5,
          pointHoverRadius: 8,
          borderWidth: 2.5,
        }],
      },
      options: {
        ...BASE_OPTS,
        scales: _lineScale(),
        plugins: { ...BASE_OPTS.plugins, legend: { display: false } },
      },
    }
  );

  // ── Distribution histogram ───────────────
  _destroyChart('dimDistChart');
  const dist = getDimensionDistribution(dim, selectedMonth, selectedProject);
  _charts['dimDistChart'] = new Chart(
    document.getElementById('dimDistChart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['1','2','3','4','5','6','7','8','9','10'],
        datasets: [{
          label: '人数',
          data: dist,
          backgroundColor: dist.map((_, i) =>
            i >= 7 ? '#34d399cc' : i >= 4 ? '#818cf8cc' : '#fb7185cc'
          ),
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        ...BASE_OPTS,
        scales: {
          y: {
            min: 0,
            ticks: { stepSize: 1, color: '#8b90b8', font: { size: 10 } },
            grid:  { color: 'rgba(255,255,255,0.05)' },
            border: { color: 'transparent' },
          },
          x: {
            grid: { display: false },
            ticks: { color: '#8b90b8', font: { size: 11 } },
            border: { color: 'transparent' },
          },
        },
        plugins: { ...BASE_OPTS.plugins, legend: { display: false } },
      },
    }
  );

  // ── Leaders ──────────────────────────────
  const top3    = getTopMembersForDim(dim, selectedMonth, 3, selectedProject);
  const medals  = ['🥇', '🥈', '🥉'];
  const mColors = ['#fbbf24', '#9ca3af', '#cd7f32'];

  document.getElementById('leaders-container').innerHTML = top3.length
    ? top3.map((item, i) => `
        <div class="leader-item" style="--rank-c:${mColors[i]}">
          <div class="leader-rank">${medals[i]}</div>
          <div class="leader-avatar-lg">${item.member.avatar}</div>
          <div class="leader-info">
            <div class="leader-name">${item.member.name}</div>
            <div class="leader-project">${item.member.project}</div>
          </div>
          <div class="leader-score" style="color:${mColors[i]}">${item.score.toFixed(1)}</div>
        </div>`
      ).join('')
    : `<div style="color:var(--text-muted);text-align:center;padding:1rem;">データなし</div>`;
}

/* ═══════════════════════════════════════
   TAB 5 — SCORING
═══════════════════════════════════════ */
function _initScoringForm() {
  // Build member optgroup HTML (reused for both selects)
  let memberHtml = '';
  PROJECTS.forEach(proj => {
    const mbs = MEMBERS.filter(m => m.project === proj);
    if (!mbs.length) return;
    memberHtml += `<optgroup label="${proj}">`;
    mbs.forEach(m => { memberHtml += `<option value="${m.id}">${m.avatar} ${m.name}</option>`; });
    memberHtml += `</optgroup>`;
  });

  document.getElementById('scoring-evaluator-select').innerHTML = memberHtml;
  document.getElementById('scoring-evaluatee-select').innerHTML = memberHtml;

  // Month select (always latest by default)
  document.getElementById('scoring-month-select').innerHTML =
    MONTHS.map((m, i) =>
      `<option value="${m}" ${i === MONTHS.length - 1 ? 'selected' : ''}>${m}</option>`
    ).join('');

  // Dimension sliders
  document.getElementById('scoring-sliders').innerHTML =
    DIMENSIONS.map((dim, i) => `
      <div class="scoring-row">
        <label class="scoring-dim-label">${dim}</label>
        <div class="scoring-slider-wrap">
          <span class="scoring-range-label">1</span>
          <input type="range" min="1" max="10" value="5"
            id="scoring-slider-${i}"
            class="scoring-slider"
            oninput="updateSliderLabel(${i}, this.value)">
          <span class="scoring-range-label">10</span>
        </div>
        <span class="scoring-value" id="scoring-val-${i}">5</span>
      </div>`
    ).join('');

  _updateScoringPreview();
}

function _renderScoringTab() {
  _renderSubmittedList();
}

function updateSliderLabel(idx, val) {
  const el = document.getElementById('scoring-val-' + idx);
  if (!el) return;
  el.textContent = val;
  const v = parseInt(val);
  el.style.color = v >= 8 ? '#34d399' : v <= 4 ? '#fb7185' : '#818cf8';
  _updateScoringPreview();
}

function _updateScoringPreview() {
  const vals = DIMENSIONS.map((_, i) => {
    const el = document.getElementById('scoring-slider-' + i);
    return el ? parseInt(el.value) : 5;
  });
  const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  const el  = document.getElementById('scoring-preview-avg');
  if (el) el.textContent = avg;
}

function submitScore() {
  const evaluatorId = parseInt(document.getElementById('scoring-evaluator-select').value);
  const evaluateeId = parseInt(document.getElementById('scoring-evaluatee-select').value);
  const month       = document.getElementById('scoring-month-select').value;
  const comment     = document.getElementById('scoring-comment').value.trim();

  if (evaluatorId === evaluateeId) {
    showToast('⚠️ 自己評価はできません', 'error');
    return;
  }

  const scores = {};
  DIMENSIONS.forEach((dim, i) => {
    const el = document.getElementById('scoring-slider-' + i);
    scores[dim] = el ? parseInt(el.value) : 5;
  });

  saveScore({
    id:          `user_${evaluatorId}_${evaluateeId}_${Date.now()}`,
    evaluatorId, evaluateeId, month, scores, comment,
    timestamp:   Date.now(),
    isSeed:      false,
  });

  showToast('✅ 評価を送信しました！');

  // Reset sliders to 5
  DIMENSIONS.forEach((_, i) => {
    const sl = document.getElementById('scoring-slider-' + i);
    const vl = document.getElementById('scoring-val-' + i);
    if (sl) sl.value = 5;
    if (vl) { vl.textContent = '5'; vl.style.color = '#818cf8'; }
  });
  document.getElementById('scoring-comment').value = '';
  _updateScoringPreview();
  _renderSubmittedList();

  // Live-refresh scorecard if open for the same person
  if (currentTab === 'scorecard' && selectedScorecard === evaluateeId) {
    _renderScorecard(selectedScorecard);
  }
}

function _renderSubmittedList() {
  const stored     = localStorage.getItem('GROW10_scores_v2');
  const userScores = stored ? JSON.parse(stored) : [];
  const container  = document.getElementById('submitted-list');
  if (!container) return;

  if (!userScores.length) {
    container.innerHTML =
      `<div style="color:var(--text-muted);text-align:center;padding:1.5rem;font-size:0.85rem;">
         まだ評価の送信記録がありません
       </div>`;
    return;
  }

  const recent = [...userScores].sort((a, b) => b.timestamp - a.timestamp).slice(0, 15);
  container.innerHTML = recent.map(s => {
    const ev  = MEMBERS.find(m => m.id === s.evaluatorId);
    const ee  = MEMBERS.find(m => m.id === s.evaluateeId);
    if (!ev || !ee) return '';
    const avg  = (Object.values(s.scores).reduce((a, b) => a + b, 0) / Object.values(s.scores).length).toFixed(1);
    const date = new Date(s.timestamp).toLocaleDateString('ja-JP');
    return `
      <div class="submitted-item">
        <div class="submitted-avatars">
          <span>${ev.avatar}</span>
          <span class="submitted-arrow">→</span>
          <span>${ee.avatar}</span>
        </div>
        <div class="submitted-names">
          <span class="submitted-name-text">${_esc(ev.name)} → ${_esc(ee.name)}</span>
          <span class="submitted-meta">${s.month}　${date}</span>
          ${s.comment ? `<span class="submitted-comment">"${_esc(s.comment)}"</span>` : ''}
        </div>
        <div class="submitted-score-badge">${avg}</div>
      </div>`;
  }).join('');
}

/* ─────────────────────────────────────────
   MODALS
───────────────────────────────────────── */
function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function closeModalOnOverlay(e, id) {
  if (e.target.id === id) closeModal(id);
}

// 1. Comments Modal
function openCommentsModal() {
  openModal('comments-modal');
  const comments  = window._allComments || [];
  const container = document.getElementById('modal-feedback-container');
  container.innerHTML = comments.length
    ? comments.map(c => `
        <div class="feedback-item">
          <div class="feedback-item-header">
            <span class="feedback-avatar">${c.evaluatorAvatar}</span>
            <span class="feedback-from">${_esc(c.evaluatorName)} より</span>
          </div>
          <p class="feedback-text">${_esc(c.comment)}</p>
        </div>`
      ).join('')
    : `<div style="color:var(--text-muted);text-align:center;">コメントなし</div>`;
}

// 2. User Switcher
function openUserSwitcherModal() {
  const select = document.getElementById('login-user-select');
  select.innerHTML = MEMBERS.map(m => 
    `<option value="${m.id}" ${m.id === currentUser.id ? 'selected' : ''}>
       ${m.avatar} ${m.name} (${m.project})
     </option>`
  ).join('');
  openModal('user-switcher-modal');
}

function switchUser() {
  const id = parseInt(document.getElementById('login-user-select').value);
  const user = MEMBERS.find(m => m.id === id);
  if (user) {
    currentUser = user;
    _updateSidebarProfile();
    closeModal('user-switcher-modal');
    renderTab(currentTab); // refresh current view
    showToast(`${user.name} に切り替えました`);
  }
}

// 3. GROW Reflection
function openGrowModal() {
  // Load from member data (fetched from sheet)
  const grow = currentUser.grow || { reality: '', options: '', will: '' };
  document.getElementById('grow-reality').value = grow.reality;
  document.getElementById('grow-options').value = grow.options;
  document.getElementById('grow-will').value = grow.will;
  openModal('grow-modal');
}

async function saveGrowReflection() {
  const reality = document.getElementById('grow-reality').value;
  const options = document.getElementById('grow-options').value;
  const will    = document.getElementById('grow-will').value;
  
  // Update local state immediately
  if (!currentUser.grow) currentUser.grow = {};
  currentUser.grow.reality = reality;
  currentUser.grow.options = options;
  currentUser.grow.will = will;

  if (GAS_WEB_APP_URL !== "YOUR_GAS_WEB_APP_URL_HERE") {
    try {
      const btn = document.querySelector('#grow-modal .btn-primary');
      const originalText = btn.textContent;
      btn.textContent = '保存中...';
      btn.disabled = true;
      
      await fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'saveGrow',
          squadNumber: currentUser.id,
          reality: reality,
          options: options,
          will: will
        })
      });
      
      btn.textContent = originalText;
      btn.disabled = false;
    } catch(e) {
      console.error("Failed to save GROW reflection", e);
    }
  }

  closeModal('grow-modal');
  showToast('🌱 振り返りをスプレッドシートに保存しました！');
}

// 4. Chigiri Modal (Global Announcement)
function openChigiriModal() {
  openModal('chigiri-modal');
}

function skipChigiri() {
  closeModal('chigiri-modal');
}


/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.background = type === 'error'
    ? 'linear-gradient(135deg,#fb7185,#f43f5e)'
    : 'linear-gradient(135deg,#818cf8,#a78bfa)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ─────────────────────────────────────────
   UTILITY
───────────────────────────────────────── */
function _esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
