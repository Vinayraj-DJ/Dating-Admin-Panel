




import React, { useEffect, useState } from "react";
import styles from "./AllUserList.module.css";
import SearchBar from "../../../components/SearchBar/SearchBar";
import DynamicTable from "../../../components/DynamicTable/DynamicTable";
import PaginationTable from "../../../components/PaginationTable/PaginationTable";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getAllUsers, toggleUserStatus } from "../../../services/usersService";
import { showCustomToast } from "../../../components/CustomToast/CustomToast";

const AllUserList = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savingIds, setSavingIds] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function loadUsers() {
      setLoading(true);
      setError(null);
      try {
        const resp = await getAllUsers({ signal: controller.signal });
        const payload = resp?.data ?? resp;
        const males = payload?.males || [];
        const females = payload?.females || [];
        const agencies = payload?.agencies || [];

        const normalize = (u, typeFallback) => {
          const first = u?.firstName || u?.first_name || "";
          const last = u?.lastName || u?.last_name || "";
          const name =
            first || last ? `${first} ${last}`.trim() : u?.name || "—";

          return {
            id: u._id || u.id,
            name,
            email: u.email || "—",
            mobile: u.mobileNumber || u.mobile || "—",
            joinDate: u.createdAt || u.joinDate || null,
            active:
              typeof u.isActive === "boolean"
                ? u.isActive
                : String(u.status || "").toLowerCase() === "active",
            userType: typeFallback || u.gender || "unknown",
            verified: Boolean(u.isVerified),
            subscribed: !!u.subscribed,
            plan: u.plan || "Not Subscribe",
            startDate: u.startDate || null,
            expiryDate: u.expiryDate || null,
            identity: u.identity || "not upload",
            image:
              Array.isArray(u.images) && u.images.length
                ? u.images[0]
                : u.image || null,
            raw: u,
          };
        };

        const combined = [
          ...males.map((m) => normalize(m, "male")),
          ...females.map((f) => normalize(f, "female")),
          ...agencies.map((a) => normalize(a, "agency")),
        ];

        if (mounted) setUsers(combined);
      } catch (err) {
        if (!controller.signal.aborted)
          setError(err.message || "Failed to load users");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUsers();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  /** 🔁 Toggle Active <-> Inactive */
  async function handleStatusToggle(user) {
    const id = user.id;
    const userType = user.userType || "male";
    const newStatus = user.active ? "inactive" : "active";

    setSavingIds((prev) => ({ ...prev, [id]: true }));

    try {
      const updatedUser = await toggleUserStatus({
        userType,
        userId: id,
        status: newStatus,
      });

      showCustomToast(
        `${user.name || "User"} ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully!`
      );

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                active:
                  updatedUser?.status?.toLowerCase() === "active" ||
                  updatedUser?.isActive === true ||
                  newStatus === "active",
                raw: { ...u.raw, ...updatedUser },
              }
            : u
        )
      );
    } catch (err) {
      console.error("Status toggle failed:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update user status.";
      showCustomToast(message);
    } finally {
      setSavingIds((prev) => {
        const clone = { ...prev };
        delete clone[id];
        return clone;
      });
    }
  }

  // 🔍 Filter by search term
  const filtered = users.filter((u) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.mobile?.includes(term)
    );
  });

  // 📄 Pagination
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
    { title: "Is Subscribe?", accessor: "subscribed" },
    { title: "Plan Name", accessor: "plan" },
    { title: "Start Date", accessor: "startDate" },
    { title: "Expired Date", accessor: "expiryDate" },
    { title: "Identity", accessor: "identity" },
    { title: "Verification", accessor: "verified" },
    { title: "Info", accessor: "info" },
  ];

  const columnData = currentData.map((user, index) => ({
    sr: startIdx + index + 1,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    joinDate: user.joinDate
      ? new Date(user.joinDate).toLocaleString()
      : "—",
    type: user.userType || "unknown",
    status: (
      <button
        onClick={() => handleStatusToggle(user)}
        disabled={!!savingIds[user.id]}
        className={`${styles.statusButton} ${
          user.active ? styles.active : styles.inactive
        }`}
      >
        {savingIds[user.id]
          ? "Updating..."
          : user.active
          ? "Active"
          : "Inactive"}
      </button>
    ),
    subscribed: (
      <span
        className={`${user.subscribed ? styles.badgeGreen : styles.badgeRed}`}
      >
        {user.subscribed ? "Subscribe" : "Not Subscribe"}
      </span>
    ),
    plan: (
      <span
        className={`${user.plan && user.plan !== "Not Subscribe"
          ? styles.badgeGreen
          : styles.badgeRed
        }`}
      >
        {user.plan || "Not Subscribe"}
      </span>
    ),
    startDate: (
      <span
        className={`${user.startDate ? styles.badgeGreen : styles.badgeRed}`}
      >
        {user.startDate
          ? new Date(user.startDate).toLocaleString()
          : "Not Subscribe"}
      </span>
    ),
    expiryDate: (
      <span
        className={`${user.expiryDate ? styles.badgeGreen : styles.badgeRed}`}
      >
        {user.expiryDate
          ? new Date(user.expiryDate).toLocaleString()
          : "Not Subscribe"}
      </span>
    ),
    identity: (
      <span className={styles.badgeGray}>
        {user.identity || "not upload"}
      </span>
    ),
    verified: user.verified ? (
      <span className={styles.green}>Approved</span>
    ) : (
      "Wait For Upload"
    ),
    info: (
      <span
        className={styles.infoIcon}
        onClick={() => navigate(`/user-info/${user.id}`)}
        title="View Info"
        style={{ cursor: "pointer" }}
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
          <SearchBar
            placeholder="Search users..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
