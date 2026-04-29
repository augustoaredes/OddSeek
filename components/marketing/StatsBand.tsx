'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

function useCounter(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, target, duration]);

  return { value, ref };
}

function StatItem({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { value, ref } = useCounter(target);
  return (
    <div className="stat" ref={ref}>
      <div className="stat-num">
        <span>{value}</span>
        <b>{suffix}</b>
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function StatsBand() {
  const t = useTranslations('stats');
  return (
    <div className="stats-band">
      <div className="stats-inner">
        <StatItem target={73} suffix="%" label={t('hit_rate')} />
        <StatItem target={120} suffix="k+" label={t('odds_analyzed')} />
        <StatItem target={32} suffix="+" label={`casas monitoradas`} />
        <StatItem target={48} suffix="k" label={t('users')} />
      </div>
    </div>
  );
}
