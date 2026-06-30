// ═══════════════════════════════════════════════════════════════════════════
//  data.js — GROW10 Dashboard
//  Static constants, seed data generation, localStorage helpers, aggregation
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */

const PROJECTS = ['TAKEACTION', 'FIZZ', 'コア', '上回生', '4期生'];

const DIMENSIONS = [
  '協調性', '素直さ', '積極性', '明るさ', '礼儀正しさ',
  '清潔さ', '正確さ', '懸命さ', '柔軟性', 'ホスピタリティー'
];

const MONTHS = ['2026年4月', '2026年5月', '2026年6月'];

/**
 * Member roster.
 * `base` = reference score per DIMENSION index (used to generate seed data).
 * Edit this array to add / rename members.
 */
const MEMBERS = [
  // ── TAKEACTION (take_action) ───────────────────────────────────────────
  {
    id: 1, squadNumber: 2810, name: '馬頭 遼太朗', avatar: '🏃', project: 'TAKEACTION',
    desc: 'TAKEACTIONの推進力。行動力と突破力でチームを引っ張る。',
    base: [8, 7, 7, 8, 8, 7, 7, 8, 8, 7]
  },
  {
    id: 2, squadNumber: 3451, name: '横井 亮哉', avatar: '⚡', project: 'TAKEACTION',
    desc: 'エネルギッシュに課題へ向かうTAKEACTIONメンバー。',
    base: [7, 8, 7, 7, 7, 7, 8, 8, 7, 8]
  },
  {
    id: 3, squadNumber: 3486, name: '遠藤 愛佳', avatar: '🌟', project: ['TAKEACTION', 'FIZZ'],
    desc: 'TAKEACTION×FIZZを橋渡しするチーフ。コミュ力抜群。',
    base: [8, 9, 9, 7, 8, 7, 9, 8, 8, 8]
  },
  {
    id: 4, squadNumber: 3667, name: '桑島 野乃叶', avatar: '🎯', project: 'TAKEACTION',
    desc: 'TAKEACTIONチーフ。目標達成へ向けたリーダーシップが光る。',
    base: [8, 8, 8, 9, 8, 7, 8, 8, 9, 9]
  },
  {
    id: 5, squadNumber: 3999, name: '武市 力', avatar: '💪', project: ['TAKEACTION', '4期生'],
    desc: '粘り強さと実行力でTAKEACTIONを支えるメンバー。',
    base: [8, 7, 7, 7, 8, 7, 7, 8, 8, 7]
  },
  {
    id: 6, squadNumber: 4023, name: '西山 桃代', avatar: '🌸', project: ['TAKEACTION', '4期生'],
    desc: 'チームの雰囲気を和ませながらしっかり行動するメンバー。',
    base: [7, 8, 8, 6, 7, 7, 9, 8, 7, 8]
  },
  {
    id: 7, squadNumber: 4027, name: '北井 千景', avatar: '💫', project: ['TAKEACTION', '4期生'],
    desc: '細やかな配慮とコミュニケーションでチームを支える。',
    base: [6, 8, 9, 6, 8, 7, 9, 8, 8, 8]
  },
  {
    id: 8, squadNumber: 4051, name: '小川 直寛', avatar: '🚀', project: ['TAKEACTION', '4期生'],
    desc: '積極的に動き、チームの勢いを高めるメンバー。',
    base: [8, 7, 7, 7, 7, 7, 7, 8, 7, 7]
  },

  // ── FIZZ (fizz) ────────────────────────────────────────────────────────
  {
    id: 9, squadNumber: 3220, name: '岡本 あづき', avatar: '💡', project: 'FIZZ',
    desc: 'アイデアと実行力を兼ね備えたFIZZのエース。',
    base: [8, 8, 8, 7, 8, 8, 8, 9, 8, 8]
  },
  {
    id: 10, squadNumber: 3290, name: '森本 香菜', avatar: '🌺', project: ['FIZZ', '上回生'],
    desc: 'FIZZと上回生をつなぐ経験豊富なアシスタント。',
    base: [7, 8, 9, 7, 8, 7, 9, 8, 8, 9]
  },
  {
    id: 11, squadNumber: 3318, name: '野田 華妃', avatar: '👑', project: 'FIZZ',
    desc: 'FIZZチーフ。組織をリードし、成果を最大化する存在。',
    base: [8, 9, 8, 9, 8, 8, 8, 8, 9, 9]
  },
  {
    id: 12, squadNumber: 3515, name: '川邉 翔太', avatar: '🎯', project: 'FIZZ',
    desc: '論理的思考とコミュ力でFIZZプロジェクトを推進。',
    base: [7, 7, 8, 7, 8, 8, 7, 9, 8, 8]
  },
  {
    id: 13, squadNumber: 3827, name: '井上 彩音', avatar: '✨', project: 'FIZZ',
    desc: '明るさと協調性でFIZZのチームをまとめる。',
    base: [7, 9, 9, 7, 7, 7, 9, 8, 8, 8]
  },
  {
    id: 14, squadNumber: 4006, name: '山下 葵衣', avatar: '🌱', project: ['FIZZ', '4期生'],
    desc: '新しい発想とFIZZへの情熱を持つ4期生メンバー。',
    base: [7, 8, 7, 6, 7, 8, 7, 9, 7, 7]
  },
  {
    id: 15, squadNumber: 4017, name: '長井 咲奈', avatar: '🎵', project: ['FIZZ', '4期生'],
    desc: 'コミュニケーション力と協調性が光るFIZZメンバー。',
    base: [6, 8, 9, 6, 7, 7, 9, 8, 7, 8]
  },
  {
    id: 16, squadNumber: 4018, name: '林 美緒', avatar: '🌈', project: ['FIZZ', '4期生'],
    desc: '誠実さと丁寧な仕事ぶりでFIZZを支えるメンバー。',
    base: [6, 7, 8, 6, 8, 7, 8, 8, 7, 8]
  },

  // ── コア (core) ────────────────────────────────────────────────────────
  {
    id: 17, squadNumber: 1626, name: '武市 太陽', avatar: '☀️', project: ['コア', '上回生'],
    desc: 'GROW10のコアを担うリーダー。組織全体をまとめ上げる存在。',
    base: [9, 9, 9, 10, 9, 8, 9, 9, 9, 10]
  },
  {
    id: 18, squadNumber: 2022, name: '池田 奈央', avatar: '🎓', project: 'コア',
    desc: 'コア統括として組織を俯瞰し、全体の方向性を導く。',
    base: [8, 9, 9, 9, 9, 8, 9, 8, 9, 10]
  },
  {
    id: 19, squadNumber: 2711, name: '松村 瞳', avatar: '👁️', project: 'コア',
    desc: '人事担当として組織の基盤を整えるコアメンバー。',
    base: [8, 8, 9, 8, 9, 8, 9, 8, 9, 9]
  },

  // ── 上回生 (yoiti_asaiti のみ) ────────────────────────────────────────
  {
    id: 20, squadNumber: 3929, name: '池田 晃士', avatar: '🔮', project: '上回生',
    desc: '経験と知識でチーム全体を支えるアシスタント。',
    base: [8, 8, 8, 8, 9, 7, 8, 8, 9, 9]
  },

  // ── 4期生 (yonki) ─────────────────────────────────────────────────────
  {
    id: 21, squadNumber: 4002, name: '中村 悠大', avatar: '🌟', project: ['上回生', '4期生'],
    desc: '積極性と勢いでチームに新風を吹き込む4期生。',
    base: [7, 7, 7, 6, 7, 7, 7, 9, 7, 7]
  },
  {
    id: 22, squadNumber: 4003, name: '中内 悠貴', avatar: '⭐', project: '4期生',
    desc: '真摯に成長を追求する姿勢が光る4期生メンバー。',
    base: [7, 7, 7, 6, 7, 7, 7, 9, 7, 7]
  },
  {
    id: 23, squadNumber: 4005, name: '中原 瑛太', avatar: '🎯', project: ['上回生', '4期生'],
    desc: 'チームへの貢献を惜しまない4期生の実力者。',
    base: [7, 7, 8, 6, 7, 7, 7, 8, 7, 7]
  },
  {
    id: 24, squadNumber: 4011, name: '大上 航正', avatar: '✈️', project: '4期生',
    desc: '広い視野とリーダーシップで4期生をけん引する。',
    base: [7, 7, 7, 7, 7, 7, 7, 8, 7, 7]
  },
  {
    id: 25, squadNumber: 4014, name: '足助 祐美', avatar: '🌻', project: '4期生',
    desc: '努力家で責任感の強い4期生のムードメーカー。',
    base: [6, 8, 8, 6, 8, 7, 8, 8, 7, 8]
  },
  {
    id: 26, squadNumber: 4071, name: '木上 眞', avatar: '🌿', project: '4期生',
    desc: '独自の視点とアイデアで4期生に貢献するメンバー。',
    base: [7, 7, 7, 6, 7, 8, 7, 8, 7, 7]
  },
  {
    id: 27, squadNumber: 4072, name: '木下 蓮人', avatar: '🏅', project: '4期生',
    desc: '継続力と粘り強さが光る4期生の成長株。',
    base: [7, 7, 7, 6, 8, 7, 7, 9, 7, 7]
  },
  {
    id: 28, squadNumber: 4085, name: '岡本 奈々', avatar: '🌸', project: ['上回生', '4期生'],
    desc: '協調性と明るさでチームの雰囲気を和ませる。',
    base: [6, 9, 8, 6, 7, 7, 9, 8, 7, 8]
  },
  {
    id: 29, squadNumber: 4088, name: '神谷 美緒', avatar: '🎵', project: ['上回生', '4期生'],
    desc: '丁寧で誠実な姿勢でチームを支える4期生メンバー。',
    base: [6, 8, 8, 6, 8, 7, 8, 8, 7, 8]
  },
];

