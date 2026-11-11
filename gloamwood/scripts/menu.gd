class_name Menu
extends Control
## All menu screens. Design: dark glass cards over the live game, warm amber primary actions,
## raised "press-down" buttons, drawn icons, a consistent header (back · title · coins).

var main: Node
var pal: Dictionary = {}
var screen := ""
var back_from := ""
var daily_shown := false
var last_result: Dictionary = {}
var shade: TextureRect
var root_box: VBoxContainer
var header: HBoxContainer
var box: VBoxContainer
var scroll: ScrollContainer
var t := 0.0
var wardrobe_slot := "scarf"
var preview: Control = null

const UI_FONT := preload("res://assets/fonts/DejaVuSans-Bold.ttf")
const TITLE_FONT := preload("res://assets/fonts/DejaVuSerif-Bold.ttf")


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	shade = TextureRect.new()
	shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	shade.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	shade.stretch_mode = TextureRect.STRETCH_SCALE
	add_child(shade)
	var margin = MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 36)
	margin.add_theme_constant_override("margin_right", 36)
	margin.add_theme_constant_override("margin_top", 54)
	margin.add_theme_constant_override("margin_bottom", 40)
	add_child(margin)
	root_box = VBoxContainer.new()
	root_box.add_theme_constant_override("separation", 18)
	margin.add_child(root_box)
	header = HBoxContainer.new()
	header.add_theme_constant_override("separation", 16)
	root_box.add_child(header)
	scroll = ScrollContainer.new()
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root_box.add_child(scroll)
	box = VBoxContainer.new()
	box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	box.add_theme_constant_override("separation", 16)
	scroll.add_child(box)
	Profile.changed.connect(func(): if screen in ["title", "upgrades", "heroes", "quests", "armory", "wardrobe"]: _refresh_soon())


func _process(dt: float) -> void:
	t += dt
	if screen == "wardrobe" and is_instance_valid(preview):
		preview.queue_redraw()


var _refresh_pending := false
func _refresh_soon() -> void:
	if _refresh_pending:
		return
	_refresh_pending = true
	await get_tree().process_frame
	_refresh_pending = false
	if screen != "":
		var sv = scroll.scroll_vertical
		show_screen(screen, last_result)
		await get_tree().process_frame
		scroll.scroll_vertical = sv


func set_palette(p: Dictionary) -> void:
	pal = p
	theme = _make_theme()


# ---------------- theme ----------------
func _sb(bg: Color, border: Color = Color(0, 0, 0, 0), radius: int = 26, bw: int = 0, bottom: int = 0, shadow: int = 0) -> StyleBoxFlat:
	var s = StyleBoxFlat.new()
	s.bg_color = bg
	s.border_color = border
	s.set_border_width_all(bw)
	if bottom > 0:
		s.border_width_bottom = bottom
	s.set_corner_radius_all(radius)
	s.corner_detail = 10
	s.anti_aliasing = true
	s.content_margin_left = 24
	s.content_margin_right = 24
	s.content_margin_top = 14
	s.content_margin_bottom = 14
	if shadow > 0:
		s.shadow_color = Color(0, 0, 0, 0.38)
		s.shadow_size = shadow
		s.shadow_offset = Vector2(0, 6)
	return s


func _card_bg() -> Color:
	return Color(pal.ink.lerp(pal.dusk, 0.16), 0.93)


func _make_theme() -> Theme:
	var th = Theme.new()
	th.default_font = UI_FONT
	th.default_font_size = 26
	var moon: Color = pal.moon
	var base = pal.ink.lerp(pal.dusk, 0.32)
	th.set_stylebox("normal", "Button", _sb(Color(base, 0.96), base.darkened(0.45), 26, 2, 6, 10))
	th.set_stylebox("hover", "Button", _sb(Color(base.lightened(0.06), 0.98), base.darkened(0.45), 26, 2, 6, 10))
	var pressed = _sb(Color(base.darkened(0.1), 1.0), base.darkened(0.45), 26, 2, 2, 4)
	pressed.content_margin_top = 18
	pressed.content_margin_bottom = 10
	th.set_stylebox("pressed", "Button", pressed)
	th.set_stylebox("disabled", "Button", _sb(Color(pal.ink, 0.6), Color(moon, 0.06), 26, 2, 2))
	th.set_stylebox("focus", "Button", StyleBoxEmpty.new())
	th.set_color("font_color", "Button", moon)
	th.set_color("font_hover_color", "Button", Color.WHITE)
	th.set_color("font_pressed_color", "Button", Color.WHITE)
	th.set_color("font_disabled_color", "Button", Color(moon, 0.35))
	th.set_color("font_color", "Label", moon)
	th.set_stylebox("panel", "PanelContainer", _sb(_card_bg(), Color(moon, 0.09), 28, 2, 0, 14))
	th.set_stylebox("background", "ProgressBar", _sb(Color(0, 0, 0, 0.35), Color(0, 0, 0, 0), 10))
	th.set_stylebox("fill", "ProgressBar", _sb(pal.moss.lightened(0.25), Color(0, 0, 0, 0), 10))
	th.set_stylebox("slider", "HSlider", _sb(Color(0, 0, 0, 0.35), Color(0, 0, 0, 0), 10))
	th.set_stylebox("grabber_area", "HSlider", _sb(pal.moss.lightened(0.2), Color(0, 0, 0, 0), 10))
	th.set_stylebox("grabber_area_highlight", "HSlider", _sb(pal.moss.lightened(0.35), Color(0, 0, 0, 0), 10))
	return th


