import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../components/auth/Login";
import ForgotPassword from "../components/auth/ForgotPassword";
import CreateAccount from "../pages/user/CreateAccount";
import TermsPrivacy from "../pages/TermsPrivacy";

// Dashboards
import UserDashboard from "../pages/user/UserDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Default route → show user login */}
        <Route path="/" element={<Login role="user" />} />
        <Route path="/login" element={<Login role="user" />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />

        {/* Admin login */}
        <Route path="/admin/login" element={<Login role="admin" />} />

        {/* Create Account */}
        <Route path="/createaccount" element={<CreateAccount />} />
        <Route path="/termsprivacy" element={<TermsPrivacy />} />

        {/* User Dashboard */}
        <Route path="/dashboard" element={<UserDashboard />} />

        {/* Admin Dashboard */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
