class_name Menu
extends Control
## All menu screens, built from Godot Controls with a code-made theme.

var main: Node
var pal: Dictionary = {}
var screen := ""
var dim: ColorRect
var box: VBoxContainer
var theme_main: Theme
var font: Font
var last_result: Dictionary = {}
var back_from := ""
var daily_shown := false
const UI_FONT := preload("res://assets/fonts/DejaVuSans-Bold.ttf")
const TITLE_FONT := preload("res://assets/fonts/DejaVuSerif-Bold.ttf")


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	font = UI_FONT
	dim = ColorRect.new()
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(dim)
	var margin = MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	for side in ["left", "right"]:
		margin.add_theme_constant_override("margin_" + side, 44)
	margin.add_theme_constant_override("margin_top", 110)
	margin.add_theme_constant_override("margin_bottom", 60)
	add_child(margin)
	var scroll = ScrollContainer.new()
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	margin.add_child(scroll)
	box = VBoxContainer.new()
	box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	box.add_theme_constant_override("separation", 16)
	scroll.add_child(box)
	Profile.changed.connect(func(): if screen in ["title", "upgrades", "heroes", "quests"]: _refresh_soon())


var _refresh_pending := false
func _refresh_soon() -> void:
	if _refresh_pending:
		return
	_refresh_pending = true
	await get_tree().process_frame
	_refresh_pending = false
	if screen != "":
		show_screen(screen, last_result)


func set_palette(p: Dictionary) -> void:
	pal = p
	theme_main = _make_theme()
	theme = theme_main
	dim.color = Color(p.ink.darkened(0.3), 0.72)


func _sb(bg: Color, border: Color, radius: int = 22, bw: int = 2) -> StyleBoxFlat:
	var s = StyleBoxFlat.new()
	s.bg_color = bg
	s.border_color = border
	s.set_border_width_all(bw)
	s.set_corner_radius_all(radius)
	s.content_margin_left = 22
	s.content_margin_right = 22
	s.content_margin_top = 14
	s.content_margin_bottom = 14
	return s


func _make_theme() -> Theme:
	var th = Theme.new()
	th.default_font_size = 28
	th.default_font = UI_FONT
	var moon: Color = pal.moon
	var ink: Color = pal.ink
	th.set_stylebox("normal", "Button", _sb(Color(ink.lerp(pal.dusk, 0.35), 0.92), Color(moon, 0.25)))
	th.set_stylebox("hover", "Button", _sb(Color(ink.lerp(pal.dusk, 0.5), 0.95), Color(moon, 0.45)))
	th.set_stylebox("pressed", "Button", _sb(Color(pal.moss.darkened(0.35), 0.95), Color(pal.moss.lightened(0.5), 0.8)))
	th.set_stylebox("disabled", "Button", _sb(Color(ink, 0.7), Color(moon, 0.1)))
	th.set_stylebox("focus", "Button", StyleBoxEmpty.new())
	th.set_color("font_color", "Button", moon)
	th.set_color("font_hover_color", "Button", Color.WHITE)
	th.set_color("font_pressed_color", "Button", Color.WHITE)
	th.set_color("font_disabled_color", "Button", Color(moon, 0.35))
	th.set_color("font_color", "Label", moon)
	th.set_stylebox("panel", "PanelContainer", _sb(Color(ink, 0.82), Color(moon, 0.16), 26))
	th.set_stylebox("background", "ProgressBar", _sb(Color(moon, 0.1), Color(0, 0, 0, 0), 8, 0))
	th.set_stylebox("fill", "ProgressBar", _sb(pal.moss.lightened(0.2), Color(0, 0, 0, 0), 8, 0))
	th.set_stylebox("slider", "HSlider", _sb(Color(moon, 0.15), Color(0, 0, 0, 0), 8, 0))
	th.set_stylebox("grabber_area", "HSlider", _sb(pal.moss.lightened(0.2), Color(0, 0, 0, 0), 8, 0))
	th.set_stylebox("grabber_area_highlight", "HSlider", _sb(pal.moss.lightened(0.35), Color(0, 0, 0, 0), 8, 0))
	return th


