import { getTranslations } from 'next-intl/server';

export async function BankrollSection() {
  const t = await getTranslations('bankroll');

  return (
    <section className="section bank-section" id="banca">
      <div className="si">
        <div className="bank-grid">
          <div>
            <div className="stag">{t('tag')}</div>
            <h2 className="sh">
              {t('h')}<br /><em>{t('h_em')}</em>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.72, marginTop: 20 }}>
              {t('sub')}
            </p>
          </div>

          <div className="bank-card">
            <div className="bank-head">
              <div className="bank-title">{t('balance')}</div>
              <div style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--font-cond)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                +18.4% este mês
              </div>
            </div>

            <div className="bank-body">
              <div className="bank-total" style={{ color: 'var(--lime)' }}>R$ 4.847</div>
              <div className="bank-sub">Banca atual · iniciou em R$ 4.000</div>
              <div className="bank-bar">
                <div className="bank-bar-fill" style={{ width: '73%' }} />
              </div>

              <div className="bank-stats">
                <div>
                  <div className="bstat-val" style={{ color: 'var(--green)' }}>73%</div>
                  <div className="bstat-label">{t('hit_rate')}</div>
                </div>
                <div>
                  <div className="bstat-val">+847</div>
                  <div className="bstat-label">{t('profit')} (R$)</div>
                </div>
                <div>
                  <div className="bstat-val" style={{ color: 'var(--amber)' }}>2.1u</div>
                  <div className="bstat-label">Unidade Kelly</div>
                </div>
              </div>

              <div className="bank-hist">
                <div className="bh-label">{t('recent')}</div>
                {[
                  { label: 'Sem 1', pct: 60, val: '+R$180', color: 'var(--lime)' },
                  { label: 'Sem 2', pct: 30, val: '-R$90', color: 'var(--red)' },
                  { label: 'Sem 3', pct: 80, val: '+R$240', color: 'var(--lime)' },
                  { label: 'Sem 4', pct: 75, val: '+R$220', color: 'var(--lime)' },
                ].map((row) => (
                  <div key={row.label} className="bh-item">
                    <div className="bh-date">{row.label}</div>
                    <div className="bh-track">
                      <div className="bh-fill" style={{ width: `${row.pct}%`, background: row.color }} />
                    </div>
                    <div className="bh-val" style={{ color: row.color }}>{row.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
