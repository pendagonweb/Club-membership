import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaAngleUp, FaAngleDown } from "react-icons/fa";

// ─── PDF Export Modal ────────────────────────────────────────────────────────
const ALL_FIELDS = [
  { key: "membershipId", label: "Membership ID" },
  { key: "name", label: "Name" },
  { key: "fatherName", label: "Father's Name" },
  { key: "nickname", label: "Nickname" },
  { key: "phone", label: "Phone" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "dob", label: "Date of Birth" },
  { key: "bloodGroup", label: "Blood Group" },
  { key: "address", label: "Address" },
  { key: "place", label: "Place" },
  { key: "gender", label: "Gender" },
  { key: "nri", label: "NRI" },
  { key: "membershipStatus", label: "Status" },
];

function ExportPdfModal({ users, onClose }) {
  const [selected, setSelected] = useState(["name", "phone"]);
  const [filterStatus, setFilterStatus] = useState("all");

  const toggle = (key) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...selected];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setSelected(next);
  };

  const moveDown = (idx) => {
    if (idx === selected.length - 1) return;
    const next = [...selected];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setSelected(next);
  };

  const exportPdf = async () => {
    if (selected.length === 0) {
      alert("Please select at least one field.");
      return;
    }

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement("script");
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });

    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    );
    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js",
    );

    const { jsPDF } = window.jspdf;

    // ── Updated filter logic ──────────────────────────────────────────────
    const filteredUsers =
      filterStatus === "all"
        ? users
        : filterStatus === "nri"
          ? users.filter((u) => u.nri === "Yes")
          : users.filter((u) => u.membershipStatus === filterStatus);
    // ─────────────────────────────────────────────────────────────────────

    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(14);
    doc.text("Kingstar Arts & Sports Club – Member List", 14, 14);
    doc.setFontSize(9);
    doc.text(
      `Filter: ${filterStatus.toUpperCase()}   |   Total: ${filteredUsers.length}   |   Generated: ${new Date().toLocaleDateString()}`,
      14,
      21,
    );

    const columns = selected.map((key) => ({
      header: ALL_FIELDS.find((f) => f.key === key)?.label || key,
      dataKey: key,
    }));

    const rows = filteredUsers.map((u, i) => {
      const row = { "#": i + 1 };
      selected.forEach((key) => {
        let val = u[key] ?? "—";
        if (key === "dob" && val && val !== "—")
          val = new Date(val).toLocaleDateString();
        row[key] = val;
      });
      return row;
    });

    doc.autoTable({
      startY: 26,
      columns: [{ header: "#", dataKey: "#" }, ...columns],
      body: rows,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [31, 41, 55],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14, right: 14 },
    });

    doc.save("kingstar-members.pdf");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 text-white px-5 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-lg font-bold">Export Members as PDF</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* Status Filter */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Filter Members
            </p>
            {/* ── Updated: 4-button row ──────────────────────────────────── */}
            <div className="flex gap-2">
              {["all", "approved", "rejected", "nri"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`flex-1 py-1.5 rounded-lg text-sm border transition ${
                    filterStatus === s
                      ? s === "nri"
                        ? "bg-green-700 text-white border-green-700"
                        : "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {s === "nri" ? "NRI" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            {/* ─────────────────────────────────────────────────────────── */}
          </div>

          {/* Field Selection */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Select &amp; Order Fields
            </p>
            <div className="border rounded-xl overflow-hidden divide-y divide-gray-100">
              {ALL_FIELDS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(key)}
                    onChange={() => toggle(key)}
                    className="w-4 h-4 accent-gray-900"
                  />
                  <span className="text-sm text-gray-800">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Selected Order */}
          {selected.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Column Order (drag to reorder)
              </p>
              <div className="space-y-1">
                {selected.map((key, idx) => {
                  const label =
                    ALL_FIELDS.find((f) => f.key === key)?.label || key;
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2"
                    >
                      <span className="text-sm font-medium text-indigo-800">
                        <span className="text-indigo-400 mr-2">{idx + 1}.</span>
                        {label}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveUp(idx)}
                          className="p-1 text-indigo-500 hover:text-indigo-800 disabled:opacity-30"
                          disabled={idx === 0}
                        >
                          <FaAngleUp size={12} />
                        </button>
                        <button
                          onClick={() => moveDown(idx)}
                          className="p-1 text-indigo-500 hover:text-indigo-800 disabled:opacity-30"
                          disabled={idx === selected.length - 1}
                        >
                          <FaAngleDown size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={exportPdf}
            className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition"
          >
            📄 Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
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
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      phone: user.phone || "",
      whatsapp: user.whatsapp || "",
      email: user.email || "",
      address: user.address || "",
      dob: user.dob ? user.dob.split("T")[0] : "",
      bloodGroup: user.bloodGroup || "",
      place: user.place || "",
      gender: user.gender || "",
      nri: user.nri || "No",
    });
  };

  const handleSaveChanges = async () => {
    try {
      setActionLoading(true);
      await axios.put(
        `${VITE_BACKEND_URL}/api/admin/user/${editingUser._id}`,
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
    let phone = String(user.whatsapp || user.phone || "").replace(/[^\d]/g, "");
    if (phone.length === 10) phone = `91${phone}`;
    phone = phone.replace(/^0+/, "");

    let message = "";
    if (user.membershipStatus === "approved") {
      message = `Hello ${user.name}, Welcome to Kingstar Arts & Sports Club.
🎉 Your membership has been approved!

Membership ID: *${user.membershipId}*
Login Mob No.: ${user.phone}

*Download your Membership* 👇
https://kingstareriyapady.club/login

_________________

Member Details:
• Full Name: ${user.name}
• Display / Nick Name: ${user.nickname || "—"}
• Father's Name: ${user.fatherName || "—"}
• Place: ${user.address || "—"}   
• Blood Group: ${user.bloodGroup || "—"}
• Valid Upto: 31/03/2027

_Thank you for becoming a member of Kingstar Arts & Sports Club._

------------------------------
- Sabit Aboobacker (Gen. Sec)
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
  const filteredUsers =
    filter === "all"
      ? allUsers
      : filter === "approved"
        ? approvedUsers
        : rejectedUsers;

  return (
    <>
      <main className="flex-1 p-3 sm:p-4 md:p-6">
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

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
          {["all", "approved", "rejected"].map((f) => {
            let count =
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

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-center">
              Edit User
            </h2>
            <select
              className="w-full border p-2 rounded"
              value={editForm.nri}
              onChange={(e) =>
                setEditForm({ ...editForm, nri: e.target.value })
              }
            >
              <option value="No">NRI - No</option>
              <option value="Yes">NRI - Yes</option>
            </select>
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
              placeholder="Whatsapp"
              value={editForm.whatsapp}
              onChange={(e) =>
                setEditForm({ ...editForm, whatsapp: e.target.value })
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

// ─── UserCard ────────────────────────────────────────────────────────────────
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
            {user.nri === "Yes" && (
              <p className="text-xs font-semibold text-green-600">NRI</p>
            )}
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
          <p>
            <b>DOB:</b>{" "}
            {user.dob ? new Date(user.dob).toLocaleDateString() : "—"}
          </p>
          <p>
            <b>Blood Group:</b> {user.bloodGroup || "—"}
          </p>
          <p>
            <b>Address:</b> {user.address || "—"}
          </p>
          <p>
            <b>Place:</b> {user.place || "—"}
          </p>
          <p>
            <b>NRI:</b> {user.nri === "Yes" ? "Yes ✅" : "No"}
          </p>
          <div className="flex gap-2 flex-wrap pt-2">
            {user.membershipStatus === "approved" ? (
              <button
                onClick={() => rejectUser(user._id)}
                className="px-2 py-1 text-xs bg-orange-600 text-white rounded"
              >
                Reject
              </button>
            ) : (
              <button
                onClick={() =>
                  user.membershipStatus === "approved"
                    ? rejectUser(user._id)
                    : approveUser(user._id)
                }
                className={`px-2 py-1 text-xs text-white rounded ${user.membershipStatus === "approved" ? "bg-orange-600" : "bg-green-600"}`}
              >
                {user.membershipStatus === "approved" ? "Reject" : "Re-Approve"}
              </button>
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
