class_name Monster
extends Node2D
## Enemies. Every attack has a readable warning first.
##   brute    walks; winds up, leaps, ground-pound shockwave
##   spike    hops on ledges; bristles, fires a fan of quills
##   cyclops  flies; eye charge, then a beam
##   charger  paws the ground, then charges until it hits the end of its ground, dazed after
##   burrower hides underground (invulnerable), pops up beside you, throws a dirt clod
##   drone    sci-fi hover bot; blinks red, fires a 3-bolt burst
##   slime    hops toward you; splits into two minis when popped
##   titan    boss, 3 phases: pound / charge / quill storm / summon / triple-eye beam
## Golden variants drop a coin shower. Elites are bigger, tougher and shimmer.

const SHADER := preload("res://shaders/monster.gdshader")

var main: Node
var kind := "brute"
var meta: Dictionary = {}
var elite := false
var golden := false
var boss := false
var mini := false
var hp := 3
var max_hp := 3
var lo := 0.0
var hi := 0.0
var home = Vector2.ZERO
var dir := -1.0
var speed := 30.0
var state := "patrol"
var st := 0.0
var t := 0.0
var cd := 1.5
var hop_v := 0.0
var hop_y := 0.0
var vx := 0.0
var knock := 0.0
var dead := false
var bar_t := 0.0
var phase_n := 1
var attack := ""
var shots := 0
var body_color = Color.WHITE
var index := -1

var sprite: Sprite2D
var mat: ShaderMaterial
var eyes: Node2D
var body_node: Node2D
var ui: Node2D
var tele: Sprite2D
var shadow: Sprite2D
var radius := 28.0
var center_off = Vector2(0, -34)
var size_k := 1.0
var flash := 0.0
var diss := 0.0


func setup(m: Node, data: Dictionary, tex: Texture2D, mdata: Dictionary, glow: Texture2D) -> void:
	main = m
	kind = data.kind
	meta = mdata
	elite = data.get("elite", false)
	golden = data.get("golden", false)
	boss = kind == "titan"
	mini = data.get("mini", false)
	index = data.get("index", -1)
	home = data.pos
	position = data.pos
	lo = data.min
	hi = data.max
	size_k = 1.22 if elite else (0.6 if mini else 1.0)
	var hpb: int = data.get("hpb", 0)
	match kind:
		"brute": hp = 3; speed = 32.0; radius = 28.0; center_off = Vector2(0, -32)
		"spike": hp = 2; speed = 26.0; radius = 22.0; center_off = Vector2(0, -28)
		"cyclops": hp = 2; speed = 22.0; radius = 22.0; center_off = Vector2.ZERO
		"charger": hp = 3; speed = 24.0; radius = 24.0; center_off = Vector2(0, -22)
		"burrower": hp = 2; speed = 40.0; radius = 22.0; center_off = Vector2(0, -26); state = "under"
		"drone": hp = 2; speed = 30.0; radius = 18.0; center_off = Vector2.ZERO
		"slime": hp = 1 if mini else 2; speed = 0.0; radius = 20.0; center_off = Vector2(0, -16)
		"titan": hp = int(data.get("hp", 60)); speed = 40.0; radius = 62.0; center_off = Vector2(0, -70); state = "intro"
	if not boss:
		hp = maxi(1, hp + hpb + (2 if elite else 0) + (1 if golden else 0))
	max_hp = hp
	radius *= size_k
	center_off *= size_k
	cd = randf_range(1.0, 2.5)
	if golden:
		body_color = Color(1.0, 0.82, 0.3)
	elif meta.has("body"):
		body_color = Color(meta.body[0], meta.body[1], meta.body[2])
	elif kind == "slime":
		body_color = main.pal.moss.lightened(0.15)
	else:
		body_color = main.pal.moon.lerp(main.pal.dusk, 0.5)
	var add = CanvasItemMaterial.new()
	add.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	shadow = Sprite2D.new()
	shadow.texture = glow
	shadow.modulate = Color(0, 0, 0.05, 0.55)
	shadow.scale = Vector2(0.55, 0.12) * size_k * (2.2 if boss else 1.0)
	add_child(shadow)
	tele = Sprite2D.new()
	tele.texture = glow
	tele.material = add
	tele.modulate = Color(1, 0.6, 0.3, 0)
	tele.position = center_off
	add_child(tele)
	if kind == "cyclops":
		body_node = Node2D.new()
		body_node.draw.connect(_draw_wings)
		add_child(body_node)
	if tex != null:
		sprite = Sprite2D.new()
		sprite.texture = tex
		var k = 1.0 / 3.0
		sprite.scale = Vector2(k, k) * size_k
		sprite.position = _sprite_base()
		mat = ShaderMaterial.new()
		mat.shader = SHADER
		mat.set_shader_parameter("elite", 1.0 if (elite or golden) else 0.0)
		mat.set_shader_parameter("elite_color", Color(1.0, 0.8, 0.2) if golden else Color(0.9, 0.35, 1.0))
		mat.set_shader_parameter("edge_color", main.pal.ember)
		mat.set_shader_parameter("flash", 0.0)
		mat.set_shader_parameter("dissolve", 0.0)
		if golden:
			sprite.modulate = Color(1.25, 1.05, 0.6)
		sprite.material = mat
		add_child(sprite)
	else:
		body_node = Node2D.new()
		body_node.draw.connect(_draw_procedural)
		add_child(body_node)
	eyes = Node2D.new()
	eyes.draw.connect(_draw_eyes)
	add_child(eyes)
	ui = Node2D.new()
	ui.z_index = 8
	ui.draw.connect(_draw_ui)
	add_child(ui)
	if elite or golden:
		var aura = Sprite2D.new()
		aura.texture = glow
		aura.material = add
		aura.modulate = Color(1.0, 0.8, 0.3, 0.4) if golden else Color(0.85, 0.35, 1.0, 0.35)
		aura.position = center_off
		aura.scale = Vector2.ONE * 0.9 * size_k
		aura.show_behind_parent = true
		add_child(aura)


