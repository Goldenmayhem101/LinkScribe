[server.js](https://github.com/user-attachments/files/34230613/server.js)
# LinkScribe
LinkScribe Server
[package.json](https://github.com/user-attachments/files/34230597/package.json)
{
  "name": "linkscribe",
  "version": "1.0.0",
  "private": true,
  "description": "Paste a YouTube link, get the full transcript. Powered by Google Gemini.",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=18"
  }
}
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
const INDEX = path.join(__dirname, 'public', 'index.html');

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
      const html = await fs.promises.readFile(INDEX);
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
