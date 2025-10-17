import React from "react";
import styles from "./InputField.module.css";

function InputField({
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  label,
  error = "",
  icon = null,
  onIconClick = null,
  onFocus = null,
  onBlur = null,
}) {
  return (
    <div
      className={`${styles.formInputContainer} ${
        error ? styles.errorStyle : ""
      }`}
    >
      <input
        name={name}
        type={type}
        id={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className={styles.input}
      />

      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
      )}

      {icon && (
        <span className={styles.icon} onClick={onIconClick}>
          {icon}
        </span>
      )}

      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}

export default InputField;
