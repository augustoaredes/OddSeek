import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { OddSeekMark } from '@/components/brand/OddSeekMark';

interface Props { locale: string }

export async function Hero({ locale }: Props) {
  const t = await getTranslations('hero');

  return (
    <section className="hero">
      <div className="field-bg" />

      <div className="hero-inner">
        {/* Left column */}
        <div className="hero-left">
          <div className="hero-kicker">
            <div className="tb-dot" />
            {t('kicker')}
          </div>

          <div className="hero-h1">
            {t('h1_1')}<br />
            <span className="hero-hl">{t('h1_2')}</span>
            <span className="hero-stroke">{t('h1_3')}</span>
          </div>

          <p className="hero-sub">{t('sub')}</p>

          <div className="hero-actions">
            <Link href={`/${locale}/registro`} className="btn-hero btn-hero-lime">
              {t('cta_primary')}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href={`/${locale}#matches`} className="btn-hero btn-hero-ghost">
              {t('cta_secondary')}
            </Link>
          </div>

          <div className="hero-pills">
            <div className="hero-pill">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="var(--lime)" strokeWidth="1.2" />
                <circle cx="6" cy="6" r="1.5" fill="var(--lime)" />
              </svg>
              {t('pill_ev')}
            </div>
            <div className="hero-pill">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 9l2-3 2 2 2-4 2 2" stroke="var(--lime)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t('pill_books')}
            </div>
            <div className="hero-pill">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4 6a2 2 0 104 0 2 2 0 00-4 0z" stroke="var(--lime)" strokeWidth="1.2" />
                <path d="M1 10c0-2.2 2.2-4 5-4s5 1.8 5 4" stroke="var(--lime)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {t('pill_live')}
            </div>
          </div>
        </div>

        {/* Right — Broadcast Card */}
        <div className="bc-wrap" style={{ position: 'relative' }}>
          <div className="bc-card">
            <div className="bc-top">
              <div className="bc-league-tag">Champions League · Semifinal</div>
              <div className="bc-live-tag">
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />
                AO VIVO
              </div>
            </div>

            <div className="bc-match">
              <div className="bc-team">
                <div className="bc-badge">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="8.5" stroke="var(--muted)" strokeWidth="1.3" />
                    <path d="M4 8h14M4 14h14M11 2.5v17" stroke="var(--muted)" strokeWidth=".9" />
                  </svg>
                </div>
                <div className="bc-tname">Real Madrid</div>
                <div className="bc-trec">1° La Liga</div>
              </div>

              <div className="bc-vs">
                <div className="bc-score">1 — 0</div>
                <div className="bc-min">67&apos;</div>
              </div>

              <div className="bc-team">
                <div className="bc-badge">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="3" y="3" width="16" height="16" rx="2" stroke="var(--muted)" strokeWidth="1.3" />
                    <path d="M3 11h16M11 3v16" stroke="var(--muted)" strokeWidth=".9" />
                  </svg>
                </div>
                <div className="bc-tname">Man City</div>
                <div className="bc-trec">2° Premier</div>
              </div>
            </div>

            <div className="bc-body">
              <div className="bc-ev-row">
                <div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
                    Aposta recomendada
                  </div>
                  <div className="bc-tip">Vitória Real Madrid</div>
                </div>
                <div className="bc-ev-num">
                  <div className="bc-ev-val">92</div>
                  <div className="bc-ev-label">confiança IA</div>
                </div>
              </div>

              <div className="bc-odds">
                <div className="bc-odd">
                  <div className="bc-oh">Betano</div>
                  <div className="bc-ov" style={{ color: 'var(--muted)' }}>1.95</div>
                </div>
                <div className="bc-odd best">
                  <div className="bc-oh">Bet365 ★</div>
                  <div className="bc-ov">2.10</div>
                  <div className="bc-oe">EV +8.2%</div>
                </div>
                <div className="bc-odd">
                  <div className="bc-oh">KTO</div>
                  <div className="bc-ov" style={{ color: 'var(--muted)' }}>1.88</div>
                </div>
              </div>
            </div>
          </div>

          {/* Float card */}
          <div className="float-card">
            <div className="fi">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 1.5l1.8 4h4L10 8l1.5 4.5L7.5 10l-4 2.5L5 8 1.7 5.5h4z" stroke="var(--amber)" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="fv">Odd subindo</div>
              <div className="fs">Juventus Over 2.5 → 2.05</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
