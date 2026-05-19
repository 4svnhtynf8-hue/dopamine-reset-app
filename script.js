/* ══════════════════════════════════════
   LYFT — DOPAMINE RESET 21
   script.js
══════════════════════════════════════ */

'use strict';

// ════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════

const STORAGE_KEY = 'lyft_dopamine_v1';

const LEVELS = [
  { l:1,  n:'Distracted Mind',      xp:0,     d:'Điểm xuất phát. Não đang trong chaos. Nhưng mày đã nhận ra — đó là bước đầu tiên.' },
  { l:2,  n:'Awakening',            xp:100,   d:'Ý thức bắt đầu hình thành. Mày thấy được vòng lặp của mình.' },
  { l:3,  n:'Pattern Breaker',      xp:250,   d:'Lần đầu phá vỡ trigger mà không fall. Não đang ghi nhận.' },
  { l:4,  n:'Withdrawal Warrior',   xp:450,   d:'Vượt qua withdrawal tuần đầu. Giai đoạn sinh lý học khó nhất.' },
  { l:5,  n:'Self-Control Initiate',xp:700,   d:'Kỷ luật không còn là ý chí thuần — nó đang trở thành hệ thống.' },
  { l:6,  n:'Clarity Seeker',       xp:1000,  d:'Đầu óc rõ hơn. Ý tưởng cho Lyft Zone bắt đầu xuất hiện.' },
  { l:7,  n:'Habit Architect',      xp:1350,  d:'Thói quen mới đang được xây. Dopamine baseline đang hạ.' },
  { l:8,  n:'Urge Slayer',          xp:1750,  d:'Mày đã defeat boss nhiều lần. Cravings yếu dần.' },
  { l:9,  n:'Mind Rewirer',         xp:2200,  d:'Neural pathways đang thay đổi. Phiên bản 2023 đang trở lại.' },
  { l:10, n:'Dopamine Survivor',    xp:2700,  d:'10 ngày sạch. Hệ thần kinh có thể tự regulate một phần.' },
  { l:11, n:'Discipline Apprentice',xp:3300,  d:'Kỷ luật không còn đòi hỏi effort như trước.' },
  { l:12, n:'Identity Shifter',     xp:4000,  d:'Mày bắt đầu thấy mình khác.' },
  { l:13, n:'Flow State Finder',    xp:4800,  d:'Deep work không còn là tra tấn. Focus đang trở lại.' },
  { l:14, n:'Neural Engineer',      xp:5700,  d:'Mày đang chủ động reshape não mình.' },
  { l:15, n:'Discipline Builder',   xp:6700,  d:'Kỷ luật là ai mày là, không phải thứ mày làm.' },
  { l:16, n:'Trigger Master',       xp:7800,  d:'Mày nhận ra trigger trước khi nó kéo vào.' },
  { l:17, n:'Dopamine Architect',   xp:9000,  d:'Mày biết tạo dopamine lành mạnh. Không cần stimulant.' },
  { l:18, n:'Identity Keeper',      xp:10300, d:'Phiên bản tốt hơn không còn là mục tiêu — nó là baseline.' },
  { l:19, n:'Resilience Forged',    xp:11700, d:'Mày đã vượt qua đủ thứ để biết mình bền hơn mình nghĩ.' },
  { l:20, n:'Sovereign Mind',       xp:13200, d:'Não mày là của mày. Không phải của dopamine.' },
  { l:21, n:'NEURAL REWIRED',       xp:14800, d:'21 ngày. Mày đã làm được. Không phải điểm kết — là điểm bắt đầu.' },
];

const EVOLUTIONS = [
  { n:'GIẢI ĐỘC',        r:[1,4],  i:'💀' },
  { n:'ỔN ĐỊNH',         r:[5,8],  i:'🧊' },
  { n:'TÁI LẬP',         r:[9,14], i:'⚡' },
  { n:'XÂY DỰNG',        r:[15,18],i:'🏗️' },
  { n:'CHUYỂN HÓA',      r:[19,21],i:'🔥' },
];

const DAILY_QUESTS = [
  { id:'meditate',    i:'🧘', n:'Thiền 10 phút',          d:'Buổi sáng hoặc trước ngủ',          xp:10 },
  { id:'workout',     i:'🏋️', n:'Workout / Pickleball',   d:'Ít nhất 30 phút vận động',          xp:20 },
  { id:'no_cannabis', i:'🚫', n:'Không mua cần sa',        d:'Không phải giảm — không mua',       xp:30 },
  { id:'no_sex',      i:'🚫', n:'Không mại dâm',           d:'Cam kết tuyệt đối',                 xp:30 },
  { id:'deep_work',   i:'🎯', n:'Deep work 25 phút',       d:'Tập trung một việc duy nhất',       xp:25 },
  { id:'read',        i:'📚', n:'Đọc sách 20 phút',        d:'Không màn hình, sách thật',         xp:15 },
  { id:'phone_limit', i:'📱', n:'Điện thoại <2h',          d:'Kiểm soát screen time',             xp:20 },
  { id:'sleep',       i:'😴', n:'Ngủ trước 11:30',         d:'Không thương lượng',                xp:15 },
  { id:'water',       i:'💧', n:'Uống đủ nước',            d:'Ít nhất 1.5L',                      xp:10 },
  { id:'gym_action',  i:'💼', n:'1 action cho Lyft Zone',  d:'Post/nhắn khách/ý tưởng',           xp:20 },
];

const WEEKLY_QUESTS = [
  { id:'wq1', n:'7 ngày không relapse',        i:'🛡️', xp:200, t:7 },
  { id:'wq2', n:'Screen time <14h tuần',        i:'📵', xp:100, t:7 },
  { id:'wq3', n:'Morning routine 5 ngày',       i:'🌅', xp:150, t:5 },
  { id:'wq4', n:'5 session deep work',          i:'🎯', xp:125, t:5 },
  { id:'wq5', n:'Thiền 7 ngày liên tục',        i:'🧘', xp:100, t:7 },
];

