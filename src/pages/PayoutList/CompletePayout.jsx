import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InterestUpload from "../../components/InterestUpload/InterestUpload";
import Button from "../../components/Button/Button";
import styles from "./CompletePayout.module.css";

const CompletePayout = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [uploadedImage, setUploadedImage] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    if (!uploadedImage) {
      alert("Please upload a payout image before completing.");
      return;
    }

    // Simulate upload
    setIsCompleted(true);
  };

  const handleGoBack = () => {
    navigate("/payoutlist");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Payout List Management</h2>

      <div className={styles.card}>
        <InterestUpload
          label="Payout Image"
          id="payout-upload"
          onChange={(file) => setUploadedImage(file)}
        />

        <div className={styles.buttonWrapper}>
          <Button onClick={handleComplete}>Complete Payout</Button>
          <Button variant="secondary" onClick={handleGoBack}>
            Go Back
          </Button>
        </div>

        {isCompleted && (
          <div className={styles.successMessage}>
            ✅ Payout completed successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletePayout;