func _primary(b: Button) -> void:
	var em: Color = pal.ember
	b.add_theme_stylebox_override("normal", _sb(em, em.darkened(0.45), 40, 0, 7, 14))
	b.add_theme_stylebox_override("hover", _sb(em.lightened(0.08), em.darkened(0.45), 40, 0, 7, 14))
	var pr = _sb(em.darkened(0.05), em.darkened(0.45), 40, 0, 2, 4)
	pr.content_margin_top = 19
	pr.content_margin_bottom = 9
	b.add_theme_stylebox_override("pressed", pr)
	var ink = pal.ink.darkened(0.3)
	for k in ["font_color", "font_hover_color", "font_pressed_color"]:
		b.add_theme_color_override(k, ink)


# ---------------- widgets ----------------
func _clear() -> void:
	for c in box.get_children():
		c.queue_free()
	for c in header.get_children():
		c.queue_free()


func _label(text: String, size: int = 26, col = null, align: int = HORIZONTAL_ALIGNMENT_CENTER, wrap: bool = true) -> Label:
	var l = Label.new()
	l.text = text
	l.horizontal_alignment = align
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART if wrap else TextServer.AUTOWRAP_OFF
	l.add_theme_font_size_override("font_size", size)
	if col != null:
		l.add_theme_color_override("font_color", col)
	return l


func _btn(text: String, cb: Callable, primary: bool = false, enabled: bool = true, parent: Node = null, h: int = 88) -> Button:
	var b = Button.new()
	b.text = text
	b.custom_minimum_size = Vector2(0, h)
	b.disabled = not enabled
	b.add_theme_font_size_override("font_size", 30 if primary else 27)
	if primary and enabled:
		_primary(b)
	b.pressed.connect(func():
		Sfx.play("ui")
		cb.call())
	(parent if parent else box).add_child(b)
	return b


func _chip_btn(text: String, cb: Callable, enabled: bool, primary: bool = false, coin: bool = false) -> Button:
	var b = Button.new()
	b.text = text
	b.custom_minimum_size = Vector2(158, 64)
	b.disabled = not enabled
	b.add_theme_font_size_override("font_size", 23)
	b.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	if coin:
		b.icon = main.hud.coin_tex
		b.add_theme_constant_override("icon_max_width", 26)
	if primary and enabled:
		_primary(b)
	b.pressed.connect(func():
		cb.call())
	return b


func _icon(kind: String, sz: float, col: Color) -> Control:
	var c = Control.new()
	c.custom_minimum_size = Vector2(sz, sz)
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.draw.connect(func(): _draw_icon(c, kind, sz, col))
	return c


func _draw_icon(c: Control, kind: String, s: float, col: Color) -> void:
	var m = Vector2(s, s) * 0.5
	var u = s / 48.0
	match kind:
		"hero":
			var pts = PackedVector2Array()
			for i in 20:
				var a = PI + TAU * i / 20.0
				pts.append(m + Vector2(cos(a) * 14 * u * (1.0 + maxf(0.0, sin(a)) * 0.2), sin(a) * 20 * u + 2 * u))
			c.draw_colored_polygon(pts, col)
			c.draw_circle(m + Vector2(2, -6) * u, 7 * u, pal.ink)
			c.draw_circle(m + Vector2(0, -6) * u, 1.6 * u, Color(0.9, 1, 1))
			c.draw_circle(m + Vector2(4, -6) * u, 1.6 * u, Color(0.9, 1, 1))
		"weapon":
			c.draw_line(m + Vector2(-14, 14) * u, m + Vector2(12, -12) * u, col, 5 * u, true)
			c.draw_circle(m + Vector2(14, -14) * u, 6 * u, col)
			c.draw_circle(m + Vector2(14, -14) * u, 3 * u, Color(1, 1, 1, 0.8))
			c.draw_line(m + Vector2(-16, 6) * u, m + Vector2(-6, 16) * u, col, 4 * u, true)
		"upgrade":
			c.draw_colored_polygon(PackedVector2Array([m + Vector2(0, -18) * u, m + Vector2(14, -2) * u, m + Vector2(5, -2) * u, m + Vector2(5, 16) * u, m + Vector2(-5, 16) * u, m + Vector2(-5, -2) * u, m + Vector2(-14, -2) * u]), col)
		"quest":
			c.draw_rect(Rect2(m + Vector2(-13, -16) * u, Vector2(26, 32) * u), col)
			for i in 3:
				c.draw_line(m + Vector2(-7, -8 + i * 8) * u, m + Vector2(8, -8 + i * 8) * u, pal.ink, 2.5 * u)
		"wardrobe":
			c.draw_colored_polygon(PackedVector2Array([m + Vector2(-8, -16) * u, m + Vector2(8, -16) * u, m + Vector2(18, -8) * u, m + Vector2(13, 0) * u, m + Vector2(9, -4) * u, m + Vector2(9, 16) * u, m + Vector2(-9, 16) * u, m + Vector2(-9, -4) * u, m + Vector2(-13, 0) * u, m + Vector2(-18, -8) * u]), col)
		"settings":
			c.draw_circle(m, 13 * u, col)
			for i in 8:
				var a2 = TAU * i / 8.0
				c.draw_line(m + Vector2(cos(a2), sin(a2)) * 12 * u, m + Vector2(cos(a2), sin(a2)) * 19 * u, col, 6 * u)
			c.draw_circle(m, 5 * u, pal.ink)
		"back":
			c.draw_polyline(PackedVector2Array([m + Vector2(6, -12) * u, m + Vector2(-6, 0) * u, m + Vector2(6, 12) * u]), col, 5 * u, true)
		"star":
			var st = PackedVector2Array()
			for i in 10:
				var a3 = TAU * i / 10.0 - PI / 2.0
				st.append(m + Vector2(cos(a3), sin(a3)) * (20.0 if i % 2 == 0 else 8.5) * u)
			c.draw_colored_polygon(st, col)


