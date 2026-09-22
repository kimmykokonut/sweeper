import { Link, useLocation } from "react-router";

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
          aria-hidden="true"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      name: "Scorecard",
      path: "/score",
      icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
          aria-hidden="true"
        >
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="M12 11h4" />
          <path d="M12 16h4" />
          <circle cx="9" cy="11" r="0.5" fill="currentColor" />
          <circle cx="9" cy="16" r="0.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      name: "Primiera",
      path: "/primiera",
      icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
          aria-hidden="true"
        >
          <rect width="16" height="20" x="4" y="2" rx="2" />
          <line x1="8" x2="16" y1="6" y2="6" />
          <line x1="16" x2="16.01" y1="10" y2="10" strokeWidth="2.5" />
          <line x1="12" x2="12.01" y1="10" y2="10" strokeWidth="2.5" />
          <line x1="8" x2="8.01" y1="10" y2="10" strokeWidth="2.5" />
          <line x1="16" x2="16.01" y1="14" y2="14" strokeWidth="2.5" />
          <line x1="12" x2="12.01" y1="14" y2="14" strokeWidth="2.5" />
          <line x1="8" x2="8.01" y1="14" y2="14" strokeWidth="2.5" />
          <line x1="16" x2="16.01" y1="18" y2="18" strokeWidth="2.5" />
          <line x1="12" x2="12.01" y1="18" y2="18" strokeWidth="2.5" />
          <line x1="8" x2="8.01" y1="18" y2="18" strokeWidth="2.5" />
        </svg>
      ),
    },
    {
      name: "History",
      path: "/history",
      icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-emerald-950/95 border-t border-emerald-800/80 backdrop-blur-md shadow-2xl pb-[env(safe-area-inset-bottom,0.25rem)]"
    >
      <div className="grid grid-cols-4 max-w-lg mx-auto h-14">
        {navItems.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/" || location.pathname === ""
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                isActive
                  ? "text-yellow-400 font-bold"
                  : "text-emerald-300/70 hover:text-white"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-yellow-400 rounded-full shadow-xs" />
              )}
              {item.icon()}
              <span className="text-[11px] leading-tight tracking-tight">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
