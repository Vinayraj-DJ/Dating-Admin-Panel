// src/components/CustomToast/CustomToast.jsx
import React from "react";
import { toast, Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiBell } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import styles from "./CustomToast.module.css";

/**
 * showCustomToast(message, onClose?)
 * - message: string to show
 * - onClose: optional callback (fires after toast fully closes)
 *
 * This version will collapse multiple trailing "!" characters into a single "!"
 * so you won't see double exclamation marks.
 */
export const showCustomToast = (message, onClose) => {
  // Ensure message is a string
  const raw = message == null ? "" : String(message);

  // Collapse trailing exclamation marks to a single one.
  // Examples:
  //  "Saved!!" -> "Saved!"
  //  "Saved!!!" -> "Saved!"
  //  "Saved!" -> "Saved!"
  //  "Saved" -> "Saved" (unchanged)
  const sanitized = raw.replace(/!+$/, (m) => (m.length > 0 ? "!" : ""));

  toast(
    ({ closeToast }) => (
      <div className={styles.toastLayout}>
        <div className={styles.left}>
          <FiBell className={styles.toastBell} />
        </div>

        <div className={styles.center}>
          <div className={styles.toastMessage}>{sanitized}</div>
        </div>

        <div className={styles.right}>
          <button
            type="button"
            className={styles.toastClose}
            onClick={() => {
              closeToast();
            }}
            aria-label="close"
          >
            <RxCross2 />
          </button>
        </div>
      </div>
    ),
    {
      position: "top-right",
      autoClose: 1500,
      closeButton: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progressClassName: styles.toastProgress,
      className: styles.toastContainer,
      transition: Slide,
      onClose,
    }
  );
};

// ToastContainer wrapper (add once per app or per page)
export const ToastContainerCustom = () => (
  <ToastContainer
    newestOnTop={true}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss={false}
    draggable={false}
  />
);

export default { showCustomToast, ToastContainerCustom };
