/* AJ XO 3D — script.js
   Pure logic (testable in Node) + UI/Audio/Storage (browser). No external libraries. */
(function (root) {
'use strict';

/* ================================================================
   1) GAME LOGIC
   ================================================================ */
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const otherOf = s => (s === 'X' ? 'O' : 'X');
const rnd = arr => arr[Math.floor(Math.random() * arr.length)];

function winnerOf(b) {
  for (const l of LINES) {
    const a = b[l[0]];
    if (a && a === b[l[1]] && a === b[l[2]]) return { player: a, line: l };
  }
  return null;
}
const isFull = b => b.every(Boolean);
const empties = b => { const r = []; for (let i = 0; i < 9; i++) if (!b[i]) r.push(i); return r; };

function minimax(b, turn, ai, alpha, beta, depth) {
  const w = winnerOf(b);
  if (w) return w.player === ai ? 10 - depth : depth - 10;
  if (isFull(b)) return 0;
  const opp = otherOf(ai);
  if (turn === ai) {
    let best = -Infinity;
    for (const i of empties(b)) {
      b[i] = ai;
      best = Math.max(best, minimax(b, opp, ai, alpha, beta, depth + 1));
      b[i] = null;
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const i of empties(b)) {
    b[i] = opp;
    best = Math.min(best, minimax(b, ai, ai, alpha, beta, depth + 1));
    b[i] = null;
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function bestMove(b, ai) {
  const free = empties(b);
  if (free.length === 9) return rnd([0, 2, 4, 6, 8]);
  let best = -Infinity, moves = [];
  for (const i of free) {
    b[i] = ai;
    const s = minimax(b, otherOf(ai), ai, -Infinity, Infinity, 1);
    b[i] = null;
    if (s > best) { best = s; moves = [i]; } else if (s === best) moves.push(i);
  }
  return rnd(moves);
}

function findWin(b, p) {
  for (const i of empties(b)) {
    b[i] = p;
    const w = winnerOf(b);
    b[i] = null;
    if (w && w.player === p) return i;
  }
  return -1;
}

function aiMove(b, ai, level) {
  const free = empties(b);
  if (!free.length) return -1;
  const human = otherOf(ai);
  if (level === 'hard') return bestMove(b, ai);
  if (level === 'medium') {
    if (Math.random() < 0.12) return rnd(free);              // occasional slip
    const win = findWin(b, ai); if (win >= 0) return win;
    const block = findWin(b, human); if (block >= 0 && Math.random() < 0.85) return block;
    if (!b[4] && Math.random() < 0.6) return 4;
    const corners = [0, 2, 6, 8].filter(i => !b[i]);
    if (corners.length && Math.random() < 0.5) return rnd(corners);
    return rnd(free);
  }
  // easy
  if (Math.random() < 0.25) { const win = findWin(b, ai); if (win >= 0) return win; }
  if (Math.random() < 0.15) { const block = findWin(b, human); if (block >= 0) return block; }
  return rnd(free);
}

const Logic = { LINES, winnerOf, isFull, empties, minimax, bestMove, findWin, aiMove, otherOf };
if (typeof module !== 'undefined' && module.exports) module.exports = Logic;
if (typeof document === 'undefined') return;

/* ================================================================
   2) I18N
   ================================================================ */
const I18N = {
  ar: {
    tagline: 'لعبة XO بأبعاد المستقبل', playAI: 'اللعب ضد الكمبيوتر', playPvP: 'لاعبان على نفس الجهاز',
    stats: 'الإحصائيات', settings: 'الإعدادات', chooseLevel: 'اختر المستوى',
    easy: 'سهل', medium: 'متوسط', hard: 'صعب',
    easyD: 'مريح للمبتدئين، يرتكب أخطاء كثيرة', mediumD: 'يهاجم ويدافع لكنه يخطئ أحياناً', hardD: 'خوارزمية Minimax — لا يُهزم',
    yourSide: 'اختر رمزك', firstNote: 'يبدأ X دائماً', start: 'ابدأ اللعب',
    you: 'أنت', computer: 'الكمبيوتر', player1: 'اللاعب 1', player2: 'اللاعب 2', draws: 'تعادل',
    yourTurn: 'دورك', pcThinking: 'الكمبيوتر يفكر…', turnOf: 'دور {n}',
    youWin: 'فزت!', youLose: 'خسرت', drawT: 'تعادل!', playerWins: 'فاز {n}!',
    winText: 'أداء رائع، انتصار مستحق.', loseText: 'الكمبيوتر كان أسرع هذه المرة. جرّب من جديد!', drawText: 'لا فائز هذه المرة، مواجهة متكافئة.',
    pvWinText: 'مبروك على الفوز!',
    replay: 'إعادة اللعب', mainMenu: 'القائمة الرئيسية', vsPc: 'ضد الكمبيوتر', pvp: 'لاعبان',
    games: 'المباريات', winRate: 'نسبة الفوز', bestStreak: 'أفضل سلسلة', wins: 'انتصارات', losses: 'خسائر', drawsS: 'تعادلات',
    vsPcSec: 'ضد الكمبيوتر', byMode: 'حسب النمط', history: 'آخر المباريات', noHistory: 'لا توجد مباريات بعد. ابدأ اللعب لتظهر نتائجك هنا.',
    pvpNote: 'في نمط اللاعبين: الفوز للاعب 1 والخسارة للاعب 2.',
    resetStats: 'مسح الإحصائيات', confirmReset: 'هل تريد حذف جميع الإحصائيات نهائياً؟', yes: 'نعم، احذف', cancel: 'إلغاء',
    sound: 'المؤثرات الصوتية', music: 'الموسيقى', volume: 'مستوى الصوت', vibration: 'الاهتزاز', tilt: 'إمالة اللوحة ثلاثية الأبعاد',
    language: 'اللغة', colors: 'ألوان اللعبة', mute: 'الصوت'
  },
  en: {
    tagline: 'XO, in the third dimension', playAI: 'Play vs Computer', playPvP: 'Two Players, One Device',
    stats: 'Statistics', settings: 'Settings', chooseLevel: 'Choose difficulty',
    easy: 'Easy', medium: 'Medium', hard: 'Hard',
    easyD: 'Relaxed play, makes plenty of mistakes', mediumD: 'Attacks and defends, but slips now and then', hardD: 'Minimax algorithm — unbeatable',
    yourSide: 'Choose your side', firstNote: 'X always moves first', start: 'Start game',
    you: 'You', computer: 'Computer', player1: 'Player 1', player2: 'Player 2', draws: 'Draws',
    yourTurn: 'Your turn', pcThinking: 'Computer is thinking…', turnOf: "{n}'s turn",
    youWin: 'You win!', youLose: 'You lost', drawT: "It's a draw!", playerWins: '{n} wins!',
    winText: 'Brilliant play. Well earned.', loseText: 'The computer got you this time. Try again!', drawText: 'No winner this time — evenly matched.',
    pvWinText: 'Congratulations on the win!',
    replay: 'Play again', mainMenu: 'Main menu', vsPc: 'vs Computer', pvp: 'Two players',
    games: 'Games', winRate: 'Win rate', bestStreak: 'Best streak', wins: 'Wins', losses: 'Losses', drawsS: 'Draws',
    vsPcSec: 'Against the computer', byMode: 'By mode', history: 'Recent games', noHistory: 'No games yet. Play a match and your results will show up here.',
    pvpNote: 'In two-player mode: a win is Player 1, a loss is Player 2.',
    resetStats: 'Reset statistics', confirmReset: 'Delete all statistics permanently?', yes: 'Yes, delete', cancel: 'Cancel',
    sound: 'Sound effects', music: 'Music', volume: 'Volume', vibration: 'Vibration', tilt: '3D board tilt',
    language: 'Language', colors: 'Game colors', mute: 'Sound'
  }
};

/* ================================================================
   3) STORAGE (LocalStorage, always guarded)
   ================================================================ */
const KEY_S = 'ajxo3d_settings_v1', KEY_T = 'ajxo3d_stats_v1';
const Store = {
  get(k, d) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
};
const DEF_SETTINGS = { lang: 'ar', sound: true, music: true, vol: 0.7, vibe: true, tilt: true, theme: 'neon', level: 'medium', side: 'X' };
const MODES = ['ai_easy', 'ai_medium', 'ai_hard', 'pvp'];
function freshStats() {
  const s = { modes: {}, streak: 0, best: 0, history: [] };
  MODES.forEach(m => { s.modes[m] = { w: 0, l: 0, d: 0 }; });
  return s;
}
let S = Object.assign({}, DEF_SETTINGS, Store.get(KEY_S, {}));
let T = (function () {
  const saved = Store.get(KEY_T, null), base = freshStats();
  if (!saved || typeof saved !== 'object') return base;
  MODES.forEach(m => { const x = saved.modes && saved.modes[m]; if (x) base.modes[m] = { w: +x.w || 0, l: +x.l || 0, d: +x.d || 0 }; });
  base.streak = +saved.streak || 0; base.best = +saved.best || 0;
  base.history = Array.isArray(saved.history) ? saved.history.slice(0, 30) : [];
  return base;
})();
const saveS = () => Store.set(KEY_S, S);
const saveT = () => Store.set(KEY_T, T);

function t(k, v) {
  let s = (I18N[S.lang] && I18N[S.lang][k]) || I18N.en[k] || k;
  if (v) for (const x in v) s = s.replace('{' + x + '}', v[x]);
  return s;
}
const $ = id => document.getElementById(id);

/* ================================================================
   4) AUDIO (synthesised with WebAudio — no sound files needed)
   ================================================================ */
const Snd = {
  ctx: null, sfx: null, mus: null, timer: null, step: 0,
  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.sfx = this.ctx.createGain(); this.sfx.connect(this.ctx.destination);
      this.mus = this.ctx.createGain(); this.mus.connect(this.ctx.destination);
      this.applyVol();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.syncMusic();
  },
  applyVol() {
    if (!this.ctx) return;
    this.sfx.gain.value = S.sound ? S.vol : 0;
    this.mus.gain.value = S.music ? S.vol * 0.4 : 0;
  },
  tone(f, d, type, v, when, dest, slide) {
    if (!this.ctx) return;
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + (when || 0);
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + d);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v || 0.3, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g); g.connect(dest || this.sfx);
    o.start(t0); o.stop(t0 + d + 0.05);
  },
  play(name) {
    if (!S.sound || !this.ctx) return;
    const T_ = (...a) => this.tone(...a);
    switch (name) {
      case 'ui': T_(740, .07, 'triangle', .18); break;
      case 'x': T_(560, .14, 'triangle', .35); T_(840, .1, 'sine', .15, .03); break;
      case 'o': T_(380, .18, 'sine', .4); T_(570, .12, 'sine', .15, .03); break;
      case 'win': [523, 659, 784, 1047, 1319].forEach((f, i) => T_(f, .32, 'triangle', .3, i * .11)); break;
      case 'lose': [392, 330, 262, 196].forEach((f, i) => T_(f, .38, 'sawtooth', .16, i * .16)); break;
      case 'draw': T_(440, .25, 'triangle', .28); T_(440, .3, 'triangle', .28, .22); break;
    }
  },
  syncMusic() {
    if (!this.ctx) return;
    this.applyVol();
    const want = S.music && !document.hidden;
    if (want && !this.timer) {
      const chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]];
      const pat = [0, 1, 2, 1, 0, 1, 2, 1];
      this.timer = setInterval(() => {
        const i = this.step++, ch = chords[(i >> 3) % 4], n = ch[pat[i % 8]];
        this.tone(n, .9, 'sine', .55, 0, this.mus);
        if (i % 8 === 0) this.tone(ch[0] / 2, 2.6, 'triangle', .6, 0, this.mus);
      }, 380);
    } else if (!want && this.timer) { clearInterval(this.timer); this.timer = null; }
  }
};
const vibrate = ms => { if (S.vibe && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { /* ignore */ } } };

