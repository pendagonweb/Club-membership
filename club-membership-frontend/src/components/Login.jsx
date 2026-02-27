import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Hero from "../assets/Kings.jpg";           // group photo
import Lines from "../assets/lines.webp";         // left texture
import CenterLogo from "../assets/logo-Malayalam.webp";   // middle logo
import ClubName from "../assets/logo.webp";   // right text image
import Hashtag from "../assets/hashtag.webp"; 

export default function Login() {
  const [formData, setFormData] = useState({
    membershipId: "",
    phone: "",
  });

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
        "https://club-membership.vercel.app/api/member/login",
        formData
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
    className="absolute right-18 sm:left-3  bottom-20 sm:bottom-2 h-14 sm:h-16 md:h-15"
  />

  {/* HERO IMAGE */}
  <div className="flex  justify-center p-4 sm:p-6">
    <div className="w-full relative overflow-hidden sm:w-10/12 md:max-w-10/12 h-44 mt-16 sm:mt-0 sm:h-64 md:h-84  object-cover rounded-2xl">
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

    {/* RIGHT : LOGIN */}
    <form
      onSubmit={handleSubmit}
      className="space-y-3 sm:space-y-2 w-full max-w-md mx-auto md:mx-0"
    >

      {/* INPUTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          name="phone"
          placeholder="Mobile Number"
          value={formData.phone}
          onChange={handleChange}
          className="bg-gray-100 border border-gray-200 
                     rounded-md px-4 py-2 text-center
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

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

  {/* CENTER LOGO + TEXT */}
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
