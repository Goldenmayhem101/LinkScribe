extends Node2D
## Gloamwood: game orchestrator.
## Layers (back to front): sky -> parallax backdrop -> world (lit) -> foreground -> post FX -> HUD -> menus.
## Modes: "attract" (bot plays behind the title menu, nothing is recorded) and "play".
## Command-line (after --): --autoplay (bot demo, nothing saved), --botplay[=continue] (bot plays a real, saved run),
##   --stage=N, --menu=<screen>, --hero=<id>

const VW := 400.0
const ZOOM := 720.0 / 400.0
const UI_FONT := preload("res://assets/fonts/DejaVuSans-Bold.ttf")
const COMBO_WINDOW := 2.6

var player: Player
var hud: Hud
var menu: Menu
var cam: Camera2D
var gen = LevelGen.new()
var level: Dictionary = {}
var solids: Array = []
var pal: Dictionary = {}
var biome := ""
var stage := 1
var run_seed := 1
var hearts := 3
var max_hearts := 3
var respawn = Vector2.ZERO
var autoplay := false
var playing := false
var t := 0.0
var shake_amt := 0.0
var hurt_pulse := 0.0
var transitioning := false
var args := {}

# per-stage tracking (also saved for resume)
var got_coins: Array = []
var killed: Array = []
var opened: Array = []
var st_time := 0.0
var st_kills := 0
var st_coins := 0
var st_damage := 0
var st_combo := 0
var combo := 0
var combo_t := 0.0
var coin_frac := 0.0
var charge_t := 0.0
var dash_hits: Array = []
var boss_node: Monster = null
var boss_awake := false
var portal_locked := false

var tex: Dictionary = {}
var metas: Dictionary = {}
var glow: Texture2D
var leaf_tex: Texture2D

var sky: Sprite2D
var stars: Sprite2D
var moon: Sprite2D
var rays: Array[Sprite2D] = []
var twinkles: Array[Sprite2D] = []
var par: Array = []
var lantern_sprites: Array[Sprite2D] = []
var post: ColorRect
var tint_rect: TextureRect
var canvas_mod: CanvasModulate
var bg_root: Node2D
var fg_root: Node2D
var sky_root: Node2D

var world: Node2D
var level_root: Node2D
var fx_norm: Node2D
var fx_add: Node2D
var fx_items: Array = []
var projectiles: Array = []
var coin_list: Array = []
var monsters: Array = []
var checkpoint_nodes: Array = []
var chest_nodes: Array = []
var bouncer_nodes: Array = []
var portal: Node2D
var grass_mat: ShaderMaterial
var fireflies: CPUParticles2D
var pollen: CPUParticles2D
var leaves: CPUParticles2D
var add_mat: CanvasItemMaterial

var bot_last_x := 0.0
var bot_stuck := 0.0


func _ready() -> void:
	randomize()
	for a in OS.get_cmdline_user_args():
		var kv = a.trim_prefix("--").split("=")
		args[kv[0]] = kv[1] if kv.size() > 1 else "1"
	autoplay = args.has("autoplay")
	get_tree().auto_accept_quit = false
	_setup_input()
	add_mat = CanvasItemMaterial.new()
	add_mat.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	for b in LevelGen.BIOMES:
		_load_biome(b)
	glow = tex["gloamwood"]["glow"]
	leaf_tex = _make_leaf()
	_build_layers()
	_build_world()
	_build_ui()
	if args.has("hero"):
		Profile.data.hero = args.hero
	if autoplay:
		playing = true
		run_seed = 4242
		start_stage(int(args.get("stage", "1")))
		menu.show_screen("")
	else:
		if args.has("menu"):
			menu.daily_shown = args.menu != "daily"
		_start_attract()
		if args.has("menu"):
			menu.show_screen(args.menu)
		if args.has("botplay"):
			menu_play(args.botplay == "continue")
	apply_settings()


func _setup_input() -> void:
	var map = {
		"left": [KEY_LEFT, KEY_A], "right": [KEY_RIGHT, KEY_D],
		"jump": [KEY_SPACE, KEY_UP, KEY_W], "fire": [KEY_J, KEY_X, KEY_K], "dash": [KEY_L, KEY_SHIFT, KEY_C], "pause": [KEY_ESCAPE, KEY_P],
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
			"fog0", "fog1", "fog2", "monster_brute", "monster_spike", "monster_cyclops", "monster_charger", "monster_burrower", "monster_titan", "grass", "glow", "coin"]:
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
			img.set_pixel(x, y, (Color(1, 1, 1, 0.95) if absf(v) >= 0.15 else Color(0.7, 0.7, 0.7, 0.9)) if inside else Color(0, 0, 0, 0))
	return ImageTexture.create_from_image(img)


func view_h() -> float:
	return get_viewport_rect().size.y / ZOOM


func tscale(name: String) -> float:
	return float(tex[biome][name].get_width()) / float(metas[biome].sizes[name][0])


func rec(ev: String, n: int = 1) -> void:
	if playing and not autoplay:
		Profile.event(ev, n)


func buzz(ms: int) -> void:
	if playing and Profile.setting("vibration"):
		Input.vibrate_handheld(ms)


# ---------------- construction ----------------
func _canvas(layer_no: int) -> Node2D:
	var cl = CanvasLayer.new()
	cl.layer = layer_no
	add_child(cl)
	var root = Node2D.new()
	root.scale = Vector2(ZOOM, ZOOM)
	cl.add_child(root)
	return root


func _region_sprite(parent: Node) -> Sprite2D:
	var s = Sprite2D.new()
	s.centered = false
	s.region_enabled = true
	s.texture_repeat = CanvasItem.TEXTURE_REPEAT_ENABLED
	parent.add_child(s)
	return s


func _build_layers() -> void:
	sky_root = _canvas(-20)
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
	bg_root = _canvas(-10)
	var specs = [
		["mountains", 0.08, 0.12, -330.0, 2.0, 1.0], ["fog0", 0.12, 0.2, -200.0, 5.0, 0.55],
		["trees_mid", 0.3, 0.35, -565.0, 0.0, 1.0], ["fog1", 0.42, 0.5, -150.0, 9.0, 0.5],
		["trees_near", 0.62, 0.7, -565.0, 0.0, 1.0], ["fog2", 0.7, 0.75, -110.0, 14.0, 0.42],
	]
	for sp in specs:
		var s = _region_sprite(bg_root)
		s.modulate.a = sp[5]
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
	fg_root = _canvas(5)
	for sp in [["fog1", 1.1, 1.0, -70.0, 20.0, 0.3], ["foreground", 1.35, 0.0, 0.0, 0.0, 1.0]]:
		var s2 = _region_sprite(fg_root)
		s2.modulate.a = sp[5]
		par.append({"sprite": s2, "name": sp[0], "fx": sp[1], "fy": sp[2], "top": sp[3], "auto": sp[4], "fg": true})
	var post_layer = CanvasLayer.new()
	post_layer.layer = 8
	add_child(post_layer)
	tint_rect = TextureRect.new()
	tint_rect.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	tint_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	tint_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	tint_rect.stretch_mode = TextureRect.STRETCH_SCALE
	var mul = CanvasItemMaterial.new()
	mul.blend_mode = CanvasItemMaterial.BLEND_MODE_MUL
	tint_rect.material = mul
	post_layer.add_child(tint_rect)
	post = ColorRect.new()
	post.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
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


