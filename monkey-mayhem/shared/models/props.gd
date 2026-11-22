class_name LowPolyProps
extends RefCounted
## Low-poly props matching the ChatGPT prop sheets. Each returns a visual Node3D (origin = centre).
## `collision_for` gives a simple physics shape for grabbable props.

const YELLOW: Color = Color(1.0, 0.82, 0.15)
const BROWN: Color = Color(0.4, 0.25, 0.12)


static func build(name: String) -> Node3D:
	var n: Node3D = Node3D.new()
	n.name = name
	match name:
		"banana": _banana(n)
		"ball": LowPoly.sphere(n, 0.26, Color(0.93, 0.22, 0.24), Vector3.ZERO, Vector3.ONE, 9, 6)
		"ball_blue": LowPoly.sphere(n, 0.26, Color(0.2, 0.5, 0.95), Vector3.ZERO, Vector3.ONE, 9, 6)
		"watermelon": _watermelon(n)
		"durian": _durian(n)
		"soda": _soda(n)
		"duck": _duck(n)
		"coconut": _coconut(n)
		"phone": _phone(n)
		"burger": _burger(n)
		"icecream": _icecream(n)
		_: LowPoly.box(n, Vector3(0.3, 0.3, 0.3), Color.MAGENTA)
	return n


static func collision_for(name: String) -> Shape3D:
	match name:
		"banana":
			var b: BoxShape3D = BoxShape3D.new()
			b.size = Vector3(0.6, 0.2, 0.2)
			return b
		"soda":
			var c: CylinderShape3D = CylinderShape3D.new()
			c.radius = 0.12
			c.height = 0.36
			return c
		"phone":
			var p: BoxShape3D = BoxShape3D.new()
			p.size = Vector3(0.2, 0.36, 0.05)
			return p
		"watermelon", "durian":
			var s: SphereShape3D = SphereShape3D.new()
			s.radius = 0.33
			return s
		_:
			var d: SphereShape3D = SphereShape3D.new()
			d.radius = 0.26
			return d


static func _banana(n: Node3D) -> void:
	# a curved chain of capsules
	var count: int = 6
	for i: int in count:
		var t: float = float(i) / float(count - 1)
		var ang: float = lerpf(-0.9, 0.9, t)
		var p: Vector3 = Vector3(sin(ang) * 0.36, (1.0 - cos(ang)) * 0.36 - 0.06, 0.0)
		var thick: float = 0.07 - absf(t - 0.5) * 0.03
		LowPoly.capsule(n, thick, 0.2, YELLOW, p, Vector3(0, 0, -rad_to_deg(ang)))
	LowPoly.cyl(n, 0.035, 0.045, 0.06, BROWN, Vector3(sin(-0.95) * 0.36 - 0.02, (1.0 - cos(-0.95)) * 0.36 - 0.02, 0.0), Vector3(0, 0, 55), 6)
	LowPoly.cyl(n, 0.035, 0.045, 0.06, BROWN, Vector3(sin(0.95) * 0.36 + 0.02, (1.0 - cos(0.95)) * 0.36 - 0.02, 0.0), Vector3(0, 0, -55), 6)


static func _watermelon(n: Node3D) -> void:
	var img: Image = Image.create(64, 8, false, Image.FORMAT_RGBA8)
	for x: int in 64:
		var dark: bool = (x / 4) % 2 == 0
		for y: int in 8:
			img.set_pixel(x, y, Color(0.12, 0.45, 0.16) if dark else Color(0.45, 0.78, 0.2))
	LowPoly.sphere(n, 0.33, Color.WHITE, Vector3.ZERO, Vector3(1, 0.95, 1), 12, 8, ImageTexture.create_from_image(img))
	LowPoly.cyl(n, 0.02, 0.04, 0.1, Color(0.3, 0.55, 0.15), Vector3(0, 0.33, 0), Vector3.ZERO, 5)


static func _durian(n: Node3D) -> void:
	var col: Color = Color(0.72, 0.78, 0.2)
	LowPoly.sphere(n, 0.28, col, Vector3.ZERO, Vector3(1, 1, 1), 9, 6)
	var count: int = 30
	var golden: float = PI * (3.0 - sqrt(5.0))
	for i: int in count:
		var y: float = 1.0 - (float(i) / float(count - 1)) * 2.0
		var r: float = sqrt(1.0 - y * y)
		var th: float = golden * i
		var dir: Vector3 = Vector3(cos(th) * r, y, sin(th) * r)
		var sp: MeshInstance3D = LowPoly.cyl(n, 0.0, 0.07, 0.14, Color(0.55, 0.65, 0.15), dir * 0.32, Vector3.ZERO, 5)
		sp.basis = Basis.looking_at(-dir, Vector3.UP) * Basis(Vector3.RIGHT, deg_to_rad(90.0))
		sp.position = dir * 0.32
	LowPoly.cyl(n, 0.03, 0.04, 0.12, BROWN, Vector3(0, 0.36, 0), Vector3.ZERO, 5)


