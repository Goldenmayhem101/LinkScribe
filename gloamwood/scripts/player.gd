class_name Player
extends Node2D
## The hero. Custom platformer physics against the generated rectangles.
## Moves: run, variable jump, air jumps, dash (i-frames, hurts enemies), wall slide + wall jump,
## stomp, tap spark / hold for a charged spark. Drawn procedurally; tinted per hero.

const ACCEL := 1100.0
const GRAV := 1900.0
const JUMP_V := 760.0
const DJUMP_V := 640.0
const HALF_W := 8.0
const HEIGHT := 50.0
const HS := 1.3
const DASH_SPEED := 430.0
const DASH_TIME := 0.16

var main: Node
var vel = Vector2.ZERO
var on_ground := false
var facing := 1.0
var coyote := 0.0
var jump_buf := 0.0
var air_jumps := 1
var max_air_jumps := 1
var run_speed := 150.0
var invuln := 0.0
var squash = Vector2.ONE
var phase := 0.0
var blink_t := 2.0
var fire_cd := 0.0
var step_t := 0.0
var last_safe = Vector2.ZERO
var palette: Dictionary = {}
var hero: Dictionary = {}
var tint = Color.WHITE

var dash_t := 0.0
var dash_cd := 0.0
var dash_cd_max := 0.8
var dash_dir := 1.0
var wall_dir := 0.0
var wall_lock := 0.0
var charge := 0.0
var riding = null
var ghosts: Array = []

var scarf_pts: Array[Vector2] = []
var scarf_prev: Array[Vector2] = []
var scarf_line: Line2D
var aura: Sprite2D
var pool: Sprite2D
var light: PointLight2D
var charge_glow: Sprite2D
var t := 0.0


func setup(m: Node, glow: Texture2D, pal: Dictionary) -> void:
	main = m
	var add = CanvasItemMaterial.new()
	add.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	aura = Sprite2D.new()
	aura.texture = glow
	aura.material = add
	aura.position = Vector2(0, -34)
	aura.scale = Vector2(1.25, 1.25)
	aura.show_behind_parent = true
	add_child(aura)
	pool = Sprite2D.new()
	pool.texture = glow
	pool.material = add
	pool.scale = Vector2(1.2, 0.22)
	pool.show_behind_parent = true
	add_child(pool)
	charge_glow = Sprite2D.new()
	charge_glow.texture = glow
	charge_glow.material = add
	charge_glow.position = Vector2(14, -30)
	charge_glow.scale = Vector2.ZERO
	add_child(charge_glow)
	light = PointLight2D.new()
	light.texture = glow
	light.texture_scale = 3.2
	light.energy = 0.9
	light.position = Vector2(0, -30)
	add_child(light)
	scarf_line = Line2D.new()
	scarf_line.top_level = true
	scarf_line.width = 6.0
	scarf_line.joint_mode = Line2D.LINE_JOINT_ROUND
	scarf_line.end_cap_mode = Line2D.LINE_CAP_ROUND
	var wc = Curve.new()
	wc.add_point(Vector2(0, 1.0))
	wc.add_point(Vector2(0.8, 0.75))
	wc.add_point(Vector2(1, 0.35))
	scarf_line.width_curve = wc
	scarf_line.z_index = -1
	add_child(scarf_line)
	recolor(pal)
	reset_scarf()


func apply_hero(h: Dictionary) -> void:
	hero = h
	tint = Color(h.tint[0], h.tint[1], h.tint[2])
	run_speed = 150.0 * float(h.speed)
	max_air_jumps = int(h.air_jumps)
	dash_cd_max = 0.8 - 0.18 * Profile.upgrade_level("dash")
	if not palette.is_empty():
		recolor(palette)


func recolor(pal: Dictionary) -> void:
	palette = pal
	var em: Color = pal.ember
	if not hero.is_empty():
		em = Color(hero.scarf[0], hero.scarf[1], hero.scarf[2])
	var g = Gradient.new()
	g.set_color(0, em.lightened(0.15))
	g.set_color(1, em.lerp(Color(0.86, 0.3, 0.27), 0.45))
	scarf_line.gradient = g
	aura.modulate = Color(pal.moon * tint, 0.32)
	pool.modulate = Color(pal.moon * tint, 0.42)
	light.color = (pal.moon * tint).lerp(pal.moss, 0.2)
	charge_glow.modulate = pal.moss.lightened(0.5)


