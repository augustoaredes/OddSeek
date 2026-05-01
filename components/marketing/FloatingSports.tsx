'use client';

// Chips de dados esportivos flutuando — odds, EV%, ROI, estatísticas
const CHIPS = [
  { label: 'EV +11.4%', color: '#C8FC00', dim: false },
  { label: 'Odd 2.10',  color: '#EDEAE3', dim: true  },
  { label: 'ROI +18%',  color: '#00DC6E', dim: false },
  { label: 'EV +8.2%',  color: '#C8FC00', dim: false },
  { label: 'Odd 1.85',  color: '#EDEAE3', dim: true  },
  { label: 'Hit 73%',   color: '#00DC6E', dim: false },
  { label: 'EV +5.7%',  color: '#C8FC00', dim: false },
  { label: 'Odd 3.20',  color: '#EDEAE3', dim: true  },
  { label: '+R$847',    color: '#00DC6E', dim: false },
  { label: 'EV +9.3%',  color: '#C8FC00', dim: false },
  { label: 'Odd 1.72',  color: '#EDEAE3', dim: true  },
  { label: 'EV +12%',   color: '#C8FC00', dim: false },
];

const POSITIONS = [
  { left: '4%',  top: '80%', duration: '18s', delay: '0s'    },
  { left: '13%', top: '72%', duration: '22s', delay: '4s'    },
  { left: '22%', top: '88%', duration: '16s', delay: '8s'    },
  { left: '31%', top: '76%', duration: '20s', delay: '1.5s'  },
  { left: '40%', top: '84%', duration: '24s', delay: '6s'    },
  { left: '50%', top: '78%', duration: '17s', delay: '11s'   },
  { left: '59%', top: '90%', duration: '21s', delay: '2.5s'  },
  { left: '68%', top: '74%', duration: '19s', delay: '7s'    },
  { left: '77%', top: '82%', duration: '15s', delay: '3s'    },
  { left: '86%', top: '70%', duration: '23s', delay: '9s'    },
  { left: '8%',  top: '64%', duration: '20s', delay: '13s'   },
  { left: '72%', top: '66%', duration: '18s', delay: '5s'    },
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
      {POSITIONS.map((pos, i) => {
        const chip = CHIPS[i % CHIPS.length];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: pos.left,
              top: pos.top,
              opacity: 0,
              animation: `floatSport ${pos.duration} ${pos.delay} ease-in-out infinite`,
              background: 'var(--surface)',
              border: `1px solid ${chip.dim ? 'var(--border)' : chip.color + '40'}`,
              borderRadius: 6,
              padding: '4px 9px',
              fontSize: 11,
              fontWeight: 800,
              fontFamily: 'var(--font-cond)',
              letterSpacing: '0.04em',
              color: chip.color,
              whiteSpace: 'nowrap',
              boxShadow: chip.dim ? 'none' : `0 0 10px ${chip.color}22`,
              userSelect: 'none',
            }}
          >
            {chip.label}
          </div>
        );
      })}
    </div>
  );
}