const BOSSES = [
  { id:'night',   i:'🌙', n:'Late Night Urge',        t:'22h–01h · Về nhà một mình sau pickleball',     s:'Về nhà → tắm ngay → ăn → thiền → ngủ. Không ra ngoài sau 22h.', hp:100 },
  { id:'scroll',  i:'📱', n:'Doomscroll Demon',        t:'Khoảng trống giữa ca · 7h+ điện thoại',       s:'Điện thoại vào ngăn kéo. Thay bằng dọn gym → đọc sách → deep work.', hp:100 },
  { id:'lonely',  i:'😶', n:'Loneliness Trigger',      t:'Cô đơn · Không ai bên cạnh · Đêm khuya',      s:'Nhắn nhân viên mới. Gọi điện. Không fill bằng mại dâm.', hp:100 },
  { id:'void',    i:'🕳️', n:'The Void',               t:'Không có gì làm · 9h–11h sáng · 1h–3h chiều', s:'Lên lịch cho khoảng trống trước. Không có kế hoạch = bị Boss kéo vào.', hp:100 },
  { id:'instant', i:'⚡', n:'Instant Gratification',   t:'Muốn kết quả ngay · Không chịu delay',         s:'20 phút rule. Craving đạt đỉnh rồi hạ. Chỉ cần chờ.', hp:100 },
  { id:'loop',    i:'🔄', n:'Relapse Loop',            t:'Đã relapse → cảm giác vô ích → relapse thêm', s:'Một lần ≠ toàn bộ. Log nó. Phân tích trigger. Tiếp tục.', hp:100 },
];

const ACHIEVEMENTS = [
  { id:'a1',  i:'⭐', n:'First Step',         d:'Ngày đầu tiên hoàn thành',        c: s => s.totalDays >= 1 },
  { id:'a2',  i:'🥉', n:'First 3 Days',       d:'3 ngày sạch liên tiếp',           c: s => s.streak >= 3 },
  { id:'a3',  i:'🥇', n:'First Week Clean',   d:'7 ngày không relapse',            c: s => s.streak >= 7 },
  { id:'a4',  i:'🌙', n:'Beat Night Trigger', d:'Counter-attack Late Night 3 lần', c: s => (s.bd['night']||0) >= 3 },
  { id:'a5',  i:'🎯', n:'10h Deep Work',      d:'600 phút focus tích lũy',         c: s => (s.totalDW||0) >= 600 },
  { id:'a6',  i:'📵', n:'No Social Day',      d:'1 ngày không mạng xã hội',        c: s => (s.noSocial||0) >= 1 },
  { id:'a7',  i:'⚔️', n:'Boss Slayer',        d:'Defeat 3 boss khác nhau',         c: s => Object.values(s.bd||{}).filter(v=>v>=3).length >= 3 },
  { id:'a8',  i:'🧘', n:'Inner Peace',        d:'Thiền 7 ngày liên tục',           c: s => (s.medStreak||0) >= 7 },
  { id:'a9',  i:'🏁', n:'Halfway',            d:'Ngày thứ 11',                     c: s => s.totalDays >= 11 },
  { id:'a10', i:'🧠', n:'Neural Rewired',     d:'Hoàn thành 21 ngày',              c: s => s.totalDays >= 21 },
  { id:'a11', i:'💰', n:'XP Hoarder',         d:'Tích lũy 1000 XP',                c: s => s.totalXP >= 1000 },
  { id:'a12', i:'🛡️', n:'Fortress',           d:'10 ngày không relapse',           c: s => s.streak >= 10 },
];

const REWARDS = [
  { i:'💆', n:'Massage 1 tiếng',         m:'Ngày 3 sạch',           ms:3,  ml:3  },
  { i:'📖', n:'Mua quyển sách mới',      m:'Level 5',               ms:0,  ml:5  },
  { i:'☕', n:'Coffee date một mình',    m:'7 ngày liên tục',       ms:7,  ml:6  },
  { i:'🏓', n:'Pickleball session đặc biệt', m:'10 deep work sessions', ms:0, ml:7 },
  { i:'🎬', n:'Movie night ở nhà',       m:'Level 10',              ms:0,  ml:10 },
  { i:'⚙️', n:'Mua gear gym mới',        m:'14 ngày sạch',          ms:14, ml:12 },
  { i:'🚗', n:'Short trip 1 ngày',       m:'21 ngày hoàn thành',    ms:21, ml:21 },
];

const JOURNAL_TYPES = {
  daily:   { label:'Ngày',    color:'var(--gray)',   bg:'rgba(255,255,255,.04)' },
  win:     { label:'Win',     color:'var(--green)',  bg:'var(--green-bg)'       },
  urge:    { label:'Urge',    color:'var(--orange)', bg:'rgba(255,159,10,.1)'   },
  insight: { label:'Nhận ra', color:'var(--blue)',   bg:'rgba(10,132,255,.1)'   },
  relapse: { label:'Relapse', color:'var(--red)',    bg:'var(--red-bg)'         },
};

const JOURNAL_PLACEHOLDERS = {
  daily:   'Viết gì đó về hôm nay...\n\nTrigger nào mày gặp? Cảm xúc nào xuất hiện?\nMày đã xử lý như thế nào? Mày học được gì?',
  win:     'Mày vừa vượt qua thứ gì?\n\nMô tả cụ thể: trigger là gì, mày làm gì để không fall, cảm giác sau đó thế nào.',
  urge:    'Ghi lại urge này...\n\nNó xuất hiện lúc mấy giờ? Mày đang làm gì? Intensity 1-10? Mày đã làm gì với nó?',
  insight: 'Mày nhận ra điều gì về bản thân hôm nay?\n\nPattern nào? Trigger mới? Cơ chế nào mày hiểu rõ hơn?',
  relapse: 'Ghi lại trung thực...\n\nBối cảnh: đang ở đâu, mấy giờ, làm gì trước đó?\nCảm xúc: cô đơn, bứt rứt, lo lắng?\nĐiểm quyết định: khoảnh khắc nào mày chuyển từ urge sang hành động?\nMày học được gì từ lần này?',
};

// ════════════════════════════════════
// STATE
// ════════════════════════════════════

