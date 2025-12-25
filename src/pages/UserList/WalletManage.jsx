// src/pages/WalletManage/WalletManage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./WalletManage.module.css";
import { FaPlus, FaMinus, FaWallet } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { showCustomToast, ToastContainerCustom } from "../../components/CustomToast/CustomToast";
import { operateWalletBalance, getWalletTransactions } from "../../services/walletService";

import TableControls from "../../components/TableControls/TableControls";
import FancyPager from "../../components/FancyPager/FancyPager";

export default function WalletManage() {
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

  // pagination & search
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const itemsPerPageOptions = [5, 10, 25, 50];

  // guard - timestamp of last user-initiated page change (pager click)
  const lastUserPageActionRef = useRef(0);
  const RECENT_MS = 600; // if a user action happened within this ms, don't auto-reset page

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function loadTransactions() {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await getWalletTransactions({ userType, userId });
      const payload = res?.data ?? res;
      const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : payload?.data ?? [];
      setLogs(list || []);

      const serverBalance =
        (payload && (payload.walletBalance ?? payload.balance ?? payload.balanceAfter)) ||
        (list[0] && (list[0].balanceAfter ?? list[0].walletBalance));
      if (typeof serverBalance !== "undefined" && serverBalance !== null) {
        setBalance(Number(serverBalance));
      } else {
        const comp = list.reduce((acc, t) => {
          const amt = Number(t.amount || 0);
          if (!isFinite(amt)) return acc;
          const a = String(t.action || "").toLowerCase();
          return a === "debit" ? acc - amt : acc + amt;
        }, 0);
        setBalance(comp);
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
      showCustomToast("Failed to load wallet transactions");
    } finally {
      setLoading(false);
    }
  }

  // Filter by debouncedQuery (message, action, id, amount, date)
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
      ].map((v) => (v == null ? "" : String(v).toLowerCase()));
      return fields.some((f) => f.includes(q));
    });
  }, [logs, debouncedQuery]);

  // Pagination derived values
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Safe clamp (prevents jump-to-1 when totalPages temporarily small)
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

  const handleSubmit = async () => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      showCustomToast("Enter a valid amount");
      return;
    }
    if (!userId) {
      showCustomToast("User not selected");
      return;
    }
    setSaving(true);
    try {
      const action = activeTab === "add" ? "credit" : "debit";
      const payloadMsg = message || (action === "credit" ? "Wallet Balance Added!!" : "Wallet Balance Substract!!");
      const res = await operateWalletBalance({ userType, userId, action, amount: numericAmount, message: payloadMsg });
      const ok = res?.success ?? Boolean(res?.data);
      if (ok) {
        showCustomToast(`${action === "credit" ? "Added" : "Subtracted"} ₹${numericAmount}`);
        setAmount("");
        setMessage("");
        await loadTransactions();
      } else {
        showCustomToast(res?.message || "Operation failed");
      }
    } catch (err) {
      console.error("Operate wallet error:", err);
      showCustomToast(err?.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  // displayed range
  const startDisplay = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endDisplay = Math.min(totalItems, currentPage * itemsPerPage);

  // Handlers passed to TableControls:
  // - onQueryImmediate: keep immediate state in sync (no page reset here)
  // - onQueryDebounced: user typed -> update debouncedQuery and reset page to 1,
  //    BUT only reset if user hasn't just pressed pager (guarded)
  const onQueryImmediate = (val) => {
    setQuery(val);
  };

  const onQueryDebounced = (val) => {
    setDebouncedQuery(val);
    // Only reset to page 1 if last user page action wasn't very recent
    const since = Date.now() - (lastUserPageActionRef.current || 0);
    if (since > RECENT_MS) {
      setCurrentPage(1);
    } else {
      // skip resetting because user just clicked the pager
      // (helps avoid race where pager -> next, and debounced search resets to 1)
      console.debug("Skipping reset-to-1 due to recent user page action", { since });
    }
  };

  const onItemsPerPageChange = (v) => {
    setItemsPerPage(v);
    // user changed items-per-page intentionally -> reset page to 1
    // But if user had just clicked pager, still it's reasonable to reset.
    setCurrentPage(1);
  };

  // FancyPager onPageChange -> mark lastUserPageActionRef to avoid race
  const onPagerChange = (p) => {
    lastUserPageActionRef.current = Date.now();
    setCurrentPage(p);
  };

  return (
    <div className={styles.container}>
      <ToastContainerCustom />

      <h2 className={styles.pageTitle}>Wallet Management</h2>

      <div className={styles.card}>
        <div className={styles.headerRow}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tabBtn} ${activeTab === "add" ? styles.active : ""}`}
              onClick={() => setActiveTab("add")}
              type="button"
            >
              <FaPlus /> Add Balance
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === "subtract" ? styles.active : ""}`}
              onClick={() => setActiveTab("subtract")}
              type="button"
            >
              <FaMinus /> Subtract Balance
            </button>
          </div>

          <div className={styles.balanceBadge}>Wallet Balance: ₹{balance}</div>
        </div>

        <div className={styles.inputGroup}>
          <label>Enter Amount</label>
          <input
            type="number"
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="any"
            disabled={saving}
          />
        </div>

        <div className={styles.inputRow}>
          <div className={styles.inputCol}>
            <label>Message (optional)</label>
            <input
              type="text"
              placeholder="Enter message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={saving}
            />
          </div>
        </div>

        <div className={styles.actionsRow}>
          <button
            className={`${styles.actionBtn} ${activeTab === "add" ? styles.addBtn : styles.subtractBtn}`}
            onClick={handleSubmit}
            disabled={saving}
            type="button"
          >
            <FaWallet /> {saving ? "Processing..." : activeTab === "add" ? "Add Wallet Balance" : "Subtract Wallet Balance"}
          </button>
        </div>
      </div>

      {/* WALLET LOG */}
      <h3 className={styles.logTitle}>Wallet Log</h3>

      <div className={styles.logCard}>
        <TableControls
          idPrefix="wallet"
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
          <table className={styles.table}>
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
              {loading ? (
                <tr><td colSpan="5" className={styles.emptyRow}>Loading…</td></tr>
              ) : visibleRows.length === 0 ? (
                <tr><td colSpan="5" className={styles.emptyRow}>No data available in table</td></tr>
              ) : (
                visibleRows.map((row, idx) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isDebit = String(row.action || "").toLowerCase() === "debit";
                  const amtText = `${isDebit ? "-" : ""}₹${row.amount}`;
                  const dateText = row.createdAt ? new Date(row.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : (row.dateLabel || row.dateISO || "");
                  return (
                    <tr key={row._id || globalIndex} className={isDebit ? styles.rowDebit : styles.rowCredit}>
                      <td className={styles.cell}>{globalIndex}</td>
                      <td className={`${styles.cell} ${isDebit ? styles.debitCell : styles.creditCell}`}>{amtText}</td>
                      <td className={styles.cell}>{row.message || "-"}</td>
                      <td className={styles.cell}>{row.action || "-"}</td>
                      <td className={styles.cell}>{dateText}</td>
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
            onPageChange={onPagerChange}
            showPrevNext={true}
            maxButtons={3}
          />
        </div>
      </div>
    </div>
  );
}