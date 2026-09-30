import type { GameState } from "../types";
import { loadGameHistory } from "./historyStorage";

export const STORAGE_KEY = "sweeper_active_game";
export const RECENT_PLAYERS_STORAGE_KEY = "sweeper_recent_players";

/**
 * LocalStorage helpers for active game state
 */
export function saveGameState(game: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
  } catch (err) {
    console.error("Failed to save game state to localStorage", err);
  }
}

export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray(parsed.players) ||
      parsed.players.length === 0 ||
      !Array.isArray(parsed.rounds)
    ) {
      return null;
    }
    return parsed as GameState;
  } catch (err) {
    console.error("Failed to load game state from localStorage", err);
    return null;
  }
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear game state from localStorage", err);
  }
}

/**
 * Remembered player names helpers for GameSetup
 */
export function saveRecentPlayerNames(playerCount: number, names: string[]): void {
  try {
    const raw = localStorage.getItem(RECENT_PLAYERS_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : {};
    existing[playerCount] = names;
    localStorage.setItem(RECENT_PLAYERS_STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error("Failed to save recent player names to localStorage", err);
  }
}

export function loadRecentPlayerNames(playerCount: number): string[] | null {
  try {
    const raw = localStorage.getItem(RECENT_PLAYERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed[playerCount]) && parsed[playerCount].length > 0) {
        return parsed[playerCount];
      }
    }
    // Fallback: check most recent matching game from history
    const history = loadGameHistory();
    const matchingGame = history.find(
      (g) => g.players.length === (playerCount === 4 ? 4 : playerCount),
    );
    if (matchingGame) {
      return matchingGame.players.map((p) => p.name);
    }
    return null;
  } catch (err) {
    console.error("Failed to load recent player names from localStorage", err);
    return null;
  }
}
