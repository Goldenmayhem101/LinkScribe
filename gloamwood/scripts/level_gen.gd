class_name LevelGen
extends RefCounted
## Builds a stage from a seed. Chunks: flat, gap, step, floaters, tower, drop, arena,
## mover (moving ledge), crumble (falling ledges), thorns, bounce (bonus ledge up high).
## Every hop on the main path is checked against the hero's jump physics; a helper ledge
## is inserted wherever a jump is impossible. Every 5th stage ends in a boss arena.

const RUN := 150.0
const GRAV := 1900.0
const JUMP_V := 760.0
const MAX_RISE := 135.0
const SOIL := 1400.0

const BIOMES := ["gloamwood", "crystal", "emberfen", "frostveil", "verdant", "voidreach"]
const BIOME_NAMES := {"gloamwood": "Gloamwood", "crystal": "Crystal Caverns", "emberfen": "Emberfen",
	"frostveil": "Frostveil", "verdant": "Verdant Hollow", "voidreach": "Void Reach"}
const STAGES_PER_WORLD := 5
const BUDGET_MULT := [0.6, 1.0, 1.3]
const POWERUPS := {"heal": 3.0, "shield": 1.6, "triple": 1.4, "homing": 1.4, "rapid": 1.2, "magnet": 0.8, "star": 0.5}

var rng := RandomNumberGenerator.new()
var solids: Array = []
var bonus: Array = []
var coins: Array = []
var enemies: Array = []
var checkpoints: Array = []
var hazards: Array = []
var bouncers: Array = []
var chests: Array = []
var powerups: Array = []
var helpers_added := 0
var stage := 1
var diff := 0.0
var luck := 0
var difficulty := 1


## Worlds: 5 stages each, the 5th is the boss. After the 6th world the cycle repeats, harder (tier II, III, ...).
static func world_of(s: int) -> int:
	return int((s - 1) / STAGES_PER_WORLD) + 1


static func stage_in_world(s: int) -> int:
	return (s - 1) % STAGES_PER_WORLD + 1


static func biome_for(s: int) -> String:
	return BIOMES[(world_of(s) - 1) % BIOMES.size()]


static func world_name(s: int) -> String:
	var tier = int((world_of(s) - 1) / BIOMES.size())
	var roman = ["", " II", " III", " IV", " V", " VI", " VII", " VIII", " IX", " X"]
	return BIOME_NAMES[biome_for(s)] + (roman[tier] if tier < roman.size() else " +" + str(tier))


static func is_boss_stage(s: int) -> bool:
	return s % 5 == 0


static func seed_for(s: int, run_seed: int) -> int:
	var r = RandomNumberGenerator.new()
	r.seed = hash("gloamwood:%d:%d" % [run_seed, s * 7919 + 13])
	r.randi()
	return r.randi()


static func air_time(rise: float) -> float:
	var disc = JUMP_V * JUMP_V - 2.0 * GRAV * rise
	if disc < 0.0:
		return -1.0
	return (JUMP_V + sqrt(disc)) / GRAV


## Can a single jump from the right edge of `a` land on top of `b`?
static func reachable(a: Rect2, b: Rect2) -> bool:
	var rise = a.position.y - b.position.y
	if rise > MAX_RISE:
		return false
	var dx = b.position.x - a.end.x
	if dx <= 0.0:
		return true
	var t = air_time(rise)
	return t > 0.0 and RUN * t * 0.85 >= dx


