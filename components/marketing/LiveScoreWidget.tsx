'use client';

import { useState, useEffect, useRef } from 'react';

const MATCHES = [
  { sport: '⚽', league: 'Brasileirão',    home: 'Flamengo',    away: 'Palmeiras',  hs: 2, as: 1, min: 67 },
  { sport: '🏀', league: 'NBA · Q3',       home: 'Lakers',      away: 'Celtics',    hs: 98, as: 102, min: 34 },
  { sport: '⚽', league: 'La Liga',        home: 'Real Madrid', away: 'Barcelona',  hs: 1, as: 1, min: 54 },
  { sport: '🎾', league: 'ATP Madrid',     home: 'Alcaraz',     away: 'Djokovic',   hs: 1, as: 0, min: 48 },
  { sport: '⚽', league: 'Premier League', home: 'Man City',    away: 'Arsenal',    hs: 3, as: 2, min: 72 },
];

export function LiveScoreWidget() {
  const idxRef  = useRef(0);
  const [match, setMatch]   = useState(MATCHES[0]);
  const [minute, setMinute] = useState(MATCHES[0].min);
  const [visible, setVisible] = useState(true);

  // Tick minute every second
  useEffect(() => {
    const t = setInterval(() => setMinute(m => m + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Cycle match every 8s
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        idxRef.current = (idxRef.current + 1) % MATCHES.length;
        const next = MATCHES[idxRef.current];
        setMatch(next);
        setMinute(next.min);
        setVisible(true);
      }, 350);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '8px 14px',
        boxShadow: '0 4px 24px #0007',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(4px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}
    >
      {/* Live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--red)',
          boxShadow: '0 0 6px var(--red)',
          animation: 'pulse 1.2s ease-in-out infinite',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--red)', letterSpacing: '0.06em' }}>
          AO VIVO
        </span>
      </div>

      {/* Sport + league */}
      <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
        {match.sport} {match.league}
      </span>

      {/* Score */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        fontFamily: 'var(--font-cond)', fontWeight: 900,
      }}>
        <span style={{ fontSize: 13, color: 'var(--text)' }}>{match.home}</span>
        <span style={{ fontSize: 17, color: 'var(--lime)', letterSpacing: '-0.02em' }}>
          {match.hs} – {match.as}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text)' }}>{match.away}</span>
      </div>

      {/* Minute */}
      <span style={{
        fontSize: 10, color: 'var(--muted)', fontWeight: 700,
        fontFamily: 'var(--font-cond)', flexShrink: 0,
      }}>
        {minute}&apos;
      </span>
    </div>
  );
}
