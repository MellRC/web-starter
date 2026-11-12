// 图片流水线：media/raw/ 原图 → public/media/w{n}/ 多尺寸 WebP + AVIF，并生成 data/media-manifest.json。
// 跑法：npm run media
//   --in <目录>      输入目录，默认 media/raw
//   --out <目录>     输出目录，默认 public/media
//   --sizes 320,768,1600  输出宽度档位
//   --quality 72     源质量基准（webp 用原值，avif 用 -22）
import { existsSync } from "node:fs";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = argv.indexOf(`--${name}`);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
};

const ROOT = process.cwd();
const INPUT = join(ROOT, arg("in", "media/raw"));
const OUTPUT = join(ROOT, arg("out", "public/media"));
const SIZES = arg("sizes", "320,768,1600")
  .split(",")
  .map((value) => Number.parseInt(value, 10))
  .filter((value) => Number.isFinite(value) && value > 0);
const BASE_QUALITY = Number.parseInt(arg("quality", "72"), 10);

if (!existsSync(INPUT)) {
  console.error(`✗ 输入目录不存在：${INPUT}`);
  console.error("  把原图（jpg/png/webp/tiff）放进 media/raw/ 再跑 npm run media");
  process.exit(1);
}

let sharp;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  console.error("✗ 未安装 sharp：先执行 npm install（sharp 在 devDependencies 里）");
  process.exit(1);
}

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);
const QUALITY = {
  webp: BASE_QUALITY,
  avif: Math.max(30, BASE_QUALITY - 22),
};

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, out);
      continue;
    }
    if (IMAGE_EXT.has(extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

const files = await walk(INPUT);
if (files.length === 0) {
  console.error(`✗ ${INPUT} 里没有可处理的图片`);
  process.exit(1);
}

const manifest = [];
let sourceBytes = 0;
let outputBytes = 0;

for (const file of files) {
  const rel = relative(INPUT, file);
  const name = rel.replace(/\.[^.]+$/, "").split("\\").join("/");
  const info = await stat(file);
  sourceBytes += info.size;

  const meta = await sharp(file).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height) {
    console.warn(`⚠ 跳过无法识别尺寸的文件：${rel}`);
    continue;
  }

  const variants = [];
  for (const size of SIZES) {
    const targetWidth = Math.min(size, width);
    for (const format of ["webp", "avif"]) {
      const outPath = join(OUTPUT, `w${size}`, `${name}.${format}`);
      await mkdir(dirname(outPath), { recursive: true });
      await sharp(file)
        .resize({ width: targetWidth, withoutEnlargement: true })
        [format]({ quality: QUALITY[format] })
        .toFile(outPath);

      const outputInfo = await stat(outPath);
      outputBytes += outputInfo.size;
      variants.push({
        format,
        width: targetWidth,
        path: `/${relative(join(ROOT, "public"), outPath).split("\\").join("/")}`,
      });
    }
  }

  manifest.push({
    // 原始素材不在 public 里，这里只记录仓库相对路径，方便追溯
    source: relative(ROOT, file).split("\\").join("/"),
    width,
    height,
    aspect: Number((width / height).toFixed(3)),
    variants,
  });

  console.log(`  ${rel} → ${variants.length} 个变体`);
}

await writeFile(join(ROOT, "data", "media-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);
console.log(`\n✓ 处理 ${manifest.length} 张图：原图 ${mb(sourceBytes)} MB → 输出 ${mb(outputBytes)} MB`);
console.log("✓ 清单：data/media-manifest.json（页面只引用 public/media/ 下的产物）");
