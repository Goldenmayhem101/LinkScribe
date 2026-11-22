extends Node3D
## First-person monkey arms in the low-poly style: furry forearm, tan palm, chunky fingers.

const FUR: Color = Color(0.42, 0.26, 0.13)
const PALM: Color = Color(0.9, 0.7, 0.5)


func _ready() -> void:
	_build_arm(-1.0)
	_build_arm(1.0)


func _build_arm(side: float) -> void:
	var arm: Node3D = Node3D.new()
	arm.position = Vector3(side * 0.42, -0.42, -0.62)
	arm.rotation_degrees = Vector3(0.0, side * -8.0, 0.0)
	add_child(arm)
	# forearm comes in from below-outside
	LowPoly.capsule(arm, 0.075, 0.85, FUR, Vector3(side * 0.12, -0.14, 0.32), Vector3(-72.0, 0.0, side * -8.0))
	# hand
	LowPoly.sphere(arm, 0.095, PALM, Vector3(0, 0.0, -0.06), Vector3(1.1, 0.6, 1.1), 8, 5)
	for i: int in 4:
		var fx: float = (float(i) - 1.5) * 0.05
		LowPoly.capsule(arm, 0.026, 0.13, FUR, Vector3(fx, 0.02, -0.19), Vector3(-82.0, 0.0, 0.0))
	LowPoly.capsule(arm, 0.028, 0.12, FUR, Vector3(-side * 0.13, 0.0, -0.1), Vector3(-70.0, side * -45.0, 0.0))
