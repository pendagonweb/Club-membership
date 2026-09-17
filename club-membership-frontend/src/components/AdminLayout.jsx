import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminNavigation from "./AdminNavigation";
import axios from "axios";

const { VITE_BACKEND_URL } = import.meta.env;

const ROUTE_PERMISSIONS = {
  "/admin": "requests",
  "/users": "members",
  "/juniors": "juniors",
  "/panels": "panels",
  "/admingallery": "gallery",
  "/adminactivities": "activities",
  "/adminlogo": "logo",
};

function AccessDenied({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400">
      <p className="text-5xl mb-4">🔒</p>
      <p className="font-semibold text-gray-600 text-lg">Access restricted</p>
      <p className="text-sm mt-1">
        Your admin account doesn't have {label ? `"${label}"` : "this"} access.
        <br />
        Ask the superadmin to grant it from Admin Management.
      </p>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const [juniorCount, setJuniorCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    if (!storedToken) navigate("/admin-login");
    else setToken(storedToken);
  }, [navigate]);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${VITE_BACKEND_URL}/api/admin-management/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAdminInfo(res.data.admin);
        localStorage.setItem("adminInfo", JSON.stringify(res.data.admin));
      })
      .catch(() => {
        localStorage.removeItem("adminToken");
        navigate("/admin-login");
      })
      .finally(() => setAdminLoading(false));
  }, [token, navigate]);

  const fetchUsers = async (authToken = token) => {
    if (!authToken) return;
    try {
      setLoading(true);
      const [usersRes, juniorsRes] = await Promise.all([
        axios.get(`${VITE_BACKEND_URL}/api/admin/all-users`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        axios.get(`${VITE_BACKEND_URL}/api/juniors`),
      ]);
      const allUsers = usersRes.data.users || [];
      setMembersCount(
        allUsers.filter((u) => u.membershipStatus === "approved").length,
      );
      const pending = allUsers.filter(
        (u) => u.membershipStatus === "pending_approval",
      );
      setPendingCount(pending.length);
      setUsers(pending);
      setJuniorCount(juniorsRes.data.juniors?.length || 0);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchUsers(token);
    const interval = setInterval(() => fetchUsers(token), 10000);
    return () => clearInterval(interval);
  }, [token]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout from Admin Panel?")) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminInfo");
      navigate("/admin-login");
    }
  };

  const isSuperAdmin = adminInfo?.role === "superadmin";
  const isAdminsRoute = location.pathname === "/admins";
  const requiredPermission = ROUTE_PERMISSIONS[location.pathname];

  let hasAccess = true;
  if (adminInfo) {
    if (isAdminsRoute) hasAccess = isSuperAdmin;
    else if (requiredPermission && !isSuperAdmin)
      hasAccess = adminInfo.permissions?.includes(requiredPermission);
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <AdminSidebar
        pendingCount={pendingCount}
        membersCount={membersCount}
        juniorCount={juniorCount}
        loading={loading}
        onLogout={handleLogout}
        adminInfo={adminInfo}
      />
      <AdminNavigation
        pendingCount={pendingCount}
        membersCount={membersCount}
        juniorCount={juniorCount}
        loading={loading}
        adminInfo={adminInfo}
      />

      <main className="flex-1 p-4 md:p-6 overflow-x-auto">
        {adminLoading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">
            Loading admin session…
          </div>
        ) : !hasAccess ? (
          <AccessDenied
            label={
              isAdminsRoute
                ? "Admin Management (superadmin only)"
                : requiredPermission
            }
          />
        ) : (
          React.Children.map(children, (child) =>
            React.cloneElement(child, {
              users,
              fetchUsers,
              loading,
              adminInfo,
            }),
          )
        )}
      </main>
    </div>
  );
}
