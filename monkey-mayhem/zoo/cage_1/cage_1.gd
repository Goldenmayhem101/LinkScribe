extends Node3D
## The first cage, built from plain placeholder shapes so the game can be played and judged
## before any art exists. Real low-poly models replace these shapes later.

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

func _mat(color: Color) -> StandardMaterial3D:
	var m: StandardMaterial3D = StandardMaterial3D.new()
	m.albedo_color = color
	m.roughness = 0.85
	return m


func _static_box(pos: Vector3, size: Vector3, color: Color, groups: Array[StringName] = []) -> StaticBody3D:
	var body: StaticBody3D = StaticBody3D.new()
	var mesh: MeshInstance3D = MeshInstance3D.new()
	var box: BoxMesh = BoxMesh.new()
	box.size = size
	mesh.mesh = box
	mesh.material_override = _mat(color)
	body.add_child(mesh)
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
	var mesh: MeshInstance3D = MeshInstance3D.new()
	var cyl: CylinderMesh = CylinderMesh.new()
	cyl.top_radius = radius
	cyl.bottom_radius = radius
	cyl.height = height
	mesh.mesh = cyl
	mesh.material_override = _mat(color)
	body.add_child(mesh)
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
	sky_mat.sky_top_color = Color(0.35, 0.62, 0.95)
	sky_mat.sky_horizon_color = Color(0.75, 0.88, 1.0)
	sky.sky_material = sky_mat
	env.background_mode = Environment.BG_SKY
	env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	var we: WorldEnvironment = WorldEnvironment.new()
	we.environment = env
	add_child(we)

	var sun: DirectionalLight3D = DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-50.0, -35.0, 0.0)
	sun.light_energy = 1.2
	sun.shadow_enabled = true
	add_child(sun)


func _build_ground() -> void:
	_static_box(Vector3(0, -0.25, -10), Vector3(70, 0.5, 70), Color(0.45, 0.72, 0.38))
	_static_box(Vector3(0, -0.2, -5.5), Vector3(40, 0.5, 5), Color(0.82, 0.75, 0.6))  # visitor walkway


func _build_cage() -> void:
	var steel: Color = Color(0.2, 0.24, 0.3)
	var climb: Array[StringName] = [&"climbable"]
	# cage floor (dirt) inside the bars
	_static_box(Vector3(0, -0.05, 2.4), Vector3(9, 0.1, 5.2), Color(0.7, 0.52, 0.33))
	# front bars (the visitors look through these), top and bottom rails
	var x: float = -4.4
	while x <= 4.45:
		_static_cylinder(Vector3(x, 1.7, 0.0), 0.05, 3.4, steel, climb)
		x += 0.44
	_static_box(Vector3(0, 3.4, 0), Vector3(9.2, 0.12, 0.12), steel)
	_static_box(Vector3(0, 0.45, 0), Vector3(9.2, 0.1, 0.1), steel)
	# side and back walls (solid) and a roof of bars
	_static_box(Vector3(-4.6, 1.7, 2.5), Vector3(0.2, 3.4, 5.2), Color(0.5, 0.52, 0.56))
	_static_box(Vector3(4.6, 1.7, 2.5), Vector3(0.2, 3.4, 5.2), Color(0.5, 0.52, 0.56))
	_static_box(Vector3(0, 1.7, 5.1), Vector3(9.2, 3.4, 0.2), Color(0.5, 0.52, 0.56))
	var z: float = 0.4
	while z <= 5.0:
		_static_box(Vector3(0, 3.4, z), Vector3(9.2, 0.08, 0.08), steel)
		z += 0.8
	# rocks and a climbing rope
	_static_box(Vector3(-3.0, 0.45, 2.0), Vector3(1.4, 0.9, 1.2), Color(0.56, 0.53, 0.5))
	_static_box(Vector3(-2.1, 0.25, 3.2), Vector3(0.9, 0.5, 0.8), Color(0.5, 0.47, 0.44))
	_static_cylinder(Vector3(2.8, 1.8, 1.4), 0.07, 3.2, Color(0.7, 0.55, 0.32), climb)


