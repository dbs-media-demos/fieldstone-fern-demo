// Bundled by render.mjs (esbuild) into a standalone page that runs the site's own hero lawn scene,
// patched (in the bundle only) to hold the camera and the sun still and to expose its parts.
import { createHeroLawn } from "../../src/components/fx/lawn3d/HeroLawnScene.ts";

const W = 1800;
const H = 600;
const canvas = document.querySelector("canvas");
canvas.style.width = `${W}px`;
canvas.style.height = `${H}px`;

const grab = () => canvas.toDataURL("image/png");

createHeroLawn(canvas, { onReady: () => (window.__ready = true) }).then((lawn) => {
  const x = lawn._x;
  const project = (wx, wy, wz) => {
    const v = new x.THREE.Vector3(wx, wy, wz).project(x.camera);
    return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H];
  };
  const hideMower = () => {
    x.mower.group.visible = false;
    x.clips.visible = false;
  };
  const showAll = () => {
    x.mower.group.visible = true;
    x.clips.visible = true;
    x.grassMat.colorWrite = true;
    x.ground.visible = true;
  };

  window.__lawn = {
    /** The lawn with lanes cut up to `s` (-0.14 = none of the three), no mower, no clippings. */
    plate(s) {
      showAll();
      x.lawn.still(s);
      hideMower();
      x.render();
      return grab();
    },
    /** The mower alone in lane k, the grass in front of it hiding its wheels (depth only), `frames` steps of wheel turn. */
    mower(k, frames, step) {
      showAll();
      x.lawn.still(k + 0.5);
      x.clips.visible = false;
      x.ground.visible = false;
      x.grassMat.colorWrite = false;
      const out = [];
      for (let i = 0; i < frames; i++) {
        x.mower.update(step, 20, 0);
        x.render();
        out.push(grab());
      }
      const g = x.mower.group.position;
      const chute = x.mower.chute.clone();
      x.mower.group.localToWorld(chute);
      showAll();
      return { frames: out, at: [g.x, g.z], anchor: project(g.x, 0, g.z), chute: [chute.x, chute.y, chute.z] };
    },
    /** Everything the 2D lawn needs to place things: the camera as one matrix (world → plate pixels), lanes. */
    meta() {
      x.camera.updateMatrixWorld();
      const m = new x.THREE.Matrix4().multiplyMatrices(x.camera.projectionMatrix, x.camera.matrixWorldInverse);
      return {
        w: W,
        h: H,
        clip: Array.from(m.elements),
        lanes: [0, 1, 2].map((k) => ({ z: x.laneZ(k), x0: x.laneX0[k], x1: x.laneX1[k] })),
        laneW: 1.4,
        za: -2.6,
      };
    },
  };
});
