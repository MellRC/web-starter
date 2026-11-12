"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { prefersReducedMotion } from "../../lib/motion";
import styles from "./reveal.module.css";

// 入场动画的唯一实现：只用 IntersectionObserver + CSS 过渡，不引入动画库。
// 关键约束：SSR 出来的 HTML 默认可见；只有 JS 运行后、且元素在首屏之外时才隐藏再揭示。
// 这样抓取器/无 JS 用户永远能看到内容（上次项目用全局类名先设 opacity:0 的教训）。
export type RevealProps = {
  children: ReactNode;
  className?: string;
};

export default function Reveal({ children, className }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      element.dataset.revealed = "true";
      return;
    }

    // 首屏内的元素直接显示，避免进页面第一眼闪一下。
    if (element.getBoundingClientRect().top < window.innerHeight * 0.9) {
      element.dataset.revealed = "true";
      return;
    }

    element.dataset.armed = "true";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          element.dataset.revealed = "true";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className ? `${styles.reveal} ${className}` : styles.reveal}>
      {children}
    </div>
  );
}
