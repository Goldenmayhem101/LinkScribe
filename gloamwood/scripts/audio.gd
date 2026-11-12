extends Node
## Autoload "Sfx": all sound is synthesized at runtime (no audio files, no licenses).
## Effects are built at startup; each biome's music loop is generated on a worker thread.

const RATE := 22050

var sfx := {}
var flavor_sfx := {}
var flavor := ""
var flavor_cache := {}
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
	music_player.volume_db = linear_to_db(maxf(_setting("music", 0.85), 0.0005)) + 1.0


## Each world gives the most frequent sounds its own timbre:
##   warm (forest worlds) · glass (crystal / frost) · ember (lower, rounder) · synth (void: retro square)
const FLAVORS := {"gloamwood": "warm", "verdant": "warm", "crystal": "glass", "frostveil": "glass", "emberfen": "ember", "voidreach": "synth"}


func set_flavor(biome: String) -> void:
	var f: String = FLAVORS.get(biome, "warm")
	if f == flavor:
		return
	flavor = f
	if not flavor_cache.has(f):
		flavor_cache[f] = _build_flavor(f)
	flavor_sfx = flavor_cache[f]


func _build_flavor(f: String) -> Dictionary:
	var d = {}
	match f:
		"glass":
			d.jump = _wav(_mix(_tone(0.16, 600, 1100, 0, 0.18, 2.2), _tone(0.16, 1800, 3300, 0, 0.05, 2.5)))
			d.coin = _wav(_mix(_tone(0.12, 1760, 1760, 0, 0.22, 2.5), _tone(0.25, 2637, 2637, 0, 0.14, 3.0), 0.05))
			d.spark = _wav(_mix(_tone(0.14, 2200, 900, 0, 0.2, 2.5), _tone(0.1, 3300, 1500, 0, 0.06, 3.0)))
			d.hit = _wav(_tone(0.1, 1200, 700, 0, 0.2, 3.0, 0.15))
			d.kill = _wav(_seq([1318.0, 1760.0, 2637.0], 0.05, 0, 0.18, 3.0))
		"ember":
			d.jump = _wav(_tone(0.15, 200, 420, 3, 0.24, 2.0))
			d.coin = _wav(_mix(_tone(0.07, 988, 988, 3, 0.26, 1.6), _tone(0.15, 1318, 1318, 3, 0.24, 2.0), 0.05))
			d.spark = _wav(_tone(0.14, 900, 300, 3, 0.3, 2.2, 0.35))
			d.hit = _wav(_tone(0.11, 160, 90, 3, 0.3, 2.5, 0.5))
			d.kill = _wav(_mix(_tone(0.12, 440, 440, 3, 0.18, 2.0), _tone(0.22, 660, 880, 3, 0.16, 2.5), 0.07))
		"synth":
			d.jump = _wav(_tone(0.13, 330, 990, 1, 0.12, 2.0))
			d.coin = _wav(_mix(_tone(0.06, 1568, 1568, 1, 0.12, 1.5), _tone(0.14, 2093, 2093, 1, 0.12, 2.0), 0.05))
			d.spark = _wav(_tone(0.11, 1600, 400, 1, 0.12, 2.0))
			d.hit = _wav(_tone(0.08, 300, 120, 1, 0.16, 3.0, 0.3))
			d.kill = _wav(_seq([523.0, 784.0, 1046.0, 1568.0], 0.04, 1, 0.1, 3.0))
	return d


