import React, { useState, useEffect } from "react";
import styles from "./InterestUpload.module.css";
const InterestUpload = ({
  label = "Interest Image",
  id = "interest-upload",
  imagePreview = "",
  onChange = () => {}, // <-- accept callback
}) => {
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(imagePreview);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      onChange(file); // <-- send to parent
    } else {
      setFileName("");
      setPreview(imagePreview);
      onChange(null);
    }
  };

  useEffect(() => {
    setPreview(imagePreview);
  }, [imagePreview]);

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>

      <div className={styles.inputBox}>
        <label htmlFor={id} className={styles.customButton}>
          Choose file
        </label>
        <input
          type="file"
          id={id}
          onChange={handleFileChange}
          className={styles.input}
        />
        {fileName && <span className={styles.fileName}>{fileName}</span>}
      </div>

      {preview && (
        <img src={preview} alt="Interest Preview" className={styles.preview} />
      )}
    </div>
  );
};
export default InterestUpload;
