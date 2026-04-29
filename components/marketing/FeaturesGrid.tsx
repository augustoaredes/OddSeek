import { getTranslations } from 'next-intl/server';

const EVMockup = () => (
  <div className="feat-mockup">
    {/* Header */}
    <div className="fm-header">
      <div className="fm-title">Tips EV+</div>
      <div className="fm-badge">23 oportunidades</div>
    </div>
    {/* Filter pills */}
    <div className="fm-filters">
      {['Todos', 'Futebol', 'Basquete', 'Tênis'].map((f, i) => (
        <div key={f} className={`fm-filter${i === 0 ? ' active' : ''}`}>{f}</div>
      ))}
    </div>
    {/* Rows */}
    {[
      { match: 'Real Madrid vs PSG', market: 'Resultado', odd: '2.10', ev: '+8.2%', conf: 92 },
      { match: 'Man City vs Arsenal', market: 'Ambas Marcam', odd: '1.85', ev: '+5.7%', conf: 78 },
      { match: 'Bayern vs Dortmund', market: 'Over 2.5', odd: '1.95', ev: '+4.1%', conf: 71 },
    ].map((row, i) => (
      <div key={i} className="fm-row">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="fm-match">{row.match}</div>
          <div className="fm-market">{row.market}</div>
        </div>
        <div className="fm-odd">{row.odd}</div>
        <div className="fm-ev">{row.ev}</div>
        <div className="fm-conf-wrap">
          <div className="fm-conf-bar">
            <div className="fm-conf-fill" style={{ width: `${row.conf}%` }} />
          </div>
          <span className="fm-conf-val">{row.conf}</span>
        </div>
      </div>
    ))}
  </div>
);

const OddsMockup = () => (
  <div className="feat-mockup">
    <div className="fm-header">
      <div className="fm-title">Comparador de Odds</div>
      <div className="fm-badge" style={{ background: 'oklch(65% 0.2 150 / 0.12)', color: 'var(--green)', borderColor: 'oklch(65% 0.2 150 / 0.25)' }}>Ao vivo</div>
    </div>
    <div className="fm-event">Real Madrid vs PSG · UCL Semifinal</div>
    {[
      { book: 'Bet365', odd: '2.10', fill: 100, best: true },
      { book: 'Betano', odd: '1.95', fill: 93, best: false },
      { book: 'KTO', odd: '1.92', fill: 91, best: false },
      { book: 'Stake', odd: '1.88', fill: 90, best: false },
      { book: '1xBet', odd: '1.85', fill: 88, best: false },
    ].map((row, i) => (
      <div key={i} className="fm-odds-row">
        <div className="fm-book">{row.book}</div>
        <div className="fm-bar-track">
          <div className={`fm-bar-fill${row.best ? ' best' : ''}`} style={{ width: `${row.fill}%` }} />
        </div>
        <div className="fm-val" style={{ color: row.best ? 'var(--lime)' : 'var(--text)' }}>{row.odd}</div>
        {row.best && <div className="fm-best-tag">★ Melhor</div>}
      </div>
    ))}
    <div className="fm-ev-row">
      <span>EV esperado na melhor casa:</span>
      <span style={{ color: 'var(--lime)', fontWeight: 800 }}>+8.2%</span>
    </div>
  </div>
);

const BancaMockup = () => (
  <div className="feat-mockup">
    <div className="fm-header">
      <div className="fm-title">Gestão de Banca</div>
      <div className="fm-badge" style={{ background: 'oklch(75% 0.16 75 / 0.12)', color: 'var(--amber)', borderColor: 'oklch(75% 0.16 75 / 0.25)' }}>Kelly 1/2</div>
    </div>
    <div className="fm-banca-kpis">
      {[
        { label: 'Saldo', value: 'R$3.240', color: 'var(--lime)' },
        { label: 'ROI', value: '+18.4%', color: 'var(--green)' },
        { label: 'Hit Rate', value: '61%', color: 'var(--text)' },
      ].map(k => (
        <div key={k.label} className="fm-kpi">
          <div className="fm-kpi-val" style={{ color: k.color }}>{k.value}</div>
          <div className="fm-kpi-label">{k.label}</div>
        </div>
      ))}
    </div>
    <div className="fm-chart">
      <svg width="100%" height="64" viewBox="0 0 260 64" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--lime)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--lime)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 50 L30 45 L60 42 L90 38 L110 35 L130 30 L160 22 L190 18 L220 12 L260 8" stroke="var(--lime)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M0 50 L30 45 L60 42 L90 38 L110 35 L130 30 L160 22 L190 18 L220 12 L260 8 L260 64 L0 64 Z" fill="url(#chartGrad)" />
      </svg>
    </div>
    <div className="fm-banca-alert">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5" stroke="var(--lime)" strokeWidth="1.2" />
        <path d="M6 4v3M6 8.5v.3" stroke="var(--lime)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      Stake sugerido: 2.1u — Perfil moderado
    </div>
  </div>
);

