extends Node
## Autoload "Profile": everything that persists between sessions.
## Progression design (fair, no purchases):
##   - core loop rewards: coins + combo multiplier, random chests, golden monsters
##   - permanent meta progress: upgrades and heroes, cheap first steps, next goal always visible
##   - fixed-interval goals: 7-day reward calendar + 3 daily quests (missing a day never takes anything away)
##   - long-term goals: player level / XP, tiered achievements, records and stage stars
##   - resume: the current run is saved and restored exactly where it was left

signal changed

const PATH := "user://profile.json"

const CHARACTERS := [
	{"id": "lumen", "name": "Lumen", "desc": "Balanced lantern spirit.", "cost": 0, "level": 1,
		"hp": 100, "hearts": 3, "speed": 1.0, "air_jumps": 1, "spark": "single", "tint": [1.0, 1.0, 1.0], "scarf": [1.0, 0.69, 0.35]},
	{"id": "vesper", "name": "Vesper", "desc": "Every shot splits into 3. Less health.", "cost": 350, "level": 3,
		"hp": 80, "hearts": 2, "speed": 1.05, "air_jumps": 1, "spark": "spread", "tint": [0.84, 0.76, 1.0], "scarf": [0.66, 0.45, 1.0]},
	{"id": "cinder", "name": "Cinder", "desc": "Heavy sparks pierce enemies. Sturdy but slower.", "cost": 800, "level": 5,
		"hp": 135, "hearts": 4, "speed": 0.92, "air_jumps": 1, "spark": "pierce", "tint": [1.0, 0.86, 0.76], "scarf": [1.0, 0.42, 0.25]},
	{"id": "nyx", "name": "Nyx", "desc": "Triple jump and swift feet. Fragile.", "cost": 1500, "level": 8,
		"hp": 85, "hearts": 2, "speed": 1.15, "air_jumps": 2, "spark": "single", "tint": [0.75, 0.95, 0.92], "scarf": [0.3, 0.9, 0.8]},
]

## Per-hero upgrades: 10 levels each, every level costs more (base * 1.45^level).
const UPGRADE_MAX := 10
const UPGRADES := [
	{"id": "vitality", "name": "Vitality", "desc": "+10 max health per level", "base": 60},
	{"id": "power", "name": "Spark Power", "desc": "+10% ranged damage per level", "base": 80},
	{"id": "blade", "name": "Blade Edge", "desc": "+10% melee damage per level", "base": 70},
	{"id": "haste", "name": "Quick Hands", "desc": "+5% attack speed per level", "base": 70},
	{"id": "armor", "name": "Moss Armor", "desc": "-3.5% damage taken per level", "base": 90},
	{"id": "swift", "name": "Wind Step", "desc": "Faster dash recharge and run speed", "base": 60},
	{"id": "magnet", "name": "Coin Magnet", "desc": "Pull coins from farther away", "base": 40},
	{"id": "fortune", "name": "Fortune", "desc": "+6% coins, more chests and golden monsters", "base": 100},
]

## Ranged weapons: equip one. Aim assist (or a tapped target) picks what they fire at.
const WEAPONS := [
	{"id": "spark", "name": "Spark Bolt", "desc": "Quick bolts of lantern light.", "cost": 0, "level": 1, "rate": 0.28, "dmg": 1.0, "col": [0.55, 1.0, 0.92]},
	{"id": "seeker", "name": "Seeker Wisps", "desc": "Homing wisps that curve into their target.", "cost": 300, "level": 2, "rate": 0.36, "dmg": 1.0, "col": [0.75, 0.62, 1.0]},
	{"id": "shard", "name": "Frost Shards", "desc": "Three ice shards. Hit monsters are slowed.", "cost": 450, "level": 3, "rate": 0.42, "dmg": 0.8, "col": [0.7, 0.9, 1.0]},
	{"id": "lance", "name": "Moon Lance", "desc": "Instant piercing beam through a whole line.", "cost": 650, "level": 4, "rate": 0.5, "dmg": 2.0, "col": [0.9, 0.95, 1.0]},
	{"id": "scatter", "name": "Ember Scatter", "desc": "Five-shot burst. Huge damage up close.", "cost": 900, "level": 6, "rate": 0.55, "dmg": 0.9, "col": [1.0, 0.6, 0.3]},
	{"id": "boomerang", "name": "Leafwing", "desc": "Spinning leaf blade that flies out and comes back.", "cost": 1200, "level": 7, "rate": 0.6, "dmg": 1.6, "col": [0.55, 0.95, 0.45]},
	{"id": "thunder", "name": "Storm Orb", "desc": "Slow orb that chains lightning to nearby monsters.", "cost": 1600, "level": 9, "rate": 0.7, "dmg": 1.5, "col": [1.0, 0.95, 0.45]},
	{"id": "cannon", "name": "Star Mortar", "desc": "Lobbed star shell that explodes in an area.", "cost": 2200, "level": 11, "rate": 0.9, "dmg": 3.0, "col": [1.0, 0.75, 0.95]},
]

