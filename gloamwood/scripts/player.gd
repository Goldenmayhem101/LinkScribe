class_name Player
extends Node2D
## The glowing hooded hero. Custom platformer physics against the generated
## rectangles, plus procedural drawing (cloak, face, legs) and a ribbon scarf.

const RUN := 150.0
const ACCEL := 1100.0
const GRAV := 1900.0
const JUMP_V := 760.0
const DJUMP_V := 640.0
const HALF_W := 8.0
const HEIGHT := 50.0
const HS := 1.3

var main: Node
var vel = Vector2.ZERO
var on_ground = false
var facing = 1.0
var coyote = 0.0
var jump_buf = 0.0
var air_jumps = 1
var invuln = 0.0
var squash = Vector2.ONE
var phase = 0.0
var blink_t = 2.0
var fire_cd = 0.0
var land_cd = 0.0
var step_t = 0.0
var last_safe = Vector2.ZERO
var palette: Dictionary = {}

var scarf_pts: Array[Vector2] = []
var scarf_prev: Array[Vector2] = []
var scarf_line: Line2D
var aura: Sprite2D
var pool: Sprite2D
var light: PointLight2D
var t = 0.0


func setup(m: Node, glow: Texture2D, pal: Dictionary) -> void:
	main = m
	palette = pal
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


func recolor(pal: Dictionary) -> void:
	palette = pal
	var em: Color = pal.ember
	var g = Gradient.new()
	g.set_color(0, em.lightened(0.15))
	g.set_color(1, em.lerp(Color(0.86, 0.3, 0.27), 0.45))
	scarf_line.gradient = g
	aura.modulate = Color(pal.moon, 0.32)
	pool.modulate = Color(pal.moon, 0.42)
	light.color = pal.moon.lerp(pal.moss, 0.2)


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


func physics_step(dt: float, move: float, jump_pressed: bool, jump_held: bool) -> void:
	t += dt
	invuln = maxf(invuln - dt, 0.0)
	fire_cd = maxf(fire_cd - dt, 0.0)
	land_cd = maxf(land_cd - dt, 0.0)
	if absf(move) > 0.1:
		facing = signf(move)
	var target = move * RUN
	vel.x = move_toward(vel.x, target, ACCEL * dt * (1.0 if on_ground else 0.7))
	coyote = 0.1 if on_ground else maxf(coyote - dt, 0.0)
	jump_buf = 0.12 if jump_pressed else maxf(jump_buf - dt, 0.0)
	if jump_buf > 0.0:
		if coyote > 0.0:
			_jump(JUMP_V)
			main.fx_dust(position, 6, 50.0)
		elif air_jumps > 0:
			air_jumps -= 1
			_jump(DJUMP_V)
			main.fx_ring(position + Vector2(0, -6), palette.moon, 26.0)
	# variable jump height
	if vel.y < 0.0 and not jump_held:
		vel.y += GRAV * 1.3 * dt
	vel.y = minf(vel.y + GRAV * dt, 900.0)
	var was_ground = on_ground
	var fall_speed = vel.y
	_move(dt)
	if on_ground and not was_ground and fall_speed > 260.0:
		squash = Vector2(1.28, 0.74)
		main.fx_dust(position, 10, 70.0)
		land_cd = 0.15
	if on_ground:
		air_jumps = 1
		last_safe = position
		if absf(vel.x) > 60.0:
			step_t += dt
			if step_t > 0.27:
				step_t = 0.0
				main.fx_dust(position + Vector2(-facing * 6, 0), 2, 20.0)
	phase += absf(vel.x) * dt * 0.105
	# squash/stretch spring back
	if not on_ground:
		var k = clampf(absf(vel.y) / JUMP_V, 0.0, 1.0)
		squash = squash.lerp(Vector2(1.0 - 0.1 * k, 1.0 + 0.13 * k), 12.0 * dt)
	else:
		squash = squash.lerp(Vector2.ONE, 10.0 * dt)
	blink_t -= dt
	if blink_t < -0.12:
		blink_t = randf_range(2.0, 4.5)
	_scarf_step(dt)
	var airborne = 0.0 if on_ground else 1.0
	aura.modulate.a = 0.28 + 0.06 * sin(t * 2.2)
	pool.modulate.a = 0.42 * (1.0 - airborne * 0.7)
	modulate.a = 0.35 if (invuln > 0.0 and fmod(t, 0.12) < 0.06) else 1.0
	queue_redraw()


func _jump(v: float) -> void:
	vel.y = -v
	on_ground = false
	coyote = 0.0
	jump_buf = 0.0
	squash = Vector2(0.82, 1.22)


func bounce(v: float = 560.0) -> void:
	vel.y = -v
	on_ground = false
	air_jumps = 1
	squash = Vector2(0.85, 1.2)


