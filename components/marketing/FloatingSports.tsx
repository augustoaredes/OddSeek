'use client';

const ICONS = ['⚽', '🏀', '🎾', '🥊', '🏈', '🏆', '⚽', '🏀', '🎾', '⚽'];

const PARTICLES = [
  { icon: 0, left: '6%',  top: '85%', size: 22, duration: '16s', delay: '0s'   },
  { icon: 1, left: '15%', top: '70%', size: 16, duration: '20s', delay: '3s'   },
  { icon: 2, left: '24%', top: '90%', size: 18, duration: '14s', delay: '7s'   },
  { icon: 0, left: '33%', top: '75%', size: 26, duration: '18s', delay: '1.5s' },
  { icon: 3, left: '42%', top: '80%', size: 14, duration: '22s', delay: '5s'   },
  { icon: 4, left: '51%', top: '88%', size: 20, duration: '15s', delay: '9s'   },
  { icon: 1, left: '60%', top: '72%', size: 24, duration: '19s', delay: '2s'   },
  { icon: 2, left: '69%', top: '82%', size: 16, duration: '13s', delay: '6s'   },
  { icon: 5, left: '78%', top: '78%', size: 18, duration: '21s', delay: '4s'   },
  { icon: 0, left: '87%', top: '86%', size: 22, duration: '17s', delay: '8s'   },
  { icon: 1, left: '10%', top: '60%', size: 14, duration: '23s', delay: '11s'  },
  { icon: 3, left: '73%', top: '65%', size: 20, duration: '16s', delay: '13s'  },
];

export function FloatingSports() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            fontSize: p.size,
            opacity: 0,
            animation: `floatSport ${p.duration} ${p.delay} ease-in-out infinite`,
            userSelect: 'none',
            filter: 'grayscale(0.2) brightness(0.85)',
          }}
        >
          {ICONS[p.icon]}
        </span>
      ))}
    </div>
  );
}
