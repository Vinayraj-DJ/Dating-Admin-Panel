import styles from "./PaginationTable.module.css";

const PaginationTable = ({
  data = [],
  currentPage,
  itemsPerPage,
  setCurrentPage,
  setItemsPerPage,
  itemsPerPageOptions = [5, 10, 15, 20],
}) => {
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const goToPrev = () => {
    const prev = Math.max(currentPage - 1, 1);
    setCurrentPage(prev);
  };

  const goToNext = () => {
    const next = Math.min(currentPage + 1, totalPages);
    setCurrentPage(next);
  };

  const goToPage = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const handlePerPageChange = (e) => {
    const newPerPage = Number(e.target.value);
    setItemsPerPage(newPerPage);
    setCurrentPage(1);
  };

  return (
    <div className={styles.paginationContainer}>
      <div className={styles.pageControls}>
        <button
          onClick={goToPrev}
          disabled={currentPage === 1}
          className={styles.prevBtn}
        >
          &lt;
        </button>

        {(() => {
          let start = Math.max(currentPage - 2, 1);
          let end = start + 4;

          if (end > totalPages) {
            end = totalPages;
            start = Math.max(end - 4, 1);
          }

          const visiblePages = [];
          for (let i = start; i <= end; i++) {
            visiblePages.push(i);
          }

          return visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`${styles.pageButton} ${
                currentPage === page ? styles.active : ""
              }`}
            >
              {page}
            </button>
          ));
        })()}

        <button
          onClick={goToNext}
          disabled={currentPage === totalPages}
          className={styles.nextBtn}
        >
          &gt;
        </button>
      </div>

      {/* Optional: Items per page dropdown */}
      <div className={styles.itemsPerPageDropdownContainer}>
        <label htmlFor="items-per-page" className={styles.itemsPerPageLabel}>
          Items per page :
        </label>
        <select
          id="items-per-page"
          value={itemsPerPage}
          onChange={handlePerPageChange}
          className={styles.itemsPerPageDropdown}
        >
          {itemsPerPageOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PaginationTable;
