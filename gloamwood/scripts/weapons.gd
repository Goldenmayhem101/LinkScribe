class_name Weapons
extends Node2D
## All combat that isn't the monsters themselves: the hero's ranged weapons, the automatic
## melee weapon, tap-to-target lock-on, and every projectile (friendly and hostile).
##
## Ranged kinds (each looks and behaves differently):
##   spark bolt · seeker wisp (homing) · frost shard (slows) · moon lance (instant beam)
##   ember scatter (5 pellets) · leafwing (boomerang) · storm orb (chain lightning) · star mortar (lobbed AoE)
## Melee: swings by itself whenever a monster comes within reach; also knocks hostile shots away.

var main: Node
var shots: Array = []
var target: Monster = null
var target_t := 0.0
var melee_cd := 0.0
var swing := {}
var add_node: Node2D
var t := 0.0
const UI_FONT := preload("res://assets/fonts/DejaVuSans-Bold.ttf")


func setup(m: Node) -> void:
	main = m
	z_index = 5
	add_node = Node2D.new()
	add_node.z_index = 6
	add_node.material = m.add_mat
	add_node.draw.connect(_draw_add)
	add_child(add_node)


func clear() -> void:
	shots.clear()
	target = null
	swing = {}


# ---------------- stats ----------------
func ranged_mult() -> float:
	return 1.0 + 0.1 * Profile.upgrade_level("power")


func melee_mult() -> float:
	return 1.0 + 0.1 * Profile.upgrade_level("blade")


func rate_mult() -> float:
	return pow(0.95, Profile.upgrade_level("haste")) * (0.5 if main.powers.has("rapid") else 1.0)


func wcol(w: Dictionary) -> Color:
	return Color(w.col[0], w.col[1], w.col[2])


# ---------------- targeting ----------------
func valid_target() -> bool:
	return target != null and is_instance_valid(target) and not target.dead


## Tap on the screen: lock onto the monster under the finger (tap it again, or empty ground, to release).
func try_target(screen_pos: Vector2) -> bool:
	var world_pos = get_viewport().get_canvas_transform().affine_inverse() * screen_pos
	var best = null
	var best_d = 999.0
	for mo in main.monsters:
		if not is_instance_valid(mo) or mo.dead:
			continue
		var d = world_pos.distance_to(mo.world_center())
		if d < mo.radius + 34.0 and d < best_d:
			best = mo
			best_d = d
	if best == null:
		if valid_target():
			target = null
			Sfx.play("ui", 0.8)
		return false
	if best == target:
		target = null
		Sfx.play("ui", 0.8)
	else:
		target = best
		target_t = 0.0
		Sfx.play("lock")
	return true


func aim_target(max_range: float = 360.0):
	var p: Player = main.player
	var src = p.body_center()
	if valid_target() and target.vulnerable() and src.distance_to(target.world_center()) < 520.0:
		return target
	if not Profile.setting("aim_assist"):
		return null
	var fwd = Vector2(p.facing, 0)
	var best = null
	var best_d = max_range
	for mo in main.monsters:
		if not is_instance_valid(mo) or not mo.vulnerable():
			continue
		var to = mo.world_center() - src
		var dl = to.length()
		if dl < best_d and to.normalized().dot(fwd) > 0.3:
			best = mo
			best_d = dl
	return best


func aim_dir() -> Vector2:
	var p: Player = main.player
	var tg = aim_target()
	if tg == null:
		return Vector2(p.facing, 0)
	var d = (tg.world_center() - p.body_center()).normalized()
	if signf(d.x) != 0.0 and absf(d.x) > 0.05:
		p.facing = signf(d.x)
	return d


