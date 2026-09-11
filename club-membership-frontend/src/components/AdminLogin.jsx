import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, ArrowRight } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { VITE_BACKEND_URL } = import.meta.env;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${VITE_BACKEND_URL}/api/admin/login`, {
        username: username.trim(),
        password,
      });

      if (res.data.token) {
        localStorage.setItem("adminToken", res.data.token);
        navigate("/admin");
      } else {
        setError("Login failed: No token received");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#0b1230] via-[#111b45] to-[#182563] flex flex-col items-center justify-center px-4 py-10">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 rounded-full bg-indigo-400/15 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Crest / brand block */}
      <div className="relative z-10 flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center shadow-lg mb-4">
          <Lock className="text-blue-300" size={26} />
        </div>
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-blue-300 mb-1">
          Control Center
        </p>
        <h1 className="text-white text-2xl font-extrabold tracking-tight">
          Admin Panel
        </h1>
      </div>

      {/* Login card */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 sm:p-8"
      >
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
          Welcome back
        </h2>
        <p className="text-sm text-gray-400 mb-6">Sign in to manage the club</p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Username */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Username
          </label>
          <div className="relative">
            <User
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <button
            type="button"
            className="text-xs font-semibold text-blue-500 hover:text-blue-700"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading ? (
            "Logging in..."
          ) : (
            <>
              LOGIN <ArrowRight size={16} />
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-400 mt-6">
          Having trouble?{" "}
          <span className="text-blue-500 font-medium">Contact Support</span>
        </p>
      </form>
    </div>
  );
}
