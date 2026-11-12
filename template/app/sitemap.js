import { site } from "../data/site.mjs";

// /sitemap.xml：单页站点也值得有，改版时便于一次性提交。
// 新增独立页面时，在这里追加一条，并确保页面有自己的 title/description。
export default function sitemap() {
  return [
    {
      url: new URL("/", site.url).toString(),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
