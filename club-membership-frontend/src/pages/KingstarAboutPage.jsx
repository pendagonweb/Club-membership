import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  FaTrophy,
  FaHandshake,
  FaGlobe,
  FaUsers,
  FaStar,
  FaHeart,
  FaGraduationCap,
  FaRing,
  FaHome,
  FaMedkit,
  FaChevronDown,
  FaCrown,
  FaFutbol,
  FaPaintBrush,
  FaCalendarAlt,
  FaAward,
  FaQuoteLeft,
} from "react-icons/fa";
import { GiCrown, GiSoccerBall } from "react-icons/gi";
import { MdVolunteerActivism, MdGroups } from "react-icons/md";
import { HiSparkles } from "react-icons/hi";

// ── Animation variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.11, ease: [0.22, 1, 0.36, 1] },
  }),
};
const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};
const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Section({ children, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, value, label, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      variants={scaleIn}
      custom={delay}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      whileHover={{ y: -6, boxShadow: "0 16px 48px rgba(59,130,246,0.15)" }}
      className="relative flex flex-col items-center gap-3 rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-sm overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-md text-white text-xl">
        <Icon />
      </div>
      <span className="text-4xl font-black text-blue-600 tracking-tight">
        {value}
      </span>
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
        {label}
      </span>
    </motion.div>
  );
}

