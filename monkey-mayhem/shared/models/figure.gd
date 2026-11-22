class_name LowPolyFigure
extends RefCounted
## Builds chunky low-poly people (visitors, zookeepers) in code, styled after the ChatGPT sheets.
## Figures face +Z. Presets below match the delivered reference sheets.

const PRESETS: Dictionary = {
	"kid": {"skin": "f0c8a0", "shirt": "f2c21b", "pants": "1d1d2e", "shoes": "f2c21b", "hair": "6a3f22", "hat": "hood", "hat_color": "f2c21b", "held": "balloon", "pack": "3c5aa6", "scale": 0.72, "width": 0.95},
	"tourist": {"skin": "f1b98c", "shirt": "d63a2f", "pants": "c9b27a", "shoes": "222222", "hair": "4a2f1c", "hat": "bucket", "hat_color": "efe3c0", "held": "camera", "pack": "55633a", "beard": "4a2f1c", "scale": 1.0, "width": 1.15, "dots": true},
	"grandma": {"skin": "f3c5a8", "shirt": "a97bd1", "pants": "6b3f98", "shoes": "7a4a2a", "hair": "b9b9c0", "hat": "none", "held": "umbrella", "scale": 0.9, "width": 1.0, "puffy": true},
	"teen": {"skin": "c98d5f", "shirt": "efe3c0", "pants": "5b3b8c", "shoes": "7a4fd0", "hair": "3a2350", "hat": "phones", "hat_color": "f08a2c", "held": "selfie", "pack": "7a4fd0", "scale": 0.95, "width": 0.95, "spiky": true},
	"burger": {"skin": "e8b48a", "shirt": "5a86c9", "pants": "c9b27a", "shoes": "d63a2f", "hair": "4a2f1c", "hat": "cap", "hat_color": "d63a2f", "held": "burger", "scale": 1.0, "width": 1.5, "pack": "7a4a2a"},
	"ranger": {"skin": "f0c8a0", "shirt": "c2a66a", "pants": "5b6330", "shoes": "5a3a22", "hair": "3a2418", "hat": "safari", "hat_color": "b39a63", "held": "rifle", "scale": 1.05, "width": 1.05, "face": "angry"},
	"keeper": {"skin": "e8b48a", "shirt": "c2a66a", "pants": "5b6330", "shoes": "5a3a22", "hair": "3a2418", "hat": "safari", "hat_color": "b39a63", "held": "none", "scale": 1.1, "width": 1.35, "face": "angry", "mustache": true},
}


static func build(preset: String) -> Node3D:
	var cfg: Dictionary = PRESETS[preset]
	var root: Node3D = Node3D.new()
	root.name = preset.capitalize()
	var body: Node3D = Node3D.new()
	root.add_child(body)
	var skin: Color = Color(cfg["skin"])
	var shirt: Color = Color(cfg["shirt"])
	var pants: Color = Color(cfg["pants"])
	var wd: float = cfg.get("width", 1.0)

	# legs and shoes
	for s: float in [-1.0, 1.0]:
		LowPoly.cyl(body, 0.13 * wd, 0.15 * wd, 0.62, pants, Vector3(s * 0.15 * wd, 0.42, 0.0))
		LowPoly.sphere(body, 0.17, Color(cfg["shoes"]), Vector3(s * 0.15 * wd, 0.1, 0.06), Vector3(wd, 0.6, 1.4))
	# torso
	var torso_tex: Texture2D = _dots_texture(shirt) if cfg.get("dots", false) else null
	LowPoly.cyl(body, 0.3 * wd, 0.34 * wd, 0.7, shirt, Vector3(0, 1.08, 0), Vector3.ZERO, 8, torso_tex)
	# arms (slightly out) and hands
	for s: float in [-1.0, 1.0]:
		LowPoly.capsule(body, 0.09, 0.62, shirt, Vector3(s * (0.4 * wd + 0.05), 1.05, 0.0), Vector3(0, 0, -s * 12.0))
		LowPoly.sphere(body, 0.1, skin, Vector3(s * (0.5 * wd + 0.05), 0.72, 0.04), Vector3.ONE, 7, 4)
	# head
	LowPoly.sphere(body, 0.32, skin, Vector3(0, 1.72, 0), Vector3(1.0, 0.95, 0.95), 10, 7)
	var face: String = cfg.get("face", "happy")
	LowPoly.face_quad(body, LowPoly.face_texture(face), Vector3(0, 1.7, 0.305), Vector2(0.46, 0.29))
	for s: float in [-1.0, 1.0]:
		LowPoly.sphere(body, 0.07, skin, Vector3(s * 0.32, 1.7, 0.0), Vector3(0.6, 1.0, 0.8), 6, 4)  # ears
	if cfg.has("beard"):
		LowPoly.sphere(body, 0.27, Color(cfg["beard"]), Vector3(0, 1.58, 0.02), Vector3(1.0, 0.8, 0.95), 9, 5)
		LowPoly.face_quad(body, LowPoly.face_texture(face), Vector3(0, 1.74, 0.318), Vector2(0.46, 0.29))
	if cfg.get("mustache", false):
		LowPoly.sphere(body, 0.09, Color(0.2, 0.12, 0.08), Vector3(-0.07, 1.63, 0.3), Vector3(1.6, 0.6, 0.7), 6, 4)
		LowPoly.sphere(body, 0.09, Color(0.2, 0.12, 0.08), Vector3(0.07, 1.63, 0.3), Vector3(1.6, 0.6, 0.7), 6, 4)
	_hair_and_hat(body, cfg)
	_held(body, cfg, skin)
	if cfg.has("pack"):
		LowPoly.box(body, Vector3(0.4 * wd, 0.5, 0.2), Color(cfg["pack"]), Vector3(0, 1.1, -0.34))
	root.scale = Vector3.ONE * float(cfg.get("scale", 1.0))
	return root


