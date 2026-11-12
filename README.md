# 前端工程基座

> 这是**跨项目**资产，独立于任何业务项目仓库，位置：`D:\Mellie仓库\基座\web-starter`。
> 用 tag 管理版本（当前 `v0.1.0`），新项目生成时记录所用版本。

把「云栖木作」官网项目的复盘结论，固化成一个**可以直接复制、开箱即用**的起点。
下次做前端网站时，从 `template/` 开始，而不是从空白文件夹开始。

## 三条铁规

1. **每类东西只有一个出口**：设计值在 `tokens.css`，事实在 `data/site.mjs`，SEO 在 `lib/seo.mjs`，页面级机制（滚动/弹窗）只有一套实现。
2. **组件只接收数据，不读别处 DOM**：组件之间不靠类名、id、`querySelector` 互相约定。
3. **能交给平台的不自己写**：焦点圈闭、Esc 关闭、背景 inert 用原生 `<dialog>`；无障碍折叠用原生 `<details>`。

## 目录

```
web-starter/
  template/                 ← 可直接复制的最小 Next.js 16 基座
    app/                    ← 路由与外壳（layout / page / robots / sitemap / icon）
    components/sections/    ← 页面区块组件（服务端组件优先）
    components/ui/          ← 通用件（弹窗、按钮、标题）
    data/                   ← 唯一事实来源：site.mjs、faq.mjs
    lib/                    ← 纯逻辑：seo.mjs（metadata + JSON-LD）
    scripts/                ← 护栏脚本：check-facts、check-assets
    tests/                  ← 内容层回归测试
    app/styles/tokens.css   ← 全站唯一允许写死设计值的地方
    eslint / stylelint / prettier / GitHub Actions
  docs/复盘教训-20条.md      ← 这次踩的坑，逐条转成规则和护栏
  checklists/开工前30分钟.md
  checklists/上线前验收.md
  scripts/new-site.mjs      ← 一条命令复制出一个新项目
  CHANGELOG.md              ← 版本与变更记录
```

## 30 秒用法

```bash
# 在基座目录下执行
node scripts/new-site.mjs ../08-新站点
cd ../08-新站点
npm install
npm run check    # lint + stylelint + test + 事实检查 + 资源检查
npm run dev
```

`npm run check` 全绿之后再开始写页面——**先让护栏跑起来，再写业务**。

## 版本与引用

- 当前版本：`v0.1.0`，见 [CHANGELOG.md](CHANGELOG.md)。
- 新项目：复制 `template/`（或用 `new-site.mjs`），并在项目文档里记一行：
  **本项目基于 web-starter v0.1.0 生成**。
- 基座升级**不会自动影响**已有项目；需要时按 CHANGELOG 手动合并。
- 如果托管到 GitHub，可改用 `npx degit <repo>#v0.1.0 08-新项目`，避免整仓 clone。

## 基座里有什么，为什么

| 能力 | 文件 | 解决这次项目里的哪个问题 |
|---|---|---|
| 设计 token | `app/styles/tokens.css` | 颜色散落 181 处 hex、断点 20 个宽度值 |
| 样式分层 | `app/globals.css`（只放 token/base/工具类）+ 组件 `.module.css` | 736 行 globals.css 里同一选择器定义 6 次 |
| 事实单一来源 | `data/site.mjs` | 电话写 7 处、地址 4 处、JSON-LD 与页面不同源 |
| SEO 生成 | `lib/seo.mjs` + `app/robots.js` + `app/sitemap.js` | 无 canonical / og:image / robots / sitemap |
| 原生弹窗 | `components/ui/dialog.jsx` | 滚动锁、inert、焦点圈闭各写一套且互相打架 |
| 内容测试 | `tests/content.test.mjs` | JSON-LD 与页面事实不一致没人发现 |
| 事实检查 | `scripts/check-facts.mjs` | 硬编码电话、TODO/XXXX 占位符上线 |
| 资源预算 | `scripts/check-assets.mjs` | public 205.8 MB、引用不存在的图 |
| lint/format | `eslint.config.mjs`、`.prettierrc.json` | 裸 `<img>`、hook 依赖、格式噪音 |
| 样式约束 | `stylelint.config.mjs` | hex 字面量、`!important`、裸 z-index |
| CI | `.github/workflows/check.yml` | 改坏了没人拦 |

## 维护方式

**每次项目复盘后，只做两件事：**

1. 把新踩的坑写进 `docs/复盘教训-20条.md`（现象 → 规则 → 由谁兜住）；
2. 能自动化的，就加到 `scripts/` 或 lint 规则里，然后升版本、打 tag、更新 CHANGELOG。

不要新建一份新的说明文档——基座的价值在于"规则被执行"，文档多一份就少一分可信。

## 与业务项目的关系

- 基座是**跨项目**的，不放在任何项目目录里，也不作为项目的 git submodule 或运行期依赖。
- 业务项目（如 `项目/全屋定制落地页`）只记录"基于哪个版本生成"，并保持可独立构建、独立交付。
- 旧项目不追基座升级；新项目天然使用最新版。
