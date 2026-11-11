shader_type canvas_item;
// Vignette, damage pulse and animated film grain over the whole screen.
uniform vec4 shade : source_color = vec4(0.04, 0.05, 0.12, 1.0);
uniform float hurt = 0.0;
uniform float grain = 0.05;
uniform float vignette = 0.8;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void fragment() {
	vec2 c = UV - vec2(0.5, 0.52);
	c.x *= 0.62;
	float v = smoothstep(0.22, 0.72, length(c));
	vec3 col = mix(shade.rgb, vec3(0.62, 0.04, 0.12), hurt);
	float a = v * mix(vignette, 1.0, hurt);
	float g = (hash(floor(UV * vec2(360.0, 640.0)) + fract(TIME * 7.0) * 91.0) - 0.5) * grain;
	COLOR = vec4(col + vec3(g), clamp(a + abs(g) * 0.6, 0.0, 1.0));
}
