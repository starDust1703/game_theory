import GameBoard from '@/components/GameBoard';
import { Strategy } from '@/lib/gameLogic';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ strategy: string }>;
}

const STRATEGY_META: Record<string, { name: string; icon: string }> = {
  tit_for_tat:        { name: 'Tit for Tat',          icon: '🤝' },
  tideman_chieruzzi:  { name: 'Tideman & Chieruzzi',   icon: '⚖️' },
  nydegger:           { name: 'Nydegger',              icon: '🧮' },
  grofman:            { name: 'Grofman',               icon: '🎯' },
  shubik:             { name: 'Shubik',                icon: '📈' },
  stein_rapoport:     { name: 'Stein & Rapoport',      icon: '🔬' },
  friedman:           { name: 'Friedman',              icon: '😤' },
  davis:              { name: 'Davis',                 icon: '🛡️' },
  graaskamp:          { name: 'Graaskamp',             icon: '🎭' },
  downing:            { name: 'Downing',               icon: '📊' },
  feld:               { name: 'Feld',                  icon: '📉' },
  joss:               { name: 'Joss',                  icon: '🎰' },
  tullock:            { name: 'Tullock',               icon: '💰' },
  name_withheld:      { name: '(Name Withheld)',       icon: '❓' },
  random:             { name: 'Random',                icon: '🎲' },
  always_cooperate:   { name: 'Always Cooperate',      icon: '👼' },
  always_cheat:       { name: 'Always Cheat',          icon: '😈' },
  detective:          { name: 'Detective',             icon: '🕵️' },
};

export default async function GamePage({ params }: PageProps) {
  const { strategy } = await params;

  if (!STRATEGY_META[strategy]) {
    notFound();
  }

  const { name, icon } = STRATEGY_META[strategy];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <GameBoard
        strategy={strategy as Strategy}
        strategyName={name}
        strategyIcon={icon}
        totalRounds={10}
      />
    </div>
  );
}