/* ─────────────────────────────────────────
   EVALUATION DATA (Evaluation_Responsesシートから取得)
───────────────────────────────────────── */

/** URL to the Evaluation_Responses sheet (must be viewable by anyone with the link). */
const EVAL_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1pA35USylQ4QTjOL0_sv1cOG7ZjC3upqV-OiOwj5To5k' +
  '/gviz/tq?tqx=out:csv&sheet=Evaluation_Responses';

/**
 * Live data from the spreadsheet.
 * Starts as fallback hardcoded data; overwritten by loadEvaluationData() on page load.
 * Each entry: { evaluateeId (squadNumber), scores: { dim: avg, ... } }
 */
let EVALUATION_DATA = [
  {
    evaluateeId: 4999,
    scores: { '協調性':8, '素直さ':8, '積極性':10, '明るさ':9, '礼儀正しさ':6, '清潔さ':7, '正確さ':7, '懸命さ':7, '柔軟性':10, 'ホスピタリティー':8 }
  },
  {
    evaluateeId: 4071,
    scores: { '協調性':5, '素直さ':9, '積極性':6, '明るさ':9, '礼儀正しさ':6, '清潔さ':10, '正確さ':4, '懸命さ':7, '柔軟性':6, 'ホスピタリティー':9 }
  },
  {
    evaluateeId: 4072,
    scores: { '協調性':8, '素直さ':7, '積極性':7, '明るさ':6, '礼儀正しさ':9, '清潔さ':10, '正確さ':9, '懸命さ':6, '柔軟性':6, 'ホスピタリティー':7 }
  },
  {
    evaluateeId: 4085,
    scores: { '協調性':9, '素直さ':6, '積極性':4, '明るさ':4, '礼儀正しさ':2, '清潔さ':3, '正確さ':3, '懸命さ':3, '柔軟性':8, 'ホスピタリティー':6 }
  },
];

