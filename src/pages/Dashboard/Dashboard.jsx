
import DashboardCard from "../../components/DashboardCard/DashboardCard";

import icon1 from "../../assets/icons/one.svg";
import icon2 from "../../assets/icons/two.svg";
import icon3 from "../../assets/icons/three.svg";
import icon4 from "../../assets/icons/four.svg";

const cardsData = [
  { label: "Interest", value: 20, icon: icon1 },
  { label: "Language", value: 22, icon: icon2 },
  { label: "Religion", value: 8, icon: icon3 },
  { label: "Relation Goal", value: 12, icon: icon4 },
  { label: "FAQ", value: 11, icon: icon1 },
  { label: "Plan", value: 16, icon: icon2 },
  { label: "Total Users", value: 341, icon: icon3 },
  { label: "Total Pages", value: 4, icon: icon4 },
  { label: "Total Gift", value: 18, icon: icon1 },
  { label: "Total Package", value: 6, icon: icon2 },
  { label: "Total Male", value: 27, icon: icon3 },
  { label: "Total Female", value: 314, icon: icon4 },
  { label: "Total Fake User", value: 300, icon: icon1 },
  { label: "Total Earning", value: "0₹", icon: icon4 },
];

const Dashboard = () => {
  return (
    <div
      className="dashboard-wrapper"
      style={{ backgroundColor: "var(--Background_Color)", padding: "20px" }}
    >
      <h2 style={{ marginBottom: "20px", fontWeight: "700" }}>Report Data</h2>
      <div
        className="dashboard-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "20px",
        }}
      >
        {cardsData.map((card, index) => (
          <DashboardCard
            key={index}
            label={card.label}
            value={card.value}
            icon={card.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
