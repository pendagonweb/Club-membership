import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function VotingPage() {
  const [panels, setPanels] = useState([]);
  const [selected, setSelected] = useState(null);
  const [voteStatus, setVoteStatus] = useState(null); // { hasVoted, votedPanel }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [voted, setVoted] = useState(false); // success animation trigger

  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  /* ─── Load panels + vote status ─── */
  useEffect(() => {
    if (!token) {
      setNotLoggedIn(true);
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const [panelsRes, statusRes] = await Promise.all([
          axios.get(`${API}/api/panels`),
          axios.get(`${API}/api/votes/status`, authHeader),
        ]);
        const activePanels = (panelsRes.data.panels || []).filter(
          (p) => p.isActive,
        );
        setPanels(activePanels);
        setVoteStatus(statusRes.data);
      } catch {
        setError("Failed to load voting data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  /* ─── Cast vote ─── */
  const handleVote = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError("");
    try {
      await axios.post(
        `${API}/api/votes/cast`,
        { panelId: selected },
        authHeader,
      );
      const panel = panels.find((p) => p._id === selected);
      setVoteStatus({ hasVoted: true, votedPanel: panel });
      setShowConfirm(false);
      setVoted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cast vote.");
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── States ─── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">
            Loading ballot...
          </p>
        </div>
      </div>
    );
  }

  /* ─── Not logged in ─── */
  if (notLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500&display=swap');
          .auth-card { font-family: 'DM Sans', sans-serif; }
          .auth-title { font-family: 'Playfair Display', serif; }
          @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          .fade-up { animation: fadeUp 0.5s ease forwards; }
          .fade-up-2 { animation: fadeUp 0.5s 0.1s ease both; }
          .fade-up-3 { animation: fadeUp 0.5s 0.2s ease both; }
        `}</style>
        <div className="auth-card text-center max-w-sm w-full">
          <div className="fade-up w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="auth-title fade-up-2 text-3xl font-bold text-slate-800 mb-3">
            Login Required
          </h1>
          <p className="fade-up-2 text-slate-500 text-sm mb-8">
            You need to be logged in as a member to cast your vote.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="fade-up-3 w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-lg shadow-indigo-200"
          >
            Go to Login →
          </button>
        </div>
      </div>
    );
  }

  /* ─── Already voted ─── */
  if (voteStatus?.hasVoted) {
    const votedPanel = voteStatus.votedPanel;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500&display=swap');
          .voted-card { font-family: 'DM Sans', sans-serif; }
          .voted-title { font-family: 'Playfair Display', serif; }
          @keyframes pop { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          .pop { animation: pop 0.5s cubic-bezier(.36,.07,.19,.97) forwards; }
          .fade-up { animation: fadeUp 0.6s ease forwards; }
          .fade-up-2 { animation: fadeUp 0.6s 0.15s ease both; }
          .fade-up-3 { animation: fadeUp 0.6s 0.3s ease both; }
        `}</style>
        <div className="voted-card text-center max-w-md w-full">
          {/* Checkmark */}
          <div className="pop flex items-center justify-center w-20 h-20 rounded-full bg-green-100 border-4 border-green-400 mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="voted-title fade-up text-3xl font-bold text-slate-800 mb-2">
            Vote Recorded!
          </h1>
          <p className="fade-up-2 text-slate-500 text-sm mb-8">
            Your vote has been securely submitted. Thank you for participating.
          </p>

          {/* Voted panel card */}
          {votedPanel && (
            <div className="fade-up-3 bg-white border-2 border-indigo-200 rounded-2xl p-5 shadow-md text-left">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
                You voted for
              </p>
              <h2 className="voted-title text-xl font-bold text-slate-800 mb-1">
                {votedPanel.name}
              </h2>
              {votedPanel.description && (
                <p className="text-sm text-slate-500 mb-4">
                  {votedPanel.description}
                </p>
              )}
              {votedPanel.members?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {votedPanel.members.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 bg-indigo-50 rounded-full px-3 py-1"
                    >
                      <div className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 text-xs font-bold flex items-center justify-center uppercase">
                        {m.name?.[0]}
                      </div>
                      <span className="text-xs text-indigo-700 font-medium">
                        {m.name}
                      </span>
                      {m.role && (
                        <span className="text-xs text-indigo-400">
                          · {m.role}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ─── Main voting UI ─── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        .vote-root { font-family: 'DM Sans', sans-serif; }
        .vote-title { font-family: 'Playfair Display', serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .panel-card { animation: fadeUp 0.4s ease both; }
        .panel-card:nth-child(1) { animation-delay: 0.05s; }
        .panel-card:nth-child(2) { animation-delay: 0.1s; }
        .panel-card:nth-child(3) { animation-delay: 0.15s; }
        .panel-card:nth-child(4) { animation-delay: 0.2s; }
        .panel-card:nth-child(5) { animation-delay: 0.25s; }
        .panel-card {
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .panel-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(99,102,241,0.12); }
        .panel-card.selected { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15), 0 8px 24px rgba(99,102,241,0.12); }
        .radio-ring {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid #cbd5e1;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: border-color 0.15s;
        }
        .radio-ring.checked { border-color: #6366f1; background: #6366f1; }
        .radio-dot { width: 8px; height: 8px; border-radius: 50%; background: white; }
        @keyframes scaleIn { from{transform:scale(0)} to{transform:scale(1)} }
        .radio-dot { animation: scaleIn 0.15s ease; }
        /* Confirm modal */
        @keyframes modalIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        .modal-box { animation: modalIn 0.2s ease; }
      `}</style>

      <div className="vote-root max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            <span>🗳️</span> Official Ballot
          </div>
          <h1 className="vote-title text-4xl font-bold text-slate-800 mb-3">
            Cast Your Vote
          </h1>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Select the panel you wish to support. You can only vote once —
            choose carefully.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        {/* No panels */}
        {panels.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <p className="text-5xl mb-4">🗳️</p>
            <p className="font-medium text-slate-500">
              Voting is not open yet.
            </p>
            <p className="text-sm mt-1">
              Check back later when panels are available.
            </p>
          </div>
        )}

        {/* Panel cards */}
        <div className="space-y-4 mb-8">
          {panels.map((panel) => {
            const isSelected = selected === panel._id;
            return (
              <div
                key={panel._id}
                className={`panel-card bg-white border-2 rounded-2xl p-5 ${
                  isSelected ? "selected border-indigo-400" : "border-slate-200"
                }`}
                onClick={() => setSelected(panel._id)}
              >
                <div className="flex items-start gap-4">
                  {/* Radio */}
                  <div
                    className={`radio-ring mt-0.5 ${isSelected ? "checked" : ""}`}
                  >
                    {isSelected && <div className="radio-dot" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="vote-title text-lg font-bold text-slate-800">
                        {panel.name}
                      </h2>
                    </div>

                    {panel.description && (
                      <p className="text-sm text-slate-500 mt-1 mb-3">
                        {panel.description}
                      </p>
                    )}

                    {/* Members */}
                    {panel.members?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {panel.members.map((m, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1"
                          >
                            <div
                              className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center uppercase ${
                                isSelected
                                  ? "bg-indigo-100 text-indigo-600"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {m.name?.[0]}
                            </div>
                            <span className="text-xs font-medium text-slate-700">
                              {m.name}
                            </span>
                            {m.role && (
                              <span className="text-xs text-slate-400">
                                · {m.role}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit button */}
        {panels.length > 0 && (
          <div className="flex justify-center">
            <button
              disabled={!selected || submitting}
              onClick={() => setShowConfirm(true)}
              className="w-full max-w-sm py-3.5 rounded-2xl font-semibold text-sm transition-all
                bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200
                disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {submitting ? "Submitting..." : "Submit Vote →"}
            </button>
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="modal-box bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🗳️</span>
            </div>
            <h3 className="vote-title text-xl font-bold text-slate-800 mb-2">
              Confirm Your Vote
            </h3>
            <p className="text-slate-500 text-sm mb-1">You are voting for</p>
            <p className="font-semibold text-indigo-600 text-base mb-1">
              {panels.find((p) => p._id === selected)?.name}
            </p>
            <p className="text-xs text-slate-400 mb-6">
              This action cannot be undone. You can only vote once.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
              >
                Go Back
              </button>
              <button
                onClick={handleVote}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition disabled:opacity-60"
              >
                {submitting ? "Voting..." : "Yes, Vote!"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
