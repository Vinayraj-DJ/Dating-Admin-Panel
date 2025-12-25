


// src/pages/Staff/ListStaff.jsx
import React, { useEffect, useMemo, useState } from "react";
import styles from "./ListStaff.module.css";
import SearchBar from "../../components/SearchBar/SearchBar";
import DynamicTable from "../../components/DynamicTable/DynamicTable";
import PaginationTable from "../../components/PaginationTable/PaginationTable";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getAllStaff, deleteStaff } from "../../services/staffService";

const ListStaff = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const ctrl = new AbortController();
    let active = true;

    setLoading(true);
    setErr("");

    getAllStaff({ signal: ctrl.signal })
      .then((res) => {
        if (!active) return;
        // API might return:
        // 1) { success: true, data: [...] }
        // 2) { data: [...] }
        // 3) [...]
        // 4) res.data already equals { success, data } because service returned res.data
        const payload = res ?? {};
        // prefer payload.data if array, else try res.data (nested), else try res itself if array
        let arr = [];
        if (Array.isArray(payload)) arr = payload;
        else if (Array.isArray(payload.data)) arr = payload.data;
        else if (Array.isArray(payload?.data?.data)) arr = payload.data.data;
        else arr = [];

        setItems(arr);
      })
      .catch((e) => {
        // ignore abort/cancel errors (these aren't real failures)
        if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") {
          return;
        }
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

  const headings = [
    { title: "Sr No.", accessor: "sr" },
    { title: "Email", accessor: "email" },
    { title: "Password", accessor: "password" },
    { title: "Staff Status", accessor: "status" },
    { title: "Action", accessor: "action" },
  ];

  const filtered = useMemo(() => {
    const q = String(searchTerm || "").trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      String(item.email || "").toLowerCase().includes(q)
    );
  }, [items, searchTerm]);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(startIdx, startIdx + itemsPerPage);

  const onDelete = async (row) => {
    if (!window.confirm(`Delete staff ${row.email}?`)) return;
    try {
      await deleteStaff({ id: row._id || row.id });
      setItems((prev) => prev.filter((i) => (i._id || i.id) !== (row._id || row.id)));
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Delete failed");
    }
  };

  const columnData = currentData.map((item, index) => ({
    sr: startIdx + index + 1,
    email: item.email || "-",
    password: "••••••••",
    status: <span className={styles.publishBadge}>{item.status || "-"}</span>,
    action: (
      <div className={styles.actions}>
        <FaEdit
          className={styles.editIcon}
          onClick={() => navigate(`/staff/editstaff/${item._id || item.id}`)}
        />
        <FaTrash className={styles.deleteIcon} onClick={() => onDelete(item)} />
      </div>
    ),
  }));

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Staff List Management</h2>

      <div className={styles.tableCard}>
        <div className={styles.searchWrapper}>
          <SearchBar
            placeholder="Search..."
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className={styles.tableWrapper}>
          {loading ? (
            <div className={styles.loading}>Loading…</div>
          ) : err ? (
            <div className={styles.error}>{err}</div>
          ) : (
            <DynamicTable
              headings={headings}
              columnData={columnData}
              noDataMessage="No staff found."
            />
          )}
        </div>

        <PaginationTable
          data={filtered}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
        />
      </div>
    </div>
  );
};

export default ListStaff;
