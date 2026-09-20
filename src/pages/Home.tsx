import { useState } from "react";
import { Link } from "react-router";
import type { GameState } from "../types";
import { loadGameState } from "../utils/scorecardHelpers";
import setteBello from "../assets/7-denari.jpg";
import assoDenari from "../assets/1-denari.jpg";
import coinIcon from "../assets/denare.png";

function Home() {
  const [activeGame] = useState<GameState | null>(() => loadGameState());

  return (
    <div className="min-h-[calc(100svh-4rem)] w-full flex flex-col justify-between items-center px-4 py-4 sm:py-6 text-white bg-emerald-900 overflow-y-auto">
      {/* Main Content Area (Vertically Balanced) */}
      <div className="w-full max-w-sm sm:max-w-md my-auto flex flex-col items-center py-2">
        {/* Header / Branding */}
        <div className="flex flex-col items-center text-center space-y-1 mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Benvenuti!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 max-w-xs sm:max-w-sm">
            Your Scopa companion for keeping score and calculating Primiera
            hands.
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
              Resume Scorecard
              <span>→</span>
            </span>
          </Link>
        )}

        {/* Main Playing Cards (Equal 50/50 Grid with Dark Green Pill Buttons) */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-5 w-full">
          {/* Card 1: Scopa Scorecard */}
          <Link
            to="/score"
            className="group flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-1 active:scale-98"
          >
            <img
              src={assoDenari}
              alt="Ace of coins - Scopa Scorecard"
              className="w-full aspect-[250/413] object-contain rounded-xl shadow-xl shadow-black/40 ring-1 ring-black/15 group-hover:ring-2 group-hover:ring-yellow-400/80 group-hover:shadow-2xl transition-all duration-200 group-hover:scale-102"
            />
            <div className="mt-2.5 w-full rounded-xl bg-emerald-950/90 border border-emerald-800/80 p-2 sm:p-2.5 text-center group-hover:bg-emerald-900 group-hover:border-yellow-400 group-hover:ring-1 group-hover:ring-yellow-400/30 transition-all shadow-md">
              <h2 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                Scopa Scorecard
              </h2>
              <span className="mt-0.5 flex items-center justify-center gap-1 text-[10px] sm:text-xs font-bold text-yellow-300">
                <span>
                  {activeGame && !activeGame.isFinished
                    ? "Resume Scorecard"
                    : "Keep Score"}
                </span>
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </div>
          </Link>

          {/* Card 2: Primiera Calculator */}
          <Link
            to="/primiera"
            className="group flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-1 active:scale-98"
          >
            <img
              src={setteBello}
              alt="Settebello - Primiera Calculator"
              className="w-full aspect-[250/413] object-contain rounded-xl shadow-xl shadow-black/40 ring-1 ring-black/15 group-hover:ring-2 group-hover:ring-yellow-400/80 group-hover:shadow-2xl transition-all duration-200 group-hover:scale-102"
            />
            <div className="mt-2.5 w-full rounded-xl bg-emerald-950/90 border border-emerald-800/80 p-2 sm:p-2.5 text-center group-hover:bg-emerald-900 group-hover:border-yellow-400 group-hover:ring-1 group-hover:ring-yellow-400/30 transition-all shadow-md">
              <h2 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                Primiera Calculator
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

      {/* Footer */}
      <div className="w-full max-w-sm sm:max-w-md pt-3 pb-1 border-t border-emerald-800/60 flex items-center justify-between text-xs text-emerald-300/80 shrink-0">
        <a
          href="https://github.com/kimmykokonut/sweeper"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-yellow-300 transition-colors font-medium"
        >
          GitHub
        </a>
        <a
          href="https://kimmykokonut.github.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-yellow-300 transition-colors font-medium"
        >
          Portfolio
        </a>
      </div>
    </div>
  );
}

export default Home;
