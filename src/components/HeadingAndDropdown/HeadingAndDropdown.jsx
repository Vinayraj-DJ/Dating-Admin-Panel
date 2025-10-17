import React, { useState } from "react";
import styles from "./HeadingAndDropdown.module.css";

import { IoChevronDownOutline } from "react-icons/io5";

const HeadingAndDropDown = ({
  label,
  options = [],
  value,
  name,
  onChange,
  required = false,
  placeholder = "Select an option",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleSelect = (selectedValue) => {
    onChange({ target: { name, value: selectedValue } });
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdownBlock}>
      <label className={styles.inputLabel}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </label>

      <div className={styles.dropdownContainer}>
        <div className={styles.selected} onClick={toggleDropdown}>
          <span
            className={value ? styles.selectedText : styles.placeholderText}
          >
            {value
              ? options.find((option) => option.value === value)?.label || value
              : placeholder}
          </span>

          <IoChevronDownOutline
            size={16}
            className={`${styles.icon} ${isOpen ? styles.iconOpen : ""}`}
          />
        </div>

        {isOpen && (
          <ul className={styles.optionsList}>
            {options.map((option, idx) => (
              <li
                key={idx}
                onClick={() => handleSelect(option.value)}
                className={styles.optionItem}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HeadingAndDropDown;
