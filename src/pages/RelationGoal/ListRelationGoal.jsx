// src/pages/RelationGoal/ListRelationGoal.jsx
import React, { useEffect, useMemo, useState } from "react";
import styles from "./ListRelationGoal.module.css";
import SearchBar from "../../components/SearchBar/SearchBar";
import DynamicTable from "../../components/DynamicTable/DynamicTable";
import PaginationTable from "../../components/PaginationTable/PaginationTable";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import {
  getAllRelationGoals,
  deleteRelationGoal,
} from "../../services/relationGoalService";

export default function ListRelationGoal() {
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [highlight, setHighlight] = useState({}); // {id:{title,subtitle,status}}
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
    getAllRelationGoals({ signal: ctrl.signal })
      .then((res) => {
        if (!active) return;
        setItems(Array.isArray(res?.data) ? res.data : []);
      })
      .catch((e) => {
        if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;
        if (!active) return;
        setErr(e?.response?.data?.message || e?.message || "Failed to load");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
      ctrl.abort();
    };
  }, []);

  // apply in-place patch coming back from edit
  useEffect(() => {
    const upd = location.state?.updated;
    if (!upd?.id) return;

    setItems((prev) =>
      prev.map((it) => {
        if (it._id !== upd.id) return it;
        const next = { ...it };
        const flags = {};
        if ("title" in upd && upd.title !== it.title) {
          next.title = upd.title;
          flags.title = true;
        }
        if ("subtitle" in upd && upd.subtitle !== (it.subTitle ?? it.subtitle)) {
          // update the front-end-friendly `subtitle` by storing as `subTitle` if backend uses that
          // keep representation consistent: prefer existing key if backend sent subTitle
          if (typeof it.subTitle !== "undefined") next.subTitle = upd.subtitle;
          else next.subtitle = upd.subtitle;
          flags.subtitle = true;
        }
        if ("status" in upd && upd.status !== it.status) {
          next.status = upd.status;
          flags.status = true;
        }
        if (Object.keys(flags).length) {
          setHighlight((h) => ({ ...h, [upd.id]: flags }));
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

    // clear state so refresh doesn't re-apply
    navigate(".", { replace: true, state: {} });
  }, [location.state, navigate]);

  const headings = useMemo(
    () => [
      { title: "Sr No.", accessor: "sr" },
      { title: "Relation Goal Title", accessor: "title" },
      { title: "Relation Goal Subtitle", accessor: "subtitle" },
      { title: "Relation Goal Status", accessor: "status" },
      { title: "Action", accessor: "action" },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        String(it.title || "")
          .toLowerCase()
          .includes(q) ||
        String(it.subTitle ?? it.subtitle ?? "")
          .toLowerCase()
          .includes(q)
    );
  }, [items, searchTerm]);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(startIdx, startIdx + itemsPerPage);

  const doDelete = async (row) => {
    if (!window.confirm(`Delete relation goal "${row.title}"?`)) return;
    try {
      await deleteRelationGoal({ id: row._id });
      setItems((prev) => prev.filter((i) => i._id !== row._id));
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Delete failed");
    }
  };

  const columnData = useMemo(
    () =>
      currentData.map((it, i) => {
        const hl = highlight[it._id] || {};
        return {
          sr: startIdx + i + 1,
          title: (
            <span className={hl.title ? styles.flash : ""}>{it.title}</span>
          ),
          subtitle: (
            <span className={hl.subtitle ? styles.flash : ""}>
              { (it.subTitle ?? it.subtitle) || "-" }
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
                onClick={() => navigate(`/relation/editrelationgoal/${it._id}`)}
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
    [currentData, startIdx, highlight, navigate]
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Relation Goal List Management</h2>

      <div className={styles.tableCard}>
        <div className={styles.searchWrapper}>
          <SearchBar
            placeholder="Search Relation Goals..."
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
              noDataMessage="No relation goals found."
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
