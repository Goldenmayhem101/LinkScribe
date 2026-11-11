extends Node2D
## Gloamwood: game orchestrator.
## Layers (back to front): sky -> parallax backdrop -> world (lit) -> foreground -> post FX -> HUD.

const VW := 400.0            # logical view width; camera zoom maps it to the 720px viewport
const ZOOM := 720.0 / 400.0
const SAVE_PATH := "user://save.cfg"

var player: Player
var hud: Hud
var cam: Camera2D
var gen = LevelGen.new()
var level: Dictionary = {}
var solids: Array = []
var pal: Dictionary = {}
var biome = ""
var stage = 1
var run_seed = 1
var coins_total = 0
var hearts = 3
var respawn = Vector2.ZERO
var autoplay = false
var t = 0.0
var shake_amt = 0.0
var hurt_pulse = 0.0
var transitioning = false

var tex: Dictionary = {}     # biome -> {name: Texture2D}
var metas: Dictionary = {}   # biome -> meta.json
var glow: Texture2D
var leaf_tex: Texture2D

var sky_layer: CanvasLayer
var bg_layer: CanvasLayer
var fg_layer: CanvasLayer
var post_layer: CanvasLayer
var hud_layer: CanvasLayer
var sky_root: Node2D
var bg_root: Node2D
var fg_root: Node2D
var sky: Sprite2D
var stars: Sprite2D
var moon: Sprite2D
var rays: Array[Sprite2D] = []
var twinkles: Array[Sprite2D] = []
var par: Array = []          # [{sprite, fx, fy, top, auto, alpha}]
var lantern_sprites: Array[Sprite2D] = []
var post: ColorRect
var tint_rect: TextureRect
var canvas_mod: CanvasModulate

var world: Node2D
var level_root: Node2D
var fx_norm: Node2D
var fx_add: Node2D
var fx_items: Array = []
var projectiles: Array = []
var coin_list: Array = []
var monsters: Array = []
var checkpoint_nodes: Array = []
var portal: Node2D
var grass_mat: ShaderMaterial
var fireflies: CPUParticles2D
var pollen: CPUParticles2D
var leaves: CPUParticles2D
var add_mat: CanvasItemMaterial

# autoplay bot memory
var bot_last_x = 0.0
var bot_stuck = 0.0


func _ready() -> void:
	randomize()
	autoplay = OS.get_cmdline_user_args().has("--autoplay")
	_setup_input()
	_load_save()
	add_mat = CanvasItemMaterial.new()
	add_mat.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	for b in LevelGen.BIOMES:
		_load_biome(b)
	glow = tex["gloamwood"]["glow"]
	leaf_tex = _make_leaf()
	_build_layers()
	_build_world()
	_build_hud()
	run_seed = randi() % 100000 if not autoplay else 4242
	start_stage(1)


func _setup_input() -> void:
	var map = {
		"left": [KEY_LEFT, KEY_A], "right": [KEY_RIGHT, KEY_D],
		"jump": [KEY_SPACE, KEY_UP, KEY_W], "fire": [KEY_J, KEY_X, KEY_K], "pause": [KEY_ESCAPE, KEY_P],
	}
	for action in map:
		if not InputMap.has_action(action):
			InputMap.add_action(action)
		for k in map[action]:
			var e = InputEventKey.new()
			e.physical_keycode = k
			InputMap.action_add_event(action, e)


func _load_biome(b: String) -> void:
	var d = {}
	for n in ["sky", "stars", "moon", "ray", "mountains", "trees_mid", "trees_near", "ground", "platform", "foreground",
			"fog0", "fog1", "fog2", "monster_brute", "monster_spike", "monster_cyclops", "grass", "glow", "coin"]:
		d[n] = load("res://assets/%s/%s.png" % [b, n])
	tex[b] = d
	var f = FileAccess.open("res://assets/%s/meta.json" % b, FileAccess.READ)
	metas[b] = JSON.parse_string(f.get_as_text())


func _make_leaf() -> Texture2D:
	var img = Image.create(16, 9, false, Image.FORMAT_RGBA8)
	for y in 9:
		for x in 16:
			var u = (x - 7.5) / 8.0
			var v = (y - 4.0) / 4.5
			var inside = u * u + v * v * (1.0 + absf(u)) < 1.0
			var vein = absf(v) < 0.15
			img.set_pixel(x, y, Color(1, 1, 1, 0.95) if inside and not vein else (Color(0.7, 0.7, 0.7, 0.9) if inside else Color(0, 0, 0, 0)))
	return ImageTexture.create_from_image(img)


func view_h() -> float:
	return get_viewport_rect().size.y / ZOOM


func tscale(name: String) -> float:
	var m: Dictionary = metas[biome]
	return float(tex[biome][name].get_width()) / float(m.sizes[name][0])


