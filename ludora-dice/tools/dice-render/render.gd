extends Node3D
# Renders every Ludora dice skin as a real 3D die:
#   12 tumble frames + 6 landing faces per skin -> out/<id>_<n>.png
# Tinted skins (classic, glass) use a white body and pure green pips; the game recolors them.

const OUT := "res://out/"
const R := 0.30          # corner radius (die half size = 1)
const N := 14            # grid per face
const KEY := Color(0, 1, 0)

var die: Node3D
var body: MeshInstance3D
var pips: Array = []
var only := ""

func hexc(h: String) -> Color:
	return Color.html(h)

func lerp3(a: Color, b: Color, c: Color, t: float) -> Color:
	return a.lerp(b, t * 2.0) if t < 0.5 else b.lerp(c, (t - 0.5) * 2.0)

# ---------- procedural textures (triplanar) ----------
func tex_from(fn: Callable, size := 256) -> ImageTexture:
	var img := Image.create(size, size, false, Image.FORMAT_RGBA8)
	for y in size:
		for x in size:
			img.set_pixel(x, y, fn.call(float(x) / size, float(y) / size))
	img.generate_mipmaps()
	return ImageTexture.create_from_image(img)

var noise := FastNoiseLite.new()

func n2(x: float, y: float) -> float:
	return noise.get_noise_2d(x * 256.0, y * 256.0) * 0.5 + 0.5

func wood(u: float, v: float) -> Color:
	var g := sin((u * 9.0 + n2(u * .6, v * .6) * 3.5) * TAU) * 0.5 + 0.5
	g = pow(g, 3.0)
	return hexc("#d9a062").lerp(hexc("#8a5526"), g * 0.85 + n2(u * 4, v * 4) * 0.15)

var stars := {}
func starfield(u: float, v: float) -> Color:
	var base := hexc("#2a1468").lerp(hexc("#140a3a"), n2(u, v))
	var cx := int(u * 32.0); var cy := int(v * 32.0)
	var h := hash(Vector2i(cx, cy)) % 1000
	if h < 120:
		var px := (float(h % 10) / 10.0 * .6 + .2 + cx) / 32.0
		var py := (float(h / 10 % 10) / 10.0 * .6 + .2 + cy) / 32.0
		var d := Vector2(u - px, v - py).length() * 32.0
		var s := clampf(1.0 - d / (0.18 + float(h % 3) * 0.08), 0.0, 1.0)
		return base.lerp(Color(1, 1, .9), s)
	return base

func lavatex(u: float, v: float) -> Color:
	var n := n2(u * 1.3, v * 1.3)
	var crack := 1.0 - clampf(absf(n - 0.5) * 9.0, 0.0, 1.0)
	return hexc("#3a0a02").lerp(hexc("#ffb02a"), crack)

func plasmatex(u: float, v: float) -> Color:
	var n := n2(u * 2.0, v * 2.0)
	return hexc("#3a0a60").lerp(hexc("#ff5ad0"), smoothstep(0.35, 0.8, n))

