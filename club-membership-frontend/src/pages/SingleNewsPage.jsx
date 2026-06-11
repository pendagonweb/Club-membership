
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/* ─── Inject / clean up <meta> OG tags in <head> ─── */
function useOpenGraph({ title, description, imageUrl, pageUrl }) {
  useEffect(() => {
    if (!title) return;

    const prev = document.title;
    document.title = title;

    const tags = [
      { property: "og:title",       content: title },
      { property: "og:description", content: description || "" },
      { property: "og:image",       content: imageUrl || "" },
      { property: "og:url",         content: pageUrl || window.location.href },
      { property: "og:type",        content: "article" },
      { name: "twitter:card",       content: "summary_large_image" },
      { name: "twitter:title",      content: title },
      { name: "twitter:description",content: description || "" },
      { name: "twitter:image",      content: imageUrl || "" },
    ];

    const injected = tags.map(({ property, name, content }) => {
      const selector = property
        ? `meta[property="${property}"]`
        : `meta[name="${name}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        if (property) el.setAttribute("property", property);
        if (name)     el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
      return el;
    });

    return () => {
      document.title = prev;
      injected.forEach((el) => el.remove());
    };
  }, [title, description, imageUrl, pageUrl]);
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

/* ─── Arrow Left Icon ─── */
function ArrowLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

/* ─── Image Lightbox (for additional images) ─── */
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/92 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-lg transition-colors z-10"
      >
        ✕
      </button>
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white text-2xl flex items-center justify-center z-10"
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white text-2xl flex items-center justify-center z-10"
          >
            ›
          </button>
        </>
      )}
      <img
        src={images[idx]?.url}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
      />
      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              className={`h-1.5 rounded-full transition-all duration-200 ${i === idx ? "bg-white w-5" : "bg-white/40 w-1.5"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════
   SINGLE NEWS PAGE
   Props:
     type — "news" | "newscutting"
════════════════════════════════════ */
export default function SingleNewsPage({ type = "news" }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const isNewsCutting = type === "newscutting";
  const accentColor = isNewsCutting ? "amber" : "rose";
  const backPath = "/gallery"; // adjust to wherever your gallery lives
  const pageUrl = window.location.href;

  /* Fetch the item */
  useEffect(() => {
    setLoading(true);
    setError(false);
    axios
      .get(`${API}/api/galleries/${id}`)
      .then((r) => setItem(r.data.data || r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  /* Inject OpenGraph tags */
  useOpenGraph({
    title: item?.title,
    description: item?.description,
    imageUrl: item?.images?.[0]?.url,
    pageUrl,
  });

  /* Share handler */
  const handleShare = useCallback(async () => {
    const shareData = {
      title: item?.title || "Check this out!",
      url: pageUrl,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(pageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch (_) {}
    }
  }, [item, pageUrl]);

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero skeleton */}
        <div className="w-full aspect-video max-h-[520px] bg-gray-200 animate-pulse" />
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
          <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-gray-100 rounded animate-pulse w-4/6" />
        </div>
      </div>
    );
  }

  /* ── Error / Not found ── */
  if (error || !item) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-5xl">😕</p>
        <p className="text-xl font-semibold text-gray-700">Item not found</p>
        <button
          onClick={() => navigate(backPath)}
          className="mt-2 px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition"
        >
          Back to Gallery
        </button>
      </div>
    );
  }

  const images = item.images || [];
  const heroImage = images[0];
  const extraImages = images.slice(1);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero Image ── */}
      <div className="relative w-full bg-gray-950 overflow-hidden" style={{ maxHeight: "520px" }}>
        {heroImage?.url ? (
          <>
            {/* Blurred background fill */}
            <div
              className="absolute inset-0 bg-center bg-cover blur-2xl scale-110 opacity-40"
              style={{ backgroundImage: `url(${heroImage.url})` }}
            />
            <img
              src={heroImage.url}
              alt={item.title}
              className="relative z-10 w-full object-contain mx-auto"
              style={{ maxHeight: "520px" }}
            />
          </>
        ) : (
          <div className="w-full h-64 flex items-center justify-center text-5xl bg-gray-100">
            {isNewsCutting ? "📰" : "📡"}
          </div>
        )}

        {/* Back button — top left over hero */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/40 hover:bg-black/60 text-white text-sm font-medium backdrop-blur-sm transition"
        >
          <ArrowLeftIcon />
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Label pill */}
        <span
          className={`inline-block text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4
            ${isNewsCutting
              ? "bg-amber-100 text-amber-600"
              : "bg-rose-50 text-rose-500"
            }`}
        >
          {isNewsCutting ? "Press" : "News"}
        </span>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug mb-4">
          {item.title}
        </h1>

        {/* Description */}
        {item.description && (
          <p className="text-base text-gray-600 leading-relaxed mb-8">
            {item.description}
          </p>
        )}

        {/* Share button */}
        <button
          onClick={handleShare}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 border
            ${isNewsCutting
              ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
              : "bg-rose-500 hover:bg-rose-600 text-white border-rose-500"
            }`}
        >
          <ShareIcon />
          {copied ? "Link copied!" : "Share this article"}
        </button>

        {/* ── Additional images strip ── */}
        {extraImages.length > 0 && (
          <div className="mt-12">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
              More Images
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {extraImages.map((img, i) => (
                <div
                  key={img.publicId || i}
                  onClick={() => setLightbox({ images, index: i + 1 })}
                  className="aspect-video rounded-xl overflow-hidden cursor-pointer bg-gray-100 hover:opacity-90 transition"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Lightbox for extra images ── */}
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
