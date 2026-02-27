import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const [users, setUsers] = useState([]); // pending users for AdminPage
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("adminToken");

  const fetchUsers = async () => {
    if (!token) {
      navigate("/admin-login");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        "https://club-membership.vercel.app/api/admin/all-users",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const allUsers = res.data.users || [];

      setMembersCount(allUsers.filter(u => u.membershipStatus === "approved").length);
      const pending = allUsers.filter(u => u.membershipStatus === "pending");
      setPendingCount(pending.length);

      setUsers(pending); // pass to children
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000); // refresh every 30s
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
        loading={loading}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-4 md:p-6 overflow-x-auto">
        {React.Children.map(children, child =>
          React.cloneElement(child, { users, fetchUsers, loading })
        )}
      </main>
    </div>
  );
}
