'use strict';
/* Ludora online server: sign-in (Google / Facebook / guest), friends, quick match, game rooms.
   The game itself is still run by the room's host page; this server relays room messages and
   stamps every message with the sender's verified identity. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');

const PORT = +process.env.PORT || 3000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');
const PUBLIC = path.join(__dirname, 'public');

/* ---------- storage (one JSON file; swap for a database when you grow) ---------- */
let DB = { users: {}, byProv: {}, guests: {} };
try { DB = Object.assign(DB, JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))); } catch (e) {}
let saveT = null;
function save() {
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    try { fs.writeFileSync(DATA_FILE + '.tmp', JSON.stringify(DB)); fs.renameSync(DATA_FILE + '.tmp', DATA_FILE); } catch (e) { console.error('save failed', e.message); }
  }, 300);
}
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function rand(n) { let s = ''; const b = crypto.randomBytes(n); for (let i = 0; i < n; i++) s += CODE_CHARS[b[i] % CODE_CHARS.length]; return s; }
function cleanName(n, fb) { n = String(n == null ? '' : n).replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁯﻿]/g, '').trim().slice(0, 12); return n || fb; }
function newUser(name, provider, provId) {
  const id = 'u' + crypto.randomBytes(8).toString('hex');
  let code; do { code = rand(6); } while (Object.values(DB.users).some(u => u.code === code));
  const u = { id, name: cleanName(name, 'Player'), code, provider, friends: [], incoming: [], created: Date.now() };
  DB.users[id] = u;
  if (provId) DB.byProv[provider + ':' + provId] = id;
  save();
  return u;
}

/* ---------- sign-in ---------- */
let gKeys = { at: 0, keys: [] };
async function googleJwks() {
  if (Date.now() - gKeys.at > 3600e3) { gKeys = { at: Date.now(), keys: (await (await fetch('https://www.googleapis.com/oauth2/v3/certs')).json()).keys || [] }; }
  return gKeys.keys;
}
async function verifyGoogle(token) {
  if (!GOOGLE_CLIENT_ID) throw new Error('Google sign-in is not configured');
  const parts = String(token).split('.'); if (parts.length !== 3) throw new Error('Bad Google token');
  const head = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
  const jwk = (await googleJwks()).find(k => k.kid === head.kid);
  if (!jwk || head.alg !== 'RS256') throw new Error('Google token rejected');
  const ok = crypto.verify('RSA-SHA256', Buffer.from(parts[0] + '.' + parts[1]), crypto.createPublicKey({ key: jwk, format: 'jwk' }), Buffer.from(parts[2], 'base64url'));
  const p = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  if (!ok || p.aud !== GOOGLE_CLIENT_ID || !['https://accounts.google.com', 'accounts.google.com'].includes(p.iss) || p.exp * 1000 < Date.now()) throw new Error('Google token rejected');
  return { id: p.sub, name: p.given_name || p.name || 'Player' };
}
async function verifyFacebook(token) {
  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) throw new Error('Facebook sign-in is not configured');
  const t = encodeURIComponent(token);
  const dbg = await (await fetch(`https://graph.facebook.com/debug_token?input_token=${t}&access_token=${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`)).json();
  if (!dbg.data || !dbg.data.is_valid || String(dbg.data.app_id) !== String(FACEBOOK_APP_ID)) throw new Error('Facebook token rejected');
  const me = await (await fetch(`https://graph.facebook.com/me?fields=id,first_name&access_token=${t}`)).json();
  if (!me.id || me.id !== dbg.data.user_id) throw new Error('Facebook token rejected');
  return { id: me.id, name: me.first_name || 'Player' };
}
async function authenticate(m) {
  if (m.kind === 'guest') {
    let uid = typeof m.secret === 'string' && m.secret.length >= 16 ? DB.guests[m.secret] : null;
    if (uid && DB.users[uid]) return DB.users[uid];
    const u = newUser(m.name, 'guest');
    const secret = crypto.randomBytes(24).toString('hex');
    DB.guests[secret] = u.id; save();
    return { user: u, secret };
  }
  const prov = m.kind === 'google' ? await verifyGoogle(m.token) : m.kind === 'facebook' ? await verifyFacebook(m.token) : null;
  if (!prov) throw new Error('Unknown sign-in');
  const key = m.kind + ':' + prov.id;
  return DB.users[DB.byProv[key]] || newUser(prov.name, m.kind, prov.id);
}