# ---------------- construction ----------------
func _build_layers() -> void:
	sky_layer = CanvasLayer.new()
	sky_layer.layer = -20
	add_child(sky_layer)
	sky_root = Node2D.new()
	sky_root.scale = Vector2(ZOOM, ZOOM)
	sky_layer.add_child(sky_root)
	sky = Sprite2D.new(); sky.centered = false; sky_root.add_child(sky)
	stars = Sprite2D.new(); stars.centered = false; sky_root.add_child(stars)
	for i in 14:
		var tw = Sprite2D.new()
		tw.texture = glow
		tw.material = add_mat
		tw.scale = Vector2.ONE * randf_range(0.06, 0.11)
		tw.position = Vector2(randf() * VW, pow(randf(), 1.6) * 360.0)
		sky_root.add_child(tw)
		twinkles.append(tw)
	moon = Sprite2D.new(); sky_root.add_child(moon)
	for i in 7:
		var r = Sprite2D.new()
		r.centered = false
		r.material = add_mat
		sky_root.add_child(r)
		rays.append(r)
	bg_layer = CanvasLayer.new()
	bg_layer.layer = -10
	add_child(bg_layer)
	bg_root = Node2D.new()
	bg_root.scale = Vector2(ZOOM, ZOOM)
	bg_layer.add_child(bg_root)
	var specs = [
		["mountains", 0.08, 0.12, -330.0, 2.0, 1.0],
		["fog0", 0.12, 0.2, -200.0, 5.0, 0.55],
		["trees_mid", 0.3, 0.35, -565.0, 0.0, 1.0],
		["fog1", 0.42, 0.5, -150.0, 9.0, 0.5],
		["trees_near", 0.62, 0.7, -565.0, 0.0, 1.0],
		["fog2", 0.7, 0.75, -110.0, 14.0, 0.42],
	]
	for sp in specs:
		var s = Sprite2D.new()
		s.centered = false
		s.region_enabled = true
		s.texture_repeat = CanvasItem.TEXTURE_REPEAT_ENABLED
		s.modulate.a = sp[5]
		bg_root.add_child(s)
		var entry = {"sprite": s, "name": sp[0], "fx": sp[1], "fy": sp[2], "top": sp[3], "auto": sp[4]}
		if sp[0] == "trees_mid" or sp[0] == "trees_near":
			var fill = TextureRect.new()
			fill.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			fill.stretch_mode = TextureRect.STRETCH_SCALE
			fill.size = Vector2(VW + 8.0, 900.0)
			bg_root.add_child(fill)
			entry["fill"] = fill
		par.append(entry)
		if sp[0] == "trees_near":
			for i in 18:
				var ls = Sprite2D.new()
				ls.texture = glow
				ls.material = add_mat
				ls.visible = false
				bg_root.add_child(ls)
				lantern_sprites.append(ls)
	fg_layer = CanvasLayer.new()
	fg_layer.layer = 5
	add_child(fg_layer)
	fg_root = Node2D.new()
	fg_root.scale = Vector2(ZOOM, ZOOM)
	fg_layer.add_child(fg_root)
	for sp in [["fog1", 1.1, 1.0, -70.0, 20.0, 0.3], ["foreground", 1.35, 0.0, 0.0, 0.0, 1.0]]:
		var s2 = Sprite2D.new()
		s2.centered = false
		s2.region_enabled = true
		s2.texture_repeat = CanvasItem.TEXTURE_REPEAT_ENABLED
		s2.modulate.a = sp[5]
		fg_root.add_child(s2)
		par.append({"sprite": s2, "name": sp[0], "fx": sp[1], "fy": sp[2], "top": sp[3], "auto": sp[4], "fg": true})
	post_layer = CanvasLayer.new()
	post_layer.layer = 8
	add_child(post_layer)
	tint_rect = TextureRect.new()
	tint_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	tint_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	tint_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	tint_rect.stretch_mode = TextureRect.STRETCH_SCALE
	var mul = CanvasItemMaterial.new()
	mul.blend_mode = CanvasItemMaterial.BLEND_MODE_MUL
	tint_rect.material = mul
	post_layer.add_child(tint_rect)
	post = ColorRect.new()
	post.set_anchors_preset(Control.PRESET_FULL_RECT)
	post.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var pm = ShaderMaterial.new()
	pm.shader = preload("res://shaders/post.gdshader")
	post.material = pm
	post_layer.add_child(post)


func _build_world() -> void:
	world = Node2D.new()
	add_child(world)
	canvas_mod = CanvasModulate.new()
	world.add_child(canvas_mod)
	level_root = Node2D.new()
	world.add_child(level_root)
	grass_mat = ShaderMaterial.new()
	grass_mat.shader = preload("res://shaders/grass.gdshader")
	player = Player.new()
	world.add_child(player)
	fx_norm = Node2D.new()
	fx_norm.z_index = 5
	fx_norm.draw.connect(_draw_fx.bind(false))
	world.add_child(fx_norm)
	fx_add = Node2D.new()
	fx_add.z_index = 6
	fx_add.material = add_mat
	fx_add.draw.connect(_draw_fx.bind(true))
	world.add_child(fx_add)
	cam = Camera2D.new()
	cam.zoom = Vector2(ZOOM, ZOOM)
	world.add_child(cam)
	cam.make_current()
	fireflies = _ambient(34, 7.0, Vector2(230, 380), 14.0, Vector2.ZERO, 0.05, 0.11, true, glow)
	pollen = _ambient(60, 9.0, Vector2(230, 380), 7.0, Vector2(3, -2), 0.012, 0.022, true, glow)
	leaves = _ambient(14, 9.0, Vector2(230, 40), 10.0, Vector2(8, 24), 0.7, 1.1, false, leaf_tex)
	leaves.angular_velocity_min = -120.0
	leaves.angular_velocity_max = 120.0
	leaves.angle_min = 0.0
	leaves.angle_max = 360.0


func _ambient(n: int, life: float, ext: Vector2, vel: float, grav: Vector2, s0: float, s1: float, additive: bool, texture: Texture2D) -> CPUParticles2D:
	var p = CPUParticles2D.new()
	p.amount = n
	p.lifetime = life
	p.preprocess = life
	p.local_coords = false
	p.texture = texture
	p.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	p.emission_rect_extents = ext
	p.direction = Vector2.UP
	p.spread = 180.0
	p.initial_velocity_min = vel * 0.3
	p.initial_velocity_max = vel
	p.gravity = grav
	p.scale_amount_min = s0
	p.scale_amount_max = s1
	if additive:
		p.material = add_mat
	p.z_index = 4
	world.add_child(p)
	return p


func _build_hud() -> void:
	hud_layer = CanvasLayer.new()
	hud_layer.layer = 10
	add_child(hud_layer)
	hud = Hud.new()
	hud.main = self
	hud.autoplay = autoplay
	hud_layer.add_child(hud)