// ── Pillar Card ──────────────────────────────────────────────────────────────
function PillarCard({ icon: Icon, title, desc, accent, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      whileHover={{ y: -5, boxShadow: "0 12px 40px rgba(59,130,246,0.12)" }}
      className="group relative rounded-2xl border border-slate-100 bg-white p-7 overflow-hidden cursor-default shadow-sm"
    >
      <div className={`absolute top-0 left-0 h-1 w-full ${accent}`} />
      <div
        className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${accent} text-white text-lg shadow`}
      >
        <Icon />
      </div>
      <h3 className="mb-2 text-base font-bold text-slate-800">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
    </motion.div>
  );
}

// ── Welfare Item ─────────────────────────────────────────────────────────────
function WelfareItem({ icon: Icon, label, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      whileHover={{ scale: 1.03 }}
      className="flex items-center gap-4 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-500 text-lg">
        <Icon />
      </div>
      <span className="font-semibold text-slate-700">{label}</span>
    </motion.div>
  );
}

// ── Timeline Milestone ───────────────────────────────────────────────────────
function Milestone({ year, title, desc, side }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      variants={side === "left" ? fadeLeft : fadeRight}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={`relative flex w-full md:w-[46%] flex-col gap-2 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm ${side === "left" ? "md:mr-auto" : "md:ml-auto"}`}
    >
      <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-0.5 text-xs font-black text-white shadow">
        {year}
      </div>
      <h4 className="mt-2 text-base font-bold text-slate-800">{title}</h4>
      <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
    </motion.div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function KingstarAboutPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const stats = [
    { icon: FaCalendarAlt, value: "26+", label: "Years of Legacy" },
    { icon: FaUsers, value: "1000+", label: "Active Members" },
    { icon: FaTrophy, value: "KPL", label: "Annual League" },
    { icon: FaGlobe, value: "Global", label: "King International" },
  ];

  const pillars = [
    {
      icon: FaFutbol,
      title: "Sports",
      desc: "Fostering sportsmanship, teamwork, and competition through the iconic Kingstar Premier League.",
      accent: "bg-blue-500",
      delay: 0,
    },
    {
      icon: FaPaintBrush,
      title: "Arts & Culture",
      desc: "Celebrating creativity, heritage, and expression through cultural programs and artistic showcases.",
      accent: "bg-sky-500",
      delay: 1,
    },
    {
      icon: MdVolunteerActivism,
      title: "Social Welfare",
      desc: "Medical aid, education support, marriage and housing assistance — standing with those in need.",
      accent: "bg-emerald-500",
      delay: 2,
    },
    {
      icon: FaGlobe,
      title: "King International",
      desc: "A global overseas wing uniting members worldwide to support local humanitarian initiatives.",
      accent: "bg-indigo-500",
      delay: 3,
    },
    {
      icon: FaCrown,
      title: "Central Committee",
      desc: "The apex leadership body guiding vision, coordination and implementation of all club activities.",
      accent: "bg-violet-500",
      delay: 4,
    },
    {
      icon: FaHeart,
      title: "Community First",
      desc: "Every initiative is designed from the ground up to uplift lives and strengthen social bonds.",
      accent: "bg-rose-400",
      delay: 5,
    },
  ];

  const welfareItems = [
    { icon: FaMedkit, label: "Medical Assistance" },
    { icon: FaGraduationCap, label: "Educational Aid" },
    { icon: FaRing, label: "Marriage Assistance" },
    { icon: FaHome, label: "Land for Grooms" },
    { icon: HiSparkles, label: "Gold for Brides" },
    { icon: FaHandshake, label: "Social Welfare Programs" },
  ];

  const milestones = [
    {
      year: "1998",
      title: "Club Founded",
      desc: "Kingstar Arts & Sports Club was established in Eriyapady with a mission to serve through sports, arts, and welfare.",
      side: "left",
    },
    {
      year: "2005",
      title: "KPL Launched",
      desc: "The Kingstar Premier League became an annual tradition drawing participants and fans from across the region.",
      side: "right",
    },
    {
      year: "2010",
      title: "King International",
      desc: "The overseas wing was formed to connect members worldwide and channel global support into local welfare.",
      side: "left",
    },
    {
      year: "2018",
      title: "King Kanoth Wedding",
      desc: "During the 20th Anniversary, the club supported couples with weddings, gold, and land — a defining moment of service.",
      side: "right",
    },
    {
      year: "2024+",
      title: "A Living Legacy",
      desc: "With 26+ years of unbroken service, Kingstar continues to grow — inspiring generations and uplifting lives.",
      side: "left",
    },
  ];

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-gradient-to-br from-white via-blue-50/40 to-sky-50/60"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center"
      >
        {/* Soft background blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(186,230,255,0.55) 0%, transparent 70%)",
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{
              duration: 11,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute -bottom-20 right-0 h-[500px] w-[500px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(199,210,254,0.5) 0%, transparent 70%)",
            }}
          />
          {/* Floating dots */}
          {[...Array(18)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{
                duration: 3 + (i % 4),
                repeat: Infinity,
                delay: i * 0.28,
                ease: "easeInOut",
              }}
              className="absolute h-1.5 w-1.5 rounded-full bg-blue-300"
              style={{
                left: `${5 + i * 5.1}%`,
                top: `${10 + ((i * 7) % 80)}%`,
              }}
            />
          ))}
          {/* Decorative rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full border border-blue-100" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full border border-blue-50" />
        </div>

        {/* Thin blue rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 h-px w-28 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity }}>
          {/* Crown */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
            className="mb-7 flex justify-center"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-blue-200 bg-gradient-to-br from-blue-100 to-sky-50 shadow-xl shadow-blue-100">
              <GiCrown className="text-5xl text-blue-500" />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-3 text-xs font-bold uppercase tracking-[0.4em] text-blue-400"
          >
            Est. 1998 · Eriyapady
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 text-5xl font-black leading-none tracking-tight md:text-7xl lg:text-8xl"
          >
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
              KINGSTAR
            </span>
            <br />
            <span className="text-2xl font-light text-slate-500 md:text-4xl lg:text-5xl">
              Arts & Sports Club
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-slate-500 md:text-lg"
          >
            A community-based organization dedicated to sports, arts, culture,
            charity, and social welfare — uniting people for over two decades.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-9 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:scale-105 hover:shadow-blue-300 active:scale-95">
              Explore Our Story
            </button>
            <button className="rounded-full border border-blue-200 bg-white px-9 py-3 text-sm font-semibold text-blue-600 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50">
              Join the Club
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 flex flex-col items-center gap-1 text-blue-300"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <FaChevronDown className="text-sm" />
        </motion.div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 bg-white/60">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s, i) => (
              <StatCard key={i} {...s} delay={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <Section>
              <motion.p
                variants={fadeUp}
                custom={0}
                className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-blue-400"
              >
                Our Identity
              </motion.p>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="mb-6 text-4xl font-black leading-tight text-slate-800 md:text-5xl"
              >
                Who We Are
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="mb-5 text-base leading-relaxed text-slate-500"
              >
                Founded in 1998 in the heart of Eriyapady,{" "}
                <span className="font-semibold text-blue-500">
                  Kingstar Arts & Sports Club
                </span>{" "}
                has grown from a local initiative into a celebrated institution
                — a platform that brings people together through sport, art, and
                heartfelt community service.
              </motion.p>
              <motion.p
                variants={fadeUp}
                custom={3}
                className="mb-8 text-base leading-relaxed text-slate-500"
              >
                Over 26+ years, we've built not just programs, but lasting bonds
                — a network of individuals committed to uplifting one another
                and building a better society.
              </motion.p>
              <motion.div
                variants={fadeUp}
                custom={4}
                className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5"
              >
                <FaQuoteLeft className="text-2xl text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm italic text-blue-700/80 leading-relaxed">
                  "Serving the Community, Inspiring Generations, Since 1998."
                </p>
              </motion.div>
            </Section>

            <Section>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: FaTrophy,
                    label: "KPL Champions",
                    sub: "Annual Sports Festival",
                  },
                  {
                    icon: MdGroups,
                    label: "1000+ Members",
                    sub: "Across the Globe",
                  },
                  {
                    icon: FaHeart,
                    label: "Welfare First",
                    sub: "Charity at Core",
                  },
                  { icon: FaAward, label: "26+ Years", sub: "Of Proud Legacy" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={scaleIn}
                    custom={i}
                    whileHover={{ scale: 1.04, rotate: i % 2 === 0 ? 1 : -1 }}
                    className="flex flex-col items-center gap-3 rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-sm"
                  >
                    <item.icon className="text-3xl text-blue-500" />
                    <span className="text-sm font-bold text-slate-700">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-400">{item.sub}</span>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </section>

      {/* ── PILLARS ───────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 bg-slate-50/70">
        <div className="mx-auto max-w-6xl">
          <Section className="mb-12 text-center">
            <motion.p
              variants={fadeUp}
              custom={0}
              className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-blue-400"
            >
              What We Do
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-4xl font-black text-slate-800 md:text-5xl"
            >
              Our Six Pillars
            </motion.h2>
          </Section>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p, i) => (
              <PillarCard key={i} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── KPL SPOTLIGHT ─────────────────────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <Section>
            <motion.div
              variants={fadeUp}
              custom={0}
              className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 to-blue-500 p-10 md:p-16 text-center shadow-xl shadow-blue-200"
            >
              {/* Shimmer */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 2.5,
                }}
                className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12"
              />
              {/* Rings */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[420px] w-[420px] rounded-full border border-white/10" />
              </div>
              <motion.div
                variants={fadeUp}
                custom={0}
                className="mb-6 flex justify-center"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 shadow-lg text-white">
                  <GiSoccerBall className="text-4xl" />
                </div>
              </motion.div>
              <motion.p
                variants={fadeUp}
                custom={1}
                className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-blue-100"
              >
                Annual Grand Event
              </motion.p>
              <motion.h2
                variants={fadeUp}
                custom={2}
                className="mb-5 text-4xl font-black text-white md:text-5xl"
              >
                Kingstar Premier League
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={3}
                className="mx-auto max-w-2xl text-base leading-relaxed text-blue-100"
              >
                The <span className="font-bold text-white">KPL</span> is our
                flagship sporting extravaganza — an annual celebration of
                sportsmanship, teamwork, and community pride. Drawing
                participants and fans from across the region, the KPL has become
                a cultural cornerstone.
              </motion.p>
              <motion.div
                variants={fadeUp}
                custom={4}
                className="mt-8 flex flex-wrap justify-center gap-3"
              >
                {[
                  "Teamwork",
                  "Sportsmanship",
                  "Community Pride",
                  "Annual Tradition",
                ].map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-white/15 border border-white/25 px-4 py-1.5 text-sm text-white"
                  >
                    #{tag}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── WELFARE ───────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 bg-slate-50/70">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <Section>
              <motion.p
                variants={fadeUp}
                custom={0}
                className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-blue-400"
              >
                Social Responsibility
              </motion.p>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="mb-5 text-4xl font-black leading-tight text-slate-800 md:text-5xl"
              >
                Welfare That Changes Lives
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-base leading-relaxed text-slate-500"
              >
                Beyond the sports field and stage, Kingstar is known for its
                heartfelt commitment to those in need. Our welfare programs span
                medical care, education, marriage support, and housing —
                touching lives at their most crucial moments.
              </motion.p>
            </Section>
            <div className="grid gap-3 sm:grid-cols-2">
              {welfareItems.map((item, i) => (
                <WelfareItem key={i} {...item} delay={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── KING KANOTH WEDDING ───────────────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <Section>
            <motion.div
              variants={fadeUp}
              custom={0}
              className="relative overflow-hidden rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-pink-50 p-10 md:p-14 shadow-sm"
            >
              <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-center">
                <motion.div
                  variants={scaleIn}
                  custom={1}
                  className="flex justify-center lg:justify-start"
                >
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-rose-100 bg-rose-50 text-5xl shadow">
                    💍
                  </div>
                </motion.div>
                <div>
                  <motion.span
                    variants={fadeUp}
                    custom={1}
                    className="mb-3 inline-block rounded-full border border-rose-200 bg-rose-100 px-4 py-1 text-xs font-bold uppercase tracking-wider text-rose-500"
                  >
                    20th Anniversary · 2018
                  </motion.span>
                  <motion.h3
                    variants={fadeUp}
                    custom={2}
                    className="mb-4 text-3xl font-black text-slate-800 md:text-4xl"
                  >
                    King Kanoth Community Wedding
                  </motion.h3>
                  <motion.p
                    variants={fadeUp}
                    custom={3}
                    className="mb-5 text-base leading-relaxed text-slate-500"
                  >
                    A historic village-wide initiative that remains one of
                    Kingstar's proudest chapters. The club supported multiple
                    couples with complete wedding arrangements — including{" "}
                    <span className="font-semibold text-rose-500">
                      gold for brides
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold text-rose-500">
                      land for grooms
                    </span>
                    .
                  </motion.p>
                  <motion.div
                    variants={fadeUp}
                    custom={4}
                    className="flex flex-wrap gap-2"
                  >
                    {[
                      "Wedding Arrangements",
                      "Gold for Brides",
                      "Land for Grooms",
                      "Community Love",
                    ].map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-rose-100 border border-rose-200 px-3 py-1 text-xs text-rose-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── KING INTERNATIONAL ───────────────────────────────────────────── */}
      <section className="px-4 py-20 bg-slate-50/70">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <Section>
              <motion.div
                variants={scaleIn}
                custom={0}
                className="relative flex h-64 items-center justify-center overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 shadow-sm"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute h-48 w-48 rounded-full border border-dashed border-blue-200"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute h-32 w-32 rounded-full border border-dotted border-blue-300"
                />
                <FaGlobe className="text-7xl text-blue-400" />
                {[
                  "top-8 left-12",
                  "top-16 right-10",
                  "bottom-12 left-20",
                  "bottom-8 right-16",
                ].map((pos, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.8, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                    className={`absolute ${pos} h-2.5 w-2.5 rounded-full bg-blue-400`}
                  />
                ))}
              </motion.div>
            </Section>
            <Section>
              <motion.p
                variants={fadeUp}
                custom={0}
                className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-blue-400"
              >
                Global Network
              </motion.p>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="mb-5 text-4xl font-black leading-tight text-slate-800 md:text-5xl"
              >
                King International
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="mb-4 text-base leading-relaxed text-slate-500"
              >
                Our overseas wing,{" "}
                <span className="font-semibold text-blue-500">
                  King International
                </span>
                , connects Kingstar members and well-wishers living beyond
                India's borders. Together, we channel global support into local
                welfare.
              </motion.p>
              <motion.p
                variants={fadeUp}
                custom={3}
                className="text-base leading-relaxed text-slate-500"
              >
                King International amplifies our humanitarian reach, turning a
                local club into a global family with shared values of service,
                unity, and compassion.
              </motion.p>
            </Section>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <Section className="mb-14 text-center">
            <motion.p
              variants={fadeUp}
              custom={0}
              className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-blue-400"
            >
              Our Journey
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-4xl font-black text-slate-800 md:text-5xl"
            >
              Milestones
            </motion.h2>
          </Section>
          <div className="relative flex flex-col gap-8">
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-blue-300 via-blue-100 to-transparent md:block" />
            {milestones.map((m, i) => (
              <Milestone key={i} {...m} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CENTRAL COMMITTEE ─────────────────────────────────────────────── */}
      <section className="px-4 py-20 bg-slate-50/70">
        <div className="mx-auto max-w-5xl">
          <Section>
            <motion.div
              variants={fadeUp}
              custom={0}
              className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-12 text-center shadow-sm"
            >
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                  className="absolute -top-20 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(219,234,254,0.8) 0%, transparent 70%)",
                  }}
                />
              </div>
              <motion.div
                variants={scaleIn}
                custom={1}
                className="mb-6 flex justify-center"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-blue-200 bg-blue-50 text-4xl text-blue-500 shadow">
                  <FaCrown />
                </div>
              </motion.div>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-blue-400"
              >
                Apex Body
              </motion.p>
              <motion.h3
                variants={fadeUp}
                custom={3}
                className="mb-5 text-3xl font-black text-slate-800 md:text-4xl"
              >
                Kingstar Central Committee
              </motion.h3>
              <motion.p
                variants={fadeUp}
                custom={4}
                className="mx-auto max-w-2xl text-base leading-relaxed text-slate-500"
              >
                The{" "}
                <span className="font-semibold text-blue-500">
                  Central Committee
                </span>{" "}
                serves as the guiding force behind all of Kingstar's operations
                — providing strategic leadership, coordinating diverse
                initiatives, and ensuring the club's vision stays rooted in
                service and excellence.
              </motion.p>
              <motion.div
                variants={fadeUp}
                custom={5}
                className="mt-8 grid grid-cols-3 gap-6 text-center text-sm"
              >
                {["Leadership", "Coordination", "Vision"].map((v, i) => (
                  <div key={i}>
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-blue-400">
                      <FaStar />
                    </div>
                    <p className="font-semibold text-slate-600">{v}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="px-4 pb-24 pt-10">
        <div className="mx-auto max-w-4xl">
          <Section>
            <motion.div
              variants={fadeUp}
              custom={0}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 p-12 text-center shadow-2xl shadow-blue-200"
            >
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 2.5,
                }}
                className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              />
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="mb-4 text-4xl font-black text-white md:text-5xl"
              >
                Be Part of the Legacy
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="mb-8 text-base text-blue-100"
              >
                Join thousands already making a difference — in sports, arts,
                and community service.
              </motion.p>
              <motion.div
                variants={fadeUp}
                custom={3}
                className="flex flex-wrap justify-center gap-4"
              >
                <button className="rounded-full bg-white px-10 py-3.5 text-sm font-bold text-blue-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95">
                  Join Kingstar Today
                </button>
                <button className="rounded-full border-2 border-white/40 bg-transparent px-10 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10">
                  Learn More
                </button>
              </motion.div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-white px-4 py-10 text-center">
        <div className="mx-auto max-w-md">
          <GiCrown className="mx-auto mb-4 text-3xl text-blue-400" />
          <p className="text-sm font-semibold text-slate-500">
            © {new Date().getFullYear()} Kingstar Arts & Sports Club, Eriyapady
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Serving the Community, Inspiring Generations, Since 1998. ❤️🏆🤝
          </p>
        </div>
      </footer>
    </div>
  );
}
