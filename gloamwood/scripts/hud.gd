class_name Hud
extends Control
## In-game HUD and multi-touch controls, all drawn in code.
## Movement: D-pad (default) or analog stick (Settings). Right thumb: JUMP, SPARK (hold to charge), DASH.

var main: Node
var pal: Dictionary = {}
var coin_tex: Texture2D
var font: Font

var hp := 100.0
var max_hp := 100.0
var hp_lag := 100.0
var hurt_flash := 0.0
var powers: Dictionary = {}
var shield := 0
var coins := 0
var bump := 0.0
var stage_label := ""
var progress := 0.0
var title := ""
var subtitle := ""
var title_t := 0.0
var fade := 0.0
var autoplay := false
var visible_controls := true
var combo := 0
var combo_k := 0.0
var combo_mult := 1.0
var combo_pop := 0.0
var boss_name := ""
var boss_k := -1.0
var boss_phase := 1
var toasts: Array = []
var charge := 0.0

# control state read by main
var move := 0.0
var jump_held := false
var jump_pressed := false
var fire_pressed := false
var fire_held := false
var fire_released := false
var dash_pressed := false
var fire_flash := 0.0
var jump_flash := 0.0
var dash_flash := 0.0
var dash_ready := 1.0

var touches := {}
var knob = Vector2.ZERO


func _ready() -> void:
	font = preload("res://assets/fonts/DejaVuSans-Bold.ttf")
	mouse_filter = Control.MOUSE_FILTER_IGNORE


func _geom() -> Dictionary:
	var s = size
	var k = float(Profile.setting("control_scale"))
	return {
		"k": k,
		"stick": Vector2(150 * k, s.y - 200 * k), "stick_r": 105.0 * k,
		"left": Vector2(95 * k, s.y - 180 * k), "right": Vector2(245 * k, s.y - 180 * k), "pad": 64.0 * k,
		"jump": Vector2(s.x - 120 * k, s.y - 160 * k), "jump_r": 78.0 * k,
		"fire": Vector2(s.x - 262 * k, s.y - 235 * k), "fire_r": 56.0 * k,
		"dash": Vector2(s.x - 108 * k, s.y - 330 * k), "dash_r": 46.0 * k,
		"pause": Vector2(s.x - 60, 62), "pause_r": 34.0,
	}


func show_title(t1: String, t2: String) -> void:
	title = t1
	subtitle = t2
	title_t = 2.8


func toast(text: String, col: Color = Color(1, 0.9, 0.6)) -> void:
	toasts.append({"text": text, "t": 0.0, "col": col})
	while toasts.size() > 2:
		toasts.pop_front()


func consume() -> void:
	jump_pressed = false
	fire_pressed = false
	fire_released = false
	dash_pressed = false


func reset_input() -> void:
	touches.clear()
	move = 0.0
	knob = Vector2.ZERO
	jump_held = false
	fire_held = false
	consume()


func _process(dt: float) -> void:
	position = Vector2.ZERO
	size = get_viewport_rect().size
	bump = maxf(bump - dt * 2.6, 0.0)
	title_t = maxf(title_t - dt, 0.0)
	fire_flash = maxf(fire_flash - dt * 4.0, 0.0)
	jump_flash = maxf(jump_flash - dt * 4.0, 0.0)
	dash_flash = maxf(dash_flash - dt * 4.0, 0.0)
	combo_pop = maxf(combo_pop - dt * 3.0, 0.0)
	hurt_flash = maxf(hurt_flash - dt * 2.5, 0.0)
	hp_lag = move_toward(hp_lag, hp, dt * maxf(40.0, absf(hp_lag - hp) * 2.0)) if hp_lag > hp else hp
	for tt in toasts:
		tt.t += dt
	toasts = toasts.filter(func(x): return x.t < 2.2)
	queue_redraw()


