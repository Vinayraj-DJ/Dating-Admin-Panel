// src/pages/FAQ/ListFaq.jsx
import React, { useEffect, useMemo, useState } from "react";
import styles from "./ListFaq.module.css";
import SearchBar from "../../components/SearchBar/SearchBar";
import DynamicTable from "../../components/DynamicTable/DynamicTable";
import PaginationTable from "../../components/PaginationTable/PaginationTable";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getAllFaqs, deleteFaq } from "../../services/faqService";

export default function ListFaq() {
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [highlight, setHighlight] = useState({}); // {id:{question,answer,status}}
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load all FAQs
  useEffect(() => {
    const ctrl = new AbortController();
    let active = true;

    setLoading(true);
    setErr("");

    getAllFaqs({ signal: ctrl.signal })
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

  // Apply partial patch after edit
  useEffect(() => {
    const upd = location.state?.updated;
    if (!upd?.id) return;

    setItems((prev) =>
      prev.map((it) => {
        if (it._id !== upd.id) return it;
        const next = { ...it };
        const flags = {};
        if (
          typeof upd.question !== "undefined" &&
          upd.question !== it.question
        ) {
          next.question = upd.question;
          flags.question = true;
        }
        if (typeof upd.answer !== "undefined" && upd.answer !== it.answer) {
          next.answer = upd.answer;
          flags.answer = true;
        }
        if (typeof upd.status !== "undefined" && upd.status !== it.status) {
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

    // Clear state so refresh doesn't re-apply
    navigate(".", { replace: true, state: {} });
  }, [location.state, navigate]);

  // Search in question or answer
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const a = String(it.answer || "").toLowerCase();
      const b = String(it.question || "").toLowerCase();
      return a.includes(q) || b.includes(q);
    });
  }, [items, searchTerm]);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(startIdx, startIdx + itemsPerPage);

  const doDelete = async (row) => {
    if (!window.confirm(`Delete FAQ: "${row.question}"?`)) return;
    try {
      await deleteFaq({ id: row._id });
      setItems((prev) => prev.filter((i) => i._id !== row._id));
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Delete failed");
    }
  };

  const headings = useMemo(
    () => [
      { title: "Sr No.", accessor: "sr" },
      { title: "Question", accessor: "question" },
      { title: "Answer", accessor: "answer" },
      { title: "FAQ Status", accessor: "status" },
      { title: "Action", accessor: "action" },
    ],
    []
  );

  const columnData = useMemo(
    () =>
      currentData.map((it, i) => {
        const hl = highlight[it._id] || {};
        return {
          sr: startIdx + i + 1,
          question: (
            <span className={hl.question ? styles.flash : ""}>
              {it.question || "-"}
            </span>
          ),
          answer: (
            <span className={hl.answer ? styles.flash : ""}>
              {it.answer || "-"}
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
                onClick={() => navigate(`/faq/editfaq/${it._id}`)}
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
      <h2 className={styles.heading}>FAQ List Management</h2>

      <div className={styles.tableCard}>
        <div className={styles.searchWrapper}>
          <SearchBar
            placeholder="Search FAQ…"
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
              noDataMessage="No FAQs found."
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
