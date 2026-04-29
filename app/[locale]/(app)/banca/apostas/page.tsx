import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { DEMO_BETS, toSettledBet } from '@/lib/banca/mock-data';
import { totalProfit, roi as calcROI } from '@/lib/banca/metrics';

export default async function ApostasPage() {
  const locale = await getLocale();
  const bets = [...DEMO_BETS].sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
  const settled = bets.map(toSettledBet).filter(Boolean).map(b => b!);
  const profit = totalProfit(settled);
  const roiValue = calcROI(settled);

  const statusColor = (s: string) =>
    s === 'won' ? 'var(--green)' : s === 'lost' ? 'var(--red)' : s === 'pending' ? 'var(--amber)' : 'var(--muted)';

  const statusLabel = (s: string) =>
    ({ won: 'Ganhou', lost: 'Perdeu', pending: 'Pendente', void: 'Void', cashout: 'Cashout' }[s] ?? s);

  const profitDisplay = (bet: typeof bets[0]) => {
    const sb = toSettledBet(bet);
    if (!sb) return '—';
    if (sb.status === 'won')  return `+R$${(sb.stake * (sb.odd - 1)).toFixed(1)}`;
    if (sb.status === 'lost') return `-R$${sb.stake.toFixed(0)}`;
    return 'R$0';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--text)', margin: 0 }}>
            Histórico de Apostas
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            {bets.length} apostas · ROI {roiValue >= 0 ? '+' : ''}{roiValue.toFixed(1)}% · Lucro R${profit.toFixed(2)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { href: `/${locale}/banca`,          label: 'Overview' },
            { href: `/${locale}/banca/apostas`,  label: 'Apostas', active: true },
            { href: `/${locale}/banca/insights`, label: 'Insights' },
          ].map(tab => (
            <Link key={tab.href} href={tab.href} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', background: tab.active ? 'var(--lime)' : 'var(--s2)', color: tab.active ? 'var(--bg)' : 'var(--muted)', border: '1px solid var(--border)' }}>
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="table-wrap wide">
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 70px 70px 80px 70px 80px', gap: 12, padding: '10px 20px', background: 'var(--s2)', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            <div>Seleção</div><div>Liga</div><div style={{ textAlign: 'right' }}>Odd</div><div style={{ textAlign: 'right' }}>Stake</div><div style={{ textAlign: 'center' }}>Status</div><div style={{ textAlign: 'right' }}>Resultado</div><div style={{ textAlign: 'right' }}>Data</div>
          </div>

          {bets.map((bet, i) => (
            <div key={bet.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 70px 70px 80px 70px 80px', gap: 12, padding: '11px 20px', borderBottom: i < bets.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{bet.selection}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{bet.matchLabel} · {bet.market}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>{bet.league}</div>
              <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{bet.odd.toFixed(2)}</div>
              <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text)' }}>R${bet.stake}</div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: statusColor(bet.status), background: `${statusColor(bet.status)}22`, padding: '3px 8px', borderRadius: 4 }}>
                  {statusLabel(bet.status)}
                </span>
              </div>
              <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: bet.status === 'won' ? 'var(--green)' : bet.status === 'lost' ? 'var(--red)' : 'var(--muted)' }}>
                {profitDisplay(bet)}
              </div>
              <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--dim)' }}>
                {new Date(bet.placedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20, padding: '16px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Registrar nova aposta</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Registre via tip sugerida ou manualmente</div>
        </div>
        <Link href={`/${locale}/tips`} className="btn btn-lime" style={{ fontSize: 12 }}>Ver Tips</Link>
      </div>
    </div>
  );
}
