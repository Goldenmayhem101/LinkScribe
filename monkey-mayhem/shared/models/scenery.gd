class_name LowPolyScenery
extends RefCounted
## Zoo scenery in the same chunky style as the reference sheets.

const LEAF: Color = Color(0.45, 0.8, 0.18)
const LEAF_DARK: Color = Color(0.3, 0.65, 0.2)
const TRUNK: Color = Color(0.7, 0.42, 0.15)
const STEEL: Color = Color(0.32, 0.38, 0.46)
const GOLD: Color = Color(0.98, 0.78, 0.12)


static func tree(scale: float = 1.0) -> Node3D:
	var n: Node3D = Node3D.new()
	LowPoly.cyl(n, 0.28, 0.4, 1.8, TRUNK, Vector3(0, 0.9, 0), Vector3.ZERO, 7)
	for p: Array in [[Vector3(0, 2.7, 0), 1.2], [Vector3(-0.9, 2.3, 0.2), 0.85], [Vector3(0.9, 2.4, -0.1), 0.9], [Vector3(0.1, 3.2, 0.4), 0.8], [Vector3(-0.3, 2.5, -0.8), 0.8]]:
		LowPoly.sphere(n, p[1], LEAF if p[1] > 0.9 else LEAF_DARK, p[0], Vector3.ONE, 8, 5)
	n.scale = Vector3.ONE * scale
	return n


static func pine(scale: float = 1.0) -> Node3D:
	var n: Node3D = Node3D.new()
	LowPoly.cyl(n, 0.2, 0.28, 0.9, TRUNK, Vector3(0, 0.45, 0), Vector3.ZERO, 6)
	for i: int in 4:
		LowPoly.cyl(n, 0.0, 1.2 - i * 0.22, 1.0, Color(0.38, 0.72, 0.18), Vector3(0, 1.2 + i * 0.7, 0), Vector3.ZERO, 7)
	n.scale = Vector3.ONE * scale
	return n


static func bush() -> Node3D:
	var n: Node3D = Node3D.new()
	LowPoly.sphere(n, 0.6, LEAF, Vector3(0, 0.45, 0), Vector3(1.2, 0.9, 1.0), 8, 5)
	for p: Vector3 in [Vector3(-0.35, 0.7, 0.45), Vector3(0.3, 0.55, 0.5), Vector3(0.0, 0.9, 0.3)]:
		LowPoly.sphere(n, 0.09, Color(0.93, 0.2, 0.22), p, Vector3.ONE, 6, 3)
	return n


static func rock() -> Node3D:
	var n: Node3D = Node3D.new()
	LowPoly.sphere(n, 0.8, Color(0.62, 0.6, 0.62), Vector3(0, 0.45, 0), Vector3(1.2, 0.85, 1.0), 7, 5)
	LowPoly.sphere(n, 0.5, Color(0.55, 0.85, 0.2), Vector3(0, 0.95, 0.0), Vector3(1.1, 0.35, 0.9), 6, 3)
	LowPoly.sphere(n, 0.3, Color(0.58, 0.56, 0.58), Vector3(0.9, 0.2, 0.3), Vector3(1, 0.7, 1), 6, 4)
	return n


static func bench() -> Node3D:
	var n: Node3D = Node3D.new()
	var wood: Color = Color(0.9, 0.5, 0.15)
	for y: float in [0.5, 0.78, 1.0]:
		LowPoly.box(n, Vector3(1.6, 0.14, 0.06), wood, Vector3(0, y, -0.25 + (y - 0.5) * 0.1))
	LowPoly.box(n, Vector3(1.6, 0.08, 0.5), wood, Vector3(0, 0.46, 0))
	for s: float in [-1.0, 1.0]:
		LowPoly.box(n, Vector3(0.1, 0.46, 0.5), Color(0.35, 0.38, 0.48), Vector3(s * 0.75, 0.23, 0))
		LowPoly.box(n, Vector3(0.1, 0.4, 0.1), Color(0.35, 0.38, 0.48), Vector3(s * 0.75, 0.8, -0.26))
	return n


