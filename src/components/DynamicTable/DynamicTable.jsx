import styles from "./DynamicTable.module.css";

function DynamicTable({ headings = [], columnData = [], noDataMessage }) {
  const noData = !columnData || columnData.length === 0;

  return (
    <div style={{ overflowX: "auto" }}>
      {" "}
      {/* 👈 This adds horizontal scroll only */}
      <table className={styles.Dynamic}>
        <thead>
          <tr>
            {headings.map((heading, index) => (
              <td key={index}>{heading.title}</td>
            ))}
          </tr>
        </thead>

        <tbody>
          {noData ? (
            <tr>
              <td colSpan={headings.length} className={styles.noDataBox}>
                {noDataMessage ? noDataMessage : "No Data Found"}
              </td>
            </tr>
          ) : (
            columnData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headings.map((heading, colIndex) => (
                  <td key={colIndex}>{row[heading.accessor]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DynamicTable;
