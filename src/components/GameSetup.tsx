import { useState, useRef } from "react";
import type { GameSettings, GameState, Player } from "../types";
import { CARD_DATA } from "../utils/cardData";
import {
  loadRecentPlayerNames,
  saveRecentPlayerNames,
} from "../utils/scorecardHelpers";

interface GameSetupProps {
  existingGame: GameState | null;
  onResume: () => void;
  onPauseForLater?: (game: GameState) => void;
  onDiscardExisting?: () => void;
  onStartNewGame: (players: Player[], settings: GameSettings) => void;
}

export default function GameSetup({
  existingGame,
  onResume,
  onPauseForLater,
  onDiscardExisting,
  onStartNewGame,
}: GameSetupProps) {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [isTeams, setIsTeams] = useState<boolean>(false);
  const [customTarget, setCustomTarget] = useState<string>("");
  const [isCustomTarget, setIsCustomTarget] = useState<boolean>(false);
  const customInputRef = useRef<HTMLInputElement>(null);
  const [playerNames, setPlayerNames] = useState<Record<number, string>>(() => {
    const recent = loadRecentPlayerNames(2);
    if (recent && recent.length >= 2) {
      return {
        0: recent[0] || "Player 1",
        1: recent[1] || "Player 2",
        2: recent[2] || "Player 3",
        3: recent[3] || "Player 4",
      };
    }
    return {
      0: "Player 1",
      1: "Player 2",
      2: "Player 3",
      3: "Player 4",
    };
  });

  const handlePlayerCountChange = (count: 2 | 3 | 4) => {
    setPlayerCount(count);
    if (count !== 4) {
      setIsTeams(false);
    }
    const recent = loadRecentPlayerNames(count);
    if (recent && recent.length >= count) {
      setPlayerNames((prev) => {
        const updated = { ...prev };
        for (let i = 0; i < count; i++) {
          if (recent[i]) updated[i] = recent[i];
        }
        return updated;
      });
    }
  };

  const handleTeamsToggle = (teams: boolean) => {
    setIsTeams(teams);
    if (teams) {
      setPlayerNames((prev) => ({
        ...prev,
        0: prev[0] === "Player 1" ? "Team 1" : prev[0],
        1: prev[1] === "Player 2" ? "Team 2" : prev[1],
      }));
    } else {
      setPlayerNames((prev) => ({
        ...prev,
        0: prev[0] === "Team 1" ? "Player 1" : prev[0],
        1: prev[1] === "Team 2" ? "Player 2" : prev[1],
      }));
    }
  };

  const handleNameChange = (index: number, name: string) => {
    setPlayerNames((prev) => ({ ...prev, [index]: name }));
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();

    const actualCount = isTeams && playerCount === 4 ? 2 : playerCount;
    const finalPlayers: Player[] = [];

    for (let i = 0; i < actualCount; i++) {
      const defaultName = isTeams ? `Team ${i + 1}` : `Player ${i + 1}`;
      finalPlayers.push({
        id: `p${i + 1}`,
        name: playerNames[i]?.trim() || defaultName,
      });
    }

    // Save recent player names for this player count so next time they are remembered
    saveRecentPlayerNames(
      actualCount,
      finalPlayers.map((p) => p.name),
    );

    const finalTarget = isCustomTarget ? parseInt(customTarget, 10) || 21 : 11;

    onStartNewGame(finalPlayers, {
      playerCount,
      isTeams: playerCount === 4 && isTeams,
      targetScore: finalTarget,
    });
  };

  const numEntries = isTeams && playerCount === 4 ? 2 : playerCount;

  return (
    <div className="w-full max-w-lg mx-auto flex-1 flex flex-col justify-center gap-4 sm:gap-6 my-auto px-4 py-3 sm:py-5 min-h-0 overflow-y-auto text-white">
      {/* 1. Header: Title & Subtitle */}
      <div className="text-center space-y-1 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Scopa Setup
        </h1>
        <p className="text-sm sm:text-base text-emerald-200/90">
          Configure players and target score
        </p>
      </div>

      {/* 2. Suit Badges Row */}
      <div
        aria-hidden="true"
        className="flex items-center justify-center gap-3.5 sm:gap-4 shrink-0 py-0.5 select-none"
      >
        {(["coins", "cups", "swords", "clubs"] as const).map((suit) => (
          <div
            key={suit}
            className="flex items-center justify-center size-9 sm:size-10 rounded-full bg-amber-50/95 border border-yellow-400/80 shadow-md p-0.25 transition-transform hover:scale-110"
            title={CARD_DATA[suit].displayName}
          >
            <img
              src={CARD_DATA[suit].icon}
              alt={CARD_DATA[suit].displayName}
              className="size-full object-contain drop-shadow-xs"
            />
          </div>
        ))}
      </div>

      {/* 3. Form Card & Optional Resume/Pause Banner */}
      <div className="w-full space-y-3 shrink-0">


        {/* Resume or Pause In-Progress Game Banner */}
        {existingGame && !existingGame.isFinished && (
          <div className="rounded-xl border border-yellow-400/70 bg-emerald-950/90 p-3 sm:p-3.5 shadow-md space-y-2.5 mt-1 animate-fade-in">
            <div className="flex items-start justify-between min-w-0">
              <div className="min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-1.5 text-yellow-300 font-semibold text-base sm:text-lg">
                  <span>Unfinished Game Found</span>
                </div>
                <p className="text-sm sm:text-base text-emerald-200 truncate">
                  {existingGame.players.map((p) => p.name).join(" vs ")} • Round{" "}
                  {existingGame.rounds.length + 1}
                </p>
              </div>
              {onDiscardExisting && (
                <button
                  type="button"
                  onClick={onDiscardExisting}
                  title="Discard this unfinished game"
                  aria-label="Discard unfinished game"
                  className="text-emerald-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-emerald-900/60 transition-colors cursor-pointer shrink-0 -mt-0.5"
                >
                  <svg
                    className="size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={onResume}
                aria-label={`Resume unfinished game, Round ${existingGame.rounds.length + 1}`}
                className="flex-1 rounded-lg bg-yellow-400 px-3.5 py-2 min-h-[44px] text-sm sm:text-base font-bold text-emerald-950 hover:bg-yellow-300 focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:outline-none shadow-sm cursor-pointer transition-transform hover:scale-[1.02] active:scale-98 flex items-center justify-center"
              >
                Resume
              </button>
              {onPauseForLater && (
                <button
                  type="button"
                  onClick={() => onPauseForLater(existingGame)}
                  aria-label="Save unfinished game to play later"
                  className="flex-1 rounded-lg bg-emerald-800/90 border border-emerald-600 px-3.5 py-2 min-h-[44px] text-sm sm:text-base font-semibold text-emerald-100 hover:bg-emerald-700 hover:text-white focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors cursor-pointer flex items-center justify-center"
                >
                  Save for Later
                </button>
              )}
            </div>
          </div>
        )}

        {/* Setup Form */}
        <form
          onSubmit={handleStart}
          className="w-full rounded-2xl bg-emerald-900/90 border border-emerald-700 p-4 sm:p-6 shadow-xl space-y-5 sm:space-y-6"
        >
          {/* Step 1: Player Count */}
          <div className="space-y-2.5 sm:space-y-3">
            <label className="text-base sm:text-lg font-semibold text-emerald-200 block">
              1. Number of Players
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  aria-pressed={playerCount === count}
                  onClick={() => handlePlayerCountChange(count as 2 | 3 | 4)}
                  className={`min-h-[44px] py-2 sm:py-3 px-1 sm:px-2.5 flex items-center justify-center text-center rounded-xl font-semibold text-base sm:text-lg border focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none transition-all cursor-pointer ${
                    playerCount === count
                      ? "bg-yellow-400 text-emerald-950 border-yellow-300 shadow-md ring-2 ring-yellow-300 scale-102 font-bold"
                      : "bg-emerald-950/60 text-emerald-200 border-emerald-700 hover:bg-emerald-800"
                  }`}
                >
                  {count} Players
                </button>
              ))}
            </div>

            {/* 4 Player Mode: Individual or Teams */}
            {playerCount === 4 && (
              <div className="mt-2.5 flex items-center justify-center gap-2 p-1.5 bg-emerald-950/60 rounded-xl border border-emerald-800 text-sm sm:text-base">
                <button
                  type="button"
                  aria-pressed={!isTeams}
                  onClick={() => handleTeamsToggle(false)}
                  className={`flex-1 min-h-[44px] py-2 px-3 font-semibold rounded-lg flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none cursor-pointer ${
                    !isTeams
                      ? "bg-emerald-600 text-white shadow-xs font-bold"
                      : "text-emerald-300 hover:text-white"
                  }`}
                >
                  4 Individuals
                </button>
                <button
                  type="button"
                  aria-pressed={isTeams}
                  onClick={() => handleTeamsToggle(true)}
                  className={`flex-1 min-h-[44px] py-2 px-3 font-semibold rounded-lg flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none cursor-pointer ${
                    isTeams
                      ? "bg-emerald-600 text-white shadow-xs font-bold"
                      : "text-emerald-300 hover:text-white"
                  }`}
                >
                  2 Teams of 2
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Player / Team Names */}
          <div className="space-y-2 sm:space-y-3">
            <label className="text-base sm:text-lg font-semibold text-emerald-200 block">
              2. {isTeams ? "Team Names" : "Player Names"}
            </label>
            <div className="space-y-2 sm:space-y-3">
              {Array.from({ length: numEntries }).map((_, index) => {
                const defaultPlaceholder = isTeams
                  ? `Team ${index + 1}`
                  : `Player ${index + 1}`;
                const currentValue = playerNames[index] ?? defaultPlaceholder;
                const hasValue = Boolean(currentValue);

                return (
                  <div
                    key={index}
                    className="flex items-center gap-2.5 sm:gap-3 min-w-0 w-full"
                  >
                    <label
                      htmlFor={`player-name-${index}`}
                      className="text-sm sm:text-base font-semibold text-emerald-400 w-16 sm:w-20 text-right shrink-0 cursor-pointer"
                    >
                      {isTeams ? `Team ${index + 1}` : `Player ${index + 1}`}:
                    </label>
                    <div className="relative flex-1 min-w-0 flex items-center">
                      <input
                        id={`player-name-${index}`}
                        type="text"
                        maxLength={20}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        aria-label={`${isTeams ? "Team" : "Player"} ${index + 1} Name`}
                        value={currentValue}
                        onChange={(e) =>
                          handleNameChange(index, e.target.value)
                        }
                        onFocus={(e) => {
                          if (e.target.value === defaultPlaceholder) {
                            e.target.select();
                          }
                        }}
                        placeholder={defaultPlaceholder}
                        className="w-full min-w-0 rounded-xl bg-emerald-950/80 border border-emerald-600 pl-3 sm:pl-4 pr-9 sm:pr-10 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-emerald-500 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none"
                      />
                      {hasValue && (
                        <button
                          type="button"
                          onClick={() => {
                            handleNameChange(index, "");
                            document
                              .getElementById(`player-name-${index}`)
                              ?.focus();
                          }}
                          aria-label={`Clear ${defaultPlaceholder} name`}
                          className="absolute right-2 sm:right-2.5 p-1 rounded-full text-emerald-400 hover:text-white hover:bg-emerald-800/60 active:scale-95 transition-colors cursor-pointer"
                        >
                          <svg
                            className="size-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Target Score */}
          <div className="space-y-2.5 sm:space-y-3">
            <label className="text-base sm:text-lg font-semibold text-emerald-200 block">
              3. Target Score to Win
            </label>
            <div className="flex gap-2.5 sm:gap-3">
              <button
                type="button"
                aria-pressed={!isCustomTarget}
                onClick={() => {
                  setIsCustomTarget(false);
                  setCustomTarget("");
                }}
                className={`flex-1 py-3 sm:py-3.5 px-2.5 sm:px-3 rounded-xl font-semibold text-base sm:text-lg border focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none transition-all cursor-pointer ${
                  !isCustomTarget
                    ? "bg-yellow-400 text-emerald-950 border-yellow-300 shadow-md ring-2 ring-yellow-300 scale-101 font-bold"
                    : "bg-emerald-950/60 text-emerald-200 border-emerald-700 hover:bg-emerald-800"
                }`}
              >
                11 Points
                <span className="block text-xs sm:text-sm font-normal">
                  Standard Scopa
                </span>
              </button>
              <div
                role="button"
                tabIndex={-1}
                aria-pressed={isCustomTarget}
                onClick={() => {
                  setIsCustomTarget(true);
                  customInputRef.current?.focus();
                }}
                className={`flex-1 flex flex-col justify-center rounded-xl border px-3 py-2 transition-all cursor-pointer ${
                  isCustomTarget
                    ? "bg-yellow-400/20 border-yellow-400 ring-2 ring-yellow-400/80 scale-101"
                    : "bg-emerald-950/60 border-emerald-700 hover:bg-emerald-900/50"
                }`}
              >
                <label
                  htmlFor="custom-target-input"
                  className="text-xs sm:text-sm text-emerald-200 font-semibold block cursor-pointer"
                >
                  Custom Target:
                </label>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <input
                    ref={customInputRef}
                    id="custom-target-input"
                    type="number"
                    min="1"
                    max="99"
                    placeholder="21"
                    aria-label="Custom target score in points"
                    value={customTarget}
                    onFocus={(e) => {
                      setIsCustomTarget(true);
                      e.target.select();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCustomTarget(true);
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      setIsCustomTarget(true);
                      setCustomTarget(val);
                    }}
                    className="flex-1 min-w-0 min-h-[44px] rounded-lg bg-emerald-950 border border-emerald-600 px-2 py-1.5 text-center text-base sm:text-lg font-semibold text-yellow-300 placeholder:font-normal placeholder-emerald-500 focus:border-yellow-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                  />
                  <span className="text-sm sm:text-base text-emerald-300 font-medium shrink-0">
                    pts
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Start Game Button */}
          <button
            type="submit"
            className="w-full rounded-xl bg-yellow-400 py-3.5 sm:py-4 font-bold text-emerald-950 text-lg sm:text-xl shadow-lg hover:bg-yellow-300 hover:scale-[1.01] active:scale-99 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none transition-all cursor-pointer"
          >
            Start Game
          </button>
        </form>
      </div>
    </div>
  );
}
