import { useState, useEffect } from "react";
import type { Player, RoundEntry, RoundRawCounts } from "../types";
import setteBelloImg from "../assets/7-denari.jpg";
import coinIcon from "../assets/denare.png";
import PrimieraModal from "./PrimieraModal";
import { determineWinnerFromCounts } from "../utils/scorecardHelpers";

interface RoundScoreModalProps {
  players: Player[];
  roundNumber: number;
  existingRound?: RoundEntry | null;
  initialPrimieraChoice?: string | "tie" | null;
  onSave: (round: Omit<RoundEntry, "cumulativeTotals">) => void;
  onClose: () => void;
}

export default function RoundScoreModal({
  players,
  roundNumber,
  existingRound,
  initialPrimieraChoice,
  onSave,
  onClose,
}: RoundScoreModalProps) {
  // State for Scope sweeps
  const [scope, setScope] = useState<Record<string, number>>(() => {
    if (existingRound) return { ...existingRound.scope };
    const initial: Record<string, number> = {};
    for (const p of players) initial[p.id] = 0;
    return initial;
  });

  // Category choices: player ID | "tie" | null (unselected)
  const [carteChoice, setCarteChoice] = useState<string | "tie" | null>(() => {
    if (!existingRound) return null;
    return existingRound.carteWinnerId ?? "tie";
  });

  const [denariChoice, setDenariChoice] = useState<string | "tie" | null>(() => {
    if (!existingRound) return null;
    return existingRound.denariWinnerId ?? "tie";
  });

  const [settebelloWinnerId, setSettebelloWinnerId] = useState<string | null>(
    existingRound?.settebelloWinnerId ?? null
  );

  const [primieraChoice, setPrimieraChoice] = useState<string | "tie" | null>(() => {
    if (existingRound) return existingRound.primieraWinnerId ?? "tie";
    if (initialPrimieraChoice !== undefined && initialPrimieraChoice !== null) {
      return initialPrimieraChoice;
    }
    return null;
  });

  // Primiera modal visibility
  const [showPrimieraCalc, setShowPrimieraCalc] = useState(false);
  const [primieraMethod, setPrimieraMethod] = useState<string | null>(() => {
    if (existingRound?.primieraWinnerId) return "manual";
    if (initialPrimieraChoice) return "calculated";
    return null;
  });

  // Optional Count Helper mode
  const [showCountHelper, setShowCountHelper] = useState(false);

  // Close on Escape key press (only if nested Primiera calc is not open)
  useEffect(() => {
    if (showPrimieraCalc) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPrimieraCalc, onClose]);
  const [rawCounts, setRawCounts] = useState<Record<string, RoundRawCounts>>(() => {
    if (existingRound?.rawCounts) return { ...existingRound.rawCounts };
    const initial: Record<string, RoundRawCounts> = {};
    for (const p of players) initial[p.id] = { cards: undefined, coins: undefined };
    return initial;
  });

  // Round completion check: all 4 main categories must have a choice
  const isRoundComplete = Boolean(
    carteChoice && denariChoice && settebelloWinnerId && primieraChoice
  );

  // Scope counters handler
  const handleScopeChange = (playerId: string, delta: number) => {
    setScope((prev) => {
      const current = prev[playerId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [playerId]: next };
    });
  };

  // Count helper handlers
  const handleCardCountChange = (playerId: string, val: string) => {
    const num = val === "" ? undefined : parseInt(val, 10);
    const updated = {
      ...rawCounts,
      [playerId]: { ...rawCounts[playerId], cards: isNaN(num!) ? undefined : num },
    };
    setRawCounts(updated);

    // Auto calculate Carte winner or tie
    const counts: Record<string, number> = {};
    for (const p of players) {
      if (updated[p.id]?.cards !== undefined) {
        counts[p.id] = updated[p.id].cards!;
      }
    }
    const winner = determineWinnerFromCounts(counts);
    if (Object.keys(counts).length > 0) {
      setCarteChoice(winner ?? "tie");
    }
  };

  const handleCoinCountChange = (playerId: string, val: string) => {
    const num = val === "" ? undefined : parseInt(val, 10);
    const updated = {
      ...rawCounts,
      [playerId]: { ...rawCounts[playerId], coins: isNaN(num!) ? undefined : num },
    };
    setRawCounts(updated);

    // Auto calculate Denari winner or tie
    const counts: Record<string, number> = {};
    for (const p of players) {
      if (updated[p.id]?.coins !== undefined) {
        counts[p.id] = updated[p.id].coins!;
      }
    }
    const winner = determineWinnerFromCounts(counts);
    if (Object.keys(counts).length > 0) {
      setDenariChoice(winner ?? "tie");
    }
  };

  // Calculate live preview totals
  const roundTotals: Record<string, number> = {};
  for (const p of players) {
    let pts = scope[p.id] || 0;
    if (carteChoice === p.id) pts += 1;
    if (denariChoice === p.id) pts += 1;
    if (settebelloWinnerId === p.id) pts += 1;
    if (primieraChoice === p.id) pts += 1;
    roundTotals[p.id] = pts;
  }

  const handleSave = () => {
    if (!isRoundComplete) return;

    onSave({
      roundNumber,
      scope,
      carteWinnerId: carteChoice === "tie" ? null : carteChoice,
      denariWinnerId: denariChoice === "tie" ? null : denariChoice,
      settebelloWinnerId,
      primieraWinnerId: primieraChoice === "tie" ? null : primieraChoice,
      roundTotals,
      rawCounts: showCountHelper ? rawCounts : undefined,
    });
  };

  // Card count verification helper
  const totalCardsCounted = Object.values(rawCounts).reduce(
    (sum, c) => sum + (c.cards || 0),
    0
  );
  const totalCoinsCounted = Object.values(rawCounts).reduce(
    (sum, c) => sum + (c.coins || 0),
    0
  );

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/75 p-2 sm:p-4 backdrop-blur-xs cursor-pointer"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative flex max-h-[94vh] w-full max-w-xl flex-col rounded-2xl bg-emerald-900 border border-emerald-700 shadow-2xl text-white overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-800 bg-emerald-950/80 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {existingRound ? `Edit Round ${roundNumber}` : `Score Round ${roundNumber}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-emerald-300 hover:bg-emerald-800 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Section 1: Scope (Sweeps) */}
          <div className="rounded-xl bg-emerald-950/60 border border-emerald-800 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧹</span>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    Scope (Sweeps)
                  </h3>
                  <p className="text-xs text-emerald-300">
                    1 point for each sweep during play
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-emerald-900/80 border border-emerald-700 rounded-lg p-2.5"
                >
                  <span className="font-semibold text-sm truncate mr-2">
                    {p.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleScopeChange(p.id, -1)}
                      className="size-8 rounded-md bg-emerald-800 border border-emerald-600 text-lg font-bold text-white hover:bg-emerald-700 active:scale-95 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-7 text-center font-bold text-base text-yellow-300">
                      {scope[p.id] || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleScopeChange(p.id, 1)}
                      className="size-8 rounded-md bg-emerald-700 border border-emerald-500 text-lg font-bold text-white hover:bg-emerald-600 active:scale-95 flex items-center justify-center shadow-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Settebello */}
          <div className="rounded-xl bg-emerald-950/60 border border-emerald-800 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <img
                  src={setteBelloImg}
                  alt="Settebello"
                  className="h-7 w-auto rounded border border-yellow-400"
                />
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    Il Settebello (7 of Coins)
                  </h3>
                  <p className="text-xs text-emerald-300">
                    1 point to player who captured the 7 of Coins
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {players.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSettebelloWinnerId(p.id)}
                  className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg text-sm font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                    settebelloWinnerId === p.id
                      ? "bg-emerald-600 text-white border-emerald-400 shadow-md font-bold ring-2 ring-yellow-400"
                      : "bg-emerald-900/80 text-emerald-100 border-emerald-700 hover:bg-emerald-800"
                  }`}
                >
                  {settebelloWinnerId === p.id && (
                    <img
                      src={coinIcon}
                      alt="Denari"
                      className="size-4.5 object-contain inline-block shrink-0"
                    />
                  )}
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Carte (Cards) */}
          <div className="rounded-xl bg-emerald-950/60 border border-emerald-800 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                  <span>🃏</span>
                  <span>Carte (Most Cards)</span>
                </h3>
                <p className="text-xs text-emerald-300">
                  1 pt for capturing the most cards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCountHelper(!showCountHelper)}
                className="text-xs text-yellow-300 hover:underline flex items-center gap-1 bg-emerald-900/90 border border-emerald-700 px-2 py-1 rounded"
              >
                {showCountHelper ? "Hide Counts" : "🔢 Enter Exact Counts"}
              </button>
            </div>

            {/* Optional count inputs */}
            {showCountHelper && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-900/90 border border-emerald-700 text-xs space-y-2">
                <div className="flex justify-between text-emerald-300">
                  <span>Enter cards captured (total 40):</span>
                  <span className={totalCardsCounted === 40 ? "text-yellow-300 font-bold" : "text-emerald-400"}>
                    {totalCardsCounted} / 40 cards
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {players.map((p) => (
                    <div key={p.id} className="flex flex-col">
                      <label className="text-[11px] text-emerald-200 truncate">{p.name}</label>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={rawCounts[p.id]?.cards ?? ""}
                        onChange={(e) => handleCardCountChange(p.id, e.target.value)}
                        placeholder="0"
                        className="mt-1 w-full rounded bg-emerald-950 border border-emerald-600 px-2 py-1 text-center font-bold text-yellow-300 text-sm focus:border-yellow-400 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {players.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setCarteChoice(p.id)}
                  className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg text-sm font-semibold transition-all border ${
                    carteChoice === p.id
                      ? "bg-emerald-600 text-white border-emerald-400 shadow-md font-bold ring-2 ring-yellow-400"
                      : "bg-emerald-900/80 text-emerald-100 border-emerald-700 hover:bg-emerald-800"
                  }`}
                >
                  {p.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCarteChoice("tie")}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg text-sm font-semibold transition-all border ${
                  carteChoice === "tie"
                    ? "bg-emerald-600 text-white border-emerald-400 shadow-md font-bold ring-2 ring-yellow-400"
                    : "bg-emerald-900/80 text-emerald-100 border-emerald-700 hover:bg-emerald-800"
                }`}
              >
                Tie (0 pts)
              </button>
            </div>
          </div>

          {/* Section 4: Denari (Coins) */}
          <div className="rounded-xl bg-emerald-950/60 border border-emerald-800 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                  <img src={coinIcon} alt="Coin" className="size-4" />
                  <span>Denari (Most Coins)</span>
                </h3>
                <p className="text-xs text-emerald-300">
                  1 pt for capturing the most coins.
                </p>
              </div>
            </div>

            {/* Optional coin count inputs if count helper open */}
            {showCountHelper && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-900/90 border border-emerald-700 text-xs space-y-2">
                <div className="flex justify-between text-emerald-300">
                  <span>Enter coins captured (total 10):</span>
                  <span className={totalCoinsCounted === 10 ? "text-yellow-300 font-bold" : "text-emerald-400"}>
                    {totalCoinsCounted} / 10 coins
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {players.map((p) => (
                    <div key={p.id} className="flex flex-col">
                      <label className="text-[11px] text-emerald-200 truncate">{p.name}</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={rawCounts[p.id]?.coins ?? ""}
                        onChange={(e) => handleCoinCountChange(p.id, e.target.value)}
                        placeholder="0"
                        className="mt-1 w-full rounded bg-emerald-950 border border-emerald-600 px-2 py-1 text-center font-bold text-yellow-300 text-sm focus:border-yellow-400 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {players.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setDenariChoice(p.id)}
                  className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg text-sm font-semibold transition-all border ${
                    denariChoice === p.id
                      ? "bg-emerald-600 text-white border-emerald-400 shadow-md font-bold ring-2 ring-yellow-400"
                      : "bg-emerald-900/80 text-emerald-100 border-emerald-700 hover:bg-emerald-800"
                  }`}
                >
                  {p.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setDenariChoice("tie")}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg text-sm font-semibold transition-all border ${
                  denariChoice === "tie"
                    ? "bg-emerald-600 text-white border-emerald-400 shadow-md font-bold ring-2 ring-yellow-400"
                    : "bg-emerald-900/80 text-emerald-100 border-emerald-700 hover:bg-emerald-800"
                }`}
              >
                Tie (0 pts)
              </button>
            </div>
          </div>

          {/* Section 5: Primiera */}
          <div className="rounded-xl bg-emerald-950/60 border border-emerald-800 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                  <span>🏆</span>
                  <span>Primiera</span>
                </h3>
                <p className="text-xs text-emerald-300">
                  1 pt for highest 4-suit primiera total.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPrimieraCalc(true)}
                className="flex items-center gap-1.5 bg-yellow-400 text-emerald-950 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-yellow-300 transition-transform active:scale-95 shadow-md"
              >
                <span>Open Calculator</span>
              </button>
            </div>

            {primieraMethod === "calculated" && (
              <div className="mb-2 text-xs text-yellow-300 font-medium flex items-center gap-1">
                <span>✓ Winner determined via Primiera Calculator</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {players.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPrimieraChoice(p.id);
                    setPrimieraMethod("manual");
                  }}
                  className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg text-sm font-semibold transition-all border ${
                    primieraChoice === p.id
                      ? "bg-emerald-600 text-white border-emerald-400 shadow-md font-bold ring-2 ring-yellow-400"
                      : "bg-emerald-900/80 text-emerald-100 border-emerald-700 hover:bg-emerald-800"
                  }`}
                >
                  {p.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setPrimieraChoice("tie");
                  setPrimieraMethod("manual");
                }}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg text-sm font-semibold transition-all border ${
                  primieraChoice === "tie"
                    ? "bg-emerald-600 text-white border-emerald-400 shadow-md font-bold ring-2 ring-yellow-400"
                    : "bg-emerald-900/80 text-emerald-100 border-emerald-700 hover:bg-emerald-800"
                }`}
              >
                Tie (0 pts)
              </button>
            </div>
          </div>

          {/* Points Breakdown Preview */}
          <div className="rounded-xl bg-emerald-950/90 border border-emerald-700 p-3 sm:p-4">
            <h4 className="text-xs uppercase font-bold text-emerald-400 tracking-wider mb-2">
              Round Points Summary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {players.map((p) => {
                const total = roundTotals[p.id] || 0;
                return (
                  <div
                    key={p.id}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-emerald-900/70 border border-emerald-700"
                  >
                    <span className="text-xs text-emerald-200 font-medium truncate max-w-full">
                      {p.name}
                    </span>
                    <span className="text-xl font-extrabold text-yellow-300">
                      +{total} {total === 1 ? "pt" : "pts"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-emerald-800 bg-emerald-950/80 px-4 py-3 sm:px-6 space-y-1.5">
          {!isRoundComplete && (
            <p className="text-center text-xs text-emerald-300/80 italic">
              Select all 4 categories to save
            </p>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!isRoundComplete}
            className={`w-full rounded-xl py-2.5 font-bold shadow-lg transition-all text-sm flex items-center justify-center gap-1.5 ${
              isRoundComplete
                ? "bg-yellow-400 text-emerald-950 hover:bg-yellow-300 hover:scale-[1.01] cursor-pointer"
                : "bg-emerald-950 border border-emerald-800 text-emerald-500 cursor-not-allowed opacity-50"
            }`}
          >
            <span>{existingRound ? "Update Round" : "Save Round"}</span>
            <span>✓</span>
          </button>
        </div>
      </div>

      {/* Embedded Primiera Modal */}
      {showPrimieraCalc && (
        <PrimieraModal
          players={players}
          onApplyWinner={(winner) => {
            setPrimieraChoice(winner ?? "tie");
            setPrimieraMethod("calculated");
            setShowPrimieraCalc(false);
          }}
          onClose={() => setShowPrimieraCalc(false)}
        />
      )}
    </div>
  );
}