## Melee weapons: swing automatically when a monster gets close.
const MELEE := [
	{"id": "staff", "name": "Lantern Staff", "desc": "A wide sweep of lantern light.", "cost": 0, "level": 1, "rate": 0.45, "dmg": 2.0, "reach": 40.0, "arc": 150.0, "col": [1.0, 0.8, 0.45]},
	{"id": "sickle", "name": "Moon Sickle", "desc": "Crescent slash that hits all around you.", "cost": 350, "level": 3, "rate": 0.5, "dmg": 2.2, "reach": 42.0, "arc": 220.0, "col": [0.85, 0.92, 1.0]},
	{"id": "lash", "name": "Thorn Lash", "desc": "Long-reach vine whip.", "cost": 600, "level": 5, "rate": 0.55, "dmg": 1.8, "reach": 68.0, "arc": 70.0, "col": [0.5, 0.95, 0.45]},
	{"id": "rapier", "name": "Crystal Rapier", "desc": "Lightning-fast thrusts.", "cost": 900, "level": 7, "rate": 0.24, "dmg": 1.2, "reach": 50.0, "arc": 50.0, "col": [0.6, 0.95, 1.0]},
	{"id": "hammer", "name": "Ember Hammer", "desc": "Slow, crushing blows with a shockwave.", "cost": 1300, "level": 9, "rate": 0.85, "dmg": 4.5, "reach": 42.0, "arc": 160.0, "col": [1.0, 0.5, 0.25]},
	{"id": "scythe", "name": "Void Scythe", "desc": "Huge spinning reap. The ultimate blade.", "cost": 2000, "level": 12, "rate": 0.7, "dmg": 3.4, "reach": 58.0, "arc": 260.0, "col": [0.8, 0.45, 1.0]},
]

