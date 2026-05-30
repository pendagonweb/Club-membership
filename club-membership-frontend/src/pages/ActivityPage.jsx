// pages/ActivityPage.jsx
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// ─── helpers ────────────────────────────────────────────────────────────────

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const CARDS_PER_PAGE = 9;

// ─── sub-components ──────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-4/5" />
    </div>
  </div>
);

const ActivityCard = ({ act, index }) => (
  <motion.div
    key={act._id}
    initial={{ opacity: 0, y: 28 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
  >
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group h-full flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden h-48 flex-shrink-0">
        {act.image ? (
          <img
            src={act.image}
            alt={act.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center text-blue-300 text-4xl">
            📌
          </div>
        )}
        {act.tag && (
          <span className="absolute top-3 left-3 text-xs font-semibold bg-white/90 backdrop-blur px-3 py-1 rounded-full text-blue-600 shadow-sm">
            {act.tag}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-bold text-base leading-snug">{act.title}</h3>
          {act.date && (
            <span className="text-xs text-blue-500 font-medium whitespace-nowrap mt-0.5">
              {formatDate(act.date)}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 leading-relaxed flex-1">{act.description}</p>
      </div>
    </motion.div>
  </motion.div>
);

const TagPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-all duration-200 whitespace-nowrap
      ${
        active
          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
          : "bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
      }`}
  >
    {label}
  </button>
);

const Pagination = ({ current, total, onChange }) => {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 disabled:opacity-30 hover:border-blue-300 hover:text-blue-600 transition-colors"
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-all
            ${
              p === current
                ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                : "border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
            }`}
        >
          {p}
        </button>
      ))}
      <button
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 disabled:opacity-30 hover:border-blue-300 hover:text-blue-600 transition-colors"
      >
        ›
      </button>
    </div>
  );
};

// ─── main page ───────────────────────────────────────────────────────────────

const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [page, setPage] = useState(1);

  // ── fetch ──
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/activities`
        );
        if (!res.data.success) throw new Error(res.data.message);
        const past = res.data.data.filter(
          (act) => new Date(act.date) <= new Date()
        );
        setActivities(past);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  // ── derived tags ──
  const allTags = useMemo(() => {
    const tags = ["All", ...new Set(activities.map((a) => a.tag).filter(Boolean))];
    return tags;
  }, [activities]);

  // ── filtered + paginated ──
  const filtered = useMemo(() => {
    return activities.filter((act) => {
      const matchTag = activeTag === "All" || act.tag === activeTag;
      const matchSearch =
        !search ||
        act.title?.toLowerCase().includes(search.toLowerCase()) ||
        act.description?.toLowerCase().includes(search.toLowerCase());
      return matchTag && matchSearch;
    });
  }, [activities, activeTag, search]);

  const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * CARDS_PER_PAGE,
    page * CARDS_PER_PAGE
  );

  // reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, activeTag]);

  // ── render ──
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero header ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-4">
              What We Do
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
              Our Activities
            </h1>
            <p className="text-gray-500 text-base max-w-xl">
              A record of everything we've done — events, workshops, campaigns,
              and more.
            </p>
          </motion.div>

          {/* ── Search + stats row ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center"
          >
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activities…"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>

            {/* Result count */}
            {!loading && !error && (
              <span className="text-sm text-gray-400 font-medium">
                {filtered.length} activit{filtered.length === 1 ? "y" : "ies"} found
              </span>
            )}
          </motion.div>

          {/* ── Tag filters ── */}
          {!loading && !error && allTags.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="mt-4 flex flex-wrap gap-2"
            >
              {allTags.map((tag) => (
                <TagPill
                  key={tag}
                  label={tag}
                  active={activeTag === tag}
                  onClick={() => setActiveTag(tag)}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Content area ── */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">

        {/* Loading */}
        {loading && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">⚠️</p>
            <p className="text-sm">
              Could not load activities. Please try again later.
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 text-gray-400"
          >
            <p className="text-5xl mb-4">📋</p>
            <p className="text-sm font-medium">
              {activities.length === 0
                ? "No activities yet. Check back soon!"
                : "No activities match your search."}
            </p>
            {(search || activeTag !== "All") && (
              <button
                onClick={() => { setSearch(""); setActiveTag("All"); }}
                className="mt-4 text-sm text-blue-500 hover:text-blue-700 underline underline-offset-2"
              >
                Clear filters
              </button>
            )}
          </motion.div>
        )}

        {/* Cards */}
        {!loading && !error && paginated.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTag}-${search}-${page}`}
              className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8"
            >
              {paginated.map((act, i) => (
                <ActivityCard key={act._id} act={act} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        <Pagination current={page} total={totalPages} onChange={setPage} />
      </div>
    </div>
  );
};

export default ActivityPage;