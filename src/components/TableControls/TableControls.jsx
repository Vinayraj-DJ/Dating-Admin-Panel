// src/components/TableControls/TableControls.jsx
import React, { useEffect, useRef, useState } from "react";
import styles from "./TableControls.module.css";
import { IoSearch } from "react-icons/io5";

export default function TableControls({
  query = "",
  onQueryImmediate,
  onQueryDebounced,
  debounceDelay = 300,
  itemsPerPage,
  setItemsPerPage,
  itemsPerPageOptions = [5, 10, 25, 50],
  idPrefix = "tc",
  placeholder = "Search here..."
}) {
  // local input state
  const [local, setLocal] = useState(String(query || ""));

  // refs to avoid calling callbacks on initial mount
  const mountedRef = useRef(false);
  const prevLocalRef = useRef(local);

  // keep local in sync when parent updates query programmatically
  useEffect(() => {
    // if parent changed externally, update local
    setLocal(String(query || ""));
  }, [query]);

  // call immediate callback only when local actually changes
  useEffect(() => {
    if (typeof onQueryImmediate !== "function") return;
    if (prevLocalRef.current !== local) {
      onQueryImmediate(local);
      prevLocalRef.current = local;
    }
    // note: we intentionally don't call onQueryImmediate on mount if same value
  }, [local, onQueryImmediate]);

  // debounced callback: do NOT call on first mount (avoids unwanted reset)
  useEffect(() => {
    if (typeof onQueryDebounced !== "function") return;

    if (!mountedRef.current) {
      mountedRef.current = true;
      // don't fire debounced callback on first render
      return;
    }

    const id = setTimeout(() => {
      onQueryDebounced(String(local || "").trim());
    }, debounceDelay);

    return () => clearTimeout(id);
  }, [local, onQueryDebounced, debounceDelay]);

  return (
    <div className={styles.controlsRow} role="region" aria-label="Table controls">
      <div className={styles.leftControls}>
        <label className={styles.showLabel} htmlFor={`${idPrefix}-ipp`}>Show</label>
        <select
          id={`${idPrefix}-ipp`}
          className={styles.itemsPerPageSelect}
          value={itemsPerPage}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (typeof setItemsPerPage === "function") setItemsPerPage(v);
          }}
          aria-label="Items per page"
        >
          {itemsPerPageOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <span className={styles.entriesText}>entries</span>
      </div>

      <div className={styles.rightControls}>
        <div className={styles.searchBox} role="search" aria-label="Table search">
          <IoSearch className={styles.searchIcon} aria-hidden />
          <input
            className={styles.searchInput}
            placeholder={placeholder}
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            aria-label="Search"
            // autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