func generate(s: int, seed_value: int, opts: Dictionary = {}) -> Dictionary:
	stage = s
	rng.seed = seed_value
	difficulty = int(opts.get("difficulty", 1))
	luck = int(opts.get("luck", 0))
	solids = []
	bonus = []
	coins = []
	enemies = []
	checkpoints = []
	hazards = []
	bouncers = []
	chests = []
	powerups = []
	helpers_added = 0
	var base_diff = 1.0 - exp(-(s - 1) / 7.0)
	diff = clampf(base_diff * [0.6, 1.0, 1.25][difficulty] + (0.12 if difficulty == 2 else 0.0), 0.0, 1.0)
	var budget = minf(3.0 + s * 0.9 + maxf(s - 3, 0) * 0.2, 16.0 + s * 0.1) * BUDGET_MULT[difficulty]
	var boss_stage = is_boss_stage(s)
	var x = -240.0
	var h = 0.0
	_ground(x, 560.0, h)
	checkpoints.append(Vector2(-150.0, h))
	x += 560.0
	var target_len = (1500.0 + mini(s, 20) * 160.0) if boss_stage else (2400.0 + mini(s, 18) * 340.0)
	var last_cp = x
	var guard = 0
	while x < target_len and guard < 300:
		guard += 1
		var kind = _pick_chunk(h)
		match kind:
			"flat":
				var w = rng.randf_range(170.0, 320.0)
				_ground(x, w, h)
				if rng.randf() < 0.55:
					_coin_line(x + 30.0, h - 26.0, int(w / 34.0) - 1)
				if budget >= 1.0 and w > 170.0 and rng.randf() < 0.85:
					_enemy(_ground_kind(), Vector2(x + w * 0.65, h), x + 24.0, x + w - 24.0)
					budget -= 1.0
					if budget >= 1.0 and s >= 3 and w > 260.0 and rng.randf() < 0.5:
						var air = rng.randf() < 0.4
						_enemy(_air_kind() if air else _ground_kind(), Vector2(x + w * 0.3, h - (115.0 if air else 0.0)), x + 24.0, x + w - 24.0)
						budget -= 1.0
				_maybe_chest(Vector2(x + w * 0.35, h))
				_maybe_power(Vector2(x + w * 0.5, h - 40.0), 0.18)
				if x - last_cp > 1100.0:
					checkpoints.append(Vector2(x + w * 0.3, h))
					last_cp = x
				x += w
			"gap":
				var g = rng.randf_range(48.0, lerpf(78.0, 112.0, diff))
				var nh = clampf(h + [0.0, 0.0, -40.0, 40.0][rng.randi() % 4], -900.0, 0.0)
				var w2 = rng.randf_range(150.0, 260.0)
				var a = Rect2(x - 10.0, h, 10.0, SOIL)
				var b = Rect2(x + g, nh, w2, SOIL)
				while not reachable(a, b) and g > 40.0:
					g -= 8.0
					b.position.x = x + g
				_coin_arc(x - 20.0, h, g + 40.0, nh)
				x += g
				h = nh
				_ground(x, w2, h)
				x += w2
			"step":
				var dh = 40.0 * (1 + rng.randi() % 2)
				if rng.randf() < 0.5 or h < -500.0:
					dh = -dh
				h = clampf(h - dh, -900.0, 0.0)
				var w3 = rng.randf_range(150.0, 250.0)
				_ground(x, w3, h)
				if budget >= 1.0 and s >= 2 and w3 > 175.0 and rng.randf() < 0.5:
					_enemy(_ground_kind(), Vector2(x + w3 * 0.6, h), x + 24.0, x + w3 - 24.0)
					budget -= 1.0
				x += w3
			"floaters":
				var n = 1 + rng.randi() % 2
				var px = x
				var ph = h
				for i in n:
					px += rng.randf_range(55.0, 85.0)
					var pw = rng.randf_range(84.0, 120.0)
					var py = ph - rng.randf_range(50.0, 100.0)
					_plat(px, py, pw)
					_coin_line(px + 14.0, py - 24.0, int(pw / 30.0))
					if budget >= 1.0 and rng.randf() < 0.6 + diff * 0.3:
						_enemy("spike" if rng.randf() < 0.6 or s < 2 else "slime", Vector2(px + pw * 0.5, py), px + 16.0, px + pw - 16.0)
						budget -= 1.0
					px += pw
					ph = py
				_maybe_power(Vector2(px - 40.0, ph - 40.0), 0.35)
				px += rng.randf_range(55.0, 80.0)
				x = px
				h = clampf(ph + rng.randf_range(20.0, 80.0), -900.0, 0.0)
				var w4 = rng.randf_range(170.0, 260.0)
				_ground(x, w4, h)
				x += w4
			"tower":
				var base_w = 150.0
				_ground(x, base_w, h)
				var levels = 3 + rng.randi() % 3 + int(diff * 2.0)
				var col_x = x + base_w + 10.0
				var y = h
				for i in levels:
					y -= rng.randf_range(78.0, 96.0)
					var lx = col_x + (10.0 if i % 2 == 0 else 120.0)
					if i == 2 and rng.randf() < 0.4:
						_crumble(lx, y, 96.0)
					else:
						_plat(lx, y, 96.0)
					if rng.randf() < 0.5:
						coins.append(Vector2(lx + 48.0, y - 30.0))
				if budget >= 1.0 and s >= 2:
					_enemy(_air_kind(), Vector2(col_x + 120.0, h - 120.0), col_x - 40.0, col_x + 260.0)
					budget -= 1.0
				x = col_x + 250.0
				h = clampf(y - rng.randf_range(0.0, 30.0), -900.0, 0.0)
				var w5 = rng.randf_range(220.0, 320.0)
				_ground(x, w5, h)
				_coin_line(x + 40.0, h - 26.0, 5)
				_maybe_chest(Vector2(x + w5 - 50.0, h), 0.15)
				if x - last_cp > 900.0:
					checkpoints.append(Vector2(x + 50.0, h))
					last_cp = x
				x += w5
			"drop":
				var drop = rng.randf_range(120.0, 260.0)
				x += rng.randf_range(20.0, 60.0)
				h = minf(h + drop, 0.0)
				var w6 = rng.randf_range(200.0, 300.0)
				_ground(x, w6, h)
				x += w6
			"arena":
				var w7 = rng.randf_range(360.0, 460.0)
				_ground(x, w7, h)
				if budget >= 1.0:
					_enemy(_ground_kind(), Vector2(x + w7 * 0.7, h), x + 30.0, x + w7 - 30.0)
					budget -= 1.0
				if budget >= 1.0 and s >= 2:
					_enemy(_air_kind(), Vector2(x + w7 * 0.5, h - 115.0), x, x + w7)
					budget -= 1.0
				if budget >= 1.0 and s >= 4:
					_enemy(_ground_kind(), Vector2(x + w7 * 0.35, h), x + 30.0, x + w7 - 30.0)
					budget -= 1.0
				_coin_line(x + 60.0, h - 26.0, 6)
				_maybe_chest(Vector2(x + w7 - 40.0, h), 0.3)
				_maybe_power(Vector2(x + 50.0, h - 40.0), 0.6)
				x += w7
			"mover":
				var gap_w = rng.randf_range(190.0, 250.0)
				var mw = 90.0
				var mx = x + (gap_w - mw) * 0.5
				var my = h - rng.randf_range(10.0, 50.0)
				solids.append({"r": Rect2(mx, my, mw, 18.0), "kind": "move", "base": Vector2(mx, my), "range": rng.randf_range(34.0, 52.0), "speed": rng.randf_range(0.9, 1.4), "phase": rng.randf() * TAU})
				_coin_line(mx + 18.0, my - 26.0, 3)
				x += gap_w
				_ground(x, rng.randf_range(170.0, 240.0), h)
				x += solids[-1].r.size.x
			"crumble":
				var cn = 2 + rng.randi() % 2
				var cx = x
				for i in cn:
					cx += rng.randf_range(50.0, 70.0)
					_crumble(cx, h - rng.randf_range(10.0, 40.0), 58.0)
					coins.append(Vector2(cx + 29.0, solids[-1].r.position.y - 30.0))
					cx += 58.0
				x = cx + rng.randf_range(50.0, 70.0)
				_ground(x, rng.randf_range(170.0, 240.0), h)
				x += solids[-1].r.size.x
			"thorns":
				var tw = rng.randf_range(280.0, 360.0)
				_ground(x, tw, h)
				var thw = rng.randf_range(36.0, lerpf(44.0, 66.0, diff))
				var tx = x + tw * 0.5 - thw * 0.5
				hazards.append(Rect2(tx, h - 10.0, thw, 10.0))
				_coin_arc(tx - 40.0, h, thw + 80.0, h)
				x += tw
			"bounce":
				var bw = rng.randf_range(240.0, 300.0)
				_ground(x, bw, h)
				var bx = x + 70.0
				bouncers.append(Vector2(bx, h))
				# bonus ledge high above, only reachable with the bounce pad
				var top = h - rng.randf_range(250.0, 300.0)
				bonus.append({"r": Rect2(bx + 30.0, top, 110.0, 18.0), "kind": "plat"})
				_coin_line(bx + 40.0, top - 26.0, 4)
				for i in 5:
					coins.append(Vector2(bx, h - 80.0 - i * 34.0))
				if rng.randf() < 0.55 + luck * 0.1:
					chests.append(Vector2(bx + 120.0, top))
				else:
					_maybe_power(Vector2(bx + 110.0, top - 40.0), 1.0)
				x += bw
	if boss_stage:
		var aw = 640.0
		_ground(x, aw, h)
		checkpoints.append(Vector2(x + 40.0, h))
		var boss_hp = int((36 + s * 4) * [0.7, 1.0, 1.3][difficulty])
		var boss = {"pos": Vector2(x + 430.0, h), "min": x + 120.0, "max": x + aw - 60.0, "hp": boss_hp}
		var portal = Vector2(x + aw - 70.0, h)
		powerups.append({"pos": Vector2(x + 90.0, h - 40.0), "kind": "heal"})
		powerups.append({"pos": Vector2(x + 160.0, h - 40.0), "kind": ["shield", "triple", "homing", "rapid"][rng.randi() % 4]})
		x += aw
		_ground(x, 500.0, h)
		_validate()
		return _pack(portal, boss)
	var end_w = 420.0
	_ground(x, end_w, h)
	var portal2 = Vector2(x + 280.0, h)
	x += end_w
	_ground(x, 600.0, h)
	_validate()
	return _pack(portal2, {})


