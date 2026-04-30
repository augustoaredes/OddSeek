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

export function SocialProof() {
  return (
    <section className="section" id="depoimentos">
      <div className="si">
        <div className="stag">Resultados verificados</div>
        <h2 className="sh">
          Apostadores reais,<br />
          <em>lucros reais.</em>
        </h2>
        <p className="sp">
          Histórico de apostas rastreado e verificado dentro do OddSeek.
          Sem screenshots editados, sem promessas falsas.
        </p>

        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <div key={t.name} className="testimonial-card">
              {/* Stars */}
              <div className="t-stars">
                {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
              </div>

              {/* Quote */}
              <p className="t-quote">{t.text}</p>

              {/* Profit badge */}
              <div className="t-profit-badge">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 10l3-4.5 2 2 3-5 2 3" stroke="var(--lime)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ color: 'var(--lime)', fontWeight: 800, fontFamily: 'var(--font-cond)' }}>{t.profit}</span>
                <span style={{ color: 'var(--muted)', fontSize: 11 }}>nos últimos {t.period}</span>
              </div>

              {/* Author */}
              <div className="t-author">
                <div className="t-avatar" style={{ background: t.avatarBg, color: t.avatarText }}>
                  {t.avatar}
                </div>
                <div>
                  <div className="t-name">{t.name}</div>
                  <div className="t-role">{t.handle} · {t.sport}</div>
                </div>
                <div className="t-verified">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="6.5" r="5.5" fill="var(--lime)" />
                    <path d="M3.5 6.5l2 2 4-4" stroke="#000" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Verificado</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="sp-stats-row">
          {[
            { num: '+R$2.1M', label: 'lucro rastreado na plataforma', color: 'var(--lime)' },
            { num: '61%', label: 'hit rate médio usuários Pro', color: 'var(--green)' },
            { num: '+18%', label: 'ROI médio em 90 dias', color: 'var(--amber)' },
            { num: '12k+', label: 'apostadores ativos', color: 'var(--blue)' },
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
