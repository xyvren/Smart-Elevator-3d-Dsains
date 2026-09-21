import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ── Scene Setup ──
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0e14);
scene.fog = new THREE.FogExp2(0x0a0e14, 0.00015);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 20000);
camera.up.set(0, 0, 1);
camera.position.set(1350, -1750, 1250);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(300, 170, 480);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.update();

// ── Lighting ──
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(800, -600, 1200);
dirLight.castShadow = true;
dirLight.shadow.camera.left = -800;
dirLight.shadow.camera.right = 800;
dirLight.shadow.camera.top = 1200;
dirLight.shadow.camera.bottom = -200;
dirLight.shadow.mapSize.set(2048, 2048);
scene.add(dirLight);
scene.add(new THREE.DirectionalLight(0x8ec8f0, 0.3).translateX(-500).translateY(-400).translateZ(800));

// ── Grid ──
const grid = new THREE.GridHelper(2000, 40, 0x1a2030, 0x12161e);
grid.rotation.x = Math.PI / 2;
grid.position.set(325, 200, -50);
scene.add(grid);

// ── Materials ──
const M = {
  frame: new THREE.MeshStandardMaterial({ color: 0x2B3B4C, roughness: 0.7 }),
  wood: new THREE.MeshStandardMaterial({ color: 0xB89368, roughness: 0.8 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xB9C7D1, roughness: 0.3, metalness: 0.6 }),
  car: new THREE.MeshStandardMaterial({ color: 0x207EA0, roughness: 0.4, metalness: 0.3 }),
  sensor: new THREE.MeshStandardMaterial({ color: 0xF09C28, roughness: 0.5 }),
  pcb: new THREE.MeshStandardMaterial({ color: 0x308E59, roughness: 0.6 }),
  red: new THREE.MeshStandardMaterial({ color: 0xDA3D42, roughness: 0.5 }),
  black: new THREE.MeshStandardMaterial({ color: 0x252B31, roughness: 0.8 }),
  glass: new THREE.MeshStandardMaterial({ color: 0xB1D5E1, transparent: true, opacity: 0.16, roughness: 0.1, metalness: 0.2 }),
};

// ── Helper: Box (position = bbox min, size = [w,d,h]) ──
function box([px, py, pz], [w, d, h], mat, name) {
  const g = new THREE.BoxGeometry(w, d, h);
  const m = new THREE.Mesh(g, mat);
  m.position.set(px + w / 2, py + d / 2, pz + h / 2);
  m.castShadow = true;
  m.receiveShadow = true;
  if (name) m.name = name;
  scene.add(m);
  return m;
}

// ── Helper: Cylinder (along Z axis) ──
function cylZ(cx, cy, zBottom, radius, height, mat, segs = 32) {
  const g = new THREE.CylinderGeometry(radius, radius, height, segs);
  const m = new THREE.Mesh(g, mat);
  m.rotation.x = Math.PI / 2;
  m.position.set(cx, cy, zBottom + height / 2);
  m.castShadow = true;
  scene.add(m);
  return m;
}

// ── Helper: Cylinder along Y axis ──
function cylY(cx, yCenter, cz, radius, length, mat, segs = 24) {
  const g = new THREE.CylinderGeometry(radius, radius, length, segs);
  const m = new THREE.Mesh(g, mat);
  m.position.set(cx, yCenter, cz);
  m.castShadow = true;
  scene.add(m);
  return m;
}

// ═══════════════════════════════════════════════
// 1. BASE
// ═══════════════════════════════════════════════
box([0, 0, 0], [650, 400, 18], M.wood, 'Base');

// ═══════════════════════════════════════════════
// 2. TIANG (4 corner columns)
// ═══════════════════════════════════════════════
[[40, 40], [320, 40], [40, 280], [320, 280]].forEach(([x, y]) => {
  box([x, y, 18], [20, 20, 1000], M.frame);
});

// ═══════════════════════════════════════════════
// 3. BEAMS (top + bottom rings)
// ═══════════════════════════════════════════════
[18, 998].forEach(z => {
  [40, 280].forEach(y => box([60, y, z], [260, 20, 20], M.frame));
  [40, 320].forEach(x => box([x, 60, z], [20, 220, 20], M.frame));
});

