import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, MapPin, Calendar, Star, ChevronRight } from "lucide-react";
import ActivitiesSection from "../components/ActivitiesSection";
import EventsSection from "../components/EventsSection";
import GalleryPage from "../components/GalleryPage";
import Hero from "../assets/Kings.jpg";
import ElectionStatusCard from "../components/ElectionStatusCard";

/* ── Reusable fade-up wrapper ── */
const FadeUp = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ── Pill section label ── */
const SectionLabel = ({ text }) => (
  <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-4">
    {text}
  </span>
);

/* ── Awards ── */
const awards = [
  { emoji: "🏆", title: "Best Community Initiative", year: "2024" },
  { emoji: "🌟", title: "Excellence in Leadership", year: "2023" },
  { emoji: "🎖️", title: "National Youth Award", year: "2022" },
];

/* ── Registration logos (text placeholders with colour) ── */
const regLogos = [
  { label: "Partner A", color: "bg-blue-50 text-blue-600" },
  { label: "Partner B", color: "bg-amber-50 text-amber-600" },
  { label: "Partner C", color: "bg-emerald-50 text-emerald-600" },
  { label: "Partner D", color: "bg-rose-50 text-rose-600" },
];

export default function Home() {
  const heroRef = useRef(null);
  const token = localStorage.getItem("token");
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="text-gray-800 overflow-x-hidden">
      {/* ── 1. HERO ─────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-center items-center text-center px-5 sm:px-8 overflow-hidden"
      >
        {/* Layered gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-sky-50" />
        {/* Decorative blobs */}
        <div className="absolute top-[-10%] right-[-8%] w-[480px] h-[480px] rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-5%] left-[-6%] w-[360px] h-[360px] rounded-full bg-sky-100/70 blur-3xl pointer-events-none" />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #93c5fd 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <ElectionStatusCard token={token} />
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-blue-100 text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Building stronger communities since 2018
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight"
          >
            Welcome to{" "}
            <span className="relative inline-block text-blue-600">
              Kingstar
              {/* underline squiggle */}
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 220 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  d="M2 6 Q55 2 110 6 Q165 10 218 6"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" }}
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.25,
              duration: 0.75,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mb-10 text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed"
          >
            Building a strong community through impactful activities, meaningful
            connections, and shared purpose.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              to="/register"
              className="group relative overflow-hidden bg-blue-600 text-white px-7 py-3.5 rounded-full font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Become a Member</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            </Link>
            <Link
              to="/activities"
              className="border border-gray-200 bg-white/80 px-7 py-3.5 rounded-full font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Explore Activities
            </Link>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-14"
          >
            {[
              ["300+", "Members"],
              ["80+", "Events"],
              ["5+", "Awards"],
            ].map(([num, label]) => (
              <div key={label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {num}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 tracking-wide uppercase">
                  {label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-5 h-8 border-2 border-gray-300 rounded-full flex justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-gray-400 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── 2. ABOUT ─────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <FadeUp>
            <SectionLabel text="Who We Are" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-5 leading-tight">
              About <span className="text-blue-600">Kingstar</span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Kingstar is a community-driven organisation focused on empowering
              individuals through events, collaborations, and impactful
              initiatives. We believe in the power of collective action to
              transform lives and communities.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all duration-200"
            >
              Learn more about us <ChevronRight size={16} />
            </Link>
            <div className="flex flex-wrap gap-4 mt-4">
              <Link
                to="/committee"
                className="text-xs border border-blue-200 bg-blue-500 text-white px-4 py-3 rounded-full inline-flex items-center justify-center"
              >
                Kingstar International Committee
              </Link>

              <Link
                to="/committee"
                className="text-xs border border-blue-200 bg-white text-blue-500 px-4 py-3 rounded-full inline-flex items-center justify-center"
              >
                Kingstar Central Committee
              </Link>
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div className="relative">
              <img
                src={Hero}
                alt="Community gathering"
                className="w-full h-72 sm:h-80 object-cover rounded-3xl shadow-xl"
              />
              {/* Floating card */}
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-lg px-5 py-4 flex items-center gap-3 border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Star size={18} fill="currentColor" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Member satisfaction</p>
                  <p className="font-bold text-gray-800">4.9 / 5.0</p>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
      <EventsSection />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 py-4 px-12">
        {[
          "Sports",
          "Arts & Culture",
          "Social Welfare & Charity",
          "Community First",
          "Medical Assistance",
          "Educational Aid",
          "Marriage Assistance",
          "Land for Grooms",
        ].map((item) => (
          <div
            key={item}
            className="border border-blue-200 rounded-full px-4 py-3 text-center text-sm font-medium text-gray-700 bg-white hover:bg-blue-50 transition"
          >
            {item}
          </div>
        ))}
      </div>
      <ActivitiesSection />
      {/* ── 5. GALLERY ───────────────────────────────────────── */}
      <GalleryPage />

      {/* ── 6. TESTIMONIAL ───────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <SectionLabel text="Voices" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-12">
              What Members Say
            </h2>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="relative bg-white rounded-3xl shadow-md border border-gray-100 p-8 sm:p-10">
              {/* Quote mark */}
              <div className="absolute -top-5 left-8 text-7xl text-blue-100 font-serif leading-none select-none">
                "
              </div>

              <div className="flex justify-center mb-4 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-amber-400"
                    fill="currentColor"
                  />
                ))}
              </div>

              <p className="text-gray-600 text-base sm:text-lg leading-relaxed italic mb-8">
                Being part of Kingstar has been an amazing experience. The
                events and community are truly inspiring — it's more than an
                organisation, it's a family.
              </p>

              <div className="flex items-center justify-center gap-3">
                <img
                  src="https://i.pravatar.cc/48?img=47"
                  alt="Member"
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-100"
                />
                <div className="text-left">
                  <p className="font-semibold text-gray-800 text-sm">
                    Priya Ramesh
                  </p>
                  <p className="text-xs text-gray-500">Member since 2021</p>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 7. REGISTRATIONS ─────────────────────────────────── */}
      <section className="py-20 sm:py-24 px-5 sm:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <FadeUp>
            <SectionLabel text="Partners" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-12">
              Registrations
            </h2>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="flex flex-wrap justify-center gap-5 sm:gap-8">
              {regLogos.map((p, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.08, y: -3 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`w-28 sm:w-36 h-16 sm:h-18 ${p.color} border border-current/10 shadow-sm rounded-2xl flex items-center justify-center font-bold text-sm tracking-wide cursor-pointer`}
                >
                  {p.label}
                </motion.div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 8. AWARDS ────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-14">
            <SectionLabel text="Recognition" />
            <h2 className="text-3xl sm:text-4xl font-bold">
              Awards & Recognition
            </h2>
          </FadeUp>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {awards.map((aw, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 280, damping: 20 }}
                  className="group p-8 border border-gray-100 bg-white rounded-3xl hover:border-amber-200 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <motion.div
                    className="text-5xl mb-5 inline-block"
                    whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {aw.emoji}
                  </motion.div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-amber-600 transition-colors">
                    {aw.title}
                  </h3>
                  <p className="text-sm text-gray-400">{aw.year}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. CTA ───────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-32 px-5 overflow-hidden">
        {/* Rich gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-sky-600" />
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-sky-400/20 blur-2xl pointer-events-none" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        <div className="relative z-10 text-center text-white max-w-2xl mx-auto">
          <FadeUp>
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-200 mb-4">
              Get Involved
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold mb-5 leading-tight">
              Join Kingstar Today
            </h2>
            <p className="mb-10 text-base sm:text-lg text-blue-100 leading-relaxed">
              Be part of something meaningful. Connect, grow, and make a lasting
              impact with a community that truly cares.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3.5 rounded-full font-bold shadow-xl hover:bg-blue-50 transition-all duration-200"
                >
                  Become a Member
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to="/activities"
                  className="inline-flex items-center justify-center gap-2 border border-white/40 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white/10 transition-all duration-200"
                >
                  Browse Activities
                </Link>
              </motion.div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
