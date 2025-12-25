import React, { useState } from "react";
import styles from "./MaskedInput.module.css";

export default function MaskedInput({ label, name, value, onChange, placeholder = "", required = false }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label}>
          {label} {required && <span className={styles.req}>*</span>}
        </label>
      )}
      <div className={styles.row}>
        <input
          className={styles.input}
          id={name}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          type={visible ? "text" : "password"}
        />
        <button type="button" className={styles.toggle} onClick={() => setVisible(v => !v)}>
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