# ---------- skins ----------
# body: [top color, mid, bottom] by local height; pip color; extras
func skins() -> Array:
	return [
		{id="classic", b=["#ffffff", "#f4f4f4", "#e2e2e2"], pip=KEY, rough=.35},
		{id="glass", b=["#ffffff", "#f6f8ff", "#e8ecf6"], pip=KEY, rough=.08, alpha=.62},
		{id="dark", b=["#34345a", "#1d1d33", "#0c0c18"], pip="#f2f4ff", rough=.25, pipem=.25},
		{id="gold", b=["#ffe27a", "#f0b93a", "#c98612"], pip="#5a3000", rough=.22, metal=.85},
		{id="lava", tex="lava", pip="#ffe070", rough=.6, em="#ff7a20", emt=0.55, pipem=1.2},
		{id="mint", b=["#f2fff9", "#bff3dc", "#8fe0bb"], pip="#1f6e50", rough=.3},
		{id="sundown", b=["#ffd36e", "#ff7a59", "#b83a6a"], pip="#fff4e6", rough=.3},
		{id="berry", b=["#f070b0", "#d0408a", "#7a1456"], pip="#fff0f7", rough=.15},
		{id="cloud", b=["#ffffff", "#eaf2ff", "#c4d8fa"], pip="#3a62c8", rough=.4},
		{id="ink", b=["#2a2a36", "#141420", "#050508"], pip="#e8c060", rough=.2, pipmetal=.9},
		{id="frostbite", b=["#f4fbff", "#cdeeff", "#9fd8f5"], pip="#5fb4e4", rough=.06, alpha=.86},
		{id="oak", tex="wood", pip="#3a1f06", rough=.55},
		{id="nightlights", b=["#1c1e5a", "#0f1038", "#070820"], pip="#7ff6ff", rough=.2, pipem=2.2, edge="#3cf0ff"},
		{id="arcadecab", b=["#7a4ae8", "#5a2bd0", "#2a0f78"], pip="#8ff8ff", rough=.25, pipem=1.6, edge="#ff4fd8"},
		{id="reef", b=["#5fe0d6", "#26c6c0", "#0b6a8a"], pip="#ffd0b8", rough=.25},
		{id="stardust", tex="stars", pip="#ffe58a", rough=.3, pipem=1.0, em="#ffffff", emt=0.12},
		{id="jade", b=["#7ae6b6", "#3fb987", "#0f7a55"], pip="#062d1e", rough=.1},
		{id="plasma", tex="plasma", pip="#c8feff", rough=.25, em="#ff4fd8", emt=0.35, pipem=1.6},
		{id="mirror", b=["#ffffff", "#f0f2f6", "#dde1e8"], pip="#2a2f38", rough=.14, metal=.75},
		{id="prism", prism=true, pip="#ffffff", rough=.2, pipem=.3},
		{id="t_pirate", b=["#f2c14e", "#f2c14e", "#f2c14e"], pip="#000000", rough=.3, faces=true},
		{id="t_astro", b=["#9ad8ff", "#9ad8ff", "#9ad8ff"], pip="#000000", rough=.3, faces=true},
		{id="t_bear", b=["#fff0f7", "#fff0f7", "#fff0f7"], pip="#000000", rough=.3, faces=true},
		{id="t_dragon", b=["#ffd24a", "#ffd24a", "#ffd24a"], pip="#000000", rough=.3, faces=true},
		{id="t_robot", b=["#e0fff9", "#e0fff9", "#e0fff9"], pip="#000000", rough=.3, faces=true},
		{id="t_mermaid", b=["#ffe0f0", "#ffe0f0", "#ffe0f0"], pip="#000000", rough=.3, faces=true},
		{id="t_tiger", b=["#2a1404", "#2a1404", "#2a1404"], pip="#000000", rough=.3, faces=true},
		{id="t_owl", b=["#ffe08a", "#ffe08a", "#ffe08a"], pip="#000000", rough=.3, faces=true},
		{id="t_unicorn", b=["#ff9bd9", "#ff9bd9", "#ff9bd9"], pip="#000000", rough=.3, faces=true},
		{id="t_ghost", b=["#ff9a2a", "#ff9a2a", "#ff9a2a"], pip="#000000", rough=.3, faces=true},
	]

# ---------- mesh ----------
func rounded(p: Vector3) -> Array:
	var c := p.clamp(Vector3.ONE * -(1.0 - R), Vector3.ONE * (1.0 - R))
	var d := p - c
	var n := d.normalized() if d.length() > 0.0001 else p.normalized()
	return [c + n * R, n]

const FACES := [
	[Vector3.UP, Vector3.RIGHT, Vector3.BACK],
	[Vector3.DOWN, Vector3.RIGHT, Vector3.FORWARD],
	[Vector3.RIGHT, Vector3.BACK, Vector3.UP],
	[Vector3.LEFT, Vector3.FORWARD, Vector3.UP],
	[Vector3.BACK, Vector3.UP, Vector3.RIGHT],
	[Vector3.FORWARD, Vector3.DOWN, Vector3.RIGHT],
]

const PRISM := ["#ff5a6a", "#ffd24a", "#5cf08a", "#4cc9ff", "#b06bff", "#ff8a3a"]

