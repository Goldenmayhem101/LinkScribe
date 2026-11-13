extends SceneTree
## Average monsters per stage (normal difficulty) for a few stages.
func _init() -> void:
	var gen = LevelGen.new()
	var out = ""
	for stage in [1, 2, 3, 5, 10, 20, 30]:
		var n = 0
		for run_seed in range(1, 21):
			n += gen.generate(stage, LevelGen.seed_for(stage, run_seed), {"difficulty": 1, "luck": 0}).enemies.size()
		out += "stage %d: %.1f  " % [stage, n / 20.0]
	print(out)
	quit()