# ---------------- widgets ----------------
func _clear() -> void:
	for c in box.get_children():
		c.queue_free()


func _label(text: String, size: int = 28, col = null, align: int = HORIZONTAL_ALIGNMENT_CENTER, wrap: bool = true) -> Label:
	var l = Label.new()
	l.text = text
	l.horizontal_alignment = align
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART if wrap else TextServer.AUTOWRAP_OFF
	l.add_theme_font_size_override("font_size", size)
	if col != null:
		l.add_theme_color_override("font_color", col)
	return l


func _btn(text: String, cb: Callable, primary: bool = false, enabled: bool = true, parent: Node = null) -> Button:
	var b = Button.new()
	b.text = text
	b.custom_minimum_size = Vector2(0, 84)
	b.disabled = not enabled
	b.add_theme_font_size_override("font_size", 30)
	if primary:
		b.add_theme_stylebox_override("normal", _sb(pal.ember.darkened(0.35), pal.ember.lightened(0.3)))
		b.add_theme_stylebox_override("hover", _sb(pal.ember.darkened(0.2), pal.ember.lightened(0.5)))
		b.add_theme_color_override("font_color", Color(1, 0.97, 0.9))
	b.pressed.connect(func():
		Sfx.play("ui")
		cb.call())
	(parent if parent else box).add_child(b)
	return b


func _small_btn(text: String, cb: Callable, enabled: bool, primary: bool = false) -> Button:
	var b = Button.new()
	b.text = text
	b.custom_minimum_size = Vector2(170, 64)
	b.disabled = not enabled
	b.add_theme_font_size_override("font_size", 24)
	if primary and enabled:
		b.add_theme_stylebox_override("normal", _sb(pal.ember.darkened(0.35), pal.ember.lightened(0.3), 18))
	b.pressed.connect(func():
		cb.call())
	return b


func _bar(v: float, mx: float, col = null) -> ProgressBar:
	var p = ProgressBar.new()
	p.max_value = maxf(mx, 1.0)
	p.value = v
	p.show_percentage = false
	p.custom_minimum_size = Vector2(0, 14)
	if col != null:
		p.add_theme_stylebox_override("fill", _sb(col, Color(0, 0, 0, 0), 8, 0))
	return p


func _panel() -> VBoxContainer:
	var pc = PanelContainer.new()
	box.add_child(pc)
	var v = VBoxContainer.new()
	v.add_theme_constant_override("separation", 8)
	pc.add_child(v)
	return v


func _row(parent: Node) -> HBoxContainer:
	var h = HBoxContainer.new()
	h.add_theme_constant_override("separation", 14)
	parent.add_child(h)
	return h


func _coins_header() -> void:
	var h = _row(box)
	h.alignment = BoxContainer.ALIGNMENT_CENTER
	var lv = int(Profile.data.level)
	h.add_child(_label("Lv %d" % lv, 30, pal.moss.lightened(0.5), HORIZONTAL_ALIGNMENT_CENTER, false))
	var bar = _bar(int(Profile.data.xp), Profile.xp_needed(lv))
	bar.custom_minimum_size = Vector2(220, 16)
	bar.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	h.add_child(bar)
	h.add_child(_label("   ● %d" % int(Profile.data.coins), 30, pal.ember.lightened(0.2), HORIZONTAL_ALIGNMENT_CENTER, false))


# ---------------- screens ----------------
func show_screen(name: String, result: Dictionary = {}) -> void:
	screen = name
	last_result = result
	visible = name != ""
	if main and main.hud:
		main.hud.visible = name == "" and main.playing
	_clear()
	dim.color.a = 0.35 if name == "title" else 0.75
	match name:
		"title": _title()
		"daily": _daily()
		"heroes": _heroes()
		"upgrades": _upgrades()
		"quests": _quests()
		"settings": _settings()
		"pause": _pause()
		"clear": _clear_screen(result)
		"over": _over(result)


