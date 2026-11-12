# 前端工程基座

> 这是**跨项目**资产，独立于任何业务项目仓库，位置：`D:\Mellie仓库\基座\web-starter`。
> 用 tag 管理版本（当前 `v0.3.0`），新项目生成时记录所用版本。

把「云栖木作」官网项目的复盘结论，固化成一个**可以直接复制、开箱即用**的起点。
下次做前端网站时，从 `template/` 开始，而不是从空白文件夹开始。

## 三条铁规

1. **每类东西只有一个出口**：设计值在 `tokens.css`，事实在 `data/site.ts`，SEO 在 `lib/seo.ts`，页面级机制（滚动/弹窗/动效）只有一套实现。
2. **组件只接收数据，不读别处 DOM**：组件之间不靠类名、id、`querySelector` 互相约定。
3. **能交给平台的不自己写**：焦点圈闭、Esc 关闭、背景 inert 用原生 `<dialog>`；无障碍折叠用原生 `<details>`。

## 目录

```
web-starter/
  template/                       ← 可直接复制的最小 Next.js 16 + TS 基座
    app/                          ← 路由与外壳（layout / page / robots / sitemap / icon）
    components/sections/          ← 页面区块组件（服务端组件优先）
    components/ui/                ← 通用件（弹窗、按钮、标题、进场）
    data/                         ← 唯一事实来源：site.ts、faq.ts
    lib/                          ← 纯逻辑：seo / motion / overlay / anchor / use-reduced-motion
    scripts/                      ← 护栏脚本 + 图片流水线
    tests/                        ← 内容层回归测试（TS）
    media/raw/                    ← 原图入口（不进仓库）
    app/styles/tokens.css         ← 全站唯一允许写死设计值的地方
    tsconfig.json / next-env.d.ts ← TypeScript strict
    eslint / stylelint / prettier / GitHub Actions
  docs/复盘教训-20条.md            ← 这次踩的坑，逐条转成规则和护栏
  docs/审查维度清单.md             ← 12 个固定审查维度，防止"想到哪查到哪"
  checklists/开工前30分钟.md
  checklists/上线前验收.md
  scripts/new-site.mjs            ← 一条命令复制出一个新项目
  CHANGELOG.md                    ← 版本与变更记录
```

## 30 秒用法

```bash
# 在基座目录下执行
node scripts/new-site.mjs ../08-新站点
cd ../08-新站点
npm install
npm run check    # lint + stylelint + typecheck + test + 事实/资源/依赖检查
npm run dev

# 需要图片时
# 把原图放进 media/raw/，然后：
npm run media    # 生成 public/media/w320|w768|w1600/*.webp|avif + data/media-manifest.json
```

`npm run check` 全绿之后再开始写页面——**先让护栏跑起来，再写业务**。

## 全局机制：三个唯一入口

页面级的东西最容易"每个组件各写一套"，基座把它们收成三个模块：

| 机制 | 唯一入口 | 规则 |
|---|---|---|
| 覆盖层 / 滚动锁 | `lib/overlay.ts` 的 `useOverlayLayer(open)` | 任何弹窗、全屏菜单都必须用它；组件里禁止写 `body.style.overflow` |
| 锚点滚动 | `lib/anchor.ts` 的 `scrollToAnchor(href)` | 全站"跳到某段"只走这一个函数；禁止各组件自己 `scrollTo` |
| 入场动效 | `components/ui/reveal.tsx` + `lib/motion.ts` | 动效只做增强：SSR 内容默认可见，JS 才武装隐藏；时长/缓动只取 token |

判断新增机制是否越界的标准：**"它会不会出现第二份实现？"会，就说明该进 lib/，而不是进组件。**

## 图片流水线

- 原图放 `media/raw/`（已 gitignore），**不要**直接塞 `public/`。
- `npm run media` 生成三档 WebP + AVIF，并写 `data/media-manifest.json`（含 width/height/aspect，页面用它排版避免 CLS）。
- 页面只引用 `public/media/` 下产物；`check-assets.mjs` 在 build 前校验体积与引用完整性。

## 基座里有什么，为什么

| 能力 | 文件 | 解决这次项目里的哪个问题 |
|---|---|---|
| 设计 token | `app/styles/tokens.css` | 颜色散落 181 处 hex、断点 20 个宽度值 |
| 样式分层 | `app/globals.css`（只放 token/base/工具类）+ 组件 `.module.css` | 736 行 globals.css 里同一选择器定义 6 次 |
| 事实单一来源 | `data/site.ts` | 电话写 7 处、地址 4 处、JSON-LD 与页面不同源 |
| SEO 生成 | `lib/seo.ts` + `app/robots.ts` + `app/sitemap.ts` | 无 canonical / og:image / robots / sitemap |
| 原生弹窗 | `components/ui/dialog.tsx` | 滚动锁、inert、焦点圈闭各写一套且互相打架 |
| 动效/滚动入口 | `lib/overlay.ts`、`lib/anchor.ts`、`lib/motion.ts`、`components/ui/reveal.tsx` | 滚动被 5 处接管、11 处各自读 reduced-motion |
| TypeScript | `tsconfig.json`（strict）、`npm run typecheck` | 字段拼错、metadata 写错 Next 静默丢弃 |
| 图片流水线 | `scripts/optimize-images.mjs` | 205.8 MB public、原图直出、无尺寸清单 |
| 内容测试 | `tests/content.test.ts` | JSON-LD 与页面事实不一致没人发现 |
| 事实检查 | `scripts/check-facts.mjs` | 硬编码电话、TODO/XXXX 占位符上线 |
| 资源预算 | `scripts/check-assets.mjs` | public 205.8 MB、引用不存在的图 |
| 依赖与包管理器 | `scripts/check-deps.mjs` | 双 lock 文件、gsap 与 framer-motion 同时存在、import 未声明的包 |
| lint/format | `eslint.config.mjs`、`.prettierrc.json` | 裸 `<img>`、hook 依赖、格式噪音 |
| 样式约束 | `stylelint.config.mjs` | hex 字面量、`!important`、裸 z-index |
| CI | `.github/workflows/check.yml` | 改坏了没人拦 |

## 版本与引用

- 当前版本：`v0.3.0`，见 [CHANGELOG.md](CHANGELOG.md)。
- 新项目：复制 `template/`（或用 `new-site.mjs`），并在项目文档里记一行：
  **本项目基于 web-starter v0.3.0 生成**。
- 基座升级**不会自动影响**已有项目；需要时按 CHANGELOG 手动合并。
- 如果托管到 GitHub，可改用 `npx degit <repo>#v0.3.0 08-新项目`（私有仓库需带 token）。

## 维护方式

**每次项目复盘后，只做两件事：**

1. 把新踩的坑写进 `docs/复盘教训-20条.md`（现象 → 规则 → 由谁兜住）；
2. 能自动化的，就加到 `scripts/` 或 lint 规则里，然后升版本、打 tag、更新 CHANGELOG。

不要新建一份新的说明文档——基座的价值在于"规则被执行"，文档多一份就少一分可信。

## 与业务项目的关系

- 基座是**跨项目**的，不放在任何项目目录里，也不作为项目的 git submodule 或运行期依赖。
- 业务项目（如 `项目/全屋定制落地页`）只记录"基于哪个版本生成"，并保持可独立构建、独立交付。
- 旧项目不追基座升级；新项目天然使用最新版。
