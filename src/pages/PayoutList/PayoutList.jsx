import React, { useState } from "react";
import styles from "./PayoutList.module.css";
import SearchBar from "../../components/SearchBar/SearchBar";
import DynamicTable from "../../components/DynamicTable/DynamicTable";
import PaginationTable from "../../components/PaginationTable/PaginationTable";
import { useNavigate } from "react-router-dom";

// Image assets
import one from "../../assets/icons/one.svg";
import two from "../../assets/icons/two.svg";
import three from "../../assets/icons/three.svg";
import four from "../../assets/icons/four.svg"; // placeholder

const PayoutList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const data = [
    {
      id: 1,
      amount: "20 ₹",
      coin: 1000,
      username: "Test",
      transfer: "appeesoft@ybl",
      type: "UPI",
      mobile: "+919701449797",
      image: one,
      status: "Completed",
    },
    {
      id: 2,
      amount: "20 ₹",
      coin: 1000,
      username: "Test",
      transfer: "appeesoft@g",
      type: "UPI",
      mobile: "+919701449797",
      image: two,
      status: "Completed",
    },
    {
      id: 3,
      amount: "20 ₹",
      coin: 1000,
      username: "Test",
      transfer: "appeesoft@ybl",
      type: "UPI",
      mobile: "+919701449797",
      image: three,
      status: "Pending",
    },
    {
      id: 4,
      amount: "20 ₹",
      coin: 1000,
      username: "Test",
      transfer: "demoupi@ybl",
      type: "UPI",
      mobile: "+919701449797",
      image: four,
      status: "Completed",
    },
  ];

  const headings = [
    { title: "Sr No.", accessor: "sr" },
    { title: "Amount", accessor: "amount" },
    { title: "Coin", accessor: "coin" },
    { title: "User Name", accessor: "username" },
    { title: "Transfer Details", accessor: "transfer" },
    { title: "Transfer Type", accessor: "type" },
    { title: "User Mobile", accessor: "mobile" },
    { title: "Transfer Photo", accessor: "image" },
    { title: "Status", accessor: "status" },
    { title: "Action", accessor: "action" },
  ];

  const filtered = data.filter((item) =>
    item.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(startIdx, startIdx + itemsPerPage);

  const columnData = currentData.map((item, index) => ({
    sr: startIdx + index + 1,
    amount: item.amount,
    coin: item.coin,
    username: item.username,
    transfer: item.transfer,
    type: item.type,
    mobile: item.mobile,
    image: <img src={item.image} alt="payout" width={40} height={40} />,
    status: <span className={styles.publishBadge}>{item.status}</span>,
    action:
      item.status === "Pending" ? (
        <button
          className={styles.payoutButton}
          onClick={() => navigate(`/payout/complete/${item.id}`)}
        >
          Make
          <br />A<br />
          Payout
        </button>
      ) : (
        <span className={styles.publishBadge}>Completed</span>
      ),
  }));

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Payout List Management</h2>

      <div className={styles.tableCard}>
        <div className={styles.searchWrapper}>
          <SearchBar
            placeholder="Search payouts..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <DynamicTable
          headings={headings}
          columnData={columnData}
          noDataMessage="No payouts found."
        />

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

export default PayoutList;
