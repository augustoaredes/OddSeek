import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { DottedSurface } from '@/components/ui/dotted-surface';

interface Props { locale: string }

const mockRows = [
  { match: 'Real Madrid vs PSG', league: 'UCL', odd: '2.10', ev: '+8.2%', ev_color: '#C8FC00', book: 'Bet365', selection: 'Vitória Madrid' },
  { match: 'Man City vs Arsenal', league: 'Premier', odd: '1.85', ev: '+5.7%', ev_color: '#C8FC00', book: 'KTO', selection: 'Ambas Marcam' },
  { match: 'Bayern vs Dortmund', league: 'Bundesliga', odd: '1.95', ev: '+4.1%', ev_color: '#00DC6E', book: 'Betano', selection: 'Over 2.5' },
  { match: 'Flamengo vs Palmeiras', league: 'Brasileirão', odd: '3.20', ev: '+11.8%', ev_color: '#C8FC00', book: 'Stake', selection: 'Vitória Flam.' },
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
      {/* Animated dotted grid background — Three.js, lime palette */}
      <DottedSurface />
      {/* Lime radial glow at top-center to blend dots with content */}
      <div style={{
        pointerEvents: 'none',
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 70% 45% at 50% 0%, oklch(80% 0.3 115 / 0.10) 0%, transparent 70%)',
        zIndex: 0,
      }} />
      <div className="field-bg" />

      <div className="hero-v2-inner">
        {/* Badge pill */}
        <div className="hero-v2-badge">
          <span className="hero-v2-badge-dot" />
          Atualizado em tempo real · 10+ casas de apostas
        </div>

        {/* Headline */}
        <h1 className="hero-v2-h1">
          Descubra onde está<br />
          o <span className="hero-v2-hl">melhor valor</span><br />
          <span className="hero-v2-stroke">antes de apostar.</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-v2-sub">
          O OddSeek compara odds em 10+ casas e mostra exatamente onde seu dinheiro rende mais
          — sem precisar entender de matemática.
        </p>

        {/* Email capture */}
        <form action={`/${locale}/registro`} method="GET" className="hero-v2-form">
          <input
            name="email"
            type="email"
            placeholder="seu@email.com"
            className="hero-v2-input"
            autoComplete="email"
          />
          <button type="submit" className="hero-v2-btn">
            Começar grátis
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
            <span className="hero-v2-social-num">+12.000</span> apostadores já usam o OddSeek
          </div>
        </div>

        {/* App screenshot mockup */}
        <div className="hero-v2-screen-wrap">
          <div className="hero-v2-screen">
            {/* Browser chrome */}
            <div className="hero-v2-chrome">
              <div className="hero-v2-dots">
                <span style={{ background: '#FF5F57' }} />
                <span style={{ background: '#FEBC2E' }} />
                <span style={{ background: '#28C840' }} />
              </div>
              <div className="hero-v2-url">oddseek.com/tips</div>
            </div>

            {/* App nav */}
            <div className="hero-v2-appnav">
              {['Dashboard', 'Tips EV+', 'Comparador', 'Múltiplas', 'Banca'].map((item, i) => (
                <div
                  key={item}
                  className={`hero-v2-navitem${i === 1 ? ' active' : ''}`}
                >
                  {item}
                </div>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF0033', animation: 'pulse 1.2s ease-in-out infinite' }} />
                <span style={{ fontSize: 10, color: '#FF0033', fontWeight: 700 }}>14 ao vivo</span>
              </div>
            </div>

            {/* Table header */}
            <div className="hero-v2-thead">
              <div className="hero-v2-th">Partida</div>
              <div className="hero-v2-th">Aposta</div>
              <div className="hero-v2-th hero-v2-th-right">Odd</div>
              <div className="hero-v2-th hero-v2-th-right">EV</div>
              <div className="hero-v2-th hero-v2-th-right">Casa</div>
            </div>

            {/* Table rows */}
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

            {/* Blurred gradient at bottom (teaser effect) */}
            <div className="hero-v2-screen-blur" />
          </div>

          {/* Full-width fade at bottom */}
          <div className="hero-v2-screen-fade" />

          {/* Float cards */}
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
      </div>
    </section>
  );
}