func _build_ui() -> void:
	var hl = CanvasLayer.new()
	hl.layer = 10
	add_child(hl)
	hud = Hud.new()
	hud.main = self
	hud.autoplay = autoplay
	hl.add_child(hud)
	var ml = CanvasLayer.new()
	ml.layer = 20
	add_child(ml)
	menu = Menu.new()
	menu.main = self
	ml.add_child(menu)


func apply_settings() -> void:
	var q = int(Profile.setting("quality"))
	fireflies.amount = 34 if q == 1 else 14
	pollen.visible = q == 1
	leaves.visible = q == 1
	(post.material as ShaderMaterial).set_shader_parameter("grain", 0.05 if q == 1 else 0.0)
	Sfx.apply_volumes()


func apply_upgrades() -> void:
	var h = Profile.hero_def()
	player.apply_hero(h)
	max_hearts = int(h.hearts) + Profile.upgrade_level("hearts")
	hearts = mini(hearts, max_hearts)
	hud.max_hearts = max_hearts
	hud.hearts = hearts


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
		s.scale = Vector2.ONE / tscale(p.name)
		if p.has("fill"):
			var img: Image = tx[p.name].get_image()
			if img.is_compressed():
				img.decompress()
			var bc = Color(0, 0, 0, 0)
			for i in 8:
				bc += img.get_pixel(int(img.get_width() * (i + 0.5) / 8.0), img.get_height() - 3)
			bc /= 8.0
			var base = Color(bc.r, bc.g, bc.b, 1.0).lerp(pal.ink, 0.35)
			var fgr = Gradient.new()
			fgr.set_color(0, Color(base, minf(bc.a * 1.4, 1.0)))
			fgr.set_color(1, Color(pal.ink.darkened(0.5), 1.0))
			fgr.add_point(0.25, Color(base.lerp(pal.ink, 0.6), 1.0))
			var gtx = GradientTexture2D.new()
			gtx.gradient = fgr
			gtx.fill_to = Vector2(0, 1)
			gtx.width = 4
			gtx.height = 128
			p.fill.texture = gtx
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
	menu.set_palette(pal)


# ---------------- modes ----------------
func _start_attract() -> void:
	playing = false
	get_tree().paused = false
	hud.visible_controls = false
	hud.visible = false
	hud.autoplay = false
	run_seed = randi() % 100000
	Profile.data.hero = Profile.data.hero
	start_stage(1 + randi() % 4)
	menu.show_screen("title")
	Sfx.music("menu")


func menu_play(cont: bool) -> void:
	playing = true
	get_tree().paused = false
	hud.visible = true
	hud.visible_controls = true
	hud.reset_input()
	if cont and Profile.run_active():
		var r: Dictionary = Profile.data.run
		run_seed = int(r.run_seed)
		Profile.data.hero = r.get("hero", Profile.data.hero)
		start_stage(int(r.stage), r)
	else:
		Profile.end_run()
		Profile.data.stats.runs = int(Profile.data.stats.runs) + 1
		run_seed = randi() % 1000000
		start_stage(1)
	menu.show_screen("")


func menu_quit() -> void:
	if playing:
		save_snapshot()
	_start_attract()


func menu_next() -> void:
	get_tree().paused = false
	menu.show_screen("")
	hud.reset_input()
	start_stage(stage + 1)


func menu_retry() -> void:
	get_tree().paused = false
	menu.show_screen("")
	hud.reset_input()
	hearts = max_hearts
	hud.hearts = hearts
	player.position = respawn
	player.vel = Vector2.ZERO
	player.invuln = 1.5
	player.reset_scarf()
	save_snapshot()


func toggle_pause() -> void:
	if not playing or autoplay:
		return
	var p = not get_tree().paused
	get_tree().paused = p
	hud.reset_input()
	if p:
		save_snapshot()
		menu.show_screen("pause")
	else:
		menu.show_screen("")


func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_CLOSE_REQUEST or what == NOTIFICATION_APPLICATION_PAUSED or what == NOTIFICATION_APPLICATION_FOCUS_OUT:
		if playing and not autoplay and not transitioning:
			save_snapshot()
			if what != NOTIFICATION_WM_CLOSE_REQUEST and not get_tree().paused:
				toggle_pause()
		Profile.save()
		if what == NOTIFICATION_WM_CLOSE_REQUEST:
			get_tree().quit()


func save_snapshot() -> void:
	if not playing or autoplay:
		return
	Profile.save_run({
		"stage": stage, "run_seed": run_seed, "hero": Profile.data.hero,
		"pos": [player.last_safe.x, player.last_safe.y], "cp": [respawn.x, respawn.y],
		"hearts": hearts, "got": got_coins, "killed": killed, "opened": opened,
		"time": st_time, "kills": st_kills, "coins": st_coins, "damage": st_damage, "combo": st_combo,
		"boss_dead": boss_node == null and LevelGen.is_boss_stage(stage) and boss_awake,
	})


# ---------------- stage lifecycle ----------------
func start_stage(n: int, resume: Dictionary = {}) -> void:
	stage = n
	for c in level_root.get_children():
		c.queue_free()
	coin_list.clear()
	monsters.clear()
	checkpoint_nodes.clear()
	chest_nodes.clear()
	bouncer_nodes.clear()
	projectiles.clear()
	fx_items.clear()
	boss_node = null
	boss_awake = false
	hud.boss_k = -1.0
	combo = 0
	combo_t = 0.0
	var b = LevelGen.biome_for(n)
	if b != biome or pal.is_empty():
		_apply_biome(b)
	var luck = Profile.upgrade_level("luck")
	level = gen.generate(n, LevelGen.seed_for(n, run_seed), {"difficulty": int(Profile.setting("difficulty")), "luck": luck})
	solids = level.solids
	got_coins = resume.get("got", []).duplicate()
	killed = resume.get("killed", []).duplicate()
	opened = resume.get("opened", []).duplicate()
	st_time = float(resume.get("time", 0.0))
	st_kills = int(resume.get("kills", 0))
	st_coins = int(resume.get("coins", 0))
	st_damage = int(resume.get("damage", 0))
	st_combo = int(resume.get("combo", 0))
	apply_upgrades()
	_build_level(resume)
	respawn = level.checkpoints[0]
	if resume.has("cp"):
		respawn = Vector2(resume.cp[0], resume.cp[1])
	player.position = Vector2(resume.pos[0], resume.pos[1]) if resume.has("pos") else respawn
	player.vel = Vector2.ZERO
	player.last_safe = player.position
	player.reset_scarf()
	hearts = int(resume.get("hearts", max_hearts)) if not resume.is_empty() else max_hearts
	hud.hearts = hearts
	hud.coins = int(Profile.data.coins)
	cam.position = player.position + Vector2(0, -110)
	var world_no = int((n - 1) / 2) + 1
	hud.stage_label = "%s  %d-%d   ·   Stage %d" % [LevelGen.BIOME_NAMES[biome], world_no, (n - 1) % 2 + 1, n]
	if playing or autoplay:
		hud.show_title(LevelGen.BIOME_NAMES[biome], ("BOSS STAGE  ·  " if LevelGen.is_boss_stage(n) else "") + "Stage %d" % n)
		Sfx.music(biome)
		Sfx.play("portal", 0.8, 0.0, -6.0)
	print("Stage %d (%s) solids=%d coins=%d enemies=%d chests=%d boss=%s helpers=%d" % [n, biome, solids.size(), level.coins.size(), level.enemies.size(), level.chests.size(), str(not level.boss.is_empty()), level.helpers])
	if playing and not autoplay:
		save_snapshot()


