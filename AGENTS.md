# Agents Instructions

## Command Execution Permissions
- **Pre-Approved Commands:** Do NOT prompt for confirmation or ask permission in chat before executing routine development, testing, linting, and inspection commands:
  - `source ~/.nvm/nvm.sh && nvm use 20 && npm run lint`
  - `source ~/.nvm/nvm.sh && nvm use 20 && npm run build`
  - `source ~/.nvm/nvm.sh && nvm use 20 && npm run test`
  - `source ~/.nvm/nvm.sh && nvm use 20 && npm run dev`
  - `source ~/.nvm/nvm.sh && nvm use 20 && npx ...`
  - `source ~/.nvm/nvm.sh && nvm use 20 && git ...`
  - Any command invoking `npm`, `npx`, `nvm`, `source`, or `git status` / `git diff`
  Execute all of these proactively without prompting.

## Environment & Tooling
- **Node Version:** Always use Node 20. When running shell commands, prefix with:
  ```bash
  source ~/.nvm/nvm.sh && nvm use 20 && <command>
  ```

## Architecture Guidelines
- **Framework:** React 19 + TypeScript + Vite + Tailwind CSS v4.
- **Routing:** React Router v8 using `createHashRouter` (for GitHub Pages compatibility).
- **Styling:** Tailwind CSS with emerald green Scopa table theme (`emerald-800`, `emerald-900`, `yellow-300`, `yellow-400`).
- **Scopa Rules:**
  - Standard Scopa scoring: Carte (most cards, 1 pt), Denari (most coins, 1 pt), Settebello (7 of coins, 1 pt), Primiera (highest primiera score, 1 pt), Scope (each sweep, 1 pt).
  - Standalone Primiera calculator must remain available and independent.
  - Scorecard integrates an embedded Primiera calculation helper that auto-applies winners to rounds.
  - Data persistence: Game state saved in `localStorage` under key `sweeper_active_game`.
