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

export const PAUSED_GAMES_STORAGE_KEY = "sweeper_paused_games";

/**
 * LocalStorage helpers for paused games played at a later date
 */
export function loadPausedGames(): GameState[] {
  try {
    const raw = localStorage.getItem(PAUSED_GAMES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (g): g is GameState =>
        Boolean(g) &&
        typeof g === "object" &&
        typeof g.id === "string" &&
        Array.isArray(g.players) &&
        g.players.length > 0 &&
        Array.isArray(g.rounds)
    );
  } catch (err) {
    console.error("Failed to load paused games from localStorage", err);
    return [];
  }
}

export function savePausedGame(game: GameState): GameState[] {
  try {
    const current = loadPausedGames();
    const gameToSave: GameState = {
      ...game,
      savedAt: Date.now(),
    };
    const existingIndex = current.findIndex((g) => g.id === game.id);
    let updated: GameState[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = gameToSave;
    } else {
      updated = [gameToSave, ...current];
    }
    localStorage.setItem(PAUSED_GAMES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Failed to save paused game to localStorage", err);
    return loadPausedGames();
  }
}

export function deletePausedGame(id: string): GameState[] {
  try {
    const current = loadPausedGames();
    const updated = current.filter((g) => g.id !== id);
    localStorage.setItem(PAUSED_GAMES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Failed to delete paused game from localStorage", err);
    return loadPausedGames();
  }
}

export function clearAllPausedGames(): void {
  try {
    localStorage.removeItem(PAUSED_GAMES_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear all paused games from localStorage", err);
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
