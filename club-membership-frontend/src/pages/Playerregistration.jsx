import { useState } from "react";
import axios from "axios";
import posterImage from "../assets/fifa.png"; 

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const POSITIONS = [
  "Goalkeeper",
  "Defender",
  "Midfielder",
  "Forward",
  "Winger",
  "Striker",
];

/* ─── Field ─── */
function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">
        {label}
      </span>
      <span className="text-sm font-medium text-slate-700">{value || "—"}</span>
    </div>
  );
}

/* ─── Toast ─── */
function Toast({ message, type, onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border min-w-[260px] max-w-[90vw] animate-[slideUp_0.25s_ease]
        ${
          type === "success"
            ? "bg-blue-50 border-blue-200 text-blue-800"
            : "bg-red-50 border-red-200 text-red-700"
        }`}
    >
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] text-white flex-shrink-0
        ${type === "success" ? "bg-blue-500" : "bg-red-500"}`}
      >
        {type === "success" ? "✓" : "✕"}
      </span>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="opacity-40 hover:opacity-70 text-base leading-none"
      >
        ×
      </button>
    </div>
  );
}

/* ════════════════════════════════════
   PLAYER REGISTRATION PAGE
════════════════════════════════════ */
export default function PlayerRegistration() {
  const [membershipId, setMembershipId] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [member, setMember] = useState(null);
  const [lookupError, setLookupError] = useState("");

  const [position, setPosition] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const [toast, setToast] = useState(null);
  const [registered, setRegistered] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLookup = async () => {
    const id = membershipId.trim().toUpperCase();
    if (!id) return;
    setLookupLoading(true);
    setLookupError("");
    setMember(null);
    setPosition("");
    try {
      const { data } = await axios.get(
        `${API}/api/players/lookup/${encodeURIComponent(id)}`,
      );
      if (data.success) setMember(data.member);
    } catch (err) {
      setLookupError(
        err.response?.data?.message || "Lookup failed. Please try again.",
      );
    } finally {
      setLookupLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!member || !position) {
      showToast("Please select a playing position.", "error");
      return;
    }
    setSubmitLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/players/register`, {
        membershipId: member.membershipId,
        position,
      });
      if (data.success) {
        setRegistered(true);
        showToast("Player registered successfully!", "success");
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || "Registration failed. Please try again.",
        "error",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReset = () => {
    setMembershipId("");
    setMember(null);
    setPosition("");
    setLookupError("");
    setRegistered(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Geist', sans-serif; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-in { animation: fadeIn 0.3s ease; }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }
        .spinner-blue {
          width: 14px; height: 14px;
          border: 2px solid rgba(59,130,246,0.2);
          border-top-color: rgb(59,130,246);
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }
      `}</style>

      {/* ── Full-Width Poster ── */}
      <div className="w-full">
        <img
          src={posterImage}
          alt="KINGSTAR Fan World Cup 2026 Tournament Poster"
          className="w-full block object-cover"
          style={{ maxHeight: "480px", objectPosition: "center top" }}
        />
      </div>

      <div className="min-h-screen bg-white flex flex-col items-center px-4 py-12 pb-20">
        <div className="w-full max-w-[680px]">
          {/* Header */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-blue-500 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-4">
              ⚽ Tournament 2026
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
              KINGSTAR
              <br />
              <span className="text-slate-400 font-light">Fan World Cup</span>
            </h1>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Enter your Membership ID to retrieve your details and register.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 mb-6" />

          {/* Lookup Card */}
          <div className="mb-4">
            <label className="block text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-2">
              Membership ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. K-STAR2026/0001"
                value={membershipId}
                onChange={(e) => setMembershipId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                disabled={lookupLoading || !!member}
                className="flex-1 h-11 border border-slate-200 rounded-lg px-3 text-sm font-medium text-slate-800 bg-white placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 disabled:bg-slate-50 disabled:text-slate-400 transition-all"
              />
              {member ? (
                <button
                  onClick={handleReset}
                  className="h-11 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  Change
                </button>
              ) : (
                <button
                  onClick={handleLookup}
                  disabled={lookupLoading || !membershipId.trim()}
                  className="h-11 px-5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  {lookupLoading ? (
                    <>
                      <span className="spinner" /> Looking…
                    </>
                  ) : (
                    "Look Up"
                  )}
                </button>
              )}
            </div>
            {lookupError && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
                <span>⚠</span> {lookupError}
              </p>
            )}
          </div>

          {/* Member Details */}
          {member && !registered && (
            <div className="fade-in border border-slate-100 rounded-2xl overflow-hidden mb-4">
              {/* Member header strip */}
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-0.5">
                    Verified Member
                  </p>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    {member.name}
                  </h2>
                  {member.nickname && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      "{member.nickname}"
                    </p>
                  )}
                </div>
                {member.bloodGroup && (
                  <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-full px-3 py-1">
                    {member.bloodGroup}
                  </span>
                )}
              </div>

              {/* Info grid */}
              <div className="px-5 py-4 grid grid-cols-2 gap-4 border-b border-slate-100">
                <Field label="Membership ID" value={member.membershipId} />
                <Field
                  label="Age"
                  value={member.age ? `${member.age} yrs` : null}
                />
                <Field label="Phone" value={member.phone} />
                <Field label="Status" value="✓ Approved" />
              </div>

              {/* Position selector */}
              <div className="px-5 py-4">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-3">
                  Playing Position
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setPosition(pos)}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all
                        ${
                          position === pos
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleRegister}
                  disabled={!position || submitLoading}
                  className="w-full h-11 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {submitLoading ? (
                    <>
                      <span className="spinner" /> Registering…
                    </>
                  ) : (
                    "⚽ Register for Tournament"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success State */}
          {registered && member && (
            <div className="fade-in border border-slate-100 rounded-2xl px-6 py-10 text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-xl mx-auto mb-4">
                ✓
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                You're In!
              </h3>
              <p className="text-sm text-slate-500 mb-1">
                <span className="font-semibold text-slate-800">
                  {member.name}
                </span>{" "}
                registered as{" "}
                <span className="font-semibold text-slate-800">{position}</span>
              </p>
              <p className="text-xs text-slate-400 mb-6">
                {member.membershipId}
              </p>
              <button
                onClick={handleReset}
                className="px-5 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Register Another Player
              </button>
            </div>
          )}

          {/* Not a member CTA */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-400 mb-3">Not a member yet?</p>
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Create Membership
              <span className="text-blue-400">→</span>
            </a>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