func _bar(v: float, mx: float, col = null, h: int = 14) -> ProgressBar:
	var p = ProgressBar.new()
	p.max_value = maxf(mx, 1.0)
	p.value = v
	p.show_percentage = false
	p.custom_minimum_size = Vector2(0, h)
	if col != null:
		p.add_theme_stylebox_override("fill", _sb(col, Color(0, 0, 0, 0), 10))
	return p


func _card(parent: Node = null) -> VBoxContainer:
	var pc = PanelContainer.new()
	(parent if parent else box).add_child(pc)
	var v = VBoxContainer.new()
	v.add_theme_constant_override("separation", 8)
	pc.add_child(v)
	return v


func _row(parent: Node) -> HBoxContainer:
	var h = HBoxContainer.new()
	h.add_theme_constant_override("separation", 16)
	parent.add_child(h)
	return h


func _coin_chip(parent: Node) -> void:
	var pc = PanelContainer.new()
	pc.add_theme_stylebox_override("panel", _sb(Color(0, 0, 0, 0.35), Color(pal.ember, 0.35), 30, 2))
	pc.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	var h = HBoxContainer.new()
	h.add_theme_constant_override("separation", 8)
	pc.add_child(h)
	var ic = TextureRect.new()
	ic.texture = main.hud.coin_tex
	ic.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	ic.custom_minimum_size = Vector2(30, 30)
	ic.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	h.add_child(ic)
	h.add_child(_label(str(int(Profile.data.coins)), 26, pal.ember.lightened(0.3), HORIZONTAL_ALIGNMENT_LEFT, false))
	parent.add_child(pc)


func _level_chip(parent: Node) -> void:
	var lv = int(Profile.data.level)
	var pc = PanelContainer.new()
	pc.add_theme_stylebox_override("panel", _sb(Color(0, 0, 0, 0.35), Color(pal.moss, 0.35), 30, 2))
	pc.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	var h = HBoxContainer.new()
	h.add_theme_constant_override("separation", 10)
	pc.add_child(h)
	h.add_child(_label("Lv %d" % lv, 24, pal.moss.lightened(0.55), HORIZONTAL_ALIGNMENT_LEFT, false))
	var b = _bar(int(Profile.data.xp), Profile.xp_needed(lv), null, 12)
	b.custom_minimum_size = Vector2(110, 12)
	b.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	h.add_child(b)
	parent.add_child(pc)


func _header(title: String, back_to: String = "title") -> void:
	var b = Button.new()
	b.custom_minimum_size = Vector2(72, 72)
	b.add_theme_stylebox_override("normal", _sb(Color(pal.ink, 0.7), Color(pal.moon, 0.18), 36, 2))
	b.add_theme_stylebox_override("pressed", _sb(Color(pal.ink.lightened(0.1), 0.8), Color(pal.moon, 0.3), 36, 2))
	b.add_theme_stylebox_override("hover", _sb(Color(pal.ink, 0.8), Color(pal.moon, 0.3), 36, 2))
	var ic = _icon("back", 40, pal.moon)
	ic.position = Vector2(16, 16)
	b.add_child(ic)
	b.pressed.connect(func():
		Sfx.play("ui")
		var dest = back_to
		if back_from != "" and back_to == "title":
			dest = back_from
			back_from = ""
		show_screen(dest, last_result))
	header.add_child(b)
	var tl = _label(title, 40, pal.moon.lightened(0.15), HORIZONTAL_ALIGNMENT_LEFT, false)
	tl.add_theme_font_override("font", TITLE_FONT)
	tl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(tl)
	_coin_chip(header)


func _gap(h: float) -> void:
	var c = Control.new()
	c.custom_minimum_size = Vector2(0, h)
	box.add_child(c)


func _section(text: String) -> void:
	_gap(4)
	box.add_child(_label(text.to_upper(), 20, Color(pal.ember.lightened(0.25), 0.95), HORIZONTAL_ALIGNMENT_LEFT, false))


func _shade(strong: bool) -> void:
	var g = Gradient.new()
	var ink: Color = pal.ink.darkened(0.35)
	if strong:
		g.set_color(0, Color(ink, 0.9))
		g.set_color(1, Color(ink, 0.96))
	else:
		g.set_color(0, Color(ink, 0.85))
		g.add_point(0.42, Color(ink, 0.25))
		g.set_color(g.get_point_count() - 1, Color(ink, 0.92))
	var gt = GradientTexture2D.new()
	gt.gradient = g
	gt.fill_to = Vector2(0, 1)
	gt.width = 4
	gt.height = 256
	shade.texture = gt


# ---------------- screens ----------------
func show_screen(name: String, result: Dictionary = {}) -> void:
	screen = name
	last_result = result
	visible = name != ""
	if main and main.hud:
		main.hud.visible = name == "" and main.playing
	if name == "":
		return
	_clear()
	header.visible = name not in ["title", "clear", "over", "pause", "daily"]
	_shade(name != "title")
	match name:
		"title": _title()
		"daily": _daily()
		"heroes": _heroes()
		"armory": _armory()
		"wardrobe": _wardrobe()
		"upgrades": _upgrades()
		"quests": _quests()
		"settings": _settings()
		"pause": _pause()
		"clear": _clear_screen(result)
		"over": _over(result)


