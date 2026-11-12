"use client";

import { useState } from "react";
import Dialog from "./dialog";
import styles from "./contact-button.module.css";

// 只有"需要交互"的这一小块是客户端组件；页面其余部分保持服务端渲染。
export default function ContactButton({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.button}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="预约咨询">
        <p>
          表单接入前，这里只展示可核实的联系方式：电话与门店地址。提交类表单需要先确认字段、保存位置、
          通知对象与隐私处理，再上线。
        </p>
      </Dialog>
    </>
  );
}
