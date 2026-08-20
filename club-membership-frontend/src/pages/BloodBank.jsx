// pages/BloodBank.jsx
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Search,
  Droplet,
  Users,
  Globe,
  ArrowDownAZ,
  LayoutGrid,
  List,
  Phone,
  Award,
  Clock,
  Cake,
} from "lucide-react";

const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/*  Blood group display order  */
const BLOOD_GROUP_ORDER = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "Nil",
];

const BLOOD_GROUP_COLORS = {
  "A+": {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    solid: "bg-red-500",
  },
  "A-": {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    solid: "bg-red-500",
  },
  "B+": {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    solid: "bg-blue-500",
  },
  "B-": {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    solid: "bg-blue-500",
  },
  "AB+": {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
    solid: "bg-purple-500",
  },
  "AB-": {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
    solid: "bg-purple-500",
  },
  "O+": {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    solid: "bg-emerald-500",
  },
  "O-": {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    solid: "bg-emerald-500",
  },
  Nil: {
    bg: "bg-gray-50",
    text: "text-gray-500",
    border: "border-gray-200",
    solid: "bg-gray-400",
  },
};

/*  Age range buckets for filtering  */
const AGE_RANGES = [
  { key: "18-25", label: "18–25", min: 18, max: 25 },
  { key: "26-35", label: "26–35", min: 26, max: 35 },
  { key: "36-45", label: "36–45", min: 36, max: 45 },
  { key: "45+", label: "45+", min: 46, max: Infinity },
];

const getAgeRangeKey = (age) => {
  const n = Number(age);
  if (!Number.isFinite(n)) return null;
  const range = AGE_RANGES.find((r) => n >= r.min && n <= r.max);
  return range ? range.key : null;
};

const getBGColor = (bg) => BLOOD_GROUP_COLORS[bg] || BLOOD_GROUP_COLORS.Nil;

const normalizeBG = (bg) => {
  if (!bg) return "Nil";
  const v = bg.trim();
  return BLOOD_GROUP_ORDER.includes(v) ? v : "Nil";
};

const toWhatsAppNumber = (raw = "") => {
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

/* ─── Avatar ─── */
function Avatar({ photo, name, size = "w-14 h-14" }) {
  const initials = name
    ?.split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (photo) {
    return (
      <img
        src={photo}
        alt={name || ""}
        className={`${size} rounded-full object-cover border border-gray-200 flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${size} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm`}
    >
      {initials || "?"}
    </div>
  );
}

/* ─── Member row card ─── */
function MemberCard({ user }) {
  const bg = normalizeBG(user.bloodGroup);
  const colors = getBGColor(bg);
  const waLink = toWhatsAppNumber(user.whatsapp || user.phone);

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3.5 hover:border-gray-200 hover:shadow-sm transition-all">
      <Avatar photo={user.photo} name={user.name} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-semibold text-sm text-gray-800 truncate">
            {user.nickname || user.name}
          </p>
          {user.designation && user.designation !== "member" && (
            <span className="text-[9px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
              {user.designation}
            </span>
          )}
          {user.nri === "Yes" && (
            <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-full">
              <Globe size={9} /> NRI
            </span>
          )}
          {/* {Number.isFinite(Number(user.age)) && (
            <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-full">
              <Cake size={9} /> {user.age}
            </span>
          )} */}
        </div>
        <p className="text-xs text-gray-400 truncate">
          {user.name}
          {user.membershipId ? ` · ${user.membershipId}` : ""}
        </p>
        {user.place && (
          <p className="text-[11px] text-gray-400 truncate mt-0.5">
            {user.place}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span
          className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${colors.bg} ${colors.text} border ${colors.border}`}
        >
          {bg}
        </span>
        {waLink && (
          <a
            href={`https://wa.me/${waLink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] font-semibold text-green-600 hover:text-green-700"
          >
            <Phone size={10} /> Contact
          </a>
        )}
      </div>
    </div>
  );
}

/* ─── Skeleton ─── */
function Skeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-[76px] rounded-2xl bg-gray-100 animate-pulse"
        />
      ))}
    </div>
  );
}

