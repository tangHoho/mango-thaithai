/* 芒果泰泰 — game engine (ES module). Course data comes from data.js (classic script). */
import * as Sync from "./sync.js";

const APP_VERSION = self.APP_VERSION || "dev";

/* ---------------- helpers ---------------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.random() * a.length | 0];
const dayStr = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const SPK = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';

const LESSONS = COURSE.flatMap(u => u.lessons);
LESSONS.forEach((l, i) => l.index = i);
const UNIT_OF = Object.fromEntries(COURSE.flatMap(u => u.lessons.map(l => [l.id, u])));

/* ---------------- state ---------------- */
const KEY = "mango-thaithai-v1";
const DEFAULT = { xp: 0, streak: 0, last: "", done: {}, rate: 0.8, unlockAll: false, welcomed: false, updatedAt: 0 };
let S = { ...DEFAULT };
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}

let user = null;          // firebase user when logged in
let syncState = "local";  // local | syncing | synced | error
let pushTimer = null;

function save() {
  S.updatedAt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
  if (user) {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(pushNow, 1200);
  }
}
const progressOf = s => ({ xp: s.xp, streak: s.streak, last: s.last, done: s.done, updatedAt: s.updatedAt });
async function pushNow() {
  if (!user) return;
  setSync("syncing");
  try { await Sync.push(user.uid, progressOf(S)); setSync("synced"); }
  catch (e) { console.warn(e); setSync("error"); }
}
function merge(a, b) {
  if (!b) return a;
  const done = { ...a.done };
  for (const [k, v] of Object.entries(b.done || {})) done[k] = Math.max(done[k] || 0, v);
  const later = (b.last || "") > (a.last || "") ? b : a;
  return { ...a, xp: Math.max(a.xp || 0, b.xp || 0), done, last: later.last || "", streak: later.streak || 0 };
}
function setSync(s) { syncState = s; const el = $("#syncdot"); if (el) el.dataset.s = s; if (UI.tab === "me" && !L) render(); }

function bumpStreak() {
  const t = dayStr(new Date());
  if (S.last === t) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  S.streak = S.last === dayStr(y) ? S.streak + 1 : 1;
  S.last = t;
}
const liveStreak = () => {
  const y = new Date(); y.setDate(y.getDate() - 1);
  return (S.last === dayStr(new Date()) || S.last === dayStr(y)) ? S.streak : 0;
};
const unlocked = i => S.unlockAll || i === 0 || !!S.done[LESSONS[i - 1].id] || !!S.done[LESSONS[i].id];

/* ---------------- speech ---------------- */
const hasTTS = "speechSynthesis" in window;
let voice = null;
function pickVoice() { if (hasTTS) voice = speechSynthesis.getVoices().find(v => /^th(-|_|$)/i.test(v.lang)) || null; }
if (hasTTS) { pickVoice(); speechSynthesis.onvoiceschanged = () => { pickVoice(); if (UI.tab === "me" && !L) render(); }; }
function speak(text, slow) {
  if (!hasTTS || !text) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "th-TH"; u.rate = slow ? Math.max(0.5, S.rate - 0.2) : S.rate;
  if (voice) u.voice = voice;
  speechSynthesis.speak(u);
}
const sayOf = it => it.say || it.t;
/* tapping a consonant option: just the letter sound (กอ), not the name word */
const letterSay = it => it.type === "cons" ? (it.t === "อ" ? "ออ" : it.t + "อ") : sayOf(it);

/* ---------------- question builders ---------------- */
function typePool(lesson, type) {
  const seen = new Set(), out = [];
  const add = it => { if (it.type === type && !seen.has(it.t)) { seen.add(it.t); out.push(it); } };
  lesson.pool.forEach(add);
  LESSONS.slice(0, lesson.index).forEach(l => l.pool.forEach(add));
  LESSONS.forEach(l => l.pool.forEach(add));
  return out;
}
/* choose 3 distractors whose key differs from the answer and from each other */
function distractors(lesson, item, key, extraOk = () => true) {
  const used = new Set([key(item)]), out = [];
  for (const cand of [shuffle(lesson.pool), shuffle(typePool(lesson, item.type))]) {
    for (const c of cand) {
      if (out.length === 3) break;
      const k = key(c);
      if (c === item || used.has(k) || !extraOk(c)) continue;
      used.add(k); out.push(c);
    }
  }
  return out;
}
function itemChoice(lesson, item, o) {
  const wrong = distractors(lesson, item, o.key, o.ok);
  const opts = shuffle([item, ...wrong]);
  return { type: "choice", item, h: o.h, show: o.show, say: o.say, opts, ans: opts.indexOf(item),
           fmt: o.fmt, optSay: o.optSay, reveal: o.reveal, after: o.after ?? sayOf(item) };
}
function fixedChoice(item, labels, answer, o) {
  const others = shuffle(labels.filter(x => x !== answer)).slice(0, 3);
  const opts = shuffle([answer, ...others]);
  return { type: "choice", item, h: o.h, show: o.show, say: o.say, opts, ans: opts.indexOf(answer),
           fmt: x => ({ m: x }), reveal: o.reveal, after: sayOf(item) };
}
const thaiOpt = it => ({ t: it.t, small: it.type === "phrase" || [...it.t].length > 7 });
const notSameSound = item => c => (c.rom !== item.rom) && (c.snd === undefined || c.snd !== item.snd);