# ---------------- firing ----------------
func fire(big: bool) -> void:
	var p: Player = main.player
	var w = Profile.weapon_def()
	p.fire_cd = maxf(float(w.rate) * rate_mult(), 0.07)
	var dir = aim_dir()
	var o = p.body_center() + dir * 16.0 + Vector2(0, -4.0)
	var col = wcol(w)
	var mult = ranged_mult()
	var hero_mod: String = p.hero.get("spark", "single") if not p.hero.is_empty() else "single"
	var pierce = hero_mod == "pierce"
	var homing = main.powers.has("homing")
	p.shoot_t = 0.15
	if big:
		_add({"kind": "big", "pos": o, "vel": dir * 360.0, "dmg": (1.5 + float(w.dmg) * 1.2) * mult, "r": 14.0, "pierce": false, "home": homing, "col": col})
		Sfx.play("bigshot")
		main.shake(4.0)
		main.fx_burst(o, col, 16, 160.0, 0.4, 0.0, 0.08)
		main.fx_flash(o, col, 0.35)
		return
	var spread: Array = [0.0]
	if hero_mod == "spread":
		spread = [0.0, -0.2, 0.2]
	if main.powers.has("triple"):
		spread = spread + [-0.32, 0.32]
	var dmg = float(w.dmg) * mult * (1.25 if pierce else 1.0)
	match w.id:
		"lance":
			for a in spread:
				_lance(o, dir.rotated(a), dmg, col)
			Sfx.play("lance")
		"scatter":
			for a in spread:
				for k in 5:
					var dd = dir.rotated(a + (k - 2) * 0.16 + randf_range(-0.04, 0.04))
					_add({"kind": "pellet", "pos": o, "vel": dd * randf_range(380.0, 450.0), "dmg": dmg, "r": 4.0, "pierce": pierce, "home": false, "max": 0.42, "col": col})
			Sfx.play("scatter")
			main.shake(2.0)
		"shard":
			for a in spread:
				for k in 3:
					_add({"kind": "shard", "pos": o, "vel": dir.rotated(a + (k - 1) * 0.1) * 420.0, "dmg": dmg, "r": 5.0, "pierce": pierce, "home": homing, "col": col, "slow": true})
			Sfx.play("shard")
		"boomerang":
			for a in spread:
				_add({"kind": "leaf", "pos": o, "vel": dir.rotated(a) * 330.0, "dmg": dmg, "r": 9.0, "pierce": true, "home": false, "max": 1.6, "col": col, "back": false})
			Sfx.play("whoosh")
		"thunder":
			for a in spread:
				_add({"kind": "orb", "pos": o, "vel": dir.rotated(a) * 200.0, "dmg": dmg, "r": 9.0, "pierce": false, "home": true, "max": 2.0, "col": col})
			Sfx.play("zap", 0.8)
		"cannon":
			var tg = aim_target(420.0)
			var dest = tg.world_center() if tg != null else o + Vector2(p.facing * 200.0, 20.0)
			for a in spread:
				var tt = 0.75
				var dv = (dest - o) + Vector2(a * 120.0, 0)
				var v = Vector2(dv.x / tt, (dv.y - 0.5 * 700.0 * tt * tt) / tt)
				_add({"kind": "shell", "pos": o, "vel": v, "dmg": dmg, "r": 8.0, "pierce": false, "home": false, "max": 2.0, "col": col, "grav": 700.0})
			Sfx.play("mortar")
		"seeker":
			for a in spread:
				_add({"kind": "wisp", "pos": o, "vel": dir.rotated(a) * 290.0, "dmg": dmg, "r": 6.0, "pierce": pierce, "home": true, "max": 1.8, "col": col})
			Sfx.play("wisp")
		_:
			for a in spread:
				_add({"kind": "bolt", "pos": o, "vel": dir.rotated(a) * 470.0, "dmg": dmg, "r": 4.5, "pierce": pierce, "home": homing, "col": col})
			Sfx.play("spark")
	main.fx_burst(o, col, 6, 80.0, 0.25, 0.0, 0.05)
	main.hud.fire_flash = 1.0


func _add(d: Dictionary) -> void:
	d["life"] = 0.0
	d["trail"] = []
	d["hit"] = []
	d["friendly"] = true
	d["spin"] = randf() * TAU
	if not d.has("max"):
		d["max"] = 1.6 if d.get("home", false) else 1.1
	shots.append(d)


func enemy_shot(kind: String, pos: Vector2, vel: Vector2) -> void:
	shots.append({"kind": kind, "pos": pos, "vel": vel, "life": 0.0, "trail": [], "hit": [], "friendly": false, "max": 2.5, "r": 4.0, "spin": 0.0,
		"dmg": {"quill": 8.0, "ebolt": 8.0, "clod": 10.0}.get(kind, 8.0)})


