import * as THREE from "three";

/**
 * What every scene here shares so it never stutters, even on a weak laptop (loaded behind the 3D gate):
 * a renderer only on a real GPU, a warm-up that compiles every shader and draws one frame while the
 * canvas is still invisible, and a watchdog over the first seconds of live frames.
 */

export const MAX_DPR = 1.5;

const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i;

/** A WebGL renderer on a proper graphics chip, or a throw (no WebGL, a major performance caveat, software rendering). */
export function gpuRenderer(canvas: HTMLCanvasElement, params: THREE.WebGLRendererParameters = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, ...params, powerPreference: "high-performance", failIfMajorPerformanceCaveat: true });
  const gl = renderer.getContext();
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "");
  if (SOFTWARE.test(name)) {
    renderer.dispose();
    throw new Error(`software renderer: ${name}`);
  }
  return renderer;
}

/** Hand the main thread back for a moment, so building a scene is many short tasks, not one long one. */
export const breathe = () =>
  new Promise<void>((r) => {
    const sch = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
    if (sch?.yield) void sch.yield().then(r);
    else setTimeout(r, 0);
  });

const nextFrame = () => new Promise<number>((r) => requestAnimationFrame(r));

/**
 * Compile every program off the main thread where the driver allows it, then draw one frame (which
 * also builds the shadow programs and uploads the buffers) while nobody can see the canvas, and let
 * the GPU finish it. After this the first visible frame costs what any other frame does.
 */
export async function warmUp(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, draw: () => void) {
  await breathe();
  await renderer.compileAsync(scene, camera).catch(() => {});
  await nextFrame();
  draw();
  await nextFrame();
  await nextFrame();
}

/**
 * Watches the first `span` ms of live frames (skipping a short warm-up). Below `minFps` on average,
 * or a 3rd frame over `maxFrame` ms (or one over 4x that), it calls `onSlow` once. Gaps while the loop
 * is paused (off screen, tab hidden) are not counted: call `pause()` when the loop stops.
 * The warm-up frames pay one-off costs (the GPU's first real draw: 371 ms on a refresh of a PC that
 * then ran 112 fps, 18 Nov), and a hitch or two (a font, an image decode) isn't a slow computer.
 */
export function frameWatch(onSlow: () => void, { span = 2000, minFps = 45, maxFrame = 100, skip = 5 } = {}) {
  let last = 0;
  let seen = 0;
  let total = 0;
  let count = 0;
  let hitches = 0;
  let done = false;
  let resolve = () => {};
  const settled = new Promise<void>((r) => (resolve = r));
  const finish = (slow: boolean) => {
    done = true;
    resolve();
    if (slow) onSlow();
  };
  return {
    settled,
    get done() {
      return done;
    },
    frame(now: number) {
      if (done) return;
      if (last) {
        const dt = now - last;
        if (++seen > skip) {
          total += dt;
          count++;
          if (dt > maxFrame && (++hitches >= 3 || dt > maxFrame * 4)) return finish(true);
          if (total >= span) return finish(1000 / (total / count) < minFps);
        }
      }
      last = now;
    },
    pause() {
      last = 0;
    },
  };
}
