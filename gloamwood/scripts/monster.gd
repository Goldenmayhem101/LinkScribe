class_name Monster
extends Node2D
## Fuzzy enemies. Each kind has a patrol, a readable warning ("telegraph")
## before its attack, hit reactions and a dissolve death.
##   brute   - walks the ground, winds up, then a ground-pound shockwave
##   spike   - hops on a ledge, bristles, then fires a fan of quills
##   cyclops - flies, charges its eye, then fires a sweeping beam

const SHADER := preload("res://shaders/monster.gdshader")

var main: Node
var kind = "brute"
var meta: Dictionary
var elite = false
var hp = 3
var lo = 0.0
var hi = 0.0
var home = Vector2.ZERO
var dir = -1.0
var speed = 30.0
var state = "patrol"
var st = 0.0
var t = 0.0
var cd = 1.5
var hop_v = 0.0
var hop_y = 0.0
var knock = 0.0
var dead = false
var beam_from = Vector2.ZERO
var beam_dir = Vector2.ZERO

var sprite: Sprite2D
var mat: ShaderMaterial
var eyes: Node2D
var wings: Node2D
var tele: Sprite2D
var radius = 28.0
var center_off = Vector2(0, -34)
var shadow: Sprite2D
var size_k = 1.0


func setup(m: Node, data: Dictionary, tex: Texture2D, mdata: Dictionary, glow: Texture2D) -> void:
	main = m
	kind = data.kind
	meta = mdata
	elite = data.elite
	home = data.pos
	position = data.pos
	lo = data.min
	hi = data.max
	size_k = 1.22 if elite else 1.0
	match kind:
		"brute":
			hp = 3; speed = 32.0; radius = 28.0; center_off = Vector2(0, -32)
		"spike":
			hp = 2; speed = 26.0; radius = 22.0; center_off = Vector2(0, -28)
		"cyclops":
			hp = 2; speed = 22.0; radius = 22.0; center_off = Vector2.ZERO
	if elite:
		hp += 2
	radius *= size_k
	center_off *= size_k
	cd = randf_range(1.0, 2.5)
	var add = CanvasItemMaterial.new()
	add.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	shadow = Sprite2D.new()
	shadow.texture = glow
	shadow.modulate = Color(0, 0, 0.05, 0.55)
	shadow.scale = Vector2(0.55, 0.12) * size_k
	add_child(shadow)
	tele = Sprite2D.new()
	tele.texture = glow
	tele.material = add
	tele.modulate = Color(1, 0.6, 0.3, 0)
	tele.position = center_off
	add_child(tele)
	if kind == "cyclops":
		wings = Node2D.new()
		wings.draw.connect(_draw_wings)
		add_child(wings)
	sprite = Sprite2D.new()
	sprite.texture = tex
	var k = 1.0 / 3.0
	sprite.scale = Vector2(k, k) * size_k
	sprite.position = Vector2(60.0 - meta.ox, 60.0 - meta.oy) * size_k
	mat = ShaderMaterial.new()
	mat.shader = SHADER
	mat.set_shader_parameter("elite", 1.0 if elite else 0.0)
	mat.set_shader_parameter("flash", 0.0)
	mat.set_shader_parameter("dissolve", 0.0)
	mat.set_shader_parameter("edge_color", main.pal.ember)
	sprite.material = mat
	add_child(sprite)
	eyes = Node2D.new()
	eyes.draw.connect(_draw_eyes)
	add_child(eyes)
	if elite:
		var aura = Sprite2D.new()
		aura.texture = glow
		aura.material = add
		aura.modulate = Color(0.85, 0.35, 1.0, 0.35)
		aura.position = center_off
		aura.scale = Vector2.ONE * 0.9
		aura.show_behind_parent = true
		add_child(aura)


func world_center() -> Vector2:
	return position + center_off + Vector2(0, hop_y)