func _title() -> void:
	var top = _row(box)
	_level_chip(top)
	var sp = Control.new()
	sp.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top.add_child(sp)
	_coin_chip(top)
	_gap(30)
	var logo = _label("GLOAMWOOD", 74, pal.moon.lightened(0.25), HORIZONTAL_ALIGNMENT_CENTER, false)
	logo.add_theme_font_override("font", TITLE_FONT)
	logo.add_theme_color_override("font_outline_color", Color(pal.moss.darkened(0.3), 0.9))
	logo.add_theme_constant_override("outline_size", 10)
	logo.add_theme_color_override("font_shadow_color", Color(pal.moss.lightened(0.3), 0.45))
	logo.add_theme_constant_override("shadow_outline_size", 26)
	box.add_child(logo)
	box.add_child(_label("a lantern spirit's endless descent", 24, Color(pal.ember.lightened(0.2), 0.95)))
	_gap(250)
	if Profile.run_active():
		var r = Profile.data.run
		_btn("CONTINUE  ·  STAGE %d" % int(r.stage), func(): main.menu_play(true), true, true, null, 104)
		_btn("NEW RUN", func(): main.menu_play(false), false, true, null, 76)
	else:
		_btn("PLAY", func(): main.menu_play(false), true, true, null, 104)
	_gap(6)
	var grid = GridContainer.new()
	grid.columns = 3
	grid.add_theme_constant_override("h_separation", 14)
	grid.add_theme_constant_override("v_separation", 14)
	box.add_child(grid)
	var n = Profile.pending_rewards()
	var tiles = [
		["hero", "Heroes", "heroes", 0], ["weapon", "Armory", "armory", 0], ["wardrobe", "Wardrobe", "wardrobe", 0],
		["upgrade", "Upgrades", "upgrades", 0], ["quest", "Quests", "quests", n], ["settings", "Settings", "settings", 0],
	]
	for tl in tiles:
		grid.add_child(_tile(tl[0], tl[1], tl[2], tl[3]))
	_gap(8)
	var st = Profile.data.stats
	box.add_child(_label("Best stage %d   ·   Monsters %d   ·   Bosses %d" % [int(st.best_stage), int(st.kills), int(st.bosses)], 20, Color(pal.moon, 0.55)))
	if Profile.daily_available() and not daily_shown:
		daily_shown = true
		show_screen.call_deferred("daily")


func _tile(icon: String, text: String, dest: String, badge: int) -> Control:
	var b = Button.new()
	b.custom_minimum_size = Vector2(0, 132)
	b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	b.pressed.connect(func():
		Sfx.play("ui")
		show_screen(dest))
	var v = VBoxContainer.new()
	v.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	v.alignment = BoxContainer.ALIGNMENT_CENTER
	v.mouse_filter = Control.MOUSE_FILTER_IGNORE
	b.add_child(v)
	var ic = _icon(icon, 52, pal.moon.lerp(pal.ember, 0.25))
	ic.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	v.add_child(ic)
	var l = _label(text, 21, null, HORIZONTAL_ALIGNMENT_CENTER, false)
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	v.add_child(l)
	if badge > 0:
		var bd = Label.new()
		bd.text = " %d " % badge
		bd.add_theme_font_size_override("font_size", 20)
		bd.add_theme_color_override("font_color", Color.WHITE)
		var bsb = _sb(Color(0.9, 0.25, 0.3), Color(0, 0, 0, 0), 16)
		bsb.content_margin_left = 6
		bsb.content_margin_right = 6
		bsb.content_margin_top = 2
		bsb.content_margin_bottom = 2
		bd.add_theme_stylebox_override("normal", bsb)
		bd.position = Vector2(10, 10)
		b.add_child(bd)
	return b


func _daily() -> void:
	_gap(40)
	var ttl = _label("Daily Reward", 52, pal.moon.lightened(0.2))
	ttl.add_theme_font_override("font", TITLE_FONT)
	box.add_child(ttl)
	box.add_child(_label("Come back every day. Day 7 pays the most.", 22, Color(pal.moon, 0.7)))
	_gap(10)
	var grid = GridContainer.new()
	grid.columns = 4
	grid.add_theme_constant_override("h_separation", 12)
	grid.add_theme_constant_override("v_separation", 12)
	box.add_child(grid)
	var today = Profile.daily_day()
	for i in 7:
		var pc = PanelContainer.new()
		pc.custom_minimum_size = Vector2(146, 150)
		var is_today = i == today
		var col = pal.ember if is_today else (pal.moss if i < today else pal.moon)
		pc.add_theme_stylebox_override("panel", _sb(pal.ember.darkened(0.55) if is_today else _card_bg(), Color(col, 0.9 if is_today else 0.15), 24, 3 if is_today else 2, 0, 10))
		var v = VBoxContainer.new()
		v.alignment = BoxContainer.ALIGNMENT_CENTER
		pc.add_child(v)
		v.add_child(_label("DAY %d" % (i + 1), 18, Color(pal.moon, 0.7)))
		if i < today:
			v.add_child(_label("✓", 40, pal.moss.lightened(0.5)))
		else:
			var tr = TextureRect.new()
			tr.texture = main.hud.coin_tex
			tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
			tr.custom_minimum_size = Vector2(0, 34 if i < 6 else 44)
			v.add_child(tr)
			v.add_child(_label(str(Profile.DAILY_REWARDS[i]), 26, col.lightened(0.3)))
		grid.add_child(pc)
	_gap(10)
	_btn("CLAIM  +%d" % Profile.DAILY_REWARDS[today], func():
		var amt = Profile.claim_daily()
		Sfx.play("chest")
		main.hud.toast("Daily reward  +%d coins" % amt)
		show_screen("title"), true, true, null, 100)


