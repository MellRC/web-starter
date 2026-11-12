# 更新日志

本项目（前端工程基座）独立于任何业务项目仓库，用 tag 标记版本。
新项目生成时记录所用版本；升级时按本文件手动合并需要的部分。

## v0.3.0 — 2026-11-12

补齐三项之前明确缺失的基础设施：TypeScript、动效/滚动统一入口、图片压缩流水线。

**TypeScript**

- 模板全量迁移到 `.ts / .tsx`：`data/site.ts`、`data/faq.ts`、`lib/seo.ts`、组件 props 全部有类型
- `tsconfig.json` 开启 `strict`；`next-env.d.ts` 一并提交
- `npm run typecheck`（`tsc --noEmit`），并接入 `check` 链与 CI
- 测试改为 `node --import tsx --test tests/content.test.ts`

**动效 / 滚动统一入口（不引入动画库）**

- `lib/motion.ts`：时长、缓动 token + `prefersReducedMotion()`
- `lib/use-reduced-motion.ts`：订阅式 `useReducedMotion()`
- `lib/overlay.ts`：覆盖层化妆数 + 页面滚动锁的唯一实现（弹窗、全屏菜单都必须用它）
- `lib/anchor.ts`：锚点滚动唯一实现（sticky 补偿 + history + reduced-motion）
- `components/ui/reveal.tsx`：入场动画唯一实现；SSR 内容默认可见，JS 只做增强

**图片流水线**

- `scripts/optimize-images.mjs`：`media/raw/` 原图 → `public/media/w{320,768,1600}/*.webp|avif`，并生成 `data/media-manifest.json`
- `npm run media` 手动触发；`media/raw/` 不进仓库（`.gitignore` 已配置）
- 体积预算仍由 `check-assets.mjs` 在 build 前检查

**其他**

- 依赖新增：`typescript`、`@types/*`、`tsx`、`sharp`
- 新增 `docs/审查维度清单.md`：12 个固定审查维度 + "发现必须三选一"规则，并把"依赖维度整体漏审"作为反例保留
- README / 开工清单同步更新；`next build` 后 Next 自动改写的 `tsconfig` 设置（`jsx: react-jsx`、`.next/dev/types`）已并入模板

## v0.2.0 — 2026-11-12

新增依赖与包管理器护栏（来自现有官网项目"同时装了 gsap 和 framer-motion、两套锁文件"的复盘）。

- 新增 `template/scripts/check-deps.mjs`：
  - 只允许一个锁文件 / 一个包管理器（npm / pnpm / yarn / bun 互斥，并校验 `packageManager` 字段是否一致）
  - 同一能力只允许一个库：动画（gsap / framer-motion / motion…）、图标、日期、状态管理、数据请求
  - 代码里 import 了但没声明的包 → 报错；声明了但没被 import 的包 → 警告
  - 支持 `--root <目录>` 审计任意现有项目
  - 迁移期可用 `package.json` 的 `checkDeps.allow` 临时放行指定包
- `package.json` 新增 `check:deps`，并接入 `check` 链与 `prebuild`
- CI 增加 `npm run check:deps`
- 开工清单增加"同一能力只有一个库、只有一个锁文件"

## v0.1.0 — 2026-11-12

首个版本，来自「云栖木作」官网项目的复盘沉淀。

**基座（template/）**

- Next.js 16 App Router 最小骨架：`layout` / `page` / `robots` / `sitemap` / `icon`
- 设计系统三层：`app/styles/tokens.css`（唯一允许写死设计值）+ `base.css` + 组件 `.module.css`
- 事实单一来源：`data/site.ts`；SEO 与 JSON-LD 由 `lib/seo.ts` 派生
- 原生 `<dialog>` 弹窗封装：焦点圈闭 / 背景 inert / Esc / 滚动锁 / 关闭还焦点
- `components/sections` 与 `components/ui` 的目录约定
- 占位素材：`og.png`、`logo.png`、`app/icon.png`

**护栏**

- ESLint 9 flat config（`eslint-config-next/core-web-vitals`）：拦裸 `<img>`、hook 依赖等
- stylelint：禁 hex 字面量（tokens 例外）、禁 `!important`（base 例外）、z-index 只能用 `var(--z-*)`
- `scripts/check-facts.mjs`：电话硬编码、TODO/XXXX 占位符（prebuild 自动跑）
- `scripts/check-assets.mjs`：public 体积预算、单文件上限、引用资源是否存在
- `tests/content.test.ts`：site 必填、URL 规范、FAQ 唯一、metadata 完整、JSON-LD 与 site 同源
- GitHub Actions：lint → stylelint → test → check:facts → check:assets → build

**文档**

- `docs/复盘教训-20条.md`：现象 → 规则 → 兜底方式
- `checklists/开工前30分钟.md`
- `checklists/上线前验收.md`

**工具**

- `scripts/new-site.mjs`：复制 template 生成新项目

**已知限制**

- 未包含 E2E / 视觉回归
- `npm run check` 需要在真实环境 `npm install` 后运行（本版本未附 lock 文件）
