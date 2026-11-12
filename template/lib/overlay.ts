"use client";

import { useEffect } from "react";

// 覆盖层（弹窗、全屏菜单）的唯一滚动锁 + 状态登记处。
// 规则：任何组件都不许自己写 document.body.style.overflow，统一用 useOverlayLayer。
let openCount = 0;
const listeners = new Set<(open: boolean) => void>();

function apply(): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.overflow = openCount > 0 ? "hidden" : "";
  const open = openCount > 0;
  for (const listener of listeners) listener(open);
}

export function isOverlayOpen(): boolean {
  return openCount > 0;
}

export function subscribeOverlay(listener: (open: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// 打开时加一层锁，关闭/卸载时释放；多层叠加由计数保证不会互相解掉。
export function useOverlayLayer(open: boolean): void {
  useEffect(() => {
    if (!open) return undefined;
    openCount += 1;
    apply();
    return () => {
      openCount = Math.max(0, openCount - 1);
      apply();
    };
  }, [open]);
}