func _build_level(resume: Dictionary) -> void:
	var tx: Dictionary = tex[biome]
	var gts = tscale("ground")
	var m: Dictionary = metas[biome]
	var y0: float = m.ground_tile_y0
	var gh: float = m.sizes.ground[1]
	var sg = Gradient.new()
	sg.set_color(0, pal.ink.darkened(0.3))
	sg.set_color(1, pal.ink.darkened(0.75))
	var soil_tex = GradientTexture2D.new()
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
			var gs = _region_sprite(level_root)
			gs.texture = tx["ground"]
			gs.region_rect = Rect2(r.position.x * gts, 1.0, r.size.x * gts, gh * gts - 2.0)
			gs.scale = Vector2.ONE / gts
			gs.position = Vector2(r.position.x, r.position.y - y0)
			var edge = Node2D.new()
			edge.draw.connect(_draw_edge.bind(edge, r))
			level_root.add_child(edge)
			var grs = tscale("grass")
			var grass = _region_sprite(level_root)
			grass.texture = tx["grass"]
			grass.region_rect = Rect2(r.position.x * grs, 1.0, r.size.x * grs, 40.0 * grs - 2.0)
			grass.scale = Vector2.ONE / grs
			grass.position = Vector2(r.position.x, r.position.y - 38.0)
			grass.material = grass_mat
			grass.z_index = 2
		else:
			var ps = Sprite2D.new()
			var pts = tscale("platform")
			ps.texture = tx["platform"]
			ps.centered = false
			ps.scale = Vector2(r.size.x / 130.0, 1.0) / pts
			ps.offset = Vector2(0, 0)
			var holder = Node2D.new()
			holder.position = Vector2(r.position.x, r.position.y - float(m.platform_top))
			holder.add_child(ps)
			if s.kind == "move":
				var gl = Sprite2D.new()
				gl.texture = glow
				gl.material = add_mat
				gl.position = Vector2(r.size.x * 0.5, float(m.platform_top) + 18.0)
				gl.scale = Vector2(0.9, 0.25)
				gl.modulate = Color(pal.moss.lightened(0.4), 0.6)
				holder.add_child(gl)
			elif s.kind == "crumble":
				ps.modulate = Color(1.0, 0.85, 0.75)
				var cracks = Node2D.new()
				var w = r.size.x
				cracks.draw.connect(func():
					for i in 3:
						var x0 = w * (0.25 + i * 0.25)
						cracks.draw_polyline(PackedVector2Array([Vector2(x0, float(m.platform_top) + 2), Vector2(x0 + 4, float(m.platform_top) + 9), Vector2(x0 - 2, float(m.platform_top) + 16)]), Color(pal.ink, 0.8), 1.5, true))
				holder.add_child(cracks)
			level_root.add_child(holder)
			s["node"] = holder
	for i in level.coins.size():
		if not got_coins.has(i):
			_add_coin(level.coins[i], false, i)
	for i in level.enemies.size():
		if killed.has(i):
			continue
		var e = level.enemies[i].duplicate()
		e["index"] = i
		spawn_monster(e)
	for i in level.checkpoints.size():
		if i == 0:
			continue
		var cp = Node2D.new()
		cp.position = level.checkpoints[i]
		var active = resume.has("cp") and Vector2(resume.cp[0], resume.cp[1]).distance_to(cp.position) < 1.0
		cp.set_meta("active", active)
		cp.draw.connect(_draw_checkpoint.bind(cp))
		var cl = Sprite2D.new()
		cl.texture = glow
		cl.material = add_mat
		cl.position = Vector2(0, -44)
		cl.scale = Vector2.ONE * (0.9 if active else 0.5)
		cl.modulate = Color(pal.moss.lightened(0.4), 0.8 if active else 0.35)
		cl.name = "Glow"
		cp.add_child(cl)
		level_root.add_child(cp)
		checkpoint_nodes.append(cp)
	for h in level.hazards:
		var hz = Node2D.new()
		hz.position = h.position
		hz.draw.connect(_draw_thorns.bind(hz, h.size))
		hz.z_index = 3
		level_root.add_child(hz)
	for bp in level.bouncers:
		var bn = Node2D.new()
		bn.position = bp
		bn.set_meta("squish", 0.0)
		bn.draw.connect(_draw_bouncer.bind(bn))
		bn.z_index = 3
		var bl = Sprite2D.new()
		bl.texture = glow
		bl.material = add_mat
		bl.position = Vector2(0, -12)
		bl.scale = Vector2(0.5, 0.35)
		bl.modulate = Color(pal.moss.lightened(0.5), 0.6)
		bn.add_child(bl)
		level_root.add_child(bn)
		bouncer_nodes.append(bn)
	for i in level.chests.size():
		var cn = Node2D.new()
		cn.position = level.chests[i]
		cn.set_meta("open", opened.has(i))
		cn.set_meta("idx", i)
		cn.set_meta("lid", 1.0 if opened.has(i) else 0.0)
		cn.draw.connect(_draw_chest.bind(cn))
		cn.z_index = 3
		var cg = Sprite2D.new()
		cg.texture = glow
		cg.material = add_mat
		cg.position = Vector2(0, -12)
		cg.scale = Vector2.ONE * 0.45
		cg.modulate = Color(pal.ember, 0.0 if opened.has(i) else 0.5)
		cg.name = "Glow"
		cn.add_child(cg)
		level_root.add_child(cn)
		chest_nodes.append(cn)
	_build_portal(level.portal)
	portal_locked = not level.boss.is_empty()
	if portal_locked:
		if resume.get("boss_dead", false):
			portal_locked = false
		else:
			var bd = {"kind": "titan", "pos": level.boss.pos, "min": level.boss.min, "max": level.boss.max, "hp": level.boss.hp}
			boss_node = spawn_monster(bd)
			boss_node.set_process(false)
	portal.visible = not portal_locked


