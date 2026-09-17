import { useLocation, useNavigate } from "react-router-dom";
import {
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineStar,
  HiOutlineViewGrid,
  HiOutlinePhotograph,
  HiOutlineLightningBolt,
  HiOutlineLogout,
  HiOutlineShieldCheck,
} from "react-icons/hi";

const DESKTOP_TABS = [
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
  {
    label: "Panels",
    path: "/panels",
    icon: HiOutlineViewGrid,
    permission: "panels",
  },
  {
    label: "Gallery",
    path: "/admingallery",
    icon: HiOutlinePhotograph,
    permission: "gallery",
  },
  {
    label: "Activity",
    path: "/adminactivities",
    icon: HiOutlineLightningBolt,
    permission: "activities",
  },
  {
    label: "Admins",
    path: "/admins",
    icon: HiOutlineShieldCheck,
    superAdminOnly: true,
  },
];

const MOBILE_TABS = [
  {
    label: "Requests",
    path: "/admin",
    icon: HiOutlineDocumentText,
    permission: "requests",
  },
  {
    label: "Panels",
    path: "/panels",
    icon: HiOutlineViewGrid,
    permission: "panels",
  },
  {
    label: "Gallery",
    path: "/admingallery",
    icon: HiOutlinePhotograph,
    permission: "gallery",
  },
  {
    label: "Activity",
    path: "/adminactivities",
    icon: HiOutlineLightningBolt,
    permission: "activities",
  },
];

export default function AdminSidebar({
  onLogout,
  pendingCount = 0,
  membersCount = 0,
  juniorCount = 0,
  registrationCount = 0,
  loading = false,
  adminInfo,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const isSuperAdmin = adminInfo?.role === "superadmin";
  const canSee = (tab) => {
    if (!adminInfo) return true; // avoid flashing/hiding tabs while still loading
    if (tab.superAdminOnly) return isSuperAdmin;
    if (!tab.permission) return true;
    return isSuperAdmin || adminInfo.permissions?.includes(tab.permission);
  };

  const desktopTabs = DESKTOP_TABS.filter(canSee);
  const mobileTabs = MOBILE_TABS.filter(canSee);

  const counts = {
    "/admin": pendingCount,
    "/users": membersCount,
    "/juniors": juniorCount,
    "/registration": registrationCount,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap');
        .sidebar-root { font-family: 'Manrope', sans-serif; }
      `}</style>

      <div className="sidebar-root">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex md:flex-col w-64 min-h-screen bg-gradient-to-b from-[#0b1230] via-[#111b45] to-[#182563] sticky top-0 overflow-hidden flex-shrink-0">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="pointer-events-none absolute -top-16 -left-10 w-56 h-56 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative z-10 px-6 pt-8 pb-6">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 backdrop-blur flex items-center justify-center mb-4">
              <HiOutlineViewGrid className="text-blue-300" size={20} />
            </div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-blue-300 mb-1">
              Control Center
            </p>
            <p className="text-white text-xl font-extrabold leading-tight">
              Admin Panel
            </p>
            {adminInfo && (
              <p className="text-blue-200/70 text-xs mt-2">
                {adminInfo.name || adminInfo.username} ·{" "}
                <span
                  className={isSuperAdmin ? "text-amber-300 font-semibold" : ""}
                >
                  {isSuperAdmin ? "Superadmin" : "Admin"}
                </span>
              </p>
            )}
          </div>

          <div className="relative z-10 h-px mx-6 mb-4 bg-white/10" />

          <nav className="relative z-10 flex-1 px-3 flex flex-col gap-1">
            {desktopTabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              const count = counts[tab.path];
              const Icon = tab.icon;
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    isActive
                      ? "bg-white text-[#111b45] shadow-lg shadow-black/20"
                      : "text-blue-100/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-blue-600" : "text-blue-200/70"}
                  />
                  <span className="flex-1 text-sm font-bold">{tab.label}</span>
                  {tab.superAdminOnly && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-amber-100 text-amber-700" : "bg-amber-500/20 text-amber-300"}`}
                    >
                      SUPER
                    </span>
                  )}
                  {!loading && !tab.superAdminOnly && count != null && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-blue-600 text-white" : "bg-white/10 text-blue-200"}`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="relative z-10 p-4">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/15 border border-red-400/20 text-red-300 hover:bg-red-500/25 transition-colors text-sm font-bold"
            >
              <HiOutlineLogout size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* MOBILE BOTTOM NAV */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
            {mobileTabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              const count = counts[tab.path];
              const Icon = tab.icon;
              const hasBadge = !loading && count != null && count > 0;
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1"
                >
                  <div className="relative">
                    <Icon
                      size={20}
                      className={isActive ? "text-blue-600" : "text-gray-400"}
                    />
                    {hasBadge && (
                      <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold ${isActive ? "text-blue-600" : "text-gray-400"}`}
                  >
                    {tab.label}
                  </span>
                  {isActive && (
                    <span className="w-4 h-0.5 rounded-full bg-blue-600 -mt-0.5" />
                  )}
                </button>
              );
            })}
            <button
              onClick={onLogout}
              className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1"
            >
              <HiOutlineLogout size={20} className="text-red-400" />
              <span className="text-[10px] font-bold text-red-400">Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
