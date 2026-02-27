import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaAngleUp } from "react-icons/fa";
import { FaAngleDown } from "react-icons/fa";

export default function AdminUserList() {
  const STATIC_VALID_UPTO = "31/03/2027";
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) throw new Error("Admin token not found");
      const res = await axios.get(
        "https://club-membership.vercel.app/api/admin/all-users",
        { headers: { Authorization: `Bearer ${token}` } },
      );
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
      `https://club-membership.vercel.app/api/admin/approve/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchUsers();
  };

  const rejectUser = async (id) => {
    if (!window.confirm("Reject this user?")) return;
    await axios.put(
      `https://club-membership.vercel.app/api/admin/reject/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    await axios.delete(
      `https://club-membership.vercel.app/api/admin/user/${id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchUsers();
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
      address: user.address || "",
      dob: user.dob ? user.dob.split("T")[0] : "",
      bloodGroup: user.bloodGroup || "",
      place: user.place || "",
      gender: user.gender || "",
    });
  };

  const handleSaveChanges = async () => {
    try {
      setActionLoading(true);
      await axios.put(
        `https://club-membership.vercel.app/api/admin/user/${editingUser._id}`,
        editForm,
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
    const phone = (user.whatsapp || user.phone).replace("+", "");

    let message = "";

    if (user.membershipStatus === "approved") {
      // 🟢 APPROVED MESSAGE
      message = `Hello ${user.name}, Welcome to Kingstar Arts & Sports Club.
🎉 Your membership has been approved!

Membership ID: *${user.membershipId}*
Login Mob No.: ${user.phone}

*Download your Membership* 👇
https://kingstareriyapady.club/dashboard

_________________

Member Details:
• Full Name: ${user.name}
• Display / Nick Name: ${user.nickname || "—"}
• Father’s Name: ${user.fatherName || "—"}
• Place: ${user.address || "—"}
• Blood Group: ${user.bloodGroup || "—"}
• Valid Upto: 31/03/2027

_Thank you for becoming a member of Kingstar Arts & Sports Club._

------------------------------
- Sabit Aboobacker (Gen. Sec)
📞 91 9747656653`;
    } else if (user.membershipStatus === "rejected") {
      // 🔴 REJECTED MESSAGE
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

  const filteredUsers =
    filter === "all"
      ? [...approvedUsers, ...rejectedUsers]
      : filter === "approved"
        ? approvedUsers
        : rejectedUsers;

  return (
    <>
      {/* Sidebar */}

      {/* MAIN */}
      <main className="flex-1 p-3 sm:p-4 md:p-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-5 sm:mb-6">
          User List
        </h1>

        {/* Filter Buttons */}
<div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
  {["all", "approved", "rejected"].map((f) => {
    let count = 0;
    if (f === "all") count = approvedUsers.length + rejectedUsers.length;
    if (f === "approved") count = approvedUsers.length;
    if (f === "rejected") count = rejectedUsers.length;

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


        {/* Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-4">
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

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-center">
              Edit User
            </h2>
            <input
              className="w-full border p-2 rounded"
              placeholder="Name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />
            <input
              className="w-full border p-2 rounded"
              placeholder="Phone"
              value={editForm.phone}
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
            />
            <input
              className="w-full border p-2 rounded"
              placeholder="Email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
            />
            <input
              type="date"
              className="w-full border p-2 rounded"
              value={editForm.dob}
              onChange={(e) =>
                setEditForm({ ...editForm, dob: e.target.value })
              }
            />
            <input
              className="w-full border p-2 rounded"
              placeholder="Blood Group"
              value={editForm.bloodGroup}
              onChange={(e) =>
                setEditForm({ ...editForm, bloodGroup: e.target.value })
              }
            />
            <textarea
              className="w-full border p-2 rounded"
              placeholder="Address"
              value={editForm.address}
              onChange={(e) =>
                setEditForm({ ...editForm, address: e.target.value })
              }
            />
            <input
              className="w-full border p-2 rounded"
              placeholder="Place"
              value={editForm.place}
              onChange={(e) =>
                setEditForm({ ...editForm, place: e.target.value })
              }
            />

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function UserCard({
  user,
  approveUser,
  rejectUser,
  deleteUser,
  openEditModal,
  getWhatsAppLink,
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 w-full flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
  <img
    src={user.photo || "/default-user.png"}
    alt={user.name}
    className="w-20 h-20 rounded-full object-cover border"
  />
  <div className="flex flex-col">
    <p className="font-semibold text-lg">{user.name}</p>
    <p className="text-xs text-gray-600">ID: {user.membershipId}</p>
    {user.photo && (
      <a
        href={user.photo}
        download={`${user.name}-photo`}
        className="mt-1 text-xs text-blue-600 hover:underline"
      >
        Download Photo
      </a>
    )}
  </div>
</div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-3 py-1 text-xs bg-indigo-500 text-white rounded"
        >
          {expanded ? <FaAngleUp /> : <FaAngleDown />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 text-sm space-y-2">
          <p>
            <b>Phone:</b> {user.phone}
          </p>
          <p>
            <b>Email:</b> {user.email || "—"}
          </p>
          <p>
            <b>Father:</b> {user.fatherName || "—"}
          </p>
          <p>
            <b>Nickname:</b> {user.nickname || "—"}
          </p>
          <p>
            <b>Whatsapp:</b> {user.whatsapp || "—"}
          </p>
          <p><b>DOB:</b> {user.dob ? new Date(user.dob).toLocaleDateString() : "—"}</p>
          <p>
            <b>Blood Group:</b> {user.bloodGroup || "—"}
          </p>
          <p>
            <b>Address:</b> {user.address || "—"}
          </p>
          <p>
            <b>Place:</b> {user.place || "—"}
          </p>

          <div className="flex gap-2 flex-wrap pt-2">
            {user.membershipStatus === "approved" ? (
              <>
                <button
                  onClick={() => rejectUser(user._id)}
                  className="px-2 py-1 text-xs bg-orange-600 text-white rounded"
                >
                  Reject
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() =>
                    user.membershipStatus === "approved"
                      ? rejectUser(user._id)
                      : approveUser(user._id)
                  }
                  className={`px-2 py-1 text-xs text-white rounded ${
                    user.membershipStatus === "approved"
                      ? "bg-orange-600"
                      : "bg-green-600"
                  }`}
                >
                  {user.membershipStatus === "approved"
                    ? "Reject"
                    : "Re-Approve"}
                </button>
              </>
            )}

            <button
              onClick={() => openEditModal(user)}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
            >
              Edit
            </button>

            <button
              onClick={() => deleteUser(user._id)}
              className="px-2 py-1 text-xs bg-red-800 text-white rounded"
            >
              Delete
            </button>

            <a
              href={getWhatsAppLink(user)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 text-xs bg-gray-800 text-white rounded"
            >
              Share
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
