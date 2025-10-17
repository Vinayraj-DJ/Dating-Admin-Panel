import React, { useState } from "react";
import styles from "./PushNotification.module.css"; // 👈 you'll define styles below

const PushNotification = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !message || !url) {
      alert("Please fill in all fields.");
      return;
    }

    // Example POST request (replace with actual API call)
    console.log("Sending notification:", { title, message, url });

    // Mock success
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);

    // Reset form
    setTitle("");
    setMessage("");
    setUrl("");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Notification Management</h2>

      <form onSubmit={handleSubmit} className={styles.card}>
        <div className={styles.field}>
          <label htmlFor="title">Enter Notification Title</label>
          <input
            type="text"
            id="title"
            placeholder="Enter Notification Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="message">Enter Notification Message</label>
          <input
            type="text"
            id="message"
            placeholder="Enter Notification Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="url">Enter Notification Url</label>
          <input
            type="text"
            id="url"
            placeholder="Enter Notification Url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <button type="submit" className={styles.button}>
          Send Notification
        </button>

        {success && (
          <div className={styles.successMsg}>
            ✅ Notification sent successfully!
          </div>
        )}
      </form>
    </div>
  );
};

export default PushNotification;
