import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

const NAV_TABS = [
  {
    label: "Requests",
    path: "/admin",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[14px] h-[14px]"
      >
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    label: "Members",
    path: "/users",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[14px] h-[14px]"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    label: "Juniors",
    path: "/juniors",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[14px] h-[14px]"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
];

export default function AdminNavigation({
  pendingCount = 0,
  membersCount = 0,
  juniorCount = 0,
  loading = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const HIDDEN_PATHS = ["/panels", "/admingallery", "/adminactivities"];
  if (HIDDEN_PATHS.includes(location.pathname)) return null;

  const counts = {
    "/admin": pendingCount,
    "/users": membersCount,
    "/juniors": juniorCount,
  };

  const menuItems = [
    {
      label: "User Home",
      path: "/",
    },
    {
      label: "User Login",
      path: "/login",
    },
    {
      label: "User Register",
      path: "/register",
    },
  ];

  return (
    <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
      {/* Brand row */}
      <div className="flex items-center px-4 pt-3 pb-3 relative">
        <div>
          <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-indigo-500 leading-none">
            Control Center
          </p>

          <p className="text-sm font-bold text-gray-800 leading-tight tracking-tight">
            Admin Panel
          </p>
        </div>

        {/* Hamburger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="ml-auto w-9 h-9 flex items-center justify-center rounded-full bg-indigo-500 text-white"
        >
          {menuOpen ? (
            <HiOutlineX className="text-xl" />
          ) : (
            <HiOutlineMenu className="text-xl" />
          )}
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-4 top-14 w-44 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-50">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  navigate(item.path);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border-b last:border-b-0 border-gray-100"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs row */}
      <div className="flex">
        {NAV_TABS.map((tab) => {
          const isActive = location.pathname === tab.path;
          const count = counts[tab.path];

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`relative flex-1 flex flex-col items-center gap-1 py-2 px-1 transition-colors
                ${isActive ? "text-indigo-600" : "text-gray-400"}`}
            >
              {/* Icon + label */}
              <div className="flex items-center gap-1">
                <span
                  className={isActive ? "text-indigo-500" : "text-gray-400"}
                >
                  {tab.icon}
                </span>

                <span
                  className={`text-[11px] font-semibold ${
                    isActive ? "text-indigo-600" : "text-gray-400"
                  }`}
                >
                  {tab.label}
                </span>
              </div>

              {/* Badge */}
              {loading ? (
                <span className="h-4 w-7 rounded-full bg-gray-100 animate-pulse" />
              ) : (
                count != null && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-px rounded-full leading-none
                    ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {count}
                  </span>
                )
              )}

              {/* Active underline */}
              {isActive && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] rounded-t bg-indigo-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