static func _hair_and_hat(body: Node3D, cfg: Dictionary) -> void:
	var hair: Color = Color(cfg["hair"])
	var hat: String = cfg.get("hat", "none")
	var hc: Color = Color(cfg.get("hat_color", "ffffff"))
	if cfg.get("puffy", false):
		for p: Vector3 in [Vector3(0, 1.92, -0.04), Vector3(-0.22, 1.82, -0.05), Vector3(0.22, 1.82, -0.05), Vector3(-0.14, 1.95, 0.0), Vector3(0.14, 1.95, 0.0)]:
			LowPoly.sphere(body, 0.17, hair, p, Vector3.ONE, 7, 4)
	elif cfg.get("spiky", false):
		LowPoly.sphere(body, 0.33, hair, Vector3(0, 1.8, -0.07), Vector3(1.0, 0.8, 1.0), 9, 5)
		for a: float in [-0.25, -0.1, 0.05, 0.2, 0.3]:
			LowPoly.cyl(body, 0.0, 0.07, 0.22, hair, Vector3(a, 2.07, -0.05 + absf(a) * 0.1), Vector3(0, 0, -a * 70.0), 5)
	elif hat != "hood":
		LowPoly.sphere(body, 0.33, hair, Vector3(0, 1.82, -0.07), Vector3(1.0, 0.75, 1.0), 9, 5)
	match hat:
		"bucket":
			LowPoly.cyl(body, 0.26, 0.3, 0.2, hc, Vector3(0, 2.0, 0.0))
			LowPoly.cyl(body, 0.46, 0.48, 0.05, hc, Vector3(0, 1.93, 0.02), Vector3.ZERO, 10)
		"safari":
			LowPoly.cyl(body, 0.22, 0.3, 0.2, hc, Vector3(0, 2.02, 0.0))
			LowPoly.cyl(body, 0.52, 0.54, 0.05, hc, Vector3(0, 1.93, 0.02), Vector3.ZERO, 10)
			LowPoly.cyl(body, 0.31, 0.31, 0.05, Color(0.25, 0.2, 0.12), Vector3(0, 1.96, 0.0))
		"cap":
			LowPoly.sphere(body, 0.34, hc, Vector3(0, 1.84, -0.03), Vector3(1.0, 0.7, 1.0), 9, 5)
			LowPoly.box(body, Vector3(0.4, 0.04, 0.3), hc, Vector3(0, 1.84, 0.34))
		"hood":
			LowPoly.sphere(body, 0.4, hc, Vector3(0, 1.74, -0.1), Vector3(1.0, 1.0, 1.0), 9, 6)
			LowPoly.sphere(body, 0.34, Color(cfg["skin"]), Vector3(0, 1.72, 0.1), Vector3(1.0, 0.95, 0.9), 10, 7)
			LowPoly.face_quad(body, LowPoly.face_texture("happy"), Vector3(0, 1.7, 0.4), Vector2(0.46, 0.29))
		"phones":
			LowPoly.cyl(body, 0.06, 0.06, 0.06, hc, Vector3(-0.34, 1.72, 0.0), Vector3(0, 0, 90), 7)
			LowPoly.cyl(body, 0.06, 0.06, 0.06, hc, Vector3(0.34, 1.72, 0.0), Vector3(0, 0, 90), 7)
			LowPoly.box(body, Vector3(0.7, 0.06, 0.08), Color(0.15, 0.1, 0.2), Vector3(0, 2.0, 0.0))


