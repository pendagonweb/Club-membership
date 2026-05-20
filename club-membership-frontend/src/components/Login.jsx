import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Hero from "../assets/Kings.jpg";
import Lines from "../assets/lines.webp";
import CenterLogo from "../assets/logo-Malayalam.webp";
import ClubName from "../assets/logo.webp";
import Hashtag from "../assets/hashtag.webp";
const { VITE_BACKEND_URL } = import.meta.env;

// Eye Open Icon
const EyeOpen = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

// Eye Closed Icon
const EyeClosed = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    />
  </svg>
);

export default function Login() {
  const [formData, setFormData] = useState({
    membershipId: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const Register = () => {
    navigate("/Register");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${VITE_BACKEND_URL}/api/member/login`,
        formData,
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* LEFT LINE TEXTURE */}
      <img
        src={Lines}
        alt=""
        className="h-[750px] sm:h-[650px] md:h-[750px] absolute left-0 bottom-0 w-full opacity-80 -z-10"
      />

      {/* RIGHT CLUB NAME IMAGE */}
      <img
        src={ClubName}
        alt="Kingstar"
        className="absolute sm:translate-x-0 sm:right-2 right-20 md:right-34 md:bottom-4 mt-4 h-14 sm:h-16 md:h-20"
      />

      {/* HASHTAG IMAGE */}
      <img
        src={Hashtag}
        alt="Kingstar"
        className="absolute right-18 sm:left-3 bottom-20 sm:bottom-2 h-14 sm:h-16 md:h-15"
      />

      {/* HERO IMAGE */}
      <div className="flex justify-center p-4 sm:p-6">
        <div className="w-full relative overflow-hidden sm:w-10/12 md:max-w-10/12 h-44 mt-16 sm:mt-0 sm:h-64 md:h-84 object-cover rounded-2xl">
          <img
            src={Hero}
            alt="Kingstar Members"
            className="absolute bottom-0 md:-bottom-25"
          />
        </div>
      </div>

      {/* ACTION SECTION */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4">
        {/* LEFT : BECOME A MEMBER */}
        <div className="flex justify-center md:justify-start md:ml-30 w-full">
          <button
            className="w-full sm:w-[300px] md:w-[350px]
              bg-gradient-to-r from-blue-600 to-blue-800
              rounded-md py-5 sm:py-6 px-6
              shadow-lg hover:scale-[1.02] transition text-center"
            onClick={Register}
          >
            <h1 className="text-white text-lg md:text-xl pb-2 font-extrabold tracking-wide">
              BECOME A MEMBER
            </h1>
            <p className="text-white text-xs sm:text-sm md:text-[9px] font-bold opacity-90">
              (മെമ്പർഷിപ്പ് പുതുക്കാനായി ഇവിടെ ക്ലിക്ക് ചെയ്യുക)
            </p>
          </button>
        </div>

        {/* RIGHT : LOGIN FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-3 sm:space-y-2 w-full max-w-md mx-auto md:mx-0"
        >
          {/* INPUTS — Membership ID first, Password second */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* MEMBERSHIP ID */}
            <input
              type="text"
              name="membershipId"
              placeholder="Membership ID"
              value={formData.membershipId}
              onChange={handleChange}
              className="bg-gray-100 border border-gray-200
                         rounded-md px-4 py-2 text-center
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* PASSWORD WITH EYE TOGGLE */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-gray-100 border border-gray-200
                           rounded-md px-4 py-2 pr-10 text-center
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-gray-500 hover:text-blue-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOpen /> : <EyeClosed />}
              </button>
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-700 to-blue-900
                       text-white font-bold tracking-wide
                       py-2 rounded-md text-lg
                       hover:opacity-95 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "LOGIN"}
          </button>
        </form>
      </div>

      {/* CENTER LOGO */}
      <div className="flex flex-col items-center mt-4">
        <img
          src={CenterLogo}
          alt="Logo"
          className="h-24 sm:h-24 md:h-35 mt-4 mb-10 sm:mb-14"
        />
      </div>
    </div>
  );
}
