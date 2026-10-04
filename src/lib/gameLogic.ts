export type Move = 'COOPERATE' | 'CHEAT';

export type Strategy =
  | 'tit_for_tat'
  | 'tideman_chieruzzi'
  | 'nydegger'
  | 'grofman'
  | 'shubik'
  | 'stein_rapoport'
  | 'friedman'
  | 'davis'
  | 'graaskamp'
  | 'downing'
  | 'feld'
  | 'joss'
  | 'tullock'
  | 'name_withheld'
  | 'random'
  | 'always_cooperate'
  | 'always_cheat'
  | 'detective';

export interface RoundResult {
  playerMove: Move;
  aiMove: Move;
  playerScore: number;
  aiScore: number;
}

export const PAYOUT_MATRIX = {
  COOPERATE: {
    COOPERATE: { player: 3, ai: 3 },
    CHEAT:     { player: 0, ai: 5 },
  },
  CHEAT: {
    COOPERATE: { player: 5, ai: 0 },
    CHEAT:     { player: 1, ai: 1 },
  },
};

export function calculateScore(
  playerMove: Move,
  aiMove: Move,
): { playerScore: number; aiScore: number } {
  const result = PAYOUT_MATRIX[playerMove][aiMove];
  return { playerScore: result.player, aiScore: result.ai };
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------
export function getAIMove(
  strategy: Strategy,
  history: RoundResult[],
  totalRounds = 10,
): Move {
  const n = history.length;
  const playerMoves = history.map(r => r.playerMove);
  const aiMoves = history.map(r => r.aiMove);
  const last = history[n - 1];

  // Helpers
  const playerEverCheated = playerMoves.includes('CHEAT');
  const playerCoopRate = (slice: RoundResult[]) =>
    slice.length === 0 ? 1 : slice.filter(r => r.playerMove === 'COOPERATE').length / slice.length;
  const coin = (p: number): Move => (Math.random() < p ? 'COOPERATE' : 'CHEAT');

  switch (strategy) {
    // ── Classic simples ────────────────────────────────────────────────────
    case 'always_cooperate':
      return 'COOPERATE';

    case 'always_cheat':
      return 'CHEAT';

    case 'random':
      return coin(0.5);

    // ── Tit for Tat (Rapoport / Axelrod winner) ────────────────────────────
    // Cooperate on round 1; then copy opponent's last move exactly.
    case 'tit_for_tat':
      if (n === 0) return 'COOPERATE';
      return last.playerMove;

    // ── Friedman / Grim Trigger ────────────────────────────────────────────
    // Cooperate until the opponent defects once; then defect forever.
    case 'friedman':
      return playerEverCheated ? 'CHEAT' : 'COOPERATE';

    // ── Davis ─────────────────────────────────────────────────────────────
    // Cooperates for the first 10 moves. If opponent has defected at any point
    // during (or after) those 10 moves, switches to permanent defection.
    case 'davis': {
      const PROBE_ROUNDS = Math.min(10, totalRounds);
      if (n < PROBE_ROUNDS) return 'COOPERATE';
      return playerEverCheated ? 'CHEAT' : 'COOPERATE';
    }

    // ── Joss ───────────────────────────────────────────────────────────────
    // Like TFT but when it would cooperate, has a 10 % chance to defect instead.
    case 'joss': {
      if (n === 0) return 'COOPERATE';
      if (last.playerMove === 'CHEAT') return 'CHEAT';
      return coin(0.9); // 90 % cooperate, 10 % sneak defect
    }

    // ── Tullock ────────────────────────────────────────────────────────────
    // Cooperates for the first 11 rounds; then cooperates at a rate 10 % lower
    // than the opponent's cooperation rate over the last 10 moves.
    case 'tullock': {
      const INIT = Math.min(11, totalRounds);
      if (n < INIT) return 'COOPERATE';
      const window = history.slice(-10);
      const rate = playerCoopRate(window);
      return coin(Math.max(0, rate - 0.1));
    }

    // ── Grofman ────────────────────────────────────────────────────────────
    // Cooperate on the first move. If both players made the same move last
    // round → cooperate. Otherwise cooperate with probability 2/7.
    case 'grofman': {
      if (n === 0) return 'COOPERATE';
      const sameLastRound = last.playerMove === last.aiMove;
      return sameLastRound ? 'COOPERATE' : coin(2 / 7);
    }

    // ── Shubik ─────────────────────────────────────────────────────────────
    // Cooperate. When opponent defects, retaliate for K rounds, then K++.
    // K starts at 1 and escalates every time a new punishment cycle starts.
    case 'shubik': {
      let punishLevel = 0;     // how many rounds the NEXT punishment lasts
      let punishLeft = 0;      // rounds remaining in current punishment
      for (const r of history) {
        if (punishLeft > 0) punishLeft--;
        if (r.playerMove === 'CHEAT' && r.aiMove === 'COOPERATE') {
          punishLevel++;
          punishLeft = punishLevel;
        }
      }
      return punishLeft > 0 ? 'CHEAT' : 'COOPERATE';
    }

    // ── Tideman & Chieruzzi ────────────────────────────────────────────────
    // Like Shubik, but after the second defection run it adds an extra
    // punishment and escalates the punishment after later runs.
    case 'tideman_chieruzzi': {
      if (n === 0) return 'COOPERATE';
      if (n >= totalRounds - 2) return 'CHEAT';

      let defectionRuns = 0;
      let punishmentLeft = 0;
      let previousPlayerMove: Move = 'COOPERATE';
      for (const r of history) {
        if (punishmentLeft > 0) punishmentLeft--;
        const startsRun = r.playerMove === 'CHEAT' && previousPlayerMove !== 'CHEAT';
        if (startsRun) {
          defectionRuns++;
          punishmentLeft = Math.max(punishmentLeft, defectionRuns - 1);
        }
        previousPlayerMove = r.playerMove;
      }
      if (punishmentLeft > 0) return 'CHEAT';
      return last.playerMove;
    }

    // ── Nydegger ──────────────────────────────────────────────────────────
    // Uses TFT for the first three moves, with Nydegger's special early
    // sequence, then a weighted three-outcome history rule.
    case 'nydegger': {
      const firstWasOnlyCooperator =
        n > 0 && history[0].aiMove === 'COOPERATE' && history[0].playerMove === 'CHEAT';
      const secondWasOnlyDefector =
        n > 1 && history[1].aiMove === 'CHEAT' && history[1].playerMove === 'COOPERATE';
      if (n === 0) return 'COOPERATE';
      if (n === 1) return history[0].playerMove;
      if (n === 2) {
        return firstWasOnlyCooperator && secondWasOnlyDefector
          ? 'CHEAT'
          : history[1].playerMove;
      }

      const score = (round: RoundResult) =>
        (round.playerMove === 'CHEAT' ? 2 : 0) +
        (round.aiMove === 'CHEAT' ? 1 : 0);
      const recent = history.slice(-3);
      const A = 16 * score(recent[0]) + 4 * score(recent[1]) + score(recent[2]);
      const defectScores = [1, 6, 7, 17, 22, 23, 26, 29, 30, 31, 33, 38, 39, 45, 49, 54, 55, 58, 61];
      return defectScores.includes(A) ? 'CHEAT' : 'COOPERATE';
    }

    // ── Stein & Rapoport ──────────────────────────────────────────────────
    // Cooperates for first 4 moves. Defects on last 2 rounds (end-game grab).
    // In-between: defects if opponent's recent defection rate > 20 %.
    case 'stein_rapoport': {
      if (n < 4) return 'COOPERATE';
      if (n >= totalRounds - 2) return 'CHEAT'; // end-game defection
      return last.playerMove;
    }

    // ── Graaskamp ─────────────────────────────────────────────────────────
    // Plays TFT for most of the game, then probes on round 5 (scaled).
    // If the opponent cooperated despite the probe → exploit forever.
    // Otherwise reverts to TFT.
    case 'graaskamp': {
      if (n === 0) return 'COOPERATE';
      const PROBE_ROUND = Math.floor(totalRounds / 2); // e.g. round 5 in a 10-round game
      if (n === PROBE_ROUND) return 'CHEAT'; // probe
      if (n > PROBE_ROUND) {
        const opponentIgnoredProbe = history[PROBE_ROUND]?.playerMove === 'COOPERATE';
        if (opponentIgnoredProbe) return 'CHEAT'; // exploit pushover
      }
      return last.playerMove; // TFT otherwise
    }

    // ── Downing (Revised) ─────────────────────────────────────────────────
    // Estimates P(opp cooperates | I cooperated) and P(opp cooperates | I defected)
    // then chooses the action with the higher expected payoff.
    // Starts with two cooperative rounds to gather data.
    case 'downing': {
      if (n < 2) return 'COOPERATE';
      let cc = 0, myCoopCount = 0, dc = 0, myDefectCount = 0;
      for (let i = 0; i < n - 1; i++) {
        if (aiMoves[i] === 'COOPERATE') {
          myCoopCount++;
          if (playerMoves[i + 1] === 'COOPERATE') cc++;
        } else {
          myDefectCount++;
          if (playerMoves[i + 1] === 'COOPERATE') dc++;
        }
      }
      const pCC = myCoopCount > 0 ? cc / myCoopCount : 0.5;
      const pDC = myDefectCount > 0 ? dc / myDefectCount : 0.5;
      // Expected payoff for the current payoff matrix:
      // cooperate → 3·pCC ; defect → 1 + 4·pDC
      const eC = 3 * pCC;
      const eD = 1 + 4 * pDC;
      return eD > eC ? 'CHEAT' : 'COOPERATE';
    }

    // ── Feld ──────────────────────────────────────────────────────────────
    // Starts as TFT. When it would cooperate (because opponent cooperated),
    // the probability of actually cooperating decreases linearly from 1.0
    // down to 0.5 as the game progresses.
    case 'feld': {
      if (n === 0) return 'COOPERATE';
      if (last.playerMove === 'CHEAT') return 'CHEAT'; // retaliate
      const progress = n / totalRounds; // 0 → 1
      const coopProb = 1.0 - 0.5 * progress; // 1.0 → 0.5
      return coin(coopProb);
    }

    // ── (Name Withheld) ───────────────────────────────────────────────────
    // Submitted anonymously. Starts with P(cooperate) = 30 % and adjusts
    // every ~3 rounds based on the opponent's behaviour.
    // Also checks if trailing by a large margin and boosts defection if so.
    case 'name_withheld': {
      if (n === 0) return coin(0.3); // initial 30 % cooperation
      const window = history.slice(-3);
      const opponentCoopRate = playerCoopRate(window);
      let p: number;
      if (opponentCoopRate > 0.7)       p = 0.6; // opponent very cooperative → moderate coop
      else if (opponentCoopRate < 0.3)  p = 0.1; // opponent cheating a lot → mostly defect
      else                               p = 0.3; // uncertain → low coop
      // If trailing by more than 6 points, cut cooperation
      const myScore = history.reduce((s, r) => s + r.aiScore, 0);
      const theirScore = history.reduce((s, r) => s + r.playerScore, 0);
      if (theirScore - myScore > 6) p = Math.max(0, p - 0.2);
      return coin(p);
    }

    // ── Detective ─────────────────────────────────────────────────────────
    // Probes with sequence: C, D, C, C.
    // If opponent ever retaliates → plays TFT for the rest.
    // If opponent never retaliates → exploits with Always Cheat.
    case 'detective': {
      const probe = ['COOPERATE', 'CHEAT', 'COOPERATE', 'COOPERATE'] as Move[];
      if (n < 4) return probe[n];
      const probePhase = history.slice(0, 4).map(r => r.playerMove);
      if (probePhase.includes('CHEAT')) return last.playerMove; // TFT
      return 'CHEAT'; // exploit
    }

    default:
      return 'COOPERATE';
  }
}