static func lamp() -> Node3D:
	var n: Node3D = Node3D.new()
	LowPoly.cyl(n, 0.2, 0.28, 0.2, Color(0.3, 0.34, 0.44), Vector3(0, 0.1, 0), Vector3.ZERO, 6)
	LowPoly.cyl(n, 0.07, 0.1, 2.0, Color(0.3, 0.34, 0.44), Vector3(0, 1.1, 0), Vector3.ZERO, 6)
	LowPoly.cyl(n, 0.22, 0.14, 0.4, Color(1.0, 0.88, 0.3), Vector3(0, 2.3, 0), Vector3.ZERO, 6)
	LowPoly.cyl(n, 0.0, 0.26, 0.2, Color(0.3, 0.34, 0.44), Vector3(0, 2.6, 0), Vector3.ZERO, 6)
	return n


static func bin() -> Node3D:
	var n: Node3D = Node3D.new()
	LowPoly.cyl(n, 0.4, 0.34, 0.85, Color(0.35, 0.72, 0.2), Vector3(0, 0.45, 0), Vector3.ZERO, 8)
	LowPoly.cyl(n, 0.42, 0.42, 0.14, Color(0.98, 0.78, 0.12), Vector3(0, 0.95, 0), Vector3.ZERO, 8)
	return n


static func sign_post() -> Node3D:
	var n: Node3D = Node3D.new()
	LowPoly.box(n, Vector3(0.12, 2.0, 0.12), Color(0.6, 0.36, 0.14), Vector3(0, 1.0, 0))
	for i: int in 3:
		var dir: float = -1.0 if i == 1 else 1.0
		LowPoly.box(n, Vector3(0.9, 0.24, 0.06), Color(0.92, 0.52, 0.16), Vector3(dir * 0.35, 1.9 - i * 0.32, 0.1))
	return n


static func hotdog_cart() -> Node3D:
	var n: Node3D = Node3D.new()
	var img: Image = Image.create(8, 2, false, Image.FORMAT_RGBA8)
	for x: int in 8:
		for y: int in 2:
			img.set_pixel(x, y, Color(0.9, 0.2, 0.2) if x % 2 == 0 else Color(0.98, 0.93, 0.8))
	LowPoly.box(n, Vector3(1.8, 0.8, 1.0), Color(0.85, 0.55, 0.15), Vector3(0, 0.75, 0))
	LowPoly.box(n, Vector3(1.9, 0.08, 1.1), Color(0.95, 0.7, 0.3), Vector3(0, 1.18, 0))
	for p: Vector3 in [Vector3(-0.85, 1.0, -0.45), Vector3(0.85, 1.0, -0.45), Vector3(-0.85, 1.0, 0.45), Vector3(0.85, 1.0, 0.45)]:
		LowPoly.box(n, Vector3(0.07, 1.0, 0.07), Color(0.95, 0.75, 0.4), Vector3(p.x, 1.6, p.z))
	LowPoly.cyl(n, 1.2, 1.35, 0.35, Color.WHITE, Vector3(0, 2.25, 0), Vector3.ZERO, 8, ImageTexture.create_from_image(img))
	LowPoly.capsule(n, 0.14, 0.9, Color(0.95, 0.65, 0.25), Vector3(0, 2.6, 0), Vector3(0, 0, 90))
	LowPoly.capsule(n, 0.05, 0.8, Color(1.0, 0.85, 0.1), Vector3(0, 2.72, 0), Vector3(0, 0, 90))
	for s: float in [-1.0, 1.0]:
		LowPoly.cyl(n, 0.28, 0.28, 0.12, Color(0.15, 0.15, 0.2), Vector3(s * 0.7, 0.28, 0.58), Vector3(90, 0, 0), 8)
	return n