/** Minimal RFC-4180 CSV parser (handles double-quoted fields). */
function _parseCSV(text) {
  const rows = [];
  for (const line of text.trim().split('\n')) {
    if (!line.trim()) continue;
    const row = [];
    let field = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQ && line[i + 1] === '"') { field += '"'; i++; }
        else inQ = !inQ;
      } else if (c === ',' && !inQ) {
        row.push(field); field = '';
      } else {
        field += c;
      }
    }
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/**
 * Fetch Evaluation_Responses from Google Sheets and update EVALUATION_DATA.
 * Falls back silently to the hardcoded data if the fetch fails.
 */
async function loadEvaluationData() {
  try {
    const res = await fetch(EVAL_SHEET_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const rows = _parseCSV(text);
    if (rows.length < 2) return;

    const header = rows[0];
    const evalCol = header.indexOf('Evaluatee_ID');
    if (evalCol < 0) throw new Error('Evaluatee_ID column not found');

    // Map dim name → column index
    const dimCols = {};
    DIMENSIONS.forEach(d => { dimCols[d] = header.indexOf(d); });

    // Aggregate: evaluateeId → { dim → [values] }
    const agg = {};
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const id  = parseInt(row[evalCol]);
      if (isNaN(id)) continue;
      if (!agg[id]) agg[id] = {};
      DIMENSIONS.forEach(dim => {
        const col = dimCols[dim];
        if (col < 0) return;
        const v = parseFloat(row[col]);
        if (!isNaN(v)) {
          if (!agg[id][dim]) agg[id][dim] = [];
          agg[id][dim].push(v);
        }
      });
    }

    // Build averaged EVALUATION_DATA
    EVALUATION_DATA = Object.entries(agg).map(([id, dimMap]) => ({
      evaluateeId: parseInt(id),
      scores: Object.fromEntries(
        Object.entries(dimMap).map(([dim, vals]) => [
          dim,
          parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2))
        ])
      )
    }));

    console.info(`[GROW10] スプレッドシートから評価データを読み込みました (${EVALUATION_DATA.length}人分)`);
  } catch (err) {
    console.warn('[GROW10] 評価データの読み込みに失敗。フォールバックデータを使用します。', err.message);
  }
}


