import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const VOTING_DEADLINE = new Date("2026-07-17T01:30:00+05:30");

/* ── Small avatar helper: photo if we have one, else initial ── */
function MemberAvatar({ photo, name, size = 20, selected = false }) {
  const dim = { width: size, height: size };
  if (photo) {
    return (
      <img
        src={photo}
        alt={name || ""}
        style={dim}
        className="rounded-full object-cover border border-white/60 flex-shrink-0"
      />
    );
  }
  return (
    <div
      style={dim}
      className={`rounded-full text-xs font-bold flex items-center justify-center uppercase flex-shrink-0 ${
        selected
          ? "bg-indigo-100 text-indigo-600"
          : "bg-slate-200 text-slate-500"
      }`}
    >
      {name?.[0] || "?"}
    </div>
  );
}

/* ── Live NRI turnout widget shown on the "already voted" screen ── */
function LiveTurnout({ token }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${API}/api/votes/nri-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) setStats(data);
      } catch {
        // silently ignore — this is a best-effort live widget
      }
    };
    fetchStats();
    const id = setInterval(fetchStats, 8000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token]);

  if (!stats) return null;

  return (
    <div className="fade-up-3 mt-5 bg-white border-2 border-indigo-100 rounded-2xl p-5 shadow-sm text-left">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live turnout
        </p>
        <p className="text-lg font-black text-indigo-600">
          {stats.percentage}%
        </p>
      </div>
      <p className="text-sm text-slate-500 mb-3">
        {stats.votedCount} of {stats.totalNri} NRI members have voted
      </p>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-700"
          style={{ width: `${stats.percentage}%` }}
        />
      </div>
      <button
        onClick={() => navigate("/vote-updates")}
        className="w-full py-2.5 rounded-xl border-2 border-indigo-200 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 transition"
      >
        View Full Updates →
      </button>
    </div>
  );
}

export default function VotingPage() {
  const [panels, setPanels] = useState([]);
  const [selected, setSelected] = useState(null);
  const [voteStatus, setVoteStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [voted, setVoted] = useState(false);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [isNri, setIsNri] = useState(null);
  const [votingClosed, setVotingClosed] = useState(
    () => Date.now() > VOTING_DEADLINE.getTime(),
  );

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const timer = setInterval(() => {
      setVotingClosed(Date.now() > VOTING_DEADLINE.getTime());
    }, 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token || !userId) {
      setNotLoggedIn(true);
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const [panelsRes, statusRes, meRes] = await Promise.all([
          axios.get(`${API}/api/panels`),
          axios.get(`${API}/api/votes/status`, authHeader),
          axios.get(`${API}/api/user/${userId}`, authHeader),
        ]);
        const activePanels = (panelsRes.data.panels || []).filter(
          (p) => p.isActive,
        );
        setPanels(activePanels);
        setVoteStatus(statusRes.data);
        setIsNri(meRes.data?.user?.nri === "Yes");
      } catch {
        setError("Failed to load voting data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleVote = async () => {
    if (!selected) return;
    if (votingClosed) {
      setError("Voting has closed. Votes are no longer being accepted.");
      setShowConfirm(false);
      return;
    }
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

  if (isNri === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500&display=swap');
          .restrict-card { font-family: 'DM Sans', sans-serif; }
          .restrict-title { font-family: 'Playfair Display', serif; }
          @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          .fade-up { animation: fadeUp 0.5s ease forwards; }
          .fade-up-2 { animation: fadeUp 0.5s 0.1s ease both; }
        `}</style>
        <div className="restrict-card text-center max-w-sm w-full">
          <div className="fade-up w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">🌍</span>
          </div>
          <h1 className="restrict-title fade-up-2 text-3xl font-bold text-slate-800 mb-3">
            Voting Restricted
          </h1>
          <p className="fade-up-2 text-slate-500 text-sm">
            Voting is only for the international committee members.
          </p>
        </div>
      </div>
    );
  }

  if (votingClosed && !voteStatus?.hasVoted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500&display=swap');
          .closed-card { font-family: 'DM Sans', sans-serif; }
          .closed-title { font-family: 'Playfair Display', serif; }
          @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          .fade-up { animation: fadeUp 0.5s ease forwards; }
          .fade-up-2 { animation: fadeUp 0.5s 0.1s ease both; }
        `}</style>
        <div className="closed-card text-center max-w-sm w-full">
          <div className="fade-up w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">⏰</span>
          </div>
          <h1 className="closed-title fade-up-2 text-3xl font-bold text-slate-800 mb-3">
            Voting Closed
          </h1>
          <p className="fade-up-2 text-slate-500 text-sm">
            Voting closed on 17 July, 1:30 AM IST. Votes can no longer be
            registered.
          </p>
        </div>
      </div>
    );
  }

  /* ─── Already voted ─── */
  if (voteStatus?.hasVoted) {
    const votedPanel = voteStatus.votedPanel;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4 py-10">
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
                      <MemberAvatar photo={m.photo} name={m.name} size={20} />
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

          {/* Live NRI turnout + link to full breakdown */}
          <LiveTurnout token={token} />
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
        @keyframes modalIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        .modal-box { animation: modalIn 0.2s ease; }
      `}</style>

      <div className="vote-root max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            <span>🗳️</span> Official Ballot
          </div>
          <h1 className="vote-title text-4xl font-bold text-slate-800 mb-3">
            Cast Your Vote
          </h1>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            നിങ്ങള്‍ക്ക് ഇഷ്ടപ്പെട്ട പാനല്‍ സെലക്ട് ചെയ്ത് വോട്ട് രേഖപ്പെടുത്തുക.
          </p>
          <p className="text-xs text-amber-600 font-medium mt-2">
            Voting closes 17 July, 1:30 AM IST.
          </p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

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
                  <div
                    className={`radio-ring mt-0.5 ${isSelected ? "checked" : ""}`}
                  >
                    {isSelected && <div className="radio-dot" />}
                  </div>

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

                    {panel.members?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {panel.members.map((m, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1"
                          >
                            <MemberAvatar
                              photo={m.photo}
                              name={m.name}
                              size={20}
                              selected={isSelected}
                            />
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

        {panels.length > 0 && (
          <div className="flex justify-center">
            <button
              disabled={!selected || submitting || votingClosed}
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
              ഒരു തവണ വോട്ട് രേഖപ്പെടുത്തിയാൽ മാറ്റം വരുത്താൻ സാധിക്കില്ല. ആലോചിച്ച് മാത്രം പാനൽ സെലക്‌ട് ചെയ്യുക.
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