/* ---------- live state ---------- */
const online = new Map();      // userId -> Set<client>
const rooms = new Map();       // roomName -> Map<peerId, {c, presence}>
const queues = { 2: [], 3: [], 4: [] };   // matchmaking queues of clients
function send(c, obj) { if (c.ws.readyState === 1) c.ws.send(JSON.stringify(obj)); }
function sendUser(uid, obj) { (online.get(uid) || []).forEach(c => send(c, obj)); }
function isOnline(uid) { return online.has(uid) && online.get(uid).size > 0; }
function publicUser(u) { return { id: u.id, name: u.name, code: u.code, online: isOnline(u.id) }; }
function snapshot(u) {
  return {
    t: 'me', me: { id: u.id, name: u.name, code: u.code, provider: u.provider },
    friends: u.friends.map(id => DB.users[id]).filter(Boolean).map(publicUser),
    incoming: u.incoming.map(id => DB.users[id]).filter(Boolean).map(publicUser)
  };
}
/* ---------- delete an account and everything linked to it (Settings > Delete my online data) ---------- */
function deleteUser(uid) {
  const u = DB.users[uid]; if (!u) return false;
  Object.values(DB.users).forEach(o => {
    if (o.id === uid) return;
    const had = o.friends.includes(uid) || o.incoming.includes(uid);
    o.friends = o.friends.filter(x => x !== uid); o.incoming = o.incoming.filter(x => x !== uid);
    if (had) pushSnap(o.id);
  });
  Object.keys(DB.guests).forEach(k => { if (DB.guests[k] === uid) delete DB.guests[k]; });
  Object.keys(DB.byProv).forEach(k => { if (DB.byProv[k] === uid) delete DB.byProv[k]; });
  delete DB.users[uid];
  (online.get(uid) || []).forEach(c => { try { c.ws.close(); } catch (e) {} });
  online.delete(uid);
  save();
  return true;
}
function pushSnap(uid) { const u = DB.users[uid]; if (u) sendUser(uid, snapshot(u)); }
function notifyFriends(u) { u.friends.forEach(pushSnap); }

/* ---------- rooms (relay with verified sender) ---------- */
function peerView(room, id, rec, forC) {
  return { peer: id, isMe: rec.c === forC, sameTab: rec.c === forC, kind: 'viewer', guest: rec.c.user.provider === 'guest', presence: rec.presence };
}
function roomList(room, forC) { const r = rooms.get(room); return r ? [...r].map(([id, rec]) => peerView(room, id, rec, forC)) : []; }
function broadcastPeers(room, joined, left) {
  const r = rooms.get(room); if (!r) return;
  r.forEach(rec => send(rec.c, { t: 'r.peers', room, peers: roomList(room, rec.c), joined: joined.map(j => Object.assign({}, j, { isMe: j.peer === rec.c.id, sameTab: j.peer === rec.c.id })), left }));
}
function joinRoom(c, room) {
  if (!/^lu-[a-z0-9]{4}$/.test(room)) return;
  if (c.rooms.size >= 3 && !c.rooms.has(room)) return;
  let r = rooms.get(room); if (!r) { r = new Map(); rooms.set(room, r); }
  if (r.size >= 12 && !r.has(c.id)) return;
  const rec = r.get(c.id) || { c, presence: { n: c.user.name } };
  r.set(c.id, rec); c.rooms.add(room);
  broadcastPeers(room, [peerView(room, c.id, rec, c)], []);
}
function leaveRoom(c, room) {
  const r = rooms.get(room); if (!r || !r.has(c.id)) return;
  const rec = r.get(c.id); r.delete(c.id); c.rooms.delete(room);
  if (!r.size) rooms.delete(room);
  else broadcastPeers(room, [], [peerView(room, c.id, rec, c)]);
}