func body_color(sk: Dictionary, pos: Vector3, nrm: Vector3) -> Color:
	if sk.get("prism", false):
		var best := 0; var bd := -9.0
		for i in 6:
			var dd: float = nrm.dot(FACES[i][0])
			if dd > bd: bd = dd; best = i
		return hexc(PRISM[best])
	if sk.has("tex"):
		return Color.WHITE
	var b: Array = sk.b
	var t := clampf((1.0 - pos.y) / 2.0, 0.0, 1.0)
	var col := lerp3(hexc(b[0]), hexc(b[1]), hexc(b[2]), t)
	if sk.has("edge"):
		var edge := clampf((1.0 - maxf(maxf(absf(nrm.x), absf(nrm.y)), absf(nrm.z))) * 3.0, 0.0, 1.0)
		col = col.lerp(hexc(sk.edge), edge)
	return col

func build_body(sk: Dictionary) -> ArrayMesh:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for f in FACES:
		var n: Vector3 = f[0]; var u: Vector3 = f[1]; var v: Vector3 = f[2]
		if n.cross(u).dot(v) < 0: v = -v
		for i in N:
			for j in N:
				var quad := []
				for k in [[0, 0], [1, 0], [1, 1], [0, 1]]:
					var a := -1.0 + 2.0 * float(i + k[0]) / N
					var bb := -1.0 + 2.0 * float(j + k[1]) / N
					quad.append(rounded(n + u * a + v * bb))
				for idx in [0, 2, 1, 0, 3, 2]:
					var q = quad[idx]
					st.set_color(body_color(sk, q[0], q[1]))
					st.set_normal(q[1])
					st.set_uv(Vector2(q[0].x + q[0].z, q[0].y + q[0].z) * 0.25)
					st.add_vertex(q[0])
	return st.commit()

const PIPS := {1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
	5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]}
# face index -> value (opposites sum to 7)
const FVAL := [1, 6, 3, 4, 2, 5]

func mat_for(sk: Dictionary, pip: bool) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	if pip:
		var pc = sk.pip
		m.albedo_color = pc if pc is Color else hexc(pc)
		m.roughness = 0.3
		m.metallic = sk.get("pipmetal", 0.0)
		if sk.get("pipem", 0.0) > 0.0:
			m.emission_enabled = true
			m.emission = m.albedo_color
			m.emission_energy_multiplier = sk.pipem
		if pc is Color and pc == KEY:
			m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		return m
	m.vertex_color_use_as_albedo = true
	m.roughness = sk.get("rough", .3)
	m.metallic = sk.get("metal", 0.0)
	m.metallic_specular = 0.7
	if sk.has("alpha"):
		m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_DEPTH_PRE_PASS
		m.albedo_color = Color(1, 1, 1, sk.alpha)
	if sk.has("tex"):
		var t: ImageTexture
		match sk.tex:
			"wood": t = tex_from(wood)
			"stars": t = tex_from(starfield)
			"lava": t = tex_from(lavatex)
			"plasma": t = tex_from(plasmatex)
		m.albedo_texture = t
		m.uv1_triplanar = true
		m.uv1_scale = Vector3(0.45, 0.45, 0.45)
		if sk.has("em"):
			m.emission_enabled = true
			m.emission_texture = t
			m.emission = hexc(sk.em)
			m.emission_energy_multiplier = sk.emt
	return m

func build_die(sk: Dictionary) -> void:
	if die: die.queue_free()
	die = Node3D.new(); add_child(die)
	body = MeshInstance3D.new(); body.mesh = build_body(sk)
	body.material_override = mat_for(sk, false)
	die.add_child(body)
	if sk.has("faces"):
		for fi in 6:
			var f2 = FACES[fi]
			var n2: Vector3 = f2[0]
			var q := MeshInstance3D.new(); var qm := QuadMesh.new(); qm.size = Vector2(1.58, 1.58); q.mesh = qm
			var fm := StandardMaterial3D.new()
			var img := Image.load_from_file(ProjectSettings.globalize_path("res://faces/%s_%d.png" % [sk.id, FVAL[fi]]))
			img.generate_mipmaps()
			fm.albedo_texture = ImageTexture.create_from_image(img); fm.roughness = 0.35
			q.material_override = fm
			var xa: Vector3 = Vector3.RIGHT if absf(n2.y) > .9 else Vector3.UP.cross(n2).normalized()
			var ya: Vector3 = n2.cross(xa).normalized()
			q.basis = Basis(xa, ya, n2)
			q.position = n2 * 1.002
			die.add_child(q)
		return
	var pm := mat_for(sk, true)
	var sph := SphereMesh.new(); sph.radius = 0.2; sph.height = 0.4
	sph.radial_segments = 24; sph.rings = 12
	for fi in 6:
		var f = FACES[fi]
		var n: Vector3 = f[0]; var u: Vector3 = f[1]; var v: Vector3 = f[2]
		for p in PIPS[FVAL[fi]]:
			var mi := MeshInstance3D.new(); mi.mesh = sph; mi.material_override = pm
			mi.position = n * 0.975 + u * (p[0] * 0.5) + v * (p[1] * 0.5)
			mi.basis = Basis.looking_at(n, u if absf(n.dot(Vector3.UP)) > .9 else Vector3.UP) * Basis.from_scale(Vector3(1, 1, 0.3))
			die.add_child(mi)