## Wardrobe: cosmetic only.
const COSMETICS := {
	"scarf": [
		{"id": "amber", "name": "Amber", "cost": 0, "col": [1.0, 0.69, 0.35]},
		{"id": "rose", "name": "Rose", "cost": 0, "col": [1.0, 0.45, 0.55]},
		{"id": "sky", "name": "Sky", "cost": 60, "col": [0.45, 0.75, 1.0]},
		{"id": "mint", "name": "Mint", "cost": 60, "col": [0.4, 0.95, 0.75]},
		{"id": "violet", "name": "Violet", "cost": 90, "col": [0.68, 0.48, 1.0]},
		{"id": "crimson", "name": "Crimson", "cost": 120, "col": [0.9, 0.2, 0.25]},
		{"id": "snow", "name": "Snow", "cost": 150, "col": [0.95, 0.97, 1.0]},
		{"id": "forest", "name": "Forest", "cost": 150, "col": [0.25, 0.6, 0.35]},
		{"id": "midnight", "name": "Midnight", "cost": 200, "col": [0.2, 0.25, 0.55]},
		{"id": "coral", "name": "Coral", "cost": 200, "col": [1.0, 0.55, 0.45]},
		{"id": "gold", "name": "Gold", "cost": 300, "col": [1.0, 0.85, 0.3]},
		{"id": "aurora", "name": "Aurora", "cost": 500, "col": [0.5, 1.0, 0.85], "col2": [0.75, 0.5, 1.0]},
	],
	"cloak": [
		{"id": "moon", "name": "Moonlight", "cost": 0, "col": [1.0, 1.0, 1.0]},
		{"id": "dawn", "name": "Dawn", "cost": 80, "col": [1.0, 0.86, 0.78]},
		{"id": "frost", "name": "Frost", "cost": 80, "col": [0.8, 0.92, 1.0]},
		{"id": "fern", "name": "Fern", "cost": 120, "col": [0.8, 1.0, 0.85]},
		{"id": "dusk", "name": "Dusk", "cost": 160, "col": [0.82, 0.74, 1.0]},
		{"id": "ash", "name": "Ash", "cost": 200, "col": [0.66, 0.66, 0.74]},
		{"id": "honey", "name": "Honey", "cost": 220, "col": [1.0, 0.9, 0.62]},
		{"id": "blossom", "name": "Blossom", "cost": 260, "col": [1.0, 0.8, 0.88]},
		{"id": "shadow", "name": "Shadow", "cost": 350, "col": [0.45, 0.45, 0.58]},
		{"id": "starlit", "name": "Starlit", "cost": 600, "col": [0.85, 0.85, 1.0], "stars": true},
	],
	"hat": [
		{"id": "none", "name": "None", "cost": 0},
		{"id": "leaf", "name": "Leaf Sprout", "cost": 100},
		{"id": "flower", "name": "Moonflower", "cost": 140},
		{"id": "horns", "name": "Little Horns", "cost": 180},
		{"id": "ears", "name": "Fox Ears", "cost": 200},
		{"id": "mushroom", "name": "Toadstool", "cost": 240},
		{"id": "antenna", "name": "Star Antenna", "cost": 260},
		{"id": "witch", "name": "Witch Hat", "cost": 320},
		{"id": "halo", "name": "Halo", "cost": 380},
		{"id": "crown", "name": "Lantern Crown", "cost": 500},
	],
	"eyes": [
		{"id": "mint", "name": "Mint", "cost": 0, "col": [0.85, 1.0, 0.95]},
		{"id": "gold", "name": "Gold", "cost": 80, "col": [1.0, 0.85, 0.35]},
		{"id": "rose", "name": "Rose", "cost": 80, "col": [1.0, 0.55, 0.7]},
		{"id": "violet", "name": "Violet", "cost": 120, "col": [0.75, 0.55, 1.0]},
		{"id": "ice", "name": "Ice", "cost": 120, "col": [0.6, 0.85, 1.0]},
		{"id": "fire", "name": "Fire", "cost": 200, "col": [1.0, 0.45, 0.2]},
	],
	"trail": [
		{"id": "none", "name": "None", "cost": 0},
		{"id": "sparkle", "name": "Sparkles", "cost": 150, "col": [0.9, 1.0, 1.0]},
		{"id": "ember", "name": "Embers", "cost": 200, "col": [1.0, 0.6, 0.3]},
		{"id": "petal", "name": "Petals", "cost": 250, "col": [1.0, 0.6, 0.75]},
		{"id": "snow", "name": "Snowflakes", "cost": 250, "col": [0.92, 0.97, 1.0]},
		{"id": "leaf", "name": "Leaves", "cost": 250, "col": [0.5, 0.9, 0.45]},
		{"id": "bubble", "name": "Bubbles", "cost": 300, "col": [0.6, 0.9, 1.0]},
		{"id": "star", "name": "Stardust", "cost": 400, "col": [1.0, 0.95, 0.6]},
		{"id": "rainbow", "name": "Rainbow", "cost": 700, "col": [1.0, 1.0, 1.0]},
	],
}

const DAILY_REWARDS := [50, 75, 100, 150, 200, 250, 500]

const QUEST_POOL := [
	{"ev": "kill", "text": "Defeat %d monsters", "goal": [15, 25, 35]},
	{"ev": "stomp", "text": "Stomp %d monsters", "goal": [5, 8, 12]},
	{"ev": "coin", "text": "Collect %d coins", "goal": [80, 120, 180]},
	{"ev": "combo", "text": "Reach a %d combo", "goal": [8, 12, 18], "max": true},
	{"ev": "chest", "text": "Open %d chests", "goal": [2, 3, 4]},
	{"ev": "stage", "text": "Clear %d stages", "goal": [2, 3, 5]},
	{"ev": "nodmg", "text": "Clear %d stage without damage", "goal": [1, 1, 2]},
	{"ev": "dash", "text": "Dash %d times", "goal": [20, 30, 45]},
	{"ev": "boss", "text": "Defeat %d boss", "goal": [1, 1, 1]},
]

