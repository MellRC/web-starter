/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  // 图片交给 next/image 输出 AVIF/WebP；原始 JPG 只作为兜底。
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // 正式域名只在 data/site.mjs 里出现一次，这里不用再写。
};

export default nextConfig;
