import React, { useState } from "react";
import styles from "./WalletManage.module.css";
import { FaPlus, FaMinus, FaWallet } from "react-icons/fa";
import { useParams } from "react-router-dom";


const WalletManage = () => {
      const { user_id } = useParams();
  const [activeTab, setActiveTab] = useState("add");
  const [amount, setAmount] = useState("");

  const handleSubmit = () => {
    if (!amount) return alert("Enter a valid amount.");
    alert(`${activeTab === "add" ? "Added" : "Subtracted"} ₹${amount}`);
    setAmount("");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>Wallet Management</h2>

      <div className={styles.card}>
        <div className={styles.headerRow}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tabBtn} ${
                activeTab === "add" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("add")}
            >
              <FaPlus /> Add Balance
            </button>
            <button
              className={`${styles.tabBtn} ${
                activeTab === "subtract" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("subtract")}
            >
              <FaMinus /> Substract Balance
            </button>
          </div>

          <div className={styles.balanceBadge}>Wallet Balance: 0₹</div>
        </div>

        <div className={styles.inputGroup}>
          <label>Enter Amount</label>
          <input
            type="number"
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <button
          className={`${styles.actionBtn} ${
            activeTab === "add" ? styles.addBtn : styles.subtractBtn
          }`}
          onClick={handleSubmit}
        >
          <FaWallet /> {activeTab === "add" ? "Add" : "Substract"} Wallet
          Balance
        </button>
      </div>

      <h3 className={styles.logTitle}>Wallet Log</h3>
      <div className={styles.logCard}>
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>Sr No.</th>
                <th>Amount</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className={styles.emptyRow}>
                  No data available in table
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WalletManage;
