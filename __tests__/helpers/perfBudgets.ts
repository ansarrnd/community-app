/**
 * Render-time budgets for critical UI paths (Jest + mocked native modules).
 * These guard against accidental render-tree regressions in CI — not device FPS.
 */
export const PERF_BUDGETS = {
  exploreMountMs: 500,
  eventList50ItemsMs: 2000,
};
