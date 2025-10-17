// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Public pages
import LogIn from "../views/RootLayout/LogIn/LogIn";
import Logout from "../views/Auth/Logout";

// Layout + protected pages
import DashboardLayout from "../layouts/DashboardLayout/DashboardLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import AddInterest from "../pages/Interest/AddInterest";
import ListInterest from "../pages/Interest/ListInterest";
import AddLanguage from "../pages/Language/AddLanguage";
import ListLanguage from "../pages/Language/ListLanguage";
import AddReligion from "../pages/Religion/AddReligion";
import ListReligion from "../pages/Religion/ListReligion";
import AddGift from "../pages/Gift/AddGift";
import ListGift from "../pages/Gift/ListGift";
import AddRelationGoal from "../pages/RelationGoal/AddRelationGoal";
import ListRelationGoal from "../pages/RelationGoal/ListRelationGoal";
import AddFAQ from "../pages/FAQ/AddFaq";
import ListFaq from "../pages/FAQ/ListFaq";
import AddPlan from "../pages/Plan/AddPlan";
import ListPlan from "../pages/Plan/ListPlan";
import AddPackage from "../pages/Package/AddPackage";
import ListPackage from "../pages/Package/ListPackage";
import AdminProfile from "../pages/AdminProfile/AdminProfile";
import ListStaff from "../pages/Staff/ListStaff";
import PaymentList from "../pages/PaymentList/PaymentList";
import ReportList from "../pages/ReportList/ReportList";
import ListPage from "../pages/Page/ListPage";
import AddPage from "../pages/Page/AddPage";
import PayoutList from "../pages/PayoutList/PayoutList";
import CompletePayout from "../pages/PayoutList/CompletePayout";
import PushNotification from "../pages/PushNotification/PushNotification";
import AllUserList from "../pages/UserList/AllUserList/AllUserList";
import UserInfo from "../pages/UserList/UserInfo";
import WalletManage from "../pages/UserList/WalletManage";
import CoinManage from "../pages/UserList/CoinManage";

import { isAuthed } from "../utils/auth";

// wrappers
function PublicOnly() {
  return isAuthed() ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
function RequireAuth() {
  return isAuthed() ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* root: bounce to dashboard or login */}
      <Route
        path="/"
        element={
          isAuthed() ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* public-only */}
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LogIn />} />
        <Route path="/admin/login" element={<LogIn />} />
      </Route>

      {/* always clear session and redirect */}
      <Route path="/logout" element={<Logout />} />

      {/* protected area */}
      <Route element={<RequireAuth />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Interest */}
          <Route path="admin/profile" element={<AdminProfile />} />
          <Route path="interest/addinterest" element={<AddInterest />} />
          <Route path="interest/editinterest/:id" element={<AddInterest />} />
          <Route path="interest/listinterest" element={<ListInterest />} />

          {/* Language */}
          <Route path="language/addlanguage" element={<AddLanguage />} />
          <Route path="language/editlanguage/:id" element={<AddLanguage />} />
          <Route path="language/listlanguage" element={<ListLanguage />} />

          {/* Religion */}
          <Route path="religion/addreligion" element={<AddReligion />} />
          <Route path="religion/editreligion/:id" element={<AddReligion />} />
          <Route path="religion/listreligion" element={<ListReligion />} />

          {/* Gift */}
          <Route path="gift/addgift" element={<AddGift />} />
          <Route path="gift/editgift/:id" element={<AddGift />} />
          <Route path="gift/listgift" element={<ListGift />} />

          {/* Relation Goal */}
          <Route path="relation/addrelationgoal" element={<AddRelationGoal />} />
          <Route path="relation/editrelationgoal/:id" element={<AddRelationGoal />} />
          <Route path="relation/listrelationgoal" element={<ListRelationGoal />} />

          {/* FAQ */}
          <Route path="faq/addfaq" element={<AddFAQ />} />
          <Route path="faq/editfaq/:id" element={<AddFAQ />} />
          <Route path="faq/listfaq" element={<ListFaq />} />

          {/* Plan */}
          <Route path="plan/addplan" element={<AddPlan />} />
          <Route path="plan/editplan/:id" element={<AddPlan />} />
          <Route path="plan/listplan" element={<ListPlan />} />

          {/* Package */}
          <Route path="package/addpackage" element={<AddPackage />} />
          <Route path="package/editpackage/:id" element={<AddPackage />} />
          <Route path="package/listpackage" element={<ListPackage />} />

          {/* Staff + Payments */}
          <Route path="staff/liststaff" element={<ListStaff />} />
          <Route path="paymentlist" element={<PaymentList />} />
          <Route path="reportlist" element={<ReportList />} />

          {/* Page Management */}
          <Route path="page/addpage" element={<AddPage />} />
          <Route path="page/editpage/:id" element={<AddPage />} />
          <Route path="page/listpage" element={<ListPage />} />

          {/* Payout */}
          <Route path="payoutlist" element={<PayoutList />} />
          <Route path="payout/complete/:id" element={<CompletePayout />} />

          {/* Users */}
          <Route path="userlist/alluserlist" element={<AllUserList />} />
          <Route path="user-info/:user_id" element={<UserInfo />} />
          <Route path="wallet/:user_id" element={<WalletManage />} />
          <Route path="coin/:user_id" element={<CoinManage />} />

          {/* Misc */}
          <Route path="pushnotification" element={<PushNotification />} />
        </Route>
      </Route>

      {/* fallback */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}
