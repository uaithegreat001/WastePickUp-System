import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../components/auth/Login";
import CreateAccount from "../pages/user/CreateAccount";
import TermsPrivacy from "../components/Reusable/TermsPrivacy";


export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Default route → show user login */}
        <Route path="/" element={<Login role="user" />} />
        <Route path="/login" element={<Login role="user" />} />

        {/* Admin login */}
        <Route path="/admin/login" element={<Login role="admin" />} />

               {/* Create Account */}
        <Route path="/CreateAccount" element={<CreateAccount />} />
        <Route path="/TermsPrivacy" element={<TermsPrivacy />} />

      </Routes>
    </Router>
  );
}