func _input(ev: InputEvent) -> void:
	if not visible_controls or get_tree().paused:
		return
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
					fire_held = true
					fire_flash = 1.0
				"dash":
					dash_pressed = true
					dash_flash = 1.0
				"stick":
					_stick(ev.position, g)
				"dpad":
					_dpad(ev.position, g)
				"":
					# tap on the game world: lock onto the monster under the finger
					main.weapons.try_target(ev.position)
		else:
			var role2: String = touches.get(ev.index, "")
			touches.erase(ev.index)
			match role2:
				"jump":
					jump_held = false
				"fire":
					fire_held = false
					fire_released = true
				"stick", "dpad":
					move = 0.0
					knob = Vector2.ZERO
	elif ev is InputEventScreenDrag:
		var r = touches.get(ev.index, "")
		if r == "stick":
			_stick(ev.position, _geom())
		elif r == "dpad":
			_dpad(ev.position, _geom())


func _role_at(p: Vector2, g: Dictionary) -> String:
	if p.distance_to(g.pause) < g.pause_r * 1.5:
		return "pause"
	if p.distance_to(g.jump) < g.jump_r * 1.25:
		return "jump"
	if p.distance_to(g.fire) < g.fire_r * 1.3:
		return "fire"
	if p.distance_to(g.dash) < g.dash_r * 1.35:
		return "dash"
	if Profile.setting("control") == "dpad":
		var pad_area = Rect2(g.left - Vector2.ONE * g.pad * 1.5, Vector2(g.right.x - g.left.x + g.pad * 3.0, g.pad * 3.0))
		if pad_area.has_point(p):
			return "dpad"
	elif p.distance_to(g.stick) < g.stick_r * 1.5:
		return "stick"
	return ""


func _stick(p: Vector2, g: Dictionary) -> void:
	var d: Vector2 = p - g.stick
	knob = d.limit_length(g.stick_r * 0.55)
	move = clampf(d.x / (g.stick_r * 0.5), -1.0, 1.0)
	if absf(move) < 0.15:
		move = 0.0


func _dpad(p: Vector2, g: Dictionary) -> void:
	var mid = (g.left.x + g.right.x) * 0.5
	move = -1.0 if p.x < mid else 1.0


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
		pts.append(c + Vector2(16.0 * pow(sin(a), 3.0), -(13.0 * cos(a) - 5.0 * cos(2.0 * a) - 2.0 * cos(3.0 * a) - cos(4.0 * a))) * s / 16.0)
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


func _button(c: Vector2, r: float, base: Color, flash: float, label: String, k: float) -> void:
	draw_circle(c, r + flash * 8.0, Color(base.lightened(0.3), 0.15 + flash * 0.4))
	draw_circle(c, r * (1.0 - flash * 0.06), base.darkened(0.55).lerp(base, 0.25))
	draw_circle(c + Vector2(-r * 0.18, -r * 0.24), r * 0.55, Color(1, 1, 1, 0.12))
	draw_arc(c, r, 0, TAU, 48, Color(pal.moon, 0.35), 3.0, true)
	draw_string(font, Vector2(c.x - 70, c.y + r + 28 * k), label, HORIZONTAL_ALIGNMENT_CENTER, 140, int(17 * k), Color(pal.moon, 0.45))


