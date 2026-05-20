import { useState, useEffect } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  HiOutlineTrophy,
  HiOutlineUsers,
  HiOutlineChartPie,
  HiOutlineArrowPath,
  HiOutlineFire,
  HiMiniStar,
  HiOutlineCheckBadge,
} from "react-icons/hi2";
import { RiEqualizerLine } from "react-icons/ri";
import { TbScale } from "react-icons/tb";

ChartJS.register(ArcElement, Tooltip, Legend);

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const PALETTE = [
  { fill: "#6366f1", light: "#eef2ff", text: "#4338ca" },
  { fill: "#10b981", light: "#ecfdf5", text: "#065f46" },
  { fill: "#f59e0b", light: "#fffbeb", text: "#92400e" },
  { fill: "#ef4444", light: "#fef2f2", text: "#991b1b" },
  { fill: "#8b5cf6", light: "#f5f3ff", text: "#5b21b6" },
  { fill: "#06b6d4", light: "#ecfeff", text: "#155e75" },
  { fill: "#f97316", light: "#fff7ed", text: "#9a3412" },
  { fill: "#84cc16", light: "#f7fee7", text: "#3f6212" },
];

function useCountUp(target, duration = 1000, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active || target === 0) {
      setVal(0);
      return;
    }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);
  return val;
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: "#fff", border: "1px solid #f1f5f9" }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: accent + "18" }}
      >
        <Icon size={20} style={{ color: accent }} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-0.5">
          {label}
        </p>
        <p
          className="text-3xl font-black text-gray-900"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {value}
        </p>
      </div>
      <div
        className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-5"
        style={{ background: accent }}
      />
    </div>
  );
}

function ResultRow({
  panel,
  maxVotes,
  totalVotes,
  rank,
  palette,
  animating,
  delay,
  isTied,
}) {
  const pct = maxVotes === 0 ? 0 : (panel.voteCount / maxVotes) * 100;
  const sharePct =
    totalVotes === 0 ? 0 : Math.round((panel.voteCount / totalVotes) * 100);
  const count = useCountUp(panel.voteCount, 900, animating);
  const isFirst = rank === 0;

  return (
    <div
      style={{
        opacity: 0,
        animation: "rowIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards",
        animationDelay: `${delay}ms`,
        background: isFirst && !isTied ? palette.light : "#fff",
        border: `1px solid ${isFirst && !isTied ? palette.fill + "40" : "#f1f5f9"}`,
        borderRadius: 16,
        padding: "14px 16px",
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
          style={{
            background: isTied ? "#f8fafc" : isFirst ? palette.fill : "#f8fafc",
            color: isTied ? "#94a3b8" : isFirst ? "#fff" : "#94a3b8",
          }}
        >
          {isTied ? (
            <TbScale size={17} />
          ) : isFirst ? (
            <HiMiniStar size={17} />
          ) : (
            `${rank + 1}`
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 text-sm leading-tight">
              {panel.name}
            </span>
            {isTied && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "#fef3c7", color: "#b45309" }}
              >
                Tie
              </span>
            )}
            {isFirst && !isTied && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: palette.fill + "20", color: palette.text }}
              >
                <HiOutlineFire size={11} /> Leading
              </span>
            )}
          </div>
          {panel.members?.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {panel.members.map((m) => m.name).join(" · ")}
            </p>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          <p
            className="text-xl font-black leading-none"
            style={{ color: isFirst && !isTied ? palette.fill : "#1e293b" }}
          >
            {count}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{sharePct}%</p>
        </div>
      </div>

      <div
        className="rounded-full overflow-hidden"
        style={{ height: 6, background: "#f1f5f9", marginLeft: 48 }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 99,
            background: isTied ? "#cbd5e1" : palette.fill,
            width: animating ? `${pct}%` : "0%",
            transition: `width 1.1s cubic-bezier(0.22,1,0.36,1)`,
            transitionDelay: `${delay + 100}ms`,
          }}
        />
      </div>
    </div>
  );
}

