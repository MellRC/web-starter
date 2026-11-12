// 事实唯一性检查：品牌/联系方式只允许出现在 data/site.mjs。
// 跑法：npm run check:facts（prebuild 会自动跑）
import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();
// 只扫应用代码：scripts/ 是检查工具本身，不参与事实扫描，避免自检误报。
const SCAN_DIRS = ["app", "components", "lib", "tests"];
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "public"]);
const CODE_EXT = new Set([".js", ".jsx", ".mjs"]);
const FACTS_FILE = "data/site.mjs";

// 中国大陆手机号：允许 +86 前缀
const PHONE = /(?:\+?86[-\s]?)?1[3-9]\d{9}/g;
// 上线前必须清理的占位符
const PLACEHOLDER = /\b(TODO|FIXME)\b|XXXX+/;

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

const problems = [];
for (const file of files) {
  const rel = relative(ROOT, file).split("\\").join("/");
  if (rel === FACTS_FILE) continue;

  const lines = (await readFile(file, "utf8")).split(/\r?\n/);
  lines.forEach((line, index) => {
    if (line.trimStart().startsWith("//")) return;

    for (const match of line.matchAll(PHONE)) {
      problems.push({
        file: rel,
        line: index + 1,
        message: `出现电话字面量 ${match[0]}；请改用 site.phone（data/site.mjs 是唯一来源）`,
      });
    }

    if (PLACEHOLDER.test(line)) {
      problems.push({
        file: rel,
        line: index + 1,
        message: "存在 TODO/XXXX 占位符；上线前必须清空或条件隐藏",
      });
    }
  });
}

for (const problem of problems) {
  console.error(`${problem.file}:${problem.line}  ${problem.message}`);
}

if (problems.length > 0) {
  console.error(`\n✗ check-facts 失败：${problems.length} 个问题`);
  process.exit(1);
}

console.log(`✓ check-facts 通过（扫描 ${files.length} 个代码文件）`);