const ACHIEVEMENTS := [
	{"id": "kills", "name": "Monster Hunter", "stat": "kills", "tiers": [25, 100, 500, 2000], "reward": [50, 150, 400, 1000]},
	{"id": "stomps", "name": "Head Hopper", "stat": "stomps", "tiers": [10, 50, 250], "reward": [50, 150, 400]},
	{"id": "coins", "name": "Hoarder", "stat": "coins_collected", "tiers": [200, 1500, 10000], "reward": [50, 200, 600]},
	{"id": "stage", "name": "Deep Walker", "stat": "best_stage", "tiers": [5, 10, 20, 40], "reward": [100, 250, 600, 1500]},
	{"id": "boss", "name": "Titan Slayer", "stat": "bosses", "tiers": [1, 5, 20], "reward": [150, 400, 1000]},
	{"id": "combo", "name": "Combo Artist", "stat": "max_combo", "tiers": [10, 25, 50], "reward": [75, 200, 500]},
	{"id": "chests", "name": "Treasure Seeker", "stat": "chests", "tiers": [5, 25, 100], "reward": [50, 200, 500]},
	{"id": "days", "name": "Regular", "stat": "days_played", "tiers": [3, 7, 30], "reward": [100, 300, 1000]},
	{"id": "heroes", "name": "Collector", "stat": "heroes", "tiers": [2, 3, 4], "reward": [100, 300, 800]},
]

var data: Dictionary = {}
var dirty := false
## Test/demo modes set this so they never touch the player's real save.
var no_save := false
var _save_t := 0.0


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	load_profile()
	check_new_day()


func _process(dt: float) -> void:
	_save_t += dt
	if dirty and _save_t > 3.0:
		save()


func defaults() -> Dictionary:
	return {
		"version": 3, "coins": 0, "xp": 0, "level": 1,
		"upgrades": {}, "heroes": ["lumen"], "hero": "lumen",
		"weapons": ["spark"], "weapon": "spark", "melees": ["staff"], "melee": "staff", "hupg": {},
		"owned_cos": ["scarf:amber", "scarf:rose", "cloak:moon", "hat:none", "trail:none", "eyes:mint"],
		"look": {"scarf": "amber", "cloak": "moon", "hat": "none", "trail": "none", "eyes": "mint"},
		"stats": {"kills": 0, "stomps": 0, "coins_collected": 0, "best_stage": 0, "bosses": 0, "max_combo": 0,
			"chests": 0, "days_played": 0, "heroes": 1, "runs": 0, "deaths": 0, "stages_cleared": 0, "dashes": 0},
		"ach": {},
		"settings": {"music": 0.85, "sfx": 0.7, "control": "dpad", "control_scale": 1.0, "vibration": true, "difficulty": 1, "quality": 1, "aim_assist": true},
		"daily": {"last_claim": "", "streak": 0, "quest_date": "", "quests": []},
		"last_day": "",
		"run": {"active": false},
		"stage_stars": {},
	}


func load_profile() -> void:
	data = defaults()
	if FileAccess.file_exists(PATH):
		var f = FileAccess.open(PATH, FileAccess.READ)
		var parsed = JSON.parse_string(f.get_as_text())
		if parsed is Dictionary:
			_merge(data, parsed)
	# v2: music was too quiet and some effects too loud in v0.3.0
	if int(data.get("version", 1)) < 2:
		data.settings.music = maxf(float(data.settings.music), 0.85)
		data.settings.sfx = minf(float(data.settings.sfx), 0.7)
		data.version = 2
	# v3: upgrades became per-hero with 10 levels; old global upgrades move to Lumen
	if int(data.get("version", 1)) < 3:
		var rename = {"hearts": "vitality", "spark": "power", "rapid": "haste", "armor": "armor", "magnet": "magnet", "dash": "swift", "luck": "fortune"}
		var moved = {}
		for k in data.get("upgrades", {}):
			if rename.has(k):
				moved[rename[k]] = mini(int(data.upgrades[k]) * 2, UPGRADE_MAX)
		data.hupg = {str(data.get("hero", "lumen")): moved}
		data.upgrades = {}
		data.version = 3


func _merge(into: Dictionary, src: Dictionary) -> void:
	for k in src:
		if into.has(k) and into[k] is Dictionary and src[k] is Dictionary:
			_merge(into[k], src[k])
		else:
			into[k] = src[k]


func save() -> void:
	if no_save:
		dirty = false
		return
	var f = FileAccess.open(PATH, FileAccess.WRITE)
	if f:
		f.store_string(JSON.stringify(data))
	dirty = false
	_save_t = 0.0


func mark() -> void:
	dirty = true
	changed.emit()


func setting(k: String):
	return data.settings[k]


func set_setting(k: String, v) -> void:
	data.settings[k] = v
	mark()


# ---------------- currency / xp ----------------
func add_coins(n: int) -> void:
	data.coins = int(data.coins) + n
	mark()