func _lance(o: Vector2, dir: Vector2, dmg: float, col: Color) -> void:
	var length = 300.0
	var end = o + dir * length
	for i in 30:
		var q = o + dir * (i * 10.0)
		if main.solid_at(q):
			end = q
			break
	var seg_len = (end - o).length()
	for mo in main.monsters:
		if not is_instance_valid(mo) or not mo.vulnerable():
			continue
		var rel = mo.world_center() - o
		var along = rel.dot(dir)
		if along > 0.0 and along < seg_len and absf(rel.cross(dir)) < mo.radius + 8.0:
			_damage(mo, dmg, o.x, col, mo.world_center())
	main.fx_items.append({"type": "lance", "pos": o, "end": end, "life": 0.0, "max": 0.22, "col": col})
	main.shake(2.5)


func _damage(mo: Monster, dmg: float, from_x: float, col: Color, at: Vector2, small: bool = false) -> void:
	mo.hit(dmg, from_x)
	main.register_hit()
	main.fx_streaks(at, col, 7 if small else 10)
	if not small:
		main.hitstop(0.045)
		main.shake(2.5)


func _explode(pos: Vector2, dmg: float, col: Color, radius: float = 64.0) -> void:
	for mo in main.monsters:
		if is_instance_valid(mo) and mo.vulnerable() and pos.distance_to(mo.world_center()) < radius + mo.radius:
			_damage(mo, dmg, pos.x, col, mo.world_center(), true)
	main.fx_burst(pos, col, 30, 240.0, 0.6, 80.0, 0.09)
	main.fx_burst(pos, Color(1, 0.95, 0.8), 12, 120.0, 0.4, 0.0, 0.12)
	main.fx_ring(pos, col, radius)
	main.fx_flash(pos, col, 0.6)
	main.fx_dust(pos + Vector2(0, 10), 10, 80.0)
	main.shake(7.0)
	Sfx.play("boom")


func _chain(from: Monster, dmg: float, col: Color) -> void:
	var src = from.world_center()
	var done = [from]
	var cur = src
	for i in 3:
		var best = null
		var bd = 150.0
		for mo in main.monsters:
			if is_instance_valid(mo) and mo.vulnerable() and not done.has(mo):
				var d = cur.distance_to(mo.world_center())
				if d < bd:
					bd = d
					best = mo
		if best == null:
			break
		done.append(best)
		var nxt = best.world_center()
		main.fx_items.append({"type": "zap", "pos": cur, "end": nxt, "life": 0.0, "max": 0.25, "col": col, "seed": randi()})
		_damage(best, dmg * 0.6, cur.x, col, nxt, true)
		cur = nxt


# ---------------- melee ----------------
func _melee(dt: float) -> void:
	melee_cd = maxf(melee_cd - dt, 0.0)
	if not swing.is_empty():
		swing.t += dt
		if swing.t >= swing.dur:
			swing = {}
	if melee_cd > 0.0:
		return
	var p: Player = main.player
	var w = Profile.melee_def()
	var reach: float = w.reach
	var c = p.body_center()
	var best = null
	var bd = 9999.0
	for mo in main.monsters:
		if not is_instance_valid(mo) or not mo.vulnerable():
			continue
		var d = c.distance_to(mo.world_center()) - mo.radius
		if d < reach and d < bd:
			bd = d
			best = mo
	var threat = false
	for s in shots:
		if not s.friendly and s.pos.distance_to(c) < reach + 6.0:
			threat = true
			break
	if best == null and not threat:
		return
	var dir = Vector2(p.facing, 0)
	if best != null:
		dir = (best.world_center() - c).normalized()
		if absf(dir.x) > 0.1:
			p.facing = signf(dir.x)
	_swing(w, dir)