static func _held(body: Node3D, cfg: Dictionary, skin: Color) -> void:
	var held: String = cfg.get("held", "none")
	var hand: Vector3 = Vector3(0.55, 0.78, 0.15)
	match held:
		"balloon":
			LowPoly.cyl(body, 0.012, 0.012, 1.0, Color(0.15, 0.1, 0.2), hand + Vector3(0, 0.5, 0), Vector3.ZERO, 4)
			LowPoly.sphere(body, 0.26, Color(0.92, 0.2, 0.22), hand + Vector3(0, 1.2, 0), Vector3(1, 1.15, 1), 9, 6)
		"camera":
			LowPoly.box(body, Vector3(0.34, 0.24, 0.2), Color(0.18, 0.18, 0.22), Vector3(0, 1.0, 0.36))
			LowPoly.cyl(body, 0.09, 0.09, 0.12, Color(0.12, 0.35, 0.8), Vector3(0, 1.0, 0.5), Vector3(90, 0, 0), 8)
		"burger":
			var p: Vector3 = Vector3(-0.45, 0.95, 0.3)
			LowPoly.cyl(body, 0.2, 0.2, 0.08, Color(0.9, 0.62, 0.25), p + Vector3(0, -0.12, 0), Vector3.ZERO, 9)
			LowPoly.cyl(body, 0.21, 0.21, 0.05, Color(0.5, 0.78, 0.2), p + Vector3(0, -0.06, 0), Vector3.ZERO, 9)
			LowPoly.cyl(body, 0.2, 0.2, 0.07, Color(0.35, 0.2, 0.12), p + Vector3(0, 0.0, 0), Vector3.ZERO, 9)
			LowPoly.sphere(body, 0.21, Color(0.92, 0.62, 0.25), p + Vector3(0, 0.07, 0), Vector3(1, 0.55, 1), 9, 4)
		"umbrella":
			LowPoly.cyl(body, 0.015, 0.015, 1.3, Color(0.35, 0.2, 0.1), hand + Vector3(0, 0.55, 0), Vector3.ZERO, 4)
			LowPoly.cyl(body, 0.0, 0.62, 0.3, Color(0.66, 0.4, 0.85), hand + Vector3(0, 1.25, 0), Vector3.ZERO, 9)
		"selfie":
			LowPoly.cyl(body, 0.014, 0.014, 0.9, Color(0.12, 0.1, 0.15), hand + Vector3(0, 0.45, 0), Vector3.ZERO, 4)
			LowPoly.box(body, Vector3(0.16, 0.26, 0.04), Color(0.55, 0.35, 0.85), hand + Vector3(0, 1.0, 0))
			LowPoly.box(body, Vector3(0.12, 0.2, 0.01), Color(0.35, 0.75, 1.0), hand + Vector3(0, 1.0, 0.03), Vector3.ZERO)
		"rifle":
			LowPoly.box(body, Vector3(0.1, 0.12, 0.8), Color(0.3, 0.4, 0.22), Vector3(0.28, 1.0, 0.4))
			LowPoly.cyl(body, 0.03, 0.03, 0.3, Color(0.15, 0.15, 0.18), Vector3(0.28, 1.13, 0.4), Vector3(90, 0, 0), 6)
			LowPoly.cyl(body, 0.0, 0.03, 0.12, Color(0.92, 0.4, 0.6), Vector3(0.28, 1.0, 0.86), Vector3(90, 0, 0), 5)


static func _dots_texture(base: Color) -> ImageTexture:
	var img: Image = Image.create(64, 64, false, Image.FORMAT_RGBA8)
	img.fill(base)
	for p: Vector2i in [Vector2i(10, 10), Vector2i(40, 6), Vector2i(26, 30), Vector2i(52, 36), Vector2i(8, 48), Vector2i(34, 56)]:
		for y: int in range(-4, 5):
			for x: int in range(-4, 5):
				if x * x + y * y <= 16:
					img.set_pixel(clampi(p.x + x, 0, 63), clampi(p.y + y, 0, 63), Color(0.98, 0.92, 0.7))
	return ImageTexture.create_from_image(img)
