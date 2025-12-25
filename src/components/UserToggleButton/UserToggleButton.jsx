
// src/components/UserToggleButton/UserToggleButton.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import { toggleUserStatus } from "../../services/usersService";
import styles from "./UserToggleButton.module.css";

export default function UserToggleButton({
  userId,
  currentStatus = "inactive",
  userType = "male",
  onSuccess,
  onError,
}) {
  const [loading, setLoading] = useState(false);
  const isActive = String(currentStatus || "").toLowerCase() === "active";
  const targetStatus = isActive ? "inactive" : "active";

  const handleToggle = async () => {
    if (
      !window.confirm(
        `Are you sure you want to ${isActive ? "deactivate" : "activate"} this user?`
      )
    )
      return;
    setLoading(true);
    try {
      const updatedUser = await toggleUserStatus({
        userType,
        userId,
        status: targetStatus,
      });
      if (typeof onSuccess === "function") onSuccess(userId, updatedUser);
    } catch (err) {
      console.error("toggleUserStatus error:", err);
      if (typeof onError === "function") onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`${styles.userToggleBtn} ${
        isActive ? styles.deactivate : styles.activate
      } ${loading ? styles.loading : ""}`}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? "..." : isActive ? "Deactivate" : "Activate"}
    </button>
  );
}

UserToggleButton.propTypes = {
  userId: PropTypes.string.isRequired,
  currentStatus: PropTypes.string,
  userType: PropTypes.string,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
};
