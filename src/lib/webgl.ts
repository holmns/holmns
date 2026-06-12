// Some browsers ship with WebGL disabled (e.g. Opera GX's GPU blocklist).
// THREE.WebGLRenderer throws in that case, and an uncaught error in a mount
// effect unmounts the entire React tree — so probe before constructing.
export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
