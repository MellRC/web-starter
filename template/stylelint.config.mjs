// 目标：让"设计值只能来自 tokens"这条规则由机器执行。
// 跑法：npm run stylelint
export default {
  extends: ["stylelint-config-standard"],
  rules: {
    // 颜色只允许 var(--color-*)；tokens.css 是本文件里唯一例外（见 overrides）。
    "color-no-hex": true,
    // 不允许用 !important 压规则；真需要就改结构或加状态类。
    "declaration-no-important": true,
    // 层级必须走 token，禁止裸数字（后面会越加越大）。
    "declaration-property-value-allowed-list": {
      "z-index": ["/^var\\(--z-[a-z-]+\\)$/"],
    },
    // 以下为风格类规则，容易与格式化工具打架，先关掉减少噪音。
    "custom-property-pattern": null,
    "selector-class-pattern": null,
    "declaration-block-no-redundant-longhand-properties": null,
    "alpha-value-notation": null,
    "color-function-notation": null,
    "value-keyword-case": null,
    "media-feature-range-notation": null,
  },
  overrides: [
    {
      files: ["app/styles/tokens.css"],
      rules: {
        // token 定义处是唯一允许写 hex 的地方。
        "color-no-hex": null,
      },
    },
    {
      files: ["app/styles/base.css"],
      rules: {
        // 全站唯一允许 !important 的地方：reduced-motion 兜底。
        "declaration-no-important": null,
      },
    },
  ],
};
