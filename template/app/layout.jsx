import "./globals.css";
import { buildMetadata } from "../lib/seo.mjs";

// metadata 由 data/site.mjs 派生：canonical、OG、Twitter 一次配齐。
export const metadata = buildMetadata();

// 移动端 viewport 也在这里导出（Next 的约定：viewport 不能单独放文件）。
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
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
