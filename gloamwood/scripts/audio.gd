extends Node
## Autoload "Sfx": all sound is synthesized at runtime (no audio files, no licenses).
## Effects are built at startup; each biome's music loop is generated on a worker thread.

const RATE := 22050

var sfx := {}
var players: Array[AudioStreamPlayer] = []
var music_player: AudioStreamPlayer
var music_cache := {}
var want_music := ""
var building := {}
var _rr := 0


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	for i in 14:
		var p = AudioStreamPlayer.new()
		add_child(p)
		players.append(p)
	music_player = AudioStreamPlayer.new()
	add_child(music_player)
	_build_sfx()
	apply_volumes()


func _setting(k: String, fallback: float) -> float:
	var p = get_node_or_null("/root/Profile")
	return float(p.setting(k)) if p else fallback


func apply_volumes() -> void:
	music_player.volume_db = linear_to_db(maxf(_setting("music", 0.6), 0.0005)) - 8.0


func play(name: String, pitch: float = 1.0, jitter: float = 0.05, vol_db: float = 0.0) -> void:
	if not sfx.has(name):
		return
	var v = _setting("sfx", 0.85)
	if v <= 0.01:
		return
	var p: AudioStreamPlayer = null
	for q in players:
		if not q.playing:
			p = q
			break
	if p == null:
		p = players[_rr % players.size()]
		_rr += 1
	p.stream = sfx[name]
	p.pitch_scale = pitch * (1.0 + randf_range(-jitter, jitter))
	p.volume_db = linear_to_db(v) + vol_db
	p.play()


func music(key: String) -> void:
	want_music = key
	if music_cache.has(key):
		if music_player.stream != music_cache[key] or not music_player.playing:
			music_player.stream = music_cache[key]
			music_player.play()
		return
	if not building.has(key):
		building[key] = true
		WorkerThreadPool.add_task(_build_music_task.bind(key))


func _build_music_task(key: String) -> void:
	var w = _gen_music(key)
	call_deferred("_music_ready", key, w)


func _music_ready(key: String, w: AudioStreamWAV) -> void:
	music_cache[key] = w
	building.erase(key)
	if want_music == key:
		music(key)


# ---------------- synthesis helpers ----------------
func _wav(buf: PackedFloat32Array, loop: bool = false) -> AudioStreamWAV:
	var bytes = PackedByteArray()
	bytes.resize(buf.size() * 2)
	for i in buf.size():
		bytes.encode_s16(i * 2, int(clampf(buf[i], -1.0, 1.0) * 30000.0))
	var w = AudioStreamWAV.new()
	w.format = AudioStreamWAV.FORMAT_16_BITS
	w.mix_rate = RATE
	w.stereo = false
	w.data = bytes
	if loop:
		w.loop_mode = AudioStreamWAV.LOOP_FORWARD
		w.loop_begin = 0
		w.loop_end = buf.size()
	return w


## kind: 0 sine, 1 square, 2 saw, 3 triangle. Linear frequency sweep f0->f1.
func _tone(dur: float, f0: float, f1: float, kind: int, vol: float, decay: float = 2.0, noise: float = 0.0, attack: float = 0.004, vib: float = 0.0) -> PackedFloat32Array:
	var n = int(dur * RATE)
	var buf = PackedFloat32Array()
	buf.resize(n)
	var ph = 0.0
	var lp = 0.0
	for i in n:
		var t = float(i) / RATE
		var u = float(i) / n
		var f = lerpf(f0, f1, u) * (1.0 + sin(t * 32.0) * vib)
		ph += f / RATE
		var x = ph - floor(ph)
		var s = 0.0
		match kind:
			0: s = sin(TAU * x)
			1: s = 1.0 if x < 0.5 else -1.0
			2: s = 2.0 * x - 1.0
			3: s = 4.0 * absf(x - 0.5) - 1.0
		if noise > 0.0:
			lp = lerpf(lp, randf() * 2.0 - 1.0, 0.35)
			s = lerpf(s, lp * 1.6, noise)
		var env = minf(1.0, t / attack) * pow(1.0 - u, decay)
		buf[i] = s * env * vol
	return buf