func _swing(w: Dictionary, dir: Vector2) -> void:
	var p: Player = main.player
	melee_cd = float(w.rate) * rate_mult() * (1.0 if not main.powers.has("rapid") else 1.6)
	var c = p.body_center()
	var reach: float = w.reach
	var half = deg_to_rad(float(w.arc)) * 0.5
	var col = wcol(w)
	var dmg = float(w.dmg) * melee_mult()
	swing = {"t": 0.0, "dur": 0.2 if w.id != "hammer" else 0.28, "ang": dir.angle(), "arc": half * 2.0, "reach": reach, "col": col, "id": w.id}
	p.swing_t = swing.dur
	p.swing_id = w.id
	var hit_any = false
	for mo in main.monsters:
		if not is_instance_valid(mo) or not mo.vulnerable():
			continue
		var to = mo.world_center() - c
		if to.length() - mo.radius > reach:
			continue
		if absf(wrapf(to.angle() - dir.angle(), -PI, PI)) > half + 0.3:
			continue
		mo.hit(dmg, c.x)
		mo.knock *= 1.8 if w.id == "hammer" else 1.0
		main.register_hit()
		main.fx_streaks(mo.world_center(), col, 12)
		hit_any = true
	# knock hostile shots out of the air
	for s in shots:
		if not s.friendly and s.pos.distance_to(c) < reach + 6.0:
			s.life = 99.0
			main.fx_burst(s.pos, col, 6, 90.0, 0.25, 0.0, 0.05)
			main.float_text(s.pos + Vector2(0, -10), "Parry!", col)
	if w.id == "hammer":
		main.fx_dust(p.position + Vector2(p.facing * 20.0, 0), 10, 90.0)
		main.shake(6.0)
	Sfx.play("slash" if w.id != "hammer" else "stomp", 1.0 if w.id != "rapier" else 1.4, 0.08, -2.0)
	if hit_any:
		main.hitstop(0.06)
		main.shake(3.5)


# ---------------- update ----------------
func update(dt: float) -> void:
	t += dt
	target_t += dt
	if target != null and (not is_instance_valid(target) or target.dead):
		target = null
	_melee(dt)
	var keep: Array = []
	for s in shots:
		s.life += dt
		if s.friendly and s.get("home", false):
			var tg = target if valid_target() else null
			if tg == null:
				var bd = 380.0
				for mo in main.monsters:
					if is_instance_valid(mo) and mo.vulnerable():
						var d = s.pos.distance_to(mo.world_center())
						if d < bd:
							bd = d
							tg = mo
			if tg != null and tg.vulnerable():
				var want = (tg.world_center() - s.pos).normalized() * s.vel.length()
				s.vel = s.vel.lerp(want, minf(1.0, dt * (5.0 if s.kind == "orb" else 7.0)))
		match s.kind:
			"quill":
				s.vel.y += 160.0 * dt
			"clod":
				s.vel.y += 900.0 * dt
			"shell":
				s.vel.y += float(s.grav) * dt
			"leaf":
				var p: Player = main.player
				if s.life > 0.42 and not s.back:
					s.back = true
					s.hit = []
				if s.back:
					var want2 = (p.body_center() - s.pos).normalized() * 380.0
					s.vel = s.vel.lerp(want2, minf(1.0, dt * 6.0))
					if s.pos.distance_to(p.body_center()) < 18.0:
						s.life = 99.0
				else:
					s.vel *= 1.0 - dt * 1.8
		s.pos += s.vel * dt
		s.spin += dt * (18.0 if s.kind == "leaf" else 6.0)
		s.trail.push_front(s.pos)
		if s.trail.size() > (12 if s.kind in ["wisp", "orb", "big"] else 8):
			s.trail.pop_back()
		var alive = s.life < s.max
		if alive and s.kind != "leaf" and main.solid_at(s.pos):
			alive = false
			if s.kind == "shell":
				_explode(s.pos, s.dmg, s.col)
			else:
				main.fx_burst(s.pos, s.col if s.friendly else main.pal.dusk, 6, 70.0, 0.3, 100.0, 0.05)
			if s.kind == "clod":
				main.fx_dust(s.pos, 6, 50.0)
		if alive and s.friendly:
			for mo in main.monsters:
				if not is_instance_valid(mo) or not mo.vulnerable() or s.hit.has(mo):
					continue
				if s.pos.distance_to(mo.world_center()) < mo.radius + s.r:
					s.hit.append(mo)
					if s.kind == "shell":
						_explode(s.pos, s.dmg, s.col)
						alive = false
						break
					_damage(mo, s.dmg, s.pos.x - s.vel.x, s.col, s.pos, s.kind == "pellet")
					if s.get("slow", false):
						mo.slow_t = 2.2
					if s.kind == "orb":
						_chain(mo, s.dmg, s.col)
					if s.kind == "big":
						main.fx_flash(s.pos, s.col, 0.4)
					if not s.pierce:
						alive = false
						break
		elif alive and not s.friendly:
			if s.pos.distance_to(main.player.body_center()) < 14.0:
				main.hurt(s.pos.x, s.dmg)
				alive = false
		if alive:
			keep.append(s)
	shots = keep
	queue_redraw()
	add_node.queue_redraw()


