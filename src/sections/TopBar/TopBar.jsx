// src/sections/TopBar/TopBar.jsx
import React, { useState } from "react";
import styles from "./TopBar.module.css";
import {
  FiSun,
  FiMoon,
  FiMaximize2,
  FiUser,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { clearAuth } from "../../utils/auth";

function TopBar() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    document.body.classList.toggle("dark-mode");
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  const handleLogout = () => {
    clearAuth(); // ⬅️ remove token + flags
    navigate("/login", { replace: true }); // ⬅️ go to login
  };

  return (
    <div className={styles.TopBarWrapper}>
      <div className={styles.actionIcons}>
        <div
          onClick={toggleDarkMode}
          className={styles.iconButton}
          title="Toggle Theme"
        >
          {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
        </div>

        <div
          onClick={toggleFullScreen}
          className={styles.iconButton}
          title="Fullscreen"
        >
          <FiMaximize2 size={20} />
        </div>

        <div className={styles.profileSection}>
          <div
            className={styles.profileIcon}
            onClick={() => setProfileOpen(!profileOpen)}
            title="User Menu"
          >
            <FiUser size={22} />
          </div>
          {profileOpen && (
            <ul className={styles.profileDropdown}>
              <li>
                <FiUser />
                <a href="/profile">Account</a>
              </li>
              <li>
                <FiSettings />
                <a href="/setting">Settings</a>
              </li>
              <li onClick={handleLogout}>
                <FiLogOut />
                <span>Log out</span>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopBar;