static func _soda(n: Node3D) -> void:
	LowPoly.cyl(n, 0.12, 0.12, 0.34, Color(0.9, 0.15, 0.18), Vector3.ZERO, Vector3.ZERO, 10)
	LowPoly.cyl(n, 0.1, 0.12, 0.03, Color(0.8, 0.8, 0.85), Vector3(0, 0.185, 0), Vector3.ZERO, 10)
	LowPoly.cyl(n, 0.125, 0.125, 0.06, Color(0.96, 0.96, 0.96), Vector3(0, 0.0, 0), Vector3.ZERO, 10)
	LowPoly.cyl(n, 0.12, 0.12, 0.02, Color(0.8, 0.8, 0.85), Vector3(0, -0.175, 0), Vector3.ZERO, 10)


static func _duck(n: Node3D) -> void:
	var y: Color = Color(1.0, 0.85, 0.15)
	LowPoly.sphere(n, 0.24, y, Vector3(0, -0.02, 0), Vector3(1.0, 0.85, 1.15), 9, 5)
	LowPoly.sphere(n, 0.16, y, Vector3(0, 0.22, 0.12), Vector3.ONE, 9, 5)
	LowPoly.box(n, Vector3(0.14, 0.04, 0.1), Color(1.0, 0.5, 0.1), Vector3(0, 0.2, 0.28))
	for s: float in [-1.0, 1.0]:
		LowPoly.sphere(n, 0.025, LowPoly.INK, Vector3(s * 0.07, 0.27, 0.25), Vector3.ONE, 5, 3)
		LowPoly.sphere(n, 0.1, y, Vector3(s * 0.2, 0.0, -0.02), Vector3(0.5, 0.7, 1.0), 6, 4)
	LowPoly.sphere(n, 0.08, y, Vector3(0, 0.05, -0.26), Vector3.ONE, 6, 4)


static func _coconut(n: Node3D) -> void:
	LowPoly.sphere(n, 0.26, Color(0.5, 0.33, 0.18), Vector3.ZERO, Vector3.ONE, 9, 6)
	LowPoly.cyl(n, 0.015, 0.015, 0.3, Color(0.3, 0.7, 1.0), Vector3(0.08, 0.35, 0), Vector3(0, 0, -20), 4)
	LowPoly.sphere(n, 0.07, Color(1.0, 0.45, 0.6), Vector3(-0.12, 0.2, 0.15), Vector3(1, 0.5, 1), 6, 3)


static func _phone(n: Node3D) -> void:
	LowPoly.box(n, Vector3(0.2, 0.36, 0.05), Color(0.35, 0.3, 0.55))
	LowPoly.box(n, Vector3(0.17, 0.31, 0.01), Color(0.3, 0.7, 1.0), Vector3(0, 0, 0.028))


static func _burger(n: Node3D) -> void:
	LowPoly.cyl(n, 0.2, 0.2, 0.07, Color(0.92, 0.62, 0.25), Vector3(0, -0.12, 0), Vector3.ZERO, 9)
	LowPoly.cyl(n, 0.22, 0.22, 0.04, Color(0.5, 0.8, 0.2), Vector3(0, -0.06, 0), Vector3.ZERO, 9)
	LowPoly.cyl(n, 0.21, 0.21, 0.04, Color(0.95, 0.25, 0.2), Vector3(0, -0.02, 0), Vector3.ZERO, 9)
	LowPoly.cyl(n, 0.2, 0.2, 0.07, Color(0.35, 0.2, 0.12), Vector3(0, 0.03, 0), Vector3.ZERO, 9)
	LowPoly.sphere(n, 0.21, Color(0.92, 0.62, 0.25), Vector3(0, 0.1, 0), Vector3(1, 0.6, 1), 9, 4)


static func _icecream(n: Node3D) -> void:
	LowPoly.cyl(n, 0.12, 0.0, 0.3, Color(0.9, 0.62, 0.25), Vector3(0, -0.15, 0), Vector3.ZERO, 7)
	LowPoly.sphere(n, 0.14, Color(0.98, 0.9, 0.7), Vector3(0, 0.05, 0), Vector3.ONE, 8, 5)
	LowPoly.sphere(n, 0.13, Color(1.0, 0.5, 0.7), Vector3(0, 0.2, 0), Vector3.ONE, 8, 5)