func _process(dt: float) -> void:
	if dead:
		return
	t += dt
	st += dt
	cd -= dt
	var p: Player = main.player
	var to_p = p.body_center() - world_center()
	var flash: float = mat.get_shader_parameter("flash")
	if flash > 0.0:
		mat.set_shader_parameter("flash", maxf(flash - dt * 6.0, 0.0))
	if absf(knock) > 1.0:
		position.x = clampf(position.x + knock * dt, lo - 30.0, hi + 30.0)
		knock = move_toward(knock, 0.0, 600.0 * dt)
	match kind:
		"brute":
			_brute(dt, to_p)
		"spike":
			_spike(dt, to_p)
		"cyclops":
			_cyclops(dt, to_p)
	# idle body motion
	var bob = 0.0
	var sq = 1.0
	if kind == "cyclops":
		bob = sin(t * 3.0 + home.x) * 6.0
	elif state == "patrol":
		bob = -absf(sin(t * 7.0)) * 3.0
		sq = 1.0 + sin(t * 14.0) * 0.04
	sprite.position.y = (60.0 - meta.oy) * size_k + bob + hop_y
	sprite.scale = Vector2((1.0 / 3.0) / sq * (-1.0 if dir > 0.0 else 1.0), (1.0 / 3.0) * sq) * size_k
	if state == "warn":
		sprite.position.x = (60.0 - meta.ox) * size_k + sin(t * 60.0) * 1.5
	else:
		sprite.position.x = (60.0 - meta.ox) * size_k
	tele.position = center_off + Vector2(0, bob + hop_y)
	shadow.position = Vector2(-3, 1) if kind != "cyclops" else Vector2(-3, main.ground_below(position) - position.y)
	shadow.visible = kind != "cyclops" or shadow.position.y < 260.0
	eyes.queue_redraw()
	if wings:
		wings.queue_redraw()


func _brute(dt: float, to_p: Vector2) -> void:
	match state:
		"patrol":
			position.x += dir * speed * dt
			if position.x < lo or position.x > hi:
				dir = -dir
				position.x = clampf(position.x, lo, hi)
			if cd <= 0.0 and absf(to_p.x) < 120.0 and absf(to_p.y) < 60.0:
				dir = signf(to_p.x)
				_set_state("warn")
		"warn":
			tele.modulate = Color(main.pal.ember, minf(st / 0.6, 1.0) * 0.9)
			tele.scale = Vector2.ONE * (0.6 + st)
			if st > 0.6:
				_set_state("leap")
				hop_v = -360.0
		"leap":
			hop_v += 1900.0 * dt
			hop_y = minf(hop_y + hop_v * dt, 0.0)
			tele.modulate.a = maxf(tele.modulate.a - dt * 3.0, 0.0)
			if hop_y >= 0.0 and st > 0.1:
				hop_y = 0.0
				main.shockwave(position, main.pal.ember, 1 if elite else 0)
				_set_state("rest")
		"rest":
			if st > 0.8:
				cd = randf_range(2.0, 3.2)
				_set_state("patrol")


func _spike(dt: float, to_p: Vector2) -> void:
	match state:
		"patrol":
			position.x += dir * speed * dt
			if position.x < lo or position.x > hi:
				dir = -dir
				position.x = clampf(position.x, lo, hi)
			# little hops
			hop_v += 1900.0 * dt
			hop_y = minf(hop_y + hop_v * dt, 0.0)
			if hop_y >= 0.0 and randf() < dt * 1.2:
				hop_v = -260.0
			if cd <= 0.0 and to_p.length() < 280.0 and hop_y >= 0.0:
				dir = signf(to_p.x)
				_set_state("warn")
		"warn":
			tele.modulate = Color(main.pal.dusk.lightened(0.3), minf(st / 0.45, 1.0))
			tele.scale = Vector2.ONE * (0.4 + st * 1.2)
			if st > 0.45:
				var n = 5 if elite else 3
				for i in n:
					var a = to_p.angle() + (i - (n - 1) * 0.5) * 0.22
					main.spawn_quill(world_center() + Vector2(0, -10), Vector2.from_angle(a) * 260.0)
				main.fx_burst(world_center() + Vector2(0, -16), main.pal.dusk.lightened(0.3), 8, 90.0, 0.35, 0.0, 0.08)
				_set_state("rest")
		"rest":
			tele.modulate.a = maxf(tele.modulate.a - dt * 4.0, 0.0)
			if st > 0.7:
				cd = randf_range(2.0, 3.0)
				_set_state("patrol")


func _cyclops(dt: float, to_p: Vector2) -> void:
	match state:
		"patrol":
			position.x += dir * speed * dt
			if position.x < lo or position.x > hi:
				dir = -dir
				position.x = clampf(position.x, lo, hi)
			position.y = home.y + sin(t * 0.9) * 26.0
			if cd <= 0.0 and to_p.length() < 300.0:
				_set_state("warn")
		"warn":
			dir = signf(to_p.x) if absf(to_p.x) > 2.0 else dir
			tele.modulate = Color(main.pal.moss.lightened(0.4), minf(st / 0.8, 1.0))
			tele.scale = Vector2.ONE * (0.3 + st * 0.9)
			if st > 0.8:
				beam_from = world_center() + Vector2(0, -6)
				beam_dir = (main.player.body_center() - beam_from).normalized()
				main.fire_beam(self, beam_from, beam_dir)
				_set_state("rest")
		"rest":
			tele.modulate.a = maxf(tele.modulate.a - dt * 2.0, 0.0)
			if st > 1.0:
				cd = randf_range(2.8, 4.0)
				_set_state("patrol")


