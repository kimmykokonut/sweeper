import { useState } from "react";
import { Link, useRouteError, isRouteErrorResponse } from "react-router";
import type { GameState } from "../types";
import { loadGameState } from "../utils/scorecardHelpers";
import eightSpades from "../assets/8-spade.jpg";

export default function ErrorPage() {
  const error = useRouteError();
  const [activeGame] = useState<GameState | null>(() => loadGameState());

  let title = "Mamma Mia!";
  let subtitle = "An unexpected error occurred while loading this page.";
  let technicalDetail: string | null = null;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "Page Not Found";
      subtitle =
        "Looks like this hand got swept away! The page you followed doesn't exist on this table.";
    } else {
      title = `Error ${error.status}`;
      subtitle = error.statusText || subtitle;
    }
    if (error.data) {
      technicalDetail =
        typeof error.data === "string"
          ? error.data
          : JSON.stringify(error.data);
    }
  } else if (error instanceof Error) {
    technicalDetail = error.message;
  } else if (!error) {
    // Rendered directly as a 404 fallback route
    title = "Page Not Found";
    subtitle =
      "Looks like this hand got swept away! The page you followed doesn't exist on this table.";
  }

  const hasActiveGame = activeGame && !activeGame.isFinished;

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-center text-white my-auto min-h-[100svh]">
      {/* Visual Graphic */}
      <div className="mb-5 sm:mb-6 transition-transform duration-300 hover:scale-105">
        <img
          src={eightSpades}
          alt=""
          aria-hidden="true"
          className="w-20 sm:w-24 aspect-[250/413] object-contain rounded-xl shadow-2xl shadow-black/60 ring-1 ring-white/15 opacity-90"
        />
      </div>

      {/* Headline & Description */}
      <div className="space-y-2 max-w-sm sm:max-w-md mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-emerald-200/90 leading-relaxed">
          {subtitle}
        </p>
        <p className="text-xs sm:text-sm text-emerald-400/80">
          Don&apos;t worry, any active game progress in your browser is safe.
        </p>
      </div>

      {/* Action Buttons: Go Home or Score New Game */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-md">
        <Link
          to="/"
          className="w-full sm:flex-1 min-h-[44px] px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-bold text-base shadow-md hover:scale-102 active:scale-98 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none transition-all cursor-pointer flex items-center justify-center text-center"
        >
          Return to Home
        </Link>

        <Link
          to="/score?new=true"
          className="w-full sm:flex-1 min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-600 font-bold text-base shadow-md hover:scale-102 active:scale-98 focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none transition-all cursor-pointer flex items-center justify-center text-center"
        >
          Score New Game
        </Link>
      </div>

      {/* Optional In-Progress Game Quick-Resume Link */}
      {hasActiveGame && (
        <div className="mt-4 sm:mt-5">
          <Link
            to="/score"
            className="inline-flex items-center gap-2.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-700/80 hover:border-yellow-400/70 text-emerald-100 hover:text-white transition-all shadow-sm group focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none cursor-pointer"
          >
            <div className="flex items-center justify-center size-7 rounded-full bg-amber-50/95 border border-yellow-400 shadow-xs shrink-0">
              <span className="text-sm leading-none" aria-hidden="true">
                ⚔️
              </span>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-emerald-200 group-hover:text-emerald-100">
              Resume Game in Progress{" "}
              <span className="text-yellow-300 font-bold">
                (Round {activeGame.rounds.length + 1})
              </span>
            </span>
            <span
              className="text-yellow-400 font-bold text-sm ml-0.5 group-hover:translate-x-0.5 transition-transform"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </div>
      )}

      {/* Collapsible Technical Details (for development or unexpected exceptions) */}
      {technicalDetail && (
        <details className="mt-6 text-left w-full max-w-xs sm:max-w-md rounded-xl bg-emerald-950/70 border border-emerald-800/60 p-3 text-xs text-emerald-300">
          <summary className="font-semibold cursor-pointer text-emerald-200 hover:text-white select-none">
            Error Details
          </summary>
          <p className="mt-2 font-mono break-all text-[11px] text-emerald-400/90 whitespace-pre-wrap">
            {technicalDetail}
          </p>
        </details>
      )}
    </div>
  );
}