const MAKERS = {
  sound: (l, it) => itemChoice(l, it, { h: "這個子音念什麼音？", show: { big: it.t }, key: x => x.snd,
    fmt: x => ({ m: x.snd }), reveal: `${it.t} 念 ${it.snd}，代表字 ${it.w}（${it.zh}）` }),
  listen: (l, it) => itemChoice(l, it, { h: "聽聽看，是哪一個？", say: sayOf(it), key: x => x.t, ok: notSameSound(it),
    fmt: thaiOpt, optSay: letterSay, reveal: `${it.t}（${it.rom}）${it.zh && it.type !== "cons" ? "＝" + it.zh : ""}`, after: null }),
  name: (l, it) => itemChoice(l, it, { h: `哪個子音的代表字是「${it.w}」？`, show: { mid: it.w, rom: it.zh }, say: it.w, key: x => x.t,
    fmt: x => ({ t: x.t }), optSay: letterSay, reveal: `${it.t} ${it.w}（${it.rom}）` }),
  cls: (l, it) => fixedChoice(it, ["中子音", "高子音", "低子音"], CLS_NAME[it.cls], { h: "這是哪一類子音？", show: { big: it.t },
    reveal: `${it.t} 是${CLS_NAME[it.cls]}（${it.w}，${it.zh}）` }),
  vsound: (l, it) => itemChoice(l, it, { h: "這個母音念什麼？", show: { big: it.t }, key: x => x.snd,
    fmt: x => ({ m: x.snd, s: x.zh }), reveal: `${it.t} 念 ${it.snd}（${it.zh}），例如 ${it.ex} ${it.exRom}` }),
  vlisten: (l, it) => itemChoice(l, it, { h: "聽單字，用的是哪個母音？", say: it.ex, key: x => x.snd,
    fmt: x => ({ t: x.t }), reveal: `${it.ex}（${it.exRom}，${it.exZh}）用的是 ${it.t}` }),
  vword: (l, it) => itemChoice(l, it, { h: "這個字用的是哪個母音？", show: { mid: it.ex, rom: it.exZh }, say: it.ex, key: x => x.t,
    fmt: x => ({ t: x.t }), reveal: `${it.ex}（${it.exRom}）用的是 ${it.t}` }),
  mean: (l, it) => itemChoice(l, it, { h: it.type === "num" ? "這是數字幾？" : "這是什麼意思？",
    show: it.type === "phrase" ? { mid: it.t, rom: it.rom } : { big: it.t, rom: it.rom }, say: sayOf(it), key: x => x.zh,
    fmt: x => ({ m: x.zh }), reveal: `${it.t} ＝ ${it.zh}` }),
  toThai: (l, it) => itemChoice(l, it, { h: `「${it.zh}」的泰文是？`, key: x => x.t, fmt: thaiOpt, optSay: sayOf,
    reveal: `${it.zh} ＝ ${it.t}（${it.rom}）` }),
  tone: (l, it) => fixedChoice(it, TONES, it.tone, { h: "這個字念什麼聲調？", show: { big: it.t },
    reveal: `${it.t}（${it.rom}）${it.why}` }),
  fin: (l, it) => fixedChoice(it, FINALS, it.fin, { h: "這個字的尾音是？", show: { big: it.t },
    reveal: `${it.t}（${it.rom}）${it.why}` }),
  live: (l, it) => fixedChoice(it, ["活音節", "死音節"], it.live ? "活音節" : "死音節", { h: "這是活音節還是死音節？", show: { big: it.t },
    reveal: `${it.t}（${it.rom}）${it.why}` })
};

