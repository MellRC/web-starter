// 用基座生成一个新站点：把 template/ 复制到目标目录，并把 package.json 的 name 改成目录名。
// 用法：node scripts/new-site.mjs ../08-新站点
import { cp, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const TEMPLATE = join(here, "..", "template");

const targetArg = process.argv[2];
if (!targetArg) {
  console.error("用法：node scripts/new-site.mjs <目标目录>");
  console.error("示例：node scripts/new-site.mjs ../08-云栖木作官网");
  process.exit(1);
}

const target = resolve(process.cwd(), targetArg);
if (existsSync(target)) {
  console.error(`目标目录已存在，未做任何修改：${target}`);
  process.exit(1);
}

await cp(TEMPLATE, target, {
  recursive: true,
  filter: (source) => !/[\\/](node_modules|\.next|\.git)([\\/]|$)/.test(source),
});

// 包名用目录名，版本从 0.1.0 起，避免复制出来还叫 web-starter。
const packageJsonPath = join(target, "package.json");
const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
packageJson.name = basename(target).replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase() || "web-site";
packageJson.version = "0.1.0";
await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");

console.log(`✓ 已生成：${target}`);
console.log(`
下一步：
  1. cd "${targetArg}" && npm install
  2. 改 data/site.mjs：品牌名、域名、电话、地址、服务区域、备案号
  3. 替换 public/og.png、public/logo.png、app/icon.png 为真实素材
  4. 在 app/page.jsx 里搭页面骨架，样式写进各组件自己的 .module.css
  5. 跑通：npm run check && npm run build
  6. git init && 首次提交（把 package-lock.json 一起提交）
`);
