import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";

const { VITE_BACKEND_URL } = import.meta.env;

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const [juniorCount, setJuniorCount] = useState(0); // ← add
  const [users, setUsers] = useState([]); // pending users for AdminPage
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");

    if (!storedToken) {
      navigate("/admin-login");
    } else {
      setToken(storedToken);
    }
  }, [navigate]);

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

      setJuniorCount(juniorsRes.data.juniors?.length || 0); // ← add
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchUsers(token);

    const interval = setInterval(() => {
      fetchUsers(token);
    }, 10000);

    return () => clearInterval(interval);
  }, [token]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout from Admin Panel?")) {
      localStorage.removeItem("adminToken");
      navigate("/admin-login");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <AdminSidebar
        pendingCount={pendingCount}
        membersCount={membersCount}
        juniorCount={juniorCount} 
        loading={loading}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-4 md:p-6 overflow-x-auto">
        {React.Children.map(children, (child) =>
          React.cloneElement(child, { users, fetchUsers, loading }),
        )}
      </main>
    </div>
  );
}
