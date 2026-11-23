class_name LowPoly
extends RefCounted
## Helpers that build chunky faceted ("low-poly") parts with a dark outline, matching the
## ChatGPT reference sheets in art/reference. Everything is built in code, no model files.

const INK: Color = Color(0.09, 0.06, 0.27)  # outline colour #170F45
static var _outline_mat: ShaderMaterial


static func outline() -> ShaderMaterial:
	if _outline_mat == null:
		var sh: Shader = Shader.new()
		sh.code = "shader_type spatial;\nrender_mode cull_front, unshaded;\nuniform float thick = 0.022;\nvoid vertex() { VERTEX += normalize(VERTEX) * thick; }\nvoid fragment() { ALBEDO = vec3(0.09, 0.06, 0.27); }\n"
		_outline_mat = ShaderMaterial.new()
		_outline_mat.shader = sh
	return _outline_mat


static func mat(color: Color, tex: Texture2D = null, outlined: bool = true) -> StandardMaterial3D:
	var m: StandardMaterial3D = StandardMaterial3D.new()
	m.albedo_color = color
	m.roughness = 0.55
	m.metallic = 0.0
	if tex != null:
		m.albedo_texture = tex
	if outlined:
		m.next_pass = outline()
	return m


## Turns a smooth mesh into flat-shaded facets (the low-poly look).
static func faceted(m: Mesh) -> ArrayMesh:
	var arr: Array = m.surface_get_arrays(0)
	var v: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
	var has_uv: bool = arr[Mesh.ARRAY_TEX_UV] != null
	var uv: PackedVector2Array = arr[Mesh.ARRAY_TEX_UV] if has_uv else PackedVector2Array()
	var idx: PackedInt32Array = PackedInt32Array()
	if arr[Mesh.ARRAY_INDEX] != null:
		idx = arr[Mesh.ARRAY_INDEX]
	else:
		for i: int in v.size():
			idx.append(i)
	var nv: PackedVector3Array = PackedVector3Array()
	var nn: PackedVector3Array = PackedVector3Array()
	var nuv: PackedVector2Array = PackedVector2Array()
	var i: int = 0
	while i + 2 < idx.size():
		var a: Vector3 = v[idx[i]]
		var b: Vector3 = v[idx[i + 1]]
		var c: Vector3 = v[idx[i + 2]]
		var n: Vector3 = (b - a).cross(c - a)
		if n.length() < 0.000001:
			i += 3
			continue
		n = n.normalized()
		var centroid: Vector3 = (a + b + c) / 3.0
		if n.dot(centroid) < 0.0:
			n = -n
		for k: int in 3:
			nv.append(v[idx[i + k]])
			nn.append(n)
			if has_uv:
				nuv.append(uv[idx[i + k]])
		i += 3
	var out: Array = []
	out.resize(Mesh.ARRAY_MAX)
	out[Mesh.ARRAY_VERTEX] = nv
	out[Mesh.ARRAY_NORMAL] = nn
	if has_uv:
		out[Mesh.ARRAY_TEX_UV] = nuv
	var res: ArrayMesh = ArrayMesh.new()
	res.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, out)
	return res


static func part(parent: Node3D, mesh: Mesh, color: Color, pos: Vector3 = Vector3.ZERO, rot_deg: Vector3 = Vector3.ZERO, scl: Vector3 = Vector3.ONE, tex: Texture2D = null, outlined: bool = true) -> MeshInstance3D:
	var mi: MeshInstance3D = MeshInstance3D.new()
	mi.mesh = faceted(mesh)
	mi.material_override = mat(color, tex, outlined)
	mi.position = pos
	mi.rotation_degrees = rot_deg
	mi.scale = scl
	parent.add_child(mi)
	return mi


static func sphere(parent: Node3D, r: float, color: Color, pos: Vector3 = Vector3.ZERO, scl: Vector3 = Vector3.ONE, segs: int = 9, rings: int = 5, tex: Texture2D = null) -> MeshInstance3D:
	var m: SphereMesh = SphereMesh.new()
	m.radius = r
	m.height = r * 2.0
	m.radial_segments = segs
	m.rings = rings
	return part(parent, m, color, pos, Vector3.ZERO, scl, tex)


