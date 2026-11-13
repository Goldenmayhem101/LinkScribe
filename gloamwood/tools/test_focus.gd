extends SceneTree
## A notification or floating bubble taking focus must NOT pause the game; going to the background must.
## Also hammers the hit slow-down to make sure time always comes back to normal.
## xvfb-run -a godot --path . --rendering-driver opengl3 --script res://tools/test_focus.gd

var main: Node

func wait(s: float) -> void:
	await create_timer(s, true, false, true).timeout

func _initialize() -> void:
	root.get_node("Profile").no_save = true
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	await wait(1.5)
	main.menu_play(false)
	await wait(2.0)
	main._notification(Node.NOTIFICATION_APPLICATION_FOCUS_OUT)
	await wait(0.2)
	print("focus_out paused=", paused, " (want false)")
	for i in 40:
		main.hitstop(0.05)
		await wait(0.01)
	await wait(0.3)
	print("after 40 hits time_scale=", Engine.time_scale, " (want 1)")
	main._notification(Node.NOTIFICATION_APPLICATION_PAUSED)
	await wait(0.2)
	print("app_paused paused=", paused, " screen=", main.menu.screen, " (want true, pause)")
	print("enemies in stage: ", main.level.enemies.size())
	quit()