func _title() -> void:
	var t = _label("GLOAMWOOD", 70, pal.moon.lightened(0.2), HORIZONTAL_ALIGNMENT_CENTER, false)
	t.add_theme_font_override("font", TITLE_FONT)
	t.add_theme_color_override("font_shadow_color", Color(pal.moss, 0.6))
	t.add_theme_constant_override("shadow_offset_y", 4)
	t.add_theme_constant_override("shadow_outline_size", 18)
	box.add_child(t)
	box.add_child(_label("a lantern spirit's endless descent", 26, Color(pal.ember, 0.9)))
	var sp = Control.new()
	sp.custom_minimum_size = Vector2(0, 30)
	box.add_child(sp)
	_coins_header()
	if Profile.run_active():
		var r = Profile.data.run
		_btn("CONTINUE  ·  Stage %d" % int(r.stage), func(): main.menu_play(true), true)
		_btn("NEW RUN", func(): main.menu_play(false))
	else:
		_btn("PLAY", func(): main.menu_play(false), true)
	var hero = Profile.hero_def()
	_btn("HEROES  ·  %s" % hero.name, func(): show_screen("heroes"))
	_btn("UPGRADES", func(): show_screen("upgrades"))
	var n = Profile.pending_rewards()
	_btn("QUESTS & REWARDS" + ("  (%d)" % n if n > 0 else ""), func(): show_screen("quests"), n > 0)
	_btn("SETTINGS", func(): show_screen("settings"))
	var st = Profile.data.stats
	box.add_child(_label("Best stage %d   ·   Monsters %d   ·   Bosses %d" % [int(st.best_stage), int(st.kills), int(st.bosses)], 22, Color(pal.moon, 0.55)))
	if Profile.daily_available() and not daily_shown:
		daily_shown = true
		show_screen.call_deferred("daily")


func _daily() -> void:
	box.add_child(_label("Daily Reward", 56))
	box.add_child(_label("Come back each day. The 7th day pays the most.", 24, Color(pal.moon, 0.7)))
	var grid = GridContainer.new()
	grid.columns = 4
	grid.add_theme_constant_override("h_separation", 12)
	grid.add_theme_constant_override("v_separation", 12)
	box.add_child(grid)
	var today = Profile.daily_day()
	for i in 7:
		var pc = PanelContainer.new()
		pc.custom_minimum_size = Vector2(142, 130)
		var col = pal.ember if i == today else (pal.moss if i < today else pal.moon)
		pc.add_theme_stylebox_override("panel", _sb(Color(pal.ink, 0.85) if i != today else pal.ember.darkened(0.55), Color(col, 0.8 if i == today else 0.25), 20, 3 if i == today else 2))
		var v = VBoxContainer.new()
		v.alignment = BoxContainer.ALIGNMENT_CENTER
		pc.add_child(v)
		v.add_child(_label("Day %d" % (i + 1), 22, Color(pal.moon, 0.8)))
		v.add_child(_label(("✓" if i < today else "● %d" % Profile.DAILY_REWARDS[i]), 30 if i != 6 else 34, col.lightened(0.3)))
		grid.add_child(pc)
	_btn("CLAIM  +%d" % Profile.DAILY_REWARDS[today], func():
		var amt = Profile.claim_daily()
		Sfx.play("chest")
		main.hud.toast("Daily reward +%d coins" % amt)
		show_screen("title"), true)


