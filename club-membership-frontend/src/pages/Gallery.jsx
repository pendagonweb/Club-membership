import { useState, useEffect } from "react";
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
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white text-2xl flex items-center justify-center transition-colors z-10"
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
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
              onClick={(e) => { e.stopPropagation(); setIdx(i); }}
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
function Skeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-[22px] bg-gray-200 animate-pulse h-72" />
      ))}
    </div>
  );
}

/* ════════════════════════════════════
   GALLERY PAGE
════════════════════════════════════ */
export default function Gallery() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/api/galleries?label=gallery`)
      .then((r) => setGalleries(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openLightbox = (images, index) => setLightbox({ images, index });

  return (
    <div className="min-h-screen bg-white">
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-3xl sm:text-5xl font-bold sm:py-2 mb-10">
            Gallery
          </h2>

          {loading ? (
            <Skeleton count={6} />
          ) : galleries.length === 0 ? (
            <p className="text-center text-gray-400 py-16">No photos yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleries.map((item) => {
                const imgs = item.images || [];
                const preview = imgs.slice(0, 4);

                return (
                  <div
                    key={item._id}
                    onClick={() => openLightbox(imgs, 0)}
                    className="bg-white rounded-[22px] overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition"
                  >
                    <div className="h-[220px] grid grid-cols-4 gap-[3px] p-[3px]">
                      {preview.map((img, index) => (
                        <div
                          key={img.publicId || index}
                          className="overflow-hidden bg-gray-100"
                        >
                          <img
                            src={img.url}
                            alt={item.title || ""}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between px-6 py-5">
                      <h3 className="text-2xl font-bold text-gray-700 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-sm font-bold text-gray-300 whitespace-nowrap">
                        {imgs.length} imgs
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
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
