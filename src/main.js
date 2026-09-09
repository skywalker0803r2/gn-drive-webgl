import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';
import particleVertexShader from './shaders/particle.vert.glsl?raw';
import particleFragmentShader from './shaders/particle.frag.glsl?raw';

const canvas = document.querySelector('#scene');
const button = document.querySelector('#modeToggle');
const modeLabel = document.querySelector('#modeLabel');
const powerValue = document.querySelector('#powerValue');
const tabs = document.querySelectorAll('.tab');
const tabPanels = document.querySelectorAll('.tab-panel');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x040b12, 8, 30);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 8.5);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 18;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.7;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.95,
  0.75,
  0.15,
);
bloomPass.threshold = 0.1;
bloomPass.strength = 0.9;
bloomPass.radius = 0.7;
composer.addPass(bloomPass);

const ambient = new THREE.AmbientLight(0x8ef7d0, 0.65);
scene.add(ambient);

const glowLight = new THREE.PointLight(0x7af7cc, 12, 22, 2);
glowLight.position.set(0, 0, 0.5);
scene.add(glowLight);

const redLight = new THREE.PointLight(0xff5f6d, 4, 20, 2);
redLight.position.set(0, 0, 1.5);
scene.add(redLight);

const coreGroup = new THREE.Group();
scene.add(coreGroup);

const shellMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xa9f0dc,
  emissive: 0x18352f,
  metalness: 0.92,
  roughness: 0.18,
  transmission: 0.16,
  thickness: 0.8,
});

const shell = new THREE.Mesh(new THREE.ConeGeometry(2, 5, 80, 1, true), shellMaterial);
shell.rotation.x = Math.PI;
shell.scale.y = 1.1;
coreGroup.add(shell);

const innerCore = new THREE.Mesh(
  new THREE.SphereGeometry(0.9, 48, 48),
  new THREE.MeshStandardMaterial({
    color: 0x7af7cc,
    emissive: 0x3cecc3,
    emissiveIntensity: 1.6,
    metalness: 0.28,
    roughness: 0.22,
  }),
);
coreGroup.add(innerCore);

const outerRing = new THREE.Mesh(
  new THREE.TorusGeometry(1.8, 0.08, 16, 220),
  new THREE.MeshBasicMaterial({ color: 0x7af7cc, transparent: true, opacity: 0.9 }),
);
outerRing.rotation.x = Math.PI / 2;
outerRing.position.z = 0.6;
coreGroup.add(outerRing);

const secondaryRing = new THREE.Mesh(
  new THREE.TorusGeometry(2.4, 0.04, 12, 200),
  new THREE.MeshBasicMaterial({ color: 0x51d9ff, transparent: true, opacity: 0.42 }),
);
secondaryRing.rotation.y = Math.PI / 2;
secondaryRing.rotation.z = Math.PI / 5;
coreGroup.add(secondaryRing);

const particleCount = 30000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const scales = new Float32Array(particleCount);
const seeds = new Float32Array(particleCount);

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particleGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
particleGeometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

const particleMaterial = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
  uniforms: {
    uTime: { value: 0 },
    uIntensity: { value: 1.0 },
  },
  vertexShader: particleVertexShader,
  fragmentShader: particleFragmentShader,
});

for (let i = 0; i < particleCount; i += 1) {
  const i3 = i * 3;
  const theta = Math.random() * Math.PI * 2;
  const radius = Math.random() * 1.6;
  const heightWave = (Math.random() - 0.5) * 7;

  positions[i3] = Math.cos(theta) * radius;
  positions[i3 + 1] = Math.sin(theta) * radius;
  positions[i3 + 2] = (Math.random() - 0.5) * 12 + heightWave * 0.5;

  const tint = new THREE.Color().setHSL(0.36 + Math.random() * 0.12, 0.9, 0.58 + Math.random() * 0.18);
  colors[i3] = tint.r;
  colors[i3 + 1] = tint.g;
  colors[i3 + 2] = tint.b;

  scales[i] = Math.random();
  seeds[i] = Math.random();
}

const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleSystem);

const state = { mode: 'normal' };

function setMode(mode) {
  state.mode = mode;
  const isTransAm = mode === 'transam';

  gsap.to(particleMaterial.uniforms.uIntensity, {
    value: isTransAm ? 2.1 : 1.0,
    duration: 1.3,
    ease: 'power2.inOut',
  });

  gsap.to(glowLight.color, {
    r: isTransAm ? 1 : 0.48,
    g: isTransAm ? 0.38 : 0.97,
    b: isTransAm ? 0.45 : 0.8,
    duration: 1.3,
    ease: 'power2.inOut',
  });

  gsap.to(redLight.intensity, {
    value: isTransAm ? 18 : 4,
    duration: 1.3,
    ease: 'power2.inOut',
  });

  gsap.to(bloomPass, {
    strength: isTransAm ? 1.9 : 0.9,
    duration: 1.3,
    ease: 'power2.inOut',
  });

  button.textContent = isTransAm ? '切換至 Normal' : '切換至 Trans-AM';
  modeLabel.textContent = isTransAm ? 'Trans-AM' : 'Normal';
  powerValue.textContent = isTransAm ? '3.0x' : '1.0x';
}

button.addEventListener('click', () => {
  setMode(state.mode === 'normal' ? 'transam' : 'normal');
});

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    tabs.forEach((item) => item.classList.toggle('active', item === tab));
    tabPanels.forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.panel === target);
    });
  });
});

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  composer.setSize(width, height);
}

window.addEventListener('resize', resize);
resize();

const clock = new THREE.Clock();

function animate() {
  const elapsed = clock.getElapsedTime();
  particleMaterial.uniforms.uTime.value = elapsed;
  particleSystem.rotation.z = elapsed * 0.22;
  outerRing.rotation.z = elapsed * 1.2;
  secondaryRing.rotation.x = elapsed * 0.6;
  innerCore.scale.setScalar(1 + Math.sin(elapsed * 3.2) * 0.08);
  controls.update();
  composer.render();
  requestAnimationFrame(animate);
}

animate();
setMode('normal');
