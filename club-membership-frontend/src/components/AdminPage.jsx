import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";


export default function AdminPage() {
  const STATIC_VALID_UPTO = "31/03/2027";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // if fetched elsewhere
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
      "https://club-membership-chi.vercel.app/api/admin/pending-users",
      authHeader
    );
    const fetchedUsers = res.data.users || [];
    setUsers(fetchedUsers);

    // Compute pendingCount
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
        `https://club-membership-chi.vercel.app/api/admin/approve/${id}`,
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
        `https://club-membership-chi.vercel.app/api/admin/reject/${id}`,
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
  if (!token) {
    navigate("/admin-login");
  } else {
    fetchUsers(); // 👈 ADD THIS
  }
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
  className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 w-full flex flex-col"
>
  {/* Top Row */}
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <img
        src={user.photo || "/no-user.png"}
        alt={user.name}
        onError={(e) => (e.target.src = "/no-user.png")}
        className="w-20 h-20 rounded-full object-cover border cursor-pointer"
        onClick={() => setPreviewImage(user.photo)}
      />

      <div className="flex flex-col">
        <p className="font-semibold text-lg">{user.name}</p>
        <p className="text-xs text-gray-600">
          Phone: {user.phone}
        </p>

        {user.nri === "Yes" && (
          <p className="text-xs font-semibold text-green-600">
            NRI
          </p>
        )}
      </div>
    </div>

    <button
      onClick={() =>
        setExpandedUser(expandedUser === user._id ? null : user._id)
      }
      className="px-3 py-1 text-xs bg-indigo-500 text-white rounded"
    >
      {expandedUser === user._id ? <FaAngleUp /> : <FaAngleDown />}
    </button>
  </div>

  {/* Expanded Section */}
  {expandedUser === user._id && (
    <div className="mt-3 text-sm space-y-2">
      <p><b>Father:</b> {user.fatherName || "—"}</p>
      <p><b>Nickname:</b> {user.nickname || "—"}</p>
      <p><b>Email:</b> {user.email || "—"}</p>
      <p><b>WhatsApp:</b> {user.whatsapp || "—"}</p>
      <p><b>DOB:</b> {formatDate(user.dob)}</p>
      <p><b>Blood Group:</b> {user.bloodGroup || "—"}</p>
      <p><b>Address:</b> {user.address || "—"}</p>
      <p><b>Valid Upto:</b> {STATIC_VALID_UPTO}</p>
      <p>
        <b>NRI:</b> {user.nri === "Yes" ? "Yes ✅" : "No"}
      </p>

      {user.paymentProof && (
        <a
          href={user.paymentProof}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 text-xs hover:underline"
        >
          View Payment Proof
        </a>
      )}

      

      {/* Actions */}
      <div className="flex gap-2 flex-wrap pt-2">
        <button
          onClick={() => approveUser(user._id)}
          disabled={actionLoading === user._id}
          className="px-2 py-1 text-xs bg-green-600 text-white rounded"
        >
          {actionLoading === user._id ? "Processing..." : "Approve"}
        </button>

        <button
          onClick={() => rejectUser(user._id)}
          disabled={actionLoading === user._id}
          className="px-2 py-1 text-xs bg-red-600 text-white rounded"
        >
          {actionLoading === user._id ? "Processing..." : "Reject"}
        </button>
      </div>
    </div>
  )}
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

