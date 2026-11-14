extends "res://render.gd"
# Hero shots for the store: 3D board + glossy pawns + big dice.  args: --mode=icon|feature

const PROFILE2 := [
	[0.0, 0.0], [0.46, 0.0], [0.52, 0.02], [0.555, 0.06], [0.56, 0.10], [0.54, 0.15], [0.48, 0.19],
	[0.42, 0.23], [0.39, 0.29], [0.36, 0.37], [0.32, 0.47], [0.27, 0.57], [0.22, 0.66], [0.19, 0.72],
	[0.27, 0.75], [0.30, 0.78], [0.28, 0.81], [0.17, 0.83], [0.15, 0.86], [0.0, 0.88]]

func lathe() -> ArrayMesh:
	var st := SurfaceTool.new(); st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var pts := []
	for p in PROFILE2: pts.append(Vector2(p[0], p[1]))
	for i in range(pts.size() - 1):
		var a: Vector2 = pts[i]; var b: Vector2 = pts[i + 1]
		var d := b - a; var n2 := Vector2(d.y, -d.x).normalized()
		if n2.x < 0: n2 = -n2
		for s in 64:
			var t0 := TAU * s / 64; var t1 := TAU * (s + 1) / 64
			var q := [[a, t0], [b, t0], [b, t1], [a, t1]]
			for idx in [0, 2, 1, 0, 3, 2]:
				var pp: Vector2 = q[idx][0]; var th: float = q[idx][1]
				st.set_normal(Vector3(n2.x * cos(th), n2.y, n2.x * sin(th)).normalized())
				st.add_vertex(Vector3(pp.x * cos(th), pp.y, pp.x * sin(th)))
	return st.commit()

var pawn_mesh: ArrayMesh
func pawn(col: String, pos: Vector3, sc := 0.24) -> void:
	var n := Node3D.new(); add_child(n); n.position = pos; n.scale = Vector3.ONE * sc
	var m := StandardMaterial3D.new(); m.albedo_color = Color.html(col); m.roughness = 0.16; m.metallic_specular = 0.9
	m.rim_enabled = true; m.rim = 0.15; m.rim_tint = 0.7
	var b := MeshInstance3D.new(); b.mesh = pawn_mesh; b.material_override = m; n.add_child(b)
	var h := MeshInstance3D.new(); var sm := SphereMesh.new(); sm.radius = 0.25; sm.height = 0.5; sm.radial_segments = 48; sm.rings = 24
	h.mesh = sm; h.position = Vector3(0, 1.07, 0); h.material_override = m; n.add_child(h)

func cellp(cx: float, cy: float) -> Vector3:
	return Vector3((cx + 0.5) / 15.0 * 3.0 - 1.5, 0.0, (cy + 0.5) / 15.0 * 3.0 - 1.5)
func gridp(gx: float, gy: float) -> Vector3:
	return Vector3(gx / 15.0 * 3.0 - 1.5, 0.0, gy / 15.0 * 3.0 - 1.5)

func make_die(sk: Dictionary, pos: Vector3, bas: Basis, sc: float) -> void:
	die = null; build_die(sk)
	var d := die; die = null
	d.position = pos; d.basis = bas.scaled(Vector3.ONE * sc)

