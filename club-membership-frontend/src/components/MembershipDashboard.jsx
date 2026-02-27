import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MembershipCard from "../pages/MemberCard";

export default function MemberDashboard() {
  const STATIC_VALID_UPTO = "31/03/2027";
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      navigate("/");
      return;
    }

    axios
      .get(`https://club-membership.vercel.app/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMember(res.data.user);
        setLoading(false);
      })
      .catch(() => navigate("/"));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center  text-lg">
        Loading dashboard...
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center  text-lg">
        Membership under review
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
{/* SIDEBAR */}
<aside className="hidden md:block w-64 bg-indigo-500 text-white p-6 shadow-xl">
  <h2 className="text-2xl font-extrabold tracking-wide mb-10">
    Member Panel
  </h2>

  <nav className="space-y-4">
    {/* CURRENT PAGE */}
    <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-green-800 font-semibold cursor-default">
      📊 Dashboard
    </div>

    {/* LOGOUT */}
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition-all font-semibold"
    >
      🚪 Logout
    </button>
  </nav>
</aside>




      {/* MAIN */}
      <main className="flex-1 p-6 space-y-8">
        {/* PROFILE HEADER */}
        <div className="bg-white rounded-3xl shadow-xl p-4 flex flex-col md:flex-row gap-6 items-center transition-all hover:shadow-2xl">
          <img
            src={member.photo || "/default-avatar.png"}
            alt={member.name}
            className="w-40 h-40 rounded-full border-4 border-indigo-500 object-cover shadow-md"
          />
          <div className="text-center md:text-left flex-1">
            <h1 className="text-xl font-extrabold uppercase text-indigo-600 tracking-wide">
              {member.nickname}
            </h1>
            <p className="text-gray-600 mt-1 text-lg">{member.phone}</p>

            <span className="inline-block mt-2 px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700">
              {member.membershipId?.toUpperCase()}
            </span>
          </div>
        </div>

        {member.membershipStatus === "approved" && (
          <div className="rounded-3xl shadow-xl bg-white p-3 flex flex-col items-center gap-6 transition-all hover:shadow-2xl">
            <MembershipCard user={member} />
          </div>
        )}

        {/* USER DETAILS */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-indigo-700 border-b pb-2">
            Member Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            <Detail label="Full Name" value={member.name} />
            <Detail label="Membership ID" value={member.membershipId} />
            <Detail label="Phone" value={member.phone} />
            <Detail label="Blood Group" value={member.bloodGroup || "N/A"} />
            <Detail label="Valid Upto" value={STATIC_VALID_UPTO || "N/A"} />
            <Detail
              label="Joined On"
              value={new Date(member.createdAt).toLocaleDateString()}
            />
          </div>
        </div>

        {/* MEMBERSHIP CARD INLINE */}
        
      </main>
    </div>
  );
}

/* SMALL HELPER COMPONENT */
function Detail({ label, value }) {
  return (
    <div className="bg-indigo-50 rounded-xl p-4 hover:bg-indigo-100 transition-all duration-200 shadow-sm">
      <p className="text-indigo-600 text-xs font-medium">{label}</p>
      <p className="font-semibold text-gray-800 text-sm md:text-base">{value}</p>
    </div>
  );
}
