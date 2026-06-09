import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/* ─── Lightbox ─── */
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
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
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
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white text-2xl flex items-center justify-center transition-colors z-10"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white text-2xl flex items-center justify-center transition-colors z-10"
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
              onClick={(e) => {
                e.stopPropagation();
                setIdx(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === idx ? "bg-white w-5" : "bg-white/40 w-1.5"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Skeleton ─── */
function Skeleton({ count = 4 }) {
  return (
    <div className="relative">
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-gray-200" />
      <div className="flex flex-col gap-12 py-8">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
          >
            <div className="w-[44%] h-48 rounded-2xl bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Format date ─── */
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ════════════════════════════════════
   DESKTOP TIMELINE CARD
   even → sits on LEFT of spine  → [IMAGE | CONTENT]
   odd  → sits on RIGHT of spine → [CONTENT | IMAGE]
════════════════════════════════════ */
function ReportCard({ item, index, onOpenLightbox }) {
  const cardRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const isLeft = index % 2 === 0;
  const imgs = item.images || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.12 },
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const slideClass = visible
    ? "opacity-100 translate-x-0"
    : isLeft
      ? "opacity-0 -translate-x-8"
      : "opacity-0 translate-x-8";

  return (
    <div className="relative flex items-center">
      {/* Spine dot */}
      <div className="absolute left-1/2 -translate-x-1/2 z-10">
        <div className="w-4 h-4 rounded-full bg-white border-[3px] border-gray-700 shadow-sm" />
      </div>

      {/* Short connector arm from card edge to spine */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 h-[2px] bg-gray-200 ${
          isLeft ? "left-[44%] right-[50%]" : "left-[50%] right-[44%]"
        }`}
      />

      {/* Card — occupies 44% of row, pushed to correct side */}
      <div
        ref={cardRef}
        className={`w-[44%] transition-all duration-700 ease-out ${slideClass} ${
          isLeft ? "mr-auto" : "ml-auto"
        }`}
      >
        <div
          className={`flex rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow h-48 ${
            isLeft ? "flex-row" : "flex-row-reverse"
          }`}
        >
          {/* ── Image panel ── */}
          <div
            className="w-2/5 shrink-0 bg-gray-100 relative overflow-hidden"
            onClick={
              imgs.length > 0 ? () => onOpenLightbox(imgs, 0) : undefined
            }
            style={{ cursor: imgs.length > 0 ? "pointer" : "default" }}
          >
            {imgs[0] ? (
              <img
                src={imgs[0].url}
                alt={item.title || ""}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-300 text-3xl">📷</span>
              </div>
            )}
            {imgs.length > 1 && (
              <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                +{imgs.length - 1}
              </span>
            )}
          </div>

          {/* ── Content panel ── */}
          <div className="flex-1 p-5 flex flex-col gap-2 overflow-hidden">
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              {formatDate(item.date || item.createdAt)}
            </span>
            <h3 className="text-base font-bold text-gray-800 leading-snug line-clamp-2">
              {item.title}
            </h3>
            {item.description && (
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-4 flex-1">
                {item.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   MOBILE CARD
════════════════════════════════════ */
function MobileReportCard({ item, onOpenLightbox }) {
  const cardRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const imgs = item.images || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 },
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative pl-7 transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {/* Dot on spine */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-[3px] border-gray-700 shadow -translate-x-[7px]" />

      <div className="flex rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white h-36">
        {/* Image */}
        <div
          className="w-2/5 shrink-0 bg-gray-100 relative overflow-hidden"
          onClick={imgs.length > 0 ? () => onOpenLightbox(imgs, 0) : undefined}
          style={{ cursor: imgs.length > 0 ? "pointer" : "default" }}
        >
          {imgs[0] ? (
            <img
              src={imgs[0].url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-300 text-2xl">📷</span>
            </div>
          )}
          {imgs.length > 1 && (
            <span className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              +{imgs.length - 1}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3.5 flex flex-col gap-1 overflow-hidden">
          <span className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
            {formatDate(item.date || item.createdAt)}
          </span>
          <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 flex-1">
              {item.description}
            </p>
          )}
          <span className="text-[9px] text-gray-300 mt-auto">
            {imgs.length} photo{imgs.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   REPORTS PAGE
════════════════════════════════════ */
export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/api/galleries?label=report`)
      .then((r) => {
        const data = r.data.data || [];
        data.sort((a, b) => {
          const da = new Date(a.date || a.createdAt);
          const db = new Date(b.date || b.createdAt);
          return db - da;
        });
        setReports(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openLightbox = (images, index) => setLightbox({ images, index });

  return (
    <div className="min-h-screen bg-white">
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl sm:text-5xl font-bold sm:py-2 mb-4">
            Reports
          </h2>
          <p className="text-center text-gray-400 text-sm mb-14 tracking-wide">
            A chronicle of our journey
          </p>

          {loading ? (
            <Skeleton count={4} />
          ) : reports.length === 0 ? (
            <p className="text-center text-gray-400 py-16">No reports yet.</p>
          ) : (
            <>
              {/* ── Desktop timeline ── */}
              <div className="hidden md:block relative">
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-gray-100 via-gray-300 to-gray-100" />
                <div className="flex flex-col gap-10 py-4">
                  {reports.map((item, i) => (
                    <ReportCard
                      key={item._id}
                      item={item}
                      index={i}
                      onOpenLightbox={openLightbox}
                    />
                  ))}
                </div>
                <div className="flex justify-center mt-4">
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                </div>
              </div>

              {/* ── Mobile timeline ── */}
              <div className="md:hidden relative">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-gray-100 via-gray-300 to-gray-100" />
                <div className="flex flex-col gap-5 py-2">
                  {reports.map((item) => (
                    <MobileReportCard
                      key={item._id}
                      item={item}
                      onOpenLightbox={openLightbox}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

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
