import * as THREE from "three";
import { createMower } from "./mower";

/**
 * Hero centrepiece (desktop only, loaded behind the 3D gate in Hero.tsx).
 *
 * A golden-hour lawn seen from knee height: ~60k instanced grass blades with wind, back-lit tips
 * and soft sun shadows, and a ride-on mower half way through the job. Scroll (`setProgress`, 0 → 1)
 * drives it along three lanes, serpentine, cutting real stripes (blades shortened and laid over
 * the way it drove) and throwing clippings from the side chute. Scroll back and the grass grows
 * in again behind it. The pointer parts the grass and leans the camera a little.
 *
 * Renders only while on screen and the tab is visible.
 */
export type HeroLawn = {
  setProgress: (p: number) => void;
  setPointer: (x: number, y: number) => void;
  clearPointer: () => void;
  setVisible: (v: boolean) => void;
  resize: () => void;
  /** One fully grown frame at a given path position (for the phone and fallback stills). */
  still: (s: number, view?: Partial<typeof CAM>) => void;
  dispose: () => void;
};

const LANES = 3;
const LANE_W = 1.4;
const ZA = -2.6; // far edge of lane 0; lanes run toward the camera
const Z_NEAR = 3.4;
const Z_FAR = -11;
const CUT_H = 0.075;
const CAM = { x: 0, y: 2.6, z: 6.5, lookY: 0, lookZ: -1, fov: 25 };
const SUN_DIR = new THREE.Vector3(0.55, 0.36, -1).normalize();

const LANE_GLSL = /* glsl */ `
uniform float uCutS;
uniform vec3 uX0;
uniform vec3 uX1;
float laneIndex(float z) { return floor((z - ${ZA.toFixed(3)}) / ${LANE_W.toFixed(3)}); }
float cutAt(vec2 p, float lane) {
  if (lane < 0.0) return 1.0;
  if (lane > ${(LANES - 1).toFixed(1)}) return 0.0;
  float x0 = lane < 0.5 ? uX0.x : (lane < 1.5 ? uX0.y : uX0.z);
  float x1 = lane < 0.5 ? uX1.x : (lane < 1.5 ? uX1.y : uX1.z);
  float dir = mod(lane, 2.0) < 0.5 ? 1.0 : -1.0;
  float f = dir > 0.0 ? (p.x - x0) / (x1 - x0) : (x1 - p.x) / (x1 - x0);
  return smoothstep(0.0, 0.012, uCutS - (lane + f) - 0.004);
}
`;

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

