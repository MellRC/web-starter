import styles from "./section-heading.module.css";

// 服务端组件：标题结构统一走这里，避免每个区块各写一套 h2 + 眉题 + 副文案。
export type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  copy?: string;
  titleId?: string;
  light?: boolean;
};

export default function SectionHeading({ eyebrow, title, copy, titleId, light = false }: SectionHeadingProps) {
  return (
    <header className={light ? `${styles.root} ${styles.light}` : styles.root}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      {copy ? <p className={styles.copy}>{copy}</p> : null}
    </header>
  );
}