/* ================================================================
   5) GAME STATE
   ================================================================ */
const game = {
  active: false, mode: 'ai', level: 'medium', human: 'X', aiSym: 'O', p1: 'X', p2: 'O',
  board: Array(9).fill(null), turn: 'X', starter: 'X', over: false, busy: false,
  scores: { p1: 0, d: 0, p2: 0 }, round: 0, aiT: 0, modalT: 0
};
let cur = 'menu';
const boardEl = $('board'), cells = [];

function buildBoard() {
  for (let i = 0; i < 9; i++) {
    const c = document.createElement('div');
    c.className = 'cell'; c.dataset.i = i; c.setAttribute('role', 'button'); c.tabIndex = 0;
    c.setAttribute('aria-label', 'cell ' + (i + 1));
    boardEl.appendChild(c); cells.push(c);
  }
}
const LAYERS = 9;
function makePiece(sym) {
  const p = document.createElement('div');
  p.className = 'piece ' + sym.toLowerCase();
  let h = '';
  for (let i = 0; i < LAYERS; i++) {
    h += '<i class="ly" style="--i:' + i + ';--z:' + (i * 2.4).toFixed(1) + 'px">' + (sym === 'X' ? '<b></b><b></b>' : '<u></u>') + '</i>';
  }
  p.innerHTML = h;
  return p;
}

