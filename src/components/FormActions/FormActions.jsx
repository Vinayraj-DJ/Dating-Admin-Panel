import React from "react";
import styles from "./FormActions.module.css";
import Button from "../Button/Button"; // using your existing Button component

export default function FormActions({ onCancel, submitLabel = "Save", loading = false }) {
  return (
    <div className={styles.row}>
      <button type="button" className={styles.secondary} onClick={onCancel}>Cancel</button>
      <Button type="submit" backgroundColor="var(--Primary_Color)" textColor="#fff" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </div>
  );
}
