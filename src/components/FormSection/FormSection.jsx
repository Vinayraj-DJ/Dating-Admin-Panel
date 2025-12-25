import React from "react";
import styles from "./FormSection.module.css";

export default function FormSection({ icon, title, subtitle, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <div className={styles.titleWrap}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
