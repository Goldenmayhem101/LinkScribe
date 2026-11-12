extends SceneTree
## Plays a real run, gets hit by a monster-style hit, then dies, and saves screenshots of each moment.
## xvfb-run -a godot --path . --rendering-driver opengl3 --resolution 720x1280 --script res://tools/test_death.gd

var main: Node
var out := "user://death_test/"

func shot(name: String) -> void:
	await process_frame
	await process_frame
	var img = root.get_viewport().get_texture().get_image()
	img.save_png(ProjectSettings.globalize_path(out + name + ".png"))
	print("shot ", name, " paused=", paused, " time_scale=", Engine.time_scale, " screen=", main.menu.screen)

func wait(s: float) -> void:
	await create_timer(s, true, false, true).timeout

func _initialize() -> void:
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(out))
	var prof = root.get_node("Profile")
	prof.no_save = true
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	await wait(1.5)
	main.menu_play(false)
	await wait(2.0)
	await shot("1_playing")
	main.player.invuln = 0.0
	main._hurt(main.player.position.x + 30.0, 20.0)
	await wait(0.03)
	await shot("2_just_hit")
	await wait(0.6)
	await shot("3_after_hit")
	for i in 20:
		main.player.invuln = 0.0
		main._hurt(main.player.position.x + 30.0, 25.0)
		await wait(0.05)
		if main.menu.screen == "over":
			break
	await wait(0.5)
	await shot("4_dead")
	quit()
