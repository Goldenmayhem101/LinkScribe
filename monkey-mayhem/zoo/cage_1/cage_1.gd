extends Node3D
## The first cage, now dressed with the low-poly models built from the ChatGPT sheets.
## (Visitors do not move yet; physics props are in the "grabbable" group for the grab step.)

const MONKEY_SCENE: PackedScene = preload("res://characters/monkey/monkey.tscn")

var player: PlayerController


func _ready() -> void:
	_build_environment()
	_build_ground()
	_build_cage()
	_build_scenery()
	_build_props()
	_build_visitors()
	player = MONKEY_SCENE.instantiate() as PlayerController
	add_child(player)
	player.position = Vector3(0.0, 0.9, 2.6)


# ----------------------------------------------------------------- helpers

func _place(node: Node3D, pos: Vector3, yaw_deg: float = 0.0) -> Node3D:
	node.position = pos
	node.rotation_degrees.y = yaw_deg
	add_child(node)
	return node


func _static_box(pos: Vector3, size: Vector3, color: Color, groups: Array[StringName] = [], visible_mesh: bool = true) -> StaticBody3D:
	var body: StaticBody3D = StaticBody3D.new()
	if visible_mesh:
		LowPoly.box(body, size, color)
	var col: CollisionShape3D = CollisionShape3D.new()
	var shape: BoxShape3D = BoxShape3D.new()
	shape.size = size
	col.shape = shape
	body.add_child(col)
	body.position = pos
	for g: StringName in groups:
		body.add_to_group(g)
	add_child(body)
	return body


func _static_cylinder(pos: Vector3, radius: float, height: float, color: Color, groups: Array[StringName] = []) -> StaticBody3D:
	var body: StaticBody3D = StaticBody3D.new()
	LowPoly.cyl(body, radius, radius, height, color, Vector3.ZERO, Vector3.ZERO, 6)
	var col: CollisionShape3D = CollisionShape3D.new()
	var shape: CylinderShape3D = CylinderShape3D.new()
	shape.radius = radius
	shape.height = height
	col.shape = shape
	body.add_child(col)
	body.position = pos
	for g: StringName in groups:
		body.add_to_group(g)
	add_child(body)
	return body


# ------------------------------------------------------------------ world

func _build_environment() -> void:
	var env: Environment = Environment.new()
	var sky: Sky = Sky.new()
	var sky_mat: ProceduralSkyMaterial = ProceduralSkyMaterial.new()
	sky_mat.sky_top_color = Color(0.3, 0.62, 0.98)
	sky_mat.sky_horizon_color = Color(0.7, 0.9, 1.0)
	sky_mat.ground_horizon_color = Color(0.7, 0.9, 1.0)
	sky_mat.ground_bottom_color = Color(0.55, 0.75, 0.55)
	sky.sky_material = sky_mat
	env.background_mode = Environment.BG_SKY
	env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.85, 0.9, 1.0)
	env.ambient_light_energy = 0.5
	var we: WorldEnvironment = WorldEnvironment.new()
	we.environment = env
	add_child(we)
	var sun: DirectionalLight3D = DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-48.0, -35.0, 0.0)
	sun.light_energy = 0.8
	sun.shadow_enabled = true
	add_child(sun)


func _build_ground() -> void:
	_static_box(Vector3(0, -0.25, -10), Vector3(80, 0.5, 80), Color(0.42, 0.78, 0.25), [], false)
	var grass: MeshInstance3D = MeshInstance3D.new()
	var pm: PlaneMesh = PlaneMesh.new()
	pm.size = Vector2(80, 80)
	grass.mesh = pm
	var gm: StandardMaterial3D = StandardMaterial3D.new()
	gm.albedo_color = Color(0.42, 0.78, 0.25)
	grass.material_override = gm
	grass.position = Vector3(0, 0.0, -10)
	add_child(grass)
	# visitor walkway (tan path)
	var path: MeshInstance3D = MeshInstance3D.new()
	var pp: PlaneMesh = PlaneMesh.new()
	pp.size = Vector2(60, 5)
	path.mesh = pp
	var pm2: StandardMaterial3D = StandardMaterial3D.new()
	pm2.albedo_color = Color(0.93, 0.82, 0.58)
	path.material_override = pm2
	path.position = Vector3(0, 0.02, -4.2)
	add_child(path)


