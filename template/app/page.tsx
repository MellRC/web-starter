import Link from "next/link";

import SectionHeading from "../components/sections/section-heading";
import ContactButton from "../components/ui/contact-button";
import Reveal from "../components/ui/reveal";
import { faqs } from "../data/faq";
import { site } from "../data/site";
import { faqSchema, graph, organizationSchema, websiteSchema } from "../lib/seo";
import styles from "./page.module.css";

// 页面是服务端组件：HTML 里直接有标题、正文、FAQ 和链接，抓取器无需执行 JS。
export default function Home() {
  const structuredData = graph(organizationSchema(), websiteSchema(), faqSchema(faqs));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/">
            {site.name}
          </Link>
          <nav aria-label="主导航">
            <ul className={styles.nav}>
              <li>
                <a className={styles.navLink} href="#faq">
                  常见问题
                </a>
              </li>
              <li>
                <a className={styles.navLink} href="#contact">
                  联系我们
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className="u-container">
            <p className={`u-eyebrow ${styles.heroEyebrow}`}>示例眉题 · 换成品牌主张</p>
            <h1 id="hero-title" className={styles.heroTitle}>
              一句话说清你是谁、服务哪里、能解决什么问题
            </h1>
            <p className={styles.heroCopy}>{site.description}</p>
            <ContactButton>预约定制</ContactButton>
          </div>
        </section>

        <section className={`u-section ${styles.section}`} id="faq" aria-labelledby="faq-title">
          <div className="u-container">
            <SectionHeading
              eyebrow="FAQ"
              titleId="faq-title"
              title="常见问题"
              copy="每条答案先给结论，再给适用条件与依据；页面可见内容与 FAQPage 结构化数据同源。"
            />
            <Reveal>
              <ul className={styles.faqList}>
                {faqs.map((item) => (
                  <li key={item.id} className={styles.faqItem}>
                    <details>
                      <summary className={styles.faqQuestion}>{item.question}</summary>
                      <p className={styles.faqAnswer}>{item.answer}</p>
                    </details>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <section
          className={`u-section ${styles.sectionMuted}`}
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="u-container">
            <SectionHeading
              eyebrow="CONTACT"
              titleId="contact-title"
              title="联系我们"
              copy={`电话 ${site.phone}；服务区域：${site.areaServed.join("、")}。`}
            />
            <ContactButton>电话咨询</ContactButton>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`u-container ${styles.footerText}`}>
          <p>{[site.legalName, site.icp].filter(Boolean).join(" · ")}</p>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