func reset_scarf() -> void:
	scarf_pts.clear()
	scarf_prev.clear()
	for i in 9:
		var p = global_position + Vector2(-10 - i * 4, -31)
		scarf_pts.append(p)
		scarf_prev.append(p)


func feet_rect() -> Rect2:
	return Rect2(position.x - HALF_W, position.y - HEIGHT, HALF_W * 2.0, HEIGHT)


func body_center() -> Vector2:
	return position + Vector2(0, -28)


func dashing() -> bool:
	return dash_t > 0.0


func try_dash() -> bool:
	if dash_cd > 0.0 or dash_t > 0.0:
		return false
	dash_t = DASH_TIME
	dash_cd = dash_cd_max
	dash_dir = facing if wall_dir == 0.0 else -wall_dir
	facing = dash_dir
	vel = Vector2(dash_dir * DASH_SPEED, 0.0)
	squash = Vector2(1.3, 0.8)
	Sfx.play("dash")
	Profile.event("dash")
	return true


func physics_step(dt: float, move: float, jump_pressed: bool, jump_held: bool) -> void:
	t += dt
	invuln = maxf(invuln - dt, 0.0)
	fire_cd = maxf(fire_cd - dt, 0.0)
	dash_cd = maxf(dash_cd - dt, 0.0)
	wall_lock = maxf(wall_lock - dt, 0.0)
	if wall_lock > 0.0:
		move = -wall_dir if wall_dir != 0.0 else move
	if absf(move) > 0.1 and dash_t <= 0.0:
		facing = signf(move)
	if dash_t > 0.0:
		dash_t -= dt
		vel = Vector2(dash_dir * DASH_SPEED, 0.0)
		if fmod(t, 0.03) < dt:
			ghosts.append({"pos": position, "life": 0.0, "facing": facing})
	else:
		var target = move * run_speed
		vel.x = move_toward(vel.x, target, ACCEL * dt * (1.0 if on_ground else 0.7))
	coyote = 0.1 if on_ground else maxf(coyote - dt, 0.0)
	jump_buf = 0.12 if jump_pressed else maxf(jump_buf - dt, 0.0)
	if jump_buf > 0.0:
		if coyote > 0.0:
			_jump(JUMP_V)
			main.fx_dust(position, 6, 50.0)
			Sfx.play("jump")
		elif wall_dir != 0.0:
			_jump(700.0)
			vel.x = -wall_dir * 240.0
			facing = -wall_dir
			wall_lock = 0.16
			main.fx_dust(position + Vector2(wall_dir * 8.0, -20.0), 6, 60.0)
			Sfx.play("jump", 1.2)
		elif air_jumps > 0:
			air_jumps -= 1
			_jump(DJUMP_V)
			main.fx_ring(position + Vector2(0, -6), palette.moon, 26.0)
			Sfx.play("djump")
	if dash_t <= 0.0:
		if vel.y < 0.0 and not jump_held:
			vel.y += GRAV * 1.3 * dt
		vel.y = minf(vel.y + GRAV * dt, 900.0)
		if wall_dir != 0.0 and vel.y > 0.0:
			vel.y = minf(vel.y, 95.0)
			if fmod(t, 0.08) < dt:
				main.fx_burst(position + Vector2(wall_dir * 9.0, -10.0), palette.ember.lightened(0.3), 2, 30.0, 0.25, 80.0, 0.03)
	var was_ground = on_ground
	var fall_speed = vel.y
	_move(dt, move)
	if on_ground and not was_ground and fall_speed > 260.0:
		squash = Vector2(1.28, 0.74)
		main.fx_dust(position, 10, 70.0)
		Sfx.play("land", 1.0, 0.1, -4.0)
	if on_ground:
		air_jumps = max_air_jumps
		if riding == null:
			last_safe = position
		if absf(vel.x) > 60.0:
			step_t += dt
			if step_t > 0.27:
				step_t = 0.0
				main.fx_dust(position + Vector2(-facing * 6, 0), 2, 20.0)
	phase += absf(vel.x) * dt * 0.105
	if dash_t > 0.0:
		squash = squash.lerp(Vector2(1.25, 0.82), 20.0 * dt)
	elif not on_ground:
		var k = clampf(absf(vel.y) / JUMP_V, 0.0, 1.0)
		squash = squash.lerp(Vector2(1.0 - 0.1 * k, 1.0 + 0.13 * k), 12.0 * dt)
	else:
		squash = squash.lerp(Vector2.ONE, 10.0 * dt)
	blink_t -= dt
	if blink_t < -0.12:
		blink_t = randf_range(2.0, 4.5)
	_scarf_step(dt)
	for g in ghosts:
		g.life += dt
	ghosts = ghosts.filter(func(g): return g.life < 0.25)
	aura.modulate.a = 0.28 + 0.06 * sin(t * 2.2) + (0.2 if dash_t > 0.0 else 0.0)
	pool.modulate.a = 0.42 * (0.3 if not on_ground else 1.0)
	charge_glow.scale = Vector2.ONE * (0.0 if charge < 0.15 else 0.15 + charge * 0.35 + sin(t * 30.0) * 0.03 * charge)
	charge_glow.position = Vector2(facing * 14.0, -30.0)
	modulate.a = 0.35 if (invuln > 0.0 and dash_t <= 0.0 and fmod(t, 0.12) < 0.06) else 1.0
	queue_redraw()


