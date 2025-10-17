import React from "react";
import styles from "./SearchBar.module.css";
import { IoSearch } from "react-icons/io5";

function SearchBar({ placeholder = "Search here...", onChange }) {
  return (
    <div className={styles.SearchBar}>
      <IoSearch style={{ color: "var(--Primary_Color)" }} size={24} />
      <input
        type="search"
        placeholder={placeholder}
        onChange={onChange}
        className={styles.input}
      />
    </div>
  );
}

export default SearchBar;