const modeKey = () => (game.mode === 'pvp' ? 'pvp' : 'ai_' + game.level);
const nameOf = sym => game.mode === 'ai' ? (sym === game.human ? t('you') : t('computer')) : (sym === 'X' ? t('player1') : t('player2'));

function refreshLabels() {
  $('modeLabel').textContent = game.mode === 'pvp' ? t('pvp') : t('vsPc') + ' · ' + t(game.level);
  $('name1').textContent = nameOf(game.p1);
  $('name2').textContent = nameOf(game.p2);
  const s1 = $('sym1'), s2 = $('sym2');
  s1.textContent = game.p1; s1.className = 'sym ' + game.p1.toLowerCase();
  s2.textContent = game.p2; s2.className = 'sym ' + game.p2.toLowerCase();
  $('n1').textContent = game.scores.p1; $('nd').textContent = game.scores.d; $('n2').textContent = game.scores.p2;
  updateTurn();
}
function updateTurn() {
  const el = $('turn');
  $('score1').classList.toggle('on', !game.over && game.turn === game.p1);
  $('score2').classList.toggle('on', !game.over && game.turn === game.p2);
  if (game.over) { el.textContent = ''; return; }
  if (game.mode === 'ai') el.textContent = game.turn === game.human ? t('yourTurn') + ' (' + game.human + ')' : t('pcThinking');
  else el.textContent = t('turnOf', { n: nameOf(game.turn) + ' (' + game.turn + ')' });
}

