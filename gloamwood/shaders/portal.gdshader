shader_type canvas_item;
// Swirling portal disc.
uniform vec4 c1 : source_color = vec4(0.4, 1.0, 0.95, 1.0);
uniform vec4 c2 : source_color = vec4(1.0, 0.7, 0.35, 1.0);
void fragment() {
	vec2 p = UV * 2.0 - 1.0;
	float r = length(p);
	float a = atan(p.y, p.x);
	float swirl = sin(a * 5.0 + r * 12.0 - TIME * 4.0) * 0.5 + 0.5;
	float ring = smoothstep(1.0, 0.82, r) * smoothstep(0.2, 0.75, r);
	float core = smoothstep(0.6, 0.0, r);
	vec3 col = mix(c1.rgb, c2.rgb, swirl) * (ring * (0.6 + swirl)) + c1.rgb * core * 0.8;
	COLOR = vec4(col, clamp(ring * 0.9 + core * 0.7, 0.0, 1.0));
}