# ---------------- drawing ----------------
func _draw() -> void:
	for s in shots:
		var d: Vector2 = s.vel.normalized() if s.vel.length() > 1.0 else Vector2.RIGHT
		match s.kind:
			"quill":
				var tail = s.pos - d * 12.0
				var nrm = d.orthogonal() * 2.2
				draw_colored_polygon(PackedVector2Array([s.pos + d * 4.0, tail + nrm, tail - nrm]), main.pal.dusk.lightened(0.15))
				draw_line(tail, s.pos + d * 4.0, main.pal.moon.lerp(main.pal.dusk, 0.3), 0.8, true)
			"clod":
				draw_circle(s.pos, 5.0, main.pal.ink.lerp(main.pal.ember, 0.25))
				draw_circle(s.pos + Vector2(-1.5, -1.5), 2.0, main.pal.ink.lerp(main.pal.ember, 0.45))
			"shard":
				var n2 = d.orthogonal() * 3.0
				var pts = PackedVector2Array([s.pos + d * 9.0, s.pos + n2, s.pos - d * 6.0, s.pos - n2])
				draw_colored_polygon(pts, Color(0.85, 0.95, 1.0))
				draw_colored_polygon(PackedVector2Array([s.pos + d * 9.0, s.pos + n2, s.pos - d * 6.0]), Color(0.55, 0.8, 1.0))
			"leaf":
				var a = s.spin
				var lp = PackedVector2Array()
				for i in 12:
					var u = float(i) / 11.0
					lp.append(s.pos + Vector2(lerpf(-10, 10, u), sin(u * PI) * 5.0).rotated(a))
				for i in range(11, -1, -1):
					var u2 = float(i) / 11.0
					lp.append(s.pos + Vector2(lerpf(-10, 10, u2), -sin(u2 * PI) * 5.0).rotated(a))
				draw_colored_polygon(lp, Color(0.45, 0.85, 0.4))
				draw_line(s.pos + Vector2(-10, 0).rotated(a), s.pos + Vector2(10, 0).rotated(a), Color(0.25, 0.55, 0.25), 1.2, true)
			"shell":
				var st = PackedVector2Array()
				for i in 10:
					var a2 = s.spin + TAU * i / 10.0
					st.append(s.pos + Vector2(cos(a2), sin(a2)) * (8.0 if i % 2 == 0 else 3.5))
				draw_colored_polygon(st, Color(1.0, 0.85, 0.95))
	# lock-on reticle
	if valid_target():
		var c = target.world_center()
		var r = target.radius + 12.0 + sin(t * 6.0) * 2.0
		var pop = clampf(1.6 - target_t * 4.0, 1.0, 1.6)
		r *= pop
		var col = Color(1.0, 0.45, 0.35)
		for i in 4:
			var a3 = t * 1.5 + i * PI * 0.5
			draw_arc(c, r, a3, a3 + 0.7, 8, col, 2.5, true)
			var tip = c + Vector2.from_angle(a3 + 0.35) * (r + 7.0)
			draw_line(c + Vector2.from_angle(a3 + 0.35) * (r + 1.0), tip, col, 2.5, true)
		draw_circle(c, 2.5, col)