function clearTimers() { clearTimeout(game.aiT); clearTimeout(game.modalT); }

function startGame(mode, level, human) {
  game.mode = mode; game.level = level || 'medium';
  game.human = human || 'X'; game.aiSym = otherOf(game.human);
  game.p1 = mode === 'ai' ? game.human : 'X'; game.p2 = otherOf(game.p1);
  game.starter = 'X'; game.scores = { p1: 0, d: 0, p2: 0 };
  game.active = true;
  nav('game');
  startRound();
}

function startRound() {
  clearTimers();
  game.round++;
  game.board = Array(9).fill(null);
  game.turn = game.starter; game.over = false; game.busy = false;
  cells.forEach(c => { c.className = 'cell'; c.innerHTML = ''; c.style.removeProperty('--wc'); });
  boardEl.classList.remove('shake');
  const old = boardEl.querySelector('.beam'); if (old) old.remove();
  closeModal();
  refreshLabels();
  if (game.mode === 'ai' && game.turn === game.aiSym) aiTurn();
}

function aiTurn() {
  game.busy = true; updateTurn();
  const id = game.round;
  game.aiT = setTimeout(() => {
    if (id !== game.round || game.over) return;
    const i = aiMove(game.board.slice(), game.aiSym, game.level);
    game.busy = false;
    if (i >= 0) applyMove(i);
  }, 480 + Math.random() * 480);
}

function onCell(i) {
  if (game.over || game.busy || game.board[i] || !game.active) return;
  if (game.mode === 'ai' && game.turn !== game.human) return;
  applyMove(i);
}

function applyMove(i) {
  const sym = game.turn;
  game.board[i] = sym;
  const c = cells[i];
  c.classList.add('filled'); c.appendChild(makePiece(sym));
  Snd.play(sym === 'X' ? 'x' : 'o'); vibrate(18);
  const w = winnerOf(game.board);
  if (w) return finish(w);
  if (isFull(game.board)) return finish(null);
  game.turn = otherOf(sym);
  updateTurn();
  if (game.mode === 'ai' && game.turn === game.aiSym) aiTurn();
}

function finish(w) {
  game.over = true; game.busy = false;
  const outcome = !w ? 'draw' : (w.player === game.p1 ? 'win' : 'loss');   // from player-1 / human perspective
  if (outcome === 'win') game.scores.p1++; else if (outcome === 'loss') game.scores.p2++; else game.scores.d++;
  recordResult(modeKey(), outcome);
  refreshLabels();
  if (w) {
    const col = w.player === 'X' ? 'var(--xc)' : 'var(--oc)';
    cells.forEach((c, i) => { if (w.line.includes(i)) { c.classList.add('win'); c.style.setProperty('--wc', col); } else c.classList.add('dim'); });
    drawBeam(w.line, col);
  }
  const good = game.mode === 'pvp' ? !!w : outcome === 'win';
  setTimeout(() => Snd.play(outcome === 'draw' ? 'draw' : (good ? 'win' : 'lose')), 150);
  if (good) { vibrate([40, 50, 90]); setTimeout(() => Confetti.burst(), 250); }
  else if (outcome === 'loss') { vibrate(220); boardEl.classList.add('shake'); }
  else vibrate(60);
  const id = game.round;
  game.modalT = setTimeout(() => { if (id === game.round) openResult(outcome); }, w ? 1500 : 800);
}

