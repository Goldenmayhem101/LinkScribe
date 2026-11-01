'use strict';
/*
  Linkscribe server. No dependencies. Needs Node 18 or newer.
  It serves the page and relays transcription requests to Google Gemini,
  so the Gemini API key stays on the server and never reaches the browser.
*/
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 3000;
const SERVER_KEY = (process.env.GEMINI_API_KEY || '').trim();
const BASE = (process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com').replace(/\/+$/, '');
/* Tried in order. The first one Gemini does not recognise is skipped. Set GEMINI_MODEL to pick your own. */
/* Fastest models first. If a model is not available to your key, the next one is tried and the working one is remembered. */
const MODELS = [...new Set([process.env.GEMINI_MODEL, 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-2.5-flash'].filter(Boolean))];
const PARALLEL = Math.max(1, Number(process.env.PARALLEL) || 4);                 /* pieces transcribed at the same time */
const CHUNK_SEC = Math.max(120, Number(process.env.CHUNK_SECONDS) || 360);        /* target length of each piece */
const CHUNK_ABOVE = Number(process.env.CHUNK_ABOVE_SECONDS) || 420;               /* only split videos longer than this */
const WATCH_BASE = (process.env.YT_WATCH_BASE || 'https://www.youtube.com').replace(/\/+$/, '');
let goodModel = null;
/* Requests per visitor per hour when the shared key is used. 0 turns the limit off. */
/* Free transcripts per visitor on the shared key: LIMIT per WINDOW_H hours (default 2 every 2 hours). 0 turns the limit off. */
const LIMIT = process.env.RATE_LIMIT_COUNT === undefined ? 2 : Number(process.env.RATE_LIMIT_COUNT);
const WINDOW_H = Number(process.env.RATE_LIMIT_HOURS) || 2;
const WINDOW_MS = WINDOW_H * 3600e3;
/* Safety net: most transcripts one network address can make per window, across all phones on it. 0 = off. */
const IP_LIMIT = process.env.RATE_LIMIT_PER_IP === undefined ? 12 : Number(process.env.RATE_LIMIT_PER_IP);
/* Extra transcripts earned by watching one rewarded video (confirmed by Google AdMob server-side verification). */
const REWARD_CREDITS = Number(process.env.REWARD_CREDITS) || 1;
const SSV_KEYS_URL = process.env.SSV_KEYS_URL || 'https://www.gstatic.com/admob/reward/verifier-keys.json';
const MAX_ACTIVE = Number(process.env.MAX_CONCURRENT) || 4;
/* Optional. When set, visitors must type this code to use the shared key. */
const ACCESS_CODE = (process.env.ACCESS_CODE || '').trim();
const ICON192 = Buffer.from('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', 'base64');
const ICON512 = Buffer.from('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', 'base64');
const PAGE_FILE = path.join(__dirname, 'public', 'index.html');
let pageCache = null;
/* Uses public/index.html when it exists, otherwise the copy built into this file. */
function getPage() {
  if (!pageCache) { try { pageCache = fs.readFileSync(PAGE_FILE); } catch (e) { pageCache = PAGE; } }
  return pageCache;
}
const MANIFEST = JSON.stringify({
  name: 'Linkscribe', short_name: 'Linkscribe', start_url: '/', display: 'standalone',
  background_color: '#F6F7FB', theme_color: '#4437D9',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
  ]
});
const PAGE = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Linkscribe</title>
<meta name="description" content="Paste a YouTube link and get the full transcript.">
<meta name="theme-color" content="#F6F7FB">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='9' fill='%234437D9'/%3E%3Cpath d='M8 13v6M12.5 9v14M17 12v8M21.5 7v18M26 14v4' stroke='white' stroke-width='2.6' stroke-linecap='round'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
/* Layout concept: one phone-width column. The link box is the hero. Results stream into a reading card that looks like subtitles: a mono timestamp gutter, then the words. */
:root{
  --bg:#F6F7FB; --surface:#FFFFFF; --ink:#111827; --muted:#566074; --line:#DCE0EA;
  --accent:#4437D9; --accent-ink:#FFFFFF; --accent-soft:#E9E7FF; --ts:#4437D9;
  --ok-soft:#DDF4E8; --ok-ink:#0B5D3A; --bad-soft:#FDECEA; --bad-ink:#9F2216; --warn-soft:#FFF3D6; --warn-ink:#6B4A00;
  --head:'Bricolage Grotesque',system-ui,sans-serif; --body:'IBM Plex Sans',system-ui,sans-serif; --mono:'IBM Plex Mono',ui-monospace,monospace;
  color-scheme:light;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#0C1020; --surface:#151B30; --ink:#EEF1FA; --muted:#A3ACC3; --line:#2A3250;
    --accent:#9A93FF; --accent-ink:#0C1020; --accent-soft:#26244F; --ts:#B3AEFF;
    --ok-soft:#12382A; --ok-ink:#8CE3B5; --bad-soft:#4A1F1B; --bad-ink:#FFB4A8; --warn-soft:#3A2E0F; --warn-ink:#FFE0A0;
    color-scheme:dark;
  }
}
:root[data-theme="dark"]{
  --bg:#0C1020; --surface:#151B30; --ink:#EEF1FA; --muted:#A3ACC3; --line:#2A3250;
  --accent:#9A93FF; --accent-ink:#0C1020; --accent-soft:#26244F; --ts:#B3AEFF;
  --ok-soft:#12382A; --ok-ink:#8CE3B5; --bad-soft:#4A1F1B; --bad-ink:#FFB4A8; --warn-soft:#3A2E0F; --warn-ink:#FFE0A0;
  color-scheme:dark;
}
*{box-sizing:border-box}
[hidden]{display:none!important}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:400 16px/1.5 var(--body);
  padding-block:max(12px,env(safe-area-inset-top,0px)) max(32px,env(safe-area-inset-bottom,0px));
  padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.wrap{max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:16px}
h1,h2,p{margin:0}
h1{font:700 clamp(28px,8vw,38px)/1.08 var(--head);text-wrap:balance;letter-spacing:-.01em}
button,input{font:inherit;color:inherit}
:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.row{display:flex;align-items:center;gap:10px;min-width:0}
.between{justify-content:space-between}
.grow{flex:1;min-width:0}
header.top{display:flex;align-items:center;justify-content:space-between;gap:10px}
.brand{display:flex;align-items:center;gap:10px;font:700 20px var(--head)}
.tbtn{width:44px;height:44px;border-radius:14px;border:1px solid var(--line);background:var(--surface);display:grid;place-items:center;cursor:pointer;padding:0}
.lede{color:var(--muted);font-size:17px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:12px;min-width:0}
label.fl{font-weight:600;font-size:14px}
.inrow{display:flex;gap:8px}
input[type=text],input[type=password]{width:100%;min-width:0;height:52px;border-radius:14px;border:2px solid var(--line);background:var(--bg);padding:0 14px;font-size:16px}
input[type=text]:focus,input[type=password]:focus{outline:none;border-color:var(--accent)}
.btn{min-height:54px;border-radius:14px;border:0;background:var(--accent);color:var(--accent-ink);font-weight:600;font-size:17px;cursor:pointer;padding:0 20px;display:flex;align-items:center;justify-content:center;gap:10px;width:100%}
.btn[disabled]{opacity:.55;cursor:default}
.sbtn{min-height:44px;border-radius:12px;border:1px solid var(--line);background:var(--surface);padding:0 14px;font-weight:600;font-size:15px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap}
.sbtn.primary{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.sbtn.danger{color:var(--bad-ink)}
.linkbtn{border:0;background:none;padding:10px 0;color:var(--accent);font-weight:600;text-decoration:underline;cursor:pointer}
details summary{cursor:pointer;font-weight:600;min-height:44px;display:flex;align-items:center;list-style:none;color:var(--muted)}
details summary::-webkit-details-marker{display:none}
details summary::before{content:"+";display:inline-block;width:18px;font-family:var(--mono)}
details[open] summary::before{content:"–"}
.opt{display:flex;flex-direction:column;gap:6px;margin-top:8px}
.check{display:flex;align-items:center;gap:12px;min-height:44px;font-weight:500}
.check input{width:22px;height:22px;accent-color:var(--accent)}
.note{font-size:14px;color:var(--muted)}
.status{border-radius:16px;padding:12px 14px;display:flex;gap:12px;align-items:flex-start;font-weight:500}
.status.busy{background:var(--accent-soft)}
.status.ok{background:var(--ok-soft);color:var(--ok-ink)}
.status.warn{background:var(--warn-soft);color:var(--warn-ink)}
.status.bad{background:var(--bad-soft);color:var(--bad-ink)}
.status .detail{display:block;font-weight:400;font-size:13px;opacity:.85;margin-top:2px;word-break:break-word}
.elapsed{font-family:var(--mono);font-size:14px;white-space:nowrap}
.spin{width:20px;height:20px;border-radius:50%;border:3px solid var(--line);border-top-color:var(--accent);animation:spin .9s linear infinite;flex:none;margin-top:2px}
@keyframes spin{to{transform:rotate(360deg)}}
.toolbar{display:flex;flex-wrap:wrap;gap:8px}
.toolbar .sbtn{flex:1 1 auto}
.meta{font-family:var(--mono);font-size:13px;color:var(--muted)}
.out{display:flex;flex-direction:column;gap:14px;font-size:17px;line-height:1.65;overflow-wrap:anywhere;user-select:text;-webkit-user-select:text}
.out p{margin:0}
.ts{font-family:var(--mono);font-size:13px;color:var(--ts);background:var(--accent-soft);border-radius:6px;padding:1px 6px;margin-right:4px;white-space:nowrap}
.out b{font-weight:600}
.example{opacity:.9}
.example .out{font-size:15px}
.tag{font:600 12px var(--body);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.toast{position:fixed;left:50%;bottom:max(20px,env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:var(--ink);color:var(--bg);padding:10px 16px;border-radius:999px;font-weight:600;font-size:14px;max-width:calc(100% - 32px);text-align:center;z-index:5}
footer{font-size:13px;color:var(--muted);padding-top:4px}
@media (prefers-reduced-motion:reduce){.spin{animation:none;border-top-color:var(--line);border-right-color:var(--accent)}}
</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <div class="brand">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="var(--accent)"/><path d="M8 13v6M12.5 9v14M17 12v8M21.5 7v18M26 14v4" stroke="var(--accent-ink)" stroke-width="2.6" stroke-linecap="round" fill="none"/></svg>
      <span>Linkscribe</span>
    </div>
    <button class="tbtn" id="themeBtn" type="button" aria-label="Switch between light and dark mode"></button>
  </header>

  <section>
    <h1>Paste a YouTube link. Get every word.</h1>
    <p class="lede" style="margin-top:10px">Works on public videos, from one minute to a few hours. Powered by Google Gemini.</p>
  </section>

  <form class="card" id="form" autocomplete="off">
    <label class="fl" for="url">YouTube link</label>
    <div class="inrow">
      <input id="url" type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="https://youtu.be/…">
      <button class="sbtn" id="pasteBtn" type="button" style="min-height:52px">Paste</button>
    </div>
    <button class="btn" id="goBtn" type="submit">Transcribe</button>
    <details id="opts">
      <summary>Options</summary>
      <div class="opt">
        <label class="check"><input type="checkbox" id="tsBox" checked> Show timestamps</label>
        <div id="codeBox" hidden>
          <label class="fl" for="code">Access code</label>
          <input id="code" type="password" autocomplete="off" spellcheck="false">
        </div>
        <label class="fl" for="key" style="margin-top:6px">Your own Gemini key (optional)</label>
        <input id="key" type="password" autocomplete="off" spellcheck="false" placeholder="Paste a key from Google AI Studio">
        <p class="note" id="keyNote">With your own key, your transcripts do not count against this site’s hourly limit. The key is sent only with your request and is saved in this browser only.</p>
        <div><button class="linkbtn" type="button" id="keyClear">Remove my saved key</button></div>
      </div>
    </details>
  </form>

  <div id="status" class="status busy" role="status" aria-live="polite" hidden></div>

  <section class="card" id="result" hidden aria-label="Transcript">
    <div class="row between"><span class="tag">Transcript</span><span class="meta" id="meta"></span></div>
    <div class="toolbar" id="bar">
      <button class="sbtn primary" id="copyBtn" type="button">Copy all</button>
      <button class="sbtn" id="saveBtn" type="button">Save .txt</button>
      <button class="sbtn" id="shareBtn" type="button" hidden>Share</button>
      <button class="sbtn danger" id="stopBtn" type="button" hidden>Stop</button>
    </div>
    <div id="contWrap" hidden class="status warn" style="flex-direction:column;gap:8px">
      <span id="contText"></span>
      <div><button class="sbtn" id="contBtn" type="button">Continue from there</button></div>
    </div>
    <div class="out" id="out" aria-live="off"></div>
    <div><button class="linkbtn" type="button" id="clearBtn">Clear this transcript</button></div>
  </section>

  <section class="card example" id="example" aria-label="Example">
    <span class="tag">Example of what you get</span>
    <div class="out">
      <p><span class="ts">[00:00]</span> <b>Speaker 1:</b> Welcome back. Today we are looking at how a heat pump actually works.</p>
      <p><span class="ts">[00:14]</span> <b>Speaker 2:</b> Thanks for having me. The simplest way to think about it is a fridge running in reverse.</p>
    </div>
  </section>

  <footer>Only public videos work. Transcripts are made by AI and can contain mistakes, so check anything important. Respect the video creator’s rights when you reuse a transcript.</footer>
</div>
<div class="toast" id="toast" role="status" aria-live="polite" hidden></div>

<script>
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var TS_START = /^\[(?:\d{1,2}:)?\d{1,2}:\d{2}\]\s*/;
  var TS_ANY = '\\[((?:\\d{1,2}:)?\\d{1,2}:\\d{2})\\]';
  var SPEAKER = /^(Speaker \d+):/;

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };

  var raw = '', cur = { el: null, text: '' }, ctrl = null, running = false, showTs = true;
  var truncated = false, model = '', startedAt = 0, ticker = null, gotFirst = false, config = { hasSharedKey: true, needsCode: false };
  var rafPending = false;

  /* ---------- theme ---------- */
  var ICON_MOON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var ICON_SUN = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  function isDark() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t) return t === 'dark';
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
  function paintTheme() { $('themeBtn').innerHTML = isDark() ? ICON_SUN : ICON_MOON; }
  var savedTheme = store.get('ls:theme');
  if (savedTheme === 'dark' || savedTheme === 'light') document.documentElement.setAttribute('data-theme', savedTheme);
  $('themeBtn').addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    store.set('ls:theme', next);
    paintTheme();
  });
  paintTheme();

  /* ---------- small ui helpers ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var toastTimer = null;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }
  function status(kind, html) {
    var s = $('status');
    if (!kind) { s.hidden = true; return; }
    s.className = 'status ' + kind; s.hidden = false; s.innerHTML = html;
  }
  function fmt(sec) { var m = Math.floor(sec / 60), r = sec % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
  function words() {
    var t = raw.replace(new RegExp(TS_ANY, 'g'), ' ').trim();
    return t ? t.split(/\s+/).length : 0;
  }
  function lastTs() {
    var re = new RegExp(TS_ANY, 'g'), m, last = null;
    while ((m = re.exec(raw))) last = m[1];
    return last;
  }
  function videoId(u) {
    var m = String(u).match(/(?:v=|youtu\.be\/|shorts\/|live\/|embed\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : 'video';
  }

  /* ---------- transcript rendering (only the paragraph being written is repainted) ---------- */
  function paint(p) {
    var m = p.text.match(TS_START), rest = m ? p.text.slice(m[0].length) : p.text;
    p.el.textContent = '';
    if (m && showTs) {
      var s = document.createElement('span');
      s.className = 'ts'; s.textContent = m[0].trim();
      p.el.appendChild(s);
      p.el.appendChild(document.createTextNode(' '));
    }
    var sp = rest.match(SPEAKER);
    if (sp) {
      var b = document.createElement('b');
      b.textContent = sp[1] + ':';
      p.el.appendChild(b);
      p.el.appendChild(document.createTextNode(rest.slice(sp[0].length)));
    } else {
      p.el.appendChild(document.createTextNode(rest));
    }
  }
  var paras = [];
  function paintCur() {
    if (!cur.text.trim()) return;
    if (!cur.el) { cur.el = document.createElement('p'); $('out').appendChild(cur.el); paras.push(cur); }
    paint(cur);
  }
  function resetOut() { $('out').textContent = ''; paras = []; cur = { el: null, text: '' }; }
  function append(text) {
    raw += text;
    var parts = text.split('\n');
    for (var i = 0; i < parts.length; i++) {
      if (i > 0) { paintCur(); cur = { el: null, text: '' }; }
      cur.text += parts[i];
    }
    paintCur();
  }
  function repaintAll() { for (var i = 0; i < paras.length; i++) paint(paras[i]); }
  function rebuild() { var t = raw; raw = ''; resetOut(); append(t); }
  function exportText() {
    return raw.split('\n').map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
      return showTs ? l : l.replace(TS_START, '');
    }).join('\n\n');
  }

  /* ---------- state of the buttons and status line ---------- */
  function refreshMeta() {
    $('meta').textContent = words().toLocaleString() + ' words' + (model && !running ? ' · ' + model : '');
  }
  function queueMeta() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () { rafPending = false; refreshMeta(); if (running) tickStatus(); });
  }
  function tickStatus() {
    var el = fmt(Math.floor((Date.now() - startedAt) / 1000));
    var msg = gotFirst
      ? 'Transcribing… ' + words().toLocaleString() + ' words so far'
      : 'Gemini is watching the video. Long videos can take a few minutes before the text starts.';
    status('busy', '<span class="spin" aria-hidden="true"></span><span class="grow">' + esc(msg) + '</span><span class="elapsed">' + el + '</span>');
  }
  function setRunning(on) {
    running = on;
    $('goBtn').disabled = on;
    $('goBtn').textContent = on ? 'Transcribing…' : 'Transcribe';
    $('stopBtn').hidden = !on;
    $('copyBtn').disabled = on && !raw;
    $('contBtn').disabled = on;
    $('out').setAttribute('aria-busy', on ? 'true' : 'false');
    clearInterval(ticker);
    if (on) { startedAt = Date.now(); gotFirst = false; ticker = setInterval(tickStatus, 1000); tickStatus(); }
  }
  function showResult() {
    $('result').hidden = false;
    $('example').hidden = true;
    if (navigator.share) $('shareBtn').hidden = false;
  }
  function offerContinue(why) {
    var ts = lastTs();
    if (!ts || !raw.trim()) { $('contWrap').hidden = true; return; }
    $('contText').textContent = why + ' You can pick it up from the last timestamp, ' + ts + '.';
    $('contWrap').hidden = false;
  }
  function persist() {
    if (!raw.trim()) return;
    store.set('ls:last', JSON.stringify({ url: $('url').value.trim(), raw: raw }));
  }
  function fail(message, detail) {
    setRunning(false);
    status('bad', '<span class="grow">' + esc(message) + (detail ? '<span class="detail">' + esc(detail) + '</span>' : '') + '</span>');
    if (raw.trim()) { offerContinue('The transcript is incomplete.'); persist(); refreshMeta(); }
  }

  /* ---------- talking to the server ---------- */
  function readEvents(resp, onEvent) {
    var reader = resp.body.getReader(), dec = new TextDecoder(), buf = '';
    function handle(block) {
      var ev = 'message', data = [];
      block.split(/\r?\n/).forEach(function (line) {
        if (line.indexOf('event:') === 0) ev = line.slice(6).trim();
        else if (line.indexOf('data:') === 0) data.push(line.slice(5).replace(/^ /, ''));
      });
      if (!data.length) return;
      try { onEvent(ev, JSON.parse(data.join('\n'))); } catch (e) { /* ignore a broken event */ }
    }
    function pump() {
      return reader.read().then(function (step) {
        if (step.done) { buf += dec.decode(); if (buf.trim()) handle(buf); return; }
        buf += dec.decode(step.value, { stream: true });
        var i;
        while ((i = buf.search(/\r?\n\r?\n/)) !== -1) { handle(buf.slice(0, i)); buf = buf.slice(i).replace(/^\r?\n\r?\n/, ''); }
        return pump();
      });
    }
    return pump();
  }

  function run(continueFrom) {
    var url = $('url').value.trim();
    if (!url) { status('warn', '<span class="grow">Paste a YouTube link first.</span>'); $('url').focus(); return; }
    if (!/youtube\.com|youtu\.be|youtube-nocookie\.com/i.test(url)) {
      status('bad', '<span class="grow">That does not look like a YouTube link. Paste a link like https://youtu.be/…</span>'); $('url').focus(); return;
    }
    var key = $('key').value.trim(), code = $('code').value.trim();
    store.set('ls:key', key);
    if (code) store.set('ls:code', code);

    var startAt = '';
    if (continueFrom) {
      startAt = lastTs();
      var re = new RegExp(TS_ANY, 'g'), m, idx = -1;
      while ((m = re.exec(raw))) idx = m.index;
      if (idx >= 0) { raw = raw.slice(0, idx).replace(/\s+$/, ''); rebuild(); append('\n'); }
    } else {
      raw = ''; resetOut(); truncated = false; model = '';
    }
    $('contWrap').hidden = true;
    showResult();
    setRunning(true);
    refreshMeta();
    $('status').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });

    ctrl = new AbortController();
    var h = { 'content-type': 'application/json' };
    if (key) h['x-gemini-key'] = key;
    if (code) h['x-access-code'] = code;

    var finished = false;
    fetch('/api/transcribe', { method: 'POST', headers: h, body: JSON.stringify({ url: url, startAt: startAt }), signal: ctrl.signal })
      .then(function (resp) {
        if (!resp.ok) {
          return resp.json().catch(function () { return {}; }).then(function (j) {
            finished = true;
            fail(j.message || 'Something went wrong. Try again.');
          });
        }
        return readEvents(resp, function (ev, d) {
          if (ev === 'status' && d.model) model = d.model;
          else if (ev === 'chunk') { if (!gotFirst) { gotFirst = true; } append(d.text || ''); queueMeta(); }
          else if (ev === 'done') {
            finished = true; truncated = !!d.truncated; if (d.model) model = d.model;
            setRunning(false); persist(); refreshMeta();
            if (truncated) {
              status('warn', '<span class="grow">Gemini reached its output limit before the end of the video.</span>');
              offerContinue('The transcript stopped early.');
            } else if (d.note) {
              status('warn', '<span class="grow">' + esc(d.note) + '</span>');
              offerContinue('The transcript is incomplete.');
            } else {
              status('ok', '<span class="grow">Done. ' + words().toLocaleString() + ' words. Tap Copy all to use it anywhere.</span>');
            }
          } else if (ev === 'fail') { finished = true; fail(d.message || 'Something went wrong.', d.detail); }
        }).then(function () {
          if (!finished) {
            fail('The connection dropped before the transcript finished.');
          }
        });
      })
      .catch(function (e) {
        if (e && e.name === 'AbortError') {
          setRunning(false); persist(); refreshMeta();
          status('warn', '<span class="grow">Stopped. You have ' + words().toLocaleString() + ' words so far.</span>');
          if (raw.trim()) offerContinue('You stopped it early.');
        } else if (!finished) {
          fail('Could not reach the server. Check your connection and try again.');
        }
      });
  }

  /* ---------- actions ---------- */
  function fallbackCopy(t) {
    var ta = document.createElement('textarea');
    ta.value = t; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, t.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { /* ignore */ }
    ta.remove();
    toast(ok ? 'Copied ' + words().toLocaleString() + ' words' : 'Copy did not work. Press and hold the text to select it.');
  }
  $('copyBtn').addEventListener('click', function () {
    var t = exportText();
    if (!t) { toast('Nothing to copy yet'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { toast('Copied ' + words().toLocaleString() + ' words'); }, function () { fallbackCopy(t); });
    } else fallbackCopy(t);
  });
  $('saveBtn').addEventListener('click', function () {
    var t = exportText();
    if (!t) { toast('Nothing to save yet'); return; }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([t], { type: 'text/plain;charset=utf-8' }));
    a.download = 'transcript-' + videoId($('url').value) + '.txt';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  });
  $('shareBtn').addEventListener('click', function () {
    var t = exportText();
    if (t && navigator.share) navigator.share({ text: t }).catch(function () { /* cancelled */ });
  });
  $('stopBtn').addEventListener('click', function () { if (ctrl) ctrl.abort(); });
  $('contBtn').addEventListener('click', function () { run(true); });
  $('clearBtn').addEventListener('click', function () {
    if (running && ctrl) ctrl.abort();
    raw = ''; resetOut(); store.del('ls:last');
    $('result').hidden = true; $('example').hidden = false; $('contWrap').hidden = true; status(null);
  });
  $('pasteBtn').addEventListener('click', function () {
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(function (t) { $('url').value = t.trim(); $('url').focus(); }, function () {
        toast('Press and hold in the box, then tap Paste'); $('url').focus();
      });
    } else { toast('Press and hold in the box, then tap Paste'); $('url').focus(); }
  });
  $('tsBox').addEventListener('change', function () { showTs = $('tsBox').checked; store.set('ls:ts', showTs ? '1' : '0'); repaintAll(); });
  $('keyClear').addEventListener('click', function () { $('key').value = ''; store.del('ls:key'); toast('Saved key removed'); });
  $('form').addEventListener('submit', function (e) { e.preventDefault(); if (!running) run(false); });

  /* ---------- start up ---------- */
  if (store.get('ls:ts') === '0') { showTs = false; $('tsBox').checked = false; }
  var savedKey = store.get('ls:key'); if (savedKey) $('key').value = savedKey;
  var savedCode = store.get('ls:code'); if (savedCode) $('code').value = savedCode;
  fetch('/api/config').then(function (r) { return r.json(); }).then(function (c) {
    config = c;
    if (c.needsCode) { $('codeBox').hidden = false; if (!savedCode) $('opts').open = true; }
    if (!c.hasSharedKey) {
      $('opts').open = true;
      $('keyNote').textContent = 'This site has no shared Gemini key, so you need your own. Get a free one at aistudio.google.com/apikey, paste it here, then paste a video link above. The key is sent only with your request and is saved in this browser only.';
    }
  }).catch(function () { /* page still works */ });
  var last = null;
  try { last = JSON.parse(store.get('ls:last') || 'null'); } catch (e) { last = null; }
  if (last && last.raw) {
    $('url').value = last.url || '';
    showResult();
    append(last.raw);
    refreshMeta();
    status('warn', '<span class="grow">Restored your last transcript from this device.</span>');
    offerContinue('If it was cut short,');
    if (!$('contWrap').hidden) $('contText').textContent = 'If your last transcript ended early, you can continue from the last timestamp, ' + lastTs() + '.';
  }
})();
</script>
</body>
</html>
`;

let active = 0;
const hits = new Map();

/* ---------- small helpers ---------- */
function clientIp(req) {
  const xff = String(req.headers['x-forwarded-for'] || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  return xff.length ? xff[xff.length - 1] : (req.socket.remoteAddress || 'unknown');
}
const bonus = new Map();   /* visitor id -> extra transcripts earned by watching videos */
const seenTx = new Map();  /* AdMob transaction ids already credited (stops replays) */
function visitorId(req) {
  const d = String(req.headers['x-device-id'] || '').trim();
  return /^[A-Za-z0-9-]{16,64}$/.test(d) ? 'd:' + d : null;
}
function recent(key, now) {
  const list = (hits.get(key) || []).filter(function (t) { return t > now - WINDOW_MS; });
  hits.set(key, list);
  return list;
}
function minsLeft(t, now) { return Math.max(1, Math.ceil((t + WINDOW_MS - now) / 60e3)); }
function look(req) {
  const now = Date.now(), ip = clientIp(req), id = visitorId(req) || ('ip:' + ip);
  return { now: now, id: id, mine: recent(id, now), ipList: recent('ipall:' + ip, now) };
}
function allow(req) {
  if (!LIMIT) return { ok: true };
  const q = look(req);
  if (IP_LIMIT && q.ipList.length >= IP_LIMIT) return { ok: false, minutes: minsLeft(q.ipList[0], q.now) };
  if (q.mine.length >= LIMIT) {
    const b = bonus.get(q.id) || 0;
    if (b > 0) { bonus.set(q.id, b - 1); q.ipList.push(q.now); return { ok: true }; }
    return { ok: false, minutes: minsLeft(q.mine[0], q.now) };
  }
  q.mine.push(q.now); q.ipList.push(q.now);
  return { ok: true };
}
function quotaInfo(req) {
  const q = look(req), b = bonus.get(q.id) || 0;
  const free = Math.max(0, LIMIT - q.mine.length);
  return { limit: LIMIT, windowHours: WINDOW_H, left: LIMIT ? free + b : 999, bonus: b, rewardCredits: REWARD_CREDITS,
           resetMinutes: (LIMIT && q.mine.length) ? minsLeft(q.mine[0], q.now) : 0 };
}
setInterval(function () {
  const cutoff = Date.now() - WINDOW_MS;
  hits.forEach(function (list, k) { if (!list.some(function (t) { return t > cutoff; })) hits.delete(k); });
  seenTx.forEach(function (t, k) { if (t < Date.now() - 864e5) seenTx.delete(k); });
}, 600e3).unref();

/* ---------- AdMob rewarded-video confirmation (server-side verification) ---------- */
let ssvKeys = null, ssvAt = 0;
async function ssvPem(keyId, force) {
  if (force || !ssvKeys || Date.now() - ssvAt > 864e5) {
    const r = await fetch(SSV_KEYS_URL);
    const j = await r.json();
    ssvKeys = j.keys || []; ssvAt = Date.now();
  }
  const k = ssvKeys.find(function (x) { return String(x.keyId) === String(keyId); });
  return k ? k.pem : null;
}
async function handleSsv(req, res, url) {
  const raw = (req.url.split('?')[1] || '');
  const i = raw.indexOf('&signature=');
  if (i < 0) return sendJson(res, 200, { ok: true }); /* AdMob's "test URL" button sends no signature: just say hello */
  const msg = raw.slice(0, i), rest = new URLSearchParams(raw.slice(i + 1));
  const sig = rest.get('signature'), keyId = rest.get('key_id');
  let good = false;
  try {
    let pem = await ssvPem(keyId, false);
    if (!pem) pem = await ssvPem(keyId, true);
    if (pem && sig) good = crypto.createVerify('SHA256').update(msg).verify(pem, Buffer.from(sig, 'base64url'));
  } catch (e) { good = false; }
  if (!good) return sendJson(res, 403, { ok: false });
  const tx = url.searchParams.get('transaction_id') || '', uid = url.searchParams.get('user_id') || '';
  if (!tx || !/^[A-Za-z0-9-]{16,64}$/.test(uid)) return sendJson(res, 400, { ok: false });
  if (seenTx.has(tx)) return sendJson(res, 200, { ok: true, duplicate: true });
  seenTx.set(tx, Date.now());
  const id = 'd:' + uid;
  bonus.set(id, Math.min(10, (bonus.get(id) || 0) + REWARD_CREDITS));
  return sendJson(res, 200, { ok: true });
}

function same(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
function headers(extra) {
  return Object.assign({
    /* lets the Android app (which loads its page from its own private address) talk to this server */
    'access-control-allow-origin': 'https://appassets.androidplatform.net',
    'vary': 'Origin',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    'cache-control': 'no-store'
  }, extra || {});
}
function sendJson(res, status, obj) {
  res.writeHead(status, headers({ 'content-type': 'application/json; charset=utf-8' }));
  res.end(JSON.stringify(obj));
}
function readJson(req, limit) {
  return new Promise(function (resolve, reject) {
    let size = 0, data = '';
    req.setEncoding('utf8');
    req.on('data', function (c) {
      size += c.length;
      if (size > (limit || 20000)) { reject(new Error('too large')); req.destroy(); return; }
      data += c;
    });
    req.on('end', function () { try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

/* Accepts watch, youtu.be, shorts, live and embed links. Returns the 11 character video id, or null. */
function parseYouTube(input) {
  let text = String(input || '').trim();
  if (!text) return null;
  if (!/^https?:\/\//i.test(text)) text = 'https://' + text;
  let u;
  try { u = new URL(text); } catch (e) { return null; }
  const host = u.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
  let id = null;
  if (host === 'youtu.be') {
    id = u.pathname.slice(1).split('/')[0];
  } else if (host === 'youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
    if (u.pathname === '/watch') id = u.searchParams.get('v');
    else {
      const m = u.pathname.match(/^\/(?:shorts|live|embed|v)\/([^/?]+)/);
      if (m) id = m[1];
    }
  }
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

function buildPrompt(startAt, range) {
  const lines = [
    'Transcribe everything that is spoken in this video, word for word, in the language it is spoken in. Do not summarize, shorten, translate or skip anything.',
    'Start every paragraph with a timestamp in square brackets, like [00:00] (use [1:02:03] after the first hour), and add a new timestamp at least every 30 seconds.',
    'If more than one person speaks, put a label such as "Speaker 1:" right after the timestamp and keep the same labels all the way through.',
    'Do not describe sounds or music. Do not add an introduction, notes or closing remarks. Output only the transcript.'
  ];
  if (range) {
    lines.push('You are given one section of a longer video. Transcribe only this section, measuring timestamps from the start of the section (the section starts at [00:00]). Begin with the first words spoken and do not stop early.');
  }
  if (startAt) {
    lines.push('Start at ' + startAt + ': your first paragraph must begin with the first words spoken at or just after ' + startAt + '. Do not repeat anything spoken before that.');
  }
  return lines.join('\n');
}

/* Turns a Gemini error into plain words. The raw message is kept as a short detail. */
function explain(err) {
  const status = err.status || 0;
  const raw = String(err.message || '');
  const m = raw.toLowerCase();
  let text;
  if (status === 429 || m.indexOf('quota') !== -1 || m.indexOf('resource_exhausted') !== -1) {
    text = 'Gemini has reached its usage limit for now. Free keys can only process about 8 hours of YouTube video per day. Try again later, or use your own Gemini key under Options.';
  } else if (status === 401 || m.indexOf('api key') !== -1) {
    text = 'Gemini rejected the API key. Check that the key is correct and still active.';
  } else if (status === 403 || m.indexOf('private') !== -1 || m.indexOf('unlisted') !== -1 || m.indexOf('not public') !== -1) {
    text = 'Gemini could not open this video. Only public videos work. Private, unlisted, age-restricted and region-blocked videos cannot be transcribed.';
  } else if (status === 400) {
    text = 'Gemini could not process this video. It may be unavailable, too long, or not supported.';
  } else if (status >= 500) {
    text = 'Gemini had a problem on its side. Try again in a minute.';
  } else {
    text = 'Gemini could not transcribe this video.';
  }
  return { message: text, detail: raw ? raw.slice(0, 300) : undefined };
}
function finishNote(reason) {
  if (!reason || reason === 'STOP' || reason === 'MAX_TOKENS') return '';
  if (reason === 'RECITATION') return 'Gemini stopped early because the speech looks like copyrighted material, such as song lyrics.';
  if (reason === 'SAFETY' || reason === 'PROHIBITED_CONTENT') return 'Gemini stopped early for safety reasons.';
  return 'Gemini stopped early (' + reason + ').';
}

async function readUpstreamError(r) {
  let message = '';
  try { message = (JSON.parse(await r.text()).error || {}).message || ''; } catch (e) { /* not JSON */ }
  return { status: r.status, message: message || r.statusText || 'Unknown error' };
}

function speedConfig(name) {
  /* Low video detail and little "thinking" make transcripts much faster. */
  const cfg = { mediaResolution: 'MEDIA_RESOLUTION_LOW', temperature: 0 };
  if (/^gemini-3/.test(name)) cfg.thinkingConfig = { thinkingLevel: 'low' };
  else if (/^gemini-2\.5-flash/.test(name)) cfg.thinkingConfig = { thinkingBudget: 0 };
  return cfg;
}
function isUnknownModel(e) {
  return e.status === 404 || (e.status === 400 && /model/i.test(e.message) && /not found|not supported|unsupported|unknown|invalid/i.test(e.message));
}
function sleep(ms, signal) {
  return new Promise(function (resolve, reject) {
    const t = setTimeout(resolve, ms);
    if (signal) signal.addEventListener('abort', function () { clearTimeout(t); reject(new Error('aborted')); }, { once: true });
  });
}

/* Opens a streaming request to Gemini, trying faster models first. Returns { resp, model }. */
async function openStream(o) {
  const part = { file_data: { file_uri: 'https://www.youtube.com/watch?v=' + o.videoId } };
  if (o.range) part.videoMetadata = { startOffset: o.range.from + 's', endOffset: o.range.to + 's' };
  const payload = { contents: [{ role: 'user', parts: [part, { text: buildPrompt(o.startAt, o.range) }] }] };
  function call(name, fast) {
    const body = fast ? Object.assign({}, payload, { generationConfig: speedConfig(name) }) : payload;
    return fetch(BASE + '/v1beta/models/' + encodeURIComponent(name) + ':streamGenerateContent?alt=sse', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': o.key },
      body: JSON.stringify(body),
      signal: o.signal
    });
  }
  async function attempt(name) {
    let r = await call(name, true);
    if (!r.ok && r.status === 400) {
      const e = await readUpstreamError(r);
      /* If this model rejects the speed settings, try it again without them. */
      if (/thinking|resolution|generation_?config|temperature/i.test(e.message)) r = await call(name, false);
      else return { err: e };
    }
    if (r.ok) return { resp: r };
    return { err: await readUpstreamError(r) };
  }
  const order = goodModel ? [goodModel].concat(MODELS.filter(function (m) { return m !== goodModel; })) : MODELS;
  let lastErr = { status: 0, message: '' };
  for (let i = 0; i < order.length; i++) {
    const waits = o.retry ? [3000, 8000] : [];
    for (let n = 0; ; n++) {
      const res = await attempt(order[i]);
      if (res.resp) { goodModel = order[i]; return { resp: res.resp, model: order[i] }; }
      lastErr = res.err;
      if (res.err.status === 429 && n < waits.length && !/per ?day|daily/i.test(res.err.message)) { await sleep(waits[n], o.signal); continue; }
      break;
    }
    if (!isUnknownModel(lastErr)) break;
  }
  throw { upstream: true, status: lastErr.status, message: lastErr.message };
}

/* Reads Gemini's event stream and passes each piece of text to onText. */
async function readSSE(resp, onText) {
  const st = { finish: null, usage: null, gotText: false, blocked: null };
  function handle(block) {
    const data = block.split(/\r?\n/).filter(function (l) { return l.indexOf('data:') === 0; })
      .map(function (l) { return l.slice(5).replace(/^ /, ''); }).join('\n');
    if (!data) return;
    let j;
    try { j = JSON.parse(data); } catch (e) { return; }
    if (j.error) throw { upstream: true, status: j.error.code, message: j.error.message };
    if (j.promptFeedback && j.promptFeedback.blockReason) st.blocked = j.promptFeedback.blockReason;
    const c = j.candidates && j.candidates[0];
    if (c) {
      const parts = (c.content && c.content.parts) || [];
      for (let k = 0; k < parts.length; k++) {
        if (typeof parts[k].text === 'string' && !parts[k].thought) { st.gotText = true; onText(parts[k].text); }
      }
      if (c.finishReason) st.finish = c.finishReason;
    }
    if (j.usageMetadata) st.usage = { input: j.usageMetadata.promptTokenCount, output: j.usageMetadata.candidatesTokenCount };
  }
  const reader = resp.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  for (;;) {
    const step = await reader.read();
    if (step.done) break;
    buf += dec.decode(step.value, { stream: true });
    let i;
    while ((i = buf.search(/\r?\n\r?\n/)) !== -1) {
      const block = buf.slice(0, i);
      buf = buf.slice(i).replace(/^\r?\n\r?\n/, '');
      handle(block);
    }
  }
  buf += dec.decode();
  if (buf.trim()) handle(buf);
  return st;
}

/* Rewrites [MM:SS] stamps so a section that starts at `offset` seconds lines up with the whole video. */
function makeShifter(offset) {
  const RE = /\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]/g;
  let held = '', mode = null;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(t) {
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
    return '[' + (h ? h + ':' + pad(m) : pad(m)) + ':' + pad(sec) + ']';
  }
  function conv(text) {
    if (!offset) return text;
    return text.replace(RE, function (all, a, b, c) {
      const t = c !== undefined ? (+a) * 3600 + (+b) * 60 + (+c) : (+a) * 60 + (+b);
      /* Gemini may count from the section start or from the video start. Decide from the first stamp. */
      if (mode === null) mode = t >= offset - 20 ? 'keep' : 'add';
      return fmt(mode === 'add' ? t + offset : t);
    });
  }
  return {
    push: function (text) {
      const all = held + text;
      const k = all.lastIndexOf('[');
      let cut = all.length;
      if (k !== -1 && all.indexOf(']', k) === -1 && all.length - k <= 10) cut = k; /* wait for the rest of an unfinished stamp */
      held = all.slice(cut);
      return conv(all.slice(0, cut));
    },
    flush: function () { const o = conv(held); held = ''; return o; }
  };
}

const lengths = new Map();
/* Looks up the video length so long videos can be split. Returns seconds, or 0 if unknown. */
async function getDuration(videoId, signal) {
  if (lengths.has(videoId)) return lengths.get(videoId);
  const ctrl = new AbortController();
  const timer = setTimeout(function () { ctrl.abort(); }, 2500);
  const onAbort = function () { ctrl.abort(); };
  if (signal) signal.addEventListener('abort', onAbort, { once: true });
  let secs = 0;
  try {
    const r = await fetch(WATCH_BASE + '/watch?v=' + videoId + '&hl=en', {
      headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36', 'accept-language': 'en-US,en;q=0.9', cookie: 'CONSENT=YES+1; SOCS=CAI' },
      signal: ctrl.signal
    });
    const html = await r.text();
    const m = html.match(/"lengthSeconds":"(\d+)"/);
    if (m) secs = Number(m[1]);
  } catch (e) { /* unknown length: the whole video is sent in one piece */ }
  clearTimeout(timer);
  if (signal) signal.removeEventListener('abort', onAbort);
  if (lengths.size > 500) lengths.clear();
  lengths.set(videoId, secs);
  return secs;
}

/* One request for the whole video. */
async function relaySingle(o) {
  const send = o.send;
  const op = await openStream({ key: o.key, videoId: o.videoId, startAt: o.startAt, range: null, signal: o.signal });
  send('status', { stage: 'watching', model: op.model });
  const st = await readSSE(op.resp, function (t) { send('chunk', { text: t }); });
  if (!st.gotText) {
    send('fail', st.blocked
      ? { message: 'Gemini declined to process this video (' + st.blocked + ').' }
      : { message: finishNote(st.finish) || 'Gemini returned no text. The video may have no speech, or it may not be accessible.' });
    return;
  }
  send('done', { finishReason: st.finish || 'STOP', truncated: st.finish === 'MAX_TOKENS', note: finishNote(st.finish), usage: st.usage, model: op.model });
}

/* Long video: cut it into pieces, transcribe several at once, and show the text in order. */
async function relayChunks(o, duration) {
  const send = o.send;
  const n = Math.ceil(duration / CHUNK_SEC);
  const len = Math.ceil(duration / n);
  const segs = [];
  for (let i = 0; i < n; i++) {
    segs.push({ i: i, from: i * len, to: Math.min(duration, (i + 1) * len), buf: '', done: false, sh: makeShifter(i * len) });
  }
  const inner = new AbortController();
  if (o.signal) o.signal.addEventListener('abort', function () { inner.abort(); }, { once: true });
  let head = 0, emitted = false, failed = null, model = null, usageIn = 0, usageOut = 0, opened = false, anyText = false;
  function emit(t) { if (t) { emitted = true; send('chunk', { text: t }); } }
  function advance() {
    while (head < segs.length) {
      const s = segs[head];
      if (s.buf) { emit(s.buf); s.buf = ''; }
      if (!s.done) break;
      head++;
      if (head < segs.length) emit('\n\n');
    }
  }
  async function runSeg(s) {
    const op = await openStream({ key: o.key, videoId: o.videoId, range: { from: s.from, to: s.to }, signal: inner.signal, retry: true });
    model = model || op.model;
    if (!opened) { opened = true; send('status', { stage: 'watching', model: op.model, parts: n }); }
    const st = await readSSE(op.resp, function (t) {
      anyText = true;
      s.buf += s.sh.push(t);
      if (s.i === head) advance();
    });
    s.buf += s.sh.flush();
    if (st.usage) { usageIn += st.usage.input || 0; usageOut += st.usage.output || 0; }
    s.done = true;
    advance();
  }
  let next = 0;
  async function worker() {
    while (next < segs.length && !failed) {
      const s = segs[next++];
      try { await runSeg(s); } catch (e) { if (!failed) { failed = e; inner.abort(); } }
    }
  }
  const workers = [];
  for (let k = 0; k < Math.min(PARALLEL, n); k++) workers.push(worker());
  await Promise.all(workers);
  if (o.signal && o.signal.aborted) return;

  if (failed) {
    /* Nothing shown yet and the failure looks like the sectioning was refused: do it the old way. */
    if (!emitted && (!failed.upstream || failed.status === 400)) return relaySingle(o);
    throw failed;
  }
  advance();
  if (!anyText) { send('fail', { message: 'Gemini returned no text. The video may have no speech, or it may not be accessible.' }); return; }
  send('done', { finishReason: 'STOP', truncated: false, note: '', usage: { input: usageIn, output: usageOut }, model: model, parts: n });
}

/* Picks the fastest way to transcribe this video. */
async function relay(o) {
  if (!o.startAt) {
    const duration = await getDuration(o.videoId, o.signal);
    if (duration > CHUNK_ABOVE && Math.ceil(duration / CHUNK_SEC) >= 2) return relayChunks(o, duration);
  }
  return relaySingle(o);
}

async function handleTranscribe(req, res) {
  let body;
  try { body = await readJson(req); } catch (e) { return sendJson(res, 400, { error: 'bad_request', message: 'The request could not be read.' }); }

  const videoId = parseYouTube(body.url);
  if (!videoId) return sendJson(res, 400, { error: 'bad_url', message: 'That does not look like a YouTube video link. Paste a link like https://youtu.be/… or https://www.youtube.com/watch?v=…' });

  const startAt = body.startAt ? String(body.startAt) : '';
  if (startAt && !/^(\d{1,2}:)?\d{1,2}:\d{2}$/.test(startAt)) return sendJson(res, 400, { error: 'bad_request', message: 'The start time is not valid.' });

  const userKey = String(req.headers['x-gemini-key'] || '').trim();
  if (userKey && !/^[\w.-]{20,200}$/.test(userKey)) return sendJson(res, 400, { error: 'bad_key', message: 'That Gemini key does not look right. Copy it again from Google AI Studio.' });
  const usingShared = !userKey;
  const key = userKey || SERVER_KEY;
  if (!key) return sendJson(res, 400, { error: 'no_key', message: 'This site has no shared Gemini key. Open Options and add your own key to continue.' });

  if (usingShared) {
    if (ACCESS_CODE && !same(String(req.headers['x-access-code'] || '').trim(), ACCESS_CODE)) {
      return sendJson(res, 401, { error: 'bad_code', message: 'The access code is missing or wrong. Enter it under Options.' });
    }
    const gate = allow(req);
    if (!gate.ok) return sendJson(res, 429, { error: 'rate', minutes: gate.minutes, message: 'You have used your free transcripts. You get ' + LIMIT + ' every ' + WINDOW_H + ' hours, so more are free again in about ' + gate.minutes + ' minutes. In the app you can also watch a short video for ' + REWARD_CREDITS + ' more, or add your own Gemini key under Options.' });
  }
  if (active >= MAX_ACTIVE) return sendJson(res, 503, { error: 'busy', message: 'The server is busy with other transcripts. Try again in a minute.' });

  active++;
  res.writeHead(200, headers({
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-store, no-transform',
    'x-accel-buffering': 'no'
  }));
  const ctrl = new AbortController();
  let cleaned = false;
  const beat = setInterval(function () { try { res.write(': ping\n\n'); } catch (e) { /* closed */ } }, 10000);
  function cleanup() {
    if (cleaned) return;
    cleaned = true;
    clearInterval(beat);
    active--;
  }
  res.on('close', function () { ctrl.abort(); cleanup(); });
  function send(event, data) {
    if (!res.writableEnded && !res.destroyed) res.write('event: ' + event + '\ndata: ' + JSON.stringify(data) + '\n\n');
  }

  send('status', { stage: 'sent' });
  try {
    await relay({ key: key, videoId: videoId, startAt: startAt, send: send, signal: ctrl.signal });
  } catch (e) {
    if (!ctrl.signal.aborted) {
      send('fail', e && e.upstream ? explain(e) : { message: 'The connection to Gemini was interrupted. Try again.' });
    }
  }
  cleanup();
  res.end();
}

const server = http.createServer(async function (req, res) {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'OPTIONS') {
      res.writeHead(204, headers({
        'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers': 'content-type, x-gemini-key, x-access-code, x-device-id',
        'access-control-max-age': '86400'
      }));
      return res.end();
    }
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      const html = getPage();
      res.writeHead(200, headers({
        'content-type': 'text/html; charset=utf-8',
        'content-security-policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
      }));
      return res.end(html);
    }
    if (req.method === 'GET' && url.pathname === '/manifest.webmanifest') { res.writeHead(200, headers({ 'content-type': 'application/manifest+json' })); return res.end(MANIFEST); }
    if (req.method === 'GET' && url.pathname === '/icon-192.png') { res.writeHead(200, headers({ 'content-type': 'image/png', 'cache-control': 'public, max-age=86400' })); return res.end(ICON192); }
    if (req.method === 'GET' && url.pathname === '/icon-512.png') { res.writeHead(200, headers({ 'content-type': 'image/png', 'cache-control': 'public, max-age=86400' })); return res.end(ICON512); }
    if (req.method === 'GET' && url.pathname === '/healthz') return sendJson(res, 200, { ok: true });
    if (req.method === 'GET' && url.pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }
    if (req.method === 'GET' && url.pathname === '/api/config') {
      return sendJson(res, 200, { hasSharedKey: !!SERVER_KEY, needsCode: !!ACCESS_CODE, limit: LIMIT, windowHours: WINDOW_H, rewardCredits: REWARD_CREDITS });
    }
    if (req.method === 'GET' && url.pathname === '/api/quota') return sendJson(res, 200, quotaInfo(req));
    if (req.method === 'GET' && url.pathname === '/api/ssv') return await handleSsv(req, res, url);
    if (req.method === 'POST' && url.pathname === '/api/transcribe') return await handleTranscribe(req, res);
    sendJson(res, 404, { error: 'not_found', message: 'Not found.' });
  } catch (e) {
    console.error('Request failed:', e && e.message);
    if (!res.headersSent) sendJson(res, 500, { error: 'server', message: 'Something went wrong on the server.' });
    else res.end();
  }
});
server.requestTimeout = 0;
server.keepAliveTimeout = 65000;

server.listen(PORT, function () {
  console.log('Linkscribe is running on port ' + PORT);
  console.log(SERVER_KEY ? 'Shared Gemini key: set' : 'Shared Gemini key: NOT set (visitors must add their own key)');
  console.log('Models tried in order: ' + MODELS.join(', '));
});
