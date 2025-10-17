// src/pages/Plan/ListPlan.jsx
import React, { useEffect, useMemo, useState } from "react";
import styles from "./ListPlan.module.css";
import SearchBar from "../../components/SearchBar/SearchBar";
import DynamicTable from "../../components/DynamicTable/DynamicTable";
import PaginationTable from "../../components/PaginationTable/PaginationTable";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getAllPlans, deletePlan } from "../../services/planService";

export default function ListPlan() {
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [highlight, setHighlight] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // load
  useEffect(() => {
    const ctrl = new AbortController();
    let active = true;
    setLoading(true);
    setErr("");
    getAllPlans({ signal: ctrl.signal })
      .then(
        (res) => active && setItems(Array.isArray(res?.data) ? res.data : [])
      )
      .catch((e) => {
        if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;
        if (active)
          setErr(e?.response?.data?.message || e?.message || "Failed to load");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
      ctrl.abort();
    };
  }, []);

  // patch after edit
  useEffect(() => {
    const upd = location.state?.updated;
    if (!upd?.id) return;

    setItems((prev) =>
      prev.map((it) => {
        if (it._id !== upd.id) return it;
        const next = { ...it };
        const f = {};
        for (const k of [
          "title",
          "amount",
          "dayLimit",
          "description",
          "filterInclude",
          "audioVideo",
          "directChat",
          "chat",
          "likeMenu",
          "status",
        ]) {
          if (typeof upd[k] !== "undefined" && upd[k] !== it[k]) {
            next[k] = upd[k];
            f[k] = true;
          }
        }
        if (Object.keys(f).length) {
          setHighlight((h) => ({ ...h, [upd.id]: f }));
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

    navigate(".", { replace: true, state: {} });
  }, [location.state, navigate]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        String(it.title || "")
          .toLowerCase()
          .includes(q) ||
        String(it.amount || "")
          .toLowerCase()
          .includes(q)
    );
  }, [items, searchTerm]);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(startIdx, startIdx + itemsPerPage);

  const doDelete = async (row) => {
    if (!window.confirm(`Delete plan "${row.title}"?`)) return;
    try {
      await deletePlan({ id: row._id });
      setItems((prev) => prev.filter((i) => i._id !== row._id));
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Delete failed");
    }
  };

  const headings = useMemo(
    () => [
      { title: "Sr No.", accessor: "sr" },
      { title: "Plan Title", accessor: "title" },
      { title: "Plan Amount", accessor: "amount" },
      { title: "Day Limit", accessor: "dayLimit" },
      { title: "Filter Include ?", accessor: "filterInclude" },
      { title: "Direct Chat ?", accessor: "directChat" },
      { title: "Chat ?", accessor: "chat" },
      { title: "Like Menu ?", accessor: "likeMenu" },
      { title: "Audio Video ?", accessor: "audioVideo" },
      { title: "Plan Status", accessor: "status" },
      { title: "Action", accessor: "action" },
    ],
    []
  );

  const yesNo = (v) => (v ? "Yes" : "No");

  const columnData = useMemo(
    () =>
      currentData.map((it, i) => {
        const hl = highlight[it._id] || {};
        return {
          sr: startIdx + i + 1,
          title: (
            <span className={hl.title ? styles.flash : ""}>
              {it.title || "-"}
            </span>
          ),
          amount: (
            <span className={hl.amount ? styles.flash : ""}>
              {it.amount || "-"}
            </span>
          ),
          dayLimit: (
            <span className={hl.dayLimit ? styles.flash : ""}>
              {it.dayLimit || "-"}
            </span>
          ),
          filterInclude: (
            <span className={hl.filterInclude ? styles.flash : ""}>
              {yesNo(it.filterInclude)}
            </span>
          ),
          directChat: (
            <span className={hl.directChat ? styles.flash : ""}>
              {yesNo(it.directChat)}
            </span>
          ),
          chat: (
            <span className={hl.chat ? styles.flash : ""}>
              {yesNo(it.chat)}
            </span>
          ),
          likeMenu: (
            <span className={hl.likeMenu ? styles.flash : ""}>
              {yesNo(it.likeMenu)}
            </span>
          ),
          audioVideo: (
            <span className={hl.audioVideo ? styles.flash : ""}>
              {yesNo(it.audioVideo)}
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
              {it.status || "UnPublish"}
            </span>
          ),
          action: (
            <div className={styles.actions}>
              <FaEdit
                className={styles.editIcon}
                title="Edit"
                onClick={() => navigate(`/plan/editplan/${it._id}`)}
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
      <h2 className={styles.heading}>Plan List Management</h2>
      <div className={styles.tableCard}>
        <div className={styles.searchWrapper}>
          <SearchBar
            placeholder="Search Plans..."
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
              noDataMessage="No plans found."
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