function defaultState() {
  return {
    totalXP:      0,
    streak:       0,
    currentDay:   1,
    totalDays:    0,
    dailyChecked: {},   // { 'D1': ['no_cannabis', ...] }
    wqProg:       {},   // { 'wq1': 3 }
    days:         {},   // { 'D1': { checked, relapsed, xp, date } }
    relapses:     [],
    bossHP:       {},
    bd:           {},   // boss defeats
    unlockedAch:  [],
    todayXP:      0,
    medStreak:    0,
    totalDW:      0,
    noSocial:     0,
    narratives:   {},   // { 'D1': { text, ts } }
    journal:      [],
  };
}

let S = (() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState(); }
  catch { return defaultState(); }
})();

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); }
  catch (e) { console.error('Save failed:', e); }
}

// ════════════════════════════════════
// LEVEL UTILITIES
// ════════════════════════════════════

function getLvd() {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (S.totalXP >= LEVELS[i].xp) return { idx: i, ...LEVELS[i] };
  }
  return { idx: 0, ...LEVELS[0] };
}

function getXPProg() {
  const ld = getLvd();
  const ni = Math.min(ld.idx + 1, LEVELS.length - 1);
  const cb = LEVELS[ld.idx].xp;
  const nb = LEVELS[ni].xp;
  const pct = nb > cb ? Math.min(((S.totalXP - cb) / (nb - cb)) * 100, 100) : 100;
  return { pct, toNext: Math.max(0, nb - S.totalXP), nextName: LEVELS[ni].n, cb, nb };
}

function getPhase(day) {
  if (day <= 4)  return 'Detox — Survival Mode';
  if (day <= 8)  return 'Stabilization — Withdrawal Fading';
  if (day <= 14) return 'Rewiring — Neural Reset';
  if (day <= 18) return 'Building — Identity Construction';
  return 'Shift — New Baseline';
}

// ════════════════════════════════════
// DOPAMINE SCORE
// ════════════════════════════════════

function calcDopamineScore(checks) {
  const critical = ['no_cannabis', 'no_sex'];
  const allCritical = critical.every(k => checks.includes(k));
  if (!allCritical) return Math.min(checks.length * 8, 40);
  return Math.round((checks.length / DAILY_QUESTS.length) * 100);
}

function updateScoreRing(score) {
  const ring = document.getElementById('scoreRing');
  const ringText = document.getElementById('scoreRingText');
  if (!ring || !ringText) return;
  const circumference = 201;
  ring.style.strokeDashoffset = circumference - (score / 100) * circumference;
  ringText.textContent = score;

  let grade, color, desc;
  if (score >= 90) { grade = 'S — XUẤT SẮC'; color = 'var(--good)';   desc = 'Mày đang vận hành đúng hướng. Đây là ngày phiên bản 2023 tự hào.'; }
  else if (score >= 70) { grade = 'A — TỐT';  color = '#9abd6a';        desc = 'Hầu hết mọi thứ được giữ. Tiếp tục.'; }
  else if (score >= 50) { grade = 'B — ỔN';   color = 'var(--warn)';   desc = 'Giữ được phần lớn. Nhìn lại những gì chưa làm được.'; }
  else                  { grade = 'F — CẢI THIỆN'; color = 'var(--danger)'; desc = 'Nếu hai thứ cốt lõi chưa giữ được — đó là dữ liệu quan trọng.'; }

  ring.style.stroke = color;
  el('scoreGrade').textContent  = grade;
  el('scoreGrade').style.color  = color;
  el('scoreDesc').textContent   = desc;
  el('dopScoreEl').textContent  = score;
  el('dopScoreEl').style.color  = color;
}

// ════════════════════════════════════
// RENDER — CHARACTER
// ════════════════════════════════════

function renderChar() {
  const ld = getLvd();
  const xp = getXPProg();

  // Header
  if (el('headerDay')) el('headerDay').textContent = S.currentDay;

  // Character card
  if (el('charTitle')) el('charTitle').textContent = ld.n;
  if (el('levelNum'))  el('levelNum').textContent  = ld.idx + 1;

  // XP
  if (el('xpCurrent')) el('xpCurrent').textContent = (S.totalXP - xp.cb) + ' XP';
  if (el('xpToNext'))  el('xpToNext').textContent  = '→ Lv.' + (ld.idx + 2) + ' (' + xp.toNext + ' XP)';
  if (el('xpFill'))    el('xpFill').style.width    = xp.pct + '%';

  // Stats strip
  if (el('streakEl'))   el('streakEl').textContent  = S.streak;
  if (el('todayXpEl'))  el('todayXpEl').textContent = S.todayXP || 0;

  // Focus level (replaces dopamine score)
  const checked = S.dailyChecked['D' + S.currentDay] || [];
  const score   = calcDopamineScore(checked);
  const focusEl = el('focusLvEl');
  if (focusEl) {
    focusEl.textContent = score || '—';
    focusEl.className   = 'sp-val' + (score >= 70 ? ' good' : score >= 40 ? ' warn' : '');
  }

  buildProgDots();
  buildEvo();
  buildStats();
  renderMissionCard();
}

function buildProgDots() {
  const wrap = el('progDots');
  if (!wrap) return;
  wrap.innerHTML = '';
  for (let i = 1; i <= 21; i++) {
    const d = document.createElement('div');
    d.className = 'pdot';
    const dd = S.days['D' + i];
    if (dd)              { d.classList.add(dd.relapsed ? 'relapsed' : 'done'); }
    else if (i === S.currentDay) { d.classList.add('today'); }
    wrap.appendChild(d);
  }
}

function buildEvo() {
  const wrap = el('evoRow');
  if (!wrap) return;
  wrap.innerHTML = '';
  EVOLUTIONS.forEach(e => {
    const done   = S.currentDay > e.r[1];
    const active = S.currentDay >= e.r[0] && S.currentDay <= e.r[1];
    const div = document.createElement('div');
    div.className = 'evo-phase' + (done ? ' done' : active ? ' active' : '');
    div.innerHTML = `<span class="evo-icon">${e.i}</span><div class="evo-name">${e.n}</div>`;
    wrap.appendChild(div);
  });
}

