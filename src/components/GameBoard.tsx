'use client';

import React, { useState } from 'react';
import { Move, Strategy, RoundResult, getAIMove, calculateScore } from '@/lib/gameLogic';
import Link from 'next/link';

interface Props {
  strategy: Strategy;
  strategyName: string;
  strategyIcon?: string;
  totalRounds?: number;
}

export default function GameBoard({
  strategy,
  strategyName,
  strategyIcon = '?',
  totalRounds = 10,
}: Props) {
  const [history, setHistory] = useState<RoundResult[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lastDelta, setLastDelta] = useState<{ player: number; ai: number } | null>(null);

  const playerScore = history.reduce((acc, r) => acc + r.playerScore, 0);
  const aiScore = history.reduce((acc, r) => acc + r.aiScore, 0);
  const currentRound = history.length + 1;

  const handleMove = (playerMove: Move) => {
    if (isGameOver) return;
    const aiMove = getAIMove(strategy, history, totalRounds);
    const scores = calculateScore(playerMove, aiMove);
    const result: RoundResult = {
      playerMove,
      aiMove,
      playerScore: scores.playerScore,
      aiScore: scores.aiScore,
    };
    const next = [...history, result];
    setHistory(next);
    setLastDelta({ player: scores.playerScore, ai: scores.aiScore });
    if (next.length >= totalRounds) setIsGameOver(true);
  };

  const renderTokens = (moves: Move[]) => {
    const tokens = [];
    for (let i = 0; i < totalRounds; i++) {
      if (i < moves.length) {
        const m = moves[i];
        tokens.push(
          <div key={i} className={`coin ${m === 'COOPERATE' ? 'coin-cooperate' : 'coin-cheat'}`} />,
        );
      } else {
        tokens.push(<div key={i} className="coin coin-empty" />);
      }
    }
    return tokens;
  };

  const playerMoves = history.map(r => r.playerMove);
  const aiMoves = history.map(r => r.aiMove);

  const formatDelta = (v: number) => (v > 0 ? `+${v}` : `${v}`);
  const deltaColor = (v: number) =>
    v > 0 ? '#38e038' : v < 0 ? '#e02020' : '#aaa';

  // ── GAME OVER ────────────────────────────────────────────────────────────
  if (isGameOver) {
    const isWin = playerScore > aiScore;
    const isTie = playerScore === aiScore;
    return (
      <div className="game-page">
        <div className="game-over-banner">
          <h2 className={isWin ? 'result-win' : isTie ? 'result-tie' : 'result-lose'}>
            {isWin ? '🏆 You Win!' : isTie ? "🤝 It's a Tie!" : '💀 You Lost!'}
          </h2>
        </div>

        <div className="score-panel">
          <div className="score-row-board">
            <div className="board-row">
              <div className="row-label-cell"><span>Y</span></div>
              <div className="row-coins">{renderTokens(playerMoves)}</div>
              <div className="row-score-cell">
                <span className="score-number">{playerScore}</span>
              </div>
            </div>
            <div className="board-row">
              <div className="row-label-cell"><span>{strategyIcon}</span></div>
              <div className="row-coins">{renderTokens(aiMoves)}</div>
              <div className="row-score-cell">
                <span className="score-number">{aiScore}</span>
              </div>
            </div>
          </div>
        </div>

        <Link href="/" className="btn-home">⬅ Home</Link>
      </div>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────────────────────
  return (
    <div className="game-page">
      {/* Top bar */}
      <div className="game-top-bar">
        <Link href="/" className="btn-quit">✕ Quit</Link>
        <div className="game-title-bar">
          <span className="opponent-label">VS</span>
          <span className="opponent-name">{strategyIcon} {strategyName}</span>
        </div>
        <div className="round-badge">Round {currentRound} / {totalRounds}</div>
      </div>

      {/* Scoreboard */}
      <div className="score-panel">
        <div className="score-row-board">
          {/* Player row */}
          <div className="board-row">
            <div className="row-label-cell" title="You"><span>Y</span></div>
            <div className="row-coins">{renderTokens(playerMoves)}</div>
            <div className="row-score-cell">
              {lastDelta && (
                <span className="score-delta" style={{ color: deltaColor(lastDelta.player) }}>
                  {formatDelta(lastDelta.player)}
                </span>
              )}
              <span className="score-number">{playerScore}</span>
            </div>
          </div>
          {/* AI row */}
          <div className="board-row">
            <div className="row-label-cell" title={strategyName}><span>{strategyIcon}</span></div>
            <div className="row-coins">{renderTokens(aiMoves)}</div>
            <div className="row-score-cell">
              {lastDelta && (
                <span className="score-delta" style={{ color: deltaColor(lastDelta.ai) }}>
                  {formatDelta(lastDelta.ai)}
                </span>
              )}
              <span className="score-number">{aiScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="legend">
        <span><span className="legend-dot green" /> Cooperate</span>
        <span><span className="legend-dot red" /> Cheat</span>
      </div>

      {/* Action buttons */}
      <div className="action-buttons">
        <button className="action-btn action-cooperate" onClick={() => handleMove('COOPERATE')}>
          <span className="action-icon">🤝</span>
          <span>COOPERATE</span>
        </button>
        <button className="action-btn action-cheat" onClick={() => handleMove('CHEAT')}>
          <span className="action-icon">🗡️</span>
          <span>CHEAT</span>
        </button>
      </div>

      {/* Payout reminder */}
      <div className="payout-info">
        <span>Both coop: <b>+2/+2</b></span>
        <span>Both cheat: <b>0/0</b></span>
        <span>You cheat, they coop: <b>+3/−1</b></span>
        <span>You coop, they cheat: <b>−1/+3</b></span>
      </div>
    </div>
  );
}