func _move(dt: float) -> void:
	var solids: Array = main.solids
	position.x += vel.x * dt
	var r = feet_rect()
	for s in solids:
		if s.kind != "ground":
			continue
		var sr: Rect2 = s.r
		if r.intersects(sr) and position.y > sr.position.y + 2.0:
			if vel.x > 0.0:
				position.x = sr.position.x - HALF_W
			elif vel.x < 0.0:
				position.x = sr.end.x + HALF_W
			vel.x = 0.0
			r = feet_rect()
	var prev_y = position.y
	position.y += vel.y * dt
	on_ground = false
	r = feet_rect()
	for s in solids:
		var sr2: Rect2 = s.r
		if position.x + HALF_W <= sr2.position.x or position.x - HALF_W >= sr2.end.x:
			continue
		if s.kind == "plat":
			if vel.y >= 0.0 and prev_y <= sr2.position.y + 1.0 and position.y >= sr2.position.y:
				position.y = sr2.position.y
				vel.y = 0.0
				on_ground = true
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
	var run = clampf(absf(vel.x) / RUN, 0.0, 1.0)
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
	var moon: Color = palette.moon
	var dusk: Color = palette.dusk
	var ink: Color = palette.ink
	var ember: Color = palette.ember
	var run = clampf(absf(vel.x) / RUN, 0.0, 1.0)
	var air = not on_ground
	draw_set_transform(Vector2.ZERO, 0.0, Vector2(squash.x * facing * HS, squash.y * HS))
	# legs
	var leg_c = ink.lerp(dusk, 0.55)
	var boot_c = moon.lerp(dusk, 0.3)
	for i in 2:
		var off = PI if i == 1 else 0.0
		var a = (-0.9 if i == 0 else 0.6) if air else sin(phase + off) * 0.9 * run
		var hx = 3.0 if i == 1 else -3.0
		var hip = Vector2(hx, -9)
		var knee = hip + Vector2(sin(a) * 6.0, cos(a) * 5.2)
		var lift = -sin(phase + off) * 2.2 if (run > 0.1 and not air and sin(phase + off) > 0.0) else 0.0
		var foot = Vector2(knee.x + sin(a * 0.6) * 1.5, minf(0.0, knee.y + 4.2 - (2.0 if air else 0.0) + lift) - 1.0)
		draw_polyline(PackedVector2Array([hip, knee, foot]), leg_c, 4.0, true)
		draw_circle(foot + Vector2(1.4, 0), 2.6, boot_c)
	var bob = -absf(sin(phase)) * 2.0 if (run > 0.1 and not air) else sin(t * 2.4) * 0.7
	draw_set_transform(Vector2(0, bob * HS * squash.y), 0.0, Vector2(squash.x * facing * HS, squash.y * HS))
	# cloak
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
	# rim light on the moon-facing edge
	var rim = Color(0.75, 0.94, 1.0, 0.95)
	for i in pts.size():
		var a2 = pts[i]
		var b2 = pts[(i + 1) % pts.size()]
		var nrm = (b2 - a2).orthogonal().normalized() * -1.0
		if nrm.dot(Vector2(0.7, -0.7)) > 0.25:
			draw_line(a2 + nrm * -0.8, b2 + nrm * -0.8, rim, 1.6, true)
	# fold lines + belt
	var fold = Color(moon.lerp(dusk, 0.5), 0.55)
	for fx in [-6.0, 0.0, 6.0]:
		draw_line(Vector2(fx * 0.5, -24), Vector2(fx + fl * 0.5, hem + 2), fold, 1.0, true)
	draw_rect(Rect2(-14.5, -20, 29, 3), dusk.lerp(ink, 0.3))
	draw_rect(Rect2(1, -20.5, 3.2, 4), ember)
	# arm
	var sw = sin(phase + PI) * 0.8 if (run > 0.1 and not air) else (-1.2 if air else 0.15)
	var hand = Vector2(4, -27) + Vector2(-sin(sw), cos(sw)) * 11.0
	draw_line(Vector2(4, -27), hand, moon.lerp(dusk, 0.25), 6.0, true)
	draw_circle(hand, 2.3, moon.lerp(ember, 0.25))
	# collar (front of scarf)
	var collar = PackedVector2Array()
	collar.append(Vector2(-11, -27))
	_quad(Vector2(-11, -27), Vector2(0, -23.5), Vector2(12, -27.5), collar)
	collar.append(Vector2(12.5, -22.5))
	_quad(Vector2(12.5, -22.5), Vector2(0, -18.5), Vector2(-11.5, -22), collar)
	draw_colored_polygon(collar, ember.lightened(0.1))
	draw_line(Vector2(-10, -26.6), Vector2(11.5, -27), Color(1, 0.93, 0.78, 0.7), 0.8, true)
	# face hollow + glowing eyes
	_draw_ellipse(Vector2(4.5, -33), Vector2(7.6, 6.6), ink.darkened(0.3))
	draw_arc(Vector2(4.5, -33), 7.4, PI * 0.95, PI * 2.05, 16, moon.lerp(dusk, 0.35), 1.4, true)
	var eh = 0.4 if blink_t < 0.0 else 2.6
	_draw_ellipse(Vector2(2.2, -33.5), Vector2(1.5, eh), Color(0.92, 1.0, 0.98))
	_draw_ellipse(Vector2(7.6, -33.5), Vector2(1.5, eh), Color(0.92, 1.0, 0.98))
	# hood tip
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