func spend(n: int) -> bool:
	if int(data.coins) < n:
		return false
	data.coins = int(data.coins) - n
	mark()
	return true


func xp_needed(lv: int) -> int:
	return 100 + lv * 60


## Returns the list of levels gained.
func add_xp(n: int) -> Array:
	var gained: Array = []
	data.xp = int(data.xp) + n
	while int(data.xp) >= xp_needed(int(data.level)):
		data.xp = int(data.xp) - xp_needed(int(data.level))
		data.level = int(data.level) + 1
		gained.append(int(data.level))
		add_coins(40 * int(data.level))
	mark()
	return gained


# ---------------- events, quests, stats ----------------
func event(ev: String, amount: int = 1) -> void:
	var st: Dictionary = data.stats
	match ev:
		"kill": st.kills = int(st.kills) + amount
		"stomp": st.stomps = int(st.stomps) + amount
		"coin": st.coins_collected = int(st.coins_collected) + amount
		"chest": st.chests = int(st.chests) + amount
		"boss": st.bosses = int(st.bosses) + amount
		"stage": st.stages_cleared = int(st.stages_cleared) + amount
		"dash": st.dashes = int(st.dashes) + amount
		"combo": st.max_combo = maxi(int(st.max_combo), amount)
	for q in data.daily.quests:
		if q.ev == ev and not q.done:
			if q.get("max", false):
				q.progress = maxi(int(q.progress), amount)
			else:
				q.progress = int(q.progress) + amount
			if int(q.progress) >= int(q.goal):
				q.progress = q.goal
				q.done = true
	mark()


func record_stage(stage: int) -> void:
	data.stats.best_stage = maxi(int(data.stats.best_stage), stage)
	mark()


func today() -> String:
	var d = Time.get_date_dict_from_system()
	return "%04d-%02d-%02d" % [d.year, d.month, d.day]


func _days_between(a: String, b: String) -> int:
	if a == "" or b == "":
		return 999
	var ta = Time.get_unix_time_from_datetime_string(a + "T00:00:00")
	var tb = Time.get_unix_time_from_datetime_string(b + "T00:00:00")
	return int(round((tb - ta) / 86400.0))


func check_new_day() -> void:
	var t = today()
	if data.last_day != t:
		data.last_day = t
		data.stats.days_played = int(data.stats.days_played) + 1
	if data.daily.quest_date != t:
		data.daily.quest_date = t
		var rng = RandomNumberGenerator.new()
		rng.seed = hash(t)
		var pool = range(QUEST_POOL.size())
		var picked: Array = []
		while picked.size() < 3:
			var i: int = pool[rng.randi() % pool.size()]
			if not picked.has(i):
				picked.append(i)
		var qs: Array = []
		for i in picked:
			var qd: Dictionary = QUEST_POOL[i]
			var tier = rng.randi() % 3
			var goal: int = qd.goal[tier]
			qs.append({"ev": qd.ev, "text": qd.text % goal, "goal": goal, "progress": 0, "done": false, "claimed": false,
				"max": qd.get("max", false), "reward": 60 + tier * 45})
		data.daily.quests = qs
	mark()


func daily_available() -> bool:
	return data.daily.last_claim != today()


## Day index (0-6) the next claim will pay out.
func daily_day() -> int:
	var gap = _days_between(data.daily.last_claim, today())
	if gap == 1:
		return int(data.daily.streak) % 7
	return 0


func claim_daily() -> int:
	if not daily_available():
		return 0
	var day = daily_day()
	var amt: int = DAILY_REWARDS[day]
	data.daily.streak = day + 1
	data.daily.last_claim = today()
	add_coins(amt)
	add_xp(20)
	return amt


func claim_quest(i: int) -> int:
	var q: Dictionary = data.daily.quests[i]
	if not q.done or q.claimed:
		return 0
	q.claimed = true
	add_coins(int(q.reward))
	add_xp(30)
	return int(q.reward)


func ach_tier(a: Dictionary) -> int:
	return int(data.ach.get(a.id, 0))


func ach_value(a: Dictionary) -> int:
	return int(data.stats.get(a.stat, 0))


func ach_claimable(a: Dictionary) -> bool:
	var tier = ach_tier(a)
	return tier < a.tiers.size() and ach_value(a) >= int(a.tiers[tier])


func claim_ach(a: Dictionary) -> int:
	if not ach_claimable(a):
		return 0
	var tier = ach_tier(a)
	data.ach[a.id] = tier + 1
	var r: int = a.reward[tier]
	add_coins(r)
	add_xp(25)
	return r