func play(name: String, pitch: float = 1.0, jitter: float = 0.05, vol_db: float = 0.0) -> void:
	var stream = flavor_sfx.get(name, sfx.get(name))
	if stream == null:
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
	p.stream = stream
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
	sfx.jump = _wav(_tone(0.14, 300, 600, 3, 0.22, 2.0))
	sfx.djump = _wav(_mix(_tone(0.16, 520, 1040, 0, 0.35, 2.0), _tone(0.12, 1040, 1560, 0, 0.12, 2.0), 0.03))
	sfx.spark = _wav(_tone(0.12, 1400, 480, 0, 0.32, 2.5, 0.25))
	sfx.charge = _wav(_tone(0.5, 200, 760, 0, 0.22, 0.3, 0.0, 0.05, 0.08))
	sfx.bigshot = _wav(_mix(_tone(0.32, 220, 70, 0, 0.5, 2.0), _tone(0.3, 300, 100, 2, 0.15, 2.5, 0.6)))
	sfx.hit = _wav(_tone(0.09, 220, 150, 3, 0.26, 3.0, 0.4))
	sfx.kill = _wav(_mix(_tone(0.1, 660, 660, 1, 0.16, 2.0), _tone(0.2, 990, 1320, 1, 0.14, 2.5), 0.07))
	sfx.stomp = _wav(_mix(_tone(0.18, 170, 50, 0, 0.6, 2.0), _tone(0.1, 120, 60, 2, 0.2, 3.0, 0.7)))
	sfx.coin = _wav(_mix(_tone(0.06, 1318, 1318, 3, 0.28, 1.5), _tone(0.14, 1760, 1760, 3, 0.28, 2.0), 0.05))
	sfx.hurt = _wav(_tone(0.3, 320, 110, 2, 0.32, 1.6))
	sfx.dash = _wav(_tone(0.2, 600, 200, 0, 0.45, 1.5, 0.92, 0.02))
	sfx.shock = _wav(_mix(_tone(0.5, 70, 38, 0, 0.7, 1.5), _tone(0.45, 90, 50, 2, 0.3, 2.0, 0.85)))
	sfx.warn = _wav(_tone(0.22, 330, 440, 0, 0.12, 1.4, 0.0, 0.02))
	sfx.beam = _wav(_mix(_tone(0.45, 160, 120, 3, 0.2, 1.4, 0.15), _tone(0.45, 320, 240, 0, 0.08, 1.4)))
	sfx.quill = _wav(_tone(0.07, 900, 600, 0, 0.22, 2.0, 0.5))
	sfx.chest = _wav(_seq([523.0, 659.0, 784.0, 1046.0], 0.1, 0, 0.3, 3.0))
	sfx.checkpoint = _wav(_mix(_tone(0.8, 784, 784, 0, 0.25, 2.5), _tone(0.8, 1175, 1175, 0, 0.18, 3.0), 0.06))
	sfx.portal = _wav(_tone(1.0, 300, 1200, 0, 0.3, 0.8, 0.0, 0.1, 0.05))
	sfx.roar = _wav(_mix(_tone(1.0, 95, 58, 2, 0.45, 1.2, 0.3, 0.05, 0.06), _tone(0.9, 140, 80, 1, 0.12, 1.5, 0.6)))
	sfx.ui = _wav(_tone(0.05, 900, 700, 0, 0.25, 2.0))
	sfx.buy = _wav(_seq([784.0, 1175.0], 0.08, 3, 0.3, 2.5))
	sfx.levelup = _wav(_seq([523.0, 659.0, 784.0, 1046.0, 1318.0], 0.09, 3, 0.28, 2.0))
	sfx.combo = _wav(_tone(0.07, 880, 880, 0, 0.1, 2.5))
	sfx.land = _wav(_tone(0.07, 110, 60, 0, 0.14, 3.0, 0.3))
	sfx.splat = _wav(_tone(0.2, 300, 110, 0, 0.4, 1.5, 0.0, 0.004, 0.25))
	sfx.burrow = _wav(_tone(0.35, 90, 60, 2, 0.3, 1.0, 0.9))
	sfx.laser = _wav(_tone(0.12, 1100, 600, 3, 0.14, 2.0))
	sfx.bounce = _wav(_tone(0.22, 200, 700, 3, 0.35, 1.5))
	sfx.lock = _wav(_seq([880.0, 1320.0], 0.05, 0, 0.22, 2.5))
	sfx.scatter = _wav(_mix(_tone(0.16, 500, 150, 0, 0.35, 2.0, 0.6), _tone(0.1, 900, 300, 3, 0.15, 2.5)))
	sfx.shard = _wav(_mix(_tone(0.12, 2600, 1400, 0, 0.16, 2.5), _tone(0.12, 3900, 2100, 0, 0.06, 3.0)))
	sfx.whoosh = _wav(_tone(0.3, 300, 700, 0, 0.3, 1.0, 0.85, 0.05))
	sfx.zap = _wav(_tone(0.25, 900, 300, 2, 0.16, 1.5, 0.45, 0.004, 0.3))
	sfx.mortar = _wav(_mix(_tone(0.2, 160, 90, 0, 0.45, 2.0), _tone(0.12, 400, 200, 3, 0.15, 2.0, 0.5)))
	sfx.wisp = _wav(_tone(0.2, 700, 1200, 0, 0.18, 1.5, 0.0, 0.01, 0.15))
	sfx.boom = _wav(_mix(_tone(0.6, 90, 35, 0, 0.7, 1.5), _tone(0.5, 120, 50, 2, 0.25, 2.0, 0.9)))
	sfx.slash = _wav(_tone(0.16, 900, 250, 0, 0.32, 2.0, 0.8, 0.01))
	sfx.thunder = _wav(_thunder())
	sfx.death = _wav(_mix(_tone(0.7, 520, 90, 3, 0.4, 1.6, 0.0, 0.004, 0.02), _tone(0.9, 260, 60, 0, 0.35, 1.4), 0.12))
	sfx.crumble = _wav(_tone(0.3, 160, 80, 3, 0.2, 1.4, 0.5))
	sfx.power = _wav(_seq([659.0, 880.0, 1175.0, 1568.0], 0.06, 0, 0.3, 2.0))
	sfx.heal = _wav(_seq([523.0, 784.0, 1046.0], 0.08, 0, 0.28, 2.0))
	sfx.shield = _wav(_mix(_tone(0.25, 400, 900, 0, 0.25, 1.2), _tone(0.3, 800, 1600, 0, 0.1, 1.5), 0.05))
	sfx.lance = _wav(_mix(_tone(0.18, 900, 300, 0, 0.3, 2.0), _tone(0.18, 1800, 600, 3, 0.1, 2.5)))