func _jump(v: float) -> void:
	vel.y = -v
	on_ground = false
	coyote = 0.0
	jump_buf = 0.0
	riding = null
	squash = Vector2(0.82, 1.22)


func bounce(v: float = 560.0) -> void:
	vel.y = -v
	on_ground = false
	riding = null
	air_jumps = max_air_jumps
	squash = Vector2(0.85, 1.2)


func _move(dt: float, move: float) -> void:
	var solids: Array = main.solids
	# ride moving platforms
	if riding != null and on_ground:
		position += riding.get("delta", Vector2.ZERO)
	position.x += vel.x * dt
	var r = feet_rect()
	wall_dir = 0.0
	for s in solids:
		if s.kind != "ground":
			continue
		var sr: Rect2 = s.r
		if r.intersects(sr) and position.y > sr.position.y + 2.0:
			if vel.x > 0.0 or (vel.x == 0.0 and position.x < sr.get_center().x):
				position.x = sr.position.x - HALF_W
			else:
				position.x = sr.end.x + HALF_W
			vel.x = 0.0
			r = feet_rect()
	# wall contact check (for wall slide)
	if not on_ground and absf(move) > 0.3:
		var probe = Rect2(position.x - HALF_W + signf(move) * 2.0, position.y - HEIGHT + 6.0, HALF_W * 2.0, HEIGHT - 12.0)
		for s in solids:
			if s.kind == "ground" and probe.intersects(s.r) and position.y > s.r.position.y + 20.0:
				wall_dir = signf(move)
				break
	var prev_y = position.y
	position.y += vel.y * dt
	on_ground = false
	riding = null
	r = feet_rect()
	for s in solids:
		var sr2: Rect2 = s.r
		if s.get("gone", false):
			continue
		if position.x + HALF_W <= sr2.position.x or position.x - HALF_W >= sr2.end.x:
			continue
		if s.kind != "ground":
			if vel.y >= 0.0 and prev_y <= sr2.position.y + 4.0 and position.y >= sr2.position.y - 1.0:
				position.y = sr2.position.y
				vel.y = 0.0
				on_ground = true
				if s.kind == "move":
					riding = s
				elif s.kind == "crumble":
					s["stood"] = true
		elif r.intersects(sr2):
			if vel.y >= 0.0 and prev_y <= sr2.position.y + 6.0:
				position.y = sr2.position.y
				vel.y = 0.0
				on_ground = true
			elif vel.y < 0.0:
				position.y = sr2.end.y + HEIGHT
				vel.y = 0.0
		r = feet_rect()


