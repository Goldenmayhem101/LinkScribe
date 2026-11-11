extends SceneTree
## Headless check of the level generator:
##   godot --headless --path . --script res://tools/test_levels.gd
## Generates stages 1-30 for 20 run seeds and verifies every hop is reachable.

func _init() -> void:
	var gen = LevelGen.new()
	var bad := 0
	var total := 0
	var helpers := 0
	for run_seed in range(1, 21):
		for stage in range(1, 31):
			var lv: Dictionary = gen.generate(stage, LevelGen.seed_for(stage, run_seed))
			total += 1
			helpers += lv.helpers
			var s: Array = lv.solids
			for i in s.size() - 1:
				if not LevelGen.reachable(s[i].r, s[i + 1].r):
					bad += 1
					print("UNREACHABLE run=%d stage=%d hop=%d %s -> %s" % [run_seed, stage, i, s[i].r, s[i + 1].r])
					break
	print("levels=%d unreachable=%d helper_ledges=%d" % [total, bad, helpers])
	quit(1 if bad > 0 else 0)
