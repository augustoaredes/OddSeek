import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

interface Props { locale: string }

const leaders = [
  { rank: 1, rankClass: 'gold', initials: 'MA', avatarBg: 'oklch(75% 0.16 75 / 0.15)', avatarBorder: 'var(--amber)', name: 'Mateus A.', sub: '247 apostas · Futebol', roi: '+34.2%', streak: '12 acertos' },
  { rank: 2, rankClass: 'silver', initials: 'JF', avatarBg: 'oklch(80% 0 0 / 0.1)', avatarBorder: 'oklch(80% 0 0 / 0.3)', name: 'Julia F.', sub: '189 apostas · Multi', roi: '+28.7%', streak: '9 acertos' },
  { rank: 3, rankClass: 'bronze', initials: 'RL', avatarBg: 'oklch(65% 0.08 50 / 0.12)', avatarBorder: 'oklch(65% 0.08 50 / 0.3)', name: 'Rafael L.', sub: '312 apostas · NBA', roi: '+22.1%', streak: '7 acertos' },
  { rank: 4, rankClass: '', initials: 'CS', avatarBg: 'oklch(65% 0.28 285 / 0.12)', avatarBorder: 'oklch(65% 0.28 285 / 0.3)', name: 'Carlos S.', sub: '156 apostas · Tênis', roi: '+19.4%', streak: '5 acertos' },
  { rank: 5, rankClass: '', initials: 'BM', avatarBg: 'oklch(70% 0.2 150 / 0.1)', avatarBorder: 'oklch(70% 0.2 150 / 0.3)', name: 'Beatriz M.', sub: '98 apostas · E-Sports', roi: '+17.8%', streak: '4 acertos' },
];

export async function CommunitySection({ locale }: Props) {
  const t = await getTranslations('community');

  return (
    <section className="section" id="comunidade">
      <div className="si">
        <div className="comm-grid">
          <div>
            <div className="stag">{t('tag')}</div>
            <h2 className="sh">
              {t('h')}<br /><em>{t('h_em')}</em>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.72, marginTop: 20, marginBottom: 32 }}>
              {t('sub')}
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['Histórico verificado', 'Copy betting'].map((label) => (
                <div key={label} style={{ padding: '10px 18px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, color: 'var(--muted)' }}>
                  {label}
                </div>
              ))}
              <div style={{ padding: '10px 18px', border: '1px solid oklch(80% 0.3 115 / 0.3)', borderRadius: 7, fontSize: 13, color: 'var(--lime)', background: 'oklch(80% 0.3 115 / 0.06)' }}>
                Programa de afiliados
              </div>
            </div>
          </div>

          <div className="leaderboard">
            <div className="lb-head">
              <div className="lb-title">{t('leaderboard')} · Maio 2026</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t('period')}</div>
            </div>

            {leaders.map((l) => (
              <Link key={l.rank} href={`/${locale}/ranking`} className="lb-row" style={{ display: 'flex' }}>
                <div className={`lb-rank${l.rankClass ? ' ' + l.rankClass : ''}`}>{l.rank}</div>
                <div className="lb-avatar" style={{ background: l.avatarBg, borderColor: l.avatarBorder }}>
                  {l.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="lb-name">{l.name}</div>
                  <div className="lb-sub">{l.sub}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="lb-roi">{l.roi}</div>
                  <div className="lb-streak">{l.streak} {t('streak')}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
