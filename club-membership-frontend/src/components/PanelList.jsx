import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const emptyForm = {
  name: "",
  description: "",
  members: [{ name: "", role: "" }],
};

/* ── Animated count-up hook ── */
function useCountUp(target, duration = 1200, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);
  return val;
}

/* ── Single bar row ── */
function VoteBar({ panel, maxVotes, totalVotes, rank, animating, delay }) {
  const pct = maxVotes === 0 ? 0 : (panel.voteCount / maxVotes) * 100;
  const sharePct =
    totalVotes === 0 ? 0 : Math.round((panel.voteCount / totalVotes) * 100);
  const count = useCountUp(panel.voteCount, 1000, animating);
  const isWinner = rank === 0;

  return (
    <div className="result-row" style={{ animationDelay: `${delay}ms` }}>
      <div className="row-header">
        <div
          className="rank-badge"
          style={{ background: isWinner ? "var(--gold)" : "var(--muted-bg)" }}
        >
          <span
            style={{
              color: isWinner ? "#1a1a1a" : "var(--muted-text)",
              fontSize: 13,
            }}
          >
            {isWinner ? "👑" : `#${rank + 1}`}
          </span>
        </div>
        <div className="panel-info">
          <span className="panel-name">{panel.name}</span>
          {panel.members?.length > 0 && (
            <span className="panel-members">
              {panel.members.map((m) => m.name).join(" · ")}
            </span>
          )}
        </div>
        <div className="vote-stat">
          <span className="vote-count">{count}</span>
          <span className="vote-share">{sharePct}%</span>
        </div>
      </div>
      <div className="bar-track">
        <div
          className="bar-fill"
          style={{
            width: animating ? `${pct}%` : "0%",
            background: isWinner
              ? "linear-gradient(90deg, var(--gold) 0%, #f59e0b 100%)"
              : "linear-gradient(90deg, var(--accent) 0%, var(--accent-light) 100%)",
            transitionDelay: `${delay + 200}ms`,
          }}
        />
      </div>
    </div>
  );
}

