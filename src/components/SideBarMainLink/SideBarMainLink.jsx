import { NavLink, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./SideBarMainLink.module.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

function SideBarMainLink({ data, expandedLabel, setExpandedLabel }) {
  const { label, icon, subLinks, toRoute } = data;
  const location = useLocation();

  const isExpandable = Array.isArray(subLinks) && subLinks.length > 0;
  const isExpanded = expandedLabel === label;

  const isAnySubLinkActive = useMemo(() => {
    if (!isExpandable) return false;

    return subLinks.some((sub) => {
      const path = location.pathname;

      // Match exact or parent paths
      if (path.startsWith(sub.toRoute)) return true;

      // Special edit routes
      const editRoutes = [
        ["/interest/addinterest", "/interest/editinterest"],
        ["/language/addlanguage", "/language/editlanguage"],
        ["/religion/addreligion", "/religion/editreligion"],
        ["/gift/addgift", "/gift/editgift"],
        ["/relation/addrelationgoal", "/relation/editrelationgoal"],
        ["/faq/addfaq", "/faq/editfaq"],
        ["/plan/addplan", "/plan/editplan"],
        ["/package/addpackage", "/package/editpackage"],
        ["/page/addpage", "/page/editpage"],
        ["/payoutlist", "/payout/complete"],
      ];

      return editRoutes.some(
        ([addRoute, editRoute]) =>
          sub.toRoute === addRoute && path.startsWith(editRoute)
      );
    });
  }, [subLinks, location.pathname, isExpandable]);

  const handleClick = () => {
    setExpandedLabel(isExpanded ? null : label);
  };

  return (
    <>
      {isExpandable ? (
        <div
          className={`${styles.link_container} ${
            isAnySubLinkActive ? styles.active : ""
          }`}
          onClick={handleClick}
        >
          {icon}
          <span>{label}</span>
          <span className={styles.chevronIcon}>
            {isExpanded ? (
              <FaChevronUp size={12} />
            ) : (
              <FaChevronDown size={12} />
            )}
          </span>
        </div>
      ) : (
        <NavLink
          to={toRoute}
          className={({ isActive }) =>
            `${styles.subLink} ${styles.link_container} ${
              isActive ? styles.activeSub : ""
            }`
          }
        >
          {icon}
          <span>{label}</span>
        </NavLink>
      )}

      <AnimatePresence initial={false}>
        {isExpandable && isExpanded && (
          <motion.div
            className={styles.subLinksContainer}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {subLinks.map((sub) => {
              const path = location.pathname;

              const isEditRoute = [
                ["/interest/addinterest", "/interest/editinterest"],
                ["/language/addlanguage", "/language/editlanguage"],
                ["/religion/addreligion", "/religion/editreligion"],
                ["/gift/addgift", "/gift/editgift"],
                ["/relation/addrelationgoal", "/relation/editrelationgoal"],
                ["/faq/addfaq", "/faq/editfaq"],
                ["/plan/addplan", "/plan/editplan"],
                ["/package/addpackage", "/package/editpackage"],
                ["/page/addpage", "/page/editpage"],
                ["/payoutlist", "/payout/complete"],
              ].some(
                ([addRoute, editRoute]) =>
                  sub.toRoute === addRoute && path.startsWith(editRoute)
              );

              return (
                <NavLink
                  key={sub.label}
                  to={sub.toRoute}
                  className={({ isActive }) =>
                    `${styles.subLink} ${
                      isActive || isEditRoute ? styles.activeSub : ""
                    }`
                  }
                >
                  {sub.label}
                </NavLink>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SideBarMainLink;