function matchQ(lesson) {
  const f = lesson.match || "zh";
  const seenL = new Set(), seenR = new Set(), pairs = [];
  for (const it of shuffle(lesson.pool)) {
    const r = f === "snd" ? it.snd : it.zh;
    if (!r || seenL.has(it.t) || seenR.has(r)) continue;
    seenL.add(it.t); seenR.add(r);
    pairs.push({ l: it.t, r, say: sayOf(it), small: thaiOpt(it).small });
    if (pairs.length === 4) break;
  }
  return pairs.length >= 3 ? { type: "match", h: "配對看看", pairs } : null;
}

function teachCard(it, lesson) {
  switch (it.type) {
    case "cons": return { type: "teach", label: "新的子音・" + CLS_NAME[it.cls], big: it.t, line: `${it.t} ${it.w}`, rom: it.rom,
      zh: "代表字：" + it.zh, note: `發音：${it.snd}${it.old ? "。這個字母現在已經停用，認得就好。" : ""}`, say: sayOf(it), cls: it.cls };
    case "vowel": return { type: "teach", label: `新的母音・${it.zh}`, big: it.t, line: `例：${it.ex}`, rom: `${it.snd}　｜　${it.exRom}`,
      zh: it.exZh, note: it.note, say: it.ex };
    case "tone": return { type: "teach", label: it.tone, big: it.t, rom: it.rom, zh: it.zh, note: it.why, say: sayOf(it) };
    case "final": return { type: "teach", label: "尾音 " + it.fin, big: it.t, rom: it.rom, zh: it.zh, note: it.why, say: sayOf(it) };
    case "live": return { type: "teach", label: it.live ? "活音節" : "死音節", big: it.t, rom: it.rom, zh: it.zh, note: it.why, say: sayOf(it) };
    case "phrase": return { type: "teach", label: "新的句子", mid: it.t, rom: it.rom, zh: it.zh,
      note: /คะ$/.test(it.t) ? "問句結尾用 คะ（khá）。" : /ค่ะ$/.test(it.t) ? "陳述句結尾用 ค่ะ（khâ）。" : "", say: sayOf(it) };
    case "num": return { type: "teach", label: "新的數字", big: it.t, rom: it.rom, zh: it.zh, say: sayOf(it) };
    default: return { type: "teach", label: "新的單字", big: it.t, rom: it.rom, zh: it.zh, say: sayOf(it) };
  }
}

function buildLesson(lesson) {
  const qs = [];
  if (!lesson.review) {
    (lesson.intro || []).forEach(c => qs.push({ ...c, type: "teach" }));
    lesson.pool.forEach(it => qs.push(teachCard(it, lesson)));
  }
  const n = lesson.review ? 12 : Math.min(10, Math.max(8, lesson.pool.length * 2));
  const kinds = lesson.kinds.filter(k => hasTTS || !/listen/.test(k));
  const quiz = [];
  let items = shuffle(lesson.pool), i = 0;
  while (quiz.length < n) {
    if (i && i % items.length === 0) items = shuffle(lesson.pool);
    const it = items[i % items.length];
    const kind = kinds[(i + (Math.random() * kinds.length | 0)) % kinds.length];
    const q = MAKERS[kind](lesson, it);
    if (q.opts.length >= 2) quiz.push(q);
    i++;
    if (i > 200) break;
  }
  const m = matchQ(lesson);
  if (m) quiz.splice(3 + (Math.random() * 3 | 0), 0, m);
  return { qs: [...qs, ...quiz], quizCount: quiz.length };
}

/* ---------------- UI state ---------------- */
const UI = { tab: "path", cardSet: "cons", cardFilter: "all", flipped: new Set(), confirmReset: false };
let L = null; // current lesson run
const app = $("#app");

function render() {
  if (L) return; // lesson screens render themselves
  app.classList.add("withtabs");
  if (Sync.configured && !S.welcomed && !user) return welcome();
  const head = `<header class="top"><div class="brand"><img src="icons/icon-192.png" alt="" width="30" height="30">芒果泰泰<span class="vpill">v${APP_VERSION}</span></div>
    <div class="stats"><span class="stat" title="連續天數"><span class="ic">▲</span>${liveStreak()}</span>
    <span class="stat" title="經驗值"><span class="ic">◆</span>${S.xp}</span>
    ${Sync.configured ? `<span id="syncdot" class="syncdot" data-s="${user ? syncState : "local"}" title="${user ? "已登入同步" : "未登入"}"></span>` : ""}</div></header>`;
  const body = UI.tab === "cards" ? cardsView() : UI.tab === "me" ? meView() : pathView();
  app.innerHTML = head + `<main>${body}</main>` + tabsBar();
}

function tabsBar() {
  const t = (id, g, label) => `<button type="button" role="tab" data-tab="${id}" aria-selected="${UI.tab === id}"><span class="g">${g}</span>${label}</button>`;
  return `<nav class="tabs" role="tablist"><div class="in">${t("path", "ก", "課程")}${t("cards", "กข", "字卡")}${t("me", "ฉัน", "我的")}</div></nav>`;
}

