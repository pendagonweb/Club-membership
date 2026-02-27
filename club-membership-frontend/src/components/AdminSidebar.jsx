import { useLocation, useNavigate } from "react-router-dom";

export default function AdminSidebar({ onLogout, pendingCount=0, membersCount=0, loading = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "Requests", path: "/admin", count: pendingCount },
    { label: "Members", path: "/users", count: membersCount },
  ];

  
  return (
    <aside className="w-full md:w-64 bg-white shadow-md md:flex md:flex-col p-3 md:p-0">
      <div className="text-xl md:text-2xl font-bold text-indigo-600 text-center m-3">
        Admin Panel
      </div>

      {/* MOBILE VIEW */}
      <div className="flex md:hidden justify-around mb-3">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className={`relative px-3 py-2 rounded-md text-sm font-semibold transition ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
              {/* Show badge always (even if 0) */}
              {!loading && tab.count != null && (
                <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={onLogout}
          className="px-3 py-2 rounded-md text-sm font-semibold bg-red-600 text-white hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* DESKTOP VIEW */}
      <nav className="hidden md:flex flex-col flex-1 px-2 py-3 gap-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition font-medium ${
                isActive ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <span>{tab.label}</span>
              {/* Show badge always (even if 0) */}
              {!loading && tab.count != null && (
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={onLogout}
          className="w-full px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
