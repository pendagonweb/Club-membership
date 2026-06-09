import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const ADMIN_PASSWORD = "KSTAR@2026";
const STORAGE_KEY = "kstar_admin_unlocked";

const POSITION_COLORS = {
  Goalkeeper: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  Defender: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  Midfielder: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  Forward: { bg: "#FDF4FF", text: "#7E22CE", border: "#E9D5FF" },
  Winger: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  Striker: { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
};

const POSITIONS_ORDER = [
  "Goalkeeper",
  "Defender",
  "Midfielder",
  "Forward",
  "Winger",
  "Striker",
];

function PositionBadge({ position }) {
  const c = POSITION_COLORS[position] || {
    bg: "#F8FAFC",
    text: "#475569",
    border: "#E2E8F0",
  };
  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
      }}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide"
    >
      {position}
    </span>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white border border-blue-100 rounded-2xl px-5 py-4 flex flex-col gap-1 shadow-sm">
      <span className="text-[10px] font-semibold tracking-widest uppercase text-blue-400">
        {label}
      </span>
      <span
        style={{ color: accent || "#1D4ED8" }}
        className="text-2xl font-bold"
      >
        {value}
      </span>
    </div>
  );
}

/* ─── Lock Screen ─── */
function LockScreen({ onUnlock }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const attempt = () => {
    if (pw === ADMIN_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true");
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPw("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Geist', sans-serif; }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-6px); }
          40%,80% { transform: translateX(6px); }
        }
        .shake { animation: shake 0.45s ease; }
      `}</style>

      <div className="w-full max-w-[380px]">
        <div className="bg-white border border-blue-100 rounded-3xl shadow-lg px-8 py-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl mb-4">
              🔐
            </div>
            <h1 className="text-slate-900 text-xl font-bold tracking-tight">
              Admin Access
            </h1>
            <p className="text-blue-400 text-sm mt-1 font-medium">
              KINGSTAR Fan World Cup 2026
            </p>
          </div>

          <div className={shake ? "shake" : ""}>
            <label className="block text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                setError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && attempt()}
              autoFocus
              className={`w-full h-12 rounded-xl px-4 text-sm font-medium bg-blue-50 text-slate-800 placeholder:text-slate-300 border outline-none transition-all mb-3
                ${error ? "border-red-300 focus:border-red-400 bg-red-50" : "border-blue-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"}`}
            />
            {error && (
              <p className="text-red-500 text-xs mb-3 text-center flex items-center justify-center gap-1">
                <span>⚠</span> Incorrect password. Try again.
              </p>
            )}
            <button
              onClick={attempt}
              disabled={!pw}
              className="w-full h-11 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              Unlock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   ADMIN PLAYERS PAGE
════════════════════════════════════ */
export default function PlayersAdmin() {
  const [unlocked, setUnlocked] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterPos, setFilterPos] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (unlocked) fetchPlayers();
  }, [unlocked]);

  const fetchPlayers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${API}/api/players/all`);
      if (data.success) setPlayers(data.players);
    } catch {
      setError("Failed to load players. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
    setPlayers([]);
    setShowLogoutConfirm(false);
  };

  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />;

  const positionCounts = POSITIONS_ORDER.reduce((acc, pos) => {
    acc[pos] = players.filter((p) => p.position === pos).length;
    return acc;
  }, {});

  const filtered = players
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        (filterPos === "All" || p.position === filterPos) &&
        (!q ||
          p.name?.toLowerCase().includes(q) ||
          p.membershipId?.toLowerCase().includes(q) ||
          p.nickname?.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "position")
        return (
          POSITIONS_ORDER.indexOf(a.position) -
          POSITIONS_ORDER.indexOf(b.position)
        );
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Geist', sans-serif; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.25s ease; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width:18px; height:18px;
          border: 2px solid #BFDBFE;
          border-top-color: #3B82F6;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes fadeInScale {
          from { opacity:0; transform:scale(0.97); }
          to { opacity:1; transform:scale(1); }
        }
        .modal-in { animation: fadeInScale 0.2s ease; }
      `}</style>

      {/* ── Logout confirm modal ── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-blue-950/20 backdrop-blur-sm">
          <div className="modal-in bg-white border border-blue-100 rounded-2xl shadow-xl px-6 py-6 w-full max-w-[320px]">
            <div className="text-center mb-5">
              <div className="text-2xl mb-3">🔒</div>
              <h3 className="text-sm font-bold text-slate-900">
                Lock admin panel?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                You'll need the password to access it again.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 h-10 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
              >
                Lock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-blue-50 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-base">
              ⚽
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">
                KINGSTAR Fan World Cup
              </h1>
              <p className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
                Admin · Player Registry
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchPlayers}
              className="h-8 px-3 rounded-lg border border-blue-100 text-xs font-medium text-blue-500 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              ↻ Refresh
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="h-8 px-3 rounded-lg border border-red-100 text-xs font-semibold text-red-400 hover:bg-red-50 transition-colors flex items-center gap-1.5"
            >
              🔒 Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard
            label="Total Players"
            value={players.length}
            accent="#2563EB"
          />
          <StatCard
            label="Goalkeepers"
            value={positionCounts["Goalkeeper"] || 0}
            accent="#C2410C"
          />
          <StatCard
            label="Defenders"
            value={positionCounts["Defender"] || 0}
            accent="#1D4ED8"
          />
          <StatCard
            label="Midfielders"
            value={positionCounts["Midfielder"] || 0}
            accent="#15803D"
          />
        </div>

        {/* ── Position breakdown ── */}
        {players.length > 0 && (
          <div className="bg-white border border-blue-50 rounded-2xl px-5 py-4 mb-6 shadow-sm">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-blue-400 mb-3">
              Squad Breakdown
            </p>
            <div className="flex flex-wrap gap-3">
              {POSITIONS_ORDER.filter((p) => positionCounts[p] > 0).map(
                (pos) => {
                  const c = POSITION_COLORS[pos];
                  const pct = Math.round(
                    (positionCounts[pos] / players.length) * 100,
                  );
                  return (
                    <div key={pos} className="flex items-center gap-1.5">
                      <span
                        style={{
                          background: c.bg,
                          color: c.text,
                          border: `1px solid ${c.border}`,
                        }}
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                      >
                        {pos}
                      </span>
                      <span className="text-xs text-slate-400">
                        {positionCounts[pos]}
                      </span>
                      <span className="text-xs text-slate-300">({pct}%)</span>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by name, ID, or nickname…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 h-10 border border-blue-100 rounded-xl px-4 text-sm bg-white text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
          />
          <div className="flex gap-2 flex-wrap">
            {["All", ...POSITIONS_ORDER].map((pos) => (
              <button
                key={pos}
                onClick={() => setFilterPos(pos)}
                className={`h-10 px-3.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap
                  ${
                    filterPos === pos
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-white border-blue-100 text-slate-500 hover:border-blue-300 hover:text-blue-500"
                  }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Sort + count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filtered.length}
            </span>{" "}
            of {players.length} players
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">
              Sort:
            </span>
            {[
              ["newest", "Newest"],
              ["name", "Name"],
              ["position", "Position"],
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSortBy(val)}
                className={`h-7 px-2.5 rounded-lg text-[11px] font-medium border transition-all
                  ${
                    sortBy === val
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-white border-blue-100 text-slate-500 hover:bg-blue-50"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Loading / error / empty ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="spinner" />
            <p className="text-sm text-blue-400">Loading players…</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-6 text-center">
            <p className="text-sm text-red-500 font-medium">{error}</p>
            <button
              onClick={fetchPlayers}
              className="mt-3 text-xs text-red-400 underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white border border-blue-50 rounded-2xl px-5 py-16 text-center shadow-sm">
            <p className="text-2xl mb-2">🏃</p>
            <p className="text-sm font-semibold text-slate-700">
              No players found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {players.length === 0
                ? "No one has registered yet."
                : "Try adjusting your search or filter."}
            </p>
          </div>
        )}

        {/* ── Player list ── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-2 fade-in">
            {/* Table header (desktop) */}
            <div className="hidden sm:grid grid-cols-[2rem_1fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-2">
              {["#", "Name", "Membership ID", "Age", "Phone", "Position"].map(
                (h) => (
                  <span
                    key={h}
                    className="text-[10px] font-semibold tracking-widest uppercase text-blue-400"
                  >
                    {h}
                  </span>
                ),
              )}
            </div>

            {filtered.map((player, idx) => (
              <div
                key={player._id}
                className="bg-white border border-blue-50 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all"
              >
                {/* Desktop row */}
                <div className="hidden sm:grid grid-cols-[2rem_1fr_1fr_1fr_1fr_1fr] gap-4 items-center px-5 py-4">
                  <span className="text-xs font-bold text-blue-200">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 leading-tight">
                      {player.name}
                    </p>
                    {player.nickname && (
                      <p className="text-xs text-slate-400">
                        "{player.nickname}"
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    {player.membershipId}
                  </span>
                  <span className="text-sm text-slate-600">
                    {player.age ? `${player.age} yrs` : "—"}
                  </span>
                  <span className="text-sm text-slate-600">
                    {player.phone || "—"}
                  </span>
                  <PositionBadge position={player.position} />
                </div>

                {/* Mobile card */}
                <div className="sm:hidden px-4 py-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-blue-200 w-5">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {player.name}
                        </p>
                        {player.nickname && (
                          <p className="text-xs text-slate-400">
                            "{player.nickname}"
                          </p>
                        )}
                      </div>
                    </div>
                    <PositionBadge position={player.position} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 pl-8">
                    <div>
                      <p className="text-[9px] font-semibold tracking-widest uppercase text-blue-400 mb-0.5">
                        ID
                      </p>
                      <p className="sm:text-xs text-[10px] font-mono text-slate-600">
                        {player.membershipId}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold tracking-widest uppercase text-blue-400 mb-0.5">
                        Age
                      </p>
                      <p className="sm:text-xs text-[10px] text-slate-600">
                        {player.age ? `${player.age} yrs` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold tracking-widest uppercase text-blue-400 mb-0.5">
                        Phone
                      </p>
                      <p className="sm:text-xs text-[10px] text-slate-600">
                        {player.phone || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-[11px] text-blue-200 mt-10">
          KINGSTAR Fan World Cup 2026 · Admin Panel
        </p>
      </div>
    </div>
  );
}
