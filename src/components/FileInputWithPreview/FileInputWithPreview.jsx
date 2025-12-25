import React, { useRef } from "react";
import styles from "./FileInputWithPreview.module.css";

export default function FileInputWithPreview({ label, imageUrl, onFileSelect, onRemove, accept = "image/*", hint }) {
  const ref = useRef();
  return (
    <div className={styles.wrap}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.row}>
        <input
          ref={ref}
          type="file"
          accept={accept}
          className={styles.file}
          onChange={(e) => onFileSelect && onFileSelect(e.target.files?.[0])}
        />
        {imageUrl ? (
          <div className={styles.previewWrap}>
            <img src={imageUrl} alt="preview" className={styles.preview} />
            <button type="button" className={styles.remove} onClick={() => { ref.current.value = ""; onRemove && onRemove(); }}>
              Remove
            </button>
          </div>
        ) : null}
      </div>
      {hint && <div className={styles.hint}>{hint}</div>}
    </div>
  );
}