func _sprite_base() -> Vector2:
	var w: float = meta.get("w", 120.0)
	var h: float = meta.get("h", 120.0)
	return Vector2(w * 0.5 - float(meta.ox), h * 0.5 - float(meta.oy)) * size_k


func world_center() -> Vector2:
	return position + center_off + Vector2(0, hop_y)


func vulnerable() -> bool:
	if dead:
		return false
	if kind == "burrower":
		return state == "up" or state == "emerge"
	if boss:
		return state != "intro"
	return true


func touch_damage() -> bool:
	if kind == "burrower":
		return state == "up" or state == "emerge"
	if kind == "charger" and state == "dazed":
		return false
	return true


func _process(dt: float) -> void:
	if dead:
		return
	t += dt
	st += dt
	cd -= dt
	bar_t = maxf(bar_t - dt, 0.0)
	flash = maxf(flash - dt * 6.0, 0.0)
	if mat:
		mat.set_shader_parameter("flash", flash)
	var p: Player = main.player
	var to_p = p.body_center() - world_center()
	if absf(knock) > 1.0:
		position.x = clampf(position.x + knock * dt, lo - 30.0, hi + 30.0)
		knock = move_toward(knock, 0.0, 600.0 * dt)
	match kind:
		"brute": _brute(dt, to_p)
		"spike": _spike(dt, to_p)
		"cyclops": _cyclops(dt, to_p)
		"charger": _charger(dt, to_p)
		"burrower": _burrower(dt, to_p)
		"drone": _drone(dt, to_p)
		"slime": _slime(dt, to_p)
		"titan": _titan(dt, to_p)
	var bob = 0.0
	var sq = 1.0
	if kind == "cyclops" or kind == "drone":
		bob = sin(t * 3.0 + home.x) * 6.0
	elif state == "patrol" and kind != "slime":
		bob = -absf(sin(t * 7.0)) * 3.0
		sq = 1.0 + sin(t * 14.0) * 0.04
	if kind == "titan":
		bob = -absf(sin(t * 3.0)) * 4.0
	if sprite:
		var base = _sprite_base()
		sprite.position = base + Vector2(sin(t * 60.0) * 1.5 if state == "warn" else 0.0, bob + hop_y)
		sprite.scale = Vector2((1.0 / 3.0) / sq * (-1.0 if dir > 0.0 else 1.0), (1.0 / 3.0) * sq) * size_k
		if kind == "burrower":
			var vis = 0.0
			match state:
				"under": vis = 0.0
				"emerge": vis = st / 0.35
				"up": vis = 1.0
				"dig": vis = 1.0 - st / 0.35
			vis = clampf(vis, 0.0, 1.0)
			sprite.position.y = base.y + (1.0 - vis) * 40.0
			sprite.visible = vis > 0.02
			sprite.region_enabled = true
			var th = float(sprite.texture.get_height())
			sprite.region_rect = Rect2(0, 0, sprite.texture.get_width(), th * (0.55 + 0.45 * vis))
	tele.position = center_off + Vector2(0, bob + hop_y)
	if kind == "cyclops" or kind == "drone":
		shadow.position = Vector2(-3, main.ground_below(position) - position.y)
		shadow.visible = shadow.position.y < 260.0
	else:
		shadow.position = Vector2(-3, 1)
	eyes.queue_redraw()
	ui.queue_redraw()
	if body_node:
		body_node.queue_redraw()


