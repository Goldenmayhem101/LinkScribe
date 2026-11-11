shader_type canvas_item;
// Wind sway per blade (warp grows toward blade tips) and blades parting around the hero.
uniform vec3 hero = vec3(0.0, 0.0, 0.0); // world x, feet y, 1 when grounded
uniform float strength = 2.6;
uniform float tex_scale = 2.0; // texture pixels per world unit
varying vec2 wpos;
void vertex() { wpos = (MODEL_MATRIX * vec4(VERTEX, 0.0, 1.0)).xy; }
void fragment() {
	float top = clamp(1.0 - UV.y, 0.0, 1.0);
	float bend = top * top;
	float sway = sin(TIME * 1.7 + wpos.x * 0.045) * strength + sin(TIME * 3.1 + wpos.x * 0.11) * 0.6;
	float d = wpos.x - hero.x;
	float near_y = step(abs(wpos.y - hero.y + 18.0), 32.0);
	float push = hero.z * near_y * sign(d) * max(0.0, 18.0 - abs(d)) * 0.55;
	float dx = (sway + push) * bend;
	vec2 uv = UV - vec2(dx * tex_scale * TEXTURE_PIXEL_SIZE.x, 0.0);
	COLOR = texture(TEXTURE, uv) * COLOR;
}