func _apply_biome(b: String) -> void:
	biome = b
	var m: Dictionary = metas[b]
	pal = {}
	for k in m.palette:
		var a: Array = m.palette[k]
		pal[k] = Color(a[0], a[1], a[2])
	var tx: Dictionary = tex[b]
	glow = tx["glow"]
	sky.texture = tx["sky"]
	stars.texture = tx["stars"]
	stars.scale = Vector2.ONE / tscale("stars")
	moon.texture = tx["moon"]
	moon.scale = Vector2.ONE / tscale("moon")
	for r in rays:
		r.texture = tx["ray"]
	for p in par:
		var s: Sprite2D = p.sprite
		s.texture = tx[p.name]
		if p.has("fill"):
			var img: Image = tx[p.name].get_image()
			if img.is_compressed():
				img.decompress()
			var bc := Color(0, 0, 0, 0)
			for i in 8:
				bc += img.get_pixel(int(img.get_width() * (i + 0.5) / 8.0), img.get_height() - 3)
			bc /= 8.0
			var base := Color(bc.r, bc.g, bc.b, 1.0).lerp(pal.ink, 0.35)
			var fg := Gradient.new()
			fg.set_color(0, Color(base, minf(bc.a * 1.4, 1.0)))
			fg.set_color(1, Color(pal.ink.darkened(0.5), 1.0))
			fg.add_point(0.25, Color(base.lerp(pal.ink, 0.6), 1.0))
			var gtx := GradientTexture2D.new()
			gtx.gradient = fg
			gtx.fill_to = Vector2(0, 1)
			gtx.width = 4
			gtx.height = 128
			p.fill.texture = gtx
		s.scale = Vector2.ONE / tscale(p.name)
	for tw in twinkles:
		tw.modulate = pal.moon
	for ls in lantern_sprites:
		ls.modulate = pal.ember
	canvas_mod.color = Color(0.86, 0.86, 0.96).lerp(pal.moon, 0.1)
	var grad = Gradient.new()
	grad.set_color(0, Color(0.9, 0.95, 1.0).lerp(pal.moss.lightened(0.6), 0.25))
	grad.set_color(1, Color(1.0, 0.95, 0.92).lerp(pal.ember.lightened(0.6), 0.25))
	var gt = GradientTexture2D.new()
	gt.gradient = grad
	gt.fill_from = Vector2(0, 0)
	gt.fill_to = Vector2(0, 1)
	tint_rect.texture = gt
	(post.material as ShaderMaterial).set_shader_parameter("shade", pal.ink.darkened(0.4))
	fireflies.color = pal.ember.lerp(Color(0.8, 1.0, 0.6), 0.45)
	pollen.color = Color(pal.moon, 0.5)
	var lr = Gradient.new()
	lr.set_color(0, pal.moss.lerp(pal.moon, 0.15))
	lr.set_color(1, pal.ember.lerp(pal.dusk, 0.3))
	leaves.color_initial_ramp = lr
	if player.palette.is_empty():
		player.setup(self, glow, pal)
	else:
		player.recolor(pal)
	hud.pal = pal
	hud.coin_tex = tx["coin"]
	hud.coins = coins_total


# ---------------- stage lifecycle ----------------
func start_stage(n: int) -> void:
	stage = n
	for c in level_root.get_children():
		c.queue_free()
	coin_list.clear()
	monsters.clear()
	checkpoint_nodes.clear()
	projectiles.clear()
	fx_items.clear()
	var b = LevelGen.biome_for(n)
	if b != biome or pal.is_empty():
		_apply_biome(b)
	level = gen.generate(n, LevelGen.seed_for(n, run_seed))
	solids = level.solids
	_build_level()
	respawn = level.checkpoints[0]
	player.position = respawn
	player.vel = Vector2.ZERO
	player.reset_scarf()
	hearts = 3
	hud.hearts = hearts
	cam.position = player.position + Vector2(0, -110)
	var world_no = int((n - 1) / 2) + 1
	hud.stage_label = "%s  %d-%d" % [LevelGen.BIOME_NAMES[biome], world_no, (n - 1) % 2 + 1]
	hud.show_title(LevelGen.BIOME_NAMES[biome], "Stage %d  ·  seed %d" % [n, absi(level.seed) % 100000])
	print("Stage %d (%s) seed=%d solids=%d coins=%d enemies=%d helpers=%d length=%d" % [n, biome, level.seed, solids.size(), level.coins.size(), level.enemies.size(), level.helpers, int(level.end_x)])
	_save()


func _build_level() -> void:
	var tx: Dictionary = tex[biome]
	var gts = tscale("ground")
	var m: Dictionary = metas[biome]
	var y0: float = m.ground_tile_y0
	var gh: float = m.sizes.ground[1]
	var sg := Gradient.new()
	sg.set_color(0, pal.ink.darkened(0.3))
	sg.set_color(1, pal.ink.darkened(0.75))
	var soil_tex := GradientTexture2D.new()
	soil_tex.gradient = sg
	soil_tex.fill_to = Vector2(0, 1)
	soil_tex.width = 4
	soil_tex.height = 64
	for s in solids:
		var r: Rect2 = s.r
		if s.kind == "ground":
			var fill = TextureRect.new()
			fill.texture = soil_tex
			fill.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			fill.stretch_mode = TextureRect.STRETCH_SCALE
			fill.position = Vector2(r.position.x, r.position.y + gh - y0 - 4.0)
			fill.size = Vector2(r.size.x, 700.0)
			level_root.add_child(fill)
			var gs = Sprite2D.new()
			gs.texture = tx["ground"]
			gs.centered = false
			gs.region_enabled = true
			gs.texture_repeat = CanvasItem.TEXTURE_REPEAT_ENABLED
			gs.region_rect = Rect2(r.position.x * gts, 1.0, r.size.x * gts, gh * gts - 2.0)
			gs.scale = Vector2.ONE / gts
			gs.position = Vector2(r.position.x, r.position.y - y0)
			level_root.add_child(gs)
			var edge = Node2D.new()
			edge.draw.connect(_draw_edge.bind(edge, r))
			level_root.add_child(edge)
			var grass = Sprite2D.new()
			var grs = tscale("grass")
			grass.texture = tx["grass"]
			grass.centered = false
			grass.region_enabled = true
			grass.texture_repeat = CanvasItem.TEXTURE_REPEAT_ENABLED
			grass.region_rect = Rect2(r.position.x * grs, 1.0, r.size.x * grs, 40.0 * grs - 2.0)
			grass.scale = Vector2.ONE / grs
			grass.position = Vector2(r.position.x, r.position.y - 38.0)
			grass.material = grass_mat
			grass.z_index = 2
			level_root.add_child(grass)
		else:
			var ps = Sprite2D.new()
			var pts = tscale("platform")
			ps.texture = tx["platform"]
			ps.centered = false
			ps.scale = Vector2(r.size.x / 130.0, 1.0) / pts
			ps.position = Vector2(r.position.x, r.position.y - float(m.platform_top))
			level_root.add_child(ps)
	for c in level.coins:
		_add_coin(c, false)
	for e in level.enemies:
		var mo = Monster.new()
		var key: String = "monster_" + ("cyclops" if e.kind == "cyclops" else e.kind)
		mo.setup(self, e, tx[key], m.monsters[e.kind], glow)
		level_root.add_child(mo)
		monsters.append(mo)
	for i in level.checkpoints.size():
		if i == 0:
			continue
		var cp = Node2D.new()
		cp.position = level.checkpoints[i]
		cp.set_meta("active", false)
		cp.draw.connect(_draw_checkpoint.bind(cp))
		var cl = Sprite2D.new()
		cl.texture = glow
		cl.material = add_mat
		cl.position = Vector2(0, -44)
		cl.scale = Vector2.ONE * 0.5
		cl.modulate = Color(pal.moss.lightened(0.4), 0.35)
		cl.name = "Glow"
		cp.add_child(cl)
		level_root.add_child(cp)
		checkpoint_nodes.append(cp)
	_build_portal(level.portal)


