import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { isJunior, splitPhone } from "./helpers";
import UserCard from "./UserCard";
import EditUserModal from "./EditUserModal";
import ExportPdfModal from "./ExportPdfModal";

export default function AdminUserList() {
  const STATIC_VALID_UPTO = "31/03/2027";
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");
  const { VITE_BACKEND_URL } = import.meta.env;

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) throw new Error("Admin token not found");
      const res = await axios.get(`${VITE_BACKEND_URL}/api/admin/all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = res.data.users || [];
      setApprovedUsers(users.filter((u) => u.membershipStatus === "approved"));
      setRejectedUsers(users.filter((u) => u.membershipStatus === "rejected"));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) navigate("/admin-login");
    else fetchUsers();
  }, [token]);

  const approveUser = async (id) => {
    if (!window.confirm("Approve this user?")) return;
    await axios.put(
      `${VITE_BACKEND_URL}/api/admin/approve/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchUsers();
  };

  const rejectUser = async (id) => {
    if (!window.confirm("Reject this user?")) return;
    await axios.put(
      `${VITE_BACKEND_URL}/api/admin/reject/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    await axios.delete(`${VITE_BACKEND_URL}/api/admin/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  };

  const openEditModal = (user) => {
    const ph = splitPhone(user.phone || "");
    const wa = splitPhone(user.whatsapp || "");
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      designation: user.designation || "",
      nickname: user.nickname || "",
      phoneCode: ph.code,
      phone: ph.number,
      password: user.password || "",
      waCode: wa.code,
      whatsapp: wa.number,
      email: user.email || "",
      address: user.address || "",
      dob: user.dob ? user.dob.split("T")[0] : "",
      bloodGroup: user.bloodGroup || "",
      aadhaar: user.aadhaar || "",
      place: user.place || "",
      paymentAmount: user.paymentAmount || 0,
      gender: user.gender || "",
      nri: user.nri || "No",
      expiryDate: user.expiryDate
        ? new Date(user.expiryDate).toISOString().split("T")[0]
        : "2027-03-31",
    });
  };

  const handleSaveChanges = async () => {
    try {
      setActionLoading(true);
      const payload = {
        ...editForm,
        phone: editForm.phoneCode + editForm.phone.replace(/[^\d]/g, ""),
        whatsapp: editForm.waCode + editForm.whatsapp.replace(/[^\d]/g, ""),
      };
      delete payload.phoneCode;
      delete payload.waCode;

      await axios.put(
        `${VITE_BACKEND_URL}/api/admin/user/${editingUser._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setActionLoading(false);
    }
  };

  const getWhatsAppLink = (user) => {
    let phone = String(user.whatsapp || user.phone || "").replace(/[^\d]/g, "");
    if (phone.length === 10) phone = `91${phone}`;
    phone = phone.replace(/^0+/, "");

    let message = "";
    if (user.membershipStatus === "approved") {
      message = `Hello *${user.name}*, Welcome to Kingstar Arts & Sports Club.
🎉 Your membership has been approved!

🆔 Membership ID: *${user.membershipId}*
🔐 Password: *${user.password || "—"}*
✳️ Registered Mob No.: ${user.phone}

Membership Validity: ${user.expiryDate ? new Date(user.expiryDate).toLocaleDateString() : STATIC_VALID_UPTO}

📥 Download your Membership 👇
https://kingstareriyapady.club/login

Member Details:
• Full Name: ${user.name}
• Display / Nick Name: ${user.nickname || "—"}
• Father's Name: ${user.fatherName || "—"}
• Place: ${user.address || "—"}
• Blood Group: ${user.bloodGroup || "—"}

Thank you for becoming a member of Kingstar Arts & Sports Club.

Sabit Aboobacker (Gen. Sec)
📞 91 9747656653`;
    } else if (user.membershipStatus === "rejected") {
      message = `Hello ${user.name}, 
Your membership request with Kingstar Eriyapady has been *rejected* due to _______.

For further clarification, please contact the Secretary at:
📞 91 9747656653 (Sabit)

_Thank you for your interest in Kingstar Arts & Sports Club._

---------------------------------
_Kingstareriyapady.club_ | https://www.instagram.com/kingstar.club/
_________________

For further clarification, please contact:
📞 91 9747656653 (Sabit Aboobacker – Gen. Sec)

_Thank you for your interest in Kingstar Arts & Sports Club._

------------------------------
Kingstar Arts & Sports Club`;
    }
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  const allUsers = [...approvedUsers, ...rejectedUsers];
  const statusFiltered =
    filter === "all"
      ? allUsers
      : filter === "approved"
        ? approvedUsers
        : rejectedUsers;
  const q = search.trim().toLowerCase();
  const filteredUsers = q
    ? statusFiltered.filter((u) => {
        if (q === "nri") return u.nri === "Yes";
        if (q === "junior") return isJunior(u.dob);
        return (
          (u.name || "").toLowerCase().includes(q) ||
          String(u.membershipId || "")
            .toLowerCase()
            .includes(q)
        );
      })
    : statusFiltered;

  return (
    <>
      <main className="flex-1 p-3 sm:p-4 md:p-6 pb-20">
        {/* Title row with Export button */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div className="flex-1" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center flex-1">
            User List
          </h1>
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition shadow"
            >
              📄 <span className="hidden sm:inline">Export as PDF</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4 relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search by name, membership ID, or type "nri" / "junior"…'
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 text-lg"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
          {["all", "approved", "rejected"].map((f) => {
            const count =
              f === "all"
                ? allUsers.length
                : f === "approved"
                  ? approvedUsers.length
                  : rejectedUsers.length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm sm:text-base ${
                  filter === f ? "bg-gray-800 text-white" : "bg-white border"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} ({count})
              </button>
            );
          })}
        </div>

        {/* Result count hint when searching */}
        {q && (
          <p className="text-xs text-gray-500 text-center mb-3">
            {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}{" "}
            for &quot;{search}&quot;
          </p>
        )}

        {/* Users Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              STATIC_VALID_UPTO={STATIC_VALID_UPTO}
              approveUser={approveUser}
              rejectUser={rejectUser}
              deleteUser={deleteUser}
              openEditModal={openEditModal}
              getWhatsAppLink={getWhatsAppLink}
            />
          ))}
        </div>
      </main>

      {editingUser && (
        <EditUserModal
          editForm={editForm}
          setEditForm={setEditForm}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveChanges}
          actionLoading={actionLoading}
        />
      )}

      {/* EXPORT PDF MODAL */}
      {showExportModal && (
        <ExportPdfModal
          users={allUsers}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </>
  );
}
