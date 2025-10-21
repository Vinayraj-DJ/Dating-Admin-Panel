import React, { useEffect, useMemo, useState } from "react";
import styles from "./ListPackage.module.css";
import SearchBar from "../../components/SearchBar/SearchBar";
import DynamicTable from "../../components/DynamicTable/DynamicTable";
import PaginationTable from "../../components/PaginationTable/PaginationTable";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getAllPackages, deletePackage } from "../../services/packageService";

export default function ListPackage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [highlight, setHighlight] = useState({}); // {id:{totalCoin,amount,status}}
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load packages
  useEffect(() => {
    const ctrl = new AbortController();
    let active = true;
    setLoading(true);
    setErr("");
    getAllPackages({ signal: ctrl.signal })
      .then((res) => {
        if (!active) return;
        const raw = Array.isArray(res?.data) ? res.data : [];
        // Normalize coin -> totalCoin so UI code can always use totalCoin
        const normalized = raw.map((it) => ({
          ...it,
          totalCoin:
            typeof it.totalCoin !== "undefined" && it.totalCoin !== null
              ? it.totalCoin
              : it.coin ?? "",
          // For safety also ensure amount is present as string/number
          amount:
            typeof it.amount !== "undefined" && it.amount !== null
              ? it.amount
              : it.amount === 0
              ? 0
              : "",
        }));
        setItems(normalized);
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

  // Patch row in-place after edit
  useEffect(() => {
    const upd = location.state?.updated;
    if (!upd?.id) return;

    setItems((prev) =>
      prev.map((it) => {
        if (it._id !== upd.id) return it;
        const next = { ...it };
        const flags = {};
        // Accept both upd.totalCoin and upd.coin for robustness
        if (
          typeof upd.totalCoin !== "undefined" &&
          upd.totalCoin !== it.totalCoin
        ) {
          next.totalCoin = upd.totalCoin;
          flags.totalCoin = true;
        } else if (typeof upd.coin !== "undefined" && upd.coin !== it.totalCoin) {
          next.totalCoin = upd.coin;
          flags.totalCoin = true;
        }

        if (typeof upd.amount !== "undefined" && upd.amount !== it.amount) {
          next.amount = upd.amount;
          flags.amount = true;
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

    // clear history state so refresh doesn’t re-apply
    navigate(".", { replace: true, state: {} });
  }, [location.state, navigate]);

  // filter
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const coin = String(it.totalCoin ?? "").toLowerCase();
      const amount = String(it.amount ?? "").toLowerCase();
      return coin.includes(q) || amount.includes(q);
    });
  }, [items, searchTerm]);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(startIdx, startIdx + itemsPerPage);

  const doDelete = async (row) => {
    if (!window.confirm(`Delete package with ${row.totalCoin} coins?`)) return;
    try {
      await deletePackage({ id: row._id });
      setItems((prev) => prev.filter((i) => i._id !== row._id));
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Delete failed");
    }
  };

  const headings = useMemo(
    () => [
      { title: "Sr No.", accessor: "sr" },
      { title: "Total Coin", accessor: "coin" },
      { title: "Amount", accessor: "amount" },
      { title: "Package Status", accessor: "status" },
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
          coin: (
            <span className={hl.totalCoin ? styles.flash : ""}>
              {it.totalCoin !== "" && typeof it.totalCoin !== "undefined"
                ? it.totalCoin
                : "-"}
            </span>
          ),
          amount: (
            <span className={hl.amount ? styles.flash : ""}>
              {it.amount !== "" && typeof it.amount !== "undefined" ? it.amount : "-"}
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
                onClick={() => navigate(`/package/editpackage/${it._id}`)}
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
      <h2 className={styles.heading}>Package Management</h2>

      <div className={styles.tableCard}>
        <div className={styles.searchWrapper}>
          <SearchBar
            placeholder="Search by coins or amount..."
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
              noDataMessage="No packages found."
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