func _add_coin(pos: Vector2, dropped: bool) -> void:
	var c = Node2D.new()
	c.position = pos
	c.z_index = 3
	var gl = Sprite2D.new()
	gl.texture = glow
	gl.material = add_mat
	gl.scale = Vector2.ONE * 0.42
	gl.modulate = Color(pal.ember, 0.75)
	c.add_child(gl)
	var sp = Sprite2D.new()
	sp.texture = tex[biome]["coin"]
	sp.scale = Vector2.ONE / tscale("coin")
	sp.name = "Face"
	c.add_child(sp)
	level_root.add_child(c)
	var v = Vector2(randf_range(-90, 90), randf_range(-330, -220)) if dropped else Vector2.ZERO
	coin_list.append({"node": c, "phase": randf() * TAU, "got": false, "vel": v, "dropped": dropped, "age": 0.0})


func _build_portal(p: Vector2) -> void:
	portal = Node2D.new()
	portal.position = p
	var disc = ColorRect.new()
	disc.size = Vector2(84, 116)
	disc.position = Vector2(-42, -124)
	var mat = ShaderMaterial.new()
	var sh: Shader = preload("res://shaders/portal.gdshader")
	mat.shader = sh
	mat.set_shader_parameter("c1", pal.moss.lightened(0.45))
	mat.set_shader_parameter("c2", pal.ember)
	disc.material = mat
	portal.add_child(disc)
	var gl = Sprite2D.new()
	gl.texture = glow
	gl.material = add_mat
	gl.position = Vector2(0, -66)
	gl.scale = Vector2(1.4, 1.8)
	gl.modulate = Color(pal.moss.lightened(0.4), 0.5)
	portal.add_child(gl)
	var lt = PointLight2D.new()
	lt.texture = glow
	lt.texture_scale = 4.0
	lt.color = pal.moss.lightened(0.4)
	lt.energy = 1.0
	lt.position = Vector2(0, -60)
	portal.add_child(lt)
	var motes = CPUParticles2D.new()
	motes.texture = glow
	motes.material = add_mat
	motes.amount = 24
	motes.lifetime = 1.6
	motes.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	motes.emission_rect_extents = Vector2(36, 6)
	motes.position = Vector2(0, -8)
	motes.direction = Vector2.UP
	motes.spread = 15.0
	motes.gravity = Vector2(0, -30)
	motes.initial_velocity_min = 20
	motes.initial_velocity_max = 50
	motes.scale_amount_min = 0.03
	motes.scale_amount_max = 0.07
	motes.color = pal.moss.lightened(0.5)
	portal.add_child(motes)
	var frame = Node2D.new()
	frame.draw.connect(func():
		var stone = pal.ink.lerp(pal.dusk, 0.55)
		for k in [-1.0, 1.0]:
			frame.draw_rect(Rect2(k * 50 - 7, -130, 14, 130), stone)
			frame.draw_rect(Rect2(k * 50 - 7, -130, 4 if k < 0 else 14, 130), stone.lightened(0.15))
			frame.draw_circle(Vector2(k * 50, -136), 8, pal.ember)
		frame.draw_arc(Vector2(0, -126), 52, PI, TAU, 24, stone, 10.0, true))
	portal.add_child(frame)
	level_root.add_child(portal)


# ---------------- frame ----------------
func _physics_process(dt: float) -> void:
	if transitioning:
		return
	t += dt
	var move = hud.move
	var jp = hud.jump_pressed
	var jh = hud.jump_held
	var fp = hud.fire_pressed
	if Input.is_action_pressed("left"):
		move = -1.0
	if Input.is_action_pressed("right"):
		move = 1.0
	if Input.is_action_just_pressed("jump"):
		jp = true
	if Input.is_action_pressed("jump"):
		jh = true
	if Input.is_action_just_pressed("fire"):
		fp = true
	if autoplay:
		var bot = _bot(dt)
		move = bot.move
		jp = bot.jump
		jh = bot.held
		fp = bot.fire
	hud.consume()
	if fp and player.fire_cd <= 0.0:
		player.fire_cd = 0.3
		var o = player.body_center() + Vector2(player.facing * 16.0, -4.0)
		projectiles.append({"kind": "spark", "pos": o, "vel": Vector2(player.facing * 440.0, 0), "life": 0.0, "trail": []})
		fx_burst(o, pal.moss.lightened(0.5), 6, 80.0, 0.25, 0.0, 0.05)
		hud.fire_flash = 1.0
	player.physics_step(dt, move, jp, jh)
	grass_mat.set_shader_parameter("hero", Vector3(player.position.x, player.position.y, 1.0 if player.on_ground else 0.0))
	_update_projectiles(dt)
	_update_coins(dt)
	_update_monsters_contact()
	_update_checkpoints()
	if player.position.y > 650.0:
		_hurt(player.position.x, true)
	if portal and player.position.distance_to(portal.position + Vector2(0, -20)) < 34.0:
		_next_stage()
	hud.progress = clampf((player.position.x - level.start_x) / (level.end_x - level.start_x), 0.0, 1.0)