func _pack(portal: Vector2, boss: Dictionary) -> Dictionary:
	var min_y = 0.0
	for s in solids:
		min_y = minf(min_y, s.r.position.y)
	var all_solids = solids.duplicate()
	all_solids.append_array(bonus)
	return {
		"stage": stage, "biome": biome_for(stage),
		"solids": all_solids, "coins": coins, "enemies": enemies,
		"checkpoints": checkpoints, "portal": portal, "boss": boss,
		"hazards": hazards, "bouncers": bouncers, "chests": chests, "powerups": powerups,
		"start_x": -240.0, "end_x": portal.x, "min_y": min_y,
		"helpers": helpers_added, "path_count": solids.size(),
	}


func _pick_chunk(h: float) -> String:
	var table = {
		"flat": 3.0, "gap": 3.0 + diff * 2.0, "step": 2.0, "floaters": 1.5 + diff * 2.0,
		"tower": 0.6 + diff * 1.6, "arena": 0.5 + diff * 1.2, "drop": 0.0,
		"mover": (0.8 + diff) if stage >= 2 else 0.0, "crumble": (0.7 + diff) if stage >= 3 else 0.0,
		"thorns": (0.8 + diff) if stage >= 2 else 0.3, "bounce": 0.7,
	}
	if h < -320.0:
		table["drop"] = 3.0
		table["tower"] = 0.0
	var total = 0.0
	for k in table:
		total += table[k]
	var r = rng.randf() * total
	for k in table:
		r -= table[k]
		if r <= 0.0:
			return k
	return "flat"


