// ═══════════════════════════════════════════════════════════════════════════
//  data.js — GROW10 Dashboard
//  Static constants, seed data generation, localStorage helpers, aggregation
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */

let PROJECTS = []; // Dynamically populated from departmentIds

const DIMENSIONS = [
  '協調性', '素直さ', '積極性', '明るさ', '礼儀正しさ', 
  '清潔さ', '正確さ', '懸命さ', '柔軟性', 'ホスピタリティ'
];

const MONTHS = ['過去の成績', '今回の成績'];

/**
 * Member roster.
 */
let MEMBERS = [];
let PAST_SCORES = {}; // Populated dynamically from past data CSV

/* ─────────────────────────────────────────
   LOCAL STORAGE
───────────────────────────────────────── */

const LS_SCORES = 'GROW10_scores_v2';
const LS_GOALS  = 'GROW10_goals_v2';

function loadScores() {
  const stored     = localStorage.getItem(LS_SCORES);
  return stored ? JSON.parse(stored) : [];
}

/** Persist a single user-submitted score (upsert). */
function saveScore(entry) {
  const stored     = localStorage.getItem(LS_SCORES);
  const userScores = stored ? JSON.parse(stored) : [];

  const idx = userScores.findIndex(
    s => s.evaluatorId === entry.evaluatorId &&
         s.evaluateeId === entry.evaluateeId &&
         s.month       === entry.month
  );
  if (idx >= 0) userScores[idx] = entry;
  else          userScores.push(entry);

  localStorage.setItem(LS_SCORES, JSON.stringify(userScores));
}

function loadGoal(userId, month) {
  const member = typeof MEMBERS !== 'undefined' ? MEMBERS.find(m => m.id === userId) : null;
  
  // Return the goal from the sheet if it exists
  if (member && member.goal) {
    return { text: String(member.goal), progress: 0 };
  }
  
  // Fallback to local storage if not in sheet
  const stored = localStorage.getItem(LS_GOALS);
  const goals  = stored ? JSON.parse(stored) : [];
  return goals.find(g => g.userId === userId && g.month === month)
      || { text: '', progress: 0 };
}

async function saveGoal(userId, month, text, progress) {
  // 1. Update memory cache immediately
  const member = typeof MEMBERS !== 'undefined' ? MEMBERS.find(m => m.id === userId) : null;
  if (member) member.goal = text;

  // 2. Fallback to localStorage if no GAS URL
  if (typeof GAS_WEB_APP_URL === 'undefined' || GAS_WEB_APP_URL === "YOUR_GAS_WEB_APP_URL_HERE") {
    const stored = localStorage.getItem(LS_GOALS);
    const goals  = stored ? JSON.parse(stored) : [];
    const idx    = goals.findIndex(g => g.userId === userId && g.month === month);
    const entry  = { userId, month, text, progress };
    if (idx >= 0) goals[idx] = entry;
    else          goals.push(entry);
    localStorage.setItem(LS_GOALS, JSON.stringify(goals));
    return;
  }

  // 3. Save to GAS members sheet
  try {
    await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'saveGoal',
        squadNumber: userId,
        month: month,
        goalText: text,
        progress: progress
      })
    });
  } catch (e) {
    console.error('Failed to save goal to GAS', e);
  }
}



const LS_CHIGIRI = 'GROW10_chigiri';
function loadChigiri(userId) {
  const member = typeof MEMBERS !== 'undefined' ? MEMBERS.find(m => m.id === userId) : null;
  if (member && member.chigiri) {
    return { text: String(member.chigiri) };
  }
  const stored = localStorage.getItem(LS_CHIGIRI);
  const data = stored ? JSON.parse(stored) : [];
  return data.find(d => d.userId === userId) || { text: '' };
}
function saveChigiri(userId, text) {
  const stored = localStorage.getItem(LS_CHIGIRI);
  const data = stored ? JSON.parse(stored) : [];
  const idx = data.findIndex(d => d.userId === userId);
  const entry = { userId, text };
  if (idx >= 0) data[idx] = entry;
  else data.push(entry);
  localStorage.setItem(LS_CHIGIRI, JSON.stringify(data));
}

