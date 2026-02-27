import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import AdminSidebar from "../components/AdminSidebar"; // adjust path if needed

export default function AdminPage() {
  const STATIC_VALID_UPTO = "31/03/2027";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
const [membersCount, setMembersCount] = useState(0); // if fetched elsewhere
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchUsers = async () => {
  if (!token) {
    navigate("/admin-login");
    return;
  }
  try {
    setLoading(true);
    setError("");
    const res = await axios.get(
      "https://club-membership.vercel.app/api/admin/pending-users",
      authHeader
    );
    const fetchedUsers = res.data.users || [];
    setUsers(fetchedUsers);

    // Compute pendingCount
    setPendingCount(fetchedUsers.length);
  } catch (err) {
    console.error(err);
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("adminToken");
      navigate("/admin-login");
    } else {
      setError(err.response?.data?.message || "Error fetching users");
    }
  } finally {
    setLoading(false);
  }
};

const handleLogout = () => {
  localStorage.removeItem("adminToken"); // remove token
  navigate("/admin-login"); // redirect to login page
};

  

  const approveUser = async (id) => {
    try {
      setActionLoading(id);
      setError("");
      const res = await axios.put(
        `https://club-membership.vercel.app/api/admin/approve/${id}`,
        {},
        authHeader
      );
      alert(`User approved! Membership ID: ${res.data.user.membershipId}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Error approving user");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectUser = async (id) => {
    try {
      setActionLoading(id);
      setError("");
      await axios.put(
        `https://club-membership.vercel.app/api/admin/reject/${id}`,
        {},
        authHeader
      );
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Error rejecting user");
    } finally {
      setActionLoading(null);
    }
  };


  useEffect(() => {
    if (!token) navigate("/admin-login");
    else fetchUsers();
  }, [token]);

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const downloadImage = async (imageUrl, name = "user-photo") => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}.jpg`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    alert("Failed to download image");
  }
};


  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">

      

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-x-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center md:text-left text-indigo-700">
          Pending Approvals
        </h1>

        {error && (
          <p className="text-red-500 mb-4 text-center md:text-left font-medium">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No pending users</p>
        ) : (
          <div className="space-y-6">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white shadow-lg rounded-3xl p-5 transition-transform hover:scale-[1.01]"
              >
                {/* Top Row: photo + name + expand button */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={user.photo || "/no-user.png"}
                      alt={user.name}
                      onError={(e) => (e.target.src = "/no-user.png")}
                      className="w-20 h-20 rounded-full object-cover border-2 border-indigo-300 shadow-md cursor-pointer"
                      onClick={() => setPreviewImage(user.photo)}
                    />
                    <div>
                      <p className="font-bold text-lg">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.phone}</p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setExpandedUser(expandedUser === user._id ? null : user._id)
                    }
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
                  >
                    {expandedUser === user._id ? <FaAngleUp /> : <FaAngleDown />}
                  </button>
                </div>

                {/* Expanded Details */}
                {expandedUser === user._id && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <Detail label="Father Name" value={user.fatherName || "—"} />
                    <Detail label="Nickname" value={user.nickname} />
                    <Detail label="Email" value={user.email || "—"} />
                    <Detail label="WhatsApp" value={user.whatsapp || "—"} />
                    <Detail label="Blood Group" value={user.bloodGroup || "—"} />
                    <Detail label="Address" value={user.address || "—"} />
                    <Detail label="DOB" value={formatDate(user.dob)} />
                    <Detail label="Valid Upto" value={STATIC_VALID_UPTO} />
                    {user.paymentProof && (
                      <a
                        href={user.paymentProof}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 text-sm col-span-full hover:underline"
                      >
                        View Payment Proof
                      </a>
                    )}
                    {user.photo && (
  <button
    onClick={() => downloadImage(user.photo, user.name)}
    className="col-span-full mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
  >
    Download User Photo
  </button>
)}

                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  <button
                    onClick={() => approveUser(user._id)}
                    disabled={actionLoading === user._id}
                    className={`px-5 py-2 rounded-full text-white font-semibold transition-all duration-200 ${
                      actionLoading === user._id
                        ? "bg-green-400"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {actionLoading === user._id ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={() => rejectUser(user._id)}
                    disabled={actionLoading === user._id}
                    className={`px-5 py-2 rounded-full text-white font-semibold transition-all duration-200 ${
                      actionLoading === user._id
                        ? "bg-red-400"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {actionLoading === user._id ? "Processing..." : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Preview Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-2"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="relative max-w-[90%] max-h-[90%]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-4 -right-4 bg-white rounded-full px-3 py-1 text-lg font-bold shadow hover:bg-gray-100 transition"
              >
                ✕
              </button>

              <img
                src={previewImage}
                alt="User Full"
                className="max-w-full max-h-[80vh] rounded-2xl shadow-xl"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="bg-indigo-50 p-3 rounded-xl hover:bg-indigo-100 transition-all shadow-sm">
      <p className="text-indigo-700 text-xs font-medium">{label}</p>
      <p className="font-semibold text-gray-800 text-sm">{value}</p>
    </div>
  );
}

function SidebarButton({ label, icon, active, onClick, color }) {
  const baseClasses = "w-full flex items-center px-4 py-2 rounded-lg transition font-medium";
  
  let buttonClasses = "";
  if (color === "red") {
    buttonClasses = "bg-red-600 text-white hover:bg-red-700";
  } else if (active) {
    buttonClasses = "bg-blue-600 text-white";
  } else {
    buttonClasses = "hover:bg-gray-100 text-gray-700";
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${buttonClasses}`}>
      {icon && <span className="mr-2">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}