function buildStats() {
  const wrap = el('statsGrid');
  if (!wrap) return;
  const medDays = Object.values(S.dailyChecked).filter(c => c && c.includes('meditate')).length;
  const woDays  = Object.values(S.dailyChecked).filter(c => c && c.includes('workout')).length;
  const rc      = S.relapses.length;

  const STATS = [
    { n:'FOCUS',            v: Math.min(100, (S.totalDW||0)/3 + medDays*3),                            c:'var(--gold)'    },
    { n:'DISCIPLINE',       v: Math.min(100, S.streak*5 + S.currentDay*2),                             c:'var(--white2)' },
    { n:'ENERGY',           v: Math.min(100, woDays*5 + 20),                                           c:'var(--green)'  },
    { n:'CALMNESS',         v: Math.min(100, medDays*6 + Math.max(0, 40 - rc*10)),                     c:'#7ab8d4'      },
    { n:'SELF-CONTROL',     v: Math.max(0, Math.min(100, S.streak*6 + S.currentDay*3 - rc*15)),        c:'var(--orange)'  },
    { n:'DOPAMINE STA.',    v: Math.max(0, Math.min(100, S.currentDay*4 + S.streak*3 - rc*20)),        c:'#b87ab8'      },
  ];

  wrap.innerHTML = STATS.map(s => {
    const v = Math.round(Math.max(0, s.v));
    return `<div class="stat-row-item">
      <div class="stat-row-label">${s.n}</div>
      <div class="stat-row-bar"><div class="stat-row-fill" style="width:${v}%;background:${s.c}"></div></div>
      <div class="stat-row-val" style="color:${s.c}">${v}</div>
    </div>`;
  }).join('');
}


// ════════════════════════════════════
// RENDER — MISSION CARD (replaces narrator on dashboard)
// ════════════════════════════════════

const MISSIONS = [
  { id:'meditate',    label:'Thiền định',         xp:10 },
  { id:'no_cannabis', label:'Không mua cần sa',    xp:30 },
  { id:'no_sex',      label:'Không mại dâm',       xp:30 },
  { id:'workout',     label:'Tập luyện',           xp:20 },
  { id:'sleep',       label:'Ngủ trước 11:30',     xp:15 },
  { id:'read',        label:'Đọc sách',            xp:15 },
  { id:'deep_work',   label:'Deep work',           xp:25 },
];

function renderMissionCard() {
  const wrap = el('missionCard');
  if (!wrap) return;
  const checked = S.dailyChecked['D' + S.currentDay] || [];
  wrap.innerHTML = MISSIONS.map(m => {
    const done = checked.includes(m.id);
    return `<div class="mission-item${done ? ' done' : ''}" onclick="toggleMission('${m.id}',this)">
      <div class="mission-check"></div>
      <div class="mission-label">${m.label}</div>
      <div class="mission-xp">+${m.xp}</div>
    </div>`;
  }).join('');
}

function toggleMission(id, itemEl) {
  const key = 'D' + S.currentDay;
  if (!S.dailyChecked[key]) S.dailyChecked[key] = [];
  const idx = S.dailyChecked[key].indexOf(id);
  if (idx > -1) {
    S.dailyChecked[key].splice(idx, 1);
    itemEl.classList.remove('done');
  } else {
    S.dailyChecked[key].push(id);
    itemEl.classList.add('done');
  }
  save();
  // Sync quest panel too
  const qItem = document.querySelector(`[onclick*="toggleQuest('${id}'"]`);
  if (qItem) {
    if (S.dailyChecked[key].includes(id)) qItem.classList.add('completed');
    else qItem.classList.remove('completed');
  }
  renderChar();
}

// ════════════════════════════════════
// RENDER — QUESTS
// ════════════════════════════════════

function renderQuests() {
  if (el('questDayNum')) el('questDayNum').textContent = S.currentDay;

  const checked = S.dailyChecked['D' + S.currentDay] || [];

  el('dqList').innerHTML = DAILY_QUESTS.map(q => {
    const done = checked.includes(q.id);
    return `<div class="quest-item${done ? ' completed' : ''}" onclick="toggleQuest('${q.id}',this)">
      <div class="quest-icon">${q.i}</div>
      <div class="quest-info">
        <div class="quest-name">${q.n}</div>
        <div class="quest-desc">${q.d}</div>
      </div>
      <div class="quest-xp">+${q.xp}</div>
    </div>`;
  }).join('');

  el('wqList').innerHTML = WEEKLY_QUESTS.map(q => {
    const prog = S.wqProg[q.id] || 0;
    const pct  = Math.min(100, (prog / q.t) * 100);
    const done = prog >= q.t;
    return `<div class="wq-item${done ? ' completed' : ''}">
      <div class="quest-icon">${q.i}</div>
      <div class="wq-info">
        <div class="wq-name">${q.n}</div>
        <div class="wq-prog-track"><div class="wq-prog-fill" style="width:${pct}%"></div></div>
        <div class="wq-count">${prog}/${q.t}</div>
      </div>
      <div class="wq-xp">${done ? '✓' : '+' + q.xp}</div>
    </div>`;
  }).join('');

  renderRewards();
}

function toggleQuest(id, el_) {
  const key = 'D' + S.currentDay;
  if (!S.dailyChecked[key]) S.dailyChecked[key] = [];
  const idx = S.dailyChecked[key].indexOf(id);
  if (idx > -1) { S.dailyChecked[key].splice(idx, 1); el_.classList.remove('completed'); }
  else          { S.dailyChecked[key].push(id);        el_.classList.add('completed'); }
  save();
  const checked = S.dailyChecked[key];
  updateScoreRing(calcDopamineScore(checked));
}

function renderRewards() {
  const ld = getLvd();
  const lvl = ld.idx + 1;
  const wrap = el('rewardList');
  if (!wrap) return;
  wrap.innerHTML = REWARDS.map(r => {
    const unlocked = S.streak >= r.ms && lvl >= r.ml;
    return `<div class="reward-item${unlocked ? ' unlocked' : ''}">
      <div class="reward-lock">🔒</div>
      <div class="reward-icon">${r.i}</div>
      <div>
        <div class="reward-name">${r.n}</div>
        <div class="reward-ms">${unlocked ? '✓ Đã mở' : 'Mở khoá: ' + r.m}</div>
      </div>
    </div>`;
  }).join('');
}

// ════════════════════════════════════
// SUBMIT DAY
// ════════════════════════════════════

