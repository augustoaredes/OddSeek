import type { ReactNode } from 'react';
import { MarketingNav } from '@/components/layout/MarketingNav';
import { LiveTicker } from '@/components/layout/LiveTicker';
import { MarketingFooter } from '@/components/layout/MarketingFooter';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <MarketingNav />
      <LiveTicker />
      <main style={{ paddingTop: '90px' }}>{children}</main>
      <MarketingFooter />
    </div>
  );
}