func _process(dt: float) -> void:
	_update_camera(dt)
	_update_parallax()
	_update_fx(dt)
	hurt_pulse = maxf(hurt_pulse - dt * 1.8, 0.0)
	(post.material as ShaderMaterial).set_shader_parameter("hurt", hurt_pulse * 0.7)
	if Input.is_action_just_pressed("pause"):
		toggle_pause()


func _update_camera(dt: float) -> void:
	var target = player.position + Vector2(player.facing * 55.0, -120.0)
	var k = 1.0 - exp(-5.0 * dt)
	var ky = 1.0 - exp(-3.2 * dt)
	cam.position.x = lerpf(cam.position.x, target.x, k)
	cam.position.y = lerpf(cam.position.y, target.y, ky)
	shake_amt = maxf(shake_amt - dt * 30.0, 0.0)
	cam.offset = Vector2(randf_range(-1, 1), randf_range(-1, 1)) * shake_amt
	for p in [fireflies, pollen]:
		p.position = cam.position
	leaves.position = cam.position + Vector2(0, -view_h() * 0.5 - 20.0)


func _update_parallax() -> void:
	var vh = view_h()
	var cx = cam.position.x
	var cy = cam.position.y
	sky.scale = Vector2(VW / float(sky.texture.get_width()), vh / float(sky.texture.get_height()))
	stars.position.y = clampf(-cy * 0.02, -40.0, 60.0) - 20.0
	moon.position = Vector2(290, 150 + clampf(-cy * 0.03, -20.0, 40.0))
	for i in rays.size():
		var r = rays[i]
		var rs = tscale("ray")
		var w = 40.0 + (i % 3) * 30.0
		r.position = moon.position
		r.rotation = 0.32 + i * 0.13 + sin(t * 0.2 + i) * 0.02
		r.scale = Vector2(w / 60.0, 1.0) / rs
		r.offset = Vector2(-30.0 * rs, 0)
		r.modulate = Color(pal.moon, (0.05 + 0.035 * sin(t * 0.5 + i * 1.7)) * (1.0 if i % 2 else 0.7))
	for i in twinkles.size():
		twinkles[i].modulate.a = maxf(0.0, sin(t * (0.6 + i * 0.11) + i)) * 0.7
	for p in par:
		var s: Sprite2D = p.sprite
		var ts = tscale(p.name)
		var h: float = metas[biome].sizes[p.name][1]
		s.region_rect = Rect2((cx * p.fx + t * p.auto) * ts, 1.0, (VW + 4.0) * ts, h * ts - 2.0)
		s.position.x = -2.0
		if p.has("fg") and p.fy == 0.0:
			s.position.y = vh - h
		else:
			# every layer's horizon lines up with the world ground at the reference camera height,
			# then drifts by its own depth factor as the camera climbs or drops
			s.position.y = vh * 0.5 + 120.0 + (-120.0 - cy) * p.fy + p.top
			if p.has("fill"):
				p.fill.position = Vector2(-4.0, s.position.y + h - 3.0)
	# lantern lights ride the near-tree layer
	var near: Dictionary = par[4]
	var ln: Array = metas[biome].lanterns
	var tile: float = metas[biome].sizes.trees_near[0]
	var off = fmod(cx * near.fx, tile)
	var idx = 0
	for k in range(-1, 2):
		for l in ln:
			if idx >= lantern_sprites.size():
				break
			var ls = lantern_sprites[idx]
			idx += 1
			var x: float = l[0] - off + k * tile
			ls.visible = x > -60.0 and x < VW + 60.0
			ls.position = Vector2(x, near.sprite.position.y + l[1])
			var fl = 0.85 + 0.15 * sin(t * 13.0 + l[0]) * sin(t * 7.3 + l[1])
			ls.scale = Vector2.ONE * 0.72
			ls.modulate.a = 0.85 * fl
	for i in range(idx, lantern_sprites.size()):
		lantern_sprites[i].visible = false


func _update_projectiles(dt: float) -> void:
	var keep: Array = []
	for p in projectiles:
		p.life += dt
		p.pos += p.vel * dt
		if p.kind == "quill":
			p.vel.y += 160.0 * dt
		p.trail.push_front(p.pos)
		if p.trail.size() > 8:
			p.trail.pop_back()
		var alive = p.life < (0.9 if p.kind == "spark" else 2.0)
		if alive and _solid_at(p.pos):
			alive = false
			fx_burst(p.pos, pal.moss.lightened(0.4) if p.kind == "spark" else pal.dusk, 6, 70.0, 0.3, 100.0, 0.05)
		if alive and p.kind == "spark":
			for mo in monsters:
				if is_instance_valid(mo) and not mo.dead and p.pos.distance_to(mo.world_center()) < mo.radius + 4.0:
					mo.hit(1, p.pos.x - p.vel.x)
					hitstop(0.05)
					shake(3.0)
					fx_burst(p.pos, pal.moss.lightened(0.5), 12, 160.0, 0.35, 0.0, 0.06)
					fx_ring(p.pos, pal.moss.lightened(0.5), 22.0)
					alive = false
					break
		elif alive and p.kind == "quill":
			if p.pos.distance_to(player.body_center()) < 14.0:
				_hurt(p.pos.x)
				alive = false
		if alive:
			keep.append(p)
	projectiles = keep


func _update_coins(dt: float) -> void:
	var c = player.body_center()
	for cd in coin_list:
		if cd.got:
			continue
		var n: Node2D = cd.node
		cd.age += dt
		if cd.dropped:
			cd.vel.y += 900.0 * dt
			n.position += cd.vel * dt
			var gy = ground_below(n.position + Vector2(0, -12))
			if n.position.y > gy - 12.0:
				n.position.y = gy - 12.0
				cd.vel = Vector2(cd.vel.x * 0.5, -absf(cd.vel.y) * 0.35)
			if cd.age > 0.5 and n.position.distance_to(c) < 90.0:
				n.position = n.position.move_toward(c, 420.0 * dt)
		n.get_node("Face").scale.x = maxf(0.12, absf(cos(t * 4.0 + cd.phase))) / tscale("coin")
		n.position.y += sin(t * 3.0 + cd.phase) * 0.06
		if n.position.distance_to(c) < 20.0 and (not cd.dropped or cd.age > 0.35):
			cd.got = true
			_collect(n)


