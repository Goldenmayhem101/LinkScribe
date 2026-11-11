class_name LevelGen
extends RefCounted
## Builds a stage from a seed: chunks of terrain, platforms, coins, enemies,
## checkpoints and an exit portal. Every hop is checked against the hero's
## jump physics so a generated stage is always completable.

const RUN := 150.0
const GRAV := 1900.0
const JUMP_V := 760.0
const MAX_RISE := 135.0
const SOIL := 1400.0

const BIOMES := ["gloamwood", "crystal", "emberfen"]
const BIOME_NAMES := {"gloamwood": "Gloamwood", "crystal": "Crystal Caverns", "emberfen": "Emberfen"}

var rng = RandomNumberGenerator.new()
var solids: Array = []
var coins: Array = []
var enemies: Array = []
var checkpoints: Array = []
var helpers_added = 0


static func biome_for(stage: int) -> String:
	return BIOMES[int((stage - 1) / 2) % BIOMES.size()]


static func seed_for(stage: int, run_seed: int) -> int:
	var r = RandomNumberGenerator.new()
	r.seed = hash("gloamwood:%d:%d" % [run_seed, stage * 7919 + 13])
	r.randi()
	return r.randi()


## Time in the air before landing on a surface `rise` px above take-off (negative = below).
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


func generate(stage: int, seed_value: int) -> Dictionary:
	rng.seed = seed_value
	solids = []
	coins = []
	enemies = []
	checkpoints = []
	helpers_added = 0
	var diff = clampf((stage - 1) / 9.0, 0.0, 1.0)
	var budget = 2.0 + stage * 1.25
	var x = -240.0
	var h = 0.0
	_ground(x, 560.0, h)
	checkpoints.append(Vector2(-150.0, h))
	x += 560.0
	var target_len = 2400.0 + stage * 380.0
	var last_cp = x
	var guard = 0
	while x < target_len and guard < 300:
		guard += 1
		var kind = _pick_chunk(diff, h)
		match kind:
			"flat":
				var w = rng.randf_range(170.0, 320.0)
				_ground(x, w, h)
				if rng.randf() < 0.55:
					_coin_line(x + 30.0, h - 26.0, int(w / 34.0) - 1)
				if budget >= 1.0 and w > 210.0 and rng.randf() < 0.65:
					_enemy("brute", Vector2(x + w * 0.65, h), x + 24.0, x + w - 24.0, diff)
					budget -= 1.0
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
					if budget >= 1.0 and rng.randf() < 0.45 + diff * 0.3:
						_enemy("spike", Vector2(px + pw * 0.5, py), px + 16.0, px + pw - 16.0, diff)
						budget -= 1.0
					px += pw
					ph = py
				px += rng.randf_range(55.0, 80.0)
				x = px
				h = clampf(ph + rng.randf_range(20.0, 80.0), -900.0, 0.0)
				var w4 = rng.randf_range(170.0, 260.0)
				_ground(x, w4, h)
				x += w4
			"tower":
				# vertical climb: zig-zag ledges up to a high plateau
				var base_w = 150.0
				_ground(x, base_w, h)
				var levels = 3 + rng.randi() % 3 + int(diff * 2.0)
				var col_x = x + base_w + 10.0
				var y = h
				for i in levels:
					y -= rng.randf_range(78.0, 96.0)
					var lx = col_x + (10.0 if i % 2 == 0 else 120.0)
					_plat(lx, y, 96.0)
					if rng.randf() < 0.5:
						coins.append(Vector2(lx + 48.0, y - 30.0))
				if budget >= 1.0 and stage >= 2:
					_enemy("cyclops", Vector2(col_x + 120.0, h - 160.0), col_x - 40.0, col_x + 260.0, diff)
					budget -= 1.0
				x = col_x + 250.0
				h = clampf(y - rng.randf_range(0.0, 30.0), -900.0, 0.0)
				var w5 = rng.randf_range(220.0, 320.0)
				_ground(x, w5, h)
				_coin_line(x + 40.0, h - 26.0, 5)
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
					_enemy("brute", Vector2(x + w7 * 0.7, h), x + 30.0, x + w7 - 30.0, diff)
					budget -= 1.0
				if budget >= 1.0 and stage >= 2:
					_enemy("cyclops", Vector2(x + w7 * 0.5, h - 170.0), x, x + w7, diff)
					budget -= 1.0
				_coin_line(x + 60.0, h - 26.0, 6)
				x += w7
	# exit runway + portal
	var end_w = 420.0
	_ground(x, end_w, h)
	var portal = Vector2(x + 280.0, h)
	x += end_w
	_ground(x, 600.0, h)
	_validate()
	var min_y = 0.0
	for s in solids:
		min_y = minf(min_y, s.r.position.y)
	return {
		"stage": stage, "seed": seed_value, "biome": biome_for(stage),
		"solids": solids, "coins": coins, "enemies": enemies,
		"checkpoints": checkpoints, "portal": portal,
		"start_x": -240.0, "end_x": portal.x, "min_y": min_y,
		"helpers": helpers_added,
	}


func _pick_chunk(diff: float, h: float) -> String:
	var table = {
		"flat": 3.0, "gap": 3.0 + diff * 2.0, "step": 2.0, "floaters": 1.5 + diff * 2.0,
		"tower": 0.6 + diff * 1.6, "arena": 0.5 + diff * 1.2, "drop": 0.0,
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


func _ground(x: float, w: float, top: float) -> void:
	solids.append({"r": Rect2(x, top, w, SOIL), "kind": "ground"})


func _plat(x: float, top: float, w: float) -> void:
	solids.append({"r": Rect2(x, top, w, 18.0), "kind": "plat"})


func _coin_line(x: float, y: float, n: int) -> void:
	for i in maxi(n, 0):
		coins.append(Vector2(x + i * 30.0, y))


func _coin_arc(x: float, h: float, span: float, nh: float) -> void:
	for i in 3:
		var t = (i + 1) / 4.0
		var y = lerpf(h, nh, t) - 26.0 - sin(t * PI) * 70.0
		coins.append(Vector2(x + span * t, y))


func _enemy(kind: String, pos: Vector2, lo: float, hi: float, diff: float) -> void:
	var elite = rng.randf() < 0.08 + diff * 0.22
	enemies.append({"kind": kind, "pos": pos, "min": lo, "max": hi, "elite": elite})


## Walk the path in build order; insert a helper ledge wherever a hop is impossible.
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
