# public/ 说明

- 这里放**原样发布**的静态资源：图片、字体、favicon、OG 图。
- 目录结构即线上路径：`public/media/a.webp` → `/media/a.webp`。
- **图片不要手工塞进来**：原图放 `media/raw/`，跑 `npm run media` 生成
  `public/media/w320|w768|w1600/*.webp|avif`，以及 `data/media-manifest.json`。
- 体积预算由 `scripts/check-assets.mjs` 在 `npm run build` 前检查：
  - 单张图片 ≤ 400 KB
  - 单个视频 ≤ 4 MB
  - `public/` 总量 ≤ 60 MB
- 原图（PSD/相机直出/未压缩 JPG）不要进 `public/`；`media/raw/` 已被 `.gitignore` 忽略。