function welcome() {
  app.classList.remove("withtabs");
  app.innerHTML = `<div class="welcome">
    <img src="icons/icon-512.png" alt="" class="wicon">
    <h1>芒果泰泰</h1>
    <p>從 44 個子音開始，一路學到能用泰文點餐、問路。</p>
    <button class="go" type="button" data-act="login">用 Google 登入</button>
    <p class="small">登入後學習紀錄會同步到雲端，換手機也不會不見。</p>
    <button class="ghost" type="button" data-act="guest">先不登入，直接開始</button>
    <p class="small">不登入時，紀錄只存在這台裝置。之後隨時可以到「我的」登入。</p>
    <p class="err" id="loginErr" hidden></p><p class="ver">v${APP_VERSION}</p></div>`;
}

function pathView() {
  const offs = [0, -56, -80, -40, 30, 70, 30];
  const total = LESSONS.length, doneN = LESSONS.filter(l => S.done[l.id]).length;
  let current = LESSONS.findIndex(l => !S.done[l.id]);
  return `<div class="overall"><div class="bar"><i style="width:${Math.round(doneN / total * 100)}%"></i></div><span>${doneN} / ${total} 課</span></div>` +
    COURSE.map(u => {
      const d = u.lessons.filter(l => S.done[l.id]).length;
      return `<section class="unit-block"><div class="unit"><div><b>${esc(u.title)}</b><span>${esc(u.desc)}</span></div><em>${d}/${u.lessons.length}</em></div>
      <div class="path">${u.lessons.map((l, k) => {
        const st = S.done[l.id] || 0, open = unlocked(l.index), cur = l.index === current;
        return `<div class="node${st ? " done" : ""}${open ? "" : " locked"}${l.review ? " review" : ""}${cur ? " current" : ""}" style="--x:${offs[k % offs.length]}px">
          ${cur ? '<div class="start">開始</div>' : ""}
          <button type="button" data-l="${l.index}" aria-label="${esc(l.name)}${open ? "" : "（未解鎖）"}">${open ? esc(l.icon) : "🔒"}</button>
          <div class="lbl">${esc(l.name)}</div><div class="stars">${st ? "★".repeat(st) + "☆".repeat(3 - st) : ""}</div></div>`;
      }).join("")}</div></section>`;
    }).join("") + `<p class="hint">${hasTTS ? "聽力題需要開聲音。點選項時也會念出泰文。" : "這個瀏覽器不能播放語音，聽力題會先略過。"}</p>`;
}

/* ---------------- flashcards ---------------- */
function cardsView() {
  const seg = (id, label) => `<button type="button" data-set="${id}" aria-pressed="${UI.cardSet === id}">${label}</button>`;
  let html = `<div class="seg full">${seg("cons", "子音 44")}${seg("vowel", "母音")}${seg("num", "數字")}</div>`;
  let list = [];
  if (UI.cardSet === "cons") {
    const chip = (f, label, k) => `<button type="button" class="chip ${k || ""}" data-f="${f}" aria-pressed="${UI.cardFilter === f}">${label}</button>`;
    html += `<p class="legend">點卡片翻面並聽發音。底線顏色代表子音類別。</p>
      <div class="chips">${chip("all", "全部")}${chip("m", "中 9", "cm")}${chip("h", "高 11", "ch")}${chip("l", "低 24", "cl")}</div>`;
    list = ALL_CONS.filter(c => UI.cardFilter === "all" || c.cls === UI.cardFilter).map(c => ({
      key: "c" + c.t, k: { m: "cm", h: "ch", l: "cl" }[c.cls], front: c.t, tag: CLS_NAME[c.cls] + (c.old ? "・停用" : ""),
      bw: `${c.t} ${c.w}`, br: c.rom, bz: c.zh, say: c.say }));
  } else if (UI.cardSet === "vowel") {
    html += `<p class="legend">◌ 代表子音的位置。翻面可以看例字。</p>`;
    list = ALL_VOWELS.map(v => ({ key: "v" + v.t, k: v.zh === "長音" ? "cm" : "cl", front: v.t, tag: `${v.snd}・${v.zh}`,
      bw: v.ex, br: v.exRom, bz: v.exZh, say: v.ex }));
  } else {
    html += `<p class="legend">泰文數字。翻面看念法。</p>`;
    list = LESSONS.filter(l => l.unit === "u8" && !l.review).flatMap(l => l.pool).filter(n => n.type === "num").map(n => {
      const [d, ...w] = n.t.split(" ");
      return { key: "n" + n.t, k: "ch", front: d, tag: n.zh, bw: w.join(" "), br: n.rom, bz: n.zh, say: n.say };
    });
  }
  const allF = list.length && list.every(c => UI.flipped.has(c.key));
  html += `<div class="sec-h"><span>${list.length} 張</span><button type="button" class="linkbtn" data-act="flipall">${allF ? "全部蓋回" : "全部翻開"}</button></div>`;
  html += `<div class="cards">${list.map(c => `<button type="button" class="fc ${c.k}${UI.flipped.has(c.key) ? " flip" : ""}" data-fc="${esc(c.key)}" data-say="${esc(c.say)}" aria-label="${esc(c.front)}">
    <span class="inner"><span class="face front"><span class="L">${esc(c.front)}</span><span class="tag">${esc(c.tag)}</span></span>
    <span class="face back"><span class="w">${esc(c.bw)}</span><span class="r">${esc(c.br)}</span><span class="z">${esc(c.bz)}</span></span></span></button>`).join("")}</div>`;
  return html;
}