function drawBeam(line, col) {
  const a = cells[line[0]], b = cells[line[2]];
  const ax = a.offsetLeft + a.offsetWidth / 2, ay = a.offsetTop + a.offsetHeight / 2;
  const bx = b.offsetLeft + b.offsetWidth / 2, by = b.offsetTop + b.offsetHeight / 2;
  const dx = bx - ax, dy = by - ay, dist = Math.hypot(dx, dy), ux = dx / dist, uy = dy / dist, ext = a.offsetWidth * 0.38;
  const beam = document.createElement('div');
  beam.className = 'beam';
  beam.style.left = (ax - ux * ext) + 'px'; beam.style.top = (ay - uy * ext) + 'px';
  beam.style.width = (dist + ext * 2) + 'px';
  beam.style.setProperty('--a', Math.atan2(dy, dx) + 'rad');
  beam.style.setProperty('--wc', col);
  boardEl.appendChild(beam);
}

function openResult(outcome) {
  const card = $('modalCard');
  const pvp = game.mode === 'pvp';
  let cls, badge, title, text;
  if (outcome === 'draw') { cls = 'draw'; badge = '🤝'; title = t('drawT'); text = t('drawText'); }
  else if (pvp) { cls = 'win'; badge = '🏆'; title = t('playerWins', { n: outcome === 'win' ? t('player1') : t('player2') }); text = t('pvWinText'); }
  else if (outcome === 'win') { cls = 'win'; badge = '🏆'; title = t('youWin'); text = t('winText'); }
  else { cls = 'lose'; badge = '💥'; title = t('youLose'); text = t('loseText'); }
  card.className = 'modal-card ' + cls;
  $('resBadge').textContent = badge; $('resTitle').textContent = title; $('resText').textContent = text;
  showModal('modal');
  setTimeout(() => $('replayBtn').focus({ preventScroll: true }), 350);
}
function showModal(id) { const m = $(id); m.classList.add('show'); m.setAttribute('aria-hidden', 'false'); }
function hideModal(id) { const m = $(id); m.classList.remove('show'); m.setAttribute('aria-hidden', 'true'); }
function closeModal() { hideModal('modal'); }

function replay() {
  if (game.mode === 'pvp' && game.over) game.starter = otherOf(game.starter);
  startRound();
}

/* ---------- statistics ---------- */
function recordResult(mk, outcome) {
  const m = T.modes[mk];
  if (outcome === 'win') m.w++; else if (outcome === 'loss') m.l++; else m.d++;
  if (mk !== 'pvp') {
    if (outcome === 'win') { T.streak++; T.best = Math.max(T.best, T.streak); }
    else if (outcome === 'loss') T.streak = 0;
  }
  T.history.unshift({ m: mk, r: outcome, t: Date.now() });
  T.history = T.history.slice(0, 30);
  saveT();
}
const modeName = mk => mk === 'pvp' ? t('pvp') : t('vsPc') + ' · ' + t(mk.slice(3));

