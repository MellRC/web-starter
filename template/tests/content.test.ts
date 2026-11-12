// 内容层回归测试：只测纯数据与纯函数，不碰 DOM。
// 跑法：npm test（Node 测试运行器 + tsx 加载 TS）
import assert from "node:assert/strict";
import test from "node:test";

import { faqs } from "../data/faq";
import { site } from "../data/site";
import { buildMetadata, faqSchema, graph, organizationSchema, websiteSchema } from "../lib/seo";

const REQUIRED_SITE_FIELDS = ["name", "title", "description", "url", "phone"] as const;

test("site 必填事实齐全且非空", () => {
  for (const field of REQUIRED_SITE_FIELDS) {
    assert.ok(site[field], `data/site.ts 缺少 ${field}`);
  }
});

test("site.url 是合法 https 地址且不带结尾斜杠", () => {
  const url = new URL(site.url);
  assert.equal(url.protocol, "https:");
  assert.ok(!site.url.endsWith("/"), "site.url 结尾不要带斜杠");
});

test("FAQ 的 id 唯一，问题与答案都不为空", () => {
  const ids = faqs.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, "FAQ id 必须唯一");
  for (const item of faqs) {
    assert.ok(item.question.trim(), "FAQ question 不能为空");
    assert.ok(item.answer.trim(), "FAQ answer 不能为空");
  }
});

test("metadata 带上 canonical 与 OG 图", () => {
  const metadata = buildMetadata() as unknown as {
    alternates?: { canonical?: string };
    openGraph?: { images?: unknown[]; title?: string };
  };

  assert.equal(metadata.alternates?.canonical, "/");
  assert.ok((metadata.openGraph?.images?.length ?? 0) > 0);
  assert.ok(metadata.openGraph?.title);
});

test("JSON-LD 与页面可见事实同源", () => {
  const structured = graph(organizationSchema(), websiteSchema(), faqSchema(faqs));
  const organization = structured["@graph"][0] as Record<string, unknown>;
  const faqNode = structured["@graph"][2] as { mainEntity: unknown[] };

  assert.equal(organization.telephone, site.phone, "JSON-LD 的电话必须等于 site.phone");
  assert.equal(organization.name, site.name);
  assert.equal(faqNode.mainEntity.length, faqs.length);
});
