// 锚点滚动的唯一实现：全站所有"跳到某一段"都走这里。
// 处理了 sticky 元素定位、history 更新和减少动态效果；不要在组件里再抄一份。
import { prefersReducedMotion } from "./motion";

export function getAnchorTop(target: HTMLElement): number {
  const scrollY = window.scrollY;
  const previousPosition = target.style.position;
  const isSticky = window.getComputedStyle(target).position === "sticky";

  // sticky 元素的 rect.top 会随滚动变化，量之前先临时改成 static。
  if (isSticky) target.style.position = "static";
  const top = target.getBoundingClientRect().top + scrollY;
  if (isSticky) target.style.position = previousPosition;

  return top;
}

export function scrollToAnchor(href: string): boolean {
  if (!href.startsWith("#")) return false;
  const target = document.getElementById(href.slice(1));
  if (!target) return false;

  const top = getAnchorTop(target);
  if (window.location.hash !== href) window.history.pushState(null, "", href);

  const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
  requestAnimationFrame(() => window.scrollTo({ top, behavior }));
  return true;
}
