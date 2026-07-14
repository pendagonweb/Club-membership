// src/components/BottomNav.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiHome,
  HiUser,
  HiUserGroup,
  HiBookOpen,
  HiLogout,
  HiLogin,
} from "react-icons/hi";

function TabBtn({ icon, label, active, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[52px] rounded-xl transition-all active:scale-95 ${
        active ? "text-indigo-600" : danger ? "text-red-500" : "text-gray-500"
      }`}
    >
      {icon}
      <span
        className={`text-[10px] font-semibold ${active ? "text-indigo-600" : danger ? "text-red-500" : "text-gray-500"}`}
      >
        {label}
      </span>
    </button>
  );
}

export default function BottomNav() {
  const navigate = useNavigate();

  // read the boolean from localStorage ("true"/"false" string)
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("userlogged") === "true",
  );

  // keep state in sync if it changes elsewhere (e.g. another tab, or the "storage" event you dispatch)
  useEffect(() => {
    const syncFromStorage = () => {
      setIsLoggedIn(localStorage.getItem("userlogged") === "true");
    };
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  const handleLogout = () => {
    localStorage.setItem("userlogged", "false");
    window.dispatchEvent(new Event("storage"));
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleAuthClick = () => {
    if (isLoggedIn) {
      handleLogout();
    } else {
      handleLogin();
    }
  };

  const currentPath = window.location.pathname;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        <TabBtn
          icon={<HiHome className="text-xl" />}
          label="Home"
          active={currentPath === "/"}
          onClick={() => navigate("/")}
        />
        <TabBtn
          icon={<HiUser className="text-xl" />}
          label="Profile"
          active={currentPath === "/dashboard"}
          onClick={() => navigate("/dashboard")}
        />
        <TabBtn
          icon={<HiUserGroup className="text-xl" />}
          label="Members"
          active={currentPath === "/committee"}
          onClick={() => navigate("/committee")}
        />
        <TabBtn
          icon={<HiBookOpen className="text-xl" />}
          label="Reports"
          active={currentPath === "/report"}
          onClick={() => navigate("/report")}
        />
        <TabBtn
          icon={
            isLoggedIn ? (
              <HiLogout className="text-xl" />
            ) : (
              <HiLogin className="text-xl" />
            )
          }
          label={isLoggedIn ? "Logout" : "Login"}
          danger={isLoggedIn}
          onClick={handleAuthClick}
        />
      </div>
    </nav>
  );
}