func spawn_monster(e: Dictionary) -> Monster:
	var mo = Monster.new()
	var k: String = e.kind
	var meta_key = k
	var texture: Texture2D = null
	if k in ["brute", "spike", "cyclops", "charger", "burrower", "titan"]:
		texture = tex[biome]["monster_" + k]
	var md: Dictionary = metas[biome].monsters.get(meta_key, {})
	mo.setup(self, e, texture, md, glow)
	level_root.add_child(mo)
	monsters.append(mo)
	return mo


func _add_coin(pos: Vector2, dropped: bool, idx: int = -1) -> void:
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
	var v = Vector2(randf_range(-110, 110), randf_range(-360, -220)) if dropped else Vector2.ZERO
	coin_list.append({"node": c, "phase": randf() * TAU, "got": false, "vel": v, "dropped": dropped, "age": 0.0, "idx": idx})


func _build_portal(p: Vector2) -> void:
	portal = Node2D.new()
	portal.position = p
	var disc = ColorRect.new()
	disc.size = Vector2(84, 116)
	disc.position = Vector2(-42, -124)
	var mat = ShaderMaterial.new()
	mat.shader = preload("res://shaders/portal.gdshader")
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
	st_time += dt
	var move = hud.move
	var jp = hud.jump_pressed
	var jh = hud.jump_held
	var fp = hud.fire_pressed
	var fh = hud.fire_held
	var fr = hud.fire_released
	var dp = hud.dash_pressed
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
	if Input.is_action_pressed("fire"):
		fh = true
	if Input.is_action_just_released("fire"):
		fr = true
	if Input.is_action_just_pressed("dash"):
		dp = true
	if autoplay or not playing or args.has("botplay"):
		var bot = _bot(dt)
		move = bot.move
		jp = bot.jump
		jh = bot.held
		fp = bot.fire
		fh = false
		fr = false
		dp = bot.dash
	hud.consume()
	# sparks: tap fires, holding charges a big shot released on let-go
	if fp and player.fire_cd <= 0.0:
		_fire(false)
	if fh:
		charge_t += dt
		if charge_t > 0.2:
			if player.charge <= 0.0:
				Sfx.play("charge", 1.0, 0.0, -6.0)
			player.charge = minf((charge_t - 0.2) / 0.75, 1.0)
	if fr or not fh:
		if player.charge >= 1.0:
			_fire(true)
		player.charge = 0.0
		charge_t = 0.0
	hud.charge = player.charge
	if dp and player.try_dash():
		dash_hits.clear()
		hud.dash_flash = 1.0
		rec("dash")
	hud.dash_ready = 1.0 - player.dash_cd / maxf(player.dash_cd_max, 0.01)
	_update_platforms(dt)
	player.physics_step(dt, move, jp, jh)
	grass_mat.set_shader_parameter("hero", Vector3(player.position.x, player.position.y, 1.0 if player.on_ground else 0.0))
	_update_projectiles(dt)
	_update_coins(dt)
	_update_monsters_contact()
	_update_checkpoints()
	_update_props(dt)
	_update_boss()
	combo_t -= dt
	if combo > 0 and combo_t <= 0.0:
		combo = 0
	hud.combo = combo
	hud.combo_k = clampf(combo_t / COMBO_WINDOW, 0.0, 1.0)
	hud.combo_mult = combo_mult()
	if player.position.y > 650.0:
		_hurt(player.position.x, true)
	if portal and not portal_locked and player.position.distance_to(portal.position + Vector2(0, -20)) < 34.0:
		_stage_clear()
	hud.progress = clampf((player.position.x - level.start_x) / (level.end_x - level.start_x), 0.0, 1.0)


func _fire(big: bool) -> void:
	var sp_lv = Profile.upgrade_level("spark")
	player.fire_cd = 0.3 - Profile.upgrade_level("rapid") * 0.05
	var o = player.body_center() + Vector2(player.facing * 16.0, -4.0)
	var dir = Vector2(player.facing, 0)
	var kind: String = player.hero.get("spark", "single") if not player.hero.is_empty() else "single"
	if big:
		projectiles.append({"kind": "big", "pos": o, "vel": dir * 360.0, "life": 0.0, "trail": [], "dmg": 4 + sp_lv, "r": 14.0, "pierce": true, "hit": []})
		Sfx.play("bigshot")
		shake(4.0)
		fx_burst(o, pal.moss.lightened(0.5), 16, 160.0, 0.4, 0.0, 0.08)
		return
	var dmg = 1 + (1 if sp_lv >= 2 else 0) + (1 if kind == "pierce" else 0)
	var rad = 4.0 + sp_lv * 1.5
	var dirs = [dir]
	if kind == "spread":
		dirs = [dir, dir.rotated(-0.22), dir.rotated(0.22)]
	for d in dirs:
		projectiles.append({"kind": "spark", "pos": o, "vel": d * 440.0, "life": 0.0, "trail": [], "dmg": dmg, "r": rad, "pierce": kind == "pierce", "hit": []})
	fx_burst(o, pal.moss.lightened(0.5), 6, 80.0, 0.25, 0.0, 0.05)
	hud.fire_flash = 1.0
	Sfx.play("spark")


func combo_mult() -> float:
	return 1.0 + minf(floor(combo / 5.0) * 0.5, 2.0)


func register_hit() -> void:
	combo += 1
	combo_t = COMBO_WINDOW
	st_combo = maxi(st_combo, combo)
	hud.combo_pop = 1.0
	Sfx.play("combo", 1.0 + minf(combo, 20) * 0.04, 0.0, -6.0)
	rec("combo", combo)
	for m in [10, 25, 50]:
		if combo == m:
			hud.toast(["Great combo!", "Amazing combo!", "LEGENDARY!"][[10, 25, 50].find(m)], pal.ember.lightened(0.3))
			Sfx.play("levelup", 1.2)


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
	if boss_node and boss_awake:
		target.x = lerpf(target.x, (player.position.x + boss_node.position.x) * 0.5, 0.5)
	var k = 1.0 - exp(-5.0 * dt)
	cam.position.x = lerpf(cam.position.x, target.x, k)
	cam.position.y = lerpf(cam.position.y, target.y, 1.0 - exp(-3.2 * dt))
	shake_amt = maxf(shake_amt - dt * 30.0, 0.0)
	cam.offset = Vector2(randf_range(-1, 1), randf_range(-1, 1)) * shake_amt
	fireflies.position = cam.position
	pollen.position = cam.position
	leaves.position = cam.position + Vector2(0, -view_h() * 0.5 - 20.0)


