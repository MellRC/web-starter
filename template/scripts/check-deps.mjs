// 依赖与包管理器检查：
// 1) 只能有一个锁文件 / 一个包管理器；
// 2) 同一能力（动画、图标、日期…）只允许一个库；
// 3) 代码里 import 的包必须已声明，声明了但没用的给出警告。
// 跑法：npm run check:deps（也支持 --root <项目目录> 审计别的项目）
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const argv = process.argv.slice(2);
const rootFlag = argv.indexOf("--root");
const ROOT = rootFlag >= 0 ? resolve(argv[rootFlag + 1]) : process.cwd();

const pkg = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
const declared = new Map();
for (const field of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
  for (const name of Object.keys(pkg[field] ?? {})) declared.set(name, field);
}

const errors = [];
const warnings = [];

// ---------- 1. 包管理器唯一性 ----------
const LOCKFILES = [
  ["package-lock.json", "npm"],
  ["pnpm-lock.yaml", "pnpm"],
  ["yarn.lock", "yarn"],
  ["bun.lockb", "bun"],
  ["bun.lock", "bun"],
];
const found = LOCKFILES.filter(([file]) => existsSync(join(ROOT, file)));

if (found.length === 0) {
  warnings.push("没有锁文件：首次 npm install 后请把 package-lock.json 提交进仓库");
} else if (found.length > 1) {
  errors.push(`同时存在多个锁文件（${found.map(([f]) => f).join("、")}）→ 只保留一个包管理器`);
}

if (pkg.packageManager) {
  const pm = String(pkg.packageManager).split("@")[0];
  if (found.length === 1 && found[0][1] !== pm) {
    errors.push(`packageManager 声明为 ${pkg.packageManager}，但锁文件是 ${found[0][0]}`);
  }
}

// ---------- 2. 同一能力只留一个库 ----------
const CAPABILITY_GROUPS = [
  {
    name: "动画",
    packages: ["gsap", "framer-motion", "motion", "react-spring", "@react-spring/web", "animejs"],
  },
  {
    name: "图标",
    packages: ["lucide-react", "react-icons", "@heroicons/react", "@fortawesome/react-fontawesome", "react-feather", "@tabler/icons-react"],
  },
  { name: "日期", packages: ["dayjs", "date-fns", "moment", "luxon"] },
  {
    name: "状态管理",
    packages: ["zustand", "redux", "@reduxjs/toolkit", "jotai", "recoil", "mobx", "valtio"],
  },
  {
    name: "数据请求",
    packages: ["axios", "swr", "@tanstack/react-query", "ky", "got"],
  },
];

const allowed = new Set(pkg.checkDeps?.allow ?? []);
for (const group of CAPABILITY_GROUPS) {
  const installed = group.packages.filter((name) => declared.has(name) && !allowed.has(name));
  if (installed.length > 1) {
    errors.push(
      `「${group.name}」装了 ${installed.length} 个同类库：${installed.join("、")} → 只保留一个（迁移期可临时写进 package.json 的 checkDeps.allow）`,
    );
  }
}

// ---------- 3. import 与声明一致性 ----------
const CODE_EXT = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const SCAN_DIRS = ["app", "components", "lib", "data", "scripts", "tests"];
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "public"]);

async function walk(dir, out) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) await walk(full, out);
      continue;
    }
    if (CODE_EXT.has(extname(entry.name))) out.push(full);
  }
}

const files = [];
for (const dir of SCAN_DIRS) await walk(join(ROOT, dir), files);
for (const file of ["eslint.config.mjs", "next.config.mjs"]) {
  const full = join(ROOT, file);
  if (existsSync(full)) files.push(full);
}

const IMPORT_PATTERN = /(?:from\s*|import\s*|require\(\s*|import\(\s*)["']([^"']+)["']/g;

function packageNameOf(specifier) {
  if (!specifier || specifier.startsWith(".") || specifier.startsWith("/")) return null;
  if (specifier.startsWith("node:") || specifier.startsWith("http")) return null;
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

const imported = new Map();
for (const file of files) {
  const text = await readFile(file, "utf8");
  for (const match of text.matchAll(IMPORT_PATTERN)) {
    const name = packageNameOf(match[1]);
    if (name && !imported.has(name)) imported.set(name, file.slice(ROOT.length + 1));
  }
}

for (const [name, file] of imported) {
  if (!declared.has(name)) errors.push(`代码 import 了未声明的包「${name}」（首次出现：${file}）`);
}

// 框架与工具链本身不会被业务代码直接 import，避免误报
const IGNORE_UNUSED = new Set([
  "next", "react", "react-dom", "typescript", "eslint", "eslint-config-next",
  "prettier", "stylelint", "stylelint-config-standard", "tsx",
]);
for (const name of declared.keys()) {
  if (imported.has(name) || IGNORE_UNUSED.has(name) || name.startsWith("@types/")) continue;
  warnings.push(`依赖「${name}」已声明但代码里没有 import，确认是否残留`);
}

// ---------- 输出 ----------
for (const message of errors) console.error(`✗ ${message}`);
for (const message of warnings) console.warn(`⚠ ${message}`);

const pmLabel = found.length === 1 ? found[0][1] : pkg.packageManager ?? "未声明";
if (errors.length > 0) {
  console.error(`\n✗ check-deps 失败：${errors.length} 个问题（${files.length} 个文件，包管理器：${pmLabel}）`);
  process.exit(1);
}
console.log(
  `✓ check-deps 通过（包管理器：${pmLabel}，声明依赖 ${declared.size} 个，实际 import ${imported.size} 个，警告 ${warnings.length} 条）`,
);