func _hero_icon(h: Dictionary, owned: bool) -> Control:
	var c = Control.new()
	c.custom_minimum_size = Vector2(108, 118)
	var tint = Color(h.tint[0], h.tint[1], h.tint[2])
	var scarf = Color(h.scarf[0], h.scarf[1], h.scarf[2])
	c.draw.connect(func():
		var m = pal.moon * tint if owned else Color(0.26, 0.28, 0.36)
		var sc = scarf if owned else Color(0.3, 0.3, 0.4)
		c.draw_circle(Vector2(54, 60), 52, Color(m, 0.1))
		var body = PackedVector2Array()
		for i in 24:
			var a = PI + TAU * i / 24.0
			body.append(Vector2(54, 66) + Vector2(cos(a) * 26.0 * (1.0 + maxf(0.0, sin(a)) * 0.15), sin(a) * 40.0))
		c.draw_colored_polygon(body, m)
		c.draw_rect(Rect2(30, 68, 48, 8), sc)
		c.draw_circle(Vector2(58, 48), 14, pal.ink.darkened(0.3))
		if owned:
			c.draw_circle(Vector2(53, 48), 3, Color(0.9, 1, 1))
			c.draw_circle(Vector2(63, 48), 3, Color(0.9, 1, 1)))
	return c


func _heroes() -> void:
	_header("Heroes")
	for h in Profile.CHARACTERS:
		var owned = Profile.has_hero(h.id)
		var v = _card()
		var row = _row(v)
		row.add_child(_hero_icon(h, owned))
		var info = VBoxContainer.new()
		info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(info)
		info.add_child(_label(h.name, 32, null, HORIZONTAL_ALIGNMENT_LEFT))
		info.add_child(_label(h.desc, 20, Color(pal.moon, 0.7), HORIZONTAL_ALIGNMENT_LEFT))
		info.add_child(_label("%d HP   ·   speed %d%%   ·   %d jumps" % [int(h.hp), int(float(h.speed) * 100), int(h.air_jumps) + 1], 18, Color(pal.moss.lightened(0.5), 0.9), HORIZONTAL_ALIGNMENT_LEFT))
		var b: Button
		if owned:
			var sel = Profile.data.hero == h.id
			b = _chip_btn("IN USE" if sel else "SELECT", func(): Profile.select_hero(h.id), not sel, true)
		else:
			var lv_ok = int(Profile.data.level) >= int(h.level)
			var can = lv_ok and int(Profile.data.coins) >= int(h.cost)
			b = _chip_btn(str(int(h.cost)) if lv_ok else "Lv %d" % int(h.level), func():
				if Profile.unlock_hero(h):
					Sfx.play("levelup")
					main.hud.toast("%s unlocked!" % h.name), can, true, lv_ok)
		row.add_child(b)
		if not owned:
			v.add_child(_bar(minf(float(Profile.data.coins), float(h.cost)), float(h.cost), pal.ember, 10))


func _armory() -> void:
	_header("Armory")
	box.add_child(_label("Every weapon aims at the nearest monster in front of you, flyers overhead included. Hold SPARK to charge any weapon.", 20, Color(pal.moon, 0.7), HORIZONTAL_ALIGNMENT_LEFT))
	for w in Profile.WEAPONS:
		var owned = Profile.has_weapon(w.id)
		var v = _card()
		var row = _row(v)
		var ic = _icon("weapon", 70, (pal.moss.lightened(0.5) if owned else Color(pal.moon, 0.3)))
		ic.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		row.add_child(ic)
		var info = VBoxContainer.new()
		info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(info)
		info.add_child(_label(w.name, 30, null, HORIZONTAL_ALIGNMENT_LEFT))
		info.add_child(_label(w.desc, 20, Color(pal.moon, 0.7), HORIZONTAL_ALIGNMENT_LEFT))
		info.add_child(_label("damage %d   ·   %.1f shots/s" % [int(w.dmg), 1.0 / float(w.rate)], 18, Color(pal.moss.lightened(0.5), 0.9), HORIZONTAL_ALIGNMENT_LEFT))
		var b: Button
		if owned:
			var sel = Profile.data.weapon == w.id
			b = _chip_btn("EQUIPPED" if sel else "EQUIP", func(): Profile.equip_weapon(w.id), not sel, true)
		else:
			var lv_ok = int(Profile.data.level) >= int(w.level)
			b = _chip_btn(str(int(w.cost)) if lv_ok else "Lv %d" % int(w.level), func():
				if Profile.buy_weapon(w):
					Sfx.play("buy")
					main.hud.toast("%s unlocked!" % w.name), lv_ok and int(Profile.data.coins) >= int(w.cost), true, lv_ok)
		row.add_child(b)