func _hero_icon(h: Dictionary, owned: bool) -> Control:
	var c = Control.new()
	c.custom_minimum_size = Vector2(110, 120)
	var tint = Color(h.tint[0], h.tint[1], h.tint[2])
	var scarf = Color(h.scarf[0], h.scarf[1], h.scarf[2])
	c.draw.connect(func():
		var m = pal.moon * tint
		if not owned:
			m = Color(0.25, 0.27, 0.35)
			scarf = Color(0.3, 0.3, 0.4)
		c.draw_circle(Vector2(55, 60), 52, Color(m, 0.12))
		var body = PackedVector2Array()
		for i in 24:
			var a = PI + TAU * i / 24.0
			var r = Vector2(26, 40)
			body.append(Vector2(55, 64) + Vector2(cos(a) * r.x * (1.0 + maxf(0.0, sin(a)) * 0.15), sin(a) * r.y))
		c.draw_colored_polygon(body, m)
		c.draw_rect(Rect2(31, 66, 48, 8), scarf)
		c.draw_circle(Vector2(60, 46), 14, pal.ink.darkened(0.3))
		if owned:
			c.draw_circle(Vector2(55, 46), 3, Color(0.9, 1, 1))
			c.draw_circle(Vector2(65, 46), 3, Color(0.9, 1, 1))
		else:
			c.draw_string(font, Vector2(40, 108), "?", HORIZONTAL_ALIGNMENT_CENTER, 30, 30, Color(1, 1, 1, 0.5)))
	return c


func _heroes() -> void:
	box.add_child(_label("Heroes", 56))
	_coins_header()
	for h in Profile.CHARACTERS:
		var owned = Profile.has_hero(h.id)
		var v = _panel()
		var row = _row(v)
		row.add_child(_hero_icon(h, owned))
		var info = VBoxContainer.new()
		info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(info)
		info.add_child(_label(h.name, 34, null, HORIZONTAL_ALIGNMENT_LEFT))
		info.add_child(_label(h.desc, 22, Color(pal.moon, 0.7), HORIZONTAL_ALIGNMENT_LEFT))
		info.add_child(_label("♥ %d   speed %d%%   jumps %d" % [int(h.hearts), int(float(h.speed) * 100), int(h.air_jumps) + 1], 20, Color(pal.moon, 0.55), HORIZONTAL_ALIGNMENT_LEFT))
		var b: Button
		if owned:
			var sel = Profile.data.hero == h.id
			b = _small_btn("SELECTED" if sel else "SELECT", func(): Profile.select_hero(h.id), not sel)
		else:
			var lv_ok = int(Profile.data.level) >= int(h.level)
			var can = lv_ok and int(Profile.data.coins) >= int(h.cost)
			var txt = "● %d" % int(h.cost) if lv_ok else "Lv %d" % int(h.level)
			b = _small_btn(txt, func():
				if Profile.unlock_hero(h):
					Sfx.play("levelup")
					main.hud.toast("%s unlocked!" % h.name), can, true)
		b.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		row.add_child(b)
		if not owned:
			var prog = minf(float(Profile.data.coins) / maxf(float(h.cost), 1.0), 1.0)
			v.add_child(_bar(prog, 1.0, pal.ember))
	_btn("BACK", func(): show_screen("title"))


func _upgrades() -> void:
	box.add_child(_label("Upgrades", 56))
	_coins_header()
	for u in Profile.UPGRADES:
		var v = _panel()
		var row = _row(v)
		var info = VBoxContainer.new()
		info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(info)
		info.add_child(_label(u.name, 32, null, HORIZONTAL_ALIGNMENT_LEFT))
		info.add_child(_label(u.desc, 22, Color(pal.moon, 0.7), HORIZONTAL_ALIGNMENT_LEFT))
		var lv = Profile.upgrade_level(u.id)
		var pips = ""
		for i in u.costs.size():
			pips += ("◆ " if i < lv else "◇ ")
		info.add_child(_label(pips, 26, pal.moss.lightened(0.5), HORIZONTAL_ALIGNMENT_LEFT))
		var cost = Profile.upgrade_cost(u)
		var b = _small_btn("MAX" if cost < 0 else "● %d" % cost, func():
			if Profile.buy_upgrade(u):
				Sfx.play("buy")
				main.apply_upgrades(), cost >= 0 and int(Profile.data.coins) >= cost, true)
		b.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		row.add_child(b)
	_btn("BACK", func():
		var dest = back_from if back_from != "" else "title"
		back_from = ""
		show_screen(dest, last_result))


