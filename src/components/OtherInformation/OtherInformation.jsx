import React from "react";
import styles from "./OtherInformation.module.css";

const OtherInformation = ({ userInfo }) => {
  if (!userInfo) return null;

  const {
    profile_bio,
    birth_date,
    search_preference,
    relationGoal,
    gender,
    religionTitle,
    radius_search,
    wallet,
  } = userInfo;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className={styles.card}>
      <h5 className={styles.title}>Other Information</h5>

      <div className={styles.grid}>
        <div>
          <p className={styles.label}>Profile Bio:</p>
          <p className={styles.value}>{profile_bio || "—"}</p>
        </div>
        <div>
          <p className={styles.label}>Birth Date:</p>
          <p className={styles.value}>{formatDate(birth_date)}</p>
        </div>

        <div>
          <p className={styles.label}>Search Preference:</p>
          <p className={styles.value}>{search_preference || "—"}</p>
        </div>
        <div>
          <p className={styles.label}>Relation Goal:</p>
          <p className={styles.value}>
            {relationGoal?.title || "—"}
            <br />
            {relationGoal?.subtitle || ""}
          </p>
        </div>

        <div>
          <p className={styles.label}>Gender:</p>
          <p className={styles.value}>{gender || "—"}</p>
        </div>
        <div>
          <p className={styles.label}>Religion:</p>
          <p className={styles.value}>{religionTitle || "—"}</p>
        </div>

        <div>
          <p className={styles.label}>Radius Search:</p>
          <p className={styles.value}>
            {radius_search ? `${radius_search}KM` : "—"}
          </p>
        </div>
        <div>
          <p className={styles.label}>Wallet Balance:</p>
          <p className={styles.value}>{wallet != null ? `${wallet}₹` : "—"}</p>
        </div>
      </div>
    </div>
  );
};

export default OtherInformation;