func _wardrobe() -> void:
	_header("Wardrobe")
	var prev = Control.new()
	prev.custom_minimum_size = Vector2(0, 200)
	prev.draw.connect(func(): _draw_preview(prev))
	preview = prev
	box.add_child(prev)
	var tabs = _row(box)
	for slot in [["scarf", "Scarf"], ["cloak", "Cloak"], ["hat", "Hat"], ["trail", "Trail"]]:
		var b = Button.new()
		b.text = slot[1]
		b.custom_minimum_size = Vector2(0, 64)
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.add_theme_font_size_override("font_size", 22)
		if wardrobe_slot == slot[0]:
			_primary(b)
		var sl = slot[0]
		b.pressed.connect(func():
			Sfx.play("ui")
			wardrobe_slot = sl
			show_screen("wardrobe"))
		tabs.add_child(b)
	var grid = GridContainer.new()
	grid.columns = 2
	grid.add_theme_constant_override("h_separation", 14)
	grid.add_theme_constant_override("v_separation", 14)
	box.add_child(grid)
	for c in Profile.COSMETICS[wardrobe_slot]:
		var owned = Profile.owns_cos(wardrobe_slot, c.id)
		var worn = Profile.data.look[wardrobe_slot] == c.id
		var pc = PanelContainer.new()
		pc.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		if worn:
			pc.add_theme_stylebox_override("panel", _sb(_card_bg(), pal.moss.lightened(0.4), 24, 3, 0, 10))
		grid.add_child(pc)
		var v = VBoxContainer.new()
		pc.add_child(v)
		var row = _row(v)
		if c.has("col"):
			var sw = Panel.new()
			sw.custom_minimum_size = Vector2(40, 40)
			sw.add_theme_stylebox_override("panel", _sb(Color(c.col[0], c.col[1], c.col[2]), Color(1, 1, 1, 0.3), 20, 2))
			row.add_child(sw)
		row.add_child(_label(c.name, 22, null, HORIZONTAL_ALIGNMENT_LEFT, false))
		var slot2 = wardrobe_slot
		var txt = "WEARING" if worn else ("WEAR" if owned else str(int(c.cost)))
		var b2 = _chip_btn(txt, func():
			if Profile.buy_cos(slot2, c):
				Sfx.play("buy" if not owned else "ui")
				main.apply_upgrades(), not worn and (owned or int(Profile.data.coins) >= int(c.cost)), not owned, not owned)
		b2.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		v.add_child(b2)


func _draw_preview(c: Control) -> void:
	var look: Dictionary = Profile.data.look
	var h = Profile.hero_def()
	var cl = Profile.cos_def("cloak", look.cloak).col
	var sc = Profile.cos_def("scarf", look.scarf).col
	var m = pal.moon * Color(h.tint[0], h.tint[1], h.tint[2]) * Color(cl[0], cl[1], cl[2])
	var cx = c.size.x * 0.5
	c.draw_circle(Vector2(cx, 104), 96, Color(pal.moss, 0.08))
	c.draw_circle(Vector2(cx, 104), 70, Color(m, 0.08))
	var scc = Color(sc[0], sc[1], sc[2])
	var wave = PackedVector2Array()
	for i in 8:
		wave.append(Vector2(cx - 36 - i * 12, 130 + sin(t * 5.0 + i * 0.8) * 5.0))
	c.draw_polyline(wave, scc, 12, true)
	var body = PackedVector2Array()
	for i in 28:
		var a = PI + TAU * i / 28.0
		body.append(Vector2(cx, 120) + Vector2(cos(a) * 46.0 * (1.0 + maxf(0.0, sin(a)) * 0.18), sin(a) * 70.0))
	c.draw_colored_polygon(body, m)
	c.draw_rect(Rect2(cx - 44, 124, 88, 14), scc)
	c.draw_circle(Vector2(cx + 6, 88), 25, pal.ink.darkened(0.3))
	c.draw_circle(Vector2(cx - 3, 88), 4.5, Color(0.9, 1, 1))
	c.draw_circle(Vector2(cx + 15, 88), 4.5, Color(0.9, 1, 1))
	match look.hat:
		"leaf":
			c.draw_colored_polygon(PackedVector2Array([Vector2(cx + 4, 52), Vector2(cx + 24, 36), Vector2(cx + 30, 46), Vector2(cx + 12, 56)]), Color(0.45, 0.85, 0.5))
		"horns":
			for k in [-1.0, 1.0]:
				c.draw_colored_polygon(PackedVector2Array([Vector2(cx + k * 14, 56), Vector2(cx + k * 24, 54), Vector2(cx + k * 30, 30)]), Color(1.0, 0.88, 0.7))
		"antenna":
			c.draw_line(Vector2(cx + 4, 52), Vector2(cx + 12, 26), m.darkened(0.3), 3.0, true)
			c.draw_circle(Vector2(cx + 12, 22), 7, Color(1, 0.92, 0.5))
		"crown":
			c.draw_colored_polygon(PackedVector2Array([Vector2(cx - 18, 56), Vector2(cx - 20, 36), Vector2(cx - 9, 46), Vector2(cx, 30), Vector2(cx + 9, 46), Vector2(cx + 20, 36), Vector2(cx + 18, 56)]), Color(1.0, 0.8, 0.35))
	if look.trail != "none":
		var tc = {"sparkle": Color(0.9, 1, 1), "ember": Color(1, 0.6, 0.3), "petal": Color(1, 0.6, 0.75)}[look.trail]
		for i in 8:
			c.draw_circle(Vector2(cx - 70 - i * 14, 160 + sin(t * 3.0 + i) * 8.0), 5.0 - i * 0.45, Color(tc, 0.9 - i * 0.1))