func _quests() -> void:
	box.add_child(_label("Quests & Rewards", 52))
	_coins_header()
	if Profile.daily_available():
		_btn("Daily reward ready!", func(): show_screen("daily"), true)
	box.add_child(_label("Today's quests", 30, pal.ember.lightened(0.2)))
	for i in Profile.data.daily.quests.size():
		var q = Profile.data.daily.quests[i]
		var v = _panel()
		var row = _row(v)
		var info = VBoxContainer.new()
		info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(info)
		info.add_child(_label(q.text, 26, null, HORIZONTAL_ALIGNMENT_LEFT))
		info.add_child(_bar(int(q.progress), int(q.goal)))
		info.add_child(_label("%d / %d" % [int(q.progress), int(q.goal)], 20, Color(pal.moon, 0.6), HORIZONTAL_ALIGNMENT_LEFT))
		var idx = i
		var txt = "DONE" if q.claimed else "● %d" % int(q.reward)
		var b = _small_btn(txt, func():
			var r = Profile.claim_quest(idx)
			if r > 0:
				Sfx.play("chest")
				main.hud.toast("Quest reward +%d" % r), q.done and not q.claimed, true)
		b.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		row.add_child(b)
	box.add_child(_label("Achievements", 30, pal.ember.lightened(0.2)))
	for a in Profile.ACHIEVEMENTS:
		var tier = Profile.ach_tier(a)
		var v2 = _panel()
		var row2 = _row(v2)
		var info2 = VBoxContainer.new()
		info2.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row2.add_child(info2)
		var roman = ["I", "II", "III", "IV", "V"]
		var maxed = tier >= a.tiers.size()
		info2.add_child(_label("%s %s" % [a.name, roman[mini(tier, a.tiers.size() - 1)]] + ("  ★" if maxed else ""), 26, null, HORIZONTAL_ALIGNMENT_LEFT))
		var goal = int(a.tiers[mini(tier, a.tiers.size() - 1)])
		var val = Profile.ach_value(a)
		info2.add_child(_bar(mini(val, goal), goal, pal.ember))
		info2.add_child(_label("%d / %d" % [mini(val, goal), goal], 20, Color(pal.moon, 0.6), HORIZONTAL_ALIGNMENT_LEFT))
		var b2 = _small_btn("MAX" if maxed else "● %d" % int(a.reward[mini(tier, a.reward.size() - 1)]), func():
			var r2 = Profile.claim_ach(a)
			if r2 > 0:
				Sfx.play("levelup")
				main.hud.toast("Achievement +%d" % r2), Profile.ach_claimable(a), true)
		b2.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		row2.add_child(b2)
	_btn("BACK", func(): show_screen("title"))


func _choice(label: String, options: Array, current, cb: Callable) -> void:
	box.add_child(_label(label, 26, Color(pal.moon, 0.8), HORIZONTAL_ALIGNMENT_LEFT))
	var row = _row(box)
	for o in options:
		var b = Button.new()
		b.text = o[1]
		b.toggle_mode = true
		b.button_pressed = o[0] == current
		b.custom_minimum_size = Vector2(0, 72)
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		if o[0] == current:
			b.add_theme_stylebox_override("normal", _sb(pal.moss.darkened(0.35), pal.moss.lightened(0.5)))
		var val = o[0]
		b.pressed.connect(func():
			Sfx.play("ui")
			cb.call(val)
			show_screen("settings"))
		row.add_child(b)


func _slider(label: String, key: String, lo: float, hi: float, after: Callable = Callable()) -> void:
	box.add_child(_label(label, 26, Color(pal.moon, 0.8), HORIZONTAL_ALIGNMENT_LEFT))
	var s = HSlider.new()
	s.min_value = lo
	s.max_value = hi
	s.step = 0.05
	s.value = float(Profile.setting(key))
	s.custom_minimum_size = Vector2(0, 56)
	s.value_changed.connect(func(v):
		Profile.set_setting(key, v)
		if after.is_valid():
			after.call())
	box.add_child(s)


