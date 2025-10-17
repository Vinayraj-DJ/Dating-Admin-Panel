import React, { useEffect, useState } from "react";
import styles from "./AllUserList.module.css";
import SearchBar from "../../../components/SearchBar/SearchBar";
import DynamicTable from "../../../components/DynamicTable/DynamicTable";
import PaginationTable from "../../../components/PaginationTable/PaginationTable";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const AllUserList = () => {
   const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const mockData = [
      {
        id: 1,
        name: "harika",
        email: "harika@gmail.com",
        mobile: "+9187864548999",
        joinDate: "2025-07-29T05:44:23Z",
        active: true,
        subscribed: true,
        plan: "Basic",
        startDate: "29th Jul 2025, 12:00 AM",
        expiryDate: "28th Aug 2025, 12:00 AM",
        identity: "not upload",
        verified: false,
        image: null,
      },
      {
        id: 2,
        name: "lovfly",
        email: "harikanagraju24803@gmail.com",
        mobile: "+919440531512",
        joinDate: "2025-07-29T05:29:28Z",
        active: false,
        subscribed: false,
        plan: null,
        startDate: "",
        expiryDate: "",
        identity: "not upload",
        verified: false,
        image: "https://via.placeholder.com/50x50",
      },
    ];
    setUsers(mockData);
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.mobile.includes(searchTerm)
  );

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

  const columnData = currentData.map((user, index) => ({
    sr: startIdx + index + 1,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    joinDate: new Date(user.joinDate).toLocaleString(),
    status: (
      <span
        className={`${styles.badge} ${user.active ? styles.red : styles.green}`}
      >
        {user.active ? "Make Deactive" : "Make Active"}
      </span>
    ),
    subscription: (
      <span
        className={`${styles.badge} ${
          user.subscribed ? styles.green : styles.red
        }`}
      >
        {user.subscribed ? "Subscribe" : "Not Subscribe"}
      </span>
    ),
    plan: (
      <span
        className={`${styles.badge} ${
          user.plan === "Basic" ? styles.green : styles.gray
        }`}
      >
        {user.plan || "Not Subscribe"}
      </span>
    ),
    startDate: <span className={styles.green}>{user.startDate || "—"}</span>,
    expiryDate: <span className={styles.green}>{user.expiryDate || "—"}</span>,
    identity: user.identity,
    verified: user.verified ? (
      <span className={styles.green}>Approved</span>
    ) : (
      "Wait For Upload"
    ),
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
      <h2 className={styles.heading}>User List Management</h2>

      <div className={styles.tableCard}>
        <div className={styles.searchWrapper}>
          <SearchBar
            placeholder="Search..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.tableWrapper}>
          <DynamicTable
            headings={headings}
            columnData={columnData}
            noDataMessage="No users found."
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
