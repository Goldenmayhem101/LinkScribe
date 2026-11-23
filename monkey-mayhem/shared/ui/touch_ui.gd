class_name TouchUI
extends CanvasLayer
## Landscape touch controls: joystick (left), look-drag (right half of the screen),
## GRAB / THROW / JUMP / USE buttons, chaos bar and mission banner.
## Built in code so the layout lives in one readable place.

signal grab_pressed
signal throw_pressed
signal jump_pressed
signal use_pressed

@export var joystick_radius: float = 70.0
@export var look_sensitivity: float = 0.0045

var move_input: Vector2 = Vector2.ZERO
var look_delta: Vector2 = Vector2.ZERO

var _joy_index: int = -1
var _look_index: int = -1
var _joy_center: Vector2 = Vector2.ZERO
var _joy_base: Control
var _joy_knob: Control
var _chaos_bar: ProgressBar
var _tier_label: Label
var _mission_label: Label
var _buttons: Array[Control] = []
var _banana_label: Label


## Round dot used for the joystick base and knob.
class RoundDot extends Control:
	var fill: Color = Color(1, 1, 1, 0.18)
	var edge: Color = Color(1, 1, 1, 0.55)

	func _draw() -> void:
		var c: Vector2 = size * 0.5
		draw_circle(c, size.x * 0.5, fill)
		draw_arc(c, size.x * 0.5 - 1.5, 0.0, TAU, 48, edge, 3.0, true)


func _ready() -> void:
	layer = 10
	var root: Control = Control.new()
	root.name = "HUDRoot"
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(root)

	_build_joystick(root)
	_build_buttons(root)
	_build_chaos(root)
	_build_mission(root)
	_build_bananas(root)

	SignalBus.chaos_changed.connect(_on_chaos_changed)
	SignalBus.mission_progress_updated.connect(_on_mission_progress)
	SignalBus.mission_completed.connect(_on_mission_completed)
	_on_chaos_changed(0, 1)
	_reset_joystick()


# ---------------------------------------------------------------- building

func _build_joystick(root: Control) -> void:
	_joy_base = RoundDot.new()
	_joy_base.name = "JoystickBase"
	_joy_base.size = Vector2(170, 170)
	_joy_base.set_anchors_preset(Control.PRESET_BOTTOM_LEFT)
	_joy_base.offset_left = 50
	_joy_base.offset_top = -220
	_joy_base.offset_right = 220
	_joy_base.offset_bottom = -50
	_joy_base.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(_joy_base)

	_joy_knob = RoundDot.new()
	_joy_knob.name = "JoystickKnob"
	_joy_knob.size = Vector2(70, 70)
	(_joy_knob as RoundDot).fill = Color(1, 1, 1, 0.55)
	(_joy_knob as RoundDot).edge = Color(1, 1, 1, 0.9)
	_joy_knob.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_joy_base.add_child(_joy_knob)


func _make_button(root: Control, label: String, icon_path: String, circle_path: String, right: float, bottom: float, diameter: float) -> TextureButton:
	var b: TextureButton = TextureButton.new()
	b.name = label.capitalize() + "Button"
	b.texture_normal = load(circle_path) as Texture2D
	b.ignore_texture_size = true
	b.stretch_mode = TextureButton.STRETCH_KEEP_ASPECT_CENTERED
	b.focus_mode = Control.FOCUS_NONE
	b.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	b.offset_right = -right
	b.offset_left = -right - diameter
	b.offset_bottom = -bottom
	b.offset_top = -bottom - diameter
	if icon_path != "":
		var icon: TextureRect = TextureRect.new()
		icon.texture = load(icon_path) as Texture2D
		icon.set_anchors_preset(Control.PRESET_FULL_RECT)
		icon.offset_left = diameter * 0.2
		icon.offset_right = -diameter * 0.2
		icon.offset_top = diameter * 0.2
		icon.offset_bottom = -diameter * 0.2
		icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
		b.add_child(icon)
	else:
		var l: Label = Label.new()
		l.text = label
		l.set_anchors_preset(Control.PRESET_FULL_RECT)
		l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		l.add_theme_font_size_override("font_size", int(diameter * 0.26))
		l.add_theme_color_override("font_outline_color", Color(0.09, 0.06, 0.27))
		l.add_theme_constant_override("outline_size", 6)
		l.mouse_filter = Control.MOUSE_FILTER_IGNORE
		b.add_child(l)
	b.button_down.connect(func() -> void: b.modulate = Color(0.75, 0.75, 0.75))
	b.button_up.connect(func() -> void: b.modulate = Color.WHITE)
	root.add_child(b)
	_buttons.append(b)
	return b


