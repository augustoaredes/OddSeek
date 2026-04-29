'use client';

import dynamic from 'next/dynamic';

const StatsBand = dynamic(
  () => import('./StatsBand').then((m) => m.StatsBand),
  { ssr: false, loading: () => <div className="stats-band" /> }
);

export function StatsBandClient() {
  return <StatsBand />;
}
