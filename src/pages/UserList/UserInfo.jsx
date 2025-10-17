import React, { useEffect, useState } from "react";
import styles from "./UserInfo.module.css";
import { useParams, useNavigate } from "react-router-dom";
import OtherInformation from "../../components/OtherInformation/OtherInformation"; // ✅ Import your component

const UserInfo = () => {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // ✨ Mock dynamic data
    const mockUser = {
      id: user_id,
      name: "Harika",
      profile_bio: "I love exploring new places!",
      birth_date: "1998-07-21",
      search_preference: "Men",
      relationGoal: {
        title: "Serious Relationship",
        subtitle: "Looking for long-term commitment",
      },
      gender: "Female",
      religionTitle: "Hindu",
      radius_search: 50,
      wallet: 150,
      is_subscribe: true,
      plan_title: "Premium",
      plan_start_date: "2025-07-01",
      plan_end_date: "2025-08-01",
      interests: [
        {
          id: 1,
          title: "Music",
          img: "https://cdn-icons-png.flaticon.com/512/727/727245.png",
        },
        {
          id: 2,
          title: "Travel",
          img: "https://cdn-icons-png.flaticon.com/512/69/69906.png",
        },
      ],
      languages: [
        {
          id: 1,
          title: "English",
          img: "https://cdn-icons-png.flaticon.com/512/197/197374.png",
        },
        {
          id: 2,
          title: "Hindi",
          img: "https://cdn-icons-png.flaticon.com/512/197/197426.png",
        },
      ],
      otherPictures: [
        "https://via.placeholder.com/60x60",
        "https://via.placeholder.com/60x60?text=2",
        "https://via.placeholder.com/60x60?text=3",
      ],
      lats: 17.385,
      longs: 78.4867,
    };

    setUserInfo(mockUser);
  }, [user_id]);

  if (!userInfo) return <div>Loading...</div>;

  const interests = userInfo.interests || [];
  const languages = userInfo.languages || [];
  const pictures = userInfo.otherPictures || [];

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className={styles.container}>
      <h2>User Info Management</h2>

      <div className={styles.header}>
        <div className={styles.profileCard}>
          <h5>My Profile</h5>
          <img src={pictures[0]} alt="profile" className={styles.profileImg} />
          <h4>{userInfo.name}</h4>
        </div>

        <div className={styles.mapCard}>
          <h5>Location</h5>
          <div id="map" className={styles.map}></div>
        </div>
      </div>

      <div className={styles.buttonRow}>
        <button
          onClick={() => navigate(`/wallet/${user_id}`)}
          className={styles.walletBtn}
        >
          Wallet Operation
        </button>
        <button
          onClick={() => navigate(`/coin/${user_id}`)}
          className={styles.coinBtn}
        >
          Coin Operation
        </button>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h5>Other Pictures</h5>
          <div className={styles.picList}>
            {pictures.map((img, i) => (
              <img key={i} src={img} alt={`user-pic-${i}`} />
            ))}
          </div>
        </div>

        {/* ✅ Using dynamic OtherInformation component */}
        <OtherInformation userInfo={userInfo} />

        {userInfo.is_subscribe && (
          <div className={styles.card}>
            <h5>
              Plan Information{" "}
              <span className={styles.planBadge}>
                {userInfo.plan_title} Membership
              </span>
            </h5>
            <p>
              <b>Start Date:</b> {formatDate(userInfo.plan_start_date)}
            </p>
            <p>
              <b>End Date:</b> {formatDate(userInfo.plan_end_date)}
            </p>
          </div>
        )}

        <div className={styles.card}>
          <h5>Interest</h5>
          <div className={styles.iconList}>
            {interests.map((int) => (
              <div key={int.id} className={styles.iconItem}>
                <img src={int.img} alt={int.title} />
                <span>{int.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h5>Languages Known</h5>
          <div className={styles.iconList}>
            {languages.map((lang) => (
              <div key={lang.id} className={styles.iconItem}>
                <img src={lang.img} alt={lang.title} />
                <span>{lang.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Google Map Script */}
      <script
        async
        defer
        src={`https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`}
      ></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          function initMap() {
            const userLatLng = { lat: ${userInfo.lats}, lng: ${userInfo.longs} };
            const map = new google.maps.Map(document.getElementById('map'), {
              zoom: 8,
              center: userLatLng
            });
            new google.maps.Marker({
              position: userLatLng,
              map: map,
              title: '${userInfo.name} Location'
            });
          }
        `,
        }}
      />
    </div>
  );
};

export default UserInfo;