func _build_buttons(root: Control) -> void:
	var grab: TextureButton = _make_button(root, "GRAB", "res://art/ui/icon2_01.png", "res://art/ui/btn_10.png", 150, 150, 120)
	var throw_b: TextureButton = _make_button(root, "THROW", "res://art/ui/icon2_02.png", "res://art/ui/btn_08.png", 50, 175, 105)
	var jump: TextureButton = _make_button(root, "JUMP", "res://art/ui/icon2_03.png", "res://art/ui/btn_06.png", 40, 40, 100)
	var use_b: TextureButton = _make_button(root, "USE", "", "res://art/ui/btn_07.png", 280, 60, 85)
	grab.pressed.connect(func() -> void: grab_pressed.emit())
	throw_b.pressed.connect(func() -> void: throw_pressed.emit())
	jump.pressed.connect(func() -> void: jump_pressed.emit())
	use_b.pressed.connect(func() -> void: use_pressed.emit())


func _build_chaos(root: Control) -> void:
	_chaos_bar = ProgressBar.new()
	_chaos_bar.name = "ChaosBar"
	_chaos_bar.max_value = 100.0
	_chaos_bar.show_percentage = false
	_chaos_bar.set_anchors_preset(Control.PRESET_CENTER_TOP)
	_chaos_bar.offset_left = -170
	_chaos_bar.offset_right = 170
	_chaos_bar.offset_top = 16
	_chaos_bar.offset_bottom = 42
	_chaos_bar.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var bg: StyleBoxFlat = StyleBoxFlat.new()
	bg.bg_color = Color(0, 0, 0, 0.5)
	bg.set_corner_radius_all(13)
	bg.set_border_width_all(3)
	bg.border_color = Color.WHITE
	var fg: StyleBoxFlat = StyleBoxFlat.new()
	fg.bg_color = Color(0.95, 0.7, 0.15)
	fg.set_corner_radius_all(11)
	_chaos_bar.add_theme_stylebox_override("background", bg)
	_chaos_bar.add_theme_stylebox_override("fill", fg)
	root.add_child(_chaos_bar)

	var gauge: TextureRect = TextureRect.new()
	gauge.texture = load("res://art/ui/icon2_04.png") as Texture2D
	gauge.set_anchors_preset(Control.PRESET_CENTER_TOP)
	gauge.offset_left = -236
	gauge.offset_right = -176
	gauge.offset_top = 4
	gauge.offset_bottom = 64
	gauge.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	gauge.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	gauge.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(gauge)

	_tier_label = Label.new()
	_tier_label.name = "TierLabel"
	_tier_label.set_anchors_preset(Control.PRESET_CENTER_TOP)
	_tier_label.offset_left = -200
	_tier_label.offset_right = 200
	_tier_label.offset_top = 46
	_tier_label.offset_bottom = 72
	_tier_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_tier_label.add_theme_font_size_override("font_size", 18)
	_tier_label.add_theme_color_override("font_outline_color", Color(0, 0, 0))
	_tier_label.add_theme_constant_override("outline_size", 6)
	_tier_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(_tier_label)


func _build_bananas(root: Control) -> void:
	var coin: TextureRect = TextureRect.new()
	coin.texture = load("res://art/ui/icon1_01.png") as Texture2D
	coin.offset_left = 16
	coin.offset_top = 12
	coin.offset_right = 70
	coin.offset_bottom = 66
	coin.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	coin.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	coin.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(coin)
	_banana_label = Label.new()
	_banana_label.text = "0"
	_banana_label.offset_left = 78
	_banana_label.offset_top = 20
	_banana_label.offset_right = 200
	_banana_label.offset_bottom = 60
	_banana_label.add_theme_font_size_override("font_size", 28)
	_banana_label.add_theme_color_override("font_outline_color", Color(0.09, 0.06, 0.27))
	_banana_label.add_theme_constant_override("outline_size", 8)
	_banana_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(_banana_label)


