# public/ 说明

- 这里放**原样发布**的静态资源：图片、字体、favicon、OG 图。
- 目录结构即线上路径：`public/media/a.webp` → `/media/a.webp`。
- 体积预算由 `scripts/check-assets.mjs` 在 `npm run build` 前检查：
  - 单张图片 ≤ 400 KB
  - 单个视频 ≤ 4 MB
  - `public/` 总量 ≤ 60 MB
- 原图（PSD/相机直出/未压缩 JPG）不要放这里，放项目物料目录或网盘；
  这里只放已经压过、且页面真正引用的文件。
