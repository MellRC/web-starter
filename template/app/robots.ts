import type { MetadataRoute } from "next";

import { site } from "../data/site";

// /robots.txt：由 Next 在构建时生成。sitemap 地址与域名只从 data/site.ts 取。
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: new URL("/sitemap.xml", site.url).toString(),
    host: new URL(site.url).host,
  };
}
