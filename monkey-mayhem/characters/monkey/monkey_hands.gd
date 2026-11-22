extends Node3D
## Placeholder first-person monkey arms (plain shapes). Replaced by real low-poly hands later.

const FUR: Color = Color(0.42, 0.27, 0.14)
const PALM: Color = Color(0.85, 0.65, 0.48)


func _ready() -> void:
	_build_arm(-1.0)
	_build_arm(1.0)


func _build_arm(side: float) -> void:
	var arm_mat: StandardMaterial3D = StandardMaterial3D.new()
	arm_mat.albedo_color = FUR
	var palm_mat: StandardMaterial3D = StandardMaterial3D.new()
	palm_mat.albedo_color = PALM

	var arm: MeshInstance3D = MeshInstance3D.new()
	var cap: CapsuleMesh = CapsuleMesh.new()
	cap.radius = 0.08
	cap.height = 0.8
	arm.mesh = cap
	arm.material_override = arm_mat
	arm.position = Vector3(side * 0.45, -0.5, -0.55)
	arm.rotation_degrees = Vector3(-62.0, side * -12.0, 0.0)
	add_child(arm)

	var fist: MeshInstance3D = MeshInstance3D.new()
	var sph: SphereMesh = SphereMesh.new()
	sph.radius = 0.11
	sph.height = 0.2
	fist.mesh = sph
	fist.material_override = palm_mat
	fist.position = Vector3(side * 0.36, -0.3, -0.9)
	add_child(fist)