func _update_parallax() -> void:
	var vh = view_h()
	var cx = cam.position.x
	var cy = cam.position.y
	sky.scale = Vector2(VW / float(sky.texture.get_width()), vh / float(sky.texture.get_height()))
	stars.position.y = clampf(-cy * 0.02, -40.0, 60.0) - 20.0
	moon.position = Vector2(290, 150 + clampf(-cy * 0.03, -20.0, 40.0))
	var rs = tscale("ray")
	for i in rays.size():
		var r = rays[i]
		r.position = moon.position
		r.rotation = 0.32 + i * 0.13 + sin(t * 0.2 + i) * 0.02
		r.scale = Vector2((40.0 + (i % 3) * 30.0) / 60.0, 1.0) / rs
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
			s.position.y = vh * 0.5 + 120.0 + (-120.0 - cy) * p.fy + p.top
			if p.has("fill"):
				p.fill.position = Vector2(-4.0, s.position.y + h - 3.0)
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
			ls.scale = Vector2.ONE * 0.72
			ls.modulate.a = 0.85 * (0.85 + 0.15 * sin(t * 13.0 + l[0]) * sin(t * 7.3 + l[1]))
	for i in range(idx, lantern_sprites.size()):
		lantern_sprites[i].visible = false


func _update_platforms(dt: float) -> void:
	for s in solids:
		if s.kind == "move":
			var old: Vector2 = s.r.position
			var np = s.base + Vector2(sin(t * s.speed + s.phase) * s.range, 0)
			s.r.position = np
			s["delta"] = np - old
			if s.has("node"):
				s.node.position.x = np.x
		elif s.kind == "crumble":
			var ct = float(s.get("ct", 0.0))
			if s.get("gone", false):
				s["respawn"] = float(s.get("respawn", 0.0)) + dt
				if s.respawn > 3.0:
					s.gone = false
					s.ct = 0.0
					s.respawn = 0.0
					s.node.position = Vector2(s.base.x, s.base.y - float(metas[biome].platform_top))
					s.node.modulate.a = 0.0
					create_tween().tween_property(s.node, "modulate:a", 1.0, 0.4)
			elif s.get("stood", false) or ct > 0.0:
				ct += dt
				s["ct"] = ct
				s.node.position.x = s.base.x + sin(ct * 60.0) * 1.5
				if ct > 0.5:
					s["gone"] = true
					s["respawn"] = 0.0
					Sfx.play("crumble")
					fx_dust(s.r.get_center(), 10, 60.0)
					create_tween().tween_property(s.node, "position:y", s.node.position.y + 300.0, 0.8).set_ease(Tween.EASE_IN).set_trans(Tween.TRANS_QUAD)
			s["stood"] = false


func _update_projectiles(dt: float) -> void:
	var keep: Array = []
	for p in projectiles:
		p.life += dt
		p.pos += p.vel * dt
		if p.kind == "quill":
			p.vel.y += 160.0 * dt
		elif p.kind == "clod":
			p.vel.y += 900.0 * dt
		p.trail.push_front(p.pos)
		if p.trail.size() > 8:
			p.trail.pop_back()
		var friendly = p.kind == "spark" or p.kind == "big"
		var alive = p.life < (1.0 if friendly else 2.5)
		if alive and _solid_at(p.pos):
			alive = false
			fx_burst(p.pos, pal.moss.lightened(0.4) if friendly else pal.dusk, 6, 70.0, 0.3, 100.0, 0.05)
			if p.kind == "clod":
				fx_dust(p.pos, 6, 50.0)
		if alive and friendly:
			for mo in monsters:
				if not is_instance_valid(mo) or not mo.vulnerable() or p.hit.has(mo):
					continue
				if p.pos.distance_to(mo.world_center()) < mo.radius + p.r:
					p.hit.append(mo)
					mo.hit(int(p.dmg), p.pos.x - p.vel.x)
					register_hit()
					hitstop(0.05 if p.kind == "spark" else 0.08)
					shake(3.0 if p.kind == "spark" else 6.0)
					fx_burst(p.pos, pal.moss.lightened(0.5), 12, 160.0, 0.35, 0.0, 0.06)
					fx_ring(p.pos, pal.moss.lightened(0.5), 22.0 if p.kind == "spark" else 40.0)
					if not p.pierce:
						alive = false
						break
		elif alive:
			if p.pos.distance_to(player.body_center()) < 14.0:
				_hurt(p.pos.x)
				alive = false
		if alive:
			keep.append(p)
	projectiles = keep


func _update_coins(dt: float) -> void:
	var c = player.body_center()
	var magnet = 40.0 + Profile.upgrade_level("magnet") * 35.0
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
		var d = n.position.distance_to(c)
		if (cd.age > 0.5 or not cd.dropped) and d < (magnet if cd.dropped else magnet * 0.6):
			n.position = n.position.move_toward(c, 460.0 * dt)
		n.get_node("Face").scale.x = maxf(0.12, absf(cos(t * 4.0 + cd.phase))) / tscale("coin")
		if d < 20.0 and (not cd.dropped or cd.age > 0.35):
			cd.got = true
			if cd.idx >= 0:
				got_coins.append(cd.idx)
			_collect(n)


func _collect(n: Node2D) -> void:
	coin_frac += combo_mult()
	var gained = int(coin_frac)
	coin_frac -= gained
	st_coins += 1
	if playing and not autoplay:
		Profile.add_coins(gained)
		rec("coin", gained)
	hud.coins = int(Profile.data.coins)
	hud.bump = 1.0
	fx_burst(n.position, pal.ember.lightened(0.3), 12, 150.0, 0.45, 60.0, 0.06)
	fx_ring(n.position, pal.ember.lightened(0.4), 24.0)
	float_text(n.position + Vector2(0, -8), "+%d" % gained if gained > 1 else "+1", Color(1, 0.94, 0.78))
	Sfx.play("coin", 1.0 + minf(combo, 15) * 0.02, 0.02, -3.0)
	n.queue_free()


func _update_monsters_contact() -> void:
	var pc = player.body_center()
	for mo in monsters:
		if not is_instance_valid(mo) or mo.dead:
			continue
		var mc = mo.world_center()
		if pc.distance_to(mc) >= mo.radius + 12.0:
			continue
		if player.dashing():
			if mo.vulnerable() and not dash_hits.has(mo):
				dash_hits.append(mo)
				mo.hit(1, player.position.x)
				register_hit()
				hitstop(0.05)
				shake(4.0)
			continue
		var stomp = player.vel.y > 60.0 and player.position.y < mc.y + 4.0 and mo.kind != "drone"
		if stomp and mo.vulnerable():
			mo.hit(1 if mo.boss else 2, player.position.x)
			player.bounce()
			register_hit()
			hitstop(0.07)
			shake(5.0)
			fx_ring(player.position, pal.moon, 30.0)
			Sfx.play("stomp")
			rec("stomp")
		elif mo.touch_damage():
			_hurt(mc.x)


func _update_checkpoints() -> void:
	for cp in checkpoint_nodes:
		if not cp.get_meta("active") and absf(player.position.x - cp.position.x) < 20.0 and absf(player.position.y - cp.position.y) < 60.0:
			cp.set_meta("active", true)
			respawn = cp.position
			hearts = max_hearts
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
			Sfx.play("checkpoint")
			cp.queue_redraw()
			save_snapshot()


