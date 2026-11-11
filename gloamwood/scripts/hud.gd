class_name Hud
extends Control
## Screen-space HUD + multi-touch controls, all drawn in code.

var main: Node
var pal: Dictionary
var coin_tex: Texture2D
var font: Font

var hearts = 3
var max_hearts = 3
var coins = 0
var bump = 0.0
var stage_label = ""
var progress = 0.0
var title = ""
var subtitle = ""
var title_t = 0.0
var fade = 0.0
var paused = false
var autoplay = false

# control state read by main
var move = 0.0
var jump_held = false
var jump_pressed = false
var fire_pressed = false
var fire_flash = 0.0
var jump_flash = 0.0

var touches = {}
var knob = Vector2.ZERO


func _ready() -> void:
	font = ThemeDB.fallback_font
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	process_mode = Node.PROCESS_MODE_ALWAYS


func _geom() -> Dictionary:
	var s = size
	return {
		"stick": Vector2(150, s.y - 200), "stick_r": 105.0,
		"jump": Vector2(s.x - 120, s.y - 160), "jump_r": 78.0,
		"fire": Vector2(s.x - 262, s.y - 245), "fire_r": 56.0,
		"pause": Vector2(s.x - 60, 62), "pause_r": 34.0,
	}


func show_title(t1: String, t2: String) -> void:
	title = t1
	subtitle = t2
	title_t = 2.8


func consume() -> void:
	jump_pressed = false
	fire_pressed = false


func _process(dt: float) -> void:
	position = Vector2.ZERO
	size = get_viewport_rect().size
	bump = maxf(bump - dt * 2.6, 0.0)
	title_t = maxf(title_t - dt, 0.0)
	fire_flash = maxf(fire_flash - dt * 4.0, 0.0)
	jump_flash = maxf(jump_flash - dt * 4.0, 0.0)
	queue_redraw()


func _input(ev: InputEvent) -> void:
	if ev is InputEventScreenTouch:
		var g = _geom()
		if ev.pressed:
			var role = _role_at(ev.position, g)
			touches[ev.index] = role
			match role:
				"pause":
					main.toggle_pause()
				"jump":
					jump_held = true
					jump_pressed = true
					jump_flash = 1.0
				"fire":
					fire_pressed = true
					fire_flash = 1.0
				"stick":
					_stick(ev.position, g)
		else:
			var role2: String = touches.get(ev.index, "")
			touches.erase(ev.index)
			if role2 == "jump":
				jump_held = false
			elif role2 == "stick":
				move = 0.0
				knob = Vector2.ZERO
	elif ev is InputEventScreenDrag:
		if touches.get(ev.index, "") == "stick":
			_stick(ev.position, _geom())


func _role_at(p: Vector2, g: Dictionary) -> String:
	if p.distance_to(g.pause) < g.pause_r * 1.4:
		return "pause"
	if paused:
		return "pause"
	if p.distance_to(g.jump) < g.jump_r * 1.3:
		return "jump"
	if p.distance_to(g.fire) < g.fire_r * 1.35:
		return "fire"
	if p.x < size.x * 0.55 and p.y > size.y * 0.5:
		return "stick"
	return ""


func _stick(p: Vector2, g: Dictionary) -> void:
	var d: Vector2 = p - g.stick
	knob = d.limit_length(g.stick_r * 0.55)
	move = clampf(d.x / (g.stick_r * 0.5), -1.0, 1.0)
	if absf(move) < 0.15:
		move = 0.0


# ---------------- drawing ----------------
func _pill(r: Rect2) -> void:
	var sb = StyleBoxFlat.new()
	sb.bg_color = Color(pal.ink, 0.55)
	sb.border_color = Color(pal.moon, 0.2)
	sb.set_border_width_all(2)
	sb.set_corner_radius_all(int(r.size.y * 0.5))
	sb.shadow_color = Color(0, 0, 0, 0.35)
	sb.shadow_size = 8
	draw_style_box(sb, r)


