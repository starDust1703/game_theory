# Developer Guide

This document explains the application flow and the safest way to extend the game.

## Runtime flow

### 1. Strategy selection

`src/app/page.tsx` owns the home screen and the `STRATEGIES` metadata list. Each item contains:

- the internal `Strategy` slug;
- the display name and icon;
- a short description;
- a difficulty label.

`StrategyCard` renders the item and links to `/game/{strategy}`. The slug is the value used by the game engine, so it must remain stable once published.

### 2. Strategy route

`src/app/game/[strategy]/page.tsx` is a dynamic App Router page. It:

1. reads the strategy slug from the route parameters;
2. looks it up in `STRATEGY_META`;
3. calls `notFound()` for an unknown slug;
4. passes the selected strategy, name, icon, and round count to `GameBoard`.

The current match length is ten rounds.

### 3. Round lifecycle

`GameBoard` is a client component because it owns interactive state. Its `history` array contains one `RoundResult` per completed round.

When the player clicks a move:

1. `getAIMove(strategy, history, totalRounds)` calculates the opponent’s move using only completed rounds.
2. `calculateScore(playerMove, aiMove)` applies the Prisoner’s Dilemma payoff matrix.
3. A new `RoundResult` is appended to `history`.
4. The score delta and cumulative scores are re-rendered.
5. After ten completed rounds, `isGameOver` switches the component to the results view.

The AI move is calculated before the new round is appended. This prevents a strategy from seeing the player’s current move while deciding its response.

## Core types and scoring

The main types live in `src/lib/gameLogic.ts`:

```ts
type Move = 'COOPERATE' | 'CHEAT';

interface RoundResult {
  playerMove: Move;
  aiMove: Move;
  playerScore: number;
  aiScore: number;
}
```

The payoff matrix is:

```text
                       Opponent cooperates   Opponent cheats
Player cooperates              3 / 3               0 / 5
Player cheats                   5 / 0               1 / 1
```

The first value is the player’s score and the second is the opponent’s score.

Inside the code, `CHEAT` is the defection action from the traditional Prisoner’s Dilemma terminology.

## Strategy engine

`getAIMove` is the single strategy dispatcher. It receives the strategy slug, previous round history, and match length, then returns one `Move`.

The currently available strategies are:

- `tit_for_tat`
- `tideman_chieruzzi`
- `nydegger`
- `grofman`
- `shubik`
- `stein_rapoport`
- `friedman`
- `davis`
- `graaskamp`
- `downing`
- `feld`
- `joss`
- `tullock`
- `name_withheld`
- `random`
- `always_cooperate`
- `always_cheat`
- `detective`

Some strategies are deterministic. `random`, `joss`, `feld`, `grofman`, `tullock`, and `name_withheld` use `Math.random()`, so repeated games against them can produce different move sequences.

The historical strategies were designed for longer tournaments. This implementation adapts their timing and memory rules to the app’s ten-round match. If the match length changes, review any strategy thresholds that depend on opening rounds, endgame rounds, or history windows.

## Adding a strategy

Use the following checklist:

1. Add a new string literal to the `Strategy` union in `src/lib/gameLogic.ts`.
2. Add a `case` to `getAIMove`.
3. Add the strategy’s display metadata to `STRATEGIES` in `src/app/page.tsx`.
4. Add the same slug, name, and icon to `STRATEGY_META` in `src/app/game/[strategy]/page.tsx`.
5. Keep the behavior based on the existing `history` shape. Do not mutate history inside the strategy dispatcher.
6. Run the type-check and production build.

Example strategy case:

```ts
case 'my_strategy':
  if (history.length === 0) return 'COOPERATE';
  return history[history.length - 1].playerMove;
```

If a strategy needs extra state, prefer deriving it from `history` rather than adding another state store. That keeps replay behavior predictable and makes every move a pure result of the selected strategy and previous rounds.

## Styling and components

`src/app/globals.css` contains the game’s visual system: colors, strategy cards, scoreboard rows, move coins, action buttons, responsive behavior, and game-over states.

`StrategyCard` is intentionally presentational. Game state belongs in `GameBoard`, not in the card or route page.

When changing the scoreboard layout, check both the in-progress view and the game-over view. They share the same coin and score styles but render different controls.

## Validation

Run these checks before handing off changes:

```bash
npx tsc --noEmit
npm run build
npm run lint
```

There are currently no automated unit tests. For a manual smoke test, verify that the home page opens, every strategy card links successfully, both player buttons work, the scoreboard reaches round ten, and the final screen returns to the home page.

## Deployment

Build the app with `npm run build` and serve it with `npm start`. The project is a standard Next.js App Router application and can also be deployed through a Next.js-compatible host such as Vercel.
