import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { HiCheckCircle, HiChartBar, HiOutlineCalendar } from "react-icons/hi";
import KingInterLogo from "../assets/KingInternationalLogo.webp";

const VOTING_CLOSES_AT = "2026-07-17T01:30:00+05:30";
const RESULTS_AT = "2026-07-17T01:45:00+05:30";

function formatInViewerTimeZone(isoString) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).format(date);
}

/* ── Small circular progress ring ── */
function ProgressRing({ percentage = 0, size = 92, stroke = 8 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="white"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.7s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-extrabold text-xl leading-none">
          {percentage}%
        </span>
        <span className="text-white/70 text-[9px] font-semibold uppercase tracking-wide mt-0.5">
          Voted
        </span>
      </div>
    </div>
  );
}

export default function VotingPanelhead({
  token,
  backendUrl,
  votingClosesAt = VOTING_CLOSES_AT,
  resultsAt = RESULTS_AT,
}) {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const { VITE_BACKEND_URL } = import.meta.env;
  const BASE = backendUrl || VITE_BACKEND_URL;

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${BASE}/api/votes/nri-status`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (!cancelled) setStats(data);
      } catch {
        // best-effort widget  fail silently
      }
    };
    fetchStats();
    const id = setInterval(fetchStats, 8000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token, BASE]);

  const percentage = stats?.percentage ?? 0;

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-lg border border-white/10 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 mb-4">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />

      <div className="relative z-10 p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-5">
        {/* Left: logo + ring */}
        <div className="flex items-center justify-between gap-4">
          <img
            src={KingInterLogo}
            alt="King International Logo"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white/40 shrink-0"
          />
          <ProgressRing percentage={percentage} />
        </div>

        {/* Middle: text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            <span className="text-white/80 text-[11px] font-bold uppercase tracking-widest">
              Live · Election 2026-27
            </span>
          </div>
          <h3 className="text-white font-extrabold text-base sm:text-lg leading-snug">
            Kingstar International Council Election
          </h3>
          <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-1 text-white/70 text-xs">
            <span className="flex items-center gap-1.5">
              <HiOutlineCalendar className="shrink-0" />
              Voting closes {formatInViewerTimeZone(votingClosesAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <HiChartBar className="shrink-0" />
              Results {formatInViewerTimeZone(resultsAt)}
            </span>
          </div>
        </div>

      </div>

      {/* Progress bar footer (linear, for quick glance on narrow screens) */}
      <div className="relative z-10 h-1.5 bg-white/15">
        <div
          className="h-full bg-white transition-all duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
