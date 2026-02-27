import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminPage from "./components/AdminPage";
import UserList from "./components/UserList";
import AdminLayout from "./components/AdminLayout";
import Login from "./components/Login";
import MemberRegister from "./components/MemberRegister";
import UploadPayment from "./components/UpdatePayment";
import AdminLogin from "./components/AdminLogin";
import MemberDashboard from "./components/MembershipDashboard";
import MembershipCard from "./pages/MemberCard";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<MemberRegister />} />
            <Route path="/upload-payment" element={<UploadPayment />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/dashboard" element={<MemberDashboard />} />
            <Route path="/member" element={<MembershipCard />} />

            {/* ADMIN ROUTES */}
            <Route
              path="/admin"
              element={
                <AdminLayout>
                  <AdminPage />
                </AdminLayout>
              }
            />

            <Route
              path="/users"
              element={
                <AdminLayout>
                  <UserList />
                </AdminLayout>
              }
            />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
