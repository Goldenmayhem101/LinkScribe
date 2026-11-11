shader_type canvas_item;
// Hit flash, death dissolve with glowing edge, and an elite shimmer.
uniform float flash : hint_range(0.0, 1.0) = 0.0;
uniform float dissolve : hint_range(0.0, 1.0) = 0.0;
uniform float elite : hint_range(0.0, 1.0) = 0.0;
uniform vec4 edge_color : source_color = vec4(1.0, 0.75, 0.4, 1.0);
uniform vec4 elite_color : source_color = vec4(0.9, 0.35, 1.0, 1.0);

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
	vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
void fragment() {
	vec4 c = texture(TEXTURE, UV) * COLOR;
	float sh = 0.5 + 0.5 * sin(TIME * 4.0 + UV.y * 14.0 - UV.x * 6.0);
	c.rgb += elite * c.a * elite_color.rgb * 0.35 * sh;
	c.rgb = mix(c.rgb, vec3(1.0), flash * c.a);
	if (dissolve > 0.0) {
		float n = noise(UV * 14.0) * 0.7 + noise(UV * 42.0) * 0.3;
		float th = dissolve * 1.1;
		if (n < th - 0.07) { c.a = 0.0; }
		else if (n < th) { c.rgb = edge_color.rgb * 2.2; }
	}
	COLOR = c;
}
