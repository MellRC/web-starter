// Next 16 起 `next lint` 已移除，只能走 ESLint CLI；配置用 flat config。
// 规则来源：eslint-config-next（含 @next/next、react、react-hooks）。
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // 项目约定：先报问题，别静默放过。
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "prefer-const": "warn",
      // 裸 <img> 绕过 next/image：体积与 LCP 都不可控。
      "@next/next/no-img-element": "error",
      // 客户端组件 + 服务端渲染混用时最常见的坑。
      "@next/next/no-async-client-component": "error",
    },
  },
  {
    files: ["scripts/**/*.mjs", "tests/**/*.mjs"],
    rules: {
      // 脚本与测试允许打印进度。
      "no-console": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "node_modules/**", "public/**"]),
]);