func _scarf_step(dt: float) -> void:
	if scarf_pts.is_empty():
		reset_scarf()
	var bob = -absf(sin(phase)) * 2.0 if on_ground and absf(vel.x) > 30.0 else 0.0
	var anchor = global_position + Vector2(-facing * 9.0 * HS, (-24.0 * squash.y + bob) * HS)
	var run = clampf(absf(vel.x) / 150.0, 0.0, 1.0)
	var n = scarf_pts.size()
	var sdt = minf(dt, 1.0 / 30.0)
	for i in range(1, n):
		var p = scarf_pts[i]
		var v = (p - scarf_prev[i]) * 0.86
		scarf_prev[i] = p
		var wind = Vector2(-facing * (30.0 + run * 40.0) * (1.0 + sin(t * 4.0 + i * 0.8) * 0.5), 700.0 - run * 380.0)
		p += v + wind * sdt * sdt
		p.y += sin(t * 9.0 - i * 0.9) * 0.35 * (0.3 + run) * float(i) / n
		scarf_pts[i] = p
	scarf_pts[0] = anchor
	for it in 5:
		for i in range(1, n):
			var a = scarf_pts[i - 1]
			var b = scarf_pts[i]
			var d = b - a
			var dl = maxf(d.length(), 0.001)
			var diff = (dl - 3.3 * HS) / dl
			if i == 1:
				scarf_pts[i] = b - d * diff
			else:
				scarf_pts[i - 1] = a + d * diff * 0.5
				scarf_pts[i] = b - d * diff * 0.5
	var pts = PackedVector2Array()
	for i in n:
		var q = scarf_pts[i]
		var wv = sin(t * 11.0 - i * 0.75) * float(i) / n * 3.2 * HS * (0.35 + run * 0.65)
		pts.append(q + Vector2(0, wv))
	scarf_line.points = pts


# ---------------- drawing ----------------
static func _bez(p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2, out: PackedVector2Array, n: int = 6) -> void:
	for i in range(1, n + 1):
		var u = float(i) / n
		var a = 1.0 - u
		out.append(p0 * a * a * a + p1 * 3.0 * a * a * u + p2 * 3.0 * a * u * u + p3 * u * u * u)


static func _quad(p0: Vector2, p1: Vector2, p2: Vector2, out: PackedVector2Array, n: int = 4) -> void:
	for i in range(1, n + 1):
		var u = float(i) / n
		out.append(p0.lerp(p1, u).lerp(p1.lerp(p2, u), u))