// ═══════════════════════════════════════════════
// 4. BACKBOARD
// ═══════════════════════════════════════════════
box([50, 302, 38], [280, 9, 960], M.wood, 'Backboard');

// ═══════════════════════════════════════════════
// 5. LANDINGS
// ═══════════════════════════════════════════════
const FLOOR_Z = [100, 300, 500, 700];
FLOOR_Z.forEach((z, i) => {
  box([60, 65, z - 6], [260, 50, 6], M.wood, `Landing_F${i + 1}`);
  [60, 300].forEach(x => box([x, 60, z - 26], [20, 60, 20], M.frame));
});

// ═══════════════════════════════════════════════
// 6. GUIDE RAILS
// ═══════════════════════════════════════════════
[100, 260].forEach(x => {
  cylZ(x, 220, 48, 6, 860, M.steel, 24);
  [38, 908].forEach(z => box([x - 14, 206, z], [28, 28, 10], M.frame));
});

// ═══════════════════════════════════════════════
// 7. CABIN (animated group)
// ═══════════════════════════════════════════════
const cabinGroup = new THREE.Group();
cabinGroup.name = 'Cabin';
scene.add(cabinGroup);

function addBoxTo(parent, [px, py, pz], [w, d, h], mat, name) {
  const g = new THREE.BoxGeometry(w, d, h);
  const m = new THREE.Mesh(g, mat);
  m.position.set(px + w / 2, py + d / 2, pz + h / 2);
  m.castShadow = true;
  if (name) m.name = name;
  parent.add(m);
  return m;
}

// Carriage sleeves are hollow, coaxial with the guide shafts.
[100,260].forEach(x => [117,207].forEach(z => {
  const shape = new THREE.Shape(); shape.absarc(0,0,11,0,Math.PI*2,false);
  const hole = new THREE.Path(); hole.absarc(0,0,6.2,0,Math.PI*2,true); shape.holes.push(hole);
  const sleeve = new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:20,bevelEnabled:false,curveSegments:24}),M.steel);
  sleeve.position.set(x,220,z); cabinGroup.add(sleeve);
  addBoxTo(cabinGroup,[x===100?110:240,213,z],[10,14,20],M.steel);
}));
[100,260].forEach(x => [38,908].forEach(z => box([x-14,234,z],[28,68,10],M.frame)));
const CZ0 = 97; // cabin floor z at F1
addBoxTo(cabinGroup, [120, 120, CZ0], [120, 120, 3], M.car, 'CabinFloor');
addBoxTo(cabinGroup, [120, 120, CZ0 + 3], [3, 120, 137], M.car, 'CabinWallL');
addBoxTo(cabinGroup, [237, 120, CZ0 + 3], [3, 120, 137], M.car, 'CabinWallR');
addBoxTo(cabinGroup, [123, 237, CZ0 + 3], [114, 3, 137], M.glass, 'CabinGlassBack');
addBoxTo(cabinGroup, [120, 120, CZ0 + 140], [120, 120, 3], M.car, 'CabinRoof');
// Yoke reinforcement
addBoxTo(cabinGroup, [140, 175, CZ0 + 143], [80, 10, 6], M.steel);
// Wire rope attachment point
const attachment = cylZ(179, 180, CZ0 + 149, 3, 6, M.red);
cabinGroup.attach(attachment);
addBoxTo(cabinGroup, [240,164,135], [38,1,10], M.sensor, "FlagSupport");
addBoxTo(cabinGroup, [278,164,135], [8,1,10], M.black, "SensorFlag");
// Wire rope
const rope = cylZ(179, 180, 252, 1, 668, M.black, 12);
rope.name = "Rope";