/**
 * Returns averaged scores per dimension for a given squadNumber,
 * or null if no evaluation data exists.
 */
function getEvaluationScores(squadNumber) {
  const responses = EVALUATION_DATA.filter(r => r.evaluateeId === squadNumber);
  if (!responses.length) return null;
  const result = {};
  DIMENSIONS.forEach(dim => {
    const vals = responses
      .map(r => r.scores[dim])
      .filter(v => v != null && !isNaN(v));
    result[dim] = vals.length
      ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2))
      : 0;
  });
  return result;
}

/* ─────────────────────────────────────────
   SQUAD MEMBERS (from spreadsheet)
   Members identified by squadNumber and name.
   Used for the search feature in 個人成績表.
───────────────────────────────────────── */
const SQUAD_MEMBERS = [
  { squadNumber: 1626, name: '武市 太陽' },
  { squadNumber: 2022, name: '池田 奈央' },
  { squadNumber: 2711, name: '松村 瞳' },
  { squadNumber: 2810, name: '馬頭 遼太朗' },
  { squadNumber: 3220, name: '岡本 あづき' },
  { squadNumber: 3290, name: '森本 香菜' },
  { squadNumber: 3318, name: '野田 華妃' },
  { squadNumber: 3451, name: '横井 亮哉' },
  { squadNumber: 3486, name: '遠藤 愛佳' },
  { squadNumber: 3515, name: '川邉 翔太' },
  { squadNumber: 3667, name: '桑島 野乃叶' },
  { squadNumber: 3827, name: '井上 彩音' },
  { squadNumber: 3929, name: '池田 晃士' },
  { squadNumber: 3999, name: '武市 力' },
  { squadNumber: 4001, name: '笹江恋太朗' },
  { squadNumber: 4002, name: '中村悠大' },
  { squadNumber: 4003, name: '中内悠貴' },
  { squadNumber: 4004, name: '古田子昂' },
  { squadNumber: 4005, name: '中原瑛太' },
  { squadNumber: 4006, name: '山下葵衣' },
  { squadNumber: 4007, name: '宮嶋心愛' },
  { squadNumber: 4008, name: '平田修大' },
  { squadNumber: 4009, name: '濁池夢斗' },
  { squadNumber: 4010, name: '松田篤樹' },
  { squadNumber: 4011, name: '大上航正' },
  { squadNumber: 4012, name: '岡嶋尚志' },
  { squadNumber: 4013, name: '田中美帆' },
  { squadNumber: 4014, name: '足助祐美' },
  { squadNumber: 4015, name: '西城裕陽' },
  { squadNumber: 4016, name: '二又佑妃' },
  { squadNumber: 4017, name: '長井咲奈' },
  { squadNumber: 4018, name: '林美緒' },
  { squadNumber: 4019, name: '太田陵月' },
  { squadNumber: 4020, name: '前岩丈琉' },
  { squadNumber: 4021, name: '北角優空' },
  { squadNumber: 4022, name: '原田実怜' },
  { squadNumber: 4023, name: '西山桃代' },
  { squadNumber: 4024, name: '松井能' },
  { squadNumber: 4025, name: '山﨑 菜結' },
  { squadNumber: 4026, name: '井上那月' },
  { squadNumber: 4027, name: '北井千景' },
  { squadNumber: 4028, name: '加藤誠一朗' },
  { squadNumber: 4029, name: '市川秦' },
  { squadNumber: 4030, name: '杉山慶浩' },
  { squadNumber: 4031, name: '梅谷芙実' },
  { squadNumber: 4032, name: '田内芽希' },
  { squadNumber: 4033, name: '藤井優' },
  { squadNumber: 4035, name: '早川結苗' },
  { squadNumber: 4036, name: '赤松凛々子' },
  { squadNumber: 4037, name: '中西希花' },
  { squadNumber: 4038, name: '真鍋瑞葉' },
  { squadNumber: 4039, name: '矢木陽太' },
  { squadNumber: 4040, name: '中井捷馬' },
  { squadNumber: 4041, name: '長知純' },
  { squadNumber: 4042, name: '高木桜' },
  { squadNumber: 4043, name: '村田遥風' },
  { squadNumber: 4044, name: '平野里帆' },
  { squadNumber: 4045, name: '九鬼杏奈' },
  { squadNumber: 4046, name: '坂田翔' },
  { squadNumber: 4047, name: '上治亮太' },
  { squadNumber: 4048, name: '金子巧' },
  { squadNumber: 4049, name: '小西乃慈' },
  { squadNumber: 4050, name: '島田悠杜' },
  { squadNumber: 4051, name: '小川直寛' },
  { squadNumber: 4052, name: '島田梨帆' },
  { squadNumber: 4053, name: '樋口絵麻' },
  { squadNumber: 4054, name: '樋浦佳乃子' },
  { squadNumber: 4055, name: '井上晴菜' },
  { squadNumber: 4056, name: '北川陽道' },
  { squadNumber: 4057, name: '仙田あかり' },
  { squadNumber: 4058, name: '青山優' },
  { squadNumber: 4059, name: '市川璃博' },
  { squadNumber: 4060, name: '岩本智佳' },
  { squadNumber: 4061, name: '伊藤大智' },
  { squadNumber: 4062, name: '杉山直太郎' },
  { squadNumber: 4063, name: '西本光伶' },
  { squadNumber: 4064, name: '西村羽叶' },
  { squadNumber: 4065, name: '福本莉央' },
  { squadNumber: 4066, name: '石田彩乃' },
  { squadNumber: 4067, name: '山川結衣' },
  { squadNumber: 4068, name: '濱田かんな' },
  { squadNumber: 4069, name: '熊谷心花' },
  { squadNumber: 4070, name: '梶浦朔' },
  { squadNumber: 4071, name: '木上眞' },
  { squadNumber: 4072, name: '木下蓮人' },
  { squadNumber: 4073, name: '久保山愛子' },
  { squadNumber: 4074, name: '由利優芽' },
  { squadNumber: 4075, name: '佐藤昂' },
  { squadNumber: 4076, name: '堀内桃花' },
  { squadNumber: 4077, name: '広川観音' },
  { squadNumber: 4078, name: '河野莉々' },
  { squadNumber: 4079, name: '車谷美琴' },
  { squadNumber: 4080, name: '火浦生真' },
  { squadNumber: 4081, name: '山川夢加' },
  { squadNumber: 4082, name: '川田稜眞' },
  { squadNumber: 4083, name: '岡さくら' },
  { squadNumber: 4084, name: '柏木里奈' },
  { squadNumber: 4085, name: '岡本奈々' },
  { squadNumber: 4086, name: '浅野詞音' },
  { squadNumber: 4087, name: '松岡利通' },
  { squadNumber: 4088, name: '神谷美緒' },
  { squadNumber: 4089, name: '井町晴歩' },
  { squadNumber: 4090, name: '市村伊純' },
  { squadNumber: 4091, name: '帯谷遥弥' },
  { squadNumber: 4092, name: '竹嶋晴' },
  { squadNumber: 4093, name: '木村温音' },
  { squadNumber: 4094, name: '藤本吏穂' },
  { squadNumber: 4095, name: '室峰万由奈' },
  { squadNumber: 4096, name: '岩佐篤志' },
  { squadNumber: 4097, name: '川崎晄希' },
  { squadNumber: 4098, name: '児島有祐' },
  { squadNumber: 4099, name: '寺坂匠平' },
  { squadNumber: 4100, name: '三河とわ' },
  { squadNumber: 4101, name: '川上真翔' },
  { squadNumber: 4102, name: '森陽菜' },
];

