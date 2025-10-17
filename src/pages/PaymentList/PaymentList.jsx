import React, { useState } from "react";
import styles from "./PaymentList.module.css";
import SearchBar from "../../components/SearchBar/SearchBar";
import DynamicTable from "../../components/DynamicTable/DynamicTable";
import PaginationTable from "../../components/PaginationTable/PaginationTable";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";

// Reusing your image icons (for demo purpose)
import one from "../../assets/icons/one.svg";
import two from "../../assets/icons/two.svg";
import three from "../../assets/icons/three.svg";

const PaymentList = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const data = [
    {
      id: 1,
      gateway: "Razorpay",
      subtitle:
        "Card, UPI, Net banking, Wallet(Phone Pe, Amazon Pay, Freecharge)",
      image: one,
      status: "Publish",
      showOnWallet: "Publish",
    },
    {
      id: 2,
      gateway: "Paypal",
      subtitle:
        "Credit/Debit card with Easier way to pay – online and on your mobile.",
      image: two,
      status: "Publish",
      showOnWallet: "Publish",
    },
    {
      id: 3,
      gateway: "Stripe",
      subtitle:
        "Accept all major debit and credit cards from customers in every country",
      image: three,
      status: "Publish",
      showOnWallet: "Publish",
    },
  ];

  const headings = [
    { title: "Sr No.", accessor: "sr" },
    { title: "Payment Gateway Name", accessor: "gateway" },
    { title: "Payment Gateway Subtitle", accessor: "subtitle" },
    { title: "Payment Gateway Image", accessor: "image" },
    { title: "Payment Gateway Status", accessor: "status" },
    { title: "Show On Wallet?", accessor: "showOnWallet" },
    { title: "Action", accessor: "action" },
  ];

  const filtered = data.filter((item) =>
    item.gateway.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(startIdx, startIdx + itemsPerPage);

  const columnData = currentData.map((item, index) => ({
    sr: startIdx + index + 1,
    gateway: item.gateway,
    subtitle: item.subtitle,
    image: <img src={item.image} alt={item.gateway} width={40} height={40} />,
    status: <span className={styles.publishBadge}>{item.status}</span>,
    showOnWallet: (
      <span className={styles.publishBadge}>{item.showOnWallet}</span>
    ),
    action: (
      <FaEdit
        className={styles.editIcon}
        onClick={() => navigate(`/payment/editgateway/${item.id}`)}
      />
    ),
  }));

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Payment Gateway List Management</h2>

      <div className={styles.tableCard}>
        <div className={styles.searchWrapper}>
          <SearchBar
            placeholder="Search Payment Gateways..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.tableWrapper}>
          <DynamicTable
            headings={headings}
            columnData={columnData}
            noDataMessage="No gateways found."
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

export default PaymentList;
