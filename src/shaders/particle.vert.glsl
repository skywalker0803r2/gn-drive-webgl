attribute float aScale;
attribute float aSeed;
uniform float uTime;
uniform float uIntensity;

varying float vAlpha;
varying vec3 vColor;

void main() {
  vec3 pos = position;
  float cycle = fract(uTime * 0.7 + aSeed * 9.0);
  float life = smoothstep(0.0, 0.18, cycle) * (1.0 - smoothstep(0.88, 1.0, cycle));

  float axial = cycle * (2.6 + aScale * 2.8);
  float theta = atan(pos.y, pos.x) + uTime * (0.6 + aScale * 1.8) + aSeed * 12.0;
  float radius = length(pos.xy);

  float vortex = exp(-1.5 * axial) * (0.6 + aScale * 1.8);
  vec2 swirl = vec2(cos(theta + axial * 11.0), sin(theta + axial * 11.0)) * vortex;

  float noiseA = sin((pos.x + aSeed * 8.0 + uTime * 1.6) * 9.0);
  float noiseB = cos((pos.y - aSeed * 7.0 + uTime * 1.3) * 8.5);
  float noiseC = sin((pos.z + aSeed * 10.0) * 6.5 + uTime * 1.8);
  float turbulence = (noiseA + noiseB + noiseC) * 0.25;

  pos.xy += swirl * (0.85 + radius * 1.3);
  pos.z += axial * 0.9 + turbulence * 0.42;
  pos.xy += vec2(noiseA, noiseB) * 0.18 * (0.8 + aScale);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = (10.0 + aScale * 16.0) * (260.0 / -mvPosition.z) * uIntensity;

  float alpha = 4.0 * cycle * (1.0 - cycle) * exp(-1.85 * cycle);
  vAlpha = clamp(alpha, 0.0, 1.0);
  vColor = color;
}
