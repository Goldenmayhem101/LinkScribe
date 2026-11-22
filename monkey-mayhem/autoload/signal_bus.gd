extends Node
## Global signals. Everything talks through here so scripts stay independent.
## (Adapted from the owner's Google chat, step 1. See source/google-chat-full.md.)

# Chaos and escalation
signal chaos_changed(new_amount: int, current_tier: int)
signal tier_escalated(new_tier: int)

# Gameplay interaction
signal visitor_hit(visitor: Node3D, impact_force: float, item_used: String)
signal item_stolen(item_name: String, item_value: int)
signal prop_eaten(item_name: String)

# Progression and escape
signal mission_progress_updated(mission_id: String, current: int, target: int)
signal mission_completed(mission_title: String, reward_bananas: int)
signal zone_unlocked(zone_name: String)
