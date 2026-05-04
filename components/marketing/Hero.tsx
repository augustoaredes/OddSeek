import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { SpiralAnimation } from '@/components/ui/spiral-animation';
import { LiveScoreWidget } from './LiveScoreWidget';

interface Props { locale: string }

const mockRows = [
  { match: 'Real Madrid vs PSG', league: 'UCL', odd: '2.10', ev: '+8.2%', ev_color: '#C8FC00', book: 'Bet365', selection: 'Vitória Madrid' },
  { match: 'Man City vs Arsenal', league: 'Premier', odd: '1.85', ev: '+5.7%', ev_color: '#C8FC00', book: 'KTO', selection: 'Ambas Marcam' },
  { match: 'Bayern vs Dortmund', league: 'Bundesliga', odd: '1.95', ev: '+4.1%', ev_color: '#00DC6E', book: 'Betano', selection: 'Over 2.5' },
  { match: 'Flamengo vs Palmeiras', league: 'Brasileirão', odd: '3.20', ev: '+11.8%', ev_color: '#C8FC00', book: 'Pixbet', selection: 'Vitória Flam.' },
  { match: 'LeBron James', league: 'NBA', odd: '1.72', ev: '+9.3%', ev_color: '#C8FC00', book: 'Bet365', selection: 'Over 25.5 pts' },
];

const avatarColors = [
  { bg: '#C8FC00', text: '#000', initials: 'MA' },
  { bg: '#00DC6E', text: '#000', initials: 'JF' },
  { bg: '#4898FF', text: '#fff', initials: 'RL' },
  { bg: '#FFAD00', text: '#000', initials: 'CS' },
  { bg: '#C8FC00', text: '#000', initials: 'BM' },
];

export async function Hero({ locale }: Props) {
  const t = await getTranslations('hero');

  return (
    <section className="hero-v2">
      <DottedSurface />
      <SpiralAnimation />
      <div style={{
        pointerEvents: 'none', position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 70% 45% at 50% 0%, oklch(80% 0.3 115 / 0.10) 0%, transparent 70%)',
        zIndex: 0,
      }} />
      <div className="field-bg" />

      <div className="hero-v2-inner" style={{ position: 'relative', zIndex: 10 }}>
        {/* Badge pill */}
        <div className="hero-v2-badge">
          <span className="hero-v2-badge-dot" />
          {t('badge')}
        </div>

        {/* Headline */}
        <h1 className="hero-v2-h1">
          {t('h1_a')}<br />
          <span className="hero-v2-hl">{t('h1_b')}</span><br />
          <span className="hero-v2-stroke">{t('h1_c')}</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-v2-sub">{t('sub_v2')}</p>

        {/* Email capture */}
        <form action={`/${locale}/registro`} method="GET" className="hero-v2-form">
          <input
            name="email"
            type="email"
            placeholder={t('email_ph')}
            className="hero-v2-input"
            autoComplete="email"
          />
          <button type="submit" className="hero-v2-btn">
            {t('cta')}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>

        {/* Social proof */}
        <div className="hero-v2-social">
          <div className="hero-v2-avatars">
            {avatarColors.map((a, i) => (
              <div
                key={i}
                className="hero-v2-avatar"
                style={{ background: a.bg, color: a.text, zIndex: avatarColors.length - i }}
              >
                {a.initials}
              </div>
            ))}
          </div>
          <div className="hero-v2-social-text">
            <span className="hero-v2-social-num">{t('social_count')}</span> {t('social_text')}
          </div>
        </div>

        {/* App screenshot mockup */}
        <div className="hero-v2-screen-wrap">
          <div className="hero-v2-screen">
            <div className="hero-v2-chrome">
              <div className="hero-v2-dots">
                <span style={{ background: '#FF5F57' }} />
                <span style={{ background: '#FEBC2E' }} />
                <span style={{ background: '#28C840' }} />
              </div>
              <div className="hero-v2-url">oddseek.com/tips</div>
            </div>

            <div className="hero-v2-appnav">
              {['Dashboard', 'Tips EV+', 'Comparador', 'Múltiplas', 'Banca'].map((item, i) => (
                <div key={item} className={`hero-v2-navitem${i === 1 ? ' active' : ''}`}>{item}</div>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF0033', animation: 'pulse 1.2s ease-in-out infinite' }} />
                <span style={{ fontSize: 10, color: '#FF0033', fontWeight: 700 }}>14 ao vivo</span>
              </div>
            </div>

            <div className="hero-v2-thead">
              <div className="hero-v2-th">Partida</div>
              <div className="hero-v2-th">Aposta</div>
              <div className="hero-v2-th hero-v2-th-right">Odd</div>
              <div className="hero-v2-th hero-v2-th-right">EV</div>
              <div className="hero-v2-th hero-v2-th-right">Casa</div>
            </div>

            {mockRows.map((row, i) => (
              <div key={i} className={`hero-v2-trow${i === 0 ? ' hero-v2-trow-best' : ''}`}>
                <div>
                  <div className="hero-v2-match">{row.match}</div>
                  <div className="hero-v2-league">{row.league}</div>
                </div>
                <div className="hero-v2-selection">{row.selection}</div>
                <div className="hero-v2-odd">{row.odd}</div>
                <div className="hero-v2-ev" style={{ color: row.ev_color }}>{row.ev}</div>
                <div className="hero-v2-book">{row.book}</div>
              </div>
            ))}

            <div className="hero-v2-screen-blur" />
          </div>

          <div className="hero-v2-screen-fade" />

          <div className="hero-v2-float hero-v2-float-left">
            <div className="hero-v2-float-icon" style={{ background: 'oklch(80% 0.3 115 / 0.15)' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 12l3-4.5 2.5 2L11 5l2 3" stroke="var(--lime)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--lime)', fontFamily: 'var(--font-cond)', lineHeight: 1.1 }}>+R$3.240</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>lucro este mês</div>
            </div>
          </div>

          <div className="hero-v2-float hero-v2-float-right">
            <div className="hero-v2-float-icon" style={{ background: 'oklch(65% 0.2 150 / 0.15)' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="5.5" stroke="var(--green)" strokeWidth="1.5" />
                <circle cx="8" cy="8" r="2.5" stroke="var(--green)" strokeWidth="1.2" />
                <circle cx="8" cy="8" r=".8" fill="var(--green)" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--font-cond)', lineHeight: 1.1 }}>EV +11.8%</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Flamengo vs Palmeiras</div>
            </div>
          </div>

        </div>

        {/* Placar ao vivo — fora do screen-wrap para não ser cortado pelo overflow:hidden do hero */}
        <div style={{
          marginTop: 20,
          marginBottom: 40,
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 10,
        }}>
          <LiveScoreWidget />
        </div>
      </div>
    </section>
  );
}
