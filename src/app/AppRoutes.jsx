import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../features/auth/Login";
import ForgotPassword from "../features/auth/ForgotPassword";
import CreateAccount from "../features/auth/CreateAccount";

import UserDashboard from "../features/user/UserDashboard";
import RequestPickup from "../features/user/RequestPickup";
import UserProfile from "../features/user/UserProfile";
import Notifications from "../features/user/Notifications";
import AdminDashboard from "../features/admin/AdminDashboard";
import AdminProfile from "../features/admin/AdminProfile";
import AdminUsers from "../features/admin/AdminUsers";

import CollectorDashboard from "../features/collector/CollectorDashboard";
import CollectorHistory from "../features/collector/CollectorHistory";
import CollectorProfile from "../features/collector/CollectorProfile";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login role="user" />} />
        <Route path="/login" element={<Login role="user" />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/admin/login" element={<Login role="admin" />} />
        <Route path="/createaccount" element={<CreateAccount />} />

        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/request-pickup" element={<RequestPickup />} />
        <Route path="/user/settings" element={<UserProfile />} />
        <Route path="/user/notifications" element={<Notifications />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/settings" element={<AdminProfile />} />

        {/* Collector */}
        <Route path="/collector/dashboard" element={<CollectorDashboard />} />
        <Route path="/collector/history" element={<CollectorHistory />} />
        <Route path="/collector/settings" element={<CollectorProfile />} />
      </Routes>
    </Router>
  );
}
