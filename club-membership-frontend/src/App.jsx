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
import Home from "./pages/Home";
import Header from "./components/Header";
import JuniorRegister from "./pages/JuniorRegister";

/* Wraps all public (non-admin) pages with Header + Footer */
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow">{children}</div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES — with Header & Footer */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />
        <Route
          path="/login"
          element={
            <PublicLayout>
              <Login />
            </PublicLayout>
          }
        />
        <Route
          path="/register"
          element={
            <PublicLayout>
              <MemberRegister />
            </PublicLayout>
          }
        />
        <Route
          path="/upload-payment"
          element={
            <PublicLayout>
              <UploadPayment />
            </PublicLayout>
          }
        />
        <Route
          path="/admin-login"
          element={
            <PublicLayout>
              <AdminLogin />
            </PublicLayout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PublicLayout>
              <MemberDashboard />
            </PublicLayout>
          }
        />
        <Route
          path="/member"
          element={
            <PublicLayout>
              <MembershipCard />
            </PublicLayout>
          }
        />
        <Route
          path="/junior-register"
          element={
            <PublicLayout>
              <JuniorRegister />
            </PublicLayout>
          }
        />

        {/* ADMIN ROUTES — no Header or Footer, AdminLayout handles its own UI */}
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
    </Router>
  );
}

export default App;
