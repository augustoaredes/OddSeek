import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { MOCK_LEADERBOARD } from '@/lib/community/mock-data';

export default async function RankingPage() {
  const locale = await getLocale();
  const entries = MOCK_LEADERBOARD;

  const medals = ['🥇', '🥈', '🥉'];

  function Avatar({ initials, size = 36 }: { initials: string; size?: number }) {
    return (
      <span style={{ width: size, height: size, borderRadius: '50%', background: 'var(--dim)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 800, color: 'var(--lime)', flexShrink: 0, fontFamily: 'var(--font-cond)' }}>
        {initials}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--text)', margin: 0 }}>
          Ranking Global
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
          Top traders por ROI · últimos 30 dias
        </p>
      </div>

      {/* Period filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {['7 dias', '30 dias', 'Tudo'].map((p, i) => (
          <button key={p} className={`stab${i === 1 ? ' on' : ''}`}>{p}</button>
        ))}
        <span style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />
        {['ROI', 'Acerto', 'Lucro'].map((s, i) => (
          <button key={s} className={`stab${i === 0 ? ' on' : ''}`}>{s}</button>
        ))}
      </div>

      {/* Top 3 cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 24 }}>
        {entries.slice(0, 3).map(entry => (
          <Link key={entry.user.handle} href={`/${locale}/perfil/${entry.user.handle}`} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--surface)', border: `1px solid ${entry.rank === 1 ? 'oklch(80% 0.3 115 / 0.4)' : 'var(--border)'}`, borderRadius: 12, padding: '20px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 24 }}>{medals[entry.rank - 1]}</div>
              <Avatar initials={entry.user.avatar} size={44} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{entry.user.name}</div>
                {entry.user.verified && <div style={{ fontSize: 10, color: 'var(--lime)', fontWeight: 700 }}>✓ Verificado</div>}
              </div>
              <div style={{ fontFamily: 'var(--font-cond)', fontSize: 28, fontWeight: 900, color: 'var(--lime)', lineHeight: 1 }}>
                +{entry.roi.toFixed(1)}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>ROI · {entry.totalBets} apostas</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Full table */}
      <div className="table-wrap wide">
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 80px 80px 90px 70px', gap: 12, padding: '10px 20px', background: 'var(--s2)', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            <div>#</div><div>Trader</div><div style={{ textAlign: 'right' }}>ROI</div><div style={{ textAlign: 'right' }}>Acerto</div><div style={{ textAlign: 'right' }}>Lucro</div><div style={{ textAlign: 'right' }}>Apostas</div>
          </div>

          {entries.map((entry, i) => (
            <Link key={entry.user.handle} href={`/${locale}/perfil/${entry.user.handle}`} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 80px 80px 90px 70px', gap: 12, padding: '12px 20px', borderBottom: i < entries.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 900, fontFamily: 'var(--font-cond)', color: entry.rank <= 3 ? 'var(--lime)' : 'var(--dim)', textAlign: 'center' }}>
                  {entry.rank <= 3 ? medals[entry.rank - 1] : entry.rank}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar initials={entry.user.avatar} size={32} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {entry.user.name}
                      {entry.user.verified && <span style={{ fontSize: 9, color: 'var(--lime)' }}>✓</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--dim)' }}>@{entry.user.handle}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 800, color: 'var(--lime)', fontFamily: 'var(--font-cond)' }}>+{entry.roi.toFixed(1)}%</div>
                <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text)' }}>{(entry.hitRate * 100).toFixed(0)}%</div>
                <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--green)', fontWeight: 700 }}>+R${entry.totalProfit.toLocaleString('pt-BR')}</div>
                <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--muted)' }}>{entry.totalBets}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
