import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import CreateAccount from "../pages/auth/CreateAccount";

// User pages
import UserDashboard from "../pages/user/UserDashboard";
import OrderBin from "../pages/user/OrderBin";
import RequestPickup from "../pages/user/RequestPickup";
import UserProfile from "../pages/user/UserProfile";
import UserMessage from "../pages/user/UserMessage";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";
import Payments from "../pages/admin/Payments";
import UsersMessages from "../pages/admin/UsersMessages";
import AdminProfile from "../pages/admin/AdminProfile";
import Settings from "../pages/admin/Settings";

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

        {/* User */}
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/request-pickup" element={<RequestPickup />} />
        <Route path="/user/order-bin" element={<OrderBin />} />
        <Route path="/user/profile" element={<UserProfile />} />
        <Route path="/user/message" element={<UserMessage />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/payments" element={<Payments />} />
        <Route path="/admin/support" element={<UsersMessages />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}
