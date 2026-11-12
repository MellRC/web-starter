import { site } from "../data/site.mjs";

// /robots.txt：由 Next 在构建时生成。sitemap 地址与域名只从 data/site.mjs 取。
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: new URL("/sitemap.xml", site.url).toString(),
    host: new URL(site.url).host,
  };
}