export async function FeaturesGrid() {
  const t = await getTranslations('features');

  const smallFeatures = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="2" y="2" width="14" height="14" rx="3" stroke="var(--lime)" strokeWidth="1.3" />
          <path d="M5 9h8M9 5v8" stroke="var(--lime)" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
      h: 'Parlay Inteligente',
      p: 'Crie múltiplas com pernas de EV+ identificadas automaticamente. Calculamos probabilidade combinada real.',
      tag: 'NOVO',
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M3 9a6 6 0 1012 0A6 6 0 003 9z" stroke="var(--lime)" strokeWidth="1.3" />
          <path d="M9 4v5l3 2" stroke="var(--lime)" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
      h: 'Alertas em tempo real',
      p: 'Receba notificação quando uma odd subir acima do EV de corte que você configurou.',
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 2l1.7 4.7H15L11.2 9.6l1.6 4.9L9 11.8l-3.8 2.7 1.6-4.9L3 6.7h4.3z" stroke="var(--lime)" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      ),
      h: 'Ranking da comunidade',
      p: 'Compare seu desempenho com outros apostadores. Histórico verificado e transparente.',
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M3 15V7l6-4 6 4v8" stroke="var(--lime)" strokeWidth="1.3" strokeLinejoin="round" />
          <rect x="6.5" y="10" width="5" height="5" rx="1" stroke="var(--lime)" strokeWidth="1.2" />
        </svg>
      ),
      h: 'Afiliados integrados',
      p: 'Direto para a melhor casa com seu link de afiliado. Rastreamos cada clique para relatórios precisos.',
    },
  ];

  return (
    <section className="section" id="features">
      <div className="si">
        <div className="stag">{t('tag')}</div>
        <h2 className="sh">
          Tudo que você precisa<br />
          <em>para apostar melhor</em>
        </h2>
        <p className="sp">
          Ferramentas profissionais de análise de valor esperado, antes disponíveis
          apenas para sindicatos e traders quantitativos.
        </p>

        {/* Big feature cards */}
        <div className="feat-big-grid">
          {/* EV+ Card */}
          <div className="feat-big-card">
            <div className="feat-big-body">
              <div className="feat-big-tag">Identificação de valor</div>
              <h3 className="feat-big-h">Tips com EV+<br />em tempo real</h3>
              <p className="feat-big-p">
                Nosso motor compara a probabilidade real (devigorizada) com a
                odd disponível nas casas. Só mostramos apostas onde há edge real.
              </p>
              <div className="feat-big-pills">
                <div className="feat-big-pill">Kelly Half</div>
                <div className="feat-big-pill">Score de confiança</div>
                <div className="feat-big-pill">Edge calculado</div>
              </div>
            </div>
            <div className="feat-big-mockup-wrap">
              <EVMockup />
            </div>
          </div>

          {/* Odds Comparison Card */}
          <div className="feat-big-card feat-big-card-alt">
            <div className="feat-big-body">
              <div className="feat-big-tag" style={{ color: 'var(--green)', borderColor: 'oklch(65% 0.2 150 / 0.25)', background: 'oklch(65% 0.2 150 / 0.08)' }}>
                Comparação de odds
              </div>
              <h3 className="feat-big-h">Melhor odd em<br />10+ casas</h3>
              <p className="feat-big-p">
                Comparamos Bet365, Betano, KTO, Stake, 1xBet e mais.
                Destacamos automaticamente a casa com maior valor esperado.
              </p>
              <div className="feat-big-pills">
                <div className="feat-big-pill" style={{ color: 'var(--green)', background: 'oklch(65% 0.2 150 / 0.08)', borderColor: 'oklch(65% 0.2 150 / 0.2)' }}>10+ casas</div>
                <div className="feat-big-pill" style={{ color: 'var(--green)', background: 'oklch(65% 0.2 150 / 0.08)', borderColor: 'oklch(65% 0.2 150 / 0.2)' }}>Ao vivo</div>
                <div className="feat-big-pill" style={{ color: 'var(--green)', background: 'oklch(65% 0.2 150 / 0.08)', borderColor: 'oklch(65% 0.2 150 / 0.2)' }}>Histórico de odds</div>
              </div>
            </div>
            <div className="feat-big-mockup-wrap">
              <OddsMockup />
            </div>
          </div>

          {/* Bankroll Card - full width */}
          <div className="feat-big-card feat-big-card-wide">
            <div className="feat-big-body">
              <div className="feat-big-tag" style={{ color: 'var(--amber)', borderColor: 'oklch(75% 0.16 75 / 0.3)', background: 'oklch(75% 0.16 75 / 0.08)' }}>
                Gestão de banca
              </div>
              <h3 className="feat-big-h">Banca profissional<br />com Kelly automático</h3>
              <p className="feat-big-p">
                Calcule o stake ideal para cada aposta baseado no seu bankroll atual,
                perfil de risco e EV identificado. Alertas quando o drawdown é alto.
              </p>
              <div className="feat-big-pills">
                <div className="feat-big-pill" style={{ color: 'var(--amber)', background: 'oklch(75% 0.16 75 / 0.08)', borderColor: 'oklch(75% 0.16 75 / 0.25)' }}>Kelly 1/2</div>
                <div className="feat-big-pill" style={{ color: 'var(--amber)', background: 'oklch(75% 0.16 75 / 0.08)', borderColor: 'oklch(75% 0.16 75 / 0.25)' }}>ROI tracking</div>
                <div className="feat-big-pill" style={{ color: 'var(--amber)', background: 'oklch(75% 0.16 75 / 0.08)', borderColor: 'oklch(75% 0.16 75 / 0.25)' }}>Alertas de drawdown</div>
              </div>
            </div>
            <div className="feat-big-mockup-wrap">
              <BancaMockup />
            </div>
          </div>
        </div>

        {/* Small feature cards */}
        <div className="feats feats-v2" style={{ marginTop: 16 }}>
          {smallFeatures.map((f) => (
            <div key={f.h} className="feat feat-v2">
              <div className="feat-icon-v2">{f.icon}</div>
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
