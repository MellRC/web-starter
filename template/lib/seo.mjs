// SEO 与结构化数据的唯一生成入口。
// 原则：metadata 与 JSON-LD 都由 data/site.mjs 派生，保证页面可见事实 == 告诉搜索引擎的事实。
import { site } from "../data/site.mjs";

const absolute = (path = "/") => new URL(path, site.url).toString();

export function buildMetadata({ title = site.title, description = site.description, path = "/" } = {}) {
  return {
    metadataBase: new URL(site.url),
    title,
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: site.locale,
      url: path,
      siteName: site.name,
      title,
      description,
      images: [{ url: site.ogImage, width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [site.ogImage],
    },
  };
}

export function organizationSchema() {
  const node = {
    "@type": site.orgType || "Organization",
    "@id": `${absolute("/")}#organization`,
    name: site.name,
    url: absolute("/"),
    telephone: site.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    areaServed: site.areaServed.map((name) => ({ "@type": "AdministrativeArea", name })),
  };
  if (site.legalName) node.legalName = site.legalName;
  if (site.logo) node.logo = absolute(site.logo);
  return node;
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${absolute("/")}#website`,
    name: site.name,
    url: absolute("/"),
    inLanguage: site.locale.replace("_", "-"),
    publisher: { "@id": `${absolute("/")}#organization` },
  };
}

export function faqSchema(items) {
  return {
    "@type": "FAQPage",
    "@id": `${absolute("/")}#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function graph(...nodes) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