/* ---------- matchmaking ---------- */
function dequeue(c) { Object.keys(queues).forEach(k => { queues[k] = queues[k].filter(x => x !== c); }); c.mm = null; }
function tryMatch(count, force) {
  const q = queues[count];
  while (q.length >= count || (force && q.length >= 2)) {
    const group = q.splice(0, Math.min(count, q.length));
    let room; do { room = rand(4).toLowerCase(); } while (rooms.has('lu-' + room));
    group.forEach((c, i) => { c.mm = null; send(c, { t: 'mm.found', code: room.toUpperCase(), host: i === 0, count: Math.max(2, group.length) }); });
    if (!force) continue; else break;
  }
}
setInterval(() => { [4, 3, 2].forEach(n => { const q = queues[n]; if (q.length >= 2 && Date.now() - q[0].mmAt > 9000) tryMatch(n, true); }); }, 1000);

/* ---------- messages ---------- */
function handle(c, m) {
  if (!m || typeof m !== 'object') return;
  const u = c.user;
  switch (m.t) {
    case 'friend.add': {
      const code = String(m.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const other = Object.values(DB.users).find(x => x.code === code);
      if (!other) return send(c, { t: 'toast', text: 'No player has that friend code.' });
      if (other.id === u.id) return send(c, { t: 'toast', text: 'That is your own code.' });
      if (u.friends.includes(other.id)) return send(c, { t: 'toast', text: other.name + ' is already your friend.' });
      if (u.incoming.includes(other.id)) { acceptFriend(u, other.id); return; }
      if (!other.incoming.includes(u.id)) other.incoming.push(u.id);
      save(); pushSnap(other.id);
      send(c, { t: 'toast', text: 'Friend request sent to ' + other.name + '.' });
      break;
    }
    case 'friend.accept': if (u.incoming.includes(m.id)) acceptFriend(u, m.id); break;
    case 'friend.decline': u.incoming = u.incoming.filter(x => x !== m.id); save(); pushSnap(u.id); break;
    case 'friend.remove': {
      const o = DB.users[m.id]; u.friends = u.friends.filter(x => x !== m.id);
      if (o) o.friends = o.friends.filter(x => x !== u.id);
      save(); pushSnap(u.id); if (o) pushSnap(o.id); break;
    }
    case 'rename': u.name = cleanName(m.name, u.name); save(); pushSnap(u.id); notifyFriends(u); break;
    case 'invite': {
      if (!u.friends.includes(m.to) || !/^[A-Z0-9]{4}$/.test(String(m.code))) return;
      sendUser(m.to, { t: 'invited', from: { id: u.id, name: u.name }, code: m.code });
      send(c, { t: 'toast', text: 'Invite sent.' });
      break;
    }
    case 'mm.join': {
      dequeue(c); const n = [2, 3, 4].includes(+m.count) ? +m.count : 4;
      c.mm = n; c.mmAt = Date.now(); queues[n].push(c); send(c, { t: 'mm.wait', count: n });
      tryMatch(n, false); break;
    }
    case 'mm.cancel': dequeue(c); send(c, { t: 'mm.cancelled' }); break;
    case 'r.join': joinRoom(c, String(m.room)); break;
    case 'r.leave': leaveRoom(c, String(m.room)); break;
    case 'r.pres': {
      const rec = rooms.get(m.room) && rooms.get(m.room).get(c.id); if (!rec || typeof m.presence !== 'object' || !m.presence) return;
      rec.presence = { n: u.name, h: m.presence.h ? 1 : undefined, f: typeof m.presence.f === 'string' && m.presence.f.length <= 8 ? m.presence.f : undefined }; broadcastPeers(m.room, [], []); break;
    }
    case 'r.emit': {
      const r = rooms.get(m.room); if (!r || !r.has(c.id) || typeof m.topic !== 'string' || m.topic.length > 16) return;
      const raw = JSON.stringify(m.data === undefined ? null : m.data); if (raw.length > 6000) return;
      const out = JSON.stringify({ t: 'r.ev', room: m.room, topic: m.topic, peer: c.id, data: m.data });
      r.forEach(rec => { if (rec.c !== c && rec.c.ws.readyState === 1) rec.c.ws.send(out); });
      break;
    }
  }
}
function acceptFriend(u, otherId) {
  const o = DB.users[otherId]; if (!o) return;
  u.incoming = u.incoming.filter(x => x !== otherId); o.incoming = o.incoming.filter(x => x !== u.id);
  if (!u.friends.includes(otherId)) u.friends.push(otherId);
  if (!o.friends.includes(u.id)) o.friends.push(u.id);
  save(); pushSnap(u.id); pushSnap(o.id);
  sendUser(o.id, { t: 'toast', text: u.name + ' is now your friend.' });
}

/* ---------- http + websocket ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/account/delete') {
    const cors = { 'Access-Control-Allow-Origin': 'https://appassets.androidplatform.net', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Cache-Control': 'no-store' };
    if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
    if (req.method !== 'POST') { res.writeHead(405, cors); return res.end(); }
    let body = '';
    req.on('data', d => { body += d; if (body.length > 2048) req.destroy(); });
    req.on('end', () => {
      let secret = ''; try { secret = String(JSON.parse(body).secret || ''); } catch (e) {}
      const uid = secret.length >= 16 ? DB.guests[secret] : null;
      if (uid) deleteUser(uid);
      res.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }, cors));
      res.end(JSON.stringify({ ok: true, deleted: !!uid }));
    });
    return;
  }
  if (url.pathname === '/config.json') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': 'https://appassets.androidplatform.net' });
    return res.end(JSON.stringify({ google: GOOGLE_CLIENT_ID, facebook: FACEBOOK_APP_ID }));
  }
  let p = decodeURIComponent(url.pathname); if (p === '/') p = '/index.html'; if (p === '/delete-data' || p === '/delete-data/') p = '/delete-data.html';
  const f = path.normalize(path.join(PUBLIC, p));
  if (!f.startsWith(PUBLIC + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(buf);
  });
});
const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 16 * 1024 });
wss.on('connection', ws => {
  const c = { ws, id: 'c' + crypto.randomBytes(5).toString('hex'), user: null, rooms: new Set(), mm: null, mmAt: 0, bucket: 40, last: Date.now(), alive: true };
  ws.on('pong', () => { c.alive = true; });
  ws.on('message', async data => {
    const now = Date.now(); c.bucket = Math.min(40, c.bucket + (now - c.last) / 100); c.last = now;
    if (--c.bucket < 0) return;
    let m; try { m = JSON.parse(data.toString()); } catch (e) { return; }
    if (!c.user) {
      if (!m || m.t !== 'auth') return;
      try {
        const r = await authenticate(m);
        const user = r.user || r; c.user = user;
        if (!online.has(user.id)) online.set(user.id, new Set());
        online.get(user.id).add(c);
        send(c, Object.assign(snapshot(user), { secret: r.secret, peer: c.id }));
        notifyFriends(user);
      } catch (e) { send(c, { t: 'authfail', text: String(e.message || 'Sign-in failed').slice(0, 100) }); }
      return;
    }
    handle(c, m);
  });
  ws.on('close', () => {
    dequeue(c); [...c.rooms].forEach(r => leaveRoom(c, r));
    if (c.user) { const s = online.get(c.user.id); if (s) { s.delete(c); if (!s.size) { online.delete(c.user.id); notifyFriends(c.user); } } }
  });
  ws.on('error', () => {});
});
setInterval(() => { wss.clients.forEach(ws => { }); for (const set of online.values()) set.forEach(c => { if (!c.alive) return c.ws.terminate(); c.alive = false; try { c.ws.ping(); } catch (e) {} }); }, 30000);

server.listen(PORT, () => console.log('Ludora server on http://localhost:' + PORT + (GOOGLE_CLIENT_ID ? ' [google]' : '') + (FACEBOOK_APP_ID ? ' [facebook]' : '') + ' [guest]'));
