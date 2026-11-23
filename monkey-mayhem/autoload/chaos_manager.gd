extends Node
## Tracks the chaos meter (0-100) and its three tiers:
## 1 = Curious Tourists, 2 = Annoyed Guests and Zookeepers, 3 = Zoo Lockdown.

const MAX_CHAOS: int = 100
const TIER_2_THRESHOLD: int = 35
const TIER_3_THRESHOLD: int = 75
const TIER_NAMES: Array[String] = ["", "Curious Tourists", "Annoyed Guests", "Zoo Lockdown"]

@export var decay_rate_per_second: float = 1.5
@export var decay_delay_after_action: float = 4.0

var chaos_points: float = 0.0
var current_tier: int = 1
var _time_since_last_chaos: float = 0.0


func _ready() -> void:
	SignalBus.visitor_hit.connect(_on_visitor_hit)
	SignalBus.item_stolen.connect(_on_item_stolen)
	SignalBus.zone_unlocked.connect(_on_zone_unlocked)


func _process(delta: float) -> void:
	_time_since_last_chaos += delta
	if _time_since_last_chaos >= decay_delay_after_action and chaos_points > 0.0:
		add_chaos(-decay_rate_per_second * delta)


func add_chaos(amount: float) -> void:
	if amount > 0.0:
		_time_since_last_chaos = 0.0
	var previous_points: int = int(chaos_points)
	chaos_points = clampf(chaos_points + amount, 0.0, float(MAX_CHAOS))
	var new_tier: int = _calculate_tier(chaos_points)
	if new_tier != current_tier:
		var escalated: bool = new_tier > current_tier
		current_tier = new_tier
		if escalated:
			SignalBus.tier_escalated.emit(current_tier)
		SignalBus.chaos_changed.emit(int(chaos_points), current_tier)
	elif int(chaos_points) != previous_points:
		SignalBus.chaos_changed.emit(int(chaos_points), current_tier)


func reset_chaos() -> void:
	chaos_points = 0.0
	current_tier = 1
	_time_since_last_chaos = 0.0
	SignalBus.chaos_changed.emit(0, 1)


func tier_name(tier: int) -> String:
	return TIER_NAMES[clampi(tier, 1, 3)]


func _calculate_tier(points: float) -> int:
	if points >= TIER_3_THRESHOLD:
		return 3
	if points >= TIER_2_THRESHOLD:
		return 2
	return 1


func _on_visitor_hit(_visitor: Node3D, impact_force: float, _item_used: String) -> void:
	add_chaos(clampf(impact_force * 0.5, 5.0, 20.0))


func _on_item_stolen(_item_name: String, item_value: int) -> void:
	add_chaos(float(item_value))


func _on_zone_unlocked(_zone_name: String) -> void:
	add_chaos(25.0)
