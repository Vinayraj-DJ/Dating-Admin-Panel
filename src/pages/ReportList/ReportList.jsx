import React, { useState } from "react";
import styles from "./ReportList.module.css";
import SearchBar from "../../components/SearchBar/SearchBar";
import DynamicTable from "../../components/DynamicTable/DynamicTable";
import PaginationTable from "../../components/PaginationTable/PaginationTable";

const ReportList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const data = [
    {
      id: 1,
      maker: "user_raj",
      gain: "user_kiran",
      comment: "Spam messages",
      date: "2025-07-28",
    },
    {
      id: 2,
      maker: "user_aarav",
      gain: "user_maya",
      comment: "Inappropriate content",
      date: "2025-07-27",
    },
    {
      id: 3,
      maker: "user_anvi",
      gain: "user_aditya",
      comment: "Fake profile",
      date: "2025-07-26",
    },
  ];

  const headings = [
    { title: "Sr No.", accessor: "sr" },
    { title: "Report maker user", accessor: "maker" },
    { title: "Report gain user", accessor: "gain" },
    { title: "comment", accessor: "comment" },
    { title: "Date", accessor: "date" },
  ];

  const filtered = data.filter(
    (item) =>
      item.maker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentData = filtered.slice(startIdx, startIdx + itemsPerPage);

  const columnData = currentData.map((item, index) => ({
    sr: startIdx + index + 1,
    maker: item.maker,
    gain: item.gain,
    comment: item.comment,
    date: item.date,
  }));

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Report List Management</h2>

      <div className={styles.tableCard}>
        <div className={styles.searchWrapper}>
          <SearchBar
            placeholder="Search reports..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.tableWrapper}>
          <DynamicTable
            headings={headings}
            columnData={columnData}
            noDataMessage="No reports available in table"
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

export default ReportList;