func _set_state(s: String) -> void:
	state = s
	st = 0.0


func _patrol(dt: float, spd: float) -> void:
	position.x += dir * spd * dt
	if position.x < lo or position.x > hi:
		dir = -dir
		position.x = clampf(position.x, lo, hi)


func _warn_glow(col: Color, dur: float) -> void:
	tele.modulate = Color(col, minf(st / dur, 1.0) * 0.9)
	tele.scale = Vector2.ONE * (0.4 + st * 1.2) * (2.0 if boss else 1.0)


func _fade_tele(dt: float, rate: float = 3.0) -> void:
	tele.modulate.a = maxf(tele.modulate.a - dt * rate, 0.0)


func _start_warn() -> void:
	_set_state("warn")
	Sfx.play("warn", 1.0 if not boss else 0.6)


# ---------------- behaviours ----------------
func _brute(dt: float, to_p: Vector2) -> void:
	match state:
		"patrol":
			_patrol(dt, speed)
			if cd <= 0.0 and absf(to_p.x) < 120.0 and absf(to_p.y) < 60.0:
				dir = signf(to_p.x)
				_start_warn()
		"warn":
			_warn_glow(main.pal.ember, 0.6)
			if st > 0.6:
				_set_state("leap")
				hop_v = -360.0
		"leap":
			hop_v += 1900.0 * dt
			hop_y = minf(hop_y + hop_v * dt, 0.0)
			_fade_tele(dt)
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
			_patrol(dt, speed)
			hop_v += 1900.0 * dt
			hop_y = minf(hop_y + hop_v * dt, 0.0)
			if hop_y >= 0.0 and randf() < dt * 1.2:
				hop_v = -260.0
			if cd <= 0.0 and to_p.length() < 280.0 and hop_y >= 0.0:
				dir = signf(to_p.x)
				_start_warn()
		"warn":
			_warn_glow(main.pal.dusk.lightened(0.3), 0.45)
			if st > 0.45:
				var n = 5 if elite else 3
				for i in n:
					main.spawn_shot("quill", world_center() + Vector2(0, -10), Vector2.from_angle(to_p.angle() + (i - (n - 1) * 0.5) * 0.22) * 260.0)
				Sfx.play("quill")
				_set_state("rest")
		"rest":
			_fade_tele(dt, 4.0)
			if st > 0.7:
				cd = randf_range(2.0, 3.0)
				_set_state("patrol")