func _upgrades() -> void:
	_header("Upgrades")
	for u in Profile.UPGRADES:
		var v = _card()
		var row = _row(v)
		var info = VBoxContainer.new()
		info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(info)
		info.add_child(_label(u.name, 28, null, HORIZONTAL_ALIGNMENT_LEFT))
		info.add_child(_label(u.desc, 20, Color(pal.moon, 0.7), HORIZONTAL_ALIGNMENT_LEFT))
		var lv = Profile.upgrade_level(u.id)
		var pips = HBoxContainer.new()
		pips.add_theme_constant_override("separation", 6)
		for i in u.costs.size():
			var pip = Panel.new()
			pip.custom_minimum_size = Vector2(34, 10)
			pip.add_theme_stylebox_override("panel", _sb(pal.moss.lightened(0.35) if i < lv else Color(0, 0, 0, 0.35), Color(0, 0, 0, 0), 5))
			pips.add_child(pip)
		info.add_child(pips)
		var cost = Profile.upgrade_cost(u)
		var b = _chip_btn("MAX" if cost < 0 else str(cost), func():
			if Profile.buy_upgrade(u):
				Sfx.play("buy")
				main.apply_upgrades(), cost >= 0 and int(Profile.data.coins) >= cost, true, cost >= 0)
		row.add_child(b)


func _quests() -> void:
	_header("Quests")
	if Profile.daily_available():
		_btn("Daily reward ready!", func(): show_screen("daily"), true, true, null, 80)
	_section("Today's quests")
	for i in Profile.data.daily.quests.size():
		var q = Profile.data.daily.quests[i]
		var v = _card()
		var row = _row(v)
		var info = VBoxContainer.new()
		info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(info)
		info.add_child(_label(q.text, 24, null, HORIZONTAL_ALIGNMENT_LEFT))
		info.add_child(_bar(int(q.progress), int(q.goal)))
		info.add_child(_label("%d / %d" % [int(q.progress), int(q.goal)], 18, Color(pal.moon, 0.6), HORIZONTAL_ALIGNMENT_LEFT))
		var idx = i
		var b = _chip_btn("DONE" if q.claimed else str(int(q.reward)), func():
			var r = Profile.claim_quest(idx)
			if r > 0:
				Sfx.play("chest")
				main.hud.toast("Quest reward  +%d" % r), q.done and not q.claimed, true, not q.claimed)
		row.add_child(b)
	_section("Achievements")
	var roman = ["I", "II", "III", "IV", "V"]
	for a in Profile.ACHIEVEMENTS:
		var tier = Profile.ach_tier(a)
		var maxed = tier >= a.tiers.size()
		var v2 = _card()
		var row2 = _row(v2)
		var ic = _icon("star", 44, pal.ember.lightened(0.2) if maxed else Color(pal.moon, 0.35))
		ic.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		row2.add_child(ic)
		var info2 = VBoxContainer.new()
		info2.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row2.add_child(info2)
		info2.add_child(_label("%s %s" % [a.name, roman[mini(tier, a.tiers.size() - 1)]], 24, null, HORIZONTAL_ALIGNMENT_LEFT))
		var goal = int(a.tiers[mini(tier, a.tiers.size() - 1)])
		var val = Profile.ach_value(a)
		info2.add_child(_bar(mini(val, goal), goal, pal.ember))
		info2.add_child(_label("%d / %d" % [mini(val, goal), goal], 18, Color(pal.moon, 0.6), HORIZONTAL_ALIGNMENT_LEFT))
		var b2 = _chip_btn("MAX" if maxed else str(int(a.reward[mini(tier, a.reward.size() - 1)])), func():
			var r2 = Profile.claim_ach(a)
			if r2 > 0:
				Sfx.play("levelup")
				main.hud.toast("Achievement  +%d" % r2), Profile.ach_claimable(a), true, not maxed)
		row2.add_child(b2)


func _choice(parent: Node, label: String, options: Array, current, cb: Callable) -> void:
	parent.add_child(_label(label, 22, Color(pal.moon, 0.8), HORIZONTAL_ALIGNMENT_LEFT))
	var row = _row(parent)
	for o in options:
		var b = Button.new()
		b.text = o[1]
		b.custom_minimum_size = Vector2(0, 66)
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.add_theme_font_size_override("font_size", 20)
		if o[0] == current:
			_primary(b)
		var val = o[0]
		b.pressed.connect(func():
			Sfx.play("ui")
			cb.call(val)
			show_screen("settings", last_result))
		row.add_child(b)


func _slider(parent: Node, label: String, key: String, lo: float, hi: float, after: Callable = Callable()) -> void:
	parent.add_child(_label(label, 22, Color(pal.moon, 0.8), HORIZONTAL_ALIGNMENT_LEFT))
	var s = HSlider.new()
	s.min_value = lo
	s.max_value = hi
	s.step = 0.05
	s.value = float(Profile.setting(key))
	s.custom_minimum_size = Vector2(0, 50)
	s.value_changed.connect(func(v):
		Profile.set_setting(key, v)
		if after.is_valid():
			after.call())
	parent.add_child(s)


