import React, { useState } from "react";
import styles from "./CoinManage.module.css";
import { FaPlus, FaMinus, FaCoins } from "react-icons/fa";
import { useParams } from "react-router-dom";

const CoinManage = () => {
  const { user_id } = useParams();
  const [activeTab, setActiveTab] = useState("add");
  const [amount, setAmount] = useState("");

  // Mock log data
  const mockLog = [
    {
      id: 1,
      amount: 50,
      message: "Signup bonus",
      status: "Added",
      date: "2025-07-01",
    },
    {
      id: 2,
      amount: 30,
      message: "Profile viewed",
      status: "Subtracted",
      date: "2025-07-10",
    },
  ];

  const handleSubmit = () => {
    if (!amount) return alert("Enter a valid amount.");
    alert(`${activeTab === "add" ? "Added" : "Subtracted"} ${amount} coins`);
    setAmount("");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>Coin Management</h2>

      <div className={styles.card}>
        <div className={styles.headerRow}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tabBtn} ${
                activeTab === "add" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("add")}
            >
              <FaPlus /> Add Coins
            </button>
            <button
              className={`${styles.tabBtn} ${
                activeTab === "subtract" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("subtract")}
            >
              <FaMinus /> Subtract Coins
            </button>
          </div>

          <div className={styles.balanceBadge}>Coin Balance: 80 🪙</div>
        </div>

        <div className={styles.inputGroup}>
          <label>Enter Coins</label>
          <input
            type="number"
            placeholder="Enter Coins"
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
          <FaCoins /> {activeTab === "add" ? "Add" : "Subtract"} Coin Balance
        </button>
      </div>

      <h3 className={styles.logTitle}>Coin Log</h3>
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
              {mockLog.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.amount}</td>
                  <td>{item.message}</td>
                  <td
                    className={
                      item.status === "Added" ? styles.green : styles.red
                    }
                  >
                    {item.status}
                  </td>
                  <td>{item.date}</td>
                </tr>
              ))}
              {mockLog.length === 0 && (
                <tr>
                  <td colSpan="5" className={styles.emptyRow}>
                    No data available in table
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CoinManage;