/* ── Results Modal ── */
function ResultsModal({ onClose, token }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await axios.get(`${API}/api/votes/results`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(data);
        setLoading(false);
        setTimeout(() => setAnimating(true), 100);
        setTimeout(() => setShowWinner(true), 1600);
        setConfetti(
          Array.from({ length: 40 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 1.4,
            dur: 1.8 + Math.random() * 1.2,
            color: ["#fbbf24", "#6366f1", "#10b981", "#f43f5e", "#a78bfa"][
              Math.floor(Math.random() * 5)
            ],
            size: 6 + Math.random() * 8,
            rotate: Math.random() * 360,
          })),
        );
      } catch {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const sorted = results?.panels
    ? [...results.panels].sort((a, b) => b.voteCount - a.voteCount)
    : [];
  const maxVotes = sorted[0]?.voteCount || 1;
  const winner = sorted[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
        :root {
          --gold: #fbbf24;
          --accent: #6366f1;
          --accent-light: #818cf8;
          --muted-bg: #f1f5f9;
          --muted-text: #64748b;
        }
        .modal-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0.65);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          backdrop-filter: blur(4px);
          animation: overlayIn 0.2s ease;
        }
        @keyframes overlayIn { from{opacity:0} to{opacity:1} }
        .modal-box {
          background: #fff;
          border-radius: 24px;
          width: 100%; max-width: 580px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 32px 28px 28px;
          position: relative;
          box-shadow: 0 32px 80px rgba(0,0,0,0.25);
          animation: boxIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
          font-family: 'DM Sans', sans-serif;
        }
        @media (max-width: 480px) {
          .modal-box { padding: 24px 16px 20px; border-radius: 20px; }
        }
        @keyframes boxIn {
          from { opacity:0; transform: scale(0.88) translateY(24px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }
        .modal-close {
          position: absolute; top: 16px; right: 16px;
          background: #f1f5f9; border: none; cursor: pointer;
          width: 32px; height: 32px; border-radius: 50%;
          font-size: 13px; color: #64748b;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .modal-close:hover { background: #e2e8f0; }
        .modal-header { text-align: center; margin-bottom: 28px; }
        .trophy-icon {
          font-size: 44px; margin-bottom: 8px; display: block;
          animation: bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes bounceIn {
          from { opacity:0; transform: scale(0.3); }
          to   { opacity:1; transform: scale(1); }
        }
        .modal-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 36px; letter-spacing: 2px;
          color: #0f172a; line-height: 1; margin: 0 0 6px;
        }
        @media (max-width: 480px) { .modal-title { font-size: 28px; } }
        .modal-sub { font-size: 13px; color: #94a3b8; margin: 0; }
        .modal-loading {
          display: flex; flex-direction: column; align-items: center;
          gap: 12px; padding: 40px 0; color: #94a3b8; font-size: 14px;
        }
        .spinner {
          width: 36px; height: 36px;
          border: 3px solid #e2e8f0; border-top-color: var(--accent);
          border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .modal-empty { text-align: center; padding: 40px 0; color: #94a3b8; font-size: 14px; }
        .bars-wrap { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
        .result-row { opacity: 0; animation: rowSlide 0.4s ease forwards; }
        @keyframes rowSlide {
          from { opacity:0; transform: translateX(-16px); }
          to   { opacity:1; transform: translateX(0); }
        }
        .row-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .rank-badge {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; flex-shrink: 0;
        }
        .panel-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
        .panel-name {
          font-size: 14px; font-weight: 600; color: #0f172a;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .panel-members {
          font-size: 11px; color: #94a3b8;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .vote-stat { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; }
        .vote-count {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; color: #0f172a; line-height: 1;
        }
        .vote-share { font-size: 11px; color: #94a3b8; }
        .bar-track { height: 10px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
        .bar-fill {
          height: 100%; border-radius: 99px; width: 0%;
          transition: width 1s cubic-bezier(0.4,0,0.2,1);
        }
        .winner-banner {
          border: 2px solid var(--gold);
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border-radius: 18px; padding: 24px 20px; text-align: center;
          animation: winnerPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes winnerPop {
          from { opacity:0; transform: scale(0.8) translateY(20px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }
        .winner-crown {
          font-size: 34px; margin-bottom: 4px; display: block;
          animation: crownSway 1.5s ease-in-out infinite alternate;
        }
        @keyframes crownSway {
          from { transform: rotate(-8deg) scale(1); }
          to   { transform: rotate(8deg) scale(1.1); }
        }
        .winner-label {
          font-size: 11px; font-weight: 700; letter-spacing: 3px;
          text-transform: uppercase; color: #b45309; margin-bottom: 4px;
        }
        .winner-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px; letter-spacing: 2px; color: #78350f; line-height: 1;
          margin-bottom: 12px;
        }
        @media (max-width: 480px) { .winner-name { font-size: 24px; } }
        .winner-members {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 8px; margin-bottom: 12px;
        }
        .winner-chip {
          display: flex; align-items: center; gap: 6px;
          background: rgba(251,191,36,0.2);
          border: 1px solid rgba(251,191,36,0.45);
          border-radius: 99px; padding: 4px 10px 4px 4px;
          font-size: 12px; font-weight: 500; color: #92400e;
        }
        .winner-chip-avatar {
          width: 20px; height: 20px; border-radius: 50%;
          background: var(--gold); color: #1a1a1a;
          font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .chip-role { color: #b45309; font-weight: 400; }
        .winner-votes { font-size: 12px; color: #b45309; }
        .confetti-wrap {
          position: absolute; inset: 0; pointer-events: none;
          overflow: hidden; border-radius: 24px;
        }
        .confetti-piece {
          position: absolute; top: -16px; border-radius: 2px;
          animation: confettiFall linear forwards;
        }
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          {/* confetti */}
          {showWinner && winner?.voteCount > 0 && (
            <div className="confetti-wrap" aria-hidden>
              {confetti.map((c) => (
                <div
                  key={c.id}
                  className="confetti-piece"
                  style={{
                    left: `${c.left}%`,
                    animationDelay: `${c.delay}s`,
                    animationDuration: `${c.dur}s`,
                    background: c.color,
                    width: c.size,
                    height: c.size,
                    transform: `rotate(${c.rotate}deg)`,
                  }}
                />
              ))}
            </div>
          )}

          <button className="modal-close" onClick={onClose}>
            ✕
          </button>

          <div className="modal-header">
            <span className="trophy-icon">🏆</span>
            <h2 className="modal-title">Election Results</h2>
            <p className="modal-sub">
              {results
                ? `${results.totalVotes} total vote${results.totalVotes !== 1 ? "s" : ""} cast`
                : "Loading…"}
            </p>
          </div>

          {loading ? (
            <div className="modal-loading">
              <div className="spinner" />
              <p>Tallying votes…</p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="modal-empty">No votes have been cast yet.</div>
          ) : (
            <>
              <div className="bars-wrap">
                {sorted.map((panel, i) => (
                  <VoteBar
                    key={panel._id}
                    panel={panel}
                    maxVotes={maxVotes}
                    totalVotes={results.totalVotes}
                    rank={i}
                    animating={animating}
                    delay={i * 120}
                  />
                ))}
              </div>

              {showWinner && winner?.voteCount > 0 && (
                <div className="winner-banner">
                  <span className="winner-crown">👑</span>
                  <div className="winner-label">Winner</div>
                  <div className="winner-name">{winner.name}</div>
                  {winner.members?.length > 0 && (
                    <div className="winner-members">
                      {winner.members.map((m, i) => (
                        <span key={i} className="winner-chip">
                          <span className="winner-chip-avatar">
                            {m.name?.[0]?.toUpperCase()}
                          </span>
                          <span>{m.name}</span>
                          {m.role && (
                            <span className="chip-role">· {m.role}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="winner-votes">
                    {winner.voteCount} vote{winner.voteCount !== 1 ? "s" : ""} ·{" "}
                    {results.totalVotes > 0
                      ? Math.round(
                          (winner.voteCount / results.totalVotes) * 100,
                        )
                      : 0}
                    % of total
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function PanelList() {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [editPanel, setEditPanel] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("adminToken");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchPanels = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/api/panels`);
      setPanels(data.panels || []);
    } catch {
      setError("Failed to load panels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPanels();
  }, []);

  const flash = (msg, type = "success") => {
    if (type === "success") setSuccess(msg);
    else setError(msg);
    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 3000);
  };

  const openCreate = () => {
    setEditPanel(null);
    setForm(emptyForm);
    setShowForm(true);
  };
  const openEdit = (panel) => {
    setEditPanel(panel);
    setForm({
      name: panel.name,
      description: panel.description || "",
      members: panel.members?.length
        ? panel.members.map((m) => ({ name: m.name, role: m.role || "" }))
        : [{ name: "", role: "" }],
    });
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditPanel(null);
    setForm(emptyForm);
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...form.members];
    updated[index][field] = value;
    setForm({ ...form, members: updated });
  };
  const addMember = () =>
    setForm({ ...form, members: [...form.members, { name: "", role: "" }] });
  const removeMember = (index) => {
    if (form.members.length === 1) return;
    setForm({ ...form, members: form.members.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editPanel) {
        await axios.patch(
          `${API}/api/panels/${editPanel._id}`,
          form,
          authHeader,
        );
        flash("Panel updated successfully.");
      } else {
        await axios.post(`${API}/api/panels`, form, authHeader);
        flash("Panel created successfully.");
      }
      closeForm();
      fetchPanels();
    } catch (err) {
      flash(err.response?.data?.message || "Something went wrong.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (panel) => {
    try {
      const { data } = await axios.patch(
        `${API}/api/panels/${panel._id}/toggle`,
        {},
        authHeader,
      );
      flash(`Panel ${data.isActive ? "activated" : "deactivated"}.`);
      fetchPanels();
    } catch {
      flash("Failed to toggle panel status.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this panel? This cannot be undone.")) return;
    try {
      await axios.delete(`${API}/api/panels/${id}`, authHeader);
      flash("Panel deleted.");
      fetchPanels();
    } catch {
      flash("Failed to delete panel.", "error");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panels</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage voting panels and their members
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowResults(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm"
          >
            🏆 Reveal Results
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            <span className="text-lg leading-none">+</span> New Panel
          </button>
        </div>
      </div>

      {/* Flash messages */}
      {success && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Panel list */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading panels...</div>
      ) : panels.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🗳️</p>
          <p className="font-medium text-gray-500">No panels yet</p>
          <p className="text-sm mt-1">
            Create your first panel to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {panels.map((panel) => (
            <div
              key={panel._id}
              className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-semibold text-gray-800">
                      {panel.name}
                    </h2>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        panel.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {panel.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {panel.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {panel.description}
                    </p>
                  )}
                  {panel.members?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {panel.members.map((m, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5"
                        >
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center uppercase">
                            {m.name?.[0] || "?"}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-700 leading-tight">
                              {m.name}
                            </p>
                            {m.role && (
                              <p className="text-xs text-gray-400 leading-tight">
                                {m.role}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:shrink-0">
                  <button
                    onClick={() => handleToggle(panel)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
                      panel.isActive
                        ? "border-gray-300 text-gray-600 hover:bg-gray-50"
                        : "border-green-300 text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {panel.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => openEdit(panel)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(panel._id)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Modal */}
      {showResults && (
        <ResultsModal onClose={() => setShowResults(false)} token={token} />
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">
                {editPanel ? "Edit Panel" : "Create Panel"}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Panel Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Progressive Alliance"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Short description of the panel..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Members
                  </label>
                  <button
                    type="button"
                    onClick={addMember}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    + Add Member
                  </button>
                </div>
                <div className="space-y-2">
                  {form.members.map((member, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) =>
                          handleMemberChange(index, "name", e.target.value)
                        }
                        placeholder="Full name"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={member.role}
                        onChange={(e) =>
                          handleMemberChange(index, "role", e.target.value)
                        }
                        placeholder="Role (optional)"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        disabled={form.members.length === 1}
                        className="text-red-400 hover:text-red-600 disabled:opacity-30 text-lg leading-none px-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeForm}
                  className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="text-sm px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-60"
                >
                  {submitting
                    ? "Saving..."
                    : editPanel
                      ? "Save Changes"
                      : "Create Panel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
