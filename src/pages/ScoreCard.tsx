import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router";
import type { GameSettings, GameState, Player, RoundEntry } from "../types";
import GameSetup from "../components/GameSetup";
import ScoreBoard from "../components/ScoreBoard";
import RoundScoreModal from "../components/RoundScoreModal";
import {
  clearGameState,
  loadGameState,
  recalculateGame,
  saveFinishedGame,
  saveGameState,
  savePausedGame,
} from "../utils/scorecardHelpers";

export default function ScoreCard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const isExplicitNew = searchParams.get("new") === "true";
  const autoRoundParam = searchParams.get("round") === "1";
  const primieraParam = searchParams.get("primiera");

  const [savedGame, setSavedGame] = useState<GameState | null>(() =>
    loadGameState(),
  );
  const [game, setGame] = useState<GameState | null>(() => {
    const saved = loadGameState();
    if (autoRoundParam && saved) {
      return saved;
    }
    if (!isExplicitNew && saved && !saved.isFinished) {
      return saved;
    }
    return null;
  });

  const [initialPrimieraChoice, setInitialPrimieraChoice] = useState<
    string | "tie" | null
  >(
    () =>
      primieraParam ||
      (
        location.state as {
          initialPrimieraChoice?: string | "tie" | null;
        } | null
      )?.initialPrimieraChoice ||
      null,
  );

  const [isModalOpen, setIsModalOpen] = useState<boolean>(() => {
    return (
      autoRoundParam ||
      Boolean(
        (location.state as { autoOpenRound1?: boolean } | null)?.autoOpenRound1,
      )
    );
  });
  const [editingRound, setEditingRound] = useState<RoundEntry | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage((prev) => (prev === text ? null : prev));
    }, 4500);
  };

  useEffect(() => {
    if (autoRoundParam || primieraParam) {
      setSearchParams({}, { replace: true });
    }
  }, [autoRoundParam, primieraParam, setSearchParams]);

  // Save to localStorage when game changes
  const updateGame = (newGame: GameState | null) => {
    setGame(newGame);
    if (newGame) {
      saveGameState(newGame);
      setSavedGame(newGame);
      if (newGame.isFinished) {
        saveFinishedGame(newGame);
      }
    } else {
      clearGameState();
      setSavedGame(null);
    }
  };

  const handleStartNewGame = (players: Player[], settings: GameSettings) => {
    if (isExplicitNew) {
      setSearchParams({}, { replace: true });
    }
    // Safeguard: auto-pause unfinished game with scored rounds so it isn't lost
    if (savedGame && !savedGame.isFinished && savedGame.rounds.length > 0) {
      savePausedGame(savedGame);
    }
    const newGame: GameState = {
      id: `game_${Date.now()}`,
      createdAt: Date.now(),
      players,
      settings,
      rounds: [],
      isFinished: false,
      winnerId: null,
    };
    updateGame(newGame);
    setToastMessage(null);
  };

  const handleResumeGame = () => {
    if (isExplicitNew) {
      setSearchParams({}, { replace: true });
    }
    if (savedGame) {
      setGame(savedGame);
    }
  };

  const handleSaveRound = (roundData: Omit<RoundEntry, "cumulativeTotals">) => {
    if (!game) return;

    let updatedRounds: Array<
      Omit<RoundEntry, "roundTotals" | "cumulativeTotals"> &
        Partial<Pick<RoundEntry, "roundTotals" | "cumulativeTotals">>
    >;

    if (editingRound) {
      // Replace existing round
      updatedRounds = game.rounds.map((r) =>
        r.roundNumber === editingRound.roundNumber ? roundData : r,
      );
    } else {
      // Add new round
      updatedRounds = [...game.rounds, roundData];
    }

    const { recalculatedRounds, isFinished, winnerId } = recalculateGame(
      updatedRounds,
      game.players,
      game.settings.targetScore,
    );

    const updatedGame: GameState = {
      ...game,
      rounds: recalculatedRounds,
      isFinished,
      winnerId,
    };

    updateGame(updatedGame);
    setIsModalOpen(false);
    setEditingRound(null);
  };

  const handleDeleteRound = (roundNumber: number) => {
    if (!game) return;

    const filtered = game.rounds.filter((r) => r.roundNumber !== roundNumber);
    const { recalculatedRounds, isFinished, winnerId } = recalculateGame(
      filtered,
      game.players,
      game.settings.targetScore,
    );

    const updatedGame: GameState = {
      ...game,
      rounds: recalculatedRounds,
      isFinished,
      winnerId,
    };

    updateGame(updatedGame);
  };

  const handleResetGame = () => {
    if (game?.isFinished) {
      saveFinishedGame(game);
      updateGame(null);
    } else {
      // Unfinished match: return to setup screen keeping savedGame in state/storage
      // so user sees the Unfinished Game banner and can choose Resume, Save for Later, or Discard.
      setGame(null);
    }
  };

  const handlePauseForLater = (gameToPause: GameState) => {
    savePausedGame(gameToPause);
    clearGameState();
    setSavedGame(null);
    showToast("Game saved! You can find in History to resume.");
  };

  const handleDiscardExisting = () => {
    clearGameState();
    setSavedGame(null);
    showToast("Unfinished game discarded");
  };

  if (!game) {
    return (
      <GameSetup
        existingGame={savedGame}
        onResume={handleResumeGame}
        onPauseForLater={handlePauseForLater}
        onDiscardExisting={handleDiscardExisting}
        onStartNewGame={handleStartNewGame}
        toastMessage={toastMessage}
        onDismissToast={() => setToastMessage(null)}
      />
    );
  }

  return (
    <>
      <ScoreBoard
        game={game}
        onScoreNextRound={() => {
          setEditingRound(null);
          setIsModalOpen(true);
        }}
        onEditRound={(round) => {
          setEditingRound(round);
          setIsModalOpen(true);
        }}
        onDeleteRound={handleDeleteRound}
        onResetGame={handleResetGame}
      />

      {isModalOpen && (
        <RoundScoreModal
          players={game.players}
          roundNumber={
            editingRound ? editingRound.roundNumber : game.rounds.length + 1
          }
          existingRound={editingRound}
          initialPrimieraChoice={initialPrimieraChoice}
          onSave={(roundData) => {
            handleSaveRound(roundData);
            setInitialPrimieraChoice(null);
          }}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRound(null);
            setInitialPrimieraChoice(null);
          }}
        />
      )}
    </>
  );
}
