import React from "react";
import styles from "./FormGridLayout.module.css";

export default function FormGridLayout({ columns = 2, children }) {
  const cls = columns === 4 ? styles.grid4 : columns === 3 ? styles.grid3 : styles.grid2;
  return <div className={cls}>{children}</div>;
}
