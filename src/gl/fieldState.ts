/**
 * Shared, mutable state the ambient field reads every frame.
 *
 * Kept in its own module (not in AmbientField.tsx) so the WebGL code and OGL
 * can load as a separate chunk after first paint, while the page, the loader
 * and the cat write to this without pulling the renderer into the main bundle.
 * Nothing here goes through React state.
 */
export const fieldState = {
  /** 0 = top of page / chaos, 1 = bottom / resolved. */
  order: 0,
  /** Normalised scroll velocity, roughly -1..1. */
  velocity: 0,
  /** Pointer in 0..1 viewport space. */
  mouse: [0.5, 0.5] as [number, number],
  /** Lets the preloader and route transitions dim the field. */
  intensity: 1,
  /** False until the opening sequence hands over. */
  introDone: false,
};
