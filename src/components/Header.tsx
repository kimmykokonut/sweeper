import { Link } from "react-router";
import logo from "../assets/logo-192x192.png";

const Header = () => {
  return (
    <header className="sticky top-0 z-30 h-12 w-full bg-emerald-950/90 border-b border-emerald-800/60 backdrop-blur-md text-white px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <Link
        to="/"
        className="flex items-center gap-2 rounded-lg px-1.5 py-1 min-h-[44px] hover:opacity-90 focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none transition-all"
      >
        <img
          src={logo}
          alt="Sweeper logo"
          className="size-6 object-contain drop-shadow-xs"
        />
        <span className="font-extrabold text-base tracking-tight text-white">
          Sweeper
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-200/90 bg-emerald-900/70 border border-emerald-700/70 px-2.5 py-0.5 rounded-full shadow-xs">
          Scopa Companion
        </span>
      </div>
    </header>
  );
};

export default Header;
