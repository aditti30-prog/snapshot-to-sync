import { useMemo } from 'react';

const CONFETTI_COLORS = [
  'bg-candy-coral',
  'bg-candy-mint',
  'bg-candy-purple',
  'bg-candy-yellow',
  'bg-candy-blue',
  'bg-candy-pink',
];

const ConfettiBackground = ({ count = 20 }: { count?: number }) => {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        size: 4 + Math.random() * 8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotation: Math.random() * 360,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-sm ${p.color} opacity-20`}
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: p.size,
            height: p.size * 0.6,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall ${3 + Math.random() * 2}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiBackground;
