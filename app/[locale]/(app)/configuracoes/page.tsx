import { getLocale } from 'next-intl/server';
import Link from 'next/link';

export default async function ConfiguracoesPage() {
  const locale = await getLocale();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--text)', margin: 0 }}>
          Configurações
        </h1>
      </div>

      {/* Section: Conta */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Conta</div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {[
            { label: 'Nome',        value: 'Demo User',              action: 'Editar' },
            { label: 'E-mail',      value: 'demo@oddseek.app',       action: 'Alterar' },
            { label: 'Senha',       value: '••••••••',               action: 'Alterar' },
            { label: 'Handle',      value: '@demo',                  action: 'Editar' },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>{row.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>{row.value}</div>
              </div>
              <button type="button" style={{ fontSize: 11, fontWeight: 700, color: 'var(--lime)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>{row.action}</button>
            </div>
          ))}
        </div>
      </section>

      {/* Section: Banca */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Banca</div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {[
            { label: 'Perfil de Risco', value: 'Moderado',          note: 'Stake cap: 3% por aposta' },
            { label: 'Unidade',         value: 'Reais (R$)',        note: 'Moeda da banca' },
            { label: 'Banca Inicial',   value: 'R$ 2.000,00',      note: 'Referência para ROI' },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{row.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>{row.value}</div>
                <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 1 }}>{row.note}</div>
              </div>
              <button type="button" style={{ fontSize: 11, fontWeight: 700, color: 'var(--lime)', background: 'none', border: 'none', cursor: 'pointer' }}>Editar</button>
            </div>
          ))}
        </div>
      </section>

      {/* Section: Notificações */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Notificações</div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {[
            { label: 'Alertas de banca',     enabled: true },
            { label: 'Novas tips EV+',        enabled: true },
            { label: 'Odds favoráveis',       enabled: false },
            { label: 'Newsletter semanal',    enabled: false },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{row.label}</div>
              <div style={{ width: 36, height: 20, borderRadius: 10, background: row.enabled ? 'var(--lime)' : 'var(--dim)', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: row.enabled ? 18 : 4, transition: 'left 0.2s' }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section: Privacidade / LGPD */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Privacidade</div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Exportar meus dados</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Receba um arquivo com todos seus dados (LGPD Art. 18)</div>
            </div>
            <button type="button" style={{ fontSize: 11, fontWeight: 700, color: 'var(--lime)', background: 'none', border: 'none', cursor: 'pointer' }}>Solicitar</button>
          </div>
          <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Perfil público</div>
              <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>Visível no ranking e comunidade</div>
            </div>
            <div style={{ width: 36, height: 20, borderRadius: 10, background: 'var(--lime)', position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: 18 }} />
            </div>
          </div>
        </div>
      </section>

      {/* Danger zone: exclusão LGPD */}
      <section>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 12 }}>Zona de Risco</div>
        <div style={{ background: 'oklch(50% 0.2 25 / 0.08)', border: '1px solid oklch(50% 0.2 25 / 0.3)', borderRadius: 12, padding: '20px 20px' }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Excluir conta</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
              Seus dados pessoais serão anonimizados. O histórico de apostas é mantido de forma anônima para preservar integridade contábil (obrigação legal). Esta ação é irreversível.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              style={{ padding: '9px 20px', borderRadius: 8, background: 'oklch(50% 0.2 25 / 0.2)', border: '1px solid oklch(50% 0.2 25 / 0.5)', color: 'var(--red)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Excluir minha conta
            </button>
            <Link href={`/${locale}/privacidade`} style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>
              Ler política de privacidade →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
