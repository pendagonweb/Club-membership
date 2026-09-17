import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineStar,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineBell,
  HiOutlineHome,
  HiOutlineLogin,
  HiOutlineUserAdd,
  HiOutlineShieldCheck,
  HiChevronRight,
} from "react-icons/hi";

const NAV_TABS = [
  {
    label: "Requests",
    path: "/admin",
    icon: HiOutlineDocumentText,
    permission: "requests",
  },
  {
    label: "Members",
    path: "/users",
    icon: HiOutlineUsers,
    permission: "members",
  },
  {
    label: "Juniors",
    path: "/juniors",
    icon: HiOutlineStar,
    permission: "juniors",
  },
];

const MENU_ICONS = {
  "/": HiOutlineHome,
  "/login": HiOutlineLogin,
  "/register": HiOutlineUserAdd,
  "/admins": HiOutlineShieldCheck,
};

export default function AdminNavigation({
  pendingCount = 0,
  membersCount = 0,
  juniorCount = 0,
  loading = false,
  adminInfo,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const HIDDEN_PATHS = [
    "/panels",
    "/admingallery",
    "/adminactivities",
    "/admins",
  ];
  const isHidden = HIDDEN_PATHS.includes(location.pathname); // ← just compute it, don't return yet

  const isSuperAdmin = adminInfo?.role === "superadmin";
  const tabs = NAV_TABS.filter(
    (t) =>
      !adminInfo ||
      isSuperAdmin ||
      adminInfo.permissions?.includes(t.permission),
  );

  const counts = {
    "/admin": pendingCount,
    "/users": membersCount,
    "/juniors": juniorCount,
  };

  const menuItems = [
    { label: "User Home", path: "/" },
    { label: "User Login", path: "/login" },
    { label: "User Register", path: "/register" },
    ...(isSuperAdmin ? [{ label: "Manage Admins", path: "/admins" }] : []),
  ];

  useEffect(() => {
    const handleClick = (e) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  // ✅ early return now happens AFTER every hook has been called, every render
  if (isHidden) return null;

  return (
    <div className="md:hidden sticky top-0 z-40">
      {/* Header bar — no overflow-hidden here anymore, so the dropdown can never be clipped */}
      <div className="relative bg-gradient-to-r from-[#0b1230] via-[#111b45] to-[#182563]">
        {/* Decorative dot pattern lives in its own clipped layer, isolated from the dropdown */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.06]"
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

          <button
            className="ml-auto mr-2 relative w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-blue-200 backdrop-blur-sm hover:bg-white/15 transition-colors"
            aria-label="Notifications"
          >
            <HiOutlineBell size={17} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-400" />
          </button>

          <button
            ref={buttonRef}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 ${
              menuOpen
                ? "bg-white text-[#111b45] rotate-90"
                : "bg-white text-[#111b45]"
            }`}
          >
            {menuOpen ? (
              <HiOutlineX className="text-xl" />
            ) : (
              <HiOutlineMenu className="text-xl" />
            )}
          </button>
        </div>

        {/* Dropdown — same stacking context as the header, but the ancestor no longer clips it */}
        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute right-4 top-[calc(100%-8px)] z-50 w-52 origin-top-right rounded-2xl border border-white/10 bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/20 animate-[fadeIn_0.15s_ease-out] overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-indigo-50 to-blue-50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                Navigate
              </p>
            </div>

            <div className="py-1.5">
              {menuItems.map((item, index) => {
                const Icon = MENU_ICONS[item.path] || HiChevronRight;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(item.path);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
                  >
                    <Icon
                      size={16}
                      className="text-gray-400 group-hover:text-indigo-500 transition-colors"
                    />
                    <span className="flex-1">{item.label}</span>
                    <HiChevronRight
                      size={14}
                      className="text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tabs row */}
      <div className="flex bg-white/95 backdrop-blur-md border-b border-gray-100 px-2 py-2 gap-1.5 shadow-sm">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const count = counts[tab.path];
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-200"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Icon size={15} />
              <span className="text-[12px]">{tab.label}</span>
              {loading ? (
                <span className="h-4 w-6 rounded-full bg-white/20 animate-pulse" />
              ) : (
                count != null && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-px rounded-full leading-none min-w-[18px] text-center ${
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
