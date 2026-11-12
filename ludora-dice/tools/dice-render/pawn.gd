extends Node3D
# Glossy classic Ludo pawns: lathe-turned shape, plastic material, 4 colors -> out/pawn_<color>.png

const SEG := 64
# profile: [radius, height] from bottom center up to the top of the head (head handled as a sphere)
const PROFILE := [
	[0.0, 0.0], [0.46, 0.0], [0.52, 0.02], [0.555, 0.06], [0.56, 0.10], [0.54, 0.15], [0.48, 0.19],
	[0.42, 0.23], [0.39, 0.29], [0.36, 0.37], [0.32, 0.47], [0.27, 0.57], [0.22, 0.66], [0.19, 0.72],
	[0.27, 0.75], [0.30, 0.78], [0.28, 0.81], [0.17, 0.83], [0.15, 0.86], [0.0, 0.88]]
const HEAD_Y := 1.07
const HEAD_R := 0.25

func lathe() -> ArrayMesh:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var pts := []
	for p in PROFILE: pts.append(Vector2(p[0], p[1]))
	for i in range(pts.size() - 1):
		var a: Vector2 = pts[i]; var b: Vector2 = pts[i + 1]
		var d := b - a
		var n2 := Vector2(d.y, -d.x).normalized()   # outward normal in profile plane
		if n2.x < 0: n2 = -n2
		for s in SEG:
			var t0 := TAU * s / SEG; var t1 := TAU * (s + 1) / SEG
			var q := [[a, t0], [b, t0], [b, t1], [a, t1]]
			for idx in [0, 2, 1, 0, 3, 2]:
				var pp: Vector2 = q[idx][0]; var th: float = q[idx][1]
				st.set_normal(Vector3(n2.x * cos(th), n2.y, n2.x * sin(th)).normalized())
				st.add_vertex(Vector3(pp.x * cos(th), pp.y, pp.x * sin(th)))
	st.generate_tangents()
	return st.commit()

func shot(path: String) -> void:
	await RenderingServer.frame_post_draw
	await RenderingServer.frame_post_draw
	get_viewport().get_texture().get_image().save_png(path)

func _ready() -> void:
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://out/"))
	var cam := Camera3D.new(); add_child(cam)
	cam.fov = 22.0
	cam.position = Vector3(0, 1.75, 4.6)
	cam.look_at(Vector3(0, 0.6, 0), Vector3.UP)
	var env := Environment.new()
	env.background_mode = Environment.BG_CLEAR_COLOR
	var sky := Sky.new(); var psm := ProceduralSkyMaterial.new()
	psm.sky_top_color = Color(0.8, 0.85, 1.0); psm.sky_horizon_color = Color(1, 1, 1)
	psm.ground_bottom_color = Color(0.35, 0.35, 0.4); psm.ground_horizon_color = Color(0.85, 0.85, 0.9)
	sky.sky_material = psm; env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env.ambient_light_energy = 0.28
	env.reflected_light_source = Environment.REFLECTION_SOURCE_SKY
	env.tonemap_mode = Environment.TONE_MAPPER_LINEAR
	var we := WorldEnvironment.new(); we.environment = env; add_child(we)
	var key := DirectionalLight3D.new(); add_child(key)
	key.rotation_degrees = Vector3(-40, -40, 0); key.light_energy = 1.3
	var fill := DirectionalLight3D.new(); add_child(fill)
	fill.rotation_degrees = Vector3(-15, 150, 0); fill.light_energy = 0.5
	var rim := DirectionalLight3D.new(); add_child(rim)
	rim.rotation_degrees = Vector3(-5, 180, 0); rim.light_energy = 0.6
	var body := MeshInstance3D.new(); body.mesh = lathe(); add_child(body)
	var head := MeshInstance3D.new(); var sm := SphereMesh.new()
	sm.radius = HEAD_R; sm.height = HEAD_R * 2; sm.radial_segments = 48; sm.rings = 24
	head.mesh = sm; head.position = Vector3(0, HEAD_Y, 0); add_child(head)
	var body_only := "--body" in OS.get_cmdline_user_args()
	head.visible = not body_only
	var cols := {"red": "#d81a22", "green": "#13952f", "yellow": "#f0b400", "blue": "#155fd6"}
	for k in cols:
		var m := StandardMaterial3D.new()
		m.albedo_color = Color.html(cols[k])
		m.roughness = 0.18
		m.metallic = 0.0
		m.metallic_specular = 0.9
		m.rim_enabled = true; m.rim = 0.12; m.rim_tint = 0.8
		body.material_override = m; head.material_override = m
		await shot(("res://out/body_%s.png" if body_only else "res://out/pawn_%s.png") % k)
		print("pawn ", k)
	get_tree().quit()
