import React from "react";
import styles from "./CustomToggle.module.css";

const CustomToggle = ({ label, checked, onChange }) => {
  return (
    <div className={styles.toggleWrapper}>
      <label className={styles.label}>{label}</label>
      <label className={styles.switch}>
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className={styles.slider}></span>
      </label>
    </div>
  );
};

export default CustomToggle;