func _build_scenery() -> void:
	var trunk: Color = Color(0.45, 0.3, 0.18)
	var leaf: Color = Color(0.24, 0.6, 0.3)
	for p: Vector3 in [Vector3(-9, 0, -9), Vector3(-4, 0, -12), Vector3(6, 0, -10), Vector3(10, 0, -8), Vector3(0, 0, -15), Vector3(13, 0, -13)]:
		_static_cylinder(p + Vector3(0, 1.1, 0), 0.3, 2.2, trunk)
		var crown: MeshInstance3D = MeshInstance3D.new()
		var s: SphereMesh = SphereMesh.new()
		s.radius = 1.8
		s.height = 3.4
		crown.mesh = s
		crown.material_override = _mat(leaf)
		crown.position = p + Vector3(0, 3.5, 0)
		add_child(crown)


func _build_props() -> void:
	# Placeholder props. They are in the "grabbable" group ready for the grab step.
	var specs: Array = [
		[Vector3(-1.3, 0.3, 1.6), Color(1.0, 0.85, 0.2), "banana"],
		[Vector3(1.4, 0.3, 0.9), Color(1.0, 0.85, 0.2), "banana"],
		[Vector3(1.0, 0.3, 0.5), Color(0.88, 0.27, 0.23), "ball"],
		[Vector3(-1.9, 0.3, 0.6), Color(0.23, 0.55, 0.88), "ball"],
	]
	for s: Array in specs:
		var rb: RigidBody3D = RigidBody3D.new()
		rb.name = s[2]
		rb.add_to_group(&"grabbable")
		var mesh: MeshInstance3D = MeshInstance3D.new()
		var col: CollisionShape3D = CollisionShape3D.new()
		if s[2] == "banana":
			var bm: CapsuleMesh = CapsuleMesh.new()
			bm.radius = 0.09
			bm.height = 0.5
			mesh.mesh = bm
			mesh.rotation_degrees = Vector3(0, 0, 90)
			var bs: BoxShape3D = BoxShape3D.new()
			bs.size = Vector3(0.5, 0.18, 0.18)
			col.shape = bs
		else:
			var sm: SphereMesh = SphereMesh.new()
			sm.radius = 0.25
			sm.height = 0.5
			mesh.mesh = sm
			var ss: SphereShape3D = SphereShape3D.new()
			ss.radius = 0.25
			col.shape = ss
		mesh.material_override = _mat(s[1])
		rb.add_child(mesh)
		rb.add_child(col)
		rb.position = s[0]
		add_child(rb)


func _build_visitors() -> void:
	# Plain capsule stand-ins for the visitors (they do not move yet).
	var shirts: Array[Color] = [Color(0.88, 0.29, 0.29), Color(0.23, 0.63, 0.88), Color(0.88, 0.63, 0.19), Color(0.61, 0.35, 0.71), Color(0.18, 0.8, 0.44)]
	var spots: Array[Vector3] = [Vector3(-2.6, 0, -2.2), Vector3(0.9, 0, -3.4), Vector3(3.3, 0, -2.6), Vector3(-0.6, 0, -5.6), Vector3(5.2, 0, -4.8)]
	for i: int in spots.size():
		var v: Node3D = Node3D.new()
		var body: MeshInstance3D = MeshInstance3D.new()
		var cm: CapsuleMesh = CapsuleMesh.new()
		cm.radius = 0.3
		cm.height = 1.5
		body.mesh = cm
		body.material_override = _mat(shirts[i])
		body.position = Vector3(0, 0.85, 0)
		v.add_child(body)
		var head: MeshInstance3D = MeshInstance3D.new()
		var hm: SphereMesh = SphereMesh.new()
		hm.radius = 0.25
		hm.height = 0.5
		head.mesh = hm
		head.material_override = _mat(Color(0.95, 0.8, 0.65))
		head.position = Vector3(0, 1.85, 0)
		v.add_child(head)
		v.position = spots[i]
		add_child(v)
