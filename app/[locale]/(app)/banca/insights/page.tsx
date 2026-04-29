import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { DEMO_BETS, toSettledBet } from '@/lib/banca/mock-data';
import { betProfit, roi as calcROI, hitRate } from '@/lib/banca/metrics';
import type { SettledBet } from '@/lib/banca/metrics';

export default async function InsightsPage() {
  const locale = await getLocale();

  // Only include non-pending, non-void bets for insights
  const settled: (SettledBet & { sport: string; league: string; selection: string; matchLabel: string; odd: number })[] =
    DEMO_BETS
      .filter(b => b.status !== 'pending' && b.status !== 'void')
      .map(b => {
        const sb = toSettledBet(b);
        if (!sb) return null;
        return { ...sb, sport: b.sport, league: b.league, selection: b.selection, matchLabel: b.matchLabel, odd: b.odd };
      })
      .filter(Boolean) as (SettledBet & { sport: string; league: string; selection: string; matchLabel: string; odd: number })[];

  const sports = [...new Set(settled.map(b => b.sport))];
  const bySport = sports.map(sport => {
    const bets = settled.filter(b => b.sport === sport);
    const profit = bets.reduce((s, b) => s + betProfit(b), 0);
    return { sport, count: bets.length, profit, roi: calcROI(bets), hitRate: hitRate(bets) };
  }).sort((a, b) => b.roi - a.roi);

  const books: string[] = [...new Set(DEMO_BETS.filter(b => b.status !== 'pending' && b.status !== 'void').map(b => b.book))];
  const byBook = books.map(book => {
    const bets = settled.filter((_, i) => DEMO_BETS.filter(b => b.status !== 'pending' && b.status !== 'void')[i]?.book === book);
    const profit = bets.reduce((s, b) => s + betProfit(b), 0);
    return { book, count: bets.length, profit, roi: calcROI(bets) };
  }).sort((a, b) => b.roi - a.roi);

  const bestBets  = [...settled].sort((a, b) => betProfit(b) - betProfit(a)).slice(0, 3);
  const worstBets = [...settled].sort((a, b) => betProfit(a) - betProfit(b)).slice(0, 3);

  const SPORT_EMOJI: Record<string, string> = { football:'⚽', basketball:'🏀', tennis:'🎾', mma:'🥊', baseball:'⚾', hockey:'🏒' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--text)', margin: 0 }}>
            Insights de Banca
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Análise por esporte e casa de apostas</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { href: `/${locale}/banca`,          label: 'Overview' },
            { href: `/${locale}/banca/apostas`,  label: 'Apostas' },
            { href: `/${locale}/banca/insights`, label: 'Insights', active: true },
          ].map(tab => (
            <Link key={tab.href} href={tab.href} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', background: tab.active ? 'var(--lime)' : 'var(--s2)', color: tab.active ? 'var(--bg)' : 'var(--muted)', border: '1px solid var(--border)' }}>
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* By sport */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Por Esporte</div>
          {bySport.map((s, i) => (
            <div key={s.sport} style={{ padding: '12px 20px', borderBottom: i < bySport.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18 }}>{SPORT_EMOJI[s.sport] ?? '🎲'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: 'capitalize' }}>{s.sport}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.count} apostas · {(s.hitRate * 100).toFixed(0)}% acerto</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: s.roi >= 0 ? 'var(--lime)' : 'var(--red)', fontFamily: 'var(--font-cond)' }}>{s.roi >= 0 ? '+' : ''}{s.roi.toFixed(1)}%</div>
                <div style={{ fontSize: 11, color: s.profit >= 0 ? 'var(--green)' : 'var(--red)' }}>{s.profit >= 0 ? '+' : ''}R${s.profit.toFixed(0)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* By book */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Por Casa de Apostas</div>
          {byBook.map((b, i) => (
            <div key={b.book} style={{ padding: '12px 20px', borderBottom: i < byBook.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{b.book}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{b.count} apostas</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: b.roi >= 0 ? 'var(--lime)' : 'var(--red)', fontFamily: 'var(--font-cond)' }}>{b.roi >= 0 ? '+' : ''}{b.roi.toFixed(1)}%</div>
                <div style={{ fontSize: 11, color: b.profit >= 0 ? 'var(--green)' : 'var(--red)' }}>{b.profit >= 0 ? '+' : ''}R${b.profit.toFixed(0)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Best bets */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--green)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Melhores Apostas</div>
          {bestBets.map((bet, i) => (
            <div key={i} style={{ padding: '12px 20px', borderBottom: i < bestBets.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{bet.selection}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{bet.matchLabel} @ {bet.odd.toFixed(2)}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--font-cond)' }}>+R${betProfit(bet).toFixed(1)}</div>
            </div>
          ))}
        </div>

        {/* Worst bets */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--red)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Piores Apostas</div>
          {worstBets.map((bet, i) => (
            <div key={i} style={{ padding: '12px 20px', borderBottom: i < worstBets.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{bet.selection}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{bet.matchLabel} @ {bet.odd.toFixed(2)}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--red)', fontFamily: 'var(--font-cond)' }}>R${betProfit(bet).toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
