# 更新日志

本项目（前端工程基座）独立于任何业务项目仓库，用 tag 标记版本。
新项目生成时记录所用版本；升级时按本文件手动合并需要的部分。

## v0.1.0 — 2026-11-12

首个版本，来自「云栖木作」官网项目的复盘沉淀。

**基座（template/）**

- Next.js 16 App Router 最小骨架：`layout` / `page` / `robots` / `sitemap` / `icon`
- 设计系统三层：`app/styles/tokens.css`（唯一允许写死设计值）+ `base.css` + 组件 `.module.css`
- 事实单一来源：`data/site.mjs`；SEO 与 JSON-LD 由 `lib/seo.mjs` 派生
- 原生 `<dialog>` 弹窗封装：焦点圈闭 / 背景 inert / Esc / 滚动锁 / 关闭还焦点
- `components/sections` 与 `components/ui` 的目录约定
- 占位素材：`og.png`、`logo.png`、`app/icon.png`

**护栏**

- ESLint 9 flat config（`eslint-config-next/core-web-vitals`）：拦裸 `<img>`、hook 依赖等
- stylelint：禁 hex 字面量（tokens 例外）、禁 `!important`（base 例外）、z-index 只能用 `var(--z-*)`
- `scripts/check-facts.mjs`：电话硬编码、TODO/XXXX 占位符（prebuild 自动跑）
- `scripts/check-assets.mjs`：public 体积预算、单文件上限、引用资源是否存在
- `tests/content.test.mjs`：site 必填、URL 规范、FAQ 唯一、metadata 完整、JSON-LD 与 site 同源
- GitHub Actions：lint → stylelint → test → check:facts → check:assets → build

**文档**

- `docs/复盘教训-20条.md`：现象 → 规则 → 兜底方式
- `checklists/开工前30分钟.md`
- `checklists/上线前验收.md`

**工具**

- `scripts/new-site.mjs`：复制 template 生成新项目

**已知限制**

- 未包含 E2E / 视觉回归；复杂滚动与动画机制未内置，按项目另建并遵守「全局机制唯一入口」
- `npm run check` 需要在真实环境 `npm install` 后运行（本版本未附 lock 文件）