/* ---------------- me ---------------- */
function meView() {
  const doneN = LESSONS.filter(l => S.done[l.id]).length;
  const stars = Object.values(S.done).reduce((a, b) => a + b, 0);
  let acct;
  if (!Sync.configured) {
    acct = `<div class="panel"><b>訪客模式</b><p class="small">學習紀錄存在這台裝置。這個版本還沒設定 Firebase，所以不能登入同步。</p></div>`;
  } else if (user) {
    const label = { syncing: "同步中…", synced: "已同步到雲端", error: "同步失敗，稍後會再試", local: "已登入" }[syncState];
    acct = `<div class="panel acct">${user.photoURL ? `<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">` : `<div class="av">${esc((user.displayName || "我")[0])}</div>`}
      <div><b>${esc(user.displayName || user.email || "已登入")}</b><p class="small"><span class="syncdot inline" data-s="${syncState}"></span>${label}</p></div>
      <button type="button" class="ghost" data-act="logout">登出</button></div>`;
  } else {
    acct = `<div class="panel"><b>訪客模式</b><p class="small">目前紀錄只存在這台裝置。登入後會把現有進度一起上傳，換手機也能接著學。</p>
      <button class="go" type="button" data-act="login">用 Google 登入</button><p class="err" id="loginErr" hidden></p></div>`;
  }
  const rate = (r, label) => `<button type="button" data-rate="${r}" aria-pressed="${S.rate === r}">${label}</button>`;
  const voiceMsg = !hasTTS ? "這個瀏覽器不支援語音。請用 Chrome 或 Safari 開啟。"
    : voice ? `已找到泰文語音：${esc(voice.name)}`
    : "還沒找到泰文語音。三星手機請到「設定 › 一般管理 › 語言 › 文字轉語音」，把偏好的引擎改成「Google 語音辨識與合成」，再下載泰文語音資料；iPhone 請到「設定 › 輔助使用 › 朗讀內容 › 聲音」下載泰文。";
  return `${acct}
    <div class="tiles"><div class="tile"><b>${liveStreak()}</b><span>連續天數</span></div><div class="tile"><b>${S.xp}</b><span>經驗值</span></div>
    <div class="tile"><b>${doneN}<small>/${LESSONS.length}</small></b><span>完成課程</span></div><div class="tile"><b>${stars}</b><span>星星</span></div></div>
    <div class="panel"><b>發音</b><p class="small">${voiceMsg}</p>
      <div class="row"><span>語速</span><div class="seg">${rate(0.6, "慢")}${rate(0.8, "中")}${rate(1, "正常")}</div></div>
      <button class="ghost left" type="button" data-act="testvoice">▶ 試聽 สวัสดีค่ะ</button></div>
    <div class="panel"><div class="row"><div><b>解鎖全部課程</b><p class="small">已經學過的內容可以直接跳著練。</p></div>
      <button type="button" class="switch" role="switch" aria-checked="${S.unlockAll}" data-act="unlock"><i></i></button></div></div>
    <div class="panel">${UI.confirmReset
      ? `<b>確定要清除所有進度嗎？</b><p class="small">${user ? "雲端上的紀錄也會一起清除。" : "這個動作無法復原。"}</p>
         <div class="row gap"><button type="button" class="danger" data-act="doreset">清除</button><button type="button" class="ghost" data-act="cancelreset">取消</button></div>`
      : `<button type="button" class="ghost left dangertext" data-act="reset">重設學習進度</button>`}</div>
    <p class="ver">芒果泰泰 v${APP_VERSION}<br><button type="button" class="linkbtn" data-act="checkupdate">檢查更新</button><span id="updmsg"></span></p>`;
}

/* ---------------- lesson flow ---------------- */
function start(i) {
  if (!unlocked(i)) return;
  const lesson = LESSONS[i];
  const { qs, quizCount } = buildLesson(lesson);
  L = { i, lesson, qs, total: qs.length, quizCount, pos: 0, hearts: 5, mistakes: 0, answered: 0 };
  app.classList.remove("withtabs");
  showQ();
}
function lessonShell(inner, footer) {
  const pct = Math.round(L.answered / L.total * 100);
  app.innerHTML = `<div class="lbar"><button class="x" type="button" data-act="quit" aria-label="離開">×</button>
    <div class="prog"><i style="width:${pct}%"></i></div><div class="hearts">♥ ${L.hearts}</div></div>
    <div class="q">${inner}</div><div class="foot" id="foot"><div class="in">${footer}</div></div>`;
}
function showQ() {
  const q = L.qs[L.pos]; L.sel = null; L.locked = false;
  if (q.type === "teach") return showTeach(q);
  if (q.type === "match") return showMatch(q);
  const sh = q.show || {};
  let disp = "";
  if (q.say || sh.big || sh.mid) {
    disp = `<div class="show">${q.say ? `<button class="spk" type="button" data-act="say" aria-label="再聽一次">${SPK}</button>` : ""}
      <div class="showtxt">${sh.big ? `<div class="big">${esc(sh.big)}</div>` : ""}${sh.mid ? `<div class="midthai">${esc(sh.mid)}</div>` : ""}${sh.rom ? `<div class="rom">${esc(sh.rom)}</div>` : ""}</div></div>`;
  }
  const opts = q.opts.map((o, k) => {
    const f = q.fmt(o);
    return `<button class="opt" type="button" data-o="${k}">${f.t ? `<span class="t${f.small ? " small" : ""}">${esc(f.t)}</span>` : ""}${f.m ? `<span class="m">${esc(f.m)}</span>` : ""}${f.s ? `<span class="s">${esc(f.s)}</span>` : ""}</button>`;
  }).join("");
  lessonShell(`<h2>${esc(q.h)}</h2>${disp}<div class="opts${q.opts.length === 2 ? " two" : ""}">${opts}</div>`,
    `<button class="go" type="button" data-act="check" disabled>檢查</button>`);
  if (q.say) speak(q.say);
}
function showTeach(q) {
  const k = q.cls ? { m: "cm", h: "ch", l: "cl" }[q.cls] : "";
  lessonShell(`<div class="newtag">${esc(q.label)}</div>
    <div class="teach ${k}">
      ${q.big ? `<div class="big">${esc(q.big)}</div>` : ""}${q.mid ? `<div class="midthai">${esc(q.mid)}</div>` : ""}
      ${q.line ? `<div class="tline">${esc(q.line)}</div>` : ""}
      ${q.rom ? `<div class="rom">${esc(q.rom)}</div>` : ""}${q.zh ? `<div class="tzh">${esc(q.zh)}</div>` : ""}
      ${q.say ? `<button class="spk sm" type="button" data-act="say" aria-label="播放">${SPK}</button>` : ""}
    </div>${q.note ? `<p class="tnote">${esc(q.note)}</p>` : ""}`,
    `<button class="go" type="button" data-act="learned">知道了</button>`);
  if (q.say) speak(q.say);
}
function pickOpt(k) {
  const q = L.qs[L.pos]; if (L.locked) return;
  L.sel = k;
  app.querySelectorAll(".opt").forEach((b, j) => b.classList.toggle("sel", j === k));
  if (q.optSay) speak(q.optSay(q.opts[k]));
  $('[data-act="check"]').disabled = false;
}
function check() {
  const q = L.qs[L.pos]; if (L.sel == null || L.locked) return;
  L.locked = true;
  const ok = L.sel === q.ans;
  app.querySelectorAll(".opt").forEach((b, j) => {
    b.disabled = true; b.classList.remove("sel");
    if (j === q.ans) b.classList.add("right"); else if (j === L.sel) b.classList.add("wrong");
  });
  if (ok) L.answered++;
  else {
    L.hearts--; L.mistakes++;
    const again = { ...q, opts: shuffle(q.opts) }; again.ans = again.opts.indexOf(q.opts[q.ans]);
    L.qs.push(again);
  }
  if (q.after) setTimeout(() => speak(q.after), 150);
  feedback(ok, ok ? pick(["答對了！", "太棒了！", "完全正確！", "เก่งมาก！好厲害！"]) : "正確答案：", q.reveal);
}
function feedback(ok, title, detail) {
  const f = $("#foot"); f.className = "foot " + (ok ? "ok" : "bad");
  f.querySelector(".in").innerHTML = `<div class="fb"><b>${esc(title)}</b>${detail ? `<span>${esc(detail)}</span>` : ""}</div>
    <button class="go" type="button" data-act="next">繼續</button>`;
  f.querySelector(".go").focus({ preventScroll: true });
  const p = $(".prog i"); if (p) p.style.width = Math.round(L.answered / L.total * 100) + "%";
  const h = $(".hearts"); if (h) h.textContent = "♥ " + L.hearts;
}
function next() {
  if (L.hearts <= 0) return result(false);
  L.pos++;
  if (L.pos >= L.qs.length) return result(true);
  showQ();
}
function showMatch(q) {
  L.m = { left: null, right: null, found: 0 };
  const ids = q.pairs.map((_, i) => i);
  const left = shuffle(ids).map(i => `<button class="opt" type="button" data-ml="${i}"><span class="t${q.pairs[i].small ? " small" : ""}">${esc(q.pairs[i].l)}</span></button>`).join("");
  const right = shuffle(ids).map(i => `<button class="opt" type="button" data-mr="${i}"><span class="m">${esc(q.pairs[i].r)}</span></button>`).join("");
  lessonShell(`<h2>${esc(q.h)}</h2><div class="match"><div class="col">${left}</div><div class="col">${right}</div></div>`,
    `<button class="go" type="button" disabled>全部配對完成就能繼續</button>`);
}
function matchTap(side, i, el) {
  const q = L.qs[L.pos], m = L.m;
  if (el.disabled) return;
  if (side === "l") { m.left = i; speak(q.pairs[i].say); } else m.right = i;
  app.querySelectorAll(`[data-m${side}]`).forEach(b => b.classList.toggle("sel", b === el));
  if (m.left == null || m.right == null) return;
  const lb = $(`[data-ml="${m.left}"]`), rb = $(`[data-mr="${m.right}"]`);
  if (m.left === m.right) {
    [lb, rb].forEach(b => { b.classList.remove("sel"); b.classList.add("right"); b.disabled = true; setTimeout(() => { b.classList.remove("right"); b.classList.add("gone"); }, 250); });
    m.found++;
    if (m.found === q.pairs.length) { L.answered++; setTimeout(() => feedback(true, "全部配對成功！", ""), 300); }
  } else {
    [lb, rb].forEach(b => { b.classList.remove("sel"); b.classList.add("wrong", "shake"); setTimeout(() => b.classList.remove("wrong", "shake"), 400); });
  }
  m.left = m.right = null;
}
function result(win) {
  const l = L.lesson;
  if (win) {
    const stars = L.mistakes === 0 ? 3 : L.mistakes <= 2 ? 2 : 1;
    const xp = 10 + stars * 5 + (l.review ? 10 : 0);
    const acc = Math.round(L.quizCount / (L.quizCount + L.mistakes) * 100);
    S.xp += xp; S.done[l.id] = Math.max(S.done[l.id] || 0, stars); bumpStreak(); save();
    const nextL = LESSONS[L.i + 1];
    app.innerHTML = `<div class="res"><div class="glyph">เก่งมาก</div><h2>${esc(l.name)} 完成！</h2>
      <div class="rom">เก่งมาก kèng mâak ＝ 好厲害</div>
      <div class="stars big">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
      <div class="tiles three"><div class="tile"><b>+${xp}</b><span>經驗值</span></div><div class="tile"><b>${acc}%</b><span>正確率</span></div><div class="tile"><b>${liveStreak()}</b><span>連續天數</span></div></div>
      ${nextL ? `<button class="go" type="button" data-act="nextlesson">下一課：${esc(nextL.name)}</button>` : `<p>你完成了整個初學課程！</p>`}
      <button class="ghost" type="button" data-act="home">回到課程</button></div>`;
    speak("เก่งมาก");
  } else {
    app.innerHTML = `<div class="res"><div class="glyph">ไม่เป็นไร</div><h2>愛心用完了</h2>
      <div class="rom">ไม่เป็นไร mâi bpen rai ＝ 沒關係，再來一次</div>
      <button class="go" type="button" data-act="again">重新挑戰</button><button class="ghost" type="button" data-act="home">回到課程</button></div>`;
  }
}
function quitLesson() { L = null; if (hasTTS) speechSynthesis.cancel(); render(); }

/* ---------------- auth ---------------- */
async function doLogin() {
  const err = $("#loginErr");
  try { await Sync.login(); }
  catch (e) {
    console.warn(e);
    if (err) { err.hidden = false; err.textContent = e.code === "auth/unauthorized-domain"
      ? "登入失敗：請到 Firebase 主控台把這個網域加入「授權網域」。"
      : e.code === "auth/popup-closed-by-user" ? "登入視窗被關閉了，再試一次。" : "登入失敗，請稍後再試。"; }
  }
}
async function onUser(u) {
  user = u;
  if (u) {
    S.welcomed = true;
    setSync("syncing");
    try {
      const remote = await Sync.pull(u.uid);
      S = merge(S, remote);
      save(); await pushNow();
    } catch (e) { console.warn(e); setSync("error"); }
  } else syncState = "local";
  if (!L) render();
}

/* ---------------- events ---------------- */
app.addEventListener("click", e => {
  const t = e.target.closest("button"); if (!t) return;
  if (t.dataset.l != null) return start(+t.dataset.l);
  if (t.dataset.o != null) return pickOpt(+t.dataset.o);
  if (t.dataset.ml != null) return matchTap("l", +t.dataset.ml, t);
  if (t.dataset.mr != null) return matchTap("r", +t.dataset.mr, t);
  if (t.dataset.tab) { UI.tab = t.dataset.tab; UI.confirmReset = false; render(); window.scrollTo(0, 0); return; }
  if (t.dataset.set) { UI.cardSet = t.dataset.set; render(); return; }
  if (t.dataset.f) { UI.cardFilter = t.dataset.f; render(); return; }
  if (t.dataset.rate) { S.rate = +t.dataset.rate; save(); render(); speak("สวัสดีค่ะ"); return; }
  if (t.dataset.fc != null) {
    const k = t.dataset.fc;
    if (UI.flipped.has(k)) { UI.flipped.delete(k); t.classList.remove("flip"); }
    else { UI.flipped.add(k); t.classList.add("flip"); speak(t.dataset.say); }
    return;
  }
  switch (t.dataset.act) {
    case "say": speak(L.qs[L.pos].say, true); break;
    case "check": check(); break;
    case "next": next(); break;
    case "learned": L.answered++; next(); break;
    case "quit": case "home": quitLesson(); break;
    case "again": start(L.i); break;
    case "nextlesson": start(L.i + 1); break;
    case "guest": S.welcomed = true; save(); render(); break;
    case "login": doLogin(); break;
    case "logout": Sync.logout(); break;
    case "checkupdate": checkUpdate(); break;
    case "testvoice": speak("สวัสดีค่ะ"); break;
    case "unlock": S.unlockAll = !S.unlockAll; save(); render(); break;
    case "reset": UI.confirmReset = true; render(); break;
    case "cancelreset": UI.confirmReset = false; render(); break;
    case "doreset":
      S = { ...DEFAULT, welcomed: true, rate: S.rate }; UI.confirmReset = false; save(); if (user) pushNow(); render(); break;
    case "flipall": {
      const cards = [...app.querySelectorAll(".fc")]; const all = cards.every(b => b.classList.contains("flip"));
      cards.forEach(b => { b.classList.toggle("flip", !all); all ? UI.flipped.delete(b.dataset.fc) : UI.flipped.add(b.dataset.fc); });
      t.textContent = all ? "全部翻開" : "全部蓋回"; break;
    }
  }
});

/* ---------------- boot ---------------- */
render();
Sync.init(onUser).catch(e => console.warn("Firebase 初始化失敗", e));
if ("serviceWorker" in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register("sw.js").catch(() => {});
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController || $("#updbar")) return;
    const bar = document.createElement("button");
    bar.id = "updbar"; bar.type = "button"; bar.className = "updbar";
    bar.textContent = "有新版本，點這裡更新";
    bar.onclick = () => location.reload();
    document.body.append(bar);
  });
}
async function checkUpdate() {
  const msg = $("#updmsg"); if (msg) msg.textContent = "　檢查中…";
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.update();
    const res = await fetch("js/version.js?t=" + Date.now(), { cache: "no-store" });
    const m = (await res.text()).match(/APP_VERSION\s*=\s*"([^"]+)"/);
    const latest = m ? m[1] : APP_VERSION;
    if (msg) msg.textContent = latest === APP_VERSION ? "　已是最新版" : `　找到 v${latest}，重新整理中…`;
    if (latest !== APP_VERSION) setTimeout(() => location.reload(), 800);
  } catch (e) { if (msg) msg.textContent = "　目前離線，無法檢查"; }
}
/* test hook: index of the correct option on the current question */
window.__mangoAnswer = () => (L && L.qs[L.pos] ? L.qs[L.pos].ans : null);