func _cyclops(dt: float, to_p: Vector2) -> void:
	match state:
		"patrol":
			_patrol(dt, speed)
			position.y = home.y + sin(t * 0.9) * 26.0
			if cd <= 0.0 and to_p.length() < 300.0:
				_start_warn()
				Sfx.play("charge", 0.7)
		"warn":
			dir = signf(to_p.x) if absf(to_p.x) > 2.0 else dir
			_warn_glow(main.pal.moss.lightened(0.4), 0.8)
			if st > 0.8:
				main.fire_beam(world_center() + Vector2(0, -6), (main.player.body_center() - world_center()).normalized())
				_set_state("rest")
		"rest":
			_fade_tele(dt, 2.0)
			if st > 1.0:
				cd = randf_range(2.8, 4.0)
				_set_state("patrol")


func _charger(dt: float, to_p: Vector2) -> void:
	match state:
		"patrol":
			_patrol(dt, speed)
			if cd <= 0.0 and absf(to_p.x) < 230.0 and absf(to_p.y) < 50.0:
				dir = signf(to_p.x)
				_start_warn()
		"warn":
			_warn_glow(Color(1, 0.35, 0.3), 0.55)
			if fmod(st, 0.12) < dt:
				main.fx_dust(position + Vector2(-dir * 14.0, 0), 2, 40.0)
			if st > 0.55:
				_set_state("charge")
				Sfx.play("dash", 0.7)
		"charge":
			position.x += dir * 300.0 * dt
			if fmod(st, 0.06) < dt:
				main.fx_dust(position + Vector2(-dir * 10.0, 0), 2, 30.0)
			if position.x < lo - 10.0 or position.x > hi + 10.0 or st > 1.4:
				position.x = clampf(position.x, lo - 10.0, hi + 10.0)
				main.shake(4.0)
				main.fx_burst(world_center() + Vector2(dir * radius, 0), main.pal.moon, 10, 120.0, 0.4, 200.0, 0.05)
				Sfx.play("stomp", 0.8)
				_set_state("dazed")
		"dazed":
			_fade_tele(dt)
			if st > 1.1:
				cd = randf_range(1.5, 2.5)
				dir = -dir
				_set_state("patrol")


func _burrower(dt: float, to_p: Vector2) -> void:
	match state:
		"under":
			if absf(to_p.x) > 20.0:
				position.x = clampf(position.x + signf(to_p.x) * speed * dt, lo, hi)
			if fmod(st, 0.25) < dt:
				main.fx_dust(position, 1, 20.0)
			if cd <= 0.0 and absf(to_p.x) < 46.0 and absf(to_p.y) < 70.0:
				_set_state("emerge")
				Sfx.play("burrow")
				main.fx_dust(position, 12, 90.0)
		"emerge":
			if st > 0.35:
				_set_state("up")
				shots = 0
		"up":
			dir = signf(to_p.x) if absf(to_p.x) > 2.0 else dir
			if shots == 0 and st > 0.5:
				shots = 1
				var v = Vector2(clampf(to_p.x * 1.6, -220.0, 220.0), -330.0)
				main.spawn_shot("clod", world_center() + Vector2(0, -12), v)
			if st > 1.6:
				_set_state("dig")
				Sfx.play("burrow", 1.2)
		"dig":
			if st > 0.35:
				cd = randf_range(1.0, 1.8)
				_set_state("under")