func _settings() -> void:
	_header("Settings", "pause" if main.playing else "title")
	_section("Sound")
	var c1 = _card()
	_slider(c1, "Music", "music", 0.0, 1.0, func(): Sfx.apply_volumes())
	_slider(c1, "Sound effects", "sfx", 0.0, 1.0)
	_section("Controls")
	var c2 = _card()
	_choice(c2, "Movement", [["dpad", "D-PAD"], ["analog", "ANALOG"]], Profile.setting("control"), func(v): Profile.set_setting("control", v))
	_choice(c2, "Auto-run", [["off", "OFF"], ["hold", "HOLD"], ["always", "ALWAYS"]], Profile.setting("autorun"), func(v):
		Profile.set_setting("autorun", v)
		main.hud.auto_dir = 1.0 if v == "always" else 0.0)
	c2.add_child(_label("HOLD: keep an arrow pressed for a moment and you keep running that way. Tap the same arrow to stop, the other arrow to turn around.", 18, Color(pal.moon, 0.55), HORIZONTAL_ALIGNMENT_LEFT))
	_choice(c2, "Aim assist", [[true, "ON"], [false, "OFF"]], Profile.setting("aim_assist"), func(v): Profile.set_setting("aim_assist", v))
	_slider(c2, "Button size", "control_scale", 0.8, 1.3)
	_choice(c2, "Vibration", [[true, "ON"], [false, "OFF"]], Profile.setting("vibration"), func(v): Profile.set_setting("vibration", v))
	_section("Game")
	var c3 = _card()
	_choice(c3, "Difficulty", [[0, "RELAXED"], [1, "NORMAL"], [2, "HARD"]], int(Profile.setting("difficulty")), func(v): Profile.set_setting("difficulty", v))
	_choice(c3, "Graphics", [[0, "LOW"], [1, "HIGH"]], int(Profile.setting("quality")), func(v):
		Profile.set_setting("quality", v)
		main.apply_settings())


func _pause() -> void:
	_gap(120)
	var ttl = _label("Paused", 64, pal.moon.lightened(0.2))
	ttl.add_theme_font_override("font", TITLE_FONT)
	box.add_child(ttl)
	box.add_child(_label("Stage %d  ·  %s  ·  %s" % [main.stage, Profile.hero_def().name, Profile.weapon_def().name], 22, Color(pal.moon, 0.7)))
	_gap(40)
	_btn("RESUME", func(): main.toggle_pause(), true, true, null, 100)
	_btn("SETTINGS", func(): show_screen("settings"))
	_btn("SAVE & QUIT TO MENU", func(): main.menu_quit())


func _stat_line(parent: Node, k: String, v: String) -> void:
	var r = _row(parent)
	var a = _label(k, 23, Color(pal.moon, 0.65), HORIZONTAL_ALIGNMENT_LEFT, false)
	a.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	r.add_child(a)
	r.add_child(_label(v, 25, null, HORIZONTAL_ALIGNMENT_RIGHT, false))


func _stars_row(n: int) -> void:
	var row = _row(box)
	row.alignment = BoxContainer.ALIGNMENT_CENTER
	for i in 3:
		row.add_child(_icon("star", 84, pal.ember.lightened(0.25) if i < n else Color(pal.moon, 0.15)))


func _clear_screen(r: Dictionary) -> void:
	_gap(20)
	var ttl = _label("Stage %d Clear!" % int(r.stage), 54, pal.moss.lightened(0.55))
	ttl.add_theme_font_override("font", TITLE_FONT)
	box.add_child(ttl)
	_stars_row(int(r.stars))
	box.add_child(_label(r.star_text, 19, Color(pal.moon, 0.6)))
	var c = _card()
	_stat_line(c, "Time", "%d:%02d" % [int(r.time) / 60, int(r.time) % 60])
	_stat_line(c, "Coins", "%d / %d" % [int(r.coins), int(r.coins_total)])
	_stat_line(c, "Monsters", str(int(r.kills)))
	_stat_line(c, "Best combo", str(int(r.combo)))
	_stat_line(c, "Stage bonus", "+%d coins" % int(r.bonus))
	_stat_line(c, "Experience", "+%d XP" % int(r.xp))
	if r.get("record", false):
		box.add_child(_label("NEW RECORD!", 32, pal.ember.lightened(0.2)))
	if r.levels.size() > 0:
		box.add_child(_label("LEVEL UP!  Lv %d" % int(r.levels[-1]), 34, pal.moss.lightened(0.6)))
	var top = _row(box)
	top.alignment = BoxContainer.ALIGNMENT_CENTER
	_level_chip(top)
	_coin_chip(top)
	var nxt = int(r.stage) + 1
	_btn("NEXT  ·  STAGE %d%s" % [nxt, "  ·  BOSS" if LevelGen.is_boss_stage(nxt) else ""], func(): main.menu_next(), true, true, null, 100)
	var row = _row(box)
	for pair in [["Upgrades", "upgrades"], ["Armory", "armory"]]:
		var dest = pair[1]
		var b = _btn(pair[0], func():
			back_from = "clear"
			show_screen(dest, last_result), false, true, row, 76)
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_btn("Save & menu", func(): main.menu_quit(), false, true, null, 70)


func _over(r: Dictionary) -> void:
	_gap(60)
	var ttl = _label("You fell...", 58, Color(1, 0.65, 0.65))
	ttl.add_theme_font_override("font", TITLE_FONT)
	box.add_child(ttl)
	box.add_child(_label("Coins, XP and unlocks are kept. Try an upgrade or a new weapon!", 21, Color(pal.moon, 0.7)))
	var c = _card()
	_stat_line(c, "Stage", str(int(r.stage)))
	_stat_line(c, "Monsters", str(int(r.kills)))
	_stat_line(c, "Coins this stage", str(int(r.coins)))
	_btn("RETRY FROM CHECKPOINT", func(): main.menu_retry(), true, true, null, 100)
	var row = _row(box)
	for pair in [["Upgrades", "upgrades"], ["Armory", "armory"]]:
		var dest = pair[1]
		var b = _btn(pair[0], func():
			back_from = "over"
			show_screen(dest, last_result), false, true, row, 76)
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_btn("Save & menu", func(): main.menu_quit(), false, true, null, 70)
