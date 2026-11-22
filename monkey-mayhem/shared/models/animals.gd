class_name LowPolyAnimals
extends RefCounted
## Zoo animals (faces forward = +Z). Only the elephant (the monkey's neighbour) so far.


static func elephant() -> Node3D:
	var n: Node3D = Node3D.new()
	var grey: Color = Color(0.58, 0.6, 0.72)
	var pink: Color = Color(0.95, 0.6, 0.65)
	LowPoly.sphere(n, 1.3, grey, Vector3(0, 1.9, -0.3), Vector3(1.0, 0.95, 1.25), 9, 6)
	for p: Vector3 in [Vector3(-0.7, 0.55, 0.5), Vector3(0.7, 0.55, 0.5), Vector3(-0.7, 0.55, -1.0), Vector3(0.7, 0.55, -1.0)]:
		LowPoly.cyl(n, 0.34, 0.38, 1.1, grey, p, Vector3.ZERO, 8)
		LowPoly.cyl(n, 0.36, 0.36, 0.14, Color(0.95, 0.88, 0.7), p + Vector3(0, -0.5, 0.0), Vector3.ZERO, 8)
	LowPoly.sphere(n, 0.85, grey, Vector3(0, 2.3, 1.25), Vector3(1, 1.0, 1.0), 9, 6)
	for s: float in [-1.0, 1.0]:
		LowPoly.sphere(n, 0.8, grey, Vector3(s * 1.1, 2.4, 1.0), Vector3(0.25, 1.0, 0.9), 8, 5)
		LowPoly.sphere(n, 0.62, pink, Vector3(s * 1.2, 2.4, 1.0), Vector3(0.2, 0.9, 0.8), 8, 5)
		LowPoly.sphere(n, 0.11, Color(0.15, 0.1, 0.15), Vector3(s * 0.3, 2.55, 2.0), Vector3.ONE, 6, 4)
		LowPoly.sphere(n, 0.04, Color.WHITE, Vector3(s * 0.3 + 0.03, 2.6, 2.08), Vector3.ONE, 4, 3)
		LowPoly.cyl(n, 0.0, 0.1, 0.7, Color(0.97, 0.92, 0.78), Vector3(s * 0.45, 1.6, 2.0), Vector3(-70, 0, s * 10.0), 6)
		LowPoly.box(n, Vector3(0.3, 0.05, 0.05), Color(0.2, 0.12, 0.15), Vector3(s * 0.3, 2.78, 2.05), Vector3(0, 0, s * -20.0))
	# trunk
	for i: int in 5:
		var t: float = float(i) / 4.0
		LowPoly.capsule(n, 0.2 - t * 0.06, 0.4, grey, Vector3(0, 2.1 - t * 0.95, 2.05 + t * 0.2), Vector3(0, 0, 0))
	LowPoly.sphere(n, 0.1, grey, Vector3(0, 1.1, 2.25), Vector3.ONE, 6, 3)
	LowPoly.cyl(n, 0.0, 0.14, 0.5, grey, Vector3(0.0, 1.9, -1.9), Vector3(-80, 0, 0), 6)  # tail
	return n
