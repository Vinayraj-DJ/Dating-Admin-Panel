import React, { useEffect, useMemo, useState } from "react";
import styles from "./ListPage.module.css";
import SearchBar from "../../components/SearchBar/SearchBar";
import DynamicTable from "../../components/DynamicTable/DynamicTable";
import PaginationTable from "../../components/PaginationTable/PaginationTable";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getAllPages, deletePage } from "../../services/pageService";

export default function ListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [highlight, setHighlight] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load
  useEffect(() => {
    const ctrl = new AbortController();
    let active = true;

    setLoading(true);
    setErr("");

    getAllPages({ signal: ctrl.signal })
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

  // apply in-place patch after edit
  useEffect(() => {
    const upd = location.state?.updated;
    if (!upd?.id) return;

    setItems((prev) =>
      prev.map((p) => {
        if (p._id !== upd.id) return p;
        const next = { ...p };
        const flags = {};
        if (typeof upd.title !== "undefined" && upd.title !== p.title) {
          next.title = upd.title;
          flags.title = true;
        }
        if (typeof upd.status !== "undefined" && upd.status !== p.status) {
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

    navigate(".", { replace: true, state: {} });
  }, [location.state, navigate]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) =>
      String(p.title || "")
        .toLowerCase()
        .includes(q)
    );
  }, [items, searchTerm]);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(startIdx, startIdx + itemsPerPage);

  const doDelete = async (row) => {
    if (!window.confirm(`Delete page "${row.title}"?`)) return;
    try {
      await deletePage({ id: row._id });
      setItems((prev) => prev.filter((i) => i._id !== row._id));
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Delete failed");
    }
  };

  const headings = useMemo(
    () => [
      { title: "Sr No.", accessor: "sr" },
      { title: "Page Name", accessor: "title" },
      { title: "Page Status", accessor: "status" },
      { title: "Action", accessor: "action" },
    ],
    []
  );

  const columnData = useMemo(
    () =>
      currentData.map((it, i) => {
        const hl = highlight[it._id] || {};
        const published = String(it.status || "").toLowerCase() === "publish";
        return {
          sr: startIdx + i + 1,
          title: (
            <span className={hl.title ? styles.flash : ""}>
              {it.title || "-"}
            </span>
          ),
          status: (
            <span
              className={`${
                published ? styles.publishBadge : styles.unpublishBadge
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
                onClick={() => navigate(`/page/editpage/${it._id}`)}
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
      <h2 className={styles.heading}>Page List Management</h2>

      <div className={styles.tableCard}>
        <div className={styles.searchWrapper}>
          <SearchBar
            placeholder="Search pages..."
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
              noDataMessage="No pages found."
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
