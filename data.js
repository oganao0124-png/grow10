// ═══════════════════════════════════════════════════════════════════════════
//  data.js — GROW10 Dashboard
//  Static constants, seed data generation, localStorage helpers, aggregation
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */

const PROJECTS = ['TAKEACTION', 'FIZZ', 'SUPERK', '上回生', '4期生'];

const DIMENSIONS = [
  '積極性', '明るさ', 'コミュニケーション', 'リーダーシップ',
  '責任感', '創造性', '協調性', '成長意欲', '貢献度', '信頼性'
];

const MONTHS = ['2026年4月', '2026年5月', '2026年6月'];

/**
 * Member roster.
 * `base` = reference score per DIMENSION index (used to generate seed data).
 * Edit this array to add / rename members.
 */
const MEMBERS = [
  // ── TAKEACTION ────────────────────────────────────────────────────────
  {
    id: 1, name: 'なお', avatar: '😎', project: 'TAKEACTION',
    desc: 'エネルギッシュなリーダー。チームを引っ張る力が抜群。',
    base: [9, 9, 8, 9, 8, 7, 8, 9, 8, 9]
  },
  {
    id: 2, name: 'ゆうき', avatar: '🚀', project: 'TAKEACTION',
    desc: 'アイデアマン。新しい発想でチームを常に驚かせる。',
    base: [7, 8, 7, 6, 8, 9, 7, 9, 7, 8]
  },
  {
    id: 3, name: 'さき', avatar: '🌸', project: 'TAKEACTION',
    desc: '細やかな気配りでチームを支える縁の下の力持ち。',
    base: [6, 8, 9, 6, 9, 6, 10, 7, 9, 9]
  },
  {
    id: 4, name: 'たける', avatar: '⚡', project: 'TAKEACTION',
    desc: '行動力と決断力に優れた実行者タイプ。やると決めたら即動く。',
    base: [9, 7, 7, 8, 7, 7, 7, 8, 8, 7]
  },

  // ── FIZZ ──────────────────────────────────────────────────────────────
  {
    id: 5, name: 'みき', avatar: '💡', project: 'FIZZ',
    desc: '論理的思考でプロジェクトの課題を整理・解決する。',
    base: [7, 7, 8, 7, 9, 8, 7, 9, 8, 9]
  },
  {
    id: 6, name: 'こうた', avatar: '🎯', project: 'FIZZ',
    desc: '目標設定が得意で、チームを正しい方向へ導く。',
    base: [8, 8, 7, 9, 8, 7, 8, 8, 9, 8]
  },
  {
    id: 7, name: 'あかり', avatar: '🌟', project: 'FIZZ',
    desc: '明るさとコミュニケーション力でチームのムードメーカー。',
    base: [8, 10, 9, 7, 7, 7, 9, 8, 8, 8]
  },

  // ── SUPERK ────────────────────────────────────────────────────────────
  {
    id: 8, name: 'りょう', avatar: '🏋️', project: 'SUPERK',
    desc: '粘り強く最後までやり遂げる根性と継続力がある。',
    base: [7, 7, 7, 7, 9, 7, 8, 9, 8, 9]
  },
  {
    id: 9, name: 'はな', avatar: '🌺', project: 'SUPERK',
    desc: '協調性が高く、チームの雰囲気を自然に和やかにする。',
    base: [7, 9, 9, 6, 8, 7, 10, 8, 8, 9]
  },
  {
    id: 10, name: 'だいき', avatar: '🔥', project: 'SUPERK',
    desc: '情熱的で周りを巻き込む力が強い。熱量が全員に伝わる。',
    base: [9, 8, 8, 8, 7, 8, 8, 8, 8, 7]
  },

  // ── 上回生 ────────────────────────────────────────────────────────────
  {
    id: 11, name: 'けんじ', avatar: '🎓', project: '上回生',
    desc: '経験豊富なメンター。後輩の成長を誰よりも真剣に支える。',
    base: [8, 8, 9, 9, 9, 8, 9, 8, 9, 9]
  },
  {
    id: 12, name: 'ゆみ', avatar: '👑', project: '上回生',
    desc: 'リーダーシップと圧倒的な信頼感で全体をまとめる存在。',
    base: [8, 9, 9, 10, 9, 8, 9, 8, 9, 10]
  },

  // ── 4期生 ─────────────────────────────────────────────────────────────
  {
    id: 13, name: 'まさき', avatar: '🌱', project: '4期生',
    desc: '新入りながら積極的に学ぼうとする姿勢が光る。将来が楽しみな成長株。',
    base: [7, 7, 7, 5, 7, 7, 7, 9, 7, 7]
  },
  {
    id: 14, name: 'ちひろ', avatar: '✨', project: '4期生',
    desc: '細部への注意力が高く、正確な仕事をする几帳面タイプ。',
    base: [6, 7, 8, 5, 9, 7, 8, 9, 7, 8]
  },
  {
    id: 15, name: 'そうた', avatar: '🎮', project: '4期生',
    desc: '発想が豊かで、ユニークな視点からアイデアを出す。',
    base: [7, 8, 7, 6, 6, 9, 7, 8, 7, 7]
  },
];