func _update_props(dt: float) -> void:
	var fr = player.feet_rect()
	for h in level.hazards:
		if fr.intersects(Rect2(h.position + Vector2(3, 2), h.size - Vector2(6, 2))) and player.invuln <= 0.0 and not player.dashing():
			_hurt(player.position.x - player.facing * 10.0)
			player.vel.y = -520.0
	for bn in bouncer_nodes:
		var sq = float(bn.get_meta("squish"))
		bn.set_meta("squish", maxf(sq - dt * 4.0, 0.0))
		bn.queue_redraw()
		if player.vel.y > 0.0 and absf(player.position.x - bn.position.x) < 20.0 and absf(player.position.y - (bn.position.y - 12.0)) < 14.0:
			player.bounce(1120.0)
			bn.set_meta("squish", 1.0)
			Sfx.play("bounce")
			fx_burst(bn.position + Vector2(0, -12), pal.moss.lightened(0.5), 14, 140.0, 0.5, 100.0, 0.06)
	for cn in chest_nodes:
		var lid = float(cn.get_meta("lid"))
		if cn.get_meta("open"):
			if lid < 1.0:
				cn.set_meta("lid", minf(lid + dt * 4.0, 1.0))
				cn.queue_redraw()
			continue
		if player.position.distance_to(cn.position) < 26.0:
			_open_chest(cn)


func _open_chest(cn: Node2D) -> void:
	cn.set_meta("open", true)
	opened.append(cn.get_meta("idx"))
	(cn.get_node("Glow") as Sprite2D).modulate.a = 0.0
	Sfx.play("chest")
	rec("chest")
	var roll = randf()
	var luck = Profile.upgrade_level("luck")
	var p = cn.position + Vector2(0, -16)
	if roll < 0.15 + luck * 0.04:
		for i in 14 + luck * 3:
			_add_coin(p, true)
		hud.toast("Jackpot chest!", pal.ember.lightened(0.3))
		fx_burst(p, pal.ember.lightened(0.4), 40, 260.0, 0.9, 150.0, 0.08)
		shake(6.0)
	elif roll < 0.4 and hearts < max_hearts:
		hearts += 1
		hud.hearts = hearts
		float_text(p + Vector2(0, -20), "+1 heart", Color(1, 0.6, 0.6))
		fx_burst(p, Color(1, 0.5, 0.5), 20, 160.0, 0.7, 0.0, 0.07)
	else:
		for i in 5 + randi() % 5 + luck * 2:
			_add_coin(p, true)
		fx_burst(p, pal.ember.lightened(0.3), 20, 180.0, 0.6, 120.0, 0.07)
	buzz(30)


func _update_boss() -> void:
	if boss_node == null:
		return
	if not is_instance_valid(boss_node):
		boss_node = null
		return
	if not boss_awake and player.position.x > boss_node.lo - 140.0:
		boss_awake = true
		boss_node.set_process(true)
		boss_node.st = 0.0
		hud.show_title("Gloam Titan", "Defeat it to open the portal")
		hud.boss_name = "GLOAM TITAN"
		Sfx.music("boss")
		Sfx.play("roar")
		shake(10.0)
		buzz(120)
	if boss_awake:
		hud.boss_k = clampf(float(boss_node.hp) / float(boss_node.max_hp), 0.0, 1.0)


func boss_phase(_m: Monster, n: int) -> void:
	hud.toast("The Titan grows furious!" if n == 2 else "FINAL PHASE!", Color(1, 0.6, 0.5))
	shake(10.0)
	buzz(100)
	fx_burst(_m.world_center(), pal.ember.lightened(0.3), 40, 280.0, 0.9, 0.0, 0.1)


func on_monster_killed(mo: Monster) -> void:
	var c = mo.world_center()
	fx_burst(c, mo.body_color.lightened(0.4), 26, 200.0, 0.8, -30.0, 0.08)
	fx_burst(c, pal.ember.lightened(0.3), 10, 120.0, 0.6, 0.0, 0.05)
	fx_ring(c, mo.body_color.lightened(0.5), 40.0)
	shake(6.0)
	Sfx.play("kill" if mo.kind != "slime" else "splat")
	buzz(25)
	st_kills += 1
	if mo.index >= 0:
		killed.append(mo.index)
	register_hit()
	var drops = 2 + (2 if mo.elite else 0) + (12 if mo.golden else 0)
	var xp = 5 + (10 if mo.elite else 0) + (20 if mo.golden else 0)
	if mo.boss:
		drops = 40
		xp = 150
		_boss_defeated(mo)
	for i in drops:
		_add_coin(c, true)
	if mo.golden:
		hud.toast("Golden monster!", Color(1, 0.85, 0.3))
	if playing and not autoplay:
		rec("boss" if mo.boss else "kill")
		for lv in Profile.add_xp(xp):
			_level_up(lv)
	if mo.kind == "slime" and not mo.mini:
		for k in [-1.0, 1.0]:
			var s = spawn_monster({"kind": "slime", "pos": mo.position + Vector2(k * 14.0, 0), "min": mo.lo, "max": mo.hi, "mini": true})
			s.hop_v = -300.0
			s.vx = k * 90.0


func _boss_defeated(mo: Monster) -> void:
	hud.boss_k = -1.0
	boss_node = null
	portal_locked = false
	portal.visible = true
	portal.modulate.a = 0.0
	create_tween().tween_property(portal, "modulate:a", 1.0, 1.0)
	hud.show_title("Titan defeated!", "The portal is open")
	Sfx.music(biome)
	Sfx.play("levelup", 0.8)
	shake(14.0)
	buzz(200)
	hitstop(0.25)
	for i in 4:
		fx_burst(mo.world_center() + Vector2(randf_range(-50, 50), randf_range(-50, 30)), [pal.ember, pal.moss, pal.moon, pal.dusk][i].lightened(0.3), 30, 300.0, 1.2, 60.0, 0.1)
	save_snapshot()


func _level_up(lv: int) -> void:
	hud.toast("LEVEL UP!  Lv %d   +%d coins" % [lv, 40 * lv], pal.moss.lightened(0.6))
	Sfx.play("levelup")


func _hurt(from_x: float, fell: bool = false) -> void:
	if (player.invuln > 0.0 or player.dashing()) and not fell:
		return
	hearts -= 1
	st_damage += 1
	combo = 0
	hud.hearts = maxi(hearts, 0)
	hurt_pulse = 1.0
	shake(9.0)
	hitstop(0.09)
	buzz(80)
	Sfx.play("hurt")
	fx_burst(player.body_center(), pal.moon, 14, 140.0, 0.5, 120.0, 0.06)
	if hearts <= 0:
		if playing and not autoplay:
			Profile.data.stats.deaths = int(Profile.data.stats.deaths) + 1
			hearts = max_hearts
			save_snapshot()
			get_tree().paused = true
			menu.show_screen("over", {"stage": stage, "kills": st_kills, "coins": st_coins})
			return
		hearts = max_hearts
		hud.hearts = hearts
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