func _build_cage() -> void:
	var climb: Array[StringName] = [&"climbable"]
	# dirt floor
	_static_box(Vector3(0, -0.02, 2.4), Vector3(9, 0.12, 5.2), Color(0.85, 0.6, 0.35))
	# front bars: steel with gold posts every 4th bar, like the reference
	var i: int = 0
	var x: float = -4.4
	while x <= 4.45:
		var gold: bool = i % 4 == 0
		var b: StaticBody3D = _static_cylinder(Vector3(x, 1.7, 0.0), 0.06 if gold else 0.035, 3.4, Color(0.98, 0.78, 0.12) if gold else Color(0.32, 0.38, 0.46), climb)
		b.name = "Bar%d" % i
		x += 0.55
		i += 1
	_static_box(Vector3(0, 3.4, 0), Vector3(9.2, 0.14, 0.14), Color(0.32, 0.38, 0.46))
	_static_box(Vector3(0, 0.45, 0), Vector3(9.2, 0.12, 0.12), Color(0.32, 0.38, 0.46))
	# solid side/back walls (stone) and bar roof
	var stone: Color = Color(0.62, 0.62, 0.68)
	_static_box(Vector3(-4.6, 1.7, 2.5), Vector3(0.2, 3.4, 5.2), stone)
	_static_box(Vector3(4.6, 1.7, 2.5), Vector3(0.2, 3.4, 5.2), stone)
	_static_box(Vector3(0, 1.7, 5.1), Vector3(9.2, 3.4, 0.2), stone)
	var z: float = 0.4
	while z <= 5.0:
		_static_box(Vector3(0, 3.4, z), Vector3(9.2, 0.08, 0.08), Color(0.32, 0.38, 0.46))
		z += 0.8
	# rocks, climbing rope, monkey bars, tree platform pieces
	var rock: Node3D = _place(LowPolyScenery.rock(), Vector3(-3.0, 0.0, 2.2), 20.0)
	rock.scale = Vector3(1.1, 1.1, 1.1)
	var rock_col: StaticBody3D = _static_box(Vector3(-3.0, 0.5, 2.2), Vector3(1.6, 1.0, 1.3), Color.WHITE, [], false)
	rock_col.name = "RockCollision"
	_place(LowPolyScenery.rock(), Vector3(3.6, 0.0, 3.8), -40.0).scale = Vector3(0.8, 0.8, 0.8)
	_static_cylinder(Vector3(2.8, 1.8, 1.4), 0.08, 3.2, Color(0.88, 0.7, 0.4), climb)
	_static_box(Vector3(2.8, 3.3, 1.4), Vector3(0.9, 0.12, 0.12), Color(0.55, 0.32, 0.12))
	_place(LowPolyScenery.bush(), Vector3(-3.8, 0.0, 4.2))


func _build_scenery() -> void:
	var trees: Array = [[Vector3(-9, 0, -9), 1.3], [Vector3(-4.5, 0, -12), 1.5], [Vector3(6.5, 0, -10), 1.4], [Vector3(10.5, 0, -8), 1.2], [Vector3(0, 0, -15), 1.7], [Vector3(14, 0, -13), 1.5], [Vector3(-14, 0, -6), 1.3], [Vector3(-8.5, 0, 6), 1.2], [Vector3(9, 0, 4), 1.3]]
	for t: Array in trees:
		_place(LowPolyScenery.tree(t[1]), t[0])
	_place(LowPolyScenery.pine(1.3), Vector3(3, 0, -13))
	_place(LowPolyScenery.pine(1.1), Vector3(-1.5, 0, -17))
	_place(LowPolyScenery.bench(), Vector3(-5.5, 0, -6.3), 180.0)
	_place(LowPolyScenery.bench(), Vector3(6.5, 0, -6.3), 180.0)
	_place(LowPolyScenery.lamp(), Vector3(-1.8, 0, -6.4))
	_place(LowPolyScenery.lamp(), Vector3(4.6, 0, -6.4))
	_place(LowPolyScenery.bin(), Vector3(2.0, 0, -6.2))
	_place(LowPolyScenery.sign_post(), Vector3(-6.8, 0, -2.0), 180.0)
	_place(LowPolyScenery.hotdog_cart(), Vector3(8.5, 0, -3.2), 180.0)
	_place(LowPolyScenery.bush(), Vector3(-7.5, 0, -3.0))
	_place(LowPolyScenery.bush(), Vector3(11, 0, -5.5))
	# the elephant neighbour, far left behind the bars
	_place(LowPolyAnimals.elephant(), Vector3(-9.5, 0, -2.5), 20.0)


func _build_props() -> void:
	var specs: Array = [
		["banana", Vector3(-1.3, 0.3, 1.6)],
		["banana", Vector3(1.5, 0.3, 0.9)],
		["banana", Vector3(-2.3, 0.3, 3.5)],
		["ball", Vector3(1.0, 0.3, 0.5)],
		["ball_blue", Vector3(-1.9, 0.3, 0.6)],
		["watermelon", Vector3(2.0, 0.4, 3.2)],
		["duck", Vector3(-0.4, 0.3, 3.4)],
		["soda", Vector3(0.9, 0.3, 4.2)],
		["durian", Vector3(-3.8, 0.4, 3.0)],
		["coconut", Vector3(3.8, 0.3, 2.2)],
		["phone", Vector3(0.0, 0.3, 4.6)],
	]
	for s: Array in specs:
		var rb: RigidBody3D = RigidBody3D.new()
		rb.name = s[0]
		rb.add_to_group(&"grabbable")
		rb.add_child(LowPolyProps.build(s[0]))
		var col: CollisionShape3D = CollisionShape3D.new()
		col.shape = LowPolyProps.collision_for(s[0])
		rb.add_child(col)
		rb.position = s[1]
		add_child(rb)


func _build_visitors() -> void:
	# Visitors face the cage (+Z). They do not move yet.
	var spots: Array = [
		["tourist", Vector3(-2.6, 0, -2.4)],
		["kid", Vector3(-0.1, 0, -2.0)],
		["grandma", Vector3(1.6, 0, -3.1)],
		["teen", Vector3(3.6, 0, -2.5)],
		["burger", Vector3(5.6, 0, -3.5)],
		["ranger", Vector3(-4.8, 0, -4.2)],
		["keeper", Vector3(0.6, 0, -5.6)],
	]
	for s: Array in spots:
		var f: Node3D = LowPolyFigure.build(s[0])
		f.scale *= 1.15
		_place(f, s[1])
