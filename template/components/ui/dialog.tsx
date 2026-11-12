"use client";

import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";

import { useOverlayLayer } from "../../lib/overlay";
import styles from "./dialog.module.css";

// 统一弹窗：用浏览器原生 <dialog> 的 showModal()。
// 原生能力已经免费提供：焦点留在弹窗内、背景不可交互、Esc 关闭、顶层渲染。
// 这里只补两件原生不管的事：页面滚动锁（lib/overlay）和关闭后还焦点。
export type DialogProps = {
  open?: boolean;
  title: string;
  onClose?: () => void;
  children: ReactNode;
};

export default function Dialog({ open = false, title, onClose, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useOverlayLayer(open);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      restoreFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      return;
    }

    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const handleClose = () => {
      onClose?.();
      const target = restoreFocusRef.current;
      if (target?.isConnected) requestAnimationFrame(() => target.focus());
    };

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClick={handleBackdropClick}
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
