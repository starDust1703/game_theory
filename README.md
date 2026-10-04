# The Evolution of Trust

The Evolution of Trust is a small Next.js game based on the iterated Prisoner’s Dilemma. The player chooses a strategy, plays ten rounds against it, and compares the resulting scores.

## Getting started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

Available scripts:

- `npm run dev` starts the development server.
- `npm run build` creates a production build.
- `npm start` serves the production build.
- `npm run lint` runs ESLint.

## How the game works

The home page displays the available strategies. Selecting a card opens `/game/[strategy]`, where the strategy slug identifies the opponent. The player chooses Cooperate or Cheat once per round. The opponent’s move is calculated from the previous round history, both moves are scored, and the round is added to the scoreboard. After ten rounds, the final result is shown.

For the detailed code flow and extension guide, see [`docs/dev.md`](docs/dev.md).

## Project structure

```text
src/
├── app/
│   ├── page.tsx                 # Strategy selection screen
│   ├── game/[strategy]/page.tsx # Strategy game route
│   ├── layout.tsx               # Global metadata and font
│   └── globals.css              # Global visual styling
├── components/
│   ├── StrategyCard.tsx          # Strategy selection card
│   └── GameBoard.tsx             # Interactive game and scoreboard
└── lib/
    └── gameLogic.ts              # Moves, scoring, history, and strategy rules
```

## Game theory references

The strategy names and core behaviors are based on Robert Axelrod’s iterated Prisoner’s Dilemma tournament. The app uses a compact ten-round adaptation so the strategies remain easy to play interactively.
