import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineStar,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineBell,
} from "react-icons/hi";

const NAV_TABS = [
  { label: "Requests", path: "/admin", icon: HiOutlineDocumentText },
  { label: "Members", path: "/users", icon: HiOutlineUsers },
  { label: "Juniors", path: "/juniors", icon: HiOutlineStar },
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
    { label: "User Home", path: "/" },
    { label: "User Login", path: "/login" },
    { label: "User Register", path: "/register" },
  ];

  return (
    <div className="md:hidden sticky top-0 z-40">
      {/* Navy header */}
      <div className="bg-gradient-to-r from-[#0b1230] via-[#111b45] to-[#182563] relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative flex items-center px-4 pt-4 pb-4">
          <div>
            <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-blue-300 leading-none mb-1">
              Control Center
            </p>
            <p className="text-white text-base font-extrabold leading-tight">
              Admin Panel
            </p>
          </div>

          <button className="ml-auto mr-2 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-blue-200">
            <HiOutlineBell size={17} />
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-[#111b45]"
          >
            {menuOpen ? (
              <HiOutlineX className="text-xl" />
            ) : (
              <HiOutlineMenu className="text-xl" />
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-4 top-16 w-44 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-50">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    navigate(item.path);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b last:border-b-0 border-gray-100"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs row  white, mockup-style pills */}
      <div className="flex bg-white border-b border-gray-100 px-2 py-2 gap-1.5">
        {NAV_TABS.map((tab) => {
          const isActive = location.pathname === tab.path;
          const count = counts[tab.path];
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-50 text-gray-500"
              }`}
            >
              <Icon size={15} />
              <span className="text-[12px] font-bold">{tab.label}</span>
              {loading ? (
                <span className="h-4 w-6 rounded-full bg-white/20 animate-pulse" />
              ) : (
                count != null && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-px rounded-full leading-none ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
 