func _mix(a: PackedFloat32Array, b: PackedFloat32Array, offset: float = 0.0) -> PackedFloat32Array:
	var o = int(offset * RATE)
	var n = maxi(a.size(), b.size() + o)
	var out = PackedFloat32Array()
	out.resize(n)
	for i in n:
		var v = 0.0
		if i < a.size():
			v += a[i]
		if i - o >= 0 and i - o < b.size():
			v += b[i - o]
		out[i] = v
	return out


func _seq(notes: Array, step: float, kind: int, vol: float, decay: float = 2.5) -> PackedFloat32Array:
	var out = PackedFloat32Array()
	for i in notes.size():
		out = _mix(out, _tone(step * 2.2, notes[i], notes[i], kind, vol, decay), step * i)
	return out


func _build_sfx() -> void:
	sfx.jump = _wav(_tone(0.14, 280, 620, 1, 0.18, 2.0))
	sfx.djump = _wav(_mix(_tone(0.16, 520, 1040, 0, 0.35, 2.0), _tone(0.12, 1040, 1560, 0, 0.12, 2.0), 0.03))
	sfx.spark = _wav(_tone(0.12, 1400, 480, 0, 0.32, 2.5, 0.25))
	sfx.charge = _wav(_tone(0.5, 200, 760, 0, 0.22, 0.3, 0.0, 0.05, 0.08))
	sfx.bigshot = _wav(_mix(_tone(0.32, 220, 70, 0, 0.5, 2.0), _tone(0.3, 300, 100, 2, 0.15, 2.5, 0.6)))
	sfx.hit = _wav(_tone(0.09, 200, 140, 1, 0.3, 3.0, 0.6))
	sfx.kill = _wav(_mix(_tone(0.1, 660, 660, 1, 0.16, 2.0), _tone(0.2, 990, 1320, 1, 0.14, 2.5), 0.07))
	sfx.stomp = _wav(_mix(_tone(0.18, 170, 50, 0, 0.6, 2.0), _tone(0.1, 120, 60, 2, 0.2, 3.0, 0.7)))
	sfx.coin = _wav(_mix(_tone(0.06, 1318, 1318, 3, 0.28, 1.5), _tone(0.14, 1760, 1760, 3, 0.28, 2.0), 0.05))
	sfx.hurt = _wav(_tone(0.3, 320, 110, 2, 0.32, 1.6))
	sfx.dash = _wav(_tone(0.2, 600, 200, 0, 0.45, 1.5, 0.92, 0.02))
	sfx.shock = _wav(_mix(_tone(0.5, 70, 38, 0, 0.7, 1.5), _tone(0.45, 90, 50, 2, 0.3, 2.0, 0.85)))
	sfx.warn = _wav(_tone(0.25, 440, 520, 1, 0.12, 0.6, 0.0, 0.01, 0.4))
	sfx.beam = _wav(_mix(_tone(0.45, 110, 100, 2, 0.25, 1.0, 0.3), _tone(0.45, 220, 210, 1, 0.1, 1.0)))
	sfx.quill = _wav(_tone(0.07, 900, 600, 0, 0.22, 2.0, 0.5))
	sfx.chest = _wav(_seq([523.0, 659.0, 784.0, 1046.0], 0.1, 0, 0.3, 3.0))
	sfx.checkpoint = _wav(_mix(_tone(0.8, 784, 784, 0, 0.25, 2.5), _tone(0.8, 1175, 1175, 0, 0.18, 3.0), 0.06))
	sfx.portal = _wav(_tone(1.0, 300, 1200, 0, 0.3, 0.8, 0.0, 0.1, 0.05))
	sfx.roar = _wav(_mix(_tone(1.0, 95, 58, 2, 0.45, 1.2, 0.3, 0.05, 0.06), _tone(0.9, 140, 80, 1, 0.12, 1.5, 0.6)))
	sfx.ui = _wav(_tone(0.05, 900, 700, 0, 0.25, 2.0))
	sfx.buy = _wav(_seq([784.0, 1175.0], 0.08, 3, 0.3, 2.5))
	sfx.levelup = _wav(_seq([523.0, 659.0, 784.0, 1046.0, 1318.0], 0.09, 3, 0.28, 2.0))
	sfx.combo = _wav(_tone(0.08, 880, 880, 3, 0.2, 2.0))
	sfx.land = _wav(_tone(0.08, 120, 60, 0, 0.25, 3.0, 0.7))
	sfx.splat = _wav(_tone(0.2, 300, 110, 0, 0.4, 1.5, 0.0, 0.004, 0.25))
	sfx.burrow = _wav(_tone(0.35, 90, 60, 2, 0.3, 1.0, 0.9))
	sfx.laser = _wav(_tone(0.12, 1300, 700, 1, 0.14, 2.0))
	sfx.bounce = _wav(_tone(0.22, 200, 700, 3, 0.35, 1.5))
	sfx.crumble = _wav(_tone(0.3, 160, 80, 2, 0.25, 1.2, 0.85))