func _draw() -> void:
	if pal.is_empty():
		return
	var s = size
	var moon: Color = pal.moon
	var ember: Color = pal.ember
	# health bar
	var hr = Rect2(26, 30, 250, 64)
	_pill(hr)
	_heart(Vector2(58, 62), 15.0, true)
	var bar = Rect2(84, 50, 172, 24)
	var hk = clampf(hp / maxf(max_hp, 1.0), 0.0, 1.0)
	var kl = clampf(hp_lag / maxf(max_hp, 1.0), 0.0, 1.0)
	var sbb = StyleBoxFlat.new()
	sbb.bg_color = Color(pal.ink.darkened(0.4), 0.9)
	sbb.set_corner_radius_all(12)
	draw_style_box(sbb, bar)
	if kl > hk:
		var sbl = StyleBoxFlat.new()
		sbl.bg_color = Color(1, 0.9, 0.8, 0.85)
		sbl.set_corner_radius_all(12)
		draw_style_box(sbl, Rect2(bar.position, Vector2(bar.size.x * kl, bar.size.y)))
	if hk > 0.0:
		var sbf = StyleBoxFlat.new()
		sbf.bg_color = Color(1.0, 0.32, 0.38).lerp(Color(0.45, 0.95, 0.6), clampf((hk - 0.25) / 0.5, 0.0, 1.0))
		sbf.set_corner_radius_all(12)
		draw_style_box(sbf, Rect2(bar.position, Vector2(maxf(bar.size.x * hk, 24.0), bar.size.y)))
		draw_rect(Rect2(bar.position + Vector2(10, 3), Vector2(maxf(bar.size.x * hk - 20.0, 0.0), 5)), Color(1, 1, 1, 0.3))
	draw_string(font, Vector2(bar.position.x, bar.position.y + 19), "%d / %d" % [int(ceil(hp)), int(max_hp)], HORIZONTAL_ALIGNMENT_CENTER, bar.size.x, 17, Color(1, 1, 1, 0.95))
	if hurt_flash > 0.0:
		draw_rect(hr.grow(4), Color(1, 0.3, 0.3, hurt_flash * 0.35))
	# shield pips + active power-ups
	var px = 34.0
	for i in shield:
		draw_circle(Vector2(px + 10, 112), 10, Color(0.5, 1.0, 0.9, 0.9))
		draw_arc(Vector2(px + 10, 112), 13, 0, TAU, 20, Color(0.8, 1, 1, 0.6), 2.0, true)
		px += 30.0
	for key in powers:
		var info: Dictionary = main.POWER_INFO.get(key, {})
		if info.is_empty() or float(info.time) <= 0.0:
			continue
		var frac = clampf(float(powers[key]) / float(info.time), 0.0, 1.0)
		var cc = Vector2(px + 18, 116)
		draw_circle(cc, 17, Color(pal.ink, 0.8))
		draw_arc(cc, 17, -PI / 2, -PI / 2 + TAU * frac, 28, info.col, 4.0, true)
		draw_string(font, Vector2(cc.x - 20, cc.y + 7), {"triple": "x3", "homing": "@", "rapid": ">>", "magnet": "$", "star": "*"}.get(key, "?"), HORIZONTAL_ALIGNMENT_CENTER, 40, 18, info.col)
		px += 44.0
	# coins
	var cw = 170.0
	var cr = Rect2(s.x * 0.5 - cw * 0.5 + 30, 30, cw, 64)
	_pill(cr)
	draw_texture_rect(coin_tex, Rect2(cr.position.x + 18, 44, 36, 36), false)
	var b = sin(minf(bump, 1.0) * PI)
	draw_string(font, Vector2(cr.position.x + 64, 76 - b * 8), str(coins), HORIZONTAL_ALIGNMENT_LEFT, -1, int(34 + b * 10), moon.lerp(Color(1, 0.95, 0.8), b))
	if visible_controls:
		var g0 = _geom()
		draw_circle(g0.pause, g0.pause_r, Color(pal.ink, 0.55))
		draw_arc(g0.pause, g0.pause_r, 0, TAU, 32, Color(moon, 0.25), 2.0, true)
		draw_rect(Rect2(g0.pause.x - 10, g0.pause.y - 12, 7, 24), moon)
		draw_rect(Rect2(g0.pause.x + 3, g0.pause.y - 12, 7, 24), moon)
	# stage + progress
	draw_string(font, Vector2(0, 178), stage_label, HORIZONTAL_ALIGNMENT_CENTER, s.x, 30, Color(moon, 0.92))
	var bw = 300.0
	var br = Rect2(s.x * 0.5 - bw * 0.5, 194, bw, 9)
	draw_rect(br, Color(moon, 0.12))
	draw_rect(Rect2(br.position, Vector2(bw * progress, 9)), pal.moss.lightened(0.35))
	draw_circle(Vector2(br.position.x + bw * progress, br.position.y + 4.5), 8.0, Color(0.9, 1.0, 0.98))
	draw_arc(Vector2(br.end.x + 6, br.position.y + 4.5), 9.0, PI, TAU, 10, ember, 3.0, true)
	if autoplay:
		draw_string(font, Vector2(0, 232), "AUTO-PLAY DEMO", HORIZONTAL_ALIGNMENT_CENTER, s.x, 18, Color(moon, 0.5))
	# boss bar
	if boss_k >= 0.0:
		var bb = Rect2(60, 262, s.x - 120, 22)
		draw_string(font, Vector2(0, 252), boss_name, HORIZONTAL_ALIGNMENT_CENTER, s.x, 26, Color(1, 0.85, 0.7))
		draw_rect(bb.grow(3), Color(pal.ink, 0.8))
		draw_rect(Rect2(bb.position, Vector2(bb.size.x * boss_k, bb.size.y)), Color(1.0, 0.3, 0.3).lerp(ember, 0.3))
		draw_rect(Rect2(bb.position, Vector2(bb.size.x * boss_k, 6)), Color(1, 1, 1, 0.3))
		for m in [0.6, 0.3]:
			draw_line(Vector2(bb.position.x + bb.size.x * m, bb.position.y - 3), Vector2(bb.position.x + bb.size.x * m, bb.end.y + 3), Color(moon, 0.7), 2.0)
	# combo
	if combo >= 2:
		var p = combo_pop
		var cx = s.x - 90.0
		var cy = 330.0 if boss_k < 0.0 else 360.0
		draw_string(font, Vector2(cx - 120, cy), str(combo), HORIZONTAL_ALIGNMENT_RIGHT, 160, int(64 + p * 26), Color(1, 0.95, 0.75).lerp(ember, 0.3))
		draw_string(font, Vector2(cx - 120, cy + 30), "COMBO", HORIZONTAL_ALIGNMENT_RIGHT, 160, 22, Color(moon, 0.8))
		if combo_mult > 1.0:
			draw_string(font, Vector2(cx - 120, cy + 58), "coins x%.1f" % combo_mult, HORIZONTAL_ALIGNMENT_RIGHT, 160, 22, ember)
		draw_rect(Rect2(cx - 80, cy + 68, 120, 6), Color(moon, 0.15))
		draw_rect(Rect2(cx - 80, cy + 68, 120 * combo_k, 6), ember)
	# controls
	if visible_controls:
		var g = _geom()
		var k = g.k
		if Profile.setting("control") == "dpad":
			for side in [-1.0, 1.0]:
				var c: Vector2 = g.left if side < 0.0 else g.right
				var on = signf(move) == side
				var rr = Rect2(c - Vector2.ONE * g.pad, Vector2.ONE * g.pad * 2.0)
				var sb = StyleBoxFlat.new()
				sb.bg_color = Color(pal.moss.darkened(0.4), 0.6) if on else Color(pal.ink, 0.45)
				sb.border_color = Color(pal.moss.lightened(0.5), 0.8) if on else Color(moon, 0.25)
				sb.set_border_width_all(3)
				sb.set_corner_radius_all(int(26 * k))
				draw_style_box(sb, rr)
				var a = 26.0 * k
				var col = pal.moss.lightened(0.6) if on else Color(moon, 0.6)
				draw_colored_polygon(PackedVector2Array([c + Vector2(side * a, 0), c + Vector2(-side * a * 0.6, -a), c + Vector2(-side * a * 0.6, a)]), col)
			draw_string(font, Vector2((g.left.x + g.right.x) * 0.5 - 80, g.left.y + g.pad + 30 * k), "MOVE", HORIZONTAL_ALIGNMENT_CENTER, 160, int(17 * k), Color(moon, 0.45))
		else:
			draw_circle(g.stick, g.stick_r, Color(pal.ink, 0.38))
			draw_arc(g.stick, g.stick_r, 0, TAU, 48, Color(moon, 0.22), 3.0, true)
			var kp: Vector2 = g.stick + (knob if touches.values().has("stick") else Vector2(move * g.stick_r * 0.4, 0))
			draw_circle(kp, 46 * k, Color(moon, 0.22))
			draw_circle(kp + Vector2(-8, -10) * k, 24 * k, Color(1, 1, 1, 0.18))
			draw_arc(kp, 46 * k, 0, TAU, 40, Color(moon, 0.5), 2.0, true)
			draw_string(font, Vector2(g.stick.x - 60, g.stick.y + g.stick_r + 34 * k), "MOVE", HORIZONTAL_ALIGNMENT_CENTER, 120, int(17 * k), Color(moon, 0.45))
		var jf = maxf(jump_flash, 1.0 if jump_held else 0.0)
		_button(g.jump, g.jump_r, ember, jf, "JUMP", k)
		draw_polyline(PackedVector2Array([g.jump + Vector2(-22, 10) * k, g.jump + Vector2(0, -12) * k, g.jump + Vector2(22, 10) * k]), Color(1, 0.96, 0.9), 7.0 * k, true)
		_button(g.fire, g.fire_r, pal.moss, maxf(fire_flash, charge), "SPARK", k)
		if charge > 0.05:
			draw_arc(g.fire, g.fire_r + 6, -PI / 2, -PI / 2 + TAU * minf(charge, 1.0), 40, pal.moss.lightened(0.6) if charge < 1.0 else Color(1, 1, 0.8), 5.0, true)
		var star = PackedVector2Array()
		for i in 8:
			var a2 = TAU * i / 8.0 - PI / 2.0
			star.append(g.fire + Vector2(cos(a2), sin(a2)) * (22.0 if i % 2 == 0 else 6.0) * k)
		draw_colored_polygon(star, Color(0.88, 1.0, 0.97))
		_button(g.dash, g.dash_r, pal.dusk.lightened(0.3), dash_flash, "DASH", k)
		if dash_ready < 1.0:
			draw_arc(g.dash, g.dash_r - 4, -PI / 2, -PI / 2 + TAU * dash_ready, 32, Color(moon, 0.6), 4.0, true)
		for i in 3:
			var x0 = g.dash.x - 16 * k + i * 9 * k
			draw_colored_polygon(PackedVector2Array([Vector2(x0, g.dash.y - 12 * k), Vector2(x0 + 12 * k, g.dash.y), Vector2(x0, g.dash.y + 12 * k)]), Color(moon, 0.5 + i * 0.25 if dash_ready >= 1.0 else 0.3))
	# toasts
	var ty = 300.0 if boss_k < 0.0 else 330.0
	for tt in toasts:
		var a3 = clampf(minf(tt.t * 5.0, (2.2 - tt.t) * 3.0), 0.0, 1.0)
		var w = 420.0
		var r3 = Rect2(s.x * 0.5 - w * 0.5, ty - 40 + (1.0 - a3) * -20.0, w, 52)
		var sb2 = StyleBoxFlat.new()
		sb2.bg_color = Color(pal.ink, 0.8 * a3)
		sb2.border_color = Color(tt.col, 0.7 * a3)
		sb2.set_border_width_all(2)
		sb2.set_corner_radius_all(18)
		draw_style_box(sb2, r3)
		draw_string(font, Vector2(r3.position.x, r3.position.y + 35), tt.text, HORIZONTAL_ALIGNMENT_CENTER, w, 23, Color(tt.col, a3))
		ty += 60.0
	# title card
	if title_t > 0.0:
		var a4 = clampf(minf(title_t, 2.8 - title_t) * 2.5, 0.0, 1.0)
		draw_rect(Rect2(0, s.y * 0.36, s.x, 150), Color(pal.ink, 0.45 * a4))
		draw_string(font, Vector2(0, s.y * 0.36 + 70), title, HORIZONTAL_ALIGNMENT_CENTER, s.x, 54, Color(moon, a4))
		draw_string(font, Vector2(0, s.y * 0.36 + 118), subtitle, HORIZONTAL_ALIGNMENT_CENTER, s.x, 26, Color(ember, a4))
	if fade > 0.0:
		draw_rect(Rect2(Vector2.ZERO, s), Color(pal.ink.darkened(0.5), fade))
