import { useState } from "react";
import { Link } from "react-router";
import type { FinishedGame } from "../types";
import {
  clearGameHistory,
  deleteGameFromHistory,
  formatGameDate,
  formatGameTime,
  loadGameHistory,
} from "../utils/scorecardHelpers";
import aceCoins from "../assets/1-denari.jpg";

export default function GameHistory() {
  const [history, setHistory] = useState<FinishedGame[]>(() =>
    loadGameHistory(),
  );
  const [expandedGames, setExpandedGames] = useState<Record<string, boolean>>(
    {},
  );
  const [deletingGameId, setDeletingGameId] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState<boolean>(false);

  const toggleExpand = (gameId: string) => {
    setExpandedGames((prev) => ({
      ...prev,
      [gameId]: !prev[gameId],
    }));
  };

  const handleDelete = (gameId: string) => {
    deleteGameFromHistory(gameId);
    setHistory((prev) => prev.filter((g) => g.id !== gameId));
    setDeletingGameId(null);
  };

  const handleClearAll = () => {
    clearGameHistory();
    setHistory([]);
    setShowClearModal(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex-1 flex flex-col px-3 sm:px-4 py-3 sm:py-5 text-white min-h-0 overflow-y-auto">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Match History</span>
            {history.length > 0 && (
              <span className="text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-full bg-emerald-800 border border-emerald-600 text-yellow-300">
                {history.length} {history.length === 1 ? "game" : "games"}
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-0.5">
            Archived games played on this device
          </p>
        </div>
      </div>

      {/* 2. Empty State */}
      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
          {/* Authentic Scopa Card Graphic with rounded corners and card shadow */}
          <div className="mb-5 sm:mb-6 transition-transform duration-300 hover:scale-105">
            <img
              src={aceCoins}
              alt="Ace of Coins"
              className="w-24 sm:w-28 aspect-[250/413] object-contain rounded-xl shadow-2xl shadow-black/70 ring-1 ring-white/15"
            />
          </div>

          <div className="space-y-1.5 max-w-xs mb-6">
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              No Completed Games Yet
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed">
              When a match finishes on the Scorecard, it will be automatically
              archived here so you can review player stats and records.
            </p>
          </div>

          <Link
            to="/score"
            className="rounded-xl bg-yellow-400 px-6 py-2.5 font-bold text-emerald-950 text-sm shadow-lg hover:bg-yellow-300 hover:scale-102 active:scale-98 transition-all cursor-pointer"
          >
            Go to Scorecard
          </Link>
        </div>
      ) : (
        /* 3. Match List */
        <div className="space-y-3 sm:space-y-4 pb-2">
          {history.map((game) => {
            const isExpanded = Boolean(expandedGames[game.id]);
            const isConfirmingDelete = deletingGameId === game.id;

            return (
              <div
                key={game.id}
                className="rounded-2xl bg-emerald-900/90 border border-emerald-700/90 p-3.5 sm:p-4 shadow-xl space-y-3 transition-all"
              >
                {/* Match Header Row: Date/Time + Rounds */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-emerald-200">
                    <span className="font-semibold text-emerald-100">
                      {formatGameDate(game.completedAt)}
                    </span>
                    <span className="text-emerald-500">•</span>
                    <span>{formatGameTime(game.completedAt)}</span>
                    <span className="text-emerald-500">•</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-medium">
                      {game.rounds.length}{" "}
                      {game.rounds.length === 1 ? "round" : "rounds"}
                    </span>
                    {game.settings.isTeams && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-yellow-400/20 border border-yellow-400/60 text-yellow-300 font-medium">
                        Teams
                      </span>
                    )}
                  </div>

                  {/* Delete Button / Inline Confirmation */}
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-1 bg-emerald-950/90 border border-red-700/80 rounded-lg p-1 animate-fade-in shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDelete(game.id)}
                        className="px-2 py-0.5 rounded bg-red-600 text-white text-[11px] font-bold hover:bg-red-500 cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingGameId(null)}
                        className="px-2 py-0.5 rounded bg-emerald-800 text-emerald-200 text-[11px] hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeletingGameId(game.id)}
                      aria-label="Delete match"
                      title="Delete match"
                      className="text-emerald-400/60 hover:text-red-400 hover:bg-emerald-950/60 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-4"
                        aria-hidden="true"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Main Player Summary Cards (Name, Points, Scopa) */}
                <div
                  className={`grid gap-2.5 sm:gap-3 w-full ${
                    game.players.length === 2
                      ? "grid-cols-2"
                      : game.players.length === 3
                        ? "grid-cols-3"
                        : "grid-cols-2 sm:grid-cols-4"
                  }`}
                >
                  {game.players.map((player) => {
                    const isWinner = player.id === game.winnerId;
                    const score = game.finalScores[player.id] ?? 0;
                    const scopeCount = game.totalScope[player.id] ?? 0;

                    return (
                      <div
                        key={player.id}
                        className={`rounded-xl p-3 text-center flex flex-col justify-between transition-all ${
                          isWinner
                            ? "bg-yellow-400/10 border-2 border-yellow-400/90 shadow-md ring-1 ring-yellow-400/30"
                            : "bg-emerald-950/70 border border-emerald-800/80"
                        }`}
                      >
                        {/* Player Name & Trophy on Winner */}
                        <div className="flex items-center justify-center gap-1 min-w-0">
                          {isWinner && (
                            <span
                              className="text-base shrink-0"
                              title="Match Winner"
                            >
                              🏆
                            </span>
                          )}
                          <span
                            className={`text-xs sm:text-sm font-extrabold truncate ${
                              isWinner ? "text-yellow-300" : "text-emerald-100"
                            }`}
                          >
                            {player.name}
                          </span>
                        </div>

                        {/* Points */}
                        <div className="my-1.5">
                          <span
                            className={`text-2xl sm:text-3xl font-black leading-none ${
                              isWinner ? "text-yellow-400" : "text-white"
                            }`}
                          >
                            {score}
                          </span>
                          <span className="text-xs text-emerald-300 font-semibold ml-1">
                            pts
                          </span>
                        </div>

                        {/* Scopa Display */}
                        <div className="py-1 px-2 rounded-lg bg-emerald-900/80 border border-emerald-700/60 flex items-center justify-center gap-1.5">
                          <span className="text-base sm:text-lg shrink-0">
                            🧹
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-yellow-300 leading-tight">
                            {scopeCount} {scopeCount === 1 ? "Scopa" : "Scope"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Expandable Category Stats Toggle */}
                <div className="pt-1 border-t border-emerald-800/60">
                  <button
                    type="button"
                    onClick={() => toggleExpand(game.id)}
                    className="w-full flex items-center justify-between py-1 px-1 text-xs font-semibold text-emerald-300 hover:text-yellow-300 transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? "Hide Stats" : "View Stats"}</span>
                    <span className="text-[11px] text-emerald-400">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </button>

                  {/* Category Stats Table */}
                  {isExpanded && (
                    <div className="mt-2.5 pt-2 border-t border-emerald-800/40 animate-fade-in">
                      <div className="rounded-xl bg-emerald-950/80 border border-emerald-800/70 overflow-hidden text-xs">
                        {/* Table Header */}
                        <div
                          className="grid bg-emerald-950/95 border-b border-emerald-800/60 px-3 py-1.5 font-bold text-[11px] text-emerald-300"
                          style={{
                            gridTemplateColumns: `1.5fr repeat(${game.players.length}, 1fr)`,
                          }}
                        >
                          <span>Category</span>
                          {game.players.map((p) => (
                            <span key={p.id} className="text-center truncate">
                              {p.name}
                            </span>
                          ))}
                        </div>

                        {/* Category Rows */}
                        <div className="divide-y divide-emerald-900/60 px-3 py-1 text-[11px]">
                          {[
                            { label: "Most Cards", key: "carte" as const },
                            { label: "Most Coins", key: "denari" as const },
                            { label: "7 of Coins", key: "settebello" as const },
                            { label: "Primiera", key: "primiera" as const },
                          ].map(({ label, key }) => {
                            const winsMap = game.players.reduce<
                              Record<string, number>
                            >((acc, p) => {
                              acc[p.id] =
                                key === "carte"
                                  ? game.rounds.filter(
                                      (r) => r.carteWinnerId === p.id,
                                    ).length
                                  : key === "denari"
                                    ? game.rounds.filter(
                                        (r) => r.denariWinnerId === p.id,
                                      ).length
                                    : key === "settebello"
                                      ? game.rounds.filter(
                                          (r) => r.settebelloWinnerId === p.id,
                                        ).length
                                      : game.rounds.filter(
                                          (r) => r.primieraWinnerId === p.id,
                                        ).length;
                              return acc;
                            }, {});

                            const allWins = Object.values(winsMap);
                            const maxWins = Math.max(...allWins);
                            const isUniqueMax =
                              maxWins > 0 &&
                              allWins.filter((w) => w === maxWins).length === 1;

                            return (
                              <div
                                key={key}
                                className="grid py-1.5 items-center"
                                style={{
                                  gridTemplateColumns: `1.5fr repeat(${game.players.length}, 1fr)`,
                                }}
                              >
                                <span className="text-emerald-200/90 font-medium">
                                  {label}
                                </span>
                                {game.players.map((p) => {
                                  const wins = winsMap[p.id] ?? 0;
                                  const isHigher =
                                    isUniqueMax && wins === maxWins;

                                  return (
                                    <span
                                      key={p.id}
                                      className={`text-center transition-colors ${
                                        isHigher
                                          ? "text-yellow-300 font-black text-xs"
                                          : wins > 0
                                            ? "text-white font-semibold"
                                            : "text-emerald-500/60 font-normal"
                                      }`}
                                    >
                                      {wins}
                                    </span>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* 4. Clear All History Button */}
          <div className="mt-8 mb-4 flex justify-center">
            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="px-4 py-2 rounded-xl bg-red-900/80 hover:bg-red-800 text-red-100 border border-red-700/60 font-semibold text-xs transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-98"
            >
              Clear All History
            </button>
          </div>
        </div>
      )}

      {/* 5. Clear All Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-emerald-950 border border-emerald-700 p-5 shadow-2xl space-y-4 text-center">
            <div className="size-12 rounded-full bg-red-900/40 border border-red-600/70 text-red-400 flex items-center justify-center text-xl mx-auto">
              ⚠️
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white">
                Clear All Match History?
              </h3>
              <p className="text-xs text-emerald-200/90">
                This will permanently delete all {history.length} saved{" "}
                {history.length === 1 ? "match" : "matches"} from this device.
                This cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="w-full rounded-xl bg-emerald-800/80 border border-emerald-600 py-2.5 text-xs font-bold text-emerald-100 hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="w-full rounded-xl bg-red-700 py-2.5 text-xs font-bold text-white hover:bg-red-600 shadow-md transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