func _heart(c: Vector2, s: float, filled: bool) -> void:
	var pts = PackedVector2Array()
	for i in 32:
		var a = TAU * i / 32.0
		var x = 16.0 * pow(sin(a), 3.0)
		var y = -(13.0 * cos(a) - 5.0 * cos(2.0 * a) - 2.0 * cos(3.0 * a) - cos(4.0 * a))
		pts.append(c + Vector2(x, y) * s / 16.0)
	if filled:
		var cols = PackedColorArray()
		for p in pts:
			var k = clampf((p.y - c.y + s) / (2.0 * s), 0.0, 1.0)
			cols.append(Color(1.0, 0.82, 0.76).lerp(Color(1.0, 0.45, 0.42), minf(k * 1.6, 1.0)).lerp(Color(0.6, 0.16, 0.27), maxf(k - 0.6, 0.0) * 2.5))
		draw_polygon(pts, cols)
		draw_arc(c + Vector2(-s * 0.45, -s * 0.35), s * 0.28, PI * 1.05, PI * 1.6, 8, Color(1, 1, 1, 0.75), 2.0, true)
	else:
		draw_colored_polygon(pts, Color(pal.ink, 0.6))
		pts.append(pts[0])
		draw_polyline(pts, Color(pal.moon, 0.35), 2.0, true)


