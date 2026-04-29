import { getTranslations } from 'next-intl/server';

export async function FeaturesGrid() {
  const t = await getTranslations('features');

  const features = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7.5" stroke="var(--muted)" strokeWidth="1.3" />
          <circle cx="10" cy="10" r="3.5" stroke="var(--muted)" strokeWidth="1.3" />
          <circle cx="10" cy="10" r="1.3" fill="var(--lime)" />
        </svg>
      ),
      h: t('ev_h'), p: t('ev_p'), tag: t('ev_tag'),
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 10h12M6 6l-4 4 4 4M14 6l4 4-4 4" stroke="var(--muted)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      h: t('compare_h'), p: t('compare_p'), tag: t('compare_tag'),
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 15l4-6 3 3 4-7 3 4" stroke="var(--muted)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="7" cy="9" r="1.4" fill="var(--lime)" />
          <circle cx="10" cy="12" r="1.4" fill="var(--lime)" />
          <circle cx="14" cy="5" r="1.4" fill="var(--lime)" />
        </svg>
      ),
      h: t('tips_h'), p: t('tips_p'), tag: t('tips_tag'),
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="5" width="14" height="12" rx="2" stroke="var(--muted)" strokeWidth="1.3" />
          <path d="M3 9h14" stroke="var(--muted)" strokeWidth="1.3" />
          <path d="M7 5V3M13 5V3" stroke="var(--muted)" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M6.5 13l1.5-2 1.5 1.5L12 10l1.5 2.5" stroke="var(--lime)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      h: t('parlay_h'), p: t('parlay_p'), tag: t('parlay_tag'),
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 16V8l6-5 6 5v8" stroke="var(--muted)" strokeWidth="1.3" strokeLinejoin="round" />
          <rect x="7" y="11" width="6" height="5" rx="1" stroke="var(--lime)" strokeWidth="1.2" />
        </svg>
      ),
      h: t('bankroll_h'), p: t('bankroll_p'), tag: t('bankroll_tag'),
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 3a4 4 0 100 8 4 4 0 000-8z" stroke="var(--muted)" strokeWidth="1.3" />
          <path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="var(--muted)" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M14 10.5l1.5 1.5-1.5 1.5" stroke="var(--lime)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
      h: t('community_h'), p: t('community_p'), tag: t('community_tag'),
    },
  ];

  return (
    <section className="section" id="features">
      <div className="si">
        <div className="stag">{t('tag')}</div>
        <h2 className="sh">
          {t('h')}<br />
          <em>{t('h_em')}</em>
        </h2>
        <p className="sp">{t('sub')}</p>
        <div className="feats">
          {features.map((f) => (
            <div key={f.h} className="feat">
              <div className="feat-icon">{f.icon}</div>
              <div className="feat-h">{f.h}</div>
              <div className="feat-p">{f.p}</div>
              {f.tag && <div className="feat-tag">{f.tag}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
