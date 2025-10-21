// src/pages/Users/AllUserList/AllUserList.jsx
import React, { useEffect, useState } from "react";
import styles from "./AllUserList.module.css";
import SearchBar from "../../../components/SearchBar/SearchBar";
import DynamicTable from "../../../components/DynamicTable/DynamicTable";
import PaginationTable from "../../../components/PaginationTable/PaginationTable";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getAllUsers, toggleUserStatus } from "../../../services/usersService";

const AllUserList = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [users, setUsers] = useState([]); // normalized flat list
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savingIds, setSavingIds] = useState({}); // map id->boolean for row saving state

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const resp = await getAllUsers({ signal: controller.signal });
        // resp expected: { success:true, data: { males:[], females:[], agencies:[] } }
        const payload = resp?.data ?? resp;
        const males = (payload && payload.males) || [];
        const females = (payload && payload.females) || [];
        const agencies = (payload && payload.agencies) || [];

        const normalize = (u, typeFallback) => {
          const first = u?.firstName || u?.first_name || "";
          const last = u?.lastName || u?.last_name || "";
          const name =
            (first || last) ? `${first} ${last}`.trim() : (u?.name || u?.fullName || "—");

          return {
            id: u._id || u.id,
            name,
            email: u.email || "—",
            mobile: u.mobileNumber || u.mobile || "—",
            joinDate: u.createdAt || u.joinDate || null,
            active: !!u.isActive,
            subscribed: !!u.subscribed,
            plan: u.plan || null,
            startDate: u.startDate || null,
            expiryDate: u.expiryDate || null,
            identity: u.identity || "not upload",
            verified: Boolean(u.isVerified),
            image: Array.isArray(u.images) && u.images.length ? u.images[0] : u.image || null,
            raw: u,
            userType: typeFallback || u.gender || "unknown", // male/female/agency
          };
        };

        const combined = [
          ...males.map((m) => normalize(m, "male")),
          ...females.map((f) => normalize(f, "female")),
          ...agencies.map((a) => normalize(a, "agency")),
        ];

        if (mounted) setUsers(combined);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message || "Failed to load users");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  // toggle activate/deactivate handler
  async function handleToggleStatus(user) {
    const id = user.id;
    if (!id) return;
    const userType = user.userType || "male"; // server expects userType: male|female|agency
    const newStatus = user.active ? "inactive" : "active";

    setSavingIds((s) => ({ ...s, [id]: true }));
    try {
      const resp = await toggleUserStatus({ userType, userId: id, status: newStatus });
      // resp shape: { success: true, data: { ...updatedUser } }
      const updatedRaw = resp?.data ?? resp;
      // update local normalized list
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                active: typeof updatedRaw?.isActive === "boolean" ? updatedRaw.isActive : newStatus === "active",
                raw: updatedRaw || u.raw,
              }
            : u
        )
      );
    } catch (err) {
      console.error("Toggle status failed", err);
      // replace alert with your toast if available
      alert(err?.message || "Failed to toggle status. Try again.");
    } finally {
      setSavingIds((s) => {
        const copy = { ...s };
        delete copy[id];
        return copy;
      });
    }
  }

  // search + filter
  const filtered = users.filter((u) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      String(u.name || "").toLowerCase().includes(term) ||
      String(u.email || "").toLowerCase().includes(term) ||
      String(u.mobile || "").includes(term)
    );
  });

  // pagination
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(startIdx, startIdx + itemsPerPage);

  const headings = [
    { title: "Sr No.", accessor: "sr" },
    { title: "Name", accessor: "name" },
    { title: "Email", accessor: "email" },
    { title: "Mobile", accessor: "mobile" },
    { title: "Join Date", accessor: "joinDate" },
    { title: "Type", accessor: "type" },
    { title: "Status", accessor: "status" },
    { title: "Verification", accessor: "verified" },
    { title: "Info", accessor: "info" },
  ];

  const columnData = currentData.map((user, index) => ({
    sr: startIdx + index + 1,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    joinDate: user.joinDate ? new Date(user.joinDate).toLocaleString() : "—",
    type: (user.userType || "unknown").toString(),
    status: (
      <button
        className={`${styles.badgeButton} ${user.active ? styles.red : styles.green}`}
        title={user.active ? "Click to deactivate" : "Click to activate"}
        onClick={() => handleToggleStatus(user)}
        disabled={!!savingIds[user.id]}
        style={{ cursor: savingIds[user.id] ? "wait" : "pointer", border: "none", background: "transparent" }}
      >
        {savingIds[user.id] ? "Saving..." : user.active ? "Make Deactive" : "Make Active"}
      </button>
    ),
    verified: user.verified ? <span className={styles.green}>Approved</span> : "Wait For Upload",
    info: (
      <span
        className={styles.infoIcon}
        onClick={() => navigate(`/user-info/${user.id}`)}
        style={{ cursor: "pointer" }}
        title="View Info"
      >
        {user.image ? (
          <img src={user.image} alt="User" className={styles.image} />
        ) : (
          <FaUserCircle color="purple" size={24} />
        )}
      </span>
    ),
  }));

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>All Users</h2>

      <div className={styles.tableCard}>
        <div className={styles.searchWrapper}>
          <SearchBar placeholder="Search users..." onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {loading && <div className={styles.info}>Loading users…</div>}
        {error && <div className={styles.error}>Error: {error}</div>}

        <div className={styles.tableWrapper}>
          <DynamicTable
            headings={headings}
            columnData={columnData}
            noDataMessage={loading ? "Loading..." : "No users found."}
          />
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

export default AllUserList;