export default function VotingResults() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [animating, setAnimating] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const token = localStorage.getItem("token");

  const fetchResults = async () => {
    setLoading(true);
    setAnimating(false);
    setShowWinner(false);
    setSpinning(true);
    try {
      const { data } = await axios.get(`${API}/api/votes/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(data);
      setError("");
      setTimeout(() => setAnimating(true), 300);
      setTimeout(() => setShowWinner(true), 1600);
    } catch {
      setError("Results are not available yet. Check back soon.");
    } finally {
      setLoading(false);
      setTimeout(() => setSpinning(false), 600);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const sorted = results?.panels
    ? [...results.panels].sort((a, b) => b.voteCount - a.voteCount)
    : [];
  const totalVotes = results?.totalVotes || 0;
  const maxVotes = sorted[0]?.voteCount || 1;
  const topVotes = sorted[0]?.voteCount ?? -1;
  const isTie =
    totalVotes > 0 && sorted.filter((p) => p.voteCount === topVotes).length > 1;
  const tiedPanels = isTie
    ? sorted.filter((p) => p.voteCount === topVotes)
    : [];

  const donutData = {
    labels: sorted.map((p) => p.name),
    datasets: [
      {
        data: sorted.map((p) => p.voteCount || 0),
        backgroundColor: sorted.map((_, i) => PALETTE[i % PALETTE.length].fill),
        borderWidth: 4,
        borderColor: "#fff",
        hoverOffset: 10,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 10,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) => {
            const pct =
              totalVotes > 0 ? Math.round((ctx.raw / totalVotes) * 100) : 0;
            return `  ${ctx.raw} votes · ${pct}%`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      duration: 1400,
      easing: "easeInOutQuart",
    },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .vr-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .vr-display { font-family: 'Syne', sans-serif; }

        @keyframes rowIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes trophyPop {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes tieSway {
          0%, 100% { transform: rotate(-5deg); }
          50%       { transform: rotate(5deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .trophy-anim { animation: trophyPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both; }
        .tie-anim { animation: tieSway 1.8s ease-in-out infinite; display: inline-block; }
        .winner-section { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .pulse-ring {
          position: absolute; inset: -8px; border-radius: 50%;
          border: 2px solid currentColor;
          animation: pulseRing 2s ease-out infinite;
        }
        .skeleton {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 400px 100%;
          animation: shimmer 1.2s ease-in-out infinite;
          border-radius: 14px;
        }
        .spin-active { animation: spin 0.6s linear; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        className="vr-root min-h-screen py-8 px-4"
        style={{ background: "#f8fafc" }}
      >
        <div
          className="max-w-2xl mx-auto"
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          {/* Header */}
          <div style={{ animation: "fadeUp 0.4s ease both" }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#6366f1" }}
                  >
                    <HiOutlineChartPie size={18} color="#fff" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Live tally
                  </span>
                </div>
                <h1
                  className="vr-display text-3xl text-gray-900"
                  style={{ lineHeight: 1.1 }}
                >
                  Election Results
                </h1>
              </div>
              <button
                onClick={fetchResults}
                disabled={loading}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-all"
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  color: "#64748b",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <HiOutlineArrowPath
                  size={15}
                  className={spinning ? "spin-active" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="text-sm px-4 py-3 rounded-xl"
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
              }}
            >
              {error}
            </div>
          )}

          {/* Skeleton */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="grid grid-cols-2 gap-3">
                <div className="skeleton" style={{ height: 100 }} />
                <div className="skeleton" style={{ height: 100 }} />
              </div>
              <div className="skeleton" style={{ height: 260 }} />
              <div className="skeleton" style={{ height: 200 }} />
            </div>
          )}

          {!loading && results && (
            <>
              {/* Stat cards */}
              <div
                className="grid grid-cols-2 gap-3"
                style={{ animation: "fadeUp 0.45s ease both" }}
              >
                <StatCard
                  icon={HiOutlineUsers}
                  label="Total votes"
                  value={totalVotes}
                  accent="#6366f1"
                />
                <StatCard
                  icon={RiEqualizerLine}
                  label="Panels"
                  value={sorted.length}
                  accent="#10b981"
                />
              </div>

              {sorted.length === 0 || totalVotes === 0 ? (
                <div
                  className="flex flex-col items-center py-16 rounded-2xl text-center"
                  style={{
                    background: "#fff",
                    border: "1px solid #f1f5f9",
                    animation: "fadeUp 0.5s ease both",
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "#f1f5f9" }}
                  >
                    <HiOutlineCheckBadge size={32} color="#cbd5e1" />
                  </div>
                  <p className="font-bold text-gray-700 text-lg">
                    No votes cast yet
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Results will appear once voting begins.
                  </p>
                </div>
              ) : (
                <>
                  {/* Donut + legend */}
                  <div
                    className="rounded-2xl p-5"
                    style={{
                      background: "#fff",
                      border: "1px solid #f1f5f9",
                      animation: "fadeUp 0.5s ease both",
                    }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                      Vote share
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div
                        className="relative flex-shrink-0"
                        style={{ width: 190, height: 190 }}
                      >
                        <Doughnut data={donutData} options={donutOptions} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <p className="vr-display text-3xl text-gray-900">
                            {totalVotes}
                          </p>
                          <p className="text-xs text-gray-400">votes</p>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          width: "100%",
                        }}
                      >
                        {sorted.map((panel, i) => {
                          const pct = Math.round(
                            (panel.voteCount / totalVotes) * 100,
                          );
                          const pal = PALETTE[i % PALETTE.length];
                          const tied = panel.voteCount === topVotes && isTie;
                          return (
                            <div
                              key={panel._id}
                              className="flex items-center gap-2.5"
                            >
                              <span
                                className="flex-shrink-0"
                                style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: 3,
                                  background: tied ? "#cbd5e1" : pal.fill,
                                }}
                              />
                              <span className="text-sm text-gray-700 flex-1 truncate font-medium">
                                {panel.name}
                              </span>
                              <span
                                className="text-sm font-bold"
                                style={{ color: tied ? "#94a3b8" : pal.fill }}
                              >
                                {pct}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bar breakdown */}
                  <div
                    className="rounded-2xl p-5"
                    style={{
                      background: "#fff",
                      border: "1px solid #f1f5f9",
                      animation: "fadeUp 0.55s ease both",
                    }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                      Breakdown
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {sorted.map((panel, i) => (
                        <ResultRow
                          key={panel._id}
                          panel={panel}
                          maxVotes={maxVotes}
                          totalVotes={totalVotes}
                          rank={i}
                          palette={PALETTE[i % PALETTE.length]}
                          animating={animating}
                          delay={i * 90}
                          isTied={panel.voteCount === topVotes && isTie}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Winner / Tie banner */}
                  {showWinner && totalVotes > 0 && (
                    <div className="winner-section">
                      {isTie ? (
                        <div
                          className="rounded-2xl p-6 text-center"
                          style={{
                            background:
                              "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                            border: "2px dashed #cbd5e1",
                          }}
                        >
                          <div className="tie-anim mb-2">
                            <TbScale size={42} color="#64748b" />
                          </div>
                          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">
                            It's a tie
                          </p>
                          <h2 className="vr-display text-2xl text-slate-700 mb-4">
                            Dead Heat
                          </h2>
                          <div className="flex flex-wrap justify-center gap-3 mb-4">
                            {tiedPanels.map((p) => {
                              const idx = sorted.indexOf(p);
                              const pal = PALETTE[idx % PALETTE.length];
                              return (
                                <div
                                  key={p._id}
                                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                                  style={{
                                    background: pal.light,
                                    color: pal.text,
                                    border: `1px solid ${pal.fill}30`,
                                  }}
                                >
                                  {p.name} · {p.voteCount} votes
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-xs text-slate-400">
                            Both panels are equal — every vote counts!
                          </p>
                        </div>
                      ) : (
                        (() => {
                          const winner = sorted[0];
                          const pal = PALETTE[0];
                          return (
                            <div
                              className="rounded-2xl p-6 text-center relative overflow-hidden"
                              style={{
                                background: `linear-gradient(135deg, ${pal.light} 0%, #fff 100%)`,
                                border: `2px solid ${pal.fill}40`,
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  top: -30,
                                  right: -30,
                                  width: 120,
                                  height: 120,
                                  borderRadius: "50%",
                                  background: pal.fill,
                                  opacity: 0.06,
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: -20,
                                  left: -20,
                                  width: 80,
                                  height: 80,
                                  borderRadius: "50%",
                                  background: pal.fill,
                                  opacity: 0.06,
                                }}
                              />

                              <div className="relative inline-block mb-3">
                                <div
                                  className="pulse-ring"
                                  style={{ color: pal.fill }}
                                />
                                <div
                                  className="trophy-anim w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                                  style={{ background: pal.fill }}
                                >
                                  <HiOutlineTrophy size={30} color="#fff" />
                                </div>
                              </div>

                              <p
                                className="text-xs font-bold tracking-widest uppercase mb-1"
                                style={{ color: pal.text }}
                              >
                                Current leader
                              </p>
                              <h2
                                className="vr-display text-3xl mb-4"
                                style={{ color: "#0f172a" }}
                              >
                                {winner.name}
                              </h2>

                              {winner.members?.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-2 mb-4">
                                  {winner.members.map((m, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                                      style={{
                                        background: pal.fill + "18",
                                        color: pal.text,
                                        border: `1px solid ${pal.fill}30`,
                                      }}
                                    >
                                      <div
                                        className="w-5 h-5 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                                        style={{ background: pal.fill }}
                                      >
                                        {m.name?.[0]?.toUpperCase()}
                                      </div>
                                      <span>{m.name}</span>
                                      {m.role && (
                                        <span style={{ opacity: 0.6 }}>
                                          · {m.role}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center justify-center gap-3">
                                <div
                                  className="px-4 py-1.5 rounded-xl text-sm font-bold"
                                  style={{
                                    background: pal.fill,
                                    color: "#fff",
                                  }}
                                >
                                  {winner.voteCount} votes
                                </div>
                                <div
                                  className="px-4 py-1.5 rounded-xl text-sm font-bold"
                                  style={{
                                    background: pal.fill + "18",
                                    color: pal.text,
                                  }}
                                >
                                  {Math.round(
                                    (winner.voteCount / totalVotes) * 100,
                                  )}
                                  % share
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
