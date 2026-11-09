import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * A ride-on lawn tractor built from primitives (no model file): terracotta clear-coated paint,
 * rubber tyres with lugs, a charcoal cutting deck with a side chute, and a crew member in the
 * seat. Faces +x, sits on y = 0, about 1.8 m long. Shared by the hero lawn and the yard builder.
 */
export type Mower = {
  group: THREE.Group;
  /** Local position of the side-discharge chute mouth (the +z side). */
  chute: THREE.Vector3;
  /** Spin the wheels by `dist` metres travelled; `t` drives the idle shake. */
  update: (dist: number, t: number, steer?: number) => void;
  dispose: () => void;
};

const PAINT = "#a3472c";

export function createMower({ driver = true }: { driver?: boolean } = {}): Mower {
  const group = new THREE.Group();
  const body = new THREE.Group(); // everything sprung (shakes a little at idle)
  group.add(body);
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const g = <T extends THREE.BufferGeometry>(x: T) => (geos.push(x), x);
  const m = <T extends THREE.Material>(x: T) => (mats.push(x), x);

  const paint = m(new THREE.MeshPhysicalMaterial({ color: PAINT, roughness: 0.34, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.14 }));
  const charcoal = m(new THREE.MeshStandardMaterial({ color: "#20272a", roughness: 0.5, metalness: 0.55 }));
  const rubber = m(new THREE.MeshStandardMaterial({ color: "#151817", roughness: 0.9 }));
  const rim = m(new THREE.MeshStandardMaterial({ color: "#e6dcc6", roughness: 0.35, metalness: 0.25 }));
  const seatMat = m(new THREE.MeshStandardMaterial({ color: "#1c201e", roughness: 0.62 }));
  const cream = m(new THREE.MeshStandardMaterial({ color: "#efe6d2", roughness: 0.45 }));
  const lamp = m(new THREE.MeshStandardMaterial({ color: "#fff4d6", emissive: "#ffe2a0", emissiveIntensity: 1.6, roughness: 0.2 }));

  const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const rbox = (w: number, h: number, d: number, r: number) => g(new RoundedBoxGeometry(w, h, d, 4, r));

  // Cutting deck + chute (unsprung, close to the grass)
  add(group, rbox(0.98, 0.11, 1.08, 0.05), charcoal, 0.02, 0.13, 0);
  add(group, rbox(0.34, 0.09, 0.24, 0.035), charcoal, 0.06, 0.12, 0.62, 0, -0.35, -0.1);
  // frame rails
  add(body, rbox(1.32, 0.08, 0.56, 0.03), charcoal, 0.08, 0.27, 0);

  // Rear tub over the big wheels, with fenders
  add(body, rbox(0.7, 0.08, 0.74, 0.04), paint, -0.44, 0.6, 0);
  // curved fenders arching over the big wheels
  const fender = g(new THREE.CylinderGeometry(0.345, 0.345, 0.25, 40, 1, true, Math.PI * 0.5, Math.PI * 0.92));
  fender.rotateX(Math.PI / 2);
  const fenderMat = m(paint.clone());
  fenderMat.side = THREE.DoubleSide;
  for (const s of [-1, 1]) add(body, fender, fenderMat, -0.42, 0.29, s * 0.43, 0, 0, 0);
  add(body, rbox(0.7, 0.03, 0.26, 0.012), charcoal, 0.12, 0.31, 0.0); // footboard
  // Hood: engine housing that tapers to the grille
  add(body, rbox(0.8, 0.34, 0.58, 0.14), paint, 0.42, 0.49, 0, 0, 0, -0.09);
  add(body, rbox(0.22, 0.3, 0.52, 0.07), paint, 0.06, 0.6, 0);
  // grille + lamps
  add(body, rbox(0.04, 0.2, 0.36, 0.015), charcoal, 0.775, 0.47, 0, 0, 0, -0.1);
  for (const s of [-1, 1]) add(body, g(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 20)), lamp, 0.77, 0.6, s * 0.17, 0, 0, Math.PI / 2 - 0.1);
  // a cream pinstripe along the hood
  for (const s of [-1, 1]) add(body, g(new THREE.BoxGeometry(0.6, 0.018, 0.004)), cream, 0.4, 0.55, s * 0.281, 0, 0, -0.1);

  // Seat + backrest
  add(body, rbox(0.4, 0.09, 0.44, 0.04), seatMat, -0.46, 0.7, 0);
  add(body, rbox(0.09, 0.34, 0.42, 0.04), seatMat, -0.67, 0.86, 0, 0, 0, 0.22);

  // Steering column + wheel
  add(body, g(new THREE.CylinderGeometry(0.022, 0.026, 0.42, 12)), charcoal, 0.02, 0.84, 0, 0, 0, 0.42);
  const column = new THREE.Group(); // tilted like the column; the wheel turns about it
  column.position.set(-0.066, 1.03, 0);
  column.rotation.z = 0.42;
  body.add(column);
  const wheelPivot = new THREE.Group();
  column.add(wheelPivot);
  add(wheelPivot, g(new THREE.TorusGeometry(0.15, 0.018, 10, 36)), seatMat, 0, 0, 0, Math.PI / 2);
  add(wheelPivot, g(new THREE.BoxGeometry(0.28, 0.014, 0.03)), seatMat, 0, 0, 0);

  // Tyres: lathe profile with rounded shoulders, lugs around the big ones
  const tyre = (r: number, w: number) => {
    const pts: THREE.Vector2[] = [];
    const inner = r * 0.62;
    pts.push(new THREE.Vector2(inner, -w / 2));
    for (let i = 0; i <= 8; i++) {
      const a = -Math.PI / 2 + (i / 8) * (Math.PI / 2);
      pts.push(new THREE.Vector2(r - w * 0.18 + Math.cos(a) * w * 0.18, -w / 2 + w * 0.18 + Math.sin(a) * w * 0.18));
    }
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * (Math.PI / 2);
      pts.push(new THREE.Vector2(r - w * 0.18 + Math.cos(a) * w * 0.18, w / 2 - w * 0.18 + Math.sin(a) * w * 0.18));
    }
    pts.push(new THREE.Vector2(inner, w / 2));
    const geo = g(new THREE.LatheGeometry(pts, 40));
    geo.rotateX(Math.PI / 2);
    return geo;
  };
  const wheels: { pivot: THREE.Group; spin: THREE.Group; r: number; front: boolean }[] = [];
  const makeWheel = (r: number, w: number, x: number, z: number, front: boolean, lugs: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, r, z);
    group.add(pivot);
    const spin = new THREE.Group();
    pivot.add(spin);
    add(spin, tyre(r, w), rubber, 0, 0, 0);
    const hub = add(spin, g(new THREE.CylinderGeometry(r * 0.6, r * 0.6, w * 0.72, 28)), rim, 0, 0, 0, Math.PI / 2);
    hub.castShadow = false;
    add(spin, g(new THREE.CylinderGeometry(r * 0.3, r * 0.34, w * 0.76, 20)), rim, 0, 0, 0, Math.PI / 2);
    add(spin, g(new THREE.CylinderGeometry(r * 0.11, r * 0.11, w * 0.78, 12)), charcoal, 0, 0, 0, Math.PI / 2);
    if (lugs) {
      const lugGeo = g(new THREE.BoxGeometry(r * 0.16, r * 0.1, w * 0.86));
      for (let i = 0; i < lugs; i++) {
        const a = (i / lugs) * Math.PI * 2;
        const lug = new THREE.Mesh(lugGeo, rubber);
        lug.position.set(Math.cos(a) * (r - 0.004), Math.sin(a) * (r - 0.004), 0);
        lug.rotation.z = a;
        lug.castShadow = true;
        spin.add(lug);
      }
    }
    wheels.push({ pivot, spin, r, front });
  };
  for (const s of [-1, 1]) makeWheel(0.29, 0.21, -0.42, s * 0.42, false, 22);
  for (const s of [-1, 1]) makeWheel(0.17, 0.13, 0.58, s * 0.36, true, 0);

  // The crew member: architectural-model figure, forest polo, sand trousers, cap
  if (driver) {
    const polo = m(new THREE.MeshStandardMaterial({ color: "#2f4a34", roughness: 0.8 }));
    const trousers = m(new THREE.MeshStandardMaterial({ color: "#b7a888", roughness: 0.85 }));
    const skin = m(new THREE.MeshStandardMaterial({ color: "#c79a76", roughness: 0.6 }));
    const cap = m(new THREE.MeshStandardMaterial({ color: "#16241c", roughness: 0.7 }));
    const person = new THREE.Group();
    person.position.set(-0.47, 0.75, 0); // on the seat cushion
    body.add(person);
    const up = new THREE.Vector3(0, 1, 0);
    // a rounded limb from joint a to joint b (person coordinates)
    const limb = (a: number[], b: number[], r: number, mat: THREE.Material) => {
      const A = new THREE.Vector3(...a);
      const d = new THREE.Vector3(...b).sub(A);
      const mesh = add(person, g(new THREE.CapsuleGeometry(r, Math.max(0.01, d.length()), 6, 14)), mat, 0, 0, 0);
      mesh.position.copy(A).addScaledVector(d, 0.5);
      mesh.quaternion.setFromUnitVectors(up, d.normalize());
    };
    // the steering wheel rim sits at about (0.4, 0.29) here
    for (const s of [-1, 1]) {
      limb([0.0, 0.07, s * 0.1], [0.3, 0.1, s * 0.13], 0.066, trousers); // thigh
      limb([0.3, 0.1, s * 0.13], [0.4, -0.3, s * 0.14], 0.056, trousers); // shin
      add(person, rbox(0.18, 0.06, 0.09, 0.025), cap, 0.45, -0.36, s * 0.14);
      limb([-0.02, 0.43, s * 0.17], [0.13, 0.25, s * 0.2], 0.05, polo); // upper arm
      limb([0.13, 0.25, s * 0.2], [0.34, 0.31, s * 0.12], 0.04, skin); // forearm
    }
    limb([-0.05, 0.12, 0], [-0.03, 0.38, 0], 0.15, polo); // torso
    add(person, g(new THREE.CylinderGeometry(0.045, 0.05, 0.09, 14)), skin, -0.02, 0.53, 0);
    add(person, g(new THREE.SphereGeometry(0.1, 24, 18)), skin, -0.01, 0.64, 0);
    const capTop = add(person, g(new THREE.SphereGeometry(0.106, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2)), cap, -0.015, 0.66, 0);
    capTop.scale.set(1, 0.85, 1);
    add(person, rbox(0.13, 0.016, 0.17, 0.008), cap, 0.09, 0.665, 0, 0, 0, -0.12);
  }

  const chute = new THREE.Vector3(0.12, 0.14, 0.76);
  let spun = 0;

  return {
    group,
    chute,
    update(dist, t, steer = 0) {
      spun += dist;
      for (const w of wheels) {
        w.spin.rotation.z = -spun / w.r;
        if (w.front) w.pivot.rotation.y = steer;
      }
      // engine idle: a fine, fast shake on the sprung body
      body.position.y = Math.sin(t * 47) * 0.0025 + Math.sin(t * 31) * 0.0015;
      body.rotation.x = Math.sin(t * 23) * 0.002;
      wheelPivot.rotation.y = steer * 1.4;
    },
    dispose() {
      geos.forEach((x) => x.dispose());
      mats.forEach((x) => x.dispose());
    },
  };
}
