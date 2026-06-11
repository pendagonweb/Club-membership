// components/EventsSection.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

/* ─── Share Icon ─── */
function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

/* ─── Share Button ─── */
function ShareButton({ title, url }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareUrl = url || window.location.href;
    const shareData = { title: title || "Check this out!", url: shareUrl };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch (_) {}
    }
  };

  return (
    <button
      onClick={handleShare}
      title="Share"
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
        bg-white/90 hover:bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-gray-800 active:scale-95"
    >
      <ShareIcon />
      <span>{copied ? "Copied!" : "Share"}</span>
    </button>
  );
}

const EventsSection = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/activities`,
        );
        if (!res.data.success) throw new Error(res.data.message);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setEvents(res.data.data.filter((act) => new Date(act.date) > today));
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const formatDay = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric" });

  const formatMonth = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-GB", { month: "short" });

  const formatYear = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-GB", { year: "numeric" });

  return (
    <section className="py-20 sm:py-10 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-4">
            Mark Your Calendar
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold">Upcoming Events</h2>
        </motion.div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse"
              >
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-sm">
              Could not load events. Please try again later.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && events.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-sm">No upcoming events. Check back soon!</p>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && events.length > 0 && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {events.map((ev, i) => (
              <motion.div
                key={ev._id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.65,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden">
                    {ev.image ? (
                      <img
                        src={ev.image}
                        alt={ev.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300 text-4xl">
                        📅
                      </div>
                    )}

                    {/* Tag pill — top left */}
                    {ev.tag && (
                      <span className="absolute top-3 left-3 text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                        {ev.tag}
                      </span>
                    )}

                    {/* Date badge — top right */}
                    {ev.date && (
                      <div className="absolute top-3 right-3 bg-white border border-gray-100 rounded-xl px-2.5 py-1.5 text-center min-w-[44px]">
                        <p className="text-lg font-bold text-gray-800 leading-none">
                          {formatDay(ev.date)}
                        </p>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide mt-0.5">
                          {formatMonth(ev.date)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 pb-10">
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base mb-1.5">
                      {ev.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
                      {ev.description}
                    </p>

                    {/* Footer strip */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        Coming up soon
                      </span>
                      {ev.date && (
                        <span className="text-xs text-gray-300">
                          {formatYear(ev.date)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Share button — bottom-right corner */}
                  <div className="absolute bottom-3 right-3">
                    <ShareButton title={ev.title} />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
