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
  RiGlobalLine,
  RiGroupLine,
  RiShieldStarLine,
  RiShareLine,
} from "react-icons/ri";

const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/* ── helpers ─────────────────────────────────────────────────────────────── */
const capitalize = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

const COUNTRY_CODE_PREFIXES = [
  "971",
  "974",
  "966",
  "968",
  "965",
  "973",
  "961",
  "44",
  "61",
  "65",
  "60",
  "1",
  "91",
];

const toWhatsAppNumber = (raw = "") => {
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return null;
  for (const prefix of COUNTRY_CODE_PREFIXES) {
    if (digits.startsWith(prefix)) return digits;
  }
  if (digits.length === 10) return `91${digits}`;
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

      {/* Photo */}
      <div className="relative w-full overflow-hidden aspect-square bg-gray-100">
        <Avatar photo={user.photo} name={user.name} />

        {user.nri === "Yes" && (
          <div className="absolute top-2 right-3 flex items-center gap-0.5 bg-white/90 backdrop-blur-sm text-indigo-600 text-[8px] font-bold px-1 py-0.5 rounded-full border border-indigo-100 shadow-sm">
            <RiFlightTakeoffLine size={10} />
            NRI
          </div>
        )}
        {user.designation === "Exec. Member" && (
          <div className="absolute top-2 left-3 flex items-center gap-0.5 bg-white/90 backdrop-blur-sm text-indigo-600 text-[8px] font-bold px-1 py-0.5 rounded-full border border-indigo-100 shadow-sm">
            Exec.
          </div>
        )}
      </div>

      {/* Body */}
      <div className="relative">
        <div className="flex flex-col items-center pt-4 pb-2">
          {user.nickname && (
            <h3 className=" font-bold text-center text-gray-900 text-xs leading-snug line-clamp-1">
              {user.nickname}
            </h3>
          )}
          <p className="text-xs text-center text-gray-400  italic line-clamp-1">
            {user.name}
          </p>

          {isLeader && (
            <span className="inline-block text-center mt-1 sm:text-[10px] text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
              {capitalize(user.designation)}
            </span>
          )}
        </div>
        {/* Action buttons row: share (left) + whatsapp (right) */}
        <div className="absolute -top-3 left-3 right-3 flex justify-between">
          {/* Share button — sends member details to WhatsApp */}
          <button
            onClick={() => {
              const text =
                ` *Member Details*\n\n` +
                `• *Full Name:* ${user.name || "—"}\n` +
                `• *Display / Nick Name:* ${user.nickname || "—"}\n` +
                `• *Membership ID:* ${user.membershipId || "—"}\n` +
                `• *Phone Number:* ${user.phone || "—"}\n` +
                `• *Blood Group:* ${user.bloodGroup || "—"}`;
              const encoded = encodeURIComponent(text);
              window.open(
                `https://wa.me/?text=${encoded}`,
                "_blank",
                "noopener,noreferrer",
              );
            }}
            title="Share member details on WhatsApp"
            className="flex w-6 h-6 items-center justify-center rounded-full bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white text-xs font-semibold border border-blue-100 hover:border-blue-500 transition-all duration-200"
          >
            <RiShareLine size={14} />
          </button>

          {/* WhatsApp direct chat button */}
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-6 h-6 items-center justify-center rounded-full bg-green-50 hover:bg-green-500 text-green-600 hover:text-white text-xs font-semibold border border-green-100 hover:border-green-500 transition-all duration-200"
            >
              <RiWhatsappLine size={16} />
            </a>
          ) : (
            <div className="w-6 h-6" />
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
const SectionLabel = ({ icon: Icon, label, accent = "blue" }) => {
  const colorMap = {
    blue: {
      text: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      divider: "bg-blue-100",
    },
    indigo: {
      text: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      divider: "bg-indigo-100",
    },
    amber: {
      text: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      divider: "bg-amber-100",
    },
  };
  const c = colorMap[accent] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="flex items-center gap-3 mb-6"
    >
      <div className={`flex items-center gap-2 ${c.text}`}>
        <Icon size={16} />
        <span
          className={`text-xs font-bold uppercase tracking-widest ${c.text}`}
        >
          {label}
        </span>
      </div>
      <div className={`flex-1 h-px ${c.divider}`} />
    </motion.div>
  );
};