async function submitDay() {
  const key     = 'D' + S.currentDay;
  const checked = S.dailyChecked[key] || [];
  if (!checked.length) { showToast('Check ít nhất 1 quest.'); return; }

  let xpGained = 0;
  checked.forEach(id => {
    const q = DAILY_QUESTS.find(q => q.id === id);
    if (q) xpGained += q.xp;
  });

  const relapsed = !checked.includes('no_cannabis') || !checked.includes('no_sex');

  // Update weekly progress
  if (checked.includes('meditate'))    { S.wqProg['wq5'] = (S.wqProg['wq5']||0) + 1; S.medStreak = (S.medStreak||0) + 1; }
  else                                   { S.medStreak = 0; }
  if (checked.includes('deep_work'))   { S.totalDW   = (S.totalDW||0) + 25; S.wqProg['wq4'] = (S.wqProg['wq4']||0) + 1; }
  if (checked.includes('phone_limit')) { S.wqProg['wq2'] = (S.wqProg['wq2']||0) + 1; S.noSocial = (S.noSocial||0) + 1; }
  if (!relapsed)                         { S.wqProg['wq1'] = (S.wqProg['wq1']||0) + 1; }

  const prevLevel = getLvd().idx;

  S.totalXP += xpGained;
  S.todayXP  = xpGained;
  if (!relapsed) { S.streak++; }
  else           { S.streak = 0; S.totalXP = Math.max(0, S.totalXP - 50); }

  S.days[key] = {
    checked,
    relapsed,
    xp:   xpGained,
    date: new Date().toLocaleDateString('vi-VN'),
    day:  S.currentDay,
  };

  S.currentDay = Math.min(S.currentDay + 1, 22);
  S.totalDays++;
  save();
  checkAchievements();

  // Generate narrative for completed day
  await generateNarrative(true);

  const newLevel = getLvd().idx;
  if (newLevel > prevLevel) {
    showLevelUp(LEVELS[newLevel]);
  } else {
    showXPFlash('+' + (relapsed ? xpGained - 50 : xpGained) + ' XP');
  }

  if (relapsed) showDmg('-50 XP 💀');

  renderAll();
  showToast(relapsed
    ? '⚠ Relapse ghi nhận. -50 XP. Streak reset. Tiếp tục.'
    : '✅ +' + xpGained + ' XP! Streak: ' + S.streak + ' 🔥'
  );
}

// ════════════════════════════════════
// RENDER — BOSSES
// ════════════════════════════════════

function renderBosses() {
  const wrap = el('bossList');
  if (!wrap) return;
  wrap.innerHTML = BOSSES.map(b => {
    const hp     = S.bossHP[b.id] !== undefined ? S.bossHP[b.id] : 100;
    const def    = S.bd[b.id] || 0;
    const dead   = def >= 3;
    return `<div class="boss-card${dead ? ' defeated' : ''}">
      <div class="boss-header">
        <div class="boss-icon">${b.i}</div>
        <div>
          <div class="boss-name">${b.n}</div>
          <div class="boss-trigger">${b.t}</div>
        </div>
      </div>
      <div class="boss-hp-track">
        <div class="boss-hp-fill" style="width:${dead ? 0 : hp}%"></div>
      </div>
      <div class="boss-meta">
        <span>HP: ${dead ? 0 : Math.round(hp)}%</span>
        <span>DEFEATS: ${def}/3 ${def >= 3 ? '✓' : ''}</span>
      </div>
      <div class="boss-strategy">${b.s}</div>
      <button class="boss-btn" onclick="hitBoss('${b.id}')" ${dead ? 'disabled' : ''}>
        ${dead ? '★ BOSS DEFEATED' : '⚔ COUNTER-ATTACK (+30 XP)'}
      </button>
    </div>`;
  }).join('');
}

function hitBoss(id) {
  if (S.bossHP[id] === undefined) S.bossHP[id] = 100;
  S.bossHP[id] = Math.max(0, S.bossHP[id] - 35);

  const prevLvl = getLvd().idx;
  S.totalXP += 30;

  if (S.bossHP[id] === 0) {
    S.bd[id] = (S.bd[id] || 0) + 1;
    S.bossHP[id] = 100;
    save();
    checkAchievements();
    const nl = getLvd().idx;
    if (nl > prevLvl) showLevelUp(LEVELS[nl]);
    else showXPFlash('+30 XP ⚔');
    showToast('💀 ' + BOSSES.find(b => b.id === id).n + ' DEFEATED! +30 XP');
  } else {
    save();
    showXPFlash('+30 XP');
    showToast('⚔ Hit landed. Boss HP: ' + Math.round(S.bossHP[id]) + '%');
  }
  renderBosses();
  renderChar();
}

// ════════════════════════════════════
// RENDER — ACHIEVEMENTS
// ════════════════════════════════════

function checkAchievements() {
  ACHIEVEMENTS.forEach(a => {
    if (!S.unlockedAch.includes(a.id) && a.c(S)) {
      S.unlockedAch.push(a.id);
      save();
      setTimeout(() => showToast('🏆 ACHIEVEMENT: ' + a.n), 1500);
    }
  });
}

function renderAchievements() {
  const wrap = el('achGrid');
  if (!wrap) return;
  wrap.innerHTML = ACHIEVEMENTS.map(a => {
    const u = S.unlockedAch.includes(a.id);
    return `<div class="ach-item${u ? ' unlocked' : ''}">
      <span class="ach-icon">${a.i}</span>
      <div class="ach-name">${a.n}</div>
      <div class="ach-lock">${u ? '✓ UNLOCKED' : a.d}</div>
    </div>`;
  }).join('');
}

// ════════════════════════════════════
// RELAPSE
// ════════════════════════════════════

function logRelapse() {
  const type = document.getElementById('rType').value;
  const note = document.getElementById('rNote').value;
  S.relapses.push({
    type, note,
    day:  S.currentDay,
    time: new Date().toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' }),
  });
  S.totalXP = Math.max(0, S.totalXP - 50);
  S.streak  = 0;
  save();
  document.getElementById('rNote').value = '';
  closeModal('relapseModal');
  showDmg('-50 XP 💀');
  generateNarrative(true);
  renderAll();
  showToast('Relapse logged. -50 XP. Streak reset. Một lần không phải toàn bộ.');
}

