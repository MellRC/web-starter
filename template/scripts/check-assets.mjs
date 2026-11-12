// 资源预算与引用检查：
// 1) public/ 总量、单文件体积是否有上限内；
// 2) 代码里引用的 /xxx 资源是否真的存在（防 404、防改名漏改）。
// 跑法：npm run check:assets（prebuild 会自动跑）
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, "public");

const IMAGE_LIMIT = 400 * 1024; // 单张图片 ≤ 400 KB
const VIDEO_LIMIT = 4 * 1024 * 1024; // 单个视频 ≤ 4 MB
const TOTAL_LIMIT = 60 * 1024 * 1024; // public 总量 ≤ 60 MB

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"]);
const VIDEO_EXT = new Set([".mp4", ".webm"]);
const CODE_EXT = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);

const problems = [];

async function walk(dir, out, options = {}) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!options.skipDirs?.has(entry.name)) await walk(full, out, options);
      continue;
    }
    if (options.exts ? options.exts.has(extname(entry.name)) : true) out.push(full);
  }
}

// ---- 1. 体积预算 ----
const publicFiles = [];
await walk(PUBLIC_DIR, publicFiles);

let totalBytes = 0;
for (const file of publicFiles) {
  const info = await stat(file);
  totalBytes += info.size;
  const rel = relative(PUBLIC_DIR, file).split("\\").join("/");
  const ext = extname(file);
  if (IMAGE_EXT.has(ext) && info.size > IMAGE_LIMIT) {
    problems.push(`${rel} 体积 ${(info.size / 1024).toFixed(0)} KB，超过单图上限 400 KB`);
  }
  if (VIDEO_EXT.has(ext) && info.size > VIDEO_LIMIT) {
    problems.push(`${rel} 体积 ${(info.size / 1024 / 1024).toFixed(1)} MB，超过视频上限 4 MB`);
  }
}

if (totalBytes > TOTAL_LIMIT) {
  problems.push(
    `public/ 总量 ${(totalBytes / 1024 / 1024).toFixed(1)} MB，超过上限 60 MB`,
  );
}

// ---- 2. 引用完整性 ----
const codeFiles = [];
for (const dir of ["app", "components", "lib", "data"]) {
  await walk(join(ROOT, dir), codeFiles, {
    exts: CODE_EXT,
    skipDirs: new Set(["node_modules", ".next", ".git"]),
  });
}

const ASSET_REFERENCE = /"(\/[^"\s]+\.(?:png|jpe?g|webp|avif|gif|svg|mp4|webm|woff2?|ico))"/g;

for (const file of codeFiles) {
  const rel = relative(ROOT, file).split("\\").join("/");
  const text = await readFile(file, "utf8");
  for (const match of text.matchAll(ASSET_REFERENCE)) {
    const assetPath = match[1];
    const diskPath = join(PUBLIC_DIR, assetPath.replace(/^\//, ""));
    try {
      await stat(diskPath);
    } catch {
      problems.push(`${rel} 引用了不存在的资源 ${assetPath}（应放在 public${assetPath}）`);
    }
  }
}

for (const problem of problems) console.error(`✗ ${problem}`);

if (problems.length > 0) {
  console.error(`\n✗ check-assets 失败：${problems.length} 个问题`);
  process.exit(1);
}

console.log(
  `✓ check-assets 通过（public ${publicFiles.length} 个文件 / ${(totalBytes / 1024 / 1024).toFixed(1)} MB，检查 ${codeFiles.length} 个代码文件）`,
);