func _collect(n: Node2D) -> void:
	coins_total += 1
	hud.coins = coins_total
	hud.bump = 1.0
	fx_burst(n.position, pal.ember.lightened(0.3), 12, 150.0, 0.45, 60.0, 0.06)
	fx_ring(n.position, pal.ember.lightened(0.4), 24.0)
	float_text(n.position + Vector2(0, -8), "+1", Color(1, 0.94, 0.78))
	n.queue_free()


func _update_monsters_contact() -> void:
	var pc = player.body_center()
	for mo in monsters:
		if not is_instance_valid(mo) or mo.dead:
			continue
		var mc: Vector2 = mo.world_center()
		var d = pc.distance_to(mc)
		if d < mo.radius + 12.0:
			var stomp = player.vel.y > 60.0 and player.position.y < mc.y + 4.0
			if stomp:
				mo.hit(2, player.position.x)
				player.bounce()
				hitstop(0.07)
				shake(5.0)
				fx_ring(player.position, pal.moon, 30.0)
			else:
				_hurt(mc.x)


func _update_checkpoints() -> void:
	for cp in checkpoint_nodes:
		if not cp.get_meta("active") and absf(player.position.x - cp.position.x) < 20.0 and absf(player.position.y - cp.position.y) < 60.0:
			cp.set_meta("active", true)
			respawn = cp.position
			hearts = maxi(hearts, 3)
			hud.hearts = hearts
			var gl: Sprite2D = cp.get_node("Glow")
			gl.modulate = Color(pal.moss.lightened(0.5), 0.8)
			gl.scale = Vector2.ONE * 0.9
			var lt = PointLight2D.new()
			lt.texture = glow
			lt.texture_scale = 2.5
			lt.color = pal.moss.lightened(0.4)
			lt.position = Vector2(0, -44)
			cp.add_child(lt)
			fx_burst(cp.position + Vector2(0, -44), pal.moss.lightened(0.5), 24, 160.0, 0.7, -40.0, 0.07)
			float_text(cp.position + Vector2(0, -80), "Checkpoint", pal.moon)
			cp.queue_redraw()


func _hurt(from_x: float, fell: bool = false) -> void:
	if player.invuln > 0.0 and not fell:
		return
	hearts -= 1
	hud.hearts = maxi(hearts, 0)
	hurt_pulse = 1.0
	shake(9.0)
	hitstop(0.09)
	fx_burst(player.body_center(), pal.moon, 14, 140.0, 0.5, 120.0, 0.06)
	if hearts <= 0:
		hearts = 3
		hud.hearts = 3
		hud.show_title("Try again", "Back to the last checkpoint")
		player.position = respawn
		player.vel = Vector2.ZERO
		player.invuln = 1.5
		player.reset_scarf()
		return
	if fell:
		player.position = player.last_safe + Vector2(-24.0 * player.facing, 0)
		player.vel = Vector2.ZERO
		player.reset_scarf()
	else:
		player.vel = Vector2(signf(player.position.x - from_x) * 230.0, -330.0)
		player.on_ground = false
	player.invuln = 1.2


func _next_stage() -> void:
	transitioning = true
	fx_burst(player.body_center(), pal.moss.lightened(0.5), 40, 220.0, 0.9, -60.0, 0.08)
	var tw = create_tween()
	tw.tween_property(hud, "fade", 1.0, 0.6)
	tw.tween_callback(func(): start_stage(stage + 1))
	tw.tween_property(hud, "fade", 0.0, 0.6)
	tw.tween_callback(func(): transitioning = false)


func on_monster_killed(mo: Monster) -> void:
	var c = mo.world_center()
	var col = Color(mo.meta.body[0], mo.meta.body[1], mo.meta.body[2])
	fx_burst(c, col.lightened(0.4), 26, 200.0, 0.8, -30.0, 0.08)
	fx_burst(c, pal.ember.lightened(0.3), 10, 120.0, 0.6, 0.0, 0.05)
	fx_ring(c, col.lightened(0.5), 40.0)
	shake(6.0)
	for i in (4 if mo.elite else 2):
		_add_coin(c, true)


func shockwave(pos: Vector2, col: Color, power: int) -> void:
	fx_items.append({"type": "shock", "pos": pos, "life": 0.0, "max": 0.75, "col": col, "hit": false, "power": power})
	fx_dust(pos, 14, 120.0)
	shake(7.0)


func spawn_quill(pos: Vector2, vel: Vector2) -> void:
	projectiles.append({"kind": "quill", "pos": pos, "vel": vel, "life": 0.0, "trail": []})


func fire_beam(owner: Node2D, from: Vector2, dir: Vector2) -> void:
	fx_items.append({"type": "beam", "pos": from, "dir": dir, "life": 0.0, "max": 0.5, "hit": false})
	shake(4.0)


# ---------------- helpers ----------------
func _solid_at(p: Vector2) -> bool:
	for s in solids:
		if s.kind == "ground" and s.r.has_point(p):
			return true
	return false


func ground_below(p: Vector2) -> float:
	var best = 2000.0
	for s in solids:
		var r: Rect2 = s.r
		if p.x >= r.position.x and p.x <= r.end.x and r.position.y >= p.y - 2.0:
			best = minf(best, r.position.y)
	return best


func shake(a: float) -> void:
	shake_amt = maxf(shake_amt, a)


func hitstop(d: float) -> void:
	Engine.time_scale = 0.05
	await get_tree().create_timer(d, true, false, true).timeout
	Engine.time_scale = 1.0


func toggle_pause() -> void:
	var p = not get_tree().paused
	get_tree().paused = p
	hud.paused = p


