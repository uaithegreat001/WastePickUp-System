import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
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

// Protecting routes based on authentication and roles
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return null; 

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userData?.role !== requiredRole) {
    // Route a user to their appropriate dashboard based on role
    const redirectPath =
      userData?.role === "admin"
        ? "/admin/dashboard"
        : userData?.role === "collector"
          ? "/collector/dashboard"
          : "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

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

        {/* User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute requiredRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/request-pickup"
          element={
            <ProtectedRoute requiredRole="user">
              <RequestPickup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/settings"
          element={
            <ProtectedRoute requiredRole="user">
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/notifications"
          element={
            <ProtectedRoute requiredRole="user">
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminProfile />
            </ProtectedRoute>
          }
        />

        {/* Collector Routes */}
        <Route
          path="/collector/dashboard"
          element={
            <ProtectedRoute requiredRole="collector">
              <CollectorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collector/history"
          element={
            <ProtectedRoute requiredRole="collector">
              <CollectorHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collector/settings"
          element={
            <ProtectedRoute requiredRole="collector">
              <CollectorProfile />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