const LS_GROW = 'GROW10_grow';
function loadGrowReflection(userId, month) {
  const stored = localStorage.getItem(LS_GROW);
  const data = stored ? JSON.parse(stored) : [];
  return data.find(d => d.userId === userId && d.month === month) || { reality: '', options: '', will: '' };
}
function saveGrowReflection(userId, month, reality, options, will) {
  const stored = localStorage.getItem(LS_GROW);
  const data = stored ? JSON.parse(stored) : [];
  const idx = data.findIndex(d => d.userId === userId && d.month === month);
  const entry = { userId, month, reality, options, will };
  if (idx >= 0) data[idx] = entry;
  else data.push(entry);
  localStorage.setItem(LS_GROW, JSON.stringify(data));
}


/* ─────────────────────────────────────────
   AGGREGATION
───────────────────────────────────────── */

/**
 * Average score per dimension received by a member in a given month.
 * Returns null when no evaluations exist.
 */
function getAggregatedScores(memberId, month) {
  if (month === '過去の成績') {
    return PAST_SCORES[memberId] || null;
  }

  const relevant = loadScores().filter(
    s => s.evaluateeId === memberId && s.month === month
  );
  if (!relevant.length) return null;

  const totals = Object.fromEntries(DIMENSIONS.map(d => [d, 0]));
  relevant.forEach(s => DIMENSIONS.forEach(d => { totals[d] += (s.scores[d] || 0); }));

  return Object.fromEntries(
    DIMENSIONS.map(d => [d, parseFloat((totals[d] / relevant.length).toFixed(2))])
  );
}

/** Overall average (single number) for one member across all months (for trend line). */
function getMemberTrend(memberId) {
  return MONTHS.map(month => {
    const agg = getAggregatedScores(memberId, month);
    if (!agg) return null;
    const vals = Object.values(agg);
    return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
  });
}

/** Group-level dimension averages for a given month + optional project filter. */
function getGroupAverages(month, projectFilter = '全体') {
  const members = projectFilter === '全体'
    ? MEMBERS
    : MEMBERS.filter(m => m.project === projectFilter);

  const totals = Object.fromEntries(DIMENSIONS.map(d => [d, 0]));
  const counts = Object.fromEntries(DIMENSIONS.map(d => [d, 0]));

  members.forEach(m => {
    const agg = getAggregatedScores(m.id, month);
    if (!agg) return;
    DIMENSIONS.forEach(d => { totals[d] += agg[d]; counts[d]++; });
  });

  return Object.fromEntries(
    DIMENSIONS.map(d => [
      d,
      counts[d] > 0 ? parseFloat((totals[d] / counts[d]).toFixed(2)) : 0
    ])
  );
}

/** Single overall-average number for a month/project combination. */
function getOverallAverage(month, projectFilter = '全体') {
  const vals = Object.values(getGroupAverages(month, projectFilter));
  return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
}

/** Overall-average trend per project + 全体 across all months. */
function getProjectTrends() {
  const result = {};
  [...PROJECTS, '全体'].forEach(proj => {
    result[proj] = MONTHS.map(m => getOverallAverage(m, proj));
  });
  return result;
}

/** How many members scored 1–10 for a dimension in a given month. */
function getDimensionDistribution(dimName, month, projectFilter = '全体') {
  const members = projectFilter === '全体'
    ? MEMBERS
    : MEMBERS.filter(m => m.project === projectFilter);

  const buckets = Array(10).fill(0);
  members.forEach(m => {
    const agg = getAggregatedScores(m.id, month);
    if (!agg) return;
    const score = Math.round(agg[dimName]);
    if (score >= 1 && score <= 10) buckets[score - 1]++;
  });
  return buckets;
}

/** Group-average for one dimension across all months (for trend line). */
function getDimensionTrend(dimName, projectFilter = '全体') {
  return MONTHS.map(m => getGroupAverages(m, projectFilter)[dimName] || 0);
}

/** Top N members for a dimension in a given month. */
function getTopMembersForDim(dimName, month, n = 3, projectFilter = '全体') {
  const members = projectFilter === '全体'
    ? MEMBERS
    : MEMBERS.filter(m => m.project === projectFilter);

  return members
    .map(m => {
      const agg = getAggregatedScores(m.id, month);
      return { member: m, score: agg ? (agg[dimName] || 0) : 0 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

/** All feedback comments (with comment text) received by a member in a month. */
function getFeedbackComments(memberId, month) {
  return loadScores()
    .filter(s => s.evaluateeId === memberId && s.month === month && s.comment && s.comment.trim())
    .map(s => {
      const ev = MEMBERS.find(m => m.id === s.evaluatorId);
      return {
        comment:         s.comment,
        evaluatorName:   ev ? ev.name   : '匿名',
        evaluatorAvatar: ev ? ev.avatar : '👤',
      };
    });
}