/* ── Committee Panel (one half of the split) ─────────────────────────────── */
const CommitteePanel = ({
  icon,
  label,
  accent,
  members,
  emptyText,
  skeletonCount = 3,
  loading,
}) => (
  <div className="flex-1 min-w-0">
    {loading ? (
      <>
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </>
    ) : (
      <>
        <SectionLabel icon={icon} label={label} accent={accent} />
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300 gap-2">
            <icon size={32} />
            <p className="text-xs">{emptyText}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {members.map((user, i) => (
              <MemberCard key={user._id} user={user} index={i} isLeader />
            ))}
          </div>
        )}
      </>
    )}
  </div>
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

  const DESIGNATION_ORDER = [
    "President",
    "Gen. Secretary",
    "Treasurer",
    "Vice President",
    "Joint Secretary",
    "Captain",
    "Exec. Member",
    "Chairman",
    "Vice Chairman",
    "Convenor",
    "Joint convenor",
  ];

  const designationRank = (u) => {
    const idx = DESIGNATION_ORDER.findIndex(
      (d) => d.toLowerCase() === (u.designation || "").toLowerCase().trim(),
    );
    return idx === -1 ? 999 : idx;
  };

  const sortByDesignation = (arr) =>
    [...arr].sort((a, b) => designationRank(a) - designationRank(b));

  const ADVISORY_DESIGNATIONS = [
    "chairman",
    "vice chairman",
    "convenor",
    "joint convenor",
  ];

  const isExec = (u) =>
    u.designation?.toLowerCase().replace(/\s+/g, " ").trim() === "exec. member";

  const isAdvisory = (u) =>
    ADVISORY_DESIGNATIONS.includes(
      u.designation?.toLowerCase().replace(/\s+/g, " ").trim(),
    );

  const matchesSearch = (u) =>
    !q ||
    u.name?.toLowerCase().includes(q) ||
    u.designation?.toLowerCase().includes(q) ||
    u.place?.toLowerCase().includes(q);

  // Split leaders into general (non-NRI, non-exec, non-advisory) and international (NRI, non-exec, non-advisory)
  const generalLeaders = sortByDesignation(
    leaders.filter(
      (u) =>
        u.nri !== "Yes" && !isExec(u) && !isAdvisory(u) && matchesSearch(u),
    ),
  );
  const intlLeaders = sortByDesignation(
    leaders.filter(
      (u) =>
        u.nri === "Yes" && !isExec(u) && !isAdvisory(u) && matchesSearch(u),
    ),
  );

  // Advisory board — split by NRI same as committee
  const generalAdvisory = sortByDesignation(
    leaders.filter((u) => isAdvisory(u) && u.nri !== "Yes" && matchesSearch(u)),
  );
  const intlAdvisory = sortByDesignation(
    leaders.filter((u) => isAdvisory(u) && u.nri === "Yes" && matchesSearch(u)),
  );

  // Exec members — prepended to the members list
  const execMembers = sortByDesignation(
    leaders.filter((u) => isExec(u) && matchesSearch(u)),
  );

  const filteredMembers = members.filter(
    (u) =>
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.nickname?.toLowerCase().includes(q) ||
      u.place?.toLowerCase().includes(q),
  );

  // Combined members list: exec first, then regular members
  const allMembers = [...execMembers, ...filteredMembers];

  const totalFiltered =
    generalLeaders.length +
    intlLeaders.length +
    generalAdvisory.length +
    intlAdvisory.length +
    execMembers.length +
    filteredMembers.length;

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

        {/* ── Committee split section ── */}
        {(loading ||
          (!error &&
            (generalLeaders.length > 0 || intlLeaders.length > 0))) && (
          <section>
            {/* Section header */}
            {!loading && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="flex items-center gap-2 text-gray-700">
                  <RiUserStarLine size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Committee
                  </span>
                </div>
                <div className="flex-1 h-px bg-gray-100" />
              </motion.div>
            )}

            {/* Two-panel split */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
              {/* Left — General Committee */}
              <div className="flex-1 min-w-0 hover:shadow-lg transition-shadow duration-300 rounded-2xl p-4 lg:p-6 bg-white border border-gray-100">
                {loading ? (
                  <>
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-6" />
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <SectionLabel
                      icon={RiGroupLine}
                      label="Central Committee"
                      accent="blue"
                    />
                    {generalLeaders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-gray-300 gap-2">
                        <RiGroupLine size={32} />
                        <p className="text-xs">No general committee members.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {generalLeaders.map((user, i) => (
                          <MemberCard
                            key={user._id}
                            user={user}
                            index={i}
                            isLeader
                          />
                        ))}
                      </div>
                    )}

                    {/* General Advisory Board */}
                    {generalAdvisory.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <SectionLabel
                          icon={RiShieldStarLine}
                          label="Advisory Board"
                          accent="amber"
                        />
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {generalAdvisory.map((user, i) => (
                            <MemberCard
                              key={user._id}
                              user={user}
                              index={i}
                              isLeader
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Vertical divider (desktop only) */}
              <div className="hidden lg:block w-px bg-gray-100 self-stretch" />

              {/* Right — International Committee */}
              <div className="flex-1 min-w-0 hover:shadow-lg transition-shadow duration-300 rounded-2xl p-4 lg:p-6 bg-white border border-gray-100">
                {loading ? (
                  <>
                    <div className="h-4 w-44 bg-gray-200 rounded animate-pulse mb-6" />
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <SectionLabel
                      icon={RiGlobalLine}
                      label="International Committee"
                      accent="indigo"
                    />
                    {intlLeaders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-gray-300 gap-2">
                        <RiGlobalLine size={32} />
                        <p className="text-xs">
                          No international committee members.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {intlLeaders.map((user, i) => (
                          <MemberCard
                            key={user._id}
                            user={user}
                            index={i}
                            isLeader
                          />
                        ))}
                      </div>
                    )}

                    {/* International Advisory Board */}
                    {intlAdvisory.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <SectionLabel
                          icon={RiShieldStarLine}
                          label="Advisory Board"
                          accent="amber"
                        />
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {intlAdvisory.map((user, i) => (
                            <MemberCard
                              key={user._id}
                              user={user}
                              index={i}
                              isLeader
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Members section ── */}
        {!loading && !error && (
          <section>
            <SectionLabel icon={RiTeamLine} label="Members" accent="blue" />

            {allMembers.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <RiTeamLine size={40} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm">
                  {search ? "No members match your search." : "No members yet."}
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
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-5">
                {allMembers.map((user, i) => (
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
        )}

        {/* Loading skeleton for members section */}
        {loading && (
          <section>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-7" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CommitteePage;