func _ready() -> void:
	var mode := "icon"
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--mode="): mode = a.substr(7)
	noise.seed = 7; noise.frequency = 0.012; noise.fractal_octaves = 4
	pawn_mesh = lathe()
	var env := Environment.new()
	env.background_mode = Environment.BG_CLEAR_COLOR
	var sky := Sky.new(); var psm := ProceduralSkyMaterial.new()
	psm.sky_top_color = Color(0.6, 0.7, 1.0); psm.sky_horizon_color = Color(1, 0.92, 0.96)
	psm.ground_bottom_color = Color(0.15, 0.12, 0.3); psm.ground_horizon_color = Color(0.7, 0.6, 0.85)
	sky.sky_material = psm; env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY; env.ambient_light_energy = 0.32
	env.reflected_light_source = Environment.REFLECTION_SOURCE_SKY
	env.tonemap_mode = Environment.TONE_MAPPER_ACES; env.tonemap_exposure = 0.95
	env.ssao_enabled = false
	var we := WorldEnvironment.new(); we.environment = env; add_child(we)
	var key := DirectionalLight3D.new(); add_child(key)
	key.rotation_degrees = Vector3(-58, -30, 0); key.light_energy = 1.05; key.shadow_enabled = true
	key.directional_shadow_max_distance = 12.0; key.shadow_blur = 2.0
	var fill := DirectionalLight3D.new(); add_child(fill)
	fill.rotation_degrees = Vector3(-25, 150, 0); fill.light_energy = 0.4; fill.light_color = Color(0.8, 0.85, 1)
	var rim := DirectionalLight3D.new(); add_child(rim)
	rim.rotation_degrees = Vector3(-8, 185, 0); rim.light_energy = 0.55
	# board: textured top + golden slab
	if not mode.begins_with("d"):
		var top := MeshInstance3D.new(); var pm := PlaneMesh.new(); pm.size = Vector2(3, 3); top.mesh = pm
		var tm := StandardMaterial3D.new()
		var img := Image.load_from_file(ProjectSettings.globalize_path("res://board_tex.png")); img.generate_mipmaps()
		tm.albedo_texture = ImageTexture.create_from_image(img); tm.roughness = 0.95; tm.metallic_specular = 0.05; tm.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS_ANISOTROPIC
		top.material_override = tm; top.position.y = 0.001; add_child(top)
		var slab := MeshInstance3D.new(); var bm := BoxMesh.new(); bm.size = Vector3(3.24, 0.22, 3.24); slab.mesh = bm
		var sm2 := StandardMaterial3D.new(); sm2.albedo_color = Color.html("#e0a020"); sm2.metallic = 0.9; sm2.roughness = 0.25
		slab.material_override = sm2; slab.position.y = -0.11; add_child(slab)
	var cam := Camera3D.new(); add_child(cam)
	var white := {id="w", b=["#ffffff", "#f7f7fb", "#e4e6ee"], pip="#e3192b", rough=.14}
	var gold := {id="gd", b=["#ffe58a", "#f2bb3a", "#c4800e"], pip="#4a2400", rough=.2, metal=.8}
	if mode == "dw" or mode == "dg":
		var sk2: Dictionary = white if mode == "dw" else gold
		make_die(sk2, Vector3.ZERO, Basis(Vector3(1, 0, 0), 0.38) * Basis(Vector3.UP, 0.62) * face_up(6 if mode == "dw" else 5), 1.0)
		cam.fov = 30.0; cam.position = Vector3(0, 4.2, 4.2); cam.look_at(Vector3.ZERO, Vector3.UP)
	elif mode == "icon":
		pawn("#d81a22", cellp(3, 6)); pawn("#13952f", cellp(8, 3)); pawn("#f0b400", cellp(11, 8)); pawn("#155fd6", cellp(8, 11))
		pawn("#d81a22", gridp(2, 2)); pawn("#155fd6", gridp(2, 13)); pawn("#13952f", gridp(11, 2)); pawn("#f0b400", gridp(13, 13))
		make_die(white, Vector3(-0.2, 0.62, 0.22), Basis(Vector3(1, 0, 0), 0.32) * Basis(Vector3.UP, 0.62) * face_up(6), 0.38)
		make_die(gold, Vector3(0.58, 0.38, 0.62), Basis(Vector3(1, 0, 0), 0.25) * Basis(Vector3.UP, -0.5) * Basis(Vector3(0, 0, 1), 0.35) * face_up(5), 0.25)
		cam.fov = 34.0; cam.position = Vector3(0, 3.6, 2.3); cam.look_at(Vector3(0, 0.1, 0.12), Vector3.UP)
	else:
		pawn("#d81a22", cellp(3, 6)); pawn("#13952f", cellp(8, 3)); pawn("#f0b400", cellp(11, 8)); pawn("#155fd6", cellp(6, 11))
		pawn("#155fd6", cellp(7, 12)); pawn("#d81a22", gridp(2, 2)); pawn("#d81a22", gridp(4, 4)); pawn("#13952f", gridp(13, 4))
		pawn("#f0b400", gridp(11, 13)); pawn("#155fd6", gridp(2, 13))
		make_die(white, Vector3(-0.75, 0.62, 1.05), Basis(Vector3(1, 0, 0), 0.35) * Basis(Vector3.UP, 0.6) * face_up(6), 0.3)
		make_die(gold, Vector3(0.75, 0.75, 0.95), Basis(Vector3(1, 0, 0), 0.3) * Basis(Vector3.UP, -0.55) * Basis(Vector3(0, 0, 1), 0.4) * face_up(5), 0.26)
		cam.fov = 30.0; cam.position = Vector3(0, 3.3, 4.6); cam.look_at(Vector3(0, 0.05, 0.2), Vector3.UP)
	await RenderingServer.frame_post_draw
	await RenderingServer.frame_post_draw
	await RenderingServer.frame_post_draw
	get_viewport().get_texture().get_image().save_png(ProjectSettings.globalize_path("res://out_%s.png" % mode))
	print("saved ", mode)
	get_tree().quit()