// ═══════════════════════════════════════════════
// 8. SENSORS (orange fork shapes)
// ═══════════════════════════════════════════════
const sensorZ = [140, 340, 540, 740];
box([298, 150, 70], [8, 25, 780], M.frame, "SensorRail");
sensorZ.forEach((z, i) => {
  // Fork lower + upper
  box([276, 155, z - 6], [14, 6, 12], M.sensor, `Sensor_F${i + 1}_lower`);
  box([276, 167, z - 6], [14, 6, 12], M.sensor, `Sensor_F${i + 1}_upper`);
  box([290, 155, z - 6], [6, 18, 12], M.sensor);
  // Bracket
  box([296, 155, z - 10], [2, 18, 20], M.steel);
});

// ═══════════════════════════════════════════════
// 9. DRIVE SYSTEM (top)
// ═══════════════════════════════════════════════
[140, 210].forEach(y => {
  box([60, y - 8, 882], [260, 16, 12], M.frame);
  box([188, y - 6, 894], [24, 12, 38], M.steel);
});
// Drum
cylY(200, 170, 920, 20, 40, M.sensor);
// Flanges
cylY(200, 149, 920, 25, 2, M.steel);
cylY(200, 191, 920, 25, 2, M.steel);
// Motor
box([180, 241, 874], [40, 61, 12], M.frame);
cylY(200, 269.5, 920, 18, 53, M.black);
cylY(200, 181.5, 920, 4, 123, M.steel);
cylY(200, 236, 920, 7, 14, M.steel);
cylY(200, 114, 920, 6, 12, M.steel);
box([182, 253, 886], [36, 28, 17], M.steel);
// Encoder
cylY(200, 97, 920, 12, 22, M.pcb);
box([185, 84, 880], [30, 28, 5], M.steel);
box([185, 84, 885], [4, 28, 35], M.steel);

// ═══════════════════════════════════════════════
// 10. CONTROL PANEL (base right)
// ═══════════════════════════════════════════════
box([385, 65, 26], [240, 260, 6], M.wood, 'PanelMount');
box([400, 85, 38], [70, 55, 15], M.pcb, 'MCU');
box([495, 85, 38], [65, 55, 15], M.frame, 'H-Bridge');
box([575, 85, 38], [35, 55, 15], M.frame, 'DC-DC');
box([400, 170, 38], [65, 45, 15], M.black, 'DC_Input');
box([490, 170, 38], [110, 22, 15], M.sensor, 'Terminals');
// Buttons F1-F4
[0, 1, 2, 3].forEach(i => {
  cylZ(410 + i * 45, 250, 38, 8, 8, M.sensor);
});
// E-Stop
cylZ(595, 275, 38, 15, 20, M.red);

// ═══════════════════════════════════════════════
// 11. LIMIT SWITCHES
// ═══════════════════════════════════════════════
box([307, 185, 120], [15, 20, 20], M.red, 'LimitBottom');
box([300, 205, 120], [15, 97, 4], M.steel);
box([307, 185, 740], [15, 20, 20], M.red, 'LimitTop');
box([300, 205, 740], [15, 97, 4], M.steel);
// Cam on cabin
addBoxTo(cabinGroup, [240, 185, 135], [61, 5, 10], M.red);

// ═══════════════════════════════════════════════
// 12. SIDE GUARDS (glass)
// ═══════════════════════════════════════════════
box([34, 40, 38], [3, 260, 960], M.glass);
box([343, 40, 38], [3, 260, 960], M.glass);

// ═══════════════════════════════════════════════
// 13. FLOOR LABELS (sprite text)
// ═══════════════════════════════════════════════
function makeLabel(text, x, y, z) {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(10,14,20,0.85)';
  ctx.roundRect(0, 0, 128, 64, 8);
  ctx.fill();
  ctx.fillStyle = '#F09C28';
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 64, 32);
  const tex = new THREE.CanvasTexture(canvas);
  const sp = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sprite = new THREE.Sprite(sp);
  sprite.position.set(x, y, z);
  sprite.scale.set(80, 40, 1);
  scene.add(sprite);
}

const LABELS = [
  ['F1', -20, 100, 100],
  ['F2', -20, 100, 300],
  ['F3', -20, 100, 500],
  ['F4', -20, 100, 700],
];
LABELS.forEach(([t, x, y, z]) => makeLabel(t, x, y, z));

