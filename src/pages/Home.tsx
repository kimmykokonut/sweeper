import { useState } from "react";
import { Link } from "react-router";
import type { GameState } from "../types";
import { loadGameState } from "../utils/scorecardHelpers";
import setteBello from "../assets/7-denari.jpg";
import assoDenari from "../assets/1-denari.jpg";
import coinIcon from "../assets/denare.png";
import logo from "../assets/logo-192x192.png";

function Home() {
  const [activeGame] = useState<GameState | null>(() => loadGameState());

  return (
    <div className="w-full flex-1 flex flex-col justify-between items-center px-4 py-3 sm:py-5 overflow-y-auto">
      {/* Top Brand & Developer Link Row */}
      <div className="w-full max-w-sm sm:max-w-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Sweeper logo" className="size-7 sm:size-8 object-contain drop-shadow-xs" />
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">Sweeper</span>
        </div>
        <div className="flex items-center gap-1">
          <a
            href="https://github.com/kimmykokonut/sweeper"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            title="GitHub Repository"
            className="p-1.5 rounded-lg text-emerald-200/80 hover:text-yellow-300 hover:bg-emerald-950/60 transition-colors"
          >
            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
          <a
            href="https://kimmykokonut.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Developer portfolio"
            title="Developer Portfolio"
            className="p-1.5 rounded-lg text-emerald-200/80 hover:text-yellow-300 hover:bg-emerald-950/60 transition-colors"
          >
            <svg
              className="size-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </a>
        </div>
      </div>

      {/* Main Content Area (Vertically Balanced) */}
      <div className="w-full max-w-sm sm:max-w-md my-auto flex flex-col items-center py-2">
        {/* Header / Branding */}
        <div className="flex flex-col items-center text-center space-y-1 mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Benvenuti!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 max-w-xs sm:max-w-sm">
            Your Scopa companion for keeping score and calculating Primiera hands.
          </p>
        </div>

        {/* Active Game Quick-Resume Banner */}
        {activeGame && !activeGame.isFinished && (
          <Link
            to="/score"
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-950/90 border border-emerald-700/80 text-emerald-100 hover:bg-emerald-900/90 hover:border-yellow-400/70 transition-all text-xs font-semibold shadow-md hover:scale-[1.01] active:scale-99 mb-4 sm:mb-5"
          >
            <div className="flex items-center gap-2">
              <img src={coinIcon} alt="" className="size-4 object-contain" />
              <span>
                Game in Progress: Round {activeGame.rounds.length + 1}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-yellow-400 font-bold">
              Resume
              <span>→</span>
            </span>
          </Link>
        )}

        {/* Main Playing Cards (Equal 50/50 Grid with Dark Green Pill Buttons) */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-5 w-full">
          {/* Card 1: Scorecard */}
          <Link
            to={activeGame && !activeGame.isFinished ? "/score?new=true" : "/score"}
            className="group flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-1 active:scale-98"
          >
            <img
              src={assoDenari}
              alt="Ace of coins - Scorecard"
              className="w-full aspect-[250/413] object-contain rounded-xl shadow-xl shadow-black/40 ring-1 ring-black/15 group-hover:ring-2 group-hover:ring-yellow-400/80 group-hover:shadow-2xl transition-all duration-200 group-hover:scale-102"
            />
            <div className="mt-2.5 w-full rounded-xl bg-emerald-950/90 border border-emerald-800/80 p-2 sm:p-2.5 text-center group-hover:bg-emerald-900 group-hover:border-yellow-400 group-hover:ring-1 group-hover:ring-yellow-400/30 transition-all shadow-md">
              <h2 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                Scorecard
              </h2>
              <span className="mt-0.5 flex items-center justify-center gap-1 text-[10px] sm:text-xs font-bold text-yellow-300">
                <span>
                  {activeGame && !activeGame.isFinished
                    ? "New Game"
                    : "Start Game"}
                </span>
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </div>
          </Link>

          {/* Card 2: Primiera */}
          <Link
            to="/primiera"
            className="group flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-1 active:scale-98"
          >
            <img
              src={setteBello}
              alt="Settebello Card"
              className="w-full aspect-[250/413] object-contain rounded-xl shadow-xl shadow-black/40 ring-1 ring-black/15 group-hover:ring-2 group-hover:ring-yellow-400/80 group-hover:shadow-2xl transition-all duration-200 group-hover:scale-102"
            />
            <div className="mt-2.5 w-full rounded-xl bg-emerald-950/90 border border-emerald-800/80 p-2 sm:p-2.5 text-center group-hover:bg-emerald-900 group-hover:border-yellow-400 group-hover:ring-1 group-hover:ring-yellow-400/30 transition-all shadow-md">
              <h2 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                Primiera
              </h2>
              <span className="mt-0.5 flex items-center justify-center gap-1 text-[10px] sm:text-xs font-bold text-yellow-300">
                <span>Calculate Hand</span>
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
