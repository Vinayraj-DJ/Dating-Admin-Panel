import React from "react";
import styles from "./HeadingAndData.module.css";

const HeadingAndData = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  required = false,
  type = "text",
  disabled = false,
}) => {
  return (
    <div className={styles.inputBlock}>
      <label htmlFor={name} className={styles.inputLabel}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </label>
      <input
        id={name}
        name={name}
        className={styles.inputField}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange || (() => {})}
        required={required}
        disabled={disabled}
      />
    </div>
  );
};

export default HeadingAndData;
