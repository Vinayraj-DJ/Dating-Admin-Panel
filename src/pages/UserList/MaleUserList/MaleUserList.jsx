// // src/pages/Users/MaleUserList/MaleUserList.jsx
// import React, { useEffect, useState } from "react";
// import styles from "./MaleUserList.module.css";
// import SearchBar from "../../../components/SearchBar/SearchBar";
// import DynamicTable from "../../../components/DynamicTable/DynamicTable";
// import PaginationTable from "../../../components/PaginationTable/PaginationTable";
// import { FaUserCircle } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { getMaleUsers } from "../../../services/usersService"; // adjust path if needed

// const MaleUserList = () => {
//   const navigate = useNavigate();

//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const controller = new AbortController();
//     let mounted = true;

//     async function loadMaleUsers() {
//       setLoading(true);
//       setError(null);
//       try {
//         // Calls /admin/users?type=male and returns an array (per your Postman)
//         const arr = await getMaleUsers({ signal: controller.signal });
//         // arr expected: [ { _id, firstName, lastName, ... }, ... ]
//         const normalize = (u) => {
//           const name =
//             (u?.firstName && u?.lastName && `${u.firstName} ${u.lastName}`) ||
//             u?.name ||
//             `${u?.firstName || ""} ${u?.lastName || ""}`.trim() ||
//             "—";

//           return {
//             id: u._id || u.id,
//             name,
//             email: u.email || "—",
//             mobile: u.mobileNumber || u.mobile || "—",
//             joinDate: u.createdAt || u.joinDate || null,
//             active: !!u.isActive,
//             subscribed: !!u.subscribed,
//             plan: u.plan || null,
//             startDate: u.startDate || null,
//             expiryDate: u.expiryDate || null,
//             identity: u.identity || "not upload",
//             verified: Boolean(u.isVerified),
//             image: Array.isArray(u.images) && u.images.length ? u.images[0] : u.image || null,
//             raw: u,
//             gender: u.gender || "male",
//           };
//         };

//         if (!mounted) return;
//         setUsers(Array.isArray(arr) ? arr.map(normalize) : []);
//       } catch (err) {
//         if (err.name !== "AbortError") {
//           setError(err.message || "Failed to load male users");
//         }
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     }

//     loadMaleUsers();

//     return () => {
//       mounted = false;
//       controller.abort();
//     };
//   }, []);

//   // search + filter
//   const filtered = users.filter((u) => {
//     const term = searchTerm.trim().toLowerCase();
//     if (!term) return true;
//     return (
//       String(u.name || "").toLowerCase().includes(term) ||
//       String(u.email || "").toLowerCase().includes(term) ||
//       String(u.mobile || "").includes(term)
//     );
//   });

//   // pagination
//   const startIdx = (currentPage - 1) * itemsPerPage;
//   const currentData = filtered.slice(startIdx, startIdx + itemsPerPage);

//   const headings = [
//     { title: "Sr No.", accessor: "sr" },
//     { title: "Name", accessor: "name" },
//     { title: "Email", accessor: "email" },
//     { title: "Mobile", accessor: "mobile" },
//     { title: "Join Date", accessor: "joinDate" },
//     { title: "Status", accessor: "status" },
//     { title: "Subscription", accessor: "subscription" },
//     { title: "Plan", accessor: "plan" },
//     { title: "Start Date", accessor: "startDate" },
//     { title: "Expiry Date", accessor: "expiryDate" },
//     { title: "Identity", accessor: "identity" },
//     { title: "Verification", accessor: "verified" },
//     { title: "Info", accessor: "info" },
//   ];

//   const columnData = currentData.map((user, index) => ({
//     sr: startIdx + index + 1,
//     name: user.name,
//     email: user.email,
//     mobile: user.mobile,
//     joinDate: user.joinDate ? new Date(user.joinDate).toLocaleString() : "—",
//     status: (
//       <span
//         className={`${styles.badge} ${user.active ? styles.red : styles.green}`}
//         title={user.active ? "Click to deactivate" : "Click to activate"}
//       >
//         {user.active ? "Make Deactive" : "Make Active"}
//       </span>
//     ),
//     subscription: (
//       <span
//         className={`${styles.badge} ${user.subscribed ? styles.green : styles.red}`}
//       >
//         {user.subscribed ? "Subscribe" : "Not Subscribe"}
//       </span>
//     ),
//     plan: (
//       <span
//         className={`${styles.badge} ${user.plan === "Basic" ? styles.green : styles.gray}`}
//       >
//         {user.plan || "Not Subscribe"}
//       </span>
//     ),
//     startDate: <span className={styles.green}>{user.startDate || "—"}</span>,
//     expiryDate: <span className={styles.green}>{user.expiryDate || "—"}</span>,
//     identity: user.identity,
//     verified: user.verified ? <span className={styles.green}>Approved</span> : "Wait For Upload",
//     info: (
//       <span
//         className={styles.infoIcon}
//         onClick={() => navigate(`/user-info/${user.id}`)}
//         style={{ cursor: "pointer" }}
//         title="View Info"
//       >
//         {user.image ? (
//           <img src={user.image} alt="User" className={styles.image} />
//         ) : (
//           <FaUserCircle color="purple" size={24} />
//         )}
//       </span>
//     ),
//   }));

//   return (
//     <div className={styles.container}>
//       <h2 className={styles.heading}>Male Users</h2>

