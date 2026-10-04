import React from 'react';
import Link from 'next/link';
import { Strategy } from '@/lib/gameLogic';

interface Props {
  strategy: Strategy;
  name: string;
  description: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export default function StrategyCard({ strategy, name, description, icon, difficulty }: Props) {
  const diffColor: Record<string, string> = {
    Easy: '#38e038',
    Medium: '#f0c040',
    Hard: '#e02020',
  };
  return (
    <Link href={`/game/${strategy}`}>
      <div className="strategy-card">
        <div className="strategy-icon">{icon}</div>
        <div className="strategy-name">{name}</div>
        <div className="strategy-desc">{description}</div>
        <div
          style={{
            marginTop: '0.75rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: diffColor[difficulty],
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          {difficulty}
        </div>
      </div>
    </Link>
  );
}