// ════════════════════════════════════
// AI NARRATOR
// ════════════════════════════════════

async function generateNarrative(force = false) {
  const dayKey = 'D' + S.currentDay;
  if (!force && S.narratives[dayKey]) {
    displayNarrative(S.narratives[dayKey]);
    return;
  }

  setNarrLoading('narrText');

  const ld      = getLvd();
  const checked = S.dailyChecked[dayKey] || [];
  const checkNames = checked.map(id => { const q = DAILY_QUESTS.find(q => q.id === id); return q ? q.n : id; }).join(', ');
  const bossDefeats = Object.entries(S.bd || {}).filter(([,v]) => v >= 1).map(([k]) => {
    const b = BOSSES.find(b => b.id === k); return b ? b.n : k;
  }).join(', ');

  const prompt = `TRẠNG THÁI NHÂN VẬT:
- Tên: Chí Đạt
- Ngày trong chương trình: ${S.currentDay}/21
- Level: ${ld.idx+1} — ${ld.n}
- Phase: ${getPhase(S.currentDay)}
- Streak sạch: ${S.streak} ngày
- Tổng XP: ${S.totalXP}
- Tổng ngày hoàn thành: ${S.totalDays}
- Tổng relapse: ${S.relapses.length}
- Meditation streak: ${S.medStreak} ngày
- Total deep work: ${S.totalDW} phút
- Boss đã defeat: ${bossDefeats || 'chưa có'}
- Quests hoàn thành hôm nay: ${checkNames || 'chưa có'}

Tạo narrative 3-4 câu phân tích trạng thái tâm lý và thần kinh hiện tại của Chí Đạt. Giọng điều tra viên lạnh, chính xác, psychological depth.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `Bạn là AI Narrator cho hệ thống dopamine reset của Chí Đạt — PT 28 tuổi, đang cai cần sa 6-7 năm, dừng mại dâm 4-5 lần/tuần, cắt điện thoại 7h+/ngày. Sống một mình trong phòng gym ở TP.HCM, mới chia tay sau 6 năm.

Phong cách: dark futuristic, psychological depth, lạnh, chính xác. Không cringe. Không sáo rỗng. Không emoji trong text. Tiếng Việt. Giọng điều tra viên phân tích một case.`,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    const text = data.content && data.content[0] ? data.content[0].text : '[Narrator offline.]';
    S.narratives[dayKey] = { text, ts: Date.now(), day: S.currentDay };
    save();
    displayNarrative(S.narratives[dayKey]);
  } catch {
    displayNarrative({ text: '[Narrator offline. Dữ liệu hành vi hôm nay vẫn được ghi nhận.]', ts: Date.now() });
  }
}

function setNarrLoading(elId) {
  const e = el(elId);
  if (e) e.innerHTML = '<span class="loading-text">Đang phân tích <span class="ldots"><span>.</span><span>.</span><span>.</span></span></span>';
}

function displayNarrative(narr) {
  const narrEl  = el('narrText');
  const metaEl  = el('narrMeta');
  if (!narrEl || !narr) return;
  narrEl.innerHTML = formatNarrText(narr.text || '');
  if (metaEl && narr.ts) {
    metaEl.textContent = new Date(narr.ts).toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' });
  }
}

function formatNarrText(text) {
  return text
    .replace(/Chí Đạt/g,    '<span class="hl">Chí Đạt</span>')
    .replace(/relapse/gi,   '<span class="dw">relapse</span>')
    .replace(/Lyft Zone/g,  '<span class="hl">Lyft Zone</span>')
    .replace(/(\+\d+ XP)/g, '<span class="xpw">$1</span>');
}

async function generateQuestNarrative() {
  setNarrLoading('questNarrText');
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'Bạn là AI Narrator viết mission brief cho ngày tập luyện của Chí Đạt. Ngắn gọn, dark military briefing, 2-3 câu. Không emoji. Tiếng Việt.',
        messages: [{ role: 'user', content: `Ngày ${S.currentDay}/21. Phase: ${getPhase(S.currentDay)}. Streak: ${S.streak} ngày sạch. Viết mission brief.` }]
      })
    });
    const data = await res.json();
    const t = data.content && data.content[0] ? data.content[0].text : 'Hệ thống sẵn sàng. Mỗi quest là một synapse được củng cố.';
    el('questNarrText').innerHTML = formatNarrText(t);
    el('questNarrDay').textContent = 'NGÀY ' + S.currentDay;
  } catch {
    el('questNarrText').textContent = 'Mission brief offline. Dữ liệu hành vi vẫn được ghi nhận.';
  }
}

async function generateBossNarrative() {
  setNarrLoading('bossNarrText');
  try {
    const active = BOSSES.filter(b => !(S.bd[b.id] >= 3)).map(b => b.n).join(', ');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'Bạn là AI Narrator viết field report về chiến trường nội tâm của Chí Đạt. Dark psychological. 2-3 câu. Không emoji. Tiếng Việt.',
        messages: [{ role: 'user', content: `Boss active: ${active || 'không có'}. Streak: ${S.streak}. Viết field report.` }]
      })
    });
    const data = await res.json();
    const t = data.content && data.content[0] ? data.content[0].text : 'Chiến trường đang trong trạng thái active.';
    el('bossNarrText').innerHTML = formatNarrText(t);
  } catch {
    el('bossNarrText').textContent = 'Field report offline.';
  }
}

async function showLevelUp(lvl) {
  if(el('luNum'))  el('luNum').textContent  = LEVELS.indexOf(lvl) + 1;
  if(el('luName')) el('luName').textContent = lvl.n;
  if(el('luDesc')) el('luDesc').textContent = lvl.d;
  el('luOverlay').classList.add('active');
}

function closeLU() { el('luOverlay').classList.remove('active'); }

// ════════════════════════════════════
// JOURNAL
// ════════════════════════════════════

let currentJType   = 'daily';
let currentJMood   = '';
let currentJFilter = 'all';
let aiReplyEnabled = true;

function setJType(type, btn) {
  currentJType = type;
  document.querySelectorAll('.jtype').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  el('journalText').placeholder = JOURNAL_PLACEHOLDERS[type] || '';
}

function selectJMood(mood, btn) {
  currentJMood = currentJMood === mood ? '' : mood;
  document.querySelectorAll('.jmood').forEach(b => b.classList.remove('selected'));
  if (currentJMood) btn.classList.add('selected');
}

function updateCharCount() {
  const len = document.getElementById('journalText').value.length;
  el('charCount').textContent = len;
}

function toggleAI() {
  aiReplyEnabled = !aiReplyEnabled;
  const track = el('aiTrack');
  if (aiReplyEnabled) track.classList.add('active');
  else                track.classList.remove('active');
}

async function saveJournalEntry() {
  const text = document.getElementById('journalText').value.trim();
  if (!text) { showToast('Viết gì đó trước khi lưu.'); return; }

  const entry = {
    id:      Date.now(),
    type:    currentJType,
    text,
    mood:    currentJMood,
    day:     S.currentDay,
    date:    new Date().toLocaleDateString('vi-VN'),
    time:    new Date().toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' }),
    aiReply: null,
  };

  if (!S.journal) S.journal = [];
  S.journal.unshift(entry);
  S.totalXP += 5;
  save();

  document.getElementById('journalText').value = '';
  currentJMood = '';
  document.querySelectorAll('.jmood').forEach(b => b.classList.remove('selected'));
  updateCharCount();

  showXPFlash('+5 XP ✍️');
  showToast('Entry đã lưu. +5 XP');
  renderJournal();
  renderChar();

  if (aiReplyEnabled) await generateJournalReply(entry.id);
}

async function generateJournalReply(entryId) {
  const entry = S.journal.find(e => e.id === entryId);
  if (!entry) return;

  const typeCtx = { daily:'nhật ký ngày thường', win:'chiến thắng vượt trigger', urge:'ghi nhận urge', insight:'insight bản thân', relapse:'ghi nhận relapse' };

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `Bạn là AI Narrator phản hồi nhật ký của Chí Đạt. Phân tích tâm lý ngắn gọn, lạnh, chính xác — như clinician đọc case note. Tối đa 3 câu. Không emoji. Tiếng Việt. Không sáo rỗng.`,
        messages: [{
          role: 'user',
          content: `Loại: ${typeCtx[entry.type]}\nNgày ${entry.day}/21 — Streak: ${S.streak}\n\n"${entry.text}"\n\nPhản hồi ngắn gọn.`
        }]
      })
    });
    const data = await res.json();
    const reply = data.content && data.content[0] ? data.content[0].text : null;
    if (reply) {
      const idx = S.journal.findIndex(e => e.id === entryId);
      if (idx > -1) { S.journal[idx].aiReply = reply; save(); }
      renderJournal();
    }
  } catch {
    const idx = S.journal.findIndex(e => e.id === entryId);
    if (idx > -1) { S.journal[idx].aiReply = '[Narrator offline.]'; save(); }
    renderJournal();
  }
}

function deleteJournalEntry(id) {
  if (!confirm('Xóa entry này?')) return;
  S.journal = (S.journal || []).filter(e => e.id !== id);
  save();
  renderJournal();
  showToast('Entry đã xóa.');
}

function filterJ(type, btn) {
  currentJFilter = type;
  document.querySelectorAll('.jfilter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderJournalEntries();
}

function renderJournal() {
  renderJournalStats();
  renderJournalEntries();
}

function renderJournalStats() {
  const entries  = S.journal || [];
  const total    = entries.length;
  const wins     = entries.filter(e => e.type === 'win').length;
  const insights = entries.filter(e => e.type === 'insight').length;
  const urges    = entries.filter(e => e.type === 'urge').length;
  const wrap = el('jstats');
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="jstat-box"><div class="jstat-num" style="color:var(--antique)">${total}</div><div class="jstat-lbl">Entries</div></div>
    <div class="jstat-box"><div class="jstat-num" style="color:var(--good)">${wins}</div><div class="jstat-lbl">Wins</div></div>
    <div class="jstat-box"><div class="jstat-num" style="color:var(--narr)">${insights}</div><div class="jstat-lbl">Insights</div></div>
    <div class="jstat-box"><div class="jstat-num" style="color:var(--warn)">${urges}</div><div class="jstat-lbl">Urges</div></div>
  `;
}

