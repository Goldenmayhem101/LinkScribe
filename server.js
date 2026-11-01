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
const MODELS = [...new Set([process.env.GEMINI_MODEL, 'gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-2.5-flash'].filter(Boolean))];
/* Requests per visitor per hour when the shared key is used. 0 turns the limit off. */
const PER_HOUR = process.env.RATE_LIMIT_PER_HOUR === undefined ? 10 : Number(process.env.RATE_LIMIT_PER_HOUR);
const MAX_ACTIVE = Number(process.env.MAX_CONCURRENT) || 4;
/* Optional. When set, visitors must type this code to use the shared key. */
const ACCESS_CODE = (process.env.ACCESS_CODE || '').trim();
const PAGE = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Linkscribe</title>
<meta name="description" content="Paste a YouTube link and get the full transcript.">
<meta name="theme-color" content="#F6F7FB">
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
function allow(ip) {
  if (!PER_HOUR) return { ok: true };
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(function (t) { return t > now - 3600e3; });
  if (list.length >= PER_HOUR) {
    hits.set(ip, list);
    return { ok: false, minutes: Math.max(1, Math.ceil((list[0] + 3600e3 - now) / 60e3)) };
  }
  list.push(now);
  hits.set(ip, list);
  return { ok: true };
}
setInterval(function () {
  const cutoff = Date.now() - 3600e3;
  hits.forEach(function (list, ip) { if (!list.some(function (t) { return t > cutoff; })) hits.delete(ip); });
}, 600e3).unref();

function same(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
function headers(extra) {
  return Object.assign({
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

function buildPrompt(startAt) {
  const lines = [
    'Transcribe everything that is spoken in this video, word for word, in the language it is spoken in. Do not summarize, shorten, translate or skip anything.',
    'Start every paragraph with a timestamp in square brackets, like [00:00] (use [1:02:03] after the first hour), and add a new timestamp at least every 30 seconds.',
    'If more than one person speaks, put a label such as "Speaker 1:" right after the timestamp and keep the same labels all the way through.',
    'Do not describe sounds or music. Do not add an introduction, notes or closing remarks. Output only the transcript.'
  ];
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

/* Sends the video to Gemini and relays the text back as it arrives. */
async function relay(opts) {
  const send = opts.send;
  const payload = {
    contents: [{ role: 'user', parts: [
      { file_data: { file_uri: 'https://www.youtube.com/watch?v=' + opts.videoId } },
      { text: buildPrompt(opts.startAt) }
    ] }]
  };
  let resp = null, model = null, lastErr = null;
  for (let i = 0; i < MODELS.length; i++) {
    const r = await fetch(BASE + '/v1beta/models/' + encodeURIComponent(MODELS[i]) + ':streamGenerateContent?alt=sse', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': opts.key },
      body: JSON.stringify(payload),
      signal: opts.signal
    });
    if (r.ok) { resp = r; model = MODELS[i]; break; }
    lastErr = await readUpstreamError(r);
    const unknownModel = r.status === 404 ||
      (r.status === 400 && /model/i.test(lastErr.message) && /not found|not supported|unsupported|unknown|invalid/i.test(lastErr.message));
    if (!unknownModel) break;
  }
  if (!resp) { send('fail', explain(lastErr || { status: 0, message: '' })); return; }
  send('status', { stage: 'watching', model: model });

  let finish = null, usage = null, gotText = false, blocked = null;
  function handle(block) {
    const data = block.split(/\r?\n/).filter(function (l) { return l.indexOf('data:') === 0; })
      .map(function (l) { return l.slice(5).replace(/^ /, ''); }).join('\n');
    if (!data) return;
    let j;
    try { j = JSON.parse(data); } catch (e) { return; }
    if (j.error) throw { upstream: true, status: j.error.code, message: j.error.message };
    if (j.promptFeedback && j.promptFeedback.blockReason) blocked = j.promptFeedback.blockReason;
    const c = j.candidates && j.candidates[0];
    if (c) {
      const parts = (c.content && c.content.parts) || [];
      for (let k = 0; k < parts.length; k++) {
        if (typeof parts[k].text === 'string' && !parts[k].thought) { gotText = true; send('chunk', { text: parts[k].text }); }
      }
      if (c.finishReason) finish = c.finishReason;
    }
    if (j.usageMetadata) usage = { input: j.usageMetadata.promptTokenCount, output: j.usageMetadata.candidatesTokenCount };
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

  if (!gotText) {
    send('fail', blocked
      ? { message: 'Gemini declined to process this video (' + blocked + ').' }
      : { message: finishNote(finish) || 'Gemini returned no text. The video may have no speech, or it may not be accessible.' });
    return;
  }
  send('done', { finishReason: finish || 'STOP', truncated: finish === 'MAX_TOKENS', note: finishNote(finish), usage: usage, model: model });
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
    const gate = allow(clientIp(req));
    if (!gate.ok) return sendJson(res, 429, { error: 'rate', message: 'You have used all your transcripts for this hour. Try again in about ' + gate.minutes + ' minutes, or add your own Gemini key under Options.' });
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
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      const html = PAGE;
      res.writeHead(200, headers({
        'content-type': 'text/html; charset=utf-8',
        'content-security-policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
      }));
      return res.end(html);
    }
    if (req.method === 'GET' && url.pathname === '/healthz') return sendJson(res, 200, { ok: true });
    if (req.method === 'GET' && url.pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }
    if (req.method === 'GET' && url.pathname === '/api/config') {
      return sendJson(res, 200, { hasSharedKey: !!SERVER_KEY, needsCode: !!ACCESS_CODE, perHour: PER_HOUR });
    }
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
