import styles from "./SideBar.module.css";
import SchoolLogo from "../../assets/images/schoolLogo.png";
import { RxDashboard } from "react-icons/rx";
import { PiUsersThreeDuotone } from "react-icons/pi";
import { FaUserCheck } from "react-icons/fa";
import SideBarMainLink from "../../components/SideBarMainLink/SideBarMainLink";
import { useEffect, useState } from "react";
import { MdOutlineTextSnippet } from "react-icons/md";
import { LuCalendarDays, LuMessagesSquare } from "react-icons/lu";
import { TbLayoutSidebarLeftExpand } from "react-icons/tb";
import { useLocation } from "react-router";

function SideBar() {
  const [expandedLabel, setExpandedLabel] = useState(null);
  const location = useLocation();

useEffect(() => {
  const matchedItem = sideBarMenuItems.find((item) =>
    item.subLinks?.some((sub) => location.pathname.startsWith(sub.toRoute))
  );

  if (matchedItem) {
    setExpandedLabel(matchedItem.label);
  }
}, [location.pathname]);


  const sideBarMenuItems = [
    {
      label: "Dashboard",
      toRoute: "",
      icon: <RxDashboard size={20} />,
    },
    // {
    //   label: "Admin Profile",
    //   toRoute: "/admin/profile",
    //   icon: <RxDashboard size={20} />,
    // },
    {
      label: "Interest",
      icon: <PiUsersThreeDuotone size={24} />,
      subLinks: [
        { label: "Add Interest", toRoute: "/interest/addinterest" },
        { label: "List Interest", toRoute: "/interest/listinterest" },
      ],
    },
    {
      label: "Language",
      icon: <FaUserCheck size={20} />,
      subLinks: [
        { label: "Add Language", toRoute: "/language/addlanguage" },
        { label: "List Language", toRoute: "/language/listlanguage" },
      ],
    },
    {
      label: "Religion",
      icon: <LuCalendarDays size={20} />,
      subLinks: [
        { label: "Add Religion", toRoute: "/religion/addreligion" },
        { label: "List Religion", toRoute: "/religion/listreligion" },
      ],
    },
    {
      label: "Gift",
      icon: <LuMessagesSquare size={20} />,
      subLinks: [
        { label: "Add Gift", toRoute: "/gift/addgift" },
        { label: "List Gift", toRoute: "/gift/listgift" },
      ],
    },
    {
      label: "Relation Goal",
      icon: <TbLayoutSidebarLeftExpand size={20} />,
      subLinks: [
        { label: "Add Relation Goal", toRoute: "/relation/addrelationgoal" },
        { label: "List Relation Goal", toRoute: "/relation/listrelationgoal" },
      ],
    },
    {
      label: "FAQ",
      icon: <MdOutlineTextSnippet size={20} />,
      subLinks: [
        { label: "Add FAQ", toRoute: "/faq/addfaq" },
        { label: "List FAQ", toRoute: "/faq/listfaq" },
      ],
    },
    {
      label: "Plan",
      icon: <MdOutlineTextSnippet size={20} />,
      subLinks: [
        { label: "Add Plan", toRoute: "/plan/addplan" },
        { label: "List Plan", toRoute: "/plan/listplan" },
      ],
    },
    {
      label: "Package",
      icon: <MdOutlineTextSnippet size={20} />,
      subLinks: [
        { label: "Add Package", toRoute: "/package/addpackage" },
        { label: "List Package", toRoute: "/package/listpackage" },
      ],
    },
    {
      label: "Staff",
      icon: <MdOutlineTextSnippet size={20} />,
      subLinks: [
        { label: "Add Staff", toRoute: "/staff/addstaff" },
        { label: "List Staff", toRoute: "/staff/liststaff" },
      ],
    },
    {
      label: "Payment List",
      toRoute: "/paymentlist",
      icon: <RxDashboard size={20} />,
    },
    {
      label: "Fake User Generator",
      toRoute: "/fakeusergenerator",
      icon: <RxDashboard size={20} />,
    },
    {
      label: "Report List",
      toRoute: "/reportlist",
      icon: <RxDashboard size={20} />,
    },
    {
      label: "Page",
      icon: <MdOutlineTextSnippet size={20} />,
      subLinks: [
        { label: "Add Page", toRoute: "/page/addpage" },
        { label: "List Page", toRoute: "/page/listpage" },
      ],
    },
    {
      label: "Payout List",
      toRoute: "/payoutlist",
       subLinks: [
    { label: "Payout List", toRoute: "/payoutlist" },],
      icon: <RxDashboard size={20} />,
    },
    {
      label: "User List",
      icon: <MdOutlineTextSnippet size={20} />,
      subLinks: [
        { label: "All User List", toRoute: "/userlist/alluserlist" },
        { label: "MALE User List", toRoute: "/userlist/maleuserlist" },
        { label: "FEMALE User List", toRoute: "/userlist/femaleuserlist" },
      ],
    },
    {
      label: "Fake User List",
      icon: <MdOutlineTextSnippet size={20} />,
      subLinks: [
        { label: "All Fake User List", toRoute: "/fakeuser/allfakeuserlist" },
        { label: "MALE Fake User List", toRoute: "/reports/malefakeuserlist" },
        {
          label: "FEMALE Fake User List",
          toRoute: "/reports/femalefakeuserlist",
        },
      ],
    },
    {
      label: "Push Notification",
      toRoute: "/pushnotification",
      icon: <RxDashboard size={20} />,
    },
  ];

  return (
    <div className={styles.SideBar}>
      <div className={styles.schoolInfoBox}>
        <img src={SchoolLogo} alt="School Logo" className={styles.logo} />
        <h3> Dating</h3>
      </div>
      <div className={styles.MenuItemsList}>
        {sideBarMenuItems.map((item) => (
          <SideBarMainLink
            key={item.label}
            data={item}
            expandedLabel={expandedLabel}
            setExpandedLabel={setExpandedLabel}
          />
        ))}
      </div>
    </div>
  );
}

export default SideBar;
