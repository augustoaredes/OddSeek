import { getTranslations } from 'next-intl/server';

const testimonials = [
  {
    name: 'Mateus A.',
    handle: '@mateus_bets',
    avatar: 'MA',
    avatarBg: '#C8FC00',
    avatarText: '#000',
    role: 'Apostador profissional',
    text: 'Finalmente uma plataforma brasileira que realmente encontra apostas com vantagem real. Em 3 meses de uso o meu ROI saiu de -4% para +21%. O valor sugerido por jogo mudou minha disciplina completamente.',
    profit: '+R$4.820',
    period: '3 meses',
    sport: 'Futebol',
  },
  {
    name: 'Julia F.',
    handle: '@juliabets',
    avatar: 'JF',
    avatarBg: '#00DC6E',
    avatarText: '#000',
    role: 'Trader esportivo',
    text: 'O comparador de odds me economiza horas por dia. Antes abria 6 abas manualmente. Agora vejo tudo em uma tela e ainda recebo alerta quando a odd sobe. Produto incrível.',
    profit: '+R$2.340',
    period: '2 meses',
    sport: 'Basquete',
  },
  {
    name: 'Rafael L.',
    handle: '@rl_sharp',
    avatar: 'RL',
    avatarBg: '#4898FF',
    avatarText: '#fff',
    role: 'Apostador recreativo',
    text: 'Comecei sem entender nada de apostas esportivas. O OddSeek me ensinou apostando. O índice de confiança ajuda demais a filtrar apostas ruins. Meu aproveitamento subiu para 62%.',
    profit: '+R$1.890',
    period: '6 semanas',
    sport: 'MMA',
  },
];

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="var(--lime)">
    <path d="M6 1l1.3 3.8H11L8.2 6.9l1.1 3.6L6 8.6l-3.3 1.9 1.1-3.6L1 4.8h3.7z" />
  </svg>
);

export async function SocialProof() {
  const t = await getTranslations('social_proof');

  return (
    <section className="section" id="depoimentos">
      <div className="si">
        <div className="stag">{t('tag')}</div>
        <h2 className="sh">
          {t('h')}<br />
          <em>{t('h_em')}</em>
        </h2>
        <p className="sp">{t('sub')}</p>

        <div className="testimonials-grid">
          {testimonials.map((tm) => (
            <div key={tm.name} className="testimonial-card">
              <div className="t-stars">
                {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
              </div>
              <p className="t-quote">{tm.text}</p>
              <div className="t-profit-badge">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 10l3-4.5 2 2 3-5 2 3" stroke="var(--lime)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ color: 'var(--lime)', fontWeight: 800, fontFamily: 'var(--font-cond)' }}>{tm.profit}</span>
                <span style={{ color: 'var(--muted)', fontSize: 11 }}>{t('last')} {tm.period}</span>
              </div>
              <div className="t-author">
                <div className="t-avatar" style={{ background: tm.avatarBg, color: tm.avatarText }}>
                  {tm.avatar}
                </div>
                <div>
                  <div className="t-name">{tm.name}</div>
                  <div className="t-role">{tm.handle} · {tm.sport}</div>
                </div>
                <div className="t-verified">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="6.5" r="5.5" fill="var(--lime)" />
                    <path d="M3.5 6.5l2 2 4-4" stroke="#000" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{t('verified')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sp-stats-row">
          {[
            { num: t('stat1_num'), label: t('stat1_lbl'), color: 'var(--lime)' },
            { num: t('stat2_num'), label: t('stat2_lbl'), color: 'var(--green)' },
            { num: t('stat3_num'), label: t('stat3_lbl'), color: 'var(--amber)' },
            { num: t('stat4_num'), label: t('stat4_lbl'), color: 'var(--blue)' },
          ].map((s) => (
            <div key={s.label} className="sp-stat">
              <div className="sp-stat-num" style={{ color: s.color }}>{s.num}</div>
              <div className="sp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
