import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiArrowLeft,
  HiOutlineSearch,
  HiCheckCircle,
  HiOutlineClock,
} from "react-icons/hi";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function MemberAvatar({ photo, name, size = 40 }) {
  const dim = { width: size, height: size };
  if (photo) {
    return (
      <img
        src={photo}
        alt={name || ""}
        style={dim}
        className="rounded-full object-cover border border-slate-200 flex-shrink-0"
      />
    );
  }
  return (
    <div
      style={dim}
      className="rounded-full bg-slate-200 text-slate-500 font-bold flex items-center justify-center uppercase flex-shrink-0"
    >
      {name?.[0] || "?"}
    </div>
  );
}

export default function NriVoteUpdates() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | voted | pending

  const fetchStatus = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/votes/nri-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(data);
      setError("");
    } catch {
      setError("Failed to load voting updates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchStatus();
    const id = setInterval(() => fetchStatus(true), 8000);
    return () => clearInterval(id);
  }, []);

  const allUsers = data?.users || [];
  const allCount = allUsers.length;
  const votedCount = allUsers.filter((u) => u.hasVoted).length;
  const pendingCount = allCount - votedCount;

  const q = search.trim().toLowerCase();
  const filteredUsers = allUsers.filter((u) => {
    if (filter === "voted" && !u.hasVoted) return false;
    if (filter === "pending" && u.hasVoted) return false;
    if (!q) return true;
    return (
      u.name?.toLowerCase().includes(q) ||
      u.nickname?.toLowerCase().includes(q) ||
      String(u.membershipId || "")
        .toLowerCase()
        .includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        .nvu-root { font-family: 'DM Sans', sans-serif; }
        .nvu-title { font-family: 'Playfair Display', serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease both; }
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .live-dot { animation: pulseDot 1.6s ease-in-out infinite; }
      `}</style>

      <div className="nvu-root max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition"
          >
            <HiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="nvu-title text-2xl font-bold text-slate-800">
              NRI Voting Updates
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Live · refreshes automatically
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-24 gap-3">
            <div className="w-9 h-9 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading updates…</p>
          </div>
        ) : (
          data && (
            <>
              {/* Stats strip */}
              <div className="fade-up bg-white border border-slate-200 rounded-2xl p-5 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-700">
                    {data.votedCount} of {data.totalNri} voted
                  </p>
                  <p className="text-lg font-black text-indigo-600">
                    {data.percentage}%
                  </p>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
              </div>

              {/* Search + filter */}
              <div className="fade-up flex flex-col sm:flex-row gap-2 mb-4">
                <div className="relative flex-1">
                  <HiOutlineSearch
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or membership ID…"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                  />
                </div>
                <div className="flex gap-1.5">
                  {[
                    ["all", "All", allCount],
                    ["voted", "Voted", votedCount],
                    ["pending", "Pending", pendingCount],
                  ].map(([val, label, count]) => (
                    <button
                      key={val}
                      onClick={() => setFilter(val)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition whitespace-nowrap ${
                        filter === val
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300"
                      }`}
                    >
                      {label}
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] leading-none ${
                          filter === val
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* User list */}
              {filteredUsers.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm">
                  No members match your search.
                </div>
              ) : (
                <div className="space-y-2 fade-up">
                  {filteredUsers.map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3"
                    >
                      <MemberAvatar
                        photo={u.photo}
                        name={u.nickname || u.name}
                        size={40}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {u.nickname || u.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {u.name} · {u.membershipId}
                        </p>
                      </div>
                      {u.hasVoted ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full flex-shrink-0">
                          <HiCheckCircle size={13} /> Voted
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex-shrink-0">
                          <HiOutlineClock size={13} /> Pending
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}