function renderJournalEntries() {
  const wrap = el('journalEntries');
  if (!wrap) return;
  let entries = S.journal || [];
  if (currentJFilter !== 'all') entries = entries.filter(e => e.type === currentJFilter);
  if (!entries.length) { wrap.innerHTML = '<div class="empty-state">Không có entry nào.</div>'; return; }

  wrap.innerHTML = entries.map(entry => {
    const cfg = JOURNAL_TYPES[entry.type] || JOURNAL_TYPES.daily;
    const aiBlock = entry.aiReply
      ? `<div class="je-ai">${escHtml(entry.aiReply)}</div>`
      : '';
    return `<div class="journal-entry je-${entry.type}" data-entry-id="${entry.id}">
      <button class="je-delete" onclick="deleteJournalEntry(${entry.id})">✕</button>
      <div class="je-header">
        <div class="je-meta">
          <div class="je-day">NGÀY ${entry.day} — ${entry.date}</div>
          <div class="je-time">${entry.time}</div>
        </div>
        <span class="je-badge" style="background:${cfg.bg};color:${cfg.color}">${cfg.label}</span>
      </div>
      <div class="je-body">${escHtml(entry.text)}</div>
      ${entry.mood ? `<div class="je-mood">${entry.mood}</div>` : ''}
      ${aiBlock}
    </div>`;
  }).join('');
}

// ════════════════════════════════════
// RENDER — HISTORY
// ════════════════════════════════════

function renderHistory() {
  buildGrid21();
  buildWeekStats();
  buildNarrHistory();
}

function buildGrid21() {
  const wrap = el('grid21');
  if (!wrap) return;
  wrap.innerHTML = '';
  for (let i = 1; i <= 21; i++) {
    const cell = document.createElement('div');
    cell.className = 'g21-cell';
    const d = S.days['D' + i];
    if (d) {
      cell.classList.add(d.relapsed ? 'relapsed' : 'clean');
      cell.textContent = d.relapsed ? '✗' : '✓';
    } else {
      cell.textContent = i;
      if (i === S.currentDay) cell.classList.add('today');
    }
    wrap.appendChild(cell);
  }
}

