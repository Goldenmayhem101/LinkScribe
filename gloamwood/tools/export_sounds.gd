extends SceneTree
## Renders the synthesized SFX and music loops to WAV files for listening/checking:
##   godot --headless --path . --script res://tools/export_sounds.gd -- <out_dir>
func _init() -> void:
	var out = OS.get_cmdline_user_args()[0] if OS.get_cmdline_user_args().size() > 0 else "user://sounds"
	DirAccess.make_dir_recursive_absolute(out)
	var a = load("res://scripts/audio.gd").new()
	a._build_sfx()
	for k in a.sfx:
		a.sfx[k].save_to_wav(out + "/sfx_" + k + ".wav")
	for m in ["gloamwood", "boss", "menu"]:
		var t0 = Time.get_ticks_msec()
		a._gen_music(m).save_to_wav(out + "/music_" + m + ".wav")
		print("music %s generated in %d ms" % [m, Time.get_ticks_msec() - t0])
	a.free()
	quit()
