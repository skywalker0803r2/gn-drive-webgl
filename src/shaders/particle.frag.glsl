varying float vAlpha;
varying vec3 vColor;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float glow = smoothstep(0.52, 0.0, d);
  vec3 color = vColor * (0.75 + glow * 1.2);
  gl_FragColor = vec4(color, glow * vAlpha * 1.3);
}