// ═══════════════════════════════════════════════
// 14. FLOOR ANIMATION
// ═══════════════════════════════════════════════
const FLOOR_POSITIONS = [0, 200, 400, 600]; // cabin floor z at each landing
let currentFloor = 0;
let targetFloor = 0;
let animating = false;
let cabinVelocity = 0;

function animateCabinTo(floorIdx) {
  if (animating || floorIdx === currentFloor) return;
  targetFloor = floorIdx;
  animating = true;
}

function updateCabin(dt) {
  if (!animating) return;
  const targetZ = FLOOR_POSITIONS[targetFloor];
  const currentZ = cabinGroup.position.z;
  const diff = targetZ - currentZ;

  if (Math.abs(diff) < 0.5) {
    cabinGroup.position.z = targetZ;
    animating = false;
    currentFloor = targetFloor;
    updateStatus(currentFloor, 0);
    document.querySelectorAll('.floor-btn').forEach((b, i) => {
      b.classList.toggle('active', i === currentFloor);
    });
    return;
  }

  // Simple trapezoidal-ish motion
  const dist = Math.abs(diff);
  const sign = Math.sign(diff);
  const cruiseSpeed = 300; // mm/s
  const rampDist = 80;

  let speed;
  if (dist > rampDist) {
    speed = cruiseSpeed;
  } else {
    speed = cruiseSpeed * (dist / rampDist);
    speed = Math.max(speed, 40);
  }

  cabinGroup.position.z += sign * Math.min(dist, speed * dt);
  cabinVelocity = sign * speed;
  updateStatus(currentFloor, Math.round(speed), targetFloor);
}

function updateStatus(floor, speed, target) {
  const bar = document.getElementById('status-bar');
  const floorNames = ['F1', 'F2', 'F3', 'F4'];
  const posLabel = target !== undefined && target !== floor
    ? `${floorNames[floor]} → ${floorNames[target]}`
    : floorNames[floor];
  bar.textContent = `Demo: ${posLabel} · z=${(100 + cabinGroup.position.z).toFixed(1)} mm · ${speed} mm/s`;
}

// Button events
document.querySelectorAll('.floor-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const f = parseInt(btn.dataset.floor) - 1;
    animateCabinTo(f);
  });
});

// Camera presets
document.querySelectorAll('#camera-presets button').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    const t = controls.target;
    let pos;
    switch (view) {
      case 'front': pos = new THREE.Vector3(300, -2200, 480); break;
      case 'side': pos = new THREE.Vector3(2400, 170, 480); break;
      case 'top': pos = new THREE.Vector3(300, 169, 2400); break;
      default: pos = new THREE.Vector3(1600, -2000, 1450);
    }
    // Smooth camera transition
    const start = camera.position.clone();
    const duration = 800;
    const startTime = performance.now();
    function animCam(now) {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      camera.position.lerpVectors(start, pos, ease);
      controls.update();
      if (t < 1) requestAnimationFrame(animCam);
    }
    requestAnimationFrame(animCam);
  });
});

// Canvas has its own reserved viewport, separate from the UI.
function resizeViewport() {
  const {width,height} = document.getElementById('canvas-container').getBoundingClientRect();
  camera.aspect = width / Math.max(height,1);
  camera.updateProjectionMatrix();
  renderer.setSize(width,height);
}
new ResizeObserver(resizeViewport).observe(document.getElementById('canvas-container'));
resizeViewport();
document.querySelector('.note').textContent = 'Revisi 2.1 · mm nominal · Demo animasi, bukan data sensor fisik.';
updateStatus(0,0);
window.__elevator = {scene, camera, cabinGroup, rope, updateCabin, animateCabinTo, getState:()=>({currentFloor,animating,z:100+cabinGroup.position.z})};

// ── Animation Loop ──
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  updateCabin(dt);
  const ropeBottom = 252 + cabinGroup.position.z;
  rope.scale.y = (920 - ropeBottom) / 668;
  rope.position.z = (920 + ropeBottom) / 2;
  controls.update();
  renderer.render(scene, camera);
}
animate();