func _draw() -> void:
	var moon: Color = palette.moon * tint
	var dusk: Color = palette.dusk
	var ink: Color = palette.ink
	var ember: Color = palette.ember if hero.is_empty() else Color(hero.scarf[0], hero.scarf[1], hero.scarf[2])
	var run = clampf(absf(vel.x) / 150.0, 0.0, 1.0)
	var air = not on_ground
	# dash afterimages
	for g in ghosts:
		var a = 1.0 - g.life / 0.25
		var off = g.pos - position
		draw_set_transform(off, 0.0, Vector2(g.facing * HS, HS))
		_draw_ellipse(Vector2(0, -27), Vector2(13, 20), Color(palette.moss.lightened(0.4), 0.35 * a))
	var sx = squash.x * facing * HS
	var sy = squash.y * HS
	draw_set_transform(Vector2.ZERO, 0.0, Vector2(sx, sy))
	var leg_c = ink.lerp(dusk, 0.55)
	var boot_c = moon.lerp(dusk, 0.3)
	for i in 2:
		var off2 = PI if i == 1 else 0.0
		var a2 = (-0.9 if i == 0 else 0.6) if air else sin(phase + off2) * 0.9 * run
		var hx = 3.0 if i == 1 else -3.0
		var hip = Vector2(hx, -9)
		var knee = hip + Vector2(sin(a2) * 6.0, cos(a2) * 5.2)
		var lift = -sin(phase + off2) * 2.2 if (run > 0.1 and not air and sin(phase + off2) > 0.0) else 0.0
		var foot = Vector2(knee.x + sin(a2 * 0.6) * 1.5, minf(0.0, knee.y + 4.2 - (2.0 if air else 0.0) + lift) - 1.0)
		draw_polyline(PackedVector2Array([hip, knee, foot]), leg_c, 4.0, true)
		draw_circle(foot + Vector2(1.4, 0), 2.6, boot_c)
	var bob = -absf(sin(phase)) * 2.0 if (run > 0.1 and not air) else sin(t * 2.4) * 0.7
	draw_set_transform(Vector2(0, bob * sy), 0.0, Vector2(sx, sy))
	var hem = -8.0
	var fl = sin(t * 9.0) * (1.5 if run > 0.1 else 0.5)
	var pts = PackedVector2Array([Vector2(0, -46)])
	_bez(Vector2(0, -46), Vector2(10, -46), Vector2(14, -38), Vector2(13, -30), pts)
	_bez(Vector2(13, -30), Vector2(13, -22), Vector2(15, -14), Vector2(15 + fl, hem), pts)
	_quad(Vector2(15 + fl, hem), Vector2(10, hem + 3), Vector2(5, hem + 1), pts)
	_quad(Vector2(5, hem + 1), Vector2(0, hem + 4), Vector2(-5, hem + 1), pts)
	_quad(Vector2(-5, hem + 1), Vector2(-10, hem + 3), Vector2(-14 - fl, hem), pts)
	_bez(Vector2(-14 - fl, hem), Vector2(-13, -16), Vector2(-13, -22), Vector2(-12, -30), pts)
	_bez(Vector2(-12, -30), Vector2(-12, -40), Vector2(-8, -46), Vector2(0, -46), pts)
	pts.remove_at(pts.size() - 1)
	var cols = PackedColorArray()
	var hi = moon.lightened(0.4)
	var lo = moon.lerp(dusk, 0.62)
	for p in pts:
		var k = clampf(((10.0 - p.x) * 0.45 + (p.y + 44.0) * 0.8) / 42.0, 0.0, 1.0)
		cols.append(hi.lerp(moon.lerp(dusk, 0.12), minf(k * 2.2, 1.0)).lerp(lo, maxf(k - 0.45, 0.0) / 0.55))
	draw_polygon(pts, cols)
	var rimc = Color(0.75, 0.94, 1.0, 0.95)
	for i in pts.size():
		var a3 = pts[i]
		var b3 = pts[(i + 1) % pts.size()]
		var nrm = (b3 - a3).orthogonal().normalized() * -1.0
		if nrm.dot(Vector2(0.7, -0.7)) > 0.25:
			draw_line(a3 + nrm * -0.8, b3 + nrm * -0.8, rimc, 1.6, true)
	var fold = Color(moon.lerp(dusk, 0.5), 0.55)
	for fx in [-6.0, 0.0, 6.0]:
		draw_line(Vector2(fx * 0.5, -24), Vector2(fx + fl * 0.5, hem + 2), fold, 1.0, true)
	draw_rect(Rect2(-14.5, -20, 29, 3), dusk.lerp(ink, 0.3))
	draw_rect(Rect2(1, -20.5, 3.2, 4), ember)
	var sw = sin(phase + PI) * 0.8 if (run > 0.1 and not air) else (-1.2 if air else 0.15)
	if charge > 0.15:
		sw = -1.45
	var hand = Vector2(4, -27) + Vector2(-sin(sw), cos(sw)) * 11.0
	draw_line(Vector2(4, -27), hand, moon.lerp(dusk, 0.25), 6.0, true)
	draw_circle(hand, 2.3, moon.lerp(ember, 0.25))
	var collar = PackedVector2Array()
	collar.append(Vector2(-11, -27))
	_quad(Vector2(-11, -27), Vector2(0, -23.5), Vector2(12, -27.5), collar)
	collar.append(Vector2(12.5, -22.5))
	_quad(Vector2(12.5, -22.5), Vector2(0, -18.5), Vector2(-11.5, -22), collar)
	draw_colored_polygon(collar, ember.lightened(0.1))
	draw_line(Vector2(-10, -26.6), Vector2(11.5, -27), Color(1, 0.93, 0.78, 0.7), 0.8, true)
	_draw_ellipse(Vector2(4.5, -33), Vector2(7.6, 6.6), ink.darkened(0.3))
	draw_arc(Vector2(4.5, -33), 7.4, PI * 0.95, PI * 2.05, 16, moon.lerp(dusk, 0.35), 1.4, true)
	var eh = 0.4 if blink_t < 0.0 else 2.6
	var eye_c = Color(0.92, 1.0, 0.98) if hero.is_empty() else Color(0.92, 1.0, 0.98).lerp(ember.lightened(0.5), 0.25)
	_draw_ellipse(Vector2(2.2, -33.5), Vector2(1.5, eh), eye_c)
	_draw_ellipse(Vector2(7.6, -33.5), Vector2(1.5, eh), eye_c)
	var tip = PackedVector2Array([Vector2(-6, -43)])
	_quad(Vector2(-6, -43), Vector2(-14, -46), Vector2(-17, -41 + fl * 0.4), tip)
	_quad(Vector2(-17, -41 + fl * 0.4), Vector2(-12, -41), Vector2(-8, -38), tip)
	draw_colored_polygon(tip, moon)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)


func _draw_ellipse(c: Vector2, r: Vector2, col: Color) -> void:
	var p = PackedVector2Array()
	for i in 16:
		var a = TAU * i / 16.0
		p.append(c + Vector2(cos(a) * r.x, sin(a) * r.y))
	draw_colored_polygon(p, col)
