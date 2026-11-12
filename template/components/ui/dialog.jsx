"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./dialog.module.css";

// 统一弹窗：用浏览器原生 <dialog> 的 showModal()。
// 原生能力已经免费提供：焦点留在弹窗内、背景不可交互、Esc 关闭、顶层渲染。
// 我们只补两件原生不管的事：页面滚动锁（引用计数，支持多层）和关闭后还焦点。
let openCount = 0;

function lockScroll() {
  openCount += 1;
  if (openCount === 1) document.documentElement.style.overflow = "hidden";
}

function unlockScroll() {
  openCount = Math.max(0, openCount - 1);
  if (openCount === 0) document.documentElement.style.overflow = "";
}

export default function Dialog({ open = false, onClose, title, children }) {
  const dialogRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const lockedRef = useRef(false);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      restoreFocusRef.current = document.activeElement;
      lockScroll();
      lockedRef.current = true;
      dialog.showModal();
      return;
    }

    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const handleClose = () => {
      if (lockedRef.current) {
        lockedRef.current = false;
        unlockScroll();
      }
      onClose?.();
      const target = restoreFocusRef.current;
      if (target?.isConnected) requestAnimationFrame(() => target.focus());
    };

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  // 组件在打开状态下被卸载时，别把滚动锁漏在页面上。
  useEffect(
    () => () => {
      if (lockedRef.current) {
        lockedRef.current = false;
        unlockScroll();
      }
    },
    [],
  );

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.close}
            aria-label="关闭"
            onClick={() => dialogRef.current?.close()}
          >
            ×
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </dialog>
  );
}