func pending_rewards() -> int:
	var n = 0
	if daily_available():
		n += 1
	for q in data.daily.quests:
		if q.done and not q.claimed:
			n += 1
	for a in ACHIEVEMENTS:
		if ach_claimable(a):
			n += 1
	return n


# ---------------- upgrades & heroes ----------------
func upgrade_level(id: String, hero: String = "") -> int:
	var h: String = data.hero if hero == "" else hero
	return int(data.hupg.get(h, {}).get(id, 0))


func upgrade_cost(u: Dictionary, hero: String = "") -> int:
	var lv = upgrade_level(u.id, hero)
	if lv >= UPGRADE_MAX:
		return -1
	return int(round(float(u.base) * pow(1.45, lv) / 5.0)) * 5


func buy_upgrade(u: Dictionary) -> bool:
	var c = upgrade_cost(u)
	if c < 0 or not spend(c):
		return false
	var h: String = data.hero
	if not data.hupg.has(h):
		data.hupg[h] = {}
	data.hupg[h][u.id] = upgrade_level(u.id) + 1
	mark()
	return true


func hero_def(id: String = "") -> Dictionary:
	var want: String = data.hero if id == "" else id
	if id == "" and not has_hero(want):
		want = "lumen"
	for c in CHARACTERS:
		if c.id == want:
			return c
	return CHARACTERS[0]


func has_hero(id: String) -> bool:
	return data.heroes.has(id)


func unlock_hero(c: Dictionary) -> bool:
	if has_hero(c.id) or int(data.level) < int(c.level) or not spend(int(c.cost)):
		return false
	data.heroes.append(c.id)
	data.stats.heroes = data.heroes.size()
	data.hero = c.id
	mark()
	return true


func select_hero(id: String) -> void:
	if has_hero(id):
		data.hero = id
		mark()


# ---------------- run (resume) ----------------
func run_active() -> bool:
	return bool(data.run.get("active", false))


func save_run(r: Dictionary) -> void:
	r["active"] = true
	data.run = r
	save()


func end_run() -> void:
	data.run = {"active": false}
	save()


func set_stars(stage: int, stars: int) -> void:
	var k = str(stage)
	data.stage_stars[k] = maxi(int(data.stage_stars.get(k, 0)), stars)
	mark()


# ---------------- weapons & wardrobe ----------------
func weapon_def(id: String = "") -> Dictionary:
	var want: String = data.weapon if id == "" else id
	if not has_weapon(want):
		want = "spark"
	for w in WEAPONS:
		if w.id == want:
			return w
	return WEAPONS[0]


func has_weapon(id: String) -> bool:
	return data.weapons.has(id)


func buy_weapon(w: Dictionary) -> bool:
	if has_weapon(w.id) or int(data.level) < int(w.level) or not spend(int(w.cost)):
		return false
	data.weapons.append(w.id)
	data.weapon = w.id
	mark()
	return true


func equip_weapon(id: String) -> void:
	if has_weapon(id):
		data.weapon = id
		mark()


func cos_def(slot: String, id: String) -> Dictionary:
	for c in COSMETICS[slot]:
		if c.id == id:
			return c
	return COSMETICS[slot][0]


func owns_cos(slot: String, id: String) -> bool:
	return data.owned_cos.has(slot + ":" + id) or int(cos_def(slot, id).cost) == 0


func buy_cos(slot: String, c: Dictionary) -> bool:
	if owns_cos(slot, c.id):
		data.look[slot] = c.id
		mark()
		return true
	if not spend(int(c.cost)):
		return false
	data.owned_cos.append(slot + ":" + c.id)
	data.look[slot] = c.id
	mark()
	return true


func max_hp() -> int:
	return int(hero_def().get("hp", 100)) + upgrade_level("vitality") * 10


func melee_def(id: String = "") -> Dictionary:
	var want: String = data.melee if id == "" else id
	if not data.melees.has(want):
		want = "staff"
	for w in MELEE:
		if w.id == want:
			return w
	return MELEE[0]


func buy_melee(w: Dictionary) -> bool:
	if data.melees.has(w.id) or int(data.level) < int(w.level) or not spend(int(w.cost)):
		return false
	data.melees.append(w.id)
	data.melee = w.id
	mark()
	return true


func equip_melee(id: String) -> void:
	if data.melees.has(id):
		data.melee = id
		mark()
