import { useEffect, useState } from "react";
import axios from "axios";
import { FaAngleUp, FaAngleDown } from "react-icons/fa";


export default function JuniorList() {
  const [juniors, setJuniors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const { VITE_BACKEND_URL } = import.meta.env;

  const fetchJuniors = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${VITE_BACKEND_URL}/api/juniors`);
      if (res.data.success) setJuniors(res.data.juniors);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJuniors();
  }, []);

  const deleteJunior = async (id) => {
    if (!window.confirm("Delete this junior permanently?")) return;
    try {
      await axios.delete(`${VITE_BACKEND_URL}/api/juniors/${id}`);
      setJuniors((prev) => prev.filter((j) => j._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  const q = search.trim().toLowerCase();
  const filteredJuniors = q
    ? juniors.filter(
        (j) =>
          (j.name || "").toLowerCase().includes(q) ||
          (j.fatherName || "").toLowerCase().includes(q) ||
          (j.mobile || "").includes(q) ||
          (j.place || "").toLowerCase().includes(q) ||
          (j.occupation || "").toLowerCase().includes(q),
      )
    : juniors;

  return (
    <main className="flex-1 p-3 sm:p-4 md:p-6">
      {/* Title row */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div className="flex-1" />
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center flex-1">
          Junior Members
        </h1>
        <div className="flex-1 flex justify-end">
          <span className="text-sm text-gray-500 font-medium">
            Total: {juniors.length}
          </span>
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
          placeholder="Search by name, mobile, place, occupation…"
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

      {/* Result count hint when searching */}
      {q && (
        <p className="text-xs text-gray-500 text-center mb-3">
          {filteredJuniors.length} result
          {filteredJuniors.length !== 1 ? "s" : ""} for &quot;{search}&quot;
        </p>
      )}

      {/* Empty state */}
      {filteredJuniors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <p className="text-lg font-medium">No junior members found</p>
          {search && (
            <p className="text-sm mt-1">Try a different search term</p>
          )}
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredJuniors.map((junior) => (
          <JuniorCard
            key={junior._id}
            junior={junior}
            deleteJunior={deleteJunior}
          />
        ))}
      </div>
    </main>
  );
}

// ─── JuniorCard ──────────────────────────────────────────────────────────────
function JuniorCard({ junior, deleteJunior }) {
  const [expanded, setExpanded] = useState(false);

  const formatDob = (dob) => {
    if (!dob) return "—";
    return new Date(dob).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const initials = junior.name
    ? junior.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("")
    : "?";

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 w-full flex flex-col">
      <div className="flex items-center justify-between gap-3">
        {/* Avatar + basic info */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-indigo-600">
              {initials}
            </span>
          </div>
          <div className="flex flex-col">
            <p className="font-semibold text-lg leading-tight">{junior.name}</p>
            <p className="text-xs text-gray-500">S/o {junior.fatherName}</p>
            <p className="text-xs text-gray-500">{junior.mobile}</p>
          </div>
        </div>

        {/* Expand button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-3 py-1 text-xs bg-indigo-500 text-white rounded ml-auto"
        >
          {expanded ? <FaAngleUp /> : <FaAngleDown />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 text-sm space-y-2 border-t pt-3">
          <p>
            <b>Membership ID:</b> {junior.membershipId}
          </p>
          <p>
            <b>Father's Name:</b> {junior.fatherName}
          </p>
          <p>
            <b>Mobile:</b> {junior.mobile}
          </p>
          <p>
            <b>Date of Birth:</b> {formatDob(junior.dob)}
          </p>
          <p>
            <b>Occupation:</b> {junior.occupation}
          </p>
          <p>
            <b>Place:</b> {junior.place || "—"}
          </p>

          <div className="flex gap-2 flex-wrap pt-2">
            <button
              onClick={() => deleteJunior(junior._id)}
              className="px-2 py-1 text-xs bg-red-800 text-white rounded"
            >
              Delete
            </button>
            <a
              href={`https://wa.me/${junior.mobile.length === 10 ? "91" + junior.mobile : junior.mobile}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 text-xs bg-gray-800 text-white rounded"
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