func _set_state(s: String) -> void:
	state = s
	st = 0.0


func hit(dmg: int, from_x: float) -> void:
	if dead:
		return
	hp -= dmg
	mat.set_shader_parameter("flash", 1.0)
	knock = signf(position.x - from_x) * 220.0
	main.fx_burst(world_center(), Color(meta.body[0], meta.body[1], meta.body[2]), 10, 120.0, 0.45, 220.0, 0.07, false)
	main.float_text(world_center() + Vector2(0, -radius - 6), str(dmg), main.pal.moon)
	if hp <= 0:
		_die()
	elif state == "warn" and kind != "cyclops":
		_set_state("rest")


func _die() -> void:
	dead = true
	main.on_monster_killed(self)
	var tw = create_tween()
	tw.tween_method(func(v: float): mat.set_shader_parameter("dissolve", v), 0.0, 1.0, 0.55)
	tw.parallel().tween_property(tele, "modulate:a", 0.0, 0.3)
	tw.parallel().tween_property(shadow, "modulate:a", 0.0, 0.4)
	tw.tween_callback(queue_free)


# ---------------- drawing ----------------
func _draw_eyes() -> void:
	var p: Player = main.player
	var blink = fmod(t * 0.7 + home.x * 0.01, 3.2) < 0.12
	var flip = -1.0 if dir > 0.0 else 1.0
	var body = Color(meta.body[0], meta.body[1], meta.body[2])
	var iris = Color(meta.iris[0], meta.iris[1], meta.iris[2])
	if state == "warn":
		iris = main.pal.ember.lightened(0.3) if kind != "cyclops" else main.pal.moss.lightened(0.5)
	var diss: float = mat.get_shader_parameter("dissolve")
	if diss > 0.25:
		return
	for e in meta.eyes:
		var local = (Vector2(e.x - meta.ox, e.y - meta.oy) * Vector2(flip, 1.0)) * size_k + Vector2(0, sprite.position.y - (60.0 - meta.oy) * size_k)
		var r: float = e.r * size_k
		var world = position + local
		var look = (p.body_center() - world).normalized()
		eyes.draw_circle(local + Vector2(0, 1), r + 1.2, Color(main.pal.ink, 0.5))
		eyes.draw_circle(local, r, Color(0.95, 0.97, 1.0))
		eyes.draw_circle(local + Vector2(r * 0.25, -r * 0.3), r * 0.55, Color(1, 1, 1, 0.6))
		var ip = local + look * r * 0.38
		eyes.draw_circle(ip, r * 0.52, iris.darkened(0.2))
		eyes.draw_circle(ip + Vector2(-r * 0.08, -r * 0.08), r * 0.38, iris.lightened(0.25))
		eyes.draw_circle(ip, r * 0.26, main.pal.ink.darkened(0.5))
		eyes.draw_circle(ip + Vector2(r * 0.2, -r * 0.22), r * 0.14, Color.WHITE)
		if blink or (state == "warn" and kind == "brute"):
			var lid = 1.0 if blink else 0.35
			eyes.draw_rect(Rect2(local.x - r - 1, local.y - r - 1, 2 * r + 2, (2 * r + 2) * lid), body.darkened(0.1))
			eyes.draw_line(Vector2(local.x - r, local.y - r + 2 * r * lid), Vector2(local.x + r, local.y - r + 2 * r * lid), body.darkened(0.6), 1.3)


func _draw_wings() -> void:
	var f = sin(t * 14.0)
	var base = Color(main.pal.dusk)
	for k in [-1.0, 1.0]:
		var xf = Transform2D(-0.3 * k + f * 0.5 * k, Vector2(20.0 * k * size_k, sprite.position.y - 2.0))
		var pts = PackedVector2Array([Vector2(0, 0), Vector2(10, -20), Vector2(34, -14), Vector2(30, 2), Vector2(20, 6), Vector2(6, 8)])
		var out = PackedVector2Array()
		var cols = PackedColorArray()
		for q in pts:
			out.append(xf * (Vector2(q.x * k, q.y) * size_k))
			cols.append(base.lerp(main.pal.moon, 0.25) if q.y < -10.0 else base.darkened(0.5))
		wings.draw_polygon(out, cols)
		wings.draw_polyline(PackedVector2Array([out[0], out[1], out[2]]), base.darkened(0.6), 1.2, true)
		wings.draw_line(out[1], out[3], base.darkened(0.6), 1.0, true)
		wings.draw_line(out[1], out[4], base.darkened(0.6), 1.0, true)
