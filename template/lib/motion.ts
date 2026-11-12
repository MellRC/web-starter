// 动效 token 与"减少动态效果"判断：全站唯一来源。
// 原则：时长/缓动只从这里取；组件不自己写 420ms 这类魔数。
export const DURATION = {
  fast: 150,
  base: 250,
  slow: 450,
} as const;

export const EASING = {
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export { REDUCED_MOTION_QUERY };
