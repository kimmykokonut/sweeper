import { useState } from "react";
import type { GameSettings, GameState, Player } from "../types";
import { CARD_DATA } from "../utils/cardData";

interface GameSetupProps {
  existingGame: GameState | null;
  onResume: () => void;
  onStartNewGame: (players: Player[], settings: GameSettings) => void;
}

export default function GameSetup({
  existingGame,
  onResume,
  onStartNewGame,
}: GameSetupProps) {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [isTeams, setIsTeams] = useState<boolean>(false);
  const [targetScore, setTargetScore] = useState<number>(11);
  const [customTarget, setCustomTarget] = useState<string>("");
  const [playerNames, setPlayerNames] = useState<Record<number, string>>({
    0: "Player 1",
    1: "Player 2",
    2: "Player 3",
    3: "Player 4",
  });

  const handlePlayerCountChange = (count: 2 | 3 | 4) => {
    setPlayerCount(count);
    if (count !== 4) {
      setIsTeams(false);
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

    const finalTarget = customTarget ? parseInt(customTarget, 10) || 11 : targetScore;

    onStartNewGame(finalPlayers, {
      playerCount,
      isTeams: playerCount === 4 && isTeams,
      targetScore: finalTarget,
    });
  };

  const numEntries = isTeams && playerCount === 4 ? 2 : playerCount;

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6 text-white space-y-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-extrabold text-white">Scopa Scorecard</h1>
        <p className="text-sm text-emerald-200">
          Set up players and target score to start tracking your game
        </p>
      </div>

      {/* Resume In-Progress Game Banner */}
      {existingGame && !existingGame.isFinished && (
        <div className="rounded-xl border border-yellow-400/60 bg-emerald-950/80 p-4 shadow-lg text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-yellow-300 font-bold text-sm">
                <span>🔄</span>
                <span>Unfinished Game Found</span>
              </div>
              <p className="text-xs text-emerald-200 mt-1">
                {existingGame.players.map((p) => p.name).join(" vs ")} (Round{" "}
                {existingGame.rounds.length + 1})
              </p>
            </div>
            <button
              type="button"
              onClick={onResume}
              className="shrink-0 rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-bold text-emerald-950 hover:bg-yellow-300 shadow-md cursor-pointer transition-transform hover:scale-105"
            >
              Resume Game
            </button>
          </div>
        </div>
      )}

      {/* Setup Form */}
      <form
        onSubmit={handleStart}
        className="rounded-2xl bg-emerald-900/90 border border-emerald-700 p-5 sm:p-6 shadow-xl space-y-6"
      >
        {/* Step 1: Player Count */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-emerald-200 block">
            1. Number of Players
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => handlePlayerCountChange(count as 2 | 3 | 4)}
                className={`py-3 px-2 rounded-xl font-bold text-sm sm:text-base border transition-all ${
                  playerCount === count
                    ? "bg-yellow-400 text-emerald-950 border-yellow-300 shadow-md ring-2 ring-yellow-300 scale-102"
                    : "bg-emerald-950/60 text-emerald-200 border-emerald-700 hover:bg-emerald-800"
                }`}
              >
                {count} Players
              </button>
            ))}
          </div>

          {/* 4 Player Mode: Individual or Teams */}
          {playerCount === 4 && (
            <div className="mt-3 flex items-center justify-center gap-2 p-1.5 bg-emerald-950/60 rounded-xl border border-emerald-800">
              <button
                type="button"
                onClick={() => handleTeamsToggle(false)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  !isTeams
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-emerald-300 hover:text-white"
                }`}
              >
                4 Individuals
              </button>
              <button
                type="button"
                onClick={() => handleTeamsToggle(true)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  isTeams
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-emerald-300 hover:text-white"
                }`}
              >
                2 Teams of 2
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Player / Team Names */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-emerald-200 block">
            2. {isTeams ? "Team Names" : "Player Names"}
          </label>
          <div className="space-y-2.5">
            {Array.from({ length: numEntries }).map((_, index) => {
              const defaultPlaceholder = isTeams
                ? `Team ${index + 1}`
                : `Player ${index + 1}`;
              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-400 w-16 text-right shrink-0">
                    {isTeams ? `Team ${index + 1}` : `Player ${index + 1}`}:
                  </span>
                  <input
                    type="text"
                    maxLength={20}
                    value={playerNames[index] ?? defaultPlaceholder}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder={defaultPlaceholder}
                    className="flex-1 rounded-xl bg-emerald-950/80 border border-emerald-600 px-3.5 py-2 text-sm text-white placeholder-emerald-500 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Target Score */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-emerald-200 block">
            3. Target Score to Win
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setTargetScore(11);
                setCustomTarget("");
              }}
              className={`flex-1 py-3 px-3 rounded-xl font-bold text-sm border transition-all ${
                targetScore === 11 && !customTarget
                  ? "bg-yellow-400 text-emerald-950 border-yellow-300 shadow-md ring-2 ring-yellow-300 scale-101"
                  : "bg-emerald-950/60 text-emerald-200 border-emerald-700 hover:bg-emerald-800"
              }`}
            >
              11 Points
              <span className="block text-[11px] font-normal opacity-85">
                Standard Scopa
              </span>
            </button>
            <div
              className={`flex-1 flex flex-col justify-center rounded-xl border px-3 py-2 transition-all ${
                customTarget
                  ? "bg-yellow-400/20 border-yellow-400 ring-2 ring-yellow-400/80"
                  : "bg-emerald-950/60 border-emerald-700"
              }`}
            >
              <label htmlFor="custom-target-input" className="text-[11px] text-emerald-200 font-semibold block">
                Custom Target:
              </label>
              <div className="flex items-center gap-1.5 mt-0.5">
                <input
                  id="custom-target-input"
                  type="number"
                  min="1"
                  max="99"
                  placeholder="e.g. 21"
                  value={customTarget}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomTarget(val);
                    if (val) setTargetScore(parseInt(val, 10) || 11);
                  }}
                  className="w-full rounded-lg bg-emerald-950 border border-emerald-600 px-2 py-1 text-center text-sm font-bold text-yellow-300 focus:border-yellow-400 focus:outline-none"
                />
                <span className="text-xs text-emerald-300">pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Suit Footer Icon */}
        <div className="flex items-center justify-center gap-4 py-1 opacity-70">
          <img src={CARD_DATA["coins"].icon} alt="coins" className="size-5 object-contain" />
          <img src={CARD_DATA["cups"].icon} alt="cups" className="size-5 object-contain" />
          <img src={CARD_DATA["swords"].icon} alt="swords" className="size-5 object-contain" />
          <img src={CARD_DATA["clubs"].icon} alt="clubs" className="size-5 object-contain" />
        </div>

        {/* Start Button */}
        <button
          type="submit"
          className="w-full rounded-xl bg-yellow-400 py-3.5 font-extrabold text-emerald-950 text-base shadow-lg hover:bg-yellow-300 hover:scale-[1.02] transition-all cursor-pointer"
        >
          Start Game
        </button>
      </form>
    </div>
  );
}