/**
 * Find a squad member by squadNumber (number or string) or name (partial match).
 * Returns the matching squad member or null.
 */
function findSquadMember(query) {
  const q = String(query).trim();
  if (!q) return null;
  // Try exact squadNumber match
  const byNumber = SQUAD_MEMBERS.find(m => String(m.squadNumber) === q);
  if (byNumber) return byNumber;
  // Try name match (partial, case-insensitive)
  const lower = q.toLowerCase();
  return SQUAD_MEMBERS.find(m => m.name.toLowerCase().includes(lower)) || null;
}

/**
 * Generate deterministic seed scores for a squad member (by squadNumber)
 * using the same LCG approach as the main members, with a default base of 7.
 */
function generateSquadMemberSeedScores(squadNumber) {
  const seeds = [];
  const historicalMonths = MONTHS.slice(0, MONTHS.length - 1);
  const base = Array(10).fill(7);

  historicalMonths.forEach((month, mIdx) => {
    const rand = _lcg(squadNumber * 997 + mIdx * 7919);
    const scoresObj = {};
    DIMENSIONS.forEach((dim, dIdx) => {
      const variation = Math.round((rand() - 0.5) * 4);
      scoresObj[dim] = Math.min(10, Math.max(1, base[dIdx] + variation));
    });
    seeds.push({
      id:          `squad_seed_${squadNumber}_${mIdx}`,
      evaluatorId: -1,           // sentinel: squad seed
      evaluateeId: squadNumber,  // use squadNumber as the ID
      month,
      scores:      scoresObj,
      comment:     '',
      timestamp:   Date.now() - (mIdx + 1) * 30 * 24 * 60 * 60 * 1000,
      isSeed:      true,
    });
  });
  return seeds;
}