export function createHeroLawn(canvas: HTMLCanvasElement, opts: { progress?: () => number; onFirstFrame?: () => void } = {}): HeroLawn {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.debug.checkShaderErrors = false;
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  // No environment map: its PMREM blur costs ~0.4 s of shader compile on the main thread.
  // Hemisphere + fill lights carry the ambient instead.

  const camera = new THREE.PerspectiveCamera(CAM.fov, 2.5, 0.1, 60);

  // Light: a low golden-hour sun behind and to the right (where the video's sun sits), warm sky fill
  const sun = new THREE.DirectionalLight("#ffd29a", 3.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.radius = 5;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  const sc = sun.shadow.camera;
  sc.left = -3.4;
  sc.right = 3.4;
  sc.top = 3.4;
  sc.bottom = -3.4;
  sc.near = 0.5;
  sc.far = 24;
  scene.add(sun, sun.target);
  const sky = new THREE.HemisphereLight("#f4d9ad", "#33452a", 2.3);
  const front = new THREE.DirectionalLight("#cfd9ff", 0.8);
  front.position.set(-3, 2.5, 8);
  scene.add(sky, front);

  // ── uniforms shared by grass and ground ──
  const shared = {
    uTime: { value: 0 },
    uCutS: { value: -0.14 },
    uX0: { value: new THREE.Vector3() },
    uX1: { value: new THREE.Vector3() },
    uPtr: { value: new THREE.Vector3(0, 0, 99) },
    uPtrK: { value: 0 },
    uMower: { value: new THREE.Vector3(0, 0, 99) },
    uMowDir: { value: 1 },
    uSunView: { value: new THREE.Vector3() },
    uWildBase: { value: new THREE.Color("#16261a") },
    uWildMid: { value: new THREE.Color("#3e6130") },
    uWildTip: { value: new THREE.Color("#93ad4f") },
    uWildTip2: { value: new THREE.Color("#c4b45e") },
    uStripeA: { value: new THREE.Color("#a3bc5e") },
    uStripeB: { value: new THREE.Color("#557a35") },
    uSunCol: { value: new THREE.Color("#ffcf7a") },
    uSoil: { value: new THREE.Color("#2a3a20") },
  };

  // ── grass ──
  const N = 100000;
  const blade = new THREE.PlaneGeometry(1, 1, 1, 5);
  blade.translate(0, 0.5, 0);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = blade.index;
  geo.setAttribute("position", blade.getAttribute("position"));
  geo.setAttribute("normal", blade.getAttribute("normal"));
  geo.setAttribute("uv", blade.getAttribute("uv"));
  const aPos = new Float32Array(N * 4); // x, z, yaw, rand
  const aShape = new Float32Array(N * 4); // wild height, width, lean, delay
  const dNear = CAM.z - Z_NEAR + 0.4;
  const dFar = CAM.z - Z_FAR;
  for (let i = 0; i < N; i++) {
    // density ∝ 1/d² on the ground → even on screen
    const d = dNear * Math.pow(dFar / dNear, Math.random());
    const z = CAM.z - d;
    const half = d * Math.tan(THREE.MathUtils.degToRad(CAM.fov / 2)) * 3.3 + 1.8;
    const x = (Math.random() * 2 - 1) * half;
    const fringe = z > ZA + LANES * LANE_W;
    const r = Math.random();
    aPos.set([x, z, Math.random() * Math.PI, r], i * 4);
    const tall = fringe ? 0.22 + Math.pow(Math.random(), 1.4) * 0.3 : 0.15 + Math.pow(Math.random(), 1.6) * 0.17;
    const farFade = THREE.MathUtils.smoothstep(z, Z_FAR, Z_FAR + 3.2);
    aShape.set(
      [
        tall * (Math.random() < 0.04 ? 1.3 : 1) * farFade,
        (0.026 + Math.random() * 0.024) * Math.max(1, (d / 6) ** 0.9),
        (Math.random() - 0.5) * 0.5,
        0.15 + Math.random() * 0.75 + ((x + 8) / 16) * 0.55,
      ],
      i * 4,
    );
  }
  geo.setAttribute("aPos", new THREE.InstancedBufferAttribute(aPos, 4));
  geo.setAttribute("aShape", new THREE.InstancedBufferAttribute(aShape, 4));
  geo.instanceCount = N;
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -2), 40);

  const grassMat = new THREE.MeshStandardMaterial({ roughness: 0.62, metalness: 0, side: THREE.DoubleSide });
  grassMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, shared);
    sh.vertexShader = sh.vertexShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        attribute vec4 aPos;
        attribute vec4 aShape;
        uniform float uTime;
        uniform vec3 uPtr;
        uniform float uPtrK;
        uniform vec3 uMower;
        uniform float uMowDir;
        uniform vec3 uWildBase; uniform vec3 uWildMid; uniform vec3 uWildTip; uniform vec3 uWildTip2;
        uniform vec3 uStripeA; uniform vec3 uStripeB;
        varying vec3 vCol;
        varying float vT;
        ${LANE_GLSL}`,
      )
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `
        vec2 base = aPos.xy;
        float yaw = aPos.z;
        float rnd = aPos.w;
        float t = position.y;
        float lane = laneIndex(base.y);
        float cut = cutAt(base, lane);
        float grow = 1.0 - pow(1.0 - clamp((uTime - aShape.w) / 1.6, 0.0, 1.0), 3.0);
        float h = mix(aShape.x * grow, ${CUT_H.toFixed(3)} * (0.8 + rnd * 0.4), cut);
        float stripe = mod(lane, 2.0);
        float laneDir = stripe < 0.5 ? 1.0 : -1.0;

        // wind: two swells and a travelling gust, much weaker on cut grass
        float sway = sin(uTime * 1.3 + base.x * 0.7 + rnd * 6.28) * 0.09
                   + sin(uTime * 0.55 + base.x * 0.23 + base.y * 0.4) * 0.07
                   + pow(max(0.0, sin(uTime * 0.42 - base.x * 0.32 - base.y * 0.1)), 6.0) * 0.32;
        vec2 bend = vec2(aShape.z + sway, sway * 0.35) * (1.0 - cut * 0.85);
        // cut grass lies over the way the mower drove: that is what makes a stripe
        bend += vec2(laneDir * 0.55, 0.12) * cut;
        // the pointer and the mower's nose part the long grass
        vec2 dp = base - uPtr.xz;
        float pd = length(dp);
        bend += normalize(dp + 1e-4) * smoothstep(0.75, 0.0, pd) * 1.1 * uPtrK * (1.0 - cut);
        vec2 dm = base - uMower.xz;
        float md = length(dm * vec2(0.8, 1.0));
        bend += normalize(dm + 1e-4) * smoothstep(1.2, 0.5, md) * 0.6 * (1.0 - cut);
        bend = clamp(bend, vec2(-1.3), vec2(1.3));

        vec3 right = vec3(cos(yaw), 0.0, sin(yaw));
        float w = aShape.y * pow(1.0 - t, 0.75) * (1.0 + cut * 0.4);
        float curve = t * t;
        float lift = 1.0 - 0.32 * dot(bend, bend) * t;
        vec3 transformed = vec3(base.x, 0.0, base.y) + right * position.x * w;
        transformed.y += h * t * lift;
        transformed.xz += bend * h * curve;
        vT = t;

        vec3 wild = mix(uWildBase, uWildMid, smoothstep(0.0, 0.55, t));
        wild = mix(wild, mix(uWildTip, uWildTip2, step(0.78, fract(rnd * 7.3))), smoothstep(0.45, 1.0, t));
        vec3 mown = mix(stripe < 0.5 ? uStripeA : uStripeB, uWildBase, (1.0 - t) * 0.55);
        vCol = mix(wild, mown, cut) * (0.82 + rnd * 0.3);
        `,
      )
      .replace(
        "#include <beginnormal_vertex>",
        /* glsl */ `vec3 objectNormal = normalize(vec3(-sin(aPos.z), 0.0, cos(aPos.z)) * 0.45 + vec3(0.0, 1.0, 0.0) + vec3(position.x * 0.8, 0.0, 0.0));`,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        varying vec3 vCol;
        varying float vT;
        uniform vec3 uSunView;
        uniform vec3 uSunCol;`,
      )
      .replace("#include <color_fragment>", "diffuseColor.rgb = vCol;")
      .replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `
        // back-lit blades: the low sun shines through the tips
        float back = pow(max(dot(-normalize(vViewPosition), uSunView), 0.0), 3.0);
        totalEmissiveRadiance += vCol * uSunCol * (0.25 + back * 1.6) * smoothstep(0.25, 1.0, vT) * 0.55;`,
      );
  };
  const grass = new THREE.Mesh(geo, grassMat);
  grass.frustumCulled = false;
  grass.receiveShadow = true;
  scene.add(grass);

  // ── ground: soil under the meadow, striped where cut, fading out into the distance ──
  const groundGeo = new THREE.PlaneGeometry(40, Z_NEAR - Z_FAR + 6, 1, 1);
  groundGeo.rotateX(-Math.PI / 2);
  groundGeo.translate(0, 0, (Z_NEAR + Z_FAR) / 2 - 2);
  const groundMat = new THREE.MeshStandardMaterial({ roughness: 0.95, transparent: true, depthWrite: false });
  groundMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, shared);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vW;")
      .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvW = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        varying vec3 vW;
        uniform vec3 uSoil; uniform vec3 uStripeA; uniform vec3 uStripeB;
        ${LANE_GLSL}`,
      )
      .replace(
        "#include <color_fragment>",
        /* glsl */ `
        float lane = laneIndex(vW.z);
        float cut = cutAt(vW.xz, lane);
        vec3 mown = (mod(lane, 2.0) < 0.5 ? uStripeA : uStripeB) * 0.72;
        diffuseColor.rgb = mix(uSoil, mown, cut);
        diffuseColor.a = smoothstep(${(Z_FAR - 4.5).toFixed(2)}, ${Z_FAR.toFixed(2)}, vW.z);`,
      );
  };
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.receiveShadow = true;
  ground.renderOrder = -1;
  scene.add(ground);

  // ── mower ──
  const mower = createMower();
  scene.add(mower.group);
  const mowerScale = 1;
  mower.group.scale.setScalar(mowerScale);

  // ── clippings ──
  const MAXC = 700;
  const clipGeo = new THREE.PlaneGeometry(0.07, 0.016);
  const clipMat = new THREE.MeshStandardMaterial({ roughness: 0.7, side: THREE.DoubleSide });
  const clips = new THREE.InstancedMesh(clipGeo, clipMat, MAXC);
  clips.frustumCulled = false;
  clips.castShadow = false;
  clips.count = 0;
  const cPos = new Float32Array(MAXC * 3);
  const cVel = new Float32Array(MAXC * 3);
  const cRot = new Float32Array(MAXC * 3);
  const cLife = new Float32Array(MAXC);
  const clipColors = ["#86a24a", "#a9bf66", "#5f7d38", "#c3b25e", "#739041"].map((c) => new THREE.Color(c));
  for (let i = 0; i < MAXC; i++) clips.setColorAt(i, clipColors[i % clipColors.length]);
  scene.add(clips);
  let clipHead = 0;
  const dummy = new THREE.Object3D();

  // ── path ──
  const laneX0 = [0, 0, 0];
  const laneX1 = [0, 0, 0];
  const laneZ = (k: number) => ZA + (k + 0.5) * LANE_W;
  const pathAt = (s: number) => {
    const k = Math.max(0, Math.min(LANES - 1, Math.floor(s)));
    const f = s - k;
    const dir = k % 2 === 0 ? 1 : -1;
    const x = dir > 0 ? laneX0[k] + (laneX1[k] - laneX0[k]) * f : laneX1[k] - (laneX1[k] - laneX0[k]) * f;
    return { x, z: laneZ(k), dir, k };
  };

  let W = 1;
  let H = 1;
  let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    const tanH = Math.tan(THREE.MathUtils.degToRad(CAM.fov / 2)) * camera.aspect;
    for (let k = 0; k < LANES; k++) {
      const half = (CAM.z - laneZ(k)) * tanH + 1.4;
      laneX0[k] = -half;
      laneX1[k] = half;
    }
    // lane 0 opens mid-job: the left of it is already cut
    laneX0[0] = -(CAM.z - laneZ(0)) * tanH * 0.5;
    shared.uX0.value.set(laneX0[0], laneX0[1], laneX0[2]);
    shared.uX1.value.set(laneX1[0], laneX1[1], laneX1[2]);
  };

  // ── state ──
  const clock = new THREE.Timer();
  let elapsed = 4; // the server still shows the meadow grown, so the live scene starts grown too
  let target = 0; // scroll progress 0..1
  let s = -0.14; // path position (lanes), eases toward target*LANES
  let intro = 0; // the drive-in on arrival
  let cutS = s;
  let visible = true;
  let raf = 0;
  let disposed = false;
  const ptr = { ndc: new THREE.Vector2(), on: false, k: 0, cam: new THREE.Vector2() };
  const ray = new THREE.Raycaster();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();
  const lookAt = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  let lastMX = 0;
  let frames = 0;
  let slow = 0;

  const place = (dt: number) => {
    const goal = Math.max(-0.14 + 0.14 * easeOut(intro), target * LANES);
    s += (goal - s) * Math.min(1, dt * 6);
    if (s > cutS) cutS = s;
    else cutS += (s - cutS) * Math.min(1, dt * 1.6);
    shared.uCutS.value = cutS;

    const p = pathAt(Math.min(LANES - 0.0001, s));
    const g = mower.group;
    const dx = p.x - lastMX;
    lastMX = p.x;
    g.position.set(p.x, 0, p.z);
    g.rotation.y = p.dir > 0 ? 0 : Math.PI;
    mower.update(Math.abs(dx) > 1 ? 0 : dx * p.dir, elapsed, 0);
    shared.uMower.value.set(p.x + p.dir * 0.95, 0, p.z);
    sun.target.position.set(p.x, 0, p.z);
    sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 12);
    return { p, moved: Math.abs(dx) > 1 ? 0 : dx * p.dir };
  };

  const spray = (p: { x: number; z: number; dir: number }, amount: number) => {
    const n = Math.min(26, Math.round(amount));
    tmp.copy(mower.chute);
    mower.group.localToWorld(tmp);
    for (let j = 0; j < n; j++) {
      const i = clipHead;
      clipHead = (clipHead + 1) % MAXC;
      clips.count = Math.max(clips.count, clipHead === 0 ? MAXC : clipHead);
      cPos[i * 3] = tmp.x + (Math.random() - 0.5) * 0.18;
      cPos[i * 3 + 1] = tmp.y + Math.random() * 0.05;
      cPos[i * 3 + 2] = tmp.z;
      const out = p.dir; // chute is on the mower's right: +z driving +x, −z driving −x
      cVel[i * 3] = -p.dir * (0.3 + Math.random() * 0.9) + (Math.random() - 0.5) * 0.6;
      cVel[i * 3 + 1] = 1.8 + Math.random() * 2.4;
      cVel[i * 3 + 2] = out * (1.6 + Math.random() * 2.6);
      cRot[i * 3] = Math.random() * 6.28;
      cRot[i * 3 + 1] = Math.random() * 6.28;
      cRot[i * 3 + 2] = Math.random() * 6.28;
      cLife[i] = 0.0001;
    }
  };

  const stepClips = (dt: number) => {
    for (let i = 0; i < clips.count; i++) {
      if (cLife[i] <= 0) {
        dummy.position.set(0, -10, 0);
        dummy.scale.setScalar(0);
      } else {
        cLife[i] += dt;
        const y = cPos[i * 3 + 1];
        if (y > 0.03) {
          cVel[i * 3 + 1] -= 9.8 * dt;
          const drag = Math.pow(0.18, dt);
          cVel[i * 3] *= drag;
          cVel[i * 3 + 2] *= drag;
          cPos[i * 3] += cVel[i * 3] * dt;
          cPos[i * 3 + 1] += cVel[i * 3 + 1] * dt;
          cPos[i * 3 + 2] += cVel[i * 3 + 2] * dt;
          cRot[i * 3] += dt * 9;
          cRot[i * 3 + 2] += dt * 7;
        } else {
          cPos[i * 3 + 1] = 0.03;
          cRot[i * 3] = Math.PI / 2;
        }
        const fade = 1 - THREE.MathUtils.smoothstep(cLife[i], 1.6, 2.6);
        if (fade <= 0) cLife[i] = 0;
        dummy.position.set(cPos[i * 3], cPos[i * 3 + 1], cPos[i * 3 + 2]);
        dummy.rotation.set(cRot[i * 3], cRot[i * 3 + 1], cRot[i * 3 + 2]);
        dummy.scale.setScalar(fade);
      }
      dummy.updateMatrix();
      clips.setMatrixAt(i, dummy.matrix);
    }
    clips.instanceMatrix.needsUpdate = true;
  };

  let view = CAM;
  const updateCamera = (dt: number) => {
    const k = Math.min(1, dt * 3);
    ptr.cam.x += ((ptr.on ? ptr.ndc.x : 0) - ptr.cam.x) * k;
    ptr.cam.y += ((ptr.on ? ptr.ndc.y : 0) - ptr.cam.y) * k;
    const sp = Math.min(1, s / LANES);
    camera.position.set(view.x + ptr.cam.x * 0.28, view.y - sp * 0.12 + ptr.cam.y * 0.06, view.z - sp * 0.35);
    lookAt.set(view.x + ptr.cam.x * 0.12, view.lookY, view.lookZ);
    camera.lookAt(lookAt);
    camera.updateMatrixWorld();
    shared.uSunView.value.copy(SUN_DIR).transformDirection(camera.matrixWorldInverse);
  };

  const render = () => renderer.render(scene, camera);

  const tick = () => {
    raf = 0;
    if (disposed || !visible || document.hidden) return;
    const t0 = performance.now();
    clock.update();
    const dt = Math.min(0.05, clock.getDelta());
    elapsed += dt;
    shared.uTime.value = elapsed;
    if (elapsed > 4.4) intro = Math.min(1, intro + dt / 2.2);
    if (opts.progress) target = Math.min(1, Math.max(0, opts.progress()));

    ptr.k += ((ptr.on ? 1 : 0) - ptr.k) * Math.min(1, dt * 4);
    shared.uPtrK.value = ptr.k;
    if (ptr.on) {
      ray.setFromCamera(ptr.ndc, camera);
      if (ray.ray.intersectPlane(groundPlane, hit)) shared.uPtr.value.copy(hit);
    }

    const { p, moved } = place(dt);
    // clippings only while cutting long grass (inside the three lanes, moving forward)
    if (moved > 0.002 && s >= -0.14 && s < LANES) spray(p, moved * 70);
    stepClips(dt);
    updateCamera(dt);
    render();
    if (frames === 0) opts.onFirstFrame?.();

    // keep it smooth on slower GPUs: drop resolution if frames run long
    frames++;
    if (performance.now() - t0 > 14) slow++;
    if (frames % 90 === 0) {
      if (slow > 30 && dpr > 0.8) {
        dpr = Math.max(0.75, dpr - 0.25);
        resize();
      }
      slow = 0;
    }
    raf = requestAnimationFrame(tick);
  };
  const start = () => {
    if (!raf && visible && !disposed && ready) {
      clock.reset();
      raf = requestAnimationFrame(tick);
    }
  };
  const onVis = () => (document.hidden ? undefined : start());
  document.addEventListener("visibilitychange", onVis);

  resize();
  updateCamera(0);
  place(0);
  // compile every shader off the main thread where the driver allows it, then start drawing
  let ready = false;
  void renderer
    .compileAsync(scene, camera)
    .catch(() => {})
    .then(() => {
      ready = true;
      if (!disposed) start();
    });

  return {
    setProgress(p) {
      target = Math.min(1, Math.max(0, p));
    },
    setPointer(x, y) {
      ptr.ndc.set((x / W) * 2 - 1, -(y / H) * 2 + 1);
      ptr.on = true;
    },
    clearPointer() {
      ptr.on = false;
    },
    setVisible(v) {
      visible = v;
      if (v) start();
    },
    resize,
    still(at, v) {
      ready = true;
      if (v) {
        view = { ...CAM, ...v };
        camera.fov = view.fov;
        camera.updateProjectionMatrix();
      }
      cancelAnimationFrame(raf);
      raf = 0;
      visible = false;
      elapsed = 20;
      shared.uTime.value = elapsed;
      intro = at < 0 ? 0 : 1;
      target = Math.max(0, at) / LANES;
      s = at;
      cutS = at;
      lastMX = pathAt(at).x;
      place(1);
      if (at > 0.1) {
        // a frozen burst from the chute
        for (let i = 0; i < 26; i++) {
          spray(pathAt(at), 6);
          stepClips(0.016 + Math.random() * 0.03);
        }
      }
      updateCamera(1);
      render();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      mower.dispose();
      [geo, blade, groundGeo, clipGeo].forEach((x) => x.dispose());
      [grassMat, groundMat, clipMat].forEach((x) => x.dispose());
      renderer.dispose();
    },
  };
}
