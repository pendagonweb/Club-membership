import { useLocation, useNavigate } from "react-router-dom";

// Original tabs + Registration + Activity added
const DESKTOP_TABS = [
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
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    label: "Panels",
    path: "/panels",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Gallery",
    path: "/admingallery",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    label: "Activity",
    path: "/adminactivities",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

// Mobile: Registration, Panels, Gallery, Activity only
const MOBILE_TABS = [
  {
    label: "Registration",
    path: "/admin",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    label: "Panels",
    path: "/panels",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Gallery",
    path: "/admingallery",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    label: "Activity",
    path: "/adminactivities",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

export default function AdminSidebar({
  onLogout,
  pendingCount = 0,
  membersCount = 0,
  juniorCount = 0,
  registrationCount = 0,
  loading = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const counts = {
    "/admin": pendingCount,
    "/users": membersCount,
    "/juniors": juniorCount,
    "/registration": registrationCount,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .sidebar-root {
          font-family: 'DM Sans', sans-serif;
        }

        /* ── DESKTOP ── */
        .sidebar-desktop {
          width: 240px;
          min-height: 100vh;
          background: #f8f9fc;
          border-right: 1px solid #e8eaf0;
          display: flex;
          flex-direction: column;
          padding: 0;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .sidebar-desktop::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .sidebar-desktop::after {
          content: '';
          position: absolute;
          top: -80px; left: -60px;
          width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .sidebar-brand {
          padding: 28px 20px 20px;
          position: relative; z-index: 1;
        }

        .brand-eyebrow {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #6366f1;
          margin-bottom: 2px;
        }

        .brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #1e1f26;
          line-height: 1.1;
          letter-spacing: -0.5px;
        }

        .brand-divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(99,102,241,0.25) 0%, transparent 100%);
          margin: 16px 20px 16px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 0 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: relative; z-index: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 12px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s ease;
          position: relative;
          text-align: left;
          width: 100%;
          background: transparent;
        }

        .nav-item:hover {
          background: rgba(99,102,241,0.05);
          border-color: rgba(99,102,241,0.1);
        }

        .nav-item.active {
          background: linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.06) 100%);
          border-color: rgba(99,102,241,0.2);
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 8px; bottom: 8px;
          width: 3px;
          border-radius: 0 3px 3px 0;
          background: #6366f1;
        }

        .nav-icon {
          width: 18px; height: 18px;
          flex-shrink: 0;
          transition: color 0.2s;
        }

        .nav-item.active .nav-icon { color: #6366f1; }
        .nav-item:not(.active) .nav-icon { color: #9ca3af; }

        .nav-label {
          flex: 1;
          font-size: 13.5px;
          font-weight: 600;
          transition: color 0.2s;
        }
        .nav-item.active .nav-label { color: #4338ca; }
        .nav-item:not(.active) .nav-label { color: #6b7280; }

        .nav-badge {
          min-width: 22px; height: 22px;
          padding: 0 6px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .nav-item.active .nav-badge {
          background: #6366f1;
          color: #fff;
        }
        .nav-item:not(.active) .nav-badge {
          background: #e8eaf0;
          color: #9ca3af;
        }

        .nav-section-divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(99,102,241,0.15) 0%, transparent 100%);
          margin: 8px 2px;
        }

        .sidebar-footer {
          padding: 16px 12px 24px;
          position: relative; z-index: 1;
        }

        .logout-btn {
          width: 100%;
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px;
          border-radius: 12px;
          background: rgba(239,68,68,0.05);
          border: 1px solid rgba(239,68,68,0.15);
          color: #ef4444;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .logout-btn:hover {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.25);
          color: #dc2626;
        }
        .logout-icon {
          width: 16px; height: 16px; flex-shrink: 0;
        }

        /* ── MOBILE BOTTOM NAV ── */
        .mobile-bottom-nav {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 50;
          background: rgba(248,249,252,0.97);
          backdrop-filter: blur(16px);
          border-top: 1px solid #e8eaf0;
          padding: 8px 4px calc(8px + env(safe-area-inset-bottom));
          display: flex; align-items: center; justify-content: space-around;
        }

        .mob-item {
          display: flex; flex-direction: column; align-items: center;
          gap: 3px; padding: 6px 10px; border-radius: 10px;
          cursor: pointer; border: none; background: transparent;
          transition: all 0.2s; position: relative; min-width: 52px;
          font-family: 'DM Sans', sans-serif;
        }

        .mob-item.active {
          background: rgba(99,102,241,0.08);
        }

        .mob-icon-wrap {
          width: 24px; height: 24px; position: relative;
          display: flex; align-items: center; justify-content: center;
        }

        .mob-icon {
          width: 20px; height: 20px;
          transition: color 0.2s;
        }
        .mob-item.active .mob-icon { color: #6366f1; }
        .mob-item:not(.active) .mob-icon { color: #9ca3af; }

        .mob-dot {
          position: absolute; top: -2px; right: -4px;
          width: 8px; height: 8px;
          background: #6366f1; border-radius: 50%;
          border: 2px solid #f8f9fc;
        }

        .mob-label {
          font-size: 10px; font-weight: 600;
          transition: color 0.2s;
          letter-spacing: 0.2px;
        }
        .mob-item.active .mob-label { color: #6366f1; }
        .mob-item:not(.active) .mob-label { color: #9ca3af; }

        .mob-logout {
          display: flex; flex-direction: column; align-items: center;
          gap: 3px; padding: 6px 10px; border-radius: 10px;
          cursor: pointer; border: none; background: transparent;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s;
        }
        .mob-logout:hover { background: rgba(239,68,68,0.06); }
        .mob-logout-icon { width: 20px; height: 20px; color: #ef4444; }
        .mob-logout-label { font-size: 10px; font-weight: 600; color: #ef4444; }

        @media (max-width: 767px) {
          .sidebar-desktop { display: none !important; }
        }
        @media (min-width: 768px) {
          .mobile-bottom-nav { display: none !important; }
        }
      `}</style>

      <div className="sidebar-root">
        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="sidebar-desktop">
          <div className="sidebar-brand">
            <div className="brand-eyebrow">Control Center</div>
            <div className="brand-name">
              Admin
              <br />
              Panel
            </div>
          </div>

          <div className="brand-divider" />

          <nav className="sidebar-nav">
            {DESKTOP_TABS.map((tab, index) => {
              const isActive = location.pathname === tab.path;
              const count = counts[tab.path];
              // Add a subtle divider before Registration to separate new items
              const showDivider = index === 4;
              return (
                <div key={tab.path}>
                  {showDivider && <div className="nav-section-divider" />}
                  <button
                    onClick={() => navigate(tab.path)}
                    className={`nav-item ${isActive ? "active" : ""}`}
                  >
                    <span className="nav-icon">{tab.icon}</span>
                    <span className="nav-label">{tab.label}</span>
                    {!loading && count != null && (
                      <span className="nav-badge">{count}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <button className="logout-btn" onClick={onLogout}>
              <svg
                className="logout-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav className="mobile-bottom-nav">
          {MOBILE_TABS.map((tab) => {
            const isActive = location.pathname === tab.path;
            const count = counts[tab.path];
            const hasBadge = !loading && count != null && count > 0;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`mob-item ${isActive ? "active" : ""}`}
              >
                <div className="mob-icon-wrap">
                  <span className="mob-icon">{tab.icon}</span>
                  {hasBadge && <span className="mob-dot" />}
                </div>
                <span className="mob-label">{tab.label}</span>
              </button>
            );
          })}

          <button className="mob-logout" onClick={onLogout}>
            <svg
              className="mob-logout-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="mob-logout-label">Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
}