func fx_burst(pos: Vector2, col: Color, amount: int = 16, speed: float = 120.0, life: float = 0.6, grav: float = 200.0, size: float = 0.07, additive: bool = true) -> void:
	var p = CPUParticles2D.new()
	p.texture = glow
	p.one_shot = true
	p.explosiveness = 1.0
	p.amount = amount
	p.lifetime = life
	p.direction = Vector2.UP
	p.spread = 180.0
	p.initial_velocity_min = speed * 0.35
	p.initial_velocity_max = speed
	p.gravity = Vector2(0, grav)
	p.damping_min = 30.0
	p.damping_max = 90.0
	p.scale_amount_min = size * 0.5
	p.scale_amount_max = size
	var g = Gradient.new()
	g.set_color(0, col)
	g.set_color(1, Color(col, 0.0))
	p.color_ramp = g
	if additive:
		p.material = add_mat
	p.position = pos
	p.z_index = 5
	world.add_child(p)
	p.emitting = true
	get_tree().create_timer(life + 0.3).timeout.connect(p.queue_free)


func fx_dust(pos: Vector2, n: int, spread: float) -> void:
	var p = CPUParticles2D.new()
	p.texture = glow
	p.one_shot = true
	p.explosiveness = 0.9
	p.amount = n
	p.lifetime = 0.6
	p.direction = Vector2.UP
	p.spread = 80.0
	p.initial_velocity_min = spread * 0.3
	p.initial_velocity_max = spread
	p.gravity = Vector2(0, -20)
	p.damping_min = 60.0
	p.damping_max = 120.0
	p.scale_amount_min = 0.06
	p.scale_amount_max = 0.13
	var c = pal.dusk.lerp(pal.moon, 0.45)
	var g = Gradient.new()
	g.set_color(0, Color(c, 0.5))
	g.set_color(1, Color(c, 0.0))
	p.color_ramp = g
	p.position = pos + Vector2(0, -3)
	p.z_index = 3
	world.add_child(p)
	p.emitting = true
	get_tree().create_timer(0.9).timeout.connect(p.queue_free)


func fx_ring(pos: Vector2, col: Color, r: float) -> void:
	fx_items.append({"type": "ring", "pos": pos, "col": col, "r": r, "life": 0.0, "max": 0.4})


func float_text(pos: Vector2, s: String, col: Color) -> void:
	fx_items.append({"type": "text", "pos": pos, "text": s, "col": col, "life": 0.0, "max": 0.8})


func _update_fx(dt: float) -> void:
	var keep: Array = []
	for f in fx_items:
		f.life += dt
		if f.type == "shock" and not f.hit:
			var r = 30.0 + f.life * 300.0
			var dx = absf(player.position.x - f.pos.x)
			if player.on_ground and absf(player.position.y - f.pos.y) < 6.0 and absf(dx - r) < 16.0:
				f.hit = true
				_hurt(f.pos.x)
		elif f.type == "beam" and not f.hit and f.life < 0.35:
			var rel = player.body_center() - f.pos
			var along = rel.dot(f.dir)
			if along > 0.0 and along < 520.0 and absf(rel.cross(f.dir)) < 11.0:
				f.hit = true
				_hurt(f.pos.x)
		if f.life < f.max:
			keep.append(f)
	fx_items = keep
	fx_norm.queue_redraw()
	fx_add.queue_redraw()


func _draw_fx(additive: bool) -> void:
	var node = fx_add if additive else fx_norm
	var font = ThemeDB.fallback_font
	for f in fx_items:
		var k: float = f.life / f.max
		match f.type:
			"ring":
				if additive:
					node.draw_arc(f.pos, 6.0 + k * f.r, 0, TAU, 32, Color(f.col, 0.9 * (1.0 - k)), 2.5 * (1.0 - k) + 0.6, true)
			"text":
				if not additive:
					var sc = 1.0 + sin(minf(1.0, k * 4.0) * PI) * 0.35
					node.draw_set_transform(f.pos + Vector2(0, -k * 26.0), 0.0, Vector2(sc, sc) * 0.5)
					node.draw_string_outline(font, Vector2(-150, 0), f.text, HORIZONTAL_ALIGNMENT_CENTER, 300, 28, 6, Color(pal.ink, 0.8 * (1.0 - k * k)))
					node.draw_string(font, Vector2(-150, 0), f.text, HORIZONTAL_ALIGNMENT_CENTER, 300, 28, Color(f.col, 1.0 - k * k))
					node.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
			"shock":
				var r = 30.0 + f.life * 300.0
				var a = 1.0 - k
				if additive:
					for side in [-1.0, 1.0]:
						var x: float = f.pos.x + side * r
						node.draw_texture_rect(glow, Rect2(x - 26, f.pos.y - 34, 52, 40), false, Color(f.col, 0.8 * a))
						node.draw_line(Vector2(x, f.pos.y), Vector2(x - side * 30.0, f.pos.y), Color(f.col.lightened(0.4), a), 3.0, true)
				else:
					node.draw_arc(f.pos + Vector2(0, 6), r, PI * 1.05, PI * 1.95, 24, Color(pal.ink, 0.35 * a), 4.0, true)
			"beam":
				var end: Vector2 = f.pos + f.dir * 520.0
				var w = (1.0 - k) * (12.0 if f.life < 0.35 else 4.0)
				if additive:
					var bc: Color = pal.moss.lightened(0.45)
					node.draw_line(f.pos, end, Color(bc, 0.35 * (1.0 - k)), w * 2.4, true)
					node.draw_line(f.pos, end, Color(bc, 0.9 * (1.0 - k)), w, true)
					node.draw_line(f.pos, end, Color(1, 1, 1, 1.0 - k), w * 0.35, true)
					node.draw_texture_rect(glow, Rect2(f.pos - Vector2(30, 30), Vector2(60, 60)), false, Color(bc, 1.0 - k))
	for p in projectiles:
		if p.kind == "spark" and additive:
			var tr: Array = p.trail
			for i in range(tr.size() - 1):
				var a2 = 1.0 - float(i) / tr.size()
				node.draw_line(tr[i], tr[i + 1], Color(pal.moss.lightened(0.5), a2 * 0.8), 5.0 * a2, true)
			node.draw_texture_rect(glow, Rect2(p.pos - Vector2(18, 18), Vector2(36, 36)), false, pal.moss.lightened(0.5))
			node.draw_circle(p.pos, 3.0, Color(1, 1, 1))
		elif p.kind == "quill":
			if additive:
				node.draw_texture_rect(glow, Rect2(p.pos - Vector2(10, 10), Vector2(20, 20)), false, Color(pal.dusk.lightened(0.4), 0.6))
			else:
				var d: Vector2 = p.vel.normalized()
				var tail: Vector2 = p.pos - d * 12.0
				var nrm = d.orthogonal() * 2.2
				node.draw_colored_polygon(PackedVector2Array([p.pos + d * 4.0, tail + nrm, tail - nrm]), pal.dusk.lightened(0.15))
				node.draw_line(tail, p.pos + d * 4.0, pal.moon.lerp(pal.dusk, 0.3), 0.8, true)


