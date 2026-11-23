extends Node
## Renders showcase screenshots (wide view, character line-up, props line-up) into tests/out/.

func _ready() -> void:
	await _run()


func _snap(name: String) -> void:
	await get_tree().process_frame
	await get_tree().process_frame
	await get_tree().process_frame
	get_viewport().get_texture().get_image().save_png("res://tests/out/%s.png" % name)


func _cam(pos: Vector3, look_at: Vector3, fov: float = 60.0) -> Camera3D:
	var c: Camera3D = Camera3D.new()
	c.fov = fov
	add_child(c)
	c.position = pos
	c.look_at(look_at)
	c.make_current()
	return c


func _run() -> void:
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://tests/out"))
	var cage: Node3D = (load("res://zoo/cage_1/cage_1.tscn") as PackedScene).instantiate()
	add_child(cage)
	await get_tree().create_timer(0.5).timeout
	cage.player.touch_ui.visible = false
	cage.player.get_node("CameraPivot/Camera3D").current = false
	var c: Camera3D = _cam(Vector3(9.0, 5.5, -9.0), Vector3(-1.0, 1.0, 0.0), 62.0)
	await _snap("3_wide_view")
	c.position = Vector3(3.0, 1.9, -8.8)
	c.look_at(Vector3(-1.0, 1.4, -2.2))
	await _snap("4_from_walkway")
	# line-up of characters on a plain floor
	cage.queue_free()
	await get_tree().process_frame
	var stage: Node3D = Node3D.new()
	add_child(stage)
	var floor_m: MeshInstance3D = MeshInstance3D.new()
	var pm: PlaneMesh = PlaneMesh.new()
	pm.size = Vector2(40, 12)
	floor_m.mesh = pm
	var fm: StandardMaterial3D = StandardMaterial3D.new()
	fm.albedo_color = Color(0.78, 0.8, 0.86)
	floor_m.material_override = fm
	stage.add_child(floor_m)
	var env: WorldEnvironment = WorldEnvironment.new()
	env.environment = Environment.new()
	env.environment.background_mode = Environment.BG_COLOR
	env.environment.background_color = Color(0.85, 0.87, 0.92)
	env.environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.environment.ambient_light_color = Color.WHITE
	env.environment.ambient_light_energy = 0.55
	stage.add_child(env)
	var sun: DirectionalLight3D = DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-40, -25, 0)
	sun.light_energy = 0.8
	stage.add_child(sun)
	var names: Array[String] = ["kid", "tourist", "grandma", "teen", "burger", "ranger", "keeper"]
	for i: int in names.size():
		var f: Node3D = LowPolyFigure.build(names[i])
		f.position = Vector3((i - 3) * 1.5, 0, 0)
		stage.add_child(f)
	var el: Node3D = LowPolyAnimals.elephant()
	el.position = Vector3(8.0, 0, -1.0)
	el.rotation_degrees.y = -35
	el.scale = Vector3.ONE * 0.7
	stage.add_child(el)
	c = _cam(Vector3(2.0, 1.5, 7.2), Vector3(2.0, 1.15, 0.0), 52.0)
	await _snap("5_characters")
	for ch: Node in stage.get_children():
		if ch is Node3D and ch != floor_m:
			ch.queue_free()
	await get_tree().process_frame
	var props: Array[String] = ["banana", "ball", "ball_blue", "watermelon", "durian", "soda", "duck", "coconut", "phone", "burger", "icecream"]
	for i: int in props.size():
		var p: Node3D = LowPolyProps.build(props[i])
		p.position = Vector3((i - 5) * 0.85, 0.35, 0)
		stage.add_child(p)
	for i: int in 3:
		var kinds: Array = [LowPolyScenery.bush(), LowPolyScenery.rock(), LowPolyScenery.hotdog_cart()]
		var k: Node3D = kinds[i]
		k.position = Vector3(-3.0 + i * 3.0, 0, -3.5)
		k.scale = Vector3.ONE * 0.8
		stage.add_child(k)
	c.position = Vector3(0, 1.4, 5.2)
	c.look_at(Vector3(0, 0.7, -1.0))
	await _snap("6_props")
	get_tree().quit(0)
