// src/pages/Interest/ListInterest.jsx
import React, { useEffect, useMemo, useState } from "react";
import styles from "./ListInterest.module.css";
import SearchBar from "../../components/SearchBar/SearchBar";
import DynamicTable from "../../components/DynamicTable/DynamicTable";
import PaginationTable from "../../components/PaginationTable/PaginationTable";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import {
  getAllInterests,
  deleteInterest,
} from "../../services/interestService";
import { API_BASE } from "../../config/apiConfig";

const fixIconUrl = (icon) =>
  !icon
    ? ""
    : /^https?:\/\//i.test(icon)
    ? icon
    : `${API_BASE}/${String(icon).replace(/^\/+/, "")}`;

export default function ListInterest() {
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [highlight, setHighlight] = useState({}); // {id: {name:true, status:true, icon:true}}
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // StrictMode-safe initial load (ignore abort/cancel)
  useEffect(() => {
    const ctrl = new AbortController();
    let active = true;

    setLoading(true);
    setErr("");

    getAllInterests({ signal: ctrl.signal })
      .then((res) => {
        if (!active) return;
        setItems(Array.isArray(res?.data) ? res.data : []);
      })
      .catch((e) => {
        if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;
        if (!active) return;
        setErr(e?.response?.data?.message || e?.message || "Failed to load");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      ctrl.abort();
    };
  }, []);

  // ✅ apply partial patch when coming back from edit
  useEffect(() => {
    const upd = location.state?.updated;
    if (!upd?.id) return;

    setItems((prev) =>
      prev.map((it) => {
        if (it._id !== upd.id) return it;
        const next = { ...it };
        const cellFlags = {};
        if (typeof upd.name !== "undefined" && upd.name !== it.name) {
          next.name = upd.name;
          cellFlags.name = true;
        }
        if (typeof upd.status !== "undefined" && upd.status !== it.status) {
          next.status = upd.status;
          cellFlags.status = true;
        }
        if (typeof upd.icon !== "undefined" && upd.icon) {
          next.icon = upd.icon; // server path
          cellFlags.icon = true;
        }
        if (Object.keys(cellFlags).length) {
          setHighlight((h) => ({ ...h, [upd.id]: cellFlags }));
          // remove highlight after 1.2s
          setTimeout(() => {
            setHighlight((h) => {
              const { [upd.id]: _drop, ...rest } = h;
              return rest;
            });
          }, 1200);
        }
        return next;
      })
    );

    // clear history state so refresh doesn't re-apply
    navigate(".", { replace: true, state: {} });
  }, [location.state, navigate]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      String(it.name || "")
        .toLowerCase()
        .includes(q)
    );
  }, [items, searchTerm]);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(startIdx, startIdx + itemsPerPage);

  const doDelete = async (row) => {
    if (!window.confirm(`Delete "${row.name}"?`)) return;
    try {
      await deleteInterest({ id: row._id });
      setItems((prev) => prev.filter((i) => i._id !== row._id));
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Delete failed");
    }
  };

  const headings = useMemo(
    () => [
      { title: "Sr No.", accessor: "sr" },
      { title: "Interest Image", accessor: "image" },
      { title: "Interest Title", accessor: "title" },
      { title: "Interest Status", accessor: "status" },
      { title: "Action", accessor: "action" },
    ],
    []
  );

  const columnData = useMemo(
    () =>
      currentData.map((it, i) => {
        const url = fixIconUrl(it.icon);
        const hl = highlight[it._id] || {};
        return {
          sr: startIdx + i + 1,
          image: url ? (
            <img
              src={url}
              alt={it.name || "interest"}
              width={50}
              height={50}
              className={hl.icon ? styles.flash : ""}
              style={{ objectFit: "cover", borderRadius: 8 }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div
              className={`${styles.placeholderImg} ${
                hl.icon ? styles.flash : ""
              }`}
            >
              —
            </div>
          ),
          title: (
            <span className={hl.name ? styles.flash : ""}>
              {it.name || "-"}
            </span>
          ),
          status: (
            <span
              className={`${
                (it.status || "").toLowerCase() === "publish"
                  ? styles.publishBadge
                  : styles.unpublishBadge
              } ${hl.status ? styles.flash : ""}`}
            >
              {it.status || "Unpublish"}
            </span>
          ),
          action: (
            <div className={styles.actions}>
              <FaEdit
                className={styles.editIcon}
                title="Edit"
                onClick={() => navigate(`/interest/editinterest/${it._id}`)}
              />
              <FaTrash
                className={styles.deleteIcon}
                title="Delete"
                onClick={() => doDelete(it)}
              />
            </div>
          ),
        };
      }),
    [currentData, navigate, startIdx, highlight]
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Interest List Management</h2>
      <div className={styles.tableCard}>
        <div className={styles.searchWrapper}>
          <SearchBar
            placeholder="Search Interests..."
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {loading ? (
          <div className={styles.loading}>Loading…</div>
        ) : err ? (
          <div className={styles.error}>{err}</div>
        ) : (
          <>
            <DynamicTable
              headings={headings}
              columnData={columnData}
              noDataMessage="No interest found."
            />
            <PaginationTable
              data={filtered}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              setCurrentPage={setCurrentPage}
              setItemsPerPage={setItemsPerPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