# ---------------- music ----------------
const SONGS := {
	# chords as root frequencies + minor/major flag; bpm
	"gloamwood": {"bpm": 84.0, "chords": [[220.0, 0], [174.6, 1], [130.8, 1], [196.0, 1]], "bright": 0.0, "boss": false},
	"crystal": {"bpm": 92.0, "chords": [[164.8, 0], [130.8, 1], [196.0, 1], [146.8, 1]], "bright": 1.0, "boss": false},
	"emberfen": {"bpm": 78.0, "chords": [[146.8, 0], [116.5, 1], [196.0, 0], [220.0, 1]], "bright": 0.0, "boss": false},
	"frostveil": {"bpm": 66.0, "chords": [[174.6, 1], [146.8, 0], [130.8, 1], [196.0, 1]], "bright": 1.0, "boss": false, "bell": true},
	"verdant": {"bpm": 100.0, "chords": [[196.0, 1], [164.8, 0], [130.8, 1], [146.8, 1]], "bright": 0.6, "boss": false},
	"voidreach": {"bpm": 112.0, "chords": [[155.6, 0], [123.5, 1], [138.6, 1], [185.0, 0]], "bright": 0.4, "boss": false, "synth": true},
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
	var bell: bool = song.get("bell", false)
	var synth: bool = song.get("synth", false)
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
		var tri = sin(TAU * note * tt) * 0.8 + sin(TAU * note * 2.0 * tt) * 0.15
		if bell:
			tri = sin(TAU * note * tt) * 0.6 + sin(TAU * note * 2.76 * tt) * 0.25 + sin(TAU * note * 5.4 * tt) * 0.1
		elif synth:
			var ph = fmod(note * tt, 1.0)
			tri = (1.0 if ph < 0.3 else -1.0) * 0.45 + sin(TAU * note * tt) * 0.35
		var arp = tri * exp(-tt * (6.0 if not boss else 10.0) * (0.5 if bell else 1.0)) * (0.07 + bright * 0.025)
		# bass
		var bt = fmod(t, beat * 2.0)
		var bass = sin(TAU * root * 0.5 * t) * exp(-bt * 2.0) * 0.12
		if synth:
			var pulse = exp(-fmod(t, beat * 0.5) * 8.0)
			bass = sin(TAU * root * 0.5 * t) * pulse * 0.16
		if boss:
			var saw = 2.0 * fmod(root * 0.5 * t, 1.0) - 1.0
			bass = saw * exp(-fmod(t, beat * 0.5) * 6.0) * 0.08
		# percussion
		var hb = fmod(t + beat * 0.5, beat)
		var hat = sin(TAU * 4200.0 * hb) * exp(-hb * 70.0) * (0.012 if (boss or synth) else 0.0)
		var kick = 0.0
		if boss:
			var kb = fmod(t, beat)
			kick = sin(TAU * (60.0 - kb * 40.0) * kb) * exp(-kb * 9.0) * 0.32
		buf[i] = (pad * 1.3 + arp + bass + hat + kick) * 1.25
	# soft fade at loop seam
	for i in 400:
		var k = float(i) / 400.0
		buf[i] *= k
		buf[n - 1 - i] *= k
	return _wav(buf, true)


func _thunder() -> PackedFloat32Array:
	# sharp crack, then a long low rumble that rolls in waves
	var dur = 3.4
	var n = int(dur * RATE)
	var buf = PackedFloat32Array()
	buf.resize(n)
	var lp1 = 0.0
	var lp2 = 0.0
	for i in n:
		var t = float(i) / RATE
		var w = randf() * 2.0 - 1.0
		lp1 = lerpf(lp1, w, 0.5)
		lp2 = lerpf(lp2, w, 0.02)
		var crack = lp1 * exp(-t * 9.0) * (1.0 if t > 0.004 else t / 0.004)
		var roll = 0.6 + 0.4 * sin(t * 5.3) * sin(t * 2.1 + 1.0)
		var rumble = lp2 * 9.0 * minf(1.0, t / 0.08) * exp(-t * 0.9) * roll
		buf[i] = clampf(crack * 0.55 + rumble * 0.75, -1.0, 1.0)
	return buf