func _drone(dt: float, to_p: Vector2) -> void:
	match state:
		"patrol":
			var target_x = clampf(main.player.position.x - signf(to_p.x) * 120.0, lo, hi)
			position.x = move_toward(position.x, target_x, speed * dt)
			position.y = home.y + sin(t * 1.3) * 20.0
			dir = signf(to_p.x) if absf(to_p.x) > 2.0 else dir
			if cd <= 0.0 and to_p.length() < 320.0:
				_start_warn()
		"warn":
			_warn_glow(Color(1, 0.3, 0.3), 0.5)
			if st > 0.5:
				_set_state("fire")
				shots = 0
		"fire":
			if st > shots * 0.13 and shots < 3:
				shots += 1
				var d = (main.player.body_center() - world_center()).normalized()
				main.spawn_shot("bolt", world_center() + d * 14.0, d * 300.0)
				Sfx.play("laser")
			if st > 0.5:
				_fade_tele(dt, 5.0)
				cd = randf_range(2.2, 3.2)
				_set_state("patrol")


func _slime(dt: float, to_p: Vector2) -> void:
	hop_v += 1900.0 * dt
	hop_y = minf(hop_y + hop_v * dt, 0.0)
	if hop_y < 0.0:
		position.x = clampf(position.x + vx * dt, lo, hi)
	elif hop_v > 0.0 and st > 0.2:
		if hop_v > 400.0:
			Sfx.play("splat", 1.4 if mini else 1.0, 0.1, -6.0)
		hop_v = 0.0
		vx = 0.0
		st = 0.0
	if hop_y >= 0.0 and st > (0.9 if absf(to_p.x) < 260.0 else 1.6):
		dir = signf(to_p.x) if absf(to_p.x) > 2.0 else dir
		hop_v = -380.0 if not mini else -300.0
		vx = dir * (80.0 if not mini else 100.0)
		st = 0.0


func _titan(dt: float, to_p: Vector2) -> void:
	var ratio = float(hp) / float(max_hp)
	var np = 1 if ratio > 0.6 else (2 if ratio > 0.3 else 3)
	if np != phase_n:
		phase_n = np
		main.boss_phase(self, np)
	var rage = 1.0 + (phase_n - 1) * 0.3
	match state:
		"intro":
			if st > 1.6:
				_set_state("patrol")
				cd = 1.0
		"patrol":
			_patrol(dt, speed * rage)
			dir = signf(to_p.x) if absf(to_p.x) > 30.0 else dir
			if cd <= 0.0:
				var options = ["pound", "charge", "quills"]
				if phase_n >= 2:
					options.append("summon")
				if phase_n >= 3:
					options.append("beam")
					options.append("pound")
				attack = options[randi() % options.size()]
				_start_warn()
				Sfx.play("roar", 1.0 + (phase_n - 1) * 0.1, 0.05, -4.0)
		"warn":
			_warn_glow(main.pal.ember if attack != "beam" else main.pal.moss.lightened(0.4), 0.7 / rage)
			if st > 0.7 / rage:
				match attack:
					"pound":
						hop_v = -620.0
						_set_state("leap")
					"charge":
						dir = signf(to_p.x)
						_set_state("charge")
					"quills":
						var n = 7 + phase_n * 2
						for i in n:
							main.spawn_shot("quill", world_center() + Vector2(0, -30), Vector2.from_angle(-PI * 0.95 + PI * 0.9 * i / float(n - 1)) * 240.0)
						Sfx.play("quill", 0.8)
						_set_state("rest")
					"summon":
						for k in [-1.0, 1.0]:
							main.spawn_monster({"kind": "slime", "pos": Vector2(clampf(position.x + k * 90.0, lo, hi), position.y), "min": lo, "max": hi, "mini": true})
						main.fx_burst(world_center(), main.pal.moss.lightened(0.4), 30, 200.0, 0.7, 0.0, 0.08)
						_set_state("rest")
					"beam":
						for k in [-0.18, 0.0, 0.18]:
							main.fire_beam(world_center() + Vector2(0, -30), (main.player.body_center() - world_center()).normalized().rotated(k))
						_set_state("rest")
		"leap":
			hop_v += 1700.0 * dt
			hop_y = minf(hop_y + hop_v * dt, 0.0)
			position.x = clampf(position.x + signf(to_p.x) * 90.0 * dt, lo, hi)
			_fade_tele(dt)
			if hop_y >= 0.0 and st > 0.15:
				hop_y = 0.0
				main.shockwave(position, main.pal.ember, 2)
				main.shake(12.0)
				for i in 3 + phase_n:
					main.spawn_shot("clod", world_center() + Vector2(randf_range(-40, 40), -60), Vector2(randf_range(-200, 200), randf_range(-420, -300)))
				_set_state("rest")
		"charge":
			position.x += dir * 330.0 * rage * dt
			if fmod(st, 0.05) < dt:
				main.fx_dust(position + Vector2(-dir * 40.0, 0), 3, 50.0)
			if position.x <= lo or position.x >= hi or st > 2.0:
				position.x = clampf(position.x, lo, hi)
				main.shake(10.0)
				Sfx.play("stomp", 0.6)
				_set_state("rest")
		"rest":
			_fade_tele(dt, 2.0)
			if st > 1.2 / rage:
				cd = randf_range(0.6, 1.4) / rage
				_set_state("patrol")


