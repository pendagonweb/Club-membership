// pages/ActivityDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

/* ─── Open Graph / SEO meta injector ─── */
function useSEOMeta({ title, description, image, url }) {
  useEffect(() => {
    if (!title) return;

    // Helper: find or create a <meta> tag
    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        const [attrName, attrVal] = attr;
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    const prevTitle = document.title;

    // Page title
    document.title = `${title} | Activities`;

    // Standard meta
    setMeta('meta[name="description"]',       ["name", "description"],          description || "");

    // Open Graph (WhatsApp, Facebook, Telegram)
    setMeta('meta[property="og:title"]',      ["property", "og:title"],         title);
    setMeta('meta[property="og:description"]',["property", "og:description"],   description || "");
    setMeta('meta[property="og:image"]',      ["property", "og:image"],         image || "");
    setMeta('meta[property="og:url"]',        ["property", "og:url"],           url || window.location.href);
    setMeta('meta[property="og:type"]',       ["property", "og:type"],          "article");

    // Twitter Card
    setMeta('meta[name="twitter:card"]',      ["name", "twitter:card"],         "summary_large_image");
    setMeta('meta[name="twitter:title"]',     ["name", "twitter:title"],        title);
    setMeta('meta[name="twitter:description"]',["name","twitter:description"],  description || "");
    setMeta('meta[name="twitter:image"]',     ["name", "twitter:image"],        image || "");

    return () => {
      document.title = prevTitle;
    };
  }, [title, description, image, url]);
}

/* ─── Share Icon ─── */
function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
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

/* ─── Share Button (full) ─── */
function ShareButton({ title, url }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url || window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title, url: shareUrl }); } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (_) {}
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
        bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 transition-all duration-200 active:scale-95"
    >
      <ShareIcon />
      {copied ? "Link copied!" : "Share"}
    </button>
  );
}

/* ─── Back arrow ─── */
function BackArrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

/* ─── Skeleton ─── */
function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full h-72 sm:h-96 bg-gray-200 rounded-3xl mb-8" />
      <div className="max-w-2xl mx-auto space-y-4 px-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-5/6" />
        <div className="h-4 bg-gray-100 rounded w-4/5" />
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
const ActivityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [act, setAct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/activities/${id}`
        );
        // Support both { data: {...} } and { data: { data: {...} } } shapes
        const item = res.data.data ?? res.data;
        if (!item?._id) throw new Error("Activity not found");
        setAct(item);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // Inject OG meta so WhatsApp/social preview picks up title + image
  useSEOMeta({
    title: act?.title,
    description: act?.description,
    image: act?.image,
    url: window.location.href,
  });

  const formattedDate = act?.date
    ? new Date(act.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top nav bar ── */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <BackArrow />
            Back
          </button>
          {act && (
            <ShareButton
              title={act.title}
              url={window.location.href}
            />
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
        {loading && <Skeleton />}

        {!loading && error && (
          <div className="text-center py-32 text-gray-400">
            <p className="text-5xl mb-4">⚠️</p>
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-6 text-sm text-blue-500 hover:text-blue-700 underline underline-offset-2"
            >
              Go back
            </button>
          </div>
        )}

        {!loading && !error && act && (
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* ── Thumbnail ── */}
            <div className="w-full overflow-hidden rounded-3xl mb-8 shadow-md">
              {act.image ? (
                <img
                  src={act.image}
                  alt={act.title}
                  className="w-full h-72 sm:h-[420px] object-cover"
                />
              ) : (
                <div className="w-full h-72 sm:h-[420px] bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center text-blue-200 text-7xl">
                  📌
                </div>
              )}
            </div>

            {/* ── Meta row ── */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {act.tag && (
                <span className="text-xs font-semibold bg-blue-50 border border-blue-100 text-blue-600 px-3 py-1 rounded-full">
                  {act.tag}
                </span>
              )}
              {formattedDate && (
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {formattedDate}
                </span>
              )}
            </div>

            {/* ── Title ── */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-6">
              {act.title}
            </h1>

            {/* ── Divider ── */}
            <div className="w-12 h-1 bg-blue-500 rounded-full mb-8" />

            {/* ── Description / body ── */}
            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-base sm:text-lg whitespace-pre-line">
              {act.description}
            </div>

            {/* ── Bottom share strip ── */}
            <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-sm text-gray-400 font-medium">Found this interesting? Share it.</p>
              <ShareButton title={act.title} url={window.location.href} />
            </div>
          </motion.article>
        )}
      </div>
    </div>
  );
};

export default ActivityDetailPage;