//       <div className={styles.tableCard}>
//         <div className={styles.searchWrapper}>
//           <SearchBar placeholder="Search male users..." onChange={(e) => setSearchTerm(e.target.value)} />
//         </div>

//         {loading && <div className={styles.info}>Loading male users…</div>}
//         {error && <div className={styles.error}>Error: {error}</div>}

//         <div className={styles.tableWrapper}>
//           <DynamicTable
//             headings={headings}
//             columnData={columnData}
//             noDataMessage={loading ? "Loading..." : "No male users found."}
//           />
//         </div>

//         <PaginationTable
//           data={filtered}
//           currentPage={currentPage}
//           itemsPerPage={itemsPerPage}
//           setCurrentPage={setCurrentPage}
//           setItemsPerPage={setItemsPerPage}
//         />
//       </div>
//     </div>
//   );
// };

// export default MaleUserList;



// src/pages/Users/MaleUserList/MaleUserList.jsx
import React, { useEffect, useState } from "react";
import styles from "./MaleUserList.module.css";
import SearchBar from "../../../components/SearchBar/SearchBar";
import DynamicTable from "../../../components/DynamicTable/DynamicTable";
import PaginationTable from "../../../components/PaginationTable/PaginationTable";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getMaleUsers, toggleUserStatus } from "../../../services/usersService"; // added toggleUserStatus

const MaleUserList = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // saving map: { [userId]: true } while request in-flight
  const [savingIds, setSavingIds] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function loadMaleUsers() {
      setLoading(true);
      setError(null);
      try {
        // Calls /admin/users?type=male and returns an array (per your Postman)
        const arr = await getMaleUsers({ signal: controller.signal });
        // arr expected: [ { _id, firstName, lastName, ... }, ... ]
        const normalize = (u) => {
          const name =
            (u?.firstName && u?.lastName && `${u.firstName} ${u.lastName}`) ||
            u?.name ||
            `${u?.firstName || ""} ${u?.lastName || ""}`.trim() ||
            "—";

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
            gender: u.gender || "male",
          };
        };

        if (!mounted) return;
        setUsers(Array.isArray(arr) ? arr.map(normalize) : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load male users");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadMaleUsers();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  // helper: toggle status handler (uses optimistic UI + server response)
  async function handleToggleStatus(user) {
    const id = user.id;
    if (!id) return;
    const userType = user.gender || "male";
    const newStatus = user.active ? "inactive" : "active";

    setSavingIds((s) => ({ ...s, [id]: true }));

    const controller = new AbortController();
    try {
      const resp = await toggleUserStatus(
        { userType, userId: id, status: newStatus },
        { signal: controller.signal }
      );
      // resp expected: { success: true, data: { ...updatedUser } }
      const updatedRaw = resp?.data ?? resp;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                // prefer server-sent isActive if present, else toggle locally
                active:
                  typeof updatedRaw?.isActive === "boolean"
                    ? updatedRaw.isActive
                    : newStatus === "active",
                raw: updatedRaw || u.raw,
              }
            : u
        )
      );
    } catch (err) {
      console.error("Toggle status failed", err);
      // replace with your toast if available
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
    { title: "Status", accessor: "status" },
    { title: "Subscription", accessor: "subscription" },
    { title: "Plan", accessor: "plan" },
    { title: "Start Date", accessor: "startDate" },
    { title: "Expiry Date", accessor: "expiryDate" },
    { title: "Identity", accessor: "identity" },
    { title: "Verification", accessor: "verified" },
    { title: "Info", accessor: "info" },
  ];

  const columnData = currentData.map((user, index) => {
    const isSaving = Boolean(savingIds[user.id]);
    const statusText = isSaving ? "Saving..." : user.active ? "Make Deactive" : "Make Active";

    return {
      sr: startIdx + index + 1,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      joinDate: user.joinDate ? new Date(user.joinDate).toLocaleString() : "—",
      status: (
        // keep span for styles but make it clickable and accessible
        <span
          role="button"
          aria-disabled={isSaving}
          onClick={() => {
            if (isSaving) return;
            handleToggleStatus(user);
          }}
          className={`${styles.badge} ${user.active ? styles.red : styles.green} ${isSaving ? styles.disabled : ""}`}
          title={user.active ? "Click to deactivate" : "Click to activate"}
          style={{ cursor: isSaving ? "not-allowed" : "pointer" }}
        >
          {statusText}
        </span>
      ),
      subscription: (
        <span className={`${styles.badge} ${user.subscribed ? styles.green : styles.red}`}>
          {user.subscribed ? "Subscribe" : "Not Subscribe"}
        </span>
      ),
      plan: (
        <span className={`${styles.badge} ${user.plan === "Basic" ? styles.green : styles.gray}`}>
          {user.plan || "Not Subscribe"}
        </span>
      ),
      startDate: <span className={styles.green}>{user.startDate || "—"}</span>,
      expiryDate: <span className={styles.green}>{user.expiryDate || "—"}</span>,
      identity: user.identity,
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
    };
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Male Users</h2>

      <div className={styles.tableCard}>
        <div className={styles.searchWrapper}>
          <SearchBar placeholder="Search male users..." onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {loading && <div className={styles.info}>Loading male users…</div>}
        {error && <div className={styles.error}>Error: {error}</div>}

        <div className={styles.tableWrapper}>
          <DynamicTable
            headings={headings}
            columnData={columnData}
            noDataMessage={loading ? "Loading..." : "No male users found."}
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

export default MaleUserList;