# ---------------- damage ----------------
func hit(dmg: int, from_x: float) -> void:
	if not vulnerable():
		return
	hp -= dmg
	flash = 1.0
	bar_t = 2.5
	knock = signf(position.x - from_x) * (60.0 if boss else 220.0)
	main.fx_burst(world_center(), body_color, 10, 120.0, 0.45, 220.0, 0.07, false)
	main.float_text(world_center() + Vector2(0, -radius - 6), str(dmg), main.pal.moon)
	Sfx.play("hit", 0.8 if boss else 1.0)
	if kind == "charger" and state == "warn":
		_set_state("dazed")
	elif state == "warn" and kind != "cyclops" and not boss:
		_set_state("rest")
	if hp <= 0:
		_die()


func _die() -> void:
	dead = true
	main.on_monster_killed(self)
	var tw = create_tween()
	if mat:
		tw.tween_method(func(v: float): mat.set_shader_parameter("dissolve", v), 0.0, 1.0, 0.9 if boss else 0.55)
	else:
		tw.tween_property(self, "scale", Vector2(1.4, 0.3), 0.25)
		tw.parallel().tween_property(self, "modulate:a", 0.0, 0.3)
	tw.parallel().tween_property(tele, "modulate:a", 0.0, 0.3)
	tw.parallel().tween_property(shadow, "modulate:a", 0.0, 0.4)
	tw.tween_callback(queue_free)


# ---------------- drawing ----------------
func _draw_ui() -> void:
	if dead or boss or kind == "burrower" and state == "under":
		return
	if bar_t <= 0.0 and not (elite or golden):
		return
	var a = clampf(bar_t, 0.0, 1.0) if not (elite or golden) else 1.0
	var w = 36.0 * maxf(size_k, 0.8)
	var y = center_off.y + hop_y - radius - 14.0
	var r = Rect2(-w * 0.5, y, w, 5.0)
	ui.draw_rect(r.grow(1.5), Color(main.pal.ink, 0.75 * a))
	var k = float(hp) / float(max_hp)
	var col = Color(1.0, 0.8, 0.25) if golden else (Color(0.85, 0.4, 1.0) if elite else Color(1.0, 0.36, 0.36).lerp(Color(0.5, 1.0, 0.6), k))
	ui.draw_rect(Rect2(r.position, Vector2(w * k, 5.0)), Color(col, a))
	ui.draw_rect(Rect2(r.position, Vector2(w * k, 2.0)), Color(1, 1, 1, 0.35 * a))


