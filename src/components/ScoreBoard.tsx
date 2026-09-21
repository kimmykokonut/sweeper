import { useState } from "react";
import type { GameState, RoundEntry } from "../types";
import setteBelloImg from "../assets/7-denari.jpg";
import coinIcon from "../assets/denare.png";

interface ScoreBoardProps {
  game: GameState;
  onScoreNextRound: () => void;
  onEditRound: (round: RoundEntry) => void;
  onDeleteRound: (roundNumber: number) => void;
  onResetGame: () => void;
}

export default function ScoreBoard({
  game,
  onScoreNextRound,
  onEditRound,
  onResetGame,
}: ScoreBoardProps) {
  const [showRules, setShowRules] = useState(false);

  const { players, rounds, settings, isFinished, winnerId } = game;
  const currentTotals: Record<string, number> = {};

  for (const p of players) {
    const lastRound = rounds[rounds.length - 1];
    currentTotals[p.id] = lastRound ? lastRound.cumulativeTotals[p.id] || 0 : 0;
  }

  // Find leader
  const sortedPlayers = [...players].sort(
    (a, b) => (currentTotals[b.id] || 0) - (currentTotals[a.id] || 0),
  );
  const highestScore = currentTotals[sortedPlayers[0]?.id] || 0;
  const isLeaderTied =
    sortedPlayers.length > 1 &&
    currentTotals[sortedPlayers[0]?.id] ===
      currentTotals[sortedPlayers[1]?.id] &&
    highestScore > 0;

  // Stats calculation
  const totalScope: Record<string, number> = {};
  const totalSettebello: Record<string, number> = {};
  for (const p of players) {
    totalScope[p.id] = rounds.reduce((sum, r) => sum + (r.scope[p.id] || 0), 0);
    totalSettebello[p.id] = rounds.reduce(
      (sum, r) => sum + (r.settebelloWinnerId === p.id ? 1 : 0),
      0,
    );
  }

  const winner = players.find((p) => p.id === winnerId);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 flex flex-col px-3 sm:px-6 py-3 sm:py-4 space-y-4 sm:space-y-6 text-white min-h-0">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800 pb-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Scopa Scorecard
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200">
            Playing to{" "}
            <span className="font-bold text-yellow-300">
              {settings.targetScore} points
            </span>
            {settings.isTeams ? " • Teams" : ` • ${players.length} Players`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="rounded-lg bg-emerald-800/80 border border-emerald-600 px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-700 transition-colors"
          >
            📖 Rules
          </button>
          <button
            type="button"
            onClick={onResetGame}
            className="rounded-lg bg-emerald-800/80 border border-emerald-600 px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-700 hover:text-white transition-colors cursor-pointer"
          >
            New Game
          </button>
        </div>
      </div>

      {/* Winner Banner if Finished */}
      {isFinished && winner && (
        <div className="rounded-2xl border-2 border-yellow-400 bg-linear-to-r from-emerald-950 via-emerald-900 to-emerald-950 p-5 shadow-2xl text-center space-y-3 animate-fade-in">
          <div className="text-4xl">🏆</div>
          <h2 className="text-2xl sm:text-3xl font-black text-yellow-300">
            {winner.name} Wins!
          </h2>
          <p className="text-emerald-200 text-sm">
            Victory achieved in {rounds.length}{" "}
            {rounds.length === 1 ? "round" : "rounds"} with{" "}
            <span className="font-bold text-yellow-300">
              {currentTotals[winner.id]} points
            </span>{" "}
            (target: {settings.targetScore})!
          </p>
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={onResetGame}
              className="rounded-xl bg-yellow-400 px-6 py-2.5 font-extrabold text-emerald-950 shadow-lg hover:bg-yellow-300 hover:scale-105 transition-all text-sm cursor-pointer"
            >
              Start New Game
            </button>
          </div>
        </div>
      )}

      {/* Player Score Badges */}
      <div
        className={`grid gap-3 ${players.length === 2 ? "grid-cols-2" : players.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}
      >
        {players.map((p) => {
          const score = currentTotals[p.id] || 0;
          const isLeader =
            score === highestScore && highestScore > 0 && !isLeaderTied;
          const progressPercent = Math.min(
            100,
            Math.round((score / settings.targetScore) * 100),
          );

          return (
            <div
              key={p.id}
              className={`relative flex flex-col justify-between rounded-2xl p-4 shadow-xl border transition-all ${
                isLeader
                  ? "bg-linear-to-b from-emerald-800 to-emerald-900 border-yellow-400 ring-2 ring-yellow-400/80 scale-[1.02]"
                  : "bg-emerald-900/80 border-emerald-700/80"
              }`}
            >
              {/* Leader Badge */}
              {isLeader && (
                <div className="absolute -top-3 right-3 rounded-full bg-yellow-400 text-emerald-950 px-2 py-0.5 text-[11px] font-extrabold shadow-md flex items-center gap-1">
                  Leader
                </div>
              )}

              <div>
                <h3 className="font-bold text-base sm:text-lg text-white truncate pr-2">
                  {p.name}
                </h3>

                {/* Score Number */}
                <div className="my-2 flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-yellow-300 tracking-tight">
                    {score}
                  </span>
                  <span className="text-xs text-emerald-300 font-semibold">
                    / {settings.targetScore}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-950">
                  <div
                    className="h-full bg-linear-to-r from-emerald-400 to-yellow-400 transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Quick stat settebello chip */}
                <div className="text-[11px] text-emerald-300 font-medium">
                  🧹{" "}
                  {totalScope[p.id] < 2
                    ? `${totalScope[p.id] || 0} scopa`
                    : `${totalScope[p.id]} scope`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Action Button */}
      {!isFinished && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onScoreNextRound}
            className="w-full sm:w-auto min-w-[260px] rounded-2xl bg-yellow-400 py-3.5 px-8 font-black text-emerald-950 text-base sm:text-lg shadow-xl hover:bg-yellow-300 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>+ Score Round {rounds.length + 1}</span>
          </button>
        </div>
      )}

      {/* Round History Table */}
      <div className="rounded-2xl bg-emerald-900/90 border border-emerald-700 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-emerald-800 bg-emerald-950/70 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h3 className="font-bold text-base sm:text-lg text-white">
              Rounds History
            </h3>
            <span className="rounded-md bg-emerald-800 px-2 py-0.5 text-xs text-emerald-200">
              {rounds.length} {rounds.length === 1 ? "round" : "rounds"}
            </span>
          </div>

          {rounds.length > 0 && !isFinished && (
            <button
              type="button"
              onClick={onScoreNextRound}
              className="text-xs font-bold text-yellow-300 hover:underline"
            >
              + Next Round
            </button>
          )}
        </div>

        {rounds.length === 0 ? (
          <div className="p-8 text-center text-emerald-300 space-y-2">
            <p className="text-lg">No rounds played yet!</p>
            <p className="text-xs text-emerald-400">
              Deal the 40 cards, play the hand, and click "+ Score Round 1"
              above to record the score.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-emerald-800/80 overflow-x-auto">
            {rounds.map((round) => (
              <div
                key={round.roundNumber}
                className="p-3 sm:p-4 hover:bg-emerald-800/40 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                {/* Round Label & Actions */}
                <div className="flex items-center justify-between sm:justify-start gap-3 sm:w-28 shrink-0">
                  <span className="font-extrabold text-sm sm:text-base text-yellow-300">
                    Round {round.roundNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEditRound(round)}
                    className="p-1 text-emerald-300 hover:text-white rounded hover:bg-emerald-800 text-xs sm:hidden"
                    title="Edit Round"
                  >
                    ✏️
                  </button>
                </div>

                {/* Points & Breakdown per player */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 flex-1">
                  {players.map((p) => {
                    const pts = round.roundTotals[p.id] || 0;
                    const scopeCount = round.scope[p.id] || 0;
                    const gotCarte = round.carteWinnerId === p.id;
                    const gotDenari = round.denariWinnerId === p.id;
                    const gotSettebello = round.settebelloWinnerId === p.id;
                    const gotPrimiera = round.primieraWinnerId === p.id;
                    const cumTotal = round.cumulativeTotals[p.id] || 0;

                    return (
                      <div
                        key={p.id}
                        className="rounded-xl bg-emerald-950/60 border border-emerald-800/80 p-2 text-xs flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between border-b border-emerald-800/50 pb-1 mb-1.5">
                          <span className="font-bold text-emerald-200 truncate mr-1">
                            {p.name}
                          </span>
                          <span className="font-black text-yellow-300 text-sm">
                            +{pts}{" "}
                            <span className="text-[10px] text-emerald-400 font-normal">
                              ({cumTotal})
                            </span>
                          </span>
                        </div>

                        {/* Breakdown Badges */}
                        <div className="flex flex-wrap gap-1">
                          {scopeCount > 0 && (
                            <span className="rounded bg-emerald-800 px-1.5 py-0.5 text-[10px] text-yellow-200 font-semibold">
                              🧹 {scopeCount}{" "}
                              {scopeCount === 1 ? "scopa" : "scope"}
                            </span>
                          )}
                          {gotCarte && (
                            <span className="rounded bg-emerald-800 px-1.5 py-0.5 text-[10px] text-emerald-200">
                              🃏 Carte
                            </span>
                          )}
                          {gotDenari && (
                            <span className="rounded bg-emerald-800 px-1.5 py-0.5 text-[10px] text-emerald-200">
                              🪙 Denari
                            </span>
                          )}
                          {gotSettebello && (
                            <span className="rounded bg-amber-400/20 text-yellow-300 border border-yellow-400/40 px-1.5 py-0.5 text-[10px] font-bold inline-flex items-center gap-1">
                              <img
                                src={coinIcon}
                                alt="Denari"
                                className="size-3 object-contain inline shrink-0"
                              />
                              <span>7 Bello</span>
                            </span>
                          )}
                          {gotPrimiera && (
                            <span className="rounded bg-emerald-800 px-1.5 py-0.5 text-[10px] text-emerald-200">
                              🏆 Primiera
                            </span>
                          )}
                          {pts === 0 && (
                            <span className="text-[10px] text-emerald-500 italic">
                              No points
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Edit Round buttons */}
                <button
                  type="button"
                  onClick={() => onEditRound(round)}
                  className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-800 transition-colors text-sm hidden sm:block"
                  title="Edit Round"
                >
                  ✏️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rules Quick Reference Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-emerald-900 border border-emerald-700 p-5 shadow-2xl text-white overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800 pb-2">
              <h3 className="font-bold text-lg text-white">
                Scopa Scoring Rules
              </h3>
              <button
                type="button"
                onClick={() => setShowRules(false)}
                className="text-emerald-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-xs sm:text-sm text-emerald-100 space-y-3">
              <p>
                Each round of Scopa deals all 40 cards. At the end of the round,
                5 types of points can be scored:
              </p>

              <div className="space-y-2">
                <div className="rounded-lg bg-emerald-950/70 p-2.5 border border-emerald-800">
                  <span className="font-bold text-yellow-300">
                    🧹 Scope (Sweeps):{" "}
                  </span>
                  1 point each time a player captures all cards currently on the
                  table during play.
                </div>

                <div className="rounded-lg bg-emerald-950/70 p-2.5 border border-emerald-800">
                  <span className="font-bold text-yellow-300">
                    🃏 Carte (Cards):{" "}
                  </span>
                  1 point to the player who captured more than 20 cards (21+).
                  If tied (20-20), no point.
                </div>

                <div className="rounded-lg bg-emerald-950/70 p-2.5 border border-emerald-800 flex items-start gap-2">
                  <img
                    src={setteBelloImg}
                    alt="Settebello"
                    className="h-8 w-auto rounded border border-yellow-400 shrink-0"
                  />
                  <div>
                    <span className="font-bold text-yellow-300">
                      ⭐ Il Settebello:{" "}
                    </span>
                    1 point to the player who captured the Seven of Coins (7 di
                    Denari).
                  </div>
                </div>

                <div className="rounded-lg bg-emerald-950/70 p-2.5 border border-emerald-800">
                  <span className="font-bold text-yellow-300">
                    🪙 Denari (Coins):{" "}
                  </span>
                  1 point to the player who captured more than 5 coins (6+). If
                  tied (5-5), no point.
                </div>

                <div className="rounded-lg bg-emerald-950/70 p-2.5 border border-emerald-800">
                  <span className="font-bold text-yellow-300">
                    🏆 Primiera:{" "}
                  </span>
                  1 point to the player with the highest Primiera score (best
                  card in each suit: 7=21, 6=18, A=16, 5=15, 4=14, 3=13, 2=12,
                  Face=10). You can use our built-in Primiera calculator!
                </div>
              </div>

              <div className="text-xs text-emerald-300 pt-1">
                <strong>Winning:</strong> The first player or team to reach or
                exceed {settings.targetScore} points with strictly the highest
                score wins the match!
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRules(false)}
              className="w-full rounded-xl bg-yellow-400 py-2.5 font-bold text-emerald-950 hover:bg-yellow-300 shadow-md transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
