// src/components/FancyPager/FancyPager.jsx
import React from "react";
import styles from "./FancyPager.module.css";

export default function FancyPager({
  currentPage,
  totalPages,
  onPageChange,
  showPrevNext = true,
  maxButtons = 3,
}) {
  if (!totalPages || totalPages <= 1) return null;

  const go = (p, e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    const clamped = Math.max(1, Math.min(totalPages, p));
    if (clamped !== currentPage && typeof onPageChange === "function") onPageChange(clamped);
  };

  const prev = (e) => go(currentPage - 1, e);
  const next = (e) => go(currentPage + 1, e);

  let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let end = start + maxButtons - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxButtons + 1);
  }
  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className={styles.pagerWrap} role="navigation" aria-label="Pagination">
      {showPrevNext && (
        <button
          type="button"
          className={`${styles.pagerBtn} ${currentPage === 1 ? styles.disabled : ""}`}
          onClick={prev}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          Previous
        </button>
      )}

      <div className={styles.pages}>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`${styles.pageNum} ${p === currentPage ? styles.active : ""}`}
            onClick={(e) => go(p, e)}
            aria-current={p === currentPage ? "page" : undefined}
            aria-label={p === currentPage ? `Page ${p}, current` : `Go to page ${p}`}
          >
            {p}
          </button>
        ))}
      </div>

      {showPrevNext && (
        <button
          type="button"
          className={`${styles.pagerBtn} ${currentPage === totalPages ? styles.disabled : ""}`}
          onClick={next}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          Next
        </button>
      )}
    </div>
  );
}