func _stage_clear() -> void:
	transitioning = true
	fx_burst(player.body_center(), pal.moss.lightened(0.5), 40, 220.0, 0.9, -60.0, 0.08)
	Sfx.play("portal")
	if not playing or autoplay:
		var tw0 = create_tween()
		tw0.tween_property(hud, "fade", 1.0, 0.6)
		tw0.tween_callback(func(): start_stage(stage + 1))
		tw0.tween_property(hud, "fade", 0.0, 0.6)
		tw0.tween_callback(func(): transitioning = false)
		return
	var total_coins = level.coins.size()
	var stars_n = 1 + (1 if st_coins >= total_coins * 0.7 else 0) + (1 if st_damage == 0 else 0)
	var boss = LevelGen.is_boss_stage(stage)
	var bonus = 20 + stage * 5 + (60 if boss else 0) + (stars_n - 1) * 15
	var xp = 40 + stage * 6 + st_kills * 3 + (100 if boss else 0)
	var record = stage > int(Profile.data.stats.best_stage)
	Profile.add_coins(bonus)
	Profile.event("stage")
	if st_damage == 0:
		Profile.event("nodmg")
	Profile.record_stage(stage)
	Profile.set_stars(stage, stars_n)
	var levels = Profile.add_xp(xp)
	for lv in levels:
		Sfx.play("levelup")
	hud.coins = int(Profile.data.coins)
	var result = {
		"stage": stage, "stars": stars_n, "time": st_time, "coins": st_coins, "coins_total": total_coins,
		"kills": st_kills, "combo": st_combo, "bonus": bonus, "xp": xp, "levels": levels, "record": record,
		"star_text": "Clear  ·  70%% coins %s  ·  No damage %s" % ["✓" if st_coins >= total_coins * 0.7 else "✗", "✓" if st_damage == 0 else "✗"],
	}
	# the saved run now points at the next stage, so quitting here resumes there
	Profile.save_run({"stage": stage + 1, "run_seed": run_seed, "hero": Profile.data.hero})
	var tw = create_tween()
	tw.tween_property(hud, "fade", 0.7, 0.5)
	tw.tween_callback(func():
		transitioning = false
		hud.fade = 0.0
		get_tree().paused = true
		menu.show_screen("clear", result))


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


func fx_burst(pos: Vector2, col: Color, amount: int = 16, speed: float = 120.0, life: float = 0.6, grav: float = 200.0, size: float = 0.07, additive: bool = true) -> void:
	if int(Profile.setting("quality")) == 0:
		amount = maxi(amount / 2, 2)
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
	get_tree().create_timer(life + 0.3, false).timeout.connect(p.queue_free)


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
	get_tree().create_timer(0.9, false).timeout.connect(p.queue_free)


func fx_ring(pos: Vector2, col: Color, r: float) -> void:
	fx_items.append({"type": "ring", "pos": pos, "col": col, "r": r, "life": 0.0, "max": 0.4})


func float_text(pos: Vector2, s: String, col: Color) -> void:
	fx_items.append({"type": "text", "pos": pos, "text": s, "col": col, "life": 0.0, "max": 0.8})


func shockwave(pos: Vector2, col: Color, power: int) -> void:
	fx_items.append({"type": "shock", "pos": pos, "life": 0.0, "max": 0.75 + power * 0.15, "col": col, "hit": false, "power": power})
	fx_dust(pos, 14, 120.0)
	shake(7.0 + power * 2.0)
	Sfx.play("shock")


func spawn_shot(kind: String, pos: Vector2, vel: Vector2) -> void:
	projectiles.append({"kind": kind, "pos": pos, "vel": vel, "life": 0.0, "trail": [], "dmg": 1, "r": 4.0, "pierce": false, "hit": []})


func fire_beam(from: Vector2, dir: Vector2) -> void:
	fx_items.append({"type": "beam", "pos": from, "dir": dir, "life": 0.0, "max": 0.5, "hit": false})
	shake(4.0)
	Sfx.play("beam")


func _update_fx(dt: float) -> void:
	var keep: Array = []
	for f in fx_items:
		f.life += dt
		if f.type == "shock" and not f.hit:
			var r = 30.0 + f.life * (300.0 + f.power * 60.0)
			if player.on_ground and absf(player.position.y - f.pos.y) < 6.0 and absf(absf(player.position.x - f.pos.x) - r) < 16.0:
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
					node.draw_string_outline(UI_FONT, Vector2(-150, 0), f.text, HORIZONTAL_ALIGNMENT_CENTER, 300, 26, 6, Color(pal.ink, 0.8 * (1.0 - k * k)))
					node.draw_string(UI_FONT, Vector2(-150, 0), f.text, HORIZONTAL_ALIGNMENT_CENTER, 300, 26, Color(f.col, 1.0 - k * k))
					node.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
			"shock":
				var r = 30.0 + f.life * (300.0 + f.power * 60.0)
				var a = 1.0 - k
				if additive:
					for side in [-1.0, 1.0]:
						var x: float = f.pos.x + side * r
						node.draw_texture_rect(glow, Rect2(x - 26, f.pos.y - 34 - f.power * 10, 52, 40 + f.power * 10), false, Color(f.col, 0.8 * a))
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
		match p.kind:
			"spark", "big":
				if additive:
					var tr: Array = p.trail
					var col = pal.moss.lightened(0.5) if p.kind == "spark" else Color(1, 0.95, 0.7)
					for i in range(tr.size() - 1):
						var a2 = 1.0 - float(i) / tr.size()
						node.draw_line(tr[i], tr[i + 1], Color(col, a2 * 0.8), p.r * 1.2 * a2 + 1.0, true)
					var rr = p.r * 4.5
					node.draw_texture_rect(glow, Rect2(p.pos - Vector2(rr, rr), Vector2(rr, rr) * 2.0), false, col)
					node.draw_circle(p.pos, p.r * 0.7, Color(1, 1, 1))
			"quill":
				if additive:
					node.draw_texture_rect(glow, Rect2(p.pos - Vector2(10, 10), Vector2(20, 20)), false, Color(pal.dusk.lightened(0.4), 0.6))
				else:
					var d: Vector2 = p.vel.normalized()
					var tail: Vector2 = p.pos - d * 12.0
					var nrm = d.orthogonal() * 2.2
					node.draw_colored_polygon(PackedVector2Array([p.pos + d * 4.0, tail + nrm, tail - nrm]), pal.dusk.lightened(0.15))
			"bolt":
				if additive:
					var d2: Vector2 = p.vel.normalized()
					node.draw_line(p.pos - d2 * 14.0, p.pos, Color(1, 0.35, 0.3), 4.0, true)
					node.draw_line(p.pos - d2 * 10.0, p.pos, Color(1, 0.9, 0.85), 1.5, true)
					node.draw_texture_rect(glow, Rect2(p.pos - Vector2(12, 12), Vector2(24, 24)), false, Color(1, 0.3, 0.25, 0.8))
			"clod":
				if not additive:
					node.draw_circle(p.pos, 5.0, pal.ink.lerp(pal.ember, 0.25))
					node.draw_circle(p.pos + Vector2(-1.5, -1.5), 2.0, pal.ink.lerp(pal.ember, 0.45))