function renderStats() {
  let aw = 0, al = 0, ad = 0, all = 0;
  MODES.forEach(m => { const x = T.modes[m]; all += x.w + x.l + x.d; if (m !== 'pvp') { aw += x.w; al += x.l; ad += x.d; } });
  const aiGames = aw + al + ad, rate = aiGames ? Math.round(aw / aiGames * 100) : 0;
  let h = '<div class="cards">' +
    '<div class="card"><strong>' + all + '</strong><span>' + t('games') + '</span></div>' +
    '<div class="card"><strong>' + rate + '%</strong><span>' + t('winRate') + '</span></div>' +
    '<div class="card"><strong>' + T.best + '</strong><span>' + t('bestStreak') + '</span></div></div>' +
    '<p class="sec">' + t('vsPcSec') + '</p><div class="cards">' +
    '<div class="card w"><strong>' + aw + '</strong><span>' + t('wins') + '</span></div>' +
    '<div class="card l"><strong>' + al + '</strong><span>' + t('losses') + '</span></div>' +
    '<div class="card d"><strong>' + ad + '</strong><span>' + t('drawsS') + '</span></div></div>' +
    '<p class="sec">' + t('byMode') + '</p>';
  MODES.forEach(m => {
    const x = T.modes[m], n = x.w + x.l + x.d || 1;
    h += '<div class="mrow"><div class="top"><span>' + modeName(m) + '</span><span class="nums">' + x.w + ' / ' + x.l + ' / ' + x.d + '</span></div>' +
      '<div class="bar"><i class="bw" style="width:' + (x.w / n * 100) + '%"></i><i class="bl" style="width:' + (x.l / n * 100) + '%"></i><i class="bd" style="width:' + (x.d / n * 100) + '%"></i></div></div>';
  });
  h += '<p class="note">' + t('pvpNote') + '</p><p class="sec">' + t('history') + '</p>';
  if (!T.history.length) h += '<div class="empty">' + t('noHistory') + '</div>';
  else T.history.slice(0, 10).forEach(e => {
    const d = new Date(e.t);
    let when = '';
    try { when = d.toLocaleDateString(S.lang === 'ar' ? 'ar' : 'en-GB', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString(S.lang === 'ar' ? 'ar' : 'en-GB', { hour: '2-digit', minute: '2-digit' }); } catch (er) { when = d.toLocaleString(); }
    const label = e.r === 'win' ? t('wins') : e.r === 'loss' ? t('losses') : t('drawsS');
    h += '<div class="hrow"><div>' + modeName(e.m) + '<br><small>' + when + '</small></div><span class="chip ' + e.r + '">' + label + '</span></div>';
  });
  $('statsBody').innerHTML = h;
}

/* ================================================================
   6) NAVIGATION
   ================================================================ */
function render(name) {
  if (name === 'game' && !game.active) name = 'menu';
  cur = name;
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + name));
  if (name !== 'game') { clearTimers(); game.round++; game.busy = false; }
  if (name === 'menu') game.active = false;
  hideModal('modal'); hideModal('confirm');
  if (name === 'stats') renderStats();
  if (name === 'setup') syncSetup();
  const sc = document.querySelector('#screen-' + name); if (sc && sc.scrollTo) sc.scrollTo(0, 0);
}
function nav(name) {
  if (name === 'menu') {
    if (cur !== 'menu' && history.state && history.state.s && history.state.s !== 'menu') { history.back(); return; }
  } else if (cur === 'menu') { try { history.pushState({ s: name }, ''); } catch (e) { /* ignore */ } }
  else { try { history.replaceState({ s: name }, ''); } catch (e) { /* ignore */ } }
  render(name);
}
window.addEventListener('popstate', e => {
  const s = e.state && e.state.s;
  render(s && s !== 'game' ? s : 'menu');
});

/* ================================================================
   7) SETTINGS / SETUP UI
   ================================================================ */
function applyI18n() {
  document.documentElement.lang = S.lang;
  document.documentElement.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  $('muteBtn').setAttribute('aria-label', t('mute'));
  if (game.active) refreshLabels();
  if (cur === 'stats') renderStats();
}
function syncSettingsUI() {
  document.body.dataset.theme = S.theme;
  document.querySelectorAll('.switch').forEach(b => b.setAttribute('aria-checked', String(!!S[b.dataset.setting])));
  document.querySelectorAll('#langSeg button').forEach(b => b.classList.toggle('sel', b.dataset.lang === S.lang));
  document.querySelectorAll('#swatches button').forEach(b => b.classList.toggle('sel', b.dataset.theme === S.theme));
  $('vol').value = Math.round(S.vol * 100);
  $('muteBtn').textContent = (S.sound || S.music) ? '🔊' : '🔇';
  Palette.read();
}
function syncSetup() {
  document.querySelectorAll('.level').forEach(b => b.classList.toggle('sel', b.dataset.level === S.level));
  document.querySelectorAll('.side').forEach(b => b.classList.toggle('sel', b.dataset.side === S.side));
}

let confirmCb = null;
function ask(msg, cb) { $('confirmMsg').textContent = msg; confirmCb = cb; showModal('confirm'); }

/* ================================================================
   8) EVENTS
   ================================================================ */
document.addEventListener('pointerdown', () => Snd.init(), { once: false, passive: true });
document.addEventListener('visibilitychange', () => {
  if (!Snd.ctx) return;
  if (document.hidden) { Snd.syncMusic(); Snd.ctx.suspend(); } else { Snd.ctx.resume(); Snd.syncMusic(); }
});

