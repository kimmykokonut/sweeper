import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router";
import type { FinishedGame } from "../types";
import {
  clearGameHistory,
  deleteGameFromHistory,
  exportGameHistoryJson,
  formatGameDate,
  formatGameTime,
  groupHistoryByMatchup,
  loadGameHistory,
  mergeGameHistories,
  parseAndValidateHistoryBackup,
  saveGameHistory,
} from "../utils/scorecardHelpers";
import aceCoins from "../assets/1-denari.jpg";
import swordIcon from "../assets/spada.png";

export default function GameHistory() {
  const [history, setHistory] = useState<FinishedGame[]>(() =>
    loadGameHistory(),
  );
  const [activeView, setActiveView] = useState<"head-to-head" | "all">(
    "head-to-head",
  );
  const [expandedGames, setExpandedGames] = useState<Record<string, boolean>>(
    {},
  );
  const [expandedMatchups, setExpandedMatchups] = useState<
    Record<string, boolean>
  >({});
  const [deletingGameId, setDeletingGameId] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    text: string;
    type?: "success" | "error";
  } | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [pendingImportGames, setPendingImportGames] = useState<
    FinishedGame[] | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Close modals on Escape key press
  useEffect(() => {
    if (!showClearModal && !showSettingsModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowClearModal(false);
        setShowSettingsModal(false);
        setPendingImportGames(null);
        setModalError(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showClearModal, showSettingsModal]);

  const matchups = useMemo(() => groupHistoryByMatchup(history), [history]);

  const toggleExpandGame = (gameId: string) => {
    setExpandedGames((prev) => ({
      ...prev,
      [gameId]: !prev[gameId],
    }));
  };

  const toggleExpandMatchup = (key: string) => {
    setExpandedMatchups((prev) => ({
      ...prev,
      [key]: !prev[key],
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

  const handleExport = () => {
    if (history.length === 0) return;
    try {
      const jsonStr = exportGameHistoryJson(history);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10);
      const filename = `sweeper-history-${datePart}.json`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowSettingsModal(false);
      showToast(
        `Exported ${history.length} ${history.length === 1 ? "game" : "games"}!`,
        "success",
      );
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setModalError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== "string") {
        setModalError("Could not read file content.");
        return;
      }

      const result = parseAndValidateHistoryBackup(content);
      if (!result.isValid) {
        setModalError(result.error || "Invalid Sweeper backup file.");
        return;
      }

      if (result.games.length === 0) {
        setModalError("The backup file contains no completed games.");
        return;
      }

      // If current history is empty, import directly without prompt
      if (history.length === 0) {
        setShowSettingsModal(false);
        saveGameHistory(result.games);
        setHistory(result.games);
        showToast(
          `Successfully imported ${result.games.length} ${
            result.games.length === 1 ? "game" : "games"
          }!`,
          "success",
        );
      } else {
        // Prompt for Merge vs Replace
        setPendingImportGames(result.games);
      }
    };

    reader.onerror = () => {
      setModalError("Error reading the selected file.");
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  const handleConfirmMerge = () => {
    if (!pendingImportGames) return;
    const { merged, addedCount, duplicateCount } = mergeGameHistories(
      history,
      pendingImportGames,
    );
    saveGameHistory(merged);
    setHistory(merged);
    setPendingImportGames(null);
    setShowSettingsModal(false);
    if (addedCount === 0 && duplicateCount > 0) {
      showToast(
        `All ${duplicateCount} games already exist in your history.`,
        "success",
      );
    } else {
      showToast(
        `Added ${addedCount} new ${addedCount === 1 ? "game" : "games"}${
          duplicateCount > 0
            ? ` (${duplicateCount} duplicate${
                duplicateCount === 1 ? "" : "s"
              } skipped)`
            : ""
        }!`,
        "success",
      );
    }
  };

  const handleConfirmReplace = () => {
    if (!pendingImportGames) return;
    saveGameHistory(pendingImportGames);
    setHistory(pendingImportGames);
    setShowSettingsModal(false);
    showToast(
      `Replaced history with ${pendingImportGames.length} ${
        pendingImportGames.length === 1 ? "game" : "games"
      } from backup!`,
      "success",
    );
    setPendingImportGames(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex-1 flex flex-col px-3 sm:px-4 py-3 sm:py-5 text-white min-h-0 overflow-y-auto">
      {/* 1. Header Bar */}
      <div className="flex items-start justify-between mb-3 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Game History
          </h1>
          <p className="text-sm sm:text-base text-emerald-200 mt-0.5">
            Archived games played on this device
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setModalError(null);
            setPendingImportGames(null);
            setShowSettingsModal(true);
          }}
          aria-label="History Settings & Backup"
          title="Backup & Restore History"
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-yellow-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 shrink-0"
        >
          <svg
            className="size-5 sm:size-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      {/* 1.1 Status Toast Banner on Main Page */}
      {toast && (
        <div
          role="status"
          className={`mb-3 p-2 rounded-xl border text-sm sm:text-md flex items-center justify-between gap-2 shadow-lg animate-fade-in shrink-0 ${
            toast.type === "error"
              ? "bg-red-900/90 border-red-600/80 text-red-200"
              : "bg-emerald-900/90 border-emerald-500/80 text-emerald-100"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {toast.type === "error" ? (
              <span className="text-base shrink-0" aria-hidden="true">
                ⚠️
              </span>
            ) : (
              <div className="flex items-center justify-center size-7 rounded-full bg-amber-50/95 border border-yellow-400 shadow-xs shrink-0 p-0.5">
                <img
                  src={swordIcon}
                  alt=""
                  aria-hidden="true"
                  className="size-full object-contain"
                />
              </div>
            )}
            <span className="font-medium truncate sm:whitespace-normal">
              {toast.text}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="text-emerald-300 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Empty State */}
      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
          {/* Authentic Scopa Card Graphic with rounded corners and card shadow */}
          <div className="mb-5 sm:mb-6 transition-transform duration-300 hover:scale-105">
            <img
              src={aceCoins}
              alt=""
              aria-hidden="true"
              className="w-24 sm:w-28 aspect-[250/413] object-contain rounded-xl shadow-2xl shadow-black/70 ring-1 ring-white/15"
            />
          </div>

          <div className="space-y-1.5 max-w-xs mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              No Completed Games Yet
            </h2>
            <p className="text-sm sm:text-base text-emerald-200 leading-relaxed">
              When a game finishes on the Scorecard, it will be automatically
              archived here so you can review player stats and records.
            </p>
          </div>

          <Link
            to="/score"
            className="min-h-[44px] min-w-[200px] rounded-xl bg-yellow-400 px-6 py-2.5 font-bold text-emerald-950 text-base shadow-lg hover:bg-yellow-300 hover:scale-102 active:scale-98 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none transition-all cursor-pointer flex items-center justify-center"
          >
            Go to Scorecard
          </Link>
        </div>
      ) : (
        <>
          {/* 3. View Switcher Toggle: Head-to-Head vs All Games */}
          <div
            role="tablist"
            aria-label="Game history views"
            className="flex rounded-xl bg-emerald-950/80 p-1 border border-emerald-800/80 mb-3.5 shrink-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeView === "head-to-head"}
              aria-controls="head-to-head-panel"
              onClick={() => setActiveView("head-to-head")}
              className={`flex-1 min-h-[44px] py-2 px-3 rounded-lg text-sm sm:text-base font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none ${
                activeView === "head-to-head"
                  ? "bg-yellow-400 text-emerald-950 shadow-sm"
                  : "text-emerald-200 hover:text-white hover:bg-emerald-900/60"
              }`}
            >
              Head-to-Head ({matchups.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === "all"}
              aria-controls="all-games-panel"
              onClick={() => setActiveView("all")}
              className={`flex-1 min-h-[44px] py-2 px-3 rounded-lg text-sm sm:text-base font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none ${
                activeView === "all"
                  ? "bg-yellow-400 text-emerald-950 shadow-sm"
                  : "text-emerald-200 hover:text-white hover:bg-emerald-900/60"
              }`}
            >
              All Games ({history.length})
            </button>
          </div>

          {/* 4. Head-to-Head View */}
          {activeView === "head-to-head" && (
            <div
              id="head-to-head-panel"
              role="tabpanel"
              aria-label="Head-to-Head"
              className="space-y-3 sm:space-y-4 pb-2 animate-fade-in"
            >
              {matchups.map((matchup) => {
                const isExpanded = Boolean(expandedMatchups[matchup.key]);
                const p1Name = matchup.playerNames[0];
                const p2Name = matchup.playerNames[1];
                const p1Wins = matchup.wins[p1Name] || 0;
                const p2Wins = matchup.wins[p2Name] || 0;

                const isTied = p1Wins === p2Wins;
                const leaderName = !isTied ? p1Name : null;

                return (
                  <div
                    key={matchup.key}
                    className="rounded-2xl bg-emerald-900/90 border border-emerald-700/90 p-3.5 sm:p-4 shadow-xl space-y-3 transition-all"
                  >
                    {/* Head-to-Head Player Scoreboard with central VS badge (no redundant title row) */}
                    {matchup.playerNames.length === 2 ? (
                      <div className="flex items-center gap-2 sm:gap-3 w-full">
                        {/* Player 1 Card */}
                        {(() => {
                          const name = matchup.playerNames[0];
                          const wins = matchup.wins[name] || 0;
                          const isLeader = !isTied && name === leaderName;
                          const scopeCount = matchup.totalScope[name] || 0;
                          return (
                            <div
                              className={`flex-1 min-w-0 rounded-xl p-3 text-center flex flex-col justify-between transition-all ${
                                isLeader
                                  ? "bg-yellow-400/10 border-2 border-yellow-400/90 shadow-md ring-1 ring-yellow-400/30"
                                  : "bg-emerald-950/70 border border-emerald-800/80"
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1.5 min-w-0">
                                {isLeader && (
                                  <span
                                    className="text-sm shrink-0"
                                    aria-hidden="true"
                                    title="Series Leader"
                                  >
                                    🏆
                                  </span>
                                )}
                                <span
                                  className={`text-sm sm:text-base font-bold truncate ${
                                    isLeader
                                      ? "text-yellow-300"
                                      : "text-emerald-100"
                                  }`}
                                >
                                  {name}
                                </span>
                              </div>
                              <div className="my-2">
                                <span
                                  className={`text-3xl sm:text-4xl font-extrabold leading-none ${
                                    isLeader ? "text-yellow-400" : "text-white"
                                  }`}
                                >
                                  {wins}
                                </span>
                              </div>
                              <div
                                aria-label={`${scopeCount} ${scopeCount === 1 ? "scopa" : "scope"} captured`}
                                className="py-1 px-2.5 rounded-lg bg-emerald-900/80 border border-emerald-700/60 flex items-center justify-center gap-1.5"
                              >
                                <span
                                  className="text-lg sm:text-xl shrink-0"
                                  aria-hidden="true"
                                >
                                  🧹
                                </span>
                                <span className="text-sm sm:text-base font-bold text-yellow-300 leading-none">
                                  {scopeCount}
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Central VS Badge */}
                        <div className="flex flex-col items-center justify-center shrink-0">
                          <span
                            aria-hidden="true"
                            className="size-8 sm:size-9 rounded-full bg-emerald-950 border border-emerald-700/80 text-xs font-bold text-yellow-300 flex items-center justify-center shadow-md"
                          >
                            VS
                          </span>
                        </div>

                        {/* Player 2 Card */}
                        {(() => {
                          const name = matchup.playerNames[1];
                          const wins = matchup.wins[name] || 0;
                          const isLeader = !isTied && name === leaderName;
                          const scopeCount = matchup.totalScope[name] || 0;
                          return (
                            <div
                              className={`flex-1 min-w-0 rounded-xl p-3 text-center flex flex-col justify-between transition-all ${
                                isLeader
                                  ? "bg-yellow-400/10 border-2 border-yellow-400/90 shadow-md ring-1 ring-yellow-400/30"
                                  : "bg-emerald-950/70 border border-emerald-800/80"
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1.5 min-w-0">
                                {isLeader && (
                                  <span
                                    className="text-sm shrink-0"
                                    aria-hidden="true"
                                    title="Series Leader"
                                  >
                                    🏆
                                  </span>
                                )}
                                <span
                                  className={`text-sm sm:text-base font-bold truncate ${
                                    isLeader
                                      ? "text-yellow-300"
                                      : "text-emerald-100"
                                  }`}
                                >
                                  {name}
                                </span>
                              </div>
                              <div className="my-2">
                                <span
                                  className={`text-3xl sm:text-4xl font-extrabold leading-none ${
                                    isLeader ? "text-yellow-400" : "text-white"
                                  }`}
                                >
                                  {wins}
                                </span>
                              </div>
                              <div
                                aria-label={`${scopeCount} ${scopeCount === 1 ? "scopa" : "scope"} captured`}
                                className="py-1 px-2.5 rounded-lg bg-emerald-900/80 border border-emerald-700/60 flex items-center justify-center gap-1.5"
                              >
                                <span
                                  className="text-lg sm:text-xl shrink-0"
                                  aria-hidden="true"
                                >
                                  🧹
                                </span>
                                <span className="text-sm sm:text-base font-bold text-yellow-300 leading-none">
                                  {scopeCount}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div
                        className={`grid gap-2.5 sm:gap-3 w-full ${
                          matchup.playerNames.length === 3
                            ? "grid-cols-3"
                            : "grid-cols-2 sm:grid-cols-4"
                        }`}
                      >
                        {matchup.playerNames.map((name) => {
                          const wins = matchup.wins[name] || 0;
                          const isLeader = !isTied && name === leaderName;
                          const scopeCount = matchup.totalScope[name] || 0;

                          return (
                            <div
                              key={name}
                              className={`rounded-xl p-3 text-center flex flex-col justify-between transition-all ${
                                isLeader
                                  ? "bg-yellow-400/10 border-2 border-yellow-400/90 shadow-md ring-1 ring-yellow-400/30"
                                  : "bg-emerald-950/70 border border-emerald-800/80"
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1.5 min-w-0">
                                {isLeader && (
                                  <span
                                    className="text-sm shrink-0"
                                    aria-hidden="true"
                                    title="Series Leader"
                                  >
                                    🏆
                                  </span>
                                )}
                                <span
                                  className={`text-sm sm:text-base font-bold truncate ${
                                    isLeader
                                      ? "text-yellow-300"
                                      : "text-emerald-100"
                                  }`}
                                >
                                  {name}
                                </span>
                              </div>
                              <div className="my-2">
                                <span
                                  className={`text-3xl sm:text-4xl font-extrabold leading-none ${
                                    isLeader ? "text-yellow-400" : "text-white"
                                  }`}
                                >
                                  {wins}
                                </span>
                              </div>
                              <div
                                aria-label={`${scopeCount} ${scopeCount === 1 ? "scopa" : "scope"} captured`}
                                className="py-1 px-2.5 rounded-lg bg-emerald-900/80 border border-emerald-700/60 flex items-center justify-center gap-1.5"
                              >
                                <span
                                  className="text-lg sm:text-xl shrink-0"
                                  aria-hidden="true"
                                >
                                  🧹
                                </span>
                                <span className="text-sm sm:text-base font-bold text-yellow-300 leading-none">
                                  {scopeCount}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Expandable Matchup Stats & Games */}
                    <div className="pt-1 border-t border-emerald-800/60">
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => toggleExpandMatchup(matchup.key)}
                        className="w-full min-h-[44px] flex items-center justify-between py-2 px-1 text-xs sm:text-sm font-semibold text-emerald-300 hover:text-yellow-300 transition-colors cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                      >
                        <span>
                          {isExpanded
                            ? "Hide Breakdown"
                            : `View Breakdown (${matchup.totalGames} ${matchup.totalGames === 1 ? "game" : "games"})`}
                        </span>
                        <span
                          className="text-xs text-emerald-400"
                          aria-hidden="true"
                        >
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-3 animate-fade-in">
                          {/* Overall Category Dominance Table (including Total Points) */}
                          <div className="rounded-xl bg-emerald-950/80 border border-emerald-800/70 overflow-hidden text-xs">
                            <div
                              className="grid bg-emerald-950/95 border-b border-emerald-800/60 px-3 py-2 font-bold text-xs text-emerald-200"
                              style={{
                                gridTemplateColumns: `1.5fr repeat(${matchup.playerNames.length}, 1fr)`,
                              }}
                            >
                              <span>Series Stats</span>
                              {matchup.playerNames.map((name) => (
                                <span
                                  key={name}
                                  className="text-center truncate"
                                >
                                  {name}
                                </span>
                              ))}
                            </div>

                            <div className="divide-y divide-emerald-900/60 px-3 py-1 text-xs">
                              {[
                                {
                                  label: "Settebello",
                                  key: "settebello" as const,
                                },
                                { label: "Most Coins", key: "denari" as const },
                                { label: "Most Cards", key: "carte" as const },
                                { label: "Primiera", key: "primiera" as const },
                                {
                                  label: "Total Points",
                                  key: "points" as const,
                                },
                              ].map(({ label, key }) => {
                                const allWins = matchup.playerNames.map((n) =>
                                  key === "points"
                                    ? matchup.totalPoints[n] || 0
                                    : matchup.categoryWins[key][n] || 0,
                                );
                                const maxWins = Math.max(...allWins);
                                const isUniqueMax =
                                  maxWins > 0 &&
                                  allWins.filter((w) => w === maxWins)
                                    .length === 1;

                                return (
                                  <div
                                    key={key}
                                    className="grid py-1.5 items-center"
                                    style={{
                                      gridTemplateColumns: `1.5fr repeat(${matchup.playerNames.length}, 1fr)`,
                                    }}
                                  >
                                    <span className="text-emerald-200 font-medium">
                                      {label}
                                    </span>
                                    {matchup.playerNames.map((name) => {
                                      const val =
                                        key === "points"
                                          ? matchup.totalPoints[name] || 0
                                          : matchup.categoryWins[key][name] ||
                                            0;
                                      const isHigher =
                                        isUniqueMax && val === maxWins;

                                      return (
                                        <span
                                          key={name}
                                          className={`text-center transition-colors ${
                                            isHigher
                                              ? "text-yellow-300 font-bold text-xs sm:text-sm"
                                              : val > 0
                                                ? "text-white font-medium text-xs sm:text-sm"
                                                : "text-emerald-400/50 font-normal text-xs sm:text-sm"
                                          }`}
                                        >
                                          {val}
                                        </span>
                                      );
                                    })}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Chronological List of Games in this Rivalry */}
                          <div className="space-y-1.5">
                            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider block px-1">
                              Game Log
                            </span>
                            {matchup.games.map((game, idx) => {
                              const winner = game.players.find(
                                (p) => p.id === game.winnerId,
                              );
                              const scoreDisplay = (() => {
                                if (game.players.length === 2) {
                                  if (winner) {
                                    const loser = game.players.find(
                                      (p) => p.id !== winner.id,
                                    );
                                    const winScore =
                                      game.finalScores[winner.id] ?? 0;
                                    const loseScore = loser
                                      ? (game.finalScores[loser.id] ?? 0)
                                      : 0;
                                    return `${winScore} - ${loseScore}`;
                                  }
                                  const s1 =
                                    game.finalScores[game.players[0].id] ?? 0;
                                  const s2 =
                                    game.finalScores[game.players[1].id] ?? 0;
                                  return `${s1} - ${s2}`;
                                }
                                return game.players
                                  .map(
                                    (p) =>
                                      `${p.name}: ${game.finalScores[p.id] ?? 0}`,
                                  )
                                  .join(" • ");
                              })();

                              return (
                                <div
                                  key={game.id}
                                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs sm:text-sm"
                                >
                                  <div className="space-y-0.5">
                                    <span className="text-emerald-200/90 font-medium text-xs">
                                      Game #{matchup.games.length - idx} •{" "}
                                      {formatGameDate(game.completedAt)}
                                    </span>
                                    <div className="text-xs sm:text-sm text-white font-bold flex items-center gap-1">
                                      {winner ? (
                                        <span className="text-yellow-300 flex items-center gap-1">
                                          <span aria-hidden="true">🏆</span>
                                          <span>{winner.name}</span>
                                        </span>
                                      ) : (
                                        <span className="text-emerald-300">
                                          ⚖️ Tied
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <span className="text-xs sm:text-sm font-bold text-white px-2.5 py-1 rounded-lg bg-emerald-900/80 border border-emerald-700/60">
                                      {scoreDisplay}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. All Games View (Chronological List) */}
          {activeView === "all" && (
            <div
              id="all-games-panel"
              role="tabpanel"
              aria-label="All Games"
              className="space-y-3 sm:space-y-4 pb-2 animate-fade-in"
            >
              {history.map((game) => {
                const isExpanded = Boolean(expandedGames[game.id]);
                const isConfirmingDelete = deletingGameId === game.id;

                return (
                  <div
                    key={game.id}
                    className="rounded-2xl bg-emerald-900/90 border border-emerald-700/90 p-3 sm:p-4 shadow-xl space-y-3 transition-all"
                  >
                    {/* Game Header Row: Date/Time + Rounds Pill on Same Line */}
                    {/* Game Header Row: Date/Time + Rounds Pill on Left, Trash Button on Top-Right */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-emerald-200">
                        <span className="font-semibold text-emerald-100">
                          {formatGameDate(game.completedAt)}
                        </span>
                        <span className="text-emerald-500" aria-hidden="true">
                          •
                        </span>
                        <span>{formatGameTime(game.completedAt)}</span>
                        <span className="text-emerald-500" aria-hidden="true">
                          •
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-medium">
                          {game.rounds.length}{" "}
                          {game.rounds.length === 1 ? "round" : "rounds"}
                        </span>
                        {game.settings.isTeams && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-yellow-400/20 border border-yellow-400/60 text-yellow-300 font-medium">
                            Teams
                          </span>
                        )}
                      </div>

                      {/* Trash Icon Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setDeletingGameId(isConfirmingDelete ? null : game.id)
                        }
                        aria-label={`Delete game from ${formatGameDate(game.completedAt)}`}
                        title={
                          isConfirmingDelete ? "Cancel delete" : "Delete game"
                        }
                        className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                          isConfirmingDelete
                            ? "bg-red-900/60 text-red-200 hover:bg-red-800"
                            : "text-emerald-400 hover:text-red-400 hover:bg-emerald-950/80"
                        }`}
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
                    </div>

                    {/* Dedicated Delete Confirmation Banner */}
                    {isConfirmingDelete && (
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-emerald-950 border border-red-700/80 animate-fade-in">
                        <span className="text-xs font-semibold text-red-200">
                          Delete this game?
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDelete(game.id)}
                            className="min-h-[36px] px-3.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingGameId(null)}
                            className="min-h-[36px] px-3 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-bold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

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
                                  aria-hidden="true"
                                  title="Game Winner"
                                >
                                  🏆
                                </span>
                              )}
                              <span
                                className={`text-sm sm:text-base font-bold truncate ${
                                  isWinner
                                    ? "text-yellow-300"
                                    : "text-emerald-100"
                                }`}
                              >
                                {player.name}
                              </span>
                            </div>

                            {/* Points */}
                            <div className="my-1.5">
                              <span
                                className={`text-2xl sm:text-3xl font-extrabold leading-none ${
                                  isWinner ? "text-yellow-400" : "text-white"
                                }`}
                              >
                                {score}
                              </span>
                              <span className="text-xs sm:text-sm text-emerald-300 font-semibold ml-1">
                                pts
                              </span>
                            </div>

                            {/* Large, prominent Scopa Display */}
                            <div
                              aria-label={`${scopeCount} ${scopeCount === 1 ? "scopa" : "scope"} captured`}
                              className="py-1 px-2.5 rounded-lg bg-emerald-900/80 border border-emerald-700/60 flex items-center justify-center gap-1.5"
                            >
                              <span
                                className="text-lg sm:text-xl shrink-0"
                                aria-hidden="true"
                              >
                                🧹
                              </span>
                              <span className="text-sm sm:text-base font-bold text-yellow-300 leading-none">
                                {scopeCount}
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
                        aria-expanded={isExpanded}
                        onClick={() => toggleExpandGame(game.id)}
                        className="w-full min-h-[44px] flex items-center justify-between py-2 px-1 text-xs sm:text-sm font-semibold text-emerald-300 hover:text-yellow-300 transition-colors cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                      >
                        <span>{isExpanded ? "Hide Stats" : "View Stats"}</span>
                        <span
                          className="text-xs text-emerald-400"
                          aria-hidden="true"
                        >
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </button>

                      {/* Clean Category Stats Table */}
                      {isExpanded && (
                        <div className="mt-2 animate-fade-in">
                          <div className="rounded-xl bg-emerald-950/80 border border-emerald-800/70 overflow-hidden text-xs">
                            <div
                              className="grid bg-emerald-950/95 border-b border-emerald-800/60 px-3 py-2 font-bold text-xs text-emerald-200"
                              style={{
                                gridTemplateColumns: `1.5fr repeat(${game.players.length}, 1fr)`,
                              }}
                            >
                              <span>Category</span>
                              {game.players.map((p) => (
                                <span
                                  key={p.id}
                                  className="text-center truncate"
                                >
                                  {p.name}
                                </span>
                              ))}
                            </div>

                            <div className="divide-y divide-emerald-900/60 px-3 py-1 text-xs">
                              {[
                                {
                                  label: "Settebello",
                                  key: "settebello" as const,
                                },
                                { label: "Most Coins", key: "denari" as const },
                                { label: "Most Cards", key: "carte" as const },
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
                                              (r) =>
                                                r.settebelloWinnerId === p.id,
                                            ).length
                                          : game.rounds.filter(
                                              (r) =>
                                                r.primieraWinnerId === p.id,
                                            ).length;
                                  return acc;
                                }, {});

                                const allWins = Object.values(winsMap);
                                const maxWins = Math.max(...allWins);
                                const isUniqueMax =
                                  maxWins > 0 &&
                                  allWins.filter((w) => w === maxWins)
                                    .length === 1;

                                return (
                                  <div
                                    key={key}
                                    className="grid py-1.5 items-center"
                                    style={{
                                      gridTemplateColumns: `1.5fr repeat(${game.players.length}, 1fr)`,
                                    }}
                                  >
                                    <span className="text-emerald-200 font-medium">
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
                                              ? "text-yellow-300 font-bold text-xs sm:text-sm"
                                              : wins > 0
                                                ? "text-white font-medium text-xs sm:text-sm"
                                                : "text-emerald-400/50 font-normal text-xs sm:text-sm"
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
            </div>
          )}
        </>
      )}

      {/* 7. Clear All Confirmation Modal */}
      {showClearModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-history-title"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowClearModal(false);
            }
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-emerald-950 border border-emerald-700 p-5 shadow-2xl space-y-4 text-center cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="size-12 rounded-full bg-red-900/40 border border-red-600/70 text-red-400 flex items-center justify-center text-xl mx-auto"
              aria-hidden="true"
            >
              ⚠️
            </div>
            <div className="space-y-1">
              <h3
                id="clear-history-title"
                className="text-lg sm:text-xl font-bold text-white"
              >
                Clear All Game History?
              </h3>
              <p className="text-sm text-emerald-200/90">
                This will permanently delete all {history.length} saved{" "}
                {history.length === 1 ? "game" : "games"} from this device. This
                cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="w-full min-h-[44px] rounded-xl bg-emerald-800/80 border border-emerald-600 py-2.5 text-sm font-bold text-emerald-100 hover:bg-emerald-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="w-full min-h-[44px] rounded-xl bg-red-900 py-2.5 text-sm font-bold text-white hover:bg-red-700 border border-red-800/60 shadow-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. History Settings & Backup Modal */}
      {showSettingsModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-settings-title"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-fade-in cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSettingsModal(false);
              setPendingImportGames(null);
              setImportError(null);
            }
          }}
        >
          <div
            className="relative flex w-full max-w-md max-h-[calc(100dvh-2rem)] flex-col rounded-2xl bg-emerald-900 border border-emerald-700 shadow-2xl text-white overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-emerald-800 bg-emerald-950/80 px-2.5 py-2.5 sm:px-5 sm:py-3">
              <h3
                id="history-settings-title"
                className="text-lg sm:text-xl font-bold text-white"
              >
                History & Backup
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  setPendingImportGames(null);
                  setModalError(null);
                }}
                aria-label="Close settings"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800/70 transition-colors cursor-pointer text-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 shrink-0"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Modal Error Alert */}
              {modalError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-red-950/90 border border-red-600/80 text-red-200 text-xs sm:text-sm flex items-center gap-2 animate-fade-in"
                >
                  <span
                    className="text-red-400 text-base shrink-0"
                    aria-hidden="true"
                  >
                    ⚠️
                  </span>
                  <span>{modalError}</span>
                </div>
              )}

              {/* Import Merge/Replace Prompt */}
              {pendingImportGames ? (
                <div className="rounded-xl bg-emerald-900/80 border border-yellow-400/60 p-3.5 space-y-3 animate-fade-in">
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                      <span aria-hidden="true">📥</span> Import Options
                    </h4>
                    <p className="text-xs text-emerald-200 leading-relaxed">
                      Found{" "}
                      <strong className="text-yellow-300 font-semibold">
                        {pendingImportGames.length}
                      </strong>{" "}
                      {pendingImportGames.length === 1 ? "game" : "games"} in
                      backup file. You currently have{" "}
                      <strong className="text-yellow-300 font-semibold">
                        {history.length}
                      </strong>{" "}
                      saved {history.length === 1 ? "game" : "games"}.
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmMerge}
                      className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex flex-col items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <span>Merge with Existing (Recommended)</span>
                      <span className="text-[11px] font-normal text-emerald-900">
                        Adds new games and skips duplicate matches
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmReplace}
                      className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-emerald-950 hover:bg-red-950/80 border border-emerald-700 hover:border-red-600/60 text-emerald-200 hover:text-red-200 font-bold text-xs sm:text-sm transition-all cursor-pointer flex flex-col items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                    >
                      <span>Replace All History</span>
                      <span className="text-[11px] font-normal text-emerald-400/80">
                        Overwrites current device games with backup
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPendingImportGames(null)}
                      className="w-full min-h-[36px] py-1 text-xs text-emerald-300 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel Import
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Export Section */}
                  <div className="rounded-xl bg-emerald-900/60 border border-emerald-800 p-3.5 space-y-2.5">
                    <div>
                      <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                        <span aria-hidden="true">⬇️</span> Export History
                      </h4>
                      <p className="text-xs text-emerald-200 mt-0.5 leading-relaxed">
                        Download all {history.length} completed{" "}
                        {history.length === 1 ? "game" : "games"} as a{" "}
                        <code className="bg-emerald-950 px-1 py-0.5 rounded text-[11px] text-yellow-300">
                          .json
                        </code>{" "}
                        file to save or transfer to another device.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExport}
                      disabled={history.length === 0}
                      className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-emerald-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <span>Download Backup</span>
                    </button>
                  </div>

                  {/* Import Section */}
                  <div className="rounded-xl bg-emerald-900/60 border border-emerald-800 p-3.5 space-y-2.5">
                    <div>
                      <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                        <span aria-hidden="true">⬆️</span> Import / Restore
                      </h4>
                      <p className="text-xs text-emerald-200 mt-0.5 leading-relaxed">
                        Select a Sweeper backup file (
                        <code className="bg-emerald-950 px-1 py-0.5 rounded text-[11px] text-yellow-300">
                          .json
                        </code>
                        ) exported from another device or browser.
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileChange}
                      className="hidden"
                      aria-label="Upload Sweeper backup JSON"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-emerald-800/90 hover:bg-emerald-700 text-white border border-emerald-600 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                    >
                      <span>Select File (.json)</span>
                    </button>
                  </div>

                  {/* Danger Action: Delete History */}
                  {history.length > 0 && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSettingsModal(false);
                          setShowClearModal(true);
                        }}
                        className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-red-900/80 hover:bg-red-800 text-red-100 border border-red-700/70 font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                      >
                        <span aria-hidden="true">⚠️</span>Delete History
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