func _draw_add() -> void:
	var n = add_node
	for s in shots:
		var col: Color = s.get("col", Color(1, 0.4, 0.3))
		var tr: Array = s.trail
		match s.kind:
			"bolt", "big", "pellet":
				for i in range(tr.size() - 1):
					var a = 1.0 - float(i) / tr.size()
					n.draw_line(tr[i], tr[i + 1], Color(col, a * 0.8), s.r * 1.2 * a + 1.0, true)
				var rr = s.r * (4.5 if s.kind != "pellet" else 3.0)
				n.draw_texture_rect(main.glow, Rect2(s.pos - Vector2(rr, rr), Vector2(rr, rr) * 2.0), false, col)
				n.draw_circle(s.pos, s.r * 0.65, Color(1, 1, 1))
			"wisp":
				for i in range(tr.size() - 1):
					var a2 = 1.0 - float(i) / tr.size()
					var wob = Vector2(0, sin(t * 20.0 + i) * 2.0 * a2)
					n.draw_line(tr[i] + wob, tr[i + 1] + wob, Color(col, a2 * 0.7), 6.0 * a2 + 1.0, true)
				n.draw_texture_rect(main.glow, Rect2(s.pos - Vector2(20, 20), Vector2(40, 40)), false, col)
				n.draw_circle(s.pos, 4.0, Color(1, 0.95, 1))
			"shard":
				n.draw_texture_rect(main.glow, Rect2(s.pos - Vector2(14, 14), Vector2(28, 28)), false, Color(col, 0.7))
				if tr.size() > 2:
					n.draw_line(tr[0], tr[tr.size() - 1], Color(col, 0.35), 3.0, true)
			"leaf":
				n.draw_texture_rect(main.glow, Rect2(s.pos - Vector2(18, 18), Vector2(36, 36)), false, Color(col, 0.5))
				n.draw_arc(s.pos, 13.0, s.spin, s.spin + PI * 1.2, 12, Color(col, 0.5), 2.0, true)
			"orb":
				n.draw_texture_rect(main.glow, Rect2(s.pos - Vector2(30, 30), Vector2(60, 60)), false, col)
				n.draw_circle(s.pos, 6.0, Color(1, 1, 0.9))
				var rng = RandomNumberGenerator.new()
				rng.seed = int(t * 30.0) + int(s.spin * 100.0)
				for k in 3:
					var a3 = rng.randf() * TAU
					var p1 = s.pos
					var pts = PackedVector2Array([p1])
					for j in 3:
						p1 = p1 + Vector2.from_angle(a3 + rng.randf_range(-0.6, 0.6)) * 5.0
						pts.append(p1)
					n.draw_polyline(pts, Color(1, 1, 0.7, 0.9), 1.4, true)
			"shell":
				for i in range(tr.size() - 1):
					var a4 = 1.0 - float(i) / tr.size()
					n.draw_line(tr[i], tr[i + 1], Color(col, a4 * 0.6), 5.0 * a4, true)
				n.draw_texture_rect(main.glow, Rect2(s.pos - Vector2(22, 22), Vector2(44, 44)), false, col)
			"ebolt":
				var d2: Vector2 = s.vel.normalized()
				n.draw_line(s.pos - d2 * 14.0, s.pos, Color(1, 0.35, 0.3), 4.0, true)
				n.draw_line(s.pos - d2 * 10.0, s.pos, Color(1, 0.9, 0.85), 1.5, true)
				n.draw_texture_rect(main.glow, Rect2(s.pos - Vector2(12, 12), Vector2(24, 24)), false, Color(1, 0.3, 0.25, 0.8))
			"quill":
				n.draw_texture_rect(main.glow, Rect2(s.pos - Vector2(10, 10), Vector2(20, 20)), false, Color(main.pal.dusk.lightened(0.4), 0.6))
	# melee swing arc
	if not swing.is_empty():
		var k = swing.t / swing.dur
		var p: Player = main.player
		var c = p.body_center()
		var half = swing.arc * 0.5
		var start = swing.ang - half * (1.0 if p.facing > 0 else -1.0)
		var sweep = swing.arc * smoothstep(0.0, 1.0, k) * (1.0 if p.facing > 0 else -1.0)
		var a0 = start
		var a1 = start + sweep
		var steps = 14
		var outer = PackedVector2Array()
		var inner = PackedVector2Array()
		for i in steps + 1:
			var u = float(i) / steps
			var ang = lerpf(a0, a1, u)
			var fade = u
			outer.append(c + Vector2.from_angle(ang) * swing.reach)
			inner.append(c + Vector2.from_angle(ang) * swing.reach * (0.55 + 0.35 * (1.0 - fade)))
		var poly = PackedVector2Array(outer)
		for i in range(inner.size() - 1, -1, -1):
			poly.append(inner[i])
		var cols = PackedColorArray()
		for i in outer.size():
			cols.append(Color(swing.col, 0.85 * float(i) / outer.size() * (1.0 - k * 0.6)))
		for i in range(inner.size() - 1, -1, -1):
			cols.append(Color(swing.col, 0.0))
		if poly.size() >= 3 and absf(sweep) > 0.15:
			n.draw_polygon(poly, cols)
		n.draw_polyline(outer, Color(1, 1, 1, 0.7 * (1.0 - k)), 2.0, true)
