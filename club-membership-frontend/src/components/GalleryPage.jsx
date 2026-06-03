import { useState, useEffect } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

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
              className={`h-1.5 rounded-full transition-all duration-200 ${i === idx ? "bg-white w-5" : "bg-white/40 w-1.5"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Skeleton ─── */
function Skeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
      ))}
    </div>
  );
}

/* ────────────────────────────────────
   SECTION 1 — GALLERY
──────────────────────────────────── */
function GallerySection({ items, loading, onOpen }) {
  return (
    <section className="bg-white py-14 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-3xl sm:text-5xl font-bold sm:py-2 mb-10">Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <Skeleton count={6} />
          ) : items.length === 0 ? (
            <p className="text-center text-gray-400 py-16">No photos yet.</p>
          ) : (
            items.map((item) => {
              const imgs = item.images || [];
              const preview = imgs.slice(0, 4);
              return (
                <div
                  key={item._id}
                  onClick={() => onOpen(imgs, 0)}
                  className="bg-white rounded-[22px] overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition"
                >
                  <div className="h-[220px] grid grid-cols-4 gap-[3px] p-[3px]">
                    {preview.map((img, index) => (
                      <div key={img.publicId || index} className="overflow-hidden bg-gray-100">
                        <img src={img.url} alt={item.title || ""} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between px-6 py-5">
                    <h3 className="text-2xl font-bold text-gray-700 leading-snug">{item.title}</h3>
                    <p className="text-sm font-bold text-gray-300 whitespace-nowrap">{imgs.length} imgs</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────
   SECTION 2 — POSTERS (Swiper infinite loop)
   Poster ratio: 1080 × 1350 → 4:5
──────────────────────────────────── */
function PostersSection({ items, loading, onOpen }) {
  // Flatten every item's images into one flat array for the slider
  const allPosters = items.flatMap((item) =>
    (item.images || []).map((img) => ({ ...img, title: item.title }))
  );

  return (
    <section className="bg-gray-50 border-y border-gray-100 py-16 relative overflow-hidden">
      {/* Heading */}
      <div className="text-center mb-10 px-4">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-indigo-500 mb-2">
          Visual Collection
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Posters</h2>
        <div className="w-12 h-0.5 bg-indigo-400 mx-auto mt-3 rounded-full" />
      </div>

      {loading ? (
        <div className="flex gap-4 px-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 rounded-2xl bg-gray-200 animate-pulse"
              style={{ width: "180px", aspectRatio: "4/5" }}
            />
          ))}
        </div>
      ) : allPosters.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No posters yet.</p>
      ) : (
        <>
          {/* Left / right edge fade */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-16 z-10 bg-gradient-to-r from-gray-50 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-16 z-10 bg-gradient-to-l from-gray-50 to-transparent" />

          <Swiper
            modules={[Autoplay]}
            loop={allPosters.length >= 3}
            speed={700}
            autoplay={{
              delay: 2200,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            slidesPerView={2}
            spaceBetween={14}
            breakpoints={{
              480:  { slidesPerView: 3, spaceBetween: 16 },
              768:  { slidesPerView: 4, spaceBetween: 18 },
              1024: { slidesPerView: 5, spaceBetween: 20 },
              1280: { slidesPerView: 6, spaceBetween: 20 },
            }}
            className="!px-4 sm:!px-8"
          >
            {allPosters.map((img, i) => (
              <SwiperSlide key={img.publicId || i}>
                <div
                  onClick={() => onOpen(allPosters, i)}
                  className="group relative cursor-pointer rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
                  style={{ paddingTop: "125%" }}
                >
                  {img.url ? (
                    <img
                      src={img.url}
                      alt={img.title || "Poster"}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-4xl">
                      🖼️
                    </div>
                  )}
                  {/* Hover title overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    {img.title && (
                      <p className="text-white text-xs font-semibold leading-snug line-clamp-2">
                        {img.title}
                      </p>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </>
      )}
    </section>
  );
}

/* ────────────────────────────────────
   SECTION 3 — NEWS CUTTING
──────────────────────────────────── */
function NewsCuttingSection({ items, loading, onOpen }) {
  return (
    <section className="bg-amber-50 border-y border-amber-100 py-14 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-600 mb-1">
            Press Coverage &amp; Clippings
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-amber-900">News Cutting</h2>
          <div className="w-12 h-0.5 bg-amber-400 mx-auto mt-3 rounded-full" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-amber-100 animate-pulse h-64" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-amber-400 py-16">No news cuttings yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item, idx) => (
              <div
                key={item._id}
                className={`bg-white border border-amber-200 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${idx === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}
                onClick={() => onOpen(item.images || [], 0)}
              >
                <div className="relative aspect-video bg-amber-100 overflow-hidden">
                  {item.images?.[0]?.url ? (
                    <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">📰</div>
                  )}
                  {item.images?.length > 1 && (
                    <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      +{item.images.length - 1}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-amber-500 mb-1">Press</p>
                  <p className="text-sm font-semibold text-amber-900 leading-snug line-clamp-3">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-amber-700/70 mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ────────────────────────────────────
   SECTION 4 — NEWS
──────────────────────────────────── */
function NewsSection({ items, loading, onOpen }) {
  return (
    <section className="bg-white py-14 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-rose-500 mb-1">Latest Updates</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">News</h2>
          <div className="w-12 h-0.5 bg-rose-400 mx-auto mt-3 rounded-full" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-gray-100 animate-pulse h-64" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No news yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item, idx) => (
              <div
                key={item._id}
                className={`bg-white border border-gray-100 rounded-xl overflow-hidden cursor-pointer shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${idx === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}
                onClick={() => onOpen(item.images || [], 0)}
              >
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  {item.images?.[0]?.url ? (
                    <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-100">📡</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  {item.images?.length > 1 && (
                    <span className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      +{item.images.length - 1} more
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-3">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                  )}
                  <span className="inline-block mt-3 text-xs font-semibold text-rose-500 tracking-wide">Read more →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ════════════════════════════════════
   MAIN PAGE
════════════════════════════════════ */
export default function GalleryPage() {
  const [galleries, setGalleries] = useState([]);
  const [posters, setPosters] = useState([]);
  const [newsCuttings, setNewsCuttings] = useState([]);
  const [news, setNews] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [loadingPosters, setLoadingPosters] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingNewsCutting, setLoadingNewsCutting] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/api/galleries?label=gallery`)
      .then((r) => setGalleries(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingGallery(false));

    axios
      .get(`${API}/api/galleries?label=posters`)
      .then((r) => setPosters(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingPosters(false));

    axios
      .get(`${API}/api/galleries?label=newscutting`)
      .then((r) => setNewsCuttings(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingNewsCutting(false));

    axios
      .get(`${API}/api/galleries?label=news`)
      .then((r) => setNews(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingNews(false));
  }, []);

  const openLightbox = (images, index) => setLightbox({ images, index });

  return (
    <div className="min-h-screen">
      <GallerySection items={galleries} loading={loadingGallery} onOpen={openLightbox} />
      <PostersSection items={posters} loading={loadingPosters} onOpen={openLightbox} />
      <NewsCuttingSection items={newsCuttings} loading={loadingNewsCutting} onOpen={openLightbox} />
      <NewsSection items={news} loading={loadingNews} onOpen={openLightbox} />

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