import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { SpiralAnimation } from '@/components/ui/spiral-animation';
import { LiveScoreWidget } from './LiveScoreWidget';
import { EVDetectorCards } from './EVDetectorCards';

interface Props { locale: string }

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

      {/* ── 2-COLUMN GRID: text left · EV cards right ── */}
      <div className="hero-v2-inner" style={{ position: 'relative', zIndex: 10 }}>

        {/* LEFT COLUMN */}
        <div className="hero-v2-left">
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

          {/* Live score pill — demonstração de dados ao vivo */}
          <div style={{ marginBottom: 24 }}>
            <LiveScoreWidget />
          </div>

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
        </div>

        {/* RIGHT COLUMN — EV Detector Cards */}
        <EVDetectorCards />

      </div>

    </section>
  );
}
