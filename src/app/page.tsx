import StrategyCard from '@/components/StrategyCard';
import { Strategy } from '@/lib/gameLogic';

type StrategyMeta = {
  id: Strategy;
  name: string;
  description: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
};

const STRATEGIES: StrategyMeta[] = [
  // ── The Classics ──────────────────────────────────────────────────────
  {
    id: 'always_cooperate',
    name: 'Always Cooperate',
    icon: '👼',
    difficulty: 'Easy',
    description: 'I will always cooperate, no matter what you do. Pure unconditional trust.',
  },
  {
    id: 'always_cheat',
    name: 'Always Cheat',
    icon: '😈',
    difficulty: 'Easy',
    description: 'I never cooperate. Ever. The world is zero-sum and I intend to win it.',
  },
  {
    id: 'random',
    name: 'Random',
    icon: '🎲',
    difficulty: 'Easy',
    description: 'I flip a coin every round. You\'ll never know what\'s coming next.',
  },
  // ── Axelrod First Tournament ──────────────────────────────────────────
  {
    id: 'tit_for_tat',
    name: 'Tit for Tat',
    icon: '🤝',
    difficulty: 'Medium',
    description: 'Start by cooperating. Then copy exactly what you did last round. The tournament winner.',
  },
  {
    id: 'friedman',
    name: 'Friedman',
    icon: '😤',
    difficulty: 'Medium',
    description: 'I cooperate happily — until you betray me once. Then I hold a grudge for the rest of eternity.',
  },
  {
    id: 'davis',
    name: 'Davis',
    icon: '🛡️',
    difficulty: 'Medium',
    description: 'I cooperate for the opening ten rounds. After that, one betrayal switches me to permanent defection.',
  },
  {
    id: 'joss',
    name: 'Joss',
    icon: '🎰',
    difficulty: 'Medium',
    description: 'I mostly copy you like Tit for Tat, but 10% of the time I\'ll sneak in a defection just to test you.',
  },
  {
    id: 'grofman',
    name: 'Grofman',
    icon: '🎯',
    difficulty: 'Medium',
    description: 'If we both did the same thing last round, I cooperate. Otherwise, I cooperate with just a 2-in-7 chance.',
  },
  {
    id: 'shubik',
    name: 'Shubik',
    icon: '📈',
    difficulty: 'Medium',
    description: 'Each time you betray me, my retaliation gets longer. First time: 1 round. Second: 2 rounds. And so on.',
  },
  {
    id: 'tullock',
    name: 'Tullock',
    icon: '💰',
    difficulty: 'Medium',
    description: 'Economic logic: I cooperate at a rate 10% below your own cooperation rate. You reap what you sow.',
  },
  {
    id: 'feld',
    name: 'Feld',
    icon: '📉',
    difficulty: 'Medium',
    description: 'I start as a fair cooperator, but as the game goes on my willingness to cooperate slowly fades.',
  },
  {
    id: 'nydegger',
    name: 'Nydegger',
    icon: '🧮',
    difficulty: 'Hard',
    description: 'I use a precise 3-round weighted formula to decide every move. Neither purely kind nor purely cruel.',
  },
  {
    id: 'tideman_chieruzzi',
    name: 'Tideman & Chieruzzi',
    icon: '⚖️',
    difficulty: 'Hard',
    description: 'I retaliate more severely after repeated defection runs, while still mirroring ordinary play.',
  },
  {
    id: 'stein_rapoport',
    name: 'Stein & Rapoport',
    icon: '🔬',
    difficulty: 'Hard',
    description: 'I cooperate for four rounds, mirror you through the middle, and grab extra points in the final two.',
  },
  {
    id: 'graaskamp',
    name: 'Graaskamp',
    icon: '🎭',
    difficulty: 'Hard',
    description: 'I play TFT but at the halfway point I probe with a defection to find out if you\'re a pushover.',
  },
  {
    id: 'downing',
    name: 'Downing',
    icon: '📊',
    difficulty: 'Hard',
    description: 'I build a probabilistic model of your behaviour and choose the move with the highest expected payoff.',
  },
  {
    id: 'name_withheld',
    name: '(Name Withheld)',
    icon: '❓',
    difficulty: 'Hard',
    description: 'Submitted anonymously. I start suspicious and adapt my cooperation rate to your every move.',
  },
  {
    id: 'detective',
    name: 'Detective',
    icon: '🕵️',
    difficulty: 'Hard',
    description: 'I run a 4-round diagnostic: Coop, Cheat, Coop, Coop. If you retaliate → I mirror you. If you don\'t → I exploit.',
  },
];

export default function Home() {
  return (
    <div className="container">
      <div className="home-hero">
        <h1 className="home-title">The Evolution of Trust</h1>
        <p className="home-subtitle">
          A simulation of the Prisoner&apos;s Dilemma. Choose a strategy below and discover
          whether cooperation or betrayal wins in the long run.
        </p>
      </div>
      <div className="cards-grid">
        {STRATEGIES.map((s) => (
          <StrategyCard
            key={s.id}
            strategy={s.id}
            name={s.name}
            description={s.description}
            icon={s.icon}
            difficulty={s.difficulty}
          />
        ))}
      </div>
    </div>
  );
}
