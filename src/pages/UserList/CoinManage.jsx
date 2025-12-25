// src/pages/Coin/CoinManage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./CoinManage.module.css";
import { FaPlus, FaMinus, FaCoins } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { showCustomToast, ToastContainerCustom } from "../../components/CustomToast/CustomToast";
import { operateCoinBalance, getCoinTransactions } from "../../services/coinService";

import TableControls from "../../components/TableControls/TableControls";
import FancyPager from "../../components/FancyPager/FancyPager";

export default function CoinManage() {
  const { user_id } = useParams();
  const userId = user_id;
  const userType = "male";

  const [activeTab, setActiveTab] = useState("add");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // search + pagination
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const itemsPerPageOptions = [5, 10, 25, 50];

  // guard for user actions
  const lastUserPageActionRef = useRef(0);
  const RECENT_MS = 600;

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function loadTransactions() {
    if (!userId || !userType) return;
    setLoading(true);
    try {
      const res = await getCoinTransactions({ userType, userId });
      const payload = res ?? {};
      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (Array.isArray(payload.data)) list = payload.data;
      else if (Array.isArray(payload?.data?.data)) list = payload.data.data;
      else list = [];

      setLogs(list || []);

      const serverBalance =
        (payload && (payload.coinBalance ?? payload.balance ?? payload.balanceAfter)) ||
        (list[0] && (list[0].balanceAfter ?? list[0].coinBalance));
      if (typeof serverBalance !== "undefined" && serverBalance !== null) {
        setBalance(Number(serverBalance));
      } else {
        const comp = list.reduce((acc, t) => {
          const amt = Number(t.amount || 0);
          if (!isFinite(amt)) return acc;
          return String(t.action || "").toLowerCase() === "debit" ? acc - amt : acc + amt;
        }, 0);
        setBalance(comp);
      }
    } catch (err) {
      console.error("getCoinTransactions error:", err);
      showCustomToast("Failed to load coin transactions");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async () => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      showCustomToast("Enter a valid amount!");
      return;
    }
    if (!userId || !userType) {
      showCustomToast("User not selected");
      return;
    }

    setSaving(true);
    try {
      const action = activeTab === "add" ? "credit" : "debit";
      const payloadMsg = message || (action === "credit" ? "Coin Balance Added!!" : "Coin Balance Debited!!");

      const res = await operateCoinBalance({ userType, userId, action, amount: numericAmount, message: payloadMsg });

      const success = res?.success ?? (res?.data ? true : false);
      if (success) {
        const newBal = res?.data?.coinBalance ?? res?.data?.balanceAfter ?? res?.coinBalance ?? null;
        if (newBal != null) setBalance(Number(newBal));

        showCustomToast(`${action === "credit" ? "Added" : "Subtracted"} ${numericAmount} coins successfully!`);
        await loadTransactions();
      } else {
        showCustomToast(res?.message || "Coin operation failed");
      }
    } catch (err) {
      console.error("operateCoinBalance error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Operation failed";
      showCustomToast(errMsg);
    } finally {
      setSaving(false);
      setAmount("");
      setMessage("");
    }
  };

  // Handlers for parent
  const onQueryImmediate = (val) => {
    setQuery(val);
  };

  const onQueryDebounced = (val) => {
    setDebouncedQuery(val);
    const since = Date.now() - (lastUserPageActionRef.current || 0);
    if (since > RECENT_MS) {
      setCurrentPage(1);
    } else {
      console.debug("Skipping reset-to-1 due to recent user page action", { since });
    }
  };

  const onItemsPerPageChange = (v) => {
    setItemsPerPage(v);
    setCurrentPage(1);
  };

  const onPagerChange = (p) => {
    lastUserPageActionRef.current = Date.now();
    setCurrentPage(p);
  };

  // filtered & pagination derived
  const filtered = useMemo(() => {
    if (!debouncedQuery) return logs;
    const q = String(debouncedQuery).toLowerCase();
    return logs.filter((r) => {
      const fields = [
        r.message,
        r.action,
        r._id,
        r.amount,
        r.dateLabel,
        r.createdAt,
        r.dateISO,
      ].map((v) => (v == null ? "" : String(v).toLowerCase()));
      return fields.some((f) => f.includes(q));
    });
  }, [logs, debouncedQuery]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  useEffect(() => {
    if (totalPages <= 1) {
      setCurrentPage((prev) => (prev === 1 ? prev : 1));
      return;
    }
    setCurrentPage((prev) => (prev > totalPages ? totalPages : prev));
  }, [totalPages]);

  const visibleRows = useMemo(() => {
    const s = (currentPage - 1) * itemsPerPage;
    return filtered.slice(s, s + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const startDisplay = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endDisplay = Math.min(totalItems, currentPage * itemsPerPage);

  return (
    <div className={styles.container}>
      <ToastContainerCustom />

      <h2 className={styles.pageTitle}>Coin Management</h2>

      <div className={styles.card}>
        <div className={styles.headerRow}>
          <div className={styles.tabs}>
            <button className={`${styles.tabBtn} ${activeTab === "add" ? styles.active : ""}`} onClick={() => setActiveTab("add")} type="button">
              <FaPlus /> Add Coins
            </button>
            <button className={`${styles.tabBtn} ${activeTab === "subtract" ? styles.active : ""}`} onClick={() => setActiveTab("subtract")} type="button">
              <FaMinus /> Subtract Coins
            </button>
          </div>

          <div className={styles.balanceBadge}>Coin Balance: {balance} 🪙</div>
        </div>

        <div className={styles.inputGroup}>
          <label>Enter Coins</label>
          <input type="number" placeholder="Enter Coins" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="1" disabled={saving} />
        </div>

        <div className={styles.inputGroup}>
          <label>Message (optional)</label>
          <input type="text" placeholder="Message (optional)" value={message} onChange={(e) => setMessage(e.target.value)} disabled={saving} />
        </div>

        <button className={`${styles.actionBtn} ${activeTab === "add" ? styles.addBtn : styles.subtractBtn}`} onClick={handleSubmit} disabled={saving} type="button">
          <FaCoins /> {saving ? "Processing..." : activeTab === "add" ? "Add Coin Balance" : "Subtract Coin Balance"}
        </button>
      </div>

      <h3 className={styles.logTitle}>Coin Log</h3>
      <div className={styles.logCard}>
        <TableControls
          idPrefix="coin"
          query={query}
          onQueryImmediate={onQueryImmediate}
          onQueryDebounced={onQueryDebounced}
          debounceDelay={300}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={onItemsPerPageChange}
          itemsPerPageOptions={itemsPerPageOptions}
          placeholder="Search here..."
        />

        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>Sr No.</th>
                <th>Amount</th>
                <th>Message</th>
                <th>Type</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className={styles.emptyRow}>Loading…</td></tr>
              ) : visibleRows.length === 0 ? (
                <tr><td colSpan="5" className={styles.emptyRow}>No data available</td></tr>
              ) : (
                visibleRows.map((row, idx) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isDebit = String(row.action || "").toLowerCase() === "debit";
                  const amtText = `${isDebit ? "-" : "+"}${row.amount}`;
                  const dateLabel = row.createdAt ? new Date(row.createdAt).toLocaleString() : (row.dateLabel || row.dateISO ? new Date(row.dateISO).toLocaleString() : "");
                  return (
                    <tr key={row._id || globalIndex} className={isDebit ? styles.rowDebit : styles.rowCredit}>
                      <td>{globalIndex}</td>
                      <td className={isDebit ? styles.debitCell : styles.creditCell}>{amtText}</td>
                      <td>{row.message || "-"}</td>
                      <td>{row.action || "-"}</td>
                      <td>{dateLabel}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.infoText}>Showing {startDisplay} to {endDisplay} of {totalItems} entries</div>

          <FancyPager
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => {
              lastUserPageActionRef.current = Date.now();
              setCurrentPage(p);
            }}
            showPrevNext={true}
            maxButtons={3}
          />
        </div>
      </div>
    </div>
  );
}

