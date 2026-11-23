class_name PlayerController
extends CharacterBody3D
## First-person controller shared by Monkey Mayhem and (later) Gorilla Mayhem.
## The character scene only changes the numbers below and the visible model.

@export var move_speed: float = 6.5
@export var jump_velocity: float = 6.0
@export var gravity: float = 16.0
@export var ground_accel: float = 40.0
@export var air_accel: float = 12.0

@onready var camera_pivot: Node3D = $CameraPivot
@onready var touch_ui: TouchUI = $TouchUI


func _ready() -> void:
	touch_ui.jump_pressed.connect(_on_jump_pressed)


func _physics_process(delta: float) -> void:
	_handle_look()
	var input_dir: Vector2 = _get_move_input()
	var wish: Vector3 = (global_transform.basis * Vector3(input_dir.x, 0.0, input_dir.y))
	wish.y = 0.0
	if wish.length() > 1.0:
		wish = wish.normalized()

	if not is_on_floor():
		velocity.y -= gravity * delta

	var accel: float = ground_accel if is_on_floor() else air_accel
	velocity.x = move_toward(velocity.x, wish.x * move_speed, accel * delta)
	velocity.z = move_toward(velocity.z, wish.z * move_speed, accel * delta)
	move_and_slide()


func _handle_look() -> void:
	var look: Vector2 = touch_ui.consume_look_delta()
	rotate_y(-look.x)
	camera_pivot.rotate_x(-look.y)
	camera_pivot.rotation.x = clampf(camera_pivot.rotation.x, deg_to_rad(-80.0), deg_to_rad(80.0))


func _get_move_input() -> Vector2:
	if touch_ui.move_input.length() > 0.05:
		return touch_ui.move_input
	# Keyboard fallback for quick tests on a computer.
	return Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")


func _on_jump_pressed() -> void:
	if is_on_floor():
		velocity.y = jump_velocity