func _draw_edge(n: Node2D, r: Rect2) -> void:
	# cliff faces where a ground segment has open air beside it
	var left_open = true
	var right_open = true
	for s in solids:
		if s.kind != "ground":
			continue
		var o: Rect2 = s.r
		if absf(o.end.x - r.position.x) < 1.0 and o.position.y <= r.position.y + 1.0:
			left_open = false
		if absf(o.position.x - r.end.x) < 1.0 and o.position.y <= r.position.y + 1.0:
			right_open = false
	var dark = pal.ink.darkened(0.35)
	var moss = pal.moss.lerp(pal.ink, 0.35)
	for side in [-1.0, 1.0]:
		var open = left_open if side < 0.0 else right_open
		if not open:
			continue
		var x = r.position.x if side < 0.0 else r.end.x
		var face = PackedVector2Array([Vector2(x, r.position.y + 2), Vector2(x - side * 10.0, r.position.y + 2), Vector2(x - side * 10.0, r.position.y + 400), Vector2(x, r.position.y + 400)])
		n.draw_polygon(face, PackedColorArray([Color(dark, 0.85), Color(dark, 0.0), Color(dark, 0.0), Color(dark, 0.4)]))
		var rimc = Color(pal.moon, 0.45) if side > 0.0 else Color(pal.moon, 0.18)
		n.draw_line(Vector2(x, r.position.y + 2), Vector2(x, r.position.y + 90), rimc, 1.5, true)
		var cap = PackedVector2Array()
		for i in 9:
			var a = PI * i / 8.0
			cap.append(Vector2(x + side * sin(a) * 7.0 - side * 2.0, r.position.y + 2.0 - cos(a) * 5.0 + 3.0))
		n.draw_colored_polygon(cap, moss)
		for i in 4:
			n.draw_line(Vector2(x + side * (2.0 - i * 2.0), r.position.y + 4), Vector2(x + side * (3.0 - i * 2.5), r.position.y + 16.0 + i * 5.0), moss.darkened(0.2), 1.2, true)


func _draw_checkpoint(cp: Node2D) -> void:
	var active: bool = cp.get_meta("active")
	var stone = pal.ink.lerp(pal.dusk, 0.5)
	cp.draw_colored_polygon(PackedVector2Array([Vector2(-9, 0), Vector2(-7, -34), Vector2(7, -34), Vector2(9, 0)]), stone)
	cp.draw_colored_polygon(PackedVector2Array([Vector2(3, 0), Vector2(4, -34), Vector2(7, -34), Vector2(9, 0)]), stone.lightened(0.15))
	var cc = pal.moss.lightened(0.5) if active else pal.moss.darkened(0.2)
	cp.draw_colored_polygon(PackedVector2Array([Vector2(0, -60), Vector2(7, -46), Vector2(0, -36), Vector2(-7, -46)]), cc)
	cp.draw_line(Vector2(0, -60), Vector2(0, -36), Color(1, 1, 1, 0.6 if active else 0.25), 1.0, true)


# ---------------- autoplay bot (for demos and automated checks) ----------------
func _bot(dt: float) -> Dictionary:
	var out = {"move": 1.0, "jump": false, "held": true, "fire": false}
	var p = player.position
	if absf(p.x - bot_last_x) < 0.5:
		bot_stuck += dt
	else:
		bot_stuck = 0.0
	bot_last_x = p.x
	for mo in monsters:
		if is_instance_valid(mo) and not mo.dead:
			var d: Vector2 = mo.world_center() - player.body_center()
			if d.x > 0.0 and d.x < 240.0 and absf(d.y) < 90.0 and player.fire_cd <= 0.0:
				out.fire = true
			if d.x > 0.0 and d.x < 70.0 and absf(d.y) < 40.0 and player.on_ground:
				out.jump = true
	if player.on_ground:
		var ahead = ground_below(p + Vector2(26, -4))
		if ahead > p.y + 30.0:
			out.jump = true
		if _solid_at(p + Vector2(18, -10)):
			out.jump = true
		for s in solids:
			var r: Rect2 = s.r
			if s.kind == "plat" and r.position.x > p.x - 10.0 and r.position.x < p.x + 90.0 and r.position.y < p.y - 30.0 and r.position.y > p.y - 130.0:
				out.jump = true
	elif player.vel.y > 80.0 and player.air_jumps > 0:
		if ground_below(p + Vector2(40, 0)) > p.y + 140.0:
			out.jump = true
	if bot_stuck > 0.8:
		out.jump = true
		out.move = -1.0 if fmod(t, 1.0) < 0.3 else 1.0
	if bot_stuck > 3.0:
		for s in solids:
			if s.r.position.x > p.x + 20.0:
				player.position = Vector2(s.r.position.x + 20.0, s.r.position.y)
				player.vel = Vector2.ZERO
				bot_stuck = 0.0
				break
	return out


# ---------------- save ----------------
func _load_save() -> void:
	var cf = ConfigFile.new()
	if cf.load(SAVE_PATH) == OK:
		coins_total = cf.get_value("progress", "coins", 0)


func _save() -> void:
	var cf = ConfigFile.new()
	cf.set_value("progress", "coins", coins_total)
	cf.set_value("progress", "best_stage", stage)
	cf.save(SAVE_PATH)