/* ─────────────────────────────────────────
   SEED DATA GENERATION
   Deterministic pseudo-random via Linear Congruential Generator
   so charts always have historical data even before any real submissions.
───────────────────────────────────────── */

function _lcg(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

/**
 * Generates reproducible seed evaluations for all historical months
 * (i.e., every month except the latest).
 */
function generateSeedScores() {
  const seeds = [];
  const historicalMonths = MONTHS.slice(0, MONTHS.length - 1);

  historicalMonths.forEach((month, mIdx) => {
    MEMBERS.forEach(evaluator => {
      MEMBERS.forEach(evaluatee => {
        if (evaluator.id === evaluatee.id) return;   // no self-eval

        const rand = _lcg(evaluator.id * 997 + evaluatee.id * 31 + mIdx * 7919);
        const scoresObj = {};

        DIMENSIONS.forEach((dim, dIdx) => {
          const base = evaluatee.base[dIdx];
          const variation = Math.round((rand() - 0.5) * 4);   // ±2
          scoresObj[dim] = Math.min(10, Math.max(1, base + variation));
        });

        seeds.push({
          id:          `seed_${evaluator.id}_${evaluatee.id}_${mIdx}`,
          evaluatorId: evaluator.id,
          evaluateeId: evaluatee.id,
          month,
          scores:      scoresObj,
          comment:     '',
          timestamp:   Date.now() - (mIdx + 1) * 30 * 24 * 60 * 60 * 1000,
          isSeed:      true,
        });
      });
    });
  });

  return seeds;
}

/* ─────────────────────────────────────────
   LOCAL STORAGE
───────────────────────────────────────── */

const LS_SCORES = 'GROW10_scores_v2';
const LS_GOALS  = 'GROW10_goals_v2';

/**
 * Merges seed scores with user-submitted scores.
 * User scores override seeds for the same evaluator + evaluatee + month.
 */
function loadScores() {
  const stored     = localStorage.getItem(LS_SCORES);
  const userScores = stored ? JSON.parse(stored) : [];
  const seeds      = generateSeedScores();

  const userKeys = new Set(
    userScores.map(s => `${s.evaluatorId}_${s.evaluateeId}_${s.month}`)
  );
  const filteredSeeds = seeds.filter(
    s => !userKeys.has(`${s.evaluatorId}_${s.evaluateeId}_${s.month}`)
  );

  return [...filteredSeeds, ...userScores];
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
  const stored = localStorage.getItem(LS_GOALS);
  const goals  = stored ? JSON.parse(stored) : [];
  return goals.find(g => g.userId === userId && g.month === month)
      || { text: '', progress: 0 };
}

function saveGoal(userId, month, text, progress) {
  const stored = localStorage.getItem(LS_GOALS);
  const goals  = stored ? JSON.parse(stored) : [];
  const idx    = goals.findIndex(g => g.userId === userId && g.month === month);
  const entry  = { userId, month, text, progress };
  if (idx >= 0) goals[idx] = entry;
  else          goals.push(entry);
  localStorage.setItem(LS_GOALS, JSON.stringify(goals));
}

/* ─────────────────────────────────────────
   AGGREGATION
───────────────────────────────────────── */

/**
 * Average score per dimension received by a member in a given month.
 * Returns null when no evaluations exist.
 */
function getAggregatedScores(memberId, month) {
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
