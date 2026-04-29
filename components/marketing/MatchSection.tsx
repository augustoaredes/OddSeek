import { getTranslations } from 'next-intl/server';

function Ring({ value, color }: { value: number; color: string }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="cring">
      <svg viewBox="0 0 40 40" width="40" height="40">
        <circle cx="20" cy="20" r={r} fill="none" stroke="var(--border)" strokeWidth="3.5" />
        <circle
          cx="20" cy="20" r={r} fill="none"
          stroke={color} strokeWidth="3.5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '20px 20px' }}
        />
      </svg>
      <div className="crv" style={{ color }}>{value}</div>
    </div>
  );
}

const matches = [
  { sport: 'Futebol', sportColor: '#4ade80', name: 'Real Madrid × Barcelona', meta: 'La Liga · 22h00', live: true, odd: '2.10', conf: 92, confColor: 'var(--lime)' },
  { sport: 'Futebol', sportColor: '#818cf8', name: 'Man City × Arsenal', meta: 'Premier League · 16h30', live: false, odd: '1.75', conf: 78, confColor: 'var(--amber)' },
  { sport: 'Futebol', sportColor: '#f87171', name: 'Flamengo × Palmeiras', meta: 'Brasileirão · 19h00', live: false, odd: '2.35', conf: 89, confColor: 'var(--lime)' },
  { sport: 'Basquete', sportColor: '#a78bfa', name: 'Lakers × Boston Celtics', meta: 'NBA · 02h30', live: false, odd: '1.90', conf: 85, confColor: 'var(--green)' },
  { sport: 'Tênis', sportColor: '#fcd34d', name: 'Djokovic × Alcaraz', meta: 'ATP Madrid · 15h00', live: false, odd: '3.75', conf: 61, confColor: 'var(--amber)' },
];

export async function MatchSection() {
  const t = await getTranslations('matches');

  return (
    <section className="section match-section" id="matches">
      <div className="si">
        <div className="match-grid">
          {/* Left: match list */}
          <div>
            <div className="stag">{t('tag')}</div>
            <h2 className="sh" style={{ marginBottom: 24, fontSize: 'clamp(36px, 4vw, 56px)' }}>
              {t('h')}<br /><em>{t('h_em')}</em>
            </h2>

            <div className="sport-tabs">
              {['all','football','basketball','tennis','mma'].map((k) => (
                <div key={k} className={`stab${k === 'all' ? ' on' : ''}`}>
                  {t(`tabs.${k}`)}
                </div>
              ))}
            </div>

            <div className="match-list">
              {matches.map((m) => (
                <div key={m.name} className="mr">
                  <div className="mr-sport" style={{ color: m.sportColor }}>{m.sport}</div>
                  <div>
                    <div className="mr-name">{m.name}</div>
                    <div className="mr-meta">
                      {m.meta}
                      {m.live && <span style={{ color: 'var(--red)', marginLeft: 8 }}>● Ao vivo</span>}
                    </div>
                  </div>
                  <div className="mr-odd" style={{ color: m.confColor === 'var(--amber)' ? 'var(--amber)' : m.confColor === 'var(--green)' ? 'var(--green)' : 'var(--lime)' }}>
                    {m.odd}
                  </div>
                  <Ring value={m.conf} color={m.confColor} />
                </div>
              ))}
            </div>
          </div>

          {/* Right: AI panel */}
          <div>
            <div className="stag">{t('ai_title')}</div>
            <h2 className="sh" style={{ marginBottom: 24, fontSize: 'clamp(32px, 3.5vw, 48px)' }}>
              Análise<br /><em>profunda</em>
            </h2>

            <div className="ai-panel">
              <div className="ai-ph">
                <div className="ai-pt">OddSeek IA · Analisando</div>
                <div className="ai-live">
                  <div className="tb-dot" style={{ background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
                  {t('ai_live')}
                </div>
              </div>

              <div className="ai-body">
                <div className="ai-mn">Flamengo × Palmeiras</div>
                <div className="ai-league">Brasileirão Série A · Rodada 8</div>
                <div className="ai-txt">
                  O <strong>Flamengo</strong> vence <strong>68%</strong> dos confrontos no Maracanã nos últimos 2 anos.
                  Palmeiras não venceu <strong>3 das últimas 4</strong> fora. Expected Value calculado:{' '}
                  <strong style={{ color: 'var(--lime)' }}>EV +11.4%</strong> na melhor odd disponível.
                </div>
                <div className="prow">
                  <div className="plabel" style={{ color: 'var(--text)' }}>Flamengo</div>
                  <div className="ptrack"><div className="pfill" style={{ width: '68%', background: 'var(--lime)' }} /></div>
                  <div className="pval" style={{ color: 'var(--lime)' }}>68%</div>
                </div>
                <div className="prow">
                  <div className="plabel">Empate</div>
                  <div className="ptrack"><div className="pfill" style={{ width: '20%', background: 'var(--muted)' }} /></div>
                  <div className="pval" style={{ color: 'var(--muted)' }}>20%</div>
                </div>
                <div className="prow">
                  <div className="plabel">Palmeiras</div>
                  <div className="ptrack"><div className="pfill" style={{ width: '12%', background: 'var(--dim)' }} /></div>
                  <div className="pval" style={{ color: 'var(--dim)' }}>12%</div>
                </div>
              </div>

              <div className="ai-foot">
                <div>
                  <div className="ai-conf">89</div>
                  <div className="ai-cl">{t('confidence')}</div>
                </div>
                <div className="ai-best">
                  <div className="ai-bv">2.35</div>
                  <div className="ai-bl">{t('best_odd')} · Bet365</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