/**
 * Aggregated scores for a squad member in a given month.
 * Uses seed data only (no real user scores yet for squad members).
 */
function getSquadMemberAggregatedScores(squadNumber, month) {
  const allSeeds = generateSquadMemberSeedScores(squadNumber);
  const relevant = allSeeds.filter(s => s.month === month);
  if (!relevant.length) return null;

  const totals = Object.fromEntries(DIMENSIONS.map(d => [d, 0]));
  relevant.forEach(s => DIMENSIONS.forEach(d => { totals[d] += (s.scores[d] || 0); }));

  return Object.fromEntries(
    DIMENSIONS.map(d => [d, parseFloat((totals[d] / relevant.length).toFixed(2))])
  );
}

/**
 * Overall average trend for a squad member across all months.
 */
function getSquadMemberTrend(squadNumber) {
  return MONTHS.map(month => {
    const agg = getSquadMemberAggregatedScores(squadNumber, month);
    if (!agg) return null;
    const vals = Object.values(agg);
    return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
  });
}

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

const LS_CHIGIRI = 'GROW10_chigiri';
function loadChigiri(userId, dateStr) {
  const stored = localStorage.getItem(LS_CHIGIRI);
  const data = stored ? JSON.parse(stored) : [];
  return data.find(d => d.userId === userId && d.dateStr === dateStr) || { text: '' };
}
function saveChigiri(userId, dateStr, text) {
  const stored = localStorage.getItem(LS_CHIGIRI);
  const data = stored ? JSON.parse(stored) : [];
  const idx = data.findIndex(d => d.userId === userId && d.dateStr === dateStr);
  const entry = { userId, dateStr, text };
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

/** Returns true if member belongs to the given project (supports string or array). */
function _memberInProject(m, proj) {
  return Array.isArray(m.project) ? m.project.includes(proj) : m.project === proj;
}

/** Group-level dimension averages for a given month + optional project filter. */
function getGroupAverages(month, projectFilter = '全体') {
  const members = projectFilter === '全体'
    ? MEMBERS
    : MEMBERS.filter(m => _memberInProject(m, projectFilter));

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
    : MEMBERS.filter(m => _memberInProject(m, projectFilter));

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
    : MEMBERS.filter(m => _memberInProject(m, projectFilter));

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
