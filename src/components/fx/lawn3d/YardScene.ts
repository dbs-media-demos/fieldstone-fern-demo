import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { createMower } from "./mower";
import { MAX_DPR, breathe, frameWatch, gpuRenderer, warmUp } from "./smooth";

/**
 * The lawn-plan builder's yard as a 3D scale model (desktop only, behind the 3D gate).
 *
 * A Texas ranch house on its lot, cut out of the ground like an architect's model, lit by a sun
 * with soft shadows. The builder's controls act on it: the size slider grows the lot (and the camera
 * pulls back), mowing lays stripes and sends a ride-on round the lanes, edging trims the ragged
 * borders into a steel edge, fertilizer drops granules and deepens the green, weed control pulls
 * the dandelions, and hedge trimming shapes the shaggy hedges into clean boxes. The pointer and the
 * page scroll turn it a few degrees.
 *
 * `renderLayer` draws one part on its own over transparent (with the rest as invisible occluders),
 * which is how the phone and fallback stills are made: the same layers, cross-faded with CSS.
 *
 * Built ahead of time (while the browser is idle), it shows nothing until every shader is compiled
 * and one frame has been drawn unseen (`ready`). Its first 2 s on screen are watched, and if they
 * run slow `onSlow` lets the caller fade back to the stills.
 */
export type YardState = {
  size: number; // 0..1 along the slider
  mowing: boolean;
  edging: boolean;
  fertilization: boolean;
  weeds: boolean; // weed control on = no weeds
  hedges: boolean;
  weekly: boolean;
};

export type YardLayer = "base" | "mow" | "edgeRagged" | "edgeClean" | "weeds" | "fert" | "hedgeWild" | "hedgeClipped";

export type Yard = {
  set: (s: YardState) => void;
  setPointer: (nx: number, ny: number) => void;
  clearPointer: () => void;
  setScroll: (p: number) => void;
  setVisible: (v: boolean) => void;
  resize: () => void;
  renderLayer: (layer: YardLayer) => void;
  /** Resolves once the model is compiled and has drawn its first frame unseen. */
  ready: Promise<void>;
  dispose: () => void;
};

// Fixed parts of the lot (house, drive, beds); the lawn grows out to the left and front.
const HOUSE = { x0: -2.8, x1: 2.8, z0: -3.0, z1: 0.2, wall: 1.25, roof: 1.25 };
const DRIVE = { x0: 3.0, x1: 4.4 };
const LOT_RIGHT = 5.6;
const LOT_BACK = -3.6;
const LAWN = { x1: 2.62, z0: 1.3, wMin: 6.8, wMax: 15, dMin: 3.6, dMax: 9.2 };
const LANE = 0.7;

const rand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const lawnFor = (size: number) => {
  const k = Math.pow(Math.max(0, Math.min(1, size)), 0.8);
  const w = LAWN.wMin + (LAWN.wMax - LAWN.wMin) * k;
  const d = LAWN.dMin + (LAWN.dMax - LAWN.dMin) * k;
  return { x0: LAWN.x1 - w, x1: LAWN.x1, z0: LAWN.z0, z1: LAWN.z0 + d };
};