func _settings() -> void:
	box.add_child(_label("Settings", 56))
	_slider("Music", "music", 0.0, 1.0, func(): Sfx.apply_volumes())
	_slider("Sound effects", "sfx", 0.0, 1.0)
	_choice("Movement controls", [["dpad", "D-PAD"], ["analog", "ANALOG"]], Profile.setting("control"), func(v): Profile.set_setting("control", v))
	_slider("Control size", "control_scale", 0.8, 1.3)
	_choice("Vibration", [[true, "ON"], [false, "OFF"]], Profile.setting("vibration"), func(v): Profile.set_setting("vibration", v))
	_choice("Difficulty (next stage)", [[0, "RELAXED"], [1, "NORMAL"], [2, "HARD"]], int(Profile.setting("difficulty")), func(v): Profile.set_setting("difficulty", v))
	_choice("Graphics", [[0, "LOW"], [1, "HIGH"]], int(Profile.setting("quality")), func(v):
		Profile.set_setting("quality", v)
		main.apply_settings())
	_btn("BACK", func():
		Profile.save()
		show_screen("pause" if main.playing else "title"))


func _pause() -> void:
	box.add_child(_label("Paused", 64))
	_coins_header()
	box.add_child(_label("Stage %d  ·  %s" % [main.stage, Profile.hero_def().name], 26, Color(pal.moon, 0.7)))
	_btn("RESUME", func(): main.toggle_pause(), true)
	_btn("SETTINGS", func(): show_screen("settings"))
	_btn("SAVE & QUIT TO MENU", func(): main.menu_quit())


func _stars(n: int) -> String:
	var s = ""
	for i in 3:
		s += "★ " if i < n else "☆ "
	return s


func _stat_line(k: String, v: String) -> void:
	var r = _row(box)
	var a = _label(k, 26, Color(pal.moon, 0.7), HORIZONTAL_ALIGNMENT_LEFT, false)
	a.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	r.add_child(a)
	r.add_child(_label(v, 28, null, HORIZONTAL_ALIGNMENT_RIGHT, false))


func _clear_screen(r: Dictionary) -> void:
	box.add_child(_label("Stage %d Clear!" % int(r.stage), 58, pal.moss.lightened(0.5)))
	box.add_child(_label(_stars(int(r.stars)), 64, pal.ember.lightened(0.2)))
	box.add_child(_label(r.star_text, 22, Color(pal.moon, 0.6)))
	_stat_line("Time", "%d:%02d" % [int(r.time) / 60, int(r.time) % 60])
	_stat_line("Coins", "%d / %d" % [int(r.coins), int(r.coins_total)])
	_stat_line("Monsters", str(int(r.kills)))
	_stat_line("Best combo", str(int(r.combo)))
	_stat_line("Stage bonus", "+%d" % int(r.bonus))
	_stat_line("XP", "+%d" % int(r.xp))
	if r.get("record", false):
		box.add_child(_label("NEW RECORD!", 34, pal.ember))
	if r.levels.size() > 0:
		box.add_child(_label("LEVEL UP!  Lv %d" % int(r.levels[-1]), 38, pal.moss.lightened(0.6)))
	_coins_header()
	var nxt = int(r.stage) + 1
	_btn("NEXT  ·  Stage %d%s" % [nxt, "  (BOSS)" if LevelGen.is_boss_stage(nxt) else ""], func(): main.menu_next(), true)
	_btn("UPGRADES", func():
		back_from = "clear"
		show_screen("upgrades", last_result))
	_btn("SAVE & MENU", func(): main.menu_quit())


func _over(r: Dictionary) -> void:
	box.add_child(_label("Out of hearts", 58, Color(1, 0.6, 0.6)))
	box.add_child(_label("Your coins and progress are kept.", 24, Color(pal.moon, 0.7)))
	_stat_line("Stage", str(int(r.stage)))
	_stat_line("Monsters", str(int(r.kills)))
	_stat_line("Coins this stage", str(int(r.coins)))
	_coins_header()
	_btn("RETRY FROM CHECKPOINT", func(): main.menu_retry(), true)
	_btn("UPGRADES", func():
		back_from = "over"
		show_screen("upgrades", last_result))
	_btn("SAVE & MENU", func(): main.menu_quit())