function buildWeekStats() {
  const wrap = el('weekStats');
  if (!wrap) return;
  let clean = 0, relapsed = 0;
  Object.values(S.days).forEach(d => { if (d.relapsed) relapsed++; else clean++; });
  wrap.innerHTML = `
    <div class="stat-pill"><div class="sp-val good">${clean}</div><div class="sp-lbl">Ngày sạch</div></div>
    <div class="stat-pill"><div class="sp-val" style="color:var(--red)">${relapsed}</div><div class="sp-lbl">Relapse</div></div>
    <div class="stat-pill"><div class="sp-val gold">${S.relapses.length}</div><div class="sp-lbl">Tổng log</div></div>
  `;
}

function buildNarrHistory() {
  const wrap = el('narrativeHistory');
  if (!wrap) return;
  const keys = Object.keys(S.narratives).sort((a, b) => parseInt(b.replace('D','')) - parseInt(a.replace('D','')));
  if (!keys.length) { wrap.innerHTML = '<div class="empty-state">Hoàn thành ngày đầu tiên để bắt đầu.</div>'; return; }

  const checkMap = { no_cannabis:'🚫', no_sex:'🚫', meditate:'🧘', workout:'🏋️', deep_work:'🎯', read:'📚', phone_limit:'📱', sleep:'😴', water:'💧', gym_action:'💼' };

  wrap.innerHTML = keys.map(k => {
    const n  = S.narratives[k];
    const d  = S.days[k];
    const st = d ? (d.relapsed ? 'relapsed' : 'clean') : 'partial';
    const xp = d ? d.xp : 0;
    const badgeStyle = st === 'clean'
      ? 'background:var(--green-bg);color:var(--green)'
      : st === 'relapsed'
      ? 'background:var(--red-bg);color:var(--red)'
      : 'background:rgba(255,159,10,.1);color:var(--orange)';
    const badge = st === 'clean' ? 'CLEAN' : st === 'relapsed' ? 'RELAPSED' : 'PARTIAL';
    const checks = d ? d.checked || [] : [];

    return `<div class="narr-history-item ${st}">
      <div class="narr-h-header">
        <div class="narr-h-day">${k.replace('D','NGÀY ')}</div>
        <span class="narr-h-badge" style="${badgeStyle}">${badge}${xp ? ' · +'+xp+' XP' : ''}</span>
      </div>
      <div class="narr-h-text">${formatNarrText(n.text)}</div>
      <div class="narr-h-checks">
        ${Object.entries(checkMap).map(([id, icon]) =>
          `<div class="narr-h-check${checks.includes(id) ? ' done' : ''}" title="${id}">${icon}</div>`
        ).join('')}
      </div>
    </div>`;
  }).join('');
}

// ════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════

function switchTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  switchPanelContent(name);
}

function switchPanel(name, btn) {
  document.querySelectorAll('.bni').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  switchPanelContent(name);
}

function switchPanelContent(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const panel = el('panel-' + name);
  if (panel) panel.classList.add('active');
  window.scrollTo(0, 0);

  if (name === 'checkin') { renderQuests(); }
  if (name === 'boss')    { renderBosses(); renderAchievements(); generateBossNarrative(); }
  if (name === 'journal') renderJournal();
  if (name === 'history') renderHistory();
}

// ════════════════════════════════════
// EMERGENCY MODE
// ════════════════════════════════════

let cdInterval = null;
let cdSeconds  = 1200;

function openEM() {
  const em = el('emergency');
  if (em) em.classList.add('active');
}

function closeEM() {
  el('emergency').classList.remove('active');
  clearInterval(cdInterval);
  cdSeconds = 1200;
  el('cdNum').textContent = '20:00';
}

function startCD() {
  clearInterval(cdInterval);
  cdInterval = setInterval(() => {
    cdSeconds--;
    const m = String(Math.floor(cdSeconds / 60)).padStart(2, '0');
    const s = String(cdSeconds % 60).padStart(2, '0');
    el('cdNum').textContent = m + ':' + s;
    if (cdSeconds <= 0) {
      clearInterval(cdInterval);
      el('cdNum').textContent = 'XONG ✓';
    }
  }, 1000);
}

function resetCD() {
  clearInterval(cdInterval);
  cdSeconds = 1200;
  el('cdNum').textContent = '20:00';
}

// ════════════════════════════════════
// MODALS
// ════════════════════════════════════

function openModal(id) { if(el(id)) el(id).classList.add('active'); }
function closeModal(id) { if(el(id)) el(id).classList.remove('active'); }

document.addEventListener('click', e => {
  document.querySelectorAll('.modal-backdrop.active').forEach(m => {
    if (e.target === m) m.classList.remove('active');
  });
});

// ════════════════════════════════════
// UI HELPERS
// ════════════════════════════════════

function el(id) { return document.getElementById(id); }

function showXPFlash(text) {
  const e = el('xpFlash');
  e.textContent = text;
  e.classList.add('show');
  setTimeout(() => e.classList.remove('show'), 900);
}

function showDmg(text) {
  const e = el('dmgPopup');
  e.textContent = text;
  e.classList.add('show');
  setTimeout(() => e.classList.remove('show'), 1000);
}

function showToast(msg) {
  const e = el('toast');
  e.textContent = msg;
  e.classList.add('show');
  setTimeout(() => e.classList.remove('show'), 3500);
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ════════════════════════════════════
// RENDER ALL + INIT
// ════════════════════════════════════

function renderAll() {
  renderChar();
  renderQuests();
  renderBosses();
  renderAchievements();
  renderJournal();
  renderHistory();
}

// Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(() => console.log('SW registered'))
      .catch(err => console.log('SW failed:', err));
  });
}

// Handle backdrop click for modals
function handleBackdrop(e, id) {
  if (e.target === e.currentTarget) closeModal(id);
}

// Fix AI toggle for new HTML
function toggleAI() {
  aiReplyEnabled = !aiReplyEnabled;
  const t = el('aiToggle');
  if (t) t.classList.toggle('on', aiReplyEnabled);
}

// Boot
renderAll();