boardEl.addEventListener('click', e => { const c = e.target.closest('.cell'); if (c) onCell(+c.dataset.i); });
boardEl.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('cell')) { e.preventDefault(); onCell(+e.target.dataset.i); }
});

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action],[data-level],[data-side],[data-lang],[data-theme],.switch');
  if (!el) return;
  Snd.play('ui');
  if (el.dataset.level) { S.level = el.dataset.level; saveS(); return syncSetup(); }
  if (el.dataset.side) { S.side = el.dataset.side; saveS(); return syncSetup(); }
  if (el.dataset.lang) { S.lang = el.dataset.lang; saveS(); syncSettingsUI(); return applyI18n(); }
  if (el.dataset.theme) { S.theme = el.dataset.theme; saveS(); return syncSettingsUI(); }
  if (el.classList.contains('switch')) {
    const k = el.dataset.setting; S[k] = !S[k]; saveS(); syncSettingsUI();
    if (k === 'sound' || k === 'music') { Snd.init(); Snd.applyVol(); Snd.syncMusic(); }
    return;
  }
  switch (el.dataset.action) {
    case 'go-ai': nav('setup'); break;
    case 'go-pvp': startGame('pvp'); break;
    case 'go-stats': nav('stats'); break;
    case 'go-settings': nav('settings'); break;
    case 'start-ai': startGame('ai', S.level, S.side); break;
    case 'menu': nav('menu'); break;
    case 'restart': startRound(); break;
    case 'replay': replay(); break;
    case 'mute': {
      const on = S.sound || S.music; S.sound = !on; S.music = !on; saveS(); syncSettingsUI();
      Snd.init(); Snd.applyVol(); Snd.syncMusic(); break;
    }
    case 'reset-stats':
      ask(t('confirmReset'), () => { T = freshStats(); saveT(); renderStats(); });
      break;
  }
});
$('confirmYes').addEventListener('click', () => { hideModal('confirm'); if (confirmCb) confirmCb(); confirmCb = null; });
$('confirmNo').addEventListener('click', () => { hideModal('confirm'); confirmCb = null; });
$('vol').addEventListener('input', e => { S.vol = e.target.value / 100; Snd.applyVol(); });
$('vol').addEventListener('change', () => { saveS(); Snd.init(); Snd.play('x'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { hideModal('confirm'); if (cur !== 'menu' && !$('modal').classList.contains('show')) nav('menu'); } });
document.addEventListener('contextmenu', e => e.preventDefault());

/* ================================================================
   9) 3D TILT (pointer + gyroscope)
   ================================================================ */
const tilt = { rx: 24, ry: 0, tx: 24, ty: 0, last: 0 };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
window.addEventListener('pointermove', e => {
  if (cur !== 'game' || !S.tilt) return;
  tilt.last = performance.now();
  tilt.ty = (e.clientX / innerWidth - 0.5) * 28;
  tilt.tx = 24 - (e.clientY / innerHeight - 0.5) * 18;
}, { passive: true });
window.addEventListener('pointerup', e => { if (e.pointerType === 'touch') { tilt.tx = 24; tilt.ty = 0; } }, { passive: true });
window.addEventListener('deviceorientation', e => {
  if (cur !== 'game' || !S.tilt || e.gamma == null || performance.now() - tilt.last < 1800) return;
  tilt.ty = clamp(e.gamma, -35, 35) * 0.55;
  tilt.tx = 24 - clamp((e.beta || 55) - 55, -30, 30) * 0.3;
}, { passive: true });

function tiltLoop(ts) {
  if (!document.hidden && cur === 'game') {
    if (!S.tilt) { tilt.tx = 24; tilt.ty = 0; }
    tilt.rx += (tilt.tx - tilt.rx) * 0.09; tilt.ry += (tilt.ty - tilt.ry) * 0.09;
    const k = S.tilt ? 1 : 0;
    boardEl.style.setProperty('--rx', (tilt.rx + Math.sin(ts / 1500) * 2.2 * k).toFixed(2) + 'deg');
    boardEl.style.setProperty('--ry', (tilt.ry + Math.cos(ts / 1900) * 2 * k).toFixed(2) + 'deg');
  }
  requestAnimationFrame(tiltLoop);
}

/* ================================================================
   10) BACKGROUND + CONFETTI (Canvas)
   ================================================================ */
const Palette = { c1: '0,212,255', c2: '155,92,255', xc: '#27e6ff', oc: '#c77dff', c1h: '#00d4ff', c2h: '#9b5cff',
  read() {
    const cs = getComputedStyle(document.body), g = n => cs.getPropertyValue(n).trim();
    this.c1 = g('--c1r') || this.c1; this.c2 = g('--c2r') || this.c2;
    this.xc = g('--xc') || this.xc; this.oc = g('--oc') || this.oc;
    this.c1h = g('--c1') || this.c1h; this.c2h = g('--c2') || this.c2h;
  } };
const bg = $('bg'), bx = bg.getContext('2d'), fx = $('fx'), fc = fx.getContext('2d');
let W = 0, H = 0, DPR = 1, parts = [], gridOff = 0;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = innerWidth * DPR; H = innerHeight * DPR;
  bg.width = fx.width = W; bg.height = fx.height = H;
  const n = innerWidth < 600 ? 38 : 70;
  parts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.8 + .6) * DPR,
    vx: (Math.random() - .5) * .25 * DPR, vy: (Math.random() * -.35 - .08) * DPR, c: Math.random() < .5 ? 1 : 2 }));
}
window.addEventListener('resize', resize);
function drawBG() {
  if (!document.hidden) {
    bx.clearRect(0, 0, W, H);
    const hz = H * 0.66, vx = W / 2;
    bx.lineWidth = DPR;
    gridOff = (gridOff + 0.006) % 1;
    for (let i = 0; i < 14; i++) {
      const p = (i + gridOff) / 14, y = hz + (H - hz) * p * p;
      bx.strokeStyle = 'rgba(' + Palette.c1 + ',' + (p * 0.28).toFixed(3) + ')';
      bx.beginPath(); bx.moveTo(0, y); bx.lineTo(W, y); bx.stroke();
    }
    for (let i = -10; i <= 10; i++) {
      bx.strokeStyle = 'rgba(' + Palette.c2 + ',0.16)';
      bx.beginPath(); bx.moveTo(vx + i * W * 0.02, hz); bx.lineTo(vx + i * W * 0.2, H); bx.stroke();
    }
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
      bx.fillStyle = 'rgba(' + (p.c === 1 ? Palette.c1 : Palette.c2) + ',.75)';
      bx.shadowColor = 'rgb(' + (p.c === 1 ? Palette.c1 : Palette.c2) + ')'; bx.shadowBlur = 10 * DPR;
      bx.beginPath(); bx.arc(p.x, p.y, p.r, 0, 6.2832); bx.fill();
    }
    bx.shadowBlur = 0;
  }
  requestAnimationFrame(drawBG);
}
const Confetti = {
  list: [], running: false,
  burst() {
    const cols = [Palette.xc, Palette.oc, Palette.c1h, Palette.c2h, '#ffffff', '#ffd166'];
    for (let i = 0; i < 150; i++) {
      this.list.push({ x: W * (.2 + Math.random() * .6), y: H * .35, vx: (Math.random() - .5) * 14 * DPR, vy: (-Math.random() * 14 - 4) * DPR,
        w: (Math.random() * 8 + 5) * DPR, h: (Math.random() * 5 + 3) * DPR, a: Math.random() * 6.28, va: (Math.random() - .5) * .4,
        c: cols[(Math.random() * cols.length) | 0], life: 1 });
    }
    if (!this.running) { this.running = true; requestAnimationFrame(() => this.tick()); }
  },
  tick() {
    fc.clearRect(0, 0, W, H);
    this.list = this.list.filter(p => p.life > 0 && p.y < H + 40);
    for (const p of this.list) {
      p.vy += .35 * DPR; p.vx *= .992; p.x += p.vx; p.y += p.vy; p.a += p.va; p.life -= .005;
      fc.save(); fc.translate(p.x, p.y); fc.rotate(p.a); fc.globalAlpha = Math.max(p.life, 0);
      fc.fillStyle = p.c; fc.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); fc.restore();
    }
    if (this.list.length) requestAnimationFrame(() => this.tick());
    else { this.running = false; fc.clearRect(0, 0, W, H); }
  }
};

/* ================================================================
   11) BOOT
   ================================================================ */
function boot() {
  buildBoard();
  syncSettingsUI();
  applyI18n();
  resize();
  try { history.replaceState({ s: 'menu' }, ''); } catch (e) { /* ignore */ }
  requestAnimationFrame(drawBG);
  requestAnimationFrame(tiltLoop);
}
boot();

})(typeof window !== 'undefined' ? window : globalThis);