func set_bananas(amount: int) -> void:
	_banana_label.text = str(amount)


func _build_mission(root: Control) -> void:
	_mission_label = Label.new()
	_mission_label.name = "MissionLabel"
	_mission_label.text = "Mission: (coming soon)"
	_mission_label.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	_mission_label.offset_left = -380
	_mission_label.offset_right = -76
	_mission_label.offset_top = 18
	_mission_label.offset_bottom = 62
	_mission_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_mission_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_mission_label.add_theme_font_size_override("font_size", 17)
	_mission_label.add_theme_color_override("font_outline_color", Color(0, 0, 0))
	_mission_label.add_theme_constant_override("outline_size", 6)
	_mission_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(_mission_label)
	var scroll: TextureRect = TextureRect.new()
	scroll.texture = load("res://art/ui/icon1_03.png") as Texture2D
	scroll.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	scroll.offset_left = -66
	scroll.offset_right = -12
	scroll.offset_top = 10
	scroll.offset_bottom = 64
	scroll.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	scroll.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	scroll.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(scroll)


# ------------------------------------------------------------------ input

func _input(event: InputEvent) -> void:
	var half_x: float = get_viewport().get_visible_rect().size.x * 0.5
	if event is InputEventScreenTouch:
		var touch: InputEventScreenTouch = event
		if touch.pressed:
			if _over_button(touch.position):
				return
			if touch.position.x < half_x and _joy_index == -1:
				_joy_index = touch.index
				_joy_center = _joy_base.global_position + _joy_base.size * 0.5
				_update_joystick(touch.position)
			elif touch.position.x >= half_x and _look_index == -1:
				_look_index = touch.index
		else:
			if touch.index == _joy_index:
				_joy_index = -1
				_reset_joystick()
			elif touch.index == _look_index:
				_look_index = -1
	elif event is InputEventScreenDrag:
		var drag: InputEventScreenDrag = event
		if drag.index == _joy_index:
			_update_joystick(drag.position)
		elif drag.index == _look_index:
			look_delta += drag.relative * look_sensitivity


func _over_button(pos: Vector2) -> bool:
	for b: Control in _buttons:
		if b.get_global_rect().has_point(pos):
			return true
	return false


## Returns the look movement since last call, then clears it.
func consume_look_delta() -> Vector2:
	var d: Vector2 = look_delta
	look_delta = Vector2.ZERO
	return d


func set_mission_text(text: String) -> void:
	_mission_label.text = text


func _update_joystick(touch_pos: Vector2) -> void:
	var offset: Vector2 = (touch_pos - _joy_center).limit_length(joystick_radius)
	_joy_knob.position = _joy_base.size * 0.5 - _joy_knob.size * 0.5 + offset
	move_input = offset / joystick_radius


func _reset_joystick() -> void:
	move_input = Vector2.ZERO
	if _joy_base and _joy_knob:
		_joy_knob.position = _joy_base.size * 0.5 - _joy_knob.size * 0.5


# --------------------------------------------------------------- signals

func _on_chaos_changed(new_amount: int, current_tier: int) -> void:
	_chaos_bar.value = new_amount
	var names: Array[String] = ["", "Curious Tourists", "Annoyed Guests", "Zoo Lockdown"]
	_tier_label.text = "CHAOS  Tier %d: %s" % [current_tier, names[clampi(current_tier, 1, 3)]]


func _on_mission_progress(mission_id: String, current: int, target: int) -> void:
	_mission_label.text = "Mission: %s (%d/%d)" % [mission_id, current, target]


func _on_mission_completed(mission_title: String, reward_bananas: int) -> void:
	_mission_label.text = "Done: %s  +%d bananas" % [mission_title, reward_bananas]