func _draw_eyes() -> void:
	if not meta.has("eyes") or diss > 0.25:
		return
	if kind == "burrower" and state == "under":
		return
	var p: Player = main.player
	var blink = fmod(t * 0.7 + home.x * 0.01, 3.2) < 0.12
	var flip = -1.0 if dir > 0.0 else 1.0
	var iris = Color(meta.iris[0], meta.iris[1], meta.iris[2])
	if state == "warn" or state == "charge":
		iris = Color(1, 0.3, 0.25) if (kind == "charger" or boss) else (main.pal.ember.lightened(0.3) if kind != "cyclops" else main.pal.moss.lightened(0.5))
	var off_y = 0.0
	if sprite:
		off_y = sprite.position.y - _sprite_base().y
	for e in meta.eyes:
		var local = (Vector2(e.x - meta.ox, e.y - meta.oy) * Vector2(flip, 1.0)) * size_k + Vector2(0, off_y)
		var r: float = e.r * size_k
		var look = (p.body_center() - (position + local)).normalized()
		eyes.draw_circle(local + Vector2(0, 1), r + 1.2, Color(main.pal.ink, 0.5))
		eyes.draw_circle(local, r, Color(0.95, 0.97, 1.0))
		eyes.draw_circle(local + Vector2(r * 0.25, -r * 0.3), r * 0.55, Color(1, 1, 1, 0.6))
		var ip = local + look * r * 0.38
		eyes.draw_circle(ip, r * 0.52, iris.darkened(0.2))
		eyes.draw_circle(ip + Vector2(-r * 0.08, -r * 0.08), r * 0.38, iris.lightened(0.25))
		eyes.draw_circle(ip, r * 0.26, main.pal.ink.darkened(0.5))
		eyes.draw_circle(ip + Vector2(r * 0.2, -r * 0.22), r * 0.14, Color.WHITE)
		var lid = 0.0
		if blink:
			lid = 1.0
		elif state == "warn" and (kind == "brute" or kind == "charger" or boss):
			lid = 0.35
		elif state == "dazed":
			lid = 0.55
		if lid > 0.0:
			eyes.draw_rect(Rect2(local.x - r - 1, local.y - r - 1, 2 * r + 2, (2 * r + 2) * lid), body_color.darkened(0.1))
			eyes.draw_line(Vector2(local.x - r, local.y - r + 2 * r * lid), Vector2(local.x + r, local.y - r + 2 * r * lid), body_color.darkened(0.6), 1.3)
	if state == "dazed":
		for i in 3:
			var a = t * 4.0 + TAU * i / 3.0
			var sp = center_off + Vector2(cos(a) * 16.0, -radius - 4.0 + sin(a) * 4.0)
			eyes.draw_circle(sp, 2.2, Color(1, 0.95, 0.6))


func _draw_wings() -> void:
	var f = sin(t * 14.0)
	var base = Color(main.pal.dusk)
	var sy = sprite.position.y if sprite else 0.0
	for k in [-1.0, 1.0]:
		var xf = Transform2D(-0.3 * k + f * 0.5 * k, Vector2(20.0 * k * size_k, sy - 2.0))
		var pts = PackedVector2Array([Vector2(0, 0), Vector2(10, -20), Vector2(34, -14), Vector2(30, 2), Vector2(20, 6), Vector2(6, 8)])
		var out = PackedVector2Array()
		var cols = PackedColorArray()
		for q in pts:
			out.append(xf * (Vector2(q.x * k, q.y) * size_k))
			cols.append(base.lerp(main.pal.moon, 0.25) if q.y < -10.0 else base.darkened(0.5))
		body_node.draw_polygon(out, cols)
		body_node.draw_polyline(PackedVector2Array([out[0], out[1], out[2]]), base.darkened(0.6), 1.2, true)


