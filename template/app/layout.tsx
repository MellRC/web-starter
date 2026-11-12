import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { buildMetadata } from "../lib/seo";

// metadata 由 data/site.ts 派生：canonical、OG、Twitter 一次配齐。
export const metadata: Metadata = buildMetadata();

// 移动端 viewport 也在 layout 导出（Next 的约定：viewport 不能单独放文件）。
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <a className="skip-link" href="#main">
          跳到主要内容
        </a>
        {children}
      </body>
    </html>
  );
}
