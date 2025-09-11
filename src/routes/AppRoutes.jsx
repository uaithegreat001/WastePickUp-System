import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../components/auth/Login";
import ForgotPassword from "../components/auth/ForgotPassword";
import CreateAccount from "../pages/user/CreateAccount";
import TermsPrivacy from "../components/ui/TermsPrivacy";


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
        <Route path="/createAccount" element={<CreateAccount />} />
        <Route path="/termsPrivacy" element={<TermsPrivacy />} />

      </Routes>
    </Router>
  );
}