func _draw_edge(n: Node2D, r: Rect2) -> void:
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
		if not (left_open if side < 0.0 else right_open):
			continue
		var x = r.position.x if side < 0.0 else r.end.x
		var face = PackedVector2Array([Vector2(x, r.position.y + 2), Vector2(x - side * 10.0, r.position.y + 2), Vector2(x - side * 10.0, r.position.y + 400), Vector2(x, r.position.y + 400)])
		n.draw_polygon(face, PackedColorArray([Color(dark, 0.85), Color(dark, 0.0), Color(dark, 0.0), Color(dark, 0.4)]))
		n.draw_line(Vector2(x, r.position.y + 2), Vector2(x, r.position.y + 90), Color(pal.moon, 0.45 if side > 0.0 else 0.18), 1.5, true)
		var cap = PackedVector2Array()
		for i in 9:
			var a = PI * i / 8.0
			cap.append(Vector2(x + side * sin(a) * 7.0 - side * 2.0, r.position.y + 5.0 - cos(a) * 5.0))
		n.draw_colored_polygon(cap, moss)


func _draw_checkpoint(cp: Node2D) -> void:
	var active: bool = cp.get_meta("active")
	var stone = pal.ink.lerp(pal.dusk, 0.5)
	cp.draw_colored_polygon(PackedVector2Array([Vector2(-9, 0), Vector2(-7, -34), Vector2(7, -34), Vector2(9, 0)]), stone)
	cp.draw_colored_polygon(PackedVector2Array([Vector2(3, 0), Vector2(4, -34), Vector2(7, -34), Vector2(9, 0)]), stone.lightened(0.15))
	var cc = pal.moss.lightened(0.5) if active else pal.moss.darkened(0.2)
	cp.draw_colored_polygon(PackedVector2Array([Vector2(0, -60), Vector2(7, -46), Vector2(0, -36), Vector2(-7, -46)]), cc)


func _draw_thorns(n: Node2D, size: Vector2) -> void:
	var count = int(size.x / 8.0)
	var dark = pal.ink.lerp(pal.dusk, 0.4)
	for i in count:
		var x = (i + 0.5) * size.x / count
		var h = 9.0 + sin(i * 2.3) * 3.0
		var pts = PackedVector2Array([Vector2(x - 4.5, size.y), Vector2(x + sin(i) * 1.5, size.y - h), Vector2(x + 4.5, size.y)])
		n.draw_colored_polygon(pts, dark)
		n.draw_line(Vector2(x + sin(i) * 1.5, size.y - h), Vector2(x + 2.5, size.y - 2), Color(pal.ember, 0.55), 1.0, true)
	n.draw_rect(Rect2(0, size.y - 2, size.x, 3), dark.darkened(0.3))


func _draw_bouncer(n: Node2D) -> void:
	var sq = float(n.get_meta("squish"))
	var w = 18.0 * (1.0 + sq * 0.3)
	var h = 10.0 * (1.0 - sq * 0.4)
	n.draw_rect(Rect2(-3, -8, 6, 8), pal.moon.lerp(pal.dusk, 0.4))
	var cap = PackedVector2Array()
	var cols = PackedColorArray()
	for i in 13:
		var a = PI + PI * i / 12.0
		var p = Vector2(cos(a) * w, -8.0 + sin(a) * h)
		cap.append(p)
		cols.append(pal.moss.lightened(0.55).lerp(pal.moss.darkened(0.3), clampf(0.5 + p.x / (2.0 * w), 0.0, 1.0)))
	n.draw_polygon(cap, cols)
	for i in 3:
		n.draw_circle(Vector2(-8 + i * 8, -12 - (2 if i == 1 else 0)), 1.8, Color(1, 1, 1, 0.7))


func _draw_chest(n: Node2D) -> void:
	var lid = float(n.get_meta("lid"))
	var wood = pal.ember.darkened(0.55).lerp(pal.dusk, 0.25)
	var band = pal.moon.lerp(pal.dusk, 0.35)
	n.draw_rect(Rect2(-14, -16, 28, 16), wood)
	n.draw_rect(Rect2(-14, -16, 28, 3), wood.lightened(0.15))
	n.draw_rect(Rect2(-11, -16, 3, 16), band)
	n.draw_rect(Rect2(8, -16, 3, 16), band)
	if lid < 0.5:
		n.draw_rect(Rect2(-15, -24, 30, 9), wood.lightened(0.1))
		n.draw_rect(Rect2(-3, -19, 6, 6), pal.ember)
		n.draw_rect(Rect2(-15, -17, 30, 2), Color(pal.ember.lightened(0.4), 0.8))
	else:
		n.draw_colored_polygon(PackedVector2Array([Vector2(-15, -16), Vector2(15, -16), Vector2(12, -30), Vector2(-12, -30)]), wood.lightened(0.1))
		n.draw_rect(Rect2(-12, -17, 24, 2), Color(1, 0.9, 0.6, 0.9))


# ---------------- autoplay bot (attract mode + automated checks) ----------------
func _bot(dt: float) -> Dictionary:
	var out = {"move": 1.0, "jump": false, "held": true, "fire": false, "dash": false}
	var p = player.position
	if absf(p.x - bot_last_x) < 0.5:
		bot_stuck += dt
	else:
		bot_stuck = 0.0
	bot_last_x = p.x
	for mo in monsters:
		if is_instance_valid(mo) and not mo.dead:
			var d = mo.world_center() - player.body_center()
			if d.x > 0.0 and d.x < 240.0 and absf(d.y) < 100.0 and player.fire_cd <= 0.0:
				out.fire = true
			if d.x > 0.0 and d.x < 70.0 and absf(d.y) < 40.0 and player.on_ground:
				out.jump = true
			if mo.boss and absf(d.x) < 120.0 and player.dash_cd <= 0.0 and randf() < 0.05:
				out.dash = true
	if player.on_ground:
		if ground_below(p + Vector2(26, -4)) > p.y + 30.0:
			out.jump = true
		if _solid_at(p + Vector2(18, -10)):
			out.jump = true
		for h in level.hazards:
			if h.position.x > p.x and h.position.x < p.x + 40.0:
				out.jump = true
		for s in solids:
			var r: Rect2 = s.r
			if s.kind != "ground" and r.position.x > p.x - 10.0 and r.position.x < p.x + 90.0 and r.position.y < p.y - 30.0 and r.position.y > p.y - 130.0:
				out.jump = true
	elif player.vel.y > 80.0 and player.air_jumps > 0:
		if ground_below(p + Vector2(40, 0)) > p.y + 140.0:
			out.jump = true
	if bot_stuck > 0.8:
		out.jump = true
		out.move = -1.0 if fmod(t, 1.0) < 0.3 else 1.0
	if bot_stuck > 3.0:
		for s in solids:
			if s.r.position.x > p.x + 20.0 and s.kind == "ground":
				player.position = Vector2(s.r.position.x + 20.0, s.r.position.y)
				player.vel = Vector2.ZERO
				bot_stuck = 0.0
				break
	return out
