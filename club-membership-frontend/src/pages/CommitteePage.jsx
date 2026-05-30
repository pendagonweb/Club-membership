// pages/CommitteePage.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  RiWhatsappLine,
  RiMapPinLine,
  RiFlightTakeoffLine,
  RiSearchLine,
  RiCloseLine,
  RiTeamLine,
  RiUserStarLine,
} from "react-icons/ri";

const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/* ── helpers ─────────────────────────────────────────────────────────────── */
const capitalize = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

// Known country code prefixes (longest first so we match +971 before +97, etc.)
const COUNTRY_CODE_PREFIXES = [
  "971", // UAE
  "974", // Qatar
  "966", // Saudi Arabia
  "968", // Oman
  "965", // Kuwait
  "973", // Bahrain
  "961", // Lebanon
  "44", // UK
  "61", // Australia
  "65", // Singapore
  "60", // Malaysia
  "1", // USA/Canada
  "91", // India
];

/**
 * Converts any stored phone value to a wa.me-compatible number.
 *
 * Handles all of these formats:
 *   "+919876543210"   → "919876543210"
 *   "919876543210"    → "919876543210"
 *   "9876543210"      → "919876543210"  (10-digit → assume India)
 *   "+971501234567"   → "971501234567"
 *   "971501234567"    → "971501234567"
 *   "+44 7911 123456" → "447911123456"
 */
const toWhatsAppNumber = (raw = "") => {
  // Strip everything except digits
  const digits = String(raw).replace(/\D/g, "");

  if (!digits) return null;

  // If it already starts with a known country code, use it as-is
  for (const prefix of COUNTRY_CODE_PREFIXES) {
    if (digits.startsWith(prefix)) {
      return digits;
    }
  }

  // Plain 10-digit number → prepend India code
  if (digits.length === 10) {
    return `91${digits}`;
  }

  // Fallback: return as-is (e.g. already has some country code we don't know)
  return digits;
};

const whatsappLink = (number) => {
  const waNumber = toWhatsAppNumber(number);
  return waNumber ? `https://wa.me/${waNumber}` : null;
};

/* ── Avatar ──────────────────────────────────────────────────────────────── */
const Avatar = ({ photo, name }) => {
  const initials = name
    ?.split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return photo ? (
    <img src={photo} alt={name} className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-2xl">
      {initials}
    </div>
  );
};

/* ── Unified Member Card ─────────────────────────────────────────────────── */
const MemberCard = ({ user, index, isLeader }) => {
  const waLink = whatsappLink(user.whatsapp || user.phone);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: (index % 6) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-blue-100 hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      {/* Leader accent bar */}
      {isLeader && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 z-10" />
      )}

      {/* Photo — fixed aspect ratio so all cards identical */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
        <Avatar photo={user.photo} name={user.name} />

        {/* NRI tag overlaid on photo */}
        {user.nri === "Yes" && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-full border border-indigo-100 shadow-sm">
            <RiFlightTakeoffLine size={10} />
            NRI
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Name + designation */}
        <div>
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">
            {user.name}
          </h3>
          {user.nickname && (
            <p className="text-xs text-gray-400 mt-0.5 italic line-clamp-1">
              "{user.nickname}"
            </p>
          )}
          {isLeader && (
            <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
              {capitalize(user.designation)}
            </span>
          )}
        </div>

        {/* Place */}
        {user.place && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <RiMapPinLine size={12} className="text-gray-300 shrink-0" />
            <span className="line-clamp-1">{user.place}</span>
          </div>
        )}

        {/* WhatsApp button — pushed to bottom */}
        <div className="mt-auto pt-2">
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-green-50 hover:bg-green-500 text-green-600 hover:text-white text-xs font-semibold border border-green-100 hover:border-green-500 transition-all duration-200"
            >
              <RiWhatsappLine size={14} />
              WhatsApp
            </a>
          ) : (
            <div className="h-8" /> /* spacer so cards without WA still align */
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ── Skeleton Card ───────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
    <div className="w-full aspect-square bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-8 bg-gray-100 rounded-xl w-full mt-2" />
    </div>
  </div>
);

/* ── Search bar ──────────────────────────────────────────────────────────── */
const SearchBar = ({ value, onChange }) => (
  <div className="relative w-full max-w-sm">
    <RiSearchLine
      size={15}
      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search by name or place…"
      className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
    />
    <AnimatePresence>
      {value && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <RiCloseLine size={16} />
        </motion.button>
      )}
    </AnimatePresence>
  </div>
);

/* ── Section divider label ───────────────────────────────────────────────── */
const SectionLabel = ({ icon: Icon, label }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.45 }}
    className="flex items-center gap-3 mb-7"
  >
    <div className="flex items-center gap-2 text-blue-600">
      <Icon size={16} />
      <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
        {label}
      </span>
    </div>
    <div className="flex-1 h-px bg-gray-100" />
  </motion.div>
);

/* ── Main Page ───────────────────────────────────────────────────────────── */
const CommitteePage = () => {
  const [leaders, setLeaders] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${BASE}/api/admin/committee`);
        if (!res.data.success) throw new Error(res.data.message);
        setLeaders(res.data.data.leaders);
        setMembers(res.data.data.members);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const q = search.toLowerCase();
  const filteredLeaders = leaders.filter(
    (u) =>
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.designation?.toLowerCase().includes(q) ||
      u.place?.toLowerCase().includes(q),
  );
  const filteredMembers = members.filter(
    (u) =>
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.nickname?.toLowerCase().includes(q) ||
      u.place?.toLowerCase().includes(q),
  );

  const totalFiltered = filteredLeaders.length + filteredMembers.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page hero ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-4">
              Our People
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
              Committee & Members
            </h1>
            <p className="text-gray-400 text-base max-w-lg">
              The people who make Kingstar what it is — our committee and every
              proud member of the club.
            </p>
          </motion.div>

          {/* Search + stats row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center justify-between"
          >
            <SearchBar value={search} onChange={setSearch} />
            {!loading && !error && (
              <p className="text-sm text-gray-400">
                <span className="font-semibold text-gray-700">
                  {leaders.length + members.length}
                </span>{" "}
                total members
                {search && (
                  <span className="ml-2 text-blue-500">
                    · {totalFiltered} found
                  </span>
                )}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 space-y-14">
        {/* Error */}
        {!loading && error && (
          <div className="text-center py-24 text-gray-400">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="text-sm">
              Could not load data. Please try again later.
            </p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <>
            <div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-7" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
            <div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-7" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          </>
        )}

        {!loading && !error && (
          <>
            {/* ── Committee section ── */}
            {filteredLeaders.length > 0 && (
              <section>
                <SectionLabel icon={RiUserStarLine} label="Committee" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
                  {filteredLeaders.map((user, i) => (
                    <MemberCard key={user._id} user={user} index={i} isLeader />
                  ))}
                </div>
              </section>
            )}

            {/* ── Members section ── */}
            <section>
              <SectionLabel icon={RiTeamLine} label="Members" />

              {filteredMembers.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <RiTeamLine
                    size={40}
                    className="mx-auto mb-3 text-gray-200"
                  />
                  <p className="text-sm">
                    {search
                      ? "No members match your search."
                      : "No members yet."}
                  </p>
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="mt-3 text-sm text-blue-500 hover:text-blue-700 underline underline-offset-2"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
                  {filteredMembers.map((user, i) => (
                    <MemberCard
                      key={user._id}
                      user={user}
                      index={i}
                      isLeader={false}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default CommitteePage;