func _draw_procedural() -> void:
	var c = center_off + Vector2(0, hop_y)
	if kind == "slime":
		var r = radius
		var squish = 1.0
		if hop_y < 0.0:
			squish = 1.0 + clampf(-hop_v / 900.0, -0.25, 0.3)
		else:
			squish = 1.0 - 0.12 * absf(sin(t * 6.0))
		var pts = PackedVector2Array()
		var cols = PackedColorArray()
		var base = body_color
		for i in 28:
			var a = TAU * i / 28.0
			var wob = 1.0 + sin(a * 3.0 + t * 5.0) * 0.05
			var p = Vector2(cos(a) * r * wob / squish, minf(sin(a), 0.75) * r * wob * squish)
			pts.append(c + p + Vector2(0, r * (1.0 - squish) * 0.6))
			var lit = clampf(0.5 - p.y / (2.0 * r) + p.x / (3.0 * r), 0.0, 1.0)
			cols.append(base.darkened(0.45).lerp(base.lightened(0.35), lit))
		body_node.draw_polygon(pts, cols)
		body_node.draw_polyline(pts + PackedVector2Array([pts[0]]), Color(main.pal.moon, 0.35), 1.2, true)
		body_node.draw_circle(c + Vector2(r * 0.35, -r * 0.45), r * 0.18, Color(1, 1, 1, 0.55))
		body_node.draw_circle(c + Vector2(r * 0.15, -r * 0.6), r * 0.08, Color(1, 1, 1, 0.7))
		var flip = 1.0 if dir > 0.0 else -1.0
		for k in [-1.0, 1.0]:
			var ep = c + Vector2(flip * r * 0.25 + k * r * 0.28, -r * 0.1)
			body_node.draw_circle(ep, r * 0.17, Color(0.98, 1, 1))
			body_node.draw_circle(ep + (main.player.body_center() - position - ep).normalized() * r * 0.06, r * 0.09, main.pal.ink.darkened(0.4))
		body_node.draw_arc(c + Vector2(flip * r * 0.25, r * 0.22), r * 0.22, 0.2, PI - 0.2, 10, main.pal.ink.darkened(0.3), 2.0, true)
	elif kind == "drone":
		var r2 = radius
		var metal = main.pal.moon.lerp(main.pal.dusk, 0.55)
		var pts2 = PackedVector2Array()
		var cols2 = PackedColorArray()
		for i in 24:
			var a2 = TAU * i / 24.0
			var p2 = Vector2(cos(a2), sin(a2)) * r2
			pts2.append(c + p2)
			cols2.append(metal.darkened(0.55).lerp(metal.lightened(0.35), clampf(0.5 - p2.y / (2.0 * r2) + p2.x / (3.0 * r2), 0.0, 1.0)))
		body_node.draw_polygon(pts2, cols2)
		body_node.draw_arc(c, r2 + 1.0, -PI * 0.6, PI * 0.05, 12, Color(main.pal.moon, 0.7), 1.6, true)
		body_node.draw_rect(Rect2(c.x - r2 - 4, c.y - 2.5, r2 * 2.0 + 8, 5), metal.darkened(0.3))
		var spin = t * 30.0
		for k in 2:
			var ang = spin + PI * k
			body_node.draw_line(c + Vector2(0, -r2 - 4), c + Vector2(cos(ang) * 22.0, -r2 - 4 + sin(ang) * 2.0), Color(main.pal.moon, 0.7), 2.0, true)
		body_node.draw_line(c + Vector2(0, -r2), c + Vector2(0, -r2 - 4), metal.darkened(0.4), 2.0)
		var eye_c = Color(1, 0.3, 0.25) if state == "warn" and fmod(st, 0.12) < 0.06 else main.pal.moss.lightened(0.45)
		var ep2 = c + (main.player.body_center() - world_center()).normalized() * r2 * 0.3
		body_node.draw_circle(ep2, r2 * 0.42, main.pal.ink.darkened(0.4))
		body_node.draw_circle(ep2, r2 * 0.28, eye_c)
		body_node.draw_circle(ep2 + Vector2(2, -2), r2 * 0.1, Color.WHITE)
		var fl = 6.0 + sin(t * 40.0) * 2.0
		body_node.draw_colored_polygon(PackedVector2Array([c + Vector2(-4, r2), c + Vector2(4, r2), c + Vector2(0, r2 + fl)]), main.pal.ember.lightened(0.3))
