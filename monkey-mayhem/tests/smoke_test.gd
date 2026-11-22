extends Node
## Headless smoke test: loads the cage, drives the joystick/look/jump with real touch events,
## checks the chaos meter, saves screenshots.  Run: see HANDOFF.md "Testing".

var fails: int = 0


func check(ok: bool, what: String) -> void:
	print(("PASS  " if ok else "FAIL  ") + what)
	if not ok:
		fails += 1


func touch(index: int, pos: Vector2, pressed: bool) -> void:
	var e: InputEventScreenTouch = InputEventScreenTouch.new()
	e.index = index
	e.position = pos
	e.pressed = pressed
	Input.parse_input_event(e)


func drag(index: int, pos: Vector2, rel: Vector2) -> void:
	var e: InputEventScreenDrag = InputEventScreenDrag.new()
	e.index = index
	e.position = pos
	e.relative = rel
	Input.parse_input_event(e)


func ticks(n: int) -> void:
	# wait a number of physics ticks (independent of how slow the test machine renders)
	for i: int in n:
		await get_tree().physics_frame


func shot(name: String) -> void:
	await get_tree().process_frame
	await get_tree().process_frame
	var img: Image = get_viewport().get_texture().get_image()
	img.save_png("res://tests/out/%s.png" % name)


func _ready() -> void:
	await _run()


func _run() -> void:
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://tests/out"))
	var cage: Node3D = (load("res://zoo/cage_1/cage_1.tscn") as PackedScene).instantiate()
	add_child(cage)
	await get_tree().create_timer(0.5).timeout
	var player: PlayerController = cage.player
	var ui: TouchUI = player.touch_ui
	check(player != null, "player spawned")
	check(player.is_on_floor(), "player stands on the cage floor")
	await shot("1_start")

	# joystick: push forward (up) with a real touch event on the left half
	var start_z: float = player.global_position.z
	touch(0, Vector2(130, 590), true)
	drag(0, Vector2(130, 530), Vector2(0, -60))
	await ticks(60)
	print("fps ", Engine.get_frames_per_second())
	check(ui.move_input.y < -0.5, "joystick reads forward (%.2f)" % ui.move_input.y)
	check(player.global_position.z < start_z - 1.0, "player walked forward (z %.2f -> %.2f)" % [start_z, player.global_position.z])
	touch(0, Vector2(130, 530), false)
	await get_tree().create_timer(0.4).timeout
	check(ui.move_input.length() < 0.01, "joystick resets on release")

	# look-drag on the right half
	var yaw0: float = player.rotation.y
	touch(1, Vector2(900, 300), true)
	drag(1, Vector2(1000, 300), Vector2(100, 0))
	touch(1, Vector2(1000, 300), false)
	await get_tree().create_timer(0.2).timeout
	check(absf(player.rotation.y - yaw0) > 0.2, "look-drag turns the view")

	# jump button
	await get_tree().create_timer(0.8).timeout
	var y0: float = player.global_position.y
	ui.jump_pressed.emit()
	await get_tree().create_timer(0.3).timeout
	check(player.global_position.y > y0 + 0.3, "jump lifts the player")
	await get_tree().create_timer(1.2).timeout

	# chaos meter
	ChaosManager.reset_chaos()
	SignalBus.item_stolen.emit("banana", 40)
	await get_tree().create_timer(0.1).timeout
	check(ChaosManager.current_tier == 2, "tier 2 at 40 chaos")
	SignalBus.item_stolen.emit("phone", 40)
	await get_tree().create_timer(0.1).timeout
	check(ChaosManager.current_tier == 3, "tier 3 at 80 chaos")
	SignalBus.mission_progress_updated.emit("Bonk 2 visitors with bananas", 1, 2)
	player.rotation.y = 0.0
	player.camera_pivot.rotation.x = 0.0
	await shot("2_chaos_tier3")

	print("RESULT: %d failures" % fails)
	get_tree().quit(fails)
