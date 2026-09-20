# Agents Instructions

## Command Execution Permissions
- **Pre-Approved Commands:** Do NOT prompt for confirmation or ask permission in chat before executing routine development, testing, linting, and inspection commands:
  - `source ~/.nvm/nvm.sh && nvm use 20 && npm run lint`
  - `source ~/.nvm/nvm.sh && nvm use 20 && npm run build`
  - `source ~/.nvm/nvm.sh && nvm use 20 && npm run test`
  - `source ~/.nvm/nvm.sh && nvm use 20 && npm run dev`
  - `source ~/.nvm/nvm.sh && nvm use 20 && npx ...`
  - Read-only Git inspection commands: `git status`, `git diff`, `git log`
  - Any read/build/lint command invoking `npm`, `npx`, `nvm`, or `source`
  Execute all of these proactively without prompting.

- **Forbidden Git Commands:** NEVER run `git commit`, `git push`, or any command that modifies repository history. The user manually reviews and commits all changes.

## Environment & Tooling
- **Node Version:** Always use Node 20. When running shell commands, prefix with:
  ```bash
  source ~/.nvm/nvm.sh && nvm use 20 && <command>
  ```

## Architecture & Mobile UX Guidelines
- **Framework:** React 19 + TypeScript + Vite + Tailwind CSS v4.
- **Routing:** React Router v8 using `createHashRouter` (for GitHub Pages compatibility).
- **Styling:** Tailwind CSS with emerald green Scopa table theme (`emerald-800`, `emerald-900`, `yellow-300`, `yellow-400`).
- **Mobile-First & Minimal-Scrolling Design:**
  - Maximize mobile-friendliness on small phone screens (320px–400px viewports).
  - Minimize scrolling wherever possible:
    - **No Horizontal Scroll:** Player tabs, count selectors, buttons, and card grids must fill the screen width (`w-full`) using responsive CSS grids (`grid-cols-2`, `grid-cols-3`, `grid-cols-4`, etc.) rather than unbounded horizontal scrolling rows.
    - **Minimize Vertical Scroll:** Keep interactive scoring elements compact and visible above the fold. Collapse setup or configuration button rows (such as player count selectors) once chosen so they do not take up valuable room once scoring starts.
- **Scopa Rules:**
  - Standard Scopa scoring: Carte (most cards, 1 pt), Denari (most coins, 1 pt), Settebello (7 of coins, 1 pt), Primiera (highest primiera score, 1 pt), Scope (each sweep, 1 pt).
  - Standalone Primiera calculator must remain available and independent.
  - Scorecard integrates an embedded Primiera calculation helper that auto-applies winners to rounds.
  - Data persistence: Game state saved in `localStorage` under key `sweeper_active_game`.