/** Built in short slices (it yields between parts), so creating it never blocks the page for long. */
export async function createYard(canvas: HTMLCanvasElement, opts: { onSlow?: () => void } = {}): Promise<Yard> {
  const renderer = gpuRenderer(canvas, { antialias: true, alpha: true });
  renderer.debug.checkShaderErrors = false;
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  // No environment map: its PMREM blur costs ~0.4 s of shader compile on the main thread.
  // Hemisphere + fill lights carry the ambient instead.

  const camera = new THREE.PerspectiveCamera(28, 4 / 3, 0.5, 120);

  const sun = new THREE.DirectionalLight("#fff0d6", 2.9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.radius = 4;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 70 });
  const SUN = new THREE.Vector3(-0.85, 0.95, -0.12).normalize();
  scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight("#eef2ff", "#8a7a58", 2.6), new THREE.AmbientLight("#fff8ec", 1.1));
  const fill = new THREE.DirectionalLight("#dfe6ff", 0.45);
  fill.position.set(6, 5, 10);
  scene.add(fill);

  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const G = <T extends THREE.BufferGeometry>(g: T) => (geos.push(g), g);
  const M = <T extends THREE.Material>(m: T) => (mats.push(m), m);
  const std = (color: string, roughness = 0.85, extra: THREE.MeshStandardMaterialParameters = {}) => M(new THREE.MeshStandardMaterial({ color, roughness, ...extra }));

  const layerOf = new Map<THREE.Object3D, YardLayer>();
  const tag = <T extends THREE.Object3D>(o: T, layer: YardLayer, cast = true, receive = true) => {
    layerOf.set(o, layer);
    o.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) {
        c.castShadow = cast;
        c.receiveShadow = receive;
      }
    });
    return o;
  };

  // ── uniforms ──
  const U = {
    uLawn: { value: new THREE.Vector4() }, // x0, z0, x1, z1
    uMow: { value: 0 }, // 0 shaggy → 1 striped (sweeps lane by lane)
    uFert: { value: 0 },
    uCut: { value: 0.05 },
    uTime: { value: 0 },
  };
  const LAWN_GLSL = /* glsl */ `
    uniform vec4 uLawn; uniform float uMow; uniform float uFert; uniform float uCut; uniform float uTime;
    float inLawn(vec2 p) { return step(uLawn.x, p.x) * step(p.x, uLawn.z) * step(uLawn.y, p.y) * step(p.y, uLawn.w); }
    float laneOf(vec2 p) { return floor((p.x - uLawn.x) / ${LANE.toFixed(3)}); }
    float mownAt(vec2 p) {
      float lanes = max(1.0, floor((uLawn.z - uLawn.x) / ${LANE.toFixed(3)}));
      return smoothstep(0.0, 0.08, uMow * (lanes + 2.0) - laneOf(p) - 1.0);
    }
    vec3 lawnColour(vec2 p, float t) {
      float lane = laneOf(p);
      float stripe = mod(lane, 2.0);
      float m = mownAt(p);
      vec3 wildC = mix(vec3(0.07, 0.12, 0.035), vec3(0.24, 0.27, 0.08), t);
      vec3 a = mix(vec3(0.10, 0.20, 0.045), vec3(0.24, 0.36, 0.09), t);
      vec3 b = mix(vec3(0.045, 0.11, 0.025), vec3(0.09, 0.19, 0.045), t);
      vec3 mown = stripe < 0.5 ? a : b;
      vec3 c = mix(wildC, mown, m);
      // fed lawns go a deeper, bluer green
      c = mix(c, c * vec3(0.78, 1.08, 0.86), uFert * 0.8);
      return c;
    }
  `;

  await breathe();
  // ── the lot: soil block with a turf skin, cut like an architect's model ──
  const lot = new THREE.Group();
  scene.add(lot);
  const soil = new THREE.Mesh(G(new RoundedBoxGeometry(1, 0.55, 1, 3, 0.04)), std("#6e5238", 1));
  soil.position.y = -0.3;
  const turf = new THREE.Mesh(G(new RoundedBoxGeometry(1, 0.08, 1, 3, 0.03)), std("#4f6a2f", 0.95));
  turf.position.y = -0.035;
  lot.add(soil, turf);
  tag(lot, "base", false, true);
  soil.castShadow = true;
  turf.castShadow = true;

  // contact shadow on the card underneath
  const catcher = new THREE.Mesh(G(new THREE.PlaneGeometry(80, 80)), M(new THREE.ShadowMaterial({ opacity: 0.22 })));
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.y = -0.58;
  catcher.receiveShadow = true;
  scene.add(tag(catcher, "base", false, true));

  await breathe();
  // ── lawn: a plane coloured by the shader, plus short instanced blades for texture ──
  const lawnMat = std("#ffffff", 0.95);
  lawnMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vW;")
      .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvW = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vW;\n${LAWN_GLSL}`)
      .replace("#include <color_fragment>", "diffuseColor.rgb = lawnColour(vW.xz, 0.35) * 0.9;");
  };
  const lawnPlane = new THREE.Mesh(G(new THREE.PlaneGeometry(1, 1)), lawnMat);
  lawnPlane.rotation.x = -Math.PI / 2;
  lawnPlane.position.y = 0.006;
  scene.add(tag(lawnPlane, "mow", false, true));
  // the unmowed state's plane (base layer) shares the material: base renders with uMow = 0
  const BLADES = 52000;
  const bladeGeo = new THREE.PlaneGeometry(1, 1, 1, 3);
  bladeGeo.translate(0, 0.5, 0);
  const grassGeo = G(new THREE.InstancedBufferGeometry());
  grassGeo.index = bladeGeo.index;
  grassGeo.setAttribute("position", bladeGeo.getAttribute("position"));
  grassGeo.setAttribute("normal", bladeGeo.getAttribute("normal"));
  const r0 = rand(7);
  const stones = [
    [-0.8, 0.75],
    [-0.55, 1.55],
    [0.05, 2.15],
    [0.85, 2.55],
    [1.7, 2.8],
    [2.45, 2.95],
  ];
  const bp = new Float32Array(BLADES * 4);
  const maxL = lawnFor(1);
  for (let i = 0, n = 0; n < BLADES && i < BLADES * 3; i++) {
    const x = maxL.x0 + r0() * (maxL.x1 - maxL.x0);
    const z = maxL.z0 + r0() * (maxL.z1 - maxL.z0);
    if (stones.some(([sx, sz]) => (sx - x) ** 2 + (sz - z) ** 2 < 0.07)) continue;
    bp.set([x, z, r0() * Math.PI, r0()], n * 4);
    n++;
  }
  grassGeo.setAttribute("aPos", new THREE.InstancedBufferAttribute(bp, 4));
  grassGeo.instanceCount = BLADES;
  grassGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(-4, 0, 6), 30);
  const grassMat = M(new THREE.MeshStandardMaterial({ roughness: 0.8, side: THREE.DoubleSide }));
  grassMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", `#include <common>\nattribute vec4 aPos;\nvarying vec3 vCol;\n${LAWN_GLSL}`)
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `
        vec2 base = aPos.xy;
        float rnd = aPos.w;
        float t = position.y;
        float on = inLawn(base);
        float m = mownAt(base);
        float lane = laneOf(base);
        float dir = mod(lane, 2.0) < 0.5 ? 1.0 : -1.0;
        float h = mix(0.1 + rnd * 0.13, uCut * (0.8 + rnd * 0.4), m) * on;
        float sway = sin(uTime * 1.6 + base.x * 0.9 + rnd * 6.0) * 0.12 * (1.0 - m);
        vec2 bend = mix(vec2(sway + (rnd - 0.5) * 0.6, (fract(rnd * 13.0) - 0.5) * 0.6), vec2(0.15, dir * 0.6), m);
        vec3 right = vec3(cos(aPos.z), 0.0, sin(aPos.z));
        vec3 transformed = vec3(base.x, 0.0, base.y) + right * position.x * 0.034 * (1.0 - t * 0.85) * on;
        transformed.y += h * t * (1.0 - 0.25 * dot(bend, bend) * t);
        transformed.xz += bend * h * t * t;
        vCol = lawnColour(base, t) * (0.85 + rnd * 0.3);
        `,
      )
      .replace("#include <beginnormal_vertex>", "vec3 objectNormal = vec3(0.0, 1.0, 0.0);");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vCol;")
      .replace("#include <color_fragment>", "diffuseColor.rgb = vCol;");
  };
  const grass = new THREE.Mesh(grassGeo, grassMat);
  grass.frustumCulled = false;
  scene.add(tag(grass, "mow", false, true));

  await breathe();
  // ── house: limestone ranch with a hip roof, garage, door, windows ──
  const house = new THREE.Group();
  const hw = HOUSE.x1 - HOUSE.x0;
  const hd = HOUSE.z1 - HOUSE.z0;
  const hx = (HOUSE.x0 + HOUSE.x1) / 2;
  const hz = (HOUSE.z0 + HOUSE.z1) / 2;
  const stone = std("#e4d7bf", 0.9);
  const walls = new THREE.Mesh(G(new RoundedBoxGeometry(hw, HOUSE.wall, hd, 2, 0.03)), stone);
  walls.position.set(hx, HOUSE.wall / 2, hz);
  house.add(walls);
  const roofGeo = (() => {
    const ow = hw / 2 + 0.32;
    const od = hd / 2 + 0.32;
    const y0 = HOUSE.wall;
    const y1 = HOUSE.wall + HOUSE.roof;
    const r = od; // hip runs in at 45°
    const A = [-ow, y0, -od], B = [ow, y0, -od], C = [ow, y0, od], D = [-ow, y0, od];
    const R1 = [-ow + r, y1, 0], R2 = [ow - r, y1, 0];
    const tri = (...p: number[][]) => p.flat();
    const pos = [
      ...tri(D, C, R2), ...tri(D, R2, R1), // front
      ...tri(B, A, R1), ...tri(B, R1, R2), // back
      ...tri(A, D, R1), // left
      ...tri(C, B, R2), // right
      ...tri(A, B, C), ...tri(A, C, D), // soffit
    ];
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return G(g);
  })();
  const roof = new THREE.Mesh(roofGeo, std("#3d4240", 0.7));
  roof.position.set(hx, 0, hz);
  house.add(roof);
  const chimney = new THREE.Mesh(G(new THREE.BoxGeometry(0.42, 0.9, 0.42)), std("#b9a88a", 0.95));
  chimney.position.set(hx - 1.5, HOUSE.wall + HOUSE.roof * 0.75, hz - 0.35);
  house.add(chimney);
  const glass = std("#1f2a2c", 0.15, { metalness: 0.6, envMapIntensity: 1.2 });
  const trim = std("#f5efe2", 0.6);
  const frontZ = HOUSE.z1 + 0.012;
  const addFront = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, frontZ);
    house.add(m);
    return m;
  };
  // garage (right), door (left of centre), windows
  addFront(G(new THREE.BoxGeometry(1.7, 0.95, 0.03)), trim, 1.75, 0.49);
  for (let i = 0; i < 4; i++) addFront(G(new THREE.BoxGeometry(1.6, 0.012, 0.035)), std("#d9cfbb", 0.6), 1.75, 0.16 + i * 0.22);
  addFront(G(new THREE.BoxGeometry(0.5, 0.9, 0.04)), std("#2f4a34", 0.5), -0.8, 0.45);
  addFront(G(new THREE.BoxGeometry(0.62, 0.06, 0.06)), trim, -0.8, 0.93);
  for (const x of [-2.1, -1.5, 0.15]) {
    addFront(G(new THREE.BoxGeometry(0.5, 0.56, 0.04)), trim, x, 0.66);
    addFront(G(new THREE.BoxGeometry(0.42, 0.48, 0.05)), glass, x, 0.66);
  }
  // porch slab + light
  const porch = new THREE.Mesh(G(new THREE.BoxGeometry(1.2, 0.06, 0.5)), std("#cdbfa3", 0.9));
  porch.position.set(-0.8, 0.03, HOUSE.z1 + 0.25);
  house.add(porch);
  scene.add(tag(house, "base", true, true));

  await breathe();
  // ── hard surfaces: drive, walk, stepping stones, sidewalk ──
  const hard = new THREE.Group();
  const concrete = std("#d8d0c0", 0.92);
  const drive = new THREE.Mesh(G(new THREE.BoxGeometry(1, 0.025, 1)), concrete);
  hard.add(drive);
  const walkGeo = G(new THREE.CylinderGeometry(0.26, 0.27, 0.045, 18));
  const flag = std("#c9bca2", 0.95);
  const stoneMeshes = new Set<THREE.Object3D>();
  stones.forEach(([x, z], i) => {
    const s = new THREE.Mesh(walkGeo, flag);
    stoneMeshes.add(s);
    s.position.set(x, 0.02, z);
    s.scale.set(1 + (i % 2) * 0.12, 1, 0.82 + (i % 3) * 0.08);
    s.rotation.y = i * 0.7;
    hard.add(s);
  });
  const sidewalk = new THREE.Mesh(G(new THREE.BoxGeometry(1, 0.03, 0.42)), concrete);
  hard.add(sidewalk);
  scene.add(tag(hard, "base", false, true));

  await breathe();
  // ── beds: mulch along the house, the side bed and the verge, with shrubs and two trees ──
  const beds = new THREE.Group();
  const mulch = std("#4b3527", 1);
  const bedFront = new THREE.Mesh(G(new THREE.BoxGeometry(1, 0.03, 1)), mulch);
  const bedSide = new THREE.Mesh(G(new THREE.BoxGeometry(1, 0.03, 1)), mulch);
  const verge = new THREE.Mesh(G(new THREE.BoxGeometry(1, 0.03, 1)), mulch);
  beds.add(bedFront, bedSide, verge);
  const leaf = std("#3b5a33", 0.85);
  const leafDark = std("#2c4529", 0.9);
  // a soft, lumpy ball of foliage (welded, so the bumps never crack open)
  const blob = (r: number, seed: number, detail = 3) => {
    const g = mergeVertices(new THREE.IcosahedronGeometry(r, detail).deleteAttribute("normal").deleteAttribute("uv"));
    const p = g.getAttribute("position");
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).divideScalar(r);
      const k = 1 + Math.sin(v.x * 5.1 + seed) * Math.sin(v.y * 4.3 + seed * 0.7) * Math.sin(v.z * 4.7 + seed * 0.3) * 0.16 + Math.sin(v.x * 13 + v.z * 11 + seed) * 0.03;
      v.multiplyScalar(r * k);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return G(g);
  };
  const tree = (scale: number, seed: number) => {
    const t = new THREE.Group();
    const trunk = new THREE.Mesh(G(new THREE.CylinderGeometry(0.09, 0.16, 1.5, 10)), std("#5b4433", 0.9));
    trunk.position.y = 0.75;
    t.add(trunk);
    const crown = new THREE.Group();
    crown.position.y = 1.55;
    const rr = rand(seed);
    for (let i = 0; i < 7; i++) {
      const b = new THREE.Mesh(blob(0.55 + rr() * 0.3, seed + i), i % 3 ? leaf : leafDark);
      const a = (i / 7) * Math.PI * 2;
      b.position.set(Math.cos(a) * 0.55 * (i ? 1 : 0), (i ? rr() * 0.4 : 0.35), Math.sin(a) * 0.5 * (i ? 1 : 0));
      crown.add(b);
    }
    t.add(crown);
    t.scale.setScalar(scale);
    t.userData.crown = crown;
    return t;
  };
  const treeA = tree(1.25, 3);
  const treeB = tree(0.95, 11);
  beds.add(treeA, treeB);
  const shrubs: THREE.Mesh[] = [];
  const shrubGeo = blob(0.26, 21, 2);
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Mesh(shrubGeo, i % 2 ? leaf : leafDark);
    shrubs.push(s);
    beds.add(s);
  }
  scene.add(tag(beds, "base", true, true));

  await breathe();
  // ── hedges: foundation row + the long property hedge on the left; shaggy ↔ clipped ──
  type Hedge = { x: number; z: number; len: number; alongX: boolean; h: number; d: number };
  const hedgeSpecs = (L: ReturnType<typeof lawnFor>): Hedge[] => {
    const hx0 = L.x0 - 0.42;
    const out: Hedge[] = [
      { x: -2.0, z: 0.68, len: 1.4, alongX: true, h: 0.55, d: 0.48 },
      { x: 0.25, z: 0.68, len: 1.1, alongX: true, h: 0.55, d: 0.48 },
      { x: 1.95, z: 0.68, len: 1.1, alongX: true, h: 0.55, d: 0.48 },
    ];
    // property hedge in ~2.4 m segments from the back to the front of the lot
    const z0 = LOT_BACK + 0.4;
    const z1 = L.z1 - 0.2;
    const n = Math.max(2, Math.round((z1 - z0) / 2.4));
    const seg = (z1 - z0) / n;
    for (let i = 0; i < n; i++) out.push({ x: hx0, z: z0 + seg * (i + 0.5), len: seg - 0.12, alongX: false, h: 0.85, d: 0.55 });
    return out;
  };
  const MAX_HEDGES = 10;
  const hedgeBox = G(new RoundedBoxGeometry(1, 1, 1, 3, 0.08));
  const clipped = new THREE.InstancedMesh(hedgeBox, std("#33512f", 0.75), MAX_HEDGES);
  const coreWild = new THREE.InstancedMesh(hedgeBox, std("#2d4429", 0.95), MAX_HEDGES);
  const BLOBS = 420;
  const tuftGeo = blob(1, 41, 2);
  const wildBlobs = new THREE.InstancedMesh(tuftGeo, std("#3f5f34", 0.9), BLOBS);
  const r = rand(101);
  const blobSeed = Array.from({ length: BLOBS }, (_, i) => {
    return { h: i, u: r(), v: r(), w: r(), s: 0.12 + r() * 0.16, up: r() < 0.2 };
  });
  const hedgeG = new THREE.Group();
  hedgeG.add(clipped, coreWild, wildBlobs);
  scene.add(hedgeG);
  tag(clipped, "hedgeClipped", true, true);
  tag(coreWild, "hedgeWild", true, true);
  tag(wildBlobs, "hedgeWild", true, true);

  await breathe();
  // ── edging: ragged tufts over the bed lines, or a clean cut with a steel edge ──
  const TUFTS = 150;
  const tuftCone = G(new THREE.ConeGeometry(0.07, 0.24, 5));
  tuftCone.translate(0, 0.12, 0);
  const tufts = new THREE.InstancedMesh(tuftCone, std("#56722f", 0.9), TUFTS);
  const rt = rand(303);
  const tuftSeed = Array.from({ length: TUFTS }, (_, i) => {
    const r = rt;
    return { e: i % 3, t: r(), o: (r() - 0.3) * 0.16, s: 0.6 + r() * 0.7, lean: (r() - 0.5) * 1.2, yaw: r() * 6 };
  });
  scene.add(tag(tufts, "edgeRagged", false, true));
  const steel = std("#2b2f2d", 0.4, { metalness: 0.7 });
  const trench = std("#3a281d", 1);
  const edgeG = new THREE.Group();
  const edgeParts: { steel: THREE.Mesh; cut: THREE.Mesh }[] = [];
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(G(new THREE.BoxGeometry(1, 0.05, 0.022)), steel);
    const c = new THREE.Mesh(G(new THREE.BoxGeometry(1, 0.012, 0.1)), trench);
    edgeG.add(s, c);
    edgeParts.push({ steel: s, cut: c });
  }
  scene.add(tag(edgeG, "edgeClean", false, true));

  await breathe();
  // ── weeds: dandelions (rosette, stem, flower) ──
  const WEEDS = 22;
  const rosetteGeo = G(new THREE.SphereGeometry(0.11, 8, 4));
  rosetteGeo.scale(1, 0.18, 1);
  const stemGeo = G(new THREE.CylinderGeometry(0.008, 0.01, 0.2, 5));
  stemGeo.translate(0, 0.1, 0);
  const headGeo = G(new THREE.SphereGeometry(0.045, 10, 8));
  const weedRos = new THREE.InstancedMesh(rosetteGeo, std("#5c7a2c", 0.8), WEEDS);
  const weedStem = new THREE.InstancedMesh(stemGeo, std("#6d8a33", 0.8), WEEDS);
  const weedHead = new THREE.InstancedMesh(headGeo, std("#efc23a", 0.55, { emissive: "#6b4a00", emissiveIntensity: 0.25 }), WEEDS);
  const rw = rand(505);
  const weedSeed = Array.from({ length: WEEDS }, () => {
    const r = rw;
    return { u: 0.05 + r() * 0.9, v: 0.06 + r() * 0.88, s: 0.8 + r() * 0.5, d: r() };
  });
  const weedG = new THREE.Group();
  weedG.add(weedRos, weedStem, weedHead);
  scene.add(tag(weedG, "weeds", false, true));

  await breathe();
  // ── fertilizer granules ──
  const GRAN = 230;
  const granules = new THREE.InstancedMesh(G(new THREE.SphereGeometry(0.02, 6, 4)), std("#e9e4d6", 0.5), GRAN);
  const rg = rand(808);
  const granSeed = Array.from({ length: GRAN }, () => {
    const r = rg;
    return { u: r(), v: r(), d: r() * 0.9 };
  });
  scene.add(tag(granules, "fert", false, false));

  await breathe();
  // ── the mower (a crew member on the ride-on, at model scale) ──
  const mower = createMower();
  mower.group.scale.setScalar(0.66);
  scene.add(tag(mower.group, "mow", true, true));

  // ── state ──
  const target: YardState = { size: 0.214, mowing: true, edging: true, fertilization: true, weeds: false, hedges: false, weekly: true };
  const cur = { size: target.size, mow: 1, edge: 1, fert: 1, weeds: 0, hedge: 0, cut: 0.05 };
  let fertT = -10; // when the granules were last dropped
  let L = lawnFor(cur.size);
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  let scroll = 0.5;
  let visible = true;
  let disposed = false;
  let raf = 0;
  let needs = 3;
  const clock = new THREE.Timer();
  let elapsed = 0;
  let mowU = 0;
  let mowDir = 1;
  let turn = 0;
  const dummy = new THREE.Object3D();
  const lookAt = new THREE.Vector3();

  const easeOutBack = (t: number) => {
    const c = 1.5;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  };
  const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

  // Mower path: lanes along z, serpentine, turning inside the lawn
  const mowerPath = () => {
    const lanes = Math.max(2, Math.floor((L.x1 - L.x0) / LANE));
    const zA = L.z0 + 0.62;
    const zB = L.z1 - 0.62;
    const run = zB - zA;
    const turnLen = (Math.PI * LANE) / 2;
    const seg = run + turnLen;
    return { lanes, zA, zB, run, turnLen, seg, total: lanes * seg - turnLen };
  };
  const mowerAt = (u: number) => {
    const p = mowerPath();
    const d = clamp01(u) * p.total;
    const i = Math.min(p.lanes - 1, Math.floor(d / p.seg));
    const r = d - i * p.seg;
    const x0 = L.x0 + (i + 0.5) * LANE;
    const up = i % 2 === 0; // even lanes drive toward the back (−z)
    if (r <= p.run || i === p.lanes - 1) {
      const z = up ? p.zB - Math.min(r, p.run) : p.zA + Math.min(r, p.run);
      return { x: x0, z, heading: up ? Math.PI / 2 : -Math.PI / 2 };
    }
    // half-circle turn into the next lane
    const a = ((r - p.run) / p.turnLen) * Math.PI;
    const cx = x0 + LANE / 2;
    const cz = up ? p.zA : p.zB;
    const x = cx - Math.cos(a) * (LANE / 2);
    const z = up ? cz - Math.sin(a) * (LANE / 2) : cz + Math.sin(a) * (LANE / 2);
    return { x, z, heading: up ? Math.PI / 2 - a : -Math.PI / 2 + a };
  };

  const layout = () => {
    L = lawnFor(cur.size);
    U.uLawn.value.set(L.x0, L.z0, L.x1, L.z1);
    const lotX0 = L.x0 - 0.95;
    const lotZ1 = L.z1 + 0.62;
    const w = LOT_RIGHT - lotX0;
    const d = lotZ1 - LOT_BACK;
    const cx = (LOT_RIGHT + lotX0) / 2;
    const cz = (lotZ1 + LOT_BACK) / 2;
    soil.scale.set(w, 1, d);
    soil.position.set(cx, -0.3, cz);
    turf.scale.set(w, 1, d);
    turf.position.set(cx, -0.035, cz);
    lawnPlane.scale.set(L.x1 - L.x0, L.z1 - L.z0, 1);
    lawnPlane.position.set((L.x0 + L.x1) / 2, 0.006, (L.z0 + L.z1) / 2);
    drive.scale.set(DRIVE.x1 - DRIVE.x0, 1, lotZ1 - 0.42 - 0.2);
    drive.position.set((DRIVE.x0 + DRIVE.x1) / 2, 0.012, (0.2 + lotZ1 - 0.42) / 2);
    sidewalk.scale.set(w - 0.2, 1, 1);
    sidewalk.position.set(cx, 0.015, lotZ1 - 0.26);
    bedFront.scale.set(HOUSE.x1 - L.x0 - 0.42, 1, 1.05);
    bedFront.position.set((HOUSE.x1 + L.x0 - 0.42) / 2 - 0.02, 0.01, 0.75);
    bedSide.scale.set(Math.max(0.01, HOUSE.x0 - (L.x0 - 0.42)), 1, HOUSE.z1 - LOT_BACK - 0.2);
    bedSide.position.set((HOUSE.x0 + L.x0 - 0.42) / 2, 0.01, (HOUSE.z1 + LOT_BACK + 0.2) / 2);
    verge.scale.set(LOT_RIGHT - DRIVE.x1 - 0.15, 1, lotZ1 - 0.42 - 0.3);
    verge.position.set((LOT_RIGHT + DRIVE.x1) / 2, 0.01, (0.3 + lotZ1 - 0.42) / 2);
    treeA.position.set(Math.min(HOUSE.x0 - 1.0, (HOUSE.x0 + L.x0) / 2), 0, -1.3);
    treeB.position.set((LOT_RIGHT + DRIVE.x1) / 2, 0, lotZ1 - 1.5);
    shrubs.forEach((s, i) => {
      const x = L.x0 + 0.1 + ((i + 0.5) / shrubs.length) * (HOUSE.x0 - L.x0 - 0.1);
      s.position.set(i < 3 ? Math.min(x, HOUSE.x0 - 0.4) : HOUSE.x0 - 0.45 - (i - 3) * 0.2, 0.18, i < 3 ? 0.95 : -2.2 + (i - 3) * 0.9);
      s.scale.setScalar(0.9 + (i % 3) * 0.15);
    });
    // sun follows the lot so its shadows stay crisp at every size
    sun.target.position.set(cx, 0, cz);
    sun.position.copy(sun.target.position).addScaledVector(SUN, 30);
    return { w, d, cx, cz };
  };

  const placeHedges = () => {
    const specs = hedgeSpecs(L);
    const k = cur.hedge;
    for (let i = 0; i < MAX_HEDGES; i++) {
      const h = specs[i];
      if (!h) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        clipped.setMatrixAt(i, dummy.matrix);
        coreWild.setMatrixAt(i, dummy.matrix);
        continue;
      }
      const sx = h.alongX ? h.len : h.d;
      const sz = h.alongX ? h.d : h.len;
      dummy.position.set(h.x, (h.h * (0.9 + 0.1 * k)) / 2, h.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(sx, h.h * (0.9 + 0.1 * k), sz);
      dummy.updateMatrix();
      clipped.setMatrixAt(i, dummy.matrix);
      dummy.scale.set(sx * 0.92, h.h * 0.95, sz * 0.92);
      dummy.position.y = (h.h * 0.95) / 2;
      dummy.updateMatrix();
      coreWild.setMatrixAt(i, dummy.matrix);
    }
    blobSeed.forEach((b, i) => {
      const h = specs[b.h % specs.length];
      const ax = (b.u - 0.5) * (h.len + 0.1);
      const across = (b.v - 0.5) * (h.d + 0.12);
      const y = b.up ? h.h * (0.95 + b.w * 0.25) : h.h * (0.25 + b.w * 0.75);
      const grow = clamp01((1 - k) * 1.6 - b.w * 0.6);
      dummy.position.set(h.x + (h.alongX ? ax : across), y, h.z + (h.alongX ? across : ax));
      dummy.rotation.set(b.u * 6, b.v * 6, 0);
      dummy.scale.setScalar(b.s * grow * (b.up ? 1.15 : 1));
      dummy.updateMatrix();
      wildBlobs.setMatrixAt(i, dummy.matrix);
    });
    clipped.visible = k > 0.02;
    coreWild.visible = k < 0.98;
    wildBlobs.visible = k < 0.98;
    clipped.instanceMatrix.needsUpdate = true;
    coreWild.instanceMatrix.needsUpdate = true;
    wildBlobs.instanceMatrix.needsUpdate = true;
  };

  const placeEdges = () => {
    const k = cur.edge;
    const edges = [
      { a: [L.x0, L.z0], b: [L.x1, L.z0] }, // along the house bed
      { a: [L.x0, L.z0], b: [L.x0, L.z1] }, // along the hedge
      { a: [L.x1, L.z0], b: [L.x1, L.z1] }, // along the drive
    ];
    tuftSeed.forEach((t, i) => {
      const e = edges[t.e];
      const len = Math.hypot(e.b[0] - e.a[0], e.b[1] - e.a[1]);
      const ux = (e.b[0] - e.a[0]) / len;
      const uz = (e.b[1] - e.a[1]) / len;
      // spill outward, away from the lawn
      const nx = t.e === 0 ? 0 : t.e === 1 ? -1 : 1;
      const nz = t.e === 0 ? -1 : 0;
      dummy.position.set(e.a[0] + ux * len * t.t + nx * t.o, 0, e.a[1] + uz * len * t.t + nz * t.o);
      dummy.rotation.set(nz * -t.lean * 0.6, t.yaw, nx * t.lean * 0.6);
      dummy.scale.setScalar(t.s * clamp01(1 - k * 1.3 + t.t * 0.3 - 0.15));
      dummy.updateMatrix();
      tufts.setMatrixAt(i, dummy.matrix);
    });
    tufts.instanceMatrix.needsUpdate = true;
    tufts.visible = k < 0.99;
    edges.forEach((e, i) => {
      const len = Math.hypot(e.b[0] - e.a[0], e.b[1] - e.a[1]);
      const along = i === 0;
      const grown = len * clamp01(k * 1.15 - i * 0.07);
      const { steel: s, cut: c } = edgeParts[i];
      for (const [m, y] of [
        [s, 0.03],
        [c, 0.008],
      ] as const) {
        m.scale.set(Math.max(0.001, grown), 1, 1);
        m.rotation.y = along ? 0 : Math.PI / 2;
        if (along) m.position.set(e.a[0] + grown / 2, y, e.a[1] - 0.02);
        else m.position.set(e.a[0] + (i === 1 ? -0.02 : 0.02), y, e.a[1] + grown / 2);
      }
    });
    edgeG.visible = k > 0.01;
  };

  const placeWeeds = () => {
    const k = cur.weeds;
    weedSeed.forEach((w, i) => {
      const x = L.x0 + w.u * (L.x1 - L.x0);
      const z = L.z0 + w.v * (L.z1 - L.z0);
      const s = w.s * clamp01((1 - k) * 1.5 - w.d * 0.5);
      dummy.rotation.set(0, w.d * 6, 0);
      dummy.position.set(x, 0.02, z);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      weedRos.setMatrixAt(i, dummy.matrix);
      weedStem.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 0.02 + 0.2 * s, z);
      dummy.updateMatrix();
      weedHead.setMatrixAt(i, dummy.matrix);
    });
    for (const m of [weedRos, weedStem, weedHead]) {
      m.instanceMatrix.needsUpdate = true;
      m.visible = k < 0.99;
    }
  };

  const placeGranules = (now: number) => {
    const k = cur.fert;
    granSeed.forEach((g, i) => {
      const x = L.x0 + 0.1 + g.u * (L.x1 - L.x0 - 0.2);
      const z = L.z0 + 0.1 + g.v * (L.z1 - L.z0 - 0.2);
      // dropped from above when switched on, with a little bounce
      const t = clamp01((now - fertT - g.d) / 0.55);
      const y = 0.03 + (1 - easeOutBack(t)) * 1.4 * (t < 1 ? 1 : 0);
      dummy.position.set(x, Math.max(0.03, y), z);
      dummy.scale.setScalar(target.fertilization ? (t > 0 ? 1 : 0) : clamp01(k * 1.2 - g.d * 0.2));
      dummy.updateMatrix();
      granules.setMatrixAt(i, dummy.matrix);
    });
    granules.instanceMatrix.needsUpdate = true;
    granules.visible = k > 0.01 || target.fertilization;
  };

  let W = 1;
  let H = 1;
  let dims = layout();
  let camDist = 0;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    needs = 2;
  };

  const fitDist = () => 3.45 * 0.5 * Math.hypot(dims.w, dims.d);
  const updateCamera = (dt: number) => {
    const k = Math.min(1, dt * 4);
    ptr.x += (ptr.tx - ptr.x) * k;
    ptr.y += (ptr.ty - ptr.y) * k;
    camDist += (fitDist() - camDist) * Math.min(1, dt * 3);
    const az = -0.5 + (scroll - 0.5) * 0.32 + ptr.x * 0.1;
    const el = 0.62 - ptr.y * 0.05;
    lookAt.set(dims.cx + 0.75, 0.1, dims.cz + 0.5);
    camera.position.set(lookAt.x + Math.sin(az) * Math.cos(el) * camDist, lookAt.y + Math.sin(el) * camDist, lookAt.z + Math.cos(az) * Math.cos(el) * camDist);
    camera.lookAt(lookAt);
  };

  const approach = (a: number, b: number, rate: number, dt: number) => {
    const n = a + (b - a) * Math.min(1, dt * rate);
    return Math.abs(b - n) < 0.001 ? b : n;
  };

  const step = (dt: number) => {
    elapsed += dt;
    U.uTime.value = elapsed;
    const before = { ...cur };
    cur.size = approach(cur.size, target.size, 5, dt);
    cur.mow = target.mowing ? Math.min(1, cur.mow + dt / 1.6) : approach(cur.mow, 0, 3, dt);
    cur.edge = target.edging ? Math.min(1, cur.edge + dt / 1.1) : approach(cur.edge, 0, 4, dt);
    cur.fert = approach(cur.fert, target.fertilization ? 1 : 0, 2.5, dt);
    cur.weeds = target.weeds ? Math.min(1, cur.weeds + dt / 0.9) : approach(cur.weeds, 0, 3, dt);
    cur.hedge = target.hedges ? Math.min(1, cur.hedge + dt / 1.2) : approach(cur.hedge, 0, 3, dt);
    cur.cut = approach(cur.cut, target.weekly ? 0.045 : 0.07, 3, dt);
    const changed = (Object.keys(cur) as (keyof typeof cur)[]).some((k) => cur[k] !== before[k]);
    if (changed || needs) {
      dims = layout();
      U.uMow.value = cur.mow;
      U.uFert.value = cur.fert;
      U.uCut.value = cur.cut;
      placeHedges();
      placeEdges();
      placeWeeds();
    }
    placeGranules(elapsed);
    // the mower works its lanes while mowing is on, and parks off the lawn when it isn't
    mower.group.visible = cur.mow > 0.02;
    if (target.mowing) {
      const p = mowerPath();
      if (turn > 0) {
        turn = Math.max(0, turn - dt / 0.9);
        if (turn === 0) mowDir = -mowDir;
      } else {
        mowU += (mowDir * dt * 0.75) / p.total;
        if (mowU >= 1 || mowU <= 0) {
          mowU = clamp01(mowU);
          turn = 1;
        }
      }
      const at = mowerAt(mowU);
      const heading = at.heading + (mowDir < 0 ? Math.PI : 0) + (turn > 0 ? (1 - turn) * Math.PI : 0);
      const prev = mower.group.position.clone();
      mower.group.position.set(at.x, 0, at.z);
      mower.group.rotation.y = heading;
      mower.update(prev.distanceTo(mower.group.position) / 0.66, elapsed);
    }
    const anim = changed || target.mowing || Math.abs(ptr.tx - ptr.x) > 0.001 || Math.abs(ptr.ty - ptr.y) > 0.001 || Math.abs(fitDist() - camDist) > 0.01 || elapsed - fertT < 2;
    return anim;
  };

  const watch = frameWatch(() => opts.onSlow?.());

  const tick = (now: number) => {
    raf = 0;
    if (disposed || !visible || document.hidden) return watch.pause();
    watch.frame(now);
    clock.update();
    const dt = Math.min(0.05, clock.getDelta());
    const anim = step(dt);
    updateCamera(dt);
    if (anim || needs > 0) {
      renderer.render(scene, camera);
      needs = Math.max(0, needs - 1);
    }
    raf = requestAnimationFrame(tick);
  };
  const start = () => {
    if (!raf && visible && !disposed && ready) {
      clock.reset();
      watch.pause();
      raf = requestAnimationFrame(tick);
    }
  };
  const onVis = () => (document.hidden ? watch.pause() : start());
  document.addEventListener("visibilitychange", onVis);

  resize();
  camDist = fitDist();
  step(0);
  updateCamera(1);
  let ready = false;
  const warm = warmUp(renderer, scene, camera, () => renderer.render(scene, camera)).then(() => {
    if (disposed) return;
    ready = true;
    needs = 2;
    start();
  });

  // depth-only stand-in used when a layer is drawn on its own
  const occluder = M(new THREE.MeshBasicMaterial({ colorWrite: false }));
  const shadowOnly = M(new THREE.ShadowMaterial({ opacity: 0.3 }));

  return {
    set(s) {
      if (s.fertilization && !target.fertilization) fertT = elapsed;
      Object.assign(target, s);
      needs = 2;
      start();
    },
    setPointer(nx, ny) {
      ptr.tx = nx;
      ptr.ty = ny;
      start();
    },
    clearPointer() {
      ptr.tx = 0;
      ptr.ty = 0;
    },
    setScroll(p) {
      if (Math.abs(p - scroll) > 0.0005) {
        scroll = p;
        needs = 1;
      }
    },
    setVisible(v) {
      visible = v;
      if (v) start();
    },
    resize,
    ready: warm,
    renderLayer(layer) {
      cancelAnimationFrame(raf);
      raf = 0;
      visible = false;
      // settle every transition at the builder's default state
      Object.assign(cur, { size: target.size, mow: 1, edge: 1, fert: 1, weeds: 0, hedge: 0, cut: 0.045 });
      fertT = -10;
      dims = layout();
      U.uFert.value = 1;
      U.uCut.value = cur.cut;
      // each layer shows its own state, whatever the defaults
      cur.mow = layer === "base" ? 0 : 1;
      cur.edge = layer === "edgeRagged" ? 0 : 1;
      cur.weeds = layer === "weeds" ? 0 : 1;
      cur.hedge = layer === "hedgeClipped" ? 1 : 0;
      U.uMow.value = cur.mow;
      U.uFert.value = layer === "base" ? 0 : 1;
      placeHedges();
      placeEdges();
      placeWeeds();
      placeGranules(100);
      const at = mowerAt(0.42);
      mower.group.position.set(at.x, 0, at.z);
      mower.group.rotation.y = at.heading;
      mower.group.visible = true;
      scroll = 0.5;
      ptr.x = ptr.y = ptr.tx = ptr.ty = 0;
      camDist = fitDist();
      updateCamera(1);

      const own = (o: THREE.Object3D) => {
        for (let p: THREE.Object3D | null = o; p; p = p.parent) if (layerOf.has(p)) return layerOf.get(p)!;
        return null;
      };
      const saved: { m: THREE.Mesh; mat: THREE.Material | THREE.Material[]; vis: boolean; cast: boolean }[] = [];
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        saved.push({ m, mat: m.material, vis: m.visible, cast: m.castShadow });
        const l = own(m);
        // the stones sit on the lawn, so the mown lawn layer draws them too
        const mine = l === layer || (layer === "base" && (m === lawnPlane || m === grass)) || (layer === "mow" && stoneMeshes.has(m));
        const solid = l === "base" || m === lawnPlane || m === grass;
        if (mine) return;
        if (m === catcher) {
          m.visible = layer === "base";
          return;
        }
        if (solid) {
          m.material = occluder;
          // lawn and blades occlude, and the house and trees still throw their shadows on the lawn
          m.castShadow = layer === "mow" ? m.castShadow : false;
        } else m.visible = false;
      });
      // the hedges' own shadows land on an invisible catcher in their layer
      const hedgeLayer = layer === "hedgeWild" || layer === "hedgeClipped";
      if (hedgeLayer) {
        catcher.visible = true;
        catcher.material = shadowOnly;
        catcher.position.y = 0.032;
      }
      if (layer === "base") {
        mower.group.visible = false;
        U.uMow.value = 0;
      }
      renderer.render(scene, camera);
      for (const s of saved) {
        s.m.material = s.mat;
        s.m.visible = s.vis;
        s.m.castShadow = s.cast;
      }
      catcher.position.y = -0.58;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      mower.dispose();
      geos.forEach((g) => g.dispose());
      bladeGeo.dispose();
      mats.forEach((m) => m.dispose());
      renderer.dispose();
    },
  };
}