func _ground_kind() -> String:
	var table = {"brute": 3.0, "charger": 2.0 if stage >= 2 else 0.0, "slime": 2.0 if stage >= 2 else 0.0, "burrower": 1.5 if stage >= 3 else 0.0}
	return _weighted(table)


func _air_kind() -> String:
	return _weighted({"cyclops": 2.0, "drone": 1.6 if stage >= 4 else 0.0})


func _weighted(table: Dictionary) -> String:
	var total = 0.0
	for k in table:
		total += table[k]
	var r = rng.randf() * total
	for k in table:
		r -= table[k]
		if r <= 0.0:
			return k
	return table.keys()[0]


func _ground(x: float, w: float, top: float) -> void:
	solids.append({"r": Rect2(x, top, w, SOIL), "kind": "ground"})


func _plat(x: float, top: float, w: float) -> void:
	solids.append({"r": Rect2(x, top, w, 18.0), "kind": "plat"})


func _crumble(x: float, top: float, w: float) -> void:
	solids.append({"r": Rect2(x, top, w, 18.0), "kind": "crumble", "base": Vector2(x, top)})


func _coin_line(x: float, y: float, n: int) -> void:
	for i in maxi(n, 0):
		coins.append(Vector2(x + i * 30.0, y))


func _coin_arc(x: float, h: float, span: float, nh: float) -> void:
	for i in 3:
		var t = (i + 1) / 4.0
		coins.append(Vector2(x + span * t, lerpf(h, nh, t) - 26.0 - sin(t * PI) * 70.0))


func _maybe_chest(p: Vector2, extra: float = 0.0) -> void:
	if rng.randf() < 0.1 + extra + luck * 0.04:
		chests.append(p)


func _maybe_power(p: Vector2, chance: float) -> void:
	if rng.randf() < chance:
		var total = 0.0
		for k in POWERUPS:
			total += POWERUPS[k]
		var r = rng.randf() * total
		for k in POWERUPS:
			r -= POWERUPS[k]
			if r <= 0.0:
				powerups.append({"pos": p, "kind": k})
				return


func _enemy(kind: String, pos: Vector2, lo: float, hi: float) -> void:
	var elite = rng.randf() < 0.06 + diff * 0.22
	var golden = not elite and rng.randf() < 0.03 + luck * 0.015
	var hpb = int(stage / 4) + (1 if difficulty == 2 else 0) - (1 if difficulty == 0 else 0)
	enemies.append({"kind": kind, "pos": pos, "min": lo, "max": hi, "elite": elite, "golden": golden, "hpb": hpb})


func _validate() -> void:
	var i = 0
	while i < solids.size() - 1:
		var a: Rect2 = solids[i].r
		var b: Rect2 = solids[i + 1].r
		if not reachable(a, b):
			var mid = Rect2((a.end.x + b.position.x) * 0.5 - 40.0, maxf(b.position.y, a.position.y - 90.0) + 10.0, 80.0, 18.0)
			if mid.position.y > a.position.y - MAX_RISE:
				mid.position.y = minf(mid.position.y, a.position.y - 20.0)
			solids.insert(i + 1, {"r": mid, "kind": "plat"})
			helpers_added += 1
			if helpers_added > 60:
				return
			continue
		i += 1