# ---------------- music ----------------
const SONGS := {
	# chords as root frequencies + minor/major flag; bpm
	"gloamwood": {"bpm": 84.0, "chords": [[220.0, 0], [174.6, 1], [130.8, 1], [196.0, 1]], "bright": 0.0, "boss": false},
	"crystal": {"bpm": 92.0, "chords": [[164.8, 0], [130.8, 1], [196.0, 1], [146.8, 1]], "bright": 1.0, "boss": false},
	"emberfen": {"bpm": 78.0, "chords": [[146.8, 0], [116.5, 1], [196.0, 0], [220.0, 1]], "bright": 0.0, "boss": false},
	"boss": {"bpm": 132.0, "chords": [[220.0, 0], [220.0, 0], [174.6, 1], [164.8, 1]], "bright": 0.5, "boss": true},
	"menu": {"bpm": 70.0, "chords": [[220.0, 0], [196.0, 1], [174.6, 1], [164.8, 1]], "bright": 0.3, "boss": false},
}


func _gen_music(key: String) -> AudioStreamWAV:
	var song: Dictionary = SONGS.get(key, SONGS.gloamwood)
	var beat: float = 60.0 / float(song.bpm)
	var bars = 8
	var n = int(bars * 4 * beat * RATE)
	var buf = PackedFloat32Array()
	buf.resize(n)
	var boss: bool = song.boss
	var bright: float = song.bright
	var rng = RandomNumberGenerator.new()
	rng.seed = hash(key)
	var arp_pat = [0, 1, 2, 1, 0, 2, 1, 2]
	for i in n:
		var t = float(i) / RATE
		var bar = int(t / (4.0 * beat))
		var ch: Array = song.chords[bar % 4]
		var root: float = ch[0]
		var third = root * (1.189 if ch[1] == 0 else 1.26)
		var fifth = root * 1.498
		var tones = [root, third, fifth]
		# pad
		var lfo = 0.6 + 0.4 * sin(t * 0.7)
		var pad = (sin(TAU * root * t) + sin(TAU * third * t * 1.002) + sin(TAU * fifth * t * 0.998) + 0.5 * sin(TAU * root * 0.5 * t)) * 0.045 * lfo
		# arpeggio
		var st = beat * 0.5
		var step = int(t / st)
		var tt = t - step * st
		var note: float = tones[arp_pat[step % 8]] * (2.0 if (bar >= 4 or bright > 0.5) else 1.0) * (2.0 if boss else 1.0)
		var tri = 4.0 * absf(fmod(note * tt, 1.0) - 0.5) - 1.0
		var arp = tri * exp(-tt * (7.0 if not boss else 12.0)) * (0.075 + bright * 0.03)
		# bass
		var bt = fmod(t, beat * 2.0)
		var bass = sin(TAU * root * 0.5 * t) * exp(-bt * 2.0) * 0.12
		if boss:
			var saw = 2.0 * fmod(root * 0.5 * t, 1.0) - 1.0
			bass = saw * exp(-fmod(t, beat * 0.5) * 6.0) * 0.08
		# percussion
		var hb = fmod(t + beat * 0.5, beat)
		var hat = (rng.randf() * 2.0 - 1.0) * exp(-hb * 45.0) * 0.025
		var kick = 0.0
		if boss:
			var kb = fmod(t, beat)
			kick = sin(TAU * (60.0 - kb * 40.0) * kb) * exp(-kb * 9.0) * 0.32
		buf[i] = pad + arp + bass + hat + kick
	# soft fade at loop seam
	for i in 400:
		var k = float(i) / 400.0
		buf[i] *= k
		buf[n - 1 - i] *= k
	return _wav(buf, true)