/* ─── Pill filter button ─── */
function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
        active
          ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-100"
          : "bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
      }`}
    >
      {children}
    </button>
  );
}

/* ════════════════════════════════════
   MAIN PAGE
════════════════════════════════════ */
export default function BloodBank() {
  const [rawUsers, setRawUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [nriFilter, setNriFilter] = useState("all");
  const [bgFilter, setBgFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("bloodgroup");
  const [grouped, setGrouped] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${BASE}/api/admin/committee`);
        if (!res.data.success) throw new Error(res.data.message);
        const { leaders = [], members = [] } = res.data.data;
        setRawUsers([...leaders, ...members]);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Remove anyone confirmed to be under 18 from the blood bank entirely.
  // Members with no age on record are kept (we can't confirm they're minors).
  const allUsers = useMemo(() => {
    return rawUsers.filter((u) => {
      const n = Number(u.age);
      if (Number.isFinite(n) && n < 18) return false;
      return true;
    });
  }, [rawUsers]);

  const q = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    return allUsers.filter((u) => {
      if (nriFilter === "yes" && u.nri !== "Yes") return false;
      if (nriFilter === "no" && u.nri === "Yes") return false;

      const bg = normalizeBG(u.bloodGroup);
      if (bgFilter !== "all" && bg !== bgFilter) return false;

      if (ageFilter !== "all" && getAgeRangeKey(u.age) !== ageFilter)
        return false;

      if (!q) return true;
      return (
        u.name?.toLowerCase().includes(q) ||
        u.nickname?.toLowerCase().includes(q) ||
        u.place?.toLowerCase().includes(q) ||
        String(u.membershipId || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [allUsers, nriFilter, bgFilter, ageFilter, q]);

  const sortedFlat = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === "name") {
      arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "nri") {
      arr.sort((a, b) => {
        const an = a.nri === "Yes" ? 0 : 1;
        const bn = b.nri === "Yes" ? 0 : 1;
        if (an !== bn) return an - bn;
        return (a.name || "").localeCompare(b.name || "");
      });
    } else {
      // bloodgroup
      arr.sort((a, b) => {
        const ai = BLOOD_GROUP_ORDER.indexOf(normalizeBG(a.bloodGroup));
        const bi = BLOOD_GROUP_ORDER.indexOf(normalizeBG(b.bloodGroup));
        if (ai !== bi) return ai - bi;
        return (a.name || "").localeCompare(b.name || "");
      });
    }
    return arr;
  }, [filtered, sortBy]);

  const groupedByBG = useMemo(() => {
    const map = {};
    BLOOD_GROUP_ORDER.forEach((bg) => (map[bg] = []));
    sortedFlat.forEach((u) => {
      const bg = normalizeBG(u.bloodGroup);
      map[bg].push(u);
    });
    return map;
  }, [sortedFlat]);

  // Blood group counts (for filter pill badges + stat strip), based on all users
  const bgCounts = useMemo(() => {
    const counts = {};
    BLOOD_GROUP_ORDER.forEach((bg) => (counts[bg] = 0));
    allUsers.forEach((u) => {
      counts[normalizeBG(u.bloodGroup)] += 1;
    });
    return counts;
  }, [allUsers]);

  // Age range counts (for filter pill badges), based on all users
  const ageCounts = useMemo(() => {
    const counts = {};
    AGE_RANGES.forEach((r) => (counts[r.key] = 0));
    allUsers.forEach((u) => {
      const key = getAgeRangeKey(u.age);
      if (key) counts[key] += 1;
    });
    return counts;
  }, [allUsers]);

  const topDonors = useMemo(() => {
    return [...allUsers]
      .filter((u) => (u.bloodDonations?.length || 0) > 0)
      .sort(
        (a, b) =>
          (b.bloodDonations?.length || 0) - (a.bloodDonations?.length || 0),
      )
      .slice(0, 9);
  }, [allUsers]);

  const recentDonors = useMemo(() => {
    return allUsers
      .filter((u) => (u.bloodDonations?.length || 0) > 0)
      .map((u) => ({
        ...u,
        lastDonation: [...u.bloodDonations].sort(
          (a, b) => new Date(b) - new Date(a),
        )[0],
      }))
      .sort((a, b) => new Date(b.lastDonation) - new Date(a.lastDonation))
      .slice(0, 9);
  }, [allUsers]);

  const totalDonations = useMemo(
    () => allUsers.reduce((sum, u) => sum + (u.bloodDonations?.length || 0), 0),
    [allUsers],
  );

  const nriCount = allUsers.filter((u) => u.nri === "Yes").length;
  const nonNriCount = allUsers.length - nriCount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full mb-4">
            <Droplet size={12} /> Community Health
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
            Blood Bank
          </h1>
          <p className="text-gray-500 text-base max-w-xl">
            A directory of members and committee members grouped by blood group
             reach out directly in case of an emergency.
          </p>

          {/* Stats */}
          {!loading && !error && (
            <div className="mt-8 flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
                <Users size={13} /> {allUsers.length} total
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full">
                <Globe size={13} /> {nriCount} NRI
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
                {nonNriCount} Non-NRI
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
                <Droplet size={13} /> {totalDonations} total donations
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        {/* Error */}
        {!loading && error && (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">⚠️</p>
            <p className="text-sm">
              Could not load data. Please try again later.
            </p>
          </div>
        )}

        {!error && (
          <>
            {/* ── Top Donors ── */}
            {!loading && topDonors.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Award size={16} className="text-amber-500" />
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                    Top Blood Donors
                  </h2>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {topDonors.map((u, i) => (
                    <div
                      key={u._id}
                      className="relative flex items-center gap-3 bg-white border border-amber-100 rounded-2xl p-3.5"
                    >
                      <div className="relative">
                        <Avatar
                          photo={u.photo}
                          name={u.name}
                          size="w-12 h-12"
                        />
                        {i < 3 && (
                          <span className="absolute -top-1.5 -right-1.5 text-base">
                            {["🥇", "🥈", "🥉"][i]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">
                          {u.nickname || u.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          { u.membershipId }
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-extrabold text-red-600 leading-none">
                          {u.bloodDonations.length}
                        </p>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wide">
                          donations
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* ── Recent Donors ── */}
            {!loading && recentDonors.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-blue-500" />
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                    Recent Donors
                  </h2>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recentDonors.map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center gap-3 bg-white border border-blue-100 rounded-2xl p-3.5"
                    >
                      <Avatar photo={u.photo} name={u.name} size="w-12 h-12" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">
                          {u.nickname || u.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          { u.membershipId}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-blue-600 leading-none">
                          {new Date(u.lastDonation).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">
                          last donation
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Controls ── */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 mb-8 space-y-4">
              {/* Search + sort + view toggle */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, place, or membership ID…"
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                  />
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                  <ArrowDownAZ size={15} className="text-gray-400 shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                  >
                    <option value="bloodgroup">Sort: Blood Group</option>
                    <option value="name">Sort: Name (A–Z)</option>
                    <option value="nri">Sort: NRI First</option>
                  </select>
                </div>

                {/* View toggle */}
                <div className="flex bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shrink-0">
                  <button
                    onClick={() => setGrouped(true)}
                    title="Grouped by blood group"
                    className={`px-3 py-2.5 transition-colors ${
                      grouped
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    onClick={() => setGrouped(false)}
                    title="Flat list"
                    className={`px-3 py-2.5 transition-colors ${
                      !grouped
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>

              {/* NRI filter */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  Filter by NRI status
                </p>
                <div className="flex flex-wrap gap-2">
                  <Pill
                    active={nriFilter === "all"}
                    onClick={() => setNriFilter("all")}
                  >
                    All ({allUsers.length})
                  </Pill>
                  <Pill
                    active={nriFilter === "yes"}
                    onClick={() => setNriFilter("yes")}
                  >
                    NRI ({nriCount})
                  </Pill>
                  <Pill
                    active={nriFilter === "no"}
                    onClick={() => setNriFilter("no")}
                  >
                    Non-NRI ({nonNriCount})
                  </Pill>
                </div>
              </div>

              {/* Age filter */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  Filter by age
                </p>
                <div className="flex flex-wrap gap-2">
                  <Pill
                    active={ageFilter === "all"}
                    onClick={() => setAgeFilter("all")}
                  >
                    All ages
                  </Pill>
                  {AGE_RANGES.map((r) => (
                    <Pill
                      key={r.key}
                      active={ageFilter === r.key}
                      onClick={() => setAgeFilter(r.key)}
                    >
                      {r.label} ({ageCounts[r.key] || 0})
                    </Pill>
                  ))}
                </div>
              </div>

              {/* Blood group filter */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  Filter by blood group
                </p>
                <div className="flex flex-wrap gap-2">
                  <Pill
                    active={bgFilter === "all"}
                    onClick={() => setBgFilter("all")}
                  >
                    All groups
                  </Pill>
                  {BLOOD_GROUP_ORDER.map((bg) => (
                    <Pill
                      key={bg}
                      active={bgFilter === bg}
                      onClick={() => setBgFilter(bg)}
                    >
                      {bg} ({bgCounts[bg] || 0})
                    </Pill>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Results ── */}
            {loading ? (
              <Skeleton count={8} />
            ) : sortedFlat.length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <Droplet size={40} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm font-medium">
                  No members match your filters.
                </p>
              </div>
            ) : grouped ? (
              <div className="space-y-10">
                {BLOOD_GROUP_ORDER.filter(
                  (bg) => bgFilter === "all" || bgFilter === bg,
                ).map((bg) => {
                  const list = groupedByBG[bg];
                  if (!list || list.length === 0) return null;
                  const colors = getBGColor(bg);
                  return (
                    <section key={bg}>
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs ${colors.bg} ${colors.text} border ${colors.border}`}
                        >
                          {bg}
                        </span>
                        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                          {bg === "Nil"
                            ? "Unknown / Not specified"
                            : `Blood Group ${bg}`}
                        </h2>
                        <span className="text-xs text-gray-400 font-medium">
                          {list.length} member{list.length !== 1 ? "s" : ""}
                        </span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {list.map((u) => (
                          <MemberCard key={u._id} user={u} />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sortedFlat.map((u) => (
                  <MemberCard key={u._id} user={u} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