func _draw() -> void:
	if pal.is_empty():
		return
	var s = size
	var g = _geom()
	var moon: Color = pal.moon
	var ember: Color = pal.ember
	# hearts
	_pill(Rect2(26, 30, 34 + max_hearts * 44, 64))
	for i in max_hearts:
		_heart(Vector2(62 + i * 44, 62), 17.0, i < hearts)
	# coins
	var cw = 170.0
	var cr = Rect2(s.x * 0.5 - cw * 0.5, 30, cw, 64)
	_pill(cr)
	draw_texture_rect(coin_tex, Rect2(cr.position.x + 18, 44, 36, 36), false)
	var b = sin(minf(bump, 1.0) * PI) * 1.0
	var fs = int(34 + b * 10)
	draw_string(font, Vector2(cr.position.x + 64, 76 - b * 8), str(coins), HORIZONTAL_ALIGNMENT_LEFT, -1, fs, moon.lerp(Color(1, 0.95, 0.8), b))
	# pause
	draw_circle(g.pause, g.pause_r, Color(pal.ink, 0.55))
	draw_arc(g.pause, g.pause_r, 0, TAU, 32, Color(moon, 0.25), 2.0, true)
	draw_rect(Rect2(g.pause.x - 10, g.pause.y - 12, 7, 24), moon)
	draw_rect(Rect2(g.pause.x + 3, g.pause.y - 12, 7, 24), moon)
	# stage + progress
	draw_string(font, Vector2(0, 150), stage_label, HORIZONTAL_ALIGNMENT_CENTER, s.x, 30, Color(moon, 0.92))
	var bw = 300.0
	var br = Rect2(s.x * 0.5 - bw * 0.5, 168, bw, 9)
	draw_rect(br, Color(moon, 0.12))
	draw_rect(Rect2(br.position, Vector2(bw * progress, 9)), pal.moss.lightened(0.35))
	draw_circle(Vector2(br.position.x + bw * progress, br.position.y + 4.5), 8.0, Color(0.9, 1.0, 0.98))
	draw_arc(Vector2(br.end.x + 6, br.position.y + 4.5), 9.0, PI, TAU, 10, ember, 3.0, true)
	if autoplay:
		draw_string(font, Vector2(0, 208), "AUTO-PLAY DEMO", HORIZONTAL_ALIGNMENT_CENTER, s.x, 18, Color(moon, 0.5))
	# stick
	draw_circle(g.stick, g.stick_r, Color(pal.ink, 0.38))
	draw_arc(g.stick, g.stick_r, 0, TAU, 48, Color(moon, 0.22), 3.0, true)
	for side in [-1.0, 1.0]:
		var on: bool = signf(move) == side
		var cx: float = g.stick.x + side * (g.stick_r - 26.0)
		var col = pal.moss.lightened(0.5) if on else Color(moon, 0.35)
		draw_polyline(PackedVector2Array([Vector2(cx - side * 7, g.stick.y - 12), Vector2(cx + side * 5, g.stick.y), Vector2(cx - side * 7, g.stick.y + 12)]), col, 4.0, true)
	var kp: Vector2 = g.stick + (knob if touches.values().has("stick") else Vector2(move * g.stick_r * 0.4, 0))
	draw_circle(kp, 46, Color(moon, 0.22))
	draw_circle(kp + Vector2(-8, -10), 24, Color(1, 1, 1, 0.18))
	draw_arc(kp, 46, 0, TAU, 40, Color(moon, 0.5), 2.0, true)
	draw_string(font, Vector2(g.stick.x - 60, g.stick.y + g.stick_r + 34), "MOVE", HORIZONTAL_ALIGNMENT_CENTER, 120, 18, Color(moon, 0.45))
	# jump
	var jf = maxf(jump_flash, 1.0 if jump_held else 0.0)
	draw_circle(g.jump, g.jump_r + jf * 8.0, Color(ember, 0.18 + jf * 0.35))
	draw_circle(g.jump, g.jump_r * (1.0 - jf * 0.06), ember.darkened(0.55).lerp(ember, 0.25))
	draw_circle(g.jump + Vector2(-14, -18), g.jump_r * 0.55, Color(1, 0.85, 0.65, 0.18))
	draw_arc(g.jump, g.jump_r, 0, TAU, 48, Color(moon, 0.35), 3.0, true)
	draw_polyline(PackedVector2Array([g.jump + Vector2(-22, 10), g.jump + Vector2(0, -12), g.jump + Vector2(22, 10)]), Color(1, 0.96, 0.9), 7.0, true)
	draw_string(font, Vector2(g.jump.x - 60, g.jump.y + g.jump_r + 32), "JUMP", HORIZONTAL_ALIGNMENT_CENTER, 120, 18, Color(moon, 0.45))
	# spark
	var mo: Color = pal.moss
	draw_circle(g.fire, g.fire_r + fire_flash * 8.0, Color(mo.lightened(0.4), 0.15 + fire_flash * 0.4))
	draw_circle(g.fire, g.fire_r, mo.darkened(0.6).lerp(mo, 0.3))
	draw_arc(g.fire, g.fire_r, 0, TAU, 40, Color(moon, 0.35), 3.0, true)
	var star = PackedVector2Array()
	for i in 8:
		var a = TAU * i / 8.0 - PI / 2.0
		var rr = 22.0 if i % 2 == 0 else 6.0
		star.append(g.fire + Vector2(cos(a), sin(a)) * rr)
	draw_colored_polygon(star, Color(0.88, 1.0, 0.97))
	draw_string(font, Vector2(g.fire.x - 60, g.fire.y + g.fire_r + 30), "SPARK", HORIZONTAL_ALIGNMENT_CENTER, 120, 18, Color(moon, 0.45))
	# title card
	if title_t > 0.0:
		var a2 = clampf(minf(title_t, 2.8 - title_t) * 2.5, 0.0, 1.0)
		draw_rect(Rect2(0, s.y * 0.36, s.x, 150), Color(pal.ink, 0.45 * a2))
		draw_string(font, Vector2(0, s.y * 0.36 + 70), title, HORIZONTAL_ALIGNMENT_CENTER, s.x, 54, Color(moon, a2))
		draw_string(font, Vector2(0, s.y * 0.36 + 118), subtitle, HORIZONTAL_ALIGNMENT_CENTER, s.x, 26, Color(ember, a2))
	if paused:
		draw_rect(Rect2(Vector2.ZERO, s), Color(pal.ink, 0.6))
		draw_string(font, Vector2(0, s.y * 0.45), "Paused", HORIZONTAL_ALIGNMENT_CENTER, s.x, 60, moon)
		draw_string(font, Vector2(0, s.y * 0.45 + 60), "Tap anywhere to resume", HORIZONTAL_ALIGNMENT_CENTER, s.x, 26, Color(moon, 0.7))
	if fade > 0.0:
		draw_rect(Rect2(Vector2.ZERO, s), Color(pal.ink.darkened(0.5), fade))