# rotation that brings face of value v to the top, then a pleasant yaw
func face_up(v: int) -> Basis:
	var fi: int = FVAL.find(v)
	var n: Vector3 = FACES[fi][0]
	var q: Quaternion
	if n == Vector3.DOWN: q = Quaternion(Vector3.RIGHT, PI)
	elif n == Vector3.UP: q = Quaternion.IDENTITY
	else: q = Quaternion(n, Vector3.UP)
	var xa: Vector3 = Vector3.RIGHT if absf(n.y) > .9 else Vector3.UP.cross(n).normalized()
	var ya: Vector3 = n.cross(xa).normalized()
	var yw: Vector3 = Basis(q) * ya
	var fix := 0.0; var best := 9.0
	for k in 4:
		var a := k * PI / 2.0
		var z := (Basis(Vector3.UP, a) * yw).z
		if z < best: best = z; fix = a
	return Basis(Quaternion(Vector3.UP, deg_to_rad(28.0) + fix) * q)

func shot(path: String) -> void:
	await RenderingServer.frame_post_draw
	await RenderingServer.frame_post_draw
	var img := get_viewport().get_texture().get_image()
	img.save_png(path)

func _ready() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--only="): only = a.substr(7)
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(OUT))
	noise.seed = 7; noise.frequency = 0.012; noise.fractal_octaves = 4
	var cam := Camera3D.new(); add_child(cam)
	cam.fov = 30.0
	cam.position = Vector3(0, 4.9, 4.9)
	cam.look_at(Vector3.ZERO, Vector3.UP)
	var env := Environment.new()
	env.background_mode = Environment.BG_CLEAR_COLOR
	var sky := Sky.new(); var psm := ProceduralSkyMaterial.new()
	psm.sky_top_color = Color(0.55, 0.65, 1.0); psm.sky_horizon_color = Color(1, 0.9, 0.95)
	psm.ground_bottom_color = Color(0.1, 0.08, 0.25); psm.ground_horizon_color = Color(0.6, 0.5, 0.8)
	sky.sky_material = psm; env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env.ambient_light_energy = 0.55
	env.reflected_light_source = Environment.REFLECTION_SOURCE_SKY
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	env.glow_enabled = false
	var we := WorldEnvironment.new(); we.environment = env; add_child(we)
	var key := DirectionalLight3D.new(); add_child(key)
	key.rotation_degrees = Vector3(-55, -35, 0); key.light_energy = 1.25
	var fill := DirectionalLight3D.new(); add_child(fill)
	fill.rotation_degrees = Vector3(-20, 140, 0); fill.light_energy = 0.45; fill.light_color = Color(0.75, 0.8, 1)
	var rim := DirectionalLight3D.new(); add_child(rim)
	rim.rotation_degrees = Vector3(10, 180, 0); rim.light_energy = 0.5
	var rng := RandomNumberGenerator.new()
	for sk in skins():
		if only != "" and sk.id != only: continue
		build_die(sk)
		rng.seed = 12345
		var axis := Vector3(0.7, 0.35, 0.6).normalized()
		var b0 := Basis(Quaternion(Vector3(0.2, 1, 0.1).normalized(), 0.6))
		for i in 12:
			die.basis = b0 * Basis(axis, i * TAU / 12.0 * 1.0) * Basis(Vector3.UP, i * 0.35)
			await shot(OUT + "%s_t%02d.png" % [sk.id, i])
		for v in range(1, 7):
			die.basis = face_up(v)
			await shot(OUT + "%s_v%d.png" % [sk.id, v])
		print("done ", sk.id)
	get_tree().quit()
