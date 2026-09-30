/**
 * Barrel re-export for scorecard and game persistence helpers.
 * Separated into modular utilities:
 * - scorecardLogic: Scopa round calculation, score recalculation, card auto-fill
 * - gameStateStorage: Active game state & recent player persistence
 * - historyStorage: Match history, backup import/export, matchup aggregation
 */

export * from "./scorecardLogic";
export * from "./gameStateStorage";
export * from "./historyStorage";