static func box(parent: Node3D, size: Vector3, color: Color, pos: Vector3 = Vector3.ZERO, rot_deg: Vector3 = Vector3.ZERO) -> MeshInstance3D:
	var m: BoxMesh = BoxMesh.new()
	m.size = size
	return part(parent, m, color, pos, rot_deg)


static func cyl(parent: Node3D, top_r: float, bot_r: float, h: float, color: Color, pos: Vector3 = Vector3.ZERO, rot_deg: Vector3 = Vector3.ZERO, segs: int = 8, tex: Texture2D = null) -> MeshInstance3D:
	var m: CylinderMesh = CylinderMesh.new()
	m.top_radius = top_r
	m.bottom_radius = bot_r
	m.height = h
	m.radial_segments = segs
	m.rings = 1
	return part(parent, m, color, pos, rot_deg, Vector3.ONE, tex)


static func capsule(parent: Node3D, r: float, h: float, color: Color, pos: Vector3 = Vector3.ZERO, rot_deg: Vector3 = Vector3.ZERO, scl: Vector3 = Vector3.ONE) -> MeshInstance3D:
	var m: CapsuleMesh = CapsuleMesh.new()
	m.radius = r
	m.height = maxf(h, r * 2.0 + 0.001)
	m.radial_segments = 8
	m.rings = 3
	return part(parent, m, color, pos, rot_deg, scl)


## Cartoon face sticker (eyes and grin) drawn into a texture.
static func face_texture(kind: String = "happy") -> ImageTexture:
	var w: int = 160
	var h: int = 100
	var img: Image = Image.create(w, h, false, Image.FORMAT_RGBA8)
	img.fill(Color(0, 0, 0, 0))
	var ink: Color = Color(0.09, 0.06, 0.27)
	for side: int in [-1, 1]:
		var cx: float = 80.0 + side * 34.0
		_ellipse(img, Vector2(cx, 38), Vector2(11, 15), ink)
		_ellipse(img, Vector2(cx + 3, 32), Vector2(4, 5), Color.WHITE)
		if kind == "angry":
			for t: int in 22:
				var px: float = cx - side * 14.0 + side * t
				var py: float = 14.0 + (t * 0.45 if side == -1 else (22 - t) * 0.45) * 1.0
				_ellipse(img, Vector2(px, py), Vector2(2.5, 2.5), ink)
	if kind == "angry":
		for t: int in 40:
			var x: float = 62.0 + t
			_ellipse(img, Vector2(x, 78.0 - 8.0 * sin(float(t) / 40.0 * PI)), Vector2(2.6, 2.6), ink)
	else:
		for t: int in 50:
			var x: float = 55.0 + t * 1.0
			var y: float = 66.0 + 14.0 * sin(float(t) / 50.0 * PI)
			_ellipse(img, Vector2(x, y), Vector2(3, 3), ink)
		_ellipse(img, Vector2(80, 78), Vector2(14, 6), Color(0.85, 0.25, 0.3))
	_ellipse(img, Vector2(36, 62), Vector2(9, 6), Color(1, 0.55, 0.55, 0.55))
	_ellipse(img, Vector2(124, 62), Vector2(9, 6), Color(1, 0.55, 0.55, 0.55))
	return ImageTexture.create_from_image(img)


static func _ellipse(img: Image, c: Vector2, r: Vector2, col: Color) -> void:
	var x0: int = maxi(0, int(c.x - r.x - 1))
	var x1: int = mini(img.get_width() - 1, int(c.x + r.x + 1))
	var y0: int = maxi(0, int(c.y - r.y - 1))
	var y1: int = mini(img.get_height() - 1, int(c.y + r.y + 1))
	for y: int in range(y0, y1 + 1):
		for x: int in range(x0, x1 + 1):
			var dx: float = (float(x) - c.x) / r.x
			var dy: float = (float(y) - c.y) / r.y
			if dx * dx + dy * dy <= 1.0:
				img.set_pixel(x, y, col)


static func face_quad(parent: Node3D, tex: Texture2D, pos: Vector3, size: Vector2) -> MeshInstance3D:
	var q: QuadMesh = QuadMesh.new()
	q.size = size
	var m: StandardMaterial3D = StandardMaterial3D.new()
	m.albedo_texture = tex
	m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	m.cull_mode = BaseMaterial3D.CULL_DISABLED
	var mi: MeshInstance3D = MeshInstance3D.new()
	mi.mesh = q
	mi.material_override = m
	mi.position = pos
	parent.add_child(mi)
	return mi
